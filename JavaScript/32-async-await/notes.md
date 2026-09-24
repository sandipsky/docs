# 32 Async/Await

## What is it?

`async` and `await` are two keywords that let you write promise code that reads like normal, top-to-bottom code.

Under the hood, it's still the promises from [chapter 31](../31-promises/notes.md). It just looks much friendlier.

## Why does it matter?

Promise chains are a big improvement on callback pyramids, but they still have rough edges:

- Every step is its own little arrow function inside a `.then`.
- A value from the first step isn't easy to use in the third step.
- Errors go to `.catch`, not the `try`/`catch` you know from [chapter 18](../18-error-handling/notes.md).

With `async`/`await`, code that waits looks just like the code you've been writing all along. Values stay in ordinary variables, and `try`/`catch` works again.

It's how most modern JavaScript is written, including the code that gets data from the internet in the next chapter.

## Real-world example

Think of a baker following a bread recipe:

1. Mix the dough.
2. **Wait** for it to rise (an hour).
3. Bake it.

While the dough rises, the bakery doesn't close. The other bakers keep serving customers. Only *this* recipe is paused at step 2, and the baker picks it up again as soon as the dough is ready.

| In the bakery | In JavaScript |
|---|---|
| A recipe card | An `async` function |
| "Wait for the dough to rise" | `await somePromise` |
| This recipe pauses at that step | This function pauses at that line |
| The other bakers keep working | The rest of your program keeps running |
| The dough is ready, so the recipe carries on | The promise settles, and the function carries on with the value |

## How it works

The examples use two helpers from chapter 31: `wait(ms)` and `orderFood(item)`. Copy them to the top of your practice file:

```js
function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

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

### `async` functions always return a promise

Put the word `async` in front of a function, and it always returns a promise. Whatever you `return` becomes the promise's value:

```js
async function getGreeting() {
  return "Welcome to the gym!";
}

console.log(getGreeting()); // prints: Promise { 'Welcome to the gym!' }
getGreeting().then((text) => console.log(text)); // prints: Welcome to the gym!
```

And if an `async` function throws an error, its promise is rejected:

```js
async function checkMembership() {
  throw new Error("Membership expired");
}

checkMembership().catch((error) => console.log("Problem:", error.message));
// prints: Problem: Membership expired
```

That's the first half of the deal. The second half, `await`, is where it gets good.

### `await`: wait for a promise

Inside an `async` function, you can put `await` in front of a promise. The function pauses at that line until the promise settles:

- If the promise is fulfilled, `await` gives you its value.
- If it's rejected, `await` throws its error, just like `throw`.

```js
async function makeTea() {
  console.log("Boiling the water...");
  await wait(2000);
  console.log("Steeping the tea...");
  await wait(3000);
  console.log("Tea is ready!");
}

makeTea();
```

You'll see the first line straight away, the second after about 2 seconds, and the last after about 5 seconds:

```
Boiling the water...
Steeping the tea...
Tea is ready!
```

No `.then`, no nesting. It reads like a recipe.

When the promise has a value, store it in a variable like any other result:

```js
async function lunch() {
  const food = await orderFood("soup");
  console.log(`Enjoy your ${food}!`);
}

lunch();
// prints (after about 1 second): Enjoy your soup!
```

Read `const food = await orderFood("soup");` as "wait for the soup, then put it in `food`".

### `await` pauses the function, not the whole program

This is the most important idea in the chapter. `await` only pauses the `async` function it's in. Everything else keeps going, just like the other bakers in the bakery:

```js
async function makeTea() {
  console.log("1. Put the kettle on");
  await wait(1000);
  console.log("3. Pour the tea");
}

makeTea();
console.log("2. Get a mug while you wait");
```

You'll see:

```
1. Put the kettle on
2. Get a mug while you wait
3. Pour the tea
```

When `makeTea` reaches `await`, it steps aside and hands control back to whoever called it. The code after `makeTea();` runs, and about a second later, `makeTea` picks up where it left off.

### Handling errors with `try`/`catch`/`finally`

Because a rejected promise makes `await` throw, you can use the `try`/`catch`/`finally` from chapter 18, exactly as you already know it:

```js
async function lunch(item) {
  try {
    const food = await orderFood(item);
    console.log(`Enjoy your ${food}!`);
  } catch (error) {
    console.log("Problem:", error.message);
  } finally {
    console.log("Buzzer handed back");
  }
}

lunch("pizza");
```

You'll see (after about 1 second):

```
Problem: Sorry, we don't have pizza today
Buzzer handed back
```

It's the same as `.then`, `.catch` and `.finally` from chapter 31, but written the ordinary way. Remember how `try`/`catch` couldn't catch errors from a timer in chapter 30? With `await`, it can, because the function really does wait inside the `try`.

### Async arrow functions

Arrow functions can be `async` too. Put `async` before the brackets:

```js
const greetMember = async (name) => {
  await wait(500);
  return `Welcome back, ${name}!`;
};

