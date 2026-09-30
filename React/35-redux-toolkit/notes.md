# 35 Redux Toolkit

## What is it?

**Redux** is a well-known library for app-wide state. All the shared state lives in one **store**. The only way to change it is to **dispatch** an **action**: a plain object saying what happened. **Reducers** then decide what the new state should be.

If that sounds familiar, it should. It's the `useReducer` idea from [chapter 23](../23-use-reducer/notes.md), scaled up to the whole app.

**Redux Toolkit** (RTK for short) is the official, modern way to write Redux. It cuts out most of the repetitive code Redux used to need.

```tsx
const dispatch = useAppDispatch();
dispatch(added(book)); // "a book was added to the cart"
```

This chapter uses **Redux Toolkit 2** with **React Redux 9**. Install both in your playground:

```
npm install @reduxjs/toolkit react-redux
```

`@reduxjs/toolkit` holds the store and the tools for writing reducers. `react-redux` connects the store to your components.

## Why does it matter?

Here's an honest question. [Chapter 34](../34-zustand/notes.md)'s Zustand is smaller and simpler. So why learn Redux too?

- **It's everywhere.** A huge number of existing React apps use Redux, and it shows up in a lot of job listings. There's a good chance you'll work on one.
- **Its strict structure helps big teams.** Every change is an action. Every rule is in a reducer. Every feature is laid out the same way. A new person on the team knows exactly where to look.
- **Its DevTools are brilliant.** [Chapter 23](../23-use-reducer/notes.md) promised that because every change is a plain object, you can log them, replay them and step back through them. Redux is where that promise pays off.
- **You already understand it.** Actions, reducers and dispatch are chapter 23 and the [chapter 29](../29-project-online-bookstore/notes.md) bookstore. Redux Toolkit just removes the boring parts.

And just as honestly: for a new, small app, Redux is often more than you need. Zustand, or plain context, may be plenty. The table near the end of this chapter helps you choose.

## Real-world example

Think about **a bank**.

| A bank | Redux |
|---|---|
| You can't walk into the vault and change your balance | Components can't change the store directly |
| You fill in a slip: "deposit £50" | You dispatch an action: `{ type: "account/deposited", payload: 50 }` |
| The teller applies the bank's rules | A reducer works out the new state |
| The ledger holds the one true balance | The store holds the one true state |
| Savings and loans each keep their own pages of the ledger | Each **slice** owns its own part of the state |
| The audit log records every slip, in order | The Redux DevTools record every action |
| An auditor can replay the day, slip by slip | "Time travel": step back through the actions |

The bank is slower than keeping cash in a jar. But when something goes wrong, you can see exactly what happened and when. That's the trade Redux makes.

## How it works

### A very short history

Redux came out in 2015. Writing it by hand meant action type constants, action creator functions, big `switch` reducers full of spreads, and several files per feature. People called all that repeated setup code "boilerplate", and complained about it a lot. Redux Toolkit arrived in 2019 as the official fix, and it's now the way the Redux team recommends writing all Redux code.

So if a tutorial shows `createStore`, `const ADD_TODO = "ADD_TODO"`, giant `switch` statements, or `connect(mapStateToProps)`, it's the **old style**. The ideas are the same. The code isn't.

### The words you'll meet

| Word | What it means | Where you've seen it |
|---|---|---|
| **Store** | The one object holding all the app's shared state | `useReducer`'s state, for the whole app |
| **Slice** | One feature's part of the state, with its reducers and actions (for example, `cart`) | One reducer file |
| **Action** | A plain object saying what happened: `{ type: "cart/added", payload: book }` | `{ type: "added", book }` in chapter 29 |
| **Payload** | The data an action carries, like the contents of a parcel | The extra fields on your actions |
| **Reducer** | A function that takes the state and an action, and returns the new state | `cartReducer` |
| **Dispatch** | Sending an action to the store | `dispatch` from `useReducer` |
| **Selector** | A function that reads a piece of the state | Zustand's selectors ([chapter 34](../34-zustand/notes.md)) |

### Your first slice: the cart

A **slice** holds one feature's state and every rule for changing it. Here's chapter 29's cart, with the same five rules. It uses chapter 29's `Book` type from `src/shop/books.ts`, as in [chapter 34](../34-zustand/notes.md).

