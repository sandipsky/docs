# 21 Events

## What is it?

An **event** is something that happens on the page: a click, a key press, typing in a box, the mouse moving over a picture.

You can tell JavaScript: "when *this* happens, run *that* function." That's how a web page reacts to the people using it.

## Why does it matter?

In [chapter 20](../20-dom-basics/notes.md), your scripts ran once, when the page loaded, and then stopped. Nothing you clicked did anything.

Real apps wait for you. A Like button counts likes. A search box filters results as you type. Pressing `Escape` closes a pop-up. "Add to cart" adds an item and updates the total. All of those are events.

From here on, almost everything interactive you build starts with an event.

## Real-world example

Think of a doorbell:

| The doorbell | Events in JavaScript |
|---|---|
| You install a doorbell and decide ahead of time: "when it rings, I'll open the door" | `button.addEventListener("click", openDoor)` |
| A visitor presses the bell | The user clicks the button: a `click` event |
| You go and open the door | Your function runs |
| You don't stand by the door all day, waiting | Your code doesn't wait in a loop. The browser calls your function when it happens |
| The visitor says who they are: "Parcel for you!" | The **event object**: details about what happened |
| You unplug the doorbell | `removeEventListener` |

The key idea: you set it all up *ahead of time*. Then the browser runs your function whenever the event happens: maybe once, maybe fifty times, maybe never.

## How it works

For every example in this chapter, use a practice page like the one from chapter 20: a folder with `index.html` and `script.js`, linked with `<script src="script.js" defer></script>`. Put each example's HTML in the `<body>`, its code in `script.js`, then save and refresh. A few examples hide things with the `hidden` class from chapter 20, so add `<style>.hidden { display: none; }</style>` to the `<head>` too.

### Your first event listener

Here's a Like button:

```html
<button id="like-button">Like</button>
<p id="like-count">Likes: 0</p>
```

```js
const likeButton = document.getElementById("like-button");
const likeCount = document.getElementById("like-count");
let likes = 0;

likeButton.addEventListener("click", () => {
  likes++;
  likeCount.textContent = `Likes: ${likes}`;
});
```

Click the button three times, and the page shows `Likes: 3`.

`addEventListener` takes two things:

1. The **type** of event, as a string: `"click"`.
2. A function to run when it happens.

That function is called an **event listener** (or **event handler**): it listens for the event, then handles it. It's a callback, like the ones you passed to `map` and `filter` in [chapter 13](../13-array-methods/notes.md). You hand it over, and the browser calls it later.

For longer handlers, a named function keeps things tidy. Here's the same button with a named function instead of the arrow function. Notice there are no brackets after `addLike`: you're handing the function over, not calling it yet.

```js
function addLike() {
  likes++;
  likeCount.textContent = `Likes: ${likes}`;
}

likeButton.addEventListener("click", addLike);
```

> **Tip:** You can "click" from the Console too. Type `document.getElementById("like-button").click()` and press `Enter`. It's a quick way to test a handler.

### Events you'll use most

| Event | Fires when... | Typical use |
|---|---|---|
| `click` | an element is clicked (or tapped) | buttons, links, cards |
| `input` | the text in a text box changes, on every keystroke | live search, character counters |
| `change` | the user finishes changing a value, like picking from a dropdown | dropdowns, checkboxes |
| `keydown` | a key is pressed down | keyboard shortcuts, games |
| `mouseover` / `mouseout` | the mouse pointer moves onto / off an element | hover tips, previews |
| `submit` | a form is sent | forms (the whole of [chapter 22](../22-forms/notes.md)) |

### The event object

When an event happens, the browser hands your function an **event object**: a bundle of details about what just happened. Add a parameter to catch it. It's usually called `event`. Try it on the Like button:

```js
likeButton.addEventListener("click", (event) => {
  console.log(event.type);   // prints: click
  console.log(event.target); // shows: <button id="like-button">Like</button>
});
```

| Property | What it tells you |
|---|---|
| `event.type` | Which event it was: `"click"`, `"keydown"`, and so on |
| `event.target` | The element where the event happened |
| `event.key` | Which key was pressed (keyboard events only) |
| `event.preventDefault()` | Not a detail, but a method: it stops the browser's normal action (coming up soon) |

### Typing: `input` and `change`

