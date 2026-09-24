# 25 Closures

## What is it?

A **closure** is a function that remembers the variables from the place where it was created, even after that place has finished running.

You've actually been using closures for a while. This chapter shows you what's going on, and how to use it on purpose.

## Why does it matter?

Closures solve some very everyday problems:

- **Remembering things between calls.** A ticket machine needs to know the last number it gave out. Without closures, you'd need a global variable that any code could mess up.
- **Keeping data private.** A bank account's balance shouldn't be changeable by any line of code that feels like it. A closure can lock it away so only a few trusted functions can touch it.
- **Making custom functions.** Instead of writing `double`, `triple`, and `quadruple` by hand, you write one function that *makes* them.
- **Running something only once.** A "Pay" button must charge the card once, even if a nervous customer clicks it three times.

Closures are also the secret ingredient in many tools you'll build later, like debounce and throttle in [chapter 34](../34-debounce-and-throttle/notes.md).

## Real-world example

Think of a function as a hiker, and the place where it's created as its home.

When a function is created inside another function, it packs a **backpack** with the variables from its home. Wherever it goes later, it can open the backpack and use them. The home can be locked up and gone, but the backpack stays with the hiker.

| Closure idea | The backpack version |
|---|---|
| A function created inside another function | A hiker leaving home |
| The outer function's variables | The things packed in the backpack |
| Calling the function later, somewhere else | Opening the backpack on the trail |
| Nobody else can reach those variables | Only the hiker can open the backpack |
| Calling the outer function again | A new hiker with a new, separate backpack |

Keep this picture in mind. Every example in this chapter is a function using its backpack.

## How it works

### Recap: functions can see outward

Remember scope from [chapter 14](../14-scope-and-hoisting/notes.md)? A function can see the variables around it (looking out through the window), but outside code can't see inside the function.

```js
const shopName = "Corner Books";

function printWelcome() {
  const visitor = "Maya";
  console.log(`Welcome to ${shopName}, ${visitor}!`);
}

printWelcome(); // prints: Welcome to Corner Books, Maya!
console.log(visitor); // ReferenceError: visitor is not defined
```

This is called **lexical scope**. "Lexical" just means "based on where the code is written". What a function can see depends on where you *wrote* it, not on where you call it from.

Closures are this same rule, taken one step further.

### A function that outlives its parent

Here's the surprising part. A function can create another function and **return** it, as a value. (Remember from [chapter 09](../09-functions/notes.md) that functions are values, just like numbers and strings.)

```js
function makeGreeter() {
  const greeting = "Good morning";

  function greet(name) {
    return `${greeting}, ${name}!`;
  }

  return greet; // hand back the function itself (no brackets, so it doesn't run yet)
}

const greetGuest = makeGreeter(); // makeGreeter runs and finishes here
console.log(greetGuest("Aisha")); // prints: Good morning, Aisha!
```

Read that slowly. By the time we call `greetGuest("Aisha")`, `makeGreeter` has already finished. Normally, a function's local variables are thrown away when it finishes.

But `greet` still needs `greeting`. So JavaScript keeps `greeting` alive, packed in `greet`'s backpack. That's a closure: the function `greet` plus the variables it remembers.

### A counter that remembers

This is the classic closure example. Each call gives the next number, like a ticket machine at a bakery:

```js
function createCounter() {
  let count = 0;

  return function () {
    count += 1;
    return count;
  };
}

const nextTicket = createCounter();
console.log(nextTicket()); // prints: 1
console.log(nextTicket()); // prints: 2
console.log(nextTicket()); // prints: 3
```

`createCounter` ran only once. Its `count` lives on in the backpack of the function it returned, so every call to `nextTicket()` updates the same `count`.

### Every call makes a new backpack

Call `createCounter` twice and you get two separate counters, each with its own `count`:

```js
const bakeryQueue = createCounter();
const pharmacyQueue = createCounter();

console.log(bakeryQueue()); // prints: 1
console.log(bakeryQueue()); // prints: 2
console.log(pharmacyQueue()); // prints: 1
console.log(bakeryQueue()); // prints: 3
```

