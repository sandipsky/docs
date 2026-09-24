# 27 Classes

## What is it?

A **class** is a blueprint for making objects. You describe once what every object of that kind has (its properties) and can do (its methods). Then you can make as many objects from it as you like.

## Why does it matter?

Real programs need lots of similar objects: every book in a library, every player in a game, every order in a shop. Writing each one by hand as an object literal means copying the same methods again and again. And when you find a bug, you have to fix every copy.

You already know one fix: factory functions like `createAccount` from [chapter 25](../25-closures/notes.md). Classes are JavaScript's built-in way to do the same job, and you'll see them everywhere: in libraries, in frameworks, and in JavaScript itself.

In fact, you've already used classes:

- `new Date()` in [chapter 19](../19-dates-and-times/notes.md) made an object from the `Date` class.
- `new Error("...")` in [chapter 18](../18-error-handling/notes.md) made an object from the `Error` class.

Now you'll write your own.

## Real-world example

Think of an architect's blueprint for a house.

The blueprint isn't a house. You can't live in it. But a building crew can use it to build as many houses as you want, and each house is real and separate. Paint one house blue, and the others don't change.

| Class idea | The house version |
|---|---|
| The class | The blueprint |
| `new House()` | Building a house from the blueprint |
| An **instance** (one object made from the class) | One real house |
| The constructor (the setup code) | The crew's setup steps: paint color, owner's name |
| Properties | Each house's own details: its color, its owner |
| Methods | Things every house can do: open the garage, ring the doorbell |

(A cookie cutter works too: one cutter, many cookies, and each one can get its own sprinkles.)

## How it works

### Your first class

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
const matilda = new Book("Matilda", "Roald Dahl");

console.log(dune.describe()); // prints: Dune by Frank Herbert
console.log(matilda.describe()); // prints: Matilda by Roald Dahl
console.log(dune); // prints: Book { title: 'Dune', author: 'Frank Herbert' }
```

Here's each part:

- **`class Book { ... }`** is the blueprint. Class names start with a capital letter, by convention. That's how you can tell `Book` is a class and `book` is a normal variable.
- **`constructor(...)`** is a special method that runs automatically every time you make a new object. Its job is to set the object up.
- **`this`** inside the constructor is the brand-new object being built. Remember the last row of the table in [chapter 26](../26-this-keyword/notes.md)? `this.title = title` gives the new object a `title` property.
- **`describe()`** is a method. Every book made from this class can use it. Inside a class, methods don't need the word `function`, and there are **no commas** between them.
- **`new Book("Dune", "Frank Herbert")`** builds a new object from the blueprint. The arguments go straight to the constructor.

When you print an instance, Node shows the class name in front: `Book { ... }`. That's a handy reminder of which blueprint it came from.

### What `new` does

When you write `new Book("Dune", "Frank Herbert")`, three things happen:

1. JavaScript creates a new, empty object.
2. It runs the constructor, with `this` pointing to that new object.
3. It gives you back the finished object.

(There's one more hidden step, which [chapter 28](../28-prototypes/notes.md) will reveal.)

### Class fields: properties with a starting value

Some properties start the same for every new object. You can write them straight into the class body. These are called **class fields**:

```js
class Player {
  score = 0; // every new player starts with these
  lives = 3;

  constructor(name) {
    this.name = name;
  }

  addPoints(points) {
    this.score += points;
  }

  loseLife() {
    this.lives -= 1;
  }
}

const mia = new Player("Mia");
const leo = new Player("Leo");

mia.addPoints(50);
mia.loseLife();

console.log(mia); // prints: Player { score: 50, lives: 2, name: 'Mia' }
console.log(leo); // prints: Player { score: 0, lives: 3, name: 'Leo' }
```

Each instance gets its own copy of every property. Mia's points don't touch Leo's. Two houses, two paint jobs.

Use a class field when the starting value is always the same. Use the constructor when the value comes from the arguments, like each player's `name`.

### Getters and setters

Sometimes a property should be **worked out** from other properties, so it can never be out of date. Or you want some code to run whenever a property is changed. That's what getters and setters are for.

- A **getter** (`get`) is a method that runs when you *read* a property.
- A **setter** (`set`) is a method that runs when you *assign* to a property.

```js
class Temperature {
  constructor(celsius) {
    this.celsius = celsius;
  }

