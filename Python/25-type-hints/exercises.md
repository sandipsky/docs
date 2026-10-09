# 25 Type Hints: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.py`, `ex2.py`, and so on).
- Run each one with `python ex1.py` from a terminal opened in this folder.
- Set up mypy once before you start: make and activate a virtual environment in this folder, and run `python -m pip install mypy` (see the notes). Then check a file with `python -m mypy ex1.py`.
- Put hints on every function's parameters and return value.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Label the cafe till

A cafe's till program works, but nothing says what goes in or comes out. Copy it into `ex1.py` and add hints to all four functions. Don't change anything else.

```python
def format_money(cents):
    return f"${cents / 100:.2f}"


def line_total(price_cents, quantity):
    return price_cents * quantity


def print_line(name, price_cents, quantity):
    amount = format_money(line_total(price_cents, quantity))
    print(f"{name:<12}{quantity:>3}  {amount:>8}")


def is_big_order(total_cents, limit_cents=5000):
    return total_cents >= limit_cents


print_line("Latte", 350, 2)
print_line("Croissant", 275, 3)
print(format_money(1525))
print(is_big_order(1525))
print(is_big_order(1525, limit_cents=1000))
```

Running it should still print:

```
Latte         2     $7.00
Croissant     3     $8.25
$15.25
False
True
```

And `python -m mypy ex1.py` should say:

```
Success: no issues found in 1 source file
```

Then hover over each function name in VS Code, and check that the pop-up shows your hints.

<details>
<summary>Hint 1</summary>

Money is kept in whole cents, so which type are `cents` and `price_cents`? What type does an f-string always produce?

</details>

<details>
<summary>Hint 2</summary>

One function only prints. What's its return hint? And remember where the hint goes when a parameter has a default value.

</details>

---

## Exercise 2 (Easy): Predict the checker

A cinema has a ticket program with hints already in place, but some of the calls at the bottom are wrong. Copy it into `ex2.py`, exactly as it is:

```python
def ticket_price(age: int, is_member: bool = False) -> float:
    """Cinema ticket price: children under 12 pay half, members get 2.00 off."""
    price = 12.0
    if age < 12:
        price = price / 2
    if is_member:
        price = price - 2
    return price


def seats_left(capacity: int, sold: list[int]) -> int:
    return capacity - len(sold)


print(ticket_price(30))
print(ticket_price("8"))
print(ticket_price(8, True))
print(ticket_price(40, "yes"))
print(seats_left(100, [12, 13, 14]))
print(seats_left("100", [12, 13]))
```

**Before you run anything**, write your predictions as comments at the top of the file:

1. Which of the six `print` lines will mypy complain about?
2. How many lines will Python print before it crashes, if it crashes at all?

Now check your predictions. `python ex2.py` gives:

```
12.0
```

and then a traceback ending in:

```
TypeError: '<' not supported between instances of 'str' and 'int'
```

`python -m mypy ex2.py` gives:

```
ex2.py:16: error: Argument 1 to "ticket_price" has incompatible type "str"; expected "int"  [arg-type]
ex2.py:18: error: Argument 2 to "ticket_price" has incompatible type "str"; expected "bool"  [arg-type]
ex2.py:20: error: Argument 1 to "seats_left" has incompatible type "str"; expected "int"  [arg-type]
Found 3 errors in 1 file (checked 1 source file)
```

Answer in a comment: Python only crashed on one line, but mypy found three. Line 18 would never crash at all. Why not, and why is that worse than a crash?

Finally, fix the three calls so they make sense (an 8-year-old, a member aged 40, and 2 seats sold), until mypy says `Success` and Python prints:

```
12.0
6.0
4.0
10.0
97
98
```

<details>
<summary>Hint 1</summary>

Python stops at the first crash, so it never even reaches the later lines. mypy reads the whole file without running it.

</details>

<details>
<summary>Hint 2</summary>

For line 18, think about truthiness from [chapter 08](../08-conditionals/notes.md). Is the string `"yes"` truthy? What about the string `"no"`?

</details>

---

## Exercise 3 (Medium): Bug hunt at the library

A library's lookup tool crashes when someone asks for a book that doesn't exist. Copy it into `ex3.py`:

```python
Book = dict[str, str]

LIBRARY: list[Book] = [
    {"id": "B1", "title": "Dune", "author": "Frank Herbert"},
    {"id": "B2", "title": "Emma", "author": "Jane Austen"},
    {"id": "B3", "title": "Matilda", "author": "Roald Dahl"},
]


def find_book(book_id: str) -> Book | None:
    """Return the book with this ID, or None if there isn't one."""
    for book in LIBRARY:
        if book["id"] == book_id:
            return book
    return None


def describe(book_id: str) -> str:
    book = find_book(book_id)
    return f"{book['title']} by {book['author']}"


def count_by_author(author: str) -> int:
    count = 0
    for book in LIBRARY:
        if book["author"] == author:
            count += 1
    return count


print(describe("B3"))
print(describe("B9"))
print(count_by_author("Jane Austen"))
```

Running it prints `Matilda by Roald Dahl`, and then crashes with:

```
TypeError: 'NoneType' object is not subscriptable
```

Run mypy on it **before** you change anything. It points straight at the problem:

```
ex3.py:20: error: Value of type "dict[str, str] | None" is not indexable  [index]
Found 1 error in 1 file (checked 1 source file)
```

Fix `describe` so that an unknown ID gives back a friendly message instead of crashing. When you're done, mypy says `Success`, and Python prints:

```
Matilda by Roald Dahl
No book with ID B9
1
```

**Rule:** don't change `find_book`. Its hint is honest: it really can return `None`. The job is to handle that in `describe`.

<details>
<summary>Hint 1</summary>

