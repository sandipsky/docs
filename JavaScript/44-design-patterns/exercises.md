# 44 Design Patterns: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.js`, `ex2.js`, and so on).
- Run each one with `node ex1.js`.
- Exercise 5 uses several files and `import`/`export`, so it gets its own folder with a `package.json` (details in the exercise).
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Ride fares

A ride-hailing app works out fares with a growing `if` chain. Copy this into `ex1.js` and run it:

```js
function calculateFare(rideType, km) {
  if (rideType === "economy") {
    return 2.5 + km * 1.2;
  } else if (rideType === "comfort") {
    return 4 + km * 1.8;
  } else if (rideType === "xl") {
    return 5 + km * 2.1;
  } else {
    throw new Error(`Unknown ride type: ${rideType}`);
  }
}

const rides = [
  { rideType: "economy", km: 10 },
  { rideType: "comfort", km: 10 },
  { rideType: "xl", km: 4 },
  { rideType: "helicopter", km: 3 },
];

for (const ride of rides) {
  try {
    const fare = calculateFare(ride.rideType, ride.km);
    console.log(`${ride.rideType}, ${ride.km} km: $${fare.toFixed(2)}`);
  } catch (error) {
    console.log(error.message);
  }
}
```

1. Rewrite `calculateFare` with the **strategy** pattern: put each fare rule in an object called `fareStrategies`, and make `calculateFare` pick the right one. The output must stay exactly the same.
2. The company launches a `green` ride: $3, plus $1.50 per km. Add it with **one new line** in `fareStrategies`. Then add `{ rideType: "green", km: 6 }` to the end of `rides`.

Expected output after both steps:

```
economy, 10 km: $14.50
comfort, 10 km: $22.00
xl, 4 km: $13.40
Unknown ride type: helicopter
green, 6 km: $12.00
```

**Rule:** no `else if` chain and no `switch`. One `if` to catch unknown ride types is fine.

<details>
<summary>Hint 1</summary>

The `shippingMethods` example in the notes has exactly this shape. Each strategy is a small arrow function that takes `km` and returns the fare.

</details>

<details>
<summary>Hint 2</summary>

Looking up a key that isn't in the object, like `fareStrategies["helicopter"]`, gives `undefined`. That's your signal to throw.

</details>

---

## Exercise 2 (Easy): Free trial

A language app lets free users try its tools a few times before asking them to upgrade. Instead of changing every tool, you'll write one **decorator** that works for all of them.

Write `limitCalls(fn, maxCalls)`. It returns a new function that:

- calls `fn` with the same arguments and returns its result, for the first `maxCalls` calls,
- after that, throws an `Error` with the message `Free trial over: <function name> is limited to <maxCalls> uses`.

Test it with this code:

```js
function translateToSpanish(word) {
  const dictionary = { hello: "hola", cat: "gato", thanks: "gracias", friend: "amigo" };
  return dictionary[word] ?? "(not in dictionary)";
}

function celsiusToFahrenheit(celsius) {
  return (celsius * 9) / 5 + 32;
}

const trialTranslate = limitCalls(translateToSpanish, 3);
const trialConvert = limitCalls(celsiusToFahrenheit, 2);

for (const word of ["hello", "cat", "thanks", "friend"]) {
  try {
    console.log(`${word}: ${trialTranslate(word)}`);
  } catch (error) {
    console.log(error.message);
  }
}

for (const celsius of [0, 100, 37]) {
  try {
    console.log(`${celsius}°C = ${trialConvert(celsius)}°F`);
  } catch (error) {
    console.log(error.message);
  }
}

console.log(translateToSpanish("friend")); // the original still works
```

Expected output:

```
hello: hola
cat: gato
thanks: gracias
Free trial over: translateToSpanish is limited to 3 uses
0°C = 32°F
100°C = 212°F
Free trial over: celsiusToFahrenheit is limited to 2 uses
amigo
```

**Rule:** don't change `translateToSpanish` or `celsiusToFahrenheit`.

<details>
<summary>Hint 1</summary>

Each wrapped function needs its own call counter that survives between calls. That's a closure, like `createCounter` in [chapter 25](../25-closures/notes.md).

</details>

<details>
<summary>Hint 2</summary>

Look at `withLogging` in the notes: `...args` to collect the arguments, `fn.name` for the name, and don't forget to return the original's result.

</details>

---

## Exercise 3 (Medium): Parcel tracker

A delivery company sends updates as a parcel moves. Customers can switch alerts off, and some messages should only ever be sent once.

Type out the `Emitter` class from the notes, then give it two new features:

1. `on` **returns an unsubscribe function**. Calling it removes that listener.
2. A new method, **`once(eventName, listener)`**: the listener runs only the first time the event happens, then removes itself.

Test it with this code:

```js
const tracker = new Emitter();

const stopSms = tracker.on("status", (parcel) => {
  console.log(`SMS: parcel ${parcel.id} is ${parcel.status}`);
});
tracker.on("status", (parcel) => {
  console.log(`Website: ${parcel.id} -> ${parcel.status}`);
});
tracker.once("status", (parcel) => {
  console.log(`Tip: track ${parcel.id} in our app!`);
});

tracker.emit("status", { id: "PX-12", status: "packed" });
tracker.emit("status", { id: "PX-12", status: "shipped" });
stopSms(); // the customer turned off text messages
tracker.emit("status", { id: "PX-12", status: "delivered" });
```

Expected output:

```
SMS: parcel PX-12 is packed
Website: PX-12 -> packed
Tip: track PX-12 in our app!
SMS: parcel PX-12 is shipped
Website: PX-12 -> shipped
Website: PX-12 -> delivered
```

<details>
<summary>Hint 1</summary>

The unsubscribe function only needs to call `off` with the same two things `on` received. Return an arrow function, so `this` still means the emitter inside it ([chapter 26](../26-this-keyword/notes.md)).

</details>

<details>
<summary>Hint 2</summary>

`once` is a small decorator. Wrap the listener in a new function that first removes *itself*, then calls the original listener. Subscribe the wrapper with `on`.

</details>

<details>
<summary>Hint 3</summary>

If the tip shows up on every update, check which function your wrapper passes to `off`. The emitter's list holds the *wrapper*, not the original listener, so removing the original does nothing.

</details>

---

## Exercise 4 (Medium): Library search

A library app searches two book services at once. Each one describes books in its own shape, but your display function wants a single shape: `{ title, author, year }`.

```js
// Shaped like a real Open Library search reply (trimmed)
const openLibraryReply = {
  numFound: 3,
  docs: [
    { title: "The Hobbit", author_name: ["J.R.R. Tolkien"], first_publish_year: 1937 },
    { title: "Good Omens", author_name: ["Terry Pratchett", "Neil Gaiman"], first_publish_year: 1990 },
    { title: "Beowulf", first_publish_year: 1000 },
  ],
};

// A made-up second-hand bookshop API: similar data, different shape
const bookshopReply = {
  results: [
    { name: "Dune", writers: [{ fullName: "Frank Herbert" }], published: "1965-08-01" },
    { name: "Mystery Diary", writers: [], published: "2019" },
  ],
};

function printBooks(books) {
  for (const book of books) {
    console.log(`${book.title} by ${book.author} (${book.year})`);
  }
}
```

Write two **adapters**, `fromOpenLibrary(reply)` and `fromBookshop(reply)`. Each one returns an array of `{ title, author, year }` objects:

- `author` joins several authors with `" & "`. If there are no authors, it's `"Unknown author"`.
- `year` must be a **number**. The bookshop sometimes sends a full date, sometimes only a year.

Then add this at the bottom of your file:

```js
const allBooks = [...fromOpenLibrary(openLibraryReply), ...fromBookshop(bookshopReply)];
printBooks(allBooks.toSorted((a, b) => a.year - b.year));
console.log("All years are numbers:", allBooks.every((book) => typeof book.year === "number"));
```

Expected output:

```
Beowulf by Unknown author (1000)
The Hobbit by J.R.R. Tolkien (1937)
Dune by Frank Herbert (1965)
Good Omens by Terry Pratchett & Neil Gaiman (1990)
Mystery Diary by Unknown author (2019)
All years are numbers: true
```

**Rule:** don't change `printBooks`. All the shape-fixing happens in the adapters.

<details>
<summary>Hint 1</summary>

`map` ([chapter 13](../13-array-methods/notes.md)) turns each item into a new object. When an arrow function returns an object directly, wrap it in parentheses: `(doc) => ({ ... })`.

</details>

<details>
<summary>Hint 2</summary>

The missing author looks different in each reply. Beowulf has no `author_name` property at all, while Mystery Diary has an empty `writers` array. `??` ([chapter 07](../07-conditionals/notes.md)) can turn a missing array into an empty one, and then one small helper can handle both cases.

</details>

<details>
<summary>Hint 3</summary>

For the year, the first four characters of `"1965-08-01"` are the year, and so are the first four of `"2019"`. `slice` ([chapter 06](../06-strings/notes.md)) and `Number` ([chapter 05](../05-numbers-and-math/notes.md)) do the rest.

</details>

