import type { Metadata } from "next";
import DilekceClient from "@/app/dilekce/DilekceClient";

export const metadata: Metadata = {
  title: "AI Destekli Dilekçe ve Resmi Yazı",
  description:
    "Belediye, kurum ve resmi başvurular için AI destekli dilekçe taslağı oluşturun. Türkiye standartlarına uygun, hızlı ve profesyonel.",
};

export default function DilekcePage() {
  return <DilekceClient />;
}