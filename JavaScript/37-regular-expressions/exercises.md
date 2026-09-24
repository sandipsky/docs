# 37 Regular Expressions: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.js`, `ex2.js`, and so on).
- Run each one with `node ex1.js`.
- Build each regex a piece at a time. Print what it finds with `match` and the `g` flag, and add the next piece only when the current one works. [regex101.com](https://regex101.com) is great for experimenting.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Numbers on a receipt

A grocery receipt came through as one line of text:

```js
const receipt = "3 apples $2, 12 eggs $5, 1 loaf of bread $3";
```

Use `match` to pull out:

1. Every number on the receipt.
2. Only the prices, with their dollar signs.
3. Then add up the prices and print the total.

Expected output:

```
All numbers: [ '3', '2', '12', '5', '1', '3' ]
Prices: [ '$2', '$5', '$3' ]
Total: $10
```

**Rule:** don't type any of the numbers yourself. Let your regexes find them.

<details>
<summary>Hint 1</summary>

For whole numbers, you want "one or more digits in a row". Don't forget the `g` flag, or you'll only get the first one.

</details>

<details>
<summary>Hint 2</summary>

A price is a dollar sign followed by digits. `$` is a special character in a regex, so it needs a backslash in front to mean a real dollar sign.

</details>

<details>
<summary>Hint 3</summary>

The prices come back as strings like `"$5"`. Remove the `$`, turn each one into a number with `Number`, and add them up, for example with `map` and `reduce` from [chapter 13](../13-array-methods/notes.md).

</details>

---

## Exercise 2 (Easy): Gym membership IDs

Every member of a gym has an ID like `GYM-0042`: the letters `GYM`, a dash, then exactly four digits. The front desk wants to check IDs before looking them up.

```js
const ids = ["GYM-0042", "GYM-42", "gym-0042", "GYM-00420", "MY GYM-0042", "GYM-12A4"];
```

Write **one** regex for a valid ID and test every ID in the array. Then the manager says lowercase letters are fine too. Make a second version of your regex that accepts `gym-0042` by adding one flag, and test that ID with it.

Expected output:

```
GYM-0042: valid
GYM-42: invalid
gym-0042: invalid
GYM-00420: invalid
MY GYM-0042: invalid
GYM-12A4: invalid
With the i flag, gym-0042 is valid
```

<details>
<summary>Hint 1</summary>

Start with the parts in order: the letters `GYM`, a dash, and four digits. A normal letter or a dash matches itself.

</details>

<details>
<summary>Hint 2</summary>

If `GYM-00420` or `MY GYM-0042` come out as valid, your regex is only checking that a valid ID appears *somewhere*. Which two pieces make the whole text match?

</details>

---

## Exercise 3 (Medium): Tidy phone numbers

A small business is importing its contact list, and everyone typed phone numbers differently:

```js
const contacts = ["(555) 123-4567", "555.987.6543", "555 222 3333", "call me!", "555-12-345"];
```

Write a function `formatPhone(input)` that returns the number in one tidy style, `555-123-4567`, or the text `"invalid"` if it isn't a 10-digit number. Then print every contact.

It takes three steps:

1. Remove every character that isn't a digit.
2. Check that exactly ten digits are left. If not, return `"invalid"`.
3. Split the digits into groups of 3, 3, and 4, with dashes between them.

Expected output:

```
(555) 123-4567 -> 555-123-4567
555.987.6543 -> 555-987-6543
555 222 3333 -> 555-222-3333
call me! -> invalid
555-12-345 -> invalid
```

**Rule:** for step 3, use `replace` with a regex that has three groups. No `slice`.

<details>
<summary>Hint 1</summary>

Steps 1 and 2 are exactly what `cleanPhone` did in the notes. You can start from there.

</details>

<details>
<summary>Hint 2</summary>

For step 3, write a pattern with three groups: three digits, three digits, four digits. In the replacement text, `$1`, `$2`, and `$3` stand for the groups.

</details>

---

## Exercise 4 (Medium): Appointment reminders

A calendar app exports your week as one long line:

```js
const schedule =
  "Dentist on 2026-10-03 at 09:30, Gym on 2026-10-04 at 18:00, Haircut on 2026-10-10 at 12:15";
```

Write **one** regex with **named groups** for the appointment's name, year, month, day, and time. Use `matchAll` to print a reminder for each appointment in day/month/year order, then say how many you found.

Expected output:

```
03/10/2026 at 09:30: Dentist
04/10/2026 at 18:00: Gym
10/10/2026 at 12:15: Haircut
3 appointments found
```

<details>
<summary>Hint 1</summary>

Build it up. First, a pattern for just the dates. Print `schedule.match(yourPattern)` with the `g` flag and check that you see all three dates. Then add ` at ` and the time, then the name and ` on ` in front.

</details>

<details>
<summary>Hint 2</summary>

A time like `09:30` is two digits, a colon, and two digits. The name is one or more word characters. Once each piece works, wrap it in a named group like `(?<time>...)`.

</details>

<details>
<summary>Hint 3</summary>

`matchAll` needs the `g` flag. Inside the loop, destructure `match.groups` to get all five parts at once. Keep a count with `let`, or spread the matches into an array and use its `length`.

</details>

---

## Exercise 5 (Challenge): Sign-up checker

A music-streaming site checks new sign-ups before creating accounts. In [chapter 22](../22-forms/notes.md), you read form values in the browser. Here, the values are already collected as objects:

```js
const signups = [
  { username: "sandip_dev", email: "sandip@example.com", password: "Secret123", zip: "90210" },
  { username: "2cool", email: "cool@example", password: "password", zip: "9021" },
  { username: "Al", email: "al@mail.com", password: "Sh0rtPw", zip: "10001" },
];
```

Write a function `validateSignup(form)` that returns an **array of error messages**, or an empty array when everything is fine. Check these rules in this order, and use these exact messages:

| Rule | Message when it's broken |
|---|---|
| Username: 3 to 15 letters, digits, or `_`, and it must start with a letter | `Username must be 3-15 letters, digits or _, starting with a letter` |
| Email: the simple shape check from the notes | `Email doesn't look right` |
| Password: at least 8 characters | `Password needs at least 8 characters` |
| Password: at least one uppercase letter | `Password needs an uppercase letter` |
| Password: at least one digit | `Password needs a digit` |
| ZIP code: exactly 5 digits | `ZIP code must be exactly 5 digits` |

Then print a report for every sign-up.

Expected output:

```
sandip_dev: all good!
2cool:
  - Username must be 3-15 letters, digits or _, starting with a letter
  - Email doesn't look right
  - Password needs an uppercase letter
  - Password needs a digit
  - ZIP code must be exactly 5 digits
Al:
  - Username must be 3-15 letters, digits or _, starting with a letter
  - Password needs at least 8 characters
```

**Rule:** don't write one giant regex for the password. Use small, separate checks, as the notes suggest. (One of them doesn't need a regex at all.)

<details>
<summary>Hint 1</summary>

Destructuring the parameter ([chapter 15](../15-destructuring-spread-rest/notes.md)) keeps the function tidy: `function validateSignup({ username, email, password, zip })`. Start with an empty `errors` array and `push` a message for every rule that fails.

</details>

<details>
<summary>Hint 2</summary>

For the username, split the rule in two: *one* letter at the start, then 2 to 14 more word characters (that's 3 to 15 in total). Don't forget the anchors.

</details>

<details>
<summary>Hint 3</summary>

"Contains at least one uppercase letter" is a search, not a whole-text check, so that regex needs no anchors. The length rule is plain `password.length`.

</details>

**Bonus:** add a rule that the username can't contain the word `admin` in any mix of capitals (`Admin`, `ADMIN`, ...), with the message `Username can't contain "admin"`.

---

## Before you move on

In Exercise 1, `match` gave you the prices as strings, like `"$5"`, and you had to turn them into numbers before adding them up. What if you forget? Try this in Node:

```js
console.log("2" + "5" + "3");
```

You get `253` instead of `10`. JavaScript quietly joined the text instead of adding. Surprises like that are the topic of [Chapter 38: Type Coercion](../38-type-coercion/notes.md).
