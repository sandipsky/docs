# 26 The `this` Keyword

## What is it?

`this` is a special word you can use inside a function. It points to an object, usually "the object this function was called on".

The key idea: what `this` points to is decided **each time the function is called**, not when the function is written.

## Why does it matter?

You met `this` in [chapter 11](../11-objects/notes.md), where a method used `this` to reach its own object's data. That's its main job, and it lets one function work for many different objects.

But `this` is also one of the most common sources of confusing bugs in JavaScript:

- You pass a method to another function (as a callback), and suddenly it can't find its data.
- You click a button, and `this` points to something you didn't expect.
- A value comes out as `undefined`, with no error at all.

Remember the mystery at the end of the [chapter 25 exercises](../25-closures/exercises.md)? The same function gave `50` one time and `undefined` the next. By the end of this chapter, you'll know exactly why, and how to fix it. You'll also need `this` for classes in [chapter 27](../27-classes/notes.md).

## Real-world example

Think about the word **"me"**.

When Ana says "Pass the salt to me", *me* means Ana. When Ben says the exact same sentence, *me* means Ben. The word never changes. Who it means depends on **who is saying it**.

Now imagine you find a note on the floor that says "Call me". Who is *me*? Nobody knows, because nobody is saying it.

| Situation | Who "me" means | In JavaScript |
|---|---|---|
| Ana says "Pass it to me" | Ana | `ana.greet()`: `this` is `ana` |
| Ben says "Pass it to me" | Ben | `ben.greet()`: `this` is `ben` |
| A note on the floor says "Call me" | Nobody knows | `greet()` on its own: `this` is lost |

`this` works like "me". It means "the object that is calling me right now".

## How it works

### In a method: the object before the dot

Here's a method using `this`, just like in chapter 11:

```js
const gym = {
  gymName: "Iron Temple",
  members: 120,
  describe() {
    return `${this.gymName} has ${this.members} members`;
  },
};

console.log(gym.describe()); // prints: Iron Temple has 120 members
```

When you call `gym.describe()`, `this` is `gym`, the object before the dot.

Why not just write `gym.gymName` inside the method? Because with `this`, the same function can be shared by many objects:

```js
function describe() {
  return `${this.gymName} has ${this.members} members`;
}

const ironTemple = { gymName: "Iron Temple", members: 120, describe };
const fitHub = { gymName: "FitHub", members: 85, describe };

console.log(ironTemple.describe()); // prints: Iron Temple has 120 members
console.log(fitHub.describe()); // prints: FitHub has 85 members
```

It's the same `describe` function both times. When `ironTemple` calls it, `this` is `ironTemple`. When `fitHub` calls it, `this` is `fitHub`. That's Ana and Ben saying "me".

> **Tip:** Here's the most useful rule in this chapter. To find `this`, look at the **call**, not the function. What's to the left of the dot? That's `this`.

### Losing `this`: a method on its own

Here's the mystery from chapter 25:

```js
const wallet = {
  balance: 50,
  getBalance() {
    return this.balance;
  },
};

console.log(wallet.getBalance()); // prints: 50

const checkBalance = wallet.getBalance; // copies the function, not the object
console.log(checkBalance()); // prints: undefined
```

`checkBalance` is the same function as `wallet.getBalance`. But look at the call: `checkBalance()`. There's nothing before the dot. There isn't even a dot!

The function has been **detached** from its object. It's the note on the floor that says "Call me". So `this` is no longer `wallet`, and `this.balance` doesn't find the balance.

So what *is* `this` in a plain call like `checkBalance()`? That depends on a setting called strict mode.

### Plain function calls

In the `.js` files you've been running so far, a plain function call gets `this` set to `globalThis`:

```js
function whoAmI() {
  return this === globalThis;
}

console.log(whoAmI()); // prints: true
```

**`globalThis`** is the global object: one big built-in object that holds global things like `console`. In the browser it's the same object as `window`.

So in the wallet example, `this.balance` really meant `globalThis.balance`. There's no global called `balance`, so you got `undefined`.

That can do real damage. Here, a detached method quietly changes the wrong object:

```js
const scoreboard = {
  points: 0,
  addPoint() {
    this.points += 1;
  },
};

const addPoint = scoreboard.addPoint;
addPoint(); // plain call: this is globalThis

console.log(scoreboard.points); // prints: 0
console.log(globalThis.points); // prints: NaN
```

The scoreboard didn't change at all. Instead, JavaScript made a brand-new global called `points` and set it to `NaN` (`undefined + 1`). No error, no warning. This is the same kind of silent accident as the accidental globals in [chapter 14](../14-scope-and-hoisting/notes.md).

### Strict mode: make mistakes loud

**Strict mode** is a stricter version of JavaScript that turns some silent mistakes into real errors. The normal, relaxed mode is often called **sloppy mode**.

To turn strict mode on, put this line at the very top of your file:

```js
"use strict";

const wallet = {
  balance: 50,
  getBalance() {
    return this.balance;
  },
};

const checkBalance = wallet.getBalance;
checkBalance(); // TypeError: Cannot read properties of undefined (reading 'balance')
```

In strict mode, a plain function call gets `this` set to `undefined`. So `this.balance` crashes with a clear error that points at the exact line, instead of quietly giving you `undefined`. That's a good thing: a loud bug is much easier to find than a silent one.

Strict mode also stops the accidental globals from chapter 14:

```js
"use strict";

total = 5; // ReferenceError: total is not defined
```

Here's the difference:

| | Sloppy mode | Strict mode |
|---|---|---|
| `this` in a plain call like `fn()` | `globalThis` | `undefined` |
| Assigning to a variable you never declared | Quietly creates a global | `ReferenceError` |

A few things to know about `"use strict"`:

- It must be the **first statement** in the file. Comments above it are fine, but if any code comes first, it's just an ordinary string and does nothing.
- You can also put it as the first line inside a single function, to make only that function strict.
- **Modules and classes are always strict, automatically.** You'll meet classes in [chapter 27](../27-classes/notes.md) and modules in [chapter 29](../29-modules/notes.md). Most modern code is written in one or both, so in real projects, a lost `this` is usually `undefined`.

The plain `.js` files in this course so far have all run in sloppy mode.

### Losing `this` inside a callback

The most common way to lose `this` is inside a callback, like the ones you pass to `forEach` in [chapter 13](../13-array-methods/notes.md):

```js
const playlist = {
  title: "Chill Vibes",
  songs: ["Sunrise", "Ocean Drive"],
  printSongs() {
    this.songs.forEach(function (song) {
      console.log(`${song} (from ${this.title})`);
    });
  },
};

playlist.printSongs();
```

You'll see:

```
Sunrise (from undefined)
Ocean Drive (from undefined)
```

`this.songs` on the first line of the method works fine, because `printSongs` was called as `playlist.printSongs()`. But the callback is a separate function, and `forEach` calls it as a plain call, with no object before the dot. So inside the callback, `this` is lost (and in strict mode, this code would crash).

### Arrow functions don't have their own `this`

Arrow functions solve exactly this problem. An arrow function doesn't get a `this` of its own. It uses the `this` from the place where it was **written**, the same way a closure uses a variable from outside ([chapter 25](../25-closures/notes.md)).

Change the callback to an arrow function:

```js
const playlist = {
  title: "Chill Vibes",
  songs: ["Sunrise", "Ocean Drive"],
  printSongs() {
    this.songs.forEach((song) => {
      console.log(`${song} (from ${this.title})`);
    });
  },
};

playlist.printSongs();
```

You'll see:

```
Sunrise (from Chill Vibes)
Ocean Drive (from Chill Vibes)
```

The arrow function was written inside `printSongs`, where `this` is `playlist`. So inside the arrow, `this` is `playlist` too. Arrow functions are perfect for callbacks inside methods.

But that same feature makes them **bad as methods**:

```js
const cinema = {
  cinemaName: "Galaxy Cinema",
  greet: () => `Welcome to ${this.cinemaName}!`,
};

console.log(cinema.greet()); // prints: Welcome to undefined!
```

The arrow function doesn't care that it's called as `cinema.greet()`. It ignores the dot and uses the `this` from outside the object, and that's not `cinema`. (At the top of a plain Node file, `this` is an empty object, so you get `undefined`. In a module, the same code would crash instead.)

