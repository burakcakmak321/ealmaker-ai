/* Tek dosya derleyici: kaynaklari sirayla template icine inline eder.
   Bundler yok, bagimlilik yok. Ciktiyi teslim kurallarina karsi denetler. */
const fs = require('fs');
const path = require('path');
const manifest = require('./manifest');

const root = path.resolve(__dirname, '..');
const MARK = '/*__INKLINE_SOURCES__*/';

function build() {
  const templatePath = path.join(root, manifest.template);
  const template = fs.readFileSync(templatePath, 'utf8');
  if (!template.includes(MARK)) throw new Error('template icinde ' + MARK + ' yok');

  const parts = [];
  for (const rel of manifest.sources) {
    const file = path.join(root, rel);
    if (!fs.existsSync(file)) throw new Error('kaynak yok: ' + rel);
    parts.push('/* ===== ' + rel + ' ===== */\n' + fs.readFileSync(file, 'utf8').trim());
  }
  const bundle = parts.join('\n\n');
  const html = template.replace(MARK, () => bundle);

  const problems = audit(html);
  const outPath = path.join(root, manifest.output);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html, 'utf8');

  const kb = (Buffer.byteLength(html, 'utf8') / 1024).toFixed(1);
  console.log('dist/index.html yazildi — ' + kb + ' KB, ' + manifest.sources.length + ' modul');
  if (problems.length) {
    console.error('\nTESLIM KURALI IHLALI:');
    problems.forEach((p) => console.error('  ✗ ' + p));
    process.exitCode = 1;
  } else {
    console.log('denetim: harici bagimlilik yok, module/fetch yok — temiz');
  }
  return { html, problems };
}

/* Faz 6 kabul listesinin makine tarafindan kontrol edilebilen kismi */
function audit(html) {
  const bad = [];
  const rules = [
    [/type\s*=\s*["']module["']/i, 'type="module" var (file:// altinda CORS hatasi)'],
    [/\bfetch\s*\(/, 'fetch( cagrisi var'],
    [/XMLHttpRequest/, 'XMLHttpRequest var'],
    [/<link\b/i, '<link> etiketi var'],
    [/<script[^>]*\ssrc\s*=/i, 'harici <script src> var'],
    [/https?:\/\/(?!www\.w3\.org)/i, 'harici URL var'],
    [/^\s*(import|export)\s/m, 'ES modul ifadesi var'],
    [/url\(\s*["']?(?!data:)[^)"']*\.(png|jpg|jpeg|gif|svg|woff2?|mp3|ogg|wav)/i, 'harici varlik referansi var']
  ];
  for (const [re, msg] of rules) if (re.test(html)) bad.push(msg);
  return bad;
}

if (require.main === module) build();
module.exports = { build, audit };