```ts
// src/shop/cartSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Book } from "./books.ts";

export const MAX_QUANTITY = 10;
export const PROMO_CODE = "BOOKS10";

export type CartItem = {
  bookId: string;
  title: string;
  price: number;
  quantity: number;
};

export type CartState = {
  items: CartItem[];
  promoCode: string | null;
};

export const initialCartState: CartState = { items: [], promoCode: null };

const cartSlice = createSlice({
  name: "cart",
  initialState: initialCartState,
  reducers: {
    added(state, action: PayloadAction<Book>) {
      const book = action.payload;
      const existing = state.items.find((item) => item.bookId === book.id);
      if (existing) {
        // Rules 1 and 2: one more copy, but never more than 10
        existing.quantity = Math.min(existing.quantity + 1, MAX_QUANTITY);
      } else {
        state.items.push({ bookId: book.id, title: book.title, price: book.price, quantity: 1 });
      }
    },
    removed(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.bookId !== action.payload);
    },
    quantityChanged(state, action: PayloadAction<{ bookId: string; quantity: number }>) {
      const { bookId, quantity } = action.payload;
      if (quantity <= 0) {
        // Rule 3: 0 or less removes the line
        state.items = state.items.filter((item) => item.bookId !== bookId);
        return;
      }
      const item = state.items.find((i) => i.bookId === bookId);
      if (item) {
        item.quantity = Math.min(quantity, MAX_QUANTITY);
      }
    },
    promoApplied(state, action: PayloadAction<string>) {
      // Rule 4: only BOOKS10. For anything else, change nothing.
      if (action.payload !== PROMO_CODE) return;
      state.promoCode = action.payload;
    },
    cleared() {
      // Rule 5: back to the start, items AND promo code
      return initialCartState;
    },
  },
});

export const { added, removed, quantityChanged, promoApplied, cleared } = cartSlice.actions;
export default cartSlice.reducer;
```

Let's take it piece by piece.

- **`name: "cart"`** becomes the first part of every action type: `cart/added`, `cart/removed`, and so on.
- **`initialState`** gives the starting state. RTK works out the state's type from it, so give it a type.
- **Each function in `reducers`** handles one action. RTK also makes an **action creator** with the same name: a function that builds the action object for you.
- **`PayloadAction<Book>`** says what the payload is. `added` carries a `Book`, `removed` carries a `bookId` string.
- **The names are chapter 29's**, in camelCase, because each one becomes a function you call: `quantity_changed` became `quantityChanged`.

Here's what an action creator gives you:

```ts
added(dune);
// { type: "cart/added", payload: { id: "1", title: "Dune", price: 9.99, ... } }
```

No typing out `{ type: "..." }` by hand, and no typos in action names.

### Wait, isn't that mutation?

Look again at `existing.quantity = ...` and `state.items.push(...)`. In [chapter 11](../11-updating-objects-and-arrays/notes.md), [chapter 23](../23-use-reducer/notes.md) and [chapter 34](../34-zustand/notes.md), that was a bug. Here it's fine, and the reason is a library built into Redux Toolkit called **Immer**. (Chapter 11 mentioned it by name.)

RTK doesn't hand your reducer the real state. It hands it a **draft**: a stand-in object that quietly records every change you make. When your function finishes, Immer builds a brand-new state from those changes. Anything you changed gets a new object. Anything you didn't touch is reused as-is. That's exactly the copying chapter 11 taught, done for you.

It's like editing a document with "track changes" on. You scribble on the draft, and at the end a clean new version is produced. The original was never touched.

Here's the cap rule both ways:

```ts
// Chapter 29: copy by hand
return {
  ...state,
  items: state.items.map((item) =>
    item.bookId === action.bookId ? { ...item, quantity: Math.min(action.quantity, 10) } : item
  ),
};

// Redux Toolkit: "change" the draft, and Immer makes the copy
const item = state.items.find((i) => i.bookId === bookId);
if (item) {
  item.quantity = Math.min(quantity, MAX_QUANTITY);
}
```

Three things to keep straight:

- **This only works inside RTK reducers** (the functions in `createSlice`). In components, in `useState`, in `useReducer` and in Zustand, chapter 11's rules still apply. Outside a reducer, the store's state is **frozen**, so "changing" it throws an error (see mistake 2).
- **In a reducer, either change the draft or return a new state. Never both.** `cleared` returns a new state and changes nothing. The others change the draft and return nothing.
- **Changing nothing keeps the same object.** A wrong promo code hits `return;` before touching the draft, so Immer hands back the very same state object. That's chapter 29's rule 4, for free.

### The store

The store brings your slices together:

```ts
// src/shop/store.ts
import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice.ts";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

The key `cart` decides where the slice's state lives: `state.cart.items`. `RootState` is the type of the whole state, worked out by TypeScript from the store itself. `AppDispatch` is the type of its `dispatch`.

`configureStore` also switches on some helpful extras for you: the Redux DevTools connection, and development-only checks that warn you about common mistakes.

### Typed hooks

React Redux gives you `useSelector` (read from the store) and `useDispatch` (get `dispatch`). Make typed versions once, and use them everywhere instead of the plain ones:

```ts
// src/shop/hooks.ts
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "./store.ts";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
```

`.withTypes` needs React Redux 9.1 or later. In older code you'll see `TypedUseSelectorHook<RootState>` instead, which does the same job.

### The provider

Unlike Zustand, Redux does need a provider: one, for the whole store. Wrap your app in `main.tsx`, next to any providers you already have:

```tsx
// src/main.tsx
import { Provider } from "react-redux";
import { store } from "./shop/store.ts";

// ...inside render(), around <App />:
<Provider store={store}>
  <App />
</Provider>
```

### Using it in components

```tsx
import { useAppDispatch, useAppSelector } from "./hooks.ts";
import { added } from "./cartSlice.ts";
import { selectItemCount } from "./cartSelectors.ts"; // written in the next section
import type { Book } from "./books.ts";

function AddToCartButton({ book }: { book: Book }) {
  const dispatch = useAppDispatch();
  return <button onClick={() => dispatch(added(book))}>Add to cart</button>;
}

function CartIndicator() {
  const count = useAppSelector(selectItemCount);
  return <span className="cart-indicator">🛒 Cart ({count})</span>;
}
```

Like Zustand, `useAppSelector` only re-renders a component when the value it selected changes. So `CartIndicator` stays still when a promo code is applied. And `dispatch` never changes, so a component that only dispatches never re-renders because of the store.

### Selectors, and `createSelector` for totals

Selectors are plain functions that take the whole state:

```ts
// src/shop/cartSelectors.ts
import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "./store.ts";
import { PROMO_CODE } from "./cartSlice.ts";

export const selectCartItems = (state: RootState) => state.cart.items;
export const selectPromoCode = (state: RootState) => state.cart.promoCode;

export const selectItemCount = (state: RootState) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0);

export const selectTotals = createSelector(
  [selectCartItems, selectPromoCode],
  (items, promoCode) => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = promoCode === PROMO_CODE ? subtotal * 0.1 : 0;
    return { subtotal, discount, total: subtotal - discount };
  }
);
```

`selectItemCount` returns a number, which is compared by value, so it's fine as it is.

`selectTotals` returns an **object**, and a new object every time would mean a re-render after every action. `createSelector` fixes that. It's **memoised**: it remembers its last inputs and its last result, like `useMemo` in [chapter 27](../27-performance/notes.md). The first array lists the input selectors. If `items` and `promoCode` are the same as last time, it skips the maths and hands back the very same object.

```tsx
const { subtotal, discount, total } = useAppSelector(selectTotals);
```

The totals are still derived, never stored ([chapter 08](../08-state/notes.md)). `createSelector` just avoids working them out, and re-rendering, when nothing changed.

### The Redux DevTools

Install the **Redux DevTools** extension for Chrome or Edge from the browser's extension store. Reload your app, open DevTools, and find the **Redux** tab. `configureStore` connects to it automatically.

Add a few books, change a quantity, and apply `BOOKS10`. You'll see:

- **A list of every action**, in order: `cart/added`, `cart/added`, `cart/quantityChanged`, `cart/promoApplied`.
- **Tabs for the selected action**: **Action** shows its payload, **State** shows the whole state afterwards, and **Diff** shows just what changed.
- **Time travel.** **Jump** on an earlier action shows your app exactly as it was at that moment. **Skip** shows what the app would look like if that action had never happened. A slider replays the whole session.

(The buttons move around a little between versions of the extension, but they're all there.)

This is chapter 23's promise kept. It only works because reducers are pure and actions are plain objects: replay the same actions, and you always get the same state.

One honest detail: by default the connection is on in production builds too. Many teams turn it off there by adding `devTools: import.meta.env.DEV` next to `reducer` in `configureStore`.

### A second slice: the wishlist

Real apps have several slices. Here's a wishlist, like [chapter 29's stretch goal 4](../29-project-online-bookstore/exercises.md):

```ts
// src/shop/wishlistSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { added } from "./cartSlice.ts";

type WishlistState = { bookIds: string[] };

const initialState: WishlistState = { bookIds: [] };

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    toggled(state, action: PayloadAction<string>) {
      const id = action.payload;
      if (state.bookIds.includes(id)) {
        state.bookIds = state.bookIds.filter((savedId) => savedId !== id);
      } else {
        state.bookIds.push(id);
      }
    },
  },
  // react to actions that belong to OTHER slices
  extraReducers: (builder) => {
    builder.addCase(added, (state, action) => {
      // once a book is in the cart, it doesn't need to be on the wishlist
      state.bookIds = state.bookIds.filter((id) => id !== action.payload.id);
    });
  },
});

