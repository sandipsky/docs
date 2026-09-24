# 24 Project: To-Do List App: Exercises

These are **stretch goals**: extra features for your finished to-do app. Do them in any order, and do as many as you like.

**How to do these:**

- Finish all 8 milestones first. Then make a copy of your `my-todo-app` folder, so you always have a working version to go back to.
- `style.css` already has the styles these goals need. Look for "Extra styles for the stretch goals" at the bottom.
- Same routine as before: save, refresh, and keep the Console open (`F12`) to spot errors.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Dark mode

Planning tomorrow's tasks late at night is hard on the eyes. Add a button that switches the app between light and dark, and remember the choice.

Add this button to `index.html`, as the first thing inside `<body>` (just before `<main>`):

```html
<button id="theme-button" class="theme-button" type="button">Dark mode</button>
```

1. Clicking the button switches the class `dark` on and off on the `<body>` element. The CSS does the rest.
2. The button always says what clicking it will do: "Dark mode" while the app is light, "Light mode" while it's dark.
3. Save the choice under its own key, `"todo-app-theme"`, and apply it when the page loads.

**What you should see:** click "Dark mode". The app turns dark, and the button now says "Light mode". Refresh, and it's still dark. Click "Light mode", refresh, and it stays light.

<details>
<summary>Hint 1</summary>

`document.body` is the `<body>` element. `classList.toggle("dark")` switches the class, and `classList.contains("dark")` tells you whether dark mode is on right now ([chapter 20](../20-dom-basics/notes.md)).

</details>

<details>
<summary>Hint 2</summary>

A boolean is all you need to save. Your `load` helper, with `false` as the default, gives new visitors the light theme.

</details>

---

## Exercise 2 (Easy): Keyboard shortcuts

People who use the app a lot love keyboard shortcuts. Add two:

- Press `/` anywhere on the page to jump straight into the "New task" box, without typing a `/` in it.
- Press `Escape` while typing in the box to empty it and leave it.

**What you should see:** click on an empty part of the page, then press `/`. The cursor is now in the "New task" box, and the box is still empty. Type something and press `Escape`: the text disappears, and the cursor leaves the box. Typing a task like `Buy 1/2 dozen eggs` still works: the `/` shortcut must not get in the way while you're typing in the box.

<details>
<summary>Hint 1</summary>

Listen for `keydown` on `document`, and check `event.key`: it's `"/"` or `"Escape"` ([chapter 21](../21-events/notes.md)).

</details>

<details>
<summary>Hint 2</summary>

`todoInput.focus()` puts the cursor in the box, and `todoInput.blur()` takes it out again. Call `event.preventDefault()` for the `/` shortcut, so the browser doesn't type the slash for you.

</details>

<details>
<summary>Hint 3</summary>

When the user is typing in the box, `event.target` is the box itself. That's how you can tell "a `/` for the shortcut" from "a `/` inside a task".

</details>

---

## Exercise 3 (Medium): Search box

With 50 tasks on the list, finding "dentist" takes a while. Add a search box that shows only the tasks containing what you type.

Add this right after the filter buttons' `<div>` in `index.html`:

```html
<input id="search-input" class="search-input" type="search" placeholder="Search tasks" aria-label="Search tasks">
```

1. Keep the search text as a new piece of state, like `currentFilter`.
2. Every time the user types in the box, update that state and render.
3. Show only the tasks that match the filter **and** the search. The search ignores upper and lower case, and extra spaces around the search text.
4. The counter still counts all the tasks that aren't done.

**What you should see:** with the tasks "Buy milk", "Book the dentist" and "Call the dentist back", type `dentist`. Only the two dentist tasks are left. `DENTIST` finds the same two. Click "Active" while searching, and you see only the dentist tasks that aren't done. Empty the search box, and everything comes back.

> **Coming up:** this redraws the list on every single keystroke. That's fine for a to-do list, but a search that asks a server for results would send far too many requests. [Chapter 34](../34-debounce-and-throttle/notes.md) teaches **debounce**, which waits until the user stops typing.

<details>
<summary>Hint 1</summary>

Listen for the `input` event on the search box ([chapter 21](../21-events/notes.md)). Store the search text already trimmed and lowercased, so you only do that once.

</details>

<details>
<summary>Hint 2</summary>

In `getVisibleTasks()`, filter in two steps: first by `currentFilter`, then by the search text. `filter` calls can be chained ([chapter 13](../13-array-methods/notes.md)), and an empty search text matches every task, because every string `includes("")`.

