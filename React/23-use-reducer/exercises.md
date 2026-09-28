# 23 useReducer: Exercises

**How to do these:**

- Work in your practice app, one folder per exercise: `src/ch23/ex1/`, and so on. Put each reducer and its types in their own file, separate from the component.
- **Type every action union properly, and add the `never` exhaustiveness check** to every reducer from exercise 1 onward. Half the value of this chapter is in those two habits.
- An exercise is done when the behaviour is correct, VS Code shows no red squiggles, `npx tsc -b` prints nothing, and the Console is empty.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): A counter with rules

In `src/ch23/ex1/`, build a counter with `useReducer` whose state is `{ count: number; step: number }` and whose actions are `incremented`, `decremented`, `step_changed`, and `reset`.

Rules the reducer must enforce (all of them in the reducer, none in the component):

1. The count can never go below 0 or above 100.
2. Changing the step never changes the count.
3. `reset` returns both count and step to their starting values.

Then break things on purpose and write down the exact error each time:

4. `dispatch({ type: "incremeted" })` — a typo in the action name.
5. `dispatch({ type: "step_changed" })` — the required `step` missing.
6. Inside `case "reset"`, try to read `action.step`.
7. Add a fifth action type to the union, `doubled`, but **don't** add a `case` for it. What does the `never` check say, and which line does it point at?

<details>
<summary>Hint 1</summary>

Question 7 is the one worth savouring. Without the `never` check, adding an action type to the union and forgetting to handle it produces no error at all — just silently broken behaviour at runtime. With it, you get a compile error before you've even saved.

</details>

---

## Exercise 2 (Easy): Convert a `useState` component

Here's a working component in `src/ch23/ex2/Ex2.tsx`. Your job is to convert it, not to redesign it — the behaviour afterwards must be identical.

```tsx
function Ex2() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  function handleOpen() {
    setIsOpen(true);
    setErrors([]);
  }

  function handleClose() {
    setIsOpen(false);
    setTitle("");
    setBody("");
    setErrors([]);
  }

  function handleSubmit() {
    const found: string[] = [];
    if (title.trim() === "") found.push("Title is required");
    if (body.trim().length < 10) found.push("Body must be at least 10 characters");

    if (found.length > 0) {
      setErrors(found);
      return;
    }

    console.log("Submitting", { title, body });
    setIsOpen(false);
    setTitle("");
    setBody("");
    setErrors([]);
  }

  // ...a modal with two inputs, a Submit button, and the errors listed
}
```

1. Count how many times `setErrors([])` appears, and how many times the "clear the form" sequence is repeated. Write the numbers in a comment.
2. Convert it to a single `useReducer`. The state is one object; the actions are `opened`, `closed`, `title_changed`, `body_changed`, and `submitted`.
3. Notice what happens to the repetition in step 1 — where does "clear the form" live now?
4. Add a new rule: **closing the modal with unsaved text should keep the text**, so reopening restores it. How many places did you have to change?

<details>
<summary>Hint 1</summary>

Validation is a pure function of the state, so it can live in the reducer — `case "submitted"` computes the errors and either stores them or clears the form. But the `console.log` is a side effect, and reducers must be pure. Think about where that has to go instead, and what the reducer should return so the component knows it's safe to do it.

</details>

<details>
<summary>Hint 2</summary>

For the side-effect problem: one clean approach is for the component to check the state *after* dispatching — but remember the state you can read in the handler is the old snapshot ([chapter 12](../12-how-rendering-works/notes.md)). A simpler approach for this exercise: compute validity in the handler (calling a shared `validate(state)` function the reducer also uses), do the logging there, and dispatch only if it's valid.

</details>

---

## Exercise 3 (Medium): A shopping cart reducer

In `src/ch23/ex3/`, build a cart with `useReducer`. State:

```ts
type CartState = {
  items: CartItem[];
  discountCode: string | null;
};

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};
```

Actions: `added`, `removed`, `quantity_changed`, `discount_applied`, `discount_removed`, `cleared`.

Rules, all enforced in the reducer:

1. Adding a product already in the cart increases its quantity instead of adding a second line.
2. Quantity can never go below 1 — a `quantity_changed` that would take it to 0 removes the item entirely.
3. `discount_applied` only accepts the code `SAVE10`; anything else leaves the state completely unchanged (return the same state object).
4. `cleared` empties the items **and** removes any discount.

