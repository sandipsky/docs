# 09 Functions

## What is it?

A **function** is a reusable block of code with a name. You write it once, and then you can run it whenever you like, just by using its name.

You've been using functions since chapter 01: `console.log()`, `Math.round()`, and `Number()` are all functions that someone else wrote. In this chapter, you'll write your own.

## Why does it matter?

Remember the end of [chapter 08](../08-loops/notes.md)? Your PIN check lived in one place, but a real phone needs it on the lock screen, in the banking app, and in the settings. Without functions, you'd copy and paste it everywhere. Then:

- Your program gets long and hard to read.
- When you find a bug, you have to fix every single copy (and you'll miss one).
- Nobody can tell what a chunk of code does without reading every line.

Functions fix all three. Programmers even have a motto for it: **DRY**, which stands for "Don't Repeat Yourself". Write the code once, give it a clear name like `checkPin`, and use it anywhere.

## Real-world example

A function is like a **coffee machine**.

| Coffee machine | Function |
|---|---|
| Someone builds the machine once | You **declare** (create) the function once |
| You press the button whenever you want a coffee | You **call** (run) the function whenever you need it |
| The machine has slots for water, beans, and milk | The function has **parameters** |
| The beans and milk you put in today | The **arguments** you pass in |
| The cup of coffee that comes out | The **return value** |

And here's the best part: you don't need to know how the machine works inside. You only need to know what to put in and what comes out. Functions are the same. Once one works, you can use it without thinking about its insides.

## How it works

### Declaring and calling a function

Here's a function for a cafe's welcome screen:

```js
function greetCustomer() {
  console.log("Welcome to Bean There Cafe!");
  console.log("What can I get you today?");
}

greetCustomer();
greetCustomer();
```

You'll see:

```
Welcome to Bean There Cafe!
What can I get you today?
Welcome to Bean There Cafe!
What can I get you today?
```

There are two separate steps here:

1. **Declaring** the function creates it. You write the keyword `function`, a name, parentheses `()`, and a block in curly braces. The code in the block is called the function's **body**. Declaring it doesn't run anything yet. It's like building the coffee machine.
2. **Calling** the function runs its body. You write its name followed by parentheses: `greetCustomer()`. That's pressing the button. Here we pressed it twice, so the body ran twice.

### Parameters and arguments

A welcome message is nicer with the customer's name in it. You can give a function **parameters**: names in the parentheses that stand for values you'll hand over later.

```js
function greetCustomer(name) {
  console.log(`Welcome, ${name}!`);
}

greetCustomer("Aisha"); // prints: Welcome, Aisha!
greetCustomer("Tom");   // prints: Welcome, Tom!
```

When you call `greetCustomer("Aisha")`, the value `"Aisha"` is called an **argument**. JavaScript puts it into the parameter `name`, and the body runs with it. The next call puts `"Tom"` in instead.

- **Parameter:** the empty slot in the machine (`name`). You write it when you *declare* the function.
- **Argument:** what you actually put in the slot (`"Aisha"`). You write it when you *call* the function.

A function can have several parameters, separated by commas. The arguments fill them **in order**: the first argument goes into the first parameter, and so on.

```js
function describeOrder(size, drink) {
  console.log(`One ${size} ${drink}, coming right up!`);
}

describeOrder("large", "latte"); // prints: One large latte, coming right up!
describeOrder("latte", "large"); // prints: One latte large, coming right up!
```

JavaScript doesn't know what the words mean. It just matches them up by position, so the order you pass them in matters.

### `return`: handing back a value

Most useful functions work something out and hand you the result. That's what `return` does:

```js
function calculateTip(bill, tipPercent) {
  return bill * tipPercent / 100;
}

const tip = calculateTip(40, 15);

console.log(tip);                            // prints: 6
console.log(`Total with tip: $${40 + tip}`); // prints: Total with tip: $46
```

When JavaScript reaches `return`, two things happen:

1. The function **stops** right there.
2. The value after `return` is **handed back** to the place where the function was called.

You can picture the call being swapped for its answer. `const tip = calculateTip(40, 15);` turns into `const tip = 6;`.

The value that comes back is called the **return value**. And if a function has no `return` at all, it still hands something back: `undefined`, which means "nothing".

### `console.log` vs `return` (read this twice)

Both seem to "give you the answer", so almost every beginner mixes them up at some point. But they do completely different jobs.

Think about the coffee machine again. When your latte is ready, two things can happen:

- The little **screen** on the machine lights up: "Your latte is ready!" That's `console.log`. It's a message for the person standing there. You can read it, but you can't drink it, and you can't do anything else with it.
- A **cup** comes out. That's `return`. You can pick it up, add sugar, carry it to your table, or hand it to a friend.

A machine that shows "Your latte is ready!" but never gives you a cup looks like it worked. But you've got nothing to drink.

Here are two functions for a pizza shop. Both add a $5 delivery fee to the price. One *shows* the answer. The other *returns* it:

```js
function showTotal(price) {
  console.log(price + 5); // the screen message
}

function getTotal(price) {
  return price + 5; // the cup
}

const shown = showTotal(20);   // prints: 25
const returned = getTotal(20); // (prints nothing)

console.log(shown);    // prints: undefined
console.log(returned); // prints: 25
```

Look at what happened:

- `showTotal(20)` printed `25` on the screen. But it didn't hand anything back, so `shown` got `undefined`. An empty cup.
- `getTotal(20)` didn't print anything. It quietly handed back `25`, and `returned` kept it.

The difference really shows when you try to *use* the answer. Say a customer places two orders like this one, each with its own delivery:

```js
console.log(showTotal(20) * 2);
```

You'll see:

```
25
NaN
```

`showTotal` printed its screen message (`25`), then handed back `undefined`. And `undefined * 2` is `NaN`: "not a number". The version with `return` just works:

```js
console.log(getTotal(20) * 2); // prints: 50
```

| | `console.log(value)` | `return value` |
|---|---|---|
| In the coffee machine | The screen message | The cup of coffee |
| Who gets the value? | You, reading the terminal | The code that called the function |
| Can you save it or do math with it? | No | Yes |
| Does it stop the function? | No | Yes |

**The rule of thumb:** if a function works something out, it should `return` the answer. Let the code that *calls* the function decide what to do with it: print it, save it, or use it in the next calculation.

`console.log` is still your best friend for *looking* at values while you write and test code. Just don't use it as a way to hand answers back.

### Returning early

Because `return` stops the function, you can use it to leave as soon as you know the answer. Here's a cash machine:

```js
function withdraw(balance, amount) {
  if (amount <= 0) {
    return "Please enter an amount above zero.";
  }
  if (amount > balance) {
    return "Sorry, you don't have enough money.";
  }
  return `Here's your $${amount}. New balance: $${balance - amount}.`;
}

