# 27 Classes: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.js`, `ex2.js`, and so on).
- Run each one with `node ex1.js`.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Movie listings

A cinema's website lists every movie with its running time. Write a `Movie` class:

- The constructor takes `(title, minutes)` and stores them as `title` and `minutes`.
- `describe()` returns a line like `Coco (105 min)`.
- `lengthInHours()` returns the length in hours and minutes, like `1h 45m`.

Test it with this code:

```js
const inception = new Movie("Inception", 148);
const coco = new Movie("Coco", 105);

console.log(inception.describe());
console.log(inception.lengthInHours());
console.log(coco.describe());
console.log(coco.lengthInHours());
console.log(coco);
```

Expected output:

```
Inception (148 min)
2h 28m
Coco (105 min)
1h 45m
Movie { title: 'Coco', minutes: 105 }
```

<details>
<summary>Hint</summary>

`Math.floor(minutes / 60)` gives the whole hours, and `%` from [chapter 04](../04-operators/notes.md) gives the minutes left over. Inside a method, the minutes are `this.minutes`.

</details>

---

## Exercise 2 (Easy): Flooring shop

A flooring shop needs to work out the size of a room and the price of new flooring, which costs $25 per square meter.

Write a `Room` class:

- The constructor takes `(name, width, length)` and stores them in that order.
- A getter `area` returns `width * length`.
- A getter `flooringCost` returns the area times 25.
- A setter `size` takes a text like `"5x6"` and updates `width` and `length` from it (as numbers).

Test it with this code:

```js
const kitchen = new Room("Kitchen", 3, 4);
console.log(`${kitchen.name}: ${kitchen.area} m², flooring $${kitchen.flooringCost}`);

kitchen.size = "5x6";
console.log(`${kitchen.name}: ${kitchen.area} m², flooring $${kitchen.flooringCost}`);
console.log(kitchen);
```

Expected output:

```
Kitchen: 12 m², flooring $300
Kitchen: 30 m², flooring $750
Room { name: 'Kitchen', width: 5, length: 6 }
```

Look at the last line: `area` and `flooringCost` aren't stored in the object at all. They're worked out each time you read them.

<details>
<summary>Hint 1</summary>

A getter can use another getter: inside `flooringCost`, you can read `this.area`.

</details>

<details>
<summary>Hint 2</summary>

For the setter, `split("x")` from [chapter 06](../06-strings/notes.md) turns `"5x6"` into `[ '5', '6' ]`. Those are strings, so convert them with `Number()`.

</details>

---

## Exercise 3 (Medium): Cinema tickets

A cinema scans tickets at the door. Each ticket gets the next number automatically, and a ticket can only be used once. Nobody should be able to "un-use" a ticket.

Write a `Ticket` class:

- A **static** property `sold` counts how many tickets have been made. Each new ticket uses it for its `number` (the first ticket is `1`).
- The constructor takes the movie name and stores `number` and `movie`.
- A **private** field `#used` starts as `false`.
- A getter `used` lets outside code read it, but there's no setter.
- `scan()` returns a welcome message the first time, and an "already used" message after that.

Test it with this code:

```js
const first = new Ticket("Dune");
const second = new Ticket("Frozen");

console.log(first.scan());
console.log(first.scan());
console.log(second.scan());
console.log(first.used);
console.log(`Tickets sold: ${Ticket.sold}`);

first.used = false; // trying to sneak back in with an old ticket
console.log(first.scan());
```

Expected output:

```
Ticket #1 (Dune): Welcome, enjoy the movie!
Ticket #1 (Dune): Already used!
Ticket #2 (Frozen): Welcome, enjoy the movie!
true
Tickets sold: 2
Ticket #1 (Dune): Already used!
```

<details>
<summary>Hint 1</summary>

Inside the constructor, a static property is reached through the class name: `Ticket.sold`, not `this.sold`.

</details>

<details>
<summary>Hint 2</summary>

Why doesn't `first.used = false` work? Because `used` only has a getter. The real value lives in `#used`, which only the class can change.

</details>

---

## Exercise 4 (Medium): Vehicle rental

A rental company has ordinary cars, vans (which cost extra to clean after each rental), and electric scooters (which show their battery range).

1. Write a `Vehicle` class. The constructor takes `(name, dailyRate)`. It has `rentFor(days)`, which returns the cost, and `describe()`, which returns a line like `City car at $40/day`.
2. Write `Van extends Vehicle`. Its constructor also takes a `cleaningFee`. Override `rentFor(days)` so it adds the fee once.
3. Write `Scooter extends Vehicle`. Its constructor also takes `rangeKm`. Override `describe()` so it adds `(range: 40 km)` to the end.
4. Write a function `needsLicence(vehicle)` that returns `false` for scooters and `true` for everything else.

