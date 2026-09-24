# 42 Proxy and Reflect: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.js`, `ex2.js`, and so on).
- Run each one with `node ex1.js`.
- In every trap, finish by handing over to the matching `Reflect` function, unless the exercise says otherwise.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Recipe card spy

A cooking app has a recipe card, and you want to see exactly how the app uses it. Start `ex1.js` with this:

```js
const recipe = { name: "Pancakes", servings: 4, minutes: 20 };
```

Make a proxy called `trackedRecipe` with two traps:

- `get` prints `Reading "servings"` (with the real property name) before returning the value.
- `set` prints `Changing "servings" from 4 to 8` (with the real name and values) before saving the new value.

Test it with these lines:

```js
console.log(trackedRecipe.name);
trackedRecipe.servings = 8;
console.log(`Serves ${trackedRecipe.servings}`);
```

Expected output:

```
Reading "name"
Pancakes
Changing "servings" from 4 to 8
Reading "servings"
Serves 8
```

<details>
<summary>Hint 1</summary>

The traps' parameters are `get(target, property, receiver)` and `set(target, property, value, receiver)`. Both go in one handler object.

</details>

<details>
<summary>Hint 2</summary>

In the `set` trap, you need the *old* value for the message. If you read it through the proxy, your `get` trap will print an extra "Reading" line. Where can you read it from without going through the proxy?

</details>

---

## Exercise 2 (Easy): Hotel welcome screen

A hotel's check-in kiosk greets each guest in their own language. It only has a few languages, so anyone else should get the English message. Start `ex2.js` with this:

```js
const welcome = {
  en: "Welcome!",
  fr: "Bienvenue!",
  de: "Willkommen!",
  it: "Benvenuto!",
};

const guests = [
  { name: "Chloe", language: "fr" },
  { name: "Hiro", language: "ja" },
  { name: "Lena", language: "de" },
  { name: "Marco", language: "it" },
];
```

1. Make a proxy called `welcomeMessages` that returns the English message for any language that's missing.
2. Loop over `guests` and print a greeting for each one.
3. Finally, print whether `"ja"` is `in` the proxy.

Expected output:

```
Bienvenue! Enjoy your stay, Chloe.
Welcome! Enjoy your stay, Hiro.
Willkommen! Enjoy your stay, Lena.
Benvenuto! Enjoy your stay, Marco.
Has a Japanese message: false
```

**Rule:** the loop must not check whether a language exists. It just reads `welcomeMessages[guest.language]`, and the proxy takes care of the rest.

Then add a comment explaining why the last line says `false`, even though reading `welcomeMessages.ja` gives you a message.

<details>
<summary>Hint 1</summary>

This is the "default values" use case from the notes. Get the normal value with `Reflect.get(...)`, and use `??` to fall back on something else.

</details>

<details>
<summary>Hint 2</summary>

The fallback is the English message, which lives on the target. For the last question: which trap does `in` use, and did you write one?

</details>

---

## Exercise 3 (Medium): Guarding the shop's products

In an online shop, several parts of the app can change a product: the admin page, the stock checker, the sale planner. You want one guard that catches bad values, whichever part of the app sends them.

Write a function `createProduct(product)` that returns a proxy with a `set` trap. It checks these three properties, and lets every other property through as normal:

| Property | Must be | Otherwise, throw a `TypeError` with this message |
|---|---|---|
| `price` | a number above 0 | `price must be a number above 0, got -5` (with the real value) |
| `stock` | a whole number, 0 or more | `stock must be a whole number, 0 or more, got 2.5` (with the real value) |
| `name` | a string that isn't empty, even after trimming | `name can't be empty` |

Test it with this code:

```js
const lamp = createProduct({ name: "Desk lamp", price: 24.99, stock: 10 });

lamp.price = 19.99;
lamp.stock = 8;
lamp.color = "black"; // other properties work as normal

const badChanges = [
  ["price", -5],
  ["price", "cheap"],
  ["stock", 2.5],
  ["name", "   "],
];

for (const [property, value] of badChanges) {
  try {
    lamp[property] = value;
  } catch (error) {
    console.log(`${error.name}: ${error.message}`);
  }
}

