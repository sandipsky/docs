# 03 Data Types: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.js`, `ex2.js`, and so on).
- Run each one with `node ex1.js` from a terminal opened in this folder.
- When a result looks strange, check its type with `typeof`. It's often the answer.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): The library record

A library keeps a record for every book. Create one variable for each detail of this book, and pick the right type each time:

- Title: The Hobbit
- Author: J.R.R. Tolkien
- Pages: 310
- Available to borrow: yes
- Due date: none, because nobody has borrowed it (empty, on purpose)
- Shelf: not decided yet (the librarian will fill it in later)

Then print each value next to its type.

Expected output:

```
Title: The Hobbit -> string
Author: J.R.R. Tolkien -> string
Pages: 310 -> number
Available: true -> boolean
Due date: null -> object
Shelf: undefined -> undefined
```

Yes, one of those types looks wrong. That's not your bug! Check the notes if you're not sure why.

**Rule:** let `typeof` work out the types. Don't type `string`, `number` and so on yourself.

<details>
<summary>Hint 1</summary>

"Yes" is a job for a boolean. For "empty, on purpose" and "not decided yet", reread the section on `undefined` and `null`.

</details>

<details>
<summary>Hint 2</summary>

One `console.log()` can hold a label, a variable, the text `"->"` and the variable's type, all separated by commas.

</details>

---

## Exercise 2 (Easy): Conference name badge

You're printing name badges for a baking conference. Start your file with these lines:

```js
const firstName = "Maya";
const lastName = "Patel";
const jobTitle = "Head Baker";
const company = "Blue Owl Bakery";
```

Build and print the three lines of the badge.

Expected output:

```
Maya Patel
Head Baker at Blue Owl Bakery
Hi, I'm Maya!
```

**Rule:** no commas inside `console.log()` this time. Build each line with `+`. And don't type `Maya`, `Patel` or the other details again: use the variables.

<details>
<summary>Hint 1</summary>

`+` never adds spaces for you. Look at the expected output and find every space. Each one has to come from a string you write.

</details>

<details>
<summary>Hint 2</summary>

The last line contains an apostrophe in `I'm`. Remember the `Let's` bug in chapter 01's bug hunt: which kind of quotes can safely go around it?

</details>

---

## Exercise 3 (Medium): The broken basket

Your online shop reads its prices from a web page, so they arrive as text. A customer is buying a shirt and a cap, and the checkout shows a crazy total. Copy this into `ex3.js` and run it:

```js
// Prices arrive from the web page as text
const shirtPrice = "20";
const capPrice = "12";
const shipping = 5;

const total = shirtPrice + capPrice + shipping;
console.log("Total:", total);
console.log("Type:", typeof total);
```

The total comes out as `20125`. Fix the program, then add a friendly last line, so it prints:

```
Total: 37
Type: number
Your order comes to 37 dollars.
```

**Rule:** don't change the three lines that create `shirtPrice`, `capPrice` and `shipping`. The prices really do arrive as text. Build the last line with `+`.

<details>
<summary>Hint 1</summary>

Check each of the three values with `typeof`. Which ones are strings, and which is a number? How does that explain `20125`?

</details>

<details>
<summary>Hint 2</summary>

Turn the text into numbers before adding them. The `Number()` section in the notes shows how.

</details>

---

## Exercise 4 (Medium): Hotel check-in card

A hotel's check-in program keeps a card for each guest. Some details are known, one is empty on purpose, and one isn't known yet:

- Guest: Leo Rossi
- Nights: 3
- Breakfast included: yes
- Special requests: the guest said they have none
- Room number: not assigned yet

Print the card. Then the room gets ready: give the guest room 214, print the room again, and finish with a summary sentence.

Expected output:

```
--- Check-in card ---
Guest: Leo Rossi
Nights: 3
Breakfast: true
Special requests: null
Room: undefined
--- Room is ready ---
Room: 214
Leo Rossi is in room 214 for 3 nights.
```

**Rule:** only the detail that changes should use `let`. Build the last sentence with `+`, using your variables.

<details>
<summary>Hint 1</summary>

"None" and "not assigned yet" are two different kinds of nothing. Which one do *you* put in the box, and which one does JavaScript give you?

</details>

<details>
<summary>Hint 2</summary>

To get `Room: undefined`, create the room variable without a value (you did this with `let winner;` in chapter 02). Later, put `214` into it.

</details>

---

## Exercise 5 (Challenge): Cinema booking summary

A cinema's booking form sends everything as text, even the number of tickets. Start your file with these lines:

```js
// From the booking form (a form always sends text)
const movieTitle = "Dune: Part Two";
const adultTicketsText = "2";
const childTicketsText = "1";
```

Here's what else you know:

- An adult ticket costs 12 dollars, and a child ticket costs 8.
- The customer asked for seats together (yes).
- The customer didn't enter a promo code (empty, on purpose).

Print this booking summary:

```
=== Booking summary ===
Movie: Dune: Part Two
Tickets: 3 (2 adult, 1 child)
Total: 32 dollars
Seats together: true
Promo code: null
Check: string -> number
```

The last line checks your work: it shows the type of `adultTicketsText`, then the type of your converted adult tickets.

**Rules:**

- Don't change the starting lines. After them, don't type the numbers 2, 1, 3 or 32 yourself: work them out from the variables.
- Build the `Tickets:` line and the `Total:` line with `+`, and store each one in a variable before printing it.

<details>
<summary>Hint 1</summary>

Convert the two ticket counts into numbers first, each in its own variable. Everything else builds on those two.

</details>

<details>
<summary>Hint 2</summary>

Seeing `Total: 248 dollars` or `Tickets: 21`? You've hit the trap from "The `"5" + 3` surprise" in the notes. Work out the totals in their own variables before joining them into text.

</details>

<details>
<summary>Hint 3</summary>

The `Tickets:` line has many pieces: text, a number, text, another number, and so on. Build it one piece at a time, and run your file after each piece to check the spaces and brackets.

</details>

---

## Before you move on

In this chapter, you typed `true` and `false` yourself. In real programs, most booleans come from asking questions. Guess what these two lines print, then run them:

```js
console.log(10 > 5);
console.log(3 > 7);
```

[Chapter 04](../04-operators/notes.md) teaches you how to ask questions like these, and a lot more.
