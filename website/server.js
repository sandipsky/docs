'use strict';
// The local web server for the learning docs website.
//
// Start it with:  npm start      (from this "website" folder)
// Then open:      http://localhost:3030
//
// What it serves:
//   /                           the app page (public/index.html) for every page URL
//   /_app/...                   the app's own CSS, JavaScript and icon
//   /api/tree.json              the folder tree as JSON
//   /api/page/<path>.json       one file rendered to HTML, plus where it sits in the tree
//   /api/search-index.json      the plain text of every page, for searching in the browser
//   /api/progress  (POST)       tick or untick a chapter in the subject README
//   /api/events                 live updates when a file changes (Server-Sent Events)
//   /<path to image or pdf>     the raw file, for pictures and downloads
//
// The static build (build.js) writes the same /api/... files to disk, which is how the
// site can also run on Netlify without a server.

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const { buildTree, locate, listDocuments, setChapterDone } = require('./lib/tree');
const { buildPage, resolveInsideRoot, ASSET_EXTS, HIDDEN } = require('./lib/pages');
const { buildSearchIndex } = require('./lib/search');

const ROOT = path.resolve(__dirname, '..'); // the learning folder
const PUBLIC_DIR = path.join(__dirname, 'public');
const PORT = Number(process.env.PORT) || 3030;
const OPEN_BROWSER = !process.argv.includes('--no-open');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.zip': 'application/zip',
  '.mp4': 'video/mp4',
  '.mp3': 'audio/mpeg',
  '.woff2': 'font/woff2',
};

// ---------- Small helpers ----------

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(data));
}

function sendFile(res, file) {
  fs.stat(file, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }
    const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type, 'Content-Length': stat.size, 'Cache-Control': 'no-cache' });
    fs.createReadStream(file).pipe(res);
  });
}

function readBody(req, limit = 16 * 1024) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > limit) {
        reject(new Error('Request body too large'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

// ---------- Live updates ----------

const sseClients = new Set();

function handleEvents(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.write(': connected\n\n');
  sseClients.add(res);
  const ping = setInterval(() => res.write(': ping\n\n'), 25000);
  req.on('close', () => {
    clearInterval(ping);
    sseClients.delete(res);
  });
}

function broadcast(data) {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) client.write(message);
}

function watchFiles() {
  let pending = new Set();
  let timer = null;
  try {
    fs.watch(ROOT, { recursive: true }, (eventType, filename) => {
      if (!filename) return;
      const rel = String(filename).split(path.sep).join('/');
      if (HIDDEN.test(rel)) return;
      pending.add(rel);
      clearTimeout(timer);
      timer = setTimeout(() => {
        broadcast({ changed: [...pending] });
        pending = new Set();
      }, 300);
    });
    return true;
  } catch (err) {
    console.log(`Live reload is off (${err.message}). Refresh the page to see changes.`);
    return false;
  }
}

// ---------- Routes ----------

async function handleApi(req, res, url) {
  const route = url.pathname;

  if (route === '/api/tree.json' && req.method === 'GET') {
    return sendJson(res, 200, { ...buildTree(ROOT), live: true });
  }

  if (route.startsWith('/api/page/') && route.endsWith('.json') && req.method === 'GET') {
    const p = route.slice('/api/page/'.length, -'.json'.length);
    try {
      const result = buildPage(ROOT, buildTree(ROOT), '/' + p, { includeFile: true });
      if (result.status !== 200) return sendJson(res, result.status, { error: result.error, raw: result.raw });
      return sendJson(res, 200, result.page);
    } catch (err) {
      return sendJson(res, err.status || 500, { error: err.message });
    }
  }

  if (route === '/api/search-index.json' && req.method === 'GET') {
    return sendJson(res, 200, buildSearchIndex(ROOT, listDocuments(buildTree(ROOT))));
  }

  if (route === '/api/progress' && req.method === 'POST') {
    let data;
    try {
      data = JSON.parse(await readBody(req));
    } catch {
      return sendJson(res, 400, { error: 'Expected JSON like { "path": "JavaScript/02-variables", "done": true }' });
    }
    const target = resolveInsideRoot(ROOT, '/' + String(data.path || ''));
    if (!target) return sendJson(res, 400, { error: 'Bad chapter path' });
    const tree = buildTree(ROOT);
    const where = locate(tree, target.rel);
    if (!where.subject || !where.chapter || !where.subject.readme) {
      return sendJson(res, 404, { error: 'That chapter is not listed in a roadmap README.' });
    }
    const done = setChapterDone(ROOT, where.subject.readme, where.chapter.slug, Boolean(data.done));
    if (done === null) return sendJson(res, 404, { error: 'That chapter has no checkbox in the README.' });
    return sendJson(res, 200, { ok: true, done });
  }

  if (route === '/api/events' && req.method === 'GET') {
    return handleEvents(req, res);
  }

  return sendJson(res, 404, { error: 'Unknown API route' });
}

function serveAppFile(res, subPath) {
  const full = path.resolve(PUBLIC_DIR, '.' + subPath);
  if (!full.startsWith(PUBLIC_DIR + path.sep)) {
    res.writeHead(404);
    return res.end();
  }
  sendFile(res, full);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const p = url.pathname;

  if (p.startsWith('/api/')) {
    handleApi(req, res, url).catch((err) => sendJson(res, 500, { error: err.message }));
    return;
  }
  if (p.startsWith('/_app/')) return serveAppFile(res, p.slice('/_app'.length));
  if (p === '/favicon.ico') return serveAppFile(res, '/icon.svg');
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405);
    return res.end();
  }

  // Pictures, PDFs and other downloads are sent as they are. Everything else gets the app page,
  // and the app works out what to show from the URL.
  const target = resolveInsideRoot(ROOT, p);
  if (target && ASSET_EXTS.has(path.extname(target.rel).toLowerCase())) return sendFile(res, target.full);
  sendFile(res, path.join(PUBLIC_DIR, 'index.html'));
});

function openBrowser(url) {
  const command =
    process.platform === 'win32' ? `start "" "${url}"` : process.platform === 'darwin' ? `open "${url}"` : `xdg-open "${url}"`;
  exec(command, () => {});
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\nPort ${PORT} is already in use. Is the website already running?`);
    console.error('To use another port: set PORT=3031 and start again.\n');
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, '127.0.0.1', () => {
  const url = `http://localhost:${PORT}`;
  console.log('');
  console.log(`  Learning docs website:  ${url}`);
  console.log(`  Showing files from:     ${ROOT}`);
  console.log('  Press Ctrl+C to stop.');
  console.log('');
  watchFiles();
  if (OPEN_BROWSER) openBrowser(url);
});
