# 37 Project: Task Board

## What you'll build

A task board for a small team, with three columns of cards: **To do**, **Doing** and **Done**. You can add tasks, edit them, delete them, and move them from column to column. The tasks are saved on a server, so they're still there tomorrow.

This kind of board is called a **Kanban board** (*kanban* is Japanese for "signboard"). Picture a wall of sticky notes in columns, where you move each note along as the work gets done.

```
┌────────────────────────────────────────────────────────────────┐
│ Task Board                     [+ New task]  [Dark]  [Compact] │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ Search [ menu          ]   Priority [ All ▾ ]                  │
│ Showing 2 of 9 tasks                                           │
│                                                                │
│ To do (1)            Doing (1)            Done (0)             │
│ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ │
│ │ Photograph the   │ │ Fix the menu     │ │                  │ │
│ │ autumn menu      │ │ page on phones   │ │  No tasks here   │ │
│ │ HIGH · 28 Sept   │ │ MEDIUM · 29 Sept │ │                  │ │
│ │                  │ │                  │ │                  │ │
│ │        [Doing →] │ │[← To do] [Done →]│ │                  │ │
│ └──────────────────┘ └──────────────────┘ └──────────────────┘ │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

By the end, your app will have:

- a board that loads tasks from a real (practice) API, with proper loading and error states
- search and priority filters in the URL, so a filtered board can be shared in a link
- a page for every task at its own URL, like `/tasks/3`
- one form for both creating and editing a task, with clear error messages
- moves between columns that feel instant, and undo themselves if the server says no
- a light and dark theme and a compact view, remembered between visits
- tests for the parts most likely to break

This is the Level 4 project. It uses the whole toolbox, and gives each library **one job**:

| Chapter | Its one job in this app |
|---|---|
| [30 Axios](../30-axios/notes.md) | One `api` instance in `src/api/client.ts`, with an interceptor that turns errors into friendly messages |
| [31 TanStack Query](../31-tanstack-query/notes.md) | Every read and write of tasks, and the instant moves between columns |
| [32 Zod](../32-zod/notes.md) | The shape of a task, checked on every response. Also the shape of the URL's search params |
| [33 React Hook Form](../33-react-hook-form/notes.md) | One `TaskForm`, used for both creating and editing |
| [34 Zustand](../34-zustand/notes.md) | Your preferences: the theme and compact cards, saved between visits |
| [36 TanStack Router](../36-tanstack-router/notes.md) | The pages, typed links, filters in the URL, and loading a task before its page appears |
| [28 Testing](../28-testing/notes.md) | Tests for the schemas, the preferences store, and the form |
| [35 Redux Toolkit](../35-redux-toolkit/notes.md) | Not used, on purpose (see below) |
| [38 Accessibility](../38-accessibility/notes.md) (next level) | Moving cards with real buttons, not drag and drop, so it works with a keyboard |

**Why no Redux Toolkit?** Real apps pick one library for shared client state, not two. This app's shared client state is tiny, just two settings, and Zustand handles that in about fifteen lines. Redux Toolkit shines in apps with lots of shared state and lots of people working on them. Swapping one for the other is a stretch goal, so you can compare them on the same app.

**Why buttons, not drag and drop?** Dragging needs a mouse or a finger, and someone using only a keyboard can't drag. So every card gets real buttons, like **Doing →**, that work with Tab and Enter. Drag and drop is a stretch goal, added *on top of* the buttons.

**The API** is your practice API from [chapter 30](../30-axios/notes.md): json-server on port 3001. This app gets its own `db.json`, with tasks for a small team launching a bakery's new website.

**Versions:** React 19, Axios 1, TanStack Query v5, Zod 4, React Hook Form 7 (with `@hookform/resolvers` 5), Zustand 5, TanStack Router v1, and json-server 1 (still labelled beta). These libraries change fast. If something doesn't match what you see, check the chapter that taught it, then the library's docs.

## Getting started

This project gets its own app, like `router-practice` in [chapter 36](../36-tanstack-router/notes.md). File-based routes take over the whole app, so it can't live in the playground.

1. In a terminal **in this `React` folder**, run `npm create vite@latest`, answering as in [chapter 01](../01-getting-started/notes.md), and name it `taskboard`.
2. Copy this chapter's `starter/src/` over `taskboard/src/`, and `starter/db.json` into `taskboard/`, **next to `package.json`** (not inside `src/`).
3. Delete `taskboard/src/App.tsx`, `taskboard/src/App.css` and `taskboard/src/assets/`. The route files replace `App.tsx`.
4. `cd taskboard`, then install everything:

   ```
   npm install axios @tanstack/react-query @tanstack/react-query-devtools zod react-hook-form @hookform/resolvers zustand @tanstack/react-router
   npm install -D @tanstack/router-plugin json-server vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
   ```

5. Add two scripts to `package.json`: `"api": "json-server --port 3001 db.json"` and `"test": "vitest"`.
6. Set up `vite.config.ts`, `src/test-setup.ts` and `src/main.tsx`. The [starter README](starter/README.md) has all three. (Copy the config carefully: its two plugins must go in a certain order.)

Then open three terminals, all inside `taskboard`:

1. `npm run dev`: the app, at `http://localhost:5173`
2. `npm run api`: the practice API, at `http://localhost:3001/tasks`
3. `npm test`: the tests, re-running every time you save

