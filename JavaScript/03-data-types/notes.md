# 03 Data Types

## What is it?

Every value in JavaScript has a **type**: the kind of value it is. Text is one type, numbers are another, and yes/no answers are a third.

The type decides what you can do with a value. You can multiply two numbers, but multiplying two names makes no sense.

## Why does it matter?

Look at these two lines:

```js
console.log(5 + 3); // prints: 8
console.log("5" + 3); // prints: 53
```

They look almost the same, but the results are completely different. The only difference is the type: `5` is a number, and `"5"` (in quotes) is text.

This isn't only a puzzle. It causes real bugs. Picture an online shop where a T-shirt costs 20 and socks cost 5, but the basket shows a total of `205`. That happens when the prices arrive as text instead of numbers.

Once you know about types, results like these stop being mysterious, and you'll know how to fix them.

## Real-world example

Think of the sign-up form at a gym. Each box on the form expects a different kind of answer:

| On the form | Example answer | JavaScript type |
|---|---|---|
| Full name | Maya Patel | string (text) |
| Age | 29 | number |
| Tick box: "Do you want a locker?" | Yes or no | boolean (true or false) |
| Middle name: you don't have one, so you write "none" | Nothing, on purpose | null |
| Emergency contact: you haven't got to it yet | Nothing, not filled in yet | undefined |

