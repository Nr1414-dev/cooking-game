// State game WARUNG RAME: pesanan, hari, skor, kombo, dan item.
// Tidak ada gambar di sini — hanya data dan aturan. Render di render.js,
// aksi pemain di stations.js, input di input.js.

import {
  DAYS, CUSTOMERS, CUSTOMER_POOL, RECIPES, unlockedRecipes,
  FRY_TIME, FRY_GRACE, BOIL_TIME, BOIL_GRACE, COMBO_STEP, COMBO_MAX,
} from './config.js';
import { makeRng, pick } from './random.js';

let nextOrderId = 1;
let nextItemId = 1;

export function makeItem(kind, form = 'raw') {
  return { id: nextItemId, kind, form };
}

export function itemLabel(item) {
  if (!item) return '';
  if (item.form === 'dish') return item.name || 'Masakan';
  if (item.form === 'plated') return item.dishName || 'Hidangan';
  if (item.form === 'burnt') return 'Gosong!';
  const names = {
    nasi: 'Nasi', mie: 'Mie', telur: 'Telur', ayam: 'Ayam', udang: 'Udang',
    sayur: 'Sayur', cabai: 'Cabai', kecap: 'Kecap',
  };
  const base = names[item.kind] || item.kind;
  if (item.form === 'chopped') return `${base} cincang`;
  if (item.form === 'fried') return 'Telur goreng';
  if (item.form === 'boiled') return item.kind === 'telur' ? 'Telur rebus' : 'Mie rebus';
  if (item.form === 'base') return `Masakan ${item.base === 'nasi' ? 'nasi' : 'mie'}`;
  return base;
}

// Cocokkan isi piring dengan resep: base + metode + bahan utama + topping.
export function matchRecipe(dish) {
  if (!dish || dish.form !== 'dish') return null;
  const mains = (dish.mains || []).slice().sort().join(',');
  const tops = (dish.toppings || []).slice().sort().join(',');
  return RECIPES.find((r) => (
    r.base === dish.base && r.method === dish.method
    && r.mains.slice().sort().join(',') === mains
    && r.toppings.slice().sort().join(',') === tops
  )) || null;
}

export function createGame(seed) {
  return {
    seed,
    rng: makeRng(seed),
    screen: 'title', // title | play | dayend | gameover | win
    day: 1,
    dayTime: 0,
    dayCoins: 0,
    totalCoins: 0,
    combo: 0,
    bestCombo: 0,
    served: 0,
    failed: 0,
    tips: 0,
    orders: [],
    spawnTimer: 4,
    hand: null,
    stations: {
      board: { item: null, hits: 0 },          // talenan
      wok: { items: [], cooking: false, t: 0, stir: 0, done: false, burnt: false, perfect: 0 },
      pot: { items: [], cooking: false, t: 0, done: false, burnt: false },
      plate: { dish: null, toppings: [] },
    },
    particles: [],
    floats: [],
    message: '',
    messageT: 0,
    paused: false,
    muted: false,
    dayResult: null,
    selectedOrder: null,
    time: 0,
  };
}

export function dayConfig(game) {
  return DAYS[game.day - 1];
}

export function startDay(game) {
  const cfg = dayConfig(game);
  game.dayTime = cfg.length;
  game.dayCoins = 0;
  game.combo = 0;
  game.orders = [];
  game.spawnTimer = 3;
  game.hand = null;
  game.stations.board = { item: null, hits: 0 };
  game.stations.wok = { items: [], cooking: false, t: 0, stir: 0, done: false, burnt: false, perfect: 0 };
  game.stations.pot = { items: [], cooking: false, t: 0, done: false, burnt: false };
  game.stations.plate = { dish: null, toppings: [] };
  game.screen = 'play';
  game.dayResult = null;
  game.message = `${cfg.name} — target Rp${cfg.target}!`;
  game.messageT = 3;
}

function spawnOrder(game) {
  const cfg = dayConfig(game);
  const pool = unlockedRecipes(game.day);
  const recipe = pool[Math.floor(game.rng() * pool.length)];
  const typePool = CUSTOMER_POOL[game.day] || CUSTOMER_POOL[1];
  const type = pick(game.rng, typePool);
  const ctype = CUSTOMERS[type];
  const patience = cfg.patience * ctype.patienceMul;
  game.orders.push({
    id: nextOrderId, recipe, type, ctype,
    patience, maxPatience: patience,
    x: 0, // diisi render (posisi pelanggan ke-n)
  });
  nextOrderId += 1;
}

export function failOrder(game, order, why) {
  game.orders = game.orders.filter((o) => o.id !== order.id);
  game.failed += 1;
  game.combo = 0;
  game.message = why || `${order.ctype.name} pergi — pesanan gagal!`;
  game.messageT = 2.5;
}

