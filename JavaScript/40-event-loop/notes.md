# 40 The Event Loop

## What is it?

The **event loop** is how JavaScript decides what to run next.

JavaScript can only do one thing at a time. Yet your programs juggle timers, promises, clicks, and network requests. The event loop keeps order: it runs your code, then takes the next waiting job, one at a time, following a few fixed rules.

## Why does it matter?

You've been relying on the event loop since [chapter 30](../30-timers-and-callbacks/notes.md), every time you called `setTimeout`. Knowing how it works answers questions like these:

- Why does `setTimeout(fn, 0)` run *after* the code below it, even with a 0 ms delay? (Chapter 30 promised to explain.)
- Why does a promise's `.then` run before a `setTimeout` that was set up first?
- Why does one long loop freeze a whole web page, so buttons stop responding?
- Why was my timer late?

Once you know the rules, async code stops feeling like magic. You can predict the exact order of the output, and write programs that stay quick and responsive. Output-order puzzles are also a favorite in job interviews.

## Real-world example

Picture a small, busy cafe with just **one cashier**.

| At the cafe | In JavaScript |
|---|---|
| One cashier, serving one customer at a time | JavaScript runs one piece of code at a time |
| The customer at the counter right now | The call stack: the code running right now |
| The kitchen cooks on its own. The cashier doesn't stand there waiting | The browser or Node does the waiting (timers, network requests) |
| The regular line: customers whose food is ready, and new customers walking in | The task queue: finished timers, clicks, network replies |
| The VIP line: quick follow-ups that always go first | The microtask queue: promise callbacks |
| The cashier's rule: finish the current customer, serve *everyone* in the VIP line, then call *one* person from the regular line. Repeat all day. | The event loop |

The rule is strict. Nobody interrupts the customer at the counter, however long they take. That's why one slow customer holds up the whole cafe, and one slow piece of code freezes a whole page.

Keep this cafe in mind. Every rule in this chapter is one of the cashier's rules.

## How it works

### One thing at a time

JavaScript is **single-threaded**. A **thread** is one line of work: a worker who does one step after another. JavaScript runs your code on just one of them, called the **main thread**. That's the one cashier.

So while a piece of your code is running, nothing else can run. Not a timer, not a click handler, not a promise callback. They all wait their turn.

### The call stack (a quick recap)

Remember the call stack from [chapter 17](../17-recursion/notes.md), the stack of plates? It's JavaScript's list of "what am I in the middle of right now?" Every function call puts a plate on top, and every `return` takes one off.

```js
function makeSandwich() {
  console.log("Making a sandwich");
  addFilling();
  console.log("Sandwich done");
}

function addFilling() {
  console.log("Adding cheese");
}

makeSandwich();
console.log("Next order, please");
```

Here's the stack while this file runs. `main` means the main part of your file, outside any function.

```
The file starts          [ main ]
makeSandwich() called    [ main, makeSandwich ]
addFilling() called      [ main, makeSandwich, addFilling ]
addFilling returns       [ main, makeSandwich ]
makeSandwich returns     [ main ]
The file ends            [ ]   <- empty! Now the event loop takes over
```

That last line is the key to this whole chapter. **Timers, promise callbacks, and clicks only get to run when the stack is empty.** JavaScript never pauses your code halfway through to run something else.

### Blocking: when the cashier gets stuck

Because there's only one thread, a slow piece of code holds up everything behind it. This is called **blocking** the main thread.

Here's a reminder set for 100 ms, followed by a job that keeps JavaScript busy for about a second:

```js
const start = Date.now();

setTimeout(() => {
  console.log(`Reminder! (asked for 100 ms, got ${Date.now() - start} ms)`);
}, 100);

// Keep the one cashier busy for about 1 second
while (Date.now() - start < 1000) {
  // doing nothing useful, just blocking
}

console.log("Big job finished");
```

You'll see something like this (your number will be a little different):

