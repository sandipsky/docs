# 47 Debugging

## What is it?

**Debugging** is finding out *why* your program doesn't do what you expected, and then fixing it.

A **bug** is any mistake that makes a program behave wrongly: a crash, a wrong answer, a button that does nothing.

## Why does it matter?

Everyone writes bugs. Beginners do, and so do developers with twenty years of experience. What changes with experience isn't how many bugs you write. It's how quickly you find them.

Without a method, debugging means staring at the code, changing random things, and hoping. That can eat a whole evening. With a method and the right tools, most bugs take minutes. That's what this chapter gives you.

A fun fact about the word: in 1947, a team working on the Harvard Mark II computer (it included Grace Hopper, one of the pioneers of programming) found a real moth stuck in one of the machine's parts. They taped it into their logbook with the note "First actual case of bug being found." Engineers were already calling faults "bugs" back then, which is why they found it funny. The logbook page, moth and all, is now at the Smithsonian's National Museum of American History.

## Real-world example

Debugging is detective work. A good detective doesn't guess who did it. They follow a method, and so can you:

| A detective... | When you debug, you... |
|---|---|
| Reads the report of what happened | Read the error message and the stack trace |
| Visits the scene and works out exactly what happened | **Reproduce** the bug: make it happen again, on purpose |
| Narrows down the list of suspects | **Isolate** the bug: find the exact function, line, and value that goes wrong |
| Checks every alibi instead of trusting stories | Check your assumptions with `console.log` and breakpoints |
| Catches the real culprit, not just a bystander | Fix the cause, not just the symptom |
| Makes sure the case is really closed | **Verify** the fix, and add a test so it can't come back |

## How it works

### A method for every bug

Here are five steps that work for almost any bug:

1. **Read the error.** If there's an error message, it tells you *what* went wrong and the stack trace tells you *where* ([chapter 18](../18-error-handling/notes.md)). If there's no error, just a wrong result, write down exactly what you expected and exactly what you got.
2. **Reproduce it.** Find the input or the steps that make the bug happen every time. If you can't make it happen on purpose, you can't be sure you've fixed it.
3. **Isolate it.** Narrow it down: which function? Which line? Which value is wrong? The tools in this chapter are all for this step.
4. **Fix the cause, not the symptom.** If a total shows `NaN`, hiding the `NaN` on the screen isn't a fix. Find out where the `NaN` came from.
5. **Verify.** Run the same steps again and check the bug is gone. Then check that the things around it still work. Best of all, write a test for it ([chapter 46](../46-testing/notes.md)), so this bug can never sneak back.

### The method in action

A furniture shop shows the average star rating of each product:

```js
const products = [
  { name: "Lamp", ratings: [4, 5, 3] },
  { name: "Desk", ratings: [] },
  { name: "Chair", ratings: [5, 4] },
];

function averageRating(product) {
  const total = product.ratings.reduce((sum, rating) => sum + rating, 0);
  return total / product.ratings.length;
}

for (const product of products) {
  console.log(`${product.name}: ${averageRating(product).toFixed(1)} stars`);
}
```

You'll see:

```
Lamp: 4.0 stars
Desk: NaN stars
Chair: 4.5 stars
```

Let's follow the five steps.

1. **Read.** There's no error message, but "NaN stars" is clearly wrong. We expected something sensible for the desk.
2. **Reproduce.** It happens every time, and only for the desk. What's different about the desk? It has no ratings yet.
3. **Isolate.** Log the values inside `averageRating`, just before the division. For the desk, you'll see:

    ```
    { name: 'Desk', total: 0, count: 0 }
    ```

    So the function works out `0 / 0`, which is `NaN` ([chapter 05](../05-numbers-and-math/notes.md)).

