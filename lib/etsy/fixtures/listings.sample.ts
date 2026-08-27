/**
 * Örnek Etsy ilanları (ETSY_MOCK=1 modu için).
 *
 * BU VERİ GERÇEK DEĞİLDİR — yalnızca API anahtarı olmadan arayüzü ve analiz
 * matematiğini çalıştırabilmek içindir. Analiz sonuçları arayüzde gösterilirken
 * mock modda olunduğu kullanıcıya açıkça bildirilir (bkz. mock.ts / UI uyarısı).
 *
 * Tag ve fiyat dağılımları kasıtlı olarak dengesizdir ki frekans/percentile
 * hesapları anlamlı bir çıktı üretsin.
 */

import type { EtsyListing } from "../types";

const DAY = 86_400;
const NOW = 1_756_000_000; // sabit: fixture'lar deterministik kalsın

function listing(
  id: number,
  title: string,
  tags: string[],
  materials: string[],
  priceMinor: number,
  favorers: number,
  ageDays: number,
  shopId: number
): EtsyListing {
  return {
    listing_id: id,
    user_id: 900_000 + shopId,
    shop_id: shopId,
    title,
    description: `${title}. Handmade with care in our small studio. Each piece is made to order and carefully packaged.`,
    state: "active",
    tags,
    materials,
    taxonomy_id: 1245,
    price: { amount: priceMinor, divisor: 100, currency_code: "USD" },
    quantity: 20,
    num_favorers: favorers,
    original_creation_timestamp: NOW - ageDays * DAY,
    last_modified_timestamp: NOW - Math.floor(ageDays / 2) * DAY,
    url: `https://www.etsy.com/listing/${id}`,
    shop: { shop_id: shopId, shop_name: `MockShop${shopId}`, url: `https://www.etsy.com/shop/MockShop${shopId}` },
  };
}

