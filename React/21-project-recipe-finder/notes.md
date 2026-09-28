# 21 Project: Recipe Finder

## What you'll build

An app that searches a live recipe API, shows the results as a grid of photo cards, opens full instructions when you click one, and remembers your favourites between visits.

```
🍳 Recipe Finder

[ Search recipes...                    ]   Category: [ All ▾ ]

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  [thumbnail] ♡│  │ [thumbnail] ♥│  │ [thumbnail] ♡│
│              │  │              │  │              │
│ Chicken      │  │ Beef Stew    │  │ Chicken      │
│ Parmesan     │  │              │  │ Curry        │
│ Chicken      │  │ Beef         │  │ Chicken      │
└──────────────┘  └──────────────┘  └──────────────┘
```

By the end, your app will:

- search a live recipe API as you type, without flooding it with requests
- show clear loading, error, and empty states
- show full recipe details — photo, ingredients, instructions — when you click a card
- let you favourite recipes, saved so they survive a refresh
- show all your favourites, even ones from searches you've long since cleared
- filter results by category

This is the Level 2 project. It uses almost everything from this level:

| Chapter | Where you'll use it |
|---|---|
| [11 Updating Objects and Arrays](../11-updating-objects-and-arrays/notes.md) | Adding and removing favourites without mutating state |
| [13 Lifting State Up](../13-lifting-state-up/notes.md) | The search box, the grid, and the detail view sharing state |
| [14 Thinking in React](../14-thinking-in-react/notes.md) | Planning the component tree and state before writing code |
| [15](../15-styling/notes.md) or [16](../16-tailwind-css/notes.md) Styling | The finished stylesheet, or your own if you'd rather |
| [17 Effects](../17-effects/notes.md) | Fetching, and syncing favourites to `localStorage` |
| [18 Fetching Data](../18-fetching-data/notes.md) | Loading and error states, for two different kinds of request |
| [19 Refs](../19-refs/notes.md) | Focusing the search box when the app loads |
| [20 Custom Hooks](../20-custom-hooks/notes.md) | `useLocalStorage` and `useDebounce`, reused; two new hooks of your own |

