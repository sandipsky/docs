# 24 Project: To-Do List App

## What you'll build

Your first real web app: a to-do list that runs in the browser. When you're done, you'll be able to:

- add tasks,
- tick them off when they're done,
- delete them,
- see how many are left,
- filter the list to show all tasks, only the active ones, or only the completed ones,
- clear away all the finished tasks at once,
- close the browser, come back tomorrow, and find your list exactly as you left it.

The finished app looks something like this:

```
My To-Do List

New task
[ e.g. Buy milk                     ]  [ Add ]

( All )  ( Active )  ( Completed )

[x]  Buy milk            <- crossed out     ×
[ ]  Book the dentist                       ×
[ ]  Call grandma                           ×

2 tasks left                  Clear completed
```

**What you'll practice:**

| Skill | Chapter |
|---|---|
| Arrays of objects | [10](../10-arrays/notes.md) and [11](../11-objects/notes.md) |
| `filter`, `find`, `some` and friends | [13](../13-array-methods/notes.md) |
| Creating and changing elements | [20](../20-dom-basics/notes.md) |
| Events and event delegation | [21](../21-events/notes.md) |
| Forms | [22](../22-forms/notes.md) |
| JSON and `localStorage` | [23](../23-json-and-local-storage/notes.md) |

You'll build it in 8 small milestones. After each one, the app works a little better, and you can check it in the browser before moving on.

## Getting started

1. Make a copy of this chapter's `starter` folder, and call it `my-todo-app`. Work in the copy, so the starter stays clean.
2. Open `my-todo-app/index.html` by double-clicking it. You'll see the app's layout: the form, the filter buttons, the message "No tasks here.", "0 tasks left", and a "Clear completed" button. Nothing works yet. That's your job!
3. Press `F12` and open the Console. Your code goes in `app.js`. After every change, save the file and refresh the page, like in [chapter 20](../20-dom-basics/notes.md).

There are three files in the folder:

| File | What's in it |
|---|---|
| `index.html` | The page. You won't need to change it. |
| `style.css` | The looks. It already styles the tasks you'll create, as long as they have the right classes. |
| `app.js` | Only a comment listing the milestones. Everything else is up to you. |

Two things in `index.html` are new:

- `<link rel="stylesheet" href="style.css">` loads the CSS from its own file, instead of a `<style>` tag in the `<head>`.
- `<meta name="viewport" content="width=device-width, initial-scale=1">` makes the page fit nicely on a phone screen.

These are the parts of the page your code will use:

| Selector | What it is |
|---|---|
| `#todo-form` | The form with the text box and the Add button |
| `#todo-input` | The text box for a new task |
| `#filters` | The box around the three filter buttons. Each button has a `data-filter`: `all`, `active` or `completed`. |
| `#todo-list` | The empty `<ul>` where your tasks will go |
| `#todo-count` | The "0 tasks left" counter |
| `#clear-completed` | The "Clear completed" button |

> **Tip:** The message "No tasks here." isn't in the HTML. The CSS shows it by itself whenever `#todo-list` is empty, so you get it for free.

## The big idea: change the data, then draw

Before any code, here's the one idea that keeps this app simple instead of messy.

Think of the scoreboard at a football stadium. Nobody climbs up a ladder to change the numbers by hand. The official scorer writes each goal on the score sheet, and the scoreboard shows whatever the sheet says. The sheet is the truth. The board just displays it.

Your app works the same way:

| At the stadium | In your app |
|---|---|
| The score sheet | The `tasks` array: the truth |
| The scoreboard | The list on the page |
| Writing a goal on the sheet | Changing the array: adding, ticking, deleting |
| The board updating from the sheet | A `render()` function that redraws the list from the array |

The data your app keeps track of is called its **state**. Every feature you build will follow the same three steps:

1. Something happens: a click, or a form being sent.
2. You change the state (the `tasks` array).
3. You call `render()`, which redraws the page from the state.

You never add, cross out or remove tasks on the page directly. You change the array and redraw. That way, the page and the data can never disagree. Big tools like React are built on this same idea, so you're learning something that lasts.

