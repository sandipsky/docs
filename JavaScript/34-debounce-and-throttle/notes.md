# 34 Debounce and Throttle

## What is it?

**Debounce** and **throttle** are two ways to control how often a function runs when something keeps triggering it, very quickly, over and over.

- **Debounce:** wait until the calls stop for a moment, then run once.
- **Throttle:** run at most once every X milliseconds, however often you're called.

Both are small helper functions. You'll build them yourself in this chapter, using closures ([chapter 25](../25-closures/notes.md)) and timers ([chapter 30](../30-timers-and-callbacks/notes.md)).

## Why does it matter?

Some events fire far more often than you need:

- **Typing in a search box.** Type "pizza delivery" and that's 14 `input` events. If each one sends a request to a server, you send 14 requests, and only the last one matters.
- **Scrolling and resizing.** A `scroll` event can fire dozens of times a second. If each one does heavy work, the page stutters.
- **Moving the mouse.** Same story: a flood of `mousemove` events.
- **A nervous double-click on "Pay".** Without protection, the order can go through twice.

Letting all of that through wastes the user's battery and data, makes the page feel slow, and can overload your server. Many APIs also have a **rate limit**: a maximum number of requests you're allowed to send per minute. Go over it and they stop answering.

Debounce and throttle fix this with a few lines of code. That's why you'll find them in almost every real web app.

## Real-world example

| Idea | Everyday version | The rule |
|---|---|---|
| **Debounce** | An elevator door | Every person who walks in restarts the door's countdown. The door only closes once nobody has come in for a few seconds. |
| **Throttle** | A city bus | A bus leaves at most once every 10 minutes, no matter how many people turn up at the stop. |

Debounce is also like a polite friend who waits until you've finished talking before they reply. They don't answer every half-sentence. They wait for the pause, then answer the whole thing.

In code, the people walking in (or turning up at the stop) are the **events**. The door closing (or the bus leaving) is **your function actually running**.

> The name "debounce" comes from electronics. When you press a physical button, the metal contacts bounce and send several quick signals. "Debouncing" treats them as one single press.

## How it works

### The problem, in code

We'll test everything in Node first, because there you control exactly when each call happens. To pretend a user is typing, we schedule calls with `setTimeout` ([chapter 30](../30-timers-and-callbacks/notes.md)), one letter every 100 ms:

```js
function search(text) {
  console.log(`Searching for "${text}"...`);
}

// Pretend someone types "pizza", one letter every 100 ms
const word = "pizza";
for (let i = 1; i <= word.length; i++) {
  setTimeout(() => search(word.slice(0, i)), i * 100);
}
```

You'll see:

```
Searching for "p"...
Searching for "pi"...
Searching for "piz"...
Searching for "pizz"...
Searching for "pizza"...
```

Five searches. With a real server, that's five requests, and the first four are wasted: nobody wanted results for "piz".

### Picture it on a timeline

Here's the same idea drawn out. Each column is 100 ms. `x` means an event happened, and `●` means your function actually ran:

```
Time (ms):  0     300   600   900   1200  1500  1800
            |     |     |     |     |     |     |
Raw events: x x x x x x x x x x . . . . . x x x . . .
Debounced:  . . . . . . . . . . . . ● . . . . . . . ●
Throttled:  ● . . ● . . ● . . ● . . . . . ● . . . . .
```

Both use 300 ms here:

- **Raw events:** a burst of 10 events, a quiet gap, then 3 more. A **burst** is a quick run of events close together.
- **Debounced:** nothing happens during a burst. 300 ms after the *last* event of each burst, the function runs once. Two bursts, two runs.
- **Throttled:** the function runs straight away, then at most once every 300 ms while the events keep coming. It gives you steady updates *during* the burst.

Keep this picture in mind. Everything else in this chapter is about building those two rows.

### Building `debounce`, step 1: reset a timer

Here's the elevator door as a plan:

