# 48 Performance

## What is it?

**Performance** is how quickly your program does its work, and how smooth it feels to the people using it.

Making code faster is called **optimization**. This chapter shows you how to do it the smart way: find the slow part first, then fix just that part.

## Why does it matter?

People notice slow software. A page that takes ages to load, a button that freezes for a second, a list that stutters when you scroll: users get annoyed and leave.

Your computer is probably faster than your users' devices, too. Code that feels instant on your laptop can crawl on a cheap phone.

But here's the surprising part: most of your code is already fast enough. Usually, one small part of a program causes most of the slowness. Speeding up everything else is wasted effort, and it often makes the code harder to read.

Changing code to make it faster before you know it's slow is called **premature optimization**. The computer scientist Donald Knuth famously called it "the root of all evil". So the golden rule of this chapter is: **measure first, then optimize**.

## Real-world example

A supermarket keeps getting complaints: the checkout is too slow. The manager can guess what's wrong, or measure it.

| At the supermarket | In your code |
|---|---|
| Customers complain that checkout is slow | Users say your app feels slow |
| The manager guesses, and hires faster cashiers. Nothing changes. | You rewrite code you *think* is slow. Nothing changes. |
| The manager times each step with a stopwatch: scanning takes 20 seconds, but the card reader takes 2 minutes | You time your code with `console.time` or `performance.now()` |
| The card reader is the **bottleneck**: the slowest step, which holds everything else up | One slow loop, function, or request holds up the whole app |
| They replace the card reader, then time the checkout again | You fix the slow part, then measure again to check it helped |

The word "bottleneck" comes from the neck of a bottle. However big the bottle is, the water can only pour out as fast as the narrow neck allows. Making the rest of the bottle bigger doesn't help.

## How it works

### Step 1: Measure first

Remember `console.time` and `console.timeEnd` from [chapter 47](../47-debugging/notes.md)? They're the quickest way to time a piece of code. Give both the same label:

```js
console.time("adding up");

let total = 0;
for (let i = 1; i <= 10_000_000; i++) {
  total += i;
}

console.timeEnd("adding up");
// prints something like: adding up: 12.467ms
```

`10_000_000` is the same number as `10000000`. JavaScript ignores the underscores. They're only there to make big numbers easier to read, like the commas in 10,000,000.

When you want the time as a number (to compare two runs, or to show it on a page), use `performance.now()`. It gives you the current time in milliseconds, with decimals, counted from when your page or program started. Read it before and after, and subtract:

```js
const start = performance.now();

let total = 0;
for (let i = 1; i <= 10_000_000; i++) {
  total += i;
}

const ms = performance.now() - start;
console.log(`Adding up took ${ms.toFixed(1)} ms`);
// prints something like: Adding up took 8.6 ms
```

`performance.now()` works the same in the browser and in Node. Why not `Date.now()` from [chapter 19](../19-dates-and-times/notes.md)? It only counts whole milliseconds, and it follows the computer's clock, which can jump when the clock gets adjusted. `performance.now()` is more precise and only ever moves forward.

> **Watch out:** every timing in this chapter is "roughly". Your numbers will be different from mine, and they'll change a little every time you run the code. What matters is the *comparison*: is A much faster than B?

### Measuring fairly

A **benchmark** is a test that times some code, so you can compare it with something else. Benchmarks are easy to get wrong. Watch what happens when you time the same function five times in a row:

```js
function addUp(count) {
  let total = 0;
  for (let i = 1; i <= count; i++) {
    total += i;
  }
  return total;
}

for (let run = 1; run <= 5; run++) {
  const start = performance.now();
  addUp(1_000_000);
  console.log(`Run ${run}: ${(performance.now() - start).toFixed(2)} ms`);
}
```

You'll see something like this (your numbers will be different):

```
Run 1: 7.52 ms
Run 2: 2.75 ms
Run 3: 2.32 ms
Run 4: 0.78 ms
Run 5: 0.79 ms
```

