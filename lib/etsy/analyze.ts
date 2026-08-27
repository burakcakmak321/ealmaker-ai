/**
 * Rakip analizi — TAMAMEN DETERMİNİSTİK, LLM YOK.
 *
 * Bu modül Etsy'den gelen gerçek ilan verisini sayar. Yapay zekâ bu dosyada
 * hiçbir rol oynamaz; LLM yalnızca buradan çıkan sayılara BAKARAK metin yazar.
 * "Uydurma değil gerçek sonuç" garantisi bu ayrımdan gelir: tüm istatistikler
 * ölçülmüş veridir, tahmin değildir.
 */

import { sanitizeTag } from "./validate";
import { moneyToNumber } from "./types";
import type { EtsyListing, ListingContent } from "./types";

const MAX_SAMPLE = 100;

export type TagStat = {
  /** küçük harfe indirgenmiş biçim */
  tag: string;
  /** rakiplerde en sık geçen özgün yazım */
  display: string;
  /** kaç rakip ilanda geçiyor */
  count: number;
  /** count / sampleSize (0..1) */
  share: number;
  avgFavorers: number;
  medianPrice: number | null;
};

export type NgramStat = { phrase: string; n: 1 | 2 | 3; count: number; share: number };
export type MaterialStat = { material: string; count: number; share: number };

export type PriceStats = {
  currency: string;
  sampleSize: number;
  min: number;
  p25: number;
  median: number;
  p75: number;
  max: number;
  mean: number;
};

export type FavorersStats = { min: number; median: number; p90: number; max: number; mean: number };
export type TaxonomyStat = { taxonomyId: number; count: number; share: number };

export type CompetitorAnalysis = {
  version: 1;
  seedKeyword: string;
  fetchedAt: string;
  sampleSize: number;
  sourceListingIds: number[];
  topTags: TagStat[];
  topUnigrams: NgramStat[];
  topBigrams: NgramStat[];
  topTrigrams: NgramStat[];
  topMaterials: MaterialStat[];
  price: PriceStats | null;
  favorers: FavorersStats;
  taxonomy: TaxonomyStat[];
  titleLength: { minChars: number; medianChars: number; maxChars: number; medianWords: number };
  age: { medianDays: number; freshShare: number };
  /** Doğrulayıcının boş etiket slotlarını doldurmak için kullandığı havuz. */
  candidateTagPool: string[];
};

/* --------------------------------- yardımcılar -------------------------------- */

/** Sıralı dizide lineer interpolasyonlu yüzdelik. */
export function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  if (sorted.length === 1) return sorted[0];
  const idx = (sorted.length - 1) * Math.min(1, Math.max(0, p));
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

function median(values: number[]): number {
  return percentile([...values].sort((a, b) => a - b), 0.5);
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/** Başlık n-gram'larından çıkarılan işlev kelimeleri. */
export const STOPWORDS: ReadonlySet<string> = new Set([
  "a", "an", "the", "and", "or", "for", "with", "of", "to", "in", "on", "at", "by",
  "from", "your", "you", "my", "our", "it", "its", "is", "are", "be", "this", "that",
  "as", "so", "if", "no", "not", "but", "up", "out", "off", "per", "via", "plus",
]);

export function tokenizeTitle(title: string): string[] {
  return title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t) && !/^\d+$/.test(t));
}

export function normalizeTag(raw: string): string {
  return String(raw).normalize("NFKC").replace(/[‘’ʼ]/g, "'").replace(/\s+/g, " ").trim().toLowerCase();
}

/* ------------------------------- toplama işlevleri ---------------------------- */

