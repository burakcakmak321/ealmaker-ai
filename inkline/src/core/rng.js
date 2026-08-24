/* Seeded PRNG + determinizm hash'i. Fizik bu dosyayi yalnizca ASLA cagirmaz;
   burasi kozmetik efektler ve dogrulama araclari icindir. */
(function (INK) {
'use strict';

/* mulberry32 — 32 bit state, hizli, tekrarlanabilir */
function mulberry32(seed) {
  var a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    var t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Rng(seed) {
  this.next = mulberry32(seed);
}
Rng.prototype.float = function (lo, hi) { return lo + (hi - lo) * this.next(); };
Rng.prototype.int = function (lo, hi) { return lo + Math.floor(this.next() * (hi - lo + 1)); };
Rng.prototype.sign = function () { return this.next() < 0.5 ? -1 : 1; };
Rng.prototype.pick = function (arr) { return arr[Math.floor(this.next() * arr.length) % arr.length]; };

/* FNV-1a 32 bit, string icin */
function hashString(str) {
  var h = 0x811C9DC5;
  for (var i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/* Sayi dizisi hash'i — determinizm karsilastirmasi icin.
   Float64'un ham bitlerini karistirir, yani 1e-16 fark bile yakalanir. */
function Hasher() {
  this.h = 0x811C9DC5;
  this._buf = new ArrayBuffer(8);
  this._f64 = new Float64Array(this._buf);
  this._u32 = new Uint32Array(this._buf);
}
Hasher.prototype.number = function (v) {
  this._f64[0] = v;
  var h = this.h;
  h ^= this._u32[0]; h = Math.imul(h, 0x01000193);
  h ^= this._u32[1]; h = Math.imul(h, 0x01000193);
  this.h = h >>> 0;
  return this;
};
Hasher.prototype.int = function (v) {
  this.h = Math.imul(this.h ^ (v | 0), 0x01000193) >>> 0;
  return this;
};
Hasher.prototype.hex = function () {
  return ('00000000' + this.h.toString(16)).slice(-8);
};

INK.mulberry32 = mulberry32;
INK.Rng = Rng;
INK.hashString = hashString;
INK.Hasher = Hasher;

})(typeof globalThis !== 'undefined'
    ? (globalThis.INK = globalThis.INK || {})
    : (this.INK = this.INK || {}));
