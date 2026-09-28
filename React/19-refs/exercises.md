# 19 Refs: Exercises

**How to do these:**

- Work in your practice app, one folder per exercise: `src/ch19/ex1/`, and so on.
- For every exercise, keep the **Components** tab open and confirm your ref genuinely does **not** appear under the component's hooks the way state does — that's the clearest way to feel the state/ref distinction from the inside.
- An exercise is done when the behaviour is correct, VS Code shows no red squiggles, `npx tsc -b` prints nothing, and the Console has no errors.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): State or ref?

In `src/ch19/ex1/Ex1.tsx`, build a single component with **five** separate pieces of tracked information, and for each one, decide — and justify in a comment — whether it should be `useState` or `useRef`:

1. Whether a modal dialog is currently open (shown on screen).
2. How many times the component has rendered (for a debug message only you'll ever look at, printed to the Console, never shown on the page).
3. The text currently typed into a search box (shown on screen, live).
4. The id returned by `setInterval`, so a later button can call `clearInterval` on it.
5. Whether the user has scrolled past 100px on their **very first** visit only, used once to decide whether to show a "welcome" banner, and never checked again after that first decision (so re-checking it on every scroll event would be pointless work).

Build all five for real — wire up a modal, a real search box, a real timer with a start/stop button, and so on — using whichever tool you picked for each. If any of your choices turn out to be wrong once you see it running (something that should update the screen doesn't, or something flickers that shouldn't), fix it and write down what tipped you off.

<details>
<summary>Hint 1</summary>

Ask the question from the notes for each one: does the page need to visibly change when this value changes? Number 2 is the clearest "no." Number 3 is the clearest "yes." The others are worth talking through properly rather than guessing.

</details>

---

## Exercise 2 (Easy): Focus management

In `src/ch19/ex2/Ex2.tsx`, build a small login form: an email field, a password field, a **Log in** button, and a validation message area.

1. When the page first loads, the email field should already have focus, with no click needed.
2. Clicking **Log in** with an empty email field should show `Email is required` **and** move focus straight back into the email field.
3. Add a **Clear** button that empties both fields and refocuses the email field.
4. Do all of this using refs and `.focus()` — not `autoFocus` for every case, since requirement 2 needs to happen in response to a click, which `autoFocus` can't do at all.

<details>
<summary>Hint 1</summary>

For the very first focus (requirement 1), an effect with an empty dependency array, calling `.focus()` once after the first render, does the job. `autoFocus` on the `<input>` itself is also a completely legitimate choice for just this one case — try both and see which reads more clearly to you.

</details>

---

## Exercise 3 (Medium): A stopwatch, built entirely on what you know

In `src/ch19/ex3/Ex3.tsx`, build a stopwatch showing elapsed time as `MM:SS`, with **Start**, **Stop**, and **Reset** buttons.

Requirements:

1. The displayed time is **state** (it needs to redraw every second).
2. The interval's id is a **ref** (clearing it doesn't need to redraw anything).
3. **Stop** genuinely stops the interval — clicking **Start** again afterwards must not create a second, overlapping interval (test this the way you tested [chapter 17, exercise 3](../17-effects/exercises.md): click Start/Stop rapidly several times and confirm the time still counts up at exactly one second per second).
4. **Reset** sets the time back to zero and stops the timer if it was running.
5. Clean up the interval properly if the component itself is ever removed from the page while running — add a **Hide stopwatch** button elsewhere in your test page that unmounts it (conditionally render it), and confirm via a `console.log` in the cleanup that it really does get cleared rather than silently ticking away forever in the background.

<details>
<summary>Hint 1</summary>

This combines a `useRef` (for the interval id) with a `useEffect` (whose cleanup clears it) with `useState` (for the displayed seconds) — three tools from three different chapters, working together. Start it running with an effect keyed on an `isRunning` boolean, similar to [chapter 17, exercise 3](../17-effects/exercises.md), but store the interval id in a ref this time instead of leaving it as a local variable inside the effect.

</details>

---

## Exercise 4 (Medium): Read the DOM directly — a character-counting textarea

In `src/ch19/ex4/Ex4.tsx`, build a textarea for a "bio" field with a live-updating message underneath: `142 / 200 characters`, turning red past 200.

Then add a **genuinely ref-only** feature that state alone can't give you as cleanly: an **auto-growing** textarea that expands its own height to fit its content, with no scrollbar, up to a maximum of 10 lines (after which a scrollbar appears).

Requirements:

1. The character count is derived from **state**, the standard controlled-input way from [chapter 09](../09-forms/notes.md) — not read from the ref.
2. The auto-grow behaviour reads the textarea's **actual rendered scroll height** via a ref (`textareaRef.current.scrollHeight`) inside an effect that runs whenever the text changes, and sets the element's height directly via `style.height` on the real DOM node.
3. Confirm in a comment: why does the auto-grow measurement genuinely need a ref and a real DOM read, rather than something you could calculate purely from the string's length in state? (Think about what a very long single word versus many short words would do to the number of *lines*, versus the number of *characters*.)

<details>
<summary>Hint 1</summary>

A common working pattern: in the effect, first reset `textareaRef.current.style.height = "auto"` (so the box can shrink back down if text was deleted), then immediately read `scrollHeight` and set `style.height` to that value in pixels. Doing the reset first matters — skipping it means the box can grow but never shrink.

</details>

---

## Exercise 5 (Challenge): A generic "previous value" ref, and a real use for it

Build `usePrevious.ts` in `src/ch19/ex5/` — a small helper (you'll formalise this into a proper custom hook with the rules from [chapter 20](../20-custom-hooks/notes.md); for now just get the mechanism working) that, given any value, returns what that value was on the **previous** render:

```tsx
function usePrevious<T>(value: T): T | undefined {
  // your implementation, using useRef and useEffect
}
```

Then build `Ex5.tsx`: a component with a number input (controlled state, as usual) that shows:

```
Now: 42
Before: 37
Change: +5
```

Where "Before" comes from `usePrevious`, and "Change" is the difference — showing nothing (not `NaN`, not `0`) on the very first render, before there's a previous value to compare against.

Requirements:

1. `usePrevious` must be genuinely generic — prove it by also using it on a **string** piece of state elsewhere on the same page (a name field, say, showing "You changed your name from Maya to Priya" only at the instant it actually changes, and nothing the rest of the time).
2. Use TypeScript's generics syntax properly ([TypeScript chapter 08](../../TypeScript/08-generics/notes.md)) — no `any` anywhere in `usePrevious.ts`.
3. In a comment inside `usePrevious.ts`, explain precisely why the effect that updates the stored ref must have **no dependency array argument at all** (not `[]`, not `[value]`) for this to correctly reflect "last render's value" rather than something else. Walk through what would go wrong with each of the other two options.

<details>
<summary>Hint 1</summary>

```tsx
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
```

Note the starting value. In **React 19**, `useRef` requires an argument — `useRef<T>()` with empty brackets is a type error (`Expected 1 arguments, but got 0`). Older tutorials write it that way because React 18's types allowed it. Say what you mean instead: the type is `T | undefined`, and it starts as `undefined`.

Trace through two renders by hand, on paper, before you decide the dependency array question — what does `ref.current` hold **during** each render, versus what gets written into it **after**?

</details>
