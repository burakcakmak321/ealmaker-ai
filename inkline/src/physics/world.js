/* Dunya: adim sirasi, temas kalicilığı, adalar, uyku ve NaN korumasi.
   Iterasyon sirasi her yerde dizi sirasidir — Map yalnizca arama icin. */
(function (INK) {
'use strict';

var V2 = INK.V2;
var cfg = INK.config;
var sv = cfg.solver;
var KEY_SHIFT = 4096;      // shape gid carpani; anahtar Smi araliginda kalir

function overlapExpanded(a, b, e) {
  return !(b.minX - e > a.maxX || b.maxX + e < a.minX ||
           b.minY - e > a.maxY || b.maxY + e < a.minY);
}

function World(opts) {
  opts = opts || {};
  this.gravity = V2.create(0, opts.gravity !== undefined ? opts.gravity : cfg.world.gravity);
  this.bodies = [];
  this.broadphase = new INK.Broadphase();
  /* Bu diziler yeniden kullanilir: length'e dokunmuyoruz, sayac tutuyoruz.
     "length = 0 + push" V8'de her adimda backing store yeniden ayirtiyor. */
  this.manifolds = [];         // bu adimda temas eden manifoldlar (sirali)
  this.manifoldCount = 0;
  this.solveList = [];         // en az bir tarafi uyanik olanlar
  this.solveCount = 0;
  this.allManifolds = [];      // yasayan tum manifoldlar; bayatlayan temizlenir
  this.manifoldMap = new INK.IntMap(512); // yalnizca arama; iterasyon yok
  this.manifoldPool = new INK.Pool(function () { return new INK.Manifold(); },
                                   function (m) { m.reset(); }, 64);
  this.stepCount = 0;
  this.time = 0;
  this.dev = !!opts.dev;
  this.nanEvents = 0;
  this.onBeginContact = null;   // (manifold) => void
  this.onEndContact = null;
  this._islandParent = [];
  this._islandFlags = [];
  this._scratchIds = [0, 0, 0, 0];
  this._scratchImp = [0, 0, 0, 0];
}

/* ---------- govde yonetimi ---------- */

World.prototype.addBody = function (body) {
  if (this.bodies.length >= cfg.limits.maxBodies) {
    throw new Error('body tavani asildi (' + cfg.limits.maxBodies + ')');
  }
  body.world = this;
  if (body.type === INK.BODY_KINEMATIC) body.allowSleep = false;
  this.bodies.push(body);
  return body;
};

World.prototype.removeBody = function (body) {
  var i = this.bodies.indexOf(body);
  if (i < 0) return;
  this.bodies.splice(i, 1);
  this._dropManifoldsFor(body);
  body.destroy();
};

World.prototype._dropManifoldsFor = function (body) {
  var keys = [];
  this.manifoldMap.forEach(function (m, key) {
    if (m.bodyA === body || m.bodyB === body) keys.push(key);
  });
  for (var i = 0; i < keys.length; i++) {
    var m = this.manifoldMap.get(keys[i]);
    this.manifoldMap.delete(keys[i]);
    var at = this.allManifolds.indexOf(m);
    if (at >= 0) this.allManifolds.splice(at, 1);
    this.manifoldPool.release(m);
  }
};

/* Bolum gecisinde her sey birakilir — sizinti birakmamak icin tek yer burasi. */
World.prototype.clear = function () {
  var self = this;
  this.manifoldMap.forEach(function (m) { self.manifoldPool.release(m); });
  this.manifoldMap.clear();
  this.allManifolds.length = 0;
  this.manifoldCount = 0;
  this.solveCount = 0;
  for (var i = 0; i < this.bodies.length; i++) this.bodies[i].destroy();
  this.bodies.length = 0;
  this.stepCount = 0;
  this.time = 0;
  this.nanEvents = 0;
};

/* ---------- adim ---------- */

World.prototype.step = function (dt) {
  var i, b;
  this.stepCount++;
  this.time += dt;
  var invDt = dt > 0 ? 1 / dt : 0;
  var bodies = this.bodies;

  /* 1. render interpolasyonu icin onceki state */
  for (i = 0; i < bodies.length; i++) {
    b = bodies[i];
    b.prevPos.x = b.pos.x; b.prevPos.y = b.pos.y;
    b.prevAngle = b.angle;
    b.contactImpulse = 0;
  }

  /* 2. kuvvetleri entegre et */
  this._integrateVelocities(dt);

  /* 3. AABB'ler (hiz yonunde genisletilmis) */
  for (i = 0; i < bodies.length; i++) {
    b = bodies[i];
    if (b.type === INK.BODY_STATIC) { if (this.stepCount === 1) b.updateAABB(0); }
    else b.updateAABB(dt);
  }

  /* 4-5. broadphase + narrowphase */
  this.broadphase.update(bodies, bodies.length);
  this.broadphase.pairs(bodies);
  this._narrowphase(dt);

  /* 6. cozucu */
  INK.solver.prepare(this.solveList, this.solveCount, dt, invDt);
  INK.solver.warmStart(this.solveList, this.solveCount);
  for (i = 0; i < sv.velocityIterations; i++) INK.solver.solveVelocity(this.solveList, this.solveCount);
  INK.solver.applyRestitution(this.solveList, this.solveCount);

  /* 7a. temas durumu: impuls uretildiyse ya da ic ice gecildiyse temas var */
  this._updateContactState();

  /* 7. yuvarlanma direnci — cember cisimler sonsuza kadar yuvarlanmasin */
  this._applyRollingResistance(dt);

  /* 8. konumlari entegre et */
  this._integratePositions(dt);

  /* 9. pozisyon duzeltmesi */
  for (i = 0; i < sv.positionIterations; i++) {
    var minSep = INK.solver.solvePosition(this.solveList, this.solveCount);
    if (minSep >= -3 * sv.penetrationSlop) break;   // yeterince duzeldi
  }

  /* 10. saglik + uyku */
  this._guard();
  this._updateSleep(dt);
};

World.prototype._integrateVelocities = function (dt) {
  var bodies = this.bodies;
  var maxV = cfg.limits.maxLinearVelocity, maxW = cfg.limits.maxAngularVelocity;
  for (var i = 0; i < bodies.length; i++) {
    var b = bodies[i];
    if (b.type !== INK.BODY_DYNAMIC || !b.awake) { b.force.x = 0; b.force.y = 0; b.torque = 0; continue; }
    b.vel.x += (this.gravity.x * b.gravityScale + b.force.x * b.invMass) * dt;
    b.vel.y += (this.gravity.y * b.gravityScale + b.force.y * b.invMass) * dt;
    b.angVel += b.torque * b.invInertia * dt;
    /* ustel sonumleme: dt'den bagimsiz, kararli */
    b.vel.x *= 1 / (1 + dt * b.linearDamping);
    b.vel.y *= 1 / (1 + dt * b.linearDamping);
    b.angVel *= 1 / (1 + dt * b.angularDamping);
    if (b.vel.x * b.vel.x + b.vel.y * b.vel.y > maxV * maxV) V2.clampLen(b.vel, b.vel, maxV);
    if (b.angVel > maxW) b.angVel = maxW; else if (b.angVel < -maxW) b.angVel = -maxW;
    b.force.x = 0; b.force.y = 0; b.torque = 0;
  }
};

World.prototype._integratePositions = function (dt) {
  var bodies = this.bodies;
  for (var i = 0; i < bodies.length; i++) {
    var b = bodies[i];
    if (b.type === INK.BODY_STATIC || !b.awake) continue;
    b.pos.x += b.vel.x * dt;
    b.pos.y += b.vel.y * dt;
    b.angle += b.angVel * dt;
    b.rot.setAngle(b.angle);
  }
};

World.prototype._applyRollingResistance = function (dt) {
  var bodies = this.bodies;
  for (var i = 0; i < bodies.length; i++) {
    var b = bodies[i];
    if (b.type !== INK.BODY_DYNAMIC || !b.awake || b.rollingResistance <= 0) continue;
    if (b.contactImpulse <= 0 || b.angVel === 0) continue;
    /* direnc normal impulsuyla orantili: agir temas = daha hizli durma */
    var maxTorqueImpulse = b.rollingResistance * b.contactImpulse * b.rollingRadius;
    var stopImpulse = Math.abs(b.angVel) * b.inertia;
    var applied = Math.min(maxTorqueImpulse, stopImpulse);
    b.angVel -= INK.m2.sign(b.angVel) * applied * b.invInertia;
  }
};

World.prototype._narrowphase = function (dt) {
  var pairs = this.broadphase.pairBuf;
  var pairCount = this.broadphase.pairCount;
  var margin = cfg.collision.speculativeDistance;
  var maxSpec = cfg.collision.maxSpeculative;
  this.manifoldCount = 0;
  this.solveCount = 0;

  for (var p = 0; p < pairCount; p += 2) {
    var A = this.bodies[pairs[p]], B = this.bodies[pairs[p + 1]];
    if (A.id > B.id) { var t = A; A = B; B = t; }
    var activeA = A.type !== INK.BODY_STATIC && A.awake;
    var activeB = B.type !== INK.BODY_STATIC && B.awake;

    /* hizli yaklasan cift icin spekulatif mesafeyi buyut: tunelleme panzehiri */
    var relVx = B.vel.x - A.vel.x, relVy = B.vel.y - A.vel.y;
    var relSpeed = Math.sqrt(relVx * relVx + relVy * relVy);
    var pairMargin = Math.min(Math.max(margin, relSpeed * dt), maxSpec);

    for (var i = 0; i < A.shapes.length; i++) {
      for (var j = 0; j < B.shapes.length; j++) {
        var sa = A.shapes[i], sb = B.shapes[j];
        /* Compound cisimlerde (murekkep cizgileri) shape cifti sayisi
           patliyor; SAT'a girmeden once shape AABB'leriyle ele. */
        if (A.shapes.length + B.shapes.length > 2 &&
            !overlapExpanded(sa.aabb, sb.aabb, margin)) continue;
        var key = sa.gid * KEY_SHIFT + sb.gid;
        var m = this.manifoldMap.get(key);

        if (!activeA && !activeB) {
          /* iki taraf da uyuyor: temasi koru, cozme */
          if (m && m.count > 0) { m.stamp = this.stepCount; this._addManifold(m, false); }
          continue;
        }

        var isNew = !m;
        if (isNew) {
          m = this.manifoldPool.get();
          m.key = key;
          this.manifoldMap.set(key, m);
          this.allManifolds.push(m);
        }
        m.shapeA = sa; m.shapeB = sb;
        m.bodyA = A; m.bodyB = B;
        m.isSensor = sa.isSensor || sb.isSensor;

        var oldCount = isNew ? 0 : m.count;
        for (var k = 0; k < oldCount; k++) {
          this._scratchIds[k] = m.points[k].id;
          this._scratchImp[k] = m.points[k].normalImpulse;
          this._scratchImp[k + 2] = m.points[k].tangentImpulse;
        }

        INK.collision.collide(m, pairMargin);

        if (m.count === 0) {
          /* AABB'ler hala ortusuyor: manifoldu yasat. Her adimda silip yeniden
             kurmak Map'i doverdi (adim basina kilobaytlarca cop). */
          if (!isNew && oldCount > 0 && m.touching && this.onEndContact) this.onEndContact(m);
          m.touching = false;
          m.wasTouching = false;
          m.stamp = this.stepCount;
          continue;
        }

        /* warm starting: ayni temas ID'sinin impulsunu tasi */
        for (var n = 0; n < m.count; n++) {
          var cp = m.points[n];
          cp.normalImpulse = 0; cp.tangentImpulse = 0;
          for (var o = 0; o < oldCount; o++) {
            if (this._scratchIds[o] === cp.id) {
              cp.normalImpulse = this._scratchImp[o];
              cp.tangentImpulse = this._scratchImp[o + 2];
              break;
            }
          }
        }

        /* normali bodyA'nin yerel cercevesinde sakla (pozisyon cozucusu icin) */
        m.localNormalX = A.rot.c * m.normal.x + A.rot.s * m.normal.y;
        m.localNormalY = -A.rot.s * m.normal.x + A.rot.c * m.normal.y;

        /* Gercek "temas" karari cozumden sonra verilir: hizli carpismada
           spekulatif temas cisimleri yuzeyde durdurur, ic ice hic gecmezler.
           Burada yalnizca yakinlik bakilir (uyandirma icin). */
        var engaged = false;
        for (var q = 0; q < m.count; q++) {
          if (m.points[q].separation <= cfg.collision.speculativeDistance) { engaged = true; break; }
        }
        m.wasTouching = m.touching;
        m.stamp = this.stepCount;
        this._addManifold(m, !m.isSensor);

        /* uyuyan tarafi hemen uyandir — bir kare gecikme sekme uretiyor */
        if (engaged) {
          if (!activeA && A.type !== INK.BODY_STATIC) { A.wake(); activeA = true; }
          if (!activeB && B.type !== INK.BODY_STATIC) { B.wake(); activeB = true; }
        }
      }
    }
  }

  this._pruneManifolds();
};

/* Sayac tabanli ekleme: dizi buyudukten sonra bir daha alokasyon yapmaz. */
World.prototype._addManifold = function (m, solvable) {
  var n = this.manifoldCount;
  if (n < this.manifolds.length) this.manifolds[n] = m; else this.manifolds.push(m);
  this.manifoldCount = n + 1;
  if (solvable) {
    var k = this.solveCount;
    if (k < this.solveList.length) this.solveList[k] = m; else this.solveList.push(m);
    this.solveCount = k + 1;
  }
};

/* Broadphase'den dusen cift bir daha ziyaret edilmez; bayatlayan manifoldlari
   burada topluyoruz. Yoksa manifoldMap sizdirir ve "end" olayi hic gelmez. */
var MANIFOLD_TTL = 8;   // adim; ciftin kisa sureli kaybolmasi objeyi oldurmesin

World.prototype._pruneManifolds = function () {
  var all = this.allManifolds;
  var write = 0;
  for (var i = 0; i < all.length; i++) {
    var m = all[i];
    if (m.stamp === this.stepCount) { all[write++] = m; continue; }
    /* Cift broadphase'den dustu: temas bittiyse hemen haber ver, ama objeyi
       birkac adim daha sakla. Titreyen yiginda AABB'ler surekli girip
       cikiyor; her seferinde Map'e yazmak adim basina kilobayt cop demek. */
    if (m.touching) {
      if (this.onEndContact) this.onEndContact(m);
      m.touching = false;
      m.wasTouching = false;
      for (var j = 0; j < m.count; j++) {
        m.points[j].normalImpulse = 0;
        m.points[j].tangentImpulse = 0;
      }
    }
    if (this.stepCount - m.stamp <= MANIFOLD_TTL) { all[write++] = m; continue; }
    this.manifoldMap.delete(m.key);
    this.manifoldPool.release(m);
  }
  all.length = write;
};

/* Temas bayragi ve begin/end olaylari — cozumden sonra, cunku "degdi mi"
   sorusunun dogru yaniti "impuls uretildi mi". */
World.prototype._updateContactState = function () {
  for (var i = 0; i < this.manifoldCount; i++) {
    var m = this.manifolds[i];
    if (m.stamp !== this.stepCount) continue;
    var touching = false;
    for (var j = 0; j < m.count; j++) {
      var cp = m.points[j];
      if (cp.separation <= 0 || cp.normalImpulse > 0) { touching = true; break; }
    }
    m.touching = touching;
    if (touching && !m.wasTouching && this.onBeginContact) this.onBeginContact(m);
    else if (!touching && m.wasTouching && this.onEndContact) this.onEndContact(m);
  }
};

/* ---------- adalar ve uyku ---------- */

World.prototype._find = function (x) {
  var p = this._islandParent;
  while (p[x] !== x) { p[x] = p[p[x]]; x = p[x]; }
  return x;
};

World.prototype._updateSleep = function (dt) {
  var bodies = this.bodies;
  var n = bodies.length;
  var slp = cfg.sleep;
  var i, b;

  /* temas impulslerini topla (yuvarlanma direnci bir sonraki adimda kullanir) */
  for (i = 0; i < this.solveCount; i++) {
    var m = this.solveList[i];
    var sum = 0;
    for (var k = 0; k < m.count; k++) sum += m.points[k].normalImpulse;
    m.bodyA.contactImpulse += sum;
    m.bodyB.contactImpulse += sum;
  }

  for (i = 0; i < n; i++) {
    b = bodies[i];
    b.islandIndex = i;
    if (b.type === INK.BODY_STATIC || !b.awake) continue;
    var lin = b.vel.x * b.vel.x + b.vel.y * b.vel.y;
    if (!b.allowSleep || lin > slp.linearThreshold * slp.linearThreshold ||
        Math.abs(b.angVel) > slp.angularThreshold) {
      b.sleepTime = 0;
    } else {
      b.sleepTime += dt;
    }
  }

  /* union-find: temas eden hareketli cisimler ayni adada */
  var parent = this._islandParent;
  parent.length = n;
  for (i = 0; i < n; i++) parent[i] = i;
  for (i = 0; i < this.manifoldCount; i++) {
    var mf = this.manifolds[i];
    if (mf.isSensor || !mf.touching) continue;
    var a = mf.bodyA, c = mf.bodyB;
    if (a.type === INK.BODY_STATIC || c.type === INK.BODY_STATIC) continue;
    var ra = this._find(a.islandIndex), rc = this._find(c.islandIndex);
    if (ra !== rc) parent[ra] = rc;
  }

  /* ada basina: hepsi uyumaya hazirsa uyut, degilse hepsini uyanik tut */
  var flags = this._islandFlags;
  flags.length = n;
  for (i = 0; i < n; i++) flags[i] = 1;             // 1 = uyuyabilir
  for (i = 0; i < n; i++) {
    b = bodies[i];
    if (b.type === INK.BODY_STATIC) continue;
    var root = this._find(i);
    /* Uyuyan cismin sleepTime'i sifirdir; onu olcute sokmak adayi
       her karede yeniden uyandirirdi. Yalnizca uyanik cisimler karar verir. */
    if (!b.allowSleep) flags[root] = 0;
    else if (b.awake && b.sleepTime < slp.timeToSleep) flags[root] = 0;
  }
  for (i = 0; i < n; i++) {
    b = bodies[i];
    if (b.type === INK.BODY_STATIC) continue;
    var r = this._find(i);
    if (flags[r] === 1) { if (b.awake) b.sleep(); }
    else if (!b.awake) { b.awake = true; b.sleepTime = 0; }
  }
};

/* ---------- NaN korumasi ---------- */

World.prototype._guard = function () {
  var bodies = this.bodies;
  for (var i = 0; i < bodies.length; i++) {
    var b = bodies[i];
    if (b.isFinite()) {
      b.safePos.x = b.pos.x; b.safePos.y = b.pos.y;
      b.safeAngle = b.angle;
      continue;
    }
    this.nanEvents++;
    if (this.dev) {
      throw new Error('NaN/Infinity: body ' + b.id + ' (' + b.tag + ') adim ' + this.stepCount);
    }
    b.pos.x = b.safePos.x; b.pos.y = b.safePos.y;
    b.angle = b.safeAngle;
    b.rot.setAngle(b.angle);
    b.vel.x = 0; b.vel.y = 0;
    b.angVel = 0;
  }
};

/* ---------- sorgular ---------- */

World.prototype.queryPoint = function (x, y, filter) {
  for (var i = 0; i < this.bodies.length; i++) {
    var b = this.bodies[i];
    if (filter && !filter(b)) continue;
    var box = b.aabb;
    if (x < box.minX || x > box.maxX || y < box.minY || y > box.maxY) continue;
    if (b.containsPoint(x, y)) return b;
  }
  return null;
};

/* Dunyaya eklenmemis gecici bir body ile ortusme testi (cizgi dogrulamasi). */
World.prototype.overlapBody = function (probe, filter) {
  var m = this.manifoldPool.get();
  var hit = null;
  probe.updateAABB(0);
  for (var i = 0; i < this.bodies.length && !hit; i++) {
    var b = this.bodies[i];
    if (b === probe) continue;
    if (filter && !filter(b)) continue;
    if (!INK.m2.aabbOverlap(probe.aabb, b.aabb)) continue;
    for (var j = 0; j < probe.shapes.length && !hit; j++) {
      for (var k = 0; k < b.shapes.length && !hit; k++) {
        m.reset();
        m.bodyA = probe; m.bodyB = b;
        m.shapeA = probe.shapes[j]; m.shapeB = b.shapes[k];
        INK.collision.collide(m, 0);
        for (var q = 0; q < m.count; q++) {
          if (m.points[q].separation <= 0) { hit = b; break; }
        }
      }
    }
  }
  m.reset();
  this.manifoldPool.release(m);
  return hit;
};

/* Determinizm karsilastirmasi icin state hash'i */
World.prototype.hash = function () {
  var h = new INK.Hasher();
  h.int(this.bodies.length);
  for (var i = 0; i < this.bodies.length; i++) {
    var b = this.bodies[i];
    h.number(b.pos.x).number(b.pos.y).number(b.angle);
    h.number(b.vel.x).number(b.vel.y).number(b.angVel);
    h.int(b.awake ? 1 : 0);
  }
  return h.hex();
};

INK.World = World;

})(typeof globalThis !== 'undefined'
    ? (globalThis.INK = globalThis.INK || {})
    : (this.INK = this.INK || {}));
