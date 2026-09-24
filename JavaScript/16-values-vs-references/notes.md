# 16 Values vs. References

## What is it?

When you copy a **primitive** (a string, number, boolean, `null`, or `undefined`), JavaScript copies the value itself. Each variable gets its own copy.

When you "copy" an object or an array, JavaScript only copies a **reference**: a pointer to where that object lives. Both variables then point at the *same* object.

## Why does it matter?

Look at this:

```js
const original = ["milk", "eggs"];
const copy = original;
copy.push("bread");
console.log(original); // prints: [ 'milk', 'eggs', 'bread' ]
```

You changed `copy`, but `original` changed too. If you don't know why, bugs like this feel like magic. And they're some of the most common bugs in real apps: a cart total that changes by itself, an "undo" button that doesn't undo, a function that quietly scrambles your data.

Once you understand references, these bugs make sense, and you'll know how to avoid them. This chapter also explains two things earlier chapters promised: why `cart === []` is always `false`, and why a `const` array can still be changed (both from [chapter 10](../10-arrays/notes.md)).

## Real-world example

Think about sending a PDF versus sharing a Google Doc link:

| | Primitives (copied by value) | Objects and arrays (shared by reference) |
|---|---|---|
| It's like... | Emailing someone a PDF copy of your document | Sending someone a link to your Google Doc |
| If they scribble on it | Your original is untouched | Everyone with the link sees the change |
| `b = a` gives `b`... | Its own separate copy | The same link to the same document |

Here's another way to picture it: a variable holding an object doesn't hold the house itself. It holds the house's **address**. Copy the variable, and you've copied the address, not the house. If your friend follows that address and paints the front door red, it's your front door too.

## How it works

### Primitives are copied by value

```js
let myScore = 10;
let yourScore = myScore; // copies the value 10
yourScore = yourScore + 5;

console.log(myScore);   // prints: 10
console.log(yourScore); // prints: 15
```

`yourScore` got its own `10`, so changing it later has nothing to do with `myScore`. Strings behave the same way. And remember from [chapter 06](../06-strings/notes.md) that strings can't be changed in place anyway: every string method gives you a new string.

### Objects and arrays are shared by reference

```js
const myCart = ["apples", "bread"];
const yourCart = myCart; // copies the reference, not the array

yourCart.push("cheese");
console.log(myCart); // prints: [ 'apples', 'bread', 'cheese' ]
```

There's only **one** array here. `myCart` and `yourCart` are two labels pointing at it:

```
myCart   ──┐
           ├──►  [ 'apples', 'bread', 'cheese' ]
yourCart ──┘
```

A **reference** works like the address of an object in the computer's memory (memory is where your program keeps its values while it runs; [chapter 41](../41-memory-and-garbage-collection/notes.md) goes deeper). An object variable holds that address, not the object itself.

Objects work exactly the same way:

```js
const account = { owner: "Maya", balance: 100 };
const sameAccount = account;

sameAccount.balance = 0;
console.log(account.balance); // prints: 0
```

### Changing an object vs. pointing somewhere new

There are two very different things you can do with a variable that holds an object:

- **Mutate** it: change the object itself, like `account.balance = 0` or `cart.push("tea")`. **Mutating** means changing an object or array in place, so everyone sharing the reference sees the change.
- **Reassign** it: point the variable at a different value with `=`. This only affects that one variable.

```js
let a = { score: 1 };
let b = a; // both point at the same object

b = { score: 99 }; // b now points at a brand-new object
console.log(a.score); // prints: 1
```

Reassigning `b` didn't touch the object that `a` points at. It only moved `b`'s arrow to a new object.

### Functions receive references too

When you pass an array or object into a function, the function gets a reference to the same one. If the function mutates it, the caller sees the change:

```js
function addFreeGift(cart) {
  cart.push("free tote bag");
}

const order = ["shoes"];
addFreeGift(order);
console.log(order); // prints: [ 'shoes', 'free tote bag' ]
```

