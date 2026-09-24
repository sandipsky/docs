# 10 Arrays: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.js`, `ex2.js`, and so on).
- Run each one with `node ex1.js` from a terminal opened in this folder.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Weekly shopping list

You keep your weekly shopping list in an array.

1. Create an array called `shoppingList` with `"rice"`, `"lentils"`, `"spinach"` and `"yogurt"`.
2. Print the whole list.
3. Print the first item, the last item, and how many items there are.
4. You remembered you need tea. Add `"tea"` to the end.
5. You already have rice at home. Remove the first item.
6. Print the list again.

Expected output:

```
[ 'rice', 'lentils', 'spinach', 'yogurt' ]
First: rice
Last: yogurt
Items: 4
[ 'lentils', 'spinach', 'yogurt', 'tea' ]
```

**Rule:** don't type `rice`, `yogurt` or `4` into your `console.log` lines. Read them from the array.

<details>
<summary>Hint 1</summary>

The first item is at index `0`. For the last item, `.at()` with a negative number counts from the end.

</details>

<details>
<summary>Hint 2</summary>

One method adds to the end and another removes from the start. Check the table in the notes if you can't remember which is which.

</details>

---

## Exercise 2 (Easy): Road trip playlist

A friend made a road trip playlist, and it needs a few changes. Start with:

```js
const playlist = ["Sunrise", "Highway", "Old Town", "Neon Lights", "Coastline"];
```

1. Nobody likes "Old Town". Find where it is with `indexOf`, then remove it with `splice`. Print which song was removed.
2. Insert `"Mountain Air"` at index 1, between "Sunrise" and "Highway".
3. Print the first three songs, separated by a comma and a space.
4. Print whether the playlist has "Coastline" in it.
5. Print which track number "Neon Lights" is. Track numbers start at 1, not 0.
6. Print the whole playlist with `->` between the songs.

Expected output:

```
Removed: Old Town
Up next: Sunrise, Mountain Air, Highway
Has Coastline? true
Neon Lights is track 4
Sunrise -> Mountain Air -> Highway -> Neon Lights -> Coastline
```

**Rule:** don't type the index `2` for "Old Town" yourself. Let `indexOf` find it.

<details>
<summary>Hint 1</summary>

`splice` gives back an *array* of the removed items, even when it removes only one. How do you get the first item out of an array?

</details>

<details>
<summary>Hint 2</summary>

For step 3, you need two methods chained together: one to copy the first three songs, and one to turn them into a string.

</details>

<details>
<summary>Hint 3</summary>

For step 5, `indexOf` gives you an index, which starts at 0. What do you add to turn it into a track number?

</details>

---

## Exercise 3 (Medium): Test score report

A teacher has the test scores for a class and wants a quick report:

```js
const scores = [78, 92, 45, 67, 88, 38, 99, 74];
```

Print how many students there are, the average (to 1 decimal place), the highest and lowest scores, how many passed (a pass is 50 or more), and a list of the scores that need a retake.

Expected output:

```
Students: 8
Average: 72.6
Highest: 99
Lowest: 38
Passed: 6
Needs a retake: [ 45, 38 ]
```

**Rule:** use loops, and don't work anything out by hand. If the teacher adds a new score to the array, your report should still be right.

<details>
<summary>Hint 1</summary>

You can do all of this in a single `for...of` loop. Before the loop, set up a variable for each thing you're tracking: a total, the highest, the lowest, a pass counter, and an empty array for retakes.

</details>

<details>
<summary>Hint 2</summary>

The average is the total divided by the number of scores. `toFixed(1)` from chapter 05 gives you 1 decimal place.

</details>

<details>
<summary>Hint 3</summary>

If you put an array inside a template literal, you get `45,38` without the brackets. To see Node's `[ 45, 38 ]`, pass the array to `console.log` after a comma: `console.log("Label:", myArray)`.

</details>

---

## Exercise 4 (Medium): Hashtag maker

