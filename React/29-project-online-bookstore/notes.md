# 29 Project: Online Bookstore

## What you'll build

A multi-page shop: browse books, filter them, open one, add it to a cart shared across every page, and check out — with tests covering the parts that matter.

```
┌──────────────────────────────────────────────────────┐
│  📚 Paper & Ink        Books   About      🛒 Cart (3) │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Search [ dune          ]  Genre [ Sci-Fi ▾ ]        │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │  [cover] │  │  [cover] │  │  [cover] │            │
│  │  Dune    │  │  Neuro-  │  │  Foundat-│            │
│  │  £9.99   │  │  mancer  │  │  ion     │            │
│  │ [Add]    │  │  £8.50   │  │  £7.25   │            │
│  └──────────┘  └──────────┘  └──────────┘            │
│                                                      │
│  Showing 3 of 12 books                               │
└──────────────────────────────────────────────────────┘
```

By the end, your app will have:

- real URLs for every page, with working back/forward and shareable links
- filters that live in the URL, so a filtered view can be sent to someone
- a cart any page can read and change, with no prop drilling
- all the cart's rules in one reducer, and a test suite proving them
- error boundaries so one broken book can't blank the site
- a handful of tests covering the flows that actually matter

This is the Level 3 project, and it uses the whole level:

| Chapter | Where you'll use it |
|---|---|
| [22 Context](../22-context/notes.md) | The cart, reachable from every page |
| [23 useReducer](../23-use-reducer/notes.md) | Every cart rule, in one place |
| [24 React Router](../24-react-router/notes.md) | Pages, layouts, book URLs, filters in the query string |
| [25 TypeScript Patterns](../25-typescript-patterns/notes.md) | A reusable `Button`, and a generic `List` |
| [26 Error Boundaries](../26-error-boundaries-and-suspense/notes.md) | Per-route boundaries, and a lazily-loaded checkout |
| [27 Performance](../27-performance/notes.md) | Profiling before optimising — and probably not optimising |
| [28 Testing](../28-testing/notes.md) | Reducer tests, and two or three real user flows |

**No API this time.** The book data is a local file in the starter, on purpose — [chapter 21](../21-project-recipe-finder/notes.md) already covered fetching thoroughly, and this project is about *structure*: routing, shared state, and tests. Adding a real API back in is a stretch goal.

## Getting started

1. In a terminal in this `React` folder: `npm create vite@latest`, answering as usual, naming it `bookstore`.
2. Copy this chapter's `starter/src/` over `bookstore/src/`.
3. Delete `bookstore/src/App.css` and `bookstore/src/assets/`.
4. `cd bookstore`, then install what this project needs:

   ```
   npm install react-router
   npm install -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
   ```

5. Set up Vitest exactly as in [chapter 28](../28-testing/notes.md) — the `test` block in `vite.config.ts`, and `src/test-setup.ts`.
6. `npm run dev` in one terminal, `npm test` in another, and `npx tsc -b` when you want a full check.

The starter gives you `books.ts` (12 books with covers, prices and genres), a finished `index.css`, and a stubbed `App.tsx`.

## The big idea: three kinds of state, three different homes

The to-do app had one kind of state. The Recipe Finder had two. This app has **three**, and the whole project gets easier once you can tell them apart:

| Kind | Example | Where it lives |
|---|---|---|
| **Local** | Is this dropdown open? What's half-typed? | `useState`, in the component |
| **URL** | Search text, genre filter, which book | `useSearchParams`, `useParams` |
| **Shared app state** | The cart | Context + reducer |

