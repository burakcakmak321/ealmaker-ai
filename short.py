#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
short.py — Termux için tek komutluk YouTube Shorts üreticisi.

    python short.py "kediler neden uzaylı gibi davranıyor"

Akış: senaryo (LLM) -> seslendirme (edge-tts) -> stok klip (Pexels)
      -> ASS altyazı + hareketli grafikler -> tek geçiş ffmpeg montaj -> galeri.

Bağımlılık: python, ffmpeg, ffprobe, edge-tts, requests. Başkası yok.
moviepy / PIL / ImageMagick KULLANILMAZ; her şey ham ffmpeg çağrısıdır.
"""

import argparse
import json
import os
import random
import re
import shutil
import subprocess
import sys
from datetime import datetime

try:
    import requests
except ImportError:  # Termux'ta bazen requests kurulu olmuyor
    sys.stderr.write(
        "HATA: 'requests' kütüphanesi kurulu değil.\n"
        "Çözüm: Termux'ta şu komutu yaz:\n"
        "  pip install requests\n"
    )
    sys.exit(1)


# ==========================================================================
#  AYARLAR — değiştirmek istediğin her şey burada.
# ==========================================================================

# --- Video ---
VIDEO_GENISLIK = 1080            # Shorts standardı
VIDEO_YUKSEKLIK = 1920
FPS = 30
X264_PRESET = "veryfast"         # Telefon işlemcisi zayıf, hızlı preset şart
X264_CRF = 24                    # 20 = daha kaliteli/büyük, 28 = daha küçük

# --- Klipler ve hareket ---
KLIP_MIN_SANIYE = 4.0            # Her stok klip en az bu kadar ekranda kalır
KLIP_MAX_SANIYE = 6.0            # ...en fazla bu kadar
GECIS_SANIYE = 0.3               # Klipler arası xfade süresi
GECIS_TIPLERI = ["fade", "wipeleft", "slideup", "wiperight", "slideleft"]
KEN_BURNS = True                 # Yavaş zoom (sabit görüntü şablon hissi verir)
ZOOM_MIKTARI = 0.08              # 1.00 -> 1.08 arası zoom

# --- Seslendirme ---
SES_ERKEK = "tr-TR-AhmetNeural"
SES_KADIN = "tr-TR-EmelNeural"
SES_VARSAYILAN = SES_ERKEK
SES_HIZI = "+35%"                # Shorts temposu için hızlı okuma
SES_PERDESI = "+0Hz"

# --- Müzik ---
MUZIK_KLASORU = "~/muzik"        # Fon müziği buradan RASTGELE seçilir
MUZIK_SES_SEVIYESI = 0.10        # Konuşmanın %10'u kadar
MUZIK_FADE_IN = 2.0
MUZIK_FADE_OUT = 3.0
DUCKING = True                   # Konuşma varken müziği otomatik kıs
MUZIK_UZANTILARI = (".mp3", ".m4a", ".aac", ".wav", ".ogg", ".opus", ".flac")

# --- Altyazı ---
ALTYAZI_KELIME = 3               # Her altyazı parçasında kaç kelime dursun
ALTYAZI_BUYUK_HARF = True
ALTYAZI_PUNTO = 76
ALTYAZI_ALT_BOSLUK = 430         # Alt kenardan boşluk (ASS MarginV)
HOOK_PUNTO = 104
HOOK_SANIYE = 1.15               # Hook kaç saniye tam ekran ortada dursun
VURGU_RENGI = "&H00FFFF&"        # Anahtar kelime rengi (ASS &HBBGGRR&) = sarı
ANA_RENK = "&HFFFFFF&"           # Beyaz
VURGU_BUYUME = 110               # Anahtar kelime %110 büyüklükte

# --- Stok görüntü (Pexels) ---
PEXELS_SONUC = 10                # Her arama teriminde kaç sonuç istensin
MAX_INDIRME_MB = 60              # Mobil veri kalkanı: bundan fazlasını indirme
KULLANICI_AJANI = (              # Pexels, Python-urllib kimliğini 403 ile reddediyor
    "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
)

# --- LLM ---
VARSAYILAN_SAGLAYICI = "gemini"  # gemini | anthropic | openai | openrouter
VARSAYILAN_MODEL = {
    "gemini": "gemini-2.0-flash",
    "anthropic": "claude-opus-5",
    "openai": "gpt-4o-mini",
    "openrouter": "google/gemini-2.0-flash-001",
}
ANAHTAR_ADI = {                  # ~/.shortrc içindeki satır adları
    "gemini": "GEMINI_API_KEY",
    "anthropic": "ANTHROPIC_API_KEY",
    "openai": "OPENAI_API_KEY",
    "openrouter": "OPENROUTER_API_KEY",
}

# --- Dosya yolları ---
SHORTRC = "~/.shortrc"
CALISMA_KLASORU = "~/.short_calisma"      # Her çalıştırmada TAMAMEN silinir
CIKIS_ADAYLARI = ["~/storage/movies", "~/storage/dcim", "~/Videos", "~/videolar"]

# --- Font (Android fontları /system/fonts altında) ---
FONT_ADAYLARI = [
    ("/system/fonts", "Roboto-Regular.ttf", "Roboto"),
    ("/system/fonts", "NotoSans-Regular.ttf", "Noto Sans"),
    ("/usr/share/fonts/truetype/dejavu", "DejaVuSans.ttf", "DejaVu Sans"),
    ("/usr/share/fonts/truetype/liberation", "LiberationSans-Regular.ttf", "Liberation Sans"),
    ("/usr/share/fonts/truetype/noto", "NotoSans-Regular.ttf", "Noto Sans"),
    ("/system/fonts", "DroidSans.ttf", "Droid Sans"),
]

# ==========================================================================
#  Buradan sonrası çalışma kodu
# ==========================================================================


class Hata(Exception):
    """Kullanıcıya Türkçe gösterilecek, anlaşılır hata."""


def yol(p):
    """~ ile başlayan yolları açar."""
    return os.path.abspath(os.path.expanduser(p))


def yaz(mesaj):
    print(mesaj, flush=True)


def adim(no, toplam, mesaj):
    yaz("[%d/%d] %s" % (no, toplam, mesaj))


def tr_buyuk(metin):
    """Türkçe'ye uygun BÜYÜK HARF. Python'un .upper() metodu i -> I yapıyor."""
    return metin.replace("i", "İ").replace("ı", "I").upper()


def komut_var(ad):
    return shutil.which(ad) is not None


def calistir(komut, hata_mesaji, calisma_dizini=None):
    """Dışarı komut çalıştırır; hata olursa Türkçe mesajla Hata fırlatır."""
    try:
        sonuc = subprocess.run(
            komut,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            cwd=calisma_dizini,
        )
    except FileNotFoundError:
        raise Hata("%s\n(Çözüm: '%s' komutu bulunamadı.)" % (hata_mesaji, komut[0]))
    cikti = sonuc.stdout.decode("utf-8", "replace") if sonuc.stdout else ""
    if sonuc.returncode != 0:
        son = "\n".join([s for s in cikti.strip().splitlines() if s.strip()][-8:])
        raise Hata("%s\n\nProgramın son çıktısı:\n%s" % (hata_mesaji, son))
    return cikti


def ffprobe_sure(dosya):
    """Medya dosyasının saniye cinsinden süresi. Okunamazsa 0.0."""
    try:
        cikti = subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration",
             "-of", "default=noprint_wrappers=1:nokey=1", dosya],
            stdout=subprocess.PIPE, stderr=subprocess.DEVNULL,
        ).stdout.decode().strip()
        return float(cikti)
    except Exception:
        return 0.0


def _edge_tts_modulu_var():
    try:
        import edge_tts  # noqa: F401
        return True
    except Exception:
        return False


def edge_tts_komutu():
    """edge-tts çalıştırma komutu (binary yoksa python modülü)."""
    if komut_var("edge-tts"):
        return ["edge-tts"]
    return [sys.executable, "-m", "edge_tts"]


def ffmpeg_filtreleri():
    """Kurulu ffmpeg'in hangi filtreleri desteklediğini öğrenir."""
    try:
        cikti = subprocess.run(["ffmpeg", "-hide_banner", "-filters"],
                               stdout=subprocess.PIPE,
                               stderr=subprocess.DEVNULL).stdout.decode("utf-8", "replace")
    except Exception:
        return set()
    return set(re.findall(r"^\s*[A-Z.]{3}\s+(\S+)\s", cikti, re.M))


def ortam_kontrol():
    """Gerekli programlar var mı? Yoksa nasıl kurulacağını yaz.
    Dönüş: kurulu ffmpeg filtrelerinin kümesi."""
    eksik = []
    if not komut_var("ffmpeg"):
        eksik.append(("ffmpeg", "pkg install ffmpeg"))
    if not komut_var("ffprobe"):
        eksik.append(("ffprobe", "pkg install ffmpeg"))
    if not (komut_var("edge-tts") or _edge_tts_modulu_var()):
        eksik.append(("edge-tts", "pip install edge-tts"))
    if eksik:
        satirlar = ["Şu programlar eksik olduğu için devam edilemiyor:", ""]
        for ad, kurulum in eksik:
            satirlar.append("  - %-9s ->  Termux'ta yaz:  %s" % (ad, kurulum))
        satirlar += ["", "Hepsini birden kurmak için:",
                     "  pkg install ffmpeg && pip install edge-tts requests"]
        raise Hata("\n".join(satirlar))

    filtreler = ffmpeg_filtreleri()
    if filtreler and "ass" not in filtreler:
        raise Hata(
            "Kurulu ffmpeg altyazı desteği (libass) olmadan derlenmiş,\n"
            "altyazı basılamaz.\n"
            "Çözüm: Termux'ta ffmpeg'i yeniden kur:\n"
            "  pkg reinstall ffmpeg")
    return filtreler


