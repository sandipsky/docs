# 16 Values vs. References: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.js`, `ex2.js`, and so on).
- Copy the starting code from the exercise into your file.
- Run each one with `node ex1.js`.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Flatmates' shopping

Two flatmates each start a shopping list from the same template, and each has a budget.

```js
const myList = ["milk", "bread"];
const flatmateList = myList;
flatmateList.push("coffee");

let myBudget = 30;
let flatmateBudget = myBudget;
flatmateBudget = flatmateBudget - 10;

console.log("My list:", myList);
console.log("Flatmate's list:", flatmateList);
console.log("My budget:", myBudget);
console.log("Flatmate's budget:", flatmateBudget);
console.log("Same list?", myList === flatmateList);
```

1. **Predict** what each of the five lines will print, and write your predictions as comments. Then run it and check.
2. For the lines you got wrong, write one sentence explaining why.
3. **Fix it by changing one line**, so each flatmate has their own list. Then it should print:

```
My list: [ 'milk', 'bread' ]
Flatmate's list: [ 'milk', 'bread', 'coffee' ]
My budget: 30
Flatmate's budget: 20
Same list? false
```

<details>
<summary>Hint 1</summary>

The budgets are numbers and the lists are arrays. Which of those is copied by value, and which is shared by reference?

</details>

<details>
<summary>Hint 2</summary>

Find the line where the second list is created. Instead of copying the reference, make a new array with the same items. Chapter 15 gave you a short way to do that.

</details>

---

## Exercise 2 (Easy): Same order again?

A food delivery app wants to warn customers who accidentally place the same order twice. First attempt: comparing with `===`.

```js
const lastOrder = ["pizza", "cola", "salad"];
const newOrder = ["pizza", "cola", "salad"];
const otherOrder = ["pizza", "salad", "cola"];
const shortOrder = ["pizza"];
```

1. Print `lastOrder === newOrder`, and add a comment explaining why it's `false`.
2. Write a function `sameItems(listA, listB)` that returns `true` when both arrays have the same items in the same order, and `false` otherwise.
3. Test it so your output looks like this:

```
With ===: false
lastOrder vs newOrder: true
lastOrder vs otherOrder: false
lastOrder vs shortOrder: false
shortOrder vs lastOrder: false
lastOrder vs itself: true
```

<details>
<summary>Hint 1</summary>

Two lists with different lengths can never match, so check that first.

</details>

<details>
<summary>Hint 2</summary>

`every` from chapter 13 gives its callback the index as a second parameter. Use it to look at the item in the same position in the other list.

</details>

<details>
<summary>Hint 3</summary>

Test `shortOrder vs lastOrder` carefully. If you skip the length check, `every` only looks at the items of the first list, so a short list can wrongly "match" a longer one.

</details>

---

## Exercise 3 (Medium): A sale that breaks the shop

An online shop runs a 25% sale. The sale page looks right, but after it runs, the regular product list is broken too.

```js
const products = [
  { name: "Backpack", price: 40 },
  { name: "Water bottle", price: 12 },
  { name: "Cap", price: 15 },
];

function applySale(items, percentOff) {
  for (const item of items) {
    item.price = item.price - (item.price * percentOff) / 100;
  }
  return items;
}

function cheapestFirst(items) {
  return items.sort((a, b) => a.price - b.price);
}

const saleProducts = applySale(products, 25);
const sorted = cheapestFirst(saleProducts);
console.log(sorted.map((item) => `${item.name}: $${item.price}`));
console.log(products.map((item) => `${item.name}: $${item.price}`));
```

It prints:

```
[ 'Water bottle: $9', 'Cap: $11.25', 'Backpack: $30' ]
[ 'Water bottle: $9', 'Cap: $11.25', 'Backpack: $30' ]
```

The regular list (second line) has sale prices *and* a new order. Rewrite both functions so they never change the array or the objects they're given. Don't change the last four lines. The output should become:

```
[ 'Water bottle: $9', 'Cap: $11.25', 'Backpack: $30' ]
[ 'Backpack: $40', 'Water bottle: $12', 'Cap: $15' ]
```

<details>
<summary>Hint 1</summary>

There are two separate problems. `applySale` changes each product object, and `cheapestFirst` changes the order of the array. Fix one at a time, and run the file after each fix.

</details>

<details>
<summary>Hint 2</summary>

