# 41 Memory and Garbage Collection

## What is it?

Every value your program makes (a number, a string, an object, an array) needs a little space in the computer's **memory**: the fast, temporary storage where running programs keep their data, often called RAM.

**Garbage collection** is how JavaScript cleans up after you. Every so often, it finds the values your program can't use anymore and frees their space for new ones. It happens automatically. You never have to free memory yourself.

## Why does it matter?

Most of the time, you can forget about memory. The garbage collector does its job quietly, and that's true for most of the code you'll ever write.

But it can only throw away things you've *let go of*. If your code keeps holding on to something by accident (a timer that never stops, a list that only grows), that memory can never be freed. This is called a **memory leak**.

Leaks are sneaky. Nothing breaks at first. The app just gets slower and slower: a browser tab using 2 GB after a day open, a server that has to be restarted every night. Knowing how the garbage collector decides what to keep helps you avoid leaks, and find them when they happen.

## Real-world example

Think of a bunch of helium balloons at a party.

| Balloons | JavaScript |
|---|---|
| A balloon | A value in memory, like an object or an array |
| Holding a balloon's string | A variable (or another object) that refers to the value |
| Balloons tied to other balloons | Objects stored inside other objects |
| A balloon nobody is holding, not even through another balloon | A value your program can't reach anymore |
| It floats away | The garbage collector frees its memory |
| Forgetting that a string is still tied to your wrist | A memory leak |

A balloon stays as long as *someone* holds its string, or it's tied to a balloon that someone holds. Let go of the last string, and it floats away by itself. You don't have to pop it.

## How it works

### Where values live: the stack and the heap

JavaScript keeps your data in two main places:

| | The stack | The heap |
|---|---|---|
| Like... | Small labeled drawers | A big warehouse |
| Holds | The variables of the functions running right now | Objects, arrays, and functions |
| Size | Small and tidy | Big: things can be any size |
| Cleaned up | Straight away, the moment a function returns | By the garbage collector, once nothing can reach them |

The **stack** is the call stack you know from [chapter 17](../17-recursion/notes.md) and [chapter 40](../40-event-loop/notes.md). Each running function gets its own drawer for its variables. When the function returns, its drawer is emptied.

The **heap** is where objects and arrays live. They can be big, and they can outlive the function that made them. A variable doesn't hold the object itself. It holds a **reference**: a slip of paper with the object's shelf number in the warehouse.

```js
function makeOrder() {
  const quantity = 2; // lives in this function's drawer
  const order = { item: "pizza", quantity }; // the object goes to the heap
  return order; // hand back the shelf number
}

const myOrder = makeOrder();
console.log(myOrder); // prints: { item: 'pizza', quantity: 2 }
```

When `makeOrder` returns, its drawer is emptied: `quantity` and the local `order` variable are gone. The object itself survives in the heap, because `myOrder` still holds its shelf number.

> This is a simplified picture. Real engines are cleverer (for example, long strings usually live in the heap too), and you don't need those details. The useful idea is: objects live in the heap, and variables hold references to them.

### References keep things alive

Remember [chapter 16](../16-values-vs-references/notes.md)? Two variables can refer to the very same object:

```js
const cart = { items: ["apple"] };
const sameCart = cart; // a second string to the same balloon

sameCart.items.push("bread");
console.log(cart.items); // prints: [ 'apple', 'bread' ]
```

That's the rule the garbage collector cares about: **an object stays in memory as long as at least one reference can still reach it.** Variables, properties of other objects, items in arrays, entries in a Map, and variables used by closures all count as references.

### Garbage collection: can anyone still reach it?

The **garbage collector** (GC for short) is the part of the JavaScript engine that frees memory. It runs by itself, every now and then, whenever the engine decides it's a good moment.

It works by **reachability**. It starts from the **roots**, the things that are always in use:

- global variables,
- the variables of the functions running right now (the stack),
- callbacks that are still waiting: timers, event listeners, promise callbacks.

From there, it follows every reference, like following strings from hands to balloons, and marks everything it can reach. Anything it didn't reach is garbage, and its memory is freed. This is called **mark-and-sweep**: mark what's reachable, sweep away the rest.

```js
let user = { name: "Ava" }; // one string
let admin = user;           // two strings to the same object

user = null;  // one string let go. admin still holds it, so it stays
admin = null; // the last string is gone: the object can be collected
```

Nothing prints here, and that's the point. You can't see the garbage collector at work, and you don't decide when it runs. Once nothing can reach the object, the GC frees it at some point later.

Objects that point at each other are no problem either:

```js
function makeTeam() {
  const alex = { name: "Alex" };
  const sam = { name: "Sam" };
  alex.teammate = sam;
  sam.teammate = alex; // they hold each other's strings
}

makeTeam();
```

