# 13 Array Methods

## What is it?

**Array methods** are built-in functions that every array comes with, like `map`, `filter`, and `reduce`.

You give one of them a small function that says what to do with *one* item. The method runs that function for every item in the array, so you don't have to write the loop yourself.

## Why does it matter?

In [chapter 10](../10-arrays/notes.md) you looped over arrays with `for`. That works, but you write the same setup every time: an empty array, a loop, a `push`.

Say you want the names from a list of products:

```js
const products = [
  { name: "Keyboard", price: 45 },
  { name: "Mouse", price: 20 },
  { name: "Monitor", price: 180 },
];

// With a loop
const names = [];
for (const product of products) {
  names.push(product.name);
}

// With an array method
const sameNames = products.map((product) => product.name);

console.log(names);     // prints: [ 'Keyboard', 'Mouse', 'Monitor' ]
console.log(sameNames); // prints: [ 'Keyboard', 'Mouse', 'Monitor' ]
```

Both give the same result. The second one says *what* you want ("the name of each product") instead of *how* to loop. That means:

- Less code, and fewer places for bugs like off-by-one errors to hide.
- Code that reads almost like a sentence.
- Code that looks like real-world JavaScript. You'll see these methods in almost every project.

## Real-world example

Picture a teacher with a stack of exam papers and a helpful assistant. The teacher doesn't handle every paper herself. She gives the assistant one short instruction, and the assistant applies it to each paper in the stack.

| Instruction to the assistant | Array method | What comes back |
|---|---|---|
| "Write 'Well done' on each paper." | `forEach` | Nothing. The work itself is the point |
| "Give me each student's grade as a letter." | `map` | A new stack, same size |
| "Give me only the papers that passed." | `filter` | A new stack, maybe smaller |
| "Find me the first paper by Priya." | `find` | One paper (or nothing) |
| "Did anyone get 100?" | `some` | Yes or no |
| "Did everyone pass?" | `every` | Yes or no |
| "Add up all the scores." | `reduce` | One number |
| "Put them in order, highest first." | `sort` | The same stack, reordered |

In code, the instruction you hand over is a function, and it has a special name: a callback. That's where we'll start.

## How it works

### Callbacks: handing a function to another function

Remember from [chapter 09](../09-functions/notes.md) that functions are values? You can store them in variables. You can also pass them into other functions, just like numbers or strings.

A **callback** is a function you pass into another function, so that function can call it for you. You hand it over, and the other function "calls it back" when it needs it.

```js
function shout(text) {
  return text.toUpperCase() + "!";
}

function announce(message, style) {
  console.log(style(message)); // call whatever function we were given
}

announce("doors open at seven", shout); // prints: DOORS OPEN AT SEVEN!
```

Look closely: we pass `shout`, not `shout()`. Without brackets, you hand over the function itself. With brackets, you'd call it right away and pass along its result instead.

You don't have to name the callback first. You can write an arrow function right inside the call:

```js
announce("doors open at seven", (text) => `*** ${text} ***`);
// prints: *** doors open at seven ***
```

That's exactly how array methods work. The method does the looping, and your callback says what happens to each item.

### `forEach`: do something with each item

`forEach` calls your callback once for every item, in order.

```js
const playlist = ["Intro", "Sunrise", "Night Drive"];

playlist.forEach((song, index) => {
  console.log(`${index + 1}. ${song}`);
});
```

You'll see:

```
1. Intro
2. Sunrise
3. Night Drive
```

The callback receives up to three things: the current item, its index, and the whole array. You only list the ones you need. Here we use the song and its index.

`forEach` doesn't give anything back (it returns `undefined`). Use it when the action is the whole point: printing, saving, updating something.

> **Watch out:** you can't stop a `forEach` early with `break`. If you need to stop partway, use a `for...of` loop from [chapter 10](../10-arrays/notes.md).

### `map`: turn every item into something new

`map` builds a **new array** out of whatever your callback returns. You get one new item for every old one, so the new array always has the same length.

```js
const celsius = [0, 20, 30, 100];
const fahrenheit = celsius.map((temp) => temp * 9 / 5 + 32);

console.log(fahrenheit); // prints: [ 32, 68, 86, 212 ]
console.log(celsius);    // prints: [ 0, 20, 30, 100 ]
```

The original array isn't changed. `map` only reads it.

Your callback can return anything: a number, a string, an object. A very common job is pulling one property out of each object, like the product names at the top of this chapter.

> **Tip:** if your arrow function has curly braces `{ }`, you must write `return`. Without braces, the value is returned automatically (the implicit return from [chapter 09](../09-functions/notes.md)). Forgetting this is the most common `map` bug. See Common mistakes.

