# 46 Testing

## What is it?

A **test** is a small piece of code that checks whether another piece of code does what it should. You run it, and it answers with a simple "pass" or "fail".

**Automated testing** means writing these checks once and letting the computer run them for you, as often as you like. Node comes with everything you need, so there's nothing to install.

## Why does it matter?

Until now, you've tested your code by running it and reading the output. In [chapter 45](../45-clean-code/notes.md), you compared outputs by eye after every refactoring step. That works for five lines of output. It doesn't work for an app with 200 functions.

Automated tests help in four big ways:

- **They catch bugs before your users do.** A test fails in your terminal, not in a customer's shopping cart.
- **They make changes safe.** Refactoring and adding features stop being scary, because the tests tell you straight away if you broke something.
- **They stop old bugs from coming back.** When something that used to work breaks again, that's called a **regression**. A test written for a fixed bug guards against it forever.
- **They're fast.** Hundreds of tests run in about a second, every time you ask.

## Real-world example

Think of a smoke detector.

You install it once. After that, it checks the air all day and all night, and it only makes a noise when something is wrong. You don't have to remember to sniff every room before bed.

Tests are smoke detectors for your code. And like a pilot's pre-flight checklist, they go through the same list every single time, even the boring items that "never" go wrong. That's exactly where the surprises hide.

| | Checking by hand | Automated tests |
|---|---|---|
| Who does the checking | You, reading the output | The computer |
| How long it takes | Minutes, and it grows with your app | A second or two |
| Checks every case, every time? | Rarely: people forget and get bored | Always |
| When it happens | When you remember to | Every time you run `node --test` |

Checking by hand still has its place, like trying out a new page to see if it *feels* right. But the "does 2 + 2 still give 4?" work belongs to the computer.

## How it works

### Your first test

Tests usually check one small piece of code at a time, like a single function. Those are called **unit tests** (a "unit" is one small piece). They're what this chapter is about.

Make a new folder for this. Node's test tools use `import`, so the folder needs a `package.json` containing `{ "type": "module" }`, just like in [chapter 29](../29-modules/notes.md).

Here's the code we want to test. Save it as `prices.js`:

```js
export function addTax(price, rate) {
  return price + price * rate;
}
```

And here's a test for it, in a file called `prices.test.js`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { addTax } from "./prices.js";

test("adds 20% tax to a price", () => {
  const result = addTax(50, 0.2);
  assert.equal(result, 60);
});

