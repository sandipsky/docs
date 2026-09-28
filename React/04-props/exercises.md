# 04 Props: Exercises

**How to do these:**

- Work in your practice app, one folder per exercise: `src/ch04/ex1/`, `src/ch04/ex2/`, and so on. One file per component, plus an `Ex1.tsx` that puts them together.
- Change the `import` line in `src/App.tsx` to see the exercise you're working on, the same as in [chapter 03](../03-components/exercises.md).
- Keep the Console open (`F12`), and use the **Components** tab to check what props each component actually received.
- An exercise is done when the page looks right, VS Code shows no red squiggles, `npx tsc -b` prints nothing, and the Console has no errors or React warnings.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): The name badge

Create `src/ch04/ex1/Badge.tsx`. It should take two props, `name` (text) and `role` (text), and show:

```
Maya
Volunteer
```

Write a `type BadgeProps` above the component, destructure the props in the parameter list, and give the name an `<h2>`.

Then in `Ex1.tsx`, show **three** badges with different names and roles.

Now break it on purpose, one at a time, and write down the error message each time before you fix it:

1. Remove `role` from one of the badges.
2. Pass `name={5}` on one of them.
3. Rename one badge's `name` to `naem`.
4. Add `age={30}` to one of them, without changing `BadgeProps`.

<details>
<summary>Hint 1</summary>

The shape is in the notes under "Typing props" and "Destructuring props". The type goes above the function, and the annotation goes after the destructured object: `function Badge({ name, role }: BadgeProps)`.

</details>

<details>
<summary>Hint 2</summary>

For number 4, it's worth noticing *why* that's an error. TypeScript won't let you pass a prop the component never asked for, because it's almost always a typo.

</details>

---

## Exercise 2 (Easy): The menu, finished at last

Finish the café menu the notes keep talking about. In `src/ch04/ex2/MenuItem.tsx`, write a `MenuItem` component that takes:

- `name`: text
- `price`: a number
- `vegan`: a boolean

It should show the name as an `<h2>`, the price as `$3.50` (always two decimal places), and the word `Vegan` underneath **only when `vegan` is `true`**. When it's `false`, that line should not be there at all.

In `Ex2.tsx`, show four drinks:

| Name | Price | Vegan |
|---|---|---|
| Espresso | 2.5 | no |
| Latte | 3.5 | no |
| Oat Flat White | 3.75 | yes |
| Mint Tea | 2 | yes |

Use the boolean shorthand for at least one of them. Check that Mint Tea shows `$2.00`, not `$2`.

<details>
<summary>Hint 1</summary>

`toFixed(2)` from [JavaScript chapter 05](../../JavaScript/05-numbers-and-math/notes.md) turns `2` into `"2.00"`.

</details>

<details>
<summary>Hint 2</summary>

For the Vegan line, you only know one way to choose between two things so far: the ternary from chapter 02. Show the JSX when it's true, and `null` when it's false. ([Chapter 05](../05-conditional-rendering/notes.md) has neater ways, and this is exactly the problem it solves.)

</details>

---

## Exercise 3 (Medium): A button you can reuse

Real apps have one button component used everywhere, with a few knobs to turn. Build one in `src/ch04/ex3/Button.tsx`.

`ButtonProps`:

| Prop | Type | Required? | Default |
|---|---|---|---|
| `label` | text | yes | |
| `colour` | text | no | `"steelblue"` |
| `size` | `"small"` or `"large"` | no | `"small"` |
| `disabled` | boolean | no | `false` |

The component returns a real `<button>` with:

- the `label` as its text,
- `backgroundColor` set to `colour` and white text, using the `style` attribute,
- a font size of `14` when `size` is `"small"` and `20` when it's `"large"`,
- the real HTML `disabled` attribute set from the `disabled` prop.

In `Ex3.tsx`, show five buttons that between them use every prop, including one with **only** a label.

Then try `<Button label="Go" size="medium" />` and write down what TypeScript says. Why is that a much better error than finding out in the browser?

<details>
<summary>Hint 1</summary>

`"small" | "large"` is a union of two literal types, from [TypeScript chapter 06](../../TypeScript/06-unions-and-narrowing/notes.md). It's better than `string` here because it means nothing but those two words can ever be passed.

</details>

<details>
<summary>Hint 2</summary>

Defaults go in the destructuring: `function Button({ label, colour = "steelblue", size = "small", disabled = false }: ButtonProps)`. That's a long line. Breaking it across several lines is fine and normal.

</details>

<details>
<summary>Hint 3</summary>

Work the font size out **above** the `return`, into a `const`, then use it in the style object. Keep the JSX for showing things.

</details>

---

## Exercise 4 (Medium): A card that holds anything

