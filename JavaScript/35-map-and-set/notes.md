# 35 Map and Set

## What is it?

`Set` and `Map` are two built-in **collections**: containers that hold many values, like the arrays and objects you already know.

- A **Set** is a list of unique values. Each value can be in it only once.
- A **Map** is a list of key/value pairs, like an object. But its keys can be anything (numbers, objects, even functions), not just strings.

## Why does it matter?

Arrays and objects can do almost anything, but a few everyday jobs are clumsy with them.

**Keeping a list without duplicates.** With an array, you have to check `includes` before every `push`, and it's easy to forget:

```js
const subscribers = [];

function subscribe(email) {
  if (!subscribers.includes(email)) {
    subscribers.push(email);
  }
}
```

A Set does that check for you, every time.

**Using something other than a string as a key.** Say you want to count visits per customer, and each customer is an object. With a plain object as the lookup table, this goes wrong:

```js
const alice = { name: "Alice" };
const bob = { name: "Bob" };

const visits = {};
visits[alice] = 3;
visits[bob] = 5;

console.log(visits); // prints: { '[object Object]': 5 }
```

Object keys are always strings. JavaScript turned both customers into the same string, `"[object Object]"`, so Bob's number overwrote Alice's. A Map keeps each object as its own key. (Where that odd string comes from is part of [chapter 38](../38-type-coercion/notes.md).)

**Speed.** `set.has(value)` stays fast even with a million items, while `array.includes(value)` checks the items one by one. You'll measure the difference in [chapter 48](../48-performance/notes.md).

## Real-world example

Picture a party with a **guest list and a bouncer**. The bouncer checks every name at the door. If you're already inside, you don't get in a second time. That's a Set.

Now picture the **coat check** at a theater. You hand over your coat and get a ticket. Later, you show the ticket and get your coat back. The ticket is the key and the coat is the value. That's a Map.

A Map is a very relaxed coat check, though: the "ticket" can be anything. A number, a word, or even another object.

| | Set (guest list with a bouncer) | Map (coat check) |
|---|---|---|
| What it holds | Unique values | Key → value pairs |
| Adding the same thing twice | "You're already in." Nothing changes | Same ticket, new coat: the old value is replaced |
| The question it answers | "Is Priya on the list?" | "What's stored under ticket 101?" |
| Order | Remembers the order guests arrived | Remembers the order tickets were handed out |

## How it works

### Creating a Set and adding values

`Set` is a built-in class, so you create one with `new`, like the classes in [chapter 27](../27-classes/notes.md). Then you add values with `add`:

```js
const guests = new Set();

guests.add("Priya");
guests.add("Tom");
guests.add("Priya"); // already in, so nothing happens

console.log(guests);      // prints: Set(2) { 'Priya', 'Tom' }
console.log(guests.size); // prints: 2
```

Node shows how many values there are in brackets, then the values themselves. To count them in your code, use `size` (not `length`, like an array).

You can also start with an array. Duplicates get dropped on the way in:

```js
const colors = new Set(["red", "green", "red", "blue", "green"]);
console.log(colors); // prints: Set(3) { 'red', 'green', 'blue' }
```

A Set remembers the order values were first added. The second `"red"` doesn't move anything.

### Checking and removing: `has`, `delete`, `clear`

```js
const guests = new Set(["Priya", "Tom", "Lena"]);

console.log(guests.has("Tom"));    // prints: true
console.log(guests.has("tom"));    // prints: false (case matters)

console.log(guests.delete("Tom")); // prints: true (it was there)
console.log(guests.delete("Sam")); // prints: false (nothing to remove)
console.log(guests);               // prints: Set(2) { 'Priya', 'Lena' }

guests.clear(); // empties the whole Set
console.log(guests.size); // prints: 0
```

To decide whether two values are "the same", a Set uses the same rule as `===`. That's why `"tom"` and `"Tom"` are different values. (One small bonus: `NaN` counts as equal to itself here, so a Set never holds two `NaN`s.)

### Looping over a Set

