# 15 Styling

## What is it?

Four ways to put CSS on a React page, in the order this chapter covers them:

```tsx
import "./App.css";                       // 1. a plain, global CSS file
import styles from "./Card.module.css";    // 2. CSS Modules: scoped to one component

<div className="card">                     // 1 & 2: fixed class names
<div style={{ color: "tomato" }}>          // 3. inline styles, from chapter 02
<div className={isActive ? "tab active" : "tab"}>  // 4. classes that depend on state
```

You've used `className` and `style` since [chapter 02](../02-jsx/notes.md). This chapter is about organising real stylesheets, and the one genuinely new tool: **CSS Modules**.

## Why does it matter?

The [to-do app project](../10-project-todo-app/notes.md) came with one finished `index.css`, written for you, and it worked because it was the *only* stylesheet in the app. Real apps have dozens of components, often built by different people, and plain CSS has one property that makes that dangerous: **every class name is global**, no matter which file it's written in.

```css
/* Header.css */
.title { font-size: 24px; }

/* ProductCard.css */
.title { font-size: 14px; color: grey; }
```

Import both files into the same app, and whichever one loads second wins — for **every** `.title` on the page, in every component, everywhere. Nothing in the file names or the folder structure protects you. This is the exact problem [JavaScript chapter 29](../../JavaScript/29-modules/notes.md) solved for *variables* with modules; CSS Modules solve the same problem for *class names*.

## Real-world example

Think about **name tags at two different kinds of event**.

| A small meetup | A big conference with several tracks |
|---|---|
| Plain CSS, one shared stylesheet | Global styles: fine when there's not much overlap |
| Everyone writes their own name on a blank tag | Everyone picks their own class names |
| Two "Alex"es show up, and it's genuinely confusing | Two `.title` classes collide, and the wrong one wins |
| The big conference prints tags as "Alex — Room 4B12" | CSS Modules rename `.title` to `.title_a8f3k`, unique to that file |
| Nobody has to *agree* on names in advance | Nobody has to *agree* on names in advance |

The bigger the event, the more that automatic uniqueness is worth having.

## How it works

### Plain CSS files, imported

You've done this since [chapter 01](../01-getting-started/notes.md): Vite lets you `import` a `.css` file directly in a `.tsx` file, and it gets included in the page.

```tsx
// App.tsx
import "./App.css";

function App() {
  return <h1 className="title">Corner Café</h1>;
}
```

```css
/* App.css */
.title {
  font-size: 28px;
  color: #2b2b2b;
}
```

The import has **no local name** — `import "./App.css"` rather than `import styles from "./App.css"` — because you're not asking for anything back. You're telling Vite "include this stylesheet," and then you refer to the classes by their plain string names in `className`, same as HTML always worked.

This is exactly what you did in the to-do app, and it's completely fine for **one shared stylesheet for the whole app**: variables, resets, typography, and anything meant to apply everywhere. It's the wrong tool the moment two different components' styles need to stay out of each other's way.

### CSS Modules

Name a file `*.module.css`, and Vite treats it specially: instead of injecting the classes globally, it renames every class to something unique and gives you an object mapping your original names to the real ones.

```css
/* Card.module.css */
.card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
}

.title {
  font-size: 18px;
  font-weight: 600;
}
```

```tsx
// Card.tsx
import styles from "./Card.module.css";

function Card() {
  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Espresso</h2>
    </div>
  );
}
```

`styles` is a plain object: `{ card: "Card_card_a8f3k", title: "Card_title_x92lm" }` — Vite generates the real names for you, and they're guaranteed unique across your whole app, however many other files also have a class called `.title`. You never write the generated name yourself; you always go through `styles.something`.

**The import needs a name**, because this time you're genuinely using what comes back: `import styles from "./Card.module.css"`. Calling it `styles` is a strong convention, not a rule — you could call it anything, but everyone calls it `styles`, so do too.

### TypeScript and CSS Modules

Hover over `styles` in VS Code and you'll usually see `any` or `{ [key: string]: string }`, depending on your project's setup — Vite's TypeScript template includes a declaration file (often `vite-env.d.ts`) that tells TypeScript "any `*.module.css` import is an object of strings." That's enough to let you write `styles.card`, but it's not enough to catch a typo:

```tsx
<div className={styles.crad}>   // no error! "crad" just doesn't exist in the real CSS either
```

TypeScript can't see inside the actual CSS file to know which class names really exist, so a misspelled property silently becomes `undefined`, and `className={undefined}` just means no class is applied — no crash, no red squiggle, just a plain `<div>` that isn't styled the way you expected. Check the Elements tab in DevTools if a CSS Modules class seems to be doing nothing; that's usually why.

### When to use which

| Use | For |
|---|---|
| A plain, global `.css` file | App-wide resets, typography, CSS variables/theme colours, one file imported once near the root |
| CSS Modules | Anything specific to one component — a card, a button, a modal |
| Inline `style` | A value computed at runtime: a colour from data, a width from a percentage ([chapter 02](../02-jsx/notes.md)) |

Most real projects use the first two together: one small global stylesheet for the shared basics, and a `.module.css` file sitting right next to each component that needs its own styling. Put a component's module file next to its `.tsx` file with a matching name — `Card.tsx` and `Card.module.css` — so anyone opening the folder can see immediately which styles belong to which component.

### Conditional class names

You've built these by hand since [chapter 05](../05-conditional-rendering/notes.md):

```tsx
<li className={task.completed ? "task done" : "task"}>{task.text}</li>
```

For two classes it's fine. For three or four conditions, string-building gets messy fast:

```tsx
<button
  className={
    (isPrimary ? "btn btn-primary " : "btn ") +
    (isDisabled ? "btn-disabled " : "") +
    (size === "large" ? "btn-large" : "btn-small")
  }
>
```

