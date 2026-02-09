/** Merkezi marka ve işletme bilgisi - PayTR uyumluluğu için gerekli */
export const SITE_NAME = "YazıAsistan";
export const SITE_TAGLINE = "Metin taslağı üretim platformu";

/** İşletme bilgileri - Footer ve İletişim sayfasında kullanılır (PayTR için) */
export const BUSINESS = {
  unvan: "Burak Çakmak - YazıAsistan",
  vergiDairesi: "Çorlu",
  vkn: process.env.NEXT_PUBLIC_SITE_VKN || "",
  adres: "Çorlu Merkez, Tekirdağ",
  telefon: "0551 633 38 94",
  email: "yaziasistani@gmail.com",
} as const;