A primitive can't be changed this way, because the function gets its own copy of the value:

```js
function addBonus(points) {
  points = points + 50;
  return points;
}

const myPoints = 100;
addBonus(myPoints); // returns 150, but myPoints is untouched
console.log(myPoints); // prints: 100
```

Here's a sneakier version of the same bug. This function only wants to *read* the scores, but `sort` from [chapter 13](../13-array-methods/notes.md) changes the array it's called on:

```js
function getTopScore(scores) {
  scores.sort((a, b) => b - a); // sort changes the array it was given!
  return scores[0];
}

const examScores = [70, 95, 80];
console.log(getTopScore(examScores)); // prints: 95
console.log(examScores);              // prints: [ 95, 80, 70 ]
```

The original order of `examScores` is gone. The fix is a method that doesn't mutate: `scores.toSorted((a, b) => b - a)[0]`, or `Math.max(...scores)` from [chapter 15](../15-destructuring-spread-rest/notes.md).

### `===` compares references, not contents

For primitives, `===` compares values. For objects and arrays, it asks "are these the *same* object?", not "do they look the same?":

```js
const shirtA = { size: "M" };
const shirtB = { size: "M" };
const shirtC = shirtA;

console.log(shirtA === shirtB); // prints: false  (two separate objects that look alike)
console.log(shirtA === shirtC); // prints: true   (the same object)
console.log([] === []);         // prints: false
```

It's like two identical houses on different streets: they look the same, but they have different addresses. That's why `cart === []` is always `false`: the `[]` creates a brand-new empty array, which can never be the same array as `cart`.

To compare contents, compare the parts you care about:

```js
const listA = ["milk", "eggs"];
const listB = ["milk", "eggs"];

const sameItems =
  listA.length === listB.length && listA.every((item, index) => item === listB[index]);
console.log(sameItems); // prints: true
```

`includes` and `indexOf` compare the same way as `===`, so they can't find an object by its contents:

```js
const products = [{ id: 1 }, { id: 2 }];
console.log(products.includes({ id: 1 }));                 // prints: false
console.log(products.some((product) => product.id === 1)); // prints: true
```

To look for an object, test one of its properties with `find`, `findIndex`, or `some`.

### `const` doesn't mean "can't change"

You saw this in chapter 10: `const` locks the *variable*, not the object it points to. You can't point a `const` variable at something else, but you can still change the object:

```js
const settings = { volume: 5 };

settings.volume = 8;      // fine: changing the object
console.log(settings);    // prints: { volume: 8 }

settings = { volume: 1 }; // TypeError: Assignment to constant variable.
```

Now you know why. `const` glues the arrow in place, so the variable always points at the same object. But the object at the end of the arrow can still change.

### Shallow copies

To get a real, separate copy, you need a *new* array or object. You already know several ways to make one:

| To copy... | Use | From |
|---|---|---|
| An array | `[...list]` | chapter 15 |
| An array | `list.slice()` | chapter 10 |
| An array | `Array.from(list)` | chapter 13 |
| An object | `{ ...obj }` | chapter 15 |

```js
const guests = ["Ana", "Ben"];
const partyGuests = [...guests];

partyGuests.push("Cleo");
console.log(guests);                 // prints: [ 'Ana', 'Ben' ]
console.log(partyGuests);            // prints: [ 'Ana', 'Ben', 'Cleo' ]
console.log(guests === partyGuests); // prints: false
```

But all of these make a **shallow copy**: only the top level is new. Anything *inside*, like a nested array or object, is still shared, because the copy only copied the references to it:

```js
const trip = {
  destination: "Rome",
  travelers: ["Ana", "Ben"],
};

const tripCopy = { ...trip };
tripCopy.destination = "Paris";  // top level: separate
tripCopy.travelers.push("Cleo"); // nested: shared!

console.log(trip.destination); // prints: Rome
console.log(trip.travelers);   // prints: [ 'Ana', 'Ben', 'Cleo' ]
```

