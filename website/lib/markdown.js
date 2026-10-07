'use strict';
// Turns Markdown (and plain text or code files) into the HTML the website shows.
// Uses "marked" to parse Markdown and "highlight.js" to colour code blocks.

const { Marked } = require('marked');
const hljs = require('highlight.js');

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

// Names people type after ``` that highlight.js knows by another name.
const LANG_ALIASES = {
  js: 'javascript', mjs: 'javascript', cjs: 'javascript', jsx: 'javascript',
  ts: 'typescript', tsx: 'typescript',
  html: 'xml', htm: 'xml', svg: 'xml', vue: 'xml',
  sh: 'bash', zsh: 'bash', shell: 'bash',
  ps1: 'powershell', ps: 'powershell',
  cmd: 'dos', bat: 'dos',
  yml: 'yaml', md: 'markdown', py: 'python',
  // These mean "no colours": program output, plain text, and so on.
  text: null, txt: null, plain: null, plaintext: null, output: null, console: null, none: null,
};

function highlight(code, lang) {
  const key = (lang || '').toLowerCase();
  const name = key in LANG_ALIASES ? LANG_ALIASES[key] : key;
  if (name && hljs.getLanguage(name)) {
    return { html: hljs.highlight(code, { language: name, ignoreIllegals: true }).value, language: name };
  }
  return { html: escapeHtml(code), language: null };
}

function codeBlock(html, label) {
  return (
    '<div class="code-block">' +
    `<span class="code-lang">${escapeHtml(label || '')}</span>` +
    '<button class="copy-btn" type="button">Copy</button>' +
    `<pre><code class="hljs">${html}</code></pre>` +
    '</div>\n'
  );
}

// Blockquotes that start with a bold word like "Watch out:" become coloured callouts.
const CALLOUTS = [
  [/^(watch out|warning|careful|caution|danger|gotcha)/i, 'warning'],
  [/^(tip|hint|pro tip|try it|try this|shortcut)/i, 'tip'],
  [/^(note|remember|key idea|important|why|think about it|rule of thumb)/i, 'note'],
];

function slugify(text) {
  return (
    decodeEntities(text)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-') || 'section'
  );
}

function createMarked(state) {
  const marked = new Marked();
  marked.use({
    gfm: true,
    renderer: {
      heading({ tokens, depth }) {
        const html = this.parser.parseInline(tokens);
        const text = decodeEntities(html.replace(/<[^>]+>/g, '')).trim();
        let id = slugify(text);
        if (state.ids.has(id)) {
          let n = 2;
          while (state.ids.has(`${id}-${n}`)) n++;
          id = `${id}-${n}`;
        }
        state.ids.add(id);
        if (depth === 1 && !state.title) state.title = text;
        if (depth === 2 || depth === 3) state.toc.push({ id, text, level: depth });
        return `<h${depth} id="${id}">${html}<a class="anchor" href="#${id}" aria-label="Link to this section">#</a></h${depth}>\n`;
      },
      code({ text, lang }) {
        const label = (lang || '').trim().split(/\s+/)[0];
        const { html } = highlight(text, label);
        return codeBlock(html, label);
      },
      blockquote({ tokens }) {
        const body = this.parser.parse(tokens);
        const lead = body.match(/^\s*<p><strong>([^<]{1,40})<\/strong>/i);
        let kind = '';
        if (lead) {
          for (const [pattern, name] of CALLOUTS) {
            if (pattern.test(lead[1])) {
              kind = name;
              break;
            }
          }
        }
        const cls = kind ? ` class="callout callout-${kind}"` : '';
        return `<blockquote${cls}>\n${body}</blockquote>\n`;
      },
      link({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens);
        const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
        const isExternal = /^[a-z][a-z0-9+.-]*:/i.test(href);
        if (isExternal) {
          return `<a href="${escapeHtml(href)}"${titleAttr} target="_blank" rel="noopener noreferrer" class="external">${text}</a>`;
        }
        return `<a href="${escapeHtml(href)}"${titleAttr}>${text}</a>`;
      },
    },
    hooks: {
      postprocess(html) {
        // Wide tables scroll sideways instead of breaking the layout.
        return html.replace(/<table>/g, '<div class="table-wrap"><table>').replace(/<\/table>/g, '</table></div>');
      },
    },
  });
  return marked;
}

// Markdown -> { html, title, toc }
function renderMarkdown(source) {
  const state = { ids: new Set(), title: null, toc: [] };
  const html = createMarked(state).parse(source);
  return { html, title: state.title, toc: state.toc };
}

// A .txt file: shown as-is, with line wrapping.
function renderText(source) {
  return `<pre class="plain-text">${escapeHtml(source)}</pre>`;
}

// A code file (starter files, for example): one highlighted block with the file name on top.
function renderCode(source, filename) {
  const ext = (filename.split('.').pop() || '').toLowerCase();
  const { html } = highlight(source, ext);
  return codeBlock(html, filename);
}

module.exports = { renderMarkdown, renderText, renderCode, escapeHtml };
