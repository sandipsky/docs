# 26 Error Boundaries and Suspense

## What is it?

Two features for the two things that go wrong around a component: it **crashed**, or it **isn't ready yet**.

```tsx
<ErrorBoundary fallback={<p>Something went wrong.</p>}>
  <Suspense fallback={<Spinner />}>
    <Dashboard />
  </Suspense>
</ErrorBoundary>
```

An **error boundary** catches a crash anywhere below it and shows something sensible instead of a blank page. **Suspense** shows a fallback while something below it is still loading.

Both work the same way conceptually: you wrap a part of your tree and say what to show when that part can't show itself.

## Why does it matter?

Try this in any app you've built: make a component throw.

```tsx
function RecipeCard({ recipe }: RecipeCardProps) {
  return <h3>{recipe.name.toUpperCase()}</h3>;   // recipe.name is undefined for one item
}
```

The whole page goes **blank**. Not that card — everything. The header, the nav, the search box you spent a chapter building: gone, replaced by nothing, with an error in the Console that your users will never see.

That's React working as designed, and the reasoning is sound: a component that threw mid-render has left React unable to know what the UI should look like, and showing a half-updated, possibly wrong interface is worse than showing none. A banking app displaying a stale balance is more dangerous than one showing an error.

But "blank page" is not an acceptable final answer. What you want is for the *broken part* to fail and everything else to carry on — one card showing "Couldn't load this recipe" while the other eleven work fine. That's an error boundary.

Suspense solves the mirror-image problem. You've been writing `if (isLoading) return <Spinner />` in every single data-fetching component since [chapter 18](../18-fetching-data/notes.md). Suspense lets a parent declare the loading UI **once**, for a whole section, and it's the foundation for code-splitting — not shipping your entire app's JavaScript to someone who only opened the home page.

## Real-world example

Think about **electrical circuits in a house**.

| Your house | React |
|---|---|
| One fuse for the whole house | No error boundary: any crash kills everything |
| A toaster shorts out, the whole house goes dark | One component throws, the page goes blank |
| Separate circuits per room | An error boundary around each section |
| The kitchen trips; the lights upstairs stay on | The broken widget shows a message; the rest works |
| A fuse you can reset | An error boundary with a "Try again" button |
| Where you put the fuses is a design decision | Where you put boundaries is a design decision |

Nobody wires a house with one fuse. The interesting question isn't *whether* to have boundaries, it's how finely to divide them — which is exactly the judgement call this chapter is about.

## How it works

### Error boundaries are class components

Here's the one genuinely awkward thing in this chapter: **there is no hook for this**. Error boundaries must be class components, because they rely on two lifecycle methods that have no hook equivalent.

This is the only place in modern React where you need a class. You don't need to learn class components properly ([JavaScript chapter 27](../../JavaScript/27-classes/notes.md) covers the syntax) — you need to be able to copy this one, and understand what it does:

```tsx
import { Component, type ReactNode, type ErrorInfo } from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Caught by boundary:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
```

The three parts:

- **`getDerivedStateFromError`** runs when a child throws. Whatever it returns becomes the new state — here, flipping `hasError` to `true`. It must be pure; it's only for deciding what to show.
- **`componentDidCatch`** runs afterwards and *is* allowed side effects. This is where you'd report the error to a logging service in a real app.
- **`render`** shows the fallback if something broke, and the children otherwise.

Use it like any other component:

```tsx
<ErrorBoundary fallback={<p>Couldn't load the recipes.</p>}>
  <RecipeGrid recipes={recipes} />
</ErrorBoundary>
```

Now a throw inside `RecipeGrid` shows that one message, and the header, nav and search box carry on working.

### What boundaries do and don't catch

This trips everyone up, so be precise. An error boundary catches errors thrown **while rendering** a component below it — during render, in a lifecycle method, or in a constructor.

It does **not** catch:

| Not caught | Why, and what to do instead |
|---|---|
| **Errors in event handlers** | The handler runs long after render. Use `try`/`catch` inside it. |
| **Errors in `setTimeout` or promises** | Same reason — outside React's render cycle. `try`/`catch`, or `.catch()`. |
| **Errors in the boundary itself** | It can't catch itself. That's why boundaries stay tiny. |
| **Errors during server rendering** | Different mechanism ([chapter 39](../39-nextjs-and-server-components/notes.md)). |

The event handler exclusion is the one that catches people out:

```tsx
<ErrorBoundary fallback={<p>Oops</p>}>
  <button onClick={() => { throw new Error("boom"); }}>Click</button>
</ErrorBoundary>
```

Clicking that does **not** show the fallback — the error just goes to the Console. Your fetching code from [chapter 18](../18-fetching-data/notes.md) already handles its own errors with `.catch()` and an `error` state, which is exactly right and is *not* something boundaries replace.

### Resetting a boundary

A boundary that's tripped stays tripped. Give people a way out:

```tsx
type ErrorBoundaryProps = {
  children: ReactNode;
  fallback: (reset: () => void) => ReactNode;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  reset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback(this.reset);
    }
    return this.props.children;
  }
}
```

```tsx
<ErrorBoundary
  fallback={(reset) => (
    <div>
      <p>Couldn't load the recipes.</p>
      <button onClick={reset}>Try again</button>
    </div>
  )}
>
  <RecipeGrid recipes={recipes} />
</ErrorBoundary>
```

That `fallback` taking a function is the **render prop** pattern from [chapter 25](../25-typescript-patterns/notes.md) — the boundary hands `reset` back out to whatever's being rendered.

A useful trick: giving a boundary a `key` tied to something that changes resets it automatically. `<ErrorBoundary key={recipeId}>` starts fresh whenever the recipe changes, which is usually what you want — the same key mechanism as [chapter 06](../06-rendering-lists/notes.md), used deliberately.

### Use the library

Writing that class yourself once is worth doing, so you know what's in it. After that, use [`react-error-boundary`](https://github.com/bvaughn/react-error-boundary):

```
npm install react-error-boundary
```

```tsx
import { ErrorBoundary } from "react-error-boundary";

function Fallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div role="alert">
      <p>Something went wrong: {error.message}</p>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

<ErrorBoundary FallbackComponent={Fallback} onReset={() => refetch()}>
  <RecipeGrid />
</ErrorBoundary>
```

It handles resetting, `onError` reporting, resetting on prop changes, and a `useErrorBoundary` hook for pushing async errors into a boundary deliberately. It's small, it's the community standard, and it means you never write that class again.

### Where to put boundaries

This is a design decision, and both extremes are wrong.

**One boundary at the root** catches everything, but the fallback is the whole app — one broken widget still takes the page down, just with a nicer message.

**A boundary around every component** means fallbacks everywhere, and a page that degrades into a patchwork of error messages.

A sensible default is **one per meaningful section of the page**:

```tsx
<Layout>
  <ErrorBoundary fallback={<p>Navigation unavailable.</p>}>
    <Sidebar />
  </ErrorBoundary>

  <ErrorBoundary fallback={<p>Couldn't load your recipes.</p>}>
    <RecipeGrid />
  </ErrorBoundary>

  <ErrorBoundary fallback={<p>Recommendations unavailable.</p>}>
    <Recommendations />
  </ErrorBoundary>
</Layout>
```

Ask: **"if this broke, what should the user still be able to do?"** Anything that must keep working belongs outside the boundary. With routing ([chapter 24](../24-react-router/notes.md)), one boundary per route is a good starting point — a crash in one page leaves the nav working so people can go somewhere else.

And keep a root-level boundary as a last resort, so the worst case is a polite message rather than a blank screen.

### Suspense

`<Suspense>` shows a fallback while something inside it isn't ready:

```tsx
import { Suspense } from "react";

<Suspense fallback={<p>Loading…</p>}>
  <Dashboard />
</Suspense>
```

Note the parallel with error boundaries — wrap a section, declare what to show when it can't show itself. That's not a coincidence; they're designed as a pair.

The catch is what "isn't ready" means. Suspense only works with things that know how to talk to it, and your `useEffect`-based fetching from [chapter 18](../18-fetching-data/notes.md) **is not one of them**. Wrapping it in `<Suspense>` does nothing at all. Today, the things that work with Suspense are:

- **`React.lazy`**, for code-splitting — covered next, and available to you right now.
- **Frameworks and data libraries that opt in** — Next.js ([chapter 39](../39-nextjs-and-server-components/notes.md)), TanStack Query's suspense mode ([chapter 31](../31-tanstack-query/notes.md)).
- **The `use` hook** with a promise, in React 19 — genuinely powerful, but the ergonomics around caching the promise are still settling, so this course doesn't build on it.

So for now: use Suspense for lazy loading, and keep your own `isLoading` state for your own fetches. That's not a workaround, it's the current correct answer.

### Code splitting with `React.lazy`

This is where Suspense earns its place in a normal app today.

