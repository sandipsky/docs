# 18 Error Handling: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.js`, `ex2.js`, and so on).
- Run each one with `node ex1.js`.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Name that error

Here are four broken pieces of code from a music app:

```js
// 1
const playlist = { name: "Road Trip" };
console.log(playlist.songs.length);

// 2
console.log(playlistName);

// 3
const volume = 11;
volume();

// 4
console.log("la".repeat(-3));
```

First, **without running anything**, write down which kind of error you think each one causes: `SyntaxError`, `ReferenceError`, `TypeError`, or `RangeError`.

Then check your guesses. Put each numbered piece in its own `try`/`catch`, and in each `catch`, print the error's name and message. At the very end, print `All errors caught!`

Expected output:

```
TypeError: Cannot read properties of undefined (reading 'length')
ReferenceError: playlistName is not defined
TypeError: volume is not a function
RangeError: Invalid count value: -3
All errors caught!
```

<details>
<summary>Hint 1</summary>

If you put all four pieces in *one* `try`, only the first error gets caught, because `try` stops at the first problem. That's why each piece needs its own.

</details>

<details>
<summary>Hint 2</summary>

The error object has `name` and `message` properties. A template literal can put them together with `": "` in between.

</details>

---

## Exercise 2 (Easy): Cinema booking

You're writing the booking system for a small cinema. Write a function `bookSeats(seatsLeft, seatsWanted)` that returns how many seats are left after the booking, or throws an error if the booking breaks a rule.

The rules, in this order:

| Problem | Throw |
|---|---|
| `seatsWanted` isn't a number | `TypeError` with `Seats must be a number` |
| fewer than 1 seat | `RangeError` with `You must book at least 1 seat` |
| more than 8 seats | `RangeError` with `You can book at most 8 seats at once` |
| more seats than are left | `Error` with `Sorry, only 6 seats left` (use the real number) |

Then test it with this code at the bottom of your file:

```js
let seatsLeft = 10;
const requests = [4, 0, "two", 12, 7, 2];
```

Loop over `requests`. Try each booking, update `seatsLeft` when it works, and print the error's name and message when it doesn't.

Expected output:

```
Booked 4 seats. 6 left.
RangeError: You must book at least 1 seat
TypeError: Seats must be a number
RangeError: You can book at most 8 seats at once
Error: Sorry, only 6 seats left
Booked 2 seats. 4 left.
```

**Rule:** use guard clauses. No `else`, and no `if` inside another `if`.

<details>
<summary>Hint</summary>

The cash machine example in the notes has the same shape: a few guard clauses, then the "happy path" `return` at the bottom. The loop with `try`/`catch` inside it is there too.

</details>

**Bonus:** when it works, comment out the type check and run it again. What happens to `seatsLeft`, and why did `"two"` get past the other rules?

---

## Exercise 3 (Medium): Self-checkout scanner

A supermarket's self-checkout turns its scanner light on for every scan. The light must always go off again afterwards, even when a scan fails. Start with this data:

```js
const catalog = {
  "4011": { name: "Bananas", price: 1.29 },
  "3017": { name: "Milk", price: 0.99 },
  "5020": { name: "Bread", price: 2.49 },
};

const basket = ["4011", "9999", "3017", "5020"];
```

1. Write `scanItem(barcode)`. It prints `Scanner light ON`, looks up the item, prints a beep line, and returns the price. If the barcode isn't in the catalog, it throws an error like `Unknown barcode 9999`. Either way, it must print `Scanner light OFF` at the end.
2. Scan everything in `basket` and add up the total. An unknown item shouldn't stop the checkout: print a message and carry on with the next item.

Expected output:

```
Scanner light ON
Beep! Bananas $1.29
Scanner light OFF
Scanner light ON
Scanner light OFF
Problem: Unknown barcode 9999. Please ask for help.
Scanner light ON
Beep! Milk $0.99
Scanner light OFF
Scanner light ON
Beep! Bread $2.49
Scanner light OFF
Total: $4.77
```

**Rule:** `scanItem` must not have a `catch`. It only uses `try` and `finally`. The `catch` belongs in the checkout loop.

When it works, look at where the `Problem:` line appears for the unknown item. Can you explain why it comes *after* `Scanner light OFF`?

<details>
<summary>Hint 1</summary>

Looking up a barcode that isn't in the catalog gives `undefined` (remember bracket notation from [chapter 11](../11-objects/notes.md)). That's your signal to throw.

</details>

<details>
<summary>Hint 2</summary>

`finally` runs even when the `try` block uses `return`, and even when an error is on its way out of the function.

</details>

---

## Exercise 4 (Medium): Bug hunt