1. When you're called, start a countdown (a `setTimeout`).
2. If you're called again before it finishes, cancel it (`clearTimeout`) and start a new one.
3. When a countdown finally finishes, run the real function.

`debounce` takes your function and a delay, and gives you back a new, "calmer" version of it:

```js
function debounce(fn, delay) {
  let timerId; // survives between calls, thanks to the closure

  return function () {
    clearTimeout(timerId);           // cancel the countdown from last time
    timerId = setTimeout(fn, delay); // and start a fresh one
  };
}

function search() {
  console.log("Searching...");
}

const debouncedSearch = debounce(search, 300);

// Five quick calls, 100 ms apart
for (let i = 1; i <= 5; i++) {
  setTimeout(() => {
    console.log(`key ${i}`);
    debouncedSearch();
  }, i * 100);
}
```

You'll see:

```
key 1
key 2
key 3
key 4
key 5
Searching...
```

Five calls, one search. Remember closures from [chapter 25](../25-closures/notes.md)? The returned function carries `timerId` in its backpack. Every call sees the *same* `timerId`, so each call can cancel the countdown the previous call started.

Here's what happens to `timerId` over time:

| Time | What happens | Countdown ends at |
|---|---|---|
| 100 ms | Call 1: nothing to cancel, start a 300 ms countdown | 400 ms |
| 200 ms | Call 2: cancel it, start a new one | 500 ms |
| 300 ms | Call 3: cancel, start again | 600 ms |
| 400 ms | Call 4: cancel, start again | 700 ms |
| 500 ms | Call 5: cancel, start again | 800 ms |
| 800 ms | Nobody canceled it this time: `search()` runs | |

The very first time, `timerId` is `undefined`. That's fine: `clearTimeout(undefined)` does nothing.

### Step 2: pass the arguments through

A search needs to know *what* to search for. Right now the arguments get lost, because `setTimeout(fn, delay)` calls `fn` with nothing.

Collect them with a rest parameter (`...args`, [chapter 15](../15-destructuring-spread-rest/notes.md)), then spread them back out when the timer finishes:

```js
function debounce(fn, delay) {
  let timerId;

  return function (...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn(...args), delay);
  };
}

function search(text) {
  console.log(`Searching for "${text}"...`);
}

const debouncedSearch = debounce(search, 300);

// "cat" typed quickly, a pause, then "s"
const keystrokes = [
  { text: "c", at: 100 },
  { text: "ca", at: 200 },
  { text: "cat", at: 300 },
  { text: "cats", at: 1000 },
];

for (const { text, at } of keystrokes) {
  setTimeout(() => {
    console.log(`typed "${text}"`);
    debouncedSearch(text);
  }, at);
}
```

You'll see:

```
typed "c"
typed "ca"
typed "cat"
Searching for "cat"...
typed "cats"
Searching for "cats"...
```

The user paused after "cat", so that search ran. Then they typed "s" and paused again, so "cats" ran too. Notice that the search always uses the **latest** arguments: each call replaces the waiting one.

### Step 3: keep `this`

What if the function you debounce is an object's method and uses `this`? Here's a notepad that counts its saves, using the `debounce` from step 2:

```js
const notepad = {
  saveCount: 0,
  save: debounce(function (text) {
    this.saveCount++;
    console.log(`Save #${this.saveCount}: "${text}"`);
  }, 300),
};

notepad.save("Buy");
notepad.save("Buy milk");
// prints: Save #NaN: "Buy milk"
```

`NaN`? Remember from [chapter 26](../26-this-keyword/notes.md) that `this` depends on *how* a function is called. Our debounce calls `fn(...args)` as a plain function call, so `this` isn't `notepad` any more. In a plain `.js` file, it's `globalThis`, which has no `saveCount`, and `undefined + 1` is `NaN`. (In strict mode, such as in modules and classes, it's worse: `TypeError: Cannot read properties of undefined (reading 'saveCount')`.)

The fix is `apply` from chapter 26. It calls a function with the `this` and the arguments you choose:

```js
function debounce(fn, delay) {
  let timerId;

  return function (...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      fn.apply(this, args); // run fn with the same `this` and arguments
    }, delay);
  };
}
```

Run the notepad again and you'll see `Save #1: "Buy milk"`.

