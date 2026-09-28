# 01 Getting Started

## What is it?

**React** is a JavaScript library for building **user interfaces**, or **UI**: the part of an app you see and click, like buttons, lists, and forms.

You describe what the screen should look like for your data. React makes the real page match that description, and keeps it matching whenever the data changes.

In this course, you'll write React with **TypeScript**, just like most professional React teams do. Everything you learned in the [TypeScript course](../../TypeScript/README.md) works here.

## Why does it matter?

Remember the stadium scoreboard from your [to-do app in JavaScript chapter 24](../../JavaScript/24-project-todo-app/notes.md)? You changed the `tasks` array, then called `render()` to redraw the page. That `render()` function was a lot of work. You emptied the list, built every `<li>` with `createElement`, and had to remember to call it after *every* change.

Here's a tiny version of that problem: a button that counts its own clicks, written the plain DOM way ([JavaScript chapters 20 and 21](../../JavaScript/21-events/notes.md)):

```js
let count = 0;
const button = document.querySelector("#counter");

button.addEventListener("click", () => {
  count = count + 1;                             // job 1: change the data
  button.textContent = `Clicked ${count} times`; // job 2: update the page yourself
});
```

You have two jobs: change the data, *and* update the page. Forget job 2, and the page shows the wrong number. In one button, that's easy to remember. In a real app, with dozens of things on screen depending on the same data, it's where most bugs come from.

Here's the same button in React:

```tsx
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  );
}
```

Don't worry about the details yet. The HTML-like part is [chapter 02](../02-jsx/notes.md), `onClick` is chapter 07, and `useState` is chapter 08. Just notice what's missing: there's no `querySelector` and no `textContent`. You only describe what the button should look like for any `count`. When `count` changes, React updates the page for you.

(And there are no type annotations, either. TypeScript infers that `count` is a number from the `0`, just like in [TypeScript chapter 02](../../TypeScript/02-basic-types/notes.md).)

That's what React gives you:

- **The page always matches your data.** You change the data. React does the redrawing, so you can't forget.
- **Reusable pieces.** You build a piece of UI once, like a product card, and use it as many times as you want. These pieces are called **components**.
- **A huge community.** React is the most popular tool for building web apps. It's used by a lot of companies, and there's a library for almost every job (Level 4 of this course covers the popular ones).

## Real-world example

Think about getting a taxi.

| Getting a taxi | React |
|---|---|
| You tell the driver the address | You describe what the screen should show |
| The driver picks the turns | React works out which parts of the page to change |
| You change your mind, and the driver re-routes | Your data changes, and React updates the page |
| Giving every turn yourself: "left here, now right..." | Plain DOM code, like `createElement` and `textContent` |

Saying *what* you want, and letting a tool work out *how*, is called **declarative** code. Giving every step yourself is called **imperative** code. React is declarative. That's the big shift in this course.

## How it works

### What you need

