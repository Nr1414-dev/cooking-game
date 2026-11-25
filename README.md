# WARUNG RAME — Nasi Goreng Rush

[![make.fun](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/Nr1414-dev/cooking-game/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/Nr1414-dev/cooking-game/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)

Game masak original: jalankan warung kaki lima Indonesia di pasar malam — dari
gerobak sederhana di Hari 1 sampai Warung Bintang Lima di Hari 6. **12 resep,
8 bahan, 6 stasiun, 6 hari, 3 tipe pelanggan** — semua sistem berfungsi dan
saling terkait.

## Cara main
- Ambil bahan dari peti (klik atau tombol 1–8): nasi, mie, telur, ayam,
  udang, sayur, cabai, kecap.
- Cincang ayam/udang/sayur/cabai di talenan (klik 3x).
- Goreng di wajan — aduk saat penanda di zona hijau — atau rebus di panci
  sampai bunyi ding.
- Rakit di piring (masakan + topping), antar ke jendela saji sebelum
  pelanggan kehabisan sabar.
- Capai target omzet tiap hari (Rp120–550) untuk naik level. Kombo beruntun
  menaikkan tip; pesanan gagal memutus kombo. Hati-hati: kritikus memberi tip
  2x tapi sabarnya pendek, dan masakan yang kelamaan di wajan/panci gosong.

## Main lokal
`node serve.ts` lalu buka http://localhost:8080 — jalan offline, tanpa
network, mouse + keyboard.

## Entri make.fun
Bounty: [Make the best cooking game](https://make.fun/bounty/best-cooking-game-20261125-0137) ($250, 10 tempat).
`main.ts` (Node 22) menyalin `game/` + `screenshots/` ke `/output` dan
menulis `/output/dossier.json` via `vendor/makefun-game.ts`.
