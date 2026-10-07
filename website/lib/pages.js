'use strict';
// Builds the JSON for one page: the rendered HTML plus where the page sits in the tree
// (subject, chapter, tabs, previous and next chapter).
//
// Used by both the local server (server.js) and the static build (build.js), so the
// website looks the same whether it runs on your computer or on Netlify.

const fs = require('fs');
const path = require('path');
const { locate } = require('./tree');
const { renderMarkdown, renderText, renderCode, escapeHtml } = require('./markdown');

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB is plenty for a lesson

// Files sent to the browser as they are (pictures, PDFs, downloads).
const ASSET_EXTS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico', '.pdf', '.docx', '.xlsx', '.pptx', '.zip', '.mp4', '.mp3', '.woff2']);

// Parts of the folder that must never be shown.
const HIDDEN = /(^|\/)(\.git|\.claude|node_modules|website|\.env[^/]*)(\/|$)/;

// Turns a URL path like "/JavaScript/02-variables/notes.md" into a safe path
// inside the learning folder. Returns null if it points somewhere it shouldn't.
function resolveInsideRoot(root, urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch {
    return null;
  }
  if (decoded.includes('\0')) return null;
  const full = path.resolve(root, decoded.replace(/\\/g, '/').replace(/^\/+/, ''));
  if (full !== root && !full.startsWith(root + path.sep)) return null;
  const rel = path.relative(root, full).split(path.sep).join('/');
  if (HIDDEN.test(rel)) return null;
  return { full, rel };
}

function looksLikeText(file) {
  try {
    const fd = fs.openSync(file, 'r');
    const buffer = Buffer.alloc(512);
    const bytes = fs.readSync(fd, buffer, 0, 512, 0);
    fs.closeSync(fd);
    for (let i = 0; i < bytes; i++) if (buffer[i] === 0) return false;
    return true;
  } catch {
    return false;
  }
}

function readTextFile(file) {
  const stat = fs.statSync(file);
  if (stat.size > MAX_FILE_SIZE) {
    throw Object.assign(new Error('This file is too big to show as a page.'), { status: 413 });
  }
  return fs.readFileSync(file, 'utf8');
}

// The best file to open for a chapter: notes first, then exercises, and so on.
function chapterHome(chapter) {
  if (!chapter) return null;
  return chapter.notes || chapter.exercises || (chapter.docs[0] && chapter.docs[0].path) || (chapter.starter && chapter.starter.path) || null;
}

function chapterLink(chapter) {
  return chapter ? { title: chapter.title, path: chapterHome(chapter) } : null;
}

// Everything the page needs to know about its place in the tree.
function contextFor(tree, where) {
  const { subject, chapter, role } = where;
  const ctx = { role: role || 'page' };
  if (!subject) return ctx;

  const allDone = subject.progress.total > 0 && subject.progress.done === subject.progress.total;
  ctx.subject = {
    name: subject.name,
    path: subject.path,
    readme: subject.readme,
    downloads: subject.downloads,
    progress: subject.progress,
    chapterCount: subject.chapters.length,
    next: chapterLink(subject.chapters.find((c) => c.done === false) || (allDone ? null : subject.chapters[0])),
  };

  if (chapter) {
    const index = subject.chapters.indexOf(chapter);
    const group = subject.groups.find((g) => g.chapters.includes(chapter));
    const tabs = [];
    if (chapter.notes) tabs.push({ label: 'Notes', path: chapter.notes });
    if (chapter.exercises) tabs.push({ label: 'Exercises', path: chapter.exercises });
    for (const doc of chapter.docs) tabs.push({ label: doc.title, path: doc.path });
    if (chapter.starter) tabs.push({ label: 'Starter files', path: chapter.starter.path });

    ctx.chapter = {
      slug: chapter.slug,
      title: chapter.title,
      path: chapter.path,
      done: chapter.done,
      isProject: chapter.isProject,
      group: group ? group.title : '',
      tabs,
      prev: chapterLink(subject.chapters[index - 1]),
      next: chapterLink(subject.chapters[index + 1]),
    };
  }
  return ctx;
}