### `filter`: keep only the items you want

`filter` also builds a new array, but it decides which items get in. Your callback answers a yes-or-no question about each item. Return `true` to keep it, `false` to leave it out.

```js
const scores = [72, 45, 90, 38, 64];
const passed = scores.filter((score) => score >= 50);

console.log(passed); // prints: [ 72, 90, 64 ]
```

The new array can be shorter than the original, or even empty. The items you keep stay in their original order.

With objects, test a property:

```js
const products = [
  { name: "Lamp", inStock: true },
  { name: "Rug", inStock: false },
  { name: "Mirror", inStock: true },
];

const available = products.filter((product) => product.inStock);
console.log(available.length); // prints: 2
```

`product.inStock` is already `true` or `false`, so the callback can return it directly. Any truthy value counts as "keep", just like in an `if` from [chapter 07](../07-conditionals/notes.md).

### `find` and `findIndex`: get the first match

Sometimes you want one specific item, not a whole list. `find` returns the **first item** that passes your test, and stops looking as soon as it finds one. If nothing matches, you get `undefined`.

```js
const orders = [
  { id: 101, status: "delivered" },
  { id: 102, status: "shipped" },
  { id: 103, status: "shipped" },
];

console.log(orders.find((order) => order.status === "shipped"));
// prints: { id: 102, status: 'shipped' }

console.log(orders.find((order) => order.id === 999)); // prints: undefined
```

`findIndex` works the same way, but gives you the item's **position** instead. If nothing matches, it returns `-1`, like `indexOf` from [chapter 10](../10-arrays/notes.md).

```js
console.log(orders.findIndex((order) => order.id === 103)); // prints: 2
console.log(orders.findIndex((order) => order.id === 999)); // prints: -1
```

`indexOf` can only look for an exact value. `findIndex` can look for anything you can describe as a test, like "the order whose id is 103".

### `some` and `every`: yes-or-no questions

These two answer a question about the whole array with `true` or `false`.

- `some`: is the test true for **at least one** item?
- `every`: is the test true for **all** of the items?

```js
const temperatures = [18, 22, 31, 25];

console.log(temperatures.some((temp) => temp > 30));  // prints: true
console.log(temperatures.every((temp) => temp > 15)); // prints: true
console.log(temperatures.every((temp) => temp > 20)); // prints: false
```

Real uses: "Is any item in the cart out of stock?" (`some`). "Has every task been ticked off?" (`every`).

### `reduce`: boil a whole array down to one value

`reduce` confuses a lot of people at first, so let's take it one small step at a time.

**Step 1: start from a loop you already know.** Here's the "adding everything up" pattern from [chapter 10](../10-arrays/notes.md), totaling a shopping basket:

```js
const basket = [12, 5, 8];

let total = 0;               // start at 0
for (const price of basket) {
  total = total + price;     // new total = old total + this price
}

console.log(total); // prints: 25
```

Look at the pattern. There's a **running total** that starts at `0`. Each time round the loop, you take the total so far, add one price, and that becomes the new total so far.

**Step 2: the same thing with `reduce`.**

```js
const basket = [12, 5, 8];

const total = basket.reduce((runningTotal, price) => runningTotal + price, 0);

console.log(total); // prints: 25
```

`reduce` takes two things: a callback, and a starting value (the `0` at the very end). Here's what each part means:

| Part | What it is |
|---|---|
| `0` at the end | The **starting value**. The running total begins here. |
| `runningTotal` | The result so far. It's usually called the **accumulator**, because it accumulates (collects) the answer as `reduce` moves through the array. |
| `price` | The current item, just like in `map` or `filter`. |
| `runningTotal + price` | What the callback returns. This becomes the running total for the **next** item. |

**Step 3: follow it one item at a time.** Here's every step `reduce` takes for `[12, 5, 8]`:

| Step | `runningTotal` coming in | `price` | Callback returns |
|---|---|---|---|
| 1 | `0` ← the starting value | `12` | `0 + 12` = `12` |
| 2 | `12` ← returned by step 1 | `5` | `12 + 5` = `17` |
| 3 | `17` ← returned by step 2 | `8` | `17 + 8` = `25` |

After the last item, `reduce` hands back the final returned value: `25`.

If you remember one thing, make it this: **whatever the callback returns becomes the accumulator for the next step.** Each row's answer is handed on to the row below it.

It's like a cashier scanning your shopping. The screen starts at 0. Each beep adds one item to whatever is already on the screen. After the last item, the screen shows your total. `reduce` is the cashier, and the accumulator is the screen.

