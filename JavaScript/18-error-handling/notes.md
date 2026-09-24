# 18 Error Handling

## What is it?

**Error handling** is how your program deals with things that go wrong: a missing value, a number that's out of range, a request that breaks the rules.

Instead of crashing with a scary message, your program can notice the problem, deal with it, and keep going.

## Why does it matter?

Real programs meet a messy world. Users type "fifty" where you expected `50`. Data arrives with pieces missing. Someone tries to book 12 seats when only 6 are left.

Without error handling, one problem crashes the whole program. With it, you can:

- show a friendly message instead of a crash,
- skip one bad item and carry on with the rest,
- clean up (turn off a printer, close a file) no matter what happened.

Error handling also works the other way round. Your own functions can raise the alarm the moment something is wrong, instead of quietly giving a wrong answer that nobody notices until much later.

## Real-world example

Think of a busy restaurant kitchen:

| In the kitchen | In code |
|---|---|
| The chef tries to cook the order | `try { ... }` runs code that might fail |
| The chef finds there's no salmon left and rings the bell: "Can't make this one!" | `throw new Error("Out of salmon")` |
| The waiter hears the bell, tells the customer, and offers the chicken instead | `catch (error) { ... }` handles the problem |
| The kitchen gets cleaned at the end of the night, busy or quiet | `finally { ... }` runs no matter what |
| Nobody hears the bell, and the whole restaurant shuts down | An uncaught error crashes the program |

Notice the split. The chef *spots* the problem, but the waiter *decides what to do about it*. That idea is at the heart of this chapter.

## How it works

### Kinds of errors

You've already met a few errors, like `ReferenceError` in [chapter 01](../01-getting-started/notes.md). Here are the main kinds.

**Syntax errors** are grammar mistakes. JavaScript checks the whole file before running it, so a syntax error means *nothing* runs at all.

```js
console.log("Hi";
// SyntaxError: missing ) after argument list
```

**Reference errors** happen when you use a name that doesn't exist, often because of a typo.

```js
const total = 50;
console.log(totl);
// ReferenceError: totl is not defined
```

**Type errors** happen when you use a value the wrong way, like reading a property of `undefined`, or calling something that isn't a function.

```js
const guest = undefined;
console.log(guest.name);
// TypeError: Cannot read properties of undefined (reading 'name')

const price = 5;
price();
// TypeError: price is not a function
```

**Range errors** happen when a number is outside the allowed range. You met one in [chapter 17](../17-recursion/notes.md): `Maximum call stack size exceeded`.

```js
const cheer = "Go! ".repeat(-1);
// RangeError: Invalid count value: -1
```

**Logic errors** are the sneaky ones. The program runs fine and prints no error, but the answer is wrong.

```js
const math = 80;
const science = 90;
const average = math + science / 2;
console.log(average); // prints: 125
```

The average of 80 and 90 should be 85. Division happens before addition ([chapter 04](../04-operators/notes.md)), so this worked out `80 + 45`. The fix is `(math + science) / 2`. JavaScript can't warn you about this, which is why you should always check your results.

| Kind | What it means | When you find out |
|---|---|---|
| Syntax error | Broken grammar | Before any code runs |
| Reference error | A name that doesn't exist | When that line runs |
| Type error | A value used the wrong way | When that line runs |
| Range error | A number that's out of range | When that line runs |
| Logic error | The code runs, but the answer is wrong | Only when you notice! |

Reference, type, and range errors show up while the program is running, so they're called **runtime errors**. Most of this chapter is about them.

### Reading a stack trace

When a runtime error isn't handled, the program stops and Node prints a report. Learning to read it saves you a lot of time. Save this as `trace.js` and run it:

```js
function countItems(order) {
  return order.items.length;
}

function printSummary(order) {
  const count = countItems(order);
  console.log(`Order ${order.id} has ${count} items`);
}

printSummary({ id: 7, items: ["pizza", "cola"] });
printSummary({ id: 8 });
console.log("Done");
```

You'll see something like this. The file paths are shortened here; yours will show where your file lives.

```
Order 7 has 2 items
C:\...\18-error-handling\trace.js:2
  return order.items.length;
                     ^

TypeError: Cannot read properties of undefined (reading 'length')
    at countItems (C:\...\18-error-handling\trace.js:2:22)
    at printSummary (C:\...\18-error-handling\trace.js:6:17)
    at Object.<anonymous> (C:\...\18-error-handling\trace.js:11:1)
    at Module._compile (node:internal/modules/cjs/loader:1830:14)
    ...

Node.js v24.15.0
```

Read it from the top:

