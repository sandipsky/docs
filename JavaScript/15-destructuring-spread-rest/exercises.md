# 15 Destructuring, Spread and Rest: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.js`, `ex2.js`, and so on).
- Copy the starting data from the exercise into your file, then write your code below it.
- Run each one with `node ex1.js`.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Race results

The results of a 5 km fun run have just come in, in finishing order.

```js
const results = ["Aiko", "Bruno", "Chidi", "Dana", "Emil"];
```

Use array destructuring for every step:

1. Unpack the first three runners into `gold`, `silver`, and `bronze`, and print the podium.
2. Unpack the `winner`, and collect everyone else into an array called `others`.
3. Unpack only the fourth-place runner, skipping the first three.
4. The judges wrote two names down the wrong way round. Swap them in one line:

```js
let first = "Bruno";
let second = "Aiko";
```

Expected output:

```
Gold: Aiko, Silver: Bruno, Bronze: Chidi
Winner: Aiko
Everyone else: [ 'Bruno', 'Chidi', 'Dana', 'Emil' ]
Fourth place: Dana
After the swap: Aiko Bruno
```

<details>
<summary>Hint 1</summary>

For "everyone else", use rest: three dots in front of the last variable name. To print the array the way Node shows it, pass it to `console.log` as a separate value after a comma, not inside a template literal.

</details>

<details>
<summary>Hint 2</summary>

To skip an item, leave its spot empty and write only the comma. Skipping three items means three commas before the name you want.

</details>

---

## Exercise 2 (Easy): Profile card

A social app shows a small profile card for each user.

```js
const profile = {
  username: "maya_k",
  email: "maya@example.com",
  address: { city: "Lisbon", country: "Portugal" },
};
```

Use object destructuring to create these five variables:

- `handle`, taken from `username`
- `email`
- `theme`, which isn't in the object, so give it a default of `"light"`
- `city` and `country`, from inside `address`

Then print:

```
Handle: @maya_k
Email: maya@example.com
Theme: light
Lives in: Lisbon, Portugal
```

**Bonus:** create all five variables in a single destructuring statement.

<details>
<summary>Hint 1</summary>

Renaming uses a colon: `property: newName`. A default uses `=`: `name = defaultValue`.

</details>

<details>
<summary>Hint 2</summary>

To reach into `address`, write `address:` followed by another `{ }` pattern. Remember that this doesn't create an `address` variable.

</details>

---

## Exercise 3 (Medium): Music app settings

A music app has default settings, and each user saves the few things they changed.

```js
const defaultSettings = { volume: 50, shuffle: false, theme: "light", quality: "high" };
const savedSettings = { volume: 80, theme: "dark" };
const playlist = ["Intro", "Sunrise"];
const newSongs = ["Night Drive", "Echoes"];
const songLengths = [215, 187, 242, 199];
```

1. Make `settings` by combining the defaults with the saved settings. The saved ones must win. Print it.
2. Make `partyMode`: a copy of `settings` with `shuffle` turned on and `volume` at 100. Don't change `settings`. Print both volumes.
3. Make `fullPlaylist`: the playlist, then the new songs, then `"Outro"` at the end. Print it, then print the original playlist's length to show it didn't change.
4. Print the longest and shortest song lengths.

Expected output:

```
{ volume: 80, shuffle: false, theme: 'dark', quality: 'high' }
Party volume: 100, normal volume: 80
[ 'Intro', 'Sunrise', 'Night Drive', 'Echoes', 'Outro' ]
Original playlist length: 2
Longest song: 242 seconds
Shortest song: 187 seconds
```

**Rule:** no loops, no `push`, and no `concat`. Use spread.

<details>
<summary>Hint 1</summary>

With object spread, the object that comes later wins. Which one should come last in step 1?

</details>

<details>
<summary>Hint 2</summary>

In step 2, spread `settings` first, then write the properties you want to change after it.

</details>

<details>
<summary>Hint 3</summary>

`Math.max` and `Math.min` want separate numbers. How do you turn an array into separate values?

</details>

---

## Exercise 4 (Medium): Restaurant bookings

A restaurant's booking system needs two small functions.

