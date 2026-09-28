# 24 React Router

## What is it?

**React Router** maps URLs to components, so one React app can have many pages:

```tsx
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/books" element={<BookList />} />
  <Route path="/books/:id" element={<BookDetails />} />
</Routes>
```

Visit `/books/42` and React Router renders `<BookDetails />`, with `42` available to it. The browser never reloads — React just swaps what's on screen — but the URL, the back button, and bookmarks all work exactly as people expect.

This course uses **React Router v7**. The package is called `react-router`.

## Why does it matter?

Every app you've built so far has been one screen. Real apps aren't. And the moment you have more than one screen, you could try this:

```tsx
const [page, setPage] = useState<"home" | "books" | "cart">("home");

{page === "home" && <Home />}
{page === "books" && <BookList />}
```

It works — and it's broken in ways that matter:

- **The URL never changes.** Every page is `localhost:5173`. You can't send someone a link to a specific book.
- **The back button leaves your app.** Browse five pages, press back, and you're on whatever site you were on before. This is the one users notice and hate.
- **Refreshing loses your place.** You're always back at the start.
- **Nothing can be bookmarked,** and search engines see a single page.

A URL isn't decoration — it's the address of a piece of your app, and users expect it to behave like one. React Router's real job is keeping your components and the browser's address bar in agreement, in both directions.

## Real-world example

Think about a **hotel**.

| Hotel | React Router |
|---|---|
| Room numbers on the doors | URL paths: `/books/42` |
| "Room 214, third floor, turn left" | The route table: which path shows which component |
| Reception directing you | The `<Routes>` block |
| Walking there yourself | Clicking a `<Link>` |
| Every room reachable directly from outside | Any URL can be opened, shared, or bookmarked |
| All rooms share the same lobby and lift | Nested routes sharing a layout |
| "Room 999 doesn't exist" | The `*` catch-all route |

The thing that makes a hotel usable isn't that rooms exist — it's that every one has an address you can write down and come back to.

## How it works

### Setting it up

```
npm install react-router
```

> **The package name changed.** For years this was `react-router-dom`, and that's what nearly every existing tutorial, Stack Overflow answer and codebase says. In **v7**, it's just `react-router` — `react-router-dom` still exists as a compatibility shim, but new projects install and import from `react-router`. If you copy a snippet importing from `react-router-dom`, change the import; everything else usually works unchanged.

Wrap your app once, in `main.tsx`:

```tsx
import { BrowserRouter } from "react-router";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
```

`BrowserRouter` is what watches the real URL and tells everything inside it what's going on. Without it, every other piece in this chapter throws.

### The route table

```tsx
import { Routes, Route } from "react-router";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/books" element={<BookList />} />
      <Route path="/about" element={<About />} />
    </Routes>
  );
}
```

`<Routes>` looks at the current URL, picks the **one** `<Route>` that matches best, and renders its `element`. Note that `element` takes actual JSX — `<Home />`, not `Home` — which means you can pass props to a page component right there if you need to.

### Linking between pages

This is the part people get wrong first, so it's worth being blunt about:

```tsx
import { Link } from "react-router";

<a href="/books">Books</a>        // ❌ full page reload — your app restarts from scratch
<Link to="/books">Books</Link>    // ✅ React swaps the component, instantly
```

A plain `<a>` tells the **browser** to go and fetch a new document. Everything your app was holding — state, context, fetched data — is destroyed and rebuilt. It looks like it works (you do end up on the right page), but there's a visible flash and you've thrown away the entire point of a single-page app.

`<Link>` renders a real `<a>` underneath, so right-click → open in new tab and all the other things people expect from links still work. It just intercepts the ordinary click.

**Use a real `<a>` only for links leaving your app** — an external site, a file download.

### `NavLink`, for navigation that knows where you are

`NavLink` is `Link` plus "am I the current page?", which is exactly what a nav bar needs:

```tsx
import { NavLink } from "react-router";

<NavLink
  to="/books"
  className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
>
  Books
</NavLink>
```

`className` can be a **function** here, receiving `{ isActive }`. Same for `style`, and for `children` if you want the content itself to change.

### URL parameters

A segment starting with `:` is a wildcard that captures whatever's there:

```tsx
<Route path="/books/:id" element={<BookDetails />} />
```

`/books/42` and `/books/hobbit` both match, and the captured piece is available inside:

```tsx
import { useParams } from "react-router";

function BookDetails() {
  const { id } = useParams();
  // id: string | undefined
}
```

**Note the type.** `useParams` gives you `string | undefined` for every parameter, because React Router can't know at compile time which route rendered this component. TypeScript makes you deal with that, and it's right to:

```tsx
function BookDetails() {
  const { id } = useParams();

  if (id === undefined) {
    return <p>No book selected.</p>;
  }

  const { data: book, isLoading } = useBook(id);   // id is a string from here down
  // ...
}
```

You can name the expected params to get slightly better types — `useParams<{ id: string }>()` — but they're *still* possibly `undefined`, so the check stays. [Chapter 36](../36-tanstack-router/notes.md) covers a router that does make these genuinely type-safe.

### Navigating in code

Sometimes navigation follows an action rather than a click — after submitting a form, say:

```tsx
import { useNavigate } from "react-router";

function NewBookForm() {
  const navigate = useNavigate();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const created = await saveBook(form);
    navigate(`/books/${created.id}`);
  }
}
```

`navigate(-1)` goes back one entry, like the browser's back button. And `navigate("/login", { replace: true })` **replaces** the current history entry instead of adding one — use that after a redirect, so pressing back doesn't bounce the user straight back to the page they were redirected away from.

