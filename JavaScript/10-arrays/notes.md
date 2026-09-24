# 10 Arrays

## What is it?

An **array** is a list of values, kept in order, stored under one name.

```js
const shoppingList = ["milk", "eggs", "bread"];
```

Each value in the list is called an **element** (or just an item). Each element has a position number, called its **index**.

## Why does it matter?

Say you're building a music app. Without arrays, every song needs its own variable:

```js
const song1 = "Morning Run";
const song2 = "Rainy Day";
const song3 = "Night Drive";
```

That falls apart fast:

- A playlist with 200 songs would need 200 variables.
- You can't loop over `song1`, `song2`, `song3`. A [loop](../08-loops/notes.md) needs one thing to step through.
- Adding a song means writing a new line of code, instead of just adding to a list.

With an array, the whole playlist lives in one variable:

```js
const playlist = ["Morning Run", "Rainy Day", "Night Drive"];
```

Now you can add songs, remove songs, count them, and loop over them. Almost every app is built on lists: messages in a chat, products in a shop, photos in an album, tasks in a to-do list.

## Real-world example

Think of an array as a **train**:

| Train | Array |
|---|---|
| The whole train | The array |
| One carriage | One element |
| The number painted on a carriage | The index |
| How many carriages there are | `length` |
| Hooking a new carriage onto the back | `push` |
| Unhooking the last carriage | `pop` |

This train has one odd rule: the first carriage is number **0**, not 1. So a train with 3 carriages has carriages 0, 1, and 2.

That rule trips up almost everyone at first. JavaScript counts positions from 0, just like it did with the letters of a string in [chapter 06](../06-strings/notes.md).

## How it works

### Creating an array

Put the values inside square brackets `[ ]`, separated by commas:

```js
const shoppingList = ["milk", "eggs", "bread"];
console.log(shoppingList); // prints: [ 'milk', 'eggs', 'bread' ]
```

Node prints arrays with spaces inside the brackets and single quotes around strings. That's only how it displays them; your double quotes are fine. The browser console shows the same list a little differently: it adds the length, like `(3)`, and an arrow you can click to open the list up.

An array can also start out empty and get filled later:

```js
const cart = [];
console.log(cart);        // prints: []
console.log(cart.length); // prints: 0
```

### Reading items by index

Put the index in square brackets to get one item:

```js
const planets = ["Mercury", "Venus", "Earth", "Mars"];
console.log(planets[0]); // prints: Mercury
console.log(planets[2]); // prints: Earth
```

`planets[2]` means "the item at index 2", which is the *third* item. Counting from 0 feels strange for a week or so, then it becomes a habit.

### How many items: `length`

Every array knows how many items it has:

```js
const planets = ["Mercury", "Venus", "Earth", "Mars"];
console.log(planets.length);              // prints: 4
console.log(planets[planets.length - 1]); // prints: Mars
console.log(planets.at(-1));              // prints: Mars
console.log(planets.at(-2));              // prints: Earth
```

Since the first index is 0, the last index is always `length - 1`. Here that's `4 - 1`, which is 3.

Writing `planets[planets.length - 1]` gets clunky, so use `.at()`, which you met with strings. A negative number counts back from the end: `at(-1)` is the last item, `at(-2)` is the one before it.

### Changing an item

Put the index on the left of `=` to replace an item:

```js
const seats = ["free", "free", "free"];
seats[1] = "taken";
console.log(seats); // prints: [ 'free', 'taken', 'free' ]
```

This is a big difference from strings. In chapter 06 you saw that strings are immutable: you can't change them in place. Arrays can be changed.

### Wait, isn't `seats` a `const`?

Yes, and that's allowed. In [chapter 02](../02-variables/notes.md), `const` meant you can't swap the value for something else. That's still true here: `seats` must always hold the *same* array. But nothing stops you from changing what's inside that array.

