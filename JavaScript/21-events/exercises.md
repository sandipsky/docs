# 21 Events: Exercises

**How to do these:**

- Make a folder for each exercise inside this chapter's folder: `ex1`, `ex2`, and so on.
- In each folder, create `index.html` (copy in the HTML from the exercise) and `script.js` (your code goes here). Don't change the HTML unless the exercise asks you to.
- Open `index.html` by double-clicking it. Press `F12` and click **Console** to see your messages and any errors.
- After every change: save, then refresh the page (`F5`). Then click, type, and press keys to test it.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Cup counter

A cafe wants a simple tally of how many cups it sells today. Use this HTML:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Cup Counter</title>
    <script src="script.js" defer></script>
  </head>
  <body>
    <h1>Corner Cafe</h1>
    <p id="count">Cups sold today: 0</p>
    <button id="add-button">+1 cup</button>
    <button id="undo-button">Undo</button>
    <button id="reset-button">Reset</button>
  </body>
</html>
```

Make the buttons work:

- **+1 cup** adds one to the count.
- **Undo** takes one away, but the count never goes below 0.
- **Reset** sets the count back to 0.

Test it like this:

| You do | The page shows |
|---|---|
| Click **+1 cup** five times | `Cups sold today: 5` |
| Click **Undo** twice | `Cups sold today: 3` |
| Click **Reset** | `Cups sold today: 0` |
| Click **Undo** again | still `Cups sold today: 0` |

**Rule:** write one function, `updateDisplay()`, that puts the current count on the page. Every button's handler changes the count, then calls it.

<details>
<summary>Hint</summary>

Keep the count in a `let` variable at the top of your script. The Like button at the start of the notes has the same shape: change the variable, then update the text.

</details>

**Bonus:** disable the Undo and Reset buttons whenever the count is 0 ([chapter 20](../20-dom-basics/notes.md) showed you `disabled`).

---

## Exercise 2 (Easy): Bio character counter

A social app limits profile bios to 60 characters. Show a live counter as the user types. Use this HTML (a `<textarea>` is a bigger text box with several lines, and its `value` works just like an `<input>`'s):

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Edit Profile</title>
    <style>
      body { font-family: sans-serif; }
      textarea { width: 300px; height: 80px; }
      .too-long { color: red; font-weight: bold; }
    </style>
    <script src="script.js" defer></script>
  </head>
  <body>
    <h1>Edit your profile</h1>
    <p>Bio:</p>
    <textarea id="bio"></textarea>
    <p id="counter">0 / 60</p>
  </body>
</html>
```

1. Every time the text changes, show how many characters there are, like `25 / 60`.
2. Over 60, add the class `too-long` (red, bold) and say how many are too many, like `66 / 60 (6 too many)`.
3. Back under 60, the counter goes back to normal.

Test it:

| You type | The counter shows |
|---|---|
| `I love hiking and coffee.` | `25 / 60` |
| `I love hiking, coffee, old maps, and very long walks on the beach.` | `66 / 60 (6 too many)` in red |
| Delete everything | `0 / 60` |

<details>
<summary>Hint 1</summary>

Which event fires on every keystroke? Inside the handler, `event.target.value` is the text, and strings have a `length` ([chapter 06](../06-strings/notes.md)).

</details>

<details>
<summary>Hint 2</summary>

Use an `if`/`else`: one branch adds the class and shows the longer message, the other removes the class. Removing a class that isn't there does no harm.

</details>

---

## Exercise 3 (Medium): Road trip game

Drive a car along a road with the arrow keys. Use this HTML:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Road Trip</title>
    <style>
      body { font-family: monospace; font-size: 32px; }
    </style>
    <script src="script.js" defer></script>
  </head>
  <body>
    <p id="road"></p>
    <p id="status"></p>
  </body>
</html>
```

Start `script.js` with:

```js
const roadLength = 10;
let position = 0;
```

1. Write a `render()` function that draws the road: 10 spots in a row, with the car `🚗` at `position` and `_` everywhere else. Under it, show `Position: 0`. Call `render()` once when the page loads.
2. `ArrowRight` moves the car one spot right, and `ArrowLeft` one spot left. The car can't drive off either end.
3. On the last spot, the status says `You made it! Press Escape to drive again.` instead of the position.
4. `Escape` puts the car back at the start.
5. Arrow keys normally scroll the page. Stop them from doing that.

Test it:

| You do | The page shows |
|---|---|
| Load the page | `🚗_________` and `Position: 0` |
| Press `ArrowRight` 3 times | `___🚗______` and `Position: 3` |
| Press `ArrowLeft` 5 times | `🚗_________` and `Position: 0` (it stops at the edge) |
| Hold `ArrowRight` down | `_________🚗` and `You made it! Press Escape to drive again.` |
| Press `Escape` | `🚗_________` and `Position: 0` |

(Holding a key down makes `keydown` fire again and again, so the car races to the end.)

<details>
<summary>Hint 1</summary>

Listen for `keydown` on `document`, and check `event.key`. The road is three pieces joined together: some `_`s, the car, then more `_`s. `repeat` from [chapter 06](../06-strings/notes.md) makes the `_`s.

</details>

<details>
<summary>Hint 2</summary>

Only change `position` when the move is allowed, then call `render()`. Call `event.preventDefault()` for the two arrow keys only, so that other keys keep working normally.

</details>

---

## Exercise 4 (Medium): Shopping list

A shopping list where you can add items, cross them off, and remove them. Use this HTML:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Shopping List</title>
    <style>
      body { font-family: sans-serif; }
      .bought { text-decoration: line-through; color: gray; }
    </style>
    <script src="script.js" defer></script>
  </head>
  <body>
    <h1>Shopping list</h1>
    <input id="new-item" placeholder="Add an item">
    <button id="add-button">Add</button>
    <ul id="list">
      <li>Milk <button class="remove">Remove</button></li>
      <li>Eggs <button class="remove">Remove</button></li>
      <li>Bread <button class="remove">Remove</button></li>
    </ul>
    <p id="count">3 items</p>
  </body>
</html>
```