```
Big job finished
Reminder! (asked for 100 ms, got 1002 ms)
```

The timer was ready after 100 ms, but it couldn't run until the loop was done and the stack was empty. That's why chapter 30 said the delay is a *minimum*, not an exact time.

In the browser, blocking hurts even more. While your code runs, the page can't react to clicks or typing, and it can't redraw the screen, so it looks frozen. If it goes on long enough, the browser may offer to stop the page for you. You'll see how to avoid this later in the chapter.

### Who does the waiting?

If JavaScript can only do one thing at a time, how does `setTimeout` wait without freezing everything?

JavaScript doesn't do the waiting itself. The **environment** does: the program that runs your JavaScript, which is either the browser or Node. It's the kitchen in the cafe.

When you call `setTimeout(fn, 1000)`, JavaScript hands the timer to the environment and moves straight on to the next line. The environment counts the time. When the time is up, it doesn't run `fn` right away, because the cashier might be busy. It puts `fn` in a line to wait for its turn.

The same goes for network requests (`fetch`, [chapter 33](../33-fetch-and-apis/notes.md)), clicks and key presses in the browser, and reading files in Node. The environment waits for them. When something happens, it lines up your callback.

### Two waiting lines: tasks and microtasks

There are two lines, and they are not equal.

A **queue** is a waiting line where the first to join is the first served, like the line at a bank.

- A **task** (also called a **macrotask**) is a callback waiting in the **task queue**, the regular line. Finished timers, clicks, and network replies all become tasks.
- A **microtask** is a small, urgent job waiting in the **microtask queue**, the VIP line. Promise callbacks go here.

| You write... | The callback waits in... |
|---|---|
| `setTimeout(fn, ms)` or `setInterval(fn, ms)` | the task queue, once the time is up |
| an event listener, like `click` (browser) | the task queue, once the event happens |
| `promise.then(fn)`, `.catch(fn)`, `.finally(fn)` | the microtask queue, once the promise settles (is fulfilled or rejected) |
| the rest of an `async` function after `await` | the microtask queue, once the awaited promise settles |
| `queueMicrotask(fn)` | the microtask queue, straight away |

`queueMicrotask(fn)` is new. It's a built-in function, in both browsers and Node, that puts `fn` straight into the VIP line, no promise needed.

### The event loop: the cashier's rules

Here are the rules. The event loop repeats them for as long as the program runs:

1. **Run one task** until the call stack is empty. The very first task is your main code: the whole file, top to bottom.
2. **Run every microtask**, one after another. If a microtask adds more microtasks, run those too. Stop only when the VIP line is empty.
3. In the browser, the screen may be redrawn now.
4. **Go back to step 1** with the next task from the task queue. If there isn't one, wait until there is.

```
          +-----------------------------------+
  +-----> | 1. Run ONE task until the         |   (the first task is
  |       |    call stack is empty            |    your main code)
  |       +-----------------------------------+
  |                        |
  |                        v
  |       +-----------------------------------+
  |       | 2. Run EVERY microtask            |   (the whole VIP line,
  |       |    in the microtask queue         |    even new arrivals)
  |       +-----------------------------------+
  |                        |
  |                        v
  |       +-----------------------------------+
  |       | 3. Browser only: maybe redraw     |
  |       |    the screen                     |
  |       +-----------------------------------+
  |                        |
  +------------------------+  take the next task from the task queue
```

Notice the difference: microtasks are served **all at once**, tasks **one at a time**, with the VIP line emptied again after each one.

In Node, the program ends when there's nothing left to run and nothing left to wait for (no timers, no open network requests).

### Your first puzzle, step by step

Try to guess the output before you read on. `Promise.resolve()` ([chapter 31](../31-promises/notes.md)) makes a promise that's already fulfilled.

```js
console.log("start");

setTimeout(() => {
  console.log("timeout");
}, 0);

Promise.resolve().then(() => {
  console.log("promise");
});

console.log("end");
```

You'll see:

```
start
end
promise
timeout
```

Here's why, following the rules.

**Step 1: run the first task, your main code.** `start` prints. `setTimeout` hands its timer to the environment, and when the 0 ms are up, the callback joins the task queue. The promise is already fulfilled, so the `.then` callback joins the microtask queue straight away. Then `end` prints, and the file is done:

```
Call stack:       (empty)
Microtask queue:  [ log "promise" ]
Task queue:       [ log "timeout" ]
Printed so far:   start, end
```

**Step 2: run every microtask.** `promise` prints:

```
Call stack:       (empty)
Microtask queue:  (empty)
Task queue:       [ log "timeout" ]
Printed so far:   start, end, promise
```

**Back to step 1: run the next task.** `timeout` prints. Both lines are now empty and nothing else is waiting, so the program ends.

So `setTimeout(fn, 0)` doesn't mean "run now". It means "run as soon as possible, after the current code *and* all the microtasks are done".

### Puzzle time

Now it's your turn. For each puzzle, cover the output with your hand, write down your guess, then check. Better still, type each one into a file and run it.

**Puzzle 1: two ways into the VIP line**

```js
console.log("A");
setTimeout(() => console.log("B"), 0);
queueMicrotask(() => console.log("C"));
Promise.resolve().then(() => console.log("D"));
console.log("E");
```

You'll see:

```
A
E
C
D
B
```

`A` and `E` are plain code, so they print first. `C` and `D` are both microtasks. They wait in the VIP line in the order they joined, so `C` comes before `D`. `B` is a task, so it goes last.

**Puzzle 2: the promise recipe runs right away**

```js
console.log("A");

const order = new Promise((resolve) => {
  console.log("B");
  resolve("pizza");
});

order.then((food) => console.log("C", food));
console.log("D");
```

You'll see:

```
A
B
D
C pizza
```

Surprised by `B`? The function you pass to `new Promise` runs **straight away**, as plain code. Only the `.then` callback waits in the VIP line.

**Puzzle 3: `async` and `await`**

```js
async function loadProfile() {
  console.log("loading...");
  await Promise.resolve();
  console.log("profile ready");
}

console.log("app starts");
loadProfile();
console.log("show menu");
```

You'll see:

```
app starts
loading...
show menu
profile ready
```

An `async` function runs like a normal function **until its first `await`**. That's why `loading...` prints straight away. At the `await`, the function pauses and steps aside, and the rest of it (`profile ready`) becomes a microtask. Meanwhile, the main code carries on with `show menu`. This is what [chapter 32](../32-async-await/notes.md) meant by "`await` pauses only that function, not the whole program".

**Puzzle 4: a promise inside a timer**

```js
setTimeout(() => {
  console.log("timer 1");
  Promise.resolve().then(() => console.log("promise inside timer 1"));
}, 0);

setTimeout(() => console.log("timer 2"), 0);
```

You'll see:

```
timer 1
promise inside timer 1
timer 2
```

Both timers are ready at the same time, but the loop takes only **one** task at a time. After `timer 1` finishes, the VIP line is emptied before the next task gets a turn. So the promise jumps ahead of `timer 2`.

**Puzzle 5: two promise chains**

```js
Promise.resolve()
  .then(() => console.log("Order 1: paid"))
  .then(() => console.log("Order 1: shipped"));

Promise.resolve()
  .then(() => console.log("Order 2: paid"))
  .then(() => console.log("Order 2: shipped"));
```

You'll see:

```
Order 1: paid
Order 2: paid
Order 1: shipped
Order 2: shipped
```

The two chains take turns. Each `.then` waits for the step before it. So `Order 1: shipped` can only join the VIP line once `Order 1: paid` has run, and by then `Order 2: paid` is already waiting ahead of it.

**Puzzle 6: a microtask that adds a microtask**

```js
setTimeout(() => console.log("timeout"), 0);

queueMicrotask(() => {
  console.log("micro 1");
  queueMicrotask(() => console.log("micro 2 (added by micro 1)"));
});
```

