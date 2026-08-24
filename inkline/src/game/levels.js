/* Bolum verisi. Elle tasarlanir, prosedurel uretim yok.
   Faz 0: sema capasi + Faz 2 test bolumu (Bolum 1). Faz 4'te 50'ye tamamlanir. */
(function (INK) {
'use strict';

var levels = [
  {
    id: 1,
    world: 1,
    ink: 5.0,
    maxStrokes: 3,
    star2Ink: 0.6,          // butcenin %60'i: 3.0 birim
    timeLimit: 30,
    cat: { x: 0.9, y: 13.1 },
    goal: { x: 7.35, y: 5.45, w: 2.7, h: 1.2 },   // cati duzlugu, x 6.0..8.7
    fish: { x: 4.6, y: 9.4 },
    bodies: [
      /* zemin — dusen kedi olmez, sadece hedefe ulasamaz */
      { type: 'static', shape: 'box', x: 4.5, y: 0.4,  w: 9.0, h: 0.8, angle: 0, mat: 'stone' },
      /* baslangic cikintisi */
      { type: 'static', shape: 'box', x: 0.8, y: 12.4, w: 1.6, h: 0.4, angle: 0, mat: 'stone' },
      /* hedef catisi */
      { type: 'static', shape: 'box', x: 6.2, y: 4.6,  w: 5.6, h: 0.5, angle: 0, mat: 'stone' },
      /* sag omuzluk: kedi catinin sagindan dusmesin */
      { type: 'static', shape: 'box', x: 8.85, y: 5.5, w: 0.3, h: 1.8, angle: 0, mat: 'stone' },
      /* dekoratif baca — cizime engel, rota daraltir */
      { type: 'static', shape: 'box', x: 3.6, y: 5.6,  w: 0.5, h: 1.5, angle: 0, mat: 'stone' }
    ],
    hint: 'Bir rampa ciz, kediyi saga savur.',
    solution: [ [[1.3, 12.5], [3.2, 11.4]] ]
  }
];

INK.levels = levels;
INK.levelById = function (id) {
  for (var i = 0; i < levels.length; i++) if (levels[i].id === id) return levels[i];
  return null;
};

})(typeof globalThis !== 'undefined'
    ? (globalThis.INK = globalThis.INK || {})
    : (this.INK = this.INK || {}));
