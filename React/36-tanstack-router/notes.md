# 36 TanStack Router

## What is it?

**TanStack Router** is a router, like React Router from [chapter 24](../24-react-router/notes.md): it maps URLs to pages. The difference is that it's built around TypeScript. TypeScript knows every route in your app, so a broken link, a missing param or a bad search param gets a red squiggle in VS Code before the code ever runs.

```tsx
<Link to="/books/$bookId" params={{ bookId: "3" }}>Foundation</Link>
```

Misspell `/books`, or forget `params`, and that line won't compile.

This chapter uses **TanStack Router v1** (the package is `@tanstack/react-router`) with **file-based routing** through its Vite plugin, `@tanstack/router-plugin`. File-based routing means each page is a file, and your folders *are* the route table. It's made by the same team as TanStack Query ([chapter 31](../31-tanstack-query/notes.md)), and the two are designed to work together.

> **This library moves fast.** Version 1 has had well over a hundred minor releases, and some names have changed along the way. This chapter was checked against 1.170. If something doesn't match what you see, trust the [official docs](https://tanstack.com/router/latest/docs).

## Why does it matter?

Chapter 24 left three gaps where TypeScript couldn't help you:

```tsx
const { id } = useParams();            // string | undefined, on every page, every time
<Link to="/boks/3">Dune</Link>         // a typo: compiles fine, 404s in the browser
const page = searchParams.get("page"); // string | null. "2"? "banana"? Check it yourself.
```

All three have the same cause. React Router's declarative mode can't tell TypeScript which routes exist, or which route rendered this component. So `to` accepts any string, every param might be missing, and search params are untyped text.

TanStack Router closes those gaps by generating a map of your routes that TypeScript can read. `<Link to>` only accepts URLs that exist. A page's params are `string`, never `undefined`. And search params are checked by a Zod schema ([chapter 32](../32-zod/notes.md)), so `page` comes out as a real `number`.

To be fair to React Router: it's used far more widely, it's excellent, and its v7 "framework mode" can generate route types too. TanStack Router simply starts from TypeScript instead of adding it later. Neither choice is wrong, and knowing both means you can work in either kind of codebase.

## Real-world example

Think about **addressing an envelope** versus **using a sat-nav**.

| Paper envelope | Sat-nav |
|---|---|
| You can write any address, real or not | You can only choose addresses that exist |
| A typo is found when the letter comes back | A typo is flagged while you type |
| "Flat 3" or "Flat three"? The postie guesses | The house number has to be a number |
| You keep your own list of streets | The map updates itself when new roads open |
| It can't tell you if anyone's home | Neither can the sat-nav: a real address can be an empty house |

That last row matters. TanStack Router can prove `/books/3` is a real *kind* of page. It can't prove book 3 exists. You still handle that, and this chapter shows where.

## How it works

### A new practice app

File-based routing takes over the whole app: the files in `src/routes/` decide what's on screen, and there's no `App.tsx` any more. So this chapter uses a **new** Vite app.

1. In a terminal in the `React` folder, run `npm create vite@latest` and answer as in [chapter 01](../01-getting-started/notes.md), naming the project `router-practice`.
2. `cd router-practice`, then install the router, its devtools, and the plugin:

   ```
   npm install @tanstack/react-router @tanstack/react-router-devtools
   npm install -D @tanstack/router-plugin
   ```

3. Delete `src/App.tsx`, `src/App.css` and `src/assets/`. Copy `books.ts` and `index.css` from `React/29-project-online-bookstore/starter/src/` into `src/`, so you have the bookstore's 12 books and all its styles.

Then add the plugin to `vite.config.ts`. A **plugin** is an add-on that gives Vite an extra job. This one watches `src/routes/` and writes the route map for you:

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