A Set has no indexes, so there's no `guests[0]`. Instead, you loop over it with `for...of`:

```js
const tags = new Set(["javascript", "css", "html"]);

for (const tag of tags) {
  console.log(`#${tag}`);
}
```

You'll see:

```
#javascript
#css
#html
```

`tags.forEach((tag) => ...)` works too. But Sets don't have `map`, `filter`, or the other array methods from [chapter 13](../13-array-methods/notes.md). When you need them, spread the Set into an array first (spread is from [chapter 15](../15-destructuring-spread-rest/notes.md)):

```js
const tags = new Set(["javascript", "css", "html"]);
const hashtags = [...tags].map((tag) => `#${tag}`);

console.log(hashtags); // prints: [ '#javascript', '#css', '#html' ]
```

`Array.from(tags)` does the same job as `[...tags]`.

### Removing duplicates from an array

This is the Set trick you'll use most. Put the array into a Set, then spread it back out into a new array:

```js
const signups = ["ana@mail.com", "ben@mail.com", "ana@mail.com", "cleo@mail.com"];
const people = [...new Set(signups)];

console.log(people); // prints: [ 'ana@mail.com', 'ben@mail.com', 'cleo@mail.com' ]
console.log(`${signups.length} signups, ${people.length} people`); // prints: 4 signups, 3 people
```

The original array doesn't change. You get a new one with each value once, in the order they first appeared.

### Comparing two Sets

Sets really shine when you compare two groups. Say a gym tracks who came to the spin class on Monday and on Tuesday:

```js
const monday = new Set(["Ana", "Ben", "Cleo"]);
const tuesday = new Set(["Ben", "Cleo", "Dev"]);

console.log(monday.union(tuesday));               // prints: Set(4) { 'Ana', 'Ben', 'Cleo', 'Dev' }
console.log(monday.intersection(tuesday));        // prints: Set(2) { 'Ben', 'Cleo' }
console.log(monday.difference(tuesday));          // prints: Set(1) { 'Ana' }
console.log(monday.symmetricDifference(tuesday)); // prints: Set(2) { 'Ana', 'Dev' }
```

| Method | In plain words | The gym's question |
|---|---|---|
| `a.union(b)` | Everything in either Set | Who came at least once? |
| `a.intersection(b)` | Only what's in both | Who came both days? |
| `a.difference(b)` | In `a`, but not in `b` | Who came Monday but skipped Tuesday? |
| `a.symmetricDifference(b)` | In one or the other, but not both | Who came exactly one day? |

Each method gives you a **new** Set. `monday` and `tuesday` don't change.

You can also ask yes/no questions. `a.isSubsetOf(b)` checks whether everything in `a` is also in `b`. That's perfect for "does this person have all the skills the job needs?":

```js
const required = new Set(["html", "css", "javascript"]);
const priya = new Set(["html", "css", "javascript", "git"]);
const tom = new Set(["html", "javascript"]);

console.log(required.isSubsetOf(priya)); // prints: true
console.log(required.isSubsetOf(tom));   // prints: false
console.log(required.difference(tom));   // prints: Set(1) { 'css' }
```

The last line shows exactly what Tom is missing. Two more yes/no methods work the same way: `a.isSupersetOf(b)` (does `a` contain everything in `b`?) and `a.isDisjointFrom(b)` (do they have nothing in common?).

> **Watch out:** these seven methods are new. Browsers added them in 2023 and 2024, and they became part of the official JavaScript standard in 2025. They work in Node 24 and in current Chrome, Edge, Firefox, and Safari, but an older browser throws a `TypeError` saying that `union` is not a function.

Before these methods existed, people built them by hand with `has`. You'll still see this in older code:

```js
const monday = new Set(["Ana", "Ben", "Cleo"]);
const tuesday = new Set(["Ben", "Cleo", "Dev"]);

// Keep only Monday's people who are also in Tuesday's Set
const bothDays = new Set([...monday].filter((name) => tuesday.has(name)));
console.log(bothDays); // prints: Set(2) { 'Ben', 'Cleo' }
```

### Creating a Map: `set` and `get`

A Map stores pairs. `set(key, value)` puts a value in, and `get(key)` hands it back. Here's the coat check:

```js
const coatCheck = new Map();

