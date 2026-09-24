# 05 Numbers and Math

## What is it?

JavaScript has one type for every number: whole numbers like `47` and decimals like `4.99` are both `number` (remember [chapter 03](../03-data-types/notes.md)?).

This chapter is about working with numbers: rounding them, making random ones, reading them from text, and showing them the way people expect, like `$1,234.50`. Most of the tools live in **`Math`**, a toolbox of math helpers that comes built into JavaScript.

## Why does it matter?

Real programs need more than `+ - * /`:

- A shop must show prices with exactly two decimals: `$4.50`, not `$4.5`.
- A board game needs random dice rolls.
- A party planner must round *up*: 47 guests at tables of 6 need 8 tables, not 7.83.
- A web page gives you the text `"42px"`, and you need the number 42.

And there's a surprise waiting that trips up almost everyone:

```js
console.log(0.1 + 0.2); // prints: 0.30000000000000004
```

This chapter explains why that happens, and how to handle it, especially when money is involved.

## Real-world example

Numbers in everyday life come with everyday questions. Each question needs a different tool:

| Everyday question | What you need | JavaScript | Answer |
|---|---|---|---|
| 47 guests, tables seat 6. How many tables? | Round up | `Math.ceil(47 / 6)` | `8` |
| 40 eggs, boxes hold 12. How many full boxes? | Round down | `Math.floor(40 / 12)` | `3` |
| A 4.7-star rating. How many stars to show? | Round to the nearest | `Math.round(4.7)` | `5` |
| Three scores: 72, 95 and 88. Which is the best? | The biggest | `Math.max(72, 95, 88)` | `95` |
| Roll a dice | A random whole number | `Math.floor(Math.random() * 6) + 1` | 1 to 6 |

By the end of this chapter, you'll know every tool in that table, and a few more.

## How it works

### Whole number or decimal?

Whole numbers and decimals share one type, but sometimes you need to know which one you've got. Maybe you can sell 3 T-shirts, but not 2.5. `Number.isInteger()` tells you. (An **integer** is a whole number, with no decimal part.)

```js
console.log(Number.isInteger(47)); // prints: true
console.log(Number.isInteger(4.99)); // prints: false
console.log(Number.isInteger(5.0)); // prints: true
```

`5.0` counts as a whole number, because it's exactly the same value as `5`.

Notice the dot in `Number.isInteger`. It means "the `isInteger` tool that belongs to `Number`". A tool that belongs to something like this is called a **method**. You've used one since chapter 01: `log` is a method of `console`.

### The `0.1 + 0.2` surprise

```js
console.log(0.1 + 0.2); // prints: 0.30000000000000004
console.log(0.1 + 0.2 === 0.3); // prints: false
```

Why? Computers store numbers in **binary**: using only 0s and 1s. Whole numbers fit perfectly, but many decimals don't. Think of trying to write 1/3 as a decimal: 0.33333... goes on forever, so at some point you have to stop and round. In binary, 0.1 is like that. The computer stores a number that's a tiny bit off, and when you add two slightly-off numbers, the tiny error can show up in the answer.

This isn't a JavaScript bug. Python, Java, C# and almost every other language give the same answer, because they all store decimals the same standard way.

Most of the time, an error that small doesn't matter. It matters in two places: when you compare decimals with `===`, and when you show numbers to people, especially money.

### Handling money: work in cents

Whole numbers are stored exactly. So the safest way to handle money is to do all the math in **cents** (whole numbers), and turn the result into dollars only at the very end, for display.

A pen costs $1.10 and a notebook costs $2.20:

```js
console.log(1.10 + 2.20); // prints: 3.3000000000000003

const penCents = 110;
const notebookCents = 220;
const totalCents = penCents + notebookCents;
console.log(totalCents); // prints: 330
console.log(totalCents / 100); // prints: 3.3
```

The cents version is exact: 330 cents is $3.30. Many real payment systems work exactly like this: they store amounts in the smallest unit of the currency, like cents.

