# 29 Modules: Exercises

**How to do these:**

- Each exercise uses several files, so give each one its own folder in this chapter folder: `ex1/`, `ex2/`, and so on.
- **Node exercises (1, 2, 4 and 5):** put a `package.json` containing `{ "type": "module" }` in the exercise folder. Open a terminal in that folder and run `node main.js`.
- **Browser exercise (3):** open `index.html` with **Live Server** (right-click → **Open with Live Server**), as shown in the notes. Press `F12` → **Console** to see errors.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Travel converter

You're planning a trip and keep converting distances and temperatures. Put the conversion functions in their own module so any program can use them.

Create this folder:

```
ex1/
├── package.json
├── converter.js
└── main.js
```

In `converter.js`, write and **export** three functions. Each one returns its answer rounded to 1 decimal place:

- `kmToMiles(km)`
- `milesToKm(miles)`
- `celsiusToFahrenheit(celsius)`

Use a constant `KM_PER_MILE = 1.609344` inside `converter.js`, but **don't** export it.

Put this in `main.js`:

```js
import { kmToMiles, milesToKm, celsiusToFahrenheit } from "./converter.js";

console.log(`10 km = ${kmToMiles(10)} miles`);
console.log(`26.2 miles = ${milesToKm(26.2)} km`);
console.log(`30°C = ${celsiusToFahrenheit(30)}°F`);
console.log(`-5°C = ${celsiusToFahrenheit(-5)}°F`);
```

Expected output:

```
10 km = 6.2 miles
26.2 miles = 42.2 km
30°C = 86°F
-5°C = 23°F
```

Finally, try adding `KM_PER_MILE` to the import in `main.js` and run it again. Copy the error into a comment, then remove it again.

<details>
<summary>Hint 1</summary>

To round to 1 decimal place and still get a number, multiply by 10, round with `Math.round`, then divide by 10 ([chapter 05](../05-numbers-and-math/notes.md)). A small private helper function in `converter.js` saves you from repeating that.

</details>

<details>
<summary>Hint 2</summary>

If Node complains with `Cannot use import statement outside a module`, or prints a `MODULE_TYPELESS_PACKAGE_JSON` warning, check your `package.json`.

</details>

---

## Exercise 2 (Easy): Gym welcome screen

A gym's check-in screen greets members and shows their membership details. The code is split across three small modules, and two of them export a function with the same name.

Create `ex2/` with a `package.json` and these modules:

- `welcome.js` has a **default export**: a function that takes a name and returns `Welcome to Peak Fitness, <name>!`.
- `money.js` exports a function called `format(amount)` that returns an amount like `$45.00`.
- `dates.js` exports a function also called `format(date)` that returns a date like `2026-10-01`.

Then write `main.js`:

- Import the default export from `welcome.js` under the name `greetMember`.
- Import both `format` functions, renamed to `formatMoney` and `formatDate`.
- Print these three lines, using `greetMember("Nima")`, `formatMoney(45)` and `formatDate(new Date("2026-10-01T09:00:00Z"))`.

Expected output:

```
Welcome to Peak Fitness, Nima!
Membership: $45.00 per month
Next payment: 2026-10-01
```

<details>
<summary>Hint 1</summary>

A default import has no curly braces, and you choose its name. Named imports use curly braces, and `as` renames them.

</details>

<details>
<summary>Hint 2</summary>

For `dates.js`, `toISOString()` from [chapter 19](../19-dates-and-times/notes.md) gives you `2026-10-01T09:00:00.000Z`. You only need the first 10 characters.

</details>

---

## Exercise 3 (Medium): Quote of the day page

Build a small web page that shows a quote and a "Next quote" button, split into three modules: one for the data, one for the page, and one to connect them. (No `package.json` needed: this one runs in the browser.)

Create `ex3/index.html` with this code:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Quote of the Day</title>
    <style>
      body {
        font-family: sans-serif;
        max-width: 500px;
        margin: 40px auto;
      }
      blockquote {
        font-size: 1.4em;
        font-style: italic;
      }
    </style>
    <script type="module" src="main.js"></script>
  </head>
  <body>
    <h1>Quote of the Day</h1>
    <blockquote id="quote-text"></blockquote>
    <p id="quote-author"></p>
    <p id="position"></p>
    <button id="next-button">Next quote</button>
  </body>
