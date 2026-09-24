# 42 Proxy and Reflect

## What is it?

A **Proxy** is an object that stands in front of another object and can step in whenever someone uses it: reading a property, changing one, checking whether one exists, or deleting one.

**Reflect** is a built-in object full of functions that do "the normal thing" for each of those actions. You'll use it inside a Proxy, after your own checks.

Together, they're JavaScript's main tools for **metaprogramming**: code that controls how other code behaves.

## Why does it matter?

A normal object just does what it's told. Write `member.age = -5`, and it stores `-5`. No questions, no warnings, no record that anything changed.

Sometimes you want an object that reacts:

- **Refuse bad values** the moment someone tries to set them (an age can't be negative).
- **Give a default** instead of `undefined` when a key is missing.
- **Log every change**, so you can find out who keeps changing the price.
- **Lock an object**, so nobody can change or delete anything.
- **Update the screen automatically** whenever the data changes. That's how Vue 3, a popular front-end framework, works under the hood.

A Proxy does all of this *without changing the code that uses the object*. That code reads and writes properties exactly as before.

## Real-world example

Think of the receptionist at the front desk of an office.

| At the office | With a Proxy |
|---|---|
| The office, with the people visitors want to see | The **target**: the original object |
| The receptionist that every visitor talks to first | The **proxy**: your code uses it instead of the target |
| The receptionist's instructions: "check ID", "log every delivery" | The **handler**: an object holding your rules |
| One kind of request: a visit, a delivery, a question | A **trap**: `get`, `set`, `has`, `deleteProperty` |
| "Everything's fine, go on through" | `Reflect`: do the normal thing |

Visitors don't need to know the receptionist is there. They ask for what they want, as usual. The receptionist can check it, change it, write it down, or say no, before passing the request on.

## How it works

### Your first proxy

You make a proxy with `new Proxy(target, handler)`:

- the **target** is the original object,
- the **handler** is an object whose methods are **traps**: functions that catch one kind of action.

Here's a proxy that notices every property read:

```js
const book = { title: "Dune", pages: 412 };

const loggedBook = new Proxy(book, {
  get(target, property) {
    console.log(`Someone read "${property}"`);
    return target[property];
  },
});

console.log(loggedBook.title);
```

You'll see:

```
Someone read "title"
Dune
```

When you read `loggedBook.title`, JavaScript doesn't go straight to `book`. It calls your `get` trap with the target and the property name (`"title"`). Whatever the trap returns is the value you get back.

A proxy **wraps** the target. It doesn't copy it. With an empty handler, a proxy passes everything straight through, and changes land on the original object. Add this to the same file:

```js
const plainProxy = new Proxy(book, {});
plainProxy.pages = 500;

console.log(book.pages);          // prints: 500
console.log(plainProxy === book); // prints: false
```

The proxy and the target are two different objects that share the same data. Your traps only run when code goes *through the proxy*.

### The four traps you'll use most

There are 13 traps in total, but these four cover most real uses:

| Trap | Runs when someone... | Example |
|---|---|---|
| `get(target, property, receiver)` | reads a property | `proxy.name` |
| `set(target, property, value, receiver)` | sets a property | `proxy.name = "Sam"` |
| `has(target, property)` | checks with `in` | `"name" in proxy` |
| `deleteProperty(target, property)` | deletes a property | `delete proxy.name` |

You only write the traps you need. Anything without a trap goes straight through to the target, as normal.

Two details to know:

- `property` is always a string (or, now and then, a symbol from [chapter 36](../36-iterators-and-generators/notes.md)). Even `list[0]` gives the trap the string `"0"`.
- `set` and `deleteProperty` must return `true` to say "done". Returning `false` means "refused". In strict mode, which includes modules and classes ([chapter 26](../26-this-keyword/notes.md)), a refusal throws a `TypeError`. In a plain `.js` file, it fails silently.

And what's `receiver`? It's the object the property was read or set through: usually the proxy itself. You don't have to do anything with it except pass it on to Reflect, which is next.

### Reflect: "do the normal thing"

Most traps do a little extra work and then want the normal behavior to happen. `Reflect` has a function for every trap, taking the same arguments in the same order:

| Inside this trap... | ...this does the normal thing |
|---|---|
| `get(target, property, receiver)` | `Reflect.get(target, property, receiver)` |
| `set(target, property, value, receiver)` | `Reflect.set(target, property, value, receiver)` |
| `has(target, property)` | `Reflect.has(target, property)` |
| `deleteProperty(target, property)` | `Reflect.deleteProperty(target, property)` |

Why not just write `target[property]`? Two reasons:

1. `Reflect.set` and `Reflect.deleteProperty` return `true` or `false`, which is exactly what those traps must return. Returning their result means you can't forget.
2. They pass `receiver` along, so getters behave properly. You met getters in classes in [chapter 27](../27-classes/notes.md), and they work the same way in plain objects. Look at this user with a `fullName` getter:

```js
const user = {
  firstName: "Ada",
  lastName: "Lovelace",
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  },
};

const withTarget = new Proxy(user, {
  get(target, property) {
    console.log(`read ${property}`);
    return target[property];
  },
});

const withReflect = new Proxy(user, {
  get(target, property, receiver) {
    console.log(`read ${property}`);
    return Reflect.get(target, property, receiver);
  },
});

console.log(withTarget.fullName);
console.log("---");
console.log(withReflect.fullName);
```

You'll see:

```
read fullName
Ada Lovelace
---
read fullName
read firstName
read lastName
Ada Lovelace
```

With `target[property]`, `this` inside the getter is the plain target, so its reads of `firstName` and `lastName` sneak past your trap. With `Reflect.get(..., receiver)`, `this` is the proxy, so your trap sees everything.

So here's the habit to build: **in every trap, do your extra work, then hand over to the matching `Reflect` function with the same arguments.**

### Use case: checking values (validation)

A gym's app keeps member records. An age must be a positive number, however the code tries to set it:

```js
function createMember(member) {
  return new Proxy(member, {
    set(target, property, value, receiver) {
      if (property === "age" && (typeof value !== "number" || value <= 0)) {
        throw new TypeError(`Age must be a positive number, got ${value}`);
      }
      return Reflect.set(target, property, value, receiver);
    },
  });
}

const member = createMember({ name: "Priya", age: 31 });
member.age = 32;
console.log(member.age); // prints: 32

try {
  member.age = -4;
} catch (error) {
  console.log(error.message); // prints: Age must be a positive number, got -4
}
```

The check lives in one place, and every part of the app that changes `member.age` gets it for free. Throwing a clear error ([chapter 18](../18-error-handling/notes.md)) beats returning `false`: the caller finds out *what* was wrong.

Notice that `createMember` takes the object and hands back only the proxy. That keeps the target out of reach, so nobody can go around the checks. (You'll see why that matters in Common mistakes.) The starting values aren't checked, though: the trap only runs for changes made after the proxy exists.

### Use case: default values

Here's a word counter for restaurant reviews. Normally you'd have to check whether each word is already in the object before adding 1. With a `get` trap, a missing word reads as `0`:

```js
const wordCounts = new Proxy({}, {
  get(target, property, receiver) {
    return Reflect.get(target, property, receiver) ?? 0; // missing words count as 0
  },
});

const review = "the food was great and the staff were great";
for (const word of review.split(" ")) {
  wordCounts[word] += 1; // no need to check whether the word exists yet
}

console.log(wordCounts.great); // prints: 2
console.log(wordCounts.pizza); // prints: 0
```

`wordCounts[word] += 1` reads the old count (through your trap, so `0` for a new word), adds 1, and sets the new count. The `??` operator ([chapter 07](../07-conditionals/notes.md)) gives the default only when the real value is `undefined` or `null`.

### Use case: logging changes

When a value keeps changing and you can't work out why, let a proxy tell you:

```js
function watchChanges(object, label) {
  return new Proxy(object, {
    set(target, property, value, receiver) {
      console.log(`${label}.${property}: ${target[property]} -> ${value}`);
      return Reflect.set(target, property, value, receiver);
    },
    deleteProperty(target, property) {
      console.log(`${label}.${property} was deleted`);
      return Reflect.deleteProperty(target, property);
    },
  });
}

const cart = watchChanges({ items: 0, total: 0 }, "cart");
cart.items = 2;
cart.total = 19.98;
cart.coupon = "SAVE10";
delete cart.coupon;
```

You'll see:

```
cart.items: 0 -> 2
cart.total: 0 -> 19.98
cart.coupon: undefined -> SAVE10
cart.coupon was deleted
```

Reading `target[property]` inside the trap is fine here: it reads the old value straight from the target, without going through the proxy.

### Use case: read-only objects

Some objects should never change once they're set up, like an app's settings. A proxy can refuse every change, with a clear message:

```js
function readOnly(object) {
  return new Proxy(object, {
    set(target, property) {
      throw new TypeError(`Can't change "${property}": this object is read-only`);
    },
    deleteProperty(target, property) {
      throw new TypeError(`Can't delete "${property}": this object is read-only`);
    },
  });
}

