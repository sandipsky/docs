# 18 Fetching Data: Exercises

**How to do these:**

- Work in your practice app, one folder per exercise: `src/ch18/ex1/`, and so on.
- Several of these use a real, free API: [TheMealDB](https://www.themealdb.com/api.php), which needs no account and no API key for the endpoints used here (they use the shared test key `1`, built into the example URLs).
- Keep the **Network** tab open in DevTools (`F12`) alongside the Console. It's the best way to actually see requests firing, being cancelled, and coming back.
- Turn on **Network throttling** (in the Network tab, usually a dropdown near the top, set to "Slow 3G" or similar) for exercises 3 and 4 — race conditions are hard to trigger on a fast connection and obvious on a slow one.
- An exercise is done when loading, error, and success states all behave correctly, VS Code shows no red squiggles, `npx tsc -b` prints nothing, and the Console has no unexpected errors.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Your first fetch, all three states

In `src/ch18/ex1/Ex1.tsx`, build a component that fetches a random meal from `https://www.themealdb.com/api/json/v1/1/random.php` when a **Surprise me!** button is clicked, and shows its name and a thumbnail image.

1. Track `isLoading`, `error`, and `meal` as three separate pieces of state.
2. Type the response shape yourself, based on what the API actually sends back (log the raw JSON once and look, or check the API's docs).
3. Show `Loading...` while waiting, the meal once it arrives, and a clear error message if the request fails.
4. **Test the error path for real**, not just in your head: temporarily change the URL to something broken (a typo in the domain) and confirm your error message shows up correctly. Put the URL back afterwards.
5. Click the button five times quickly in a row. Does the page ever flash the *previous* meal while loading the next one? If it does, is that a bug, or is it fine? Write your answer as a comment, with your reasoning — there's a defensible case either way, and the point is thinking it through, not landing on one specific answer.

<details>
<summary>Hint 1</summary>

The response from `random.php` has the shape `{ meals: [{ idMeal, strMeal, strMealThumb, ... }] }` — an array with exactly one item, not a single object directly. Don't skip actually looking at a real response; guessing the shape and getting it slightly wrong is a very true-to-life mistake.

</details>

---

## Exercise 2 (Easy): Search as you type, with debounce

In `src/ch18/ex2/Ex2.tsx`, build a search box that queries `https://www.themealdb.com/api/json/v1/1/search.php?s=<your text>` and shows a list of matching meal names as you type.

1. First, build it **without** debouncing — a fetch on every keystroke. Open the Network tab and type a full word slowly. Count how many requests fired for one word.
2. Add a 400ms debounce, using the pattern from the notes. Type the same word again and count requests — it should now be close to one, not one per letter.
3. Handle the "no matches" case: TheMealDB returns `{ meals: null }`, not an empty array, when nothing matches — make sure your code treats that as an empty list, not a crash.
4. Clearing the box back to empty should show neither a loading state nor an error — just a neutral "type something to search" message.

<details>
<summary>Hint 1</summary>

`data.meals ?? []` turns `null` into an empty array in one step — the same nullish-coalescing tool from [chapter 05](../05-conditional-rendering/notes.md), doing real work here.

</details>

---

## Exercise 3 (Medium): Catch your own race condition

Build this with **network throttling turned on** (Slow 3G), so the race condition is easy to trigger reliably.

In `src/ch18/ex3/Ex3.tsx`, build a component with three buttons, one per category: **Beef**, **Chicken**, **Seafood**. Clicking one fetches `https://www.themealdb.com/api/json/v1/1/filter.php?c=<category>` and shows the resulting list of meal names.

1. Build it **without** any race-condition guard first.
2. With throttling on, click **Beef**, then click **Seafood** almost immediately after (within a second). Watch what ends up on screen once both requests have finished. Is it the category you *last* clicked, or something else? Try it a few times — race conditions aren't always reproducible on the first try.
3. Fix it with the `ignore` flag pattern.
4. Repeat the rapid double-click test several times. Confirm the page always ends up showing the last category you clicked, no matter how the timing lands.
5. As a second fix, rebuild it using `AbortController` instead of the `ignore` flag. Confirm it also works. In a comment, note one thing that's different about how the two approaches behave (hint: check the Network tab's status column for the earlier, superseded request in each version).

<details>
<summary>Hint 1</summary>

This is deliberately the same shape as the `UserProfile` example in [chapter 17](../17-effects/notes.md) — a fetch inside an effect, keyed on a piece of state that can change again before the first request finishes.

</details>

<details>
<summary>Hint 2</summary>

For question 5: with `AbortController`, the Network tab shows the first (now-unwanted) request's status as "(cancelled)" almost immediately after the second one starts. With the `ignore` flag alone, that first request keeps running to completion in the background — it just gets ignored once it arrives. Same visible result on screen, different amount of wasted work underneath.

</details>

---

## Exercise 4 (Medium): A tiny reusable fetch pattern, without the hook

Before custom hooks ([chapter 20](../20-custom-hooks/notes.md)) give you a cleaner way to package this up, get comfortable with the repetition by writing it out fully, twice, by hand.

In `src/ch18/ex4/`, build **two** separate components that each independently fetch and display something from TheMealDB:

- `CategoryList`: fetches `https://www.themealdb.com/api/json/v1/1/categories.php` once, on mount, and shows the list of category names.
- `AreaList`: fetches `https://www.themealdb.com/api/json/v1/1/list.php?a=list` once, on mount, and shows the list of cuisine areas (Italian, Mexican, and so on).

Requirements:

1. Both components independently track their own `isLoading`, `error`, and `data` — no props passed between them, no shared state.
2. Both correctly type their own response shape (the two APIs return meaningfully different JSON shapes — look at each one).
3. Render both inside `Ex4.tsx`, side by side. Confirm in the Network tab that they fire **two separate, independent** requests, and that one being slow (throttle again if you like) doesn't hold up the other's loading state.
4. Once both are working, count the lines of near-identical `isLoading`/`error`/`useEffect` boilerplate across the two files. Write the number in a comment. You'll come back to this exact pair of components in [chapter 20](../20-custom-hooks/notes.md) and cut that number down to almost nothing.

<details>
<summary>Hint 1</summary>

Resist the urge to make these share a component or a helper function yet — the whole point of this exercise is to feel the repetition honestly, so that the fix in chapter 20 feels earned rather than arbitrary.

</details>

---

## Exercise 5 (Challenge): Fetch that depends on another fetch

A genuinely common real-world shape: you can't make the second request until the first one tells you what to ask for.

In `src/ch18/ex5/Ex5.tsx`, build a two-step picker:

1. A `<select>` populated from `https://www.themealdb.com/api/json/v1/1/list.php?c=list` (the list of categories), fetched once on mount.
2. Once a category is chosen, a **second** fetch to `https://www.themealdb.com/api/json/v1/1/filter.php?c=<chosen category>`, showing that category's meals as a list of names with thumbnails.
3. Changing the selected category must correctly cancel or ignore any in-flight request for the *previous* category (reuse your race-condition fix from Exercise 3).
4. The two fetches need **two separate** loading and error states — the category dropdown shouldn't show "Loading..." while a meal list is being fetched, and vice versa. Get this wrong on purpose first (share one `isLoading` between both) and see how confusing the UI becomes before you split them apart properly.
5. If someone picks a category, then picks "-- choose a category --" again (add that as the default option), the meal list should clear back to nothing — not keep showing the last category's results.

<details>
<summary>Hint 1</summary>

This needs **two separate `useEffect` calls**: one with an empty dependency array (or none needed at all, if you fetch categories once at the very top) for the category list, and a second depending on the selected category for the meal list. Keeping them separate is exactly what makes requirement 4 straightforward — trying to force one effect to do both jobs is what makes it hard.

</details>

<details>
<summary>Hint 2</summary>

For requirement 5, an early return at the top of the second effect — if the selected category is the empty/default value, clear the meal list and skip fetching entirely — handles it cleanly, the same shape as the empty-query guard in the chapter's main example.

</details>
