/* Sema dogrulayicinin gercekten reddettigini kanitlar — verify.js'in 5. kontrolu buna dayanir. */
function baseLevel() {
  return {
    id: 1, world: 1, ink: 5.0, maxStrokes: 3, star2Ink: 0.6, timeLimit: 30,
    cat: { x: 1, y: 13 },
    goal: { x: 7, y: 2, w: 1.6, h: 1.0 },
    fish: null,
    bodies: [{ type: 'static', shape: 'box', x: 4.5, y: 0.4, w: 9, h: 0.8, angle: 0, mat: 'stone' }],
    hint: 'Rampa ciz.',
    solution: [[[1.2, 12.8], [3.4, 11.1]]]
  };
}
function firstError(t, INK, mutate) {
  const lvl = baseLevel();
  mutate(lvl);
  const r = INK.schema.validateLevel(lvl);
  t.ok(!r.ok, 'reddedilmeliydi, gecti');
  return r.errors.join(' ; ');
}

module.exports = {
  'temiz bolum gecer': function (t, INK) {
    const r = INK.schema.validateLevel(baseLevel());
    t.ok(r.ok, 'hatalar: ' + r.errors.join(' ; '));
    t.approx(r.solutionCost, Math.hypot(2.2, 1.7), 1e-9);
  },

  'solution zorunlu': function (t, INK) {
    const e = firstError(t, INK, (l) => { delete l.solution; });
    t.ok(/solution zorunlu/.test(e), e);
  },

  'solution maxStrokes ustunde olamaz': function (t, INK) {
    const e = firstError(t, INK, (l) => {
      l.maxStrokes = 1;
      l.solution = [[[1, 12], [3, 11]], [[4, 9], [6, 8]]];
    });
    t.ok(/maxStrokes/.test(e), e);
  },

  'cok kisa stroke reddedilir': function (t, INK) {
    const e = firstError(t, INK, (l) => { l.solution = [[[1, 12], [1.05, 12]]]; });
    t.ok(/minLength/.test(e), e);
  },

  'dunya disi nokta reddedilir': function (t, INK) {
    const e = firstError(t, INK, (l) => { l.solution = [[[1, 12], [9.6, 11]]]; });
    t.ok(/dunya disinda/.test(e), e);
  },

  'kedi dunya disinda olamaz': function (t, INK) {
    const e = firstError(t, INK, (l) => { l.cat = { x: -1, y: 13 }; });
    t.ok(/cat\[0\] dunya disinda/.test(e), e);
  },

  'hedef dunya disina tasamaz': function (t, INK) {
    const e = firstError(t, INK, (l) => { l.goal = { x: 8.8, y: 2, w: 2, h: 1 }; });
    t.ok(/goal dunya disina/.test(e), e);
  },

  'fish alani atlanamaz': function (t, INK) {
    const e = firstError(t, INK, (l) => { delete l.fish; });
    t.ok(/fish alani zorunlu/.test(e), e);
  },

  'gecersiz body tipi yakalanir': function (t, INK) {
    const e = firstError(t, INK, (l) => { l.bodies[0].type = 'zipzip'; });
    t.ok(/type gecersiz/.test(e), e);
  },

  'static body malzemesiz olamaz': function (t, INK) {
    const e = firstError(t, INK, (l) => { delete l.bodies[0].mat; });
    t.ok(/mat zorunlu/.test(e), e);
  },

  'platform path ve speed ister': function (t, INK) {
    const e = firstError(t, INK, (l) => {
      l.bodies.push({ type: 'platform', shape: 'box', x: 2, y: 9, w: 1.5, h: 0.2 });
    });
    t.ok(/path en az 2 nokta/.test(e) && /speed pozitif/.test(e), e);
  },

  'seesaw pivot ister': function (t, INK) {
    const e = firstError(t, INK, (l) => {
      l.bodies.push({ type: 'motor', shape: 'box', x: 4, y: 7, w: 2, h: 0.2, kind: 'seesaw' });
    });
    t.ok(/pivot zorunlu/.test(e), e);
  },

  'poligon 8 koseyi gecemez': function (t, INK) {
    const e = firstError(t, INK, (l) => {
      const pts = [];
      for (let i = 0; i < 9; i++) pts.push([4 + Math.cos(i), 8 + Math.sin(i)]);
      l.bodies.push({ type: 'static', shape: 'poly', x: 4, y: 8, points: pts, mat: 'stone' });
    });
    t.ok(/en fazla 8 kose/.test(e), e);
  },

  'id dunya araligina uymali': function (t, INK) {
    const e = firstError(t, INK, (l) => { l.id = 25; });
    t.ok(/araligi disinda/.test(e), e);
  },

  'tekrar eden id yakalanir': function (t, INK) {
    const rows = INK.schema.validateAll([baseLevel(), baseLevel()]);
    t.ok(!rows[1].ok, 'ikinci bolum reddedilmeliydi');
    t.ok(/id tekrar/.test(rows[1].errors.join(' ')), rows[1].errors.join(' '));
  },

  'dunya 4 tek kediye uyari verir': function (t, INK) {
    const lvl = baseLevel();
    lvl.id = 31; lvl.world = 4;
    const r = INK.schema.validateLevel(lvl);
    t.ok(r.ok, r.errors.join(' ; '));
    t.ok(r.warnings.length === 1 && /iki kedi/.test(r.warnings[0]), r.warnings.join(' '));
  },

  'normalize varsayilanlari doldurur': function (t, INK) {
    const lvl = baseLevel();
    lvl.cat2 = { x: 5, y: 13 };
    lvl.bodies.push({ type: 'hazard', shape: 'box', x: 6, y: 0.9, w: 2, h: 0.3, kind: 'spike' });
    const n = INK.schema.normalize(lvl);
    t.equal(n.cats.length, 2, 'iki kedi normalize edildi');
    t.equal(n.bodies[1].mat, 'metal', 'hazard varsayilan malzeme');
    t.equal(n.bodies[0].angle, 0);
    t.equal(n.palette.name, 'Cati');
    t.equal(n.fish, null);
  },

  'tanimli bolumlerin tamami semaya uyuyor': function (t, INK) {
    const rows = INK.schema.validateAll(INK.levels);
    const bad = rows.filter((r) => !r.ok);
    t.equal(bad.length, 0, bad.map((b) => b.id + ': ' + b.errors.join(' ; ')).join(' | '));
  }
};
