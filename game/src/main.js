// Main WARUNG RAME: loop game, wiring mouse/keyboard, dan mode screenshot
// (?shot=cover|orders|cooking|serve&seed=1) yang memotret adegan deterministik.

import { VIEW_W, VIEW_H, RECIPES } from './config.js';
import { createGame, startDay, stepGame, nextDay, retryDay } from './state.js';
import { render } from './render.js';
import { clickAt, keyDown } from './input.js';
import { createShotGame } from './shots.js';
import { sfx } from './audio.js';

const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
const seed = parseInt(params.get('seed') || '1', 10) || 1;

const canvas = document.getElementById('game');
canvas.width = VIEW_W;
canvas.height = VIEW_H;
const ctx = canvas.getContext('2d');

let game;
if (shotName) {
  // Mode screenshot: adegan beku yang deterministik, tanpa loop waktu nyata.
  game = createShotGame(seed, shotName, RECIPES);
  if (!game.mouse) game.mouse = { x: -100, y: -100 };
  const help = document.getElementById('help');
  if (help) help.style.display = 'none';
  render(ctx, game);
  document.title = `WARUNG RAME — shot ${shotName}`;
} else {
  game = createGame((Date.now() % 2147483647) | 1);
  game.mouse = { x: VIEW_W / 2, y: VIEW_H / 2 };

  canvas.addEventListener('mousemove', (e) => {
    const r = canvas.getBoundingClientRect();
    game.mouse = {
      x: ((e.clientX - r.left) / r.width) * VIEW_W,
      y: ((e.clientY - r.top) / r.height) * VIEW_H,
    };
  });
  canvas.addEventListener('click', (e) => {
    const r = canvas.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * VIEW_W;
    const y = ((e.clientY - r.top) / r.height) * VIEW_H;
    const before = game.screen;
    const res = clickAt(game, x, y);
    if (game.screen === 'play' && res && res.ok) sfx(game, 'pick');
    if (before === 'title' && game.screen === 'play') sfx(game, 'win');
    if (before === 'dayend' && game.screen === 'play') sfx(game, 'coin');
    if (before === 'gameover' && game.screen === 'play') sfx(game, 'coin');
    if (game.screen === 'win' && before !== 'win') sfx(game, 'win');
  });
  window.addEventListener('keydown', (e) => {
    if ([' ', 'ArrowUp', 'ArrowDown'].includes(e.key)) e.preventDefault();
    keyDown(game, e.key);
  });

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const prevScreen = game.screen;
    const prevCoins = game.dayCoins;
    stepGame(game, dt);
    if (game.screen !== prevScreen) {
      if (game.screen === 'dayend' || game.screen === 'win') sfx(game, 'win');
      if (game.screen === 'gameover') sfx(game, 'fail');
    } else if (game.dayCoins > prevCoins) {
      sfx(game, 'coin');
    }
    render(ctx, game);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// Ekspos kecil untuk play-test otomatis (bukan bagian dari game yang dinilai).
window.__warung = { game, startDay, nextDay, retryDay, RECIPES };
