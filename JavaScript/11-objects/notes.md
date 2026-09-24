# 11 Objects

## What is it?

An **object** groups related information under one name. Each piece of information has a label, so you always know what it means.

```js
const contact = {
  name: "Maya Patel",
  phone: "555-0142",
  age: 28
};
```

Each labeled piece is called a **property**. A property has a **key** (the label, like `phone`) and a **value** (what's stored under that label, like `"555-0142"`).

## Why does it matter?

Say you're saving a contact in your phone. With an array from [chapter 10](../10-arrays/notes.md), it would look like this:

```js
const contact = ["Maya Patel", "555-0142", 28];
```

It's all in one place, but what does `contact[2]` mean? You'd have to remember that index 2 is the age. Mix up the order and nothing warns you.

An object gives every piece a name:

```js
const contact = { name: "Maya Patel", phone: "555-0142", age: 28 };
console.log(contact.phone); // prints: 555-0142
```

`contact.phone` says exactly what it is. Almost all real data looks like this: a user profile, a product in a shop, an order, a song, the weather data an app downloads. Objects are everywhere in JavaScript.

## Real-world example

An object is like a **contact card**:

| Contact card | Object |
|---|---|
| The whole card | The object |
| A field label, like "Phone" | A key |
| What's written next to it | A value |
| One line of the card (label plus what's written) | A property |
| Adding a new line, like "Birthday" | Adding a property |

Arrays and objects are a great team, but they answer different questions:

| | Array (chapter 10) | Object |
|---|---|---|
| It's like a... | numbered list, like train carriages | form with labeled fields |
| You find things by | position: `songs[0]` | name: `song.title` |
| Best for | many things of the same kind | many facts about one thing |

## How it works

### Creating an object

Write the properties inside curly braces `{ }`. Each one is `key: value`, with commas between them:

```js
const contact = {
  name: "Maya Patel",
  phone: "555-0142",
  age: 28,
  isFavorite: true
};
console.log(contact);
// prints: { name: 'Maya Patel', phone: '555-0142', age: 28, isFavorite: true }
```

- Values can be any type: strings, numbers, booleans, arrays, even other objects.
- Keys without quotes follow the same naming rules as variables (chapter 02). Use camelCase, like `isFavorite`.
- Node prints objects with spaces inside the braces and single quotes around strings, just like arrays. Long objects get split over several lines.

An empty object is `{}`. You can fill it up later.

> If a key really needs a space or a dash, put it in quotes: `{ "favorite color": "blue" }`. Most of the time, a camelCase key like `favoriteColor` is simpler.

### Reading a property: dot notation

Write the object's name, a dot, and the key:

```js
const contact = { name: "Maya Patel", phone: "555-0142", age: 28 };
console.log(contact.name);  // prints: Maya Patel
console.log(contact.age);   // prints: 28
console.log(contact.email); // prints: undefined
```

Asking for a property that doesn't exist isn't an error. You get `undefined`, just like reading past the end of an array in chapter 10.

### Bracket notation: when the key is in a variable

You can also put the key in square brackets, as a string:

```js
const contact = { name: "Maya Patel", phone: "555-0142" };
console.log(contact["phone"]); // prints: 555-0142
```

That looks like extra typing for nothing. The real power is that the brackets can hold a **variable**, so the key can be decided while the program runs:

```js
const ticketPrices = { adult: 12, child: 7, senior: 8 };
const ticketType = "child"; // imagine the customer picked this

console.log(ticketPrices[ticketType]); // prints: 7
```

JavaScript first looks inside `ticketType` and finds `"child"`. Then it reads `ticketPrices["child"]`, which is `7`.

An object used like this is a **lookup table**: you ask with a key and get back the matching value. One line like this can replace a long `if...else if` chain from [chapter 07](../07-conditionals/notes.md).

| Use | When |
|---|---|
| A dot: `ticketPrices.adult` | you know the key while you write the code (most of the time) |
| Brackets: `ticketPrices[ticketType]` | the key is in a variable, or it has spaces or dashes |

### Adding, changing, and deleting properties

Objects aren't frozen. You can add, change, and remove properties whenever you like:

```js
const profile = { username: "sam_k", city: "Oslo" };

profile.bio = "Coffee and code"; // add: this key didn't exist yet
profile.city = "Bergen";         // change: this key already exists
console.log(profile); // prints: { username: 'sam_k', city: 'Bergen', bio: 'Coffee and code' }

delete profile.bio; // remove the property completely
console.log(profile); // prints: { username: 'sam_k', city: 'Bergen' }
```

Adding and changing look exactly the same: `object.key = value`. If the key is new, the property gets added. If the key already exists, its value gets replaced. Brackets work here too: `profile[fieldName] = "something"`.

### `const` objects can still change

Did you notice that `profile` is a `const`? It works just like the arrays in [chapter 10](../10-arrays/notes.md): a `const` must always hold the *same* object, but that object's properties can change. What you can't do is swap in a whole new object:

```js
const profile = { username: "sam_k" };
profile.username = "sam_k_99"; // fine: changing a property
profile = { username: "new" }; // not allowed: a different object
// TypeError: Assignment to constant variable.
```

### Does this property exist?

Sometimes you need to know whether an object has a property at all. There are three common ways to check:

```js
const product = { name: "Desk lamp", price: 25, stock: 0 };

console.log(product.color === undefined);     // prints: true
console.log("stock" in product);              // prints: true
console.log(Object.hasOwn(product, "stock")); // prints: true
console.log(Object.hasOwn(product, "color")); // prints: false
```

| Check | What it asks | Watch out |
|---|---|---|
| `product.color === undefined` | "Is there no value here?" | A property can exist and still hold `undefined`. |
| `"color" in product` | "Does this key exist?" | It also finds a few built-in extras that every object has: `"toString" in product` is `true`! |
| `Object.hasOwn(product, "color")` | "Does *this object itself* have this key?" | It's newer (added in 2022), but it works in all current browsers and Node. |

`Object.hasOwn` is the most precise, so it's a good default. (Where extras like `toString` come from is a story for chapter 28.)

> **Watch out:** `if (product.stock)` asks "is the value truthy?", not "does it exist?". A stock of `0` is falsy (chapter 07), so that `if` would skip a product that really does have a `stock` property.

### Methods: functions inside objects

A property's value can be a function. A function stored in an object is called a **method**. You've been using one since chapter 01: `console` is an object, and `log` is its method.

```js
const account = {
  owner: "Lena",
  balance: 100,
  deposit(amount) {
    this.balance += amount;
    console.log(`${this.owner} now has $${this.balance}`);
  }
};

account.deposit(50); // prints: Lena now has $150
account.deposit(25); // prints: Lena now has $175
```

`deposit(amount) { ... }` is the short way to write a method. In older code you'll also see the long way, `deposit: function (amount) { ... }`. Both do the same thing.

**What's `this`?** Inside a method, `this` means "the object this method was called on", which is the object before the dot. In `account.deposit(50)`, `this` is `account`, so `this.balance` is `account.balance`.

Why not write `account.balance` directly? Because `this` keeps working if you rename the variable, or when you build many similar objects (you'll do that with classes in chapter 27). `this` has a few surprises of its own, and chapter 26 tells the full story. For now, remember: in a method, `this` means "this object".

### Objects inside objects

A value can be another object, or an array. That's how most real data is shaped. Here's an order from a food delivery app:

```js
const order = {
  id: 1042,
  customer: {
    name: "Tom",
    address: { city: "Leeds", postcode: "LS1 4AP" }
  },
  items: ["pizza", "cola"]
};

console.log(order.customer.name);         // prints: Tom
console.log(order.customer.address.city); // prints: Leeds
console.log(order.items[1]);              // prints: cola
console.log(order.items.length);          // prints: 2
```

Read a chain of dots from left to right, one step at a time: `order`, then its `customer`, then their `address`, then its `city`.

> **Tip:** when Node prints an object nested more than two levels deep, it shortens the deepest parts to `[Object]`. Your data is all still there. Node just doesn't print all of it.

### Arrays of objects

This is one of the most common shapes of data in all of programming: a list where every item is an object. A shop's products, a playlist's songs, a class's students.

```js
const products = [
  { name: "Notebook", price: 3.5, inStock: true },
  { name: "Pen", price: 1.2, inStock: false },
  { name: "Backpack", price: 24.99, inStock: true }
];

console.log(products[2].name); // prints: Backpack

for (const product of products) {
  if (product.inStock) {
    console.log(`${product.name}: $${product.price.toFixed(2)}`);
  }
}
```

You'll see:

```
Backpack
Notebook: $3.50
Backpack: $24.99
```

`products[2]` is a whole object, so `products[2].name` gets its name. Inside the loop, `product` is one whole object each time around.

Finding one item by a property is a job you'll do all the time, so it's worth a function:

```js
const products = [
  { name: "Notebook", price: 3.5, inStock: true },
  { name: "Pen", price: 1.2, inStock: false }
];

function findProduct(name) {
  for (const product of products) {
    if (product.name === name) {
      return product; // found it: stop looking and hand it back
    }
  }
  return null; // checked every product, and none matched
}

console.log(findProduct("Pen"));  // prints: { name: 'Pen', price: 1.2, inStock: false }
console.log(findProduct("Lamp")); // prints: null
```

When nothing matches, the function returns `null`, which (from chapter 03) means "empty, on purpose". Chapter 13 shows a shorter way to do this, with `find`.

### Looping over an object

**`for...in`** walks through an object's keys:

```js
const scores = { math: 90, art: 75, music: 82 };

for (const subject in scores) {
  console.log(`${subject}: ${scores[subject]}`);
}
```

You'll see:

```
math: 90
art: 75
music: 82
```

Each time around, `subject` holds one key, as a string. To get the value, use brackets: `scores[subject]`. It has to be brackets, because the key is in a variable.

Don't mix up the two loops:

- `for...of` gives you the **items** of an array (or the letters of a string).
- `for...in` gives you the **keys** of an object.

**`Object.keys`, `Object.values` and `Object.entries`** turn an object into an array, so you can use everything from chapter 10 on it:

```js
const scores = { math: 90, art: 75, music: 82 };

console.log(Object.keys(scores));        // prints: [ 'math', 'art', 'music' ]
console.log(Object.values(scores));      // prints: [ 90, 75, 82 ]
console.log(Object.entries(scores));     // prints: [ [ 'math', 90 ], [ 'art', 75 ], [ 'music', 82 ] ]
console.log(Object.keys(scores).length); // prints: 3
```

- `Object.keys` gives you the keys. `Object.keys(obj).length` counts the properties.
- `Object.values` gives you the values, which is handy for adding them up.
- `Object.entries` gives you `[key, value]` pairs: little arrays with two items each. Chapter 15 shows a neat way to unpack them.

For example, adding up all the scores:

```js
const scores = { math: 90, art: 75, music: 82 };
let total = 0;

for (const score of Object.values(scores)) {
  total += score;
}
console.log(`Total: ${total}`); // prints: Total: 247
```

### Optional chaining: `?.`

What happens if you reach into something that isn't there?

```js
const user = { name: "Ravi" }; // no address yet

console.log(user.address); // prints: undefined
console.log(user.address.city);
// TypeError: Cannot read properties of undefined (reading 'city')
```

`user.address` is `undefined`, and you can't read a property *of* `undefined`, so the program crashes. This is one of the most common errors in JavaScript. Learn to recognize that message.

**Optional chaining** `?.` fixes it. It means "if the thing on the left is missing, stop here and give back `undefined` instead of crashing":

```js
const user = { name: "Ravi" };

console.log(user.address?.city);                  // prints: undefined
console.log(user.address?.city ?? "No city yet"); // prints: No city yet
```

Pair it with `??` from chapter 07 to give a friendly default. "Missing" here means `null` or `undefined`, the same two values `??` looks for.

Use `?.` only where something is *allowed* to be missing, like an address a new user hasn't filled in yet. If a value should always be there, a crash points you to a real bug. Hiding it with `?.` just makes the bug harder to find.

### Shorthand properties

When a variable has the same name as the key you want, you only need to write it once:

```js
const title = "Night Drive";
const artist = "The Owls";

const track = { title, artist }; // same as { title: title, artist: artist }
console.log(track); // prints: { title: 'Night Drive', artist: 'The Owls' }
```

You'll see this all the time in functions that build objects:

```js
function createTrack(title, artist, seconds) {
  return { title, artist, seconds };
}

const playlist = [
  createTrack("Night Drive", "The Owls", 214),
  createTrack("Rainy Day", "Juniper", 187)
];
console.log(playlist[1]); // prints: { title: 'Rainy Day', artist: 'Juniper', seconds: 187 }
```

## Common mistakes

**1. Using a dot when the key is in a variable**

```js
const ticketPrices = { adult: 12, child: 7 };
const ticketType = "child";
console.log(ticketPrices.ticketType); // prints: undefined
```

`ticketPrices.ticketType` looks for a key that's literally called "ticketType", and there isn't one. Fix: `ticketPrices[ticketType]`.

**2. A typo in a property name**

```js
const product = { name: "Lamp", price: 25 };
console.log(product.prise); // prints: undefined
console.log(product.prise.toFixed(2));
// TypeError: Cannot read properties of undefined (reading 'toFixed')
```

A misspelled key doesn't cause an error by itself. It quietly gives you `undefined`, and the crash comes later, when you try to use it. When you see `Cannot read properties of undefined`, look at whatever comes *before* the dot. Is it spelled right? Does it really exist?

**3. Using `for...of` on an object**

```js
const scores = { math: 90, art: 75 };
for (const score of scores) {
  console.log(score);
}
// TypeError: scores is not iterable
```

**Iterable** means "can be stepped through with `for...of`". Arrays and strings are iterable, but plain objects aren't. Use `for...in`, or loop over `Object.keys(scores)`, `Object.values(scores)` or `Object.entries(scores)`.

**4. Writing `=` instead of `:`, or forgetting a comma**

```js
const pet = { name = "Rex" };
// SyntaxError: Invalid shorthand property initializer
```

```js
const pet = {
  name: "Rex"
  age: 3
};
// SyntaxError: Unexpected identifier 'age'
```

Inside an object, it's always `key: value`, and every property except the last needs a comma after it. The second error points at `age`, because that's where JavaScript noticed something was wrong. The missing comma is on the line before.

**5. Using an arrow function for a method that needs `this`**

```js
const dog = {
  name: "Rex",
  bark: () => {
    console.log(`${this.name} says woof`);
  }
};
dog.bark(); // prints: undefined says woof
```

Arrow functions don't get their own `this`, so here `this` isn't the `dog` object. (That's the Node output; a browser may print something slightly different, but it's just as wrong.) Fix: use the method shorthand, `bark() { ... }`. Chapter 26 explains exactly why this happens.

## Quick recap

- An object groups related values under labels: `{ name: "Maya", age: 28 }`. Each `key: value` pair is a property.
- Read a property with a dot (`user.name`), or with brackets when the key is in a variable (`prices[size]`).
- Add or change a property with `obj.key = value`, and remove one with `delete obj.key`. A `const` object can still change.
- A missing property gives `undefined`. Check whether a key exists with `Object.hasOwn(obj, "key")` or `"key" in obj`.
- A method is a function inside an object. Inside a method, `this` means "this object".
- Loop over an object with `for...in` or `Object.keys`, `Object.values` and `Object.entries`. Arrays of objects are everywhere.
- `?.` stops safely when something might be missing, and pairs well with `??`.

---

**Next:** try the [exercises](exercises.md), then move on to [12 Project: Shopping Cart](../12-project-shopping-cart/notes.md).
