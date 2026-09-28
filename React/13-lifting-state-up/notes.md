# 13 Lifting State Up

## What is it?

**Lifting state up** means moving a piece of state out of the component that uses it, and into the nearest component that's a parent of everyone who needs it.

```tsx
// Before: two components, each with their own state, unable to talk to each other
function Celsius() {
  const [value, setValue] = useState(0);
  // ...
}
function Fahrenheit() {
  const [value, setValue] = useState(32);
  // ...
}

// After: one piece of state, in the parent, passed down to both
function TemperatureConverter() {
  const [celsius, setCelsius] = useState(0);
  return (
    <>
      <CelsiusInput value={celsius} onChange={setCelsius} />
      <FahrenheitInput value={celsius} onChange={(f) => setCelsius(toCelsius(f))} />
    </>
  );
}
```

You already know every individual piece of this — state, props, and callback props are all from earlier chapters. This chapter is about the *decision*: when two components need to agree on something, where does that something live?

## Why does it matter?

[Chapter 08](../08-state/notes.md) said each component's state is its own, private and separate — two `<Counter />`s never mix up their numbers. That's usually exactly what you want. But sometimes it's the problem.

Picture a filter box and a results list, sitting next to each other:

```tsx
function SearchBox() {
  const [query, setQuery] = useState("");
  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}

function ResultsList() {
  // needs `query` to know what to show... but it has no way to get it
}
```

`SearchBox` knows what was typed. `ResultsList` needs to know what was typed. They're siblings — neither is inside the other — so there's no prop that could carry it from one to the other. Props only flow **down** ([chapter 04](../04-props/notes.md)), and these two aren't on the same branch.

The fix isn't a new React feature. It's a design move: pull `query` out of `SearchBox` entirely, put it in whatever component contains both of them, and hand it down to each as props. Once it lives in one place, both children can read it, and one of them can change it. This is the single most common structural decision you'll make in a React app, and getting it right early saves you from a much messier fix later.

## Real-world example

Think about a **shared calendar** at work versus everyone keeping their own diary.

| Everyone keeps their own diary | A shared calendar |
|---|---|
| Each `<Counter />`, private and separate | Each component with its own `useState` |
| You book a meeting in your diary | A component changes its own local state |
| Your colleague has no way to see it | A sibling component has no way to see it |
| Move the booking to the shared calendar | Lift the state up to the common parent |
| Everyone reads the same calendar | Every child reads the same prop |
| Whoever's allowed edits the shared calendar | Whoever's allowed calls the setter, passed down as a prop |

The calendar has to live somewhere everyone involved can see it. Not on your desk, not on theirs — on the wall, above both of you.

## How it works

### Spot the symptom first

You don't lift state pre-emptively. You start with state wherever feels natural, usually in the component that first needs it, and you lift it only when you hit the actual symptom: **two components that aren't in a parent-child relationship both need to see or change the same value.**

```tsx
function App() {
  return (
    <>
      <SearchBox />
      <ResultsList />
    </>
  );
}
```

`SearchBox` and `ResultsList` are siblings. Neither can hand the other anything directly. The fix has three steps.

### Step 1: find the closest common parent

Walk up the tree from both components until you find the first one that contains both. Here, that's `App`. It doesn't have to be the very top of your app — just the nearest point where both branches meet.

### Step 2: move the state there

```tsx
function App() {
  const [query, setQuery] = useState("");

  return (
    <>
      <SearchBox query={query} onQueryChange={setQuery} />
      <ResultsList query={query} />
    </>
  );
}
```

`App` now owns `query`. `SearchBox` no longer has a `useState` of its own for it at all — it takes the value and a way to change it, as props.

### Step 3: make each child use the props instead of its own state

