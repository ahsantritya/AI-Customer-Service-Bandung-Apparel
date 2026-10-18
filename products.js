/**
 * products.js
 * Katalog produk Bandung Apparel - data lengkap 12 produk
 * Stok bersifat real-time (bisa dimodifikasi langsung di sini)
 */

const products = [

  // ─────────────────────────────────────────────
  //  KATEGORI PRIA
  // ─────────────────────────────────────────────

  {
    id: 'BA-P001',
    name: 'Kaos Oversize Vintage Pria',
    category: 'pria',
    price: 95000,
    material: 'Cotton Combed 24s 220gsm',
    fit: 'Loose fit',
    description:
      'Kaos oversize dengan vibe vintage yang kekinian. Bahan cotton combed 24s 220gsm tebal, adem, anti-pilling. Cocok buat daily wear atau layering.',
    sizes: [
      { size: 'M',  measurements: { panjang: 70, lebar: 56 } },
      { size: 'L',  measurements: { panjang: 72, lebar: 58 } },
      { size: 'XL', measurements: { panjang: 74, lebar: 60 } },
    ],
    colors: [
      { color: 'Hitam',  stock: 45 },
      { color: 'Putih',  stock: 30 },
      { color: 'Sage',   stock: 25 },
      { color: 'Cream',  stock: 20 },
      { color: 'Maroon', stock: 15 },
    ],
    tags: ['kaos', 'oversize', 'vintage', 'pria', 'casual', 'cotton', 'daily'],
  },

  {
    id: 'BA-P002',
    name: 'Kemeja Flannel Premium Pria',
    category: 'pria',
    price: 165000,
    material: 'Cotton Flannel tebal',
    fit: 'Regular fit, bisa dipakai sebagai outer',
    description:
      'Kemeja flannel motif kotak-kotak dengan bahan cotton flannel tebal hangat. Bisa dipakai sebagai kemeja biasa atau dijadikan outer di atas kaos polos.',
    sizes: [
      { size: 'M',   measurements: { panjang: 70, lebar: 52 } },
      { size: 'L',   measurements: { panjang: 72, lebar: 54 } },
      { size: 'XL',  measurements: { panjang: 74, lebar: 56 } },
      { size: 'XXL', measurements: { panjang: 76, lebar: 58 } },
    ],
    colors: [
      { color: 'Merah-Hitam',  stock: 20 },
      { color: 'Biru-Hitam',   stock: 25 },
      { color: 'Coklat-Cream', stock: 18 },
    ],
    tags: ['kemeja', 'flannel', 'pria', 'outer', 'kotak', 'kasual', 'hangat'],
  },

  {
    id: 'BA-P003',
    name: 'Jaket Bomber Classic Pria',
    category: 'pria',
    price: 225000,
    material: 'Parasut despo waterproof + satin lining',
    fit: 'Regular fit',
    description:
      'Jaket bomber klasik dengan bahan parasut despo anti-angin dan waterproof ringan. Lapisan dalam satin lining halus. Cocok untuk gaya street style maupun casual.',
    sizes: [
      { size: 'M',   measurements: { panjang: 65, lebar: 54 } },
      { size: 'L',   measurements: { panjang: 67, lebar: 56 } },
      { size: 'XL',  measurements: { panjang: 69, lebar: 58 } },
      { size: 'XXL', measurements: { panjang: 71, lebar: 60 } },
    ],
    colors: [
      { color: 'Hitam',      stock: 15 },
      { color: 'Navy',       stock: 12 },
      { color: 'Army Green', stock: 10 },
      { color: 'Maroon',     stock: 8  },
    ],
    tags: ['jaket', 'bomber', 'pria', 'waterproof', 'street style', 'parasut'],
  },

  {
    id: 'BA-P004',
    name: 'Celana Cargo Wide Pria',
    category: 'pria',
    price: 185000,
    material: 'Twill cotton',
    fit: 'Wide leg, 6 kantong fungsional',
    description:
      'Celana cargo wide leg dengan 6 kantong fungsional. Bahan twill cotton kuat dan nyaman. Cocok buat gaya kasual, outdoor, maupun street style.',
    sizes: [
      { size: '28', measurements: { pinggang: 72, panjang: 98  } },
      { size: '30', measurements: { pinggang: 76, panjang: 99  } },
      { size: '32', measurements: { pinggang: 80, panjang: 100 } },
      { size: '34', measurements: { pinggang: 84, panjang: 101 } },
      { size: '36', measurements: { pinggang: 88, panjang: 102 } },
    ],
    colors: [
      { color: 'Hitam', stock: 28 },
      { color: 'Khaki', stock: 25 },
      { color: 'Army',  stock: 22 },
      { color: 'Cream', stock: 20 },
    ],
    tags: ['celana', 'cargo', 'wide leg', 'pria', 'kantong', 'outdoor', 'casual'],
  },

  // ─────────────────────────────────────────────
  //  KATEGORI WANITA
  // ─────────────────────────────────────────────

  {
    id: 'BA-W001',
    name: 'Dress Midi Flowy Wanita',
    category: 'wanita',
    price: 155000,
    material: 'Linen rayon premium',
    fit: 'Flowy, midi length',
    description:
      'Dress midi dengan siluet flowy yang feminin dan elegan. Bahan linen rayon premium super adem, cocok untuk cuaca tropis. Bisa untuk kondangan kasual, jalan-jalan, atau meeting santai.',
    sizes: [
      { size: 'S',  measurements: { dada: 88,  panjang: 110 } },
      { size: 'M',  measurements: { dada: 92,  panjang: 112 } },
      { size: 'L',  measurements: { dada: 96,  panjang: 114 } },
      { size: 'XL', measurements: { dada: 100, panjang: 116 } },
    ],
    colors: [
      { color: 'Dusty Pink', stock: 30 },
      { color: 'Sage',       stock: 35 },
      { color: 'Cream',      stock: 28 },
      { color: 'Hitam',      stock: 25 },
    ],
    tags: ['dress', 'midi', 'flowy', 'wanita', 'adem', 'elegan', 'linen', 'kondangan'],
  },

  {
    id: 'BA-W002',
    name: 'Outer Rajut Cozy Wanita',
    category: 'wanita',
    price: 145000,
    material: 'Rajut tebal premium',
    fit: 'Oversized, All Size fit to XL',
    description:
      'Outer rajut dengan tekstur tebal dan cozy. Desain oversized yang bisa dipakai oleh semua ukuran tubuh (fit to XL). Sempurna untuk layering outfit atau saat cuaca dingin.',
    sizes: [
      { size: 'All Size', measurements: { keterangan: 'Fit to XL, lingkar dada maks 100cm' } },
    ],
    colors: [
      { color: 'Cream',  stock: 25 },
      { color: 'Mocca',  stock: 22 },
      { color: 'Abu',    stock: 20 },
      { color: 'Hitam',  stock: 30 },
      { color: 'Sage',   stock: 20 },
    ],
    tags: ['outer', 'rajut', 'wanita', 'oversized', 'cozy', 'layer', 'all size'],
  },

  {
    id: 'BA-W003',
    name: 'Blouse Batik Modern Wanita',
    category: 'wanita',
    price: 135000,
    material: 'Katun Toyobo',
    fit: 'Regular fit',
    description:
      'Blouse dengan motif batik kontemporer yang modern dan tetap elegan. Bahan katun Toyobo yang adem dan tidak mudah kusut. Cocok untuk ke kantor, acara semi-formal, atau jalan santai.',
    sizes: [
      { size: 'S',  measurements: { dada: 86,  panjang: 66 } },
      { size: 'M',  measurements: { dada: 90,  panjang: 68 } },
      { size: 'L',  measurements: { dada: 94,  panjang: 70 } },
      { size: 'XL', measurements: { dada: 98,  panjang: 72 } },
    ],
    colors: [
      { color: 'Navy',   stock: 18 },
      { color: 'Maroon', stock: 20 },
      { color: 'Teal',   stock: 15 },
    ],
    tags: ['blouse', 'batik', 'modern', 'wanita', 'kantor', 'semi-formal', 'toyobo'],
  },

  {
    id: 'BA-W004',
    name: 'Rok Plisket Elegant Wanita',
    category: 'wanita',
    price: 125000,
    material: 'Chiffon premium',
    fit: 'All Size, pinggang karet elastis',
    description:
      'Rok plisket elegan dengan bahan chiffon premium yang ringan dan mengalir. Pinggang karet elastis yang nyaman untuk semua ukuran. Panjang 90cm, cocok untuk tampilan feminin dan profesional.',
    sizes: [
      { size: 'All Size', measurements: { panjang: 90, keterangan: 'Pinggang karet, fit to XL' } },
    ],
    colors: [
      { color: 'Hitam',      stock: 40 },
      { color: 'Cream',      stock: 35 },
      { color: 'Dusty Pink', stock: 30 },
      { color: 'Abu',        stock: 25 },
    ],
    tags: ['rok', 'plisket', 'wanita', 'elegan', 'chiffon', 'all size', 'feminin'],
  },

  // ─────────────────────────────────────────────
  //  KATEGORI ANAK
  // ─────────────────────────────────────────────

  {
    id: 'BA-A001',
    name: 'Kaos Anak Motif Fun',
    category: 'anak',
    price: 65000,
    material: 'Cotton Combed 24s, sablon DTF',
    fit: 'Regular fit anak',
    description:
      'Kaos anak dengan motif-motif lucu dan colorful. Sablon DTF yang tajam, tahan lama, dan aman untuk kulit anak. Bahan cotton combed 24s lembut dan adem.',
    sizes: [
      { size: '2-3 thn',   measurements: { panjang: 38, lebar: 30 } },
      { size: '4-5 thn',   measurements: { panjang: 42, lebar: 32 } },
      { size: '6-7 thn',   measurements: { panjang: 46, lebar: 35 } },
      { size: '8-9 thn',   measurements: { panjang: 50, lebar: 37 } },
      { size: '10-11 thn', measurements: { panjang: 54, lebar: 40 } },
    ],
    colors: [
      { color: 'Biru',    stock: 48 },
      { color: 'Merah',   stock: 45 },
      { color: 'Kuning',  stock: 42 },
      { color: 'Hijau',   stock: 40 },
    ],
    tags: ['kaos', 'anak', 'motif', 'fun', 'colorful', 'sablon', 'cotton'],
  },

  {
    id: 'BA-A002',
    name: 'Setelan Anak Casual',
    category: 'anak',
    price: 110000,
    material: 'Cotton Terry',
    fit: 'Kaos + celana jogger satu set',
    description:
      'Setelan lengkap kaos dan celana jogger untuk anak. Bahan cotton terry yang lembut, hangat, dan nyaman. Cocok untuk aktivitas sehari-hari maupun tidur.',
    sizes: [
      { size: '2-3 thn', measurements: { keterangan: 'Kaos panjang 38cm + Jogger panjang 48cm' } },
      { size: '4-5 thn', measurements: { keterangan: 'Kaos panjang 42cm + Jogger panjang 54cm' } },
      { size: '6-7 thn', measurements: { keterangan: 'Kaos panjang 46cm + Jogger panjang 60cm' } },
      { size: '8-9 thn', measurements: { keterangan: 'Kaos panjang 50cm + Jogger panjang 66cm' } },
    ],
    colors: [
      { color: 'Navy',  stock: 38 },
      { color: 'Abu',   stock: 35 },
      { color: 'Cream', stock: 30 },
    ],
    tags: ['setelan', 'anak', 'casual', 'jogger', 'kaos', 'cotton terry', 'set'],
  },

  {
    id: 'BA-A003',
    name: 'Jaket Anak Hoodie Bear',
    category: 'anak',
    price: 135000,
    material: 'Fleece 260gsm',
    fit: 'Regular fit dengan telinga bear di hoodie',
    description:
      'Jaket hoodie anak dengan aksen telinga beruang yang imut. Bahan fleece 260gsm super hangat dan lembut. Ada kantong depan dan zip yang mudah dibuka-tutup anak.',
    sizes: [
      { size: '3-4 thn', measurements: { panjang: 40, lebar: 32 } },
      { size: '5-6 thn', measurements: { panjang: 44, lebar: 35 } },
      { size: '7-8 thn', measurements: { panjang: 48, lebar: 38 } },
      { size: '9-10 thn',measurements: { panjang: 52, lebar: 41 } },
    ],
    colors: [
      { color: 'Hitam',     stock: 28 },
      { color: 'Cream',     stock: 25 },
      { color: 'Pink',      stock: 30 },
      { color: 'Biru Muda', stock: 22 },
    ],
    tags: ['jaket', 'hoodie', 'anak', 'bear', 'fleece', 'hangat', 'imut'],
  },

  {
    id: 'BA-A004',
    name: 'Dress Anak Bunga',
    category: 'anak',
    price: 89000,
    material: 'Katun lembut motif bunga',
    fit: 'A-line, nyaman untuk bergerak',
    description:
      'Dress cantik dengan motif bunga-bunga warna-warni untuk anak perempuan. Bahan katun lembut yang tidak iritasi di kulit sensitif anak. Desain A-line yang nyaman untuk bermain.',
    sizes: [
      { size: '2-3 thn', measurements: { panjang: 52, dada: 56 } },
      { size: '4-5 thn', measurements: { panjang: 58, dada: 60 } },
      { size: '6-7 thn', measurements: { panjang: 64, dada: 64 } },
      { size: '8-9 thn', measurements: { panjang: 70, dada: 68 } },
    ],
    colors: [
      { color: 'Pink',   stock: 32 },
      { color: 'Lilac',  stock: 28 },
      { color: 'Kuning', stock: 25 },
    ],
    tags: ['dress', 'anak', 'bunga', 'perempuan', 'katun', 'cantik', 'floral'],
  },

];

