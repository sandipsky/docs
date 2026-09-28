# 28 Testing

## What is it?

Automated checks that your components actually work, written as code that runs your components and clicks around in them:

```tsx
test("shows a greeting with the name", () => {
  render(<Greeting name="Maya" />);
  expect(screen.getByRole("heading")).toHaveTextContent("Hello, Maya!");
});
```

Two tools do the work. **Vitest** runs the tests (the same family as Vite, so it needs almost no setup). **React Testing Library** renders components and finds things on the page the way a user would.

## Why does it matter?

You've been testing all along — by clicking. Change something, alt-tab to the browser, click through the flow, check nothing broke. That works fine for a small app, and it stops working for a specific reason: **the amount of clicking grows with the size of the app, and you only have so much patience.**

By the time an app has a dozen features, checking them all by hand after every change takes ten minutes, so you stop doing it. You check the thing you changed, assume the rest is fine, and find out three weeks later that it wasn't.

Automated tests make that check cost nothing. Save the file, and a hundred interactions run in two seconds.

What that actually buys you, in order of how much it matters:

- **Changing code without fear.** This is the big one. Tests let you refactor, rename, and restructure aggressively, because the moment you break something, you know. Without them, working code gradually becomes code nobody dares touch.
- **Bugs caught at the moment you write them**, when the context is still in your head, rather than days later.
- **A description of what the component is supposed to do**, that can't go out of date, because it fails when it's wrong.

## Real-world example

Think about a **smoke test in a factory** versus **inspecting the assembly line**.

| Inspecting how it's built | Testing that it works |
|---|---|
| "Is bolt 47 torqued correctly?" | "Does the door open and close?" |
| Breaks when the design changes, even if the product is fine | Keeps passing through any redesign that still opens |
| Checks `useState` was called, or props were passed | Checks the user sees the right thing after clicking |
| Has to be rewritten constantly | Rewritten only when behaviour genuinely changes |
| **Testing implementation** | **Testing behaviour** |

The whole philosophy of React Testing Library is in that table: test the door, not the bolts. A test that knows which hook you used will break the moment you switch from `useState` to `useReducer` — even though nothing the user experiences has changed at all. That's a test making your life worse.

## How it works

### Setting up

In your project:

```
npm install -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
```

What each one does:

| Package | Job |
|---|---|
| `vitest` | Runs the tests |
| `@testing-library/react` | Renders components, finds elements |
| `@testing-library/user-event` | Simulates realistic clicking and typing |
| `@testing-library/jest-dom` | Extra assertions like `toBeInTheDocument()` |
| `jsdom` | A fake browser so DOM code can run in Node |

Add to `vite.config.ts`:

```ts
/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test-setup.ts",
  },
});
```

Create `src/test-setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

And add a script to `package.json`:

```json
"scripts": {
  "test": "vitest"
}
```

`npm test` now runs your tests and watches for changes. `globals: true` means `test` and `expect` are available without importing them, matching how most examples are written.

### Your first test

Put test files next to the component, named `Something.test.tsx`:

```tsx
// Greeting.tsx
type GreetingProps = { name: string };

export function Greeting({ name }: GreetingProps) {
  return <h1>Hello, {name}!</h1>;
}
```

```tsx
// Greeting.test.tsx
import { render, screen } from "@testing-library/react";
import { Greeting } from "./Greeting.tsx";

