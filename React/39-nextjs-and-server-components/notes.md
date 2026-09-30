# 39 Next.js and Server Components

## What is it?

**Next.js** is a React **framework**. What's the difference between a library and a framework?

- A **library** is a tool you call. React, Zod and Axios are libraries. Your code is in charge.
- A **framework** is a structure you fill in. It decides where your files go, and *it* calls *your* code.

A library is a drill you pick up when you need a hole. A framework is the frame of a house: the rooms are already laid out, and you fill them in.

Next.js is React plus what bigger apps end up needing: routing, rendering on the server, loading data, and a build setup for putting the app online. It's also the best-known home of **Server Components**: React components that run on the server (or once, when you build the app), and never in the browser. Their code isn't sent to the browser at all. Only what they render is.

```tsx
// A Server Component: it can be async, and await data directly
export default async function CategoriesPage() {
  const response = await fetch("https://www.themealdb.com/api/json/v1/1/categories.php");
  const data = await response.json();
  return <h1>{data.categories.length} categories</h1>;
}
```

No `useState` and no `useEffect`. By the time this component returns JSX, the data is already there.

This chapter uses **Next.js 16** (16.3 when this was written) with the **App Router**, and React 19. The App Router is the modern way to build Next.js pages, in an `app/` folder. (The older Pages Router uses a `pages/` folder instead. Many tutorials online still teach it: see mistake 10.) **Next.js changes fast**, faster than anything else in this course. If something here doesn't match what you see, trust the docs at [nextjs.org/docs](https://nextjs.org/docs), which show the version on every page. You'll create an app in a moment with `npx create-next-app@latest next-practice`.

## Why does it matter?

Every app in this course so far has been a **single-page app** (SPA). Vite sends the browser a nearly empty HTML page plus a lot of JavaScript, and the browser builds everything. Open your playground and press `Ctrl + U` (View Source):

```html
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
```

That's all the browser gets at first, and it causes four problems:

- **The first load is blank.** Nothing shows until the JavaScript has downloaded and run. On a cheap phone with a slow connection, that's seconds of white screen. And anything that reads the page without running JavaScript sees nothing, including many link previews in chat apps. (Google does run JavaScript, but less reliably than it reads HTML.)
- **Data comes last.** The [chapter 18](../18-fetching-data/notes.md) order is a **waterfall**: a chain where each step waits for the one before.
- **Secrets can't live in the browser.** Everything in front-end code is public ([JavaScript chapter 51](../../JavaScript/51-security-basics/notes.md)). A paid API key in React code is a key anyone can copy.
- **Anything private needs a second project.** Saving to a database or using a secret key means building and running a separate backend.

Frameworks fix this by moving some of the work to the server:

```
Vite app (chapter 18):                     Next.js with a Server Component:
1. Almost empty page    -> blank screen    1. The server fetches the data and renders HTML
2. JavaScript runs      -> still blank     2. HTML arrives with the recipes in it
3. Effect starts fetch  -> "Loading..."    3. JavaScript for the buttons loads,
4. Data arrives         -> the recipes        and the buttons start working
```