The first run is usually the slowest. The JavaScript engine is still getting to know your code: once it notices a function running a lot, it optimizes it. This is called **warm-up**. So for a fair benchmark:

- **Run it several times**, and don't trust the first run on its own.
- **Use realistic amounts of data.** With 10 items, everything is fast. Test with as much data as your real users will have.
- **Time only the part you care about.** Keep `console.log` out of the timed part, because printing is slow.
- **Compare on the same machine**, and remember your users' devices may be slower than yours.

### The browser's tools: Performance tab and Lighthouse

For web pages, Chrome and Edge have two tools built into DevTools (`F12`). The tabs and buttons move around a little between browser versions, but the ideas stay the same.

**The Performance tab** records everything the browser does. Click the record button (a circle), do the slow thing on your page (click the button, scroll the list), then click **Stop**. You get a timeline. Wide blocks are where the time went, and long tasks are marked in red. Click a block to see which of your functions it was.

**Lighthouse** checks a whole page for you. In the **Lighthouse** tab, click **Analyze page load**. After a short wait, you get a score out of 100 and a list of suggestions, like "properly size images" or "reduce unused JavaScript".

> **Tip:** Run Lighthouse in a private window (Incognito in Chrome, InPrivate in Edge). Browser extensions run code on every page, and they can spoil your results.

### Big O: how the work grows

Timing tells you how fast your code is *today*, with *today's* data. But data grows. Your app has 100 users this month and 100,000 next year. Will it still be fast?

**Big O** is a way of describing how the amount of work grows as the data grows. It doesn't give you seconds. It gives you the *shape* of the growth. The letter **n** stands for the size of the data: the number of items in an array, songs in a playlist, users in a list.

Here are the four shapes you'll meet most often.

**O(1), "constant time":** the work stays the same, however much data there is. It's like opening locker number 3 at the gym. You walk straight to it, whether the gym has 50 lockers or 5,000.

```js
const lockers = ["towel", "shoes", "water bottle", "gym bag"];
console.log(lockers[2]); // prints: water bottle
```

Reading an array item by its index, `push`, `pop`, `set.has()`, and `map.get()` are all O(1).

**O(n), "linear time":** the work grows in step with the data. It's like looking for lost keys in a cinema by checking every seat. Twice as many seats, twice the work.

A loop over the array is O(n). So are `includes`, `indexOf`, `find`, `filter`, `map`, and `reduce`, because they all loop over the array behind the scenes.

**O(n²), "quadratic time":** for every item, you look at every other item. It's like a party where everyone shakes hands with everyone else. 10 people make 45 handshakes. 100 people make 4,950. Ten times the people, about a hundred times the handshakes.

```js
function hasDuplicateName(guests) {
  for (let i = 0; i < guests.length; i++) {
    for (let j = i + 1; j < guests.length; j++) { // a loop inside a loop
      if (guests[i] === guests[j]) {
        return true;
      }
    }
  }
  return false;
}

console.log(hasDuplicateName(["Mia", "Leo", "Ava", "Leo"])); // prints: true
```

A loop inside a loop over the same data is the classic sign of O(n²).

**O(log n), "logarithmic time":** every step throws away half of what's left. Think of the guessing game "I'm thinking of a number from 1 to 100", where the only answers are "too high" and "too low". The smart move is to always guess the middle:

| Your guess | Answer | Numbers still possible |
|---|---|---|
| 50 | Too high | 1 to 49 |
| 25 | Too low | 26 to 49 |
| 37 | Correct! | |

You never need more than 7 guesses for 1 to 100, and never more than 20 for 1 to 1,000,000. Looking up a name in a paper phone book works the same way: open it in the middle, pick the right half, repeat. The catch is that the data must be **sorted**. This way of searching is called **binary search**, and you'll write one in the exercises.

Here's how many steps each shape takes as the data grows:

| n (data size) | O(1) | O(log n) | O(n) | O(n²) |
|---|---|---|---|---|
| 10 | 1 | about 3 | 10 | 100 |
| 1,000 | 1 | about 10 | 1,000 | 1,000,000 |
| 1,000,000 | 1 | about 20 | 1,000,000 | 1,000,000,000,000 |