You'll see:

```
micro 1
micro 2 (added by micro 1)
timeout
```

Rule 2 says **every** microtask runs, even ones that join while the VIP line is being served. The timer has to wait until the line is completely empty.

That has a dark side. If each microtask kept adding another one forever, the VIP line would never empty. Timers, clicks, and screen updates would never get a turn, and a page would freeze for good.

**The final puzzle: everything together**

```js
async function takeOrder() {
  console.log("Write down the order");
  await Promise.resolve();
  console.log("Send it to the kitchen");
}

console.log("Open the shop");

setTimeout(() => console.log("Deliver the pizza"), 0);

Promise.resolve().then(() => console.log("Check the oven"));

takeOrder();

queueMicrotask(() => console.log("Wipe the counter"));

console.log("Greet the next customer");
```

Take your time with this one. You'll see:

```
Open the shop
Write down the order
Greet the next customer
Check the oven
Send it to the kitchen
Wipe the counter
Deliver the pizza
```

| Stage | What happens | Prints |
|---|---|---|
| 1. The main code | The timer is handed to the environment. "Check the oven" joins the VIP line. `takeOrder()` runs until its `await`, and the rest of it joins the VIP line. "Wipe the counter" joins the VIP line. | `Open the shop`, `Write down the order`, `Greet the next customer` |
| 2. Every microtask, in the order they joined | "Check the oven", then the rest of `takeOrder`, then "Wipe the counter" | `Check the oven`, `Send it to the kitchen`, `Wipe the counter` |
| 3. The next task | The timer's callback | `Deliver the pizza` |

Got it right? Great work: this one trips up plenty of experienced developers. Got it wrong? Walk through the table once more. It clicks with practice.

### Redrawing the screen and `requestAnimationFrame` (browser)

In the browser, the screen can only be redrawn *between* tasks, never while your code is running, and never while microtasks are still waiting. That's why a long loop, or an endless chain of microtasks, freezes the page.

The browser doesn't redraw after every single task, though. It redraws when it's time for a new **frame**: one picture on the screen, like one page of a flip book. That's usually about 60 frames a second (more on faster screens), and it can skip frames when nothing has changed.

When you want to change something on screen smoothly, like a growing progress bar or a moving game character, use `requestAnimationFrame(fn)`. It asks the browser: "run `fn` right before you draw the next frame."

```js
const bar = document.querySelector("#progress-bar");
let width = 0;

function grow() {
  width += 1;
  bar.style.width = `${width}%`;
  if (width < 100) {
    requestAnimationFrame(grow); // ask again for the next frame
  }
}

requestAnimationFrame(grow);
```

You met it briefly in [chapter 34](../34-debounce-and-throttle/notes.md) as a throttle for visual updates. It only exists in browsers (Node has no screen to draw). Most browsers pause these callbacks while the tab is hidden, which saves battery.

> **Watch out:** The exact order between `requestAnimationFrame` callbacks and timers can differ between browsers and from frame to frame. Don't write code that depends on it.

### Node extras: `process.nextTick` and `setImmediate`

Node has two extra scheduling functions that you'll meet in Node code. `process.nextTick(fn)` runs `fn` as soon as the current code finishes, even before promise callbacks: a line in front of the VIP line. `setImmediate(fn)` runs `fn` as a task, on the next turn of Node's loop.

```js
console.log("sync");

setTimeout(() => console.log("setTimeout"), 0);
Promise.resolve().then(() => console.log("promise"));
process.nextTick(() => console.log("nextTick"));

console.log("sync again");
```

You'll see:

```
sync
sync again
nextTick
promise
setTimeout
```

Now try `setImmediate` against `setTimeout(..., 0)` in your main file:

```js
setTimeout(() => console.log("setTimeout"), 0);
setImmediate(() => console.log("setImmediate"));
```

