# 05 Numbers and Math: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.js`, `ex2.js`, and so on).
- Run each one with `node ex1.js` from a terminal opened in this folder.
- Let JavaScript do every calculation, as always. No typing answers yourself!
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Party planner

You're organizing a birthday party for 47 guests. Each table seats 6 people. Cupcakes come in boxes of 10, and every guest gets one cupcake.

Expected output:

```
Tables needed: 8
Full tables: 7
Empty seats: 1
Cupcake boxes: 5
Spare cupcakes: 3
```

**Rule:** use `Math.ceil` and `Math.floor`. Start from three variables: the guests, the seats per table and the cupcakes per box.

<details>
<summary>Hint 1</summary>

"Tables needed" and "Full tables" use the same division. One rounds up and one rounds down. If you round down for "Tables needed", where does the 47th guest sit?

</details>

<details>
<summary>Hint 2</summary>

For the empty seats: how many seats do all your tables have together? Take the guests away from that. Spare cupcakes work the same way.

</details>

---

## Exercise 2 (Easy): The corner shop till

The till at a corner shop works in cents. A customer buys a magazine (499 cents), a phone charger (1250 cents) and a chocolate bar (99 cents). Sales tax is 8%.

Expected output:

```
Subtotal: $18.48
Tax: $1.48
Total: $19.96
```

**Rules:** keep all the math in whole cents. Round the tax to a whole number of cents. Only turn cents into dollars when you print.

<details>
<summary>Hint 1</summary>

8% of an amount is the amount times `0.08`. The tax can come out with a fraction of a cent. Which `Math` tool rounds to the nearest whole number?

</details>

<details>
<summary>Hint 2</summary>

To show 1848 cents as `$18.48`: divide by 100, use `toFixed(2)`, and join a `"$"` in front with `+`. (Or try an `Intl.NumberFormat` formatter from the notes.)

</details>

---

## Exercise 3 (Medium): Parcel shipping calculator

You're building a shipping calculator for an online shop. The parcel's details come from the product page as text. Start your file with these lines:

```js
// Read from a product page
const weightText = "2.75kg";
const lengthText = "40cm";
const widthText = "30cm";
const heightText = "25cm";
const messyText = "about 3kg";
```

The courier's rules:

- They charge for whichever is heavier: the actual weight, or the **size weight**.
- Size weight (in kg) is length × width × height (in cm) ÷ 5000. It stops big, light boxes, like a box of pillows, from being shipped for almost nothing.
- The price is 3.50 dollars per kg.

Expected output:

```
Actual weight: 2.75 kg
Size weight: 6 kg
You pay for: 6 kg
Shipping: $21.00
Messy text is a number: false
```

**Rules:** read every number out of the text with `parseInt` or `parseFloat` (don't type them again). Use `Math.max` to pick the weight you pay for. The last line checks `messyText` with `Number.isNaN`.

<details>
<summary>Hint 1</summary>

Which one keeps the `.75` in `"2.75kg"`: `parseInt` or `parseFloat`? For the sizes, whole numbers are fine.

</details>

<details>
<summary>Hint 2</summary>

The last line asks "is it a number?", but `Number.isNaN` answers the opposite question: "is it `NaN`?". Which operator from chapter 04 flips `true` and `false`?

</details>

---

## Exercise 4 (Medium): Board game night

It's board game night, and nobody can find the dice. Write a program that rolls two dice, adds them up, checks for a double, and picks which of the 4 players goes first.

Example output (yours will be different every time you run it):

```
Die 1: 4
Die 2: 4
Total: 8
Double: true
Player 3 goes first
```

**Rules:**

- Each die is a whole number from 1 to 6. The first player is a whole number from 1 to 4.
- Work out "Double" by comparing the two dice. Don't type `true` or `false`.

Run it at least 10 times. The dice should always land between 1 and 6, and you should see a double now and then (about 1 time in 6).

<details>
<summary>Hint 1</summary>

The dice recipe is in the notes. Do you need to change it to pick one of 4 players?

</details>

<details>
<summary>Hint 2</summary>

A double means both dice show the same number. Which comparison operator checks that?

</details>

---

## Exercise 5 (Challenge): Split the bill

Three friends had dinner, and you're writing the bill-splitting app. The waiter types everything into the app, so it all arrives as text. Start your file with these lines:

```js
// Typed into the app by the waiter (everything arrives as text)
const billText = "87.40";
const tipPercentText = "15";
const peopleText = "3";
```

Expected output:

```
Bill: $87.40
Tip (15%): $13.11
Total: $100.51
Each person pays: $33.51
Extra for the tip jar: $0.02
Splits evenly: false
```

**Rules:**

- Convert the text first, then work in whole cents from there on.
- Round the tip to the nearest cent. Round each person's share **up** to the next cent, so the bill is always covered.
- "Extra for the tip jar" is what the friends pay all together, minus the total.
- Format every amount with one `Intl.NumberFormat` currency formatter.
- Don't type any of the amounts yourself. Even the `15` in `Tip (15%)` should come from the starting variables.

<details>
<summary>Hint 1</summary>

Start by turning the three texts into numbers. Which tool suits `"87.40"`, and which suits `"15"` and `"3"`?

</details>

<details>
<summary>Hint 2</summary>

For the bill in cents, multiply by 100 and round the result. The multiplication can leave one of those tiny decimal errors, and rounding cleans it up.

</details>

<details>
<summary>Hint 3</summary>

Which rounding tool always goes up? And to check "Splits evenly", ask whether sharing the total cents between the friends leaves anything over (chapter 04).

</details>

---

## Before you move on

Look at how you've been building text since chapter 03: `"Your order comes to " + total + " dollars."`. All those quotes and plus signs are fiddly, and one missing space breaks the output.

[Chapter 06](../06-strings/notes.md) shows you a much neater way to put values inside text, plus lots of tools for working with strings: changing capital letters, trimming spaces, searching, and more.
