# 31 Promises

## What is it?

A **promise** is an object that stands in for a value you don't have yet. It's JavaScript's way of saying "I'll give you the result later, or tell you why I couldn't".

Promises replace the callback pyramids from [chapter 30](../30-timers-and-callbacks/notes.md) with neat, flat chains.

## Why does it matter?

In chapter 30, waiting for several things in a row turned into callback hell: the code drifted to the right, and every level needed its own error check. Promises fix that:

- Steps that wait for each other become a flat list, top to bottom.
- One `.catch` at the end handles an error from any step.
- Built-in tools wait for several things at once ("tell me when all three orders are ready").

Promises are everywhere in modern JavaScript. `fetch` ([chapter 33](../33-fetch-and-apis/notes.md)) returns one, and so do most tools for files and databases. And `async`/`await` ([chapter 32](../32-async-await/notes.md)) is built on top of them. Learn promises well, and the next two chapters get much easier.

## Real-world example

Some restaurants give you a buzzer when you order. You don't have your food yet, but you have something that will tell you when it's ready.

| Restaurant buzzer | Promise |
|---|---|
| You order and get a buzzer | You call a function and get a promise back |
| You wait and chat, buzzer on the table | The promise is **pending**, and your other code keeps running |
| It buzzes: "your food is ready!" | The promise is **fulfilled**, with a value (your burger) |
| Staff come over: "sorry, we're out of burgers" | The promise is **rejected**, with a reason (an error) |
| Once it has buzzed, it's over | A **settled** promise (fulfilled or rejected) never changes again |

The buzzer is the key idea. You get it straight away, even though the food comes later. And you can decide ahead of time what to do when it buzzes ("eat") and what to do if things go wrong ("order something else").

## How it works

### Creating a promise

You make a promise with `new Promise(...)`. You give it a function, and JavaScript runs that function straight away. It receives two tools:

- `resolve(value)`: call it when the work succeeded, with the result.
- `reject(error)`: call it when the work failed, with an error.

```js
const order = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("burger and fries");
  }, 2000);
});

console.log(order); // prints: Promise { <pending> }
```

This is a pretend kitchen: a timer from chapter 30 stands in for the cooking. When the timer goes off, `resolve` hands over the food.

Printing the promise straight away shows `Promise { <pending> }`, because the food isn't ready yet. If you printed it again after 2 seconds, you'd see `Promise { 'burger and fries' }`.

### `.then`: when the value is ready

To use the value, pass a callback to `.then`. It runs when the promise is fulfilled, and it receives the value. Add this below the code above:

```js
order.then((food) => {
  console.log(`Enjoy your ${food}!`);
});
// prints (after about 2 seconds): Enjoy your burger and fries!
```

Think of `.then` as telling the buzzer "when you buzz, do this".

### `reject` and `.catch`: when something goes wrong

Real work fails sometimes. Here's a function that returns a promise, and rejects it if the item isn't on the menu:

```js
const menu = ["burger", "salad", "soup"];

function orderFood(item) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!menu.includes(item)) {
        reject(new Error(`Sorry, we don't have ${item} today`));
        return;
      }
      resolve(item);
    }, 1000);
  });
}
```

`.catch` handles the rejection:

```js
orderFood("pizza")
  .then((food) => console.log(`Enjoy your ${food}!`))
  .catch((error) => console.log("Problem:", error.message));
// prints (after about 1 second): Problem: Sorry, we don't have pizza today
```

Change `"pizza"` to `"burger"`, and you'll see `Enjoy your burger!` instead.

A few things to notice:

- Always reject with an `Error` object, like the ones you threw in [chapter 18](../18-error-handling/notes.md). Then you get a `message` and a stack trace.
- The `return` after `reject` stops the function there, just like with chapter 30's error-first callbacks.
- `orderFood` *returns* the promise. That's the usual pattern: a function that does slow work hands you a promise straight away.

Most examples from here on use this `orderFood` function, so keep it at the top of your practice file.

### `.finally`: runs either way

`.finally` runs when the promise settles, whether it was fulfilled or rejected. It's for cleaning up, like handing the buzzer back, or hiding a "Loading..." message on a web page.

```js
orderFood("salad")
  .then((food) => console.log(`Enjoy your ${food}!`))
  .catch((error) => console.log("Problem:", error.message))
  .finally(() => console.log("Buzzer handed back"));
