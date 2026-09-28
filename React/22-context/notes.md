# 22 Context

## What is it?

**Context** lets a component hand a value to everything inside it, however deep, without passing it through every layer as props.

```tsx
const ThemeContext = createContext<Theme>("light");

// high up
<ThemeContext value="dark">
  <Page />
</ThemeContext>

// anywhere inside, however deep
const theme = useContext(ThemeContext);
```

Three pieces, every time: **create** the context, **provide** a value somewhere up the tree, **read** it somewhere below.

## Why does it matter?

Props flow down one layer at a time. That's been fine so far, because your trees have been shallow. Here's what happens when they aren't:

```tsx
function App() {
  const [theme, setTheme] = useState<Theme>("light");
  return <Page theme={theme} onThemeChange={setTheme} />;
}

function Page({ theme, onThemeChange }: PageProps) {
  return <Sidebar theme={theme} onThemeChange={onThemeChange} />;   // doesn't use them
}

function Sidebar({ theme, onThemeChange }: SidebarProps) {
  return <SettingsPanel theme={theme} onThemeChange={onThemeChange} />;   // doesn't use them either
}

function SettingsPanel({ theme, onThemeChange }: SettingsPanelProps) {
  return <ThemeToggle theme={theme} onThemeChange={onThemeChange} />;   // nor this one
}

function ThemeToggle({ theme, onThemeChange }: ThemeToggleProps) {
  return <button onClick={() => onThemeChange(theme === "light" ? "dark" : "light")}>...</button>;
}
```

`Page`, `Sidebar` and `SettingsPanel` don't care about the theme at all. They're couriers, carrying a parcel they'll never open, and they pay for it:

- **Four props types** mention `theme` and `onThemeChange`, three of them pointlessly.
- **Adding a fifth thing** the toggle needs means editing all four components again.
- **Reusing `Sidebar` elsewhere** now requires supplying a theme, even in a context that has no theming.

This is called **prop drilling**, and you've already felt a mild version of it — in [chapter 21](../21-project-recipe-finder/notes.md), `onToggleFavourite` went from `App` through `RecipeGrid` to `RecipeCard`, and `RecipeGrid` did nothing with it but pass it along. One layer is fine. Four is not.

Context skips the couriers entirely.

## Real-world example

Think about how a building supplies **water** versus **parcels**.

| Parcels | Water |
|---|---|
| Handed person to person, floor by floor | Piped to the whole building at once |
| Everyone in the chain must handle it, even if it's not theirs | Only the taps that are turned on actually use it |
| That's **props** | That's **context** |
| Add a new parcel, and everyone in the chain changes what they carry | Add a tap anywhere, and it just works |
| You can see exactly where anything came from | Harder to trace where a value was set |

That last row is the real trade-off, and it's why context isn't simply "better than props." A parcel's route is visible in the code; a value from context arrives from somewhere unstated. Use pipes for the things genuinely wanted everywhere — water, electricity, the theme, the logged-in user. Keep handing parcels directly for everything else.

## How it works

### Step 1: create the context

```tsx
// ThemeContext.ts
import { createContext } from "react";

export type Theme = "light" | "dark";

export const ThemeContext = createContext<Theme>("light");
```

`createContext` takes a **default value**, used only when a component reads the context with no provider above it. The type argument says what kind of value this context carries.

Put each context in its own file. It'll be imported by both the provider and every reader, and a separate file keeps those imports from tangling.

### Step 2: provide a value

Wrap the part of the tree that should see the value:

```tsx
function App() {
  const [theme, setTheme] = useState<Theme>("light");

  return (
    <ThemeContext value={theme}>
      <Page />
    </ThemeContext>
  );
}
```

Everything inside those tags — `Page`, and everything `Page` renders, all the way down — can now read `theme`. Nothing outside them can.

> **React 19 note:** rendering the context itself as the wrapper, `<ThemeContext value={...}>`, is new in React 19. Before that you had to write `<ThemeContext.Provider value={...}>`, which you'll see in most existing code and older tutorials. Both work in React 19; the shorter one is the one to write from now on.

### Step 3: read it

