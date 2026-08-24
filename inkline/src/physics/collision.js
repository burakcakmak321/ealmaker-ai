/* Broadphase (sabit uniform grid) + narrowphase (SAT + Sutherland-Hodgman).
   Ureticiler manifoldu doldurur; temas ID'leri warm starting icin kararlidir. */
(function (INK) {
'use strict';

var V2 = INK.V2;
var cfg = INK.config;
var CIRCLE = INK.SHAPE_CIRCLE;
var MAXV = INK.MAX_VERTS;

/* ---------------- Temas verisi ---------------- */

function ContactPoint() {
  this.px = 0; this.py = 0;          // dunya temas noktasi (gorsel/ses icin)
  this.aax = 0; this.aay = 0;        // A yuzeyindeki capa (dunya)
  this.abx = 0; this.aby = 0;        // B yuzeyindeki capa (dunya)
  this.lax = 0; this.lay = 0;        // ayni capalar A'nin yerel cercevesinde
  this.lbx = 0; this.lby = 0;
  this.separation = 0;               // negatif = ic ice gecme
  this.id = 0;
  this.normalImpulse = 0;
  this.tangentImpulse = 0;
  /* cozucu tarafindan doldurulan gecici alanlar */
  this.rax = 0; this.ray = 0; this.rbx = 0; this.rby = 0;
  this.massNormal = 0; this.massTangent = 0; this.bias = 0;
  this.relVn = 0;                    // cozum oncesi yaklasma hizi (sekme icin)
}

function Manifold() {
  this.key = 0;
  this.shapeA = null; this.shapeB = null;
  this.bodyA = null; this.bodyB = null;
  this.normal = V2.create(0, 1);     // A'dan B'ye
  this.points = [new ContactPoint(), new ContactPoint()];
  this.count = 0;
  this.friction = 0;
  this.restitution = 0;
  this.isSensor = false;
  this.touching = false;
  this.wasTouching = false;
  this.localNormalX = 0;
  this.localNormalY = 0;
  this.stamp = 0;
}
Manifold.prototype.reset = function () {
  this.count = 0; this.touching = false; this.wasTouching = false; this.shapeA = null; this.shapeB = null;
  this.bodyA = null; this.bodyB = null; this.isSensor = false;
};

/* ---------------- Broadphase: sabit izgara ----------------
   Dunya sabit 9x16 oldugu icin hash yok, dizi var: iterasyon sirasi
   her koşuda birebir ayni. */

function Broadphase() {
  var bp = cfg.broadphase;
  this.cell = bp.cellSize;
  this.minX = bp.gridMinX; this.minY = bp.gridMinY;
  this.cols = Math.ceil((bp.gridMaxX - bp.gridMinX) / this.cell);
  this.rows = Math.ceil((bp.gridMaxY - bp.gridMinY) / this.cell);
  var n = this.cols * this.rows;
  this.nCells = n;
  /* sayma siralamasi: counts -> starts -> items. Hepsi onceden ayrilmis,
     adim basina tek bir bayt bile alokasyon yok. */
  this.counts = new Int32Array(n);
  this.starts = new Int32Array(n + 1);
  this.cursor = new Int32Array(n);
  this.items = new Int32Array(cfg.limits.maxBodies * 48);
  this.bodyCells = new Int32Array(cfg.limits.maxBodies * 4);
  this.pairBuf = new Int32Array(8192);
  this.pairCount = 0;
  this.overflow = 0;          // items kapasitesi yetmediyse artar
}

Broadphase.prototype._cx = function (x) {
  var c = Math.floor((x - this.minX) / this.cell);
  return c < 0 ? 0 : (c >= this.cols ? this.cols - 1 : c);
};
Broadphase.prototype._cy = function (y) {
  var c = Math.floor((y - this.minY) / this.cell);
  return c < 0 ? 0 : (c >= this.rows ? this.rows - 1 : c);
};

Broadphase.prototype.update = function (bodies, count) {
  var i, x, y, cell;
  var counts = this.counts, cols = this.cols;
  counts.fill(0);
  var total = 0;
  var cap = this.items.length;

  for (i = 0; i < count; i++) {
    var box = bodies[i].aabb;
    var x0 = this._cx(box.minX), x1 = this._cx(box.maxX);
    var y0 = this._cy(box.minY), y1 = this._cy(box.maxY);
    var span = (x1 - x0 + 1) * (y1 - y0 + 1);
    if (total + span > cap) { this.overflow++; x1 = x0; y1 = y0; span = 1; }
    var r = i * 4;
    this.bodyCells[r] = x0; this.bodyCells[r + 1] = y0;
    this.bodyCells[r + 2] = x1; this.bodyCells[r + 3] = y1;
    for (y = y0; y <= y1; y++) {
      for (x = x0; x <= x1; x++) counts[y * cols + x]++;
    }
    total += span;
  }

  var starts = this.starts, cursor = this.cursor;
  var acc = 0;
  for (i = 0; i < this.nCells; i++) { starts[i] = acc; cursor[i] = acc; acc += counts[i]; }
  starts[this.nCells] = acc;

  var items = this.items;
  for (i = 0; i < count; i++) {
    var q = i * 4;
    for (y = this.bodyCells[q + 1]; y <= this.bodyCells[q + 3]; y++) {
      for (x = this.bodyCells[q]; x <= this.bodyCells[q + 2]; x++) {
        cell = y * cols + x;
        items[cursor[cell]++] = i;
      }
    }
  }
};

/* Cift listesi pairBuf/pairCount olarak yazilir. Bir cifti yalnizca
   paylastiklari ilk (en dusuk indeksli) hucre bildirir — cift sayim yok. */
Broadphase.prototype.pairs = function (bodies) {
  var n = 0;
  var items = this.items, starts = this.starts, cols = this.cols;
  var buf = this.pairBuf;
  var cellsTotal = this.nCells;
  for (var c = 0; c < cellsTotal; c++) {
    var from = starts[c], to = starts[c + 1];
    if (to - from < 2) continue;
    var cx = c % cols, cy = (c - cx) / cols;
    for (var i = from; i < to; i++) {
      var ia = items[i];
      var A = bodies[ia];
      for (var j = i + 1; j < to; j++) {
        var ib = items[j];
        var B = bodies[ib];
        if (A.type !== 'dynamic' && B.type !== 'dynamic') continue;
        if (!isActive(A) && !isActive(B)) continue;
        var qa = ia * 4, qb = ib * 4;
        var sx = this.bodyCells[qa] > this.bodyCells[qb] ? this.bodyCells[qa] : this.bodyCells[qb];
        var sy = this.bodyCells[qa + 1] > this.bodyCells[qb + 1] ? this.bodyCells[qa + 1] : this.bodyCells[qb + 1];
        if (cx !== sx || cy !== sy) continue;
        if (!INK.m2.aabbOverlap(A.aabb, B.aabb)) continue;
        if (n + 2 > buf.length) {
          var bigger = new Int32Array(buf.length * 2);
          bigger.set(buf); buf = this.pairBuf = bigger;
        }
        buf[n++] = ia; buf[n++] = ib;
      }
    }
  }
  this.pairCount = n;
  return n;
};

/* Statik cisim "aktif" degildir; iki uyuyan/statik cismin cifti hic uretilmez. */
function isActive(b) {
  return b.type !== 'static' && b.awake;
}

/* ---------------- Narrowphase ---------------- */

var wvA = [], wnA = [], wvB = [], wnB = [];
for (var _i = 0; _i < MAXV; _i++) {
  wvA.push(V2.create()); wnA.push(V2.create());
  wvB.push(V2.create()); wnB.push(V2.create());
}
var clipIn = [{ x: 0, y: 0, id: 0 }, { x: 0, y: 0, id: 0 }];
var clipMid = [{ x: 0, y: 0, id: 0 }, { x: 0, y: 0, id: 0 }];
var clipOut = [{ x: 0, y: 0, id: 0 }, { x: 0, y: 0, id: 0 }];
var sepScratch = { index: 0, separation: 0 };

function toWorldVerts(shape, rot, pos, verts, normals) {
  for (var i = 0; i < shape.count; i++) {
    var v = shape.verts[i], n = shape.normals[i];
    verts[i].x = rot.c * v.x - rot.s * v.y + pos.x;
    verts[i].y = rot.s * v.x + rot.c * v.y + pos.y;
    normals[i].x = rot.c * n.x - rot.s * n.y;
    normals[i].y = rot.s * n.x + rot.c * n.y;
  }
}

/* Bir noktayi body'nin yerel cercevesine tasi (pozisyon cozucusu icin) */
function toLocal(body, wx, wy, out) {
  var dx = wx - body.pos.x, dy = wy - body.pos.y;
  out.x = body.rot.c * dx + body.rot.s * dy;
  out.y = -body.rot.s * dx + body.rot.c * dy;
  return out;
}
var localTmp = { x: 0, y: 0 };

function setAnchors(m, cp, aax, aay, abx, aby) {
  cp.aax = aax; cp.aay = aay;
  cp.abx = abx; cp.aby = aby;
  cp.px = (aax + abx) * 0.5;
  cp.py = (aay + aby) * 0.5;
  toLocal(m.bodyA, aax, aay, localTmp); cp.lax = localTmp.x; cp.lay = localTmp.y;
  toLocal(m.bodyB, abx, aby, localTmp); cp.lbx = localTmp.x; cp.lby = localTmp.y;
}

function collideCircles(m, A, B, margin) {
  var ba = m.bodyA, bb = m.bodyB;
  var cax = ba.rot.c * A.c.x - ba.rot.s * A.c.y + ba.pos.x;
  var cay = ba.rot.s * A.c.x + ba.rot.c * A.c.y + ba.pos.y;
  var cbx = bb.rot.c * B.c.x - bb.rot.s * B.c.y + bb.pos.x;
  var cby = bb.rot.s * B.c.x + bb.rot.c * B.c.y + bb.pos.y;
  var dx = cbx - cax, dy = cby - cay;
  var dist = Math.sqrt(dx * dx + dy * dy);
  var sep = dist - (A.r + B.r);
  if (sep > margin) { m.count = 0; return; }
  var nx, ny;
  if (dist > INK.EPS) { nx = dx / dist; ny = dy / dist; }
  else { nx = 0; ny = 1; }                       // tam ust uste: sabit yon sec
  m.normal.x = nx; m.normal.y = ny;
  m.count = 1;
  var cp = m.points[0];
  cp.separation = sep;
  cp.id = 0;
  setAnchors(m, cp, cax + nx * A.r, cay + ny * A.r, cbx - nx * B.r, cby - ny * B.r);
}

/* A = poligon, B = cember. Normal A'dan B'ye. */
function collidePolygonCircle(m, A, B, margin) {
  var ba = m.bodyA, bb = m.bodyB;
  var cx = bb.rot.c * B.c.x - bb.rot.s * B.c.y + bb.pos.x;
  var cy = bb.rot.s * B.c.x + bb.rot.c * B.c.y + bb.pos.y;
  toWorldVerts(A, ba.rot, ba.pos, wvA, wnA);

  var best = -Infinity, index = 0;
  for (var i = 0; i < A.count; i++) {
    var s = wnA[i].x * (cx - wvA[i].x) + wnA[i].y * (cy - wvA[i].y);
    if (s > best) { best = s; index = i; }
  }
  if (best > B.r + margin) { m.count = 0; return; }

  var v1 = wvA[index], v2 = wvA[(index + 1) % A.count];
  var nx, ny, closestX, closestY, sep;

  if (best < INK.EPS) {
    /* merkez poligonun icinde: en yakin yuze it */
    nx = wnA[index].x; ny = wnA[index].y;
    closestX = cx - nx * best; closestY = cy - ny * best;
    sep = best - B.r;
  } else {
    var ex = v2.x - v1.x, ey = v2.y - v1.y;
    var u1 = (cx - v1.x) * ex + (cy - v1.y) * ey;
    var u2 = (cx - v2.x) * (-ex) + (cy - v2.y) * (-ey);
    if (u1 <= 0) { closestX = v1.x; closestY = v1.y; }
    else if (u2 <= 0) { closestX = v2.x; closestY = v2.y; }
    else {
      nx = wnA[index].x; ny = wnA[index].y;
      closestX = cx - nx * best; closestY = cy - ny * best;
    }
    if (nx === undefined) {
      var dx = cx - closestX, dy = cy - closestY;
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d > INK.EPS) { nx = dx / d; ny = dy / d; }
      else { nx = wnA[index].x; ny = wnA[index].y; d = 0; }
      sep = d - B.r;
      if (sep > margin) { m.count = 0; return; }
    } else {
      sep = best - B.r;
    }
  }

  m.normal.x = nx; m.normal.y = ny;
  m.count = 1;
  var cp = m.points[0];
  cp.separation = sep;
  cp.id = 0;
  setAnchors(m, cp, closestX, closestY, cx - nx * B.r, cy - ny * B.r);
}

function findMaxSeparation(out, verts1, normals1, count1, verts2, count2) {
  var bestIndex = 0, bestSep = -Infinity;
  for (var i = 0; i < count1; i++) {
    var nx = normals1[i].x, ny = normals1[i].y;
    var vx = verts1[i].x, vy = verts1[i].y;
    var min = Infinity;
    for (var j = 0; j < count2; j++) {
      var s = nx * (verts2[j].x - vx) + ny * (verts2[j].y - vy);
      if (s < min) min = s;
    }
    if (min > bestSep) { bestSep = min; bestIndex = i; }
  }
  out.index = bestIndex;
  out.separation = bestSep;
  return out;
}

function findIncidentEdge(verts, normals, count, refNx, refNy) {
  var best = Infinity, index = 0;
  for (var i = 0; i < count; i++) {
    var d = normals[i].x * refNx + normals[i].y * refNy;
    if (d < best) { best = d; index = i; }
  }
  return index;
}

/* Sutherland-Hodgman: segmenti tek bir yariduzleme kirp */
function clipSegment(out, inp, nx, ny, offset, idBase) {
  var n = 0;
  var d0 = nx * inp[0].x + ny * inp[0].y - offset;
  var d1 = nx * inp[1].x + ny * inp[1].y - offset;
  if (d0 <= 0) { out[n].x = inp[0].x; out[n].y = inp[0].y; out[n].id = inp[0].id; n++; }
  if (d1 <= 0) { out[n].x = inp[1].x; out[n].y = inp[1].y; out[n].id = inp[1].id; n++; }
  if (d0 * d1 < 0 && n < 2) {
    var t = d0 / (d0 - d1);
    out[n].x = inp[0].x + t * (inp[1].x - inp[0].x);
    out[n].y = inp[0].y + t * (inp[1].y - inp[0].y);
    out[n].id = idBase;
    n++;
  }
  return n;
}

function collidePolygons(m, A, B, margin) {
  var ba = m.bodyA, bb = m.bodyB;
  toWorldVerts(A, ba.rot, ba.pos, wvA, wnA);
  toWorldVerts(B, bb.rot, bb.pos, wvB, wnB);

  findMaxSeparation(sepScratch, wvA, wnA, A.count, wvB, B.count);
  var edgeA = sepScratch.index, sepA = sepScratch.separation;
  if (sepA > margin) { m.count = 0; return; }

  findMaxSeparation(sepScratch, wvB, wnB, B.count, wvA, A.count);
  var edgeB = sepScratch.index, sepB = sepScratch.separation;
  if (sepB > margin) { m.count = 0; return; }

  var flip, refVerts, refNormals, refCount, refEdge, incVerts, incNormals, incCount;
  if (sepB > sepA + 0.1 * cfg.solver.penetrationSlop) {
    flip = true;
    refVerts = wvB; refNormals = wnB; refCount = B.count; refEdge = edgeB;
    incVerts = wvA; incNormals = wnA; incCount = A.count;
  } else {
    flip = false;
    refVerts = wvA; refNormals = wnA; refCount = A.count; refEdge = edgeA;
    incVerts = wvB; incNormals = wnB; incCount = B.count;
  }

  var refNx = refNormals[refEdge].x, refNy = refNormals[refEdge].y;
  var rv1 = refVerts[refEdge], rv2 = refVerts[(refEdge + 1) % refCount];
  var incEdge = findIncidentEdge(incVerts, incNormals, incCount, refNx, refNy);
  var iv1 = incVerts[incEdge], iv2 = incVerts[(incEdge + 1) % incCount];

  clipIn[0].x = iv1.x; clipIn[0].y = iv1.y; clipIn[0].id = makeId(refEdge, incEdge, 0, flip);
  clipIn[1].x = iv2.x; clipIn[1].y = iv2.y; clipIn[1].id = makeId(refEdge, incEdge, 1, flip);

  /* referans yuzun teget yonu: yuz boyunca iki yan duzlem */
  var tx = rv2.x - rv1.x, ty = rv2.y - rv1.y;
  var tl = Math.sqrt(tx * tx + ty * ty);
  if (tl < INK.EPS) { m.count = 0; return; }
  tx /= tl; ty /= tl;

  var n1 = clipSegment(clipMid, clipIn, -tx, -ty, -(tx * rv1.x + ty * rv1.y),
                       makeId(refEdge, incEdge, 2, flip));
  if (n1 < 2) { m.count = 0; return; }
  var n2 = clipSegment(clipOut, clipMid, tx, ty, tx * rv2.x + ty * rv2.y,
                       makeId(refEdge, incEdge, 3, flip));
  if (n2 < 2) { m.count = 0; return; }

  m.normal.x = flip ? -refNx : refNx;
  m.normal.y = flip ? -refNy : refNy;

  var count = 0;
  var refOffset = refNx * rv1.x + refNy * rv1.y;
  for (var i = 0; i < 2; i++) {
    var p = clipOut[i];
    var sep = refNx * p.x + refNy * p.y - refOffset;
    if (sep <= margin) {
      var cp = m.points[count];
      cp.separation = sep;
      cp.id = p.id;
      /* capalar: biri referans yuz uzerindeki izdusum, digeri kirpilmis nokta */
      var projX = p.x - refNx * sep, projY = p.y - refNy * sep;
      if (flip) setAnchors(m, cp, p.x, p.y, projX, projY);
      else setAnchors(m, cp, projX, projY, p.x, p.y);
      count++;
    }
  }
  m.count = count;
}

function makeId(refEdge, incEdge, clipIdx, flip) {
  return (refEdge & 15) | ((incEdge & 15) << 4) | ((clipIdx & 15) << 8) | (flip ? 4096 : 0);
}

/* Iki sekli carpistir; A/B sirasi manifoldda sabittir (bodyA.id < bodyB.id). */
function collide(m, margin) {
  var A = m.shapeA, B = m.shapeB;
  if (A.type === CIRCLE && B.type === CIRCLE) collideCircles(m, A, B, margin);
  else if (A.type !== CIRCLE && B.type === CIRCLE) collidePolygonCircle(m, A, B, margin);
  else if (A.type === CIRCLE && B.type !== CIRCLE) {
    /* cemberi A yapip sonucu ters cevirmek yerine rolleri gecici takas et */
    var tb = m.bodyA; m.bodyA = m.bodyB; m.bodyB = tb;
    collidePolygonCircle(m, B, A, margin);
    tb = m.bodyA; m.bodyA = m.bodyB; m.bodyB = tb;
    m.normal.x = -m.normal.x; m.normal.y = -m.normal.y;
    for (var i = 0; i < m.count; i++) {
      var cp = m.points[i];
      var ax = cp.aax, ay = cp.aay, lax = cp.lax, lay = cp.lay;
      cp.aax = cp.abx; cp.aay = cp.aby; cp.lax = cp.lbx; cp.lay = cp.lby;
      cp.abx = ax; cp.aby = ay; cp.lbx = lax; cp.lby = lay;
    }
  }
  else collidePolygons(m, A, B, margin);
}

INK.ContactPoint = ContactPoint;
INK.Manifold = Manifold;
INK.Broadphase = Broadphase;
INK.collision = {
  collide: collide,
  collideCircles: collideCircles,
  collidePolygonCircle: collidePolygonCircle,
  collidePolygons: collidePolygons,
  findMaxSeparation: findMaxSeparation,
  clipSegment: clipSegment
};

})(typeof globalThis !== 'undefined'
    ? (globalThis.INK = globalThis.INK || {})
    : (this.INK = this.INK || {}));
