/* Teslim oncesi zorunlu dogrulama. Canvas gerektirmez, Node'da kosar.
   Spec 12. bolumdeki bes kontrol + bolum sayisi kapsamasi.
   Fizige dayanan kontroller motor yuklendiginde otomatik devreye girer;
   yuklu degilse ATLANDI olarak raporlanir ve teslim hazir sayilmaz. */
const { loadAll } = require('./load');

const INK = loadAll();
const cfg = INK.config;
const levels = INK.levels || [];
const TOTAL_LEVELS = 50;
const STEPS_DETERMINISM = 600;

const results = [];
function record(name, status, detail) { results.push({ name, status, detail }); }

/* ---------- 5. Sema dogrulama ---------- */
function checkSchema() {
  const rows = INK.schema.validateAll(levels);
  const failed = rows.filter((r) => !r.ok);
  const warnings = rows.reduce((n, r) => n + r.warnings.length, 0);
  if (failed.length) {
    failed.slice(0, 10).forEach((r) => {
      console.log('  Bolum ' + r.id + ':');
      r.errors.slice(0, 6).forEach((e) => console.log('    ✗ ' + e));
    });
    record('5. Sema', 'BASARISIZ', failed.length + ' bolum semaya uymuyor');
    return null;
  }
  rows.forEach((r) => r.warnings.forEach((w) => console.log('  ! Bolum ' + r.id + ': ' + w)));
  record('5. Sema', 'GECTI', levels.length + ' bolum semaya uyuyor' +
    (warnings ? ', ' + warnings + ' uyari' : ''));
  return rows;
}

/* ---------- 4. Butce tutarliligi ---------- */
function checkBudget(rows) {
  if (!rows) { record('4. Butce', 'ATLANDI', 'sema gecmeden olculemez'); return; }
  const bad = [];
  rows.forEach((r, i) => {
    const lvl = levels[i];
    const cost = r.solutionCost;
    if (!(cost < lvl.ink)) {
      bad.push('Bolum ' + lvl.id + ': solution ' + cost.toFixed(2) + ' >= ink ' + lvl.ink);
    }
    const star2Budget = lvl.ink * lvl.star2Ink;
    if (cost > star2Budget) {
      bad.push('Bolum ' + lvl.id + ': star2 ulasilmaz — referans cozum ' + cost.toFixed(2) +
        ' > esik ' + star2Budget.toFixed(2));
    }
  });
  if (bad.length) {
    bad.slice(0, 10).forEach((b) => console.log('    ✗ ' + b));
    record('4. Butce', 'BASARISIZ', bad.length + ' ihlal');
  } else {
    record('4. Butce', 'GECTI', 'her cozum ink altinda ve star2 esigine sigiyor');
  }
}

/* ---------- 1-3. Simulasyona dayanan kontroller ---------- */
function simAvailable() {
  return !!(INK.Sim && typeof INK.Sim.runSolution === 'function');
}

function checkSolvable() {
  const bad = [];
  for (const lvl of levels) {
    const out = INK.Sim.runSolution(lvl, { seed: lvl.id });
    if (!out.win) bad.push('Bolum ' + lvl.id + ': cozum kazanmiyor (' + out.reason + ')');
  }
  if (bad.length) {
    bad.slice(0, 10).forEach((b) => console.log('    ✗ ' + b));
    record('1. Cozulebilirlik', 'BASARISIZ', bad.length + '/' + levels.length + ' bolum kirik');
  } else {
    record('1. Cozulebilirlik', 'GECTI', levels.length + ' bolum cozumuyle kazaniyor');
  }
}

function checkDeterminism() {
  const bad = [];
  for (const lvl of levels) {
    const a = INK.Sim.runSolution(lvl, { seed: lvl.id, maxSteps: STEPS_DETERMINISM, hash: true });
    const b = INK.Sim.runSolution(lvl, { seed: lvl.id, maxSteps: STEPS_DETERMINISM, hash: true });
    if (a.hash !== b.hash) bad.push('Bolum ' + lvl.id + ': ' + a.hash + ' != ' + b.hash);
  }
  if (bad.length) {
    bad.slice(0, 10).forEach((b) => console.log('    ✗ ' + b));
    record('2. Determinizm', 'BASARISIZ', bad.length + ' bolumde sapma');
  } else {
    record('2. Determinizm', 'GECTI', STEPS_DETERMINISM + ' adim sonrasi hash birebir ayni');
  }
}

function checkNaN() {
  const bad = [];
  for (const lvl of levels) {
    const out = INK.Sim.runSolution(lvl, { seed: lvl.id, guardNaN: true });
    if (out.nanStep >= 0) bad.push('Bolum ' + lvl.id + ': adim ' + out.nanStep + ' (' + out.nanWhere + ')');
  }
  if (bad.length) {
    bad.slice(0, 10).forEach((b) => console.log('    ✗ ' + b));
    record('3. NaN taramasi', 'BASARISIZ', bad.length + ' bolumde NaN/Infinity');
  } else {
    record('3. NaN taramasi', 'GECTI', 'hicbir adimda NaN/Infinity yok');
  }
}

/* ---------- kosum ---------- */
console.log('Inkline dogrulama — v' + cfg.version + ', ' + levels.length + '/' + TOTAL_LEVELS + ' bolum tanimli\n');

const rows = checkSchema();
checkBudget(rows);

if (simAvailable()) {
  checkSolvable();
  checkDeterminism();
  checkNaN();
} else {
  const why = 'INK.Sim yok — fizik motoru Faz 1, kosucu Faz 2';
  record('1. Cozulebilirlik', 'ATLANDI', why);
  record('2. Determinizm', 'ATLANDI', why);
  record('3. NaN taramasi', 'ATLANDI', why);
}

const coverage = levels.length === TOTAL_LEVELS;
record('6. Kapsama', coverage ? 'GECTI' : 'EKSIK', levels.length + '/' + TOTAL_LEVELS + ' bolum');

/* ---------- ozet tablo ---------- */
const wName = Math.max(...results.map((r) => r.name.length), 8);
const wStat = Math.max(...results.map((r) => r.status.length), 6);
const line = '─'.repeat(wName + wStat + 40);
console.log('\n' + line);
console.log(pad('KONTROL', wName) + '  ' + pad('DURUM', wStat) + '  DETAY');
console.log(line);
for (const r of results) {
  const mark = r.status === 'GECTI' ? '✓' : (r.status === 'BASARISIZ' ? '✗' : '·');
  console.log(pad(r.name, wName) + '  ' + pad(mark + ' ' + r.status, wStat) + '  ' + r.detail);
}
console.log(line);

const failed = results.filter((r) => r.status === 'BASARISIZ');
const pending = results.filter((r) => r.status === 'ATLANDI' || r.status === 'EKSIK');
const ready = failed.length === 0 && pending.length === 0;
console.log('TESLIME HAZIR: ' + (ready ? 'EVET' : 'HAYIR' +
  (failed.length ? ' — ' + failed.length + ' kontrol basarisiz' : '') +
  (pending.length ? ' — ' + pending.length + ' kontrol bekliyor' : '')));

function pad(s, n) { return s + ' '.repeat(Math.max(0, n - s.length)); }

process.exitCode = failed.length ? 1 : 0;