The API is [**TheMealDB**](https://www.themealdb.com/api.php), a free recipe database. It needs no account and no real API key — everything here uses the shared test key `1`, which exists for exactly this kind of practice project.

## Getting started

This project gets its own app, same as the to-do app did.

1. Open a terminal in this `React` folder and run `npm create vite@latest`, answering as in [chapter 01](../01-getting-started/notes.md), naming the project `recipe-finder`.
2. Copy this chapter's `starter/src/` files over `recipe-finder/src/`.
3. Delete `recipe-finder/src/App.css` and `recipe-finder/src/assets/`.
4. `cd recipe-finder`, then `npm run dev`.

You should see the title and nothing else. Keep a second terminal on `npx tsc -b`, and keep DevTools open — you'll live in the **Network** tab this chapter, watching requests fire, get cancelled, and come back.

**The CSS is finished for you.** The class names it expects are in `starter/README.md`.

## The big idea: one direction of travel

The to-do app in [chapter 10](../10-project-todo-app/notes.md) owned all its data. Nothing arrived from outside; nothing could fail. This app is the opposite — almost everything on screen came from a server that's slow, occasionally down, and completely outside your control.

That changes the shape of the app. Data now flows in one direction through three layers, and keeping them separate is what makes eight milestones manageable instead of tangled:

```
  TheMealDB's JSON        →   api.ts        →   hooks        →   components
  strMeal, idMeal, ...        Recipe[]          + loading        JSX
  (ugly, theirs)              (clean, yours)    + error
```

| Layer | Its one job | Never does |
|---|---|---|
| `api.ts` | Build URLs, call `fetch`, convert their shapes into yours | Know about React |
| Hooks | Track loading, error, and data over time | Know about JSX |
| Components | Turn state into JSX | Know that `strMeal` exists |

That third column is the useful one. If you ever find yourself writing `strMeal` inside a component, a layer boundary has leaked, and the fix belongs one layer down — not in the component.

## Milestone 1: Types, and a search box that focuses itself

**Goal:** the shape of your data, and a form that does nothing yet.

Make `src/types.ts`:

```ts
export type Recipe = {
  id: string;
  name: string;
  thumbnail: string;
  category: string;
};

export type RecipeDetails = Recipe & {
  instructions: string;
  ingredients: string[];
};
```

`RecipeDetails` is a `Recipe` **and** more, joined with `&` ([TypeScript chapter 04](../../TypeScript/04-type-aliases-and-interfaces/notes.md)). Anywhere that accepts a `Recipe` will happily accept a `RecipeDetails`, which is exactly what you want — the detail view can reuse the card's data without any conversion.

Now `src/SearchForm.tsx` — controlled, no fetching, [chapter 09](../09-forms/notes.md)'s pattern exactly:

```tsx
type SearchFormProps = {
  query: string;
  onQueryChange: (query: string) => void;
};
```

Inside it, an `<input className="search-input">` with a real `<label className="visually-hidden">`, and a submit button.

Then the one bit of [chapter 19](../19-refs/notes.md) this project needs: **focus the box when the app loads**, so you can start typing immediately without reaching for the mouse.

```tsx
const inputRef = useRef<HTMLInputElement>(null);

useEffect(() => {
  inputRef.current?.focus();
}, []);
```

In `App.tsx`, hold `query` in state, render `<SearchForm />`, and temporarily show `<p>Searching for: {query}</p>` so you can see it working.

**Check it:** the cursor is already in the box when the page loads. Typing updates the paragraph live. The Network tab shows no requests at all.

## Milestone 2: Search on submit

**Goal:** press Enter, get real recipes — or a clear error.

Make `src/api.ts`. **This file is the only place in your app that knows what TheMealDB's JSON looks like:**

```ts
import type { Recipe } from "./types.ts";

const BASE = "https://www.themealdb.com/api/json/v1/1";

type MealDbMeal = {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory: string;
};

type MealDbSearchResponse = {
  meals: MealDbMeal[] | null;
};

function toRecipe(meal: MealDbMeal): Recipe {
  return {
    id: meal.idMeal,
    name: meal.strMeal,
    thumbnail: meal.strMealThumb,
    category: meal.strCategory,
  };
}

export async function searchRecipes(query: string): Promise<Recipe[]> {
  const response = await fetch(`${BASE}/search.php?s=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error(`Search failed: ${response.status}`);
  }
  const data: MealDbSearchResponse = await response.json();
  return (data.meals ?? []).map(toRecipe);
}
```

Three details worth pausing on:

- **`encodeURIComponent`** turns a query like `chicken & rice` into something safe to put in a URL. Skip it and any search containing `&`, `?` or `#` silently breaks.
- **`response.ok`**, from [chapter 18](../18-fetching-data/notes.md) — `fetch` does *not* reject on a 404 or a 500, so you check and throw yourself.
- **`data.meals ?? []`** — TheMealDB returns `{ "meals": null }`, not an empty array, when nothing matches. `??` turns that into an empty array right here, so nothing downstream ever has to think about it.

Now in `App.tsx`, add a second piece of state, `submittedQuery`, set by the form's `onSubmit`. It's deliberately separate from the live `query` the input shows — you don't want to fetch on every keystroke yet, and separating "what's typed" from "what's been asked for" is what makes that possible.

Then the three-state pattern from [chapter 18](../18-fetching-data/notes.md), written out longhand for now:

```tsx
const [recipes, setRecipes] = useState<Recipe[] | null>(null);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  if (submittedQuery === "") {
    setRecipes(null);
    return;
  }

  let ignore = false;
  setIsLoading(true);
  setError(null);

  searchRecipes(submittedQuery)
    .then((found) => {
      if (!ignore) setRecipes(found);
    })
    .catch((err: unknown) => {
      if (!ignore) setError(err instanceof Error ? err.message : "Something went wrong");
    })
    .finally(() => {
      if (!ignore) setIsLoading(false);
    });

  return () => {
    ignore = true;
  };
}, [submittedQuery]);
```

Render the four states as plain text for now — loading, error, "type something to search" (`recipes === null`), and a bare `<ul>` of names.

