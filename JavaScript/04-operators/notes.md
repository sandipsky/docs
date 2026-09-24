# 04 Operators

## What is it?

An **operator** is a symbol that does something with values. For example, `+` adds two numbers, and `=` puts a value into a variable.

You've already used a few. This chapter fills in the rest: more math, shortcuts for updating variables, and operators that compare values and answer with `true` or `false`.

## Why does it matter?

Programs are constantly calculating and checking things:

- A shop adds up your basket, then checks whether you get free delivery.
- A game adds points, then checks whether you've beaten the high score.
- A cinema checks whether you're old enough to see a movie.

Operators are how you write those calculations and questions.

And getting them slightly wrong can be sneaky. If you forget that `*` happens before `+`, your program won't crash. It will calmly give you the wrong answer.

## Real-world example

Think of a day at a theme park. You use every kind of operator without noticing:

| At the theme park | Kind of operator |
|---|---|
| Adding up the price of tickets and snacks | **Arithmetic**: math like adding and multiplying |
| Topping up your ride card with more credit | **Assignment**: putting a new value into a variable |
| The "You must be this tall to ride" sign | **Comparison**: a yes/no question about two values |
| "You need a ticket AND you must be over 12" | **Logical**: combining yes/no answers |

Let's go through them one at a time.

## How it works

### Arithmetic operators

| Operator | Meaning | Example | Result |
|---|---|---|---|
| `+` | Add | `7 + 2` | `9` |
| `-` | Subtract | `7 - 2` | `5` |
| `*` | Multiply | `7 * 2` | `14` |
| `/` | Divide | `7 / 2` | `3.5` |
| `%` | Remainder | `7 % 2` | `1` |
| `**` | Power | `7 ** 2` | `49` |

You know the first four from chapter 01. The last two are new.

### `%`: what's left over

`%` is the **remainder** operator. It tells you what's left over after you share something out in equal groups. (You may hear it called "modulo".)

Say 3 friends share a pizza with 10 slices. Each friend gets 3 slices, which uses up 9, so 1 slice is left over:

```js
const slices = 10;
const friends = 3;
console.log(slices % friends); // prints: 1
```

A classic use is checking whether a number is even or odd. An even number divided by 2 leaves nothing over. An odd number leaves 1:

```js
console.log(8 % 2); // prints: 0
console.log(7 % 2); // prints: 1
```

### `**`: powers

`**` raises a number to a **power**: `4 ** 2` means 4 × 4, and `2 ** 3` means 2 × 2 × 2.

It's handy for areas. A square room with 4-meter walls has a floor area of `4 ** 2` square meters:

```js
const wallLength = 4;
console.log(wallLength ** 2); // prints: 16
console.log(2 ** 3); // prints: 8
```

### Which goes first? (precedence)

When a calculation has several operators, JavaScript follows the same order you learned in school math. The order is called **precedence**:

1. Brackets `( )` first
2. Then powers `**`
3. Then `*`, `/` and `%`, from left to right
4. Then `+` and `-`, from left to right

```js
console.log(2 + 3 * 4); // prints: 14
console.log((2 + 3) * 4); // prints: 20
```

In the first line, `3 * 4` happens first, then `2 +`. In the second, the brackets make `2 + 3` happen first.

Here's how this causes a real bug. You want the average of three test scores:

```js
const test1 = 80;
const test2 = 90;
const test3 = 70;

const wrongAverage = test1 + test2 + test3 / 3;
const rightAverage = (test1 + test2 + test3) / 3;
console.log(wrongAverage); // prints: 193.33333333333334
console.log(rightAverage); // prints: 80
```

Without brackets, only `test3` gets divided by 3. No error, just a wrong answer.

Brackets also fix the "Items: 23" surprise from [chapter 03](../03-data-types/notes.md). They make the math happen before the joining:

```js
const pizzas = 2;
const drinks = 3;
console.log("Items: " + (pizzas + drinks)); // prints: Items: 5
```

> **Tip:** When in doubt, add brackets. They cost nothing, and they make it clear to the reader what you meant.

### Putting it together: minutes into hours

A film is 135 minutes long. How long is that in hours and minutes?

```js
const totalMinutes = 135;
const leftoverMinutes = totalMinutes % 60;
const hours = (totalMinutes - leftoverMinutes) / 60;
console.log(hours, "h", leftoverMinutes, "min"); // prints: 2 h 15 min
```

Step by step:

1. `135 % 60` is `15`: the minutes left over after taking out all the full hours.
2. `135 - 15` is `120`, which divides evenly by 60.
3. `120 / 60` is `2` full hours.

