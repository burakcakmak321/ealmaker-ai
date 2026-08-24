/* Minik test kosucusu — bagimlilik yok. tests/*.test.js dosyalarini kosar.
   Faz 1'in fizik birim testleri de buraya baglanir. */
const fs = require('fs');
const path = require('path');
const { loadAll, root } = require('./load');

const INK = loadAll();

function approx(a, b, eps) {
  if (Math.abs(a - b) > (eps === undefined ? 1e-6 : eps)) {
    throw new Error('beklenen ~' + b + ', gelen ' + a);
  }
}
function ok(v, msg) { if (!v) throw new Error(msg || 'dogru olmasi bekleniyordu'); }
function equal(a, b, msg) {
  if (a !== b) throw new Error((msg || 'esitlik') + ': beklenen ' + b + ', gelen ' + a);
}
function throws(fn, msg) {
  let threw = false;
  try { fn(); } catch (e) { threw = true; }
  if (!threw) throw new Error(msg || 'hata firlatmasi bekleniyordu');
}
const assert = { approx, ok, equal, throws };

const dir = path.join(root, 'tests');
const files = fs.existsSync(dir)
  ? fs.readdirSync(dir).filter((f) => f.endsWith('.test.js')).sort()
  : [];

let pass = 0, fail = 0;
const failures = [];

for (const f of files) {
  const suite = require(path.join(dir, f));
  const name = f.replace('.test.js', '');
  for (const key of Object.keys(suite)) {
    try {
      suite[key](assert, INK);
      pass++;
    } catch (e) {
      fail++;
      failures.push(name + ' > ' + key + ': ' + e.message);
    }
  }
}

console.log(files.length + ' dosya, ' + (pass + fail) + ' test — ' + pass + ' gecti, ' + fail + ' kaldi');
if (failures.length) {
  failures.forEach((f) => console.log('  ✗ ' + f));
  process.exitCode = 1;
}
