# The docs website

A small website that shows every lesson in this folder like real documentation:
a sidebar with all subjects and chapters, Notes and Exercises tabs, search, light and dark mode,
and a "Mark as done" button that ticks the chapter off in the subject's README.

It runs on your own computer, and it can also be published on Netlify (see below).

## Start it

You need [Node.js](https://nodejs.org) (version 18 or newer).

**The easy way (Windows):** double-click `start.cmd` in this folder.

**From a terminal:**

```
cd website
npm install     # only the first time
npm start
```

Your browser opens at <http://localhost:3030>. Press `Ctrl+C` in the terminal to stop.

If port 3030 is busy, pick another one:

```
set PORT=3031 && npm start        # Windows cmd
$env:PORT=3031; npm start         # PowerShell
```

## Put it online with Netlify

[Netlify](https://www.netlify.com) hosts static websites for free. "Static" means plain files with no
server running, so first the site is turned into plain files:

```
cd website
npm run build
```

This writes everything into `website/dist/` (about 30 seconds). Then pick one of two ways to publish:

**Way 1: drag and drop (no Git needed).**
Go to <https://app.netlify.com/drop> and drag the `website/dist` folder onto the page.
Netlify gives you a link straight away. Repeat the build and the drag whenever you want to update it.

**Way 2: automatic from Git.**
Push this repository to GitHub (or GitLab or Bitbucket). In Netlify choose
*Add new site → Import an existing project*, pick the repository, and click *Deploy*.
The settings are already in `netlify.toml` at the top of the repository, so there is nothing to fill in.
From then on, every push rebuilds and republishes the site.

**What's different online**

- "Mark as done" is read-only. A chapter shows *Completed* if its box is ticked in the README
  at the time of the build. Tick boxes in the README (or locally with the button) and publish again.
- Live refresh is off, since nothing can change on a static host.
- The site is public: anyone with the link can read it.
- The course PDFs and Word files are included, so the first upload takes a moment.

## How it works

- `server.js` is a tiny web server with no framework. It reads the folders next to `website/`,
  turns Markdown into HTML with [marked](https://marked.js.org), and colours code with
  [highlight.js](https://highlightjs.org).
- `build.js` writes the same pages the server would serve into `dist/` as plain files, for Netlify.
- `lib/tree.js` builds the sidebar from the folder names and each subject's `README.md`
  (the `## Level ...` headings and `- [ ]` checkboxes).
- `lib/pages.js` renders one page and works out its tabs and previous/next chapter.
- `lib/search.js` collects the plain text of every page. The browser does the searching itself,
  so search works both locally and on Netlify.
- `public/` is the page you see: one HTML file, one stylesheet, one script.

Locally, nothing is cached or built in advance. Edit a `.md` file and the page updates by itself.

## Tips

- `Ctrl+K` or `/` jumps to the search box.
- Hover over a code block to get a Copy button.
- Hover over a heading to get a link to that section.
- The theme button (top of the sidebar) switches between light and dark. Your choice is remembered.
- "Open in VS Code" at the bottom of a page opens the file in your editor.
