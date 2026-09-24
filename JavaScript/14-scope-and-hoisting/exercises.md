# 14 Scope and Hoisting: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.js`, `ex2.js`, and so on).
- Most exercises give you some code to start from. Copy it into your file.
- Run each one with `node ex1.js`.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Scope detective

A bike shop's website has a small script that shows off its bikes. Some of its lines can't see the variables they're trying to use.

```js
const brand = "SunnyBikes";

function showBike() {
  const model = "City Cruiser";
  console.log(`A: ${brand}`);
  console.log(`B: ${model}`);
}

showBike();

if (brand.length > 5) {
  const slogan = "Ride happy";
  console.log(`C: ${slogan}`);
}

console.log(`D: ${brand}`);
console.log(`E: ${model}`);
console.log(`F: ${slogan}`);
```

1. **Predict.** Before running anything, write a comment at the end of each line from A to F: what it prints, or which error it throws.
2. **Check.** Run the file. When it stops with an error, compare it with your prediction, put `//` in front of that line to switch it off, and run again. Repeat until the file runs to the end.
3. **Fix.** Switch lines E and F back on. Then move declarations around (don't delete any `console.log` lines) so the whole file runs and prints:

```
A: SunnyBikes
B: City Cruiser
C: Ride happy
D: SunnyBikes
E: City Cruiser
F: Ride happy
```

<details>
<summary>Hint 1</summary>

Remember the one-way windows. `model` lives inside the function's room and `slogan` lives inside the `if` block's cupboard. The lines at the bottom are out in the garden.

</details>

<details>
<summary>Hint 2</summary>

For `model`: if you move its declaration to the top level, can `showBike` still see it? For `slogan`: declare it before the `if` with `let`, and give it its value inside.

</details>

---

## Exercise 2 (Easy): Leaky loops

A parcel depot counts how many parcels are heavy (over 10 kg). The code was written years ago, with `var`.

```js
var weights = [2, 12, 7, 15, 3];
var heavyCount = 0;

for (var i = 0; i < weights.length; i++) {
  var weight = weights[i];
  if (weight > 10) {
    var label = "HEAVY";
    heavyCount++;
  }
}

console.log(`Heavy parcels: ${heavyCount}`);
console.log(`i after the loop: ${i}`);
console.log(`weight after the loop: ${weight}`);
console.log(`label after the loop: ${label}`);
```

It prints:

```
Heavy parcels: 2
i after the loop: 5
weight after the loop: 3
label after the loop: HEAVY
```

1. For each of the last three lines, write a comment explaining why it prints that value at all.
2. Replace every `var` with `let` or `const`. Use `const` wherever the value never changes.
3. Run it again. Where does it stop now, and with what error? Why is that actually an improvement?
4. Delete the three "after the loop" lines. They only worked because `var` leaked. Your program should now print just:

```
Heavy parcels: 2
```

<details>
<summary>Hint 1</summary>

`var` only respects functions, not blocks. There's no function here, so all of those `var` variables live at the top level of the file.

</details>

<details>
<summary>Hint 2</summary>

A `const` inside a loop body is fine, even though the loop runs many times. Each time round, the body is a fresh block, so it gets a brand-new variable.

</details>

---

## Exercise 3 (Medium): Too early at the gym

A gym's fee calculator crashes before it finishes. Everything it needs is in the file, just in the wrong order.

```js
// Gym membership calculator
console.log(welcomeMessage("Ravi"));
console.log(`Monthly fee: $${monthlyFee}`);
console.log(`Yearly fee: $${yearlyFee(monthlyFee)}`);
console.log(`With loyalty discount: $${applyDiscount(yearlyFee(monthlyFee))}`);

const monthlyFee = 35;

const yearlyFee = (fee) => fee * 12;

var applyDiscount = function (price) {
  return price - 20;
};

function welcomeMessage(name) {
  return `Welcome to Iron Gym, ${name}!`;
}
```

1. **Predict** before you run it: which lines will work, and where will it crash? With which error?
2. **Fix it by moving code only.** Don't change what any function does. `welcomeMessage` must stay at the bottom of the file.
3. Add a comment explaining why `welcomeMessage` can stay at the bottom, but the other three can't.

Expected output:

```
Welcome to Iron Gym, Ravi!
Monthly fee: $35
Yearly fee: $420
With loyalty discount: $400
```

<details>
<summary>Hint 1</summary>

Look at how each of the four things is created: a function declaration, a `const` holding a number, a `const` holding an arrow function, and a `var` holding a function expression. Check the table at the end of the hoisting section in the notes.

</details>

<details>
<summary>Hint 2</summary>

If you move the two `const` lines up but forget the `var`, you'll get a different error: `TypeError: applyDiscount is not a function`. Why does `var` give a *TypeError* instead of a *ReferenceError*?

</details>

**Bonus:** once it works, change the `var` into a `const`. Does it still work? Why?

---

## Exercise 4 (Medium): Library late fees

A library's late-fee report prints the right fee for each book, but the total is wrong:

```js
// Library late fees
const loans = [
  { title: "Dune", daysLate: 3 },
  { title: "Emma", daysLate: 0 },
  { title: "Circe", daysLate: 5 },
];

function calculateFee(daysLate) {
  feePerDay = 0.5;
  fee = daysLate * feePerDay;
  return fee;
}

function printReport(loanList) {
  total = 0;
  for (const loan of loanList) {
    const fee = calculateFee(loan.daysLate);
    totl = total + fee;
    console.log(`${loan.title}: $${fee.toFixed(2)}`);
  }
  console.log(`Total: $${total.toFixed(2)}`);
}

printReport(loans);
```

It prints `Total: $0.00`. The file is full of accidental globals, and one of them is hiding the bug.

1. Add `"use strict";` as the very first line of the file and run it.
2. Strict mode stops at the first accidental global it finds. Fix that one by declaring the variable properly, in the smallest scope that works. Then run again.
3. Repeat until the program runs. It should print:

```
Dune: $1.50
Emma: $0.00
Circe: $2.50
Total: $4.00
```

<details>
<summary>Hint 1</summary>

Strict mode reports one problem per run, so fix one error at a time. Read each message: `ReferenceError: total is not defined` tells you exactly which name has no declaration.

</details>

<details>
<summary>Hint 2</summary>

For each variable, ask two questions. Which function uses it? That's where it belongs. Does its value change after it's first set? That decides `let` or `const`.

</details>

<details>
<summary>Hint 3</summary>

One of the errors isn't a missing `let` at all. Read that variable's name letter by letter.

</details>

---

## Exercise 5 (Challenge): Clean up the cinema

A cinema's booking script was written in a hurry. It uses `var`, and it has accidental globals. Worse, it has a real bug that those globals are hiding.

```js
var movies = [
  { title: "Space Pirates", price: 12, seatsLeft: 3 },
  { title: "The Quiet Forest", price: 9, seatsLeft: 0 },
  { title: "Robot Chef", price: 10, seatsLeft: 8 },
];

var i;
var total = 0;
var message;

function book(title, tickets) {
  for (i = 0; i < movies.length; i++) {
    if (movies[i].title === title) {
      movie = movies[i];
    }
  }
  if (movie.seatsLeft < tickets) {
    message = "Sorry, not enough seats for " + title + " (" + movie.seatsLeft + " left)";
  } else {
    movie.seatsLeft = movie.seatsLeft - tickets;
    cost = movie.price * tickets;
    total = total + cost;
    message = "Booked " + tickets + " x " + title + ": $" + cost;
  }
  console.log(message);
}

book("Space Pirates", 2);
book("The Quiet Forest", 1);
book("Robot Chef", 4);
book("Space Pirates", 2);
book("Robot Chief", 1);
console.log("Total spent: $" + total);
```

It prints:

```
Booked 2 x Space Pirates: $24
Sorry, not enough seats for The Quiet Forest (0 left)
Booked 4 x Robot Chef: $40
Sorry, not enough seats for Space Pirates (1 left)
Booked 1 x Robot Chief: $12
Total spent: $76
```

There's no movie called "Robot Chief" (it's a typo), but the script booked a seat and charged $12 anyway!

