# 00 Project Setup

## What is it?

This chapter is a **recipe for setting up a real React project by hand**, the way a team would start one: Vite, React 19, TypeScript, a router, a data-fetching library, a store, form validation, a styling setup, environment variables, a folder structure, and a small practice API to talk to.

You end up with a working app: a login page, a home page, and a products screen where you can list, add, view, edit and delete products.

```
┌──────────────────────────────────────────────────────┐
│ my-app   Home  Products                 Admin [Logout]│
├──────────────────────────────────────────────────────┤
│ Products                              [Add product]  │
│ ┌────┬──────────┬───────┬─────────────────┬────────┐ │
│ │ #  │ Name     │ Price │ Description     │ Actions│ │
│ │ 1  │ Keyboard │ 2500  │ Mechanical kb   │ View.. │ │
│ │ 2  │ Mouse    │ 1200  │ Wireless mouse  │ View.. │ │
│ │ 3  │ Monitor  │ 15000 │ 27 inch 4K      │ View.. │ │
│ └────┴──────────┴───────┴─────────────────┴────────┘ │
└──────────────────────────────────────────────────────┘
```

**This is a reference chapter, not a lesson to master on day one.** It uses libraries from Level 4 of this course (Axios, TanStack Query, Zod, React Hook Form, Zustand, TanStack Router). You don't need to understand every line yet. Skim it now so you know what a "real" project looks like, then come back and follow it step by step when you start a project of your own, like in [chapter 37](../37-project-task-board/notes.md) or [chapter 41](../41-final-project/notes.md). Chapter 01 sets up the much smaller `playground` app you'll use for learning.

## Why does it matter?

`npm create vite@latest` gives you a working page in a minute. But it's a bare room: one `App.tsx`, one CSS file, and nothing else. A real app needs answers to questions like:

- Where does the code for the login page go, and where does the code for products go?
- How does the app know the API's address, and how do you change it for the live site?
- What happens when the server says "you're not logged in"?
- How do you work on the frontend before the real backend exists?

Teams answer these questions once, at the start, in the project's setup. Doing it by hand once shows you what each file is *for*. After that, you'll understand any starter you're handed at work, because they all solve the same problems.

## Real-world example

Think of opening a small restaurant.

| Opening a restaurant | Setting up a project |
|---|---|
| Choose a building and a name | Create the app with Vite, give it a name |
| Install the kitchen: stove, fridge, sinks | Install the libraries |
| Label every shelf and container | The folder structure, one folder per feature |
| Pin the suppliers' phone numbers to the wall, not in your head | Environment variables in a `.env` file |
| A host who checks for a reservation before seating anyone | The auth guard on the protected pages |
| Practise the menu before opening night, with pretend customers | The mock API on your own computer |

Nobody enjoys installing a kitchen. But once it's done, cooking is the only job left.

## Before you start

**Versions.** This chapter was checked in October 2026 with Node.js 24.15 and npm 11.12. The versions it installs: Vite 8, React 19, TypeScript 6, ESLint 10, Axios 1, TanStack Router v1 (1.170), TanStack Query v5, Zod 4, React Hook Form 7 (with `@hookform/resolvers` 5), Zustand 5, Express 5 and Sass 1. All of these move fast. If something doesn't match what you see, the chapter that teaches the library (Level 4) and the library's own docs win.

**Style.** The files in this chapter use Vite's own style: single quotes and no semicolons, just like the files Vite generates. The rest of this course uses double quotes and semicolons. Both work. Pick one per project and stick to it.

**Windows and Mac.** Every `npm` command is the same on both. Where a terminal command differs, both are shown. You can also do any "create a folder" or "delete a file" step in VS Code's file explorer.

