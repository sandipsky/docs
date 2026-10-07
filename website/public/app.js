/* Learning Docs — the browser side.
   Plain JavaScript, no framework. The server renders Markdown to HTML; this
   file draws the sidebar, loads pages, and handles search, theme and navigation. */

(() => {
  'use strict';

  // ---------- Small helpers ----------

  const $ = (selector, root = document) => root.querySelector(selector);

  // Make text safe to put inside HTML.
  const esc = (value) =>
    String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  // "JavaScript/02-variables/notes.md" -> "/JavaScript/02-variables/notes.md" (URL-safe)
  const href = (p) => '/' + p.split('/').map(encodeURIComponent).join('/');
  // Where the server (or the static build) keeps the rendered page for a path.
  const pageUrl = (p) => '/api/page' + href(p) + '.json';

  const ASSET_RE = /\.(png|jpe?g|gif|webp|svg|ico|pdf|docx|xlsx|pptx|zip|mp4|mp3)$/i;

  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        /* private mode or storage blocked: fine, just don't remember */
      }
    },
  };

  const icon = (body, extra = '') =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${body}</svg>`;

  const ICONS = {
    sun: icon('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>'),
    moon: icon('<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>'),
    chevron: icon('<path d="m9 18 6-6-6-6"/>', 'class="chev"'),
    check: icon('<path d="M20 6 9 17l-5-5"/>'),
    home: icon('<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>'),
    file: icon('<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><path d="M14 2v6h6"/>'),
    arrowLeft: icon('<path d="M19 12H5M12 19l-7-7 7-7"/>'),
    arrowRight: icon('<path d="M5 12h14M12 5l7 7-7 7"/>'),
    download: icon('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>'),
  };

  const state = {
    tree: { subjects: [], pages: [] },
    path: '', // current file path, '' = home
    page: null, // the page data from the server
    request: 0, // guards against slow responses arriving out of order
    expanded: store.get('expanded', {}),
  };

  const els = {
    body: document.body,
    tree: $('#tree'),
    results: $('#search-results'),
    search: $('#search'),
    content: $('#content'),
    toc: $('#toc'),
    themeBtn: $('#theme-toggle'),
    menuBtn: $('#menu-btn'),
    backdrop: $('#backdrop'),
    topbarTitle: $('#topbar-title'),
  };

  // ---------- Theme ----------

  function currentTheme() {
    return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('theme', theme);
    } catch {
      /* ignore */
    }
    els.themeBtn.innerHTML = theme === 'dark' ? ICONS.sun : ICONS.moon;
    els.themeBtn.title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  }

  // ---------- Talking to the server ----------

  async function fetchJson(url, options) {
    const res = await fetch(url, options);
    const type = res.headers.get('content-type') || '';
    if (!type.includes('json')) {
      // On a static host a missing page comes back as the app's own HTML page, not as JSON.
      throw Object.assign(new Error("That page doesn't exist."), { status: 404, data: {} });
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(data.error || `Request failed (${res.status})`), { status: res.status, data });
    return data;
  }

  async function loadTree() {
    state.tree = await fetchJson('/api/tree.json');
    renderTree();
    markActive();
  }

  // ---------- Sidebar ----------

  const KNOWN_HUES = { javascript: 45, typescript: 218, react: 190, postgresql: 262, python: 205, sql: 150, html: 15, css: 230, git: 10, node: 110, nodejs: 110 };

  function hue(name) {
    const known = KNOWN_HUES[name.toLowerCase()];
    if (known !== undefined) return known;
    let h = 0;
    for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 360;
    return h;
  }

  function monogram(name) {
    const known = { javascript: 'JS', typescript: 'TS', react: 'Re', postgresql: 'PG', python: 'Py', sql: 'SQL', html: 'H5', css: 'C3', nodejs: 'No', node: 'No' };
    return known[name.toLowerCase()] || name.replace(/[^A-Za-z0-9]/g, '').slice(0, 2);
  }

  // "02 Variables" -> { num: "02", name: "Variables" }
  function splitTitle(title) {
    const m = title.match(/^(\d+)\s+(.*)$/);
    return m ? { num: m[1], name: m[2] } : { num: '', name: title };
  }

  function chapterHome(c) {
    return c.notes || c.exercises || (c.docs[0] && c.docs[0].path) || (c.starter && c.starter.path) || c.path;
  }

  function setExpanded(name, open) {
    state.expanded[name] = open;
    store.set('expanded', state.expanded);
  }

  function chapterLink(c) {
    const { num, name } = splitTitle(c.title);
    const status = c.done === null ? '' : `<span class="status${c.done ? ' done' : ''}">${c.done ? ICONS.check : ''}</span>`;
    return (
      `<a class="tree-link chapter" data-chapter="${esc(c.path)}" href="${href(chapterHome(c))}">` +
      status +
      (num ? `<span class="num">${esc(num)}</span>` : '') +
      `<span class="name">${esc(name)}</span>` +
      (c.isProject ? '<span class="badge">Project</span>' : '') +
      '</a>'
    );
  }

  function pageLink(p) {
    return `<a class="tree-link" data-path="${esc(p.path)}" href="${href(p.path)}">${ICONS.file}<span class="name">${esc(p.title)}</span></a>`;
  }

  function renderTree() {
    const tree = state.tree;
    let html = '';
    for (const s of tree.subjects) {
      const open = Boolean(state.expanded[s.name]);
      html +=
        `<section class="subject${open ? ' open' : ''}" data-subject="${esc(s.name)}">` +
        `<button class="subject-btn" type="button" aria-expanded="${open}">` +
        `<span class="monogram" style="--h:${hue(s.name)}">${esc(monogram(s.name))}</span>` +
        `<span class="subject-name">${esc(s.name)}</span>` +
        (s.progress.total ? `<span class="subject-count">${s.progress.done}/${s.progress.total}</span>` : '') +
        ICONS.chevron +
        '</button>' +
        '<div class="subject-body">';
      if (s.readme) {
        html += `<a class="tree-link overview" data-path="${esc(s.readme)}" href="${href(s.readme)}">${ICONS.home}<span class="name">Overview</span></a>`;
      }
      for (const g of s.groups) {
        if (g.title) html += `<div class="group-title">${esc(g.title)}</div>`;
        for (const c of g.chapters) html += chapterLink(c);
      }
      for (const p of s.pages) html += pageLink(p);
      html += '</div></section>';
    }
    if (tree.pages.length) {
      html += '<div class="group-title">Other files</div>';
      for (const p of tree.pages) html += pageLink(p);
    }
    if (!tree.subjects.length && !tree.pages.length) {
      html = '<div class="empty">No Markdown files found yet. Add a subject folder and refresh.</div>';
    }
    els.tree.innerHTML = html;
  }

  // Highlight the current page in the sidebar and make sure its subject is open.
  function markActive() {
    for (const a of els.tree.querySelectorAll('.tree-link.active')) a.classList.remove('active');
    const ctx = state.page && state.page.context;
    let link = null;
    if (ctx && ctx.chapter) link = els.tree.querySelector(`.tree-link[data-chapter="${CSS.escape(ctx.chapter.path)}"]`);
    if (!link && state.path) link = els.tree.querySelector(`.tree-link[data-path="${CSS.escape(state.path)}"]`);
    if (!link) return;

    link.classList.add('active');
    const section = link.closest('.subject');
    if (section && !section.classList.contains('open')) {
      section.classList.add('open');
      section.querySelector('.subject-btn').setAttribute('aria-expanded', 'true');
      setExpanded(section.dataset.subject, true);
    }
    link.scrollIntoView({ block: 'nearest' });
  }

  els.tree.addEventListener('click', (e) => {
    const btn = e.target.closest('.subject-btn');
    if (!btn) return;
    const section = btn.closest('.subject');
    const open = !section.classList.contains('open');
    section.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    setExpanded(section.dataset.subject, open);
  });

  // ---------- Routing ----------

  function pathFromUrl() {
    try {
      return decodeURIComponent(location.pathname).replace(/^\/+/, '').replace(/\/+$/, '');
    } catch {
      return location.pathname.slice(1);
    }
  }

  async function route() {
    closeSidebar();
    const path = pathFromUrl();
    if (!path) return showHome();
    await showPage(path);
  }

  function navigate(url) {
    history.pushState(null, '', url);
    route();
  }

  function scrollToHash() {
    let id;
    try {
      id = decodeURIComponent(location.hash.slice(1));
    } catch {
      return;
    }
    const el = id && document.getElementById(id);
    if (el) el.scrollIntoView();
  }

  // Clicks on links inside the app: load the page here instead of a full reload.
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target && a.target !== '_self') return;
    if (a.hasAttribute('download')) return;

    let url;
    try {
      url = new URL(a.href, location.href);
    } catch {
      return;
    }
    if (url.origin !== location.origin) return; // external sites, vscode:// links, mailto:
    if (ASSET_RE.test(url.pathname)) {
      a.target = '_blank'; // PDFs and pictures open in a new tab
      return;
    }
    if (url.pathname === location.pathname && url.hash) return; // a jump within this page

    e.preventDefault();
    if (a.closest('#search-results')) closeSearch();
    navigate(url.pathname + url.search + url.hash);
  });

  window.addEventListener('popstate', () => {
    if (pathFromUrl() === state.path) {
      scrollToHash(); // only the #hash changed
      return;
    }
    route();
  });

  // ---------- Pages ----------

  async function showPage(path, { keepScroll = false } = {}) {
    const requestId = ++state.request;
    const scrollY = window.scrollY;
    state.path = path;
    els.content.classList.add('loading');

    let page;
    try {
      page = await fetchJson(pageUrl(path));
    } catch (err) {
      if (requestId !== state.request) return;
      els.content.classList.remove('loading');
      renderError(err);
      return;
    }
    if (requestId !== state.request) return;

    // The server may have picked a file for a folder URL. Keep the address bar honest.
    if (page.path !== path) {
      state.path = page.path;
      history.replaceState(null, '', href(page.path) + location.hash);
    }

    state.page = page;
    renderPage(page);
    renderToc(page.toc);
    markActive();
    els.content.classList.remove('loading');

    const subjectName = page.context && page.context.subject ? page.context.subject.name : '';
    document.title = [page.title, subjectName, 'Learning Docs'].filter(Boolean).join(' · ');
    els.topbarTitle.textContent = page.title;

    if (keepScroll) window.scrollTo(0, scrollY);
    else if (location.hash) scrollToHash();
    else window.scrollTo(0, 0);
  }

  function doneButton(chapter) {
    if (chapter.done === null) return '';
    if (!state.tree.live) {
      // The published copy can't write to the README, so it only shows the state.
      return chapter.done ? `<span class="done-btn is-done static"><span class="ring">${ICONS.check}</span><span>Completed</span></span>` : '';
    }
    const title = chapter.done ? 'Click to mark this chapter as not done' : 'Tick this chapter off in the roadmap';
    return (
      `<button class="done-btn${chapter.done ? ' is-done' : ''}" id="done-btn" type="button" title="${title}">` +
      `<span class="ring">${chapter.done ? ICONS.check : ''}</span>` +
      `<span>${chapter.done ? 'Completed' : 'Mark as done'}</span>` +
      '</button>'
    );
  }

  function progressBar(done, total) {
    const pct = total ? Math.round((done / total) * 100) : 0;
    return (
      '<div class="progress-wrap">' +
      `<div class="progress"><span style="width:${pct}%"></span></div>` +
      `<div class="progress-text"><span>${done} of ${total} chapters done</span><span>${pct}%</span></div>` +
      '</div>'
    );
  }

  function subjectBanner(subject) {
    const { done, total } = subject.progress;
    let html = '<div class="subject-banner">';
    if (total) {
      html += progressBar(done, total);
      if (subject.next) {
        html += `<a class="chip chip-accent" href="${href(subject.next.path)}">${done ? 'Continue' : 'Start'}: ${esc(subject.next.title)} ${ICONS.arrowRight}</a>`;
      }
    }
    for (const d of subject.downloads) {
      html += `<a class="chip" href="${href(d.path)}" target="_blank" rel="noopener">${ICONS.download} ${d.kind === 'pdf' ? 'PDF' : 'Word'}</a>`;
    }
    html += '</div>';
    return html;
  }

  function renderPage(page) {
    const ctx = page.context || {};
    let head = '';

    // Breadcrumbs
    const crumbs = ['<a href="/">Home</a>'];
    if (ctx.subject) {
      crumbs.push(`<a href="${href(ctx.subject.readme || ctx.subject.path)}">${esc(ctx.subject.name)}</a>`);
      if (ctx.chapter && ctx.chapter.group) crumbs.push(`<span>${esc(ctx.chapter.group)}</span>`);
    }
    head += `<div class="crumbs">${crumbs.join('<span class="sep">/</span>')}</div>`;

    // Notes / Exercises tabs and the "Mark as done" button
    if (ctx.chapter) {
      const tabs = ctx.chapter.tabs
        .map((t) => {
          const active = page.path === t.path || page.path.startsWith(t.path + '/');
          return `<a class="tab${active ? ' active' : ''}" href="${href(t.path)}">${esc(t.label)}</a>`;
        })
        .join('');
      head += `<div class="page-tools"><div class="tabs">${tabs}</div>${doneButton(ctx.chapter)}</div>`;
    }

    if (ctx.role === 'readme' && ctx.subject) head += subjectBanner(ctx.subject);

    // Previous / next chapter
    let foot = '';
    if (ctx.chapter && (ctx.chapter.prev || ctx.chapter.next)) {
      foot += '<nav class="pager" aria-label="Previous and next chapter">';
      if (ctx.chapter.prev) {
        foot += `<a class="prev" href="${href(ctx.chapter.prev.path)}"><span class="label">${ICONS.arrowLeft} Previous</span><span class="title">${esc(ctx.chapter.prev.title)}</span></a>`;
      }
      if (ctx.chapter.next) {
        foot += `<a class="next" href="${href(ctx.chapter.next.path)}"><span class="label">Next ${ICONS.arrowRight}</span><span class="title">${esc(ctx.chapter.next.title)}</span></a>`;
      }
      foot += '</nav>';
    }
    if (page.file && state.tree.live) {
      const fileUrl = 'vscode://file/' + encodeURI(page.file.replace(/\\/g, '/'));
      foot += `<div class="page-foot"><a href="${esc(fileUrl)}" title="Opens the file in VS Code, if you have it installed">Open in VS Code</a></div>`;
    }

    els.content.innerHTML = `<div class="page-head">${head}</div><div class="markdown">${page.html}</div>${foot}`;
  }

  function renderError(err) {
    const raw = err.data && err.data.raw;
    els.content.innerHTML =
      '<div class="page-head"><div class="crumbs"><a href="/">Home</a></div></div>' +
      '<div class="markdown"><h1>Nothing to show here</h1>' +
      `<p>${esc(err.message)}</p>` +
      (raw ? `<p><a href="${esc(raw)}" target="_blank" rel="noopener">Open the file directly</a></p>` : '') +
      '<p><a href="/">Back to the home page</a></p></div>';
    state.page = null;
    renderToc([]);
    markActive();
    document.title = 'Learning Docs';
    els.topbarTitle.textContent = 'Learning Docs';
  }

  function showHome({ keepScroll = false } = {}) {
    const scrollY = window.scrollY;
    state.request++;
    state.path = '';
    state.page = null;
    const tree = state.tree;

    const cards = tree.subjects
      .map((s) => {
        const { done, total } = s.progress;
        const pct = total ? Math.round((done / total) * 100) : 0;
        const allDone = total > 0 && done === total;
        const next = s.chapters.find((c) => c.done === false) || (allDone ? null : s.chapters[0]);
        const projects = s.chapters.filter((c) => c.isProject).length;
        const meta = [
          `${s.chapters.length} chapter${s.chapters.length === 1 ? '' : 's'}`,
          projects ? `${projects} project${projects === 1 ? '' : 's'}` : '',
        ]
          .filter(Boolean)
          .join(' · ');

        let cta = '';
        if (next) cta = `<a class="card-cta" href="${href(chapterHome(next))}">${done ? 'Continue' : 'Start'}: ${esc(next.title)} ${ICONS.arrowRight}</a>`;
        else if (allDone) cta = `<span class="card-cta done">${ICONS.check} All chapters done</span>`;

        return (
          '<div class="card">' +
          `<a class="card-top" href="${href(s.readme || s.path)}">` +
          `<span class="monogram" style="--h:${hue(s.name)}">${esc(monogram(s.name))}</span>` +
          `<span><span class="card-title">${esc(s.name)}</span><span class="card-meta">${esc(meta)}</span></span>` +
          '</a>' +
          (total ? `<div class="progress-wrap"><div class="progress"><span style="width:${pct}%"></span></div><div class="progress-text"><span>${done} of ${total} done</span><span>${pct}%</span></div></div>` : '') +
          cta +
          '</div>'
        );
      })
      .join('');

    const other = tree.pages.length
      ? `<h2>Other files</h2><ul class="file-list">${tree.pages.map((p) => `<li><a href="${href(p.path)}">${ICONS.file}${esc(p.title)}</a></li>`).join('')}</ul>`
      : '';

    els.content.innerHTML =
      '<div class="home">' +
      '<h1>My Learning Docs</h1>' +
      `<p class="lead">Pick a subject and carry on where you left off.${tree.live ? ' Everything here is read straight from your notes folder, so it is always up to date.' : ''}</p>` +
      (tree.subjects.length ? `<div class="cards">${cards}</div>` : '<p>No subjects yet. Add a folder with Markdown files and refresh.</p>') +
      other +
      '</div>';

    renderToc([]);
    markActive();
    document.title = 'Learning Docs';
    els.topbarTitle.textContent = 'Learning Docs';
    window.scrollTo(0, keepScroll ? scrollY : 0);
  }

  // ---------- Table of contents ("On this page") ----------

  let tocLinks = [];
  let tocHeadings = [];

  function renderToc(toc) {
    tocLinks = [];
    tocHeadings = [];
    if (!toc || toc.length < 2) {
      els.toc.hidden = true;
      els.toc.innerHTML = '';
      return;
    }
    els.toc.hidden = false;
    els.toc.innerHTML =
      '<div class="toc-title">On this page</div>' +
      `<ul>${toc.map((h) => `<li class="lvl${h.level}"><a href="#${esc(h.id)}">${esc(h.text)}</a></li>`).join('')}</ul>`;
    tocLinks = [...els.toc.querySelectorAll('a')];
    tocHeadings = toc.map((h) => document.getElementById(h.id)).filter(Boolean);
    updateToc();
  }

  function updateToc() {
    if (!tocHeadings.length) return;
    let current = tocHeadings[0];
    for (const h of tocHeadings) {
      if (h.getBoundingClientRect().top <= 110) current = h;
      else break;
    }
    for (const a of tocLinks) a.classList.toggle('active', a.getAttribute('href') === '#' + current.id);
  }

  let scrollTick = false;
  window.addEventListener(
    'scroll',
    () => {
      if (scrollTick) return;
      scrollTick = true;
      requestAnimationFrame(() => {
        updateToc();
        scrollTick = false;
      });
    },
    { passive: true }
  );

  // ---------- Buttons inside the page ----------

  els.content.addEventListener('click', (e) => {
    const copy = e.target.closest('.copy-btn');
    if (copy) return copyCode(copy);
    const done = e.target.closest('#done-btn');
    if (done) return toggleDone(done);
  });

  async function copyCode(btn) {
    const code = btn.parentElement.querySelector('code');
    const text = code ? code.innerText : '';
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const area = document.createElement('textarea');
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }
    btn.textContent = 'Copied!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = 'Copy';
      btn.classList.remove('copied');
    }, 1600);
  }

  async function toggleDone(btn) {
    const chapter = state.page && state.page.context && state.page.context.chapter;
    if (!chapter) return;
    btn.disabled = true;
    try {
      const result = await fetchJson('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: chapter.path, done: !chapter.done }),
      });
      chapter.done = result.done;
      btn.outerHTML = doneButton(chapter);
      await loadTree();
    } catch (err) {
      btn.disabled = false;
      alert(`Couldn't update the roadmap: ${err.message}`);
    }
  }

  // ---------- Search ----------
  // Searching happens in the browser. The server (or the static build) hands over the plain
  // text of every page once, and we look through it here. That is why it also works on Netlify.

  let searchTimer = null;
  let searchRequest = 0;
  let searchIndex = null;
  let searchIndexPromise = null;

  function loadSearchIndex() {
    if (searchIndex) return Promise.resolve(searchIndex);
    if (!searchIndexPromise) {
      searchIndexPromise = fetchJson('/api/search-index.json')
        .then((data) => {
          searchIndex = data.documents.map((d) => ({
            ...d,
            lower: d.text.toLowerCase(),
            titleLower: `${d.title} ${d.kind}`.toLowerCase(),
          }));
          return searchIndex;
        })
        .catch((err) => {
          searchIndexPromise = null;
          throw err;
        });
    }
    return searchIndexPromise;
  }

  function invalidateSearchIndex() {
    searchIndex = null;
    searchIndexPromise = null;
  }

  const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // A short piece of text around the first match, with the matches highlighted.
  function makeSnippet(text, index, terms) {
    if (index < 0) index = 0;
    let start = Math.max(0, index - 60);
    let end = Math.min(text.length, index + 140);
    if (start > 0) {
      const space = text.indexOf(' ', start);
      if (space !== -1 && space < index) start = space + 1;
    }
    if (end < text.length) {
      const space = text.lastIndexOf(' ', end);
      if (space > index) end = space;
    }
    const snippet = text.slice(start, end).replace(/\s+/g, ' ').trim();
    const pattern = new RegExp(terms.map(escapeRegExp).join('|'), 'gi');
    let html = '';
    let last = 0;
    for (const match of snippet.matchAll(pattern)) {
      html += esc(snippet.slice(last, match.index)) + `<mark>${esc(match[0])}</mark>`;
      last = match.index + match[0].length;
    }
    html += esc(snippet.slice(last));
    return (start > 0 ? '… ' : '') + html + (end < text.length ? ' …' : '');
  }

  // Every word typed must appear in the page (or its title). Pages that mention the
  // words more often, or in the title, come first.
  function searchDocuments(docs, query, limit = 25) {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean).slice(0, 6);
    if (!terms.length) return [];
    const results = [];
    for (const doc of docs) {
      let score = 0;
      let firstIndex = -1;
      let allFound = true;
      for (const term of terms) {
        const inTitle = doc.titleLower.includes(term);
        let idx = doc.lower.indexOf(term);
        if (idx === -1 && !inTitle) {
          allFound = false;
          break;
        }
        if (idx !== -1 && (firstIndex === -1 || idx < firstIndex)) firstIndex = idx;
        let count = 0;
        while (idx !== -1 && count < 25) {
          count++;
          idx = doc.lower.indexOf(term, idx + term.length);
        }
        score += count + (inTitle ? 40 : 0);
      }
      if (!allFound) continue;
      results.push({ path: doc.path, title: doc.title, kind: doc.kind, crumb: doc.crumb, score, snippet: makeSnippet(doc.text, firstIndex, terms) });
    }
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
  }

  els.search.addEventListener('input', () => {
    clearTimeout(searchTimer);
    const q = els.search.value.trim();
    if (!q) return closeSearch(false);
    searchTimer = setTimeout(() => runSearch(q), 160);
  });

  function showResultsPanel() {
    els.tree.hidden = true;
    els.results.hidden = false;
    els.results.parentElement.scrollTop = 0; // the list may have been scrolled to the current chapter
  }

  async function runSearch(q) {
    const requestId = ++searchRequest;
    if (!searchIndex) {
      showResultsPanel();
      els.results.innerHTML = '<div class="empty">Loading the search index…</div>';
    }
    let docs;
    try {
      docs = await loadSearchIndex();
    } catch (err) {
      if (requestId !== searchRequest) return;
      els.results.innerHTML = `<div class="empty">Search isn't available right now: ${esc(err.message)}</div>`;
      return;
    }
    if (requestId !== searchRequest || els.search.value.trim() !== q) return;

    const results = searchDocuments(docs, q);
    showResultsPanel();
    if (!results.length) {
      els.results.innerHTML = `<div class="empty">Nothing found for “${esc(q)}”.</div>`;
      return;
    }
    els.results.innerHTML = results
      .map(
        (r, i) =>
          `<a class="result${i === 0 ? ' selected' : ''}" href="${href(r.path)}">` +
          `<div class="result-title"><span>${esc(r.title)}</span>${r.kind ? `<span class="result-kind">${esc(r.kind)}</span>` : ''}</div>` +
          (r.crumb ? `<div class="result-crumb">${esc(r.crumb)}</div>` : '') +
          `<div class="result-snippet">${r.snippet}</div>` +
          '</a>'
      )
      .join('');
  }

  function closeSearch(clearInput = true) {
    if (clearInput) els.search.value = '';
    searchRequest++;
    els.results.hidden = true;
    els.results.innerHTML = '';
    els.tree.hidden = false;
    markActive(); // scroll the sidebar back to the current chapter
  }

  els.search.addEventListener('keydown', (e) => {
    const items = [...els.results.querySelectorAll('.result')];
    const index = items.findIndex((el) => el.classList.contains('selected'));
    if (e.key === 'Escape') {
      closeSearch();
      els.search.blur();
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!items.length) return;
      e.preventDefault();
      const next = (index + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
      items.forEach((el, i) => el.classList.toggle('selected', i === next));
      items[next].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      const chosen = items[index] || items[0];
      if (chosen) {
        closeSearch();
        navigate(chosen.getAttribute('href'));
      }
    }
  });

  document.addEventListener('keydown', (e) => {
    const typing = /^(input|textarea|select)$/i.test(e.target.tagName) || e.target.isContentEditable;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openSidebar();
      els.search.focus();
      els.search.select();
    } else if (e.key === '/' && !typing) {
      e.preventDefault();
      openSidebar();
      els.search.focus();
    }
  });

  // ---------- Sidebar on small screens ----------

  function openSidebar() {
    if (window.innerWidth <= 900) els.body.classList.add('sidebar-open');
  }
  function closeSidebar() {
    els.body.classList.remove('sidebar-open');
  }
  els.menuBtn.addEventListener('click', () => els.body.classList.toggle('sidebar-open'));
  els.backdrop.addEventListener('click', closeSidebar);

  // ---------- Live updates when a file changes ----------

  function connectLive() {
    if (!state.tree.live || !('EventSource' in window)) return; // the static copy has no server to listen to
    const source = new EventSource('/api/events');
    source.onmessage = async (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }
      const changed = data.changed || [];
      invalidateSearchIndex();
      await loadTree().catch(() => {});
      if (!state.path) {
        showHome({ keepScroll: true });
        return;
      }
      const readme = state.page && state.page.context && state.page.context.subject ? state.page.context.subject.readme : null;
      const affected = changed.some(
        (f) => f === state.path || state.path.startsWith(f + '/') || f.startsWith(state.path + '/') || f === readme
      );
      if (affected) showPage(state.path, { keepScroll: true });
    };
  }

  // ---------- Start ----------

  async function init() {
    applyTheme(currentTheme());
    // "?theme=dark" has done its job (see index.html); tidy it out of the address bar.
    if (new URLSearchParams(location.search).has('theme')) history.replaceState(null, '', location.pathname + location.hash);
    els.themeBtn.addEventListener('click', () => applyTheme(currentTheme() === 'dark' ? 'light' : 'dark'));
    try {
      await loadTree();
    } catch (err) {
      els.tree.innerHTML = `<div class="empty">Couldn't load the folder list: ${esc(err.message)}</div>`;
    }
    await route();
    connectLive();
  }

  init();
})();
