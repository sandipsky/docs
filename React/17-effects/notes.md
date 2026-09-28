# 17 Effects

## What is it?

An **effect** is code that runs after React updates the screen, to synchronise your component with something **outside** React: the browser, a timer, `localStorage`, a server, a third-party widget.

```tsx
import { useEffect } from "react";

useEffect(() => {
  document.title = `${count} unread messages`;
}, [count]);
```

`useEffect` is a hook, like `useState`. It takes a function to run, and a list of values that decide *when* to run it again.

## Why does it matter?

Every hook so far has been about things fully inside React's world: a value your component remembers (`useState`), a description of the page (JSX). But components don't live in a vacuum. They need to talk to the tab title, to timers, to `localStorage`, to APIs — none of which React controls or knows about on its own.

You've already brushed up against this without the proper tool. In the [to-do app](../10-project-todo-app/notes.md), milestone 8 saved to `localStorage` inside every event handler, one by one, with a note that this was "the long way round." That worked because every change to `tasks` happened to go through a handler. But what if something needed to react to `tasks` changing *no matter how* it changed — including a change that arrives from somewhere other than a click? Chasing every possible cause by hand doesn't scale. An effect says, once: "whenever `tasks` changes, for any reason, do this." That's the gap this chapter fills.

## Real-world example

Think about a **smoke alarm**.

| Smoke alarm | Effect |
|---|---|
| It doesn't care *why* there's smoke — a burnt toast, a candle, an actual fire | It doesn't care *why* a value changed — a click, a timer, data arriving |
| It reacts to the **condition** (smoke present), not to a specific event (someone pressing a "there's a fire" button) | It reacts to a **dependency changing**, not to a specific handler being called |
| Installed once, then works forever on its own | Set up once in your component; React re-runs it exactly when its dependencies say to |
| Needs its battery changed, or it stops working right — and needs disconnecting before you take it down | Needs a correct dependency list, and often a cleanup function before it's removed |

You don't wire a smoke alarm to every possible fire-starting event by hand. You wire it to the condition, and let it fire whenever that condition becomes true. Effects work the same way.

## How it works

### The problem, without an effect

Say you want the browser tab's title to always show how many items are in a cart.

```tsx
function CartPage({ items }: { items: CartItem[] }) {
  function handleAdd(item: CartItem) {
    setItems([...items, item]);
    document.title = `Cart (${items.length + 1})`;   // 😬 have to remember this everywhere
  }

  function handleRemove(id: string) {
    setItems(items.filter((item) => item.id !== id));
    document.title = `Cart (${items.length - 1})`;   // and here
  }
  // ...and everywhere else items can change
}
```

Every place `items` can change needs its own copy of the same "update the title" logic, and it's easy to add a new way to change `items` later and forget the title update entirely. This is exactly the milestone-8 problem again, at a smaller scale.

### The same problem, with `useEffect`

```tsx
import { useEffect } from "react";

function CartPage({ items }: { items: CartItem[] }) {
  useEffect(() => {
    document.title = `Cart (${items.length})`;
  }, [items]);

  function handleAdd(item: CartItem) {
    setItems([...items, item]);   // that's it — the effect handles the title
  }

  function handleRemove(id: string) {
    setItems(items.filter((item) => item.id !== id));
  }
}
```

Now `handleAdd` and `handleRemove` only do the one thing each is actually about: changing `items`. The effect runs automatically, after every render where `items` is different from last time, and nowhere else has to know or care that the title needs updating.

### The shape of `useEffect`

```tsx
useEffect(() => {
  // the effect: runs after the render commits
  return () => {
    // cleanup: runs before the next effect, and when the component is removed
  };
}, [dependency1, dependency2]);
```

