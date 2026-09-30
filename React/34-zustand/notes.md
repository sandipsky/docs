# 34 Zustand

## What is it?

Zustand is a small library for a shared **store**. A store is a box of state that lives outside your components. Any component can read from it or change it, and there's no provider to wrap around your app.

```tsx
// create the store once, in its own file
export const useCartStore = create<CartStore>()((set) => ({ ... }));

// read it in any component, anywhere in the app
const count = useCartStore((state) => state.items.length);
```

(A fun fact: "Zustand" is the German word for "state".)

This chapter uses **Zustand 5**. Install it in your playground:

```
npm install zustand
```

## Why does it matter?

You've already built shared state twice by hand: the theme in [chapter 22](../22-context/notes.md), and the bookstore cart in [chapter 29](../29-project-online-bookstore/notes.md), with `useReducer` and two contexts. It works, and you understand every line. But you probably noticed three things:

- **There's a lot of setup.** The cart needed a reducer, an action union, two contexts, a provider, two guard hooks, and a wrapper in `main.tsx`. That's a lot of code before a single button works.
- **Every reader re-renders on every change.** A component that reads the state context re-renders when *anything* in it changes ([chapter 22](../22-context/notes.md)). The header's cart count re-renders when you apply a promo code, even though the count didn't change.
- **It only works inside React.** `useContext` is a hook, so only components can call it. An Axios interceptor from [chapter 30](../30-axios/notes.md) can't read your context.

Zustand fixes all three:

- **One function call** makes the store. No provider, no guard hooks.
- **Selectors** let each component pick just the piece it needs. It only re-renders when that piece changes.
- **The store is also a plain object**, so code outside React can read it and change it.

This is Level 4's theme again: a library that solves a problem you've already felt by hand. It's not magic, and it's not always needed. The end of this chapter says when to skip it.

## Real-world example

Think about a **family whiteboard** on the kitchen wall.

| Kitchen whiteboard | Zustand store |
|---|---|
| It hangs in the kitchen, not in anyone's bedroom | The store lives outside your components |
| Anyone can walk up and read it, no need to ask | Any component can read it, with no provider |
| You only look at your own line: "Sam: dentist, Tuesday" | A **selector** picks just the piece you care about |
| You only care when *your* line changes | A component only re-renders when its piece changes |
| House rules at the top say how to change it | **Actions** in the store are the way to change it |
| Someone in the garden can shout "what's on the board?" | Code outside React can call `getState()` |

Context is more like the house intercom. Every announcement goes to every room with a speaker switched on, even if it's not for them.

## How it works

### Your first store

A store is made with `create`. Put it in its own file:

```ts
// src/ch34/counterStore.ts
import { create } from "zustand";

type CounterState = {
  count: number;
  step: number;
  increment: () => void;
  reset: () => void;
};

export const useCounterStore = create<CounterState>()((set) => ({
  count: 0,
  step: 1,
  increment: () => set((state) => ({ count: state.count + state.step })),
  reset: () => set({ count: 0 }),
}));
```

- **`create` gives you back a hook.** That's why its name starts with `use`, and the hook rules from [chapter 08](../08-state/notes.md) apply.
- **The function you pass in returns the starting state.** Zustand hands it `set`, which changes the state later.
- **State and actions live together.** `count` and `step` are data. `increment` and `reset` are **actions**: functions stored in the same object, whose job is to change the data.

### Why the extra `()`?

`create<CounterState>()(...)` looks like a typo, but it's two calls in a row, on purpose. When you call a generic function, TypeScript makes you choose: give it *all* the type arguments, or let it work out *all* of them. You can't do half. Here you want half: you say what your state looks like, and TypeScript works out the types added by **middleware** (optional extras that wrap the store, like saving to `localStorage`, later in this chapter).

Two calls solve it. The first takes the type you write. The second takes your function, and TypeScript infers the rest. At runtime the first `()` does nothing; it only exists for TypeScript. Without middleware, forgetting it happens to work, and then it breaks the day you add some (see mistake 6). So always write it.

### Reading the store with a selector

```tsx
import { useCounterStore } from "./counterStore.ts";

function CountDisplay() {
  const count = useCounterStore((state) => state.count);
  return <p>Count: {count}</p>;
}

function IncrementButton() {
  const increment = useCounterStore((state) => state.increment);
  return <button onClick={increment}>+1</button>;
}
```

The function you pass to the hook is a **selector**: a small function that picks the piece of state this component needs.

Zustand runs your selector after every change to the store, and compares the result with last time using `Object.is` (the reference check from [chapter 11](../11-updating-objects-and-arrays/notes.md)). **Only if the result is different does the component re-render.**

