/**
 * ai.js
 * Handler Claude AI untuk Bandung Apparel Customer Service
 * - Membangun system prompt lengkap dengan data katalog
 * - Mengelola conversation history per sesi (maks 25 pesan)
 * - Deteksi intent customer (high/medium/low)
 * - Return reply, intent, dan daftar produk yang dibahas
 */

const Anthropic = require("@anthropic-ai/sdk");
const {
  products: localProducts,
  findProductsByKeyword,
} = require("./products");
const {
  getProducts,
  getStoreInfo,
  formatProductsForPrompt,
  formatStoreInfoForPrompt,
} = require("./sheets");

// Inisialisasi Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Model yang digunakan
const MODEL = "claude-haiku-4-5-20251001";

// Penyimpanan history percakapan per sesi (sessionId -> array messages)
const conversationHistories = new Map();

// Maksimal pesan yang disimpan per sesi
const MAX_HISTORY = 25;

// ─────────────────────────────────────────────
//  SYSTEM PROMPT
// ─────────────────────────────────────────────

/**
 * Bangun system prompt secara dinamis dengan data terbaru dari Google Sheets.
 * Dipanggil setiap kali ada pesan masuk; data sudah di-cache 5 menit di sheets.js.
 * @returns {Promise<string>}
 */
function buildFallbackKatalog() {
  if (!localProducts || localProducts.length === 0)
    return "(Data produk tidak tersedia)";
  return localProducts
    .map((p) => {
      const stok = p.colors.map((c) => `${c.color}: ${c.stock}`).join(", ");
      const ukuran = p.sizes.map((s) => s.size).join(", ");
      return `**${p.name}** (${p.id})\n- Harga: Rp${p.price.toLocaleString("id-ID")}\n- Bahan: ${p.material}\n- Fit: ${p.fit}\n- Ukuran: ${ukuran}\n- Stok per warna: ${stok}\n- Deskripsi: ${p.description}`;
    })
    .join("\n\n");
}

