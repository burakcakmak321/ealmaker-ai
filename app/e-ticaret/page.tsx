import type { Metadata } from "next";
import EticaretClient from "./EticaretClient";

export const metadata: Metadata = {
  title: "E-Ticaret Ürün Açıklaması",
  description:
    "Trendyol, Hepsiburada, Amazon ve diğer pazar yerleri için SEO uyumlu ürün başlığı ve açıklaması oluşturun. Platform algoritmalarına özel format.",
  openGraph: {
    title: "E-Ticaret Ürün Açıklaması | AI Destekli",
    description:
      "Pazar yeri algoritmalarına uygun ürün başlığı ve açıklaması. Trendyol, Hepsiburada, Amazon formatlarında.",
  },
};

export default function EticaretPage() {
  return <EticaretClient />;
}
