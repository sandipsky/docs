# 23 JSON and Local Storage: Exercises

**How to do these:**

- Exercises 1 and 3 run in **Node**. Make `ex1.js` (or `ex3.js`) in this chapter's folder and run it with `node ex1.js`.
- Exercises 2, 4 and 5 run in the **browser**. Make a folder for each one (`ex2`, `ex4`, `ex5`) with an `index.html` (copy the HTML from the exercise) and a `script.js`. Open `index.html` by double-clicking it, and keep the Console open (`F12`).
- To check that your data survives, refresh the page. To start over, delete your keys in DevTools (**Application** tab → **Local storage**), or run `localStorage.clear()` in the Console.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Parcel labels

A delivery company's computers send parcel details to each other as JSON. Start your file with this data:

```js
const parcel = {
  id: "PKG-1042",
  weightKg: 2.5,
  fragile: true,
  items: ["mug", "teapot"],
  deliveredAt: null,
};

const fromWarehouse = '{"id":"PKG-2077","weightKg":12,"fragile":false,"items":["books","lamp"],"deliveredAt":null}';
```

1. Print `parcel` as JSON on one line.
2. Print it again, pretty-printed with 2 spaces.
3. Parse `fromWarehouse` and print a sentence about that parcel.

Expected output:

```
{"id":"PKG-1042","weightKg":2.5,"fragile":true,"items":["mug","teapot"],"deliveredAt":null}
{
  "id": "PKG-1042",
  "weightKg": 2.5,
  "fragile": true,
  "items": [
    "mug",
    "teapot"
  ],
  "deliveredAt": null
}
PKG-2077 weighs 12 kg and contains 2 items: books, lamp
```

**Rule:** don't type any of the output yourself. Let `JSON.stringify` and your parsed object do the work.

<details>
<summary>Hint</summary>

Pretty-printing puts each item of an array on its own line. That's normal. For the sentence, the parsed `items` is a real array, so `length` and `join(", ")` from [chapter 10](../10-arrays/notes.md) work on it.

</details>

---

## Exercise 2 (Easy): Remember my name

A website greets visitors by name, and remembers them next time.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Welcome</title>
    <script src="script.js" defer></script>
  </head>
  <body>
    <h1 id="greeting">Welcome, stranger!</h1>
    <form id="name-form">
      <label for="visitor">What's your name?</label>
      <input id="visitor" name="visitor" type="text" required>
      <button type="submit">Save</button>
    </form>
    <button id="forget-button">Forget me</button>
  </body>
</html>
```

1. When the form is submitted, save the trimmed name in `localStorage` under the key `"welcome-name"`, and change the heading to `Nice to meet you, Sam!` (with the real name).
2. When the page loads and a name is saved, the heading says `Welcome back, Sam!`. With no saved name, it stays `Welcome, stranger!`.
3. "Forget me" deletes the saved name and puts the heading back to `Welcome, stranger!`.

Here's what you should see, step by step:

| You do this | The heading says |
|---|---|
| Open the page for the first time | `Welcome, stranger!` |
| Type `Sam` and click "Save" | `Nice to meet you, Sam!` |
| Refresh the page | `Welcome back, Sam!` |
| Click "Forget me" | `Welcome, stranger!` |
| Refresh the page again | `Welcome, stranger!` |

A name is already a string, so this exercise doesn't need JSON.

<details>
<summary>Hint 1</summary>

The code that checks for a saved name goes at the top level of `script.js`, not inside a handler. It runs once, every time the page loads. `getItem` gives you `null` when nothing is saved.

</details>

<details>
<summary>Hint 2</summary>

Remember `event.preventDefault()` from [chapter 22](../22-forms/notes.md), or the page reloads before you see your message. To forget the name, use `removeItem`.

</details>

---

## Exercise 3 (Medium): Glitchy thermostats

A smart home hub collects temperature readings from sensors around the house. Each reading arrives as a JSON string, but some of the sensors are glitchy and send broken JSON. Start your file with this data:

```js
const readings = [
  '{"room": "kitchen", "celsius": 21.5}',
  "{'room': 'bedroom', 'celsius': 19}",
  '{"room": "garage", "celsius": 12,}',
  '{"room": "attic", "celsius": 25}',
];
```

1. Write a function `parseReading(text)`. It returns the parsed reading, or prints a message and returns `null` if the JSON is broken.
2. Go through all the readings. Print each good one, and skip the broken ones.
3. At the end, print the average temperature of the good readings.

Expected output:

```
kitchen: 21.5°C
Skipped a broken reading: Expected property name or '}' in JSON at position 1 (line 1 column 2)
Skipped a broken reading: Expected double-quoted property name in JSON at position 33 (line 1 column 34)
attic: 25°C
Average of 2 good readings: 23.25°C
```

(You can copy the `°` symbol from this page.)

**Rule:** don't type the error messages yourself. Print the `message` of the error that `JSON.parse` throws.

<details>
<summary>Hint 1</summary>

Put the `try`/`catch` inside `parseReading`. In the `catch` block, print the message and `return null`. Then the loop only has to check whether it got `null` back.

</details>

<details>
<summary>Hint 2</summary>

Collect the good readings in an array as you go. For the average, add up their `celsius` values (a loop or `reduce` from [chapter 13](../13-array-methods/notes.md)) and divide by how many there are.

</details>

---

## Exercise 4 (Medium): Reader settings

A local news website lets readers pick a text size and hide the weather box. The site should remember their choices.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Town News</title>
    <style>
      .small { font-size: 14px; }
      .medium { font-size: 18px; }
      .large { font-size: 24px; }
      .hidden { display: none; }
    </style>
    <script src="script.js" defer></script>
  </head>
  <body>
    <form id="settings-form">
      <label for="text-size">Text size</label>
      <select id="text-size">
        <option value="small">Small</option>
        <option value="medium" selected>Medium</option>
        <option value="large">Large</option>
      </select>

      <input id="show-weather" type="checkbox" checked>
      <label for="show-weather">Show the weather box</label>

      <button id="reset-button" type="button">Reset to defaults</button>
    </form>

    <p id="weather">Today: 18°C and sunny</p>
    <article id="article" class="medium">
      <h1>Town library opens a new reading garden</h1>
      <p>The garden has benches, shade trees and free Wi-Fi.</p>
    </article>
  </body>
</html>
```

