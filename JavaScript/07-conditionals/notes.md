# 07 Conditionals

## What is it?

A **conditional** is code that only runs when something is true. It's how a program makes decisions: *if* this is true, do that, *otherwise* do something else.

## Why does it matter?

Until now, your programs ran every single line, top to bottom, no matter what. That's fine for a calculator. It's not fine for most real apps.

Real programs react to what's going on:

- The password is right? Let them in. Wrong? Show an error.
- The customer is a child? Charge the child's price.
- The order is over $50? Shipping is free.

In [chapter 04](../04-operators/notes.md), you could print `true` or `false`. Now you'll *act* on them.

## Real-world example

You already make decisions like this every morning:

| What you think | What it looks like in JavaScript |
|---|---|
| "**If** it's raining, I'll take an umbrella." | `if (isRaining) { ... }` |
| "**Otherwise**, I'll wear sunglasses." | `else { ... }` |
| "If it's raining, umbrella. **Otherwise, if** it's cold, a coat. Otherwise, a T-shirt." | `if ... else if ... else` |

You look at the weather, and you pick *one* option. Never two, never none. Conditionals work exactly the same way.

## How it works

### `if`: run code only when something is true

```js
const temperature = 32;

if (temperature > 30) {
  console.log("It's hot! Drink some water.");
}

console.log("Have a nice day.");
```

You'll see:

```
It's hot! Drink some water.
Have a nice day.
```

Here's how to read it:

- `temperature > 30` is the **condition**: a question with a `true` or `false` answer. It goes in parentheses.
- The curly braces `{ }` hold a **block**: a group of statements that belong together. The block runs only when the condition is `true`.

Change `temperature` to `20` and run it again. Now the condition is `false`, so JavaScript skips the block and you only see `Have a nice day.`

The lines inside the block are indented by 2 spaces. JavaScript doesn't care, but people do: it shows at a glance which lines belong to the `if`.

### `else`: the plan B

`else` gives JavaScript something to do when the condition is `false`:

```js
const balance = 40;
const price = 55;

if (balance >= price) {
  console.log("Payment approved.");
} else {
  console.log("Sorry, not enough money.");
}
// prints: Sorry, not enough money.
```

Exactly one of the two blocks runs. Never both, and never neither.

### `else if`: more than two choices

A cinema has four ticket prices: free for babies under 3, $8 for children under 13, $9 for seniors (65 and over), and $14 for everyone else.

```js
const age = 70;

if (age < 3) {
  console.log("Ticket: free");
} else if (age < 13) {
  console.log("Ticket: $8 (child)");
} else if (age >= 65) {
  console.log("Ticket: $9 (senior)");
} else {
  console.log("Ticket: $14 (adult)");
}
// prints: Ticket: $9 (senior)
```

JavaScript checks the conditions from top to bottom and **stops at the first one that's true**. Only that block runs. If none are true, the `else` block runs.

Notice that the second check is only `age < 13`, not "3 or older and under 13". If JavaScript gets that far, it already knows `age < 3` was false.

Often you want to *save* the decision instead of printing it straight away. Create the variable with `let` before the `if`, then fill it in:

```js
const age = 8;
let price;

if (age < 3) {
  price = 0;
} else if (age < 13) {
  price = 8;
} else if (age >= 65) {
  price = 9;
} else {
  price = 14;
}

console.log(`Ticket price: $${price}`); // prints: Ticket price: $8
```

Why create `price` up top? A variable created *inside* `{ }` only exists inside those braces. If you wrote `const price = 8;` inside the block, the last line would give `ReferenceError: price is not defined`. You'll learn the full story in [chapter 14](../14-scope-and-hoisting/notes.md).

### Combining conditions

Remember `&&` (and), `||` (or), and `!` (not) from [chapter 04](../04-operators/notes.md)? They let one `if` check several things at once.

An online shop gives free shipping on orders of $50 or more, **or** to anyone with a membership:

```js
const orderTotal = 45;
const isMember = true;

if (orderTotal >= 50 || isMember) {
  console.log("Shipping: FREE");
} else {
  console.log("Shipping: $4.99");
}
// prints: Shipping: FREE
```

The order is under $50, but the customer is a member, so `||` is happy with one out of two.

A concert only lets you in if you're 18 or older **and** you have a ticket:

```js
const age = 20;
const hasTicket = true;

if (age >= 18 && hasTicket) {
  console.log("Welcome to the concert!");
}
// prints: Welcome to the concert!
```

### Nested ifs (and keeping them shallow)

You can put an `if` inside another `if`. This is called **nesting**. Here's the check for an admin page on a website:

```js
const isLoggedIn = true;
const isAdmin = false;

if (isLoggedIn) {
  if (isAdmin) {
    console.log("Welcome to the admin panel.");
  } else {
    console.log("Sorry, admins only.");
  }
} else {
  console.log("Please log in first.");
}
// prints: Sorry, admins only.
```

It works, but every extra level pushes the code further to the right and makes it harder to follow. Real programs can end up five levels deep, and nobody enjoys reading that.

Here's the same logic, flat. Remember that `!` flips a boolean, so `!isLoggedIn` reads as "not logged in":

```js
if (!isLoggedIn) {
  console.log("Please log in first.");
} else if (!isAdmin) {
  console.log("Sorry, admins only.");
} else {
  console.log("Welcome to the admin panel.");
}
// prints: Sorry, admins only.
```

The trick: **deal with the problem cases first**, then the happy case at the end. Each check is one line, and you can read it from top to bottom like a checklist. In [chapter 09](../09-functions/notes.md) you'll learn an even cleaner version of this trick.

### Truthy and falsy

So far, every condition has been a real boolean, like `age >= 18`. But you can put *any* value in an `if`. JavaScript quietly turns it into `true` or `false` first.

Values that turn into `false` are called **falsy**. There are only eight of them:

| Falsy value | What it is |
|---|---|
| `false` | the boolean itself |
| `0` and `-0` | zero (yes, JavaScript has a negative zero) |
| `0n` | zero as a BigInt ([chapter 05](../05-numbers-and-math/notes.md)) |
| `""` | an empty string |
| `null` | "intentionally empty" |
| `undefined` | "no value yet" |
| `NaN` | "not a number" |

**Everything else is truthy**, which means it turns into `true`.

You can check any value with `Boolean()`. It converts a value to `true` or `false`, the same way `Number()` and `String()` convert to numbers and strings:

```js
console.log(Boolean(0));       // prints: false
console.log(Boolean(""));      // prints: false
console.log(Boolean(42));      // prints: true
console.log(Boolean("hello")); // prints: true
console.log(Boolean("0"));     // prints: true (surprise!)
console.log(Boolean(" "));     // prints: true (surprise!)
```

`"0"` and `" "` aren't empty. They each contain one character, so they're truthy. Only the completely empty string `""` is falsy.

Truthy and falsy make some checks short and sweet. Here's a sign-up form checking that the name box isn't empty:

```js
const typedName = "";

if (typedName) {
  console.log(`Hello, ${typedName}!`);
} else {
  console.log("Please enter your name.");
}
// prints: Please enter your name.
```

`if (typedName)` means "if there's something in `typedName`". Put `"Leo"` in it, and you'll see `Hello, Leo!` instead.

### The ternary operator: a short `if`/`else`

Sometimes you just want to pick one of two *values*. Writing a full `if`/`else` for that feels long:

```js
const age = 16;
let label;

if (age >= 18) {
  label = "adult";
} else {
  label = "minor";
}
```

The **ternary operator** does the same thing in one line:

```js
const age = 16;
const label = age >= 18 ? "adult" : "minor";

console.log(label); // prints: minor
```

Read it as a question: "Is `age >= 18`? If yes, `"adult"`. If no, `"minor"`."

```
condition ? valueIfTrue : valueIfFalse
```

It shines inside template literals. Online shops use this trick all the time so they never say "1 items":

