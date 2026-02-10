# Ödeme (Param) — Adım Adım

Ödemeyi açmak için aşağıdakileri sırayla yap.

---

## 1. Param üye işyeri hesabı

1. **https://dev.param.com.tr** veya Param ile iletişime geçip üye işyeri hesabı aç.
2. Entegrasyon tamamlandığında **CLIENT_CODE**, **CLIENT_USERNAME**, **CLIENT_PASSWORD**, **GUID** bilgileri iletilecek.

---

## 2. Param’dan bilgileri al

Param / entegrasyon ekibinden şunları al (birebir kopyala):

- **CLIENT_CODE** (Terminal ID)
- **CLIENT_USERNAME**
- **CLIENT_PASSWORD**
- **GUID** (üye iş yeri anahtarı)

Canlı ortam için **sunucu IP adresinizi** (veya Vercel outbound IP’lerini) ve **site adresinizi** Param’a iletin.

---

## 3. Vercel’e env değişkenlerini ekle

1. **https://vercel.com** → Projeni aç → **Settings** → **Environment Variables**.
2. Aşağıdaki değişkenleri ekle:

| Key | Value | Environments |
|-----|--------|--------------|
| `PARAMPOS_CLIENT_CODE` | Param’dan gelen değer | Production, Preview, Development |
| `PARAMPOS_CLIENT_USERNAME` | Param’dan gelen değer | Production, Preview, Development |
| `PARAMPOS_CLIENT_PASSWORD` | Param’dan gelen değer | Production, Preview, Development |
| `PARAMPOS_GUID` | Param’dan gelen GUID | Production, Preview, Development |

3. **Test** için:
   - Key: `PARAMPOS_TEST`
   - Value: `1`
   - Canlıya geçince `0` yap veya kaldır.

4. **Save** → **Redeploy**.

---

## 4. Callback adresleri

Param tarafında (gerekirse) başarı ve hata URL’leri şöyle tanımlanır:

- **Başarılı:** `https://SITENIZ.com/api/payment/parampos/success`
- **Hata/İptal:** `https://SITENIZ.com/api/payment/parampos/fail`

(Bu adresler kodda zaten kullanılıyor; Param panelinde ayrıca girilmesi istenirse yukarıdakileri kullan.)

---

## 5. Test

1. Siteye giriş yap.
2. **Fiyatlandırma** → **Pro'ya geç** veya **Tek seferlik**.
3. **/odeme/checkout** açılmalı; sözleşmeleri onayla → **Ödemeye geç** → kart formu gelmeli.
4. Test kartı (Param dokümanındaki) veya canlı kart ile ödeme dene.
5. Başarılı ödemede **/odeme/basarili** sayfasına yönlenmeli; Pro veya tek seferlik kredi hesaba işlenmeli.

---

## Hata alırsan

- **“ParamPOS yapılandırılmadı”:** Vercel’de dört env değişkeninin (CLIENT_CODE, USERNAME, PASSWORD, GUID) tanımlı olduğundan emin ol.
- **“Ödeme başlatılamadı” / SOAP hatası:** Param’dan aldığın değerlerin doğru olduğunu kontrol et; test ortamı için `PARAMPOS_TEST=1` kullan.
- **3D sonrası Pro/kredi gelmiyor:** Param’a ilettiğin IP ve site adresinin canlı ortamla uyumlu olduğunu kontrol et; success callback’in erişilebilir olduğundan emin ol.

Bu adımları tamamlayınca ödeme işlemi Param üzerinden çalışır.
