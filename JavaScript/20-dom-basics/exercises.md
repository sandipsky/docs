# 20 DOM Basics: Exercises

**How to do these:**

- Make a folder for each exercise inside this chapter's folder: `ex1`, `ex2`, and so on.
- In each folder, create `index.html` (copy in the HTML from the exercise) and `script.js` (your code goes here). Don't change the HTML unless the exercise asks you to.
- Open `index.html` by double-clicking it. Press `F12` and click **Console** to see your messages and any errors.
- After every change: save, then refresh the page (`F5`).
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Cafe menu board

A cafe shows its menu on a screen by the counter. Use this HTML:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Menu Board</title>
    <script src="script.js" defer></script>
  </head>
  <body>
    <h1 id="cafe-name">Cafe</h1>
    <p>Today's special: <span id="special">coming soon</span></p>
    <ul id="drinks">
      <li class="drink">Espresso</li>
      <li class="drink">Cappuccino</li>
      <li class="drink">Chai latte</li>
      <li class="drink">Hot chocolate</li>
    </ul>
    <p id="drink-count"></p>
  </body>
</html>
```

In `script.js`:

1. Change the heading to `Corner Cafe`.
2. Change the special to `Pumpkin spice latte`.
3. Count the drinks and show the count in the last paragraph.
4. Print each drink in the Console, with its number.

The page should show:

```
Corner Cafe
Today's special: Pumpkin spice latte
• Espresso
• Cappuccino
• Chai latte
• Hot chocolate
We serve 4 drinks.
```

And the Console should show:

```
1. Espresso
2. Cappuccino
3. Chai latte
4. Hot chocolate
```

**Rule:** don't type the number 4. If the cafe adds a fifth drink to the HTML, your code should say 5 without any changes.

<details>
<summary>Hint 1</summary>

The heading, the special, and the count paragraph all have an `id`. The drinks share a class, so `querySelectorAll` can find them all, and a NodeList has a `length`.

</details>

<details>
<summary>Hint 2</summary>

`forEach` gives your callback the index as a second argument, just like with arrays. Indexes start at 0, but the list should start at 1.

</details>

---

## Exercise 2 (Easy): Weather card

A weather app shows a card that changes color with the weather. Use this HTML. The CSS is already written for you:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Weather</title>
    <style>
      .card { padding: 16px; border-radius: 8px; width: 260px; font-family: sans-serif; }
      .sunny { background-color: #ffe98a; }
      .rainy { background-color: #b9d4f0; }
      .snowy { background-color: #eef3f8; }
      .alert { color: darkred; font-weight: bold; }
      .hidden { display: none; }
    </style>
    <script src="script.js" defer></script>
  </head>
  <body>
    <div id="card" class="card">
      <h2 id="city">City</h2>
      <p id="temperature">--</p>
      <p id="alert" class="alert hidden">No alerts</p>
    </div>
  </body>
</html>
```

Start `script.js` with this data:

```js
const weather = {
  city: "Pokhara",
  condition: "rainy",
  temperature: 18,
  alert: "Heavy rain expected after 6 PM",
};
```

1. Show the city, and the temperature as `18°C` (copy the `°` symbol from here).
2. Give the card the class that matches the weather's `condition`, so it turns blue.
3. If there's an alert, put its text in the alert paragraph and make it visible.
4. In the Console, show whether the card has the classes `sunny` and `rainy`.

The page should show a light blue card with:

```
Pokhara
18°C
Heavy rain expected after 6 PM
```

And the Console should show:

```
Sunny? false
Rainy? true
```

Then test it: change `condition` to `"sunny"` and `alert` to `""`, and refresh. The card should turn yellow, the alert should stay hidden, and the Console should say `Sunny? true` and `Rainy? false`.

**Rule:** don't use `style` in your JavaScript. Only change classes.

<details>
<summary>Hint 1</summary>

The class names in the CSS are exactly the same words as the conditions. So you can hand `weather.condition` straight to one of the `classList` methods.

</details>

<details>
<summary>Hint 2</summary>