/**
 * Dapatkan ringkasan stok semua produk (untuk keperluan AI system prompt)
 */
function getProductSummary() {
  return products.map((p) => {
    const colorStock = p.colors
      .map((c) => `${c.color} (stok: ${c.stock})`)
      .join(', ');
    const sizeList = p.sizes
      .map((s) => {
        const m = s.measurements;
        const detail = Object.entries(m)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ');
        return `${s.size} [${detail}]`;
      })
      .join(' | ');
    return (
      `[${p.id}] ${p.name} (${p.category.toUpperCase()})\n` +
      `  Harga: Rp${p.price.toLocaleString('id-ID')}\n` +
      `  Bahan: ${p.material} | Fit: ${p.fit}\n` +
      `  Ukuran: ${sizeList}\n` +
      `  Warna & Stok: ${colorStock}\n` +
      `  Deskripsi: ${p.description}`
    );
  }).join('\n\n');
}

/**
 * Cari produk berdasarkan kata kunci (untuk analisa produk yang dibahas)
 */
function findProductsByKeyword(keyword) {
  const kw = keyword.toLowerCase();
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(kw) ||
      p.tags.some((t) => t.includes(kw)) ||
      p.category.toLowerCase().includes(kw)
  );
}

module.exports = { products, getProductSummary, findProductsByKeyword };