**One name.** The project in this chapter is called `my-app`. The name shows up in four files. Use your own name and change it in those four places (they're pointed out as you go).

## What you'll end up with

```
my-app/
├── .env                    the API address and other settings (git-ignored)
├── .env.example            the same, with safe values, committed for teammates
├── index.html              the one HTML page, made by Vite
├── package.json            scripts and packages
├── vite.config.ts          Vite's settings: plugins and the @/ alias
├── tsconfig.app.json       TypeScript settings for src/
├── eslint.config.js        ESLint settings
├── mock-server/
│   ├── server.js           a tiny Express API: login + product CRUD
│   └── db.json             its data (created on first run, git-ignored)
└── src/
    ├── main.tsx            the starting point
    ├── index.scss          global styles
    ├── styles/
    │   └── _variables.scss shared colours and sizes
    ├── config/
    │   └── env.ts          checks the environment variables, exports `config`
    ├── lib/                shared infrastructure
    │   ├── apiClient.ts    the Axios instance (adds the token, handles 403)
    │   ├── apiError.ts     turns any error into a readable message
    │   ├── queryClient.ts  TanStack Query's settings
    │   ├── router.ts       TanStack Router's settings
    │   └── index.ts        one import path for all of the above
    ├── providers/
    │   └── AppProviders.tsx  wraps the app in every provider
    ├── features/           one folder per feature
    │   ├── auth/           login page, auth store, login request
    │   ├── home/           home page
    │   └── products/       list + form, requests, queries
    ├── routes/             file-based routes (thin: they point at features)
    └── routeTree.gen.ts    GENERATED by the router plugin, never edited
```

Each library has exactly one job:

| Job | Library | Taught in |
|---|---|---|
| Build tool and dev server | Vite (with the React Compiler) | [01](../01-getting-started/notes.md), [27](../27-performance/notes.md) |
| Pages and URLs | TanStack Router, file-based | [36](../36-tanstack-router/notes.md) |
| Loading and saving server data | TanStack Query | [31](../31-tanstack-query/notes.md) |
| Data many components share (who's logged in) | Zustand | [34](../34-zustand/notes.md) |
| Talking to the API | Axios | [30](../30-axios/notes.md) |
| Forms and validation | React Hook Form + Zod | [33](../33-react-hook-form/notes.md), [32](../32-zod/notes.md) |
| Styling | SCSS (Sass) | [15](../15-styling/notes.md) mentions it |
| Catching mistakes | ESLint + TypeScript | [01](../01-getting-started/notes.md) |
| A pretend backend | Express | this chapter |

## How it works

There are 14 steps. Do them in order. Each one is small.

### Step 1: Check your tools

You need **Node.js 20.19 or newer** (or 22.12 or newer). Vite refuses older versions. Check in a terminal:

```
node --version
npm --version
```

If `node --version` prints something like `v18.20.8` or `v14.17.3`, install the latest **LTS** version from [nodejs.org](https://nodejs.org). If you use **nvm** to keep several versions, `nvm list` shows what you have and `nvm use 24.15.0` (or whichever you have) switches to it.

Why this matters: with an old Node, `npm create vite` doesn't give a friendly message. It crashes with something like `SyntaxError: Unexpected token '||='`, which looks like a bug in Vite but just means "your Node is too old".

### Step 2: Choose a name

Pick a name for the project folder. Rules:

- letters, numbers, `.`, `_` and `-` only. **No spaces.**
- a folder with that name must not already exist (or must be empty).

This chapter uses `my-app`. Open a terminal in the folder where you keep your projects (for example this `React` folder).

### Step 3: Create the app with Vite

One command creates the whole base project:

```
npm create vite@latest my-app --yes -- --template react-compiler-ts --eslint --no-immediate --no-interactive
```

What each part means:

| Part | Meaning |
|---|---|
| `npm create vite@latest` | Run the newest version of Vite's project maker |
| `my-app` | The folder to create |
| `--yes` | Tells **npm** not to stop and ask "Ok to proceed?" |
| `--` | "Everything after this is for Vite, not npm" |
| `--template react-compiler-ts` | React + TypeScript, with the **React Compiler** turned on |
| `--eslint` | Use ESLint as the linter (Vite's default is Oxlint) |
| `--no-immediate` | Don't run `npm install` or start the server yet |
| `--no-interactive` | Never stop to ask a question |

If you'd rather answer Vite's questions one at a time, run plain `npm create vite@latest` and pick: **React**, then **TypeScript + React Compiler**, then **ESLint**, then **No** to "Install and start now?".

Two notes on those choices:

- The **React Compiler** makes your components faster automatically. [Chapter 27](../27-performance/notes.md) explains how. In the project it's just one extra plugin line in `vite.config.ts`.
- **ESLint** rather than Oxlint, because this setup uses ESLint's React plugins and turns one rule off for one folder. Most teams use ESLint.

When it finishes, go into the folder. Every command from now on runs **inside `my-app`**:

```
cd my-app
```

Vite made these files:

```
my-app/
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── README.md
├── tsconfig.json, tsconfig.app.json, tsconfig.node.json
├── vite.config.ts
├── public/           favicon.svg, icons.svg
└── src/
    ├── App.tsx, App.css, index.css, main.tsx
    └── assets/       hero.png, react.svg, vite.svg
```

[Chapter 01](../01-getting-started/notes.md) has a tour of these files.

### Step 4: Delete the template's leftovers

Vite's welcome page lives in `App.tsx`. This project doesn't have an `App.tsx` at all: the files in `src/routes/` decide what's on screen (Step 11). And the styles will be SCSS, not CSS. So delete these four files:

- `src/App.tsx`
- `src/App.css`
- `src/index.css`
- `src/assets/hero.png`

In PowerShell:

```
Remove-Item src/App.tsx, src/App.css, src/index.css, src/assets/hero.png
```

In bash (Mac, Linux, Git Bash):

```
rm -f src/App.tsx src/App.css src/index.css src/assets/hero.png
```

Or right-click them in VS Code and choose **Delete**. `react.svg` and `vite.svg` can stay; nothing uses them, and they do no harm.

Right now `src/main.tsx` imports two files you just deleted. That's fine. You'll replace `main.tsx` in Step 8.

### Step 5: Install the libraries

Install the libraries now, before writing any files, so VS Code recognises every import as you type it. The first `npm install` also installs everything Vite's template needs (React, TypeScript, Vite itself), because `--no-immediate` skipped that.

The libraries the app uses in the browser:

```
npm install axios @tanstack/react-router @tanstack/react-router-devtools @tanstack/react-query zustand zod react-hook-form @hookform/resolvers
```

The tools used only while developing (`-D` is short for `--save-dev`):

```
npm install -D @tanstack/router-plugin sass express cors concurrently
```

| Package | What it's for |
|---|---|
| `axios` | Making HTTP requests ([chapter 30](../30-axios/notes.md)) |
| `@tanstack/react-router` | Pages and URLs ([chapter 36](../36-tanstack-router/notes.md)) |
| `@tanstack/react-router-devtools` | A panel in the browser that shows the router's state |
| `@tanstack/react-query` | Loading, caching and updating server data ([chapter 31](../31-tanstack-query/notes.md)) |
| `zustand` | A small store for shared data ([chapter 34](../34-zustand/notes.md)) |
| `zod` | Checking that data has the shape you expect ([chapter 32](../32-zod/notes.md)) |
| `react-hook-form`, `@hookform/resolvers` | Forms, and the bridge that lets Zod validate them ([chapter 33](../33-react-hook-form/notes.md)) |
| `@tanstack/router-plugin` | The Vite plugin that turns `src/routes/` files into routes |
| `sass` | Lets Vite understand `.scss` files |
| `express`, `cors` | The mock API server, and the add-on that lets the browser call it from another port |
| `concurrently` | Runs the mock API and Vite in one terminal |

This takes a minute. Expect a `node_modules` folder and a longer `package.json` afterwards.

### Step 6: Configure Vite, TypeScript and ESLint

Four files at the root of the project. Three change, one stays as it is.

#### `vite.config.ts`

Replace the whole file with this:

```ts
import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { fileURLToPath } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // Must run before react(): scans src/routes/ and generates src/routeTree.gen.ts
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    // React Compiler (automatic memoisation) via Babel
    babel({ presets: [reactCompilerPreset()] }),
  ],
  resolve: {
    alias: {
      // `@/` -> `src/` (mirrored in tsconfig.app.json "paths")
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
```

Compared with what Vite wrote, there are two additions:

- **The router plugin**, and it must be **first** in the list. It watches `src/routes/` and writes `src/routeTree.gen.ts`, the map of every page. The TanStack docs insist on this order.
- **The `@/` alias.** `@/features/auth` means `src/features/auth`, from any file, no matter how deep. Without it, a file three folders down imports with `../../../features/auth`, and moving the file breaks the import.

#### `tsconfig.app.json`

Vite's version is nearly right. Add one block, `paths`, at the end of `compilerOptions`, so TypeScript understands the same `@/` alias. The whole file:

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "es2023",
    "lib": ["ES2023", "DOM"],
    "module": "esnext",
    "types": ["vite/client"],
    "allowArbitraryExtensions": true,
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,

    /* Path alias: `@/x` -> `src/x` (mirrored in vite.config.ts resolve.alias) */
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

The alias lives in **two** places on purpose. Vite uses `vite.config.ts` to find the file when it runs the app. TypeScript and VS Code use `tsconfig.app.json` to check it. Change one, change both. (Don't touch `tsconfig.json` or `tsconfig.node.json`.)

#### `eslint.config.js`

Replace the whole file:

```js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // routeTree.gen.ts is generated code - never lint it
  globalIgnores(['dist', 'src/routeTree.gen.ts']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    // TanStack Router file routes export a `Route` object and usually define
    // their component right next to it. The react-refresh rule flags that
    // pattern, but Vite + TanStack Router hot-reload route files just fine.
    files: ['src/routes/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
```

Two changes from Vite's version: the generated `routeTree.gen.ts` is skipped (you can't fix lint warnings in a file that gets rewritten), and one rule is switched off inside `src/routes/`, because route files export a `Route` object next to a component, and that rule doesn't like it.

#### `index.html`

Leave it exactly as Vite wrote it. Just check the `<title>`: Vite put your project name there. That's name location **1 of 4**.

### Step 7: Environment variables

An **environment variable** is a setting that lives outside your code, so the same code can run with different settings: the API at `localhost` on your machine, and at `api.example.com` on the live site.

Vite reads them from a file called `.env` at the project root. Only variables whose names start with `VITE_` reach the browser. That's deliberate: it stops a secret from leaking into the bundle by accident.

Create **`.env.example`**. This one is committed to Git, so teammates can see which variables exist:

```
# Copy this file to `.env` and adjust the values. `.env` is git-ignored.
# Every variable must start with VITE_ to be exposed to the browser bundle.
VITE_APP_ENV=dev
VITE_API_BASE_URL=http://localhost:3000
VITE_API_TIMEOUT=30000
```

Create **`.env`**, the real one, which stays on your machine (Step 13 tells Git to ignore it):

```
VITE_APP_ENV=dev
VITE_API_BASE_URL=http://localhost:3000
VITE_API_TIMEOUT=30000
```

Port `3000` is where the mock API will run (Step 12).

Now create **`src/config/env.ts`**. It reads the variables once, checks them with Zod, and exports a tidy `config` object. A typo in `.env` fails right here, at startup, with a clear message, instead of surfacing later as a confusing network error:

```ts
import { z } from 'zod'

// Validate environment variables once at startup, so a typo in .env fails
// loudly here instead of surfacing later as a confusing network error.
const envSchema = z.object({
  VITE_APP_ENV: z.enum(['dev', 'qa', 'prod']).default('dev'),
  VITE_API_BASE_URL: z.url('VITE_API_BASE_URL must be a valid URL'),
  VITE_API_TIMEOUT: z.coerce.number().int().positive().default(30000),
})

function validateEnv() {
  const result = envSchema.safeParse(import.meta.env)

  if (!result.success) {
    console.error('Invalid environment variables:')
    for (const issue of result.error.issues) {
      console.error(`  ${issue.path.join('.')}: ${issue.message}`)
    }
    throw new Error('Invalid environment configuration - check your .env file')
  }

  return result.data
}

const env = validateEnv()

// The rest of the app imports `config`, never `import.meta.env` directly.
export const config = {
  api: {
    baseUrl: env.VITE_API_BASE_URL,
    timeout: env.VITE_API_TIMEOUT,
  },
  app: {
    env: env.VITE_APP_ENV,
  },
} as const
```

`import.meta.env` is how Vite hands the variables to your code. Everything in a `.env` file is a string, so `z.coerce.number()` turns `"30000"` into `30000`. The rule for the rest of the app: **import `config`, never `import.meta.env`**. One place to look, one place to change.

### Step 8: The entry point and styles

#### `src/main.tsx`

Replace Vite's version. It's the same shape as chapter 01's, but it loads `.scss` and renders `AppProviders` (Step 9) instead of `App`:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.scss'
import { AppProviders } from './providers/AppProviders'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders />
  </StrictMode>,
)
```

#### `src/styles/_variables.scss`

**SCSS** is CSS with extras: variables, nesting, and maths. Vite handles it because you installed `sass`. A file whose name starts with `_` is a **partial**: a file meant to be pulled into other stylesheets, never loaded on its own.

```scss
// Shared SCSS variables. Pull them into a stylesheet with:
//   @use './styles/variables' as *;   (path relative to the importing file)
$color-primary: #2563eb;
$color-primary-dark: #1d4ed8;
$color-danger: #dc2626;
$color-text: #1f2937;
$color-muted: #6b7280;
$color-border: #e5e7eb;
$color-bg: #f9fafb;
$color-surface: #ffffff;

$radius: 6px;
$space: 0.5rem;
```

#### `src/index.scss`

The global styles. It's long but plain: a reset, a header, cards, forms, buttons, a table. Every class name used by the components in Steps 10 and 11 is defined here.

```scss
@use './styles/variables' as *;

// Deliberately minimal: enough to make the pages readable, nothing more.

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  color: $color-text;
  background: $color-bg;
  line-height: 1.5;
}

a {
  color: $color-primary;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

code {
  padding: 0 0.25em;
  border-radius: 3px;
  background: $color-border;
}

// ---- Layout -----------------------------------------------------------------
.app-header {
  display: flex;
  align-items: center;
  gap: $space * 3;
  padding: $space * 2 $space * 3;
  background: $color-surface;
  border-bottom: 1px solid $color-border;

  nav {
    display: flex;
    gap: $space * 2;

    // TanStack Router adds this class to the <Link> of the current route
    a.active {
      font-weight: 600;
    }
  }

  .spacer {
    flex: 1;
  }

  .user {
    color: $color-muted;
    font-size: 0.9rem;
  }
}

.page {
  max-width: 960px;
  margin: 0 auto;
  padding: $space * 3;
}

.page-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $space * 2;
  margin-bottom: $space * 2;

  h1 {
    margin: 0;
  }
}

.card {
  background: $color-surface;
  border: 1px solid $color-border;
  border-radius: $radius;
  padding: $space * 3;
}

// ---- Forms ------------------------------------------------------------------
.form {
  display: flex;
  flex-direction: column;
  gap: $space * 2;
  max-width: 420px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: $space * 0.5;

  label {
    font-weight: 600;
    font-size: 0.9rem;
  }

  input,
  textarea {
    padding: $space $space * 1.5;
    border: 1px solid $color-border;
    border-radius: $radius;
    font: inherit;

    &:focus {
      outline: 2px solid $color-primary;
      outline-offset: 1px;
    }
  }

  .error {
    color: $color-danger;
    font-size: 0.85rem;
  }
}

.form-actions {
  display: flex;
  gap: $space * 1.5;
}

// ---- Buttons ----------------------------------------------------------------
.btn {
  display: inline-flex;
  align-items: center;
  padding: $space $space * 2;
  border: 1px solid transparent;
  border-radius: $radius;
  background: $color-primary;
  color: #fff;
  font: inherit;
  cursor: pointer;

  &:hover {
    background: $color-primary-dark;
    text-decoration: none;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &.btn-secondary {
    background: $color-surface;
    color: $color-text;
    border-color: $color-border;

    &:hover {
      background: $color-bg;
    }
  }

  &.btn-danger {
    background: $color-danger;
  }

  &.btn-sm {
    padding: $space * 0.5 $space;
    font-size: 0.85rem;
  }
}

// ---- Tables -----------------------------------------------------------------
.table {
  width: 100%;
  border-collapse: collapse;
  background: $color-surface;
  border: 1px solid $color-border;

  th,
  td {
    text-align: left;
    padding: $space $space * 1.5;
    border-bottom: 1px solid $color-border;
  }

  th {
    background: $color-bg;
    font-weight: 600;
  }

  tr:last-child td {
    border-bottom: none;
  }

  .actions {
    display: flex;
    gap: $space;
  }
}

// ---- Misc -------------------------------------------------------------------
.alert {
  padding: $space $space * 1.5;
  border-radius: $radius;
  background: #fef2f2;
  color: $color-danger;
  border: 1px solid #fecaca;
}

.muted {
  color: $color-muted;
}

.login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: $space * 2;

  .card {
    width: 100%;
    max-width: 380px;
  }

  h1 {
    margin-top: 0;
  }
}
```

### Step 9: Shared infrastructure

`src/lib/` holds the things every feature needs: the HTTP client, the error helper, the query client and the router. Four small files and a barrel.

#### `src/lib/apiClient.ts`

One Axios instance for the whole app, with two **interceptors**: a bit of code that runs on every request or every response.

```ts
import axios, { type AxiosError } from 'axios'
import { config } from '@/config/env'
import { useAuthStore } from '@/features/auth/auth.store'

export const apiClient = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor: attach the bearer token (when logged in) to every call.
apiClient.interceptors.request.use((requestConfig) => {
  const token = useAuthStore.getState().token
  if (token) {
    requestConfig.headers.Authorization = `Bearer ${token}`
  }
  return requestConfig
})

// Response interceptor: the mock server answers 403 for a missing/invalid
// token, so log out and send the user back to /login.
// Keep this status in sync with `requireAuth` in mock-server/server.js.
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 403) {
      useAuthStore.getState().logout()
    }
    return Promise.reject(error)
  },
)
```

- The request interceptor adds `Authorization: Bearer <token>` to every call once you're logged in, so no feature has to remember to.
- The response interceptor watches for **403** ("forbidden"). The mock API answers 403 when the token is missing or wrong, so the app logs you out and shows the login page. The number **403 appears in two places**: here and in the server (Step 12). Change both or neither.
- `useAuthStore` doesn't exist yet. You write it in Step 10. VS Code will show a red squiggle until then.

#### `src/lib/apiError.ts`

```ts
import { isAxiosError } from 'axios'