Think of a shopping basket with your name tag on it. You can put things in and take things out all day. It's still the same basket, so the tag still belongs on it. What you can't do is move your tag onto a different basket.

```js
const seats = ["free", "free", "free"];
seats[0] = "taken";         // fine: changing what's inside the same array
seats = ["taken", "taken"]; // not allowed: swapping in a different array
// TypeError: Assignment to constant variable.
```

So keep using `const` for arrays. Use `let` only when you plan to replace the whole array with a new one.

### Adding and removing at the ends

Four methods add or remove items at the start or the end of an array. Remember from chapter 06: a **method** is an action a value knows how to do, like `"hi".toUpperCase()`. Arrays come with their own methods.

Picture a queue at a bakery:

```js
const queue = ["Ana", "Ben"];

queue.push("Cara");   // Cara joins at the back
queue.unshift("Dev"); // Dev has a VIP pass and goes to the front
console.log(queue);   // prints: [ 'Dev', 'Ana', 'Ben', 'Cara' ]

const served = queue.shift(); // the person at the front gets served
const gaveUp = queue.pop();   // the person at the back gives up and leaves
console.log(served); // prints: Dev
console.log(gaveUp); // prints: Cara
console.log(queue);  // prints: [ 'Ana', 'Ben' ]
```

| Method | What it does | Where | Gives back |
|---|---|---|---|
| `push(item)` | adds | end | the new length |
| `pop()` | removes | end | the removed item |
| `unshift(item)` | adds | start | the new length |
| `shift()` | removes | start | the removed item |

A few things worth knowing:

- `pop()` and `shift()` hand back the item they removed, so you can keep it in a variable (like `served` above).
- `push` and `unshift` can add several items at once: `queue.push("Eli", "Fay")`.
- On an empty array, `pop()` and `shift()` give back `undefined`.
- To remember `shift`: when the person at the front leaves, everyone else *shifts* forward one place.

> **Tip:** `push` is the one you'll use most. Starting with an empty array `[]` and pushing items into it is one of the most common patterns in programming.

### Finding things: `includes` and `indexOf`

These work just like the string versions from chapter 06:

```js
const guests = ["Asha", "Ben", "Chloe"];
console.log(guests.includes("Ben"));  // prints: true
console.log(guests.includes("ben"));  // prints: false
console.log(guests.indexOf("Chloe")); // prints: 2
console.log(guests.indexOf("Dan"));   // prints: -1
```

- `includes` answers yes or no: is this item in the list?
- `indexOf` tells you *where* it is. If it isn't there, you get `-1`, which means "not found".
- Both are case-sensitive, so `"ben"` doesn't match `"Ben"`.

`includes` fits nicely inside an `if` from [chapter 07](../07-conditionals/notes.md):

```js
const guests = ["Asha", "Ben", "Chloe"];
const visitor = "Dan";

if (guests.includes(visitor)) {
  console.log(`Welcome in, ${visitor}!`);
} else {
  console.log(`Sorry ${visitor}, you're not on the list.`);
}
// prints: Sorry Dan, you're not on the list.
```

### Copying part of an array: `slice`

`slice(start, end)` copies a piece of an array into a new array. The item at `start` is included, and the item at `end` is not. That's the same rule as `slice` on strings.

```js
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const spring = months.slice(2, 5);
console.log(spring); // prints: [ 'Mar', 'Apr', 'May' ]
console.log(months); // prints: [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun' ]
```

The original `months` is untouched. `slice` only makes a copy.

A few handy forms:

```js
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
console.log(months.slice(4));  // prints: [ 'May', 'Jun' ]
console.log(months.slice(-3)); // prints: [ 'Apr', 'May', 'Jun' ]
console.log(months.slice());   // prints: [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun' ]
```

- Leave out `end` to go all the way to the end.
- A negative number counts from the end, like `at(-1)` does.
- With nothing in the brackets, `slice()` copies the whole array.

### Removing or inserting in the middle: `splice`

`splice` is the heavy-duty tool. It **changes** the array. It can remove items, insert items, or both, anywhere in the list.

`splice(start, howMany)` removes `howMany` items, starting at index `start`. It gives you back the removed items as a new array:

```js
const tasks = ["email Sam", "buy stamps", "call the dentist", "pay rent"];
const done = tasks.splice(1, 2); // from index 1, remove 2 items
console.log(done);  // prints: [ 'buy stamps', 'call the dentist' ]
console.log(tasks); // prints: [ 'email Sam', 'pay rent' ]
```

Add more values after `howMany`, and `splice` inserts them at that spot:

```js
const tasks = ["email Sam", "pay rent"];

