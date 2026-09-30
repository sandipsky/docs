# 35 Redux Toolkit: Exercises

**How to do these:**

- Work in your practice app, one folder per exercise: `src/ch35/ex1/`, and so on. Give each exercise its own slice, store and `hooks.ts` files.
- Install the libraries first if you haven't: `npm install @reduxjs/toolkit react-redux`.
- Install the **Redux DevTools** extension for Chrome or Edge, and keep its **Redux** tab open while you work.
- To keep exercises separate, wrap each `ExN` component's content in its own `<Provider store={store}>`, instead of changing `main.tsx`.
- Exercises 3 to 5 use chapter 29's books in `src/shop/books.ts`, as in [chapter 34](../34-zustand/exercises.md).
- An exercise is done when it works in the browser, VS Code shows no red squiggles, `npx tsc -b` prints nothing, and the Console has no unexpected errors.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): A counter, in slow motion

Learn the parts of Redux on something tiny, and watch every step in the DevTools.

1. `counterSlice.ts` with state `{ count: number; step: number }` and four reducers: `incremented`, `decremented` (never below 0), `stepChanged` (carries the new step) and `reset`.
2. `store.ts` with `configureStore`, plus the `RootState` and `AppDispatch` types. `hooks.ts` with `useAppSelector` and `useAppDispatch`.
3. `Ex1` shows the count and step, with **+**, **−**, a step `<select>` (1, 5, 10) and **Reset**.
4. Click around, then in the Redux tab find: the full list of actions, the payload of a `counter/stepChanged` action, and the **Diff** for a `counter/incremented`.
5. **Time travel:** click **Jump** on an action from a few steps back. What happens to the page? Now try **Skip** on one `counter/incremented`. Write down, in a comment, what each button did.
6. **Break it on purpose:** write `incremented: (state) => state.count++` as a one-liner. What does TypeScript say, and why? Put it back.

<details>
<summary>Hint 1</summary>

`decremented` can "change" the draft directly, with `Math.max` keeping it at 0 or above. For `reset`, returning a fresh starting state is the simplest way. Either change the draft or return a new state, never both.

</details>

<details>
<summary>Hint 2</summary>

For step 6: what does `state.count++` give back? And what does an arrow function without curly braces return? Mistake 3 in the notes is about the same thing.

</details>

---

## Exercise 2 (Easy): From `useReducer` to a slice

Take the task reducer you wrote in [chapter 23](../23-use-reducer/notes.md) (exercise 5, or the `taskReducer` in the notes) and turn it into a slice. The app's behaviour must stay exactly the same.

1. Copy the old reducer file into `src/ch35/ex2/` for comparison. Then write `tasksSlice.ts` with the same actions, in camelCase: `added`, `toggled`, `deleted`, `clearedCompleted`, `filterChanged`, plus any editing actions you had.
2. Keep every rule, like "deleting the task being edited also ends the edit". Rules still live in the reducers, not in components.
3. Keep making the id **before** dispatching, and pass it in the payload, like in chapter 23. A reducer is still a pure function, even with Immer.
4. Swap the component's `useReducer` for `useAppSelector` and `useAppDispatch`. Nothing else in the component should need to change much.
5. In a comment, compare the two files: which cases got shorter? Did any get longer? What happened to the `never` exhaustiveness check, and why don't you need it any more?

<details>
<summary>Hint 1</summary>

For the last question: in chapter 23, you typed out `{ type: "toggled", id }` yourself, so a union type was needed to catch typos. Now you call `toggled(id)`, a function RTK made for you. What happens if you misspell a function name when you import or call it?

</details>

<details>
<summary>Hint 2</summary>

Curious how RTK projects usually make ids? Look up the `prepare` callback in the `createSlice` docs. It's optional here; passing the id in the payload is perfectly fine.

</details>

---

## Exercise 3 (Medium): The bookstore cart, the Redux way

Build chapter 29's cart one more time, as a slice, so you can compare all three versions. Write the slice from memory first, without the notes open. Then check it against them.

