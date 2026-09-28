# 10 Project: To-Do App: Exercises

These are **stretch goals**: extra features for your finished app. Do them in any order, and do as many as you like.

**How to do these:**

- Finish all 8 milestones first. Then commit your work, or copy the `todo-app` folder, so you've always got a working version to go back to.
- `index.css` already has styles for these goals. Look for "Styles for the stretch goals" near the bottom.
- Keep the Console and the **Components** tab open the whole time.
- After every goal, test the whole app again, not just the new bit. Ticking, filtering, and refreshing must all still work.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Dark mode

Planning tomorrow's tasks late at night is hard on the eyes. Add a button that switches the app between light and dark, and remember the choice.

1. A button in the top right saying `🌙 Dark` or `☀️ Light` — always what clicking it will *do*.
2. In dark mode, the wrapping `<div>` gets `className="app dark"`. The CSS does the rest.
3. The choice survives a refresh, saved under its own key, `"react-todo-theme"`.

**What you should see:** click `🌙 Dark`, and the app goes dark. Refresh — still dark. Your tasks are untouched.

Then answer in a comment: in the JavaScript version this needed a `classList.toggle` and a line in `render()`. What did it need here?

<details>
<summary>Hint 1</summary>

One boolean in state, and a derived class name: `const appClass = isDark ? "app dark" : "app";`

</details>

<details>
<summary>Hint 2</summary>

For saving, `localStorage` only stores strings. `String(isDark)` going in, and `saved === "true"` coming out, is the simplest honest version. Use the lazy initial state form again.

</details>

---

## Exercise 2 (Easy): Tick everything at once

Add a **Toggle all** control to the left of the input box.

1. If **any** task is unfinished, clicking it marks them all done.
2. If **all** tasks are already done, clicking it marks them all undone.
3. Its label says what it will do: `Mark all done` or `Mark all undone`.
4. It doesn't appear at all when the list is empty.
5. It respects the current filter in one specific way: it always acts on **every** task, not just the visible ones. (Think about why that's the less surprising choice, and write a sentence on it.)

<details>
<summary>Hint 1</summary>

`tasks.every((task) => task.done)` tells you whether they're all done. One `map` handles both directions:

```tsx
const allDone = tasks.every((task) => task.done);
updateTasks(tasks.map((task) => ({ ...task, done: !allDone })));
```

</details>

---

## Exercise 3 (Medium): Honest empty states

Right now `TaskList` says "Nothing to do. Enjoy your day!" whenever its list is empty — even on the **Completed** tab when you simply haven't finished anything. That's not just untidy; it's wrong.

Make the message fit the situation:

| Situation | Message |
|---|---|
| No tasks at all | Nothing to do. Enjoy your day! |
| Tasks exist, **Active** tab, none active | All done. Nice work! |
| Tasks exist, **Completed** tab, none completed | Nothing finished yet. |

Rules:

1. `TaskList` must not import the filter or reach for the full task list itself. It shows what it's given.
2. So the message has to arrive as a **prop**. Decide its type, and work the message out in `App`.
3. When you're done, ask yourself whether `TaskList` is better or worse for this change. There's a real argument both ways, and either answer is fine as long as you can say why.

<details>
<summary>Hint 1</summary>

An `emptyMessage: string` prop is the straightforward version. `emptyMessage: ReactNode` ([chapter 04](../04-props/notes.md)) lets `App` pass whole JSX, which is more flexible and about the same amount of code.

</details>

<details>
<summary>Hint 2</summary>

Working out the message in `App` is a chain of conditions that's easier as an `if`/`else if` into a variable than as nested ternaries ([chapter 05](../05-conditional-rendering/notes.md)).

</details>

---

## Exercise 4 (Medium): Edit a task

Let people fix a typo without deleting and retyping.

1. Double-clicking a task's text turns it into a text box holding the current text, with the cursor in it.
2. **Enter** or clicking away saves it. **Escape** cancels and puts the original text back.
3. Saving an empty task deletes it instead.
4. Only one task can be in edit mode at a time.
5. Ticking and deleting still work normally; editing must not fire when you click the tick box or the `×`.

This is the hardest of these goals, and it's the one that will teach you the most about where state belongs.

<details>
<summary>Hint 1</summary>

The first real decision: does "which task is being edited" live in `TaskItem` or in `App`? Requirement 4 answers it. If each row kept its own flag, two rows could both be editing. Keep `editingId: string | null` in `App`.

</details>

<details>
<summary>Hint 2</summary>

The half-typed text is different. Only the row being edited cares about it, so a `useState` inside `TaskItem` is right — start it from `task.text`.

</details>

<details>
<summary>Hint 3</summary>

`onDoubleClick` on the `<span>`, and `onKeyDown` on the input checking `event.key === "Enter"` or `"Escape"`. `onBlur` handles "clicking away".

</details>

<details>
<summary>Hint 4</summary>

Getting the cursor into the box automatically needs `autoFocus` on the input. That works fine here. The general tool for "do something to a real element on the page" is a ref, in [chapter 19](../19-refs/notes.md).

</details>

<details>
<summary>Hint 5</summary>

For requirement 5, `stopPropagation` ([chapter 07](../07-events/notes.md)) — or simply put the `onDoubleClick` only on the text `<span>`, not the whole `<li>`, which avoids the problem instead of fixing it. The second is better. Prefer not creating a conflict over handling one.

</details>

---

## Exercise 5 (Challenge): Undo

Everyone deletes the wrong task eventually. Give them a way back.

1. After any destructive action — deleting a task, or Clear completed — a bar appears at the bottom: `Task deleted.` with an **Undo** button.
2. Undo puts things back exactly as they were, including the task's position in the list and whether it was ticked.
3. The bar disappears when you undo, and when you do anything else.
4. Undo works for **Clear completed** too, bringing every cleared task back in its original place.
5. Only the most recent action can be undone.

<details>
<summary>Hint 1</summary>

The simplest design that satisfies all five rules: keep one piece of state holding the previous **whole task list**, plus a message.

```tsx
type UndoState = {
  tasks: Task[];
  message: string;
};

const [undo, setUndo] = useState<UndoState | null>(null);
```

Before a destructive change, store the current array. To undo, put it straight back. Requirement 2 comes free, because you saved the whole thing.

</details>

<details>
<summary>Hint 2</summary>

That works because you've never changed an array in place. The old array is still intact and correct — you only ever built new ones alongside it. Keeping a snapshot of mutable data would have been far harder. This is the payoff for a rule that has felt like a chore all chapter.

</details>

<details>
<summary>Hint 3</summary>

For requirement 3, clear the undo state at the top of every other handler. Rather than remembering it in four places, call `setUndo(null)` inside `updateTasks`, and have the destructive handlers set it *after* they call `updateTasks`.

</details>

<details>
<summary>Hint 4</summary>

If you want the bar to fade away on its own after a few seconds, you need a timer that's cleaned up properly when the component goes away — and that's exactly what [chapter 17](../17-effects/notes.md) is for. Leave it manual for now.

</details>

---

## When you're done

You've finished Level 1. Before moving on, it's worth a few minutes writing down:

- One thing that was much easier in React than in plain JavaScript.
- One thing that was harder or more fiddly.
- One thing you still don't feel sure about.

That last one is the useful one. Bring it to Claude and ask.