// Pull a human-readable message out of whatever a request threw.
// The mock server always answers failures with `{ message: string }`.
export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? error.message ?? fallback
  }
  if (error instanceof Error) {
    return error.message
  }
  return fallback
}
```

#### `src/lib/queryClient.ts`

```ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // data counts as "fresh" for 1 minute -> no refetch on remount
      gcTime: 5 * 60 * 1000, // unused cache entries are dropped after 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
```

#### `src/lib/router.ts`

```ts
import { createRouter } from '@tanstack/react-router'
import { routeTree } from '@/routeTree.gen'

// routeTree.gen.ts is generated from src/routes/ by @tanstack/router-plugin
// (see vite.config.ts). Never edit it by hand.
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent', // start loading a route when the user hovers its link
  scrollRestoration: true,
})

// Registers our router with TanStack's types so <Link to="..."> and
// useNavigate() are type-checked against the real route paths.
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
```

`routeTree.gen.ts` doesn't exist yet either. The router plugin writes it the first time you run `npm run dev` (Step 14). Until then, this import is underlined in red. That's expected.

#### `src/lib/index.ts`

A **barrel** file: it re-exports things so other files can write `import { apiClient, router } from '@/lib'`.

```ts
// Barrel file: one import path for the shared infrastructure.
// `apiClient` is listed first on purpose - it must be initialised before the
// router pulls in the feature modules that use it.
export { apiClient } from './apiClient'
export { getApiErrorMessage } from './apiError'
export { queryClient } from './queryClient'
export { router } from './router'
```

#### `src/providers/AppProviders.tsx`

A **provider** is a component that makes something available to every component inside it. The query client and the router both need one. They're collected here so `main.tsx` stays tiny.

```tsx
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { queryClient, router } from '@/lib'

