/** Fiyatlandırma sabitleri - tek yerden yönetim */

export const PRICES = {
  pro: {
    normal: 149,
    discounted: 99,
    label: "Premium Aylık Abonelik",
  },
  yearly: {
    normal: 1299,
    discounted: 999,
    label: "Premium Yıllık Abonelik",
  },
  onetime: {
    normal: 49,
    discounted: 29,
    label: "Tek Seferlik 2 Kullanım",
    credits: 2,
  },
} as const;

export const PROMO_CODE = "YENI2026";
