/* Tamsayi anahtarli acik adresleme tablosu.
   Map yerine bunu kullaniyoruz: set/delete adim basina cop uretmiyor
   (V8'de Map girisleri her eklemede nesne ayirir). Anahtarlar pozitif. */
(function (INK) {
'use strict';

var EMPTY = 0;
var TOMB = -1;

function IntMap(capacity) {
  var cap = 8;
  while (cap < (capacity || 16) * 2) cap <<= 1;
  this.keys = new Int32Array(cap);
  this.vals = new Array(cap);
  for (var i = 0; i < cap; i++) this.vals[i] = null;
  this.mask = cap - 1;
  this.size = 0;
  this.used = 0;              // dolu + mezar tasi
}

/* Knuth carpimsal karistirma; anahtarlarimiz gidA*4096+gidB, dagilim iyi */
IntMap.prototype._slot = function (key) {
  return (Math.imul(key, 2654435761) >>> 0) & this.mask;
};

IntMap.prototype.get = function (key) {
  var i = this._slot(key);
  var keys = this.keys;
  while (true) {
    var k = keys[i];
    if (k === key) return this.vals[i];
    if (k === EMPTY) return undefined;
    i = (i + 1) & this.mask;
  }
};

IntMap.prototype.set = function (key, val) {
  if ((this.used + 1) * 3 > (this.mask + 1) * 2) this._grow();
  var i = this._slot(key);
  var keys = this.keys;
  var firstTomb = -1;
  while (true) {
    var k = keys[i];
    if (k === key) { this.vals[i] = val; return; }
    if (k === TOMB && firstTomb < 0) firstTomb = i;
    if (k === EMPTY) {
      if (firstTomb >= 0) i = firstTomb; else this.used++;
      keys[i] = key; this.vals[i] = val; this.size++;
      return;
    }
    i = (i + 1) & this.mask;
  }
};

IntMap.prototype.delete = function (key) {
  var i = this._slot(key);
  var keys = this.keys;
  while (true) {
    var k = keys[i];
    if (k === key) {
      keys[i] = TOMB; this.vals[i] = null; this.size--;
      return true;
    }
    if (k === EMPTY) return false;
    i = (i + 1) & this.mask;
  }
};

IntMap.prototype.clear = function () {
  this.keys.fill(EMPTY);
  for (var i = 0; i < this.vals.length; i++) this.vals[i] = null;
  this.size = 0;
  this.used = 0;
};

/* Slot sirasinda iterasyon — simulasyon sonucunu etkileyen hicbir yerde
   kullanilmaz, yalnizca toplu temizlik icin. */
IntMap.prototype.forEach = function (fn) {
  for (var i = 0; i <= this.mask; i++) {
    var k = this.keys[i];
    if (k !== EMPTY && k !== TOMB) fn(this.vals[i], k);
  }
};

IntMap.prototype._grow = function () {
  var oldKeys = this.keys, oldVals = this.vals;
  var cap = (this.mask + 1) * 2;
  this.keys = new Int32Array(cap);
  this.vals = new Array(cap);
  for (var i = 0; i < cap; i++) this.vals[i] = null;
  this.mask = cap - 1;
  this.size = 0;
  this.used = 0;
  for (var j = 0; j < oldKeys.length; j++) {
    var k = oldKeys[j];
    if (k !== EMPTY && k !== TOMB) this.set(k, oldVals[j]);
  }
};

INK.IntMap = IntMap;

})(typeof globalThis !== 'undefined'
    ? (globalThis.INK = globalThis.INK || {})
    : (this.INK = this.INK || {}));
