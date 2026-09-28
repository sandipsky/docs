# 14 Thinking in React: Exercises

**How to do these:**

- Work in your practice app, one folder per exercise: `src/ch14/ex1/`, and so on.
- **Write out all five steps as comments before you write any real component code** — the component tree, which candidates you rejected as state and why, and where each surviving piece lives. The plan is most of the exercise. The code should follow quickly once the plan is right.
- An exercise is done when the page works, your five-step plan is in the file as comments, VS Code shows no red squiggles, and `npx tsc -b` prints nothing.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): A rating widget

Design: five stars in a row. Clicking a star sets the rating to that many stars, filling every star up to and including it. Hovering shows a preview fill, without committing to it — moving the mouse away reverts to the actual rating.

```
★★★☆☆   (rating: 2)
```

1. Write the five steps as comments in `src/ch14/ex1/Ex1.tsx`: the component hierarchy (there's a `StarRating` and a `Star`, at minimum), the state candidates and which survive, and where they live.
2. Build the static version first — five stars, all rendered, none of them doing anything yet.
3. Add the state and wire it up.

Pay particular attention to step 3 for the **hover preview**: is it the same piece of state as the actual rating, or a second one? Get this wrong and either hovering will overwrite your real rating, or the preview won't work at all.

<details>
<summary>Hint 1</summary>

Two pieces of state: the committed `rating` (a number), and a separate `hoveredStar: number | null` for the preview. What's actually drawn — "is this star filled?" — is derived from whichever of the two is relevant: use the hover value if it's not `null`, otherwise the real rating.

</details>

---

## Exercise 2 (Easy): A shopping list with a running total

Design:

```
[ item name        ] [ qty ] [ Add ]

Milk           x 2      $3.00
Bread          x 1      $2.50
                         -----
Total:                   $5.50
```

1. Plan the five steps for `src/ch14/ex2/Ex2.tsx`. There are at least three components: the add-form, the list, and one row.
2. Give every item a fixed price by name from a small lookup object (`{ Milk: 1.5, Bread: 2.5, ... }`) rather than typing a price in — assume the form only offers items that exist in that lookup, via a `<select>`.
3. Build it.

In your state-candidates table (step 3), make sure "the total" appears as a rejected candidate, with a one-line reason.

<details>
<summary>Hint 1</summary>

The only real state is the list of `{ name, quantity }` items. The price per line and the total are both derived — the price by looking the name up in your lookup object, the total by summing across the list.

</details>

---

## Exercise 3 (Medium): A filterable, sortable staff directory

Design: a table of employees, with a search box, a department dropdown, and clickable column headers that sort by that column (clicking the same header again reverses the order).

```
Search: [        ]   Department: [ All ▾ ]

Name ▲       Department     Start Date
Maya         Engineering    2022-01-10
Tom          Sales          2021-06-01
Priya        Engineering    2023-03-15
```

Start with:

```ts
export type Employee = {
  id: string;
  name: string;
  department: "Engineering" | "Sales" | "Support";
  startDate: string;
};

export const employees: Employee[] = [
  { id: "1", name: "Maya", department: "Engineering", startDate: "2022-01-10" },
  { id: "2", name: "Tom", department: "Sales", startDate: "2021-06-01" },
  { id: "3", name: "Priya", department: "Engineering", startDate: "2023-03-15" },
  { id: "4", name: "Sam", department: "Support", startDate: "2020-11-20" },
  { id: "5", name: "Ana", department: "Sales", startDate: "2023-07-02" },
];
```

1. Plan and write the five steps in `src/ch14/ex3/`. Be deliberate about step 3: search text, department filter, sort column, and sort direction are four separate, real pieces of state. The visible rows are not — they're derived from all four plus the constant array.
2. Build the static version: the table and controls, rendering the full unsorted, unfiltered list, with none of the controls wired up.
3. Wire it up. Clicking a header that's already the active sort column reverses direction instead of doing nothing.
4. Show `▲` or `▼` next to whichever column is currently sorted.

<details>
<summary>Hint 1</summary>

For step 3, sort column and sort direction could be one piece of state (a string like `"name-asc"`) or two. Either is defensible — the point of the exercise is noticing there's a decision to make and writing down which you picked and why, not landing on one particular answer.

</details>

<details>
<summary>Hint 2</summary>

Chain the derived list the same way as in the notes: filter by department, then filter by search text, then sort a **copy** ([chapter 06](../06-rendering-lists/notes.md)) — never the original `employees` array.

</details>

---

## Exercise 4 (Medium): A multi-step design, given only the picture

This one starts you further from the code than usual, on purpose. Here's the whole design, described in words instead of a table of data:

> A **flashcard quiz app**. One card is shown at a time, with a question. Clicking the card flips it to reveal the answer. Two buttons, **Got it right** and **Got it wrong**, appear only once the card is flipped, and move to the next card either way. A progress line reads `Card 3 of 8`. At the end, a results screen shows `You got 5 out of 8 right`, with a **Start over** button.

1. Sketch the component hierarchy in a comment — there's no single right answer, but you should be able to justify your boxes.
2. Write out every candidate for state you can think of, and for each one, say whether it survives and why, in a comment table like the ones in the notes.
3. Decide where each surviving piece lives — with this few components, that part may be quick, but write it down anyway.
4. Build the static version, then wire it up, in `src/ch14/ex4/`.

Use this data:

```ts
export type Card = {
  id: string;
  question: string;
  answer: string;
};

export const cards: Card[] = [
  { id: "1", question: "What does JSX compile to?", answer: "JavaScript function calls" },
  { id: "2", question: "What hook holds state?", answer: "useState" },
  { id: "3", question: "What must every list item have?", answer: "A unique, stable key" },
];
```

(Use just these three while you build; duplicate a couple to test with more once it works.)

<details>
<summary>Hint 1</summary>

Whether a card is flipped is state that resets every time you move to the next card — it's not something that survives across cards. Think about whether that argues for one `isFlipped` flag reset on each "next," or something derived from "which card index have I flipped."

</details>

<details>
<summary>Hint 2</summary>

The score is a case worth thinking about carefully. You could store one running number, incremented on "Got it right." You could instead store every answer given, as an array, and derive the score by filtering it. The second is more data but makes "review your wrong answers" trivial to add later. Pick one, and say in a comment what the other approach would have cost or bought you.

</details>

---

## Exercise 5 (Challenge): Redesign something you already built

Go back to the **library checkout page** from [chapter 04, exercise 5](../04-props/exercises.md) or the **AccountPage** from [chapter 05, exercise 5](../05-conditional-rendering/exercises.md) — pick whichever one you remember better. Neither had any state at all; they were built from fixed props.

In `src/ch14/ex5/`, redesign it as a genuinely interactive page using the five-step method:

1. **New design brief:** each loan row gets a **Renew** button (only for loans that are renewable and not late, per the original rules) that adds 14 days to a due date and resets `daysLate` to 0. Add a **Return** button that removes the loan from the account entirely. Add a text box that filters the visible loans by title as you type.
2. Write the five steps from scratch for this new version — don't just bolt state onto the old component. Some of your original components may need different props now that some of what they show is state instead of a fixed prop; say so in a comment where that happens.
3. Build it.
4. In a closing comment, answer honestly: what would have gone wrong if you'd added `useState` calls into the *old* components directly, without redoing the ownership step? Be specific about which component would have ended up needing data it had no way to reach.

<details>
<summary>Hint 1</summary>

The account's list of loans has to become state now — it's no longer a fixed prop, since Renew and Return both change it. That state has to live somewhere all three things that touch it (the filter box, the renew buttons, the return buttons) can reach — likely higher up than where any individual loan row lives.

</details>

<details>
<summary>Hint 2</summary>

The filter text and the underlying loans array are two different pieces of state with two different owners to think about, even though they end up combined into one derived, displayed list — exactly like the search-and-filter example in the notes.

</details>
