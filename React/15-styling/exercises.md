# 15 Styling: Exercises

**How to do these:**

- Work in your practice app, one folder per exercise: `src/ch15/ex1/`, and so on. Each `.tsx` file that needs styles gets a `.module.css` file right next to it, unless an exercise says otherwise.
- Open the **Elements** tab in DevTools and check the actual class names being applied — several of these exercises are about noticing when a class name *silently* isn't the one you expected.
- An exercise is done when the page looks right, VS Code shows no red squiggles, `npx tsc -b` prints nothing, and the Console has no errors.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Make the collision happen, then fix it

In `src/ch15/ex1/`, create two plain (not module) CSS files:

`Banner.css`:
```css
.title {
  font-size: 28px;
  color: darkred;
}
```

`Sidebar.css`:
```css
.title {
  font-size: 12px;
  color: grey;
}
```

And two components, `Banner.tsx` and `Sidebar.tsx`, each importing its own CSS file and rendering `<h2 className="title">...</h2>` with different text.

1. Render both inside `Ex1.tsx`. Look at the page. Which styling won? Open the Elements tab and confirm it in the computed styles.
2. In a comment, explain why import order, not which file "looks more specific," decided the winner.
3. Now fix it: rename both files to `.module.css`, update the imports and the `className`s, and confirm both headings now look correct and independent, in either import order.
4. Swap the order of the two imports in `Ex1.tsx`. Confirm nothing changes now — that's the proof the fix worked.

<details>
<summary>Hint 1</summary>

Plain CSS files are just concatenated into one global stylesheet, in the order they're imported. Whichever `.title` rule appears later in that combined file wins, by ordinary CSS rules — it has nothing to do with which component "seems" more specific.

</details>

---

## Exercise 2 (Easy): A styled button component, three ways

Build one `Button.tsx` in `src/ch15/ex2/` that accepts `variant: "primary" | "secondary" | "danger"` and `disabled?: boolean`, and renders a `<button>` styled accordingly (background colour differs per variant; disabled is greyed out and has `cursor: not-allowed`).

1. First version: build it with **inline `style`** only, picking colours with a lookup object keyed by variant ([chapter 05](../05-conditional-rendering/notes.md)).
2. Second version, in a copy called `ButtonModule.tsx`: the same component, styled with a **CSS Module** instead — one class per variant (`.primary`, `.secondary`, `.danger`), combined with a small `cx` helper for the disabled state.
3. Render three of each variant, in both versions, side by side in `Ex2.tsx`.
4. In a comment: which version was easier to make hover states work for (`:hover` in CSS)? Try adding a hover effect to both and see for yourself before answering.

<details>
<summary>Hint 1</summary>

Inline styles can't express `:hover` at all — that's a CSS-only feature. If you want hover, it either needs a real CSS rule (which is one good argument for CSS Modules) or a `useState` tracking whether the mouse is over the button, using `onMouseEnter`/`onMouseLeave` from [chapter 07](../07-events/notes.md).

</details>

---

## Exercise 3 (Medium): Find the bug in someone else's styles

Copy this into `src/ch15/ex3/ProfileCard.tsx` and `src/ch15/ex3/ProfileCard.module.css`, exactly as written — there are bugs on purpose:

```tsx
// ProfileCard.tsx
import styles from "./ProfileCard.module.css";

type ProfileCardProps = {
  name: string;
  role: string;
  isOnline: boolean;
};

function ProfileCard({ name, role, isOnline }: ProfileCardProps) {
  return (
    <div className="card">
      <h3 className={styles.naem}>{name}</h3>
      <p className={styles.role}>{role}</p>
      <span className={isOnline ? styles.online : "offline"}>
        {isOnline ? "Online" : "Offline"}
      </span>
    </div>
  );
}

export default ProfileCard;
```

```css
/* ProfileCard.module.css */
.card {
  border: 1px solid #ccc;
  padding: 16px;
  border-radius: 8px;
}

.name {
  font-size: 20px;
  font-weight: 600;
}

.role {
  color: grey;
}

.online {
  color: green;
  font-weight: 600;
}

.offline {
  color: grey;
}
```

