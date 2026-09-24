# 49 Node.js Basics

## What is it?

**Node.js** (or just Node) is a program that runs JavaScript outside the browser: on your own computer, or on a server.

You've used it since [chapter 01](../01-getting-started/notes.md) to run your files. In this chapter, you'll use the things that only Node can do: read and write files, take commands from the terminal, and run your own web server.

## Why does it matter?

Browsers keep JavaScript in a **sandbox**: a closed-off, safe area. A website can't read the files on your computer or start programs, and that's a good thing.

Node has no sandbox. Your code can read and write files, start a server, and talk to databases. That's why Node is everywhere:

- **Servers and APIs.** The back end of a website, the part that runs on the server, can be written in JavaScript. An API like the ones you fetched from in [chapter 33](../33-fetch-and-apis/notes.md) can be built with Node.
- **Command-line tools.** npm, the tool you'll meet in [chapter 50](../50-tooling/notes.md), is written in JavaScript and runs on Node. So are many other developer tools.
- **Desktop apps.** VS Code runs on JavaScript, using a tool called Electron, which combines Chrome's engine with Node.

And there's no new language to learn. Everything you know about JavaScript works in Node too.

## Real-world example

Think of the same engine in two different cars.

A car company can put the exact same engine into a family car or a delivery van. The engine works the same way, but the controls around it are different: the family car has seats and a radio, the van has a cargo door and a big loading space.

JavaScript engines work like this. Chrome and Edge use an engine called **V8** to run JavaScript. Node uses V8 too, so your JavaScript runs the same way. What changes is what's around the engine:

| | Chrome | Node.js |
|---|---|---|
| The engine | V8 | V8 (the same one) |
| What it's built into | A web browser | A program in your terminal |
| What it's connected to | A web page and the person looking at it | Your computer's files, terminal, and network |
| Extra tools it gives you | `document`, `window`, `alert`, `localStorage` | `process`, files (`fs`), paths (`path`), servers (`http`) |
| Built for | Showing pages to people | Running programs and servers |

## How it works

### Same language, different surroundings

Everything from the language itself works in Node: variables, functions, arrays, objects, classes, promises, `async`/`await`, timers, `console`, and even `fetch`.

What's missing is everything that belongs to a web page. There's no page in Node, so there's no `document`, no `window`, no `alert`, and no `localStorage`:

```js
console.log(typeof window);     // prints: undefined
console.log(typeof globalThis); // prints: object

console.log(document.title);
// ReferenceError: document is not defined
```

In the browser, the **global object** (the object that holds everything available everywhere) is called `window`. In Node, it's called `global`. `globalThis` is the name that works in both, so use it if your code needs to run in either place.

What Node adds instead is a set of tools for talking to your computer. You'll meet them one by one in this chapter.

> **Reminder:** all the examples in this chapter are ES modules, so they use `import`. Put a `package.json` containing `{ "type": "module" }` in your chapter folder, like you learned in [chapter 29](../29-modules/notes.md). One is enough: Node uses the nearest `package.json` it can find, looking upward from your file's folder.

### Built-in modules and the `node:` prefix

Node comes with a toolbox of **built-in modules**: modules that are part of Node itself, so there's nothing to install. You import them like any other module, with `node:` in front of the name:

```js
import { readFile } from "node:fs/promises";
import path from "node:path";
import http from "node:http";
```

The `node:` prefix makes it clear that this is one of Node's own modules, not a package somebody installed. You'll still see `import ... from "fs"` without the prefix in older code. It works too, but `node:` is the modern habit.

Here are the ones you'll use in this chapter:

| Module | What it's for |
|---|---|
| `node:fs/promises` | Reading and writing files and folders ("fs" stands for file system) |
| `node:path` | Building file paths that work on every computer |
| `node:readline/promises` | Asking questions in the terminal |
| `node:http` | Running a web server |
| `node:events` | `EventEmitter`, Node's built-in version of the observer pattern |

### `process`: information about your program

`process` is a global object, so you don't need to import it. It holds information about the program that's running right now.

**`process.argv`** holds the **command-line arguments**: the extra words you type after the file name when you run it. Save this as `greet.js`:

```js
console.log(process.argv);
```

Then run `node greet.js Sam 30`. You'll see something like this (your paths will be different):

```
[
  'C:\\Program Files\\nodejs\\node.exe',
  'C:\\Users\\you\\JavaScript\\49-nodejs-basics\\greet.js',
  'Sam',
  '30'
]
```

The first two items are always the Node program itself and your file. (The doubled backslashes are just how Node shows a single `\` inside a string, like the escape characters from [chapter 06](../06-strings/notes.md).) Your own words start at index 2, so skip the first two with `slice(2)` and destructure the rest:

```js
const [name, age] = process.argv.slice(2);
console.log(`Hi ${name}, you are ${age}.`);
```

Now `node greet.js Sam 30` prints `Hi Sam, you are 30.`

> **Watch out:** arguments are always strings, just like form values ([chapter 22](../22-forms/notes.md)). If you run `node add.js 2 3` and add them with `+`, you get `"23"`. Convert them with `Number()` first.

**`process.env`** holds the **environment variables**: named settings that live outside your program, in the terminal or on the computer. They're used for things that change from one computer to another, like which port a server uses, or a secret key that must never be written in your code ([chapter 51](../51-security-basics/notes.md)).

```js
const port = process.env.PORT ?? 3000;
console.log(`Using port ${port}`);
```

Save it as `env.js` and run `node env.js`, and you'll see `Using port 3000`, the default. To set a variable in PowerShell (the VS Code terminal on Windows), type `$env:PORT = "4000"`, then run the file again: `Using port 4000`. It stays set until you close that terminal. (On macOS and Linux, you'd write `PORT=4000 node env.js`.) Like arguments, environment variables are always strings.

**`process.exit(code)`** stops your program immediately. The **exit code** tells whoever started the program how it went: `0` means success, and any other number means something went wrong.

```js
const [name] = process.argv.slice(2);

if (name === undefined) {
  console.error("Please give me a name, like: node hello.js Sam");
  process.exit(1);
}

console.log(`Hello, ${name}!`);
```

Run `node hello.js` without a name, and it prints the message and stops with code 1. Nothing after `process.exit` runs. Other programs and tools check this code to know whether your program worked. In PowerShell, you can see it yourself by typing `$LASTEXITCODE` after the program finishes.

**`process.cwd()`** returns the **current working directory**: the folder your terminal is standing in. As you'll see in a moment, that isn't always the folder your file is in.

### Reading and writing files

In the browser, you saved data in `localStorage`, the wall of labeled lockers from [chapter 23](../23-json-and-local-storage/notes.md). In Node, you get the whole file system: real files and folders that are still there after your program stops.

The functions in `node:fs/promises` return promises, so you `await` them ([chapter 32](../32-async-await/notes.md)). Top-level `await` works because these are modules.

```js
import { writeFile, appendFile, readFile } from "node:fs/promises";

await writeFile("shopping.txt", "milk\n");   // creates the file (or replaces it)
await appendFile("shopping.txt", "bread\n"); // adds to the end
await appendFile("shopping.txt", "eggs\n");

const text = await readFile("shopping.txt", "utf8");
console.log(text.trim().split("\n")); // prints: [ 'milk', 'bread', 'eggs' ]
```

Run it, and a `shopping.txt` file appears in your folder. Open it in VS Code: it holds three lines.

- **`writeFile(file, text)`** creates the file, or **replaces everything in it** if it already exists.
- **`appendFile(file, text)`** adds to the end of the file, and creates it if it's missing.
- **`readFile(file, "utf8")`** reads the whole file as a string. The `"utf8"` is the **encoding**: the rule for turning the bytes stored on the disk back into text. Leave it out, and you get raw bytes instead of text (see Common mistakes).

Folders work the same way:

```js
import { mkdir, writeFile, readdir } from "node:fs/promises";

await mkdir("reports", { recursive: true }); // no error if it already exists
await writeFile("reports/january.txt", "Sales: 120");
await writeFile("reports/february.txt", "Sales: 95");

const files = await readdir("reports");
console.log(files); // prints: [ 'february.txt', 'january.txt' ]
```

`readdir` gives you an array of the names in a folder. (The order comes from the operating system. On Windows it's alphabetical, but if the order matters to you, sort the array.) Without `{ recursive: true }`, `mkdir` throws an error when the folder already exists. With it, there's no error, and it also creates any missing folders along the way, like `photos/2026/june` in one go.

When something goes wrong, these functions throw errors with a `code` property that tells you what happened. The one you'll see most is `ENOENT`, short for "Error: NO ENTry", which means the file or folder doesn't exist:

```js
import { readFile } from "node:fs/promises";

try {
  const settings = await readFile("settings.json", "utf8");
  console.log(settings);
} catch (error) {
  console.log(error.code); // prints: ENOENT
}
```

### Paths: finding the right file

There's a trap in the code above. A **relative path** like `"shopping.txt"` doesn't mean "next to my file". It means "in the folder my terminal is standing in", which is `process.cwd()`.

Say your file lives in `JavaScript/49-nodejs-basics` and reads `"welcome.txt"` from that same folder. From inside that folder, it works. But run it from the `JavaScript` folder with `node 49-nodejs-basics/read-welcome.js`, and Node looks for `JavaScript/welcome.txt` instead:

```
Error: ENOENT: no such file or directory, open 'C:\...\JavaScript\welcome.txt'
```

The fix is to build the full path from the folder your file is in. In an ES module, that's `import.meta.dirname`, and the built-in `node:path` module joins the pieces together for you:

```js
import { readFile } from "node:fs/promises";
import path from "node:path";

const welcomeFile = path.join(import.meta.dirname, "welcome.txt");
const text = await readFile(welcomeFile, "utf8");
console.log(text);
```

Now it works from any folder. `import.meta.dirname` is the full path of the folder the current file is in, like `C:\Users\you\JavaScript\49-nodejs-basics`.

Why `path.join` and not `+`? Windows separates folders with `\`, while macOS and Linux use `/`. `path.join` uses the right one for the computer it's running on, and tidies up doubled or missing slashes. Two more helpers from `node:path` are handy:

```js
import path from "node:path";

const receipt = path.join("receipts", "2026", "june.pdf");
console.log(receipt);                   // prints: receipts\2026\june.pdf (on Windows)
console.log(path.basename(receipt));    // prints: june.pdf
console.log(path.extname(receipt));     // prints: .pdf
```

`basename` gives you the last part of a path (usually the file name), and `extname` gives you the **extension**, the ending that tells you what kind of file it is.

> **Tip:** `import.meta.dirname` is fairly new (Node 20.11 and later). In older ES module tutorials, you'll see a longer trick with `fileURLToPath`, and in CommonJS files you'll see `__dirname`. They all do the same job.

### Asking questions in the terminal

Arguments are great when you know everything up front. Sometimes you'd rather ask, like a form in the terminal. That's what `node:readline/promises` is for:

```js
import readline from "node:readline/promises";

const rl = readline.createInterface({
  input: process.stdin,   // read what the user types
  output: process.stdout, // show the questions in the terminal
});

const bill = Number(await rl.question("How much was the bill? "));
const percent = Number(await rl.question("What percent tip? "));
rl.close(); // done asking: let the program finish

const tip = bill * (percent / 100);
console.log(`Tip: $${tip.toFixed(2)}, total: $${(bill + tip).toFixed(2)}`);
```

`process.stdin` is what you type on the keyboard, and `process.stdout` is the terminal output. `rl.question()` shows the question, waits for you to type an answer and press `Enter`, then gives you the answer as a string. Here's a run, where `42.80` and `20` are typed in:

```
How much was the bill? 42.80
What percent tip? 20
Tip: $8.56, total: $51.36
```

Don't forget `rl.close()`. Until you close `rl`, it keeps listening for more typing, so your program never finishes.

### Build it: a notes app for the terminal

Time to put files, paths, and arguments together. You'll build a tiny notes app that you use like this:

```
node notes.js add Buy milk
node notes.js list
node notes.js remove 1
```

The notes are saved in a `notes.json` file next to `notes.js`, so they're still there next time. Start with loading and saving, using JSON from [chapter 23](../23-json-and-local-storage/notes.md):

```js
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const NOTES_FILE = path.join(import.meta.dirname, "notes.json");

async function loadNotes() {
  try {
    const text = await readFile(NOTES_FILE, "utf8");
    return JSON.parse(text);
  } catch (error) {
    if (error.code === "ENOENT") {
      return []; // no file yet: start with an empty list
    }
    throw error; // anything else is a real problem
  }
}

async function saveNotes(notes) {
  await writeFile(NOTES_FILE, JSON.stringify(notes, null, 2));
}
```

The first time you run the app, there's no `notes.json` yet. That's not really an error, so `loadNotes` starts with an empty list. Any other problem (like broken JSON) is re-thrown, just like in [chapter 18](../18-error-handling/notes.md).

Next come the three commands:

```js
async function addNote(text) {
  const notes = await loadNotes();
  notes.push(text);
  await saveNotes(notes);
  console.log(`Added note ${notes.length}: ${text}`);
}

async function listNotes() {
  const notes = await loadNotes();
  if (notes.length === 0) {
    console.log("No notes yet.");
    return;
  }
  notes.forEach((note, index) => {
    console.log(`${index + 1}. ${note}`);
  });
}

async function removeNote(numberText) {
  const notes = await loadNotes();
  const number = Number(numberText);
  if (!Number.isInteger(number) || number < 1 || number > notes.length) {
    console.error(`There's no note number ${numberText}.`);
    process.exit(1);
  }
  const [removed] = notes.splice(number - 1, 1);
  await saveNotes(notes);
  console.log(`Removed: ${removed}`);
}
```

People count notes from 1, but arrays count from 0, so `removeNote` subtracts 1 before calling `splice` ([chapter 10](../10-arrays/notes.md)). A bad number, like `abc` or `7` when there are only 2 notes, stops the program with exit code 1.

Finally, read the command and hand it to the right function:

```js
const [command, ...words] = process.argv.slice(2);

if (command === "add") {
  await addNote(words.join(" "));
} else if (command === "list") {
  await listNotes();
} else if (command === "remove") {
  await removeNote(words[0]);
} else {
  console.log("Usage: node notes.js add <text> | list | remove <number>");
}
```

The rest parameter ([chapter 15](../15-destructuring-spread-rest/notes.md)) collects every word after the command, so `add Buy milk` and `add "Buy milk"` both save `Buy milk`. Here's a session. The lines starting with `>` are what you type:

```
> node notes.js add Buy milk
Added note 1: Buy milk
> node notes.js add "Call the dentist"
Added note 2: Call the dentist
> node notes.js list
1. Buy milk
2. Call the dentist
> node notes.js remove 1
Removed: Buy milk
> node notes.js list
1. Call the dentist
```

Open `notes.json` in VS Code, and you'll see your notes saved as a JSON array. A program that you control by typing commands in the terminal like this is called a **CLI** (command-line interface). Many developer tools, like `node` itself and npm, are CLIs.

### Build it: a tiny web API

In [chapter 33](../33-fetch-and-apis/notes.md), you were the customer. You sent your order with `fetch`, and the API was the waiter who brought back your food. Now you'll build the kitchen: a **server**, a program that waits for requests and answers them.

Save this as `server.js`:

```js
import http from "node:http";

const books = [
  { id: 1, title: "The Hobbit", available: true },
  { id: 2, title: "Dune", available: false },
  { id: 3, title: "Matilda", available: true },
];

function sendJSON(response, status, data) {
  response.writeHead(status, { "Content-Type": "application/json" });
  response.end(JSON.stringify(data));
}

const server = http.createServer((request, response) => {
  console.log(`${request.method} ${request.url}`);

  if (request.method === "GET" && request.url === "/books") {
    sendJSON(response, 200, books);
  } else {
    sendJSON(response, 404, { error: "Not found" });
  }
});

server.listen(3000, () => {
  console.log("Library API running at http://localhost:3000/books");
});
```

Here's what each part does:

- **`http.createServer(...)`** makes the server. The function you give it runs once for **every request** that arrives.
- **`request`** is what the client asked for. `request.method` is the HTTP method, like `"GET"`, and `request.url` is the part of the address after the port, like `"/books"`.
- **`response`** is your answer. `writeHead` sets the status code and the headers (`Content-Type` tells the client "this is JSON"), and `end` sends the body and finishes the answer.
- **`server.listen(3000, ...)`** starts listening on port 3000, the "door number" from [chapter 29](../29-modules/notes.md). **`localhost`** means "this computer".

Run `node server.js`. It prints its message and then... keeps running. That's what servers do: they wait for requests. You'll stop it later with `Ctrl + C`, just like the infinite loops in [chapter 08](../08-loops/notes.md).

While it runs, open `http://localhost:3000/books` in your browser, and you'll see your books as JSON. Your server's terminal prints `GET /books`. You may also see `GET /favicon.ico`: browsers ask every site for the little icon on the tab. Your server answers 404, which is fine.

Now fetch from your own API with JavaScript. The server is busy in its terminal, so open a **second** terminal (the `+` button in VS Code's terminal panel) and run this `client.js`:

```js
const response = await fetch("http://localhost:3000/books");
console.log(response.status); // prints: 200
console.log(await response.json());

const missing = await fetch("http://localhost:3000/movies");
console.log(missing.status, await missing.json()); // prints: 404 { error: 'Not found' }
```

You'll see:

```
200
[
  { id: 1, title: 'The Hobbit', available: true },
  { id: 2, title: 'Dune', available: false },
  { id: 3, title: 'Matilda', available: true }
]
404 { error: 'Not found' }
```

And the server's terminal shows each request as it arrives:

```
Library API running at http://localhost:3000/books
GET /books
GET /movies
```

That's a real API, and your own `fetch` code talks to it exactly the way it talked to JSONPlaceholder. When you're done, click the server's terminal and press `Ctrl + C` to stop it.

> **Tip:** `request.url` includes any query string, so `/books?available=true` isn't equal to `"/books"`. To read the path and the query separately, use the `URL` class from chapter 33: `new URL(request.url, "http://localhost")` gives you `.pathname` and `.searchParams`.

### `EventEmitter`: Node's built-in observer

In [chapter 44](../44-design-patterns/notes.md), you built a tiny emitter with `on`, `off`, and `emit`: the subscribe button and bell. Node has a fuller version built in, called `EventEmitter`, with the same method names:

```js
import { EventEmitter } from "node:events";

const orders = new EventEmitter();

// Two different parts of the app listen for the same event
orders.on("placed", (order) => {
  console.log(`Kitchen: start making a ${order.dish}`);
});
orders.on("placed", (order) => {
  console.log(`Email: thanks for your order, ${order.customer}!`);
});

orders.emit("placed", { dish: "pizza", customer: "Ana" });
orders.emit("placed", { dish: "salad", customer: "Raj" });
```

You'll see:

```
Kitchen: start making a pizza
Email: thanks for your order, Ana!
Kitchen: start making a salad
Email: thanks for your order, Raj!
```

`off` removes a listener (it needs the same function, just like `removeEventListener`), and `once` adds a listener that removes itself after the first time, like the `once` from chapter 44's exercises. One difference from your own `Emitter`: Node's `on` doesn't return an unsubscribe function. It returns the emitter itself, so to unsubscribe, give your listener a name and pass it to `off`.

`EventEmitter` matters because Node uses it everywhere. Your HTTP server is an event emitter, and so is `process`. For example, a server emits an `error` event when it can't start. You can listen for it and give a friendlier message than a crash:

```js
server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error("Port 3000 is busy. Is the server already running in another terminal?");
    process.exit(1);
  }
  throw error;
});
```

### CommonJS vs ES modules: a quick recap

You'll meet a lot of older Node code that uses **CommonJS**, Node's original module system, which you met in [chapter 29](../29-modules/notes.md). Here's how to read it:

| | ES modules (this course) | CommonJS (older code) |
|---|---|---|
| Import something | `import path from "node:path";` | `const path = require("node:path");` |
| Export something | `export function addTax() {}` | `module.exports = { addTax };` |
| This file's folder | `import.meta.dirname` | `__dirname` |
| Top-level `await` | Yes | No |
| How Node knows | `"type": "module"` in `package.json`, or a `.mjs` file | `"type": "commonjs"`, a `.cjs` file, or (usually) no `"type"` at all |

Stick with ES modules in your own code. They're the standard, and they work the same in the browser and in Node.

### Where to go from here

The `node:http` module is great for learning how servers work, but real servers need a lot more: many routes, reading data sent with `POST`, and security checks. That's what **frameworks** are for. A framework is a ready-made set of tools that handles the repetitive parts, so you only write what's special about your app. The popular ones for Node are **Express**, **Fastify**, and **Hono**. You install them with npm, which is the next chapter.

## Common mistakes

**1. Using browser-only tools in Node**

```js
localStorage.setItem("theme", "dark");
// ReferenceError: localStorage is not defined
```

Node has no web page, so there's no `document`, `window`, `alert`, or `localStorage`. To save data in Node, write it to a file with `node:fs/promises`, like the notes app does.

**2. Forgetting `"utf8"` when reading a file**

```js
const text = await readFile("shopping.txt");
console.log(text); // prints: <Buffer 6d 69 6c 6b 0a 62 72 65 61 64 0a 65 67 67 73 0a>
```

Without an encoding, Node gives you a **Buffer**: the raw bytes of the file, shown as numbers. Add `"utf8"` as the second argument, and you get text: `readFile("shopping.txt", "utf8")`.

**3. Forgetting `await`**

```js
const text = readFile("shopping.txt", "utf8"); // forgot await
console.log(text); // prints: Promise { <pending> }
```

The functions in `node:fs/promises` return promises. Without `await`, you get the promise itself, not what's in the file ([chapter 32](../32-async-await/notes.md)).

**4. Using `require` or `__dirname` in an ES module**

```js
const fs = require("node:fs");
// ReferenceError: require is not defined in ES module scope, you can use import instead
```

Code copied from older tutorials often uses CommonJS. In an ES module, use `import` instead of `require`, and `import.meta.dirname` instead of `__dirname` (which fails with `ReferenceError: __dirname is not defined in ES module scope`).

**5. Starting the server twice**

```
Error: listen EADDRINUSE: address already in use :::3000
```

Only one program can listen on a port at a time. This almost always means your server is still running in another terminal. Find that terminal, press `Ctrl + C`, and start it again.

**6. A request that never gets an answer**

```js
const server = http.createServer((request, response) => {
  if (request.url === "/books") {
    sendJSON(response, 200, books);
  }
  // no else: any other request never gets an answer!
});
```

There's no error message, which makes this one confusing. A request for `/movies` just hangs: the browser's loading spinner keeps spinning, and `fetch` waits and waits. Every request needs exactly one answer, so make sure every path through your code ends with `response.end()`, like the 404 `else` in `server.js`.

## Quick recap

- Node runs JavaScript outside the browser, on the same V8 engine as Chrome. There's no `document` or `window`. Instead, you get `process` and built-in modules like `node:fs/promises`, `node:path`, and `node:http`.
- `process.argv.slice(2)` gives you the command-line arguments and `process.env` the environment variables. Both are always strings. `process.exit(1)` stops the program and reports a problem.
- `readFile`, `writeFile`, `appendFile`, `mkdir`, and `readdir` all return promises, so `await` them, and pass `"utf8"` to read text.
- Build file paths with `path.join(import.meta.dirname, ...)`, so your program finds its files whichever folder the terminal is in.
- `node:readline/promises` asks questions in the terminal (don't forget `rl.close()`), and `node:http` lets you build your own API that `fetch` can talk to.
- `EventEmitter` (`on`, `off`, `once`, `emit`) is Node's built-in observer, and much of Node is built on it.
- Write ES modules, and recognize CommonJS (`require`, `module.exports`, `__dirname`) when you see it in older code.

---

**Next:** try the [exercises](exercises.md), then move on to [50 Tooling](../50-tooling/notes.md).
