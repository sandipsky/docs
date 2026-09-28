# 27 Performance

## What is it?

Three tools for telling React to skip work it would otherwise redo:

```tsx
const MemoedCard = memo(Card);                                   // skip re-rendering a component
const sorted = useMemo(() => sort(items), [items]);              // skip recalculating a value
const handleClick = useCallback(() => select(id), [id]);         // keep a function the same between renders
```

And, far more importantly, the judgement about **when to use any of them**, which is: much less often than you'd think, and never without measuring first.

## Why does it matter?

[Chapter 12](../12-how-rendering-works/notes.md) established that when a component re-renders, everything inside it re-renders too — by default, regardless of whether its props changed. That's usually completely fine. Re-running a function that returns some JSX is cheap, and React only touches the DOM where things actually differ.

It stops being fine in specific, identifiable situations:

- A list of 500 rows re-rendering on every keystroke in a search box.
- An expensive calculation — sorting, filtering, parsing — redone on every render when its inputs haven't changed.
- A component tree deep enough that "cheap × many" stops being cheap.

The trouble is that these tools are easy to apply *everywhere*, and doing so makes things **worse**: `memo` adds a comparison on every render, `useMemo` and `useCallback` add bookkeeping and hold onto memory, and all three make code harder to read. Applied blindly, you pay the cost everywhere and get the benefit almost nowhere.

So this chapter is at least as much about restraint and measurement as it is about the three functions.

## Real-world example

Think about **traffic management in a city**.

| City traffic | React performance |
|---|---|
| Traffic flows fine most of the day | Most re-renders are too cheap to notice |
| One junction jams at rush hour | One component is slow, under specific conditions |
| Counting cars to find the real bottleneck | The React DevTools Profiler |
| Building a flyover at the bad junction | `memo` / `useMemo` where it's needed |
| Building flyovers at every junction | `memo` everywhere |
| Cost a fortune, made the city uglier, fixed nothing | Slower, noisier code, no measurable gain |
| "The jam is actually a broken traffic light" | The real problem is usually a design mistake, not a missing `memo` |

That last row is the one to carry with you. Most React performance problems aren't solved by memoisation — they're solved by fixing something structurally wrong, like state sitting far higher in the tree than it needs to.

## How it works

### Measure first, always

Before reaching for any of these, find out what's actually slow.

**Install the React DevTools Profiler** (part of the same extension from [chapter 01](../01-getting-started/notes.md)). Open the **Profiler** tab, press record, interact with the slow part of your app, and stop. You get a flame graph of every component that rendered, how long each took, and — most usefully — **why** each one rendered.

Turn on **"Record why each component rendered"** in the Profiler's settings. That single option answers the question you actually have: was it props, state, a parent, or a context?

Two things to know while reading the numbers:

- **Development builds are much slower than production builds.** Never conclude "React is slow" from a dev build. For real numbers, `npm run build && npm run preview`.
- **StrictMode double-renders in development** ([chapter 12](../12-how-rendering-works/notes.md)), which inflates counts. Compare *relative* numbers, not absolutes.

If nothing shows up as slow, **stop**. You're done. An app that feels fast is fast.

### `memo`: skip re-rendering a component

`memo` wraps a component so React skips re-rendering it when its props haven't changed:

```tsx
import { memo } from "react";

type RecipeCardProps = {
  recipe: Recipe;
  onSelect: (id: string) => void;
};

function RecipeCard({ recipe, onSelect }: RecipeCardProps) {
  return <article>{/* ... */}</article>;
}

export default memo(RecipeCard);
```

Now when the parent re-renders, React compares this render's props with the last render's. If they're all the same, it reuses the previous result and doesn't call `RecipeCard` at all.

**"The same" means `Object.is`** — the reference comparison from [chapter 11](../11-updating-objects-and-arrays/notes.md). That's the detail that makes `memo` fail silently in practice:

```tsx
function RecipeGrid({ recipes }: RecipeGridProps) {
  return (
    <div>
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          onSelect={(id) => console.log(id)}   // ⚠️ a brand-new function every render
        />
      ))}
    </div>
  );
}
```

That inline arrow function is a **new function object on every render**, so `onSelect` is never equal to last time, so `memo` never skips anything. You've added a comparison to every render and gained precisely nothing.

This is the single most common way `memo` gets silently wasted — which is exactly what `useCallback` exists to fix.

### `useCallback`: keep a function stable

