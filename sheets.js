/**
 * sheets.js
 * Modul integrasi Google Sheets untuk Bandung Apparel AI
 *
 * Fungsi utama:
 *   - getProducts()   → baca tab "Daftar Produk Pakaian" dan return array of objects
 *   - getStoreInfo()  → baca tab "Info Toko" dan return object key-value
 *
 * Data di-cache selama 5 detik agar perubahan di Google Sheets cepat terbaca.
 * Autentikasi menggunakan Service Account dari credentials.json di root folder.
 */

const { google } = require('googleapis');
const path = require('path');

// Impor data lokal sebagai fallback saat Google Sheets tidak dapat diakses
const { products: localProducts } = require('./products');

// ─────────────────────────────────────────────
//  KONFIGURASI
// ─────────────────────────────────────────────

// ID spreadsheet dibaca dari .env
const SHEET_ID = process.env.GOOGLE_SHEET_ID;

// Nama tab (worksheet) di Google Sheets — harus sama persis dengan nama tab di spreadsheet
const TAB_PRODUK     = 'Daftar Produk Pakaian';
const TAB_INFO_TOKO  = 'Info Toko';

// Durasi cache: 5 detik (dalam milidetik)
const CACHE_TTL_MS = 5 * 1000;

// ─────────────────────────────────────────────
//  INISIALISASI GOOGLE SHEETS AUTH
// ─────────────────────────────────────────────

// Path ke file credentials service account
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');

// Buat Google Auth client dengan scope hanya baca (read-only)
const auth = new google.auth.GoogleAuth({
  keyFile: CREDENTIALS_PATH,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

// Instance Sheets API
const sheetsApi = google.sheets({ version: 'v4', auth });

// ─────────────────────────────────────────────
//  CACHE SEDERHANA
// ─────────────────────────────────────────────

/**
 * Struktur cache:
 * {
 *   products:  { data: [...], fetchedAt: timestamp },
 *   storeInfo: { data: {...}, fetchedAt: timestamp },
 * }
 */
const cache = {
  products:  { data: null, fetchedAt: 0 },
  storeInfo: { data: null, fetchedAt: 0 },
};

/**
 * Cek apakah cache masih valid (belum lewat TTL)
 * @param {number} fetchedAt - timestamp saat data terakhir di-fetch
 * @returns {boolean}
 */
function isCacheValid(fetchedAt) {
  return fetchedAt > 0 && (Date.now() - fetchedAt) < CACHE_TTL_MS;
}

// ─────────────────────────────────────────────
//  DATA DEFAULT FALLBACK (dipakai kalau Sheets gagal)
// ─────────────────────────────────────────────

/**
 * Konversi format produk dari products.js ke format yang dipakai sheets.js.
 * Dipanggil saat koneksi Google Sheets gagal.
 * @returns {Array} array produk dalam format sheets.js
 */
function getFallbackProducts() {
  return localProducts.map((p) => ({
    nama:      p.name,
    kategori:  p.category,
    harga:     p.price,
    ukuran:    p.sizes.map((s) => s.size),
    warna:     p.colors.map((c) => ({ warna: c.color, stok: c.stock })),
    bahan:     p.material,
    deskripsi: p.description,
  }));
}

/**
 * Data info toko default — dipakai kalau tab "Info Toko" tidak ada atau Sheets gagal.
 * @returns {Object} key-value info toko
 */
function getFallbackStoreInfo() {
  return {
    'Nama Toko':         'Bandung Apparel',
    'Tagline':           'Outfit Lokal, Gaya Global',
    'WA Admin':          '081234567890',
    'Jam Operasional':   'Senin–Sabtu 08.00–20.00 WIB',
    'Alamat':            'Bandung, Jawa Barat',
    'Pengiriman':        'Seluruh Indonesia via JNE, J&T, SiCepat',
    'Promo':             'Gratis tote bag untuk pembelian di atas Rp300.000. Kode NEWBA diskon 15% untuk pembelian pertama.',
  };
}

// ─────────────────────────────────────────────
//  HELPER: BACA RANGE DARI SHEETS
// ─────────────────────────────────────────────

/**
 * Ambil data mentah dari satu range di Google Sheets
 * @param {string} range - contoh: 'Produk!A:H' atau 'Info Toko!A:B'
 * @returns {Promise<string[][]>} array 2D berisi nilai sel
 */
async function fetchRange(range) {
  const response = await sheetsApi.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range,
  });

  // Kalau sheet kosong, return array kosong
  return response.data.values || [];
}

