# 40 Deploying

## What is it?

**Deploying** means putting your app on a computer that's always switched on and connected to the internet, so anyone can open it with a link. That computer is called a **host**.

For a Vite app, deploying has two parts:

1. **Build** it into plain HTML, CSS and JavaScript files, with `npm run build`.
2. **Upload** those files to a host, which gives you a web address like `https://my-bookstore.netlify.app`.

A Next.js app from [chapter 39](../39-nextjs-and-server-components/notes.md) is a little different. Some of its code runs on a server, so it needs a host that can run code, not just hand out files.

No new library this time. This chapter was written with **Vite 8** (the tool that made your apps in [chapter 01](../01-getting-started/notes.md)) and **Next.js 16**. One honest warning up front: hosting companies change their names, their free plans and their dashboards often. So this chapter explains *what* you're doing and *why*. If a button has moved or a screen looks different, look for the same idea under a new name.

## Why does it matter?

An app that only runs on `localhost` can only be used on your computer, by you. You can't send it to a friend, try it on your phone, or put a link in a job application.

Deploying also shows you bugs that `npm run dev` hides:

- **Refreshing a page gives a "404 Not Found".** Clicking to `/books/3` works, but pressing refresh on it doesn't.
- **A setting is missing.** The app works on your computer and breaks online, because a setting only existed in a file on your laptop.
- **Capital letters matter.** Windows treats `Button.tsx` and `button.tsx` as the same file. The Linux computers that build your app online don't.
- **`localhost` stops working.** Your task board from [chapter 37](../37-project-task-board/notes.md) talks to `http://localhost:3001`. Online, that address points somewhere else entirely.

You'll meet, and fix, every one of these in this chapter.

## Real-world example

Think about the difference between cooking for yourself and running a food stall.

| Running a food stall | Deploying an app |
|---|---|
| Cooking in your own kitchen, just for you | `npm run dev` on `localhost` |
| Cooking the food in advance, ready to serve | `npm run build` |
| Packing it into boxes | The `dist` folder |
| Tasting one box before you open | `npm run preview` |
| Renting a pitch at the market | A host |
| A sign so people can find you | The URL |
| Changing the recipe means cooking and restocking | Changing the code means building and deploying again |
| The secret family recipe stays at home | Secrets never go in the build |

Nobody at the market can taste food that's still in your kitchen. And they can read every label on every box you bring.

## How it works

### Build it

Open a terminal in your bookstore from [chapter 29](../29-project-online-bookstore/notes.md) (`React/bookstore`) and run:

```
npm run build
```

You'll see something like this (your numbers and names will be different):

```
dist/index.html                         0.46 kB │ gzip:  0.29 kB
dist/assets/index-DqX3a7Lm.css          6.10 kB │ gzip:  1.84 kB
dist/assets/CheckoutPage-C1bN8sQe.js    2.87 kB │ gzip:  1.19 kB
dist/assets/index-B4hTz9Wk.js         248.33 kB │ gzip: 78.52 kB
✓ built in 1.24s
```

Vite has made a new folder called `dist` (short for "distribution"):

```
dist/
├── index.html                  the one HTML page
├── (anything from public/)     like the tab icon, copied as it is
└── assets/
    ├── index-B4hTz9Wk.js        all your components, joined and shrunk
    ├── index-DqX3a7Lm.css       all your CSS
    └── CheckoutPage-C1bN8sQe.js  the lazy checkout page from chapter 26
```

That `CheckoutPage` file is the **chunk** you split off with `lazy` in [chapter 26](../26-error-boundaries-and-suspense/notes.md). A chunk is one piece of your app's code, downloaded only when it's needed.

**This folder is your whole app.** No `.tsx` files, no `node_modules`, no TypeScript. Just files a browser can read. The `dist` folder is what you upload, never your project folder.

### Hashed file names

What's that jumble in `index-B4hTz9Wk.js`? It's a **hash**: a short fingerprint made from the file's contents. Change one letter of your code, build again, and the fingerprint changes, so the file gets a new name.