```

You'll see:

```
Enjoy your salad!
Buzzer handed back
```

With `"pizza"`, you'd see the "Problem" line instead, followed by `Buzzer handed back` all the same.

### A promise settles only once

Once a promise is fulfilled or rejected, that's final. Any later call to `resolve` or `reject` is ignored:

```js
const coinFlip = new Promise((resolve, reject) => {
  resolve("heads");
  resolve("tails");             // ignored
  reject(new Error("Dropped")); // ignored
});

coinFlip.then((side) => console.log(side)); // prints: heads
```

That's a nice safety feature. A promise can never "call you back" twice by accident.

### `wait(ms)`: a timer as a promise

Here's a tiny helper you'll use a lot in the next chapters. It turns `setTimeout` into a promise:

```js
function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

wait(1000).then(() => console.log("One second later"));
```

When the time is up, `setTimeout` calls `resolve`, and that fulfills the promise. A timer can't fail, so this one doesn't need `reject`.

### Chaining: one step after another

Here's the best part. `.then` always returns a *new* promise, so you can add another `.then` after it. Whatever your callback returns is passed on to the next step.

If you return a promise, the next step waits for it. That's how you do things in order:

```js
wait(500)
  .then(() => {
    console.log("Dough ready");
    return wait(500); // the next step waits for this
  })
  .then(() => {
    console.log("Pizza baked");
    return wait(500);
  })
  .then(() => {
    console.log("Pizza delivered. Enjoy!");
  });
```

You'll see one line about every half a second:

```
Dough ready
Pizza baked
Pizza delivered. Enjoy!
```

Compare this with the pizza pyramid in chapter 30. Same steps, but the code grows *down* instead of *right*.

If you return a plain value, the next step gets it straight away:

```js
orderFood("burger")
  .then((food) => `${food} with extra cheese`)
  .then((meal) => `${meal} and a drink`)
  .then((meal) => console.log(`Your order: ${meal}`));
// prints: Your order: burger with extra cheese and a drink
```

Each arrow function returns its string automatically (the implicit return from [chapter 09](../09-functions/notes.md)), and each step passes it on to the next.

### Errors skip ahead to `.catch`

When a promise in a chain rejects, JavaScript skips every `.then` after it and jumps to the next `.catch`. It's like `try`/`catch`, but for code that waits.

```js
orderFood("pizza")
  .then((food) => {
    console.log(`Cooking the ${food}`); // skipped
    return food;
  })
  .then((food) => console.log(`Serving the ${food}`)) // skipped
  .catch((error) => console.log("Problem:", error.message))
  .then(() => console.log("Next customer, please!"));
```

You'll see:

```
Problem: Sorry, we don't have pizza today
Next customer, please!
```

Two things to notice:

- One `.catch` at the end covers every step before it. No more error checks at every level.
- Once `.catch` has handled the error, the chain carries on as normal. That's why "Next customer, please!" still prints.

Throwing an error inside a `.then` works the same way. Remember how, in chapter 30, `try`/`catch` couldn't catch an error thrown inside a timer? Promises fix that:

```js
wait(500)
  .then(() => {
    throw new Error("The oven broke!");
  })
  .then(() => console.log("Pizza baked")) // skipped
  .catch((error) => console.log("Problem:", error.message));
// prints: Problem: The oven broke!
```

### `Promise.resolve` and `Promise.reject`: ready-made promises

Sometimes you already have the answer, but your function always returns a promise. `Promise.resolve(value)` makes a promise that's already fulfilled with that value. `Promise.reject(error)` makes one that's already rejected.

Here's a weather app that remembers forecasts it has already looked up:

```js
const savedForecasts = { London: "12°C and cloudy" };

