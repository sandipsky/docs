# 34 Debounce and Throttle: Exercises

**How to do these:**

- Exercises 1 to 4 run in the browser. Make one folder per exercise (`ex1/`, `ex2/`, and so on) with an `index.html` and a `script.js`. Copy the HTML from the exercise, and write the JavaScript yourself.
- Open `index.html` by double-clicking it. Press `F12` and click **Console** to see your logs and any errors. Refresh the page after each change.
- Start each `script.js` with your own `debounce` (and `throttle`, when you need it) from the [notes](notes.md). Type them out again instead of copying: it's great practice.
- Exercise 5 runs in Node: write `ex5.js` and run it with `node ex5.js`.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Library search box

A library website has a search box. Right now it would search on every single keystroke. Make it wait until the reader stops typing.

Use this `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Library Search</title>
  <script src="script.js" defer></script>
</head>
<body>
  <h1>Library search</h1>
  <input id="search" type="search" placeholder="Search for a book...">
  <ul id="results"></ul>
</body>
</html>
```

And start `script.js` with this list:

```js
const books = [
  "Harry Potter and the Philosopher's Stone",
  "The Hobbit",
  "Pride and Prejudice",
  "The Hunger Games",
  "Harry Potter and the Chamber of Secrets",
  "Charlotte's Web",
  "The Great Gatsby",
  "Little Women",
];
```

Your tasks:

1. Keep a `keystrokes` counter that goes up on **every** `input` event.
2. Write `searchBooks(query)`. It logs `Searching for "<query>" (after <n> keystrokes)`, clears the old results, and shows each matching title as an `<li>` in the list. Matching ignores capital letters.
3. Call `searchBooks` through a debounced version with a 400 ms delay. Pass it the trimmed text from the box.

Type `harry` at a normal speed and pause. You should see this in the console, and the two Harry Potter books on the page:

```
Searching for "harry" (after 5 keystrokes)
```

Then type ` potter` (with the space) and pause again:

```
Searching for "harry potter" (after 12 keystrokes)
```

**Rule:** put the titles on the page with `textContent`, not `innerHTML` (remember the warning in [chapter 20](../20-dom-basics/notes.md)).

<details>
<summary>Hint 1</summary>

Create the debounced function **once**, near the top of your file, and call that same function inside the `input` listener. If you create it inside the listener, you'll see one search per keystroke (Common mistake 1 in the notes).

</details>

<details>
<summary>Hint 2</summary>

To find the matches, `filter` the books ([chapter 13](../13-array-methods/notes.md)) and compare lowercase versions of both the title and the query with `includes`.

</details>

**Bonus:** when the box is empty, clear the list, log nothing, and make sure a search from a moment ago can't pop back up (Common mistake 5).

---

## Exercise 2 (Easy): Autosave a draft

You're building a notes app. Nobody likes losing what they typed, so the app should save the note by itself, but only once the user pauses. Saving on every keystroke would be wasteful.

Use this `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Notes</title>
  <script src="script.js" defer></script>
</head>
<body>
  <h1>Quick note</h1>
  <textarea id="draft" rows="8" cols="50" placeholder="Start typing..."></textarea>
  <p id="status">No changes yet</p>
</body>
</html>
```

Your tasks:

1. While the user types, the status shows `Typing...` straight away (no waiting).
2. One second after they stop typing, save the text to `localStorage` under the key `"draft"` ([chapter 23](../23-json-and-local-storage/notes.md)). Then set the status to `All changes saved` and log how many characters you saved.
3. When the page loads, if there's a saved draft, put it back in the textarea and set the status to `Draft restored`.

Type `Dear Sam, see you soon!` and pause. You should see:

```
Saved 23 characters
```

Now refresh the page. Your text is still there, and the status says `Draft restored`.

<details>
<summary>Hint 1</summary>