Look at the bottom-right corner: a million million steps. That's the difference between an app that works and one that freezes.

Big O skips small details. The party makes about *half* of n² handshakes, but it's still called O(n²), because what matters is the shape: double the guests, and you get about four times the handshakes.

> **Watch out for hidden loops.** `includes`, `indexOf`, `find`, and `filter` look like one small step, but each one is a loop. Put one inside another loop and you've written a loop inside a loop: O(n²).

### Pick the right tool for lookups: Set and Map

Picking the right way to store your data is often the biggest speed-up of all. Here's a real example: a concert with 100,000 valid ticket codes. At the gate, 10,000 fans scan their tickets, and each code gets checked.

You could check with `array.includes`, or with a Set from [chapter 35](../35-map-and-set/notes.md). Let's measure both:

```js
// 100,000 valid ticket codes: "T0", "T1", ... "T99999"
const validTickets = [];
for (let i = 0; i < 100_000; i++) {
  validTickets.push(`T${i}`);
}
const validTicketSet = new Set(validTickets);

// 10,000 fans scan their tickets at the gate
const scanned = [];
for (let i = 0; i < 10_000; i++) {
  scanned.push(`T${i * 10}`);
}

function countValid(isValid) {
  let valid = 0;
  for (const code of scanned) {
    if (isValid(code)) valid++;
  }
  return valid;
}

console.time("array.includes");
countValid((code) => validTickets.includes(code));
console.timeEnd("array.includes");

console.time("set.has");
countValid((code) => validTicketSet.has(code));
console.timeEnd("set.has");
```

You'll see something like this (your numbers will be different):

```
array.includes: 1.157s
set.has: 2.429ms
```

When a timing goes over 1,000 ms, Node switches to seconds, so `1.157s` means more than a second. The Set was hundreds of times faster.

Why? `includes` walks along the array, comparing one code after another: O(n) for every single fan. A Set is organized so it can jump straight to the right spot, a bit like the numbered lockers: O(1). Maps work the same way for looking things up by a key.

| You want to... | With an array | With a Set or Map |
|---|---|---|
| Check "is this in here?" | `array.includes(x)`: O(n) | `set.has(x)`: O(1) |
| Get the item with a certain id | `array.find(...)`: O(n) | `map.get(id)`: O(1) |

Two honest notes:

- **For a handful of items, it doesn't matter.** Checking a T-shirt size against `["S", "M", "L", "XL"]` is instant either way, so use whatever reads best.
- **Building a Set takes time too**, because it has to look at every item once. It pays off when you check many times, like 10,000 fans at the gate.

### Don't do the same work twice

**Move work out of loops.** A teacher wants the scores that are above the class average:

```js
const scores = [72, 88, 95, 60, 81];

// Slow: works out the average again for every single score
const slow = scores.filter(
  (score) => score > scores.reduce((sum, s) => sum + s, 0) / scores.length
);

// Fast: works out the average once, before filtering
const average = scores.reduce((sum, s) => sum + s, 0) / scores.length;
const fast = scores.filter((score) => score > average);

console.log(slow); // prints: [ 88, 95, 81 ]
console.log(fast); // prints: [ 88, 95, 81 ]
```

Both give the right answer. But in the slow version, the average never changes, yet `reduce` works it out again for every score. That's a hidden loop inside a loop: O(n²). With 20,000 scores, the slow version took about 1.5 seconds on my machine, and the fast one about 1 ms.

**Build a lookup once.** A shop wants to print each order with the customer's name:

```js
const customers = [
  { id: 1, name: "Asha" },
  { id: 2, name: "Ben" },
  { id: 3, name: "Chen" },
];
const orders = [
  { id: 101, customerId: 2 },
  { id: 102, customerId: 3 },
  { id: 103, customerId: 2 },
];

// Slow: find searches the customer list again for every order
for (const order of orders) {
  const customer = customers.find((c) => c.id === order.customerId);
  console.log(`Order ${order.id}: ${customer.name}`);
}
```