Stray spaces, missing spaces, and forgotten classes are all easy to introduce in code like that. A small helper function tidies it up — this is a pattern you'll see called `clsx` or `classnames` when it comes from a library, but it's simple enough to write yourself:

```ts
function cx(...classes: (string | false | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
```

```tsx
<button
  className={cx(
    "btn",
    isPrimary && "btn-primary",
    isDisabled && "btn-disabled",
    size === "large" ? "btn-large" : "btn-small"
  )}
>
```

`isPrimary && "btn-primary"` gives you either the class name or `false` ([chapter 05](../05-conditional-rendering/notes.md) again), and `cx` filters the falsy ones out before joining what's left with spaces. `Boolean` used as a callback here is a handy trick — it's the same function you'd normally call as `Boolean(x)`, passed directly to `filter` so it keeps only truthy items.

With **CSS Modules**, the same idea, going through `styles`:

```tsx
<button className={cx(styles.btn, isPrimary && styles.primary, isDisabled && styles.disabled)}>
```

Popular real projects usually reach for the `clsx` package instead of writing `cx` themselves — it's a few lines, well-tested, and saves everyone reinventing it. This course keeps it hand-written here so you understand exactly what it's doing; swapping in the real package later is a one-line change.

### CSS variables for theming

You've already seen this pattern in the to-do app's stylesheet: CSS custom properties (variables), switched by a class or attribute on a parent element, work perfectly well with React and need nothing special:

```css
:root {
  --accent: #3d6fd8;
  --bg: #ffffff;
}

.app.dark {
  --accent: #6b95ec;
  --bg: #1b1f24;
}

.button {
  background: var(--accent);
}

body {
  background: var(--bg);
}
```

```tsx
<div className={isDark ? "app dark" : "app"}>
```

React doesn't need to know these variables exist. It's just toggling a class name, same as any other conditional class, and the browser's own CSS variable resolution does the rest. This is usually simpler than trying to manage a theme entirely through inline styles or JavaScript.

### Where global styles belong

Keep exactly one, small global stylesheet, imported once, high up — usually in `main.tsx`:

```tsx
import "./index.css";
```

Good candidates for it: a CSS reset (`* { box-sizing: border-box; }`), `body` defaults, your colour variables, and `@font-face` rules. Anything more specific than that belongs in a module next to the component it styles. A global stylesheet that grows into hundreds of unscoped class names is exactly the collision risk this chapter opened with, just moved one file later.

### A note on other approaches

You'll come across other ways to style React apps in tutorials and job listings: **CSS-in-JS** libraries (writing CSS inside your `.tsx` files, as template literals or objects, so the styles live right next to the component that uses them) and **Sass** (a CSS preprocessor with variables and nesting, predating CSS's own). Both were extremely popular for a few years. CSS Modules plus plain CSS variables — what this chapter teaches — cover the same ground with less machinery, and it's what this course uses throughout. [Chapter 16](../16-tailwind-css/notes.md), next, is a different, and currently very popular, philosophy again: skip writing custom CSS almost entirely.

## Common mistakes

**1. Two class names colliding across files**

```css
/* Header.css */          /* ProductCard.css */
.title { ... }            .title { ... }
```

Import both as plain CSS and only one wins, silently, for the whole app. Use CSS Modules for anything component-specific.

**2. Forgetting the import needs a name for modules**

```tsx
import "./Card.module.css";       // ❌ nothing to reference the classes by
import styles from "./Card.module.css";   // ✅
```

Without a name, you have no way to reach the generated class names at all.

**3. Writing the class name as a plain string with a module import**

```tsx
import styles from "./Card.module.css";

<div className="card">    // ❌ looks for a literal class called "card", which doesn't exist any more
```

The whole point of a module is that the real class name is something like `Card_card_a8f3k`. You always go through the object: `className={styles.card}`.

**4. A typo in a module property, with no warning**

```tsx
<div className={styles.crad}>   // undefined, className={undefined}, unstyled — no error anywhere
```

If a CSS Modules class isn't applying, check the property name against the actual CSS file. TypeScript's default setup for these files usually can't catch this for you.

**5. String-concatenating several conditional classes by hand**

```tsx
className={"btn " + (isPrimary ? "btn-primary" : "") + " " + (isDisabled ? "btn-disabled" : "")}
```

Easy to get wrong (stray or missing spaces), and hard to read. Use a small `cx` helper, or the `clsx` package.

**6. Putting component-specific styles in the one global stylesheet**

It works, but it's the exact collision risk this chapter exists to avoid, and it makes `index.css` grow forever. Give a component its own `.module.css` file next to it instead.

## Quick recap

- Plain CSS, imported with `import "./file.css"`, is **global**: every class name can collide with any other file's class of the same name. Keep it for a small, shared, app-wide stylesheet.
- **CSS Modules** (`*.module.css`, imported as `import styles from "./File.module.css"`) generate unique class names automatically, so component styles can never collide. Use them for anything specific to one component.
- Reach the real class names only through the imported object: `className={styles.card}`, never a plain string.
- TypeScript usually can't check that a `styles.something` property really exists in the CSS — a typo silently applies no class at all.
- Build conditional class names with `&&` inside a small `cx` helper (or the `clsx` package) rather than concatenating strings by hand.
- Inline `style`, from [chapter 02](../02-jsx/notes.md), is still the right tool for values computed at runtime. CSS variables, switched by a class name, are a clean way to handle themes without JavaScript doing the colour math.

---

**Next:** try the [exercises](exercises.md), then move on to [16 Tailwind CSS](../16-tailwind-css/notes.md).
