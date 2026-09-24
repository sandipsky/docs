# 44 Design Patterns

## What is it?

A **design pattern** is a named, proven solution to a problem that keeps coming up in programming.

It isn't code you copy and paste. It's an idea, a shape for your code, that you adapt to your own program. Developers have met the same problems again and again, and these are the answers that kept working.

## Why does it matter?

Three reasons:

- **You don't reinvent the wheel.** When you hit a familiar problem, like "five parts of my app need to know when an order is placed", there's already a good answer waiting.
- **You get a shared vocabulary.** Saying "let's use an observer here" tells another developer a whole paragraph's worth of design in three words.
- **You'll recognize them everywhere.** Libraries, frameworks, and Node itself are full of patterns. Once you know the names, other people's code gets much easier to read.

Here's the good news: you've already used several of them without knowing their names. `addEventListener` from [chapter 21](../21-events/notes.md) is a pattern. So is your `debounce` from [chapter 34](../34-debounce-and-throttle/notes.md). This chapter gives those ideas names, and shows you a few new ones.

## Real-world example

Think of a cookbook.

A recipe doesn't describe *your* dinner party. It describes a way of cooking that works, and you adjust it: more salt, no onions, double the amount. Chefs also use recipe names as shorthand. One chef says "make a roux" (a flour-and-butter base for sauces), and the other knows exactly what to do, without a long explanation.

Design patterns are the recipes of programming. Here are the ones in this chapter, with an everyday version of each:

| Pattern | Everyday version | The problem it solves |
|---|---|---|
| **Module** | A vending machine: buttons on the outside, machinery hidden inside | Hide the details, show only a small set of controls |
| **Factory** | A pizza counter: you say "margherita", the kitchen knows how to make it | Create objects without the caller knowing every detail |
| **Singleton** | The one thermostat in a house that everybody shares | There must be exactly one of something |
| **Observer** | The subscribe button and bell on a video channel | Tell many listeners when something happens |
| **Strategy** | Picking standard or express delivery at checkout | Swap one way of doing a job for another |
| **Decorator** | Gift wrapping: the same gift, with an extra layer around it | Add behavior without changing the original |
| **Adapter** | A travel plug adapter | Make two things fit that have different shapes |

Many of these names come from a famous 1994 book, *Design Patterns*, written by four authors nicknamed the "Gang of Four". Their examples used languages like C++. In JavaScript, functions and closures make many patterns much shorter, as you're about to see.

## How it works

Each pattern below follows the same order: the problem first, then the pattern that solves it.

### Module: hide the details

**The problem:** if your data sits out in the open, any line of code anywhere can change it, by accident or on purpose.

**The pattern:** keep the data private, and hand out only a small set of functions to work with it. That small set is called the **public interface**: the buttons on the vending machine.

Before ES modules existed, people built this with a closure ([chapter 25](../25-closures/notes.md)). You'll still see it in older code:

```js
const scoreboard = (function () {
  const scores = []; // private: only the functions below can see it

  function add(player, points) {
    scores.push({ player, points });
  }

  function best() {
    return scores.toSorted((a, b) => b.points - a.points)[0];
  }

  return { add, best }; // the public part
})();

scoreboard.add("Mia", 420);
scoreboard.add("Raj", 610);
console.log(scoreboard.best()); // prints: { player: 'Raj', points: 610 }
console.log(scoreboard.scores); // prints: undefined
```

The strange `(function () { ... })()` shape is an **IIFE** (Immediately Invoked Function Expression): a function that's created and called straight away. It runs once, and `scoreboard` keeps the object it returns. `scores` lives on inside the closure, where nothing outside can reach it.

Today, you get the same thing for free with ES modules ([chapter 29](../29-modules/notes.md)). A module file is its own private room: anything you don't `export` stays inside.

```js
// scoreboard.js
const scores = []; // not exported, so it stays private

export function addScore(player, points) {
  scores.push({ player, points });
}

export function bestScore() {
  return scores.toSorted((a, b) => b.points - a.points)[0];
}
```

```js
// main.js
import { addScore, bestScore } from "./scoreboard.js";

addScore("Mia", 420);
addScore("Raj", 610);
console.log(bestScore()); // prints: { player: 'Raj', points: 610 }
```

(Remember: for `import` and `export` in Node, the folder needs a `package.json` containing `{ "type": "module" }`.)

If `main.js` tries `import { scores } from "./scoreboard.js";`, Node refuses with a `SyntaxError`: the module "does not provide an export named 'scores'". For new code, use ES modules. Knowing the IIFE version helps you read older code.

### Factory: let a function build the objects

