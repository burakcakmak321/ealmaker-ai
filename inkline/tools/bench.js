/* Fizik butcesi olcumu: adim maliyeti + ana dongudeki alokasyon.
   Alokasyon raporu icin: node --expose-gc tools/bench.js */
const { loadAll } = require('./load');
const INK = loadAll();

function scene(active) {
  const w = new INK.World({ dev: false });
  const ground = new INK.Body('static', 4.5, 0.4);
  ground.addShape(INK.Polygon.box(9, 0.8, 0, 0, 0, 'stone'));
  ground.finalize(); w.addBody(ground);

  /* tipik bir bolumun ust siniri: 20 dinamik parca + 10 murekkep cizgisi + kedi */
  for (let i = 0; i < 20; i++) {
    const b = new INK.Body('dynamic', 1 + (i % 7), 3 + i * 0.4, (i % 5) * 0.3);
    b.addShape(INK.Polygon.box(0.5, 0.25, 0, 0, 0, 'wood'));
    b.finalize();
    if (active) b.allowSleep = false;
    w.addBody(b);
  }
  for (let k = 0; k < 10; k++) {
    const line = new INK.Body('dynamic', 1 + k * 0.7, 8 + k * 0.5, 0);
    for (let i = 0; i < 8; i++) {
      line.addShape(INK.Polygon.box(0.3, INK.config.ink.thickness, i * 0.3, 0, 0.1, 'ink'));
    }
    line.finalize();
    if (active) line.allowSleep = false;
    w.addBody(line);
  }
  const cat = new INK.Body('dynamic', 4.5, 14);
  cat.addShape(new INK.Circle(INK.config.cat.radius, 0, 0, 'cat'));
  cat.finalize();
  cat.rollingResistance = INK.config.cat.rollingResistance;
  cat.angularDamping = INK.config.cat.angularDamping;
  w.addBody(cat);
  return w;
}

const N = 20000;
let worstAlloc = 0;

function measure(label, active) {
  const w = scene(active);
  const shapes = w.bodies.reduce((n, b) => n + b.shapes.length, 0);
  for (let i = 0; i < 6000; i++) w.step(1 / 120);   // isinma: temas seti oturana kadar

  const t0 = process.hrtime.bigint();
  for (let i = 0; i < N; i++) w.step(1 / 120);
  const t1 = process.hrtime.bigint();
  const us = Number(t1 - t0) / 1000 / N;
  const frameMs = us * 2 / 1000;                     // 60 fps karesi = 2 substep

  let allocTxt = '(olcum icin --expose-gc)';
  if (global.gc) {
    global.gc(); global.gc(); global.gc();
    const m0 = process.memoryUsage().heapUsed;
    for (let i = 0; i < N; i++) w.step(1 / 120);
    const m1 = process.memoryUsage().heapUsed;
    const perStep = (m1 - m0) / N;
    if (perStep > worstAlloc) worstAlloc = perStep;
    allocTxt = perStep.toFixed(1).padStart(7) + ' bayt/adim';
  }
  console.log(label.padEnd(26) + w.bodies.length + ' body / ' + shapes + ' shape  |  ' +
    us.toFixed(1).padStart(6) + ' us/adim  |  ' + frameMs.toFixed(2).padStart(5) + ' ms/kare (%' +
    (frameMs / 16.7 * 100).toFixed(1) + ')  |  ' + allocTxt);
}

console.log('body tavani ' + INK.config.limits.maxBodies + ', hedef 16.7 ms/kare\n');
measure('gercekci (uyku acik)', false);
measure('en kotu (uyku kapali)', true);

if (global.gc) {
  if (worstAlloc > 64) {
    console.error('\n  ✗ ana dongu alokasyon uretiyor: ' + worstAlloc.toFixed(1) + ' bayt/adim');
    process.exitCode = 1;
  } else {
    console.log('\n  ✓ ana dongu pratik olarak alokasyonsuz');
  }
}