```js
const itemCount = 1;
console.log(`You have ${itemCount} ${itemCount === 1 ? "item" : "items"} in your cart.`);
// prints: You have 1 item in your cart.
```

> **Tip:** use the ternary to choose between two values. When you need to *do* things (several lines of code), use a normal `if`/`else`. And avoid putting a ternary inside another ternary. It gets hard to read fast.

### `switch`: one value, many possible matches

Imagine a self-driving car reading a traffic light. You *could* write `if (light === "green") ... else if (light === "yellow") ...` and so on. When you compare one value against a list of exact options, `switch` is often tidier:

```js
const light = "yellow";

switch (light) {
  case "green":
    console.log("Go!");
    break;
  case "yellow":
    console.log("Slow down.");
    break;
  case "red":
    console.log("Stop!");
    break;
  default:
    console.log("Light is broken. Drive carefully.");
}
// prints: Slow down.
```

- `switch (light)` says which value to look at.
- Each `case` is one possible match. JavaScript compares with `===`, so the string `"1"` won't match `case 1:`.
- `break` means "I'm done, jump out of the `switch`".
- `default` runs when no case matches, like a final `else`. It's optional, but it's a good habit.

> **Watch out:** forget a `break`, and JavaScript doesn't stop at the end of the matching case. It **falls through** and runs every case below it too, without checking them:

```js
const light = "yellow";

switch (light) {
  case "green":
    console.log("Go!");
  case "yellow":
    console.log("Slow down.");
  case "red":
    console.log("Stop!");
  default:
    console.log("Light is broken. Drive carefully.");
}
```

You'll see:

```
Slow down.
Stop!
Light is broken. Drive carefully.
```

Falling through *is* useful in one situation: when several cases should do the same thing. Stack them on top of each other. In this game, both the `W` key and the up arrow move the player up:

```js
const key = "ArrowUp";

switch (key) {
  case "w":
  case "ArrowUp":
    console.log("Move up");
    break;
  case "s":
  case "ArrowDown":
    console.log("Move down");
    break;
  default:
    console.log("That key does nothing.");
}
// prints: Move up
```

**`switch` or `if`?** Use `switch` when you compare *one value* against several exact options. For ranges (like `age < 13`) or mixed conditions, stick with `if`/`else if`.

### `||` for default values

In chapter 04, `&&` and `||` always gave you `true` or `false`. Here's the full truth: they actually give you back **one of the two values** you gave them.

`a || b` means: "if `a` is truthy, give me `a`. Otherwise, give me `b`."

```js
console.log("Sam" || "Guest"); // prints: Sam
console.log("" || "Guest");    // prints: Guest
```

That makes `||` perfect for **default values**: a backup value to use when the real one is missing.

```js
const typedName = "";
const displayName = typedName || "Guest";

console.log(`Hello, ${displayName}!`); // prints: Hello, Guest!
```

### `&&` as a guard

`a && b` means: "if `a` is falsy, give me `a` and stop. Otherwise, give me `b`."

```js
console.log(true && "Welcome!");  // prints: Welcome!
console.log(false && "Welcome!"); // prints: false
```

The "and stop" part is the useful bit. When the left side is falsy, JavaScript doesn't even *look* at the right side. This is called **short-circuiting**.

Why does that help? Calling a method on `null` crashes your program:

```js
const nickname = null;
nickname.toUpperCase();
// TypeError: Cannot read properties of null (reading 'toUpperCase')
```

Put `nickname &&` in front, and it becomes a **guard**, like a security guard who only lets you through if you have a pass:

```js
const nickname = null;
console.log(nickname && nickname.toUpperCase()); // prints: null (no crash)
```

`nickname` is falsy, so JavaScript stops right there and never calls `toUpperCase()`. If `nickname` were `"ace"`, you'd get `ACE`. (In [chapter 11](../11-objects/notes.md) you'll meet `?.`, a shorter way to write guards like this.)

### `??`: defaults that keep `0` and `""`