export const { toggled } = wishlistSlice.actions;
export default wishlistSlice.reducer;
```

Add it to the store, and `RootState` updates itself to `{ cart: CartState; wishlist: WishlistState }`:

```ts
reducer: {
  cart: cartReducer,
  wishlist: wishlistReducer,
},
```

`extraReducers` is how one action changes two slices. When `cart/added` is dispatched, the cart adds the book and the wishlist drops it. That's one user action, one dispatch, and both slices stay in step. In chapter 29 you had to choose between one big reducer or two dispatches. Redux gives you a third way.

(RTK 1 tutorials sometimes write `extraReducers` as an object. RTK 2 removed that; use the `builder` form shown here.)

### Async code and server data

RTK has `createAsyncThunk` for async work. You write an async function, and RTK dispatches `pending`, `fulfilled` and `rejected` actions around it, which your slice handles to set loading flags. It works, but look closely: it's [chapter 18](../18-fetching-data/notes.md)'s loading, error and data by hand, just inside Redux.

For **server data**, use a tool built for it. Redux Toolkit includes **RTK Query**, Redux's own answer to TanStack Query ([chapter 31](../31-tanstack-query/notes.md)): caching, loading states and refetching, written for you.

```ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Book } from "../api/books.ts"; // chapter 30's reading-list Book

export const booksApi = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3001" }),
  endpoints: (build) => ({
    getBooks: build.query<Book[], void>({ query: () => "/books" }),
  }),
});

export const { useGetBooksQuery } = booksApi; // const { data, isLoading, error } = useGetBooksQuery();
```

It also needs its reducer and middleware added to `configureStore`; the RTK Query docs show the two lines. Watch the names: RTK Query says `isLoading` where TanStack Query v5 says `isPending`.

Using TanStack Query alongside Redux is also completely normal. Either way, the rule from chapter 34 stands: **don't hand-write loading flags in slices, and don't copy server data into them.** Slices are for client state, like the cart.

### Testing

A slice's reducer is a pure function, which makes it the easiest thing in the app to test ([chapter 28](../28-testing/notes.md)). Call it with a state and an action, and check what comes back:

```ts
// src/shop/cartSlice.test.ts
import cartReducer, { added, promoApplied, initialCartState } from "./cartSlice.ts";
import { books } from "./books.ts";

const dune = books[0];

test("adding the same book twice gives one line with quantity 2", () => {
  let state = cartReducer(initialCartState, added(dune));
  state = cartReducer(state, added(dune));

  expect(state.items).toHaveLength(1);
  expect(state.items[0].quantity).toBe(2);
});

test("a wrong promo code changes nothing at all", () => {
  const state = cartReducer(initialCartState, added(dune));
  expect(cartReducer(state, promoApplied("FREEBOOKS"))).toBe(state);
});
```

No store, no rendering and nothing to reset. Each test builds its own state.

To test selectors, or several slices together, make a fresh store per test. Change `store.ts` to export a function that builds one:

```ts
export function makeStore() {
  return configureStore({ reducer: { cart: cartReducer, wishlist: wishlistReducer } });
}