Here's what's going on:

```
trip     ──► { destination: 'Rome',  travelers: ──┐ }
                                                  ├──► [ 'Ana', 'Ben', 'Cleo' ]
tripCopy ──► { destination: 'Paris', travelers: ──┘ }
```

Two objects, but only one `travelers` array. It's like photocopying a recipe card that says "see page 42 of the cookbook". Now you have two cards, but they both point at the same cookbook.

This catches people out with arrays of objects too. Copying the array doesn't copy the objects inside it:

```js
const products = [{ name: "Mug", price: 8 }];
const saleProducts = [...products];

saleProducts[0].price = 5;
console.log(products[0].price); // prints: 5
```

### Deep copies with `structuredClone`

A **deep copy** copies every level, so nothing is shared. Modern JavaScript has a built-in function for it, `structuredClone`:

```js
const trip = {
  destination: "Rome",
  travelers: ["Ana", "Ben"],
};

const tripCopy = structuredClone(trip);
tripCopy.travelers.push("Cleo");

console.log(trip.travelers);     // prints: [ 'Ana', 'Ben' ]
console.log(tripCopy.travelers); // prints: [ 'Ana', 'Ben', 'Cleo' ]
```

`structuredClone` works in all current browsers and in Node 17 and later. It copies data: numbers, strings, booleans, arrays, plain objects, and more. It can't copy functions, and it throws an error if you try:

```js
const timer = { seconds: 60, start: () => console.log("go") };
structuredClone(timer);
// DOMException [DataCloneError]: () => console.log("go") could not be cloned.
```

In older code you'll see another trick for deep copies: `JSON.parse(JSON.stringify(obj))`. It turns the object into text and back again (JSON is [chapter 23](../23-json-and-local-storage/notes.md)). It works for simple data, but it quietly drops functions and `undefined` values, so prefer `structuredClone`.

Do you need deep copies often? Not really. Usually you only change one nested part, and you can copy just that part, as the next section shows.

### How to avoid accidental changes

**1. Don't mutate what you were given.** A function that receives an array or object should return a new one instead of changing it:

```js
function addItem(cart, item) {
  return [...cart, item]; // a new array: the caller's cart is untouched
}

const cart = ["shoes"];
const newCart = addItem(cart, "socks");
console.log(cart);    // prints: [ 'shoes' ]
console.log(newCart); // prints: [ 'shoes', 'socks' ]
```

**2. Prefer methods that don't mutate.** Most changing operations have a copy-making twin:

| Changes the original | Makes a new copy instead |
|---|---|
| `list.push(item)` | `[...list, item]` |
| `list.sort(compare)` | `list.toSorted(compare)` |
| `list.reverse()` | `list.toReversed()` |
| `list[index] = value` | `list.with(index, value)` |
| `list.splice(index, 1)` | `list.filter((_, i) => i !== index)` |
| `obj.key = value` | `{ ...obj, key: value }` |

`with` is the one you haven't met yet. It gives you a copy of the array with one item replaced:

```js
const seats = ["free", "free", "free"];
const booked = seats.with(1, "taken");
console.log(booked); // prints: [ 'free', 'taken', 'free' ]
console.log(seats);  // prints: [ 'free', 'free', 'free' ]
```

Like `toSorted` and `toReversed`, it arrived in 2023, so it works in Node 20 and later and in current browsers.

To change the objects inside an array without touching the originals, combine `map` with object spread, so each object gets copied:

```js
const menu = [
  { dish: "Soup", price: 6 },
  { dish: "Pie", price: 9 },
];

const newMenu = menu.map((item) => ({ ...item, price: item.price + 1 }));
console.log(newMenu);       // prints: [ { dish: 'Soup', price: 7 }, { dish: 'Pie', price: 10 } ]
console.log(menu[0].price); // prints: 6
```

