# 09 Loops: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.py`, `ex2.py`, and so on).
- Run each one with `python ex1.py` from a terminal opened in this folder.
- If a program never stops, press `Ctrl + C` in the terminal, then check what changes in each round of your loop.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Times table

A primary school teacher wants to print times tables for her class. Start with:

```python
number = 7
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

You know exactly how many lines you need (10), so a `for` loop with `range()` fits. The loop variable can be the number you multiply by. What should the start and stop of the range be, so you get 1 to 10?

</details>

**Bonus:** print the table backwards, starting with `7 x 10 = 70` and ending with `7 x 1 = 7`. You only need to change the `range()`.

---

## Exercise 2 (Easy): Vowel counter

A bookshop's website shows fun facts about book titles. Count the vowels (`a`, `e`, `i`, `o`, `u`, in capitals or lowercase) in a title:

```python
book_title = "The Hobbit: An Unexpected Journey"
```

Expected output:

```
"The Hobbit: An Unexpected Journey" has 11 vowels.
```

Change the title to `"Harry Potter"` and you should see `"Harry Potter" has 3 vowels.` (For this exercise, `y` doesn't count as a vowel.)

<details>
<summary>Hint 1</summary>

Look at the Mississippi example in the notes. You need a counter created before the loop, and a `for` loop that looks at each character.

</details>

<details>
<summary>Hint 2</summary>

Checking `letter == "a" or letter == "e" or ...` for all ten letters is a lot of typing. Try it the other way round: is the letter `in` the string `"aeiou"`? And what could you do to the title first so that `"A"` counts too?

</details>

<details>
<summary>Hint 3</summary>

The output has double quotes around the title. Wrap your f-string in single quotes on the outside, so the double quotes inside don't end it early.

</details>

---

## Exercise 3 (Medium): Bug hunt in the savings app

This savings app shows your balance growing month by month until you reach your goal. It has **3 bugs**. Copy it into `ex3.py` and fix them one at a time.

```python
# Savings goal
balance = 200
monthly_saving = 50
goal = 500
months = 0

while balance < goal
    months += 1
    balance + monthly_saving
print(f"Month {months}: ${balance}")

print(f"Reached ${goal} in {months} months.")
```

When it's fixed, you should see:

```
Month 1: $250
Month 2: $300
Month 3: $350
Month 4: $400
Month 5: $450
Month 6: $500
Reached $500 in 6 months.
```

**Rule:** fix the bugs, don't rewrite the program.

<details>
<summary>Hint 1</summary>

The first bug stops the program from starting at all. Read the last line of the error message: it tells you exactly what's missing.

</details>

<details>
<summary>Hint 2</summary>

If the program seems to freeze and print nothing, it's stuck in an infinite loop. Press `Ctrl + C`. Then ask: what's supposed to change each round so that `balance < goal` eventually becomes `False`? Does that line actually change anything?

</details>

<details>
<summary>Hint 3</summary>

If you only see `Month 6: $500` once, instead of six lines, think about which lines belong to the loop's block. How does Python know?

</details>

---

## Exercise 4 (Medium): Running club log

Sandip's running club wants a quick way to log this week's runs. The program keeps asking for the distance of each run, in whole kilometres, until the runner types `q`. Then it prints a summary.

Here's one session:

```
Distance in km (or q to finish): 5
Run 1 logged: 5 km
Distance in km (or q to finish): 10
Run 2 logged: 10 km
Distance in km (or q to finish): abc
Please type a whole number of km.
Distance in km (or q to finish): 7
Run 3 logged: 7 km
Distance in km (or q to finish): q
Runs: 3
Total: 22 km
Average: 7.3 km
```

And here's a lazy week:

```
Distance in km (or q to finish): q
No runs logged.
```

**Rules:**

- `q` and `Q` both finish.
- Anything that isn't a whole number above zero gets `Please type a whole number of km.`, and doesn't count as a run.
- Show the average with 1 decimal place.
- The program must never crash, and must never divide by zero.

<details>
<summary>Hint 1</summary>

This is the `while True:` pattern from the notes. Ask, then decide: quit with `break`, complain and skip the rest of the round with `continue`, or log the run.

</details>

<details>
<summary>Hint 2</summary>

You need two accumulators, both created before the loop: one for the number of runs, and one for the total distance.

</details>

<details>
<summary>Hint 3</summary>

After the loop, check how many runs there were before you work out the average. What would `total / 0` do? The format spec for 1 decimal place is the cousin of `:.2f` from chapter 06.

</details>

---

## Exercise 5 (Challenge): Cinema seat map

A small cinema has 4 rows (A to D) with 6 seats each. The booking system stores the booked seats in one string:

```python
rows = "ABCD"
seats_per_row = 6
booked_seats = "A3 B1 B2 C6 D4"
```

Print a seat map, where `[X]` is a booked seat and `[ ]` is a free one. Then print how many seats are still free:

```
A [ ][ ][X][ ][ ][ ]
B [X][X][ ][ ][ ][ ]
C [ ][ ][ ][ ][ ][X]
D [ ][ ][ ][X][ ][ ]
Free seats: 19
```

**Rule:** your code must work for any cinema. Try `"ABCDE"`, `8` and `"E8 A1"`. You should see 5 rows of 8 seats, with only A1 and E8 booked, and `Free seats: 38`.

(Keep `seats_per_row` at 9 or fewer. Can you work out why a cinema with 10 or more seats per row would confuse this program? In [chapter 11](../11-lists/notes.md) you'll learn a way to fix it.)

<details>
<summary>Hint 1</summary>

This is a nested loop. The outer loop goes through the row letters (a `for` loop over `rows` works nicely). The inner loop counts the seats from 1 to `seats_per_row`. Careful with the stop number of the `range()`!

</details>

<details>
<summary>Hint 2</summary>

Build each row as a string, like the times table in the notes: start with the row letter and a space, add one `[X]` or `[ ]` per seat, and print the string after the inner loop.

</details>

<details>
<summary>Hint 3</summary>

Inside the inner loop, make the seat's name from the row letter and the seat number (like `"B2"`) with an f-string. Then check whether it's `in` the `booked_seats` string. Every time you add a `[ ]`, that's one more free seat for your accumulator.

</details>

---

## Before you move on

Look back at the "keep asking until it's a whole number" loop in the notes. Now imagine a ticket machine that asks *three* questions that each need a whole number: adults, children and seniors. You'd copy the same loop three times. Find a bug in it later, and you'd have to fix it in three places.

[Chapter 10](../10-functions/notes.md) shows you how to write that code once, give it a name, and use it as many times as you like.
