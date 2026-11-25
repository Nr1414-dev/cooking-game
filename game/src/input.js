// Input WARUNG RAME: klik mouse + keyboard. Hit-test memakai rect yang sama
// dengan yang digambar render.js (satu sumber: layoutFor di render.js).

import { LAYOUT, CRATE_ORDER } from './config.js';
import { stationAction, takeFromCrate } from './stations.js';
import { startDay, nextDay, retryDay } from './state.js';

export function crateRect(index) {
  const area = LAYOUT.crates;
  const cols = 4;
  const cw = area.w / cols;
  const ch = area.h / 2;
  const col = index % cols;
  const row = Math.floor(index / cols);
  return { x: area.x + col * cw + 4, y: area.y + row * ch + 4, w: cw - 8, h: ch - 8 };
}

export function pointInRect(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

// Cari stasiun/peti di titik (x, y) canvas.
export function hitAt(x, y) {
  if (pointInRect(x, y, LAYOUT.board)) return { type: 'board' };
  if (pointInRect(x, y, LAYOUT.wok)) return { type: 'wok' };
  if (pointInRect(x, y, LAYOUT.pot)) return { type: 'pot' };
  if (pointInRect(x, y, LAYOUT.plate)) return { type: 'plate' };
  if (pointInRect(x, y, LAYOUT.serve)) return { type: 'serve' };
  if (pointInRect(x, y, LAYOUT.trash)) return { type: 'trash' };
  for (let i = 0; i < CRATE_ORDER.length; i += 1) {
    if (pointInRect(x, y, crateRect(i))) return { type: 'crate', kind: CRATE_ORDER[i] };
  }
  return null;
}

function applyResult(game, res) {
  if (res && res.message) {
    game.message = res.message;
    game.messageT = 2.5;
  }
  return res;
}

export function clickAt(game, x, y) {
  if (game.screen === 'title') {
    startDay(game);
    return { ok: true };
  }
  if (game.screen === 'dayend') {
    nextDay(game);
    return { ok: true };
  }
  if (game.screen === 'gameover') {
    retryDay(game);
    return { ok: true };
  }
  if (game.screen === 'win') return { ok: true };
  if (game.screen !== 'play' || game.paused) return { ok: false };

  // Klik tiket pesanan: pilih untuk melihat detail resep di baris petunjuk.
  const board = LAYOUT.board;
  if (pointInRect(x, y, board)) {
    const idx = Math.floor((y - board.y - 34) / 62);
    const order = game.orders[idx];
    if (order) {
      game.selectedOrder = order.id;
      const r = order.recipe;
      const mains = r.mains.join(', ');
      const tops = r.toppings.length ? ` + topping: ${r.toppings.join(', ')}` : '';
      applyResult(game, { message: `${r.name} — ${r.base} (${r.method === 'wok' ? 'wajan' : 'panci'}) + ${mains}${tops} — Rp${r.price}` });
      return { ok: true };
    }
  }

  const hit = hitAt(x, y);
  if (!hit) return { ok: false };
  if (hit.type === 'crate') return applyResult(game, takeFromCrate(game, hit.kind));
  return applyResult(game, stationAction(game, hit.type));
}

export function keyDown(game, key) {
  const k = key.toLowerCase();
  if (k === 'm') { game.muted = !game.muted; return; }
  if (k === 'escape' || k === 'p') {
    if (game.screen === 'play') game.paused = !game.paused;
    return;
  }
  if (game.screen === 'title' && (k === 'enter' || k === ' ')) { startDay(game); return; }
  if (game.screen === 'dayend' && k === 'enter') { nextDay(game); return; }
  if (game.screen === 'gameover' && k === 'enter') { retryDay(game); return; }
  if (game.screen !== 'play' || game.paused) return;
  // 1-8: ambil bahan dari peti langsung ke tangan.
  const n = parseInt(k, 10);
  if (n >= 1 && n <= CRATE_ORDER.length) {
    applyResult(game, takeFromCrate(game, CRATE_ORDER[n - 1]));
  }
}
