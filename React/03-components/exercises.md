# 03 Components: Exercises

**How to do these:**

- Work in your practice app. This chapter needs more than one file per exercise, so give each exercise its own folder inside `src/ch03/`: `src/ch03/ex1/`, `src/ch03/ex2/`, and so on.
- Each exercise folder has one file per component, named after the component (`Header.tsx`), plus one top-level file named after the exercise (`Ex1.tsx`) that puts them together.
- To see an exercise, change the `import` line in `src/App.tsx`, the same as before:

  ```tsx
  import Ex1 from "./ch03/ex1/Ex1.tsx";

  function App() {
    return <Ex1 />;
  }

  export default App;
  ```

- Keep the Console open (`F12`), and open the **Components** tab too. You'll need it in exercises 3 and 4.
- An exercise is done when the page looks right, VS Code shows no red squiggles, `npx tsc -b` prints nothing, and the Console has no errors or React warnings.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Fix the games shop

Copy this into `src/ch03/ex1/Ex1.tsx`, exactly as it is:

```tsx
function header() {
  return <h1>Pixel Games</h1>;
}

function Tagline() {
  <p>New and retro games, since 2019.</p>;
}

function Ex1() {
  return (
    <div>
      <header />
      <Tagline />
      <Footer />
    </div>
  );
}

function Footer() {
  return <p>Open Tuesday to Sunday</p>;
}
```

Nothing works: even the `import` in `App.tsx` is broken. There are **three** problems. Find and fix them, so all three lines appear on the page.

Then answer two questions in a comment at the bottom of your file:

1. `Footer` is written *after* `Ex1` uses it. Why does that work?
2. Which of the three problems did TypeScript warn you about, and which did you have to spot yourself?

<details>
<summary>Hint 1</summary>

Start with what the *file* needs before anything else can be shown at all. Then read the "Common mistakes" list in the notes from the top: the first two are both in this file.

</details>

<details>
<summary>Hint 2</summary>

`<header />` gives no error, because `header` is a real HTML tag. That's the point of this exercise. And for question 1, look up hoisting in [JavaScript chapter 14](../../JavaScript/14-scope-and-hoisting/notes.md).

</details>

---

## Exercise 2 (Easy): Split the bakery page

Here's a whole page in one lump. Put it in `src/ch03/ex2/Ex2.tsx` first, and check it works:

```tsx
function Ex2() {
  return (
    <div>
      <h1>Flour & Salt Bakery</h1>
      <p>Baked fresh every morning on Mill Lane.</p>
      <hr />
      <h2>Today</h2>
      <p>Sourdough, cinnamon buns, and a very good brownie.</p>
      <hr />
      <p>Open 7am to 2pm, or until we sell out.</p>
    </div>
  );
}

export default Ex2;
```

Now split it into **four** components, each in its own file inside `src/ch03/ex2/`:

- `Header.tsx`: the `<h1>` and the paragraph under it.
- `Today.tsx`: the `<h2>` and its paragraph.
- `Footer.tsx`: the opening hours.
- `Divider.tsx`: just an `<hr />`.

Then rewrite `Ex2.tsx` so it imports all four and shows them in the same order. Use `<Divider />` twice.

The page should look **exactly the same** as before you started. That's how you know the split worked.

<details>
<summary>Hint 1</summary>

Each file follows the same shape: a function with a capital-letter name, a `return` with the JSX, and `export default` at the bottom.

</details>

<details>
<summary>Hint 2</summary>

`Header` returns two elements, so it needs one parent. A fragment (`<>` and `</>`) keeps the page identical, because it adds nothing. A `<div>` would work too, but it would change the HTML.

</details>

<details>
<summary>Hint 3</summary>

The `&` in "Flour & Salt" is fine in JSX, just like in HTML.

</details>

---

## Exercise 3 (Medium): Build a film night poster

Build this from scratch in `src/ch03/ex3/`, with no starter code. The page should show:

```
FILM NIGHT
Thursdays at 7pm, Room 12

The Princess Bride
1987 · 98 minutes

Free popcorn for everyone
```

Build it out of **five** components, in five files, nested two levels deep:

- `Ex3` uses `<Poster />` and nothing else.
- `Poster` uses `<PosterHeader />`, `<FilmDetails />` and `<Note />`.
- `PosterHeader` shows the first two lines. Make "FILM NIGHT" an `<h1>` and give it a colour with the `style` attribute ([chapter 02](../02-jsx/notes.md)).
- `FilmDetails` shows the film's title as an `<h2>` and the year and length under it.
- `Note` shows the last line.

When it works:

1. Open the **Components** tab in DevTools (`F12`).
2. Draw the component tree in a comment at the bottom of `Ex3.tsx`, the same way the notes draw it.
3. Click `FilmDetails` in the tree. What happens on the page?

<details>
<summary>Hint 1</summary>