- `CountDisplay` re-renders when `count` changes, but not when `step` changes.
- `IncrementButton` picks a function that never changes, so store changes never re-render it. That's what the separate dispatch context gave you in [chapter 23](../23-use-reducer/notes.md), for free.

And there's no provider. Put these components anywhere and they work.

### Changing the state with `set`

`set` has two forms, like a `useState` setter:

```ts
reset: () => set({ count: 0 }),                                          // "make it this"
increment: () => set((state) => ({ count: state.count + state.step })),  // "based on what it is now"
```

Use the function form when the new value depends on the old one, just like `setCount((prev) => prev + 1)` in [chapter 12](../12-how-rendering-works/notes.md).

**`set` merges.** This is the big difference from `useState`. `set({ count: 0 })` changes `count` and keeps everything else: `step` and both actions are still there. A `useState` setter would replace the whole value.

**But it only merges the top level.** Anything nested, like an array of cart items, still follows every rule from [chapter 11](../11-updating-objects-and-arrays/notes.md):

```ts
addItem: (item) => set((state) => { state.items.push(item); return state; }), // ❌ same object
addItem: (item) => set((state) => ({ items: [...state.items, item] })),       // ✅ a new array
```

The ❌ version hands back the same object, so the `Object.is` check says "nothing changed" and nobody re-renders. The cart has a new book in it, and the page doesn't show it.

### The bookstore cart, as a Zustand store

Now let's rebuild [chapter 29](../29-project-online-bookstore/notes.md)'s cart with the same five rules, so you can compare them side by side.

The examples use chapter 29's `Book` type. In the playground, copy `29-project-online-bookstore/starter/src/books.ts` into `src/shop/books.ts`. (Careful: the playground also has a `Book` type in `src/api/books.ts`, for chapter 30's reading list. It's a different shape, so import from the right file.)

```ts
// src/shop/cartStore.ts
import { create } from "zustand";
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

type CartActions = {
  add: (book: Book) => void;
  remove: (bookId: string) => void;
  changeQuantity: (bookId: string, quantity: number) => void;
  applyPromo: (code: string) => void;
  clear: () => void;
};

export type CartStore = CartState & CartActions;

export const initialCartState: CartState = { items: [], promoCode: null };

export const useCartStore = create<CartStore>()((set, get) => ({
  ...initialCartState,

  add: (book) => {
    const existing = get().items.find((item) => item.bookId === book.id);
    if (existing) {
      // Rule 1: the same book again means one more copy, not a second line
      get().changeQuantity(book.id, existing.quantity + 1);
      return;
    }
    set((state) => ({
      items: [...state.items, { bookId: book.id, title: book.title, price: book.price, quantity: 1 }],
    }));
  },

  remove: (bookId) =>
    set((state) => ({ items: state.items.filter((item) => item.bookId !== bookId) })),

  changeQuantity: (bookId, quantity) => {
    // Rule 3: 0 or less removes the line
    if (quantity <= 0) {
      get().remove(bookId);
      return;
    }
    // Rule 2: never more than 10 of one title
    set((state) => ({
      items: state.items.map((item) =>
        item.bookId === bookId ? { ...item, quantity: Math.min(quantity, MAX_QUANTITY) } : item
      ),
    }));
  },

  applyPromo: (code) => {
    // Rule 4: only BOOKS10 works. For anything else, don't call set at all.
    if (code !== PROMO_CODE) return;
    set({ promoCode: code });
  },

  // Rule 5: clearing empties the items AND the promo code
  clear: () => set(initialCartState),
}));
```

A few things to notice:

- **Every rule lives in the store**, just as every rule lived in the reducer in chapter 29. A component calls `add(book)` and knows nothing about the cap of 10.
- **`get` is new.** Zustand hands your function a second tool, `get()`, which returns the current state. Here it lets `add` look at the cart and reuse `changeQuantity`, so the cap of 10 is written in exactly one place.
- **A wrong promo code never calls `set`.** The state stays the very same object, and nothing re-renders. That's chapter 29's "return the exact same state object" rule.
- **`clear` can pass `initialCartState` to `set`** because `set` merges. The data goes back to the start, and the actions stay.

Using it is one line per thing a component needs:

```tsx
function AddToCartButton({ book }: { book: Book }) {
  const add = useCartStore((state) => state.add);
  return <button onClick={() => add(book)}>Add to cart</button>;
}
```

Compared with chapter 29, there's no action union, no `switch`, no contexts, no provider and no guard hooks. Be honest about what you gave up, too. The action union was a checked list of "everything that can happen to the cart"; here the `CartActions` type does that job. And you've lost the log of every action. `devtools`, below, gives it back.

