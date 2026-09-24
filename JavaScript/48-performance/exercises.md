# 48 Performance: Exercises

**How to do these:**

- Exercises 1 to 4 run in Node. Make a new file for each one in this folder (`ex1.js`, `ex2.js`, and so on), and run it with `node ex1.js`.
- Exercise 5 runs in the browser. Make a folder called `ex5` with an `index.html` and a `script.js` inside. Open `index.html` by double-clicking it, press `F12` and open the **Console** to see errors, and refresh the page after each change.
- Timings will be different on your machine, and a little different on every run. That's normal. Every other line of output should match exactly.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): A reusable stopwatch

You're tired of writing `performance.now()` twice every time you want to time something. Wrap it in a helper you can reuse.

1. Write a function `timeIt(label, fn)`. It runs `fn`, prints the label and how long it took (with one decimal place), and **returns whatever `fn` returned**.
2. Write `sumUpTo(n)`, which adds up all the whole numbers from 1 to `n` with a loop.
3. Call `sumUpTo(1_000_000)` once *without* timing it, to warm up the engine (remember "Measuring fairly" in the notes).
4. Then use `timeIt` to time `sumUpTo` for 1,000,000, then 10,000,000, then 100,000,000, and print each sum.

Expected output (your times will be different):

```
Sum to 1,000,000: 0.7 ms
500000500000
Sum to 10,000,000: 8.1 ms
50000005000000
Sum to 100,000,000: 81.7 ms
5000000050000000
```

Each size is 10 times bigger than the one before. Is each time *roughly* 10 times bigger too? Write a comment at the bottom of your file saying which Big O `sumUpTo` is, and why.

Then delete your warm-up line and run the file again a few times. What happens to the first timing?

<details>
<summary>Hint 1</summary>

Inside `timeIt`, read `performance.now()`, call `fn()` and keep its result in a variable, then read `performance.now()` again. Print, then `return` the result you kept.

</details>

<details>
<summary>Hint 2</summary>

`timeIt` needs a function it can call itself, not the answer. If you write `timeIt("...", sumUpTo(1_000_000))`, the sum is worked out *before* `timeIt` even starts. Wrap the call in a small arrow function instead, so `timeIt` gets something it can call later.

</details>

---

## Exercise 2 (Easy): Double the data

You don't always need a stopwatch to see how code grows. You can count the steps instead. Copy these four functions into `ex2.js`. Each one does its job and adds 1 to `steps` for every step of work.

```js
let steps = 0;

// 1. Open locker number 7
function openLocker(lockers) {
  steps++;
  return lockers[7];
}

// 2. Check every seat in the cinema for lost keys
function findLostKeys(seats) {
  for (const seat of seats) {
    steps++;
    if (seat === "keys") {
      return true;
    }
  }
  return false;
}

// 3. Every guest shakes hands with every other guest, once
function shakeAllHands(guests) {
  for (let i = 0; i < guests.length; i++) {
    for (let j = i + 1; j < guests.length; j++) {
      steps++;
    }
  }
}

// 4. A knockout tournament: after each round, half the players are left
function countRounds(players) {
  let playersLeft = players.length;
  while (playersLeft > 1) {
    steps++;
    playersLeft = Math.ceil(playersLeft / 2);
  }
}
```

Your job:

1. Write `countSteps(fn, list)`. It sets `steps` back to 0, calls `fn(list)`, and returns how many steps it took.
2. Make two lists of numbers: one with 1,000 items, and one with 2,000 items. (None of them is `"keys"`, so `findLostKeys` has to check every seat.)
3. Print a table of the steps each function takes for both lists. Use `padEnd(14)` for the names and `padStart(12)` for the numbers, so the columns line up.

Expected output:

```
Function        1000 items  2000 items
openLocker               1           1
findLostKeys          1000        2000
shakeAllHands       499500     1999000
countRounds             10          11
```

**Rule:** don't change the four functions. Let them count their own steps.

Finally, look at what happens to each row when the data doubles, and write a comment matching each function to O(1), O(log n), O(n), or O(n²).

<details>
<summary>Hint 1</summary>

`Array.from` from [chapter 13](../13-array-methods/notes.md) can build an array of any length, like `Array.from({ length: 1000 }, ...)`. Its second argument is a function that works out each item. That function gets the index as its *second* parameter.

</details>

<details>
<summary>Hint 2</summary>

