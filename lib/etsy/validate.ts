/**
 * Etsy içerik kuralları motoru — "otomatik ama hatasız" garantisinin çekirdeği.
 *
 * Tamamen saf fonksiyonlardan oluşur (ağ yok, yan etki yok) ki hem sunucuda
 * hem istemcide aynı sonucu versin.
 *
 * Üç seviye vardır:
 *  - fixed    : güvenle otomatik düzeltildi, işlem devam eder
 *  - warning  : şüpheli ama yasak değil, kullanıcı açıkça onaylamalı
 *  - blocking : Etsy'ye ASLA yazılmaz
 *
 * DEĞİŞMEZ KURAL: yazma yolundaki doğrulama sunucuda, Etsy'den yeniden
 * çekilmiş canlı veriyle yapılır. İstemciden gelen "ok" bilgisine güvenilmez.
 */

import { EtsyValidationError } from "./errors";
import type { ListingContent } from "./types";

export const ETSY_LIMITS = {
  TITLE_MAX: 140,
  /** Hedef: 140'a 10 karakter pay bırakırız. */
  TITLE_TARGET: 130,
  TITLE_MIN: 10,
  DESC_TARGET_MAX: 2000,
  DESC_MIN: 120,
  TAGS_MAX: 13,
  TAG_MAX_CHARS: 20,
  MATERIALS_MAX: 13,
  MATERIAL_MAX_CHARS: 45,
} as const;

export type IssueSeverity = "blocking" | "fixed" | "warning";
export type IssueField = "title" | "description" | "tags" | "materials" | "content";

export type ValidationIssue = {
  field: IssueField;
  code: string;
  severity: IssueSeverity;
  /** Kullanıcıya gösterilecek Türkçe açıklama. */
  messageTr: string;
  detail?: string;
};

export type ValidationResult = {
  ok: boolean;
  value: ListingContent;
  issues: ValidationIssue[];
  blocking: ValidationIssue[];
  fixes: ValidationIssue[];
  warnings: ValidationIssue[];
};

function issue(
  field: IssueField,
  code: string,
  severity: IssueSeverity,
  messageTr: string,
  detail?: string
): ValidationIssue {
  return { field, code, severity, messageTr, detail };
}

/* ------------------------------- metin araçları ------------------------------ */

/** Tipografik tırnak/tireleri düzleştirir ve Unicode'u normalize eder. */
function normalizeUnicode(s: string): string {
  return s
    .normalize("NFKC")
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—−]/g, "-");
}