- **The function** is your effect. It runs *after* React has updated the real DOM for this render — never during rendering itself, which keeps your component pure, exactly as [chapter 12](../12-how-rendering-works/notes.md) requires.
- **The dependency array** is the list of every reactive value — every prop, state variable, or value derived from them — that your effect's function actually reads. React compares this render's dependencies to last render's, and only re-runs the effect if at least one of them changed.
- **The optional returned function** is cleanup, which the next section covers properly.

### The three shapes of the dependency array

This is the single most important thing to get right, so it's worth seeing all three side by side:

```tsx
useEffect(() => {
  console.log("runs after every single render");
});                              // no array at all

useEffect(() => {
  console.log("runs once, after the first render only");
}, []);                          // an empty array

useEffect(() => {
  console.log("runs after the first render, and again whenever `count` changes");
}, [count]);                     // an array with values in it
```

**No array**: runs after every render, no exceptions. Rare, and usually a sign you actually wanted one of the other two.

**Empty array**: runs exactly once, right after the component's first render — never again, however many times the component re-renders afterwards. Good for "set something up once": a one-time subscription, reading something from storage on load.

**Array with values**: runs after the first render, and then again on any later render where one of the listed values is different from what it was last render. This is the shape you'll write most often.

### `useEffect` is not the same as `useState`

They're both hooks, both follow the two rules from [chapter 08](../08-state/notes.md) (top level only, never conditional), but they do fundamentally different jobs:

| | `useState` | `useEffect` |
|---|---|---|
| Runs | During render | After the render commits |
| Purpose | Hold a value across renders | Do something to the outside world |
| Can it update state? | It *is* state | Yes, but carefully (see below) |
| Return value | `[value, setter]` | Nothing, or a cleanup function |

### Cleanup: undoing what the effect did

Some effects set something up that needs explicitly tearing down — a timer, a subscription, an event listener on `window`. If you don't undo it, you get duplicates piling up every time the effect re-runs.

```tsx
useEffect(() => {
  const id = setInterval(() => {
    console.log("tick");
  }, 1000);

  return () => {
    clearInterval(id);
  };
}, []);
```

The returned function runs:

- **Before the effect runs again**, if its dependencies changed.
- **When the component is removed from the page** ("unmounted").

Think of the effect and its cleanup as a matched pair: "start the timer" pairs with "stop the timer." "Add an event listener" pairs with "remove it." "Open a connection" pairs with "close it." If your effect *does* something ongoing, ask yourself straight away what undoing it looks like, and write the cleanup at the same time you write the effect — not as an afterthought once you notice something's leaking.

Here's what goes wrong without it:

```tsx
useEffect(() => {
  window.addEventListener("resize", handleResize);
  // ❌ no cleanup: every re-run adds ANOTHER listener, forever
}, [handleResize]);
```

Each time this effect re-runs, one more identical listener gets attached, and none of the old ones ever go away. `handleResize` ends up firing two, three, ten times per actual resize, and the only fix is a cleanup function that removes exactly the listener that was added.

### Why the dependency array matters: two ways to get it wrong

**Leave out a value you use, and the effect sees a stale one:**

```tsx
useEffect(() => {
  console.log(`You have ${count} items`);
}, []);   // ❌ reads `count`, but never re-runs when it changes
```

This runs once, logs whatever `count` was on the very first render, and then never updates — a stale [closure](../12-how-rendering-works/notes.md), the exact same idea from chapter 12, just now living inside an effect instead of an event handler. React's linter (and the Vite starter includes one) will warn you about this: **every reactive value your effect's function reads must be in the array.**

**Include an object or array that's rebuilt every render, and the effect never stops re-running:**

```tsx
useEffect(() => {
  console.log("options changed");
}, [{ limit: 10 }]);   // ❌ a brand-new object, every single render
```

`{ limit: 10 }` is a new object every time the component renders — same content, different reference ([chapter 11](../11-updating-objects-and-arrays/notes.md)) — so React's "did the dependencies change?" check says yes, every time, forever. If you need an object or array as a dependency, either build it outside the component (if it never changes), store the *primitive values* that make it up as separate dependencies instead, or wrap it in `useMemo` ([chapter 27](../27-performance/notes.md)).