**The problem:** creating an object sometimes needs a lot of know-how. In a game, every place that creates a character would need to remember that a mage has 80 health and a warrior has 150. If those numbers change, you have to find every one of those places.

**The pattern:** a **factory** is a function whose job is to create objects. You tell it *what* you want, and it handles *how*. That's the pizza counter: you say "margherita", and the kitchen knows the recipe.

```js
const characterTypes = {
  warrior: { health: 150, attack: 12 },
  mage: { health: 80, attack: 20 },
  archer: { health: 100, attack: 15 },
};

function createCharacter(type, name) {
  const stats = characterTypes[type];
  if (!stats) {
    throw new Error(`Unknown character type: ${type}`);
  }
  return { name, type, ...stats, level: 1 };
}

const aria = createCharacter("mage", "Aria");
console.log(aria);
// prints: { name: 'Aria', type: 'mage', health: 80, attack: 20, level: 1 }
```

Now the stats live in one place. Change a number there, and every new mage gets it.

A factory can also decide *which kind* of object to make. Here, some customers want text messages and some want emails:

```js
function createNotifier(user) {
  if (user.prefers === "sms") {
    return { send: (text) => console.log(`SMS to ${user.phone}: ${text}`) };
  }
  return { send: (text) => console.log(`Email to ${user.email}: ${text}`) };
}

const customers = [
  { name: "Lena", prefers: "email", email: "lena@example.com" },
  { name: "Tom", prefers: "sms", phone: "555-0142" },
];

for (const customer of customers) {
  const notifier = createNotifier(customer);
  notifier.send("Your parcel is on its way!");
}
```

You'll see:

```
Email to lena@example.com: Your parcel is on its way!
SMS to 555-0142: Your parcel is on its way!
```

