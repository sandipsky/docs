# 47 Debugging: Exercises

**How to do these:**

- Each exercise gives you a buggy program. Copy it into a file in this folder (`ex1.js`, `ex2.js`, and so on) and run it with `node ex1.js`.
- Don't just stare at the code. Use the method from the notes: **read the error, reproduce, isolate, fix, verify.** Try `console.log`, `console.table`, or a breakpoint in VS Code's JavaScript Debug Terminal.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your fix.

---

## Exercise 1 (Easy): The average that isn't a number

A teacher wants the average test score, but the program prints `NaN`.

```js
// Average test score
const scores = [90, 75, 81];
let total = 0;
for (let i = 0; i <= scores.length; i++) {
  total += scores[i];
}
console.log("Average:", total / scores.length);
```

It prints:

```
Average: NaN
```

When it's fixed, you should see:

```
Average: 82
```

<details>
<summary>Hint 1</summary>

Add `console.log(i, scores[i], total);` inside the loop and watch what happens on the last turn.

</details>

<details>
<summary>Hint 2</summary>

This is one of the "common bug families" from the notes. What's the last valid index of an array with 3 items?

</details>

---

## Exercise 2 (Easy): Read the stack trace

A shop looks up a customer's email, but the program crashes.

```js
// Look up a customer's email
const customers = [
  { name: "Sam", email: "sam@example.com" },
  { name: "Priya", email: "priya@example.com" },
];

function findEmail(name) {
  const customer = customers.find((c) => c.name === name);
  return customer.email;
}

console.log("Email:", findEmail("sam"));
```

Node prints (paths shortened):

```
C:\...\ex2.js:9
  return customer.email;
                  ^

TypeError: Cannot read properties of undefined (reading 'email')
```

First, answer in your own words: **which variable was `undefined`, and on which line?** Then find out *why*, and fix it so the search works no matter how the name is capitalized:

```
Email: sam@example.com
```

<details>
<summary>Hint 1</summary>

The error says "reading 'email'", so look at what's just before `.email`. Log that variable on the line before.

</details>

<details>
<summary>Hint 2</summary>

`"sam" === "Sam"` is `false`. Chapter 06 has a string method that makes both sides the same case.

</details>

---

## Exercise 3 (Medium): The price that changed by itself

A restaurant adds a $1 service fee for delivery orders. But now the restaurant's own menu is wrong too.

```js
// Add a $1 service fee for the delivery menu
const menu = [
  { name: "Soup", price: 5 },
  { name: "Pasta", price: 12 },
];

function withServiceFee(items) {
  const result = items;
  for (const item of result) {
    item.price = item.price + 1;
  }
  return result;
}

const deliveryMenu = withServiceFee(menu);
console.log("Restaurant soup:", menu[0].price);
console.log("Delivery soup:", deliveryMenu[0].price);
```

It prints:

```
Restaurant soup: 6
Delivery soup: 6
```

When it's fixed, you should see:

```
Restaurant soup: 5
Delivery soup: 6
```

**Rule:** `withServiceFee` must not change the `menu` it's given.

<details>
<summary>Hint 1</summary>

Add `console.log(result === items);` inside the function. What does it tell you?

</details>

<details>
<summary>Hint 2</summary>

This is the "accidental mutation" bug family. Chapter 16 shows how to make copies, and why a copy of the array alone isn't enough when it holds objects.

</details>

---

## Exercise 4 (Medium): Use the debugger

This program should print a score and its double, but something is off.

```js
// Load a player's score, then show it doubled
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadScore() {
  await wait(100); // pretend this is a slow server
  return 42;
}

async function main() {
  const score = loadScore();
  console.log("Score:", score);
  console.log("Double:", score * 2);
}

main();
```

It prints:

```
Score: Promise { <pending> }
Double: NaN
```

**Rule:** find the bug with a **breakpoint**, not `console.log`. Open a JavaScript Debug Terminal in VS Code, click in the margin next to the `console.log("Score:"...` line to set a breakpoint, run `node ex4.js`, and look at `score` in the Variables panel.

When it's fixed, you should see:

```
Score: 42
Double: 84
```

<details>
<summary>Hint 1</summary>

When the code pauses, what kind of value is `score`? Is it a number?

</details>

<details>
<summary>Hint 2</summary>

This is one of the mistakes from chapter 32. An `async` function always returns a promise. What gets the value out of a promise?

</details>

---

## Exercise 5 (Challenge): Four bugs at the gym

A gym wants a small report: the member with the most visits, everyone who earned a reward (10 or more visits), and a check that the original list wasn't changed. This program has **4 bugs**.

```js
// Gym report: the top member, and who gets a reward (10 or more visits)
const members = [
  { name: "Asha", visits: 12 },
  { name: "Ben", visits: 3 },
  { name: "Chen", visits: 25 },
  { name: "Dana", visits: 10 },
];

function sortByVisits(list) {
  return list.sort((a, b) => a.visits - b.visits);
}

function rewardNames(list) {
  const names = [];
  for (let i = 1; i < list.length; i++) {
    if (list[i].visits > 10) {
      names.push(list[i].name);
    }
  }
  return names;
}

const ranked = sortByVisits(members);
console.log("Top member:", ranked[0].name);
console.log("Rewards:", rewardNames(members).join(", "));
console.log("First in the original list:", members[0].name);
```

It prints:

```
Top member: Ben
Rewards: Asha, Chen
First in the original list: Ben
```

When all 4 bugs are fixed, you should see:

```
Top member: Chen
Rewards: Asha, Chen, Dana
First in the original list: Asha
```

Fix one bug at a time and run the program after each fix. Notice how fixing one bug can reveal another one that was hiding.

<details>
<summary>Hint 1</summary>

Use `console.table(members)` right after `sortByVisits` runs. Is the original list still in its original order?

</details>

<details>
<summary>Hint 2</summary>

Two bugs are in `sortByVisits`: the direction of the sort, and the fact that `sort` changes the array in place (chapter 13 has a method that doesn't).

</details>

<details>
<summary>Hint 3</summary>

The other two are in `rewardNames`. Check where the loop starts, and read the comment at the top again: "10 or more".

</details>

---

## Before you move on

You've now fixed bugs from four families: off-by-one, reading a property of `undefined`, accidental mutation, and async timing. Next, in [chapter 48](../48-performance/notes.md), the code works fine, but it's *slow*. You'll learn how to find out why.
