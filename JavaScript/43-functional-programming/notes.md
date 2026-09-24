# 43 Functional Programming

## What is it?

**Functional programming** (FP for short) is a style of writing code. You build your program out of small, predictable functions. Data goes into a function, a new result comes out, and nothing else gets changed along the way.

It isn't a new language or a library. It's a way of using the JavaScript you already know: functions, `map` and `filter`, closures, and spread.

## Why does it matter?

Think about the worst bugs you've hit so far. Many were probably "who changed my data?" bugs: an array that got sorted behind your back, or an object that two parts of your program were quietly sharing (remember [chapter 16](../16-values-vs-references/notes.md)?).

The FP style prevents a lot of those, and it brings other wins too:

- **Predictable:** a pure function always gives the same answer for the same input. No surprises.
- **Easy to test:** no setup and no hidden state. Call it, check the result. ([Chapter 46](../46-testing/notes.md) will love this.)
- **Easy to reuse:** small functions snap together into bigger ones, like LEGO bricks.
- **Easy to change:** you can add, swap, or remove one step without breaking the others.

You'll see these ideas all over modern JavaScript. React, for example, expects your components to be pure, and it wants you to update data by making copies instead of changing it.

## Real-world example

A functional program works like a **sandwich shop's assembly line**.

| On the assembly line | In functional programming |
|---|---|
| Each worker has one job: slice, fill, toast, or wrap | Each function does one small thing |
| A worker only uses what they're handed, and passes the result on | A function only uses its inputs, and returns a result |
| Nobody reaches over and changes another worker's sandwich | No side effects: a function doesn't change things outside itself |
| Want toasted sandwiches? Add a toasting station. Don't rebuild the line | Add a function to the pipeline. Don't rewrite the others |
| Every sandwich goes through the same steps, the same way | Same input, same output, every time |

Keep this picture in mind. Most of this chapter is about building good workers (pure functions) and lining them up (composition).

## How it works

### Pure functions

A **pure function** follows two rules:

1. **Same input, same output.** Call it with the same arguments, and you always get the same answer.
2. **No side effects.** It doesn't change anything outside itself. It just returns a value.

A pure function is like a calculator. 4 × 3 is 12 today, tomorrow, and next year. And pressing `=` doesn't change anything else in the room.

```js
function calculateTotal(price, quantity) {
  return price * quantity;
}

console.log(calculateTotal(4, 3)); // prints: 12
console.log(calculateTotal(4, 3)); // prints: 12 (always)
```

Here's an impure one. It changes a variable that lives outside it:

```js
let cartTotal = 0;

function addToCart(price) {
  cartTotal += price; // changes a variable outside the function
  return cartTotal;
}

console.log(addToCart(10)); // prints: 10
console.log(addToCart(10)); // prints: 20 (same input, different answer!)
```

To know what `addToCart(10)` will return, you need to know everything that happened before it was called. That's what makes impure code hard to follow.

A function is also impure if it *reads* something that can change, like the clock:

```js
function isShopOpen() {
  const hour = new Date().getHours();
  return hour >= 9 && hour < 17;
}
```

Its answer depends on *when* you call it. The fix is to pass the changing thing in as a parameter:

```js
function isShopOpen(hour) {
  return hour >= 9 && hour < 17;
}

console.log(isShopOpen(10)); // prints: true
console.log(isShopOpen(20)); // prints: false
```

Now it's pure, and you can check any hour you like without waiting until 8 p.m. The code that calls it can still pass in the real time: `isShopOpen(new Date().getHours())`.

### Side effects, and where to put them

A **side effect** is anything a function does besides working out its return value. For example:

- changing a variable outside the function
- changing (mutating) an array or object that was passed in
- printing with `console.log`
- saving to `localStorage`, sending a `fetch` request, changing the page, or starting a timer

But wait: a program with *no* side effects would be useless. It couldn't print, save, or show anything! So FP doesn't ban side effects. It **keeps them at the edges**. Do the thinking in pure functions, and do the side effects in a few clear places, usually at the very end:

```js
// Pure: it only calculates
function getOrderSummary(items) {
  const total = items.reduce((sum, item) => sum + item.price, 0);
  return `${items.length} items, $${total.toFixed(2)}`;
}

// The edge: where the result meets the outside world
const cart = [
  { name: "Tea", price: 3.5 },
  { name: "Cake", price: 4.25 },
];
console.log(getOrderSummary(cart)); // prints: 2 items, $7.75
```

`getOrderSummary` can be tested, reused, and trusted. The one side effect, printing, happens outside it.

