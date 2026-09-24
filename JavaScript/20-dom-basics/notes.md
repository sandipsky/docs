# 20 DOM Basics

## What is it?

The **DOM** (Document Object Model) is the browser's live copy of your web page, built out of objects that JavaScript can read and change.

When your code changes the DOM, the page on the screen changes straight away.

## Why does it matter?

Until now, your programs have only talked to you through the terminal. Real web apps change what's on the page:

- a cart counter goes from 2 to 3,
- search results appear under a search box,
- a warning turns red when a password is too short,
- a to-do list grows as you add tasks.

Every one of those is JavaScript changing the DOM. It's the bridge between your code and what people actually see. This chapter is also where you start running code in the browser, which you'll keep doing in the next few chapters.

## Real-world example

Remember the house from [chapter 01](../01-getting-started/notes.md)? HTML was the walls and rooms. Let's take that one step further:

| Building a house | Building a web page |
|---|---|
| The architect's blueprint, on paper | Your `index.html` file |
| The real house the builders make from the blueprint | The DOM, which the browser builds from your HTML |
| A renovation crew that repaints walls and adds shelves while people live there | JavaScript, changing the DOM while the page is open |
| Knocking the house down and rebuilding it from the blueprint | Refreshing the page |

Notice the last row. JavaScript changes the *house*, never the *blueprint*. When you refresh the page, the browser builds a fresh DOM from your HTML file, and every change your script made is gone, until the script runs again.

## How it works

### Just enough HTML

You don't need to be an HTML expert for this course, but you do need to read it. Here's the minimum.

HTML is made of **tags**: words inside angle brackets. Most come in pairs, an opening tag and a closing tag with a `/`:

```html
<p>Fresh bread every morning.</p>
```

The whole thing (opening tag, content, closing tag) is an **element**. This one is a `p` element, a paragraph.

Elements can sit inside other elements, like boxes inside boxes:

```html
<ul>
  <li>Milk</li>
  <li>Eggs</li>
</ul>
```

`ul` means "unordered list" (a list with bullet points), and each `li` is a "list item". The indentation is only there to make it easier for humans to read.

**Attributes** add extra information to an element. They go inside the opening tag, as `name="value"`:

```html
<a href="https://www.wikipedia.org">Wikipedia</a>
<img src="cat.jpg" alt="A cat asleep on a keyboard">
```

`href` tells a link where to go. `src` tells an image which file to show, and `alt` describes the image for people who can't see it. Some elements, like `img`, have no content, so they have no closing tag.

Two attributes matter a lot for JavaScript:

- **`id`** gives one element a unique name, like a passport number. No two elements on a page should share an `id`.
- **`class`** puts an element in a group, like a team shirt. Many elements can share a class, and one element can have several, separated by spaces: `class="card featured"`.

```html
<h1 id="shop-name">Bella's Bakery</h1>
<p class="price">$3.50</p>
<p class="price sale">$2.00</p>
```

These elements are enough for this chapter:

| Element | What it is |
|---|---|
| `<h1>` to `<h6>` | Headings, from biggest (`h1`) to smallest |
| `<p>` | A paragraph of text |
| `<a href="...">` | A link |
| `<img src="..." alt="...">` | An image |
| `<ul>` and `<li>` | A bullet list and its items (`<ol>` makes a numbered list) |
| `<button>` | A button |
| `<div>` | A plain box for grouping other elements |
| `<span>` | A plain wrapper for a few words inside a line of text |

### The page skeleton

Every web page has the same basic shape:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Bella's Bakery</title>
    <script src="script.js" defer></script>
  </head>
  <body>
    <h1 id="shop-name">Bella's Bakery</h1>
    <p id="message">Fresh bread every morning.</p>
  </body>
</html>
```

| Part | What it does |
|---|---|
| `<!DOCTYPE html>` | Tells the browser "this is a modern HTML page". Always the first line. |
| `<html lang="en">` | Wraps the whole page. `lang="en"` says the page is in English. |
| `<head>` | Information *about* the page. Nothing in here shows up on the page itself. |
| `<meta charset="UTF-8">` | Makes sure every character displays properly, from `é` to emoji. |
| `<title>` | The text on the browser tab. |
| `<script src="script.js" defer>` | Loads your JavaScript file. You'll see what `defer` does in a moment. |
| `<body>` | Everything you actually see on the page. |

### A tiny bit of CSS

CSS controls how things look. In this course, you'll see small bits of it inside a `<style>` tag in the `<head>`:

```html
<style>
  .sale { color: red; }
  #shop-name { font-size: 40px; }
