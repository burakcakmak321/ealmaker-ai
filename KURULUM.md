# YazıAsistan — Çalıştırma Rehberi (Adım Adım)

Bu rehber, projeyi bilgisayarınızda ilk kez çalıştırmak için gereken tüm adımları anlatır.

---

## 1. Node.js Kurulu mu Kontrol Et

Proje Node.js ile çalışır. Kurulu değilse önce Node.js kurmalısın.

### Kontrol etmek için

1. **Windows:** `Win + R` tuşlarına bas → `cmd` yaz → Enter.
2. Açılan siyah pencerede (Komut İstemi) şunu yaz ve Enter’a bas:
   ```text
   node -v
   ```
3. Bir sürüm numarası görüyorsan (örn. `v20.10.0`) Node.js kurulu demektir. **Adım 2**’ye geç.
4. `'node' tanınmıyor` gibi bir hata görüyorsan Node.js kurulu değildir.

### Node.js kurmak için

1. Tarayıcıda **https://nodejs.org** adresine git.
2. **LTS** (önerilen) sürümünü indir (yeşil buton).
3. İndirilen `.msi` dosyasını çalıştır, kurulum sihirbazında varsayılan seçeneklerle ilerle.
4. Kurulum bitince bilgisayarı yeniden başlat (veya en azından Cursor/VS Code’u kapatıp aç).
5. Tekrar Komut İstemi’nde `node -v` yazıp sürüm çıktığını kontrol et.

---

## 2. Proje Klasörüne Git

Terminalde (Komut İstemi veya PowerShell) projenin bulunduğu klasöre geçmen gerekir.

### Cursor / VS Code içinden

1. Üst menüden **Terminal** → **Yeni Terminal** (veya `Ctrl + `` `) aç.
2. Aşağıdaki komutu yazıp Enter’a bas:
   ```text
   cd c:\Users\burak\Desktop\dsa
   ```
3. Artık terminal bu klasörde çalışıyor. Bir sonraki adımlar hep bu terminalde yapılacak.

### Windows Komut İstemi / PowerShell’den

1. `Win + R` → `cmd` veya `powershell` yaz → Enter.
2. Aynı komutu yaz:
   ```text
   cd c:\Users\burak\Desktop\dsa
   ```

---

## 3. Bağımlılıkları Yükle (npm install)

Proje, Next.js ve diğer kütüphaneleri kullanır. Bunlar `package.json` dosyasında yazılı; hepsini indirmek için tek komut yeter.

1. Terminalde hâlâ `c:\Users\burak\Desktop\dsa` klasöründe olduğundan emin ol.
2. Şunu yazıp Enter’a bas:
   ```text
   npm install
   ```
3. İndirme ve kurulum birkaç dakika sürebilir. Sonunda `added XXX packages` gibi bir satır görürsün.
4. Hata alırsan: İnternet bağlantısını kontrol et; aynı komutu bir kez daha dene.

---

## 4. OpenAI API Anahtarı Al ve Ekle

Metin üretimi OpenAI API ile yapılıyor. Bunun için bir API anahtarı gerekir.

### Anahtar almak

1. Tarayıcıda **https://platform.openai.com** adresine git.
2. Giriş yap (veya OpenAI hesabı oluştur).
3. Sağ üstte profil → **API keys** (veya **View API keys**) tıkla.
4. **Create new secret key** ile yeni anahtar oluştur.
5. Anahtarı kopyala (bir kez gösterilir; kaydetmediysen tekrar oluşturman gerekir). Örnek: `sk-proj-...` ile başlar.

### Projeye eklemek

1. Proje klasöründe (Cursor’da Sol panelde) **`.env.example`** dosyasını görürsün.
2. Aynı klasörde **`.env.local`** adında yeni bir dosya oluştur:
   - Sol panelde `dsa` klasörüne sağ tık → **New File** → dosya adı: `.env.local`
3. `.env.local` dosyasını aç ve içine şunu yaz (kendi anahtarını yapıştır):
   ```text
   OPENAI_API_KEY=sk-proj-buraya-kendi-anahtarini-yapistir
   ```
4. Dosyayı kaydet (`Ctrl + S`). Bu dosyayı kimseyle paylaşma ve GitHub’a yükleme (zaten `.gitignore`’da).

