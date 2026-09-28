# 08 State: Exercises

**How to do these:**

- Work in your practice app, one folder per exercise: `src/ch08/ex1/`, and so on.
- **Your pages finally do things.** Click everything, repeatedly, in the wrong order, and see if it holds up.
- Keep the **Components** tab open next to the page. Click your component and watch its state change as you click. It's the single best way to learn this chapter.
- An exercise is done when it behaves correctly however you click it, VS Code shows no red squiggles, `npx tsc -b` prints nothing, and the Console is empty.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): The counter, three ways

In `src/ch08/ex1/Ex1.tsx`, build a counter with four buttons: `+1`, `-1`, `+10`, and `Reset`.

1. Get it working with `useState`.
2. Add `console.log("rendering with", count);` above the `return`. Click a few times and read the Console. How many times does the component run for one click?
3. Add a fifth button, `+3`, that calls `setCount(count + 1)` **three times in a row**. How much does the count go up by? Explain it in a comment.
4. Fix that button using the updater form so it really adds 3.
5. Add a button whose handler is:

   ```tsx
   function handleShow() {
     setCount(count + 1);
     console.log("count is now", count);
   }
   ```

   What does it log? Is the message right or wrong? Rewrite the log line so it prints the number the page is about to show.
6. Stop the count going below zero. `-1` at zero should do nothing.

<details>
<summary>Hint 1</summary>

For question 3, read "State updates are not instant" in the notes. All three lines are working from the same `count`.

</details>

<details>
<summary>Hint 2</summary>

For question 6, you can either check inside the handler before setting, or clamp the value with `Math.max(0, ...)`. Both are fine. The second one is harder to get wrong later.

</details>

---

## Exercise 2 (Easy): Light switch and secret message

Three small pieces of state, in `src/ch08/ex2/Ex2.tsx`.

1. **A light switch.** A button that toggles between `💡 On` and `🌑 Off`. The page's background colour changes with it (use the `style` attribute on a wrapping `<div>`).
2. **A show/hide.** A button labelled `Show answer` / `Hide answer` that reveals a paragraph underneath. When it's hidden, the paragraph must **not be in the page at all** — check the Elements tab, not just your eyes.
3. **A step counter with a limit.** A `Next` button that walks through the strings `["Wake up", "Coffee", "Emails", "Lunch"]` one at a time, showing `Step 2 of 4: Coffee`. At the last step, the button is disabled and the page says `All done!`.

Then answer in a comment: you now have three `useState` calls in one component. Why three, rather than one object holding all three values?

<details>
<summary>Hint 1</summary>

To flip a boolean: `setIsOn(!isOn)`, or better, `setIsOn((prev) => !prev)`.

</details>

<details>
<summary>Hint 2</summary>

For the step counter, store the **index** in state (a number), not the text. The text is a derived value: `steps[index]`.

</details>

<details>
<summary>Hint 3</summary>

For the final question, look at mistake 9 in the notes, and think about which of your three values ever change at the same moment.

</details>

---

## Exercise 3 (Medium): Shopping cart

In `src/ch08/ex3/`, build a cart. Start with:

```ts
export type Product = {
  id: string;
  name: string;
  price: number;
};

export const products: Product[] = [
  { id: "p1", name: "Notebook", price: 3.5 },
  { id: "p2", name: "Backpack", price: 34.99 },
  { id: "p3", name: "Sticky notes", price: 1.99 },
];
```

Build:

- A product list. Each product has an **Add to cart** button.
- A cart below it, listing what's been added, with a `×` button on each line to remove it.
- A line showing `3 items — $40.48`, with both numbers worked out.
- A **Clear cart** button.
- `Your cart is empty.` when it is, and no summary line or Clear button in that case.

Rules:

1. The cart's state is an array of items. Give each **cart item** its own id when it's added, so adding the same notebook twice gives you two removable lines. Use `crypto.randomUUID()`.
2. **No `useState` for the count or the total.** Both are derived.
3. Nothing in your code may use `push`, `splice`, or `sort` on the state.
4. Test it hard: add the same product three times, remove the middle one, add another, clear, add again. It should never get confused.

Then in a comment: which line of your code would break if you'd used the array index as the React `key`? ([Chapter 06](../06-rendering-lists/notes.md), if you need reminding.)

<details>
<summary>Hint 1</summary>

The cart item type needs both its own id and the product's details:

```ts
type CartItem = {
  id: string;        // unique to this line in the cart
  product: Product;
};
```

Then `useState<CartItem[]>([])`.

</details>

<details>
<summary>Hint 2</summary>

Adding: `setItems([...items, newItem])` or `setItems((prev) => [...prev, newItem])`.
Removing: `setItems(items.filter((item) => item.id !== id))`.
Both make a **new** array, which is the whole point.

</details>

<details>
<summary>Hint 3</summary>

The total is `reduce` over the items, adding `item.product.price`. Work it out above the `return`, in a `const`.

</details>

---