The sneakiest side effect is changing an argument:

```js
function addItem(cart, item) {
  cart.push(item); // changes the caller's array!
  return cart;
}
```

Whoever called `addItem` now has a changed cart, whether they wanted one or not. The pure version builds a new array and leaves the original alone:

```js
function addItem(cart, item) {
  return [...cart, item];
}

const myCart = ["tea"];
const newCart = addItem(myCart, "cake");

console.log(myCart);  // prints: [ 'tea' ]
console.log(newCart); // prints: [ 'tea', 'cake' ]
```

### Immutability: change a copy, not the original

**Immutable** means "can't be changed". Strings already work this way ([chapter 06](../06-strings/notes.md)): every string method gives you a new string. FP treats arrays and objects the same way. Instead of changing the data, you make a new copy with the change in it.

Think of editing a photo on your phone. A good app keeps the original safe and saves your edit as a new picture. If you don't like the edit, the original is still there.

For objects, spread the old one and override what changed ([chapter 15](../15-destructuring-spread-rest/notes.md)):

```js
const user = { name: "Mia", city: "Kathmandu", plan: "free" };
const movedUser = { ...user, city: "Pokhara" };

console.log(user);      // prints: { name: 'Mia', city: 'Kathmandu', plan: 'free' }
console.log(movedUser); // prints: { name: 'Mia', city: 'Pokhara', plan: 'free' }
```

For arrays, there's a non-mutating way to do every common job. You met most of these in [chapter 13](../13-array-methods/notes.md) and [chapter 16](../16-values-vs-references/notes.md):

| Job | Changes the original | Makes a new array instead |
|---|---|---|
| Add an item | `list.push(item)` | `[...list, item]` |
| Remove an item | `list.splice(index, 1)` | `list.filter(...)` |
| Change every item | a loop that assigns | `list.map(...)` |
| Sort | `list.sort()` | `list.toSorted()` |
| Reverse | `list.reverse()` | `list.toReversed()` |
| Replace one item | `list[index] = value` | `list.with(index, value)` |

```js
const tasks = ["buy milk", "walk dog", "pay rent"];

console.log(tasks.with(1, "walk cat")); // prints: [ 'buy milk', 'walk cat', 'pay rent' ]
console.log(tasks.toSorted());          // prints: [ 'buy milk', 'pay rent', 'walk dog' ]
console.log(tasks);                     // prints: [ 'buy milk', 'walk dog', 'pay rent' ]
```

The original list never changes, however many versions you make from it.

### `Object.freeze`: a lock for your objects

Making copies is a habit. `Object.freeze` is a lock: it stops an object from being changed at all.

```js
const settings = Object.freeze({ theme: "dark", fontSize: 16 });

settings.fontSize = 30; // quietly ignored

console.log(settings.fontSize); // prints: 16
```

In a normal `.js` file, the change is ignored without a word. In strict mode ([chapter 26](../26-this-keyword/notes.md)), which includes modules and classes, you get a proper error instead: `TypeError: Cannot assign to read only property 'fontSize' of object '#<Object>'`. The error is better, because silent failures are hard to spot.

> **Watch out:** `Object.freeze` is **shallow**. It locks the top level only. Anything nested inside can still be changed:

```js
const game = Object.freeze({ level: 3, inventory: ["sword"] });

game.level = 99;               // ignored
game.inventory.push("shield"); // works!

console.log(game); // prints: { level: 3, inventory: [ 'sword', 'shield' ] }
```

The object is frozen, but the `inventory` array inside it isn't. It's the same "only the top level" story as shallow copies in chapter 16.

### Functions as values: higher-order functions

In JavaScript, functions are **first-class**: they're values, just like numbers and strings ([chapter 09](../09-functions/notes.md)). You can store them in variables, pass them into other functions, and return them from functions.

A **higher-order function** is a function that takes a function as an argument, returns a function, or both. You've been using them for a while:

| Higher-order function | What it does with functions | Chapter |
|---|---|---|
| `map`, `filter`, `reduce` | Takes a callback and calls it for each item | [13](../13-array-methods/notes.md) |
| `setTimeout`, `addEventListener` | Takes a callback and calls it later | [30](../30-timers-and-callbacks/notes.md), [21](../21-events/notes.md) |
| `createCounter()` | Returns a new function | [25](../25-closures/notes.md) |
| `once(fn)`, `debounce(fn, delay)` | Takes a function *and* returns a new one | [25](../25-closures/notes.md), [34](../34-debounce-and-throttle/notes.md) |

