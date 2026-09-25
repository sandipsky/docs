# 52 Final Project: Exercises

**How to do these:**

- Pick **one** project from this menu. (Or your own idea, if you follow the same steps from the notes.)
- Make a new folder for it, like `plant-pal/`, anywhere you like.
- Follow the 9 steps in [notes.md](notes.md): must-haves first, then nice-to-haves.
- Share your code with Claude for a review after each working feature.

---

## Exercise 1 (Easy): Expense Tracker

Track what you spend in a week, so you can see where your money goes.

**Must-haves:**
- Add an expense: description, amount, category (food, transport, fun...).
- Show the list and the total.
- Delete an expense.
- Save everything with `localStorage`.

**Nice-to-haves:** a total per category, filter by category, a simple bar chart made with plain CSS widths.

**Practices:** forms (22), array methods (13), localStorage (23), numbers and money (05).

<details>
<summary>Hint</summary>

Store amounts in cents (whole numbers) like the shopping cart in chapter 12, and only turn them into dollars for display.

</details>

---

## Exercise 2 (Easy): Pomodoro Timer

A study timer: 25 minutes of focus, then a 5-minute break.

**Must-haves:**
- Show the time left as `mm:ss`.
- Start, pause, and reset buttons.
- Switch between "Focus" and "Break" automatically.

**Nice-to-haves:** count finished sessions (saved in `localStorage`), let the user change the lengths, play a sound when time is up.

**Practices:** timers (30), DOM and events (20, 21), `padStart` (06).

<details>
<summary>Hint</summary>

Don't trust `setInterval` to tick exactly once per second. Save the end time with `Date.now()` and work out the time left on each tick (chapter 30 explains why).

</details>

---

## Exercise 3 (Medium): Book Search

Search for books and keep a "want to read" list.

**Must-haves:**
- Search box with debounced suggestions as you type.
- Show title, author, and first publish year for each result.
- Loading and error messages.
- Add a book to your reading list (saved in `localStorage`).

Uses the free Open Library API, no key needed:
`https://openlibrary.org/search.json?q=the+hobbit&limit=5`

**Nice-to-haves:** cover images (`https://covers.openlibrary.org/b/id/<cover_i>-M.jpg`), mark books as read, cancel stale searches with `AbortController`.

**Practices:** fetch (33), debounce (34), modules (29), localStorage (23).

<details>
<summary>Hint 1</summary>

Log one response with `console.log` first, and look at its shape before writing any page code. The books are in `data.docs`.

</details>

<details>
<summary>Hint 2</summary>

Your chapter 39 weather app already has the search-with-suggestions pattern. Reuse its structure.

</details>

---

## Exercise 4 (Medium): Habit Tracker

Tick off daily habits (drink water, read, exercise) and see your streaks.

**Must-haves:**
- Add and remove habits.
- A checkbox for each habit for today.
- Show each habit's current streak (days in a row).
- Save with `localStorage`.

**Nice-to-haves:** a 7-day grid for each habit, a "best streak" record.

**Practices:** dates (19), pure functions and tests (43, 46), events (21).

<details>
<summary>Hint</summary>

Store the dates each habit was done as ISO strings, like `"2026-09-24"`. Then write `getStreak(doneDates, today)` as a pure function and test it with Node before connecting it to the page.

</details>

---

## Exercise 5 (Challenge): Kanban Board

A mini Trello: cards in three columns, "To do", "Doing", and "Done".

**Must-haves:**
- Add a card to "To do".
- Move a card to the next or previous column with buttons.
- Delete a card.
- Save the whole board with `localStorage`.

**Nice-to-haves:** drag and drop, edit a card's text, a search box that filters cards (debounced).

**Practices:** event delegation (21), classes or pure functions (27, 43), clean code (45), tests (46).

<details>
<summary>Hint 1</summary>

One array of cards is enough: give each card a `column` property, like `{ id: 1, text: "Buy paint", column: "todo" }`. Moving a card only changes that property.

</details>

<details>
<summary>Hint 2</summary>

Use one click listener on the whole board, and read `event.target.closest("[data-id]")` to find the card (chapter 21).

</details>