After `makeTeam` returns, `alex` and `sam` still refer to each other. But no root can reach either of them, so both get collected, like two balloons tied together floating away.

### Watching it happen in Node

Node can tell you how much memory it's using, with `process.memoryUsage()`. Its `heapUsed` property is how many **bytes** (tiny units of memory) your objects take up right now. Dividing by 1024 twice turns bytes into **megabytes** (MB), which are easier to read.

```js
function heapMB() {
  return Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
}

console.log(`Start: ${heapMB()} MB`);

let orders = [];
for (let i = 0; i < 1000000; i++) {
  orders.push({ id: i, item: "pizza" });
}
console.log(`After 1 million orders: ${heapMB()} MB`);

orders = null; // let go of the only string
gc();          // ask for a clean-up right now (needs --expose-gc)
console.log(`After letting go: ${heapMB()} MB`);
```

`gc()` isn't normally available. It only exists when you start Node with a special flag, so save this as `memory.js` and run it like this:

```
node --expose-gc memory.js
```

You'll see something like this:

```
Start: 4 MB
After 1 million orders: 68 MB
After letting go: 4 MB
```

**Your numbers will be different.** They depend on your computer and your Node version, and they can change from run to run. What matters is the shape: memory goes up while the orders are reachable, and drops back once nothing holds them.

Without the flag, you'd get `ReferenceError: gc is not defined`. That's on purpose. The flag is for experiments like this one. Never use it in real programs: the GC knows better than you when to run.

### Memory leaks: things you forgot to let go of

A memory leak is memory your program keeps even though it will never use it again. In JavaScript, it's nearly always the same story: *something is still holding the string*.

One leaky object isn't a problem. The trouble starts when the leaky code runs again and again, and the pile keeps growing: on every page visit, every opened window, every request to your server.

Here are the five usual suspects.

### Leak 1: timers you never stop

An interval keeps running until you clear it, even when nobody needs it anymore. And while it's running, its callback is a root, so everything the callback uses stays alive too.

```js
function startLiveScores(match) {
  const updates = [];

  setInterval(() => {
    updates.push(`${match}: update ${updates.length + 1}`);
  }, 1000);
}

startLiveScores("Arsenal vs Chelsea");
```

