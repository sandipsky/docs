# 04 Operators: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.js`, `ex2.js`, and so on).
- Run each one with `node ex1.js` from a terminal opened in this folder.
- Let JavaScript do every calculation. Typing an answer yourself doesn't count!
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Pizza party

You ordered 3 pizzas, each cut into 8 slices, for 7 friends. Everyone gets the same number of slices, and any extra slices are left over.

Expected output:

```
Total slices: 24
Slices each: 3
Leftover slices: 3
Even split: false
```

**Rule:** start from three variables (pizzas, slices per pizza, and friends). Don't type 24 or any other answer yourself.

<details>
<summary>Hint 1</summary>

Which operator tells you what's left over after sharing things out equally?

</details>

<details>
<summary>Hint 2</summary>

For "Slices each", use the same trick as "Putting it together: minutes into hours" in the notes.

</details>

<details>
<summary>Hint 3</summary>

"Even split" is `true` only when nothing is left over. Which operator asks "are these two values equal?"

</details>

---

## Exercise 2 (Easy): Cafe loyalty card

A cafe's loyalty card gives you 1 point for every dollar you spend. You start with 0 points and 0 visits. Here's your week:

- Visit 1: you spend 15 dollars.
- Visit 2: you spend 40 dollars.
- It's your birthday, so the cafe doubles your points.
- Visit 3: you swap 60 points for a free lunch (and spend nothing).

Expected output:

```
After visit 1: 15 points
After visit 2: 55 points
Birthday bonus: 110 points
After visit 3: 50 points
Total visits: 3
```

**Rule:** update your variables only with the shortcuts `+=`, `-=`, `*=` and `++`. No `points = points + ...` this time.

<details>
<summary>Hint 1</summary>

You need two `let` variables: one for the points and one for the visits.

</details>

<details>
<summary>Hint 2</summary>

Doubling means multiplying by 2. Which shortcut multiplies a variable by something?

</details>

---

## Exercise 3 (Medium): Movie marathon

You're planning a movie marathon: three films that are 148, 136 and 169 minutes long, with two 20-minute breaks in between. It starts at 10:00 in the morning.

Expected output:

```
Films: 453 minutes
Breaks: 40 minutes
Total: 493 minutes
That's 8 hours and 13 minutes
The marathon ends at 18:13
```

**Rule:** don't type any of the answers. Use `%` to find the leftover minutes.

<details>
<summary>Hint 1</summary>

Take it one step at a time, with a variable for each step: the films, the breaks, then the total.

</details>

<details>
<summary>Hint 2</summary>

Turning 493 minutes into hours and minutes is the same trick as the film example in the notes.

</details>

<details>
<summary>Hint 3</summary>

For the end time, count in minutes since midnight. 10:00 is `10 * 60` minutes after midnight. Add the total, then turn the result back into hours and minutes.

</details>

<details>
<summary>Hint 4</summary>

To print `18:13` with no spaces around the colon, join the hours, `":"` and the minutes with `+` (remember chapter 03?).

</details>

---

## Exercise 4 (Medium): Theme park gatekeeper

You're writing the program for the gates at a theme park. Start your file with these lines about a visitor:

```js
const age = 11;
const height = 142; // in centimeters
const hasTicket = true;
const withAdult = false;
```

These are the park's rules:

- **Roller coaster:** at least 140 cm tall, and has a ticket.
- **Haunted house:** has a ticket, and is either 12 or older or with an adult.
- **Child price:** under 12, or 65 and over.
- **Needs a grown-up:** under 12, and not with an adult.

Expected output:

```
Roller coaster: true
Haunted house: false
Child price: true
Needs a grown-up: true
```

Then change `withAdult` to `true` and run it again. Exactly two lines should change. Guess which two before you run it!

**Rule:** work out every answer with comparison and logical operators. Apart from the starting lines, don't type `true` or `false` anywhere.

<details>
<summary>Hint 1</summary>

Turn each part of a rule into a comparison first, then join the parts. "At least 140 cm tall" is `height >= 140`.

</details>

<details>
<summary>Hint 2</summary>

The haunted house rule mixes AND with OR. Put brackets around the OR part, like the free delivery example in the notes.

</details>

<details>
<summary>Hint 3</summary>

"Not with an adult" is `!withAdult`.

</details>

---

## Exercise 5 (Challenge): Bookshop checkout

You're building the checkout for an online bookshop. Start your file with these lines:

```js
// Quantities from the web page arrive as text
const novelsText = "2";
const cookbooksText = "1";
const isMember = false;
```

Here's what else you know:

- A novel costs 14 dollars, and a cookbook costs 23.
- Delivery is free for members, or for orders of 50 dollars or more.
- Customers earn 1 loyalty point per dollar, and today is double-points day.

Expected output:

```
Novels: 2 x 14 = 28
Cookbooks: 1 x 23 = 23
Subtotal: 51
Books in the order: 3
Free delivery: true
Even number of books: false
Points earned: 102
```

**Rules:**

- Don't change the starting lines, and don't type any of the results yourself.
- For the points, start a `let` at 0, add the subtotal with `+=`, then double it with another shortcut.

<details>
<summary>Hint 1</summary>

Convert the quantities into numbers first (chapter 03), each into its own variable. Everything else builds on them.

</details>

<details>
<summary>Hint 2</summary>

Free delivery needs just one of two things to be true. Which logical operator means "at least one of these"?

</details>

<details>
<summary>Hint 3</summary>

"Even number of books" is the even/odd check from the notes: `%`, then `=== 0`.

</details>

---

## Before you move on

Guess what this prints, then run it:

```js
console.log(0.1 + 0.2);
```

Surprised? You're in good company. [Chapter 05](../05-numbers-and-math/notes.md) explains what's going on, and why it matters when your program handles money.