Look at the loop. It never asks "is this an SMS or an email?" It just calls `send`. Only the factory knows the difference, so adding push notifications next month means changing the factory, not the loop. (A factory can also return instances of different classes from [chapter 27](../27-classes/notes.md). The caller still doesn't need to know.)

### Singleton: exactly one of something

**The problem:** some things should exist exactly once in an app, like the settings or a logger. If two parts of the app each made their own settings object, one could say "dark mode" while the other says "light mode".

**The pattern:** a **singleton** is an object that has only one instance, shared by everyone, like the single thermostat in a house.

In JavaScript, the easiest singleton is an object exported from a module. Remember from chapter 29 that a module runs only once, and every file that imports it gets the same copy:

```js
// settings.js
export const settings = {
  theme: "light",
  language: "en",
};
```

```js
// header.js
import { settings } from "./settings.js";

export function turnOnDarkMode() {
  settings.theme = "dark";
}
```

```js
// main.js
import { settings } from "./settings.js";
import { turnOnDarkMode } from "./header.js";

turnOnDarkMode();
console.log(settings.theme); // prints: dark
```

`header.js` and `main.js` both imported `settings`, and they got the very same object, so a change made in one file shows up in the other. (In languages like Java, you'll see singletons built with a special `getInstance()` method. In JavaScript, a module does the job with no extra code.)

> **Watch out:** a singleton is shared state that the whole app can change, which makes it a global variable in disguise. When something goes wrong, *any* file could be the culprit. Tests get harder too, because one test's changes leak into the next ([chapter 46](../46-testing/notes.md)). Keep singletons for things that truly are one-of-a-kind, and prefer passing values in as parameters. For settings that shouldn't change, `Object.freeze` from [chapter 43](../43-functional-programming/notes.md) helps.

### Observer: tell everyone who's interested

**The problem:** when a customer places an order in an online shop, lots of things should happen: send a thank-you email, pack the items, add loyalty points. The obvious way is for `placeOrder` to call `sendEmail(order)`, `packItems(order)`, `addPoints(order)`, and so on. But then `placeOrder` has to know about every other feature in the shop, and each new idea means editing it again.

**The pattern:** with the **observer** pattern, the order code only announces "an order was placed!", and anyone who cares signs up to hear about it. It's the subscribe button and bell on a video channel: the creator uploads once, every subscriber gets notified, and the creator doesn't need to know who they are.

You've used this already: `button.addEventListener("click", handleClick)` in chapter 21. The button announces clicks, and your function is an **observer** (also called a **listener**): a function waiting to be told that something happened.

Let's build a tiny version ourselves. It's called an **emitter**, because it emits (sends out) events:

```js
class Emitter {
  #listeners = new Map(); // event name -> array of listener functions

  on(eventName, listener) {
    if (!this.#listeners.has(eventName)) {
      this.#listeners.set(eventName, []);
    }
    this.#listeners.get(eventName).push(listener);
  }

  off(eventName, listener) {
    const list = this.#listeners.get(eventName) ?? [];
    this.#listeners.set(eventName, list.filter((fn) => fn !== listener));
  }

  emit(eventName, data) {
    const list = this.#listeners.get(eventName) ?? [];
    for (const listener of list) {
      listener(data);
    }
  }
}
```

Three methods, three jobs: `on` subscribes ("call this function when that event happens"), `off` unsubscribes, and `emit` announces an event by calling every subscribed function with the data. The `Map` from [chapter 35](../35-map-and-set/notes.md) keeps one list per event name, and the private `#listeners` field ([chapter 27](../27-classes/notes.md)) keeps those lists safe from outside code.

Now the shop can announce orders without knowing who's listening:

```js
const shop = new Emitter();

shop.on("orderPlaced", (order) => console.log(`Email: thanks for order #${order.id}`));
shop.on("orderPlaced", (order) => console.log(`Stock: pack ${order.items.join(" and ")}`));

function addPoints(order) {
  console.log(`Points: +${Math.floor(order.total)}`);
}
shop.on("orderPlaced", addPoints);

shop.emit("orderPlaced", { id: 101, items: ["mug", "tea"], total: 23.5 });
shop.off("orderPlaced", addPoints); // the points promotion is over
shop.emit("orderPlaced", { id: 102, items: ["kettle"], total: 40 });
```

You'll see:

```
Email: thanks for order #101
Stock: pack mug and tea
Points: +23
Email: thanks for order #102
Stock: pack kettle
```

The second order gets no points, because `addPoints` unsubscribed. Just like `removeEventListener`, `off` needs the *same function*, which is why `addPoints` has a name. And adding a new feature is now one more `on` call. The code that emits `"orderPlaced"` never changes.

You'll also hear the name **pub-sub** (publish-subscribe). It's the same idea with a middleman, like a notice board: publishers pin up messages under a topic, subscribers watch the topics they care about, and neither side knows the other. One `Emitter` shared by the whole app can be that notice board. Many developers use the two names loosely.

> **Tip:** Node has a fuller, built-in version of this class called `EventEmitter`, with the same `on`, `off`, and `emit` methods. You'll use it in [chapter 49](../49-nodejs-basics/notes.md).

### Strategy: swap how a job gets done

**The problem:** a shop offers several shipping methods, and each one is priced differently. The first version usually looks like this:

```js
function shippingCost(method, weightKg) {
  if (method === "standard") {
    return 5;
  } else if (method === "express") {
    return 10 + weightKg * 2;
  } else if (method === "overnight") {
    return 25 + weightKg * 3;
  } else if (method === "pickup") {
    return 0;
  } else {
    throw new Error(`Unknown shipping method: ${method}`);
  }
}
```

It works, but it grows with every new method, and all the pricing rules are tangled together in one function.

**The pattern:** a **strategy** is one way of doing a job, packed into its own function. Keep all the strategies in an object, and pick one by name:

```js
const shippingMethods = {
  standard: () => 5,
  express: (weightKg) => 10 + weightKg * 2,
  overnight: (weightKg) => 25 + weightKg * 3,
  pickup: () => 0,
};

function shippingCost(method, weightKg) {
  const calculate = shippingMethods[method];
  if (!calculate) {
    throw new Error(`Unknown shipping method: ${method}`);
  }
  return calculate(weightKg);
}

console.log(shippingCost("express", 3)); // prints: 16
console.log(shippingCost("pickup", 3)); // prints: 0
```

Each rule is now small and sits on its own line. A new method, like drone delivery, is one new line in the object, and `shippingCost` doesn't change at all. The options are data now, too: `Object.keys(shippingMethods)` gives you `[ 'standard', 'express', 'overnight', 'pickup' ]`, ready to show in a menu.

You've used strategies before. `toSorted` in [chapter 13](../13-array-methods/notes.md) doesn't know how you want things ordered. You hand it a compare function, and that function is the strategy:

```js
const products = [
  { name: "Lamp", price: 35, rating: 4.1 },
  { name: "Desk", price: 120, rating: 4.7 },
  { name: "Chair", price: 60, rating: 3.9 },
];

const cheapestFirst = (a, b) => a.price - b.price;
const bestRatedFirst = (a, b) => b.rating - a.rating;

console.log(products.toSorted(cheapestFirst).map((p) => p.name)); // prints: [ 'Lamp', 'Chair', 'Desk' ]
console.log(products.toSorted(bestRatedFirst).map((p) => p.name)); // prints: [ 'Desk', 'Lamp', 'Chair' ]
```

Same `toSorted`, different strategy, different result.

### Decorator: wrap a function to add behavior

**The problem:** you want some extra behavior around a function, like logging every call, without changing the function itself. Maybe it's someone else's code, or you want the same extra behavior on ten different functions.

**The pattern:** a **decorator** is a function that takes a function and returns a new function. The new one does something extra and calls the original inside. It's gift wrapping: the gift inside doesn't change, but now it has a layer around it.

```js
function withLogging(fn) {
  return function (...args) {
    console.log(`Calling ${fn.name}(${args.join(", ")})`);
    const result = fn(...args);
    console.log(`${fn.name} returned ${result}`);
    return result;
  };
}

function addTax(price, rate) {
  return price + price * rate;
}

const addTaxLogged = withLogging(addTax);
const total = addTaxLogged(40, 0.25);
console.log(total);
```

You'll see:

```
Calling addTax(40, 0.25)
addTax returned 50
50
```

A few things to notice:

- Every function has a `name` property that holds its name, so `fn.name` is `"addTax"`.
- `...args` collects whatever arguments come in, and `fn(...args)` passes them all on ([chapter 15](../15-destructuring-spread-rest/notes.md)).
- The wrapper **returns the original's result**, so the caller gets the same answer as before, plus the extra behavior. And `addTax` itself didn't change at all.

Here's a surprise: you've already built several decorators.

| You built it in... | Decorator | The extra behavior it adds |
|---|---|---|
| [Chapter 25](../25-closures/notes.md) | `once(fn)` | Runs the function only the first time |
| [Chapter 34](../34-debounce-and-throttle/notes.md) | `debounce(fn, delay)` | Waits until the calls calm down |
| [Chapter 43](../43-functional-programming/notes.md) | `memoize(fn)` | Remembers answers it has already worked out |

Because a decorator returns a normal function, you can wrap a gift twice. `once(withLogging(chargeCard))` gives you a payment function that logs its first call and ignores every call after that.

> **Tip:** if you decorate an object's method, call the original with `fn.apply(this, args)` instead of `fn(...args)`, so `this` still points at the object. It's the same trick your `debounce` used in chapter 34.

You may also see `@something` written above a class in TypeScript or Angular code. That's a newer decorator *syntax*. Plain JavaScript in Node 24 doesn't support it yet (you'd get a `SyntaxError`), but the idea is the same: wrap something to add behavior.

### Adapter: make mismatched shapes fit

**The problem:** your code expects data in one shape, but the outside world hands it over in another. Weather services are a good example. Each one names its fields differently, and none of them match what your display code wants.

**The pattern:** an **adapter** is a small piece of code that sits in between and converts one shape into the other. It's a travel plug adapter: your laptop charger stays the same, the wall socket stays the same, and the adapter makes them fit.

```js
// Your display code expects: { city, tempC, windKph }
function showWeather(weather) {
  console.log(`${weather.city}: ${weather.tempC}°C, wind ${weather.windKph} km/h`);
}

// Open-Meteo's reply, trimmed (you met it in chapter 39)
const openMeteoReply = {
  current: { temperature_2m: 15.4, wind_speed_10m: 7.6 },
};

// A made-up second provider: the same facts, a different shape
const otherReply = {
  place: "Paris",
  conditions: { tempC: 18.1, wind: { kph: 11.2 } },
};
```

One adapter per provider turns its reply into your shape:

```js
function adaptOpenMeteo(reply, city) {
  return {
    city,
    tempC: reply.current.temperature_2m,
    windKph: reply.current.wind_speed_10m,
  };
}

function adaptOther(reply) {
  return {
    city: reply.place,
    tempC: reply.conditions.tempC,
    windKph: reply.conditions.wind.kph,
  };
}

showWeather(adaptOpenMeteo(openMeteoReply, "London"));
showWeather(adaptOther(otherReply));
```

You'll see:

```
London: 15.4°C, wind 7.6 km/h
Paris: 18.1°C, wind 11.2 km/h
```

`showWeather` never learns that two providers exist. The outside world's strange field names, like `temperature_2m`, stay inside the adapters. So if a provider renames a field next year, you fix one small function instead of hunting through your whole app. An adapter can also convert units (Fahrenheit to Celsius, say) or rename methods on an object, not just fields.

### Don't force patterns in

Patterns are tools, not goals. A 30-line script doesn't need a factory, a strategy, and a singleton. Every pattern adds a layer, and every layer is something the next reader has to understand.

Two rules of thumb help here:

- **KISS** ("Keep It Simple"): the simplest code that works is usually the best code.
- **YAGNI** ("You Aren't Gonna Need It"): don't build flexibility for needs you don't have yet.

[Chapter 45](../45-clean-code/notes.md) goes deeper into both. The healthy habit is to write the plain version first, and reach for a pattern when you *notice* the problem it solves:

| When you notice... | Consider... |
|---|---|
| A long `if`/`else` chain picking between ways to do the same job | Strategy |
| Several parts of the app need to react when something happens | Observer |
| You keep writing the same "before and after" code around different functions | Decorator |
| Outside data or code has a shape that doesn't fit yours | Adapter |
| Creating an object takes lots of setup, or you must pick which kind to make | Factory |
| Data that should be private is sitting out in the open | Module |
| There must be exactly one of something | Singleton (carefully) |

## Common mistakes

**1. Using a pattern where a plain function would do**

```js
const calculatorFactory = {
  create() {
    return { strategies: { add: (a, b) => a + b } };
  },
};

const calculator = calculatorFactory.create();
console.log(calculator.strategies.add(2, 3)); // prints: 5
```

A factory and a strategy object... to add two numbers. It works, but it wraps one line of real work in three layers of extra code. Fix: `function add(a, b) { return a + b; }`. Wait until the problem a pattern solves really shows up, like a second and third way of doing the job.

**2. Forgetting to unsubscribe**

```js
const game = new Emitter();

function startGame() {
  game.on("score", (points) => console.log(`Score: ${points}`));
}

startGame();
startGame(); // the player pressed "Play again"
game.emit("score", 10);
```

You'll see:

```
Score: 10
Score: 10
```

Every restart added *another* listener, and the old ones never left. The score now prints twice, and listeners that are never removed also keep memory busy (a leak, [chapter 41](../41-memory-and-garbage-collection/notes.md)). Fix: subscribe once, outside `startGame`, or give the listener a name and call `off` when the game ends.

**3. A decorator that forgets to return**

```js
function withLogging(fn) {
  return function (...args) {
    console.log(`Calling ${fn.name}`);
    fn(...args); // the result is thrown away!
  };
}

function double(n) {
  return n * 2;
}

const loggedDouble = withLogging(double);
console.log(loggedDouble(21));
```

You'll see:

```
Calling double
undefined
```

The wrapper calls `double` but drops its answer, so the wrapped version always returns `undefined`. Fix: `return fn(...args);`. A decorator should add behavior, never take any away.

**4. Treating a singleton as a scratchpad**

```js
const settings = { currency: "USD" }; // one shared object for the whole app

function showPriceInEuros(price) {
  settings.currency = "EUR"; // changed for one screen...
  console.log(`${price} ${settings.currency}`);
}

function showCartTotal(total) {
  console.log(`Total: ${total} ${settings.currency}`);
}

showPriceInEuros(20); // prints: 20 EUR
showCartTotal(99); // prints: Total: 99 EUR   <- surprise!
```

One screen changed the shared settings for its own needs, and now the cart shows the wrong currency. Bugs like this are hard to track down, because the line that caused it is far from the line that shows it. Fix: pass what a function needs as a parameter, like `showPrice(price, currency)`, and change shared settings only in one clearly named place.

**5. Picking a strategy without a guard**

```js
const discounts = {
  student: (price) => price * 0.8,
  senior: (price) => price * 0.7,
};

const customerType = "Student"; // typed into a form, with a capital S
const discount = discounts[customerType];
console.log(discount(50));
// TypeError: discount is not a function
```

There's no `Student` key, so `discount` is `undefined`, and calling `undefined` crashes with a message that doesn't say what really went wrong. Fix: clean up the input (`customerType.toLowerCase()`) and check that the strategy exists before you call it. Throw a clear error, like the `shippingCost` example does, or fall back to a default such as `none: (price) => price`.

## Quick recap

- A design pattern is a named, proven solution to a common problem: an idea you adapt, not code you paste.
- **Module** hides the details behind a small public interface. **Factory** builds objects so callers don't need to know how.
- **Singleton** means exactly one shared instance. In JavaScript, export an object from a module, and use it sparingly, because it's shared state.
- **Observer** lets many listeners react to one event (`on`, `off`, `emit`) without the sender knowing who they are.
- **Strategy** swaps one way of doing a job for another, using an object of functions instead of a long `if` chain.
- **Decorator** wraps a function to add behavior (`once`, `debounce`, and `memoize` are all decorators). **Adapter** converts a mismatched shape into the one your code expects.
- Write the simple version first. Reach for a pattern when you notice the problem it solves (KISS, YAGNI).

---

**Next:** try the [exercises](exercises.md), then move on to [45 Clean Code](../45-clean-code/notes.md).