"Not indexable" means "you can't use `[...]` on this". You can use `["title"]` on a `dict`, but not on `None`, and mypy can see that `book` might be `None`.

</details>

<details>
<summary>Hint 2</summary>

Look at "The bug hints catch best" in the notes. Check `if book is None:` first, and return early. After that check, mypy knows `book` must be a `dict`.

</details>

---

## Exercise 4 (Medium): A typed gradebook

A teacher keeps each student's test scores in a dictionary: the student's name, then a list of their scores. Write `ex4.py`, starting with a type alias for that shape:

```python
Grades = dict[str, list[int]]  # student name -> their scores
```

Then write four functions, with full hints, that use `Grades`:

- `add_grade(grades, student, score)` adds one score for a student, creating their list if they're new. It returns nothing.
- `average(grades, student)` returns the student's average score, or `None` if they have no scores (or aren't in the gradebook at all).
- `best_student(grades)` returns the name of the student with the highest average, or `None` if the gradebook is empty.
- `report(grades)` returns a **list of strings**, one per student in alphabetical order: the name padded to 8 characters, then the average to one decimal place, padded to 6.

Test code:

```python
grades: Grades = {}
add_grade(grades, "Sandip", 82)
add_grade(grades, "Maya", 91)
add_grade(grades, "Sandip", 74)
add_grade(grades, "Leo", 65)
add_grade(grades, "Maya", 88)
print(grades)
for line in report(grades):
    print(line)
print(f"Top of the class: {best_student(grades)}")
print(average(grades, "Zoe"))
print(best_student({}))
```

Expected output:

```
{'Sandip': [82, 74], 'Maya': [91, 88], 'Leo': [65]}
Leo       65.0
Maya      89.5
Sandip    78.0
Top of the class: Maya
None
None
```

And `python -m mypy ex4.py` says `Success: no issues found in 1 source file`.

<details>
<summary>Hint 1</summary>

`average` divides with `/`, so what type is the answer when there is one? Put that together with "or `None`".

</details>

<details>
<summary>Hint 2</summary>

`best_student` can call `average` for each student. mypy will remind you that `average` might give back `None`, so check for that before comparing with `>`.

</details>

<details>
<summary>Hint 3</summary>

In `best_student`, the variable that remembers the best name so far starts as `None`. That's one of the times a variable needs its own hint: `best: str | None = None`.

</details>

---

## Exercise 5 (Challenge): The running log

Sandip logs his runs as text lines like `"2026-10-01,7.5"` (the date, and the distance in km). Here's a program that summarises them. It has no hints, and it crashes:

```python
from datetime import date

LOG = ["2026-09-28,5.0", "2026-10-01,7.5", "2026-10-04,3.2", "2026-10-08,10.0"]


def parse_run(line):
    """Turn "2026-10-01,7.5" into a (date, km) tuple."""
    day_text, km_text = line.split(",")
    return date.fromisoformat(day_text), float(km_text)


def total_km(runs):
    return round(sum([km for day, km in runs]), 1)


def longest_run(runs):
    """Return the run with the most km, or None if there are no runs."""
    if not runs:
        return None
    best = runs[0]
    for run in runs:
        if run[1] > best[1]:
            best = run
    return best


def runs_in_month(runs, year, month):
    return [run for run in runs if run[0].year == year and run[0].month == month]


def summary(runs):
    longest = longest_run(runs)
    return f"{len(runs)} runs, {total_km(runs)} km, longest {longest[1]} km on {longest[0]}"


runs = [parse_run(line) for line in LOG]
print(f"All runs: {summary(runs)}")
print(f"October: {summary(runs_in_month(runs, '2026', 10))}")
print(f"November: {summary(runs_in_month(runs, 2026, 11))}")
```

Running it prints the first line, then crashes on the October line:

```
All runs: 4 runs, 25.7 km, longest 10.0 km on 2026-10-08
```

```
TypeError: 'NoneType' object is not subscriptable
```

Your job, in this order:

1. Copy it into `ex5.py`. **Don't fix anything yet.**
2. Make a type alias `Run` for one run: a tuple of a `date` and a `float`.
3. Add hints to all five functions, using `Run`. Make every hint tell the truth about what the function really does.
4. Run mypy. With honest hints, it finds **two** bugs, something like this (your line numbers may differ):

   ```
   error: Value of type "tuple[date, float] | None" is not indexable  [index]
   error: Argument 2 to "runs_in_month" has incompatible type "str"; expected "int"  [arg-type]
   ```

5. Fix both bugs. A month with no runs should give `no runs yet`.

When you're done, mypy says `Success`, and Python prints:

```
All runs: 4 runs, 25.7 km, longest 10.0 km on 2026-10-08
October: 3 runs, 20.7 km, longest 10.0 km on 2026-10-08
November: no runs yet
```

Finally, answer in a comment: the crash happened in `summary`, but one of the two bugs was somewhere else entirely. Which bug caused October to have no runs, and why didn't it cause an error of its own?

<details>
<summary>Hint 1</summary>

`Run = tuple[date, float]`. Then a list of runs is `list[Run]`, and "a run, or nothing" is `Run | None`.

</details>

<details>
<summary>Hint 2</summary>

`longest_run` really can return `None`, so its hint must say so. That's exactly what lets mypy spot the problem in `summary`.

</details>

<details>
<summary>Hint 3</summary>

For the last question: compare `2026 == "2026"` in the REPL. Is it an error, or just `False`?

</details>

---

## Before you move on

You've now got every tool you need for a real program: argparse for commands, JSON and `pathlib` for saving, `datetime` for due dates, `try`/`except` for when things go wrong, modules to split the code up, and hints to keep it all honest.

Time to put them together. In [chapter 26](../26-project-todo-app/notes.md), you'll build a to-do app for your terminal that remembers your tasks between runs.
