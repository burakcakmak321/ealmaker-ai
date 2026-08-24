/* Node tarafinda kaynaklari tarayicidakiyle ayni sirada, ayni global uzerine yukler.
   verify.js canvas'a dokunmadan fizigi kosturabilsin diye render katmani ayriktir. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const manifest = require('./manifest');

const root = path.resolve(__dirname, '..');

function loadAll(list) {
  const sources = list || manifest.sources;
  for (const rel of sources) {
    const file = path.join(root, rel);
    if (!fs.existsSync(file)) throw new Error('kaynak yok: ' + rel);
    const code = fs.readFileSync(file, 'utf8');
    vm.runInThisContext(code, { filename: rel });
  }
  if (!globalThis.INK) throw new Error('INK global olusmadi');
  return globalThis.INK;
}

module.exports = { loadAll, root, manifest };