1. `cartSlice.ts` with `added`, `removed`, `quantityChanged`, `promoApplied` and `cleared`, and the same five rules as [chapter 34's exercise 3](../34-zustand/exercises.md): add again means +1, a cap of 10, 0 or less removes, only `BOOKS10`, and clearing clears the promo too.
2. `store.ts`, `hooks.ts`, and a `<Provider>` around `Ex3`.
3. The same UI as chapter 34's exercise 3: four books, a `CartIndicator`, a cart panel with `−` / `+` / remove, a promo box, and **Clear cart**. Copy your components and swap only the hooks.
4. The promo box shows `Code applied` or `That code isn't valid`, without the component knowing what the right code is.
5. In the DevTools, apply a wrong code. Find its `cart/promoApplied` action and look at the **Diff** tab. What does it show, and why?
6. In a comment, fill in a small table comparing chapter 29, 34 and 35: number of files, lines of code, how a component adds a book, and what you can see in the DevTools.

<details>
<summary>Hint 1</summary>

For requirement 4, keep the code the user last tried in local `useState`. Then, during render, compare it with the promo code selected from the store. If they tried something and the store's code doesn't match it, it wasn't valid. That's a derived value, not more state.

</details>

<details>
<summary>Hint 2</summary>

For requirement 5: a wrong code returns before touching the draft, so Immer hands back the very same state object. Nothing changed, so there's nothing to show.

</details>

---

## Exercise 4 (Medium): Memoised totals, and a test for every rule

Add `createSelector` totals to your exercise 3 cart, then test the slice properly ([chapter 28](../28-testing/notes.md)).

1. `cartSelectors.ts` with `selectItemCount`, plus `selectTotals` built with `createSelector`, returning `{ subtotal, discount, total }`. Use it on the cart panel.
2. `cartSlice.test.ts`, calling `cartReducer(state, action)` directly. At least one test per rule:
   - adding the same book twice gives one line with quantity 2
   - adding a book 11 times stops at 10, and `quantityChanged` to 15 also gives 10
   - `quantityChanged` to 0 or `-1` removes the line
   - `BOOKS10` sets the promo code, and a wrong code returns the **very same** state object (`toBe`)
   - `cleared` empties the items and the promo code
3. Add `makeStore()` to `store.ts`, and write selector tests: dispatch two copies of Dune (£9.99) and `BOOKS10` on a fresh store, then check all three totals.
4. **Prove the memoising:** call `selectTotals` twice on the same state and check you get the very same object. Then add a book and check you get a different one.
5. **Break it on purpose:** replace `selectTotals` with a plain arrow function that builds the same object. Run the app and find the warning in the Console. Write down its first sentence, then put `createSelector` back.

<details>
<summary>Hint 1</summary>

Money in floating point is rarely exact, so use `toBeCloseTo(17.98, 2)` rather than `toBe` for totals.

</details>

<details>
<summary>Hint 2</summary>

A selector made with `createSelector` also has a `recomputations()` method, which tells you how many times it really did the maths. It's a neat way to prove step 4.

</details>

---

## Exercise 5 (Challenge): Two slices, one action, and a verdict

Add [chapter 29's stretch goal 4](../29-project-online-bookstore/exercises.md), the wishlist, to your exercise 3 cart. Then decide which library you'd use for the bookstore.

1. A `wishlist` slice with `toggled(bookId)`. A ♡ button on each book toggles it.
2. A "Saved for later" list with a **Move to cart** button on each book, and a **Save for later** button on each cart line.
3. **Each of those buttons dispatches exactly one action**, and that one action updates **both** slices. Decide which slice owns each action, and where you need `extraReducers`.
4. The notes' wishlist drops a book whenever it's added to the cart, from anywhere. Keep that rule or remove it? Argue for your choice in a comment.
5. The header shows both counts: `🛒 3  ♡ 5`.
6. **Save both slices to `localStorage`** with `store.subscribe`, and load them on startup with `configureStore`'s `preloadedState`. Only write a slice when it actually changed. Corrupt saved data must give an empty cart and wishlist, not a white screen.
7. One test on a fresh `makeStore()`: dispatch **Move to cart** and check both slices changed.
8. **The verdict.** In a comment at the top of `Ex5.tsx`, write a short paragraph: would you build the real bookstore with Zustand or Redux Toolkit, and why? Mention at least setup, testing, the DevTools, and how "move to cart" would work in each. (In Zustand, would the wishlist be its own store, or part of the cart store?)

<details>
<summary>Hint 1</summary>

`store.subscribe(listener)` calls your listener after **every** dispatched action. To write only when something changed, keep the last `state.cart` you saved and compare it with `!==`. Immer reuses unchanged objects, so a reference check is enough ([chapter 11](../11-updating-objects-and-arrays/notes.md)).

</details>

<details>
<summary>Hint 2</summary>

Write a `loadSavedState()` function that returns `{ cart?: CartState; wishlist?: WishlistState } | undefined`, with `JSON.parse` inside a `try`/`catch`. Type it from your slice state types, not from `RootState`: `RootState` is worked out *from* the store you're in the middle of building. For extra safety, check the parsed data with a Zod schema from [chapter 32](../32-zod/notes.md).

</details>

<details>
<summary>Hint 3</summary>

For requirement 3, watch out for a trap. If the cart slice imports an action from the wishlist file, and the wishlist imports `added` from the cart file, the two files import each other. That's a **circular import**, and it can cause confusing bugs. One way out: make the shared actions in a third file with `createAction<Book>("shop/movedToCart")`, and let each slice handle them in `extraReducers`.

RTK also has a tidier tool for side effects like saving, `createListenerMiddleware`. It's worth a look once `store.subscribe` works.

</details>