1. **Where it broke:** `trace.js:2` means line 2. Node shows that line, with a `^` under the spot where it went wrong.
2. **What went wrong:** `TypeError: Cannot read properties of undefined (reading 'length')`. So `order.items` was `undefined`, and the code tried to read `.length` of it. Order 8 has no `items`.
3. **How it got there:** the `at` lines. This list is called the **stack trace**: the chain of function calls that were in progress when the error happened, newest first. `countItems` (line 2, column 22) was called by `printSummary` (line 6), which was called from line 11. `Object.<anonymous>` means "the main part of your file, outside any function".
4. **What to skip:** lines starting with `node:internal` are Node's own code. You can ignore them.

Remember the call stack from chapter 17, the stack of plates? A stack trace is a photo of that stack at the moment things went wrong.

Also notice that `Done` never printed. An error nobody handles stops the whole program.

> **Tip:** In the browser, the same error shows up in red in the console, starting with `Uncaught`. The file name and line number appear next to it, and you can click them to jump to the line.

### Catching errors with `try` and `catch`

Crashing isn't always what you want. `try` and `catch` let you say: "try this, and if it fails, do that instead."

```js
try {
  // code that might fail
} catch (error) {
  // runs only if something in try failed
}
```

Here's an order that doesn't have its customer details yet:

```js
const order = { id: 42 }; // no customer details yet

try {
  console.log("Customer:", order.customer.name);
  console.log("This line is skipped.");
} catch (error) {
  console.log("Could not print the order:", error.message);
}

console.log("The program keeps going.");
```

You'll see:

```
Could not print the order: Cannot read properties of undefined (reading 'name')
The program keeps going.
```

Here's what happened, step by step:

1. JavaScript runs the `try` block line by line.
2. The first line fails. JavaScript **stops the `try` block right there** and jumps straight to `catch`. "This line is skipped." never prints.
3. The `catch` block runs. `error` holds information about what went wrong.
4. The program carries on after the whole `try`/`catch`, as if nothing had crashed.

If nothing fails inside `try`, the `catch` block is skipped completely.

The name `error` works like a function parameter: you pick it. You'll often see `err` or `e` in other people's code.

> **Tip:** For a missing property like this one, `order.customer?.name` (optional chaining, from [chapter 11](../11-objects/notes.md)) is simpler. `try`/`catch` is for problems you can't easily check in advance, and for errors thrown on purpose, which is coming up next.

### The error object

When something fails, JavaScript creates an **error object** and hands it to `catch`. It has three useful properties:

```js
try {
  const volume = 11;
  volume();
} catch (error) {
  console.log(error.name);    // prints: TypeError
  console.log(error.message); // prints: volume is not a function
  console.log(error.stack);   // prints: the stack trace, as text
}
```

| Property | What it holds | Who it's for |
|---|---|---|
| `name` | The kind of error, like `"TypeError"` | Your code, to decide what to do |
| `message` | What went wrong, in words | You, and sometimes your users |
| `stack` | The name, message, and the `at` lines | You, when you're hunting a bug |

> **Tip:** `console.error()` works like `console.log()`, but it's meant for problems. In the browser console, its messages show up in red. It's a good habit inside `catch` blocks.

### Throwing your own errors

JavaScript only throws errors for things it understands: broken grammar, unknown names, values used the wrong way. It has no idea that taking $500 out of an account with $100 in it is wrong. Only *your* code knows the rules of your app.

Remember the cash machine from [chapter 09](../09-functions/notes.md)? Its `withdraw` function returned a message like `"Sorry, you don't have enough money."` when something was wrong. That's fine for printing, but the code that called it gets a string back either way, so it can't easily tell a problem from a success.

A better way: when your function hits a problem it can't solve, it raises the alarm with `throw`:

```js
function withdraw(balance, amount) {
  if (amount > balance) {
    throw new Error("Not enough money in the account");
  }
  return balance - amount;
}

console.log(withdraw(100, 30)); // prints: 70
console.log(withdraw(100, 500));
// Error: Not enough money in the account
```

Two new things here:

- `new Error("...")` creates an error object with your message. It gets a `name` (`"Error"`), your `message`, and a `stack`, just like JavaScript's own errors.
- `throw` sends the error flying. The function stops on the spot, a bit like `return`, but for problems. The error travels back to whoever called the function, then to whoever called *that*, and so on, until some `catch` catches it. If nothing does, the program crashes.

Now the caller can catch it:

```js
try {
  const newBalance = withdraw(100, 500);
  console.log("New balance:", newBalance);
} catch (error) {
  console.log("Sorry:", error.message);
}
// prints: Sorry: Not enough money in the account
```

That's the kitchen and the waiter again. `withdraw` spots *what* is wrong. The caller decides *what to do about it*: show a message, suggest a smaller amount, or something else.

### Built-in error types

