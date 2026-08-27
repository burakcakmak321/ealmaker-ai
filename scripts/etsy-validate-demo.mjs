/**
 * Doğrulama motoru kontrol script'i — GERÇEK kaynağı çalıştırır.
 *
 * Bu repoda test altyapısı yok; bu script fiilî test paketi görevi görür.
 * lib/etsy/validate.ts içindeki üretim kodunu import eder ve Etsy kurallarını
 * düşmanca girdilerle sınar.
 *
 * Çalıştırma:  npm run etsy:check
 */

import {
  ETSY_LIMITS,
  sanitizeTag,
  normalizeTagsList,
  truncateAtWordBoundary,
  validateTitle,
  validateDescription,
  validateMaterials,
  validateListingContent,
  diffContent,
} from "../lib/etsy/validate.ts";

let failures = 0;
let total = 0;

function check(label, actual, expected) {
  total++;
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures++;
  const shown = typeof actual === "string" ? actual : JSON.stringify(actual);
  const want = typeof expected === "string" ? expected : JSON.stringify(expected);
  console.log(`${ok ? "✅" : "❌"} ${label}${ok ? `: ${shown}` : `\n     aldı: ${shown}\n     bekledi: ${want}`}`);
}

function section(name) {
  console.log(`\n=== ${name} ===`);
}

/* -------------------------------- sınır sabitleri ------------------------------- */

section("Etsy sınır sabitleri");
check("başlık üst sınırı", ETSY_LIMITS.TITLE_MAX, 140);
check("etiket sayısı", ETSY_LIMITS.TAGS_MAX, 13);
check("etiket karakter sınırı", ETSY_LIMITS.TAG_MAX_CHARS, 20);
check("malzeme sayısı", ETSY_LIMITS.MATERIALS_MAX, 13);
check("malzeme karakter sınırı", ETSY_LIMITS.MATERIAL_MAX_CHARS, 45);

/* --------------------------------- etiket temizleme ----------------------------- */

section("Etiket temizleme (sanitizeTag)");
const TAG_CASES = [
  ["personalized gift", "personalized gift", "normal etiket korunmalı"],
  ["Personalized Gift", "personalized gift", "büyük harf küçültülmeli"],
  ["dog collar 🐕", "dog collar", "emoji temizlenmeli"],
  ["dog, collar", "dog collar", "virgül temizlenmeli"],
  ["  spaced   out  ", "spaced out", "fazla boşluk sadeleşmeli"],
  ["-leading dash", "leading dash", "baştaki tire atılmalı"],
  ["trailing dash-", "trailing dash", "sondaki tire atılmalı"],
  ["mother's day", "mother's day", "kelime içi kesme işareti kalmalı"],
  ["’curly quote’", "curly quote", "tipografik tırnak düzleşmeli"],
  ["custom-made gift", "custom-made gift", "kelime içi tire kalmalı"],
  ["kişiye özel hediye", "kişiye özel hediye", "Türkçe karakter korunmalı"],
  ["50% off sale", "50 off sale", "yüzde işareti temizlenmeli"],
  ["a".repeat(20), "a".repeat(20), "tam 20 karakter geçmeli"],
  ["a".repeat(21), null, "21 karakter düşmeli"],
  ["!!!", null, "sadece noktalama düşmeli"],
  ["", null, "boş etiket düşmeli"],
  ["🎁🎁🎁", null, "sadece emoji düşmeli"],
];
for (const [input, expected, label] of TAG_CASES) {
  check(`${label} — "${input}"`, sanitizeTag(input), expected);
}

/* --------------------------------- etiket listesi -------------------------------- */

section("Etiket listesi (normalizeTagsList)");

const fourteen = Array.from({ length: 14 }, (_, i) => `tag number ${i}`);
check("14 etiket 13'e inmeli", normalizeTagsList(fourteen).tags.length, 13);
check("Gift/gift/GIFT tekilleşmeli", normalizeTagsList(["Gift", "gift", "GIFT"]).tags, ["gift"]);

const pool = ["pool one", "pool two", "pool three"];
check("boş slotlar havuzdan dolmalı", normalizeTagsList(["only one"], pool).tags.length, 4);
check("havuzdaki tekrar eklenmemeli", normalizeTagsList(["pool one"], pool).tags.length, 3);
check(
  "geçersizler düşüp havuzdan yerine gelmeli",
  normalizeTagsList(["good tag", "🎁🎁", "x".repeat(30)], pool).tags,
  ["good tag", "pool one", "pool two", "pool three"]
);
check(
  "her düzeltme bir issue üretmeli",
  normalizeTagsList(["Gift", "gift"]).issues.some((i) => i.code === "tag_duplicate"),
  true
);

/* ----------------------------------- başlık -------------------------------------- */

section("Başlık");

const longTitle =
  "Personalized Dog Collar Custom Engraved Name Leather Pet Collar Handmade Gift For Dog Lovers With Brass Hardware And Adjustable Buckle Extra Words Here";
const cut = truncateAtWordBoundary(longTitle, 140);
check("140'ı aşmamalı", cut.length <= 140, true);
check("kelime ortasından bölmemeli", longTitle.startsWith(cut), true);
check("kısa başlık değişmemeli", truncateAtWordBoundary("Short title", 140), "Short title");