Test it with this code:

```js
const fleet = [
  new Vehicle("City car", 40),
  new Van("Moving van", 70, 25),
  new Scooter("E-scooter", 15, 40),
];

for (const vehicle of fleet) {
  console.log(`${vehicle.describe()}: 3 days = $${vehicle.rentFor(3)}`);
}

for (const vehicle of fleet) {
  console.log(`${vehicle.name} needs a licence: ${needsLicence(vehicle)}`);
}
```

Expected output:

```
City car at $40/day: 3 days = $120
Moving van at $70/day: 3 days = $235
E-scooter at $15/day (range: 40 km): 3 days = $45
City car needs a licence: true
Moving van needs a licence: true
E-scooter needs a licence: false
```

**Rule:** don't repeat the parent's math or text in the child classes. Reuse it with `super`.

<details>
<summary>Hint 1</summary>

In `Van`, `super.rentFor(days)` gives you the normal price. What do you add to it?

</details>

<details>
<summary>Hint 2</summary>

`needsLicence` is a one-liner with `instanceof` and `!` (not).

</details>

---

## Exercise 5 (Challenge): Community library

Build the lending system for a small community library, using classes, private fields, custom errors, and composition.

**The errors.** Write three error classes:

- `LibraryError extends Error`, with `name` set to `"LibraryError"`.
- `BookNotFoundError extends LibraryError`. Its constructor takes a title, and the message is `No book called "<title>"`.
- `AlreadyBorrowedError extends LibraryError`. Its constructor takes a title and a member's name, and the message is `<title> is already borrowed by <member>`.

Each one sets its own `name`, like `"BookNotFoundError"`.

**The books.** A `Book` has a `title` and an `author`, plus a private `#borrowedBy` field (`null` when the book is on the shelf). Give it a getter `isAvailable`, a `borrow(member)` method that throws an `AlreadyBorrowedError` if someone already has it, and a `giveBack()` method.

**The library.** A `Library` **has** books (composition, not inheritance). It keeps them in a private `#books` array and has:

- `addBook(book)`
- `borrow(title, member)`, which throws a `BookNotFoundError` if there's no book with that title
- `giveBack(title)`
- `listAvailable()`, which returns an array of the titles on the shelf

Test it with this code:

```js
const library = new Library("Kathmandu Community Library");
library.addBook(new Book("The Alchemist", "Paulo Coelho"));
library.addBook(new Book("Educated", "Tara Westover"));
library.addBook(new Book("Sapiens", "Yuval Noah Harari"));

function tryToBorrow(title, member) {
  try {
    library.borrow(title, member);
    console.log(`${member} borrowed ${title}`);
  } catch (error) {
    if (error instanceof LibraryError) {
      console.log(`${error.name}: ${error.message}`);
    } else {
      throw error;
    }
  }
}

tryToBorrow("Educated", "Asha");
tryToBorrow("Educated", "Bikash");
tryToBorrow("Harry Potter", "Chen");
console.log(library.listAvailable());

library.giveBack("Educated");
console.log(library.listAvailable());
tryToBorrow("Educated", "Bikash");
```

Expected output:

```
Asha borrowed Educated
AlreadyBorrowedError: Educated is already borrowed by Asha
BookNotFoundError: No book called "Harry Potter"
[ 'The Alchemist', 'Sapiens' ]
[ 'The Alchemist', 'Educated', 'Sapiens' ]
Bikash borrowed Educated
```

Notice that `tryToBorrow` only checks for `LibraryError`, yet it catches both kinds of error. Why does that work?

<details>
<summary>Hint 1</summary>

Start with the error classes, and test them on their own first. Each constructor builds the message and passes it to `super(...)`.

</details>

<details>
<summary>Hint 2</summary>

`find` from [chapter 13](../13-array-methods/notes.md) returns `undefined` when nothing matches. That's your signal to throw a `BookNotFoundError`. A private helper method like `#findBook(title)` can do this for both `borrow` and `giveBack`.

</details>

<details>
<summary>Hint 3</summary>

For `listAvailable`, chain `filter` and `map`: first keep the available books, then turn each book into its title.

</details>

---

## Before you move on

Try this with the first `Book` class from the notes (the one with just a `title`, an `author` and `describe()`):

```js
const dune = new Book("Dune", "Frank Herbert");

console.log(Object.keys(dune)); // prints: [ 'title', 'author' ]
console.log(Object.hasOwn(dune, "describe")); // prints: false
console.log(dune.describe()); // prints: Dune by Frank Herbert
```

`describe` isn't one of `dune`'s own properties. So how can `dune` use it? Where does it actually live?

[Chapter 28](../28-prototypes/notes.md) opens up the hood and shows you.