Why bother? Browsers **cache** files (keep a copy, so they don't download them again). That's great for speed, but it has a risk: a visitor's browser might keep using yesterday's code after you've fixed a bug.

Hashed names solve it. If the code changes, the name changes, and `index.html` points to the new name. The browser has never seen that name, so it downloads it fresh. If the code didn't change, the name stays the same, and the cached copy is still correct. It's like an edition number on a book: a new edition gets a new number, so nobody confuses it with the old one.

There's one catch, and you've met it before. Someone opens your site, you deploy a new version, and *then* they click through to checkout. Their old page asks for the old `CheckoutPage-C1bN8sQe.js`, which may be gone. That's the "deploy that removed the old chunk" from [chapter 26](../26-error-boundaries-and-suspense/notes.md), and it's why an error boundary around lazy routes is worth having.

### Test the real build with `npm run preview`

```
npm run preview
```

This serves your `dist` folder at `http://localhost:4173`, almost the same way a host would (one difference comes up below). It's your "taste one box" step. You used it in chapters 26 and 27 to see chunks load and to measure real speed. Before any deploy, click through the preview once.

### Check before you ship

Open your app's `package.json` and find the `build` script. In the Vite React + TypeScript template, it looks like this:

```json
"build": "tsc -b && vite build"
```

`&&` means "only run the second command if the first one worked". So a type error stops the build, and you can't publish an app TypeScript knows is broken ([chapter 01](../01-getting-started/notes.md) promised you this). If your script is different, run `npx tsc -b` yourself first.

The build doesn't run your tests, so run those too:

```
npm test -- --run
```

`npm test` on its own starts Vitest in watch mode, which never finishes. The `--` means "pass what comes next to the script, not to npm", and `--run` tells Vitest to run every test once and stop.

### Static hosting: any host that serves files will do

Your built bookstore is **static files**: files that are the same for every visitor. The host doesn't run any of your code. It just hands the files to browsers, and all the React work happens in the browser.

That means almost any host works. These four are popular, and all of them are fine for learning:

| Host | Upload a folder, no Git? | Builds from GitHub? | The refresh fix (below) | Runs Next.js server code? |
|---|---|---|---|---|
| **Netlify** | Yes (Netlify Drop) | Yes | A `_redirects` file | Yes |
| **Vercel** | Mostly Git, or its command-line tool | Yes | A `vercel.json` file | Yes (Vercel makes Next.js) |
| **Cloudflare** | Yes | Yes | Automatic on Pages, one setting on Workers | With an adapter |
| **GitHub Pages** | No | Yes | No built-in fix | No |

This isn't a ranking. Each one changes its plans and features often, so check their own pages before you pick. This chapter uses Netlify for the step-by-step parts, only because its drag-and-drop deploy needs no Git at all.

### Your first deploy: drag and drop

Start with the bookstore, because it has no API. Everything it needs is inside `dist`.

1. Run `npm run build` in `React/bookstore`.
2. Go to [app.netlify.com/drop](https://app.netlify.com/drop). Signing up or logging in first is a good idea. (At the time of writing, a site dropped without an account gets a temporary password until you claim it.)
3. Drag the **`dist` folder** (not the `bookstore` folder!) onto the page.
4. Wait a few seconds. Netlify gives you a link ending in `.netlify.app`.

Open it. Your bookstore is on the internet. Send the link to your phone and try it there too.

To update it later: build again, then drag the new `dist` onto your site's **Deploys** page. (Netlify can also build a project folder for you if you're logged in. Dropping `dist` yourself is still the clearest way to see what a deploy really is.)

### The refresh 404 problem

Now try this on your live bookstore:

1. Click through to a book, like `/books/3`. It works.
2. Press **refresh**. You get **Page not found**.

Here's why. When you clicked, no request went to the host at all. React Router ([chapter 24](../24-react-router/notes.md)) just changed the address bar and showed a different component. All of that lives inside `index.html` and its JavaScript.

When you refresh, the browser asks the host for `/books/3`. The host looks for a file called `books/3` in `dist`. There isn't one, so it says 404. The host has no idea your router exists.

The fix is a **rewrite**: a rule that tells the host "if you can't find a file for this address, send `index.html` instead". The page loads, React Router reads the address, and shows book 3. This is also called a **fallback**.

**On Netlify**, create a file called `_redirects` (no extension) in your `public/` folder:

```
/*    /index.html   200
```

Read it as: "for any address (`/*`), send `/index.html`, with status `200` (OK)". Vite copies everything in `public/` into `dist`, so the rule gets deployed with your app. Netlify only uses it when no real file matches, so your JavaScript and CSS files are still served as normal.

**On Vercel**, add a `vercel.json` file next to `package.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**On other hosts**, look for a setting called something like "single-page app", "rewrites" or "fallback". Cloudflare Pages does it automatically if you don't have a `404.html` file. On Cloudflare Workers it's one setting (`not_found_handling`). Cloudflare is moving its sites from Pages to Workers, so these names may change.

**GitHub Pages** has no built-in fallback, and it needs two extra steps. Your site usually lives at `https://your-name.github.io/bookstore/`, not at the root. So you set Vite's `base` option to `"/bookstore/"` in `vite.config.ts`, and give React Router the same starting point with `<BrowserRouter basename={import.meta.env.BASE_URL}>`. For refreshes, the common workaround is a copy of `index.html` called `404.html`. It works, but it's more fiddly than the others. [Vite's deploy guide](https://vite.dev/guide/static-deploy) walks through it.

Once the fix is live, a nonsense address like `/banana` also gets `index.html`. That's fine: your own `path="*"` route from chapter 29 shows your own 404 page.

**Why doesn't `npm run dev` have this problem?** Vite's dev server and `npm run preview` already do this fallback for you. That's why you only find the bug after deploying.

### Environment variables

Your recipe finder ([chapter 21](../21-project-recipe-finder/notes.md)) has TheMealDB's address typed into `api.ts`:

```ts
const BASE = "https://www.themealdb.com/api/json/v1/1";
```

Real apps often need different settings in different places: a test API on your laptop, the real one online. An **environment variable** is a setting that lives outside your code, so you can change it without touching the code. You used them with Node's `--env-file` in [JavaScript chapter 50](../../JavaScript/50-tooling/notes.md).

Vite reads them from `.env` files in your project folder (next to `package.json`, not in `src/`). Make a file called `.env.local`:

```
VITE_MEALDB_URL=https://www.themealdb.com/api/json/v1/1
```

Then read it in your code with `import.meta.env`:

```ts
const BASE = import.meta.env.VITE_MEALDB_URL;
```

The rules:

- **Only variables starting with `VITE_` reach your code.** Anything else in the file is ignored by your app. That prefix is on purpose: it stops you leaking a setting by accident. (Vite also fills in a few of its own, like `import.meta.env.DEV`, which you used in [chapter 30](../30-axios/notes.md).)
- **The value is always a string.** `VITE_DEMO_MODE=false` gives you the string `"false"`, which is truthy! Compare it: `import.meta.env.VITE_DEMO_MODE === "true"`.
- **The value is baked in when you build.** Vite swaps `import.meta.env.VITE_MEALDB_URL` for the actual text while building. Change the setting later, and you must build (and deploy) again.
- **If a new value doesn't show up in `npm run dev`**, stop the dev server and start it again.

Vite reads several files. These three are enough:

| File | Used by | Put in Git? |
|---|---|---|
| `.env.local` | Every command, on your computer only | No. Vite's own `.gitignore` skips `*.local` files |
| `.env.development` | `npm run dev` | Yes, if it holds nothing private |
| `.env.production` | `npm run build` | Yes, if it holds nothing private |

**Online, the host sets them for you.** Most hosts have an "Environment variables" page in their settings. Add `VITE_MEALDB_URL` there with the real value. When the host builds your app, Vite finds the variable and bakes it in. Variables set this way win over the ones in `.env` files. (With drag and drop, *you* build it, so the values come from your own `.env` files.)

### Typing your variables

By default, TypeScript types every `import.meta.env` value you haven't told it about as `any`. So a typo like `VITE_MEALBD_URL` slips straight through. Tell it which variables you have. Create `src/vite-env.d.ts`:

```ts
// src/vite-env.d.ts
interface ViteTypeOptions {
  strictImportMetaEnv: unknown;   // makes any name not listed below an error
}

interface ImportMetaEnv {
  readonly VITE_MEALDB_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

Now `import.meta.env.VITE_MEALBD_URL` is a type error, and `VITE_MEALDB_URL` is a `string`.

This is one of the places where you must use `interface`, not `type`. You're adding to interfaces Vite already defines. That's **declaration merging**, which [TypeScript chapter 04](../../TypeScript/04-type-aliases-and-interfaces/notes.md) said you'd rarely need. This is one of those rare times. Don't put any `import` lines in this file, or the merging stops working. (Older Vite templates created this file for you, with a `/// <reference types="vite/client" />` line at the top. If yours has that line, keep it. The `strictImportMetaEnv` switch only exists in recent Vite versions.)

But notice: that `string` is a **promise, not a proof**, the same lesson as chapters 18 and 32. If you forget to set the variable on the host, it's `undefined` at runtime, and TypeScript can't know. So check it once, where you read it:

```ts
const BASE = import.meta.env.VITE_MEALDB_URL;

if (!BASE) {
  throw new Error("VITE_MEALDB_URL is missing. Add it to .env.local, or to your host's settings.");
}
```

A clear error in the Console beats a thousand requests to `undefined/search.php`. (Zod from [chapter 32](../32-zod/notes.md) can check a whole group of variables at once, if you have several.)

### Everything in the build is public

This is the most important rule in the chapter. **Every file in `dist` is downloaded to every visitor's browser, and they can read all of it.** Open your live site, press `F12`, and look in the **Sources** tab. Or open `dist/assets/index-*.js` in VS Code and search for `themealdb`. The URL is sitting right there, in plain text.

So a `VITE_` variable is not a hiding place. It's a *setting*, not a *secret*. Never put an API secret key, a password, or anything that costs money in one. This is the "don't hide a spare key under the doormat" rule from [JavaScript chapter 51](../../JavaScript/51-security-basics/notes.md).

A secret needs a **server** to keep it: your browser asks your server, and your server adds the secret and talks to the other API. That's exactly what Server Components and Server Functions gave you in [chapter 39](../39-nextjs-and-server-components/notes.md). (You met Next.js's version of this rule there too: only variables starting with `NEXT_PUBLIC_` reach the browser. The rest stay on the server.)