tasks.splice(1, 0, "water plants"); // at index 1: remove nothing, insert one
console.log(tasks); // prints: [ 'email Sam', 'water plants', 'pay rent' ]

tasks.splice(2, 1, "pay bills"); // at index 2: remove one, insert one (a swap)
console.log(tasks); // prints: [ 'email Sam', 'water plants', 'pay bills' ]
```

### `slice` or `splice`?

The names are one letter apart, so they're easy to mix up. Think of a book:

- `slice` is like **photocopying** some pages. You get copies, and the book stays whole.
- `splice` is like **tearing pages out** (and maybe gluing new ones in). The book itself changes.

| | `slice(2, 4)` | `splice(2, 4)` |
|---|---|---|
| Changes the original array? | No | **Yes** |
| The second number means | where to stop (not included) | how many items to remove |
| Gives back | a copy of that part | the removed items |

### Turning an array into text: `join`

`join` glues all the items into one string, with a separator of your choice between them:

```js
const words = ["pack", "your", "bags"];
console.log(words.join(" ")); // prints: pack your bags
console.log(words.join("-")); // prints: pack-your-bags
console.log(words.join(""));  // prints: packyourbags
console.log(words.join());    // prints: pack,your,bags
```

If you don't give a separator, you get commas.

### From text to an array: `split` (a recap)

In chapter 06, `split` turned a string into an array. Now you know what that array is. `split` and `join` are opposites:

```js
const line = "Tokyo,Paris,Lima";
const cities = line.split(",");
console.log(cities);             // prints: [ 'Tokyo', 'Paris', 'Lima' ]
console.log(cities.length);      // prints: 3
console.log(cities.join(" | ")); // prints: Tokyo | Paris | Lima
```

This is how programs often read simple data, like one row of a spreadsheet saved as text.

### Joining two arrays: `concat`

`concat` makes a **new** array with the items of both. The originals stay as they were:

```js
const fruits = ["apple", "banana"];
const veggies = ["carrot", "pea"];
const groceries = fruits.concat(veggies);
console.log(groceries); // prints: [ 'apple', 'banana', 'carrot', 'pea' ]
console.log(fruits);    // prints: [ 'apple', 'banana' ]
```

### Flipping the order: `reverse`

A chat app stores messages oldest first, but you want to show the newest first:

```js
const messages = ["Hi!", "How are you?", "See you at 6"];
messages.reverse();
console.log(messages); // prints: [ 'See you at 6', 'How are you?', 'Hi!' ]
```

> **Watch out:** `reverse` changes the original array. The old order is gone.

To keep the original, reverse a copy instead:

```js
const messages = ["Hi!", "How are you?", "See you at 6"];
const newestFirst = messages.slice().reverse();
console.log(newestFirst); // prints: [ 'See you at 6', 'How are you?', 'Hi!' ]
console.log(messages);    // prints: [ 'Hi!', 'How are you?', 'See you at 6' ]
```

`slice()` makes a copy, then `reverse()` flips the copy. That's method chaining, from chapter 06. Newer JavaScript (since 2023) also has `toReversed()`, which gives you a reversed copy in one step. You'll meet its cousin `toSorted()` in chapter 13.

Here's a classic trick that chains a string method and two array methods:

```js
const word = "stressed";
const backwards = word.split("").reverse().join("");
console.log(backwards); // prints: desserts
```

`split("")` breaks the word into an array of letters, `reverse()` flips that array, and `join("")` glues the letters back together.

### Which methods change the array?

This matters more than it looks. Changing an array by accident is a very common bug.

| Changes the original array | Leaves it alone (gives back something new) |
|---|---|
| `push`, `pop`, `shift`, `unshift` | `slice`, `concat`, `join` |
| `splice`, `reverse` | `includes`, `indexOf`, `at` |
| setting an item, like `seats[1] = "taken"` | `toReversed` |

### Looping over an array

This is where arrays really pay off. A loop can visit every item, however long the list is.

**A `for` loop with an index:**

```js
const scores = [72, 88, 95];

