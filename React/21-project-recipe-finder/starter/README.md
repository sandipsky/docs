# Recipe Finder: starter files

These two files go into a fresh Vite app. `App.tsx` is a stub — all the React, all the API code, and every other component is yours to write. Follow the milestones in this chapter's [notes.md](../notes.md).

## How to use them

1. In a terminal **in the `React` folder**, run `npm create vite@latest` and answer as in [chapter 01](../../01-getting-started/notes.md), naming the project `recipe-finder`.
2. Copy the two files in this folder's `src/` over the same-named files in `recipe-finder/src/`.
3. Delete `recipe-finder/src/App.css` and `recipe-finder/src/assets/`.
4. `cd recipe-finder`, then `npm run dev`.

You should see the title and an empty, unwired search box.

## What's in here

| File | What it is |
|---|---|
| `src/App.tsx` | A stub component with the eight milestones listed in a comment. |
| `src/index.css` | All the styling, finished, including the stretch goals. You shouldn't need to change it. |

`main.tsx`, `index.html` and everything else stay exactly as Vite made them.

## The API

Every request in this project goes to [**TheMealDB**](https://www.themealdb.com/api.php), using the shared test key `1` — no account, no real API key needed. A few endpoints you'll use, with their base URL `https://www.themealdb.com/api/json/v1/1/`:

| Endpoint | What it returns |
|---|---|
| `search.php?s=<name>` | Recipes matching a name |
| `lookup.php?i=<id>` | Full details for one recipe |
| `random.php` | One random recipe |
| `filter.php?c=<category>` | Recipes in a category |
| `list.php?c=list` | Every category |

All of them return `{ meals: [...] }` or `{ meals: null }` if nothing matches — except `list.php?c=list`, which returns `{ meals: [{ strCategory: "..." }, ...] }`. Log a real response the first time you use a new endpoint rather than guessing its shape.

## The class names the CSS expects

| Class | Put it on |
|---|---|
| `app` | the wrapping `<div>` |
| `app-title` | the `<h1>` |
| `search-form` | the `<form>` |
| `search-input` | its text box |
| `search-button` | its submit button |
| `category-select` | the category `<select>` (milestone 7) |
| `status-message` | the loading / error / empty text |
| `status-message error` | specifically the error variant |
| `recent-searches` | the wrapper around recent search buttons (milestone 8) |
| `recent-search-button` | each one |
| `results-grid` | the `<div>` wrapping all the cards |
| `recipe-card` | each card — an `<article>`, **not** a button (see below) |
| `recipe-card-main` | the `<button>` inside it that opens the recipe |
| `recipe-thumbnail` | the `<img>` inside a card |
| `recipe-name` | the recipe name text |
| `recipe-category` | the category text |
| `favorite-button` | the ♥/♡ button (milestone 6) |
| `favorite-button active` | the same button, when favourited |
| `modal-overlay` | the dark backdrop behind the detail view |
| `modal` | the detail view panel itself |
| `modal-close` | its close button |
| `modal-title`, `modal-meta`, `modal-ingredients`, `modal-instructions` | its content pieces |
| `skeleton` | a loading-placeholder card (stretch goal 2) — already has the pulse animation |
| `visually-hidden` | a label you want read aloud but not shown, same as [chapter 10](../../10-project-todo-app/starter/README.md) |

## A note on the card structure

A recipe card has **two** separate clickable things in it: the card itself (opens the recipe) and the heart (toggles a favourite). It's tempting to make the whole card one big `<button>` and put the heart inside it — but **HTML does not allow a `<button>` inside a `<button>`**. Browsers handle it unpredictably, and the inner one may not be clickable at all.

So the card is a plain container, with the two buttons as siblings:

```tsx
<article className="recipe-card">
  <button className="recipe-card-main" onClick={...}>
    <img className="recipe-thumbnail" ... />
    <h3 className="recipe-name">...</h3>
    <p className="recipe-category">...</p>
  </button>
  <button className="favorite-button" onClick={...}>♡</button>
</article>
```

The stylesheet positions the heart over the card's corner with `position: absolute`, so it *looks* nested without actually being nested. A nice side effect: because the two buttons are siblings, clicking one can never trigger the other, so you need no `stopPropagation` anywhere.

## A note on `visually-hidden`

The search box needs a real `<label>`, not just a placeholder — see [chapter 10's starter README](../../10-project-todo-app/starter/README.md) for why, and [chapter 38](../../38-accessibility/notes.md) for the full picture later.
