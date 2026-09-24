# 01 Getting Started: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.js`, `ex2.js`, and so on).
- Run each one with `node ex1.js`.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Say hello

Print three lines about yourself: your name, where you live, and one thing you'd like to build with JavaScript.

Expected output (with your own details):

```
Hi, I'm Sandip
I live in <your city>
I want to build a budget tracker
```

<details>
<summary>Hint</summary>

Use one `console.log()` per line. Remember that text needs quotes.

</details>

---

## Exercise 2 (Easy): Calculator

Get JavaScript to do these calculations for you. Print each one with a label.

Expected output:

```
125 + 378 = 503
1000 - 247 = 753
12 * 12 = 144
144 / 12 = 12
```

**Rule:** don't type the answers (503, 753 and so on) yourself. Let JavaScript work them out.

<details>
<summary>Hint</summary>

In JavaScript, `*` means multiply and `/` means divide.
Remember the comma trick: you can print a label and a calculation in the same `console.log()`.

</details>

---

## Exercise 3 (Medium): Cafe receipt

You're writing the receipt printer for a small cafe. A customer ordered:

- 2 coffees at $4 each
- 1 sandwich at $7
- 3 cookies at $2 each

Print this receipt:

```
===== Corner Cafe =====
Coffee x2: 8
Sandwich x1: 7
Cookie x3: 6
-----------------------
Total: 21
Thank you, come again!
```

**Rule:** don't type the numbers 8, 7, 6 or 21 yourself. Work them out from the prices and quantities.

<details>
<summary>Hint</summary>

For the total, you can write the whole calculation on one line.
JavaScript does `*` before `+`, just like the math you learned in school.

</details>

---

## Exercise 4 (Medium): Bug hunt

This code has **4 bugs**. Copy it into `ex4.js`, run it, and fix one error at a time until it works.

```js
// Morning greeting program
console.log("Good morning!');
Console.log("Time for coffee");
console.log(Let's learn JavaScript);
console.log("Have a great day!";
```

When it's fixed, you should see:

```
Good morning!
Time for coffee
Let's learn JavaScript
Have a great day!
```

<details>
<summary>Hint 1</summary>

Read each error message carefully. It tells you the line number and what's wrong.

</details>

<details>
<summary>Hint 2</summary>

The errors might not show up in line order. JavaScript first checks the whole file for "grammar" mistakes (typos, missing brackets), and only then starts running it. That's normal.

</details>

<details>
<summary>Hint 3</summary>

Look closely at the text `Let's`. It contains an apostrophe, which is the same symbol as a single quote. Which kind of quotes should wrap it?

</details>

---

## Exercise 5 (Challenge): Your life in numbers

Write a program that prints fun facts about your life, all worked out by JavaScript. Use your own age.

- Days alive (roughly: age × 365)
- Hours alive
- Minutes alive
- Heartbeats (a heart beats about 70 times a minute)

Put a comment above each line explaining what it calculates.

Example output for someone who is 25:

```
My life in numbers
Days alive: 9125
Hours alive: 219000
Minutes alive: 13140000
Heartbeats: 919800000
```

<details>
<summary>Hint</summary>

Each fact builds on the one before it. Hours alive is just days alive × 24.
It's fine to write a long calculation on one line, like `25 * 365 * 24`.

</details>

**Bonus:** we sleep about 8 hours a day. Add a line showing how many *years* you've spent asleep.
(Don't worry if you get a long decimal number. You'll learn how to tidy that up later.)

---

## Before you move on

In Exercise 5, did you have to type your age again and again? And if your age changed, you'd have to fix it in every line. Annoying, right?

[Chapter 02: Variables](../02-variables/notes.md) fixes exactly that. 🙂