4. **Fix the cause.** A product with no ratings doesn't *have* an average. That's the real problem, so handle it where the average is worked out:

    ```js
    function averageRating(product) {
      if (product.ratings.length === 0) {
        return null; // no ratings yet: there is no average
      }
      const total = product.ratings.reduce((sum, rating) => sum + rating, 0);
      return total / product.ratings.length;
    }

    for (const product of products) {
      const average = averageRating(product);
      const label = average === null ? "no ratings yet" : `${average.toFixed(1)} stars`;
      console.log(`${product.name}: ${label}`);
    }
    ```

    Hiding the text "NaN" at the printing step would only have fixed the symptom: every other part of the shop that uses `averageRating` would still get `NaN`.

5. **Verify.** Run it again:

    ```
    Lamp: 4.0 stars
    Desk: no ratings yet
    Chair: 4.5 stars
    ```

    The desk is fixed, and the lamp and chair still show the same numbers as before.

That's the whole method. The rest of this chapter is about tools that make step 3, isolating the bug, much faster.

### Log smarter: labels, tables, and deep objects

`console.log` is the simplest debugging tool there is, and professionals use it every day. A few habits make it much more useful.

**Label everything.** Three bare numbers in a row tell you nothing:

```js
const price = 5;
const quantity = 3;
const discount = 0.1;

console.log(price, quantity, discount); // prints: 5 3 0.1
console.log({ price, quantity, discount }); // prints: { price: 5, quantity: 3, discount: 0.1 }
```

Wrapping the variables in `{ }` builds a quick object with shorthand properties ([chapter 11](../11-objects/notes.md)), so every value is printed with its name. It's the fastest labeled log there is.

**`console.table`** shows an array of objects as a table:

```js
const cart = [
  { item: "Coffee", price: 4, qty: 2 },
  { item: "Bagel", price: 3, qty: 1 },
  { item: "Juice", price: 5, qty: 3 },
];

console.table(cart);
```

You'll see:

```
┌─────────┬──────────┬───────┬─────┐
│ (index) │ item     │ price │ qty │
├─────────┼──────────┼───────┼─────┤
│ 0       │ 'Coffee' │ 4     │ 2   │
│ 1       │ 'Bagel'  │ 3     │ 1   │
│ 2       │ 'Juice'  │ 5     │ 3   │
└─────────┴──────────┴───────┴─────┘
```

A wrong price or a missing value jumps out much faster in a table than in a wall of curly braces.

**`console.dir` for deeply nested objects.** Node's `console.log` only shows objects a couple of levels deep. After that, it prints `[Object]` instead of the details:

```js
const order = {
  id: 1042,
  customer: { name: "Ana", address: { city: "Lisbon", street: { name: "Rua Augusta", number: 12 } } },
};

console.log(order);
```

You'll see:

```
{
  id: 1042,
  customer: { name: 'Ana', address: { city: 'Lisbon', street: [Object] } }
}
```

That `[Object]` doesn't mean the data is missing. Node just stopped printing. To see everything, use `console.dir` with `{ depth: null }` ("no depth limit"):

```js
console.dir(order, { depth: null });
```

You'll see:

```
{
  id: 1042,
  customer: {
    name: 'Ana',
    address: { city: 'Lisbon', street: { name: 'Rua Augusta', number: 12 } }
  }
}
```

In the browser, you can click to open nested objects instead, so `[Object]` isn't a problem there. But `console.dir` is still handy in the browser: `console.log(element)` shows a page element as HTML, while `console.dir(element)` shows it as an object, with all its properties.

### More console tools

**`console.group`** indents everything until the matching `console.groupEnd()`, so related messages stay together:

```js
console.group("Order 1042");
console.log("Checking stock...");
console.group("Payment");
console.log("Card accepted");
console.groupEnd();
console.log("Order confirmed");
console.groupEnd();
console.log("Next order");
```

You'll see:

```
Order 1042
  Checking stock...
  Payment
    Card accepted
  Order confirmed
Next order
```

**`console.count`** counts how many times a line has run. It's perfect for questions like "why does this run three times when I clicked once?"

```js
function addToCart(item) {
  console.count("addToCart called");
}

addToCart("tea");
addToCart("cake");
addToCart("tea");
```