</details>

---

## Exercise 4 (Medium): Due dates

Some tasks have deadlines. Let people pick a due date, show it next to the task, and highlight the tasks that are overdue.

Add a date box inside `.todo-form-row` in `index.html`, just before the Add button:

```html
<input id="due-input" name="due" type="date" aria-label="Due date">
```

1. When a task is added, store the date box's value on the task as `due`. It's a string like `"2026-10-05"`, the same ISO format that [chapter 19](../19-dates-and-times/notes.md) recommends for storing dates. If no date was picked, store `null`.
2. Show the date after the task's text, in a `<span class="todo-due">`, like `Due Mon, Oct 5`. Use `toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })`.
3. Give the `<li>` the class `overdue` when its due date is before today and the task isn't done. The CSS turns the date red.
4. Tasks you saved before this change have no `due` at all. They must still work, just without a date.

**What you should see:** add a task due on October 5, 2026, and it shows `Due Mon, Oct 5`. Which tasks are overdue depends on today's date, so give one a date in the past to see the red. Tick it, and the red goes away.

> **Watch out:** this is the time zone trap from chapter 19. `new Date("2026-10-05")` means midnight in *UTC*. In New York, that moment is still the evening of October 4, so the date would show as `Due Sun, Oct 4`. Build the date from its parts instead, and it means midnight *here*: `new Date(2026, 9, 5)`.

<details>
<summary>Hint 1</summary>

`"2026-10-05".split("-").map(Number)` gives you `[2026, 10, 5]`. Destructure it ([chapter 15](../15-destructuring-spread-rest/notes.md)), and remember that months start at 0 when you build the date.

</details>

<details>
<summary>Hint 2</summary>

An empty date box has the value `""`. And an old task's `due` is `undefined`. A simple `if (task.due)` skips both, because `""`, `null` and `undefined` are all falsy ([chapter 07](../07-conditionals/notes.md)).

</details>

<details>
<summary>Hint 3</summary>

"Before today" means before midnight at the start of today. Make a date for right now, then set its hours, minutes, seconds and milliseconds to 0 with `setHours(0, 0, 0, 0)` (chapter 19). Dates can be compared with `<`.

</details>

---

## Exercise 5 (Challenge): Edit a task by double-clicking

Typos happen: "Buy mlik". Let people fix a task by double-clicking its text.

1. Double-clicking a task's text swaps the text for a text box (with the class `todo-edit`) that holds the current text, with the cursor already in it.
2. `Enter` saves the change, trimmed. If the new text is empty, the task is deleted instead.
3. `Escape` cancels, and the old text comes back.
4. Clicking somewhere else saves the change too.
5. Saved changes survive a refresh.

**What you should see:** double-click "Book the dentist", change it to `Book the dentist for Tuesday`, and press Enter. The task is updated, and it's still updated after a refresh. Double-click it again, delete all the text, and press Enter: the task is gone. Double-click another task, type something, and press Escape: nothing has changed.

<details>
<summary>Hint 1</summary>

Use delegation once more: a `dblclick` listener on `#todo-list` that checks for the `todo-text` class. (`dblclick` is the double-click event.)

</details>

<details>
<summary>Hint 2</summary>

Editing is just more state. Keep the id of the task being edited in a variable, like `let editingId = null;`. When it's set, `createTaskElement` builds an `<input class="todo-edit">` instead of the `<span>` for that one task. Change the state, render, and the text box appears. That's the big idea again.

</details>

<details>
<summary>Hint 3</summary>

The text box is brand new after every render, so it's fine to add its listeners right where you create it: `keydown` for Enter and Escape, and `blur` for "clicked somewhere else". (`blur` fires when an element loses focus, the opposite of `focus()`.) Call `focus()` on the box after it's on the page.

</details>

<details>
<summary>Hint 4</summary>

Watch out for saving twice. Pressing Enter saves and renders, and the render removes the text box while it still has focus. In some browsers, that fires `blur` as well. Make your "finish editing" function do nothing when `editingId` is already `null`.

</details>

---

## Before you move on

Look at your event handlers. Each one uses `tasks`, `currentFilter` or `todoList`, variables that were created outside the handler, long before the click happened. Yet the handler can still use them, every time it runs.

How does a function "remember" the variables around it? That's called a **closure**, and it's the first topic of Level 3: [chapter 25](../25-closures/notes.md).
