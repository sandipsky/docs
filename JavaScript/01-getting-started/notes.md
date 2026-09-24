# 01 Getting Started

## What is it?

JavaScript (JS for short) is a **programming language**: a way to give instructions to a computer, the way a recipe gives instructions to a cook.

It's best known as the language of the web. Every modern web browser understands it.

## Why does it matter?

Without JavaScript, a web page just sits there. With it, things happen:

- You click "Like" and the heart turns red.
- You type in a search box and suggestions pop up.
- You drag a map and new places load in.

And it's not only for web pages. A tool called **Node.js** lets JavaScript run outside the browser too, powering servers, command-line tools, and desktop apps. Even VS Code, the editor you're using right now, runs on JavaScript.

So you learn one language and can use it almost everywhere. That's why it's a great first language.

## Real-world example

Think of a web page as a house:

| Part | Its job | In the house |
|---|---|---|
| **HTML** | Structure: headings, text, buttons | The walls and rooms |
| **CSS** | Looks: colors, fonts, layout | The paint and furniture |
| **JavaScript** | Behavior: what happens when you do something | The electricity: flip a switch and the light turns on |

## How it works

There are two easy ways to run JavaScript.

### Way 1: The browser console (try it right now)

The console is a little box in your browser where you can type JavaScript and see the result straight away.

1. Open Chrome or Edge.
2. Press `F12`, then click the **Console** tab.
3. Type this and press `Enter`:

```js
console.log("Hello, world!");
```

You'll see:

```
Hello, world!
```

🎉 You just ran your first JavaScript!

The console is like a scratchpad. It's great for quick experiments, but everything disappears when you close it.

### Way 2: A file and Node.js (we'll use this most)

To keep your code, save it in a file and run it with Node.js.

**Step 1: Check that Node.js is installed.** In VS Code, open the terminal (**Terminal → New Terminal**) and type:

```
node --version
```

If you see a version number (like `v24.15.0`), you're all set. The exact number doesn't matter.
If you get an error, download Node.js from [nodejs.org](https://nodejs.org) and pick the **LTS** version. LTS stands for "Long Term Support", which just means the stable one.

**Step 2: Create a file** called `hello.js` in this folder and write:

```js
console.log("Hello, world!");
```

**Step 3: Run it.** In VS Code, right-click this folder, choose **Open in Integrated Terminal**, and type:

```
node hello.js
```

You'll see `Hello, world!` printed in the terminal.

> The terminal has to be "standing in" the same folder as your file. Otherwise Node.js can't find it.

### What is `console.log`?

`console.log()` prints something on the screen. It's how your program talks back to you. You'll use it all the time to check what your code is doing.

```js
console.log("Hello, world!");
```

- `console` is the output screen.
- `.log` means "write this down".
- `( )` holds what you want to write.
- `"Hello, world!"` is the text. Text always goes inside quotes.

### Text vs. numbers

```js
console.log("5 + 3"); // prints: 5 + 3
console.log(5 + 3);   // prints: 8
```

- **With quotes**, JavaScript treats it as text and prints it exactly as written. Text in programming is called a **string** (a "string" of characters).
- **Without quotes**, JavaScript treats it as numbers and does the math.

You can print several things at once by separating them with commas. JavaScript adds a space between them:

```js
console.log("Total:", 5 + 3); // prints: Total: 8
```

### Comments

A **comment** is a note for humans. JavaScript ignores it completely.

```js
// This is a one-line comment.
console.log("Hi"); // A comment can also go at the end of a line.

/*
  This is a multi-line comment.
  It's handy for longer explanations.
*/
```

Think of comments as sticky notes in a textbook. They don't change the book, but they help you (and others) understand it later.

### Code runs from top to bottom

```js
console.log("Step 1: Boil water");
console.log("Step 2: Add pasta");
console.log("Step 3: Eat!");
```

Each line is a **statement**, which is one instruction. JavaScript runs them in order, like the steps in a recipe.

The `;` at the end marks the end of a statement, like a full stop at the end of a sentence. JavaScript often works without it, but get into the habit of using it. It prevents some rare, confusing bugs.

## Common mistakes

**1. Forgetting quotes around text**

```js
console.log(Hello);
// ReferenceError: Hello is not defined
```

Without quotes, JavaScript thinks `Hello` is the name of something it should already know about. Fix: `console.log("Hello");`

**2. Mixing quote types**

```js
console.log("Hello');
// SyntaxError: Invalid or unexpected token
```

Start and end with the same kind of quote. Both `"Hello"` and `'Hello'` work, just don't mix them.

**3. Wrong capital letters**

```js
Console.log("Hi");
// ReferenceError: Console is not defined
```

JavaScript is **case-sensitive**. To JavaScript, `console` and `Console` are two different words.

**4. Forgetting the closing bracket**

```js
console.log("Hi";
// SyntaxError: missing ) after argument list
```

Every `(` needs a matching `)`.

**5. Running `node` from the wrong folder**

```
Error: Cannot find module '...\hello.js'
```

Your terminal isn't in the same folder as your file. Open the terminal from the right folder and try again.

> **Tip:** Error messages are your friend, not your enemy. Read them. They tell you *what* went wrong and *which line* it's on.

## Quick recap

- JavaScript makes web pages interactive, and with Node.js it runs almost anywhere.
- Use the browser console for quick experiments. Use `node filename.js` to run a saved file.
- `console.log()` prints things to the screen.
- Text needs quotes. Numbers and math don't.
- `//` and `/* */` are comments: notes for humans that JavaScript ignores.
- JavaScript is case-sensitive and runs your code from top to bottom.

---

**Next:** try the [exercises](exercises.md), then move on to [02 Variables](../02-variables/notes.md).
