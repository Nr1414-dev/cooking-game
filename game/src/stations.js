// Aksi pemain di stasiun WARUNG RAME. Setiap fungsi mengembalikan
// { ok, message } — input.js memanggilnya dari klik/keyboard, shots.js
// memakainya untuk memainkan aturan nyata maju (adegan screenshot).

import { INGREDIENTS, CHOP_HITS, STIR_ZONE } from './config.js';
import { makeItem, itemLabel, matchRecipe, serveDish } from './state.js';

function note(game, text, t = 2) {
  game.message = text;
  game.messageT = t;
}

function burst(game, x, y, color, n = 8) {
  for (let i = 0; i < n; i += 1) {
    game.particles.push({
      x, y,
      vx: (game.rng() - 0.5) * 140, vy: -40 - game.rng() * 90,
      t: 0, life: 0.5 + game.rng() * 0.4, color,
      r: 2 + game.rng() * 3,
    });
  }
}

// --- Peti bahan ---------------------------------------------------------------
export function takeFromCrate(game, kind) {
  if (game.hand) return { ok: false, message: 'Tangan sudah penuh — letakkan dulu.' };
  game.hand = makeItem(kind, 'raw');
  return { ok: true, message: `${INGREDIENTS[kind].name} diambil.` };
}

// --- Talenan ------------------------------------------------------------------
export function useBoard(game) {
  const b = game.stations.board;
  if (!b.item) {
    if (!game.hand) return { ok: false, message: 'Talenan kosong — bawa bahan yang bisa dicincang.' };
    if (!INGREDIENTS[game.hand.kind].choppable || game.hand.form !== 'raw') {
      return { ok: false, message: `${itemLabel(game.hand)} tidak perlu dicincang.` };
    }
    b.item = game.hand;
    b.hits = 0;
    game.hand = null;
    return { ok: true, message: `${itemLabel(b.item)} di talenan — tebas 3x!` };
  }
  b.hits += 1;
  burst(game, 390, 360, '#f2c94c', 6);
  if (b.hits >= CHOP_HITS) {
    const done = makeItem(b.item.kind, 'chopped');
    game.hand = done;
    b.item = null;
    b.hits = 0;
    return { ok: true, message: `${itemLabel(done)} siap!` };
  }
  return { ok: true, message: `Tebas! (${b.hits}/${CHOP_HITS})` };
}

// --- Wajan --------------------------------------------------------------------
function wokContents(game) {
  return game.stations.wok.items;
}

