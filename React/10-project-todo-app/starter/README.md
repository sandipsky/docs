# To-Do App: starter files

These two files go into a fresh Vite app. They are a starting point, not a solution — `App.tsx` is a stub, and all the React is yours to write. Follow the milestones in this chapter's [notes.md](../notes.md).

## How to use them

1. In a terminal **in the `React` folder**, run `npm create vite@latest` and answer as you did in [chapter 01](../../01-getting-started/notes.md), but name the project `todo-app`.
2. Copy the two files in this folder's `src/` over the same-named files in `todo-app/src/`.
3. Delete `todo-app/src/App.css` and `todo-app/src/assets/`. Nothing imports them any more.
4. `cd todo-app`, then `npm run dev`.

You should see the heading "My To-Do List" on a plain page, and nothing else.

## What's in here

| File | What it is |
|---|---|
| `src/App.tsx` | A stub component with the eight milestones listed in a comment. |
| `src/index.css` | All the styling, finished. You shouldn't need to change it. |

`main.tsx`, `index.html` and everything else stay exactly as Vite made them.

## The class names the CSS expects

Use these names and the app will look right. Anything not in this list you can style however you like.

| Class | Put it on |
|---|---|
| `app` | the wrapping `<div>` in `App` |
| `app dark` | the same `<div>`, in dark mode (stretch goal 1) |
| `app-title` | the `<h1>` |
| `theme-button` | the dark mode button (stretch goal 1) |
| `todo-form` | the `<form>` that adds a task |
| `todo-input` | its text box |
| `add-button` | its Add button |
| `toggle-all-button` | the "mark all done" button (stretch goal 2) |
| `filters` | the `<div>` around the filter buttons |
| `filter-button` | each filter button |
| `filter-button active` | the selected filter button |
| `todo-list` | the `<ul>` |
| `todo-item` | each `<li>` |
| `todo-item completed` | an `<li>` whose task is done |
| `todo-checkbox` | the tick box |
| `todo-text` | the `<span>` holding the task text |
| `todo-edit-input` | the text box shown while editing (stretch goal 4) |
| `delete-button` | the `×` button |
| `todo-footer` | the `<footer>` under the list |
| `todo-count` | the "2 tasks left" text |
| `clear-button` | the "Clear completed" button |
| `empty-message` | the "Nothing to do" paragraph |
| `undo-bar` | the undo bar (stretch goal 5) |
| `undo-button` | the Undo button inside it |
| `visually-hidden` | a label you want read aloud but not shown |

## A note on `visually-hidden`

A `placeholder` is not a label: it vanishes as soon as someone types, and screen readers don't reliably announce it. So the input still gets a real `<label>`, marked `visually-hidden` so it's there for anyone using a screen reader without taking up space on screen:

```tsx
<label className="visually-hidden" htmlFor="new-task">New task</label>
<input id="new-task" className="todo-input" placeholder="e.g. Buy milk" ... />
```

More on this in [chapter 38](../../38-accessibility/notes.md).
