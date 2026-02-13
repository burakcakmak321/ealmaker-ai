import type { Metadata } from "next";
import FaturaClient from "@/app/fatura/FaturaClient";

export const metadata: Metadata = {
  title: "AI Destekli Fatura İtirazı Dilekçesi",
  description:
    "Fatura itiraz dilekçesi oluşturun: internet, banka ve operatör faturaları için profesyonel AI destekli metin taslağı.",
};

export default function FaturaPage() {
  return <FaturaClient />;
}