const config = readOnly({ apiUrl: "https://api.example.com", retries: 3 });
console.log(config.retries); // prints: 3

try {
  config.retries = 10;
} catch (error) {
  console.log(error.message); // prints: Can't change "retries": this object is read-only
}
```

`Object.freeze` ([chapter 43](../43-functional-programming/notes.md)) is a simpler way to lock an object. But in a plain `.js` file, a frozen object ignores changes silently, while this proxy explains exactly what went wrong.

### Use case: a custom `in` check

The `has` trap decides what `in` answers. Here, a bakery's opening hours become something you can ask with `in`:

```js
const openingHours = new Proxy({}, {
  has(target, hour) {
    return Number(hour) >= 9 && Number(hour) < 17;
  },
});

console.log(10 in openingHours); // prints: true
console.log(20 in openingHours); // prints: false
```

The object is empty. The trap works out the answer instead of looking anything up. `in` turns `10` into the string `"10"` before calling the trap, which is why it uses `Number(hour)`.

### Use case: negative array indexes

In JavaScript, `list[-1]` is just `undefined`. That's why [chapter 10](../10-arrays/notes.md) showed you `.at(-1)` for the last item. A proxy can make negative indexes work with square brackets too:

```js
function withNegativeIndexes(array) {
  return new Proxy(array, {
    get(target, property, receiver) {
      if (typeof property === "string" && Number(property) < 0) {
        property = String(target.length + Number(property)); // "-1" becomes "2"
      }
      return Reflect.get(target, property, receiver);
    },
  });
}