---

## 4b. Supabase Kurulumu (Giriş / Kayıt, 2 Ücretsiz Hak, Admin)

Site artık giriş/kayıt ve 2 ücretsiz kullanım hakkı kullanıyor. Bunun için Supabase hesabı gerekir.

1. **https://supabase.com** → Giriş yap → **New Project** → İsim ve şifre ver → **Create**.
2. Proje açılınca **Settings** → **API** → **Project URL**, **anon public** key ve **Service Role** key’i kopyala.
3. **SQL Editor** → **New query** → Proje kökündeki **`supabase-usage-table.sql`** içeriğini yapıştır → **Run**.
4. `.env.local` dosyasına ekle (kendi değerlerinle):
   - `NEXT_PUBLIC_SUPABASE_URL=...`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
   - `SUPABASE_SERVICE_ROLE_KEY=...`
   - `ADMIN_EMAILS=senin@email.com` (admin paneline girebilecek e-posta)
5. Admin paneli: Giriş yaptıktan sonra **/admin** adresine git; sadece ADMIN_EMAILS’teki e-postalar bu sayfayı görebilir. Kayıtlı tüm kullanıcılar (telefon veya bilgisayar) listelenir.

---

## 5. Geliştirme Sunucusunu Başlat

1. Terminalde yine `c:\Users\burak\Desktop\dsa` klasöründe ol.
2. Şunu yazıp Enter’a bas:
   ```text
   npm run dev
   ```
3. Birkaç saniye sonra şuna benzer bir çıktı görürsün:
   ```text
   ▲ Next.js 14.x.x
   - Local:        http://localhost:3000
   ```
4. Sunucu çalışıyor demektir; bu terminal penceresini **kapatma**. Kapatırsan site kapanır.

---

## 6. Siteyi Tarayıcıda Aç

1. Tarayıcıyı aç (Chrome, Edge, Firefox vb.).
2. Adres çubuğuna yaz:
   ```text
   http://localhost:3000
   ```
3. Enter’a bas. YazıAsistan ana sayfası açılmalı.
4. **Fatura İtirazı**, **Pazarlık** veya **Dilekçe** sayfalarına girip formu doldurup “Oluştur” dersen, OpenAI API anahtarın geçerliyse metin üretilir.

---

## 7. Sunucuyu Durdurmak

- Çalışan terminalde **Ctrl + C** tuşlarına bas.
- Sorulursa “Terminate batch job? (Y/N)” için **Y** yazıp Enter’a bas.
- Sunucu kapanır; tarayıcıda localhost artık açılmaz.

---

## 8. Sonraki Sefer Çalıştırmak

Projeyi bir dahaki sefer açtığında:

1. Terminal aç.
2. `cd c:\Users\burak\Desktop\dsa`
3. `npm run dev`
4. Tarayıcıda **http://localhost:3000** aç.

`.env.local` ve `node_modules` zaten olduğu için tekrar `npm install` yapmana gerek yok (sadece `package.json` değiştiyse `npm install` tekrar çalıştır).

---

## Sık Karşılaşılan Sorunlar

| Sorun | Ne yapmalı |
|--------|-------------|
| `node -v` çalışmıyor | Node.js’i kur, bilgisayarı yeniden başlat. |
| `npm install` hata veriyor | İnternet bağlantısını kontrol et; aynı klasörde `npm install` tekrar dene. |
| Sayfa açılıyor ama metin üretilmiyor | `.env.local` dosyasında `OPENAI_API_KEY=sk-...` doğru mu kontrol et; anahtarın OpenAI’da aktif ve bakiye var mı bak. |
| “OPENAI_API_KEY tanımlı değil” hatası | `.env.local` proje kökünde mi (dsa klasöründe), isim tam `.env.local` mi kontrol et; sunucuyu durdurup `npm run dev` ile tekrar başlat. |
| Port 3000 kullanımda | Başka bir program 3000 kullanıyordur. O programı kapat veya `npm run dev` çalışırken farklı port gösterilirse (örn. 3001) tarayıcıda o adresi aç. |

Bu adımları takip edersen proje bilgisayarında çalışır. Takıldığın adımı yazarsan, o adımı daha da detaylandırabilirim.