## Milestone 1: Tasks in an array, drawn on the page

**Goal:** keep the tasks in an array of objects, and write a `render()` function that draws them on the page.

Start `app.js` with three sample tasks, so there's something to draw:

```js
let tasks = [
  { id: 1, text: "Buy milk", completed: true },
  { id: 2, text: "Book the dentist", completed: false },
  { id: 3, text: "Call grandma", completed: false },
];
```

Each task has:

- `id`: a number that's different for every task, like a ticket number. It lets you find the right task later.
- `text`: what needs doing.
- `completed`: `true` once it's done.

`tasks` uses `let` because later milestones will replace the whole array with a new one.

Next, write `render()`. It empties the `<ul>`, then builds one `<li>` for each task and adds it to the list. Each `<li>` must look like this, because that's what `style.css` expects:

```html
<li class="todo-item completed" data-id="1">
  <input class="todo-toggle" type="checkbox" aria-label="Mark as done" checked>
  <span class="todo-text">Buy milk</span>
  <button class="todo-delete" type="button" aria-label="Delete task">×</button>
</li>
```

- The `completed` class and `checked` are only there when the task is done. The CSS crosses out the text of every `.completed` item.
- `data-id` stores the task's id on the element ([chapter 20](../20-dom-basics/notes.md)). In milestones 3 and 4, it tells you *which* task was clicked.
- `aria-label` gives the tick box and the × button a name that screen readers read out, because they have no visible label of their own. Attributes that start with `aria-` are there to help with accessibility ([chapter 22](../22-forms/notes.md)).

Emptying the list first matters. Without it, every call to `render()` adds another copy of every task under the old ones. Setting `textContent` to an empty string removes everything inside an element:

```js
const todoList = document.querySelector("#todo-list");
todoList.textContent = ""; // remove everything inside the <ul>
```

Finally, call `render()` once at the bottom of `app.js`, so the list is drawn when the page opens.

**What you should see:** three tasks, with "Buy milk" ticked and crossed out. Change `completed` for one of the tasks in your array, refresh, and the page follows along.

<details>
<summary>Hint 1</summary>

Build each part with `createElement`, give it its class with `classList.add`, and put the parts into the `<li>` with `append`, like in chapter 20. You can copy the `×` symbol from this page.

</details>

<details>
<summary>Hint 2</summary>

For the tick box, set `checkbox.type = "checkbox"` and `checkbox.checked = task.completed`. For the id, `li.dataset.id = task.id`. And `setAttribute` sets any attribute, including `aria-label`.

</details>

<details>
<summary>Hint 3</summary>

Split the work: a function `createTaskElement(task)` that builds and returns one `<li>`, and `render()`, which empties the list and appends one element per task. Small functions are easier to test and fix.

</details>

> **Watch out:** Use `textContent` for the task's text, never `innerHTML`. Users can type anything into the box, including HTML. `innerHTML` would turn it into real elements, and some HTML can even run someone else's code ([chapter 20](../20-dom-basics/notes.md) explains the danger).

## Milestone 2: Add a task

**Goal:** type a task, press Enter (or click "Add"), and it appears at the bottom of the list.

In your `submit` handler ([chapter 22](../22-forms/notes.md)):

1. Stop the page from reloading.
2. Read the text box, and trim the spaces off.
3. If the text is empty, stop there, so an empty task can't sneak in.
4. Otherwise, add a new task object to `tasks`, and call `render()`.
5. Empty the text box, ready for the next task.

The new idea is the id. Every task needs a different one. A quick way to get one is the current time in milliseconds, with `Date.now()` from [chapter 19](../19-dates-and-times/notes.md):

```js
const newTask = { id: Date.now(), text, completed: false };
```

(Writing just `text` is the shorthand for `text: text`, from chapter 11.) Nobody can add two tasks in the same millisecond by hand, so each task gets its own number. Big apps often use long random ids instead, but this is plenty for now.