Functions are values ([chapter 09](../09-functions/notes.md)), so you can put all four in an array and loop over them. Every function also has a `name` property: `openLocker.name` is `"openLocker"`. That's handy for the first column.

</details>

---

## Exercise 3 (Medium): Find the book, fast

A library has a million books. Their ids are stored in a sorted array, smallest first. Start with this code:

```js
// Book ids: 3, 6, 9, ... up to 3,000,000 (sorted, smallest first)
const bookIds = [];
for (let id = 3; id <= 3_000_000; id += 3) {
  bookIds.push(id);
}
```

Write two search functions. Both return an object like `{ index: 833332, steps: 20 }`, where `index` is `-1` if the book isn't there.

1. **`linearSearch(ids, target)`** checks the ids one by one, from the start. Count one step for each id it checks.
2. **`binarySearch(ids, target)`** plays the guessing game from the notes. Keep track of the lowest and highest index the book could still be at. Each time round, look at the item in the middle, using `Math.floor((low + high) / 2)`, and count one step. If it's the book, you're done. If not, throw away the half where the book can't be. Keep going until there's nothing left to check.

Then search for book 2499999, book 3, and book 1000000 (which isn't in the library, because 1,000,000 isn't a multiple of 3).

Expected output:

```
Book 2499999
  linear search: index 833332, steps: 833333
  binary search: index 833332, steps: 20
Book 3
  linear search: index 0, steps: 1
  binary search: index 0, steps: 19
Book 1000000
  linear search: index -1, steps: 1000000
  binary search: index -1, steps: 20
```

Notice that linear search wins for book 3, because it's right at the start. But it's a lucky case: binary search never needs more than 20 steps, wherever the book is.

<details>
<summary>Hint 1</summary>

Start with `low` at the first index and `high` at the last index. Keep looping `while (low <= high)`. When `low` goes past `high`, there's nowhere left to look, so the book isn't there.

</details>

<details>
<summary>Hint 2</summary>

If the middle id is *smaller* than the one you want, the book must be to the right of the middle. So the new `low` is one place after the middle. If it's *bigger*, move `high` to one place before the middle. Moving to exactly the middle (instead of one past it) can make your loop run forever.

</details>

---

## Exercise 4 (Medium): Speed up the sales report

An online shop runs this sales report every night, and it's getting slower as the shop grows. Copy it into `ex4.js` and run it:

```js
// --- Test data (don't change this part) ---
const products = [];
for (let i = 1; i <= 10_000; i++) {
  products.push({ id: i, name: `Product ${i}`, price: (i % 50) + 1 });
}

const orders = [];
for (let i = 1; i <= 50_000; i++) {
  orders.push({ id: i, productId: ((i * 7) % 8_000) + 1, quantity: (i % 3) + 1 });
}

const discontinuedIds = [];
for (let id = 1; id <= 10_000; id += 4) {
  discontinuedIds.push(id);
}

// --- The slow report ---
console.time("report");

let revenue = 0;
let discontinuedSold = 0;
for (const order of orders) {
  const product = products.find((p) => p.id === order.productId);
  revenue += product.price * order.quantity;
  if (discontinuedIds.includes(order.productId)) {
    discontinuedSold += order.quantity;
  }
}

const orderedIds = [];
for (const order of orders) {
  if (!orderedIds.includes(order.productId)) {
    orderedIds.push(order.productId);
  }
}
const neverOrdered = products.filter((p) => !orderedIds.includes(p.id));

console.log(`Revenue: $${revenue}`);
console.log(`Discontinued items sold: ${discontinuedSold}`);
console.log(`Products never ordered: ${neverOrdered.length}`);
console.timeEnd("report");
```

You'll see something like this (your time will be different):

```
Revenue: $2549990
Discontinued items sold: 25001
Products never ordered: 2000
report: 864.513ms
```

Rewrite the report part so it gets the same answers much faster. Your version should be at least 10 times faster.

**Rules:**

- The first three lines of output must stay exactly the same.
- Don't change the test data.
- Keep everything you build (Maps, Sets) *inside* the timed part, so the comparison is fair.

<details>
<summary>Hint 1</summary>

Hunt for the hidden loops first. There are four places where a loop is hiding inside another loop. Look for `find`, `includes`, and `filter`.

</details>

<details>
<summary>Hint 2</summary>