const longRes = validateTitle(longTitle);
check("uzun başlık kırpılmalı", longRes.value.length <= 140, true);
check("kırpma 'fixed' olarak raporlanmalı", longRes.issues.some((i) => i.code === "title_truncated" && i.severity === "fixed"), true);
check("boş başlık engelleyici olmalı", validateTitle("").issues[0].severity, "blocking");
check("çok kısa başlık engelleyici olmalı", validateTitle("Dog").issues.some((i) => i.code === "title_too_short" && i.severity === "blocking"), true);
check("başlıktaki link temizlenmeli", validateTitle("Dog Collar https://spam.com Custom").value.includes("http"), false);
check("tamamı büyük harf uyarı vermeli", validateTitle("PERSONALIZED DOG COLLAR CUSTOM").issues.some((i) => i.code === "title_all_caps"), true);

/* ---------------------------------- açıklama ------------------------------------- */

section("Açıklama");

check("boş açıklama engelleyici", validateDescription("").issues[0].severity, "blocking");
check("çok kısa açıklama engelleyici", validateDescription("Too short.").issues.some((i) => i.code === "desc_too_short" && i.severity === "blocking"), true);
check("HTML temizlenmeli", validateDescription(`<b>Bold</b> ${"x".repeat(200)}`).value.includes("<b>"), false);
check("link temizlenmeli", validateDescription(`Visit https://example.com ${"x".repeat(200)}`).value.includes("http"), false);
check("e-posta temizlenmeli", validateDescription(`Mail a@b.com ${"x".repeat(200)}`).value.includes("@"), false);

const longDesc = "Paragraph one is here.\n\n" + "word ".repeat(800);
const descRes = validateDescription(longDesc);
check("uzun açıklama 2000'e inmeli", descRes.value.length <= 2000, true);
check("kırpma raporlanmalı", descRes.issues.some((i) => i.code === "desc_truncated"), true);

/* ---------------------------------- malzemeler ----------------------------------- */

section("Malzemeler");
check("13 malzeme sınırı", validateMaterials(Array.from({ length: 15 }, (_, i) => `material ${i}`)).value.length, 13);
check("uzun malzeme kırpılmalı", validateMaterials(["m".repeat(60)]).value[0].length <= 45, true);
check("tekrar temizlenmeli", validateMaterials(["Leather", "leather"]).value, ["leather"]);

/* ------------------------------ uçtan uca doğrulama ------------------------------ */

section("Uçtan uca (validateListingContent)");

const goodInput = {
  title: "Personalized Dog Collar Custom Engraved Name Leather Pet Collar Gift",
  description: "Handmade leather dog collar, engraved with your pet's name. " + "Made to order in our studio with solid brass hardware. ".repeat(4),
  tags: ["personalized gift", "dog collar", "engraved collar", "leather collar", "custom pet gift"],
  materials: ["leather", "brass"],
};
const good = validateListingContent(goodInput, { candidateTagPool: ["pet lover gift", "dog name tag", "custom dog collar"] });
check("geçerli içerik ok olmalı", good.ok, true);
check("etiket slotları havuzdan dolmalı", good.value.tags.length, 8);
check("engelleyici hata olmamalı", good.blocking.length, 0);

const badInput = { title: "", description: "short", tags: [] };
const bad = validateListingContent(badInput);
check("bozuk içerik ok OLMAMALI", bad.ok, false);
check("engelleyici hatalar listelenmeli", bad.blocking.length >= 3, true);

const identical = validateListingContent(good.value, { previous: good.value });
check("aynı içerik engellenmeli", identical.blocking.some((i) => i.code === "content_identical"), true);

const risky = validateListingContent(
  { ...goodInput, description: "Free shipping and best seller! " + goodInput.description },
  {}
);
check("riskli ifade uyarı vermeli", risky.warnings.some((i) => i.code === "risky_phrase"), true);
check("riskli ifade ENGELLEMEMELİ", risky.ok, true);

const drastic = validateListingContent(
  { ...goodInput, title: "Completely Unrelated Ceramic Vase Home Decor Item Handmade" },
  { previous: { ...good.value, title: "Personalized Dog Collar Custom Engraved Name" } }
);
check("ani başlık değişimi uyarı vermeli", drastic.warnings.some((i) => i.code === "drastic_title_change"), true);

/* -------------------------------------- diff ------------------------------------- */

section("Diff");
const d = diffContent(
  { title: "Old", description: "A", tags: ["a", "b"], materials: [] },
  { title: "New", description: "A", tags: ["b", "c"], materials: [] }
);
check("başlık değişimi görülmeli", d.titleChanged, true);
check("açıklama değişmemiş görülmeli", d.descriptionChanged, false);
check("eklenen etiket", d.tagsAdded, ["c"]);
check("çıkarılan etiket", d.tagsRemoved, ["a"]);

/* -------------------------------------- sonuç ------------------------------------ */

console.log("\n" + "=".repeat(52));
if (failures === 0) {
  console.log(`✅ ${total} kontrolün tamamı geçti.`);
  process.exit(0);
} else {
  console.log(`❌ ${total} kontrolden ${failures} tanesi başarısız.`);
  process.exit(1);
}
