# 50 Tooling: Exercises

**How to do these:**

- Make a folder called `practice` inside this chapter folder, and a new folder inside it for each exercise (`practice/ex1`, `practice/ex2`, ...).
- Open the terminal **in that exercise's folder** before running any `npm` command.
- These exercises download packages, so you need to be online.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your `package.json` and code.

---

## Exercise 1 (Easy): Your first package.json

Create a project for a "birthday countdown" app.

1. Run `npm init -y` in `practice/ex1`.
2. Open `package.json` and change the `"type"` so `import` works.
3. Change the `"description"` to `"Counts the days until my birthday"`.
4. Answer in your own words: what is the `"version"` of your project, and which part of it would you change if you fixed a small bug?

<details>
<summary>Hint</summary>

The notes' "Watch out" box says which value `"type"` needs. For the last question, look at the semantic versioning table: MAJOR.MINOR.PATCH.

</details>

---

## Exercise 2 (Easy): Install and use dayjs

In the same project, install dayjs and write `index.js` so it prints the number of days until a fixed date.

Use this date so your output matches:

```js
const today = dayjs("2026-09-24");
const birthday = dayjs("2026-12-25");
```

Expected output:

```
Days until my birthday: 92
```

<details>
<summary>Hint 1</summary>

Install with `npm install dayjs`, then `import dayjs from "dayjs";` at the top of `index.js`.

</details>

<details>
<summary>Hint 2</summary>

dayjs objects have a `.diff()` method: `later.diff(earlier, "day")` gives the number of days between them.

</details>

---

## Exercise 3 (Medium): Scripts for everything

Add these npm scripts to your `package.json`, and check that each one works:

| Command | What it should do |
|---|---|
| `npm start` | Run `index.js` once |
| `npm run dev` | Run `index.js` again every time you save it |
| `npm run format` | Format all your files with Prettier |

Prettier is a tool you only need while developing. Install it in the right list.

Test `npm run dev` by changing the birthday date and saving: the new number should appear by itself. Stop it with `Ctrl + C`.

<details>
<summary>Hint 1</summary>

Node has a built-in flag that reruns a file on save. It's in the notes, under "Tools already built into Node".

</details>

<details>
<summary>Hint 2</summary>

`npm install --save-dev prettier` puts it under `devDependencies`. The format command is `prettier --write .` (the dot means "this whole folder").

</details>

---

## Exercise 4 (Medium): Keep a secret out of your code

A weather app needs a (pretend) API key. Right now it's written straight in the code:

```js
const apiKey = "pretend-key-123";
console.log("Using key that starts with:", apiKey.slice(0, 7));
```

Move the key into a `.env` file, and change the code so it reads the key from `process.env`. Add an npm `start` script that loads the `.env` file.

Expected output of `npm start`:

```
Using key that starts with: pretend
```

Then create a `.gitignore` file that would stop both `.env` and `node_modules` from being shared.

<details>
<summary>Hint 1</summary>

In `.env`, write one line: `API_KEY=pretend-key-123` (no quotes, no spaces around `=`).

</details>

<details>
<summary>Hint 2</summary>

Node only reads `.env` when you pass `--env-file=.env` before the file name. Put that in your `start` script.

</details>

---

## Exercise 5 (Challenge): Rebuild the birthday app with Vite

Turn the birthday countdown into a small web page, using Vite as the dev server.

**Must-haves:**
- Create the project with `npm create vite@latest` (choose Vanilla and JavaScript).
- Install dayjs in the new project.
- Show "N days until my birthday" on the page, using the DOM ([chapter 20](../20-dom-basics/notes.md)) and **today's real date** this time.
- Run it with `npm run dev`, then create the production version with `npm run build`.

After the build, open the `dist` folder and look inside the `.js` file. Answer: what does minified code look like, and why is it smaller?

<details>
<summary>Hint 1</summary>

Vite's starter has a `main.js` and an `index.html` with a `<div id="app">`. You can replace everything in `main.js` with your own code.

</details>

<details>
<summary>Hint 2</summary>

`dayjs()` with no argument means "right now".

</details>

---

## Before you move on

You just installed code written by strangers into your project. How do you know it's safe? [Chapter 51](../51-security-basics/notes.md) covers that, along with the most common security holes in JavaScript apps.
