import type { Metadata } from "next";
import DilekceClient from "@/app/dilekce/DilekceClient";

export const metadata: Metadata = {
  title: "Dilekçe Nasıl Yazılır | Resmi Yazı Örneği ve Taslağı",
  description:
    "Dilekçe nasıl yazılır? Belediye, kurum ve resmi başvurular için AI destekli dilekçe örneği ve taslağı. Dilekçe formatı, resmi yazı nasıl yazılır. Ücretsiz.",
  keywords:
    "dilekçe nasıl yazılır, dilekçe örneği, resmi yazı nasıl yazılır, belediye dilekçesi, dilekçe formatı, resmi dilekçe, AI dilekçe",
};

export default function DilekcePage() {
  return <DilekceClient />;
}