test("greets the person by name", () => {
  render(<Greeting name="Maya" />);

  expect(screen.getByRole("heading")).toHaveTextContent("Hello, Maya!");
});
```

Three steps, and nearly every test has them:

1. **Arrange** — `render` the component with the props you want to test.
2. **Act** — click, type, or do nothing if you're only checking what's shown.
3. **Assert** — `expect(...)` something to be true.

### Finding things: queries

`screen` is how you find elements. There are several ways, and **which one you pick matters** — it's the difference between a test that describes behaviour and one that describes markup.

Use them in this order of preference:

```tsx
screen.getByRole("button", { name: "Add task" });   // ① best
screen.getByLabelText("Email");                      // ② form fields
screen.getByText("No tasks yet");                    // ③ plain text
screen.getByTestId("recipe-card");                   // ④ last resort
```

**`getByRole` first, nearly always.** It finds elements the way assistive technology does — by what they *are* (`button`, `heading`, `textbox`, `checkbox`, `link`) and what they're *called*. A test written this way checks accessibility for free: if `getByRole("button", { name: "Delete" })` can't find your button, a screen reader user probably can't either.

This is a genuinely useful feedback loop. Tests that are hard to write with `getByRole` are usually pointing at a real accessibility problem — a `<div onClick>` instead of a button, an input with no label, an icon button with no `aria-label`. All things [chapter 38](../38-accessibility/notes.md) covers, surfacing here first.

**`getByTestId` last**, and only when nothing else works. It requires adding `data-testid` attributes that exist purely for tests and mean nothing to users.

### `getBy`, `queryBy`, `findBy`

Three prefixes, three different jobs, and mixing them up is the most common beginner mistake:

| Prefix | If found | If not found | Use for |
|---|---|---|---|
| `getBy…` | returns it | **throws** | things that should be there now |
| `queryBy…` | returns it | returns `null` | asserting something is **absent** |
| `findBy…` | returns a promise | rejects after a timeout | things that appear **later** (async) |

```tsx
expect(screen.getByRole("button")).toBeInTheDocument();          // must exist
expect(screen.queryByText("Error")).not.toBeInTheDocument();     // must NOT exist
expect(await screen.findByText("Loaded!")).toBeInTheDocument();  // will exist soon
```

Using `getBy` to check something is absent doesn't work — it throws before your assertion runs, and the error is about a missing element rather than a failing expectation. That's what `queryBy` is for.

Each also has an `…AllBy` variant returning an array: `getAllByRole("listitem")`.

### Simulating a user

Use `user-event`, not `fireEvent`. It simulates what a real user does — a click involves hovering, pressing, and releasing; typing fires a keydown, keypress, input and keyup per character — which catches bugs `fireEvent` walks straight past.

```tsx
import userEvent from "@testing-library/user-event";

test("adds a task", async () => {
  const user = userEvent.setup();
  render(<TaskApp />);

  await user.type(screen.getByLabelText("New task"), "Buy milk");
  await user.click(screen.getByRole("button", { name: "Add" }));

  expect(screen.getByText("Buy milk")).toBeInTheDocument();
});
```

**Every `user.*` call is async and must be awaited.** Forgetting the `await` is the single most common cause of a test that fails confusingly, because the assertion runs before the click has finished.

The common actions:

```tsx
await user.click(element);
await user.type(input, "text");
await user.clear(input);
await user.selectOptions(select, "value");
await user.keyboard("{Enter}");
await user.tab();
```

### Testing behaviour, not implementation

Here's the same component tested two ways.

**Bad — tests how it's built:**

```tsx
test("applies the is-open class", async () => {
  const user = userEvent.setup();
  const { container } = render(<Accordion title="Details">Hidden content</Accordion>);

  await user.click(screen.getByRole("button"));

  expect(container.querySelector(".accordion-panel")).toHaveClass("is-open");
});
```

That test knows about a CSS class name. Rename the class, or switch from a class to conditional rendering, and it fails — even though the component works perfectly and nothing a user sees has changed.

**Good — tests what a user experiences:**

```tsx
test("shows the panel when the toggle is clicked", async () => {
  const user = userEvent.setup();
  render(<Accordion title="Details">Hidden content</Accordion>);

  expect(screen.queryByText("Hidden content")).not.toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Details" }));

  expect(screen.getByText("Hidden content")).toBeInTheDocument();
});
```

The second test passes whether the component uses `useState`, `useReducer`, or context. Rewrite the internals completely and it keeps passing — which is exactly what you want, because a passing test after a refactor is what tells you the refactor was safe.

**A useful check:** if your test mentions a hook name, a state variable name, or a CSS class, it's probably testing implementation. Tests should read like a description of using the app.

### Testing components with props and callbacks

For a callback prop, use a **mock function** and check it was called correctly:

```tsx
import { vi } from "vitest";