**Step 4: watch it for yourself.** Put a `console.log` inside the callback to print each step. The callback now has curly braces, so it needs a `return`:

```js
const basket = [12, 5, 8];

const total = basket.reduce((runningTotal, price) => {
  const newTotal = runningTotal + price;
  console.log(`${runningTotal} + ${price} = ${newTotal}`);
  return newTotal;
}, 0);

console.log(`Total: ${total}`);
```

You'll see:

```
0 + 12 = 12
12 + 5 = 17
17 + 8 = 25
Total: 25
```

Whenever a `reduce` confuses you, add a log like this and watch each hand-off.

**With objects.** For an array of objects, pick out what you need inside the callback:

```js
const cart = [
  { item: "Notebook", price: 3, quantity: 4 },
  { item: "Pen", price: 2, quantity: 10 },
  { item: "Backpack", price: 30, quantity: 1 },
];

const cartTotal = cart.reduce((sum, line) => sum + line.price * line.quantity, 0);
console.log(cartTotal); // prints: 62
```

The notebooks cost `3 * 4 = 12`, the pens `2 * 10 = 20`, and the backpack `30 * 1 = 30`. So `sum` goes 0 → 12 → 32 → 62.

**The result doesn't have to be a number.** The accumulator can be anything: a number, a string, even an object. Here it's an object that counts votes for a team lunch:

```js
const votes = ["pizza", "tacos", "pizza", "sushi", "pizza"];

const tally = votes.reduce((counts, vote) => {
  counts[vote] = (counts[vote] || 0) + 1; // start at 0 if this food is new
  return counts;                          // hand the object on to the next step
}, {});

console.log(tally); // prints: { pizza: 3, tacos: 1, sushi: 1 }
```

| Step | `counts` coming in | `vote` | `counts` going out |
|---|---|---|---|
| 1 | `{}` ← the starting value | `"pizza"` | `{ pizza: 1 }` |
| 2 | `{ pizza: 1 }` | `"tacos"` | `{ pizza: 1, tacos: 1 }` |
| 3 | `{ pizza: 1, tacos: 1 }` | `"pizza"` | `{ pizza: 2, tacos: 1 }` |
| 4 | `{ pizza: 2, tacos: 1 }` | `"sushi"` | `{ pizza: 2, tacos: 1, sushi: 1 }` |
| 5 | `{ pizza: 2, tacos: 1, sushi: 1 }` | `"pizza"` | `{ pizza: 3, tacos: 1, sushi: 1 }` |

Same idea: what goes out of one step comes into the next. The starting value `{}` is an empty object. `counts[vote]` uses bracket notation from [chapter 11](../11-objects/notes.md) because the key is in a variable. And `|| 0` from [chapter 07](../07-conditionals/notes.md) means "use 0 if this food has no count yet". A missing property is `undefined`, which is falsy.

> **Tip:** always give `reduce` a starting value. It makes your code easier to read, and it prevents a crash on empty arrays (see Common mistakes).

**When should you use `reduce`?** When many items should become **one** result: a total, a count, an average, the biggest value, or an object built up from a list. If you want a new array of the same length, `map` is clearer. If you want some of the items, use `filter`.

### `sort`: put items in order

`sort` rearranges the items of an array. For words, the default works well:

```js
const fruits = ["pear", "apple", "fig"];
fruits.sort();
console.log(fruits); // prints: [ 'apple', 'fig', 'pear' ]
```

**The number gotcha.** Now try the same with numbers:

```js
const prices = [10, 9, 1, 100, 25];
prices.sort();
console.log(prices); // prints: [ 1, 10, 100, 25, 9 ]
```

Your code isn't broken. By default, `sort` turns every item into a string and compares them like words in a dictionary, one character at a time. As text, `"100"` comes before `"25"` because `"1"` comes before `"2"`, the same way "apple" comes before "banana".

**The fix: a compare function.** Pass `sort` a callback that takes two items, `a` and `b`, and returns a number:

- **Negative:** `a` goes first.
- **Positive:** `b` goes first.
- **Zero:** keep them as they are.

For numbers, `a - b` gives exactly that:

```js
const prices = [10, 9, 1, 100, 25];

prices.sort((a, b) => a - b); // smallest first
console.log(prices); // prints: [ 1, 9, 10, 25, 100 ]

prices.sort((a, b) => b - a); // largest first
console.log(prices); // prints: [ 100, 25, 10, 9, 1 ]
```

To remember it: `a - b` goes up (small to big), `b - a` goes down (big to small).

**Sorting objects by a property.** Compare that property inside the callback:

```js
const hotels = [
  { name: "Seaside Inn", price: 120 },
  { name: "City Lodge", price: 85 },
  { name: "Mountain View", price: 150 },
];

hotels.sort((a, b) => a.price - b.price);
console.log(hotels.map((hotel) => hotel.name));
// prints: [ 'City Lodge', 'Seaside Inn', 'Mountain View' ]
```

To sort by a text property, use the string method `localeCompare`. It compares two strings the way a dictionary does and returns a negative number, a positive number, or zero, which is just what `sort` wants:

```js
hotels.sort((a, b) => a.name.localeCompare(b.name));
console.log(hotels.map((hotel) => hotel.name));
// prints: [ 'City Lodge', 'Mountain View', 'Seaside Inn' ]
```

`localeCompare` also handles capital letters sensibly. A plain `sort()` puts `"Cherry"` before `"apple"`, because capital letters come before lowercase ones in the computer's character list.

> **Watch out:** `sort` changes the original array. It also returns that same array, so `const sorted = list.sort()` doesn't give you a copy. `sorted` and `list` are the same array.

### `toSorted`: sort without changing the original

`toSorted` works like `sort`, but it returns a **new** sorted array and leaves the original alone:

```js
const lapTimes = [62, 58, 71, 60];
const fastestFirst = lapTimes.toSorted((a, b) => a - b);

console.log(fastestFirst); // prints: [ 58, 60, 62, 71 ]
console.log(lapTimes);     // prints: [ 62, 58, 71, 60 ]
```

Use it whenever you still need the original order later. It's the cousin of `toReversed()` from [chapter 10](../10-arrays/notes.md), and just as new (added to JavaScript in 2023), so it works in Node 20 and later and in all current browsers.

### Chaining: one step after another

Most of these methods return an array, so you can call another method straight on the result. This is called **chaining**.

```js
const orders = [
  { customer: "Ana", total: 40, status: "paid" },
  { customer: "Ben", total: 25, status: "refunded" },
  { customer: "Cleo", total: 90, status: "paid" },
  { customer: "Dev", total: 15, status: "paid" },
];

const paidRevenue = orders
  .filter((order) => order.status === "paid") // keep the paid orders
  .map((order) => order.total)                // take just the totals
  .reduce((sum, total) => sum + total, 0);    // add them up

console.log(paidRevenue); // prints: 145
```

Read it top to bottom, like a recipe: take the orders, keep the paid ones, take their totals, add them up. Putting each step on its own line, starting with a `.`, keeps long chains readable.

### A few more handy tools

You'll use these less often, so here's just a quick look at each.

**`flat`** flattens nested arrays by one level:

```js
const weeklyShifts = [["Mon", "Tue"], ["Thu"], ["Sat", "Sun"]];
console.log(weeklyShifts.flat()); // prints: [ 'Mon', 'Tue', 'Thu', 'Sat', 'Sun' ]
```

For deeper nesting, tell it how many levels to flatten, like `flat(2)`. In [chapter 17](../17-recursion/notes.md) you'll write your own version.

**`flatMap`** is a `map` followed by a `flat`. It's handy when each item turns into several:

```js
const orders = [
  { id: 1, items: ["shirt", "socks"] },
  { id: 2, items: ["hat"] },
];
console.log(orders.flatMap((order) => order.items)); // prints: [ 'shirt', 'socks', 'hat' ]
```

A plain `map` would give you an array of arrays: `[ [ 'shirt', 'socks' ], [ 'hat' ] ]`.

**`Array.from`** builds a real array out of something list-like. It can split a string into letters, or build an array from a length and a callback:

```js
console.log(Array.from("hello")); // prints: [ 'h', 'e', 'l', 'l', 'o' ]

const seatNumbers = Array.from({ length: 5 }, (_, index) => index + 1);
console.log(seatNumbers); // prints: [ 1, 2, 3, 4, 5 ]
```

`{ length: 5 }` means "five empty slots", and the callback fills each one. The slots are empty, so we don't need the callback's first parameter. We name it `_`, a common name for "a parameter I'm not using".

**`Object.groupBy`** sorts items into groups by a key you choose:

```js
const groceries = [
  { name: "Apple", aisle: "fruit" },
  { name: "Milk", aisle: "dairy" },
  { name: "Banana", aisle: "fruit" },
];

const byAisle = Object.groupBy(groceries, (item) => item.aisle);
console.log(byAisle);
```

You'll see:

```
[Object: null prototype] {
  fruit: [
    { name: 'Apple', aisle: 'fruit' },
    { name: 'Banana', aisle: 'fruit' }
  ],
  dairy: [ { name: 'Milk', aisle: 'dairy' } ]
}
```

