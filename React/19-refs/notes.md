# 19 Refs

## What is it?

A **ref** is a component's memory for a value that doesn't need to redraw the page when it changes.

```tsx
import { useRef } from "react";

const countRef = useRef(0);

countRef.current = countRef.current + 1;   // changes it — no re-render
console.log(countRef.current);              // reads it
```

Refs also have a second, very common job: **reaching a real DOM element** directly, for the handful of things JSX can't express — focusing an input, measuring an element's size, playing a video.

```tsx
const inputRef = useRef<HTMLInputElement>(null);

<input ref={inputRef} />;

inputRef.current?.focus();
```

## Why does it matter?

[Chapter 08](../08-state/notes.md) gave you `useState`: a value that survives re-renders, and tells React to redraw when it changes. That second part — "tells React to redraw" — is exactly right for anything shown on the page. It's the wrong tool for anything that **isn't**.

You met this gap by accident back in [chapter 12](../12-how-rendering-works/notes.md)'s exercises: a render counter built with `useState` causes an infinite loop, because *counting renders* would itself trigger another render, forever. A ref sidesteps that completely — it remembers a value across renders, exactly like state, but changing it is invisible to React, so it never causes a re-render of its own.

The other half of this chapter — reaching real DOM elements — fills a gap you've felt since [chapter 09](../09-forms/notes.md)'s stretch goal: making a newly created input receive focus automatically. `autoFocus` covered the simple case. Refs are the general tool underneath it, and the only way to do the many things JSX simply has no prop for.

## Real-world example

Think about a **car's odometer** versus its **speedometer**.

| Speedometer | Odometer |
|---|---|
| Shows the current speed, right now, on the dashboard | Quietly counts total miles, in the background |
| The driver looks at it constantly — it's meant to be seen | Almost nobody watches it tick over in real time |
| It's meant to be seen | It just needs to be *right* when you eventually check it |
| That's `useState`: redraw the dashboard when it changes | That's `useRef`: keep a number correct without redrawing anything |

A dashboard that flashed and redrew itself every time a tenth of a mile ticked over on the odometer would be exhausting to look at. Some values genuinely don't need an audience for every change — they just need to be remembered correctly for later.

## How it works

### `useRef`

```tsx
const ref = useRef(initialValue);
```

`useRef` gives back **one object**, always the same object across every render of this component, with exactly one property: `.current`. Read it, write it, however you like:

```tsx
function ClickLogger() {
  const clickCount = useRef(0);

  function handleClick() {
    clickCount.current = clickCount.current + 1;
    console.log(`Clicked ${clickCount.current} times`);
  }

  return <button onClick={handleClick}>Click me (check the Console)</button>;
}
```

Click it ten times: the Console counts up correctly, `1` through `10`. But the button's own text never mentions the count, because nothing here ever told React to re-render. That's the whole trade a ref makes: it remembers reliably, but changing it is invisible to React.

### Refs vs. state, side by side

| | `useState` | `useRef` |
|---|---|---|
| Survives re-renders? | Yes | Yes |
| Changing it causes a re-render? | Yes | **No** |
| Read/write it during render? | Read yes, change no (chapter 08) | Reading or writing during render is unsafe — see below |
| Read/write it in a handler or effect? | Yes | Yes |
| Shows up in React DevTools | Yes, under **hooks** | No |

The middle row is the one to remember. State is for **anything the user should see change**. A ref is for **anything your code needs to remember, but the page doesn't need to reflect**.

### What belongs in a ref

A short, genuinely useful list:

- **A timer or interval id**, so you can clear it later — `setInterval`'s return value has no reason to trigger a re-render just by existing.
- **The previous value of a prop or state**, to compare against the current one.
- **A count of something that doesn't drive the UI** — how many times an effect has run, for debugging.
- **A flag for "is this the first render?"**, used to skip an effect's logic the first time.
- **A real DOM element**, covered in the rest of this chapter.
- **A mutable value inside an event handler that needs to survive between calls**, without needing to show anywhere.

If you're ever unsure, ask the question from [chapter 08](../08-state/notes.md), reframed: **does the page need to visibly change when this value changes?** Yes → state. No → a ref is very likely the better fit.

### Don't read or write a ref during render

```tsx
function Bad() {
  const renderCount = useRef(0);
  renderCount.current = renderCount.current + 1;   // ⚠️ works, but it's fragile
  return <p>Rendered {renderCount.current} times</p>;
}
```