The error types from the start of this chapter (`SyntaxError`, `ReferenceError`, `TypeError`, `RangeError`) are all built into JavaScript, along with the general `Error`. You can throw them too. Plain `Error` is fine most of the time. Use `TypeError` when a value has the wrong type, and `RangeError` when a number is too big or too small:

```js
function setVolume(level) {
  if (typeof level !== "number") {
    throw new TypeError(`Volume must be a number, got ${typeof level}`);
  }
  if (level < 0 || level > 10) {
    throw new RangeError(`Volume must be 0 to 10, got ${level}`);
  }
  console.log(`Volume set to ${level}`);
}

setVolume(7); // prints: Volume set to 7

try {
  setVolume(11);
} catch (error) {
  console.log(error.name, "-", error.message);
}
// prints: RangeError - Volume must be 0 to 10, got 11
```

Picking the right type pays off: the code that catches the error can check `error.name` and react differently to each kind. You'll see that in action a bit further down.

In [chapter 27](../27-classes/notes.md), you'll learn to make your own error types, like `ValidationError`, and another way to check them (`instanceof`).

### Guard clauses: check first, then do the work

You met **guard clauses** in chapter 09: `if` checks at the very top of a function that deal with a problem and leave early. They're like a bouncer at the door: trouble gets turned away before it gets inside. In chapter 09 they left with `return`. They work just as well with `throw`.

Here's the cash machine again, now checking every rule. Each rule gets one flat check, no nesting, and the real work sits at the bottom:

```js
function withdraw(balance, amount) {
  if (typeof amount !== "number" || Number.isNaN(amount)) {
    throw new TypeError("Amount must be a number");
  }
  if (amount <= 0) {
    throw new RangeError("Amount must be more than 0");
  }
  if (amount > balance) {
    throw new Error(`Not enough money. Balance: ${balance}, requested: ${amount}`);
  }

  return balance - amount; // the happy path
}
```

Why the `Number.isNaN` check? Because `typeof NaN` is `"number"` ([chapter 05](../05-numbers-and-math/notes.md)), so the first check alone would let `NaN` through.

Let's test every rule in one go:

```js
let balance = 100;
const requests = [30, -5, "fifty", 500];

for (const amount of requests) {
  try {
    balance = withdraw(balance, amount);
    console.log(`Withdrew ${amount}. Balance: ${balance}`);
  } catch (error) {
    console.log(`${error.name}: ${error.message}`);
  }
}
```

You'll see:

```
Withdrew 30. Balance: 70
RangeError: Amount must be more than 0
TypeError: Amount must be a number
Error: Not enough money. Balance: 70, requested: 500
```

Look at `balance = withdraw(balance, amount);`. When `withdraw` throws, the assignment never happens, so `balance` can't be damaged by a bad request. And because the `try`/`catch` is *inside* the loop, one bad request doesn't stop the others.

Checking values like this is called **validating input**. A simple rule for guard clauses:

- If there's a sensible answer, `return` it. (The total of an empty cart is just `0`.)
- If there's no sensible answer, `throw`. (There's no sensible way to withdraw `"fifty"`.)

### `finally`: code that always runs

Sometimes you need to do something no matter what happened: turn off a printer, hide a "Loading..." message, lock the door again. That's what `finally` is for.

```js
function printTicket(seat) {
  console.log("Printer on");
  try {
    if (seat === "") {
      throw new Error("No seat chosen");
    }
    console.log(`Printing ticket for seat ${seat}`);
  } catch (error) {
    console.log("Print failed:", error.message);
  } finally {
    console.log("Printer off");
  }
}

printTicket("C7");
printTicket("");
```

You'll see:

```
Printer on
Printing ticket for seat C7
Printer off
Printer on
Print failed: No seat chosen
Printer off
```

The printer goes off both times. `finally` even runs when the `try` block uses `return`.

You can also write `try` and `finally` without a `catch`. Then the clean-up happens first, and the error carries on traveling to whoever called the function.

### When to catch, and when to let it crash

Catching isn't always the right move. Before you write a `catch`, ask yourself: *can I do something useful here?*