## Exercise 4 (Medium): Quiz

In `src/ch08/ex4/`, build a three-question quiz.

```ts
export type Question = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
};

export const questions: Question[] = [
  {
    id: "q1",
    prompt: "What does JSX turn into?",
    options: ["HTML", "JavaScript function calls", "CSS"],
    correctIndex: 1,
  },
  {
    id: "q2",
    prompt: "What must every item in a list have?",
    options: ["A key", "An index", "A class"],
    correctIndex: 0,
  },
  {
    id: "q3",
    prompt: "What does useState give back?",
    options: ["A value", "A value and a setter", "A component"],
    correctIndex: 1,
  },
];
```

How it works:

1. One question on screen at a time, with its options as buttons.
2. Clicking an option locks the answer in: the buttons stop responding, the chosen one turns green or red, and the correct one is always shown in green.
3. A **Next question** button appears only after an answer is given. On the last question it says **See results**.
4. The results screen shows `You scored 2 out of 3`, a different message for a perfect score, and a **Try again** button that puts everything back to the start.

Keep it to three pieces of state, and make sure none of them is something you could derive.

<details>
<summary>Hint 1</summary>

Three pieces: which question you're on (a number), which option is selected for the current question (`number | null` — `null` means "not answered yet"), and the score so far (a number).

The score could arguably be derived if you stored every answer, and that's a good design too. Try the simple version first.

</details>

<details>
<summary>Hint 2</summary>

`selectedIndex === null` is your "has this been answered?" test, and it drives almost everything on screen: whether the buttons work, whether colours show, whether Next appears. Work out a `const isAnswered = selectedIndex !== null;` and use that.

</details>

<details>
<summary>Hint 3</summary>

For the colours, write a small function above the `return` that takes an option's index and returns its colour. That keeps the ternaries out of the JSX and stops them nesting.

</details>

<details>
<summary>Hint 4</summary>

For **Try again**, you're setting all three pieces back at once. Three setter calls in one handler is fine — React batches them into a single re-render.

</details>

---

## Exercise 5 (Challenge): Seat booking

In `src/ch08/ex5/`, build a cinema seat picker. This one is about getting the state *shape* right, which is the real skill this chapter teaches.

The cinema has 4 rows (A to D) of 6 seats. Some are already taken:

```ts
export const takenSeats = ["A3", "B1", "B2", "D6"];
export const seatPrice = 9.5;
```

The page shows:

```
Pick your seats

A  [1][2][X][4][5][6]
B  [X][X][3][4][5][6]
C  [1][2][3][4][5][6]
D  [1][2][3][4][5][X]

Selected: B3, C4
2 seats — $19.00

[ Book now ]    [ Clear ]
```

Requirements:

1. Build the grid with **nested `map`s** over the rows and the seat numbers. Don't write out 24 buttons.
2. A taken seat shows `X`, is disabled, and is grey.
3. Clicking a free seat selects it (green). Clicking it again deselects it. This must be a **toggle**, and you must be able to select and deselect in any order without the list getting duplicates.
4. Maximum **4 seats**. At 4, every unselected seat becomes disabled and a message says `You can book at most 4 seats.`
5. `Selected: ...` lists the seats **in row order**, not the order you clicked them. `Book now` is disabled with nothing selected.
6. `Book now` swaps the whole page for `Booked! Enjoy the film.` and a `Book more seats` button that resets everything (the seats you booked stay taken for the rest of the session — a nice extra, if you want it).
7. Only two pieces of state. If you find yourself adding a third, ask whether it's derivable.

<details>
<summary>Hint 1</summary>

The two pieces of state are: the selected seat ids (a `string[]`), and whether the booking is confirmed (a `boolean`). The count, the total, the "is this seat selected?" test, and "can I select more?" are all derived.

</details>

<details>
<summary>Hint 2</summary>

To build the rows: `const rows = ["A", "B", "C", "D"];` and `const seatNumbers = [1, 2, 3, 4, 5, 6];`. A seat's id is `row + number`. Map the rows on the outside and the numbers on the inside, with a key on each.

</details>

<details>
<summary>Hint 3</summary>

The toggle is one `if`/`else`, and both branches make a **new** array:

```tsx
if (selected.includes(id)) {
  setSelected(selected.filter((seat) => seat !== id));
} else {
  setSelected([...selected, id]);
}
```

</details>

<details>
<summary>Hint 4</summary>

For requirement 5, don't sort the state — sort a **copy** when you display it: `[...selected].sort().join(", ")`. Sorting the state itself would work by accident here, but it's the mutation habit you're trying to break, and `sort` on state is a real bug waiting for a less lucky day.

</details>

<details>
<summary>Hint 5</summary>

For requirement 6, the "booked seats stay taken" extra needs `takenSeats` to become state too — which is a third piece, and a legitimate one, because it genuinely can't be derived from anything. Getting that judgement right is the point of requirement 7: the rule isn't "as few as possible", it's "none that could be worked out".

</details>
