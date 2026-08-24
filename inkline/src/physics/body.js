/* Rigid body. Konum daima kutle merkezidir (COM); orijin/COM ikiligi yok,
   compound cisimlerde tork hesabi bu sayede tek satir kalir. */
(function (INK) {
'use strict';

var V2 = INK.V2;
var Rot = INK.Rot;
var cfg = INK.config;

var STATIC = 'static';
var DYNAMIC = 'dynamic';
var KINEMATIC = 'kinematic';

var nextBodyId = 1;
var massScratch = { mass: 0, cx: 0, cy: 0, inertia: 0 };

function Body(type, x, y, angle) {
  this.id = nextBodyId++;
  this.type = type || DYNAMIC;
  this.pos = V2.create(x || 0, y || 0);
  this.angle = angle || 0;
  this.rot = new Rot(this.angle);
  this.vel = V2.create(0, 0);
  this.angVel = 0;
  this.force = V2.create(0, 0);
  this.torque = 0;

  this.mass = 0; this.invMass = 0;
  this.inertia = 0; this.invInertia = 0;

  this.shapes = [];
  this.aabb = { minX: 0, minY: 0, maxX: 0, maxY: 0 };

  this.linearDamping = cfg.damping.linear;
  this.angularDamping = cfg.damping.angular;
  this.rollingResistance = 0;

  this.awake = true;
  this.allowSleep = true;
  this.sleepTime = 0;
  this.islandIndex = 0;
  this.bpIndex = 0;
  this.contactImpulse = 0;    // adim basina toplam normal impuls
  this.rollingRadius = 0;     // yuvarlanma direnci kolu, finalize doldurur

  /* render interpolasyonu icin son iki state */
  this.prevPos = V2.create(x || 0, y || 0);
  this.prevAngle = this.angle;
  /* NaN kurtarma noktasi */
  this.safePos = V2.create(x || 0, y || 0);
  this.safeAngle = this.angle;

  this.tag = '';          // 'cat' | 'ink' | 'goal' | 'hazard' | ...
  this.userData = null;
  this.gravityScale = 1;
  this.world = null;
}

Body.prototype.addShape = function (shape) {
  if (shape.body) throw new Error('shape zaten bir body\'ye bagli');
  shape.body = this;
  this.shapes.push(shape);
  return shape;
};

/* Sekiller eklendikten sonra bir kez cagrilir:
   kutle, COM ve atalet hesaplanir, sekiller COM'a gore yeniden ifade edilir. */
Body.prototype.finalize = function () {
  if (this.type !== DYNAMIC) {
    this.mass = 0; this.invMass = 0;
    this.inertia = 0; this.invInertia = 0;
    this.rollingRadius = 0;
    this.updateAABB(0);
    return this;
  }
  var totalMass = 0, cx = 0, cy = 0, inertiaOrigin = 0;
  for (var i = 0; i < this.shapes.length; i++) {
    var md = this.shapes[i].massData(massScratch);
    totalMass += md.mass;
    cx += md.mass * md.cx;
    cy += md.mass * md.cy;
    inertiaOrigin += md.inertia;
  }
  if (totalMass <= INK.EPS) throw new Error('sifir kutleli dynamic body (id ' + this.id + ')');
  cx /= totalMass; cy /= totalMass;

  /* sekilleri COM'a tasi, body konumunu ayni dunya noktasinda tut */
  for (var j = 0; j < this.shapes.length; j++) this.shapes[j].shift(-cx, -cy);
  this.pos.x += this.rot.c * cx - this.rot.s * cy;
  this.pos.y += this.rot.s * cx + this.rot.c * cy;
  V2.copy(this.prevPos, this.pos);
  V2.copy(this.safePos, this.pos);

  this.mass = totalMass;
  this.invMass = 1 / totalMass;
  var rr = 0;
  for (var k = 0; k < this.shapes.length; k++) {
    var sr = this.shapes[k].radiusFromOrigin();
    if (sr > rr) rr = sr;
  }
  this.rollingRadius = rr;
  /* paralel eksen: I_com = I_origin - m*d^2 */
  this.inertia = inertiaOrigin - totalMass * (cx * cx + cy * cy);
  if (this.inertia <= INK.EPS) this.inertia = totalMass * 1e-4;
  this.invInertia = 1 / this.inertia;
  this.updateAABB(0);
  return this;
};

Body.prototype.setTransform = function (x, y, angle) {
  this.pos.x = x; this.pos.y = y;
  this.angle = angle || 0;
  this.rot.setAngle(this.angle);
  V2.copy(this.prevPos, this.pos);
  this.prevAngle = this.angle;
  V2.copy(this.safePos, this.pos);
  this.safeAngle = this.angle;
  this.updateAABB(0);
  return this;
};

/* dt > 0 verilirse AABB hiz yonunde genisletilir (swept on kontrol) */
Body.prototype.updateAABB = function (dt) {
  var n = this.shapes.length;
  if (n === 0) {
    this.aabb.minX = this.aabb.maxX = this.pos.x;
    this.aabb.minY = this.aabb.maxY = this.pos.y;
    return;
  }
  var box = this.aabb;
  var dx = dt > 0 ? this.vel.x * dt : 0;
  var dy = dt > 0 ? this.vel.y * dt : 0;
  var m = cfg.broadphase.aabbMargin;
  for (var i = 0; i < n; i++) {
    var sb = this.shapes[i].aabb;
    this.shapes[i].computeAABB(sb, this.rot, this.pos);
    /* shape AABB'si de supurulur: narrowphase on elemesi body ile ayni
       kabaligi kullansin, yoksa hizli cisimde temas kacar */
    if (dx > 0) sb.maxX += dx; else sb.minX += dx;
    if (dy > 0) sb.maxY += dy; else sb.minY += dy;
    sb.minX -= m; sb.minY -= m; sb.maxX += m; sb.maxY += m;
    if (i === 0) {
      box.minX = sb.minX; box.minY = sb.minY; box.maxX = sb.maxX; box.maxY = sb.maxY;
    } else {
      if (sb.minX < box.minX) box.minX = sb.minX;
      if (sb.minY < box.minY) box.minY = sb.minY;
      if (sb.maxX > box.maxX) box.maxX = sb.maxX;
      if (sb.maxY > box.maxY) box.maxY = sb.maxY;
    }
  }
};

Body.prototype.applyForce = function (fx, fy) {
  if (this.type !== DYNAMIC) return;
  this.wake();
  this.force.x += fx; this.force.y += fy;
};

Body.prototype.applyImpulse = function (ix, iy, px, py) {
  if (this.type !== DYNAMIC) return;
  this.wake();
  this.vel.x += ix * this.invMass;
  this.vel.y += iy * this.invMass;
  if (px !== undefined) {
    var rx = px - this.pos.x, ry = py - this.pos.y;
    this.angVel += this.invInertia * (rx * iy - ry * ix);
  }
};

Body.prototype.wake = function () {
  if (this.type === STATIC) return;
  this.awake = true;
  this.sleepTime = 0;
};

Body.prototype.sleep = function () {
  this.awake = false;
  this.sleepTime = 0;
  this.vel.x = 0; this.vel.y = 0;
  this.angVel = 0;
  this.force.x = 0; this.force.y = 0;
  this.torque = 0;
};

/* dunya noktasindaki hiz */
Body.prototype.velocityAt = function (out, px, py) {
  var rx = px - this.pos.x, ry = py - this.pos.y;
  out.x = this.vel.x - this.angVel * ry;
  out.y = this.vel.y + this.angVel * rx;
  return out;
};

Body.prototype.containsPoint = function (x, y) {
  var lx = 0, ly = 0;
  var dx = x - this.pos.x, dy = y - this.pos.y;
  lx = this.rot.c * dx + this.rot.s * dy;
  ly = -this.rot.s * dx + this.rot.c * dy;
  for (var i = 0; i < this.shapes.length; i++) {
    if (this.shapes[i].containsLocal(lx, ly)) return true;
  }
  return false;
};

/* Dunyadan cikarilirken cagrilir: shape id'leri havuza doner. */
Body.prototype.destroy = function () {
  for (var i = 0; i < this.shapes.length; i++) {
    INK.releaseShapeId(this.shapes[i].gid);
    this.shapes[i].gid = 0;
    this.shapes[i].body = null;
  }
  this.shapes.length = 0;
  this.world = null;
};

Body.prototype.isFinite = function () {
  return V2.isFinite(this.pos) && V2.isFinite(this.vel) &&
         isFinite(this.angle) && isFinite(this.angVel);
};

INK.Body = Body;
INK.BODY_STATIC = STATIC;
INK.BODY_DYNAMIC = DYNAMIC;
INK.BODY_KINEMATIC = KINEMATIC;
INK._resetBodyIds = function () { nextBodyId = 1; };

})(typeof globalThis !== 'undefined'
    ? (globalThis.INK = globalThis.INK || {})
    : (this.INK = this.INK || {}));