`find` is a hidden loop, so this is O(orders × customers). Instead, build a Map from id to customer once, then look each customer up in O(1):

```js
// Fast: build a Map once...
const customersById = new Map();
for (const customer of customers) {
  customersById.set(customer.id, customer);
}

// ...then every lookup is O(1)
for (const order of orders) {
  const customer = customersById.get(order.customerId);
  console.log(`Order ${order.id}: ${customer.name}`);
}
```

Both versions print the same three lines, starting with `Order 101: Ben`. But with 20,000 customers and 50,000 orders, the `find` version took roughly a second on my machine, and the Map version about 8 ms.

Keeping a result you've worked out, so you don't have to work it out again, is called **caching**. The Map above is a cache. The next idea takes caching one step further.

### Memoization: remember your results

In [chapter 43](../43-functional-programming/notes.md), you met **memoization**: a function keeps a cache of its answers, so when it's asked the same question again, it answers straight from the cache.

Here's where it really shines. A fitness app wants to know how many different ways you can climb a staircase if you take either 1 or 2 steps at a time. Your last move onto step 4 came either from step 3 (a small step) or from step 2 (a big step). So the ways to reach step 4 are the ways to reach step 3 plus the ways to reach step 2. That's a job for recursion ([chapter 17](../17-recursion/notes.md)):

```js
function countWays(steps) {
  if (steps <= 1) {
    return 1; // 0 or 1 steps left: only one way
  }
  return countWays(steps - 1) + countWays(steps - 2);
}

console.log(countWays(4));  // prints: 5
console.log(countWays(35)); // prints: 14930352
```

It works, but it does a huge amount of work. When I counted, `countWays(35)` made the function run 29,860,703 times, which took about 110 ms. And it gets worse fast: `countWays(45)` took over 15 seconds on my machine.

Why so many? The same questions get asked over and over: `countWays(33)` gets worked out twice, `countWays(32)` three times, `countWays(31)` five times, and it gets worse all the way down.

Now let's remember each answer in a Map:

```js
const waysCache = new Map();

function countWaysFast(steps) {
  if (steps <= 1) {
    return 1;
  }
  if (waysCache.has(steps)) {
    return waysCache.get(steps); // asked before: reuse the answer
  }
  const ways = countWaysFast(steps - 1) + countWaysFast(steps - 2);
  waysCache.set(steps, ways);
  return ways;
}

console.log(countWaysFast(35)); // prints: 14930352
```

Same answer, but the function ran just 69 times, and took well under a millisecond. Even `countWaysFast(45)` answers in under a millisecond. And ask for `countWaysFast(35)` again, and it answers in one step, straight from the cache.

Memoization has two rules: only memoize **pure** functions (same input, same output, every time), and don't let the cache grow forever. Common mistakes 4 and 5 below show what goes wrong otherwise.

### Do it less often: debounce, throttle, and `requestAnimationFrame`

Some events fire far too often: `input` on every keystroke, `scroll` dozens of times a second. You already have the tools for this from [chapter 34](../34-debounce-and-throttle/notes.md):

- **Debounce** waits until things calm down, then runs once. With `debounce(searchProducts, 300)`, typing "lamp" quickly runs one search, not four. Use it for search boxes, autosave, and form checks.
- **Throttle** runs at most once every so many milliseconds. Use it for scroll, resize, and mouse movement.

For changes you can *see* on the page, the browser has a helper of its own. `requestAnimationFrame(callback)` asks the browser to run your function just before it draws the next **frame**, which is one fresh picture of the page on the screen. Most screens draw about 60 frames a second (some draw more). Updating the page more often than that is wasted work, because nobody can see it.

```js
let updateScheduled = false;

window.addEventListener("scroll", () => {
  if (updateScheduled) {
    return; // an update is already booked for the next frame
  }
  updateScheduled = true;
  requestAnimationFrame(() => {
    updateProgressBar(); // your own function that sets the bar's width
    updateScheduled = false;
  });
});
```

