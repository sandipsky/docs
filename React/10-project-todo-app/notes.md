# 10 Project: To-Do App, the React Way

## What you'll build

The same to-do app you built in [JavaScript chapter 24](../../JavaScript/24-project-todo-app/notes.md) — but in React, and in TypeScript. When you're done you'll be able to:

- add tasks,
- tick them off,
- delete them,
- see how many are left,
- filter to All, Active, or Completed,
- clear away all the finished ones at once,
- close the browser, come back tomorrow, and find your list as you left it.

```
My To-Do List

[ e.g. Buy milk                     ]  [ Add ]

( All )  ( Active )  ( Completed )

[x]  Buy milk            <- crossed out     ×
[ ]  Book the dentist                       ×
[ ]  Call grandma                           ×

2 tasks left                  Clear completed
```

The features are identical on purpose. That's what makes the comparison at the end of this chapter worth something: same app, same you, two very different ways of getting there.

**What you'll practise:**

| Skill | Chapter |
|---|---|
| Components and props | [03](../03-components/notes.md) and [04](../04-props/notes.md) |
| Conditional rendering | [05](../05-conditional-rendering/notes.md) |
| Lists and keys | [06](../06-rendering-lists/notes.md) |
| Events and callback props | [07](../07-events/notes.md) |
| State with `useState` | [08](../08-state/notes.md) |
| Controlled forms | [09](../09-forms/notes.md) |
| Types, unions, and typed props | The whole [TypeScript course](../../TypeScript/README.md) |

Eight milestones. After each one the app works a bit better, and you can check it in the browser before moving on.

## Getting started

This project gets its own app, separate from your `playground`.

1. Open a terminal **in this `React` folder** and run `npm create vite@latest`, answering exactly as you did in [chapter 01](../01-getting-started/notes.md), but calling the project `todo-app`.
2. Copy the two files from this chapter's `starter/src/` folder over the ones in `todo-app/src/`:
   - `App.tsx` — a stub with the milestone list in a comment.
   - `index.css` — all the styling, already written.
3. Delete `todo-app/src/App.css` and `todo-app/src/assets/`. Nothing imports them now.
4. `cd todo-app`, then `npm run dev`, and open the address it prints.

You'll see the heading and nothing else. That's your job.

Keep a second terminal open in `todo-app` running `npx tsc -b` whenever you want to check the whole project, and keep DevTools (`F12`) open on the **Components** tab. You'll use it constantly.

**The CSS is done for you** so you can concentrate on React. It styles a fixed set of class names, listed in `starter/README.md` and mentioned as you go. Use those names and everything will look right.

## The big idea: state is the truth

In the JavaScript version, the key idea was the stadium scoreboard: the `tasks` array was the truth, and a `render()` function redrew the page from it. Every feature followed three steps:

1. Something happens.
2. You change the array.
3. **You call `render()`.**

React keeps steps 1 and 2 and does step 3 for you. That's the whole difference:

| JavaScript version | React version |
|---|---|
| `let tasks = [...]` | `const [tasks, setTasks] = useState<Task[]>([])` |
| Change the array, then call `render()` | Call `setTasks(...)` — React redraws |
| `render()` empties the `<ul>` and rebuilds it | `tasks.map(...)` in your JSX |
| Forget `render()` and the page goes stale | Can't forget |
| `textContent` to stay safe from XSS | JSX is safe by default |

There's one price for this, and it's the rule you'll break at least once today: **you must never change the array in place.** `push`, `splice` and `sort` all edit the array you already have, and React decides nothing has changed. Every change makes a **new** array.

## Milestone 1: Types, and a list on the page

**Goal:** show three hard-coded tasks, built from components.

Make `src/types.ts`:

```ts
export type Task = {
  id: string;
  text: string;
  done: boolean;
};
```

`id` is a string because you'll generate ids with `crypto.randomUUID()` later.

Now three components, each in its own file in `src/`:

**`TaskItem.tsx`** takes one `task` and renders:

```tsx
<li className="todo-item">
  <input className="todo-checkbox" type="checkbox" checked={task.done} readOnly />
  <span className="todo-text">{task.text}</span>
  <button className="delete-button" type="button">×</button>
</li>
```

