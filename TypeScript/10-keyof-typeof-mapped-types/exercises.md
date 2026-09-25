# 10 keyof, typeof and Mapped Types: Exercises

**How to do these:**

- Work in `playground/ch10/`, one file per exercise.
- Run with `node`, and check types with `npx tsc`. Every exercise must pass `npx tsc` with no errors.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Menu keys

```ts
// no-check
const menu = { soup: 5, pasta: 12, salad: 7 };
```

1. Create `type Dish` as the union of the menu's keys, using `keyof typeof`.
2. Write `priceOf(dish: Dish): number`.
3. Print the price of pasta, then add `cake: 6` to the menu and check that `priceOf("cake")` works without changing `Dish`.

Expected output (after adding cake):

```
12
6
```

<details>
<summary>Hint</summary>

`type Dish = keyof typeof menu;`. Read it right to left: the type of `menu`, then its keys.

</details>

---

## Exercise 2 (Easy): A list and a union from one line

A gym has membership levels `"basic"`, `"plus"` and `"premium"`.

1. Write them **once**, as an array with `as const`.
2. Create `type Level` from that array.
3. Loop over the array to print all levels, and write `isLevel(value: string): boolean`.

```ts
// no-check
console.log(isLevel("plus"), isLevel("gold"));
```

Expected output:

```
basic
plus
premium
true false
```

<details>
<summary>Hint</summary>

`type Level = (typeof levels)[number];`. For `isLevel`, `levels.includes(value as Level)` works, because `includes` on a `readonly Level[]` expects a `Level`.

</details>

---

## Exercise 3 (Medium): A type-safe sort

Write `sortBy<T, K extends keyof T>(items: T[], key: K): T[]`, which returns a **new** sorted array (smallest first). Use it on:

```ts
// no-check
const books = [
  { title: "Dune", pages: 412 },
  { title: "Coco", pages: 96 },
  { title: "Emma", pages: 474 },
];
console.log(sortBy(books, "pages").map((book) => book.title));
console.log(sortBy(books, "title").map((book) => book.title));
```

Expected output:

```
[ 'Coco', 'Dune', 'Emma' ]
[ 'Coco', 'Dune', 'Emma' ]
```

Then check that `sortBy(books, "author")` is an error.

<details>
<summary>Hint</summary>

Use `toSorted` (JavaScript chapter 13) with a compare function that compares `a[key]` and `b[key]` with `<` and `>`, returning `-1`, `1` or `0`.

</details>

---

## Exercise 4 (Challenge): A form's error messages

```ts
// no-check
interface SignUpForm {
  username: string;
  email: string;
  age: number;
}
```

1. Write a mapped type `FormErrors<T>` that has the same keys as `T`, each an **optional** `string` (the error message).
2. Write `validate(form: SignUpForm): FormErrors<SignUpForm>` that adds a message when the username is shorter than 3 characters, when the email has no `@`, and when the age is under 13.

```ts
// no-check
console.log(validate({ username: "al", email: "al.example.com", age: 30 }));
console.log(validate({ username: "alice", email: "alice@example.com", age: 30 }));
```

Expected output:

```
{ username: 'Too short', email: 'Missing @' }
{}
```

<details>
<summary>Hint</summary>

`type FormErrors<T> = { [K in keyof T]?: string };`. Start with `const errors: FormErrors<SignUpForm> = {};` and add properties with `if` checks.

</details>