The same trick works for anything you share out: slices per friend, eggs per box, seconds into minutes. (Chapter 05 shows a shorter way to do steps 2 and 3, with `Math.floor`.)

### Assignment shortcuts: `+=`, `-=`, `*=`, `/=`

Remember updating a variable from its old value in [chapter 02](../02-variables/notes.md)? `score = score + 10` is so common that it has a shortcut: `score += 10`. Both mean exactly the same thing.

Here's a player's coins in a game:

```js
let coins = 100;

coins += 50; // found a treasure chest
console.log(coins); // prints: 150

coins -= 30; // bought a potion
console.log(coins); // prints: 120

coins *= 2; // double-coins weekend
console.log(coins); // prints: 240

coins /= 4; // shared equally with a team of 4
console.log(coins); // prints: 60
```

| Shortcut | Means the same as |
|---|---|
| `coins += 50` | `coins = coins + 50` |
| `coins -= 30` | `coins = coins - 30` |
| `coins *= 2` | `coins = coins * 2` |
| `coins /= 4` | `coins = coins / 4` |

`+=` works on strings too, which is handy for building text a piece at a time:

```js
let shoppingList = "Milk";
shoppingList += ", Bread";
shoppingList += ", Eggs";
console.log(shoppingList); // prints: Milk, Bread, Eggs
```

These shortcuts change the variable, so it must be a `let`. A `const` gives you the `TypeError` from chapter 02.

### Adding or taking away 1: `++` and `--`

Adding or taking away exactly 1 is so common that it gets its own operators. Picture the door counter at a museum:

```js
let visitors = 0;
visitors++; // same as: visitors += 1
visitors++;
console.log(visitors); // prints: 2

visitors--; // one person left
console.log(visitors); // prints: 1
```

You may also see `++visitors`, with the `++` in front. On a line by itself, it does the same thing. The two versions only behave differently inside a bigger calculation, so keep `++` and `--` on their own line and you'll never need to worry about it.

### Comparison operators

A comparison asks a yes/no question about two values. The answer is always a boolean, `true` or `false` (remember [chapter 03](../03-data-types/notes.md)?).

| Operator | The question it asks | Example | Result |
|---|---|---|---|
| `>` | Is the left bigger? | `5 > 3` | `true` |
| `<` | Is the left smaller? | `5 < 3` | `false` |
| `>=` | Is the left bigger or equal? | `5 >= 5` | `true` |
| `<=` | Is the left smaller or equal? | `4 <= 3` | `false` |
| `===` | Are they equal? | `5 === 5` | `true` |
| `!==` | Are they different? | `5 !== 3` | `true` |

Here's the height check for a ride at the theme park:

```js
const height = 125; // in centimeters
const minimumHeight = 120;
const canRide = height >= minimumHeight;
console.log("Can ride:", canRide); // prints: Can ride: true
```

Storing the answer in a variable with a yes/no name, like `canRide`, makes your code read like plain English. For now you'll print these answers. In chapter 07, you'll use them to make decisions, like "if they can ride, open the gate".

Math happens before comparisons, so this even/odd check needs no brackets. A dance class needs an even number of people, so everyone has a partner:

```js
const dancers = 7;
console.log("Everyone has a partner:", dancers % 2 === 0); // prints: Everyone has a partner: false
```

### `===` checks the value and the type

`===` is called **strict equality**. Both sides must be the same type *and* the same value:

```js
console.log(5 === 5); // prints: true
console.log(5 === "5"); // prints: false
console.log("cat" === "cat"); // prints: true
console.log("Cat" === "cat"); // prints: false
```

The number `5` and the string `"5"` are different types, so they're not equal. Strings must match exactly, including capital letters. (Chapter 06 has more on comparing text.)

`!==` is the opposite. It's `true` when the two values are different:

```js
const lockerCode = 4821;
console.log(lockerCode !== 1234); // prints: true
```

### `==` vs `===`: always use `===`

JavaScript also has `==` (two equals signs), called **loose equality**, and its opposite `!=`. Before comparing, they quietly convert both sides to the same type. That leads to surprises:

```js
console.log(5 == "5"); // prints: true
console.log(0 == ""); // prints: true
console.log(0 === ""); // prints: false
```

The number `0` and an empty string are not the same thing, but `==` says they are.

The rule is simple: **always use `===` and `!==`.** You'll see `==` in older code, but don't write it yourself. If you need to compare text with a number, convert the text first with `Number()`, so you know exactly what's being compared. (Chapter 38 explains the rules `==` follows, if you're curious.)

### Logical operators: `&&`, `||` and `!`

Logical operators combine yes/no answers into one bigger answer:

- `&&` means **AND**. It's `true` only when both sides are `true`. "You can use the gym if you're a member AND it's open."
- `||` means **OR**. It's `true` when at least one side is `true`. "Delivery is free if you're a member OR your order is 50 or more."
- `!` means **NOT**. It flips `true` to `false`, and `false` to `true`.

```js
const isMember = true;
const isOpen = false;

console.log(isMember && isOpen); // prints: false
console.log(isMember || isOpen); // prints: true
console.log(!isOpen); // prints: true
```

Here's every possible combination:

| Left side | Right side | Left AND right | Left OR right |
|---|---|---|---|
| `true` | `true` | `true` | `true` |
| `true` | `false` | `false` | `true` |
| `false` | `true` | `false` | `true` |
| `false` | `false` | `false` | `false` |

In short: AND is picky (both must be true). OR is easygoing (one true is enough).

Most of the time, you'll combine comparisons. Comparisons happen before `&&` and `||`, so you don't need brackets:

```js
const age = 15;
const hasTicket = true;

const isTeenager = age >= 13 && age <= 19;
const canEnter = age >= 12 && hasTicket;
console.log("Teenager:", isTeenager); // prints: Teenager: true
console.log("Can enter:", canEnter); // prints: Can enter: true
```

When you mix `&&` and `||` in one line, add brackets anyway, so nobody has to remember which one goes first. Here, delivery is free for members, or for orders of 40 or more during the holidays:

```js
const orderTotal = 42;
const isMember = false;
const isHoliday = true;

const freeDelivery = isMember || (orderTotal >= 40 && isHoliday);
console.log("Free delivery:", freeDelivery); // prints: Free delivery: true
```

And `!` reads nicely with yes/no names:

```js
const isRaining = false;
console.log("Picnic time:", !isRaining); // prints: Picnic time: true
```

`&&` and `||` can do more when you use them with values that aren't `true` or `false`. That's a trick for [chapter 07](../07-conditionals/notes.md). In this chapter, only use them with booleans.

## Common mistakes

**1. Using `=` when you mean `===`**

```js
let lives = 3;
console.log(lives = 0); // prints: 0
console.log(lives); // prints: 0
```

You wanted to ask "is `lives` 0?". But a single `=` doesn't ask anything: it puts 0 into the box. The player just lost all their lives! Fix: `lives === 0`.

(If `lives` were a `const`, you'd get the `TypeError` from chapter 02 instead. One more reason to prefer `const`.)

**2. Using `==` instead of `===`**

```js
console.log(0 == ""); // prints: true
```

`==` converts types before comparing, so different things can look equal. Always use `===` and `!==`.

**3. Comparing text from a form with a number**

```js
const ageText = "18"; // typed into a form, so it's text
console.log(ageText === 18); // prints: false
```

Text is never `===` to a number. Convert it first: `Number(ageText) === 18` gives `true`.

**4. Writing `=<` or `=>` instead of `<=` or `>=`**

```js
const height = 125;
console.log(height =< 120);
// SyntaxError: Unexpected token '<'
```

The `=` always comes second: `<=` and `>=`. Say it out loud in that order: "less than or equal".

`=>` is even sneakier. It means something completely different in JavaScript (you'll meet it in chapter 09), so `console.log(height => 120)` gives no error at all. It prints `[Function (anonymous)]`, which is definitely not the answer you wanted.

**5. Chaining comparisons like in math class**

```js
const age = 70;
console.log(18 <= age <= 65); // prints: true
```

70 isn't between 18 and 65, so why `true`? JavaScript does one comparison at a time. First, `18 <= 70` gives `true`. Then it compares `true <= 65`: it turns `true` into the number 1 (chapter 38 explains why), and `1 <= 65` is `true`.

Fix: ask two questions and join them with `&&`: `age >= 18 && age <= 65`.

**6. Using a shortcut on a `const`**

```js
const total = 10;
total += 5;
// TypeError: Assignment to constant variable.
```

`+=`, `++` and the other shortcuts change the variable, so it has to be a `let`.

## Quick recap

- Arithmetic: `+ - * / % **`. `%` gives the remainder (leftovers, even or odd), and `**` raises to a power.
- Precedence: brackets first, then `**`, then `* / %`, then `+ -`. When in doubt, add brackets.
- Shortcuts: `x += 5` means `x = x + 5` (the same goes for `-=`, `*=` and `/=`). `x++` and `x--` add or take away 1. They all need `let`.
- Comparisons (`> < >= <= === !==`) answer with `true` or `false`.
- Always use `===` and `!==`. Never `==` or `!=`.
- `&&` (AND), `||` (OR) and `!` (NOT) combine true/false answers.

---

**Next:** try the [exercises](exercises.md), then move on to [05 Numbers and Math](../05-numbers-and-math/notes.md).
