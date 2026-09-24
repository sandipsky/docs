# 30 Timers and Callbacks

## What is it?

A **timer** lets you run code later instead of right now: "in 5 seconds, do this", or "every second, do that".

A **callback** is a function you hand to someone else, so they can call it when the time comes. You met callbacks in [chapter 13](../13-array-methods/notes.md). Timers are where they really shine.

## Why does it matter?

A lot of real work doesn't happen instantly:

- A reminder that pops up in 10 minutes.
- A countdown on a flash sale page.
- An editor that auto-saves your draft every 30 seconds.
- A slideshow that moves to the next photo every 5 seconds.
- Waiting for a server to answer, or for a big file to load.

JavaScript can't stop and stare at the clock while it waits. Your program would freeze, and a web page wouldn't respond to any clicks. Timers and callbacks let JavaScript start something, carry on with other work, and come back when it's time.

This chapter is also the foundation for the next three: promises, `async`/`await`, and getting data from the internet.

## Real-world example

Think about ordering food at a busy restaurant.

**The synchronous way** (one thing at a time, in order): you order at the counter, then stand there while the chef cooks. Nobody behind you can order until your food is ready. Everyone waits.

**The asynchronous way** (start now, finish later): the waiter takes your order to the kitchen, and you go and sit down. You chat with friends while the kitchen cooks. When the food is ready, it comes to your table.

| At the restaurant | In JavaScript |
|---|---|
| You place an order | You start a timer (or a download) |
| You sit down and chat | The rest of your code keeps running |
| The kitchen does the cooking | Node or the browser does the waiting for you |
| "Here's your food!" | Your callback runs |

And a callback is like leaving your phone number at a repair shop. You don't stand at the counter all day. You say "call me back when it's done", and go home.

## How it works

### Synchronous vs. asynchronous

So far, all your code has been **synchronous**: each line runs and finishes, and only then does the next line start.

**Asynchronous** code starts something now and finishes it later. Meanwhile, the rest of your code keeps going.

Here's the restaurant in code. `setTimeout` means "run this function later" (more on it in a moment):

```js
console.log("Order placed");

setTimeout(() => {
  console.log("Your food is ready!");
}, 2000);

console.log("Chatting with friends...");
```

You'll see:

```
Order placed
Chatting with friends...
Your food is ready!
```

The first two lines appear straight away. The last one appears about 2 seconds later.

JavaScript didn't wait at `setTimeout`. It handed the job over, moved on to the next line, and came back to the callback when the time was up.

> Node keeps your program running while a timer is still waiting. When there's nothing left to wait for, it exits on its own.

### `setTimeout`: run something once, later

`setTimeout(callback, delay)` takes two things:

- a **callback**: the function to run later
- a **delay**: how long to wait, in **milliseconds** (thousandths of a second, so 1000 ms is 1 second)

In the restaurant example, the callback was an arrow function written right inside the call. That's the most common style. You can also pass a named function:

```js
function remindMe() {
  console.log("Time to stretch!");
}

setTimeout(remindMe, 3000); // pass the function itself, without ()
console.log("Reminder set for 3 seconds from now");
```

You'll see:

```
Reminder set for 3 seconds from now
Time to stretch!
```

Notice that `remindMe` has no brackets. Just like with array methods in [chapter 13](../13-array-methods/notes.md), you hand over the function itself, and `setTimeout` calls it for you when the time comes.

### `clearTimeout`: cancel it before it happens

`setTimeout` gives you back a **timer id**: a ticket that identifies this one timer. Keep it in a variable, and you can cancel the timer with `clearTimeout(id)` before it goes off.

Many email apps give you a few seconds to "undo send". Here's the idea:

```js
const sendTimer = setTimeout(() => {
  console.log("Email sent!");
}, 5000);

// The user clicks "Undo" after about 1 second:
setTimeout(() => {
  clearTimeout(sendTimer);
  console.log("Undo! The email was not sent.");
}, 1000);
```

After about 1 second, you'll see:

```
Undo! The email was not sent.
```

"Email sent!" never appears, because that timer was cancelled. And since no timers are left, Node exits straight away.

> **Browser vs. Node:** in the browser, the timer id is a number, like `3`. In Node, it's an object (it prints as `Timeout { ... }`). You never need to look inside it. Just store it and pass it to `clearTimeout`.

### `setInterval`: run something again and again

