/**
 * Rakip analizi motorunu örnek veriyle çalıştırır ve çıktıyı tabloya basar.
 *
 * API anahtarı GEREKMEZ — fixture'lar üzerinde çalışır. Amacı, analiz
 * matematiğinin (frekans, percentile, n-gram, aday etiket havuzu) doğru
 * çalıştığını canlı API olmadan gözle ve iddialarla doğrulamaktır.
 *
 * Çalıştırma:  npm run etsy:analyze
 */

import { analyzeCompetitors, diffOwnVsMarket, percentile } from "../lib/etsy/analyze.ts";
import { SAMPLE_LISTINGS, SAMPLE_OWN_LISTINGS } from "../lib/etsy/fixtures/listings.sample.ts";
import { toListingContent, moneyToNumber } from "../lib/etsy/types.ts";

let failures = 0;
let total = 0;
function assert(label, actual, expected) {
  total++;
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures++;
  console.log(`${ok ? "✅" : "❌"} ${label}${ok ? "" : `\n     aldı: ${JSON.stringify(actual)} / bekledi: ${JSON.stringify(expected)}`}`);
}

const NOW = new Date("2025-08-24T00:00:00Z");
const analysis = analyzeCompetitors("personalized dog collar", SAMPLE_LISTINGS, { now: NOW });

console.log("╔" + "═".repeat(62) + "╗");
console.log("║  RAKİP ANALİZİ — örnek veri (ETSY_MOCK)".padEnd(63) + "║");
console.log("╚" + "═".repeat(62) + "╝");
console.log(`\nAnahtar kelime : ${analysis.seedKeyword}`);
console.log(`Örneklem       : ${analysis.sampleSize} aktif ilan`);

console.log("\n── En sık rakip etiketleri ──────────────────────────────");
console.log("  etiket                 ilan   pay    ort.favori  medyan fiyat");
for (const t of analysis.topTags.slice(0, 12)) {
  const bar = "█".repeat(Math.round(t.share * 20));
  console.log(
    `  ${t.tag.padEnd(22)} ${String(t.count).padStart(3)}  ${(t.share * 100).toFixed(0).padStart(3)}%  ` +
      `${String(t.avgFavorers).padStart(6)}      ${t.medianPrice === null ? "   -" : t.medianPrice.toFixed(2).padStart(6)}  ${bar}`
  );
}

console.log("\n── Başlık kalıpları (2 kelimelik) ───────────────────────");
for (const b of analysis.topBigrams.slice(0, 10)) {
  console.log(`  ${b.phrase.padEnd(28)} ${String(b.count).padStart(3)} ilan  (${(b.share * 100).toFixed(0)}%)`);
}

console.log("\n── Fiyat dağılımı ───────────────────────────────────────");
if (analysis.price) {
  const p = analysis.price;
  console.log(`  ${p.currency}  min ${p.min}  |  p25 ${p.p25}  |  MEDYAN ${p.median}  |  p75 ${p.p75}  |  max ${p.max}`);
  console.log(`  ortalama ${p.mean}  (${p.sampleSize} ilan)`);
}

console.log("\n── Favori sayısı ────────────────────────────────────────");
console.log(`  medyan ${analysis.favorers.median}  |  p90 ${analysis.favorers.p90}  |  max ${analysis.favorers.max}`);

console.log("\n── Başlık uzunluğu ──────────────────────────────────────");
console.log(
  `  ${analysis.titleLength.minChars}–${analysis.titleLength.maxChars} karakter, medyan ${analysis.titleLength.medianChars} (${analysis.titleLength.medianWords} kelime)`
);

console.log("\n── Malzemeler ───────────────────────────────────────────");
console.log("  " + analysis.topMaterials.slice(0, 8).map((m) => `${m.material} (${m.count})`).join(", "));

console.log("\n── İlan yaşı ────────────────────────────────────────────");
console.log(`  medyan ${analysis.age.medianDays} gün  |  son 90 günde açılan: %${(analysis.age.freshShare * 100).toFixed(0)}`);

console.log("\n── Aday etiket havuzu (doğrulayıcı bunu kullanır) ───────");
console.log("  " + analysis.candidateTagPool.slice(0, 15).join(" · "));

/* --------------------- kendi ilanım vs pazar --------------------- */

const own = SAMPLE_OWN_LISTINGS[0];
const gap = diffOwnVsMarket(
  { ...toListingContent(own), price: moneyToNumber(own.price) },
  analysis
);