test("calls onDelete with the task id", async () => {
  const user = userEvent.setup();
  const onDelete = vi.fn();

  render(<TaskRow task={{ id: "1", text: "Buy milk", done: false }} onDelete={onDelete} />);

  await user.click(screen.getByRole("button", { name: /delete/i }));

  expect(onDelete).toHaveBeenCalledWith("1");
  expect(onDelete).toHaveBeenCalledTimes(1);
});
```

`vi.fn()` creates a function that records how it was called. This is how you test a component in isolation — `TaskRow` doesn't need a real parent, just something that records what it asked for.

Note `{ name: /delete/i }` — a regular expression ([JavaScript chapter 37](../../JavaScript/37-regular-expressions/notes.md)), matching case-insensitively. Handy when the accessible name is `Delete Buy milk` and you only care about part of it.

### Testing asynchronous things

For components that fetch, `findBy` waits for an element to appear:

```tsx
test("shows recipes after loading", async () => {
  render(<RecipeSearch query="chicken" />);

  expect(screen.getByText("Loading…")).toBeInTheDocument();

  expect(await screen.findByText("Chicken Parmesan")).toBeInTheDocument();
  expect(screen.queryByText("Loading…")).not.toBeInTheDocument();
});
```

`findByText` retries for a second or so before giving up, so you don't need arbitrary waits.

But a test shouldn't call a real API — it'd be slow, need a network, and fail when someone else's server has a bad day. **Mock it:**

```tsx
import { beforeEach, afterEach, vi } from "vitest";

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn(async () => ({
    ok: true,
    json: async () => ({ meals: [{ idMeal: "1", strMeal: "Chicken Parmesan", strMealThumb: "", strCategory: "Chicken" }] }),
  })));
});

afterEach(() => {
  vi.unstubAllGlobals();
});
```

For anything beyond a couple of endpoints, **MSW** (Mock Service Worker) is the better tool — it intercepts requests at the network level, so your code calls `fetch` exactly as it normally would and you define fake responses once, reusable across every test. Worth knowing the name for when hand-stubbing `fetch` starts to hurt.

### Testing components that need a provider

A component using context ([chapter 22](../22-context/notes.md)) or routing ([chapter 24](../24-react-router/notes.md)) needs its providers in the test too:

```tsx
function renderWithProviders(ui: ReactNode) {
  return render(
    <MemoryRouter>
      <ThemeProvider>{ui}</ThemeProvider>
    </MemoryRouter>
  );
}

test("shows the cart count", () => {
  renderWithProviders(<CartBadge />);
  expect(screen.getByText("0")).toBeInTheDocument();
});
```

`MemoryRouter` is React Router's router for tests — it keeps the URL in memory rather than touching the real address bar, and you can start it anywhere with `initialEntries={["/books/42"]}`.

Writing one `renderWithProviders` helper and using it everywhere saves a lot of repetition.

### What to test, and what not to

You can't test everything, and trying makes tests a burden rather than a help. In rough priority order:

**Worth testing:**

- Anything with real logic: validation, calculations, filtering, reducers.
- User flows that matter: adding an item, submitting a form, the empty state.
- Bugs you've fixed — a test for each stops it coming back.
- Edge cases: empty lists, missing data, a failed request.

**Usually not worth testing:**

- That a component renders some static text.
- Third-party libraries — they have their own tests.
- Exact styling. (`toHaveClass` is brittle; is the class the *behaviour*?)
- Implementation details, per the whole section above.

**A reducer is the single highest-value thing to test in a React app.** It's a pure function — state in, state out — so it needs no rendering, no mocking, and no DOM at all. If you wrote one in [chapter 23](../23-use-reducer/notes.md), that's where to start:

```tsx
test("deleting the task being edited also ends the edit", () => {
  const before: TaskState = {
    tasks: [{ id: "1", text: "Buy milk", done: false }],
    filter: "all",
    editingId: "1",
  };

  const after = taskReducer(before, { type: "deleted", id: "1" });

  expect(after.tasks).toHaveLength(0);
  expect(after.editingId).toBeNull();
});
```

Three lines, no setup, and it pins down a rule that would take real clicking to verify by hand.

### Testing a custom hook

A custom hook ([chapter 20](../20-custom-hooks/notes.md)) can't be called outside a component, so testing one directly needs `renderHook`:

```tsx
import { renderHook, act } from "@testing-library/react";

