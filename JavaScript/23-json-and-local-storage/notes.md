# 23 JSON and Local Storage

## What is it?

**JSON** (short for JavaScript Object Notation, and usually said like the name "Jason") is a way to write data as plain text. Objects, arrays, numbers and strings get written out as characters, so they can be saved in a file or sent across the internet.

**Local storage** is a small storage space that the browser gives your web page. Whatever you put in it stays there, even after the tab is closed.

Together, they let your apps remember things.

## Why does it matter?

Right now, everything your code creates disappears when the page reloads. Build a shopping list in the browser, press `F5`, and it's gone. Real apps need to remember: your to-do list, your high score, your favorite settings.

Data also needs to travel. A weather app gets its forecast from a server. A game saves your progress to a file. Your phone and your laptop show the same account. The programs on each end might be written in different languages, so they need a format that everyone understands.

JSON is that format, and you'll meet it everywhere:

- data from web APIs ([chapter 33](../33-fetch-and-apis/notes.md)),
- settings files, like the `package.json` file in [chapter 50](../50-tooling/notes.md),
- saving your app's data in the browser (this chapter).

## Real-world example

Before shipping containers existed, every ship, port and truck packed cargo its own way. Loading one ship could take days. Then the world agreed on one standard steel box. Now any crane in any port can lift it onto any ship, train or truck.

JSON is the standard shipping container for data. JavaScript, Python, Java, your phone, a server on the other side of the world: they can all pack it and unpack it.

| Shipping | Data |
|---|---|
| Your things: a sofa, boxes of books | Your JavaScript objects and arrays |
| Packing them into the standard container | `JSON.stringify()` |
| The sealed container, ready to travel | A JSON string |
| Unpacking at the other end | `JSON.parse()` |
| Things you're not allowed to ship, like a lit candle | Functions and `undefined` don't survive the trip |
| A storage unit where you keep the container | `localStorage` |

## How it works

### What JSON looks like

Here's a library book, written as JSON:

```json
{
  "title": "The Hobbit",
  "author": "J.R.R. Tolkien",
  "year": 1937,
  "available": true,
  "tags": ["fantasy", "classic"],
  "borrowedBy": null
}
```

It looks almost exactly like a JavaScript object from [chapter 11](../11-objects/notes.md). That's where the name comes from. But JSON is stricter:

| | JSON | JavaScript |
|---|---|---|
| Keys | Always in double quotes: `"title"` | Quotes are optional: `title` |
| Text | Double quotes only: `"The Hobbit"` | `"..."`, `'...'` or backticks |
| Values allowed | Strings, numbers, `true`, `false`, `null`, arrays, objects | Anything, including functions and `undefined` |
| A comma after the last item | Not allowed | Allowed |
| Comments | Not allowed | Allowed |

And the most important difference: JSON is **text**. It's a string that *describes* data. Before your code can use it, you have to turn it into real objects and arrays. That's what the two JSON functions are for.

### From data to JSON: `JSON.stringify`

`JSON.stringify()` packs a value into a JSON string. The JSON parts of this chapter run in Node, so save this as `json.js` and run it with `node json.js`:

```js
const book = { title: "The Hobbit", year: 1937, available: true };
const json = JSON.stringify(book);

console.log(json);        // prints: {"title":"The Hobbit","year":1937,"available":true}
console.log(typeof json); // prints: string
```

That's one long line with no spaces. Great for computers, hard for people. Give `JSON.stringify` two more arguments, and it **pretty-prints** the JSON over several lines:

```js
console.log(JSON.stringify(book, null, 2));
```

You'll see:

```
{
  "title": "The Hobbit",
  "year": 1937,
  "available": true
}
```

The `2` means "indent with 2 spaces". The `null` in the middle is for an extra option you'll rarely need, so just pass `null`.

Arrays work too:

```js
const scores = [98, 87, 100];
console.log(JSON.stringify(scores)); // prints: [98,87,100]
```

### From JSON back to data: `JSON.parse`

`JSON.parse()` does the opposite. It unpacks a JSON string into real objects and arrays:

```js
const text = '{"name":"Mia","level":7,"badges":["speedy","explorer"]}';
const player = JSON.parse(text);

console.log(player.name);          // prints: Mia
console.log(player.level + 1);     // prints: 8
console.log(player.badges.length); // prints: 2
```

