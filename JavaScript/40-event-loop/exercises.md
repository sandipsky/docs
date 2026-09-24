# 40 The Event Loop: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.js`, `ex2.js`, and so on).
- Run each one with `node ex1.js`.
- For the "guess the order" parts, write your guess down *before* you run the code. Being wrong is fine: that's where the learning happens.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Opening the cafe

Every morning, the cafe's app logs the opening routine. Copy this into `ex1.js`:

```js
console.log("Unlock the door");

setTimeout(() => console.log("First customer walks in"), 0);

queueMicrotask(() => console.log("Turn on the coffee machine"));

Promise.resolve().then(() => console.log("Put out the pastries"));

setTimeout(() => console.log("Lunch rush starts"), 50);

console.log("Switch on the lights");
```

1. **Before running it**, write your guess for the output at the top of the file, as comments.
2. Run it and compare. There's no expected output here on purpose: running the file is how you check your guess.
3. At the end of each `console.log` line, add a comment saying where that message waited: `// call stack`, `// microtask queue`, or `// task queue`.
4. Move the `Lunch rush starts` line to the very top of the file and run it again. Does the output change? Write one sentence explaining why.

<details>
<summary>Hint 1</summary>

Sort the lines into three groups first: plain code, microtasks, and tasks. Plain code always goes first, then every microtask, then the tasks.

</details>

<details>
<summary>Hint 2</summary>

Inside each group, think about the order they joined their line. For the two timers, the delay matters too: a 50 ms timer can't be ready before a 0 ms one.

</details>

---

## Exercise 2 (Easy): Service with a smile

A restaurant's training app prints the steps of serving a table, but the lines in the file are in the wrong order. Copy them into `ex2.js`:

```js
console.log("Serve dessert");
console.log("Take the order");
console.log("Bring the menu");
console.log("Say hello");
console.log("Show them to a table");
```

Make the program print the steps in the right order:

```
Say hello
Show them to a table
Bring the menu
Take the order
Serve dessert
```

**Rule:** don't move, delete, or reword any line. You may only wrap a line's `console.log(...)` inside `setTimeout`, `queueMicrotask`, or `Promise.resolve().then(...)`.

<details>
<summary>Hint 1</summary>

Two of the lines are already in the right order and should come first. Which ones? They can stay as plain code.

</details>

<details>
<summary>Hint 2</summary>

"Bring the menu" sits *below* "Take the order" in the file but has to print *before* it. Which of the two waiting lines gets served first?

</details>

<details>
<summary>Hint 3</summary>

Two timers with the same delay run in the order they were created. "Serve dessert" is created first but must print last. What else can you change about a timer?

</details>

---

## Exercise 3 (Medium): Movie night

Your cinema app books seats, but its messages come out in a confusing order. Copy this into `ex3.js`:

```js
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function bookSeat(movie) {
  console.log(`Booking a seat for ${movie}...`);
  await wait(100);
  console.log(`Seat booked for ${movie}!`);
}

bookSeat("Dune");
setTimeout(() => console.log("Popcorn is ready"), 0);
console.log("Enjoy the movie!");
```

1. Guess the output, then run it and check.
2. Add a comment under the code explaining, in your own words, why `Enjoy the movie!` doesn't come last.
3. Now fix the bottom part. Book a seat for `"Dune"`, *then* one for `"Wicked"`, and only then print `Enjoy the movie!`. Keep the popcorn line exactly as it is, straight after you start the bookings.

Expected output after your fix:

```
Booking a seat for Dune...
Popcorn is ready
Seat booked for Dune!
Booking a seat for Wicked...
Seat booked for Wicked!
Enjoy the movie!
```

**Rule:** don't change `wait` or `bookSeat`.

<details>
<summary>Hint 1</summary>

`bookSeat` is an `async` function, so it returns a promise. What can you do with a promise to run something only after it has finished?

</details>

<details>
<summary>Hint 2</summary>

One clean way is a new `async` function (for example `movieNight`) that uses `await` for each booking, then prints the last message. Then call it, followed by the popcorn line.

</details>

<details>
<summary>Hint 3</summary>

Why does the popcorn still print second? It's a 0 ms timer, and the first booking needs a 100 ms timer. Which one is ready first?

</details>

---

## Exercise 4 (Medium): Newsletter in batches

Your online shop sends a newsletter to every subscriber. On a big list, sending them all in one loop would hog the main thread, and new orders would have to wait. So you'll send the emails in batches, and give other tasks a turn between batches.