def ayarlari_oku():
    """~/.shortrc dosyasından ANAHTAR=değer satırlarını okur."""
    dosya = yol(SHORTRC)
    ayarlar = {}
    if os.path.isfile(dosya):
        with open(dosya, "r", encoding="utf-8", errors="replace") as f:
            for satir in f:
                satir = satir.strip()
                if not satir or satir.startswith("#") or "=" not in satir:
                    continue
                ad, _, deger = satir.partition("=")
                ayarlar[ad.strip().upper()] = deger.strip().strip('"').strip("'")
    # Ortam değişkeni varsa dosyadaki değeri ezer
    for ad in list(ANAHTAR_ADI.values()) + ["PEXELS_API_KEY"]:
        if os.environ.get(ad):
            ayarlar[ad] = os.environ[ad]
    return ayarlar


def anahtar_yok_mesaji(anahtar_adi, nasil_alinir):
    """Anahtar yokken kullanıcıya ne yazacağını adım adım söyler."""
    return (
        "'%s' anahtarı bulunamadı.\n\n"
        "Çözüm — Termux'ta sırayla şunu yaz:\n"
        "  nano ~/.shortrc\n"
        "Açılan boş dosyaya şu satırı ekle (kendi anahtarınla):\n"
        "  %s=buraya_anahtarını_yapıştır\n"
        "Kaydet: CTRL+O sonra ENTER, çıkış: CTRL+X\n\n"
        "%s"
    ) % (anahtar_adi, anahtar_adi, nasil_alinir)


# ==========================================================================
#  1) SENARYO — LLM'den JSON iste, parse et
# ==========================================================================

SISTEM_PROMPT = """Sen Türkçe YouTube Shorts senaryosu yazan bir metin yazarısın.
Sana verilen konudan 40-50 saniyelik tek bir Shorts senaryosu üretirsin.

KURALLAR:
- Hook (ilk cümle) 6-10 kelime olacak, İDDİA içerecek, açıklama içermeyecek.
- "Biliyor muydunuz", "Bu videoda", "Merhaba arkadaşlar", "Hoş geldiniz",
  "Kanala abone olun" gibi kalıplar YASAK.
- Cümleler kısa olacak. Uzun bağlaçlı cümle kurma.
- Anlatım akıcı, iddialı ve merak uyandıran olacak; ansiklopedi dili olmayacak.
- Kapanış tek satır ve vurucu olacak.
- Senaryo metninde emoji, madde işareti, başlık, parantez içi not olmayacak.
- Senaryo 90-120 kelime olacak.

ÇOK ÖNEMLİ: "gorsel_aramalar" listesindeki terimler İNGİLİZCE olacak.
Stok video sitesi (Pexels) Türkçe sorguda sonuç vermiyor. 3-5 terim ver,
her terim 1-3 kelime olsun ve videoda gerçekten görülebilecek somut sahneler
tarif etsin (soyut kavram değil).

Sadece şu şemada GEÇERLİ JSON döndür, başka hiçbir şey yazma:
{"hook": "...", "senaryo": "...", "gorsel_aramalar": ["...", "..."],
 "baslik": "...", "etiketler": ["...", "..."]}"""

ANAHTAR_NASIL = {
    "gemini": ("Ücretsiz Gemini anahtarı: https://aistudio.google.com/apikey\n"
               "Google hesabınla gir, 'Create API key' düğmesine bas, çıkan\n"
               "uzun yazıyı kopyala. (Ücretsiz kullanım hakkı var.)"),
    "anthropic": ("Anthropic anahtarı: https://console.anthropic.com/settings/keys\n"
                  "(Ücretli. Ücretsiz istiyorsan --saglayici gemini kullan.)"),
    "openai": ("OpenAI anahtarı: https://platform.openai.com/api-keys\n"
               "(Ücretli. Ücretsiz istiyorsan --saglayici gemini kullan.)"),
    "openrouter": ("OpenRouter anahtarı: https://openrouter.ai/keys\n"
                   "(Bazı modelleri ücretsiz.)"),
}

PEXELS_NASIL = ("Ücretsiz Pexels anahtarı: https://www.pexels.com/api/\n"
                "'Get Started' de, üye ol, çıkan anahtarı kopyala.\n"
                "Aylık binlerce istek ücretsiz.")


def _json_ayikla(ham):
    """LLM cevabından JSON'u söker. ```json ... ``` çitlerini temizler."""
    metin = ham.strip()
    metin = re.sub(r"^```(?:json)?", "", metin).strip()
    metin = re.sub(r"```$", "", metin).strip()
    bas = metin.find("{")
    son = metin.rfind("}")
    if bas == -1 or son == -1 or son < bas:
        raise Hata(
            "Yapay zekâ beklenen biçimde cevap vermedi.\n"
            "Çözüm: komutu bir kez daha çalıştır. Tekrarlarsa başka sağlayıcı dene:\n"
            "  python short.py \"konun\" --saglayici openai"
        )
    try:
        return json.loads(metin[bas:son + 1])
    except json.JSONDecodeError:
        # Bazı modeller sondaki virgülü bırakıyor; tek seferlik temizlik dene
        temiz = re.sub(r",\s*([}\]])", r"\1", metin[bas:son + 1])
        try:
            return json.loads(temiz)
        except json.JSONDecodeError:
            raise Hata(
                "Yapay zekânın cevabı bozuk JSON geldi.\n"
                "Çözüm: komutu tekrar çalıştır, düzelmezse:\n"
                "  python short.py \"konun\" --saglayici openai"
            )


def _istek_hatasi(saglayici, cevap):
    """HTTP hata kodunu Türkçe açıklamaya çevirir."""
    kod = cevap.status_code
    anahtar = ANAHTAR_ADI[saglayici]
    if kod in (401, 403):
        return Hata(
            "Yapay zekâ servisi anahtarı kabul etmedi (%d).\n"
            "Çözüm: 'nano ~/.shortrc' ile aç, %s satırındaki anahtarı kontrol et.\n"
            "Anahtarın başında/sonunda boşluk veya tırnak kalmasın." % (kod, anahtar)
        )
    if kod == 429:
        return Hata(
            "Yapay zekâ servisi 'çok fazla istek' dedi (429).\n"
            "Çözüm: 1-2 dakika bekleyip tekrar dene ya da başka sağlayıcı kullan:\n"
            "  python short.py \"konun\" --saglayici openai"
        )
    if 500 <= kod < 600:
        return Hata("Yapay zekâ servisi şu an cevap veremiyor (%d).\n"
                    "Çözüm: birkaç dakika sonra tekrar dene." % kod)
    ayrinti = cevap.text[:300].replace("\n", " ")
    return Hata("Yapay zekâ servisi hata verdi (%d).\nServis cevabı: %s" % (kod, ayrinti))


def _http_gonder(saglayici, url, basliklar, govde):
    try:
        cevap = requests.post(url, headers=basliklar, json=govde, timeout=90)
    except requests.exceptions.Timeout:
        raise Hata("Yapay zekâ servisi zaman aşımına uğradı.\n"
                   "Çözüm: internet bağlantını kontrol et ve komutu tekrar çalıştır.")
    except requests.exceptions.RequestException:
        raise Hata("İnternete bağlanılamadı.\n"
                   "Çözüm: Wi-Fi / mobil veriyi kontrol edip tekrar dene.")
    if cevap.status_code != 200:
        raise _istek_hatasi(saglayici, cevap)
    try:
        return cevap.json()
    except ValueError:
        raise Hata("Yapay zekâ servisinden okunamayan cevap geldi.\n"
                   "Çözüm: komutu tekrar çalıştır.")