**Check it:** search `chicken` and see names appear. Search `zzzznotafood` and see an empty-results message, **not** an error — an empty result is a successful request. Temporarily break the domain in `BASE` to confirm the error path shows your message, then fix it.

## Milestone 3: The results grid

**Goal:** photo cards, not a bare list.

Make `src/RecipeCard.tsx`. Read this structure carefully, because it's more deliberate than it first looks:

```tsx
type RecipeCardProps = {
  recipe: Recipe;
  onSelect: (id: string) => void;
};

function RecipeCard({ recipe, onSelect }: RecipeCardProps) {
  return (
    <article className="recipe-card">
      <button className="recipe-card-main" onClick={() => onSelect(recipe.id)}>
        <img className="recipe-thumbnail" src={recipe.thumbnail} alt="" />
        <h3 className="recipe-name">{recipe.name}</h3>
        <p className="recipe-category">{recipe.category}</p>
      </button>
    </article>
  );
}
```

Why an `<article>` wrapping a `<button>`, rather than just making the whole card one big `<button>`?

Because in milestone 7 you're going to add a **favourite** button in the card's top corner. **HTML does not allow a button inside another button** — browsers handle it unpredictably, and the inner one may not be clickable at all. Building the card as a container with buttons *inside* it, as siblings, means that second button drops in later with no restructuring and no conflict between the two click targets.

That's worth naming as a general habit: when two clickable things overlap, **arrange them so they don't nest** rather than reaching for `stopPropagation` to untangle them afterwards. Structure beats patching.

The `alt=""` is also deliberate: the recipe's name is right there in the text, so the image adds nothing for a screen reader and an empty `alt` correctly marks it as decorative. An `alt={recipe.name}` here would just make the name get read out twice.

Now `src/RecipeGrid.tsx`, taking `recipes: readonly Recipe[]`, mapping to cards inside a `<div className="results-grid">` (mind the `key`, [chapter 06](../06-rendering-lists/notes.md)), and showing `No recipes found.` when the array is empty.

**Check it:** a real photo grid. Resize the browser — the CSS handles the responsive columns. Tab through with the keyboard: each card should be reachable and openable with Enter, for free, because it's a real `<button>`.

## Milestone 4: Recipe details

**Goal:** click a card, read the actual recipe.

Add to `api.ts`. The details endpoint returns ingredients in a genuinely awkward shape — twenty numbered fields, `strIngredient1` through `strIngredient20`, most of them empty strings or `null`:

```ts
type MealDbFullMeal = MealDbMeal & {
  strInstructions: string;
  [key: string]: string | null;
};

function extractIngredients(meal: MealDbFullMeal): string[] {
  const ingredients: string[] = [];

  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];

    if (typeof ingredient === "string" && ingredient.trim() !== "") {
      const amount = typeof measure === "string" ? measure.trim() : "";
      ingredients.push(amount === "" ? ingredient.trim() : `${amount} ${ingredient.trim()}`);
    }
  }

  return ingredients;
}

export async function getRecipeDetails(id: string): Promise<RecipeDetails> {
  const response = await fetch(`${BASE}/lookup.php?i=${encodeURIComponent(id)}`);
  if (!response.ok) {
    throw new Error(`Lookup failed: ${response.status}`);
  }
  const data: { meals: MealDbFullMeal[] | null } = await response.json();
  const meal = data.meals?.[0];
  if (!meal) {
    throw new Error("Recipe not found");
  }
  return {
    ...toRecipe(meal),
    instructions: meal.strInstructions,
    ingredients: extractIngredients(meal),
  };
}
```

The `[key: string]: string | null` is an **index signature** ([TypeScript chapter 10](../../TypeScript/10-keyof-typeof-mapped-types/notes.md)): "this object also has other string keys I'm not listing individually." It's what lets you look up `strIngredient7` by a built-up name without TypeScript objecting. This is genuinely the right tool here — the alternative is writing out forty field names by hand.

Notice `...toRecipe(meal)` reusing the converter you already wrote, so the card's four fields are never described twice. And notice the `if (!meal) throw` — `data.meals` can be `null` for an id that doesn't exist, and `?.[0]` can give `undefined`. Handling it here means the component never has to.

