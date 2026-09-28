# 18 Fetching Data

## What is it?

Fetching data means calling a server for information and showing it on the page. In React, that's `fetch` (from [JavaScript chapter 33](../../JavaScript/33-fetch-and-apis/notes.md)) wrapped in an effect, with three pieces of state tracking what's happening: **loading**, **error**, and **data**.

```tsx
const [recipes, setRecipes] = useState<Recipe[] | null>(null);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
```

Nothing here is a new tool. This chapter is about combining `useState`, `useEffect`, and `fetch` into the one shape you'll write in almost every real app you build.

## Why does it matter?

Every app you've built in this course used data that was already sitting in a file, ready the instant the page loaded. Real apps don't work that way. Data lives on a server, on the other side of a network request that takes time, and can fail. Three things become unavoidable the moment data comes from outside your app:

- **It isn't there yet.** For a moment — sometimes a long moment on a slow connection — there's nothing to show. The page needs to say so, not just look broken.
- **It might never arrive.** The network drops, the server is down, the search matches nothing. The page needs to say that too, clearly, not silently show stale or empty content.
- **TypeScript can't see the server.** `response.json()` returns `any` by default. The type safety you've relied on since [chapter 04](../04-props/notes.md) has to be re-established by hand, at the boundary where the data enters your app.

Get the shape of this right once, and you'll reuse it for the rest of your React career — every search box, every profile page, every dashboard. This is also the chapter where the [Recipe Finder project](../21-project-recipe-finder/notes.md) starts to become possible.

## Real-world example

Think about **ordering food for delivery**.

| Ordering delivery | Fetching data |
|---|---|
| You place the order | The `fetch` call starts |
| "Your order is being prepared" | The loading state |
| The food arrives | `data` is set, loading ends |
| "Sorry, the restaurant is closed" | The error state |
| You cancel the order because you changed your mind | Cleanup cancels a request no longer needed |
| You can't eat before the food exists | You can't show data before it's arrived |

A delivery app that shows nothing while you wait, with no "on its way" message, feels broken even when it isn't. The waiting and the possibility of failure are part of the experience, not an inconvenience to hide.

## How it works

### The three states, together

```tsx
type Recipe = {
  id: string;
  name: string;
  thumbnail: string;
};

function RecipeSearch({ query }: { query: string }) {
  const [recipes, setRecipes] = useState<Recipe[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query === "") {
      setRecipes(null);
      return;
    }

    let ignore = false;
    setIsLoading(true);
    setError(null);

    fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (!ignore) {
          setRecipes(data.meals ?? []);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Something went wrong");
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [query]);

  if (isLoading) return <p>Searching...</p>;
  if (error) return <p>Something went wrong: {error}</p>;
  if (recipes === null) return <p>Type something to search.</p>;
  if (recipes.length === 0) return <p>No recipes found.</p>;

  return (
    <ul>
      {recipes.map((recipe) => (
        <li key={recipe.id}>{recipe.name}</li>
      ))}
    </ul>
  );
}
```

That's a lot in one place, so walk through it slowly. It's the [chapter 05](../05-conditional-rendering/notes.md) "four states" pattern, one effect, and the race-condition guard from [chapter 17](../17-effects/notes.md), all working together.

### Loading, error, data: why three, not one

It's tempting to reach for just one state — the data, `null` until it arrives — and skip the rest. Don't. Each of the three answers a question the others can't:

- **`isLoading`**: is a request in flight *right now*? Without it, there's no way to show a spinner or "Searching..." message.
- **`error`**: did the *last* request fail? Without it, a failed request just looks identical to "no results yet" — silently wrong, not obviously broken.
- **`recipes`**: what's the actual data, once it exists? `null` specifically means "nothing loaded yet," which is different from an empty array, which means "loaded, and there's genuinely nothing to show" ([chapter 05](../05-conditional-rendering/notes.md)'s empty-state lesson, back again).

Three separate booleans-and-values, not one combined value, because a request can be simultaneously "not loading" and "has neither data nor an error" (before the first search), and your JSX needs to tell all of these apart.

### `fetch` doesn't reject on a 404 or a 500

This trips people up the first time. `fetch`'s promise only rejects on a genuine network failure — no connection, DNS failure, that kind of thing. A `404 Not Found` or a `500 Internal Server Error` still counts as "the request succeeded," as far as `fetch` is concerned; the server *did* answer, it just answered with bad news. You have to check `response.ok` yourself and throw if it's `false`:

```tsx
if (!response.ok) {
  throw new Error(`Request failed: ${response.status}`);
}
```

Skip this, and a page that's genuinely down for maintenance will look like it "loaded successfully" with whatever garbage error page the server sent back as if it were real data.

### Typing what comes back

`response.json()` returns `Promise<any>`, which means everything downstream of it is silently unchecked unless you do something about it. [TypeScript chapter 13](../../TypeScript/13-async-and-apis/notes.md) covered this in depth; here's the version you'll use constantly in React.

**Describe the shape you expect**, based on the API's real response — check its documentation, or just log one response and look:

```ts
type MealDbResponse = {
  meals: null | Array<{
    idMeal: string;
    strMeal: string;
    strMealThumb: string;
  }>;
};
```

**Assert it at the one place data enters your app**, and convert into your own, cleaner shape immediately:

```tsx
.then((data: MealDbResponse) => {
  const found: Recipe[] = (data.meals ?? []).map((meal) => ({
    id: meal.idMeal,
    name: meal.strMeal,
    thumbnail: meal.strMealThumb,
  }));
  setRecipes(found);
})
```

Two things worth noticing:

- **`data: MealDbResponse` is a promise, not a proof.** TypeScript trusts you here; it can't actually check the server sent what you said it would. If the API changes a field name, your code will still compile and then break at runtime. This is exactly what [Zod](../32-zod/notes.md), in Level 4, is for — checking, not just asserting.
- **Converting to your own `Recipe` type immediately** means the ugly, third-party field names (`idMeal`, `strMeal`) only ever exist in this one function. The rest of your app works with a clean shape you control. This is worth doing even when it feels like extra typing — it's the boundary between "their API" and "your app," and it's much easier to change one function than every component that used raw API field names directly.

### `.then()` chains vs `async`/`await`

Everything above works exactly the same written with `async`/`await` ([JavaScript chapter 32](../../JavaScript/32-async-await/notes.md)), which most real React code prefers for its readability:

```tsx
useEffect(() => {
  let ignore = false;

  async function loadRecipes() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }
      const data: MealDbResponse = await response.json();
      if (!ignore) {
        setRecipes((data.meals ?? []).map(toRecipe));
      }
    } catch (err) {
      if (!ignore) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    } finally {
      if (!ignore) {
        setIsLoading(false);
      }
    }
  }

  loadRecipes();

  return () => {
    ignore = true;
  };
}, [query]);
```

**The effect's function itself can't be `async` directly** — `useEffect(async () => { ... }, [])` is a type error, because an effect's function is meant to optionally *return* a cleanup function, and an `async` function always returns a `Promise` instead. The fix is what you see above: define an `async` helper function inside the effect, and call it.

Both versions do exactly the same thing. `async`/`await` tends to read more like a normal sequence of steps, especially once there's a `try`/`catch`/`finally` involved; `.then()` chains can get harder to follow as they grow. Use whichever your team prefers — you'll meet both in real code, so it's worth being able to read either.

### Cancelling a request outright: `AbortController`

The `ignore` flag from [chapter 17](../17-effects/notes.md) stops a stale response from being *used*, but the request itself still finishes in the background — wasted work, especially for something big or slow. `AbortController` cancels the request itself:

```tsx
useEffect(() => {
  const controller = new AbortController();

  async function loadRecipes() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`.../search.php?s=${query}`, {
        signal: controller.signal,
      });
      const data: MealDbResponse = await response.json();
      setRecipes((data.meals ?? []).map(toRecipe));
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;   // the request was cancelled on purpose — not a real error
      }
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  loadRecipes();

  return () => {
    controller.abort();
  };
}, [query]);
```

Notice there's no `ignore` flag needed any more — once a request is aborted, it rejects with an `AbortError`, which the `catch` block deliberately recognises and ignores rather than showing as a real error to the user. `AbortController` is the more "correct" tool when the underlying request is genuinely wasteful to let finish (a large search, an expensive server computation). The `ignore` flag is simpler and completely sufficient when the request itself is cheap. Both are legitimate; know both, and reach for whichever fits.

### Refetching when something else changes

The dependency array is doing real work here: add another value your fetch depends on, and it refetches automatically whenever that changes too.

```tsx
useEffect(() => {
  // ...fetch using both `query` and `category`...
}, [query, category]);
```