def llm_cagir(saglayici, model, anahtar, kullanici_mesaji):
    """Seçilen sağlayıcıdan düz metin cevap alır."""
    if saglayici == "gemini":
        url = ("https://generativelanguage.googleapis.com/v1beta/models/"
               "%s:generateContent?key=%s" % (model, anahtar))
        govde = {
            "systemInstruction": {"parts": [{"text": SISTEM_PROMPT}]},
            "contents": [{"role": "user", "parts": [{"text": kullanici_mesaji}]}],
            "generationConfig": {"temperature": 0.95,
                                 "response_mime_type": "application/json"},
        }
        veri = _http_gonder(saglayici, url, {"Content-Type": "application/json"}, govde)
        try:
            parcalar = veri["candidates"][0]["content"]["parts"]
            return "".join(p.get("text", "") for p in parcalar)
        except (KeyError, IndexError):
            raise Hata("Gemini boş cevap döndürdü (muhtemelen güvenlik filtresi).\n"
                       "Çözüm: konuyu biraz farklı yazıp tekrar dene.")

    if saglayici == "anthropic":
        govde = {
            "model": model,
            "max_tokens": 2000,
            "system": SISTEM_PROMPT,
            "messages": [{"role": "user", "content": kullanici_mesaji}],
        }
        basliklar = {
            "x-api-key": anahtar,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
        }
        veri = _http_gonder(saglayici, "https://api.anthropic.com/v1/messages",
                            basliklar, govde)
        if veri.get("stop_reason") == "refusal":
            raise Hata("Yapay zekâ bu konuda senaryo yazmayı reddetti.\n"
                       "Çözüm: konuyu farklı ifade edip tekrar dene.")
        metin = "".join(p.get("text", "") for p in veri.get("content", [])
                        if p.get("type") == "text")
        if not metin.strip():
            raise Hata("Yapay zekâdan boş cevap geldi.\nÇözüm: komutu tekrar çalıştır.")
        return metin

    # openai ve openrouter aynı biçimi kullanıyor
    if saglayici == "openai":
        url = "https://api.openai.com/v1/chat/completions"
    else:
        url = "https://openrouter.ai/api/v1/chat/completions"
    govde = {
        "model": model,
        "temperature": 0.95,
        "response_format": {"type": "json_object"},
        "messages": [{"role": "system", "content": SISTEM_PROMPT},
                     {"role": "user", "content": kullanici_mesaji}],
    }
    basliklar = {"Authorization": "Bearer %s" % anahtar,
                 "Content-Type": "application/json"}
    veri = _http_gonder(saglayici, url, basliklar, govde)
    try:
        return veri["choices"][0]["message"]["content"] or ""
    except (KeyError, IndexError):
        raise Hata("Yapay zekâdan beklenen cevap gelmedi.\n"
                   "Çözüm: komutu tekrar çalıştır.")


def senaryo_dogrula(veri, en_az_kelime=40):
    """LLM çıktısını denetler ve eksikleri Türkçe anlatır."""
    if not isinstance(veri, dict):
        raise Hata("Yapay zekâ beklenen yapıda cevap vermedi.\n"
                   "Çözüm: komutu tekrar çalıştır.")
    senaryo = str(veri.get("senaryo", "")).strip()
    hook = str(veri.get("hook", "")).strip()
    if not senaryo:
        raise Hata("Yapay zekâ senaryo metnini boş bıraktı.\n"
                   "Çözüm: komutu tekrar çalıştır.")
    if len(senaryo.split()) < en_az_kelime:
        raise Hata(
            "Üretilen senaryo çok kısa (%d kelime), buradan video çıkmaz.\n"
            "Çözüm: konuyu biraz daha açık yaz. Örnek:\n"
            "  python short.py \"kediler neden gece koşuşturur, bilimsel açıklaması\""
            % len(senaryo.split())
        )
    if not hook:
        # Hook yoksa senaryonun ilk cümlesini hook yap
        hook = re.split(r"(?<=[.!?])\s+", senaryo)[0][:90]
        veri["hook"] = hook

    aramalar = veri.get("gorsel_aramalar") or []
    if isinstance(aramalar, str):
        aramalar = [aramalar]
    temiz = []
    for terim in aramalar:
        ham = str(terim).strip()
        # Türkçe terim Pexels'te sonuç vermiyor: yarım İngilizceye çevirmek yerine at
        if re.search(r"[^\x00-\x7F]", ham):
            continue
        terim = re.sub(r"\s+", " ", re.sub(r"[^A-Za-z0-9 ]", " ", ham)).strip()
        if terim and terim.lower() not in [t.lower() for t in temiz]:
            temiz.append(" ".join(terim.split()[:3]))
    veri["gorsel_aramalar"] = temiz[:5]
    veri["senaryo"] = senaryo
    veri["baslik"] = str(veri.get("baslik") or hook)[:100]
    etiketler = veri.get("etiketler") or []
    if isinstance(etiketler, str):
        etiketler = [e.strip() for e in etiketler.split(",")]
    veri["etiketler"] = [str(e).strip() for e in etiketler if str(e).strip()][:12]
    return veri


def senaryo_uret(konu, saglayici, model, ayarlar):
    """Konudan senaryo sözlüğü üretir."""
    anahtar_adi = ANAHTAR_ADI[saglayici]
    anahtar = ayarlar.get(anahtar_adi, "").strip()
    if not anahtar:
        raise Hata(anahtar_yok_mesaji(anahtar_adi, ANAHTAR_NASIL[saglayici]))
    istek = ("Konu: %s\n\nBu konudan bir Shorts senaryosu üret ve "
             "sadece JSON döndür." % konu)
    ham = llm_cagir(saglayici, model, anahtar, istek)
    return senaryo_dogrula(_json_ayikla(ham))


# ==========================================================================
#  2) SESLENDİRME (edge-tts)
# ==========================================================================

def tts_metni_hazirla(metin):
    """Boş satırlar edge-tts'te uzun duraklama üretiyor; hepsini tek boşluğa indir."""
    metin = metin.replace("\r\n", "\n").replace("\r", "\n")
    metin = re.sub(r"[•*#>_`~\[\]]", " ", metin)      # madde işareti / markdown izleri
    metin = re.sub(r"\n\s*\n+", " ", metin)           # boş satırlar -> tek boşluk
    metin = re.sub(r"\s*\n\s*", " ", metin)           # satır sonları -> boşluk
    metin = re.sub(r"\s+", " ", metin).strip()
    return metin


def seslendir(metin, mp3_yolu, srt_yolu, ses, hiz):
    """edge-tts ile seslendirme + SRT üretir."""
    girdi_dosyasi = os.path.join(os.path.dirname(mp3_yolu), "tts_girdi.txt")
    with open(girdi_dosyasi, "w", encoding="utf-8") as f:
        f.write(tts_metni_hazirla(metin))

    komut = edge_tts_komutu() + [
        "--voice", ses,
        "--rate", hiz,
        "--pitch", SES_PERDESI,
        "--file", girdi_dosyasi,
        "--write-media", mp3_yolu,
        "--write-subtitles", srt_yolu,
    ]
    calistir(komut,
             "Seslendirme yapılamadı (edge-tts).\n"
             "Çözüm: internete bağlı olduğundan emin ol, sonra tekrar dene.\n"
             "Hâlâ olmuyorsa edge-tts'i güncelle:\n"
             "  pip install -U edge-tts")

    if not os.path.isfile(mp3_yolu) or os.path.getsize(mp3_yolu) < 1024:
        raise Hata(
            "Seslendirme dosyası boş çıktı (edge-tts ses servisine ulaşamadı).\n"
            "Çözüm: internetini kontrol et ve komutu tekrar çalıştır.\n"
            "Sorun sürerse:  pip install -U edge-tts"
        )
    sure = ffprobe_sure(mp3_yolu)
    if sure < 3.0:
        raise Hata("Seslendirme çok kısa çıktı (%.1f sn).\n"
                   "Çözüm: senaryo metnini uzat ve tekrar dene." % sure)
    return sure


# ==========================================================================
#  3) ALTYAZI — SRT'yi kendi ASS'imize çeviriyoruz
#     (ffmpeg'in subtitles= filtresi SRT'yi 384x288 sanıyor, yerleşim şaşıyor)
# ==========================================================================

DURAK_KELIMELER = {
    "VE", "AMA", "FAKAT", "İÇİN", "GİBİ", "DAHA", "ÇOK", "BİR", "BU", "ŞU",
    "DA", "DE", "Kİ", "İLE", "OLAN", "OLARAK", "SONRA", "ÖNCE", "YANİ",
    "HER", "HİÇ", "KENDİ", "DİYE", "ANCAK", "BÖYLE", "ŞÖYLE",
}


def _srt_zaman(metin):
    metin = metin.strip().replace(",", ".")
    parcalar = metin.split(":")
    if len(parcalar) != 3:
        return 0.0
    return int(parcalar[0]) * 3600 + int(parcalar[1]) * 60 + float(parcalar[2])


def srt_oku(dosya):
    """SRT dosyasını (başlangıç, bitiş, metin) listesine çevirir."""
    if not os.path.isfile(dosya):
        return []
    with open(dosya, "r", encoding="utf-8", errors="replace") as f:
        icerik = f.read().replace("﻿", "")
    kayitlar = []
    for blok in re.split(r"\n\s*\n", icerik.strip()):
        satirlar = [s for s in blok.splitlines() if s.strip()]
        zaman = None
        metin_satirlari = []
        for satir in satirlar:
            if "-->" in satir and zaman is None:
                zaman = satir
            elif zaman is not None:
                metin_satirlari.append(satir.strip())
        if not zaman or not metin_satirlari:
            continue
        bas_s, _, bit_s = zaman.partition("-->")
        bas, bit = _srt_zaman(bas_s), _srt_zaman(bit_s)
        metin = " ".join(metin_satirlari).strip()
        if metin and bit > bas:
            kayitlar.append((bas, bit, metin))
    return kayitlar