```tsx
type SearchBoxProps = {
  query: string;
  onQueryChange: (query: string) => void;
};

function SearchBox({ query, onQueryChange }: SearchBoxProps) {
  return (
    <input
      value={query}
      onChange={(event) => onQueryChange(event.target.value)}
    />
  );
}

type ResultsListProps = {
  query: string;
};

function ResultsList({ query }: ResultsListProps) {
  const results = allItems.filter((item) => item.name.includes(query));
  return (
    <ul>
      {results.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}
```

Notice `SearchBox`'s input is now a **controlled input** whose truth lives one level up ([chapter 09](../09-forms/notes.md) controlled it from inside its own component; here it's controlled from outside). The pattern is identical — `value` reads from a single source of truth, `onChange` asks for a change — it's just that the source of truth has moved.

### The general recipe

1. Identify the state that needs to be shared.
2. Find the closest common parent of every component that touches it.
3. Move the `useState` call there.
4. Pass the **value** down to whoever needs to display it.
5. Pass a **function** down to whoever needs to change it.

Steps 4 and 5 are exactly the "state down, events up" shape from [chapter 07](../07-events/notes.md) and [chapter 08](../08-state/notes.md). Lifting state up doesn't introduce a new pattern — it's an application of the one you already know, used to connect siblings instead of a single parent and child.

### A worked example: the temperature converter

This is a classic example because both fields are genuinely the *same* value, just displayed two different ways, which makes the "who owns the truth" question unavoidable.

```tsx
function celsiusToFahrenheit(c: number): number {
  return (c * 9) / 5 + 32;
}

function fahrenheitToCelsius(f: number): number {
  return ((f - 32) * 5) / 9;
}

type TemperatureInputProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
};

function TemperatureInput({ label, value, onChange }: TemperatureInputProps) {
  return (
    <label>
      {label}:
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function TemperatureConverter() {
  const [celsius, setCelsius] = useState(0);

  return (
    <>
      <TemperatureInput
        label="Celsius"
        value={celsius}
        onChange={setCelsius}
      />
      <TemperatureInput
        label="Fahrenheit"
        value={celsiusToFahrenheit(celsius)}
        onChange={(f) => setCelsius(fahrenheitToCelsius(f))}
      />
    </>
  );
}
```

There's exactly **one** number in state: `celsius`. The Fahrenheit box doesn't have its own state at all — its `value` is *derived* from `celsius` on every render, and typing in it converts back to Celsius before calling `setCelsius`.

This is worth sitting with, because the tempting-but-wrong version has **two** `useState` calls, one per box, kept "in sync" with a manual conversion every time either one changes. That version can drift — a rounding step missed on one side, an update applied to one box but not the other — and it's more code besides. One piece of state, with the other value derived, **cannot** drift, because there's nothing to keep in sync. It's the same "don't store what you can calculate" principle from [chapter 08](../08-state/notes.md), now applied across two components instead of inside one.

### Sharing selection between a list and a detail view

Another extremely common shape: click an item in a list, see its details somewhere else on the page.

```tsx
type Product = {
  id: string;
  name: string;
  price: number;
};

function ProductPage({ products }: { products: Product[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = products.find((product) => product.id === selectedId) ?? null;

  return (
    <div className="layout">
      <ProductList
        products={products}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
      <ProductDetails product={selected} />
    </div>
  );
}
```

`selectedId` lives in `ProductPage`, above both the list and the detail view. `ProductList` highlights whichever id matches, and calls `onSelect` when you click one. `ProductDetails` gets handed the whole matching product, already looked up — it never needs to know about ids or the full list at all. That's worth noticing: `ProductPage` did the `find`, so `ProductDetails`'s job stays simple, which is the same idea from [chapter 04](../04-props/notes.md) about giving a component the least it needs to do its job.

### You're not always lifting to the very top

A common overcorrection is dragging every piece of shared state all the way up to `App`, "just in case." Don't. Lift it only as far as the **nearest** component that contains everyone who needs it.