</style>
```

Each rule starts with a **selector** that picks which elements it applies to. `.sale` (with a dot) means "every element with the class `sale`". `#shop-name` (with a hash) means "the element with the id `shop-name`". Then, inside the curly braces, come the looks: here, red text and big letters.

Remember those selectors. JavaScript uses exactly the same ones to find elements.

### Your first page with JavaScript

Let's set up a page to practice on. You'll use these same steps for every browser exercise.

**Step 1: Make the files.** In VS Code, inside this chapter's folder, create a folder called `playground`. Inside it, create a file called `index.html` and put the page skeleton from above in it. (Copying and pasting HTML is fine. Save your typing practice for the JavaScript.) Then create a second file, `script.js`, in the same folder:

```js
console.log("Hello from script.js!");
```

Save both files.

**Step 2: Open the page.** In VS Code, right-click `index.html` and choose **Reveal in File Explorer**. Then double-click `index.html`. It opens in your web browser, showing "Bella's Bakery" in big letters. (If it opens in the wrong program, right-click it, choose **Open with**, and pick Chrome or Microsoft Edge.)

**Step 3: Open the console.** Press `F12` and click the **Console** tab, like in chapter 01. You'll see:

```
Hello from script.js!
```

That message came from your `script.js` file. Your JavaScript is connected to your page! 🎉

**Step 4: The everyday loop.** From now on, you'll work like this:

1. Change `script.js` in VS Code.
2. Save it (`Ctrl + S`).
3. Refresh the browser (`F5`). The browser doesn't notice your changes by itself.
4. Check the page, and check the Console for errors.

A few things worth knowing:

- The address bar shows something like `file:///C:/Users/.../playground/index.html`. `file://` means the page came from your own computer, not from the internet. That's fine for now.
- Errors show up in red in the Console, with the file name and line number on the right. Click them to jump straight to the line.
- You can type JavaScript straight into the Console, and it runs on your page. Try typing `document.title` and pressing `Enter`: the console answers with the text from the `<title>` tag.

### `defer`: wait for the page first

The browser reads your HTML from top to bottom, building the page as it goes. When it meets a normal `<script>` tag, it stops and runs that script immediately. In the `<head>`, that's too early: the `<body>` hasn't been built yet, so your script can't find anything on the page.

`defer` fixes that. It means: "download this script now, but don't run it until the whole page has been read." It's like a painter who waits until the walls are up before starting to paint.

In older code, you'll often see the `<script>` tag at the very end of the `<body>` instead. That works for the same reason. This course always uses `defer` in the `<head>`.

### The DOM: a family tree of objects

When the browser reads your HTML, it builds a tree of objects, one for every element. For the skeleton page above, the tree looks like this:

```
document
└── html
    ├── head
    │   ├── meta
    │   ├── title
    │   └── script
    └── body
        ├── h1
        └── p
```

It's a family tree. `body` is the **parent** of `h1` and `p`. They are its **children**, and they're **siblings** of each other, because they share a parent.

Each item in the tree is called a **node**. The nodes made from tags are **elements**, and the text inside them gets small text nodes of its own. In this chapter, you'll work with elements.

At the very top sits **`document`**: an object that represents the whole page. It's your starting point for everything in this chapter.

> **Tip:** In DevTools, click the **Elements** tab to see this tree for real. You can open and close each part. Right-click anything on the page and choose **Inspect** to jump straight to its element. When your script changes the page, the Elements tab shows the change. But **View page source** (`Ctrl + U`) shows your original HTML file: the blueprint, not the house.

### Finding elements

Before you can change an element, you need to find it. For the rest of this chapter, use this `<body>` in your playground page. Try each example on its own: replace what's in `script.js` (or turn the older lines into comments), save, and refresh.

```html
<body>
  <h1 id="shop-name">Bella's Bakery</h1>
  <p id="message">Fresh bread every morning.</p>
  <ul id="menu">
    <li class="item">Sourdough loaf</li>
    <li class="item sale">Croissant</li>
    <li class="item">Cinnamon roll</li>
  </ul>
</body>
```