Here's a name badge that updates as you type. `<input>` makes a text box, and its `value` property is the text currently inside it. (You'll learn much more about inputs in chapter 22.)

```html
<input id="name-input">
<p id="badge">Hello, my name is ...</p>
```

```js
const nameInput = document.getElementById("name-input");
const badge = document.getElementById("badge");

nameInput.addEventListener("input", (event) => {
  badge.textContent = `Hello, my name is ${event.target.value}`;
});
```

Type `Sam`, and the badge changes with every letter: `Hello, my name is S`, then `Sa`, then `Sam`.

The `change` event is calmer. In a text box, it waits until you've finished and click somewhere else. It's most useful for dropdowns (`<select>`), where it fires as soon as you pick an option:

```html
<select id="size">
  <option value="small">Small pizza</option>
  <option value="large">Large pizza</option>
</select>
```

```js
const sizeSelect = document.getElementById("size");

sizeSelect.addEventListener("change", (event) => {
  console.log(`You picked: ${event.target.value}`);
});
```

Pick "Large pizza", and the Console prints `You picked: large`. That's the option's `value`, not the text you see.

### The keyboard: `keydown` and `event.key`

To catch key presses anywhere on the page, listen on `document` itself:

```js
document.addEventListener("keydown", (event) => {
  console.log(`You pressed: ${event.key}`);
});
```

Press a few keys and watch the Console. `event.key` tells you which one:

| You press | `event.key` is |
|---|---|
| The A key | `"a"` (or `"A"` with Shift) |
| Enter | `"Enter"` |
| Escape | `"Escape"` |
| The arrow keys | `"ArrowUp"`, `"ArrowDown"`, `"ArrowLeft"`, `"ArrowRight"` |
| The space bar | `" "` (a single space) |

A classic use is closing something with `Escape`:

```html
<p id="banner">Free delivery this weekend! Press Escape to close.</p>
```

```js
const banner = document.getElementById("banner");

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    banner.classList.add("hidden");
  }
});
```

### The mouse: `mouseover` and `mouseout`

These fire when the mouse pointer moves onto an element and off it again. Here's a little tip that appears while you hover over a product:

```html
<p id="product">Mystery box: $10</p>
<p id="tip" class="hidden">What's inside? Nobody knows!</p>
```

```js
const product = document.getElementById("product");
const tip = document.getElementById("tip");

product.addEventListener("mouseover", () => {
  tip.classList.remove("hidden");
});
product.addEventListener("mouseout", () => {
  tip.classList.add("hidden");
});
```

For purely visual hover effects, like changing a color, CSS can do the job alone (with `:hover`). Reach for mouse events when JavaScript needs to *do* something.

### Stopping the browser's normal action: `preventDefault()`

Some events come with a built-in action. Clicking a link opens a new page. Sending a form reloads the page. Pressing the arrow keys scrolls the page. Calling `event.preventDefault()` tells the browser: "don't do your usual thing, I'll handle this one."

```html
<a id="terms-link" href="terms.html">Show the terms</a>
<p id="terms" class="hidden">No refunds on cakes once they've been cut.</p>
```

```js
const termsLink = document.getElementById("terms-link");
const terms = document.getElementById("terms");

termsLink.addEventListener("click", (event) => {
  event.preventDefault(); // don't go to terms.html
  terms.classList.toggle("hidden"); // show the terms right here instead
});
```

Clicking the link now shows and hides the terms, and the page stays put.

You'll use `preventDefault` most with forms. Without it, sending a form reloads the page and wipes out everything. Chapter 22 starts every form like this:

```js
form.addEventListener("submit", (event) => {
  event.preventDefault(); // stop the page from reloading
  // ...then deal with the form yourself
});
```

### `DOMContentLoaded`

In older code, you'll often see scripts wrapped like this:

```js
document.addEventListener("DOMContentLoaded", () => {
  // everything here runs once the whole HTML has been read
});
```

`DOMContentLoaded` is an event that fires when the browser has finished reading the page. It solves the same problem as `defer`: making sure the elements exist before your code looks for them. Your scripts already use `defer`, so you don't need it.

### Removing a listener

Sometimes a listener should stop listening. Say a coffee shop's website gives each visitor one free coffee:

```html
<button id="gift-button">Claim your free coffee</button>
<p id="gift-message"></p>
```

