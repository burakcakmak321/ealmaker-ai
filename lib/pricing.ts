/** Fiyatlandırma sabitleri - tek yerden yönetim */

export const PRICES = {
  pro: {
    normal: 149,
    discounted: 99,
    label: "Pro Aylık Abonelik",
  },
  onetime: {
    normal: 49,
    discounted: 29,
    label: "Tek Seferlik 10 Kullanım",
    credits: 10,
  },
} as const;

export const PROMO_CODE = "YENI2026";
