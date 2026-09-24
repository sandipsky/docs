# 13 Array Methods: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.js`, `ex2.js`, and so on).
- Copy the starting data from the exercise into your file, then write your code below it.
- Run each one with `node ex1.js`.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Price tags

You run a small market stall. Your prices are stored as plain numbers, but the labels need a dollar sign and two decimal places.

```js
const prices = [4.5, 12, 0.99, 25];
```

1. Use `map` to make a new array of labels like `"$4.50"`, and print it.
2. Use `forEach` on your new array to print each label with its item number.

Expected output:

```
[ '$4.50', '$12.00', '$0.99', '$25.00' ]
Item 1: $4.50
Item 2: $12.00
Item 3: $0.99
Item 4: $25.00
```

<details>
<summary>Hint 1</summary>

`toFixed(2)` from chapter 05 turns a number into a string with two decimals. In a template literal, `$${...}` gives you a plain `$` followed by the inserted value.

</details>

<details>
<summary>Hint 2</summary>

The `forEach` callback can take a second parameter: the index. Indexes start at 0, but item numbers start at 1.

</details>

---

## Exercise 2 (Easy): Exam results

A teacher wants a quick summary of the class's exam scores. The pass mark is 60.

```js
const scores = [88, 42, 75, 91, 59, 100, 67];
```

Print this summary:

```
Passed: [ 88, 75, 91, 100, 67 ]
First score above 90: 91
Anyone got 100? true
Everyone passed? false
Number who failed: 2
```

**Rule:** store the pass mark in `const passMark = 60;` and use it in your callbacks. No loops: use one array method for each line (plus `.length` for the last one).

<details>
<summary>Hint 1</summary>

Match each question to a method: "only some items" is `filter`, "the first one" is `find`, "anyone?" is `some`, and "everyone?" is `every`.

</details>

<details>
<summary>Hint 2</summary>

For the last line, think about which method gives you an array of the failed scores. How do you count the items in an array?

</details>

---

## Exercise 3 (Medium): Order history

An online shop wants a summary of one customer's orders.

```js
const orders = [
  { id: "A1", total: 25, items: 2 },
  { id: "A2", total: 40, items: 1 },
  { id: "A3", total: 15, items: 3 },
  { id: "A4", total: 60, items: 4 },
];
```

**Part 1: on paper first.** Before you write any code, fill in this table for `orders.reduce((sum, order) => sum + order.total, 0)`:

| Step | `sum` coming in | `order.total` | Callback returns |
|---|---|---|---|
| 1 | | | |
| 2 | | | |
| 3 | | | |
| 4 | | | |

Then check your table: run the `reduce` with a `console.log` inside the callback, like in the notes.

**Part 2: the report.** Print:

```
Total spent: $140
Items bought: 10
Average order: $35.00
Biggest order: A4 ($60)
```

**Rule:** use `reduce` for the total, the item count, and the biggest order.

<details>
<summary>Hint 1</summary>

The item count works just like the total. Only the property you add up is different.

</details>

<details>
<summary>Hint 2</summary>

The average is the total divided by the number of orders. Use `toFixed(2)` to show two decimals.

</details>

<details>
<summary>Hint 3</summary>

For the biggest order, the accumulator isn't a number: it's "the biggest order so far". Start it with the first order, `orders[0]`. In each step, return whichever of the two orders (the biggest so far, or the current one) has the larger total. A ternary from chapter 07 fits well here.

</details>

---

## Exercise 4 (Medium): Game leaderboard

You're building the leaderboard screen for a mobile game.

```js
const players = [
  { name: "Mia", points: 320 },
  { name: "Leo", points: 450 },
  { name: "Zara", points: 290 },
  { name: "Omar", points: 510 },
  { name: "Ivy", points: 400 },
];
```

1. Make a copy of the players sorted by points, highest first, **without changing** `players`.
2. Print the top 3 as a numbered list. Pad each name to 6 characters so the points line up.
3. Print every player's name in alphabetical order, separated by commas.
4. Prove the original array wasn't changed: print the name of the first player in `players`.

Expected output:

```
=== Top 3 ===
1. Omar   510
2. Leo    450
3. Ivy    400
A to Z: Ivy, Leo, Mia, Omar, Zara
Original first player: Mia
```

<details>
<summary>Hint 1</summary>

Which sorting method leaves the original array alone? For "highest first", think about whether you need `a - b` or `b - a`, and remember you're comparing a property, not the whole object.

</details>

<details>
<summary>Hint 2</summary>

`slice` from chapter 10 can give you the first three items of the sorted copy. `padEnd` from chapter 06 adds spaces to the end of a string.

</details>

<details>
<summary>Hint 3</summary>

For the alphabetical list, first turn the players into an array of names, then sort that. `join` from chapter 10 glues the names together.

</details>

---

## Exercise 5 (Challenge): Bookshop stock report

A small bookshop wants a stock report every morning.

```js
const books = [
  { title: "The Hobbit", genre: "fantasy", price: 12, stock: 4 },
  { title: "Dune", genre: "sci-fi", price: 15, stock: 0 },
  { title: "Emma", genre: "classic", price: 8, stock: 7 },
  { title: "Neuromancer", genre: "sci-fi", price: 11, stock: 2 },
  { title: "Mistborn", genre: "fantasy", price: 14, stock: 1 },
  { title: "Persuasion", genre: "classic", price: 9, stock: 0 },
  { title: "Circe", genre: "fantasy", price: 10, stock: 5 },
];
```

Write these three functions, each one taking the array of books as a parameter:

1. `inStockTitles(bookList)` returns the titles of the books with at least one copy in stock, sorted A to Z.
2. `stockValue(bookList)` returns the total value of all the stock (each book's price times its stock, all added up).
3. `needsReorder(bookList, minimum)` returns a line of text like `"Dune (0 left)"` for each book whose stock is below `minimum`.

Then use your functions (with a minimum of `3`) and `Object.groupBy` to print this report:

```
In stock: Circe, Emma, Mistborn, Neuromancer, The Hobbit
Stock value: $190
Reorder soon:
- Dune (0 left)
- Neuromancer (2 left)
- Mistborn (1 left)
- Persuasion (0 left)
Titles per genre:
fantasy: 3
sci-fi: 2
classic: 2
```

**Rule:** use array methods instead of `for` loops.

<details>
<summary>Hint 1</summary>

`inStockTitles` is a chain of three steps: keep some books, turn them into titles, sort the titles. Sorting text? `localeCompare` is your friend.

</details>

<details>
<summary>Hint 2</summary>

`stockValue` is a `reduce` with a starting value of `0`. Inside the callback, multiply before you add.

</details>

<details>
<summary>Hint 3</summary>

For the genre counts, group the books by `book.genre`. Then `Object.keys` from chapter 11 gives you the genre names as an array, which you can loop over with `forEach`. Each group is an array, so it has a `length`.

</details>

---

## Before you move on

In Exercise 2, your callbacks used `passMark`, a variable created *outside* them, and it worked. But a variable created *inside* a callback can't be used outside it.

Why can code see some variables and not others? That's called **scope**, and it's what [chapter 14](../14-scope-and-hoisting/notes.md) is all about.
