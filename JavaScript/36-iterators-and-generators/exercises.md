# 36 Iterators and Generators: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.js`, `ex2.js`, and so on).
- Run each one with `node ex1.js`.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Next customer, please

A deli counter has a queue of customers:

```js
const queue = ["Ravi", "Hana", "Omar"];
```

Serve the queue by hand, the way `for...of` does it behind the scenes:

1. Get an iterator from the array.
2. Call `next()` once and print the whole result object.
3. Serve everyone who's left with a `while` loop that keeps calling `next()` until the iterator is done.
4. Print the final result object with the message `Queue is empty:`.

Expected output:

```
{ value: 'Ravi', done: false }
Now serving: Hana
Now serving: Omar
Queue is empty: { value: undefined, done: true }
```

**Rule:** no `for...of`, no `forEach`, and no indexes like `queue[1]`. Only `next()`.

<details>
<summary>Hint 1</summary>

The iterator comes from the method with the symbol name: `queue[Symbol.iterator]()`. Don't forget the `()` at the end. You're calling that method.

</details>

<details>
<summary>Hint 2</summary>

Store each result in a `let` variable. The loop condition is "not done yet", and the last thing inside the loop is asking for the next result.

</details>

---

## Exercise 2 (Easy): Rocket countdown

Write a generator function `countdown(from)` that yields the numbers from `from` down to `1`, and then yields the text `"Liftoff!"`.

Then use it in three ways:

1. Loop over `countdown(5)` with `for...of` and print each value.
2. Spread `countdown(3)` into an array and print the array.
3. Make one generator object with `countdown(2)`, call `next()` on it four times, and print each result.

Expected output:

```
5
4
3
2
1
Liftoff!
[ 3, 2, 1, 'Liftoff!' ]
{ value: 2, done: false }
{ value: 1, done: false }
{ value: 'Liftoff!', done: false }
{ value: undefined, done: true }
```

Look at the last two lines. Why is `done` still `false` when you get `"Liftoff!"`? Write your answer in a comment.

<details>
<summary>Hint 1</summary>

A regular `for` loop that counts down works well inside a generator: `yield` each number. After the loop, one more `yield` gives the final message.

</details>

<details>
<summary>Hint 2</summary>

A generator only reports `done: true` once its function has actually *finished*. After `yield "Liftoff!"`, the function is paused at that line, not finished yet.

</details>

---

## Exercise 3 (Medium): An iterable bookshelf

You're building a small reading app. Write a `Bookshelf` class that keeps its books in a **private** array field, `#books`, and still lets people loop over it.

It needs:

- `add(title, author)`: stores a book as an object like `{ title: "Dune", author: "Frank Herbert" }`.
- A `[Symbol.iterator]` generator method, so `for...of`, spread, and destructuring work on a shelf and give you the book objects.
- A generator method `byAuthor(author)` that yields only the **titles** of that author's books.

Test it with this code. Paste it below your class, and don't change it:

```js
const shelf = new Bookshelf();
shelf.add("Dune", "Frank Herbert");
shelf.add("Emma", "Jane Austen");
shelf.add("Beloved", "Toni Morrison");
shelf.add("Persuasion", "Jane Austen");

for (const book of shelf) {
  console.log(`${book.title} by ${book.author}`);
}

const [first, second] = shelf;
console.log(`First two: ${first.title}, ${second.title}`);
console.log(`Books on the shelf: ${[...shelf].length}`);

for (const title of shelf.byAuthor("Jane Austen")) {
  console.log(`Austen: ${title}`);
}
```

Expected output:

```
Dune by Frank Herbert
Emma by Jane Austen
Beloved by Toni Morrison
Persuasion by Jane Austen
First two: Dune, Emma
Books on the shelf: 4
Austen: Emma
Austen: Persuasion
```

**Rule:** `#books` must stay private. Don't add a method that hands out the array itself.

Then answer this in a comment: the test code loops over `shelf` three times, and each time starts from the first book. But in the notes, a generator *object* could only be used once. Why is a shelf different?

<details>
<summary>Hint 1</summary>

A generator method in a class has a star in front of its name: `*[Symbol.iterator]() { ... }`, and `*byAuthor(author) { ... }`. Inside, `this.#books` works like in any other method.

</details>

<details>
<summary>Hint 2</summary>

For `[Symbol.iterator]`, `yield*` hands out every book in the array in one line. For `byAuthor`, loop over the books and only `yield` the title when the author matches.

</details>

<details>
<summary>Hint 3</summary>

For the question: think about *when* JavaScript calls `[Symbol.iterator]()`, and what it gets back each time.

</details>

---

## Exercise 4 (Medium): Bus timetable

A city bus leaves the depot every 15 minutes, starting at 06:00, all day long. Instead of storing a long array of times, describe the timetable with an endless generator and ask it questions with iterator helpers.

