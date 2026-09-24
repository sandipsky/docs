# 28 Prototypes

## What is it?

Every object in JavaScript has a hidden link to another object, called its **prototype**.

When you ask an object for a property it doesn't have, JavaScript doesn't give up straight away. It follows the hidden link and looks in the prototype. If it's not there either, it looks in the prototype's prototype, and so on.

## Why does it matter?

Prototypes are how objects share behavior behind the scenes:

- **Sharing methods.** A library app with 10,000 books doesn't need 10,000 copies of `describe`. All the books share one copy, stored on their prototype. That's where `describe` was hiding at the end of the [chapter 27 exercises](../27-classes/exercises.md).
- **Built-in methods.** It's why every array has `.map` and every string has `.toUpperCase`, even though you never added them.
- **Classes.** Classes are built on top of prototypes. Knowing what's underneath explains how `extends` and `instanceof` really work.
- **Older code.** Before classes existed, people built objects with prototypes directly. You'll still see that style in older code and tutorials, so you need to be able to read it.

## Real-world example

Think of a family where knowledge gets passed down:

> "If you don't know, ask your parent. If they don't know, ask your grandparent."

A kid is asked for the family's secret dumpling recipe. The kid doesn't know it, so they ask Mom. Mom doesn't know it either, so she asks Grandma. Grandma knows! If nobody in the family knew, the answer would be "nobody knows".

| In the family | In JavaScript |
|---|---|
| What the kid knows | The object's **own** properties |
| Asking Mom | Looking in the object's prototype |
| Asking Grandma | Looking in the prototype's prototype |
| The whole line of people you can ask | The **prototype chain** |
| Nobody knows | `undefined` |

## How it works

### The hidden link

`Object.create(something)` makes a new, empty object whose prototype is `something`. Let's build the family:

```js
const grandma = { recipe: "Grandma's dumplings" };

const mom = Object.create(grandma); // mom's prototype is grandma
mom.car = "Blue hatchback";

const kid = Object.create(mom); // kid's prototype is mom
kid.bike = "Red BMX";

console.log(kid.bike); // prints: Red BMX
console.log(kid.car); // prints: Blue hatchback
console.log(kid.recipe); // prints: Grandma's dumplings
console.log(kid.phone); // prints: undefined
```

`kid` only has one property of its own, `bike`. But it can use `car` from Mom and `recipe` from Grandma. When you print `kid`, you only see its own property:

```js
console.log(kid); // prints: { bike: 'Red BMX' }
```

The official name for the hidden link is **`[[Prototype]]`**. The double square brackets mean it's internal: you can't write `kid.[[Prototype]]`. To see an object's prototype, use `Object.getPrototypeOf`:

```js
console.log(Object.getPrototypeOf(kid) === mom); // prints: true
console.log(Object.getPrototypeOf(mom) === grandma); // prints: true
```

### The prototype chain

Grandma has a prototype too. Every normal object you make with `{ }` gets **`Object.prototype`** as its prototype. That's a built-in object holding methods that every object can use, like `toString`. And `Object.prototype` is the end of the line: its prototype is `null`.

```js
console.log(Object.getPrototypeOf(grandma) === Object.prototype); // prints: true
console.log(Object.getPrototypeOf(Object.prototype)); // prints: null
```

So the full chain looks like this:

```
kid                { bike }
  ↓ prototype
mom                { car }
  ↓ prototype
grandma            { recipe }
  ↓ prototype
Object.prototype   { toString, ... }
  ↓ prototype
null               (the end: nobody left to ask)
```

When you read `kid.something`, JavaScript walks down this chain, one step at a time, and stops at the first object that has it. That's why this works, even though nobody in the family wrote a `toString` method:

```js
console.log(kid.toString()); // prints: [object Object]
```

### Own vs inherited properties

A property the object has itself is an **own** property. A property it gets through the chain is **inherited**. Some tools from [chapter 11](../11-objects/notes.md) look only at own properties, and some look at the whole chain:

```js
console.log(Object.hasOwn(kid, "bike")); // prints: true
console.log(Object.hasOwn(kid, "recipe")); // prints: false
console.log("recipe" in kid); // prints: true
console.log(Object.keys(kid)); // prints: [ 'bike' ]
```

| Tool | Looks at | For `kid` |
|---|---|---|
| `Object.hasOwn(obj, key)` | Own properties only | `"bike"` → `true`, `"car"` → `false` |
| `key in obj` | The whole chain | `"car"` → `true` |
| `Object.keys(obj)` (and `values`, `entries`) | Own properties only | `[ 'bike' ]` |
| `for...in` | Own **and** inherited | `bike`, `car`, `recipe` |

That last row surprises a lot of people. A `for...in` loop over `kid` visits `bike`, then `car`, then `recipe`. If you only want the object's own properties, loop over `Object.keys(obj)` instead.

### Reading walks the chain, writing doesn't

When you **set** a property, JavaScript doesn't go looking up the chain. It creates (or changes) an own property on the object itself:

```js
kid.car = "Toy car"; // creates kid's OWN car property
console.log(kid.car); // prints: Toy car
console.log(mom.car); // prints: Blue hatchback
```

Mom's car is untouched. The kid's own `car` now hides Mom's, the same way a variable can shadow an outer one ([chapter 14](../14-scope-and-hoisting/notes.md)). This is also called **shadowing**.

The link is live, though. It's not a copy. If the prototype changes, everyone further down the chain sees it straight away:

```js
grandma.recipe = "Grandma's spicy dumplings"; // change the prototype...
console.log(kid.recipe); // prints: Grandma's spicy dumplings
```

### Constructor functions: how it was done before classes

Classes only arrived in JavaScript in 2015. Before that, people made many similar objects with a normal function and `new`. This is called a **constructor function**, and you'll still find it in older code:

```js
function Book(title, author) {
  this.title = title;
  this.author = author;
}

Book.prototype.describe = function () {
  return `${this.title} by ${this.author}`;
};

const dune = new Book("Dune", "Frank Herbert");
const matilda = new Book("Matilda", "Roald Dahl");

console.log(dune.describe()); // prints: Dune by Frank Herbert
console.log(dune); // prints: Book { title: 'Dune', author: 'Frank Herbert' }
```

Every function made with the `function` keyword has a property called `prototype`. (Arrow functions don't, because they can't be used with `new`.) It starts out as an almost empty object. You put shared methods on it, like `describe` above, and every object made with `new Book(...)` gets `Book.prototype` as its prototype.

That's the hidden step of `new` that [chapter 27](../27-classes/notes.md) promised. The full list is:

1. Create a new, empty object.
2. **Set its prototype to `Book.prototype`.**
3. Run `Book` with `this` pointing to the new object.
4. Give back the object.

So every book shares the one `describe` function:

```js
console.log(Object.getPrototypeOf(dune) === Book.prototype); // prints: true
console.log(dune.describe === matilda.describe); // prints: true
```

> **Watch out:** The name is confusing. `Book.prototype` is **not** the prototype of `Book`. It's the object that will become the prototype of every book that `Book` builds. Think of it as "the shared toolbox for everything made by `Book`".

One more detail you'll use later: each `prototype` object has a `constructor` property that points back to its function. So `Book.prototype.constructor === Book` is `true`, and `dune.constructor.name` gives you `"Book"` (found through the chain, of course).

> **Tip:** Why not put `describe` inside the constructor, as `this.describe = function () { ... }`? It would work, but every book would get its own separate copy of the function. With 10,000 books, that's 10,000 identical functions. On the prototype, there's just one.

### Classes are syntax sugar over prototypes

**Syntax sugar** means a nicer way to write something that works the same way underneath. Here's the same `Book`, written as a class:

```js
class Book {
  constructor(title, author) {
    this.title = title;
    this.author = author;
  }

  describe() {
    return `${this.title} by ${this.author}`;
  }
}

const dune = new Book("Dune", "Frank Herbert");

console.log(typeof Book); // prints: function
console.log(Object.getPrototypeOf(dune) === Book.prototype); // prints: true
console.log(Object.hasOwn(dune, "describe")); // prints: false
console.log(Object.hasOwn(Book.prototype, "describe")); // prints: true
```

A class is really a function, and the methods you write in the class body go on `Book.prototype`, exactly like the old way. That solves the mystery from chapter 27: `describe` isn't on `dune` at all. It lives on `Book.prototype`, and `dune` finds it through the chain.

`extends` works the same way. It links one prototype to another:

```js
class Animal {
  eat() {
    return "Munch munch";
  }
}

class Dog extends Animal {
  bark() {
    return "Woof!";
  }
}

const rex = new Dog();

console.log(Object.getPrototypeOf(rex) === Dog.prototype); // prints: true
console.log(Object.getPrototypeOf(Dog.prototype) === Animal.prototype); // prints: true
console.log(rex.eat()); // prints: Munch munch
```

So `rex.eat()` walks the chain: `rex` → `Dog.prototype` (no `eat` there) → `Animal.prototype` (found it!). And `instanceof` works by checking the chain too: `rex instanceof Animal` is `true` because `Animal.prototype` is somewhere in `rex`'s chain.

To be honest, "sugar" isn't the *whole* story. Classes add a few safety features that constructor functions don't have: they must be called with `new`, their code is always strict, and they support `#private` fields. But the sharing machinery underneath is the same prototypes. For new code, use classes.

### Built-in prototypes

Now you can see where built-in methods come from. Arrays get their prototype from `Array.prototype`, which is where `map`, `filter`, `push` and friends live:

```js
const scores = [90, 72, 85];

console.log(Object.getPrototypeOf(scores) === Array.prototype); // prints: true
console.log(Object.hasOwn(scores, "map")); // prints: false
console.log(Object.hasOwn(Array.prototype, "map")); // prints: true
```