However many scroll events fire, the progress bar updates at most once per frame.

### Faster pages: go easy on the DOM

When you change the page, the browser has work to do before it can show the new version:

1. **Style:** work out which CSS rules apply to each element.
2. **Layout:** work out the size and position of every element. (You'll also hear this called **reflow**.)
3. **Paint:** draw the pixels.

Browsers are clever about this. They collect your changes and do this work once, just before the next frame. Your job is to not get in their way. Three habits help.

**1. Batch your changes.** Build new elements off the page first, then add them all in one go. A **DocumentFragment** is an invisible container made for exactly this. You fill it up, then `append` it to the page. The fragment itself disappears, and everything inside it lands in the list.

```js
const list = document.querySelector("#products");
const fragment = document.createDocumentFragment();

for (const product of products) {
  const li = document.createElement("li");
  li.textContent = `${product.name}: $${product.price}`;
  fragment.append(li); // off the page: nothing to redraw yet
}

list.append(fragment); // one change to the live page
```

To be honest, modern browsers already group a lot of changes for you, so the speed-up is sometimes small. But it's a cheap habit, and it guarantees the live page changes once, not a thousand times.

**2. Change a class, not lots of styles.** In [chapter 20](../20-dom-basics/notes.md), you learned the tidy way to change looks: describe them in CSS, and switch classes on and off. It also means fewer changes for the browser to deal with:

```js
// Four separate style changes
card.style.border = "2px solid gold";
card.style.background = "#fffbe6";
card.style.transform = "scale(1.05)";
card.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.2)";

// One class change: the styles live in your CSS file
card.classList.add("featured");
```

The browser gets one change instead of four, and your styles stay in the CSS file, where they're easy to find and reuse.

**3. Read first, then write.** Some properties make the browser work out the layout *right now*, so it can give you an up-to-date answer. `offsetWidth`, `offsetHeight`, `getBoundingClientRect()`, and `scrollTop` are the common ones. Reading them is fine. The trouble starts when you mix reading and writing:

```js
const boxes = [...document.querySelectorAll(".box")];

// Slow: read, write, read, write...
for (const box of boxes) {
  const width = box.offsetWidth;       // read: needs an up-to-date layout
  box.style.height = `${width / 2}px`; // write: now the layout is out of date
}
```

Every write makes the layout out of date, so the next read forces the browser to work it all out again. With 500 boxes, the browser may have to do the layout 500 times instead of once. This is called **layout thrashing**.

It's like a tailor who measures you, sews one seam, measures you again, sews another seam, and so on. A good tailor takes all the measurements first, then does all the sewing:

```js
const widths = boxes.map((box) => box.offsetWidth); // all the reads first

boxes.forEach((box, i) => {
  box.style.height = `${widths[i] / 2}px`;           // then all the writes
});
```

Now the browser only has to work out the layout once.

### Lazy loading: don't load it until it's needed

**Lazy loading** means loading something only when it's needed, instead of everything at the start. It's like a restaurant that makes your dessert when you're ready for it, not the moment you walk in.

**Images.** Add `loading="lazy"` to an image, and the browser waits to download it until it's close to scrolling into view. A visitor who never scrolls down never downloads it.

```html
<img src="beach.jpg" alt="Sunset at the beach" loading="lazy">
```

Don't lazy-load the images at the very top of the page, though. Visitors see those straight away.

**Code.** Remember dynamic `import()` from [chapter 29](../29-modules/notes.md)? It loads a module only when your code asks for it:

```js
reportButton.addEventListener("click", async () => {
  const { drawSalesChart } = await import("./charts.js"); // downloaded on the first click
  drawSalesChart(sales);
});
```

Visitors who never open the report never download the chart code. And because modules are cached, the second click doesn't download it again.

**Infinite scroll.** A feed that loads more posts as you reach the bottom needs to know when the bottom comes into view. You *could* check the scroll position in a `scroll` listener, but an **IntersectionObserver** is better: it watches an element for you, and tells you when it comes into view (when it "intersects" the visible part of the page). Put an empty marker element at the end of your list and watch it:

```js
const bottomMarker = document.querySelector("#bottom-marker");

const observer = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    loadMorePosts(); // your own function that fetches and shows more posts
  }
});

observer.observe(bottomMarker);
```

The browser does the watching, and your code only runs when the marker actually appears.

### Web Workers: heavy work on another thread

As you saw in [chapter 40](../40-event-loop/notes.md), JavaScript runs your code on one thread, like the cafe with just one cashier. A long calculation blocks everything else: clicks, typing, scrolling, and animations all have to wait.

A **Web Worker** runs a script on a separate thread. It's like the cafe hiring a second worker for the back room: the cashier keeps serving customers while the helper crunches the numbers. The two sides talk by sending messages:

```js
// main.js
const worker = new Worker("worker.js");

worker.addEventListener("message", (event) => {
  console.log("Total sales:", event.data);
});

worker.postMessage(salesFigures); // send the work to the worker
```

```js
// worker.js
self.addEventListener("message", (event) => {
  const total = event.data.reduce((sum, amount) => sum + amount, 0);
  self.postMessage(total); // send the answer back
});
```

`postMessage` sends a copy of the data, and `event.data` holds whatever arrived. Inside a worker, `self` means the worker itself.

Workers can't touch the page (there's no `document` inside a worker), so they're for calculations, not for updating the DOM. Like modules, they need a local server such as Live Server. Node has its own version, called worker threads (`node:worker_threads`). And adding up a few thousand numbers doesn't need a worker: reach for one when you've *measured* a long task that freezes the page.

