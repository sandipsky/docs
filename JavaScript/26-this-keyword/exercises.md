# 26 The `this` Keyword: Exercises

**How to do these:**

- Exercises 1, 2, 3 and 5 run in Node. Make a file for each one in this folder (`ex1.js`, `ex2.js`, and so on) and run it with `node ex1.js`.
- Exercise 4 runs in the browser. Make a folder `ex4` with an `index.html` and a `script.js` inside. Open `index.html` by double-clicking it, press `F12` → **Console** to see errors, and refresh after each change.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Smart thermostats

A smart home app controls a thermostat in every room. All the thermostats should share the same three functions, instead of each room getting its own copy.

1. Write three normal functions that use `this`:
   - `warmer(degrees)` raises the temperature.
   - `cooler(degrees)` lowers it.
   - `describe()` returns a line like `Bedroom: 18°C`.
2. Create two objects, `livingRoom` (starts at 20) and `bedroom` (starts at 18). Each has a `room` name, a `temperature`, and the three functions.

Test it with this code:

```js
console.log(livingRoom.describe());
console.log(bedroom.describe());

livingRoom.warmer(3);
bedroom.cooler(2);
bedroom.cooler(1);

console.log(livingRoom.describe());
console.log(bedroom.describe());
```

Expected output:

```
Living room: 20°C
Bedroom: 18°C
Living room: 23°C
Bedroom: 15°C
```

**Rule:** don't write `livingRoom` or `bedroom` inside the three functions.

<details>
<summary>Hint</summary>

Look at the `ironTemple` and `fitHub` example in the notes. The shorthand property `{ warmer }` puts the `warmer` function into the object.

</details>

---

## Exercise 2 (Easy): Phone bills

A phone company has several plans. One function works out the bill for any plan, using `this` to read the plan's prices:

```js
function monthlyBill(minutes, gigabytes) {
  const cost = this.baseFee + minutes * this.perMinute + gigabytes * this.perGigabyte;
  return `${this.planName}: $${cost.toFixed(2)}`;
}

const basic = { planName: "Basic", baseFee: 10, perMinute: 0.05, perGigabyte: 2 };
const unlimited = { planName: "Unlimited", baseFee: 45, perMinute: 0, perGigabyte: 0 };
const heavyUsage = [500, 20]; // 500 minutes, 20 GB
```

Copy this code, then print three bills:

1. Use `call` to print the Basic bill for 100 minutes and 3 GB.
2. Use `apply` to print the Unlimited bill for `heavyUsage`.
3. Use `bind` to make a new function called `basicBill`. Then call `basicBill(250, 1)` and print the result.

Expected output:

```
Basic: $21.00
Unlimited: $45.00
Basic: $24.50
```

**Rule:** don't change `monthlyBill` or the plan objects.

<details>
<summary>Hint</summary>

Remember: **c**all takes the arguments separated by **c**ommas, **a**pply takes them as an **a**rray, and `bind` gives you back a function that you call later.

</details>

---

## Exercise 3 (Medium): The broken scoreboard button

A sports app has a big "+1" button. The button code receives a function and calls it every time the button is pressed. Here it's simulated with a function that "presses" three times. Copy this into `ex3.js` and run it:

```js
const scoreboard = {
  team: "Tigers",
  points: 0,
  addPoint() {
    this.points += 1;
    console.log(`${this.team}: ${this.points}`);
  },
};

function pressButtonThreeTimes(onPress) {
  onPress();
  onPress();
  onPress();
}

pressButtonThreeTimes(scoreboard.addPoint);
console.log(`Final score: ${scoreboard.points}`);
```

It prints this, with no error at all:

```
undefined: NaN
undefined: NaN
undefined: NaN
Final score: 0
```

Your tasks:

1. Add `"use strict";` as the first line and run it again. Now you get a real error. Copy the error message into a comment, and explain in your own words why strict mode is better here.
2. Keep strict mode on. Fix the bug using `bind`.
3. Undo that fix and fix it a second way, with an arrow function.

Both fixes should print:

```
Tigers: 1
Tigers: 2
Tigers: 3
Final score: 3
```

**Rule:** don't change `scoreboard` or `pressButtonThreeTimes`. Only change the line that calls `pressButtonThreeTimes`.

<details>
<summary>Hint 1</summary>

Inside `pressButtonThreeTimes`, look at how `onPress` is called. Is there anything before the dot?

