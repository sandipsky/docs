# 13 Lifting State Up: Exercises

**How to do these:**

- Work in your practice app, one folder per exercise: `src/ch13/ex1/`, and so on.
- Several of these give you two components that **can't** talk to each other yet, on purpose. Get it running broken first, so you can see the actual symptom, before you fix it.
- An exercise is done when both components genuinely agree, VS Code shows no red squiggles, `npx tsc -b` prints nothing, and the Console is empty.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Two clocks, one truth

In `src/ch13/ex1/Ex1.tsx`, copy this broken starting point:

```tsx
import { useState } from "react";

function BrightnessSlider() {
  const [brightness, setBrightness] = useState(50);
  return (
    <input
      type="range"
      min={0}
      max={100}
      value={brightness}
      onChange={(e) => setBrightness(Number(e.target.value))}
    />
  );
}

function BrightnessPreview() {
  // needs to know the brightness... but from where?
  return <div style={{ width: 100, height: 100, background: `rgb(0,0,0)` }} />;
}

function Ex1() {
  return (
    <div>
      <BrightnessSlider />
      <BrightnessPreview />
    </div>
  );
}

export default Ex1;
```

1. Run it. The slider moves, but the preview box never changes shade. In a comment, explain in your own words *why* `BrightnessPreview` has no way to know the current value.
2. Lift `brightness` up into `Ex1`, following the three steps in the notes. `BrightnessSlider` should have **no `useState` left in it**.
3. Make `BrightnessPreview`'s box shade change with the value: `rgb(x, x, x)` where `x` is the brightness, 0 to 100 scaled to 0–255.
4. Add a third component, `BrightnessLabel`, showing `50%` in text, reading from the same lifted state.

<details>
<summary>Hint 1</summary>

Once `brightness` lives in `Ex1`, both `BrightnessSlider` and `BrightnessPreview` (and now `BrightnessLabel`) just take it as a prop. Only `BrightnessSlider` also needs a callback prop, because it's the only one that changes it.

</details>

---

## Exercise 2 (Easy): Search box and results, properly

Build `src/ch13/ex2/` with:

```ts
export type Book = {
  id: string;
  title: string;
  author: string;
};

export const books: Book[] = [
  { id: "1", title: "The Hobbit", author: "J. R. R. Tolkien" },
  { id: "2", title: "Dune", author: "Frank Herbert" },
  { id: "3", title: "Small Gods", author: "Terry Pratchett" },
  { id: "4", title: "The Left Hand of Darkness", author: "Ursula K. Le Guin" },
];
```

Three components:

- **`SearchBox`**: a controlled text input, no local state — everything comes from props.
- **`ResultCount`**: shows `2 of 4 books match "dune"`, or `4 of 4 books` when the search is empty.
- **`ResultsList`**: the filtered list, matching title **or** author, case-insensitive.

**`Ex2`** owns the one piece of state, `query`, and renders all three.

Then, in a comment: which component would you have picked as the "natural" place to put `query` if you'd started without reading this chapter? Was it the right choice, and why or why not?

<details>
<summary>Hint 1</summary>

The filtering itself is a derived value in `Ex2`, computed from `books` and `query` and passed down as the already-filtered array — `ResultsList` shouldn't need to know `query` exists at all. Compare that with `ResultCount`, which needs `query` itself (for the message) as well as the count.

</details>

---

## Exercise 3 (Medium): Tabs with a shared "unsaved changes" flag

This is a case where the thing you're sharing isn't the displayed data itself, but a flag *about* it.

In `src/ch13/ex3/`, build a two-tab settings page: **Profile** (a name field) and **Notifications** (two checkboxes). Only one tab's content shows at a time, switched by two tab buttons.

Requirements:

