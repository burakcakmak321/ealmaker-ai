# short.py — Termux'ta tek komutla YouTube Shorts

Telefonda, kök (root) erişimi olmadan çalışan otomatik Shorts üreticisi.
Sen sadece konuyu yazıyorsun; senaryo, seslendirme, stok görüntü, müzik,
hareketli altyazı ve montaj kendiliğinden yapılıyor.

```
python short.py "kediler neden uzaylı gibi davranıyor"
```

Sonuç: `~/storage/movies/short_YYYYAAGG_SSDDSS.mp4` (1080x1920) + aynı adla
başlık/etiket `.txt` dosyası.

---

## 1. Kurulum (bir kez yapılır)

Termux'ta sırayla şu komutları yaz:

```bash
pkg update && pkg upgrade -y
pkg install -y python ffmpeg
pip install requests edge-tts
termux-setup-storage        # galeriye kaydedebilmek için (izin ver)
```

`termux-media-scan` için (isteğe bağlı, videonun galeride hemen görünmesi için):

```bash
pkg install -y termux-api
```

## 2. Anahtarları gir

İki ücretsiz anahtar gerekiyor: senaryo için Gemini, görüntü için Pexels.

```bash
nano ~/.shortrc
```

Açılan dosyaya şunları yaz (kendi anahtarlarınla):

```
GEMINI_API_KEY=buraya_gemini_anahtarin
PEXELS_API_KEY=buraya_pexels_anahtarin
```

Kaydet: `CTRL+O`, `ENTER` — çık: `CTRL+X`

- Gemini anahtarı (ücretsiz): https://aistudio.google.com/apikey
- Pexels anahtarı (ücretsiz): https://www.pexels.com/api/

İstersen Gemini yerine başka sağlayıcı kullanabilirsin; o zaman ilgili satırı
ekle: `OPENAI_API_KEY=`, `ANTHROPIC_API_KEY=` ya da `OPENROUTER_API_KEY=`.

## 3. Fon müziği (isteğe bağlı)

```bash
mkdir -p ~/muzik
```

İçine mp3 at; her videoda rastgele biri seçilir. Klasör boşsa müziksiz devam
eder, hata vermez.

> **Önemli:** Vokalli müzik YouTube'da Content ID talebi yiyor.
> **Enstrümantal / vokalsiz** parça kullan.

---

## Kullanım

```bash
python short.py "kediler neden uzaylı gibi davranıyor"
```

Sık kullanılan seçenekler:

| Komut | Ne yapar |
|---|---|
| `--ses kadin` | Kadın sesiyle seslendirir (varsayılan erkek) |
| `--hiz +25%` | Konuşma hızını değiştirir (varsayılan `+35%`) |
| `--duzenle` | Senaryoyu gösterir, sen onaylamadan videoya geçmez |
| `--sadece-senaryo` | Sadece `senaryo.txt` üretir, video yapmaz |
| `--metin "..."` | Kendi metnini kullanır, yapay zekâya hiç gitmez |
| `--aramalar "cat closeup,night city"` | Stok görüntü terimlerini sen verirsin (İNGİLİZCE) |
| `--klip-klasor ~/videolar` | Pexels yerine kendi videolarını kullanır (veri harcamaz) |
| `--muziksiz` | Fon müziği koymaz |
| `--veri-limiti 30` | En fazla 30 MB klip indirir (varsayılan 60 MB) |
| `--saglayici openai` | Senaryoyu başka sağlayıcıya yazdırır |
| `--sabit-kadraj` | Yavaş zoom (Ken Burns) efektini kapatır |
| `--hata-detay` | Hata olursa teknik ayrıntıyı da yazar |

Örnekler:

```bash
python short.py "denizde neden tuz var" --ses kadin --hiz +30%
python short.py "kahve neden uyku kaçırır" --duzenle
python short.py "sabah rutini" --metin-dosya notlarim.txt --aramalar "sunrise city,coffee cup"
```

---

## Sık karşılaşılan durumlar

**"Anahtar bulunamadı" diyor** → `nano ~/.shortrc` ile aç, satırı ekle,
anahtarın başında/sonunda boşluk veya tırnak bırakma.

**Video galeride görünmüyor** → `termux-setup-storage` çalıştırdın mı? Sonra
telefonu bir kez kilitleyip aç.

**"Seslendirme dosyası boş çıktı"** → İnternet yok ya da edge-tts eski.
`pip install -U edge-tts` yaz.

**Video çok uzun sürüyor** → `--sabit-kadraj` ile zoom efektini kapat; 60
saniyelik video orta seviye telefonda ~5-10 dakika sürer.

**Türkçe karakterler bozuk çıkıyor** → Font `/system/fonts` altından okunur;
Roboto yoksa Noto Sans denenir. İkisi de yoksa uyarı verir.

---

## Ayarları değiştirmek

`short.py` dosyasının en üstünde tek blok hâlinde tüm ayarlar var
(punto, renk, klip süresi, müzik seviyesi, veri limiti, model adları...).
Sadece o bloğu düzenlemen yeterli:

```bash
nano short.py
```
