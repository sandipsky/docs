# 05 Functions: Exercises

**How to do these:**

- Work in `playground/ch05/`, one file per exercise.
- Run with `node`, and check types with `npx tsc`. Every exercise must pass `npx tsc` with no errors.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Add the types

This JavaScript works, but `npx tsc` complains about every parameter. Add parameter and return types.

```ts
// no-check
function areaOfRoom(width, length) {
  return width * length;
}

function describeRoom(name, width, length) {
  return `${name}: ${areaOfRoom(width, length)} m²`;
}

console.log(describeRoom("Kitchen", 3, 4));
```

Expected output:

```
Kitchen: 12 m²
```

<details>
<summary>Hint</summary>

Two functions, five parameters. Each parameter gets `: number` or `: string`, and each function gets a return type after its `)`.

</details>

---

## Exercise 2 (Easy): Optional and default

Write a function `makeTicket` for a cinema that takes:

- `movie` (required, text)
- `seat` (required, text)
- `price`, defaulting to `12`
- `snack` (optional, text)

It returns a line of text. Calling it like this:

```ts
// no-check
console.log(makeTicket("Coco", "F7"));
console.log(makeTicket("Coco", "F8", 9, "popcorn"));
```

should print:

```
Coco, seat F7, $12
Coco, seat F8, $9, with popcorn
```

<details>
<summary>Hint</summary>

The optional one goes last: `snack?: string`. Inside, check `if (snack)` before adding `, with ...`.

</details>

---

## Exercise 3 (Medium): A function type for discounts

A shop has several discount rules. Each rule is a function that takes a price and returns the new price.

1. Create `type Discount = ...` for such a function.
2. Create three discounts: `noDiscount`, `tenPercentOff`, and `fiveOff` (takes $5 off, but never goes below 0).
3. Write `applyDiscount(price: number, discount: Discount): number`.

```ts
// no-check
console.log(applyDiscount(40, noDiscount));
console.log(applyDiscount(40, tenPercentOff));
console.log(applyDiscount(3, fiveOff));
```

Expected output:

```
40
36
0
```

<details>
<summary>Hint</summary>

`type Discount = (price: number) => number;`. For "never below 0", `Math.max(0, ...)` from JavaScript chapter 05 is handy.

</details>

---

## Exercise 4 (Challenge): A typed grade report

Write these functions, with full types:

- `average(...scores: number[]): number` returns the average (and `0` if there are no scores).
- `letterGrade(score: number): string` returns `"A"` for 90+, `"B"` for 80+, `"C"` for 70+, otherwise `"F"`.
- `report(name: string, ...scores: number[]): void` prints one line, using the other two functions.

```ts
// no-check
report("Asha", 92, 88, 95);
report("Ben", 70, 65);
report("Chen");
```

Expected output:

```
Asha: 91.67 (A)
Ben: 67.5 (F)
Chen: 0 (F)
```

Round the average to 2 decimal places for display, but don't show extra zeros (`67.5`, not `67.50`).

<details>
<summary>Hint 1</summary>

`Math.round(x * 100) / 100` rounds to 2 decimals and keeps the result a number, so there are no extra zeros.

</details>

<details>
<summary>Hint 2</summary>

Guard against dividing by zero first: `if (scores.length === 0) return 0;`.

</details>