---

## Exercise 5 (Challenge): Pizza shop

Build the order system for a small pizza shop, split into modules ([chapter 29](../29-modules/notes.md)). It uses five patterns from this chapter at once.

Make a folder called `ex5` with a `package.json` containing `{ "type": "module" }`, and these files:

| File | Pattern | Its job |
|---|---|---|
| `emitter.js` | Observer | Exports your `Emitter` class from the notes |
| `events.js` | Singleton | Exports `orderEvents`: the **one** emitter the whole app shares |
| `menu.js` | Module + Factory | Exports `createPizza(name, size)`. The prices stay private (not exported) |
| `delivery.js` | Strategy | Exports `deliveryCost(method, km)` |
| `orders.js` | | Exports `placeOrder(order)` |
| `kitchen.js` | | Exports `startKitchenScreen()`, which subscribes to orders |
| `main.js` | | Given below |

The shop's rules:

- **Pizzas:** margherita $8, pepperoni $10, veggie $9. Sizes add to the price: small +$0, medium +$2, large +$4. `createPizza` returns `{ name, size, price }`, and throws `Unknown pizza: <name>` or `Unknown size: <size>`.
- **Delivery:** `pickup` is free, `bike` is $3, and `car` is $2 plus $1 per km. Anything else throws `Unknown delivery method: <method>`.
- **`placeOrder({ customer, items, delivery, km })`** builds the pizzas, adds up the total (pizzas plus delivery), and then emits `"orderPlaced"` with `{ customer, pizzas, deliveryFee, total }`.
- **`startKitchenScreen()`** listens for `"orderPlaced"` and prints the pizzas, like `Kitchen: large margherita, small veggie`.

Here's `main.js`:

```js
import { orderEvents } from "./events.js";
import { placeOrder } from "./orders.js";
import { startKitchenScreen } from "./kitchen.js";

startKitchenScreen();

orderEvents.on("orderPlaced", (order) => {
  console.log(`Receipt for ${order.customer}: $${order.total}`);
});

let ordersToday = 0;
orderEvents.on("orderPlaced", () => {
  ordersToday++;
});

const orders = [
  { customer: "Ana", items: [["margherita", "large"], ["veggie", "small"]], delivery: "bike", km: 2 },
  { customer: "Ben", items: [["pepperoni", "medium"]], delivery: "pickup", km: 0 },
  { customer: "Cleo", items: [["hawaiian", "large"]], delivery: "car", km: 5 },
  { customer: "Dev", items: [["veggie", "medium"]], delivery: "drone", km: 1 },
  { customer: "Eli", items: [["pepperoni", "large"], ["margherita", "small"]], delivery: "car", km: 4 },
];

for (const order of orders) {
  try {
    placeOrder(order);
  } catch (error) {
    console.log(`Could not place ${order.customer}'s order: ${error.message}`);
  }
}

console.log(`Orders today: ${ordersToday}`);
```

Run it from inside the `ex5` folder with `node main.js`. Expected output:

```
Kitchen: large margherita, small veggie
Receipt for Ana: $24
Kitchen: medium pepperoni
Receipt for Ben: $12
Could not place Cleo's order: Unknown pizza: hawaiian
Could not place Dev's order: Unknown delivery method: drone
Kitchen: large pepperoni, small margherita
Receipt for Eli: $28
Orders today: 3
```

**Rules:**

- Only `events.js` creates an `Emitter`. Every other file imports `orderEvents` from there.
- `placeOrder` never calls the kitchen or receipt code directly. It only emits.
- A failed order must not reach the kitchen, and must not count towards `Orders today`.

<details>
<summary>Hint 1</summary>

Start with the files that don't import anything: `emitter.js`, `menu.js`, and `delivery.js`. Test each one with a quick `console.log` before you move on.

</details>

<details>
<summary>Hint 2</summary>

`items` is an array of `[name, size]` pairs. Array destructuring in a `map` callback ([chapter 15](../15-destructuring-spread-rest/notes.md)) turns each pair into a pizza neatly, and `reduce` adds up the prices.

</details>

<details>
<summary>Hint 3</summary>

Dev's pizza is fine, but his delivery method isn't. If his order reaches the kitchen, think about the *order* of the steps inside `placeOrder`: do everything that can fail first, and emit last.

</details>

---

## Before you move on

Look back at your Exercise 1 code. The fare rules are clearer now, but what do `2.5` and `1.2` actually mean? Someone reading your code next year would have to guess.

[Chapter 45: Clean Code](../45-clean-code/notes.md) is all about writing code that's easy to read, starting with names that explain themselves. 🧹