// Every app-wide provider lives here so main.tsx stays a one-liner.
export const AppProviders = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
```

### Step 10: Features

The folder rule: **one folder per feature**, under `src/features/`. Everything about login lives in `auth/`. Everything about products lives in `products/`. Inside a feature:

| File | Holds |
|---|---|
| `*.types.ts` | The TypeScript shapes of the data |
| `*.api.ts` | The functions that call the API (plain Axios calls) |
| `*.query.ts` | TanStack Query hooks built on those functions |
| `*.store.ts` | A Zustand store, if the feature has shared client state |
| `components/` | The screens and pieces |
| `index.ts` | The barrel: what the rest of the app may import |

Other code imports from the barrel only, like `@/features/auth`, never from a file deep inside. That way a feature can reorganise its insides without breaking anyone.

#### The auth feature

**`src/features/auth/auth.types.ts`**

```ts
export interface ILoginBody {
  username: string
  password: string
}

export interface IUser {
  id: number
  name: string
  username: string
}

export interface ILoginResponse {
  token: string
  user: IUser
}
```

**`src/features/auth/auth.api.ts`**

```ts
import { apiClient } from '@/lib'
import type { ILoginBody, ILoginResponse } from './auth.types'

export const login = async (body: ILoginBody) => {
  const res = await apiClient.post<ILoginResponse>('/auth/login', body)
  return res.data
}
```

**`src/features/auth/auth.query.ts`**

```ts
import { useMutation } from '@tanstack/react-query'
import { login } from './auth.api'

export const useLogin = () => useMutation({ mutationFn: login })
```

**`src/features/auth/auth.store.ts`**

The store remembers the token and the user. `persist` saves them in the browser's `localStorage`, so refreshing the page keeps you logged in.

```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { IUser } from './auth.types'

interface AuthState {
  token: string | null
  user: IUser | null
  setAuth: (token: string, user: IUser) => void
  logout: () => void
}

// Persisted to localStorage under the key "auth", so a page refresh keeps you logged in.
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => {
        set({ token: null, user: null })
        // Hard redirect on purpose: it also wipes the in-memory React Query cache.
        window.location.href = '/login'
      },
    }),
    { name: 'auth' },
  ),
)
```

**`src/features/auth/components/LoginPage.tsx`**

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from '@tanstack/react-router'
import { getApiErrorMessage } from '@/lib'
import { useLogin } from '../auth.query'
import { useAuthStore } from '../auth.store'

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

type LoginPageProps = {
  /** Where to go after a successful login (comes from `?redirect=...`). */
  redirectTo?: string
}

export const LoginPage = ({ redirectTo }: LoginPageProps) => {
  const navigate = useNavigate()
  const login = useLogin()
  const setAuth = useAuthStore((s) => s.setAuth)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  })

  const onSubmit = (values: LoginFormValues) => {
    login.mutate(values, {
      onSuccess: (data) => {
        setAuth(data.token, data.user)
        // Only follow same-site paths, never an external URL smuggled into the query string.
        const target = redirectTo?.startsWith('/') ? redirectTo : '/'
        navigate({ href: target })
      },
    })
  }

  return (
    <div className="login-page">
      <div className="card">
        <h1>Login</h1>
        <p className="muted">
          Mock credentials: <code>admin</code> / <code>admin</code>
        </p>

        <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="field">
            <label htmlFor="username">Username</label>
            <input id="username" type="text" autoComplete="username" {...register('username')} />
            {errors.username && <span className="error">{errors.username.message}</span>}
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
            />
            {errors.password && <span className="error">{errors.password.message}</span>}
          </div>

          {login.isError && <div className="alert">{getApiErrorMessage(login.error)}</div>}

          <button className="btn" type="submit" disabled={login.isPending}>
            {login.isPending ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

**`src/features/auth/index.ts`**

```ts
export { LoginPage } from './components/LoginPage'
export { useAuthStore } from './auth.store'
export { useLogin } from './auth.query'
export type { ILoginBody, ILoginResponse, IUser } from './auth.types'
```

#### The home feature

**`src/features/home/components/Home.tsx`**. The project name appears here: location **2 of 4**.

```tsx
import { Link } from '@tanstack/react-router'
import { useAuthStore } from '@/features/auth'