for (let i = 0; i < scores.length; i++) {
  console.log(`Player ${i + 1}: ${scores[i]} points`);
}
```

You'll see:

```
Player 1: 72 points
Player 2: 88 points
Player 3: 95 points
```

The loop starts at `0`, the first index, and keeps going while `i < scores.length`. With 3 items, `i` goes 0, 1, 2, and then the loop stops. We print `i + 1` because humans count from 1.

**A `for...of` loop:**

In [chapter 08](../08-loops/notes.md) you used `for...of` to step through the letters of a string. It works on arrays too, and it's simpler when you only need the items:

```js
const scores = [72, 88, 95];

for (const score of scores) {
  console.log(`Score: ${score}`);
}
```

You'll see:

```
Score: 72
Score: 88
Score: 95
```

Which one should you use?

| Loop | Use it when |
|---|---|
| `for...of` | you only need each item (most of the time) |
| `for` with an index | you also need the position, or you want to change items, like `scores[i] = 0` |

### Three loop patterns you'll use all the time

**1. Adding everything up.** Start a running total at `0`, then add each item to it. Wrap it in a [function](../09-functions/notes.md) and it works for any list:

```js
function sumAll(numbers) {
  let total = 0;
  for (const number of numbers) {
    total += number;
  }
  return total;
}

console.log(sumAll([4.5, 12, 3.25])); // prints: 19.75
console.log(sumAll([10, 20, 30]));    // prints: 60
console.log(sumAll([]));              // prints: 0
```

An array is a value like any other, so you can pass it into a function (and return one, too).

**2. Finding the biggest.** Assume the first item is the biggest. Then check every item, and whenever you find a bigger one, remember that one instead:

```js
const temperatures = [18, 24, 21, 27, 19];
let highest = temperatures[0];

for (const temp of temperatures) {
  if (temp > highest) {
    highest = temp;
  }
}
console.log(`Hottest day: ${highest}°C`); // prints: Hottest day: 27°C
```

**3. Building a new array.** Start with an empty array, and `push` only the items you want to keep:

```js
const ages = [12, 19, 15, 21, 30];
const adults = [];

for (const age of ages) {
  if (age >= 18) {
    adults.push(age);
  }
}
console.log(adults); // prints: [ 19, 21, 30 ]
```

The original `ages` array doesn't change.

> In [chapter 13](../13-array-methods/notes.md) you'll learn shorter ways to write these patterns, like `filter` for the last one. Knowing the loop versions first means you'll understand what those shortcuts are doing for you.

### Mixed types and nested arrays

An array can hold any type from [chapter 03](../03-data-types/notes.md), even a mix:

```js
const profile = ["Maya", 28, true, null];
console.log(profile); // prints: [ 'Maya', 28, true, null ]
```

That works, but quick: what does `profile[2]` mean? Hard to say. Most of the time, keep one kind of thing per array, like a list of names or a list of prices. For a bundle of different facts about one thing, the objects in [chapter 11](../11-objects/notes.md) are a much better fit.

An array can even hold other arrays. That's called a **nested array**, and it's perfect for grids, like a tic-tac-toe board:

```js
const board = [
  ["X", "O", "X"],
  ["O", "X", "O"],
  [" ", " ", "X"]
];

