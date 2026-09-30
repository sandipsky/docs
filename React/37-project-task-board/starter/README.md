# Task Board: starter files

Three files to drop into a fresh Vite app's `src/`, plus the practice API's data. The two route files are stubs. The API layer, every component, the store and the tests are yours to write. Follow the milestones in this chapter's [notes.md](../notes.md).

## How to use them

1. In a terminal **in the `React` folder**, run `npm create vite@latest`, answering as in [chapter 01](../../01-getting-started/notes.md), and name the project `taskboard`.
2. Copy this folder's `src/` over `taskboard/src/`. (`index.css` replaces Vite's, and `routes/` is new.)
3. Copy `db.json` into `taskboard/`, **next to `package.json`**, not inside `src/`. Keep a spare copy too (see the json-server note below).
4. Delete `taskboard/src/App.tsx`, `taskboard/src/App.css` and `taskboard/src/assets/`. File-based routes replace `App.tsx`.
5. `cd taskboard`, then install what the project needs:

   ```
   npm install axios @tanstack/react-query @tanstack/react-query-devtools zod react-hook-form @hookform/resolvers zustand @tanstack/react-router
   npm install -D @tanstack/router-plugin json-server vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
   ```

6. Add two scripts to `package.json`: `"api": "json-server --port 3001 db.json"` and `"test": "vitest"`.
7. Set up `vite.config.ts`, `src/test-setup.ts` and `src/main.tsx` as shown below.
8. Stop the playground's json-server if it's running (it uses the same port). Then open three terminals in `taskboard`: `npm run dev`, `npm run api` and `npm test`.

You should see the header and "Nothing here yet — start with milestone 1."

## What's in here

| File | What it is |
|---|---|
| `db.json` | The practice API's data: 9 tasks for a small team launching a bakery's new website. |
| `src/routes/__root.tsx` | The root route: a stub layout (header + `<Outlet />`), with the nine milestones listed in a comment. |
| `src/routes/index.tsx` | The board at `/`: a stub. |
| `src/index.css` | All the styling, finished: a light and a dark theme, compact cards, and the stretch goals. |

## The setup files

### `vite.config.ts`

This combines the router plugin from [chapter 36](../../36-tanstack-router/notes.md) with the Vitest block from [chapter 28](../../28-testing/notes.md). **The router plugin must come before `react()`.** The TanStack docs insist on this order, because the router plugin changes your route files (for example, splitting them into smaller chunks) before React's plugin handles them.

```ts
/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

export default defineConfig({
  plugins: [
    tanstackRouter({ target: "react", autoCodeSplitting: true }),   // first!
    react(),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test-setup.ts",
  },
});
```

The plugin's import name has changed before. Older tutorials write `TanStackRouterVite` instead of `tanstackRouter`. If your version complains, check the [TanStack Router installation docs](https://tanstack.com/router/latest/docs/framework/react/installation/with-vite).

### `src/test-setup.ts`

Same as chapter 28:

```ts
import "@testing-library/jest-dom/vitest";
```

### `src/main.tsx`

Replace Vite's version (it imports `App.tsx`, which you deleted) with this. It's the milestone 1 version. Milestone 3 adds the `QueryClient`, and milestone 6 adds router context.

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen.ts";
import "./index.css";

const router = createRouter({ routeTree });

// Tells TypeScript about your routes, so every <Link to="..."> is checked (chapter 36)
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
```

`routeTree.gen.ts` doesn't exist until the router plugin writes it. Run `npm run dev` once, and it appears. Until then, VS Code underlines that import. Never edit the file by hand: the plugin rewrites it every time your routes change.

## Where things go

A suggested map. You don't have to match it exactly.

```
taskboard/
├── db.json                  the practice API's data (json-server reads and writes it)
├── vite.config.ts
└── src/
    ├── main.tsx             the QueryClient, the router, the providers
    ├── index.css            finished (starter)
    ├── routeTree.gen.ts     written by the router plugin
    ├── test-setup.ts
    ├── dates.ts             formatting due dates
    ├── api/
    │   ├── client.ts        the Axios instance, ApiError, the interceptor
    │   ├── schemas.ts       Zod schemas, the types made from them, emptyTask
    │   ├── tasks.ts         getTasks, getTask, createTask, updateTask, deleteTask
    │   └── queries.ts       tasksQueryOptions, taskQueryOptions, useMoveTask
    ├── routes/              ONLY route files in here
    │   ├── __root.tsx       the header and <Outlet /> (starter)
    │   ├── index.tsx        /  the board (starter)
    │   └── tasks/
    │       ├── new.tsx      /tasks/new
    │       └── $taskId.tsx  /tasks/3, /tasks/7, ...
    ├── components/          FilterBar, Column, TaskCard, TaskForm, PreferenceToggles
    └── stores/
        └── preferences.ts   Zustand: theme and compact cards
