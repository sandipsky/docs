# 07 Events: Exercises

**How to do these:**

- Work in your practice app, one folder per exercise: `src/ch07/ex1/`, and so on.
- **Nothing on the page can change yet.** That arrives in [chapter 08](../08-state/notes.md). So these exercises prove their work in the Console (`F12`), which is exactly how you'd debug a handler in real life anyway.
- Keep the Console open the whole time, and clear it (🚫) between tries so you can see what a single click produced.
- An exercise is done when the right messages appear at the right moments, VS Code shows no red squiggles, `npx tsc -b` prints nothing, and there are no React warnings.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Four buttons, one bug

Copy this into `src/ch07/ex1/Ex1.tsx`:

```tsx
function Ex1() {
  function handleHello() {
    console.log("Hello!");
  }

  function greet(name: string) {
    console.log("Hello, " + name + "!");
  }

  return (
    <div>
      <button onClick={handleHello}>A</button>
      <button onClick={handleHello()}>B</button>
      <button onClick={() => greet("Maya")}>C</button>
      <button onClick={greet("Tom")}>D</button>
    </div>
  );
}

export default Ex1;
```

1. Load the page **without clicking anything**. What's already in the Console, and which buttons put it there?
2. Click each button in turn. Which ones do nothing?
3. Fix B and D so they only log when clicked.
4. `onClick={greet("Tom")}` has a red squiggle but `onClick={handleHello()}` doesn't. Read both, and explain in a comment why TypeScript catches one and not the other.

<details>
<summary>Hint 1</summary>

For question 4, think about what each expression *evaluates to*, and what `onClick` is willing to accept. `handleHello()` gives back `undefined`; `greet("Tom")` also gives back `undefined`... so look more carefully at what TypeScript says, and at what the two functions' return types actually are.

</details>

<details>
<summary>Hint 2</summary>

`onClick` accepts a function **or** `undefined` (because the prop is optional). That's the whole answer to question 4, and it's a good lesson: TypeScript can't save you from every version of this mistake. You have to recognise the shape.

</details>

---

## Exercise 2 (Easy): The vending machine

Build `src/ch07/ex2/` with two components.

**`ProductButton`** takes:

| Prop | Type |
|---|---|
| `name` | text |
| `price` | number |
| `onBuy` | a function taking the name and the price, returning nothing |

It renders a `<button>` showing `Crisps — $1.20`, and calls `onBuy` with that product's name and price when clicked.

**`Ex2`** holds an array of four products and renders a `ProductButton` for each with `map`. Its `handleBuy` logs `You bought Crisps for $1.20`.

Then:

1. Add a `<button>Refund</button>` at the bottom that logs `Refunding...`, written as an **inline** arrow function.
2. Add one that logs a two-line message, written as a **named** function. Which did you prefer writing, and why?
3. Write out the full type of `onBuy` in a comment, and read it aloud in plain English.

<details>
<summary>Hint 1</summary>

The prop type is `onBuy: (name: string, price: number) => void;`. The `=> void` part means "returns nothing worth using".

</details>

<details>
<summary>Hint 2</summary>

Inside `ProductButton`, you need to pass arguments, so the handler has to be wrapped: `onClick={() => onBuy(name, price)}`.

</details>

---

## Exercise 3 (Medium): Event detective

This one is about the event object. In `src/ch07/ex3/Ex3.tsx`:

```tsx
function Ex3() {
  return (
    <div
      style={{ border: "2px solid grey", padding: 20 }}
      onClick={() => console.log("OUTER div")}
    >
      <p>Click the button, then click the grey area around it.</p>
      <button type="button">Delete</button>
    </div>
  );
}

export default Ex3;
```

**Part 1: bubbling.** Add an `onClick` to the button that logs `BUTTON`. Click the button. How many messages do you get, and in what order? Explain it in a comment.

**Part 2: stop it.** Change the button's handler so clicking it logs **only** `BUTTON`. Clicking the grey area must still log `OUTER div`.

**Part 3: target vs currentTarget.** Write the button's handler as a separate, properly typed function that logs both `event.target` and `event.currentTarget`. Put an `<span>Delete</span>` **inside** the button and click exactly on the word. Are the two the same? Explain why in a comment.

**Part 4: the keyboard.** Add an `<input type="text" />`. Log `Enter pressed` when someone presses Enter in it, and nothing for any other key. Type a normal sentence to confirm you're not logging on every keystroke.

<details>
<summary>Hint 1</summary>

For Part 2, look up `stopPropagation` in the notes. The handler needs the event object now, so it needs a parameter.

</details>

<details>
<summary>Hint 2</summary>

For Part 3, the button's handler type is `React.MouseEvent<HTMLButtonElement>`. `currentTarget` is where the handler is; `target` is where the click actually landed.

