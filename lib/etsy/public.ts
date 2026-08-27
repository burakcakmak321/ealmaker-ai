/**
 * Etsy'nin OAuth gerektirmeyen (yalnızca API anahtarı isteyen) uçları.
 *
 * Rakip analizinin tamamı buradan beslenir: arama, ilan detayı, mağaza arama.
 * Kullanıcının kendi mağazasına YAZMAK için OAuth gerekir (bkz. oauth.ts),
 * ama rakipleri OKUMAK için gerekmez.
 */

import { EtsyApiError } from "./errors";
import { etsyFetch, isMockMode } from "./http";
import type { EtsyInclude, EtsyListing, EtsyPaged, EtsyShop } from "./types";
import * as mock from "./mock";

const MAX_SEARCH_LIMIT = 100;
const BATCH_SIZE = 100;

function clampLimit(limit: number | undefined, fallback: number): number {
  if (!Number.isFinite(limit)) return fallback;
  return Math.min(MAX_SEARCH_LIMIT, Math.max(1, Math.floor(limit as number)));
}

export type SearchParams = {
  keywords: string;
  limit?: number;
  offset?: number;
  sortOn?: "score" | "created" | "price" | "updated";
  sortOrder?: "asc" | "desc";
  minPrice?: number;
  maxPrice?: number;
  taxonomyId?: number;
  shopLocation?: string;
};

/**
 * Etsy genelinde aktif ilan araması.
 * `sort_on=score` Etsy'nin kendi alaka/başarı sıralamasıdır — "en başarılı
 * rakip ilanlar" sorusunun gerçek veriyle karşılığı budur.
 */
export async function searchActiveListings(params: SearchParams): Promise<EtsyPaged<EtsyListing>> {
  const keywords = params.keywords?.trim();
  if (!keywords) {
    throw new EtsyApiError("invalid_request", "Arama için anahtar kelime gerekli.");
  }
  if (isMockMode()) return mock.searchActiveListings({ ...params, keywords });

  return etsyFetch<EtsyPaged<EtsyListing>>("/listings/active", {
    query: {
      keywords,
      limit: clampLimit(params.limit, 40),
      offset: params.offset ?? 0,
      sort_on: params.sortOn ?? "score",
      sort_order: params.sortOrder ?? "desc",
      min_price: params.minPrice,
      max_price: params.maxPrice,
      taxonomy_id: params.taxonomyId,
      shop_location: params.shopLocation,
    },
  });
}

export async function getListing(
  listingId: number,
  includes?: EtsyInclude[]
): Promise<EtsyListing> {
  if (isMockMode()) return mock.getListing(listingId);
  return etsyFetch<EtsyListing>(`/listings/${listingId}`, {
    query: { includes: includes?.length ? includes.join(",") : undefined },
  });
}

/**
 * Toplu ilan çekme. Etsy'nin batch ucu kullanılamazsa (400/404) tek tek
 * çekmeye düşer — hız sınırlayıcı zaten sırayı koruduğu için güvenlidir.
 */
export async function getListingsBatch(listingIds: number[]): Promise<EtsyListing[]> {
  const unique = Array.from(new Set(listingIds.filter((id) => Number.isFinite(id))));
  if (unique.length === 0) return [];
  if (isMockMode()) return mock.getListingsBatch(unique);

  const out: EtsyListing[] = [];
  for (let i = 0; i < unique.length; i += BATCH_SIZE) {
    const chunk = unique.slice(i, i + BATCH_SIZE);
    try {
      const page = await etsyFetch<EtsyPaged<EtsyListing>>("/listings/batch", {
        query: { listing_ids: chunk.join(",") },
      });
      out.push(...(page.results ?? []));
    } catch (err) {
      if (err instanceof EtsyApiError && (err.status === 400 || err.status === 404)) {
        for (const id of chunk) {
          try {
            out.push(await getListing(id));
          } catch {
            // Tek bir ilan çekilemezse analizi tümden düşürme.
          }
        }
      } else {
        throw err;
      }
    }
  }
  return out;
}

export async function findShopByName(shopName: string): Promise<EtsyShop | null> {
  const name = shopName?.trim();
  if (!name) {
    throw new EtsyApiError("invalid_request", "Mağaza adı gerekli.");
  }
  if (isMockMode()) return mock.findShopByName(name);

  const page = await etsyFetch<EtsyPaged<EtsyShop>>("/shops", {
    query: { shop_name: name, limit: 25 },
  });
  const results = page.results ?? [];
  const exact = results.find((s) => s.shop_name?.toLowerCase() === name.toLowerCase());
  return exact ?? results[0] ?? null;
}

export async function getShopActiveListings(
  shopId: number,
  params: { limit?: number; offset?: number; keywords?: string } = {}
): Promise<EtsyPaged<EtsyListing>> {
  if (isMockMode()) return mock.getShopActiveListings(shopId, params);
  return etsyFetch<EtsyPaged<EtsyListing>>(`/shops/${shopId}/listings/active`, {
    query: {
      limit: clampLimit(params.limit, 50),
      offset: params.offset ?? 0,
      keywords: params.keywords,
    },
  });
}

/**
 * Arama sonuçları bazen `tags`/`materials` alanlarını boş döndürür. Analiz
 * bu alanlara dayandığı için eksikleri tek toplu çağrıyla tamamlar.
 */
export async function enrichListings(listings: EtsyListing[]): Promise<EtsyListing[]> {
  const missing = listings.filter((l) => !l.tags || l.tags.length === 0).map((l) => l.listing_id);
  if (missing.length === 0) return listings;

  const fetched = await getListingsBatch(missing);
  const byId = new Map(fetched.map((l) => [l.listing_id, l]));
  return listings.map((l) => {
    const full = byId.get(l.listing_id);
    if (!full) return l;
    return {
      ...l,
      tags: full.tags?.length ? full.tags : l.tags,
      materials: full.materials?.length ? full.materials : l.materials,
      description: full.description || l.description,
      taxonomy_id: full.taxonomy_id ?? l.taxonomy_id,
    };
  });
}
