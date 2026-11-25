// Suara WARUNG RAME: synth WebAudio kecil, tanpa file aset.
// Semua bunyi dibuat dari osilator/noise — tidak ada yang diunduh.

let ctx = null;
let master = null;

function ensure(game) {
  if (game && game.muted) return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.25;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  } catch (e) {
    return null;
  }
}

function tone(game, freq, dur, type = 'sine', vol = 0.5, when = 0) {
  const ac = ensure(game);
  if (!ac) return;
  const t0 = ac.currentTime + when;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  o.connect(g);
  g.connect(master);
  o.start(t0);
  o.stop(t0 + dur + 0.02);
}

function noise(game, dur, vol = 0.3, freq = 1200) {
  const ac = ensure(game);
  if (!ac) return;
  const len = Math.floor(ac.sampleRate * dur);
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i += 1) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ac.createBufferSource();
  src.buffer = buf;
  const f = ac.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = freq;
  const g = ac.createGain();
  g.gain.value = vol;
  src.connect(f);
  f.connect(g);
  g.connect(master);
  src.start();
}

export function sfx(game, name) {
  if (!game || game.muted) return;
  switch (name) {
    case 'chop': noise(game, 0.08, 0.5, 900); tone(game, 140, 0.08, 'square', 0.25); break;
    case 'pick': tone(game, 520, 0.06, 'sine', 0.3); break;
    case 'place': tone(game, 340, 0.07, 'sine', 0.3); break;
    case 'stir': noise(game, 0.18, 0.35, 2400); break;
    case 'ding': tone(game, 880, 0.25, 'sine', 0.4); tone(game, 1318, 0.35, 'sine', 0.35, 0.12); break;
    case 'coin': tone(game, 988, 0.1, 'square', 0.25); tone(game, 1319, 0.18, 'square', 0.25, 0.08); break;
    case 'error': tone(game, 160, 0.2, 'sawtooth', 0.3); break;
    case 'fail': tone(game, 220, 0.3, 'sawtooth', 0.3); tone(game, 147, 0.4, 'sawtooth', 0.3, 0.15); break;
    case 'win': [523, 659, 784, 1047].forEach((f, i) => tone(game, f, 0.3, 'sine', 0.35, i * 0.12)); break;
    default: break;
  }
}