export function aggregateTags(
  listings: EtsyListing[],
  opts: { top?: number; minCount?: number } = {}
): TagStat[] {
  const top = opts.top ?? 40;
  const minCount = opts.minCount ?? 2;
  const sampleSize = listings.length || 1;

  type Acc = { count: number; favorers: number[]; prices: number[]; forms: Map<string, number> };
  const acc = new Map<string, Acc>();

  for (const listing of listings) {
    // Aynı ilandaki tekrarları bir kez say.
    const seen = new Set<string>();
    for (const raw of listing.tags ?? []) {
      const key = normalizeTag(raw);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      let entry = acc.get(key);
      if (!entry) {
        entry = { count: 0, favorers: [], prices: [], forms: new Map() };
        acc.set(key, entry);
      }
      entry.count++;
      entry.favorers.push(listing.num_favorers ?? 0);
      const price = moneyToNumber(listing.price);
      if (price !== null) entry.prices.push(price);
      const form = String(raw).trim();
      entry.forms.set(form, (entry.forms.get(form) ?? 0) + 1);
    }
  }

  return Array.from(acc.entries())
    .filter(([, v]) => v.count >= minCount)
    .map(([tag, v]) => {
      let display = tag;
      let best = 0;
      for (const [form, n] of v.forms) if (n > best) { best = n; display = form; }
      return {
        tag,
        display,
        count: v.count,
        share: v.count / sampleSize,
        avgFavorers: Math.round(mean(v.favorers)),
        medianPrice: v.prices.length ? Number(median(v.prices).toFixed(2)) : null,
      };
    })
    .sort((a, b) => b.count - a.count || b.avgFavorers - a.avgFavorers)
    .slice(0, top);
}

/**
 * n-gram frekansı — DOKÜMAN frekansı olarak sayılır: bir ifade tek bir ilanda
 * beş kez geçse bile bir sayılır. Ham frekans, başlığında kelimeyi tekrarlayan
 * tek bir ilanı pazar trendi gibi gösterirdi.
 */
