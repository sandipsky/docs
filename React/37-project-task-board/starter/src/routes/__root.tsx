/*
  Task Board
  ==========
  This is the root route: the layout every page shares. Your code goes
  here, in routes/index.tsx, and in the files you'll create alongside
  them. Work one milestone at a time, and check the app in the browser
  after each one. The full guide is in this chapter's notes.md.

  Milestone 1: Setup and routes
               (main.tsx from starter/README.md; routes for /tasks/new and
                /tasks/$taskId; a header with a "New task" link and a
                theme toggle placeholder; a notFoundComponent)
  Milestone 2: src/api/ — client.ts (Axios + an interceptor making ApiError),
               schemas.ts (Zod), tasks.ts (five functions, every response
               parsed). TEST THE SCHEMAS BEFORE ANY UI EXISTS
  Milestone 3: QueryClientProvider + devtools; tasksQueryOptions; three
               columns from ONE ["tasks"] query, split during render
  Milestone 4: Filters in the URL — validateSearch with a Zod schema,
               Route.useSearch(), "Showing 4 of 9 tasks"
  Milestone 5: TaskForm (React Hook Form + zodResolver) and /tasks/new,
               with a mutation that invalidates ["tasks"]
  Milestone 6: /tasks/$taskId — router context, a loader with
               ensureQueryData and notFound(), editing with the SAME
               TaskForm, and delete with a confirm step
  Milestone 7: useMoveTask — optimistic moves with onMutate / onError /
               onSettled, called once in the board (not in each card)
  Milestone 8: A Zustand store for theme + compact cards, persisted
  Milestone 9: Tests for the schemas, the store, and TaskForm

  Four habits that carry the whole project:
    - Sort state into local / URL / shared client / server BEFORE you write it.
    - Server data lives in TanStack Query. Never copy it into useState or Zustand.
    - Only src/api/ talks to the server, and it parses everything it gets back.
    - Anything you can calculate (columns, counts, filtered lists) is
      derived during render, never stored.

  Only route files belong in src/routes/. Components, stores and tests go
  somewhere else (the file map is in starter/README.md, along with the
  class names the stylesheet expects).
*/

import { Link, Outlet, createRootRoute } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootLayout,
  // Milestone 1: add a notFoundComponent here
  // Milestone 6: swap createRootRoute for createRootRouteWithContext
});

function RootLayout() {
  return (
    <div className="app">
      <header className="site-header">
        <Link to="/" className="app-name">
          📋 Task Board
        </Link>

        {/* Milestone 1: a <div className="header-actions"> with the
            "New task" link and a theme toggle placeholder */}

        {/* Milestone 8: swap the placeholder for your PreferenceToggles */}
      </header>

      <main className="page">
        <Outlet />
      </main>
    </div>
  );
}