```tsx
import { useCallback } from "react";

const handleSelect = useCallback((id: string) => {
  setSelectedId(id);
}, []);
```

`useCallback` returns **the same function object** across renders, as long as its dependencies haven't changed. The dependency array works exactly like `useEffect`'s ([chapter 17](../17-effects/notes.md)): list every reactive value the function reads.

Now `memo` on the child actually works, because `onSelect` is genuinely the same reference each time.

**`useCallback` is almost always pointless on its own.** It only helps when the function is passed to a `memo`'d component, or used as a dependency of a `useEffect` or `useMemo`. Wrapping a handler passed to a plain `<button onClick={...}>` achieves nothing at all — a DOM element doesn't care whether its handler is a new function.

### `useMemo`: skip recalculating a value

```tsx
import { useMemo } from "react";

const sortedBooks = useMemo(
  () => [...books].sort((a, b) => a.title.localeCompare(b.title)),
  [books]
);
```

`useMemo` runs its function on the first render and remembers the result, only recomputing when a dependency changes. Two legitimate uses:

**1. The calculation is genuinely expensive.** Sorting thousands of items, heavy filtering, parsing something big. Note the word *genuinely* — filtering a 20-item array is not expensive, and wrapping it costs more than it saves.

**2. The result is an object or array used as a dependency elsewhere**, where a new reference would cause unwanted work:

```tsx
const value = useMemo(() => ({ theme, setTheme }), [theme]);
return <ThemeContext value={value}>{children}</ThemeContext>;
```

That's the context fix promised back in [chapter 22](../22-context/notes.md). Without `useMemo`, the object literal is new every render, so every consumer re-renders even when `theme` is identical.

The same applies to an object or array in a `useEffect` dependency array — the infinite-loop trap from [chapter 17](../17-effects/notes.md).

### The three together

They're designed to work as a set, and individually they often do nothing:

```tsx
function RecipeGrid({ recipes, query, onSelect }: RecipeGridProps) {
  const visible = useMemo(
    () => recipes.filter((r) => r.name.toLowerCase().includes(query.toLowerCase())),
    [recipes, query]
  );

  return (
    <div className="results-grid">
      {visible.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} onSelect={onSelect} />
      ))}
    </div>
  );
}

export default memo(RecipeGrid);
```

For this to actually pay off, **the whole chain has to hold**: `RecipeCard` is `memo`'d, `onSelect` comes from a `useCallback` in the parent, and each `recipe` object keeps the same reference between renders (which it does, as long as you follow [chapter 11](../11-updating-objects-and-arrays/notes.md) and don't rebuild untouched objects). Break any link — one inline arrow, one `structuredClone` — and the whole chain stops working, silently, with no warning anywhere.

That fragility is the strongest argument for using these sparingly and verifying with the Profiler that they did something.

### Fix the structure first

Before any of this, check whether the real problem is *where your state lives*. This is the fix that actually works, and it needs no memoisation at all.

```tsx
// ❌ every keystroke re-renders the entire page, including the 500-row table
function Page() {
  const [query, setQuery] = useState("");

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <HugeTable rows={rows} />
      <Sidebar />
    </div>
  );
}
```

```tsx
// ✅ typing only re-renders SearchBox
function SearchBox() {
  const [query, setQuery] = useState("");
  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}

function Page() {
  return (
    <div>
      <SearchBox />
      <HugeTable rows={rows} />
      <Sidebar />
    </div>
  );
}
```

Moving state **down** to the smallest component that needs it is the mirror image of lifting state up ([chapter 13](../13-lifting-state-up/notes.md)), and it's often the entire fix. No `memo`, no `useCallback`, less code than before.

The other structural fix is **passing JSX as `children`**, the same trick from [chapter 22](../22-context/notes.md):

```tsx
function Wrapper({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>{count}</button>
      {children}
    </div>
  );
}

<Wrapper>
  <ExpensiveTree />     {/* created by the PARENT, so it doesn't re-render when count changes */}
</Wrapper>
```

`ExpensiveTree` is created outside `Wrapper`, so clicking the button doesn't re-create it. Same JSX element object, so React skips it entirely — no `memo` anywhere.

### Lists: the case that really is slow

Rendering hundreds or thousands of rows is the one performance problem you'll reliably hit. `memo` on the row component helps, but past a few thousand rows nothing helps except **not rendering most of them**.

