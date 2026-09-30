# 37 Project: Task Board: Exercises

These are **stretch goals**: extra features for your finished task board. Do them in any order, and do as many as you like.

**How to do these:**

- Finish all 9 milestones first. Then commit or copy the `taskboard` folder (including `db.json`), so you've always got a working version to go back to.
- `index.css` already has styles for these goals. Look for "Styles for the stretch goals" near the bottom, and the class names in `starter/README.md`.
- Keep all three terminals running: `npm run dev`, `npm run api` and `npm test`.
- **Write the test first for anything with rules in it**, like dates or sorting. Pure functions are the cheapest things to test.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Due-date badges

A date like "29 Sept" makes you do the maths. A badge saying **Overdue** doesn't.

1. Write a pure function in `src/dates.ts` that takes a task's `dueDate`, its `status` and today's date (as a `"YYYY-MM-DD"` string), and returns the badge to show, or `null` for none.
2. The badges: **Overdue** (due before today), **Due today**, **Due tomorrow**, and **Due in N days** for up to a week ahead. Anything further away, or with no due date, gets no badge.
3. A task in **Done** never gets a badge, however late it was.
4. **Write the tests first**, in `src/dates.test.ts`: one for each badge, one for "more than a week away", one for `null`, and one for a finished task.
5. Show the badge on each card with the `due-badge` classes (`overdue`, `due-today`, `due-soon`).

**What you should see** (if today were 30 September 2026, as in the seed data): "Photograph the autumn menu" and "Fix the menu page on phones" say **Overdue**, "Set up the online order form" says **Due today**, "Write the About page" says **Due tomorrow**, and "Test the site on an old laptop" says **Due in 6 days**. The two Done tasks have no badge.

<details>
<summary>Hint 1</summary>

Read the starter README's note on dates first. Comparing `"YYYY-MM-DD"` strings with `<` and `===` works, because ISO dates sort correctly as text. For "how many days away", turn both strings into dates at UTC midnight and divide the difference by the number of milliseconds in a day.

</details>

<details>
<summary>Hint 2</summary>

Taking `today` as an argument is what makes this testable. Your tests can say "pretend it's 30 September" without touching the clock. The component calls it with a real `todayIso()` helper; the tests call it with a fixed string.

</details>

---

## Exercise 2 (Easy): Sorting, in the URL

Add a **Sort by** dropdown to the filter bar: *Newest first*, *Priority (high first)* and *Due date (soonest first)*.

1. The choice lives in the URL next to the filters, like `/?priority=all&sort=due`. Add it to your board's search schema, with a default.
2. Sorting happens inside each column, during render. Never sort the cached array itself ([chapter 11](../11-updating-objects-and-arrays/notes.md)).
3. Tasks with no due date go **last** when sorting by due date.
4. Test your sort functions, including a tie (two tasks with the same priority) and a `null` due date.
5. Add a **Clear filters** link that takes you back to the board with every search param at its default.

<details>
<summary>Hint 1</summary>

A lookup object from each sort key to a compare function keeps this tidy, with `satisfies Record<SortKey, (a: Task, b: Task) => number>` ([chapter 25](../25-typescript-patterns/notes.md)). For priority, a small `{ high: 0, medium: 1, low: 2 }` lookup turns words into numbers you can subtract.

</details>

<details>
<summary>Hint 2</summary>

For **Clear filters**, a typed `<Link to="/">` with an empty `search` object is enough, because every search param has a default. Try giving it a sort key that doesn't exist, and read the type error.

</details>

---

## Exercise 3 (Medium): Undo delete

Deleting something by accident is horrible. Replace the confirm step with an **Undo** button, like most email apps do.

1. Make a toast store in Zustand: a list of toasts, each with an id, a message and an optional action (a label and a function). Add `showToast` and `dismissToast` actions. This store is **not** persisted: toasts shouldn't come back after a refresh.
2. Show the toasts in a `toast-region` in the root layout. Give it `role="status"`, so screen readers announce new ones.
3. Deleting a task goes straight back to the board and shows "Task deleted" with an **Undo** button, for about five seconds.
4. Clicking **Undo** brings the task back.

There are two honest ways to do step 4, and both have a catch:

- **Wait before deleting.** Hide the task from the board straight away (an optimistic update), but only send the DELETE after five seconds, if nobody pressed Undo. The catch: what if they close the tab during those five seconds?
- **Delete now, re-create on Undo.** Send the DELETE at once, and POST the task again if they press Undo. The catch: find out whether json-server keeps an `id` you send in a POST, or makes a new one. If the id changes, what happens to a link someone saved to `/tasks/3`?

Pick one, build it, and write a comment explaining your choice.