1. Write a generator `departures(firstBus, every)` that yields departure times forever, counted in **minutes after midnight**. So 06:00 is `360`, the next bus is `375`, then `390`, and so on.
2. Write a function `formatTime(minutes)` that turns minutes into `HH:MM` text, like `formatTime(375)` → `"06:15"`.
3. Use `departures` and the iterator helpers to answer each question below.

Expected output:

```
First buses: 06:00, 06:15, 06:30, 06:45
Arrive at 08:20, next bus at 08:30
Lunchtime buses: 12:00, 12:15, 12:30, 12:45
The 11th bus of the day leaves at 08:30
```

- **First buses:** the first four departures.
- **Next bus:** you reach the stop at 08:20. When is the first departure at or after that time?
- **Lunchtime buses:** the first four departures from 12:00 onwards.
- **The 11th bus:** skip the first ten buses and take the next one.

**Rule:** no arrays of times that you build or type yourself, and no `while` loops outside the generator. Let the helpers (`take`, `drop`, `filter`, `map`, `find`, `toArray`) do the work.

<details>
<summary>Hint 1</summary>

`formatTime` needs the hours (`Math.floor(minutes / 60)`) and the leftover minutes (`minutes % 60`), each padded to two digits with `padStart` from [chapter 06](../06-strings/notes.md).

</details>

<details>
<summary>Hint 2</summary>

`find` is lazy too: it stops the moment it finds a match. For the other questions, the chain usually ends with `.map(formatTime).toArray()`, and `join(", ")` makes the list.

</details>

<details>
<summary>Hint 3</summary>

Call `departures(...)` again for each question. Helpers like `take` and `find` finish off the generator they read from, so a used one can't answer the next question.

</details>

---

## Exercise 5 (Challenge): Order history, page by page

A shop's order history lives on a server that sends orders **one page at a time**, with a short delay for each page. Here's a pretend version of that server. Copy it into your file as it is:

```js
const database = [
  { id: 1, customer: "Ana", total: 30 },
  { id: 2, customer: "Ben", total: 45 },
  { id: 3, customer: "Ana", total: 25 },
  { id: 4, customer: "Cleo", total: 120 },
  { id: 5, customer: "Ben", total: 15 },
  { id: 6, customer: "Ana", total: 60 },
  { id: 7, customer: "Cleo", total: 40 },
];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Pretend API: returns one page of orders after a short delay
async function fetchOrdersPage(page, pageSize) {
  await wait(200);
  console.log(`(fetched page ${page})`);
  const start = (page - 1) * pageSize;
  return database.slice(start, start + pageSize);
}
```

Your code isn't allowed to touch `database` directly. It may only ask for pages with `fetchOrdersPage`, just like a real app talking to a real server ([chapter 33](../33-fetch-and-apis/notes.md)).

1. Write an async generator `allOrders(pageSize)` that fetches page 1, then page 2, and so on, and yields the orders **one at a time**. When a page comes back empty, there are no more orders, so the generator should finish.
2. Write an `async function main()`. In it:
   - **Part 1:** loop over `allOrders(3)` with `for await...of` and add up how much each customer spent, using a Map ([chapter 35](../35-map-and-set/notes.md)). Then print each customer's total.
   - **Part 2:** loop over a fresh `allOrders(3)` to find the first order over $100. Print it and stop the loop straight away.

Expected output:

```
Part 1: totals
(fetched page 1)
(fetched page 2)
(fetched page 3)
(fetched page 4)
Ana: $115
Ben: $60
Cleo: $160
Part 2: first big order
(fetched page 1)
(fetched page 2)
First big order: #4 by Cleo ($120)
```

Look closely at Part 2: pages 3 and 4 were never fetched. That's lazy evaluation saving you two slow network requests.

<details>
<summary>Hint 1</summary>

Inside `allOrders`, a `while (true)` loop with a `page` counter works well. `await` the page. If it's empty, `return` to finish the generator. Otherwise, `yield*` the orders and move on to the next page.

</details>

<details>
<summary>Hint 2</summary>

Part 1 is the counting pattern from chapter 35: `get` the total so far (or `0`), add the order's `total`, and `set` it back. For the dollar sign in a template literal, `$${total}` gives you `$115`.

</details>

<details>
<summary>Hint 3</summary>

In Part 2, `break` is all you need to stop. When you leave a `for await...of` loop early, the generator is finished off, and it never asks for the next page.

</details>

---

## Before you move on

In Exercise 4, you turned minutes into times like `08:30`. Now imagine the opposite job: someone sends you a message like `"Meet at 08:30 or 12:15, not 25:99"`, and you need to find every *valid* time in it.

`includes` and `indexOf` can only search for exact text. They can't search for "two digits, a colon, then two more digits". [Chapter 37: Regular Expressions](../37-regular-expressions/notes.md) can, and one of its methods, `matchAll`, even hands you the matches with an iterator.