export function aggregateNgrams(listings: EtsyListing[], n: 1 | 2 | 3, top: number): NgramStat[] {
  const sampleSize = listings.length || 1;
  const counts = new Map<string, number>();

  for (const listing of listings) {
    const tokens = tokenizeTitle(listing.title ?? "");
    const seen = new Set<string>();
    for (let i = 0; i + n <= tokens.length; i++) {
      const phrase = tokens.slice(i, i + n).join(" ");
      if (seen.has(phrase)) continue;
      seen.add(phrase);
      counts.set(phrase, (counts.get(phrase) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .filter(([, count]) => count >= 2)
    .map(([phrase, count]) => ({ phrase, n, count, share: count / sampleSize }))
    .sort((a, b) => b.count - a.count || a.phrase.localeCompare(b.phrase))
    .slice(0, top);
}

export function aggregateMaterials(listings: EtsyListing[], top = 15): MaterialStat[] {
  const sampleSize = listings.length || 1;
  const counts = new Map<string, number>();
  for (const listing of listings) {
    const seen = new Set<string>();
    for (const raw of listing.materials ?? []) {
      const key = normalizeTag(raw);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([material, count]) => ({ material, count, share: count / sampleSize }))
    .sort((a, b) => b.count - a.count)
    .slice(0, top);
}

export function priceStats(listings: EtsyListing[]): PriceStats | null {
  // Baskın para birimini seç; farklı birimleri karıştırmak istatistiği bozar.
  const byCurrency = new Map<string, number[]>();
  for (const listing of listings) {
    const value = moneyToNumber(listing.price);
    if (value === null || !listing.price) continue;
    const cur = listing.price.currency_code || "USD";
    const arr = byCurrency.get(cur) ?? [];
    arr.push(value);
    byCurrency.set(cur, arr);
  }
  if (byCurrency.size === 0) return null;

  let currency = "";
  let values: number[] = [];
  for (const [cur, arr] of byCurrency) {
    if (arr.length > values.length) { currency = cur; values = arr; }
  }

  const sorted = [...values].sort((a, b) => a - b);
  const round = (n: number) => Number(n.toFixed(2));
  return {
    currency,
    sampleSize: sorted.length,
    min: round(sorted[0]),
    p25: round(percentile(sorted, 0.25)),
    median: round(percentile(sorted, 0.5)),
    p75: round(percentile(sorted, 0.75)),
    max: round(sorted[sorted.length - 1]),
    mean: round(mean(sorted)),
  };
}

export function favorersStats(listings: EtsyListing[]): FavorersStats {
  const values = listings.map((l) => l.num_favorers ?? 0);
  if (values.length === 0) return { min: 0, median: 0, p90: 0, max: 0, mean: 0 };
  const sorted = [...values].sort((a, b) => a - b);
  return {
    min: sorted[0],
    median: Math.round(percentile(sorted, 0.5)),
    p90: Math.round(percentile(sorted, 0.9)),
    max: sorted[sorted.length - 1],
    mean: Math.round(mean(sorted)),
  };
}

export function taxonomyDistribution(listings: EtsyListing[], top = 5): TaxonomyStat[] {
  const sampleSize = listings.length || 1;
  const counts = new Map<number, number>();
  for (const l of listings) {
    if (typeof l.taxonomy_id !== "number") continue;
    counts.set(l.taxonomy_id, (counts.get(l.taxonomy_id) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([taxonomyId, count]) => ({ taxonomyId, count, share: count / sampleSize }))
    .sort((a, b) => b.count - a.count)
    .slice(0, top);
}

export function titleLengthStats(listings: EtsyListing[]): CompetitorAnalysis["titleLength"] {
  const lengths = listings.map((l) => (l.title ?? "").length).filter((n) => n > 0);
  const words = listings.map((l) => (l.title ?? "").trim().split(/\s+/).filter(Boolean).length);
  if (lengths.length === 0) return { minChars: 0, medianChars: 0, maxChars: 0, medianWords: 0 };
  const sorted = [...lengths].sort((a, b) => a - b);
  return {
    minChars: sorted[0],
    medianChars: Math.round(percentile(sorted, 0.5)),
    maxChars: sorted[sorted.length - 1],
    medianWords: Math.round(median(words)),
  };
}

export function ageStats(listings: EtsyListing[], now = new Date()): CompetitorAnalysis["age"] {
  const nowSec = Math.floor(now.getTime() / 1000);
  const days = listings
    .map((l) => l.original_creation_timestamp)
    .filter((t): t is number => typeof t === "number" && t > 0)
    .map((t) => Math.max(0, (nowSec - t) / 86_400));
  if (days.length === 0) return { medianDays: 0, freshShare: 0 };
  return {
    medianDays: Math.round(median(days)),
    freshShare: Number((days.filter((d) => d < 90).length / days.length).toFixed(2)),
  };
}

/**
 * Yedek etiket havuzu. Sıralama: pazar yaygınlığı %60, favori korelasyonu %25,
 * çok kelimeli ifade bonusu %15 (Etsy çok kelimeli etiketlerde daha iyi eşleşir).
 * Havuza giren her etiket `sanitizeTag`'den geçer — yani doğrudan kullanılabilir.
 */
export function buildCandidateTagPool(
  input: { topTags: TagStat[]; topBigrams: NgramStat[]; favorers: FavorersStats },
  seedKeyword: string
): string[] {
  const maxFav = Math.max(1, input.favorers.max);
  const scored = new Map<string, number>();

  for (const t of input.topTags) {
    const clean = sanitizeTag(t.tag);
    if (!clean) continue;
    const favScore = Math.min(1, t.avgFavorers / maxFav);
    const wordBonus = clean.includes(" ") ? 1 : 0;
    scored.set(clean, t.share * 0.6 + favScore * 0.25 + wordBonus * 0.15);
  }

  // Etiket olmayan güçlü bigram'lar da iyi aday: Etsy çok kelimeli aramada eşler.
  for (const b of input.topBigrams) {
    const clean = sanitizeTag(b.phrase);
    if (!clean || scored.has(clean)) continue;
    scored.set(clean, b.share * 0.45 + 0.15);
  }

  const seed = sanitizeTag(seedKeyword);
  if (seed && !scored.has(seed)) scored.set(seed, 1);

  return Array.from(scored.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag)
    .slice(0, 40);
}

/* --------------------------------- ana giriş ---------------------------------- */

export type AnalyzeOptions = {
  now?: Date;
  /** Kendi mağazamızı rakip sayma. */
  excludeShopId?: number;
};

export function analyzeCompetitors(
  seedKeyword: string,
  listings: EtsyListing[],
  opts: AnalyzeOptions = {}
): CompetitorAnalysis {
  const filtered = listings
    .filter((l) => l.state === "active")
    .filter((l) => (opts.excludeShopId ? l.shop_id !== opts.excludeShopId : true))
    .filter((l) => Array.isArray(l.tags) && l.tags.length > 0)
    .slice(0, MAX_SAMPLE);

  const topTags = aggregateTags(filtered);
  const topBigrams = aggregateNgrams(filtered, 2, 25);
  const favorers = favorersStats(filtered);

  return {
    version: 1,
    seedKeyword,
    fetchedAt: (opts.now ?? new Date()).toISOString(),
    sampleSize: filtered.length,
    sourceListingIds: filtered.map((l) => l.listing_id),
    topTags,
    topUnigrams: aggregateNgrams(filtered, 1, 25),
    topBigrams,
    topTrigrams: aggregateNgrams(filtered, 3, 15),
    topMaterials: aggregateMaterials(filtered),
    price: priceStats(filtered),
    favorers,
    taxonomy: taxonomyDistribution(filtered),
    titleLength: titleLengthStats(filtered),
    age: ageStats(filtered, opts.now),
    candidateTagPool: buildCandidateTagPool({ topTags, topBigrams, favorers }, seedKeyword),
  };
}

/* ----------------------------- kendi ilanım vs pazar --------------------------- */

export type OwnVsMarket = {
  missingTopTags: string[];
  unusedOwnTags: string[];
  titleGapPhrases: string[];
  pricePosition: "below" | "in_range" | "above" | "unknown";
  tagSlotsFree: number;
  titleCharsVsMedian: number;
};

/** Kullanıcının ilanını pazar verisiyle karşılaştırır — hangi fırsat kaçıyor? */
export function diffOwnVsMarket(
  own: ListingContent & { price?: number | null },
  analysis: CompetitorAnalysis
): OwnVsMarket {
  const ownTags = new Set((own.tags ?? []).map(normalizeTag));
  const marketTags = new Set(analysis.topTags.map((t) => t.tag));

  const missingTopTags = analysis.topTags
    .slice(0, 15)
    .filter((t) => !ownTags.has(t.tag))
    .map((t) => t.tag);

  const unusedOwnTags = Array.from(ownTags).filter((t) => !marketTags.has(t));

  const ownTitleTokens = new Set(tokenizeTitle(own.title ?? ""));
  const titleGapPhrases = analysis.topBigrams
    .filter((b) => !b.phrase.split(" ").every((w) => ownTitleTokens.has(w)))
    .slice(0, 8)
    .map((b) => b.phrase);

  let pricePosition: OwnVsMarket["pricePosition"] = "unknown";
  if (analysis.price && typeof own.price === "number") {
    if (own.price < analysis.price.p25) pricePosition = "below";
    else if (own.price > analysis.price.p75) pricePosition = "above";
    else pricePosition = "in_range";
  }

  return {
    missingTopTags,
    unusedOwnTags,
    titleGapPhrases,
    pricePosition,
    tagSlotsFree: Math.max(0, 13 - (own.tags?.length ?? 0)),
    titleCharsVsMedian: (own.title ?? "").length - analysis.titleLength.medianChars,
  };
}