const queue = withNegativeIndexes(["Ana", "Ben", "Cai"]);
console.log(queue[-1]);    // prints: Cai
console.log(queue[-3]);    // prints: Ana
console.log(queue[0]);     // prints: Ana
console.log(queue.length); // prints: 3
console.log([...queue]);   // prints: [ 'Ana', 'Ben', 'Cai' ]
```

The `typeof property === "string"` check matters. When you spread or loop over the array, JavaScript reads `Symbol.iterator` through your trap too, and turning a symbol into a number throws `TypeError: Cannot convert a Symbol value to a number`. The check lets symbols pass straight through.

In real code, `.at(-1)` already does this job. The point of the example is what it shows: a proxy can change what square brackets *mean*.

### Use case: a tiny reactivity demo

**Reactivity** means "when the data changes, the screen updates by itself". You don't have to remember to redraw after every change: you change the data, and the view follows.

Here's the idea in a few lines, with a game's scoreboard:

```js
function reactive(data, onChange) {
  return new Proxy(data, {
    set(target, property, value, receiver) {
      const ok = Reflect.set(target, property, value, receiver);
      onChange(target); // tell whoever is listening that the data changed
      return ok;
    },
  });
}

function render(game) {
  console.log(`[Screen] ${game.player}: ${game.score} points, ${game.lives} lives`);
}

const game = reactive({ player: "Leo", score: 0, lives: 3 }, render);

render(game);    // draw the first screen
game.score = 10; // the screen updates by itself
game.lives = 2;
```

You'll see:

```
[Screen] Leo: 0 points, 3 lives
[Screen] Leo: 10 points, 3 lives
[Screen] Leo: 10 points, 2 lives
```

The code that changes `score` and `lives` knows nothing about the screen. It sets properties, and the proxy takes care of the rest. In a real page, `render` would update the DOM ([chapter 20](../20-dom-basics/notes.md)) instead of logging.

This is the core idea behind the reactivity in Vue 3, which is built on Proxy. The real thing is much smarter: it keeps track of which parts of the page use which properties, so a change only updates the parts that need it.

### The older, simpler tools: getters, setters, and `Object.defineProperty`

Long before Proxy, JavaScript already had ways to run code when a property is read or set. They're simpler, and often all you need.

**Getters and setters** ([chapter 27](../27-classes/notes.md)) run your code for one property you name:

```js
class Thermostat {
  #celsius = 20;

  get celsius() {
    return this.#celsius;
  }

  set celsius(value) {
    if (value < 5 || value > 30) {
      throw new RangeError(`Keep it between 5 and 30°C, got ${value}`);
    }
    this.#celsius = value;
  }
}

const home = new Thermostat();
home.celsius = 22;
console.log(home.celsius); // prints: 22
home.celsius = 45;
// RangeError: Keep it between 5 and 30°C, got 45
```

**`Object.defineProperty`** sets up one property with special settings, such as making it read-only:

```js
const product = { name: "Desk lamp" };

Object.defineProperty(product, "id", {
  value: 1042,
  writable: false,  // can't be changed
  enumerable: true, // shows up in loops and console.log
});

