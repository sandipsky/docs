# 12 Tuples and Sets: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.py`, `ex2.py`, and so on).
- Run each one with `python ex1.py` from a terminal opened in this folder.
- Sets have no order, so whenever you print a set of names, print `sorted(...)` of it instead. That way your output matches the expected output every time.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Cinema tickets

A small cinema stores each ticket as a tuple: `(row, seat, film)`. Start with these three tickets:

```python
tickets = [
    ("F", 7, "Moonrise"),
    ("F", 8, "Moonrise"),
    ("G", 2, "Space Cats"),
]
```

1. Someone buys one more ticket: row A, seat 12, for "Moonrise". Add it to the list.
2. Print every ticket on its own line.
3. Print how many tickets were sold, and how many of them are for "Moonrise".
4. Unpack the **third** ticket into three variables, and print its film and row.

Expected output:

```
Row F, seat 7: Moonrise
Row F, seat 8: Moonrise
Row G, seat 2: Space Cats
Row A, seat 12: Moonrise
Tickets sold: 4
Moonrise tickets: 3
Third ticket: Space Cats, row G
```

**Rule:** inside your loops, don't use indexes like `ticket[0]`. Unpack each ticket into named variables instead.

**Bonus:** try to change the seat of the first ticket with `tickets[0][1] = 9`. Read the last line of the error. Why does Python refuse, even though `tickets` is a list?

<details>
<summary>Hint 1</summary>

`tickets` is a list, so it has `append`. What you append is one whole tuple, in its own brackets.

</details>

<details>
<summary>Hint 2</summary>

`for row, seat, film in tickets:` unpacks each ticket as the loop goes. To count the Moonrise tickets, use a counter that starts at 0, like the accumulator pattern from chapter 09.

</details>

---

## Exercise 2 (Easy): Party guest list

People signed up for your party through an online form, and some of them signed up more than once:

```python
signups = ["Ana", "Ben", "Ana", "Cara", "Ben", "Dev", "Ana"]
```

1. Turn the sign-ups into a set of guests. Print how many sign-ups there were, how many real guests there are, and the guest list in alphabetical order.
2. Then three things happen: Eli joins the party, Ben cancels, and Zed sends a message to cancel too (but Zed never signed up).
3. Print whether Ben and Cara are coming, and the final guest list.

Expected output:

```
Sign-ups: 7
Real guests: 4
Guest list: Ana, Ben, Cara, Dev
Ben coming? False
Cara coming? True
Final guest list: Ana, Cara, Dev, Eli
```

**Rule:** Zed's cancellation must not crash your program, and you can't use an `if` to check for Zed first.

<details>
<summary>Hint 1</summary>

`set(signups)` makes the set. To print it as one tidy line, sort it and then `join` it with `", "`.

</details>

<details>
<summary>Hint 2</summary>

There are two ways to remove something from a set. One of them stops with an error when the item isn't there, and one doesn't. Which one fits Zed?

</details>

<details>
<summary>Hint 3</summary>

`"Ben" in guests` is already `True` or `False`, so you can put it straight inside the f-string's braces. Use single quotes around `'Ben'` inside the f-string.

</details>

---

## Exercise 3 (Medium): Bug hunt at the weather station

A weather station program stores one reading as a tuple (year, month, day, temperature) and keeps a set of the cities it covers. Copy it into `ex3.py` and fix it.

```python
# Weather station
reading = (2026, 10, 9, 21)
year, month, day = reading
print(f"Date: {year}-{month}-{day}")
print(f"Temperature: {temp}")
cities = {}
cities.add("Kathmandu")
cities.add("Pokhara")
cities.add("Kathmandu")
print(f"Cities: {len(cities)}")
first_city = cities[0]
print(f"First city (A to Z): {first_city}")
units = ("Celsius")
print(f"Units: {units[0]}")
```

There are 4 bugs. Three of them crash the program. The fourth is sneakier: the program runs, but one line prints the wrong thing. When it's all fixed, you should see:

```
Date: 2026-10-9
Temperature: 21
Cities: 2
First city (A to Z): Kathmandu
Units: Celsius
```

**Rule:** keep `units` as a tuple, and keep `cities` as a set.

<details>
<summary>Hint 1</summary>

Fix one error at a time: run, read the last line of the error, fix, run again. The first error says "too many values to unpack". How many items are in `reading`, and how many names are on the left?

</details>

<details>
<summary>Hint 2</summary>

`'dict' object has no attribute 'add'`: what does `{}` really make?

</details>

<details>
<summary>Hint 3</summary>

A set has no first item, so `cities[0]` can't work. But the label says "A to Z". What gives you a sorted list that you *can* index?