Add `className="todo-item completed"` when the task is done — the CSS crosses it out. (`readOnly` is temporary: it stops React's "value without onChange" warning until milestone 5. Remember to take it out then.)

**`TaskList.tsx`** takes a `tasks` prop, typed `readonly Task[]`, and maps over it inside a `<ul className="todo-list">`.

**`App.tsx`** holds three sample tasks in a plain `const` and renders `<TaskList tasks={tasks} />`.

**Check it:** three tasks on screen, one crossed out, and an **empty Console**. If you see a message about keys, fix it now ([chapter 06](../06-rendering-lists/notes.md)).

> **Why split it three ways?** `TaskItem` knows how to draw one task. `TaskList` knows how to draw many. `App` will know what the tasks *are*. That separation is what makes the next seven milestones small.

## Milestone 2: The counter and the empty state

**Goal:** nothing hard-coded that could be worked out.

Under the list, add a footer:

```tsx
<footer className="todo-footer">
  <span className="todo-count">2 tasks left</span>
</footer>
```

but with the number calculated:

```tsx
const remaining = tasks.filter((task) => !task.done).length;
```

Get the wording right: `1 task left`, not `1 tasks left`.

In `TaskList`, handle the empty case:

```tsx
if (tasks.length === 0) {
  return <p className="empty-message">Nothing to do. Enjoy your day!</p>;
}
```

**Check it:** delete the sample tasks from `App.tsx` and save. You should see the message, not an empty box. Put them back.

`remaining` is a **derived value**. Never store it in state — it would only go stale.

## Milestone 3: Make it live

**Goal:** move the tasks into state, and prove to yourself why that matters.

First, the experiment. In `App.tsx`, add a temporary button:

```tsx
<button onClick={() => tasks.push({ id: "x", text: "Test", done: false })}>
  Add test task
</button>
```

Click it a few times. **Nothing happens.** Now open the Components tab and check — nothing there either. The array really is growing; the page just has no idea. This is the bug that React exists to prevent, and it's worth seeing once with your own eyes.

Now do it properly:

```tsx
import { useState } from "react";
import type { Task } from "./types.ts";

function App() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", text: "Buy milk", done: true },
    { id: "2", text: "Book the dentist", done: false },
    { id: "3", text: "Call grandma", done: false },
  ]);
  // ...
}
```

The `<Task[]>` matters. Without it, an empty starting array would be inferred as `never[]` ([chapter 08](../08-state/notes.md)).

Change the test button to:

```tsx
<button onClick={() => setTasks([...tasks, { id: crypto.randomUUID(), text: "Test", done: false }])}>
  Add test task
</button>
```

**Check it:** clicking now adds a task, and the counter moves by itself. Watch `tasks` grow in the Components tab. Then delete the test button — milestone 4 replaces it.

## Milestone 4: Add a task

**Goal:** a real form.

Make `src/AddTaskForm.tsx`. It owns the text box's state (nobody else needs it), and tells its parent when a task should be added:

```tsx
type AddTaskFormProps = {
  onAdd: (text: string) => void;
};
```

Inside:

```tsx
const [text, setText] = useState("");

function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();

  const trimmed = text.trim();
  if (trimmed === "") {
    return;
  }

  onAdd(trimmed);
  setText("");
}
```

The JSX:

```tsx
<form className="todo-form" onSubmit={handleSubmit}>
  <label className="visually-hidden" htmlFor="new-task">New task</label>
  <input
    id="new-task"
    className="todo-input"
    type="text"
    placeholder="e.g. Buy milk"
    value={text}
    onChange={(event) => setText(event.target.value)}
  />
  <button className="add-button" type="submit">Add</button>
</form>
```

(`visually-hidden` is a class in the CSS that hides the label on screen but keeps it for screen readers. A placeholder is not a label — [chapter 38](../38-accessibility/notes.md).)

In `App.tsx`:

```tsx
function handleAddTask(text: string) {
  const newTask: Task = { id: crypto.randomUUID(), text, done: false };
  setTasks([...tasks, newTask]);
}
```

**Check it:** type and press **Enter**, and type and click **Add** — both must work. Empty and spaces-only submissions do nothing. The box clears after each add. The counter keeps up.

> **Why does the text live in `AddTaskForm` but the tasks live in `App`?** State goes in the closest component that contains everything needing it. Only the form cares what's half-typed. Everything cares about the tasks.

> **Why generate the id in `App` and not in the form?** The form's job is "someone wants to add this text". Ids are part of what a task *is*, so they belong where tasks are made.

## Milestone 5: Tick a task off

**Goal:** the tick box works, and survives everything.

`TaskItem` gets a second prop:

```tsx
type TaskItemProps = {
  task: Task;
  onToggle: (id: string) => void;
};
```

Remove `readOnly` and wire the box up:

```tsx
<input
  className="todo-checkbox"
  type="checkbox"
  checked={task.done}
  onChange={() => onToggle(task.id)}
/>
```

`TaskList` takes `onToggle` too and passes it straight through to every row.

In `App.tsx`, this is the important one:

```tsx
function handleToggleTask(id: string) {
  setTasks(
    tasks.map((task) =>
      task.id === id ? { ...task, done: !task.done } : task
    )
  );
}
```

Read it slowly, because this line is the heart of React state:

- `map` builds a **new array**.
- For the task that matches, it makes a **new object** with `done` flipped.
- Every other task is passed through **unchanged** — the same object, not a copy.

Compare it with what you'd write in plain JavaScript:

```js
const task = tasks.find((t) => t.id === id);
task.done = !task.done;      // ❌ in React: nothing happens on screen
```

That edits the object React already has, so React sees no change and doesn't redraw.

**Check it:** ticking crosses the task out and the counter drops. Tick a task, then add a new one — the tick stays with the right task. (That's your keys doing their job, [chapter 06](../06-rendering-lists/notes.md).)

## Milestone 6: Delete a task

**Goal:** the `×` button works.

Same shape as milestone 5. `TaskItem` takes `onDelete: (id: string) => void`, and the button calls it:

```tsx
<button className="delete-button" type="button" aria-label={`Delete ${task.text}`} onClick={() => onDelete(task.id)}>
  ×
</button>
```

(`aria-label` gives the button a real name. On its own, `×` tells a screen-reader user nothing.)

In `App.tsx`:

```tsx
function handleDeleteTask(id: string) {
  setTasks(tasks.filter((task) => task.id !== id));
}
```

`filter` returns a new array without that task. One line.

**Check it:** delete the middle task, then the last, then all of them — you should land on the empty message. Delete a task while another is ticked, and make sure the tick doesn't jump rows.

> Notice that `TaskList` is now just passing `onToggle` and `onDelete` through without using them. That's called **prop drilling**, and with one layer it's completely fine. [Chapter 22](../22-context/notes.md) covers what to do when it's five layers.

## Milestone 7: Filters and Clear completed

**Goal:** All / Active / Completed, and a button to tidy up.

A second piece of state in `App.tsx`, with a type that makes a typo impossible:

```tsx
type Filter = "all" | "active" | "completed";

const [filter, setFilter] = useState<Filter>("all");
```

Make `src/FilterButtons.tsx`:

```tsx
type FilterButtonsProps = {
  filter: Filter;
  onChange: (filter: Filter) => void;
};
```

Map over `["all", "active", "completed"]` to make three buttons. The selected one gets `className="filter-button active"`, the others `"filter-button"`.

Back in `App.tsx`, the filtered list is **derived**, not state:

```tsx
const visibleTasks = tasks.filter((task) => {
  if (filter === "active") return !task.done;
  if (filter === "completed") return task.done;
  return true;
});
```

Pass `visibleTasks` to `TaskList`. Keep using the **full** `tasks` list for the counter — "2 tasks left" shouldn't change just because you're looking at a filter.

Then **Clear completed** in the footer:

```tsx
function handleClearCompleted() {
  setTasks(tasks.filter((task) => !task.done));
}
```

Show it only when there's something to clear.

**Check it:** each filter shows the right tasks. Tick a task while on **Active** — it should vanish from view but the counter should still be right. Switch to **Completed** and it's there. Clear completed on the Completed tab leaves you with an empty list and the right message.

> **Careful with the empty state now.** `TaskList` says "Nothing to do. Enjoy your day!" whenever its list is empty — including when you're on **Completed** with nothing finished, which reads oddly. Fixing that is stretch goal 3.

## Milestone 8: Remember the list

**Goal:** close the tab, come back, and it's all still there.

React doesn't have a special way to do this — it's the plain `localStorage` and JSON you know from [JavaScript chapter 23](../../JavaScript/23-json-and-local-storage/notes.md). What's new is *where* it goes.

Add to `App.tsx`, above the component:

```tsx
const STORAGE_KEY = "react-todo-tasks";

function loadTasks(): Task[] {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === null) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed as Task[];
  } catch {
    return [];
  }
}
```

The `try`/`catch` matters: `JSON.parse` throws on damaged data, and one bad character in `localStorage` would otherwise leave your app permanently broken with a white screen.

Loading is the state's starting value:

```tsx
const [tasks, setTasks] = useState<Task[]>(loadTasks);
```

Note: `loadTasks`, **not** `loadTasks()`. Passing the function is the **lazy initial state** form from [chapter 08](../08-state/notes.md), so React only calls it on the first render instead of every one.

For saving, add one small function and route every change through it:

```tsx
function updateTasks(next: Task[]) {
  setTasks(next);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}
```

Now replace `setTasks(...)` with `updateTasks(...)` in all four handlers. There's nowhere left to forget.

**Check it:** add tasks, tick some, refresh. Everything's there. Open DevTools → **Application** → **Local Storage** and watch the JSON change as you click. Then break it deliberately: edit the stored value to `not json at all`, refresh, and confirm the app starts empty instead of crashing.

> **Two honest notes.** First, `as Task[]` is a promise TypeScript can't check ([TypeScript chapter 02](../../TypeScript/02-basic-types/notes.md)). If old data has a different shape, TypeScript believes you and your app breaks at runtime. [Zod](../32-zod/notes.md) in Level 4 is how you check for real. Second, `updateTasks` works, but React has a purpose-built tool for "keep this in sync with something outside React", and that's `useEffect` in [chapter 17](../17-effects/notes.md). Doing it the long way first means you'll know exactly what `useEffect` is buying you.

## Now compare

You've now built the same app twice. Open `JavaScript/24-project-todo-app` next to your new `App.tsx` and look at them side by side. It's worth ten minutes.

**What disappeared:**

| In the JavaScript version | In React |
|---|---|
| `render()`: 25 lines emptying the `<ul>` and rebuilding it | `tasks.map(...)` |
| `document.querySelector` for six elements | Nothing |
| `createElement`, `append`, `classList.add` | JSX |
| Event delegation on the `<ul>` | An `onClick` on each button |
| `dataset.id` and `Number(...)` to find what was clicked | `task.id`, already the right type |
| Remembering to call `render()` after every change | Automatic |
| `textContent` to stay safe from XSS | Safe by default |

**What's new or harder:**

- **You can't change anything in place.** `push` and `task.done = true` are gone. Every change builds a new array or object. This is the tax React charges, and it takes a while to stop feeling like a chore.
- **There's more ceremony.** A form that adds a task now involves a prop type, a callback, and a controlled input. The JavaScript version was one `addEventListener`.
- **You have to decide where state lives.** That question didn't exist before, because everything was in one file.

**What got better, and why it's worth it:**

- **The page can't disagree with the data.** In the JavaScript version, a forgotten `render()` was a bug you only found later. Here it's impossible.
- **Adding a feature is local.** Stretch goal 1 is dark mode: one piece of state and one class name. In the JavaScript version it meant touching `render()` too.
- **The pieces have names.** `TaskItem` is a thing you can point at, test, and reuse. `render()` was one function that did everything.
- **TypeScript can see the joins.** `onToggle: (id: string) => void` is checked at both ends. `dataset.id` was a string you had to remember to convert, with nothing to catch you.

That last group is why the extra ceremony pays off. It's barely worth it for 150 lines. At 15,000 lines, with four people editing, it's the difference between an app you can change and one you're afraid of.

## Common mistakes

**1. Changing the array in place**

```tsx
tasks.push(newTask);                      // ❌ nothing happens
const task = tasks.find((t) => t.id === id);
task.done = !task.done;                   // ❌ nothing happens
```

The screen doesn't move and there's no error, which makes it the worst one. New array, every time.

**2. A missing or index-based `key`**

```tsx
{tasks.map((task, index) => <TaskItem key={index} task={task} ... />)}
```

The list is reordered and filtered constantly here, so this will put ticks on the wrong rows. Use `task.id`.

**3. Forgetting `event.preventDefault()`**

Add a task and the whole page reloads, wiping your state. Once you reach milestone 8 it's worse: the reload *looks* like it worked, because the data comes back from storage.

**4. Filtering the counter**

```tsx
const remaining = visibleTasks.filter((task) => !task.done).length;   // ❌
```

"2 tasks left" would change every time you switched tab. Count `tasks`, not `visibleTasks`.

**5. Storing what you can derive**

```tsx
const [visibleTasks, setVisibleTasks] = useState<Task[]>([]);   // ❌
const [remaining, setRemaining] = useState(0);                  // ❌
```

Both go stale. Calculate them during the render.

**6. `value` on a checkbox**

`checked={task.done}`, and `onChange`, not `onClick`. Otherwise you get the read-only warning from [chapter 09](../09-forms/notes.md).

**7. Generating the id during render**

```tsx
<TaskItem key={crypto.randomUUID()} ... />   // ❌
```

A brand-new key every render means React rebuilds every row every time. The id is created once, when the task is born.

**8. Calling `loadTasks()` instead of passing `loadTasks`**

```tsx
useState<Task[]>(loadTasks())   // reads localStorage on every single render
useState<Task[]>(loadTasks)     // ✅ once
```

Both *work*, which is why it's easy to miss.

## Quick recap

- State is the truth. React redraws from it, so the page and the data can't disagree.
- Every change makes a **new** array or object: `[...tasks, task]` to add, `filter` to remove, `map` with a spread to change one.
- State lives in the closest component that contains everything needing it. Here that's `App` for the tasks, and `AddTaskForm` for the half-typed text.
- Children report events upwards through **callback props** (`onAdd`, `onToggle`, `onDelete`), typed at both ends.
- Anything you can calculate — the counter, the filtered list — is derived during the render, never stored.
- The React version has more ceremony and far fewer ways to go wrong. That trade gets better the bigger the app gets.

---

**Next:** try the [stretch goals](exercises.md), then move on to [11 Updating Objects and Arrays in State](../11-updating-objects-and-arrays/notes.md), which turns the copying rules you've just been following into a proper toolkit.