console.log(withdraw(100, 30));  // prints: Here's your $30. New balance: $70.
console.log(withdraw(100, 500)); // prints: Sorry, you don't have enough money.
console.log(withdraw(100, -5));  // prints: Please enter an amount above zero.
```

This is the cleaner trick promised in [chapter 07](../07-conditionals/notes.md). Each problem case is checked at the top, and it leaves straight away with a `return`. These checks are called **guard clauses**. No `else`, no nesting: if the code gets past the guards, everything is fine, and the happy case sits at the bottom.

One thing to know: once a `return` runs, the rest of the function is skipped. A line like `console.log("Done!");` placed after the final `return` would never print.

### Default parameters

What happens if you forget an argument? The parameter gets `undefined`:

```js
function calculateTip(bill, tipPercent) {
  return bill * tipPercent / 100;
}

console.log(calculateTip(40)); // prints: NaN
```

`40 * undefined` isn't a number, so you get `NaN`. A **default parameter** gives a parameter a backup value, used only when the argument is missing:

```js
function calculateTip(bill, tipPercent = 15) {
  return bill * tipPercent / 100;
}

console.log(calculateTip(40));     // prints: 6 (uses the default 15%)
console.log(calculateTip(40, 20)); // prints: 8 (20% replaces the default)
```

Say the restaurant suggests a 15% tip, so that's the default. Anyone who wants to tip a different amount can still pass their own number.

### Function expressions

There's another way to create a function: make it without a name, and store it in a variable. This is called a **function expression**:

```js
const minutesToHours = function (minutes) {
  return minutes / 60;
};

