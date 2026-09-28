# 24 React Router: Exercises

**How to do these:**

- These need React Router installed: `npm install react-router` in your practice app, and `<BrowserRouter>` wrapped around `<App />` in `main.tsx`.
- Because routing is app-wide, these exercises don't fit the usual one-folder-per-exercise pattern as neatly. Give each exercise its own folder under `src/ch24/`, and point `App.tsx` at the exercise you're working on by rendering its own `<Routes>` block.
- **Test every exercise with the browser's back and forward buttons, and by refreshing on a deep URL.** Those are the two things this chapter exists for, and the two things it's easiest to accidentally break.
- An exercise is done when the URLs are right, back/forward work, refreshing a deep link works, VS Code shows no red squiggles, and `npx tsc -b` prints nothing.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Three pages, and the `<a>` trap

In `src/ch24/ex1/`, build three pages — `Home`, `About`, `Contact` — and a nav bar linking to all three.

1. Wire them up with `<Routes>` and `<Route>`, at `/`, `/about`, and `/contact`.
2. Build the nav bar with plain `<a href="...">` links **first**. Click between pages and watch the browser tab's loading spinner. Open the Network tab and watch what gets requested on each click.
3. Add a `console.log("App rendered")` at the top of `App`, and a `useState` counter somewhere in the nav bar. Click the counter a few times, then navigate with your `<a>` links. What happened to the counter?
4. Now swap every `<a>` for `<Link>`. Repeat step 3. What's different — in the Network tab, and to the counter?
5. Add a `*` route rendering a `NotFound` page. Type a nonsense URL to confirm it works.

<details>
<summary>Hint 1</summary>

Question 3 is the whole point. With `<a>`, the counter resets to 0 on every navigation, because the browser threw away your entire app and started it again from `index.html`. With `<Link>`, it keeps counting.

</details>

---

## Exercise 2 (Easy): A layout that survives navigation

In `src/ch24/ex2/`, restructure exercise 1's pages to share a layout.

1. Build a `Layout` component with a header (containing the nav), an `<Outlet />`, and a footer.
2. Nest all three page routes inside a parent route rendering `Layout`. Use `index` for the home page.
3. Convert the nav links to `NavLink`, styling the active one differently.
4. Put a `useState` counter **in the header**. Navigate between all three pages and confirm the count doesn't reset — proving the header genuinely isn't being re-created.
5. Deliberately give one child route a leading slash (`path="/about"` instead of `path="about"`). What happens? Fix it, and write down what the symptom was.

<details>
<summary>Hint 1</summary>

