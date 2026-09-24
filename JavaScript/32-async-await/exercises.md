# 32 Async/Await: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.js`, `ex2.js`, and so on) and run it with `node ex1.js`.
- These exercises call their `async` functions normally, so you don't need a `package.json`. (If you add one with `"type": "module"` to try top-level `await`, that's fine too. Everything here still works.)
- Timers pretend that work takes time. Watch *when* each line appears, not just what it says.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): From chain to `await`

Your morning routine app was written with a `.then` chain. Copy it into `ex1.js` and run it once to see what it does:

```js
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function morningRoutine() {
  console.log("Alarm rings");
  return wait(1000)
    .then(() => {
      console.log("Shower done");
      return wait(2000);
    })
    .then(() => {
      console.log("Breakfast eaten");
      return wait(1000);
    })
    .then(() => {
      console.log("Out the door!");
    });
}

morningRoutine();
```

Now rewrite `morningRoutine` as an `async` function that uses `await`. It must print exactly the same lines, at the same moments (straight away, then after about 1, 3 and 4 seconds):

```
Alarm rings
Shower done
Breakfast eaten
Out the door!
```

**Rule:** no `.then` anywhere in your version of `morningRoutine`.

<details>
<summary>Hint</summary>

Follow the three-step recipe from the notes. Each `return wait(...)` inside a `.then` becomes an `await wait(...);` line of its own.

</details>

---

## Exercise 2 (Easy): Bug hunt at the pizza shop

This pizza tracker has **3 bugs**. Copy it into `ex2.js`, run it, and fix one bug at a time.

```js
// Pizza order tracker
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getStatus(orderNumber) {
  await wait(1000);
  return `Order ${orderNumber}: out for delivery`;
}

async function checkAll(orderNumbers) {
  orderNumbers.forEach(async (orderNumber) => {
    const status = getStatus(orderNumber);
    console.log(status);
  });
  console.log("All orders checked");
}

checkAll([41, 42, 43]);
```

When it's fixed, you should see one line about every second, and the last line straight after the third:

```
Order 41: out for delivery
Order 42: out for delivery
Order 43: out for delivery
All orders checked
```

<details>
<summary>Hint 1</summary>

The first error stops the whole file before anything runs. Read the message: which function uses `await` without being allowed to?

</details>

<details>
<summary>Hint 2</summary>

Seeing `Promise { <pending> }`? Something is being printed before it has finished. What's missing in front of `getStatus(...)`?

</details>

<details>
<summary>Hint 3</summary>

If `All orders checked` comes first, the loop isn't waiting. Which kind of loop waits for `await` on every turn?

</details>

---

## Exercise 3 (Medium): Cinema box office

A cinema's booking system takes about half a second to reserve each seat. Start with this code:

```js
const seats = { A1: "free", A2: "taken", A3: "free" };

function reserveSeat(seat) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (seats[seat] === undefined) {
        reject(new Error(`Seat ${seat} doesn't exist`));
        return;
      }
      if (seats[seat] === "taken") {
        reject(new Error(`Seat ${seat} is already taken`));
        return;
      }
      seats[seat] = "taken";
      resolve(`Seat ${seat} is yours`);
    }, 500);
  });
}
```

1. Write `async function buyTicket(seat)`. Using `try`/`catch`/`finally`, it:
   - prints the message from `reserveSeat` and returns `true` when it works
   - prints `Sorry: <error message>` and returns `false` when it doesn't
   - always prints `Next in line, please.`
2. Write `async function buyTickets(seatList)`. It buys the tickets one at a time, counts how many worked, and finally prints `Done: 2 of 4 seats booked` (with the real numbers).
3. Call `buyTickets(["A1", "A2", "B7", "A3"]);`

Expected output (a pair of lines about every half second):

```
Seat A1 is yours
Next in line, please.
Sorry: Seat A2 is already taken
Next in line, please.
Sorry: Seat B7 doesn't exist
Next in line, please.
Seat A3 is yours
Next in line, please.
Done: 2 of 4 seats booked
```

<details>
<summary>Hint 1</summary>

`finally` runs even when `try` or `catch` has a `return` in it. So "Next in line, please." still prints before the function hands back `true` or `false`.

</details>

<details>
<summary>Hint 2</summary>

In `buyTickets`, use a `for...of` loop and `await buyTicket(seat)`, so each customer waits their turn. The value you get back tells you whether to add one to your counter.

</details>

---

## Exercise 4 (Medium): Morning dashboard

Your phone's morning dashboard shows the weather, the news and your calendar. But it needs to know who you are first. Start with these pretend loaders:

```js
function getUser() {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ name: "Maya", city: "Lisbon" }), 1000);
  });
}