### Fetching data in an effect — and its trap

This is the most common reason to reach for `useEffect`, and it has a famous gotcha worth seeing once, deliberately:

```tsx
function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then((response) => response.json())
      .then((data) => setUser(data));
  }, [userId]);

  // ...
}
```

Looks right, and mostly works — until `userId` changes quickly. Say it goes from `"1"` to `"2"` before the request for `"1"` has come back. Now **two** requests are in flight, and whichever one happens to finish *last* wins, even if it's the stale one for `"1"`. The user briefly sees the wrong profile, or the screen flickers between the two. This is called a **race condition**.

The fix is a cleanup function that marks the *previous* request as no longer wanted:

```tsx
useEffect(() => {
  let ignore = false;

  fetch(`/api/users/${userId}`)
    .then((response) => response.json())
    .then((data) => {
      if (!ignore) {
        setUser(data);
      }
    });

  return () => {
    ignore = true;
  };
}, [userId]);
```

When `userId` changes, React runs the cleanup for the *old* effect before running the new one. That sets `ignore = true` on the old request's closure, so when it eventually resolves, its `setUser` call is skipped. Only the most recent request is ever allowed to actually update state. [Chapter 18](../18-fetching-data/notes.md) builds on exactly this pattern, with loading and error states added.

### `useEffect` calling `setState`: allowed, but think twice

Effects can update state — that's often the entire point, as in the fetch example above. But an effect that sets state **based only on other state or props**, with nothing external involved, is almost always a sign you didn't need an effect at all:

```tsx
function Cart({ items }: { items: CartItem[] }) {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setTotal(items.reduce((sum, item) => sum + item.price, 0));   // ❌ don't do this
  }, [items]);

  // ...
}
```

This works, but it renders **twice** for every change to `items`: once with the old `total`, then the effect runs, calls `setTotal`, and triggers a second render to catch up. It's slower than it needs to be, and — much more importantly — it's solving a problem that [chapter 08](../08-state/notes.md) already solved:

```tsx
function Cart({ items }: { items: CartItem[] }) {
  const total = items.reduce((sum, item) => sum + item.price, 0);   // ✅ just calculate it
  // ...
}
```

No effect, no extra state, no extra render, and it genuinely can't go stale. **If you can calculate a value during render, calculate it during render.** This is worth its own heading, because it's the single most common way effects get misused.

### When you do and don't need an effect

A rule of thumb that covers most cases: **if your code is reacting to a component rendering, rather than reacting to something outside React, you probably don't need an effect.**

| Situation | Use an effect? |
|---|---|
| Deriving a value from props or state | **No** — calculate it during render (chapter 08) |
| Resetting state when a prop changes | Usually no — see below |
| Handling a specific user action, like a click | **No** — that's an event handler (chapter 07), which is exactly what it's built for |
| Fetching data based on a prop or piece of state | **Yes** |
| Subscribing to something outside React — `window` resize, a WebSocket | **Yes** |
| Syncing state to `localStorage` | **Yes** |
| Manually controlling a non-React widget (a map library, a chart) | **Yes** |
| Updating `document.title` | **Yes** |

The "resetting state when a prop changes" row deserves a moment, because it's a common trap:

```tsx
function ProfilePage({ userId }: { userId: string }) {
  const [comment, setComment] = useState("");

  useEffect(() => {
    setComment("");     // ❌ works, but there's a better tool
  }, [userId]);
  // ...
}
```

This "works," but it causes an extra render (component shows the *old* comment for an instant, then the effect fires and clears it) for something that has a cleaner fix: give the component a `key` tied to `userId` where it's used, so React treats a new user as an entirely new component instance and throws away the old state automatically ([chapter 06](../06-rendering-lists/notes.md)'s key mechanism, used deliberately this time):

