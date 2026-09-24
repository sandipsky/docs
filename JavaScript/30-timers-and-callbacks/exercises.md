# 30 Timers and Callbacks: Exercises

**How to do these:**

- Exercises 1 to 4 run in Node. Make a new file for each one in this folder (`ex1.js`, `ex2.js`, and so on) and run it with `node ex1.js`.
- Exercise 5 runs in the browser. Make a folder `ex5` with `index.html` and `script.js` inside, then double-click `index.html` to open it. Press `F12` → **Console** to see any errors, and refresh after each change.
- Timers make you wait, so watch *when* each line appears, not just what it says.
- If a program never stops, press `Ctrl + C` in the terminal.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Tea timer

You're making a cup of tea. It needs to steep for a while (let's pretend 3 seconds is 3 minutes), and you don't want to stand there staring at the mug.

Print the first two lines straight away, and the last one about 3 seconds later.

Expected output:

```
Your tea is steeping...
You have time to read a few pages.
Your tea is ready! Take out the tea bag.
```

**Rule:** in your file, the code for the "ready" message must come *before* the `console.log` for "You have time to read a few pages."

<details>
<summary>Hint</summary>

`setTimeout` takes the function to run first, and the delay in milliseconds second. How many milliseconds are in 3 seconds?

</details>

---

## Exercise 2 (Easy): Countdown to the sale

A flash sale starts in 5 seconds. Print a countdown, one line about every second, then the big announcement.

Expected output:

```
Sale starts in 5...
Sale starts in 4...
Sale starts in 3...
Sale starts in 2...
Sale starts in 1...
The sale is ON! Everything is 50% off.
```

**Rules:**

- Use one `setInterval`, not five separate timers.
- The program must stop on its own. You shouldn't need `Ctrl + C`.

<details>
<summary>Hint 1</summary>

Keep the number of seconds in a `let` variable outside the interval, and count it down by one on every tick.

</details>

<details>
<summary>Hint 2</summary>

`setInterval` gives you back an id. Store it, and pass it to `clearInterval` at the moment the countdown is over.

</details>

---

## Exercise 3 (Medium): Undo send

Your email app waits 5 seconds before it really sends a message, so people can change their mind.

1. Write a function `sendWithUndo(message)` that:
   - prints `Sending "<message>" in 5 seconds...` straight away
   - prints `Sent: "<message>"` about 5 seconds later
   - **returns** the timer id
2. Write a function `undoSend(timerId, message)` that cancels that timer and prints `Undo! "<message>" was not sent.`
3. Send `Lunch at 1?` and `See you tomorrow!` straight away, one after the other. Then, after about 2 seconds, undo the first one.

Expected output:

```
Sending "Lunch at 1?" in 5 seconds...
Sending "See you tomorrow!" in 5 seconds...
Undo! "Lunch at 1?" was not sent.
Sent: "See you tomorrow!"
```

The first two lines appear straight away, the third after about 2 seconds, and the last after about 5 seconds.

<details>
<summary>Hint 1</summary>

Whatever `setTimeout` gives back is the timer id. Your function can `return` it, and you can store it in a variable when you call `sendWithUndo`.

</details>

<details>
<summary>Hint 2</summary>

The undo also has to happen later, not right away. Which timer function runs something once, after a delay?

</details>

---

## Exercise 4 (Medium): Library loans

A library's computer is slow: every loan takes about a second while the librarian checks the shelf. Start with this data:

```js
const books = [
  { id: 1, title: "The Hobbit", available: true },
  { id: 2, title: "Dune", available: false },
  { id: 3, title: "Matilda", available: true },
];
```

1. Write `borrowBook(id, callback)`. After about 1 second, it calls `callback` in the error-first style:
   - no book with that id: an `Error` with the message `No book with id 7` (with the real id)
   - the book isn't available: an `Error` with the message `"Dune" is already on loan` (with the real title)
   - otherwise: set the book's `available` to `false`, then call back with `null` and the book
2. Write a function `showResult(error, book)` that prints `Sorry: <error message>` if there's an error, or `Enjoy "<title>"! Please bring it back in 3 weeks.` if not.
3. Borrow book 1, then book 2, then book 7, then book 1 again. Start each loan only after the one before it has finished.

Expected output (one line about every second):

```
Enjoy "The Hobbit"! Please bring it back in 3 weeks.
Sorry: "Dune" is already on loan
Sorry: No book with id 7
Sorry: "The Hobbit" is already on loan
```

**Rule:** use `find` ([chapter 13](../13-array-methods/notes.md)) to look up the book.

<details>
<summary>Hint 1</summary>

Do all the checking *inside* the `setTimeout` callback, after the wait. That's when the librarian has actually looked at the shelf.

</details>

<details>
<summary>Hint 2</summary>

`find` gives you `undefined` when nothing matches. Check for that first, then check `available`. Don't forget to `return` after calling back with an error.

</details>

<details>
<summary>Hint 3</summary>

"Only after the one before has finished" means the next `borrowBook` call goes *inside* the callback of the previous one. Your callback can call `showResult(error, book)` first, and then start the next loan.

</details>

---

## Exercise 5 (Challenge): Holiday slideshow

A travel blog wants a slideshow of holiday moments that moves on by itself, with buttons to pause and play. This one runs in the browser.

Create `ex5/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Trip Slideshow</title>
  <script src="script.js" defer></script>
</head>
<body>
  <h1>Our trip to the coast</h1>
  <p id="slide"></p>
  <p id="counter"></p>
  <button id="pause">Pause</button>
  <button id="play">Play</button>
</body>
</html>
```

Start `ex5/script.js` with this array:

```js
const slides = [
  "Sunrise over the mountains",
  "Lunch at the harbour",
  "A walk through the old town",
  "Sunset on the beach",
];
```

What you should see:

1. As soon as the page opens: `Sunrise over the mountains` in the first paragraph and `1 / 4` in the second.
2. About every 2 seconds, the next slide and its number (`2 / 4`, `3 / 4`, `4 / 4`). After the last slide, it goes back to the first.
3. **Pause** stops the slideshow on the current slide.
4. **Play** carries on from the current slide.
5. Clicking **Play** while the slideshow is already playing does nothing.

Test step 5 carefully: refresh the page and click **Play** a few times, a second or so apart. If the slides start changing faster, or **Pause** stops working, your code has started more than one interval.

<details>
<summary>Hint 1</summary>

Keep the current position in `let current = 0;`. Write a `showSlide()` function that updates both paragraphs from `current` ([chapter 20](../20-dom-basics/notes.md)), and call it once at the start.

</details>

<details>
<summary>Hint 2</summary>

To wrap around to the first slide, the remainder operator from [chapter 04](../04-operators/notes.md) is your friend: `(current + 1) % slides.length`.

</details>

<details>
<summary>Hint 3</summary>

Store the interval id in a `let` variable outside your functions. When you pause, clear the interval and set that variable back to `null`. Before starting a new interval, check whether one is already running.

</details>

**Bonus:** add **Previous** and **Next** buttons. Should a click on them restart the 2-second wait? Try it both ways and see which feels better.

---

## Before you move on

Look back at your code for Exercise 4. Just four loans in a row, and it already looks like a staircase. Now imagine each step had its own error check, like a real app would need. That's callback hell.

[Chapter 31: Promises](../31-promises/notes.md) turns that staircase into a neat, flat list of steps, with one place to handle every error.
