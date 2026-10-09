# 15 Comprehensions: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.py`, `ex2.py`, and so on).
- Run each one with `python ex1.py` from a terminal opened in this folder.
- Copy the starting data from the exercise into your file, then write your code below it.
- If a comprehension gets confusing, write it as a loop with `append` first, get that working, then turn it into a comprehension.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Cafe price board

A small cafe keeps its prices in whole cents. Start your file with this:

```python
items = ["tea", "coffee", "cake", "water"]
prices = [250, 350, 475, 100]  # in cents
```

Build these four lists, then print each one with a label:

1. `dollars`: every price in dollars (divide by 100).
2. `labels`: a string like `"tea: $2.50"` for every item, with two decimal places.
3. `cheap`: the names of the items that cost less than $3.
4. `board`: every item name in capital letters, for the big sign behind the counter.

Expected output:

```
Dollars: [2.5, 3.5, 4.75, 1.0]
Labels: ['tea: $2.50', 'coffee: $3.50', 'cake: $4.75', 'water: $1.00']
Under $3: ['tea', 'water']
Board: ['TEA', 'COFFEE', 'CAKE', 'WATER']
```

**Rule:** each of the four lists is built with one list comprehension. No `append`.

<details>
<summary>Hint 1</summary>

For `labels` and `cheap`, you need the name and the price at the same time. `zip(items, prices)` from chapter 12 pairs them up, and you can unpack each pair in the `for` part: `for item, cents in zip(items, prices)`.

</details>

<details>
<summary>Hint 2</summary>

Two decimal places in an f-string is the `:.2f` format spec from chapter 06. The `$` is just a normal character in front of the braces.

</details>

---

## Exercise 2 (Easy): Running club results

Your running club has just finished its Saturday 5 km run. Each runner's result is a tuple of their name and their time in minutes:

```python
runners = [("Asha", 24), ("Ben", 31), ("Chen", 28), ("Dana", 35), ("Eli", 22)]
```

Build:

1. `under_30`: the names of everyone who finished in under 30 minutes.
2. `badges`: a badge for **every** runner, in the same order: `"gold"` for under 25 minutes, `"finisher"` for everyone else.
3. `times`: just the times, as a list of numbers. Then use it to work out the average time.

Expected output:

```
Under 30 minutes: ['Asha', 'Chen', 'Eli']
Badges: ['gold', 'finisher', 'finisher', 'finisher', 'gold']
Average time: 28.0 minutes
```

<details>
<summary>Hint 1</summary>

`under_30` drops some runners, so its `if` goes at the end. `badges` keeps every runner, so its `if`/`else` goes at the front. Check the table in the notes if you're not sure which is which.

</details>

<details>
<summary>Hint 2</summary>

The average is the total divided by how many there are. `sum()` and `len()` from earlier chapters both work on your `times` list.

</details>

---

## Exercise 3 (Medium): Bug hunt at the library

A librarian wrote this program to make a few lists from the catalogue, but it doesn't work. Copy it into `ex3.py` and fix it one error at a time.

```python
# Library catalogue
books = [
    {"title": "Dune", "year": 1965, "on_loan": False},
    {"title": "Matilda", "year": 1988, "on_loan": True},
    {"title": "Holes", "year": 1998, "on_loan": False},
    {"title": "Wonder", "year": 2012, "on_loan": False},
]

# Titles of the books on the shelf (not on loan)
on_shelf = [book["title"] for book in books if not book["on_loan"] else ""]
print(f"On the shelf: {on_shelf}")

# Every title in capitals, for the sign above the shelf
[book["title"].upper() for book in books]
print(f"Sign: {sign}")

# How old each book is (this year is 2026)
ages = {book["title"], 2026 - book["year"] for book in books}
print(f"Ages: {ages}")

# Books published before the year 2000
classics = [book["title"] for book in books if book["year"] > 2000]
print(f"Classics: {classics}")
```

There are 4 bugs. When it's fixed, you should see:

```
On the shelf: ['Dune', 'Holes', 'Wonder']
Sign: ['DUNE', 'MATILDA', 'HOLES', 'WONDER']
Ages: {'Dune': 61, 'Matilda': 38, 'Holes': 28, 'Wonder': 14}
Classics: ['Dune', 'Matilda', 'Holes']
```

**Rule:** fix the bugs, don't rewrite the program. Every list and dictionary should still be built with a comprehension.

<details>
<summary>Hint 1</summary>

Run the file, read the last line of the error and its line number, fix that one thing, and run it again. Python checks the grammar of the whole file before it runs anything, so the two `SyntaxError`s show up first, one at a time.

</details>

<details>
<summary>Hint 2</summary>

