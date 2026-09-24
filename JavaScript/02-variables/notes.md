# 02 Variables

## What is it?

A **variable** is a labeled box that holds a value. You give the box a name, put something inside, and then use the name whenever you need what's inside.

A **value** is a single piece of information, like the number `25` or the text `"Sandip"`.

## Why does it matter?

Remember the last exercise in [chapter 01](../01-getting-started/exercises.md), "Your life in numbers"? Your code probably looked something like this:

```js
console.log("Days alive:", 25 * 365);
console.log("Hours alive:", 25 * 365 * 24);
console.log("Minutes alive:", 25 * 365 * 24 * 60);
```

It works, but the age `25` is typed three times. When your birthday comes, you have to find and change every single one. Miss one, and your program quietly gives a wrong answer.

With a variable, you write the age once and use its name everywhere else. (You'll learn exactly how `const` works in a moment.)

```js
const age = 25;
console.log("Days alive:", age * 365);
console.log("Hours alive:", age * 365 * 24);
console.log("Minutes alive:", age * 365 * 24 * 60);
```

You'll see:

```
Days alive: 9125
Hours alive: 219000
Minutes alive: 13140000
```

Same result, but now the age lives in one place. Change `25` to `26`, run the file again, and every line updates by itself.

Variables also make code easier to read. `age * 365` tells you what's going on. With `25 * 365`, you have to guess what the 25 means.

## Real-world example

Think about moving house. You pack your things into boxes and write a label on each one: "Kitchen", "Books", "Winter clothes". Later, you don't open every box to find the plates. You read the labels.

Variables work the same way:

| Moving house | JavaScript |
|---|---|
| A box | A variable |
| The label on the box ("Books") | The variable's name (`age`) |
| What's inside the box | The value (`25`) |
| Putting something in the box | Assigning a value |
| Emptying the box and putting something new in | Reassigning (only allowed with `let`) |
| A locked glass case, like in a museum | A `const`: you can see what's inside, but you can't swap it for something else |

## How it works

### Creating a variable

```js
let score = 0;
console.log(score); // prints: 0
```

Here's the first line, piece by piece:

| Piece | What it means |
|---|---|
| `let` | "I'm making a new box." |
| `score` | The label on the box: the variable's **name** |
| `=` | "Put this value in the box." |
| `0` | The value that goes inside |
| `;` | The end of the statement, like in chapter 01 |

Creating a variable is called **declaring** it. Putting a value into it is called **assigning** a value. This line does both at once.

To get the value back out, write the name with no quotes, like `console.log(score)`.

> **Watch out:** In JavaScript, `=` doesn't mean "is equal to" like in math class. It means "put the value on the right into the box on the left". (Checking whether two values are equal comes in [chapter 04](../04-operators/notes.md).)

### Changing the value

The whole point of `let` is that the value can change later. Picture a game where you start with 3 lives:

```js
let lives = 3;
console.log("Lives:", lives); // prints: Lives: 3

lives = 2;
console.log("Lives:", lives); // prints: Lives: 2
```

The second time, there's no `let`. The box already exists, so you only put a new value into it. This is called **reassigning**.

The old value, `3`, is gone. A box holds one value at a time.

### Updating from the old value

Often the new value depends on the old one. You score 10 points, so your score goes up by 10:

```js
let score = 0;
score = score + 10;
console.log(score); // prints: 10

score = score + 5;
console.log(score); // prints: 15
```

`score = score + 10` looks strange if you read it like a math equation. Read it in two steps instead:

1. **Right side first:** take what's in `score` (0) and add 10. That gives 10.
2. **Then the left side:** put that 10 back into `score`.

You'll use this pattern all the time: a bank balance after a deposit, the steps on a fitness tracker, the number of items in a basket.

> **Tip:** There's a shorter way to write `score = score + 10`. You'll learn it in [chapter 04](../04-operators/notes.md).

### `const`: a value that stays put

Some values should never change once they're set: your birth year, the number of days in a week, the name of your shop. For those, use `const` (short for "constant"):

```js
const daysInWeek = 7;
console.log(daysInWeek); // prints: 7
```

If you try to change it, JavaScript stops you:

```js
const birthYear = 1998;
birthYear = 2000;
// TypeError: Assignment to constant variable.
```

That error is a good thing. It catches the mistake straight away, instead of letting a wrong value sneak into the rest of your program.

A `const` also needs its value right away. An empty locked case is no use to anyone, because you could never put anything in it:

```js
const city;
// SyntaxError: Missing initializer in const declaration
```

The **initializer** is the `= value` part that gives a variable its first value.

### `let` or `const`?

Here's the rule most JavaScript developers follow:

> Use `const` by default. Switch to `let` only when you know the value will change.

Why start with `const`? It protects values that shouldn't change. It also tells anyone reading your code: "this stays the same, you don't need to keep an eye on it."

| Value | Does it change while the program runs? | Use |
|---|---|---|
| Your name | No | `const` |
| The price of a movie ticket | No | `const` |
| Days in a week | No | `const` |
| The score in a game | Yes, every time you score | `let` |
| The balance of a bank account | Yes, with every deposit | `let` |

Not sure? Pick `const`. If you later need to change it, JavaScript will tell you with the error above, and you can switch it to `let`.

### Using variables in calculations

You can do math with variables, just like with plain numbers. And you can store the result in a new variable. Say four friends each order a pizza and a drink:

```js
const pizzaPrice = 15;
const drinkPrice = 3;
const people = 4;

const costPerPerson = pizzaPrice + drinkPrice;
const totalCost = costPerPerson * people;

console.log("Each person pays:", costPerPerson); // prints: Each person pays: 18
console.log("Total:", totalCost); // prints: Total: 72
```

Giving each step its own name makes the calculation easy to follow. Anyone can read `costPerPerson * people` and understand it, without doing the math in their head.

Notice there are no quotes around the variable names. Quotes would turn a name into plain text:

```js
const people = 4;
console.log("people"); // prints: people
console.log(people); // prints: 4
```

### A box with nothing in it yet

You can create a `let` variable without putting anything in it. It's like a raffle: you know there will be a winner, but not who it is yet.

```js
let winner;
console.log(winner); // prints: undefined

winner = "Maya";
console.log(winner); // prints: Maya
```

`undefined` is JavaScript's way of saying "this box is empty, nothing has been put in it yet". You'll learn more about it in [chapter 03](../03-data-types/notes.md).

(This only works with `let`. Remember, a `const` must get its value straight away.)

### Naming rules

JavaScript is strict about what a name can look like:

- Use only letters, digits, `_` (underscore) and `$` (dollar sign). No spaces and no dashes.
- A name can't start with a digit.
- A name can't be a **reserved word**: a word JavaScript already uses for itself, like `let`, `const`, `if`, `for`, `function`, `return`, `class` or `new`.
- Names are case-sensitive: `score` and `Score` would be two different boxes.

| Name | Allowed? | Why |
|---|---|---|
| `playerName` | Yes | Only letters |
| `player2` | Yes | Digits are fine after the first character |
| `_count`, `$price` | Yes | `_` and `$` are allowed |
| `2ndPlace` | No | Starts with a digit |
| `first name` | No | Has a space |
| `player-name` | No | JavaScript reads the `-` as a minus sign |
| `new` | No | Reserved word |

If you break a rule, JavaScript refuses to run the file at all:

```js
let 2ndPlace = "Sam";
// SyntaxError: Invalid or unexpected token
```

```js
let player-name = "Sam";
// SyntaxError: Unexpected token '-'
```

### Good names: camelCase and meaning

When a name is made of several words, JavaScript developers write it in **camelCase**: the first word is all lowercase, and every word after it starts with a capital letter. The capitals stick up like the humps on a camel.

```
firstName    totalPrice    numberOfGuests    highScore
```

A good name also tells you what's inside the box. These two programs do exactly the same thing:

```js
const a = 12;
const b = 3;
console.log(a * b); // prints: 36
```

```js
const ticketPrice = 12;
const ticketCount = 3;
console.log(ticketPrice * ticketCount); // prints: 36
```

In the first one, you have to guess what `a` and `b` are. The second one explains itself. Names cost nothing, so make them clear. A longer name is fine if it's clearer: `minutesPerDay` beats `mpd`.

### What about `var`?

You'll sometimes see a third way to make a variable, especially in older code and tutorials:

```js
var city = "Lisbon";
console.log(city); // prints: Lisbon
```

`var` is the old way. Before 2015, it was the only way to create a variable. Then `let` and `const` arrived to fix some confusing things `var` does (you'll see exactly what in [chapter 14](../14-scope-and-hoisting/notes.md)).

So recognize `var` when you see it, but don't write it yourself. Use `const` and `let`.

## Common mistakes

**1. Using `let` again when changing a value**

```js
let score = 0;
let score = 5;
// SyntaxError: Identifier 'score' has already been declared
```

An **identifier** is another word for a name. `let` makes a new box, and you can't have two boxes with the same label. To change the value, leave out `let`: `score = 5;`

**2. Trying to change a `const`**

```js
const maxPlayers = 4;
maxPlayers = 5;
// TypeError: Assignment to constant variable.
```

If the value really needs to change, declare it with `let` instead. If it shouldn't change, the error just saved you from a bug.

**3. Putting the name in quotes**

```js
const city = "Lisbon";
console.log("city"); // prints: city
```

Quotes make it text, so you get the word "city", not what's in the box. Fix: `console.log(city);`

**4. A typo or the wrong capital letters**

```js
const totalPrice = 50;
console.log(totalprice);
// ReferenceError: totalprice is not defined
```

JavaScript is case-sensitive (remember chapter 01?). There's no box called `totalprice`, only one called `totalPrice`. Copy names exactly.

**5. Using a variable before creating it**

```js
console.log(total);
const total = 50;
// ReferenceError: Cannot access 'total' before initialization
```

Code runs from top to bottom, so line 1 tries to open a box that doesn't exist yet. Create the variable first, then use it. ([Chapter 14](../14-scope-and-hoisting/notes.md) explains this error in more detail.)

**6. Writing the assignment backwards**

```js
let total = 0;
100 = total;
// SyntaxError: Invalid left-hand side in assignment
```

The box always goes on the left of `=`, and the value on the right. Fix: `total = 100;`

## Quick recap

- A variable is a labeled box: a name that holds a value.
- `const` makes a variable that can't be reassigned. `let` makes one that can.
- Use `const` by default. Use `let` only when the value will change.
- `=` means "put the value on the right into the box on the left". To update a value from its old one, write `score = score + 10;`.
- Names use letters, digits, `_` and `$`, can't start with a digit, and are case-sensitive. Write them in camelCase and make them meaningful.
- A `let` variable declared without a value holds `undefined`.
- `var` is the old way. Recognize it, but write `let` and `const`.

---

**Next:** try the [exercises](exercises.md), then move on to [03 Data Types](../03-data-types/notes.md).
