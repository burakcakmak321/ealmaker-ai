/* Nesne havuzu. Ana dongude "new" yok kuralinin altyapisi. */
(function (INK) {
'use strict';

/* factory: yeni nesne uretir. reset(obj): geri verilirken temizler. */
function Pool(factory, reset, prealloc) {
  this.factory = factory;
  this.reset = reset || null;
  this.free = [];
  this.createdCount = 0;
  var n = prealloc || 0;
  for (var i = 0; i < n; i++) {
    this.free.push(factory());
    this.createdCount++;
  }
}
Pool.prototype.get = function () {
  if (this.free.length > 0) return this.free.pop();
  this.createdCount++;
  return this.factory();
};
Pool.prototype.release = function (obj) {
  if (this.reset) this.reset(obj);
  this.free.push(obj);
};
Pool.prototype.releaseAll = function (arr) {
  for (var i = 0; i < arr.length; i++) this.release(arr[i]);
  arr.length = 0;
};

/* Sabit kapasiteli, sikistirilmis aktif liste.
   Parcaciklar ve contact'lar icin: iterasyon sirasi deterministik. */
function Ring(factory, capacity, reset) {
  this.items = new Array(capacity);
  this.count = 0;
  this.capacity = capacity;
  this.reset = reset || null;
  for (var i = 0; i < capacity; i++) this.items[i] = factory();
}
/* Dolu ise null doner — sessizce buyumez, butce sabit kalir. */
Ring.prototype.spawn = function () {
  if (this.count >= this.capacity) return null;
  return this.items[this.count++];
};
/* index'teki ogeyi son aktif ogeyle takas ederek cikarir. */
Ring.prototype.removeAt = function (i) {
  var last = this.count - 1;
  if (i !== last) {
    var tmp = this.items[i];
    this.items[i] = this.items[last];
    this.items[last] = tmp;
  }
  this.count = last;
  if (this.reset) this.reset(this.items[last]);
};
Ring.prototype.clear = function () {
  if (this.reset) for (var i = 0; i < this.count; i++) this.reset(this.items[i]);
  this.count = 0;
};

INK.Pool = Pool;
INK.Ring = Ring;

})(typeof globalThis !== 'undefined'
    ? (globalThis.INK = globalThis.INK || {})
    : (this.INK = this.INK || {}));