**Don't reach for `useNavigate` when a `<Link>` would do.** A link is a link: it's keyboard accessible, right-clickable, and shows its destination in the status bar. `useNavigate` is for navigation that genuinely can't be expressed as one.

### Nested routes and `<Outlet>`

Most apps have pieces that stay put across pages — a header, a nav bar, a footer. Nesting routes expresses that directly:

```tsx
<Routes>
  <Route path="/" element={<Layout />}>
    <Route index element={<Home />} />
    <Route path="books" element={<BookList />} />
    <Route path="books/:id" element={<BookDetails />} />
    <Route path="*" element={<NotFound />} />
  </Route>
</Routes>
```

```tsx
import { Outlet } from "react-router";

function Layout() {
  return (
    <div className="app">
      <Header />
      <main>
        <Outlet />      {/* the matched child route renders here */}
      </main>
      <Footer />
    </div>
  );
}
```

`<Outlet />` is the hole the child route's element drops into. `Layout` renders on every page; only the part inside `<Outlet>` changes. That means the header genuinely isn't re-created when you navigate — any state it holds survives, which a plain `<a>` could never manage.

Three details in that route table:

- **Child paths are relative.** `path="books"`, not `path="/books"`, because it's nested inside `path="/"`. A leading slash here is a common source of "why does nothing match?"
- **`index`** marks the child that shows when the parent's path matches exactly — `/` here.
- **`path="*"`** matches anything nothing else caught. That's your 404 page, and every app should have one.

### Query strings

For state that belongs in the URL but isn't a path — filters, search terms, page numbers:

```tsx
import { useSearchParams } from "react-router";

function BookList() {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "all";

  function handleQueryChange(next: string) {
    setSearchParams({ q: next, category });
  }
  // ...
}
```

This reads and writes like `useState`, but the value lives in the URL: `/books?q=dune&category=scifi`.

That's a genuine upgrade over `useState` for anything a user might want to **share or bookmark**. Think back to the [Recipe Finder](../21-project-recipe-finder/notes.md) — the search term and category filter were plain state, so you could never send someone a link to "chicken recipes in the Seafood category." Moving them into the URL fixes that with about the same amount of code.

`searchParams.get()` returns `string | null`, so `?? ""` gives you a sensible default.

### Route order doesn't matter (much)

Unlike older routing libraries, v7 ranks routes by **specificity**, not by the order you wrote them. `/books/new` wins over `/books/:id` for the URL `/books/new`, even if `:id` is listed first. That removes a whole category of confusing bugs — but it's still clearest to write more specific routes first, for human readers.

### A note on the bigger React Router

React Router v7 can do considerably more than this chapter shows: **loaders** that fetch a route's data before it renders, **actions** that handle form submissions, and a full framework mode with server rendering and file-based routing. That's a large topic, and it's most of what the library's own documentation is about now.

What this chapter teaches is called **declarative mode** — routes as components, data fetched with the hooks you already know from [chapter 18](../18-fetching-data/notes.md). It's completely legitimate, widely used, and the right place to start. If you later meet a codebase using `createBrowserRouter` with `loader` functions, you'll recognise the route shapes; the difference is *where the fetching happens*.

## Common mistakes

**1. Using `<a href>` instead of `<Link to>`**

```tsx
<a href="/books">Books</a>   // ❌ full page reload, all state lost
```

The single most common React Router mistake. You'll see a flash and your app restarts. Reserve `<a>` for external links.

**2. Forgetting `<BrowserRouter>`**

```
useNavigate() may be used only in the context of a <Router> component.
```

Every router hook and component needs `BrowserRouter` somewhere above it. Wrap the app once, in `main.tsx`.

**3. A leading slash on a nested route's path**

```tsx
<Route path="/" element={<Layout />}>
  <Route path="/books" element={<BookList />} />   // ⚠️ absolute, not relative
</Route>
```

Child paths are relative to the parent. Write `path="books"`.

**4. Assuming `useParams` gives you a string**

```tsx
const { id } = useParams();
fetchBook(id);
// ❌ Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
```

Always `string | undefined`. Check it, or narrow it, before using it.

**5. Forgetting the catch-all route**

With no `path="*"`, a typo'd URL renders **nothing at all** — a blank page with no error, which looks exactly like a crash. Always have a 404.

**6. `useNavigate` where a link belongs**

```tsx
<button onClick={() => navigate("/books")}>Books</button>   // ⚠️
```

Users can't middle-click it, can't see where it goes, and screen readers announce it as a button rather than a link. Use `<Link>` for navigation; use `navigate()` for "go there after something happened."

**7. Keeping shareable state out of the URL**

A search term in `useState` can't be linked to. If you'd want someone to be able to send that view to a colleague, it belongs in `useSearchParams`.

## Quick recap

- Install **`react-router`** (v7 — not `react-router-dom`, whatever older tutorials say), and wrap your app once in `<BrowserRouter>`.
- `<Routes>` picks the best-matching `<Route>` and renders its `element`. `path="*"` is your 404.
- **`<Link to>`, never `<a href>`**, for internal navigation — an `<a>` reloads the whole app. `NavLink` adds an `isActive` flag for nav bars.
- `:id` in a path captures a segment; read it with `useParams`, which always gives `string | undefined`.
- Nest routes to share a layout, and put `<Outlet />` where the child should render. Child paths are **relative**; `index` marks the default child.
- `useSearchParams` puts filters and search terms in the URL, so views can be shared and bookmarked.
- `useNavigate` is for navigating after an action. For anything a user clicks to go somewhere, use a real link.

---

**Next:** try the [exercises](exercises.md), then move on to [25 TypeScript Patterns for React](../25-typescript-patterns/notes.md).
