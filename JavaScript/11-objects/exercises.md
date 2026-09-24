# 11 Objects: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.js`, `ex2.js`, and so on).
- Run each one with `node ex1.js` from a terminal opened in this folder.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Contact card

You're building the contacts screen of a phone app.

1. Create an object called `contact` with a `name` of `"Leo Martins"`, a `phone` of `"555-0199"` and a `city` of `"Lisbon"`.
2. Print a sentence saying where Leo lives, and then his phone number.
3. Leo just set up email. Add an `email` property: `"leo@example.com"`.
4. He got a new phone number: change `phone` to `"555-0123"`.
5. He'd rather not share his city. Remove the `city` property.
6. Print the whole object, and then how many properties (fields) it has.

Expected output:

```
Leo Martins lives in Lisbon.
Phone: 555-0199
{ name: 'Leo Martins', phone: '555-0123', email: 'leo@example.com' }
Fields: 3
```

**Rule:** read the name, city, and phone number from the object. Don't type them into your `console.log` lines.

<details>
<summary>Hint 1</summary>

Adding a property and changing one look exactly the same: `object.key = value`.

</details>

<details>
<summary>Hint 2</summary>

To count the properties, get an array of the keys first. Every array has a `length`.

</details>

---

## Exercise 2 (Easy): Cinema tickets

A cinema keeps its ticket prices in a lookup table. A family is buying tickets, and one of them is asking for a type of ticket that doesn't exist:

```js
const ticketPrices = { adult: 12, child: 7, senior: 8, student: 9 };
const order = ["adult", "child", "child", "student", "pet"];
```

Go through the order. For each ticket, print its price, or a friendly message if there's no such ticket. Then print the total.

Expected output:

```
adult: $12
child: $7
child: $7
student: $9
Sorry, there's no "pet" ticket.
Total: $35
```

**Rule:** no `if` or `switch` checking each ticket type by name. The lookup table should do that work for you.

<details>
<summary>Hint 1</summary>

Inside your loop, the ticket type is in a variable. Which notation lets you use a variable as the key?

</details>

<details>
<summary>Hint 2</summary>

To check whether a ticket type exists, use one of the checks from "Does this property exist?" in the notes. `Object.hasOwn` is a good choice.

</details>

---

## Exercise 3 (Medium): Library catalog

A small library keeps its books in an array of objects:

```js
const books = [
  { title: "Dune", author: "Frank Herbert", year: 1965, available: true },
  { title: "Beloved", author: "Toni Morrison", year: 1987, available: false },
  { title: "The Hobbit", author: "J.R.R. Tolkien", year: 1937, available: true },
  { title: "Things Fall Apart", author: "Chinua Achebe", year: 1958, available: false }
];
```

1. Print every book on one line, with `available` or `checked out` at the end.
2. Print how many books are available, out of the total.
3. Write a function `findBook(title)` that returns the matching book object, or `null` if there isn't one.
4. Use `findBook` to print the author of "Dune", and then the author of "Emma". There's no "Emma" in the library, so print `Not found` instead, without an `if`.

Expected output:

```
"Dune" by Frank Herbert (1965) - available
"Beloved" by Toni Morrison (1987) - checked out
"The Hobbit" by J.R.R. Tolkien (1937) - available
"Things Fall Apart" by Chinua Achebe (1958) - checked out
Available: 2 of 4
Frank Herbert
Not found
```

<details>
<summary>Hint 1</summary>

To print double quotes inside a template literal, type them as they are: backticks don't mind double quotes. The ternary operator from chapter 07 is handy for choosing between `available` and `checked out`.

</details>

<details>
<summary>Hint 2</summary>

For step 4, `findBook("Emma")` gives you `null`, and `null.author` would crash. Which operator stops safely when the thing on its left is missing? And which one gives a default value when the result is `undefined`?

</details>

---

## Exercise 4 (Medium): Lunch poll

The office is voting on what to order for lunch. Each vote is one string:

```js
const votes = ["pizza", "tacos", "pizza", "sushi", "tacos", "pizza", "curry"];
```

1. Count the votes into an object called `counts`, where each key is a food and each value is its number of votes. Print `counts`.
2. Print each food with its votes. Use `vote` for 1 and `votes` for anything else.
3. Print the winner.

Expected output:

```
{ pizza: 3, tacos: 2, sushi: 1, curry: 1 }
pizza: 3 votes
tacos: 2 votes
sushi: 1 vote
curry: 1 vote
Winner: pizza with 3 votes
```

**Rule:** your code must work for *any* list of votes. Don't type any food names into your code (except in the `votes` array).

<details>
<summary>Hint 1</summary>

Start with an empty object: `const counts = {};`. Then loop over the votes. The food is in a variable, so use bracket notation.

</details>

<details>
<summary>Hint 2</summary>

The first time you see a food, `counts[food]` is `undefined`, because that key doesn't exist yet. In that case, set it to `1`. Otherwise, add 1 to what's already there.

</details>

<details>
<summary>Hint 3</summary>

Finding the winner is the "finding the biggest" pattern from chapter 10. This time, remember two things as you go: the best food so far and its number of votes.

</details>

---

## Exercise 5 (Challenge): Playlist with methods

Build a music playlist as one object with methods. Start with this:

```js
const playlist = {
  name: "Road Trip",
  tracks: []
  // your methods go here
};
```

1. Write a normal function (outside the object) called `formatTime(totalSeconds)` that turns seconds into minutes and seconds: `214` becomes `"3:34"`, and `187` becomes `"3:07"`.
2. Add a method `addTrack(title, artist, seconds)` that adds a track object to `tracks`. Use shorthand properties.
3. Add a method `getTotalSeconds()` that returns the length of the whole playlist, in seconds.
4. Add a method `print()` that prints the playlist's name, number of tracks and total time, and then each track, numbered from 1.

Test it with:

```js
playlist.addTrack("Night Drive", "The Owls", 214);
playlist.addTrack("Rainy Day", "Juniper", 187);
playlist.addTrack("Open Road", "Sam Rivers", 245);
playlist.addTrack("Coastline", "The Owls", 199);
console.log(playlist.tracks[0]);
playlist.print();
```

Expected output:

```
{ title: 'Night Drive', artist: 'The Owls', seconds: 214 }
Road Trip (4 tracks, 14:05)
1. Night Drive - The Owls (3:34)
2. Rainy Day - Juniper (3:07)
3. Open Road - Sam Rivers (4:05)
4. Coastline - The Owls (3:19)
```

<details>
<summary>Hint 1</summary>

For `formatTime`: `Math.floor` gives you whole minutes, and `%` from chapter 04 gives you the seconds left over. `padStart(2, "0")` from chapter 06 turns `"7"` into `"07"`, but it's a string method, so turn the number into a string first.

</details>

<details>
<summary>Hint 2</summary>

Inside a method, `this.tracks` is the playlist's `tracks` array. Remember to write the methods with the method shorthand, `addTrack(title, artist, seconds) { ... }`, and not as arrow functions.

</details>

<details>
<summary>Hint 3</summary>

A method can call another method of the same object through `this`. In `print`, you can use `this.getTotalSeconds()` and pass the result to `formatTime`.

</details>

---

## Before you move on

Look at what you can do now: store lists, group information into objects, loop over both, make decisions, and wrap it all up in functions.

That's everything you need for your first real project. In [chapter 12](../12-project-shopping-cart/notes.md), you'll put it all together and build a shopping cart. 🛒
