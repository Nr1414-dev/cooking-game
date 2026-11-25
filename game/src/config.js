// WARUNG RAME — config: semua data game (resep, bahan, hari, pelanggan, layout).
// Satu-satunya tempat angka-angka game didefinisikan; logika di state.js,
// stations.js, render.js hanya membaca dari sini.

export const VIEW_W = 1280;
export const VIEW_H = 720;

// --- Bahan (8) -------------------------------------------------------------
export const INGREDIENTS = {
  nasi:   { id: 'nasi',   name: 'Nasi',   choppable: false, color: '#f5ead2', dark: '#d9c49a', price: 0 },
  mie:    { id: 'mie',    name: 'Mie',    choppable: false, color: '#f2c94c', dark: '#c99a2e', price: 0 },
  telur:  { id: 'telur',  name: 'Telur',  choppable: false, color: '#fff7e0', dark: '#e8d9a8', price: 0 },
  ayam:   { id: 'ayam',   name: 'Ayam',   choppable: true,  color: '#f2a594', dark: '#c96a55', price: 0 },
  udang:  { id: 'udang',  name: 'Udang',  choppable: true,  color: '#ff9e7a', dark: '#d96a3f', price: 0 },
  sayur:  { id: 'sayur',  name: 'Sayur',  choppable: true,  color: '#7dc383', dark: '#4d8f57', price: 0 },
  cabai:  { id: 'cabai',  name: 'Cabai',  choppable: true,  color: '#e5484d', dark: '#a92c30', price: 0 },
  kecap:  { id: 'kecap',  name: 'Kecap',  choppable: false, color: '#5b3a29', dark: '#3c2417', price: 0 },
};
export const CRATE_ORDER = ['nasi', 'mie', 'telur', 'ayam', 'udang', 'sayur', 'cabai', 'kecap'];

// --- Resep (12): base + bahan utama + metode + topping ----------------------
// mains: bahan yang masuk wajan/panci (yang bisa dicincang harus dicincang dulu).
// toppings: ditambah di piring dari tangan (kecap mentah, cabai cincang,
// telur goreng dari wajan / telur rebus dari panci).
export const RECIPES = [
  { id: 'nasgor-biasa',   name: 'Nasi Goreng Biasa',   base: 'nasi', method: 'wok', mains: ['telur'],                 toppings: [],               price: 18, day: 1 },
  { id: 'nasgor-ayam',    name: 'Nasi Goreng Ayam',    base: 'nasi', method: 'wok', mains: ['ayam', 'telur'],         toppings: [],               price: 26, day: 1 },
  { id: 'nasgor-seafood', name: 'Nasi Goreng Seafood', base: 'nasi', method: 'wok', mains: ['udang', 'telur'],        toppings: [],               price: 28, day: 1 },
  { id: 'mie-ayam',       name: 'Mie Goreng Ayam',     base: 'mie',  method: 'wok', mains: ['ayam', 'sayur'],         toppings: [],               price: 26, day: 1 },
  { id: 'nasgor-pedas',   name: 'Nasi Goreng Pedas',   base: 'nasi', method: 'wok', mains: ['cabai', 'telur'],        toppings: ['kecap'],       price: 30, day: 2 },
  { id: 'mie-seafood',    name: 'Mie Goreng Seafood',  base: 'mie',  method: 'wok', mains: ['udang', 'sayur'],        toppings: [],               price: 30, day: 2 },
  { id: 'mie-rebus',      name: 'Mie Rebus Telur',     base: 'mie',  method: 'pot', mains: ['telur'],                toppings: [],               price: 22, day: 2 },
  { id: 'ayam-geprek',    name: 'Nasi Ayam Geprek',    base: 'nasi', method: 'wok', mains: ['ayam', 'cabai'],         toppings: ['kecap'],       price: 34, day: 3 },
  { id: 'mie-pedas',      name: 'Mie Goreng Pedas',    base: 'mie',  method: 'wok', mains: ['cabai', 'telur'],        toppings: [],               price: 28, day: 3 },
  { id: 'nasgor-komplit', name: 'Nasi Goreng Komplit', base: 'nasi', method: 'wok', mains: ['ayam', 'udang', 'telur', 'sayur'], toppings: [],    price: 45, day: 4 },
  { id: 'nasgor-kecap',   name: 'Nasi Telur Kecap',    base: 'nasi', method: 'wok', mains: ['telur'],                 toppings: ['kecap', 'cabai'], price: 30, day: 4 },
  { id: 'mie-spesial',    name: 'Mie Ayam Spesial',    base: 'mie',  method: 'wok', mains: ['ayam', 'telur'],         toppings: ['kecap'],       price: 36, day: 5 },
];
export const recipeById = (id) => RECIPES.find((r) => r.id === id);
export const unlockedRecipes = (day) => RECIPES.filter((r) => r.day <= day);