That last line printed `3.3`, though, not `3.30`. That's where `toFixed` comes in.

### `toFixed`: exactly two decimals (as text!)

`toFixed(2)` rounds a number to 2 decimal places, and adds zeros if it needs to:

```js
const total = 1.1 + 2.2;
console.log(total.toFixed(2)); // prints: 3.30

const price = 4.5;
console.log(price.toFixed(2)); // prints: 4.50
```

So for everyday prices, you can also use decimals and round the result with `toFixed(2)` when you show it. Working in cents is still the safest choice, because rounding can be thrown off by those same tiny errors: `(1.005).toFixed(2)` gives `"1.00"`, not `"1.01"`.

> **Watch out:** `toFixed` gives you back a **string**, not a number. It's meant for showing, not for more math:

```js
const price = 4.5;
const priceTag = price.toFixed(2);
console.log(priceTag, typeof priceTag); // prints: 4.50 string
console.log(priceTag + 1); // prints: 4.501
```

Remember the `"5" + 3` surprise from chapter 03? It's back. The rule: **do all your math with numbers first, and call `toFixed` last**, right before you print.

### Rounding: `Math.round`, `Math.floor`, `Math.ceil` and `Math.trunc`

JavaScript has four ways to turn a decimal into a whole number:

| Tool | What it does | `4.7` becomes | `4.2` becomes |
|---|---|---|---|
| `Math.round()` | Rounds to the nearest whole number | `5` | `4` |
| `Math.floor()` | Always rounds down | `4` | `4` |
| `Math.ceil()` | Always rounds up ("ceil" is short for ceiling) | `5` | `5` |
| `Math.trunc()` | Cuts off the decimals ("trunc" is short for truncate) | `4` | `4` |

A number exactly halfway, like `4.5`, rounds up to `5` with `Math.round`.

`Math.floor` and `Math.trunc` look the same for positive numbers. They only differ below zero. Say it's -4.7 degrees outside:

```js
console.log(Math.floor(-4.7)); // prints: -5
console.log(Math.trunc(-4.7)); // prints: -4
```

`Math.floor` goes *down* to -5, while `Math.trunc` just chops off the `.7`.

Picking the right one is about the question you're asking. Rounding up makes sure everyone gets a seat:

```js
const guests = 47;
const seatsPerTable = 6;
console.log("Tables needed:", Math.ceil(guests / seatsPerTable)); // prints: Tables needed: 8
```

Rounding down counts only the complete groups:

```js
const eggs = 40;
const eggsPerBox = 12;
console.log("Full boxes:", Math.floor(eggs / eggsPerBox)); // prints: Full boxes: 3
```

And remember the minutes-into-hours trick from [chapter 04](../04-operators/notes.md)? `Math.floor` makes it shorter:

```js
const totalMinutes = 135;
const hours = Math.floor(totalMinutes / 60);
const minutes = totalMinutes % 60;
console.log(hours, "h", minutes, "min"); // prints: 2 h 15 min
```

All four tools round to a *whole* number. To round to 2 decimals and still have a number (not a string like `toFixed` gives you), multiply by 100, round, then divide by 100:

```js
const distanceKm = 3.14159;
console.log(Math.round(distanceKm * 100) / 100); // prints: 3.14
```

### More `Math` helpers

**`Math.abs()`** gives the **absolute value**: how far a number is from zero, without the minus sign. It's handy for "how big is the difference?", whichever way round you subtract:

```js
const morningTemp = 12;
const afternoonTemp = 19;
console.log("Temperature change:", Math.abs(morningTemp - afternoonTemp)); // prints: Temperature change: 7
```

**`Math.max()`** and **`Math.min()`** find the biggest and smallest of several numbers:

```js
console.log(Math.max(72, 95, 88)); // prints: 95
console.log(Math.min(72, 95, 88)); // prints: 72
```

