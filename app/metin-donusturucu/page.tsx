import type { Metadata } from "next";
import MetinDonusturucuClient from "./MetinDonusturucuClient";

export const metadata: Metadata = {
  title: "Metin Dönüştürücü | AI Metin İnsanlaştırma",
  description:
    "Metin dönüştürücü: Metninizi resmi, sade, profesyonel veya insan yazısı gibi dönüştürün. AI metin insanlaştırma, metin dönüştürme aracı. Ücretsiz.",
  keywords:
    "metin dönüştürücü, metin insanlaştırma, AI metin dönüştürme, metin dönüştürme aracı, AI tespit atlatma",
  openGraph: {
    title: "Metin Dönüştürücü | AI Destekli",
    description:
      "Metinlerinizi dönüştürün: Resmi, sade, profesyonel veya insanlaştırılmış. AI tespit araçlarından kaçının.",
  },
};

export default function MetinDonusturucuPage() {
  return <MetinDonusturucuClient />;
}