By default, Vite bundles your whole app into one JavaScript file. Someone who opens the home page downloads the admin dashboard, the settings page, and every chart library, before seeing anything. `lazy` splits a component into its own file, fetched only when it's actually rendered:

```tsx
import { lazy, Suspense } from "react";

const AdminDashboard = lazy(() => import("./AdminDashboard.tsx"));

function App() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Suspense>
  );
}
```

`import()` with brackets is a **dynamic import** ([JavaScript chapter 29](../../JavaScript/29-modules/notes.md)) — it fetches a module at runtime and returns a promise. `lazy` wraps that so React can render it like any component, suspending while it downloads.

Two requirements: the lazily-loaded component must be a **default export**, and there must be a `<Suspense>` somewhere above it.

**Routes are the natural place to split.** Each page becomes its own chunk, downloaded when someone navigates there. Run `npm run build` before and after and compare the output — you'll see one large file become several smaller ones.

Don't split *everything*, though. Each split is an extra network request, and splitting a 2KB component makes things slower, not faster. Split at route level and around genuinely heavy things — a chart library, a rich text editor, a map.

### Boundaries and Suspense together

A lazily-loaded component can fail to download — a flaky connection, a deploy that removed the old chunk. That's a render-time error, so a boundary catches it:

```tsx
<ErrorBoundary fallback={<p>Couldn't load this page. Check your connection.</p>}>
  <Suspense fallback={<PageSkeleton />}>
    <AdminDashboard />
  </Suspense>
</ErrorBoundary>
```

**Error boundary outside, Suspense inside.** That order matters: the boundary needs to be able to catch failures from the Suspense boundary itself.

## Common mistakes

**1. Expecting a boundary to catch an event handler error**

```tsx
<button onClick={() => { throw new Error("boom"); }} />   // boundary never fires
```

Boundaries catch render errors only. Use `try`/`catch` in handlers, and keep your `error` state for fetches.

**2. Writing an error boundary as a function component**

There's no hook for this. It has to be a class, or you use `react-error-boundary`. This is the one exception in modern React.

**3. One boundary at the root and nothing else**

Better than nothing, but one broken widget still replaces the entire app. Add boundaries per section, or per route.

**4. A fallback that can itself throw**

```tsx
<ErrorBoundary fallback={<p>{error.details.message}</p>}>   // ⚠️
```

If the fallback throws, the boundary can't catch it — it propagates to the *next* boundary up, or blanks the page. Keep fallbacks dead simple.

**5. Wrapping `useEffect`-based fetching in `<Suspense>` and expecting it to work**

```tsx
<Suspense fallback={<Spinner />}>
  <RecipeGrid />       {/* fetches with useEffect — Suspense does nothing here */}
</Suspense>
```

No error, no fallback, no effect whatsoever. Suspense only works with things that opt into it.

**6. A lazy component that isn't a default export**

```tsx
const Admin = lazy(() => import("./Admin.tsx"));   // ❌ if Admin.tsx uses a named export
```

Either make it the default export, or map it: `lazy(() => import("./Admin.tsx").then((m) => ({ default: m.Admin })))`.

**7. Splitting everything**

Every `lazy` is an extra request. Split routes and genuinely heavy dependencies, not small components.

**8. Testing your boundary only in development**

Vite's dev server shows a full-screen error overlay on top of your boundary's fallback — which makes it look like the boundary isn't working. Dismiss the overlay (press Escape or click its close button) to see what users would actually get, or test with a production build.

## Quick recap

- An **error boundary** catches a crash in the components below it and shows a fallback, instead of React blanking the whole page.
- It must be a **class component** — the one remaining place modern React needs one. Write it once to understand it, then use `react-error-boundary`.
- Boundaries catch **render** errors only. Not event handlers, not timeouts, not promises — those still need `try`/`catch` and your own `error` state.
- Place boundaries **per section or per route**, asking "if this broke, what should still work?" Keep a root one as a last resort.
- Give people a way to recover: a `reset` function, or a `key` that changes.
- **`<Suspense>`** shows a fallback while something below it isn't ready, but only for things that opt in — today, mainly `React.lazy`.
- **`lazy` + dynamic `import()`** splits a component into its own downloaded chunk. Split at route level and around heavy dependencies, not everywhere.
- Put the **error boundary outside** and **Suspense inside**, so failed downloads get caught.

---

**Next:** try the [exercises](exercises.md), then move on to [27 Performance](../27-performance/notes.md).