product.id = 7;          // quietly ignored in a plain .js file
console.log(product.id); // prints: 1042
console.log(product);    // prints: { name: 'Desk lamp', id: 1042 }
```

In strict mode, that change throws instead: `TypeError: Cannot assign to read only property 'id' of object '#<Object>'`.

| | Getters, setters, `defineProperty` | Proxy |
|---|---|---|
| Works on | Properties you name in advance | Every property, even ones that don't exist yet |
| Can react to | Reading and setting | Reading, setting, `in`, `delete`, and more |
| Speed | Fast | A little slower |
| Easy to follow? | Yes | Takes more explaining |

A good rule: if you know the property names in advance, use a getter and setter (or a class method) first. Use a Proxy when you need to handle *any* property, including ones you can't list ahead of time, like the words in the word counter.

### Cautions

Proxies are powerful, and that's exactly why you should use them sparingly:

- **Extra complexity.** Code that looks like a plain property read might be running your trap. Someone reading `member.age = 32` can't tell there's a check behind it. It's even hidden from `console.log`: in Node, logging a proxy prints the target's properties and doesn't mention the proxy at all. Clear names like `createMember` and `readOnly` help.
- **Some speed cost.** Every action on the proxy goes through your trap. That's fine for settings or form data, but keep proxies out of code that runs millions of times in a loop.
- **Some built-in objects don't work through a proxy.** A Map, a Set, a Date, or a class with private `#fields` keeps its data in hidden slots that only the real object can reach. For example, calling `get` on a proxied Map throws `TypeError: Method Map.prototype.get called on incompatible receiver #<Map>`. Stick to plain objects and arrays.

The golden rule: **reach for a Proxy only when simpler tools, like a function or a class with getters and setters, can't do the job.**

## Common mistakes

**1. Forgetting to return `true` from `set`**

```js
"use strict";

const settings = new Proxy({}, {
  set(target, property, value) {
    console.log(`Saving ${property}`);
    target[property] = value;
    // forgot: return true;
  },
});

settings.theme = "dark";
// prints: Saving theme
// TypeError: 'set' on proxy: trap returned falsish for property 'theme'
```

A function without `return` returns `undefined`, which counts as "refused". In strict mode, like here or in any module or class, that throws. In a plain `.js` file it's sneakier: no error at all, so the bug only shows up once the code moves into a module. Fix: end the trap with `return Reflect.set(target, property, value, receiver);` and the right answer is returned for you.

**2. Changing the target directly, around the proxy**

```js
const scores = { alice: 10 };

const safeScores = new Proxy(scores, {
  set(target, property, value, receiver) {
    if (value < 0) {
      throw new RangeError("Scores can't be negative");
    }
    return Reflect.set(target, property, value, receiver);
  },
});

scores.alice = -999; // straight to the target: no check at all!
console.log(safeScores.alice); // prints: -999
```

The receptionist can only check visitors who come in through the front door. Anyone who uses `scores` directly walks in the back. Fix: don't keep a separate variable for the target. Create the proxy inside a function, like `createMember`, or pass the object straight in: `new Proxy({ alice: 10 }, handler)`.

**3. Reading through the proxy inside its own `get` trap**

```js
const user = new Proxy({ name: "Sam" }, {
  get(target, property, receiver) {
    return receiver[property]; // oops: reads through the proxy again
  },
});

console.log(user.name);
// RangeError: Maximum call stack size exceeded
```

`receiver` is the proxy itself, so `receiver[property]` calls the `get` trap again, which calls it again, and so on until the call stack runs out ([chapter 17](../17-recursion/notes.md)). Fix: read from the target with `Reflect.get(target, property, receiver)`. Pass `receiver` *to* Reflect, but never read properties *from* it inside a trap.

**4. Comparing property names with numbers**

```js
const seats = new Proxy(["A1", "A2", "A3"], {
  get(target, property, receiver) {
    if (property === 0) {
      return `Front row: ${target[0]}`;
    }
    return Reflect.get(target, property, receiver);
  },
});

console.log(seats[0]); // prints: A1
```

The trap never kicked in. Property names reach the trap as strings, even for arrays, and `"0" === 0` is `false` ([chapter 38](../38-type-coercion/notes.md)). Fix: compare with the string `"0"`, and the line prints `Front row: A1`. Or convert with `Number(property)`, after checking that it's a string, as in the negative index example.

## Quick recap

- A **Proxy** wraps a **target** object. Its **handler**'s **traps** step in when the object is used: `get` (reading), `set` (writing), `has` (`in`), and `deleteProperty` (`delete`).
- Anything without a trap passes straight through. The proxy shares the target's data: it doesn't copy it.
- In a trap, do your extra work, then call the matching **Reflect** function with the same arguments. `set` and `deleteProperty` must return `true` for success, and `Reflect` does that for you.
- Common uses: validation, default values, logging changes, read-only objects, and reactivity (the idea behind Vue 3).
- Getters, setters, and `Object.defineProperty` are simpler and faster when you know the property names in advance.
- Proxies add complexity and a small speed cost, and don't work with every built-in object. Use one only when simpler tools can't do the job.

---

**Next:** try the [exercises](exercises.md), then move on to [43 Functional Programming](../43-functional-programming/notes.md).
