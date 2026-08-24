/* Kaynak dosya sirasi — build.js, verify.js ve testler bunu paylasir.
   Tek dogruluk kaynagi: yeni modul eklendiginde sadece burasi guncellenir. */
module.exports = {
  sources: [
    'src/core/config.js',
    'src/core/rng.js',
    'src/core/math2d.js',
    'src/core/pool.js',
    'src/core/loop.js',
    'src/game/schema.js',
    'src/game/levels.js'
  ],
  template: 'tools/template.html',
  output: 'dist/index.html'
};