This *happens* to work in simple cases, and you actually built exactly this in [chapter 12's exercises](../12-how-rendering-works/exercises.md) as a debugging tool. But it quietly breaks React's assumption that rendering is pure ([chapter 03](../03-components/notes.md), [chapter 12](../12-how-rendering-works/notes.md)): a value changing during render, invisibly, with no corresponding re-render to reflect it, is exactly the kind of side effect React's `<StrictMode>` double-render is designed to catch problems from. It's fine for an internal debugging counter you're not relying on for correctness. For anything that actually matters, set a ref's value inside an **event handler** or an **effect**, never in the plain body of the component.

### Reaching a real DOM element

This is the other major use of refs, and it's what most people mean when they first hear the word "ref" in React. Pass a ref to an element's `ref` attribute, and after that element is actually on the page, `ref.current` points at the real DOM node:

```tsx
import { useRef } from "react";

function SearchBox() {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFocusClick() {
    inputRef.current?.focus();
  }

  return (
    <div>
      <input ref={inputRef} type="text" />
      <button onClick={handleFocusClick}>Focus the box</button>
    </div>
  );
}
```

Two typing details worth being deliberate about:

- **`useRef<HTMLInputElement>(null)`** — the type argument says what kind of element this ref will eventually hold, and the starting value is `null`, because before the component's first render finishes, there's no element yet to point at.
- **`inputRef.current?.focus()`** — the `?.` matters. TypeScript correctly knows `.current` might still be `null` (if this ran before the element mounted, or after it's gone), so it makes you handle that case, same as any other optional value ([TypeScript chapter 06](../../TypeScript/06-unions-and-narrowing/notes.md)).

React sets `ref.current` to the real element right after that render commits, and sets it back to `null` when the element is removed from the page. You never assign to `.current` yourself for a DOM ref — React manages it for you; you only ever *read* it.

### What you'd genuinely need this for

Everything in this section is something JSX has no prop for, which is exactly why a ref, not a prop, is the right tool:

```tsx
// Focus an input
inputRef.current?.focus();

// Select all the text in it
inputRef.current?.select();

// Scroll an element into view
sectionRef.current?.scrollIntoView({ behavior: "smooth" });

// Read an element's actual rendered size
const width = boxRef.current?.getBoundingClientRect().width;

// Play or pause a video
videoRef.current?.play();
```

None of these are things you *describe* the way you describe a heading's text or a button's colour. They're actions you *do*, to an element that already exists on the page — which is precisely the gap between React's declarative model ([chapter 01](../01-getting-started/notes.md)) and the handful of imperative things the browser occasionally requires.

### The "autofocus a new field" problem, properly

[Chapter 09's stretch goals](../09-forms/exercises.md) used `autoFocus` to put the cursor in a newly created task's edit box. That attribute is a real, simple, and completely valid tool — but it only fires once, when the element is first created, and it can't be triggered again later, say by a button click on an element that already exists. A ref can:

```tsx
function EditableField() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  function startEditing() {
    setIsEditing(true);
  }

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  return isEditing ? (
    <input ref={inputRef} />
  ) : (
    <button onClick={startEditing}>Edit</button>
  );
}
```

Notice the focus call lives in an **effect**, not directly inside `startEditing`. That's deliberate: when `startEditing` runs, `isEditing` is `false` and the `<input>` doesn't exist in the DOM yet — this render hasn't happened. The effect runs *after* the render that actually puts the `<input>` on the page, which is the first moment `inputRef.current` is genuinely something you can call `.focus()` on.

### Refs don't reset when their component re-renders

Unlike a plain variable inside the component (which gets recreated every render, [chapter 12](../12-how-rendering-works/notes.md)), the ref object itself is the **same object** across every render of a given component instance — only `.current` changes, and only when you or React changes it. This is what makes it suitable for things like "remember the previous value":

```tsx
function PriceTicker({ price }: { price: number }) {
  const previousPrice = useRef(price);

  const direction = price > previousPrice.current ? "up" : price < previousPrice.current ? "down" : "same";

  useEffect(() => {
    previousPrice.current = price;
  });

  return <p>${price} ({direction})</p>;
}
```

The effect (with no dependency array, so it runs after every render) updates the stored "previous" value *after* the current render has already used it for comparison — so during any given render, `previousPrice.current` genuinely holds last render's value, not this one's.

### Refs on your own components (React 19)

Passing `ref` to your **own** component, not a built-in HTML tag, needs one extra step, because your component has to decide what that ref should actually point at.

Since **React 19**, this is straightforward: a function component can simply accept `ref` as an ordinary prop, alongside its other props, no special wrapper needed:

```tsx
type FancyInputProps = {
  placeholder: string;
  ref?: React.Ref<HTMLInputElement>;
};

function FancyInput({ placeholder, ref }: FancyInputProps) {
  return <input ref={ref} placeholder={placeholder} className="fancy" />;
}
```

```tsx
const inputRef = useRef<HTMLInputElement>(null);

<FancyInput ref={inputRef} placeholder="Search..." />;
```

`FancyInput` receives the ref like any other prop, and hands it straight to the real `<input>` inside. Whoever uses `<FancyInput ref={inputRef} />` ends up with `inputRef.current` pointing at the actual `<input>` element, right through the wrapper.

**If you read older tutorials or work in an older codebase**, you'll see this done with `forwardRef`:

```tsx
const FancyInput = forwardRef<HTMLInputElement, { placeholder: string }>(
  function FancyInput({ placeholder }, ref) {
    return <input ref={ref} placeholder={placeholder} className="fancy" />;
  }
);
```

That was necessary before React 19, when `ref` couldn't be received as a normal prop on a function component at all. It still works in React 19 for backwards compatibility, but new code doesn't need it — plain props are simpler to read and simpler to type. Recognise `forwardRef` on sight; write the plain-props version yourself.

### Refs and TypeScript's built-in element types

Every real HTML element has a matching TypeScript type, and it's worth getting the specific one right, the same way [chapter 07](../07-events/notes.md) taught you to pick the right event type:

| Element | Ref type |
|---|---|
| `<input>` | `HTMLInputElement` |
| `<textarea>` | `HTMLTextAreaElement` |
| `<button>` | `HTMLButtonElement` |
| `<div>`, `<section>`, most containers | `HTMLDivElement`, `HTMLElement` |
| `<video>` | `HTMLVideoElement` |
| `<a>` | `HTMLAnchorElement` |

Get it wrong and TypeScript tells you plainly:

```tsx
const divRef = useRef<HTMLDivElement>(null);
<input ref={divRef} />
// ❌ Type 'RefObject<HTMLDivElement | null>' is not assignable to type 'Ref<HTMLInputElement> | undefined'.
```

## Common mistakes

**1. Using a ref for something the page needs to display**

```tsx
const countRef = useRef(0);
countRef.current = countRef.current + 1;
return <p>{countRef.current}</p>;   // never updates on screen after the first render
```

If it needs to be visible and reactive, it's state, not a ref. This is the single most common ref mistake — reaching for it out of habit once you've learned it exists, for something `useState` was always the right tool for.

**2. Reading `.current` before the element exists**

```tsx
const inputRef = useRef<HTMLInputElement>(null);
inputRef.current.focus();   // ❌ Object is possibly 'null'.
```

Use `?.`, or check `if (inputRef.current) { ... }` first. TypeScript is right to insist — on the very first render, before anything has mounted, `.current` really is `null`.

**3. Calling a DOM method directly inside the render body**

```tsx
function Bad() {
  const ref = useRef<HTMLInputElement>(null);
  ref.current?.focus();   // ❌ runs during render, before the element necessarily exists yet
  return <input ref={ref} />;
}
```

DOM refs are only safe to *use* after the render has committed — in an event handler, or in an effect.

**4. Calling `useRef()` with no argument**

```tsx
const ref = useRef<string>();
// ❌ Expected 1 arguments, but got 0.
```

In **React 19**, `useRef` requires a starting value. Plenty of older tutorials write `useRef<T>()` with empty brackets, because React 18's types allowed it. If what you want is "empty to begin with," say so explicitly: `useRef<string | undefined>(undefined)`.

**5. Expecting a ref change to be visible in DevTools**

Refs deliberately don't show up in the React DevTools **Components** tab the way state does, because React itself doesn't track them as part of a component's reactive data. If you need to see a value while debugging, `console.log` it, or temporarily use state instead.

**6. Passing `ref` to a component that doesn't accept it**

```tsx
function FancyInput({ placeholder }: { placeholder: string }) {   // no `ref` in props
  return <input placeholder={placeholder} />;
}

<FancyInput ref={inputRef} placeholder="Search..." />;
// ❌ ref does nothing — inputRef.current stays null
```

Add `ref?: React.Ref<HTMLInputElement>` to the component's props type, and pass it down to a real element inside, as shown above.

**7. Using the wrong element type for the ref**

Mismatching, say, `HTMLDivElement` against an actual `<input>` either produces a type error at the point you attach it, or — worse — compiles fine but gives you `.current` typed as the wrong element, so autocomplete offers methods that don't exist on the real node.

## Quick recap

- `useRef(initialValue)` gives back a stable object with one property, `.current`, that survives across renders. **Changing it never causes a re-render.**
- Use a ref for anything your code needs to remember that the page doesn't need to visibly reflect: timers, previous values, DOM elements. Use state for anything that should redraw the page.
- Attach a ref to a real element with `ref={myRef}`; after that element mounts, `myRef.current` points at it, typed to the specific element (`HTMLInputElement`, and so on).
- DOM refs are for the handful of imperative things JSX has no prop for — focus, selection, scrolling, measuring, media playback.
- Don't read or write a ref in the plain body of a component during render; do it in an event handler or an effect.
- Since **React 19**, a function component can accept `ref` as an ordinary prop and hand it to an inner element directly — `forwardRef` is no longer required for this, though you'll still see it in older code.

---

**Next:** try the [exercises](exercises.md), then move on to [20 Custom Hooks](../20-custom-hooks/notes.md).