// --- Hari (6): target omzet, durasi, kecepatan pelanggan --------------------
export const DAYS = [
  { day: 1, name: 'Hari 1 — Gerobak Pertama', target: 120, length: 100, spawnEvery: 15, patience: 48, customers: 2 },
  { day: 2, name: 'Hari 2 — Mulai Ramai',    target: 180, length: 100, spawnEvery: 13, patience: 44, customers: 3 },
  { day: 3, name: 'Hari 3 — Kritikus Datang', target: 260, length: 105, spawnEvery: 11, patience: 40, customers: 3 },
  { day: 4, name: 'Hari 4 — Rombongan',      target: 340, length: 105, spawnEvery: 10, patience: 36, customers: 4 },
  { day: 5, name: 'Hari 5 — Hampir Bintang', target: 430, length: 110, spawnEvery: 9,  patience: 33, customers: 4 },
  { day: 6, name: 'Hari 6 — Bintang Lima',   target: 550, length: 110, spawnEvery: 8,  patience: 30, customers: 4 },
];

// --- Tipe pelanggan ----------------------------------------------------------
export const CUSTOMERS = {
  biasa:   { name: 'Pelanggan', tip: 1.0, patienceMul: 1.0,  color: '#4f9da6', hat: 'cap' },
  ojek:    { name: 'Abang Ojek', tip: 0.8, patienceMul: 0.7,  color: '#2e7d32', hat: 'helmet' },
  ibu:     { name: 'Ibu-ibu',   tip: 1.1, patienceMul: 1.3,  color: '#c2185b', hat: 'bun' },
  kritikus:{ name: 'Kritikus',  tip: 2.0, patienceMul: 0.6,  color: '#5d4037', hat: 'hat' },
  rombongan:{ name: 'Rombongan', tip: 1.5, patienceMul: 1.0, color: '#ef6c00', hat: 'cap' },
};
export const CUSTOMER_POOL = {
  1: ['biasa', 'ojek', 'ibu'],
  2: ['biasa', 'ojek', 'ibu'],
  3: ['biasa', 'ojek', 'ibu', 'kritikus'],
  4: ['biasa', 'ojek', 'ibu', 'kritikus', 'rombongan'],
  5: ['biasa', 'ojek', 'ibu', 'kritikus', 'rombongan'],
  6: ['biasa', 'ojek', 'ibu', 'kritikus', 'rombongan'],
};

// --- Aturan masak ------------------------------------------------------------
export const CHOP_HITS = 3;          // tebasan untuk mencincang 1 bahan
export const FRY_TIME = 6;           // detik menggoreng sampai matang
export const FRY_GRACE = 4;          // detik sebelum gosong setelah matang
export const BOIL_TIME = 5;          // detik merebus sampai matang
export const BOIL_GRACE = 4;         // detik sebelum lembek/gosong
export const STIR_ZONE = [0.3, 0.7]; // zona hijau penanda aduk (fraksi bar)
export const COMBO_STEP = 0.1;       // +10% tip per kombo beruntun
export const COMBO_MAX = 2.0;        // pengali kombo maksimum

// --- Palet: malam pasar, lampu amber ----------------------------------------
export const PALETTE = {
  night: '#16222e', night2: '#1d2f3d', wood: '#7a4a2b', woodDark: '#5d3620',
  counter: '#8a5a33', counterTop: '#a9743f', cream: '#f7ead0', paper: '#fff8e7',
  amber: '#ffb347', red: '#e5484d', green: '#58b368', gold: '#f2c94c',
  ink: '#2b2118', muted: '#8d7d6b', teal: '#2f6f6a', smoke: '#cfd8dc',
};

// --- Layout (koordinat canvas 1280x720) --------------------------------------
export const LAYOUT = {
  hud: { x: 0, y: 0, w: 1280, h: 56 },
  board: { x: 12, y: 66, w: 248, h: 268 },          // papan pesanan (tiket)
  customers: { x: 276, y: 66, w: 500, h: 120 },    // pelanggan di counter atas
  serve: { x: 1064, y: 66, w: 204, h: 120 },       // jendela saji
  wok: { x: 500, y: 300, w: 190, h: 150 },         // wajan
  pot: { x: 712, y: 300, w: 150, h: 150 },         // panci
  board2: { x: 300, y: 300, w: 178, h: 150 },      // talenan
  plate: { x: 884, y: 300, w: 180, h: 150 },       // piring (rakit)
  crates: { x: 12, y: 480, w: 640, h: 160 },       // peti bahan 4x2
  trash: { x: 1160, y: 480, w: 108, h: 120 },      // tong sampah
  hint: { x: 0, y: 664, w: 1280, h: 56 },          // baris petunjuk bawah
};
