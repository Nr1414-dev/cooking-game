// Adegan screenshot WARUNG RAME (?shot=...&seed=...).
// Pola starter: mainkan aturan nyata maju dari state segar dengan autopilot
// berskrip + RNG ber-seed, jadi frame adalah apa yang sungguh terjadi di game
// dan seed yang sama selalu memberi frame yang sama. TIDAK ada yang digambar
// khusus untuk screenshot — semua lewat state/input yang sama dengan pemain.

import { createGame, startDay, stepGame } from './state.js';
import { takeFromCrate, stationAction } from './stations.js';

const STEP = 1 / 30;

function runFor(game, seconds) {
  const n = Math.round(seconds / STEP);
  for (let i = 0; i < n; i += 1) stepGame(game, STEP);
}

function doAct(game, fn) {
  const res = fn();
  if (res && res.message) { game.message = res.message; game.messageT = 2.5; }
  return res;
}

// Susun satu resep lengkap di wajan/panci sampai jadi masakan di tangan:
// ambil base + bahan (cincang dulu bila perlu) -> masak -> angkat.
function cookRecipe(game, base, mains, method) {
  doAct(game, () => takeFromCrate(game, base));
  doAct(game, () => stationAction(game, method === 'wok' ? 'wok' : 'pot'));
  for (const m of mains) {
    doAct(game, () => takeFromCrate(game, m));
    const choppable = ['ayam', 'udang', 'sayur', 'cabai'].includes(m);
    if (choppable) {
      doAct(game, () => stationAction(game, 'board'));
      doAct(game, () => stationAction(game, 'board'));
      doAct(game, () => stationAction(game, 'board'));
      doAct(game, () => stationAction(game, 'board'));
    }
    doAct(game, () => stationAction(game, method === 'wok' ? 'wok' : 'pot'));
  }
  doAct(game, () => stationAction(game, method === 'wok' ? 'wok' : 'pot')); // mulai masak
  // Aduk berkala saat menggoreng (penanda hijau dilewati berkali-kali).
  for (let i = 0; i < 14; i += 1) {
    runFor(game, 0.5);
    if (game.stations.wok.cooking) doAct(game, () => stationAction(game, 'wok'));
  }
  runFor(game, 1);
  doAct(game, () => stationAction(game, method === 'wok' ? 'wok' : 'pot')); // angkat
}

function placeOnPlate(game, toppings = []) {
  doAct(game, () => stationAction(game, 'plate'));
  for (const t of toppings) {
    doAct(game, () => takeFromCrate(game, t));
    if (t === 'cabai') {
      doAct(game, () => stationAction(game, 'board'));
      doAct(game, () => stationAction(game, 'board'));
      doAct(game, () => stationAction(game, 'board'));
      doAct(game, () => stationAction(game, 'board'));
    }
    doAct(game, () => stationAction(game, 'plate'));
  }
}

// Pesanan palsu yang deterministik untuk adegan (langsung ke state, memakai
// resep & tipe pelanggan yang sama dengan spawnOrder).
function seedOrders(game, specs) {
  game.orders = specs.map((s, i) => ({
    id: 100 + i,
    recipe: s.recipe,
    type: s.type,
    ctype: s.ctype,
    patience: s.patience,
    maxPatience: s.maxPatience,
  }));
  game.spawnTimer = 999;
}

function freezeClock(game, dayTime) {
  game.dayTime = dayTime;
}