export function useWok(game) {
  const w = game.stations.wok;
  if (w.burnt) {
    game.hand = makeItem('gosong', 'burnt');
    w.items = [];
    w.burnt = false;
    w.t = 0;
    return { ok: true, message: 'Angkat yang gosong — buang ke tong sampah.' };
  }
  if (w.done) {
    const base = w.items.find((i) => i.kind === 'nasi' || i.kind === 'mie');
    const mains = w.items.filter((i) => i.kind !== 'nasi' && i.kind !== 'mie').map((i) => i.kind);
    const dish = {
      id: 0, form: 'dish', base: base ? base.kind : 'nasi', method: 'wok',
      mains, toppings: [], name: '',
    };
    const recipe = matchRecipe({ ...dish, toppings: [] });
    dish.name = recipe ? recipe.name : `Masakan ${dish.base === 'nasi' ? 'nasi' : 'mie'}`;
    game.hand = dish;
    w.items = [];
    w.done = false;
    w.cooking = false;
    w.t = 0;
    return { ok: true, message: `${dish.name} diangkat — bawa ke piring!` };
  }
  if (w.cooking) {
    // Aduk: penanda di zona hijau = aduk sempurna (cepat + bonus).
    const z = w.stir;
    if (z >= STIR_ZONE[0] && z <= STIR_ZONE[1]) {
      w.perfect += 1;
      burst(game, 595, 340, '#58b368', 8);
      return { ok: true, message: 'Adukan sempurna! (+cepat matang)' };
    }
    burst(game, 595, 340, '#e5484d', 4);
    return { ok: true, message: 'Aduk! (tunggu penanda di zona hijau)' };
  }
  // Belum memasak: masukkan bahan dari tangan, atau mulai masak.
  if (game.hand) {
    const it = game.hand;
    const isBase = it.kind === 'nasi' || it.kind === 'mie';
    const isMain = ['ayam', 'udang', 'sayur', 'cabai', 'telur'].includes(it.kind);
    const hasBase = w.items.some((i) => i.kind === 'nasi' || i.kind === 'mie');
    if (isBase && hasBase) return { ok: false, message: 'Wajan sudah ada base-nya.' };
    if (isBase) { w.items.push(it); game.hand = null; return { ok: true, message: `${itemLabel(it)} masuk wajan.` }; }
    if (isMain) {
      if (INGREDIENTS[it.kind].choppable && it.form !== 'chopped') {
        return { ok: false, message: `${itemLabel(it)} harus dicincang dulu di talenan!` };
      }
      if (!hasBase) return { ok: false, message: 'Masukkan nasi/mie dulu sebagai base.' };
      if (w.items.length >= 5) return { ok: false, message: 'Wajan penuh (maks 1 base + 4 bahan).' };
      w.items.push(it);
      game.hand = null;
      return { ok: true, message: `${itemLabel(it)} masuk wajan.` };
    }
    return { ok: false, message: `${itemLabel(it)} tidak dimasak di wajan.` };
  }
  // Tangan kosong + ada isi = mulai masak (atau masak telur saja jadi topping).
  if (w.items.length === 0) return { ok: false, message: 'Wajan kosong — masukkan nasi/mie + bahan.' };
  const hasBase = w.items.some((i) => i.kind === 'nasi' || i.kind === 'mie');
  if (!hasBase && w.items.length === 1 && w.items[0].kind === 'telur') {
    w.cooking = true;
    w.t = 0;
    return { ok: true, message: 'Menggoreng telur...' };
  }
  if (!hasBase) return { ok: false, message: 'Butuh nasi/mie sebagai base.' };
  w.cooking = true;
  w.t = 0;
  w.perfect = 0;
  return { ok: true, message: 'Menggoreng! Aduk saat penanda di zona hijau.' };
}

// Telur goreng dari wajan (topping): wajan berisi 1 telur saja.
export function wokSingleEgg(game) {
  const w = game.stations.wok;
  if (w.done && w.items.length === 1 && w.items[0].kind === 'telur') {
    game.hand = makeItem('telur', 'fried');
    w.items = [];
    w.done = false;
    w.cooking = false;
    w.t = 0;
    return { ok: true, message: 'Telur goreng siap — jadi topping!' };
  }
  return null;
}

// --- Panci --------------------------------------------------------------------
export function usePot(game) {
  const p = game.stations.pot;
  if (p.burnt) {
    game.hand = makeItem('gosong', 'burnt');
    p.items = [];
    p.burnt = false;
    p.t = 0;
    return { ok: true, message: 'Angkat yang lembek — buang ke tong sampah.' };
  }
  if (p.done) {
    const base = p.items.find((i) => i.kind === 'mie');
    if (base) {
      const mains = p.items.filter((i) => i.kind !== 'mie').map((i) => i.kind);
      const dish = { id: 0, form: 'dish', base: 'mie', method: 'pot', mains, toppings: [], name: '' };
      const recipe = matchRecipe({ ...dish, toppings: [] });
      dish.name = recipe ? recipe.name : 'Mie rebus';
      game.hand = dish;
    } else {
      game.hand = makeItem('telur', 'boiled');
    }
    p.items = [];
    p.done = false;
    p.cooking = false;
    p.t = 0;
    return { ok: true, message: `${itemLabel(game.hand)} diangkat!` };
  }
  if (p.cooking) return { ok: true, message: 'Masih merebus... tunggu ding!' };
  if (game.hand) {
    const it = game.hand;
    if (it.kind === 'mie') {
      if (p.items.some((i) => i.kind === 'mie')) return { ok: false, message: 'Panci sudah ada mie-nya.' };
      p.items.push(it);
      game.hand = null;
      return { ok: true, message: 'Mie masuk panci.' };
    }
    if (it.kind === 'telur' && it.form === 'raw') {
      if (p.items.some((i) => i.kind === 'telur')) return { ok: false, message: 'Panci sudah ada telurnya.' };
      if (p.items.length >= 2) return { ok: false, message: 'Panci penuh.' };
      p.items.push(it);
      game.hand = null;
      return { ok: true, message: 'Telur masuk panci.' };
    }
    return { ok: false, message: `${itemLabel(it)} tidak direbus di panci.` };
  }
  if (p.items.length === 0) return { ok: false, message: 'Panci kosong — masukkan mie/telur.' };
  p.cooking = true;
  p.t = 0;
  return { ok: true, message: 'Merebus... tunggu sampai ding!' };
}