The component shows the items, a subtotal, the discount (10% off, when applied), and a total. None of those three numbers is state.

5. Write a comment listing which of your rules would have been scattered across multiple handlers in a `useState` version.

<details>
<summary>Hint 1</summary>

Rule 2 is a nice example of a reducer doing real work: one action, two possible outcomes, decided in one place. The component just dispatches `quantity_changed` and doesn't need to know that a decrement from 1 means removal.

</details>

<details>
<summary>Hint 2</summary>

For rule 3, returning the *exact same* `state` object (not a copy) is the correct way to say "nothing changed" — React compares by reference, so it can skip re-rendering entirely ([chapter 11](../11-updating-objects-and-arrays/notes.md)).

</details>

---

## Exercise 4 (Medium): Undo and redo, the reducer way

You built undo in [chapter 11's exercises](../11-updating-objects-and-arrays/exercises.md) by hand. A reducer makes it dramatically cleaner, because every change already flows through one function.

In `src/ch23/ex4/`, build a simple drawing-list app (add a shape, remove a shape, change a shape's colour — no actual canvas needed, a list of coloured boxes is fine) with this state:

```ts
type HistoryState<T> = {
  past: T[];
  present: T;
  future: T[];
};
```

Requirements:

1. The reducer handles your normal actions (`shape_added`, `shape_removed`, `colour_changed`) **plus** `undo` and `redo`.
2. Every normal action pushes the current `present` onto `past` and clears `future`.
3. `undo` moves `present` to `future` and pops the last item off `past`.
4. `redo` is the mirror image.
5. Undo and redo buttons are disabled when their stack is empty.
6. No mutation anywhere — `past` and `future` are rebuilt with `slice` and spreads.

Then answer in a comment: what made this so much easier to add than it was in chapter 11?

<details>
<summary>Hint 1</summary>

The answer to the last question is the real lesson: there's exactly **one** place where state changes, so "remember the previous state" is one line, applied to every action at once — rather than something you have to remember in each of six handlers.

A neat way to express that: handle `undo`/`redo` in a `switch`, and for everything else, compute the new `present` and wrap it with `{ past: [...state.past, state.present], present: next, future: [] }`.

</details>

---

## Exercise 5 (Challenge): Reducer plus context — a real app shell

Combine this chapter with [chapter 22](../22-context/notes.md) to build state that any component can read and change, with zero props.

In `src/ch23/ex5/`, build a small task board:

**`taskReducer.ts`** — state `{ tasks: Task[]; filter: Filter; editingId: string | null }`, with actions `added`, `toggled`, `deleted`, `edited`, `edit_started`, `edit_cancelled`, `filter_changed`, `cleared_completed`.

Enforce these rules **in the reducer**:

1. Deleting the task currently being edited also ends the edit.
2. `cleared_completed` ends the edit if the edited task was completed and got cleared.
3. `edit_started` on a task that doesn't exist is ignored (state unchanged).
4. An `edited` action with empty text deletes the task instead.

**`TaskProvider.tsx`** — provides state and dispatch through **two separate contexts**, with a guard hook for each.

**The components** — `AddTaskForm`, `FilterBar`, `TaskList`, `TaskRow`, `Footer` — nested at least three levels deep, and **not one of them may take a single prop related to tasks**. Every one gets what it needs from the hooks.

Finally:

5. Add a `console.log` to `FilterBar` (which only dispatches, and reads only `filter`). Add and toggle several tasks. Does `FilterBar` re-render every time? Explain what you see, and what would change if state and dispatch shared one context.

<details>
<summary>Hint 1</summary>

For question 5: `FilterBar` reads the state context (for `filter`), so it *will* re-render when tasks change — splitting the contexts helps components that dispatch *only*. If you want to see the difference properly, add a `DeleteAllButton` that uses only `useTaskDispatch()` and nothing else, and watch its render count stay flat.

</details>

<details>
<summary>Hint 2</summary>

Rule 4 is a good test of whether your action names are honest. `edited` with empty text deleting the task is a *rule*, and it belongs in the reducer — the component should just dispatch `edited` with whatever was typed and not know about the special case at all.

</details>
