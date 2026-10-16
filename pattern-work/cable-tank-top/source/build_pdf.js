// Render pattern.html to the output PDF with Chromium (Playwright).
// Usage: node build_pdf.js
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const src = path.join(__dirname, 'pattern.html');
  const out = path.join(__dirname, '..', 'output', 'Cable_Tank_Top_M_L_EN.pdf');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file://' + src, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({
    path: out,
    preferCSSPageSize: true,   // page sizes, margins and footer come from style.css (@page)
    printBackground: true,
  });
  await browser.close();
  console.log('Written', out);
})();
