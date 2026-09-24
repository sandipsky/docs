# 43 Functional Programming: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.js`, `ex2.js`, and so on).
- Run each one with `node ex1.js` from a terminal opened in this folder.
- You may copy `pipe` and `memoize` from the notes when an exercise needs them, but make sure you understand every line you copy.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Pure or impure?

You're reviewing code for a banking app. Copy these functions into `ex1.js`:

```js
function addInterest(balance, ratePercent) {
  return balance + (balance * ratePercent) / 100;
}

let totalDeposits = 0;
function deposit(amount) {
  totalDeposits += amount;
  return totalDeposits;
}

function formatBalance(balance) {
  return `$${balance.toFixed(2)}`;
}

function logTransaction(amount) {
  console.log(`Transaction: $${amount}`);
}

function isOverdrawn(account) {
  return account.balance < 0;
}

function chargeFee(account) {
  account.balance -= 5;
  return account;
}

function createStatementId() {
  return `ST-${Date.now()}`;
}
```

**Part 1:** above each function, write a comment saying whether it's **pure** or **impure**, and why (one short sentence).

**Part 2:** rewrite `chargeFee` so it's pure: it must return a new account and leave the original alone.

**Part 3:** rewrite `createStatementId` so it's pure. (Hint: what could you pass in instead?)

Then test your new versions:

```js
const account = { owner: "Mia", balance: 100 };
const charged = chargeFee(account);

console.log(account);
console.log(charged);
console.log(createStatementId(1767225600000));
```

Expected output:

```
{ owner: 'Mia', balance: 100 }
{ owner: 'Mia', balance: 95 }
ST-1767225600000
```

<details>
<summary>Hint 1</summary>

For each function, ask the two questions from the notes. Does it always give the same answer for the same input? Does it change (or print, or read) anything outside itself?

</details>

<details>
<summary>Hint 2</summary>

Spread makes a new object with the same properties, and you can override one of them: `{ ...account, balance: ... }`. For Part 3, remember how `isShopOpen` became pure in the notes.

</details>

---

## Exercise 2 (Easy): A frozen playlist

Your music app keeps the playlist frozen, so nothing can change it by accident:

```js
const playlist = Object.freeze(["Levitating", "Anti-Hero", "Flowers", "Blinding Lights"]);
```

Make five new versions of it, each in its own variable, and print them. Then print the original:

1. sorted A to Z
2. in reverse order
3. with `"Flowers"` (at index 2) replaced by `"Espresso"`
4. with `"Houdini"` added at the end
5. without `"Anti-Hero"`

Expected output:

```
[ 'Anti-Hero', 'Blinding Lights', 'Flowers', 'Levitating' ]
[ 'Blinding Lights', 'Flowers', 'Anti-Hero', 'Levitating' ]
[ 'Levitating', 'Anti-Hero', 'Espresso', 'Blinding Lights' ]
[ 'Levitating', 'Anti-Hero', 'Flowers', 'Blinding Lights', 'Houdini' ]
[ 'Levitating', 'Flowers', 'Blinding Lights' ]
[ 'Levitating', 'Anti-Hero', 'Flowers', 'Blinding Lights' ]
```

The frozen playlist is your safety net. If you use a method that changes the array, like `sort()` or `push()`, you'll get a `TypeError`, even in a normal `.js` file. (A plain assignment like `playlist[0] = "x"` is different: it's quietly ignored, like in the notes.)

<details>
<summary>Hint</summary>

The table in the "Immutability" section of the notes has a non-mutating way to do each of these jobs.

</details>

**Bonus:** on purpose, call `playlist.sort()` and read the error message. What is it telling you?

---

## Exercise 3 (Medium): A username pipeline

A game's sign-up page turns whatever people type into a clean username. Use `pipe` to build a function `makeUsername` from small steps, in this order:

1. Remove spaces from both ends.
2. Make it lowercase.
3. Turn every remaining space into an underscore `_`.
4. Remove every character that isn't a letter, a digit, or an underscore.
5. Cut it to at most 15 characters.
6. Put an `@` in front.

Test it:

```js
console.log(makeUsername("  Sandip Shakya "));
console.log(makeUsername("Captain Awesome!!!"));
console.log(makeUsername("The Real Slim Shady 2026"));
console.log(makeUsername("  GAMER-GIRL_99 "));
```

Expected output:

```
@sandip_shakya
@captain_awesome
@the_real_slim_s
@gamergirl_99
```

**Rule:** step 5 must use a curried helper, `limitLength(maxLength)`, so the step inside the pipe reads `limitLength(15)`.

<details>
<summary>Hint 1</summary>

Look at how `makeSlug` is built in the notes. Most of your steps are one-line arrow functions, like `(text) => text.trim()`.

</details>

<details>
<summary>Hint 2</summary>

For step 4, a regular expression with a "not in this set" group works well ([chapter 37](../37-regular-expressions/notes.md)). Compare it with `removeSymbols` in the notes: this time the set also includes `_`.

</details>

<details>
<summary>Hint 3</summary>

`limitLength` works like `applyDiscount` in the notes: it takes the limit, and returns a function that takes the text. `slice(0, maxLength)` does the cutting.

</details>

---

## Exercise 4 (Medium): Memoize with several arguments

A courier app works out shipping prices. In real life, this calculation is slow (it checks lots of routes), so you want to cache it. Here's the function, with a counter that shows how often the real work happens:

```js
let calculations = 0;

function calculateShipping(weightKg, service) {
  calculations++; // only here so we can count the real work
  const ratePerKg = service === "express" ? 4 : 2;
  return weightKg * ratePerKg + 5;
}
```

The `memoize` from the notes only looks at one argument. Write a new version of `memoize` that works with **any number of arguments**. Then test it:

```js
const getShipping = memoize(calculateShipping);

console.log(getShipping(3, "standard"));
console.log(getShipping(3, "express"));
console.log(getShipping(3, "standard"));
console.log(getShipping(10, "standard"));
console.log(`Real calculations: ${calculations}`);
```

Expected output:

```
11
17
11
25
Real calculations: 3
```

The second `getShipping(3, "standard")` comes from the cache, so there are only 3 real calculations. And `getShipping(3, "express")` must *not* reuse the standard price, even though the weight is the same.

<details>
<summary>Hint 1</summary>

Collect all the arguments with a rest parameter, `(...args) =>`, and pass them all on with `fn(...args)` ([chapter 15](../15-destructuring-spread-rest/notes.md)).

</details>

<details>
<summary>Hint 2</summary>

The cache needs one key that stands for *all* the arguments together. Joining them into a string, like `"3|express"`, works for simple values like numbers and strings.

</details>

**Bonus:** give `memoize` a second parameter, `maxSize`. When the cache is full and a new answer arrives, delete the oldest entry first. A `Map` remembers the order things were added, and `cache.keys().next().value` gives you the oldest key ([chapter 36](../36-iterators-and-generators/notes.md)). With `memoize(calculateShipping, 2)`, calling `(1, "standard")`, `(2, "standard")`, `(3, "standard")`, `(2, "standard")`, and then `(1, "standard")` should make 4 real calculations.

---

## Exercise 5 (Challenge): Refactor a report that changes its own data

A coffee shop prints a report of its coffee sales, with a 10% member discount. Here's the current code. Copy it into `ex5.js` and run it:

```js
const sales = [
  { product: "Coffee beans", category: "coffee", price: 12, quantity: 3 },
  { product: "Green tea", category: "tea", price: 6, quantity: 5 },
  { product: "Espresso cups", category: "kitchen", price: 18, quantity: 1 },
  { product: "Cold brew kit", category: "coffee", price: 30, quantity: 2 },
  { product: "Chai mix", category: "tea", price: 8, quantity: 4 },
];

function printCoffeeReport(sales) {
  sales.sort((a, b) => b.price * b.quantity - a.price * a.quantity);
  let total = 0;
  console.log("Coffee sales (with 10% member discount):");
  for (let i = 0; i < sales.length; i++) {
    if (sales[i].category === "coffee") {
      sales[i].price = sales[i].price * 0.9;
      const lineTotal = sales[i].price * sales[i].quantity;
      total += lineTotal;
      console.log(`- ${sales[i].product}: $${lineTotal.toFixed(2)}`);
    }
  }
  console.log(`Total: $${total.toFixed(2)}`);
}

printCoffeeReport(sales);
printCoffeeReport(sales); // the same report again... right?
```

The first report is right. The second one isn't: it shows `$48.60`, `$29.16`, and a total of `$77.76`. Every time the report runs, the prices shrink by another 10%, and the order of the `sales` array changes too. The report is changing its own data!

Rewrite it in a functional style:

- Write a **pure** function `buildCoffeeReport(sales)` that **returns** the whole report as one string. It must not print anything, and it must not change `sales` or anything in it.
- Build it from small functions. Use at least two **curried** helpers: `isInCategory(category)` for `filter`, and `withDiscount(percent)` for `map`.
- Keep the side effect (printing) at the edge, outside your pure functions.

Replace the last two lines with these, and run it:

```js
const snapshot = JSON.stringify(sales);

console.log(buildCoffeeReport(sales));
console.log(buildCoffeeReport(sales));
console.log(`Original data unchanged: ${JSON.stringify(sales) === snapshot}`);
```

Expected output:

```
Coffee sales (with 10% member discount):
- Cold brew kit: $54.00
- Coffee beans: $32.40
Total: $86.40
Coffee sales (with 10% member discount):
- Cold brew kit: $54.00
- Coffee beans: $32.40
Total: $86.40
Original data unchanged: true
```

(`JSON.stringify` turns the whole array into one string, so comparing the before and after strings is a quick way to check that nothing inside changed. See [chapter 23](../23-json-and-local-storage/notes.md).)

<details>
<summary>Hint 1</summary>

Find the two side effects in the old code first. Which line changes the array's order, and which line changes the objects inside it? Your version needs a non-mutating replacement for each.

</details>

<details>
<summary>Hint 2</summary>

`withDiscount(10)` should return a function that takes one sale and returns a *new* sale object with a lower price. Look at the fix for Common mistake 1 in the notes.

</details>

<details>
<summary>Hint 3</summary>

One way to shape `buildCoffeeReport`: `filter` the coffee sales, `map` them with the discount, sort a copy with `toSorted` (biggest line total first), and `reduce` for the total. Build an array of lines, then turn it into one string with `join("\n")`.

</details>

---

## Before you move on

Look back at `memoize`. It took a function and gave it a new ability, a cache, without changing the original function at all. It's like gift wrapping: the gift inside stays the same, but now it has something extra around it.

That trick is so useful that it has a name. It's one of the proven solutions you'll meet in [chapter 44: Design Patterns](../44-design-patterns/notes.md).
