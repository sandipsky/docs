# 36 TanStack Router: Exercises

**How to do these:**

- These exercises use the new `router-practice` app from the notes, not the playground. File-based routing takes over the whole app, so there's no `src/ch36/` folder this time. Exercises 1 to 4 build **one app, step by step**. Before you start each one, commit (or copy the folder) so you can always go back.
- Keep `npm run dev` running while you work. The plugin only rewrites `routeTree.gen.ts` while it's running.
- **Test every exercise with the back and forward buttons, and by refreshing on a deep URL** like `/books/3?page=2`. Those are the things a router exists for.
- An exercise is done when it works in the browser, VS Code shows no red squiggles, `npx tsc -b` prints nothing, and the Console has no unexpected errors.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Three pages and a shared header

A small bookshop wants a website: a home page, an about page and a contact page, with the same header on all three.

1. Set up `router-practice` as in the notes: the installs, `vite.config.ts` (plugin before `react()`), `main.tsx` with the `Register` block, and `__root.tsx` with a header, `<Outlet />` and a `notFoundComponent`.
2. Add `index.tsx` and `about.tsx` by writing them yourself.
3. With `npm run dev` running, create `src/routes/contact.tsx` as an **empty** file. Open it again a moment later. What's in it now? Tidy it up into a real contact page.
4. Open `src/routeTree.gen.ts` and find the `to:` line. Write down what it looked like before and after step 3.
5. Put a nav in the header with a link to each page, using `className="nav-link"`. Check in the Elements tab that the current page's link gets `active`, `data-status` and `aria-current`. Make sure Home isn't highlighted on the other pages.
6. Break it on purpose: change a link to `to="/contatc"`. Write the exact TypeScript error in a comment. Fix it.
7. Now delete the `Register` block from `main.tsx` and make the same typo again. What does VS Code say this time? Put the block back, and write one sentence about why that block matters.

**What you should see:** three pages, one header that never flickers, and a friendly message at `/nonsense`.

<details>
<summary>Hint 1</summary>

For step 5, links are active on every page *below* them, and every page is below `/`. Look at the `activeOptions` prop on the Home link in the notes.

</details>

<details>
<summary>Hint 2</summary>

For step 7, the silence is the lesson. Without `Register`, TypeScript has no map of your routes, so `to` quietly accepts any string. Nothing is wrong, and nothing is checked.

</details>

---

## Exercise 2 (Easy): A page for every book

The shop's catalogue is the 12 books in `src/books.ts` (copied from chapter 29's starter).

1. Add `src/routes/books/index.tsx`: a list of every book's title, each one a `<Link>` to its own page.
2. Add `src/routes/books/$bookId.tsx`: the cover, title, author, genre, and the price as `£9.99`. Read the id with `Route.useParams()`.
3. Hover over `bookId` in VS Code and write down its type. Compare it with chapter 24's `useParams`.
4. `/books/999` must show "We couldn't find that book" with a link back to the list. Not a crash, and not a blank page.
5. Add **Books** to the header nav. Check that it stays highlighted while you're on a single book's page.
6. Make three mistakes on purpose and write down each error in a comment: a link with `to="/books/3"`, a link with `params={{ id: "3" }}`, and a link with `to="/books/:bookId"`.

<details>
<summary>Hint 1</summary>

The book list's link needs two props: the route's pattern in `to`, and the actual id in `params`. The pattern is the same for every book; only `params` changes.

</details>

<details>
<summary>Hint 2</summary>

Step 4 is the "string, not undefined" lesson. `bookId` is always a string, but `books.find(...)` can still come back `undefined`. TypeScript will make you handle it, the same as every `find` since [chapter 04](../04-props/notes.md).

</details>

---

## Exercise 3 (Medium): Filters that live in the URL