async function buildSystemPrompt() {
  let katalog;
  let infoToko;

  try {
    const [sheetsProducts, sheetsStoreInfo] = await Promise.all([
      getProducts(),
      getStoreInfo(),
    ]);
    katalog = formatProductsForPrompt(sheetsProducts);
    infoToko = formatStoreInfoForPrompt(sheetsStoreInfo);
  } catch (err) {
    console.error(
      "[ai.js] Google Sheets gagal, fallback ke products.js:",
      err.message,
    );
    katalog = buildFallbackKatalog();
    infoToko =
      "Nama Toko: Bandung Apparel\nTagline: Outfit Lokal, Gaya Global\nWA Admin: 081234567890\nJam Operasional: Senin-Sabtu 08.00-20.00 WIB";
  }

  return `Kamu adalah Ara, asisten virtual toko online Bandung Apparel dengan tagline "Outfit Lokal, Gaya Global". Kamu bertugas sebagai customer service sekaligus sales assistant yang ramah, hangat, dan membantu.

## IDENTITAS & KEPRIBADIAN
- Nama: Ara
- Gaya bahasa: Indonesia santai tapi sopan, seperti admin toko online yang friendly
- Gunakan emoji secukupnya (tidak berlebihan, 1-2 per pesan jika relevan)
- Jawaban singkat, padat, to the point — tidak bertele-tele
- Natural seperti manusia, bukan robot
- Gunakan sapaan "kak" untuk customer

## INFORMASI TOKO (dari Google Sheets, diperbarui otomatis)

${infoToko}

---

## KATALOG PRODUK LENGKAP (dari Google Sheets, diperbarui otomatis)

${katalog}

---

## CARA KERJAMU

### 1. JAWAB PERTANYAAN PRODUK
- Gunakan HANYA data katalog di atas, jangan mengarang informasi
- Kalau stok warna/ukuran tertentu habis, bilang jujur dan rekomendasikan alternatif
- Tampilkan harga dengan format Rp95.000 (bukan 95000)

### 2. PAHAMI KONTEKS PERCAKAPAN
- Ingat percakapan sebelumnya dalam sesi ini
- Kalau customer bilang "yang hitam", "yang tadi", "itu" → pahami dari konteks
- Kalau customer bilang "untuk istri saya" → target adalah wanita, sarankan produk wanita
- Kalau customer bilang "untuk anak saya umur 5 tahun" → sarankan produk anak ukuran 4-5 thn

### 3. ANALISIS NIAT (internal, jangan ditampilkan ke user)
- HIGH INTENT: siap beli → kata kunci: ready, order, beli, mau ambil, langsung kirim, transfer, pesan, checkout
- MEDIUM INTENT: tertarik tapi belum yakin → kata kunci: bahannya apa, ukuran berapa, ada warna lain, cocok gak, bagus gak
- LOW INTENT: lihat-lihat → kata kunci: ada apa aja, lagi nyari, pengen lihat, info dulu, mau tanya

### 4. STRATEGI BERDASARKAN NIAT

**HIGH INTENT → Closing:**
Langsung bantu proses order, minta data lengkap:
"Oke kak, aku bantu proses ya! Tolong kirim:
1. Nama lengkap
2. Alamat lengkap + kota/kecamatan
3. No. HP aktif

Nanti aku totalin semuanya termasuk ongkir kak 😊"

Buat urgency halus jika stok terbatas:
"Btw stok warna [X] tinggal [N] kak, mau aku amankan dulu?"

**MEDIUM INTENT → Edukasi & Dorong:**
- Jelaskan keunggulan produk (bahan, fitting, keawetan)
- Highlight promo yang relevan
- Compare dengan produk lain kalau perlu
- Tawarkan untuk bantu pilih ukuran

**LOW INTENT → Soft Selling:**
- Tetap ramah dan bantu tanpa pushy
- Highlight best seller atau promo menarik
- Kenalkan produk yang relevan dengan konteks

### 5. UPSELLING & CROSS-SELLING (framing sebagai rekomendasi, bukan paksaan)
- Beli kaos pria → tawarkan Celana Cargo Wide yang cocok
- Beli dress → tawarkan Outer Rajut Cozy sebagai pelengkap
- Total belanja mendekati Rp300.000 → ingatkan gratis tote bag jika nambah sedikit
- Beli untuk anak → tawarkan setelan + jaket hoodie bear
- Jangan lebih dari 1-2 rekomendasi tambahan sekaligus

### 6. TEKNIK CLOSING
- Setelah customer pilih produk: langsung minta data pengiriman
- Beri opsi pembayaran: "Bisa transfer BCA atau e-wallet kak, mana yang lebih gampang?"
- Konfirmasi ulang pesanan sebelum finalisasi

### 7. HANDLE KOMPLAIN
- Tunjukkan empati DULU sebelum solusi: "Aduh maaf banget ya kak atas ketidaknyamanannya 🙏"
- Jangan menyalahkan customer
- Tawarkan solusi konkret sesuai kebijakan toko
- Jika di luar kemampuan: "Aku sambungkan ke tim kami via WA ya kak supaya lebih cepat ditangani: 081234567890"

### 8. FOLLOW-UP SOFT
Kalau customer belum jadi beli tapi tertarik:
"Gapapa kak, pikirin dulu aja. Kalau nanti mau lanjut tinggal chat aku lagi ya 😊 Oh iya kode NEWBA masih berlaku lho, bisa hemat 15% buat pembelian pertamanya."

### 9. ATURAN WAJIB
- JANGAN mengarang stok, harga, ongkir, atau informasi yang tidak ada di data
- Kalau tidak tahu: "Untuk info lebih lanjut bisa langsung WA admin kami ya kak di 081234567890"
- JANGAN membahas atau membandingkan dengan toko/brand kompetitor
- Fokus utama: bantu customer + tingkatkan kemungkinan penjualan

- Gunakan bahasa Indonesia yang santai dan natural, seperti chat biasa antar manusia
- JANGAN gunakan emoji sama sekali
- JANGAN gunakan formatting bold (jangan pakai tanda bintang ** atau *)
- JANGAN gunakan bullet point atau list kecuali sangat diperlukan
- Tulis biasa saja, seperti orang balas chat WA — singkat, jelas, langsung ke inti
- Maksimal 3-4 kalimat per respons kecuali pelanggan butuh penjelasan panjang

Selamat bertugas, Ara! Jadilah asisten yang membuat customer senang dan yakin belanja di Bandung Apparel 💛`;
}

// ─────────────────────────────────────────────
//  DETEKSI INTENT
// ─────────────────────────────────────────────

/**
 * Analisa intent customer dari pesan yang dikirim
 * @param {string} message - pesan customer
 * @returns {'high'|'medium'|'low'} intent level
 */
