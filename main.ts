// WARUNG RAME — entrypoint (Node 22, stdlib saja).
// Menyalin game/ dan screenshots/ dari repo ke direktori output lalu menulis
// /output/dossier.json dengan library make.fun yang divendor. Dua run harus
// menulis byte yang sama: tidak ada waktu, acak, atau urutan tak tentu di sini.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// Batas gate dari competition.yaml: dossier 160 KiB, maks 4 screenshot @256 KiB,
// game/ maks 993 file dan 48 MiB, path maks 1000 byte.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