function getWeather(city) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(`22°C and sunny in ${city}`), 2000);
  });
}

function getNews() {
  return new Promise((resolve) => {
    setTimeout(() => resolve("3 new headlines"), 1000);
  });
}

function getCalendar(name) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(`${name} has 2 meetings today`), 1500);
  });
}
```

Write `async function loadDashboard()`. It gets the user first, then loads the other three **at the same time**. Print a greeting as soon as you have the user, then the three results, then how long it took in whole seconds (with `Date.now()` and `Math.round`, like in chapter 31's exercises).

Expected output:

```
Hi Maya!
22°C and sunny in Lisbon
3 new headlines
Maya has 2 meetings today
Dashboard ready in about 3 seconds
```

`Hi Maya!` appears after about 1 second, and the rest about 2 seconds after that.

<details>
<summary>Hint 1</summary>

Weather and calendar need the user, so the user has to come first, on its own. The news doesn't need anything, but it's fine to start it together with the other two.

</details>

<details>
<summary>Hint 2</summary>

`await Promise.all([...])` with the three calls inside, and array destructuring on the left to give each result a name.

</details>

**Bonus:** change your function to load all four one by one. How long does the dashboard take now? Imagine waiting for that every morning.

---

## Exercise 5 (Challenge): Online shop order queue

An online shop processes its orders one at a time, so that two customers can never buy the same last item. Start with this data:

```js
const orders = [
  { id: 101, item: "Laptop stand", price: 35 },
  { id: 102, item: "Desk lamp", price: 20 },
  { id: 103, item: "Office chair", price: 150 },
  { id: 104, item: "Office chair", price: 150 },
  { id: 105, item: "Monitor", price: 180 },
];

const stock = { "Laptop stand": 3, "Desk lamp": 0, "Office chair": 1, Monitor: 2 };
```

1. Write `async function processOrder(order)`. It waits about half a second (use your `wait` helper). If there's none of the item left in `stock`, it **throws** an `Error` like `Desk lamp is out of stock`. Otherwise, it takes one off the stock and returns the order.
2. Write `async function processAll(orderList)`. It:
   - prints `Processing 5 orders...` (with the real number)
   - processes the orders one at a time
   - prints `Order 101: Laptop stand shipped ($35)` for each success, or `Order 102 failed: Desk lamp is out of stock` for each failure, and **keeps going** after a failure
   - finally prints how many were shipped and the total money taken
3. Call `processAll(orders);`

Expected output (one order about every half second):

```
Processing 5 orders...
Order 101: Laptop stand shipped ($35)
Order 102 failed: Desk lamp is out of stock
Order 103: Office chair shipped ($150)
Order 104 failed: Office chair is out of stock
Order 105: Monitor shipped ($180)
Shipped 3 of 5 orders. Revenue: $365
```

**Rules:**

- Work out the revenue with `reduce` ([chapter 13](../13-array-methods/notes.md)). Don't type 365 yourself.
- Use destructuring ([chapter 15](../15-destructuring-spread-rest/notes.md)) at least once, for example to unpack `id`, `item` and `price` from an order.

<details>
<summary>Hint 1</summary>

In an `async` function, `throw` rejects the promise it returns. So the caller can catch that error with `try`/`catch` around its `await`.

</details>

<details>
<summary>Hint 2</summary>

Put the `try`/`catch` *inside* the `for...of` loop, around one order. Then a failure only affects that order, and the loop carries on with the next one.

</details>

<details>
<summary>Hint 3</summary>

Keep an array of the orders that shipped. After the loop, its `length` is the number shipped, and `reduce` can add up their prices.

</details>

**Bonus:** after the summary, print what's left in stock, one line per item, using `Object.entries` ([chapter 11](../11-objects/notes.md)):

```
Laptop stand: 2 left
Desk lamp: 0 left
Office chair: 0 left
Monitor: 1 left
```

---

## Before you move on

Every "slow" function in this chapter was pretend: a timer standing in for real work. In the next chapter, the waiting becomes real. You'll use `await` to get live data from real servers on the internet, like weather forecasts.

Head to [chapter 33: Fetch and APIs](../33-fetch-and-apis/notes.md).