**Part 1.** Write `bookTable`, which takes one options object with these properties:

| Property | Default |
|---|---|
| `name` | (no default: it's required) |
| `guests` | `2` |
| `time` | `"19:00"` |
| `outdoor` | `false` |

It should **return** a confirmation string, or an error message when there's no name.

**Part 2.** Write `addToOrder`, which takes a table number followed by any number of dishes, and **returns** a summary. Say "dish" for one dish and "dishes" for more.

Test them with exactly these calls:

```js
console.log(bookTable({ name: "Priya" }));
console.log(bookTable({ name: "Tom", guests: 6, outdoor: true }));
console.log(bookTable({ time: "20:30", name: "Lena", guests: 4 }));
console.log(bookTable());
console.log(addToOrder(5, "soup", "pasta", "tiramisu"));
console.log(addToOrder(2, "salad"));
```

Expected output:

```
Table for 2 at 19:00, inside, under "Priya"
Table for 6 at 19:00, outside, under "Tom"
Table for 4 at 20:30, inside, under "Lena"
Error: a booking needs a name
Table 5 ordered 3 dishes: soup, pasta, tiramisu
Table 2 ordered 1 dish: salad
```

<details>
<summary>Hint 1</summary>

Destructure the options object right in the parameter list, with a default for each property that has one.

</details>

<details>
<summary>Hint 2</summary>

`bookTable()` is called with nothing at all. Look at Common mistakes #2 in the notes to stop it from crashing. Then check whether `name` is missing before building the confirmation.

</details>

<details>
<summary>Hint 3</summary>

For `addToOrder`, a rest parameter collects the dishes into an array. Its `length` tells you how many there are, and a ternary from chapter 07 can pick "dish" or "dishes".

</details>

---

## Exercise 5 (Challenge): Online orders

An online shop exports its orders as rows. Each row starts with the order id and the customer's name, followed by any number of items.

```js
const rawOrders = [
  ["A-101", "Ana", { name: "Mug", price: 8, qty: 2 }, { name: "Tea", price: 5, qty: 1 }],
  ["A-102", "Ben", { name: "Notebook", price: 4, qty: 3 }],
  ["A-103", "Cleo", { name: "Lamp", price: 30, qty: 1 }, { name: "Bulb", price: 3, qty: 4 }],
];
```

Write these functions:

1. `parseOrder(row)` turns one row into an object like `{ id: "A-101", customer: "Ana", items: [...] }`. Use array destructuring with rest.
2. `orderTotal(order)` returns the order's total (price times quantity for each item, added up). Destructure `items` in the parameter list, and destructure `price` and `qty` in your `reduce` callback.
3. `addDelivery(order)` returns a **copy** of the order with a new `delivery` property: `"free"` if the total is 25 or more, otherwise `"$4.99"`. It must not change the order it was given.

Then turn all the rows into order objects with `map`, and print this report:

```
A-101 | Ana | 2 items | $21.00
A-102 | Ben | 1 item | $12.00
A-103 | Cleo | 2 items | $42.00
Delivery: A-101 $4.99, A-102 $4.99, A-103 free
Original orders changed? false
```

"2 items" means two different items, not the total quantity. The last line checks whether any of your parsed orders (not the copies) has a `delivery` property.

<details>
<summary>Hint 1</summary>

In `parseOrder`, the first two variables take the id and the name, and a rest variable collects everything after them. Then return an object using the shorthand properties from chapter 11: `{ id, customer, items }`.

</details>

<details>
<summary>Hint 2</summary>

A `reduce` callback's second parameter is the current item, and that item is an object. You can destructure it right there: `(sum, { price, qty }) => ...`.

</details>

<details>
<summary>Hint 3</summary>

In `addDelivery`, spread the order into a new object, then add `delivery` after it. For the last line, `some` from chapter 13 and the `in` operator from chapter 11 work well together.

</details>

---

## Before you move on

In the notes, changing a copy's `members` array also changed the original. Spread made a new object, but both objects still pointed at the same inner array.

Why does JavaScript share some things and copy others? That's the big idea of [chapter 16](../16-values-vs-references/notes.md), and once you understand it, a whole family of confusing bugs makes sense.
