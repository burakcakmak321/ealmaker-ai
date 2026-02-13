import type { Metadata } from "next";
import PazarlikClient from "@/app/pazarlik/PazarlikClient";

export const metadata: Metadata = {
  title: "AI Destekli Pazarlık Mesajı",
  description:
    "Sahibinden, mağaza veya online platformlar için profesyonel pazarlık mesajı oluşturun. Hedef fiyat ve gerekçeye göre metin taslağı.",
};

export default function PazarlikPage() {
  return <PazarlikClient />;
}
