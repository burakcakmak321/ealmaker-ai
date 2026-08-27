/**
 * Etsy Open API v3 veri tipleri.
 *
 * Bu dosya saf tip tanımı içerir, çalışma zamanı kodu yoktur.
 * Alan adları Etsy'nin döndürdüğü snake_case gövdeyle birebir aynıdır ki
 * gelen JSON ek bir dönüştürme katmanı olmadan bu tiplere oturabilsin.
 */

/** Etsy parayı tam sayı + bölen olarak taşır: 2450 / 100 = 24.50 USD */
export type EtsyMoney = {
  amount: number;
  divisor: number;
  currency_code: string;
};

export type EtsyListingState =
  | "active"
  | "inactive"
  | "draft"
  | "expired"
  | "sold_out"
  | "edit";

export type EtsyImage = {
  listing_image_id: number;
  url_75x75: string;
  url_170x135: string;
  url_570xN: string;
  rank: number;
};

export type EtsyShop = {
  shop_id: number;
  shop_name: string;
  title: string | null;
  listing_active_count: number;
  currency_code: string;
  url: string;
};

export type EtsyShopRef = Pick<EtsyShop, "shop_id" | "shop_name" | "url">;

export type EtsyListing = {
  listing_id: number;
  user_id: number;
  shop_id: number;
  title: string;
  description: string;
  state: EtsyListingState;
  tags: string[];
  materials: string[];
  taxonomy_id: number | null;
  price: EtsyMoney | null;
  quantity: number;
  num_favorers: number;
  /** Etsy bunu herkese açık okumalarda çoğu zaman döndürmez. */
  views?: number;
  /** unix saniye */
  original_creation_timestamp: number;
  /** unix saniye */
  last_modified_timestamp: number;
  url: string;
  images?: EtsyImage[];
  shop?: EtsyShopRef;
};

export type EtsyPaged<T> = {
  count: number;
  results: T[];
};

export type EtsyInclude = "Images" | "Shop" | "Inventory" | "User";

export type EtsyTokenSet = {
  access_token: string;
  refresh_token: string;
  /** saniye; Etsy 3600 döndürür */
  expires_in: number;
  token_type: string;
};

/** PATCH ile güncellenebilen alanların bizim kullandığımız alt kümesi. */
export type EtsyListingPatch = {
  title?: string;
  description?: string;
  tags?: string[];
  materials?: string[];
};

/** Bir ilanın SEO açısından anlamlı, karşılaştırılabilir çekirdeği. */
export type ListingContent = {
  title: string;
  description: string;
  tags: string[];
  materials: string[];
};

/** EtsyListing'den karşılaştırma/anlık görüntü için sadeleştirilmiş içerik çıkarır. */
export function toListingContent(listing: EtsyListing): ListingContent {
  return {
    title: listing.title ?? "",
    description: listing.description ?? "",
    tags: Array.isArray(listing.tags) ? [...listing.tags] : [],
    materials: Array.isArray(listing.materials) ? [...listing.materials] : [],
  };
}

/** Para birimi bölenini uygulayıp okunabilir sayıya çevirir. 2450/100 → 24.5 */
export function moneyToNumber(money: EtsyMoney | null | undefined): number | null {
  if (!money || typeof money.amount !== "number" || !money.divisor) return null;
  return money.amount / money.divisor;
}