Two details make this work:

- The function we return is a regular `function`, not an arrow. When you call `notepad.save(...)`, it gets `this` = `notepad`.
- The callback inside `setTimeout` *is* an arrow. Arrows don't have their own `this`, so it borrows `this` from the function around it: `notepad` again.

This matters in the browser too. In an event listener, `this` is the element (chapter 26), and with `apply`, your debounced listener keeps it.

### Step 4: leading or trailing?

Our debounce runs at the *end* of a burst. That's called the **trailing edge**. The *start* of a burst is the **leading edge**. (Think of the front and back edges of a wave.)

Sometimes you want the leading edge: act on the first event straight away, then ignore the rest until things calm down.

```
Time (ms):  0     300   600   900   1200
            |     |     |     |     |
Raw events: x x x x . . . . x x . . . .
Trailing:   . . . . . . ● . . . . . ● .
Leading:    ● . . . . . . . ● . . . . .
```

Both rows use a 300 ms delay:

- **Trailing** waits for the quiet, then runs. Great when you want the *final* value (search text, a draft to save).
- **Leading** runs instantly on the first event, then ignores the others until there's been 300 ms of quiet. Great for buttons: the user gets instant feedback, and double-clicks don't count twice.

Here's `debounce` with a `leading` option. It uses the options-object pattern from [chapter 15](../15-destructuring-spread-rest/notes.md), so `debounce(fn, 500)` still works like before:

```js
function debounce(fn, delay, { leading = false } = {}) {
  let timerId;

  return function (...args) {
    const wasQuiet = timerId === undefined; // no countdown running?
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      timerId = undefined;                  // calm again: reset
      if (!leading) fn.apply(this, args);   // trailing: run at the end
    }, delay);
    if (leading && wasQuiet) fn.apply(this, args); // leading: run at the start
  };
}
```

What changed:

- When a countdown finishes, `timerId` goes back to `undefined`. So `timerId === undefined` now means "it's been quiet".
- In leading mode, a call that arrives while it's quiet runs straight away. Calls during a burst only restart the countdown, so they're ignored.
- In trailing mode (the default), nothing changed: the function runs when the countdown finishes.

Let's protect an "Add to cart" button from double-clicks:

```js
function addToCart(item) {
  console.log(`Added ${item} to the cart`);
}

const safeAddToCart = debounce(addToCart, 500, { leading: true });

// A double-click, then one more click 2 seconds later
for (const at of [100, 200, 2000]) {
  setTimeout(() => {
    console.log("click");
    safeAddToCart("headphones");
  }, at);
}
```

You'll see:

```
click
Added headphones to the cart
click
click
Added headphones to the cart
```

The first click works instantly. The second click, 100 ms later, is ignored. The click 2 seconds later is a new burst, so it counts.

### Step 5: cancel a waiting call

Sometimes a waiting call should never happen. The user typed "pizza" and then cleared the search box, or closed the panel. You don't want a search to pop up 300 ms later.

Functions are objects in JavaScript, so you can attach a method to one. Let's give the debounced function a `cancel()` method:

```js
function debounce(fn, delay) {
  let timerId;

  function debounced(...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn.apply(this, args), delay);
  }

  debounced.cancel = () => {
    clearTimeout(timerId); // throw away the waiting call
  };

  return debounced;
}

function search(text) {
  console.log(`Searching for "${text}"...`);
}

const debouncedSearch = debounce(search, 300);

debouncedSearch("pizza");
console.log("The user cleared the search box");
debouncedSearch.cancel(); // no search for "pizza" will run
// prints: The user cleared the search box
```

