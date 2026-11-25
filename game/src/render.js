// Render WARUNG RAME: semua gambar digambar dengan canvas 2D (vektor datar,
// tanpa aset luar). Satu-satunya sumber kebenaran visual — screenshot juri
// berasal dari sini.

import { VIEW_W, VIEW_H, PALETTE, LAYOUT, INGREDIENTS, CRATE_ORDER, DAYS, STIR_ZONE } from './config.js';
import { itemLabel } from './state.js';
import { crateRect } from './input.js';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, s, x, y, size, color, align = 'left', weight = 'bold') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px system-ui, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}

// --- Ikon bahan (vektor, tanpa emoji) ----------------------------------------
export function drawItemIcon(ctx, kind, form, x, y, s) {
  const c = INGREDIENTS[kind] || { color: '#ccc', dark: '#999' };
  ctx.save();
  ctx.translate(x, y);
  if (kind === 'nasi') {
    ctx.fillStyle = '#fff8e7';
    ctx.beginPath(); ctx.ellipse(0, 2, s * 0.52, s * 0.34, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e8d9a8';
    for (let i = 0; i < 5; i += 1) { ctx.beginPath(); ctx.arc(-s * 0.3 + i * s * 0.15, -s * 0.08, s * 0.06, 0, Math.PI * 2); ctx.fill(); }
  } else if (kind === 'mie') {
    ctx.strokeStyle = '#f2c94c'; ctx.lineWidth = s * 0.09; ctx.lineCap = 'round';
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.moveTo(-s * 0.4, -s * 0.2 + i * s * 0.22);
      ctx.bezierCurveTo(-s * 0.1, -s * 0.35 + i * s * 0.22, s * 0.1, -s * 0.05 + i * s * 0.22, s * 0.4, -s * 0.2 + i * s * 0.22);
      ctx.stroke();
    }
  } else if (kind === 'telur') {
    if (form === 'fried') {
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.ellipse(0, 0, s * 0.5, s * 0.38, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f2a007';
      ctx.beginPath(); ctx.arc(0, 0, s * 0.2, 0, Math.PI * 2); ctx.fill();
    } else if (form === 'boiled') {
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.ellipse(0, 0, s * 0.34, s * 0.44, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#d9c49a'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(0, 0, s * 0.34, s * 0.44, 0, 0, Math.PI * 2); ctx.stroke();
    } else {
      ctx.fillStyle = '#fff7e0';
      ctx.beginPath(); ctx.ellipse(0, 0, s * 0.34, s * 0.44, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#e8d9a8';
      ctx.beginPath(); ctx.ellipse(0, -s * 0.1, s * 0.2, s * 0.28, 0, 0, Math.PI * 2); ctx.fill();
    }
  } else if (kind === 'ayam') {
    ctx.fillStyle = c.color;
    ctx.beginPath(); ctx.ellipse(-s * 0.08, 0, s * 0.36, s * 0.3, -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(s * 0.3, -s * 0.28, s * 0.1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(s * 0.38, -s * 0.16, s * 0.08, 0, Math.PI * 2); ctx.fill();
    if (form === 'chopped') {
      ctx.strokeStyle = c.dark; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-s * 0.3, -s * 0.1); ctx.lineTo(s * 0.15, s * 0.15); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s * 0.1, -s * 0.25); ctx.lineTo(s * 0.3, s * 0.05); ctx.stroke();
    }
  } else if (kind === 'udang') {
    ctx.strokeStyle = c.color; ctx.lineWidth = s * 0.16; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(0, 0, s * 0.32, Math.PI * 0.15, Math.PI * 1.25); ctx.stroke();
    ctx.fillStyle = c.dark;
    ctx.beginPath(); ctx.moveTo(s * 0.3, -s * 0.28); ctx.lineTo(s * 0.44, -s * 0.1); ctx.lineTo(s * 0.22, -s * 0.08); ctx.closePath(); ctx.fill();
  } else if (kind === 'sayur') {
    ctx.fillStyle = c.color;
    ctx.beginPath(); ctx.ellipse(0, 0, s * 0.4, s * 0.26, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = c.dark; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-s * 0.3, 0); ctx.lineTo(s * 0.3, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -s * 0.2); ctx.lineTo(0, s * 0.2); ctx.stroke();
  } else if (kind === 'cabai') {
    ctx.fillStyle = c.color;
    ctx.beginPath();
    ctx.moveTo(-s * 0.4, -s * 0.1);
    ctx.quadraticCurveTo(0, s * 0.42, s * 0.42, -s * 0.18);
    ctx.quadraticCurveTo(0, s * 0.12, -s * 0.4, -s * 0.1);
    ctx.fill();
    ctx.fillStyle = '#4d8f57';
    ctx.fillRect(s * 0.32, -s * 0.3, s * 0.14, s * 0.16);
  } else if (kind === 'kecap') {
    ctx.fillStyle = '#3c2417';
    rr(ctx, -s * 0.22, -s * 0.4, s * 0.44, s * 0.8, s * 0.1); ctx.fill();
    ctx.fillStyle = '#f2c94c';
    ctx.fillRect(-s * 0.22, -s * 0.1, s * 0.44, s * 0.2);
    ctx.fillStyle = '#5b3a29';
    ctx.fillRect(-s * 0.1, -s * 0.52, s * 0.2, s * 0.14);
  } else if (kind === 'gosong') {
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.arc(0, 0, s * 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#555';
    ctx.beginPath(); ctx.arc(-s * 0.12, -s * 0.1, s * 0.12, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// --- Pelanggan ------------------------------------------------------------------
function drawCustomer(ctx, order, x, y, s) {
  const ctype = order.ctype;
  const frac = Math.max(0, order.patience / order.maxPatience);
  const ringColor = frac > 0.5 ? PALETTE.green : frac > 0.25 ? PALETTE.gold : PALETTE.red;
  // Badan
  ctx.fillStyle = ctype.color;
  rr(ctx, x - s * 0.32, y - s * 0.1, s * 0.64, s * 0.62, s * 0.12);
  ctx.fill();
  // Kepala
  ctx.fillStyle = '#f2c89b';
  ctx.beginPath(); ctx.arc(x, y - s * 0.34, s * 0.26, 0, Math.PI * 2); ctx.fill();
  // Topi
  ctx.fillStyle = ctype.color;
  if (ctype.hat === 'helmet') {
    ctx.beginPath(); ctx.arc(x, y - s * 0.4, s * 0.28, Math.PI, 0); ctx.fill();
    ctx.fillRect(x - s * 0.28, y - s * 0.42, s * 0.56, s * 0.08);
  } else if (ctype.hat === 'hat') {
    ctx.fillRect(x - s * 0.3, y - s * 0.56, s * 0.6, s * 0.08);
    ctx.fillRect(x - s * 0.16, y - s * 0.78, s * 0.32, s * 0.24);
  } else if (ctype.hat === 'bun') {
    ctx.beginPath(); ctx.arc(x, y - s * 0.58, s * 0.12, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.beginPath(); ctx.arc(x, y - s * 0.42, s * 0.27, Math.PI, 0); ctx.fill();
  }
  // Mata
  ctx.fillStyle = '#222';
  ctx.beginPath(); ctx.arc(x - s * 0.09, y - s * 0.34, s * 0.035, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + s * 0.09, y - s * 0.34, s * 0.035, 0, Math.PI * 2); ctx.fill();
  // Cincin kesabaran
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(x, y - s * 0.34, s * 0.42, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = ringColor;
  ctx.beginPath(); ctx.arc(x, y - s * 0.34, s * 0.42, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac); ctx.stroke();
  // Nama + harga pesanan
  text(ctx, order.ctype.name, x, y + s * 0.68, 12, PALETTE.cream, 'center');
  text(ctx, `Rp${order.recipe.price}`, x, y + s * 0.88, 12, PALETTE.gold, 'center');
}

// --- Stasiun ---------------------------------------------------------------------
function stationShell(ctx, r, label, active) {
  ctx.fillStyle = PALETTE.woodDark;
  rr(ctx, r.x - 3, r.y - 3, r.w + 6, r.h + 6, 10);
  ctx.fill();
  ctx.fillStyle = active ? '#9c6b42' : PALETTE.counter;
  rr(ctx, r.x, r.y, r.w, r.h, 8);
  ctx.fill();
  ctx.fillStyle = PALETTE.counterTop;
  rr(ctx, r.x, r.y, r.w, 26, 8);
  ctx.fill();
  text(ctx, label, r.x + r.w / 2, r.y + 13, 14, '#fff3d6', 'center');
}

function progressBar(ctx, x, y, w, frac, color) {
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  rr(ctx, x, y, w, 12, 6);
  ctx.fill();
  ctx.fillStyle = color;
  if (frac > 0) { rr(ctx, x, y, Math.max(10, w * frac), 12, 6); ctx.fill(); }
}

// --- Gambar utama ------------------------------------------------------------------
export function render(ctx, game) {
  const W = VIEW_W;
  const H = VIEW_H;
  // Latar malam pasar
  ctx.fillStyle = PALETTE.night;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = PALETTE.night2;
  ctx.fillRect(0, 56, W, 134);
  // Lampu gantung
  for (let i = 0; i < 7; i += 1) {
    const lx = 90 + i * 185;
    ctx.strokeStyle = '#000';
    ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx, 26); ctx.stroke();
    ctx.fillStyle = i % 2 ? '#ffb347' : '#ff8a5c';
    ctx.beginPath(); ctx.arc(lx, 34, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,179,71,0.15)';
    ctx.beginPath(); ctx.arc(lx, 34, 26, 0, Math.PI * 2); ctx.fill();
  }

  if (game.screen === 'title') { drawTitle(ctx, game); return; }
  if (game.screen === 'dayend') { drawDayEnd(ctx, game, true); return; }
  if (game.screen === 'gameover') { drawDayEnd(ctx, game, false); return; }
  if (game.screen === 'win') { drawWin(ctx, game); return; }

  drawHud(ctx, game);
  drawBoard(ctx, game);
  drawCustomers(ctx, game);
  drawServe(ctx, game);
  drawStations(ctx, game);
  drawCrates(ctx, game);
  drawTrash(ctx, game);
  drawParticles(ctx, game);
  drawHand(ctx, game);
  drawHint(ctx, game);
  if (game.paused) {
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, W, H);
    text(ctx, 'JEDA — tekan Esc untuk lanjut', W / 2, H / 2, 30, '#fff', 'center');
  }
}

function drawHud(ctx, game) {
  const cfg = DAYS[game.day - 1];
  const r = LAYOUT.hud;
  ctx.fillStyle = '#0f1820';
  ctx.fillRect(r.x, r.y, r.w, r.h);
  text(ctx, 'WARUNG RAME', 16, 28, 24, PALETTE.amber);
  text(ctx, `${cfg.name}`, 220, 28, 16, PALETTE.cream);
  // Timer hari
  const frac = Math.max(0, game.dayTime / cfg.length);
  text(ctx, `Waktu ${Math.ceil(game.dayTime)} dtk`, 470, 20, 15, PALETTE.cream);
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  rr(ctx, 470, 32, 220, 10, 5); ctx.fill();
  ctx.fillStyle = frac > 0.4 ? PALETTE.green : frac > 0.2 ? PALETTE.gold : PALETTE.red;
  rr(ctx, 470, 32, Math.max(8, 220 * frac), 10, 5); ctx.fill();
  // Koin / target
  const ok = game.dayCoins >= cfg.target;
  text(ctx, `Rp ${game.dayCoins} / ${cfg.target}`, 760, 28, 20, ok ? PALETTE.green : PALETTE.gold);
  // Kombo
  text(ctx, game.combo > 1 ? `KOMBO x${(1 + Math.min(game.combo * 0.1, 1)).toFixed(1)} (${game.combo})` : 'KOMBO —', 980, 28, 16, game.combo > 1 ? '#ff8a5c' : PALETTE.muted);
  text(ctx, game.muted ? 'Suara: M (mati)' : 'Suara: M', 1220, 28, 14, PALETTE.muted, 'right');
}

function drawBoard(ctx, game) {
  const r = LAYOUT.board;
  ctx.fillStyle = PALETTE.wood;
  rr(ctx, r.x, r.y, r.w, r.h, 10);
  ctx.fill();
  text(ctx, 'PAPAN PESANAN', r.x + r.w / 2, r.y + 16, 15, '#ffe9b0', 'center');
  if (game.orders.length === 0) {
    text(ctx, 'Belum ada pesanan...', r.x + r.w / 2, r.y + 90, 14, PALETTE.cream, 'center');
    text(ctx, 'Pelanggan segera datang!', r.x + r.w / 2, r.y + 116, 13, PALETTE.muted, 'center');
  }
  game.orders.slice(0, 4).forEach((order, i) => {
    const y = r.y + 34 + i * 62;
    const frac = Math.max(0, order.patience / order.maxPatience);
    const sel = game.selectedOrder === order.id;
    ctx.fillStyle = sel ? '#fff3d6' : PALETTE.paper;
    rr(ctx, r.x + 8, y, r.w - 16, 54, 8);
    ctx.fill();
    ctx.fillStyle = order.ctype.color;
    ctx.fillRect(r.x + 8, y, 6, 54);
    // Nama hidangan, dipotong dengan "…" bila tidak muat sebelum ikon bahan.
    const parts = [order.recipe.base, ...order.recipe.mains, ...order.recipe.toppings].slice(0, 4);
    const iconW = parts.length * 22;
    const nameMax = r.w - 16 - 14 - iconW;
    let name = order.recipe.name;
    ctx.font = 'bold 12px system-ui, sans-serif';
    while (name.length > 4 && ctx.measureText(name).width > nameMax) {
      name = name.slice(0, -2);
    }
    if (name !== order.recipe.name) name += '…';
    text(ctx, name, r.x + 22, y + 14, 12, PALETTE.ink);
    text(ctx, `Rp${order.recipe.price} • ${order.ctype.name}`, r.x + 22, y + 32, 12, PALETTE.muted);
    // Ikon bahan utama
    let ix = r.x + r.w - 20;
    for (let k = parts.length - 1; k >= 0; k -= 1) {
      drawItemIcon(ctx, parts[k], parts[k] === 'ayam' || parts[k] === 'udang' || parts[k] === 'sayur' || parts[k] === 'cabai' ? 'chopped' : 'raw', ix, y + 16, 14);
      ix -= 22;
    }
    // Bar kesabaran
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    rr(ctx, r.x + 22, y + 44, r.w - 44, 6, 3); ctx.fill();
    ctx.fillStyle = frac > 0.5 ? PALETTE.green : frac > 0.25 ? PALETTE.gold : PALETTE.red;
    rr(ctx, r.x + 22, y + 44, Math.max(6, (r.w - 44) * frac), 6, 3); ctx.fill();
  });
}

function drawCustomers(ctx, game) {
  const area = LAYOUT.customers;
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  rr(ctx, area.x, area.y, area.w, area.h, 10);
  ctx.fill();
  text(ctx, 'PELANGGAN MENUNGGU', area.x + 12, area.y + 16, 13, PALETTE.muted);
  game.orders.slice(0, 4).forEach((order, i) => {
    drawCustomer(ctx, order, area.x + 70 + i * 120, area.y + 62, 52);
  });
  if (game.orders.length === 0) {
    text(ctx, '— kosong —', area.x + area.w / 2, area.y + 62, 14, PALETTE.muted, 'center');
  }
}

function drawServe(ctx, game) {
  const r = LAYOUT.serve;
  stationShell(ctx, r, 'JENDELA SAJI', !!game.hand && game.hand.form === 'plated');
  // Nampan
  ctx.fillStyle = '#d8d3c8';
  rr(ctx, r.x + 20, r.y + 66, r.w - 40, 34, 8);
  ctx.fill();
  text(ctx, 'Antar hidangan', r.x + r.w / 2, r.y + 46, 13, PALETTE.cream, 'center');
}

function drawStations(ctx, game) {
  // Talenan
  const b = LAYOUT.board2;
  stationShell(ctx, b, 'TALENAN — cincang (klik 3x)', !!game.stations.board.item);
  ctx.fillStyle = '#c89b6a';
  rr(ctx, b.x + 24, b.y + 44, b.w - 48, 70, 6);
  ctx.fill();
  const bi = game.stations.board.item;
  if (bi) {
    drawItemIcon(ctx, bi.kind, bi.form, b.x + b.w / 2, b.y + 78, 34);
    const hits = game.stations.board.hits;
    for (let i = 0; i < 3; i += 1) {
      ctx.fillStyle = i < hits ? PALETTE.green : 'rgba(0,0,0,0.3)';
      ctx.beginPath(); ctx.arc(b.x + b.w / 2 - 20 + i * 20, b.y + 128, 6, 0, Math.PI * 2); ctx.fill();
    }
  } else {
    text(ctx, 'bawa bahan cincang:', b.x + b.w / 2, b.y + 66, 12, '#6b4a2f', 'center');
    text(ctx, 'ayam • udang', b.x + b.w / 2, b.y + 86, 12, '#6b4a2f', 'center');
    text(ctx, 'sayur • cabai', b.x + b.w / 2, b.y + 104, 12, '#6b4a2f', 'center');
  }

  // Wajan
  const w = LAYOUT.wok;
  const wok = game.stations.wok;
  stationShell(ctx, w, 'WAJAN — goreng', wok.cooking || wok.done);
  // Api
  ctx.fillStyle = wok.cooking ? '#ff7b24' : '#7a4a2b';
  ctx.beginPath();
  ctx.moveTo(w.x + 40, w.y + 138);
  ctx.quadraticCurveTo(w.x + 60, w.y + 100, w.x + 95, w.y + 138);
  ctx.quadraticCurveTo(w.x + 130, w.y + 100, w.x + 150, w.y + 138);
  ctx.closePath(); ctx.fill();
  // Badan wajan
  ctx.fillStyle = '#3a3f44';
  ctx.beginPath(); ctx.ellipse(w.x + w.w / 2, w.y + 92, 78, 34, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = wok.burnt ? '#1c1c1c' : wok.items.length ? '#8a5a2e' : '#4a4f55';
  ctx.beginPath(); ctx.ellipse(w.x + w.w / 2, w.y + 88, 66, 26, 0, 0, Math.PI * 2); ctx.fill();
  // Isi wajan
  wok.items.forEach((it, i) => {
    drawItemIcon(ctx, it.kind, it.form, w.x + 55 + i * 32, w.y + 86, 20);
  });
  if (wok.cooking) {
    // Bar aduk + zona hijau
    const bx = w.x + 16, by = w.y + 118, bw = w.w - 32;
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    rr(ctx, bx, by, bw, 12, 6); ctx.fill();
    ctx.fillStyle = 'rgba(88,179,104,0.55)';
    ctx.fillRect(bx + bw * STIR_ZONE[0], by, bw * (STIR_ZONE[1] - STIR_ZONE[0]), 12);
    ctx.fillStyle = '#fff';
    ctx.fillRect(bx + bw * wok.stir - 2, by - 3, 4, 18);
    text(ctx, 'ADUK! klik saat di hijau', w.x + w.w / 2, w.y + 142, 11, '#ffd9a0', 'center');
  } else if (wok.done) {
    text(ctx, 'MATANG! Klik untuk angkat', w.x + w.w / 2, w.y + 132, 12, PALETTE.green, 'center');
  } else if (wok.burnt) {
    text(ctx, 'GOSONG — klik untuk angkat', w.x + w.w / 2, w.y + 132, 12, PALETTE.red, 'center');
  } else if (wok.items.length > 0) {
    text(ctx, 'Klik untuk mulai menggoreng', w.x + w.w / 2, w.y + 132, 12, '#ffd9a0', 'center');
  } else {
    text(ctx, 'nasi/mie + bahan → goreng', w.x + w.w / 2, w.y + 132, 12, '#d8c9b0', 'center');
  }

  // Panci
  const p = LAYOUT.pot;
  const pot = game.stations.pot;
  stationShell(ctx, p, 'PANCI — rebus', pot.cooking || pot.done);
  ctx.fillStyle = '#5a6b7a';
  rr(ctx, p.x + 28, p.y + 46, p.w - 56, 62, 10);
  ctx.fill();
  ctx.fillStyle = pot.burnt ? '#222' : pot.items.length ? '#bfe3ea' : '#7d94a6';
  ctx.beginPath(); ctx.ellipse(p.x + p.w / 2, p.y + 52, (p.w - 56) / 2 - 4, 10, 0, 0, Math.PI * 2); ctx.fill();
  // Uap
  if (pot.cooking) {
    ctx.strokeStyle = 'rgba(207,216,220,0.8)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.moveTo(p.x + 50 + i * 24, p.y + 44);
      ctx.quadraticCurveTo(p.x + 56 + i * 24, p.y + 30, p.x + 50 + i * 24, p.y + 18);
      ctx.stroke();
    }
  }
  pot.items.forEach((it, i) => {
    drawItemIcon(ctx, it.kind, it.form, p.x + 45 + i * 34, p.y + 82, 20);
  });
  if (pot.cooking) {
    progressBar(ctx, p.x + 16, p.y + 122, p.w - 32, Math.min(1, pot.t / 5), PALETTE.teal);
    text(ctx, 'Merebus...', p.x + p.w / 2, p.y + 142, 12, '#cfe8ef', 'center');
  } else if (pot.done) {
    text(ctx, 'DING! Klik untuk angkat', p.x + p.w / 2, p.y + 132, 12, PALETTE.green, 'center');
  } else if (pot.burnt) {
    text(ctx, 'LEMBEK — klik untuk angkat', p.x + p.w / 2, p.y + 132, 12, PALETTE.red, 'center');
  } else {
    text(ctx, 'mie / telur → rebus 5 dtk', p.x + p.w / 2, p.y + 132, 12, '#d8c9b0', 'center');
  }

  // Piring (rakit)
  const pl = LAYOUT.plate;
  const plate = game.stations.plate;
  stationShell(ctx, pl, 'PIRING — rakit hidangan', !!plate.dish);
  ctx.fillStyle = '#eef2f5';
  ctx.beginPath(); ctx.ellipse(pl.x + pl.w / 2, pl.y + 88, 66, 30, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#c9d4dc';
  ctx.beginPath(); ctx.ellipse(pl.x + pl.w / 2, pl.y + 88, 44, 18, 0, 0, Math.PI * 2); ctx.fill();
  if (plate.dish) {
    const d = plate.dish;
    drawItemIcon(ctx, d.base, 'raw', pl.x + pl.w / 2 - 12, pl.y + 86, 26);
    plate.toppings.forEach((t, i) => {
      drawItemIcon(ctx, t, t === 'cabai' ? 'chopped' : 'raw', pl.x + pl.w / 2 + 24 + i * 24, pl.y + 86, 18);
    });
    text(ctx, d.name || 'Masakan', pl.x + pl.w / 2, pl.y + 128, 13, PALETTE.ink, 'center');
    text(ctx, 'Klik: tambah topping / ambil', pl.x + pl.w / 2, pl.y + 144, 11, PALETTE.muted, 'center');
  } else {
    text(ctx, 'bawa masakan', pl.x + pl.w / 2, pl.y + 80, 13, '#6b7a86', 'center');
    text(ctx, 'dari wajan / panci', pl.x + pl.w / 2, pl.y + 100, 13, '#6b7a86', 'center');
  }
}

function drawCrates(ctx, game) {
  const area = LAYOUT.crates;
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  rr(ctx, area.x - 6, area.y - 6, area.w + 12, area.h + 12, 10);
  ctx.fill();
  text(ctx, 'BAHAN — klik peti / tekan 1–8', area.x + 8, area.y - 16, 13, PALETTE.muted);
  CRATE_ORDER.forEach((kind, i) => {
    const r = crateRect(i);
    const ing = INGREDIENTS[kind];
    ctx.fillStyle = PALETTE.wood;
    rr(ctx, r.x, r.y, r.w, r.h, 8);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(r.x, r.y, r.w, 8);
    drawItemIcon(ctx, kind, 'raw', r.x + 26, r.y + r.h / 2, 24);
    text(ctx, ing.name, r.x + 48, r.y + r.h / 2 - 8, 14, PALETTE.cream);
    text(ctx, `[${i + 1}]`, r.x + 48, r.y + r.h / 2 + 12, 12, PALETTE.muted);
  });
}

function drawTrash(ctx, game) {
  const r = LAYOUT.trash;
  stationShell(ctx, r, 'SAMPAH', false);
  ctx.fillStyle = '#4a4f55';
  rr(ctx, r.x + 26, r.y + 40, r.w - 52, 56, 8);
  ctx.fill();
  ctx.fillStyle = '#2e3236';
  rr(ctx, r.x + 20, r.y + 34, r.w - 40, 10, 4);
  ctx.fill();
  text(ctx, 'buang', r.x + r.w / 2, r.y + 106, 12, PALETTE.muted, 'center');
}

function drawParticles(ctx, game) {
  for (const p of game.particles) {
    ctx.globalAlpha = Math.max(0, 1 - p.t / p.life);
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  for (const f of game.floats) {
    ctx.globalAlpha = Math.max(0, 1 - f.t / 1.2);
    text(ctx, f.text, f.x, f.y, 20, f.color, 'center');
  }
  ctx.globalAlpha = 1;
}

function drawHand(ctx, game) {
  if (!game.hand || !game.mouse) return;
  const { x, y } = game.mouse;
  ctx.save();
  ctx.globalAlpha = 0.95;
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.beginPath(); ctx.arc(x, y, 26, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = PALETTE.amber;
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(x, y, 26, 0, Math.PI * 2); ctx.stroke();
  if (game.hand.form === 'dish' || game.hand.form === 'plated') {
    ctx.fillStyle = '#eef2f5';
    ctx.beginPath(); ctx.ellipse(x, y, 20, 12, 0, 0, Math.PI * 2); ctx.fill();
    drawItemIcon(ctx, game.hand.base || 'nasi', 'raw', x - 4, y, 14);
    (game.hand.toppings || []).forEach((t, i) => {
      drawItemIcon(ctx, t, 'raw', x + 8 + i * 8, y - 6, 9);
    });
  } else {
    drawItemIcon(ctx, game.hand.kind, game.hand.form, x, y, 22);
  }
  text(ctx, itemLabel(game.hand), x, y + 40, 12, '#fff', 'center');
  ctx.restore();
}

function drawHint(ctx, game) {
  const r = LAYOUT.hint;
  ctx.fillStyle = '#0f1820';
  ctx.fillRect(r.x, r.y, r.w, r.h);
  const msg = game.messageT > 0 ? game.message : 'Klik peti bahan → cincang di talenan → masak di wajan/panci → rakit di piring → antar di jendela saji.';
  text(ctx, msg, 16, r.y + 18, 15, game.messageT > 0 ? PALETTE.gold : PALETTE.cream);
  text(ctx, '1–8 bahan • Klik stasiun untuk memakai • Esc jeda • M suara', 16, r.y + 40, 12, PALETTE.muted);
}

// --- Layar-layar ------------------------------------------------------------------
function drawTitle(ctx, game) {
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  text(ctx, 'WARUNG RAME', VIEW_W / 2, 170, 72, PALETTE.amber, 'center');
  text(ctx, 'Nasi Goreng Rush — dari gerobak ke bintang lima', VIEW_W / 2, 225, 22, PALETTE.cream, 'center');
  text(ctx, '12 resep  •  8 bahan  •  6 stasiun  •  6 hari  •  3 tipe pelanggan', VIEW_W / 2, 265, 16, PALETTE.gold, 'center');
  const lines = [
    '1. Ambil bahan dari peti (klik / tombol 1–8).',
    '2. Cincang ayam, udang, sayur, cabai di talenan (klik 3x).',
    '3. Masak di wajan (aduk saat penanda di zona hijau) atau rebus di panci.',
    '4. Rakit di piring, tambah topping, antar ke jendela saji sebelum pelanggan pergi.',
    'Capai target omzet tiap hari untuk naik level — Hari 6: Warung Bintang Lima!',
  ];
  lines.forEach((ln, i) => text(ctx, ln, VIEW_W / 2, 330 + i * 30, 17, '#e8dcc8', 'center'));
  const pulse = 0.6 + 0.4 * Math.sin(game.time * 3);
  ctx.globalAlpha = pulse;
  text(ctx, 'KLIK UNTUK MULAI MEMASAK', VIEW_W / 2, 540, 26, '#fff', 'center');
  ctx.globalAlpha = 1;
  text(ctx, 'Mouse + keyboard  •  main offline di browser', VIEW_W / 2, 580, 14, PALETTE.muted, 'center');
}

function drawDayEnd(ctx, game, passed) {
  const res = game.dayResult || { earned: 0, target: 0, served: 0, failed: 0, bestCombo: 0 };
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  text(ctx, passed ? `HARI ${game.day} SELESAI!` : `TARGET TIDAK TERCAPAI`, VIEW_W / 2, 190, 40, passed ? PALETTE.green : PALETTE.red, 'center');
  text(ctx, `Omzet: Rp${res.earned} / target Rp${res.target}`, VIEW_W / 2, 250, 22, PALETTE.cream, 'center');
  text(ctx, `Hidangan tersaji: ${res.served}  •  Pesanan gagal: ${res.failed}  •  Kombo terbaik: ${res.bestCombo}`, VIEW_W / 2, 295, 18, PALETTE.gold, 'center');
  if (passed) {
    const next = DAYS[game.day];
    text(ctx, `Besok: ${next ? next.name : ''} — resep baru terbuka!`, VIEW_W / 2, 340, 18, PALETTE.cream, 'center');
    text(ctx, 'KLIK UNTUK LANJUT KE HARI BERIKUTNYA', VIEW_W / 2, 430, 22, '#fff', 'center');
  } else {
    text(ctx, 'Warungmu belum cukup ramai hari ini. Coba lagi!', VIEW_W / 2, 340, 18, PALETTE.cream, 'center');
    text(ctx, 'KLIK UNTUK MENGULANG HARI INI', VIEW_W / 2, 430, 22, '#fff', 'center');
  }
}

function drawWin(ctx, game) {
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  text(ctx, '★ WARUNG BINTANG LIMA ★', VIEW_W / 2, 200, 44, PALETTE.gold, 'center');
  text(ctx, 'Dari gerobak pinggir jalan sampai restoran bintang lima!', VIEW_W / 2, 260, 20, PALETTE.cream, 'center');
  text(ctx, `Total omzet: Rp${game.totalCoins}  •  Hidangan tersaji: ${game.served}  •  Kombo terbaik: ${game.bestCombo}`, VIEW_W / 2, 310, 18, PALETTE.gold, 'center');
  text(ctx, 'Terima kasih sudah memasak! (klik untuk main lagi)', VIEW_W / 2, 400, 18, '#fff', 'center');
}
