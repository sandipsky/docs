# 17 Recursion

## What is it?

**Recursion** is when a function calls itself.

Each call works on a smaller piece of the problem. The calls stop when the piece is so small that the function can answer it straight away, without calling itself again.

## Why does it matter?

Some problems are shaped like "a thing that contains smaller things of the same kind":

- Folders that contain files and more folders, which contain more files and folders...
- Comments with replies, and replies to those replies.
- A shop menu with categories, subcategories, and sub-subcategories.

A loop is great for walking along a flat list. But with nested data like this, you often don't know how many levels deep it goes. A recursive function can handle any depth, because it treats every level the same way: by calling itself again.

Recursion also helps you understand the **call stack**, which is behind the lines of `at ...` that Node prints under every error message.

> Recursion feels strange to almost everyone at first. That's normal. Go slowly, and trace the small examples on paper. It clicks with practice.

## Real-world example

Think of **Russian nesting dolls**. To find the tiniest doll, you open the big doll. There's a smaller doll inside, so you do the same thing again: open it. You keep going until you reach a solid little doll that doesn't open. Then you stop.

| Nesting dolls | Recursion |
|---|---|
| Open a doll and find a smaller doll inside | The function calls itself with a smaller problem |
| Do the same thing to each smaller doll | Each call runs the same function again |
| The tiny solid doll that doesn't open | The **base case**: where the calls stop |
| Putting the dolls back together, smallest first | The answers coming back, from the innermost call outward |

Now picture standing between two mirrors: a reflection inside a reflection inside a reflection, on and on forever. That's recursion *without* a stopping point. Later in this chapter you'll see what happens when a program tries that.

## How it works

### A first example: countdown

In [chapter 08](../08-loops/notes.md) you wrote countdowns with loops. Here's a countdown written with recursion instead:

```js
function countdown(n) {
  if (n === 0) {
    console.log("Liftoff!");
    return; // stop here: no more calls
  }
  console.log(n);
  countdown(n - 1); // call itself with a smaller number
}

countdown(3);
```

You'll see:

```
3
2
1
Liftoff!
```

Let's walk through it slowly:

1. `countdown(3)` runs. `n` is 3, not 0, so it prints `3` and calls `countdown(2)`.
2. `countdown(2)` runs. It prints `2` and calls `countdown(1)`.
3. `countdown(1)` runs. It prints `1` and calls `countdown(0)`.
4. `countdown(0)` runs. This time `n` is 0, so it prints `Liftoff!` and returns. No more calls.

Here's the same thing as a **call trace**, where each call is indented under the call that started it:

```
countdown(3)   → prints 3, then calls countdown(2)
  countdown(2)   → prints 2, then calls countdown(1)
    countdown(1)   → prints 1, then calls countdown(0)
      countdown(0)   → prints "Liftoff!" and stops
```

Each call is a separate run of the same function, with its own `n`. Remember from [chapter 14](../14-scope-and-hoisting/notes.md) that every call to a function gets a fresh set of its own variables. So there are four different `n`s here, one per call: 3, 2, 1, and 0.

### The two parts every recursive function needs

1. A **base case**: the situation where the function stops and answers directly, without calling itself. In `countdown`, that's when `n === 0`.
2. A **recursive case**: the function calls itself with a *smaller* problem, one step closer to the base case. In `countdown`, that's `countdown(n - 1)`.

Before you run any recursive function, check two things:

- Is there a base case?
- Does every call get closer to it?

If either answer is "no", the calls never stop. You'll see what happens then in a moment.

### Getting a value back: factorial

`countdown` only prints. Most recursive functions **return** a value, and that's where recursion gets really useful.

The **factorial** of a number is that number multiplied by every whole number below it, down to 1. It's written with an exclamation mark:

```
4! = 4 × 3 × 2 × 1 = 24
```

In real life, 4! is the number of different ways you can arrange 4 books on a shelf.

Now look at this pattern:

```
4! = 4 × 3 × 2 × 1  =  4 × 3!
3! = 3 × 2 × 1      =  3 × 2!
2! = 2 × 1          =  2 × 1!
1! = 1
```

A factorial is "the number, times the factorial of the number below it". The problem contains a smaller copy of itself. That's the sign that recursion is a good fit.

