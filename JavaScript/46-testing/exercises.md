# 46 Testing: Exercises

**How to do these:**

- Give each exercise its own folder inside this chapter's folder (`ex1`, `ex2`, and so on). `node --test` searches the whole folder it runs in, so separate folders keep each exercise's tests apart.
- In each exercise folder, add a `package.json` containing `{ "type": "module" }` (you need it for `import` and `export`, as in [chapter 29](../29-modules/notes.md)). Then put the code file and its `.test.js` file next to it.
- Open a terminal in the exercise folder and run `node --test`.
- The times in brackets, like `(0.6ms)`, will be different on your computer. Everything else should match.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Weather station

A weather station's app has two small helpers. Save them as `weather.js`:

```js
export function celsiusToFahrenheit(celsius) {
  return (celsius * 9) / 5 + 32;
}

export function isFreezing(celsius) {
  return celsius <= 0;
}
```

Write `weather.test.js` with four tests, using exactly these names:

1. `converts 100°C to 212°F`
2. `converts -40°C to -40°F` (the one temperature where both scales agree!)
3. `says 0°C is freezing`
4. `says 5°C is not freezing`

Expected output:

```
✔ converts 100°C to 212°F (1.2721ms)
✔ converts -40°C to -40°F (0.3768ms)
✔ says 0°C is freezing (0.192ms)
✔ says 5°C is not freezing (0.1673ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 297.3724
```

Now **break the code on purpose**, to check that your tests can catch a bug: in `isFreezing`, change `<=` to `<` and run the tests again. Exactly one test should fail:

```
✖ says 0°C is freezing (1.4286ms)
...
  AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

  false !== true
```

Change it back when you're done. A test you've never seen fail is a test you can't fully trust.

<details>
<summary>Hint 1</summary>

Start from the `prices.test.js` example in the notes: one `import` line for `test`, one for `assert`, and one for your own functions. You can import both functions in one line: `import { celsiusToFahrenheit, isFreezing } from "./weather.js";`

</details>

<details>
<summary>Hint 2</summary>

`isFreezing` returns `true` or `false`, so compare its result with `assert.equal(..., true)` or `assert.equal(..., false)`.

</details>

---

## Exercise 2 (Easy): The shipping bug

An online shop promises these shipping prices on its website:

| Order total | Shipping |
|---|---|
| Under $20 | $4.99 |
| From $20 up to $49.99 | $2.99 |
| $50 or more | Free |

Here's the code that's supposed to follow those rules. Save it as `shipping.js`, and **don't fix anything yet**, even if you spot a problem:

```js
export function shippingCost(orderTotal) {
  if (orderTotal > 50) {
    return 0;
  }
  if (orderTotal > 20) {
    return 2.99;
  }
  return 4.99;
}
```

Write `shipping.test.js` with six tests, based on the table, not on the code:

1. `charges $4.99 for a $10 order`
2. `charges $4.99 for a $19.99 order`
3. `charges $2.99 for a $20 order`
4. `charges $2.99 for a $49.99 order`
5. `ships a $50 order for free`
6. `ships an $80 order for free`

Run them. You should see two failures:

```
✔ charges $4.99 for a $10 order (1.6334ms)
✔ charges $4.99 for a $19.99 order (0.2781ms)
✖ charges $2.99 for a $20 order (1.581ms)
✔ charges $2.99 for a $49.99 order (0.3555ms)
✖ ships a $50 order for free (0.4045ms)
✔ ships an $80 order for free (0.2168ms)
ℹ tests 6
ℹ suites 0
ℹ pass 4
ℹ fail 2
```

Read the "failing tests" part of the output to see what each wrong answer was. Then fix `shippingCost` so all six pass (`ℹ pass 6`, `ℹ fail 0`).

<details>
<summary>Hint 1</summary>

Both failures are exactly on a boundary: $20 and $50. The table says "$50 or more". Which comparison operator means "or more"?

</details>

<details>
<summary>Hint 2</summary>

Notice that the normal cases ($10, $80) passed even with the bug. Edge cases found it. That's why the notes say to test exactly on the boundaries.

</details>

---

## Exercise 3 (Medium): Username rules

A game's sign-up form cleans up usernames and refuses bad ones. Save this as `username.js`:

```js
export function cleanUsername(input) {
  if (typeof input !== "string") {
    throw new TypeError("Username must be text");
  }
  const name = input.trim().toLowerCase();
  if (name.length < 3 || name.length > 15) {
    throw new RangeError("Username must be 3 to 15 characters");
  }
  if (name.includes(" ")) {
    throw new Error("Username can't contain spaces");
  }
  return name;
}
```

In `username.test.js`, write a `describe("cleanUsername", ...)` group with these eight tests. Choose your own test values, except where one is given:

1. `trims and lowercases a valid name` (use `"  SkyWalker "`)
2. `accepts exactly 3 characters`
3. `accepts exactly 15 characters`
4. `refuses anything that isn't text` (use the number `42`)
5. `refuses names that are too short` (use `"al"`)
6. `refuses names that are too long`
7. `refuses spaces in the middle`
8. `checks the length after trimming` (use `"  ab  "`: it's 6 characters long, but only 2 after trimming)

Expected output:

```
▶ cleanUsername
  ✔ trims and lowercases a valid name (1.9361ms)
  ✔ accepts exactly 3 characters (0.1945ms)
  ✔ accepts exactly 15 characters (0.1289ms)
  ✔ refuses anything that isn't text (0.465ms)
  ✔ refuses names that are too short (0.5325ms)
  ✔ refuses names that are too long (0.1789ms)
  ✔ refuses spaces in the middle (0.1492ms)
  ✔ checks the length after trimming (0.1456ms)
✔ cleanUsername (4.941ms)
ℹ tests 8
ℹ suites 1
ℹ pass 8
ℹ fail 0
```

**Rule:** use each of the three ways to describe an expected error at least once: an object with `name` and/or `message`, an error type like `RangeError`, and a regular expression.

When they all pass, weaken one rule on purpose: change `name.length < 3` to `name.length < 2`. Which of your tests fail now? You should see two of them, each with a message starting `Missing expected exception` (the rest depends on how you described the error). Then change it back.

<details>
<summary>Hint 1</summary>

For tests 2 and 3, make up names that are *exactly* 3 and 15 characters long, and check what `cleanUsername` returns. `"abcdefghijklmno"` is 15 characters, if you don't want to count.

</details>

<details>
<summary>Hint 2</summary>

Every error test needs the arrow: `assert.throws(() => cleanUsername(42), TypeError);` Without `() =>`, the error escapes before `assert.throws` can catch it.

</details>

---

## Exercise 4 (Medium): Coffee order with a fake card machine

A coffee shop's app charges customers through a payment service. You don't want to charge a real card every time you run your tests, so you'll hand the code a fake one.

Save this as `orders.js`:

```js
export async function placeOrder(items, payments) {
  if (items.length === 0) {
    throw new Error("Your order is empty");
  }
  const total = items.reduce((sum, item) => sum + item.price, 0);
  try {
    const receipt = await payments.charge(total);
    return `Paid $${total.toFixed(2)} (receipt ${receipt.id})`;
  } catch (error) {
    throw new Error(`Payment failed: ${error.message}`, { cause: error });
  }
}
```

`payments` is an object with a `charge(amount)` method. In the real app, it talks to the bank and resolves with a receipt like `{ id: "R-1001" }`. In your tests, `charge` will be a mock.

Start `orders.test.js` with this test data:

```js
const coffee = { name: "Flat white", price: 3.5 };
const muffin = { name: "Blueberry muffin", price: 4 };
```

Then write a `describe("placeOrder", ...)` group with three tests:

1. `charges the card once, with the total`: ordering the coffee and the muffin returns `"Paid $7.50 (receipt R-1001)"`, and `charge` was called exactly once, with `7.5`.
2. `explains why a payment failed`: when `charge` rejects with an error saying `Card declined`, `placeOrder` rejects with the message `Payment failed: Card declined`.
3. `refuses an empty order without charging`: an empty order rejects with `Your order is empty`, and `charge` was never called.

Expected output:

```
▶ placeOrder
  ✔ charges the card once, with the total (2.1386ms)
  ✔ explains why a payment failed (0.8516ms)
  ✔ refuses an empty order without charging (0.3044ms)
✔ placeOrder (5.5439ms)
ℹ tests 3
ℹ suites 1
ℹ pass 3
ℹ fail 0
```

<details>
<summary>Hint 1</summary>

`placeOrder` calls `payments.charge(...)`, so pass it an object that has a `charge` property: `placeOrder([coffee, muffin], { charge })`, where `charge` is your mock. To make the mock behave like the real service, give it an async function: `mock.fn(async () => ({ id: "R-1001" }))`.

</details>

<details>
<summary>Hint 2</summary>

For test 2, the mock's function can `throw` inside an `async` function, which makes the promise reject. All three tests are `async`, and every `assert.rejects` needs an `await` in front of it.

</details>

<details>
<summary>Hint 3</summary>

`placeOrder` is `async`, so even the "empty order" error comes out as a rejected promise, not a thrown error. That's why test 3 uses `assert.rejects`, not `assert.throws`.

</details>

---

## Exercise 5 (Challenge): Test-drive a playlist

Build a `Playlist` class ([chapter 27](../27-classes/notes.md)) for a music app, **test first**. This time there's no code to start from: you write each test, watch it fail, then write just enough code to make it pass.

Songs are plain objects like `{ title: "Heroes", seconds: 371 }`. Start `playlist.test.js` with these three songs:

```js
const dancingQueen = { title: "Dancing Queen", seconds: 231 };
const hereComesTheSun = { title: "Here Comes the Sun", seconds: 185 };
const heroes = { title: "Heroes", seconds: 371 };
```

Here's what a `Playlist` must do. Each line is one test, inside a `describe("Playlist", ...)` group. Use exactly these test names:

| Test name | What it checks |
|---|---|
| `starts empty` | `new Playlist("Road Trip").songCount` is `0` |
| `adds songs` | after `add`ing two songs, `songCount` is `2` |
| `refuses the same song twice` | adding a song with the same title again throws `Song already in playlist: Dancing Queen` |
| `adds up the total length` | with Dancing Queen and Here Comes the Sun, `totalLength` is `"6:56"` |
| `plays songs in order and wraps around` | with Dancing Queen and Heroes, calling `next()` three times gives `"Dancing Queen"`, `"Heroes"`, `"Dancing Queen"` |
| `removes a song by its title` | after `remove("Dancing Queen")`, `songCount` goes down by one |
| `refuses to remove a song that isn't there` | `remove("Heroes")` on an empty playlist throws `Song not found: Heroes` |
| `has nothing to play when it's empty` | `next()` on an empty playlist returns `null` |

Work through the table one row at a time: **red** (write the test and see it fail), **green** (make it pass with the simplest code), **refactor** (tidy up, and run again). Keep the songs private with a `#songs` field, and make `songCount` and `totalLength` getters.

When all eight pass, run the tests with coverage:

```
node --test --experimental-test-coverage
```

Expected output (the coverage table is at the end):

```
▶ Playlist
  ✔ starts empty (1.1618ms)
  ✔ adds songs (0.3063ms)
  ✔ refuses the same song twice (1.1869ms)
  ✔ adds up the total length (0.2586ms)
  ✔ plays songs in order and wraps around (0.8402ms)
  ✔ removes a song by its title (0.2772ms)
  ✔ refuses to remove a song that isn't there (0.2335ms)
  ✔ has nothing to play when it's empty (0.1582ms)
✔ Playlist (6.0955ms)
ℹ tests 8
ℹ suites 1
ℹ pass 8
ℹ fail 0
...
ℹ file        | line % | branch % | funcs % | uncovered lines
ℹ ------------------------------------------------------------
ℹ playlist.js | 100.00 |   100.00 |  100.00 | 
```

If your coverage isn't 100%, look at the uncovered lines. Either they need a test, or they're code you don't need yet (YAGNI, [chapter 45](../45-clean-code/notes.md)).

<details>
<summary>Hint 1</summary>

For the very first red step, `playlist.js` can be just `export class Playlist {}`. The test fails because `songCount` is `undefined`, which is exactly the red you want. Then add the smallest getter that makes it green.

</details>

<details>
<summary>Hint 2</summary>

Each test should create its own `new Playlist(...)`, so no test depends on another (Common mistake 5 in the notes). For the total length, the `formatTrackTime` function from the notes does the formatting you need.

</details>

<details>
<summary>Hint 3</summary>

For `next()`, keep a private position counter that goes up by one each time. The remainder operator `%` from [chapter 04](../04-operators/notes.md) turns "position 2 in a list of 2 songs" back into position 0, which is the wrap-around.

</details>

---

## Before you move on

Tests tell you *that* something is broken, and roughly where. But when a test fails and you stare at the code and still can't see why, what do you do next?

[Chapter 47](../47-debugging/notes.md) is all about that: finding bugs like a detective, with the tools that pause your code and let you look inside it. 🔍