function getForecast(city) {
  if (savedForecasts[city] !== undefined) {
    return Promise.resolve(savedForecasts[city]); // no need to wait
  }
  return wait(1000).then(() => "25°C and sunny"); // pretend to ask a server
}

getForecast("London").then((forecast) => console.log("London:", forecast));
getForecast("Rome").then((forecast) => console.log("Rome:", forecast));
```

You'll see:

```
London: 12°C and cloudy
Rome: 25°C and sunny
```

London appears straight away, and Rome about a second later. Either way, the code that calls `getForecast` can always use `.then`, without caring whether the answer was saved or fetched.

### Waiting for several promises at once

So far, you've waited for one thing at a time. But often you start several things together. At a food court, you might order pizza, salad and soup from three different counters at once. Promises come with four tools for this.

The examples use a small helper that "cooks" a dish in a given time:

```js
function cook(dish, ms) {
  return wait(ms).then(() => dish);
}
```

#### `Promise.all`: wait for all of them

`Promise.all` takes an array of promises. It fulfills when *all* of them are fulfilled, with an array of their values.

```js
const start = Date.now();

Promise.all([cook("pizza", 3000), cook("salad", 1000), cook("soup", 2000)])
  .then((dishes) => {
    console.log(dishes);
    console.log(`Served after about ${Math.round((Date.now() - start) / 1000)} seconds`);
  });
```

You'll see:

```
[ 'pizza', 'salad', 'soup' ]
Served after about 3 seconds
```

- The three dishes cook at the same time, so it takes about 3 seconds (as long as the slowest one), not 6.
- The values come back in the same order as your array, not in the order they finished.
- If *any* promise rejects, `Promise.all` rejects with that error. One missing dish, and the whole order fails:

```js
Promise.all([orderFood("burger"), orderFood("pizza"), orderFood("soup")])
  .then((meals) => console.log("All here:", meals))
  .catch((error) => console.log("Problem:", error.message));
// prints: Problem: Sorry, we don't have pizza today
```

#### `Promise.allSettled`: wait for all, keep every result

Sometimes you want every result, good or bad. `Promise.allSettled` waits until all of them have settled, and it never rejects. Each result is an object with a `status`: either `"fulfilled"` (with a `value`) or `"rejected"` (with a `reason`, the error).

```js
Promise.allSettled([orderFood("burger"), orderFood("pizza"), orderFood("soup")])
  .then((results) => {
    for (const result of results) {
      if (result.status === "fulfilled") {
        console.log("Served:", result.value);
      } else {
        console.log("Failed:", result.reason.message);
      }
    }
  });
```

You'll see:

```
Served: burger
Failed: Sorry, we don't have pizza today
Served: soup
```

#### `Promise.race`: the first one to finish wins

`Promise.race` settles as soon as the *first* promise settles, fulfilled or rejected. Its classic use is a time limit: race your real work against a timer that rejects.

```js
function timeout(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error(`Gave up after ${ms / 1000} seconds`));
    }, ms);
  });
}

Promise.race([cook("pizza", 3000), timeout(2000)])
  .then((dish) => console.log("Served:", dish))
  .catch((error) => console.log("Problem:", error.message));
// prints (after about 2 seconds): Problem: Gave up after 2 seconds
```

The pizza takes 3 seconds, so the 2-second timer wins. Try `cook("salad", 1000)` instead, and you'll see `Served: salad`.

The loser isn't stopped, though. The pizza keeps cooking in the background, and `race` just stops listening to it. That's why this program only exits after about 3 seconds. You'll learn to truly cancel work in [chapter 33](../33-fetch-and-apis/notes.md).

#### `Promise.any`: the first one to succeed

`Promise.any` fulfills with the first promise that *succeeds*, and ignores failures along the way. Think of calling three taxi companies at once and taking whichever says yes first:

```js
function askTaxi(company, ms, available) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (available) {
        resolve(`${company} is on the way`);
      } else {
        reject(new Error(`${company} has no drivers`));
      }
    }, ms);
  });
}