Now make the book list searchable, like [chapter 29's milestone 2](../29-project-online-bookstore/notes.md), but with checked search params.

1. Add `validateSearch` to `books/index.tsx` with four params: `q` (default `""`), `genre` (`"all"` or one of `GENRES`, default `"all"`), `sort` (`"title"`, `"price-asc"` or `"price-desc"`, default `"title"`) and `page` (a whole number, at least 1, default 1).
2. Add a search box, a genre `<select>` and a sort `<select>`. All three read from `Route.useSearch()` and write with `useNavigate`. Changing any filter goes back to page 1.
3. Show 4 books per page, with **Previous** and **Next** links. Hide Previous on page 1, and Next on the last page.
4. Sort without mutating the array ([chapter 11](../11-updating-objects-and-arrays/notes.md)).
5. Add a **Clear filters** link that goes back to a plain `/books`.
6. Visit each of these by typing it into the address bar, and write down what the page shows: `?page=banana`, `?genre=poetry`, `?page=0`, `?sort=cheapest`, and `?q=1984`. One of them may surprise you.
7. Remove `.catch(1)` from `page` and visit `?page=banana` again. Then put it back, remove `.default(1)` instead, and read the errors in VS Code. Put it back again.
8. The URL fills up with every default (`?q=&genre=all&sort=title&page=1`). Tidy it so that plain `/books` stays plain.

<details>
<summary>Hint 1</summary>

For step 2, TypeScript won't let you pass `event.target.value` straight into `genre` or `sort`. Read the error: a `<select>` gives you *any* string, and not every string is a genre. You already have something that turns an unknown string into a checked value. Look at `bookSearchSchema.shape`.

</details>

<details>
<summary>Hint 2</summary>

For step 4, a lookup object from sort key to compare function keeps this tidy, like chapter 29's stretch goal 2. `satisfies` from [chapter 25](../25-typescript-patterns/notes.md) can check you've covered every key. `z.infer<typeof bookSearchSchema>["sort"]` gives you the union of sort keys.

</details>

<details>
<summary>Hint 3</summary>

For step 6, the surprise is `?q=1984`. TanStack Router reads search values like JSON, so `1984` arrives as a *number*, and `z.string()` rejects it. When the router writes a number-like string itself, it adds quotes (`?q=%221984%22`) so it survives the round trip. Only hand-typed URLs hit this. Look up `z.coerce` in [chapter 32](../32-zod/notes.md) if you'd like to fix it.

</details>

<details>
<summary>Hint 4</summary>

For step 8, the router has a helper called `stripSearchParams`. It goes in the route's `search: { middlewares: [...] }` option, and you give it an object of your default values.

</details>

---

## Exercise 4 (Medium): Loaders and a slow server

Real catalogues live on a server. Time to fake one and load the data properly.

1. Create `src/api.ts` from the notes, with `fetchBooks()` and `fetchBook(id)`. Add a `console.log` inside each, so you can see when they run.
2. Give **both** book routes a loader. The components read with `Route.useLoaderData()`. Neither should import `books` directly any more.
3. The book loader throws `notFound()` for a missing book, and the route shows its own `notFoundComponent`.
4. Add a `pendingComponent` to both routes. Set the fake delay to 500ms, then 2000ms. When does the pending message appear, and what's on screen before it? Write down your answers.
5. Add an `errorComponent` with a **Try again** button. Make the API fail on purpose (for example, throw an `Error` whenever a flag you control is `true`). Check that the error shows, the header still works, and Try again recovers once you switch the flag off.
6. Turn on `defaultPreload: "intent"` in `createRouter`. Hover over a book link without clicking, and watch the Console.
7. Go list → book → back to the list. Does the list appear instantly? Does `fetchBooks` run again?
8. In a comment, compare this with chapter 18's fetch-in-an-effect. Write down three differences you noticed: in the code you wrote, and in how it feels to use.

<details>
<summary>Hint 1</summary>

For step 4, remember the router's two timing rules from the notes: it waits before showing a pending screen, and once it shows one, it keeps it for a minimum time. Also try it both ways: clicking a link from another page, and refreshing on the book's URL.

</details>

<details>
<summary>Hint 2</summary>

For step 5, a loader that throws is a render-time failure as far as the route is concerned, so the route's `errorComponent` catches it. Nothing above the route breaks. `useRouter()` gives you the router, and the notes show which method runs the loaders again.

</details>

<details>
<summary>Hint 3</summary>

For step 7, the router has its own small cache. By default it shows what it has at once, then quietly reloads in the background. The Console tells you whether that background reload happened.

</details>

---

## Exercise 5 (Challenge): Pick one, A or B

Both combine this chapter with earlier ones. Do one, or both if you're enjoying it.

**A. Move the bookstore across.** Copy your finished chapter 29 `bookstore` folder to `bookstore-tsr`, run `npm uninstall react-router`, and install TanStack Router and the plugin. Then rebuild its routing:

1. `__root.tsx` holds the layout: shop name, nav, and the cart indicator from `useCart()`. `<CartProvider>` still wraps everything in `main.tsx`.
2. The book list keeps its filters in the URL, now with `validateSearch`.
3. The book page uses a loader and `notFound()`. The cart and checkout pages work as before, and a nonsense URL shows your 404.
4. Remove your hand-written `lazy()` for checkout. Run `npm run build` and confirm checkout is still its own chunk.
5. Get `npx tsc -b` clean. Keep a list of every broken link or wrong param TypeScript found for you along the way.
6. Get your chapter 28 tests passing again. `MemoryRouter` is gone, so `renderWithProviders` needs a new way to start at a given URL.

**B. Add TanStack Query.** In `router-practice`:

1. Pass a `QueryClient` through the router context with `createRootRouteWithContext`.
2. Both loaders call `ensureQueryData`. Use `booksQueryOptions` for the list and a `bookQueryOptions(id)` function for one book, with the `["books"]` and `["books", id]` keys from [chapter 31](../31-tanstack-query/notes.md). The components read with `useSuspenseQuery`.
3. A missing book still shows the not-found page.
4. Add the TanStack Query devtools next to the router's. Go list → book → back, and use the devtools to prove the list came from the cache.
5. Set `staleTime: 30_000` on the list query and repeat step 4. What changed in the Console and in the devtools? Compare with what you saw in exercise 4, step 7.

<details>
<summary>Hint 1</summary>

For A, step 1: the root layout reads the cart, so `CartProvider` has to sit *outside* `RouterProvider` in `main.tsx`, the same way it sat outside the routes in chapter 29.

</details>

<details>
<summary>Hint 2</summary>

For A, step 6: TanStack Router has its own `createMemoryHistory({ initialEntries: [...] })`. Your test helper can create a router with it and render `<RouterProvider>`. Remember that loaders are async, so use `findBy...` queries, not `getBy...`, for what the page shows.

</details>

<details>
<summary>Hint 3</summary>

For B, step 3: `fetchBook` answers `null` for a missing book, so the query caches `null` too. The loader can check what `ensureQueryData` returns and throw `notFound()`. The component still sees `Book | null` in its type, because TypeScript can't see that the loader already checked. Decide how you want to handle that, and write down why.

</details>

<details>
<summary>Hint 4</summary>

For B, step 4: the Query devtools come from `@tanstack/react-query-devtools`, as in chapter 31. Watch the `["books"]` query's status as you move between pages, and keep your `console.log` in `fetchBooks` so you can see whether a real fetch happened.

</details>