Run it a few times. Sometimes `setTimeout` prints first, sometimes `setImmediate` does. It depends on tiny timing details as Node starts up, so the order isn't guaranteed.

| Function | Works in | Runs... |
|---|---|---|
| `process.nextTick(fn)` | Node only | right after the current code, before promise callbacks |
| `queueMicrotask(fn)`, `promise.then(fn)` | browsers and Node | right after the current code (the VIP line) |
| `setTimeout(fn, 0)` | browsers and Node | as a task, once the delay is up |
| `setImmediate(fn)` | Node only | as a task, on the next turn of Node's loop |

Two honest notes:

- The `nextTick`-before-promises order above is for a normal `.js` file. In an ES module ([chapter 29](../29-modules/notes.md)), promise callbacks can run first instead. Don't write code that depends on the order between the two.
- Node's task queue is really a few separate lines (for timers, for finished file and network work, and for `setImmediate`) that it serves in turns. The big rule stays the same: all microtasks first, then the next task.

In everyday code, `setTimeout` and promises (or `queueMicrotask`) are all you need, and they work everywhere. It's enough to recognize the Node extras when you see them.

### Splitting heavy work into chunks

Sometimes you really do have a big job, like resizing thousands of photos. You can't make the job smaller, but you can stop it from hogging the cashier: split it into **chunks** (small pieces) and let other tasks have a turn in between.

If you resized all 3000 photos in one big loop, a click on the Cancel button would have to wait until the very end, just like the late reminder earlier. Too late to cancel anything!

So here's the job in chunks of 1000. The `setTimeout` at the bottom stands in for the user clicking Cancel. After each chunk, `setTimeout(resizeChunk, 0)` puts the next chunk at the *back* of the task queue, so anything already waiting goes first:

```js
function resizePhotos(total, chunkSize) {
  let done = 0;

  function resizeChunk() {
    const end = Math.min(done + chunkSize, total);
    while (done < end) {
      done++; // pretend we resized one photo
    }
    console.log(`Resized ${done} of ${total} photos`);

    if (done < total) {
      setTimeout(resizeChunk, 0); // let others have a turn first
    }
  }

  resizeChunk();
}

setTimeout(() => console.log("Click! The user pressed Cancel"), 0);
resizePhotos(3000, 1000);
```

You'll see:

```
Resized 1000 of 3000 photos
Click! The user pressed Cancel
Resized 2000 of 3000 photos
Resized 3000 of 3000 photos
```

Now the click gets its turn after the first chunk. In a real page, the browser can also redraw the screen between chunks, so a progress bar keeps moving and buttons keep working. The whole job takes a little longer, but the page stays alive.

Two things to notice:

- `resizeChunk` is a closure ([chapter 25](../25-closures/notes.md)). It remembers `done`, `total`, and `chunkSize` from one chunk to the next.
- The break has to be a **task** (`setTimeout`), not a microtask. Microtasks all run before anything else gets a turn (remember Puzzle 6), so chunks queued with `queueMicrotask` would block just like one big loop.

### Web Workers: real extra threads (browser)

Chunking shares the one cashier more fairly. A **Web Worker** hires a second cashier: a real extra thread that runs a separate JavaScript file at the same time as your page.

`main.js`, the page's script:

```js
const worker = new Worker("worker.js");

worker.addEventListener("message", (event) => {
  console.log("Total:", event.data);
});

worker.postMessage(10000000); // send the job to the worker
console.log("The page is still free to respond!");
```

`worker.js`, which runs on its own thread:

```js
self.addEventListener("message", (event) => {
  let total = 0;
  for (let i = 0; i < event.data; i++) {
    total += i;
  }
  self.postMessage(total); // send the answer back
});
```

In the browser console, you'll see:

```
The page is still free to respond!
Total: 49999995000000
```

