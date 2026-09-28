# 16 Tailwind CSS

## What is it?

**Tailwind CSS** is a library that gives you hundreds of small, ready-made CSS classes, applied straight in your JSX, instead of writing your own CSS rules:

```tsx
<button className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">
  Save
</button>
```

Every class does one small job — `px-4` is padding on the left and right, `bg-blue-600` is a background colour. You build up a design by combining a lot of them, right there on the element, rather than switching to a `.css` file.

This course is written for **Tailwind CSS v4**.

## Why does it matter?

In [chapter 15](../15-styling/notes.md), styling a button meant naming a class, writing its rule in a `.module.css` file, and switching between two files every time you tweaked anything. That's completely reasonable, and plenty of real teams work exactly that way. Tailwind is popular because it removes a specific kind of friction from that loop:

- **No naming things.** `.btn`, `.btn-primary`, `.card-header-title` — naming CSS classes is a genuinely annoying part of writing CSS, and Tailwind mostly makes it unnecessary.
- **No switching files.** The styles live right next to the markup they style, so you can see and change both at once.
- **A design system for free.** Tailwind's spacing, colours, and font sizes come from a fixed, consistent scale (`p-4` is always the same amount of padding everywhere), which quietly stops a common real-world problem: five slightly different shades of blue creeping into an app because nobody remembered the exact one from last time.
- **Nothing unused ships.** Tailwind scans your actual code and only includes the CSS for classes you really used, so your final stylesheet stays small even though the *tool* offers thousands of classes.

The trade-off is real too, and worth saying plainly: your JSX gets visually busier, and there's a vocabulary of class names to learn. Whether that trade is worth it is a genuine, ongoing debate in the React community, and different teams land differently. This chapter teaches you Tailwind well enough to use it and to read it in other people's code, so you can make that call for yourself.

## Real-world example

Think about **furnishing a room with flat-pack furniture** versus having a carpenter build everything from scratch.

| Custom CSS (chapter 15) | Tailwind |
|---|---|
| A carpenter builds a bespoke shelf to your exact spec | You buy a shelf unit, already made, in one of the standard sizes |
| You describe what you want in words (a `.css` rule) | You pick from a catalogue of ready pieces (utility classes) |
| Every shelf can be a slightly different height | Every shelf is one of a fixed set of standard heights |
| Takes longer, fits your space exactly | Faster, and everything matches because it's all from the same catalogue |
| You need carpentry skill to make changes | You need to know the catalogue to make changes |

Neither is "wrong." A showroom furnished entirely from one catalogue looks coherent fast. A house built entirely bespoke can look however you want, at the cost of more decisions and more time.

## How it works

### Setting up Tailwind in your Vite project

In your practice app (or a fresh `npm create vite@latest` project, same as [chapter 01](../01-getting-started/notes.md)):

```
npm install tailwindcss @tailwindcss/vite
```

