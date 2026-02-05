# YazıAsistan — Siteyi Yayınlama (Vercel)

Bu rehber, projeyi **Vercel** üzerinde yayına almak için gereken adımları içerir.

## Ön koşullar

- Proje yerelde `npm run build` ile hatasız derleniyor olmalı.
- **OpenAI API anahtarınız** hazır olmalı ([OpenAI API Keys](https://platform.openai.com/api-keys)).

---

## Yöntem 1: Vercel CLI ile yayınlama

1. **Vercel hesabı:** [vercel.com](https://vercel.com) üzerinden (GitHub ile) giriş yapın.

2. **Vercel CLI kurulumu:**
   ```bash
   npm i -g vercel
   ```

3. **Proje klasöründe giriş ve deploy:**
   ```bash
   cd c:\Users\burak\Desktop\dsa
   vercel login
   vercel
   ```
   İlk seferde proje adı ve ayarlar sorulur; Enter ile varsayılanları kabul edebilirsiniz.

4. **Ortam değişkeni (Production):**
   - [Vercel Dashboard](https://vercel.com/dashboard) → Projeniz → **Settings** → **Environment Variables**
   - **Key:** `OPENAI_API_KEY`
   - **Value:** `sk-...` (OpenAI API anahtarınız)
   - **Environment:** Production (ve isterseniz Preview) seçin → **Save**

5. **Yeniden deploy:** Ortam değişkenini ekledikten sonra:
   - Dashboard’da **Deployments** → son deployment’a tıklayıp **Redeploy**, veya
   - Tekrar `vercel --prod` çalıştırın.

---

## Yöntem 2: GitHub ile otomatik yayınlama

1. Projeyi **GitHub**’a push edin (`.env.local` ve `.env` dosyalarını **eklemeyin**; `.gitignore`’da zaten vardır).

2. [vercel.com](https://vercel.com) → **Add New Project** → **Import Git Repository** → GitHub repo’nuzu seçin.

3. **Environment Variables** ekranında:
   - `OPENAI_API_KEY`, **`SUPABASE_URL`**, **`SUPABASE_ANON_KEY`**, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAILS` ekleyin. Giriş için SUPABASE_URL ve SUPABASE_ANON_KEY bu projede olmalı (Production+Preview+Development). Env sonrası Redeploy yapın.

4. **Deploy**’a tıklayın. Her `main` (veya seçtiğiniz branch) push’unda otomatik yeni deploy alırsınız.

---

## Kontrol listesi

- [ ] `npm run build` yerelde başarılı
- [ ] Vercel’de `OPENAI_API_KEY` tanımlı (Production)
- [ ] Canlı sitede bir sayfa (örn. Fatura İtirazı) açılıyor
- [ ] “Metin oluştur” ile AI yanıt geliyor (API anahtarı doğruysa)

---

## Önemli notlar

- **API anahtarı:** Sadece Vercel’in **Environment Variables** kısmında tanımlayın; koda veya GitHub’a yazmayın.
- **Domain:** Vercel varsayılan `*.vercel.app` adresi verir; özel domain **Settings → Domains**’ten eklenebilir.
- **Ücretsiz plan:** Vercel ve Next.js için yeterlidir; aylık kullanım limitleri dashboard’da görünür.

Bu adımlarla siteniz canlıya alınmış olur.