1. **Find the cause.** Write a comment explaining which accidental global makes the "Robot Chief" booking go through, and which movie's seat was really sold.
2. **Rewrite the script** so that:
   - There's no `var` anywhere, and `"use strict";` at the top runs without errors.
   - Every variable lives in the smallest scope that works. Only `movies` and your running total live at the top level.
   - `book` uses `find` (from [chapter 13](../13-array-methods/notes.md)) instead of the `for` loop, and handles a title that doesn't exist.
   - `book` doesn't touch the total. Instead, it **returns** the cost of the booking (or `0` if nothing was booked), and the code at the bottom adds up the returned values.
   - Messages use template literals.

Expected output:

```
Booked 2 x Space Pirates: $24
Sorry, not enough seats for The Quiet Forest (0 left)
Booked 4 x Robot Chef: $40
Sorry, not enough seats for Space Pirates (1 left)
Sorry, we don't show "Robot Chief"
Total spent: $64
```

<details>
<summary>Hint 1</summary>

Follow `movie` from one call to the next. When no title matches, the loop never assigns it. So what is `movie` still holding from the call before?

</details>

<details>
<summary>Hint 2</summary>

`find` returns `undefined` when nothing matches. Check for that first, and use an early `return` (from chapter 09) before you touch `movie.seatsLeft`.

</details>

<details>
<summary>Hint 3</summary>

For the total: create it once at the top level with `let`, then add each booking's returned cost to it. Something like `totalSpent = totalSpent + book(...)` works.

</details>

---

## Before you move on

In Exercise 5 you wrote `movie.title`, `movie.price` and `movie.seatsLeft` again and again. Wouldn't it be nice to unpack an object's properties into separate variables in one line?

That's exactly what destructuring does, and it's one of the shortcuts in [chapter 15](../15-destructuring-spread-rest/notes.md).