Add the plugin to `vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

Replace the contents of `src/index.css` with one line:

```css
@import "tailwindcss";
```

That's the whole setup — no separate config file needed to get started, no PostCSS to wire up by hand. Save, and every Tailwind class is now available anywhere in your app. (Older tutorials describe a longer setup with a `tailwind.config.js` and three separate `@tailwind` directives — that was Tailwind v3. v4 is deliberately much shorter.)

### Utility classes: one job each

A **utility class** does exactly one thing. Learning Tailwind is mostly learning the naming pattern, not memorising hundreds of individual names:

| Category | Examples | What they do |
|---|---|---|
| Spacing | `p-4`, `px-2`, `py-6`, `m-4`, `mt-2`, `gap-4` | padding, margin, gap — the number is a step on Tailwind's spacing scale, not a raw pixel value |
| Sizing | `w-full`, `h-screen`, `max-w-md` | width, height |
| Colour | `bg-blue-600`, `text-white`, `border-grey-300` | background, text, border colour — each colour has shades `50` (lightest) to `950` (darkest) |
| Typography | `text-sm`, `text-xl`, `font-bold`, `italic` | font size, weight, style |
| Layout | `flex`, `grid`, `block`, `hidden` | `display` |
| Flexbox | `items-center`, `justify-between`, `flex-col` | flex alignment and direction |
| Borders | `rounded-lg`, `border`, `border-2` | border radius and width |
| Effects | `shadow-md`, `opacity-50` | box-shadow, opacity |

`p-4` means "padding, size 4 on the spacing scale" — which happens to be `1rem` (16px), because Tailwind's scale goes up in fixed steps. You're not picking pixel values freely; you're picking a position on a scale designed so a handful of values look consistent together. That constraint is doing real work: it's much harder to accidentally end up with thirteen almost-identical spacing values scattered across an app.

### A worked example

Here's the café menu card from [chapter 03](../03-components/notes.md), styled entirely with utilities:

```tsx
function MenuItem({ name, price }: { name: string; price: number }) {
  return (
    <div className="rounded-lg border border-grey-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-grey-900">{name}</h2>
      <p className="mt-1 text-grey-600">${price.toFixed(2)}</p>
    </div>
  );
}
```

Read it left to right: rounded corners, a light grey border, white background, padding, a small shadow. Then the heading: medium-large text, semi-bold, near-black. Then the price: a small top margin, grey. No `.css` file, no class names to invent, no switching windows to see what `.card` looks like — it's all right there.

### Hover, focus, and other states

Prefix a utility with a state name and a colon to apply it only in that state:

```tsx
<button className="bg-blue-600 hover:bg-blue-700 focus:outline-2 focus:outline-blue-400 active:bg-blue-800">
  Save
</button>
```

- `hover:bg-blue-700` — a darker blue, only while hovered.
- `focus:outline-2` — a visible focus ring, only while focused (keyboard users need this — never remove focus outlines without replacing them).
- `active:bg-blue-800` — darker still, only while being clicked.

This is one of Tailwind's real conveniences: in [chapter 15](../15-styling/notes.md), a `:hover` effect needed a real CSS rule, because inline styles can't express it. Here it's just another class, written right next to the state it's for.

### Responsive design

Prefix with a breakpoint name to apply a utility only above that screen width:

```tsx
<div className="flex flex-col gap-4 sm:flex-row md:gap-8 lg:max-w-4xl">
```

- No prefix: applies at every width (this is "mobile-first" — you style for small screens by default, then override for bigger ones).
- `sm:` (640px and up), `md:` (768px), `lg:` (1024px), `xl:` (1280px) — each one means "apply this class from this width upward."

So `flex-col sm:flex-row` reads as: stack vertically on small screens, switch to a row from `sm` upward. You'll use this constantly for layouts that need to behave differently on a phone versus a laptop.

### Dark mode

Tailwind v4 supports dark mode with a `dark:` prefix, matching the operating system's preference by default:

```tsx
<div className="bg-white text-grey-900 dark:bg-grey-900 dark:text-white">
```

To toggle it with a button instead of following the system setting (the way the to-do app's stretch goal did), tell Tailwind to key off a class on a parent element, in your CSS:

```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));
```

Then your React code just toggles a `dark` class on a top-level element — `document.documentElement.classList.toggle("dark")`, or by controlling `className` on your app's root `<div>`, whichever fits how your app is built — exactly the same state-driven class toggling from [chapter 15](../15-styling/notes.md).

### Combining conditional classes with Tailwind

State-driven classes work exactly like they did in chapter 15 — Tailwind classes are still just strings, so your `cx` helper (or the `clsx` package) works unchanged:

```tsx
function cx(...classes: (string | false | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

function Tab({ label, isActive, onClick }: TabProps) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "rounded-md px-3 py-1.5 text-sm font-medium",
        isActive ? "bg-blue-600 text-white" : "text-grey-600 hover:bg-grey-100"
      )}
    >
      {label}
    </button>
  );
}
```

Notice the shared classes (`rounded-md px-3 py-1.5 ...`) are written once, and only the classes that genuinely differ between states are conditional. That's worth being deliberate about — see mistake 4 below.

### Extracting a component instead of extracting a CSS class

Tailwind's official answer to "won't I repeat these class strings everywhere?" is: **make a component**, the same tool you already have. If five buttons across your app all need the same look, that's `<Button>`, not a `.btn` CSS class:

```tsx
type ButtonProps = {
  children: ReactNode;
  onClick?: () => void;
};