test("useToggle flips the value", () => {
  const { result } = renderHook(() => useToggle(false));

  expect(result.current[0]).toBe(false);

  act(() => {
    result.current[1]();   // call toggle
  });

  expect(result.current[0]).toBe(true);
});
```

`act` wraps anything that causes a state update, so React finishes re-rendering before you assert. (You rarely need it in component tests — `user-event` handles it for you.)

Use this for genuinely reusable hooks with real logic — `useLocalStorage`, `useDebounce`. For a hook used by exactly one component, testing that component's behaviour usually covers it better, and survives refactoring.

### Coverage is a hint, not a target

`vitest --coverage` reports how much of your code the tests ran. It's useful for spotting whole files nobody's tested. It is **not** a score to maximise — 100% coverage with tests that assert nothing meaningful is worse than 40% coverage of the parts that actually matter. Use it to find gaps, not to set targets.

## Common mistakes

**1. Forgetting `await` on a `user` action**

```tsx
user.click(button);                                    // ❌ no await
expect(screen.getByText("Saved")).toBeInTheDocument(); // runs too early
```

Every `user.*` call is a promise. This produces confusing failures where the element "isn't there" but clearly is.

**2. `getBy` when checking something is absent**

```tsx
expect(screen.getByText("Error")).not.toBeInTheDocument();   // ❌ throws before asserting
expect(screen.queryByText("Error")).not.toBeInTheDocument(); // ✅
```

**3. Testing implementation**

If a test mentions a state variable, a hook, or a class name, it'll break on a refactor that changed nothing users can see. Test what's on screen.

**4. `getByTestId` as the default**

It works, and it skips the accessibility feedback that makes `getByRole` valuable. If `getByRole` can't find your button, that's information worth having, not an obstacle.

**5. Using `fireEvent` instead of `user-event`**

`fireEvent.click` dispatches one bare event. Real clicks involve more, and `user-event` catches bugs the bare version misses — like a button that's actually disabled.

**6. Calling real APIs in tests**

Slow, flaky, and dependent on someone else's uptime. Stub `fetch`, or use MSW.

**7. Chasing a coverage number**

High coverage with weak assertions is a false sense of safety. Test what matters.

**8. Forgetting providers**

```
useTheme must be used inside a ThemeProvider
```

A component needs its context and router in tests too. Write a `renderWithProviders` helper once.

## Quick recap

- **Vitest** runs tests; **React Testing Library** renders components and finds elements the way a user would. Setup is a few packages and a `test` block in `vite.config.ts`.
- Every test is **arrange** (`render`), **act** (`user.click`), **assert** (`expect`).
- Prefer **`getByRole`** with an accessible name. It matches how assistive technology finds things, so your tests check accessibility for free.
- **`getBy`** throws if missing, **`queryBy`** returns `null` (use it to assert absence), **`findBy`** waits for something async.
- Use **`user-event`**, and `await` every action.
- **Test behaviour, not implementation.** A good test survives a rewrite of the component's internals; if it mentions a hook or a state variable, it's testing the wrong thing.
- Use `vi.fn()` for callback props, and stub `fetch` (or use MSW) rather than calling real APIs.
- **Reducers are the highest-value, lowest-effort thing to test** — pure functions, no rendering needed.
- Coverage finds untested files. It isn't a score.

---

**Next:** try the [exercises](exercises.md), then build the [29 Project: Online Bookstore](../29-project-online-bookstore/notes.md), which brings this whole level together.
