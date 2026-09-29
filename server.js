/**
 * Zero-dependency local dev server for The Upper Room prototype.
 * Serves static files and falls back to index.html so History API
 * routes (e.g. /shop, /product/xyz) work on refresh and deep links.
 *
 *   node server.js            → http://localhost:5173
 *   PORT=8080 node server.js  → http://localhost:8080
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)));
const PORT = Number(process.env.PORT) || 5173;
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.md': 'text/plain; charset=utf-8',
};

createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const filePath = normalize(join(ROOT, urlPath));
    if (!filePath.startsWith(ROOT)) { res.writeHead(403).end('Forbidden'); return; }

    let target = filePath;
    const info = await stat(target).catch(() => null);
    if (info?.isDirectory()) target = join(target, 'index.html');
    const exists = await stat(target).then((s) => s.isFile()).catch(() => false);

    if (!exists) {
      // Missing asset with an extension → real 404 (lets the logo fallback kick in).
      if (extname(urlPath)) { res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found'); return; }
      target = join(ROOT, 'index.html'); // SPA route
    }
    const body = await readFile(target);
    res.writeHead(200, { 'Content-Type': TYPES[extname(target).toLowerCase()] ?? 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(body);
  } catch (err) {
    res.writeHead(500).end('Server error');
    console.error(err);
  }
}).listen(PORT, () => {
  console.log(`\n  The Upper Room prototype running at  http://localhost:${PORT}\n`);
});