Higher-order functions are the power tools of FP. Everything in the rest of this chapter, from `pipe` to `memoize`, is one.

### Declarative vs. imperative

There are two ways to tell someone how to get to your house. You can give turn-by-turn directions: "Go straight for 200 meters, turn left at the bakery, take the second right..." Or you can give them the address, and let their map app work out the route.

Code is the same. **Imperative** code spells out *how*, step by step. **Declarative** code describes *what* you want. Here are both, adding up the paid orders in a shop:

```js
const orders = [
  { id: 1, total: 25, status: "paid" },
  { id: 2, total: 80, status: "refunded" },
  { id: 3, total: 40, status: "paid" },
];
```

**Imperative** (turn-by-turn directions):

```js
let paidTotal = 0;

for (const order of orders) {
  if (order.status === "paid") {
    paidTotal += order.total;
  }
}

console.log(paidTotal); // prints: 65
```

**Declarative** (the address):

```js
const paidTotal = orders
  .filter((order) => order.status === "paid")
  .reduce((sum, order) => sum + order.total, 0);

console.log(paidTotal); // prints: 65
```

The declarative version reads almost like the task itself: "keep the paid orders, then add up their totals". Nothing is reassigned along the way, and each step is a small function you could reuse.

Neither one is "wrong". A `for` loop is still the right tool when you need to stop early, or when a chain of methods would be harder to read.

### Composition: building an assembly line with `pipe`

**Composition** means building a bigger function out of smaller ones, where each one's output becomes the next one's input. It's the assembly line from the start of this chapter.

A blog needs a **slug** for every post: the tidy, lowercase part of a web address, like `example.com/blog/summer-sale-50-off`. Here's a helper called `pipe` that lines up any number of steps:

```js
function pipe(...steps) {
  return (value) => steps.reduce((result, step) => step(result), value);
}
```

And here's the slug maker, built from four small steps:

```js
function removeSymbols(text) {
  return text.replace(/[^a-z0-9 ]/g, ""); // keep letters, digits and spaces
}

const makeSlug = pipe(
  (text) => text.trim(),
  (text) => text.toLowerCase(),
  removeSymbols,
  (text) => text.replaceAll(" ", "-"),
);

console.log(makeSlug("  Summer Sale: 50% Off! ")); // prints: summer-sale-50-off
```

Here's the title moving down the line, one station at a time:

| Station | Value after it |
|---|---|
| (start) | `"  Summer Sale: 50% Off! "` |
| trim | `"Summer Sale: 50% Off!"` |
| lowercase | `"summer sale: 50% off!"` |
| `removeSymbols` | `"summer sale 50 off"` |
| spaces to dashes | `"summer-sale-50-off"` |

How does `pipe` do it? It's `reduce` from chapter 13. The starting value goes into the first step. Whatever comes out becomes `result`, which goes into the next step, and so on. The last result is the answer.

**Why not just chain string methods?** Chaining only works with methods the value already has. `removeSymbols` is your own function (with a regular expression from [chapter 37](../37-regular-expressions/notes.md)), so you can't chain it, but it slots into a pipe like any other step. And `makeSlug` is now a single, named, reusable function. You can call it anywhere, or pass it to `map` to make slugs for a whole list of titles.

You'll also meet **`compose`**. It does the same job, but runs the steps from right to left, the way math writes `f(g(x))`. So `compose(c, b, a)` gives the same function as `pipe(a, b, c)`:

```js
function compose(...steps) {
  return (value) => steps.reduceRight((result, step) => step(result), value);
}
```

`reduceRight` is `reduce` starting from the end. This course uses `pipe`, because it reads in the order things actually happen.

### Partial application: pre-set some arguments

Lots of coffee machines have a "favorites" button. You set up your usual order once (large, oat milk, extra shot), and after that, one press does the rest.

**Partial application** is the same idea for functions: you fill in some of the arguments now, and get back a function that only needs the rest. Here's a price formatter for a shop that sells in several currencies:

```js
function formatPrice(currency, amount) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

console.log(formatPrice("USD", 1234.5)); // prints: $1,234.50
console.log(formatPrice("GBP", 1234.5)); // prints: £1,234.50
```

The US website always passes `"USD"`. So pre-set it, once:

```js
function formatDollars(amount) {
  return formatPrice("USD", amount);
}

console.log(formatDollars(19.99)); // prints: $19.99
```

That's partial application by hand: a small function that fills in the first argument and passes the rest along. `bind` from [chapter 26](../26-this-keyword/notes.md) can do it in one line. Its first argument sets `this`, which we don't need here, so we pass `null`. The arguments after that get pre-filled:

```js
const formatEuros = formatPrice.bind(null, "EUR");

console.log(formatEuros(1234.5)); // prints: €1,234.50
```

### Currying: one argument at a time

**Currying** means writing a function so it takes its arguments one at a time. Each call takes one argument and returns a new function that waits for the next one:

```js
function applyDiscount(percent) {
  return (price) => price - (price * percent) / 100;
}

const blackFriday = applyDiscount(30);   // pre-set: 30% off
const staffDiscount = applyDiscount(15); // pre-set: 15% off

console.log(blackFriday(200));      // prints: 140
console.log(staffDiscount(200));    // prints: 170
console.log(applyDiscount(10)(50)); // prints: 45 (pre-set and use in one go)
```

`applyDiscount(30)` doesn't work anything out yet. It returns a function that remembers `percent` in its backpack (a closure, [chapter 25](../25-closures/notes.md)) and waits for a price.

In FP code, you'll often see curried functions written as a chain of arrows. It means exactly the same thing:

```js
const applyDiscount = (percent) => (price) => price - (price * percent) / 100;
```

(Pick one style per function. You can't have both in one file, because they share a name.)

**Why bother?** Because a pre-set function is exactly the shape that `map` and `filter` want: one argument in, one result out.

```js
const prices = [100, 50, 20];
console.log(prices.map(blackFriday)); // prints: [ 70, 35, 14 ]

function isCheaperThan(limit) {
  return (product) => product.price < limit;
}

const products = [
  { name: "Mug", price: 12 },
  { name: "Lamp", price: 45 },
  { name: "Notebook", price: 8 },
];

console.log(products.filter(isCheaperThan(20)));
// prints: [ { name: 'Mug', price: 12 }, { name: 'Notebook', price: 8 } ]
```

`products.filter(isCheaperThan(20))` reads almost like English. And `isCheaperThan(50)` or `isCheaperThan(100)` are one small change away.

**Currying or partial application?** They're close cousins. *Currying* is a way of writing a function (one argument at a time). *Partial application* is pre-filling some arguments, however you do it: with a curried function, a small wrapper, or `bind`. Libraries like Ramda and lodash even have a `curry` helper that turns a normal function into a curried one. You don't need them to use the idea.

### Memoization: remembering results

Your teacher asks you what 37 × 43 is. You work it out on paper (1591) and write the answer on a sticky note. The next time someone asks, you don't work it out again. You just read the note.

**Memoization** gives a function those sticky notes. The first time it's asked a question, it does the real work and saves the answer in a **cache** (a store of saved answers). When it's asked the same question again, it answers straight from the cache.

Here's a `memoize` helper. It takes any one-argument function and returns a new version with a cache:

```js
function memoize(fn) {
  const cache = new Map();

  return (input) => {
    if (cache.has(input)) {
      return cache.get(input); // asked before: read the sticky note
    }
    const result = fn(input);
    cache.set(input, result); // new question: write a sticky note
    return result;
  };
}
```

The cache is a `Map` ([chapter 35](../35-map-and-set/notes.md)), and it lives in the returned function's backpack, so it survives between calls. Let's try it on a delivery app that works out how many days a parcel needs:

```js
function getDeliveryDays(distanceKm) {
  console.log(`Working out delivery for ${distanceKm} km...`);
  return Math.ceil(distanceKm / 300) + 1;
}

const getDeliveryDaysFast = memoize(getDeliveryDays);

console.log(getDeliveryDaysFast(1200));
console.log(getDeliveryDaysFast(1200));
console.log(getDeliveryDaysFast(450));
```

You'll see:

```
Working out delivery for 1200 km...
5
5
Working out delivery for 450 km...
3
```

The second question about 1200 km was answered from the cache, so the real function didn't run at all. (The `console.log` inside is only there so you can see when the real work happens. Strictly speaking, it's a side effect, and notice that the cached call skipped it!)

Here, the real work is tiny. Memoization pays off when a function is slow and keeps getting the same questions, like the recursive example in [chapter 48](../48-performance/notes.md), where it turns seconds into less than a millisecond.

Memoization comes with two rules:

1. **Only memoize pure functions.** If the answer can change (because the function reads the clock, a random number, or a price list that gets updated), the cache will happily hand out old answers. Common mistake 3 below shows it happening.
2. **Don't let the cache grow forever.** Every new question adds a sticky note. In an app that runs for days, that's a memory leak ([chapter 41](../41-memory-and-garbage-collection/notes.md)). Limit its size, or clear it now and then.