In `App.tsx`, add `selectedId: string | null`. When it's set, fetch the details — **a second, completely separate three-state block**, with its own `detailsLoading` and `detailsError`. Feel the duplication; milestone 5 is about to fix it.

Build `src/RecipeModal.tsx` showing the photo, name, category, an ingredients `<ul>`, and the instructions, with a close button that clears `selectedId`.

**Check it:** click a card, read a recipe, close it. Click a different card — the previous recipe's details must not flash on screen before the new ones load. If they do, your loading state isn't being reset when `selectedId` changes.

## Milestone 5: Two focused hooks

**Goal:** stop writing the same twelve lines twice.

You now have two near-identical loading/error/data blocks. [Chapter 20](../20-custom-hooks/notes.md) built a generic `useFetch<T>(url)` for exactly this — but look closely at what you actually need here, because it doesn't quite fit:

- Chapter 20's version takes a **URL** and gives back **raw JSON**. Your `api.ts` functions already return clean, converted `Recipe[]` — so a URL-based hook would force the conversion back up into your components, undoing milestone 2's whole point.
- Your search needs to **not fetch at all** when the query is empty. A hook that fires on every render with whatever URL it's given has no way to express "skip this one."

So instead of bending one generic hook into a shape it doesn't want, write **two small, focused hooks** — which is exactly the advice chapter 20 closed with. Make `src/useRecipeSearch.ts`:

```ts
import { useEffect, useState } from "react";
import { searchRecipes } from "./api.ts";
import type { Recipe } from "./types.ts";

export function useRecipeSearch(query: string) {
  const [recipes, setRecipes] = useState<Recipe[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query === "") {
      setRecipes(null);
      setError(null);
      return;
    }

    let ignore = false;
    setIsLoading(true);
    setError(null);

    searchRecipes(query)
      .then((found) => {
        if (!ignore) setRecipes(found);
      })
      .catch((err: unknown) => {
        if (!ignore) setError(err instanceof Error ? err.message : "Something went wrong");
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [query]);

  return { recipes, isLoading, error };
}
```

And `src/useRecipeDetails.ts`, the same shape, taking `id: string | null` and skipping the fetch when it's `null`.

Now `App.tsx` gets dramatically shorter:

```tsx
const { recipes, isLoading, error } = useRecipeSearch(submittedQuery);
const { details, isLoading: detailsLoading } = useRecipeDetails(selectedId);
```

**"But that's still duplicated!"** — and you're right, the two hooks share a lot. That's a real trade-off, worth being honest about rather than pretending away:

- Two focused hooks are **easy to read** and each says exactly what it does. Their duplication is about a dozen lines.
- One generic hook removes that duplication, but needs a way to express "skip," a way to accept a function instead of a URL, and a dependency list passed in as an argument that your linter can't check for you.

At this size, two clear hooks beat one clever one. If you had *eight* of these, the calculation would flip. Knowing which side of that line you're on is the actual skill — and it's a big part of why [TanStack Query](../31-tanstack-query/notes.md) exists in Level 4, having made this decision once, very carefully, for everybody.

**Check it:** identical behaviour, far less code in `App.tsx`. Both race-condition guards still work — test by clicking two cards in quick succession with the Network tab throttled to Slow 3G.

## Milestone 6: Live search, debounced

**Goal:** results that update as you type, without a request per keystroke.

Bring in `useDebounce` from [chapter 20's exercises](../20-custom-hooks/exercises.md) — or write it now if you skipped it:

```ts
export function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
```

Now delete `submittedQuery` entirely and feed the live `query` through the debouncer:

```tsx
const [query, setQuery] = useState("");
const debouncedQuery = useDebounce(query, 400);
const { recipes, isLoading, error } = useRecipeSearch(debouncedQuery);
```

That's the whole change. `useRecipeSearch` doesn't know or care that its input is now debounced — it just sees a string that changes less often. Two hooks you wrote separately, composing cleanly, with no modification to either.

Keep the form's `onSubmit` working (calling `event.preventDefault()` and nothing else is fine — pressing Enter simply doesn't need to do anything special now), so Enter doesn't reload the page.

