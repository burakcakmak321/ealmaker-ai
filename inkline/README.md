# Inkline — Mimari (Faz 0)

Tek dosyalik, tamamen offline 2D fizik bulmaca oyunu. Gelistirme modulerdir,
teslim tek `dist/index.html` dosyasidir.

## Dizin

```
inkline/
  src/
    core/    config.js  rng.js  math2d.js  pool.js  loop.js
    physics/ (Faz 1)  world.js  body.js  shapes.js  collision.js  solver.js
    game/    schema.js  levels.js   (Faz 2: ink.js  entities.js  rules.js)
    render/  (Faz 3)  renderer.js  palette.js  particles.js  camera.js
    audio/   (Faz 5)  synth.js
    ui/      (Faz 5)  screens.js
    main.js  (Faz 2)  -> INK.boot(canvas) ve INK.app
  tools/
    manifest.js   kaynak sirasi — tek dogruluk kaynagi
    load.js       Node tarafinda ayni sirayla yukler (vm)
    build.js      template + kaynaklar -> dist/index.html, teslim denetimi
    verify.js     spec 12. bolumdeki bes zorunlu kontrol
    test.js       birim test kosucusu (tests/*.test.js)
    smoke.js      dist/index.html'i gercek Chromium'da file:// ile acar
    template.html WebView sertlestirilmis kabuk
  tests/
    core.test.js  schema.test.js
  dist/           uretilen cikti (Faz 6'ya kadar git'e girmez)
```

## Modul sozlesmesi

Her dosya kendi IIFE'sindedir ve tek bir global namespace'e yazar:

```js
(function (INK) { 'use strict'; /* ... */ INK.Something = Something; })(globalThis.INK = globalThis.INK || {});
```

Boylece ayni kaynak hem tarayicida (concat edilmis klasik `<script>`) hem
Node'da (`vm.runInThisContext`) calisir. `type="module"` ve `require` yok,
yani `file://` altinda CORS sorunu cikmaz ve `verify.js` motoru canvas
olmadan kosturabilir.

Bagimlilik yonu tek yonlu: `core -> physics -> game -> render/audio/ui`.
Render katmani fizige bakar, fizik render'a asla bakmaz.

## Komutlar

| Komut | Ne yapar |
|---|---|
| `npm test` | Birim testler (31 test) |
| `npm run verify` | Bes zorunlu kontrol + kapsama, ozet tablo |
| `npm run build` | `dist/index.html` uretir, teslim kurallarini denetler |
| `npm run smoke` | Ciktiyi Chromium'da `file://` ile acar, konsolu denetler |
| `npm run check` | Hepsi, sirayla |

`build.js` ciktida su kaliplari arar ve bulursa derlemeyi basarisiz sayar:
`type="module"`, `fetch(`, `XMLHttpRequest`, `<link>`, `<script src>`,
harici URL, ES modul ifadesi, harici varlik referansi.

## Sabitler

Butun sayilar ve renkler `src/core/config.js` icinde. Kodda cikplak sabit yok.
Basliklar: `world`, `time`, `solver`, `limits`, `sleep`, `damping`,
`broadphase`, `ink`, `cat`, `materials`, `rules`, `render`, `audio`, `ui`,
`palettes`, `worlds`.

### Paletler

Hiyerarsi her dunyada ayni: koyu taban + soluk orta tonlar + sicak kedi +
ekrandaki tek doygun oge olan murekkep. Degisen sey sicaklik.

| Dunya | shadow | solid | mist | cat | ink |
|---|---|---|---|---|---|
| 1 Cati | `#2B2E3F` | `#4A5468` | `#8A93A8` | `#E8663D` | `#00E0C6` |
| 2 Bodrum | `#141C1B` | `#2F4344` | `#6E8382` | `#E8663D` | `#00E0C6` |
| 3 Atolye | `#211A16` | `#4C3A2E` | `#8E7B66` | `#F2764A` | `#00E0C6` |
| 4 Kule | `#1E2338` | `#3E4A6B` | `#93A0C0` | `#E8663D` | `#00E0C6` |
| 5 Laboratuvar | `#0E1620` | `#22374D` | `#6E8CA6` | `#E8663D` | `#FF4FD8` |

D5'te murekkep magenta: lab anlatisinda murekkep kararsiz bir reaktif.
Diger dortte turkuaz sabit — oyuncu "bu cizgi benim" okumasini kaybetmiyor.

## Bolum semasi

`src/game/schema.js` sozlesmeyi hem dogrular hem calisma zamani icin
normalize eder. Spec'teki alanlarin tamami zorunlu; `solution` dahil.

```js
{
  id: 1, world: 1,
  ink: 5.0, maxStrokes: 3, star2Ink: 0.6, timeLimit: 30,
  cat: { x, y },            // opsiyonel cat2 -> dunya 4'te iki kedi
  goal: { x, y, w, h },
  fish: { x, y } | null,    // alan zorunlu, degeri null olabilir
  bodies: [ ... ],
  hint: "...",
  solution: [ [[x,y],[x,y], ...] ]   // her bolumde zorunlu
}
```

`bodies` tipleri ve zorunlu alanlari:

| type | zorunlu ek alanlar | notlar |
|---|---|---|
| `static` | `mat` | hareketsiz |
| `dynamic` | `mat` | kutle sekil + yogunluktan |
| `hazard` | `kind`: spike \| saw \| electric \| water | temas = olum |
| `motor` | `kind`: seesaw \| fan \| wheel; seesaw/wheel `pivot`, fan/wheel `speed` | |
| `platform` | `path` (>=2 nokta), `speed` | kinematic, path uzerinde gider |

Sekiller: `box` (`w`,`h`), `circle` (`r`), `poly` (`points`, max 8 kose).
Ortak: `x`, `y`, opsiyonel `angle`.

## Spec'ten bilincli sapmalar

1. **Broadphase hucre boyutu 64 birim degil 1.0 birim.** Dunya 9x16 birim;
   64 birimlik hucre tum dunyayi tek hucreye koyar, yani broadphase'i yok
   eder. 64 sayisi piksel olcegi; birim karsiligi ~1.0.
2. **`cat2` alani eklendi.** Sema tek `cat` tanimliyor ama Dunya 4 iki kedi
   istiyor. Cozum eklemeli: `cat` aynen duruyor, `cat2` opsiyonel.
   `schema.normalize` ikisini `cats[]` olarak duzlestiriyor.
3. **Kedi icin sonumleme sabitleri eklendi** (`config.cat.linearDamping`,
   `angularDamping`, `rollingResistance`). Cember cisim Coulomb surtunmesiyle
   yuvarlanmayi birakmaz; kazanma kosulu `|v| < 0.5` oldugu icin kedinin
   durabilmesi gerekiyor.

## Faz durumu

- **Faz 0 — bitti**: mimari, config, sema + dogrulayici, build/verify/test/smoke
  hatti, WebView sertlestirilmis kabuk, Bolum 1 (sema capasi ve Faz 2 test bolumu).
- **Faz 1 — sirada**: fizik motoru + birim testleri. Gorselsiz.
- Faz 2 cizim sistemi, Faz 3 render, Faz 4 50 bolum + verify, Faz 5 UI/ses,
  Faz 6 tek dosya sertlestirme ve kabul listesi.

`verify.js` su anda 1., 2. ve 3. kontrolu `INK.Sim` yuklu olmadigi icin
ATLANDI raporluyor ve "TESLIME HAZIR: HAYIR" diyor — Faz 1/2 gelince
kendiliginden devreye girecekler.