`player.level` is a real number, so `+ 1` does math. And `player.badges` is a real array. JSON remembers which values are numbers, booleans or strings, unlike the form values in [chapter 22](../22-forms/notes.md), which are always strings.

Why the single quotes around `text`? JSON needs double quotes inside, so single quotes on the outside stop the first `"` from ending the string. It's one of the few places where single quotes are the easy choice. In real apps, you'll rarely type JSON by hand anyway. It usually comes from a server, a file, or storage.

### When the JSON is broken

Data from outside your code isn't always in good shape. A file gets cut off halfway, someone edits it by hand, or a server sends an error page instead of data.

`JSON.parse()` can't guess what broken JSON was meant to say, so it throws a `SyntaxError`:

```js
JSON.parse('{"name": "Mia", "level": 7,}');
// SyntaxError: Expected double-quoted property name in JSON at position 27 (line 1 column 28)
```

The comma after `7` is the problem: JSON expected another `"name"` after it. The message even tells you where. Position 27 is counted from 0, like string indexes in [chapter 06](../06-strings/notes.md).

You can't control data that comes from outside, so wrap `JSON.parse()` in `try`/`catch` from [chapter 18](../18-error-handling/notes.md). Here's a game loading a save file that got cut off:

```js
const savedGame = '{"level": 7, "coins": 120'; // the end is missing

try {
  const game = JSON.parse(savedGame);
  console.log(`Welcome back! You're on level ${game.level}.`);
} catch (error) {
  console.log(`Couldn't load your save: ${error.message}`);
  console.log("Starting a new game instead.");
}
```

You'll see:

```
Couldn't load your save: Expected ',' or '}' after property value in JSON at position 25 (line 1 column 26)
Starting a new game instead.
```

The broken save doesn't crash the game. It starts a fresh one instead.

Here's what Node says about a few other classic mistakes:

| Broken JSON | What's wrong | Node's error message |
|---|---|---|
| `{'name': 'Mia'}` | Single quotes | `Expected property name or '}' in JSON at position 1 (line 1 column 2)` |
| `{name: "Mia"}` | A key without quotes | `Expected property name or '}' in JSON at position 1 (line 1 column 2)` |
| `[1, 2,]` | A comma after the last item | `Unexpected token ']', "[1, 2,]" is not valid JSON` |
| an empty string | Nothing to read at all | `Unexpected end of JSON input` |

### What doesn't survive the trip

JSON only knows strings, numbers, booleans, `null`, arrays and plain objects. Anything else changes or disappears when you stringify it. Here's a hotel booking:

```js
const booking = {
  guest: "Omar",
  nights: 3,
  checkIn: new Date("2026-10-01T14:00:00Z"),
  notes: undefined,
  greet() {
    return `Welcome, ${this.guest}!`;
  },
};

const copy = JSON.parse(JSON.stringify(booking));
console.log(copy);
```

You'll see:

```
{ guest: 'Omar', nights: 3, checkIn: '2026-10-01T14:00:00.000Z' }
```

`notes` and `greet` are gone, and `checkIn` has turned into a string.

| Value | After a trip through JSON |
|---|---|
| Strings, numbers, `true`/`false`, `null` | Stay the same |
| Arrays and plain objects | Stay the same (as brand-new copies) |
| Dates | Turn into ISO strings, like `"2026-10-01T14:00:00.000Z"` |
| `undefined` | The property disappears |
| Functions and methods | Disappear |
| `NaN` and `Infinity` | Turn into `null` |

The date is the sneaky one. It looks fine when you print it, but it's a string now:

```js
console.log(typeof copy.checkIn); // prints: string
copy.checkIn.getFullYear();
// TypeError: copy.checkIn.getFullYear is not a function
```

The fix is the one from [chapter 19](../19-dates-and-times/notes.md): turn the string back into a date with `new Date()`.

```js
const checkIn = new Date(copy.checkIn);
console.log(checkIn.getFullYear()); // prints: 2026
```

This is also why [chapter 16](../16-values-vs-references/notes.md) called `JSON.parse(JSON.stringify(obj))` a limited way to copy objects. For copying, `structuredClone` is the better tool. JSON is for saving and sending data.

### Saving data in the browser: `localStorage`

Now for the storage unit. **`localStorage`** is a small storage space the browser keeps for each website. What you save stays there when the page reloads, when the tab closes, and even when the computer restarts, until your code (or the user) removes it.

It works like a wall of labeled lockers. You put a value in under a **key** (a name you choose), and later you get it back with the same key.

`localStorage` only exists in the browser. In Node, you'd get `ReferenceError: localStorage is not defined`. So try the next examples in a practice page like the `playground` from [chapter 20](../20-dom-basics/notes.md), in its `script.js` or straight in the Console.

```js
localStorage.setItem("theme", "dark");      // save "dark" under the key "theme"
console.log(localStorage.getItem("theme")); // prints: dark

