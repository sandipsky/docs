# 50 Tooling

## What is it?

**Tooling** means the helper programs developers use *around* their code: to install other people's code, run tasks, check for mistakes, format code neatly, and bundle everything up for the web.

The most important one is **npm**, which comes with Node.js. You already have it.

## Why does it matter?

So far, every line of code in your projects was written by you. Real projects don't work like that. Why write your own date formatter when a tested, popular one already exists?

Tools also do boring jobs for you:

- **Installing and updating** other people's code (npm).
- **Restarting** your program every time you save (`node --watch`).
- **Formatting** your code the same way every time (Prettier).
- **Catching bugs** before you run anything (ESLint).
- **Bundling and shrinking** your files so websites load faster (Vite).

Every professional JavaScript project uses these tools, so knowing them makes other people's projects much less scary to open.

## Real-world example

Think of a carpenter's workshop:

| In the workshop | In JavaScript |
|---|---|
| A hardware store full of ready-made parts | The **npm registry**: millions of free packages |
| The shopping list for this job | `package.json` |
| The receipt, listing the exact parts bought | `package-lock.json` |
| The storeroom where the parts are kept | The `node_modules` folder |
| Power tools that save hours of hand work | Prettier, ESLint, Vite |

You don't build your own hammer. You pick good tools, and spend your time on the actual furniture.

## How it works

### npm and packages

A **package** is a folder of reusable code that someone published for others to use. The **npm registry** (at npmjs.com) is the huge online library where packages live. **npm** is the program that downloads them for you.

Check that you have it (it came with Node.js in [chapter 01](../01-getting-started/notes.md)):

```
npm --version
```

You'll see a version number, like `11.12.1`. The exact number doesn't matter.

### Starting a project: `package.json`

Every npm project has a `package.json` file: its ID card and shopping list. Make a new folder, open a terminal in it, and run:

```
npm init -y
```

The `-y` means "yes to all the questions". npm writes a `package.json` like this:

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "commonjs"
}
```

> **Watch out:** recent versions of npm write `"type": "commonjs"`. This course uses `import` and `export`, so change it to `"type": "module"`, exactly like in [chapter 29](../29-modules/notes.md). Otherwise Node will refuse your `import` lines.

### Installing a package

Say you want nicer date formatting than chapter 19's `Date`. The popular **dayjs** package does that. Install it:

```
npm install dayjs
```

Three things happen:

1. npm downloads dayjs into a new `node_modules` folder.
2. It adds dayjs to `package.json`, under `dependencies`:

   ```json
   "dependencies": {
     "dayjs": "^1.11.23"
   }
   ```

3. It creates `package-lock.json` (more on that below).

Now you can import it by its name, with no `./` in front:

```js
import dayjs from "dayjs";