greetMember("Priya").then((message) => console.log(message));
// prints (after about half a second): Welcome back, Priya!
```

You'll often see them as callbacks, like an event listener that needs to wait for something ([chapter 21](../21-events/notes.md)):

```js
saveButton.addEventListener("click", async () => {
  await saveDraft(); // wait for the save to finish
  console.log("Draft saved");
});
```

(That's a sketch: `saveButton` and `saveDraft` stand for a real button and a real saving function.)

### One by one, or all at once?

`await` makes it very easy to do things one after another. Sometimes that's exactly right, and sometimes it wastes time. Here's a kitchen cooking three dishes, using the `cook` helper from chapter 31:

```js
function cook(dish, ms) {
  return wait(ms).then(() => dish);
}

async function cookOneByOne() {
  const start = Date.now();
  const pasta = await cook("pasta", 2000);
  const sauce = await cook("sauce", 1000);
  const salad = await cook("salad", 1000);
  console.log(pasta, sauce, salad);
  console.log(`One by one: about ${Math.round((Date.now() - start) / 1000)} seconds`);
}

async function cookAllAtOnce() {
  const start = Date.now();
  const [pasta, sauce, salad] = await Promise.all([
    cook("pasta", 2000),
    cook("sauce", 1000),
    cook("salad", 1000),
  ]);
  console.log(pasta, sauce, salad);
  console.log(`All at once: about ${Math.round((Date.now() - start) / 1000)} seconds`);
}

async function compare() {
  await cookOneByOne();
  await cookAllAtOnce();
}

compare();
```

You'll see:

```
pasta sauce salad
One by one: about 4 seconds
pasta sauce salad
All at once: about 2 seconds
```

- **One by one** (sequential): each `await` waits for the dish before starting the next one. 2 + 1 + 1 = about 4 seconds.
- **All at once** (parallel): all three start straight away, and one `await` waits for `Promise.all`. You only wait for the slowest dish: about 2 seconds.
- `const [pasta, sauce, salad] = ...` is array destructuring from [chapter 15](../15-destructuring-spread-rest/notes.md). It unpacks the array that `Promise.all` gives you.

So which one should you use?

| If... | Then... | Example |
|---|---|---|
| a step needs the result of the step before | wait one by one | you need a customer's order number before you can track the parcel |
| the steps don't depend on each other | start them all, then `await Promise.all(...)` | loading the weather, the news and your calendar for a dashboard |

### Loops: `for...of` waits for each item

To do something slow for each item in an array, one at a time, use `await` inside a `for...of` loop:

```js
const playlist = ["Intro", "Chorus", "Outro"];

async function playAll() {
  for (const song of playlist) {
    await wait(1000);
    console.log(`Played: ${song}`);
  }
  console.log("Playlist finished!");
}

playAll();
```

You'll see one song about every second, and then the last line:

```
Played: Intro
Played: Chorus
Played: Outro
Playlist finished!
```

The loop waits at `await` on every turn. Watch out: `forEach` does *not* work like this. You'll see why in "Common mistakes".

### Top-level `await` (modules only)

So far, every `await` has been inside an `async` function. In an ES module ([chapter 29](../29-modules/notes.md)), you can also use `await` at the top level of a file, outside any function.

Add a `package.json` file containing `{ "type": "module" }` to your folder, like in chapter 29. Then this works:

```js
// main.js, in a folder whose package.json says { "type": "module" }
const food = await orderFood("salad");
console.log(`Enjoy your ${food}!`);
// prints (after about 1 second): Enjoy your salad!
```

In a CommonJS file, the same code is an error: `SyntaxError: await is only valid in async functions and the top level bodies of modules`. (If there's no `package.json` at all, Node 24 notices the `await` and runs the file as a module anyway. With `"type": "module"`, there's no guessing.) In the browser, top-level `await` works inside `<script type="module">`.

You'll use top-level `await` a lot in the next chapter, to keep examples short.

### Converting a `.then` chain to `async`/`await`

You'll find plenty of `.then` chains in older code. Here's one from a restaurant:

```js
function serveLunch(item) {
  return orderFood(item)
    .then((food) => {
      console.log(`Cooking the ${food}...`);
      return wait(1000).then(() => food);
    })
    .then((food) => console.log(`Here's your ${food}!`))
    .catch((error) => console.log("Problem:", error.message))
    .finally(() => console.log("Table cleared"));
}

