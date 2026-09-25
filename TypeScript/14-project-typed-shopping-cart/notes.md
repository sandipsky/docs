# 14 Project: Typed Shopping Cart

## What you'll build

You'll take the shopping cart you built in [JavaScript chapter 12](../../JavaScript/12-project-shopping-cart/notes.md) and convert it to TypeScript, one step at a time. The program's output stays **exactly the same**. What changes is that TypeScript now guards every part of it.

This is what developers do in real life: most TypeScript projects started as JavaScript projects. Converting step by step, without breaking anything, is a skill you'll use a lot.

By the end, you'll have:

- typed data (`Product`, `CartItem`, `DiscountCode`),
- typed functions, where wrong calls are caught before running,
- a discount code that can only ever be `"SAVE10"` or `"FLAT5"`,
- the code split into modules,
- tests for the money logic.

## Before you start

- Finish (or at least reread) your JavaScript chapter 12 `cart.js`. If you don't have it any more, do that project first: it's the starting point.
- Make a folder `playground/ch14/` and copy your `cart.js` into it.
- **The golden rule:** after every milestone, run both `node` (the output must not change) and `npx tsc` (the errors should go down).

Save a copy of your program's full output now, in a file like `expected-output.txt`, so you can compare after each step.

## Milestone 1: Rename and look

**Goal:** see what TypeScript thinks of your JavaScript.

1. Rename `cart.js` to `cart.ts`.
2. Run `node ch14/cart.ts`. It should still work: remember, Node just removes types, and there aren't any yet.
3. Run `npx tsc`, and count the errors.

Most of them will be `Parameter 'productId' implicitly has an 'any' type.`, plus a few about empty arrays and `null`. That's your to-do list.

<details>
<summary>Hint</summary>

Don't try to fix everything at once. The next milestones go through the errors in a sensible order: data first, then functions.

</details>

## Milestone 2: Type the data

**Goal:** describe your data with types ([chapter 04](../04-type-aliases-and-interfaces/notes.md)).

Create these at the top of `cart.ts`:

```ts
// no-check
type Cents = number; // all money is whole cents, as in JavaScript chapter 12

interface Product {
  id: number;
  name: string;
  priceInCents: Cents;
}

interface CartItem {
  productId: number;
  quantity: number;
}
```

Then use them: `const products: Product[] = [...]` and `const cart: CartItem[] = [];`.

`type Cents = number` doesn't add any checking (a `Cents` is still any number), but it documents what the number means, everywhere it appears.

**Check:** the errors about the empty `cart` array should be gone.

## Milestone 3: Type the helper functions

**Goal:** give every function typed parameters and a return type ([chapter 05](../05-functions/notes.md)).

Start with the helpers, since the other functions use them:

- `findProduct(productId: number): Product | null`
- `findCartItem(productId: number): CartItem | null`
- `formatMoney(cents: Cents): string`

Now TypeScript will point at every place that uses `findProduct` without checking for `null`. Each of those is a real crash waiting to happen. Fix them with a `null` check ([chapter 06](../06-unions-and-narrowing/notes.md)).

<details>
<summary>Hint</summary>

If your JavaScript version used `find()`, it returns `undefined`, not `null`, when nothing matches. Either change the return type to `Product | undefined`, or add `?? null`. Pick one style and use it everywhere.

</details>

## Milestone 4: A discount code that can't be misspelled

**Goal:** replace "any string" with exactly the valid codes ([chapter 06](../06-unions-and-narrowing/notes.md)).

```ts
// no-check
type DiscountCode = "SAVE10" | "FLAT5";

let discountCode: DiscountCode | null = null;
```

Now `getDiscount(subtotal: Cents, code: DiscountCode | null): Cents` can't be called with `"SAVE1O"` by mistake.

But there's a catch: `applyDiscountCode` receives whatever the customer typed, which is a plain `string`, like `" save10 "`. After cleaning it up, how do you get from `string` to `DiscountCode`? Write a type guard ([chapter 13](../13-async-and-apis/notes.md)):

```ts
// no-check
function isDiscountCode(value: string): value is DiscountCode {
  return value === "SAVE10" || value === "FLAT5";
}
```

Use it inside `applyDiscountCode`: if the cleaned code passes, store it. If not, print your "Sorry, that code isn't valid" message, as before.

**Check:** `node` output unchanged, and fewer `tsc` errors.

## Milestone 5: Type the totals

**Goal:** type the bigger functions.

Your `getTotals()` returns an object. Give its shape a name:

```ts
// no-check
interface Totals {
  subtotal: Cents;
  discount: Cents;
  tax: Cents;
  shipping: Cents;
  total: Cents;
}
```

Then type the rest: `getSubtotal(): Cents`, `getTax(amount: Cents): Cents`, `getShipping(subtotal: Cents): Cents`, `getTotals(): Totals`, and the `void` functions like `printReceipt()`, `addToCart`, `removeFromCart` and `updateQuantity`.

**Check:** `npx tsc` should now show **zero** errors, and the output is still exactly the same. Compare it with your `expected-output.txt`.

## Milestone 6: Split into modules

**Goal:** give each file one job ([chapter 11](../11-tsconfig-and-modules/notes.md)).

```
ch14/
├── types.ts      Product, CartItem, DiscountCode, Totals, Cents
├── products.ts   the catalog
├── cart.ts       the cart and all the logic
└── main.ts       the calls that run the program, and print the receipt
```

Remember `import type` for types, and `.ts` in import paths. Run `node ch14/main.ts`: same output as always.

<details>
<summary>Hint</summary>

Only export what other files need. `cart` itself can stay private inside `cart.ts`, if `main.ts` only uses the functions.

</details>

## Milestone 7: Test the money

**Goal:** protect the logic with tests ([JavaScript chapter 46](../../JavaScript/46-testing/notes.md)).

Create `ch14/cart.test.ts` and test `getDiscount`, `getTax` and `getShipping`. For example:

```ts
// no-check
import { test } from "node:test";
import assert from "node:assert/strict";
import { getDiscount } from "./cart.ts";

test("SAVE10 takes 10% off, rounded to the nearest cent", () => {
  assert.equal(getDiscount(5647, "SAVE10"), 565);
});

test("FLAT5 needs a subtotal over $30", () => {
  assert.equal(getDiscount(2500, "FLAT5"), 0);
});
```

Run `node --test` inside `ch14`. Test files import `node:test`, so TypeScript needs Node's types: install `@types/node` and add `"types": ["node"]` to your `tsconfig.json` (chapter 11).

Try this too: write `getDiscount(5647, "SAVE20")` in a test. You don't even need to run it: TypeScript rejects it straight away.

## Common mistakes

**1. Changing behavior while converting**

A conversion should only add types. If the output changes, undo the last step and try again. Keep your `expected-output.txt` handy.

**2. Using `any` or `as` to make errors disappear**

Every error in Milestone 1 is a question. Answer it with a real type or a real check.

**3. Converting everything at once**

Work in small steps, running `node` and `npx tsc` after each one. When something breaks, you'll know exactly which step did it.

## Quick recap

- Real projects often move from JavaScript to TypeScript step by step: rename, type the data, type the functions, then tighten.
- Type the data first, since everything else depends on it.
- `null` errors from TypeScript point at real crashes: fix them with checks.
- Literal unions plus a type guard turn "any string" into "only valid values".
- Modules and tests work the same as in JavaScript, with `import type` and `.ts` paths.

---

**Congratulations!** You've finished the TypeScript folder. 🎉 Try the [exercises](exercises.md) for extra features, then go back to the [roadmap](../README.md). React with TypeScript is a great next step.