**What you should see:** type `Water the plants` and press Enter. It appears at the bottom, unticked, and the text box is empty again. Click "Add" with an empty box, or with only spaces in it, and nothing happens.

<details>
<summary>Hint</summary>

Listen for `submit` on the form, not `click` on the button, and Enter works for free. `push` adds the new task to the end of the array. To empty the box, set its `value` to `""`, or call `reset()` on the form.

</details>

## Milestone 3: Mark a task as done

**Goal:** tick a task's box, and it's crossed out. Untick it, and it's back to normal.

`render()` throws away the old `<li>`s and builds new ones every time. So a listener added to a single tick box would be lost at the next render. That's the problem event delegation solves ([chapter 21](../21-events/notes.md)): **one** listener on `#todo-list` hears every tick box inside it, even the ones that don't exist yet.

Which event? A tick box fires `change` whenever it's ticked or unticked, and `change` bubbles up to the list.

In your listener:

1. Check that the event came from a tick box, with `event.target.classList.contains("todo-toggle")`. If it didn't, stop.
2. Work out which task it was. `event.target.closest("li")` is the task's `<li>`, and its `dataset.id` is the task's id.
3. Find that task in the array, and set its `completed` to whether the box is ticked now: `event.target.checked`.
4. Call `render()`.

One trap: `dataset` values are always strings (chapter 20), but your ids are numbers, and `"2" === 2` is `false`. So convert the id first:

```js
const id = Number(event.target.closest("li").dataset.id);
```

**What you should see:** tick "Book the dentist", and it's crossed out. Untick it, and it's back. (If you refresh the page, the list goes back to the three samples, because nothing is saved yet. Milestone 7 fixes that.)

<details>
<summary>Hint 1</summary>

`tasks.find((task) => task.id === id)` gives you the task object itself ([chapter 13](../13-array-methods/notes.md)). Changing its `completed` changes the task inside the array, because they're the same object ([chapter 16](../16-values-vs-references/notes.md)).

</details>

<details>
<summary>Hint 2</summary>

Don't add or remove the `completed` class on the `<li>` yourself. Change the data and call `render()`. The new `<li>` gets the right class automatically. That's the big idea at work.

</details>

## Milestone 4: Delete a task

**Goal:** click a task's ×, and the task is gone.

Use delegation on the same list again, but this time with the `click` event, and check for the `todo-delete` class. Then remove the task from the array. The easiest way is `filter`: keep every task *except* the one with this id.

```js
tasks = tasks.filter((task) => task.id !== id);
```

`filter` builds a brand-new array, and you replace the old one with it. That's why `tasks` is a `let`.

**What you should see:** click × next to "Call grandma", and it disappears. Delete every task, and "No tasks here." appears.

<details>
<summary>Hint</summary>

It's fine to have two listeners on `#todo-list`: one for `change` (ticking) and one for `click` (deleting). Clicking a tick box fires a `click` too, but your `todo-delete` check makes that listener ignore it.

</details>

## Milestone 5: How many tasks are left?

**Goal:** the footer shows how many tasks aren't done yet: "2 tasks left", "1 task left", "0 tasks left".

Count the tasks that aren't completed, and put the result in `#todo-count`. Do it inside `render()`. Every change already calls `render()`, so the counter can never fall out of date.

Mind the grammar: it's "1 task", but "0 tasks" and "2 tasks". A ternary ([chapter 07](../07-conditionals/notes.md)) can pick the right word.

**What you should see:** with the three samples, the footer says "2 tasks left". Tick "Book the dentist": "1 task left". Tick "Call grandma": "0 tasks left". Add a new task: "1 task left".

<details>
<summary>Hint</summary>

`tasks.filter((task) => !task.completed)` gives you the tasks that still need doing. Its `length` is the number you want.

</details>

## Milestone 6: Filters

**Goal:** the All, Active and Completed buttons show only the matching tasks, and the chosen button is highlighted.

Which filter is switched on is a new piece of state. It isn't a task, so it gets its own variable:

```js
let currentFilter = "all"; // "all", "active" or "completed"
```

Then three steps:

1. **Listen.** One `click` listener on `#filters` (delegation again). Read the clicked button's `data-filter`, store it in `currentFilter`, and call `render()`.
2. **Show only the matching tasks.** Write a function `getVisibleTasks()` that returns all the tasks, only the active ones, or only the completed ones, depending on `currentFilter`. In `render()`, loop over `getVisibleTasks()` instead of `tasks`.
3. **Highlight the chosen button.** The CSS styles any `.filter-button` that also has the class `active`. In `render()`, go through the three buttons: add `active` to the one whose `data-filter` matches `currentFilter`, and remove it from the others.

Keep the counter counting *all* the tasks that aren't done, not just the visible ones. "2 tasks left" shouldn't change just because you're looking at the Completed list.

**What you should see:** click "Active". "Buy milk" disappears, and "Active" is highlighted. Click "Completed", and only "Buy milk" is left. Go back to "Active" and tick a task: it vanishes from view, because it isn't active any more. Click "All", and everything's back.

<details>
<summary>Hint 1</summary>

If a click lands in the gap between the buttons, `event.target` is the box around them, and its `dataset.filter` is `undefined`. Ignore those clicks.

</details>

<details>
<summary>Hint 2</summary>

`getVisibleTasks()` has three cases. Two of them are a `filter`, each with a different test. The third returns `tasks` as it is.

</details>

<details>
<summary>Hint 3</summary>

`document.querySelectorAll(".filter-button")` gives you the three buttons, ready to loop over with `for...of` ([chapter 20](../20-dom-basics/notes.md)).

</details>

## Milestone 7: Remember the tasks

**Goal:** the tasks survive a refresh, and even closing the browser.

Bring in the `save` and `load` helpers from [chapter 23](../23-json-and-local-storage/notes.md), and add a name for your storage key at the top of `app.js`:

```js
const STORAGE_KEY = "todo-app-tasks";
```

Then:

1. Replace the three sample tasks with `load`, and use an empty array as the default: `let tasks = load(STORAGE_KEY, []);`.
2. Save the tasks after **every** change to them: adding, ticking and deleting (and clearing, in milestone 8).

Each of those changes already ends with `render()`. A small helper keeps saving and drawing together, so you can't forget one of them:

```js
function update() {
  save(STORAGE_KEY, tasks);
  render();
}
```

Call `update()` instead of `render()` wherever the tasks change. Switching filters doesn't change any tasks, so the filter listener can keep calling `render()`.

**What you should see:** the samples are gone, and the list starts empty. Add "Pay the electricity bill", then add "Buy milk" and tick it. Refresh: both tasks are still there, and "Buy milk" is still ticked. Close the browser and open the page again: still there.

Now open DevTools, go to the **Application** tab, and open **Local storage**. The key `todo-app-tasks` holds your tasks as JSON, something like this (your ids will be different, because they come from `Date.now()`):

```
[{"id":1760000000000,"text":"Pay the electricity bill","completed":false},{"id":1760000004213,"text":"Buy milk","completed":true}]
```

Finally, try to break it. In the Console, run `localStorage.setItem("todo-app-tasks", "oops")` and refresh. The app starts with an empty list instead of crashing, and a red message in the Console explains why. That's `load` doing its job.

<details>
<summary>Hint</summary>

Look for every place that changes `tasks`: the `push`, the line that sets `completed`, and the `filter`. Each one needs a save afterwards. If ticks or deletions come back after a refresh, one of those places is missing its save.

</details>

## Milestone 8: Clear completed

**Goal:** "Clear completed" removes every finished task at once. When there's nothing to clear, the button is greyed out.

1. Add a `click` listener to `#clear-completed`. Keep only the tasks that aren't completed (with `filter` again), then call `update()`.
2. In `render()`, disable the button when no task is completed. You met the `disabled` property in chapter 20, and the CSS already fades out a disabled button.