**`getElementById`** finds the one element with that `id`:

```js
const heading = document.getElementById("shop-name");
console.log(heading.textContent); // prints: Bella's Bakery
```

(`textContent` is the text inside an element. More on it in a moment.)

**`querySelector`** finds the first element that matches a CSS selector, the same kind you saw in the `<style>` tag:

```js
const firstItem = document.querySelector(".item");
console.log(firstItem.textContent); // prints: Sourdough loaf

const onSale = document.querySelector("li.sale");
console.log(onSale.textContent); // prints: Croissant
```

| Selector | Finds |
|---|---|
| `"#menu"` | the element with `id="menu"` |
| `".item"` | elements with the class `item` |
| `"li"` | `<li>` elements |
| `"#menu li"` | `<li>` elements anywhere inside `#menu` |
| `"li.sale"` | `<li>` elements that also have the class `sale` |

Notice that `getElementById` takes just the name (`"shop-name"`), while `querySelector` needs the `#` (`"#shop-name"`). Mixing those up is a classic mistake.

**`querySelectorAll`** finds *all* the matches:

```js
const items = document.querySelectorAll(".item");
console.log(items.length); // prints: 3

for (const item of items) {
  console.log(item.textContent);
}
```

You'll see:

```
Sourdough loaf
Croissant
Cinnamon roll
```

`querySelectorAll` gives you a **NodeList**: a list of elements. You can loop over it with `for...of` or `forEach`, and it has a `length`. But it isn't a real array, so methods like `map` and `filter` aren't there. If you need them, turn it into an array first with `Array.from()` ([chapter 13](../13-array-methods/notes.md)):

```js
const names = Array.from(items).map((item) => item.textContent);
console.log(names.join(", ")); // prints: Sourdough loaf, Croissant, Cinnamon roll
```

You can also search *inside* an element, instead of the whole page: `menu.querySelector("li")` only looks inside `menu`.

If nothing matches, `getElementById` and `querySelector` give you `null`. Try to use that `null`, and you'll see an error like this in the Console:

```js
const cake = document.querySelector(".cake"); // there's no .cake on the page
cake.textContent = "Chocolate cake";
// Uncaught TypeError: Cannot set properties of null (setting 'textContent')
```

When you see `null` in an error like that, your selector didn't find anything. Check the spelling, the `#` or `.`, and that your script has `defer`.

### Changing text with `textContent`

`textContent` reads the text inside an element. Set it, and you replace everything inside with new text:

```js
const message = document.getElementById("message");
console.log(message.textContent); // prints: Fresh bread every morning.

message.textContent = "Sorry, we're sold out of bread today!";
```

Save, refresh the page, and the paragraph now says "Sorry, we're sold out of bread today!". Template literals ([chapter 06](../06-strings/notes.md)) make it easy to mix in values:

```js
const loavesLeft = 4;
message.textContent = `Only ${loavesLeft} loaves left today!`;
```

`textContent` always treats what you give it as plain text. If you set it to `"<b>Hello</b>"`, the page shows those exact characters, angle brackets and all. That might sound like a limitation, but it's actually a safety feature, as you're about to see.

(You'll also see `innerText` in tutorials. It's similar, but `textContent` is simpler and faster, so this course uses it.)

### `innerHTML`, and why to be careful

`innerHTML` is like `textContent`, but it reads your string as HTML and builds real elements from it:

```js
const menu = document.getElementById("menu");
menu.innerHTML = "<li>Baguette</li><li>Bagel</li>";
```

The menu now has two items, Baguette and Bagel, and the old ones are gone.

> **Watch out:** never put anything a user typed (or anything that came from another website) into `innerHTML`. Someone could type HTML that contains their own JavaScript, and your page would run it. This kind of attack is called **XSS** (cross-site scripting), and it's one of the most common security holes on the web. You'll learn the full story in [chapter 51](../51-security-basics/notes.md). Until then, the rule is simple: use `textContent` for text, and `createElement` (coming up soon) for new elements.

### Changing styles: `style` vs. classes

Every element has a `style` property for changing its looks directly:

```js
const heading = document.getElementById("shop-name");
heading.style.color = "darkred";
heading.style.backgroundColor = "lightyellow";
heading.style.fontSize = "48px";
```

Two details: CSS names with dashes become camelCase (`background-color` becomes `backgroundColor`), and the values are strings, with units like `"px"` included.

That works, but there's usually a better way: describe the looks in CSS, and let JavaScript switch **classes** on and off. Add this inside the `<head>` of your playground page:

```html
<style>
  .highlight { background-color: gold; }
  .hidden { display: none; }
</style>
```

(`display: none` hides an element completely.) Now use `classList`:

```js
const croissant = document.querySelector(".sale");
croissant.classList.add("highlight"); // gold background
croissant.classList.remove("sale");
console.log(croissant.classList.contains("sale")); // prints: false

const message = document.getElementById("message");
message.classList.toggle("hidden"); // hidden now
message.classList.toggle("hidden"); // visible again
```

| Method | What it does |
|---|---|
| `classList.add("name")` | Adds the class |
| `classList.remove("name")` | Removes the class |
| `classList.toggle("name")` | Adds it if it's missing, removes it if it's there |
| `classList.contains("name")` | `true` if the element has the class, otherwise `false` |

Why are classes better?

- The looks stay in CSS, where they belong. JavaScript only says *what* something is: "on sale", "hidden", "selected".
- One class can change lots of properties at once.
- Undoing is easy: remove the class, and the element goes back to normal.

Keep `style` for values your code calculates, like the width of a progress bar:

```js
bar.style.width = `${percent}%`; // bar is an element, percent is a number like 65
```

### Attributes

Remember attributes, like `href` and `src`? You can read and change them too. Add these to your playground's `<body>` to try it:

```html
<a id="order-link" href="order.html">Order online</a>
<img id="photo" src="croissant.jpg" alt="A golden croissant">
<button id="order-button">Order now</button>
```

`getAttribute` and `setAttribute` work with any attribute:

```js
const link = document.getElementById("order-link");
console.log(link.getAttribute("href")); // prints: order.html

link.setAttribute("href", "https://example.com/order");
```

Most common attributes are also properties with the same name, which is shorter to write:

```js
const photo = document.getElementById("photo");
photo.src = "cinnamon-roll.jpg";
photo.alt = "A cinnamon roll with icing";

const button = document.getElementById("order-button");
button.disabled = true; // the button turns grey and can't be clicked
```

On/off attributes, like `disabled`, become `true`/`false` properties.

One difference to know about: a property like `link.href` or `photo.src` gives you the *full* address, like `file:///C:/Users/.../order.html`. `getAttribute` gives you exactly what's written in the HTML, like `order.html`.

You can also invent your own attributes to store extra information on an element, as long as their names start with `data-`. For example, an "Add" button can remember which product it adds. JavaScript reads these through `dataset`:

```html
<button id="add-croissant" data-id="3" data-price="2.50">Add a croissant</button>
```

```js
const addButton = document.getElementById("add-croissant");
console.log(addButton.dataset.id);    // prints: 3
console.log(addButton.dataset.price); // prints: 2.50
```

Attribute values are always strings, so `addButton.dataset.price` is the string `"2.50"`. Convert it with `Number()` before doing math ([chapter 05](../05-numbers-and-math/notes.md)). You'll find `data-` attributes very handy in the next chapter.

### Creating and removing elements

To add something new to the page, create an element, fill it in, then put it somewhere:

```js
const menu = document.getElementById("menu");

const newItem = document.createElement("li"); // a new <li>, not on the page yet
newItem.textContent = "Apple pie";
newItem.classList.add("item");

menu.append(newItem); // now it's on the page, at the end of the list
```

`createElement` makes a brand-new element that isn't on the page yet. It's like a new shelf still sitting in the delivery van. Nothing shows up until you put it somewhere.

| Method | What it does |
|---|---|
| `parent.append(child)` | Puts `child` inside `parent`, at the end |
| `parent.prepend(child)` | Puts `child` inside `parent`, at the start |
| `element.remove()` | Takes `element` off the page |

```js
const special = document.createElement("li");
special.textContent = "Today only: Pumpkin bread";
menu.prepend(special); // goes to the top of the list

const croissant = document.querySelector(".sale");
croissant.remove(); // sold out, so it's gone
```

