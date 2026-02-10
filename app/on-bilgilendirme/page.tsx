import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export const metadata = {
  title: "Ön Bilgilendirme Formu | YazıAsistan",
  description: "Mesafeli sözleşmeler öncesi tüketiciyi bilgilendirme formu.",
};

export default function OnBilgilendirmePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <PageHeader
        title="Ön Bilgilendirme Formu"
        description="6502 sayılı Kanun ve Mesafeli Sözleşmeler Yönetmeliği kapsamında satın alma öncesi bilgilendirme."
        icon="📋"
      />

      <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
        <p>
          Aşağıdaki bilgiler, Pro abonelik satın almadan önce tarafınıza sunulmaktadır.
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li><strong>Satıcı:</strong> YazıAsistan</li>
          <li><strong>Hizmet:</strong> Pro abonelik (sınırsız) veya Tek seferlik (2 kullanım)</li>
          <li><strong>Tutar:</strong> Pro 99 ₺/ay, Tek seferlik 29 ₺ — site üzerinde belirtilir (KDV dahil)</li>
          <li><strong>Ödeme:</strong> Kredi kartı ile güvenli ödeme (Param altyapısı)</li>
          <li><strong>Cayma hakkı:</strong> Dijital içerik niteliğindeki hizmetlerde, hizmet ifasına başlanmasından sonra cayma hakkı kullanılamaz.</li>
          <li><strong>Şikayet:</strong> Tüketici şikayetleri için <Link href="/iletisim" className="text-brand-600 hover:underline">İletişim</Link> sayfası kullanılır.</li>
        </ul>
        <p>
          Ödemeye geçerek <Link href="/mesafeli-satis" className="text-brand-600 hover:underline">Mesafeli Satış Sözleşmesi</Link> ve bu ön bilgilendirmeyi kabul etmiş olursunuz.
        </p>
      </div>

      <p className="mt-10 text-sm text-slate-500">
        <Link href="/" className="text-brand-600 hover:underline">← Ana sayfaya dön</Link>
      </p>
    </div>
  );
}