```
App
└── Dashboard
    ├── Sidebar (doesn't care about the search)
    └── SearchPanel
        ├── SearchBox    <- needs `query`
        └── ResultsList  <- needs `query`
```

Here, `query` belongs in `SearchPanel`, not `Dashboard` and definitely not `App`. `Sidebar` never touches it, and giving `App` a `query` it does nothing with just makes `App` bigger and forces every re-render of `query` to start further up the tree than it needs to. Put state as low as it can go while still being visible to everyone who needs it.

### Lifting state you already have

Often you're not designing from scratch — you're noticing a component you already wrote needs a sibling to see its state. The mechanical steps are the same:

1. Cut the `useState` line out of the child.
2. Paste it into the parent.
3. Add props to the child for the value and, if the child changes it, a callback.
4. Replace every place the child used its own setter with a call to the callback prop.
5. Fix the types: the child's props type gains the value and the callback.

TypeScript is genuinely useful here — once you delete the `useState` line, every place the old setter was used lights up red, and that list is your checklist for step 4.

### When *not* to lift

If only one component ever needs a piece of state, leave it exactly where it is. In [chapter 10](../10-project-todo-app/notes.md)'s to-do app, the half-typed text in `AddTaskForm` stayed local — nothing else needed to know about a task before it was submitted. Lifting things that don't need to be shared just makes the parent bigger and forces it to re-render for changes it doesn't actually care about. "Shared state lives with the nearest common owner" cuts both ways: state with only one owner stays exactly where it is.

## Common mistakes

**1. Two `useState`s trying to stay "in sync"**

```tsx
const [celsius, setCelsius] = useState(0);
const [fahrenheit, setFahrenheit] = useState(32);

function handleCelsiusChange(c: number) {
  setCelsius(c);
  setFahrenheit(celsiusToFahrenheit(c));   // easy to forget, easy to get wrong
}
```

If two values are really one fact shown two ways, store the fact once and derive the rest. Two states that must be kept in sync by hand will eventually go out of sync.

**2. Lifting state all the way to the root, out of habit**

Every re-render of that state now starts higher up the tree than necessary, and components that don't care about it end up receiving it anyway. Lift only as far as the nearest shared parent.

**3. Forgetting to remove the old `useState` from the child**

```tsx
function CelsiusInput({ value, onChange }: Props) {
  const [value, setValue] = useState(0);   // ❌ shadows the prop, and does nothing useful
```

TypeScript will actually stop you here with a duplicate-name error, which is a helpful nudge — but the intent-level mistake is leaving orphaned local state around that no longer does anything, because the prop already provides the real value.

**4. Passing the setter down directly when a conversion is needed**

```tsx
<TemperatureInput value={fahrenheit} onChange={setCelsius} />   // ❌ sets Celsius to a Fahrenheit number!
```

If the child's value is a *transformed* view of the shared state, its `onChange` needs to transform back before calling the setter: `onChange={(f) => setCelsius(fahrenheitToCelsius(f))}`.

**5. Reaching for Context before trying this**

For two or three components close together in the tree, lifting state up is simpler than [Context](../22-context/notes.md) and doesn't need a new concept. Context earns its place when props would have to pass through many layers that don't care about the value — that's [chapter 22](../22-context/notes.md).

## Quick recap

- When two components that aren't parent and child both need the same value, move the state to their **closest common parent** and pass it down as props.
- The recipe is always the same: state down as a **value**, a **function** passed down to request changes — the pattern from chapters 07 and 08, now connecting siblings.
- If two displayed values are really the same underlying fact, store it **once** and derive the other from it. Don't keep two states in sync by hand.
- Lift state only as **high** as it needs to go — to the nearest shared parent, not automatically to the root — and only when it's genuinely shared. State only one component needs stays local.
- This is a design decision, not a new API. Every tool involved — `useState`, props, callback props — you already had.

---

**Next:** try the [exercises](exercises.md), then move on to [14 Thinking in React](../14-thinking-in-react/notes.md).