// ─────────────────────────────────────────────
//  FUNGSI PUBLIK: GET PRODUCTS
// ─────────────────────────────────────────────

/**
 * Baca daftar produk dari tab "Daftar Produk Pakaian" di Google Sheets.
 *
 * Kolom yang diharapkan (baris pertama = header):
 *   Nama | Kategori | Harga | Ukuran | Warna | Stok | Bahan | Deskripsi
 *
 * Kolom Ukuran  → dipisah koma, contoh: "S, M, L, XL"
 * Kolom Warna   → dipisah koma, contoh: "Hitam, Putih, Navy"
 * Kolom Stok    → dipisah koma sesuai urutan warna, contoh: "10, 5, 8"
 * Kolom Harga   → angka, boleh ada titik ribuan, contoh: "95000" atau "95.000"
 *
 * @returns {Promise<Array<{
 *   nama: string,
 *   kategori: string,
 *   harga: number,
 *   ukuran: string[],
 *   warna: Array<{warna: string, stok: number}>,
 *   bahan: string,
 *   deskripsi: string
 * }>>}
 */
async function getProducts() {
  // Kembalikan dari cache kalau masih fresh
  if (isCacheValid(cache.products.fetchedAt)) {
    return cache.products.data;
  }

  try {
    // Fetch dari Google Sheets
    const rows = await fetchRange(`${TAB_PRODUK}!A:H`);

    if (rows.length < 2) {
      // Sheet kosong atau hanya header → gunakan fallback products.js
      console.warn('[sheets.js] Tab produk kosong, pakai data fallback dari products.js');
      const fallback = getFallbackProducts();
      cache.products = { data: fallback, fetchedAt: Date.now() };
      return fallback;
    }

    // Baris pertama adalah header, lewati
    const [_header, ...dataRows] = rows;

    const products = dataRows
      .filter((row) => row[0]) // skip baris kosong (kolom Nama kosong)
      .map((row) => {
        const [nama, kategori, hargaRaw, ukuranRaw, warnaRaw, stokRaw, bahan, deskripsi] = row;

        // Bersihkan harga: hapus titik ribuan lalu parse jadi number
        const harga = parseInt((hargaRaw || '0').replace(/\./g, ''), 10) || 0;

        // Ukuran: pisah koma, trim spasi
        const ukuran = (ukuranRaw || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

        // Warna dan stok: pisah koma, lalu pasangkan satu-satu
        const warnaList = (warnaRaw || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

        const stokList = (stokRaw || '')
          .split(',')
          .map((s) => parseInt(s.trim(), 10) || 0);

        const warna = warnaList.map((w, i) => ({
          warna: w,
          stok: stokList[i] ?? 0,
        }));

        return {
          nama:      (nama || '').trim(),
          kategori:  (kategori || '').trim(),
          harga,
          ukuran,
          warna,
          bahan:     (bahan || '').trim(),
          deskripsi: (deskripsi || '').trim(),
        };
      });

    // Simpan ke cache
    cache.products = { data: products, fetchedAt: Date.now() };
    return products;

  } catch (err) {
    // Google Sheets gagal — fallback ke data lokal agar chatbot tetap jalan
    console.error('[sheets.js] Gagal baca produk dari Sheets, pakai fallback:', err.message);
    const fallback = getFallbackProducts();
    // Jangan cache error result terlalu lama — biar retry lebih cepat (1 menit)
    cache.products = { data: fallback, fetchedAt: Date.now() - CACHE_TTL_MS + 60_000 };
    return fallback;
  }
}

// ─────────────────────────────────────────────
//  FUNGSI PUBLIK: GET STORE INFO
// ─────────────────────────────────────────────

/**
 * Baca info toko dari tab "Info Toko" di Google Sheets.
 *
 * Kolom yang diharapkan:
 *   Key | Value
 *
 * Contoh isi:
 *   jam_operasional_senin_sabtu | 09.00–21.00 WIB
 *   nomor_whatsapp              | 081234567890
 *   alamat                      | Jl. Cihampelas No.88, Bandung
 *   ...
 *
 * @returns {Promise<Record<string, string>>} object key-value info toko
 */
async function getStoreInfo() {
  // Kembalikan dari cache kalau masih fresh
  if (isCacheValid(cache.storeInfo.fetchedAt)) {
    return cache.storeInfo.data;
  }

  try {
    // Fetch dari Google Sheets
    const rows = await fetchRange(`${TAB_INFO_TOKO}!A:B`);

    if (rows.length < 2) {
      // Tab tidak ada atau kosong → pakai data default
      console.warn('[sheets.js] Tab "Info Toko" kosong/tidak ada, pakai data default');
      const fallback = getFallbackStoreInfo();
      cache.storeInfo = { data: fallback, fetchedAt: Date.now() };
      return fallback;
    }

    // Baris pertama adalah header, lewati
    const [_header, ...dataRows] = rows;

    const info = {};
    dataRows.forEach((row) => {
      const key   = (row[0] || '').trim();
      const value = (row[1] || '').trim();
      if (key) {
        info[key] = value;
      }
    });

    // Simpan ke cache
    cache.storeInfo = { data: info, fetchedAt: Date.now() };
    return info;

  } catch (err) {
    // Google Sheets gagal atau tab tidak ditemukan — pakai data default
    console.error('[sheets.js] Gagal baca info toko dari Sheets, pakai fallback:', err.message);
    const fallback = getFallbackStoreInfo();
    cache.storeInfo = { data: fallback, fetchedAt: Date.now() - CACHE_TTL_MS + 60_000 };
    return fallback;
  }
}

// ─────────────────────────────────────────────
//  HELPER: FORMAT PRODUK UNTUK SYSTEM PROMPT
// ─────────────────────────────────────────────

/**
 * Ubah array produk dari getProducts() menjadi teks ringkasan
 * yang siap dimasukkan ke system prompt Claude.
 * @param {Awaited<ReturnType<typeof getProducts>>} products
 * @returns {string}
 */
function formatProductsForPrompt(products) {
  if (!products || products.length === 0) {
    return '(Data produk tidak tersedia saat ini)';
  }

  return products.map((p, i) => {
    const hargaFormatted = `Rp${p.harga.toLocaleString('id-ID')}`;
    const ukuranText     = p.ukuran.length > 0 ? p.ukuran.join(', ') : '-';
    const warnaStok      = p.warna.map((w) => `${w.warna} (stok: ${w.stok})`).join(', ');

    return (
      `${i + 1}. ${p.nama} [${p.kategori.toUpperCase()}]\n` +
      `   Harga    : ${hargaFormatted}\n` +
      `   Bahan    : ${p.bahan}\n` +
      `   Ukuran   : ${ukuranText}\n` +
      `   Warna & Stok: ${warnaStok}\n` +
      `   Deskripsi: ${p.deskripsi}`
    );
  }).join('\n\n');
}

/**
 * Ubah object info toko dari getStoreInfo() menjadi teks ringkasan
 * yang siap dimasukkan ke system prompt Claude.
 * @param {Awaited<ReturnType<typeof getStoreInfo>>} info
 * @returns {string}
 */
function formatStoreInfoForPrompt(info) {
  if (!info || Object.keys(info).length === 0) {
    return '(Info toko tidak tersedia saat ini)';
  }

  return Object.entries(info)
    .map(([key, value]) => `- ${key}: ${value}`)
    .join('\n');
}

module.exports = {
  getProducts,
  getStoreInfo,
  formatProductsForPrompt,
  formatStoreInfoForPrompt,
};