  get fahrenheit() {
    return (this.celsius * 9) / 5 + 32;
  }

  set fahrenheit(value) {
    this.celsius = ((value - 32) * 5) / 9;
  }
}

const oven = new Temperature(180);
console.log(oven.fahrenheit); // prints: 356

oven.fahrenheit = 212; // runs the setter
console.log(oven.celsius); // prints: 100
```

Notice there are **no brackets**: you write `oven.fahrenheit`, not `oven.fahrenheit()`. From the outside, it looks like a normal property. Behind the scenes, it runs your code.

The object only really stores `celsius`. The Fahrenheit value is always calculated fresh from it, so the two can never disagree.

### `static`: things that belong to the class itself

Most properties and methods belong to each instance: every book has its own title. But some things belong to the **class as a whole**. Mark those with `static`.

You've used static methods already: `Date.now()`, `Number.isInteger()` and `Array.isArray()` are all called on the class itself, not on one date or one number.

```js
class Ticket {
  static nextNumber = 1; // one shared value, stored on the class itself
  static price = 12;

  constructor(movie) {
    this.movie = movie;
    this.number = Ticket.nextNumber;
    Ticket.nextNumber += 1;
  }

  static totalFor(count) {
    return count * Ticket.price;
  }
}

const first = new Ticket("Inception");
const second = new Ticket("Frozen");

console.log(first.number, second.number); // prints: 1 2
console.log(Ticket.totalFor(4)); // prints: 48
console.log(first.totalFor); // prints: undefined
```

- `Ticket.nextNumber` is one counter shared by the whole class. Each new ticket takes the next number.
- `Ticket.totalFor(4)` is a helper that doesn't need any particular ticket.
- Static things live on the class, not on the instances. That's why `first.totalFor` is `undefined`.

### Private fields and methods

Remember the bank account from chapter 25, where a closure kept the balance safe? Classes have their own way to do that: start a field's name with **`#`**. A **private field** can only be used by code inside the class.

```js
class BankAccount {
  #balance = 0; // private: only code inside this class can use it

  constructor(owner) {
    this.owner = owner;
  }

  deposit(amount) {
    this.#checkAmount(amount);
    this.#balance += amount;
  }

  withdraw(amount) {
    this.#checkAmount(amount);
    if (amount > this.#balance) {
      throw new Error("Not enough money in the account");
    }
    this.#balance -= amount;
  }

  get balance() {
    return this.#balance;
  }

  #checkAmount(amount) {
    if (amount <= 0) {
      throw new Error("Amount must be more than 0");
    }
  }
}
```

`#checkAmount` is a **private method**: a helper only the class itself can call. And `get balance()` is a getter with no setter, so outside code can read the balance but not change it.

```js
const account = new BankAccount("Priya");
account.deposit(100);
account.withdraw(30);

console.log(account.balance); // prints: 70
console.log(account); // prints: BankAccount { owner: 'Priya' }

account.balance = 1000000; // ignored: balance only has a getter
console.log(account.balance); // prints: 70
```

Node doesn't even show `#balance` when it prints the object. And if you try to touch a private field from outside the class, JavaScript refuses to run the file at all:

```js
console.log(account.#balance);
// SyntaxError: Private field '#balance' must be declared in an enclosing class
```

> **Watch out:** `account.balance = 1000000` only fails *silently* because that line is in a sloppy-mode file. If the same line runs in strict mode (with `"use strict"`, in a module, or inside a class), it throws `TypeError: Cannot set property balance of #<BankAccount> which has only a getter`. Either way, the balance is safe.

### Inheritance: `extends` and `super`