1. Typing in the name field, or toggling a checkbox, sets a shared `hasUnsavedChanges` flag to `true`.
2. Whenever the flag is `true`, a bar appears above the tabs: `You have unsaved changes.` with a **Save** button.
3. Clicking **Save** clears the flag (logging the current form values is enough — you don't need a real save).
4. Clicking a tab button while `hasUnsavedChanges` is `true` shows a confirmation via `window.confirm("You have unsaved changes. Switch tabs anyway?")`. Only actually switch if the person clicks OK.
5. Neither `ProfileTab` nor `NotificationsTab` should need to know the other exists.

<details>
<summary>Hint 1</summary>

Three things live in the parent: which tab is active, `hasUnsavedChanges`, and — since Save needs to know what to save — the form values themselves (or at minimum, the parent's callback props are how each tab reports "something changed").

</details>

<details>
<summary>Hint 2</summary>

`window.confirm` returns a boolean, synchronously — no promise, no callback ([JavaScript chapter 18](../../JavaScript/18-error-handling/notes.md) has a similar pattern with `try`/`catch` you can compare it to, though this one's much simpler). Use its return value directly to decide whether to switch.

</details>

---

## Exercise 4 (Medium): Two sliders that must add up to 100

A workout app splits a session between **Cardio** and **Strength**, as two percentage sliders that must always add up to exactly 100%.

Build `src/ch13/ex4/Ex4.tsx` with two `<input type="range">`s, each 0–100, and their labels showing the live percentage. Moving one must instantly adjust the other so they always sum to 100 — no button, no lag.

1. There must be only **one** piece of state.
2. Dragging Cardio to 70 makes Strength show 30, live, and vice versa.
3. Add a **Reset to 50/50** button.
4. Add a written summary below: `70% Cardio, 30% Strength — a cardio-focused session` (swap the wording for `strength-focused` below 50, and `a balanced session` at exactly 50).

<details>
<summary>Hint 1</summary>

Store just one number, say `cardio`. `strength` is `100 - cardio`, always — never stored. There's genuinely only one independent piece of information here, which is exactly the situation from the temperature converter in the notes.

</details>

<details>
<summary>Hint 2</summary>

Both sliders can be built from the same underlying component if you like — one showing `cardio` and calling `setCardio(value)`, the other showing `100 - cardio` and calling `setCardio(100 - value)` — but two separate, slightly different JSX blocks are completely fine too.

</details>

---

## Exercise 5 (Challenge): Master-detail with editing

The fullest version of the list-and-details pattern from the notes. In `src/ch13/ex5/`, start with:

```ts
export type Contact = {
  id: string;
  name: string;
  email: string;
  notes: string;
};

export const initialContacts: Contact[] = [
  { id: "1", name: "Maya", email: "maya@example.com", notes: "Prefers email." },
  { id: "2", name: "Tom", email: "tom@example.com", notes: "" },
  { id: "3", name: "Priya", email: "priya@example.com", notes: "Call after 5pm." },
];
```

Build:

- **`ContactList`**: shows names only, one per row, highlighting whichever is selected. Clicking a row selects it. Includes a **+ New contact** button.
- **`ContactDetails`**: shows the selected contact's full details in an **editable form** (name, email, notes). Changes save as you type — no separate Save button. Shows `Select a contact` when nothing's selected.
- **`ContactApp`**: owns everything — the contacts array and which id is selected — and puts the two side by side.

Requirements:

1. Editing a field in `ContactDetails` updates that contact in the array immediately, and `ContactList` reflects a name change **live**, as you type it.
2. **+ New contact** adds a blank contact, selects it immediately, and puts the cursor in the name field. (`autoFocus` on the input is enough — [chapter 19](../19-refs/notes.md) covers the more general tool.)
3. Deleting the selected contact (add a **Delete** button in `ContactDetails`) removes it from the list and clears the selection. If contacts remain, nothing needs to auto-select — `Select a contact` is a perfectly good result.
4. `ContactDetails` never reaches into the full `contacts` array itself — it only ever sees the one contact it's editing, and reports changes upward through a callback.
5. Selecting a contact that no longer exists (which can happen right after a delete) must not crash the app. Prove that it doesn't by deleting the currently selected contact and confirming the page still renders cleanly.

<details>
<summary>Hint 1</summary>

`ContactApp` looks up the selected contact with `contacts.find(...)`, which can come back `undefined` — that's requirement 5, and it's the same "find can fail" situation from earlier chapters. Pass `null` down to `ContactDetails` when there's no match, and let it handle that case itself, the same way you handled an empty list in [chapter 05](../05-conditional-rendering/notes.md).

</details>

<details>
<summary>Hint 2</summary>

`ContactDetails`'s prop for reporting a change is one function: `onChange: (updated: Contact) => void`. It builds the updated contact with a spread and calls `onChange` — `ContactApp` is the one that knows how to fold that into the array with `map`, from [chapter 11](../11-updating-objects-and-arrays/notes.md).

</details>

<details>
<summary>Hint 3</summary>

For requirement 2's cursor placement: `autoFocus` works nicely for "the field that was just created should start focused," but be aware it's a slightly blunt tool — it fires on mount, not on "this specific contact became selected." If the name field seems to steal focus at odd moments once you've built the whole thing, that's a real limitation you're seeing, not a mistake — it's part of what makes refs, in the next chapter but two, worth learning properly.

</details>
