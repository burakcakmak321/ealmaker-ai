import type { Metadata } from "next";
import PazarlikClient from "@/app/pazarlik/PazarlikClient";

export const metadata: Metadata = {
  title: "Pazarlık Mesajı Yazma | Sahibinden İkinci El Pazarlık",
  description:
    "Pazarlık mesajı nasıl yazılır? Sahibinden, Letgo, ikinci el platformlar için profesyonel pazarlık mesajı. Hedef fiyata göre AI destekli metin. Ücretsiz.",
  keywords: "pazarlık mesajı, sahibinden pazarlık, ikinci el pazarlık, pazarlık nasıl yapılır",
};

export default function PazarlikPage() {
  return <PazarlikClient />;
}