`||` has one weakness. It treats *every* falsy value as "missing", including `0` and `""`. But sometimes `0` is exactly what the user chose.

A game saves your volume setting. You muted it, so it's `0`:

```js
const savedVolume = 0;

console.log(savedVolume || 50); // prints: 50 (oops! you wanted 0)
console.log(savedVolume ?? 50); // prints: 0
```

`??` is called **nullish coalescing**, which is a fancy name for a simple idea: it only uses the default when the value is `null` or `undefined` (together called "nullish"). Every other value, even `0` and `""`, is kept.

| Value | `value \|\| "default"` | `value ?? "default"` |
|---|---|---|
| `null` | `"default"` | `"default"` |
| `undefined` | `"default"` | `"default"` |
| `0` | `"default"` | `0` |
| `""` | `"default"` | `""` |
| `false` | `"default"` | `false` |
| `"Sam"` | `"Sam"` | `"Sam"` |

**Which one should I use?** Ask yourself: "Is `0` or an empty string a real, valid answer here?"

- Volume, price, score, number of items: `0` is valid, so use `??`.
- A display name: an empty name is useless, so use `||`.

## Common mistakes

**1. Using `=` instead of `===`**

```js
let score = 40;

if (score = 100) {
  console.log("Perfect score!");
}
// prints: Perfect score!

console.log(score); // prints: 100
```

You met this one in [chapter 04](../04-operators/notes.md), and inside an `if` it's even sneakier. A single `=` doesn't compare. It *puts* 100 into `score`, and 100 is truthy, so the block always runs. Your score got changed too! Fix: `if (score === 100)`.

**2. A semicolon after the condition**

```js
const temperature = 10;

if (temperature > 30); {
  console.log("It's hot! Drink some water.");
}
// prints: It's hot! Drink some water. (at 10 degrees?!)
```

That little `;` ends the `if` straight away, with nothing inside it. The block below is no longer part of the `if`, so it runs every time. There's no error message to warn you. Fix: never put a semicolon between `)` and `{`.

**3. Forgetting to repeat the variable in `||`**

```js
const color = "blue";

if (color === "red" || "orange") {
  console.log("Warm color!");
}
// prints: Warm color! (wrong!)
```

This reads fine in English, but JavaScript sees two separate things: `color === "red"`, **or** `"orange"`. A non-empty string is truthy, so the condition is always true. Fix: `if (color === "red" || color === "orange")`.

**4. Putting `else if` checks in the wrong order**

```js
const orderTotal = 120;

if (orderTotal > 50) {
  console.log("You get 10% off!");
} else if (orderTotal > 100) {
  console.log("You get 20% off!");
}
// prints: You get 10% off! (should be 20%!)
```

The first true condition wins, and the rest are skipped. 120 is more than 50, so JavaScript never reaches the second check. Fix: put the biggest (most specific) check first.

**5. Forgetting that `"0"` is truthy**

```js
const quantity = "0"; // typed into a form, so it's text

if (quantity) {
  console.log("Adding to your cart...");
}
// prints: Adding to your cart... (wrong!)
```

Only the empty string is falsy. `"0"` has a character in it, so it's truthy. Values typed into forms are always strings, so this comes up a lot. Fix: turn it into a number first: `if (Number(quantity) > 0)`.

## Quick recap

- `if` runs a block only when its condition is true. `else` is the plan B. `else if` adds more choices, and the first true condition wins.
- Combine conditions with `&&`, `||`, and `!`. Keep nesting shallow by handling the problem cases first.
- The eight falsy values are `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, and `NaN`. Everything else is truthy, even `"0"`.
- The ternary `condition ? a : b` picks one of two values.
- `switch` compares one value against many cases with `===`. End each case with `break`, and use `default` as the fallback.
- `||` gives a default for any falsy value. `&&` stops at the first falsy value, so it works as a guard.
- `??` only gives a default for `null` and `undefined`, so `0` and `""` are kept.

---

**Next:** try the [exercises](exercises.md), then move on to [08 Loops](../08-loops/notes.md).