The mistake that makes this project painful is putting something in the wrong one — most often, putting the search filters in `useState` (so they can't be shared or bookmarked) or the cart in a prop (so it has to be drilled through every page).

A quick test for each: **Would someone want to send this in a link?** → URL. **Does a component three pages away need it?** → shared. **Neither?** → local.

## Milestone 1: Pages and layout

**Goal:** four real URLs, sharing a header.

Wrap `<App />` in `<BrowserRouter>` in `main.tsx`, then build the route table:

```tsx
<Routes>
  <Route path="/" element={<Layout />}>
    <Route index element={<HomePage />} />
    <Route path="books" element={<BooksPage />} />
    <Route path="books/:id" element={<BookPage />} />
    <Route path="cart" element={<CartPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Route>
</Routes>
```

`Layout` holds the header (shop name, nav links, a cart indicator) and an `<Outlet />`. Use `NavLink` for the nav so the current page is highlighted.

Make each page a stub with a heading for now.

**Check it:** all five URLs work when typed directly. Back and forward work. A nonsense URL shows your 404. Put a `useState` counter in the header temporarily and confirm it *doesn't* reset when you navigate — proving the layout isn't being rebuilt.

## Milestone 2: The book list, with filters in the URL

**Goal:** a browsable, filterable, **shareable** list.

`BooksPage` renders a grid of `BookCard`s from `books.ts`. Each card shows the cover, title, author, price, and an **Add to cart** button (not wired up yet). The whole card links to `/books/:id`.

Then the filters — a search box and a genre `<select>` — held in **`useSearchParams`**, not `useState`:

```tsx
const [searchParams, setSearchParams] = useSearchParams();
const query = searchParams.get("q") ?? "";
const genre = searchParams.get("genre") ?? "all";
```

Filtering is a derived value, computed during render:

```tsx
const visible = books.filter((book) => {
  const matchesQuery =
    book.title.toLowerCase().includes(query.toLowerCase()) ||
    book.author.toLowerCase().includes(query.toLowerCase());
  const matchesGenre = genre === "all" || book.genre === genre;
  return matchesQuery && matchesGenre;
});
```

Show `Showing 3 of 12 books`, and a proper empty state when nothing matches — with the filters still visible so people can undo what they did.

> **One decision worth making deliberately.** Every keystroke in the search box adds a history entry, so **back** steps through your typing one letter at a time. Use `setSearchParams(next, { replace: true })` for the search box to avoid that, and think about whether the genre dropdown should behave the same way. There's no single right answer; make the call and write down why.

**Check it:** filter to something specific, copy the URL, open it in a new tab. You should land on exactly that view.

## Milestone 3: The book page

**Goal:** one book, at its own URL.

`BookPage` reads the id with `useParams` and finds the book. Two cases to handle properly, and neither is optional:

```tsx
const { id } = useParams();
const book = books.find((b) => b.id === id);

if (!book) {
  return <NotFoundPage message="We couldn't find that book." />;
}
```

`useParams` gives `string | undefined`, and `find` gives `Book | undefined` — so no `!`, no `as string`. Show the cover, title, author, genre, price, description, an **Add to cart** button, and a link back to the list.

**Check it:** `/books/3` works when typed directly and after a refresh. `/books/999` shows your not-found message rather than crashing. The back link works from both a fresh load and after arriving from the list.

## Milestone 4: The cart reducer

**Goal:** every cart rule, in one pure function — and no UI yet.

This is the heart of the project, and it's deliberately built before anything renders it. Make `src/cart/cartReducer.ts`:

```ts
export type CartItem = {
  bookId: string;
  title: string;
  price: number;
  quantity: number;
};

export type CartState = {
  items: CartItem[];
  promoCode: string | null;
};

export type CartAction =
  | { type: "added"; book: Book }
  | { type: "removed"; bookId: string }
  | { type: "quantity_changed"; bookId: string; quantity: number }
  | { type: "promo_applied"; code: string }
  | { type: "cleared" };
```

The rules, all of them living in the reducer:

1. **`added`** for a book already in the cart increases its quantity rather than adding a second line.
2. **Quantity is capped at 10** per title.
3. **`quantity_changed`** to 0 or less removes the item entirely.
4. **`promo_applied`** accepts only `BOOKS10` (10% off). Anything else returns the **exact same state object** — no change at all.
5. **`cleared`** empties the items *and* clears the promo code.

Add the `never` exhaustiveness check from [chapter 23](../23-use-reducer/notes.md) to the `default` case.

**Now write the tests, before any UI exists.** `src/cart/cartReducer.test.ts`, one test per rule above, plus one proving the reducer never mutates its input. This is the single highest-value testing you'll do all project — pure function, no rendering, no mocking.

**Check it:** `npm test` passes, with at least six tests, and you haven't rendered a single thing yet.

## Milestone 5: The cart, everywhere

**Goal:** any page can read and change the cart, with no props.

Wire the reducer up through context, using **two contexts** ([chapter 23](../23-use-reducer/notes.md)):

```tsx
const CartStateContext = createContext<CartState | null>(null);
const CartDispatchContext = createContext<React.Dispatch<CartAction> | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);

  return (
    <CartStateContext value={state}>
      <CartDispatchContext value={dispatch}>{children}</CartDispatchContext>
    </CartStateContext>
  );
}
```

Plus a guard hook for each — `useCart()` and `useCartDispatch()` — that throw with a clear message when used outside the provider.

Wrap the app in `<CartProvider>` in `main.tsx`, inside `<BrowserRouter>`. Then:

- The header's cart indicator uses `useCart()` to show the total item count.
- Every **Add to cart** button uses `useCartDispatch()`.
- Not one cart-related prop is passed anywhere.

**Check it:** add books from the list page, from a book's own page, and watch the header count update from both. Navigate between pages — the cart survives, because the provider is above the routes.

## Milestone 6: The cart page and checkout

**Goal:** somewhere to see and change what you've added.

`CartPage` shows each item with its title, price, a quantity control (`−` / `+`), a remove button, and a line total. Below: subtotal, the promo discount if applied, and the total. A promo code box. A **Clear cart** button. A **Checkout** button.

Every one of those numbers is **derived** — computed during render from the cart state, never stored ([chapter 08](../08-state/notes.md)).

An empty cart shows `Your cart is empty` and a link back to the books, not an empty table with a £0.00 total.

Then add a checkout page at `/checkout`, and **lazily load it** ([chapter 26](../26-error-boundaries-and-suspense/notes.md)):

```tsx
const CheckoutPage = lazy(() => import("./pages/CheckoutPage.tsx"));
```

with a `<Suspense fallback={...}>` above your routes. Checkout is a form (name, email, address) that validates, shows an order summary, and on submit clears the cart and shows a confirmation.

**Check it:** run `npm run build` and confirm checkout is a separate chunk. In `npm run preview`, watch the Network tab — that chunk shouldn't download until you visit `/checkout`.

## Milestone 7: Reusable components, properly typed

**Goal:** two components used everywhere, typed with [chapter 25](../25-typescript-patterns/notes.md)'s patterns.

**`Button`** — accepts every native `<button>` prop plus your own `variant` and `size`:

```tsx
type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant: "primary" | "secondary" | "ghost";
  size?: "small" | "medium";
};
```

Merge `className` rather than letting the caller's overwrite yours. Replace every raw `<button>` in the app with it.

**`BookGrid`** — a generic list component:

```tsx
type BookGridProps<T> = {
  items: readonly T[];
  getId: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  emptyMessage: string;
};
```

Use it for the books page **and** the cart page, proving it's genuinely general.

**Check it:** `npx tsc -b` is clean. Try `<Button variant="danger">` and confirm TypeScript rejects it. Try passing a `className` and confirm in the Elements tab that both your classes and theirs are applied.

## Milestone 8: Error boundaries and tests

**Goal:** it degrades gracefully, and the important flows are covered.

**Boundaries** ([chapter 26](../26-error-boundaries-and-suspense/notes.md)) — install `react-error-boundary` and add:

- One around the **book grid**, so a bad book can't take out the header and nav.
- One around the **cart page**.
- One at the **root** as a last resort.
- One around the lazy checkout route, **outside** its `<Suspense>`.

Prove it: temporarily make one book's price `undefined` and call `.toFixed(2)` on it. The grid should show a fallback while the header, nav and cart count keep working.

**Tests** ([chapter 28](../28-testing/notes.md)) — you already have the reducer covered. Add a `renderWithProviders` helper (wrapping `MemoryRouter` and `CartProvider`), then these flows:

1. The books page shows all 12 books.
2. Typing in the search box filters the list.
3. Clicking **Add to cart** increases the header's count.
4. Adding the same book twice gives one cart line with quantity 2.
5. Removing the last item shows the empty-cart message.
6. A book URL that doesn't exist shows the not-found message. (Start `MemoryRouter` at `/books/999`.)

Use `getByRole` with accessible names throughout. **If a query can't find something, fix the component** — an icon-only button needs an `aria-label`.

**Check it:** `npm test` is green, and every test still passes if you rename internal variables in your components.

## Milestone 9: Profile it, and probably change nothing

**Goal:** practise measuring, and practise restraint.

Build for production (`npm run build && npm run preview`) and profile three interactions with the React DevTools Profiler ([chapter 27](../27-performance/notes.md)), with "record why each component rendered" on:

1. Typing in the search box.
2. Adding a book to the cart.
3. Navigating between pages.

Write down, in a comment in `App.tsx`: the render time for each, and whether any exceeded 16ms.

If something did, find out why, and **try a structural fix first** — moving state down, or passing JSX as `children`. Only then reach for `memo`.

If nothing did — which is the likely outcome at twelve books — **write that down and change nothing.** Being able to finish a performance pass by deliberately doing nothing is a genuine skill, and it's the honest result here.

## Now compare

Three projects in, it's worth looking at what changed.

| | To-do (ch10) | Recipe Finder (ch21) | Bookstore (ch29) |
|---|---|---|---|
| Screens | 1 | 1 + a modal | 6 real URLs |
| State lives | One component | A few components | Local / URL / shared, deliberately split |
| State changes via | Setters in handlers | Setters in hooks | Actions through one reducer |
| Sharing state | Props | Props | Context |
| When it breaks | Blank page | Blank page | One section fails; the rest works |
| Checking it works | Clicking | Clicking | `npm test`, in two seconds |

**The thing that changed most is confidence.** In the to-do app, "did I break anything?" was answered by clicking around. Here it's answered by a test suite — which is what makes it possible to restructure a component at milestone 7 without being afraid.

**The thing that changed least is the fundamentals.** Milestone 4's reducer follows exactly the copying rules from [chapter 11](../11-updating-objects-and-arrays/notes.md). The derived totals in milestone 6 are the same "don't store what you can calculate" from [chapter 08](../08-state/notes.md). Context is still just delivery for ordinary `useState`. Level 3 didn't replace anything you learned — it gave you places to put it.

## Common mistakes

**1. Filters in `useState` instead of the URL**

It works, and it quietly removes the ability to share or bookmark a view. If someone would want to send it in a link, it belongs in `useSearchParams`.

**2. Cart totals stored in state**

```tsx
const [total, setTotal] = useState(0);   // ❌ goes stale the first time you forget to update it
```

Derive them. Every time.

**3. One context holding state and dispatch together**

Every dispatch-only component then re-renders on every cart change. Two contexts, as in [chapter 23](../23-use-reducer/notes.md).

**4. Cart rules leaking into components**

```tsx
onClick={() => {
  if (item.quantity < 10) dispatch({ type: "quantity_changed", ... });   // ❌
}}
```

The cap belongs in the reducer. If a component knows a business rule, it'll disagree with the next component that also thinks it knows it.

**5. `<a href>` in the nav**

Full page reload, cart wiped. `<Link>` and `NavLink`, always.

**6. `!` or `as string` on `useParams`**

Both `useParams` and `find` can genuinely come back empty — a URL someone typed wrong, a book that was removed. Handle both; that's what the 404 case is for.

**7. Tests that break when you refactor**

If milestone 7's `Button` refactor breaks a test, that test was checking markup rather than behaviour. Rewrite it around `getByRole` and what the user sees.

**8. Optimising at milestone 9 without measuring**

Twelve books is not a performance problem. Measure, then act — and be willing to act by doing nothing.

## Quick recap

- Sort state into **local**, **URL**, and **shared** before writing it. Most of this project's difficulty is misfiled state.
- Filters and ids belong in the **URL**, so views can be shared, bookmarked, and restored on refresh.
- Put every rule about how the cart changes in **one reducer** — and **test the reducer first**, before any UI exists. It's the cheapest, highest-value testing in a React app.
- Deliver shared state with **two contexts** (state and dispatch) and guard hooks. Components get what they need with no props.
- **Derive every total.** Nothing computed is ever stored.
- **Error boundaries per section**, so one broken thing can't blank the site.
- Write tests around **what a user does**, using `getByRole`. They should survive a refactor — and if they don't, they were testing the wrong thing.
- **Measure before optimising**, and be willing to finish by changing nothing.

---

**Next:** try the [stretch goals](exercises.md). That's the end of Level 3 — [Level 4](../30-axios/notes.md) is the React toolbox: the libraries most teams reach for, and what problem each one actually solves.