For question 5, the symptom is worth recognising: with the extra slash, the path becomes `//about` in effect, nothing matches, and you get your `NotFound` page (or a blank screen if you haven't added one). It looks like the route is "missing" rather than "misspelled."

</details>

---

## Exercise 3 (Medium): URL parameters and a detail page

In `src/ch24/ex3/`, build a small book browser using this data in `books.ts`:

```ts
export type Book = {
  id: string;
  title: string;
  author: string;
  year: number;
  blurb: string;
};

export const books: Book[] = [
  { id: "1", title: "The Hobbit", author: "J. R. R. Tolkien", year: 1937, blurb: "..." },
  { id: "2", title: "Dune", author: "Frank Herbert", year: 1965, blurb: "..." },
  { id: "3", title: "Small Gods", author: "Terry Pratchett", year: 1992, blurb: "..." },
];
```

1. `/books` lists every book's title as a `<Link>` to its detail page.
2. `/books/:id` shows one book's full details, read via `useParams`.
3. Handle the `id` being `undefined` properly — no `!`, no `as string`.
4. Handle an id that **doesn't match any book** (`/books/999`): show a "Book not found" message with a link back to the list, not a crash and not a blank page.
5. Add a **Back to all books** link on the detail page, and separately a **Back** button using `navigate(-1)`. Try both after arriving from different places (from the list, and by pasting the URL directly). In a comment, describe how they behave differently and when you'd use each.
6. Refresh the page while on `/books/2`. Does it still work?

<details>
<summary>Hint 1</summary>

Question 5 is the interesting one. `navigate(-1)` retraces the user's actual history, which might be a completely different site if they arrived by pasting the URL. `<Link to="/books">` always goes to a known place. For "back to the list," the link is usually the safer choice.

</details>

<details>
<summary>Hint 2</summary>

Requirements 3 and 4 are two different missing cases: no `id` in the URL at all, and an `id` that matched nothing in your data. `books.find(...)` returns `Book | undefined`, so TypeScript will insist you handle the second — the same situation as every `find` since [chapter 04](../04-props/notes.md).

</details>

---

## Exercise 4 (Medium): Filters in the URL

Take exercise 3's book list and move its filtering into the URL, so any view can be shared.

1. Add a search box filtering by title, and a `<select>` filtering by author.
2. Both live in `useSearchParams`, **not** `useState`. The URL should read `/books?q=dune&author=all`.
3. Typing in the search box updates the URL live.
4. Copy the URL with both filters applied, open a new tab, and paste it — the filtered view should come up exactly as you left it.
5. Press the browser's **back** button after changing a filter. What happens? Is that what you'd want? Write down your answer.
6. Add a **Clear filters** button that removes the query string entirely, leaving a bare `/books`.

<details>
<summary>Hint 1</summary>

For question 5: every filter change adds a history entry, so back steps through your filter history one keystroke at a time. That's often annoying for a search box. `setSearchParams(next, { replace: true })` updates the URL *without* adding a history entry — try both and decide which you prefer for this case.

</details>

<details>
<summary>Hint 2</summary>

`searchParams.get("q")` returns `string | null`. `?? ""` gives you a usable default, and keeps the input controlled ([chapter 09](../09-forms/notes.md)).

</details>

---

## Exercise 5 (Challenge): A full mini-app with nested layouts

In `src/ch24/ex5/`, build a small account section with two levels of nested layout — the shape almost every real dashboard uses.

Routes:

```
/                        → home page
/books                   → book list (from exercise 3)
/books/:id               → book details
/account                 → account layout, with its own sub-nav
/account                 → (index) profile summary
/account/orders          → order list
/account/orders/:orderId → one order's details
/account/settings        → settings form
*                        → 404
```

Requirements:

1. **Two nested layouts**: the app-wide `Layout` (header, footer, `<Outlet />`), and inside it an `AccountLayout` (a sidebar of account links, plus its own `<Outlet />`).
2. The account sidebar uses `NavLink` and correctly highlights the active section — including keeping "Orders" highlighted while you're on a *specific* order's page.
3. A "fake login" gate: a `useState` boolean in `App` (or better, a context from [chapter 22](../22-context/notes.md)). When logged out, visiting any `/account/*` URL shows a "Please log in" page instead, with a **Log in** button. Logging in should then show the page you originally asked for, not dump you at `/account`.
4. Refreshing on `/account/orders/7` while logged in lands you exactly there.
5. Every page is reachable by typing its URL directly, and back/forward work throughout.

<details>
<summary>Hint 1</summary>

For requirement 2, `NavLink` marks itself active for exact matches by default at deeper levels — check whether `/account/orders` stays highlighted on `/account/orders/7` in your setup, and look at `NavLink`'s `end` prop, which controls exactly this.

</details>

<details>
<summary>Hint 2</summary>

For requirement 3's "send them where they were going," you need to remember the attempted URL. `useLocation()` gives you the current one; you can stash its `pathname` when showing the login page and `navigate(stashed)` after logging in. Getting this right is what separates a login flow people tolerate from one they find infuriating.

</details>

<details>
<summary>Hint 3</summary>

A clean way to express requirement 3 is a small `RequireAuth` component that either renders `<Outlet />` or the login page, used as a layout route wrapping the account routes — so the check is written once rather than in every account page.

</details>
