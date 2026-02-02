# Ödeme Altyapısı (PayTR)

Pro abonelik ödemesi PayTR iframe API ile alınır. Ödeme akışı hazır; sadece PayTR panel bilgilerini env'e eklemen yeterli.

## 1. Supabase: is_pro sütunu

Supabase SQL Editor'da çalıştır:

```sql
alter table public.usage add column if not exists is_pro boolean not null default false;
```

## 2. PayTR panel

1. [PayTR Üye İşyeri](https://www.paytr.com) ile giriş yap.
2. **Destek & Kurulum** → **Entegrasyon Bilgileri**: **Mağaza No**, **Mağaza Parola**, **Mağaza Gizli Anahtar** (merchant_id, merchant_key, merchant_salt) al.
3. **Callback URL** (ödeme sonrası PayTR'nin POST atacağı adres):  
   `https://ealmaker-ai.vercel.app/api/payment/callback`  
   (Test için `http://...` kullanma; PayTR canlı ortamda HTTPS ister.)

## 3. Vercel env

Proje → **Settings** → **Environment Variables** ekle:

| Key | Value |
|-----|--------|
| `PAYTR_MERCHANT_ID` | Mağaza No |
| `PAYTR_MERCHANT_KEY` | Mağaza Parola |
| `PAYTR_MERCHANT_SALT` | Mağaza Gizli Anahtar |
| `PAYTR_TEST_MODE` | Test için `1`, canlı için boş veya `0` |

Sonra **Redeploy** yap.

## 4. Akış

- Kullanıcı **Fiyatlandırma** → **Pro'ya geç** → giriş yoksa **Giriş yap**, sonra **/odeme/checkout**.
- Checkout sayfası `/api/checkout` ile token alır; PayTR iframe açılır.
- Ödeme başarılı olunca PayTR `POST /api/payment/callback` çağırır; `merchant_oid` içinden user_id çıkarılır, `usage.is_pro = true` yapılır.
- Kullanıcı **/odeme/basarili** veya **/odeme/iptal** sayfasına yönlendirilir.

## 5. Hash hatası alırsan

PayTR get-token veya callback'te hash hatası verirse, [PayTR iframe API](https://dev.paytr.com) dokümanındaki hash sırasına göre `app/api/checkout/route.ts` ve `app/api/payment/callback/route.ts` içindeki hash hesaplamasını güncelle.
