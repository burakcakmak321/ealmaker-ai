/* Sekiller: Circle ve ConvexPolygon (max 8 kose).
   Kutle ozellikleri burada hesaplanir; body onlari birlestirir. */
(function (INK) {
'use strict';

var V2 = INK.V2;
var m2 = INK.m2;
var cfg = INK.config;

var SHAPE_CIRCLE = 0;
var SHAPE_POLYGON = 1;
var MAX_VERTS = 8;

var nextShapeId = 1;
var freeShapeIds = [];
var MAX_SHAPE_ID = 4096;   // manifold anahtari gidA*4096+gidB, Smi araliginda kalsin

/* gid'ler geri donusturulur: cizip geri alan oyuncu sayaci sonsuza kadar
   buyutmesin, manifold anahtari kucuk tamsayi kalsin. */
function allocShapeId() {
  if (freeShapeIds.length > 0) return freeShapeIds.pop();
  if (nextShapeId >= MAX_SHAPE_ID) {
    throw new Error('shape id tavani (' + MAX_SHAPE_ID + ') — geri donusum kirik');
  }
  return nextShapeId++;
}

function baseShape(shape, matName) {
  var mat = cfg.material(matName);
  shape.gid = allocShapeId();
  shape.material = matName;
  shape.friction = mat.friction;
  shape.restitution = mat.restitution;
  shape.density = mat.density;
  shape.isSensor = false;
  shape.body = null;
  /* dunya AABB'si: body.updateAABB her adimda doldurur, narrowphase on eler */
  shape.aabb = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  return shape;
}

/* --- Circle: yerel merkez ofseti c, yaricap r --- */
function Circle(r, cx, cy, matName) {
  this.type = SHAPE_CIRCLE;
  this.r = r;
  this.c = V2.create(cx || 0, cy || 0);
  baseShape(this, matName || 'stone');
}

Circle.prototype.massData = function (out) {
  var area = Math.PI * this.r * this.r;
  out.mass = area * this.density;
  out.cx = this.c.x;
  out.cy = this.c.y;
  /* kendi merkezi etrafinda 0.5*m*r^2, paralel eksenle body orijinine tasi */
  out.inertia = out.mass * (0.5 * this.r * this.r + this.c.x * this.c.x + this.c.y * this.c.y);
  return out;
};

Circle.prototype.shift = function (dx, dy) { this.c.x += dx; this.c.y += dy; };

Circle.prototype.computeAABB = function (out, rot, pos) {
  var wx = rot.c * this.c.x - rot.s * this.c.y + pos.x;
  var wy = rot.s * this.c.x + rot.c * this.c.y + pos.y;
  out.minX = wx - this.r; out.maxX = wx + this.r;
  out.minY = wy - this.r; out.maxY = wy + this.r;
  return out;
};

Circle.prototype.radiusFromOrigin = function () {
  return V2.len(this.c) + this.r;
};

/* --- ConvexPolygon: yerel kose listesi, daima CCW'ye normalize edilir.
   Sema "saat yonu" diyor; giris hangi yonde olursa olsun burada duzeltilir. */
function Polygon(points, matName) {
  this.type = SHAPE_POLYGON;
  var verts = [];
  for (var i = 0; i < points.length; i++) {
    verts.push(V2.create(points[i].x !== undefined ? points[i].x : points[i][0],
                         points[i].y !== undefined ? points[i].y : points[i][1]));
  }
  if (verts.length > MAX_VERTS) throw new Error('Polygon en fazla ' + MAX_VERTS + ' kose (' + verts.length + ')');
  if (verts.length < 3) throw new Error('Polygon en az 3 kose');
  if (signedArea(verts) < 0) verts.reverse();
  this.verts = verts;
  this.count = verts.length;
  this.normals = [];
  for (var j = 0; j < this.count; j++) {
    var a = verts[j], b = verts[(j + 1) % this.count];
    var n = V2.create(b.y - a.y, -(b.x - a.x));   // CCW kenarin disa donuk normali
    V2.normalize(n, n);
    this.normals.push(n);
  }
  baseShape(this, matName || 'stone');
}

function signedArea(verts) {
  var a = 0;
  for (var i = 0; i < verts.length; i++) {
    var p = verts[i], q = verts[(i + 1) % verts.length];
    a += p.x * q.y - q.x * p.y;
  }
  return a * 0.5;
}

/* merkezi (cx,cy), acisi angle olan w x h kutu */
Polygon.box = function (w, h, cx, cy, angle, matName) {
  var hw = w * 0.5, hh = h * 0.5;
  var s = Math.sin(angle || 0), c = Math.cos(angle || 0);
  var pts = [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]];
  var out = [];
  for (var i = 0; i < 4; i++) {
    out.push([(cx || 0) + c * pts[i][0] - s * pts[i][1],
              (cy || 0) + s * pts[i][0] + c * pts[i][1]]);
  }
  return new Polygon(out, matName);
};

Polygon.prototype.massData = function (out) {
  /* ucgen ayrisimi ile alan, merkez ve orijine gore atalet */
  var area = 0, cx = 0, cy = 0, I = 0;
  var inv3 = 1 / 3;
  for (var i = 0; i < this.count; i++) {
    var p1 = this.verts[i], p2 = this.verts[(i + 1) % this.count];
    var d = p1.x * p2.y - p2.x * p1.y;
    var triArea = 0.5 * d;
    area += triArea;
    cx += triArea * inv3 * (p1.x + p2.x);
    cy += triArea * inv3 * (p1.y + p2.y);
    var intx2 = p1.x * p1.x + p2.x * p1.x + p2.x * p2.x;
    var inty2 = p1.y * p1.y + p2.y * p1.y + p2.y * p2.y;
    I += (0.25 * inv3 * d) * (intx2 + inty2);
  }
  out.mass = this.density * area;
  out.cx = area > INK.EPS ? cx / area : 0;
  out.cy = area > INK.EPS ? cy / area : 0;
  out.inertia = this.density * I;                 // body orijinine gore
  return out;
};

Polygon.prototype.shift = function (dx, dy) {
  for (var i = 0; i < this.count; i++) { this.verts[i].x += dx; this.verts[i].y += dy; }
};

Polygon.prototype.computeAABB = function (out, rot, pos) {
  var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (var i = 0; i < this.count; i++) {
    var v = this.verts[i];
    var wx = rot.c * v.x - rot.s * v.y + pos.x;
    var wy = rot.s * v.x + rot.c * v.y + pos.y;
    if (wx < minX) minX = wx; if (wx > maxX) maxX = wx;
    if (wy < minY) minY = wy; if (wy > maxY) maxY = wy;
  }
  out.minX = minX; out.maxX = maxX; out.minY = minY; out.maxY = maxY;
  return out;
};

Polygon.prototype.radiusFromOrigin = function () {
  var r = 0;
  for (var i = 0; i < this.count; i++) {
    var l = V2.len(this.verts[i]);
    if (l > r) r = l;
  }
  return r;
};

/* yerel noktanin poligon icinde olup olmadigi */
Polygon.prototype.containsLocal = function (x, y) {
  for (var i = 0; i < this.count; i++) {
    var n = this.normals[i], v = this.verts[i];
    if ((x - v.x) * n.x + (y - v.y) * n.y > 0) return false;
  }
  return true;
};

Circle.prototype.containsLocal = function (x, y) {
  var dx = x - this.c.x, dy = y - this.c.y;
  return dx * dx + dy * dy <= this.r * this.r;
};

INK.SHAPE_CIRCLE = SHAPE_CIRCLE;
INK.SHAPE_POLYGON = SHAPE_POLYGON;
INK.MAX_VERTS = MAX_VERTS;
INK.Circle = Circle;
INK.Polygon = Polygon;
INK.signedArea = signedArea;
INK.releaseShapeId = function (gid) { if (gid > 0) freeShapeIds.push(gid); };
INK.liveShapeIds = function () { return nextShapeId - 1 - freeShapeIds.length; };
INK._resetShapeIds = function () { nextShapeId = 1; freeShapeIds.length = 0; };
INK.MAX_SHAPE_ID = MAX_SHAPE_ID;

})(typeof globalThis !== 'undefined'
    ? (globalThis.INK = globalThis.INK || {})
    : (this.INK = this.INK || {}));
