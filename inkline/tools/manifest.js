/* Kaynak dosya sirasi — build.js, verify.js ve testler bunu paylasir.
   Tek dogruluk kaynagi: yeni modul eklendiginde sadece burasi guncellenir. */
module.exports = {
  sources: [
    'src/core/config.js',
    'src/core/rng.js',
    'src/core/math2d.js',
    'src/core/pool.js',
    'src/core/intmap.js',
    'src/core/loop.js',
    'src/physics/shapes.js',
    'src/physics/body.js',
    'src/physics/collision.js',
    'src/physics/solver.js',
    'src/physics/world.js',
    'src/game/schema.js',
    'src/game/levels.js'
  ],
  template: 'tools/template.html',
  output: 'dist/index.html'
};
