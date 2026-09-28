# 09 Forms: Exercises

**How to do these:**

- Work in your practice app, one folder per exercise: `src/ch09/ex1/`, and so on.
- Keep the **Components** tab open and watch the state change as you type. Watching a string grow one letter at a time is the fastest way to believe how controlled inputs work.
- Test every form by **pressing Enter** as well as clicking the button. Half of all form bugs only show up that way.
- An exercise is done when it works however you use it, VS Code shows no red squiggles, `npx tsc -b` prints nothing, and the Console has no errors or warnings.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Feel the loop

In `src/ch09/ex1/Ex1.tsx`:

```tsx
import { useState } from "react";

function Ex1() {
  const [name, setName] = useState("");

  return (
    <div>
      <label htmlFor="name">Your name</label>
      <input id="name" type="text" value={name} />
      <p>Hello, {name}!</p>
    </div>
  );
}

export default Ex1;
```

1. Try typing in the box. What happens, and what does the Console say?
2. Fix it with an `onChange`.
3. Change the handler to `setName(event.target.value.toUpperCase())`. Type `maya`. Explain in a comment why the box itself shows capitals, even though you typed lowercase.
4. Put it back, and add:
   - a live count: `4 / 20 characters`,
   - the box refusing anything over 20 characters (do it in the handler, not with `maxLength`),
   - `Hello, stranger!` when the box is empty,
   - a **Clear** button that empties it.
5. Now delete `value={name}` but keep the `onChange`. Type something. Does the greeting still work? Does the Clear button still work? Explain what you learned about what `value` is actually for.

<details>
<summary>Hint 1</summary>

For question 3, read the four-step loop in the notes. The letter in the box isn't the one the browser put there.

</details>

<details>
<summary>Hint 2</summary>

For question 5: the greeting will work, and Clear will not. That's the difference between "React is reading the box" and "React is driving the box".

</details>

---

## Exercise 2 (Easy): Sign-up form

In `src/ch09/ex2/Ex2.tsx`, build a sign-up form with:

- **Email** (a text box)
- **Password** (`type="password"`)
- **I agree to the terms** (a checkbox)
- A **Create account** button

Rules:

1. One `useState` per field. Every field has a real `<label>`.
2. The button is disabled unless the email contains an `@`, the password is at least 8 characters, and the box is ticked.
3. Under the password, show `Password must be at least 8 characters` in red — but only once someone has started typing in it.
4. Submitting logs the email and the password length (never the password itself), then clears the whole form, tick box included.
5. Pressing Enter in the email box submits.
6. Add a **Clear** button next to Submit that empties everything without submitting. Get this right: it's the one in mistake 8.

<details>
<summary>Hint 1</summary>

The checkbox is `checked={agreed}` and `onChange={(e) => setAgreed(e.target.checked)}`. Not `value`.

</details>

<details>
<summary>Hint 2</summary>

Work out `const canSubmit = ...` above the `return` and use `disabled={!canSubmit}`. Three conditions in the JSX would be unreadable.

</details>

<details>
<summary>Hint 3</summary>

For the Clear button inside a `<form>`, see mistake 8 in the notes. The default `type` of a button inside a form is `submit`.

</details>

---

## Exercise 3 (Medium): Pizza order

One form, every input type. In `src/ch09/ex3/Ex3.tsx`:

| Field | Control | Options |
|---|---|---|
| Your name | text | |
| Size | radio | Small ($8), Medium ($11), Large ($14) |
| Crust | select | Thin, Thick, Stuffed (+$2) |
| Toppings | checkboxes | Mushroom, Olives, Pepper, Ham (each +$1.50) |
| How many | number | 1 to 10 |
| Notes for the kitchen | textarea | max 200 characters |

Requirements:

1. A live **order summary** underneath that updates as you change anything, ending with a total price. Nothing in that summary is stored in state.
2. Toppings are one piece of state — an array of the chosen topping names — not four booleans.
3. The quantity box must survive being cleared. Empty it completely: no stray `0` should appear, and the total should handle it sensibly.
4. The notes box shows `12 / 200` and won't go over.
5. Submitting logs the whole order as one object and shows `Thanks, Maya! Your order is in.` in place of the form, with a **Start another order** button that resets everything.

<details>
<summary>Hint 1</summary>

For toppings, `useState<string[]>([])`. Each checkbox's `checked` is `toppings.includes(name)`, and its handler toggles: filter it out if it's there, spread it in if it isn't. Same shape as the seat picker in [chapter 08](../08-state/exercises.md).

</details>

<details>
<summary>Hint 2</summary>

For the prices, a lookup object keyed by the option name beats a chain of ternaries. That's back in [chapter 05](../05-conditional-rendering/notes.md), and `Record<Size, number>` types it so you can't forget one.

</details>

<details>
<summary>Hint 3</summary>