export const store = makeStore();
```

A test can then call `makeStore()`, dispatch a few actions, and check `selectTotals(store.getState())`. For component tests, wrap them in `<Provider store={makeStore()}>` inside your `renderWithProviders` helper.

### Choosing: context, Zustand or Redux Toolkit?

| | useReducer + Context ([ch 29](../29-project-online-bookstore/notes.md)) | Zustand ([ch 34](../34-zustand/notes.md)) | Redux Toolkit |
|---|---|---|---|
| Install | Nothing, it's built in | One small package | Two packages |
| Setup | Reducer, two contexts, provider, guard hooks | One `create` call | Slice, store, typed hooks, one provider |
| Changing state | `dispatch({ type: "added", book })` | `add(book)` | `dispatch(added(book))` |
| Copying rules | By hand ([ch 11](../11-updating-objects-and-arrays/notes.md)) | By hand ([ch 11](../11-updating-objects-and-arrays/notes.md)) | Immer does it inside reducers |
| Re-renders | Every reader of the state context | Only when the selected piece changes | Only when the selected piece changes |
| DevTools | React DevTools only | Redux DevTools, with `devtools` middleware | Redux DevTools, built in |
| Outside React | No | `getState()`, `setState()` | `store.getState()`, `store.dispatch()` |
| Server data | TanStack Query | TanStack Query | RTK Query, or TanStack Query |
| Choose it when | A few shared values, small app | Most new apps that need shared client state | Big teams, existing Redux apps, you want strict structure and the DevTools |

### When you don't need it

If you're starting a small app, Redux Toolkit is usually more than you need. Try the simplest thing first: `useState`, then context, then Zustand. Reach for Redux when the team is large, when the app already uses it, or when seeing every action in the DevTools is worth the extra setup. And even in a Redux app, state that only one component cares about stays in `useState`.

## Common mistakes

**1. Following an old-style Redux tutorial**

`createStore`, action type constants, hand-written `switch` reducers and `connect` still run, but they're not how Redux is written today. (Your editor even shows `createStore` crossed out, because it's marked as deprecated.) Look for `createSlice` and `configureStore`.

**2. "Mutating" state outside an RTK reducer**

```tsx
const items = useAppSelector(selectCartItems);
items[0].quantity = 5; // ❌ in a component
```

Immer only works inside `createSlice` reducers. Everywhere else, the state is frozen, and Chrome throws:

```
TypeError: Cannot assign to read only property 'quantity' of object '#<Object>'
```

Change state by dispatching an action. And in `useState`, `useReducer` and Zustand, chapter 11's copying rules still apply.

**3. Changing the draft and returning a new value**

```ts
cleared(state) {
  state.promoCode = null;
  return { items: [], promoCode: null }; // ❌ both at once
}
```

```
[Immer] An immer producer returned a new value *and* modified its draft. Either return a new value *or* modify the draft.
```

Pick one. A sneaky version is a one-line arrow function: `added: (state, action) => state.items.push(...)` returns whatever `push` returns (the new length), so it counts as "returning a value". TypeScript usually flags that one, because a reducer mustn't return a number. Use curly braces.

**4. Plain `useSelector` and `useDispatch`**

```tsx
const items = useSelector((state) => state.cart.items);
// ❌ 'state' is of type 'unknown'.
```

Plain `useSelector` doesn't know your state's shape. Use `useAppSelector` and `useAppDispatch` from `hooks.ts`, everywhere.

**5. A selector that returns a new object every time**

`useAppSelector((state) => ({ items: state.cart.items, promoCode: state.cart.promoCode }))` builds a new object every time. This doesn't crash like it does in Zustand 5, but the component re-renders after every action, and React Redux warns you in development:

```
Selector unknown returned a different result when called with the same parameters. This can lead to unnecessary rerenders.
```

(`unknown` is the selector's name; an inline arrow function doesn't have one.) Select each value separately, or use `createSelector`.

**6. Putting values that aren't plain data into the state**

Dates, class instances, `Map`s and functions don't survive being turned into JSON and back, and the DevTools can't show or replay them properly. RTK warns in development:

```
A non-serializable value was detected in an action, in the path: `payload`. Value: ...
```

The path tells you where the bad value is. Store plain data instead. For a date, store the ISO string: `new Date().toISOString()`.

**7. Putting everything in Redux**

Half-typed form text, whether a menu is open, the hover state of a card: that's local UI state. It belongs in `useState` (or React Hook Form). A store full of those is noisy, slow to work with, and fills the DevTools with junk.

**8. Copying server data into a slice**

A `books` slice filled by a fetch, with hand-written `isLoading` and `error` fields, is chapter 18 all over again. Use RTK Query or TanStack Query.

## Quick recap

- **Redux** keeps shared state in one **store**. Components **dispatch actions**, and **reducers** decide the new state. It's chapter 23's `useReducer` idea, app-wide.
- **Redux Toolkit** is the modern way to write it: `createSlice` for each feature, `configureStore` for the store. Anything with `createStore` and `switch` statements is the old style.
- Inside `createSlice` reducers, **Immer** lets you write code that looks like mutation and produces a proper copy. Only there. Everywhere else, chapter 11's rules still apply.
- Make **typed hooks** once with `.withTypes`, and wrap the app in one `<Provider store={store}>`.
- Use **plain selectors** for single values, and **`createSelector`** for derived objects like totals, so they're memoised and never stored.
- The **Redux DevTools** show every action, the state after it, what changed, and let you time-travel.
- **`extraReducers`** lets one action update several slices.
- Server data belongs in **RTK Query** or **TanStack Query**, not in hand-written slices. And for a small new app, Zustand or context may be all you need.

---

**Next:** try the [exercises](exercises.md), then move on to [36 TanStack Router](../36-tanstack-router/notes.md).