</details>

<details>
<summary>Hint 2</summary>

For the arrow fix: instead of handing over the method itself, hand over a small function that calls the method *with* the dot.

</details>

---

## Exercise 4 (Medium): Cinema seat picker

A cinema website lets you click seats to select or unselect them. Create `ex4/index.html` with this code:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Seat Picker</title>
    <style>
      .seat {
        width: 60px;
        height: 40px;
        margin: 4px;
        cursor: pointer;
      }
      .selected {
        background: seagreen;
        color: white;
      }
    </style>
    <script src="script.js" defer></script>
  </head>
  <body>
    <h1>Pick your seats</h1>
    <div>
      <button class="seat">A1</button>
      <button class="seat">A2</button>
      <button class="seat">A3</button>
      <button class="seat">B1</button>
      <button class="seat">B2</button>
      <button class="seat">B3</button>
    </div>
    <p id="summary">Selected seats: 0</p>
  </body>
</html>
```

In `ex4/script.js`:

1. Add a click listener to every seat, using a normal `function`. Inside it, use `this` to toggle the `selected` class on the clicked seat.
2. After each click, update the summary to show how many seats are selected.
3. Now change your listener to an arrow function, click a seat, and read the error in the console. Write it down in a comment, with a sentence explaining it.
4. Keep the arrow function, and fix it without using `this`.

What you should see: click A2 and B1, and both turn green while the summary says `Selected seats: 2`. Click A2 again, and it goes back to normal while the summary says `Selected seats: 1`.

<details>
<summary>Hint 1</summary>

To count the selected seats, you can select all elements that have *both* classes with `document.querySelectorAll(".seat.selected")` and check its `length`.

</details>

<details>
<summary>Hint 2</summary>

For step 4, the event object has a property that is always the element the listener is attached to. Look near the end of the notes.

</details>

---

## Exercise 5 (Challenge): Pizza order builder

A pizza shop wants code that reads almost like a sentence. You'll build an `order` object whose methods can be **chained**, one after another:

```js
order
  .setCustomer("Sam")
  .add("Margherita pizza", 12.5)
  .add("Garlic bread", 4, 2)
  .add("Lemonade", 2.75, 3)
  .applyDiscount(20)
  .printReceipt();
```

Here's the trick that makes chaining work: if a method ends with `return this;`, it hands back the object itself. So you can call the next method straight on the result.

Build `order` as an object literal with:

- `customer` (starts as `""`), `items` (starts as `[]`), and `discountPercent` (starts as `0`).
- `setCustomer(name)`, `add(name, price, quantity)` and `applyDiscount(percent)`. Each one updates the object and returns `this`. If no quantity is given, it's `1`.
- `formatLine(label, amount)`, which returns one receipt line: the label padded to 22 characters, then the amount with 2 decimals padded to 8 characters.
- `printReceipt()`, which prints the receipt below.

Expected output:

```
Order for Sam
Margherita pizza x1      12.50
Garlic bread x2           8.00
Lemonade x3               8.25
------------------------------
Subtotal                 28.75
Discount (20%)           -5.75
Total                    23.00
```

**Rule:** inside `printReceipt`, loop over the items with `forEach` and an **arrow function**, and call `this.formatLine(...)` inside that arrow function.

<details>
<summary>Hint 1</summary>

Default parameters from [chapter 09](../09-functions/notes.md) handle the missing quantity. `padEnd` and `padStart` from [chapter 06](../06-strings/notes.md) build each line.

</details>

<details>
<summary>Hint 2</summary>

The subtotal is a job for `reduce` from [chapter 13](../13-array-methods/notes.md). The discount line shows a negative amount: `-5.75`.

</details>

<details>
<summary>Hint 3</summary>

If you get `TypeError: this.formatLine is not a function`, check which kind of function your `forEach` callback is. Which kind shares the method's `this`?

</details>

**Bonus:** change `add` into an arrow function (`add: (name, price, quantity = 1) => { ... }`) and run it again. What error do you get, and why?

---

## Before you move on

Your order object works great. But what if the shop gets 50 orders an hour? Copying the whole object literal 50 times would be painful, and fixing a bug would mean fixing it 50 times.

[Chapter 27](../27-classes/notes.md) introduces **classes**: a blueprint you write once and use to stamp out as many objects as you like. And they use everything you just learned about `this`.