def altyazi_parcalari(kayitlar, kelime_sayisi=ALTYAZI_KELIME):
    """
    edge-tts'in --words-in-cue seçeneği güvenilir değil; parçalamayı kendimiz
    yapıyoruz: N kelimelik gruplar, süre harf sayısına göre paylaştırılıyor.
    """
    parcalar = []
    for bas, bit, metin in kayitlar:
        kelimeler = metin.split()
        if not kelimeler:
            continue
        gruplar = [kelimeler[i:i + kelime_sayisi]
                   for i in range(0, len(kelimeler), kelime_sayisi)]
        agirliklar = [max(len("".join(g)), 1) for g in gruplar]
        toplam_agirlik = float(sum(agirliklar))
        sure = max(bit - bas, 0.25)
        imlec = bas
        for grup, agirlik in zip(gruplar, agirliklar):
            uzunluk = sure * (agirlik / toplam_agirlik)
            parcalar.append([imlec, imlec + uzunluk, " ".join(grup)])
            imlec += uzunluk
    # Çakışmaları ve çok kısa parçaları düzelt
    parcalar.sort(key=lambda p: p[0])
    for i, parca in enumerate(parcalar):
        if i + 1 < len(parcalar) and parca[1] > parcalar[i + 1][0]:
            parca[1] = parcalar[i + 1][0]
        if parca[1] - parca[0] < 0.12:
            parca[1] = parca[0] + 0.12
    return [tuple(p) for p in parcalar]


def ass_kacis(metin):
    """ASS içinde anlam taşıyan karakterleri temizler."""
    return (metin.replace("\\", "/").replace("{", "(").replace("}", ")")
            .replace("\n", " ").strip())


def _stil_renk(renk6):
    """&HBBGGRR& -> &HAABBGGRR (stil satırları 8 haneli ve sonda & olmadan ister)."""
    return "&H00" + renk6[2:].rstrip("&")


def _vurgulu_metin(metin):
    """Parçadaki en 'dolu' kelimeyi farklı renk ve hafif büyük yazar."""
    kelimeler = metin.split()
    if not kelimeler:
        return ""
    secili = -1
    for i, kelime in enumerate(kelimeler):
        sade = re.sub(r"[^0-9A-Za-zÇĞİIÖŞÜçğıöşü]", "", kelime)
        if len(sade) < 6 or tr_buyuk(sade) in DURAK_KELIMELER:
            continue
        if secili == -1 or len(sade) > len(re.sub(
                r"[^0-9A-Za-zÇĞİIÖŞÜçğıöşü]", "", kelimeler[secili])):
            secili = i
    if secili == -1:
        return ass_kacis(" ".join(kelimeler))
    parcalar = []
    for i, kelime in enumerate(kelimeler):
        kelime = ass_kacis(kelime)
        if i == secili:
            parcalar.append("{\\c%s\\fscx%d\\fscy%d}%s{\\c%s\\fscx100\\fscy100}"
                            % (VURGU_RENGI, VURGU_BUYUME, VURGU_BUYUME,
                               kelime, ANA_RENK))
        else:
            parcalar.append(kelime)
    return " ".join(parcalar)