**Check it:** type `pasta` at a normal speed with the Network tab open. You should see **one** request, not five. Type slowly, pausing mid-word, and you'll see two — that's correct, and it's the debounce working exactly as intended.

## Milestone 7: Favourites

**Goal:** a heart that survives a refresh.

Bring in `useLocalStorage` from [chapter 20](../20-custom-hooks/notes.md). In `App.tsx`:

```tsx
const [favouriteIds, setFavouriteIds] = useLocalStorage<string[]>("recipe-finder-favourites", []);

function toggleFavourite(id: string) {
  setFavouriteIds((prev) =>
    prev.includes(id) ? prev.filter((existing) => existing !== id) : [...prev, id]
  );
}
```

That's [chapter 11](../11-updating-objects-and-arrays/notes.md)'s toggle, doing real work: `filter` to remove, spread to add, never touching the original array.

Add the favourite button to `RecipeCard` — as a **sibling** of the main button, which is exactly what milestone 3's structure was for:

```tsx
<article className="recipe-card">
  <button className="recipe-card-main" onClick={() => onSelect(recipe.id)}>
    ...
  </button>
  <button
    className={isFavourite ? "favorite-button active" : "favorite-button"}
    onClick={() => onToggleFavourite(recipe.id)}
    aria-label={isFavourite ? `Remove ${recipe.name} from favourites` : `Add ${recipe.name} to favourites`}
  >
    {isFavourite ? "♥" : "♡"}
  </button>
</article>
```

No `stopPropagation` anywhere — the two buttons are siblings, so a click on one was never going to trigger the other. That's the payoff for getting the structure right four milestones ago.

The `aria-label` matters here: a screen reader announcing just "♥" tells someone nothing about which recipe, or what clicking it would do.

**Now make favourites actually visible.** Add to `api.ts`:

```ts
export async function getRecipesByIds(ids: readonly string[]): Promise<RecipeDetails[]> {
  return Promise.all(ids.map((id) => getRecipeDetails(id)));
}
```

`Promise.all` ([JavaScript chapter 31](../../JavaScript/31-promises/notes.md)) fires every request **at once** and waits for all of them, rather than one after another — ten favourites take as long as the slowest single request, not ten times as long. Be aware it's all-or-nothing: if any one request fails, the whole thing rejects, which your existing `catch` will handle as a single error message.

Add a **Favourites** toggle button near the search box that switches the grid between search results and your saved recipes, using a third small hook (`useFavouriteRecipes`, wrapping `getRecipesByIds`) or by extending `useRecipeSearch`'s pattern once more.

**Check it:** favourite three recipes, refresh the page — the hearts are still filled. Clear the search box entirely, switch to Favourites, and see all three, including ones from searches you've since cleared. Check DevTools → Application → Local Storage to see the raw array of ids.

## Milestone 8: Category filter

**Goal:** narrow what's on screen without a second search.

