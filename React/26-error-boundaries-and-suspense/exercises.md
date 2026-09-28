# 26 Error Boundaries and Suspense: Exercises

**How to do these:**

- Work in your practice app, one folder per exercise: `src/ch26/ex1/`, and so on.
- **Vite's dev overlay will get in your way.** When a component throws, Vite covers the screen with a red error panel *on top of* your boundary's fallback. Press Escape or click its × to dismiss it and see what a user would actually see. If in doubt, run `npm run build && npm run preview` to test without it.
- An exercise is done when the broken part fails gracefully, the rest of the page still works, VS Code shows no red squiggles, and `npx tsc -b` prints nothing.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Watch it go blank, then fix it

In `src/ch26/ex1/`, build a page with three clearly separate sections: a `Header` with a working `useState` counter, a `BrokenWidget`, and a `Footer`.

```tsx
function BrokenWidget() {
  const user = { name: undefined } as { name: string | undefined };
  return <h3>{user.name!.toUpperCase()}</h3>;   // throws
}
```

1. Render all three with **no** error boundary. Dismiss the Vite overlay. What's left on the page? Increment the header counter first, then trigger the crash — what happened to the count?
2. Write the `ErrorBoundary` class from the notes yourself, by hand. Don't copy-paste it; type it out, and make sure you can say what each of the three parts does.
3. Wrap **only** `BrokenWidget` in it. Reload. Confirm the header (with a working counter) and footer are completely unaffected.
4. Now move the boundary to wrap all three. Trigger the crash again. What's the difference, and which version is better here?
5. Add a `componentDidCatch` that logs the error and the component stack. Read the stack in the Console — can you tell which component threw?

<details>
<summary>Hint 1</summary>

For question 1, the answer is "nothing at all" — a completely white page. That's the behaviour this whole chapter exists to prevent, and it's worth seeing once with your own eyes rather than being told about.

</details>

---

## Exercise 2 (Easy): What boundaries don't catch

In `src/ch26/ex2/`, build a page wrapped in your `ErrorBoundary` containing four buttons, each throwing an error a different way:

1. **During render** — a component that throws when a `shouldCrash` state is `true`.
2. **In an event handler** — `onClick={() => { throw new Error("handler"); }}`.
3. **In a `setTimeout`** — `onClick={() => setTimeout(() => { throw new Error("timeout"); }, 100)}`.
4. **In a rejected promise** — `onClick={() => { void Promise.reject(new Error("async")); }}`.

Click each one and record, in a comment: did the boundary catch it? What did the user see? What appeared in the Console?

5. Then fix numbers 2, 3 and 4 so the user gets a proper message rather than nothing — using `try`/`catch` and an `error` piece of state, the way [chapter 18](../18-fetching-data/notes.md) already taught you.
6. Write one sentence explaining the actual rule for what boundaries catch, in your own words.

<details>
<summary>Hint 1</summary>

Only number 1 trips the boundary. That's the whole lesson: boundaries are a render-time safety net, not a general error handler. Your fetching code's `.catch()` and `error` state aren't made redundant by boundaries — they're doing a different job.

</details>

---

## Exercise 3 (Medium): Sectioned boundaries with recovery

In `src/ch26/ex3/`, build a dashboard with four independent panels: `SalesChart`, `RecentOrders`, `Inventory`, and `Notifications`.

1. Give each panel a **Break me** button that sets a state flag causing that panel to throw on its next render.
2. Wrap each panel in its own boundary with a fallback naming that panel: `Couldn't load Recent Orders.`
3. Break two panels. Confirm the other two still work completely normally, including their own state.
4. Extend your `ErrorBoundary` so `fallback` is a function receiving a `reset` callback, and add a **Try again** button to each fallback.
5. Make **Try again** genuinely work: after resetting, the panel should render normally again — which means the panel's "should I crash" flag has to be reset too. Think carefully about where that flag lives and how the boundary can clear it.
6. Add a root-level boundary as well, wrapping the whole dashboard, with a different message. Deliberately throw inside one of your *fallbacks* and confirm the root boundary catches it.

