# 11 Updating Objects and Arrays in State: Exercises

**How to do these:**

- Work in your practice app, one folder per exercise: `src/ch11/ex1/`, and so on.
- Watch the **Components** tab as you click. For several of these, the bug you're asked to find won't show up on the page at all — only in whether the state actually changed underneath it.
- An exercise is done when the page behaves correctly, VS Code shows no red squiggles, `npx tsc -b` prints nothing, and the Console is empty.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Fix the settings form

Copy this into `src/ch11/ex1/Ex1.tsx`:

```tsx
import { useState } from "react";

type Settings = {
  displayName: string;
  notifications: {
    email: boolean;
    sms: boolean;
  };
};

function Ex1() {
  const [settings, setSettings] = useState<Settings>({
    displayName: "Maya",
    notifications: { email: true, sms: false },
  });

  function toggleEmail() {
    settings.notifications.email = !settings.notifications.email;
    setSettings(settings);
  }

  return (
    <div>
      <p>Email notifications: {settings.notifications.email ? "On" : "Off"}</p>
      <button onClick={toggleEmail}>Toggle email</button>
    </div>
  );
}

export default Ex1;
```

1. Click the button. What do you expect to happen, and what actually happens?
2. Open the Components tab and watch `settings` while you click. What do you see there, compared to the page?
3. Fix `toggleEmail` so it works, copying only as deep as you need to.
4. Add a second toggle for `sms`, using the same pattern.

<details>
<summary>Hint 1</summary>

Two separate problems are stacked here: `settings.notifications.email = ...` mutates a nested object, and `setSettings(settings)` passes back the exact same reference it started with. Read "Why React needs a new reference" in the notes.

</details>

<details>
<summary>Hint 2</summary>

The fix needs two spreads, nested: a new `notifications` object, inside a new `settings` object.

</details>

---

## Exercise 2 (Easy): Shopping cart quantities

In `src/ch11/ex2/Ex2.tsx`, start from:

```tsx
type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

const initialCart: CartItem[] = [
  { id: "1", name: "Notebook", price: 3.5, quantity: 2 },
  { id: "2", name: "Backpack", price: 34.99, quantity: 1 },
];
```

Build a cart with three buttons per row: `+`, `-`, and `Remove`. Rules:

