# 08 Loops

## What is it?

A **loop** runs the same block of code again and again, as many times as you need. Each trip through the loop is called an **iteration** (or a "round").

## Why does it matter?

Say you want to print the numbers from 1 to 100. Without a loop, that's 100 lines of `console.log`. With a loop, it's 3 lines. Need 1 to 1,000 instead? You change one number.

Real programs repeat things all the time:

- Count down the seconds on a timer.
- Add interest to a savings account, year after year.
- Check every character of a password.
- Give someone 3 attempts to type their PIN.

Remember the login exercise in [chapter 07](../07-conditionals/notes.md), where you ran the file again for every attempt? A loop lets your program do the repeating for you.

## Real-world example

You repeat things every day. The way you decide when to stop tells you which loop to use:

| Everyday task | What you know | Loop |
|---|---|---|
| "Do 10 push-ups." | Exactly how many times | `for` |
| "Stir the sauce until it thickens." | When to stop, but not how many stirs that takes | `while` |
| "Taste the soup and add salt, until it tastes right." | You always taste at least once | `do...while` |

Every loop needs a way to stop. Push-ups stop at 10. Stirring stops when the sauce is thick. A loop that never stops is a real problem, and you'll see why later.

## How it works

### The `for` loop

Use `for` when you know how many times to repeat. Here are 5 push-ups:

```js
for (let rep = 1; rep <= 5; rep++) {
  console.log(`Push-up number ${rep}`);
}
```

You'll see:

```
Push-up number 1
Push-up number 2
Push-up number 3
Push-up number 4
Push-up number 5
```

The line in parentheses has three parts, separated by semicolons:

| Part | Code | When it runs | Its job |
|---|---|---|---|
| Start | `let rep = 1` | Once, before anything else | Creates the **counter**: a variable that keeps track of the rounds |
| Condition | `rep <= 5` | Before every round | Keep going while this is `true`. Stop as soon as it's `false` |
| Step | `rep++` | After every round | Moves the counter forward (`++` adds 1, from [chapter 04](../04-operators/notes.md)) |

Here's the loop, one round at a time:

| Round | `rep` | `rep <= 5`? | What happens |
|---|---|---|---|
| 1 | 1 | `true` | prints `Push-up number 1`, then `rep` becomes 2 |
| 2 | 2 | `true` | prints `Push-up number 2`, then `rep` becomes 3 |
| ... | ... | ... | ... |
| 5 | 5 | `true` | prints `Push-up number 5`, then `rep` becomes 6 |
| - | 6 | `false` | the loop ends |

You'll often see the counter called `i` (short for "index"). It's one of the few places where a one-letter name is normal.

### Counting in different ways

The three parts can do more than count up by one. A rocket countdown starts high and goes down with `--`:

```js
for (let seconds = 5; seconds >= 1; seconds--) {
  console.log(seconds);
}
console.log("Liftoff!");
```

You'll see:

```
5
4
3
2
1
Liftoff!
```

And `+=` lets you take bigger steps. Here's a bus timetable, with a bus every 15 minutes:

```js
for (let minute = 0; minute < 60; minute += 15) {
  console.log(`A bus leaves at 9:${String(minute).padStart(2, "0")}`);
}
```

You'll see:

```
A bus leaves at 9:00
A bus leaves at 9:15
A bus leaves at 9:30
A bus leaves at 9:45
```

(`padStart` from [chapter 06](../06-strings/notes.md) turns `0` into `00`.)

### The `while` loop

Sometimes you don't know how many rounds you'll need. You only know when to stop.

You put $1,000 in a savings account that pays 5% interest each year. How many years until you have $1,500? You could work it out with a pen and paper... or let a loop try year after year:

```js
let balance = 1000;
let years = 0;

while (balance < 1500) {
  balance = balance * 1.05; // add 5% interest
  years++;
}

console.log(`After ${years} years, you'll have $${balance.toFixed(2)}.`);
// prints: After 9 years, you'll have $1551.33.
```

`while` checks its condition before every round, just like `for`. As long as the condition is `true`, the block runs again. The moment it's `false`, the loop ends and the program moves on.

A `while` loop has no built-in counter or step. So *you* must make sure that something inside the block changes, so the condition eventually becomes `false`. Here, `balance` grows every round.

### The `do...while` loop

A `do...while` loop runs the block **first** and checks the condition **after**. So it always runs at least once.

That's perfect for a board game: you always roll the dice at least once, and you keep rolling until you get a 6:

```js
let roll;
let rolls = 0;