Keep the settings in an object with this shape. These are also the defaults:

```js
const DEFAULT_SETTINGS = { textSize: "medium", showWeather: true };
```

1. Write `applySettings(settings)`. It gives the article the class for the chosen text size (and only that one), and hides the weather box when `showWeather` is `false`.
2. Whenever a setting changes, build a new settings object from the form, save it under the key `"news-settings"`, and apply it.
3. When the page loads, load the saved settings (or the defaults), put them into the form fields, and apply them.
4. "Reset to defaults" deletes the saved settings, puts the defaults back into the form, and applies them.

Choose "Large" and untick the weather box. The text gets bigger and the weather box disappears. Now run this in the Console:

```js
console.log(localStorage.getItem("news-settings"));
```

You'll see:

```
{"textSize":"large","showWeather":false}
```

Refresh the page: the text is still large, the weather box is still hidden, and the form still shows "Large" and an empty tick box. Click "Reset to defaults", and everything goes back to medium text with the weather box showing. Run the line above again, and it prints `null`.

**Rule:** use the `save` and `load` helpers from the notes.

<details>
<summary>Hint 1</summary>

The `change` event bubbles up to the form ([chapter 21](../21-events/notes.md)), so one listener on the form hears both fields. Read the dropdown with `.value` and the tick box with `.checked` ([chapter 22](../22-forms/notes.md)).

</details>

<details>
<summary>Hint 2</summary>

For the text size, remove all three size classes first, then add the chosen one. `classList.remove()` accepts several names at once: `classList.remove("small", "medium", "large")`.

</details>

<details>
<summary>Hint 3</summary>

Steps 3 and 4 both "put settings into the form, then apply them". A small function for that saves you from writing it twice.

</details>

---

## Exercise 5 (Challenge): Recently viewed

Online shops often show the products you looked at recently. Build that for Bella's Bakery.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Bella's Bakery</title>
    <style>
      .hidden { display: none; }
    </style>
    <script src="script.js" defer></script>
  </head>
  <body>
    <h1>Bella's Bakery</h1>
    <ul id="products">
      <li><button data-name="Sourdough loaf">Sourdough loaf</button></li>
      <li><button data-name="Croissant">Croissant</button></li>
      <li><button data-name="Cinnamon roll">Cinnamon roll</button></li>
      <li><button data-name="Bagel">Bagel</button></li>
    </ul>

    <h2>Recently viewed</h2>
    <p id="empty-message">Nothing yet. Click a product to view it.</p>
    <ol id="recent"></ol>
    <button id="clear-button">Clear history</button>
  </body>
</html>
```

The rules:

1. Clicking a product puts its name at the top of "Recently viewed".
2. No duplicates: if the product is already in the list, it moves to the top.
3. Only the 3 most recent products are kept.
4. The list is saved in `localStorage` under the key `"bakery-recent"`, and it's still there after a refresh.
5. `#empty-message` only shows while the list is empty.
6. "Clear history" empties the list and deletes the saved data.
7. Broken data doesn't break the page. Run `localStorage.setItem("bakery-recent", "oops")` in the Console and refresh. The page still works (with an empty list), and the Console shows an error message.

Use **one** click listener on `#products` (event delegation from [chapter 21](../21-events/notes.md)), and read each product's name from its `data-name` ([chapter 20](../20-dom-basics/notes.md)).

Click Croissant, Sourdough loaf, Bagel, and then Croissant again. "Recently viewed" shows:

```
1. Croissant
2. Bagel
3. Sourdough loaf
```

Now click Cinnamon roll:

```
1. Cinnamon roll
2. Croissant
3. Bagel
```

(An `<ol>` numbers its items for you, so the numbers aren't part of your text.)

Refresh the page, and the same three are still there. `console.log(localStorage.getItem("bakery-recent"))` prints:

```
["Cinnamon roll","Croissant","Bagel"]
```

<details>
<summary>Hint 1</summary>

Keep the list in an array, and write one `render()` function that rebuilds the `<ol>` from that array, like rendering a list in chapter 20. Call it once when the page loads, and again after every change.

</details>

<details>
<summary>Hint 2</summary>

To move a product to the top, first take it out with `filter` ([chapter 13](../13-array-methods/notes.md)), then put it at the front with `unshift`, then keep the first three with `slice` ([chapter 10](../10-arrays/notes.md)).

</details>

<details>
<summary>Hint 3</summary>

A click can land on the `<ul>` itself, in the gaps between the buttons. `event.target.closest("button")` gives you the button that was clicked, or `null` if the click wasn't on one.

</details>

---

## Before you move on

You now have every piece of a real app: a form to add things ([chapter 22](../22-forms/notes.md)), a list drawn from an array (chapter 20), clicks handled with delegation (chapter 21), and storage that remembers (this chapter).

[Chapter 24](../24-project-todo-app/notes.md) puts them all together into your first real web app: a to-do list. 🙂