export default defineConfig({
  plugins: [
    // The router plugin must come BEFORE react()
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
  ],
});
```

The docs are firm that the router plugin goes before `react()`. Older tutorials import it as `TanStackRouterVite`: same plugin, old name. (TanStack also has a command that sets all this up for you, `npx @tanstack/cli create --router-only` at the time of writing. Doing it by hand once shows you what each piece is for.)

### Routes are files

Make a `src/routes/` folder. Each file in it is a page, and where it sits decides its URL:

| File | URL |
|---|---|
| `src/routes/__root.tsx` | none: it wraps every page (the layout) |
| `src/routes/index.tsx` | `/` |
| `src/routes/about.tsx` | `/about` |
| `src/routes/books/index.tsx` | `/books` |
| `src/routes/books/$bookId.tsx` | `/books/1`, `/books/42`, ... |

**`index`** means "the page for this folder itself". **`$`** marks a **path param**, a part of the URL that changes. It's chapter 24's `:id` with a different symbol.

Every route file exports a `Route`:

```tsx
// src/routes/about.tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  return <h1 className="page-title">About Paper &amp; Ink</h1>;
}
```

The string in `createFileRoute("/about")` must match where the file lives, but you don't have to type it. Create an **empty** file in `src/routes/` while `npm run dev` is running, and the plugin fills in a starter route. Move a file, and it fixes the string. (It writes single quotes and no semicolons; change them if you like.) One surprise: an index route's string ends in a slash, so `books/index.tsx` gets `createFileRoute("/books/")`.

### The route map: `routeTree.gen.ts`

While `npm run dev` runs, the plugin writes `src/routeTree.gen.ts` (**gen** is short for generated). It lists every route and their types. Somewhere in the middle is a line like this:

```ts
to: '/' | '/about' | '/books/$bookId' | '/books'
```

That's a union type ([TypeScript chapter 06](../../TypeScript/06-unions-and-narrowing/notes.md)) of every URL in your app. It's the sat-nav's map. **Never edit this file**: it's rebuilt every time you add, rename or delete a route. Do commit it to Git, though. The docs say it's part of your app's source code.

### The root route: a layout for every page

`__root.tsx` plays the part of chapter 24's `Layout` route. It renders on every page, and `<Outlet />` is where the current page goes:

```tsx
// src/routes/__root.tsx
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: () => <p className="status-message">Page not found.</p>,
});

function RootLayout() {
  return (
    <div className="app">
      <header className="site-header">
        <nav className="main-nav">
          <Link to="/" className="nav-link" activeOptions={{ exact: true }}>Home</Link>
          <Link to="/books" className="nav-link">Books</Link>
          <Link to="/about" className="nav-link">About</Link>
        </nav>
      </header>
      <main className="page">
        <Outlet />
      </main>
      <TanStackRouterDevtools />
    </div>
  );
}
```

`notFoundComponent` replaces chapter 24's `path="*"` route: it shows for any URL that matches no route. `TanStackRouterDevtools` is a debugging panel, covered at the end.

### Starting the router: `main.tsx`

Replace `src/main.tsx` with this:

```tsx
// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen.ts";
import "./index.css";

const router = createRouter({ routeTree });