</details>

<details>
<summary>Hint 3</summary>

For Part 4, use `onKeyDown` and check `event.key === "Enter"`. The type is `React.KeyboardEvent<HTMLInputElement>`.

</details>

---

## Exercise 4 (Medium): A form that doesn't reload the page

In `src/ch07/ex4/Ex4.tsx`, build a "Join the newsletter" form: a labelled email box, a labelled name box, and a **Subscribe** button.

1. Give the form an `onSubmit` handler that logs `Form submitted`. Click Subscribe. **What happens to the page?** Watch the browser tab and the Console carefully, then write down what you saw.
2. Fix it so the page stays put.
3. Now click into the email box and press Enter instead of clicking the button. Does it still work? Why?
4. Move your handler off the `<form>` and onto the button's `onClick` instead. Does Enter still work now? Put it back on the form, and write one sentence on why `onSubmit` on the `<form>` is the right place.
5. Add an `onFocus` to the email box that logs `Editing email` and an `onBlur` that logs `Left email`. Click between the two boxes and watch the order of the messages.
6. Use `<label htmlFor="...">` properly for both boxes, and check it works by clicking the label text: the cursor should jump into the box.

<details>
<summary>Hint 1</summary>

For question 1, the Console clears itself when the page reloads — that's your clue. Turn on **Preserve log** in the Console's settings if you want to see the message before it disappears.

</details>

<details>
<summary>Hint 2</summary>

The handler's type is `React.FormEvent<HTMLFormElement>`, and the first line of its body is `event.preventDefault();`.

</details>

<details>
<summary>Hint 3</summary>

You can't read what was typed yet — that's [chapter 09](../09-forms/notes.md). Logging a fixed message is enough here.

</details>

---

## Exercise 5 (Challenge): A to-do list that talks back

This is a dry run for the chapter 10 project. The list won't actually change yet (no state until chapter 08), but every single interaction will report itself correctly, and the components will be shaped exactly the way the real app needs.

In `src/ch07/ex5/`, start with `types.ts`:

```ts
export type Task = {
  id: string;
  text: string;
  done: boolean;
};
```

Build three components, each in its own file:

**`TaskRow`** takes one `task`, plus three function props: `onToggle`, `onDelete`, and `onEdit`. It renders an `<li>` containing:

- a tick box whose `checked` matches `task.done`, with an `onChange` that calls `onToggle` with the task's id,
- the task text, crossed out with `textDecoration: "line-through"` when it's done,
- a `✏` button calling `onEdit` with the id,
- a `×` button calling `onDelete` with the id.

**`TaskList`** takes a `tasks` array (readonly) and passes the three functions straight through to each row. It shows `Nothing to do!` when the list is empty.

**`Ex5`** holds the array, defines the three handler functions (each just logs what it would do, with the task's **text**, not just the id), and renders the list plus an `Add task` form with a text box and a button.

Requirements:

1. Clicking `×` on a row must log **only** that row's delete message. Wrap the whole `<li>` in an `onClick` that logs `Row clicked` and make sure the buttons don't trigger it.
2. The Add form must not reload the page, and pressing Enter in the box must work the same as clicking the button.
3. Every handler function that takes an event is separately defined and properly typed. No `any` anywhere.
4. In a comment at the bottom of `Ex5.tsx`, answer: `TaskRow` knows the id but not what deleting means, and `Ex5` knows what deleting means but doesn't have a button. Why is it a good thing that those two facts live in different files?
5. In the same comment, list everything that's still missing before this is a real to-do app. (There are two big things, and they're chapters 08 and 09.)

<details>
<summary>Hint 1</summary>

Three function props on `TaskRow`, all the same shape:

```tsx
type TaskRowProps = {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
};
```

</details>

<details>
<summary>Hint 2</summary>

For requirement 1, that's `stopPropagation` on each button. You'll need the event, so the handlers become `(event) => { ... }` with two statements.

</details>

<details>
<summary>Hint 3</summary>

For handlers that log the task's **text** from just an id, the parent has the array: `tasks.find((task) => task.id === id)`. That returns `Task | undefined`, so TypeScript will make you handle the "not found" case ([TypeScript chapter 06](../../TypeScript/06-unions-and-narrowing/notes.md)). That's not TypeScript being annoying — `find` really can come back empty.

</details>

<details>
<summary>Hint 4</summary>

The tick box will look stuck: you click it and it snaps straight back. That's correct for now, and it's worth sitting with for a second. `checked={task.done}` ties the box to data that never changes, so React puts it right back where the data says it should be. It's doing exactly what you asked. Chapters 08 and 09 give you the missing half.

If instead you see a warning about a read-only field, you used `onClick` rather than `onChange` on the tick box.

</details>