**What you should see:** tick two tasks and click "Clear completed". Both disappear, the others stay, and the counter doesn't change. Refresh: they're still gone. With no ticked tasks, the button is greyed out, and clicking it does nothing.

<details>
<summary>Hint</summary>

`tasks.some((task) => task.completed)` answers the question "is at least one task done?" ([chapter 13](../13-array-methods/notes.md)).

</details>

## Test it like a user

Before you call it finished, try your app the way a real user would. Tick each box once it works:

- [ ] Enter and the Add button both add a task. Empty tasks, and tasks made of spaces, are ignored.
- [ ] Ticking crosses a task out, and unticking brings it back.
- [ ] × always deletes the right task, even after you've added and deleted a few.
- [ ] The counter says "1 task left", not "1 tasks left".
- [ ] Each filter shows the right tasks, and the right button is highlighted.
- [ ] On the Active list, ticking a task makes it disappear from view.
- [ ] Everything survives a refresh, including ticks and deletions.
- [ ] A task typed as `<b>hello</b>` shows up exactly like that, angle brackets and all, instead of in bold.
- [ ] "Clear completed" is greyed out when there's nothing to clear.
- [ ] The app works on a phone-sized screen. In DevTools, click the phone-and-tablet icon (the **device toolbar**) to try different screen sizes.

When every box is ticked, you've built a real web app. 🎉

## Common mistakes

**1. Forgetting to empty the list in `render()`**

```js
function render() {
  for (const task of tasks) {
    todoList.append(createTaskElement(task));
  }
}
```

The first render looks fine. But every render after that adds the whole list again under the old one: add one task to the three samples, and you'll see seven. Fix: start `render()` with `todoList.textContent = "";`.

**2. Comparing a `data-id` string with a number**

```js
const id = event.target.closest("li").dataset.id; // "2": a string!
const task = tasks.find((item) => item.id === id); // 2 === "2" is false, so: undefined
task.completed = event.target.checked;
// TypeError: Cannot set properties of undefined (setting 'completed')
```

`find` found nothing, because no id is equal to the *string* `"2"`. Fix: `Number(event.target.closest("li").dataset.id)`.

**3. Adding listeners to the tick boxes when the page loads**

```js
for (const checkbox of document.querySelectorAll(".todo-toggle")) {
  checkbox.addEventListener("change", toggleTask);
}
```

Only the boxes that exist at that moment get a listener. The next `render()` replaces them with brand-new boxes that have no listeners, so ticking stops working. Fix: one listener on `#todo-list`, with event delegation.

**4. Changing the page instead of the data**

```js
todoList.addEventListener("change", (event) => {
  event.target.closest("li").classList.toggle("completed"); // only the page changes
});
```

It seems to work, until the next render (when you add a task, say). Then the crossing-out vanishes, because the array still says `completed: false`. And it's never saved. Fix: change the task in the array, then save and render.

**5. Forgetting to save after one kind of change**

```js
todoList.addEventListener("click", (event) => {
  if (!event.target.classList.contains("todo-delete")) {
    return;
  }
  const id = Number(event.target.closest("li").dataset.id);
  tasks = tasks.filter((task) => task.id !== id);
  render(); // the page is updated, but nothing is saved
});
```

Delete a task, refresh, and it's back from the dead. Fix: save after every change to `tasks`. Calling `update()` everywhere makes that hard to forget.

## Quick recap

What you practiced in this project:

- Keep your data (the state) in one place, and draw the page from it with a `render()` function.
- Every feature follows the same loop: an event happens, you change the array, then you save and render.
- Event delegation handles elements that `render()` creates later. `closest("li").dataset.id` tells you which task was clicked, and `Number()` turns the id back into a number.
- `push`, `find`, `filter` and `some` do the real work: adding, ticking, deleting, filtering and counting.
- `save` and `load` (JSON plus `localStorage`) make the app remember, and keep it safe from broken data.
- `textContent` keeps whatever users type safe.

---

**Next:** try the stretch goals in the [exercises](exercises.md), then move on to [25 Closures](../25-closures/notes.md).