// Tell TypeScript about YOUR routes
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
```

`createRouter` builds the router from the generated map, and `<RouterProvider>` takes the place of chapter 24's `<BrowserRouter>` and `<App />`.

The `declare module` block is the strange-looking part. The library's `Link` was written once, for every app in the world, so on its own it can't know *your* routes. This block adds your router's type to an empty `Register` interface inside the library, and TypeScript combines the two. From then on, every `Link`, `useNavigate` and `useSearch` knows your routes. [TypeScript chapter 04](../../TypeScript/04-type-aliases-and-interfaces/notes.md) called this **declaration merging** and said libraries use it. Here's one doing it, and it's why this must be an `interface`, not a `type`.

Now run `npm run dev` and visit `/`, `/about` and `/nonsense`. The header stays put; only the part inside `<Outlet />` changes.

### Links that TypeScript checks

`Link` works like chapter 24's, except for params: you write the route's *pattern*, and pass the params separately.

```tsx
<Link to="/about">About</Link>
<Link to="/books/$bookId" params={{ bookId: "3" }}>Foundation</Link>
```

Now make mistakes on purpose. A typo in `to`:

```
Type '"/bokks"' is not assignable to type '"." | ".." | "/" | "/about" | "/books/$bookId" | "/books"'.
Did you mean '"/books"'?
```

Forgetting `params`:

```
Property 'params' is missing in type '{ children: string; to: "/books/$bookId"; }' but required in type ...
```

Even `to="/books/3"` is an error, because `/books/3` isn't on the list. The pattern-plus-`params` style feels wordy at first. It pays off when you rename a route: every link to the old name turns red, and you fix them all before a user finds one.

**Active links.** Chapter 24 needed a separate `NavLink`. Here, every `Link` knows when it points at the current page, and adds three things to its `<a>` when it does:

| Added when active | Useful for |
|---|---|
| `class="active"`, joined onto your own `className` | Chapter 29's CSS: `.nav-link.active` just works |
| `data-status="active"` | Styling with an attribute selector instead |
| `aria-current="page"` | Screen readers announce "current page" ([chapter 38](../38-accessibility/notes.md)) |

Want a different class? Use `activeProps={{ className: "current" }}`. A link also counts as active on every page *below* it, like `NavLink` without `end`. That's why Home has `activeOptions={{ exact: true }}`; without it, Home is highlighted everywhere.

### Path params: a string, never undefined

Here's the book page, using the local data for now:

```tsx
// src/routes/books/$bookId.tsx
import { createFileRoute } from "@tanstack/react-router";
import { books } from "../../books.ts";

export const Route = createFileRoute("/books/$bookId")({
  component: BookPage,
});

function BookPage() {
  const { bookId } = Route.useParams(); // bookId: string
  const book = books.find((b) => b.id === bookId);

  if (!book) {
    return <p className="status-message">We couldn't find that book.</p>;
  }
  return <h1 className="book-detail-title">{book.title}</h1>;
}
```

`Route.useParams()` belongs to *this* route, so it knows this page always has a `bookId`. No `undefined`, no check, no `!`, unlike every page in chapter 24.

But notice what didn't go away: `find` still returns `Book | undefined`. A URL can have the right *shape* and still point at nothing, like `/books/999`. The param is a `string`; that doesn't mean the book exists. Loaders, below, give that case a proper home.

### Search params, checked by Zod

In [chapter 29](../29-project-online-bookstore/notes.md) you put the book filters in the URL so any view could be shared. But you read every value by hand, and `?page=banana` would have gone straight through. Here a Zod schema does the checking. Install it with `npm install zod`, then:

```tsx
// src/routes/books/index.tsx
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { books, GENRES } from "../../books.ts";

const bookSearchSchema = z.object({
  q: z.string().default("").catch(""),
  genre: z.enum(["all", ...GENRES]).default("all").catch("all"),
  sort: z.enum(["title", "price-asc", "price-desc"]).default("title").catch("title"),
  page: z.number().int().min(1).default(1).catch(1),
});

export const Route = createFileRoute("/books/")({
  validateSearch: bookSearchSchema,
  component: BooksPage,
});
```

`validateSearch` runs the schema on every visit, before the page renders. Each field ends with two helpers:

- **`.default(x)`** means "if it's missing, use `x`". It also tells the router the param is optional, so `<Link to="/books">` doesn't have to pass any.
- **`.catch(x)`** means "if it's there but it's rubbish, use `x`" instead of failing.

| URL | What `Route.useSearch()` gives you |
|---|---|
| `/books` | `{ q: "", genre: "all", sort: "title", page: 1 }` |
| `/books?genre=Crime&page=2` | `genre: "Crime"` and `page: 2`, a real number |
| `/books?page=banana` | `page: 1` |
| `/books?genre=poetry` | `genre: "all"` |

`page: 2` arrives as a number with no `Number()` from you, because TanStack Router reads search values like JSON. Leave out each helper to see why it's there. Without `.catch()`, `?page=banana` fails validation and the route's error screen shows instead of the page. Without `.default()`, every `<Link to="/books">` in your app says `Property 'search' is missing`.

(Version note: Zod 4 schemas go straight in, because Zod 4 follows a shared standard called **Standard Schema** that the router understands. With Zod 3, you'd wrap the schema in `zodValidator()` from `@tanstack/zod-adapter`. You'll see both in tutorials.)

**Reading** them is one line, and every value is typed:

```tsx
function BooksPage() {
  const { q, genre, page } = Route.useSearch(); // string, "all" | Genre, number

  const matching = books.filter((book) => {
    const matchesQuery = book.title.toLowerCase().includes(q.toLowerCase());
    const matchesGenre = genre === "all" || book.genre === genre;
    return matchesQuery && matchesGenre;
  });
  // ...show 4 of `matching` per page...
}
```

**Changing** them with a link: `search` can be a function that gets the current values (`prev`) and returns new ones.

```tsx
<Link from={Route.fullPath} search={(prev) => ({ ...prev, page: prev.page + 1 })}>
  Next page