</html>
```

Then write three modules:

1. `quotes.js` exports this array (you can copy it), plus a function `getQuote(index)` that returns the quote at that index, starting again from the first quote after the last one.

   ```js
   export const quotes = [
     { text: "Well done is better than well said.", author: "Benjamin Franklin" },
     { text: "Simplicity is the soul of efficiency.", author: "Austin Freeman" },
     { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
     { text: "Make it work, make it right, make it fast.", author: "Kent Beck" },
   ];
   ```

2. `ui.js` exports a function `showQuote(quote, number, total)` that puts the quote text (in quotation marks), the author (after a dash) and the position (like `Quote 1 of 4`) into the page.
3. `main.js` imports from both, shows the first quote, and shows the next one each time the button is clicked.

Now test it in two ways:

- **First, double-click `index.html`.** The page stays empty. Open the console and copy the red error into a comment at the top of `main.js`. Which part of the notes explains it?
- **Then open it with Live Server.** You should see:

```
"Well done is better than well said."
— Benjamin Franklin
Quote 1 of 4
```

Each click shows the next quote. After `Quote 4 of 4`, the next click goes back to `Quote 1 of 4`.

Finally, with the page open in Live Server, type `quotes` into the console and press `Enter`. You get a `ReferenceError`, even though `quotes` clearly exists. Why? Write your answer in a comment.

<details>
<summary>Hint 1</summary>

For `getQuote`, the remainder operator `%` is perfect for "start again from the beginning": `4 % 4` is `0`.

</details>

<details>
<summary>Hint 2</summary>

`ui.js` can find its three elements with `document.querySelector` once, at the top of the file, and reuse them every time `showQuote` runs.

</details>

<details>
<summary>Hint 3</summary>

In `main.js`, keep a `let` variable for the current index. The click listener changes it and shows the quote again.

</details>

---

## Exercise 4 (Medium): One cart, many files

In a shop app, the page header shows how many items are in the cart, but other parts of the app add the items. They all need to share **one** cart.

Create `ex4/` with a `package.json` and these modules:

- `store.js` starts with the line `console.log("store.js loaded");`. It keeps a private `items` array (not exported) and exports three functions:
  - `addItem(name, price)` adds `{ name, price }` to the cart.
  - `getItems()` returns a **copy** of the items, so outside code can't change the real cart.
  - `getTotal()` returns the total price.
- `header.js` imports from `store.js` and exports `showHeader()`, which prints a line like `Cart: 2 items ($7.50)`.

Put this in `main.js`:

```js
import { addItem, getItems } from "./store.js";
import { showHeader } from "./header.js";

showHeader();
addItem("Tea", 4);
addItem("Honey", 3.5);
showHeader();

const snapshot = getItems();
snapshot.push({ name: "Free TV", price: 0 }); // trying to sneak something in
console.log(getItems());
```

Expected output:

```
store.js loaded
Cart: 0 items ($0.00)
Cart: 2 items ($7.50)
[ { name: 'Tea', price: 4 }, { name: 'Honey', price: 3.5 } ]
```

Then answer in comments:

1. Both `main.js` and `header.js` import `store.js`. Why does `store.js loaded` appear only once?
2. `main.js` added the items, but `header.js` counted them. How does `header.js` know about them?
3. Add the line `addItem = null;` at the end of `main.js` and run it. What error do you get, and why is that a good thing?

<details>
<summary>Hint 1</summary>

Look at "A module runs only once, so it can share data" in the notes. Your `store.js` works like the one there, with an extra function or two.

</details>

<details>
<summary>Hint 2</summary>

For the copy, spread from [chapter 15](../15-destructuring-spread-rest/notes.md) works. For the total, think `reduce` ([chapter 13](../13-array-methods/notes.md)) with a starting value of `0`, so an empty cart gives `0`.

</details>

---

## Exercise 5 (Challenge): Tidy up the gradebook

A school's gradebook program has grown messy. It lives in one long file, plus an old helper written in CommonJS. Your job is to reorganize it into ES modules, **without changing what it prints**.

**Step 1: run the old version.** Make a folder `ex5-old/` (with **no** `package.json`) and create these two files.

`ex5-old/grading.js`:

```js
function letterGrade(score) {
  if (score >= 90) {
    return "A";
  }
  if (score >= 80) {
    return "B";
  }
  if (score >= 70) {
    return "C";
  }
  if (score >= 60) {
    return "D";
  }
  return "F";
}

module.exports = { letterGrade };
```

`ex5-old/gradebook.js`:

```js
const { letterGrade } = require("./grading.js");

function average(numbers) {
  const total = numbers.reduce((sum, number) => sum + number, 0);
  return total / numbers.length;
}

class Student {
  constructor(name, scores) {
    this.name = name;
    this.scores = scores;
  }

  get average() {
    return average(this.scores);
  }
}

function formatRow(student) {
  const avg = student.average.toFixed(1);
  return `${student.name.padEnd(8)}${avg.padStart(5)}   ${letterGrade(student.average)}`;
}

const students = [
  new Student("Aarav", [88, 92, 79]),
  new Student("Bina", [95, 98, 91]),
  new Student("Chen", [72, 65, 80]),
  new Student("Dawa", [55, 62, 58]),
];

console.log("Name      Avg   Grade");
for (const student of students) {
  console.log(formatRow(student));
}

const best = students.reduce((top, student) => (student.average > top.average ? student : top));
console.log(`Top student: ${best.name}`);
console.log(`Class average: ${average(students.map((student) => student.average)).toFixed(1)}`);
```

Run `node gradebook.js` in `ex5-old/`. It prints:

```
Name      Avg   Grade
Aarav    86.3   B
Bina     94.7   A
Chen     72.3   C
Dawa     58.3   F
Top student: Bina
Class average: 77.9
```

**Step 2: reorganize it.** Make a new folder `ex5/` with a `package.json` containing `{ "type": "module" }`, and split the code into this structure:

```
ex5/
├── package.json
├── main.js              ← prints the report (the last few lines of the old file)
├── data/
│   └── students.js      ← exports the students array
├── models/
│   └── Student.js       ← default export: the Student class
└── utils/
    ├── stats.js         ← exports average
    ├── grading.js       ← exports letterGrade, converted from CommonJS
    └── format.js        ← exports formatRow
```

Running `node main.js` in `ex5/` must print exactly the same seven lines as the old version.

**Rules:**

- No `require` or `module.exports` anywhere in `ex5/`.
- Each file imports only what it actually uses, and exports only what other files need.
- `main.js` shouldn't declare any functions or classes of its own (the short arrow callbacks inside `reduce` and `map` are fine). It only imports and prints.

<details>
<summary>Hint 1</summary>

Before you move any code, make a list: for each function or class, which other pieces does it use? For example, `Student` uses `average`, and `formatRow` uses `letterGrade`. Each "uses" becomes an `import`.

</details>

<details>
<summary>Hint 2</summary>

Converting `grading.js` takes two small changes: put `export` in front of the function, and delete the `module.exports` line.

</details>

<details>
<summary>Hint 3</summary>

Paths are relative to the file doing the importing. From `models/Student.js`, the stats file is `"../utils/stats.js"`. From `utils/format.js`, the grading file is right next door: `"./grading.js"`.

</details>

**Bonus:** copy the old `gradebook.js` into a folder that has a `package.json` with `"type": "module"`, and run it. Read the error. Which common mistake from the notes is it?

---

## Before you move on

Everything you've written so far runs straight through, top to bottom, as fast as it can. But real apps often need to **wait**: show a reminder in 10 minutes, save a draft every 30 seconds, or count down a timer.

[Chapter 30](../30-timers-and-callbacks/notes.md) shows you how to run code later, and why JavaScript doesn't just stop and wait while it does.