function slugifyFile(name) {
  return 'file-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// The "Starter files" tab: every file in the chapter's starter folder, one after another.
function starterPage(root, tree, where, options) {
  const chapter = where.chapter;
  const chapterDir = path.join(root, chapter.path);
  const toc = [];
  let html =
    '<h1 id="starter-files">Starter files</h1>' +
    "<p>These are the files in this chapter's <code>starter/</code> folder, so you can see what you begin with. " +
    'Open the folder in your editor to work on them.</p>';

  for (const relFile of chapter.starter.files) {
    const file = path.join(chapterDir, relFile);
    const display = relFile.replace(/^starter\//i, '');
    const id = slugifyFile(display);
    toc.push({ id, text: display, level: 2 });
    html += `<h2 id="${id}">${escapeHtml(display)}<a class="anchor" href="#${id}" aria-label="Link to this file">#</a></h2>`;

    let stat;
    try {
      stat = fs.statSync(file);
    } catch {
      continue;
    }
    const ext = path.extname(relFile).toLowerCase();
    if (!ASSET_EXTS.has(ext) && stat.size <= MAX_FILE_SIZE && looksLikeText(file)) {
      html += renderCode(fs.readFileSync(file, 'utf8'), display);
    } else {
      html += `<p><a href="/${escapeHtml(chapter.path)}/${escapeHtml(relFile)}" download>Download ${escapeHtml(display)}</a></p>`;
    }
  }

  const page = {
    path: chapter.starter.path,
    kind: 'starter',
    title: `${chapter.title}: Starter files`,
    html,
    toc,
    context: contextFor(tree, where),
  };
  if (options.includeFile) page.file = path.join(chapterDir, 'starter');
  return { status: 200, page };
}

// Builds the page for a URL path. Returns { status: 200, page } or { status, error }.
// options.includeFile adds the file's full path on disk (for the "Open in VS Code" link).
function buildPage(root, tree, urlPath, options = {}) {
  const target = resolveInsideRoot(root, urlPath);
  if (!target) return { status: 404, error: "That page isn't inside the learning folder." };

  const { full, rel } = target;
  let stat;
  try {
    stat = fs.statSync(full);
  } catch {
    return { status: 404, error: `There is no file called "${rel}".` };
  }

  const where = locate(tree, rel);

  if (stat.isDirectory()) {
    // A folder URL: show the most useful thing inside it.
    if (where.chapter && where.role === 'starter') return starterPage(root, tree, where, options);
    let go = null;
    if (where.chapter) go = chapterHome(where.chapter);
    else if (where.subject && rel === where.subject.path) go = where.subject.readme || chapterHome(where.subject.chapters[0]);
    if (!go) return { status: 404, error: `"${rel}" is a folder with nothing to show.` };
    return buildPage(root, tree, '/' + go, options);
  }

  const ext = path.extname(rel).toLowerCase();
  const name = path.basename(rel);
  let kind;
  let rendered;

  if (ext === '.md') {
    kind = 'markdown';
    rendered = renderMarkdown(readTextFile(full));
  } else if (ext === '.txt') {
    kind = 'text';
    rendered = { html: renderText(readTextFile(full)), title: null, toc: [] };
  } else if (!ASSET_EXTS.has(ext) && looksLikeText(full)) {
    kind = 'code';
    rendered = { html: renderCode(readTextFile(full), name), title: name, toc: [] };
  } else {
    return { status: 415, error: `"${name}" isn't a text file, so it can't be shown as a page.`, raw: '/' + rel };
  }

  const fallbackTitle = where.role === 'readme' && where.subject ? where.subject.name : name;
  const page = {
    path: rel,
    kind,
    title: rendered.title || fallbackTitle,
    html: rendered.html,
    toc: rendered.toc,
    context: contextFor(tree, where),
  };
  if (options.includeFile) page.file = full;
  return { status: 200, page };
}

module.exports = { buildPage, resolveInsideRoot, chapterHome, looksLikeText, ASSET_EXTS, HIDDEN, MAX_FILE_SIZE };