</Link>
<Link to="/books" search={{ genre: "Crime" }}>Crime novels</Link>
```

`from={Route.fullPath}` means "starting from this page", which is how TypeScript knows `prev.page` is a number. (The docs also show `to="."`, but then `prev` is loosely typed and `prev.page` might be `undefined`.)

**Changing** them from code, like a search box, uses `useNavigate` with the same `from`:

```tsx
const navigate = useNavigate({ from: Route.fullPath });

<input
  className="search-input"
  value={q}
  onChange={(event) =>
    navigate({
      search: (prev) => ({ ...prev, q: event.target.value, page: 1 }),
      replace: true, // no history entry per keystroke (chapter 29's decision)
    })
  }
/>
```

One thing you'll notice in the address bar: visit `/books` and it becomes `/books?q=&genre=all&sort=title&page=1`. The router writes the checked values back into the URL. That's harmless, and the exercises show how to tidy it.

| | Chapters 24 and 29: `useSearchParams` | TanStack Router: `validateSearch` |
|---|---|---|
| Type of `page` | `string \| null` | `number` |
| `?page=banana` | Your code's problem | Becomes `1` |
| Default values | `?? ""` every time you read | Once, in the schema |
| A link to `?genre=Poetry` | Compiles | Type error |

### Loaders: fetch before the page shows

Real data lives on a server, and [chapter 18](../18-fetching-data/notes.md) fetched it in an effect. That has a built-in delay: the component renders first with nothing to show, *then* the effect runs, and only *then* does the request start. If a child component fetches too, its request can't even start until the parent's data has arrived. Requests that wait on each other like that are called a **waterfall**.

A **loader** is a function on the route that fetches the page's data. The router knows where you're going the moment you click, so it starts the loader right then, before rendering anything. If several routes on the page have loaders, they run at the same time.

To feel the difference, make a fake slow API in `src/api.ts`:

```ts
// src/api.ts
import { books, type Book } from "./books.ts";

// Pretend to be a slow server: wait, then answer.
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchBooks(): Promise<Book[]> {
  await wait(1500);
  return books;
}

// Like a real API, "no such book" is an answer (null), not a crash.
export async function fetchBook(id: string): Promise<Book | null> {
  await wait(1500);
  return books.find((book) => book.id === id) ?? null;
}
```

Now the book page gets a loader, plus a component for each of the other outcomes:

```tsx
// src/routes/books/$bookId.tsx
import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { fetchBook } from "../../api.ts";

export const Route = createFileRoute("/books/$bookId")({
  loader: async ({ params }) => {
    const book = await fetchBook(params.bookId);
    if (!book) {
      throw notFound(); // show notFoundComponent instead
    }
    return book;
  },
  component: BookPage,
  pendingComponent: () => <p className="status-message">Loading book…</p>,
  errorComponent: BookError,
  notFoundComponent: () => <Link to="/books">No such book. Back to all books</Link>,
});

function BookPage() {
  const book = Route.useLoaderData(); // Book: not null, not undefined, not loading
  return <h1 className="book-detail-title">{book.title}</h1>;
}