Promise.any([
  askTaxi("City Cabs", 1000, false),
  askTaxi("Quick Rides", 2000, true),
  askTaxi("Night Owl Taxis", 3000, true),
])
  .then((answer) => console.log(answer))
  .catch((error) => console.log(error.message));
// prints (after about 2 seconds): Quick Rides is on the way
```

City Cabs answered first, but it said no, so `any` kept waiting. If *every* promise fails, `Promise.any` rejects with an `AggregateError`. Its message is `All promises were rejected`, and its `errors` property is an array holding each separate error.

#### Which one do I need?

| Method | Waits for | Gives you | Rejects when |
|---|---|---|---|
| `Promise.all` | all of them to succeed | an array of values | any one fails |
| `Promise.allSettled` | all of them to finish | an array of `{ status, value }` or `{ status, reason }` objects | never |
| `Promise.race` | the first one to finish | that one's value (or its error) | the first one to finish failed |
| `Promise.any` | the first one to succeed | that one's value | all of them fail |

## Common mistakes

**1. Forgetting to `return` inside `.then`**

```js
wait(500)
  .then(() => {
    console.log("Dough ready");
    wait(2000); // forgot "return"
  })
  .then(() => {
    console.log("Pizza baked"); // prints straight away, not 2 seconds later!
  });
```

Without `return`, the next `.then` doesn't know there's anything to wait for, so it runs straight away. The same goes for values: if a step with curly braces `{ }` forgets to `return`, the next step receives `undefined`. Fix: `return wait(2000);`.

**2. Nesting instead of chaining**

```js
wait(500).then(() => {
  console.log("Dough ready");
  wait(500).then(() => {
    console.log("Pizza baked");
    wait(500).then(() => {
      console.log("Pizza delivered");
    });
  });
});
```

This works, but it's the callback pyramid again, just with promises. Worse, a `.catch` on the outside can't see errors from the inner promises, because they were never returned. Fix: `return` each promise and put the `.then`s one below the other, like in "Chaining" above.

**3. Forgetting `.catch`**

```js
orderFood("pizza").then((food) => console.log(`Enjoy your ${food}!`));
```

A rejected promise with no `.catch` is an **unhandled rejection**. Node prints the error and stops your whole program with an error code, even if other timers were still waiting:

```
C:\...\practice.js:7
        reject(new Error(`Sorry, we don't have ${item} today`));
               ^

Error: Sorry, we don't have pizza today
    at Timeout._onTimeout (C:\...\practice.js:7:16)
    ...

Node.js v24.15.0
```

In the browser, the console shows a red `Uncaught (in promise) Error: Sorry, we don't have pizza today`. Fix: end every chain with a `.catch`.

**4. Using the value outside `.then`**

```js
let food;

orderFood("burger").then((result) => {
  food = result;
});

console.log(food); // prints: undefined
```

The `console.log` runs straight away, about a second before the food arrives. It's the same mistake as in chapter 30, with a promise this time. Fix: use the value *inside* `.then`, or in a later step of the chain. The next chapter makes this feel much more natural.

**5. Rejecting with a plain string**

```js
reject("Out of stock"); // not an Error object
```

Your `.catch` still runs, but `error.message` is `undefined`, and there's no stack trace to tell you where the problem came from. Fix: `reject(new Error("Out of stock"))`.

## Quick recap

- A promise stands in for a value that isn't ready yet. It starts **pending**, then settles as **fulfilled** (with a value) or **rejected** (with an error), and never changes again.
- You create one with `new Promise((resolve, reject) => { ... })`, but most of the time you'll use promises that functions give you.
- `.then` runs when it's fulfilled, `.catch` when it's rejected, and `.finally` either way.
- Chains stay flat: return a value or a promise from `.then` to pass it on. An error skips ahead to the next `.catch`.
- `Promise.all` waits for all (and fails if any fail), `allSettled` gives you every result, `race` takes the first to finish, and `any` takes the first to succeed.
- Always end a chain with `.catch`. In Node, an unhandled rejection stops your program.

---

**Next:** try the [exercises](exercises.md), then move on to [32 Async/Await](../32-async-await/notes.md).
