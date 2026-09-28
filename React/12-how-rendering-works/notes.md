# 12 How Rendering Works

## What is it?

**Rendering** is React calling your component functions to work out what the page should look like. This chapter is about exactly when that happens, what your component sees while it's happening, and how React turns the result into real changes on the screen.

You've used state since [chapter 08](../08-state/notes.md) by following the rules without needing the machinery underneath. This chapter opens the machinery up. Nothing in it is new behaviour — it's the explanation for behaviour you've already seen.

## Why does it matter?

A few things you've already run into only make sense once you see this picture:

- Why `count` inside a click handler is stuck at the value it had when the render started, even after you call `setCount`.
- Why calling `setCount` three times in a row only moves the count by one, unless you use the updater form.
- Why `<StrictMode>` runs your component twice in development.
- Why two `<Counter />`s on the same page never mix up their numbers.

Each of those was a "just trust me for now" moment. This chapter is where you stop trusting and start knowing. Once the model clicks, a lot of React stops feeling like magic and starts feeling like a fairly small, fairly logical machine.

## Real-world example

Think about a **photographer taking a family portrait**.

| Portrait session | React rendering |
|---|---|
| "Everyone, hold still!" | React starts a render |
| The photographer looks at everyone and takes **one photo** | React calls your component and gets back one description of the page |
| The photo shows exactly how everyone looked at that instant | That render's state values are fixed, for the whole photo |
| Someone waves *after* the photo is taken — it's not in this photo | Calling `setState` inside the render doesn't change what's already being rendered |
| The photographer compares this photo to the last one, and only reprints the parts that changed | React compares the new result to the old one and updates only what's different |
| "Everyone, hold still again!" for the next photo | The next render, with fresh values |

The photo is not video. It's a snapshot, frozen at one instant, and everything in your component during that render sees the same frozen instant.

## How it works

### Three steps, every time

Every update to the screen goes through the same three steps:

1. **Trigger.** Something asks for a render: your first call to `createRoot(...).render()`, or a `set` function being called.
2. **Render.** React calls your component function (and every component nested inside it that needs updating) and collects what they return.
3. **Commit.** React compares the result to what's currently on the screen, and changes only the real DOM elements that actually differ.

"Rendering" and "the page changing" are not the same event. Render is React figuring out *what should be true*. Commit is React actually *making it true*. You'll see why that distinction matters in a moment.

### Trigger: what starts a render

Two things trigger a render:

- **The initial render.** `main.tsx` calls `createRoot(...).render(<App />)`, which renders `App` for the first time — and everything inside it.
- **A state update.** Calling a `set` function from `useState` schedules a re-render of that component (and its children, more on that below).

That's the complete list. A plain variable changing, a `console.log`, a function running — none of those are on it. Nothing else in React starts a render, which is exactly why changing a `let` in [chapter 08](../08-state/notes.md) never moved the page.

### Render: React calls your function

When a render is triggered, React calls your component function from the top. For the first render, that means every component in the tree, starting from your root (`App` in your projects). For a re-render triggered by state, it means the component whose state changed, and — importantly — **every component nested inside it**, whether or not their own props changed.

```tsx
function Parent() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <Child />
    </div>
  );
}

function Child() {
  console.log("Child rendered");
  return <p>I'm a child, I take no props</p>;
}
```

Click the button, and `"Child rendered"` prints, even though `Child` takes nothing and nothing about it changed. That surprises people the first time. It's not a bug — by default, React just re-runs the whole subtree to be safe, and figures out the *actual* changes afterwards, in the commit step. [Chapter 27](../27-performance/notes.md) covers `memo`, which lets you tell React "skip this subtree if its props are the same."

This is also why the rule from [chapter 03](../03-components/notes.md) — never define a component inside another component — matters so much. Every one of these renders creates a brand new function, so React treats each render's version of that "component" as a completely different one and throws away everything the previous one was doing.

### The render must be fast and pure