export function stageShot(name, game, recipes) {
  const byId = (id) => recipes.find((r) => r.id === id);
  const biasa = { name: 'Pelanggan', tip: 1.0, patienceMul: 1.0, color: '#4f9da6', hat: 'cap' };
  const ojek = { name: 'Abang Ojek', tip: 0.8, patienceMul: 0.7, color: '#2e7d32', hat: 'helmet' };
  const ibu = { name: 'Ibu-ibu', tip: 1.1, patienceMul: 1.3, color: '#c2185b', hat: 'bun' };
  const kritikus = { name: 'Kritikus', tip: 2.0, patienceMul: 0.6, color: '#5d4037', hat: 'hat' };

  if (name === 'orders') {
    // Hari 2 awal: 4 tiket di papan, pelanggan menunggu, peti penuh.
    startDay(game);
    game.day = 2;
    startDay(game);
    seedOrders(game, [
      { recipe: byId('nasgor-ayam'), type: 'biasa', ctype: biasa, patience: 40, maxPatience: 44 },
      { recipe: byId('mie-ayam'), type: 'ojek', ctype: ojek, patience: 26, maxPatience: 31 },
      { recipe: byId('nasgor-pedas'), type: 'ibu', ctype: ibu, patience: 50, maxPatience: 57 },
      { recipe: byId('mie-seafood'), type: 'biasa', ctype: biasa, patience: 30, maxPatience: 44 },
    ]);
    freezeClock(game, 96);
    runFor(game, 0.5);
    return { screen: 'play', best: 0 };
  }

  if (name === 'cooking') {
    // Hari 4: wajan sedang menggoreng + talenan berisi ayam cincang + piring
    // berisi masakan yang sedang dirakit (base + 1 topping).
    game.day = 4;
    startDay(game);
    seedOrders(game, [
      { recipe: byId('nasgor-komplit'), type: 'kritikus', ctype: kritikus, patience: 14, maxPatience: 24 },
      { recipe: byId('ayam-geprek'), type: 'biasa', ctype: biasa, patience: 30, maxPatience: 36 },
      { recipe: byId('mie-pedas'), type: 'ojek', ctype: ojek, patience: 18, maxPatience: 25 },
    ]);
    freezeClock(game, 61);
    // Masak NasGor Ayam sampai jadi, letakkan di piring + topping kecap.
    cookRecipe(game, 'nasi', ['ayam', 'telur'], 'wok');
    placeOnPlate(game, ['kecap']);
    // Ambil kembali? Tidak — biarkan di piring (mid-assembly). Lalu mulai
    // masakan kedua di wajan (nasi + cabai) dan cincang ayam di talenan.
    doAct(game, () => takeFromCrate(game, 'nasi'));
    doAct(game, () => stationAction(game, 'wok'));
    doAct(game, () => takeFromCrate(game, 'cabai'));
    doAct(game, () => stationAction(game, 'board'));
    doAct(game, () => stationAction(game, 'board'));
    doAct(game, () => stationAction(game, 'board'));
    doAct(game, () => stationAction(game, 'board'));
    doAct(game, () => stationAction(game, 'wok'));
    doAct(game, () => stationAction(game, 'wok')); // mulai menggoreng
    runFor(game, 2.5);
    doAct(game, () => stationAction(game, 'wok')); // aduk
    game.dayCoins = 186;
    game.combo = 3;
    freezeClock(game, 58);
    return { screen: 'play', best: 0 };
  }

  if (name === 'serve') {
    // Hari 5, detik-detik akhir: hidangan komplit di tangan siap diantar,
    // pelanggan kritikus menunggu, koin hampir mencapai target.
    game.day = 5;
    startDay(game);
    seedOrders(game, [
      { recipe: byId('nasgor-komplit'), type: 'kritikus', ctype: kritikus, patience: 9, maxPatience: 20 },
      { recipe: byId('mie-spesial'), type: 'biasa', ctype: biasa, patience: 22, maxPatience: 33 },
    ]);
    freezeClock(game, 12);
    cookRecipe(game, 'nasi', ['ayam', 'udang', 'telur', 'sayur'], 'wok');
    placeOnPlate(game, []);
    doAct(game, () => stationAction(game, 'plate')); // ambil hidangan
    game.dayCoins = 402;
    game.combo = 5;
    game.mouse = { x: 1160, y: 148 };
    freezeClock(game, 11);
    return { screen: 'play', best: 0 };
  }

  // cover (default): Hari 3 tengah rush — semua elemen wajib terlihat:
  // papan pesanan penuh, bahan di meja, wajan menggoreng, hidangan dirakit
  // di piring, timer berjalan, pelanggan menunggu, kombo menyala.
  game.day = 3;
  startDay(game);
  seedOrders(game, [
    { recipe: byId('nasgor-pedas'), type: 'kritikus', ctype: kritikus, patience: 12, maxPatience: 24 },
    { recipe: byId('ayam-geprek'), type: 'biasa', ctype: biasa, patience: 28, maxPatience: 40 },
    { recipe: byId('mie-rebus'), type: 'ibu', ctype: ibu, patience: 44, maxPatience: 52 },
  ]);
  freezeClock(game, 45);
  // Rakit NasGor Ayam di piring (tanpa diambil) — hidangan mid-assembly.
  cookRecipe(game, 'nasi', ['ayam', 'telur'], 'wok');
  placeOnPlate(game, ['kecap']);
  // Mulai masakan kedua di wajan + cincang sayur di talenan.
  doAct(game, () => takeFromCrate(game, 'nasi'));
  doAct(game, () => stationAction(game, 'wok'));
  doAct(game, () => takeFromCrate(game, 'sayur'));
  doAct(game, () => stationAction(game, 'board'));
  doAct(game, () => stationAction(game, 'board'));
  doAct(game, () => stationAction(game, 'board'));
  doAct(game, () => stationAction(game, 'board'));
  doAct(game, () => stationAction(game, 'wok'));
  doAct(game, () => stationAction(game, 'wok')); // mulai menggoreng
  runFor(game, 2);
  doAct(game, () => stationAction(game, 'wok')); // aduk
  game.dayCoins = 238;
  game.combo = 2;
  freezeClock(game, 44);
  return { screen: 'play', best: 0 };
}

export function createShotGame(seed, name, recipes) {
  const game = createGame(seed);
  game.screen = 'play';
  stageShot(name, game, recipes);
  game.time = 12; // waktu render beku (animasi lampu stabil)
  return game;
}
