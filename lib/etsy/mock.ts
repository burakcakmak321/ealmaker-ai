/**
 * ETSY_MOCK=1 modu: API anahtarı olmadan tüm akışı çalıştırmak için.
 *
 * ÖNEMLİ: Bu modülün döndürdüğü veri GERÇEK DEĞİLDİR. Arayüz mock modda
 * olduğunu kullanıcıya açıkça göstermek zorundadır — "gerçek rakip verisi"
 * iddiası yalnızca canlı API modunda geçerlidir.
 *
 * Mock mod production'da `isMockMode()` tarafından kapatılır (bkz. http.ts).
 */

import { EtsyApiError } from "./errors";
import { sleep } from "./http";
import {
  SAMPLE_LISTINGS,
  SAMPLE_OWN_LISTINGS,
  SAMPLE_OWN_SHOP_ID,
} from "./fixtures/listings.sample";
import type {
  EtsyListing,
  EtsyListingPatch,
  EtsyPaged,
  EtsyShop,
} from "./types";

const ALL = [...SAMPLE_LISTINGS, ...SAMPLE_OWN_LISTINGS];

/** Mock modda arayüzün gösterebilmesi için dışa açılır. */
export const MOCK_NOTICE =
  "Örnek veri modu (ETSY_MOCK=1): gösterilen rakip verileri gerçek değildir.";

function tokenize(s: string): string[] {
  return s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

function score(listing: EtsyListing, terms: string[]): number {
  if (terms.length === 0) return listing.num_favorers;
  const haystack = `${listing.title} ${listing.tags.join(" ")}`.toLowerCase();
  let hits = 0;
  for (const term of terms) if (haystack.includes(term)) hits++;
  if (hits === 0) return -1;
  return hits * 1000 + listing.num_favorers;
}

export async function searchActiveListings(params: {
  keywords: string;
  limit?: number;
  offset?: number;
}): Promise<EtsyPaged<EtsyListing>> {
  await sleep(120);
  const terms = tokenize(params.keywords);
  const ranked = SAMPLE_LISTINGS.map((l) => ({ l, s: score(l, terms) }))
    .filter((x) => x.s >= 0)
    .sort((a, b) => b.s - a.s)
    .map((x) => x.l);

  const offset = params.offset ?? 0;
  const limit = params.limit ?? 40;
  return { count: ranked.length, results: ranked.slice(offset, offset + limit) };
}

export async function getListing(listingId: number): Promise<EtsyListing> {
  await sleep(60);
  const found = ALL.find((l) => l.listing_id === listingId);
  if (!found) throw new EtsyApiError("not_found", `Örnek veride ${listingId} yok.`, { status: 404 });
  return found;
}

export async function getListingsBatch(listingIds: number[]): Promise<EtsyListing[]> {
  await sleep(100);
  const wanted = new Set(listingIds);
  return ALL.filter((l) => wanted.has(l.listing_id));
}

export async function findShopByName(shopName: string): Promise<EtsyShop | null> {
  await sleep(80);
  return {
    shop_id: SAMPLE_OWN_SHOP_ID,
    shop_name: shopName,
    title: "Örnek mağaza (mock)",
    listing_active_count: SAMPLE_OWN_LISTINGS.length,
    currency_code: "USD",
    url: `https://www.etsy.com/shop/${shopName}`,
  };
}

export async function getShopActiveListings(
  shopId: number,
  params: { limit?: number; offset?: number } = {}
): Promise<EtsyPaged<EtsyListing>> {
  await sleep(90);
  const results =
    shopId === SAMPLE_OWN_SHOP_ID
      ? SAMPLE_OWN_LISTINGS
      : SAMPLE_LISTINGS.filter((l) => l.shop_id === shopId);
  const offset = params.offset ?? 0;
  const limit = params.limit ?? 50;
  return { count: results.length, results: results.slice(offset, offset + limit) };
}

export async function getOwnListings(): Promise<EtsyPaged<EtsyListing>> {
  await sleep(90);
  return { count: SAMPLE_OWN_LISTINGS.length, results: SAMPLE_OWN_LISTINGS };
}

export function mockConnection(): { shopId: number; shopName: string; accessToken: string } {
  return { shopId: SAMPLE_OWN_SHOP_ID, shopName: "MockShop", accessToken: "mock.token" };
}

/**
 * Sahte PATCH. 10 istekten 1'inde bilerek hata verir ki kısmi başarısızlık
 * arayüzü (per-ilan sonuç raporu, tekrar deneme, geri alma) gerçekten
 * denenebilsin.
 */
export async function updateListing(
  listingId: number,
  fields: EtsyListingPatch
): Promise<EtsyListing> {
  await sleep(300);
  if (Math.random() < 0.1) {
    throw new EtsyApiError("server_error", "Örnek veri modu: kasıtlı geçici hata.", {
      status: 503,
    });
  }
  const current = await getListing(listingId);
  return {
    ...current,
    title: fields.title ?? current.title,
    description: fields.description ?? current.description,
    tags: fields.tags ?? current.tags,
    materials: fields.materials ?? current.materials,
    last_modified_timestamp: Math.floor(Date.now() / 1000),
  };
}
