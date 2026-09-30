# 31 TanStack Query

## What is it?

**TanStack Query** is a library that fetches data from a server, keeps a copy close by, and keeps that copy fresh. You tell it *what* data you want and *how* to get it. It handles the rest: loading, errors, cancelling, caching, and refetching.

```tsx
const { data, isPending, isError } = useQuery({
  queryKey: ["books"], // the name of this data
  queryFn: getBooks,   // how to get it (from chapter 30)
});
```

This chapter uses **TanStack Query v5**. It used to be called **React Query**, and you'll still hear that name a lot. It was renamed when it grew versions for other frameworks (the React one is `@tanstack/react-query`). It changes faster than React does, and v5 renamed several things from v4. This chapter points out the renames as they come up.

Install it inside `playground`, along with its **devtools**, a panel that shows you what it's doing:

```
npm install @tanstack/react-query @tanstack/react-query-devtools
```

## Why does it matter?

[Chapter 18](../18-fetching-data/notes.md) made a promise: a library would do everything in that chapter for you. Here's what you wrote by hand in chapters 18 and 21:

- Three pieces of state for every request: loading, error, and data.
- The `ignore` flag or an `AbortController`, so an old answer can't overwrite a new one.
- A dependency array, so the request runs again when the search changes.
- One hand-written hook per kind of data (`useRecipeSearch`, `useRecipeDetails`).

And here's what you **never had**, because it's hard to write by hand:

- **Caching.** A **cache** is a saved copy kept close by, so you don't have to ask again. Go to another page and back, and the data is already there. No spinner.
- **No duplicate requests.** Two components want the reading list. One request, shared.
- **Background refreshing.** Old data stays on screen while fresh data loads quietly.
- **Retries.** A request that fails once gets tried again.
- **Fresh data after a change.** In chapter 30's exercise 3 you reloaded the list by hand after every change. Here it's one line.

**A new kind of state: server state.** Your reading list lives in `db.json`, on the server. What your component holds is only a **copy**. Someone else (another tab, a colleague, you editing the file) can change the original, and your copy won't know. That's **server state: a copy of data that really lives somewhere else, and can go out of date.**

That's very different from a cart or a theme setting. Your app *owns* those. Nobody else can change them behind your back. Server state needs its own tools: a cache, rules for when a copy is too old, and a way to say "this copy is out of date now". `useState` has none of those. TanStack Query is built around them.

[Chapter 29](../29-project-online-bookstore/notes.md) gave state three homes. Level 4 adds a fourth:

| Kind | Example | Best home |
|---|---|---|
| Local UI state | Is this menu open? Half-typed text | `useState` |
| URL state | Filters, search text, which item | The router's search params and path params |
| Shared client state | Cart, theme, "compact view" setting | Context, or Zustand / Redux Toolkit ([34](../34-zustand/notes.md), [35](../35-redux-toolkit/notes.md)) |
| **Server state** | The list of books on the server | **TanStack Query** |

## Real-world example

Think of your **fridge**. It's a cache of the supermarket.

| Your fridge | TanStack Query |
|---|---|
| The supermarket has the real food | The server has the real data |
| Your fridge holds a copy of some of it | The cache holds a copy of some data |
| Milk bought today counts as fresh for a while | `staleTime`: how long data counts as fresh |
| Bread from a few days ago is still fine, but you pick up a fresh loaf next time you're out | Stale data is still shown, and refetched in the background |
| Something nobody has touched for ages gets thrown out | `gcTime`: unused data is thrown away after a while |
| A note on the fridge: "used the milk, buy fresh" | `invalidateQueries`: "this copy is out of date now" |
| Two flatmates want milk. One trip, not two | Two components, same data. One request |
| The shopping list says "milk", not "the carton on the left" | The query key names the data you want |

## How it works

### Setting up: one `QueryClient` for the whole app

The **`QueryClient`** is the cache, plus the rules for it. You make exactly one, and hand it to your whole app with a provider, like [chapter 22](../22-context/notes.md)'s Context. In `main.tsx`:

```tsx
// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "./index.css";
import App from "./App.tsx";

// Made once, outside any component, so it lives as long as the app does
const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
);
```

`ReactQueryDevtools` adds a small floating button in the corner of the page. Click it to open the panel. It's only included while you develop, not in the app you ship.

