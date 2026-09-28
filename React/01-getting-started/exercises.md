# 01 Getting Started: Exercises

**How to do these:**

- Do these in your practice app, `React/playground`, with `npm run dev` running.
- Make a folder for each chapter inside `src`, like `src/ch01/`, and one file per exercise: `Ex2.tsx`, `Ex3.tsx`, and so on. Start each name with a capital letter (chapter 03 explains why).
- Each exercise file looks like this:

  ```tsx
  function Ex2() {
    return <h1>Your answer goes here</h1>;
  }

  export default Ex2;
  ```

- To see an exercise in the browser, make `src/App.tsx` show it:

  ```tsx
  import Ex2 from "./ch01/Ex2.tsx";

  function App() {
    return <Ex2 />;
  }

  export default App;
  ```

  `<Ex2 />` means "show whatever `Ex2` returns, right here". Chapter 03 explains how that works. To switch to another exercise, *change* the `import` line (both names) instead of adding a second one. An import you don't use is a type error in this project.
- An exercise is done when the page looks right, VS Code shows no red squiggles, and `npx tsc -b` prints nothing.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Your first React app

Create your practice app exactly as the notes describe, and open it in the browser.

1. Click the **Count is 0** button a few times.
2. In `src/App.tsx`, find the text `Get started` and change it to `My first React app`. Save. Did you have to refresh the page?
3. Open a second terminal inside `playground` and run `npx tsc -b`. What does it print?
4. Stop the server with Ctrl + C, then start it again.

Write down the address the terminal shows under `Local`.

<details>
<summary>Hint</summary>

Use VS Code's search inside the file (Ctrl + F) to find `Get started`. It's inside an `<h1>`. To start the server again, the terminal must be inside the `playground` folder.

</details>

---

## Exercise 2 (Easy): The café sign

Time for a clean slate:

1. Delete everything inside `src/index.css` (keep the empty file).
2. Create `src/ch01/Ex2.tsx` that shows a sign for a café:

   ```
   Café Luna is open!
   ```

   It should be a big heading.
3. Replace everything in `src/App.tsx` with the version from "How to do these", so it shows `Ex2`.

You should see a plain white page with your heading and nothing else, and `npx tsc -b` should print nothing.

<details>
<summary>Hint</summary>

Copy the example exercise file from "How to do these" and change only the text between `<h1>` and `</h1>`. The biggest heading in HTML is `<h1>`.

</details>

---

## Exercise 3 (Medium): Follow the trail

Read `index.html` and `src/main.tsx`. Then create `src/ch01/ex3-answers.md` and answer these in your own words:

1. Which file does the browser open first?
2. What's the `id` of the `<div>` where React draws your app?
3. Which line in `main.tsx` finds that `<div>`? What does the `!` on that line promise TypeScript?
4. Now an experiment. In `index.html`, change `id="root"` to `id="app"`, but *don't* change `main.tsx`. Save. What does the page show? Open the Console (`F12`) and write down the red error message.
5. Run `npx tsc -b`. Did TypeScript warn you about this problem? Explain why, or why not.
6. In one sentence, explain *why* the error in step 4 happens. Then change the `id` back and check that your café sign is back.

<details>
<summary>Hint 1</summary>

Look for `getElementById` in `main.tsx`. What does `getElementById` give back when no element has that id? (You saw this in JavaScript chapter 20 and TypeScript chapter 12.)

</details>

<details>
<summary>Hint 2</summary>

"Target container" means the box React was told to draw into. Did React actually get a box? And can TypeScript read `index.html`, or only your `.ts` and `.tsx` files?

</details>

---

## Exercise 4 (Medium): Break it on purpose

Programmers see error messages every day. The skill is reading them calmly. Copy your `Ex2.tsx` to `Ex4.tsx`, rename the function inside it to `Ex4` (in both places), change the `App.tsx` import so it shows `Ex4`, and then:

1. Delete the closing `</h1>` tag and save. What do you see in the browser? What does VS Code show on that line? Write down the file name and line number from the error. Then put the tag back.
2. Above the `return`, add `const openHour: number = "9am";` and show it in the heading, like `Open from {openHour}`. Save. Does the page work? What do VS Code and `npx tsc -b` say? Then fix the line so it has the right type.
3. Change `export default Ex4;` to `export default Ex4x;` and save. Where do you see an error this time: the browser, the Console, VS Code, `tsc`? Write down each message, then fix it.
4. Stop the server with Ctrl + C, then refresh the browser. What happens? Start the server again.

Save your notes in `src/ch01/ex4-answers.md`.

<details>
<summary>Hint 1</summary>

For step 1, Vite covers the page with an error box that shows the file, the line, and what's wrong. That's because a missing tag is a *syntax* error: Vite can't translate the file at all. In VS Code, hover over the red squiggly line to read the message.

</details>

<details>
<summary>Hint 2</summary>

For step 2, reread "Checking your types" in the notes. For step 3, the page may just go blank, with no error box. When that happens, look in the Console (`F12`). Remember `ReferenceError` from JavaScript chapter 02?

</details>

---

## Exercise 5 (Challenge): Plain DOM code vs React

Build the same coffee counter twice, then compare.

**Part 1: the plain DOM way.** Make a second, React-free project, like in [TypeScript chapter 12](../../TypeScript/12-typescript-in-the-browser/notes.md). Run `npm create vite@latest` in the `React` folder, name the project `playground-plain`, and choose **Vanilla** and **TypeScript**. It ends up next to `playground`.

Then, using what you learned in JavaScript chapters 20 and 21, build a button that counts cups of coffee:

```
Cups of coffee today: 0
```

Every click adds one.

**Part 2: React.** Create `src/ch01/Ex5.tsx` in your practice app and type in the `Counter` example from the "Why does it matter?" section of the notes. Then:

- Rename the function from `Counter` to `Ex5`, and add `export default Ex5;` at the bottom, like your other exercise files.
- Put this line at the very top of the file, so React's `useState` is available:

  ```tsx
  import { useState } from "react";
  ```

- Change the button so it shows the same coffee text.

**Part 3: compare.** In `src/ch01/ex5-answers.md`, answer:

1. How many lines is each version?
2. In the plain version, which line updates the page? Which line does that job in the React version?
3. In the plain version, what did you have to do about `null`? Did you need that in React? Why not?
4. Name one thing that would go wrong in the plain version if you forgot a line, but can't go wrong in React.

<details>
<summary>Hint 1</summary>

For Part 1, you need `querySelector` to find the button, `addEventListener("click", ...)` to react to clicks, and `textContent` to change what the button says. TypeScript will insist that you deal with the button possibly being `null`. TypeScript chapter 12 shows a few ways.

</details>

<details>
<summary>Hint 2</summary>

For Part 2, the text inside the button can mix plain words and `{count}`, like `Cups of coffee today: {count}`. Don't forget to change the `import` line in `App.tsx` so it shows `Ex5`.

</details>
