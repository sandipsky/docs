# 38 Type Coercion

## What is it?

**Type coercion** is JavaScript changing a value from one type to another *by itself*, because an operation needs a different type. You don't ask for it. It just happens.

```js
console.log("5" * 2); // prints: 10
```

`*` only works with numbers, so JavaScript quietly turned `"5"` into `5` first.

When *you* convert a value on purpose, with `Number()`, `String()` or `Boolean()`, that's called **explicit conversion**. Coercion is the automatic kind, so it's also called **implicit conversion**.

## Why does it matter?

At the end of [chapter 37](../37-regular-expressions/exercises.md), this line surprised you:

```js
console.log("2" + "5" + "3"); // prints: 253
```

You wanted `10`, and JavaScript gave you `253`. No error, no warning, just a wrong answer. That's what makes coercion bugs sneaky: the program keeps running, and the wrong value travels on until something far away looks odd, like a cart that says you ordered 55 notebooks.

Knowing the rules helps you:

- spot these bugs quickly when they happen,
- read older code that relies on coercion, including code that uses `==`,
- write code that never depends on coercion at all.

This chapter also keeps two old promises. [Chapter 04](../04-operators/notes.md) said you'd find out why `true` turns into `1`, and [chapter 35](../35-map-and-set/notes.md) said you'd find out where that odd `"[object Object]"` comes from.

## Real-world example

Type coercion is like **autocorrect** on your phone:

| Autocorrect | Type coercion |
|---|---|
| Changes your words without asking | Changes types without asking |
| Usually guesses what you meant | Usually does what you meant |
| Sometimes turns your friend "Anya" into "Anyway" | Sometimes turns `"5" + 5` into `"55"`, when you wanted 10 |
| You stay in charge by reading before you hit Send | You stay in charge by converting values yourself and comparing with `===` |

Autocorrect is handy, until the day it sends the wrong message. The fix isn't to memorize every way it can go wrong. It's to check what you're sending.

## How it works

### Explicit vs. implicit, side by side

```js
const typed = "5"; // text, like a value from a form

// Explicit: you decide, and anyone reading the code can see it
console.log(Number(typed) + 1); // prints: 6

// Implicit: JavaScript decides, following its own rules
console.log(typed + 1); // prints: 51
console.log(typed - 1); // prints: 4
```

Same value, three different results. The explicit line says exactly what happens. The implicit lines depend on rules you have to remember, and those rules aren't even the same for `+` and `-`.

Every conversion ends up as one of three types: a string, a number, or a boolean. Let's take them one at a time.

### Converting to a string

**Explicit:** `String(value)`. **Implicit:** `+` with a string on one side, and template literals.

Primitives turn into text the way you'd expect. They're just written out:

```js
console.log(String(42));         // prints: 42
console.log(typeof String(42));  // prints: string
console.log(String(true));       // prints: true
console.log(String(null));       // prints: null
console.log(`Seats left: ${3}`); // prints: Seats left: 3
```

Arrays and objects are more interesting:

```js
console.log(String([1, 2, 3]));     // prints: 1,2,3
console.log(String({ size: "M" })); // prints: [object Object]

const user = { name: "Maya" };
console.log(`Hello, ${user}!`); // prints: Hello, [object Object]!
```

- An **array** becomes its items joined with commas, just like `join(",")` from chapter 10. An empty array becomes an empty string.
- A plain **object** becomes the text `"[object Object]"`, no matter what's inside it.

**So where does `"[object Object]"` come from?** When JavaScript needs an object as a string, it calls the object's `toString()` method. Every object has one, shared through `Object.prototype` ([chapter 28](../28-prototypes/notes.md)). For a plain object, the built-in `toString()` isn't very helpful. It only says "this is an object, of the kind Object". Arrays have a smarter `toString()` that joins their items:

```js
console.log({ size: "M" }.toString()); // prints: [object Object]
console.log([1, 2, 3].toString());     // prints: 1,2,3
```

That's exactly what happened in chapter 35, when two customer objects were used as keys in a plain object. Object keys must be strings, so both customers turned into the same key, `"[object Object]"`, and one overwrote the other.

