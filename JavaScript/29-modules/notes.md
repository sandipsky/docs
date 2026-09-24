# 29 Modules

## What is it?

A **module** is a JavaScript file that can share parts of its code with other files. It chooses what to share with `export`, and other files take what they need with `import`.

This lets you split one big program into many small files that work together.

## Why does it matter?

So far, every program you've written has lived in one file. That's fine for 50 lines. But real apps have thousands of lines, and one giant file quickly becomes a nightmare:

- **It's hard to find things.** Where was that tax function again? Scroll, scroll, scroll...
- **Names clash.** Two parts of the app both want a function called `format`.
- **It's hard to reuse code.** To use your date helpers in another project, you'd have to copy and paste them.

Modules fix all three. Each file has one clear job, keeps its own names to itself, and shares only what it chooses to.

Every modern JavaScript project uses modules: websites, Node apps, and every npm package. From this chapter on, this course uses them too, starting with the Weather App project in [chapter 39](../39-project-weather-app/notes.md).

## Real-world example

Think of a well-organized kitchen:

| In the kitchen | In your code |
|---|---|
| A drawer for each kind of thing: cutlery, spices, baking tools | A file for each job: `prices.js`, `cart.js`, `display.js` |
| The label on the front of each drawer | The file name |
| Deciding what goes in the drawer for others to use | `export` |
| Taking out only the whisk you need for this recipe | `import { whisk } from "./baking.js";` |
| Your own stuff, hidden at the back of the drawer | Code you don't export stays private to its file |

You don't pour every utensil into one huge pile on the counter. You open the drawer you need and take out just what you need.

## How it works

### Your first module in Node, step by step

Let's split a tiny shop program into two files.

**Step 1: Make a folder** called `shop` with three files in it:

```
shop/
├── package.json
├── prices.js
└── main.js
```

**Step 2: Tell Node to use modules.** Put exactly this in `package.json`:

```json
{ "type": "module" }
```

