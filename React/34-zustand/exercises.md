# 34 Zustand: Exercises

**How to do these:**

- Work in your practice app, one folder per exercise: `src/ch34/ex1/`, and so on. Put each store in its own file, like `src/ch34/ex1/themeStore.ts`.
- Install Zustand first if you haven't: `npm install zustand`.
- Exercises 3 and 4 use chapter 29's books. Copy `29-project-online-bookstore/starter/src/books.ts` into `src/shop/books.ts` if you didn't while reading the notes.
- Keep the Console open. Several exercises ask you to watch which components log a render.
- An exercise is done when it works in the browser, VS Code shows no red squiggles, `npx tsc -b` prints nothing, and the Console has no unexpected errors.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): A theme that remembers

You built a theme with context in [chapter 22](../22-context/notes.md). Now build it with a store, and make it survive a refresh.

1. In `themeStore.ts`, make `useThemeStore` with `theme: "light" | "dark"` and a `toggle` action. Use the `create<T>()(...)` form.
2. A `Header` component with a button that says **Switch to dark** or **Switch to light**, depending on the current theme.
3. A `Page` component that puts the theme on its wrapper as a class (`className={theme}`) and shows `Current theme: dark`. Add a little CSS so the two themes look different.
4. `Header` and `Page` are siblings inside `Ex1`. No props, no provider.
5. Wrap the store in `persist`, with the key `ch34-theme`. Toggle, refresh, and check the theme stayed. Find the saved value in DevTools → **Application** → **Local Storage**.
6. **Break it on purpose:** delete the first `()` from `create<ThemeState>()(...)`. Write down the first line of the error. Put it back.
7. **Break it again:** in DevTools, change the saved value to `not json` and refresh. Does the app crash? What theme do you get? Write down what happened.

Finally, in a comment, compare line counts with your chapter 22 `ThemeContext.ts` and `ThemeProvider.tsx`.

<details>
<summary>Hint 1</summary>

`toggle` depends on the old theme, so use the function form of `set`: `set((state) => ({ theme: ... }))`. And remember `set` merges, so you only return the field you're changing.

</details>

---

## Exercise 2 (Easy): Who re-renders?

The whole point of selectors is fewer re-renders. Prove it to yourself.

1. Make `useCounterStore` with `count`, `step`, `increment` (adds `step` to `count`) and `stepChanged(step: number)`.
2. Build three components, each with a `console.log` naming itself:
   - `CountDisplay` shows the count.
   - `StepDisplay` shows the step.
   - `Controls` has a **+** button and a `<select>` for the step (1, 5, 10). It only selects the two actions.
3. Click **+** three times, then change the step. Fill in a table in a comment: for each action, which components logged?
4. **Break it:** change `CountDisplay` to `const { count } = useCounterStore();` (no selector). Repeat step 3. What changed in your table, and why?
5. **Break it differently:** change `CountDisplay` to select `{ count: state.count, step: state.step }` in one object. Write down the exact error you get. Then fix it with `useShallow`.
6. Record the same clicks with the React DevTools Profiler ([chapter 27](../27-performance/notes.md)) and check it agrees with your table.

<details>
<summary>Hint 1</summary>

For step 3, expect `Controls` to log only once, when it first appears. It selects functions, and the functions in a store never change. That's the same win the separate dispatch context gave you in [chapter 23](../23-use-reducer/notes.md).

</details>

<details>
<summary>Hint 2</summary>

In development, StrictMode may log each render twice ([chapter 12](../12-how-rendering-works/notes.md)). Count the *pairs*, not the lines.

</details>

---

## Exercise 3 (Medium): The bookstore cart, with Zustand

Rebuild [chapter 29](../29-project-online-bookstore/notes.md)'s cart as a store, with exactly the same rules. Work in `src/shop/` in the playground, or in a **copy** of your bookstore app (keep the context version to compare). If you typed the store in while reading the notes, close the notes and write it again from memory first, then compare.

1. `cartStore.ts` with `items`, `promoCode`, and the actions `add`, `remove`, `changeQuantity`, `applyPromo` and `clear`.
2. All five rules live in the store, and nowhere else:
   - adding a book already in the cart adds one to its quantity
   - quantity is capped at 10
   - changing the quantity to 0 or less removes the line
   - only `BOOKS10` is accepted, and a wrong code changes nothing at all
   - clearing empties the items **and** the promo code
3. Selector functions for the item count, subtotal, discount (10% with `BOOKS10`) and total. None of them is stored.
4. A small UI: the first four books with **Add to cart** buttons, a `CartIndicator`, a cart panel with `−` / `+` / remove on each line, a promo code box, and **Clear cart**. The only prop allowed is the `book` passed to each add button.
5. The promo box shows `Code applied` or `That code isn't valid`.
6. Save the items (but not the promo code) with `persist`.
7. In a comment, compare line counts: chapter 29's `cartReducer.ts` plus your provider file, against `cartStore.ts`. Then write one thing you lost by leaving the reducer behind.