console.log("\n╔" + "═".repeat(62) + "╗");
console.log("║  KENDİ İLANIM vs PAZAR".padEnd(63) + "║");
console.log("╚" + "═".repeat(62) + "╝");
console.log(`\nİlan: "${own.title}"`);
console.log(`Mevcut etiketler (${own.tags.length}/13): ${own.tags.join(", ")}`);
console.log(`\n⚠️  Boş etiket slotu     : ${gap.tagSlotsFree}`);
console.log(`⚠️  Kaçırılan pazar etiketi: ${gap.missingTopTags.slice(0, 8).join(", ")}`);
console.log(`⚠️  Pazarda karşılığı yok  : ${gap.unusedOwnTags.join(", ") || "—"}`);
console.log(`⚠️  Başlıkta eksik kalıplar: ${gap.titleGapPhrases.slice(0, 5).join(" | ")}`);
console.log(`💰 Fiyat konumu           : ${gap.pricePosition}`);
console.log(`📏 Başlık medyana göre    : ${gap.titleCharsVsMedian > 0 ? "+" : ""}${gap.titleCharsVsMedian} karakter`);

/* ------------------------- doğrulamalar -------------------------- */

console.log("\n╔" + "═".repeat(62) + "╗");
console.log("║  MATEMATİK DOĞRULAMALARI".padEnd(63) + "║");
console.log("╚" + "═".repeat(62) + "╝\n");

assert("percentile: medyan", percentile([1, 2, 3, 4, 5], 0.5), 3);
assert("percentile: interpolasyon", percentile([0, 10], 0.25), 2.5);
assert("percentile: alt sınır", percentile([5, 10], 0), 5);
assert("percentile: üst sınır", percentile([5, 10], 1), 10);
assert("percentile: boş dizi", percentile([], 0.5), 0);

assert("örneklem tüm fixture'ları almalı", analysis.sampleSize, SAMPLE_LISTINGS.length);
assert("en sık etiket tüm ilanlarda geçmeli", analysis.topTags[0].count, SAMPLE_LISTINGS.length);
assert("en sık etiketin payı %100 olmalı", analysis.topTags[0].share, 1);
assert("'dog collar' ilk üçte olmalı", analysis.topTags.slice(0, 3).some((t) => t.tag === "dog collar"), true);
assert("taze ilan oranı hesaplanmalı", analysis.age.freshShare > 0, true);
assert("etiket payı 0..1 aralığında", analysis.topTags.every((t) => t.share > 0 && t.share <= 1), true);
assert("etiketler azalan sırada", analysis.topTags.every((t, i, a) => i === 0 || a[i - 1].count >= t.count), true);
assert("her etiket 20 karakterden kısa", analysis.candidateTagPool.every((t) => t.length <= 20), true);
assert("aday havuzu boş olmamalı", analysis.candidateTagPool.length > 10, true);
assert("fiyat sıralı olmalı", analysis.price.min <= analysis.price.p25 && analysis.price.p25 <= analysis.price.median && analysis.price.median <= analysis.price.p75 && analysis.price.p75 <= analysis.price.max, true);
assert("favori p90 >= medyan", analysis.favorers.p90 >= analysis.favorers.median, true);

// Doküman frekansı: bir ilanda tekrarlanan ifade bir kez sayılmalı.
const repeated = [{
  ...SAMPLE_LISTINGS[0],
  listing_id: 99999,
  title: "dog collar dog collar dog collar dog collar",
  tags: ["dog collar", "dog collar", "dog collar"],
}];
const repeatAnalysis = analyzeCompetitors("dog collar", [...repeated, ...repeated.map((r) => ({ ...r, listing_id: 99998 }))], { now: NOW });
assert("aynı ilandaki etiket tekrarı bir kez sayılmalı", repeatAnalysis.topTags[0].count, 2);
assert("aynı ilandaki n-gram tekrarı bir kez sayılmalı", repeatAnalysis.topBigrams[0].count, 2);

// Kendi mağazamız rakip sayılmamalı.
const excluded = analyzeCompetitors("dog collar", SAMPLE_LISTINGS, { now: NOW, excludeShopId: 501 });
assert("excludeShopId kendi ilanlarımızı çıkarmalı", excluded.sourceListingIds.some((id) => [1001, 1006, 1023].includes(id)), false);

// Tag'siz ve pasif ilanlar elenmeli.
const noisy = [
  { ...SAMPLE_LISTINGS[0], listing_id: 88881, tags: [] },
  { ...SAMPLE_LISTINGS[1], listing_id: 88882, state: "inactive" },
  SAMPLE_LISTINGS[2],
];
assert("tag'siz ve pasif ilanlar elenmeli", analyzeCompetitors("x", noisy, { now: NOW }).sampleSize, 1);

console.log("\n" + "=".repeat(52));
if (failures === 0) {
  console.log(`✅ ${total} doğrulamanın tamamı geçti.`);
  process.exit(0);
} else {
  console.log(`❌ ${total} doğrulamadan ${failures} tanesi başarısız.`);
  process.exit(1);
}