A social media app turns a phrase into a hashtag. Write a function `makeHashtag(phrase)` that returns the hashtag:

- Every word starts with a capital letter, and the rest of the word is lowercase.
- There are no spaces, and there's a `#` at the front.
- Extra spaces (at the ends or between words) must not cause problems.

Test it with:

```js
console.log(makeHashtag("summer sale starts now"));
console.log(makeHashtag("  learn   JAVASCRIPT today "));
console.log(makeHashtag("pizza"));
```

Expected output:

```
#SummerSaleStartsNow
#LearnJavascriptToday
#Pizza
```

<details>
<summary>Hint 1</summary>

Plan it in steps: clean up the phrase, break it into an array of words, fix each word, then glue the words back together.

</details>

<details>
<summary>Hint 2</summary>

Try `console.log("learn   JAVASCRIPT".split(" "))`. Where do those empty strings `''` come from? You can skip them inside your loop with `continue` from chapter 08.

</details>

<details>
<summary>Hint 3</summary>

To fix one word: take its first letter and uppercase it, then add the rest of the word in lowercase. `slice(1)` gives you "everything after the first letter".

</details>

---

## Exercise 5 (Challenge): Cinema seat booking

A small cinema has 3 rows of 5 seats. `"O"` means free and `"X"` means taken. Start with:

```js
const seats = [
  ["O", "O", "X", "O", "O"],
  ["X", "X", "O", "O", "O"],
  ["O", "O", "O", "O", "X"]
];
const rowNames = ["A", "B", "C"];
```

Customers ask for seats like "B3": row B, seat 3. Seat numbers start at 1, like in a real cinema. Write three functions:

1. `printSeats(seats)` prints each row with its letter, like `A: O O X O O`.
2. `countFreeSeats(seats)` returns how many seats are free.
3. `bookSeat(seats, rowName, seatNumber)` books a seat and **returns** a message:
   - If the seat doesn't exist: `Seat D1 doesn't exist.`
   - If it's already taken: `Sorry, B3 is already taken.`
   - Otherwise, it marks the seat as taken and returns: `Booked B3. Enjoy the film!`

Test it with:

```js
printSeats(seats);
console.log(`Free seats: ${countFreeSeats(seats)}`);
console.log(bookSeat(seats, "B", 3));
console.log(bookSeat(seats, "B", 3));
console.log(bookSeat(seats, "D", 1));
console.log(bookSeat(seats, "A", 6));
console.log(bookSeat(seats, "C", 5));
printSeats(seats);
console.log(`Free seats: ${countFreeSeats(seats)}`);
```

Expected output:

```
A: O O X O O
B: X X O O O
C: O O O O X
Free seats: 11
Booked B3. Enjoy the film!
Sorry, B3 is already taken.
Seat D1 doesn't exist.
Seat A6 doesn't exist.
Sorry, C5 is already taken.
A: O O X O O
B: X X X O O
C: O O O O X
Free seats: 10
```

<details>
<summary>Hint 1</summary>

For `printSeats`, you need each row *and* its position (to find the matching letter in `rowNames`). Which kind of loop gives you the index? And which array method turns `["O", "O", "X"]` into `O O X`?

</details>

<details>
<summary>Hint 2</summary>

For `countFreeSeats`, use a loop inside a loop: one for the rows, and one for the seats in each row.

</details>

<details>
<summary>Hint 3</summary>

In `bookSeat`, turn the customer's words into indexes first. `rowNames.indexOf(rowName)` gives the row index (or `-1` if there's no such row). The seat index is one less than the seat number. Check that both are in range *before* you read `seats[rowIndex][seatIndex]`.

</details>

---

## Before you move on

In Exercise 3, the scores had no names attached. What if the teacher wanted `Maya: 78`? You could keep a second array of names and hope the two lists always line up, but that gets messy fast.

[Chapter 11: Objects](../11-objects/notes.md) gives you a much better way to keep related information together. 🙂
