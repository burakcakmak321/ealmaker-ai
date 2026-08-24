/* Faz 0 cekirdek testleri: determinizm araclari, matematik, havuz, dongu tavani. */
module.exports = {
  'rng ayni tohumla ayni diziyi verir': function (t, INK) {
    const a = new INK.Rng(1234), b = new INK.Rng(1234);
    for (let i = 0; i < 100; i++) t.equal(a.next(), b.next(), 'adim ' + i);
  },

  'rng farkli tohumla farkli dizi verir': function (t, INK) {
    const a = new INK.Rng(1), b = new INK.Rng(2);
    let same = 0;
    for (let i = 0; i < 50; i++) if (a.next() === b.next()) same++;
    t.ok(same < 5, 'tohumlar ayrismali');
  },

  'hasher en kucuk float farkini yakalar': function (t, INK) {
    const h1 = new INK.Hasher().number(1).number(2).hex();
    const h2 = new INK.Hasher().number(1).number(2).hex();
    const h3 = new INK.Hasher().number(1).number(2 + 2 * Number.EPSILON).hex(); // 2'nin ULP'si
    t.equal(h1, h2, 'ayni girdi ayni hash');
    t.ok(h1 !== h3, 'epsilon farki hash degistirmeli');
  },

  'transform ve invTransform birbirini goturur': function (t, INK) {
    const rot = new INK.Rot(0.7), pos = { x: 3, y: -1.5 };
    const local = { x: 0.4, y: 2.1 }, world = { x: 0, y: 0 }, back = { x: 0, y: 0 };
    INK.m2.transform(world, rot, pos, local);
    INK.m2.invTransform(back, rot, pos, world);
    t.approx(back.x, local.x);
    t.approx(back.y, local.y);
  },

  'clampLen hiz kirpmasini uygular': function (t, INK) {
    const v = { x: 300, y: 400 }, out = { x: 0, y: 0 };
    INK.V2.clampLen(out, v, 200);
    t.approx(INK.V2.len(out), 200, 1e-9);
    INK.V2.clampLen(out, { x: 3, y: 4 }, 200);
    t.approx(INK.V2.len(out), 5, 1e-9);
  },

  'polylineLength murekkep maliyetini olcer': function (t, INK) {
    t.approx(INK.m2.polylineLength([[0, 0], [3, 4]]), 5);
    t.approx(INK.m2.polylineLength([[0, 0], [0, 0]]), 0);
    t.approx(INK.m2.polylineLength([[1, 1]]), 0);
  },

  'pointSegmentDist ucbirimlerde dogru': function (t, INK) {
    t.approx(INK.m2.pointSegmentDist(0, 1, -1, 0, 1, 0), 1);
    t.approx(INK.m2.pointSegmentDist(3, 0, -1, 0, 1, 0), 2);
    t.approx(INK.m2.pointSegmentDist(0, 0, 2, 2, 2, 2), Math.sqrt(8), 1e-9);
  },

  'segmentsIntersect kesisim ve ayriklik': function (t, INK) {
    t.ok(INK.m2.segmentsIntersect(0, 0, 2, 2, 0, 2, 2, 0), 'X kesismeli');
    t.ok(!INK.m2.segmentsIntersect(0, 0, 1, 0, 0, 1, 1, 1), 'paralel kesismemeli');
    t.ok(INK.m2.segmentsIntersect(0, 0, 2, 0, 1, 0, 1, 1), 'T temasi kesisim sayilir');
  },

  'Ring kapasiteyi asmaz ve sirasi belirli': function (t, INK) {
    const r = new INK.Ring(function () { return { v: 0 }; }, 3);
    r.spawn().v = 1; r.spawn().v = 2; r.spawn().v = 3;
    t.equal(r.spawn(), null, 'kapasite doldu');
    r.removeAt(1);
    t.equal(r.count, 2);
    t.equal(r.items[0].v, 1);
    t.equal(r.items[1].v, 3, 'son oge takas edilir');
  },

  'Pool nesneyi geri kullanir': function (t, INK) {
    const p = new INK.Pool(function () { return { v: 0 }; }, function (o) { o.v = 0; }, 2);
    const a = p.get(); a.v = 9;
    p.release(a);
    const b = p.get();
    t.equal(b, a, 'ayni nesne dondu');
    t.equal(b.v, 0, 'reset calisti');
    t.equal(p.createdCount, 2, 'ekstra alokasyon yok');
  },

  'dongu donma sonrasi ileri sarmaz': function (t, INK) {
    let clock = 0, steps = 0;
    const loop = new INK.Loop({ step: function () { steps++; }, now: function () { return clock; } });
    loop.running = true; loop.lastMs = 0;
    loop._schedule = function () {};       // Node'da zamanlayici kurma
    clock = 1000;                          // 1 saniyelik donma
    loop._frame();
    t.equal(steps, INK.config.time.maxSubsteps, 'kare basina adim tavani');
    t.equal(loop.accumulator, 0, 'birikmis borc atilir');
  },

  'dongu normal karede iki adim atar': function (t, INK) {
    let clock = 0, steps = 0;
    const loop = new INK.Loop({ step: function () { steps++; }, now: function () { return clock; } });
    loop.running = true; loop.lastMs = 0;
    loop._schedule = function () {};
    clock = 16.6667;                       // 60 fps karesi, dt = 1/120
    loop._frame();
    t.equal(steps, 2, '60 fps -> 2 substep');
  },

  'config paleti ve materyali cozumler': function (t, INK) {
    t.equal(INK.config.paletteFor(5).name, 'Laboratuvar');
    t.equal(INK.config.paletteFor(99).id, 1, 'bilinmeyen dunya -> D1');
    t.equal(INK.config.material('yok').friction, INK.config.materials.stone.friction);
  }
};