console.log(lamp);
```

Expected output:

```
TypeError: price must be a number above 0, got -5
TypeError: price must be a number above 0, got cheap
TypeError: stock must be a whole number, 0 or more, got 2.5
TypeError: name can't be empty
{ name: 'Desk lamp', price: 19.99, stock: 8, color: 'black' }
```

The last line shows that none of the bad values got through. (Logging a proxy in Node prints the target's properties.)

<details>
<summary>Hint 1</summary>

Look back at `createMember` in the notes. Use one guard clause ([chapter 18](../18-error-handling/notes.md)) per property: `if (property === "price" && ...)`, throw. Only the good values reach the `Reflect.set` at the bottom.

</details>

<details>
<summary>Hint 2</summary>

`typeof` catches `"cheap"`. For whole numbers, `Number.isInteger` ([chapter 05](../05-numbers-and-math/notes.md)) is your friend. For the name, `trim()` ([chapter 06](../06-strings/notes.md)) turns `"   "` into `""`.

</details>

---

## Exercise 4 (Medium): Undo button

A drawing app lets you change the brush settings, and it needs an **Undo** button. Every change should be remembered, so that undo can put things back, one step at a time.

Write a function `createUndoable(object)` that returns an array with two things: a proxy for the object, and an `undo` function.

- Every time a property is set through the proxy, remember the property and its *old* value.
- `undo()` puts back the most recent change. If there's nothing left to undo, it prints `Nothing to undo`.

Test it with this code:

```js
const [brush, undo] = createUndoable({ color: "black", size: 2 });

brush.color = "red";
brush.size = 5;
console.log(brush.color, brush.size);

undo();
console.log(brush.color, brush.size);

undo();
console.log(brush.color, brush.size);

undo();
```

Expected output:

```
red 5
red 2
black 2
Nothing to undo
```

**Rule:** undoing must not count as a new change. After two changes, exactly two undos should work.

<details>
<summary>Hint 1</summary>

Keep a `history` array inside `createUndoable`. Both the `set` trap and `undo` can see it, thanks to closures ([chapter 25](../25-closures/notes.md)). The most recent change is at the end, and `pop()` takes it off.

</details>

<details>
<summary>Hint 2</summary>

Push a small object into the history for each change, like `{ property, oldValue }`. Read the old value in the trap *before* you call `Reflect.set`.

</details>

<details>
<summary>Hint 3</summary>

If `undo` puts the old value back *through the proxy*, the `set` trap records it as a brand-new change. Then the next undo just flips that same change back again, and you never reach the older ones. Which object can `undo` write to without going through the trap? (Common mistake 2 in the notes was about doing this by accident. Here, you do it on purpose.)

</details>

---

## Exercise 5 (Challenge): Smart home dashboard

A smart home app shows the room's temperature and humidity. Different parts of the app want to know when the readings change: the display on the wall, the fan, maybe more later. You'll build a small **store**: a proxy that holds the data and tells everyone who has signed up whenever something changes.

Write a function `createStore(initialState)` that returns an object with two properties:

- `state`: a proxy for the data. When a property is set to a **different** value, it saves it, then calls every listener with `(property, oldValue, newValue)`. Setting the same value again tells nobody.
- `subscribe(listener)`: signs a listener function up for changes. It returns an `unsubscribe` function that signs that listener off again.

Test it with this code:

```js
const { state, subscribe } = createStore({ temperature: 21, humidity: 40 });

const stopDisplay = subscribe((property, oldValue, newValue) => {
  console.log(`[Display] ${property}: ${oldValue} -> ${newValue}`);
});

subscribe((property, oldValue, newValue) => {
  if (property === "temperature" && newValue > 25) {
    console.log("[Fan] Too warm, turning on");
  }
});

state.temperature = 23;
state.temperature = 23; // the same value: nobody is told
state.temperature = 27;
stopDisplay();          // the display switches off and unsubscribes
state.humidity = 55;
state.temperature = 28;
console.log(state);
```

Expected output:

```
[Display] temperature: 21 -> 23
[Display] temperature: 23 -> 27
[Fan] Too warm, turning on
[Fan] Too warm, turning on
{ temperature: 28, humidity: 55 }
```

**Rule:** listeners are called in the order they subscribed. And once a listener unsubscribes, the store must not keep it anywhere. (Remember [chapter 41](../41-memory-and-garbage-collection/notes.md): a list of callbacks that only grows is a leak.)

<details>
<summary>Hint 1</summary>

Keep an array of listener functions inside `createStore`. The `set` trap and `subscribe` can both reach it through a closure ([chapter 25](../25-closures/notes.md)). Calling each listener is a loop over that array.

</details>

<details>
<summary>Hint 2</summary>

In the trap: read the old value, and compare it with the new one. If they're the same, return `true` straight away (that's "done", with nothing to do). Otherwise, save with `Reflect.set`, call the listeners, and return what `Reflect.set` gave you.

</details>

<details>
<summary>Hint 3</summary>

`unsubscribe` is a closure too: it remembers which `listener` it belongs to. `filter` ([chapter 13](../13-array-methods/notes.md)) can build a new array without that one function, because `!==` compares functions by reference ([chapter 16](../16-values-vs-references/notes.md)). Use `let` for the array if you replace it.

</details>

---

## Before you move on

In this chapter, objects changed all the time, and proxies helped you watch, check, and react to every change.

[Chapter 43](../43-functional-programming/notes.md) looks at the opposite idea: code where functions don't change anything at all, and every change makes a *new* value instead. It sounds strange, but it makes programs much easier to test and to trust. 🙂
