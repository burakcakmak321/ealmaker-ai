/* Sabit timestep dongusu. Fizik dt sabit, render alpha ile interpolasyonlu.
   Duvar saati burada; fizik katmani zamani asla kendisi okumaz. */
(function (INK) {
'use strict';

function nowMs() {
  return (typeof performance !== 'undefined' && performance.now)
    ? performance.now() : Date.now();
}

/* opts: { step(dt), render(alpha, frameDt), dt, maxSubsteps, maxAccumulator } */
function Loop(opts) {
  var cfg = INK.config.time;
  this.step = opts.step;
  this.render = opts.render || null;
  this.dt = opts.dt || cfg.dt;
  this.maxSubsteps = opts.maxSubsteps || cfg.maxSubsteps;
  this.maxAccumulator = opts.maxAccumulator || cfg.maxAccumulator;
  this.accumulator = 0;
  this.lastMs = 0;
  this.running = false;
  this.frameId = 0;
  this.alpha = 0;
  this.fps = 60;
  this._fpsAccum = 0;
  this._fpsFrames = 0;
  this._now = opts.now || nowMs;
  var self = this;
  this._tick = function () { self._frame(); };
}

Loop.prototype.start = function () {
  if (this.running) return;
  this.running = true;
  this.lastMs = this._now();
  this.accumulator = 0;
  this._schedule();
};

Loop.prototype.stop = function () {
  this.running = false;
  if (this.frameId && typeof cancelAnimationFrame !== 'undefined') {
    cancelAnimationFrame(this.frameId);
  }
  this.frameId = 0;
};

/* Arka plandan donuste ileri sarmayi engeller: birikeni at, saati sifirla. */
Loop.prototype.resync = function () {
  this.lastMs = this._now();
  this.accumulator = 0;
};

Loop.prototype._schedule = function () {
  if (typeof requestAnimationFrame !== 'undefined') {
    this.frameId = requestAnimationFrame(this._tick);
  } else {
    this.frameId = setTimeout(this._tick, 16);
  }
};

Loop.prototype._frame = function () {
  if (!this.running) return;
  var t = this._now();
  var frameDt = (t - this.lastMs) / 1000;
  this.lastMs = t;
  if (!(frameDt >= 0)) frameDt = 0;              // saat geri gitti / NaN
  if (frameDt > this.maxAccumulator) frameDt = this.maxAccumulator;

  this.accumulator += frameDt;
  var steps = 0;
  while (this.accumulator >= this.dt && steps < this.maxSubsteps) {
    this.step(this.dt);
    this.accumulator -= this.dt;
    steps++;
  }
  /* Butce dolduysa kalani at; yoksa borc birikir ve oyun agirlasir. */
  if (steps === this.maxSubsteps && this.accumulator > this.dt) {
    this.accumulator = 0;
  }
  this.alpha = this.accumulator / this.dt;

  this._fpsAccum += frameDt;
  this._fpsFrames++;
  if (this._fpsAccum >= 0.5) {
    this.fps = this._fpsFrames / this._fpsAccum;
    this._fpsAccum = 0;
    this._fpsFrames = 0;
  }

  if (this.render) this.render(this.alpha, frameDt);
  this._schedule();
};

INK.Loop = Loop;
INK.nowMs = nowMs;

})(typeof globalThis !== 'undefined'
    ? (globalThis.INK = globalThis.INK || {})
    : (this.INK = this.INK || {}));
