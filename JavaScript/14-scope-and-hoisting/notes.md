# 14 Scope and Hoisting

## What is it?

**Scope** is the part of your code where a variable can be seen and used. For example, a variable created inside a function only exists inside that function.

**Hoisting** is JavaScript setting up your functions and variables before it runs any of your code. It's the reason you can call some functions before the line where you wrote them.

## Why does it matter?

Scope is behind some of the most common errors and bugs you'll meet:

- `ReferenceError: total is not defined`, even though you can *see* `total` a few lines up.
- Two parts of a program accidentally sharing one variable and overwriting each other's values.
- A variable that is mysteriously `undefined`.

Good scope habits keep each variable where it belongs, so one part of your program can't accidentally break another. In [chapter 09](../09-functions/notes.md) you saw that variables inside a function stay inside. This chapter tells the whole story, including why `let` and `const` replaced `var` (as promised back in [chapter 02](../02-variables/notes.md)).

## Real-world example

Think of your code as a house with **one-way windows**. From inside a room, you can look out and see the hallway and the garden. But nobody outside can see into your room.

| In the house | In JavaScript |
|---|---|
| The garden, which everyone can see | The global scope: the top level of your file |
| A room | A function's scope |
| A cupboard inside a room | A block `{ }`, like the body of an `if` or a loop |
| One-way windows that only look outward | Inner code can see outer variables, but not the other way round |
| Looking for your keys: your room first, then the hallway, then the garden | The scope chain |

Keep this house in mind. Most of the rules about scope follow from it.

## How it works

### Global scope

A variable declared at the top level of your file, outside any function or block, is in the **global scope**. Everything in the file can see it.

```js
const shopName = "Corner Books";

function printHeader() {
  console.log(`Welcome to ${shopName}`); // can see shopName
}

printHeader(); // prints: Welcome to Corner Books
```

The function can use `shopName` because it looks outward, through the window, to the top level of the file.

In Node, each file has its own top level, so a variable at the top of one file isn't visible in another file. You'll connect files together in [chapter 29](../29-modules/notes.md).

### Function scope

A variable declared inside a function only exists inside that function. This is called **function scope**.

```js
function makeReceipt() {
  const tax = 2;
  console.log(`Tax: $${tax}`);
}

makeReceipt();    // prints: Tax: $2
console.log(tax); // ReferenceError: tax is not defined
```

Outside the function, `tax` doesn't exist. Parameters work the same way: they only exist inside their own function.

That's a good thing. It means two functions can each have their own `total` without getting in each other's way:

```js
function cartTotal() {
  const total = 40;
  return total;
}

function tipTotal() {
  const total = 6;
  return total;
}

console.log(cartTotal(), tipTotal()); // prints: 40 6
```