For `applySale`, a new array isn't enough: the objects inside must be new too. The notes show how to copy objects inside `map`. Remember the parentheses around an object that an arrow function returns.

</details>

<details>
<summary>Hint 3</summary>

For `cheapestFirst`, check the "Makes a new copy instead" column of the table in the notes.

</details>

---

## Exercise 4 (Medium): Save slots

A video game lets players save their progress. The developers tried two ways of making a save.

```js
const game = {
  player: "Kai",
  level: 3,
  inventory: ["sword", "potion"],
  position: { x: 10, y: 4 },
};
```

1. Write a function `describe(label, save)` that prints one line about a save, in the format shown below.
2. Make `quickSave` with object spread, and `fullSave` with `structuredClone`.
3. Then the game carries on. Add these lines after your saves:

```js
game.level = 4;
game.inventory.push("shield");
game.position.x = 25;
```

4. Describe the game and both saves. You should see:

```
Game: level 4, items: sword, potion, shield, x: 25
Quick save: level 3, items: sword, potion, shield, x: 25
Full save: level 3, items: sword, potion, x: 10
```

5. In a comment, explain why the quick save's `level` stayed at 3, but its items and its `x` changed.

<details>
<summary>Hint 1</summary>

`join(", ")` from chapter 10 turns the inventory into the text you need.

</details>

<details>
<summary>Hint 2</summary>

For step 5, draw it. Which values in `game` are primitives, and which are references to other objects? What does a shallow copy do with each kind?

</details>

---

## Exercise 5 (Challenge): Undo button

You're building a to-do app with an **undo** button. The trick: every change creates a new *snapshot* of the task list, and the old snapshots are kept in an array. Undo just throws away the latest snapshot.

This only works if old snapshots never change. So none of your functions may mutate what they're given.

Write these four functions:

1. `addTask(tasks, title)` returns a new array with a new task `{ title, done: false }` added at the end.
2. `completeTask(tasks, title)` returns a new array in which the task with that title has `done: true`.
3. `removeTask(tasks, title)` returns a new array without that task.
4. `printTasks(tasks)` prints each task as `[x] Buy milk` (done) or `[ ] Call mum` (not done), or `(no tasks)` if the list is empty.

Then paste in this code, below your functions, without changing it:

```js
const snapshots = [[]]; // snapshot 0: an empty list

snapshots.push(addTask(snapshots.at(-1), "Buy milk"));
snapshots.push(addTask(snapshots.at(-1), "Call mum"));
snapshots.push(completeTask(snapshots.at(-1), "Buy milk"));
console.log("Now:");
printTasks(snapshots.at(-1));

snapshots.push(removeTask(snapshots.at(-1), "Call mum"));
console.log("After removing:");
printTasks(snapshots.at(-1));

snapshots.pop(); // undo the last change
console.log("After undo:");
printTasks(snapshots.at(-1));

console.log("Snapshot 1:");
printTasks(snapshots[1]);
console.log("Snapshot 0:");
printTasks(snapshots[0]);
console.log(`Snapshots saved: ${snapshots.length}`);
```

Expected output:

```
Now:
[x] Buy milk
[ ] Call mum
After removing:
[x] Buy milk
After undo:
[x] Buy milk
[ ] Call mum
Snapshot 1:
[ ] Buy milk
Snapshot 0:
(no tasks)
Snapshots saved: 4
```

Look closely at "Snapshot 1". It was saved *before* "Buy milk" was completed, so it must still show `[ ]`. If yours shows `[x]`, one of your functions is mutating a task object that the snapshots share.

<details>
<summary>Hint 1</summary>

`addTask` needs a new array with one extra item. Spread from chapter 15 does that in one line, and shorthand properties from chapter 11 make the new task short to write.

</details>

<details>
<summary>Hint 2</summary>

`removeTask` is a `filter`. `completeTask` is a `map` where most tasks pass through unchanged, and the matching one is replaced by a *copy* with `done: true`.

</details>

<details>
<summary>Hint 3</summary>

Inside `completeTask`, writing `task.done = true` changes the task object that the older snapshots also point at. That's exactly the bug the "Snapshot 1" line catches. Build a copy of the task with object spread instead, and set `done` in the copy.

</details>

---

## Before you move on

`structuredClone` copies every level of an object, however deeply things are nested. But how could *you* write a function that handles any depth, when you don't know in advance how deep the nesting goes?

The answer is a function that calls itself. That's recursion, in [chapter 17](../17-recursion/notes.md).