The chain for an array is `scores` → `Array.prototype` → `Object.prototype` → `null`. That's why the MDN documentation calls the method `Array.prototype.map()`. Now you can read that name: "the `map` that lives on `Array.prototype`, shared by all arrays".

Strings work the same way, with `String.prototype`. A string itself is a primitive, not an object, but when you write `"hi".toUpperCase()`, JavaScript quietly wraps the string in an object for a moment so it can find the method.

### Don't change built-in prototypes

Since `Array.prototype` is just an object, you *can* add your own methods to it, and every array will get them:

```js
Array.prototype.last = function () {
  return this[this.length - 1];
};

console.log([10, 20, 30].last()); // prints: 30
```

It works, and that's exactly the danger. Don't do it:

- **It changes every array in the whole program**, including the ones inside libraries you didn't write, which might not expect it.
- **It can clash with the future.** If JavaScript later adds a real method with the same name, the two fight. This really happened. An old library called MooTools had added its own `flatten` to arrays, so when JavaScript planned an official `Array.prototype.flatten` in 2018, it would have broken websites that used MooTools. The official method had to be renamed. That's why it's called `flat` today.
- **It shows up where it shouldn't.** A `for...in` loop over `["red", "green"]` now prints `0`, `1` and `last`.

Write a normal function instead, like `function last(array) { ... }`. (And for this case, you already have `.at(-1)` from [chapter 10](../10-arrays/notes.md).)

### `__proto__`: recognize it, don't use it

In older code and some tutorials, you'll see `__proto__` (two underscores on each side):

```js
console.log(kid.__proto__ === mom); // prints: true
```

It's an old way to read or change an object's prototype. It still works, because old websites depend on it, but it's a leftover. Use `Object.getPrototypeOf(obj)` to read a prototype and `Object.create(proto)` to make an object with a chosen prototype.

`__proto__` is also behind a real security problem called prototype pollution, where an attacker sneaks a `__proto__` key into data your code merges into an object. You'll learn about it in [chapter 51](../51-security-basics/notes.md).

## Common mistakes

**1. Looking for `.prototype` on an instance**

```js
const dune = new Book("Dune", "Frank Herbert");

console.log(dune.prototype); // prints: undefined
console.log(Object.getPrototypeOf(dune) === Book.prototype); // prints: true
```

The `prototype` property belongs to constructor functions and classes: it's the toolbox they hand out to the objects they build. An ordinary object like `dune` doesn't have one. Fix: to find an object's prototype, use `Object.getPrototypeOf(dune)`.

**2. Forgetting `new` with a constructor function**

```js
function Book(title, author) {
  this.title = title;
  this.author = author;
}

const dune = Book("Dune", "Frank Herbert"); // forgot new!

console.log(dune); // prints: undefined
console.log(globalThis.title); // prints: Dune
```

Without `new`, `Book` runs as a plain function call. In sloppy mode, `this` is `globalThis` ([chapter 26](../26-this-keyword/notes.md)), so it quietly creates global variables and returns nothing. A class would have thrown an error instead, which is one more reason to prefer classes. Fix: `new Book(...)`.

**3. Using an arrow function for a prototype method**

```js
Book.prototype.describe = () => {
  return `${this.title} by ${this.author}`;
};

const dune = new Book("Dune", "Frank Herbert");
console.log(dune.describe()); // prints: undefined by undefined
```

Arrow functions don't have their own `this`, so `this` isn't the book. Fix: use `function () { ... }` for methods you put on a prototype.

**4. Forgetting that `for...in` includes inherited properties**

```js
const defaults = { sound: true, volume: 5 };
const settings = Object.create(defaults);
settings.volume = 8;

for (const key in settings) {
  console.log(key); // volume, then sound: the inherited one sneaks in
}
```

If you only wanted the user's own settings, this loop gives you too much. Fix: loop over `Object.keys(settings)`, or check `Object.hasOwn(settings, key)` inside the loop.

**5. Adding methods to built-in prototypes**

It's tempting to "improve" arrays or strings by adding methods to `Array.prototype` or `String.prototype`. As you saw above, it affects all code everywhere and can clash with future JavaScript. Fix: write a normal helper function.

## Quick recap

- Every object has a hidden link, `[[Prototype]]`, to another object. If a property is missing, JavaScript looks up the **prototype chain** until it reaches `Object.prototype`, then `null`.
- `Object.create(proto)` makes an object with the prototype you choose. `Object.getPrototypeOf(obj)` shows an object's prototype.
- **Own** properties belong to the object itself. `Object.hasOwn` and `Object.keys` see only those, while `in` and `for...in` see the whole chain.
- Setting a property always creates an own property (shadowing). The prototype itself doesn't change.
- Constructor functions put shared methods on `Fn.prototype`, and `new` links each object to it. Classes do the same thing with nicer syntax.
- Built-in methods live on built-in prototypes, like `Array.prototype.map`. Don't add your own to them, and avoid `__proto__`.

---

**Next:** try the [exercises](exercises.md), then move on to [29 Modules](../29-modules/notes.md).
