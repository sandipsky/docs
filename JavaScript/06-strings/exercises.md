# 06 Strings: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.js`, `ex2.js`, and so on).
- Run each one with `node ex1.js` from a terminal opened in this folder.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Name badge

You're printing name badges for a conference. Start your file with these variables:

```js
const firstName = "Priya";
const lastName = "Sharma";
const company = "Blue Fox Studio";
```

Print this badge:

```
==============================
HELLO, MY NAME IS
PRIYA SHARMA
Blue Fox Studio
==============================
Initials: P.S.
Letters in name: 11
```

**Rule:** don't type the name, the initials, or the number 11 yourself. Build them from the variables. And don't type 30 `=` signs by hand either.

<details>
<summary>Hint 1</summary>

One string method repeats text as many times as you like.

</details>

<details>
<summary>Hint 2</summary>

The first letter of a string is at index 0. For the letter count, the space between the names doesn't count, so add up the two lengths.

</details>

---

## Exercise 2 (Easy): Clean up a sign-up form

Someone typed their email into your sign-up form, with some extra spaces and random capitals:

```js
const typedEmail = "   Sam.Lee@Example.COM  ";
```

Clean it up (no spaces around it, all lowercase), then print a report about it:

```
Before: [   Sam.Lee@Example.COM  ]
After: [sam.lee@example.com]
Length before: 24
Length after: 19
Has an @: true
Ends with .com: true
Gmail address: false
```

The square brackets make the spaces visible, like in the notes. Do the last three checks on the *cleaned* email.

<details>
<summary>Hint 1</summary>

You can do the whole clean-up in one line by chaining two methods. Save the result in a new variable.

</details>

<details>
<summary>Hint 2</summary>

`includes` and `endsWith` give you `true` or `false`, and you can put them straight into a `${ }` slot. For Gmail, what does every Gmail address end with?

</details>

---

## Exercise 3 (Medium): Library usernames

The city library creates a username and an email for every new member. Start with:

```js
const fullName = "  Grace Hopper ";
const memberNumber = 42;
```

The username is the first letter of the first name, then the last name, then the member number padded to 4 digits. Everything is lowercase.

Expected output:

```
Full name: Grace Hopper
First name: Grace
Last name: Hopper
Username: ghopper0042
Email: grace.hopper@citylibrary.org
```

**Rule:** your code must work for *any* two-word name. Change the variables to `"  Alan Turing  "` and `7`, run it again, and you should see:

```
Full name: Alan Turing
First name: Alan
Last name: Turing
Username: aturing0007
Email: alan.turing@citylibrary.org
```

So don't count the positions yourself. Let JavaScript find them.

<details>
<summary>Hint 1</summary>

Clean the name first. Then find *where* the space is. There's a method that tells you the index of some text.

</details>

<details>
<summary>Hint 2</summary>

Once you know the space's index, `slice` can cut out everything before it and everything after it. Remember that `slice(start, end)` stops just before `end`.

</details>

<details>
<summary>Hint 3</summary>

`padStart` only works on strings, and `memberNumber` is a number. You saw how to fix that in the notes.

</details>

---

## Exercise 4 (Medium): Restaurant receipt

Luigi's Trattoria wants its receipts to line up neatly. Here's table 4's order:

```js
const item1 = "Margherita pizza";
const price1 = 11.5;
const quantity1 = 2;

const item2 = "Lemonade";
const price2 = 3.25;
const quantity2 = 3;

const item3 = "Tiramisu";
const price3 = 6.75;
const quantity3 = 1;
```

Print this receipt:

```
Luigi's Trattoria
============================
2 x Margherita pizza  $23.00
3 x Lemonade           $9.75
1 x Tiramisu           $6.75
----------------------------
Total                 $39.50
============================
```

**Rules:**

- Every line under the name is exactly 28 characters wide.
- Don't type the prices, the total, or any of the spaces, `=` signs or `-` signs yourself.

<details>
<summary>Hint 1</summary>

Build each item line from two pieces. The left piece (like `2 x Margherita pizza`) is padded at the end to 20 characters. The right piece (like `$23.00`) is padded at the start to 8 characters. 20 + 8 = 28.

</details>

<details>
<summary>Hint 2</summary>

`toFixed(2)` turns a number into a string with two decimals. That's exactly what you need before padding. You can pad a template literal directly: `` `$${something}`.padStart(8) ``.

</details>

**Bonus:** fill the gaps with dots instead of spaces, so the Lemonade line looks like `3 x Lemonade...........$9.75`.

---

## Exercise 5 (Challenge): Parcel tracking codes

A delivery company prints a tracking code on every parcel. It always has the same shape: a 2-letter country, a 4-digit year, a 3-letter city, and a 5-digit parcel number, joined with dashes. But people type them into the website in all sorts of ways:

```js
const rawCode = "  np-2026-ktm-00451 ";
```

Write a program that cleans the code and prints what's inside it:

```
Clean code: NP-2026-KTM-00451
Parts: [ 'NP', '2026', 'KTM', '00451' ]
Country: NP
Year: 2026
City: KTM
Parcel number: 451
Looks valid: true
Next parcel: NP-2026-KTM-00452
```

What each line means:

- **Clean code:** no spaces around it, all capitals.
- **Parts:** the clean code split at every dash.
- **Parcel number:** the last 5 characters turned into a real number, so the zeros at the front disappear.
- **Looks valid:** `true` only if the clean code is exactly 17 characters long **and** starts with `NP-` (this company only ships inside Nepal).
- **Next parcel:** the code of the parcel after this one. The number goes up by 1 and is padded back to 5 digits.

Test it with `"in-2025-del-09999  "` too. You should see:

```
Clean code: IN-2025-DEL-09999
Parts: [ 'IN', '2025', 'DEL', '09999' ]
Country: IN
Year: 2025
City: DEL
Parcel number: 9999
Looks valid: false
Next parcel: IN-2025-DEL-10000
```

<details>
<summary>Hint 1</summary>

Every code has the same shape, so the pieces are always at the same positions. Write the clean code down with the index under each character, like the date example in the notes. Then `slice` out each piece.

</details>

<details>
<summary>Hint 2</summary>

To print the parts, use the comma trick from [chapter 01](../01-getting-started/notes.md): `console.log("Parts:", ...)`. If you put the parts inside a `${ }` slot instead, they'll print as plain text without the brackets.

</details>

<details>
<summary>Hint 3</summary>

`Number()` from [chapter 03](../03-data-types/notes.md) turns `"00451"` into `451`. For "Looks valid", you need `===` and `&&` from [chapter 04](../04-operators/notes.md). For "Next parcel", keep the first 12 characters of the code as they are and build a new ending.

</details>

---

## Before you move on

In Exercise 5, a bad code prints `Looks valid: false`... and then your program carries on printing the rest anyway. A real website would stop and show an error message instead.

To do that, your code needs to make decisions: *if* the code is valid, do this, *otherwise* do that. That's [chapter 07](../07-conditionals/notes.md).