`new Worker("worker.js")` starts the worker file on its own thread, with its own event loop, so its long loop doesn't block the page. The two don't share variables. They talk by sending **messages**: `postMessage(data)` sends one, and the `message` event receives it in `event.data`. Inside a worker, `self` means "this worker".

Workers can't touch the page (there's no `document` inside them), so they're for heavy calculations, like processing images or crunching big lists. Chrome and Edge won't start a worker from a page you opened by double-clicking the file, so serve it with Live Server, just like modules in chapter 29. Node has its own version of workers in the `node:worker_threads` module. You'll see workers again in [chapter 48](../48-performance/notes.md).

## Common mistakes

**1. Expecting `setTimeout(fn, 0)` to run right away**

```js
let seatsLeft = 10;

setTimeout(() => {
  seatsLeft = seatsLeft - 2; // book 2 seats
}, 0);

console.log(`Seats left: ${seatsLeft}`); // prints: Seats left: 10
```

The booking hasn't happened yet when the last line runs. A 0 ms timer still waits for the current code and every microtask. Fix: use the new value *inside* the callback, or turn the waiting into a promise and `await` it.

**2. Thinking `await` pauses the whole program**

```js
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function saveGame() {
  await wait(500); // pretend saving takes half a second
  console.log("Game saved");
}

saveGame();
console.log("Safe to quit now!");
```

You'll see:

```
Safe to quit now!
Game saved
```

The player is told it's safe to quit before the game is saved. `await` only pauses `saveGame`. The code that *called* it carries on. Fix: wait for the promise that `saveGame()` returns, with `saveGame().then(() => console.log("Safe to quit now!"));` or with `await` inside another `async` function.

**3. Expecting the screen to update in the middle of your code (browser)**

```js
const message = document.querySelector("#message");

message.textContent = "Building your report...";
buildBigReport(); // pretend this takes 3 seconds
message.textContent = "Done!";
```

You'd expect "Building your report..." to show for 3 seconds. It never appears. The browser can only redraw the screen once your code has finished, and by then the text says "Done!". In the meantime the page looks frozen. Fix: split the slow work into chunks with `setTimeout`, or move it to a Web Worker, so the browser gets a chance to redraw.

**4. Wrapping slow code in a promise to make it "async"**

```js
const start = Date.now();

setTimeout(() => {
  console.log(`Timer ran after ${Date.now() - start} ms`);
}, 0);

const report = new Promise((resolve) => {
  while (Date.now() - start < 500) {
    // a slow calculation, still on the main thread
  }
  resolve("Report ready");
});

report.then((message) => console.log(message));
```

You'll see something like this (your number will be a little different):

```
Report ready
Timer ran after 504 ms
```

A promise doesn't move work to another thread. The function inside `new Promise` runs straight away on the main thread (Puzzle 2), so it blocks just the same. Moving the slow part into `.then` wouldn't help either: it would just block as a microtask. Fix: split the work into chunks with `setTimeout`, or move it to a Web Worker.

## Quick recap

- JavaScript runs your code on one main thread, one thing at a time. A long job blocks everything else: timers, clicks, and screen updates.
- The environment (the browser or Node) does the waiting, then lines up your callbacks: timers and events in the **task queue**, promise callbacks and code after `await` in the **microtask queue**.
- The event loop runs one task until the call stack is empty, then **every** microtask, then (in the browser) maybe redraws the screen, then takes the next task.
- So the order is: plain code first, then microtasks, then tasks. `setTimeout(fn, 0)` means "after all that", not "now".
- The function inside `new Promise` runs straight away, and an `async` function runs normally until its first `await`.
- Keep the page responsive by splitting big jobs into chunks with `setTimeout`, or by moving them to a Web Worker.
- Node adds `process.nextTick` (runs before promise callbacks) and `setImmediate` (a task). Its order against `setTimeout(fn, 0)` isn't guaranteed, so don't rely on it.

---

**Next:** try the [exercises](exercises.md), then move on to [41 Memory and Garbage Collection](../41-memory-and-garbage-collection/notes.md).