**Stop the playground's API first.** Only one program can use port 3001 at a time. If the playground's json-server is still running, `npm run api` fails with an error mentioning `EADDRINUSE` ("address already in use"). Use `npx tsc -b` whenever you want a full type check.

The starter README also has a map of where every file goes. Two rules keep it tidy:

- **Only `src/api/` talks to the server.** No component calls `api.get` or knows the URL `/tasks`. Same idea as `api.ts` in the [Recipe Finder](../21-project-recipe-finder/notes.md).
- **Only route files go in `src/routes/`.** The router plugin turns *every* file in there into a page, so components, stores and tests live somewhere else.

## The big idea: four homes for state

The bookstore had three kinds of state. This app has four, and each one has a home:

| Kind | In this app | Its home |
|---|---|---|
| **Local** | Half-typed form fields | React Hook Form |
| | "Is the delete confirmation showing?" | `useState` |
| **URL** | Search text, priority filter, which task is open | TanStack Router |
| **Shared client** | Theme, compact cards | Zustand |
| **Server** | The tasks themselves | TanStack Query |

A quick test for each, asked in this order:

- **Is it a copy of something on the server?** → TanStack Query.
- **Would someone want to send it in a link?** → the URL.
- **Do components far apart need it?** → Zustand.
- **None of those?** → local, in the component.

The most common mistake is putting server data somewhere else: fetching the tasks, then copying them into Zustand or `useState` "so the whole app can use them". Now there are two copies. TanStack Query refetches and updates its copy. Yours goes stale, and nobody notices until the board shows a task that was deleted an hour ago. Any component can call `useQuery(tasksQueryOptions)` and get the same cached tasks. That *is* the shared copy.

## Milestone 1: Setup and routes

**Goal:** three pages with real URLs, sharing one header.

Your `main.tsx` (from the starter README) creates the router and does the `Register` step from [chapter 36](../36-tanstack-router/notes.md), so TypeScript can check every link in the app against your real routes. The `routeTree` it imports lives in `routeTree.gen.ts`, which the router plugin writes while `npm run dev` is running. **Never edit that file.**

The starter gives you `__root.tsx` and `index.tsx`. Add two more route files:

| File | URL | For now, it shows |
|---|---|---|
| `src/routes/index.tsx` | `/` | The board stub (from the starter) |
| `src/routes/tasks/new.tsx` | `/tasks/new` | A heading: "New task" |
| `src/routes/tasks/$taskId.tsx` | `/tasks/3` | A heading with the task's id |

In current versions, if you create an empty file in `src/routes/` while the dev server is running, the plugin fills in a starter route for you. On the task page, `Route.useParams()` gives you `taskId` as a `string`. Compare that with [chapter 24](../24-react-router/notes.md), where `useParams` was always `string | undefined`. This router knows the page only exists when there's an id.

Then fill in the root layout in `__root.tsx`: the app name linking to `/`, a **New task** link, a theme toggle button that does nothing yet (milestone 8 wires it up), and `<Outlet />`. Add a `notFoundComponent` to the root route, with a link back to the board.

**Check it:** type each URL straight into the address bar: `/`, `/tasks/new`, `/tasks/3`. Each shows its page under the header, and `/nonsense` shows your not-found page. Notice that `/tasks/new` shows the new-task page, not a task with the id `"new"`: a fixed path beats a `$param`. Then make a typo on purpose, `<Link to="/taks/new">`, and write down the exact error `npx tsc -b` gives you.

## Milestone 2: The API layer

**Goal:** every request in one folder, and every response checked. No UI yet.

Start with `src/api/client.ts`: the `api` instance from [chapter 30](../30-axios/notes.md), with `baseURL: "http://localhost:3001"`. Add a small `ApiError` class that extends `Error` and has one extra field, `status: number | null` (`null` means the server never answered). Then the interceptor turns every failure into one:

```ts
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? null;
      return Promise.reject(new ApiError(friendlyMessage(status), status));
    }
    return Promise.reject(error);
  },
);
```