Each time you call a function, it gets a fresh set of its own variables. They go away when the function finishes (with one interesting exception that you'll meet in [chapter 25](../25-closures/notes.md)).

### Block scope

A **block** is any code between curly braces `{ }`, like the body of an `if`, a `for`, or a `while`. Variables declared with `let` or `const` inside a block only exist inside that block. This is called **block scope**.

```js
const age = 20;

if (age >= 18) {
  const message = "Welcome in!";
  console.log(message); // prints: Welcome in!
}

console.log(message); // ReferenceError: message is not defined
```

The same goes for the counter of a `for` loop:

```js
for (let lap = 1; lap <= 3; lap++) {
  console.log(`Lap ${lap}`);
}
console.log(lap); // ReferenceError: lap is not defined
```

If you need a value after the block ends, declare the variable *before* the block, then fill it in inside:

```js
const age = 15;
let message; // declared before the block

if (age >= 18) {
  message = "Welcome in!";
} else {
  message = "Sorry, adults only.";
}

console.log(message); // prints: Sorry, adults only.
```

### `var`: the old way, and why it leaks

Here's what `var` does differently: it ignores blocks. A `var` only stays inside a *function*. We say `var` is **function-scoped**, while `let` and `const` are **block-scoped**.

```js
if (true) {
  var discount = 10;
}
console.log(discount); // prints: 10  (it leaked out of the block!)
```

A `var` loop counter leaks out too:

```js
for (var lap = 1; lap <= 3; lap++) {
  console.log(`Lap ${lap}`);
}
console.log(lap);
```

You'll see:

```
Lap 1
Lap 2
Lap 3
4
```

The loop stopped when `lap` reached 4, and `lap` is still hanging around afterwards. With `let`, you got an error instead, which is what you want: the counter belongs to the loop.

A function does stop a `var`:

```js
function setUp() {
  var secretCode = "1234";
}

setUp();
console.log(secretCode); // ReferenceError: secretCode is not defined
```

`var` has one more bad habit: it lets you declare the same name twice, with no warning at all.

```js
var total = 10;
var total = 20; // no error: the first one is quietly replaced
console.log(total); // prints: 20
```

With `let` or `const`, JavaScript catches the mistake before your code even starts running:

```js
let score = 10;
let score = 20; // SyntaxError: Identifier 'score' has already been declared
```

| | `var` | `let` | `const` |
|---|---|---|---|
| Scope | Function | Block | Block |
| Can be reassigned | Yes | Yes | No |
| Can be declared twice | Yes, silently | No (SyntaxError) | No (SyntaxError) |

That's why the course uses `let` and `const`. You'll still see `var` in older code and tutorials, so it's good to recognize it.

### The scope chain

When your code uses a variable, JavaScript looks for it in the current scope first. If it's not there, it looks in the scope around that one, then the one around *that*, all the way out to the global scope. This path is called the **scope chain**. If the variable isn't found anywhere along it, you get a `ReferenceError`.

You can write a function inside another function. The inner one can only be used inside the outer one. Here, three scopes sit inside each other:

```js
const city = "Lisbon";               // global scope

function planTrip() {
  const hotel = "Sea View";          // planTrip's scope

  function planDay() {
    const museum = "Tile Museum";    // planDay's scope
    console.log(`${museum}, ${hotel}, ${city}`);
  }

  planDay();
}

planTrip(); // prints: Tile Museum, Sea View, Lisbon
```

Picture it as rooms inside rooms:

```
global scope:            city
└── planTrip's scope:    hotel
    └── planDay's scope: museum   ← starts looking here, then moves outward
```

`planDay` finds `museum` in its own scope, `hotel` one level out, and `city` in the global scope. The windows only look outward, though. If `planTrip` tried to use `museum`, it would get `ReferenceError: museum is not defined`.

### Scope depends on where code is written

Scope is decided by **where a function is written**, not where it's called from. This is called **lexical scope** ("lexical" means "based on the written code").

```js
const greeting = "Hello";

function sayHello() {
  console.log(greeting); // looks outward from where sayHello was written
}

function party() {
  const greeting = "Yo";
  sayHello(); // called from here, but that doesn't matter
}

party(); // prints: Hello
```

`sayHello` was written at the top level, so it looks outward from there and finds `"Hello"`. The `greeting` inside `party` is in a room that `sayHello` can't see into. Remember this one: it's the key to closures in [chapter 25](../25-closures/notes.md).

### Shadowing

What if an inner scope declares a variable with the same name as an outer one? Inside the inner scope, the inner one wins. It hides the outer one, which is called **shadowing**.

```js
const player = "Sam";

function startGame() {
  const player = "Guest"; // a new variable that shadows the outer one
  console.log(`Inside: ${player}`);
}

startGame();                       // prints: Inside: Guest
console.log(`Outside: ${player}`); // prints: Outside: Sam
```

There are two separate variables here that happen to share a name, and the outer `player` is untouched. (The `greeting` inside `party` above was shadowing too.)

Shadowing is allowed, but it's a good way to confuse yourself. When you can, pick different names.

### Hoisting: what JavaScript sets up first

Before running your code, JavaScript reads through each scope and makes a note of every declaration in it: every function declaration, and every variable made with `var`, `let`, or `const`. Setting these up ahead of time is called **hoisting**, as if the declarations were lifted up (hoisted, like a flag) to the top of their scope.

It's like a teacher reading the class list before a lesson: she knows every name before anyone walks in. But knowing a name doesn't mean that student is in their seat yet. The three kinds of declarations are "in their seats" at different times, and that's what makes hoisting confusing. So let's take them one at a time.

**1. Function declarations are ready from the start.** You can call them before the line where they're written:

```js
console.log(addShipping(20)); // prints: 25

function addShipping(price) {
  return price + 5;
}
```

The whole function is set up before the first line runs. That's handy: you can put your main code at the top of a file and the helper functions below it.

**2. `var` exists from the start, but holds `undefined`.** Its name is set up early, but its value only arrives when its line runs:

```js
console.log(flavor); // prints: undefined
var flavor = "vanilla";
console.log(flavor); // prints: vanilla
```

JavaScript treats that code as if you'd written:

```js
var flavor;          // the declaration is hoisted to the top
console.log(flavor); // undefined
flavor = "vanilla";  // the value is set where you wrote it
console.log(flavor); // vanilla
```

No error, just a quiet `undefined`. Silent bugs like that are one more reason to avoid `var`.

**3. `let` and `const` exist from the start, but are locked until their line.** JavaScript knows about them, but it won't let you touch them until the line that declares them has run. The stretch of code before that line is called the **temporal dead zone** (TDZ). "Temporal" means "to do with time": it's the time *before* the variable is ready.

```js
console.log(total); // ReferenceError: Cannot access 'total' before initialization
let total = 50;
```

Compare that message with the one for a variable that doesn't exist at all:

```js
console.log(price); // ReferenceError: price is not defined
```

"Cannot access ... before initialization" means JavaScript knows the variable exists, but you're using it too early. (**Initialization** is the moment a variable gets its first value.) "Is not defined" means there's no variable with that name anywhere along the scope chain.

The TDZ is a good thing. A loud error on the line with the bug beats a quiet `undefined` that causes trouble somewhere else later.

### Function declarations vs. function expressions

Remember function expressions and arrow functions from [chapter 09](../09-functions/notes.md)? They're stored in a variable, so they follow that variable's rules, not the rules for function declarations:

```js
console.log(double(4)); // ReferenceError: Cannot access 'double' before initialization

const double = (number) => number * 2;
```

With `var`, it fails in a different way. The variable exists, but it holds `undefined`, and you can't call `undefined`:

```js
console.log(triple(4)); // TypeError: triple is not a function

var triple = function (number) {
  return number * 3;
};
```

Here's the whole picture:

| How it's written | Can you use it before its line? |
|---|---|
| `function greet() { }` | Yes. The whole function is ready. |
| `var name = ...` | Sort of: the name exists, but it holds `undefined`. |
| `let name = ...` or `const name = ...` | No: `ReferenceError: Cannot access 'name' before initialization`. |
| `const greet = () => { }` | No, same as any other `const`. |

The rule that keeps you safe: **declare your variables before you use them.** Then hoisting never surprises you. Calling a function *declaration* that's written further down is fine, and very common.

### Accidental globals

What happens if you forget `let` or `const` altogether?

```js
function startTimer() {
  seconds = 60; // oops: no let or const
}

startTimer();
console.log(seconds); // prints: 60
```

No error! The variable escaped from the function. JavaScript searched the scope chain for `seconds`, didn't find it, and quietly created a brand-new **global variable**: one that every part of your program can see and change, even code in other files. It gets attached to `globalThis`, a built-in object that holds global things, so `globalThis.seconds` is now `60` too.

This relaxed behavior is the default for plain `.js` files, both in Node and in the browser. That default mode is nicknamed **sloppy mode**.

Why are accidental globals bad?

- Any code, anywhere, can change them, so bugs are hard to track down.
- A typo can quietly create a new variable instead of giving you an error:

```js
let count = 0;
conut = count + 1; // typo: creates a new global called conut
console.log(count); // prints: 0
```

JavaScript also has a stricter mode, called **strict mode**, which turns this mistake into a proper error. You switch it on by writing `"use strict";` at the very top of a file:

```js
"use strict";

function startTimer() {
  seconds = 60;
}

startTimer(); // ReferenceError: seconds is not defined
```

You'll learn more about strict mode in [chapter 26](../26-this-keyword/notes.md). Classes ([chapter 27](../27-classes/notes.md)) and modules ([chapter 29](../29-modules/notes.md)) are always strict, so there this mistake becomes an error automatically. Until then, one habit protects you: always declare variables with `let` or `const`.

### Keep variables in the smallest scope that works

Put each variable in the smallest "room" that needs it. If only one function uses a variable, declare it inside that function. If only one `if` block uses it, declare it inside that block.

It's like keeping your things in your own room rather than in the hallway, where anyone might move them. The fewer globals you have, the fewer ways one part of your program can accidentally mess with another part's data.

## Common mistakes

**1. Using a variable outside the block it was made in**

```js
const temperature = 30;
if (temperature > 25) {
  const advice = "Wear sunscreen";
}
console.log(advice); // ReferenceError: advice is not defined
```

`advice` only exists inside the `if` block. Fix: declare it before the block with `let advice;`, and assign it inside.

**2. Forgetting `let` or `const`**

```js
function addToCart() {
  itemCount = 1; // no let or const
}
addToCart();
console.log(itemCount); // prints: 1
```

It "works", and that's the problem: `itemCount` is now an accidental global that any code can change. Fix: always declare variables with `let` or `const`, in the scope where they belong.

**3. Shadowing a variable you meant to update**

```js
let score = 0;

function addPoints() {
  let score = 10; // oops: a new variable, not the outer one
}

addPoints();
console.log(score); // prints: 0
```

The `let` inside the function creates a separate `score` that shadows the outer one, so the outer one never changes. Fix: to update the outer variable, leave out the `let`: `score = score + 10;`. Even better, have the function `return` the new score, like in [chapter 09](../09-functions/notes.md).

**4. Using `let` or `const` before its line**

```js
console.log(`Hello, ${username}`);
const username = "maya_k";
// ReferenceError: Cannot access 'username' before initialization
```

`username` is in the temporal dead zone until its line runs. Fix: move the declaration above the line that uses it.

**5. Calling a function expression too early**

```js
greet();
const greet = () => console.log("Hi!");
// ReferenceError: Cannot access 'greet' before initialization
```

Arrow functions and function expressions follow their variable's rules. Fix: move the call below the definition, or write it as a function declaration, which is ready from the start.

**6. Expecting `var` to stay inside a block**

```js
for (var i = 0; i < 3; i++) {}
console.log(i); // prints: 3
```

`var` ignores blocks, so the counter leaks out of the loop. Fix: use `let` for loop counters (and everywhere else).

## Quick recap

- **Scope** is where a variable can be seen: the global scope (the top level), function scope, and block scope (inside `{ }`).
- Inner code can see outer variables, never the other way round. JavaScript searches outward along the **scope chain**, starting from where the code is *written* (lexical scope).
- `let` and `const` are block-scoped. `var` is function-scoped, leaks out of blocks, and can be declared twice by accident, so avoid it.
- **Hoisting:** function declarations are ready from the start, `var` starts out as `undefined`, and `let`/`const` throw `Cannot access '...' before initialization` until their line runs.
- Always declare variables with `let` or `const`. Forgetting creates an accidental global in sloppy mode. Strict mode, classes, and modules turn it into an error.

---

**Next:** try the [exercises](exercises.md), then move on to [15 Destructuring, Spread and Rest](../15-destructuring-spread-rest/notes.md).