def _ass_zaman(saniye):
    if saniye < 0:
        saniye = 0.0
    saat = int(saniye // 3600)
    dakika = int((saniye % 3600) // 60)
    kalan = saniye - saat * 3600 - dakika * 60
    return "%d:%02d:%05.2f" % (saat, dakika, kalan)


def _tahmini_satir_sayisi(metin, punto):
    """Kaba satır tahmini — hook altı çizgisini doğru yere koymak için."""
    kullanilabilir = VIDEO_GENISLIK - 200
    harf_genisligi = punto * 0.55
    satir_basina = max(int(kullanilabilir / harf_genisligi), 6)
    return max(1, (len(metin) + satir_basina - 1) // satir_basina)


def ass_uret(parcalar, hook, toplam_sure, font_adi, hook_bitis=HOOK_SANIYE):
    """Altyazı + hareketli grafiklerin tamamını tek ASS dosyası olarak üretir."""
    alt_y = VIDEO_YUKSEKLIK - ALTYAZI_ALT_BOSLUK - int(ALTYAZI_PUNTO * 0.55)
    hook_metni = tr_buyuk(hook) if ALTYAZI_BUYUK_HARF else hook
    hook_metni = ass_kacis(hook_metni)
    hook_y = 860
    satir = _tahmini_satir_sayisi(hook_metni, HOOK_PUNTO)
    cizgi_y = int(hook_y + (satir * HOOK_PUNTO * 1.15) / 2 + 34)

    basliklar = [
        "[Script Info]",
        "ScriptType: v4.00+",
        "PlayResX: %d" % VIDEO_GENISLIK,     # ffmpeg SRT'yi 384x288 sanıyor,
        "PlayResY: %d" % VIDEO_YUKSEKLIK,    # ASS'te çözünürlüğü kendimiz yazıyoruz
        "WrapStyle: 0",                      # 2 olursa uzun satır ekrandan taşar
        "ScaledBorderAndShadow: yes",
        "YCbCr Matrix: TV.709",
        "",
        "[V4+ Styles]",
        ("Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, "
         "OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, "
         "ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, "
         "Alignment, MarginL, MarginR, MarginV, Encoding"),
        ("Style: Alt,%s,%d,%s,&H000000FF,&H00000000,&H80000000,-1,0,0,0,"
         "100,100,0,0,1,6,3,2,90,90,%d,1"
         % (font_adi, ALTYAZI_PUNTO, _stil_renk(ANA_RENK), ALTYAZI_ALT_BOSLUK)),
        ("Style: Hook,%s,%d,%s,&H000000FF,&H00000000,&H80000000,-1,0,0,0,"
         "100,100,0,0,1,7,4,5,100,100,0,1"
         % (font_adi, HOOK_PUNTO, _stil_renk(ANA_RENK))),
        ("Style: Sekil,%s,40,%s,&H000000FF,&H00000000,&H00000000,0,0,0,0,"
         "100,100,0,0,1,0,0,7,0,0,0,1" % (font_adi, _stil_renk(VURGU_RENGI))),
        "",
        "[Events]",
        ("Format: Layer, Start, End, Style, Name, MarginL, MarginR, "
         "MarginV, Effect, Text"),
    ]
    olaylar = []

    def olay(katman, bas, bit, stil, metin):
        olaylar.append("Dialogue: %d,%s,%s,%s,,0,0,0,,%s"
                       % (katman, _ass_zaman(bas), _ass_zaman(bit), stil, metin))

    # --- Köşedeki ilerleme çubuğu (video boyunca soldan sağa dolar) ---
    olay(1, 0.0, toplam_sure, "Sekil",
         "{\\an7\\pos(0,%d)\\c%s\\alpha&H50&\\p1\\fscx0\\t(0,%d,\\fscx100)}"
         "m 0 0 l %d 0 l %d 12 l 0 12{\\p0}"
         % (VIDEO_YUKSEKLIK - 16, VURGU_RENGI, int(toplam_sure * 1000),
            VIDEO_GENISLIK, VIDEO_GENISLIK))

    # --- Hook: ilk saniye tam ekran ortada, sonra altyazı hizasına iner ---
    if hook_metni:
        tasima_bas = int(max(hook_bitis - 0.3, 0.2) * 1000)
        tasima_bit = int(hook_bitis * 1000)
        olay(2, 0.0, hook_bitis, "Hook",
             "{\\an5\\fs%d\\fscx55\\fscy55\\t(0,180,\\fscx100\\fscy100)"
             "\\move(%d,%d,%d,%d,%d,%d)\\t(%d,%d,\\fs%d)\\fad(90,0)}%s"
             % (HOOK_PUNTO, VIDEO_GENISLIK // 2, hook_y, VIDEO_GENISLIK // 2,
                alt_y, tasima_bas, tasima_bit, tasima_bas, tasima_bit,
                ALTYAZI_PUNTO, hook_metni))
        # Hook'un altına vurgu çizgisi (soldan sağa açılır)
        olay(1, 0.15, hook_bitis, "Sekil",
             "{\\an7\\pos(%d,%d)\\c%s\\p1\\fscx0\\t(0,320,\\fscx100)\\fad(0,120)}"
             "m 0 0 l 620 0 l 620 14 l 0 14{\\p0}"
             % (VIDEO_GENISLIK // 2 - 310, cizgi_y, VURGU_RENGI))

    # --- Altyazılar: 3'er kelime, pop efektiyle giriyor ---
    for bas, bit, metin in parcalar:
        if bit <= hook_bitis or bas >= toplam_sure:
            continue                       # hook ekrandayken altyazı çakışmasın
        bas = max(bas, hook_bitis)
        if min(bit, toplam_sure) - bas < 0.10:
            continue
        gorunen = tr_buyuk(metin) if ALTYAZI_BUYUK_HARF else metin
        olay(3, bas, min(bit, toplam_sure), "Alt",
             "{\\fad(60,60)\\fscx72\\fscy72\\t(0,150,\\fscx100\\fscy100)}%s"
             % _vurgulu_metin(gorunen))

    # --- Kapanış: daire + aşağı ok (son 2,5 saniye) ---
    # Not: libass çizimleri kendi (0,0) orijinine göre hizalıyor. Negatif
    # koordinat kullanılırsa şekiller birbirinden kayıyor; hepsi pozitif.
    if toplam_sure > 4:
        kapanis = max(toplam_sure - 2.5, 0.0)
        merkez_x = VIDEO_GENISLIK // 2
        olay(1, kapanis, toplam_sure, "Sekil",
             "{\\an5\\pos(%d,%d)\\1a&HFF&\\3c%s\\bord5\\p1"
             "\\fscx0\\fscy0\\t(0,350,\\fscx100\\fscy100)}"
             "m 0 70 b 0 31 31 0 70 0 b 109 0 140 31 140 70 "
             "b 140 109 109 140 70 140 b 31 140 0 109 0 70{\\p0}"
             % (merkez_x + 5, 1695, VURGU_RENGI))
        olay(2, kapanis + 0.15, toplam_sure, "Sekil",
             "{\\an5\\pos(%d,%d)\\c%s\\p1\\fscx60\\fscy60"
             "\\t(0,300,\\fscx100\\fscy100)\\t(600,1100,\\fscx118\\fscy118)}"
             "m 0 0 l 64 0 l 32 64{\\p0}"
             % (merkez_x, 1690, VURGU_RENGI))

    return "\n".join(basliklar + olaylar) + "\n"


def font_bul():
    """Android'de /system/fonts, masaüstünde sistem fontları. (fontsdir şart!)"""
    for klasor, dosya, ad in FONT_ADAYLARI:
        if os.path.isfile(os.path.join(klasor, dosya)):
            return klasor, ad
    return None, "Sans"


# ==========================================================================
#  4) STOK GÖRÜNTÜ (Pexels)
#     Not: Pexels hem API isteğinde hem dosya indirmede tarayıcı kimliği ister,
#     Python'un varsayılan kimliğine 403 döner. Bu yüzden User-Agent şart.
# ==========================================================================

def pexels_ara(sorgu, anahtar, adet=PEXELS_SONUC):
    basliklar = {"Authorization": anahtar, "User-Agent": KULLANICI_AJANI}
    parametreler = {"query": sorgu, "orientation": "portrait",
                    "per_page": adet, "size": "medium"}
    try:
        cevap = requests.get("https://api.pexels.com/videos/search",
                             headers=basliklar, params=parametreler, timeout=45)
    except requests.exceptions.RequestException:
        raise Hata("Pexels'e bağlanılamadı.\n"
                   "Çözüm: internetini kontrol edip komutu tekrar çalıştır.")
    if cevap.status_code in (401, 403):
        raise Hata(
            "Pexels anahtarını kabul etmedi (%d).\n"
            "Çözüm: 'nano ~/.shortrc' ile aç, PEXELS_API_KEY satırını kontrol et.\n"
            "Anahtarın başında/sonunda boşluk kalmasın.\n\n%s"
            % (cevap.status_code, PEXELS_NASIL))
    if cevap.status_code == 429:
        raise Hata("Pexels 'çok fazla istek' dedi (429).\n"
                   "Çözüm: bir saat sonra tekrar dene ya da --klip-klasor ile\n"
                   "kendi video klasörünü kullan.")
    if cevap.status_code != 200:
        raise Hata("Pexels hata verdi (%d).\nÇözüm: birkaç dakika sonra tekrar dene."
                   % cevap.status_code)
    try:
        return cevap.json().get("videos", [])
    except ValueError:
        return []


def _en_uygun_dosya(video):
    """Dikey ve yeterli çözünürlükteki EN KÜÇÜK dosyayı seç (mobil veri dostu)."""
    adaylar = []
    for dosya in video.get("video_files", []):
        genislik = dosya.get("width") or 0
        yukseklik = dosya.get("height") or 0
        baglanti = dosya.get("link")
        if not baglanti or not genislik or not yukseklik:
            continue
        if yukseklik <= genislik:          # yatay klipleri alma
            continue
        adaylar.append((genislik * yukseklik, yukseklik, baglanti))
    if not adaylar:
        return None
    yeterli = [a for a in adaylar if a[1] >= 1280]
    havuz = sorted(yeterli or adaylar, key=lambda a: a[0])
    return havuz[0][2]


def klip_indir(baglanti, hedef, kalan_bayt):
    """Tek klip indirir. İnen bayt sayısını döner; veri limiti aşılırsa -1."""
    basliklar = {"User-Agent": KULLANICI_AJANI}
    try:
        with requests.get(baglanti, headers=basliklar, stream=True, timeout=90) as cevap:
            if cevap.status_code != 200:
                return 0
            inen = 0
            with open(hedef, "wb") as f:
                for parca in cevap.iter_content(chunk_size=262144):
                    if not parca:
                        continue
                    inen += len(parca)
                    if inen > kalan_bayt:
                        f.close()
                        os.remove(hedef)
                        return -1              # veri limiti: bu klip çok büyük
                    f.write(parca)
            return inen
    except requests.exceptions.RequestException:
        if os.path.isfile(hedef):
            os.remove(hedef)
        return 0


def stok_klipleri_getir(aramalar, anahtar, klasor, gereken, limit_mb):
    """Her terim için ayrı arama yapar, sonuçları karıştırarak indirir."""
    if not anahtar:
        raise Hata(anahtar_yok_mesaji("PEXELS_API_KEY", PEXELS_NASIL))
    if not aramalar:
        aramalar = ["cinematic background"]

    havuzlar = []
    for terim in aramalar:
        videolar = pexels_ara(terim, anahtar)
        random.shuffle(videolar)
        havuzlar.append(videolar)
        yaz("      '%s' -> %d sonuç" % (terim, len(videolar)))

    # Sıra sıra farklı terimlerden seç: video tek bir görüntüden oluşmasın
    sira = []
    gorulen = set()
    for kat in range(max((len(h) for h in havuzlar), default=0)):
        for havuz in havuzlar:
            if kat < len(havuz):
                video = havuz[kat]
                if video.get("id") in gorulen:
                    continue
                gorulen.add(video.get("id"))
                sira.append(video)

    if not sira:
        raise Hata(
            "Pexels bu terimlerle hiç dikey video bulamadı: %s\n"
            "Çözüm: arama terimlerini İNGİLİZCE ve somut ver, örnek:\n"
            "  python short.py \"konun\" --aramalar \"cat closeup,night city,rain window\""
            % ", ".join(aramalar))

    kalan_bayt = int(limit_mb * 1024 * 1024)
    limit_asildi = False
    yollar = []
    for video in sira:
        if len(yollar) >= gereken or kalan_bayt <= 0:
            break
        baglanti = _en_uygun_dosya(video)
        if not baglanti:
            continue
        hedef = os.path.join(klasor, "klip_%02d.mp4" % len(yollar))
        inen = klip_indir(baglanti, hedef, kalan_bayt)
        if inen < 0:
            limit_asildi = True
            continue
        if inen == 0:
            continue
        kalan_bayt -= inen                 # inen bayt harcandı: klip bozuk olsa bile
        if ffprobe_sure(hedef) < 1.5:      # bozuk / çok kısa klip
            os.remove(hedef)
            continue
        yollar.append(hedef)
        yaz("      klip %d/%d indi (%.1f MB, kalan veri hakkı %.1f MB)"
            % (len(yollar), gereken, inen / 1048576.0, kalan_bayt / 1048576.0))

    if not yollar:
        if limit_asildi:
            raise Hata(
                "Klipler %.0f MB'lık veri sınırına sığmadı, hiçbiri indirilemedi.\n"
                "Çözüm: sınırı yükselt:\n"
                "  python short.py \"konun\" --veri-limiti %.0f" % (limit_mb, limit_mb * 3))
        raise Hata(
            "Hiç klip indirilemedi.\n"
            "Çözüm: internetini kontrol et; sürerse veri limitini yükselt:\n"
            "  python short.py \"konun\" --veri-limiti 120")
    if limit_asildi:
        yaz("      ! Veri sınırı doldu, %d klip ile devam ediliyor." % len(yollar))
    random.shuffle(yollar)
    return yollar


def yerel_klipler(klasor, gereken):
    """--klip-klasor verildiyse Pexels'e hiç gitmeden yerel videoları kullanır."""
    klasor = yol(klasor)
    if not os.path.isdir(klasor):
        raise Hata("Klip klasörü bulunamadı: %s\n"
                   "Çözüm: doğru yolu yaz, örnek: --klip-klasor ~/videolar" % klasor)
    uzantilar = (".mp4", ".mov", ".mkv", ".webm", ".m4v", ".3gp")
    dosyalar = [os.path.join(klasor, d) for d in sorted(os.listdir(klasor))
                if d.lower().endswith(uzantilar)]
    dosyalar = [d for d in dosyalar if ffprobe_sure(d) >= 1.5]
    if not dosyalar:
        raise Hata("Bu klasörde kullanılabilir video yok: %s\n"
                   "Çözüm: içine mp4 dosyaları koy ya da bu seçeneği kullanma." % klasor)
    random.shuffle(dosyalar)
    secim = []
    while len(secim) < gereken:
        secim.extend(dosyalar)
    return secim[:gereken]


def muzik_sec(klasor_veya_dosya):
    """~/muzik içinden rastgele parça seçer. Boşsa None döner, çökmez."""
    hedef = yol(klasor_veya_dosya)
    if os.path.isfile(hedef):
        return hedef
    if not os.path.isdir(hedef):
        return None
    parcalar = [os.path.join(hedef, d) for d in sorted(os.listdir(hedef))
                if d.lower().endswith(MUZIK_UZANTILARI)]
    if not parcalar:
        return None
    return random.choice(parcalar)


# ==========================================================================
#  5) MONTAJ — tek geçiş ffmpeg (Ken Burns + geçiş + ASS + ses karışımı)
# ==========================================================================

def klip_planla(klipler, hedef_sure):
    """Hangi klip, kaçıncı saniyesinden, kaç saniye kullanılacak."""
    plan = []
    toplam = 0.0
    sayac = 0
    sinir = max(len(klipler) * 4, 40)
    while toplam < hedef_sure and sayac < sinir:
        klip = klipler[sayac % len(klipler)]
        kaynak_sure = ffprobe_sure(klip)
        if kaynak_sure < 1.5:
            sayac += 1
            continue
        istenen = random.uniform(KLIP_MIN_SANIYE, KLIP_MAX_SANIYE)
        sure = min(istenen, max(kaynak_sure - 0.15, 1.5))
        baslangic = 0.0
        bosluk = kaynak_sure - sure - 0.15
        if bosluk > 0.5:
            baslangic = random.uniform(0.0, min(bosluk, 3.0))
        plan.append((klip, round(baslangic, 2), round(sure, 2)))
        toplam += sure if len(plan) == 1 else (sure - GECIS_SANIYE)
        sayac += 1
    if not plan:
        raise Hata("Kullanılabilir klip kalmadı.\n"
                   "Çözüm: komutu tekrar çalıştır ya da --klip-klasor ile kendi "
                   "videolarını ver.")
    return plan


def montaj_komutu(plan, ses_yolu, muzik_yolu, ass_dosyasi, cikti,
                  toplam_sure, font_klasoru, ken_burns,
                  gecisler=True, ducking=DUCKING):
    """Tüm işi yapan tek ffmpeg komutunu kurar (ara render yok)."""
    komut = ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-stats"]
    for klip, baslangic, sure in plan:
        komut += ["-ss", "%.2f" % baslangic, "-t", "%.2f" % sure, "-i", klip]
    ses_no = len(plan)
    komut += ["-i", ses_yolu]
    muzik_no = None
    if muzik_yolu:
        muzik_no = ses_no + 1
        # -stream_loop -1: müzik kısa ise videonun sonuna kadar döner
        komut += ["-stream_loop", "-1", "-t", "%.2f" % toplam_sure, "-i", muzik_yolu]

    filtreler = []
    for i, (klip, baslangic, sure) in enumerate(plan):
        kareler = max(int(sure * FPS), 2)
        zincir = ("[%d:v]scale=%d:%d:force_original_aspect_ratio=increase,"
                  "crop=%d:%d,fps=%d,format=yuv420p,setsar=1"
                  % (i, VIDEO_GENISLIK, VIDEO_YUKSEKLIK,
                     VIDEO_GENISLIK, VIDEO_YUKSEKLIK, FPS))
        if ken_burns:
            # Tek kare bile sabit durmasın: yavaş içeri/dışarı zoom
            if i % 2 == 0:
                z = "min(1+%.6f*on/%d,%.3f)" % (ZOOM_MIKTARI, kareler, 1 + ZOOM_MIKTARI)
            else:
                z = "max(%.3f-%.6f*on/%d,1)" % (1 + ZOOM_MIKTARI, ZOOM_MIKTARI, kareler)
            zincir += (",zoompan=z='%s':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'"
                       ":d=1:s=%dx%d:fps=%d"
                       % (z, VIDEO_GENISLIK, VIDEO_YUKSEKLIK, FPS))
        zincir += (",trim=duration=%.2f,setpts=PTS-STARTPTS,settb=AVTB[v%d]"
                   % (sure, i))
        filtreler.append(zincir)

    # Klipler arası geçişler
    if len(plan) == 1:
        son_etiket = "[v0]"
    elif not gecisler:
        # xfade olmayan ffmpeg derlemesi: klipleri düz ekle
        filtreler.append("".join("[v%d]" % i for i in range(len(plan)))
                         + "concat=n=%d:v=1:a=0[birlesik]" % len(plan))
        son_etiket = "[birlesik]"
    else:
        birikim = plan[0][2]
        onceki = "[v0]"
        for i in range(1, len(plan)):
            etiket = "[x%d]" % i
            filtreler.append(
                "%s[v%d]xfade=transition=%s:duration=%.2f:offset=%.3f%s"
                % (onceki, i, random.choice(GECIS_TIPLERI), GECIS_SANIYE,
                   max(birikim - GECIS_SANIYE, 0.1), etiket))
            birikim += plan[i][2] - GECIS_SANIYE
            onceki = etiket
        son_etiket = onceki

    font_kismi = ":fontsdir=%s" % font_klasoru if font_klasoru else ""
    filtreler.append("%sass=%s%s,format=yuv420p[vout]"
                     % (son_etiket, os.path.basename(ass_dosyasi), font_kismi))

    ses_bicimi = "aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo"
    if muzik_no is None:
        filtreler.append("[%d:a]%s,apad[aout]" % (ses_no, ses_bicimi))
    else:
        fade_baslangic = max(toplam_sure - MUZIK_FADE_OUT, 0.1)
        if ducking:
            filtreler.append("[%d:a]%s,asplit=2[ses1][yan]" % (ses_no, ses_bicimi))
            filtreler.append(
                "[%d:a]%s,volume=%.3f,afade=t=in:st=0:d=%.1f,"
                "afade=t=out:st=%.2f:d=%.1f[muzik]"
                % (muzik_no, ses_bicimi, MUZIK_SES_SEVIYESI, MUZIK_FADE_IN,
                   fade_baslangic, MUZIK_FADE_OUT))
            # Konuşma varken müziği otomatik kıs (profesyonel his)
            filtreler.append("[muzik][yan]sidechaincompress=threshold=0.03:"
                             "ratio=6:attack=15:release=350[muzik_kisik]")
            filtreler.append("[ses1][muzik_kisik]amix=inputs=2:duration=longest:"
                             "normalize=0,apad[aout]")
        else:
            filtreler.append("[%d:a]%s[ses1]" % (ses_no, ses_bicimi))
            filtreler.append(
                "[%d:a]%s,volume=%.3f,afade=t=in:st=0:d=%.1f,"
                "afade=t=out:st=%.2f:d=%.1f[muzik]"
                % (muzik_no, ses_bicimi, MUZIK_SES_SEVIYESI, MUZIK_FADE_IN,
                   fade_baslangic, MUZIK_FADE_OUT))
            filtreler.append("[ses1][muzik]amix=inputs=2:duration=longest:"
                             "normalize=0,apad[aout]")

    komut += [
        "-filter_complex", ";".join(filtreler),
        "-map", "[vout]", "-map", "[aout]",
        "-c:v", "libx264", "-preset", X264_PRESET, "-crf", str(X264_CRF),
        "-pix_fmt", "yuv420p", "-profile:v", "high", "-r", str(FPS),
        "-g", str(FPS * 2),
        "-c:a", "aac", "-b:a", "128k", "-ar", "44100", "-ac", "2",
        "-movflags", "+faststart",
        "-t", "%.2f" % toplam_sure,
        cikti,
    ]
    return komut


def montaj_yap(komut, calisma_dizini):
    """ffmpeg'i çalıştırır; ilerleme çubuğunu kullanıcı görsün diye çıktıyı gizlemez."""
    try:
        sonuc = subprocess.run(komut, cwd=calisma_dizini)
    except FileNotFoundError:
        raise Hata("ffmpeg bulunamadı.\nÇözüm: Termux'ta yaz:  pkg install ffmpeg")
    if sonuc.returncode != 0:
        raise Hata(
            "Video birleştirilemedi (ffmpeg hata verdi).\n"
            "Yukarıdaki kırmızı satırlar sebebini yazıyor.\n"
            "Çözüm: önce komutu bir kez daha çalıştır. Tekrarlarsa efektsiz dene:\n"
            "  python short.py \"konun\" --sabit-kadraj")


# ==========================================================================
#  6) ÇIKTI — galeriye kaydet
# ==========================================================================

def cikis_klasoru_bul(istenen=None):
    if istenen:
        hedef = yol(istenen)
        try:
            os.makedirs(hedef, exist_ok=True)
            return hedef
        except OSError:
            raise Hata("Bu klasöre yazılamıyor: %s\n"
                       "Çözüm: başka bir klasör ver: --cikis-klasoru ~/videolar" % hedef)
    for aday in CIKIS_ADAYLARI:
        hedef = yol(aday)
        if os.path.isdir(hedef) and os.access(hedef, os.W_OK):
            return hedef
    # Termux'ta depolama izni verilmemişse ev klasörüne düş
    yedek = yol("~/shorts")
    os.makedirs(yedek, exist_ok=True)
    yaz("  ! Galeri klasörü bulunamadı, video buraya kaydedilecek: %s" % yedek)
    yaz("    (Galeriye kaydetmek için bir kez şunu çalıştır: termux-setup-storage)")
    return yedek


def galeriye_ekle(dosya):
    """Telefon galerisinin videoyu görmesi için tarama tetikler.
    termux-media-scan da 'am' de her cihazda yok; ikisi de try/except içinde."""
    if komut_var("termux-media-scan"):
        try:
            subprocess.run(["termux-media-scan", "-v", dosya],
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                           timeout=60)
            return "termux-media-scan"
        except Exception:
            pass
    try:
        subprocess.run(
            ["am", "broadcast", "-a", "android.intent.action.MEDIA_SCANNER_SCAN_FILE",
             "-d", "file://%s" % dosya],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=60)
        return "am broadcast"
    except Exception:
        return None


def bilgi_dosyasi_yaz(hedef, veri):
    satirlar = [
        "BAŞLIK:",
        veri.get("baslik", ""),
        "",
        "AÇIKLAMA:",
        veri.get("hook", ""),
        "",
        "ETİKETLER:",
        ", ".join(veri.get("etiketler", [])),
        "",
        " ".join(["#shorts"] + ["#" + re.sub(r"\s+", "", e)
                                 for e in veri.get("etiketler", [])[:6]]),
    ]
    with open(hedef, "w", encoding="utf-8") as f:
        f.write("\n".join(satirlar) + "\n")


# ==========================================================================
#  7) SENARYO DOSYASI (--duzenle ile onaylama)
# ==========================================================================

SENARYO_DOSYASI = "senaryo.txt"


def senaryo_txt_yaz(veri, hedef):
    icerik = [
        "# HOOK (ilk cümle — kısa ve iddialı olsun)",
        veri.get("hook", "").strip(),
        "",
        "# SENARYO (seslendirilecek metin)",
        veri.get("senaryo", "").strip(),
        "",
        "# BAŞLIK",
        veri.get("baslik", "").strip(),
        "",
        "# ETİKETLER (virgülle)",
        ", ".join(veri.get("etiketler", [])),
        "",
        "# GÖRSEL ARAMALAR (İngilizce, virgülle)",
        ", ".join(veri.get("gorsel_aramalar", [])),
        "",
    ]
    with open(hedef, "w", encoding="utf-8") as f:
        f.write("\n".join(icerik))


def senaryo_txt_oku(kaynak, varsayilan):
    """Kullanıcı senaryo.txt'yi düzenlediyse yeni hâlini geri okur."""
    if not os.path.isfile(kaynak):
        return varsayilan
    bolumler = {}
    su_an = None
    with open(kaynak, "r", encoding="utf-8", errors="replace") as f:
        for satir in f:
            if satir.startswith("#"):
                basi = satir[1:].strip().split(" ")[0].upper()
                su_an = basi
                bolumler.setdefault(su_an, [])
                continue
            if su_an:
                bolumler[su_an].append(satir.rstrip("\n"))

    def bolum(ad):
        return "\n".join(bolumler.get(ad, [])).strip()

    veri = dict(varsayilan)
    if bolum("HOOK"):
        veri["hook"] = " ".join(bolum("HOOK").split())
    if bolum("SENARYO"):
        veri["senaryo"] = bolum("SENARYO")
    if bolum("BAŞLIK"):
        veri["baslik"] = " ".join(bolum("BAŞLIK").split())
    if bolum("ETİKETLER"):
        veri["etiketler"] = [e.strip() for e in bolum("ETİKETLER").split(",") if e.strip()]
    if bolum("GÖRSEL"):
        veri["gorsel_aramalar"] = [e.strip() for e in bolum("GÖRSEL").split(",") if e.strip()]
    return senaryo_dogrula(veri, en_az_kelime=25)


def kullanici_onayi(senaryo_yolu):
    """--duzenle: metni düzenlettir, onay almadan devam etme."""
    yaz("")
    yaz("Senaryo şu dosyaya yazıldı: %s" % senaryo_yolu)
    duzenleyici = os.environ.get("EDITOR") or ("nano" if komut_var("nano") else None)
    if duzenleyici:
        yaz("Metni düzenlemek istersen ENTER'a bas, düzenlemeden devam için 'a' yaz.")
        try:
            cevap = input("Seçimin [ENTER = düzenle / a = atla]: ").strip().lower()
        except EOFError:
            return True
        if cevap != "a":
            yaz("Düzenledikten sonra kaydet (CTRL+O, ENTER) ve çık (CTRL+X).")
            try:
                subprocess.run([duzenleyici, senaryo_yolu])
            except Exception:
                yaz("  ! Düzenleyici açılamadı, dosyayı elle düzenleyebilirsin.")
    else:
        yaz("Dosyayı düzenleyip kaydet, sonra buraya dön.")
    try:
        cevap = input("Senaryo hazır mı, video üretilsin mi? [E/h]: ").strip().lower()
    except EOFError:
        return True
    return cevap in ("", "e", "evet", "y", "yes")


# ==========================================================================
#  8) ANA AKIŞ
# ==========================================================================

def arguman_al(argv):
    ayrıştırıcı = argparse.ArgumentParser(
        prog="python short.py",
        description="Termux için otomatik YouTube Shorts üreticisi.",
        epilog="Örnek:  python short.py \"kediler neden uzaylı gibi davranıyor\"",
    )
    ayrıştırıcı.add_argument("konu", nargs="?", help="Videonun konusu (tırnak içinde)")
    ayrıştırıcı.add_argument("--saglayici", choices=list(ANAHTAR_ADI.keys()),
                             default=VARSAYILAN_SAGLAYICI,
                             help="Senaryoyu yazacak yapay zekâ (varsayılan: gemini)")
    ayrıştırıcı.add_argument("--model", default=None, help="Sağlayıcının model adı")
    ayrıştırıcı.add_argument("--ses", default="erkek",
                             help="erkek | kadin | edge-tts ses adı")
    ayrıştırıcı.add_argument("--hiz", default=SES_HIZI,
                             help="Konuşma hızı, örnek: +25%% (varsayılan +35%%)")
    ayrıştırıcı.add_argument("--metin", default=None,
                             help="Kendi senaryo metnin (yapay zekâ kullanılmaz)")
    ayrıştırıcı.add_argument("--metin-dosya", default=None,
                             help="Senaryo metnini dosyadan oku")
    ayrıştırıcı.add_argument("--aramalar", default=None,
                             help="Stok görüntü arama terimleri (İNGİLİZCE, virgülle)")
    ayrıştırıcı.add_argument("--duzenle", action="store_true",
                             help="Senaryoyu onaylamadan videoya geçme")
    ayrıştırıcı.add_argument("--sadece-senaryo", action="store_true",
                             help="Sadece senaryo üret, video yapma")
    ayrıştırıcı.add_argument("--klip-klasor", default=None,
                             help="Pexels yerine kendi video klasörünü kullan")
    ayrıştırıcı.add_argument("--muzik", default=MUZIK_KLASORU,
                             help="Fon müziği klasörü ya da tek dosya (varsayılan ~/muzik)")
    ayrıştırıcı.add_argument("--muziksiz", action="store_true", help="Fon müziği kullanma")
    ayrıştırıcı.add_argument("--sabit-kadraj", action="store_true",
                             help="Ken Burns (yavaş zoom) efektini kapat")
    ayrıştırıcı.add_argument("--veri-limiti", type=float, default=MAX_INDIRME_MB,
                             help="En fazla kaç MB klip indirilsin (varsayılan %d)"
                                  % MAX_INDIRME_MB)
    ayrıştırıcı.add_argument("--cikis-klasoru", default=None,
                             help="Videonun kaydedileceği klasör")
    ayrıştırıcı.add_argument("--hata-detay", action="store_true",
                             help="Hata olursa teknik ayrıntıyı da göster")
    return ayrıştırıcı.parse_args(argv)


def ses_secimi(deger):
    if deger.lower() in ("erkek", "ahmet", "e"):
        return SES_ERKEK
    if deger.lower() in ("kadin", "kadın", "emel", "k"):
        return SES_KADIN
    return deger


def calis(secenekler):
    toplam_adim = 6
    mevcut_filtreler = ortam_kontrol()
    ayarlar = ayarlari_oku()

    # --- Çalışma klasörü: her çalıştırmada tamamen silinir ---
    # (Silinmezse önceki konunun klipleri yeniden kullanılıyor.)
    is_klasoru = yol(CALISMA_KLASORU)
    if os.path.isdir(is_klasoru):
        shutil.rmtree(is_klasoru, ignore_errors=True)
    os.makedirs(is_klasoru, exist_ok=True)

    # --- 1) Senaryo ---
    kendi_metni = secenekler.metin
    if secenekler.metin_dosya:
        kaynak = yol(secenekler.metin_dosya)
        if not os.path.isfile(kaynak):
            raise Hata("Metin dosyası bulunamadı: %s\n"
                       "Çözüm: dosya yolunu kontrol et." % kaynak)
        with open(kaynak, "r", encoding="utf-8", errors="replace") as f:
            kendi_metni = f.read()

    if kendi_metni:
        adim(1, toplam_adim, "Senaryo: kendi metnin kullanılıyor")
        kelime_sayisi = len(kendi_metni.split())
        if kelime_sayisi < 25:
            raise Hata(
                "Verdiğin metin çok kısa (%d kelime). Bundan video çıkmaz.\n"
                "Çözüm: en az 25 kelimelik bir metin ver ya da konuyu yazıp\n"
                "yapay zekâya yazdır:\n"
                "  python short.py \"%s\""
                % (kelime_sayisi, (secenekler.konu or "konun")))
        aramalar = [t.strip() for t in (secenekler.aramalar or "").split(",") if t.strip()]
        if not aramalar:
            aramalar = ["cinematic background", "abstract motion", "nature landscape"]
            yaz("  ! Arama terimi vermedin, genel görüntüler kullanılacak.")
            yaz("    İstersen:  --aramalar \"cat closeup,night city\"  (İngilizce)")
        veri = senaryo_dogrula({
            "hook": re.split(r"(?<=[.!?])\s+", kendi_metni.strip())[0][:90],
            "senaryo": kendi_metni.strip(),
            "gorsel_aramalar": aramalar,
            "baslik": (secenekler.konu
                       or re.split(r"(?<=[.!?])\s+", kendi_metni.strip())[0][:90]),
            "etiketler": [],
        }, en_az_kelime=25)
    else:
        if not secenekler.konu or not secenekler.konu.strip():
            raise Hata(
                "Konu vermedin.\n"
                "Çözüm: konuyu tırnak içinde yaz:\n"
                "  python short.py \"kediler neden uzaylı gibi davranıyor\"")
        model = secenekler.model or VARSAYILAN_MODEL[secenekler.saglayici]
        adim(1, toplam_adim, "Senaryo yazılıyor (%s / %s)..."
             % (secenekler.saglayici, model))
        veri = senaryo_uret(secenekler.konu, secenekler.saglayici, model, ayarlar)
        if secenekler.aramalar:
            veri["gorsel_aramalar"] = [t.strip() for t in secenekler.aramalar.split(",")
                                       if t.strip()]

    senaryo_yolu = os.path.abspath(SENARYO_DOSYASI)
    senaryo_txt_yaz(veri, senaryo_yolu)
    yaz("  Hook  : %s" % veri["hook"])
    yaz("  Metin : %d kelime" % len(veri["senaryo"].split()))
    yaz("  Arama : %s" % ", ".join(veri["gorsel_aramalar"]))

    if secenekler.sadece_senaryo:
        yaz("\nSenaryo hazır: %s" % senaryo_yolu)
        return

    if secenekler.duzenle:
        if not kullanici_onayi(senaryo_yolu):
            yaz("Tamam, video üretilmedi. Senaryo burada duruyor: %s" % senaryo_yolu)
            return
        veri = senaryo_txt_oku(senaryo_yolu, veri)

    # --- 2) Seslendirme ---
    ses = ses_secimi(secenekler.ses)
    adim(2, toplam_adim, "Seslendirme yapılıyor (%s, hız %s)..." % (ses, secenekler.hiz))
    mp3_yolu = os.path.join(is_klasoru, "ses.mp3")
    srt_yolu = os.path.join(is_klasoru, "ses.srt")
    okuma_metni = (veri["hook"].strip() + " " + veri["senaryo"].strip()
                   if not veri["senaryo"].strip().startswith(veri["hook"].strip()[:20])
                   else veri["senaryo"].strip())
    ses_suresi = seslendir(okuma_metni, mp3_yolu, srt_yolu, ses, secenekler.hiz)
    toplam_sure = round(ses_suresi + 0.35, 2)
    yaz("  Seslendirme süresi: %.1f saniye" % ses_suresi)

    # --- 3) Görüntüler ---
    gereken_klip = max(int(toplam_sure / (KLIP_MIN_SANIYE + 0.5)) + 2, 3)
    if secenekler.klip_klasor:
        adim(3, toplam_adim, "Klipler kendi klasöründen alınıyor...")
        klipler = yerel_klipler(secenekler.klip_klasor, gereken_klip)
    else:
        adim(3, toplam_adim, "Stok görüntüler indiriliyor (en fazla %.0f MB)..."
             % secenekler.veri_limiti)
        klipler = stok_klipleri_getir(veri["gorsel_aramalar"],
                                      ayarlar.get("PEXELS_API_KEY", "").strip(),
                                      is_klasoru, gereken_klip,
                                      secenekler.veri_limiti)

    # --- 4) Altyazı ---
    adim(4, toplam_adim, "Altyazı ve grafikler hazırlanıyor...")
    kayitlar = srt_oku(srt_yolu)
    if not kayitlar:
        # SRT gelmediyse metni süreye göre kendimiz bölelim; video yine de çıksın
        yaz("  ! Altyazı zamanlaması alınamadı, metne göre tahmini bölme yapılıyor.")
        kayitlar = [(0.0, ses_suresi, tts_metni_hazirla(okuma_metni))]
    parcalar = altyazi_parcalari(kayitlar)
    font_klasoru, font_adi = font_bul()
    if font_klasoru is None:
        yaz("  ! Sistem fontu bulunamadı, Türkçe karakterler bozuk çıkabilir.")
    ass_yolu = os.path.join(is_klasoru, "altyazi.ass")
    with open(ass_yolu, "w", encoding="utf-8") as f:
        f.write(ass_uret(parcalar, veri["hook"], toplam_sure, font_adi))
    yaz("  %d altyazı parçası, font: %s" % (len(parcalar), font_adi))

    # --- 5) Montaj ---
    muzik = None
    if not secenekler.muziksiz:
        muzik = muzik_sec(secenekler.muzik)
        if muzik:
            yaz("  Fon müziği: %s" % os.path.basename(muzik))
        else:
            yaz("  ! %s klasöründe müzik yok, müziksiz devam ediliyor."
                % yol(secenekler.muzik))
            yaz("    (Telif için VOKALSİZ/enstrümantal parça koy: vokalli müzik")
            yaz("     YouTube'da Content ID talebi yiyor.)")
    plan = klip_planla(klipler, toplam_sure + 0.6)

    # Kurulu ffmpeg bazı filtreleri desteklemiyorsa çökmek yerine o efekti kapat
    ken_burns = KEN_BURNS and not secenekler.sabit_kadraj
    gecisler, ducking = True, DUCKING
    if mevcut_filtreler:
        if ken_burns and "zoompan" not in mevcut_filtreler:
            yaz("  ! ffmpeg'inde zoompan yok, yavaş zoom kapatıldı.")
            ken_burns = False
        if "xfade" not in mevcut_filtreler:
            yaz("  ! ffmpeg'inde xfade yok, klipler geçişsiz eklenecek.")
            gecisler = False
        if ducking and "sidechaincompress" not in mevcut_filtreler:
            ducking = False

    adim(5, toplam_adim, "Video birleştiriliyor (%d klip, %.1f sn) — biraz sürebilir..."
         % (len(plan), toplam_sure))
    ham_cikti = os.path.join(is_klasoru, "cikti.mp4")
    komut = montaj_komutu(plan, mp3_yolu, muzik, ass_yolu, "cikti.mp4",
                          toplam_sure, font_klasoru, ken_burns,
                          gecisler=gecisler, ducking=ducking)
    montaj_yap(komut, is_klasoru)
    if not os.path.isfile(ham_cikti) or os.path.getsize(ham_cikti) < 10240:
        raise Hata("Video oluşmadı.\nÇözüm: komutu tekrar çalıştır.")

    # --- 6) Kaydet ---
    adim(6, toplam_adim, "Galeriye kaydediliyor...")
    cikis = cikis_klasoru_bul(secenekler.cikis_klasoru)
    damga = datetime.now().strftime("%Y%m%d_%H%M%S")
    hedef_video = os.path.join(cikis, "short_%s.mp4" % damga)
    shutil.move(ham_cikti, hedef_video)
    hedef_bilgi = os.path.join(cikis, "short_%s.txt" % damga)
    bilgi_dosyasi_yaz(hedef_bilgi, veri)
    galeriye_ekle(hedef_video)

    sonuc_sure = ffprobe_sure(hedef_video)
    boyut = os.path.getsize(hedef_video) / 1048576.0
    yaz("")
    yaz("BİTTİ.")
    yaz("  Video   : %s" % hedef_video)
    yaz("  Süre    : %.1f saniye   Boyut: %.1f MB   Çözünürlük: %dx%d"
        % (sonuc_sure, boyut, VIDEO_GENISLIK, VIDEO_YUKSEKLIK))
    yaz("  Başlık  : %s" % veri.get("baslik", ""))
    yaz("  Etiket  : %s" % ", ".join(veri.get("etiketler", [])))
    yaz("  Başlık/etiket dosyası: %s" % hedef_bilgi)
    yaz("")
    yaz("Galeride görünmüyorsa telefonu bir kez kilitleyip aç ya da")
    yaz("dosyayı 'Dosyalar' uygulamasından şuradan aç: %s" % cikis)


def main(argv=None):
    secenekler = arguman_al(argv if argv is not None else sys.argv[1:])
    try:
        calis(secenekler)
        return 0
    except Hata as hata:
        sys.stderr.write("\nHATA: %s\n" % hata)
        return 1
    except KeyboardInterrupt:
        sys.stderr.write("\nİptal edildi.\n")
        return 130
    except Exception as beklenmeyen:          # traceback basmadan Türkçe mesaj
        if secenekler.hata_detay:
            raise
        sys.stderr.write(
            "\nHATA: Beklenmeyen bir sorun çıktı: %s\n"
            "Çözüm: komutu bir kez daha çalıştır. Tekrarlarsa ayrıntıyı görmek için\n"
            "aynı komutun sonuna --hata-detay ekleyip çalıştır ve çıktıyı paylaş.\n"
            % beklenmeyen)
        return 1


if __name__ == "__main__":
    sys.exit(main())