Which tool answers "give me the product with this id" in one step? Which one answers "is this id in here?" in one step? Build them once, before the main loop.

</details>

<details>
<summary>Hint 3</summary>

The list of ordered ids is only used to answer "was this product ever ordered?". A Set can collect the ids as you go through the orders, and it ignores duplicates for you.

</details>

---

## Exercise 5 (Challenge): A fast product search

An online shop has 2,000 products and a search box. The first version searched and redrew the whole list on every single keystroke, and it felt sluggish on cheap phones. Build a faster one.

Make `ex5/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Product Search</title>
  <script src="script.js" defer></script>
  <style>
    body { font-family: sans-serif; max-width: 600px; margin: 2rem auto; padding: 0 1rem; }
    input { width: 100%; padding: 0.5rem; font-size: 1rem; box-sizing: border-box; }
    #status { color: #555; }
  </style>
</head>
<body>
  <h1>Product search</h1>
  <input id="search" type="search" placeholder="Search 2000 products..." autocomplete="off">
  <p id="status"></p>
  <ul id="results"></ul>
</body>
</html>
```

Start `ex5/script.js` with this product data:

```js
const colors = ["red", "blue", "green", "black", "white"];
const items = ["lamp", "chair", "desk", "mug", "rug", "shelf", "clock", "vase"];

const products = [];
for (let i = 1; i <= 2000; i++) {
  const color = colors[i % colors.length];
  const item = items[i % items.length];
  products.push({ id: i, name: `${color} ${item} ${i}`, price: (i % 90) + 10 });
}
```

Then build these pieces:

1. **`searchProducts(query)`** returns the products whose name includes `query`. Memoize it with a Map, and make it log `Searching for "desk"...` (with the real query) only when it actually has to search. Limit the cache to 50 queries, like Common mistake 5 in the notes.
2. **`renderProducts(list)`** shows the products in `#results`, one `<li>` each, like `blue chair 1: $11`. Only show the first 50: nobody scrolls through 2,000 items, and every element costs time to build. Build the new items off the page with a DocumentFragment, then swap them in for the old ones in one go.
3. **`showResults(text)`** cleans up the text (trims it and makes it lower case), searches, renders, and updates `#status`. Time the search and the render together with `performance.now()`, and show the time with one decimal place.
4. Debounce the search box by 300 ms, using your `debounce(fn, delay)` from [chapter 34](../34-debounce-and-throttle/notes.md).
5. When the page opens, show all the products (an empty search matches everything).

Check your page with these searches (your times will be different):

| You type | The status line says | The first item is |
|---|---|---|
| (nothing: the page just opened) | `Showing 50 of 2000 products (1.3 ms)` | `blue chair 1: $11` |
| `desk` | `Showing 50 of 250 products (0.4 ms)` | `green desk 2: $12` |
| `DESK`, with spaces before and after it | `Showing 50 of 250 products (0.2 ms)` | `green desk 2: $12` |
| `mug 99` | `Showing 2 of 2 products (0.3 ms)` | `white mug 99: $19` |
| `xyz` | `No products match "xyz"` | (the list is empty) |

Now check the cache in the console. You'll see `Searching for ""...` once when the page opens. Then type `desk` quickly, clear the box, and type `desk` quickly again: `Searching for "desk"...` should appear only once. And the spaced-out `DESK` shouldn't search at all, because it cleans up to `desk`, which is already in the cache.

<details>
<summary>Hint 1</summary>

Use the cleaned-up query as the cache key. In `searchProducts`, check the cache first, and return straight away if the answer is there. Only search, log, and save to the cache when it isn't.

</details>

<details>
<summary>Hint 2</summary>

`slice(0, 50)` gives you the first 50 matches ([chapter 10](../10-arrays/notes.md)). `resultsList.replaceChildren(fragment)` removes all the old items and adds everything in the fragment, in one step.

</details>

<details>
<summary>Hint 3</summary>

The input listener passes the box's current text to the *debounced* version of `showResults`. Call the plain `showResults("")` once at the bottom of your script for the first render.

</details>

---

## Before you move on

You've run lots of exercises in this course with `node`. But so far, you've mostly used Node to run code that could just as well run in a browser.

Node can do much more: read and write files, take commands from the terminal, and even be the server that a web page fetches its data from. That's [chapter 49](../49-nodejs-basics/notes.md). 🙂
