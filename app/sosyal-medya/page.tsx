import type { Metadata } from "next";
import SosyalMedyaClient from "./SosyalMedyaClient";

export const metadata: Metadata = {
  title: "Sosyal Medya İçerik Asistanı",
  description:
    "Instagram, TikTok, YouTube için viral hooklar, video senaryoları ve etkili captionlar oluşturun. Her içeriğin arkasındaki stratejiyi öğrenin.",
  openGraph: {
    title: "Sosyal Medya İçerik Asistanı | AI Destekli",
    description:
      "Viral hooklar, Reels/TikTok senaryoları, dikkat çekici captionlar. Taktik açıklamalarıyla birlikte.",
  },
};

export default function SosyalMedyaPage() {
  return <SosyalMedyaClient />;
}
