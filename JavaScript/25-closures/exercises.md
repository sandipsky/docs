# 25 Closures: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.js`, `ex2.js`, and so on).
- Run each one with `node ex1.js`.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Ticket machine

A supermarket has a ticket machine at the deli counter and another at the bakery. Each one gives out numbered tickets with its own letter in front.

Write a function `createTicketMachine(prefix)` that returns a function. Each time you call the returned function, it gives the next ticket for that machine.

Test it with this code:

```js
const deli = createTicketMachine("D");
const bakery = createTicketMachine("B");

console.log(deli());
console.log(deli());
console.log(bakery());
console.log(deli());
console.log(bakery());
```

Expected output:

```
D1
D2
B1
D3
B2
```

**Rule:** no global counter variables. Each machine must keep its own count.

<details>
<summary>Hint</summary>

Start from `createCounter` in the notes. What needs to change so the returned value is a string with the prefix in front?

</details>

**Bonus:** make the tickets look like `D-001`, `D-002`, and so on. `padStart` from [chapter 06](../06-strings/notes.md) will help.

---

## Exercise 2 (Easy): Price tag makers

An online shop sells to customers in different countries. Each country needs prices shown with its own currency symbol and always two decimal places.

Write a function factory `makePriceFormatter(symbol)`. It returns a function that takes a number and returns the formatted price as a string.

Test it with this code:

```js
const formatDollars = makePriceFormatter("$");
const formatEuros = makePriceFormatter("€");
const formatRupees = makePriceFormatter("Rs ");

console.log(formatDollars(4.5));
console.log(formatEuros(12));
console.log(formatRupees(1250));
console.log([3, 7.25, 10].map(formatDollars));
```

Expected output:

```
$4.50
€12.00
Rs 1250.00
[ '$3.00', '$7.25', '$10.00' ]
```

<details>
<summary>Hint 1</summary>

Look at `makeDiscount` in the notes. Your factory has the same shape: take a setting, return an arrow function that uses it.

</details>

<details>
<summary>Hint 2</summary>

`toFixed(2)` from [chapter 05](../05-numbers-and-math/notes.md) gives you exactly two decimal places, as a string.

</details>

---

## Exercise 3 (Medium): Free trial

A photo-editing app lets free users try its best features a few times before asking them to upgrade.

Write a helper `limitUses(fn, maxUses)`. It returns a new function that:

- runs `fn` (and returns its result) for the first `maxUses` calls,
- after that, returns `"Trial over. Please upgrade."` without running `fn` at all.

Test it with this code:

```js
function exportPhoto(fileName) {
  return `Exported ${fileName} in HD`;
}

function resizePhoto(fileName, width) {
  return `Resized ${fileName} to ${width}px`;
}

const trialExport = limitUses(exportPhoto, 3);
const trialResize = limitUses(resizePhoto, 1);

console.log(trialExport("beach.jpg"));
console.log(trialExport("mountain.jpg"));
console.log(trialResize("cat.jpg", 800));
console.log(trialExport("family.jpg"));
console.log(trialExport("sunset.jpg"));
console.log(trialResize("dog.jpg", 1200));
```

Expected output:

```
Exported beach.jpg in HD
Exported mountain.jpg in HD
Resized cat.jpg to 800px
Exported family.jpg in HD
Trial over. Please upgrade.
Trial over. Please upgrade.
```

**Rule:** don't change `exportPhoto` or `resizePhoto`. All the counting must live inside `limitUses`, and it must work for functions with any number of arguments.

<details>
<summary>Hint 1</summary>

This is a bigger version of the `once` helper from the notes. Instead of a true/false "has it run?" flag, what should the backpack hold?

</details>

<details>
<summary>Hint 2</summary>

To pass along any number of arguments, collect them with `...args` and hand them on with `fn(...args)`.

</details>

---

## Exercise 4 (Medium): The food truck bug

A food truck's app builds one "order" button function per dish. Copy this code into `ex4.js` and run it:

```js
const dishes = ["Momo", "Chowmein", "Thukpa"];
const orderButtons = [];

for (var i = 0; i < dishes.length; i++) {
  orderButtons.push(() => console.log(`You ordered: ${dishes[i]}`));
}

orderButtons[0]();
orderButtons[1]();
orderButtons[2]();
```

Instead of the dishes, it prints `You ordered: undefined` three times.

Your tasks:

1. Above the loop, write a comment explaining in your own words why every button prints `undefined`.
2. Fix it by changing just one word.
3. Now undo your fix (put `var` back) and fix it a second way: write a small function factory `makeOrderButton(dish)` and use it inside the loop.

Both fixes should print:

```
You ordered: Momo
You ordered: Chowmein
You ordered: Thukpa
```

<details>
<summary>Hint 1</summary>

After the loop finishes, what is the value of `i`? What is `dishes[3]`?

</details>

<details>
<summary>Hint 2</summary>

For the second fix: each call to `makeOrderButton` gets its own `dish` parameter, which means its own backpack. Pass it `dishes[i]` while the loop is still on that round.

</details>

---

## Exercise 5 (Challenge): A private playlist

You're building a music app. Each playlist keeps its songs private, so the rest of the app can only change them through the playlist's own methods.

Write `createPlaylist(name)`. It returns an object with these methods:

- `addSong(title, seconds)` adds a song. If `seconds` isn't a positive number, throw an error with the message `Song length must be a positive number`.
- `removeSong(title)` removes the song with that title.
- `getSongs()` returns the songs as an array of `{ title, seconds }` objects. Changing that array from outside must **not** change the playlist.
- `getTotalTime()` returns the total length as `minutes:seconds`, like `7:10` or `0:00`.
- `describe()` returns a line like `Road Trip: 2 songs, 7:10`.

Test it with this code:

```js
const roadTrip = createPlaylist("Road Trip");

roadTrip.addSong("Resham Firiri", 245);
roadTrip.addSong("Bohemian Rhapsody", 354);
roadTrip.addSong("Here Comes the Sun", 185);
console.log(roadTrip.describe());

roadTrip.removeSong("Bohemian Rhapsody");
console.log(roadTrip.describe());

// Trying to cheat from the outside:
roadTrip.getSongs().push({ title: "Sneaky Song", seconds: 999 });
roadTrip.songs = [];
console.log(roadTrip.getSongs());

const study = createPlaylist("Study");
console.log(study.describe());

try {
  study.addSong("Silence", -5);
} catch (error) {
  console.log(`Error: ${error.message}`);
}
```

Expected output:

```
Road Trip: 3 songs, 13:04
Road Trip: 2 songs, 7:10
[
  { title: 'Resham Firiri', seconds: 245 },
  { title: 'Here Comes the Sun', seconds: 185 }
]
Study: 0 songs, 0:00
Error: Song length must be a positive number
```

<details>
<summary>Hint 1</summary>

The songs array is the private data. It lives in `createPlaylist`, not on the returned object, just like `balance` in the bank account example.

</details>

<details>
<summary>Hint 2</summary>

For the total, `reduce` from [chapter 13](../13-array-methods/notes.md) can add up the seconds. Then `Math.floor(total / 60)` gives the minutes and `total % 60` gives the seconds left over. `padStart` turns `4` into `04`.

</details>

<details>
<summary>Hint 3</summary>

Look at common mistake 4 in the notes. How can `getSongs()` hand out a copy instead of the real array? (For full safety, think about [chapter 16](../16-values-vs-references/notes.md): the song objects inside are shared too.)

</details>

---

## Before you move on

Try this in a new file:

```js
const wallet = {
  balance: 50,
  getBalance() {
    return this.balance;
  },
};

console.log(wallet.getBalance()); // prints: 50

const checkBalance = wallet.getBalance;
console.log(checkBalance()); // prints: undefined
```

It's the same function both times. So why does it forget the balance?

A closure remembers *where* a function was created. But `this` works completely differently: it depends on *how* the function is called. [Chapter 26](../26-this-keyword/notes.md) solves the mystery. 🕵️
