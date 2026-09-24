# 36 Iterators and Generators

## What is it?

An **iterable** is anything you can loop over with `for...of`: arrays, strings, Maps, and Sets. An **iterator** is the helper behind the scenes that hands out the values, one at a time, whenever it's asked for the next one.

A **generator** is a special kind of function that makes iterators for you. It can pause in the middle, hand you a value, and later carry on from exactly where it stopped.

## Why does it matter?

You've looped over arrays, strings, Maps, and Sets with the same `for...of`, and spread them all with `...`. They're very different things, so how does one loop work on all of them? This chapter shows the simple agreement they all follow. Once you know it, you can make your own objects work the same way.

Right now, your own objects can't do that:

```js
class Playlist {
  constructor(songs) {
    this.songs = songs;
  }
}

const playlist = new Playlist(["Fast Car", "Hey Ya!"]);

for (const song of playlist) {
  console.log(song);
}
// TypeError: playlist is not iterable
```

By the end of this chapter, that loop will work.

Generators also let you produce values **on demand**, only when someone asks for them. That makes some things possible that arrays can't do at all:

- An endless supply of order numbers or ticket numbers, without building an endless array.
- Reading a big list of results page by page, loading the next page only when you actually need it.

## Real-world example

Think of the **"take a number" ticket dispenser** at a busy deli counter.

The dispenser doesn't print every ticket in the morning. It only knows how to give you *the next one*. You pull, you get a number. The next person pulls, they get the next number. When the roll runs out, it tells you it's empty.

| At the deli counter | In JavaScript |
|---|---|
| The deli counter, which has a dispenser you can use | An **iterable** |
| The ticket dispenser itself | An **iterator** |
| Pulling a ticket | Calling `next()` |
| The number on your ticket | `value` |
| "Sorry, the roll is empty" | `done: true` |

Generators add one more picture: a **bookmark in a book**. You read a few pages, slip the bookmark in, and close the book. Later, you open it at the bookmark and keep reading from exactly where you left off. A generator does the same thing with a function.

## How it works

### Iterables: things you can loop over

You already know several iterables. `for...of` works on all of them, and so do spread (`...`) and array destructuring from [chapter 15](../15-destructuring-spread-rest/notes.md):

```js
const [first, second] = "Hey"; // a string gives you its letters
console.log(first, second); // prints: H e

const scores = new Set([7, 9, 7, 4]);
console.log([...scores]);        // prints: [ 7, 9, 4 ]
console.log(Math.max(...scores)); // prints: 9
```

A plain object is **not** iterable. JavaScript can't guess what "the next value" of an object should be: the next key? The next value? Both?

```js
const order = { item: "Pizza", qty: 2 };

for (const part of order) {
  console.log(part);
}
// TypeError: order is not iterable
```

For objects, you pick what to loop over with `Object.keys`, `Object.values`, or `Object.entries` from [chapter 11](../11-objects/notes.md). Those give you arrays, and arrays are iterable.

### Iterators: `next()` and `{ value, done }`

Here's what `for...of` does behind the scenes. First, it asks the iterable for an **iterator**. Then it calls the iterator's `next()` method again and again. Each call hands back a small object with two properties:

- `value`: the next value.
- `done`: `false` while there are values left, `true` when it's finished.

You can do the same thing by hand. Arrays give you an iterator through a method with an unusual name, `[Symbol.iterator]` (more on that name in a moment):

```js
const queue = ["Ravi", "Hana"];
const dispenser = queue[Symbol.iterator](); // get an iterator from the array

console.log(dispenser.next()); // prints: { value: 'Ravi', done: false }
console.log(dispenser.next()); // prints: { value: 'Hana', done: false }
console.log(dispenser.next()); // prints: { value: undefined, done: true }
console.log(dispenser.next()); // prints: { value: undefined, done: true }
```

Once an iterator says `done: true`, it stays done. Like the empty ticket roll, it has nothing more to give.

So a `for...of` loop is really a short way of writing this:

```js
const queue = ["Ravi", "Hana"];
const dispenser = queue[Symbol.iterator]();

let ticket = dispenser.next();
while (!ticket.done) {
  console.log(`Now serving: ${ticket.value}`);
  ticket = dispenser.next();
}
```

You'll see:

```
Now serving: Ravi
Now serving: Hana
```

This agreement, "give me an iterator, and the iterator has a `next()` that returns `{ value, done }`", is called the **iterator protocol**. A **protocol** is a set of rules that everyone agrees to follow. Arrays, strings, Maps, and Sets all follow it, and that's why one loop works on all of them.

### Symbols (a quick look)

Back in [chapter 03](../03-data-types/notes.md), you heard about a rare primitive type called **symbol**. Here it is. A symbol is a value that's guaranteed to be unique. Even two symbols with the same description are different:

```js
const idA = Symbol("id");
const idB = Symbol("id");

console.log(idA === idB);     // prints: false
console.log(typeof idA);      // prints: symbol
console.log(idA.description); // prints: id
```

Symbols can be used as object keys, and a symbol key never clashes with any other key. (In [chapter 35](../35-map-and-set/notes.md) you read that object keys are strings. Symbols are the one other kind of key an object can have.)

JavaScript has a few built-in symbols, and `Symbol.iterator` is one of them. When an object has a method stored under the key `Symbol.iterator`, JavaScript knows the object is iterable, and it calls that method to get an iterator. Because the key is a symbol, it can never mix with your own methods, even one you happen to name `iterator`.

### Making your own iterable

Say a hotel's first floor has rooms 101 to 105. Instead of typing out an array of every room number, you can make an object that only knows the first and last room, and still loop over it:

```js
const floorOne = {
  first: 101,
  last: 105,

  [Symbol.iterator]() {
    let current = this.first;
    const last = this.last;

    return {
      next() {
        if (current > last) {
          return { value: undefined, done: true };
        }
        const value = current;
        current += 1;
        return { value, done: false };
      },
    };
  },
};

console.log([...floorOne]); // prints: [ 101, 102, 103, 104, 105 ]
```

There's a lot going on, so let's take it piece by piece:

- `[Symbol.iterator]() { ... }` is a method whose key is the symbol. The square brackets mean "use the value of `Symbol.iterator` as the key", like bracket notation from [chapter 11](../11-objects/notes.md).
- Every time someone wants to loop, JavaScript calls that method, and it returns a **fresh** iterator: an object with a `next()` method. That's why you can loop over `floorOne` as many times as you like.
- `next()` remembers `current` between calls thanks to a closure ([chapter 25](../25-closures/notes.md)).
- We copy `this.first` and `this.last` into variables first. Inside `next()`, `this` would mean the little iterator object, not `floorOne` (remember from [chapter 26](../26-this-keyword/notes.md) that `this` depends on how a function is called).

It works, but that's a lot of bookkeeping for "count from 101 to 105". Generators fix that.

### Generators: `function*` and `yield`

A **generator function** is written with a star: `function*`. Inside it, the keyword `yield` hands out a value and **pauses** the function right there, like slipping in a bookmark. The next time a value is needed, the function wakes up at the bookmark and carries on.

```js
function* boardingCalls() {
  console.log("Gate opens");
  yield "Group 1";
  console.log("Next group, please");
  yield "Group 2";
}

const calls = boardingCalls();
console.log("Nothing has run yet");

console.log(calls.next());
console.log(calls.next());
console.log(calls.next());
```

You'll see:

```
Nothing has run yet
Gate opens
{ value: 'Group 1', done: false }
Next group, please
{ value: 'Group 2', done: false }
{ value: undefined, done: true }
```

Step by step:

1. Calling `boardingCalls()` does **not** run its body. It gives you a **generator object**, which is an iterator. That's why "Nothing has run yet" is printed first.
2. The first `next()` runs the body up to the first `yield`. `yield "Group 1"` hands out `"Group 1"` and pauses.
3. The second `next()` picks up right after that `yield`, prints "Next group, please", and runs until the next `yield`.
4. The third `next()` carries on, reaches the end of the function, and gets `done: true`.

You'll rarely call `next()` yourself, though. A generator object is iterable too, so `for...of` and spread work on it:

```js
function* boardingCalls() {
  yield "Group 1";
  yield "Group 2";
  yield "Group 3";
}

for (const group of boardingCalls()) {
  console.log(`Now boarding: ${group}`);
}

console.log([...boardingCalls()]);
```

You'll see:

```
Now boarding: Group 1
Now boarding: Group 2
Now boarding: Group 3
[ 'Group 1', 'Group 2', 'Group 3' ]
```

Now here are the hotel rooms again, written as a generator:

```js
function* roomNumbers(first, last) {
  for (let room = first; room <= last; room++) {
    yield room;
  }
}

console.log([...roomNumbers(101, 105)]); // prints: [ 101, 102, 103, 104, 105 ]
```

Same result as the long version, in a few lines. The generator keeps track of `room` between values for you.

### Making a class iterable

Now you can fix the `Playlist` from the start of the chapter. Give the class a generator method called `[Symbol.iterator]`, with a star in front:

```js
class Playlist {
  #songs;

  constructor(songs) {
    this.#songs = songs;
  }

  *[Symbol.iterator]() {
    for (const song of this.#songs) {
      yield song;
    }
  }
}

const playlist = new Playlist(["Fast Car", "Hey Ya!", "Dreams"]);

for (const song of playlist) {
  console.log(`Playing: ${song}`);
}

const [opener] = playlist;
console.log(`Opening song: ${opener}`);
```

You'll see:

```
Playing: Fast Car
Playing: Hey Ya!
Playing: Dreams
Opening song: Fast Car
```

The songs stay private (the `#songs` field from [chapter 27](../27-classes/notes.md)), but anyone can still loop over the playlist, spread it, or destructure it. And because each `for...of` calls `[Symbol.iterator]()` again, every loop gets a brand-new generator that starts from the first song.

> **Tip:** inside a generator, `yield* this.#songs;` is a shortcut for that whole `for...of` loop. `yield*` hands out every value of another iterable, one by one.

### Endless sequences and lazy evaluation

Here's the deli's ticket dispenser as code. It never runs out:

```js
function* ticketNumbers() {
  let number = 1;
  while (true) {
    yield `T-${String(number).padStart(3, "0")}`;
    number++;
  }
}

const tickets = ticketNumbers();

console.log(tickets.next().value); // prints: T-001
console.log(tickets.next().value); // prints: T-002
console.log(tickets.next().value); // prints: T-003
```

Normally, `while (true)` is an infinite loop that freezes your program ([chapter 08](../08-loops/notes.md)). Inside a generator, it's safe. The function pauses at every `yield` and only runs again when someone asks for the next ticket.

This idea is called **lazy evaluation**: doing the work only when its result is actually needed, not ahead of time. Think of a sandwich shop that makes each sandwich when it's ordered, instead of making a thousand at 6 a.m. and hoping people turn up.

That makes endless generators great **ID generators**. Every order, user, or ticket gets the next number, and you never run out.

You can also loop over an endless generator, as long as the loop has a way out. Add this below the code above:

```js
for (const ticket of ticketNumbers()) {
  console.log(`Now serving ${ticket}`);
  if (ticket === "T-003") {
    break; // without this, the loop would never end
  }
}
```

You'll see:

```
Now serving T-001
Now serving T-002
Now serving T-003
```

### Iterator helpers: `map`, `filter`, `take`, and friends

Iterators have their own versions of the array methods from [chapter 13](../13-array-methods/notes.md): `map`, `filter`, `find`, `some`, `every`, `reduce`, `forEach`, and `flatMap`. They also have a few of their own:

- `take(n)`: stop after `n` values.
- `drop(n)`: skip the first `n` values.
- `toArray()`: collect the values into a real array.

Here's a real question with an endless answer: which years are leap years? There's no last year, so a generator is a natural fit.

```js
function* yearsFrom(start) {
  let year = start;
  while (true) {
    yield year;
    year++;
  }
}

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

const nextLeapYears = yearsFrom(2026).filter(isLeapYear).take(3).toArray();
console.log(nextLeapYears); // prints: [ 2028, 2032, 2036 ]
```

Read the chain like a sentence: "from all the years starting at 2026, keep the leap years, take the first three, and put them in an array."

But wait: how can `filter` work on an endless list without freezing? Because iterator helpers are lazy too. They don't build a whole new list at each step. Each year travels through the chain on its own, and as soon as `take` has enough, the chain stops asking for more. You can watch it happen. Add this to the same file, below the code above:

```js
const checked = [];

const firstTwo = yearsFrom(2026)
  .filter((year) => {
    checked.push(year); // note down every year that filter looks at
    return isLeapYear(year);
  })
  .take(2)
  .toArray();

console.log(firstTwo);            // prints: [ 2028, 2032 ]
console.log(checked.join(", ")); // prints: 2026, 2027, 2028, 2029, 2030, 2031, 2032
```

`filter` looked at exactly seven years and stopped at 2032, the moment `take` had its two leap years.

The helpers work on every built-in iterator too, like the ones you get from a Map's `keys()`, `values()`, and `entries()`:

```js
const stock = new Map([
  ["apples", 12],
  ["pears", 0],
  ["plums", 7],
]);

const inStock = stock
  .entries()
  .filter(([, count]) => count > 0) // skip the key, keep the count
  .map(([fruit]) => fruit)
  .toArray();

console.log(inStock); // prints: [ 'apples', 'plums' ]
```

Here's how they compare with the array methods you already know:

| | Array methods | Iterator helpers |
|---|---|---|
| Work on | Arrays | Any iterator: generators, `map.keys()`, `set.values()`, ... |
| When the work happens | Right away, on every item | Only when a value is asked for (lazy) |
| What each step gives back | A whole new array | Another iterator (use `toArray()` to get an array) |
| Endless sequences | Impossible | Fine, with `take` or `find` |

> **Watch out:** iterator helpers are new. They became part of the official JavaScript standard in 2025. They work in Node 22 and newer (you have Node 24) and in up-to-date browsers, but older browsers don't have them. In older code, you'll see people spread the iterator into an array first (`[...stock.entries()].filter(...)`) and use the array methods instead.

### Async generators and `for await...of` (a quick look)

