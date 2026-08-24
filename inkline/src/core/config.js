/* Inkline — tum sabitler, materyaller ve paletler. Tek kaynak. */
(function (INK) {
'use strict';

var WORLD_W = 9;
var WORLD_H = 16;

var config = {
  version: '0.1.0',

  /* --- Dunya --- */
  world: {
    width: WORLD_W,          // birim (metre)
    height: WORLD_H,
    aspect: WORLD_W / WORLD_H,
    gravity: -20,            // birim/s^2, y yukari pozitif
    killMargin: 2            // sinirlarin 2 birim disina cikinca olum
  },

  /* --- Zamanlama --- */
  time: {
    dt: 1 / 120,             // sabit fizik adimi
    maxSubsteps: 4,          // kare basina en fazla 4 adim
    maxAccumulator: 0.25,    // spiral of death korumasi
    defaultTimeLimit: 30     // saniye
  },

  /* --- Cozucu --- */
  solver: {
    velocityIterations: 8,
    positionIterations: 3,
    baumgarte: 0.2,
    penetrationSlop: 0.01,
    maxCorrection: 0.2,      // pozisyon duzeltmesi tavani, birim/adim
    restitutionSlop: 1.0,    // bu goreli hizin altinda restitution = 0
    warmStarting: true
  },

  /* --- Kararlilik --- */
  limits: {
    maxLinearVelocity: 200,  // birim/s
    maxAngularVelocity: 30,  // rad/s
    maxBodies: 150,
    maxContactsPerPair: 2
  },
  sleep: {
    linearThreshold: 0.05,
    angularThreshold: 0.05,
    timeToSleep: 0.5
  },

  /* --- Broadphase ---
     Spec "~64 birim hucre" diyor; bu piksel olcegi bir rakam. 9x16 birimlik
     dunyada anlamli karsiligi ~1 birim (referans portre ende ~64 px). */
  broadphase: {
    cellSize: 1.0,
    maxCells: 4096
  },

  /* --- Cizim / murekkep --- */
  ink: {
    thickness: 0.14,         // birim, segment kalinligi
    density: 1.0,
    minLength: 0.3,          // bundan kisa stroke reddedilir
    sampleDistance: 0.04,    // ham nokta ornekleme esigi
    maxPoints: 120,          // stroke basina
    simplifyEpsilon: 0.05,   // Ramer-Douglas-Peucker
    chaikinPasses: 2,
    undoDepth: 1,            // sadece son cizgi, simulasyon baslamadan once
    dryTime: 0.5             // saniye, yas -> mat gecisi
  },

  /* --- Kedi --- */
  cat: {
    radius: 0.28,
    density: 2.2,            // ~0.54 kutle; 1 birimlik cizgi ~0.14 kutle
    friction: 0.6,
    restitution: 0.05,
    /* Cember cisim surtunmeyle durmaz: yuvarlanma sonsuza kadar surer.
       Kazanma kosulu |v| < 0.5 istedigi icin kedi sonunda durabilmeli. */
    linearDamping: 0.05,
    angularDamping: 1.2,
    rollingResistance: 0.30,
    goalSpeed: 0.5,          // |v| bu esigin altinda olmali
    goalHold: 0.4,           // saniye, kesintisiz
    hardImpact: 12           // birim/s, ustunde sarsinti + toz
  },

  /* --- Sonumleme varsayilanlari (dynamic body'ler icin) --- */
  damping: {
    linear: 0.0,
    angular: 0.02
  },

  /* --- Malzemeler: friction / restitution / density --- */
  materials: {
    stone:  { friction: 0.60, restitution: 0.02, density: 2.6 },
    wood:   { friction: 0.45, restitution: 0.10, density: 0.8 },
    metal:  { friction: 0.30, restitution: 0.15, density: 4.0 },
    ice:    { friction: 0.04, restitution: 0.02, density: 0.9 },
    rubber: { friction: 0.90, restitution: 0.55, density: 1.2 },
    glass:  { friction: 0.20, restitution: 0.05, density: 2.4 },
    ink:    { friction: 0.55, restitution: 0.05, density: 1.0 },
    cat:    { friction: 0.60, restitution: 0.05, density: 2.2 }
  },

  /* --- Oyun kurallari --- */
  rules: {
    restartMs: 200,          // olum -> yeniden baslama
    winSequenceMs: 1200,     // yildiz acilis animasyonu, atlanabilir
    stuckCheckDelay: 1.0     // murekkep bitti + her sey uyudu -> "sikistin"
  },

  /* --- Render --- */
  render: {
    maxDPR: 2,
    parallaxLayers: 3,
    shakeMaxPx: 6,
    shakeMs: 150,
    grainAlpha: 0.045,
    vignette: 0.35,
    particleBudget: 320,
    inkGlowBlur: 12          // shadowBlur sadece murekkep + collectible
  },

  /* --- Ses --- */
  audio: {
    masterGain: 0.7,
    droneGain: 0.06,
    drawNoiseGain: 0.12,
    pentatonic: [0, 2, 4, 7, 9]
  },

  /* --- Ortak arayuz renkleri (dunyadan bagimsiz) --- */
  ui: {
    hazard: '#D6335A',
    hazardGlow: '#FF6B8A',
    goal: '#F2C14E',
    star: '#FFD86B',
    starEmpty: '#3A3F52',
    text: '#EDEFF5',
    textDim: '#8A93A8',
    panel: '#1A1D2A'
  },

  /* --- Dunya paletleri: 5 hex + iki yardimci ton ---
     Hiyerarsi her dunyada ayni: koyu taban + soluk orta tonlar + sicak kedi
     + tek doygun murekkep. Degisen sey sicaklik. */
  palettes: [
    {
      id: 1, name: 'Cati',
      shadow: '#2B2E3F', solid: '#4A5468', mist: '#8A93A8',
      cat: '#E8663D', ink: '#00E0C6',
      sky: '#3A3348', accent: '#C4703A'
    },
    {
      id: 2, name: 'Bodrum',
      shadow: '#141C1B', solid: '#2F4344', mist: '#6E8382',
      cat: '#E8663D', ink: '#00E0C6',
      sky: '#1B2A2B', accent: '#4C7F72'
    },
    {
      id: 3, name: 'Atolye',
      shadow: '#211A16', solid: '#4C3A2E', mist: '#8E7B66',
      cat: '#F2764A', ink: '#00E0C6',
      sky: '#2E2119', accent: '#B5763A'
    },
    {
      id: 4, name: 'Kule',
      shadow: '#1E2338', solid: '#3E4A6B', mist: '#93A0C0',
      cat: '#E8663D', ink: '#00E0C6',
      sky: '#2A3552', accent: '#6E86B8'
    },
    {
      id: 5, name: 'Laboratuvar',
      shadow: '#0E1620', solid: '#22374D', mist: '#6E8CA6',
      cat: '#E8663D', ink: '#FF4FD8',   // lab murekkebi kararsiz: magenta
      sky: '#132433', accent: '#39D8FF'
    }
  ],

  /* --- Dunya -> bolum araligi --- */
  worlds: [
    { id: 1, name: 'Cati',        from: 1,  to: 10, maxStrokesTypical: 3 },
    { id: 2, name: 'Bodrum',      from: 11, to: 20, maxStrokesTypical: 3 },
    { id: 3, name: 'Atolye',      from: 21, to: 30, maxStrokesTypical: 3 },
    { id: 4, name: 'Kule',        from: 31, to: 40, maxStrokesTypical: 2 },
    { id: 5, name: 'Laboratuvar', from: 41, to: 50, maxStrokesTypical: 2 }
  ]
};

config.paletteFor = function (worldId) {
  var p = config.palettes;
  for (var i = 0; i < p.length; i++) if (p[i].id === worldId) return p[i];
  return p[0];
};

config.material = function (name) {
  return config.materials[name] || config.materials.stone;
};

INK.config = config;

})(typeof globalThis !== 'undefined'
    ? (globalThis.INK = globalThis.INK || {})
    : (this.INK = this.INK || {}));