### Git-connected deploys

Dragging `dist` works, but you have to remember to build and drag every time. The professional way is to connect the host to your code on GitHub:

1. You **push** (upload) your code to GitHub.
2. The host notices, downloads it, runs `npm run build` itself, and deploys `dist`.
3. Every push after that deploys again, automatically.

**Git** is a tool that saves snapshots of your project, called **commits**, so you can go back in time. **GitHub** is a website that stores a copy of your Git history online. A **repository** (or **repo**) is one project's folder plus its whole history. Git will get its own folder in this course, so this section only covers the few commands you need, with one line on what each does.

#### First, a trap: your app is already inside a repository

Your `docs` folder is already a Git repository. So every folder inside it, including `React/bookstore`, is already part of that one repository.

Check it yourself. Open a terminal in `React/bookstore` and run `git status`. It prints `On branch main`, because you're inside the `docs` repo.

If you now ran `git init` in `bookstore`, you'd create a repository inside a repository. Git gets confused: the outer one stops tracking the bookstore's files, and warns `adding embedded git repository`. **Don't run `git init` inside a folder that's already in a repo.**

You have two good options:

- **A. Copy the app to its own folder, outside `docs`, and make it its own repo.** Recommended for anything you'll show people. One project per repository means a clean README, a short link, and something you can put on your CV.
- **B. Push your whole `docs` repo to GitHub**, and tell the host which subfolder the app lives in (the "base directory", below). Less copying, but your whole learning folder goes to GitHub. You can make that repository private, and hosts can still build from it.

