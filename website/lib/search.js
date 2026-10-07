'use strict';
// Builds the search index: the plain text of every lesson file, with a readable label.
// The browser downloads this once and does the actual searching itself, so search
// works the same on your computer and on a static host like Netlify.
//
// File contents are cached in memory and re-read only when a file changes.

const fs = require('fs');
const path = require('path');

const cache = new Map(); // relPath -> { mtime, text }

// Markdown with most of the symbols removed, so snippets read like normal text.
function toPlainText(markdown) {
  return markdown
    .replace(/```[^\n]*\n/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[*_`>|]/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .trim();
}

function loadText(root, relPath) {
  const full = path.join(root, relPath);
  let stat;
  try {
    stat = fs.statSync(full);
  } catch {
    cache.delete(relPath);
    return null;
  }
  const hit = cache.get(relPath);
  if (hit && hit.mtime === stat.mtimeMs) return hit;

  let raw;
  try {
    raw = fs.readFileSync(full, 'utf8');
  } catch {
    return null;
  }
  const entry = { mtime: stat.mtimeMs, text: toPlainText(raw) };
  cache.set(relPath, entry);
  return entry;
}

// documents: [{ path, title, kind, crumb }] from tree.listDocuments()
function buildSearchIndex(root, documents) {
  const out = [];
  for (const doc of documents) {
    const entry = loadText(root, doc.path);
    if (!entry) continue;
    out.push({ path: doc.path, title: doc.title, kind: doc.kind, crumb: doc.crumb, text: entry.text });
  }
  return { documents: out };
}

module.exports = { buildSearchIndex };