```

Tests sit next to what they test: `api/schemas.test.ts`, `stores/preferences.test.ts`, `components/TaskForm.test.tsx`. Keep them out of `src/routes/`, because the router plugin treats every file in there as a route. (Files and folders whose names start with `-` are ignored, if you ever need an exception.)

## The class names the CSS expects

Use these and the app will look right. Anything not listed, style however you like.

**Layout and header**

| Class | Put it on |
|---|---|
| `app` | the wrapping `<div>` in the root layout |
| `site-header` | the `<header>` |
| `app-name` | the app's name, a `<Link to="/">` |
| `header-actions` | a `<div>` holding the New task link and the toggles (it sits on the right) |
| `toggle-button` | the theme and compact buttons, alongside `btn btn-secondary btn-small`. It looks "on" when the button has `aria-pressed="true"` |
| `page` | the `<main>` around `<Outlet />` |
| `page-title` | each page's `<h1>` |

**The board**

| Class | Put it on |
|---|---|
| `filter-bar` | the `<div>` around the search box and the priority select |
| `filter-label` | a visible label in the filter bar (or use `visually-hidden` labels) |
| `search-input`, `filter-select` | the controls |
| `result-count` | the "Showing 4 of 9 tasks" line |
| `board` | the `<div>` holding the three columns (they stack on narrow screens) |
| `column` + `column-todo` / `column-doing` / `column-done` | each column's `<section>`. The second class colours its top edge |
| `column-header` | a `<div>` at the top of each column, around the title |
| `column-title` | the column's `<h2>` |
| `column-count` | the number, in a `<span>` inside the title |
| `task-list` | the `<ul>` of cards |
| `column-empty` | the "No tasks here" message |

**Cards**

| Class | Put it on |
|---|---|
| `task-card` / `task-card compact` | each `<li>`: a container, **not** a link or a button (see below) |
| `task-card-link` | the `<Link>` to the task page, around the title and description |
| `task-title` | the title, an `<h3>` |
| `task-description` | the description (cut to two lines, and hidden in compact mode) |
| `task-meta` | the row with the priority badge and the due date |
| `priority-badge` + `priority-low` / `priority-medium` / `priority-high` | the priority `<span>` |
| `due-date` | the "Due 3 Oct" text |
| `card-actions` | the `<div>` around the move buttons |
| `move-back`, `move-forward` | add to the ← and → buttons. `move-forward` keeps → on the right, even when it's the only button |

**Forms**

| Class | Put it on |
|---|---|
| `task-form` | the `<form>` |
| `form-field` | each label + control + error message |
| `form-row` | a `<div>` putting status, priority and due date side by side |
| `field-hint` | a `<span>` like "(optional)" inside a label |
| `field-error` | a field's error message |
| `form-error` | the whole-form error from `errors.root` |
| `form-actions` | the row with the submit button |

Any control inside a `form-field` with `aria-invalid="true"` gets a red border automatically.

**Buttons**

| Class | Put it on |
|---|---|
| `btn` | every button, and any link styled as a button (like "New task"). Always with a variant |
| `btn-primary`, `btn-secondary`, `btn-ghost`, `btn-danger` | the variants |
| `btn-small` | the small size (the move buttons, the header toggles) |

**The task pages**

| Class | Put it on |
|---|---|
| `task-page` | the wrapper on `/tasks/new` and `/tasks/$taskId` (it's narrower than the board) |
| `back-link` | "Back to the board", and the Cancel link |
| `task-details` | a `<dl>` of status, priority, due date and created date |
| `danger-zone` | the `<section>` holding the Delete button |
| `confirm-delete` | the "Delete this task for good?" box, with a `<p>` and two buttons |

**Status messages**

| Class | Put it on |
|---|---|
| `status-message` | loading, empty and not-found text |
| `status-message error` | the board's error, with its Try again button |
| `notice` / `notice error` / `notice success` | a slim message bar, like the move error above the columns |
| `skeleton-card` | optional grey placeholder cards while the board loads |

**Stretch goals:** `due-badge` + `overdue` / `due-today` / `due-soon`; `toast-region`, `toast`, `toast-message`, `toast-action`, `toast-close`; `drag-handle`, `task-card dragging`, `column drop-target`; `board-nav`, `board-nav-link` (active when it has `active` or TanStack Router's own `data-status="active"`).

**Utilities:** `visually-hidden`, for text a screen reader reads but the screen doesn't show.

**The dark theme** switches on when `<html>` has `data-theme="dark"` (milestone 8). Every colour is a CSS variable, so nothing else changes.

## A note on the card structure

Same rule as the [Recipe Finder](../../21-project-recipe-finder/starter/README.md) and the [bookstore](../../29-project-online-bookstore/starter/README.md): a card has **several** interactive things in it. There's a link to the task, and one or two move buttons. Nesting a `<button>` inside an `<a>` (or the other way round) is invalid HTML and behaves unpredictably.

So the card is a plain container, with the link and the buttons as siblings:

```tsx
<li className="task-card">
  <Link className="task-card-link" to="/tasks/$taskId" params={{ taskId: task.id }}>
    <h3 className="task-title">{task.title}</h3>
    <p className="task-description">{task.description}</p>
  </Link>
  <div className="task-meta">...priority badge, due date...</div>
  <div className="card-actions">...the move buttons...</div>