function BookError({ error }: ErrorComponentProps) {
  const router = useRouter();
  return (
    <div role="alert" className="status-message error">
      <p>Couldn't load this book: {error instanceof Error ? error.message : "unknown error"}</p>
      <button onClick={() => router.invalidate()}>Try again</button>
    </div>
  );
}
```

Look at `BookPage`. No `useState`, no `useEffect`, no `isLoading`, no `ignore` flag. By the time it renders the data is there, and `Route.useLoaderData()` knows its type from what the loader returned. Every other outcome has its own component:

| What happened | What shows |
|---|---|
| Still loading after 1 second | `pendingComponent` |
| The loader threw an error | `errorComponent` (`router.invalidate()` runs the loader again) |
| The loader threw `notFound()` | `notFoundComponent` |
| It worked | `component` |

That's chapter 18's loading, error and data states, plus chapter 26's error boundary, declared once per route. (In 1.170, `error` is typed `unknown`, hence the `instanceof Error` check. Older versions typed it as `Error`; the check works for both.)

About that "1 second": it's on purpose. While a loader runs, the router keeps the **old page on screen**, the way a normal website does. Only if the wait passes 1 second does `pendingComponent` appear, and then it stays for at least half a second so it never just flickers. (The route options `pendingMs` and `pendingMinMs` change those numbers.) On the very first page load there's no old page to keep, so the screen is blank for that first second. So be honest about what loaders do: they don't make the wait disappear. They start it earlier, and give it a proper place.

Want to start even earlier? Add `defaultPreload: "intent"` to `createRouter`, and the router runs a page's loader as soon as you **hover** over a link to it. By the time you click, the data is often already there.

### Loaders and TanStack Query together

The router keeps loader results for a few minutes, but it's a basic cache: nothing is shared between routes, and there are no mutations. You already know a proper one, TanStack Query from [chapter 31](../31-tanstack-query/notes.md). The two fit neatly: **the router starts the fetch early, and the query cache keeps it.**

After `npm install @tanstack/react-query`, give the root route a **context**: a typed box of things every loader can reach, a bit like chapter 22's Context but for loaders. In `__root.tsx`:

```tsx
import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext } from "@tanstack/react-router";

type RouterContext = { queryClient: QueryClient };

// The double call, ()({ ... }), is on purpose
export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});
```

In `main.tsx`, create the client, hand it to the router, and wrap `<RouterProvider>` in chapter 31's `<QueryClientProvider client={queryClient}>`:

```tsx
const queryClient = new QueryClient();

const router = createRouter({
  routeTree,
  context: { queryClient },   // leave this out: "Property 'context' is missing"
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0, // the docs' advice: let TanStack Query decide what's fresh
});
```

Then describe the query once with `queryOptions`, and use it in both the loader and the component:

```tsx
// src/queries.ts
export const booksQueryOptions = queryOptions({
  queryKey: ["books"],
  queryFn: fetchBooks,
});

// src/routes/books/index.tsx
export const Route = createFileRoute("/books/")({
  validateSearch: bookSearchSchema,
  loader: ({ context }) => context.queryClient.ensureQueryData(booksQueryOptions),
  component: BooksPage,
});

