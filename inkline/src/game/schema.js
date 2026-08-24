/* Bolum veri sozlesmesi: dogrulama + normalizasyon.
   verify.js'in 5. kontrolu ve level yukleyici ayni kodu kullanir. */
(function (INK) {
'use strict';

var cfg = INK.config;
var m2 = INK.m2;

var BODY_TYPES   = ['static', 'dynamic', 'hazard', 'motor', 'platform'];
var SHAPES       = ['box', 'circle', 'poly'];
var HAZARD_KINDS = ['spike', 'saw', 'electric', 'water'];
var MOTOR_KINDS  = ['seesaw', 'fan', 'wheel'];

function isNum(v) { return typeof v === 'number' && isFinite(v); }
function isInt(v) { return isNum(v) && Math.floor(v) === v; }
function inWorld(x, y, margin) {
  var m = margin || 0;
  return x >= -m && x <= cfg.world.width + m && y >= -m && y <= cfg.world.height + m;
}
function isPoint(p) { return Array.isArray(p) && p.length === 2 && isNum(p[0]) && isNum(p[1]); }

/* --- tek body --- */
function validateBody(b, i, err) {
  var tag = 'bodies[' + i + ']';
  if (!b || typeof b !== 'object') { err.push(tag + ': obje degil'); return; }
  if (BODY_TYPES.indexOf(b.type) < 0) err.push(tag + '.type gecersiz: ' + b.type);
  if (SHAPES.indexOf(b.shape) < 0) err.push(tag + '.shape gecersiz: ' + b.shape);
  if (!isNum(b.x) || !isNum(b.y)) err.push(tag + ': x/y sayi degil');
  else if (!inWorld(b.x, b.y, 2)) err.push(tag + ': dunya sinirlarinin cok disinda (' + b.x + ',' + b.y + ')');
  if (b.angle !== undefined && !isNum(b.angle)) err.push(tag + '.angle sayi degil');

  if (b.shape === 'box') {
    if (!isNum(b.w) || b.w <= 0) err.push(tag + '.w pozitif olmali');
    if (!isNum(b.h) || b.h <= 0) err.push(tag + '.h pozitif olmali');
  } else if (b.shape === 'circle') {
    if (!isNum(b.r) || b.r <= 0) err.push(tag + '.r pozitif olmali');
  } else if (b.shape === 'poly') {
    if (!Array.isArray(b.points) || b.points.length < 3) err.push(tag + '.points en az 3 nokta');
    else if (b.points.length > 8) err.push(tag + '.points en fazla 8 kose (' + b.points.length + ')');
    else for (var p = 0; p < b.points.length; p++) {
      if (!isPoint(b.points[p])) err.push(tag + '.points[' + p + '] gecersiz');
    }
  }

  if (b.mat !== undefined && !cfg.materials[b.mat]) err.push(tag + '.mat bilinmiyor: ' + b.mat);
  if ((b.type === 'static' || b.type === 'dynamic') && b.mat === undefined) {
    err.push(tag + '.mat zorunlu (' + b.type + ')');
  }
  if (b.type === 'hazard' && HAZARD_KINDS.indexOf(b.kind) < 0) {
    err.push(tag + '.kind gecersiz hazard: ' + b.kind);
  }
  if (b.type === 'motor') {
    if (MOTOR_KINDS.indexOf(b.kind) < 0) err.push(tag + '.kind gecersiz motor: ' + b.kind);
    if (b.kind === 'seesaw' || b.kind === 'wheel') {
      if (!isPoint(b.pivot)) err.push(tag + '.pivot zorunlu [x,y]');
    }
    if (b.kind === 'fan' || b.kind === 'wheel') {
      if (!isNum(b.speed)) err.push(tag + '.speed zorunlu');
    }
  }
  if (b.type === 'platform') {
    if (!Array.isArray(b.path) || b.path.length < 2) err.push(tag + '.path en az 2 nokta');
    else for (var q = 0; q < b.path.length; q++) {
      if (!isPoint(b.path[q])) err.push(tag + '.path[' + q + '] gecersiz');
    }
    if (!isNum(b.speed) || b.speed <= 0) err.push(tag + '.speed pozitif olmali');
  }
}

/* --- tek bolum --- */
function validateLevel(lvl) {
  var err = [];
  var warn = [];
  if (!lvl || typeof lvl !== 'object') return { ok: false, errors: ['bolum objesi yok'], warnings: warn };

  if (!isInt(lvl.id) || lvl.id < 1 || lvl.id > 50) err.push('id 1..50 tamsayi olmali: ' + lvl.id);
  if (!isInt(lvl.world) || lvl.world < 1 || lvl.world > 5) err.push('world 1..5 olmali: ' + lvl.world);
  else {
    var w = cfg.worlds[lvl.world - 1];
    if (isInt(lvl.id) && (lvl.id < w.from || lvl.id > w.to)) {
      err.push('id ' + lvl.id + ' dunya ' + lvl.world + ' araligi disinda (' + w.from + '-' + w.to + ')');
    }
  }
  if (!isNum(lvl.ink) || lvl.ink <= 0) err.push('ink pozitif olmali');
  if (!isInt(lvl.maxStrokes) || lvl.maxStrokes < 1) err.push('maxStrokes >= 1 tamsayi olmali');
  if (!isNum(lvl.star2Ink) || lvl.star2Ink <= 0 || lvl.star2Ink > 1) err.push('star2Ink (0,1] araliginda olmali');
  if (!isNum(lvl.timeLimit) || lvl.timeLimit <= 0) err.push('timeLimit pozitif olmali');

  var cats = catsOf(lvl);
  if (cats.length === 0) err.push('cat zorunlu');
  for (var c = 0; c < cats.length; c++) {
    if (!isNum(cats[c].x) || !isNum(cats[c].y)) err.push('cat[' + c + ']: x/y sayi degil');
    else if (!inWorld(cats[c].x, cats[c].y, 0)) err.push('cat[' + c + '] dunya disinda');
  }
  if (lvl.world === 4 && cats.length !== 2) warn.push('dunya 4 iki kedi bekler, ' + cats.length + ' var');

  var g = lvl.goal;
  if (!g || !isNum(g.x) || !isNum(g.y) || !isNum(g.w) || !isNum(g.h)) err.push('goal {x,y,w,h} eksik');
  else {
    if (g.w <= 0 || g.h <= 0) err.push('goal w/h pozitif olmali');
    if (!inWorld(g.x - g.w / 2, g.y - g.h / 2, 0) || !inWorld(g.x + g.w / 2, g.y + g.h / 2, 0)) {
      err.push('goal dunya disina tasiyor');
    }
  }

  if (lvl.fish !== null && lvl.fish !== undefined) {
    if (!isNum(lvl.fish.x) || !isNum(lvl.fish.y)) err.push('fish {x,y} gecersiz');
    else if (!inWorld(lvl.fish.x, lvl.fish.y, 0)) err.push('fish dunya disinda');
  } else if (lvl.fish === undefined) {
    err.push('fish alani zorunlu (obje ya da null)');
  }

  if (!Array.isArray(lvl.bodies) || lvl.bodies.length === 0) err.push('bodies bos olamaz');
  else {
    if (lvl.bodies.length > cfg.limits.maxBodies) {
      err.push('bodies ' + lvl.bodies.length + ' adet, tavan ' + cfg.limits.maxBodies);
    }
    for (var i = 0; i < lvl.bodies.length; i++) validateBody(lvl.bodies[i], i, err);
  }

  if (typeof lvl.hint !== 'string' || lvl.hint.trim() === '') err.push('hint bos olamaz');

  /* solution — Faz 4 dogrulamasinin dayanagi, her bolumde zorunlu */
  var cost = 0;
  if (!Array.isArray(lvl.solution) || lvl.solution.length === 0) {
    err.push('solution zorunlu ve bos olamaz');
  } else {
    if (isInt(lvl.maxStrokes) && lvl.solution.length > lvl.maxStrokes) {
      err.push('solution ' + lvl.solution.length + ' stroke, maxStrokes ' + lvl.maxStrokes);
    }
    for (var s = 0; s < lvl.solution.length; s++) {
      var stroke = lvl.solution[s];
      var tag = 'solution[' + s + ']';
      if (!Array.isArray(stroke) || stroke.length < 2) { err.push(tag + ': en az 2 nokta'); continue; }
      var bad = false;
      for (var k = 0; k < stroke.length; k++) {
        if (!isPoint(stroke[k])) { err.push(tag + '[' + k + '] gecersiz nokta'); bad = true; break; }
        if (!inWorld(stroke[k][0], stroke[k][1], 0)) { err.push(tag + '[' + k + '] dunya disinda'); bad = true; break; }
      }
      if (bad) continue;
      var len = m2.polylineLength(stroke);
      if (len < cfg.ink.minLength) {
        err.push(tag + ' uzunlugu ' + len.toFixed(3) + ' < minLength ' + cfg.ink.minLength);
      }
      cost += len;
    }
  }

  return { ok: err.length === 0, errors: err, warnings: warn, solutionCost: cost };
}

/* Kedi listesi: sema tek "cat" tanimlar, dunya 4 icin "cat2" opsiyonel eklentidir. */
function catsOf(lvl) {
  var out = [];
  if (Array.isArray(lvl.cats)) return lvl.cats.slice();
  if (lvl.cat) out.push(lvl.cat);
  if (lvl.cat2) out.push(lvl.cat2);
  return out;
}

/* Calisma zamani icin duzlestirilmis, varsayilanlari doldurulmus kopya. */
function normalize(lvl) {
  var out = {
    id: lvl.id,
    world: lvl.world,
    ink: lvl.ink,
    maxStrokes: lvl.maxStrokes,
    star2Ink: lvl.star2Ink,
    timeLimit: lvl.timeLimit,
    cats: catsOf(lvl).map(function (c) { return { x: c.x, y: c.y }; }),
    goal: { x: lvl.goal.x, y: lvl.goal.y, w: lvl.goal.w, h: lvl.goal.h },
    fish: lvl.fish ? { x: lvl.fish.x, y: lvl.fish.y } : null,
    bodies: [],
    hint: lvl.hint,
    solution: lvl.solution,
    palette: cfg.paletteFor(lvl.world)
  };
  for (var i = 0; i < lvl.bodies.length; i++) {
    var b = lvl.bodies[i];
    var nb = {
      type: b.type, shape: b.shape,
      x: b.x, y: b.y, angle: b.angle || 0,
      mat: b.mat || defaultMat(b),
      kind: b.kind || null,
      w: b.w, h: b.h, r: b.r,
      points: b.points || null,
      pivot: b.pivot || null,
      path: b.path || null,
      speed: isFinite(b.speed) ? b.speed : 0
    };
    out.bodies.push(nb);
  }
  return out;
}

function defaultMat(b) {
  if (b.type === 'hazard') return b.kind === 'water' ? 'ice' : 'metal';
  if (b.type === 'motor') return 'metal';
  if (b.type === 'platform') return 'metal';
  return 'stone';
}

function validateAll(levels) {
  var results = [];
  var seen = {};
  for (var i = 0; i < levels.length; i++) {
    var r = validateLevel(levels[i]);
    var id = levels[i] && levels[i].id;
    if (seen[id]) r.errors.push('id tekrar ediyor: ' + id), r.ok = false;
    seen[id] = true;
    r.id = id;
    results.push(r);
  }
  return results;
}

INK.schema = {
  BODY_TYPES: BODY_TYPES, SHAPES: SHAPES,
  HAZARD_KINDS: HAZARD_KINDS, MOTOR_KINDS: MOTOR_KINDS,
  validateLevel: validateLevel,
  validateAll: validateAll,
  normalize: normalize,
  catsOf: catsOf
};

})(typeof globalThis !== 'undefined'
    ? (globalThis.INK = globalThis.INK || {})
    : (this.INK = this.INK || {}));