To show what's inside an object, print it on its own (`console.log("User:", user)`), pick the property you need (`${user.name}`), or use `JSON.stringify(user)` from chapter 23.

### Converting to a number

**Explicit:** `Number(value)`. **Implicit:** math operators like `-`, `*`, `/` and `%`, and comparisons like `<` and `>`.

You met `Number()` in chapters 03 and 05. Here's the full picture, including values you haven't tried yet:

| Value | `Number(value)` | Why |
|---|---|---|
| `"42"` | `42` | the text is a number |
| `" 42 "` | `42` | spaces around the number are ignored |
| `""` | `0` | empty text counts as zero (a real trap with forms) |
| `"42px"` | `NaN` | the *whole* text must be a number |
| `true` | `1` | true counts as 1... |
| `false` | `0` | ...and false as 0 |
| `null` | `0` | "empty, on purpose" counts as zero |
| `undefined` | `NaN` | "no value yet" isn't a number |
| `[]` | `0` | the array becomes `""` first, and `""` becomes 0 |
| `[5]` | `5` | the array becomes `"5"` first, and `"5"` becomes 5 |
| `{}` | `NaN` | the object becomes `"[object Object]"` first, which isn't a number |

Look at the last three rows. An array or object is first turned into a string, using the rules from the previous section, and then that string is turned into a number.

Try the strangest ones yourself:

```js
console.log(Number(""));        // prints: 0
console.log(Number(null));      // prints: 0
console.log(Number(undefined)); // prints: NaN
console.log(Number([]));        // prints: 0
console.log(Number({}));        // prints: NaN
```

Two pairs are worth remembering: `null` becomes `0` but `undefined` becomes `NaN`, and empty text becomes `0`, not `NaN`.

> You'll also see a plus sign used in front of a value, like `+"42"`. That's a short way to write `Number("42")`, and it gives `42`. It's common in other people's code, but `Number()` is much easier to read.

### Converting to a boolean

**Explicit:** `Boolean(value)`, or the shortcut `!!value`. **Implicit:** anywhere JavaScript needs a yes-or-no answer, like `if`, `while`, the ternary `? :`, and `!`, `&&` and `||`. (`&&` and `||` check whether a value is truthy, but hand back one of the original values, as you saw in chapter 07.)

This is the truthy and falsy idea from [chapter 07](../07-conditionals/notes.md). Only eight values are falsy: `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined` and `NaN`. Everything else is truthy, including some values that *look* false:

```js
console.log(Boolean("0"));     // prints: true
console.log(Boolean("false")); // prints: true
console.log(Boolean(" "));     // prints: true
console.log(Boolean([]));      // prints: true
console.log(Boolean({}));      // prints: true
console.log(!!"hello");        // prints: true
console.log(!!0);              // prints: false
```

`"0"` and `"false"` are strings with characters in them, so they're truthy. That matters when a value comes from a form or a settings file: `if ("0")` runs its block.

`!!` is two `!` in a row. The first `!` converts the value to a boolean and flips it, and the second flips it back. It means the same as `Boolean(value)`, and you'll see it a lot in real code.

### `+` prefers strings

`+` has two jobs: adding numbers and joining strings. If **either** side is a string, `+` joins. Otherwise, it adds.

```js
console.log("5" + 2);     // prints: 52
console.log(5 + "2");     // prints: 52
console.log(1 + 2 + "3"); // prints: 33
console.log("1" + 2 + 3); // prints: 123
```

The last two lines look almost the same but give different answers. `+` works from left to right, one step at a time:

- `1 + 2 + "3"`: first, `1 + 2` is `3` (two numbers, so it adds). Then `3 + "3"` is `"33"`.
- `"1" + 2 + 3`: first, `"1" + 2` is `"12"` (a string, so it joins). Then `"12" + 3` is `"123"`.

Chapter 37's `"2" + "5" + "3"` works the same way. Every step has a string in it, so every step joins, and you get `"253"`.

### `-`, `*`, `/` and `%` always do math

These operators only know how to do math, so they turn both sides into numbers first:

```js
console.log("5" - 2);    // prints: 3
console.log("5" * "2");  // prints: 10
console.log("10" / "4"); // prints: 2.5
console.log("abc" - 1);  // prints: NaN
```