<details>
<summary>Hint 1</summary>

Storing a function in a Zustand store is fine, as long as the store isn't persisted (functions can't be turned into JSON). Each toast can clear itself with a `setTimeout` started when it's shown. Remember to clear that timer if the toast is dismissed early.

</details>

<details>
<summary>Hint 2</summary>

For "wait before deleting", your chapter 31 tools already do the hiding: `setQueryData` to remove the task from the cached list, just like `useMoveTask` changes one. Undo is then "put the old list back", which is exactly a rollback.

</details>

---

## Exercise 4 (Medium): Swap Zustand for Redux Toolkit

This app picked Zustand. Try the other road, so your opinion is based on experience rather than on what you've read.

1. Do this on a copy of the project (or a new git branch).
2. Replace `src/stores/preferences.ts` with a Redux Toolkit slice ([chapter 35](../35-redux-toolkit/notes.md)): the same two settings, and a reducer for each toggle.
3. Set up the store, the `<Provider>`, and the typed hooks, as chapter 35 showed you.
4. Keep the preferences saved between visits. Redux Toolkit has no built-in `persist`, so write it yourself: load from `localStorage` when you create the store, and save when the state changes.
5. Update the store tests, then open Redux DevTools and watch your toggles appear as actions.
6. Write down: how many files changed, how many lines each version took, which one was easier to test, and which one you'd pick **for this app**. Then, at what size of app would you change your mind?

<details>
<summary>Hint 1</summary>

For step 4, `store.subscribe(() => ...)` runs after every action, so it's a natural place to save. Read the saved JSON inside a `try`/`catch`, like the to-do app's `loadTasks` in [chapter 10](../10-project-todo-app/notes.md), and pass it to `configureStore` as `preloadedState`.

</details>

<details>
<summary>Hint 2</summary>

Nothing about the tasks should change in this exercise. If you find yourself moving tasks into the Redux store, stop: server data stays in TanStack Query, whichever library holds your client state.

</details>

---

## Exercise 5 (Challenge): Make it bigger

Three larger additions. Pick one, or take them in any order.

**A. Drag and drop, on top of the buttons.** Use a library such as `@dnd-kit` to let people drag cards between columns. The move buttons stay: dragging is an extra, never the only way. A drop calls the same `onMove` as the buttons, so it gets the optimistic update for free. Use the `dragging` and `drop-target` classes to show what's happening. (Drag-and-drop libraries change their APIs often, and `@dnd-kit` has both an older and a newer set of packages. Check its docs for the one it currently recommends.)

**B. More than one board.** Add a `boards` collection to `db.json`, and give every task a `boardId`. Move the board to `/boards/$boardId`, with its tasks at `/boards/$boardId/tasks/$taskId`, using a layout route for the board's header and a `board-nav` of links to the other boards. Make `/` send people to the first board. Think carefully about your query keys: what should `invalidateQueries` refresh when a task on board 2 changes?

**C. Tests for whole pages.** Test the real routed pages, not just their parts: the board shows 9 tasks; a URL with `?priority=high` shows 3; `/tasks/999` shows not found; and a move rolls back when the server fails. Use TanStack Router's memory history to start at any URL, a fresh `QueryClient` per test, and **MSW** (Mock Service Worker, named in [chapter 28](../28-testing/notes.md)) to fake json-server.

<details>
<summary>Hint 1</summary>

For A, make each column a drop target and each card draggable, but give the card a separate small `drag-handle` button to drag by. Then the card's link and move buttons still work normally when you click them.

</details>

<details>
<summary>Hint 2</summary>

For B, json-server can filter for you: `GET /tasks?boardId=2`. Keys like `["boards", boardId, "tasks"]` keep each board's tasks separate, while still sharing a beginning with anything else about that board. And a loader can `throw redirect(...)` just as it can `throw notFound()`.

</details>

<details>
<summary>Hint 3</summary>

For C, build the router inside each test with `createRouter({ routeTree, history: createMemoryHistory({ initialEntries: ["/tasks/999"] }), context: { queryClient } })`, and render it inside a `QueryClientProvider`. Turn off retries in the test's `QueryClient`, or your error tests will wait through three retries. MSW then answers `http://localhost:3001/tasks` with whatever each test needs.

</details>

---

## When you're done

That's the end of Level 4, and the end of the toolbox. You've now used the libraries most React teams use, and you know what each one replaced.

Before moving on, write down:

- One library you'd happily use again, and one you're not sure earned its place in this app.
- One bug a library caught for you while you were building (a Zod error, a typed link, a type error in a form).
- One thing you'd do differently if you started this project again.

Bring the last one to Claude and talk it through.