For requirement 3, read the warning about number inputs in the notes. Keep the state as a **string**, and convert where you calculate: `Number(quantity) || 0`, or check for `""` explicitly.

</details>

<details>
<summary>Hint 4</summary>

Six fields is past the point where separate `useState` calls feel good. Try it that way first, then look at the object-plus-one-handler version in the notes and decide which you'd rather come back to in a month. There isn't a wrong answer; noticing the trade-off is the exercise.

</details>

---

## Exercise 4 (Medium): Searchable, filterable list

Forms aren't only for sending data. Here they drive what's on screen. In `src/ch09/ex4/`, start with:

```ts
export type Book = {
  id: string;
  title: string;
  author: string;
  year: number;
  genre: "fiction" | "science" | "history";
  available: boolean;
};
```

Write eight books of your own across all three genres, some available and some not.

Build controls above the list:

- A **search box** matching the title *or* the author, ignoring capitals.
- A **genre select**, including an `All genres` option.
- An **Available only** checkbox.
- A **sort select**: `Title A–Z`, `Newest first`, `Oldest first`.
- A **Reset filters** button.

And below them:

1. The filtered, sorted list.
2. `Showing 3 of 8 books`.
3. `No books match your search.` when nothing does — with the controls still on screen, so people can undo what they did.

Rules:

- The book list itself is **not** state. Neither is the filtered list. Only the four control values are.
- Sorting must not change the original array.
- Type the genre select's state so only the three genres plus `"all"` are possible.

<details>
<summary>Hint 1</summary>

This is the big idea of the exercise: filtering is a **derived value**. Above the `return`, chain `filter` and then sort a copy. Every keystroke re-renders, so it's always right, and there's nothing to keep in sync.

</details>

<details>
<summary>Hint 2</summary>

`title.toLowerCase().includes(search.toLowerCase())` handles the case-insensitive match, and an empty search matches everything for free, because every string includes `""`.

</details>

<details>
<summary>Hint 3</summary>

`useState<Genre | "all">("all")` types the select. Then a wrong `<option value="fictoin">` is still not caught (option values are plain strings), but every *use* of the state is.

</details>

<details>
<summary>Hint 4</summary>

Reset is one handler that calls all four setters. React batches them into one re-render.

</details>

---

## Exercise 5 (Challenge): Multi-step booking form

The final rehearsal before the project. In `src/ch09/ex5/`, build a three-step restaurant booking form. One step on screen at a time, with `Back` and `Next` buttons and a `Step 2 of 3` indicator.

**Step 1 — Who:** name (required), email (must contain `@` and `.`), phone (optional).

**Step 2 — When:** date (`type="date"`), time (a select of `18:00` to `21:00` in half hours), number of guests (1 to 12).

**Step 3 — Extras:** a textarea for dietary requirements, a checkbox for `It's a birthday`, and a radio group for `Inside` / `Outside` / `No preference`.

Then a **review screen** listing everything, with an **Edit** link next to each section that jumps back to that step with the answers still filled in, and a **Confirm booking** button.

Requirements:

1. **`Next` is disabled until the current step is valid.** Steps 2 and 3 have their own rules; step 3 is always valid.
2. Errors appear **only after a field has been left**, using `onBlur`. A blank form must not be covered in red before you've touched it.
3. Going `Back` and `Next` again keeps everything you typed. Nothing is ever lost.
4. Confirming logs the whole booking as one object and shows a confirmation screen with a **Make another booking** button that resets everything, including the step.
5. At most **three** pieces of state for the whole form's data. The step number and the touched-fields tracking are separate and don't count.
6. Every field has a real label, and pressing Enter never reloads the page on any step.

<details>
<summary>Hint 1</summary>

For requirement 5, one object per step is a natural fit: `who`, `when`, and `extras`. Each gets its own type and its own `useState`. That also makes "is this step valid?" three small, separate functions.

</details>

<details>
<summary>Hint 2</summary>

Write one `const isStepValid = ...` above the `return`, worked out from the current step. Then `disabled={!isStepValid}` on Next, and the button logic never changes.

</details>

<details>
<summary>Hint 3</summary>

For "touched", a `Set` of field names is tidier than a boolean each ([JavaScript chapter 35](../../JavaScript/35-map-and-set/notes.md)). Remember to make a **new** Set when you add to it: `setTouched(new Set(touched).add("email"))`. A `string[]` works just as well if a Set feels like a stretch.

</details>

<details>
<summary>Hint 4</summary>

Requirement 3 comes free if you build it right, and that's worth noticing. Because all the answers live in state in the parent, moving between steps is only changing which step number is showing. Nothing is unmounted and re-created, so nothing can be lost. Compare that with how much work this would have been in [JavaScript chapter 22](../../JavaScript/22-forms/notes.md).

</details>

<details>
<summary>Hint 5</summary>

Build it one step at a time, and get the whole flow working with step 1 alone before you add step 2. A three-step form built all at once is a three-step form you can't debug.

</details>
