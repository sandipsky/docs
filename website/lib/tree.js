'use strict';
// Builds the navigation tree for the website by looking at the folders on disk.
//
// The learning folder looks like this:
//
//   JavaScript/            <- a subject
//     README.md            <- the roadmap: "## Level ..." headings and "- [ ]" checkboxes
//     01-getting-started/  <- a chapter
//       notes.md
//       exercises.md
//       starter/           <- optional files to begin a project from
//
// Nothing here is cached. The tree is rebuilt on every request, which is fast
// enough for a few hundred files and means edits show up straight away.

const fs = require('fs');
const path = require('path');

// Folders that are never part of the lessons.
const SKIP_DIRS = new Set(['.git', '.claude', 'node_modules', 'website', 'dist', 'build']);
const DOC_EXTS = new Set(['.md', '.txt']);
const DOWNLOAD_EXTS = new Set(['.pdf', '.docx']);

function readDir(dir) {
  try {
    return fs
      .readdirSync(dir, { withFileTypes: true })
      .sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true }));
  } catch {
    return [];
  }
}

function toPosix(p) {
  return p.split(path.sep).join('/');
}

// The first "# Heading" in a file, or null.
function firstHeading(file) {
  try {
    const text = fs.readFileSync(file, 'utf8').slice(0, 4000);
    const match = text.match(/^#\s+(.+?)\s*#*\s*$/m);
    return match ? match[1].trim() : null;
  } catch {
    return null;
  }
}

// "01-getting-started" -> "01 Getting Started"
function titleFromName(name) {
  return name
    .replace(/\.(md|txt)$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b[a-z]/g, (c) => c.toUpperCase());
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Reads a subject's README and returns its chapters in roadmap order, grouped
// under the "## ..." headings, with the checkbox state of each one.
function parseReadme(file) {
  const groups = [];
  const bySlug = new Map();
  let text;
  try {
    text = fs.readFileSync(file, 'utf8');
  } catch {
    return { groups, bySlug };
  }

  let current = null;
  for (const line of text.split(/\r?\n/)) {
    const heading = line.match(/^##\s+(.+?)\s*$/);
    if (heading) {
      current = { title: heading[1], chapters: [] };
      continue;
    }
    // Matches lines like:  - [x] [02 Variables](02-variables/notes.md): storing information
    const item = line.match(/^\s*[-*]\s+\[([ xX])\]\s+\[([^\]]+)\]\(([^)\s]+)\)\s*:?\s*(.*)$/);
    if (!item) continue;
    const slug = item[3].replace(/^\.\//, '').split('/')[0];
    if (!slug || bySlug.has(slug)) continue;

    const entry = { slug, title: item[2], done: item[1] !== ' ', blurb: item[4].trim() };
    if (!current) current = { title: '', chapters: [] };
    if (!groups.includes(current)) groups.push(current);
    current.chapters.push(entry);
    bySlug.set(slug, entry);
  }
  return { groups, bySlug };
}

function listFilesRecursive(dir, base, out = []) {
  for (const entry of readDir(dir)) {
    if (entry.name.startsWith('.') || SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) listFilesRecursive(full, base, out);
    else if (entry.isFile()) out.push(toPosix(path.relative(base, full)));
    if (out.length >= 100) break;
  }
  return out;
}

function scanChapter(root, subject, slug, roadmap) {
  const dir = path.join(root, subject, slug);
  const entries = readDir(dir);
  const files = entries.filter((e) => e.isFile());
  const rel = (name) => `${subject}/${slug}/${name}`;
  const findFile = (wanted) => files.find((f) => f.name.toLowerCase() === wanted);

  const notes = findFile('notes.md');
  const exercises = findFile('exercises.md');
  const docs = files
    .filter((f) => DOC_EXTS.has(path.extname(f.name).toLowerCase()) && f !== notes && f !== exercises)
    .map((f) => ({ title: firstHeading(path.join(dir, f.name)) || titleFromName(f.name), path: rel(f.name) }));
  const starterDir = entries.find((e) => e.isDirectory() && e.name.toLowerCase() === 'starter');
  const starterFiles = starterDir ? listFilesRecursive(path.join(dir, starterDir.name), dir) : [];

  if (!notes && !exercises && docs.length === 0 && starterFiles.length === 0) return null;

  const title =
    (roadmap && roadmap.title) || (notes && firstHeading(path.join(dir, notes.name))) || titleFromName(slug);

  return {
    slug,
    subject,
    title,
    path: `${subject}/${slug}`,
    notes: notes ? rel(notes.name) : null,
    exercises: exercises ? rel(exercises.name) : null,
    docs,
    starter: starterFiles.length ? { path: rel(starterDir.name), files: starterFiles } : null,
    done: roadmap ? roadmap.done : null, // null = not tracked in the README
    blurb: roadmap ? roadmap.blurb : '',
    isProject: /project/i.test(slug) || /project/i.test(title),
  };
}

function scanSubject(root, name) {
  const dir = path.join(root, name);
  const entries = readDir(dir);
  const readmeEntry = entries.find((e) => e.isFile() && e.name.toLowerCase() === 'readme.md');
  const roadmap = readmeEntry ? parseReadme(path.join(dir, readmeEntry.name)) : { groups: [], bySlug: new Map() };

  const chapters = [];
  const pages = [];
  const downloads = [];
  for (const entry of entries) {
    if (entry.name.startsWith('.') || SKIP_DIRS.has(entry.name)) continue;
    if (entry.isDirectory()) {
      const chapter = scanChapter(root, name, entry.name, roadmap.bySlug.get(entry.name));
      if (chapter) chapters.push(chapter);
    } else if (entry.isFile() && entry !== readmeEntry) {
      const ext = path.extname(entry.name).toLowerCase();
      const relPath = `${name}/${entry.name}`;
      if (DOC_EXTS.has(ext)) {
        pages.push({ title: firstHeading(path.join(dir, entry.name)) || entry.name, path: relPath });
      } else if (DOWNLOAD_EXTS.has(ext)) {
        downloads.push({ name: entry.name, path: relPath, kind: ext.slice(1) });
      }
    }
  }
  if (chapters.length === 0 && pages.length === 0 && !readmeEntry) return null;

  // Put the chapters in roadmap order, under their level headings.
  const bySlug = new Map(chapters.map((c) => [c.slug, c]));
  const groups = [];
  const placed = new Set();
  for (const group of roadmap.groups) {
    const list = group.chapters.map((c) => bySlug.get(c.slug)).filter(Boolean);
    for (const c of list) placed.add(c.slug);
    if (list.length) groups.push({ title: group.title, chapters: list });
  }
  const rest = chapters.filter((c) => !placed.has(c.slug));
  if (rest.length) groups.push({ title: groups.length ? 'Other chapters' : '', chapters: rest });

  const ordered = groups.flatMap((g) => g.chapters);
  const tracked = ordered.filter((c) => c.done !== null);
  return {
    name,
    path: name,
    readme: readmeEntry ? `${name}/${readmeEntry.name}` : null,
    groups,
    chapters: ordered,
    pages,
    downloads,
    progress: { done: tracked.filter((c) => c.done).length, total: tracked.length },
  };
}

function buildTree(root) {
  const subjects = [];
  const pages = [];
  for (const entry of readDir(root)) {
    if (entry.name.startsWith('.') || SKIP_DIRS.has(entry.name)) continue;
    if (entry.isDirectory()) {
      const subject = scanSubject(root, entry.name);
      if (subject) subjects.push(subject);
    } else if (entry.isFile() && DOC_EXTS.has(path.extname(entry.name).toLowerCase())) {
      pages.push({ title: entry.name, path: entry.name });
    }
  }
  return { subjects, pages };
}

// Works out where a path sits in the tree: which subject and chapter, and what
// role the file plays there ("notes", "exercises", "starter", "doc", "readme", "page").
function locate(tree, relPath) {
  const [subjectName, chapterSlug] = relPath.split('/');
  const subject = tree.subjects.find((s) => s.name === subjectName) || null;
  if (!subject) {
    return { subject: null, chapter: null, role: tree.pages.some((p) => p.path === relPath) ? 'page' : null };
  }
  if (relPath === subject.readme) return { subject, chapter: null, role: 'readme' };

  const chapter = subject.chapters.find((c) => c.slug === chapterSlug) || null;
  if (!chapter) {
    return { subject, chapter: null, role: subject.pages.some((p) => p.path === relPath) ? 'page' : null };
  }

  let role = null;
  if (relPath === chapter.notes) role = 'notes';
  else if (relPath === chapter.exercises) role = 'exercises';
  else if (chapter.starter && (relPath === chapter.starter.path || relPath.startsWith(chapter.starter.path + '/'))) role = 'starter';
  else if (chapter.docs.some((d) => d.path === relPath)) role = 'doc';
  return { subject, chapter, role };
}

// Every document the search can look through, with a readable label.
function listDocuments(tree) {
  const docs = [];
  for (const subject of tree.subjects) {
    if (subject.readme) {
      docs.push({ path: subject.readme, title: `${subject.name} roadmap`, kind: 'Overview', crumb: subject.name });
    }
    for (const chapter of subject.chapters) {
      if (chapter.notes) docs.push({ path: chapter.notes, title: chapter.title, kind: 'Notes', crumb: subject.name });
      if (chapter.exercises) docs.push({ path: chapter.exercises, title: chapter.title, kind: 'Exercises', crumb: subject.name });
      for (const d of chapter.docs) docs.push({ path: d.path, title: d.title, kind: chapter.title, crumb: subject.name });
    }
    for (const p of subject.pages) docs.push({ path: p.path, title: p.title, kind: '', crumb: subject.name });
  }
  for (const p of tree.pages) docs.push({ path: p.path, title: p.title, kind: '', crumb: '' });
  return docs;
}

// Ticks or unticks a chapter's checkbox in the subject README.
// Returns the new state, or null if the chapter isn't listed in the README.
function setChapterDone(root, readmeRel, slug, done) {
  const file = path.join(root, readmeRel);
  const text = fs.readFileSync(file, 'utf8');
  const pattern = new RegExp(
    `^(\\s*[-*]\\s+\\[)[ xX](\\]\\s+\\[[^\\]]+\\]\\((?:\\./)?${escapeRegExp(slug)}(?:/|\\)))`,
    'm'
  );
  if (!pattern.test(text)) return null;
  const updated = text.replace(pattern, `$1${done ? 'x' : ' '}$2`);
  if (updated !== text) fs.writeFileSync(file, updated);
  return done;
}

module.exports = { buildTree, locate, listDocuments, setChapterDone, SKIP_DIRS };
