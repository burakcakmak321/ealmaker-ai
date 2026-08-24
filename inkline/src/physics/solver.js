/* Sequential impulse cozucu: warm starting, Coulomb surtunmesi, restitution
   slop'u, spekulatif temas ve NGS pozisyon duzeltmesi.

   Not: Baumgarte katsayisi (beta) hiz cozucusunde degil pozisyon cozucusunde
   uygulanir. Ikisini birden kullanmak enerji ekler ve titreme uretir; spec'in
   sayilari (beta 0.2, slop 0.01, 8 hiz / 3 pozisyon iterasyonu) aynen gecerli,
   sadece duzeltme dogru yerde. */
(function (INK) {
'use strict';

var cfg = INK.config;
var sv = cfg.solver;

function prepare(manifolds, count, dt, invDt) {
  var spec = cfg.collision.speculativeDistance;
  for (var i = 0; i < count; i++) {
    var m = manifolds[i];
    if (m.isSensor) continue;
    var A = m.bodyA, B = m.bodyB;
    var nx = m.normal.x, ny = m.normal.y;
    var tx = -ny, ty = nx;

    m.friction = Math.sqrt(m.shapeA.friction * m.shapeB.friction);
    m.restitution = Math.max(m.shapeA.restitution, m.shapeB.restitution);

    for (var j = 0; j < m.count; j++) {
      var cp = m.points[j];
      var rax = cp.px - A.pos.x, ray = cp.py - A.pos.y;
      var rbx = cp.px - B.pos.x, rby = cp.py - B.pos.y;
      cp.rax = rax; cp.ray = ray; cp.rbx = rbx; cp.rby = rby;

      var rnA = rax * ny - ray * nx;
      var rnB = rbx * ny - rby * nx;
      var kn = A.invMass + B.invMass + A.invInertia * rnA * rnA + B.invInertia * rnB * rnB;
      cp.massNormal = kn > 0 ? 1 / kn : 0;

      var rtA = rax * ty - ray * tx;
      var rtB = rbx * ty - rby * tx;
      var kt = A.invMass + B.invMass + A.invInertia * rtA * rtA + B.invInertia * rtB * rtB;
      cp.massTangent = kt > 0 ? 1 / kt : 0;

      /* temas noktasindaki goreli normal hiz */
      var vax = A.vel.x - A.angVel * ray, vay = A.vel.y + A.angVel * rax;
      var vbx = B.vel.x - B.angVel * rby, vby = B.vel.y + B.angVel * rbx;
      var vn = (vbx - vax) * nx + (vby - vay) * ny;

      /* Yaklasma hizini sakla: sekme, hiz iterasyonlarindan SONRA ayri bir
         gecisde bu deger uzerinden uygulanir. Spekulatif temas carpma hizini
         yaklasma adiminda yuttugu icin restitution'i bias'a gomersek top hic
         sekmez. */
      cp.relVn = vn;
      /* spekulatif temas: bosluk kapanana kadar yaklasmaya izin ver */
      cp.bias = cp.separation > 0 ? -cp.separation * invDt : 0;
    }
  }
}

function warmStart(manifolds, count) {
  if (!sv.warmStarting) return;
  for (var i = 0; i < count; i++) {
    var m = manifolds[i];
    if (m.isSensor) continue;
    var A = m.bodyA, B = m.bodyB;
    var nx = m.normal.x, ny = m.normal.y;
    var tx = -ny, ty = nx;
    for (var j = 0; j < m.count; j++) {
      var cp = m.points[j];
      var px = cp.normalImpulse * nx + cp.tangentImpulse * tx;
      var py = cp.normalImpulse * ny + cp.tangentImpulse * ty;
      A.vel.x -= A.invMass * px; A.vel.y -= A.invMass * py;
      A.angVel -= A.invInertia * (cp.rax * py - cp.ray * px);
      B.vel.x += B.invMass * px; B.vel.y += B.invMass * py;
      B.angVel += B.invInertia * (cp.rbx * py - cp.rby * px);
    }
  }
}

/* Bir hiz iterasyonu. Once surtunme (birikmis normal impulsuna gore
   sinirli), sonra normal — bu sira daha kararli. */
function solveVelocity(manifolds, count) {
  for (var i = 0; i < count; i++) {
    var m = manifolds[i];
    if (m.isSensor) continue;
    var A = m.bodyA, B = m.bodyB;
    var nx = m.normal.x, ny = m.normal.y;
    var tx = -ny, ty = nx;
    var mu = m.friction;

    for (var j = 0; j < m.count; j++) {
      var cp = m.points[j];

      /* --- surtunme --- */
      var vax = A.vel.x - A.angVel * cp.ray, vay = A.vel.y + A.angVel * cp.rax;
      var vbx = B.vel.x - B.angVel * cp.rby, vby = B.vel.y + B.angVel * cp.rbx;
      var vt = (vbx - vax) * tx + (vby - vay) * ty;
      var lambdaT = -cp.massTangent * vt;
      var maxFriction = mu * cp.normalImpulse;
      var oldT = cp.tangentImpulse;
      cp.tangentImpulse = clamp(oldT + lambdaT, -maxFriction, maxFriction);
      lambdaT = cp.tangentImpulse - oldT;
      var ptx = lambdaT * tx, pty = lambdaT * ty;
      A.vel.x -= A.invMass * ptx; A.vel.y -= A.invMass * pty;
      A.angVel -= A.invInertia * (cp.rax * pty - cp.ray * ptx);
      B.vel.x += B.invMass * ptx; B.vel.y += B.invMass * pty;
      B.angVel += B.invInertia * (cp.rbx * pty - cp.rby * ptx);

      /* --- normal --- */
      vax = A.vel.x - A.angVel * cp.ray; vay = A.vel.y + A.angVel * cp.rax;
      vbx = B.vel.x - B.angVel * cp.rby; vby = B.vel.y + B.angVel * cp.rbx;
      var vn = (vbx - vax) * nx + (vby - vay) * ny;
      var lambdaN = -cp.massNormal * (vn - cp.bias);
      var oldN = cp.normalImpulse;
      cp.normalImpulse = oldN + lambdaN > 0 ? oldN + lambdaN : 0;
      lambdaN = cp.normalImpulse - oldN;
      var pnx = lambdaN * nx, pny = lambdaN * ny;
      A.vel.x -= A.invMass * pnx; A.vel.y -= A.invMass * pny;
      A.angVel -= A.invInertia * (cp.rax * pny - cp.ray * pnx);
      B.vel.x += B.invMass * pnx; B.vel.y += B.invMass * pny;
      B.angVel += B.invInertia * (cp.rbx * pny - cp.rby * pnx);
    }
  }
}

/* Bir pozisyon iterasyonu (NGS). Capalar body yerel cercevesinde saklandigi
   icin ic ice gecme guncel donusumlerden yeniden turetilir. */
function solvePosition(manifolds, count) {
  var minSeparation = 0;
  for (var i = 0; i < count; i++) {
    var m = manifolds[i];
    if (m.isSensor) continue;
    var A = m.bodyA, B = m.bodyB;
    if (A.invMass === 0 && B.invMass === 0) continue;

    /* normal A'nin yerel cercevesinden guncel aciyla geri getirilir */
    var nx = A.rot.c * m.localNormalX - A.rot.s * m.localNormalY;
    var ny = A.rot.s * m.localNormalX + A.rot.c * m.localNormalY;

    for (var j = 0; j < m.count; j++) {
      var cp = m.points[j];
      var pax = A.rot.c * cp.lax - A.rot.s * cp.lay + A.pos.x;
      var pay = A.rot.s * cp.lax + A.rot.c * cp.lay + A.pos.y;
      var pbx = B.rot.c * cp.lbx - B.rot.s * cp.lby + B.pos.x;
      var pby = B.rot.s * cp.lbx + B.rot.c * cp.lby + B.pos.y;

      var separation = (pbx - pax) * nx + (pby - pay) * ny;
      if (separation < minSeparation) minSeparation = separation;

      var cx = (pax + pbx) * 0.5, cy = (pay + pby) * 0.5;
      var rax = cx - A.pos.x, ray = cy - A.pos.y;
      var rbx = cx - B.pos.x, rby = cy - B.pos.y;

      var corr = clamp(sv.baumgarte * (separation + sv.penetrationSlop),
                       -sv.maxCorrection, 0);
      if (corr === 0) continue;

      var rnA = rax * ny - ray * nx;
      var rnB = rbx * ny - rby * nx;
      var k = A.invMass + B.invMass + A.invInertia * rnA * rnA + B.invInertia * rnB * rnB;
      if (k <= 0) continue;
      var impulse = -corr / k;
      var px = impulse * nx, py = impulse * ny;

      A.pos.x -= A.invMass * px; A.pos.y -= A.invMass * py;
      A.angle -= A.invInertia * (rax * py - ray * px);
      A.rot.setAngle(A.angle);
      B.pos.x += B.invMass * px; B.pos.y += B.invMass * py;
      B.angle += B.invInertia * (rbx * py - rby * px);
      B.rot.setAngle(B.angle);
    }
  }
  return minSeparation;
}

/* Sekme gecisi: hiz iterasyonlari bittikten sonra bir kez.
   Kaynak: saklanan yaklasma hizi; esigin altindaki temaslar sekmez. */
function applyRestitution(manifolds, count) {
  for (var i = 0; i < count; i++) {
    var m = manifolds[i];
    if (m.isSensor || m.restitution <= 0) continue;
    var A = m.bodyA, B = m.bodyB;
    var nx = m.normal.x, ny = m.normal.y;
    for (var j = 0; j < m.count; j++) {
      var cp = m.points[j];
      if (cp.relVn > -sv.restitutionSlop || cp.normalImpulse <= 0) continue;
      var vax = A.vel.x - A.angVel * cp.ray, vay = A.vel.y + A.angVel * cp.rax;
      var vbx = B.vel.x - B.angVel * cp.rby, vby = B.vel.y + B.angVel * cp.rbx;
      var vn = (vbx - vax) * nx + (vby - vay) * ny;
      var lambda = -cp.massNormal * (vn + m.restitution * cp.relVn);
      var oldN = cp.normalImpulse;
      cp.normalImpulse = oldN + lambda > 0 ? oldN + lambda : 0;
      lambda = cp.normalImpulse - oldN;
      var px = lambda * nx, py = lambda * ny;
      A.vel.x -= A.invMass * px; A.vel.y -= A.invMass * py;
      A.angVel -= A.invInertia * (cp.rax * py - cp.ray * px);
      B.vel.x += B.invMass * px; B.vel.y += B.invMass * py;
      B.angVel += B.invInertia * (cp.rbx * py - cp.rby * px);
    }
  }
}

function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }

INK.solver = {
  prepare: prepare,
  warmStart: warmStart,
  solveVelocity: solveVelocity,
  applyRestitution: applyRestitution,
  solvePosition: solvePosition
};

})(typeof globalThis !== 'undefined'
    ? (globalThis.INK = globalThis.INK || {})
    : (this.INK = this.INK || {}));