1. **Add:** clicking Add creates a new item from the text in the box, with its own Remove button, at the end of the list. Trim the spaces off the text. If the box is empty, do nothing. Afterwards, empty the box.
2. **Remove:** clicking an item's Remove button removes that item, including items you added yourself.
3. **Cross off:** clicking anywhere else on an item crosses it off with the `bought` class. Clicking it again un-crosses it.
4. **Count:** keep the count under the list up to date: `3 items`, `2 items`, `1 item`.

Test it:

| You do | The list shows |
|---|---|
| Click the word "Eggs" | Eggs is crossed out |
| Click Milk's Remove button | Eggs, Bread, and `2 items` |
| Type `  Apples  ` and click Add | Eggs, Bread, Apples, and `3 items`. The box is empty again |
| Click Add with an empty box | nothing changes |
| Click Apples' Remove button | Eggs, Bread, and `2 items` |

**Rule:** use event delegation. The list gets exactly **one** click listener, and the Remove buttons get none of their own.

<details>
<summary>Hint 1</summary>

The shopping list example in the notes is a great starting point. For the count, `list.querySelectorAll("li").length` tells you how many items are left.

</details>

<details>
<summary>Hint 2</summary>

Inside the list's listener, first check `event.target.closest(".remove")`. If that finds a button, remove its item and stop there (`return`). Otherwise, use `closest("li")` to find the item to cross off.

</details>

**Bonus:** make the `Enter` key add an item too, while you're typing in the box.

---

## Exercise 5 (Challenge): Cinema seat picker

Build the seat picker for a cinema's booking page. Use this HTML:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Pick Your Seats</title>
    <style>
      body { font-family: sans-serif; }
      .seat { width: 44px; height: 36px; margin: 3px; }
      .taken { background-color: #999; color: white; }
      .selected { background-color: #2e8b57; color: white; }
      #message { color: darkred; }
    </style>
    <script src="script.js" defer></script>
  </head>
  <body>
    <h1>Screen 1: The Space Race</h1>
    <p>(Screen this way)</p>
    <div id="seats"></div>
    <p id="summary">No seats selected</p>
    <p id="message"></p>
    <button id="clear-button">Clear selection</button>
  </body>
</html>
```

Start `script.js` with this data:

```js
const rows = ["A", "B", "C"];
const seatsPerRow = 6;
const takenSeats = ["A3", "A4", "B1", "C5", "C6"];
const pricePerSeat = 8.5;
const maxSeats = 4;
let selectedSeats = [];
```

1. **Draw the seats.** Each row is a `div` with six buttons, labeled `A1` to `A6` and so on. Every button gets the class `seat` and a `data-seat` attribute with its label. Taken seats also get the class `taken` and are disabled.
2. **Pick seats.** Clicking a free seat selects it (class `selected`). Clicking a selected seat unselects it.
3. **A limit.** Nobody can pick more than 4 seats. Trying to pick a fifth shows `You can pick up to 4 seats.` under the summary. The next successful click clears that message.
4. **Summary.** Show the selected seats in seat order, with the total price, like `Selected: A1, B2 (total $17.00)`. With nothing selected, show `No seats selected`.
5. **Clear.** The Clear button and the `Escape` key both unselect everything.

Test it:

| You do | The summary shows |
|---|---|
| Click B2, then A1 | `Selected: A1, B2 (total $17.00)` |
| Click A3 (a grey, taken seat) | nothing changes |
| Click A2, then B3 | `Selected: A1, A2, B2, B3 (total $34.00)` |
| Click C1 | the same, plus the message `You can pick up to 4 seats.` |
| Click A1 again | `Selected: A2, B2, B3 (total $25.50)`, and the message is gone |
| Press `Escape` | `No seats selected`, and no seat is green |

**Rule:** the whole seat area gets exactly one click listener. Keep `selectedSeats` as the single source of truth: change the array, then redraw the page from it.

<details>
<summary>Hint 1</summary>

Write a `render()` function that clears `#seats`, rebuilds every seat button from the data (like `renderMenu` in [chapter 20](../20-dom-basics/notes.md)), and updates the summary. Call it once at the start, and again after every change. Because the listener sits on `#seats` itself, it keeps working even though the buttons are rebuilt.

</details>

<details>
<summary>Hint 2</summary>

In the listener, `event.target.closest(".seat")` finds the seat that was clicked (or `null` if the click landed in a gap). Its `dataset.seat` tells you which one. `includes` ([chapter 10](../10-arrays/notes.md)) can check for a seat, and `filter` ([chapter 13](../13-array-methods/notes.md)) can take one out of the array. Disabled buttons don't fire click events at all, so taken seats look after themselves.

</details>

<details>
<summary>Hint 3</summary>

`toSorted()` puts `["B2", "A1"]` in seat order without changing `selectedSeats`. For the price, remember `toFixed` from [chapter 05](../05-numbers-and-math/notes.md).

</details>

---

## Before you move on

In Exercises 2 and 4, you read text straight out of boxes on the page. Real websites are full of boxes like that: sign-up forms, checkout pages, feedback forms. They need checking, too. What if someone types "abc" as their age?

[Chapter 22: Forms](../22-forms/notes.md) shows you how to read every kind of input, check it, and show helpful error messages.