A `package.json` file holds settings for a project. This line tells Node: "treat the `.js` files in this folder as modules". (You'll learn much more about `package.json` in [chapter 50](../50-tooling/notes.md).)

**Step 3: Write the module that shares something.** In `prices.js`:

```js
export const TAX_RATE = 0.13;

export function addTax(price) {
  return price + price * TAX_RATE;
}

export function formatPrice(amount) {
  return `$${amount.toFixed(2)}`;
}
```

Putting `export` in front of a `const` or a `function` shares it with other files.

**Step 4: Use it from another file.** In `main.js`:

```js
import { addTax, formatPrice } from "./prices.js";

const total = addTax(20);
console.log(formatPrice(total)); // prints: $22.60
```

**Step 5: Run the file that starts everything.** Open a terminal in the `shop` folder and run:

```
node main.js
```

You'll see `$22.60`.

Let's look at the `import` line closely:

- The curly braces list the names you want, a bit like destructuring from [chapter 15](../15-destructuring-spread-rest/notes.md). You don't have to take everything: `main.js` never asked for `TAX_RATE`.
- `"./prices.js"` is the path to the file. `./` means "in the same folder as this file". Use `../` to go up one folder, and `./utils/format.js` to go into a subfolder.
- The path always includes the `.js` extension.
- Paths are worked out from the file that does the importing, not from wherever your terminal is.

The file you run (`main.js` here) is called the **entry point**. It's the front door of your program: it imports the other files, and they can import more files of their own.

### Why Node needs `"type": "module"`

Node has two module systems, for historical reasons:

- **ES modules** use `import` and `export`. They're the official JavaScript standard, and they work in browsers too. ("ES" is short for ECMAScript, the official name of the JavaScript standard.)
- **CommonJS** uses `require` and `module.exports`. It's Node's older, original system. You'll see it at the end of this chapter.

Every plain `.js` file you've run before this chapter was treated as CommonJS. The `"type": "module"` line switches the folder over to ES modules.

Here's honestly what Node 24 does in each situation (all checked on Node 24.15.0):

| Your setup | What happens when you run `node main.js` |
|---|---|
| `package.json` with `{ "type": "module" }` | Runs as ES modules, with no warnings. **This is the way this course does it.** |
| No `package.json` at all | Also works. Node spots the `import`/`export` and switches to ES modules by itself. Older versions of Node didn't do this. |
| A `package.json` without a `"type"` line | Works, but prints a warning every time (see below) |
| A `package.json` with `"type": "commonjs"` | Crashes with `SyntaxError: Cannot use import statement outside a module` |
| Files named `.mjs` instead of `.js` | Always ES modules, whatever `package.json` says |

The warning from the third row looks like this (with your own paths):

```
[MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///C:/.../shop/main.js is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to C:\...\shop\package.json.
```

It's Node saying: "I had to guess, and guessing is slow. Please tell me." Adding `"type": "module"` makes it go away.

Why not just skip `package.json` and let Node guess? Because being explicit is better than relying on guesswork. Real projects always have a `package.json`, and with `"type": "module"` in it, there's never any doubt about how your files will run.

Node uses the **nearest** `package.json`: it looks in the file's own folder first, then in the folders above it. So a `package.json` right next to your files always wins.

> **Tip:** The `.mjs` extension ("module JS") is the other way to say "this is an ES module", without any `package.json`. If you name your files `main.mjs` and `prices.mjs`, remember that the import changes too: `from "./prices.mjs"`. This course sticks with `.js` plus `"type": "module"`.

### Exporting a list, and keeping things private

Instead of writing `export` in front of each thing, you can list everything you share in one place, usually at the bottom of the file:

```js
function toFahrenheit(celsius) {
  return (celsius * 9) / 5 + 32;
}

function toCelsius(fahrenheit) {
  return ((fahrenheit - 32) * 5) / 9;
}

const FREEZING_POINT = 0; // not in the list below, so it stays private

export { toFahrenheit, toCelsius };
```

Anything you don't export is private to its file. Other files can't see `FREEZING_POINT` at all. That's a lot like the private data from closures in [chapter 25](../25-closures/notes.md): you decide what's public.

### Renaming with `as`

What if two modules both export a function called `format`?

```js
// in money.js
export function format(amount) {
  return `$${amount.toFixed(2)}`;
}
```

```js
// in dates.js
export function format(date) {
  return date.toISOString().slice(0, 10);
}
```

You can't import two things with the same name into one file, so rename them as you import them:

```js
import { format as formatMoney } from "./money.js";
import { format as formatDate } from "./dates.js";

console.log(formatMoney(19.9)); // prints: $19.90
console.log(formatDate(new Date("2026-09-24T10:00:00Z"))); // prints: 2026-09-24
```

### Importing everything with `* as`

You can also import everything a module exports, bundled into one object. Say `format.js` has two helpers:

```js
// in format.js
export function price(amount) {
  return `$${amount.toFixed(2)}`;
}

export function percent(value) {
  return `${value * 100}%`;
}
```

Then another file can take them both at once:

```js
import * as format from "./format.js";

console.log(format.price(4.5)); // prints: $4.50
console.log(format.percent(0.25)); // prints: 25%
```

`format` is an object holding everything `format.js` exports. This is handy when a module has lots of small helpers and you want to make it obvious where each one comes from.

### Default exports

A module can also have one **default export**: the single main thing the file is about. You mark it with `export default`:

```js
// in greeter.js
export default function greet(name) {
  return `Welcome to the gym, ${name}!`;
}

export const OPENING_HOUR = 6;
```

When you import a default export, you don't use curly braces, and **you choose the name**:

```js
import greet from "./greeter.js";
import sayHi from "./greeter.js"; // same function, different name
import welcome, { OPENING_HOUR } from "./greeter.js"; // default and named together

console.log(greet("Nima")); // prints: Welcome to the gym, Nima!
console.log(sayHi("Leela")); // prints: Welcome to the gym, Leela!
```

| | Named export | Default export |
|---|---|---|
| How many per file | As many as you like | At most one |
| Exporting | `export function addTax() {}` | `export default function greet() {}` |
| Importing | `import { addTax } from "./prices.js";` | `import greet from "./greeter.js";` |
| The name when importing | Must match (or be renamed with `as`) | Anything you like |

Which should you use? Both are common. Many developers prefer named exports for most code: the name is the same in every file, so it's easy to search for, and a misspelled name gives you a clear error. Default exports are popular for "the one main thing" in a file, like a class.

### Modules in the browser

Browsers understand `import` and `export` too, with two differences in how you set things up.

**Difference 1: add `type="module"` to the script tag.**

```html
<script type="module" src="main.js"></script>
```

This goes in the `<head>`, like before. You don't need `defer`: module scripts automatically wait for the HTML to load, just like `defer` does ([chapter 20](../20-dom-basics/notes.md)). Only the entry point needs a `<script>` tag. The browser loads the other files by following the `import` lines.

Inside the files, everything works the same as in Node. The paths must start with `./`, `../` or `/`, and must include `.js`. Browsers never guess a file extension.

**Difference 2: you can't just double-click `index.html` anymore.**

When you double-click an HTML file, the browser opens it straight from your disk. The address bar starts with `file:///`. For security, browsers refuse to load modules from pages opened that way. The page just sits there, and the DevTools console (`F12` → **Console**) shows a red error like this:

```
Access to script at 'file:///C:/.../main.js' from origin 'null' has been blocked by CORS policy: Cross origin requests are only supported for protocol schemes: chrome-extension, chrome-untrusted, data, edge, http, https, isolated-app.
```

(That's Edge. Chrome's list at the end is a little different, but it starts the same way.)

**CORS** stands for Cross-Origin Resource Sharing: the browser's rules about which pages may load files from where. A page opened from `file:///` doesn't count as a proper website (its origin is `'null'`), so it isn't allowed to load module files. You'll meet CORS again with APIs in [chapter 33](../33-fetch-and-apis/notes.md).

The fix is to open the page through a **local server**: a small program on your own computer that hands your files to the browser the way a real website would, over `http://`.

### Setting up Live Server in VS Code

This course uses a free VS Code extension called **Live Server**. You only need to install it once:

1. In VS Code, open the Extensions panel (`Ctrl + Shift + X`).
2. Search for **Live Server** and install the one by **Ritwick Dey**.

Then, every time you want to open a page that uses modules:

1. Open your folder in VS Code (**File → Open Folder...**), if it isn't open already.
2. In the Explorer on the left, right-click `index.html` and choose **Open with Live Server**.
3. Your browser opens the page at an address like `http://127.0.0.1:5500/index.html`. (`127.0.0.1` means "this computer", and `5500` is the **port**, like a door number that Live Server listens on. The rest of the address depends on which folder you opened.)
4. Edit and save your files. Live Server reloads the page for you automatically.
5. To stop the server, click **Port : 5500** in the status bar at the bottom of VS Code.

That's it. Modules now load, because the page comes from `http://` instead of `file:///`.

> **Tip:** Live Server works for normal pages too, and the auto-reload is handy. But from now on, any page that uses `type="module"` **must** be opened with it.

### Each module has its own scope

Variables at the top of a normal script are global ([chapter 14](../14-scope-and-hoisting/notes.md)). In a module, they're not. Each module is like its own room: what's declared inside stays inside, unless you export it.

```js
// in secret.js
const secretCode = "1234"; // not exported: stays private to this file

export function checkCode(code) {
  return code === secretCode;
}
```

```js
// in main.js
import { checkCode } from "./secret.js";

console.log(checkCode("1234")); // prints: true
console.log(typeof secretCode); // prints: undefined
```

`checkCode` can still use `secretCode`, because it was written in the same file. (It's a closure!) But `main.js` can't see it at all. This also means two modules can each have their own variable called `total` without any clash. In the browser, a module's top-level variables don't end up on `window` either.

### Modules are always strict

Every module runs in strict mode automatically, as you learned in [chapter 26](../26-this-keyword/notes.md). You don't need `"use strict"`. So in a module:

```js
score = 10; // ReferenceError: score is not defined
```

And at the top level of a module, `this` is `undefined`.

### A module runs only once, so it can share data

The first time any file imports a module, JavaScript runs that module's code. After that, every other import gets the same, already-loaded module. It doesn't run again.

That means every file that imports a module gets **the same** variables. So a module can hold data that the whole app shares, like a shopping cart:

```js
// in store.js
console.log("Loading the store...");

const items = [];

export function addItem(item) {
  items.push(item);
}

export function countItems() {
  return items.length;
}
```

```js
// in header.js
import { countItems } from "./store.js";

export function showHeader() {
  console.log(`Cart (${countItems()})`);
}
```

```js
// in main.js
import { addItem } from "./store.js";
import { showHeader } from "./header.js";

addItem("Tea");
addItem("Honey");
showHeader();
```

Run `node main.js`, and you'll see:

```
Loading the store...
Cart (2)
```

Two things to notice:

- Both `main.js` and `header.js` import `store.js`, but `Loading the store...` appears only once.
- `main.js` added the items, and `header.js` sees them, because there's only one `items` array. And `items` itself isn't exported, so other files can only change it through `addItem`, just like the bank account in chapter 25.

### Imports are read-only

You can use what you import, but you can't reassign it:

```js
import { TAX_RATE } from "./prices.js";

TAX_RATE = 0.2; // TypeError: Assignment to constant variable.
```

That's on purpose. If any file could replace another module's values, nobody could trust them. If a module's data needs to change, the module should export a function that does it, like `addItem` above.

### Two extras you'll use later

- **Top-level `await`.** Modules let you use the `await` keyword at the top level of the file, outside any function. You'll learn what `await` does in [chapter 32](../32-async-await/notes.md).
- **Dynamic `import()`.** Besides the `import` lines at the top of a file, you can call `import("./chart.js")` like a function, in the middle of your code. It loads a module only when you need it, for example when the user clicks "Show chart", so the page starts faster. It works with promises, which you'll meet in [chapter 31](../31-promises/notes.md), and you'll use it for speed in [chapter 48](../48-performance/notes.md).

### Recognizing CommonJS

In older Node code, and in many tutorials and Stack Overflow answers, you'll see Node's original module system, CommonJS:

```js
// in math.js
function add(a, b) {
  return a + b;
}

module.exports = { add };
```

```js
// in main.js
const { add } = require("./math.js");

console.log(add(2, 3)); // prints: 5
```

| | ES modules (this course) | CommonJS (older Node code) |
|---|---|---|
| Sharing | `export function add() {}` | `module.exports = { add };` |
| Using | `import { add } from "./math.js";` | `const { add } = require("./math.js");` |
| Works in browsers | Yes | No |
| In Node | With `"type": "module"`, or `.mjs` files | The default for `.js` files, and always for `.cjs` files |

You don't need to write CommonJS, but you should recognize it when you see it. If you find a `require` example online, you can usually turn it into an `import` with the same names.

### Organizing a small project

When a project grows, group its files into folders by what they do:

```
recipe-app/
├── package.json
├── main.js            ← the entry point: wires everything together
├── data/
│   └── recipes.js     ← the list of recipes
├── models/
│   └── Recipe.js      ← the Recipe class
└── utils/
    └── format.js      ← small formatting helpers
```

Each file imports what it needs, using paths relative to **itself**:

```js
// in models/Recipe.js
export default class Recipe {
  constructor(name, minutes) {
    this.name = name;
    this.minutes = minutes;
  }
}
```

```js
// in utils/format.js
export function formatMinutes(minutes) {
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}
```

```js
// in data/recipes.js
import Recipe from "../models/Recipe.js"; // up one folder, then into models

export const recipes = [
  new Recipe("Pancakes", 20),
  new Recipe("Dal bhat", 45),
];
```

```js
// in main.js
import { recipes } from "./data/recipes.js";
import { formatMinutes } from "./utils/format.js";

for (const recipe of recipes) {
  console.log(`${recipe.name}: ${formatMinutes(recipe.minutes)}`);
}
```

Run `node main.js` from the `recipe-app` folder, and you'll see:

```
Pancakes: 0h 20m
Dal bhat: 0h 45m
```

A few habits that keep projects tidy:

- **One job per file.** If you can't describe a file in one short sentence, it's probably doing too much.
- **Name files after what's inside.** `format.js` for formatting helpers, `Recipe.js` for the `Recipe` class. (A capital letter for a file holding a class is a common habit.)
- **Export only what other files need.** Everything else stays private.
- **Keep `main.js` short.** It should mostly import things and connect them, not do all the work itself.

### How this course runs modules from now on

Whenever an exercise uses `import` and `export`:

- **In Node:** put a `package.json` containing `{ "type": "module" }` in the exercise folder, open a terminal in that folder, and run `node main.js`.
- **In the browser:** load your entry point with `<script type="module" src="main.js"></script>`, and open `index.html` with **Live Server**, not by double-clicking.

## Common mistakes

**1. Leaving out `.js`**

```js
import { addTax } from "./prices";
```

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'C:\...\shop\prices' imported from C:\...\shop\main.js
Did you mean to import "./prices.js"?
```

Node looks for a file called exactly `prices`, with no extension, and there isn't one. Helpfully, it even suggests the fix. Browsers are just as strict: they ask the server for `prices`, get a "not found" (404) error, and the module never runs. Fix: always write the full file name, `"./prices.js"`.

**2. Leaving out `./`**

```js
import { addTax } from "prices.js";
```

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'prices.js' imported from C:\...\shop\main.js
```

A name without `./` or `../` in front means "a package installed with npm" (you'll see those in [chapter 50](../50-tooling/notes.md)), not a file of yours. Fix: `"./prices.js"`.

**3. Mixing up default and named imports**

```js
import addTax from "./prices.js";
// SyntaxError: The requested module './prices.js' does not provide an export named 'default'
```

`prices.js` only has named exports, but an import without curly braces asks for the default export. The same kind of error happens the other way round, with curly braces around a default export. Fix: match the import to the export. Named exports need `{ }`, and the default export doesn't.

**4. Double-clicking `index.html`**

The page does nothing, and the console shows `Access to script at 'file:///...' from origin 'null' has been blocked by CORS policy`. Browsers won't load modules from `file:///` pages. Fix: open the page with Live Server.

**5. Forgetting `type="module"`**

```html
<script src="main.js" defer></script>
```

```
Uncaught SyntaxError: Cannot use import statement outside a module
```

Without `type="module"`, the browser treats `main.js` as a normal script, and normal scripts can't use `import`. Fix: `<script type="module" src="main.js"></script>`.

**6. Using `require` in an ES module**

```js
const { addTax } = require("./prices.js");
// ReferenceError: require is not defined in ES module scope, you can use import instead
```

This happens when you copy an older CommonJS example into a folder with `"type": "module"`. Fix: turn it into an import, `import { addTax } from "./prices.js";`.

## Quick recap

- A **module** is a file that shares code with `export`. Other files take it with `import { name } from "./file.js"`. Anything you don't export stays private.
- Paths start with `./` or `../` and always include `.js`. They're worked out from the importing file.
- A file can have one `export default`, imported without braces under any name. Rename named imports with `as`, or take everything with `import * as`.
- **In Node:** add a `package.json` with `{ "type": "module" }` (or use `.mjs`). **In the browser:** use `<script type="module">` and open the page with Live Server, because `file:///` pages get a CORS error.
- Modules have their own scope, are always strict, and run only once, so every importer shares the same module.
- `require` and `module.exports` are CommonJS, the older Node style. Recognize it, but write ES modules.

---

**Next:** try the [exercises](exercises.md), then move on to [30 Timers and Callbacks](../30-timers-and-callbacks/notes.md).
