# 20 Custom Hooks: Exercises

**How to do these:**

- Work in your practice app, one folder per exercise: `src/ch20/ex1/`, and so on. Put each hook in its own file (`useToggle.ts`, `useLocalStorage.ts`, ...), separate from the components that use it.
- For every hook you write, **use it from at least two components at once**, and prove in a comment or a quick test that their state stays independent. That proof is the real exercise — a hook that "seems to work" from one call site can still be sharing state by accident.
- An exercise is done when the behaviour is correct, VS Code shows no red squiggles, `npx tsc -b` prints nothing, and the Console has no errors.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): `useToggle`

Write `useToggle.ts` in `src/ch20/ex1/`:

```ts
function useToggle(initialValue: boolean): [boolean, () => void] {
  // ...
}
```

1. Use it to build a component with **three independent** toggles on one page: a light switch, a "show password" eye icon, and a collapsible FAQ answer. Each must use its own call to `useToggle`.
2. Toggle the light switch several times. Confirm the other two are completely unaffected.
3. Add a `set` function too, so callers can force a specific value rather than only flipping it — change the return type to `[boolean, () => void, (value: boolean) => void]`, and use the new `set` function to build a **Reset all** button that forces the light switch back to its default without touching the other two.

<details>
<summary>Hint 1</summary>

The toggle function should use the updater form, `setValue((prev) => !prev)`, not `setValue(!value)` — the same reasoning as [chapter 08](../08-state/notes.md): if `toggle` is ever called twice in one handler for some reason, the updater form is the one that behaves correctly.

</details>

---

## Exercise 2 (Easy): `useLocalStorage`

Write `useLocalStorage.ts` in `src/ch20/ex2/`, following the notes closely but typing and testing it yourself rather than copying it verbatim.

1. Use it to build **two** independent pieces of persisted state on one page: a `"visited"` boolean (shown as "Welcome back!" vs "Hello, first-timer!") and a `"favouriteColour"` string (a text input, shown live as the page's border colour).
2. Refresh the page. Both should come back exactly as you left them.
3. Open DevTools → Application → Local Storage, and confirm there are genuinely **two separate keys**, each holding correctly-formed JSON — not one shared blob.
4. Deliberately corrupt one of the two stored values by hand in DevTools (edit it to `not valid json`), then refresh. Confirm your hook falls back to the initial value for *that* key without crashing the whole page or affecting the *other* key.

<details>
<summary>Hint 1</summary>

The `try`/`catch` around `JSON.parse` inside the lazy initializer is what saves you in step 4 — same reasoning as the to-do app's milestone 8 in [chapter 10](../10-project-todo-app/notes.md), just living inside the hook now instead of the component.

</details>

---

## Exercise 3 (Medium): Finish the job from chapter 18

Go back to [chapter 18, exercise 4](../18-fetching-data/exercises.md) — the `CategoryList` and `AreaList` components you counted the duplicated lines in. If you didn't do that exercise, quickly rebuild a simplified version of both first (each independently fetching and listing something from TheMealDB), so you have the "before" to compare against.

In `src/ch20/ex3/`:

1. Write `useFetch.ts`, generic, following the notes.
2. Rewrite both `CategoryList` and `AreaList` to use it. Each should shrink to a handful of lines: a call to `useFetch<...>(url)`, and JSX for the three states.
3. Type each component's call to `useFetch` with its own specific response shape — `useFetch<CategoriesResponse>(...)` and `useFetch<AreasResponse>(...)` — and confirm TypeScript correctly infers the shape of `data` differently at each call site.
4. Add a **third**, brand-new component, `IngredientList`, fetching `https://www.themealdb.com/api/json/v1/1/list.php?i=list`, using `useFetch` from the very first line you write it — no duplicated boilerplate at all this time.
5. In a closing comment, compare the total line count of all three components combined against your chapter 18 count for just the first two. Say what you notice.

<details>
<summary>Hint 1</summary>

Each component's whole body should now look almost identical in shape to the `CategoryList` example in the notes — only the URL, the response type, and what's actually rendered in the "success" branch differ.

</details>

---

## Exercise 4 (Medium): `useDebounce`

Write `useDebounce.ts` in `src/ch20/ex4/` — a hook that takes a fast-changing value and a delay, and returns a version of that value that only updates once changes have paused for that long:

```ts
function useDebounce<T>(value: T, delayMs: number): T {
  // ...
}
```

1. Use it to rebuild the debounced search box from [chapter 18, exercise 2](../18-fetching-data/exercises.md) — but this time, the component's own code should have **no `setTimeout` or `clearTimeout` anywhere in it**. It calls `useDebounce(query, 400)` and fetches using the debounced value, full stop.
2. Prove it's genuinely generic: use the same hook on a **number** slider elsewhere on the page, showing both the live value (`Dragging: 73`) and the debounced one (`Settled: 73`, updating only once you stop dragging for 400ms).
3. Type the whole thing properly — no `any`.

<details>
<summary>Hint 1</summary>

Inside the hook: a `useState` holding the debounced value, and a `useEffect` keyed on `[value, delayMs]` that sets a timeout to update it, with a cleanup that clears that timeout — nearly identical machinery to the timer exercise in [chapter 17](../17-effects/exercises.md), just wrapped up and made generic.

</details>

---

## Exercise 5 (Challenge): `useOnlineStatus` and `useWindowWidth`, composed into a real feature

These two hooks subscribe to something genuinely outside React — the browser's own `online`/`offline` events, and the window's resize event — which means real listeners, real cleanup, and no fetch involved at all.

In `src/ch20/ex5/`:

**`useOnlineStatus.ts`**: returns a `boolean`, `true` when the browser is online. Uses `navigator.onLine` for the initial value, and listens for the browser's `online` and `offline` events on `window` to keep it updated, with proper cleanup.

**`useWindowWidth.ts`**: returns the current `window.innerWidth` as a `number`, updated live as the window is resized, listening for the `resize` event on `window`, with proper cleanup.

Then build `Ex5.tsx`, a small dashboard combining both:

1. A banner reading `You're offline — some features may not work.` shown only when `useOnlineStatus()` is `false`. Test it for real: open DevTools → Network tab → set throttling to **Offline**, and confirm the banner appears without a page refresh. Switch back to **No throttling** and confirm it disappears, live.
2. A layout that switches from a single column to a two-column grid once `useWindowWidth()` crosses 640px, using inline styles driven directly by the hook's return value (not Tailwind or CSS Modules — the point here is the hook, not the styling tool). Resize your actual browser window and watch it happen without a refresh.
3. Both hooks must properly remove their listeners — prove it by rendering `Ex5` conditionally from a parent (a **Hide dashboard** button that unmounts it), resizing the window or toggling offline mode *after* hiding it, and confirming (via a `console.log` in each cleanup) that nothing fires for an unmounted component.

<details>
<summary>Hint 1</summary>

Both hooks share a shape: `useState` for the current value, and a `useEffect` with an empty dependency array that adds a listener on mount and removes the exact same listener function in its cleanup. The listener function needs to be defined once (not inline as a fresh arrow function each render) so that the function you remove in cleanup is really the same one you added.

</details>

<details>
<summary>Hint 2</summary>

For requirement 3, remember from [chapter 17](../17-effects/notes.md) that cleanup runs when a component unmounts, no differently from when a dependency changes — hiding `Ex5` via conditional rendering is exactly the situation cleanup exists to handle.

</details>
