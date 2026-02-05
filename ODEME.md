# PayTR Ödeme Altyapısı

Pro abonelik ödemesi PayTR iframe API ile alınır. Bu doküman PayTR başvurusu ve entegrasyonu için hazırlanmıştır.

## PayTR Başvurusu İçin Gerekli Site Özellikleri

✅ **Yasal sayfalar:** Gizlilik Politikası, Kullanım Koşulları, Mesafeli Satış Sözleşmesi, Ön Bilgilendirme Formu, Çerez Politikası  
✅ **Ürün/hizmet tanımı:** Net fiyat ve açıklama  
✅ **İletişim:** İletişim formu ve KVKK başvuru seçeneği  
✅ **SSL:** HTTPS zorunlu (Vercel otomatik sağlar)  
✅ **Callback URL:** Bildirim URL erişilebilir olmalı (oturum kısıtlaması olmamalı)

## 1. Supabase: usage tablosu

```sql
-- Zaten varsa atla; yoksa çalıştır:
alter table public.usage add column if not exists is_pro boolean not null default false;
```

## 2. PayTR Üye İşyeri Paneli

1. [PayTR](https://www.paytr.com) üzerinden başvuru yapın.
2. Onay sonrası **Destek & Kurulum** → **Entegrasyon Bilgileri** bölümünden:
   - **Mağaza No** → `PAYTR_MERCHANT_ID`
   - **Mağaza Parola** → `PAYTR_MERCHANT_KEY`
   - **Mağaza Gizli Anahtar** → `PAYTR_MERCHANT_SALT`
3. **Destek & Kurulum** → **Ayarlar** → **Bildirim URL**:
   - `https://SITENIZ.com/api/payment/callback`
   - Örnek: `https://ealmaker-ai.vercel.app/api/payment/callback`
   - **HTTPS** kullanın; HTTP kabul edilmez.

## 3. Ortam Değişkenleri (Vercel / .env.local)

| Key | Açıklama |
|-----|----------|
| `PAYTR_MERCHANT_ID` | Mağaza No |
| `PAYTR_MERCHANT_KEY` | Mağaza Parola |
| `PAYTR_MERCHANT_SALT` | Mağaza Gizli Anahtar |
| `PAYTR_TEST_MODE` | Test için `1`, canlı için `0` veya boş |

Vercel: Proje → Settings → Environment Variables → ekle → Redeploy.

## 4. Ödeme Akışı

1. Kullanıcı **Fiyatlandırma** → **Pro'ya geç** → giriş yoksa **Giriş yap**.
2. **/odeme/checkout** sayfası açılır; Mesafeli Satış ve Ön Bilgilendirme linkleri gösterilir.
3. `/api/checkout` POST ile token alınır; PayTR iframe yüklenir.
4. Ödeme tamamlanınca PayTR **POST /api/payment/callback** ile bildirim gönderir.
5. Callback'te hash doğrulanır, `usage.is_pro = true` yapılır.
6. Kullanıcı **/odeme/basarili** veya **/odeme/iptal** sayfasına yönlendirilir.

## 5. Hash Hesaplama (Referans)

- **1. ADIM (get-token):** `merchant_id + user_ip + merchant_oid + email + payment_amount + user_basket + no_installment + max_installment + currency + test_mode + merchant_salt` → HMAC-SHA256(merchant_key).
- **2. ADIM (callback):** `merchant_oid + merchant_salt + status + total_amount` → HMAC-SHA256(merchant_key).

Kaynak: [PayTR iFrame API](https://dev.paytr.com/iframe-api)
