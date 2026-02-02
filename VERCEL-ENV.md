# Vercel'de Giriş İçin Gerekli Env (ealmakerai projesi)

Giriş/kayıt çalışması için **bu projede** (ealmakerai.vercel.app’i deploy eden proje) şu iki değişken **mutlaka** tanımlı olmalı:

| Key | Value |
|-----|--------|
| **SUPABASE_URL** | `https://jsrxulopzbmfozwikayv.supabase.co` |
| **SUPABASE_ANON_KEY** | Supabase’ten kopyaladığın anon/public key (Legacy veya Publishable) |

## Adımlar

1. **vercel.com** → **ealmakerai** projesini aç (sol menüden Projects → ealmakerai).
2. **Settings** → **Environment Variables**.
3. **Add New** → Key: `SUPABASE_URL`, Value: `https://jsrxulopzbmfozwikayv.supabase.co` → Production, Preview, Development seç → Save.
4. **Add New** → Key: `SUPABASE_ANON_KEY`, Value: (Supabase’ten anon key) → Production, Preview, Development seç → Save.
5. **Deployments** → en son deployment → **⋯** → **Redeploy**.

Bu iki isim **proje** env’inde kullanılıyor; Team shared ile çakışmaz. Env’leri ekleyip Redeploy yaptıktan sonra giriş/kayıt çalışır.