coatCheck.set(101, "red scarf");
coatCheck.set(102, "black umbrella");

console.log(coatCheck.get(101));   // prints: red scarf
console.log(coatCheck.get(999));   // prints: undefined (no such ticket)
console.log(coatCheck.get("101")); // prints: undefined (a string, not the number 101)
console.log(coatCheck);            // prints: Map(2) { 101 => 'red scarf', 102 => 'black umbrella' }
```

Node draws each pair as `key => value`. Notice that the keys stay real numbers. An object would have turned them into the strings `"101"` and `"102"`, but in a Map, `101` and `"101"` are two different keys.

Maps have the same helpers as Sets: `has`, `delete`, `clear`, and `size`. You can also start a Map with an array of `[key, value]` pairs:

```js
const stock = new Map([
  ["apples", 12],
  ["pears", 0],
  ["plums", 7],
]);

console.log(stock.size);         // prints: 3
console.log(stock.has("pears")); // prints: true

stock.set("pears", 20);          // same key: the old value is replaced
stock.delete("plums");

console.log(stock); // prints: Map(2) { 'apples' => 12, 'pears' => 20 }
```

### Any value can be a key

Here's the visit counter from the start of the chapter, this time with a Map:

```js
const alice = { name: "Alice" };
const bob = { name: "Bob" };

const visits = new Map();
visits.set(alice, 3);
visits.set(bob, 5);

console.log(visits.get(alice)); // prints: 3
console.log(visits.get(bob));   // prints: 5
console.log(visits.size);       // prints: 2
console.log(visits.get({ name: "Alice" })); // prints: undefined
```

Each customer object is its own key now. But look at the last line. Remember from [chapter 16](../16-values-vs-references/notes.md) that objects are compared by reference. The Map looks for *that exact object*, not a new one that happens to look the same.

### Looping over a Map

`for...of` gives you one pair at a time, as a small `[key, value]` array. Destructuring it (from [chapter 15](../15-destructuring-spread-rest/notes.md)) gives both parts a name:

```js
const stock = new Map([
  ["apples", 12],
  ["pears", 0],
  ["plums", 7],
]);

for (const [fruit, count] of stock) {
  console.log(`${fruit}: ${count}`);
}
```

You'll see:

```
apples: 12
pears: 0
plums: 7
```

A Map always loops in the order the keys were first added.

If you only need one side, use `keys()` or `values()`. Spread them to get plain arrays:

```js
const stock = new Map([
  ["apples", 12],
  ["pears", 0],
  ["plums", 7],
]);

console.log([...stock.keys()]);   // prints: [ 'apples', 'pears', 'plums' ]
console.log([...stock.values()]); // prints: [ 12, 0, 7 ]
```

`keys()` and `values()` (and `entries()`, which gives the pairs) don't return arrays. They return something you can loop over or spread. [Chapter 36](../36-iterators-and-generators/notes.md) explains exactly what that is.

### Map or object?

Both hold key/value pairs, so which one should you pick?

| | Object | Map |
|---|---|---|
| Keys | Strings (numbers and other values get turned into strings) | Any value, kept as it is |
| Counting entries | `Object.keys(obj).length` | `map.size` |
| Looping | Through `Object.entries(obj)` | Directly, with `for...of` |
| Order | Mostly the order you added keys, but number-like keys jump to the front | Always the order you added keys |
| Saving as JSON | `JSON.stringify` works | Needs converting first (see below) |
| Best for | A "record" with known fields: a user profile, a product | A lookup table that grows and shrinks, with keys you don't know in advance |

A good rule of thumb: if you'd describe it as "a thing with fields", use an object. If you'd describe it as "a lookup table" or "a list of X per Y" (stock per product, visits per customer), a Map is usually the better fit. Small lookups with string keys are fine as objects too. You'll see lots of those, and that's OK.

### Converting between objects and Maps

`Object.entries` from [chapter 11](../11-objects/notes.md) turns an object into `[key, value]` pairs, which is exactly what `new Map()` accepts. `Object.fromEntries` goes the other way:

```js
const settings = { theme: "dark", fontSize: 16 };