You'll also see `appendChild` in older code. It's the older version of `append`.

### Rendering a list from an array

Here's the pattern you'll use more than anything else in this chapter: take an array of data and turn it into elements on the page. This is called **rendering**.

```js
const breads = [
  { name: "Sourdough loaf", price: 6.5, onSale: false },
  { name: "Croissant", price: 2.5, onSale: true },
  { name: "Cinnamon roll", price: 3.25, onSale: false },
  { name: "Baguette", price: 3, onSale: true },
];

function renderMenu(items) {
  const menu = document.getElementById("menu");
  menu.textContent = ""; // clear out whatever was there

  for (const item of items) {
    const li = document.createElement("li");
    li.textContent = `${item.name}: $${item.price.toFixed(2)}`;
    if (item.onSale) {
      li.classList.add("sale");
    }
    menu.append(li);
  }
}

renderMenu(breads);
```

The list on the page now shows:

```
• Sourdough loaf: $6.50
• Croissant: $2.50
• Cinnamon roll: $3.25
• Baguette: $3.00
```

The croissant and the baguette also get the `sale` class, so a CSS rule like `.sale { color: red; }` would make them stand out.

Why put it in a function? Because whenever the data changes, you can call `renderMenu` again, and the page catches up. Setting `textContent` to `""` first empties the list, so nothing shows up twice. And because it takes any array, it works with your array methods from chapter 13 too. `renderMenu(breads.filter((bread) => bread.onSale))` shows only the bargains.

Right now, the page changes only once: when your script runs. To make it react when someone clicks or types, you need *events*, and that's the next chapter.

## Common mistakes

**1. Forgetting `defer`**

```html
<script src="script.js"></script>
```

Without `defer`, the script runs before the `<body>` exists, so every search for an element comes back `null`, and the Console shows an error like this one:

```
Uncaught TypeError: Cannot set properties of null (setting 'textContent')
```

Add `defer`: `<script src="script.js" defer></script>`.

**2. Mixing up `#`, `.`, and plain names**

```js
const total = document.querySelector("total"); // looks for a <total> tag!
total.textContent = "$12.00";
// Uncaught TypeError: Cannot set properties of null (setting 'textContent')
```

`querySelector` needs a CSS selector: `"#total"` for an `id`, `".total"` for a class. `getElementById` is the other way round: it wants the plain name, `"total"`, and `getElementById("#total")` finds nothing.

**3. Treating a list of elements like a single element**

```js
const prices = document.querySelectorAll(".price");
prices.textContent = "SOLD OUT"; // no error... and nothing changes!
```

`querySelectorAll` gives you a NodeList, not an element, so setting `textContent` on it does nothing useful. JavaScript doesn't even complain. Loop over the list and change each element:

```js
for (const price of prices) {
  price.textContent = "SOLD OUT";
}
```

**4. Creating an element but never adding it**

```js
const li = document.createElement("li");
li.textContent = "Brownie";
// ...and the brownie never shows up
```

A new element stays in the delivery van until you put it on the page. Don't forget `menu.append(li);`.

**5. Wiping out classes with `className`**

```js
const croissant = document.querySelector(".sale");
croissant.className = "highlight"; // "item" and "sale" are gone!
```

`className` holds the whole class list as one string, so setting it replaces every class the element had. Use `classList.add("highlight")` to add one class and keep the rest.

## Quick recap

- HTML is made of elements with attributes. `id` names one element; `class` groups many. The browser turns your HTML into the DOM: a family tree of objects that JavaScript can change.
- Connect your script with `<script src="script.js" defer></script>` in the `<head>`. Open `index.html` by double-clicking it, use `F12` to see the Console, and refresh after every change.
- Find elements with `getElementById`, `querySelector`, and `querySelectorAll` (a NodeList you can loop over). If nothing matches, you get `null`.
- Change text with `textContent`. Keep `innerHTML` away from anything a user typed.
- Prefer `classList.add/remove/toggle/contains` over `style`, and use attributes like `src`, `href`, `disabled`, and `data-*` for extra information.
- Create elements with `createElement`, add them with `append` or `prepend`, and take them away with `remove`. Rendering an array is a loop that does exactly that.

---

**Next:** try the [exercises](exercises.md), then move on to [21 Events](../21-events/notes.md).