You can do math with the age (how many years until you're 30?), but not with the name. A tick box can only ever be yes or no.

JavaScript's types work the same way: each kind of value has its own rules.

## How it works

### The five basic types

| Type | What it holds | Examples |
|---|---|---|
| **string** | Text, inside quotes | `"Maya"`, `"Hello!"`, `"42"` |
| **number** | Any number: whole, decimal or negative | `42`, `3.5`, `-10` |
| **boolean** | Yes or no | `true`, `false` |
| **undefined** | "Nothing has been put here yet" | `undefined` |
| **null** | "Empty, on purpose" | `null` |

These five are called **primitive** types. A primitive is a simple, single value, one of the basic building blocks everything else is made from.

JavaScript has two more primitives, **bigint** (for huge whole numbers) and **symbol** (for unique labels). They're rare, and you'll meet them in chapters 05 and 36.

Everything that isn't a primitive is an **object**: a value that holds several values together, like a list. Lists (called arrays) and objects come in chapters 10 and 11. For now, the five types above are all you need.

### Checking a type with `typeof`

Put `typeof` in front of a value, and JavaScript tells you its type:

```js
console.log(typeof "Maya"); // prints: string
console.log(typeof 42); // prints: number
console.log(typeof 3.5); // prints: number
console.log(typeof true); // prints: boolean
console.log(typeof undefined); // prints: undefined
```

It works on variables too, and it's the best way to tell two look-alike values apart. `console.log` prints text without its quotes, so a number and a piece of text can look identical:

```js
const price = 20;
const priceText = "20";
console.log(price, priceText); // prints: 20 20
console.log(typeof price, typeof priceText); // prints: number string
```

When a result looks strange, check the type. It's often the answer.

### Strings: text

A **string** is text. You met strings in chapter 01: anything inside quotes. JavaScript accepts double quotes `"..."` or single quotes `'...'`. This course uses double quotes.

Anything inside quotes is a string, even if it's made of digits. Even `""` is a string: it's called an **empty string**, like a text box with nothing typed in it.

```js
console.log(typeof "42"); // prints: string
console.log(typeof ""); // prints: string
```

### Joining strings with `+`

When you use `+` with strings, it glues them together. This is called **concatenation** (a fancy word for joining).

```js
const firstName = "Ada";
const lastName = "Lovelace";
const fullName = firstName + " " + lastName;
console.log(fullName); // prints: Ada Lovelace
```

See the `" "` in the middle? It's a string that holds a single space. Without it, you'd get `AdaLovelace`. The `+` adds nothing extra, not even a space.

You already know another way to print several things: commas in `console.log`. Here's the difference:

```js
const city = "Oslo";
console.log("Welcome to", city); // prints: Welcome to Oslo
console.log("Welcome to " + city); // prints: Welcome to Oslo

const greeting = "Welcome to " + city + "!";
console.log(greeting); // prints: Welcome to Oslo!
```

- **Commas** print several values, and `console.log` puts a space between them for you.
- **`+`** builds one new string. You add the spaces yourself, but you can store the result in a variable and use it later.

(Chapter 06 shows a neater way to build text, called template literals.)

### Numbers: whole and decimal

JavaScript has one type, `number`, for every kind of number: whole numbers, decimals, and negative numbers. Numbers never go in quotes.

```js
const temperature = -3;
const price = 4.99;
const guests = 12;
console.log(typeof temperature, typeof price, typeof guests); // prints: number number number
```

Numbers have a few surprises of their own. You'll meet them in [chapter 05](../05-numbers-and-math/notes.md).

### The `"5" + 3` surprise

Now you can understand the puzzle from the start of this chapter:

```js
console.log(5 + 3); // prints: 8
console.log("5" + 3); // prints: 53
console.log("5" + "3"); // prints: 53
```

Here's the rule: **if either side of `+` is a string, JavaScript joins instead of adding.** It turns the number into text first, then glues the two together. And the result is a string:

```js
const result = "5" + 3;
console.log(result, typeof result); // prints: 53 string
```

This often bites when you build a message that has numbers in it:

```js
const pizzas = 2;
const drinks = 3;
console.log("Items: " + pizzas + drinks); // prints: Items: 23
```

JavaScript works from left to right. First `"Items: " + 2` makes the string `"Items: 2"`. Then `"Items: 2" + 3` joins again, giving `"Items: 23"`.

The fix: do the math first, in its own variable. Then join.

```js
const pizzas = 2;
const drinks = 3;
const items = pizzas + drinks;
console.log("Items: " + items); // prints: Items: 5
```

(Brackets can fix this too. [Chapter 04](../04-operators/notes.md) shows how.)

### Booleans: true or false

A **boolean** has only two possible values: `true` and `false`. Think of a light switch: it's either on or off, nothing in between.

Booleans are perfect for yes/no facts:

```js
const isOpen = true;
const hasTicket = false;
console.log(isOpen, hasTicket); // prints: true false
console.log(typeof isOpen); // prints: boolean
```

`true` and `false` never go in quotes. With quotes, you get a string that just happens to spell the word:

```js
console.log(typeof true); // prints: boolean
console.log(typeof "true"); // prints: string
```

> **Tip:** Boolean names often start with `is`, `has` or `can`, like `isRaining`, `hasPaid` or `canVote`. They read like yes/no questions.

So far you've typed `true` and `false` yourself. Most booleans come from questions like "Is 10 bigger than 5?" You'll learn to ask those in [chapter 04](../04-operators/notes.md), and to make decisions with the answers in chapter 07.

### `undefined` and `null`: two kinds of "nothing"

JavaScript has two ways to say "there's nothing here". Picture two boxes:

- **`undefined`** is an empty box. Nothing has been put in it yet. JavaScript uses it automatically, like for a `let` with no value (remember [chapter 02](../02-variables/notes.md)?).
- **`null`** is a box with a note inside that says "empty, on purpose". Someone put it there deliberately (you, or the code you're using) to say "we know there's nothing here".

Here's an online order where both show up:

```js
let deliveryDate; // not decided yet
const couponCode = null; // the customer has no coupon, and we know it

console.log(deliveryDate); // prints: undefined
console.log(couponCode); // prints: null
```

A simple rule of thumb: let JavaScript use `undefined`. When *you* want to say "nothing here, on purpose", use `null`.

### The `typeof null` quirk

Try this:

```js
console.log(typeof null); // prints: object
```

That's wrong! `null` isn't an object. It's its own type.

This is a mistake from the very first version of JavaScript, back in 1995. Fixing it now would break millions of older websites that depend on it, so it stays. Every JavaScript developer has to remember it, and now you do too.

### A variable can hold any type

In some languages, like Java or C#, you pick a type for each variable when you create it, and it can never hold anything else. JavaScript doesn't work that way. It's **dynamically typed**: the same `let` box can hold a number now and text later.

```js
let answer = 42;
console.log(typeof answer); // prints: number

answer = "forty-two";
console.log(typeof answer); // prints: string
```

This freedom is handy, but it can also lead to confusing bugs. A good habit: keep each variable to one type.

### Converting between types: `Number()` and `String()`

Text that looks like a number isn't a number yet. This matters more than you'd think. When someone types into a box on a web page, JavaScript receives text, even if they typed digits. (You'll build forms like that in chapter 22.)

`Number()` turns a value into a number:

```js
const ticketsText = "3"; // typed in by a user, so it's text
const tickets = Number(ticketsText);

console.log(tickets + 2); // prints: 5
console.log(typeof tickets); // prints: number
```

If the text isn't a number at all, you get `NaN`, which stands for "Not a Number":

```js
console.log(Number("3.5")); // prints: 3.5
console.log(Number("hello")); // prints: NaN
```

`String()` goes the other way. It turns a value into text:

```js
const year = 2026;
const yearText = String(year);
console.log(yearText, typeof yearText); // prints: 2026 string
```

You won't need `String()` often, because `+` already turns a number into text when it joins it to a string.

Converting has more corners to explore. [Chapter 05](../05-numbers-and-math/notes.md) covers `NaN` and more ways to read numbers from text, and chapter 38 covers all the ways JavaScript converts types by itself.

## Common mistakes

**1. Adding numbers that are really text**

```js
const morningSteps = "4000";
const eveningSteps = "3500";
console.log(morningSteps + eveningSteps); // prints: 40003500
```

Both values are strings, so `+` joins them instead of adding. Convert them first: `Number(morningSteps) + Number(eveningSteps)` gives `7500`.

**2. Forgetting the spaces when joining**

```js
const guest = "Maya";
console.log("Hello" + guest); // prints: HelloMaya
```

`+` never adds spaces for you. Put them inside the quotes yourself: `"Hello, " + guest`.

**3. Putting `true` or `false` in quotes**

```js
const isMember = "false";
console.log(typeof isMember); // prints: string
```

It looks like a boolean, but it's a string. That difference will matter a lot when you start making decisions in chapter 07. Fix: `const isMember = false;`

**4. Capital letters on `true`, `false`, `null` or `undefined`**

```js
const isOpen = True;
// ReferenceError: True is not defined
```

These words are always lowercase. With a capital letter, JavaScript thinks `True` is the name of a variable you never created.

**5. Trusting what `console.log` shows you**

```js
const score = "10";
console.log(score); // prints: 10
```

It looks like a number, but it's a string: `console.log` doesn't show the quotes. When a result seems odd, check with `typeof score`.

## Quick recap

- Every value has a type. The five basic (primitive) types are string, number, boolean, undefined and null.
- `typeof` tells you a value's type. Watch out: `typeof null` says `object`, an old mistake that's here to stay.
- `+` adds numbers but joins strings. If either side is a string, the result is a string: `"5" + 3` gives `"53"`.
- `Number()` turns text into a number (or `NaN` if it can't), and `String()` turns a value into text.
- `undefined` means "nothing here yet". `null` means "empty, on purpose".
- A variable can hold any type (JavaScript is dynamically typed), but it's clearer to keep each variable to one type.

---

**Next:** try the [exercises](exercises.md), then move on to [04 Operators](../04-operators/notes.md).