Start `ex4.js` with this list:

```js
const subscribers = [
  "ana@mail.com", "ben@mail.com", "cai@mail.com", "dev@mail.com",
  "eli@mail.com", "fay@mail.com", "gus@mail.com",
];
```

Write a function `sendNewsletter(emails, batchSize)`. It "sends" one batch by printing it on one line, then waits for a new task before the next batch. When everything is sent, it prints a final message.

Test it with these two lines at the bottom of your file. The first one stands in for a customer placing an order while the newsletter goes out:

```js
setTimeout(() => console.log("New order received!"), 0);
sendNewsletter(subscribers, 3);
```

Expected output:

```
Batch 1: ana@mail.com, ben@mail.com, cai@mail.com
New order received!
Batch 2: dev@mail.com, eli@mail.com, fay@mail.com
Batch 3: gus@mail.com
All 7 emails sent!
```

**Rule:** each batch must run in its own task. No sending everything in one loop!

<details>
<summary>Hint 1</summary>

Look back at `resizePhotos` in the notes. You need an inner function that sends *one* batch, and variables outside it (a closure) that remember where you are in the list.

</details>

<details>
<summary>Hint 2</summary>

`slice(start, start + batchSize)` gives you one batch, and `join(", ")` turns it into one line of text. Remember that `slice` is fine with an end index past the end of the array.

</details>

<details>
<summary>Hint 3</summary>

At the end of a batch: if there are emails left, schedule the next batch with `setTimeout(..., 0)`. Otherwise, print the final message. Why does the order message sneak in after batch 1, and not before it?

</details>

**Bonus:** try `batchSize` 2, and predict where `New order received!` lands before you run it.

---

## Exercise 5 (Challenge): Build your own event loop

The best way to really understand a machine is to build a small one yourself. You'll write a pretend event loop with two arrays as the waiting lines.

Start `ex5.js` with this:

```js
const microtasks = []; // the VIP line
const tasks = [];      // the regular line
```

Write three functions:

- `fakeQueueMicrotask(fn)` adds `fn` to the end of `microtasks`.
- `fakeSetTimeout(fn)` adds `fn` to the end of `tasks`. (No delay: every fake timer counts as "ready".)
- `runEventLoop()` follows the cashier's rules: run *every* microtask (including ones added along the way), then take *one* task and run it, and repeat until both lines are empty.

Then paste this scenario at the bottom of your file:

```js
console.log("script start");

fakeSetTimeout(() => {
  console.log("task 1");
  fakeQueueMicrotask(() => console.log("micro inside task 1"));
});

fakeSetTimeout(() => console.log("task 2"));

fakeQueueMicrotask(() => {
  console.log("micro 1");
  fakeQueueMicrotask(() => console.log("micro 2 (added by micro 1)"));
});

console.log("script end");

runEventLoop();
```

Expected output:

```
script start
script end
micro 1
micro 2 (added by micro 1)
task 1
micro inside task 1
task 2
```

Finally, prove your loop behaves like the real one. Copy the scenario into a new file, `ex5-real.js`. Replace `fakeSetTimeout(fn)` with a real `setTimeout(fn, 0)` and `fakeQueueMicrotask` with the real `queueMicrotask`, and delete the `runEventLoop();` line. Run it. You should get exactly the same output.

**Rule:** in `runEventLoop`, take callbacks from the *front* of each array, so the first to join is the first served.

<details>
<summary>Hint 1</summary>

Functions are values ([chapter 09](../09-functions/notes.md)), so an array can hold them. `shift()` ([chapter 10](../10-arrays/notes.md)) removes the first item and gives it back to you. Then you can call it with `()`.

</details>

<details>
<summary>Hint 2</summary>

"Run every microtask, even ones added along the way" fits a `while` loop that keeps going as long as `microtasks.length > 0`, taking one callback off the front each time. New arrivals join the back, so the loop reaches them too.

</details>

<details>
<summary>Hint 3</summary>

The outer loop keeps going while *either* array still has something in it. Inside it: empty the VIP line first, then run just one task, if there is one.

</details>

---

## Before you move on

Try this tiny file:

```js
let ticks = 0;
setInterval(() => ticks++, 1000);
```

It never finishes (press `Ctrl + C` to stop it). The interval keeps adding a new task every second, so Node always has something left to wait for.

A timer you forget to clear keeps running, and it keeps everything it uses alive in memory, too. That's one of the classic **memory leaks**, and [chapter 41](../41-memory-and-garbage-collection/notes.md) is all about them. 🙂