const deadline = dayjs("2026-10-01");
console.log("Deadline:", deadline.format("D MMMM YYYY"));
console.log("A week later:", deadline.add(7, "day").format("dddd, D MMM"));
```

You'll see:

```
Deadline: 1 October 2026
A week later: Thursday, 8 Oct
```

`"./math.js"` means "my own file". `"dayjs"` (no dot) means "a package from `node_modules`".

The same command installs anything. For example, `npm install express` installs Express, the popular framework for building web servers that [chapter 49](../49-nodejs-basics/notes.md) mentioned.

### `dependencies` vs `devDependencies`

Some packages are needed while your app *runs*. Others are only needed while you *build* it, like a formatter:

```
npm install --save-dev prettier
```

That puts it in a separate list:

```json
"devDependencies": {
  "prettier": "^3.9.9"
}
```

| List | What goes there | Example |
|---|---|---|
| `dependencies` | Code your app needs to work | dayjs, express |
| `devDependencies` | Tools you only use while developing | prettier, eslint, vite |

Think of it as ingredients (dependencies) versus kitchen tools (devDependencies). The customer eats the ingredients, never the whisk.

### `node_modules`: never share it

`node_modules` can hold thousands of files, because packages depend on other packages. Never copy it around or put it in git. Anyone can re-create it from `package.json` with one command:

```
npm install
```

With no package name, `npm install` installs everything listed in `package.json`. If you use git, add this line to a file called `.gitignore`, so git skips the folder:

```
node_modules
```

### `package-lock.json`: the exact receipt

`package.json` says roughly which versions are okay. `package-lock.json` records the **exact** version of every package that was installed, including the packages your packages use.

Always keep it (and commit it, if you use git). It makes sure everyone on your team, and your server, installs exactly the same code. You never edit it by hand: npm does that.

### Version numbers: what `^1.11.23` means

Packages use **semantic versioning**: three numbers, `MAJOR.MINOR.PATCH`.

| Part | Changes when... | Safe to update? |
|---|---|---|
| `1`.11.23 (major) | Something **breaking** changed. Your code might need fixing. | Careful |
| 1.`11`.23 (minor) | New features were added, nothing broken. | Yes |
| 1.11.`23` (patch) | Only bug fixes. | Yes |

The `^` in front means "this version, or any newer one with the same major number". So `^1.11.23` allows `1.12.0`, but never `2.0.0`.

### npm scripts: named shortcuts

The `scripts` section of `package.json` holds commands you run often:

```json
"scripts": {
  "start": "node index.js",
  "dev": "node --watch index.js",
  "test": "node --test",
  "format": "prettier --write ."
}
```

Run them with `npm run` and the name:

```
npm run dev
npm run format
```

`start` and `test` are special: you can leave out `run` and type `npm start` or `npm test`. Scripts are a great habit. Anyone who opens your project can see how to run it, without asking you.

(`node --test` is the test runner from [chapter 46](../46-testing/notes.md).)

### `npx`: run a tool without a script

`npx` runs a tool from your project's `node_modules` (or downloads it for a one-time run):

```
npx prettier --write index.js
```

### Tools already built into Node

Node itself has two handy tools, so you don't need extra packages for them:

- **`node --watch index.js`** reruns your file every time you save it. Great while you're working. Stop it with `Ctrl + C`.
- **`node --env-file=.env index.js`** reads settings from a `.env` file into `process.env` ([chapter 49](../49-nodejs-basics/notes.md)). Keep secret keys there, never in your code, and add `.env` to `.gitignore` ([chapter 51](../51-security-basics/notes.md)).

For example, with a `.env` file containing `GREETING=Hello from .env`:

```js
console.log(process.env.GREETING);
```

`node --env-file=.env env.js` prints `Hello from .env`. Plain `node env.js` prints `undefined`, because Node only reads the file when you ask it to.

### Prettier: automatic formatting

**Prettier** is a **formatter**: it rewrites your code's spacing, quotes, and line breaks into one consistent style. You stop arguing about style, and just press save.

Before:

```js
const  x={a:1,b:[1,2,3]}
console.log( x )
```

After `npx prettier --write messy.js`:

```js
const x = { a: 1, b: [1, 2, 3] };
console.log(x);
```

In VS Code, install the **Prettier** extension and turn on "Format On Save" in the settings, and it happens every time you save.

### ESLint: a spell-checker for bugs

**ESLint** is a **linter**: a tool that reads your code without running it and warns you about likely bugs, like a variable you never use, or one you use before it exists. It's like the red squiggly lines under spelling mistakes, but for code.

To set it up in a project, run:

```
npm init @eslint/config@latest
```

It asks a few questions (are you using modules? browser or Node?), installs what it needs, and creates a config file. Then check your code with:

```
npx eslint .
```

> **Be honest about versions:** ESLint's setup questions and config format have changed between versions, so the prompts you see may differ a little. The VS Code **ESLint** extension shows the warnings right in your editor.

### Vite: a dev server and bundler for websites

Remember Live Server from [chapter 29](../29-modules/notes.md)? **Vite** (French for "quick", said "veet") is the professional version. Create a new project with:

```
npm create vite@latest
```

It asks for a project name and a framework (choose **Vanilla** and **JavaScript** for plain JavaScript). Then:

```
cd my-project
npm install
npm run dev
```

`npm run dev` starts a local server and prints an address like `http://localhost:5173`. Every time you save, the page updates instantly.

When the site is ready to publish, `npm run build` creates a `dist` folder with your files **bundled** (many files joined into a few) and **minified** (spaces, comments, and long names removed, so files download faster). You upload `dist`, not your source files.

(The exact prompts can change between Vite versions, but the idea stays the same.)

### What's next: TypeScript

Many projects also use **TypeScript**: JavaScript plus labels for what type each value should be. A tool checks those labels and catches mistakes like passing a string where a number belongs. It'll get its own folder after this course.

## Common mistakes

**1. Forgetting to change `"type"`**

```js
import dayjs from "dayjs";
// SyntaxError: Cannot use import statement outside a module
```

`npm init -y` wrote `"type": "commonjs"`. Change it to `"type": "module"` in `package.json`.

**2. Putting `./` in front of a package name**

```js
import dayjs from "./dayjs"; // looks for YOUR file called dayjs
```

Packages are imported by their bare name: `import dayjs from "dayjs";`.

**3. Sharing or committing `node_modules`**

It's huge, and it can be re-created any time with `npm install`. Share `package.json` and `package-lock.json` instead.

**4. Running `npm install` in the wrong folder**

If there's no `package.json` in the folder, npm may create files in the wrong place. Check that your terminal is in your project folder first (just like `node` in chapter 01).

**5. Installing a package for a tiny job**

Every package is someone else's code in your project, and a possible security risk ([chapter 51](../51-security-basics/notes.md)). If ten lines of your own code can do it, write the ten lines.

## Quick recap

- npm installs packages from the npm registry. `package.json` lists them, `package-lock.json` pins exact versions, and `node_modules` stores them.
- `npm init -y` starts a project. Change `"type"` to `"module"` to use `import`.
- Use `dependencies` for code your app needs, and `devDependencies` (`--save-dev`) for tools.
- `^1.2.3` accepts newer minor and patch versions, never a new major one.
- npm scripts (`npm run dev`, `npm test`) are named shortcuts. `npx` runs a tool once.
- Node has `--watch` and `--env-file` built in. Prettier formats, ESLint catches bugs, and Vite serves and bundles websites.

---

**Next:** try the [exercises](exercises.md), then move on to [51 Security Basics](../51-security-basics/notes.md).