**Virtualisation** (or "windowing") renders only the rows currently visible, plus a few either side, and swaps them as you scroll. Libraries like [TanStack Virtual](https://tanstack.com/virtual) do this. A 10,000-row table renders maybe 30 elements.

You don't need this today, but recognise the situation: if you're about to render a very long list and reaching for `memo`, virtualisation is probably the real answer.

### The React Compiler

Everything above is manual work that follows mechanical rules — which is the kind of thing a machine should do. That's the **React Compiler**, an official build-time tool that analyses your components and inserts the memoisation automatically.

With it enabled, you write plain, simple React — no `memo`, no `useMemo`, no `useCallback` — and the compiler adds the equivalent where it's actually useful, without the fragility of a human forgetting one link in the chain.

Vite offered it as an option when you created your app in [chapter 01](../01-getting-started/notes.md) (the "TypeScript + React Compiler" variant), and the advice there was to pick plain TypeScript for learning. That was deliberate: understanding *what* it does for you is far more valuable than having it silently do it.

It relies on your components following the rules — pure renders, no mutation, correct dependencies. Everything this course has insisted on since [chapter 03](../03-components/notes.md) is exactly what makes a component compilable.

The realistic position today: know these three tools, because you'll read code full of them and you'll need them in projects that don't use the compiler. Expect to write fewer of them by hand over time.

### A sane default

1. **Write plain, clear React.** No memoisation.
2. **If something feels slow, profile it** — production build, Profiler tab, "why did this render" on.
3. **Look for a structural fix first**: state pushed down, JSX passed as `children`, a smaller list.
4. **Only then** apply `memo`/`useMemo`/`useCallback`, to the specific thing you measured.
5. **Profile again** and confirm it actually helped. If it didn't, take it out.

Step 5 gets skipped constantly, and it's how codebases end up covered in memoisation that does nothing.

## Common mistakes

**1. Optimising before measuring**

By far the most common. You cannot guess which part of a React app is slow — the Profiler exists precisely because intuition is unreliable here.

**2. `memo` with an inline function or object prop**

```tsx
<MemoedCard recipe={recipe} onSelect={(id) => select(id)} />   // new function every render
<MemoedCard config={{ compact: true }} />                       // new object every render
```

`memo` compares by reference and always sees a difference, so it never skips. You've added cost for nothing. Use `useCallback`, or hoist the object out.

**3. `useCallback` on a function that isn't passed to a `memo`'d component**

```tsx
const handleClick = useCallback(() => setOpen(true), []);
return <button onClick={handleClick}>Open</button>;   // pointless
```

A DOM element doesn't care. This is pure overhead.

**4. `useMemo` on something trivial**

```tsx
const total = useMemo(() => price * quantity, [price, quantity]);   // ⚠️
```

The multiplication is faster than the memoisation bookkeeping. Reserve `useMemo` for genuinely expensive work, or for stabilising a reference.

**5. Wrong dependencies**

```tsx
const filtered = useMemo(() => items.filter((i) => i.name.includes(query)), [items]);
// ❌ `query` is missing — the result never updates when you type
```

Stale results, with no error. The dependency rules from [chapter 17](../17-effects/notes.md) apply identically. Trust the linter.

**6. Concluding React is slow from a dev build**

Development builds carry extra checks and StrictMode double-renders. Measure `npm run preview`.

**7. Reaching for `memo` when the fix is moving state**

If typing in a search box re-renders your whole page, the answer is usually to move that state into the search box, not to `memo` everything else.

## Quick recap

- **Measure before optimising.** The React DevTools Profiler, with "why did this render" enabled, on a production build.
- **`memo`** skips re-rendering a component when its props are unchanged — compared by **reference**, which is why one inline arrow or object literal silently defeats it.
- **`useCallback`** keeps a function reference stable. It's only useful when feeding a `memo`'d component or a dependency array.
- **`useMemo`** skips recalculating a value. Use it for genuinely expensive work, or to stabilise an object/array used as a context value or a dependency.
- They work as a **chain** — break one link and the whole optimisation silently stops working.
- **Fix the structure first.** Moving state *down*, or passing JSX as `children`, often removes the problem entirely with less code.
- Very long lists need **virtualisation**, not memoisation.
- The **React Compiler** does this work automatically for components that follow the rules. Understand the manual version; expect to write less of it over time.

---

**Next:** try the [exercises](exercises.md), then move on to [28 Testing](../28-testing/notes.md).
