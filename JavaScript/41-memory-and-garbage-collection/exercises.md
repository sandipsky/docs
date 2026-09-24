# 41 Memory and Garbage Collection: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.js`, `ex2.js`, and so on), and run it with `node ex1.js`.
- Exercise 4 runs in the browser: make a folder `ex4` with `index.html` and `script.js`, open `index.html` by double-clicking it, and press `F12` → **Console** to see the output. Refresh the page after each change.
- Memory numbers are different on every computer, and can change from run to run. When an exercise prints memory, look at the *shape* (up, then down), not the exact numbers.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Final whistle

A sports app shows goals as they happen. Copy this into `ex1.js` and run it:

```js
let goals = 0;

setInterval(() => {
  goals++;
  console.log(`Goal! Total goals: ${goals}`);
}, 500);
```

It never stops (press `Ctrl + C`), so the timer, and everything it uses, lives forever.

Change it so that after the third goal, the timer stops and the app prints `Final whistle!`. The program should then end all by itself.

Expected output:

```
Goal! Total goals: 1
Goal! Total goals: 2
Goal! Total goals: 3
Final whistle!
```

<details>
<summary>Hint 1</summary>

`setInterval` returns an id. Keep it in a variable so you can stop the timer later.

</details>

<details>
<summary>Hint 2</summary>

You can call `clearInterval` from *inside* the interval's own callback, as soon as `goals` reaches 3.

</details>

---

## Exercise 2 (Easy): Weigh your playlist

How much memory does a big playlist take up? Let's measure it.

1. Write a function `heapMB()` that returns `process.memoryUsage().heapUsed` in megabytes, rounded to a whole number.
2. Print the heap size at the start.
3. Make an array called `songs` (use `let`) with 300000 song objects like `{ id: 1, title: "Song 1" }`, and print the heap size again, along with how many songs there are.
4. Let go of the array, call `gc()`, and print the heap size one last time.

Run it with `node --expose-gc ex2.js`. You'll see something like this (your numbers will be different):

```
Start: 4 MB
With 300000 songs: 36 MB
After letting go: 4 MB
```

Then comment out the line where you let go of the array, and run it again. Write a comment explaining why the last number changed.

<details>
<summary>Hint 1</summary>

To turn bytes into megabytes, divide by 1024, then by 1024 again. `Math.round` ([chapter 05](../05-numbers-and-math/notes.md)) tidies it into a whole number.

</details>

<details>
<summary>Hint 2</summary>

"Letting go" means making sure nothing refers to the array anymore. The `songs` variable is the only string holding it. What can you set it to?

</details>

---

## Exercise 3 (Medium): Recently viewed

Online shops show a "Recently viewed" row of products. If that list kept every product a shopper ever looked at, it would only ever grow. Yours will have a limit.

Write a function `createRecentlyViewed(limit)` that returns an object with two methods:

- `view(product)` records that the shopper looked at a product. If the product is already in the list, it moves to the front instead of appearing twice. If the list grows past `limit`, the oldest product is dropped.
- `list()` returns an array of the products, newest first.

Test it with this code:

```js
const recent = createRecentlyViewed(3);
recent.view("Headphones");
recent.view("Keyboard");
recent.view("Mouse");
console.log(recent.list());

recent.view("Keyboard"); // viewed again: moves to the front
console.log(recent.list());

recent.view("Monitor"); // the list is full, so the oldest one goes
console.log(recent.list());
```

Expected output:

```
[ 'Mouse', 'Keyboard', 'Headphones' ]
[ 'Keyboard', 'Mouse', 'Headphones' ]
[ 'Monitor', 'Keyboard', 'Mouse' ]
```

**Rule:** after every call to `view`, the list must hold at most `limit` products.

<details>
<summary>Hint 1</summary>

Keep the products in a variable inside `createRecentlyViewed`, so the two methods share it through a closure ([chapter 25](../25-closures/notes.md)). A Set ([chapter 35](../35-map-and-set/notes.md)) is a good fit: it has no duplicates, and it remembers the order things were added.

</details>

<details>
<summary>Hint 2</summary>

To move a product to the newest spot, delete it and add it again. Deleting something that isn't there is harmless.

</details>

<details>
<summary>Hint 3</summary>

The first value in a Set is the oldest. `values().next().value` gives it to you, just like `keys()` on the Map in the notes. For `list()`, spread the Set into an array, then flip it without changing anything: `toReversed()` ([chapter 10](../10-arrays/notes.md)).

</details>

---

## Exercise 4 (Medium): The chat that won't stop listening

A website has a support chat you can open and close. Customers say that after a while, every key they press shows up several times. Your job: find the leak and fix it.

Make a folder `ex4` with this `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Support Chat</title>
  <script src="script.js" defer></script>
</head>
<body>
  <button id="open-chat">Open chat</button>
  <button id="close-chat">Close chat</button>

  <div id="chat" hidden>
    <p>Hi! How can we help? (Try typing a key.)</p>
  </div>
</body>
</html>
```