```tsx
<ProfilePage key={userId} userId={userId} />
```

You don't need to master this trick yet — just recognise the shape "an effect that only resets state when a prop changes" as a smell worth a second look.

### Effects and StrictMode

You'll notice your effects appear to run **twice** in development, with cleanup in between: effect → cleanup → effect. This is [chapter 12](../12-how-rendering-works/notes.md)'s StrictMode double-invocation again, extended to effects. It's deliberately checking that your cleanup function correctly undoes whatever your effect did — if it does, running "set up, tear down, set up" leaves you in exactly the same state as running it once, and you'll never notice. If it *doesn't* clean up properly, you'll see the symptom immediately (two intervals ticking, a duplicated listener), in development, instead of as a slow leak discovered in production. It only happens once, in dev; your built app runs the effect once.

## Common mistakes

**1. Leaving out a dependency your effect actually reads**

```tsx
useEffect(() => {
  console.log(count);
}, []);   // ❌ stale forever after the first render
```

Every reactive value read inside the effect belongs in the array. Trust your editor's exhaustive-deps warning; it's almost always right.

**2. A missing cleanup function for anything ongoing**

```tsx
useEffect(() => {
  const id = setInterval(tick, 1000);
}, []);   // ❌ never cleared — piles up if this effect ever re-runs, and leaks on unmount
```

Timers, listeners, subscriptions: if you started it, return a function that stops it.

**3. Fetching in an effect with no race-condition guard**

Fast typing, fast prop changes, or a slow network can let an old response overwrite a newer one. Use the `ignore` flag pattern, or the built-in browser tool for cancelling requests outright, `AbortController` (covered in [chapter 18](../18-fetching-data/notes.md)).

**4. Using an effect to calculate something you already have everything you need for**

```tsx
useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);   // ❌
```

Just write `const fullName = \`${firstName} ${lastName}\`;` during render. No effect needed at all.

**5. An effect with an object or array literal in its dependency array**

```tsx
useEffect(() => { ... }, [{ id: userId }]);   // ❌ a new object every render — runs every render
```

Depend on the primitive values themselves (`[userId]`), not a freshly built object that merely contains them.

**6. Putting a `set` call directly in the render body instead of in an effect or handler**

```tsx
function Bad() {
  const [count, setCount] = useState(0);
  setCount(count + 1);   // ❌ infinite loop — this isn't an effect, it just runs on every render
  return <p>{count}</p>;
}
```

This isn't really an "effects" mistake so much as a reminder of [chapter 08](../08-state/notes.md)'s rule: state only gets set from an event handler or from inside an effect's function — never from the plain body of a component.

**7. Assuming the effect runs *during* the render, not after**

Because effects run after the DOM is updated, anything that reads real layout information (an element's actual rendered width, say) works correctly inside an effect but would read stale or wrong values if you tried to read it during the render itself.

## Quick recap

- `useEffect(fn, deps)` runs `fn` after React commits the render, whenever a value in `deps` has changed since the last render. An empty array means "once, after the first render." No array at all means "every render."
- Effects are for synchronising with things **outside React**: the browser, timers, storage, servers, third-party widgets. If you're only working with values already inside your component, you probably want to calculate them during render instead.
- Every reactive value the effect's function reads belongs in the dependency array — leaving one out gives you a stale closure.
- Return a **cleanup function** from an effect that starts anything ongoing (a timer, a listener, a subscription). It runs before the effect re-runs, and when the component is removed.
- Fetching inside an effect needs a guard against race conditions — a stale response from an earlier render arriving after a newer one.
- **"Can I just calculate this during render?" is the single most useful question to ask before reaching for `useEffect`.**
- StrictMode runs effect → cleanup → effect once in development, specifically to catch cleanup that doesn't properly undo the effect.

---

**Next:** try the [exercises](exercises.md), then move on to [18 Fetching Data](../18-fetching-data/notes.md).