This `memoize` only works for functions with one argument, because the cache looks only at `input`. For several arguments, you need a key made from all of them, like `` `${weightKg}-${zone}` ``. You'll build that version in the exercises.

### FP in everyday JavaScript: it's not all-or-nothing

You don't have to write "100% functional" code to get the benefits. Most professional JavaScript mixes styles. These are the habits worth keeping:

- **Write calculations as pure functions.** Pass in everything they need, and return a result.
- **Push side effects to the edges.** Fetch, print, save, and change the page in a few clear places.
- **Don't change what you were handed.** Return new arrays and objects instead (spread, `map`, `filter`, `toSorted`, `with`).
- **Build big things from small, well-named functions.** Line them up with a `filter`/`map` chain or a `pipe`.
- **Use a loop when it's clearer.** FP is a toolbox, not a set of strict rules.

One warning: don't go overboard. Five layers of curried arrows, a 15-step pipe, or a clever one-liner can be much harder to read than a plain loop. If a teammate (or you, six months from now) can't follow it, simplify it. That's KISS again, and [chapter 45](../45-clean-code/notes.md) has lots more on writing code people enjoy reading.

## Common mistakes

**1. Changing the originals inside `map`**

```js
const products = [
  { name: "Lamp", price: 40 },
  { name: "Rug", price: 90 },
];

const halfPrice = products.map((product) => {
  product.price = product.price / 2; // changes the original object!
  return product;
});

console.log(halfPrice[0].price); // prints: 20
console.log(products[0].price);  // prints: 20 (the original changed too!)
```

`map` makes a new array, but the objects inside it are the same objects as before. Changing `product.price` changes them for everyone. Fix: return a new object instead: `products.map((product) => ({ ...product, price: product.price / 2 }))`. (The extra parentheses around `{ ... }` tell JavaScript you're returning an object, not starting a function body.)

**2. Giving a curried function all its arguments at once**

```js
function applyDiscount(percent) {
  return (price) => price - (price * percent) / 100;
}

console.log(applyDiscount(30, 200)); // prints: [Function (anonymous)]
```

`applyDiscount` only takes one argument. The `200` is ignored, and you get back the waiting function instead of a price. Fix: one pair of parentheses per argument: `applyDiscount(30)(200)` gives `140`.

**3. Memoizing a function that isn't pure**

```js
let pricePerKg = 2;

function getShippingCost(weightKg) {
  return weightKg * pricePerKg; // reads a variable that can change
}

const getShippingCostFast = memoize(getShippingCost); // memoize from earlier in this chapter

console.log(getShippingCostFast(10)); // prints: 20
pricePerKg = 3; // the courier raises its prices
console.log(getShippingCostFast(10)); // prints: 20 (should be 30!)
```

The cache only looks at the weight. It has no idea that the price per kilo changed, so it keeps handing out the old answer. Fix: make the function pure by passing everything it depends on as arguments, `getShippingCost(weightKg, pricePerKg)`, and build the cache key from both.

**4. A pipeline step that forgets to return**

```js
// pipe from earlier in this chapter
const makeTag = pipe(
  (text) => text.trim(),
  (text) => { text.toLowerCase(); }, // oops: curly braces, no return
  (text) => `#${text.replaceAll(" ", "")}`,
);

console.log(makeTag(" Summer Vibes "));
// TypeError: Cannot read properties of undefined (reading 'replaceAll')
```

The second step returns `undefined`, so the third step receives `undefined` and crashes. Notice that the error shows up one step *after* the real bug. When a pipe breaks, check the step before the one that crashed. Fix: drop the curly braces, `(text) => text.toLowerCase()`, and you get `#summervibes`.

## Quick recap

- **Functional programming** builds programs from small, predictable functions that take input and return new output.
- A **pure function** gives the same output for the same input and has no side effects. Keep side effects (printing, saving, fetching, changing the page) at the edges of your program.
- **Immutability:** don't change data, make changed copies (spread, `map`, `filter`, `toSorted`, `toReversed`, `with`). `Object.freeze` locks an object, but only the top level.
- **Higher-order functions** take or return functions. `pipe` composes small functions into an assembly line.
- **Partial application** pre-fills some arguments. **Currying** takes arguments one at a time, which fits `map` and `filter` nicely.
- **Memoization** caches answers. Only memoize pure functions, and keep the cache from growing forever.
- FP isn't all-or-nothing. Use the habits that make your code clearer, and keep loops where they read better.

---

**Next:** try the [exercises](exercises.md), then move on to [44 Design Patterns](../44-design-patterns/notes.md).
