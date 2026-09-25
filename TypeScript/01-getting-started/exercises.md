# 01 Getting Started: Exercises

**How to do these:**

- Do these in your `playground` folder. Make a subfolder for each chapter, like `playground/ch01/`, and one file per exercise (`ex1.ts`, `ex2.ts`, ...).
- Run a file with `node ch01/ex1.ts`, and check all your types with `npx tsc` (from inside `playground`).
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Set up and say hello

Set up your playground exactly as the notes describe. Then create `ch01/ex1.ts` that prints:

```
Hello, TypeScript!
```

Run it with `node`, then run `npx tsc` and confirm it prints nothing (no errors).

<details>
<summary>Hint</summary>

Any JavaScript file is already valid TypeScript. `console.log` works exactly like before.

</details>

---

## Exercise 2 (Easy): Label the boxes

Write a program for a cinema ticket with three variables, each with a type annotation: the movie title (text), the seat number (a number), and whether it's a 3D showing (true/false).

Print them so the output is:

```
Movie: Inside Out 2
Seat: 14
3D: false
```

<details>
<summary>Hint</summary>

The three basic types are `string`, `number` and `boolean`. The annotation goes after the name: `const seat: number = 14;`.

</details>

---

## Exercise 3 (Medium): Make TypeScript complain

Copy your Exercise 2 file to `ex3.ts`. Then, **on purpose**, cause three different type errors, one for each variable, by assigning a value of the wrong type. (Change `const` to `let` so you can reassign.)

1. Run `npx tsc` and read each error. Write down the line number and the message for each one.
2. Now run `node ch01/ex3.ts`. Does it run? Write one sentence explaining why.
3. Fix the errors so `npx tsc` is quiet again.

<details>
<summary>Hint</summary>

Reread the section "Types disappear when the code runs".

</details>

---

## Exercise 4 (Challenge): Catch the chapter 38 bug

In JavaScript, this cart total is wrong, because the quantity came from a form as text:

```js
const unitPrice = 5;
const quantity = "3"; // came from an input box
const extraItems = 2;
console.log("Items:", quantity + extraItems); // prints: Items: 32
```

Rewrite it in TypeScript so that:

1. The type checker would have caught the bug, if the quantity were labeled as a number.
2. You convert the text to a number properly (remember JavaScript chapter 05).
3. The final program prints:

```
Items: 5
Total: 25
```

<details>
<summary>Hint 1</summary>

Keep the raw text in its own variable, like `const quantityText: string = "3";`, then make a second variable `const quantity: number = ...` using `Number()`.

</details>

<details>
<summary>Hint 2</summary>

Try writing `const quantity: number = "3";` first, and read the error. That's the protection you get.

</details>
