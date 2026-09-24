# 02 Variables: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.js`, `ex2.js`, and so on).
- Run each one with `node ex1.js` from a terminal opened in this folder.
- Use `const` by default, and `let` only for values that change.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Your profile card

You're making a profile card for a running club's website. Create one variable for each detail: your first name, your city, your age, and your favorite food. Then print each one with a label.

Expected output (with your own details):

```
Name: Sandip
City: <your city>
Age: 25
Favorite food: momo
```

**Rule:** the details themselves (your name, city and so on) should only appear once each, when you create the variables. Inside `console.log()`, use the variable names.

<details>
<summary>Hint</summary>

Remember the comma trick from chapter 01: you can put a label and a value in the same `console.log()`, separated by a comma. A variable name works as the value.

</details>

---

## Exercise 2 (Easy): Basketball scoreboard

You're keeping score for your team at a basketball game. The score starts at 0. Then your team scores a 2-point shot, a 3-point shot, and a free throw (worth 1 point).

Use **one** variable for the score. After each basket, update it and print it.

Expected output:

```
Start: 0
After a 2-pointer: 2
After a 3-pointer: 5
After a free throw: 6
```

**Rule:** don't type the running totals (2, 5 and 6) yourself. Let JavaScript work them out from the old score.

<details>
<summary>Hint 1</summary>

The score changes, so which keyword should you use to create it: `let` or `const`?

</details>

<details>
<summary>Hint 2</summary>

Look at "Updating from the old value" in the notes. The new score is the old score plus the points for that basket.

</details>

---

## Exercise 3 (Medium): Bug hunt at the library

A library wrote a small program to work out late fees, but it won't run. Copy it into `ex3.js` and fix it one error at a time.

```js
// Library late fees
const feePerDay = 2;
const 1stBookDays = 3;
const second-book-days = 5;

const totalDays = 1stBookDays + second-book-days;
const totalFee = totalDays * feePerDay;
console.log("Days late:", totalDays);
console.log("Total fee:", totalfee);

totalFee = totalFee - 4;
console.log("Fee after member discount:", totalFee);
```

There are 4 bugs, and some of them show up in more than one place. When it's fixed, you should see:

```
Days late: 8
Total fee: 16
Fee after member discount: 12
```

**Rule:** fix the bugs, don't rewrite the program. Any new names you pick should follow the naming rules and use camelCase.

<details>
<summary>Hint 1</summary>

Same method as the bug hunt in chapter 01: run the file, read the error and its line number, fix that one thing, and run it again.

</details>

<details>
<summary>Hint 2</summary>

Two of the names break the naming rules (check the table in the notes). When you rename a variable, rename it everywhere it's used, not only where it's created.

</details>

<details>
<summary>Hint 3</summary>

One of the error messages is confusing: "Missing initializer in const declaration". JavaScript reads the dashes in `second-book-days` as minus signs, so it thinks you made a `const` called `second` and forgot its value. What does that tell you about dashes in names?

</details>

<details>
<summary>Hint 4</summary>

The last bug only shows up after the others are fixed. Ask yourself: which value changes after it's created?

</details>

---

## Exercise 4 (Medium): The mixed-up drinks

At a busy cafe, a waiter put two drinks on the wrong tables. Start your file with these two lines:

```js
let table1 = "orange juice";
let table2 = "hot chocolate";
```

Print what each table has, swap the drinks, then print again.

Expected output:

```
Before the swap
Table 1: orange juice
Table 2: hot chocolate
After the swap
Table 1: hot chocolate
Table 2: orange juice
```

**Rule:** after the first two lines, don't type `"orange juice"` or `"hot chocolate"` again. Move the values between the variables instead.

<details>
<summary>Hint 1</summary>

Try writing `table1 = table2;` and then print both tables. Where did the orange juice go?

</details>

<details>
<summary>Hint 2</summary>

Picture a real waiter holding a drink in each hand. To swap them, they'd put one drink down on a tray for a moment. Your program needs a "tray" too.

</details>

---

## Exercise 5 (Challenge): Your life in numbers, upgraded

Time to fix the program from [chapter 01's last exercise](../01-getting-started/exercises.md) for good. Write a new version of "Your life in numbers" that uses variables.

Your program must follow these rules:

- Your age appears **only once** in the whole file.
- Every fixed number gets a name too: days in a year (365), hours in a day (24), minutes in an hour (60), and heartbeats per minute (70).
- Each fact is its own variable, built from the one before it. For example, hours alive comes from days alive.
- Add one new fact: breaths taken (we breathe about 16 times a minute).
- Keep a comment above each calculation explaining what it works out, like in chapter 01.

Expected output for someone who is 25:

```
My life in numbers
Days alive: 9125
Hours alive: 219000
Minutes alive: 13140000
Heartbeats: 919800000
Breaths: 210240000
```

Now test it: change the age to 30 and run it again. The second line should say `Days alive: 10950`, and every other number should change too, without you touching those lines. Finally, put in your own age.

<details>
<summary>Hint 1</summary>

Start with the fixed values at the top of the file, each in its own `const` with a clear name, such as `daysPerYear`.

</details>

<details>
<summary>Hint 2</summary>

Work down the list in order. Days alive uses your age. Hours alive uses days alive. Which variable should minutes alive use?

</details>

<details>
<summary>Hint 3</summary>

Heartbeats and breaths both come from the same fact. Which one?

</details>

**Bonus:** bring back the "years asleep" line from chapter 01 (we sleep about 8 hours a day), with a named value for the hours of sleep. For age 25 you should see `Years asleep: 8.333333333333334`. You'll learn to tidy up long decimals like that in chapter 05.

---

## Before you move on

Your boxes held two kinds of things: numbers like `25` and text like `"Lisbon"`. Does that difference matter? Guess what each line prints, then run it:

```js
console.log(25 + 1);
console.log("25" + 1);
```

If the second line surprised you, [chapter 03](../03-data-types/notes.md) explains why. 🙂