Sometimes values arrive **over time**. A server might send a long list of customers one page at a time, and each page takes a moment to load.

An **async generator** (`async function*`) handles that. Inside it, you can `await` ([chapter 32](../32-async-await/notes.md)) and `yield` values as they arrive. You loop over it with `for await...of`, which waits for each value before running the loop body.

```js
const pages = [["Ana", "Ben"], ["Cleo", "Dev"], ["Eli"]]; // pretend server data

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function* loadCustomers() {
  for (let page = 1; page <= pages.length; page++) {
    console.log(`(loading page ${page}...)`);
    await wait(300); // pretend this is a slow network request
    yield* pages[page - 1];
  }
}

async function main() {
  for await (const customer of loadCustomers()) {
    console.log(customer);
  }
  console.log("Done!");
}

main();
```

You'll see (with a short pause before each page):

```
(loading page 1...)
Ana
Ben
(loading page 2...)
Cleo
Dev
(loading page 3...)
Eli
Done!
```

Notice that page 2 only starts loading after Ana and Ben have been handled. The generator is lazy, so if you `break` out of the loop early, the later pages are never loaded at all. In a real app, the `await wait(300)` line would be a `fetch` call from [chapter 33](../33-fetch-and-apis/notes.md), with the page number in the URL.

`for await...of` has to be inside an `async` function, like `main` here (or at the top level of a module, from [chapter 29](../29-modules/notes.md)).

## Common mistakes

**1. Reusing a generator that's already used up**

```js
function* boardingCalls() {
  yield "Group 1";
  yield "Group 2";
}

const calls = boardingCalls();
console.log([...calls]); // prints: [ 'Group 1', 'Group 2' ]
console.log([...calls]); // prints: []
```

A generator object is a one-way trip. Once it's done, it stays done. Call the generator function again to get a fresh one: `[...boardingCalls()]`. (A `break` inside `for...of`, or a helper like `take`, also finishes off the generator it was reading from.)

**2. Forgetting the star**

```js
function ticketNumbers() {
  yield "T-001";
}
// SyntaxError: Unexpected string
```

Without the `*`, this is a normal function, and a normal function doesn't understand `yield`. The error message doesn't even mention `yield`, which makes this one hard to spot. Fix: `function* ticketNumbers()`.

**3. Asking for "everything" from an endless generator**

```js
function* ticketNumbers() {
  let number = 1;
  while (true) {
    yield number;
    number++;
  }
}

const allTickets = [...ticketNumbers()]; // never finishes!
```

Spread, `toArray()`, and a `for...of` without a `break` all want *every* value, and an endless generator never runs out. Your program freezes and, after a while, crashes with `FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory`. Press `Ctrl + C` to stop it. Always limit an endless generator first, with `take(n)` or a `break`.

**4. Mixing up arrays and iterators**

```js
const scores = [88, 92, 75, 64];
console.log(scores.take(2));
// TypeError: scores.take is not a function
```

`take` and `drop` belong to iterators, not arrays. For an array, use `scores.slice(0, 2)`. Or get an iterator first with `values()`, but then don't forget to turn the result back into an array:

```js
const scores = [88, 92, 75, 64];

console.log(scores.values().take(2));           // prints: Object [Iterator Helper] {}
console.log(scores.values().take(2).toArray()); // prints: [ 88, 92 ]
```

Iterator helpers give you back another iterator, not an array. Nothing has even been worked out yet. Add `.toArray()` at the end, or loop over the result with `for...of`.

**5. Using `for...of` instead of `for await...of`**

```js
async function* loadCustomers() {
  yield "Ana";
}

for (const customer of loadCustomers()) {
  console.log(customer);
}
// TypeError: loadCustomers is not a function or its return value is not iterable
```

An async generator hands out its values over time, so a plain `for...of` can't use it. Write `for await (const customer of loadCustomers())`, inside an `async` function.

## Quick recap

- An **iterable** is anything `for...of`, spread, and destructuring can use: arrays, strings, Maps, Sets. Plain objects aren't iterable.
- Behind the scenes, `for...of` gets an **iterator** from the `[Symbol.iterator]()` method and calls its `next()`, which returns `{ value, done }`.
- A **symbol** is a unique value. `Symbol.iterator` is the built-in key that marks an object as iterable.
- A **generator** (`function*`) makes iterators the easy way: `yield` hands out a value and pauses until the next one is needed.
- Generators are **lazy**, so they can describe endless sequences, like ticket numbers. Just never ask for *all* of an endless one.
- **Iterator helpers** (`map`, `filter`, `take`, `drop`, `toArray`, ...) work on any iterator, one value at a time. They're new (standard since 2025).
- `async function*` with `for await...of` handles values that arrive over time, like pages of results.

---

**Next:** try the [exercises](exercises.md), then move on to [37 Regular Expressions](../37-regular-expressions/notes.md).