function detectIntent(message) {
  const msg = message.toLowerCase();

  // Kata kunci HIGH INTENT
  const highKeywords = [
    "order",
    "beli",
    "mau ambil",
    "langsung kirim",
    "transfer",
    "ready",
    "pesan",
    "checkout",
    "mau beli",
    "mau order",
    "fix beli",
    "jadi beli",
    "mau bayar",
    "bayar",
    "mau pesan",
    "aku mau",
    "saya mau",
    "kakak mau",
    "jadi nih",
    "gas",
  ];

  // Kata kunci MEDIUM INTENT
  const mediumKeywords = [
    "bahannya",
    "bahannya apa",
    "ukuran berapa",
    "size berapa",
    "ada warna lain",
    "cocok gak",
    "bagus gak",
    "rekomen",
    "saranin",
    "kira-kira",
    "gimana",
    "gimana ya",
    "worth it",
    "worth",
    "bagus",
    "cocok",
    "pas gak",
    "fitting",
    "ukurannya",
    "bedanya",
    "perbedaan",
    "pilih mana",
    "lebih bagus",
  ];

  // Cek HIGH dulu
  if (highKeywords.some((kw) => msg.includes(kw))) return "high";

  // Cek MEDIUM
  if (mediumKeywords.some((kw) => msg.includes(kw))) return "medium";

  // Default LOW
  return "low";
}

/**
 * Ekstrak nama produk yang kemungkinan dibahas dalam pesan
 * @param {string} message - pesan customer
 * @returns {string[]} array nama produk
 */
function extractProductsDiscussed(message) {
  const keywords = [
    "kaos",
    "kemeja",
    "flannel",
    "jaket",
    "bomber",
    "celana",
    "cargo",
    "dress",
    "midi",
    "outer",
    "rajut",
    "blouse",
    "batik",
    "rok",
    "plisket",
    "setelan",
    "hoodie",
    "bear",
    "bunga",
    "oversize",
    "vintage",
  ];

  const found = new Set();
  const msgLower = message.toLowerCase();

  keywords.forEach((kw) => {
    if (msgLower.includes(kw)) {
      const matched = findProductsByKeyword(kw);
      matched.forEach((p) => found.add(p.name));
    }
  });

  return Array.from(found);
}

// ─────────────────────────────────────────────
//  FUNGSI UTAMA: KIRIM PESAN KE CLAUDE
// ─────────────────────────────────────────────

/**
 * Proses pesan customer dan dapatkan respons dari Claude
 * @param {string} sessionId - ID sesi unik customer
 * @param {string} userMessage - pesan customer
 * @returns {Promise<{reply: string, intent: string, productsDiscussed: string[]}>}
 */
async function processMessage(sessionId, userMessage) {
  // Ambil atau buat history untuk sesi ini
  if (!conversationHistories.has(sessionId)) {
    conversationHistories.set(sessionId, []);
  }

  const history = conversationHistories.get(sessionId);

  // Tambah pesan user ke history
  history.push({
    role: "user",
    content: userMessage,
  });

  // Trim history jika melebihi batas (hapus pesan paling lama, pertahankan pasangan)
  while (history.length > MAX_HISTORY) {
    history.shift();
    // Pastikan history selalu diawali oleh role 'user'
    if (history.length > 0 && history[0].role === "assistant") {
      history.shift();
    }
  }

  // Bangun system prompt — jika Sheets error, sudah ada fallback ke products.js
  let systemPrompt;
  try {
    systemPrompt = await buildSystemPrompt();
  } catch (err) {
    console.error("[ai.js] buildSystemPrompt gagal total:", err.message);
    systemPrompt =
      "Kamu adalah Ara, customer service Bandung Apparel. Bantu customer dengan ramah. Jika tidak tahu info spesifik, minta customer hubungi admin di 081234567890.";
  }

  // Kirim ke Claude
  let reply;
  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: history,
    });
    reply = response.content[0].text;
  } catch (err) {
    console.error("[ai.js] Claude API error:", err.message);
    // Hapus pesan user dari history karena tidak diproses
    history.pop();
    throw err;
  }

  // Tambah respons AI ke history
  history.push({
    role: "assistant",
    content: reply,
  });

  // Deteksi intent dan produk yang dibahas
  const intent = detectIntent(userMessage);
  const productsDiscussed = extractProductsDiscussed(userMessage + " " + reply);

  return { reply, intent, productsDiscussed };
}

/**
 * Hapus history sesi (dipanggil saat sesi expired)
 * @param {string} sessionId
 */
function clearSession(sessionId) {
  conversationHistories.delete(sessionId);
}

/**
 * Cek jumlah sesi aktif (untuk monitoring)
 * @returns {number}
 */
function getActiveSessionCount() {
  return conversationHistories.size;
}

module.exports = { processMessage, clearSession, getActiveSessionCount };