You only need one `input` listener. Inside it, set the status to `Typing...` (that part isn't debounced), then call your debounced save function.

</details>

<details>
<summary>Hint 2</summary>

`localStorage.getItem("draft")` gives you `null` when nothing has been saved yet. Check for that before you restore anything.

</details>

---

## Exercise 3 (Medium): Reading progress bar

A news site shows a thin bar at the top of long articles. It grows as you scroll, so readers can see how far along they are. Updating it on every single `scroll` event is more work than needed.

Use this `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Reading Progress</title>
  <style>
    body {
      font-family: sans-serif;
      margin: 0;
    }
    #progress {
      position: fixed;
      top: 0;
      left: 0;
      width: 0%;
      height: 6px;
      background: tomato;
    }
    #counter {
      position: fixed;
      right: 10px;
      bottom: 10px;
      padding: 8px 12px;
      background: #eee;
      border-radius: 6px;
    }
    article {
      max-width: 600px;
      height: 5000px; /* a very long page, so there's lots to scroll */
      margin: 40px auto;
      padding: 0 16px;
    }
  </style>
  <script src="script.js" defer></script>
</head>
<body>
  <div id="progress"></div>
  <div id="counter">Scroll events: 0 | Updates: 0</div>
  <article>
    <h1>A very long article</h1>
    <p>Scroll down and watch the bar at the top of the page.</p>
  </article>
</body>
</html>
```

Your tasks:

1. Write `updateProgressBar()`. It works out how far down the page you are and sets the bar's width to match. Here's the math you need:

   ```js
   const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
   const percent = (window.scrollY / maxScroll) * 100;
   ```

   `window.scrollY` is how far down you've scrolled, in pixels. `scrollHeight` is the height of the whole page and `innerHeight` is the height of the visible window, so `maxScroll` is the furthest you can scroll.

2. Throttle it, so it runs at most once every 100 ms, and call the throttled version from a `scroll` listener on `window`.
3. Count two things: every `scroll` event, and every real update. At the end of your scroll listener, show both in the counter box, like `Scroll events: 143 | Updates: 21`.

Scroll up and down for a while. Your numbers will be different, but the updates should be far fewer than the scroll events, and the bar should still feel smooth.

4. Now scroll quickly all the way to the bottom, a few times. Does the bar always reach exactly 100%? With the simple throttle, it sometimes stops a little short. Fix that with the "throttle plus debounce" trick from the notes.

<details>
<summary>Hint 1</summary>

The width needs a unit: set `bar.style.width` to a string like `` `${percent}%` ``.

</details>

<details>
<summary>Hint 2</summary>

For step 4, the bar stops short because the last `scroll` event arrived "too soon" and was ignored. Make a second, debounced version of `updateProgressBar` (150 ms is fine) and call **both** versions from your listener.

</details>

---

## Exercise 4 (Medium): Protect the "Pay" button

An online shop gets angry emails: customers who double-click "Pay" are charged twice. Your job is to make that impossible.

Use this `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Checkout</title>
  <script src="script.js" defer></script>
</head>
<body>
  <h1>Checkout</h1>
  <p>Wireless headphones: $49.99</p>
  <button id="pay">Pay $49.99</button>
  <p id="message"></p>
</body>
</html>
```

**Part 1: leading debounce.**

1. Write `chargeCard()`. It logs `Charging $49.99...` and shows `Payment sent. Thank you!` in the message paragraph. (It's pretend: no real money moves.)
2. Wrap it in a **leading** debounce with a 1000 ms delay.
3. In a `click` listener, log `click` on every click, then call your protected version.

Triple-click the button quickly. You should see:

```
click
Charging $49.99...
click
click
```

The customer got instant feedback, and was only charged once.

**Part 2: once and for all.** Wait two seconds and click again. You'll see a second `Charging $49.99...`. For a "Like" button that's fine, but for a payment it's a real problem.

Replace the leading debounce with the `once` helper from [chapter 25](../25-closures/notes.md) (write it again if you need to), and disable the button as soon as it's clicked. Now, however many times you click, and however long you wait, you should only ever see:

```
click
Charging $49.99...
```

<details>
<summary>Hint 1</summary>

For Part 1, the options object goes in as the third argument: `debounce(chargeCard, 1000, { leading: true })`.

</details>

<details>
<summary>Hint 2</summary>

A disabled button doesn't fire `click` events at all, so after the first click, nothing gets logged. You met the `disabled` property in [chapter 22](../22-forms/notes.md). So why keep `once` as well? Because other code (a keyboard shortcut, a second button) might call `chargeCard` too. `once` is the safety net.

</details>

---

## Exercise 5 (Challenge): Autosave with "Save now" and "Discard"

Back to the notes app, now in Node. The autosave waits for a pause, like before. But users also want two buttons:

- **Save now** (`Ctrl+S`): don't wait, save the waiting text right now.
- **Discard**: throw the waiting save away.

Write a `debounce(fn, delay)` whose returned function has two methods:

- `cancel()`: forget the waiting call.
- `flush()`: if a call is waiting, run it **right now**, with its latest arguments and the same `this`, and stop its countdown so it doesn't run again later. If nothing is waiting, do nothing.

Put your `debounce` at the top of `ex5.js`, then paste this timeline below it. Don't change the timeline:

```js
const notebook = {
  title: "Letter to Sam",
  save(text) {
    console.log(`Saved "${this.title}": ${text}`);
  },
};

notebook.autosave = debounce(notebook.save, 1000);

function at(ms, action) {
  setTimeout(action, ms);
}

at(100, () => notebook.autosave("Dear Sam,"));
at(300, () => notebook.autosave("Dear Sam, thanks"));
// ...a pause, so the autosave runs by itself (at about 1300 ms)
at(2000, () => notebook.autosave("Dear Sam, thanks for the"));
at(2200, () => {
  console.log("Ctrl+S pressed");
  notebook.autosave.flush(); // save right now, don't wait
});
at(3500, () => notebook.autosave("Dear Sam, thanks for the gift!"));
at(3700, () => {
  console.log("Discard clicked");
  notebook.autosave.cancel(); // throw the waiting save away
});
at(5000, () => {
  console.log("Ctrl+S pressed");
  notebook.autosave.flush(); // nothing is waiting, so nothing happens
});
at(5500, () => console.log("Done"));
```

Expected output:

```
Saved "Letter to Sam": Dear Sam, thanks
Ctrl+S pressed
Saved "Letter to Sam": Dear Sam, thanks for the
Discard clicked
Ctrl+S pressed
Done
```

Check your output line by line. Each of these is a different bug:

- A line appears **twice**: `flush()` didn't stop the countdown.
- `thanks for the gift!` gets saved: `cancel()` didn't really forget the waiting call.
- `Saved "undefined"`: `this` got lost somewhere.

<details>
<summary>Hint 1</summary>

`flush()` needs to know three things the debounced function saw last time: the arguments, the `this`, and whether a call is waiting at all. Keep them in variables next to `timerId`, in the closure.

</details>

<details>
<summary>Hint 2</summary>

Write a small inner function that does the real run: it marks "nothing is waiting" and calls `fn` with the saved `this` and arguments. Then both the countdown and `flush()` can use it.

</details>

<details>
<summary>Hint 3</summary>

When you call `notebook.autosave.flush()`, the `this` inside `flush` is **not** `notebook`. That's why you must use the `this` you saved during the last normal call to `notebook.autosave(...)`.

</details>

**Bonus: throttle with a trailing call.** Build a `throttle(fn, interval)` that never loses the last call: when a call is "too soon", remember its arguments and book one final run for later. Test it on the scroll timeline from the notes (five events, 20% to 100%, with a 250 ms interval). The lines in the middle depend on exactly when your booked run happens, but you should see fewer than five lines, and the **last** one must be `Progress bar: 100%`.

---

## Before you move on

In Exercise 1, type `harry`, delete it, and type `harry` again. The same search runs twice. With a real server, that's a wasted request for results you already had.

What if the page could remember the results for each search? [Chapter 35](../35-map-and-set/notes.md) gives you `Map`, a perfect place to keep them.