The rule of thumb:

- **Methods:** use the normal method shorthand, `greet() { ... }`.
- **Callbacks inside methods:** use arrow functions, so they share the method's `this`.

### `call`, `apply` and `bind`: choosing `this` yourself

Sometimes you want to decide what `this` is, instead of letting the call decide. Every function has three built-in methods for that.

- **`call`** runs the function right now, with `this` set to the first thing you pass. Any other arguments follow, separated by commas.
- **`apply`** does the same, but takes the other arguments as an array.
- **`bind`** doesn't run anything. It returns a **new function** with `this` locked in, to call later.

```js
function introduce(greeting, punctuation) {
  return `${greeting}, I'm ${this.firstName}${punctuation}`;
}

const ana = { firstName: "Ana" };
const ben = { firstName: "Ben" };

console.log(introduce.call(ana, "Hi", "!")); // prints: Hi, I'm Ana!
console.log(introduce.apply(ben, ["Hello", "."])); // prints: Hello, I'm Ben.

const anaSays = introduce.bind(ana); // doesn't run yet: makes a new function
console.log(anaSays("Hey", "!!")); // prints: Hey, I'm Ana!!
```

A memory trick: **c**all takes **c**ommas, **a**pply takes an **a**rray.

**Borrowing a method.** `call` lets one object use another object's method, as long as it has the properties the method needs:

```js
const hotel = {
  hotelName: "Lakeside Inn",
  pricePerNight: 80,
  quote(nights) {
    return `${nights} nights at ${this.hotelName}: $${nights * this.pricePerNight}`;
  },
};

const hostel = { hotelName: "Backpackers Den", pricePerNight: 25 };

console.log(hotel.quote(3)); // prints: 3 nights at Lakeside Inn: $240
console.log(hotel.quote.call(hostel, 3)); // prints: 3 nights at Backpackers Den: $75
```

The hostel doesn't need its own copy of `quote`. It borrows the hotel's, with `this` set to `hostel`.

**Fixing a detached method.** `bind` is the classic fix for a lost `this`. You can also wrap the call in an arrow function, which keeps the dot:

```js
const checkBalance = wallet.getBalance.bind(wallet); // this is locked to wallet
console.log(checkBalance()); // prints: 50

const checkAgain = () => wallet.getBalance(); // or: wrap the call in an arrow
console.log(checkAgain()); // prints: 50
```

This matters most when you hand a method to someone else to call later:

```js
function runTwice(action) {
  action();
  action();
}

runTwice(scoreboard.addPoint); // loses this: scoreboard.points stays 0
runTwice(scoreboard.addPoint.bind(scoreboard)); // works
runTwice(() => scoreboard.addPoint()); // works too
```

| | Runs the function now? | Other arguments | Good for |
|---|---|---|---|
| `fn.call(obj, a, b)` | Yes | Listed one by one | Borrowing a method once |
| `fn.apply(obj, [a, b])` | Yes | In an array | The same, when the arguments are already in an array |
| `fn.bind(obj)` | No, it returns a new function | Given later, when you call it | Fixing `this` for later: callbacks and event listeners |

> **Tip:** Since spread arrived ([chapter 15](../15-destructuring-spread-rest/notes.md)), `fn.call(obj, ...args)` does the same job as `apply`, so you'll see `apply` less often in new code. You'll meet it again when you build debounce and throttle in [chapter 34](../34-debounce-and-throttle/notes.md), which must keep `this` working.

### `this` in DOM event listeners

When you use a normal `function` as an event listener ([chapter 21](../21-events/notes.md)), the browser calls it with `this` set to **the element the listener is attached to**:

```js
const seats = document.querySelectorAll(".seat");