Now every error has a message a person can read, and still keeps its status code, so later code can tell "not found" apart from "server down". `friendlyMessage` is yours to write: `null` might say "Can't reach the server. Is the API running (npm run api)?", `404` "That task doesn't exist.", and anything else "Please try again".

Next, `src/api/schemas.ts`. **These schemas are the single source of truth.** The types, the API checks and the form's error messages all come from here:

```ts
export const STATUSES = ["todo", "doing", "done"] as const;
export const PRIORITIES = ["low", "medium", "high"] as const;

export const TaskSchema = z.object({
  id: z.string(),
  title: z.string().trim().min(1, "Give the task a title").max(80, "Keep the title to 80 characters or fewer"),
  description: z.string().max(500, "Keep the description to 500 characters or fewer"),
  status: z.enum(STATUSES),
  priority: z.enum(PRIORITIES),
  dueDate: z.iso.date().nullable(),   // "2026-10-05", or null for "no due date"
  createdAt: z.iso.datetime(),        // "2026-09-14T09:20:00.000Z"
});

export const TaskListSchema = z.array(TaskSchema);
export const NewTaskSchema = TaskSchema.omit({ id: true, createdAt: true });

export type Task = z.infer<typeof TaskSchema>;
export type NewTask = z.infer<typeof NewTaskSchema>;
export type TaskStatus = Task["status"];
```

A few things to notice. `description` can be an empty string: that's what "no description" looks like here, so nobody has to wonder whether it's `""` or `undefined`. `NewTaskSchema` leaves out what the app fills in itself (json-server makes the `id`, and `createTask` adds `createdAt`). And the error messages live in the schema, so the form in milestone 5 gets them for free.

Then `src/api/tasks.ts`, with five functions. Each sends a request and **parses** what comes back ([chapter 32](../32-zod/notes.md)):

```ts
export async function getTasks(): Promise<Task[]> {
  const response = await api.get("/tasks");
  return TaskListSchema.parse(response.data);
}
```

Write the rest the same way: `getTask(id)`, `createTask(newTask)` (POST, adding `createdAt: new Date().toISOString()`), `updateTask(id, changes)` (PATCH, with `changes: Partial<NewTask>`), and `deleteTask(id)` (DELETE, returning nothing).

**Now test the schemas, before any UI exists.** It's the bookstore's reducer-first move again: plain functions, no rendering, no mocking. In `src/api/schemas.test.ts`, start from one valid task object (copy one from `db.json`) and change one thing per test:

```ts
test("rejects a priority the app doesn't know", () => {
  const result = TaskSchema.safeParse({ ...validTask, priority: "urgent" });

  expect(result.success).toBe(false);
  expect(result.error?.issues[0].path).toEqual(["priority"]);
});
```

Aim for five: a valid task passes; `priority: "urgent"` fails at `["priority"]`; `dueDate: null` passes but `"next Tuesday"` fails; a title of only spaces fails with your message; and `NewTaskSchema` accepts a task with no `id` or `createdAt`.

**Check it:** `npm test` passes. Then try the real API. In `db.json`, change one task's `"priority"` to `"urgent"` and save. (json-server usually notices. If not, stop it and run `npm run api` again.) With the app open in the browser, type this in the DevTools Console:

```js
const { getTasks } = await import("/src/api/tasks.ts");
await getTasks();
```

This works because Vite serves your source files as modules while you develop. You should get a Zod error naming `priority` and the three allowed values. The API sent bad data, and your code caught it. Put `"medium"` back. (If the Console trick feels fiddly, do this check after milestone 3, when the board can show the error.)

## Milestone 3: Reading the board

**Goal:** three columns of real tasks, from one request.

In `main.tsx`, create one `QueryClient`. Wrap `<RouterProvider>` in `<QueryClientProvider>`, with `<ReactQueryDevtools />` inside it too ([chapter 31](../31-tanstack-query/notes.md)). Then make `src/api/queries.ts`, so every component asks for tasks in the same way:

```ts
export const tasksQueryOptions = queryOptions({ queryKey: ["tasks"], queryFn: getTasks });

export function taskQueryOptions(taskId: string) {
  return queryOptions({ queryKey: ["tasks", taskId], queryFn: () => getTask(taskId) });
}
```

(Watch the names: `tasks` for the list, `task` for one.) Both keys start with `"tasks"` on purpose. Query keys match by their beginning, so `invalidateQueries({ queryKey: ["tasks"] })` refreshes the list **and** every single task. You'll rely on that in milestones 5 and 6.

On the board page, call `useQuery(tasksQueryOptions)`, handle `isPending` and `isError` first, then split the data during render:

```tsx
<div className="board">
  {STATUSES.map((status) => (
    <Column key={status} status={status} tasks={tasks.filter((task) => task.status === status)} />
  ))}
</div>
```

**One query, split by status, never stored.** Not three queries: that's three requests, and a moved task would have to leave one cache and join another. Not three `useState` arrays: that's a copy of server data. Just one list, and three `filter` calls during render. It's "don't store what you can calculate" from [chapter 08](../08-state/notes.md), again.

For the error state, show the `ApiError`'s friendly message and a **Try again** button that calls `refetch()`. If the error isn't an `ApiError`, it's probably Zod saying the data is wrong. Show a general "The server sent something this app doesn't understand", and `console.error` the details for yourself.

Build `Column` (a `<section>` with a heading like **To do (4)**, and a `<ul>` of cards) and `TaskCard` (the title, a priority badge and the due date). A lookup object keeps the column names in one place:

```ts
export const STATUS_LABELS = { todo: "To do", doing: "Doing", done: "Done" } satisfies Record<TaskStatus, string>;
```

`satisfies` ([chapter 25](../25-typescript-patterns/notes.md)) makes TypeScript complain if you ever add a status and forget its label. Before you build the card, read the starter README's notes on its structure (a link and buttons, side by side) and on formatting dates.

**Check it:** three columns with 4, 3 and 2 tasks. The Query devtools show **one** query, `["tasks"]`. Now stop json-server (Ctrl+C in terminal 2) and refresh the page. "Loading…" stays for several seconds before your error appears, because TanStack Query retries three times first. Start the API again and click **Try again**.

## Milestone 4: Filters in the URL

**Goal:** a search box and a priority filter that live in the URL.

In the [bookstore](../29-project-online-bookstore/notes.md), filters came from `useSearchParams` as plain strings. TanStack Router checks them with a Zod schema instead ([chapter 36](../36-tanstack-router/notes.md)). In `src/routes/index.tsx`:

```tsx
const BoardSearchSchema = z.object({
  q: z.string().default(""),
  priority: z.enum(["all", "low", "medium", "high"]).default("all"),
});

export const Route = createFileRoute("/")({
  validateSearch: BoardSearchSchema,
  component: BoardPage,
});
```

Now `Route.useSearch()` gives you `{ q: string; priority: "all" | "low" | "medium" | "high" }`. Not `string | null`: the real type. Filter during render, exactly as the bookstore's milestone 2 did (match `q` against the title and description, and `priority` unless it's `"all"`). Then split `visible`, not `tasks`, into the columns.

To change a filter, navigate to the same page with new search params:

```tsx
const navigate = useNavigate({ from: Route.fullPath });

function handleSearchChange(value: string) {
  navigate({ search: (prev) => ({ ...prev, q: value }), replace: true });
}
```

`replace: true` stops every keystroke from adding a history entry, the same decision you made in the bookstore. Make it again for the priority dropdown, and write down why.

Keep `FilterBar` a plain component that takes `q`, `priority` and two `on...Change` props. The route reads and writes the URL; the component just shows the controls. One snag: a `<select>`'s value is a plain `string`. Instead of reaching for `as`, check it with a Zod enum. The DOM is a boundary too.

Then the small things that make a board feel finished: **"Showing 4 of 9 tasks"** under the filters (derived, of course); a **"No tasks here"** message in any empty column, instead of a blank gap; and filters that **stay visible** when nothing matches, so people can undo what they did.

**Check it:** choose **Medium**. You should see "Showing 4 of 9 tasks". Copy the URL into a new tab: same board, same filter. Then edit the URL by hand to `?priority=urgent`. The schema rejects it, and the router shows an error. Now add `.catch("all")` after `.default("all")` and try again. Which would you rather give someone who follows an old, broken link?

## Milestone 5: Creating tasks

**Goal:** one form component, and a page that uses it to add tasks.

Make `src/components/TaskForm.tsx`. The most important decision in this milestone: **the form doesn't know about the API.** It checks what was typed, then hands the values to whoever is using it:

```tsx
type TaskFormProps = {
  defaultValues: NewTask;
  submitLabel: string;
  onSubmit: (values: NewTask) => Promise<unknown>;
  disableUntilChanged?: boolean;
};
```

That's what makes it reusable (milestone 6 uses it for editing) and testable (milestone 9 renders it with a fake `onSubmit`: no server, no router). So there's no `useMutation` inside it, and no `Link` either. Put the Cancel link in the page, next to the form.

Inside, `useForm<NewTask>` takes `resolver: zodResolver(NewTaskSchema)` and the `defaultValues`. The submit handler is where server errors get caught:

```tsx
async function submit(values: NewTask) {
  try {
    await onSubmit(values);
    reset(values);   // what was just saved becomes the new "unchanged"
  } catch (error) {
    setError("root", {
      message: error instanceof Error ? error.message : "Couldn't save the task.",
    });
  }
}
```

There are five fields: title (`<input>`), description (`<textarea>`), status and priority (two `<select>`s), and due date (`<input type="date">`). Each gets a real `<label>`, plus `aria-invalid` and `aria-describedby` pointing at its error message, as in [chapter 33](../33-react-hook-form/notes.md). Show `errors.root?.message` above the buttons in a `<p role="alert">`.

The date needs converting. An empty date box gives you `""`, but the schema wants `null`. `setValueAs` converts it on the way in, the way `valueAsNumber` did for numbers:

```tsx
{...register("dueDate", { setValueAs: (value: string) => (value === "" ? null : value) })}
```

The submit button is `disabled={isSubmitting || (disableUntilChanged && !isDirty)}`, and says "Saving…" while `isSubmitting` is true.

Now the page, `src/routes/tasks/new.tsx`. It owns the mutation, and passes it to the form:

```tsx
const createMutation = useMutation({
  mutationFn: createTask,
  onSuccess: async () => {
    await queryClient.invalidateQueries({ queryKey: ["tasks"] });
    await navigate({ to: "/" });
  },
});

<TaskForm defaultValues={emptyTask} submitLabel="Create task" onSubmit={(values) => createMutation.mutateAsync(values)} />
```

`emptyTask` is a blank `NewTask` (empty title and description, `"todo"`, `"medium"`, and a `null` due date). Keep it in `schemas.ts`, so the page and the tests can share it.

`mutateAsync` returns a promise, so the form's `isSubmitting` stays true until the server answers. That's your "Saving…" state for free, with no need to check `createMutation.isPending` as well. One source of truth.

**Check it:** create a task with the status **Doing**. You land on the board, and it's in the Doing column, with no page refresh. Click **Create task** with an empty title: the message appears, and the Network tab shows no request, because the check happened first. Stop json-server and submit a valid task: your "Can't reach the server" message appears, and everything you typed is still there. Finally, change `register("title")` to `register("titel")` and read the type error. [Chapter 09](../09-forms/notes.md) said TypeScript couldn't catch that. Now it can.

## Milestone 6: The task page: view, edit, delete

**Goal:** every task at its own URL, loaded before the page appears, and edited with the same form.

The task page's loader needs the `QueryClient`, but loaders run outside React, so they can't call hooks. **Router context** passes it in ([chapter 36](../36-tanstack-router/notes.md)). In `__root.tsx`, swap `createRootRoute` for this:

```tsx
type RouterContext = { queryClient: QueryClient };

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: NotFoundPage,
});
```

(Yes, two sets of brackets: the first call takes the type, the second takes the options.) Then hand it over in `main.tsx`: `createRouter({ routeTree, context: { queryClient } })`. Now the loader, in `src/routes/tasks/$taskId.tsx`:

```tsx
export const Route = createFileRoute("/tasks/$taskId")({
  loader: async ({ context, params }) => {
    try {
      await context.queryClient.ensureQueryData(taskQueryOptions(params.taskId));
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        throw notFound();
      }
      throw error;
    }
  },
  notFoundComponent: () => <p className="status-message">We couldn't find that task.</p>,
  component: TaskPage,
});
```

`ensureQueryData` means "use the cached task if there is one, and fetch it if not". The page only renders once the task is there, so inside `TaskPage`, `useSuspenseQuery(taskQueryOptions(taskId))` gives you `data` that's never `undefined`. And milestone 2's `status` pays off here: a 404 becomes a proper not-found page, while "server down" stays an error.

Show the task's details (status, priority, due date, when it was created), then the same `TaskForm`, this time for editing: `submitLabel="Save changes"`, `disableUntilChanged`, and `defaultValues={NewTaskSchema.parse(task)}`. That last one is a neat trick. Zod objects drop keys they don't know, so it turns a `Task` into a `NewTask` by removing `id` and `createdAt`.

The update must refresh **both** caches, the board's list and this task:

```tsx
const updateMutation = useMutation({
  mutationFn: (changes: NewTask) => updateTask(taskId, changes),
  onSuccess: (updated) => {
    queryClient.setQueryData(taskQueryOptions(taskId).queryKey, updated);
    return queryClient.invalidateQueries({ queryKey: ["tasks"] });
  },
});
```