### Your first query: chapter 18's search, again

In chapter 30's exercise 5 you wrote `searchRecipes` in `src/api/meals.ts`. If you skipped it, here's a version:

```ts
// src/api/meals.ts
import { mealDb } from "./client.ts";

export type Recipe = { id: string; name: string; thumbnail: string };

type MealDbSearchResponse = {
  meals: Array<{ idMeal: string; strMeal: string; strMealThumb: string }> | null;
};

export async function searchRecipes(query: string, signal?: AbortSignal): Promise<Recipe[]> {
  const response = await mealDb.get<MealDbSearchResponse>("/search.php", {
    params: { s: query },
    signal,
  });
  return (response.data.meals ?? []).map((meal) => ({
    id: meal.idMeal,
    name: meal.strMeal,
    thumbnail: meal.strMealThumb,
  }));
}
```

Now chapter 18's `RecipeSearch`, with TanStack Query:

```tsx
// src/ch31/RecipeSearch.tsx
import { useQuery } from "@tanstack/react-query";
import { searchRecipes } from "../api/meals.ts";

function RecipeSearch({ query }: { query: string }) {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["recipes", query],
    queryFn: ({ signal }) => searchRecipes(query, signal),
    enabled: query !== "",
  });

  if (query === "") return <p>Type something to search.</p>;
  if (isPending) return <p>Searching...</p>;
  if (isError) return <p>Something went wrong: {error.message}</p>;
  if (data.length === 0) return <p>No recipes found.</p>;

  return (
    <ul>
      {data.map((recipe) => (
        <li key={recipe.id}>{recipe.name}</li>
      ))}
    </ul>
  );
}

export default RecipeSearch;
```

Put it next to chapter 18's version. No `useState`. No `useEffect`. No `ignore` flag, no `finally`, no `setIsLoading(false)`. The three options do all of it:

- **`queryKey`** names the data: "recipes, for this search". It works like a dependency array. When `query` changes, the key changes, and TanStack Query fetches again.
- **`queryFn`** is how to get the data. It must return a promise, and **throw** if something goes wrong. Axios already throws on a 404 or a 500, so there's nothing extra to write.
- **`enabled: query !== ""`** means "don't run this at all for an empty search".

Try it: search `chicken`, then `beef`, then `chicken` again. The third search shows its results **instantly**, because the answer was still in the cache. (A quiet request still checks them in the background. More on that below.)

### Pending, error, success (and fetching)

`useQuery` gives you a handful of values:

| Value | What it means |
|---|---|
| `isPending` | There's no data yet |
| `isError` and `error` | The last try failed (after retries). `error` is an `Error` |
| `data` | The data. `undefined` until it arrives |
| `isFetching` | A request is running right now, including quiet background refreshes |
| `isLoading` | `isPending` **and** `isFetching`: the very first load is on its way |

TypeScript follows your checks. After `if (isPending) return` and `if (isError) return`, it knows `data` is a `Recipe[]`, so you never need a `!`.

`isFetching` is for refreshes. Data can be on screen *and* updating at the same time: `{isFetching && <small>Updating...</small>}`.

**Watch out for this one.** In v4, "no data yet" was called `isLoading`. In v5 it's `isPending`. v5 still has `isLoading`, but it means something narrower: pending *and* actually fetching. The difference shows up with `enabled: false`. A disabled query has no data, so `isPending` is `true`, but it isn't fetching, so it stays that way **forever**. That's why `RecipeSearch` checks `query === ""` *before* `isPending`. Swap those two lines and an empty search box says "Searching..." until the end of time.

**A tip for search boxes.** While a new search loads, the key is new, so there's no data for it yet, and the list vanishes. To keep the old results on screen until the new ones arrive, add `placeholderData: keepPreviousData` (imported from `@tanstack/react-query`). In v4 this was `keepPreviousData: true`.

### Query keys: the name of your data

A query key is an array that names a piece of data. Same key, same data, shared by everyone who asks.

```ts
["books"]                       // the whole reading list
["books", "3"]                  // one book
["books", { status: "want" }]   // a filtered list
["recipes", "chicken"]          // a search
```

The rules:

- **Put every value your `queryFn` uses into the key.** If the function uses `query`, the key needs `query`. Leave it out, and a new search shows the *old* search's cached results, because as far as the cache knows, you asked for the same thing.
- **Go from general to specific.** `["books"]` first, then an id or a filter. This lets you refer to a whole family at once: `["books"]` matches every key that *starts with* `"books"`. You'll use that for invalidating.
- **Keys are compared by what's in them.** A fresh `{ status: "want" }` object on every render is fine here. (Remember from [chapter 17](../17-effects/notes.md) that an object in a `useEffect` dependency array reruns the effect every render? Keys don't have that problem.)

### Cancelling stale requests with `signal`

TanStack Query calls your `queryFn` with a **context object**, a bag of useful things. One of them is `signal`, an `AbortSignal` just like chapter 18's. That's why `RecipeSearch` writes `({ signal }) => searchRecipes(query, signal)`: it passes the signal on to Axios.

Now, if you type a new search before the old one answers, or the component disappears, TanStack Query cancels the old request. You'll see `(canceled)` in the Network tab. In development, Strict Mode's double mount ([chapter 17](../17-effects/notes.md)) can sometimes show one extra cancelled request on the first load. That's expected.

Even without `signal`, you can't get chapter 17's race condition. Each answer is stored under its *own* key, and the screen shows the key you're asking for now. That's the `ignore` flag's job, done for you. Passing `signal` just stops the wasted work.

### Seeing the cache: two components, one request

Here are two components that both want the reading list:

```tsx
import { useQuery } from "@tanstack/react-query";
import { getBooks } from "../api/books.ts";

function BookCount() {
  const { data } = useQuery({ queryKey: ["books"], queryFn: getBooks });
  return <p>{data ? `${data.length} books on your list` : "Counting..."}</p>;
}

function BookTitles() {
  const { data } = useQuery({ queryKey: ["books"], queryFn: getBooks });
  return <ul>{data?.map((book) => <li key={book.id}>{book.title}</li>)}</ul>;
}
```

Render both, with `npm run api` running. The Network tab shows **one** `GET /books`, not two. Open the devtools panel: there's one query, `["books"]`, with a small number showing how many components are using it. Click it to see its data and its state: fresh, fetching, stale, or inactive.

Now hide both components (a toggle button works) and show them again. The data appears **instantly** from the cache, and a quiet refetch checks it's still right.