### Totals: derived, never stored

The item count, subtotal, discount and total are all **derived**: worked out from the items, never stored ([chapter 08](../08-state/notes.md)). Write each one as a small selector function next to the store:

```ts
// src/shop/cartStore.ts (continued)
export const selectItemCount = (state: CartState) =>
  state.items.reduce((sum, item) => sum + item.quantity, 0);

export const selectSubtotal = (state: CartState) =>
  state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

export const selectDiscount = (state: CartState) =>
  state.promoCode === PROMO_CODE ? selectSubtotal(state) * 0.1 : 0;

export const selectTotal = (state: CartState) => selectSubtotal(state) - selectDiscount(state);
```

Pass one straight to the hook:

```tsx
function CartIndicator() {
  const count = useCartStore(selectItemCount);
  return <span className="cart-indicator">🛒 Cart ({count})</span>;
}
```

Each selector returns a **number**, and numbers are compared by value. So `CartIndicator` only re-renders when the count really changes. Applying a promo code changes the total but not the count, so the header stays still.

### Prove it: who re-renders?

Don't take this on trust. Add `console.log("CartIndicator rendered")` to `CartIndicator`, and make a second component that reads something else:

```tsx
function PromoStatus() {
  const promoCode = useCartStore((state) => state.promoCode);
  console.log("PromoStatus rendered");
  return <p>{promoCode ? `Code ${promoCode} applied` : "No code applied"}</p>;
}
```

| You do this | What logs |
|---|---|
| Add a book | `CartIndicator rendered` only |
| Apply `BOOKS10` | `PromoStatus rendered` only |
| Type a wrong code | Nothing at all |
| Press **Clear cart** | Both, because both values changed |