</li>
```

Notice the typed `Link`: `to` is the route's pattern, and `params` fills in the `$taskId`. Misspell either one, and TypeScript tells you.

## A note on json-server

- `npm run api` serves `db.json` at `http://localhost:3001`. Open `http://localhost:3001/tasks` in the browser to see the raw data.
- It answers `GET /tasks`, `GET /tasks/:id`, `POST /tasks`, `PATCH /tasks/:id` and `DELETE /tasks/:id`, as in [chapter 30](../../30-axios/notes.md). A missing id gets a `404`.
- **It makes the id for every new task.** The seed tasks use `"1"` to `"9"`, but a new task gets a short random string instead, something like `"f3a9"` (the exact format depends on the version). That's why `id` is a string, and why your app never makes ids itself.
- **It writes every change back into `db.json`.** After an evening of testing, the file will look quite different. Keep a spare copy, such as `db.backup.json`. To reset, stop json-server, copy the backup over `db.json`, and start it again.
- json-server 1 is still labelled beta. If it behaves differently from what's described here, check chapter 30, then its README.
- It only runs on your own computer. [Chapter 40](../../40-deploying/notes.md) covers what to do about that when you put an app online.

## A note on dates

**Store ISO strings, format for display.** A due date is a plain date string like `"2026-10-05"` (no time), or `null`. `createdAt` is a full timestamp like `"2026-09-14T09:20:00.000Z"`. Both survive JSON unchanged, and both sort correctly as text.

**Formatting a due date:**

```ts
const dueFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

dueFormat.format(new Date("2026-10-05"));   // "5 Oct"
```

Why `timeZone: "UTC"`? `new Date("2026-10-05")` means midnight **in UTC**. If you format that in the local time zone and you're west of London (New York, say), it's still the evening before, so you'd see "4 Oct". Formatting in UTC shows the date that was stored. (Most browsers write September as "Sept" in British English, so expect "28 Sept".) For `createdAt`, which really is a moment in time, format in local time as normal.

**Working out "overdue"** (stretch goal 1) should compare **dates, not times**. `new Date(task.dueDate) < new Date()` looks right, but `new Date()` includes the current time, so a task due *today* would count as overdue for most of the day. Instead, build today's date as a `"YYYY-MM-DD"` string from the local date parts, and compare the two strings. And remember that a finished task is never overdue.

Pass "today" into your date functions as an argument, rather than reading the clock inside them. Then a test can pick any date it likes, the same trick as `daysUntilWater(plant, today)` in [JavaScript chapter 52](../../../JavaScript/52-final-project/notes.md).

**The seed dates are set around October 2026.** If you're working later than that, most tasks will show as overdue. Edit the dates in `db.json`, or treat it as a good test of your overdue styling.
