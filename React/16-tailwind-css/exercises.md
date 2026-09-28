# 16 Tailwind CSS: Exercises

**How to do these:**

- These need Tailwind installed. Either add it to your existing `playground` app (`npm install tailwindcss @tailwindcss/vite`, update `vite.config.ts`, and replace `src/index.css`'s contents with `@import "tailwindcss";`), or create a fresh app for this chapter, same as [chapter 01](../01-getting-started/notes.md). Either way, one folder per exercise inside `src/ch16/`.
- Keep the [Tailwind docs](https://tailwindcss.com/docs) open in a tab. Nobody does this chapter from memory, and neither should you.
- An exercise is done when the page looks right, VS Code shows no red squiggles, `npx tsc -b` prints nothing, and there's no leftover `.css` file with rules that duplicate what a utility class already does.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Convert a card, class by class

Here's a card styled with plain CSS, the [chapter 15](../15-styling/notes.md) way:

```css
.card {
  border: 1px solid #d1d5db;
  border-radius: 12px;
  padding: 20px;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  max-width: 320px;
}
.title {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
}
.subtitle {
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
}
.button {
  margin-top: 12px;
  background: #2563eb;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
}
```

In `src/ch16/ex1/Ex1.tsx`, rebuild the exact same card using **only Tailwind utility classes**, no `.css` file at all. Match the colours and spacing as closely as the Tailwind scale allows — they won't be pixel-identical, and that's fine; note in a comment anywhere they genuinely can't match exactly.

Then add `hover:bg-blue-700` to the button, and confirm it does something a plain inline `style` could never have done on its own.

<details>
<summary>Hint 1</summary>

`border`, `border-grey-300`, `rounded-xl`, `p-5`, `bg-white`, `shadow-sm`, `max-w-xs` gets you most of the card shell. Check Tailwind's colour and spacing scale pages for the closest matches to the exact hex values and pixel sizes above.

</details>

---

## Exercise 2 (Easy): A responsive nav bar

In `src/ch16/ex2/Ex2.tsx`, build a header with a logo on the left and three links on the right.

1. On small screens (below `sm`), stack the logo above the links, links centred, in a column.
2. From `sm` upward, they sit in a row: logo on the left, links on the right, vertically centred.
3. Give the links `hover:underline` and a colour change on hover.
4. Resize your browser window (or use DevTools' device toolbar) to actually see the breakpoint take effect, and write in a comment at what width it switches.

<details>
<summary>Hint 1</summary>

`flex flex-col items-center sm:flex-row sm:items-center sm:justify-between` on the wrapping element is the whole layout. Everything else is spacing and colour.

</details>

---

## Exercise 3 (Medium): A tab bar with conditional classes

In `src/ch16/ex3/Ex3.tsx`, build a three-tab bar (`Overview`, `Reviews`, `Shipping`) where the active tab is visually distinct (background colour, white text) and the others are plain text with a hover effect.

Requirements:

1. Use your `cx` helper from [chapter 15's exercise 5](../15-styling/exercises.md) (or write a fresh one) to combine shared classes with classes that depend on whether a tab is active.
2. Clicking a tab switches which one is active — this needs real state, from [chapter 08](../08-state/notes.md).
3. Show *something* below the tabs that changes with the selection, so it's clear the whole thing works, not just the tab styling.
4. In a comment, write the **one** class string your `cx` call produces for the active tab and for an inactive one, so you can see exactly what ends up in the DOM.

<details>
<summary>Hint 1</summary>

This is nearly identical in shape to the `FilterButtons` component from the [to-do app project](../10-project-todo-app/notes.md) — same "which one is selected" state, same idea, just with Tailwind classes instead of a CSS Modules `active` class.

</details>

---

## Exercise 4 (Medium): Dark mode toggle

In `src/ch16/ex4/`, build a small page (a heading, two paragraphs, a card) that supports dark mode via a button, not just the system setting.

1. Set up the class-based dark mode variant, as described in the notes (`@custom-variant dark (&:where(.dark, .dark *));`).
2. A button toggles a `dark` class on a wrapping element, using state.
3. Every element that needs to look different in dark mode gets a `dark:` variant of its colour classes — background, text, and border, at minimum.
4. Persist the choice to `localStorage`, the same as the to-do app's stretch goal, so it survives a refresh.

<details>
<summary>Hint 1</summary>

This is the same React logic as [chapter 15, exercise 4](../15-styling/exercises.md) — state, `localStorage`, a class toggled on a wrapper. The only thing that's different is that the CSS side of it is Tailwind's `dark:` prefixes instead of your own `:root` variables.

</details>

---

## Exercise 5 (Challenge): A small design-system Button, the Tailwind way

Rebuild the [chapter 15, exercise 5](../15-styling/exercises.md) button component — but this time with Tailwind utilities instead of a CSS Module, and compare the two approaches honestly.

In `src/ch16/ex5/Button.tsx`, support the exact same API:

```tsx
type ButtonProps = {
  children: ReactNode;
  variant: "primary" | "secondary" | "outline";
  size: "small" | "medium" | "large";
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: () => void;
};
```

Requirements:

1. Use **lookup objects** (from [chapter 05](../05-conditional-rendering/notes.md)) mapping `variant` to its class string, and `size` to its class string, rather than a long chain of ternaries inside the `className`.
2. Combine everything — the shared base classes, the variant classes, the size classes, and the conditional `fullWidth`/`disabled` classes — with your `cx` helper in one `className` call.
3. Render the same six-or-more combinations from the chapter 15 version in `Ex5.tsx`, including `disabled`, which should visibly grey the button out and use `disabled:` Tailwind variants rather than a manually conditioned class.
4. Write a short, honest comparison in a comment: which version (the CSS Modules one from chapter 15, or this one) was faster to build? Which would be easier for someone else to change six months from now without breaking another variant by accident? There's no required answer — the point is forming and defending your own opinion, now that you've built the same thing both ways.

<details>
<summary>Hint 1</summary>

```tsx
const variantClasses: Record<ButtonProps["variant"], string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  secondary: "bg-grey-200 text-grey-900 hover:bg-grey-300",
  outline: "border border-grey-300 text-grey-900 hover:bg-grey-50",
};
```

`Record<ButtonProps["variant"], string>` reaches into the props type to reuse the union, rather than retyping `"primary" | "secondary" | "outline"` a second time — the same `keyof`/indexed-access idea from [chapter 11](../11-updating-objects-and-arrays/notes.md).

</details>

<details>
<summary>Hint 2</summary>

Tailwind has `disabled:opacity-50 disabled:cursor-not-allowed` variants that key off the real HTML `disabled` attribute automatically — no manual `isDisabled ? ... : ...` branch needed for those specific styles, only for the `disabled` attribute itself.

</details>
