# 35 Map and Set: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.js`, `ex2.js`, and so on).
- Run each one with `node ex1.js`.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Newsletter clean-up

A bakery collected newsletter sign-ups at the till and on its website. Some people signed up twice. Start with this array:

```js
const signups = [
  "mia@mail.com",
  "leo@mail.com",
  "mia@mail.com",
  "zoe@mail.com",
  "leo@mail.com",
  "sam@mail.com",
];
```

Use a Set to get rid of the duplicates. Print the counts, then a numbered list of the unique emails. Finally, check whether two people are subscribed.

Expected output:

```
Sign-ups: 6
Unique people: 4
Duplicates removed: 2
1. mia@mail.com
2. leo@mail.com
3. zoe@mail.com
4. sam@mail.com
zoe@mail.com subscribed? true
max@mail.com subscribed? false
```

**Rule:** don't check for duplicates yourself with `includes` or a loop. Let the Set do that job.

<details>
<summary>Hint 1</summary>

`new Set(signups)` does all the duplicate removal in one step. A Set counts its values with `size`, not `length`.

</details>

<details>
<summary>Hint 2</summary>

A Set has no indexes, so you can't use `[i]`. Loop over it with `for...of` and keep your own counter with `let`, or spread it into an array first and use `forEach` with its `index`.

</details>

---

## Exercise 2 (Easy): Parcel lockers

An apartment building has numbered parcel lockers. You'll keep track of them with a Map from the locker number (a number) to the name of the person whose parcel is inside.

Do these steps in order:

1. Create an empty Map called `lockers`.
2. Put three parcels in: locker `3` for Ravi, locker `7` for Hana, and locker `12` for Omar.
3. Print who has a parcel in locker 7.
4. Hana collects her parcel. Remove locker 7 from the Map.
5. Print whether locker 7 is still in use, and how many lockers are in use.
6. A new parcel for Lucia goes into locker `5`.
7. Loop over the Map and print every locker.

Expected output:

```
Locker 7 holds a parcel for Hana
Locker 7 in use? false
Lockers in use: 2
Locker 3: Ravi
Locker 12: Omar
Locker 5: Lucia
```

Then answer two questions in a comment at the bottom of your file:

- Why is locker 5 printed last, and not between 3 and 12?
- What does `lockers.get("3")` give you, and why?

<details>
<summary>Hint 1</summary>

You need `set`, `get`, `delete`, `has`, and `size`. Use real numbers as keys: `lockers.set(3, "Ravi")`, not `"3"`.

</details>

<details>
<summary>Hint 2</summary>

`for (const [locker, name] of lockers)` gives you both parts of each pair at once.

</details>

---

## Exercise 3 (Medium): Top songs of the week

A music app logs the title of every song someone plays. Here's one listener's week:

```js
const plays = [
  "Blue Sky", "Night Drive", "Blue Sky", "Sunrise", "Night Drive",
  "Blue Sky", "Paper Moon", "Sunrise", "Blue Sky", "Night Drive",
  "Lighthouse", "Sunrise", "Paper Moon", "Blue Sky", "Night Drive",
];
```

Count the plays for each song with a Map. Then print a small weekly summary: how many different songs there were, the total number of plays, the top 3 songs, and the songs that were played only once.

Expected output:

```
Different songs: 5
Total plays: 15
Top 3 this week:
1. Blue Sky (5 plays)
2. Night Drive (4 plays)
3. Sunrise (3 plays)
Played only once: Lighthouse
```

**Rule:** count with a Map, not a plain object. Don't type any of the counts yourself.

<details>
<summary>Hint 1</summary>

The counting loop from the notes works here too: `get` the count so far (with `?? 0` for the first play), then `set` it one higher.

</details>

<details>
<summary>Hint 2</summary>

`[...counts]` gives you an array of `[song, count]` pairs. Sort it by the count, biggest first, then keep the first three with `slice`.

</details>

<details>
<summary>Hint 3</summary>

For "played only once", `filter` the pairs where the count is `1`, then `map` each pair to just its song. Destructuring works in the callback's parameters: `([song, count]) => ...`.

</details>

---

## Exercise 4 (Medium): Movie night

Ana and Ben are planning a movie quiz night. Here's what each of them has seen, and the movies the quiz is about:

```js
const ana = new Set(["Up", "Coco", "Soul", "Luca", "Cars"]);
const ben = new Set(["Coco", "Cars", "Brave", "Up", "Wall-E"]);
const quizMovies = new Set(["Up", "Coco", "Soul"]);
```