export const Home = () => {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="card">
      <h1>Welcome{user ? `, ${user.name}` : ''}</h1>
      <p>
        This is the home page of <strong>my-app</strong>. It lives under the{' '}
        <code>_authenticated</code> layout route, so you only see it when logged in.
      </p>
      <p>
        <Link className="btn" to="/products">
          Manage products
        </Link>
      </p>
    </div>
  )
}
```

**`src/features/home/index.ts`**

```ts
export { Home } from './components/Home'
```

#### The products feature

**`src/features/products/product.types.ts`**

```ts
export interface IProduct {
  id: number
  name: string
  price: number
  description: string
}

// What the client sends when creating/updating - the server owns the id.
export type IProductBody = Omit<IProduct, 'id'>
```

**`src/features/products/products.api.ts`**

```ts
import { apiClient } from '@/lib'
import type { IProduct, IProductBody } from './product.types'

export const getProducts = async () => {
  const res = await apiClient.get<IProduct[]>('/products')
  return res.data
}

export const getProduct = async (id: number) => {
  const res = await apiClient.get<IProduct>(`/products/${id}`)
  return res.data
}

export const createProduct = async (body: IProductBody) => {
  const res = await apiClient.post<IProduct>('/products', body)
  return res.data
}

export const updateProduct = async (id: number, body: IProductBody) => {
  const res = await apiClient.put<IProduct>(`/products/${id}`, body)
  return res.data
}

export const deleteProduct = async (id: number) => {
  await apiClient.delete(`/products/${id}`)
}
```

**`src/features/products/product.query.ts`**

```ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
} from './products.api'
import type { IProductBody } from './product.types'

// Query keys in one place so invalidation never drifts out of sync.
// `detail` starts with the same 'products' prefix, so invalidating
// `productKeys.all` refreshes the list AND every cached detail at once.
export const productKeys = {
  all: ['products'] as const,
  detail: (id: number) => ['products', id] as const,
}

export const useProducts = () => useQuery({ queryKey: productKeys.all, queryFn: getProducts })

export const useProduct = (id: number, enabled = true) =>
  useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => getProduct(id),
    enabled: enabled && Number.isFinite(id),
  })

export const useCreateProduct = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: IProductBody) => createProduct(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
  })
}

export const useUpdateProduct = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: IProductBody }) => updateProduct(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
  })
}

export const useDeleteProduct = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
  })
}
```

**`src/features/products/components/ProductList.tsx`**

```tsx
import { Link } from '@tanstack/react-router'
import { getApiErrorMessage } from '@/lib'
import { useDeleteProduct, useProducts } from '../product.query'