Build a reusable frame in `src/ch04/ex4/Card.tsx`. `Card` takes:

- `title`: text, required. Shown as an `<h3>` at the top.
- `children`: optional, anything React can show. Shown underneath the title.

Give the card a visible frame with the `style` attribute: a `1px solid grey` border, `12px` of padding, and `8px` of margin at the bottom.

In `Ex4.tsx`, use `<Card>` three times with completely different contents:

1. A card with a paragraph of text inside.
2. A card with a `<ul>` of three shopping items inside.
3. A card with **two** of your `Badge` components from exercise 1 inside. (Import them from `../ex1/Badge.tsx`.)

Then answer in a comment: `Card` doesn't know anything about badges or shopping lists. Why is that a good thing?

<details>
<summary>Hint 1</summary>

The type is `ReactNode`, and it comes from React: `import type { ReactNode } from "react";`. See "The `children` prop" in the notes.

</details>

<details>
<summary>Hint 2</summary>

`children` is never written as an attribute. You put the content between `<Card>` and `</Card>`, and React fills the prop in for you.

</details>

<details>
<summary>Hint 3</summary>

CSS property names are camelCase in JSX, so it's `borderRadius`, `marginBottom`, and `border: "1px solid grey"`.

</details>

---

## Exercise 5 (Challenge): Library checkout page

This one puts everything together: object props, a `readonly` array, two levels of passing props down, and array methods from [JavaScript chapter 13](../../JavaScript/13-array-methods/notes.md).

Start with `src/ch04/ex5/data.ts`:

```ts
export type Book = {
  title: string;
  author: string;
  year: number;
  daysLate: number;
};

export const alice: Book = {
  title: "The Hobbit",
  author: "J. R. R. Tolkien",
  year: 1937,
  daysLate: 0,
};

export const bob: Book = {
  title: "Dune",
  author: "Frank Herbert",
  year: 1965,
  daysLate: 3,
};

export const carla: Book = {
  title: "Small Gods",
  author: "Terry Pratchett",
  year: 1992,
  daysLate: 12,
};
```

**Part 1: `BookRow`.** Takes **one** prop, `book`, typed with the `Book` type you just imported. It shows:

```
The Hobbit
J. R. R. Tolkien, 1937
On time
```

The third line comes from a second component, `LateNotice`, which `BookRow` renders. `LateNotice` takes only `daysLate` (a number), and shows:

- `On time` in green when `daysLate` is `0`,
- `3 days late — $0.75 fine` in red otherwise, where the fine is **25 cents per day late**, shown with two decimal places.

Notice what's happening: `BookRow` receives a whole `Book`, but passes only the one number `LateNotice` needs. That's normal and good. A component should be given the least it can do its job with.

**Part 2: `CheckoutSummary`.** Takes one prop, `books`, a **readonly array** of `Book`. It works out and shows:

```
3 books out
2 overdue
Total fines: $3.75
```

Every number must be calculated from `books`. Don't type any of them in.

**Part 3: `Ex5`.** Puts the page together: a heading, a `<CheckoutSummary />`, and three `<BookRow />`s. Build the array for the summary from your three books.

**Part 4: prove the rules.** Do these and write down what happens:

1. Inside `CheckoutSummary`, try `books.push(alice)`. What does TypeScript say, and why is that good?
2. Inside `CheckoutSummary`, try `books.sort((a, b) => a.year - b.year)`. What does TypeScript say? (`sort` changes the array it's called on, so this is the same rule.) How would you sort them without breaking it?
3. Change `carla.daysLate` to `0`. Which numbers on the page change by themselves, and which would you have had to fix by hand if you'd typed them in?

<details>
<summary>Hint 1</summary>

For Part 1, the prop type is a one-line wrapper around the type you already have:

```tsx
type BookRowProps = {
  book: Book;
};
```

Import the type with `import type { Book } from "./data.ts";`.

</details>

<details>
<summary>Hint 2</summary>

For `LateNotice`, work out the fine and pick the colour **above** the `return`, then use a ternary for the text. Remember `0` is falsy in JavaScript, but be explicit here: `daysLate === 0` says what you mean.

</details>

<details>
<summary>Hint 3</summary>

For Part 2, `readonly Book[]` is the type. `filter(b => b.daysLate > 0).length` gives you the overdue count, and `reduce` adds up the fines. Work out the fine per book the same way in both components, or better, put that sum in one small function in `data.ts` and import it into both.

</details>

<details>
<summary>Hint 4</summary>

For Part 4, question 2: make a copy first ([JavaScript chapter 16](../../JavaScript/16-values-vs-references/notes.md)). `[...books].sort(...)` sorts the copy and leaves the parent's array alone. Modern JavaScript also has `toSorted()`, which returns a new sorted array and never touches the original.

</details>