// --- Piring (rakit hidangan) ---------------------------------------------------
export function usePlate(game) {
  const pl = game.stations.plate;
  if (!pl.dish) {
    if (!game.hand) return { ok: false, message: 'Piring kosong — bawa masakan dari wajan/panci.' };
    if (game.hand.form !== 'dish') return { ok: false, message: `${itemLabel(game.hand)} bukan masakan — masak dulu!` };
    pl.dish = game.hand;
    pl.toppings = [];
    game.hand = null;
    const recipe = matchRecipe({ ...pl.dish, toppings: [] });
    return { ok: true, message: recipe ? `${recipe.name} di piring.` : `${pl.dish.name} di piring — tambah topping?` };
  }
  // Piring sudah ada masakan: tambah topping, atau ambil kembali.
  if (game.hand) {
    const it = game.hand;
    const isTopping = (it.kind === 'kecap' && it.form === 'raw')
      || (it.kind === 'cabai' && it.form === 'chopped')
      || (it.kind === 'telur' && (it.form === 'fried' || it.form === 'boiled'));
    if (!isTopping) return { ok: false, message: `${itemLabel(it)} bukan topping.` };
    if (pl.toppings.includes(it.kind)) return { ok: false, message: 'Topping itu sudah ada di piring.' };
    if (pl.toppings.length >= 2) return { ok: false, message: 'Piring sudah 2 topping.' };
    pl.toppings.push(it.kind);
    game.hand = null;
    return { ok: true, message: `${itemLabel(it)} ditambahkan.` };
  }
  // Ambil hidangan rakitan.
  const dish = { ...pl.dish, toppings: pl.toppings.slice() };
  const recipe = matchRecipe(dish);
  dish.name = recipe ? recipe.name : dish.name;
  game.hand = { ...dish, form: 'plated', dishName: dish.name };
  pl.dish = null;
  pl.toppings = [];
  return { ok: true, message: `${dish.name} siap diantar!` };
}

// --- Jendela saji ---------------------------------------------------------------
export function useServe(game) {
  if (!game.hand || game.hand.form !== 'plated') {
    return { ok: false, message: 'Bawa hidangan yang sudah dirakit di piring.' };
  }
  const res = serveDish(game, { ...game.hand, form: 'dish' });
  if (!res.ok) return { ok: false, message: res.reason };
  game.hand = null;
  burst(game, 1160, 130, '#f2c94c', 12);
  return { ok: true, message: game.message };
}

// --- Tong sampah -----------------------------------------------------------------
export function useTrash(game) {
  if (!game.hand) return { ok: false, message: 'Tidak ada yang dibuang.' };
  const label = itemLabel(game.hand);
  game.hand = null;
  return { ok: true, message: `${label} dibuang.` };
}

export function stationAction(game, station) {
  switch (station) {
    case 'board': return useBoard(game);
    case 'wok': {
      const egg = wokSingleEgg(game);
      if (egg) return egg;
      return useWok(game);
    }
    case 'pot': return usePot(game);
    case 'plate': return usePlate(game);
    case 'serve': return useServe(game);
    case 'trash': return useTrash(game);
    default: return { ok: false, message: '' };
  }
}
