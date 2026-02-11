# Admin Paneli Kurulumu (Vercel)

Admin şifresi çalışmıyorsa `hasAdminPassword: false` alıyorsan, `ADMIN_PASSWORD` Vercel'de projeye ulaşmıyor demektir.

## Tek Doğru Yol: Proje Environment Variables

1. **vercel.com** adresine gir, giriş yap.

2. Sol menüden **Projects** → **ealmaker-ai** projesine tıkla.
   - (ealmaker-ai.vercel.app bu projeden deploy ediliyor)

3. Üst sekmeden **Settings** → **Environment Variables** sayfasına gir.

4. **Add New** butonuna tıkla:
   - **Key:** `ADMIN_PASSWORD`
   - **Value:** `1808Burak` (veya kullanmak istediğin şifre)
   - **Environments:** Production, Preview, Development hepsini işaretle
   - **Save** ile kaydet

5. **Deployments** sekmesine geç → en son deployment'ın sağındaki **⋯** (üç nokta) → **Redeploy** tıkla.

6. Redeploy bitince **ealmaker-ai.vercel.app/api/debug-env** adresini aç. `hasAdminPassword: true` görmelisin.

7. Ana sayfada logo'ya 5 kez tıkla → şifreyi gir → admin paneli açılır.

---

## Sık Hata: Team Environment Variables

Eğer **Team** (takım) ayarlarından Environment Variables eklediysen:

- Team Settings > Environment Variables sayfasındasın
- Buradaki değişkenler varsayılan olarak projelere **bağlı değildir**
- **Edit** (ADMIN_PASSWORD satırında ⋯ > Edit) → **Link to Projects** bölümünde arama kutusuna `ealmaker-ai` yaz → projeyi seç → Save
- Ardından mutlaka **Redeploy** yap

**Öneri:** Karışıklığı önlemek için ADMIN_PASSWORD'ü doğrudan proje ayarlarına ekle (yukarıdaki 1–5 adımları).
