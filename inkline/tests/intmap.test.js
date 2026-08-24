/* IntMap: Map yerine gecen alokasyonsuz tablo. Davranisi Map ile ayni olmali. */
module.exports = {
  'temel set/get/delete': function (t, INK) {
    var m = new INK.IntMap(8);
    t.equal(m.get(42), undefined);
    m.set(42, 'a');
    t.equal(m.get(42), 'a');
    t.equal(m.size, 1);
    m.set(42, 'b');
    t.equal(m.get(42), 'b', 'ustune yazma');
    t.equal(m.size, 1);
    t.equal(m.delete(42), true);
    t.equal(m.get(42), undefined);
    t.equal(m.size, 0);
    t.equal(m.delete(42), false);
  },

  'mezar tasindan sonra arama zinciri kirilmiyor': function (t, INK) {
    var m = new INK.IntMap(8);
    for (var i = 1; i <= 6; i++) m.set(i * 4096 + 1, i);
    m.delete(2 * 4096 + 1);
    for (var j = 1; j <= 6; j++) {
      if (j === 2) t.equal(m.get(j * 4096 + 1), undefined);
      else t.equal(m.get(j * 4096 + 1), j, 'anahtar ' + j + ' kayboldu');
    }
  },

  'buyume tum girisleri koruyor': function (t, INK) {
    var m = new INK.IntMap(8);
    var n = 500;
    for (var i = 1; i <= n; i++) m.set(i * 4096 + (i % 4096), i);
    t.equal(m.size, n);
    for (var j = 1; j <= n; j++) t.equal(m.get(j * 4096 + (j % 4096)), j, 'anahtar ' + j);
  },

  'ekle-sil dongusu kapasiteyi sisirmiyor': function (t, INK) {
    var m = new INK.IntMap(64);
    var cap0 = m.mask + 1;
    for (var round = 0; round < 2000; round++) {
      for (var i = 0; i < 20; i++) m.set(4096 + i, round);
      for (var j = 0; j < 20; j++) m.delete(4096 + j);
    }
    t.equal(m.size, 0);
    t.ok(m.mask + 1 <= cap0 * 4, 'tablo mezar taslariyla siserek buyudu: ' + (m.mask + 1));
  },

  'clear her seyi siliyor': function (t, INK) {
    var m = new INK.IntMap(16);
    for (var i = 1; i <= 10; i++) m.set(i * 7, i);
    m.clear();
    t.equal(m.size, 0);
    t.equal(m.get(7), undefined);
    var seen = 0;
    m.forEach(function () { seen++; });
    t.equal(seen, 0);
  },

  'forEach tum girisleri veriyor': function (t, INK) {
    var m = new INK.IntMap(16);
    var expected = 0;
    for (var i = 1; i <= 25; i++) { m.set(i * 4096, i); expected += i; }
    var sum = 0;
    m.forEach(function (v) { sum += v; });
    t.equal(sum, expected);
  }
};
