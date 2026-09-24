# 31 Promises: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.js`, `ex2.js`, and so on) and run it with `node ex1.js`.
- Every exercise uses timers to pretend that work takes time. Watch *when* each line appears, not just what it says.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Your parcel is on its way

You're waiting at home for a parcel. Make a promise called `delivery` that fulfills after about 2 seconds with the text `Your parcel has arrived!`.

Then, straight away:

1. Print `delivery` itself with `console.log`, to see its state.
2. Print `Waiting for the parcel...`.
3. Use `.then` to print the value when it arrives.

Expected output:

```
Promise { <pending> }
Waiting for the parcel...
Your parcel has arrived!
```

**Bonus:** use `setTimeout` to print `delivery` again after about 3 seconds. What does it look like now?

<details>
<summary>Hint</summary>

Inside `new Promise((resolve, reject) => { ... })`, start a `setTimeout`. When the timer goes off, call `resolve` with the text.

</details>

---

## Exercise 2 (Easy): Gym session

Your fitness app guides you through a workout, one step at a time. Write the `wait(ms)` helper from the notes (try it without looking first), then use it to print:

Expected output:

```
Starting the workout...
Warm-up done
Squats done
Stretching done
Workout complete! Time for a smoothie.
```

Timing: the warm-up takes about 1 second, the squats about 2 seconds, and the stretching about 1 second. The last line appears straight after `Stretching done`.

**Rule:** use one flat chain of `.then`s. No `.then` inside another `.then`.

<details>
<summary>Hint 1</summary>

Start the chain with `wait(1000)`. In each `.then`, print the step that just finished, and start the next wait.

</details>

<details>
<summary>Hint 2</summary>

If a step finishes too early, check that you `return` the `wait(...)` promise. Without `return`, the next step doesn't wait.

</details>

---

## Exercise 3 (Medium): Cash machine

A cash machine takes about a second to talk to the bank before it gives you money.

1. Write `withdraw(balance, amount)`. It returns a promise that, after about 1 second:
   - rejects with an `Error` saying `Amount must be more than $0` if `amount` is 0 or less
   - rejects with an `Error` saying `Not enough money (balance: $100)` if `amount` is more than `balance` (with the real balance)
   - otherwise fulfills with the new balance
2. Write `tryWithdrawal(balance, amount)`. It calls `withdraw` and:
   - prints `New balance: $70` (with the real number) when it works
   - prints `Payment failed: <error message>` when it doesn't
   - always prints `Thank you for banking with us.` at the end, either way
   - **returns** the whole chain, so whoever calls it can wait for it
3. Run these three tries one after another:

```js
tryWithdrawal(100, 30)
  .then(() => tryWithdrawal(100, 500))
  .then(() => tryWithdrawal(100, -5));
```

Expected output (a pair of lines about every second):

```
New balance: $70
Thank you for banking with us.
Payment failed: Not enough money (balance: $100)
Thank you for banking with us.
Payment failed: Amount must be more than $0
Thank you for banking with us.
```

<details>
<summary>Hint 1</summary>

It's the `orderFood` pattern from the notes: a `setTimeout` inside `new Promise`, with a check for each problem and a `return` after each `reject`.

</details>

<details>
<summary>Hint 2</summary>

Which method runs "either way"? Put it at the end of the chain inside `tryWithdrawal`, and put `return` in front of the whole chain.

</details>

---

## Exercise 4 (Medium): Holiday booking

A travel website books your flight, hotel and car hire all at the same time. Start with this pretend booking system:

```js
function book(item, ms, available) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (available) {
        resolve(`${item} booked`);
      } else {
        reject(new Error(`${item} is fully booked`));
      }
    }, ms);
  });
}
```

**Part 1.** Book all three at once with `Promise.all`, in this order: the flight (2000 ms), the hotel (1000 ms) and the car (1500 ms), all available. Print the results, then how long it took in whole seconds. Also add a `.catch` that prints `Booking failed: <error message>`.

Expected output:

```
[ 'Flight booked', 'Hotel booked', 'Car booked' ]
All done in about 2 seconds
```

Why about 2 seconds, and not 4.5? All three bookings run at the same time, so you only wait for the slowest one.

**Part 2.** Make the car unavailable and run it again. Expected output:

```
Booking failed: Car is fully booked
```

Notice *when* it appears: after about 1.5 seconds. `Promise.all` didn't wait for the flight.

**Part 3.** The customer still wants to know what *did* work. Switch to `Promise.allSettled` and print one line per booking.

Expected output:

```
OK: Flight booked
OK: Hotel booked
FAILED: Car is fully booked
```

<details>
<summary>Hint 1</summary>

To measure the time, save `Date.now()` in a variable just before `Promise.all`. Inside `.then`, subtract it from a new `Date.now()`, divide by 1000, and round.

</details>

<details>
<summary>Hint 2</summary>

Each `allSettled` result has a `status`. When it's `"fulfilled"`, the text is in `result.value`. When it's `"rejected"`, the error is in `result.reason`.

</details>

---

## Exercise 5 (Challenge): Hungry and in a hurry

A food delivery app sends your order to several restaurants at once. The first one to accept gets the order. But you're hungry, so if nobody accepts in time, the app gives up.

Start with this data:

```js
const restaurants = [
  { name: "Pizza Planet", prepTime: 2500, open: true },
  { name: "Burger Barn", prepTime: 1500, open: false },
  { name: "Noodle Nook", prepTime: 2000, open: true },
];
```

1. Write `requestOrder(restaurant)`. After `prepTime` milliseconds, it rejects with an `Error` like `Burger Barn is closed` if the restaurant isn't open, or fulfills with a message like `Noodle Nook accepted your order`.
2. Write `withTimeout(promise, ms)`. It returns a promise that settles like `promise`, unless `ms` milliseconds pass first. In that case, it rejects with an `Error` saying `No answer within 1000 ms` (with the real number).
3. Write `findFood(timeLimit)`. It:
   - prints `Looking for food (time limit: 3000 ms)...` (with the real limit)
   - sends a request to every restaurant, using `map` ([chapter 13](../13-array-methods/notes.md))
   - takes the first restaurant that accepts, with a time limit
   - prints the answer, or `Sorry: <error message>`
   - returns the whole chain
4. Try it twice, one after the other:

```js
findFood(3000).then(() => findFood(1000));
```

Expected output:

```
Looking for food (time limit: 3000 ms)...
Noodle Nook accepted your order
Looking for food (time limit: 1000 ms)...
Sorry: No answer within 1000 ms
```

Burger Barn answers first, but it's closed, so it shouldn't win. Pizza Planet is open, but slower than Noodle Nook.

<details>
<summary>Hint 1</summary>

Look at the "Which one do I need?" table in the notes. You need one tool for "the first one to *succeed*" and another for "the first one to *finish*".

</details>

<details>
<summary>Hint 2</summary>

`withTimeout` is a race between the real promise and a timer promise that only ever rejects, like the `timeout(ms)` helper in the notes.

</details>

<details>
<summary>Hint 3</summary>

`restaurants.map((restaurant) => requestOrder(restaurant))` gives you an array of promises, which is exactly what `Promise.any` takes.

</details>

**Bonus:** set every restaurant's `open` to `false` and run `findFood(3000)`. `Promise.any` rejects with an `AggregateError`, and its message (`All promises were rejected`) isn't very friendly. Print `Sorry: every restaurant is closed right now` in that case instead. (`instanceof` from [chapter 27](../27-classes/notes.md) can tell the two kinds of error apart.)

---

## Before you move on

Look at your `tryWithdrawal` and `findFood` functions. Promise chains are a big step up from callback pyramids, but all those `.then`s and arrow functions still take some effort to read.

What if you could write code that waits, but reads top to bottom like normal code, and even use a regular `try`/`catch`? That's exactly what [chapter 32: Async/Await](../32-async-await/notes.md) gives you.