export const ProductList = () => {
  const { data: products, isLoading, isError, error } = useProducts()
  const deleteProduct = useDeleteProduct()

  const onDelete = (id: number, name: string) => {
    if (window.confirm(`Delete "${name}"?`)) {
      deleteProduct.mutate(id)
    }
  }

  if (isLoading) return <p>Loading products...</p>
  if (isError) return <div className="alert">{getApiErrorMessage(error)}</div>

  return (
    <>
      <div className="page-title">
        <h1>Products</h1>
        <Link className="btn" to="/products/add">
          Add product
        </Link>
      </div>

      {deleteProduct.isError && (
        <div className="alert">{getApiErrorMessage(deleteProduct.error)}</div>
      )}

      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Price</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products?.length === 0 && (
            <tr>
              <td colSpan={5} className="muted">
                No products yet.
              </td>
            </tr>
          )}
          {products?.map((product, index) => (
            <tr key={product.id}>
              <td>{index + 1}</td>
              <td>{product.name}</td>
              <td>{product.price}</td>
              <td>{product.description}</td>
              <td>
                <div className="actions">
                  <Link
                    className="btn btn-secondary btn-sm"
                    to="/products/$productId"
                    params={{ productId: String(product.id) }}
                  >
                    View
                  </Link>
                  <Link
                    className="btn btn-secondary btn-sm"
                    to="/products/$productId/edit"
                    params={{ productId: String(product.id) }}
                  >
                    Edit
                  </Link>
                  <button
                    className="btn btn-danger btn-sm"
                    type="button"
                    onClick={() => onDelete(product.id, product.name)}
                    disabled={deleteProduct.isPending}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
```

**`src/features/products/components/ProductForm.tsx`**. One component for three screens: add, edit and view.

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { getApiErrorMessage } from '@/lib'
import { useCreateProduct, useProduct, useUpdateProduct } from '../product.query'

type ProductFormProps = {
  mode: 'add' | 'edit' | 'view'
  productId?: string // present for edit + view, absent for add
}

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.number({ error: 'Price must be a number' }).positive('Price must be greater than 0'),
  description: z.string().min(1, 'Description is required'),
})

type ProductFormValues = z.infer<typeof productSchema>

export const ProductForm = ({ mode, productId }: ProductFormProps) => {
  const id = Number(productId)
  const navigate = useNavigate()

  // Only fetch when there is an id to fetch (edit/view) - never for "add".
  const product = useProduct(id, mode !== 'add')
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: '', price: 0, description: '' },
    // `values` is reactive: once the product arrives, the form fills itself in.
    values: product.data
      ? {
          name: product.data.name,
          price: product.data.price,
          description: product.data.description,
        }
      : undefined,
  })

  const onSubmit = (values: ProductFormValues) => {
    const backToList = () => navigate({ to: '/products' })

    if (mode === 'edit') {
      updateProduct.mutate({ id, body: values }, { onSuccess: backToList })
    } else {
      createProduct.mutate(values, { onSuccess: backToList })
    }
  }

  if (mode !== 'add' && product.isLoading) return <p>Loading product...</p>
  if (mode !== 'add' && product.isError) {
    return <div className="alert">{getApiErrorMessage(product.error)}</div>
  }

  if (mode === 'view') {
    return (
      <div className="card">
        <div className="page-title">
          <h1>{product.data?.name}</h1>
          <div className="form-actions">
            <Link className="btn btn-secondary" to="/products">
              Back
            </Link>
            <Link className="btn" to="/products/$productId/edit" params={{ productId: String(id) }}>
              Edit
            </Link>
          </div>
        </div>
        <p>
          <strong>Price:</strong> {product.data?.price}
        </p>
        <p>
          <strong>Description:</strong> {product.data?.description}
        </p>
      </div>
    )
  }

  const saving = createProduct.isPending || updateProduct.isPending
  const saveError = createProduct.error ?? updateProduct.error

  return (
    <div className="card">
      <h1>{mode === 'edit' ? 'Edit product' : 'Add product'}</h1>

      <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="field">
          <label htmlFor="name">Name</label>
          <input id="name" type="text" {...register('name')} />
          {errors.name && <span className="error">{errors.name.message}</span>}
        </div>

        <div className="field">
          <label htmlFor="price">Price</label>
          {/* Inputs give strings; valueAsNumber converts so zod sees a number */}
          <input id="price" type="number" step="any" {...register('price', { valueAsNumber: true })} />
          {errors.price && <span className="error">{errors.price.message}</span>}
        </div>

        <div className="field">
          <label htmlFor="description">Description</label>
          <textarea id="description" rows={3} {...register('description')} />
          {errors.description && <span className="error">{errors.description.message}</span>}
        </div>

        {saveError && <div className="alert">{getApiErrorMessage(saveError)}</div>}

        <div className="form-actions">
          <button className="btn" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
          <Link className="btn btn-secondary" to="/products">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
```

**`src/features/products/index.ts`**

```ts
export { ProductList } from './components/ProductList'
export { ProductForm } from './components/ProductForm'
export {
  productKeys,
  useProducts,
  useProduct,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from './product.query'
export type { IProduct, IProductBody } from './product.types'
```

### Step 11: Routes

With **file-based routing**, the files in `src/routes/` *are* the pages, and where a file sits decides its URL ([chapter 36](../36-tanstack-router/notes.md)). Route files stay thin: each one points at a component from a feature.

| File | URL | Shows |
|---|---|---|
| `__root.tsx` | every page | the outer shell and the devtools |
| `login.tsx` | `/login` | `LoginPage` |
| `_authenticated.tsx` | none: a **layout** | the header, and the bouncer |
| `_authenticated/index.tsx` | `/` | `Home` |
| `_authenticated/products/index.tsx` | `/products` | `ProductList` |
| `_authenticated/products/add.tsx` | `/products/add` | `ProductForm` (add) |
| `_authenticated/products/$productId/index.tsx` | `/products/3` | `ProductForm` (view) |
| `_authenticated/products/$productId/edit.tsx` | `/products/3/edit` | `ProductForm` (edit) |

Three naming rules:

- `__root.tsx` (two underscores) wraps everything.
- A name starting with **one** underscore, like `_authenticated`, is a **layout route**: it wraps its children but adds nothing to the URL. So `_authenticated/index.tsx` is `/`, not `/_authenticated/`.
- `$productId` is a **path parameter**: the part of the URL that changes, like chapter 24's `:id`.

**Creating the `$productId` folder.** In VS Code, click **New File** on `src/routes` and type the whole path, like `_authenticated/products/$productId/index.tsx`. VS Code makes the folders for you. If you use the terminal instead, put the path in **single** quotes: in both PowerShell and bash, `"$productId"` in double quotes is a variable, and it's empty, so you'd get a folder called `products/` with nothing after it.

**`src/routes/__root.tsx`**

```tsx
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <>
      <Outlet />
      {/* Devtools render nothing in production builds */}
      <TanStackRouterDevtools position="bottom-right" />
    </>
  )
}
```

`<Outlet />` is where the current page goes.

**`src/routes/login.tsx`**

```tsx
import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'
import { LoginPage, useAuthStore } from '@/features/auth'

// /login?redirect=/products -> after logging in, go back to where the user was heading.
const loginSearchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/login')({
  validateSearch: loginSearchSchema,
  // Already logged in? Skip the login page.
  beforeLoad: () => {
    if (useAuthStore.getState().token) {
      throw redirect({ to: '/' })
    }
  },
  component: LoginRoute,
})

function LoginRoute() {
  const { redirect: redirectTo } = Route.useSearch()
  return <LoginPage redirectTo={redirectTo} />
}
```

**`src/routes/_authenticated.tsx`**. The layout for every page that needs a login. `beforeLoad` runs before any child page renders: if there's no token, it sends you to `/login` and remembers where you were going. The project name appears in the header: location **3 of 4**.

```tsx
import { Link, Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/features/auth'

// Layout route: everything inside src/routes/_authenticated/ requires a login.
// `beforeLoad` runs before any child route renders - think of it as a bouncer.
export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ location }) => {
    const isAuthenticated = !!useAuthStore.getState().token
    if (!isAuthenticated) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  return (
    <>
      <header className="app-header">
        <strong>my-app</strong>
        <nav>
          <Link to="/" activeOptions={{ exact: true }}>
            Home
          </Link>
          <Link to="/products">Products</Link>
        </nav>
        <span className="spacer" />
        <span className="user">{user?.name}</span>
        <button className="btn btn-secondary btn-sm" type="button" onClick={() => logout()}>
          Logout
        </button>
      </header>
      <main className="page">
        <Outlet />
      </main>
    </>
  )
}
```

**`src/routes/_authenticated/index.tsx`**

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { Home } from '@/features/home'

export const Route = createFileRoute('/_authenticated/')({
  component: Home,
})
```

**`src/routes/_authenticated/products/index.tsx`**

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { ProductList } from '@/features/products'

export const Route = createFileRoute('/_authenticated/products/')({
  component: ProductList,
})
```

**`src/routes/_authenticated/products/add.tsx`**

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { ProductForm } from '@/features/products'

// The static segment `add` wins over the dynamic `$productId` sibling.
export const Route = createFileRoute('/_authenticated/products/add')({
  component: () => <ProductForm mode="add" />,
})
```

**`src/routes/_authenticated/products/$productId/index.tsx`**

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { ProductForm } from '@/features/products'

export const Route = createFileRoute('/_authenticated/products/$productId/')({
  component: ProductViewPage,
})

function ProductViewPage() {
  const { productId } = Route.useParams()
  return <ProductForm mode="view" productId={productId} />
}
```

**`src/routes/_authenticated/products/$productId/edit.tsx`**

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { ProductForm } from '@/features/products'

export const Route = createFileRoute('/_authenticated/products/$productId/edit')({
  component: ProductEditPage,
})

function ProductEditPage() {
  const { productId } = Route.useParams()
  return <ProductForm mode="edit" productId={productId} />
}
```

The string inside `createFileRoute('...')` must match the file's place on disk. You don't have to get it right by hand: while `npm run dev` runs, the plugin corrects it for you.

### Step 12: The mock API

A **mock API** is a pretend backend that runs on your own computer, so you can build the frontend before the real one exists. This one is a small **Express** server (Express is the most common way to write a web server in Node.js). It keeps its data in a file, `mock-server/db.json`, so your products survive a restart. Delete that file and the server starts fresh from the seed data.

Create **`mock-server/server.js`** at the project root (next to `src/`, not inside it):

```js
import express from 'express'
import cors from 'cors'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const app = express()
const PORT = Number(process.env.MOCK_API_PORT ?? 3000)

app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

// ---------------------------------------------------------------------------
// File-backed "database": data lives in db.json next to this file, so it
// survives restarts. Delete db.json to reset everything to the seed below.
// ---------------------------------------------------------------------------
const __dirname = dirname(fileURLToPath(import.meta.url))
const DB_PATH = join(__dirname, 'db.json')

const SEED = {
  users: [{ id: 1, name: 'Admin', username: 'admin', password: 'admin' }],
  products: [
    { id: 1, name: 'Keyboard', price: 2500, description: 'Mechanical keyboard' },
    { id: 2, name: 'Mouse', price: 1200, description: 'Wireless mouse' },
    { id: 3, name: 'Monitor', price: 15000, description: '27 inch 4K display' },
  ],
}

const writeDb = (db) => writeFileSync(DB_PATH, JSON.stringify(db, null, 2) + '\n')
const readDb = () => {
  if (!existsSync(DB_PATH)) writeDb(SEED)
  return JSON.parse(readFileSync(DB_PATH, 'utf-8'))
}

// Next id = highest existing id + 1 (starts at 1 when the list is empty)
const nextId = (items) => items.reduce((max, item) => Math.max(max, item.id), 0) + 1

// Never send passwords back to the client
const toPublicUser = ({ password: _password, ...user }) => user

// A real server would sign a JWT. For a mock, one fixed token is enough.
const DUMMY_TOKEN = 'mock-token-admin'

// ---------------------------------------------------------------------------
// Auth middleware: protected routes need "Authorization: Bearer <token>".
// A missing/invalid token gets 403, which the frontend's axios interceptor
// turns into a logout + redirect to /login. Keep the two in sync.
// ---------------------------------------------------------------------------
const requireAuth = (req, res, next) => {
  const header = req.headers.authorization ?? ''
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : null
  if (token !== DUMMY_TOKEN) {
    return res.status(403).json({ message: 'Forbidden: missing or invalid token' })
  }
  next()
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
app.post('/auth/login', (req, res) => {
  const { username, password } = req.body ?? {}
  if (!username || !password) {
    return res.status(400).json({ message: 'username and password are required' })
  }

  const db = readDb()
  const user = db.users.find((u) => u.username === username && u.password === password)
  if (!user) {
    return res.status(401).json({ message: 'Invalid username or password' })
  }

  res.json({ token: DUMMY_TOKEN, user: toPublicUser(user) })
})

// ---------------------------------------------------------------------------
// Products (protected)
// ---------------------------------------------------------------------------
const validateProduct = ({ name, price, description }) => {
  if (typeof name !== 'string' || !name.trim()) return 'name is required'
  if (typeof price !== 'number' || !Number.isFinite(price) || price <= 0) {
    return 'price must be a positive number'
  }
  if (description !== undefined && typeof description !== 'string') {
    return 'description must be a string'
  }
  return null
}

app.get('/products', requireAuth, (req, res) => {
  res.json(readDb().products)
})

app.get('/products/:id', requireAuth, (req, res) => {
  const product = readDb().products.find((p) => p.id === Number(req.params.id))
  if (!product) return res.status(404).json({ message: 'Product not found' })
  res.json(product)
})

app.post('/products', requireAuth, (req, res) => {
  const body = req.body ?? {}
  const error = validateProduct(body)
  if (error) return res.status(400).json({ message: error })

  const db = readDb()
  const product = {
    id: nextId(db.products),
    name: body.name.trim(),
    price: body.price,
    description: body.description ?? '',
  }
  db.products.push(product)
  writeDb(db)
  res.status(201).json(product)
})

app.put('/products/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id)
  const db = readDb()
  const existing = db.products.find((p) => p.id === id)
  if (!existing) return res.status(404).json({ message: 'Product not found' })

  const body = req.body ?? {}
  const error = validateProduct(body)
  if (error) return res.status(400).json({ message: error })

  // Immutable update: build a new array instead of mutating in place
  const updated = {
    ...existing,
    name: body.name.trim(),
    price: body.price,
    description: body.description ?? '',
  }
  db.products = db.products.map((p) => (p.id === id ? updated : p))
  writeDb(db)
  res.json(updated)
})

app.delete('/products/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id)
  const db = readDb()
  if (!db.products.some((p) => p.id === id)) {
    return res.status(404).json({ message: 'Product not found' })
  }
  db.products = db.products.filter((p) => p.id !== id)
  writeDb(db)
  res.status(204).end()
})

// Anything else -> JSON 404 (instead of Express' HTML error page)
app.use((req, res) => {
  res.status(404).json({ message: `No route for ${req.method} ${req.path}` })
})

app.listen(PORT, () => {
  console.log(`Mock API running at http://localhost:${PORT}`)
  console.log('Login with: admin / admin')
})
```

What it answers:

| Method | Path | Needs token? | Notes |
|---|---|---|---|
| POST | `/auth/login` | no | `{ username, password }` → `{ token, user }` |
| GET | `/products` | yes | |
| GET | `/products/:id` | yes | 404 if missing |
| POST | `/products` | yes | 201; body `{ name, price, description }` |
| PUT | `/products/:id` | yes | full replace, same body as POST |
| DELETE | `/products/:id` | yes | 204 |

"Needs token" means the request must carry `Authorization: Bearer <token>`, using the token from the login response. Without it, the server answers **403**, and the Axios interceptor from Step 9 logs you out. The only login is **admin / admin**.

The file ends in `.js` and uses `import`, which works because Vite's `package.json` has `"type": "module"`.

### Step 13: Finishing touches

#### `.gitignore`

Vite's `.gitignore` already skips `node_modules` and `dist`. Add these lines at the end:

```
# Environment files (commit .env.example only)
.env
.env.local

# Mock API data (recreated from the seed on first run)
mock-server/db.json

# TanStack Router plugin scratch folder
.tanstack/
```

`.env` holds your machine's settings, and on a real project it might hold secrets, so it never goes into Git. `.env.example` does. `db.json` is your test data. `.tanstack/` is a scratch folder the router plugin creates.

#### `package.json` scripts

Open `package.json` and add two lines to `"scripts"`:

```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "mock-api": "node mock-server/server.js",
  "dev:all": "concurrently -k -n api,web -c blue,green \"npm run mock-api\" \"npm run dev\""
}
```

Watch the commas: every line except the last ends with one, and the quotes inside `dev:all` are escaped with backslashes. `concurrently` runs both commands in one terminal: `-n` names them, `-c` colours them, and `-k` stops both when you stop one.

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server (app only) |
| `npm run mock-api` | The mock API on port 3000 |
| `npm run dev:all` | Both of the above in one terminal |
| `npm run build` | Type-check (`tsc -b`), then build for production into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint |

#### `README.md`

Vite's README describes Vite's template, not your project. Replace it with a short one that answers the questions a new teammate would ask. The project name is the heading: location **4 of 4**.

````markdown
# my-app

React 19 + TypeScript starter.

| Area               | Library                                               |
| ------------------ | ----------------------------------------------------- |
| Build / dev server | Vite (React Compiler enabled)                         |
| Routing            | TanStack Router, file-based from `src/routes/`        |
| Server state       | TanStack Query                                        |
| Client state       | zustand (`src/features/auth/auth.store.ts`)           |
| HTTP               | axios (`src/lib/apiClient.ts`)                        |
| Forms + validation | react-hook-form + zod                                 |
| Styling            | SCSS (`src/index.scss`, `src/styles/_variables.scss`) |
| Linting            | ESLint                                                |
| Mock backend       | Express (`mock-server/server.js`)                     |

## Getting started

```bash
npm install
npm run dev:all   # mock API on http://localhost:3000 + app on http://localhost:5173
```

Or run the two halves in separate terminals: `npm run mock-api` and `npm run dev`.

Log in with **admin / admin**.

## Conventions

- UI lives in `src/features/<feature>/` with a barrel `index.ts`; route files stay thin.
- `@/` is an alias for `src/` (set in both `vite.config.ts` and `tsconfig.app.json`).
- The rest of the app imports `config` from `src/config/env.ts`, never `import.meta.env`.
- The mock API returns **403** for a missing/invalid token and the axios response
  interceptor logs out + redirects to `/login` on 403. Change both or neither.
- `src/routeTree.gen.ts` is generated by the router plugin. Never edit it by hand.

## Environment variables

Copy `.env.example` to `.env`. Variables are validated on startup in `src/config/env.ts`;
the app refuses to boot with a bad value.

| Variable            | Default                 |
| ------------------- | ----------------------- |
| `VITE_APP_ENV`      | `dev`                   |
| `VITE_API_BASE_URL` | `http://localhost:3000` |
| `VITE_API_TIMEOUT`  | `30000`                 |

## Mock API

| Method | Path            | Auth | Notes                                         |
| ------ | --------------- | ---- | --------------------------------------------- |
| POST   | `/auth/login`   | no   | `{ username, password }` -> `{ token, user }` |
| GET    | `/products`     | yes  |                                               |
| GET    | `/products/:id` | yes  | 404 if missing                                |
| POST   | `/products`     | yes  | 201; body `{ name, price, description }`      |
| PUT    | `/products/:id` | yes  | full replace, same body as POST               |
| DELETE | `/products/:id` | yes  | 204                                           |

Data lives in `mock-server/db.json` (git-ignored). Delete it to reset to the seed.
````

### Step 14: Run it and check it

Start both servers:

```
npm run dev:all
```

You'll see two colours of output: `api` in blue and `web` in green. Within a couple of seconds:

- The mock API prints `Mock API running at http://localhost:3000`.
- Vite prints its `Local: http://localhost:5173/` address.
- A new file appears: `src/routeTree.gen.ts`. The router plugin wrote it by reading `src/routes/`. The red squiggle in `src/lib/router.ts` disappears. **Never edit this file**, but do commit it to Git.

Open `http://localhost:5173`. You're sent to `/login`. Log in with **admin / admin**. Then:

1. Open **Products**. You see three seeded products.
2. **Add** one. The list updates by itself (that's TanStack Query refreshing after the mutation).
3. **Refresh the page.** You're still logged in (the store is persisted) and your product is still there (the server wrote it to `db.json`).
4. Click **Logout**. You're back on `/login`.
5. Type `http://localhost:5173/products` into the address bar while logged out. The layout route sends you to `/login?redirect=/products`, and after logging in you land on the products page.

Now the three checks you'll run before every commit. Open a second terminal inside `my-app` and leave the servers running:

```
npx tsc -b
npm run lint
npm run build
```

All three should finish without errors. (`npm run build` may warn that a chunk is larger than 500 kB. That's normal for now, and [chapter 40](../40-deploying/notes.md) looks at it.)

To stop everything, click in the terminal and press **Ctrl + C**. `concurrently` stops both servers.

Finally, make the first commit:

```
git init
git add .
git commit -m "Project setup"
```

Check `git status` first: `.env`, `node_modules/`, `dist/` and `mock-server/db.json` must **not** be in the list of files to commit. If they are, look at Step 13 again.

## Common mistakes

**1. Running `npx tsc -b` or `npm run build` before the first `npm run dev`**

```
src/lib/router.ts(2,27): error TS2307: Cannot find module '@/routeTree.gen'
```

Plus a wall of errors in every route file. The route map doesn't exist until the plugin has run once. Start `npm run dev`, wait two seconds, stop it, and try again.

**2. Changing `.env` and seeing no difference**

Vite reads `.env` when it starts. After editing it, stop the dev server and start it again.

**3. A variable without the `VITE_` prefix**

`API_URL=...` never reaches the browser. The app sees `undefined`, and `env.ts` refuses to start with `VITE_API_BASE_URL must be a valid URL` (if you also forgot to rename it in the schema, it simply isn't there). The prefix is the rule, not a suggestion.

**4. Creating the `$productId` folder in the terminal with double quotes**

`mkdir "src/routes/_authenticated/products/$productId"` makes a folder called `products/`, because the shell replaced `$productId` with nothing. Use single quotes, or create the file in VS Code.

**5. Editing `routeTree.gen.ts`**

Your edit is gone the next time a route file changes. The plugin owns that file. If a route is wrong, fix the route file.

**6. The alias works in Vite but VS Code shows red squiggles (or the other way round)**

`@/` is set in two files, `vite.config.ts` and `tsconfig.app.json`. One of them is missing it or has a typo. VS Code reads the tsconfig; Vite reads its own config.

**7. Changing the 403 in one place**

If the server starts answering 401 for a bad token but the interceptor still watches for 403, a stale token silently breaks every request instead of logging you out. The two numbers are a pair.

**8. Putting `mock-server/` inside `src/`**

Then Vite tries to bundle a Node server into the browser, and TypeScript checks it as app code. The mock server sits next to `src/`, not in it.

**9. Something else is on port 3000**

The mock API prints `EADDRINUSE`. Either stop the other program, or start the API with `MOCK_API_PORT=3001 npm run mock-api` (PowerShell: `$env:MOCK_API_PORT=3001; npm run mock-api`) **and** change `VITE_API_BASE_URL` in `.env` to match. Then restart Vite.

**10. Committing `.env` or `db.json`**

If `git status` lists them, the `.gitignore` lines from Step 13 are missing or misspelled. Fix the file, then `git rm --cached .env` to untrack it if it already went in.

## Quick recap

- A real project is a **set of answers**: where code goes (one folder per feature), where settings go (`.env`, checked once in `config/env.ts`), how pages are made (files in `src/routes/`), and how the app talks to the server (one Axios instance with interceptors).
- `npm create vite@latest`, then delete `App.tsx`, install the libraries, and write the config files: Vite, TypeScript and ESLint each need to know about the router plugin or the `@/` alias.
- Route files stay thin and point at feature components. The `_authenticated` layout is the bouncer for every protected page.
- The mock API is a tiny Express server with a file for a database. It answers 403 for a bad token, and the Axios interceptor turns that into a logout. The two are a pair.
- Before every commit: `npx tsc -b`, `npm run lint`, `npm run build`.

---

**Next:** this was a reference. Go to [01 Getting Started](../01-getting-started/notes.md) to create the small `playground` app you'll learn in, and come back here when you start a project of your own.