That's the only line you'll see. The search never runs.

### Your complete `debounce`

Here's everything together: arguments, `this`, the `leading` option, and `cancel()`. This is the version to reuse in your exercises (and in the weather app in [chapter 39](../39-project-weather-app/notes.md)):

```js
function debounce(fn, delay, { leading = false } = {}) {
  let timerId;

  function debounced(...args) {
    const wasQuiet = timerId === undefined; // no countdown running?
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      timerId = undefined;                  // calm again: reset
      if (!leading) fn.apply(this, args);   // trailing: run at the end
    }, delay);
    if (leading && wasQuiet) fn.apply(this, args); // leading: run at the start
  }

  debounced.cancel = () => {
    clearTimeout(timerId);
    timerId = undefined;
  };

  return debounced;
}
```

Use it like this:

- `debounce(search, 300)`: run once, 300 ms after the calls stop.
- `debounce(addToCart, 500, { leading: true })`: run on the first call, ignore the rest until 500 ms of quiet.
- `debouncedSearch.cancel()`: forget about any waiting call.

### Building `throttle`

Now the bus. Throttle doesn't wait for quiet. It remembers *when* the function last ran, and only lets a call through once enough time has passed.

The simplest version uses a **timestamp**: a moment in time, stored as a number of milliseconds. `Date.now()` gives you the current one ([chapter 19](../19-dates-and-times/notes.md)).

```js
function throttle(fn, interval) {
  let lastRun = 0; // when fn last ran (a timestamp in ms)

  return function (...args) {
    const now = Date.now();
    if (now - lastRun >= interval) {
      lastRun = now;
      fn.apply(this, args);
    }
    // otherwise: too soon, ignore this call
  };
}
```

Starting `lastRun` at `0` means the first call always runs. `Date.now()` counts the milliseconds since 1970, a huge number, so `now - 0` is always bigger than the interval.

Let's pretend the user scrolls for one second:

```js
function updateProgressBar(eventNumber) {
  console.log(`Updating the progress bar (scroll event ${eventNumber})`);
}

const throttledUpdate = throttle(updateProgressBar, 250);

// Pretend the user scrolls for 1 second: 10 scroll events, 100 ms apart
for (let i = 1; i <= 10; i++) {
  setTimeout(() => throttledUpdate(i), i * 100);
}
```

You'll see:

```
Updating the progress bar (scroll event 1)
Updating the progress bar (scroll event 4)
Updating the progress bar (scroll event 7)
Updating the progress bar (scroll event 10)
```

Ten events, four updates, evenly spread out. Here's how the first few calls are decided:

| Event | Time | Time since the last run | Runs? |
|---|---|---|---|
| 1 | 100 ms | never ran before | yes |
| 2 | 200 ms | 100 ms | no, too soon |
| 3 | 300 ms | 200 ms | no, too soon |
| 4 | 400 ms | 300 ms | yes (300 is at least 250) |
| 5 | 500 ms | 100 ms | no, too soon |

Notice that event 4 runs at 400 ms, not at 350 ms. This throttle can only run when an event arrives. It never runs "on its own".

### Watch out: the last event can get lost

The simple throttle has one weakness. Say the user scrolls quickly to the very bottom of the page:

```js
function showPosition(percent) {
  console.log(`Progress bar: ${percent}%`);
}

const throttledShow = throttle(showPosition, 250);

// The user scrolls all the way down: 20%, 40%, ... 100%
for (let i = 1; i <= 5; i++) {
  setTimeout(() => throttledShow(i * 20), i * 100);
}
```

You'll see:

```
Progress bar: 20%
Progress bar: 80%
```

The user is at the bottom, but the bar is stuck at 80%. The 100% event arrived "too soon" after the last run, so it was ignored, and no more events came to fix it.