console.log(minutesToHours(90)); // prints: 1.5
```

You call it the same way. Notice the semicolon after the closing `}`. The whole thing is one big `const` statement, just like `const age = 30;`.

One difference: you can call a function *declaration* on a line above the one where it's written, but not a function expression. Try that with an expression, and you get `ReferenceError: Cannot access 'minutesToHours' before initialization`. [Chapter 14](../14-scope-and-hoisting/notes.md) explains why.

### Arrow functions

An **arrow function** is a shorter way to write a function expression. You drop the word `function` and put an arrow `=>` (an equals sign and a greater-than sign) after the parentheses:

```js
const minutesToHours = (minutes) => {
  return minutes / 60;
};
```

It gets even shorter. When the body is just one value to return, you can drop the curly braces *and* the word `return`:

```js
const minutesToHours = (minutes) => minutes / 60;

console.log(minutesToHours(90)); // prints: 1.5
```

This is called an **implicit return**: the value after the arrow is returned automatically. Here are a few more shapes you'll see:

```js
const sayHello = () => "Hello!";    // no parameters: empty parentheses
const add = (a, b) => a + b;        // two parameters
const isAdult = (age) => age >= 18; // returns true or false

console.log(sayHello());  // prints: Hello!
console.log(add(2, 3));   // prints: 5
console.log(isAdult(15)); // prints: false
```

With exactly one parameter, the parentheses are optional (`age => age >= 18` works too), but this course always keeps them.

**Which style should I use?** You'll see all three in real code, so it's good to recognize them. In this course:

- Named functions, like `calculateTip`, are written as **function declarations**. They're easy to spot and can be called from anywhere in the file.
- **Arrow functions** are for short, small functions. They really shine when you hand a function to another function, which you'll start doing in [chapter 13](../13-array-methods/notes.md).

### Functions calling functions

A function can call other functions. That's how you build big programs: out of small pieces that each do one job well, like LEGO bricks.

Here's a food delivery receipt. Delivery is free for orders of $30 or more:

```js
function formatMoney(amount) {
  return `$${amount.toFixed(2)}`;
}

function getDeliveryFee(foodTotal) {
  return foodTotal >= 30 ? 0 : 4.99;
}

function printReceipt(foodTotal) {
  const fee = getDeliveryFee(foodTotal);
  console.log(`Food: ${formatMoney(foodTotal)}`);
  console.log(`Delivery: ${formatMoney(fee)}`);
  console.log(`Total: ${formatMoney(foodTotal + fee)}`);
}

printReceipt(25);
```

You'll see:

```
Food: $25.00
Delivery: $4.99
Total: $29.99
```

Each function is small and easy to understand on its own. `formatMoney` is used three times, but written only once. And if the delivery rules change, there's exactly one place to fix.

### Naming functions

A function *does* something, so give it a name that starts with a verb (an action word):

| Good name | Why it's good |
|---|---|
| `calculateTip` | Says exactly what it works out |
| `formatMoney` | Says what it does to the value |
| `printReceipt` | "print" tells you it shows something on the screen |
| `isAdult`, `hasDigit` | Starting with `is` or `has` tells you it returns `true` or `false` |

Avoid vague names like `doStuff`, `handle`, or `data`. And don't name a function like a value (`tip`, `total`): that sounds like a number, not an action. A good name means you can read `calculateTip(40)` and know what happens without looking inside.

### Functions are values

Here's something surprising: a function is a value, just like a number or a string. So you can store it in another variable:

```js
function shout(text) {
  return `${text.toUpperCase()}!`;
}