In chapter 29, both components would read `useCart()`, so both would log every time. (In development, StrictMode may show each log twice. That's normal, see [chapter 12](../12-how-rendering-works/notes.md).) For a visual check, record with the React DevTools Profiler from [chapter 27](../27-performance/notes.md). Components that didn't render show up greyed out.

### Picking several values at once

This one catches everybody. You want two values, so you return them together:

```tsx
// ❌ a brand-new object every time the selector runs
const { items, promoCode } = useCartStore((state) => ({
  items: state.items,
  promoCode: state.promoCode,
}));
```

In Zustand 5, this crashes the component:

```
Uncaught Error: Maximum update depth exceeded. This can happen when a component repeatedly
calls setState inside componentWillUpdate or componentDidUpdate. React limits the number of
nested updates to prevent infinite loops.
```

You may also see `The result of getSnapshot should be cached to avoid an infinite loop` in the Console just before it.

Here's why. The selector builds a **new object** every time it runs, the same trap as `value={{ theme, setTheme }}` in [chapter 22](../22-context/notes.md). Zustand compares with `Object.is`, sees a new object, and decides the state changed. So React renders again, the selector makes another new object, and around it goes until React stops it.

Two fixes:

```tsx
// ✅ Fix 1: one call per value. Simple, and often the clearest.
const items = useCartStore((state) => state.items);
const promoCode = useCartStore((state) => state.promoCode);

// ✅ Fix 2: useShallow
import { useShallow } from "zustand/react/shallow";

const { items, promoCode } = useCartStore(
  useShallow((state) => ({ items: state.items, promoCode: state.promoCode }))
);
```

`useShallow` compares the new object with the last one **field by field**, one level deep. ("Shallow" means it doesn't look inside the fields.) If every field is the same, it hands back the old object, so there's no loop. It works for arrays too: `useShallow((state) => [state.items, state.promoCode])`.

The same trap hides in `filter` and `map`, which always return a new array. `useCartStore((state) => state.items.filter(...))` loops too. Select `state.items`, then filter in the component.

> **Version note:** in Zustand 4, this mistake only caused extra re-renders, so older tutorials are full of it. Some also pass `shallow` as a second argument to the hook, which Zustand 5's `create` doesn't support. Use `useShallow` instead.

### Saving to `localStorage`: `persist`

Remember [chapter 29's first stretch goal](../29-project-online-bookstore/exercises.md)? A lazy initialiser, an effect to save, and care with corrupt data. Zustand has this built in, as **middleware**: a wrapper that adds a feature to your store, like a phone case that adds a stand.

```ts
// src/shop/cartStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // ...exactly the same state and actions as before
    }),
    {
      name: "bookstore-cart",                          // the localStorage key
      partialize: (state) => ({ items: state.items }), // what to save
    }
  )
);
```

- **`name`** is the `localStorage` key. Add a book, then open DevTools → **Application** → **Local Storage**. You'll see `bookstore-cart` holding something like `{"state":{"items":[...]},"version":0}`. (`version` is for the day you change the shape of your state. That's beyond this chapter.)
- **`partialize`** picks what to save. This shop decided a promo code shouldn't survive a refresh, so only `items` is saved. Leave it out and all your data is saved. Actions are never saved: functions can't be turned into JSON, and they come from your code each time anyway.

Refresh, and the cart is still there. The store loads the saved value when it's created.

### Seeing every change: `devtools`

The `devtools` middleware connects your store to the **Redux DevTools** browser extension, which lists every change with the state before and after. You'll install it and use it properly in [chapter 35](../35-redux-toolkit/notes.md).

```ts
import { devtools, persist } from "zustand/middleware";

export const useCartStore = create<CartStore>()(
  devtools(
    persist(
      (set, get) => ({ /* ...the same store */ }),
      { name: "bookstore-cart", partialize: (state) => ({ items: state.items }) }
    ),
    { name: "Cart" } // the store's name in the DevTools
  )
);
```

The Zustand docs recommend `devtools` on the **outside**, as the last wrapper. Every `set` call now shows up in the extension. Unless you name it, it's called `anonymous` (newer Zustand 5 releases try to guess a name from your code). To choose the name yourself, pass a third argument to `set`. The `undefined` in the middle keeps the normal merging:

```ts
set((state) => ({ items: state.items.filter((item) => item.bookId !== bookId) }), undefined, "cart/remove");
```

### Using the store outside React

The hook from `create` is also the store itself, with plain methods on it:

```ts
useCartStore.getState();                    // the current state, right now
useCartStore.getState().clear();            // call an action
useCartStore.setState({ promoCode: null }); // change the state directly (it merges, like set)

const unsubscribe = useCartStore.subscribe((state) => {
  console.log("The cart now has", state.items.length, "lines");
});
```

None of these are hooks, so you can call them anywhere: a plain function, a timer, a test, or an Axios interceptor. Here's the classic example. On a real API with logins, every request needs a token. Say you have a tiny `useAuthStore` holding `token`, `logIn` and `logOut`. (The practice API has no logins, so this just shows the shape.)

```ts
// src/api/client.ts, from chapter 30, with one addition
import { useAuthStore } from "../stores/authStore.ts";

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

Context can't do this, because only components can call `useContext`. The same goes for a response interceptor that logs the user out when the server says "not allowed", or a TanStack Query `onError` callback ([chapter 31](../31-tanstack-query/notes.md)). Both can call `useAuthStore.getState().logOut()` from outside any component.

One warning: `getState()` doesn't **subscribe**. A component that shows `useCartStore.getState().items.length` in its JSX won't re-render when the cart changes. In JSX, always use the hook with a selector. Inside an event handler, `getState()` is fine, because it reads the latest value at the moment of the click.

### Testing the store

The store is plain functions, so tests can call the actions directly, with no rendering and no providers ([chapter 28](../28-testing/notes.md)):

```ts
// src/shop/cartStore.test.ts
import { beforeEach } from "vitest";
import { useCartStore, initialCartState, selectItemCount } from "./cartStore.ts";
import { books } from "./books.ts";

const dune = books[0];

beforeEach(() => {
  localStorage.clear();                    // persist saved the last test's cart
  useCartStore.setState(initialCartState); // reset the data, keep the actions
});

test("adding the same book twice gives one line with quantity 2", () => {
  const { add } = useCartStore.getState();
  add(dune);
  add(dune);

  const state = useCartStore.getState();
  expect(state.items).toHaveLength(1);
  expect(selectItemCount(state)).toBe(2);
});

test("a wrong promo code changes nothing at all", () => {
  const before = useCartStore.getState();
  before.applyPromo("FREEBOOKS");
  expect(useCartStore.getState()).toBe(before); // the very same object
});
```

**Why the `beforeEach`?** There's only one store, created when the file is first imported, and it lives for the whole test run. Without a reset, the second test starts with the first test's books still in the cart. Tests that depend on each other's leftovers pass or fail depending on their order, which is a horrible bug to chase.

Component tests work the same way: nothing to add to `renderWithProviders`, but reset the store before each test. (For big projects, the Zustand docs show a way to reset every store automatically.)

### Where state belongs

Chapter 29 taught three homes for state. Level 4 adds a fourth:

| Kind | Example | Best home |
|---|---|---|
| Local UI state | Is this menu open? Half-typed text | `useState` (or React Hook Form for form fields) |
| URL state | Filters, search text, which item | The router's search params and path params |
| Shared client state | Cart, theme, "compact view" setting | Context, or Zustand / Redux Toolkit |
| **Server state** | The list of books on the server | **TanStack Query** |

Zustand is for **shared client state**: data that belongs to this browser, like the cart. It is **not** a place to keep a copy of server data. Fetching books in an effect and calling `useLibraryStore.setState({ books })` takes you straight back to [chapter 18](../18-fetching-data/notes.md): loading flags, errors, stale data and refetching, all by hand. Server state is "a copy of data that really lives somewhere else, and can go out of date" ([chapter 31](../31-tanstack-query/notes.md)). Keep it in TanStack Query, and let Zustand hold your app's own choices.

### Which one should I use?

| Situation | Reach for |
|---|---|
| One component needs it, or a parent and a child | `useState`, lifted up if needed ([chapter 13](../13-lifting-state-up/notes.md)) |
| A few values many components read, that rarely change (theme, current user, language) | Context ([chapter 22](../22-context/notes.md)) |
| Shared state that changes often, read by many components (a cart, a music player) | Zustand |
| You need to read or change it outside React | Zustand |

### When you don't need it

Context is built into React and costs nothing to install. For a theme or the logged-in user, which change rarely, the extra re-renders don't matter, and Context is perfectly fine. A small app with a cart read in three places is fine with chapter 29's context and reducer, too.

And a store is never the answer for state only one component uses. That's `useState`, and it always will be. Reach for Zustand when shared state changes often, when many components read different parts of it, or when code outside React needs it.

## Common mistakes

**1. Calling the hook with no selector**

`const { items } = useCartStore();` subscribes to the **whole** store. It works, but the component re-renders on every change to the store, even ones it doesn't care about. That throws away the main reason to use Zustand. Always pass a selector.

**2. A selector that returns a new object or array**

`useCartStore((state) => ({ items: state.items, promoCode: state.promoCode }))` crashes with `Maximum update depth exceeded` in Zustand 5. Use one hook call per value, or wrap the selector in `useShallow`.

**3. Mutating inside `set`**

`state.items.push(item)` inside `set` changes the old array, and nobody re-renders. `set` merges the top level, but nested arrays and objects still need copying ([chapter 11](../11-updating-objects-and-arrays/notes.md)).

**4. Storing derived totals**

A `total` field in the store means every action must remember to update it, and the first one that forgets makes it wrong. Work it out with a selector like `selectTotal`, every time.

**5. Putting server data in the store**

Copying fetched data into Zustand means rebuilding loading, errors, caching and refetching by hand. Server data belongs to TanStack Query ([chapter 31](../31-tanstack-query/notes.md)).

**6. Forgetting the `()` in `create<T>()(...)`**

`create<ThemeState>((set) => ...)` happens to work without middleware, which is why it's so confusing when you add `persist` later. TypeScript then shows a long error that starts like this:

```
Argument of type 'StateCreator<ThemeState, [], [["zustand/persist", ThemeState]]>' is not
assignable to parameter of type 'StateCreator<ThemeState, [], []>'.
```

If you see `StateCreator` and a middleware name in an error, look for the missing `()` first.

**7. One giant store, or a store for one component**

One `useAppStore` holding the cart, the theme, the user and a form's half-typed text is hard to read and hard to test. Make one small store per job (`useCartStore`, `useThemeStore`). And if only one component uses a value, it's `useState`, not a store.

**8. Using `getState()` in JSX**

`<span>{useCartStore.getState().items.length}</span>` reads once and never updates, because `getState()` doesn't subscribe. Use the hook in JSX. Save `getState()` for event handlers, tests, and code outside React.

## Quick recap

- A Zustand **store** is shared state that lives outside your components. `create<T>()(...)` makes it and gives you back a hook. No provider needed.
- Keep **actions inside the store**, next to the data, so every rule lives in one place, just like a reducer.
- Always read with a **selector**. A component only re-renders when the piece it picked changes.
- A selector that returns a new object or array causes an infinite loop in Zustand 5. Use one call per value, or `useShallow`.
- `set` **merges** the top level, but nested arrays and objects still need copying ([chapter 11](../11-updating-objects-and-arrays/notes.md)).
- **Derive** totals with selector functions. Never store them.
- `persist` saves to `localStorage`, `devtools` shows every change, and `getState()` / `setState()` work outside React.
- Zustand is for **shared client state**. Server data belongs to TanStack Query, and one-component state belongs to `useState`.

---

**Next:** try the [exercises](exercises.md), then move on to [35 Redux Toolkit](../35-redux-toolkit/notes.md).
