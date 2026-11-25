// Server statis kecil untuk play-test lokal WARUNG RAME (Node 22, stdlib saja).
// Jalankan: node serve.ts — lalu buka http://localhost:8080
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
};

const server = createServer(async (req, res) => {
  try {
    const raw = req.url.split('?')[0];
    const path = raw === '/' ? '/index.html' : decodeURIComponent(raw);
    const file = join(here, 'game', path.replace(/^\//, ''));
    const data = await readFile(file);
    res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream' });
    res.end(data);
  } catch (e) {
    res.writeHead(404);
    res.end('not found');
  }
});

server.listen(8080, () => {
  console.log('WARUNG RAME di http://localhost:8080');
});
