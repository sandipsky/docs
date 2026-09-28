# 29 Project: Online Bookstore: Exercises

These are **stretch goals**: extra features for your finished bookstore. Do them in any order, and do as many as you like.

**How to do these:**

- Finish all 9 milestones first, then commit or copy the `bookstore` folder so you've got a working version to return to.
- `index.css` already has styles for these goals — look for "Styles for the stretch goals" near the bottom.
- **Write the test first for any of these that touches a cart rule.** You have a reducer test file already; adding to it before you change the reducer is the fastest way to work now.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Persist the cart

A cart that vanishes on refresh is a cart nobody trusts.

1. Save the cart state to `localStorage` whenever it changes, and load it on startup — using your `useLocalStorage` hook from [chapter 20](../20-custom-hooks/notes.md), or an effect in `CartProvider`.
2. Load it as the reducer's **initial state**, using `useReducer`'s third argument (the lazy initialiser from [chapter 23](../23-use-reducer/notes.md)).
3. Handle corrupt stored data: edit the saved value to `not json` in DevTools, refresh, and confirm the app starts with an empty cart rather than a white screen.
4. Add a test proving a saved cart is restored on a fresh render.

**What you should see:** add three books, refresh, and the header still says 3.

<details>
<summary>Hint 1</summary>

Keep the reducer itself completely pure — it must not touch `localStorage`. Loading happens in the initialiser (before the reducer ever runs), and saving happens in an effect watching the state. The reducer stays a plain function of `(state, action)`.

</details>

---

## Exercise 2 (Easy): Sorting, in the URL

Add a **Sort by** dropdown to the books page: *Title A–Z*, *Price: low to high*, *Price: high to low*.

1. The sort choice lives in the URL alongside the existing filters — `/books?q=dune&genre=scifi&sort=price-asc`.
2. Sorting never mutates the `books` array ([chapter 11](../11-updating-objects-and-arrays/notes.md)).
3. The sort survives a refresh and can be shared in a link.
4. Add a **Clear all filters** button that strips the whole query string back to a bare `/books`.

<details>
<summary>Hint 1</summary>

A lookup object mapping each sort key to a comparator function keeps this tidy and avoids a chain of `if`s — [chapter 05](../05-conditional-rendering/notes.md)'s pattern, and a good place for `satisfies` from [chapter 25](../25-typescript-patterns/notes.md).

</details>

---

## Exercise 3 (Medium): Stock levels and validation

Give each book a `stock` number in `books.ts`, and make the app respect it.

1. A book with `stock: 0` shows **Out of stock** and a disabled Add button.
2. The cart can never hold more of a book than its stock. Enforce this **in the reducer**, not in the component — the cap replaces (or combines with) the existing limit of 10.
3. The cart page shows a warning on any line at its stock limit: `Only 2 left in stock`.
4. Checkout is blocked while any line exceeds stock, with a clear message saying which book.
5. **Write the reducer tests first**, for: adding at the limit does nothing, `quantity_changed` above stock clamps to stock, and adding an out-of-stock book is ignored entirely.

<details>
<summary>Hint 1</summary>

Requirement 2 means the action needs to carry the stock figure, or the reducer needs access to the book data. Passing the whole `book` in the `added` action (as the milestone-4 type already does) makes this straightforward — the reducer can read `book.stock` without importing anything.

</details>

---

## Exercise 4 (Medium): Saved for later

Add a wishlist — a second collection, alongside the cart, with its own rules.

1. A ♡ on every book card and book page toggles "saved for later".
2. A `/saved` route listing saved books, with **Move to cart** on each.
3. Saved items persist across refreshes, separately from the cart.
4. The header shows both counts: `🛒 3  ♡ 5`.
5. **Move to cart** adds to the cart *and* removes from saved, as one user action.
6. On the cart page, each line gets a **Save for later** button doing the reverse.

Then a design question, answered in a comment: did you extend the existing cart reducer with wishlist actions, or build a second reducer and context? Give your reasoning — both are defensible, and being able to argue for your choice matters more than which you picked.

<details>
<summary>Hint 1</summary>

The deciding question for requirement 5: "move to cart" is **one** user action that changes **two** collections. If they're separate reducers, you're dispatching two actions that must both succeed to stay consistent. If they're one reducer, it's a single atomic action. That's a genuine argument for combining them — and a genuine argument against, if the two collections otherwise have nothing to do with each other.

</details>

---

## Exercise 5 (Challenge): Make it a real app

Four bigger additions, each mapping to something a real shop needs. Take them in any order.

**A. A real API.** Replace `books.ts` with a fetch, using the three-state pattern and a custom hook from [chapter 18](../18-fetching-data/notes.md). You can serve the JSON yourself — put `books.json` in `public/` and fetch `/books.json` — which behaves exactly like a real API including loading states, but needs no server. Add loading skeletons and a proper error state with a retry.

**B. A protected account area.** An `AuthContext` with a fake login, an `/account` section with nested routes ([chapter 24](../24-react-router/notes.md)), and a `RequireAuth` layout route that redirects logged-out visitors to `/login` — **remembering where they were going** and sending them there after they log in.

**C. Order history.** Completing checkout saves the order (id, date, items, total) to a persisted list. `/account/orders` lists them; `/account/orders/:orderId` shows one. Test the full flow: add books → checkout → the order appears in history with the right total.

**D. A proper test suite.** Get to the point where you'd genuinely trust it:

- Every reducer rule covered, including the new ones from A–C.
- One test per user flow: browse → filter → add → cart → checkout → order history.
- The error path: the API fails, the error shows, the nav still works.
- The auth path: a logged-out user hitting `/account/orders` lands on login, and ends up at `/account/orders` after logging in.
- Run `npx vitest --coverage` and write down which files remain untested and whether that's acceptable.

<details>
<summary>Hint 1</summary>

For B, `useLocation()` gives you the URL the user was refused. Stash its `pathname` (in router state via `<Navigate to="/login" state={{ from: location }} />`, or in context), and `navigate(from, { replace: true })` after a successful login. `replace` matters — without it, pressing back lands them on the login page again.

</details>

<details>
<summary>Hint 2</summary>

For A, serving the JSON from `public/` is worth knowing as a technique in its own right: files in `public/` are served as-is at the root, so `public/books.json` is available at `/books.json`. It gives you real network behaviour — loading delays, the ability to simulate failure by renaming the file — with no backend at all.

</details>

<details>
<summary>Hint 3</summary>

For D, the auth flow test is the one most worth writing carefully, because it's the one most likely to have a real bug. Render at `/account/orders` with `MemoryRouter`'s `initialEntries`, assert you see the login page, log in through the form, and assert you end up on the orders page — not the account home.

</details>

---

## When you're done

That's the end of Level 3, and the end of "plain React". Everything from here on is libraries built on top of what you now know.

Before moving on, write down:

- One thing in this project that would have been genuinely painful without routing, context, or the reducer.
- One test that caught a real bug while you were building it.
- One part of the app you'd restructure if you started again, and why.

That last one is the most useful. Bring it to Claude and talk it through.
