# 11 tsconfig and Modules: Exercises

**How to do these:**

- Work in `playground/ch11/`. Some exercises have several files: make a subfolder for each (`ch11/ex1/`, ...).
- Run with `node`, and check types with `npx tsc` from inside `playground`.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Explain your settings

Without looking at the notes, write a comment next to each line of your playground's `tsconfig.json` explaining what it does in your own words. Then check your answers against the table in the notes.

<details>
<summary>Hint</summary>

JSON doesn't allow comments, but `tsconfig.json` is special: TypeScript accepts `//` comments in it.

</details>

---

## Exercise 2 (Easy): Split into modules

Create two files in `ch11/ex2/`:

- `library.ts` exports `interface Book` (`title`, `author`) and a function `formatBook(book: Book): string`.
- `main.ts` imports both and prints two books.

Expected output of `node ch11/ex2/main.ts`:

```
"Dune" by Frank Herbert
"Coco" by Lee Unkrich
```

`npx tsc` must be quiet.

<details>
<summary>Hint</summary>

Two import lines: `import type { Book } from "./library.ts";` and `import { formatBook } from "./library.ts";`.

</details>

---

## Exercise 3 (Medium): Stricter checks

Add `"noUncheckedIndexedAccess": true` to your `tsconfig.json` and run `npx tsc`.

1. Did any of your earlier exercises get new errors? For each one, write down why TypeScript thinks the value might be `undefined`.
2. Fix them properly: check for `undefined` instead of using `!` or `as`.

(If nothing breaks, write this code and fix it:)

```ts
// no-check
const temperatures = [21, 24, 19];
console.log(temperatures[0].toFixed(1));
```

<details>
<summary>Hint</summary>

An `if (value !== undefined)` check, or `?.`, or `?? 0` for a default. Each one narrows away `undefined`.

</details>

---

## Exercise 4 (Challenge): A typed command-line tool

Make `ch11/ex4/greet.ts`, which reads a name from the command line:

```
node ch11/ex4/greet.ts Asha
```

prints:

```
Hello, Asha!
```

and with no name, prints `Hello, stranger!`.

1. Write it using `process.argv` (JavaScript chapter 49), and read the error from `npx tsc`.
2. Fix the error with the two steps from the notes.

<details>
<summary>Hint 1</summary>

`process.argv[2]` is the first word after the file name. It might be `undefined`, so use `??`.

</details>

<details>
<summary>Hint 2</summary>

`npm install --save-dev @types/node`, then `"types": ["node"]` inside `compilerOptions`.

</details>