Do one component at a time. Write `PosterHeader.tsx`, import it into `Poster.tsx`, and check the page before you write the next one. Fixing one broken file is much easier than fixing five.

</details>

<details>
<summary>Hint 2</summary>

The `·` character is just text. Copy and paste it, or use a plain `-` instead.

</details>

<details>
<summary>Hint 3</summary>

In the Components tab, `App` is at the top. Your components are underneath it. Plain HTML tags like `<h1>` aren't shown by default, so your drawing will be shorter than the one in the notes.

</details>

---

## Exercise 4 (Medium): Three bad habits

This file works, sort of, but it breaks three of the rules from the notes. Copy it into `src/ch03/ex4/Ex4.tsx`:

```tsx
let renders = 0;

function Ex4() {
  renders = renders + 1;

  function Sidebar() {
    return <p>Links go here</p>;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      {Sidebar()}
      <p>This component has rendered {renders} times.</p>
    </div>
  );
}

export default Ex4;
```

**Part 1: look before you fix.**

1. What number does the page show? Was that what you expected? Open `src/main.tsx` and look at what wraps `<App />`. Now explain the number.
2. Open the **Components** tab. Can you find `Sidebar` in the tree? Why not?

**Part 2: fix it.** Rewrite the file so it follows the rules:

- `Sidebar` is a top-level component in its own file, `Sidebar.tsx`, and it's used as a tag.
- Nothing outside the component is changed while it renders. (You'll have to give up on counting renders. That's the right answer: counting your own renders is a job for [chapter 19](../19-refs/notes.md), not for a variable at the top of a file.)

Write one sentence next to each fix saying what could go wrong if you left it as it was.

<details>
<summary>Hint 1</summary>

For the number, read "A component should be predictable" in the notes, and look for `StrictMode`.

</details>

<details>
<summary>Hint 2</summary>

For the Components tab question, read mistake 2 in the notes. React only knows a component exists if you use it as a *tag*.

</details>

---

## Exercise 5 (Challenge): Bike shop dashboard

This one pulls in JSX from [chapter 02](../02-jsx/notes.md) and array methods from [JavaScript chapter 13](../../JavaScript/13-array-methods/notes.md).

In `src/ch03/ex5/`, build a small dashboard for a bike repair shop. Start from this data, in a file called `data.ts` (a plain `.ts` file, because there are no tags in it):

```ts
export type Repair = {
  bike: string;
  job: string;
  price: number;
  done: boolean;
};

export const repairs: Repair[] = [
  { bike: "Blue Raleigh", job: "New brake pads", price: 24, done: true },
  { bike: "Red BMX", job: "Puncture", price: 12, done: true },
  { bike: "Green tourer", job: "Full service", price: 85, done: false },
  { bike: "Silver hybrid", job: "New chain", price: 30, done: false },
];
```

The page should show:

```
Mill Lane Cycles
Monday

Jobs in: 4
Finished: 2
Still to do: 2
Money earned: $36

⚠ 2 jobs still waiting
```

Build it from these components, each in its own file:

- `Ex5` puts everything together.
- `ShopHeader` shows the shop name and **today's weekday**, worked out with `Date` ([JavaScript chapter 19](../../JavaScript/19-dates-and-times/notes.md)). It won't say "Monday" unless you're doing this on a Monday, and that's fine.
- `Divider`, used **twice**, exactly like exercise 2.
- `JobStats` imports `repairs` and works out all four numbers itself. **Don't type any of the numbers in by hand.** "Money earned" only counts repairs where `done` is `true`.
- `PendingAlert` imports `repairs`, counts the unfinished ones, and shows the warning line in orange. If every job is finished, it must show **nothing at all**.

Then test it properly:

1. Change `done` to `true` on the green tourer. Every number should follow, and the warning should still appear (one job left).
2. Change all four to `true`. The warning should disappear completely. Check the **Elements** tab in DevTools: there should be no empty paragraph left behind.
3. Add a fifth repair to the array. Every number should update by itself.

<details>
<summary>Hint 1</summary>

`filter` gives you a smaller array, and `.length` tells you how big it is. That handles "Finished" and "Still to do". For the money, filter first and then `reduce`, or do both in one `reduce`.

</details>

<details>
<summary>Hint 2</summary>

To show nothing from a component, `return null;`. Look at "Returning nothing on purpose" in the notes. Returning `<></>` would also look right on the page, but `null` says what you mean.

</details>

<details>
<summary>Hint 3</summary>

Both `JobStats` and `PendingAlert` import the same `repairs` array. That's fine for now, but notice how it feels: two components reaching into the same file to get their data. From chapter 04, the parent will hand data to them instead, which is the React way round.

</details>

<details>
<summary>Hint 4</summary>

For the weekday, `new Date().toLocaleDateString("en-GB", { weekday: "long" })` gives you the day's name.

</details>