You'll see:

```
addToCart called: 1
addToCart called: 2
addToCart called: 3
```

**`console.time`** and **`console.timeEnd`** measure how long the code between them takes. Give both the same label:

```js
console.time("build report");
let lines = 0;
for (let i = 0; i < 1000000; i++) {
  lines += 1;
}
console.timeEnd("build report"); // prints something like: build report: 3.516ms
```

Your number will be different every time. [Chapter 48](../48-performance/notes.md) uses this to make code faster.

**`console.trace`** prints the stack trace from where it's called, *without* crashing. Use it to answer "who called this function?":

```js
function applyDiscount(price) {
  console.trace("applyDiscount was called");
  return price * 0.9;
}

function checkout(cartTotal) {
  return applyDiscount(cartTotal);
}

checkout(50);
```

You'll see (with your own file paths):

```
Trace: applyDiscount was called
    at applyDiscount (C:\...\47-debugging\checkout.js:2:11)
    at checkout (C:\...\47-debugging\checkout.js:7:10)
    at Object.<anonymous> (C:\...\47-debugging\checkout.js:10:1)
    ...
```

**`console.assert`** checks something that should be true, and only prints when it *isn't*:

```js
const stock = 3;
const ordered = 5;
console.assert(ordered <= stock, `Ordered ${ordered}, but only ${stock} in stock`);
console.log("The program keeps going");
```

You'll see:

```
Assertion failed: Ordered 5, but only 3 in stock
The program keeps going
```

Unlike the `assert` in tests ([chapter 46](../46-testing/notes.md)), `console.assert` doesn't stop anything. It's a quiet alarm you can leave in while you hunt.

**`console.warn`** and **`console.error`** work like `console.log`, but mark the message as a warning or an error. In the terminal they look the same as `log`. In the browser console, warnings are yellow and errors are red, and you can filter the console to show only those.

| Tool | Use it to... |
|---|---|
| `console.log({ a, b })` | print values together with their names |
| `console.table(list)` | see an array of objects as a table |
| `console.dir(obj, { depth: null })` | see every level of a nested object (in Node) |
| `console.group("label")` ... `console.groupEnd()` | keep related messages together |
| `console.count("label")` | count how many times a line runs |
| `console.time("label")` ... `console.timeEnd("label")` | measure how long something takes |
| `console.trace("message")` | see how the code got here, without crashing |
| `console.assert(condition, "message")` | complain only when something that should be true isn't |
| `console.warn()`, `console.error()` | mark warnings and problems |

> **Watch out:** in Chrome and Edge, a logged object isn't a frozen snapshot. The console reads it again when you click to open it. If your code changed the object in between, you'll see the *new* values, not the ones from when you logged it. When you're hunting a mutation bug ([chapter 16](../16-values-vs-references/notes.md)), log a copy instead: `console.log(structuredClone(cart))`.

### Reading stack traces in depth

[Chapter 18](../18-error-handling/notes.md) showed you how to read a stack trace: the message says *what* went wrong, the first `at` line says *where*, and the other `at` lines say *how the code got there*. Here are four more things that help in real programs.