You get back an object with one key per group, each holding an array of the matching items. The `[Object: null prototype]` label is a detail about how the object was built (chapter 28 explains it). You can use it like any other object: `byAisle.fruit.length` is `2`.

`Object.groupBy` is new (2024). It works in Node 21 and later and in current browsers.

### Which method do I need?

| I want to... | Use | You get back |
|---|---|---|
| Do something with each item (print, save) | `forEach` | `undefined` |
| Turn every item into something new | `map` | A new array, same length |
| Keep only the items that pass a test | `filter` | A new array, same length or shorter |
| Get the first item that passes a test | `find` | The item, or `undefined` |
| Get the position of the first match | `findIndex` | An index, or `-1` |
| Check if at least one item passes | `some` | `true` or `false` |
| Check if every item passes | `every` | `true` or `false` |
| Combine all the items into one result | `reduce` | One value, of any type |
| Put items in order | `sort` or `toSorted` | The sorted array |
| Split items into groups | `Object.groupBy` | An object of arrays |

### Does it change the original array?

| Changes the original | Leaves the original alone |
|---|---|
| `sort`, `reverse` | `toSorted`, `toReversed` |
| `push`, `pop`, `shift`, `unshift`, `splice` | `map`, `filter`, `find`, `findIndex`, `some`, `every`, `reduce`, `forEach` |
| | `slice`, `concat`, `join`, `includes`, `indexOf`, `flat`, `flatMap` |

Changing an array can surprise other parts of your program that use the same array. [Chapter 16](../16-values-vs-references/notes.md) explains why.

## Common mistakes

**1. Forgetting `return` inside curly braces**

```js
const prices = [5, 10, 15];
const doubled = prices.map((price) => {
  price * 2;
});
console.log(doubled); // prints: [ undefined, undefined, undefined ]
```

With curly braces, an arrow function only returns what you tell it to. No `return` means `undefined` for every item. Fix: write `return price * 2;` inside the braces, or drop the braces: `prices.map((price) => price * 2)`.

**2. Sorting numbers without a compare function**

```js
const ages = [5, 40, 100, 21];
ages.sort();
console.log(ages); // prints: [ 100, 21, 40, 5 ]
```

The default sort compares text, not numbers. Fix: `ages.sort((a, b) => a - b)`.

**3. Forgetting that `sort` changes the original**

```js
const queue = ["Zoe", "Adam", "Mia"];
const alphabetical = queue.sort();
console.log(queue); // prints: [ 'Adam', 'Mia', 'Zoe' ]
```

The original order of the queue is gone, and `alphabetical` isn't a copy: it's the same array. Fix: use `queue.toSorted()` when you still need the original order.

**4. Calling the callback instead of passing it**

```js
function isPassing(score) {
  return score >= 50;
}

const scores = [80, 30, 65];
const passed = scores.filter(isPassing());
// TypeError: boolean false is not a function
```

The brackets in `isPassing()` run the function straight away, with no score, so it returns `false`. Then `filter` receives `false` instead of a function. Fix: pass the function itself, without brackets: `scores.filter(isPassing)`.

**5. Using `forEach` when you want a new array**

```js
const names = ["ana", "ben"];
const capitalized = names.forEach((name) => name.toUpperCase());
console.log(capitalized); // prints: undefined
```

`forEach` always returns `undefined`, whatever your callback returns. Fix: when you want a new array back, use `map`.

**6. Using `reduce` on an empty array with no starting value**

```js
const refunds = [];
const totalRefunds = refunds.reduce((sum, amount) => sum + amount);
// TypeError: Reduce of empty array with no initial value
```

Without a starting value, `reduce` uses the first item as the start. An empty array has no first item, so it crashes. Fix: always pass a starting value. `refunds.reduce((sum, amount) => sum + amount, 0)` gives `0`.

## Quick recap

- A **callback** is a function you pass into another function, which calls it for you. Pass `myFunction`, not `myFunction()`.
- `forEach` does something with each item, `map` changes every item, `filter` keeps some items, `find` gets the first match, and `some`/`every` answer yes-or-no questions.
- `reduce` boils an array down to one value. Whatever the callback returns becomes the accumulator for the next item. Always give it a starting value.
- `sort` compares items as text by default, so use `(a, b) => a - b` for numbers. `sort` changes the original; `toSorted` gives you a sorted copy.
- Chain methods (`filter`, then `map`, then `reduce`) to write code that reads like a recipe.

---

**Next:** try the [exercises](exercises.md), then move on to [14 Scope and Hoisting](../14-scope-and-hoisting/notes.md).
