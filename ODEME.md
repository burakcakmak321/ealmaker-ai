# Param (ParamPOS) Ödeme Altyapısı

Pro ve tek seferlik ödemeler Param (ParamPOS) 3D Secure API ile alınır. Entegrasyon: [Param entegrasyon dokümanı](https://dev.param.com.tr/dosya/integration-document.pdf).

## Gerekli bilgiler

Param’dan alınacak: **CLIENT_CODE**, **CLIENT_USERNAME**, **CLIENT_PASSWORD**, **GUID**. Canlı kullanım için sunucu IP adresinizi Param’a iletmeniz gerekir.

## Ortam değişkenleri (Vercel / .env.local)

| Key | Açıklama |
|-----|----------|
| `PARAMPOS_CLIENT_CODE` | Terminal ID |
| `PARAMPOS_CLIENT_USERNAME` | Kullanıcı adı |
| `PARAMPOS_CLIENT_PASSWORD` | Şifre |
| `PARAMPOS_GUID` | Üye iş yeri anahtarı (GUID) |
| `PARAMPOS_TEST` | Test için `1`, canlı için `0` veya boş |

## Ödeme akışı

1. Kullanıcı **Fiyatlandırma** → **Pro'ya geç** veya **Tek seferlik** → giriş yoksa **Giriş yap**.
2. **/odeme/checkout** sayfasında sözleşmeleri onaylar, **Ödemeye geç** ile kart formu açılır.
3. Kart bilgileri **POST /api/checkout/parampos** ile gönderilir; Param **TP_WMD_UCD** ile 3D HTML döner.
4. 3D Secure banka sayfası gösterilir; kullanıcı doğrulama yapar.
5. Banka **POST /api/payment/parampos/success** veya **/api/payment/parampos/fail** ile sonucu iletir.
6. Success’te hash doğrulanır, **TP_WMD_Pay** ile tahsilat tamamlanır, `usage.is_pro` veya `one_time_credits` güncellenir.
7. Kullanıcı **/odeme/basarili** veya **/odeme/iptal** sayfasına yönlendirilir.

## API route’lar

- **POST /api/checkout/parampos** — Kart bilgileri + plan; yanıt: `ucdHtml` (3D sayfası) veya hata.
- **POST /api/payment/parampos/success** — Banka 3D dönüşü (md, mdStatus, orderId, islemGUID, islemHash); TP_WMD_Pay + usage güncellemesi; redirect `/odeme/basarili?plan=...`.
- **POST /api/payment/parampos/fail** — Redirect `/odeme/iptal`.

Kaynak: [Param entegrasyon dokümanı](https://dev.param.com.tr/dosya/integration-document.pdf)