The alert paragraph is hidden by its `hidden` class. An empty string is falsy ([chapter 07](../07-conditionals/notes.md)), so `if (weather.alert)` tells you whether there's an alert to show.

</details>

---

## Exercise 3 (Medium): Road trip playlist

Build a playlist page from an array. The list starts empty, and your code fills it in:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Road Trip Playlist</title>
    <style>
      body { font-family: sans-serif; }
      .long { color: purple; font-style: italic; }
    </style>
    <script src="script.js" defer></script>
  </head>
  <body>
    <h1>Road Trip Playlist</h1>
    <ol id="playlist"></ol>
    <p id="summary"></p>
  </body>
</html>
```

(`<ol>` is a numbered list, so the browser adds the numbers for you.) Start `script.js` with this data:

```js
const songs = [
  { title: "Bohemian Rhapsody", artist: "Queen", seconds: 354 },
  { title: "Hotel California", artist: "Eagles", seconds: 391 },
  { title: "Here Comes the Sun", artist: "The Beatles", seconds: 185 },
  { title: "Africa", artist: "Toto", seconds: 295 },
  { title: "Stairway to Heaven", artist: "Led Zeppelin", seconds: 482 },
];
```

1. Write a function `formatTime(totalSeconds)` that turns `354` into `"5:54"` and `185` into `"3:05"`.
2. Add one list item per song, like `Bohemian Rhapsody - Queen (5:54)`.
3. Songs longer than 6 minutes get the class `long`.
4. Fill in the summary with the number of songs and the total playing time.

The page should show:

```
Road Trip Playlist
1. Bohemian Rhapsody - Queen (5:54)
2. Hotel California - Eagles (6:31)
3. Here Comes the Sun - The Beatles (3:05)
4. Africa - Toto (4:55)
5. Stairway to Heaven - Led Zeppelin (8:02)
5 songs, 28:27 total
```

"Hotel California" and "Stairway to Heaven" should be purple and in italics.

**Rule:** use `createElement` and `append`, not `innerHTML`.

<details>
<summary>Hint 1</summary>

For `formatTime`, `Math.floor(totalSeconds / 60)` gives the minutes and `totalSeconds % 60` gives the seconds left over ([chapter 04](../04-operators/notes.md)). `padStart` turns `5` into `"05"`.

</details>

<details>
<summary>Hint 2</summary>

`reduce` can add up all the seconds ([chapter 13](../13-array-methods/notes.md)), and your `formatTime` works for the total too.

</details>

---

## Exercise 4 (Medium): Book of the week

A library's website shows one featured book. Use this HTML:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Library</title>
    <style>
      body { font-family: sans-serif; }
      .book { border: 1px solid #ccc; border-radius: 8px; padding: 16px; width: 240px; }
      .book img { width: 120px; }
      .unavailable { opacity: 0.5; }
    </style>
    <script src="script.js" defer></script>
  </head>
  <body>
    <h1>Book of the week</h1>
    <div id="book" class="book">
      <img id="cover" src="" alt="">
      <h2 id="title">Title</h2>
      <p id="author">Author</p>
      <a id="details-link" href="#">More details</a>
      <p><button id="borrow-button">Borrow</button></p>
    </div>
  </body>
</html>
```

Start `script.js` with this data:

```js
const book = {
  isbn: "9780141439518",
  title: "Pride and Prejudice",
  author: "Jane Austen",
  copiesLeft: 0,
};
```

1. Fill in the title, and the author as `by Jane Austen`.
2. Show the cover. Its address is `https://covers.openlibrary.org/b/isbn/` followed by the ISBN and `-M.jpg`. Give it the alt text `Cover of Pride and Prejudice`.
3. Point the link at the book's Wikipedia page: `https://en.wikipedia.org/wiki/Pride_and_Prejudice`. Build it from the title, with the spaces turned into underscores.
4. Store the ISBN on the card as a `data-isbn` attribute.
5. When no copies are left: disable the Borrow button, change its text to `Waiting list only`, and add the class `unavailable` to the card (it fades out).
6. Print these checks in the Console:

```
Link goes to: https://en.wikipedia.org/wiki/Pride_and_Prejudice
Card ISBN: 9780141439518
Borrow button disabled? true
```

The page should show the book's cover (you need to be online for it to load), the title, `by Jane Austen`, a "More details" link, and a greyed-out `Waiting list only` button. Click the link to check it goes to the right page.

<details>
<summary>Hint 1</summary>

Images and links have `src` and `href` properties, and template literals are perfect for building the addresses. `replaceAll` from [chapter 06](../06-strings/notes.md) can swap the spaces for underscores.

</details>

<details>
<summary>Hint 2</summary>

To add a `data-isbn` attribute, you can use `setAttribute("data-isbn", ...)`, or set `dataset.isbn`. Right-click the card and choose **Inspect** to check that it's there.

</details>

**Bonus:** change `copiesLeft` to `2` and refresh. The button should say `Borrow`, and neither the button nor the card should be greyed out.

---

## Exercise 5 (Challenge): Library loans dashboard

Build a "My loans" page that shows which borrowed books are overdue. This one uses dates from [chapter 19](../19-dates-and-times/notes.md):

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>My Loans</title>
    <style>
      body { font-family: sans-serif; }
      .overdue { color: darkred; font-weight: bold; }
      .due-soon { color: darkorange; }
    </style>
    <script src="script.js" defer></script>
  </head>
  <body>
    <h1>My library loans</h1>
    <p id="summary"></p>
    <ul id="loans"></ul>
  </body>
</html>
```

Start `script.js` with this data:

```js
const today = new Date(2026, 8, 24); // pretend today is September 24th, 2026

const loans = [
  { title: "The Hobbit", due: new Date(2026, 8, 30) },
  { title: "Atomic Habits", due: new Date(2026, 8, 20) },
  { title: "Dune", due: new Date(2026, 8, 26) },
  { title: "The Alchemist", due: new Date(2026, 9, 8) },
  { title: "Sapiens", due: new Date(2026, 8, 23) },
];
```

Write a function `renderLoans(items)` that fills in the page:

1. Show the loans sorted by due date, earliest first, without changing the original `loans` array.
2. Each list item shows the title, the due date, and a label in brackets:
   - past the due date: `(4 days overdue)`, and the class `overdue`,
   - due within the next 3 days: `(due in 2 days)`, and the class `due-soon`,
   - otherwise: `(6 days left)`.
3. Use `1 day`, not `1 days`.
4. The summary says how many books are overdue.

The page should show:

```
My library loans
2 of 5 books are overdue.
• Atomic Habits - due Sun, Sep 20 (4 days overdue)
• Sapiens - due Wed, Sep 23 (1 day overdue)
• Dune - due Sat, Sep 26 (due in 2 days)
• The Hobbit - due Wed, Sep 30 (6 days left)
• The Alchemist - due Thu, Oct 8 (14 days left)
```

The two overdue books should be dark red and bold, and "Dune" should be orange.

<details>
<summary>Hint 1</summary>

Look back at `renderMenu` in the notes for the shape of a render function. For the dates, an `Intl.DateTimeFormat` with the `"en-US"` locale and the options `weekday`, `month`, and `day` gives `Sun, Sep 20`.

</details>

<details>
<summary>Hint 2</summary>

Work out the days left the same way as in chapter 19: subtract the dates, divide by the milliseconds in a day, and round. A negative number means overdue.

</details>

<details>
<summary>Hint 3</summary>

A tiny helper like `daysWord(count)` that returns `"1 day"` or `"4 days"` keeps all three labels simple. Count the overdue books with a variable that goes up inside your loop, or with `filter` before the loop.

</details>

---

## Before you move on

Everything on these pages happens once, the moment the page loads. The Borrow button doesn't do anything when you click it, and the playlist can't be sorted by a click.

[Chapter 21: Events](../21-events/notes.md) makes your pages react to clicks, typing, and key presses.
