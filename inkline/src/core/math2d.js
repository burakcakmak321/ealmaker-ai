/* 2D matematik. Sicak yollarda alokasyon yok: cikti daima "out" parametresi. */
(function (INK) {
'use strict';

var EPS = 1e-9;

function v2(x, y) { return { x: x || 0, y: y || 0 }; }

var V2 = {
  create: v2,
  set: function (o, x, y) { o.x = x; o.y = y; return o; },
  copy: function (o, a) { o.x = a.x; o.y = a.y; return o; },
  zero: function (o) { o.x = 0; o.y = 0; return o; },
  add: function (o, a, b) { o.x = a.x + b.x; o.y = a.y + b.y; return o; },
  sub: function (o, a, b) { o.x = a.x - b.x; o.y = a.y - b.y; return o; },
  scale: function (o, a, s) { o.x = a.x * s; o.y = a.y * s; return o; },
  addScaled: function (o, a, b, s) { o.x = a.x + b.x * s; o.y = a.y + b.y * s; return o; },
  neg: function (o, a) { o.x = -a.x; o.y = -a.y; return o; },
  dot: function (a, b) { return a.x * b.x + a.y * b.y; },
  cross: function (a, b) { return a.x * b.y - a.y * b.x; },
  /* skaler x vektor ve vektor x skaler capraz carpimlari (aci hizi isleri) */
  crossSV: function (o, s, a) { o.x = -s * a.y; o.y = s * a.x; return o; },
  crossVS: function (o, a, s) { o.x = s * a.y; o.y = -s * a.x; return o; },
  lenSq: function (a) { return a.x * a.x + a.y * a.y; },
  len: function (a) { return Math.sqrt(a.x * a.x + a.y * a.y); },
  distSq: function (a, b) { var dx = a.x - b.x, dy = a.y - b.y; return dx * dx + dy * dy; },
  dist: function (a, b) { var dx = a.x - b.x, dy = a.y - b.y; return Math.sqrt(dx * dx + dy * dy); },
  normalize: function (o, a) {
    var l = Math.sqrt(a.x * a.x + a.y * a.y);
    if (l < EPS) { o.x = 0; o.y = 0; return 0; }
    var inv = 1 / l; o.x = a.x * inv; o.y = a.y * inv; return l;
  },
  /* saga donuk normal (perp) */
  perp: function (o, a) { var x = a.x; o.x = -a.y; o.y = x; return o; },
  lerp: function (o, a, b, t) { o.x = a.x + (b.x - a.x) * t; o.y = a.y + (b.y - a.y) * t; return o; },
  clampLen: function (o, a, max) {
    var l2 = a.x * a.x + a.y * a.y;
    if (l2 > max * max && l2 > EPS) {
      var s = max / Math.sqrt(l2); o.x = a.x * s; o.y = a.y * s;
    } else { o.x = a.x; o.y = a.y; }
    return o;
  },
  isFinite: function (a) { return isFinite(a.x) && isFinite(a.y); }
};

/* Rotasyon: aciyi sin/cos olarak tut, her karede trig cagirma */
function Rot(angle) { this.s = Math.sin(angle || 0); this.c = Math.cos(angle || 0); }
Rot.prototype.setAngle = function (a) { this.s = Math.sin(a); this.c = Math.cos(a); return this; };
Rot.prototype.angle = function () { return Math.atan2(this.s, this.c); };

/* dunya = rot * yerel + pos */
function transform(out, rot, pos, local) {
  var x = rot.c * local.x - rot.s * local.y + pos.x;
  var y = rot.s * local.x + rot.c * local.y + pos.y;
  out.x = x; out.y = y; return out;
}
/* yerel = rot^T * (dunya - pos) */
function invTransform(out, rot, pos, world) {
  var dx = world.x - pos.x, dy = world.y - pos.y;
  var x = rot.c * dx + rot.s * dy;
  var y = -rot.s * dx + rot.c * dy;
  out.x = x; out.y = y; return out;
}
/* sadece dondur (yer degistirme yok) */
function rotate(out, rot, v) {
  var x = rot.c * v.x - rot.s * v.y;
  var y = rot.s * v.x + rot.c * v.y;
  out.x = x; out.y = y; return out;
}
function invRotate(out, rot, v) {
  var x = rot.c * v.x + rot.s * v.y;
  var y = -rot.s * v.x + rot.c * v.y;
  out.x = x; out.y = y; return out;
}

function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }
function lerp(a, b, t) { return a + (b - a) * t; }
function sign(v) { return v < 0 ? -1 : 1; }
function approx(a, b, eps) { return Math.abs(a - b) <= (eps === undefined ? 1e-6 : eps); }

/* Noktanin AB dogru parcasina uzakligi — RDP ve ince zemin testleri icin */
function pointSegmentDist(px, py, ax, ay, bx, by) {
  var abx = bx - ax, aby = by - ay;
  var apx = px - ax, apy = py - ay;
  var d = abx * abx + aby * aby;
  var t = d < EPS ? 0 : clamp((apx * abx + apy * aby) / d, 0, 1);
  var dx = apx - abx * t, dy = apy - aby * t;
  return Math.sqrt(dx * dx + dy * dy);
}

/* AB ve CD dogru parcalari kesisiyor mu (dokunma dahil) */
function segmentsIntersect(ax, ay, bx, by, cx, cy, dx, dy) {
  var d1 = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
  var d2 = (bx - ax) * (dy - ay) - (by - ay) * (dx - ax);
  var d3 = (dx - cx) * (ay - cy) - (dy - cy) * (ax - cx);
  var d4 = (dx - cx) * (by - cy) - (dy - cy) * (bx - cx);
  if (((d1 > 0) !== (d2 > 0)) && ((d3 > 0) !== (d4 > 0))) return true;
  if (Math.abs(d1) < EPS && onSeg(ax, ay, bx, by, cx, cy)) return true;
  if (Math.abs(d2) < EPS && onSeg(ax, ay, bx, by, dx, dy)) return true;
  if (Math.abs(d3) < EPS && onSeg(cx, cy, dx, dy, ax, ay)) return true;
  if (Math.abs(d4) < EPS && onSeg(cx, cy, dx, dy, bx, by)) return true;
  return false;
}
function onSeg(ax, ay, bx, by, px, py) {
  return Math.min(ax, bx) - EPS <= px && px <= Math.max(ax, bx) + EPS &&
         Math.min(ay, by) - EPS <= py && py <= Math.max(ay, by) + EPS;
}

/* Polyline toplam uzunlugu — murekkep maliyeti bu */
function polylineLength(points) {
  var total = 0;
  for (var i = 1; i < points.length; i++) {
    var dx = points[i][0] - points[i - 1][0];
    var dy = points[i][1] - points[i - 1][1];
    total += Math.sqrt(dx * dx + dy * dy);
  }
  return total;
}

function aabbOverlap(a, b) {
  return !(b.minX > a.maxX || b.maxX < a.minX || b.minY > a.maxY || b.maxY < a.minY);
}

INK.EPS = EPS;
INK.V2 = V2;
INK.Rot = Rot;
INK.m2 = {
  transform: transform, invTransform: invTransform,
  rotate: rotate, invRotate: invRotate,
  clamp: clamp, lerp: lerp, sign: sign, approx: approx,
  pointSegmentDist: pointSegmentDist, segmentsIntersect: segmentsIntersect,
  polylineLength: polylineLength, aabbOverlap: aabbOverlap
};

})(typeof globalThis !== 'undefined'
    ? (globalThis.INK = globalThis.INK || {})
    : (this.INK = this.INK || {}));