const settingsMap = new Map(Object.entries(settings));
console.log(settingsMap); // prints: Map(2) { 'theme' => 'dark', 'fontSize' => 16 }

const backToObject = Object.fromEntries(settingsMap);
console.log(backToObject); // prints: { theme: 'dark', fontSize: 16 }
```

That's also how you save a Map as JSON ([chapter 23](../23-json-and-local-storage/notes.md)). `JSON.stringify` doesn't understand Maps or Sets, so it quietly gives you `{}` and your data is gone. Convert first:

```js
const cart = new Map([["apple", 3], ["bread", 1]]);
const tags = new Set(["sale", "new"]);

console.log(JSON.stringify(cart));                     // prints: {}
console.log(JSON.stringify(Object.fromEntries(cart))); // prints: {"apple":3,"bread":1}
console.log(JSON.stringify([...tags]));                // prints: ["sale","new"]
```

To load them back, reverse the steps: `new Map(Object.entries(JSON.parse(text)))` for the Map, and `new Set(JSON.parse(text))` for the Set. (`Object.fromEntries` turns every key into a string, so this works best when the keys are strings already.)

### Counting with a Map

Counting things is one of the most common jobs for a Map: words in reviews, votes in a poll, songs in a listening history.

```js
const review = "great food great service friendly staff great prices";
const counts = new Map();

for (const word of review.split(" ")) {
  const soFar = counts.get(word) ?? 0; // undefined the first time, so use 0
  counts.set(word, soFar + 1);
}

console.log(counts.get("great")); // prints: 3
console.log(counts.get("staff")); // prints: 1

// The most common word: sort the pairs by count, biggest first
const ranked = [...counts].sort((a, b) => b[1] - a[1]);
console.log(ranked[0]); // prints: [ 'great', 3 ]
```

The `??` from [chapter 07](../07-conditionals/notes.md) handles the first time a word shows up, when `get` gives back `undefined`. For the ranking, `[...counts]` turns the Map into an array of `[word, count]` pairs, so `a[1]` and `b[1]` are the counts.

### Remembering results with a Map (a cache)

At the end of the [chapter 34 exercises](../34-debounce-and-throttle/exercises.md), searching for `harry` twice sent the same request twice. What if the search box remembered its results? A Map is a perfect fit. Store each answer under the search text, and check `has` before doing the slow work again. A store like this is called a **cache**.

```js
const cache = new Map();

function search(query) {
  if (cache.has(query)) {
    return `${cache.get(query)} (from the cache)`;
  }
  const results = `3 results for "${query}"`; // imagine a slow request to a server here
  cache.set(query, results);
  return results;
}

console.log(search("desk lamp")); // prints: 3 results for "desk lamp"
console.log(search("desk lamp")); // prints: 3 results for "desk lamp" (from the cache)
```

The second search never reaches the slow part. (A cache that only ever grows can use up memory. [Chapter 41](../41-memory-and-garbage-collection/notes.md) shows how to keep it in check.)

### Grouping with `Map.groupBy`

In [chapter 13](../13-array-methods/notes.md) you met `Object.groupBy`, which sorts items into groups. `Map.groupBy` works the same way, but gives you a Map. That matters when your group keys aren't strings:

```js
const orders = [
  { id: 1, total: 25 },
  { id: 2, total: 140 },
  { id: 3, total: 60 },
  { id: 4, total: 210 },
];

const bySize = Map.groupBy(orders, (order) => order.total >= 100);

