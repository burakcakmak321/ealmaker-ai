# Ödeme (PayTR) — Adım Adım

Pro ödemesini açmak için aşağıdakileri sırayla yap.

---

## 1. PayTR üye işyeri hesabı

1. **https://www.paytr.com** → Üye İşyeri Başvurusu veya Giriş.
2. Hesabın onaylı ve **Entegrasyon Bilgileri** açılmış olsun (Mağaza No, Parola, Gizli Anahtar görünüyor olmalı).

---

## 2. PayTR panelinden bilgileri al

1. PayTR’ye giriş yap.
2. **Destek & Kurulum** (veya **Kurulum / Entegrasyon**) bölümüne gir.
3. **Entegrasyon Bilgileri** / **API Bilgileri** sayfasını aç.
4. Şunları not al (birebir kopyala):
   - **Mağaza No** → bu `PAYTR_MERCHANT_ID`
   - **Mağaza Parola** → bu `PAYTR_MERCHANT_KEY`
   - **Mağaza Gizli Anahtar** → bu `PAYTR_MERCHANT_SALT`

---

## 3. Callback adresini PayTR’ye tanıt

PayTR, ödeme sonucunu sunucumuza POST ile gönderir. Bu adres panelde tanımlı olmalı.

1. PayTR panelinde **Callback URL** / **Bildirim URL** / **IPN URL** gibi bir alan ara.
2. Şu adresi yaz:
   ```
   https://ealmaker-ai.vercel.app/api/payment/callback
   ```
3. Kaydet.

(Bazı panellerde bu alan “iframe callback” veya “Sunucu Bildirimi” diye geçer.)

---

## 4. Vercel’e env değişkenlerini ekle

1. **https://vercel.com** → **ealmaker-ai** projesini aç.
2. **Settings** → **Environment Variables**.
3. Aşağıdaki 3 değişkeni tek tek ekle (Value’lara PayTR’den kopyaladığın değerleri yapıştır):

| Key | Value | Environments |
|-----|--------|--------------|
| `PAYTR_MERCHANT_ID` | Mağaza No | Production, Preview, Development |
| `PAYTR_MERCHANT_KEY` | Mağaza Parola | Production, Preview, Development |
| `PAYTR_MERCHANT_SALT` | Mağaza Gizli Anahtar | Production, Preview, Development |

4. **Test modu** için (isteğe bağlı):
   - Key: `PAYTR_TEST_MODE`
   - Value: `1`
   - Canlıya geçince bu değişkeni sil veya `0` yap.

5. Her biri için **Save** de.

---

## 5. Redeploy

1. Vercel’de **Deployments** sekmesine geç.
2. En üstteki deployment’ın yanındaki **⋯** → **Redeploy** → **Redeploy**.
3. 1–2 dakika bekle.

---

## 6. Test

1. **https://ealmaker-ai.vercel.app** → Giriş yap.
2. **Fiyatlandırma** → **Pro'ya geç — 24,50 ₺/ay**.
3. **/odeme/checkout** açılmalı, PayTR ödeme ekranı (iframe) gelmeli.
4. Test modundaysan test kartı ile ödeme dene; canlıdaysan gerçek kart ile dene.
5. Başarılı ödemede **/odeme/basarili** sayfasına yönlenmeli ve hesabın Pro (sınırsız kullanım) olmalı.

---

## Hata alırsan

- **“Token alınamadı” / hash hatası:** PayTR panelindeki Mağaza No, Parola, Gizli Anahtar’ın Vercel’deki değerlerle birebir aynı olduğundan emin ol. Başında/sonunda boşluk olmasın.
- **Callback çalışmıyor (Pro aktif olmuyor):** PayTR panelinde Callback URL’nin `https://ealmaker-ai.vercel.app/api/payment/callback` olduğunu kontrol et. Canlı ortamda HTTP değil HTTPS kullan.
- **401 / yetki hatası:** Giriş yapmadan checkout’a gidemezsin; önce **Giriş yap**, sonra **Pro'ya geç** butonuna tıkla.

Bu adımları tamamlayınca ödeme işlemi halledilmiş olur.