Because React might call your component function often — every keystroke in a text box, every click — it needs to be cheap to run, and it needs to give the same result for the same inputs (**pure**, from [chapter 03](../03-components/notes.md)). No changing state during render, no changing things outside the component, no side effects like `fetch` calls. Those belong in event handlers or in [effects](../17-effects/notes.md) — anywhere except the function body itself.

### Commit: React updates the real DOM

Once React has the new description of the page, it compares it to what's currently shown and touches **only the parts that changed**. If a `<p>`'s text changed but its neighbouring `<button>` didn't, only the text node is touched. This comparison process is often called **reconciliation**, or informally "the virtual DOM" — you don't need to manage it yourself, but it explains why React is fast even though it re-runs whole functions on every keystroke: re-running a function is cheap; touching the real DOM is the expensive part, and React does as little of that as it can.

Keys, from [chapter 06](../06-rendering-lists/notes.md), are the input to exactly this process for lists: they're how React decides which item in the new list corresponds to which item in the old one, so it can update or move existing elements instead of throwing them all away and rebuilding from scratch.

On the **very first** render, there's nothing to compare against, so React builds the entire DOM structure from nothing. That's why your app's first paint can feel slightly heavier than an update later on.

### The snapshot: state is fixed for the whole render

This is the idea that unlocks the rest of the chapter. **Every render has its own, fixed snapshot of state.** Inside one render, `count` genuinely never changes — it's a `const` that was set once, at the top of that particular call to your component.

```tsx
function Counter() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 1);
    console.log(count);          // logs the OLD number, every time
    setTimeout(() => {
      console.log(count);        // still the OLD number, even a second later
    }, 3000);
  }

  return <button onClick={handleClick}>{count}</button>;
}
```

Click once, wait three seconds, and both logs show the number from *before* the click — even the delayed one. `handleClick` was created during a specific render, and it closed over that render's `count` ([JavaScript chapter 25](../../JavaScript/25-closures/notes.md)). Nothing that happens later — not React re-rendering, not three seconds passing — can reach back and change what that particular function remembers `count` to be.

This is not a flaw to work around most of the time; it's what makes React predictable. A handler always sees the world exactly as it was when it was created, no matter when it actually runs.

### Why `setCount` three times only moves the count once

Now the classic bug from [chapter 08](../08-state/notes.md) has a real explanation:

```tsx
function handleClick() {
  setCount(count + 1);   // this render's count is 0, so: "set it to 1"
  setCount(count + 1);   // still this render's count, still 0: "set it to 1"
  setCount(count + 1);   // still 0: "set it to 1"
}
```

All three lines run inside the **same render's snapshot**, so `count` is `0` in every single one of them. They're not "add one, three times" — they're "set it to one," said three times.

The updater function fixes it precisely because it doesn't read the snapshot at all — it asks React for whatever the latest value is *when this update actually runs*:

```tsx
function handleClick() {
  setCount((prev) => prev + 1);   // "whatever it is, plus one"
  setCount((prev) => prev + 1);   // "whatever THAT becomes, plus one"
  setCount((prev) => prev + 1);   // "whatever THAT becomes, plus one"
}
```

React runs these in order, each one building on the result of the last, which is why the count genuinely goes up by three.

### Batching

Inside one event handler, React doesn't re-render after every single `set` call. It waits until the handler finishes, then re-renders **once**, with everything applied.

```tsx
function handleClick() {
  setCount(count + 1);
  setName("Tom");
  // React re-renders once here, not twice, with both changes
}
```

This is called **batching**, and it's why the snapshot idea holds together: if React re-rendered after every line, `count` in the second line would already be the *new* value, and the model in this chapter would be far more confusing to reason about. Batching is also just faster — one re-render instead of several.

Since React 18, batching happens almost everywhere — event handlers, timeouts, promises — so you rarely need to think about it directly. It's worth knowing the name, because you'll see it mentioned in library documentation and in older React discussions where it didn't always apply this broadly.

### Each render gets its own everything

Not just state — every `const`, every function, every piece of JSX created during a render belongs to that render alone.

```tsx
function Counter() {
  const [count, setCount] = useState(0);
  const message = `Count is ${count}`;    // a fresh string, this render

  function handleClick() {                // a fresh function, this render
    setCount(count + 1);
  }

  return <button onClick={handleClick}>{message}</button>;
}
```