Add `getCategories` to `api.ts`, hitting `list.php?c=list` (its response shape is `{ meals: [{ strCategory: string }] }` — yes, `meals`, even though they're categories; APIs are like this sometimes).

Build `src/CategoryFilter.tsx`, a `<select className="category-select">` with an "All categories" default, populated by fetching once on mount.

Then combine it with the search. TheMealDB can't filter by name *and* category in one request — so don't try. Filter the results you already have:

```tsx
const visibleRecipes = (recipes ?? []).filter(
  (recipe) => category === "all" || recipe.category === category
);
```

A **derived value** ([chapter 08](../08-state/notes.md)), computed during render, never stored. Changing the category filters instantly with no network request at all, because the data's already sitting in memory.

**Check it:** search `chicken`, then narrow to `Seafood` — an empty grid, which is correct. Switch to `Chicken` and they're back, instantly, with no request in the Network tab.

## Now compare

You've now built two full apps: a to-do list that owned all its data, and this, where almost nothing is yours. It's worth ten minutes putting `App.tsx` from each side by side.

**What's genuinely harder here:**

- **Nothing is instant.** Every piece of data has a "not yet," a "went wrong," and a "here it is." The to-do app had exactly one state per thing; this has three, and forgetting any one of them produces a page that looks broken.
- **Requests can arrive out of order.** The `ignore` flag exists solely because the network doesn't respect the order you asked in. Nothing in the to-do app could do that.
- **You don't control the data's shape.** `strMeal`, twenty numbered ingredient fields, `null` instead of an empty array — none of that is a design *you'd* have chosen, and `api.ts` exists to stop it spreading.
- **TypeScript can't check the boundary.** `const data: MealDbSearchResponse = await response.json()` is a promise you're making, not one TypeScript verified. If TheMealDB renamed a field tomorrow, your code would compile perfectly and break at runtime. ([Zod](../32-zod/notes.md), in Level 4, is the fix.)

**What's easier than you'd expect:**

- **Composing hooks.** `useDebounce` fed into `useRecipeSearch` in milestone 6 with zero changes to either. Small pieces with clear inputs and outputs snap together.
- **Adding a feature late.** The category filter was one derived value and one `<select>`. The favourite button dropped into a structure built four milestones earlier.
- **`localStorage` becoming invisible.** In the to-do app you routed every change through a manual `updateTasks` helper and hoped you hadn't missed a call site. Here, `useLocalStorage` means saving just *happens*, for any change, from anywhere.

**The thing worth taking forward:** the three-layer split. `api.ts` knowing about JSON, hooks knowing about time, components knowing about pixels. That separation is why milestone 8 was ten minutes' work instead of an afternoon — and it's a pattern that scales far past this app.

## Common mistakes

**1. Letting TheMealDB's field names escape `api.ts`**

```tsx
<h3>{recipe.strMeal}</h3>   // ❌ RecipeCard should never know this name exists
```

If a component needs `strMeal`, then `toRecipe` didn't finish its job. Fix the converter, not the component.

**2. Nesting the favourite button inside the card button**

```tsx
<button className="recipe-card">
  <button className="favorite-button">♥</button>   // ❌ invalid HTML
</button>
```

A `<button>` cannot contain another `<button>`. Browsers do unpredictable things with it and the inner one may not be clickable at all. Use the `<article>` + two sibling buttons structure from milestone 3.

**3. One loading state shared between search and details**

Opening a recipe makes the whole page say "Loading…", including the results that are sitting there fully loaded. Keep the two hooks, and their three states each, entirely separate.

**4. Treating an empty result as an error**

`{ "meals": null }` means "nothing matched," which is a perfectly successful request. `No recipes found.` is the right response; `Something went wrong` is not.

**5. Forgetting `encodeURIComponent`**

Search for `chicken & rice` without it and the `&` silently truncates your query at the URL level. You'll get results — just not for what you typed, which is far more confusing than an outright error.

**6. Skipping the race-condition guard because "it works on my machine"**

It works because your connection is fast. Throttle to Slow 3G in the Network tab, click two cards quickly, and watch the wrong recipe win. Every fetching effect needs the `ignore` flag or an `AbortController`.

**7. Caching whole recipes in `localStorage`**

Only the favourite **ids** belong there. Cache full recipe objects and you've created a second copy of the truth that can silently drift out of date, with no way to tell.

## Quick recap

- Data from a server always has **three** states, not one: loading, error, and the data itself. Every fetch in this project tracks all three.
- Convert someone else's JSON into **your own types** at the boundary, in one file. Nothing downstream should know what their field names were.
- Guard every fetching effect against **out-of-order responses** with the `ignore` flag — the network doesn't respect the order you asked in.
- **Two small, clear hooks beat one clever generic one** at this size. Knowing where that line sits is the real skill.
- Hooks **compose**: `useDebounce` fed straight into `useRecipeSearch` with no changes to either.
- Structure overlapping click targets so they **don't nest** rather than untangling them with `stopPropagation` afterwards.
- Anything you can derive — the category-filtered list — gets computed during render, never stored.

---

**Next:** try the [stretch goals](exercises.md). That's the end of Level 2. [Level 3](../22-context/notes.md) opens with Context, for when passing `onToggleFavourite` down through three layers of props finally stops being worth it.
