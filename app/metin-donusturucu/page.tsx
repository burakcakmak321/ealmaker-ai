import type { Metadata } from "next";
import MetinDonusturucuClient from "./MetinDonusturucuClient";

export const metadata: Metadata = {
  title: "Metin Dönüştürücü",
  description:
    "Metninizi resmi, sade, profesyonel veya insan yazısı gibi dönüştürün. AI tarafından yazılmış metinleri insanlaştırın.",
  openGraph: {
    title: "Metin Dönüştürücü | AI Destekli",
    description:
      "Metinlerinizi dönüştürün: Resmi, sade, profesyonel veya insanlaştırılmış. AI tespit araçlarından kaçının.",
  },
};

export default function MetinDonusturucuPage() {
  return <MetinDonusturucuClient />;
}