**Delete, with a confirm step.** "Is the confirmation showing?" is local state: a plain `useState(false)`. The first click on **Delete task** shows "Delete this task for good?" with **Yes, delete** and **Cancel**. Only **Yes, delete** runs the mutation. When it succeeds, go to `/` first, *then* tidy the cache: `removeQueries` for this task's key, and `invalidateQueries` for the list. If you remove the task from the cache while its page is still showing, the page tries to fetch it again and gets a 404.

**Check it:** open a task from the board, then refresh. It appears straight away, with no loading flash. `/tasks/999` shows your not-found message. Edit a title: **Save changes** stays disabled until you change something, and goes back to disabled after saving. Back on the board, the new title is there. Delete a task: it's gone from the board, and pressing Back to its old URL shows not found.

## Milestone 7: Moving tasks, optimistically

**Goal:** moves that feel instant, and undo themselves if they fail.

Each card gets a button for each neighbouring column. Two lookup objects say where a task can go:

```ts
const PREVIOUS: Record<TaskStatus, TaskStatus | null> = { todo: null, doing: "todo", done: "doing" };
const NEXT: Record<TaskStatus, TaskStatus | null> = { todo: "doing", doing: "done", done: null };
```

The buttons are real `<button>`s, siblings of the card's link. The visible text is short, and a visually hidden part gives each one a full name. A screen reader hears "Move Photograph the autumn menu to Doing", not five identical "Doing" buttons:

```tsx
<button className="btn btn-secondary btn-small move-forward" onClick={() => onMove(task.id, next)}>
  <span className="visually-hidden">Move {task.title} to </span>
  {STATUS_LABELS[next]} <span aria-hidden="true">→</span>
</button>
```

Without help, a click waits for the server before the card moves. It's only a fraction of a second, but it feels sluggish, and the move will almost always work. So move the card **first**, and put it back if the server says no. That's an **optimistic update** ([chapter 31](../31-tanstack-query/notes.md)). Add `useMoveTask` to `src/api/queries.ts`:

```ts
export function useMoveTask() {
  const queryClient = useQueryClient();
  const { queryKey } = tasksQueryOptions;

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) => updateTask(id, { status }),

    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey });        // 1. stop a refetch overwriting us
      const previous = queryClient.getQueryData(queryKey);   // 2. remember how it was
      queryClient.setQueryData(queryKey, (old) =>            // 3. move the card now
        old?.map((task) => (task.id === id ? { ...task, status } : task)),
      );
      return { previous };
    },
    onError: (_error, _variables, snapshot) => {
      queryClient.setQueryData(queryKey, snapshot?.previous);   // 4. put it back
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),   // 5. ask the server
  });
}
```

Step 5 runs whether the move worked or not. It's the safety net: whatever you guessed, the server's answer wins in the end. And because `queryKey` came from `tasksQueryOptions`, `getQueryData` and `setQueryData` already know the data is `Task[]`.

**Call it in the board, not in the card.** This one is subtle. When a task moves, React removes its card from the old column and creates a brand-new card in the new one, because a component's state belongs to its place in the tree ([chapter 12](../12-how-rendering-works/notes.md)). If the card owned the mutation, its error would vanish with the old card. So the board page calls `useMoveTask()` once, passes an `onMove(id, status)` prop down through `Column` to each `TaskCard`, and shows `moveTask.error.message` in a `<p role="alert">` above the columns when `moveTask.isError`.

**Check it:** moves feel instant. Throttle the Network tab to Slow 3G and move a card: it moves at once, and the PATCH finishes later. Now stop json-server and move a card. It jumps to the new column, jumps back, and your message appears. (Without throttling, this can happen so fast you barely see the jump.) Start the API again, move a card, and refresh: it stayed moved.

An honest note: if you click lots of moves very fast while the server is failing, the rollbacks can trip over each other. The refetch in `onSettled` puts everything right in the end, and that's enough for a board this size.

## Milestone 8: Preferences with Zustand

**Goal:** a light or dark theme and compact cards, remembered after a refresh.

Why Zustand? Run the four-homes test. The theme isn't on the server, so it's not TanStack Query. Nobody sends their theme in a link, so it's not the URL. And components far apart need it: the header's toggles and every card. That's shared client state. Make `src/stores/preferences.ts`, with `theme` (`"light" | "dark"`), `compact` (a boolean), and an action to toggle each:

```ts
export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      theme: "light",
      compact: false,
      toggleTheme: () => set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
      toggleCompact: () => set((state) => ({ compact: !state.compact })),
    }),
    { name: "taskboard-preferences" },
  ),
);
```

`persist` saves the store in `localStorage` under that name, and loads it again on startup ([chapter 34](../34-zustand/notes.md)). You write no saving code at all, just like `useLocalStorage` in [chapter 20](../20-custom-hooks/notes.md).