serveLunch("soup");
```

And here's the same thing with `async`/`await`:

```js
async function serveLunch(item) {
  try {
    const food = await orderFood(item);
    console.log(`Cooking the ${food}...`);
    await wait(1000);
    console.log(`Here's your ${food}!`);
  } catch (error) {
    console.log("Problem:", error.message);
  } finally {
    console.log("Table cleared");
  }
}

serveLunch("soup");
```

Both print the same lines, the first after about 1 second and the other two after about 2 seconds:

```
Cooking the soup...
Here's your soup!
Table cleared
```

The recipe for converting:

1. Put `async` in front of the function.
2. Turn each `.then((value) => ...)` into `const value = await ...;` on its own line.
3. Wrap the steps in `try`. Turn `.catch` into `catch`, and `.finally` into `finally`.

Look at how the `.then` version needed `return wait(1000).then(() => food)`, just to carry `food` along to the next step. With `await`, `food` is an ordinary variable that's there the whole time.

## Common mistakes

**1. Forgetting `await`**

```js
async function lunch() {
  const food = orderFood("burger"); // forgot await
  console.log(food);                  // prints: Promise { <pending> }
  console.log(`Enjoy your ${food}!`); // prints: Enjoy your [object Promise]!
}

lunch();
```

Without `await`, you get the buzzer instead of the food: the promise itself, still pending. If you see `Promise { <pending> }` or `[object Promise]` in your output, a missing `await` is almost always the reason. Fix: `const food = await orderFood("burger");`.

**2. Using `await` inside `forEach`**

```js
async function playAll() {
  playlist.forEach(async (song) => {
    await wait(1000);
    console.log(`Played: ${song}`);
  });
  console.log("Playlist finished!");
}
```

You'll see:

```
Playlist finished!
Played: Intro
Played: Chorus
Played: Outro
```

"Playlist finished!" comes first, and then all three songs appear together, about a second later. `forEach` calls your `async` callback for each song, but it doesn't wait for any of them. Fix: use a `for...of` loop, like in "Loops" above.

(If you *want* them all at once, like downloading three songs together, use `await Promise.all(playlist.map(async (song) => { ... }))`. `map` gives you an array of promises, and `Promise.all` waits for all of them.)

**3. Using `await` in a function that isn't `async`**

```js
function lunch() {
  const food = await orderFood("soup");
  console.log(`Enjoy your ${food}!`);
}
// SyntaxError: await is only valid in async functions and the top level bodies of modules
```

`await` only works inside an `async` function (or at the top level of a module). Because it's a syntax error, none of the file runs at all. Fix: `async function lunch() { ... }`.

**4. Waiting one by one when you don't need to**

```js
// inside an async function
const weather = await getWeather();
const news = await getNews();         // doesn't need the weather!
const calendar = await getCalendar(); // doesn't need either of them!
```

Each line waits for the one before, so the times add up. When the steps don't depend on each other, start them together: `const [weather, news, calendar] = await Promise.all([getWeather(), getNews(), getCalendar()]);`.

**5. Not handling errors**

```js
async function lunch(item) {
  const food = await orderFood(item);
  console.log(`Enjoy your ${food}!`);
}

lunch("pizza"); // nobody handles the error
```

The error from `orderFood` makes `lunch`'s promise reject, and nobody catches it. Node prints `Error: Sorry, we don't have pizza today` and stops your program, just like the unhandled rejections in chapter 31. Fix: add a `try`/`catch` inside `lunch`, or call it with `lunch("pizza").catch(...)`.

**6. Mixing `.then` and `await` in one function**

```js
async function lunch() {
  await orderFood("salad")
    .then((food) => console.log(`Enjoy your ${food}!`))
    .catch((error) => console.log("Problem:", error.message));
  console.log("Lunch is over");
}
```

This works, but it uses two styles at once, so the reader has to keep switching between them. Fix: pick one. Inside an `async` function, use `await` with `try`/`catch`:

```js
async function lunch() {
  try {
    const food = await orderFood("salad");
    console.log(`Enjoy your ${food}!`);
  } catch (error) {
    console.log("Problem:", error.message);
  }
  console.log("Lunch is over");
}
```

## Quick recap

- An `async` function always returns a promise. Returning a value fulfills it, and throwing an error rejects it.
- `await` pauses only its own `async` function until the promise settles, then gives you the value (or throws the error). The rest of your program keeps running.
- Handle errors with the usual `try`/`catch`/`finally` around your `await`s.
- If a step needs the result of the one before, `await` them one by one. If not, start them together and `await Promise.all([...])`.
- To `await` inside a loop, use `for...of`, not `forEach`.
- Top-level `await` only works in modules (`"type": "module"` in `package.json`).
- `Promise { <pending> }` or `[object Promise]` in your output usually means a missing `await`.

---

**Next:** try the [exercises](exercises.md), then move on to [33 Fetch and APIs](../33-fetch-and-apis/notes.md).