export function collapseWhitespace(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

export function stripHtml(s: string): string {
  return s
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

export function stripUrls(s: string): string {
  return s
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/\bwww\.\S+/gi, "")
    .replace(/\b[\w.-]+@[\w.-]+\.\w{2,}\b/gi, "");
}

/** Kelimeyi ortadan bölmeden `max` uzunluğuna kırpar. */
export function truncateAtWordBoundary(s: string, max: number): string {
  if (s.length <= max) return s;
  const slice = s.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ");
  // Boşluk çok başta kalıyorsa kelime sınırı aramak metni mahveder; sert kırp.
  const cut = lastSpace > max * 0.6 ? slice.slice(0, lastSpace) : slice;
  return cut.replace(/[\s,;:.\-|]+$/, "").trim();
}

/** Paragraf sınırında kırpar, olmazsa cümle, olmazsa kelime sınırına düşer. */
export function truncateAtParagraph(s: string, max: number): string {
  if (s.length <= max) return s;
  const slice = s.slice(0, max);
  const lastPara = slice.lastIndexOf("\n\n");
  if (lastPara > max * 0.5) return slice.slice(0, lastPara).trim();
  const lastSentence = Math.max(slice.lastIndexOf(". "), slice.lastIndexOf("! "), slice.lastIndexOf("? "));
  if (lastSentence > max * 0.5) return slice.slice(0, lastSentence + 1).trim();
  return truncateAtWordBoundary(s, max);
}

function countEmoji(s: string): number {
  return (s.match(/\p{Extended_Pictographic}/gu) ?? []).length;
}

/* ---------------------------------- etiketler -------------------------------- */

/**
 * Etsy etiket kuralları: sadece harf, rakam ve boşluk; `'` ve `-` yalnızca
 * kelime içinde. En fazla 20 karakter (boşluklar dahil).
 *
 * Kurala uydurulamıyorsa `null` döner — çağıran taraf bunu düşürüp havuzdan
 * yenisini koyar.
 */
export function sanitizeTag(raw: string): string | null {
  if (typeof raw !== "string") return null;
  let tag = normalizeUnicode(raw);
  // \p{L}/\p{N} Unicode duyarlı: Etsy Latin dışı alfabeleri de kabul eder.
  tag = tag.replace(/[^\p{L}\p{N} '\-]/gu, " ");
  tag = collapseWhitespace(tag).toLowerCase();
  tag = tag.replace(/^[-']+/, "").replace(/[-']+$/, "");
  tag = collapseWhitespace(tag);
  if (!tag) return null;
  if (tag.length > ETSY_LIMITS.TAG_MAX_CHARS) return null;
  return tag;
}

/** İki etiketin Etsy açısından "aynı" sayılıp sayılmayacağı. */
function tagKey(tag: string): string {
  return tag.toLowerCase().replace(/\s+/g, " ").trim();
}

export type NormalizedTags = { tags: string[]; issues: ValidationIssue[] };

/**
 * Etiket listesini Etsy kurallarına uydurur ve eksik kalan slotları
 * `pool` içinden doldurur. Havuz rakip verisinden geldiği için yedek
 * etiketler de ölçülmüş gerçek veridir, model uydurması değil.
 */
export function normalizeTagsList(raw: string[], pool: string[] = []): NormalizedTags {
  const issues: ValidationIssue[] = [];
  const seen = new Set<string>();
  const out: string[] = [];

  for (const original of Array.isArray(raw) ? raw : []) {
    if (out.length >= ETSY_LIMITS.TAGS_MAX) {
      issues.push(
        issue("tags", "tag_dropped_over_limit", "fixed", `13 etiket sınırı aşıldığı için "${original}" çıkarıldı.`, String(original))
      );
      continue;
    }
    const clean = sanitizeTag(String(original));
    if (!clean) {
      issues.push(
        issue("tags", "tag_invalid", "fixed", `"${original}" etiketi Etsy kurallarına uymadığı için çıkarıldı.`, String(original))
      );
      continue;
    }
    if (clean !== String(original).toLowerCase().trim()) {
      issues.push(
        issue("tags", "tag_sanitized", "fixed", `"${original}" → "${clean}" olarak düzeltildi.`, clean)
      );
    }
    const key = tagKey(clean);
    if (seen.has(key)) {
      issues.push(issue("tags", "tag_duplicate", "fixed", `Tekrar eden "${clean}" etiketi çıkarıldı.`, clean));
      continue;
    }
    seen.add(key);
    out.push(clean);
  }

  // Boş slotları rakip verisinden gelen havuzdan doldur.
  for (const candidate of pool) {
    if (out.length >= ETSY_LIMITS.TAGS_MAX) break;
    const clean = sanitizeTag(candidate);
    if (!clean) continue;
    const key = tagKey(clean);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(clean);
    issues.push(
      issue("tags", "tag_backfilled", "fixed", `Boş etiket slotu rakip verisinden "${clean}" ile dolduruldu.`, clean)
    );
  }

  return { tags: out, issues };
}

/* ----------------------------------- alanlar --------------------------------- */

export function validateTitle(raw: string): { value: string; issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];
  if (typeof raw !== "string" || !raw.trim()) {
    return { value: "", issues: [issue("title", "title_empty", "blocking", "Başlık boş olamaz.")] };
  }

  let title = collapseWhitespace(normalizeUnicode(stripUrls(raw)));

  if (title.length > ETSY_LIMITS.TITLE_MAX) {
    const before = title.length;
    title = truncateAtWordBoundary(title, ETSY_LIMITS.TITLE_MAX);
    issues.push(
      issue("title", "title_truncated", "fixed", `Başlık ${before} karakterdi, ${title.length} karaktere kısaltıldı (Etsy sınırı 140).`)
    );
  }

  if (title.length < ETSY_LIMITS.TITLE_MIN) {
    issues.push(issue("title", "title_too_short", "blocking", "Başlık çok kısa (en az 10 karakter olmalı)."));
  }

  // Onarım sonrası hâlâ aşıyorsa bu bir kod hatasıdır; yazmayı engelle.
  if (title.length > ETSY_LIMITS.TITLE_MAX) {
    issues.push(issue("title", "title_over_max", "blocking", "Başlık 140 karakter sınırına indirilemedi."));
  }

  if (title === title.toUpperCase() && /\p{L}/u.test(title)) {
    issues.push(issue("title", "title_all_caps", "warning", "Başlık tamamen büyük harf; Etsy bunu spam sinyali sayabilir."));
  }

  const separators = (title.match(/\|/g) ?? []).length;
  if (separators > 3) {
    issues.push(issue("title", "title_separator_spam", "warning", `Başlıkta ${separators} adet "|" var; okunabilirliği düşürür.`));
  }

  return { value: title, issues };
}

export function validateDescription(
  raw: string,
  opts: { targetMax?: number } = {}
): { value: string; issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];
  if (typeof raw !== "string" || !raw.trim()) {
    return { value: "", issues: [issue("description", "desc_empty", "blocking", "Açıklama boş olamaz.")] };
  }

  const targetMax = opts.targetMax ?? ETSY_LIMITS.DESC_TARGET_MAX;
  let desc = normalizeUnicode(raw);

  const withoutHtml = stripHtml(desc);
  if (withoutHtml !== desc) {
    issues.push(issue("description", "desc_html_stripped", "fixed", "Açıklamadaki HTML etiketleri temizlendi."));
    desc = withoutHtml;
  }

  const withoutUrls = stripUrls(desc);
  if (withoutUrls !== desc) {
    issues.push(issue("description", "desc_urls_stripped", "fixed", "Açıklamadaki bağlantı/e-posta adresleri temizlendi (Etsy dış linke izin vermez)."));
    desc = withoutUrls;
  }

  desc = desc.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();

  if (desc.length > targetMax) {
    const before = desc.length;
    desc = truncateAtParagraph(desc, targetMax);
    issues.push(
      issue("description", "desc_truncated", "fixed", `Açıklama ${before} karakterdi, ${desc.length} karaktere kısaltıldı.`)
    );
  }

  if (desc.length < ETSY_LIMITS.DESC_MIN) {
    issues.push(
      issue("description", "desc_too_short", "blocking", `Açıklama çok kısa (${desc.length} karakter, en az ${ETSY_LIMITS.DESC_MIN} olmalı).`)
    );
  }

  if (countEmoji(desc) > 6) {
    issues.push(issue("description", "emoji_heavy", "warning", "Açıklamada çok fazla emoji var."));
  }

  return { value: desc, issues };
}

export function validateMaterials(raw: string[]): { value: string[]; issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];
  const out: string[] = [];
  const seen = new Set<string>();

  for (const original of Array.isArray(raw) ? raw : []) {
    if (out.length >= ETSY_LIMITS.MATERIALS_MAX) {
      issues.push(issue("materials", "material_dropped", "fixed", `13 malzeme sınırı aşıldı, "${original}" çıkarıldı.`));
      continue;
    }
    let mat = collapseWhitespace(normalizeUnicode(String(original))).toLowerCase();
    mat = mat.replace(/[^\p{L}\p{N} '\-]/gu, " ");
    mat = collapseWhitespace(mat);
    if (!mat) continue;
    if (mat.length > ETSY_LIMITS.MATERIAL_MAX_CHARS) {
      mat = truncateAtWordBoundary(mat, ETSY_LIMITS.MATERIAL_MAX_CHARS);
      issues.push(issue("materials", "material_truncated", "fixed", `"${original}" malzemesi 45 karaktere kısaltıldı.`));
    }
    if (seen.has(mat)) continue;
    seen.add(mat);
    out.push(mat);
  }

  return { value: out, issues };
}

/* ----------------------------- riskli ifadeler ------------------------------- */

const RISKY_PHRASES: Array<{ re: RegExp; label: string }> = [
  { re: /\bfree shipping\b/i, label: "free shipping" },
  { re: /\bbest ?sell(er|ing)\b/i, label: "best seller" },
  { re: /\b100% guarantee/i, label: "100% guaranteed" },
  { re: /\b\d{1,3}\s?% ?off\b/i, label: "indirim yüzdesi" },
  { re: /\bdiscount code\b/i, label: "discount code" },
  { re: /\bfast(est)? shipping\b/i, label: "fast shipping" },
  { re: /[®™©]/, label: "marka sembolü" },
];

function findRiskyPhrases(text: string): string[] {
  return RISKY_PHRASES.filter((p) => p.re.test(text)).map((p) => p.label);
}

/* ------------------------------- ana doğrulayıcı ----------------------------- */

export type ValidateOptions = {
  /** Rakip analizinden gelen, kurallara uygun yedek etiket havuzu. */
  candidateTagPool?: string[];
  /** İlanın Etsy'deki mevcut hâli — değişmediyse yazma harcamayız. */
  previous?: ListingContent;
  descTargetMax?: number;
};

/** İki başlık arasındaki kelime örtüşmesi (Jaccard). */
function jaccard(a: string, b: string): number {
  const setA = new Set(a.toLowerCase().split(/\W+/).filter(Boolean));
  const setB = new Set(b.toLowerCase().split(/\W+/).filter(Boolean));
  if (setA.size === 0 || setB.size === 0) return 0;
  let inter = 0;
  for (const t of setA) if (setB.has(t)) inter++;
  return inter / (setA.size + setB.size - inter);
}

function sameContent(a: ListingContent, b: ListingContent): boolean {
  return (
    a.title === b.title &&
    a.description === b.description &&
    a.tags.join(" ") === b.tags.join(" ") &&
    a.materials.join(" ") === b.materials.join(" ")
  );
}

export function validateListingContent(
  input: Partial<ListingContent>,
  opts: ValidateOptions = {}
): ValidationResult {
  const issues: ValidationIssue[] = [];

  const titleRes = validateTitle(input.title ?? "");
  issues.push(...titleRes.issues);

  const descRes = validateDescription(input.description ?? "", { targetMax: opts.descTargetMax });
  issues.push(...descRes.issues);

  const tagsRes = normalizeTagsList(input.tags ?? [], opts.candidateTagPool ?? []);
  issues.push(...tagsRes.issues);

  const matRes = validateMaterials(input.materials ?? []);
  issues.push(...matRes.issues);

  const value: ListingContent = {
    title: titleRes.value,
    description: descRes.value,
    tags: tagsRes.tags,
    materials: matRes.value,
  };

  // Onarım sonrası son kontroller — buraya düşen her şey kod hatasıdır.
  if (value.tags.length === 0) {
    issues.push(issue("tags", "tags_empty", "blocking", "En az bir etiket gerekli."));
  }
  if (value.tags.length > ETSY_LIMITS.TAGS_MAX) {
    issues.push(issue("tags", "tag_count_over_max", "blocking", "Etiket sayısı 13'e indirilemedi."));
  }
  const overLong = value.tags.filter((t) => t.length > ETSY_LIMITS.TAG_MAX_CHARS);
  if (overLong.length > 0) {
    issues.push(
      issue("tags", "tag_over_max_chars", "blocking", `20 karakteri aşan etiket kaldı: ${overLong.join(", ")}`)
    );
  }
  const keys = value.tags.map(tagKey);
  if (new Set(keys).size !== keys.length) {
    issues.push(issue("tags", "duplicate_tags", "blocking", "Tekrar eden etiketler temizlenemedi."));
  }
  if (value.tags.length > 0 && value.tags.length < ETSY_LIMITS.TAGS_MAX) {
    issues.push(
      issue("tags", "tags_under_13", "warning", `${value.tags.length}/13 etiket dolu. Boş slot Etsy'de görünürlük kaybıdır.`)
    );
  }

  const risky = findRiskyPhrases(`${value.title}\n${value.description}`);
  if (risky.length > 0) {
    issues.push(
      issue("content", "risky_phrase", "warning", `Etsy politikası açısından riskli ifade: ${risky.join(", ")}`, risky.join(", "))
    );
  }

  if (opts.previous) {
    if (sameContent(value, opts.previous)) {
      issues.push(
        issue("content", "content_identical", "blocking", "İçerik mevcut ilanla birebir aynı; gereksiz Etsy güncellemesi yapılmadı.")
      );
    }
    if (opts.previous.title && jaccard(value.title, opts.previous.title) < 0.2) {
      issues.push(
        issue("title", "drastic_title_change", "warning", "Yeni başlık eskisinden çok farklı. Uygulamadan önce kontrol edin.")
      );
    }
  }

  const blocking = issues.filter((i) => i.severity === "blocking");
  const fixes = issues.filter((i) => i.severity === "fixed");
  const warnings = issues.filter((i) => i.severity === "warning");

  return { ok: blocking.length === 0, value, issues, blocking, fixes, warnings };
}

/** Yazma yolunda son kapı: engelleyici hata varsa fırlatır. */
export function assertSafeToApply(result: ValidationResult): void {
  if (!result.ok) {
    throw new EtsyValidationError(
      `İçerik Etsy kurallarına uymuyor: ${result.blocking.map((b) => b.code).join(", ")}`,
      result.blocking
    );
  }
}

/* ------------------------------------ diff ----------------------------------- */

export type ContentDiff = {
  titleChanged: boolean;
  descriptionChanged: boolean;
  tagsAdded: string[];
  tagsRemoved: string[];
  materialsChanged: boolean;
};

export function diffContent(before: ListingContent, after: ListingContent): ContentDiff {
  const beforeTags = new Set(before.tags.map(tagKey));
  const afterTags = new Set(after.tags.map(tagKey));
  return {
    titleChanged: before.title !== after.title,
    descriptionChanged: before.description !== after.description,
    tagsAdded: after.tags.filter((t) => !beforeTags.has(tagKey(t))),
    tagsRemoved: before.tags.filter((t) => !afterTags.has(tagKey(t))),
    materialsChanged: before.materials.join(" ") !== after.materials.join(" "),
  };
}