And when *neither* side of `+` is a string, `+` does math too, so booleans and `null` get turned into numbers:

```js
console.log(true + true);    // prints: 2
console.log(null + 1);       // prints: 1
console.log(undefined + 1);  // prints: NaN
```

`true + true` is `2` because each `true` becomes `1`. `null + 1` is `1` because `null` becomes `0`.

So `"5" - 2` gives the number `3`, while `"5" + 2` gives the string `"52"`. One operator always does math, and the other prefers joining. That difference is exactly what makes `+` risky whenever a value might secretly be a string.

### Comparing with `<` and `>`

`<`, `>`, `<=` and `>=` turn both sides into numbers, **unless both sides are strings**. Two strings are compared character by character, like words in a dictionary:

```js
console.log("10" < 9);   // prints: false
console.log("10" < "9"); // prints: true
```

In the first line, `"10"` becomes `10`, and `10 < 9` is false. In the second line, both sides are strings, so JavaScript compares the first characters. `"1"` comes before `"9"`, so `"10"` counts as the smaller one. It never looks at the numbers at all. (In this character order, capital letters come before lowercase ones, so `"Zebra" < "apple"` is `true` too.)

This bites when two numbers both arrive as text, like two prices typed into a form. Convert first, then compare.

### Why `true` becomes `1`

Here's the puzzle from chapter 04:

```js
const age = 70;
console.log(18 <= age <= 65); // prints: true
```

JavaScript works from left to right. First, `18 <= age` is `true`. Then it has to work out `true <= 65`. A comparison needs numbers, so `true` is converted the same way `Number(true)` converts it, and that's `1`. Finally, `1 <= 65` is `true`.

