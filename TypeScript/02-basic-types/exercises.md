# 02 Basic Types: Exercises

**How to do these:**

- Work in `playground/ch02/`, one file per exercise (`ex1.ts`, `ex2.ts`, ...).
- Run with `node ch02/ex1.ts`, and check types with `npx tsc` from inside `playground`.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Infer or annotate?

For each line, decide: does it need a type annotation, or can TypeScript infer it? Write the file with annotations **only** where they're needed, and make `npx tsc` quiet.

```ts
// no-check
let username = "sam_99";
let loginCount;          // filled in later
let isAdmin = false;
let lastLogin;           // filled in later, text like "2026-09-24"

loginCount = 3;
lastLogin = "2026-09-24";
console.log(username, loginCount, isAdmin, lastLogin);
```

Expected output:

```
sam_99 3 false 2026-09-24
```

<details>
<summary>Hint</summary>

Hover over each variable in VS Code. If it shows `any`, TypeScript couldn't infer it, and that one needs a type.

</details>

---

## Exercise 2 (Easy): Fix the red lines

This weather report has three type errors. Find them with `npx tsc`, and fix the **values**, not the types:

```ts
// no-check
const city: string = "Pokhara";
let temperature: number = "24";
let isSunny: boolean = "yes";
let humidity: number = 70;
humidity = null;

console.log(city, temperature, isSunny, humidity);
```

Expected output after fixing (use `0` for the humidity):

```
Pokhara 24 true 0
```

<details>
<summary>Hint</summary>

Numbers don't have quotes. Booleans are only `true` or `false`.

</details>

---

## Exercise 3 (Medium): A value that can be missing

A library app stores who borrowed a book. When nobody has it, the value is `null`.

1. Declare `let borrowedBy` so it can hold a name **or** `null`, starting as `null`.
2. Print the message below with a check: if it's `null`, print `Available`, otherwise print `Borrowed by <name>`.
3. Set it to `"Priya"` and print the message again.

Expected output:

```
Available
Borrowed by Priya
```

<details>
<summary>Hint</summary>

The type is `string | null`. An `if (borrowedBy === null)` check works exactly like in JavaScript chapter 07.

</details>

---

## Exercise 4 (Challenge): `unknown` input

Pretend this value came from a user, so you can't trust its type:

```ts
// no-check
const input: unknown = "  hello world  ";
```

Write code that:

- If `input` is a string, prints it trimmed and in capital letters.
- If `input` is a number, prints it doubled.
- Otherwise, prints `Unsupported input`.

Expected output (for the string above):

```
HELLO WORLD
```

Change `input` to `21`, then to `true`, and check you get `42` and `Unsupported input`.

**Rule:** don't use `any`.

<details>
<summary>Hint</summary>

Use `typeof input === "string"` and `typeof input === "number"` checks. Inside each `if`, TypeScript knows the real type.

</details>
