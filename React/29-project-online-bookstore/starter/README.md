# Online Bookstore: starter files

Three files to drop into a fresh Vite app. `App.tsx` is a stub — every page, the router setup, the cart, and the tests are yours to write. Follow the milestones in this chapter's [notes.md](../notes.md).

## How to use them

1. In a terminal **in the `React` folder**, run `npm create vite@latest`, answering as in [chapter 01](../../01-getting-started/notes.md), naming the project `bookstore`.
2. Copy the three files in this folder's `src/` over `bookstore/src/`.
3. Delete `bookstore/src/App.css` and `bookstore/src/assets/`.
4. `cd bookstore`, then install what the project needs:

   ```
   npm install react-router
   npm install -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
   ```

5. Set up Vitest as described in [chapter 28](../../28-testing/notes.md): the `test` block in `vite.config.ts`, `src/test-setup.ts`, and a `"test": "vitest"` script.
6. `npm run dev` in one terminal, `npm test` in another.

## What's in here

| File | What it is |
|---|---|
| `src/books.ts` | 12 books with covers, prices, genres and descriptions, plus the `Book` and `Genre` types. |
| `src/App.tsx` | A stub with the nine milestones listed in a comment. |
| `src/index.css` | All the styling, finished, including the stretch goals. |

`main.tsx` and `index.html` stay as Vite made them, except that milestone 1 has you wrap `<App />` in `<BrowserRouter>` (and milestone 5 in `<CartProvider>`).

## The class names the CSS expects

Use these and the app will look right. Anything not listed, style however you like.

**Layout and header**

| Class | Put it on |
|---|---|
| `app` | the wrapping `<div>` in `Layout` |
| `site-header` | the `<header>` |
| `shop-name` | the shop name (wrap the text in a `<Link to="/">`) |
| `main-nav` | the `<nav>` holding the links |
| `nav-link` / `nav-link active` | each `NavLink` (use its `isActive` render prop) |
| `cart-indicator` | the cart link in the header |
| `page` | the wrapper inside `<Outlet />`'s page |
| `page-title` | each page's `<h1>` or `<h2>` |
| `status-message` | loading / empty messages |
| `status-message error` | error text |

**Books**

| Class | Put it on |
|---|---|
| `filter-bar` | the `<div>` around the search box and selects |
| `search-input`, `filter-select` | the filter controls |
| `result-count` | the "Showing 3 of 12 books" line |
| `book-grid` | the `<ul>` of books |
| `book-card` | each `<li>` — a container, **not** a link or button (see below) |
| `book-card-link` | the `<Link>` wrapping the cover and title |
| `book-cover` | the `<img>` |
| `book-title`, `book-author`, `book-price`, `book-genre` | the card's text |
| `book-detail` | the single book page's two-column wrapper |
| `book-detail-title`, `book-detail-author`, `book-detail-price`, `book-description` | its text |
| `back-link` | "Back to all books" |

**Cart**

| Class | Put it on |
|---|---|
| `cart-list` | the `<ul>` of cart lines |
| `cart-row` | each `<li>` |
| `cart-row-title`, `cart-row-price`, `cart-row-total` | its parts |
| `quantity-control` | the `<div>` holding − / value / + |
| `quantity-value` | the number between the buttons |
| `remove-button` | the `×` |
| `cart-summary` | the totals panel |
| `summary-row`, `summary-row discount`, `summary-row total` | each line in it |
| `promo-form`, `promo-message`, `promo-message error`, `promo-message success` | the promo code box |

**Buttons and forms**

| Class | Put it on |
|---|---|
| `btn` | every button — always combined with a variant |
| `btn-primary`, `btn-secondary`, `btn-ghost` | the variants |
| `btn-small` | the optional small size |
| `form-field` | a label + input pair |
| `field-error` | a validation message |
| `error-fallback` | an error boundary's fallback |
| `visually-hidden` | a label read aloud but not shown |

Milestone 7's `<Button>` component should produce `btn btn-primary btn-small` style combinations from its `variant` and `size` props — that's exactly what the `cx` helper from [chapter 15](../../15-styling/notes.md) is for.

**Stretch goals**: `stock-warning`, `out-of-stock`, `save-button` / `save-button active`, `order-list`, `order-row`, `account-layout`, `account-nav`, `skeleton` / `skeleton-card`.

## A note on the book card structure

Same rule as the [Recipe Finder](../../21-project-recipe-finder/starter/README.md): a card has **two** interactive things in it — a link to the book, and an Add to cart button. Nesting a `<button>` inside an `<a>` (or vice versa) is invalid HTML and behaves unpredictably.

So the card is a plain container with both as siblings:

```tsx
<li className="book-card">
  <Link className="book-card-link" to={`/books/${book.id}`}>
    <img className="book-cover" src={book.cover} alt="" />
    <h3 className="book-title">{book.title}</h3>
    <p className="book-author">{book.author}</p>
  </Link>
  <p className="book-price">£{book.price.toFixed(2)}</p>
  <Button variant="primary" size="small" onClick={handleAdd}>Add to cart</Button>
</li>
```

The `alt=""` is deliberate: the title is right there as text, so the cover is decorative and an empty `alt` stops a screen reader reading the title twice.

## A note on the covers

The cover images come from a placeholder image service, so they need an internet connection the first time. If you're working offline, swap the `cover()` function in `books.ts` for one returning a local file, or just let them show as broken — nothing in the project depends on them loading.

## Prices

Prices are plain numbers, formatted with `toFixed(2)` in the UI. If you'd rather do it properly, `Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" })` handles currency formatting correctly, and is worth knowing about.