The stylesheet switches colours when `<html>` has `data-theme="dark"`. Changing `<html>` is a job outside React, so it's an effect ([chapter 17](../17-effects/notes.md)): `document.documentElement.dataset.theme = theme`, re-run when `theme` changes. Put the effect in a small `PreferenceToggles` component in the header, next to the two toggle buttons. Keeping it there, not in the root layout, means only the toggles re-render when a preference changes. It's [chapter 27](../27-performance/notes.md)'s "move state down", for a store. Give each toggle `aria-pressed`, so a screen reader hears "pressed" or "not pressed".

Then each `TaskCard` reads just what it needs, and adds `compact` to its class name:

```tsx
const compact = usePreferences((state) => state.compact);
```

The selector matters. A card that selected the whole store would also re-render every time the theme changed. (You may see the light theme flash for a moment on refresh, because effects run just after the first paint. A proper fix needs a tiny script in `index.html`. It isn't worth it here.)

**Check it:** switch to dark and refresh: still dark. Find the saved JSON in DevTools → Application → Local Storage. Then check your selectors: turn on "Highlight updates when components render" in React DevTools (or put a `console.log` in `TaskCard`), and toggle the theme. The cards shouldn't re-render. Toggle compact: now they do.

## Milestone 9: Tests

**Goal:** tests for the three things most likely to break: the data rules, the store and the form.

**The schemas** are already tested (milestone 2).

**The preferences store** is plain TypeScript, so test it by calling it directly, with no rendering. Reset it before every test, or one test's dark theme leaks into the next ([chapter 34](../34-zustand/notes.md)):

```ts
beforeEach(() => {
  localStorage.clear();
  usePreferences.setState(usePreferences.getInitialState());
});
```

Then three small tests: it starts light and not compact; `usePreferences.getState().toggleTheme()` switches to dark and back; `toggleCompact()` flips `compact`.

**`TaskForm`, on its own.** This is where milestone 5's decision pays off. The form doesn't use the API or the router, so the test needs no providers at all. Just pass `vi.fn()` as `onSubmit` ([chapter 28](../28-testing/notes.md)):

```tsx
test("sends what the user typed", async () => {
  const user = userEvent.setup();
  const handleSubmit = vi.fn();
  render(<TaskForm defaultValues={emptyTask} submitLabel="Create task" onSubmit={handleSubmit} />);

  await user.type(screen.getByLabelText("Title"), "Book the venue");
  await user.selectOptions(screen.getByLabelText("Priority"), "high");
  await user.click(screen.getByRole("button", { name: "Create task" }));

  await waitFor(() =>
    expect(handleSubmit).toHaveBeenCalledWith({
      title: "Book the venue", description: "", status: "todo", priority: "high", dueDate: null,
    }),
  );
});
```

`waitFor` (from `@testing-library/react`) keeps retrying the check for a moment. You need it because React Hook Form checks the form asynchronously, so `onSubmit` runs a moment after the click. Write two more:

1. **An empty title shows the error, and never calls `onSubmit`.** Click **Create task** straight away, `await screen.findByText("Give the task a title")`, then `expect(handleSubmit).not.toHaveBeenCalled()`.
2. **A server error shows in the form.** Make `onSubmit` fail with `vi.fn().mockRejectedValue(new Error("Can't reach the server."))`, submit a valid task, and find the message with `findByRole("alert")`.

Use `getByRole` and `getByLabelText` throughout. If one can't find a field, the field is probably missing its label. Fix the form, not the test.

**An honest note.** You haven't tested whole pages, like "the board shows 9 tasks". That needs the router, a `QueryClient` and a fake API, all set up inside the test. It's very doable, but it's a big step up in setup, so it's a stretch goal.

**Check it:** `npm test` is green, with about eleven tests. Rename a few variables inside `TaskForm`: every test still passes, because the tests check what the user sees, not how you wrote it.

## Now compare

Put the to-do app, the bookstore and the task board side by side:

| | To-do (ch10) | Bookstore (ch29) | Task board (ch37) |
|---|---|---|---|
| Where the data lives | `localStorage` | A file in `src/` | A server (your practice API) |
| Getting it | Read once at startup | Imported | TanStack Query: cached, retried, refreshed |
| Saving changes | An `updateTasks` helper | Reducer actions, in memory only | Mutations; moves are optimistic |
| Shared state | None | Context + reducer | Zustand, for two settings |
| Forms | `useState` per field, checked by hand | Checkout, checked by hand | React Hook Form + one Zod schema, for create *and* edit |
| Pages | One | React Router; `useParams` gives `string \| undefined` | TanStack Router; params and search are typed |
| Bad data | `as Task[]`, and hope | Can't happen: it's your own file | Zod rejects it, with a clear message |
| Checking it works | Clicking | Tests | Tests, plus TypeScript catching broken links |
| Who wrote the plumbing | You, all of it | You, nearly all of it | The libraries. You wrote the decisions |

**The libraries didn't replace the fundamentals.** Look at what each one actually replaced:

- TanStack Query: the loading, error and data state and the `ignore` flags you wrote by hand in [chapter 18](../18-fetching-data/notes.md) and the Recipe Finder.
- Zod: `as Task[]`, which was only a promise.
- React Hook Form: a `useState` per field, and the hand-written checks from [chapter 09](../09-forms/notes.md).
- Zustand: a context and a provider, like the bookstore's cart.
- TanStack Router: `string | undefined` params and `searchParams.get()` strings.

Every one of them replaced **boilerplate you had already written yourself**. That's why none of them felt like magic. And the fundamentals are still everywhere. The board filters during render: that's [chapter 08](../08-state/notes.md). The optimistic update copies the list with `map` and a spread: [chapter 11](../11-updating-objects-and-arrays/notes.md). A moved card loses its state: [chapter 12](../12-how-rendering-works/notes.md). You know what's underneath, so when a library surprises you, you can work out why.

**A question to think about: if this app were half the size, which library would you remove first?** Our answer is Zustand. Two settings could live in a context, or in `useLocalStorage` from chapter 20, with about the same amount of code. Next might be the router, if the app had only one page. TanStack Query and Zod would be the last to go: as long as there's a server, there's loading, errors, caching, and data you can't trust. Do you agree? Being able to argue for *removing* a library is just as useful as knowing how to add one.

## Common mistakes

**1. Copying server data into Zustand or `useState`**

```tsx
const { data } = useQuery(tasksQueryOptions);
const [tasks, setTasks] = useState(data ?? []);   // ❌ a second copy that never updates
```

The copy goes stale the moment TanStack Query refetches. Use `data` directly, wherever you need it.

**2. One query per column**

A `["tasks", "todo"]` query, then `"doing"`, then `"done"`: three requests, three caches, and a moved task has to leave one and join another. Fetch once, and split with `filter` during render.

**3. Filters in Zustand instead of the URL**

It works, and it quietly takes away sharing, bookmarking and refreshing a filtered board. If someone would send it in a link, it goes in the URL.

**4. Forgetting the single-task cache after an edit**

Naming the keys `["tasks"]` and `["task", id]` looks harmless. But now `invalidateQueries({ queryKey: ["tasks"] })` misses the task page, and it keeps showing the old title. Start every task key with `"tasks"`, so one invalidation covers them all.

**5. Parsing in components instead of in `tasks.ts`**

If every component that fetches has to remember `TaskListSchema.parse(...)`, one of them will forget. Parse once, in the function that made the request. Everything outside `src/api/` can then trust the data.

**6. A `TaskForm` that calls the API itself**

Once it contains `useMutation` or a `Link`, you can't reuse it for editing without `if (isEditing)` branches, and you can't test it without a server and a router. Take `onSubmit` as a prop, and let the page decide what submitting means.

**7. An optimistic update with no rollback**

A `setQueryData` in `onMutate` with no `onError`: when the server says no, the board keeps showing a move that never happened. Take a snapshot in `onMutate`, restore it in `onError`, and refetch in `onSettled`.

**8. Drag and drop as the only way to move a task**

Someone using a keyboard or a screen reader can't move anything. Buttons first. Drag and drop is a nice extra on top.

## Quick recap

- Sort state into **four homes** before you write it: local (React Hook Form, `useState`), URL (the router), shared client (Zustand) and server (TanStack Query).
- **Server data belongs to TanStack Query.** Never copy it into Zustand or `useState`.
- Keep the **API layer in one folder**: one Axios instance, Zod schemas as the single source of truth, and every response parsed where it's fetched.
- **Fetch once, derive the rest.** Columns, filtered lists and counts are all calculated during render.
- **Filters and ids live in the URL**, checked by a schema, so they're typed and shareable.
- **One form for create and edit**, which only calls `onSubmit`. That's what makes it reusable and easy to test.
- **Optimistic updates** make moves feel instant: snapshot, change, roll back on error, refetch when settled.
- Each library replaced **code you had already written by hand**. Knowing what's underneath lets you choose, or remove, a library with confidence.

---

**Next:** try the [stretch goals](exercises.md). That's the end of Level 4. [Level 5](../38-accessibility/notes.md) starts with accessibility: making sure everyone can use what you build, including people who never touch a mouse. Later, [chapter 40](../40-deploying/notes.md) covers putting apps online, including what to do about the practice API, because json-server only runs on your own computer.