`setInterval(callback, delay)` runs your callback every `delay` milliseconds, until you stop it with `clearInterval(id)`. It's perfect for clocks, countdowns, and anything that repeats.

```js
let secondsLeft = 3;

const countdown = setInterval(() => {
  console.log(secondsLeft);
  secondsLeft--;

  if (secondsLeft === 0) {
    clearInterval(countdown); // stop the interval
    console.log("Liftoff!");
  }
}, 1000);
```

You'll see one line per second:

```
3
2
1
Liftoff!
```

Without `clearInterval`, it would never stop. It's the timer version of an infinite loop from [chapter 08](../08-loops/notes.md). Just like there, press `Ctrl + C` in the terminal to stop it.

On a web page, the same idea keeps a clock up to date. Say the page has a `<p id="clock"></p>` ([chapter 20](../20-dom-basics/notes.md)):

```js
const clock = document.querySelector("#clock");

setInterval(() => {
  clock.textContent = new Date().toLocaleTimeString();
}, 1000);
```

Every second, the paragraph shows the new time, like `3:28:34 PM` (the format depends on your computer's language settings).

| | `setTimeout` | `setInterval` |
|---|---|---|
| Runs the callback | once | again and again |
| Real-world uses | reminders, "undo send", a short delay | clocks, countdowns, auto-save, slideshows |
| Cancel it with | `clearTimeout(id)` | `clearInterval(id)` |

### The delay is a minimum, not an exact time

The delay means "not before this". It doesn't promise "exactly then".

```js
const start = Date.now();

setTimeout(() => {
  console.log(`Waited ${Date.now() - start} ms`);
}, 1000);
```

This prints something like `Waited 1007 ms`. Your number will be a little different each time, usually a few milliseconds over 1000. (`Date.now()` gives the current time in milliseconds, from [chapter 19](../19-dates-and-times/notes.md).)

It's like a restaurant saying "your table will be ready in 20 minutes". It might be 21 or 25, but not 5. A timer's callback never interrupts code that's already running. When its time is up, it waits for its turn, like a customer waiting while the cashier finishes with the person in front.

Even a delay of `0` doesn't mean "right now":

```js
setTimeout(() => {
  console.log("Timer (0 ms)");
}, 0);

console.log("Regular code");
```

You'll see:

```
Regular code
Timer (0 ms)
```

The timer's callback has to wait until the code that's already running has finished. [Chapter 40](../40-event-loop/notes.md) shows exactly how JavaScript decides what runs next.

### Callbacks: "call me back when you're done"

You've been using callbacks since [chapter 13](../13-array-methods/notes.md), and with `addEventListener` in [chapter 21](../21-events/notes.md). There are two kinds:

- **Synchronous callbacks** run right away. The callback you give `map` runs once for each item, before `map` finishes.
- **Asynchronous callbacks** run later. The ones you give `setTimeout` or `addEventListener` run when the time comes, or when the event happens.

You can write your own functions that take an asynchronous callback. Here's a bakery that tells you when your cake is ready:

```js
function bakeCake(flavor, onDone) {
  console.log(`Baking a ${flavor} cake...`);

  setTimeout(() => {
    onDone(`${flavor} cake`); // "call me back" with the result
  }, 2000);
}

bakeCake("chocolate", (cake) => {
  console.log(`Ready to eat: ${cake}`);
});

console.log("Meanwhile, washing the dishes");
```

You'll see:

```
Baking a chocolate cake...
Meanwhile, washing the dishes
Ready to eat: chocolate cake
```

Why a callback? Why not `return` the cake? Because when `bakeCake` finishes, the cake isn't ready yet. `bakeCake` returns straight away, and the cake arrives about 2 seconds later. The callback is your phone number: "call me when it's done".

### Error-first callbacks (the Node style)

Waiting for something can end badly: the file doesn't exist, the server is down, the tracking number is wrong. So how does a callback hear about an error?

Node's older built-in functions use a simple agreement called **error-first callbacks**: the callback's first parameter is the error, and the second is the result.

- If something went wrong, the first argument is an `Error` object, just like the ones you threw in [chapter 18](../18-error-handling/notes.md).
- If everything went fine, the first argument is `null` ("no error"), and the result comes second.

Here's a pretend parcel tracker:

```js
const parcels = { PKG123: "Out for delivery", PKG456: "Delivered" };

function trackParcel(trackingNumber, callback) {
  setTimeout(() => {
    const status = parcels[trackingNumber];
    if (status === undefined) {
      callback(new Error(`No parcel found for ${trackingNumber}`));
      return;
    }
    callback(null, status); // null means "no error"
  }, 1000);
}

trackParcel("PKG123", (error, status) => {
  if (error) {
    console.log("Oops:", error.message);
    return;
  }
  console.log("Status:", status);
});
// prints (after about 1 second): Status: Out for delivery
```

Now change `"PKG123"` to `"PKG999"` and run it again. You'll see `Oops: No parcel found for PKG999`.

Inside the callback, always check `error` first, and `return` so the rest doesn't run. You'll see this shape in real Node code, like `fs.readFile("notes.txt", "utf8", (error, text) => { ... })` for reading a file (you'll meet `fs` in [chapter 49](../49-nodejs-basics/notes.md)).

Why not use `try`/`catch` instead? Because the error happens later, after `try`/`catch` has already finished. You'll see that in "Common mistakes" below.

### Callback hell: the pyramid of doom

Now say you need several steps in a row, and each one has to wait for the one before. Ordering a pizza: take the order, then make the dough, then bake it, then deliver it.

```js
function doStep(step, callback) {
  setTimeout(() => {
    console.log(`Done: ${step}`);
    callback();
  }, 500);
}

doStep("Take the order", () => {
  doStep("Make the dough", () => {
    doStep("Bake the pizza", () => {
      doStep("Deliver it", () => {
        console.log("Enjoy your pizza!");
      });
    });
  });
});
```

You'll see one new line about every half a second:

```
Done: Take the order
Done: Make the dough
Done: Bake the pizza
Done: Deliver it
Enjoy your pizza!
```

It works, but look at the shape. Every step pushes the code further to the right. Programmers call this **callback hell**, or the **pyramid of doom**.

And this version doesn't even handle errors. With error-first callbacks, every single level needs its own check:

```js
doStep("Take the order", (error) => {
  if (error) {
    console.log("Problem:", error.message);
    return;
  }
  doStep("Make the dough", (error) => {
    if (error) {
      console.log("Problem:", error.message);
      return;
    }
    // ...and so on, deeper and deeper
  });
});
```

Hard to read, easy to get wrong, and painful to change. This exact problem is why **promises** were invented. They're the next chapter.

### Closures and timers: the `var` loop, again

In [chapter 25](../25-closures/notes.md), you saw that functions created in a `for (var ...)` loop all share one variable. Timers are where this bug shows up in real life. Say a cinema wants to call seats 1, 2 and 3, one per second:

```js
for (var seat = 1; seat <= 3; seat++) {
  setTimeout(() => {
    console.log(`Now calling seat ${seat}`);
  }, seat * 1000);
}
```

You'll see:

```
Now calling seat 4
Now calling seat 4
Now calling seat 4
```

Seat 4 doesn't even exist! Here's what happened:

1. The loop runs fast, all in one go. It sets up three timers (for 1, 2 and 3 seconds), then finishes with `seat` at `4`.
2. `var` makes one shared `seat` for the whole loop ([chapter 14](../14-scope-and-hoisting/notes.md)).
3. When the timers go off, each callback looks at that one shared `seat`, and by then it's `4`.

The fix is one word. Change `var` to `let`:

```js
for (let seat = 1; seat <= 3; seat++) {
  setTimeout(() => {
    console.log(`Now calling seat ${seat}`);
  }, seat * 1000);
}
```

You'll see:

```
Now calling seat 1
Now calling seat 2
Now calling seat 3
```

With `let`, every turn of the loop gets its own `seat`, and each callback carries its own one in its backpack.

### Polling: checking again every few seconds

Sometimes you're waiting for something, and nobody is going to call you back. So you keep asking. That's **polling**: checking on a schedule, like a kid in the back of the car asking "are we there yet?" every few minutes.

Real apps poll to check whether a video has finished processing, whether a payment has gone through, or whether new messages have arrived.

```js
let checks = 0;

// Pretend to ask a server. The video is ready on the 3rd check.
function isVideoReady() {
  return checks === 3;
}

const poller = setInterval(() => {
  checks++;
  console.log(`Check ${checks}: is the video ready?`);
  if (isVideoReady()) {
    clearInterval(poller); // got the answer, stop asking
    console.log("Yes! Your video is ready to watch.");
  }
}, 2000);
```

You'll see one check about every 2 seconds:

```
Check 1: is the video ready?
Check 2: is the video ready?
Check 3: is the video ready?
Yes! Your video is ready to watch.
```

> **Tip:** always have a way to stop polling: when you get your answer, and after a maximum number of tries. Otherwise your app keeps asking forever.

### Coming up: debounce and throttle

Two famous helpers are built from nothing more than `setTimeout`, `clearTimeout` and a closure:

- **Debounce:** wait until things calm down, then run once. Think of a search box that waits until you stop typing before it searches.
- **Throttle:** run at most once every so often, however many times it's triggered. Think of a page reacting to scrolling a few times a second instead of hundreds.

You'll build both yourself in [chapter 34](../34-debounce-and-throttle/notes.md).

## Common mistakes

**1. Calling the function instead of passing it**

```js
setTimeout(remindMe(), 3000);
// TypeError [ERR_INVALID_ARG_TYPE]: The "callback" argument must be of type function. Received undefined
```

The brackets call `remindMe` right away, so "Time to stretch!" prints immediately. Then `setTimeout` gets what `remindMe` returned (`undefined`) instead of a function, and Node stops with the error above. The browser doesn't even show an error. The reminder just appears too early, which is more confusing.

Fix: pass the function without brackets, `setTimeout(remindMe, 3000)`, or wrap the call in an arrow function, `setTimeout(() => remindMe(), 3000)`.

**2. Expecting the next line to wait**

```js
let message = "Not ready";

setTimeout(() => {
  message = "Ready!";
}, 1000);

console.log(message); // prints: Not ready
```

`setTimeout` doesn't pause your program. The `console.log` runs straight away, a whole second before the callback changes `message`. The same goes for trying to `return` a value from inside a timer: by the time the callback runs, the outer function has long finished.

Fix: put the code that needs the result *inside* the callback, or pass the result on to another callback, like `bakeCake` did.

**3. Forgetting to stop an interval**

```js
let secondsLeft = 3;

setInterval(() => {
  console.log(secondsLeft);
  secondsLeft--;
}, 1000);
// prints 3, 2, 1, 0, -1, -2, ... forever
```

An interval keeps going until you stop it. Fix: store the id and call `clearInterval(id)` when you're done, like the liftoff countdown does. On a web page, a forgotten interval keeps running in the background, using up memory and battery ([chapter 41](../41-memory-and-garbage-collection/notes.md)).

**4. Wrapping a timer in `try`/`catch`**

```js
try {
  setTimeout(() => {
    throw new Error("The oven broke!");
  }, 1000);
} catch (error) {
  console.log("Caught it:", error.message); // never runs
}
// Error: The oven broke!
```

After about 1 second, the program crashes with `Error: The oven broke!`. The `try`/`catch` finished long before the timer went off, so nobody is left to catch the error.

Fix: handle errors *inside* the callback, or pass them on with an error-first callback. Promises ([chapter 31](../31-promises/notes.md)) and `async`/`await` ([chapter 32](../32-async-await/notes.md)) give you a much nicer way.

**5. Writing the delay in seconds**

```js
setTimeout(() => {
  console.log("Your 5-minute break is over!");
}, 5); // 5 milliseconds, not 5 minutes!
```

The delay is always in milliseconds. 5 seconds is `5000`, and 5 minutes is `5 * 60 * 1000`. Writing it as a calculation like that makes it easy to read.

## Quick recap

- Synchronous code runs one line at a time, in order. Asynchronous code starts now and finishes later, while the rest of your code keeps running.
- `setTimeout(fn, ms)` runs `fn` once, after at least `ms` milliseconds. `clearTimeout(id)` cancels it.
- `setInterval(fn, ms)` runs `fn` again and again, until you call `clearInterval(id)`.
- The delay is a minimum, not an exact time. Even `setTimeout(fn, 0)` waits until the current code has finished.
- A callback means "call me back when you're done". In the Node style, its first parameter is the error (or `null`).
- Many waiting steps in a row turn into callback hell. Promises fix that in the next chapter.
- Use `let`, not `var`, in loops that create timers, so each callback gets its own variable.

---

**Next:** try the [exercises](exercises.md), then move on to [31 Promises](../31-promises/notes.md).
