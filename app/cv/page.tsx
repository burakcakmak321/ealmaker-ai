import type { Metadata } from "next";
import CVClient from "@/app/cv/CVClient";

export const metadata: Metadata = {
  title: "AI Destekli CV Oluşturucu",
  description:
    "Profesyonel CV taslağı oluşturun: deneyim, eğitim ve becerilerinize göre AI destekli metin üretimi.",
};

export default function CVPage() {
  return <CVClient />;
}