for (const seat of seats) {
  seat.addEventListener("click", function () {
    this.classList.toggle("selected"); // this = the seat button that was clicked
  });
}
```

An arrow function doesn't get its own `this`, so it can't do that. It uses the `this` from outside, which in a normal script is `window`, not the button:

```js
seat.addEventListener("click", () => {
  this.classList.toggle("selected");
  // TypeError: Cannot read properties of undefined (reading 'toggle')
});
```

`window` has no `classList`, so `this.classList` is `undefined`, and the error appears in the DevTools console (as `Uncaught TypeError: ...`).

Many developers skip `this` in listeners and use **`event.currentTarget`** instead. It's always the element the listener is attached to, and it works with both kinds of functions:

```js
seat.addEventListener("click", (event) => {
  event.currentTarget.classList.toggle("selected");
});
```

`event.currentTarget` is a close cousin of `event.target` from chapter 21. `target` is the exact element you clicked (which could be something small inside the button), while `currentTarget` is always the element that owns the listener.

### The rules in one table

When you're not sure what `this` is, find the call and check this table:

| How the function is called | Example | What `this` is |
|---|---|---|
| As a method, with a dot | `wallet.getBalance()` | The object before the dot (`wallet`) |
| As a plain call, no dot | `checkBalance()` | Sloppy mode: `globalThis`. Strict mode: `undefined` |
| With `call` or `apply` | `introduce.call(ana)` | The object you pass (`ana`) |
| A function made by `bind` | `introduce.bind(ana)` | The object you bound (`ana`), every time |
| An arrow function | `(song) => this.title` | No `this` of its own: it uses the `this` from where it was written |
| A DOM listener (normal `function`) | `seat.addEventListener("click", function () {})` | The element the listener is on (`seat`) |
| With `new` | `new Book()` | The brand-new object being built ([chapter 27](../27-classes/notes.md)) |

## Common mistakes

**1. Using an arrow function as a method**

```js
const bakery = {
  bakeryName: "Sweet Crumbs",
  describe: () => `This is ${this.bakeryName}`,
};

console.log(bakery.describe()); // prints: This is undefined
```

Arrow functions don't get their own `this`, so the dot in `bakery.describe()` makes no difference. Fix: use the method shorthand, `describe() { return ...; }`.

**2. Passing a method as a callback**

```js
const basket = {
  items: [],
  addItem(item) {
    this.items.push(item);
  },
};

["apples", "bread"].forEach(basket.addItem);
// TypeError: Cannot read properties of undefined (reading 'push')
```

`forEach` receives the function on its own, detached from `basket`, and calls it as a plain call. Fix: keep the dot by wrapping it in an arrow, `forEach((item) => basket.addItem(item))`, or lock `this` with `basket.addItem.bind(basket)`.

**3. Forgetting `this.` inside a method**

```js
const library = {
  bookCount: 1200,
  describe() {
    return `We have ${bookCount} books`;
  },
};

console.log(library.describe()); // ReferenceError: bookCount is not defined
```

Inside a method, `bookCount` on its own means "a variable called `bookCount`", and there isn't one. The object's properties are only reachable through the object. Fix: `this.bookCount`.

**4. Calling `bind` and throwing away the result**

```js
const checkBalance = wallet.getBalance;
checkBalance.bind(wallet); // makes a new function... and throws it away
console.log(checkBalance()); // prints: undefined
```

`bind` never changes the original function. It returns a new one. Fix: keep what it returns, `const checkBalance = wallet.getBalance.bind(wallet);`.

**5. Putting `"use strict"` in the wrong place**

```js
const appName = "Recipe Box";
"use strict"; // too late: code came first, so this does nothing

servings = 4; // no error: an accidental global was created
console.log(servings); // prints: 4
```

`"use strict"` only works as the very first statement of a file or function. Fix: move it to the top line.

## Quick recap

- `this` is decided by **how a function is called**, not where it's written. Look at the call: the object before the dot is `this`.
- A method on its own (`const fn = obj.method; fn()`) loses its `this`. In sloppy mode it becomes `globalThis`. In strict mode, it's `undefined`.
- `"use strict"` makes these mistakes loud. Modules and classes are strict automatically.
- Arrow functions have no `this` of their own. They're great for callbacks inside methods, and bad as methods.
- `call` and `apply` run a function with the `this` you choose. `bind` returns a new function with `this` locked in.
- In a DOM listener, a normal `function` gets the element as `this`. With an arrow function, use `event.currentTarget` instead.

---

**Next:** try the [exercises](exercises.md), then move on to [27 Classes](../27-classes/notes.md).