function Button({ children, onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
    >
      {children}
    </button>
  );
}
```

Now every `<Button>Save</Button>` gets the styling automatically, and there's exactly one place to change it. This is [chapter 04](../04-props/notes.md)'s `children` pattern again — Tailwind doesn't replace component composition, it works alongside it. It's a genuinely good default: reach for a real component before reaching for a shared CSS class.

### Arbitrary values, for the rare exception

When the scale genuinely doesn't have what you need, square brackets let you specify an exact value:

```tsx
<div className="top-[117px] w-[calc(100%-2rem)]">
```

Use this rarely. Reaching for it often is usually a sign you're fighting the scale instead of using it — see mistake 5.

### Tailwind and CSS Modules aren't rivals

You can use both in the same app. Some teams use Tailwind for almost everything and drop into a `.module.css` file only for something genuinely awkward to express with utilities — a complex `@keyframes` animation, an unusual gradient, a unique layout. There's no rule against mixing them; use whichever fits the specific thing you're styling.

## Common mistakes

**1. Fighting the missing `.css` file out of habit**

Looking for "where's the CSS for this button" and expecting a stylesheet is the most common adjustment. There often isn't one — the styling lives in the `className` string, on the element itself.

**2. Forgetting `hover:`, `focus:`, or a breakpoint prefix and wondering why nothing changed**

```tsx
<button className="bg-blue-700">   // always this colour, not just on hover
```

If you meant "only in that state," the prefix has to be there: `hover:bg-blue-700`.

**3. Typing class names Tailwind doesn't recognise, and getting silence**

```tsx
<div className="pading-4">   // typo — nothing happens, no error, no warning
```

Because utilities are just strings, a misspelt one is simply an unused class name; nothing on the page changes and nothing tells you why. If a Tailwind class doesn't seem to be applying, double-check the spelling character by character. Editor extensions for Tailwind (worth installing) autocomplete class names and catch this for you.

**4. Repeating a long, identical class string across many elements**

```tsx
<button className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">Save</button>
<button className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">Cancel</button>
```

Copy-pasted styling drifts apart over time as one gets edited and the other doesn't. Extract a `<Button>` component the moment you're duplicating a class string like this.

**5. Reaching for arbitrary values instead of the nearest scale step**

```tsx
<div className="p-[17px]">   // ❌ why 17? use p-4 (16px) unless there's a real, specific reason
```

Nearly every real design doesn't actually need that exact pixel value — it needs "roughly this much space, consistent with everywhere else." Use the scale, and reach for square brackets only for a value that's genuinely fixed by something outside your control (a third-party widget's exact height, say).

**6. Building your whole design entirely from memory instead of checking the docs**

Tailwind has a *lot* of utilities, and nobody has them all memorised. Keep the official docs open while you work, the same way you'd keep MDN open for a CSS property you don't use often.

## Quick recap

- Tailwind gives you small, single-purpose utility classes — `p-4`, `bg-blue-600`, `flex` — applied directly in `className`, instead of writing your own CSS rules.
- Set up with `npm install tailwindcss @tailwindcss/vite`, the plugin added to `vite.config.ts`, and one line, `@import "tailwindcss";`, in your CSS. Tailwind v4's setup is deliberately minimal.
- State prefixes (`hover:`, `focus:`, `active:`) and breakpoint prefixes (`sm:`, `md:`, `lg:`) apply a class only under that condition. `dark:` handles dark mode.
- Combine Tailwind classes with your `cx` helper exactly as you did with CSS Modules classes in [chapter 15](../15-styling/notes.md).
- Don't repeat long class strings — extract a **component**, the same tool you already have, rather than inventing a shared CSS class.
- Prefer the spacing/colour **scale** over arbitrary bracketed values; the scale is what keeps a whole app looking consistent.
- Tailwind and CSS Modules can live in the same app; use whichever fits the specific thing you're styling.

---

**Next:** try the [exercises](exercises.md), then move on to [17 Effects](../17-effects/notes.md).