The **React team now recommends** starting new apps with a framework ([react.dev](https://react.dev/learn/creating-a-react-app) lists Next.js first). But a Vite SPA is still a great choice for many apps: a dashboard behind a login, an internal tool, a game, or learning. And nothing you've learned is wasted. Components, props, state, hooks, context and TypeScript work exactly the same inside Next.js.

## Real-world example

Think about eating at a **restaurant**.

| At the restaurant | In a React app |
|---|---|
| **SPA:** you're handed a box of ingredients and a recipe book, and you cook at your table | The browser downloads all the JavaScript and builds the page itself |
| **Server rendering:** the kitchen cooks, and a finished plate arrives | The server sends ready-made HTML |
| The kitchen's pantry and suppliers | Databases, files and APIs that only the server can reach |
| The secret sauce recipe never leaves the kitchen | Secrets and server code never reach the browser |
| The waiter at your table: refills, the bill, requests | Client Components: the interactive bits, like buttons and forms |
| Ordering dessert: the waiter takes it to the kitchen and brings it back | A Server Function: the browser asks, the server does the work |

The big change is that there are now **two places** your code can run: the kitchen and the table. Most of this chapter is about which code belongs where.

## How it works

### Creating the app

Open a terminal in this `React` folder (next to `playground`), and run `npx create-next-app@latest next-practice`. You need Node.js 20.9 or newer. When it asks about the recommended defaults, choose **No, customize settings**, then answer:

| Question | Your answer |
|---|---|
| TypeScript? | **Yes** |
| Which linter? | **ESLint** |
| React Compiler? | **No**, as in [chapter 01](../01-getting-started/notes.md). ([Chapter 27](../27-performance/notes.md) explains what it does.) |
| Tailwind CSS? | Your choice. **Yes** if you liked [chapter 16](../16-tailwind-css/notes.md). The examples barely style anything. |
| Code inside a `src/` directory? | **Yes**, like your Vite apps |
| App Router? | **Yes** |
| Customize the import alias? | **No** (keeps `@/*`) |
| Include AGENTS.md? | Your choice. It's a note telling AI assistants, like Claude, to use the docs for your installed version. |

(The questions change between versions. If yours look different, pick TypeScript, ESLint, the App Router and `src/`, and the default for anything else.)

Then `cd next-practice` and `npm run dev`, and open `http://localhost:3000`. That's Next.js's port, and it's why the practice API from [chapter 30](../30-axios/notes.md) uses 3001: the two never clash.

The files that matter:

- `src/app/` holds your pages. **Folders in here become URLs.**
- `src/app/layout.tsx` is the **root layout**: the `<html>` and `<body>` around every page.
- `src/app/page.tsx` is the home page, `/`.
- `next.config.ts` holds settings (empty for now). `.next/` is build output: never edit it.

Notice what's missing: no `index.html`, no `main.tsx`, no `createRoot`. Next.js owns those. You write pages, and the framework decides when to call them. (It even has its own **bundler**, Turbopack, doing the job Vite does in your other apps. It's the default, so there's nothing to set up.)

> **Two changes from the rest of the course.** Next.js's TypeScript setup doesn't allow `.ts` or `.tsx` at the end of an import, so here you write `import { getMeal } from "@/lib/mealdb";`. `@/` is a shortcut for `src/`, so that's `src/lib/mealdb.ts`. And type-check with `npx tsc --noEmit` instead of `npx tsc -b`. (`npm run build` checks types too.)

### Folders are routes

In [chapter 24](../24-react-router/notes.md) you wrote a route table in code. In Next.js, **the folders are the route table**. A folder inside `app/` is one piece of the URL, and a `page.tsx` inside it makes that URL a real page. A page is just a component, exported as the **default export**.

| File | URL |
|---|---|
| `src/app/page.tsx` | `/` |
| `src/app/about/page.tsx` | `/about` |
| `src/app/recipes/[id]/page.tsx` | `/recipes/52772`, `/recipes/anything` |
| `src/app/recipes/RecipeCard.tsx` | none: only files called `page.tsx` become pages |

That last row matters. Other files in a folder are just ordinary files, so you can keep a page's components right next to it.

A **layout** wraps pages. Replace the generated root layout with this:

```tsx
// src/app/layout.tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = { title: "Recipe Box", description: "Recipes from TheMealDB" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav>
          <Link href="/">Home</Link> | <Link href="/about">About</Link>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
```

- **`children` is the current page.** It does the job of `<Outlet />` in chapter 24.
- **The root layout is required**, and it must have `<html>` and `<body>`.
- **`metadata`** sets the `<title>` and description: the text search engines and link previews show.
- **Layouts stay put.** Moving between pages doesn't re-mount the layout, so state inside it survives, just like chapter 24's layout routes. Any folder can have its own `layout.tsx` too.
- **`Link` takes `href`, not `to`.** It swaps the page without a full reload. In a production build, it also **prefetches** (loads the next page in the background) when it scrolls into view, so clicks feel instant.

### Dynamic routes and `params`

Square brackets make a **dynamic segment**, like `:id` in chapter 24. Its value arrives as `params`:

```tsx
// src/app/recipes/[id]/page.tsx
type RecipePageProps = {
  params: Promise<{ id: string }>;
};

export default async function RecipePage({ params }: RecipePageProps) {
  const { id } = await params;
  return <h1>Recipe {id}</h1>;
}
```

- **`params` is a Promise, so you `await` it.** This changed in Next.js 15, and it's why the page is `async`. Older tutorials write `params.id` directly.
- **`id` is a plain `string`**, not `string | undefined` as with `useParams` in chapter 24. This file only renders for `/recipes/[id]`, so the value is always there.

Here's chapter 24, translated:

| React Router ([chapter 24](../24-react-router/notes.md)) | Next.js App Router |
|---|---|
| `<Route path="/books/:id" ...>` | A folder: `app/books/[id]/page.tsx` |
| A layout with `<Outlet />` | `layout.tsx` with `{children}` |
| `<Link to="/books">` | `<Link href="/books">`, from `next/link` |
| `useParams()` gives `string \| undefined` | `await params` gives `string` |
| `path="*"` for a 404 | `not-found.tsx` (below) |
| `useNavigate()`, `useSearchParams()` | `useRouter()`, `useSearchParams()`, from `next/navigation` |
| `NavLink` | Nothing built in: compare `usePathname()` with the link's `href` |

The hooks from **`next/navigation`** only work in Client Components, coming up soon. Don't import from `next/router`: that's the old Pages Router.

### Server Components are the default

Every component in the `app` folder is a **Server Component** unless you say otherwise. It runs on the server, it can be `async`, and it can `await` data right in the component. First, a helper that keeps the API's details in one place (the "boundary" idea from [chapter 18](../18-fetching-data/notes.md)):

```ts
// src/lib/mealdb.ts
const BASE = "https://www.themealdb.com/api/json/v1/1";

export type Category = { id: string; name: string };
type CategoriesResponse = { categories: Array<{ idCategory: string; strCategory: string }> };

export async function getCategories(): Promise<Category[]> {
  const response = await fetch(`${BASE}/categories.php`);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  const data: CategoriesResponse = await response.json();
  return data.categories.map((c) => ({ id: c.idCategory, name: c.strCategory }));
}
```

Then the page:

```tsx
// src/app/categories/page.tsx
import { getCategories } from "@/lib/mealdb";

export default async function CategoriesPage() {
  const categories = await getCategories();
  console.log("Rendering categories. typeof window is:", typeof window);

  return (
    <ul>
      {categories.map((category) => (
        <li key={category.id}>{category.name}</li>
      ))}
    </ul>
  );
}
```

Put that next to chapter 18 and look at what's gone:

| Chapter 18 (in the browser) | Server Component |
|---|---|
| Three `useState`s: data, loading, error | None. The data is just a variable. |
| A `useEffect` to start the fetch | None. You `await` it. |
| An `ignore` flag or `AbortController` | None. It runs once per request, so there's nothing to race. |
| The data is `null` at first, so every render checks | The data is there before any JSX runs |
| Loading and error UI inside every component | `loading.tsx` and `error.tsx`, once per route (below) |

One thing hasn't changed: `data: CategoriesResponse` is still a promise, not a proof. [Zod](../32-zod/notes.md) works on the server just as it does in the browser.

### Proving where it ran

Visit `/categories`, and check three things:

1. **The terminal** running `npm run dev` prints `typeof window is: undefined`. There's no `window` on the server, because there's no browser there. (In development, the browser's Console shows a copy too, labelled **Server**. Next.js replays server logs there to help you debug. The label tells you where it really ran.)
2. **The Network tab.** Reload, and filter for `categories.php`. Nothing. The server made that request, not your browser.
3. **View Source** (`Ctrl + U`). The category names are right there in the HTML, instead of an empty `<div id="root">`.

### What Server Components can't do

A Server Component runs on the server, sends its result, and is done. So it can't use anything that needs a browser, or needs to run again later: no **state or effects** (`useState`, `useEffect`, `useRef`, or custom hooks built on them), no **event handlers** (`onClick`, `onChange`), no **browser APIs** (`window`, `localStorage`), and no **context** ([chapter 22](../22-context/notes.md)).

Add `useState` to the categories page, and Next.js stops you with an error something like this (the exact words change between versions):

```
You're importing a component that needs `useState`. This React Hook only works
in a Client Component. To fix, mark the file (or its parent) with the
`"use client"` directive.
```

An `onClick` in a Server Component gives something like `Event handlers cannot be passed to Client Component props.` Both point the same way: interactive code needs a Client Component.

### Client Components with `"use client"`

Put `"use client";` at the very top of a file, above the imports, and its components become **Client Components**. They work like every component you've written so far:

```tsx
// src/app/recipes/[id]/FavouriteButton.tsx
"use client";

import { useState } from "react";

export function FavouriteButton({ recipeName }: { recipeName: string }) {
  const [isFavourite, setIsFavourite] = useState(false);

  return (
    <button type="button" aria-pressed={isFavourite} onClick={() => setIsFavourite(!isFavourite)}>
      <span aria-hidden="true">{isFavourite ? "♥" : "♡"}</span> Favourite {recipeName}
    </button>
  );
}
```

A Server Component page renders it like any other component: `<FavouriteButton recipeName={meal.name} />`. You'll see the whole recipe page in a moment. Three things to understand about `"use client"`:

**It marks a boundary, not one component.** The file with `"use client"`, and every file *it* imports, becomes part of the JavaScript sent to the browser. So you don't add it to every file, only to the "front door" of each interactive part.

**"Client" doesn't mean "only in the browser".** This confuses almost everyone. On the first visit, Next.js *also* runs Client Components on the server, to make HTML, so the button is in the page straight away. Then the browser downloads their JavaScript, and React **hydrates** them: it attaches state and event handlers to the HTML that's already there, like switching the electricity on in a house that's already built. So a Client Component runs in both places. That's why you can't read `localStorage` during render, even in a Client Component: on the server, it doesn't exist. Read it in an effect or an event handler, which only run in the browser.

**Keep them small.** Think of a page as server-rendered, with small **islands** of interactivity. Only the islands' code goes to the browser. Put `"use client"` on the page itself, and the whole page (and everything it imports) ships to the browser, and it can't be `async` any more.

### Passing things across the boundary

Props from a Server Component to a Client Component travel over the network, so they must be **serialisable**: possible to turn into text and back, like `JSON.stringify` in [JavaScript chapter 23](../../JavaScript/23-json-and-local-storage/notes.md).

| Fine as props | Not fine as props |
|---|---|
| Strings, numbers, booleans, `null` | Functions, like `onToggle={() => ...}` |
| Plain objects and arrays of those | Class instances |
| JSX, including Server Components | Server-only things, like an open database connection |

(React can also send a few extras, like `Date` and promises, and Server Functions are the one kind of function you *can* pass.) Pass an ordinary function, and you'll get an error something like `Functions cannot be passed directly to Client Components`.

**Server Components can go *inside* Client Components, as `children`.** Say `Collapsible` is a client island with an open/closed state, and `CategoryList` is an `async` Server Component:

```tsx
// In a Server Component page:
<Collapsible title="Categories">
  <CategoryList />
</Collapsible>
```

The server renders `<CategoryList />` first, and hands the *finished result* to `Collapsible` as `children`, so it stays a Server Component. What doesn't work is *importing* `CategoryList` inside `Collapsible.tsx`, because everything a client file imports becomes client code. Context providers work the same way: a provider is a Client Component, usually a small `Providers` wrapper around `{children}` in the root layout.

### The mental model

```
 THE SERVER (the kitchen)                      THE BROWSER (your table)
 --------------------------------------        -------------------------------
 layout.tsx, page.tsx   Server Components
   await getMeal(id)   <- APIs, files, secrets
   <FavouriteButton />  Client Component,
                        rendered to HTML here too
                    |
                    |-- 1. HTML for the page ----> the page shows at once
                    |-- 2. JavaScript, only for -> FavouriteButton hydrates:
                    |      Client Components       state and onClick work
                    |
 actions.ts   Server Functions <----- POST ------- a form is submitted
              save, then send fresh UI ----------> the page updates
```

| | Runs on the server | Runs in the browser | Its code is sent to the browser |
|---|---|---|---|
| **Server Component** | ✅ | ❌ | ❌ |
| **Client Component** | ✅ (for the first HTML) | ✅ | ✅ |
| **Server Function** | ✅ | ❌ (the browser only calls it) | ❌ |

### Loading states with `loading.tsx`

A page that awaits slow data makes the visitor wait. Add a `loading.tsx` next to the page:

```tsx
// src/app/recipes/[id]/loading.tsx
export default function Loading() {
  return <p>Loading recipe...</p>;
}
```

Now, when someone clicks through to a recipe, the layout stays on screen and this shows straight away, until the page is ready.

That's chapter 26's promise kept: Next.js wraps your page in `<Suspense fallback={<Loading />}>` for you. In [chapter 26](../26-error-boundaries-and-suspense/notes.md), Suspense did nothing for `useEffect` fetching, because it only works with things that opt in. `async` Server Components opt in. So you can also put `<Suspense>` around one slow part of a page, like `<Suspense fallback={<p>Loading...</p>}><SimilarRecipes /></Suspense>`. The rest of the page shows at once, and the slow part arrives when it's ready. That's called **streaming**: the server sends the page in pieces as they're finished.

### Errors with `error.tsx`

Chapter 26 said errors during server rendering use a "different mechanism". This is it. An `error.tsx` file is an error boundary for its folder:

```tsx
// src/app/recipes/[id]/error.tsx
"use client"; // error boundaries must be Client Components

type RecipeErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function RecipeError({ error, retry }: RecipeErrorProps) {
  return (
    <div role="alert">
      <p>Couldn't load this recipe. ({error.message})</p>
      <button type="button" onClick={() => retry()}>Try again</button>
    </div>
  );
}
```

- **It must be a Client Component.** Error boundaries are built on state (remember chapter 26's class).
- **It catches errors in that folder's page and below**, while the layout above keeps working: chapter 26's "one fuse per room". (It doesn't cover the `layout.tsx` in the same folder. The root layout has a special `global-error.tsx`.)
- **`retry()`** fetches and renders the page again. It became official in Next.js 16.3. Older versions and most tutorials use **`reset()`**, which re-renders without fetching again. Both exist today.
- **In production, the message is hidden.** An error thrown in a Server Component reaches the browser as a generic message plus a `digest`: an id you can match with your server's logs. The real message might contain private details, so it stays on the server.

### "Not found" with `notFound()`

An unknown recipe id isn't a crash. It's a missing page, and it deserves a proper 404. TheMealDB answers an unknown id with `{ meals: null }`, so say `getMeal(id)` in `src/lib/mealdb.ts` returns `Meal | null` (you'll write it in exercise 3):

```tsx
// src/app/recipes/[id]/page.tsx
import { notFound } from "next/navigation";
import { getMeal } from "@/lib/mealdb";
import { FavouriteButton } from "./FavouriteButton";

export default async function RecipePage({ params }: RecipePageProps) {
  const { id } = await params;
  const meal = await getMeal(id); // Meal | null

  if (!meal) {
    notFound(); // stops here, and shows not-found.tsx instead
  }

  return (
    <article>
      <h1>{meal.name}</h1>
      <FavouriteButton recipeName={meal.name} />
      <p>{meal.instructions}</p>
    </article>
  );
}
```

`notFound()` comes from `next/navigation`, and it never returns (its return type is `never`, as in [chapter 23](../23-use-reducer/notes.md)). So TypeScript knows `meal` isn't `null` after the `if`, with no `!`. Next to the page, a `not-found.tsx` is a plain component: a heading and a `Link` back to the categories. And a `not-found.tsx` at the top of `app/` also catches every URL that matches no page, like chapter 24's `path="*"`.

One route folder can now hold all of this:

```
src/app/recipes/[id]/
├── page.tsx              the page (a Server Component)
├── loading.tsx           shown while page.tsx is waiting
├── error.tsx             shown if something throws ("use client")
├── not-found.tsx         shown when you call notFound()
└── FavouriteButton.tsx   an ordinary component, no special meaning
```

### Changing data: Server Functions

Reading data is half the story. What about saving? In an SPA, saving needs an API on a server somewhere, like json-server in [chapter 30](../30-axios/notes.md), plus a request to reach it. Next.js has a shortcut: write an `async` function marked `"use server"`, and call it from a form.

That's a **Server Function**. Put `"use server";` at the top of a file, and every function it exports runs on the server. When the browser calls one, Next.js sends a `POST` request behind the scenes, and you never write a URL. When a Server Function handles a form or changes data, the docs also call it a **Server Action**. Same thing, different job title.

Here's a small guestbook, starting with the storage. It reads and writes a JSON file with `node:fs/promises` from [JavaScript chapter 49](../../JavaScript/49-nodejs-basics/notes.md). This code could never run in a browser, and that's the point:

```ts
// src/lib/guestbook.ts
import "server-only";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type Entry = { id: string; name: string; message: string };
// process.cwd() is the project folder, so this is next-practice/data/guestbook.json
const FILE = path.join(process.cwd(), "data", "guestbook.json");

export async function getEntries(): Promise<Entry[]> {
  return JSON.parse(await readFile(FILE, "utf8")) as Entry[];
}

export async function addEntry(entry: Entry): Promise<void> {
  const entries = await getEntries();
  await writeFile(FILE, JSON.stringify([...entries, entry], null, 2));
}
```

Create `data/guestbook.json` (next to `package.json`) containing `[]` first. **`import "server-only"`** is a guard: if a Client Component ever imports this file, the build fails with a clear error. Next.js understands it without installing anything. (If your editor complains anyway, `npm install server-only` quiets it.)

Next, the Server Function. It checks its input with Zod ([chapter 32](../32-zod/notes.md)), because **the browser can't be trusted**. The form's `required` attributes are nice, but anyone can send a POST with whatever they like. That's rule 1 of [JavaScript chapter 51](../../JavaScript/51-security-basics/notes.md): never trust user input.

```ts
// src/app/guestbook/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { addEntry } from "@/lib/guestbook";

const EntrySchema = z.object({
  name: z.string().trim().min(1, "Please tell us your name"),
  message: z.string().trim().min(1, "Please write a message").max(200, "Keep it under 200 characters"),
});

export type SignState = {
  errors?: { name?: string[]; message?: string[] };
  success?: boolean;
};

export async function signGuestbook(prevState: SignState, formData: FormData): Promise<SignState> {
  const result = EntrySchema.safeParse({
    name: formData.get("name"),
    message: formData.get("message"),
  });

  if (!result.success) {
    return { errors: z.flattenError(result.error).fieldErrors };
  }

  await addEntry({ id: crypto.randomUUID(), ...result.data });
  revalidatePath("/guestbook");
  return { success: true };
}
```

- **`formData.get("name")`** reads the input with `name="name"`, the `FormData` from [chapter 09](../09-forms/notes.md). Its type is `FormDataEntryValue | null`, which is exactly why Zod checks it.
- **Problems you expect, like a blank field, are returned, not thrown.** `error.tsx` is for real crashes. `z.flattenError` turns Zod's error into one list of messages per field, like `{ name: ["Please tell us your name"] }`.
- **`revalidatePath("/guestbook")`** tells Next.js "the data on this page changed, so render it fresh". The fresh page comes back in the same response. Leave it out, and the file changes but the list on screen doesn't.

The form uses a hook, so it's a Client Component:

```tsx
// src/app/guestbook/SignForm.tsx
"use client";

import { useActionState } from "react";
import { signGuestbook, type SignState } from "./actions";
import { SubmitButton } from "./SubmitButton";

const initialState: SignState = {};

export function SignForm() {
  const [state, formAction] = useActionState(signGuestbook, initialState);

  return (
    <form action={formAction}>
      <label htmlFor="name">Name</label>
      <input id="name" name="name" required />
      {state.errors?.name && <p>{state.errors.name[0]}</p>}
      <label htmlFor="message">Message</label>
      <textarea id="message" name="message" required />
      {state.errors?.message && <p>{state.errors.message[0]}</p>}
      <SubmitButton />
      {state.success && <p aria-live="polite">Thanks for signing!</p>}
    </form>
  );
}
```

This is [chapter 09](../09-forms/notes.md)'s promise, kept:

- **`action={formAction}` replaces `onSubmit`.** In React 19, a form's `action` can be a function. React collects the `FormData` and calls it for you: no `preventDefault`, and no `useState` for each field.
- **`useActionState(fn, initialState)`**, from `react`, gives you `[state, formAction, isPending]`. `state` is whatever your function returned last time, here the errors. That's why the Server Function takes `prevState` first and the `FormData` second.

The pending button uses `useFormStatus`, from **`react-dom`**. It reports on the `<form>` it's *inside*, so it has to be its own component, rendered within the form. (`isPending` from `useActionState` does the same job, if you prefer.)

```tsx
// src/app/guestbook/SubmitButton.tsx
"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Signing..." : "Sign the guestbook"}
    </button>
  );
}
```

Finally, the page stays a Server Component. It reads the file directly, and drops the form in as an island:

```tsx
// src/app/guestbook/page.tsx
import { getEntries } from "@/lib/guestbook";
import { SignForm } from "./SignForm";

export default async function GuestbookPage() {
  const entries = await getEntries();
  return (
    <>
      <h1>Guestbook</h1>
      <SignForm />
      <ul>
        {entries.map((entry) => <li key={entry.id}>{entry.name}: {entry.message}</li>)}
      </ul>
    </>
  );
}
```

No API endpoint, no fetch, no loading state, and no JSON parsing in the browser. The form posts, the server saves and re-renders, and the page updates.

> **A Server Function is a public door.** Next.js turns it into a real endpoint that anyone can call with a POST request, not only your form. Hiding the form from logged-out visitors doesn't protect it. Inside every Server Function: validate the input, check the person is allowed to do this (once your app has logins), and return only what the page needs.

### Secrets and environment variables

Server code finally gives secrets a safe home. Put them in a `.env.local` file in the project folder (next to `package.json`, not in `src/`):

```
WEATHER_API_KEY=abc123-very-secret
NEXT_PUBLIC_SITE_NAME=Recipe Box
```

Next.js loads these into `process.env` for you. There are two kinds:

- **Normal variables**, like `WEATHER_API_KEY`, exist only on the server. Read `process.env.WEATHER_API_KEY` in a Server Component or Server Function, and it never reaches the browser. In a Client Component, it's simply empty.
- **`NEXT_PUBLIC_` variables** are copied into the browser's JavaScript when you build, so anyone can read them. They're for things like a site name. **Never put a secret in one.** The prefix literally means "make this public".

`create-next-app` already lists `.env*` files in `.gitignore`, so they stay out of git. For any file that must never reach the browser, add `import "server-only";` at the top.

### Caching, honestly

Next.js works hard not to do the same work twice, and **how it does that has changed a lot between versions**. The short version for Next.js 16, as its docs describe it:

- **`fetch` results aren't cached by default.** (In Next.js 13 and 14 they were, so older tutorials say the opposite.)
- **But a page may be prerendered.** If a page has no dynamic `[segment]` and reads nothing from the request (like cookies or `searchParams`), `npm run build` may render it once, ahead of time. Everyone then gets that saved copy until something like `revalidatePath` refreshes it.
- **In development, pages are always rendered fresh**, so stale data usually shows up only after you build.
- **There's also a newer, opt-in model called Cache Components** (`cacheComponents: true` in `next.config.ts`, with a `"use cache"` directive), where you mark exactly what to cache. This chapter doesn't use it.

If your data ever looks stale, read the caching page of the docs for your version before anything else.

### How the Level 4 libraries fit in

Most of Level 4 still works in a Next.js app. What changes is *where* each one runs.

| Library | In a Next.js app |
|---|---|
| [Zod](../32-zod/notes.md) | Everywhere. In Server Functions, it's your real line of defence. |
| [React Hook Form](../33-react-hook-form/notes.md) | In Client Components, for big forms. Its submit handler can call a Server Function. |
| [Zustand](../34-zustand/notes.md), [Redux Toolkit](../35-redux-toolkit/notes.md) | Shared client state, in Client Components only |
| [TanStack Query](../31-tanstack-query/notes.md) | In Client Components, for data that changes while you look at it: polling, infinite scroll, live updates |
| [Axios](../30-axios/notes.md) | Works on both sides, though most Next.js code uses `fetch` |
| [React Router](../24-react-router/notes.md), [TanStack Router](../36-tanstack-router/notes.md) | Not used. The `app` folder *is* the router. |
| [Vitest and Testing Library](../28-testing/notes.md) | Still great for Client Components and plain functions. Vitest can't render `async` Server Components yet, so those are usually tested **end to end**, with a tool that drives a real browser. |

The biggest shift is server state. Much of what you'd fetch with TanStack Query in a Vite app, like "load the books for this page", becomes an `async` Server Component with no library at all.

### Other frameworks

Next.js isn't the only React framework. **React Router** has a **framework mode** (it used to be a separate framework called Remix), which [chapter 24](../24-react-router/notes.md) mentioned. It adds server rendering, **loaders** (functions that fetch a page's data on the server before it renders) and **actions** (functions that handle form posts). **TanStack Start** does similar things on top of [TanStack Router](../36-tanstack-router/notes.md), and **Expo** is a framework for phone apps. They name things differently, but this chapter's big ideas carry over: render on the server, keep secrets and data access on the server, and send the browser only the interactive parts.

### When to choose what

| A Vite SPA fits when... | Next.js fits when... |
|---|---|
| The app lives behind a login (a dashboard, an admin tool) | The content is public, and should show up in search engines and link previews |
| It's a tool or game that mostly works in the browser | A fast first load matters, even on slow phones |
| It should work offline | You need server-only code: secrets, a database, files |
| You want the simplest hosting: static files, anywhere | You'd rather not build a separate backend for small jobs |
| You're learning, or trying out an idea | You want routing, loading and error screens decided for you |

Next.js has costs too. It needs a host that can run a server ([chapter 40](../40-deploying/notes.md) looks at hosting), there's more to learn, and you always have to think about which side your code runs on. Neither choice is "the grown-up one". Pick the one that fits the app.

## Common mistakes

**1. Hooks or `onClick` in a Server Component**

A `useState` or an `onClick` in a page without `"use client"` is an error. Move the interactive part into a small `"use client"` component, and render that from the page.

**2. `"use client"` on every file**

It works, and it quietly turns your app back into an SPA with extra steps: everything ships to the browser, and nothing fetches on the server. Add it only where you need state, effects or event handlers, as far down the tree as you can.

**3. Thinking Client Components only run in the browser**

`localStorage.getItem("name")` in a Client Component's render fails on the server with `localStorage is not defined`. Client Components are also rendered on the server for the first HTML. Read browser-only things in `useEffect` or an event handler.

**4. Passing a function from a Server Component to a Client Component**

`<FavouriteButton onToggle={() => console.log("hi")} />` in a Server Component fails, because props have to cross the network. Pass data, and keep the function inside the Client Component.

**5. Importing server-only code into a Client Component**

A Client Component that imports your file-reading code tries to send it to the browser. At best it breaks, because `fs` doesn't exist there. At worst, private logic ends up in public JavaScript. Put `import "server-only";` at the top of those files, so the build catches it.

**6. Forgetting to `await params`**

`<h1>{params.id}</h1>` gives `Property 'id' does not exist on type 'Promise<{ id: string; }>'`. Since Next.js 15, `params` is a Promise. Make the page `async`, and `await params`.

**7. A secret in a `NEXT_PUBLIC_` variable**

`NEXT_PUBLIC_PAYMENT_SECRET` is a secret published to every visitor. Secrets get no prefix, and are only read on the server.

**8. Trusting what the form sends**

Reading `formData.get("name")` and saving it straight away, with no checks. A Server Function is a public endpoint. Validate with Zod on the server every time, even if the browser checked already.

**9. "My change doesn't show up" or "my data is stale"**

Two usual causes. After a Server Function changes data, you forgot `revalidatePath`, so the page on screen isn't re-rendered. Or it works in `npm run dev` but not after `npm run build`, because the page was prerendered. Check the caching docs for your version.

**10. Following an old tutorial**

A `pages/` folder, `getServerSideProps`, `getStaticProps`, or `import { useRouter } from "next/router"` all mean the older **Pages Router**. It still works, but in the `app` folder, hooks come from `next/navigation`, and data loads in `async` Server Components. Check the tutorial's version too: before 15 it won't `await params`, and before 13 there are no Server Components at all.

## Quick recap

- **Next.js is a React framework:** you fill in its structure, and it calls your code. Folders in `app/` are routes, `page.tsx` makes a page, and `layout.tsx` wraps pages and stays mounted.
- **Components are Server Components by default.** They run on the server, can be `async` and `await` data directly, and send HTML instead of code. No effects, no loading state juggling.
- **`"use client"` marks a boundary** for small interactive islands. Client Components are still rendered on the server first, then hydrated in the browser. Props across the boundary must be serialisable.
- **`loading.tsx`, `error.tsx` and `not-found.tsx`** give each route its Suspense fallback, error boundary and 404. And `params` is a Promise: `await` it.
- **Server Functions** (`"use server"`) handle changes: a form's `action`, `useActionState` for the result, `useFormStatus` for a pending button, and `revalidatePath` to refresh the page. They're public endpoints, so validate with Zod every time.
- **Secrets stay on the server** in `process.env`. Only `NEXT_PUBLIC_` variables reach the browser.
- **Caching has changed between versions.** When data looks stale, check the docs for your version.
- **A Vite SPA is still a great choice** for many apps, and everything from chapters 01 to 38 works in both.

---

**Next:** try the [exercises](exercises.md), then move on to [40 Deploying](../40-deploying/notes.md).
