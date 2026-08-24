/* file:// duman testi: dist/index.html'i gercek Chromium'da acar,
   INK yuklendi mi, konsolda hata/uyari var mi, boot hatasi var mi bakar.
   Kabul listesindeki "file:// altinda calisiyor" ve "konsolda tek hata yok"
   maddelerinin makine kontrolu. Tarayici yoksa atlar. */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { root } = require('./load');

function findBrowser() {
  if (process.env.INKLINE_CHROME && fs.existsSync(process.env.INKLINE_CHROME)) {
    return process.env.INKLINE_CHROME;
  }
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  if (!fs.existsSync(base)) return null;
  const candidates = [];
  for (const dir of fs.readdirSync(base)) {
    candidates.push(path.join(base, dir, 'chrome-linux', 'headless_shell'));
    candidates.push(path.join(base, dir, 'chrome-linux', 'chrome'));
  }
  return candidates.find((p) => fs.existsSync(p)) || null;
}

const browser = findBrowser();
const distPath = path.join(root, 'dist', 'index.html');
if (!fs.existsSync(distPath)) {
  console.error('dist/index.html yok — once "node tools/build.js"');
  process.exit(1);
}
if (!browser) {
  console.log('duman testi ATLANDI: Chromium bulunamadi (INKLINE_CHROME ile yol verilebilir)');
  process.exit(0);
}

/* Olcum probunu ekleyen gecici kopya — dist dosyasi kirletilmez */
const probe = `
<script>
(function(){
  var errs = [];
  var oe = console.error, ow = console.warn;
  console.error = function(){ errs.push('error: ' + [].join.call(arguments,' ')); oe.apply(console, arguments); };
  console.warn  = function(){ errs.push('warn: ' + [].join.call(arguments,' ')); ow.apply(console, arguments); };
  window.addEventListener('error', function(e){ errs.push('uncaught: ' + (e.message||e.error)); });
  window.addEventListener('unhandledrejection', function(e){ errs.push('rejection: ' + e.reason); });
  setTimeout(function(){
    var box = document.getElementById('boot-error');
    var status = (window.INK && INK.config) ? 'INK-OK v' + INK.config.version : 'INK-FAIL';
    var canvas = document.getElementById('game');
    var el = document.createElement('div');
    el.id = 'smoke';
    el.setAttribute('data-status', status);
    el.setAttribute('data-canvas', canvas ? canvas.width + 'x' + canvas.height : 'yok');
    el.setAttribute('data-boot-error', box && box.style.display === 'block' ? box.textContent : '');
    el.setAttribute('data-console', errs.join(' | '));
    document.body.appendChild(el);
  }, 300);
})();
</script>
`;
const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'inkline-smoke-')), 'index.html');
fs.writeFileSync(tmp, fs.readFileSync(distPath, 'utf8').replace('</body>', probe + '</body>'), 'utf8');

let dom = '';
try {
  dom = execFileSync(browser, [
    '--headless', '--disable-gpu', '--no-sandbox', '--allow-file-access-from-files',
    '--virtual-time-budget=2500', '--run-all-compositor-stages-before-draw',
    '--dump-dom', 'file://' + tmp
  ], { encoding: 'utf8', timeout: 60000, stdio: ['ignore', 'pipe', 'pipe'] });
} catch (e) {
  console.error('Chromium calistirilamadi: ' + e.message);
  process.exit(1);
}

function attr(name) {
  const m = dom.match(new RegExp('id="smoke"[^>]*' + name + '="([^"]*)"'));
  return m ? m[1] : null;
}
const status = attr('data-status');
const bootErr = attr('data-boot-error');
const consoleMsgs = attr('data-console');
const canvasSize = attr('data-canvas');

const problems = [];
if (status === null) problems.push('prob calismadi — sayfa yuklenmemis olabilir');
else if (status.indexOf('INK-OK') !== 0) problems.push('INK yuklenmedi: ' + status);
if (bootErr) problems.push('boot hatasi: ' + bootErr);
if (consoleMsgs) problems.push('konsol ciktisi: ' + consoleMsgs);
if (canvasSize === 'yok' || canvasSize === '0x0') problems.push('canvas olculenmedi: ' + canvasSize);

fs.rmSync(path.dirname(tmp), { recursive: true, force: true });

console.log('file:// duman testi — ' + (status || 'yanit yok') + ', canvas ' + canvasSize);
if (problems.length) {
  problems.forEach((p) => console.error('  ✗ ' + p));
  process.exitCode = 1;
} else {
  console.log('  ✓ hatasiz yuklendi, konsol temiz');
}
