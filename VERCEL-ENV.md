# Vercel'de Giriş İçin Gerekli Env (ealmakerai projesi)

Giriş/kayıt ve admin paneli için **bu projede** (ealmakerai.vercel.app'i deploy eden proje) şu değişkenler tanımlı olmalı:

| Key | Value |
|-----|--------|
| **SUPABASE_URL** | `https://jsrxulopzbmfozwikayv.supabase.co` |
| **SUPABASE_ANON_KEY** | Supabase'ten kopyaladığın anon/public key (Legacy veya Publishable) |
| **ADMIN_PASSWORD** | Admin paneline girmek için şifre (logo'ya 5 kez tıklayınca sorulur) |

## Adımlar

**ÖNEMLİ:** Değişkenleri **proje** ayarlarına ekleyin, Team ayarlarına değil. Team > Environment Variables kullanıyorsanız, "Link to Projects" ile ealmaker-ai projesini mutlaka seçin.

1. **vercel.com** → **Projects** → **ealmaker-ai** projesini aç.
2. **Settings** → **Environment Variables** (proje ayarlarında).
3. **Add New** → Key: `SUPABASE_URL`, Value: `https://jsrxulopzbmfozwikayv.supabase.co` → Production, Preview, Development seç → Save.
4. **Add New** → Key: `SUPABASE_ANON_KEY`, Value: (Supabase'ten anon key) → Production, Preview, Development seç → Save.
5. **Add New** → Key: `ADMIN_PASSWORD`, Value: (admin şifresi) → Production, Preview, Development seç → Save.
6. **Deployments** → en son deployment → **⋯** → **Redeploy**.

Bu env'leri ekleyip Redeploy yaptıktan sonra giriş/kayıt ve admin paneli çalışır.