```tsx
import { useContext } from "react";

function ThemeToggle() {
  const theme = useContext(ThemeContext);

  return <button className={theme}>Current theme: {theme}</button>;
}
```

`useContext` is a hook, so the [rules from chapter 08](../08-state/notes.md) apply — top level, never conditional. It finds the **nearest** provider above this component in the tree and returns its value. If there isn't one, it returns the default from `createContext`.

And `ThemeToggle` can now be moved anywhere in the tree below the provider, and it'll keep working with no prop changes anywhere.

### Passing a setter too

A value on its own is read-only. To let components *change* it, put the setter in the context as well — which means the context value becomes an object:

```tsx
// ThemeContext.ts
export type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);
```

Notice the type is now `ThemeContextValue | null`, with `null` as the default. That's deliberate, and the next section explains why.

### The null default, and the custom hook that goes with it

What default value should `createContext` get for something like a theme *and* its setter? There isn't a sensible one — a fake setter that does nothing would silently swallow every update, which is far worse than an error.

So the honest default is `null`, paired with a small custom hook that turns "no provider" into a clear, immediate crash:

```tsx
// ThemeContext.ts
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (context === null) {
    throw new Error("useTheme must be used inside a ThemeProvider");
  }

  return context;
}
```

This small function earns its place three times over:

- **TypeScript.** `useContext(ThemeContext)` is typed `ThemeContextValue | null`, so every component reading it would need its own `if (context === null)` check. `useTheme` does that once, and returns a plain, non-null `ThemeContextValue`.
- **The error message.** Without it, forgetting the provider gives you `Cannot read properties of null (reading 'theme')` somewhere deep in a component. With it, you get a sentence telling you exactly what's wrong.
- **It's the public front door.** Components import `useTheme`, not `ThemeContext` — so you can change how the context works internally without touching them.

This custom-hook-per-context pattern is standard in real React codebases. Write it every time; it's six lines.

### Bundling it up: a provider component

The last piece is wrapping the state and the provider together, so `App` doesn't have to know how theming works:

```tsx
// ThemeProvider.tsx
import { useState, type ReactNode } from "react";
import { ThemeContext, type Theme } from "./ThemeContext.ts";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  return (
    <ThemeContext value={{ theme, setTheme }}>
      {children}
    </ThemeContext>
  );
}
```

```tsx
function App() {
  return (
    <ThemeProvider>
      <Page />
    </ThemeProvider>
  );
}
```

That's the whole pattern, and it's worth recognising the shape, because you'll meet it constantly in libraries: the state lives inside the provider, `children` ([chapter 04](../04-props/notes.md)) lets it wrap anything, and consumers use a custom hook. Everything a feature needs is in two files, and `App` just switches it on.

### Context doesn't replace state — it moves it

A common misreading: "context is for global state." It isn't. **Context is a delivery mechanism, not a storage mechanism.** The state is still ordinary `useState`, living in an ordinary component. Context only changes *who can see it* without being handed it.

That means everything you know still applies:

- Changing the value means calling the setter, which re-renders the provider.
- All the copying rules from [chapter 11](../11-updating-objects-and-arrays/notes.md) apply to state held in a provider.
- If the value is derivable, derive it — don't put it in the context.

### When context is the wrong tool

Reach for it less often than you'd think. Try these first:

**1. Lift state up ([chapter 13](../13-lifting-state-up/notes.md)).** If the components that need the value are one or two layers apart, props are simpler and easier to trace. Prop drilling only becomes a real problem at three or more layers of pure pass-through.

**2. Pass JSX down instead.** Often the "drilling" disappears entirely if the parent builds the element itself and passes it as `children`:

```tsx
// Instead of Layout drilling `user` down to Header...
<Layout>
  <Header user={user} />
</Layout>
```

`Layout` now knows nothing about `user` — it just renders whatever it's given. This solves a surprising share of prop-drilling problems, costs nothing, and keeps the data flow visible. Try it before you reach for context.

**Good candidates for context**, on the other hand, are values that are genuinely ambient — wanted almost anywhere, rarely changing:

- the current theme
- the logged-in user
- the chosen language
- a shopping cart, in an app where almost every page can add to it

### Every consumer re-renders when the value changes