The full fix is a throttle with a **trailing call**: when a call is ignored, it books one final run for the end of the interval. Library versions (you'll meet one soon) do this for you.

A quick fix you can build right now: pair the throttle with a debounce. The throttle gives steady updates while scrolling. The debounce makes one last update when scrolling stops:

```js
const throttledShow = throttle(showPosition, 250);
const finalShow = debounce(showPosition, 150);

function onScroll(percent) {
  throttledShow(percent); // steady updates while scrolling
  finalShow(percent);     // one last update when scrolling stops
}
```

Call `onScroll` instead, with the same five events, and you'll see:

```
Progress bar: 20%
Progress bar: 80%
Progress bar: 100%
```

### Debounce or throttle: which one do I need?

Side by side:

| | Debounce | Throttle |
|---|---|---|
| **The rule** | Wait for a pause, then run once | Run at most once per interval |
| **During a long burst** | Doesn't run at all | Runs regularly |
| **When the burst ends** | Runs once, with the latest arguments | Nothing more (in the simple version) |
| **Everyday version** | Elevator door | City bus |
| **Built with** | `setTimeout` and `clearTimeout` | A timestamp (`Date.now()`) |

Ask yourself three questions:

1. **Do I only care about the final value, after the user stops?** Use **debounce**.
2. **Do I need regular updates while it's still happening?** Use **throttle**.
3. **Must the first action happen instantly?** Use the **leading** edge. And if it must never, ever happen twice (like a payment), use `once` from [chapter 25](../25-closures/notes.md).

Common situations:

| Situation | Use | A good starting delay |
|---|---|---|
| Search suggestions as you type | Debounce | 300 ms |
| Autosave a draft | Debounce | 1000 ms |
| "Is this username taken?" check | Debounce | 500 ms |
| Redraw a chart after the window is resized | Debounce | 200 ms |
| Progress bar or "back to top" button while scrolling | Throttle | 100 ms |
| Follow the mouse (a tooltip, a drawing app) | Throttle | 50 ms |
| A game's fire button held down | Throttle | the gun's fire rate, e.g. 250 ms |
| "Add to cart" or "Like" button | Leading debounce | 500 ms |
| "Pay" button | Leading debounce, or `once` if it must never run twice | 1000 ms |

The delays are starting points, not rules. Try them, and adjust until the page feels right. Too short and you save little work. Too long and the page feels slow to react.

### Using them with real events

In the browser, you wrap the work you want to calm down, and call the wrapped version from your event listener ([chapter 21](../21-events/notes.md)):

```js
const searchBox = document.querySelector("#search");
const debouncedSearch = debounce(search, 300);

searchBox.addEventListener("input", () => {
  debouncedSearch(searchBox.value.trim());
});

const throttledUpdate = throttle(updateProgressBar, 100);
window.addEventListener("scroll", throttledUpdate);
```

The `input` and `scroll` events still fire just as often. Only the expensive work behind them is calmed down.

Because the debounced function keeps `this`, you can also pass a regular function straight in. `this` is then the element that fired the event:

```js
searchBox.addEventListener("input", debounce(function () {
  console.log(`Searching for "${this.value}"...`); // `this` is the search box
}, 300));
```

### Debounced search without stale results

Debounce cuts down *how many* requests you send. But it can't control the order the answers come back in. Servers don't always answer in order: a request can be slow because of the network, or because the server had more work to do.

That can cause a **race condition**: two things racing each other, where the result depends on which one finishes first. Here, the old search finishes last and "wins", so the page shows a **stale** result: an answer that's out of date by the time it arrives.

Let's see it happen, with a pretend server where short words are slow and longer words are fast:

```js
// A pretend search server: short words are slow, longer words are fast
function fakeSearch(query) {
  return new Promise((resolve) => {
    const time = query.length <= 3 ? 1000 : 200;
    setTimeout(() => resolve(`results for "${query}"`), time);
  });
}

async function showResults(query) {
  const results = await fakeSearch(query);
  console.log(`Showing ${results}`);
}

const debouncedShow = debounce(showResults, 300);

setTimeout(() => debouncedShow("cat"), 100);  // search starts at ~400 ms, answer at ~1400 ms
setTimeout(() => debouncedShow("cats"), 700); // search starts at ~1000 ms, answer at ~1200 ms
```

You'll see:

```
Showing results for "cats"
Showing results for "cat"
```

The search box says "cats", but the page ends up showing results for "cat". The old, slow answer arrived last and overwrote the right one.

The fix is `AbortController` from [chapter 33](../33-fetch-and-apis/notes.md). Before starting a new search, abort the previous one. An aborted request never delivers its old answer.

First, the pretend server has to listen for "abort", the way `fetch` does. When you call `controller.abort()`, the signal fires an `abort` event:

```js
function fakeSearch(query, signal) {
  return new Promise((resolve, reject) => {
    const time = query.length <= 3 ? 1000 : 200;
    const timerId = setTimeout(() => resolve(`results for "${query}"`), time);

    signal.addEventListener("abort", () => {
      clearTimeout(timerId);
      reject(signal.reason); // the same kind of error fetch gives you
    });
  });
}
```

Now the search keeps one controller for the search in progress:

```js
let controller; // controls the search that's in progress

async function showResults(query) {
  controller?.abort();                // cancel the previous search, if any
  controller = new AbortController(); // a fresh controller for this search

  try {
    const results = await fakeSearch(query, controller.signal);
    console.log(`Showing ${results}`);
  } catch (error) {
    if (error.name === "AbortError") {
      console.log(`Canceled the old search for "${query}"`);
      return;
    }
    throw error; // a real problem: don't hide it
  }
}
```

With the same two calls as before, you'll see:

```
Canceled the old search for "cat"
Showing results for "cats"
```

A few things to notice:

- The first time, `controller` is `undefined`, so `controller?.abort()` does nothing (optional chaining, [chapter 11](../11-objects/notes.md)).
- An aborted request rejects with an error named `"AbortError"`. That's expected, not a real problem, so we quietly skip it. Any other error is re-thrown, so real problems still show up ([chapter 18](../18-error-handling/notes.md)).
- Aborting a request that has already finished does nothing, so it's always safe to call.

With real `fetch`, you pass the signal as an option: `fetch(url, { signal: controller.signal })`. An aborted `fetch` also rejects with an `"AbortError"`, so the same `catch` works. You'll use exactly this pattern for city suggestions in the weather app ([chapter 39](../39-project-weather-app/notes.md)).

### `requestAnimationFrame`: a throttle made for the screen

The browser redraws the page in **frames**, usually about 60 times a second (some screens do 120 or more). Updating something on screen more often than that is wasted work: nobody can see it.

`requestAnimationFrame(callback)` asks the browser to run your function right before it draws the next frame. That makes it a natural throttle for visual updates:

```js
let isScheduled = false;

window.addEventListener("scroll", () => {
  if (isScheduled) return; // an update is already booked for the next frame
  isScheduled = true;
  requestAnimationFrame(() => {
    updateProgressBar();
    isScheduled = false;
  });
});
```

However many `scroll` events arrive, the bar updates at most once per frame, and always in time for the screen. Use it for things that move or change on screen. For network requests or saving, stick with debounce and throttle. `requestAnimationFrame` is browser-only: Node doesn't have it. ([Chapter 40](../40-event-loop/notes.md) shows where it fits in the event loop.)

### Ready-made versions

Now that you know how they work, you don't always have to write them yourself. **Lodash**, a popular library of helper functions, has both: `_.debounce(fn, 300)` and `_.throttle(fn, 100)`. You'll learn to install libraries with npm in [chapter 50](../50-tooling/notes.md).

They work like yours, with a few extras:

- Both accept `{ leading, trailing }` options.
- Lodash's `throttle` includes the trailing call by default, so the last event is never lost.
- The functions they return have `cancel()` and `flush()` (run the waiting call right now).
- `debounce` also has a `maxWait` option: "wait for quiet, but never longer than this".

Because you built your own, those options won't feel like magic. They're the same closure and timer ideas with more switches.

## Common mistakes

**1. Creating a new debounced function on every event**

```js
searchBox.addEventListener("input", () => {
  const debouncedSearch = debounce(search, 300); // a brand-new one every time!
  debouncedSearch(searchBox.value);
});
// every keystroke still runs a search (just 300 ms late)
```

Each call to `debounce` makes a new function with its own, fresh `timerId`. There's never an old countdown to cancel, so nothing gets calmed down. Fix: create the debounced function **once**, outside the listener, and call that same one every time:

```js
const debouncedSearch = debounce(search, 300);

searchBox.addEventListener("input", () => {
  debouncedSearch(searchBox.value);
});
```

**2. Calling the function instead of passing it**

```js
const debouncedSearch = debounce(search(), 300);
debouncedSearch();
// prints: Searching...   (straight away, not debounced)
// then 300 ms later: TypeError: Cannot read properties of undefined (reading 'apply')
```

`search()` with brackets runs `search` right now and passes its result (`undefined`) to `debounce`. Pass the function itself, without brackets: `debounce(search, 300)`.

**3. Expecting a return value**

```js
function findPrice(product) {
  return product === "tea" ? 3.5 : 0;
}

const debouncedFind = debounce(findPrice, 300);
const price = debouncedFind("tea");
console.log(price); // prints: undefined
```

When `debouncedFind` returns, the real function hasn't even run yet. It runs 300 ms later, and nobody is waiting for its answer. Fix: do the work *inside* the debounced function, like updating the page there: `debounce((product) => showPrice(findPrice(product)), 300)`.

**4. Picking the wrong one**

```js
const debouncedShow = debounce(showPosition, 150);

// Scrolling for 1 second: 10%, 20%, ... 100%
for (let i = 1; i <= 10; i++) {
  setTimeout(() => debouncedShow(i * 10), i * 100);
}
// prints: Progress bar: 100%   (only once, after scrolling stops)
```

A debounced progress bar freezes while the user scrolls, then jumps at the end. The opposite mistake hurts too: a throttled search box sends searches for half-typed words. Go back to the three questions: final value only → debounce; steady updates → throttle.

**5. Forgetting the waiting call when the user clears the box**

```js
searchBox.addEventListener("input", () => {
  const text = searchBox.value.trim();
  if (text === "") {
    clearResults();
    return; // but a search from a moment ago is still waiting...
  }
  debouncedSearch(text);
});
```

Type "piz", then quickly delete it. The list clears, and then, a moment later, the results for "piz" pop back up. Fix: call `debouncedSearch.cancel()` before `clearResults()`. If a request is already on its way, abort it too (`controller?.abort()`).

## Quick recap

- **Debounce** waits until the calls stop for `delay` ms, then runs once with the latest arguments. Use it when only the final value matters: search, autosave, validation.
- **Throttle** runs at most once every `interval` ms. Use it for steady updates while something keeps happening: scroll, resize, mouse moves, a game's fire rate.
- Both are a closure plus timers: `debounce` remembers a `timerId`, `throttle` remembers when it last ran. `...args` and `fn.apply(this, args)` pass everything through.
- **Trailing** edge = run at the end of a burst. **Leading** edge = run at the start, for instant feedback on buttons. For payments, use `once`.
- Create the debounced function **once**, outside your listener. Give it a `cancel()` for calls that should never happen.
- Debounce reduces requests, but `AbortController` is what stops a slow old answer from overwriting a newer one.
- `requestAnimationFrame` is a built-in throttle for on-screen updates, and libraries like lodash have ready-made versions of both.

---

**Next:** try the [exercises](exercises.md), then move on to [35 Map and Set](../35-map-and-set/notes.md).