```js
function factorial(n) {
  if (n <= 1) {
    return 1; // base case (it also covers 0, because 0! is 1 too)
  }
  return n * factorial(n - 1); // recursive case
}

console.log(factorial(4)); // prints: 24
```

But how does `factorial(4)` actually work it out? Imagine a line of people, and you ask the first one: "What's 4!?"

- Person 1: "I don't know yet. But it's 4 × 3!, so I'll ask the next person for 3! and wait."
- Person 2: "3! is 3 × 2!. I'll ask the next person and wait."
- Person 3: "2! is 2 × 1!. I'll ask the next person and wait."
- Person 4: "1! is 1. I know that one!" (That's the base case.)

Now the answers travel back up the line:

- Person 3: "Then 2! is 2 × 1 = 2."
- Person 2: "Then 3! is 3 × 2 = 6."
- Person 1: "Then 4! is 4 × 6 = 24."

Here's the same story as a trace. Going down, each call waits. Coming back up, each call finishes its multiplication:

```
factorial(4)
= 4 * factorial(3)
      = 3 * factorial(2)
            = 2 * factorial(1)
                  = 1            ← base case: no more calls
            = 2 * 1 = 2
      = 3 * 2 = 6
= 4 * 6 = 24
```

This is the most important idea in the chapter: **each call waits for the answer from the smaller call it made, and the work finishes on the way back up.**

### Watch it happen

You can make JavaScript print that trace for you. This version has a second parameter, `depth`, which is only there to indent the messages. `"  ".repeat(depth)` from [chapter 06](../06-strings/notes.md) makes two spaces per level:

```js
function factorial(n, depth = 0) {
  const indent = "  ".repeat(depth);
  console.log(`${indent}factorial(${n}) called`);

  if (n <= 1) {
    console.log(`${indent}factorial(${n}) returns 1`);
    return 1;
  }

  const result = n * factorial(n - 1, depth + 1);
  console.log(`${indent}factorial(${n}) returns ${result}`);
  return result;
}

factorial(4);
```

You'll see:

```
factorial(4) called
  factorial(3) called
    factorial(2) called
      factorial(1) called
      factorial(1) returns 1
    factorial(2) returns 2
  factorial(3) returns 6
factorial(4) returns 24
```

Read it from top to bottom: four calls go *in*, deeper and deeper. Then four answers come back *out*, in the reverse order. Whenever a recursive function confuses you, add logs like these and watch what it does.

### The call stack: a stack of plates

How does JavaScript keep track of all those calls that are waiting? It uses the **call stack**: a list of every function call that has started but hasn't finished yet.

Think of a stack of plates. Each time a function is called, a new plate goes on **top** of the stack. Only the top plate is being worked on. When that function returns, its plate is taken off, and the plate underneath carries on from where it was waiting.

Here's the stack while `factorial(3)` runs, at five moments in time:

```
                              factorial(1)
               factorial(2)   factorial(2)   factorial(2)
factorial(3)   factorial(3)   factorial(3)   factorial(3)   factorial(3)
────────────   ────────────   ────────────   ────────────   ────────────
    (1)            (2)            (3)            (4)            (5)
```

1. `factorial(3)` is called, and its plate goes on the stack.
2. It needs `factorial(2)`, so a new plate goes on top. `factorial(3)` waits underneath.
3. `factorial(2)` needs `factorial(1)`, so another plate goes on top. That's the base case, so it can answer straight away.
4. `factorial(1)` returns `1`, and its plate comes off. `factorial(2)` is on top again, and finishes: `2 * 1 = 2`.
5. `factorial(2)` returns `2`, and its plate comes off. Now `factorial(3)` finishes: `3 * 2 = 6`. It returns `6`, and the stack is empty.

You've actually seen the call stack already. When an error crashes your program, the lines starting with `at ...` under the message are the call stack at that moment. [Chapter 18](../18-error-handling/notes.md) shows you how to read them.

### When the calls never stop

What if there's no base case? Like the two mirrors, the calls go on and on. But a computer can't go on forever: the call stack only has room for so many plates.

```js
function countdown(n) {
  console.log(n);
  countdown(n - 1); // no base case: nothing ever stops it
}

countdown(3);
```

This prints 3, 2, 1, 0, -1, -2, and on and on, thousands of numbers. Then it crashes. Near the bottom of the output, you'll find this error:

```
RangeError: Maximum call stack size exceeded
```

The stack of plates got too tall and toppled over. This is called a **stack overflow**. How many calls fit depends on your computer, your Node version, and the function itself, but it's roughly ten thousand for small functions like this one.

The fix is always one of the two checks from earlier: add a base case, or make sure every call really moves closer to it.

### Adding up an array

Recursion works on arrays too. Here's the idea in plain words: **the sum of a list is the first number, plus the sum of the rest.** And the sum of an empty list is 0. That's the base case.

```js
function sum(numbers) {
  if (numbers.length === 0) {
    return 0; // base case: an empty list adds up to 0
  }
  const [first, ...rest] = numbers; // destructuring from chapter 15
  return first + sum(rest);
}

console.log(sum([5, 10, 20])); // prints: 35
```

`[first, ...rest]` unpacks the first number and collects all the others into `rest`, just like in [chapter 15](../15-destructuring-spread-rest/notes.md). Each call gets a shorter list, so the calls always reach the empty list in the end:

```
sum([5, 10, 20])
= 5 + sum([10, 20])
      = 10 + sum([20])
             = 20 + sum([])
                    = 0          ← base case
             = 20 + 0 = 20
      = 10 + 20 = 30
= 5 + 30 = 35
```

(`numbers.slice(1)` from chapter 10 would work instead of the destructuring too. It gives you everything except the first item.)

To be honest, for adding up a flat list, `reduce` from [chapter 13](../13-array-methods/notes.md) or a plain loop is the better tool. `sum` is here because it's a small, clear example. Recursion really earns its place with nested data, which is coming up next.

### Recursion vs. loops

Anything you can do with recursion, you can also do with a loop, and the other way round. So which should you choose?

| Use a loop when... | Use recursion when... |
|---|---|
| The data is a flat list (numbers, names, orders) | The data is nested like a tree (folders, comments, menus) |
| The list could be very long, like 100,000 items (loops have no call stack limit) | You don't know how deep the nesting goes, but it isn't thousands of levels deep |
| The loop version is short and clear | The recursive version is much simpler to read |

Most everyday code uses loops and array methods. Reach for recursion when your data is shaped like a tree.

### Walking a folder tree

This is where recursion shines. Here's a project folder. Every item has a `name`, and folders also have a `children` array, which can hold files *and* more folders:

```js
const project = {
  name: "my-site",
  children: [
    { name: "index.html" },
    { name: "css", children: [{ name: "style.css" }] },
    {
      name: "js",
      children: [
        { name: "app.js" },
        { name: "utils", children: [{ name: "math.js" }] },
      ],
    },
  ],
};
```

How deep does it go? Three levels today, but next week someone might add a folder inside `utils`. A loop inside a loop inside a loop can't handle "any depth". Recursion can:

```js
function printTree(item, depth = 0) {
  console.log("  ".repeat(depth) + item.name);

  if (item.children) {
    for (const child of item.children) {
      printTree(child, depth + 1); // the same job for each child, one level deeper
    }
  }
}

printTree(project);
```

You'll see:

```
my-site
  index.html
  css
    style.css
  js
    app.js
    utils
      math.js
```

Where's the base case? It's hiding in the `if`. A file has no `children`, so `printTree` prints the file's name and stops, without calling itself. A folder prints its own name, then hands each of its children to `printTree`, one level deeper.

Here's the start of the call trace. Notice how the calls follow the shape of the folders:

```
printTree(my-site)
  printTree(index.html)   → a file: prints and stops
  printTree(css)
    printTree(style.css)  → a file: prints and stops
  printTree(js)
    ...
```

**Counting the files.** Same idea, but this time each call returns a number:

```js
function countFiles(item) {
  if (!item.children) {
    return 1; // base case: a file counts as 1
  }
  let total = 0;
  for (const child of item.children) {
    total = total + countFiles(child); // add up the files inside each child
  }
  return total;
}

console.log(countFiles(project)); // prints: 4
```

The four files are `index.html`, `style.css`, `app.js`, and `math.js`. Each folder asks its children "how many files do you have?" and adds up their answers. Only the files (the base case) answer straight away.

The same pattern works for nested comments (replies to replies) and shop menus (categories inside categories). You'll try both in the exercises.

### Flattening a nested array by hand

In chapter 13 you met `flat`, which flattens nested arrays. Let's write our own `flatten`, which flattens *every* level, however deep:

```js
function flatten(items) {
  const result = [];
  for (const item of items) {
    if (Array.isArray(item)) {
      result.push(...flatten(item)); // an array: flatten it, then add its items
    } else {
      result.push(item); // a plain value: add it as it is
    }
  }
  return result;
}

console.log(flatten([1, [2, 3], [4, [5, [6]]]])); // prints: [ 1, 2, 3, 4, 5, 6 ]
```

`Array.isArray` from [chapter 10](../10-arrays/notes.md) tells the two cases apart:

- A plain value (like `1`) is the base case. It goes straight into `result`.
- An array (like `[5, [6]]`) is a smaller copy of the same problem, so `flatten` calls itself on it. The spread `...` from chapter 15 then pushes all of the flattened items in one go.

The built-in way to do the same thing is `flat(Infinity)`, where `Infinity` means "all the levels". Now you have a good idea of how it works inside.

### How to write your own recursive function

When you write one yourself, go through these steps:

1. **Find the smallest version of the problem**, the one you can answer right away: an empty list, the number 1, a file with no children. That's your base case.
2. **Trust that the function already works for a smaller input.** Don't try to follow every call in your head. When you write `sum(rest)`, assume it gives you the right total for the rest.
3. **Use that smaller answer to build the full answer**: "the first number, plus the sum of the rest".
4. **Check that every call gets closer to the base case.**

Step 2 feels strange at first. Think back to the line of people working out the factorial: each person only does their own small part, and trusts the next person to do theirs.

## Common mistakes

**1. Never getting closer to the base case**

```js
function countdown(n) {
  if (n === 0) {
    console.log("Liftoff!");
    return;
  }
  console.log(n);
  countdown(n); // oops: should be n - 1
}

countdown(3);
// prints 3 thousands of times, then: RangeError: Maximum call stack size exceeded
```

There *is* a base case, but every call passes the same `n` along, so it's never reached. Fix: make the problem smaller each time: `countdown(n - 1)`.

**2. Stepping over the base case**

```js
function countdown(n) {
  if (n === 0) {
    console.log("Liftoff!");
    return;
  }
  console.log(n);
  countdown(n - 2); // counting down in twos
}

countdown(3);
// prints 3, 1, -1, -3, ... then: RangeError: Maximum call stack size exceeded
```

Counting down in twos from 3 goes 3, 1, -1, and jumps right over 0. Fix: make the base case catch everything at or below the stopping point: `if (n <= 0)`.

**3. Forgetting to `return` the recursive call**

```js
function sum(numbers) {
  if (numbers.length === 0) {
    return 0;
  }
  const [first, ...rest] = numbers;
  first + sum(rest); // oops: no return, so the answer is thrown away
}

console.log(sum([1, 2, 3])); // prints: undefined
```

The recursive call works out the right answer, but nothing hands it back. A function without a `return` gives `undefined` (chapter 09). Fix: `return first + sum(rest);`.

**4. Using recursion on something very big**

```js
countdown(100000); // the correct countdown from the start of this chapter
// prints 100000, 99999, ... down to about 90000, then: RangeError: Maximum call stack size exceeded
```

The function is correct, but it would need 100,000 plates on the call stack, and there's only room for roughly ten thousand. Fix: for long, flat jobs like this, use a loop. Loops don't use up the call stack.

## Quick recap

- **Recursion** is a function calling itself, each time on a smaller piece of the problem.
- Every recursive function needs a **base case** (stop and answer directly) and a **recursive case** (call itself, one step closer to the base case).
- Each waiting call sits on the **call stack**, like a stack of plates, until the smaller call it made returns. The answers come back in reverse order.
- No base case, or calls that never reach it, cause `RangeError: Maximum call stack size exceeded`.
- Loops are best for flat lists. Recursion shines with nested, tree-shaped data like folders, comments, and menus.
- Stuck? Trace a tiny example on paper, or add indented `console.log` lines and watch the calls.

---

**Next:** try the [exercises](exercises.md), then move on to [18 Error Handling](../18-error-handling/notes.md).