function BooksPage() {
  const { data: books } = useSuspenseQuery(booksQueryOptions); // Book[]
  // ...everything else as before...
}
```

`ensureQueryData` means "give me what's in the cache, and only fetch if there's nothing there". So the loader fills the cache before render, and the component reads the same cache. Because the data is sure to be there, `useSuspenseQuery` (the Suspense-ready hook [chapter 26](../26-error-boundaries-and-suspense/notes.md) promised) types `data` as `Book[]`, never `undefined`. Plain `useQuery` works too, with `data` typed `Book[] | undefined`. Come back to `/books` later and the list appears at once from the cache, with all of chapter 31's refetching rules still working. [Chapter 37](../37-project-task-board/notes.md) builds a whole app this way.

### Code splitting, for free

In [chapter 26](../26-error-boundaries-and-suspense/notes.md) you split pages into separate downloads by hand, with `lazy()` and `<Suspense>`. The `autoCodeSplitting: true` option does it for every route file. Run `npm run build` and you'll see a small extra JavaScript file per page. There's one rule: **don't `export` your page components** from a route file, only `Route`. An exported component gets pulled into the main bundle and isn't split.

### Devtools

`<TanStackRouterDevtools />` adds a small floating button to a corner of the page while you develop. Open it to see which routes matched, their params, search params and loader data, and what's cached. When a page shows the wrong thing, look there first. It isn't shown in production builds.

### When you don't need it

- **An app with a couple of pages.** A form and a thank-you page don't need a route map. React Router, or no router at all, is fine.
- **A team already happy on React Router.** Switching routers touches every page. That costs more than a few typed links are worth, and React Router's framework mode has type generation of its own.
- **Next.js.** The framework in [chapter 39](../39-nextjs-and-server-components/notes.md) comes with its own file-based router.

## Common mistakes

**1. Editing `routeTree.gen.ts`**

Your change works until you next add a route. Then the plugin rewrites the file and your change is gone. Change the files in `src/routes/` instead.

**2. The plugin missing, or listed after `react()`**

Without the plugin, the route map is never written, and you get `Cannot find module './routeTree.gen.ts'`. (You'll also see that if you run `npx tsc -b` in a fresh app before `npm run dev` has ever run.) The docs say `tanstackRouter()` must come before `react()`, so keep it first in the list.

**3. Forgetting the `Register` block**

This one is sneaky, because nothing breaks. The app runs, and there are no errors, because links aren't being checked at all. Delete the block and `<Link to="/bokks">` compiles happily. If a misspelled link isn't going red, check `main.tsx`.

**4. Using `:id`, React Router's way**

```tsx
<Link to="/books/:bookId" params={{ bookId: "3" }}>   // ❌
// Type '"/books/:bookId"' is not assignable to type ... Did you mean '"/books/$bookId"'?
```

TanStack Router uses `$`, in file names and in `to`.

**5. Ordinary components inside `src/routes/`**

The plugin treats every file there as a route. Put a `BookCard.tsx` in it, and the terminal warns that it `does not export a Route`. Keep components in `src/components/`. If you really want one next to its route, start its name with a dash, like `-BookCard.tsx`, and the plugin skips it.

**6. Reading search params without `validateSearch`**

```tsx
const { page } = Route.useSearch();
// ❌ Property 'page' does not exist on type '{}'.
```

Without a schema, the router has no idea what's in the URL, so neither does TypeScript.

**7. Thinking "a string, not undefined" means "it exists"**

`bookId` is always a string. Book `"999"` still doesn't exist. Check in the loader and `throw notFound()`.

**8. Mixing up `react-router` and `@tanstack/react-router`**

Both export a `Link`, an `Outlet` and a `useNavigate`. In a project with both installed (say, halfway through moving the bookstore across), VS Code's auto-import can pick the wrong one. React Router's `Link` accepts any string, so the tell-tale sign is a typo that doesn't go red. Check the import line.

## Quick recap

- **TanStack Router** is a router built around TypeScript, so links, params and search params are checked before your code runs. This chapter uses v1 with file-based routing.
- **Routes are files** in `src/routes/`: `__root.tsx` is the layout, `index` is a folder's own page, and `$bookId` is a path param. The Vite plugin, listed before `react()`, writes `routeTree.gen.ts`. Never edit it.
- The **`Register`** block in `main.tsx` connects your routes to TypeScript. Without it, nothing is checked.
- `Route.useParams()` gives a `string`, never `undefined`, but the item can still be missing. That's what `throw notFound()` is for.
- **`validateSearch`** with a Zod schema turns the query string into typed values. `.default()` makes a param optional, and `.catch()` swaps rubbish for a fallback.
- **Loaders** fetch before render, with `pendingComponent`, `errorComponent` and `notFoundComponent` for the other outcomes. With TanStack Query, the loader calls `ensureQueryData` and the component reads the same cache.

---

**Next:** try the [exercises](exercises.md), then build the [37 Project: Task Board](../37-project-task-board/notes.md), which brings the whole of Level 4 together.
