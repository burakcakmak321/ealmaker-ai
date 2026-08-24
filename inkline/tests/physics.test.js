/* Faz 1 fizik testleri: kutle, carpisma, cozucu kararliligi, determinizm,
   tunelleme, uyku, NaN korumasi. Canvas yok, saf sayi. */

function mkWorld(gravity, dev) {
  return new (require('../tools/load').loadAll(), globalThis.INK.World)(
    { gravity: gravity, dev: dev !== false });
}
function box(world, type, x, y, w, h, angle, mat) {
  var INK = globalThis.INK;
  var b = new INK.Body(type, x, y, angle || 0);
  b.addShape(INK.Polygon.box(w, h, 0, 0, 0, mat || 'stone'));
  b.finalize();
  return world.addBody(b);
}
function ball(world, type, x, y, r, mat) {
  var INK = globalThis.INK;
  var b = new INK.Body(type, x, y, 0);
  b.addShape(new INK.Circle(r, 0, 0, mat || 'stone'));
  b.finalize();
  return world.addBody(b);
}
function run(world, steps) {
  for (var i = 0; i < steps; i++) world.step(1 / 120);
}

module.exports = {
  /* ---------- kutle ozellikleri ---------- */
  'kutu kutlesi ve ataleti analitik degerle uyusuyor': function (t, INK) {
    var b = new INK.Body('dynamic', 0, 0);
    b.addShape(INK.Polygon.box(2, 1, 0, 0, 0, 'wood'));
    b.finalize();
    var d = INK.config.materials.wood.density;
    t.approx(b.mass, 2 * 1 * d, 1e-9);
    t.approx(b.inertia, b.mass * (2 * 2 + 1 * 1) / 12, 1e-9);
  },

  'cember kutlesi ve ataleti analitik degerle uyusuyor': function (t, INK) {
    var b = new INK.Body('dynamic', 0, 0);
    b.addShape(new INK.Circle(0.5, 0, 0, 'stone'));
    b.finalize();
    var d = INK.config.materials.stone.density;
    var m = Math.PI * 0.25 * d;
    t.approx(b.mass, m, 1e-9);
    t.approx(b.inertia, 0.5 * m * 0.25, 1e-9);
  },

  'compound body kutle merkezini dogru buluyor': function (t, INK) {
    /* iki esit kutu, biri x=0 digeri x=2 -> COM x=1 */
    var b = new INK.Body('dynamic', 0, 0);
    b.addShape(INK.Polygon.box(1, 1, 0, 0, 0, 'wood'));
    b.addShape(INK.Polygon.box(1, 1, 2, 0, 0, 'wood'));
    b.finalize();
    t.approx(b.pos.x, 1, 1e-9);
    t.approx(b.pos.y, 0, 1e-9);
    /* atalet: 2 kutu, her biri COM'dan 1 birim uzakta */
    var mHalf = b.mass / 2;
    var expected = 2 * (mHalf * (1 + 1) / 12 + mHalf * 1);
    t.approx(b.inertia, expected, 1e-9);
  },

  'poligon saat yonu girdiyi CCW\'ye cevirir': function (t, INK) {
    var cw = new INK.Polygon([[0, 0], [0, 1], [1, 1], [1, 0]], 'stone');
    t.ok(INK.signedArea(cw.verts) > 0, 'alan pozitif olmali (CCW)');
    var n = cw.normals[0];
    t.approx(Math.hypot(n.x, n.y), 1, 1e-9);
  },

  'poligon 8 koseden fazlasini reddeder': function (t, INK) {
    t.throws(function () {
      var pts = [];
      for (var i = 0; i < 9; i++) pts.push([Math.cos(i), Math.sin(i)]);
      new INK.Polygon(pts, 'stone');
    });
  },

  /* ---------- narrowphase ---------- */
  'cember-cember manifoldu': function (t, INK) {
    var w = new INK.World({ gravity: 0 });
    var a = ball(w, 'dynamic', 0, 0, 0.5);
    var b = ball(w, 'dynamic', 0.8, 0, 0.5);
    w.step(1 / 120);
    t.equal(w.manifoldCount, 1, 'tek manifold');
    var m = w.manifolds[0];
    t.equal(m.count, 1);
    t.approx(Math.abs(m.normal.x), 1, 1e-6);
    t.ok(m.points[0].separation < 0, 'ic ice gecme negatif ayrim');
    t.ok(a.pos.x < 0 && b.pos.x > 0.8, 'birbirini itmeli');
  },

  'cember-poligon yuz bolgesi': function (t, INK) {
    var w = new INK.World({ gravity: 0 });
    box(w, 'static', 0, 0, 2, 0.4);
    var c = ball(w, 'dynamic', 0, 0.35, 0.2);
    w.step(1 / 120);
    t.equal(w.manifoldCount, 1);
    var m = w.manifolds[0];
    t.approx(m.normal.x, 0, 1e-9);
    t.approx(Math.abs(m.normal.y), 1, 1e-9);
    t.approx(m.points[0].separation, 0.35 - 0.2 - 0.2, 1e-9);
  },

  'cember-poligon kose bolgesi': function (t, INK) {
    var w = new INK.World({ gravity: 0 });
    box(w, 'static', 0, 0, 2, 0.4);          // kose (1, 0.2)
    var c = ball(w, 'dynamic', 1.1, 0.3, 0.2);
    w.step(1 / 120);
    t.equal(w.manifoldCount, 1);
    var m = w.manifolds[0];
    t.ok(m.normal.x > 0.3 && m.normal.y > 0.3, 'kose normali capraz olmali: ' +
      m.normal.x.toFixed(3) + ',' + m.normal.y.toFixed(3));
  },

  'poligon-poligon iki temas noktasi uretir': function (t, INK) {
    var w = new INK.World({ gravity: 0 });
    box(w, 'static', 0, 0, 4, 0.4);
    var b = box(w, 'dynamic', 0, 0.45, 1, 0.5, 0, 'wood');
    w.step(1 / 120);
    t.equal(w.manifoldCount, 1);
    t.equal(w.manifolds[0].count, 2, 'duz yuz temasi 2 nokta ister');
    var ids = [w.manifolds[0].points[0].id, w.manifolds[0].points[1].id];
    t.ok(ids[0] !== ids[1], 'temas ID\'leri ayrik olmali');
  },

  'ayrik cisimler manifold uretmez': function (t, INK) {
    var w = new INK.World({ gravity: 0 });
    box(w, 'static', 0, 0, 1, 1);
    box(w, 'dynamic', 5, 5, 1, 1, 0, 'wood');
    w.step(1 / 120);
    t.equal(w.manifoldCount, 0);
  },

  /* ---------- cozucu kararliligi ---------- */
  'kutu zeminde durur ve titremez': function (t, INK) {
    var w = new INK.World({ dev: true });
    box(w, 'static', 0, 0, 6, 1);            // ust yuz y = 0.5
    var b = box(w, 'dynamic', 0, 2, 0.6, 0.6, 0, 'wood');
    run(w, 300);
    var restY = b.pos.y;
    var maxDev = 0;
    for (var i = 0; i < 200; i++) {
      w.step(1 / 120);
      maxDev = Math.max(maxDev, Math.abs(b.pos.y - restY));
    }
    t.approx(restY, 0.8, 0.02);
    t.ok(maxDev < 1e-4, 'dinlenirken titriyor: ' + maxDev);
  },

  'bes kutuluk yigin ayakta kaliyor': function (t, INK) {
    var w = new INK.World({ dev: true });
    box(w, 'static', 0, 0, 6, 1);
    var st = [];
    for (var i = 0; i < 5; i++) st.push(box(w, 'dynamic', 0, 0.85 + i * 0.62, 0.6, 0.6, 0, 'wood'));
    run(w, 1200);
    for (var j = 0; j < 5; j++) {
      t.ok(Math.abs(st[j].angle) < 0.05, 'kutu ' + j + ' devrildi: ' + st[j].angle);
      t.ok(Math.abs(st[j].pos.x) < 0.05, 'kutu ' + j + ' kaydi: ' + st[j].pos.x);
    }
    /* ideal 3.2; her temasta slop kadar batma birikir */
    t.ok(st[4].pos.y > 3.15, 'yigin cokmus: ' + st[4].pos.y);
  },

  'serbest dusus analitik cozume yakin': function (t, INK) {
    var w = new INK.World({ dev: true });
    var b = ball(w, 'dynamic', 0, 10, 0.2);
    b.linearDamping = 0;
    run(w, 120);                                     // 1 saniye
    var expected = 10 - 0.5 * 20 * 1;
    t.approx(b.pos.y, expected, 0.12);
    t.approx(b.vel.y, -20, 0.05);
  },

  'sekme restitution ile sinirli, enerji uretmiyor': function (t, INK) {
    var w = new INK.World({ dev: true });
    box(w, 'static', 0, 0, 6, 1);
    var b = ball(w, 'dynamic', 0, 5, 0.3, 'rubber');
    b.linearDamping = 0;
    var maxY = 0;
    for (var i = 0; i < 1200; i++) {
      w.step(1 / 120);
      if (i > 120) maxY = Math.max(maxY, b.pos.y);
    }
    t.ok(maxY < 5, 'top birakildigi yuksekligi asti: ' + maxY);
    t.ok(maxY > 0.8, 'kaucuk top hic sekmedi: ' + maxY);
  },

  'yavas temasta sekme yok (restitution slop)': function (t, INK) {
    var w = new INK.World({ dev: true });
    box(w, 'static', 0, 0, 6, 1);
    var b = ball(w, 'dynamic', 0, 0.81, 0.3, 'rubber');
    run(w, 400);
    var maxVy = 0;
    for (var i = 0; i < 200; i++) { w.step(1 / 120); maxVy = Math.max(maxVy, Math.abs(b.vel.y)); }
    t.ok(maxVy < 0.05, 'kaucuk top dinlenirken zipliyor: ' + maxVy);
  },

  'yuksek surtunmeli egimde kutu kaymiyor': function (t, INK) {
    var w = new INK.World({ dev: true });
    var slope = new INK.Body('static', 0, 0, 0.3);
    slope.addShape(INK.Polygon.box(6, 0.4, 0, 0, 0, 'rubber'));
    slope.finalize(); w.addBody(slope);
    var b = new INK.Body('dynamic', 0, 0.5, 0.3);
    b.addShape(INK.Polygon.box(0.5, 0.3, 0, 0, 0, 'rubber'));
    b.finalize(); w.addBody(b);
    var x0 = b.pos.x;
    run(w, 600);
    t.ok(Math.abs(b.pos.x - x0) < 0.06, 'yapiskan egimde kaydi: ' + (b.pos.x - x0));
  },

  'buzda kutu kayiyor': function (t, INK) {
    var w = new INK.World({ dev: true });
    var slope = new INK.Body('static', 0, 0, 0.3);
    slope.addShape(INK.Polygon.box(8, 0.4, 0, 0, 0, 'ice'));
    slope.finalize(); w.addBody(slope);
    var b = new INK.Body('dynamic', 1, 0.9, 0.3);
    b.addShape(INK.Polygon.box(0.5, 0.3, 0, 0, 0, 'ice'));
    b.finalize(); w.addBody(b);
    var x0 = b.pos.x;
    run(w, 300);
    t.ok(b.pos.x - x0 < -0.4, 'buzda kaymadi: ' + (b.pos.x - x0));
  },

  'hiz kirpmasi tavani asmiyor': function (t, INK) {
    var w = new INK.World({ dev: true });
    var b = ball(w, 'dynamic', 0, 0, 0.2);
    b.vel.x = 5000; b.vel.y = -5000; b.angVel = 500;
    w.step(1 / 120);
    t.ok(INK.V2.len(b.vel) <= INK.config.limits.maxLinearVelocity + 1e-9,
      'lineer hiz kirpilmadi: ' + INK.V2.len(b.vel));
    t.ok(Math.abs(b.angVel) <= INK.config.limits.maxAngularVelocity + 1e-9,
      'aci hizi kirpilmadi: ' + b.angVel);
  },

  /* ---------- tunelleme ---------- */
  'hizli kucuk cember ince duvari gecemiyor': function (t, INK) {
    for (var s = 20; s <= 200; s += 20) {
      var w = new INK.World({ gravity: 0, dev: true });
      box(w, 'static', 0, 0, 4, 0.14);
      var b = ball(w, 'dynamic', 0, 2, 0.06);
      b.vel.y = -s;
      for (var i = 0; i < 300; i++) w.step(1 / 120);
      t.ok(b.pos.y > 0, 'hiz ' + s + ' duvari deldi: y=' + b.pos.y.toFixed(3));
    }
  },

  'hizli kucuk kutu ince duvari gecemiyor': function (t, INK) {
    for (var s = 60; s <= 200; s += 40) {
      var w = new INK.World({ gravity: 0, dev: true });
      box(w, 'static', 0, 0, 4, 0.14);
      var b = box(w, 'dynamic', 0, 2, 0.12, 0.12, 0, 'wood');
      b.vel.y = -s;
      for (var i = 0; i < 300; i++) w.step(1 / 120);
      t.ok(b.pos.y > 0, 'hiz ' + s + ' duvari deldi: y=' + b.pos.y.toFixed(3));
    }
  },

  /* ---------- determinizm ---------- */
  'ayni girdi 600 adim sonra ayni hash': function (t, INK) {
    function build() {
      var w = new INK.World({ dev: true });
      box(w, 'static', 0, 0, 9, 0.8);
      for (var i = 0; i < 6; i++) {
        var b = box(w, 'dynamic', -2 + i * 0.7, 1 + i * 0.9, 0.5, 0.3, i * 0.21, 'wood');
        b.vel.x = 0.3 * ((i % 3) - 1);
      }
      ball(w, 'dynamic', 0.4, 6, 0.28, 'cat');
      return w;
    }
    var w1 = build(), w2 = build();
    for (var s = 0; s < 600; s++) { w1.step(1 / 120); w2.step(1 / 120); }
    t.equal(w1.hash(), w2.hash(), 'determinizm bozuk');
  },

  'body ekleme sirasi degisince bile tek koşu kendini tekrar eder': function (t, INK) {
    function build() {
      var w = new INK.World({ dev: true });
      box(w, 'static', 0, 0, 9, 0.8);
      ball(w, 'dynamic', 0, 4, 0.3, 'cat');
      box(w, 'dynamic', 0.2, 6, 0.6, 0.2, 0.4, 'wood');
      return w;
    }
    var a = build(), b = build();
    for (var s = 0; s < 900; s++) { a.step(1 / 120); b.step(1 / 120); }
    t.equal(a.hash(), b.hash());
  },

  /* ---------- uyku ---------- */
  'duran cisim uyur, impuls uyandirir': function (t, INK) {
    var w = new INK.World({ dev: true });
    box(w, 'static', 0, 0, 6, 1);
    var b = box(w, 'dynamic', 0, 2, 0.6, 0.6, 0, 'wood');
    run(w, 600);
    t.ok(!b.awake, 'uyumadi');
    b.applyImpulse(0, 2 * b.mass, b.pos.x, b.pos.y);
    t.ok(b.awake, 'impuls uyandirmadi');
    run(w, 10);
    t.ok(b.pos.y > 0.8, 'uyanan cisim hareket etmedi');
  },

  'ustune dusen cisim uyuyani uyandirir, sonra ikisi de tekrar uyur': function (t, INK) {
    var w = new INK.World({ dev: true });
    box(w, 'static', 0, 0, 6, 1);
    var bottom = box(w, 'dynamic', 0, 2, 0.8, 0.4, 0, 'wood');
    run(w, 600);
    t.ok(!bottom.awake, 'alttaki uyumadi');
    var top = box(w, 'dynamic', 0, 1.6, 0.4, 0.4, 0, 'wood');
    run(w, 40);                              // dusus ~0.7s'den kisa
    t.ok(bottom.awake, 'temas uyandirmadi');
    run(w, 600);
    t.ok(!bottom.awake && !top.awake, 'ikisi de tekrar uyumali');
    t.ok(top.pos.y > bottom.pos.y, 'ustteki altta kalmis');
  },

  'uyuyan cisim kendiliginden uyanmaz': function (t, INK) {
    var w = new INK.World({ dev: true });
    box(w, 'static', 0, 0, 6, 1);
    var b = box(w, 'dynamic', 0, 2, 0.6, 0.6, 0, 'wood');
    run(w, 400);
    var wakeCount = 0;
    for (var i = 0; i < 1200; i++) { w.step(1 / 120); if (b.awake) wakeCount++; }
    t.ok(wakeCount === 0, 'kendiliginden ' + wakeCount + ' kare uyandi');
  },

  /* ---------- yuvarlanma ---------- */
  'cember duz zeminde sonunda duruyor': function (t, INK) {
    var w = new INK.World({ dev: true });
    box(w, 'static', 0, 0, 40, 1);
    var c = ball(w, 'dynamic', -8, 0.85, INK.config.cat.radius, 'cat');
    c.linearDamping = INK.config.cat.linearDamping;
    c.angularDamping = INK.config.cat.angularDamping;
    c.rollingResistance = INK.config.cat.rollingResistance;
    c.vel.x = 6;
    run(w, 1200);                     // 10 saniye
    t.ok(Math.abs(c.vel.x) < INK.config.cat.goalSpeed,
      '10 saniyede duramadi: v=' + c.vel.x.toFixed(3));
  },

  'yuvarlanma direnci olmadan cember durmaz (kontrol)': function (t, INK) {
    var w = new INK.World({ dev: true });
    box(w, 'static', 0, 0, 400, 1);
    var c = ball(w, 'dynamic', -8, 0.85, 0.28, 'stone');
    c.vel.x = 6;
    run(w, 1200);
    t.ok(Math.abs(c.vel.x) > 1, 'kontrol testi beklenmedik: v=' + c.vel.x.toFixed(3));
  },

  /* ---------- compound (murekkep cizgisi benzeri) ---------- */
  'compound cizgi tek katı cisim gibi davraniyor': function (t, INK) {
    var w = new INK.World({ dev: true });
    box(w, 'static', 0, 0, 9, 0.8);
    var line = new INK.Body('dynamic', 0, 3, 0);
    var n = 8, len = 0.3, th = INK.config.ink.thickness;
    for (var i = 0; i < n; i++) {
      line.addShape(INK.Polygon.box(len, th, -1 + i * len, i * 0.05, 0.12, 'ink'));
    }
    line.finalize();
    w.addBody(line);
    var shape0 = line.shapes[0], shape7 = line.shapes[7];
    var d0 = Math.hypot(shape0.verts[0].x - shape7.verts[0].x, shape0.verts[0].y - shape7.verts[0].y);
    run(w, 600);
    var d1 = Math.hypot(shape0.verts[0].x - shape7.verts[0].x, shape0.verts[0].y - shape7.verts[0].y);
    t.approx(d1, d0, 1e-12);
    t.ok(line.pos.y < 3, 'cizgi dusmedi');
    t.ok(line.isFinite(), 'cizgi NaN uretti');
  },

  /* ---------- koruma ve sorgular ---------- */
  'NaN korumasi guvenli state\'e donuyor': function (t, INK) {
    var w = new INK.World({ dev: false });
    box(w, 'static', 0, 0, 6, 1);
    var b = box(w, 'dynamic', 0, 2, 0.5, 0.5, 0, 'wood');
    run(w, 60);
    var safeY = b.pos.y;
    b.pos.y = NaN;
    w.step(1 / 120);
    t.ok(isFinite(b.pos.y), 'NaN temizlenmedi');
    t.approx(b.pos.y, safeY, 0.2);
    t.equal(w.nanEvents, 1);
    t.equal(b.vel.y, 0, 'kurtarilan cisim durdurulmali');
  },

  'dev modunda NaN hata firlatiyor': function (t, INK) {
    var w = new INK.World({ dev: true });
    var b = box(w, 'dynamic', 0, 2, 0.5, 0.5, 0, 'wood');
    b.vel.x = Infinity;
    t.throws(function () { w.step(1 / 120); });
  },

  'queryPoint icerideki cismi buluyor': function (t, INK) {
    var w = new INK.World({ dev: true });
    var g = box(w, 'static', 0, 0, 4, 1);
    w.step(1 / 120);
    t.equal(w.queryPoint(0, 0), g);
    t.equal(w.queryPoint(0, 3), null);
  },

  'overlapBody cizgi dogrulamasi icin ortusmeyi buluyor': function (t, INK) {
    var w = new INK.World({ dev: true });
    var g = box(w, 'static', 0, 0, 4, 1);
    w.step(1 / 120);
    var probe = new INK.Body('static', 0, 0.2, 0);
    probe.addShape(INK.Polygon.box(0.5, 0.14, 0, 0, 0, 'ink'));
    probe.finalize();
    t.equal(w.overlapBody(probe), g, 'ic ice giren cizgi yakalanmali');
    var far = new INK.Body('static', 0, 5, 0);
    far.addShape(INK.Polygon.box(0.5, 0.14, 0, 0, 0, 'ink'));
    far.finalize();
    t.equal(w.overlapBody(far), null, 'uzaktaki cizgi temiz olmali');
  },

  'clear her seyi birakiyor (sizinti yok)': function (t, INK) {
    var w = new INK.World({ dev: true });
    box(w, 'static', 0, 0, 6, 1);
    for (var i = 0; i < 5; i++) box(w, 'dynamic', 0, 1 + i * 0.6, 0.5, 0.5, 0, 'wood');
    run(w, 120);
    t.ok(w.manifoldCount > 0, 'once temas olmali');
    w.clear();
    t.equal(w.bodies.length, 0);
    t.equal(w.manifoldCount, 0);
    t.equal(w.allManifolds.length, 0);
    t.equal(w.manifoldMap.size, 0);
    t.ok(w.manifoldPool.free.length > 0, 'manifoldlar havuza donmeli');
  },

  'temas geri cagrilari begin/end veriyor': function (t, INK) {
    var w = new INK.World({ dev: true });
    var begins = 0, ends = 0;
    w.onBeginContact = function () { begins++; };
    w.onEndContact = function () { ends++; };
    box(w, 'static', 0, 0, 6, 1);
    var b = ball(w, 'dynamic', 0, 3, 0.3, 'rubber');
    b.linearDamping = 0;
    run(w, 400);
    t.ok(begins >= 1, 'begin tetiklenmedi');
    t.ok(ends >= 1, 'end tetiklenmedi (sekme ayrilma uretmeli)');
  },

  'sensor sekiller impuls uygulamiyor': function (t, INK) {
    var w = new INK.World({ dev: true, gravity: 0 });
    var sensor = new INK.Body('static', 0, 0, 0);
    var s = sensor.addShape(INK.Polygon.box(2, 2, 0, 0, 0, 'stone'));
    s.isSensor = true;
    sensor.finalize();
    w.addBody(sensor);
    var b = ball(w, 'dynamic', -3, 0, 0.2);
    b.vel.x = 2;
    var touched = false;
    w.onBeginContact = function (m) { if (m.isSensor) touched = true; };
    run(w, 300);
    t.ok(touched, 'sensor temasi bildirilmedi');
    t.ok(b.pos.x > 1, 'sensor cismi durdurdu: ' + b.pos.x.toFixed(2));
    t.approx(b.vel.x, 2, 1e-9);
  },

  /* ---------- kinematic ---------- */
  'kinematic platform tasiyor ama itilmiyor': function (t, INK) {
    var w = new INK.World({ dev: true });
    var plat = new INK.Body('kinematic', 0, 1, 0);
    plat.addShape(INK.Polygon.box(2, 0.2, 0, 0, 0, 'metal'));
    plat.finalize(); w.addBody(plat);
    plat.vel.x = 1.0;
    var rider = box(w, 'dynamic', 0, 1.35, 0.4, 0.4, 0, 'rubber');
    run(w, 240);
    t.approx(plat.pos.x, 2.0, 1e-9);
    t.approx(plat.pos.y, 1.0, 1e-12);
    t.approx(plat.vel.y, 0, 1e-12);
    t.ok(rider.pos.x > 1.2, 'yolcu platformla tasinmadi: ' + rider.pos.x.toFixed(3));
    t.ok(rider.pos.y > 1.2, 'yolcu platformdan dustu: ' + rider.pos.y.toFixed(3));
  },

  /* ---------- dayaniklilik ---------- */
  'cisim icinde dogan cizgi sonsuz kuvvet uretmiyor': function (t, INK) {
    var w = new INK.World({ dev: true });
    box(w, 'static', 0, 0, 4, 2);                     // -1..1 dikey
    var line = new INK.Body('dynamic', 0, 0, 0.3);    // tam ortasinda dogdu
    for (var i = 0; i < 6; i++) {
      line.addShape(INK.Polygon.box(0.3, INK.config.ink.thickness, -0.75 + i * 0.3, 0, 0, 'ink'));
    }
    line.finalize(); w.addBody(line);
    var maxSpeed = 0;
    for (var s = 0; s < 600; s++) {
      w.step(1 / 120);
      maxSpeed = Math.max(maxSpeed, INK.V2.len(line.vel), Math.abs(line.angVel));
      t.ok(line.isFinite(), 'adim ' + s + ' NaN');
    }
    t.ok(maxSpeed < INK.config.limits.maxLinearVelocity,
      'ic ice gecmeden firladi: ' + maxSpeed.toFixed(2));
    t.ok(line.pos.y > 0.5 || Math.abs(line.pos.x) > 1.5, 'cizgi disari itilmedi');
  },

  'sifir uzunluklu segment NaN uretmiyor': function (t, INK) {
    var w = new INK.World({ dev: true });
    box(w, 'static', 0, 0, 4, 0.4);
    var b = new INK.Body('dynamic', 0, 1, 0);
    b.addShape(INK.Polygon.box(1e-7, INK.config.ink.thickness, 0, 0, 0, 'ink'));
    b.addShape(INK.Polygon.box(0.3, INK.config.ink.thickness, 0.2, 0, 0, 'ink'));
    b.finalize();
    w.addBody(b);
    run(w, 300);
    t.ok(b.isFinite(), 'NaN uretti');
    t.equal(w.nanEvents, 0);
  },

  'ayni cift iki kez cift listesine girmiyor': function (t, INK) {
    var w = new INK.World({ dev: true, gravity: 0 });
    /* iki uzun cisim bircok hucreyi paylasiyor */
    box(w, 'static', 0, 0, 8, 0.4);
    var b = box(w, 'dynamic', 0, 0.3, 7, 0.4, 0, 'wood');
    w.step(1 / 120);
    var seen = {};
    var bp = w.broadphase;
    for (var i = 0; i < bp.pairCount; i += 2) {
      var k = bp.pairBuf[i] + ':' + bp.pairBuf[i + 1];
      t.ok(!seen[k], 'cift tekrar bildirildi: ' + k);
      seen[k] = true;
    }
    t.ok(bp.pairCount >= 2, 'cift hic uretilmedi');
  },

  'spekulatif temas enerji eklemiyor': function (t, INK) {
    var w = new INK.World({ dev: true, gravity: 0 });
    box(w, 'static', 0, 0, 6, 0.4);
    var b = ball(w, 'dynamic', 0, 3, 0.2, 'stone');
    b.linearDamping = 0;
    b.vel.y = -80;
    var before = 0.5 * b.mass * 80 * 80;
    run(w, 200);
    var after = 0.5 * b.mass * INK.V2.lenSq(b.vel);
    t.ok(after <= before * 1.01, 'enerji artti: ' + after.toFixed(3) + ' > ' + before.toFixed(3));
    t.ok(b.pos.y > 0.2, 'duvari gecti');
  },

  'bolum gecisi manifold sizdirmiyor': function (t, INK) {
    var w = new INK.World({ dev: true });
    for (var round = 0; round < 5; round++) {
      box(w, 'static', 0, 0, 6, 1);
      for (var i = 0; i < 6; i++) box(w, 'dynamic', -1 + i * 0.4, 1 + i * 0.5, 0.35, 0.35, 0, 'wood');
      run(w, 200);
      w.clear();
      t.equal(w.manifoldMap.size, 0, 'tur ' + round + ' manifold birakti');
      t.equal(w.allManifolds.length, 0, 'tur ' + round + ' liste birakti');
    }
    t.ok(w.manifoldPool.createdCount < 200, 'havuz sinirsiz buyudu: ' + w.manifoldPool.createdCount);
  },

  'shape id\'leri geri donusuyor': function (t, INK) {
    var w = new INK.World({ dev: true });
    box(w, 'static', 0, 0, 6, 1);
    var before = INK.liveShapeIds();
    for (var round = 0; round < 50; round++) {
      var line = new INK.Body('dynamic', 0, 3, 0);
      for (var i = 0; i < 20; i++) line.addShape(INK.Polygon.box(0.2, 0.14, i * 0.2, 0, 0, 'ink'));
      line.finalize();
      w.addBody(line);
      run(w, 5);
      w.removeBody(line);
    }
    t.equal(INK.liveShapeIds(), before, 'canli shape sayisi sizdi');
    t.ok(INK.liveShapeIds() < INK.MAX_SHAPE_ID, 'id tavanina yaklasti');
  }
};