console.log(bySize.get(true));  // prints: [ { id: 2, total: 140 }, { id: 4, total: 210 } ]
console.log(bySize.get(false)); // prints: [ { id: 1, total: 25 }, { id: 3, total: 60 } ]
```

The keys here are the real booleans `true` and `false`. `Object.groupBy` would have turned them into the strings `"true"` and `"false"`. Like `Object.groupBy`, `Map.groupBy` was added to JavaScript in 2024, so very old browsers don't have it.

### WeakMap and WeakSet (a quick look)

When you put an object into a Map, the Map holds on to it. Even after the rest of your program has finished with that object, it can't be cleaned out of memory, because the Map still points to it.

A **WeakMap** is a Map with a looser grip. Its keys must be objects, and once nothing else in your program uses a key object, JavaScript is free to clean it up, entry and all. A **WeakSet** is the same idea for a Set.

```js
const clickCounts = new WeakMap();
const buyButton = { id: "buy" }; // imagine a real button from the page

clickCounts.set(buyButton, 1);
console.log(clickCounts.get(buyButton)); // prints: 1

clickCounts.set("buy", 1);
// TypeError: Invalid value used as weak map key
```

They're useful for attaching extra information to objects you don't own, like elements on a page, without keeping those objects alive forever. The price is that you can't loop over them or check their `size`. [Chapter 41](../41-memory-and-garbage-collection/notes.md) explains how memory cleanup works and why this matters.

## Common mistakes

**1. Using square brackets instead of `set` and `get`**

```js
const scores = new Map();
scores["Ana"] = 90; // looks fine, but it isn't a Map entry

console.log(scores.get("Ana")); // prints: undefined
console.log(scores.size);       // prints: 0
```

Square brackets stick a normal object property onto the Map, which the Map's own methods ignore. Always use `scores.set("Ana", 90)` and `scores.get("Ana")`.

**2. Giving a Set a single string**

```js
const fruits = new Set("apple");
console.log(fruits); // prints: Set(4) { 'a', 'p', 'l', 'e' }
```

`new Set()` goes through whatever list you give it, one item at a time. A string counts as a list of letters, so you get its unique letters. To store the whole word, wrap it in an array: `new Set(["apple"])`.

**3. Expecting look-alike objects to be duplicates**

```js
const cart = new Set();
cart.add({ id: 7, name: "Desk lamp" });
cart.add({ id: 7, name: "Desk lamp" });

console.log(cart.size); // prints: 2
```

Two objects that look the same are still two different objects ([chapter 16](../16-values-vs-references/notes.md)), so the Set keeps both. Store something simple that identifies the item instead, like its id: `cart.add(7)`. Or use a Map from id to product.

**4. Mixing up the order in a Map's `forEach`**

```js
const stock = new Map([["apples", 12]]);

stock.forEach((fruit, count) => {
  console.log(`${fruit}: ${count}`); // prints: 12: apples
});
```

A Map's `forEach` gives you the **value first**, then the key (to match arrays, where the item comes before the index). Write `(count, fruit) =>`, or use `for (const [fruit, count] of stock)`, which reads in the natural order.

**5. Passing an array to a Set method**

```js
const monday = new Set(["Ana", "Ben"]);
console.log(monday.union(["Cleo"]));
// TypeError: The .size property is NaN
```

The new Set methods need another Set to compare with. The message is confusing because arrays have a `length`, not a `size`. Fix: `monday.union(new Set(["Cleo"]))`.

## Quick recap

- A **Set** holds unique values: `add`, `has`, `delete`, `size`. `[...new Set(array)]` removes duplicates.
- `union`, `intersection`, `difference`, `symmetricDifference`, and `isSubsetOf` compare two Sets. They're new (standard since 2025) and return new Sets.
- A **Map** holds key → value pairs, and the keys can be anything: `set`, `get`, `has`, `delete`, `size`.
- Loop over both with `for...of`. For a Map, destructure each `[key, value]` pair.
- Use an object for a record with known fields. Use a Map for a lookup table that changes, or when the keys aren't strings.
- `JSON.stringify` doesn't understand Maps or Sets. Convert them with `Object.fromEntries` or spread first.
- WeakMap and WeakSet only take objects, and they don't keep those objects alive.

---

**Next:** try the [exercises](exercises.md), then move on to [36 Iterators and Generators](../36-iterators-and-generators/notes.md).