1. `+` and `-` change only that row's `quantity`. Quantity can't go below 1 — use `-` at 1 to test it stays at 1 (don't let it hit 0).
2. `Remove` takes the row out of the array entirely.
3. A total at the bottom, worked out from `price * quantity` across every item, never stored in state.
4. None of your code may use `push`, `splice`, or change an item's fields directly.

Then, in a comment: which lines of your `+` handler are "copy the array" and which are "copy the item"? Point at them.

<details>
<summary>Hint 1</summary>

`map`, with a spread on the matching item: `items.map((item) => (item.id === id ? { ...item, quantity: item.quantity + 1 } : item))`.

</details>

<details>
<summary>Hint 2</summary>

For the floor of 1, `Math.max(1, item.quantity - 1)` is tidier than an `if` inside the map.

</details>

---

## Exercise 3 (Medium): Contact book with addresses

In `src/ch11/ex3/`, start with:

```ts
export type Contact = {
  id: string;
  name: string;
  favourite: boolean;
  address: {
    city: string;
    country: string;
  };
};

export const contacts: Contact[] = [
  { id: "1", name: "Maya", favourite: false, address: { city: "Leeds", country: "UK" } },
  { id: "2", name: "Priya", favourite: true, address: { city: "Pune", country: "India" } },
  { id: "3", name: "Tom", favourite: false, address: { city: "Bristol", country: "UK" } },
];
```

Build a page where each contact shows their name, city and country, and:

1. A ⭐ button toggles `favourite`. Favourited contacts sort to the top — **derive** the sorted order, don't store it.
2. Each contact has an **Edit city** button that turns the city into a text box (one contact editable at a time — reuse the "which one is being edited" idea from the [chapter 10 stretch goals](../10-project-todo-app/exercises.md) if you did them). Saving updates only that contact's `address.city`, leaving `country` and everything else about every other contact untouched.
3. A **Move all UK contacts to "United Kingdom"** button that rewrites the `country` field on every UK contact in one click, and leaves non-UK contacts completely alone — not even a new object for them.

For requirement 3, prove it in a comment: log each contact's `address` object before and after clicking, using `===`, and confirm which ones are the *same reference* afterwards and which aren't.

<details>
<summary>Hint 1</summary>

For requirement 3, the `map` callback needs an `if` inside it (or a ternary): change `country` only when `address.country === "UK"`, and return the contact completely unchanged otherwise — not even wrapped in a fresh `{ ...contact }`.

</details>

<details>
<summary>Hint 2</summary>

For the sort, `[...contacts].sort((a, b) => Number(b.favourite) - Number(a.favourite))` puts `true` (favourited) first. `Number(true)` is `1`.

</details>

---

## Exercise 4 (Medium): Kanban board

A classic nested shape: a board holds columns, and each column holds cards. In `src/ch11/ex4/`, start with:

```ts
export type Card = {
  id: string;
  text: string;
};

export type Column = {
  id: string;
  title: string;
  cards: Card[];
};

export const initialColumns: Column[] = [
  { id: "todo", title: "To Do", cards: [{ id: "c1", text: "Design the logo" }] },
  { id: "doing", title: "Doing", cards: [{ id: "c2", text: "Build the homepage" }] },
  { id: "done", title: "Done", cards: [] },
];
```

Keep **one** piece of state: `columns`. Build:

1. Each column shows its title, its cards, and a small form to add a new card **to that column** (give each card a `crypto.randomUUID()`).
2. Every card has a `×` that removes it from its column.
3. Every card has a `→` button that moves it to the **next** column (To Do → Doing → Done). On the Done column, there's no `→` at all.

Requirement 3 is the point of the exercise: one card has to leave one column's array and join another's, in a single state update, without ever mutating either array.

<details>
<summary>Hint 1</summary>

Work out the destination column's id first (a small lookup: `{ todo: "doing", doing: "done" }`), then build the new `columns` array with one `map`: for the source column, filter the card out; for the destination column, add it; every other column, leave completely alone.

</details>

<details>
<summary>Hint 2</summary>

You need the *card itself* before you filter it out, or you'll have nothing to add to the destination column. Find it first with `.find()`, and keep in mind `find` can come back `undefined` — [TypeScript chapter 06](../../TypeScript/06-unions-and-narrowing/notes.md) will make you handle that.

</details>

---

## Exercise 5 (Challenge): Undo, properly

This exercise makes you feel the payoff of never mutating state. In `src/ch11/ex5/`, take your Kanban board from Exercise 4 (or rebuild a simpler version if you skipped it) and add:

1. Every change — add a card, remove a card, move a card — pushes the **previous** `columns` value onto a history stack before applying the change.
2. An **Undo** button pops the most recent entry off that stack and makes it the current state.
3. **Redo** works too: undoing pushes the state you just left onto a separate redo stack, and any *new* change clears the redo stack.
4. Undo/Redo buttons are disabled when there's nothing to undo/redo.
5. Do this **without `structuredClone` anywhere**, and without any array or object in your history ever being mutated after being stored.

Then answer in a comment: why does storing a plain array of past `columns` values work correctly here, when it would *not* work if any of your update functions had ever mutated `columns` in place? Be specific about what would go wrong.

<details>
<summary>Hint 1</summary>

Two extra pieces of state: `past: Column[][]` and `future: Column[][]`. Every "real" change does three things: push the current `columns` onto `past`, apply the change, clear `future`.

</details>

<details>
<summary>Hint 2</summary>

Undo: take the last entry off `past`, push the *current* `columns` onto `future`, and set `columns` to that entry. Redo is the mirror image. `slice(0, -1)` and `at(-1)` (or `[array.length - 1]`) are useful here, and both make copies rather than mutating.

</details>

<details>
<summary>Hint 3</summary>

For the final question: if an old update had ever done `card.text = newText` instead of building a new card, then the copy of `columns` sitting in `past` would contain that *same* card object — so mutating it "later" would silently rewrite history too. The whole exercise only works because every past snapshot is made of objects nothing will ever touch again.

</details>
