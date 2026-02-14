import type { Metadata } from "next";
import BlogSeoClient from "./BlogSeoClient";

export const metadata: Metadata = {
  title: "Blog & SEO Araclari",
  description:
    "Anahtar kelime odakli blog ana hatlari, meta aciklamalar ve SEO uyumlu basliklar olusturun. Icerik stratejinizi guclendin.",
  openGraph: {
    title: "Blog & SEO Araclari | AI Destekli",
    description: "Blog outline, meta description, baslik onerileri ve anahtar kelime analizi.",
  },
};

export default function BlogSeoPage() {
  return <BlogSeoClient />;
}