<details>
<summary>Hint 1</summary>

For requirement 5: the message is **local UI state**. Only the promo box cares about it, so it's a `useState` in that component, not a field in the store. After calling `applyPromo(code)`, the box can check whether it worked with `useCartStore.getState().promoCode === code`.

</details>

<details>
<summary>Hint 2</summary>

If you find yourself writing `if (item.quantity < 10)` in a component, stop. That's chapter 29's mistake 4, "rules leaking into components". The `+` button should call `changeQuantity(id, item.quantity + 1)` and let the store decide.

</details>

---

## Exercise 4 (Medium): Test every rule

The store is plain functions, so it's as easy to test as chapter 29's reducer. Write `src/shop/cartStore.test.ts` for your store from exercise 3.

1. Reset the store (and `localStorage`) in a `beforeEach`, as in the notes.
2. One test per rule, at least:
   - adding the same book twice gives one line with quantity 2
   - adding a book 11 times stops at 10, and `changeQuantity(id, 15)` also gives 10
   - `changeQuantity` to 0 removes the line, and so does `-1`
   - `BOOKS10` sets the promo code, and a wrong code leaves `getState()` as the **very same object** (`toBe`, not `toEqual`)
   - clearing empties the items and the promo code
3. Tests for the selectors: add two copies of Dune (£9.99), apply `BOOKS10`, and check the subtotal, discount and total.
4. A test proving actions don't mutate: keep a reference to `getState().items`, add a book, and check the old array still has its old length.
5. **Break it on purpose:** comment out the `beforeEach` and run the tests again. Which ones fail? Why those? Put it back.
6. One component test: render your `CartIndicator` and an add button, click the button with `user-event`, and check the count changed ([chapter 28](../28-testing/notes.md)).

<details>
<summary>Hint 1</summary>

Money in floating point is rarely exact: `9.99 * 2 * 0.9` isn't exactly `17.982`. Use `expect(total).toBeCloseTo(17.98, 2)` instead of `toBe`.

</details>

<details>
<summary>Hint 2</summary>

For step 5: the failures depend on test order. A test that expects an empty cart fails if an earlier test left books behind. That's why the reset matters: each test should pass on its own, in any order.

</details>

---

## Exercise 5 (Challenge): Toasts you can call from anywhere

A **toast** is a small message that pops up in a corner ("Book saved", "Couldn't reach the server") and disappears by itself. Any part of the app should be able to show one, even code that isn't a component.

In `src/ch34/ex5/`, build a toast system on top of chapter 30's practice API:

1. `toastStore.ts` with `toasts: Toast[]` (each has an `id`, a `message` and a `kind` of `"success" | "error"`), plus `show(message, kind)` and `dismiss(id)`.
2. A `Toaster` component that shows every toast in a corner, each with a **×** button. Give the list `role="status"` so screen readers announce new toasts ([chapter 38](../38-accessibility/notes.md) explains why).
3. **Show one from outside React.** Add an Axios response interceptor to chapter 30's `api` that shows `Couldn't reach the server` when a request fails. Test it by stopping `npm run api` and loading your reading list. (If you did [chapter 31](../31-tanstack-query/notes.md), also show a success toast from a mutation's `onSuccess`, like after deleting a book.)
4. Each toast **disappears after 4 seconds**. Pressing **×** removes it straight away. Work out what its timer then does 4 seconds later, and make sure that's harmless.
5. At most 3 toasts on screen. A fourth pushes out the oldest. This is a rule, so it lives in the store.
6. In a comment, answer: which of the four homes for state does a list of toasts belong in, and why not `useState` in `Toaster`?
7. **Stretch:** test the timer with Vitest's fake timers: `vi.useFakeTimers()`, call `show`, then `vi.advanceTimersByTime(4000)`, and check the toast is gone. Call `vi.useRealTimers()` afterwards.

<details>
<summary>Hint 1</summary>

Zustand actions are not reducers. A reducer must be pure ([chapter 23](../23-use-reducer/notes.md)), but an action is more like an event handler: it can make an id with `crypto.randomUUID()` or start a timer. Only the function you pass to `set` needs to be pure.

</details>

<details>
<summary>Hint 2</summary>

There are two sensible places for the 4-second timer. **In the store**, `show` starts a `setTimeout` that calls `dismiss`. **In a `ToastItem` component**, an effect starts the timer and its cleanup clears it ([chapter 17](../17-effects/notes.md)). Try one, and write down why you picked it. Think about what happens in each version when a toast is dismissed early, and whether you can still show a toast when no `Toaster` is on the page.

</details>

<details>
<summary>Hint 3</summary>

For requirement 3, the interceptor's error handler must still reject, or the code that made the request will think it succeeded:

```ts
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // show the toast here
    return Promise.reject(error);
  }
);
```

</details>
