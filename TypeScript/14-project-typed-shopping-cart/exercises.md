# 14 Project: Typed Shopping Cart: Exercises

**How to do these:**

- These are extra features for your typed cart. Finish all 7 milestones in the notes first.
- After each exercise, `npx tsc` must show no errors, and `node --test` must still pass.
- **Rule:** no `any`, and no `as`.
- When you're done, ask Claude to review your code.

---

## Exercise 1 (Easy): A read-only catalog

Nothing in the program should ever change the product catalog. Make TypeScript enforce that: mark the array and each product's properties read-only.

Then try `products[0].priceInCents = 1;` in `main.ts`, read the error, and remove it.

<details>
<summary>Hint</summary>

`readonly Product[]` stops changes to the list. `Readonly<Product>` (chapter 09) stops changes to each product. Combine them: `readonly Readonly<Product>[]`.

</details>

---

## Exercise 2 (Easy): Codes from one list

Right now, the valid codes are written twice: once in `type DiscountCode`, and once in `isDiscountCode`. Write them **once**, as an array with `as const`, and build both the type and the guard from it.

The program's output must not change.

<details>
<summary>Hint</summary>

Chapter 10: `const DISCOUNT_CODES = ["SAVE10", "FLAT5"] as const;` and `type DiscountCode = (typeof DISCOUNT_CODES)[number];`.

</details>

---

## Exercise 3 (Medium): Results instead of messages

`addToCart` currently prints its error messages itself. That makes it hard to test. Change it to return a `Result` (chapter 13), and let `main.ts` do the printing:

```ts
// no-check
type AddResult =
  | { ok: true; item: CartItem }
  | { ok: false; reason: "unknown-product" | "bad-quantity" };
```

Then write tests for all three outcomes.

<details>
<summary>Hint</summary>

In `main.ts`, a `switch` on `result.reason` with a `never` check (chapter 06) makes sure every failure has a message.

</details>

---

## Exercise 4 (Challenge): A new discount type

Add a third discount code, `BUY2`: the cheapest item in the cart is free when there are at least 2 items (counting quantities).

1. Add it to your codes list from Exercise 2.
2. Run `npx tsc`, and let TypeScript show you every place that needs updating. (If you used a `switch` with a `never` check in `getDiscount`, it will point right at it.)
3. Add tests for `BUY2`: with 1 item (no discount), and with several items.

<details>
<summary>Hint 1</summary>

`getDiscount` will need the cart items, not only the subtotal. Change its parameters, and let the type errors guide you to every call that needs updating.

</details>

<details>
<summary>Hint 2</summary>

To find the cheapest item's price, map the cart items to their product prices first, then use `Math.min(...prices)`.

</details>