#### The minimum Git commands (option A)

1. Copy `React/bookstore` to a new folder outside `docs`, like `Projects/bookstore`. Leave `node_modules` and `dist` behind (they're huge, and easy to re-create).
2. Open a terminal in the new folder. Run `git status`. This time you *want* the error `fatal: not a git repository`. It means no repository owns this folder yet.
3. Run `npm install`, then `npm run build`, to check everything still works.
4. Open `.gitignore` (Vite made it). Check it lists `node_modules`, `dist` and `*.local`. Add a line with `.env`, to match your `docs` habit.

Then:

```
git init                                   # start a new repository in this folder
git add .                                  # pick every file, except those in .gitignore
git status                                 # look before you commit: no node_modules, dist or .env!
git commit -m "First version of the bookstore"   # save a snapshot, with a message
```

(The first commit may ask who you are. Run `git config --global user.name "Your Name"` and `git config --global user.email "you@example.com"` once, then commit again.)

Next, on github.com, create a **new repository** called `bookstore`. Leave it empty: no README, no `.gitignore`, no licence. You already have files. GitHub then shows you commands like these:

```
git branch -M main                         # call your branch "main", GitHub's usual name
git remote add origin https://github.com/YOUR-NAME/bookstore.git   # where GitHub's copy lives
git push -u origin main                    # upload your commits to GitHub
```

The first push may open a browser window to sign in to GitHub. After that, every change is three commands:

```
git add .
git commit -m "Fix the refresh 404"
git push
```

(For option B, run `git status` in `docs` first to check you have nothing half-finished, then do the GitHub part from the `docs` folder: create an empty repository, then `remote add` and `push`.)

#### Connect the host

On your host, choose something like **Add new project → Import from Git**, and pick your repository. Most hosts spot that it's a Vite app and fill in the settings for you. Check them anyway:

| What it means | Netlify calls it | Vercel calls it | Your value |
|---|---|---|---|
| Which folder holds the app | Base directory | Root Directory | Empty for option A. `React/bookstore` for option B |
| How to build it | Build command | Build Command | `npm run build` |
| Which folder to upload | Publish directory | Output Directory | `dist` (inside the app's folder) |

Then add your environment variables on the host's settings page, and deploy. From now on, `git push` is your deploy button. If the build fails, the host shows a **build log**: the same output you'd see in your own terminal. Read it from the first red line, just like a TypeScript error.

#### Preview deploys

Here's a lovely extra. Say you want to try a dark theme without breaking the live site:

```
git switch -c try-dark-theme               # make a new branch and move onto it
```

A **branch** is a separate line of work: your commits go there, and `main` stays untouched. Make your change, commit, then `git push -u origin try-dark-theme`.

On GitHub, open a **pull request**: a request to merge a branch into `main`, where you can look at the changes first. Most hosts then build that branch too, and post a **preview URL** on the pull request: a separate copy of the site with your change in it, while the real site stays as it was. Happy with it? Merge the pull request, and the host deploys it for real.

### Continuous integration: a robot that checks every push

**Continuous integration** (**CI**) is a robot that runs your checks every time you push. You don't have to remember to run the tests. It does, every time.

GitHub has one built in, called **GitHub Actions**. You describe the job in a **YAML** file, a settings format where indentation matters (like Python). Create `.github/workflows/ci.yml` in your app's repository:

```yaml
name: CI

on:
  push:
    branches: [main]      # run on every push to main...
  pull_request:           # ...and on every pull request

jobs:
  check:
    runs-on: ubuntu-latest            # a fresh Linux computer, borrowed from GitHub
    steps:
      - uses: actions/checkout@v7     # download your code onto it
      - uses: actions/setup-node@v7   # install Node.js
        with:
          node-version: 24            # a current LTS version
      - run: npm ci                   # install exactly what package-lock.json says
      - run: npx tsc -b               # check the types
      - run: npm test -- --run        # run every test once
      - run: npm run build            # prove it builds
```

Commit it and push. On GitHub, open the **Actions** tab to watch it run. A green ✓ appears next to your commit when every step passes, and a red ✗ when one fails. Click the ✗ to see which step failed and why.

A few notes:

- **`npm ci`** is `npm install` for robots. It installs exactly the versions in `package-lock.json` ([JavaScript chapter 50](../../JavaScript/50-tooling/notes.md)), and stops with an error if `package.json` and the lock file disagree.
- **`npx tsc -b` looks doubled up**, since the build runs it too. Keeping it as its own step makes a red ✗ easier to read: you see "types failed", not "build failed".
- **The version numbers change.** `@v7` and Node `24` were current when this was written (autumn 2026). Check the latest on the [actions/checkout](https://github.com/actions/checkout) and [actions/setup-node](https://github.com/actions/setup-node) pages, and the LTS version on [nodejs.org](https://nodejs.org).
- **Option B?** The workflow file must be at the top of the repository (`docs/.github/workflows/ci.yml`), with a `working-directory: React/bookstore` setting. Ask Claude to help you adjust it.

Now CI tests every push, and the host deploys it. Together, they're a small version of what real teams use every day.

### Deploying Next.js

Your chapter 39 app is not just static files. Server Components run on a server before the page is sent, and Server Functions run on a server when a form is submitted. So it needs a host that can **run code**.

Your options:

- **Vercel** makes Next.js, so it supports every feature first. Import your repository, and it recognises Next.js by itself.
- **Netlify, Cloudflare and others** support Next.js too, through adapters. Check their Next.js pages, because a brand-new Next.js feature can take a while to arrive.
- **Any host that runs Node.js.** Run `npm run build`, then `npm start`. That's the whole production server.

Try the production version locally first, the same "taste one box" idea: `npm run build`, then `npm start`, then open `http://localhost:3000`.

Set your environment variables on the host too. Server-only ones (with no `NEXT_PUBLIC_` prefix) are the right home for a secret key: they stay on the server and never reach the browser.

If your Next.js site uses no server features at all, it can be exported as plain static files instead. Add `output: "export"` to `next.config.ts`, and `npm run build` makes an `out` folder you can upload anywhere. Check the Next.js docs first for the list of features that can't work this way.

### What about my API?

Your task board from [chapter 37](../37-project-task-board/notes.md) talks to json-server at `http://localhost:3001`. Deploy it, open it on your phone, and it can't load any tasks.

Here's exactly why. `localhost` means "this computer". Your deployed app runs in the *visitor's* browser. On your phone, `localhost:3001` means "port 3001 on this phone", and there's no json-server there. It might even seem to work on your own laptop, while your json-server happens to be running. That's the trap. Always test on another device.

You have three honest options:

1. **A "demo mode" that stores tasks in the browser.** Keep the same functions in your api layer (`src/api/tasks.ts`), but when a `VITE_DEMO_MODE` setting is `"true"`, they read and write `localStorage` instead of calling the server. Every visitor gets their own private task board.
2. **Host a real backend.** json-server was built for practice and prototypes, not for the real internet: anyone could delete all your tasks, and many hosts don't keep files your app writes. A proper API is what the upcoming Node.js and Express course is for. (When that day comes, change the `baseURL` in `src/api/client.ts` to read a `VITE_API_URL` variable, and nothing else needs to know.)
3. **Use a hosted backend service.** Some companies give you a database with a ready-made API. They need an account, keys and security rules, so they're a topic of their own.

**For a portfolio, choose option 1 for now.** The api layer from chapter 37 makes it a small, contained change. The components and TanStack Query hooks call `getTasks()` exactly as before. Only the inside of the function changes:

```ts
// src/api/tasks.ts (the idea, shown for one function)
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

export async function getTasks(): Promise<Task[]> {
  if (DEMO_MODE) {
    return getDemoTasks();   // new: reads the tasks from localStorage
  }
  // ...exactly what your chapter 37 version already does
}
```

That's the payoff of keeping every server call in one file. The rest of the app never knew where tasks lived, so it doesn't care that they've moved. You'll build the whole thing in the exercises.

### After deploying: a five-minute check

Every time you deploy something new, check these on the **live** URL:

1. **Open it on your phone.** Not a narrow browser window, your real phone.
2. **Refresh a deep link**, like `/books/3`. No 404.
3. **Open the Console** (`F12`). No red errors, and no failed requests in the Network tab.
4. **Run Lighthouse** on the live URL (DevTools → **Lighthouse** tab, ideally in a private window so extensions don't interfere). Check the **Performance** and **Accessibility** scores, as in [chapter 38](../38-accessibility/notes.md). Live numbers are the real ones.
5. **Try it with the Network tab set to a slow connection.** Do your loading states still make sense?

**Custom domains and HTTPS:** every host above gives you HTTPS (the padlock) automatically, for free. If you buy your own domain name, like `sam-codes.dev`, the host's "Domains" settings page walks you through pointing it at your site.

## Common mistakes

**1. Uploading the project folder instead of `dist`**

Dropping `bookstore/` uploads your `.tsx` files and `node_modules`, and the browser can't run any of it. You get a blank page, or thousands of files that take forever. Build first, then upload `dist`.

**2. The refresh 404**

Clicking around works, refreshing a deep link says "Page not found". The host is looking for a file that doesn't exist. Add the rewrite to `index.html` (`public/_redirects` on Netlify, `vercel.json` on Vercel).

**3. A secret in a `VITE_` variable**

```
VITE_PAYMENT_SECRET=sk_live_12345   ❌ ends up in the JavaScript every visitor downloads
```

Everything in the build is public. Secrets belong on a server. If a secret was ever deployed or pushed, cancel it with the service and make a new one ([JavaScript chapter 51](../../JavaScript/51-security-basics/notes.md)).

**4. Forgetting the variable on the host**

It works locally (because of your `.env.local`) and breaks online. Add every `VITE_` variable in the host's settings. And remember they're baked in at build time: after changing one, deploy again.

**5. Capital letters in file names**

Windows doesn't care whether it's `components/Button.tsx` or `Components/Button.tsx`. The Linux computer that builds your app does:

```
error TS2307: Cannot find module './Components/Button.tsx' or its corresponding type declarations.
```

TypeScript usually warns you on Windows too (a name that "differs only in casing"). The sneaky case is renaming a file *only* by its capital letters, like `button.tsx` to `Button.tsx`: Git on Windows may not notice. Use `git mv button.tsx Button.tsx` so Git records the new name. [JavaScript chapter 52](../../JavaScript/52-final-project/notes.md) warned you about this one.

**6. Pointing a deployed app at `localhost`**

`localhost` is the visitor's own device. Use a real address for a real API, or a demo mode.

**7. Committing `node_modules` or `.env`**

Always run `git status` after `git add .` and before `git commit`. If you see `node_modules` in the list, stop, fix `.gitignore`, and run `git rm -r --cached node_modules` to take it back out.

**8. `git init` inside a folder that's already in a repository**

```
warning: adding embedded git repository: React/bookstore
```

Check with `git status` before you `git init`. If you've already done it, delete the hidden `.git` folder inside the app's folder only (never the one in `docs`!), and choose option A or B instead.

**9. Wrong base or publish directory**

The build log says it can't find `package.json` (wrong base directory), or the live site is blank or says "Page not found" at `/` (wrong publish directory). For a Vite app, the base is the folder containing `package.json`, and the publish directory is `dist` inside it.

## Quick recap

- Deploying means building your app into plain files (`npm run build` → `dist`) and putting them on a host. Test the real build first with `npm run preview`.
- Hashed file names like `index-B4hTz9Wk.js` change whenever the code changes, so browsers never run an old cached copy.
- A single-page app needs a **rewrite to `index.html`**, or refreshing a deep link gives a 404.
- Only `VITE_` variables reach your code, as strings, baked in at build time. Set them on the host too. **Everything in the build is public**, so never put a secret in one.
- The simplest deploy is dragging `dist` onto Netlify. The professional one is Git-connected: push to GitHub, and the host builds, deploys, and makes preview URLs for pull requests.
- Don't `git init` inside `docs`. Copy the app out and give it its own repository, or set the host's base directory.
- CI runs your type check, tests and build on every push, and shows a green ✓ or a red ✗.
- Next.js needs a host that runs code. json-server can't come with you, so give your task board a `localStorage` demo mode behind the same api functions.

---

**Next:** try the [exercises](exercises.md), then move on to the [41 Final Project](../41-final-project/notes.md).
