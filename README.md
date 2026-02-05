# YazıAsistan — Metin Taslağı Üretim Platformu

Fatura itirazı, pazarlık mesajları, resmi yazı taslağı ve CV metnini saniyeler içinde üreten yapay zeka asistanı. Profesyonel tek sayfa uygulama; backend ve ödeme entegrasyonu sonradan eklenebilir.

## Özellikler

- **Fatura & Abonelik İtirazı** — İnternet, banka, operatör faturası için indirim/iade dilekçesi
- **Pazarlık Modu** — Sahibinden, Letgo, eBay için satıcıya mesaj dizisi
- **Dilekçe Sihirbazı** — Apartman gürültüsü, tüketici hakem heyeti vb. resmi dilekçe (yazdır / PDF kaydet)
- **Freemium** — İlk 2 kullanım ücretsiz (localStorage); sonrası Pro (ödeme eklenecek)
- **Kopyala bildirimi** — Panoya kopyala sonrası toast
- **Yazdır / PDF** — Dilekçe sayfasında tarayıcıdan PDF kaydetme

## Sayfalar

| Sayfa | Açıklama |
|-------|----------|
| `/` | Ana sayfa (hero, özellikler, nasıl çalışır, CTA) |
| `/fatura` | Fatura itirazı formu + AI metin |
| `/pazarlik` | Pazarlık mesajları formu |
| `/dilekce` | Dilekçe sihirbazı + yazdır/PDF |
| `/fiyatlandirma` | Fiyatlandırma (Ücretsiz / Pro — ödeme yakında) |
| `/sss` | Sıkça sorulan sorular |
| `/gizlilik` | Gizlilik politikası (taslak) |
| `/kullanim` | Kullanım koşulları (taslak) |
| `/iletisim` | İletişim formu (backend eklenecek) |
| 404 | Özel bulunamadı sayfası |

## Kurulum

1. Bağımlılıkları yükle:
   ```bash
   npm install
   ```

2. `.env.example` dosyasını `.env.local` olarak kopyala ve OpenAI API anahtarını ekle:
   ```
   OPENAI_API_KEY=sk-...
   ```
   Anahtar: [OpenAI API Keys](https://platform.openai.com/api-keys)

3. Geliştirme sunucusunu çalıştır:
   ```bash
   npm run dev
   ```

4. Tarayıcıda [http://localhost:3000](http://localhost:3000) aç.

## Yayınlama (Vercel)

Siteyi canlıya almak için **[YAYIN.md](./YAYIN.md)** dosyasındaki adımları izleyin. Kısaca:

- `npm run build` ile projeyi derleyin.
- [Vercel](https://vercel.com) hesabı açıp projeyi CLI veya GitHub ile deploy edin.
- Vercel **Environment Variables** bölümüne `OPENAI_API_KEY` ekleyin.

Detaylar: [YAYIN.md](./YAYIN.md)

## Sonra eklenecekler (backend + ödeme)

- Kullanıcı girişi (auth)
- Gerçek kullanım limiti (veritabanı)
- Stripe / Paddle ile Pro abonelik
- İletişim formu backend (e-posta veya CRM)
- Gizlilik / Kullanım koşulları hukuki metinleri

## Teknolojiler

- Next.js 14 (App Router), TypeScript, Tailwind CSS
- OpenAI API (gpt-4o-mini)
- Client: localStorage (kullanım sayacı), toast (kopyala), print (PDF)

## Lisans

Özel proje — ticari kullanım için uyarlanabilir.