console.log(board[0][2]); // prints: X
board[2][0] = "O";

for (const row of board) {
  console.log(row.join(" | "));
}
```

You'll see:

```
X
X | O | X
O | X | O
O |   | X
```

`board[0]` is the first row, which is itself an array. `board[0][2]` is the item at index 2 of that row. Read it as "row 0, column 2".

### Is it an array? `Array.isArray`

Remember `typeof` from chapter 03? It gives a surprising answer for arrays:

```js
const colors = ["red", "green"];
console.log(typeof colors);         // prints: object
console.log(Array.isArray(colors)); // prints: true
console.log(Array.isArray("red"));  // prints: false
```

Arrays are a special kind of object (you'll learn about objects in chapter 11), so `typeof` can't tell them apart. When you need to know "is this a list?", use `Array.isArray`.

## Common mistakes

**1. Reading past the end of the array**

```js
const podium = ["gold", "silver", "bronze"];
console.log(podium[3]); // prints: undefined
```

There's no item at index 3, but JavaScript doesn't give you an error. It quietly hands you `undefined`, and the bug shows up somewhere else later. The last index is `length - 1`, which is 2 here. When you want the last item, use `podium.at(-1)`.

**2. Going one step too far in a loop**

```js
const podium = ["gold", "silver", "bronze"];
for (let i = 0; i <= podium.length; i++) {
  console.log(podium[i]);
}
```

You'll see:

```
gold
silver
bronze
undefined
```

`<=` lets `i` reach 3, one step past the last index. This is called an **off-by-one error**, and every programmer makes it sometimes. Fix: use `i < podium.length`. Or use `for...of`, which can't run off the end.

**3. Thinking `const` means the array can't change**

```js
const cart = ["apple"];
cart.push("pear");
console.log(cart); // prints: [ 'apple', 'pear' ]
```

This works, and it's supposed to. `const` only stops you from putting a *different* array into the variable (`cart = []` gives `TypeError: Assignment to constant variable.`). The items inside can still change. So `const` is still the right choice for most arrays.

**4. Changing an array by accident**

```js
const ranking = ["Ana", "Ben", "Cara"];
const lastToFirst = ranking.reverse();
console.log(ranking); // prints: [ 'Cara', 'Ben', 'Ana' ]
```

You wanted a reversed copy, but `reverse` flipped the original too. The same goes for `splice`: if you only wanted to *look at* some items, `splice` removes them for real. Check the "Which methods change the array?" table above. To keep the original, use `slice`, or work on a copy: `ranking.slice().reverse()`.

**5. Checking for an empty array the wrong way**

```js
const cart = [];
if (cart) {
  console.log("You have items in your cart!");
}
// prints: You have items in your cart!
```

An empty array is **truthy**. It isn't on chapter 07's list of falsy values, so `if (cart)` is true for *every* array, even an empty one. Check the length instead: `if (cart.length > 0)`. And don't try `cart === []`. It's always `false`, for reasons chapter 16 explains.

## Quick recap

- An array is an ordered list in one variable: `const days = ["Mon", "Tue", "Wed"];`.
- Indexes start at 0. The last item is at `length - 1`, or use `.at(-1)`.
- `push` and `pop` work at the end, `unshift` and `shift` at the start. `splice` changes the middle, while `slice` copies part without changing anything.
- `includes` and `indexOf` find things. `join` turns an array into a string, and `split` does the opposite.
- Loop with `for...of` when you need the items, or with a `for` loop when you also need the index.
- A `const` array can still be changed. It just can't be replaced with a different array.
- Reading past the end gives `undefined`, not an error.

---

**Next:** try the [exercises](exercises.md), then move on to [11 Objects](../11-objects/notes.md).