One error message asks "did you forget parentheses around the comprehension target?" That's Python guessing, and the guess is wrong here. Look at what separates a key from its value in a dictionary.

</details>

<details>
<summary>Hint 3</summary>

The last bug gives no error at all. The program runs, but one line of output doesn't match. Read that condition out loud: "published before 2000".

</details>

---

## Exercise 4 (Medium): What are the reviews saying?

The cafe owner wants a quick feel for what customers write. Start with one review:

```python
review = "the cake was great and the coffee was great too"
words = review.split()
```

Build these, and print each one with a label:

1. `lengths`: a dictionary of each word and how many letters it has.
2. `unique`: a set of the different words. Print how many there are, then print them in alphabetical order.
3. `counts`: a dictionary of each word and how many times it appears in the review.
4. `repeated`: a dictionary made from `counts`, keeping only the words that appear more than once.
5. `long_words`: a set of the words with more than 4 letters. Print it in alphabetical order.

Expected output:

```
Lengths: {'the': 3, 'cake': 4, 'was': 3, 'great': 5, 'and': 3, 'coffee': 6, 'too': 3}
Different words: 7
In order: ['and', 'cake', 'coffee', 'great', 'the', 'too', 'was']
Counts: {'the': 2, 'cake': 1, 'was': 2, 'great': 2, 'and': 1, 'coffee': 1, 'too': 1}
Repeated: {'the': 2, 'was': 2, 'great': 2}
Long words: ['coffee', 'great']
```

**Rule:** one comprehension for each of the five, and no `for` loops anywhere else.

<details>
<summary>Hint 1</summary>

`lengths` has fewer entries than `words` has words, even though you loop over every word. Why? Think about what happens when a dictionary gets the same key twice.

</details>

<details>
<summary>Hint 2</summary>

A list has a `.count()` method (chapter 11) that tells you how many times a value appears in it. For `counts`, loop over `words` (not over the set), so the dictionary keeps the order the words first appear in.

</details>

<details>
<summary>Hint 3</summary>

Sets have no order, so print them with `sorted()`, which gives you back a list in alphabetical order.

</details>

---

## Exercise 5 (Challenge): School report card

A teacher has her class's test scores in a dictionary:

```python
grades = {
    "Asha": [88, 92, 79],
    "Ben": [55, 61, 48],
    "Chen": [95, 98, 100],
    "Dana": [70, 65, 74],
}
```

Write a program that:

1. Has a function `letter(average)` that returns a letter grade: `"A"` for 90 and over, `"B"` for 80 and over, `"C"` for 70 and over, `"D"` for 60 and over, and `"F"` for anything lower.
2. Builds `averages`: a dictionary of each student's average score, rounded to 1 decimal place.
3. Builds `letters`: a dictionary of each student's letter grade, using your `letter()` function inside the comprehension.
4. Builds `honor_roll`: a list of the students with an average of 85 or more.
5. Builds `needs_help`: a list of the students who scored below 50 on **any** single test.
6. Prints the report card as a table, with the names lined up on the left and the averages lined up on the right, followed by the two lists.

Expected output:

```
Name    Average  Grade
Asha       86.3  B
Ben        54.7  F
Chen       97.7  A
Dana       69.7  D
Honor roll: Asha, Chen
Needs help: Ben
```

<details>
<summary>Hint 1</summary>

Loop over `grades.items()` to get each name and that student's list of scores. The average of a list is `sum(scores) / len(scores)`, and `round()` from chapter 05 does the rounding.

</details>

<details>
<summary>Hint 2</summary>

For `needs_help`, you don't need to check every score yourself. Which built-in function from chapter 05 gives you the lowest number in a list?

</details>

<details>
<summary>Hint 3</summary>

Printing the table is a side effect, so that part is a normal `for` loop. For the columns, use f-string alignment from chapter 06: `{name:<8}` pads a name to 8 characters on the left, and `{avg:>7}` lines a number up on the right in 7 characters.

</details>

<details>
<summary>Hint 4</summary>

`", ".join(...)` from chapter 06 turns a list of names into one string with commas between them.

</details>

**Bonus:** a comprehension can sit inside another comprehension. Build a 5 by 5 times table as a list of lists in one line, `[[...] for row in range(1, 6)]`, then print it like this:

```
  1   2   3   4   5
  2   4   6   8  10
  3   6   9  12  15
  4   8  12  16  20
  5  10  15  20  25
```

Is it easier or harder to read than two nested loops? There's no wrong answer, but it's worth having an opinion.

---

## Before you move on

Guess what this prints, then run it:

```python
original = [1, 2, 3]
backup = original
backup.append(4)
print(original)
```

If you expected `[1, 2, 3]`, you're in good company, and [chapter 16](../16-scope-and-mutability/notes.md) explains what really happened.
