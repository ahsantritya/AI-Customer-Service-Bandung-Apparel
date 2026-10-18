/**
 * server.js
 * Backend Express untuk Bandung Apparel AI Customer Service
 * - POST /chat  → terima pesan, return balasan AI + intent
 * - GET  /health → cek status server
 * - Auto-expire sesi tidak aktif setelah 30 menit
 * - Serve static files dari folder public/
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const { processMessage, clearSession, getActiveSessionCount } = require('./ai');

const app = express();
const PORT = process.env.PORT || 3000;

// ─────────────────────────────────────────────
//  MIDDLEWARE
// ─────────────────────────────────────────────

app.use(cors());
app.use(express.json());

// Serve file statis dari folder public/
app.use(express.static(path.join(__dirname, 'public')));

// ─────────────────────────────────────────────
//  SESSION MANAGEMENT
// ─────────────────────────────────────────────

// Map untuk menyimpan waktu aktivitas terakhir per sesi
// Format: sessionId -> timestamp (Date.now())
const sessionLastActive = new Map();

// Durasi inaktif sebelum sesi expired (30 menit dalam milidetik)
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

/**
 * Perbarui waktu aktivitas sesi
 * @param {string} sessionId
 */
function touchSession(sessionId) {
  sessionLastActive.set(sessionId, Date.now());
}

/**
 * Bersihkan sesi yang sudah expired secara periodik
 * Dijalankan setiap 5 menit
 */
function cleanupExpiredSessions() {
  const now = Date.now();
  let cleaned = 0;

  for (const [sessionId, lastActive] of sessionLastActive.entries()) {
    if (now - lastActive > SESSION_TIMEOUT_MS) {
      clearSession(sessionId);
      sessionLastActive.delete(sessionId);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`[Session Cleanup] ${cleaned} sesi expired dibersihkan. Sesi aktif: ${getActiveSessionCount()}`);
  }
}

// Jalankan cleanup setiap 5 menit
setInterval(cleanupExpiredSessions, 5 * 60 * 1000);

// ─────────────────────────────────────────────
//  ROUTES
// ─────────────────────────────────────────────

/**
 * POST /chat
 * Body: { message: string, sessionId: string }
 * Response: { reply: string, intent: string, productsDiscussed: string[] }
 */
app.post('/chat', async (req, res) => {
  const { message, sessionId } = req.body;

  // Validasi input
  if (!message || typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({
      error: 'Pesan tidak boleh kosong.',
    });
  }

  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(400).json({
      error: 'sessionId tidak valid.',
    });
  }

  // Batasi panjang pesan (cegah abuse)
  if (message.length > 2000) {
    return res.status(400).json({
      error: 'Pesan terlalu panjang (maks 2000 karakter).',
    });
  }

  // Perbarui timestamp sesi
  touchSession(sessionId);

  console.log(`[Chat] Session: ${sessionId.slice(0, 8)}... | Intent check untuk: "${message.slice(0, 60)}..."`);

  try {
    const result = await processMessage(sessionId, message.trim());

    console.log(`[Chat] Intent: ${result.intent} | Produk dibahas: ${result.productsDiscussed.join(', ') || 'tidak ada'}`);

    return res.json({
      reply: result.reply,
      intent: result.intent,
      productsDiscussed: result.productsDiscussed,
    });
  } catch (err) {
    console.error('[Chat Error]', err.message);

    // Handle error spesifik dari Anthropic API
    if (err.status === 401) {
      return res.status(500).json({
        error: 'API key tidak valid. Cek konfigurasi ANTHROPIC_API_KEY di .env',
      });
    }

    if (err.status === 429) {
      return res.status(429).json({
        error: 'Terlalu banyak permintaan. Silakan coba lagi sebentar.',
      });
    }

    return res.status(500).json({
      error: 'Maaf, ada gangguan pada server. Silakan coba lagi.',
    });
  }
});

/**
 * GET /health
 * Cek status server dan jumlah sesi aktif
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Bandung Apparel AI Customer Service',
    activeSessions: getActiveSessionCount(),
    uptime: Math.floor(process.uptime()) + ' detik',
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /* → fallback ke index.html (SPA support)
 */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─────────────────────────────────────────────
//  START SERVER
// ─────────────────────────────────────────────

app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════');
  console.log('  🛍️  Bandung Apparel AI Customer Service  ');
  console.log('═══════════════════════════════════════════');
  console.log(`  Server berjalan di: http://localhost:${PORT}`);
  console.log(`  Health check    : http://localhost:${PORT}/health`);
  console.log(`  Model AI        : claude-haiku-4-5-20251001`);
  console.log(`  Session timeout : 30 menit`);
  console.log('═══════════════════════════════════════════');

  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('\n  ⚠️  PERINGATAN: ANTHROPIC_API_KEY belum di-set di .env!');
    console.warn('  Salin .env.example ke .env dan isi API key.\n');
  }
});