A library lends out books and DVDs. They have a lot in common (a title, a year, being checked out), but each has its own extras. Instead of writing the shared parts twice, one class can build on another. This is called **inheritance**.

```js
class LibraryItem {
  constructor(title, year) {
    this.title = title;
    this.year = year;
    this.isCheckedOut = false;
  }

  checkOut() {
    this.isCheckedOut = true;
  }

  describe() {
    return `${this.title} (${this.year})`;
  }
}

class Book extends LibraryItem {
  constructor(title, year, author) {
    super(title, year); // run LibraryItem's constructor first
    this.author = author;
  }

  describe() {
    return `${super.describe()} by ${this.author}`; // reuse the parent's version
  }
}

class Dvd extends LibraryItem {
  constructor(title, year, minutes) {
    super(title, year);
    this.minutes = minutes;
  }
}
```

- **`extends`** means "start with everything from this class". `LibraryItem` is the **parent** class, and `Book` and `Dvd` are **child** classes.
- **`super(title, year)`** calls the parent's constructor, so the parent can set up its part of the object. In a child class, you must call it before you use `this`.
- **`super.describe()`** calls the parent's version of a method.
- `Book` has its own `describe`, which replaces the parent's. That's called **overriding**. `Dvd` doesn't override it, so it uses the parent's.

```js
const novel = new Book("The Hobbit", 1937, "J.R.R. Tolkien");
const film = new Dvd("Spirited Away", 2001, 125);

novel.checkOut(); // inherited from LibraryItem

console.log(novel.describe()); // prints: The Hobbit (1937) by J.R.R. Tolkien
console.log(film.describe()); // prints: Spirited Away (2001)
console.log(novel.isCheckedOut); // prints: true
console.log(film.isCheckedOut); // prints: false
```

Neither `Book` nor `Dvd` wrote a `checkOut` method, but both have one. They inherited it.

### `instanceof`: which blueprint made this?

`instanceof` checks whether an object was made from a class, or from a child of that class:

```js
console.log(novel instanceof Book); // prints: true
console.log(novel instanceof LibraryItem); // prints: true
console.log(film instanceof Book); // prints: false
```

A book *is a* library item, so the second line is `true`. A DVD is a library item too, but it isn't a book.

### Custom error classes

In [chapter 18](../18-error-handling/notes.md) you threw errors with `new Error("...")`. `Error` is a class, so you can extend it to make your own kinds of errors:

```js
class ValidationError extends Error {
  constructor(field, message) {
    super(message); // Error's constructor stores the message
    this.name = "ValidationError";
    this.field = field;
  }
}

function registerUser(user) {
  if (!user.email.includes("@")) {
    throw new ValidationError("email", "Email must contain @");
  }
  return `Welcome, ${user.name}!`;
}
```

Now the code that catches the error can tell *your* errors apart from everything else, using `instanceof`:

```js
try {
  registerUser({ name: "Kofi", email: "kofi.example.com" });
} catch (error) {
  if (error instanceof ValidationError) {
    console.log(`Please fix the ${error.field} field: ${error.message}`);
  } else {
    throw error; // not a problem we know how to handle (chapter 18)
  }
}
// prints: Please fix the email field: Email must contain @
```

A form can use `error.field` to show the message next to the right input. And any unexpected error, like a real bug, still crashes loudly instead of being hidden.

### Composition vs inheritance

Inheritance fits when one thing **is a** kind of another: a book *is a* library item. But often, one thing **has a** part: a car *has an* engine. For that, give the object its part as a property. This is called **composition**, building objects out of smaller objects.

```js
class PetrolEngine {
  start() {
    return "Vroom!";
  }
}

class ElectricMotor {
  start() {
    return "Hmmm... (almost silent)";
  }
}

class Car {
  constructor(model, engine) {
    this.model = model;
    this.engine = engine; // a car HAS an engine
  }

  start() {
    return `${this.model}: ${this.engine.start()}`;
  }
}

const taxi = new Car("Corolla", new PetrolEngine());
const cityCar = new Car("Leaf", new ElectricMotor());

console.log(taxi.start()); // prints: Corolla: Vroom!
console.log(cityCar.start()); // prints: Leaf: Hmmm... (almost silent)
```