| Catch it when you can... | Let it crash when... |
|---|---|
| show the user a friendly message | it's a bug in your own code (a typo, a wrong property name) |
| fall back to a sensible default | there's nothing sensible to do at this spot |
| skip one bad item and carry on with the rest | carrying on would give wrong results, like charging a customer twice |
| try again (you'll see this with the network in chapter 33) | |

A crash with a clear stack trace is annoying, but it's honest: it tells you exactly where to look. A program that hides a problem and keeps going with wrong data is much worse.

Often you only know how to handle *some* errors. Handle those, and pass the rest on by throwing the same error again. This is called **re-throwing**:

```js
let balance = 100;

try {
  balance = withdraw(balance, -20);
} catch (error) {
  if (error.name === "RangeError") {
    console.log("Please enter an amount above 0.");
  } else {
    throw error; // not a problem we know how to handle: pass it on
  }
}
// prints: Please enter an amount above 0.
```

One rule has no exceptions: **never swallow an error silently.** An empty `catch` block makes the problem vanish without a trace. You'll see why in Common mistakes below.

### Adding a cause

Sometimes a low-level error needs a clearer, big-picture message. "Card declined" is a detail. "Order 1042 failed" is what the rest of your program cares about. You can have both: throw a new error and attach the original as its **cause**.

```js
function chargeCard(amount) {
  // Pretend the bank said no
  throw new Error("Card declined");
}

function placeOrder(orderId, amount) {
  try {
    chargeCard(amount);
  } catch (error) {
    throw new Error(`Order ${orderId} failed`, { cause: error });
  }
}

try {
  placeOrder(1042, 59.99);
} catch (error) {
  console.log(error.message);       // prints: Order 1042 failed
  console.log(error.cause.message); // prints: Card declined
}
```

If nobody catches an error like this, Node prints both of them, with the original marked `[cause]`, so no detail gets lost.

> **Coming up:** errors in code that *waits* (timers, loading data from the internet) need a few extra tricks. You'll learn them in [chapter 31](../31-promises/notes.md) and [chapter 32](../32-async-await/notes.md). And in [chapter 23](../23-json-and-local-storage/notes.md), you'll use `try`/`catch` to deal with broken data.

## Common mistakes

**1. Swallowing errors silently**

```js
function saveHighScore(score) {
  throw new Error("Save file is full"); // pretend saving failed
}

try {
  saveHighScore(9800);
} catch (error) {
  // do nothing
}

console.log("Game over. See you next time!");
// prints: Game over. See you next time!
```

The save failed, but the player never finds out, and neither do you. Their high score is just gone. At the very least, report the problem:

```js
} catch (error) {
  console.error("Could not save your score:", error.message);
}
```

And if you can't do anything useful with an error, don't catch it at all.

**2. Throwing a string instead of an error**

```js
try {
  throw "Out of stock";
} catch (error) {
  console.log(error.message); // prints: undefined
}
```

JavaScript lets you throw anything, but a plain string has no `message`, no `name`, and no stack trace to show where it came from. Always throw an error object: `throw new Error("Out of stock");`

**3. Using a variable from inside `try` after it**

```js
try {
  const newBalance = withdraw(100, 30);
} catch (error) {
  console.log(error.message);
}

console.log(newBalance);
// ReferenceError: newBalance is not defined
```

The curly braces of `try` make a block, and `const` and `let` stay inside their block ([chapter 14](../14-scope-and-hoisting/notes.md)). The simplest fix is to use the value inside `try`, right after the line that might fail: move `console.log(newBalance);` up, just below the `withdraw` call.

**4. Expecting `try` to catch a syntax error**

```js
try {
  console.log("Hi";
} catch (error) {
  console.log("Caught it!");
}
// SyntaxError: missing ) after argument list
```

"Caught it!" never prints. A syntax error stops the file before *any* code runs, so the `try` never gets its chance. `try`/`catch` only catches runtime errors. Fix the typo instead.

**5. A `catch` that blames the wrong thing**

```js
let balance = 100;

try {
  balance = withdraw(balance, 20);
  console.log(`New balance: ${balanse}`); // typo!
} catch (error) {
  console.log("Not enough money!");
}
// prints: Not enough money!
```

The withdrawal worked. The real problem is the typo `balanse`, a `ReferenceError`. But the `catch` guessed, and guessed wrong, so now you're hunting for a money problem that doesn't exist. To avoid this:

- Show `error.message` instead of guessing. Here it would say `balanse is not defined` straight away.
- Keep `try` blocks small, around the code that can actually fail.
- Handle only the errors you expect, and re-throw the rest.

## Quick recap

- The main kinds of errors are syntax, reference, type, range, and logic errors. Logic errors print no message, so always check your results.
- Read a stack trace from the top: where it broke, what went wrong, then the `at` lines showing how it got there.
- `try` runs code that might fail, `catch (error)` handles the failure, and `finally` runs no matter what.
- The error object has a `name`, a `message`, and a `stack`.
- `throw new Error("...")` lets your own functions raise the alarm. Use `TypeError` or `RangeError` when they fit.
- Guard clauses check for problems at the top of a function and leave early, so the real work stays flat and clear.
- Only catch errors you can do something about, and never swallow them silently. `{ cause: error }` adds a clearer message without losing the original.

---

**Next:** try the [exercises](exercises.md), then move on to [19 Dates and Times](../19-dates-and-times/notes.md).