1. Render two `<ProfileCard />`s in `Ex3.tsx`, one online and one offline. Look carefully: which styles are actually being applied, and which aren't? Use the Elements tab, not just your eyes — some of these bugs produce results that look almost right.
2. There are **three** separate mistakes, all from the "Common mistakes" list in the notes. Find and name each one before you fix it.
3. Fix all three.
4. In a comment, explain why TypeScript's red squiggles didn't catch any of them.

<details>
<summary>Hint 1</summary>

One mistake is a typo in a module property name. One is a plain string used where a module lookup was needed. One is a plain string used where a module lookup was needed, in the *other* direction. Go line by line through the JSX.

</details>

---

## Exercise 4 (Medium): Theming with CSS variables

In `src/ch15/ex4/`, build a small settings panel with a **light / dark / high-contrast** three-way toggle (radio buttons or three buttons — your choice), where the whole panel's colours change based on the selection.

1. Define your three themes as CSS custom properties under three different class names (or a `data-theme` attribute, if you'd rather — either is a legitimate real-world approach) in a plain, global `.css` file: `--bg`, `--text`, `--accent`, at minimum.
2. The panel itself, and everything inside it, uses `var(--bg)` etc. — no theme-specific logic in your `.tsx` file beyond choosing which class or attribute to apply.
3. React's only job is state (which theme is selected) and putting the right class name or attribute on the wrapping element.
4. Persist the chosen theme to `localStorage` so it survives a refresh, the same way you did with dark mode in [chapter 10](../10-project-todo-app/exercises.md).

In a comment: why does this approach mean your **component code** never needs an `if` or a lookup object for individual colours?

<details>
<summary>Hint 1</summary>

If you find yourself writing `style={{ background: theme === "dark" ? "#111" : theme === "light" ? "#fff" : "#000" }}` in your `.tsx` file, you've reimplemented what the CSS variables were supposed to do for you. The component should only ever choose a *class name*, never a colour.

</details>

---

## Exercise 5 (Challenge): Build a reusable `cx` and a small design-system button

In `src/ch15/ex5/`, write `cx.ts` from scratch (don't copy it from the notes), typed properly:

```ts
export function cx(...classes: Array<string | false | null | undefined>): string {
  // your implementation
}
```

Then build `Button.tsx` and `Button.module.css`, a button component supporting **all** of these at once, combinable in any mix:

- `variant`: `"primary" | "secondary" | "outline"` — always exactly one.
- `size`: `"small" | "medium" | "large"` — always exactly one.
- `fullWidth?: boolean` — an extra class when true, nothing when false or omitted.
- `disabled?: boolean` — greys it out and disables real clicking.

Requirements:

1. Every combination should be reachable with a **single** `className={cx(...)}` call — no nested ternaries, no nested nested classNames.
2. Write a small test page in `Ex5.tsx` rendering at least six different combinations, including the "everything at once" case: `secondary`, `large`, `fullWidth`, `disabled`.
3. Prove your `cx` function works on its own: call it directly with a mix of strings, `false`, `undefined`, and `null`, log the result, and confirm falsy values are dropped and nothing extra (double spaces, leading/trailing spaces) sneaks in.
4. In a comment, explain what would happen — concretely, with an example — if `cx` used `.join(" ")` **without** filtering falsy values first.

<details>
<summary>Hint 1</summary>

Type the parameter as `Array<string | false | null | undefined>` (or the equivalent rest-parameter form, `...classes: (string | false | null | undefined)[]`) so TypeScript allows exactly the kinds of expressions you'll pass it: plain strings, and `condition && "class-name"` expressions, which can be `false` as well as a string.

</details>

<details>
<summary>Hint 2</summary>

`.filter(Boolean)` removes every falsy value from an array in one call, because `Boolean` returns `false` for `""`, `0`, `null`, `undefined`, and `false` itself, and `filter` keeps only the entries where the callback returns something truthy.

</details>