**1. Start from your own code.** A real trace also contains Node's own code (lines starting with `node:internal`), and in bigger projects, code written by other people that you've installed (paths containing `node_modules`; you'll install your first packages in [chapter 50](../50-tooling/notes.md)). The bug is almost always in *your* code, so scan down for the first line that points to one of your files, and start there.

**2. Named functions make clearer traces.** Here's a crash inside an arrow function that has no name:

```js
const orders = [
  { id: 1, items: ["tea", "cake"] },
  { id: 2 },
];

const itemCounts = orders.map((order) => order.items.length);
console.log(itemCounts);
```

The trace starts like this:

```
TypeError: Cannot read properties of undefined (reading 'length')
    at C:\...\47-debugging\orders.js:6:54
    at Array.map (<anonymous>)
    at Object.<anonymous> (C:\...\47-debugging\orders.js:6:27)
```

The first `at` line has only a location, because the callback has no name. `Array.map (<anonymous>)` is the built-in `map`, calling your callback. Now give the callback a name:

```js
function countItems(order) {
  return order.items.length;
}

const orders = [
  { id: 1, items: ["tea", "cake"] },
  { id: 2 },
];

const itemCounts = orders.map(countItems);
console.log(itemCounts);
```

```
TypeError: Cannot read properties of undefined (reading 'length')
    at countItems (C:\...\47-debugging\orders.js:2:22)
    at Array.map (<anonymous>)
    at Object.<anonymous> (C:\...\47-debugging\orders.js:10:27)
```

Now the trace tells you the function's name, which is much easier to follow in a big file. Short arrow callbacks are fine, but it's one more reason to give bigger jobs a named function.

**3. `async` functions keep their callers.** When an error happens after an `await`, Node still shows which `async` function was waiting for it:

```js
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchUser(id) {
  await wait(100); // pretend to ask a server
  throw new Error(`User ${id} not found`);
}

async function loadDashboard() {
  const user = await fetchUser(42);
  console.log(`Welcome, ${user.name}`);
}

loadDashboard();
```

```
Error: User 42 not found
    at fetchUser (C:\...\47-debugging\dashboard.js:7:9)
    at async loadDashboard (C:\...\47-debugging\dashboard.js:11:16)
```

The word `async` in `at async loadDashboard` means "this function was waiting on an `await` when the error came back" ([chapter 32](../32-async-await/notes.md)).

**4. The crash line isn't always the bug line.** This is the most important one:

```js
function createUser(name) {
  return { nmae: name, points: 0 };
}

function greet(user) {
  return `Hello, ${user.name.toUpperCase()}!`;
}

const user = createUser("ana");
console.log(greet(user));
```

```
TypeError: Cannot read properties of undefined (reading 'toUpperCase')
    at greet (C:\...\47-debugging\greet.js:6:30)
    at Object.<anonymous> (C:\...\47-debugging\greet.js:10:13)
```

The trace points at `greet`, but there's nothing wrong with `greet`. The mistake is the typo `nmae` in `createUser`, and `createUser` isn't even in the trace: it had already finished when the crash happened.

A stack trace shows where the program *noticed* the problem, which isn't always where the problem was *made*. So ask two questions:

1. **Which value is wrong?** The message says it tried to read `toUpperCase` of `undefined`, so `user.name` is `undefined`.
2. **Where did that value come from?** Follow it backwards. Log the whole `user`:

```js
console.log({ user }); // prints: { user: { nmae: 'ana', points: 0 } }
```

There's the typo. Fix it where the bad value was made, in `createUser`, not where it crashed.

Timers make this even more obvious. By the time a `setTimeout` callback runs, the function that set the timer has long finished ([chapter 40](../40-event-loop/notes.md) explains why), so the trace only shows the callback:

```js
function remindMe(task) {
  setTimeout(() => {
    console.log(`Reminder: ${task.title.toUpperCase()}`);
  }, 100);
}

function planDay() {
  remindMe({ title: "stretch" });
  remindMe({ name: "drink water" });
}

planDay();
```

You'll see:

```
Reminder: STRETCH
C:\...\47-debugging\reminders.js:3
    console.log(`Reminder: ${task.title.toUpperCase()}`);
                                        ^

TypeError: Cannot read properties of undefined (reading 'toUpperCase')
    at Timeout._onTimeout (C:\...\47-debugging\reminders.js:3:41)
    at listOnTimeout (node:internal/timers:605:17)
    at process.processTimers (node:internal/timers:541:7)
```

`planDay` and `remindMe` are nowhere in the trace. The real bug, `name` instead of `title` on line 9, is something you have to find by following the bad value back to where it came from.

### Breakpoints: pause and look around

At the end of chapter 46, a failing test could tell you *that* something was broken, but not *why*. This is where you find out why.

`console.log` shows you the values you *thought* to print. A **debugger** is a tool that pauses your program while it runs, so you can look at *every* value at that moment. A **breakpoint** is the spot where you tell it to pause. It's like pausing a football replay and moving forward frame by frame to see exactly who touched the ball.

You can set a breakpoint in two ways:

- In the tool itself: click next to a line number in the browser's DevTools or in VS Code (both shown below). This is the usual way.
- In your code: write the `debugger` statement.

```js
let total = 0;
for (const price of [4, 6]) {
  debugger; // pauses here, but only when a debugger is attached
  total += price;
}
console.log(total); // prints: 10
```

With no debugger attached (like a plain `node` run), `debugger;` does nothing at all, and the program prints `10`. With DevTools open, or in VS Code's debugger, it pauses on that line.

Once your program is paused, you control it with four buttons:

| Button | What it does | Chrome and Edge | VS Code |
|---|---|---|---|
| Resume (Continue) | Run on until the next breakpoint | `F8` | `F5` |
| Step over | Run this line, then pause on the next one | `F10` | `F10` |
| Step into | If this line calls a function, go inside it and pause on its first line | `F11` | `F11` |
| Step out | Finish the current function, and pause back where it was called | `Shift + F11` | `Shift + F11` |

Think of following a recipe that says "make the sauce (see page 12)". **Step over** makes the sauce without reading page 12, and moves on to the next step. **Step into** turns to page 12 and follows the sauce recipe line by line. **Step out** finishes the sauce recipe and takes you back to the main recipe.

Most of the time you'll step over. Step into when you suspect the function being called. If you're not sure which button is which, hover over it to see its name and its shortcut in your version.

### Debugging in the browser: the Sources panel

Let's debug a real page. You met this bug in [chapter 22](../22-forms/notes.md), which makes it perfect for learning the tools: you already know the answer, so you can watch how the debugger reveals it. Make a folder with these two files:

`index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Tip calculator</title>
    <script src="script.js" defer></script>
  </head>
  <body>
    <label for="bill">Bill ($)</label>
    <input id="bill" type="number" value="40">
    <label for="tip">Tip ($)</label>
    <input id="tip" type="number" value="5">
    <button id="calculate">Calculate total</button>
    <p id="result"></p>
  </body>
</html>
```

`script.js`:

```js
const button = document.querySelector("#calculate");

button.addEventListener("click", () => {
  const bill = document.querySelector("#bill").value;
  const tip = document.querySelector("#tip").value;
  const total = bill + tip;
  document.querySelector("#result").textContent = `Total: $${total}`;
});
```

Open `index.html` and click the button. It says `Total: $405` instead of `Total: $45`. Now let's catch it in the act:

1. Press `F12` and open the **Sources** tab. (If you can't see it, click `>>` to find more tabs.)
2. In the panel on the left, find `script.js` and click it to open it. (In bigger projects, `Ctrl + P` finds a file by name.)
3. Click the line number next to `const total = bill + tip;`. A blue marker appears: that's your breakpoint.
4. Click **Calculate total** on the page. The page freezes and shows **Paused in debugger**, and the line is highlighted. The code has stopped *just before* running that line.
5. Hover your mouse over `bill` in the code. It shows `"40"`, in quotes. The **Scope** section on the right shows the same: `bill: "40"` and `tip: "5"`. Those quotes are the clue: both values are strings.
6. Press **Step over** (`F10`). The line runs, and Scope now shows `total: "405"`. Two strings were glued together.
7. Press **Resume** (`F8`). Fix the code with `Number()` as in chapter 22, save, and refresh the page.

While you're paused, the right-hand side has more to show you:

- **Scope** lists every variable the paused line can see, grouped by where they live: its own variables at the top, the outer ones further down. It's the scope chain from [chapter 14](../14-scope-and-hoisting/notes.md), laid out for you.
- **Watch** lets you type any expression, like `typeof bill`, and updates it every time you step.
- **Call Stack** is the stack of plates from [chapter 17](../17-recursion/notes.md) at this exact moment. Click a line in it to see what the calling function was doing.
- The **Console** works while you're paused, and it can see the paused line's variables. Type `typeof bill` and press `Enter` to get `'string'`.

**Conditional breakpoints** save a lot of clicking. If a loop runs 500 times and only one item goes wrong, right-click the line number, choose **Add conditional breakpoint...**, and type a condition like `item.price < 0`. The code pauses only when the condition is true.

**Logpoints** come from the same menu. **Add logpoint...** prints a message every time the line runs, without pausing and without editing your file.

To remove a breakpoint, click its marker again. Menus move around a little between browser versions, but all of these features have been in Chrome and Edge for years.

### Three more DevTools panels

**Console.** Errors show up in red, with the file name and line number on the right. Click that link to jump straight to the line in the Sources panel. The dropdown at the top lets you choose which levels to show, so you can hide everything except errors and warnings.

**Network.** Every request the page makes shows up here: the HTML, the CSS, images, and your `fetch` calls ([chapter 33](../33-fetch-and-apis/notes.md)). It only records while DevTools is open, so open it first, then reload the page or click your button.

- Click **Fetch/XHR** to show only the data requests.
- Check the **Status** column. `200` means OK. Failures like `404` (not found) or `500` (server error) show up in red.
- Click a request to see its **Headers** (the full URL and the method), and what the server sent back under **Response** or **Preview**.

Remember that `fetch` doesn't treat a `404` as an error. The Network tab shows you what really happened. And while DevTools is open, ticking **Disable cache** makes the browser load fresh copies of your files, which helps when a change "doesn't show up".

**Elements.** This is the live page, the DOM from [chapter 20](../20-dom-basics/notes.md). Use it to check your assumptions: is the element really there? Does it have the class you think it has, right now? The **Styles** pane shows which CSS rules apply to it, and crossed-out rules are the ones being overridden. Two more tricks:

- Click an element, then type `$0` in the Console. `$0` is the element you selected, so `$0.textContent` shows its text.
- Right-click an element and choose **Break on**, then **attribute modifications**. Your script pauses at the exact line that changes it, which is great for "who keeps removing this class?"

### Debugging Node in VS Code

VS Code has a debugger built in, and it works the same way as DevTools. The easiest way to use it is the **JavaScript Debug Terminal**:

1. Open the terminal panel. Click the small arrow next to the `+` button and choose **JavaScript Debug Terminal**. (Or press `Ctrl + Shift + P` to open the Command Palette and run **Debug: JavaScript Debug Terminal**.)
2. Set a breakpoint: click just to the left of a line number in your file. A red dot appears.
3. In the debug terminal, run your file as usual: `node app.js`.
4. VS Code pauses on the breakpoint and highlights the line. The **Run and Debug** view on the left shows **Variables**, **Watch**, **Call Stack**, and **Breakpoints**, and a small toolbar appears with Continue, Step Over, Step Into, Step Out, Restart, and Stop.

The debugger attaches to whatever you run with `node` in that terminal, including `node --test` from chapter 46. So when a test fails, put a breakpoint in the function it tests, run the tests in the debug terminal, and look inside.

VS Code also has conditional breakpoints and logpoints: right-click the red dot (or the space next to a line number) to find them.

Two other ways in:

- **Run and Debug:** with your file open, press `F5` (or click **Run and Debug** in the left sidebar), and pick **Node.js** if VS Code asks. It runs the current file with the debugger attached.
- **Chrome for Node:** run `node --inspect-brk app.js` in a normal terminal, open `chrome://inspect` in Chrome, and click **inspect** under your script. `--inspect-brk` means "turn on the debugger, and pause on the first line".

VS Code renames things now and then. If a menu item here doesn't match yours, search for it in the Command Palette.

### When you're stuck

**Explain it to a rubber duck.** Go through your code line by line, and explain out loud what each line does. The listener can be a friend, Claude, or a rubber duck on your desk. The trick is called **rubber duck debugging**, after a story in the book *The Pragmatic Programmer*. Saying "...and then this line adds the tip to the bill" out loud is very often the moment you hear the mistake.

**Search by halves.** When you have no idea where the problem is, check the middle. In a program made of steps, like this sketch, put a log halfway through:

```js
const orders = loadOrders();
const paidOrders = removeUnpaid(orders);
const withTotals = addTotals(paidOrders);
console.log({ count: withTotals.length, first: withTotals[0] }); // already wrong here?
const sorted = sortByDate(withTotals);
const report = buildReport(sorted);
```

If the value is already wrong at that point, the bug is in the first half. If not, it's in the second half. Then check the middle of *that* half, and so on. Like the guessing game where each guess cuts the possible numbers in half, even a 1,000-line program gets down to one line in about ten checks. This is called **binary search**.

**Check your assumptions.** Most bugs hide behind something you're *sure* about. "This is definitely a number." Is it? Log `typeof price`. "This function definitely runs." Does it? Put a `console.count` in it. "The list definitely has three items." Log its `length`. Each check takes seconds, and the thing you're most sure about is often the thing that's wrong. Old favorites: form values are strings (chapter 22), `sort` changes the array (chapter 13), and a function with no `return` gives back `undefined` (chapter 09).

**Change one thing at a time.** If you change five things and it starts working, you don't know which change fixed it, or whether the other four broke something else. Change one thing, run it, look. Undo the changes that didn't help.

**Take a break.** It sounds too simple, but it works. After a walk, or a night's sleep, a bug that beat you for an hour often takes two minutes.

**Find the change that broke it.** If it worked yesterday and doesn't today, the bug is in something that changed since then. If you use Git (it'll get its own folder later), `git bisect` does the "search by halves" for you through your saved versions, and finds the exact change that broke it.

### Common bug families

Most bugs belong to a handful of families. Once you know the symptom, you know where to look:

| Family | What you notice | What to check |
|---|---|---|
| Off-by-one | A missing first or last item, an extra `undefined`, a loop that runs once too often | `<` vs. `<=`, indexes start at 0, the last index is `length - 1`, the end of `slice` isn't included ([chapter 10](../10-arrays/notes.md)) |
| Reading a property of `undefined` | `TypeError: Cannot read properties of undefined (reading '...')` | *Which* value is `undefined`, and why: a misspelled property, a `find` that found nothing, a missing `return`, an index that's out of range |
| Async timing | `Promise { <pending> }`, `[object Promise]`, things happening in the wrong order | A missing `await`, an `await` inside `forEach`, code after a `setTimeout` running first ([chapter 32](../32-async-await/notes.md), [chapter 40](../40-event-loop/notes.md)) |
| Accidental mutation | Data that changes "by itself", an undo button that doesn't undo | A function changing what it was given: `sort`, `push`, `splice`, or setting a property on a shared object ([chapter 16](../16-values-vs-references/notes.md)) |
| Typos | `ReferenceError: ... is not defined`, or a quiet `undefined` | Spelling and capital letters, in variable names *and* in property names |

The exercises give you bugs from each family to hunt down.

### Asking for help well

Sometimes you need a second pair of eyes: a colleague, a forum, or Claude. A good question gets a good answer fast. Include:

1. **What you expected, and what happened instead.** Copy the exact error message or output. Don't retype it from memory, because one changed word can send your helper the wrong way.
2. **A minimal reproduction:** the smallest piece of code that still shows the bug. Delete everything that isn't needed, then run it again to check the bug is still there.
3. **What you've already tried**, so nobody suggests it again.
4. **Your versions**, when they might matter: the output of `node --version`, or which browser you use.

A minimal reproduction is often the whole answer. Say your 300-line shop program crashes whenever the cart is empty. Cut it down step by step, and you might end up with this:

```js
const prices = [];
const total = prices.reduce((sum, price) => sum + price);
// TypeError: Reduce of empty array with no initial value
```

Two lines. By the time you've cut the code down, you've very often found the bug yourself (here, it's the missing starting value from [chapter 13](../13-array-methods/notes.md)). If you haven't, your helper can see the problem in seconds instead of reading 300 lines.

| Hard to answer | Easy to answer |
|---|---|
| "My shop is broken, can you help?" | "My cart total crashes when the cart is empty." |
| "I get some error about reduce." | "I get `TypeError: Reduce of empty array with no initial value` from this code: ..." |
| 300 lines pasted in | The two-line reproduction |
| Nothing about what you tried | "I logged `prices.length` just before, and it's `0`." |

## Common mistakes

**1. Not reading the error message**

```
C:\...\47-debugging\cart.js:6
console.log(`Total: $${totl}`);
                       ^

ReferenceError: totl is not defined
```

It's tempting to panic and start changing things. But read it: the message names the problem (`totl` doesn't exist), and the line and the `^` show exactly where. It's a typo for `total`. Error messages are often the whole answer, so always read them first, slowly, from the top.

**2. Fixing the symptom instead of the cause**

```js
function averageRating(product) {
  const total = product.ratings.reduce((sum, rating) => sum + rating, 0);
  return total / product.ratings.length || 0; // "fixed" it!
}
// the desk now prints: Desk: 0.0 stars
```

The `NaN` is gone, but now the shop tells customers the desk has *zero stars*, which is a new bug and a worse one. `|| 0` hid the symptom without asking where it came from. Fix the cause: decide what "no ratings" should mean, like in "The method in action" above.

**3. Running old code**

```
> node receipt.js
Total: $NaN
```

You've fixed the bug, but it still prints exactly the same thing? Before you doubt your fix, check the boring things. Did you save the file? (VS Code shows a dot on the tab of an unsaved file, and **File → Auto Save** saves for you.) Is the terminal in the right folder, running the right file? In the browser, did you refresh? If a change still doesn't show up, do a hard reload with `Ctrl + F5`.

**4. Ignoring a log that never printed**

```js
const scores = [72, 88, 95];

for (let i = 0; i > scores.length; i++) {
  console.log("checking score", scores[i]);
}
console.log("done");
// prints: done
```

You added a log to watch the loop, and it printed nothing. That isn't a failed experiment: no output is a clue. It means that code never ran. Here the condition `i > scores.length` is `false` from the very start, so the loop body never runs. Fix: `i < scores.length`.

**5. Leaving debugging code behind**

```js
function checkout(cart) {
  debugger;
  console.log("HERE!!!", cart);
  return cart.length;
}
```

A forgotten `debugger` pauses the app for anyone who has DevTools open, and forgotten logs clutter the console. Once the bug is fixed, remove them. Search your files for `debugger` and `console.log` before you call it done. Linters like ESLint ([chapter 50](../50-tooling/notes.md)) can warn you about leftovers.

## Quick recap

- Everyone writes bugs. Follow the method: read the error, reproduce, isolate, fix the cause (not the symptom), and verify, ideally with a test.
- Label your logs (`console.log({ total })`), and use the rest of the console too: `table`, `dir`, `group`, `count`, `time`, `trace`, and `assert`.
- In a stack trace, start from the first line in *your* code, and remember that the crash line isn't always the bug line: follow the bad value back to where it came from.
- Breakpoints pause your code so you can see every variable and step over, into, and out. Use the Sources panel in the browser, and the JavaScript Debug Terminal in VS Code.
- The Network tab shows what really happened to your requests, and the Elements panel shows the live page.
- Stuck? Explain it to a rubber duck, search by halves, check your assumptions, and change one thing at a time.
- When you ask for help, include the exact error and a minimal reproduction.

---

**Next:** try the [exercises](exercises.md), then move on to [48 Performance](../48-performance/notes.md).
