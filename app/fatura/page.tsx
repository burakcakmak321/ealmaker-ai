import type { Metadata } from "next";
import FaturaClient from "@/app/fatura/FaturaClient";

export const metadata: Metadata = {
  title: "Fatura İtirazı Nasıl Yapılır | Fatura İtiraz Dilekçesi",
  description:
    "Fatura itirazı nasıl yapılır? İnternet, banka, operatör faturası itiraz dilekçesi. AI destekli fatura itirazı metni oluşturun. Ücretsiz.",
  keywords:
    "fatura itirazı, fatura itiraz dilekçesi, fatura itirazı nasıl yapılır, abonelik iptali, operatör faturası itiraz",
};

export default function FaturaPage() {
  return <FaturaClient />;
}