The one performance fact worth knowing now: when a provider's `value` changes, **every component reading that context re-renders**, however deep, whether or not it uses the part that changed.

That makes this a genuine trap:

```tsx
<ThemeContext value={{ theme, setTheme }}>   // ⚠️ a brand-new object every render
```

That object literal is rebuilt on every render of the provider — a new reference each time ([chapter 11](../11-updating-objects-and-arrays/notes.md)) — so React concludes the value changed, and re-renders every consumer, even when `theme` is identical to last time.

For a theme that changes rarely, in a small app, this genuinely doesn't matter and you should not worry about it. When it does matter, the fix is `useMemo`, which is [chapter 27](../27-performance/notes.md):

```tsx
const value = useMemo(() => ({ theme, setTheme }), [theme]);

return <ThemeContext value={value}>{children}</ThemeContext>;
```

Know the trap exists; don't optimise for it until something is actually slow.

### Several contexts, not one big one

It's tempting to put everything in one `AppContext`. Don't — because of the rule above, a component that only reads the theme would re-render every time the cart changed.

```tsx
<ThemeProvider>
  <AuthProvider>
    <CartProvider>
      <App />
    </CartProvider>
  </AuthProvider>
</ThemeProvider>
```

Nesting providers like this is normal and completely fine. Split by **what changes together**: things that update at the same time, for the same reason, belong in one context.

### Reading context conditionally with `use`

React 19 added `use`, which reads a context and — unlike `useContext` — *is* allowed inside a condition:

```tsx
import { use } from "react";

function Panel({ showTheme }: { showTheme: boolean }) {
  if (showTheme) {
    const theme = use(ThemeContext);   // legal, unlike useContext
    return <p>{theme}</p>;
  }
  return null;
}
```

Worth knowing it exists, because you'll see it. `useContext` remains completely standard and is what this course uses — reach for `use` only when you genuinely need the conditional read.

## Common mistakes

**1. Reading a context with no provider above it**

```tsx
function App() {
  return <ThemeToggle />;   // ❌ no ThemeProvider anywhere
}
```

You silently get the default from `createContext`, which is usually wrong and sometimes `null`, producing a confusing crash deep inside a component. The `useTheme` guard hook turns this into a clear error message instead.

**2. Skipping the custom hook and the `null` default**

```tsx
const ThemeContext = createContext<ThemeContextValue>({ theme: "light", setTheme: () => {} });
```

That fake `setTheme` does nothing at all. A component used outside a provider now *appears* to work, silently ignoring every click. `null` plus a guard hook fails loudly, which is what you want.

**3. Putting everything in one context**

One `AppContext` holding theme, user, cart and settings means every consumer re-renders whenever any of them changes. Split by what changes together.

**4. Using context where lifting state up would do**

Two components one layer apart do not need context. It's more machinery, and it hides where the value came from. Props are the default; context is the exception.

**5. Creating the value object inline without thinking about it**

```tsx
<ThemeContext value={{ theme, setTheme }}>
```

A new object every render, so every consumer re-renders every time. Fine in a small app, worth `useMemo` in a big one — but know that it's happening.

**6. Treating context as a state manager**

Context doesn't store anything. It delivers a value from a `useState` (or a `useReducer`, [chapter 23](../23-use-reducer/notes.md)) that still lives in an ordinary component.

## Quick recap

- Context delivers a value to everything below a provider, skipping the components in between — the fix for **prop drilling** through layers that don't care.
- Three steps: `createContext` (in its own file), wrap with `<MyContext value={...}>`, read with `useContext`.
- Default the context to `null` and export a **custom hook that throws** when there's no provider. It handles the TypeScript narrowing and gives a real error message.
- Bundle the state and the provider into one `Provider` component taking `children`. That's the shape every library uses.
- Context is **delivery, not storage.** The state is still ordinary `useState` in an ordinary component.
- Try **lifting state up** and **passing JSX as `children`** first. Context is for genuinely ambient values: theme, current user, language.
- Every consumer re-renders when the value changes, so split contexts by what changes together — and know that an inline `value={{ ... }}` object is a new reference every render.

---

**Next:** try the [exercises](exercises.md), then move on to [23 useReducer](../23-use-reducer/notes.md).