Use the Set methods from the notes to answer each question below. Print every list in alphabetical order, separated by commas.

Expected output:

```
Seen by both: Cars, Coco, Up
Only Ana has seen: Luca, Soul
Only Ben has seen: Brave, Wall-E
Seen by exactly one: Brave, Luca, Soul, Wall-E
All movies (7): Brave, Cars, Coco, Luca, Soul, Up, Wall-E
Ana ready for quiz night? true
Ben ready for quiz night? false
Ben still needs to watch: Soul
```

"Ready for quiz night" means they've seen every quiz movie.

**Rule:** no loops, and no `filter` with `has`. Use `union`, `intersection`, `difference`, `symmetricDifference`, and `isSubsetOf`. (They need Node 22 or newer, or a current browser. You have Node 24, so you're fine.)

<details>
<summary>Hint 1</summary>

Every line prints a list the same way, so write a small function first, like `listOf(movies)`, that turns a Set into a sorted, comma-separated string. Spread the Set into an array, then `sort` and `join`.

</details>

<details>
<summary>Hint 2</summary>

Watch which Set comes first in `difference`: `ana.difference(ben)` and `ben.difference(ana)` answer different questions. For "ready", ask whether the quiz movies are a subset of what that person has seen.

</details>

---

## Exercise 5 (Challenge): Library loans

A small community library lends books to its members. It has plenty of copies of every book, but it has two rules:

- A member can have at most **3 books** at a time.
- A member can't borrow a title they already have.

Write a `Library` class ([chapter 27](../27-classes/notes.md)) that keeps track of loans:

- A **private** field `#loans`: a Map from a member's name to a **Set** of the titles they have.
- `borrow(member, title)`: if a rule is broken, `throw` an `Error` ([chapter 18](../18-error-handling/notes.md)) with a message like the ones in the expected output. Otherwise, record the loan and print `Ravi borrowed Dune`.
- `giveBack(member, title)`: if the member doesn't have that title, throw an `Error`. Otherwise, remove it and print `Mia returned Dune`. When a member has no books left, remove them from the Map completely.
- `report()`: print every member with their books, then the number of members with books and the total number of books on loan.

Test your class with this code. Paste it below your class, and don't change it:

```js
const library = new Library();

function tryTo(action) {
  try {
    action();
  } catch (error) {
    console.log(`Sorry: ${error.message}`);
  }
}

tryTo(() => library.borrow("Ravi", "Dune"));
tryTo(() => library.borrow("Ravi", "Emma"));
tryTo(() => library.borrow("Mia", "Dune"));
tryTo(() => library.borrow("Ravi", "Dune"));
tryTo(() => library.borrow("Ravi", "Beloved"));
tryTo(() => library.borrow("Ravi", "Matilda"));
tryTo(() => library.giveBack("Mia", "Emma"));
tryTo(() => library.giveBack("Mia", "Dune"));
library.report();
```

Expected output:

```
Ravi borrowed Dune
Ravi borrowed Emma
Mia borrowed Dune
Sorry: Ravi already has Dune
Ravi borrowed Beloved
Sorry: Ravi has reached the limit of 3 books
Sorry: Mia doesn't have Emma
Mia returned Dune
--- Loans ---
Ravi: Dune, Emma, Beloved
Members with books: 1
Books on loan: 3
```

Mia isn't in the report because she returned her only book.

<details>
<summary>Hint 1</summary>

The first time a member borrows, they don't have a Set yet. `this.#loans.get(member) ?? new Set()` gives you their Set, or a fresh empty one. Don't forget to `set` it back into the Map.

</details>

<details>
<summary>Hint 2</summary>

Check the rules in `borrow` *before* you change anything. That way, a broken rule never leaves a half-finished loan behind.

</details>

<details>
<summary>Hint 3</summary>

In `giveBack`, the member might not be in the Map at all, so `get` could give you `undefined`. Check for that before you call `has` on it. For the report, loop over the Map with `for...of` and add up each Set's `size`.

</details>

**Bonus:** add a method `whoHas(title)` that returns an array with the name of every member who has that title. For example, calling it with `"Dune"` at the end of the test code should give you `[ 'Ravi' ]`.

---

## Before you move on

You've now used `for...of` on arrays, strings, Sets, and Maps. They're very different things, yet one loop works on all of them. How does `for...of` know how to walk through each one? And could you make *your own* object work with `for...of`?

[Chapter 36: Iterators and Generators](../36-iterators-and-generators/notes.md) answers both questions.