do {
  roll = Math.floor(Math.random() * 6) + 1; // a random whole number from 1 to 6
  rolls++;
  console.log(`You rolled a ${roll}`);
} while (roll !== 6);

console.log(`Got a 6 after ${rolls} ${rolls === 1 ? "roll" : "rolls"}!`);
```

The rolls are random (remember `Math.random()` from [chapter 05](../05-numbers-and-math/notes.md)?), so your output will be different. Here's one run:

```
You rolled a 4
You rolled a 3
You rolled a 6
Got a 6 after 3 rolls!
```

To see the "at least once" part clearly, compare the two loops when the condition is `false` from the very start:

```js
const lives = 0;

while (lives > 0) {
  console.log("while: playing");
}

do {
  console.log("do...while: playing");
} while (lives > 0);
// prints: do...while: playing
```

The `while` loop checks first, sees `false`, and never runs. The `do...while` loop runs once before it checks.

### Infinite loops (and how to stop them)

An **infinite loop** is a loop whose condition never becomes `false`, so it never stops. It's one of the most common beginner bugs:

```js
let count = 1;

while (count <= 3) {
  console.log(count);
  // oops: we forgot count++
}
```

`count` stays `1` forever, so `1 <= 3` is always `true`. Your terminal fills up with `1`s, over and over, as fast as your computer can print them.

**Don't panic.** Click in the terminal and press **`Ctrl + C`**. That stops the running program straight away. Then fix the loop so something changes every round (here, add `count++`).

In the browser console, an infinite loop freezes the whole tab. Close the tab and open a new one.

> **Tip:** before you run a new loop, ask yourself: "What changes each round, and when does the condition become `false`?" If you can't answer, the loop might never end.

### Looping over a string

Remember from [chapter 06](../06-strings/notes.md) that every character in a string has an index, starting at 0? A `for` loop can walk through those indexes one by one:

```js
const word = "cat";

for (let i = 0; i < word.length; i++) {
  console.log(`Position ${i}: ${word[i]}`);
}
```

You'll see:

```
Position 0: c
Position 1: a
Position 2: t
```

Notice the condition is `i < word.length`, not `<=`. `"cat"` has a length of 3, but its last index is 2.

When you only need the characters themselves, not their positions, there's a shorter loop. **`for...of`** hands you each character in turn:

```js
for (const letter of "cat") {
  console.log(letter);
}
```

You'll see:

```
c
a
t
```

No counter, no condition, no step, and no way to get the index wrong. Read it as "for each letter of this string". (You can use `const` here, because every round gets a brand-new `letter` variable.)

Loops and `if` make a great team. Here's how you count how many times a letter appears:

```js
const river = "Mississippi";
let count = 0;

for (const letter of river) {
  if (letter === "s") {
    count++;
  }
}

console.log(`"s" appears ${count} times in ${river}.`);
// prints: "s" appears 4 times in Mississippi.
```

`count` is created *before* the loop, so it survives from round to round and keeps the running total.

You need the index version when you want to go backwards. This loop starts at the last character and builds a new string, one character at a time. (Remember from [chapter 04](../04-operators/notes.md) that `+=` works on strings too: it adds to the end.)

```js
const word = "stressed";
let reversed = "";

for (let i = word.length - 1; i >= 0; i--) {
  reversed += word[i];
}

console.log(reversed); // prints: desserts
```

### `break`: stop the loop early

`break` jumps out of a loop straight away, even if the condition is still `true`. (Yes, it's the same `break` you used in `switch`.)

A website checks that a new password contains at least one digit. As soon as it finds one, there's no point checking the rest:

```js
const password = "sunny7day";