### The network: fewer, smaller, cached requests

For most web pages, the slowest part isn't your JavaScript at all. It's waiting for data to arrive over the network. Every request is a trip to the server and back, and on a weak phone signal, one trip can take a second or more.

- **Fewer requests.** Don't ask for the same thing twice. When you need several things, ask for them all at once with `Promise.all` ([chapter 32](../32-async-await/notes.md)) instead of one after another.
- **Smaller requests.** Ask only for what you need. Many APIs let you ask for one page of results at a time, like `?_limit=10` on JSONPlaceholder. Shrink your images, which are usually the biggest files on a page. Build tools also shrink your code by removing spaces and shortening names, which is called **minifying** ([chapter 50](../50-tooling/notes.md)).
- **Cached requests.** Keep answers you already have. Browsers have their own **HTTP cache**, a store of files they've already downloaded, and the server decides how long each file may be kept there. In your own code, a Map works:

```js
const cache = new Map();

async function getJSON(url) {
  if (cache.has(url)) {
    return cache.get(url); // already downloaded: no request needed
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  const data = await response.json();
  cache.set(url, data);
  return data;
}

const url = "https://jsonplaceholder.typicode.com/users/1";
const user = await getJSON(url);     // goes over the network
const sameUser = await getJSON(url); // comes straight from the cache
console.log(user.name); // prints: Leanne Graham
```

This uses top-level `await`, so run it as a module: put a `package.json` containing `{ "type": "module" }` next to it ([chapter 29](../29-modules/notes.md)). When I timed the two calls, the first took over 100 ms and the second about 0.01 ms, because it never touched the network. Just remember that cached data can go out of date. Cache things that change slowly, like a list of countries, not things that change every second, like a live score.

### Putting it all together

When something feels slow, work through these questions in order:

1. **Is it really slow?** Measure it, and find the bottleneck.
2. **Can it do less work?** Pick a better tool for the job, like a Set or Map for lookups, or binary search instead of checking every item.
3. **Is it doing the same work twice?** Move work out of loops, build lookups once, memoize.
4. **Can it run less often?** Debounce, throttle, or `requestAnimationFrame`.
5. **Can it wait?** Lazy-load it.
6. **Can it happen somewhere else?** A Web Worker, or the server.

Then **measure again** to check that your change really helped. If it didn't, undo it and keep the simpler code.

## Common mistakes

