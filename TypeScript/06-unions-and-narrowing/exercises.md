# 06 Unions and Narrowing: Exercises

**How to do these:**

- Work in `playground/ch06/`, one file per exercise.
- Run with `node`, and check types with `npx tsc`. Every exercise must pass `npx tsc` with no errors.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Price tags

A price can arrive as a number (`12`) or as text (`"12.5"`). Write `toPrice(value: number | string): number` that always returns a number, then print the total of these prices:

```ts
// no-check
const prices = [12, "12.5", 3, "0.5"];
```

Expected output:

```
Total: 28
```

<details>
<summary>Hint</summary>

Narrow with `typeof value === "string"`, and convert with `Number()` in that branch. The array's type is `(number | string)[]`.

</details>

---

## Exercise 2 (Easy): Traffic light

Create `type Light = "red" | "yellow" | "green"` and a function `action(light: Light): string` that returns `"Stop"`, `"Slow down"` or `"Go"`.

```ts
// no-check
console.log(action("red"));
console.log(action("green"));
```

Expected output:

```
Stop
Go
```

Then try `action("blue")` and read the error. Remove that line again.

<details>
<summary>Hint</summary>

A `switch (light)` with three `case`s works nicely here.

</details>

---

## Exercise 3 (Medium): Order status messages

An online shop's orders are one of three kinds:

- pending (no extra data)
- shipped, with a `trackingCode`
- delivered, with a `deliveredOn` date string

Model them as a discriminated union on a `status` property, and write `message(order: Order): string`:

```ts
// no-check
console.log(message({ status: "pending" }));
console.log(message({ status: "shipped", trackingCode: "NP123" }));
console.log(message({ status: "delivered", deliveredOn: "2026-09-24" }));
```

Expected output:

```
We're packing your order.
On its way! Tracking code: NP123
Delivered on 2026-09-24.
```

<details>
<summary>Hint</summary>

Three interfaces, each with a literal `status`, like `status: "shipped"`. Then `type Order = Pending | Shipped | Delivered;` and a `switch (order.status)`.

</details>

---

## Exercise 4 (Challenge): Never forget a case

Take your Exercise 3 code and add the `never` check from the notes in a `default` branch.

1. Confirm `npx tsc` is still quiet.
2. Add a fourth kind, `cancelled`, with a `reason` string, to the `Order` union **without** updating the `switch`. Read the error: which type does it name?
3. Handle the new case, so this line:

```ts
// no-check
console.log(message({ status: "cancelled", reason: "out of stock" }));
```

prints:

```
Cancelled: out of stock
```

<details>
<summary>Hint</summary>

The `default` branch is `const unhandled: never = order; return unhandled;`. The error in step 2 should mention your new interface by name.

</details>