(Repeating the key and the function in two places is asking for a typo. You'll fix that below with `queryOptions`.)

### How long is data fresh? `staleTime` and `gcTime`

| Option | Default | What it means |
|---|---|---|
| `staleTime` | `0` | How long data counts as fresh. Stale data is still shown, but gets refetched when a chance comes up |
| `gcTime` | 5 minutes | How long data that no component is using stays in the cache before it's thrown away |

(`gc` stands for **garbage collection**: clearing out things nobody uses. In v4 this option was called `cacheTime`.)

With `staleTime: 0`, data is stale the moment it arrives. That sounds wasteful, but it's the safe choice: you always show *something* straight away, and check with the server soon after. Set it per query, or for the whole app:

```ts
// One query: TheMealDB's categories hardly ever change
// (getCategories is a small function like chapter 21's)
useQuery({ queryKey: ["categories"], queryFn: getCategories, staleTime: Infinity });

// Every query in the app
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30 * 1000 }, // 30 seconds
  },
});
```

Pick it by asking: **how often does this data really change, and how bad is it to show an old copy for a bit?**

### Defaults that surprise beginners

- **Refetch on window focus.** Switch to another window and back, and stale queries refetch. You'll see new requests appear in the Network tab "for no reason". It's there so that someone coming back to a tab after lunch sees fresh data. Turn it off with `refetchOnWindowFocus: false`, or make data stay fresh longer with `staleTime`.
- **Refetch on mount and on reconnect.** A component that mounts, or a laptop that gets its Wi-Fi back, refetches stale queries too.
- **Three retries.** A failed query is tried again 3 times, waiting a bit longer each time (about 1, 2, then 4 seconds). So an error message takes around **7 seconds** to appear. Change it with `retry: 1` or `retry: false`. `retry` can also be a function that gets the error, so you can skip retrying a 404, which will never succeed.

### Changing data: `useMutation`

A **mutation** is a request that *changes* something on the server: POST, PATCH, or DELETE. Queries read, and run by themselves. Mutations write, and only run when you say so.

```tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addBook } from "../api/books.ts";

function AddBookButton() {
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: addBook,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["books"] }),
  });

  return (
    <button
      disabled={addMutation.isPending}
      onClick={() =>
        addMutation.mutate({ title: "Project Hail Mary", author: "Andy Weir", pages: 476, status: "want" })
      }
    >
      {addMutation.isPending ? "Adding..." : "Add a book"}
    </button>
  );
}
```

- **`useQueryClient()`** gives you the same `QueryClient` you made in `main.tsx`.
- **`mutate(variables)`** runs `mutationFn` with those variables. It doesn't return anything. Errors end up in `addMutation.isError` and `addMutation.error`.
- **`mutateAsync(variables)`** does the same, but returns a promise you can `await`, to get the saved book back. Then catching errors is your job.
- **`isPending`** is `true` while the mutation runs (in v4 this was `isLoading` too).
- **`invalidateQueries({ queryKey: ["books"] })`** is the note on the fridge. It marks every query whose key starts with `"books"` as out of date, and refetches the ones on screen. Every component showing books updates. Nobody had to remember to reload anything.

Returning the promise from `onSuccess`, like above, keeps `isPending` `true` until the fresh list has arrived. So the button doesn't say "Add a book" again before the new book is on screen.

**One argument only.** `mutationFn` receives a single value. `updateBook` needs two, so wrap them in an object:

```ts
mutationFn: ({ id, changes }: { id: string; changes: Partial<NewBook> }) => updateBook(id, changes),
// later: statusMutation.mutate({ id: book.id, changes: { status: "finished" } });
```

In [chapter 33](../33-react-hook-form/notes.md), a real "Add a book" form will submit through a mutation like this one.

### Showing the change straight away: optimistic updates

Chat apps show your message the moment you press Send, with a grey tick, before the server has said yes. That's an **optimistic update**: show the change now, and fix things up if it fails. It makes an app feel instant. It's worth it when the server nearly always says yes. You'll use it in the [task board project](../37-project-task-board/notes.md) for moving tasks between columns.

**The simple way: show the variables while it's pending.** The mutation remembers what you sent in `variables`:

```tsx
const addMutation = useMutation({
  mutationFn: addBook,
  onSettled: () => queryClient.invalidateQueries({ queryKey: ["books"] }),
});

// inside the list's JSX:
{addMutation.isPending && <li style={{ opacity: 0.5 }}>{addMutation.variables.title}</li>}
```

`onSettled` runs after success *or* failure. The grey row shows until the real list comes back. This only changes one spot on screen, which is often all you need.

**The cache way: change the cached data directly.** When the change must show up everywhere, edit the cache itself. Here's an optimistic delete:

```tsx
const deleteMutation = useMutation({
  mutationFn: deleteBook,
  onMutate: async (id) => {
    await queryClient.cancelQueries({ queryKey: ["books"] });     // 1. stop refetches overwriting us
    const previous = queryClient.getQueryData<Book[]>(["books"]); // 2. save a snapshot
    queryClient.setQueryData<Book[]>(["books"], (old) =>         // 3. change the cache now
      old?.filter((book) => book.id !== id)
    );
    return { previous };                                          // 4. hand the snapshot on
  },
  onError: (_error, _id, snapshot) => {
    queryClient.setQueryData(["books"], snapshot?.previous);      // 5. it failed: put it back
  },
  onSettled: () => queryClient.invalidateQueries({ queryKey: ["books"] }), // 6. check with the server
});
```

`onMutate` runs **before** the request is sent. The comments tell the story, but two steps need a word more. **Cancel first** (step 1), because a refetch already on its way would land its old answer on top of your change. **Hand the snapshot on** (step 4), because whatever `onMutate` returns is passed to `onError`, which uses it to put things back.

Try it: stop `npm run api`, then delete a book. It vanishes, then comes back when the request fails. (The list's own refetch fails too while the server is off, so start it again afterwards.)

**About the names.** Recent v5 docs call that third `onError` argument `onMutateResult`, and add a fourth argument with the client in it. Older v5 docs and tutorials call the third one `context`. It's the same value either way, in the same position, so the code above works with both.

### Reusing queries: `queryOptions` and custom hooks

Writing `{ queryKey: ["books"], queryFn: getBooks }` in every component invites typos. The **`queryOptions`** helper lets you write each query once:

```ts
// src/api/bookQueries.ts
import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addBook, getBook, getBooks } from "./books.ts";

export const booksQuery = queryOptions({
  queryKey: ["books"],
  queryFn: getBooks,
});

export function bookQuery(id: string) {
  return queryOptions({
    queryKey: ["books", id],
    queryFn: () => getBook(id),
  });
}

export function useBooks() {
  return useQuery(booksQuery);
}

export function useBook(id: string) {
  return useQuery(bookQuery(id));
}

export function useAddBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addBook,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: booksQuery.queryKey }),
  });
}
```

At runtime, `queryOptions` just hands back what you gave it. The win is in the types: its key remembers what data it holds. `queryClient.getQueryData(booksQuery.queryKey)` is a `Book[] | undefined` without you writing `<Book[]>`.

The hooks are [chapter 20](../20-custom-hooks/notes.md)'s idea: hide the details behind a clear name. A component just says `const { data, isPending } = useBooks();`. Compare that with chapter 21's hand-written `useRecipeSearch`, around thirty lines. This one is three, and does more.

### Suspense mode: `useSuspenseQuery`

[Chapter 26](../26-error-boundaries-and-suspense/notes.md) said `<Suspense>` only works with things that opt in, and TanStack Query is one of them:

```tsx
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useSuspenseQuery } from "@tanstack/react-query";
import { booksQuery } from "../api/bookQueries.ts";

function BookList() {
  const { data } = useSuspenseQuery(booksQuery); // data is always there
  return <ul>{data.map((book) => <li key={book.id}>{book.title}</li>)}</ul>;
}

function ReadingListPage() {
  return (
    <ErrorBoundary fallback={<p>Couldn't load your books.</p>}>
      <Suspense fallback={<p>Loading your books...</p>}>
        <BookList />
      </Suspense>
    </ErrorBoundary>
  );
}
```

`BookList` has no loading or error checks at all. While the data loads, the nearest `<Suspense>` shows its fallback. If it fails, the error goes to the nearest error boundary. Same order as chapter 26: **boundary outside, Suspense inside**.

Two things to know. Suspense queries have no `enabled` option, since they always need their data. And if your fallback has a "Try again" button, wrap it in TanStack Query's `QueryErrorResetBoundary` so the query really retries (see the docs when you need it). Plain `useQuery` is still the everyday choice. Reach for suspense when you want a parent to decide the loading screen for a whole section.

### Testing components that use queries

A component using `useQuery` needs a `QueryClientProvider` in tests too, just like context needed its provider in [chapter 28](../28-testing/notes.md). Two rules:

- **A fresh `QueryClient` for every test.** Otherwise one test's cached data leaks into the next.
- **`retry: false`.** Otherwise a failure test waits through three retries and times out.

```tsx
// src/test-utils.tsx
import type { ReactNode } from "react";
import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function renderWithProviders(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}
```

(If your components also use the router, put chapter 28's `MemoryRouter` in there too.)

Chapter 28 stubbed `fetch`. Axios doesn't use `fetch` by default, so stub your own API file instead. `vi.mock` swaps a whole module for fake functions:

```tsx
// src/ch31/BookList.test.tsx
import { expect, test, vi } from "vitest";
import { screen } from "@testing-library/react";
import { getBooks } from "../api/books.ts";
import { renderWithProviders } from "../test-utils.tsx";
import { BookList } from "./BookList.tsx"; // a list that calls useBooks()

vi.mock("../api/books.ts"); // every function in that file becomes a vi.fn()

test("shows the books from the API", async () => {
  vi.mocked(getBooks).mockResolvedValue([
    { id: "1", title: "Dune", author: "Frank Herbert", pages: 412, status: "want" },
  ]);

  renderWithProviders(<BookList />);

  expect(await screen.findByText("Dune")).toBeInTheDocument();
});
```

`vi.mocked(getBooks)` is the same function, typed as a mock, so TypeScript checks your fake data is a real `Book[]`. The test never touches the network, and json-server doesn't need to be running.

### When you don't need it

- **One request, on one page, for data that never changes.** Chapter 18's pattern, or chapter 20's `useFetch`, is fine.
- **Data that doesn't come from a server.** A cart, a theme, an open menu: that's client state. TanStack Query isn't a general store. Use `useState`, Context, or [Zustand](../34-zustand/notes.md).
- **A framework that fetches on the server.** In Next.js ([chapter 39](../39-nextjs-and-server-components/notes.md)), many pages get their data before they reach the browser, and need no client-side fetching library at all.

Other libraries share the same idea. You may meet **SWR**, which is similar. Redux has its own version, RTK Query, in [chapter 35](../35-redux-toolkit/notes.md).

## Common mistakes

**1. A value missing from the query key**

```ts
useQuery({ queryKey: ["recipes"], queryFn: () => searchRecipes(query) }); // ❌ every search shares one cache entry
useQuery({ queryKey: ["recipes", query], queryFn: () => searchRecipes(query) }); // ✅
```

If the function uses it, the key needs it. The ESLint plugin `@tanstack/eslint-plugin-query` has a rule that catches this for you.

**2. Making the `QueryClient` inside a component**

```tsx
function App() {
  const queryClient = new QueryClient(); // ❌ a brand-new, empty cache on every render
}
```

Make it once, outside any component, as in `main.tsx` above.

**3. Forgetting the provider**

```
Error: No QueryClient set, use QueryClientProvider to set one
```

Some component called `useQuery` with no `QueryClientProvider` above it. In the app, check `main.tsx`. In tests, use `renderWithProviders`.

**4. Copying `data` into `useState`**

```tsx
const { data } = useBooks();
const [books, setBooks] = useState(data); // ❌ a second copy that never refreshes
```

Your `useState` copy is frozen at the first value, often `undefined`. Use `data` directly, and work out anything else from it during render ([chapter 08](../08-state/notes.md)).

**5. Forgetting to invalidate after a mutation**

The server changed, but the screen didn't. Then you switch windows, a focus refetch runs, and it "fixes itself", which is very confusing. Invalidate the right key in `onSuccess` or `onSettled`.

**6. Expecting `mutate` to return the saved data**

```ts
const saved = addMutation.mutate(newBook); // ❌ saved is undefined
```

Use `onSuccess`, or `await addMutation.mutateAsync(newBook)` inside a `try`/`catch`.

**7. A `queryFn` that doesn't throw on HTTP errors**

With plain `fetch` and no `response.ok` check, a 404 page counts as success, and gets cached as your data. Axios already throws. If you use `fetch`, check `response.ok` and throw, like chapter 18.

**8. Checking `isPending` for a disabled query**

With `enabled: false`, `isPending` stays `true` forever, so the page says "Loading..." for good. Handle the "not asked yet" case first, as `RecipeSearch` does.

**9. Following a v4 tutorial**

Lots of tutorials online are for v4 or older. The usual differences:

| Old (v4 and earlier) | v5 |
|---|---|
| `react-query` package | `@tanstack/react-query` |
| `useQuery(["books"], getBooks)` | `useQuery({ queryKey: ["books"], queryFn: getBooks })` |
| `isLoading` for "no data yet" | `isPending` |
| `cacheTime` | `gcTime` |
| `keepPreviousData: true` | `placeholderData: keepPreviousData` |
| `onSuccess` / `onError` on `useQuery` | Removed from queries (mutations still have them) |

## Quick recap

- **Server state** is a copy of data that really lives somewhere else, and can go out of date. It needs caching and refetching, which is what TanStack Query does.
- Make **one `QueryClient`** outside your components, and wrap the app in `QueryClientProvider`. Use the devtools to see the cache.
- `useQuery({ queryKey, queryFn })` replaces chapter 18's three states, the effect, and the `ignore` flag. Pass `signal` to Axios to cancel stale requests.
- **The query key names the data.** Put every value the `queryFn` uses into it. Keys go from general to specific: `["books"]`, then `["books", id]`.
- Defaults: `staleTime` 0, `gcTime` 5 minutes, refetch on window focus, 3 retries. Change them when they don't fit.
- `useMutation` changes data. **Invalidate** the matching key afterwards, and every screen updates.
- **Optimistic updates** show a change before the server confirms it: with `variables` for one spot, or with `onMutate` and a rollback for the whole cache.
- Wrap queries in `queryOptions` and custom hooks like `useBooks()`. In tests, use a fresh `QueryClient` with `retry: false`.

---

**Next:** try the [exercises](exercises.md), then move on to [32 Zod](../32-zod/notes.md).