Every time `Counter` runs, `message` and `handleClick` are brand new. The *old* `handleClick`, the one attached to the button before this render, still exists, still remembers the old `count`, and will keep working exactly as it did — until React swaps it for the new one during commit. There is never a shared, mutable `handleClick` that changes underneath you. Each render's version is separate, and separately correct for the moment it was created.

### StrictMode, and why your component runs twice

You've seen this since [chapter 03](../03-components/notes.md): in development, wrapped in `<StrictMode>`, React calls your component function **twice** per render, and discards one set of results.

That's not a bug in your setup and it's not a performance measurement. It's a deliberate check: because render is supposed to be pure, calling it twice with the same state should always produce the same result and cause no visible side effects. If your component secretly changes something outside itself while rendering — a module-level variable, `console.log` used to count renders, anything at all — the double call makes that visible immediately, in development, on your machine, instead of as an intermittent bug in production months later.

It only happens in development, and only wraps render (and, from chapter 17, effects). It never runs twice in your built, deployed app.

### Two components, two independent snapshots

```tsx
function Ex() {
  return (
    <>
      <Counter />
      <Counter />
    </>
  );
}
```

Each `<Counter />` is rendered separately, with its own state, its own snapshot, its own closures. Clicking one calls **that instance's** `handleClick`, built from **that instance's** render, touching **that instance's** state. This is the same fact from [chapter 08](../08-state/notes.md) — "each component has its own state" — but now you can see mechanically why it's true: there's no single global render happening, there's one render per component, each with everything scoped to it alone.

## Common mistakes

**1. Expecting a variable read right after `setState` to reflect the new value**

```tsx
setCount(count + 1);
console.log(count);   // still old — read it via useEffect (chapter 17) if you need to react to the new value
```

`count` won't update until the next render. If you need to *use* the new value immediately, compute it yourself: `const next = count + 1; setCount(next); console.log(next);`.

**2. Calling `set` the same way multiple times in one handler, expecting each call to build on the last**

```tsx
setCount(count + 1);
setCount(count + 1);   // still reads the same old count
```

Use the updater form, `setCount((prev) => prev + 1)`, whenever the new value depends on the value before it.

**3. Treating a `console.log` count as proof of how many times something "really" ran**

In development, StrictMode's intentional double-call can make a component or effect look like it ran twice when your built app would only run it once. Don't debug performance in a StrictMode-wrapped dev build; check the built app, or read the Console message carefully — React labels StrictMode's extra calls.

**4. Assuming a child that takes no props never re-renders**

```tsx
function Child() {
  console.log("rendered");    // fires on every parent re-render, by default
  return <p>Static</p>;
}
```

It's fine and normal. It only becomes a performance question at a scale where it's worth measuring — that's [chapter 27](../27-performance/notes.md).

**5. Thinking "render" means "the screen changed"**

Render is React calling your functions and building a description of the page. Commit is what actually touches the DOM, and React only touches the parts that differ. A component can render and have nothing change on screen at all.

## Quick recap

- Every update goes through three steps: **trigger** (initial render or a state update), **render** (React calls your component functions), **commit** (React updates only the real DOM elements that changed).
- Rendering the parent whose state changed re-renders every component nested inside it by default, whether or not their own props changed.
- **Every render has its own fixed snapshot of state and props.** A value read inside a render — including inside a handler defined during that render — never changes for the life of that render, however long the handler takes to actually run.
- That's why three `setCount(count + 1)` calls in a row only move the count by one: use the updater function, `setCount((prev) => prev + 1)`, when the new value depends on the old one.
- **Batching** means several `set` calls inside one event handler cause a single re-render, not one per call.
- **StrictMode** double-calls your component (and effects) in development only, specifically to surface impurity — code that shouldn't be there in the first place.
- Two instances of the same component render completely independently, each with its own snapshot, its own state, and its own closures.

---

**Next:** try the [exercises](exercises.md), then move on to [13 Lifting State Up](../13-lifting-state-up/notes.md).