And this `script.js`:

```js
const chat = document.querySelector("#chat");
const openButton = document.querySelector("#open-chat");
const closeButton = document.querySelector("#close-chat");

let chatNumber = 0;

function openChat() {
  chatNumber++;
  const thisChat = chatNumber;
  chat.hidden = false;

  document.addEventListener("keydown", (event) => {
    console.log(`Chat ${thisChat} heard: ${event.key}`);
  });
}

function closeChat() {
  chat.hidden = true;
}

openButton.addEventListener("click", openChat);
closeButton.addEventListener("click", closeChat);
```

1. Open the page and the console. Click **Open chat**, **Close chat**, **Open chat**, **Close chat**, **Open chat**, then press the `a` key. You'll see:

   ```
   Chat 1 heard: a
   Chat 2 heard: a
   Chat 3 heard: a
   ```

2. Fix `script.js` with an `AbortController`, so that closing the chat removes its listener. After refreshing, the same clicks and key press should give only:

   ```
   Chat 3 heard: a
   ```

3. Click **Close chat** and press a key. Nothing should appear.

**Bonus:** click **Open chat** twice in a row without closing. Make sure that doesn't add a second listener either.

<details>
<summary>Hint 1</summary>

Every `openChat` adds a new listener to `document`, and nothing ever removes it. Each old listener also keeps its own `thisChat` alive through its closure.

</details>

<details>
<summary>Hint 2</summary>

`openChat` creates the controller, but `closeChat` needs to call `abort()` on it. Where can you keep the controller so both functions can see it?

</details>

<details>
<summary>Hint 3</summary>

Pass `{ signal: controller.signal }` as the third argument of `addEventListener`. For the bonus: if a controller already exists, the chat is already open.

</details>

---

## Exercise 5 (Challenge): Leak detective

A music player app gets slower the longer it runs. You've narrowed it down to this code. Copy it into `ex5.js`:

```js
const playHistory = [];
const coverCache = new Map();

function loadCover(songId) {
  // pretend this downloads a big album cover image
  return { songId, pixels: new Array(20000).fill(0) };
}

function getCover(songId) {
  if (!coverCache.has(songId)) {
    coverCache.set(songId, loadCover(songId));
  }
  return coverCache.get(songId);
}

function drawProgressBar(cover) {
  // pretend this redraws the progress bar next to the cover
}

function playSong(songId) {
  const cover = getCover(songId);
  playHistory.push(`Played song ${songId}`);

  setInterval(() => {
    drawProgressBar(cover); // redraw the progress bar every second
  }, 1000);
}

for (let songId = 1; songId <= 500; songId++) {
  playSong(songId);
}

console.log(`History entries: ${playHistory.length}`);
console.log(`Covers in cache: ${coverCache.size}`);
console.log(`Latest: ${playHistory.at(-1)}`);
```

Run it. It prints this, and then it never ends (press `Ctrl + C`):

```
History entries: 500
Covers in cache: 500
Latest: Played song 500
```

There are three leaks. Fix all of them:

1. `playHistory` keeps every song ever played. Keep only the 10 most recent.
2. `coverCache` keeps every cover ever loaded. Keep at most 20, dropping the oldest.
3. Every song starts a new progress-bar timer, and none of them ever stops. Only the song that's playing needs one.

Then add a function `stopPlayer()` that stops the current timer and prints `Player stopped. Bye!`, and call it at the very end of the file.

Expected output:

```
History entries: 10
Covers in cache: 20
Latest: Played song 500
Player stopped. Bye!
```

And the program should end by itself, straight away.

**Rule:** keep the loop that plays 500 songs and the three `console.log` lines as they are.

**Bonus:** measure the difference. Save a copy of the leaky version too. In both files, add `gc();` followed by a line that prints the heap size in MB, just before the end, and run them with `node --expose-gc`. Your numbers will be different, but the fixed version should use many times less memory. Why do you need `gc()` first for a fair comparison? (Think back to mistake 4 in the notes.)

<details>
<summary>Hint 1</summary>

For the history, `shift()` removes the oldest (first) entry of an array. For the cache, look back at `saveForecast` in the notes.

</details>

<details>
<summary>Hint 2</summary>

Keep the current timer's id in a variable *outside* `playSong`, starting as `null`. What should `playSong` do with the old id before it starts a new timer?

</details>

<details>
<summary>Hint 3</summary>

Look at what each timer's callback uses: `cover`. As long as a timer is alive, its cover can't be collected, even after it's been removed from the cache. That's why fixing the cache alone isn't enough.

</details>

---

## Before you move on

In Exercise 3, and in the caches in this chapter, *you* had to remember to check the size limit every time something was added. What if an object could run your code automatically whenever anyone reads or changes one of its properties?

That's what a **Proxy** does, and it's coming up next in [chapter 42](../42-proxy-and-reflect/notes.md). 🙂