But why 1? It's a habit that's much older than JavaScript: in computing, 1 has long stood for "yes" or "on", and 0 for "no" or "off". You can even see it on the power switch of a kettle or a computer, where the "I" and "O" marks come from 1 (on) and 0 (off). So whenever JavaScript needs a number, `true` becomes `1` and `false` becomes `0`. (Chapter 04's fix still stands: `age >= 18 && age <= 65`.)

### `==` and `===`

`===` (**strict equality**) never converts anything. If the two types are different, the answer is `false`, full stop.

`==` (**loose equality**) converts values before it compares them. Chapter 04 promised you the rules it follows. Here they are, simplified:

1. **Same type on both sides?** Then `==` works just like `===`.
2. **`null` and `undefined`** are equal to each other, and to nothing else.
3. **A number and a string?** The string is turned into a number.
4. **A boolean on either side?** The boolean is turned into a number first: `true` becomes 1 and `false` becomes 0.
5. **An object and a primitive?** The object is turned into a primitive first, usually a string, like in "Converting to a string" above.
6. **`NaN`** is never equal to anything, not even to itself.

JavaScript keeps applying these rules until both sides have the same type. Some results:

```js
console.log("1" == 1);          // prints: true
console.log("" == 0);           // prints: true
console.log("0" == false);      // prints: true
console.log(null == undefined); // prints: true
console.log(null == 0);         // prints: false
console.log("true" == true);    // prints: false
console.log([] == false);       // prints: true
console.log(NaN == NaN);        // prints: false
```

Let's walk through the strangest ones:

- **`"0" == false`**: rule 4 turns `false` into `0`, so now it's `"0" == 0`. Rule 3 turns `"0"` into `0`, and `0 == 0` is `true`.
- **`"true" == true`**: rule 4 turns `true` into `1`, so now it's `"true" == 1`. Rule 3 turns `"true"` into a number, which is `NaN`. And `NaN == 1` is `false`. So the string `"true"` isn't even loosely equal to `true`!
- **`null == 0`**: rule 2 says `null` only equals `null` and `undefined`, so this is `false`, even though `Number(null)` is `0`.
- **`[] == false`**: rule 4 turns `false` into `0`. Rule 5 turns `[]` into `""`. Rule 3 turns `""` into `0`. So it's `true`. Yet an empty array is *truthy* (chapter 10)!

That last one is why nobody wants to reason about `==`. With `===`, there's nothing to remember, which is why this course uses `===` everywhere. You'll still meet `==` in older code, and now you can read it.

> **Tip:** one use of `==` that you may see on purpose is `value == null`. Because of rule 2, it's `true` for both `null` and `undefined`, and nothing else. It's fine to recognize, but `??` and `?.` (chapters 07 and 11) cover most of the same needs.

### `Object.is`: the strictest check

Even `===` has two odd cases, both about special numbers:

```js
console.log(NaN === NaN);         // prints: false
console.log(0 === -0);            // prints: true
console.log(Object.is(NaN, NaN)); // prints: true
console.log(Object.is(0, -0));    // prints: false
```

`Object.is(a, b)` works like `===`, with two differences: it treats `NaN` as equal to itself, and it can tell `0` and `-0` apart. (That's the negative zero from chapter 07's list of falsy values. You get it from things like `0 * -1`.)

You'll rarely need `Object.is`. To check for `NaN`, `Number.isNaN()` from chapter 05 is clearer, and `-0` almost never matters in everyday code. But now you know why it exists.

### Objects are still compared by reference

No conversion rule changes what you learned in [chapter 16](../16-values-vs-references/notes.md). For objects and arrays, `===` and `Object.is` ask "is this the *same* object?", not "do they look alike?":

```js
console.log([] === []);         // prints: false
console.log(Object.is({}, {})); // prints: false
console.log([1, 2] == "1,2");   // prints: true
```

The last line is `==` rule 5 at work. The array is turned into the string `"1,2"` first, so `==` ends up comparing two strings. With `===`, it's `false`, because an array is never the same thing as a string.

### A table of famous surprises

These show up in quizzes and in jokes about JavaScript. Every one of them follows the rules above:

| Code | Result | Why |
|---|---|---|
| `"5" + 2` | `"52"` | one side is a string, so `+` joins |
| `"5" - 2` | `3` | `-` only does math, so `"5"` becomes 5 |
| `true + true` | `2` | no strings, so `+` adds, and `true` is 1 |
| `[] + []` | `""` | both arrays become empty strings, then join |
| `[] + {}` | `"[object Object]"` | `""` joined with the object's `toString()` text |
| `[1, 2] + [3]` | `"1,23"` | `"1,2"` joined with `"3"` |
| `"b" + "a" + +"a" + "a"` | `"baNaNa"` | `+"a"` tries to turn `"a"` into a number and gets `NaN`, which is then joined in as text |
| `null + 1` | `1` | `null` becomes 0 |
| `undefined + 1` | `NaN` | `undefined` becomes `NaN` |

Check the trickiest ones yourself. `JSON.stringify` from chapter 23 puts quotes around a string, which makes the empty string easy to see:

```js
console.log(JSON.stringify([] + [])); // prints: ""
console.log([] + {});                 // prints: [object Object]
console.log([1, 2] + [3]);            // prints: 1,23
console.log("b" + "a" + +"a" + "a");  // prints: baNaNa
```

`[] + {}` is worth understanding fully, because it pulls everything together. `+` needs primitives, so each side is turned into one. `[]` becomes `""`, an empty array joined. `{}` becomes `"[object Object]"`, the text from its built-in `toString()`. Now one side is a string, so `+` joins: `"" + "[object Object]"` is `"[object Object]"`.

### The `"5" + 5` cart bug

Remember the shopping cart from [chapter 12](../12-project-shopping-cart/notes.md)? Picture a web version of it. A customer has 5 notebooks in the cart, types `5` into a "How many more?" box, and clicks Add. Form values are always strings ([chapter 22](../22-forms/notes.md)), so this is what your code gets:

```js
const cartItem = { name: "Notebook", quantity: 5, priceInCents: 350 };
const typedQuantity = "5"; // from the form, so it's a string

cartItem.quantity = cartItem.quantity + typedQuantity;
console.log(cartItem.quantity);        // prints: 55
console.log(typeof cartItem.quantity); // prints: string
console.log(cartItem.quantity * cartItem.priceInCents); // prints: 19250
```

The customer wanted 10 notebooks and got 55! And look at the last line: `*` quietly turns `"55"` back into a number, so the price comes out as $192.50 without any error. The bug only shows up when someone reads the receipt.

The fix is to convert at the edge: turn the text into a number as soon as it arrives, check it, and only then use it:

```js
const cartItem = { name: "Notebook", quantity: 5, priceInCents: 350 };
const typedQuantity = "5";

const extra = Number(typedQuantity);
if (Number.isInteger(extra) && extra > 0) {
  cartItem.quantity = cartItem.quantity + extra;
}
console.log(cartItem.quantity); // prints: 10
```

Your chapter 12 cart was already protected. `addToCart` checked `Number.isInteger(quantity)`, and `Number.isInteger("5")` is `false`, so a string would have been refused instead of turning into 55.

### The golden rules

1. **Use `===` and `!==`.** They never convert anything, so there's nothing to remember.
2. **Convert explicitly, as early as possible.** When a value arrives from outside your code (a form, a URL, an API, text you pulled out with a regex), turn it into the type you need straight away, with `Number()`, `String()` or `Boolean()`. Then the rest of your code only ever sees the right types.
3. **Expect input to be text.** Form fields (chapter 22), `localStorage` (chapter 23), URL query parameters (chapter 33) and regex matches (chapter 37) all give you strings.
4. **Check what a conversion gave you.** `Number("abc")` is `NaN` and `Number("")` is `0`, so check the result with `Number.isNaN()` or `Number.isInteger()`, and handle empty text on purpose.
5. **Don't write code that only works because of coercion.** If a reader needs to know these rules to understand a line, rewrite the line.

## Common mistakes

**1. Adding numbers that are secretly strings**

```js
const shirtPrice = "4.50"; // pulled out of some text
const socksPrice = "3.25";
console.log(shirtPrice + socksPrice); // prints: 4.503.25
```

Both prices are strings, so `+` joins them. Fix: convert first. `Number(shirtPrice) + Number(socksPrice)` gives `7.75`.

**2. Comparing numbers that are secretly strings**

```js
const minimumAge = "9";
const age = "10";
console.log(age >= minimumAge); // prints: false
```

Both sides are strings, so they're compared character by character, and `"1"` comes before `"9"`. A 10-year-old gets turned away from a film for ages 9 and up! Fix: `Number(age) >= Number(minimumAge)` gives `true`.

**3. Printing an object inside a template literal**

```js
const order = { id: 1042, total: 35 };
console.log(`Order: ${order}`); // prints: Order: [object Object]
```

A template literal turns the object into a string with its built-in `toString()`. Fix: print the parts you want, like `` `Order ${order.id}` ``, or give the object to `console.log` separately: `console.log("Order:", order)`.

**4. Treating `"0"` or `"false"` as false**

```js
const giftWrap = "0"; // from a form: "0" means "no, thanks"
if (giftWrap) {
  console.log("Adding gift wrap");
}
// prints: Adding gift wrap
```

Every string that isn't empty is truthy, even `"0"` and `"false"`. Fix: say exactly what you mean, like `if (giftWrap === "1")`, or convert first: `if (Number(giftWrap) > 0)`.

**5. Using `==` and trusting the answer**

```js
const answer = ""; // the user left the box empty
if (answer == 0) {
  console.log("You chose option 0");
}
// prints: You chose option 0
```

`"" == 0` is `true`, because empty text becomes `0`. The user didn't choose anything, but the code thinks they chose 0. Fix: use `===` and handle the empty case on purpose: check `answer === ""` first, then compare `Number(answer) === 0`.

## Quick recap

- Type coercion is JavaScript converting types by itself. Explicit conversion, with `Number()`, `String()` or `Boolean()`, is you doing it on purpose.
- To a string: arrays join their items with commas, and plain objects become `"[object Object]"`, from their built-in `toString()`.
- To a number: `""` and `null` become `0`, while `undefined` and text like `"42px"` become `NaN`. `true` is `1` and `false` is `0`.
- To a boolean: only the eight falsy values give `false`. `"0"`, `"false"` and `[]` are all truthy.
- `+` joins if either side is a string. `-`, `*`, `/` and `%` always do math. Two strings are compared character by character.
- `==` converts before it compares, using rules that are hard to keep in your head. `===` never converts, so use `===`.
- Convert input explicitly as soon as it arrives, and check the result.

---

**Next:** try the [exercises](exercises.md), then move on to [39 Project: Weather App](../39-project-weather-app/notes.md).