The pharmacy queue doesn't care how many bakery tickets were handed out. Two hikers, two backpacks.

### Why not use a global variable?

You could write a counter with a global variable instead:

```js
let count = 0;

function nextTicket() {
  count += 1;
  return count;
}

console.log(nextTicket()); // prints: 1
count = 500; // any code, anywhere, can change it (even by accident)
console.log(nextTicket()); // prints: 501
```

It works, but it has two problems:

- **Anyone can change `count`.** In a big program, some other line of code might reset it or change it by mistake.
- **You can only have one.** A second queue would need a second global variable and a second function.

The closure version fixes both. `count` is hidden inside the backpack, and you can make as many counters as you like.

### Several functions can share one backpack

If an outer function creates *two* functions, they share the same variables. When one changes a variable, the other sees the change:

```js
function createScoreboard() {
  let score = 0;

  function addPoints(points) {
    score += points;
  }

  function getScore() {
    return score;
  }

  return { addPoints, getScore }; // shorthand properties from chapter 11
}

const game = createScoreboard();
game.addPoints(10);
game.addPoints(5);
console.log(game.getScore()); // prints: 15
```

This shows something important: a closure remembers the **variable itself**, not a snapshot of its value. `getScore` doesn't hold a copy of `score` from when it was created (that would be `0`). It looks at the live variable each time you call it.

### Private data: a bank account

In [chapter 18](../18-error-handling/notes.md) you wrote `withdraw(balance, amount)`, where the balance was passed in from outside. Now let's lock the balance away so that nothing outside can change it directly:

```js
function createAccount(startingBalance) {
  let balance = startingBalance; // private: only the three methods below can see it

  return {
    deposit(amount) {
      balance += amount;
    },
    withdraw(amount) {
      if (amount > balance) {
        throw new Error("Not enough money in the account");
      }
      balance -= amount;
    },
    getBalance() {
      return balance;
    },
  };
}
```

`deposit(amount) { ... }` is the short way to write a method. It means the same as `deposit: function (amount) { ... }`.

Now try to use it, and try to cheat:

```js
const account = createAccount(100);
account.deposit(50);
account.withdraw(30);
console.log(account.getBalance()); // prints: 120

console.log(account.balance); // prints: undefined
account.balance = 1000000; // only adds a new, unrelated property
console.log(account.getBalance()); // prints: 120
```

`balance` isn't a property of the object. It's a variable in the backpack that the three methods share. The only way to change it is through `deposit` and `withdraw`, and `withdraw` checks the rules first:

```js
account.withdraw(500); // Error: Not enough money in the account
```

Data that only some trusted code can reach is called **private**. It's like a bank: you can't walk into the vault and grab cash. You have to go to the counter, and the teller follows the rules.

> **Tip:** Classes have their own way to make private data, with `#balance`. You'll see it in [chapter 27](../27-classes/notes.md).

### Function factories: functions that make functions

A **function factory** is a function that builds and returns a new function, set up the way you asked. Parameters are variables too, so they go in the backpack:

```js
function makeMultiplier(factor) {
  return (number) => number * factor;
}

const double = makeMultiplier(2);
const triple = makeMultiplier(3);

console.log(double(5)); // prints: 10
console.log(triple(5)); // prints: 15
```

`double` remembers `factor` as `2`. `triple` remembers `factor` as `3`. One factory, many custom functions.

Here's a more realistic one. A shop has different discounts for students and staff:

```js
function makeDiscount(percent) {
  return (price) => price - (price * percent) / 100;
}

const studentPrice = makeDiscount(10);
const staffPrice = makeDiscount(25);

console.log(studentPrice(80)); // prints: 72
console.log(staffPrice(80)); // prints: 60
```

Because `studentPrice` is a normal function, you can hand it straight to the array methods from [chapter 13](../13-array-methods/notes.md):

```js
const prices = [20, 50, 80];
console.log(prices.map(studentPrice)); // prints: [ 18, 45, 72 ]
```

Factories work for text, too. Here's a greeting maker:

```js
function makeGreeting(greeting) {
  return (name) => `${greeting}, ${name}!`;
}

const sayHello = makeGreeting("Hello");
const sayNamaste = makeGreeting("Namaste");

console.log(sayHello("Tom")); // prints: Hello, Tom!
console.log(sayNamaste("Sita")); // prints: Namaste, Sita!
```

### A `once` helper: the "Pay" button

Online shops have a real problem: a customer clicks "Pay", nothing seems to happen for a second, so they click again. And again. You don't want to charge their card three times.

Let's write a helper that takes any function and returns a new version of it that only runs the first time:

```js
function once(fn) {
  let hasRun = false;
  let result;

  return function (...args) {
    if (!hasRun) {
      hasRun = true;
      result = fn(...args);
    }
    return result;
  };
}
```

The backpack holds three things: `fn` (the real function), `hasRun` (have we run yet?), and `result` (what it returned the first time). `...args` collects whatever arguments you pass, and `fn(...args)` passes them on, using rest and spread from [chapter 15](../15-destructuring-spread-rest/notes.md).

Now wrap a function with it:

```js
function chargeCard(amount) {
  console.log(`Charging $${amount}...`);
  return "Payment complete";
}

const payOnce = once(chargeCard);

console.log(payOnce(25));
console.log(payOnce(25)); // a nervous double-click
console.log(payOnce(25));
```

You'll see:

```
Charging $25...
Payment complete
Payment complete
Payment complete
```

The card was charged once. The later calls just hand back the first result.

On a web page, you'd use it with a click listener from [chapter 21](../21-events/notes.md):

```js
const payButton = document.querySelector("#pay-button");
payButton.addEventListener("click", once(() => chargeCard(25)));
```

However many times the button is clicked, `chargeCard` runs only once.

### The classic `var` loop gotcha

This one has confused developers for years. A cinema app builds one "book this seat" function per seat, in a loop, and stores them in an array to use later:

```js
const seatBookers = [];

for (var seat = 1; seat <= 3; seat++) {
  seatBookers.push(() => console.log(`Booking seat ${seat}`));
}

seatBookers[0](); // prints: Booking seat 4
seatBookers[1](); // prints: Booking seat 4
seatBookers[2](); // prints: Booking seat 4
```

Seat 4? There is no seat 4! Here's what happened:

1. `var` is function-scoped, not block-scoped ([chapter 14](../14-scope-and-hoisting/notes.md)). So there's only **one** `seat` variable for the whole loop.
2. All three arrow functions remember that same single variable. (Remember: closures remember the variable, not a snapshot of its value.)
3. The functions don't run inside the loop. They run later, after the loop has finished.
4. The loop stops when `seat <= 3` becomes false, which is when `seat` is `4`. So all three functions look in the backpack and find `4`.

The fix is one word. Change `var` to `let`:

```js
const seatBookers = [];

for (let seat = 1; seat <= 3; seat++) {
  seatBookers.push(() => console.log(`Booking seat ${seat}`));
}

seatBookers[0](); // prints: Booking seat 1
seatBookers[1](); // prints: Booking seat 2
seatBookers[2](); // prints: Booking seat 3
```

`let` is block-scoped, and a `for` loop with `let` creates a **fresh `seat` variable for each round** of the loop. Each function packs its own `seat` in its backpack.

| Loop | How many `seat` variables? | What the functions see later |
|---|---|---|
| `for (var seat = ...)` | One, shared by every round | The last value (`4`) |
| `for (let seat = ...)` | A new one for each round | Their own round's value (`1`, `2`, `3`) |

This is one more reason to never use `var`. You'll meet this same gotcha again with timers in [chapter 30](../30-timers-and-callbacks/notes.md), where it's even more common.

### Closures keep variables alive

As long as a function exists, its backpack exists too. The `count` inside `nextTicket` stays in memory for as long as `nextTicket` is around.

That's usually tiny and completely fine. But if a closure holds on to something big (like a huge array of data) and the function lives for the whole program, that memory can never be freed. You'll learn how to spot and fix these "memory leaks" in [chapter 41](../41-memory-and-garbage-collection/notes.md).