localStorage.removeItem("theme");           // delete that one item
console.log(localStorage.getItem("theme")); // prints: null

localStorage.clear(); // delete everything this site has saved
```

| Method | What it does |
|---|---|
| `setItem(key, value)` | Saves `value` under `key`, replacing anything already there |
| `getItem(key)` | Gives back the saved value, or `null` if nothing is saved under that key |
| `removeItem(key)` | Deletes one item |
| `clear()` | Deletes every item this site has saved |

Now the part that feels like magic. Put these two lines in `script.js`:

```js
console.log("Saved name:", localStorage.getItem("player-name"));
localStorage.setItem("player-name", "Mia");
```

The first time you open the page, the Console says `Saved name: null`. Refresh, and it says `Saved name: Mia`. Close the browser, open the page again, and it still says `Saved name: Mia`. The value survived.

**See it in DevTools:** press `F12`, open the **Application** tab (click `>>` if you can't see it), and under **Storage**, open **Local storage**. You'll see every key and value your page has saved. You can edit or delete them there too, which is handy for testing.

Every website gets its own storage, so a page on one site can't read what another site saved.

> **Tip:** In Chrome and Edge, the pages you open straight from your computer (`file://`) can all share one storage. Give your keys clear, specific names, like `"player-name"` or `"cinema-watchlist"`, instead of just `"data"`. Then your practice pages won't overwrite each other.

### Storage only holds strings

`localStorage` can only store **strings**. Anything else gets turned into a string on the way in:

```js
localStorage.setItem("coins", 120);
const coins = localStorage.getItem("coins");

console.log(typeof coins); // prints: string
console.log(coins + 10);   // prints: 12010
```

That's the same trap as form values in chapter 22. Objects are even worse:

```js
const settings = { volume: 7, music: true };
localStorage.setItem("settings", settings);
console.log(localStorage.getItem("settings")); // prints: [object Object]
```

`[object Object]` is what JavaScript writes when it turns an object into a string without JSON. Your settings are lost.

This is where the two ideas come together. Stringify before you save, and parse after you load:

```js
localStorage.setItem("settings", JSON.stringify(settings));

const savedSettings = JSON.parse(localStorage.getItem("settings"));
console.log(savedSettings.volume); // prints: 7
```

JSON is the container, and `localStorage` is the storage unit: pack, store, unpack.

### A reusable pattern: load with a default value

Every time you load saved data, two things can go wrong:

1. **Nothing is saved yet.** On someone's very first visit, `getItem` gives you `null`.
2. **The saved text is broken.** Someone edited it in DevTools, or an older version of your app saved it in a different shape.

Instead of handling both problems every time, write two small helper functions once, and reuse them in every project:

```js
function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function load(key, defaultValue) {
  const text = localStorage.getItem(key);
  if (text === null) {
    return defaultValue; // nothing saved yet
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error(`Couldn't read "${key}", so the default was used.`, error.message);
    return defaultValue; // the saved data was broken
  }
}
```

`load` always gives you something you can use: the saved value if there is one, or your default if there isn't. And it doesn't hide problems. `console.error` still reports broken data, because an error should never vanish silently (chapter 18).

Here's a visit counter that uses them:

```js
const visits = load("visit-count", 0) + 1;
save("visit-count", visits);
console.log(`Visit number ${visits}`);
```

Open the page, and you'll see `Visit number 1`. Refresh: `Visit number 2`. Refresh again: `Visit number 3`. The number comes back as a real number, because JSON keeps the types.

Now break it on purpose. In the Console, type `localStorage.setItem("visit-count", "oops")` and refresh. Instead of crashing, the page starts again from `Visit number 1`, and a red message in the Console explains why:

```
Couldn't read "visit-count", so the default was used. Unexpected token 'o', "oops" is not valid JSON
```

The default value matters most for lists:

```js
const watchlist = load("cinema-watchlist", []);
console.log(watchlist.length); // prints: 0 (on the first visit)
```

Because the default is `[]`, you can `push` to `watchlist` or loop over it straight away, even on the first visit. With no default, `load` would give you `undefined`, and `watchlist.push("Dune")` would crash with `TypeError: Cannot read properties of undefined (reading 'push')`.

### `sessionStorage`: storage that forgets

**`sessionStorage`** has exactly the same methods as `localStorage`, but it forgets everything when the tab is closed. A **session** is one visit: from opening a tab to closing it.

```js
sessionStorage.setItem("checkout-step", "2");
console.log(sessionStorage.getItem("checkout-step")); // prints: 2
```

| | `localStorage` | `sessionStorage` |
|---|---|---|
| Survives a refresh | Yes | Yes |
| Survives closing the tab | Yes | No |
| Shared between tabs of the same site | Yes | No, each tab has its own |

Use `sessionStorage` for things that only matter during one visit: which step of the checkout you're on, a half-filled form, or a banner the user has already closed. Use `localStorage` for things that should still be there tomorrow.

### Limits, and what not to store

- **It's small.** Browsers give each site around 5 MB, depending on the browser. That's plenty for settings and lists, but not for photos or videos. When it's full, `setItem` throws an error.
- **It's not secret.** Anyone using the computer can read it in DevTools, and so can any script running on your page. Never store passwords, credit card numbers or login tokens there. [Chapter 51](../51-security-basics/notes.md) explains the safer options.
- **It can vanish.** Users can clear their browser data at any time, and private windows forget everything when they close. Your app must still work when storage is empty. The default value in `load` takes care of that.
- **It stays on one device.** A list saved in Chrome on your laptop won't show up on your phone. Sharing data between devices needs a server, which is a story for later.

## Common mistakes

**1. Saving an object without `JSON.stringify`**

```js
localStorage.setItem("cart", { items: 3 });
console.log(localStorage.getItem("cart")); // prints: [object Object]
```

The object was turned into the useless string `"[object Object]"`. Fix: `localStorage.setItem("cart", JSON.stringify({ items: 3 }));`, or use your `save` helper.

**2. Forgetting `JSON.parse` when loading**

```js
localStorage.setItem("cart", JSON.stringify({ items: 3 }));
const cart = localStorage.getItem("cart");
console.log(cart.items); // prints: undefined
```

`cart` is still the string `'{"items":3}'`, and a string has no `items` property. Fix: `JSON.parse(localStorage.getItem("cart"))`, or use your `load` helper.

**3. Parsing without `try`/`catch`**

```js
const cart = JSON.parse(localStorage.getItem("cart"));
// SyntaxError: "[object Object]" is not valid JSON
```

One bad save (like the one from mistake 1) and your app crashes every time it starts, until the user clears their storage. Fix: wrap `JSON.parse` in `try`/`catch`, or use `load`, which does it for you.

**4. Writing JSON by hand like a JavaScript object**

```js
JSON.parse("{ name: 'Mia', level: 7, }");
// SyntaxError: Expected property name or '}' in JSON at position 2 (line 1 column 3)
```

JSON is stricter than JavaScript. Keys and strings need double quotes, and there's no comma after the last item. Fix: `'{"name": "Mia", "level": 7}'`. Even better, build a real object and let `JSON.stringify` write the JSON for you.

**5. Expecting a date to come back as a date**

```js
save("last-order", { placedAt: new Date("2026-03-14T09:30:00Z") });
const order = load("last-order", null);
console.log(order.placedAt.getFullYear());
// TypeError: order.placedAt.getFullYear is not a function
```

Dates come back as ISO strings. Fix: turn it back into a date first, with `new Date(order.placedAt).getFullYear()`.

## Quick recap

- JSON is text that describes data. Its rules are strict: double quotes, no functions, no comma after the last item, no comments.
- `JSON.stringify(value)` packs data into a JSON string (add `null, 2` to pretty-print it). `JSON.parse(text)` unpacks it again.
- Wrap `JSON.parse` in `try`/`catch`, because data from outside can be broken.
- On the way through JSON, dates become strings, and functions and `undefined` disappear.
- `localStorage` keeps strings, even after the browser closes: `setItem`, `getItem`, `removeItem`, `clear`. Use JSON for objects and arrays. `sessionStorage` works the same way, but forgets when the tab closes.
- Use a `load(key, defaultValue)` helper, and never store passwords or tokens.

---

**Next:** try the [exercises](exercises.md), then move on to [24 Project: To-Do List App](../24-project-todo-app/notes.md).
