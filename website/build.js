'use strict';
// Builds a static copy of the website into dist/, ready for Netlify or any other static host.
//
// Run with:  npm run build      (from this "website" folder)
//
// What ends up in dist/:
//   index.html, _app/...        the app, exactly as the local server serves it
//   api/tree.json               the folder tree
//   api/page/<path>.json        every page, pre-rendered (plus folder shortcuts like /JavaScript)
//   api/search-index.json       the plain text of every page, for searching in the browser
//   <pictures, PDFs, ...>       files the pages link to, at the same paths
//   _redirects                  tells Netlify to send every other address to the app
//
// Nothing here needs a server, so "Mark as done" and live refresh are off in the static copy.

const fs = require('fs');
const path = require('path');

const { buildTree, listDocuments } = require('./lib/tree');
const { buildPage, ASSET_EXTS, HIDDEN } = require('./lib/pages');
const { buildSearchIndex } = require('./lib/search');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(__dirname, 'public');
const DIST = path.join(__dirname, 'dist');

function writeFile(rel, content) {
  const full = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
  return Buffer.byteLength(content);
}

function writeJson(rel, data) {
  return writeFile(rel, JSON.stringify(data));
}

function copyFile(from, rel) {
  const full = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.copyFileSync(from, full);
  return fs.statSync(full).size;
}

function walk(dir, rel, visit) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const childRel = rel ? `${rel}/${entry.name}` : entry.name;
    if (HIDDEN.test(childRel)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, childRel, visit);
    else if (entry.isFile()) visit(full, childRel);
  }
}

function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function main() {
  const started = Date.now();
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });

  // 1. The app itself.
  copyFile(path.join(PUBLIC_DIR, 'index.html'), 'index.html');
  for (const name of fs.readdirSync(PUBLIC_DIR)) {
    if (name !== 'index.html') copyFile(path.join(PUBLIC_DIR, name), path.join('_app', name));
  }

  // 2. The folder tree. "live: false" tells the app there is no server to talk to.
  const tree = buildTree(ROOT);
  writeJson('api/tree.json', { ...tree, live: false });

  // 3. Every page, plus the folder shortcuts (/JavaScript, /JavaScript/02-variables, ...).
  const targets = new Set();
  for (const p of tree.pages) targets.add(p.path);
  for (const subject of tree.subjects) {
    targets.add(subject.path);
    if (subject.readme) targets.add(subject.readme);
    for (const p of subject.pages) targets.add(p.path);
    for (const chapter of subject.chapters) {
      targets.add(chapter.path);
      if (chapter.notes) targets.add(chapter.notes);
      if (chapter.exercises) targets.add(chapter.exercises);
      for (const d of chapter.docs) targets.add(d.path);
      if (chapter.starter) {
        targets.add(chapter.starter.path);
        for (const f of chapter.starter.files) targets.add(`${chapter.path}/${f}`);
      }
    }
  }

  let pageCount = 0;
  let pageBytes = 0;
  const skipped = [];
  for (const target of targets) {
    let result;
    try {
      result = buildPage(ROOT, tree, '/' + target);
    } catch (err) {
      result = { status: 500, error: err.message };
    }
    if (result.status !== 200) {
      // Pictures and other non-text files are copied in step 5 instead.
      if (result.status !== 415) skipped.push(`${target}: ${result.error}`);
      continue;
    }
    pageBytes += writeJson(`api/page/${target}.json`, result.page);
    pageCount++;
  }

  // 4. The search index.
  const indexBytes = writeJson('api/search-index.json', buildSearchIndex(ROOT, listDocuments(tree)));

  // 5. Pictures, PDFs and other files the pages link to.
  let assetCount = 0;
  let assetBytes = 0;
  walk(ROOT, '', (full, rel) => {
    if (!ASSET_EXTS.has(path.extname(rel).toLowerCase())) return;
    assetBytes += copyFile(full, rel);
    assetCount++;
  });

  // 6. Netlify: any address that isn't a real file is handled by the app.
  writeFile('_redirects', '/*  /index.html  200\n');

  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  console.log('');
  console.log(`  Built the static site in ${seconds}s -> ${DIST}`);
  console.log(`  Subjects: ${tree.subjects.length}   Chapters: ${tree.subjects.reduce((n, s) => n + s.chapters.length, 0)}`);
  console.log(`  Pages:    ${pageCount} (${formatBytes(pageBytes)})`);
  console.log(`  Search:   ${formatBytes(indexBytes)}`);
  console.log(`  Files:    ${assetCount} pictures, PDFs and downloads (${formatBytes(assetBytes)})`);
  if (skipped.length) {
    console.log('');
    console.log('  Skipped:');
    for (const s of skipped) console.log(`   - ${s}`);
  }
  console.log('');
  console.log('  Next: drag the dist folder onto https://app.netlify.com/drop, or push to Git (see README.md).');
  console.log('');
}

main();