```js
const giftButton = document.getElementById("gift-button");
const giftMessage = document.getElementById("gift-message");

function claimGift() {
  giftMessage.textContent = "Gift claimed! Enjoy your free coffee.";
  giftButton.removeEventListener("click", claimGift);
}

giftButton.addEventListener("click", claimGift);
```

After the first click, the button stops listening. Click it again and nothing happens.

`removeEventListener` needs the **exact same function** you added. That's why this example uses a named function. Two arrow functions that look identical are still two different functions (like the two different objects in [chapter 16](../16-values-vs-references/notes.md)), so this doesn't work:

```js
giftButton.addEventListener("click", () => console.log("Hi"));
giftButton.removeEventListener("click", () => console.log("Hi")); // removes nothing!
```

> **Tip:** For "only once", there's also a shortcut: `giftButton.addEventListener("click", claimGift, { once: true });` removes the listener for you after the first time.

### Bubbling: events travel up the tree

Here's something surprising. When you click an element, its parents hear the click too:

```html
<ul id="cart">
  <li id="cart-item">
    Headphones <button id="remove-button">Remove</button>
  </li>
</ul>
```

```js
document.getElementById("remove-button").addEventListener("click", () => {
  console.log("The button heard the click");
});
document.getElementById("cart-item").addEventListener("click", () => {
  console.log("The list item heard the click");
});
document.getElementById("cart").addEventListener("click", () => {
  console.log("The list heard the click");
});
```

Click the Remove button, and you'll see:

```
The button heard the click
The list item heard the click
The list heard the click
```

Click the word "Headphones" instead, and only the last two lines appear, because the click started on the list item.

This is called **bubbling**. An event starts on the element where it happened, then rises up through each parent in the family tree, all the way to `document`, like a bubble rising through water. Every listener along the way gets a turn.

So inside a parent's listener, there are two different elements to know about:

- **`event.target`**: where the event *started* (the exact thing that was clicked).
- **`event.currentTarget`**: the element whose listener is running *right now*.

```js
document.getElementById("cart").addEventListener("click", (event) => {
  console.log(event.target.tagName, event.currentTarget.tagName); // tagName is the element's tag
});
// Clicking the Remove button prints: BUTTON UL
```

If you ever need to stop an event from bubbling any further, call `event.stopPropagation()`:

```js
document.getElementById("remove-button").addEventListener("click", (event) => {
  event.stopPropagation(); // the list item and the list never hear about it
  console.log("The button heard the click");
});
```

Use it sparingly. Other code may be counting on hearing that event, like a menu that closes when you click anywhere else on the page. Stopping the bubble quietly breaks it.

### Event delegation: one listener for many elements

Bubbling might sound like a nuisance, but it makes one of the most useful tricks in front-end programming possible.

Picture a shopping list with a Remove button on every item. You could add a listener to each button. But what about items added later? Their buttons don't exist yet when your script runs, so they'd get no listener at all.

Instead, put **one** listener on the parent, and let the clicks bubble up to it. This is called **event delegation**. It's like a receptionist in an office building: instead of a guard at every office door, one person at the front desk greets every visitor and sends them the right way. When a new office opens, the receptionist handles its visitors too.

```html
<ul id="shopping-list">
  <li>Milk <button class="remove">Remove</button></li>
  <li>Eggs <button class="remove">Remove</button></li>
</ul>
<button id="add-button">Add bread</button>
```

```js
const list = document.getElementById("shopping-list");

list.addEventListener("click", (event) => {
  if (event.target.classList.contains("remove")) {
    event.target.closest("li").remove();
  }
});
```

Step by step:

1. Any click inside the list bubbles up to the list's listener.
2. `event.target.classList.contains("remove")` checks whether the click started on a Remove button. Clicks on the item's text are ignored.
3. **`closest("li")`** starts at the clicked button and walks *up* the family tree until it finds an `li`. That's the item to remove.

Now add items later, and their Remove buttons work straight away, with no extra listeners:

```js
document.getElementById("add-button").addEventListener("click", () => {
  const button = document.createElement("button");
  button.textContent = "Remove";
  button.classList.add("remove");

  const li = document.createElement("li");
  li.append("Bread ", button); // append can take text and elements
  list.append(li);
});
```

Delegation shines with lists that change: to-do lists, shopping carts, comment sections. You'll use it in the [chapter 24](../24-project-todo-app/notes.md) project. Combined with `data-` attributes from chapter 20, the listener can also tell *which* item was clicked: `event.target.closest("li").dataset.id`.