for (const character of password) {
  if ("0123456789".includes(character)) {
    console.log(`Found a digit: ${character}`);
    break;
  }
  console.log(`Checked ${character}`);
}
```

You'll see:

```
Checked s
Checked u
Checked n
Checked n
Checked y
Found a digit: 7
```

The loop never looks at `d`, `a`, or `y`. It found what it needed and stopped.

### `continue`: skip to the next round

`continue` skips the rest of the current round and jumps to the next one. The loop keeps going.

Many hotels don't have a 13th floor, because some people think 13 is unlucky. Here's the hotel's elevator:

```js
for (let floor = 10; floor <= 15; floor++) {
  if (floor === 13) {
    continue; // skip floor 13
  }
  console.log(`Floor ${floor}`);
}
```

You'll see:

```
Floor 10
Floor 11
Floor 12
Floor 14
Floor 15
```

The difference in one sentence: `break` leaves the loop for good, `continue` only skips one round.

### Nested loops

A loop can go inside another loop. This is a **nested loop**. The inner loop runs all the way through, from start to finish, for *every single round* of the outer loop.

Think of a clock. The minute hand goes all the way around for every one step of the hour hand:

```js
for (let hour = 9; hour <= 10; hour++) {
  for (let minute = 0; minute < 60; minute += 20) {
    console.log(`${hour}:${String(minute).padStart(2, "0")}`);
  }
}
```

You'll see:

```
9:00
9:20
9:40
10:00
10:20
10:40
```

The outer loop runs 2 times, and the inner loop runs 3 times for each of those. That's 2 × 3 = 6 lines.

Nested loops are how you build anything with rows and columns. Here's a multiplication table. The outer loop makes the rows. The inner loop builds each row as a string, one number at a time, and then the row is printed:

```js
for (let row = 1; row <= 4; row++) {
  let line = "";

  for (let column = 1; column <= 4; column++) {
    line += String(row * column).padStart(4);
  }

  console.log(line);
}
```

You'll see:

```
   1   2   3   4
   2   4   6   8
   3   6   9  12
   4   8  12  16
```

`padStart(4)` makes every number 4 characters wide, so the columns line up.

The inner loop doesn't have to run the same number of times in every round. Here, it runs `row` times, so each row gets one more star than the row before it:

```js
for (let row = 1; row <= 4; row++) {
  let stars = "";

  for (let i = 1; i <= row; i++) {
    stars += "*";
  }

  console.log(stars);
}
```

You'll see:

```
*
**
***
****
```

(`"*".repeat(row)` from chapter 06 would give you the same row in one step. Now you know how much work it saves you!)

### Choosing the right loop

| Your situation | Use |
|---|---|
| You know how many times to repeat (10 push-ups, the numbers 1 to 100) | `for` |
| You want every character of a string | `for...of` |
| You need each character's position, or want to go backwards | `for` with an index |
| You repeat until something happens, but don't know when (a savings goal) | `while` |
| Same, but it must run at least once (rolling dice) | `do...while` |

When in doubt, start with `for` or `for...of`. They're the most common by far, and you'll use `for...of` a lot with lists in [chapter 10](../10-arrays/notes.md).

## Common mistakes

**1. Going one step too far (or not far enough)**

```js
const word = "cat";

for (let i = 0; i <= word.length; i++) {
  console.log(word[i]);
}
```

You'll see:

```
c
a
t
undefined
```

This is called an **off-by-one error**: the loop runs one time too many or one time too few. It's so common that programmers joke about it. Here, `<=` lets `i` reach 3, but the last index of `"cat"` is 2. Fix: `i < word.length`.

The opposite happens too. Start at `let i = 1` and you skip the first letter. When a loop looks wrong, check the first round and the last round.

**2. Using `const` for the counter**

```js
for (const lap = 1; lap <= 3; lap++) {
  console.log(`Lap ${lap}`);
}
// prints: Lap 1
// TypeError: Assignment to constant variable.
```

The first round works. Then `lap++` tries to change `lap`, and a `const` can't be changed ([chapter 02](../02-variables/notes.md)). Fix: `for (let lap = 1; ...)`. (In a `for...of` loop, `const` is fine, because every round gets a new variable.)

**3. Creating the running total inside the loop**

```js
const fruit = "banana";

for (const letter of fruit) {
  let count = 0;
  if (letter === "a") {
    count++;
  }
}

console.log(count);
// ReferenceError: count is not defined
```

Two problems in one. A variable created inside the loop's `{ }` is brand new in every round, so it starts from 0 again each time. And it doesn't exist outside the braces at all. Fix: create `let count = 0;` *before* the loop, like the Mississippi example.

**4. Forgetting to change anything**

If nothing inside a `while` loop changes the variable in its condition, the loop never ends. Press `Ctrl + C` to stop it, then add the missing step (like `count++`). See [Infinite loops](#infinite-loops-and-how-to-stop-them) above.

## Quick recap

- A loop repeats a block of code. Every loop needs a way to stop.
- `for (start; condition; step)` is best when you know how many rounds you need.
- `while` checks first and repeats until the condition is `false`. `do...while` always runs at least once.
- `for...of` gives you each character of a string. Use a `for` loop with an index when you need positions, and use `i < text.length`, not `<=`.
- `break` leaves the loop early. `continue` skips to the next round.
- In a nested loop, the inner loop runs completely for every round of the outer loop.
- Stuck in an infinite loop? Press `Ctrl + C` in the terminal.

---

**Next:** try the [exercises](exercises.md), then move on to [09 Functions](../09-functions/notes.md).
