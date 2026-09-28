# 02 JSX: Exercises

**How to do these:**

- Work in your practice app, the same way as in [chapter 01](../01-getting-started/exercises.md): one file per exercise in `src/ch02/` (`Ex1.tsx`, `Ex2.tsx`, ...), and change the `import` line in `src/App.tsx` to show the one you're working on.
- Keep the Console open (`F12`) while you work.
- An exercise is done when the page looks right, VS Code shows no red squiggles, `npx tsc -b` prints nothing, and the Console has no errors or React warnings.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Fix the library card

A friend wrote this for their library's website, but it's broken. Copy it into `src/ch02/Ex1.tsx`:

```tsx
function Ex1() {
  return (
    <h1 class="title">City Library</h1>
    <img src="/favicon.svg" alt="Library logo">
    <label for="card">Card number</label>
    <input id="card" type="text">
  );
}

export default Ex1;
```

There are **five** problems. Find and fix them all, so the page shows the heading, the logo, the label, and the text box.

<details>
<summary>Hint 1</summary>

Go through the three rules from the notes one at a time: one parent, close every tag, camelCase attributes. Two of the problems are the same kind of mistake, and two are attribute names.

</details>

<details>
<summary>Hint 2</summary>

Fix the errors from the top down, and save after each fix. While the *syntax* is broken, TypeScript can't read the file properly, so some errors only appear after you've fixed the ones above them.

</details>

---

## Exercise 2 (Easy): Movie ticket

Create `src/ch02/Ex2.tsx`. Above the `return`, make three `const` variables: the movie title, the seat number, and the price as a number (`12.5`). Don't write any type annotations. Use the variables in your JSX so the page shows:

```
Inside Out 2
Seat: 14
Price: $12.50
```

The title should be a heading, and the other two lines paragraphs.

Then hover over each variable in VS Code, and write the type TypeScript shows as a comment next to it. Why isn't the title's type just `string`?

<details>
<summary>Hint 1</summary>

Put the variable names in curly braces: `{seat}`. To turn `12.5` into `12.50`, use `toFixed` from JavaScript chapter 05. And remember, the `$` is just text in JSX.

</details>

<details>
<summary>Hint 2</summary>

For the question, think about what `const` promises, and reread the part about literal types in TypeScript chapter 02 or 06.

</details>

---

## Exercise 3 (Medium): Product card

You're building an online shop. In `src/ch02/Ex3.tsx`, start with this object above the function:

```tsx
const product = {
  name: "Wireless Mouse",
  price: 24.99,
  stock: 3,
  onSale: true,
  image: "/favicon.svg",
};
```

**Part 1: a type.** Describe the product with a `type Product` ([TypeScript chapter 04](../../TypeScript/04-type-aliases-and-interfaces/notes.md)), and use it to annotate `product`. Test it: misspell one property, like `prise`, and check that TypeScript complains. Then fix it.

**Part 2: experiments.** Try these one at a time, inside your function's JSX, and write what happened as a comment in your file:

1. Put `<p>{product.onSale}</p>` in your JSX. Does TypeScript complain? What shows up on the page? Why?
2. Put `<p>{product}</p>` in your JSX. What does VS Code say? Save anyway, and check the Console too. Then remove it.

**Part 3: the card.** Build a card that shows:

```
(the image)
Wireless Mouse
$24.99
Only 3 left!
On sale!
```

- The image's `src` comes from `product.image`, and its `alt` is the product's name.
- The name is an `<h2>`.
- The price is green and `20px`, using the `style` attribute.
- The "Only 3 left!" line uses `product.stock`, so it would still be right if the stock changed to 7.
- The last line says `On sale!` when `onSale` is `true`, and `Full price` when it's `false`. Change `onSale` to `false` to test it.

<details>
<summary>Hint 1</summary>

For Part 1, a type alias lists each property and its type: `type Product = { name: string; ... };`. The annotation goes after the variable name: `const product: Product = { ... }`.

</details>

<details>
<summary>Hint 2</summary>

For Part 2, look at the table "What shows up on the page" in the notes, and the part about `ReactNode`.

</details>

<details>
<summary>Hint 3</summary>

Attributes use braces with no quotes: `src={product.image}`. The style needs double braces, and the value `20` means pixels. For the last line, you need something that picks between two values and is an *expression*.

</details>

---

## Exercise 4 (Medium): From HTML to JSX

A gym gave you this HTML for their newsletter sign-up. Turn it into JSX in `src/ch02/Ex4.tsx`:

```html
<!-- Newsletter sign-up -->
<h2 class="form-title">Join the Gym Newsletter</h2>
<p style="color: gray; font-size: 14px">One email a week. No spam.</p>
<label for="email">Email</label>
<input id="email" type="email" placeholder="you@example.com" maxlength="50">
<br>
<button class="btn" type="submit">Sign up</button>
```

It's done when the form shows up on the page, with the paragraph in small gray text, and TypeScript and the Console have nothing to say. Count how many changes you made.

<details>
<summary>Hint 1</summary>

Use the checklist "From HTML to JSX" at the end of the notes, and go through it line by line. The comment, the `style`, and the `maxlength` are the trickiest parts.

</details>

<details>
<summary>Hint 2</summary>

Paste the HTML into your function's `return` first, and let TypeScript show you what's wrong. Remember to read each error's last sentence first.

</details>

---

## Exercise 5 (Challenge): Shop receipt

This one combines JSX with array methods from [JavaScript chapter 13](../../JavaScript/13-array-methods/notes.md) and types from the TypeScript course. In `src/ch02/Ex5.tsx`, start with:

```tsx
const cart = [
  { name: "Notebook", price: 3.5, quantity: 5 },
  { name: "Backpack", price: 34.99, quantity: 1 },
  { name: "Sticky notes", price: 1.99, quantity: 2 },
];
const taxRate = 0.08;
```

First, write a `type CartItem` for one item, and annotate `cart` as an array of them ([TypeScript chapter 03](../../TypeScript/03-arrays-tuples-objects/notes.md)).

Then make the page show exactly this:

```
Your Receipt
Items: 8
Subtotal: $56.47
Tax (8%): $4.52
Total: $60.99
Most expensive item: Backpack
```

Rules:

- Calculate everything from `cart` and `taxRate`, in your function *above* the `return`. Don't type in any of the numbers yourself. If someone changes the cart, the receipt should still be right.
- The JSX should only *show* your results.
- Don't show each item in a list yet. That's chapter 06.

<details>
<summary>Hint 1</summary>

An array of a type is written `CartItem[]`. Then `reduce` can add up the quantities for **Items**, and add up `price * quantity` for **Subtotal**. Start both totals at `0`. Hover over your totals: TypeScript should say they're numbers.

</details>

<details>
<summary>Hint 2</summary>

Tax is the subtotal times `taxRate`. The `8` in `Tax (8%)` comes from `taxRate * 100`. Use `toFixed(2)` only when you *show* a money value, because it turns the number into a string. (Try `subtotal.toFixed(2) + tax` and see what TypeScript thinks of the result.)

</details>

<details>
<summary>Hint 3</summary>

For the most expensive item, `reduce` can keep whichever item has the higher price so far. You could also sort a copy of the array, but make sure it's a copy (JavaScript chapter 16), so you don't change `cart` itself.

</details>