export function serveDish(game, dish) {
  const recipe = matchRecipe(dish);
  if (!recipe) return { ok: false, reason: 'Bukan resep yang dikenal — cek papan pesanan!' };
  const order = game.orders.find((o) => o.recipe.id === recipe.id);
  if (!order) return { ok: false, reason: `Tidak ada yang memesan ${recipe.name} saat ini.` };
  const patienceFrac = Math.max(0, order.patience / order.maxPatience);
  const tipMul = 1 + Math.min(game.combo * COMBO_STEP, COMBO_MAX - 1);
  const tip = Math.round(recipe.price * 0.5 * patienceFrac * order.ctype.tip * tipMul);
  const earned = recipe.price + tip;
  game.orders = game.orders.filter((o) => o.id !== order.id);
  game.dayCoins += earned;
  game.totalCoins += earned;
  game.tips += tip;
  game.served += 1;
  game.combo += 1;
  game.bestCombo = Math.max(game.bestCombo, game.combo);
  game.floats.push({ x: 1160, y: 150, text: `+Rp${earned}`, t: 0, color: '#f2c94c' });
  game.message = `${recipe.name} tersaji! +Rp${earned}${tip > 0 ? ` (tip Rp${tip})` : ''}`;
  game.messageT = 2;
  return { ok: true, earned, tip, recipe };
}

// Satu langkah simulasi (dt detik). Dipakai loop utama dan mode screenshot.
export function stepGame(game, dt) {
  if (game.screen !== 'play' || game.paused) return;
  game.time += dt;
  game.dayTime -= dt;

  // Pesanan baru
  const cfg = dayConfig(game);
  game.spawnTimer -= dt;
  if (game.spawnTimer <= 0 && game.orders.length < cfg.customers) {
    spawnOrder(game);
    game.spawnTimer = cfg.spawnEvery * (0.85 + game.rng() * 0.3);
  }

  // Kesabaran pelanggan
  for (const order of game.orders.slice()) {
    order.patience -= dt;
    if (order.patience <= 0) failOrder(game, order);
  }

  // Wajan: menggoreng
  const wok = game.stations.wok;
  if (wok.cooking && !wok.done) {
    wok.t += dt;
    wok.stir += dt * 0.55; // penanda aduk bergerak
    if (wok.stir > 1) wok.stir -= 1;
    if (wok.t >= FRY_TIME) {
      wok.done = true;
      wok.t = 0;
      game.message = 'Wajan matang! Angkat sebelum gosong!';
      game.messageT = 2;
    }
  } else if (wok.done) {
    wok.t += dt;
    if (wok.t >= FRY_GRACE) {
      wok.burnt = true;
      wok.done = false;
      game.message = 'Gosong! Buang ke tong sampah.';
      game.messageT = 2.5;
    }
  }

  // Panci: merebus
  const pot = game.stations.pot;
  if (pot.cooking && !pot.done) {
    pot.t += dt;
    if (pot.t >= BOIL_TIME) {
      pot.done = true;
      pot.t = 0;
      game.message = 'Panci matang! (ding!)';
      game.messageT = 2;
    }
  } else if (pot.done) {
    pot.t += dt;
    if (pot.t >= BOIL_GRACE) {
      pot.burnt = true;
      pot.done = false;
      game.message = 'Kelamaan — lembek/gosong! Buang.';
      game.messageT = 2.5;
    }
  }

  // Partikel & teks melayang
  for (const p of game.particles) { p.x += p.vx * dt; p.y += p.vy * dt; p.t += dt; }
  game.particles = game.particles.filter((p) => p.t < p.life);
  for (const f of game.floats) { f.y -= 30 * dt; f.t += dt; }
  game.floats = game.floats.filter((f) => f.t < 1.2);
  if (game.messageT > 0) game.messageT -= dt;

  // Akhir hari
  if (game.dayTime <= 0) {
    game.dayTime = 0;
    const passed = game.dayCoins >= cfg.target;
    game.dayResult = {
      passed,
      earned: game.dayCoins,
      target: cfg.target,
      served: game.served,
      failed: game.failed,
      bestCombo: game.bestCombo,
    };
    if (passed && game.day >= DAYS.length) {
      game.screen = 'win';
    } else if (passed) {
      game.screen = 'dayend';
    } else {
      game.screen = 'gameover';
    }
  }
}

export function nextDay(game) {
  game.day += 1;
  game.served = 0;
  game.failed = 0;
  game.bestCombo = Math.max(game.bestCombo, 0);
  startDay(game);
}

export function retryDay(game) {
  game.totalCoins -= game.dayCoins;
  game.served = 0;
  game.failed = 0;
  startDay(game);
}