Change either `query` or `category`, and React reruns the effect: cleanup for the old request, then a fresh one with the new values. You don't write any code that says "and also refetch when the category changes" — it falls out of the dependency array automatically, which is exactly the value effects add over doing this by hand in an event handler.

### Debouncing a search-as-you-type box

Firing a request on every keystroke is wasteful and can itself cause races. A small delay, "wait until typing pauses," is called **debouncing** ([JavaScript chapter 34](../../JavaScript/34-debounce-and-throttle/notes.md)), and it composes naturally with the cleanup you already have:

```tsx
useEffect(() => {
  if (query === "") return;

  const timeoutId = setTimeout(() => {
    // ...the actual fetch goes here...
  }, 400);

  return () => {
    clearTimeout(timeoutId);
  };
}, [query]);
```

Every keystroke schedules a fetch 400ms in the future, and cleanup cancels the *previous* one before it fires — so only the fetch after the last keystroke in a burst ever actually runs. It's the identical cleanup mechanism from the timer example in [chapter 17](../17-effects/notes.md), just applied to a fetch instead of an interval.

### An honest preview of what's coming

This whole chapter — `isLoading`, `error`, the `ignore` flag, `AbortController`, debouncing — is real, correct, useful code, and it's worth knowing properly, the way you're taught long division before a calculator. But writing all of it by hand, for every single piece of data your app needs, gets old fast, and it's easy to get subtly wrong under pressure. [TanStack Query](../31-tanstack-query/notes.md), in Level 4, does everything in this chapter for you — loading states, error handling, race conditions, caching, refetching — in a few lines. Learning the manual version first means you'll actually understand what that library is doing, instead of it feeling like magic.

## Common mistakes

**1. Only tracking the data, with no loading or error state**

The page looks broken while waiting, and looks broken (or silently wrong) when a request fails, with no way to tell the two apart from "hasn't searched yet." Track all three.

**2. Not checking `response.ok`**

```tsx
const data = await response.json();   // "succeeds" even on a 404 or 500
```

`fetch` only rejects on network failure. Check `response.ok` and `throw` yourself for HTTP error statuses.

**3. Calling `setState` after the component might have moved on**

Without an `ignore` flag or `AbortController`, a slow, now-irrelevant response can still call `setState` and overwrite something newer. This is the race condition from [chapter 17](../17-effects/notes.md) — it applies just as much here.

**4. Trusting `response.json()`'s type completely**

```tsx
const data = await response.json();
console.log(data.recipes[0].name);   // any, any, any — no checking, no warning if it's wrong
```

Give the response a real type the moment it arrives, and convert to your own shape immediately, so the untyped part of your code is as small as possible.

**5. Making the effect's function itself `async`**

```tsx
useEffect(async () => { ... }, []);
// ❌ Type 'Promise<void>' is not assignable to type 'void | Destructor'.
```

Define an `async` function inside the effect and call it; don't make the effect's own callback `async`.

**6. Forgetting `finally` for `isLoading`**

```tsx
try {
  setIsLoading(true);
  // ...
  setIsLoading(false);   // ❌ never runs if the fetch throws
} catch { ... }
```

Set `isLoading` back to `false` in a `finally` block, so it happens whether the request succeeded or failed.

**7. Refetching on every keystroke with no debounce**

Works, but it's wasteful and can flood a slow server or hit a rate limit, especially combined with a race condition that isn't properly guarded. A short debounce delay costs very little code and meaningfully improves both.

## Quick recap

- Fetching data in React is `fetch` (or `async`/`await`) inside a `useEffect`, tracked with **three** pieces of state: `isLoading`, `error`, and the data itself.
- `fetch` only rejects on a network failure — check `response.ok` yourself and `throw` for HTTP error statuses.
- Type the response at the boundary where it enters your app, and convert it into your own clean shape immediately. TypeScript trusts an assertion; it doesn't verify one.
- Guard against race conditions with the `ignore` flag from [chapter 17](../17-effects/notes.md), or cancel the request outright with `AbortController`.
- Add every value your fetch depends on to the dependency array, and refetching on a change falls out automatically.
- Debouncing delays a fetch until typing pauses, reusing the same cleanup mechanism as a timer.
- This manual pattern is worth knowing well — and it's also exactly what [TanStack Query](../31-tanstack-query/notes.md) exists to do for you later.

---

**Next:** try the [exercises](exercises.md), then move on to [19 Refs](../19-refs/notes.md).
