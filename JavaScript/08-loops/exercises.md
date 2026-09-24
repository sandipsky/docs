# 08 Loops: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.js`, `ex2.js`, and so on).
- Run each one with `node ex1.js` from a terminal opened in this folder.
- If a program never stops, press `Ctrl + C` in the terminal, then check what changes in each round of your loop.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Times table

A primary school teacher wants to print times tables for her class. Start with:

```js
const number = 7;
```

Expected output:

```
7 x 1 = 7
7 x 2 = 14
7 x 3 = 21
7 x 4 = 28
7 x 5 = 35
7 x 6 = 42
7 x 7 = 49
7 x 8 = 56
7 x 9 = 63
7 x 10 = 70
```

**Rule:** if you change `number` to `9`, your program must print the 9 times table, with no other changes.

<details>
<summary>Hint</summary>

You know exactly how many lines you need (10), so a `for` loop fits. The counter can be the number you multiply by.

</details>

---

## Exercise 2 (Easy): Vowel counter

A bookshop's website shows fun facts about book titles. Count the vowels (`a`, `e`, `i`, `o`, `u`, in capitals or lowercase) in a title:

```js
const bookTitle = "The Hobbit: An Unexpected Journey";
```

Expected output:

```
"The Hobbit: An Unexpected Journey" has 11 vowels.
```

Change the title to `"Harry Potter"` and you should see `"Harry Potter" has 3 vowels.` (For this exercise, `y` doesn't count as a vowel.)

<details>
<summary>Hint 1</summary>

Look at the Mississippi example in the notes. You need a counter created before the loop, and a `for...of` loop to look at each character.

</details>

<details>
<summary>Hint 2</summary>

Checking `letter === "a" || letter === "e" || ...` for all ten letters is a lot of typing. Try it the other way round: is the letter included in the string `"aeiou"`? And what could you do to the letter first so that `"A"` counts too?

</details>

---

## Exercise 3 (Medium): FizzBuzz

FizzBuzz is a famous little puzzle. Companies really do use it in job interviews, to check that someone can make loops and conditions work together.

Print the numbers from 1 to 15, but:

- For multiples of 3, print `Fizz` instead of the number.
- For multiples of 5, print `Buzz` instead.
- For multiples of both 3 and 5, print `FizzBuzz`.

Expected output:

```
1
2
Fizz
4
Buzz
Fizz
7
8
Fizz
Buzz
11
Fizz
13
14
FizzBuzz
```

<details>
<summary>Hint 1</summary>

A number is a multiple of 3 when dividing it by 3 leaves no remainder. Which operator from [chapter 04](../04-operators/notes.md) gives you the remainder?

</details>

<details>
<summary>Hint 2</summary>

If 15 prints `Fizz` instead of `FizzBuzz`, remember the "wrong order" mistake from [chapter 07](../07-conditionals/notes.md). The first true condition wins, so which check should come first?

</details>

**Bonus:** make it go up to 100. How many lines of code did you have to change?

---

## Exercise 4 (Medium): Cinema seat map

A small cinema has 4 rows (A to D) with 6 seats each. The booking system stores the booked seats in one string:

```js
const rows = "ABCD";
const seatsPerRow = 6;
const bookedSeats = "A3 B1 B2 C6 D4";
```

Print a seat map, where `[X]` is a booked seat and `[ ]` is a free one. Then print how many seats are still free:

```
A [ ][ ][X][ ][ ][ ]
B [X][X][ ][ ][ ][ ]
C [ ][ ][ ][ ][ ][X]
D [ ][ ][ ][X][ ][ ]
Free seats: 19
```

**Rule:** your code must work for any cinema. Try `"ABCDE"`, `8`, and `"E8 A1"`. You should see 5 rows of 8 seats, with only A1 and E8 booked, and `Free seats: 38`.

<details>
<summary>Hint 1</summary>

This is a nested loop. The outer loop goes through the row letters (a `for...of` over `rows` works nicely). The inner loop counts the seats from 1 to `seatsPerRow`.

</details>

<details>
<summary>Hint 2</summary>

Build each row as a string, like the multiplication table in the notes: start with the row letter and a space, add one `[X]` or `[ ]` per seat, and print the string after the inner loop.

</details>

<details>
<summary>Hint 3</summary>

Inside the inner loop, make the seat's name from the row letter and the seat number (like `"B2"`) with a template literal. Then ask whether `bookedSeats` includes it.

</details>

---

## Exercise 5 (Challenge): Phone PIN lock

Your phone's lock screen gives you 3 attempts to type your 4-digit PIN. The phone keeps a log of every digit that was typed, in order:

```js
const correctPin = "2580";
const keypadLog = "1234000025809999";
const maxAttempts = 3;
```

Every 4 digits in the log is one attempt. So this log means: `1234`, then `0000`, then `2580`, then `9999`.

Check the attempts in order and print what happens:

```
Attempt 1: 1234 - wrong PIN
Attempt 2: 0000 - wrong PIN
Attempt 3: 2580 - unlocked!
```

**Rules:**

- As soon as the phone unlocks, stop checking. (That's why `9999` isn't checked.)
- Never check more than `maxAttempts` attempts.
- If all the allowed attempts are wrong, print `Phone locked. Try again in 30 seconds.` at the end.
- You can assume the log always has at least 3 attempts in it.

Test it with `"1111222233334444"`:

```
Attempt 1: 1111 - wrong PIN
Attempt 2: 2222 - wrong PIN
Attempt 3: 3333 - wrong PIN
Phone locked. Try again in 30 seconds.
```

And with `"258011112222"`, you should only see `Attempt 1: 2580 - unlocked!`.

<details>
<summary>Hint 1</summary>

Attempt 1 is at indexes 0 to 3, attempt 2 at 4 to 7, and attempt 3 at 8 to 11. Can you work out the start index from the attempt number? Then `slice` from [chapter 06](../06-strings/notes.md) can cut out the 4 digits.

</details>

<details>
<summary>Hint 2</summary>

When the PIN is right, print the message and `break` out of the loop.

</details>

<details>
<summary>Hint 3</summary>

After the loop, how do you know whether it ended because of `break` or because the attempts ran out? Create a boolean like `let isUnlocked = false;` before the loop, and change it to `true` when the phone unlocks. After the loop, an `if` can check it.

</details>

---

## Before you move on

Your PIN check works, but it's stuck inside one file. A real phone needs the same check in lots of places: the lock screen, the banking app, the settings page. Copying and pasting it everywhere means that when something changes, you have to fix every single copy.

[Chapter 09](../09-functions/notes.md) shows you how to wrap code up once, give it a name, and use it wherever you like. Those are functions.