test("leaves the price alone when the rate is 0", () => {
  assert.equal(addTax(50, 0), 50);
});
```

Now open a terminal in that folder and run:

```
node --test
```

You'll see something like this (your times will be different):

```
✔ adds 20% tax to a price (0.5526ms)
✔ leaves the price alone when the rate is 0 (0.1052ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 165.2655
```

Two green ticks: both tests pass. Let's look at the pieces:

- `node:test` and `node:assert/strict` are built into Node. The `node:` at the front means "Node's own module", so there's nothing to install.
- `test(name, fn)` creates one test. The name says in plain words what *should* happen. When a test fails, that name is the first thing you'll read, so make it clear.
- `assert.equal(actual, expected)` checks that the two values are equal. `actual` is what your code gave you, and `expected` is what it should be. If they don't match, `assert.equal` throws an error, and the test fails.
- The `/strict` part means the comparisons work like `===`. So `"60"` does not equal `60`. Always use the strict version.

To run just one file, name it: `node --test prices.test.js`. And `node --test --watch` keeps running and re-runs your tests every time you save a file. Press `Ctrl + C` to stop it.

### How `node --test` finds your tests

When you run `node --test` without naming a file, Node searches the folder (and the folders inside it) for files with test-like names. In Node 24, these are picked up:

| File name | Example |
|---|---|
| Ends in `.test.js` | `prices.test.js` |
| Ends in `-test.js` or `_test.js` | `prices-test.js`, `prices_test.js` |
| Starts with `test-` | `test-prices.js` |
| Is called `test.js` | `test.js` |
| Any `.js` file inside a folder called `test` | `test/prices.js` |

The same patterns work for `.mjs` and `.cjs` files. Folders called `node_modules` are skipped.

A file called `prices.spec.js` or `pricesTest.js` is *not* found. That catches a lot of people out (see Common mistakes). The simplest habit: put `something.test.js` right next to `something.js`.

### When a test fails

Tests earn their keep when they fail. Here's a discount function with a bug:

```js
// discount.js
export function applyDiscount(price, percent) {
  return price - percent / 100; // bug: forgot to multiply by the price
}
```

```js
// discount.test.js
import { test } from "node:test";
import assert from "node:assert/strict";
import { applyDiscount } from "./discount.js";

test("takes 25% off a $80 jacket", () => {
  assert.equal(applyDiscount(80, 25), 60);
});

test("0% off leaves the price alone", () => {
  assert.equal(applyDiscount(80, 0), 80);
});
```

Run `node --test`, and you'll see this (trimmed a little):

```
✖ takes 25% off a $80 jacket (2.1571ms)
✔ 0% off leaves the price alone (0.3569ms)
ℹ tests 2
ℹ suites 0
ℹ pass 1
ℹ fail 1
...

✖ failing tests:

test at discount.test.js:5:1
✖ takes 25% off a $80 jacket (2.1571ms)
  AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

  79.75 !== 60

      at TestContext.<anonymous> (file:///C:/.../discount.test.js:6:10)
      ...
```

How to read it:

1. **The summary** shows a red cross next to the failing test's name, and `fail 1`.
2. **The failing tests section** repeats each failure with details. `test at discount.test.js:5:1` is where the test starts.
3. **`79.75 !== 60`** is the heart of it: the actual value, then the expected one. The function took off 0.25 dollars instead of 25%.
4. **The `at` line** points at the exact `assert` that failed: line 6 of `discount.test.js`. You read these lines just like the stack traces in [chapter 18](../18-error-handling/notes.md).

Notice that the second test *passed*. With 0% off, the bug happens to give the right answer. That's why one test is rarely enough.

(Behind the scenes, a failed run also ends with an **exit code** of 1: a number every program hands back when it finishes, where 0 means "all good". Tools that run your tests automatically use it to spot failures.)

Fix the bug with `return price - (price * percent) / 100;`, run the tests again, and both go green.

### Arrange, act, assert

Most good tests have the same three steps, in the same order:

1. **Arrange:** set up everything the test needs.
2. **Act:** do the one thing you're testing.
3. **Assert:** check the result.

Here's a library that charges 25 cents for every day a book is late:

```js
// library.js
const FEE_PER_DAY_CENTS = 25;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function lateFeeCents(dueDate, returnedDate) {
  const daysLate = Math.ceil((returnedDate - dueDate) / MS_PER_DAY);
  return Math.max(0, daysLate) * FEE_PER_DAY_CENTS;
}
```

```js
// library.test.js
import { test } from "node:test";
import assert from "node:assert/strict";
import { lateFeeCents } from "./library.js";

test("charges 25 cents for each day late", () => {
  // Arrange
  const dueDate = new Date("2026-03-01");
  const returnedDate = new Date("2026-03-05");

  // Act
  const fee = lateFeeCents(dueDate, returnedDate);

  // Assert
  assert.equal(fee, 100);
});
```

You don't have to write the three comments every time. But keeping the steps in this order makes every test easy to scan. (The fee is in cents, so the test can compare whole numbers and skip the decimal surprises from [chapter 05](../05-numbers-and-math/notes.md).)

### Grouping tests with `describe` and `it`

As tests pile up, you can group the ones about the same thing with `describe`. Inside it, `it` works exactly like `test`, and it reads nicely as a sentence: "withdraw: it takes the amount off the balance".

Here's the `withdraw` function from chapter 18, exported from `bank.js`:

```js
// bank.js
export function withdraw(balance, amount) {
  if (typeof amount !== "number" || Number.isNaN(amount)) {
    throw new TypeError("Amount must be a number");
  }
  if (amount <= 0) {
    throw new RangeError("Amount must be more than 0");
  }
  if (amount > balance) {
    throw new Error("Not enough money");
  }
  return balance - amount;
}
```

```js
// bank.test.js
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { withdraw } from "./bank.js";

describe("withdraw", () => {
  it("takes the amount off the balance", () => {
    assert.equal(withdraw(100, 30), 70);
  });

  it("allows taking out everything", () => {
    assert.equal(withdraw(100, 100), 0);
  });
});
```

The output shows the group with its tests indented underneath:

```
▶ withdraw
  ✔ takes the amount off the balance (0.6489ms)
  ✔ allows taking out everything (0.0987ms)
✔ withdraw (3.325ms)
```

A group of tests is called a **suite**. That's what `ℹ suites 1` counts in the summary.

### The assertions you'll use most

An **assertion** is one check inside a test: "I assert that this is true." Here are the ones you'll reach for most:

| Assertion | Passes when... | Use it for |
|---|---|---|
| `assert.equal(actual, expected)` | the two values are the same, like `===` | numbers, strings, true/false |
| `assert.deepEqual(actual, expected)` | the two have the same contents | arrays and objects |
| `assert.notEqual(actual, expected)` | the two are different | "this must have changed" |
| `assert.ok(value)` | the value is truthy | quick yes/no checks |
| `assert.throws(fn, expected)` | calling `fn` throws the expected error | code that should refuse bad input |
| `await assert.rejects(promise, expected)` | the promise rejects with the expected error | async code that should fail |

Why two kinds of "equal"? Remember from [chapter 16](../16-values-vs-references/notes.md) that `===` compares arrays and objects by reference. Two separate arrays with the same items are *not* `===`. `deepEqual` looks inside and compares the contents.

### Edge cases

An **edge case** is an unusual input at the very edge of what your code should handle. It's where bugs love to hide. For each function, ask yourself:

- What about **empty** things? An empty array, an empty string, an empty cart.
- What about **zero**, **negative** numbers, and very **big** numbers?
- What about values **exactly on a boundary**? If shipping is free "from $50", test $49.99, $50, and $50.01.
- What about **missing or wrong** input? `undefined`, `null`, or `"fifty"` where you expected `50`.

`withdraw(100, 100)` above is an edge case: taking out *exactly* everything. It's easy to write `amount >= balance` by mistake and refuse it.

You don't need a test for every number in the world. Pick one normal case, then the edges.

### Testing errors

Refusing bad input is part of a function's job, so test it too. `assert.throws` takes a **function** to call, and passes only if calling it throws the error you describe:

```js
// bank-errors.test.js
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { withdraw } from "./bank.js";

describe("withdraw refuses bad requests", () => {
  it("refuses to go below zero", () => {
    assert.throws(() => withdraw(100, 500), {
      name: "Error",
      message: "Not enough money",
    });
  });

  it("refuses negative amounts", () => {
    assert.throws(() => withdraw(100, -5), RangeError);
  });

  it("refuses amounts that aren't numbers", () => {
    assert.throws(() => withdraw(100, "fifty"), /must be a number/);
  });
});
```

The second argument describes the error you expect. There are three handy ways to write it:

| You pass... | It checks that... |
|---|---|
| An object, like `{ name: "Error", message: "Not enough money" }` | the error has exactly those properties |
| An error type, like `RangeError` | the error is that kind of error |
| A regular expression, like `/must be a number/` | the message matches the pattern ([chapter 37](../37-regular-expressions/notes.md)) |

Notice the `() =>` in front of each call. You're handing `assert.throws` a function *to* call, so it can catch the error itself. Forgetting the arrow is a classic mistake (see Common mistakes).

### Testing async code

What about code that waits, like the async functions from [chapter 32](../32-async-await/notes.md)? Make the test function `async`, and `await` inside it. The test runner waits for it to finish.

Here's a pretend library catalog that takes a moment to answer:

```js
// catalog.js
const books = {
  "978-0261103344": { title: "The Hobbit", author: "J.R.R. Tolkien" },
  "978-0441172719": { title: "Dune", author: "Frank Herbert" },
};

export async function findBook(isbn) {
  // Pretend we're asking a server, which takes a moment
  await new Promise((resolve) => setTimeout(resolve, 50));
  const book = books[isbn];
  if (!book) {
    throw new Error(`No book with ISBN ${isbn}`);
  }
  return book;
}
```

```js
// catalog.test.js
import { test } from "node:test";
import assert from "node:assert/strict";
import { findBook } from "./catalog.js";

test("finds a book by its ISBN", async () => {
  const book = await findBook("978-0261103344");
  assert.equal(book.title, "The Hobbit");
});

test("rejects an unknown ISBN", async () => {
  await assert.rejects(findBook("000"), {
    message: "No book with ISBN 000",
  });
});
```

`assert.rejects` is the async version of `assert.throws`. It returns a promise, so it needs its own `await`, or the test finishes before the check happens.

### Fakes with `mock.fn()`

Some code does things you don't want in a test: sending an email, charging a card, talking to a server. You can't send a real receipt every time you run your tests.

The trick is to pass that job into your function as a parameter. Then, in the test, hand it a **mock**: a fake function that does nothing except remember how it was called.

```js
// checkout.js
export function checkout(cart, sendReceipt) {
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  if (total > 0) {
    sendReceipt(`Thanks! You paid $${total}`);
  }
  return total;
}
```

```js
// checkout.test.js
import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { checkout } from "./checkout.js";

test("sends one receipt with the total", () => {
  const sendReceipt = mock.fn(); // a fake that remembers every call

  checkout([{ price: 12 }, { price: 8 }], sendReceipt);

  assert.equal(sendReceipt.mock.callCount(), 1);
  assert.deepEqual(sendReceipt.mock.calls[0].arguments, ["Thanks! You paid $20"]);
});

test("sends no receipt for an empty cart", () => {
  const sendReceipt = mock.fn();
  checkout([], sendReceipt);
  assert.equal(sendReceipt.mock.callCount(), 0);
});
```

- `mock.fn()` makes the fake. `sendReceipt.mock.callCount()` tells you how many times it was called.
- `sendReceipt.mock.calls[0].arguments` is an array of the arguments from the first call.
- If the fake needs to give something back, pass it a function: `mock.fn(() => 0.2)` returns `0.2` every time it's called.

In the real app, you'd call `checkout(cart, sendEmail)` with a function that really sends emails. Passing a job into a function like this also makes code more flexible, just like the strategies in [chapter 44](../44-design-patterns/notes.md).

### Red, green, refactor

So far, you've written the code first and the tests after. **Test-driven development** (TDD) flips that around. You work in small loops of three steps:

1. **Red:** write a test for something your code can't do yet. Run it and watch it fail.
2. **Green:** write the *simplest* code that makes it pass.
3. **Refactor:** tidy up the code (chapter 45), while the tests make sure nothing breaks.

Let's try one loop for a music player that shows track lengths like `1:05`. First the test, in `track.test.js`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { formatTrackTime } from "./track.js";

test("formats 65 seconds as 1:05", () => {
  assert.equal(formatTrackTime(65), "1:05");
});
```

**Red.** Create `track.js` with an empty function, `export function formatTrackTime(seconds) {}`, and run `node --test`. It fails, as it should. For strings, the failure shows a small "diff": a line starting with `+` for what your code gave (`+ undefined`), and a line starting with `-` for what the test expected (`- '1:05'`).

**Green.** Now the simplest code that passes:

```js
export function formatTrackTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}
```

Run it again: a green tick. Next, add tests for the edges: `600` should be `"10:00"`, `9` should be `"0:09"`, and a track that's `125.6` seconds long should round to `"2:06"`. Run them, and the last one goes red:

```
✖ rounds to the nearest second (1.6563ms)
  AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
  + actual - expected

  + '2:5.599999999999994'
  - '2:06'
       ^
```

The `^` points at the first character that's different. And there's the decimal surprise from chapter 05: `125.6 % 60` isn't exactly `5.6`. Round first, and it goes green. Then **refactor**, with clearer names and no magic number:

```js
const SECONDS_PER_MINUTE = 60;

export function formatTrackTime(seconds) {
  const totalSeconds = Math.round(seconds);
  const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
  const remainingSeconds = totalSeconds % SECONDS_PER_MINUTE;
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}
```

All four tests still pass, so you know the tidy-up didn't break anything. That's the loop: red, green, refactor, and repeat.

Why write the test first? Because it makes you decide exactly what the code should do before you write it. And you *see* the test fail, so you know it can really catch a problem. You don't have to use TDD for everything, but it's a great way to build tricky logic.

### Coverage: which lines did your tests run?

**Coverage** tells you which lines of your code were run by your tests, and which weren't. Node can measure it with a flag:

```
node --test --experimental-test-coverage
```

Say `bank.test.js` only tested a normal withdrawal and the "not enough money" error. You'd see this at the end of the output:

```
ℹ start of coverage report
ℹ ----------------------------------------------------------
ℹ file      | line % | branch % | funcs % | uncovered lines
ℹ ----------------------------------------------------------
ℹ bank.js   |  66.67 |    60.00 |  100.00 | 3-4 6-7
ℹ ----------------------------------------------------------
ℹ all files |  66.67 |    60.00 |  100.00 | 
ℹ ----------------------------------------------------------
ℹ end of coverage report
```

- **line %:** how many lines ran at least once.
- **branch %:** how many paths through your `if`s were taken. An `if` has two paths: the condition was true, or it was false.
- **funcs %:** how many functions were called.
- **uncovered lines:** the lines no test ever ran. Lines 3–4 and 6–7 of `bank.js` are the "not a number" and "not above 0" errors, so those rules have no tests yet.

The test files themselves are left out of the report. "Experimental" means the feature is still being worked on, so the output may look a little different in future Node versions.

> **Watch out:** 100% coverage doesn't mean bug-free. It only means every line *ran*, not that every result was *checked*. Use coverage to find the parts you forgot to test, not as a score to chase.

### What to test (and what not to)

**Do test:**

- Your own logic: calculations, rules, and decisions (prices, discounts, grades, "can this member borrow a book?").
- Edge cases and bad input.
- Every bug you fix. Write a test that fails because of the bug, then fix it. The bug can never quietly come back.

**Don't bother testing:**

- Other people's code. JavaScript's `Math.round` and well-known libraries already have their own tests.
- Code with no logic at all, like a function that only returns a fixed value.
- *How* a function does its job on the inside. Test what goes in and what comes out, so you're free to refactor the inside.

And keep each test **independent**: it sets up its own data and doesn't rely on another test running first. That's another reason to avoid shared state, like the singletons in chapter 44.

### Other test tools

Node's built-in runner is a great place to start. Many projects use **Vitest** or **Jest** instead: popular test tools you install with npm ([chapter 50](../50-tooling/notes.md)). They use the same `describe` and `it` idea, with a slightly different way of writing checks:

```js
expect(addTax(50, 0.2)).toBe(60); // Vitest and Jest style
```

There are also tools like Playwright and Cypress that test whole web pages by clicking buttons like a real user. Whatever tool you use later, the ideas from this chapter carry straight over.

## Common mistakes

**1. A test file that never runs**

```
cart.js
cartTests.js    <- your tests are in here
package.json
```

You run `node --test` and get:

```
ℹ tests 0
ℹ suites 0
ℹ pass 0
ℹ fail 0
...
```

No errors and no failures, so it looks fine. But zero tests ran, because `cartTests.js` doesn't match any of the name patterns. Rename it to `cart.test.js`. Always glance at the `tests` count to check that your tests really ran.

**2. Using `equal` for arrays and objects**

```js
test("builds a user", () => {
  assert.equal({ name: "Mia" }, { name: "Mia" });
});
// AssertionError [ERR_ASSERTION]: Values have same structure but are not reference-equal:
```

The two objects look the same, but they're two different objects, and `equal` compares like `===`. Use `assert.deepEqual` to compare what's *inside* arrays and objects.

**3. Calling the function inside `assert.throws`**

```js
test("refuses to go below zero", () => {
  assert.throws(withdraw(100, 500), { message: "Not enough money" });
});
// Error: Not enough money
```

The test fails with the very error it was meant to expect. `withdraw(100, 500)` runs *before* `assert.throws` even starts, so the error flies straight out of the test. Pass a function instead, so `assert.throws` can call it and catch the error: `assert.throws(() => withdraw(100, 500), ...)`.

**4. Forgetting `await` in an async test**

```js
test("rejects an unknown ISBN", () => {
  assert.rejects(findBook("978-0261103344"), { message: "No book with ISBN 000" });
});
```

This ISBN exists, so `findBook` doesn't reject, and the test *should* fail. Put it in a file called `noawait.test.js` (with the usual imports at the top) and run it. Instead of a clear failure, you get a confusing mix: a green tick for the test, then a failure for the whole file:

```
✔ rejects an unknown ISBN (0.9089ms)
ℹ Error: Test "rejects an unknown ISBN" at noawait.test.js:5:1 generated asynchronous activity after the test ended. ...
✖ noawait.test.js (306.1462ms)
```

Without `await`, the test finished before the check did. The fix: make the test `async` and write `await assert.rejects(...)`. The same goes for any async function you call in a test: `await` it.

**5. Tests that depend on each other**

```js
const cart = []; // shared by every test in this file

test("adds the first item", () => {
  cart.push("apple");
  assert.equal(cart.length, 1);
});

test("adds a second item", () => {
  cart.push("pear");
  assert.equal(cart.length, 2);
});
```

Both pass when you run the whole file. But run only the second one, with `node --test --test-name-pattern="second"`, and it fails with `1 !== 2`. It was secretly relying on the first test's apple. Each test should build its own data: move `const cart = [];` inside each test.

## Quick recap

- A test is code that checks your code. Automated tests catch bugs early, make refactoring safe, and stop fixed bugs from coming back.
- Node has a test runner built in: `import { test } from "node:test"` and `import assert from "node:assert/strict"`, in a folder whose `package.json` has `"type": "module"`.
- Run `node --test`. It finds files like `name.test.js` and anything in a `test` folder. Read failures from the top: which test, what was expected, and which line.
- Structure each test as arrange, act, assert. Test the normal case and the edge cases.
- Use `equal` for simple values, `deepEqual` for arrays and objects, `assert.throws(() => ...)` for errors, and `await assert.rejects(...)` in `async` tests.
- `mock.fn()` makes a fake that records its calls. `--experimental-test-coverage` shows which lines your tests never ran.
- TDD is a loop: red (a failing test), green (the simplest code that passes), then refactor.

---

**Next:** try the [exercises](exercises.md), then move on to [47 Debugging](../47-debugging/notes.md).