The same `Car` works with any engine you hand it, as long as the engine has a `start()` method. With inheritance, you'd need a `PetrolCar` class *and* an `ElectricCar` class, and then more classes for every new combination.

Long chains of inheritance (a class that extends a class that extends a class...) get hard to change, because a change at the top ripples down to everything below. So a good rule is: **when you're not sure, prefer composition.** Use inheritance only for a clear "is a" relationship, and keep it shallow.

### Class or plain object?

Classes are great, but you don't need one for everything:

| Situation | Use |
|---|---|
| One single object, like your app's settings | A plain object literal `{ ... }` |
| Plain data, like a product from a list | Plain objects |
| Many objects with the same shape *and* methods | A class |
| Data that must stay private, with rules around changing it | A class with `#private` fields (or a closure) |
| You need `instanceof` checks, like custom errors | A class |

### Classes are always strict

Everything inside a class runs in strict mode, even in a normal `.js` file. So if a method gets detached from its object, `this` is `undefined` and you get a clear error, not a silent `undefined` ([chapter 26](../26-this-keyword/notes.md)). You'll see this in common mistake 5 below.

## Common mistakes

**1. Forgetting `new`**

```js
const dune = Book("Dune", "Frank Herbert");
// TypeError: Class constructor Book cannot be invoked without 'new'
```

A class can't be called like a normal function. Fix: `new Book("Dune", "Frank Herbert")`.

**2. Putting commas between methods**

```js
class Playlist {
  constructor(name) {
    this.name = name;
  },

  describe() {
    return `Playlist: ${this.name}`;
  }
}
// SyntaxError: Unexpected token ','
```

In an object literal, properties are separated by commas. In a class, they aren't. Fix: delete the comma after the `}`.

**3. Using `this` before calling `super()`**

```js
class Animal {
  constructor(name) {
    this.name = name;
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    this.breed = breed; // using this before super()
    super(name);
  }
}

const rex = new Dog("Rex", "Beagle");
// ReferenceError: Must call super constructor in derived class before accessing 'this' or returning from derived constructor
```

In a child class, the parent has to build its part of the object first. ("Derived class" is another name for a child class.) Fix: make `super(name)` the first line of the constructor. You get the same error if you forget `super()` completely.

**4. Using a class before the line that creates it**

```js
const order = new Order("Pizza");
// ReferenceError: Cannot access 'Order' before initialization

class Order {
  constructor(item) {
    this.item = item;
  }
}
```

Function declarations are hoisted, but classes behave like `let` and `const`: they're in the temporal dead zone until their line runs ([chapter 14](../14-scope-and-hoisting/notes.md)). Fix: define your classes at the top of the file.

**5. Detaching a method**

```js
class Timer {
  seconds = 0;

  tick() {
    this.seconds += 1;
  }
}

const timer = new Timer();
const tick = timer.tick; // detached from timer
tick();
// TypeError: Cannot read properties of undefined (reading 'seconds')
```

It's the lost `this` from chapter 26, and because class code is strict, `this` is `undefined`. Fix it the same way: `timer.tick.bind(timer)`, or wrap it in an arrow, `() => timer.tick()`.

## Quick recap

- A **class** is a blueprint. `new` builds an **instance** from it, and the **constructor** sets each one up.
- Methods are written without `function` and without commas. Getters and setters look like properties but run code.
- `static` things belong to the class itself. `#private` fields and methods can only be used inside the class.
- `extends` makes a child class. `super(...)` runs the parent's constructor, and a child can override the parent's methods.
- Extend `Error` to make custom errors, and check them with `instanceof`.
- Prefer composition ("has a") over inheritance ("is a") when you're unsure. Use plain objects for one-off data.
- Class code is always strict.

---

**Next:** try the [exercises](exercises.md), then move on to [28 Prototypes](../28-prototypes/notes.md).
