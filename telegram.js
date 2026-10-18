/**
 * telegram.js
 * Integrasi Telegram Bot untuk Bandung Apparel AI Customer Service
 * - Menghubungkan Telegram Bot ke sistem AI yang sudah ada di ai.js
 * - Menggunakan polling mode untuk menerima pesan masuk
 * - Setiap chat ID Telegram digunakan sebagai sessionId yang unik
 */

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { processMessage } = require('./ai');

// Ambil token bot dari environment variable
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN tidak ditemukan di file .env');
  process.exit(1);
}

// Inisialisasi bot dengan polling mode
// Polling artinya bot secara aktif mengecek pesan baru ke server Telegram
const bot = new TelegramBot(TOKEN, { polling: true });

console.log('🤖 Bandung Apparel Telegram Bot aktif...');

// ─────────────────────────────────────────────
//  HANDLER PERINTAH /start
// ─────────────────────────────────────────────

// Saat user pertama kali membuka bot atau mengetik /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  // Pesan sambutan dari Ara
  const greeting =
    'Haii! Selamat datang di Bandung Apparel! Aku Ara, asisten virtual toko ini. Ada yang bisa aku bantu hari ini?';

  bot.sendMessage(chatId, greeting);

  console.log(`[/start] Chat ID: ${chatId} — sesi dimulai`);
});

// ─────────────────────────────────────────────
//  HANDLER PESAN MASUK
// ─────────────────────────────────────────────

// Untuk setiap pesan teks yang masuk (selain perintah /start)
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userMessage = msg.text;

  // Abaikan jika bukan pesan teks atau jika itu perintah /start
  if (!userMessage || userMessage.startsWith('/start')) return;

  console.log(`[pesan masuk] Chat ID: ${chatId} — "${userMessage}"`);

  try {
    // Kirim indikator "sedang mengetik" agar user tahu bot sedang memproses
    bot.sendChatAction(chatId, 'typing');

    // Gunakan chatId sebagai sessionId agar history percakapan tersimpan per user
    const sessionId = String(chatId);
    const { reply } = await processMessage(sessionId, userMessage);

    // Kirim balasan dari AI ke user Telegram
    await bot.sendMessage(chatId, reply);

    console.log(`[balasan terkirim] Chat ID: ${chatId}`);
  } catch (error) {
    console.error(`[error] Chat ID: ${chatId} —`, error.message);

    // Kirim pesan error yang ramah ke user jika terjadi kesalahan
    bot.sendMessage(
      chatId,
      'Maaf kak, ada gangguan teknis sebentar. Silakan coba lagi ya 🙏'
    );
  }
});

// ─────────────────────────────────────────────
//  HANDLER ERROR POLLING
// ─────────────────────────────────────────────

// Tangkap error dari proses polling agar bot tidak crash
bot.on('polling_error', (error) => {
  console.error('[polling error]', error.message);
});