### The old way: `onclick`

In older code and tutorials, you'll see events set up right inside the HTML:

```html
<button onclick="addLike()">Like</button>
```

Avoid this. It mixes your JavaScript into your HTML, the function has to be global to be found, and many websites block it for security reasons ([chapter 51](../51-security-basics/notes.md)).

You'll also see the `onclick` *property*. Its problem is that an element can only have one:

```js
likeButton.onclick = () => console.log("first");
likeButton.onclick = () => console.log("second"); // replaces the first!
// Clicking prints only: second
```

`addEventListener` doesn't have that problem: add two listeners, and both run. Stick with `addEventListener`.

> **Coming up:** some events fire *a lot*. `input` fires on every keystroke, and scrolling fires dozens of times a second. In [chapter 34](../34-debounce-and-throttle/notes.md), you'll learn to calm them down with debounce and throttle. You may also see `this` used inside event handlers in other people's code. That's explained in [chapter 26](../26-this-keyword/notes.md). For now, stick with `event.target` and `event.currentTarget`.

## Common mistakes

**1. Calling the function instead of handing it over**

```js
likeButton.addEventListener("click", addLike()); // the brackets run it right now!
```

With brackets, `addLike()` runs once, the moment the page loads, so the page says `Likes: 1` before anyone clicks. It returns `undefined`, so that's what gets set up as the listener, and clicking does nothing. There's no error to warn you. Hand over the function itself, without brackets: `addEventListener("click", addLike)`.

If you need to pass something to the function, wrap the call in an arrow function: `addEventListener("click", () => addToCart(3))`.

**2. Misspelling the event name**

```js
likeButton.addEventListener("onclick", addLike); // never fires
likeButton.addEventListener("Click", addLike);   // never fires either
```

Event names are all lowercase, with no `on` in front: `"click"`, `"keydown"`, `"mouseover"`. A misspelled name doesn't cause an error. The listener just waits forever for an event that never comes.

**3. Adding listeners to elements that don't exist yet**

```js
const removeButtons = document.querySelectorAll(".remove");
for (const button of removeButtons) {
  button.addEventListener("click", removeItem);
}
// Items added later have Remove buttons that do nothing
```

`querySelectorAll` only finds the buttons that exist *right now*. Buttons created later never get a listener. Use event delegation instead: one listener on the parent list.

**4. Trusting `event.target` when a button has something inside it**

```html
<button class="remove"><b>X</b> Remove</button>
```

```js
list.addEventListener("click", (event) => {
  if (event.target.classList.contains("remove")) { // false when you click the X!
    event.target.closest("li").remove();
  }
});
```

Click the bold `X`, and `event.target` is the `<b>` element, not the button, so the check fails. Use `closest` to find the button, whichever part of it was clicked:

```js
list.addEventListener("click", (event) => {
  const button = event.target.closest(".remove");
  if (button) {
    button.closest("li").remove();
  }
});
```

If the click wasn't on (or inside) a Remove button, `closest` gives `null`, and nothing happens.

**5. Listening for keys on the wrong element**

```js
playButton.addEventListener("keydown", movePlayer); // only works while the button is selected
```

Key presses go to whichever element has **focus**: the one that's currently active, like the text box you're typing in. Usually that's the page itself, so a listener on a button rarely hears anything. For keyboard shortcuts and games, listen on `document`.

## Quick recap

- An event is something that happens on the page. `element.addEventListener("click", handler)` sets up a function to run every time it happens.
- The events you'll use most are `click`, `input`, `change`, `keydown`, `mouseover`/`mouseout`, and `submit`.
- Your handler receives an event object: `event.target` is where it happened, `event.key` is the key pressed, and `event.preventDefault()` stops the browser's normal action.
- `removeEventListener` needs the exact same function you added. `{ once: true }` is a shortcut for one-time listeners.
- Events bubble up from where they happened through every parent. `stopPropagation()` stops that, but use it sparingly.
- Event delegation puts one listener on a parent to handle all its children, even ones added later. `closest()` finds the element you care about.
- Use `addEventListener`, not `onclick` in your HTML.

---

**Next:** try the [exercises](exercises.md), then move on to [22 Forms](../22-forms/notes.md).