export const SAMPLE_LISTINGS: EtsyListing[] = [
  listing(1001, "Personalized Dog Collar Custom Engraved Name Leather Pet Collar", ["personalized gift", "dog collar", "custom pet gift", "engraved collar", "leather collar", "pet lover gift", "dog name tag", "custom dog collar"], ["genuine leather", "brass"], 2450, 1840, 420, 501),
  listing(1002, "Custom Leather Dog Collar Personalized Engraved Nameplate", ["dog collar", "personalized gift", "leather collar", "custom pet gift", "engraved collar", "pet gift", "dog accessories"], ["leather", "stainless steel"], 2899, 1210, 380, 502),
  listing(1003, "Engraved Dog Collar Personalized Leather Pet Name Collar Gift", ["personalized gift", "engraved collar", "dog collar", "pet lover gift", "custom dog collar", "leather collar", "dog gift"], ["full grain leather"], 3150, 2410, 610, 503),
  listing(1004, "Personalized Cat Collar Custom Engraved Breakaway Safety Collar", ["cat collar", "personalized gift", "custom pet gift", "breakaway collar", "pet lover gift", "engraved collar"], ["nylon", "brass"], 1899, 640, 210, 504),
  listing(1005, "Handmade Leather Dog Collar Custom Name Brass Hardware", ["dog collar", "leather collar", "handmade gift", "custom dog collar", "brass hardware", "personalized gift"], ["vegetable tanned leather", "solid brass"], 4200, 890, 730, 505),
  listing(1006, "Custom Dog Collar and Leash Set Personalized Engraved Leather", ["dog collar", "collar and leash", "personalized gift", "leather collar", "dog leash", "custom pet gift", "matching set"], ["leather"], 5600, 1520, 300, 501),
  listing(1007, "Personalized Puppy Collar Small Dog Custom Name Engraved", ["puppy collar", "small dog collar", "personalized gift", "dog collar", "custom pet gift", "engraved collar"], ["leather", "brass"], 2100, 430, 150, 506),
  listing(1008, "Rolled Leather Dog Collar Personalized Engraved Round Collar", ["dog collar", "rolled leather", "personalized gift", "leather collar", "engraved collar"], ["rolled leather"], 3400, 720, 500, 507),
  listing(1009, "Custom Embroidered Dog Collar Name and Phone Number Pet Safety", ["dog collar", "embroidered collar", "custom pet gift", "pet safety", "personalized gift", "dog name tag"], ["polyester webbing"], 1750, 3100, 840, 508),
  listing(1010, "Personalized Dog Collar Bandana Set Custom Name Pet Gift", ["dog collar", "dog bandana", "personalized gift", "custom pet gift", "pet lover gift"], ["cotton", "leather"], 3200, 560, 190, 509),
  listing(1011, "Luxury Leather Dog Collar Personalized Gold Hardware Custom", ["dog collar", "luxury pet", "leather collar", "personalized gift", "gold hardware", "custom dog collar"], ["italian leather", "gold plated brass"], 7800, 410, 260, 510),
  listing(1012, "Minimalist Dog Collar Custom Engraved Thin Leather Pet Collar", ["dog collar", "minimalist", "leather collar", "engraved collar", "personalized gift"], ["leather"], 2600, 380, 170, 511),
  listing(1013, "Personalized Dog Collar for Large Dogs Heavy Duty Engraved", ["dog collar", "large dog collar", "heavy duty", "personalized gift", "engraved collar", "custom dog collar"], ["biothane", "steel"], 3800, 950, 340, 512),
  listing(1014, "Custom Pet ID Tag and Collar Set Engraved Name Personalized", ["pet id tag", "dog collar", "personalized gift", "engraved collar", "custom pet gift", "dog name tag"], ["brass", "leather"], 2950, 1130, 450, 503),
  listing(1015, "Boho Dog Collar Personalized Custom Name Woven Pet Collar", ["dog collar", "boho pet", "personalized gift", "woven collar", "custom pet gift"], ["cotton rope", "brass"], 2350, 690, 220, 513),
  listing(1016, "Personalized Dog Collar Christmas Gift for Dog Mom Custom Name", ["dog collar", "christmas gift", "dog mom gift", "personalized gift", "custom pet gift", "pet lover gift"], ["leather"], 2750, 1780, 45, 502),
  listing(1017, "Waterproof Dog Collar Personalized Engraved Odor Proof Custom", ["dog collar", "waterproof collar", "personalized gift", "engraved collar", "custom dog collar"], ["biothane"], 3300, 820, 280, 514),
  listing(1018, "Custom Dog Collar Personalized Name Plate Martingale Collar", ["dog collar", "martingale collar", "personalized gift", "custom dog collar", "engraved collar"], ["nylon", "brass"], 2890, 470, 390, 515),
  listing(1019, "Personalized Leather Cat Collar Custom Engraved Safety Buckle", ["cat collar", "leather collar", "personalized gift", "engraved collar", "custom pet gift", "pet lover gift"], ["leather"], 2050, 350, 240, 504),
  listing(1020, "Handmade Dog Collar Custom Engraved Name Rustic Leather Gift", ["dog collar", "handmade gift", "leather collar", "personalized gift", "rustic", "engraved collar"], ["distressed leather"], 3600, 1040, 560, 505),
  listing(1021, "Personalized Dog Collar Wedding Custom Name Bow Tie Collar", ["dog collar", "wedding pet", "bow tie collar", "personalized gift", "custom pet gift"], ["satin", "leather"], 3100, 620, 200, 516),
  listing(1022, "Custom Reflective Dog Collar Personalized Night Safety Engraved", ["dog collar", "reflective collar", "pet safety", "personalized gift", "engraved collar"], ["reflective nylon"], 2450, 780, 310, 517),
  listing(1023, "Personalized Dog Collar Gift for Dog Dad Custom Engraved Name", ["dog collar", "dog dad gift", "personalized gift", "custom pet gift", "engraved collar", "pet lover gift"], ["leather"], 2650, 1340, 160, 501),
  listing(1024, "Vegan Leather Dog Collar Personalized Custom Engraved Eco", ["dog collar", "vegan leather", "eco friendly", "personalized gift", "engraved collar"], ["cork leather"], 2990, 540, 230, 518),
  listing(1025, "Custom Dog Collar Personalized Name Phone Number Engraved Buckle", ["dog collar", "personalized gift", "engraved collar", "custom dog collar", "dog name tag", "pet safety"], ["leather", "brass"], 2550, 1620, 370, 507),
  listing(1026, "Personalized Puppy Collar Set Custom Name Adjustable Leather", ["puppy collar", "dog collar", "personalized gift", "leather collar", "adjustable collar"], ["leather"], 2250, 290, 30, 506),
  listing(1027, "Monogram Dog Collar Personalized Custom Initial Leather Pet", ["dog collar", "monogram gift", "personalized gift", "leather collar", "custom pet gift"], ["leather"], 3050, 710, 290, 519),
  listing(1028, "Custom Engraved Dog Collar Birthday Gift for Pet Lover Name", ["dog collar", "birthday gift", "engraved collar", "personalized gift", "pet lover gift"], ["leather", "brass"], 2400, 880, 180, 512),
  listing(1029, "Personalized Dog Collar Slip Lead Custom Engraved Training", ["dog collar", "slip lead", "dog training", "personalized gift", "custom dog collar"], ["rope", "leather"], 3450, 400, 320, 520),
  listing(1030, "Handwoven Dog Collar Personalized Custom Name Artisan Pet Gift", ["dog collar", "handwoven", "artisan gift", "personalized gift", "custom pet gift", "pet lover gift"], ["cotton", "leather"], 2850, 660, 250, 513),
];

/** Kullanıcının "kendi" mağazası gibi davranan örnek ilanlar (mock OAuth modu). */
export const SAMPLE_OWN_SHOP_ID = 777_001;

export const SAMPLE_OWN_LISTINGS: EtsyListing[] = [
  {
    ...listing(2001, "Dog Collar Leather Brown", ["dog collar", "leather", "brown"], ["leather"], 2700, 42, 95, SAMPLE_OWN_SHOP_ID),
    description: "A leather dog collar. Brown. Adjustable.",
  },
  {
    ...listing(2002, "Cat Collar Handmade", ["cat collar", "handmade"], ["cotton"], 1800, 11, 60, SAMPLE_OWN_SHOP_ID),
    description: "Handmade cat collar with a small bell.",
  },
  {
    ...listing(2003, "Pet Name Tag Brass", ["name tag", "brass", "pet"], ["brass"], 1200, 27, 200, SAMPLE_OWN_SHOP_ID),
    description: "Solid brass pet name tag, engraved on request.",
  },
];