const yell = shout; // no parentheses: we're not calling it

console.log(yell("hello")); // prints: HELLO!
console.log(typeof shout);  // prints: function
console.log(shout);         // prints: [Function: shout]
```

The parentheses make all the difference:

- `shout` (no parentheses) is the function itself: the coffee machine.
- `shout("hi")` *calls* the function: pressing the button. You get back `"HI!"`.

Why would you ever pass a function around without calling it? Because later you'll hand functions to other functions, as instructions for what to do. That's called a **callback**, and it's the big idea of [chapter 13](../13-array-methods/notes.md).

### Variables inside a function stay inside

A variable created inside a function only exists inside that function. The parameters, too:

```js
function calculateBill(price) {
  const tip = price * 0.15;
  return price + tip;
}

console.log(calculateBill(40)); // prints: 46
console.log(tip);
// ReferenceError: tip is not defined
```

Think of a restaurant kitchen. The chef uses bowls, knives, and chopping boards in there, but only the finished dish comes out through the hatch. `tip` is one of the kitchen bowls. The dish is the return value.

It works one way only: code inside a function *can* see variables created outside it, but code outside can't see in. This is called **scope**, and [chapter 14](../14-scope-and-hoisting/notes.md) tells the full story.

## Common mistakes

**1. Declaring a function but never calling it**

```js
function showWelcome() {
  console.log("Welcome to the gym!");
}
```

You run the file and... nothing happens. Declaring a function only builds the machine. Nothing runs until you press the button. Fix: add `showWelcome();` below it.

**2. Forgetting the parentheses**

```js
function getGreeting() {
  return "Good morning!";
}

console.log(getGreeting); // prints: [Function: getGreeting]
```

Without `()`, you're pointing at the machine instead of pressing its button. Fix: `console.log(getGreeting());`

**3. Printing the answer instead of returning it**

```js
function calculateArea(width, height) {
  console.log(width * height);
}

const area = calculateArea(4, 5); // prints: 20
console.log(`The room is ${area} square meters.`);
// prints: The room is undefined square meters.
```

The function showed `20` on the screen, but handed nothing back, so `area` is `undefined`. It's the screen message without the cup. Fix: `return width * height;`

**4. Using curly braces in an arrow function, but no `return`**

```js
const double = (number) => { number * 2 };

console.log(double(5)); // prints: undefined
```

The implicit return only works *without* curly braces. Once you add braces, it's a normal function body again, and a normal body needs `return`. Fix: `(number) => number * 2`, or `(number) => { return number * 2; }`.

**5. Passing arguments in the wrong order**

```js
function calculateSpeed(distanceKm, hours) {
  return distanceKm / hours;
}

console.log(calculateSpeed(2, 120)); // prints: 0.016666666666666666
```

We meant "120 km in 2 hours", but the arguments went into the wrong slots. There's no error, just a wrong answer, which makes this one sneaky. Fix: `calculateSpeed(120, 2)` gives `60`. Clear parameter names like `distanceKm` help you spot the mix-up.

## Quick recap

- A function is a named, reusable block of code. Declare it once with `function name() { ... }`, then call it with `name()` as often as you like.
- **Parameters** are the slots in the declaration. **Arguments** are the real values you pass in when you call it. They're matched by position.
- `return` hands a value back and stops the function. With no `return`, a function gives back `undefined`.
- `console.log` shows a value to *you*. `return` gives it to *your code*. If a function works something out, return it.
- Guard clauses (early `return`s) handle problem cases first. Default parameters (`tipPercent = 15`) fill in missing arguments.
- Function expressions and arrow functions store a function in a variable. An arrow function without curly braces returns its value automatically.
- Name functions with verbs. Functions are values, and variables created inside a function stay inside it.

---

**Next:** try the [exercises](exercises.md), then move on to [10 Arrays](../10-arrays/notes.md).
