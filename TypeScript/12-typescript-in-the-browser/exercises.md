# 12 TypeScript in the Browser: Exercises

**How to do these:**

- Create one Vite project for this chapter: `npm create vite@latest` inside `playground`, name it `ch12`, and choose **Vanilla** and **TypeScript**. Then `cd ch12`, `npm install`, `npm run dev`.
- For each exercise, replace the `<body>` of `ch12/index.html` with the HTML given, and write your code in `src/main.ts`. (Delete the starter code Vite put there.)
- `npx tsc` (inside `ch12`) must show no errors. **Rule:** no `!` and no `as`. Use real checks.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): A like button

```html
<body>
  <button id="like">👍 0</button>
  <script type="module" src="/src/main.ts"></script>
</body>
```

Each click adds one like and updates the button's text: `👍 1`, `👍 2`, ...

<details>
<summary>Hint</summary>

`document.querySelector("button")` gives an `HTMLButtonElement | null`. Throw a clear error if it's `null`, then add the click listener.

</details>

---

## Exercise 2 (Easy): Character counter

```html
<body>
  <textarea id="bio" maxlength="100"></textarea>
  <p id="count">0 / 100</p>
  <script type="module" src="/src/main.ts"></script>
</body>
```

As the user types, update the paragraph: `42 / 100`.

<details>
<summary>Hint</summary>

The textarea's type is `HTMLTextAreaElement`. Use `instanceof HTMLTextAreaElement` to narrow the result of `getElementById("bio")`, and listen for the `input` event.

</details>

---

## Exercise 3 (Medium): A typed tip calculator

```html
<body>
  <form id="tip-form">
    <input name="bill" type="number" placeholder="Bill" required>
    <select name="percent">
      <option value="10">10%</option>
      <option value="15" selected>15%</option>
      <option value="20">20%</option>
    </select>
    <button>Calculate</button>
  </form>
  <p id="result"></p>
  <script type="module" src="/src/main.ts"></script>
</body>
```

On submit, show `Tip: $7.50` for a bill of 50 at 15%. Write the calculation as a separate typed function, `calculateTip(bill: number, percent: number): number`, that doesn't touch the page.

<details>
<summary>Hint 1</summary>

Input and select values are always strings (JavaScript chapter 22). Convert them with `Number()` before calling `calculateTip`.

</details>

<details>
<summary>Hint 2</summary>

`form.elements.namedItem("bill")` returns something general. Narrow it with `instanceof HTMLInputElement`, and the other one with `instanceof HTMLSelectElement`.

</details>

---

## Exercise 4 (Challenge): Delegated delete buttons

```html
<body>
  <ul id="tasks">
    <li data-id="1">Buy milk <button class="delete">✕</button></li>
    <li data-id="2">Call mum <button class="delete">✕</button></li>
    <li data-id="3">Water plants <button class="delete">✕</button></li>
  </ul>
  <p id="status"></p>
  <script type="module" src="/src/main.ts"></script>
</body>
```

Use **one** click listener on the `<ul>` (event delegation). When a delete button is clicked, remove its `<li>` and show `Deleted task 2` (with the right id) in the status paragraph. Clicking the text of a task should do nothing.

<details>
<summary>Hint 1</summary>

Start with `if (!(event.target instanceof HTMLButtonElement)) return;`, a guard clause.

</details>

<details>
<summary>Hint 2</summary>

`event.target.closest("li")` returns `HTMLLIElement | null`, and `li.dataset.id` is `string | undefined`. Handle both.

</details>