> **Watch out:** when an arrow function returns an object directly, wrap the object in parentheses: `(item) => ({ ... })`. Without them, JavaScript reads the `{` as the start of the function body, and you get `undefined` or a confusing error.

**3. Copy the nested part you change.** To update something nested without a full deep copy, spread each level you touch:

```js
const trip = { destination: "Rome", travelers: ["Ana", "Ben"] };

const biggerTrip = { ...trip, travelers: [...trip.travelers, "Cleo"] };

console.log(trip.travelers);       // prints: [ 'Ana', 'Ben' ]
console.log(biggerTrip.travelers); // prints: [ 'Ana', 'Ben', 'Cleo' ]
```

`biggerTrip` gets a new top-level object *and* a new `travelers` array, while `trip` stays exactly as it was. You'll see this pattern a lot in real apps, especially in React code.

> **Tip:** mutation isn't evil. Changing an array you just created yourself, inside one function, is perfectly fine. The danger is changing data that *other* code also holds a reference to.

## Common mistakes

**1. Thinking `=` makes a copy**

```js
const draft = { title: "Holiday plans", theme: "light" };
const backup = draft;
draft.theme = "dark";
console.log(backup.theme); // prints: dark
```

The "backup" is the same object as the draft, so it changed too. Fix: make a real copy, `const backup = { ...draft };`, or `structuredClone(draft)` if it holds nested data.

**2. A function that changes its input**

```js
function applyDiscount(prices) {
  for (let i = 0; i < prices.length; i++) {
    prices[i] = prices[i] - 5;
  }
  return prices;
}

const menuPrices = [20, 15];
const salePrices = applyDiscount(menuPrices);
console.log(salePrices); // prints: [ 15, 10 ]
console.log(menuPrices); // prints: [ 15, 10 ]
```

The sale worked, but the regular menu prices got discounted too. Fix: build and return a new array: `return prices.map((price) => price - 5);`.

**3. Comparing objects with `===`**

```js
const selected = { size: "M" };
console.log(selected === { size: "M" }); // prints: false
```

`===` checks whether both sides are the *same* object, and `{ size: "M" }` creates a new one. Fix: compare the part you care about: `selected.size === "M"`.

**4. Expecting a shallow copy to protect nested data**

```js
const game = { player: "Kai", inventory: ["sword"] };
const saveFile = { ...game };
game.inventory.push("shield");
console.log(saveFile.inventory); // prints: [ 'sword', 'shield' ]
```

The save file was supposed to be a snapshot, but its `inventory` is the same array as the game's. Fix: `const saveFile = structuredClone(game);`.

**5. Reassigning a parameter and expecting the caller to see it**

```js
function emptyCart(cart) {
  cart = []; // only changes this function's own variable
}

const myCart = ["apples", "pears"];
emptyCart(myCart);
console.log(myCart); // prints: [ 'apples', 'pears' ]
```

This is the mirror image of mistake 2. Reassigning `cart` only moves the function's own arrow to a new array. The caller's array is untouched. Fix: decide what you want. To empty the shared array, change it on purpose, for example `cart.splice(0, cart.length)`. Or return a new value and let the caller store it.

## Quick recap

- Primitives are copied by **value**: each variable gets its own copy.
- Objects and arrays are shared by **reference**: `b = a` gives you two names for one object, and passing one into a function shares it too.
- **Mutating** changes the shared object, so everyone sees it. **Reassigning** only moves one variable.
- `===` on objects asks "same object?", not "same contents?". And `const` stops reassignment, not mutation.
- Spread, `slice`, and `Array.from` make **shallow** copies, so nested data is still shared. `structuredClone` makes a **deep** copy.
- To avoid surprises, return new arrays and objects, and prefer non-mutating methods like `map`, `filter`, `toSorted`, and `with`.

---

**Next:** try the [exercises](exercises.md), then move on to [17 Recursion](../17-recursion/notes.md).
