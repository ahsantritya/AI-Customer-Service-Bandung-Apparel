# Bandung Apparel — AI Customer Service & Sales Assistant

> **"Outfit Lokal, Gaya Global"**

Aplikasi AI customer service berbasis web untuk toko online baju Bandung Apparel. Ditenagai oleh Claude Haiku (Anthropic), asisten virtual bernama **Ara** siap membantu customer menemukan produk yang tepat sekaligus meningkatkan kemungkinan closing penjualan.

---

## Fitur Utama

- **Ara AI Assistant** — Bahasa Indonesia santai, ramah, natural seperti admin toko sungguhan
- **Katalog 12 Produk** — Data lengkap (harga, ukuran, stok, bahan) tertanam di system prompt
- **Intent Detection** — Otomatis deteksi apakah customer siap beli (High), tertarik (Medium), atau lihat-lihat (Low)
- **Sales Strategy** — Upselling, cross-selling, teknik closing, follow-up soft
- **Session Management** — History percakapan per sesi (maks 25 pesan), auto-expire 30 menit
- **Chat UI Premium** — Desain modern, quick reply chips, typing indicator, responsive mobile

---

## Prasyarat

- **Node.js** versi 18 atau lebih baru
- **npm** (sudah termasuk bersama Node.js)
- **Anthropic API Key** (daftar di [console.anthropic.com](https://console.anthropic.com))

---

## Instalasi & Menjalankan

### 1. Install dependensi

```bash
npm install express @anthropic-ai/sdk dotenv cors
```

### 2. Konfigurasi environment

```bash
cp .env.example .env
```

Buka file `.env` lalu isi API key:

```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxx
PORT=3000
```

### 3. Jalankan server

```bash
node server.js
```

### 4. Buka di browser

```
http://localhost:3000
```

---

## Cara Test Percakapan

Berikut beberapa skenario untuk mencoba kemampuan Ara:

### Skenario 1 — Tanya Produk
```
User: Ada kaos pria warna apa aja?
Ara:  → Menampilkan daftar warna Kaos Oversize Vintage + stok

User: Bahan apa? Cocok buat daily gak?
Ara:  → Penjelasan Cotton Combed 24s, rekomendasi penggunaan
```

### Skenario 2 — Rekomendasi + Upselling
```
User: Rekomendasiin outfit casual pria dong
Ara:  → Merekomendasikan kaos + celana cargo, highlight promo

User: Mau yang kaosnya hitam ukuran L sama celananya
Ara:  → Konfirmasi pilihan + ingatkan hampir Rp300rb → gratis tote bag
```

### Skenario 3 — Proses Order (High Intent)
```
User: Gas lah, mau order sekarang
Ara:  → Minta nama, alamat, no HP; konfirmasi total + ongkir
```

### Skenario 4 — Produk Anak
```
User: Cariin baju buat anak cowok umur 6 tahun
Ara:  → Sarankan Kaos Anak + Setelan + Jaket Hoodie Bear
```

### Skenario 5 — Handle Komplain
```
User: Pesanan saya salah kirim nih
Ara:  → Empati + jelaskan kebijakan return 3 hari + arahkan WA admin
```

---

## Struktur File

```
bandung-apparel-ai/
├── server.js       → Server Express: routing, session, serve static
├── ai.js           → Claude handler: system prompt, history, intent
├── products.js     → Katalog 12 produk + helper functions
├── public/
│   └── index.html  → Chat UI (HTML + CSS + JS inline, single file)
├── .env.example    → Template environment variables
└── README.md       → Dokumentasi ini
```

---

## Deploy ke Cloud

### Backend ke Render

1. Push kode ke GitHub
2. Buat akun di [render.com](https://render.com)
3. Klik **New → Web Service** → connect repository
4. Konfigurasi:
   - **Build Command:** `npm install express @anthropic-ai/sdk dotenv cors`
   - **Start Command:** `node server.js`
5. Tambahkan environment variable:
   - `ANTHROPIC_API_KEY` = api key kamu
   - `PORT` = 10000 (Render akan auto-assign port, pakai `process.env.PORT`)
6. Deploy

### Full-stack di Render (Rekomendasi)

Karena frontend adalah static file yang di-serve oleh Express, seluruh app bisa jalan di satu Render Web Service — tidak perlu deploy frontend terpisah.

### Frontend ke Netlify (Alternatif)

Jika ingin deploy frontend terpisah:
1. Update `fetch('/chat', ...)` di `index.html` menjadi URL backend Render kamu
2. Upload folder `public/` ke Netlify melalui drag-and-drop

---

## Environment Variables

| Variable | Wajib | Default | Keterangan |
|----------|-------|---------|------------|
| `ANTHROPIC_API_KEY` | Ya | — | API key dari Anthropic Console |
| `PORT` | Tidak | 3000 | Port server Express |

---

## Model AI

Menggunakan **claude-haiku-4-5-20251001** — model Claude tercepat dan paling cost-efficient, ideal untuk chatbot customer service yang membutuhkan respons cepat.