</details>

<details>
<summary>Hint 4</summary>

If you see `Units: C`, look closely at `("Celsius")`. Is that really a tuple? Check the one-item trap in the notes.

</details>

---

## Exercise 4 (Medium): The running club meets the book club

A running club and a book club are planning a joint picnic. Here are their sign-up sheets (Ben and Eli signed up twice by mistake), and the people who've said they're away that weekend:

```python
running_signups = ["Ana", "Ben", "Cara", "Dev", "Ben", "Sandip"]
book_signups = ["Cara", "Eli", "Sandip", "Fay", "Eli"]
away = {"Ben", "Fay"}
```

Print a report that answers these questions:

1. How many members does each club really have?
2. Who is in **both** clubs?
3. Who is in **at least one** club, and how many people is that?
4. Who is **only** in the running club? Who is **only** in the book club?
5. The picnic invites go to everyone in at least one club, except the people who are away. Who gets one?

Expected output:

```
Running club: 5 members
Book club: 4 members
In both clubs: Cara, Sandip
In at least one club: Ana, Ben, Cara, Dev, Eli, Fay, Sandip
Total people: 7
Only running: Ana, Ben, Dev
Only books: Eli, Fay
Picnic invites: Ana, Cara, Dev, Eli, Sandip
```

**Rules:**

- Use set operators (`|`, `&`, `-`) for every question. No loops in this one!
- You'll print a lot of sorted, comma-separated lists. Write a small function, like `show(names)`, that takes a set and **returns** the sorted names as one string. Then use it everywhere.

<details>
<summary>Hint 1</summary>

Start by turning both sign-up lists into sets. The duplicates disappear by themselves.

</details>

<details>
<summary>Hint 2</summary>

Check the table in the notes: "either" is `|`, "both" is `&`, and "this one but not that one" is `-`. The order matters for `-`.

</details>

<details>
<summary>Hint 3</summary>

The picnic question uses two operators. Work out "at least one club" first (in brackets), then take away the people who are away.

</details>

---

## Exercise 5 (Challenge): The class report

Your teacher keeps the names and the quiz scores in two lists that match up by position:

```python
names = ["Ana", "Ben", "Cara", "Dev", "Eli"]
scores = [91, 72, 95, 72, 60]
```

Write these three functions:

1. `grade(score)` returns a letter: `"A"` for 90 or more, `"B"` for 80 or more, `"C"` for 70 or more, and `"D"` for anything lower.
2. `score_summary(scores)` returns **three** values as a tuple: the lowest score, the highest score, and the average.
3. `top_student(names, scores)` returns **two** values as a tuple: the name of the best student and their score.

Then use them to print this report:

```
Ana: 91 (A)
Ben: 72 (C)
Cara: 95 (A)
Dev: 72 (C)
Eli: 60 (D)
Lowest: 60, highest: 95, average: 78.0
Top student: Cara with 95
Different scores: 4 out of 5
Grades given: A, C, D
Grades nobody got: B
```

**Rules:**

- Pair the names and scores with `zip()`, not with indexes.
- Unpack the tuples that your functions return into named variables, like `low, high, average = score_summary(scores)`.
- Keep the four possible grades in a set called `ALL_GRADES`, and build a second set of the grades that were actually given. Use them for the last two lines.

Now test it: change Ben's score to `85` and run it again. Ben should get a `B`, and the last line should change to `Grades nobody got: ` with nothing after it. (Making that last line say `none` instead is a nice bonus.)

<details>
<summary>Hint 1</summary>

`grade` is an `if`/`elif`/`else` chain from chapter 08. Check the biggest number first.

</details>

<details>
<summary>Hint 2</summary>

`score_summary` can be a single `return` line with three values separated by commas. `min`, `max`, `sum` and `len` do the work.

</details>

<details>
<summary>Hint 3</summary>

`top_student` is the "finding the biggest" pattern from chapter 11, but it remembers two things: the best name and the best score. Loop with `for name, score in zip(names, scores):`.

</details>

<details>
<summary>Hint 4</summary>

Start the set of given grades with `set()` (not `{}`!) and `add` each student's grade as you print their line. "How many different scores" is a job for `len(set(...))`. And "grades nobody got" is a difference between two sets.

</details>

---

## Before you move on

Tuples and lists find things by position, like `scores[2]`. But what if you want to look up a price by the product's name, or a phone number by a friend's name, without knowing where it sits in a list?

```python
prices = {"apple": 40, "banana": 25}
print(prices["banana"])
```

Those curly braces aren't a set this time. [Chapter 13](../13-dictionaries/notes.md) shows you Python's most useful collection of all.