**1. Optimizing without measuring**

```js
// Before: clear and easy to read
const total = cart.reduce((sum, item) => sum + item.price, 0);

// After some "optimizing": harder to read, and no faster that anyone could notice
let sum = 0;
for (let i = 0, len = cart.length; i < len; ++i) sum += cart[i].price;
```

For a cart of 20 items, both versions take a tiny fraction of a millisecond. The code got harder to read, and nobody gained anything. Measure first, and keep the readable version until the numbers tell you otherwise.

**2. A hidden loop inside a loop**

```js
function removeDuplicates(emails) {
  const unique = [];
  for (const email of emails) {
    if (!unique.includes(email)) { // includes is a loop too
      unique.push(email);
    }
  }
  return unique;
}
```

It gives the right answer, but `includes` searches the whole `unique` array for every email: O(n²). With 10,000 different emails, it took almost 2 seconds on my machine. A Set ([chapter 35](../35-map-and-set/notes.md)) does the same job in about a millisecond: `const unique = [...new Set(emails)];`

**3. Adding to `innerHTML` in a loop**

```js
for (const song of playlist) {
  songList.innerHTML += `<li>${song.title}</li>`;
}
```

Every `+=` turns the whole list back into text, adds one item, then throws away every element and rebuilds them all from that text. With 1,000 songs, the list gets rebuilt 1,000 times. It's also a security risk if a title came from a user ([chapter 51](../51-security-basics/notes.md)). Create each item with `createElement` and `textContent`, collect them in a DocumentFragment, and append it once.

**4. Memoizing a function that isn't pure**

```js
let discountPercent = 10;
const priceCache = new Map();

function discountedPrice(price) {
  if (priceCache.has(price)) {
    return priceCache.get(price);
  }
  const result = price - (price * discountPercent) / 100;
  priceCache.set(price, result);
  return result;
}

console.log(discountedPrice(50)); // prints: 45
discountPercent = 50; // the big sale starts!
console.log(discountedPrice(50)); // prints: 45 (wrong: it should be 25)
```

The cache only looks at `price`, but the answer also depends on `discountPercent`, which lives outside the function. So the cache hands out an old answer. Only memoize pure functions. Here, you could pass the discount in as a second parameter and use both values in the cache key, like `` `${price}-${percent}` ``.

**5. A cache that grows forever**

```js
const searchCache = new Map();

async function searchProducts(query) {
  if (!searchCache.has(query)) {
    searchCache.set(query, await fetchResults(query));
  }
  return searchCache.get(query);
}
```

Every search anyone types stays in memory for as long as the page is open. For a page that stays open all day, that's a memory leak ([chapter 41](../41-memory-and-garbage-collection/notes.md)). Give the cache a size limit. A Map remembers the order you added things, so its first key is always the oldest one:

```js
const MAX_CACHE_SIZE = 100;

function addToCache(query, results) {
  if (searchCache.size >= MAX_CACHE_SIZE) {
    const oldestQuery = searchCache.keys().next().value;
    searchCache.delete(oldestQuery); // make room by removing the oldest
  }
  searchCache.set(query, results);
}
```

## Quick recap

- Measure first, with `console.time`, `performance.now()`, and the browser's Performance tab. Fix the bottleneck, then measure again.
- Big O describes how work grows as data grows: O(1) and O(log n) stay fast, O(n) grows steadily, and O(n²) gets out of hand quickly. Watch out for hidden loops like `includes` and `find` inside another loop.
- For lookups, a Set or Map beats searching an array, as soon as there's a lot of data.
- Don't repeat work: move it out of loops, build lookups once, and memoize pure functions (with a size limit on the cache).
- Run code less often (debounce, throttle, `requestAnimationFrame`), later (lazy loading), or somewhere else (Web Workers).
- In the DOM, batch your changes, prefer classes, and read the layout before you write to it.
- On the network, make fewer, smaller, cached requests.

---

**Next:** try the [exercises](exercises.md), then move on to [49 Node.js Basics](../49-nodejs-basics/notes.md).