- **The TypeScript course**, finished. This course builds on it from the first line.
- **Node.js**, version 20.19 or newer. (If you have version 22, it needs to be 22.12 or newer.) Check yours in a terminal:

  ```
  node --version
  ```

  If it prints something older, like `v18.20.4`, install the latest **LTS** version from [nodejs.org](https://nodejs.org). **LTS** means "long-term support": the stable version most people use.

  If you installed Node with **nvm** (a tool that keeps several Node versions side by side), `nvm list` shows the versions you have, and `nvm use` followed by a version number switches to it.
- **VS Code** and **Chrome or Edge**, the same as in the JavaScript and TypeScript courses.

### Create your practice app

You'll write all your React practice in one app. The tool that creates it is **Vite** (say "veet"), which you used in [TypeScript chapter 12](../../TypeScript/12-typescript-in-the-browser/notes.md). Vite sets up a project and runs a small web server on your computer while you work.

Open a terminal inside this `React` folder and run:

```
npm create vite@latest
```

Vite asks you a few questions. Use the arrow keys and Enter to answer:

| Question | Your answer |
|---|---|
| Project name | `playground` |
| Select a framework | **React** |
| Select a variant | **TypeScript** (the first choice) |
| Which linter to use? | **Oxlint** (the first choice) |
| Install with npm and start now? | **Yes** |

A few notes on those choices:

- Pick plain **TypeScript**, not "TypeScript + React Compiler". The React Compiler is a tool that makes apps faster automatically, and chapter 27 covers it.
- A **linter** is a spell-checker for bugs. You used one called ESLint in [JavaScript chapter 50](../../JavaScript/50-tooling/notes.md). **Oxlint** does the same job, just faster. Either one is fine.

(Vite's questions change a little between versions. If yours look different, pick React and TypeScript, and the default for anything else.)

Vite creates a `playground` folder, installs React and TypeScript, and starts the server. You'll see something like:

```
  VITE v8.3.1  ready in 350 ms

  ➜  Local:   http://localhost:5173/
```

**Ctrl + click** the `Local` address to open it. You'll see Vite's welcome page with a **Count is 0** button. Click it. That's a React app running on your computer.

`localhost` means "this computer". `5173` is the **port**, like an apartment number for programs on your computer. If 5173 is busy, Vite picks the next number, like 5174.

### Stopping and starting again

The server keeps running as long as the terminal stays open.

- **To stop it:** click in the terminal and press **Ctrl + C**.
- **To start it again later:** open a terminal *inside the `playground` folder* and run:

  ```
  npm run dev
  ```

If you answered "No" to "Install with npm and start now?", run these instead: `cd playground`, then `npm install`, then `npm run dev`.

### A tour of your project

Open the `playground` folder in VS Code. These are the files that matter for now:

```
playground/
├── index.html          the only HTML page. It has an empty <div id="root">
├── package.json        your project's settings and packages (JavaScript chapter 50)
├── tsconfig.json       TypeScript's settings, split across three files (more below)
├── tsconfig.app.json   settings for your app's code, in src/
├── tsconfig.node.json  settings for vite.config.ts
├── vite.config.ts      Vite's settings. It turns on React support
├── public/             files the browser gets exactly as they are, like the tab icon
└── src/                your code lives here
    ├── main.tsx        the starting point: puts your app on the page
    ├── App.tsx         what your page shows
    ├── App.css         styles for App
    ├── index.css       styles for the whole page
    └── assets/         images your code uses
```

You'll also see `node_modules` (the installed packages, never edit them), `package-lock.json`, `.gitignore`, `.oxlintrc.json` and a `README.md`. You can ignore those for now.

**What's `.tsx`?** You know `.ts` files from the TypeScript course. A `.tsx` file is a TypeScript file that can also contain HTML-like tags. [Chapter 02](../02-jsx/notes.md) is all about those tags. Any file with tags in it must end in `.tsx`.

### How your app gets onto the page

When you open the page, three files work together, one after the other.

**1. `index.html`** has almost nothing in it:

```html
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
```

An empty `<div>`, and a script. The empty `<div>` is where React will draw everything.

Browsers can't run `.tsx` files. Vite translates `main.tsx` into plain JavaScript on the fly, the moment the browser asks for it.

**2. `src/main.tsx`** is that script. Here it is, exactly as Vite made it:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

Line by line:

| Code | What it means |
|---|---|
| `import { createRoot } from 'react-dom/client'` | Load `react-dom`, the part of React that draws on web pages |
| `import './index.css'` | Load the page's styles. Vite lets you import CSS files like this |
| `import App from './App.tsx'` | Load your app (a default export, from [JavaScript chapter 29](../../JavaScript/29-modules/notes.md)) |
| `document.getElementById('root')!` | Find the empty `<div>`. The `!` is explained below |
| `createRoot(...)` | Tell React: "this `<div>` is yours now" |
| `.render(<App />)` | Draw `App` inside it |
| `<StrictMode>` | A helper that warns you about common mistakes while you work. It doesn't show anything on screen |

**What's the `!`?** You met it in [TypeScript chapter 12](../../TypeScript/12-typescript-in-the-browser/notes.md). `getElementById` might find nothing and return `null`, so its type is `HTMLElement | null`. `createRoot` needs a real element, so TypeScript would complain. The `!` (the **non-null assertion**) tells TypeScript "trust me, it's there". Here, that's a safe promise, because the `<div id="root">` is right there in `index.html`. (In the exercises, you'll break that promise on purpose.)

Vite's files leave out semicolons and use single quotes. Both styles work. This course uses double quotes and semicolons, like the JavaScript and TypeScript courses.

**3. `src/App.tsx`** is what the page actually shows. Vite's version is long, because it draws the whole welcome page. But its shape is simple:

```tsx
function App() {
  // ...some setup...
  return (
    // ...what to show on the page...
  )
}

export default App
```

`App` is a **function that returns what should appear on the screen**. That's a **component**, and every React app is built out of them. You'll write your own in chapter 03.

So the whole path is: the browser opens `index.html`, which loads `main.tsx`, which draws `App` inside `<div id="root">`. That one `<div>` holds your entire app.

### Your first change

Replace *everything* in `src/App.tsx` with this:

```tsx
function App() {
  return <h1>Hello, React!</h1>;
}

export default App;
```

Save the file and look at the browser. The page changes by itself, and you didn't have to refresh. This is called **hot module replacement**, or **HMR**: when you save, Vite swaps only the file you changed into the running page.

The page probably still has the starter's colors and layout, and a dark background if your computer uses dark mode. Those styles come from `src/index.css`. To start with a clean, plain page, delete everything *inside* `src/index.css` and save. Keep the empty file, because `main.tsx` still imports it.

`App.css` and the `assets` folder aren't used anymore, since your new `App.tsx` doesn't import them. You can delete them, or leave them. They do no harm.

### Checking your types

Here's something from [TypeScript chapter 01](../../TypeScript/01-getting-started/notes.md) that matters a lot now: **Vite doesn't check your types.** Just like `node file.ts`, Vite removes the types and runs what's left. A page with type errors can still look fine in the browser.

So you check types in two other ways:

- **In VS Code**, all the time. Type errors get a red squiggly underline. Hover over it to read the message.
- **In the terminal**, for the whole project at once. Open a second terminal inside `playground` (leave the first one running the server) and run:

  ```
  npx tsc -b
  ```

  No output means no problems.

**Why `-b`?** Vite splits TypeScript's settings into three files. The main `tsconfig.json` doesn't list any code itself. It just points to the other two files (these pointers are called **references**). `-b`, short for "build mode", tells `tsc` to follow those pointers and check everything. [TypeScript chapter 11](../../TypeScript/11-tsconfig-and-modules/notes.md) explains the settings inside.

`npm run build`, which makes the final version of your app for putting online (chapter 40), runs `tsc -b` first. So a type error stops you from publishing a broken app.

Two settings in this project are worth knowing now:

- **Strict mode is on.** You won't see `"strict": true` in the files, because TypeScript 6 turns it on by default. You get all the checks you learned in the TypeScript course.
- **Unused variables and imports are errors.** If you import something and never use it, `tsc -b` reports: `'Ex2' is declared but its value is never read.` Delete what you don't use.

### React Developer Tools

Install the free **React Developer Tools** extension for Chrome or Edge. It adds a **Components** tab to the DevTools panel (press `F12`), where you can see each component on the page. It'll be really useful from chapter 03 on.

### React is a library, not a framework

A **framework** is a complete kit that decides how your whole app is organized: pages, data, the server, and more. React only handles one job: what's on the screen.

For everything else, like moving between pages, loading data, and checking forms, you pick extra libraries. That's why this course has a whole level (Level 4) on the popular ones. There are also frameworks built *on top of* React, like Next.js (chapter 39).

## Common mistakes

**1. Opening `index.html` by double-clicking it**

You get a blank white page. Browsers can't read `.tsx` files or find npm packages by themselves. Vite translates your code while `npm run dev` is running. Always open the `localhost` address instead.

**2. Running commands in the wrong folder**

If you run `npm run dev` in the `React` folder instead of `React/playground`, npm complains that it can't find `package.json` (you'll see `ENOENT`), or says `Missing script: "dev"`. Open the terminal inside `playground`. In VS Code, you can right-click the folder and choose **Open in Integrated Terminal**.

**3. Skipping `npm install`**

On Windows:

```
'vite' is not recognized as an internal or external command,
operable program or batch file.
```

(On a Mac, it says `vite: command not found`.) The packages aren't installed yet. Run `npm install` once, then `npm run dev`.

**4. Using an old version of Node.js**

Vite needs a recent Node.js. With an old one, `npm create vite` may crash with strange errors, or warn you about your Node version. Check with `node --version` and update if needed.

**5. Following an old tutorial that uses `create-react-app`**

Lots of older tutorials start with `npx create-react-app my-app`. That tool is **deprecated** (officially retired) since 2025, and React's own docs no longer recommend it. Use Vite, like you did here.

**6. Closing the terminal while you work**

The browser shows **"This site can't be reached"** or **"localhost refused to connect"**. Closing the terminal stops the server. Start it again with `npm run dev`.

**7. Thinking "the page works, so my types are fine"**

Vite shows your page even when your code has type errors. Keep an eye on the red squiggles in VS Code, and run `npx tsc -b` before you call something done.

**8. Running `npx tsc` without `-b`**

In a Vite project, plain `npx tsc` checks *nothing* and prints nothing, because the main `tsconfig.json` has no code in it. That silence looks like "no errors", even when there are some. Always add `-b`.

## Quick recap

- React builds user interfaces. You describe what the screen should show, and React keeps the page matching your data.
- Create a React + TypeScript app with `npm create vite@latest` (React, then TypeScript), and run it with `npm run dev` from inside the project folder.
- The path is `index.html` → `main.tsx` → `App.tsx`. React draws your whole app inside one `<div id="root">`. Files with tags in them end in `.tsx`.
- A component is a function that returns what should appear on the screen. `App` is your first one.
- Vite doesn't check types. Watch the red squiggles in VS Code, and check the whole project with `npx tsc -b`.

---

**Next:** try the [exercises](exercises.md), then move on to [02 JSX](../02-jsx/notes.md).
