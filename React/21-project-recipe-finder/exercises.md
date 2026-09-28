# 21 Project: Recipe Finder: Exercises

These are **stretch goals**: extra features for your finished app. Do them in any order, and do as many as you like.

**How to do these:**

- Finish all 8 milestones first. Then commit your work, or copy the `recipe-finder` folder, so you've always got a working version to go back to.
- `index.css` already has styles for these goals. Look for "Styles for the stretch goals" near the bottom.
- Keep the Network tab open — several of these are about *when* requests fire, not just what ends up on screen.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Recent searches

Add a row of small buttons under the search box showing your last few searches. Clicking one runs that search again.

1. Keep them in a **third** `useLocalStorage` entry, so they survive a refresh.
2. Cap the list at 5, most recent first.
3. No duplicates — searching something you've searched before moves it to the front rather than adding a second copy.
4. Only record a search once it's actually produced results, not on every keystroke. (Think about where in your app you can tell the difference.)

**What you should see:** search for three different things, refresh the page, and they're all still listed and clickable.

<details>
<summary>Hint 1</summary>

For requirements 2 and 3 together, in one expression:

```tsx
setRecent((prev) => [term, ...prev.filter((t) => t !== term)].slice(0, 5));
```

Filter the term out of wherever it was, put it on the front, then trim. All new arrays, nothing mutated — [chapter 11](../11-updating-objects-and-arrays/notes.md).

</details>

<details>
<summary>Hint 2</summary>

For requirement 4, your search hook already knows when a request has succeeded and what it returned. An effect in `App.tsx` watching `recipes` is one way; returning the successful term from the hook is another. Try the one that means `App.tsx` doesn't need to know *when* a fetch finished.

</details>

---

## Exercise 2 (Easy): Loading skeletons

Replace the plain "Loading…" text with **skeleton cards**: grey, gently pulsing rectangles in the shape of a real card.

1. Build a `SkeletonCard.tsx` using the `skeleton` class the stylesheet already provides (the pulse animation is built in).
2. Show six of them in the grid while a search is loading.
3. Keep the grid's layout identical, so there's no jump when real cards replace the skeletons.

**What you should see:** search for something with the Network tab throttled to Slow 3G. Instead of text, then a sudden full grid, the grid's shape appears immediately and fills in.

<details>
<summary>Hint 1</summary>

`Array.from({ length: 6 })` gives you six items to map over. You'll need a `key` — this is one of the rare, genuinely legitimate uses of the array index for one, since the list is a fixed length, never reordered, and the items have no identity or state of their own ([chapter 06](../06-rendering-lists/notes.md)).

</details>

---

## Exercise 3 (Medium): Recipe of the day, cached for the day

Add a **Recipe of the Day** section above the search results, showing one random recipe (`random.php`) — fetched **once per day**, not once per visit.

1. Cache the recipe **and** the date it was fetched, together, in one `useLocalStorage` entry.
2. On load, compare the cached date with today's. Same day → use the cache, fetch nothing at all. Different day, or nothing cached → fetch a fresh one and store it with today's date.
3. Add a **Shuffle** button that always fetches a new one regardless of the date, so the daily cache is a default rather than a restriction.

**What you should see:** refresh five times and the recipe stays the same, with no request in the Network tab after the first. Click Shuffle and it changes immediately.

<details>
<summary>Hint 1</summary>

`new Date().toISOString().slice(0, 10)` gives a `YYYY-MM-DD` string, which compares correctly with `===`.

Store `{ recipe, fetchedOn }` as **one** cached object rather than two separate `useLocalStorage` calls — two entries can drift out of sync with each other; one can't.

</details>

<details>
<summary>Hint 2</summary>

To test the "next day" path without waiting, edit the stored `fetchedOn` by hand in DevTools → Application → Local Storage, set it to yesterday, and refresh.

</details>

---

## Exercise 4 (Medium): Full keyboard support

Make the app completely usable without a mouse.

1. Tab through the grid. Every card should be reachable, and Enter or Space should open it. (If you built milestone 3 with a real `<button>`, this already works — verify it rather than assuming.)
2. Pressing **Escape** while the modal is open closes it.
3. When the modal opens, focus moves **into** it — onto the close button — so a keyboard user isn't stranded behind an overlay they can't reach.
4. When the modal closes, focus returns to **the card that opened it**, not to the top of the page. Tabbing should carry on from where you were.

Requirement 4 is the interesting one, and it's a genuine, non-toy use of [chapter 19](../19-refs/notes.md).

<details>
<summary>Hint 1</summary>

For requirement 4, you need to remember *which element* was clicked, across the whole time the modal is open. That's a value that must survive re-renders but should never cause one — the definition of a ref.

Store the clicked button's DOM node in a ref at the moment a card is selected, then call `.focus()` on it after the modal closes.

</details>

<details>
<summary>Hint 2</summary>

For requirement 2, a `keydown` listener on `window` inside an effect, checking `event.key === "Escape"` — with cleanup that removes the listener, [chapter 17](../17-effects/notes.md). Only add the listener while the modal is actually open.

</details>

---

## Exercise 5 (Challenge): Favourites that work offline

Right now the favourites view fetches every favourite's details fresh, so with no connection it shows nothing but an error. Fix that properly.

1. Whenever a recipe's full details are successfully fetched — from a search, the detail modal, or Recipe of the Day — cache those details in `localStorage`, keyed by id, **if that recipe is currently favourited**.
2. Un-favouriting a recipe removes its cached details too, so unfavourited data doesn't pile up forever.
3. The favourites view reads the cache **first**, and only fetches ids it has nothing cached for. Anything it does fetch gets cached on the way through.
4. Add a **Surprise me** button, shown only when you have at least one favourite, that opens a random favourite's details — reusing your existing detail view, not a new code path.

**Prove it works:** favourite three recipes and open each one once. Then set the Network tab to **Offline** and switch to the favourites view. All three should still be there, fully readable, with no errors.

<details>
<summary>Hint 1</summary>

The cache is a second `useLocalStorage`, holding a lookup object rather than an array:

```tsx
const [cache, setCache] = useLocalStorage<Record<string, RecipeDetails>>("recipe-finder-cache", {});
```

Keeping "which ids are favourited" and "what do I know about each one" as two separate entries is deliberate — it's much closer to how a real cache layer is built, and it means clearing one never corrupts the other.

</details>

<details>
<summary>Hint 2</summary>

For requirement 2, building a new object **without** one key is the object version of `filter`. Destructuring with rest does it in one line ([JavaScript chapter 15](../../JavaScript/15-destructuring-spread-rest/notes.md)):

```tsx
setCache((prev) => {
  const { [id]: _removed, ...rest } = prev;
  return rest;
});
```

</details>

<details>
<summary>Hint 3</summary>

For requirement 3, split the favourite ids into "already cached" and "needs fetching" before you do anything. If the second list is empty, don't call the network at all — that's what makes it work offline.

</details>

---

## When you're done

That's the end of Level 2. Before moving on, it's worth writing down:

- One thing that was much harder here than in the to-do app, and why.
- One place where a hook you wrote in an earlier chapter dropped in with no changes at all.
- One thing you still don't feel sure about.

Bring that last one to Claude and ask.