### Where you'll see closures again

Strictly speaking, every function in JavaScript is a closure, because every function can use the variables around it. The word matters most when a function is used *later* or *somewhere else*, after its outer function has finished.

You'll lean on closures a lot from here on:

- **Event listeners** ([chapter 21](../21-events/notes.md)) that use variables from outside are closures.
- **Timers** ([chapter 30](../30-timers-and-callbacks/notes.md)) run a function later, and it still remembers its variables.
- **Debounce and throttle** ([chapter 34](../34-debounce-and-throttle/notes.md)) use a closure to remember the timer and the last call.
- **Memoization** ([chapter 43](../43-functional-programming/notes.md) and [chapter 48](../48-performance/notes.md)) uses a closure to remember past results, so slow work isn't repeated.

## Common mistakes

**1. Returning the result instead of the function**

```js
function makeGreeter() {
  const greeting = "Good morning";

  function greet(name) {
    return `${greeting}, ${name}!`;
  }

  return greet(); // runs greet right now and returns its text
}

const greetGuest = makeGreeter();
greetGuest("Aisha"); // TypeError: greetGuest is not a function
```

The brackets in `return greet()` call the function straight away, so `greetGuest` ends up holding the string `"Good morning, undefined!"`, not a function. Fix: `return greet;` with no brackets. You want to hand over the function, not run it.

**2. Making a new counter every time**

```js
function countVisitor() {
  const counter = createCounter(); // a brand-new counter on every call!
  console.log(`Visitor number ${counter()}`);
}

countVisitor(); // prints: Visitor number 1
countVisitor(); // prints: Visitor number 1
countVisitor(); // prints: Visitor number 1
```

Every call to `createCounter()` makes a fresh backpack starting at `0`. Fix: create the counter **once**, outside, and reuse it: `const visitorCounter = createCounter();` above the function, then call `visitorCounter()` inside.

**3. Expecting a snapshot of the value**

```js
let ticketPrice = 10;
const showPrice = () => console.log(`Ticket: $${ticketPrice}`);

ticketPrice = 12; // the price changes after showPrice was created
showPrice(); // prints: Ticket: $12
```

A closure remembers the variable, not the value it had when the function was made. Usually that's exactly what you want (the current price). If you really need to lock in the old value, pass it to a factory as a parameter. The parameter is its own variable, so it keeps the value it was given:

```js
function makePriceTag(price) {
  return () => console.log(`Ticket: $${price}`);
}

let ticketPrice = 10;
const showOldPrice = makePriceTag(ticketPrice); // price is its own variable: 10
ticketPrice = 12;
showOldPrice(); // prints: Ticket: $10
```

**4. Handing out your private array**

```js
function createGuestList() {
  const guests = [];

  return {
    add(name) {
      guests.push(name);
    },
    getGuests() {
      return guests; // hands out the real array!
    },
  };
}

const party = createGuestList();
party.add("Ana");
party.getGuests().push("Gatecrasher"); // changes the private array
console.log(party.getGuests()); // prints: [ 'Ana', 'Gatecrasher' ]
```

Arrays are shared by reference ([chapter 16](../16-values-vs-references/notes.md)), so returning `guests` hands out the key to the vault. Fix: return a copy with `return [...guests];`. Then outside code can change its copy all it likes, and the real list stays safe.

**5. Using `var` in a loop that creates functions**

If you create functions inside a `for (var ...)` loop, they all share one loop variable and see its last value, like the seat 4 example above. Fix: use `let`.

## Quick recap

- A **closure** is a function plus the variables it remembers from where it was created: its backpack.
- Those variables stay alive even after the outer function has finished.
- Each call to the outer function makes a new, separate backpack.
- Use closures for private data (a bank balance), function factories (`makeMultiplier`), and helpers like `once`.
- Closures remember the variable itself, not a snapshot. That's why a `var` loop shares one variable. Use `let`.

---

**Next:** try the [exercises](exercises.md), then move on to [26 The `this` Keyword](../26-this-keyword/notes.md).