<details>
<summary>Hint 1</summary>

Requirement 5 is the interesting one. If the crash flag lives *inside* the panel, resetting the boundary re-renders the same panel instance with the flag still `true`, so it throws again immediately. Two ways out: lift the flag above the boundary, or give the boundary a `key` that changes on reset so React builds a fresh panel.

</details>

<details>
<summary>Hint 2</summary>

For requirement 6, note what happens: the root boundary catches it, and the *entire dashboard* is replaced by the root fallback. That's why the notes say to keep fallbacks dead simple.

</details>

---

## Exercise 4 (Medium): Code splitting, measured

This exercise is about the build output as much as the page.

In `src/ch26/ex4/`, build a small three-page app with React Router ([chapter 24](../24-react-router/notes.md)): `Home` (tiny), `Reports` (imports a genuinely heavy dependency — install `chart.js` or similar, or simulate it with a file containing a large exported constant array), and `Settings` (tiny).

1. Build it with normal, static imports first. Run `npm run build` and write down the size of the main JS chunk from the output.
2. Convert `Reports` to `lazy(() => import("./Reports.tsx"))`, with a `<Suspense fallback={...}>` above your `<Routes>`.
3. Run `npm run build` again. Write down the new main chunk size, and note the new separate chunk. How much smaller is the initial download?
4. Run `npm run preview`, open the Network tab, and navigate to `/reports`. Watch the extra chunk being fetched at that moment. Throttle to Slow 3G to actually see the Suspense fallback.
5. Convert `Reports` to use a **named** export instead of a default one and see what breaks. Fix it without changing the export back.
6. Wrap the lazy route in an error boundary too, and confirm the nesting order is boundary-outside, Suspense-inside.

<details>
<summary>Hint 1</summary>

For question 5, `lazy` expects a module whose `default` is the component. With a named export you map it yourself:

```tsx
const Reports = lazy(() => import("./Reports.tsx").then((m) => ({ default: m.Reports })));
```

</details>

---

## Exercise 5 (Challenge): Retrofit the Recipe Finder

Go back to your [chapter 21](../21-project-recipe-finder/notes.md) Recipe Finder and make it genuinely robust.

1. Install `react-error-boundary` and use it rather than your hand-written class.
2. Add a boundary around the **results grid**, so a bad recipe card can't take down the search box. Prove it: make `RecipeCard` throw when the recipe's name contains a particular letter, search for something that matches, and confirm you can still type a new search.
3. Add a separate boundary around the **detail modal**, with a fallback offering a **Close** button — so a broken recipe doesn't trap the user behind a modal they can't dismiss.
4. Use `onReset` to actually refetch when the user clicks **Try again**, rather than just clearing the error state and rendering the same broken thing.
5. Code-split the modal: it's only needed once someone clicks a card, so `lazy` it with a `<Suspense>` fallback. Confirm in the Network tab that its chunk isn't downloaded until the first card is clicked.
6. Add a root boundary with a "Reload the app" button as a genuine last resort.

Then answer, in a comment: your fetch error handling from chapter 21 (the `error` state and the message it renders) still exists alongside all of this. Should it? What does each one cover that the other doesn't?

<details>
<summary>Hint 1</summary>

For requirement 3, the fallback needs to be able to close the modal — which means it needs access to the function that clears `selectedId`. `FallbackComponent` receives `resetErrorBoundary`; you can wire `onReset` in the parent to clear `selectedId`, so one click both resets the boundary and closes the modal.

</details>

<details>
<summary>Hint 2</summary>

The closing question matters more than any of the code. The `error` state handles a request that *failed* — the network was down, the server said 500 — which is an expected, ordinary thing your app should handle gracefully and specifically. The boundary handles a *bug* — something threw that you didn't anticipate. Conflating them means either treating bugs as normal or treating a flaky connection as a catastrophe.

</details>