Even after the user leaves the match page, the interval keeps going, and `updates` grows every second, forever. In Node, it also stops the program from ever ending, as you saw at the end of [chapter 40's exercises](../40-event-loop/exercises.md).

Fix: keep the timer's id, and clear it when you're done. Returning a `stop` function makes that easy for whoever started it:

```js
function startLiveScores(match) {
  const updates = [];

  const timerId = setInterval(() => {
    updates.push(`${match}: update ${updates.length + 1}`);
    console.log(updates.at(-1));
  }, 1000);

  return function stop() {
    clearInterval(timerId); // let go: the callback and `updates` can be freed
    console.log("Stopped live scores");
  };
}

const stopScores = startLiveScores("Arsenal vs Chelsea");
setTimeout(stopScores, 3500); // the user leaves the page after 3.5 seconds
```

You'll see:

```
Arsenal vs Chelsea: update 1
Arsenal vs Chelsea: update 2
Arsenal vs Chelsea: update 3
Stopped live scores
```

Then the program ends by itself, because nothing is left waiting. A good rule of thumb: **whoever starts something should be able to stop it.**

### Leak 2: listeners that are never removed

An event listener stays attached until you remove it. Listeners on things that live as long as the page, like `document` and `window`, stay alive as long as the page does, along with everything their callbacks use.

It gets worse when the code that adds them runs more than once. Here's a photo viewer (a "lightbox") for a web page:

```js
function openLightbox(photoName) {
  document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") {
      console.log(`Next photo after ${photoName}`);
    }
  });
}

openLightbox("beach.jpg");
openLightbox("forest.jpg");
openLightbox("city.jpg");
```

Now press the right arrow key once, and the console shows:

```
Next photo after beach.jpg
Next photo after forest.jpg
Next photo after city.jpg
```

Every photo you ever opened is still listening. That's a leak *and* a bug.

One fix is `removeEventListener` from [chapter 21](../21-events/notes.md), but it needs the exact same function you added, which gets fiddly with several listeners. There's a neater way: an `AbortController`, which you used to cancel `fetch` requests in [chapter 33](../33-fetch-and-apis/notes.md). Pass its `signal` when you add each listener, and a single `abort()` removes all of them at once:

```js
function openLightbox(photoName) {
  const controller = new AbortController();
  const options = { signal: controller.signal };

  document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") {
      console.log(`Next photo after ${photoName}`);
    }
    if (event.key === "Escape") {
      controller.abort(); // close: removes every listener that used this signal
    }
  }, options);

  window.addEventListener("resize", () => {
    console.log(`Fit ${photoName} to the new window size`);
  }, options);
}
```

After Escape, both listeners are gone, along with everything they were holding on to.

### Leak 3: caches and lists that only grow

A **cache** is a place where you keep results so you don't have to work them out (or download them) again. Caches are great, but a cache that never forgets grows forever. On a server that runs for weeks, that's a leak. The same goes for arrays you keep pushing to and never trim: logs, history, "recently viewed" lists.

Fix: give it a limit. A Map ([chapter 35](../35-map-and-set/notes.md)) remembers the order its keys were added in, so its first key is always the oldest:

```js
const MAX_ENTRIES = 3;
const forecastCache = new Map();

function saveForecast(city, forecast) {
  if (forecastCache.size >= MAX_ENTRIES) {
    const oldestCity = forecastCache.keys().next().value; // the first key added
    forecastCache.delete(oldestCity);
  }
  forecastCache.set(city, forecast);
}

saveForecast("London", "12°C, cloudy");
saveForecast("Paris", "15°C, sunny");
saveForecast("Rome", "21°C, sunny");
saveForecast("Oslo", "4°C, snow");

console.log([...forecastCache.keys()]); // prints: [ 'Paris', 'Rome', 'Oslo' ]
```

`keys()` gives you an iterator ([chapter 36](../36-iterators-and-generators/notes.md)), and `.next().value` takes its first value. London was the oldest, so it made room for Oslo. A real app might allow 100 or 1000 entries, but the idea is the same.

### Leak 4: closures holding big data

A closure ([chapter 25](../25-closures/notes.md)) keeps alive every outside variable it uses, for as long as the closure itself is alive. That's usually exactly what you want. It turns into a leak when a small, long-lived function holds on to something big.

```js
function makeGreeter(user) {
  // user is a big object: profile photo, order history, settings...
  return function greet() {
    console.log(`Hi, ${user.name}!`);
  };
}
```

`greet` only needs the name. But it uses `user`, so it keeps the *whole* user object alive, photo and all, for as long as `greet` exists.

Fix: copy out the small part you need, so the closure doesn't use the big object at all:

```js
function makeGreeter(user) {
  const name = user.name; // keep only what you need
  return function greet() {
    console.log(`Hi, ${name}!`);
  };
}
```

Now, once nothing else holds the user object, it can be collected, and `greet` still works.

### Leak 5: detached DOM elements

A **detached** element is one that's been removed from the page, but that your JavaScript still refers to. It's not on screen anymore, but it can't be collected either, and neither can anything inside it.

```js
const ui = {
  popup: document.querySelector("#promo-popup"),
};

function closePopup() {
  ui.popup.remove(); // gone from the page...
  // ...but ui.popup still holds it, so it stays in memory
}
```

One popup is tiny. Now imagine a chat app that removes old messages from the screen but keeps every one of those elements in an array. Fix: when you remove an element for good, drop your references to it as well (`ui.popup = null;`). For extra data about elements, use a WeakMap, coming up next.

### Weak references: WeakMap and WeakRef

Chapter 35 introduced **WeakMap**: a Map whose keys must be objects, and which holds them *weakly*. A **weak reference** doesn't count as holding the string. When nothing else refers to a key object, the GC can collect it, and its WeakMap entry disappears along with it.

That makes a WeakMap perfect for attaching extra data to objects, like DOM elements, without keeping them alive:

```js
const clickCounts = new WeakMap();

function countClick(button) {
  const count = (clickCounts.get(button) ?? 0) + 1;
  clickCounts.set(button, count);
  return count;
}
```

If a button is removed from the page later and your code lets go of it, its count goes too. A normal Map would keep every button it ever saw alive forever.

`WeakRef` is a rarer tool. `new WeakRef(object)` holds an object without keeping it alive, and `ref.deref()` gives it back, or `undefined` if it's been collected. Since you can't know when the GC will run, code built on WeakRef is hard to get right. You'll rarely need it, so reach for a WeakMap first.

### Finding leaks with Chrome DevTools

When a page gets slower and slower the longer it's open, the **Memory** tab in Chrome (or Edge) DevTools can show you what's piling up. A **heap snapshot** is a photo of everything in the heap at one moment. Comparing two of them shows you what grew in between.

1. Open your page, press `F12`, and go to the **Memory** tab. (If you can't see it, click `>>` to find more tabs.)
2. Choose **Heap snapshot** and click **Take snapshot**. This is your "before" photo.
3. Do the thing you suspect is leaking, several times. For example, open and close the lightbox 10 times.
4. Take a second snapshot.
5. With the second snapshot selected, switch the view from **Summary** to **Comparison**. You now see what was added since the first photo. Click the **# Delta** or **Size Delta** column to sort the biggest growth to the top.
6. To hunt for detached elements, go back to the **Summary** view and type `Detached` into the filter box.
7. Click a suspicious item. The **Retainers** section below it shows the chain of references keeping it alive: who's still holding the string.

A snapshot only contains things that are still reachable, so if something shows up there, something really is holding on to it. DevTools changes a little between Chrome versions, so your screens may look slightly different.

### Keep it in proportion

Two honest points before you go leak hunting:

- Garbage collection is automatic, and it's very good. For most code, you don't need to think about memory at all. Local variables clean themselves up when a function returns.
- Think about memory when something **lives a long time** or **happens over and over**: a page that stays open all day, a server that runs for weeks, code that runs on every click or every request. That's where leaks grow.

## Common mistakes

**1. Starting a second timer without stopping the first**

```js
let timerId = null;
let secondsLeft = 5;

function startCountdown() {
  timerId = setInterval(() => {
    secondsLeft--;
    console.log(`Time left: ${secondsLeft}`);
    if (secondsLeft <= 0) {
      clearInterval(timerId);
    }
  }, 1000);
}

startCountdown();
startCountdown(); // the user clicked Start twice
```

You'll see this, and it never stops (press `Ctrl + C`):

```
Time left: 4
Time left: 3
Time left: 2
Time left: 1
Time left: 0
Time left: -1
Time left: -2
```

The second click started a second interval, so the countdown runs twice as fast. Worse, `timerId` now only remembers the second one. The first interval can never be cleared: it leaks and keeps counting down forever. Fix: stop the old timer before starting a new one. `clearInterval` does nothing if there's nothing to clear, so this is always safe:

```js
function startCountdown() {
  clearInterval(timerId); // stop the old one first, if there is one
  timerId = setInterval(() => {
    // ...same as before
  }, 1000);
}
```

**2. Setting everything to `null` "to save memory"**

```js
function orderTotal(prices) {
  let total = 0;
  for (const price of prices) {
    total += price;
  }
  prices = null; // pointless
  return total;
}
```

`prices` and `total` live in the function's drawer, which is emptied the moment the function returns. It doesn't free the array either: the code that called `orderTotal` still holds its own reference to it. Setting a variable to `null` only helps when the variable lives a long time (a global, a property of a long-lived object, a cache) and you're really done with what it holds.

**3. Using a string as a WeakMap key**

```js
const visits = new WeakMap();
visits.set("sam", 3);
// TypeError: Invalid value used as weak map key
```

A WeakMap's whole job is to let its key *objects* be collected, so its keys must be objects. For string keys, use a normal Map, and give it a limit if it can keep growing.

**4. Trusting a single memory reading**

```js
const readings = [];

for (let round = 1; round <= 8; round++) {
  const tempList = [];
  for (let i = 0; i < 200000; i++) {
    tempList.push({ id: i }); // garbage as soon as this round ends
  }
  readings.push(Math.round(process.memoryUsage().heapUsed / 1024 / 1024));
}

console.log(`${readings.join(" MB, ")} MB`);
```

You'll see something like this (your numbers will be different):

```
14 MB, 25 MB, 37 MB, 30 MB, 42 MB, 31 MB, 43 MB, 35 MB
```

Nothing leaks here: each `tempList` is garbage as soon as its round ends. Memory still jumps up and down, because the GC cleans up whenever it decides to, not the moment something becomes garbage. So one high number proves nothing. A leak is memory that keeps **climbing** as you repeat the same action, and never comes back down. Compare several readings, or two heap snapshots, before you decide.

## Quick recap

- Objects and arrays live in the **heap**. Variables hold references to them, and each function's variables on the **stack** are cleaned up the moment it returns.
- The **garbage collector** frees anything that can't be reached from the roots (globals, running functions, waiting callbacks), like balloons nobody is holding. It's automatic.
- A **memory leak** is something you forgot to let go of. It can never be freed, and it grows every time the leaky code runs.
- The usual suspects: intervals never cleared, listeners never removed, caches and lists that only grow, closures holding big data, and detached DOM elements.
- The fixes: `clearInterval`, `removeEventListener` or an `AbortController` signal, a size limit, copying out only what a closure needs, and a WeakMap for data attached to objects.
- To find a leak, compare heap snapshots in the Memory tab. In Node, `process.memoryUsage()` shows the heap size, but the numbers bounce around, so look for a trend, not one number.

---

**Next:** try the [exercises](exercises.md), then move on to [42 Proxy and Reflect](../42-proxy-and-reflect/notes.md).