**`Math.sqrt()`** gives the **square root**: the number that, multiplied by itself, makes the one you started with. For example, a ladder leaning against a wall. The top is 4 meters up, and the bottom is 3 meters from the wall. How long is the ladder? (That's Pythagoras from school.)

```js
const wallHeight = 4;
const distanceFromWall = 3;
const ladderLength = Math.sqrt(wallHeight ** 2 + distanceFromWall ** 2);
console.log("Ladder length:", ladderLength); // prints: Ladder length: 5
```

**`Math.PI`** is the number π. It's a value, not a tool, so it has no brackets. Here's the area of a pizza with a 15 cm radius:

```js
const radius = 15;
const area = Math.PI * radius ** 2;
console.log(Math.PI); // prints: 3.141592653589793
console.log("Pizza area:", Math.round(area), "square cm"); // prints: Pizza area: 707 square cm
```

### Random numbers

`Math.random()` gives you a random decimal from 0 up to (but never quite reaching) 1:

```js
console.log(Math.random()); // prints something like: 0.7318234081530475
```

Your number will be different, and it changes every time you run the file.

A decimal between 0 and 1 isn't very useful on its own. Games need things like a dice roll, a whole number from 1 to 6. Here's the recipe:

```js
const roll = Math.floor(Math.random() * 6) + 1;
console.log("You rolled:", roll); // prints something like: You rolled: 4
```

Here's what each step does:

| Step | Code | Possible values |
|---|---|---|
| 1. A random decimal | `Math.random()` | 0 up to 0.999... |
| 2. Stretch it | `Math.random() * 6` | 0 up to 5.999... |
| 3. Round down | `Math.floor(Math.random() * 6)` | 0, 1, 2, 3, 4 or 5 |
| 4. Shift it up by 1 | `Math.floor(Math.random() * 6) + 1` | 1, 2, 3, 4, 5 or 6 |

The same recipe works for any range. For a random whole number from `min` to `max` (both included):

```js
const min = 10;
const max = 20;
const prizeTicket = Math.floor(Math.random() * (max - min + 1)) + min;
console.log("Winning ticket:", prizeTicket); // prints something like: Winning ticket: 17
```

Why `max - min + 1`? Because from 10 to 20 there are 11 possible numbers, not 10. Count them on your fingers: 10, 11, 12, and so on up to 20.

> **Watch out:** `Math.random()` is fine for games, but not for anything secret, like passwords or security codes. Its numbers aren't unpredictable enough for that. Browsers and Node have a safer tool for secrets, `crypto.getRandomValues()`.

### `NaN`: Not a Number

You met `NaN` in chapter 03. It's what you get when a calculation can't give a real number:

```js
console.log(Number("hello")); // prints: NaN
console.log(0 / 0); // prints: NaN
console.log(Math.sqrt(-1)); // prints: NaN
console.log(undefined + 1); // prints: NaN
```

That last one happens more than you'd think: a variable that never got a value, used in a calculation.

`NaN` is contagious. Any math with `NaN` gives `NaN`, so one bad value can ruin a whole shopping basket total:

```js
const shirtPrice = 20;
const capPrice = Number("twelve"); // oops, not a number
console.log(shirtPrice + capPrice + 5); // prints: NaN
```

And `NaN` has a strange rule: it isn't equal to anything, not even to itself. So you can't check for it with `===`. Use `Number.isNaN()` instead:

```js
const quantity = Number("two");
console.log(quantity === NaN); // prints: false
console.log(Number.isNaN(quantity)); // prints: true
```

You may also see an older `isNaN()` without the `Number.` in front. It converts the value first, which gives confusing results, so stick to `Number.isNaN()`.

(One more oddity: `typeof NaN` is `"number"`. "Not a Number" is a number. Yes, really.)

### `Infinity`

Dividing by zero doesn't crash your program. It gives `Infinity`:

```js
console.log(10 / 0); // prints: Infinity
console.log(-10 / 0); // prints: -Infinity
```

If you ever see `Infinity` in your output, look for a division by zero. For example, a bill split between 0 people.

### Text to numbers: `Number()`, `parseInt()` and `parseFloat()`

`Number()` from chapter 03 is strict: the *whole* text must be a number, or you get `NaN`. That's a problem for text like `"42px"` (a size on a web page) or `"3.5kg"` (a weight on a product page).

`parseInt()` and `parseFloat()` are more relaxed. They read a number from the start of the text and stop at the first character that doesn't fit:

```js
console.log(Number("42px")); // prints: NaN
console.log(parseInt("42px")); // prints: 42
console.log(parseFloat("3.5kg")); // prints: 3.5
```

The difference between them: `parseInt` reads only a whole number (an integer), while `parseFloat` keeps the decimals. ("Float" is programmer slang for a decimal number.)

| Text | `Number()` | `parseInt()` | `parseFloat()` |
|---|---|---|---|
| `"42"` | `42` | `42` | `42` |
| `"3.99"` | `3.99` | `3` | `3.99` |
| `"42px"` | `NaN` | `42` | `42` |
| `"size 42"` | `NaN` | `NaN` | `NaN` |

The last row shows that the number has to come *first*. If the text starts with letters, even `parseInt` gives up.

A good rule of thumb:

- Use `Number()` when the whole text should be a number, like a quantity typed into a form. If it's not a number, you *want* the `NaN`, so you can spot the problem.
- Use `parseInt()` or `parseFloat()` when the number comes with extra text after it, like `"42px"`.

You'll often see `parseInt(text, 10)` in other people's code. The `10` means "read it as a normal base-10 number" (the everyday counting system, with the digits 0 to 9). It's a safe habit, but for normal text like `"42px"` you get the same result without it.

### Numbers to text: `String()` and `toString()`

Going the other way, there are two ways to turn a number into text:

```js
const year = 2026;
console.log(String(year), typeof String(year)); // prints: 2026 string
console.log(year.toString(), typeof year.toString()); // prints: 2026 string
```

Both do the same job. `toString()` is a method (like `toFixed`), so it goes after a dot.

### Formatting numbers for people

Big numbers are hard to read: is `1234567` about a million or about ten million? `toLocaleString()` adds separators the way people expect them:

```js
const population = 1234567;
console.log(population.toLocaleString("en-US")); // prints: 1,234,567
console.log(population.toLocaleString("de-DE")); // prints: 1.234.567
console.log(population.toLocaleString("en-IN")); // prints: 12,34,567
```

The text in the brackets is a **locale**: a code for a language and a country, like `"en-US"` (English, United States) or `"de-DE"` (German, Germany). Different countries group digits differently. Germany uses dots, and India groups the last three digits together, then the rest in pairs.

If you leave the locale out, JavaScript uses your computer's language settings, so the output depends on your machine. Passing a locale makes it the same everywhere.

For money, add some settings:

```js
const price = 1234.5;
console.log(price.toLocaleString("en-US", { style: "currency", currency: "USD" })); // prints: $1,234.50
```

The part in curly braces `{ }` is a group of settings, each with a name and a value. It's called an **object**, and you'll learn all about objects in [chapter 11](../11-objects/notes.md). For now, copy the pattern.

If you format lots of prices the same way, create a **formatter** once with `Intl.NumberFormat`, then reuse it. (`Intl` is JavaScript's built-in toolbox for international formats, and `new` creates a fresh formatter. You'll learn more about `new` in chapter 27.)

```js
const dollars = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
console.log(dollars.format(4.5)); // prints: $4.50
console.log(dollars.format(1234.5)); // prints: $1,234.50

const pounds = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });
console.log(pounds.format(1234.5)); // prints: £1,234.50

const rupees = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" });
console.log(rupees.format(123456.5)); // prints: ₹1,23,456.50
```

The formatter adds the currency symbol and the separators, and shows the right number of decimals for that currency (two, for these three). It's like `toFixed`, with extras.

### Really big numbers: `MAX_SAFE_INTEGER` and BigInt

Numbers are exact up to 9,007,199,254,740,991 (about 9 quadrillion). JavaScript calls that limit `Number.MAX_SAFE_INTEGER`. Past it, whole numbers start to lose accuracy:

```js
console.log(Number.MAX_SAFE_INTEGER); // prints: 9007199254740991
console.log(9007199254740991 + 2); // prints: 9007199254740992
```

The second line is wrong: it should end in 993!

For huge whole numbers, JavaScript has a separate type, **BigInt**. You make one by adding `n` to the end of a whole number:

```js
console.log(9007199254740991n + 2n); // prints: 9007199254740993n
console.log(typeof 123n); // prints: bigint
```

You can't mix BigInts and normal numbers in the same calculation:

```js
console.log(10n + 1);
// TypeError: Cannot mix BigInt and other types, use explicit conversions
```

You'll rarely need BigInt. It's for things like very long ID numbers or exact math on enormous values. For everyday numbers like prices, ages and scores, a normal `number` is plenty.

## Common mistakes

**1. Comparing decimals with `===`**

```js
const total = 0.1 + 0.2;
console.log(total === 0.3); // prints: false
```

The tiny storage error makes the two values slightly different. Work in whole numbers (like cents) instead: `10 + 20 === 30` is `true`.

**2. Doing math with the result of `toFixed`**

```js
const subtotal = 19.5;
const shown = subtotal.toFixed(2);
console.log(shown + 5); // prints: 19.505
```

`toFixed` returns a string, so `+` joins instead of adding. Do the math first and format last: `(subtotal + 5).toFixed(2)` gives `"24.50"`.

**3. Checking for `NaN` with `===`**

```js
const age = Number("twenty");
console.log(age === NaN); // prints: false
```

`NaN` isn't equal to anything, not even itself. Use `Number.isNaN(age)` instead, which gives `true`.

**4. Expecting `Math.round` to keep decimals**

```js
console.log(Math.round(4.567, 2)); // prints: 5
```

`Math.round` always rounds to a whole number, and it quietly ignores the `2`. For 2 decimals, use `toFixed(2)` to show the number, or `Math.round(4.567 * 100) / 100` to keep it a number.

**5. Getting the random range wrong**

```js
const roll = Math.floor(Math.random() * 6);
```

This gives 0 to 5, not 1 to 6, because the `+ 1` is missing. And use `Math.floor`, not `Math.round`: with `Math.round`, the lowest and highest numbers come up only half as often as the others.

**6. Calling a method straight on a number**

```js
console.log(42.toFixed(2));
// SyntaxError: Invalid or unexpected token
```

JavaScript thinks the dot after `42` is a decimal point. Put the number in a variable first, or wrap it in brackets: `(42).toFixed(2)`.

## Quick recap

- One `number` type covers whole numbers and decimals. `Number.isInteger()` tells you which one you have.
- Some decimals can't be stored exactly, so `0.1 + 0.2` isn't exactly `0.3`. For money, work in whole cents.
- `toFixed(2)` shows exactly 2 decimals, but it returns a string. Do the math first, and format last.
- `Math.round`, `Math.floor`, `Math.ceil` and `Math.trunc` round in different ways. `Math.abs`, `Math.max`, `Math.min`, `Math.sqrt` and `Math.PI` cover the rest of everyday math.
- A random whole number from `min` to `max`: `Math.floor(Math.random() * (max - min + 1)) + min`.
- `NaN` means "not a number". Check for it with `Number.isNaN()`. Dividing by zero gives `Infinity`.
- `parseInt()` and `parseFloat()` read numbers from text like `"42px"`. Show numbers to people with `toLocaleString()` or `Intl.NumberFormat`.

---

**Next:** try the [exercises](exercises.md), then move on to [06 Strings](../06-strings/notes.md).