This gym sign-up checker has **4 bugs**, all of them error-handling mistakes from the notes. Copy it into `ex4.js`, run it, and fix one problem at a time.

```js
// Gym sign-up checker
function checkAge(age) {
  if (typeof age !== "number") {
    throw `age must be a number (got ${typeof age})`;
  }
  if (age < 16) {
    throw new RangeError(`must be 16 or older (got ${age})`);
  }
}

const newMembers = [
  { name: "Asha", age: 28 },
  { name: "Ben", age: 14 },
  { name: "Chen", age: "thirty" },
];

let checked = 0;

for (const member of newMembers) {
  try {
    checkAge(member.age);
    const message = "welcome!";
  } catch (error) {
  }
  console.log(`${member.name}: ${message}`);
  checked++;
}

console.log("Sign-ups checked:", checkd);
```

When it's fixed, you should see:

```
Asha: welcome!
Ben: RangeError - must be 16 or older (got 14)
Chen: TypeError - age must be a number (got string)
Sign-ups checked: 3
```

<details>
<summary>Hint 1</summary>

The first error you'll see is about `message`. Where was it created, and where is it being used? The "Common mistakes" section of the notes has this exact problem.

</details>

<details>
<summary>Hint 2</summary>

Once the first bug is fixed, Ben and Chen seem to pass without any message at all. Where did their errors go?

</details>

<details>
<summary>Hint 3</summary>

If Chen's line shows `undefined - undefined`, look at what `checkAge` throws for a non-number. Does a plain string have a `name` or a `message`?

</details>

---

## Exercise 5 (Challenge): Grade importer

A teacher exported her class grades as lines of text, but some lines got mangled on the way. Your program imports the good lines, reports the bad ones, and never lets one bad line stop the rest.

```js
const lines = [
  "Maya, 92",
  "Leo, 78",
  "Sofia, 105",
  "Omar, 85",
  "Ivy, A+",
  ", 70",
  "Zara 88",
  "Noah, 71",
];
```

Write three functions:

1. **`parseLine(line)`** turns `"Maya, 92"` into `{ name: "Maya", grade: 92 }`. It throws when the line is bad. Check in this order:

   | Problem | Throw |
   |---|---|
   | The line doesn't split into exactly 2 parts at the comma | `Error` with `Expected "name, grade" but got "Zara 88"` |
   | The name is empty | `Error` with `Name is missing` |
   | The grade isn't a number | `TypeError` with `Grade "A+" is not a number` |
   | The grade is below 0 or above 100 | `RangeError` with `Grade 105 is out of range (0-100)` |

2. **`importGrades(lines)`** calls `parseLine` on every line. It returns an object with two arrays: `students` (the good results) and `problems` (a message for each bad line, like `Line 3: RangeError - ...`). Line numbers start at 1. If no line at all is valid, it throws an `Error` with `No valid grades found`.

3. **`printReport(result)`** prints the report you see below. Show the average with one decimal place.

Then run both of these at the bottom of your file:

```js
printReport(importGrades(lines));

try {
  printReport(importGrades(["", "Bob"]));
} catch (error) {
  console.log(`Import failed: ${error.message}`);
}
```

Expected output:

```
Imported 4 students
Average grade: 81.5
Top student: Maya (92)
Problems:
- Line 3: RangeError - Grade 105 is out of range (0-100)
- Line 5: TypeError - Grade "A+" is not a number
- Line 6: Error - Name is missing
- Line 7: Error - Expected "name, grade" but got "Zara 88"
Import failed: No valid grades found
```

<details>
<summary>Hint 1</summary>

`split(",")` gives you an array of parts ([chapter 06](../06-strings/notes.md)). Check its `length` before you destructure it ([chapter 15](../15-destructuring-spread-rest/notes.md)). Don't forget to `trim()` each part, because of the space after the comma.

</details>

<details>
<summary>Hint 2</summary>

`Number("A+")` gives `NaN`, and `Number.isNaN` spots it ([chapter 05](../05-numbers-and-math/notes.md)). For the line numbers, `forEach` gives you each item's index as the second argument of the callback ([chapter 13](../13-array-methods/notes.md)).

</details>

<details>
<summary>Hint 3</summary>

The `try`/`catch` goes *inside* the loop in `importGrades`, around the call to `parseLine`, so each line gets its own chance. `reduce` can add up the grades, and `toSorted` with a compare function can find the top student.

</details>

---

## Before you move on

Dates are one of the most common places for things to go wrong. What should a program do with a date like "February 30th"?

In [chapter 19](../19-dates-and-times/notes.md), you'll meet `Invalid Date` and use what you learned here to guard against it.
