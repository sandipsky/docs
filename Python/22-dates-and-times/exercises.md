# 22 Dates and Times: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.py`, `ex2.py`, and so on).
- Run each one with `python ex1.py` from a terminal opened in this folder.
- Start each file with `from datetime import date, datetime, timedelta` (only the ones you need).
- So that your output matches the expected output, use the fixed date the exercise gives you for "today", not `date.today()`. Once it works, try swapping in `date.today()` and see what changes.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Library due dates

At your local library, books can be borrowed for 21 days, DVDs for 7 days, and magazines for 3 days. Start with:

```python
today = date(2026, 10, 9)
loan_days = {"book": 21, "DVD": 7, "magazine": 3}
```

Print the day you borrowed everything, and the due date for each kind of item.

Expected output:

```
Borrowed on Friday 09 October 2026
book: due Friday 30 October 2026
DVD: due Friday 16 October 2026
magazine: due Monday 12 October 2026
```

**Rule:** don't type any due dates or day names yourself. Python works them all out.

<details>
<summary>Hint 1</summary>

A date plus a `timedelta` is a new date. `timedelta(days=21)` is three weeks.

</details>

<details>
<summary>Hint 2</summary>

The format codes for "Friday 09 October 2026" are `%A %d %B %Y`. You can use them inside an f-string after a colon: `{due:%A %d %B %Y}`.

</details>

---

## Exercise 2 (Easy): Countdown board

You want a little board that shows how far away your upcoming events are. Start with:

```python
today = date(2026, 10, 9)
events = [
    ("New Year's Day", date(2027, 1, 1)),
    ("Marathon", date(2026, 10, 25)),
    ("Dentist", date(2026, 10, 2)),
    ("Sandip's birthday", date(2026, 11, 20)),
    ("Book club", date(2026, 10, 9)),
]
```

Print the events **in date order**, each with how far away it is:

```
Dentist: 7 days ago
Book club: today!
Marathon: in 16 days
Sandip's birthday: in 42 days
New Year's Day: in 84 days
```

<details>
<summary>Hint 1</summary>

`(when - today).days` gives a plain number: positive for the future, `0` for today, negative for the past. An `if`/`elif`/`else` picks the right wording.

</details>

<details>
<summary>Hint 2</summary>

For "7 days ago", you need the number without its minus sign. `abs()` from chapter 05 helps, or just put a minus in front: `-days`.

</details>

<details>
<summary>Hint 3</summary>

To sort by date, here's a trick: tuples are compared item by item, starting with the first. If you build a new list of `(date, name)` tuples (a comprehension does it in one line), `sorted()` puts them in date order.

</details>

---

## Exercise 3 (Medium): Bug hunt at the gym

A gym's program checks how many days each membership has left. It doesn't work. Copy it into `ex3.py` and fix it one error at a time.

```python
# Gym membership checker
import datetime

TODAY = date(2026, 10, 09)

members = [
    ("Asha", "15/01/2026", 365),
    ("Bikash", "20/09/2026", 30),
    ("Chloe", "01/10/2026", 7),
]

for name, joined_text, length in members:
    joined = datetime.strptime(joined_text, "%d/%M/%Y")
    expires = joined + length
    days_left = expires - TODAY
    if days_left < 0:
        print(f"{name}: expired on {expires:%d %B %Y}")
    else:
        print(f"{name}: {days_left.days} days left (until {expires:%d %B %Y})")
```

Each member joined on the date shown, and their membership lasts the number of days shown. There are 6 bugs. Five of them crash the program. The sixth one doesn't: the program runs, but the answers are wrong. When it's all fixed, you should see:

```
Asha: 98 days left (until 15 January 2027)
Bikash: 11 days left (until 20 October 2026)
Chloe: expired on 08 October 2026
```

**Rule:** fix the bugs, don't rewrite the program. Keep the `DD/MM/YYYY` text in the `members` list as it is.

<details>
<summary>Hint 1</summary>

The first error happens before the program even starts. Look at the numbers inside `date(...)`. Then check the import line against the notes: with `import datetime`, what does the name `date` mean?

</details>

<details>
<summary>Hint 2</summary>

Python won't add a plain number to a date. What does `length` count, and what should you wrap it in?

</details>

<details>
<summary>Hint 3</summary>

`strptime` always gives a `datetime`, but `TODAY` is a `date`. One of them needs to change so they're the same kind. (Changing the result of `strptime` is the simpler fix.)

</details>

<details>
<summary>Hint 4</summary>

`days_left` is a `timedelta`, and `0` is an `int`. Either compare with `timedelta()` (which means "no time at all"), or compare the plain number of days.

</details>

<details>
<summary>Hint 5</summary>

If Bikash and Chloe look expired back in **February** and **January**, the dates were read wrongly. Look very carefully at the capital letters in the `strptime` format.

</details>

---

## Exercise 4 (Medium): Cafe shift tracker

Sandip works shifts at a cafe and gets paid 12.00 per hour. Here are this week's shifts, as the day, the start time and the end time:

```python
HOURLY_RATE = 12.00
shifts = [
    ("2026-10-05", "09:00", "17:30"),
    ("2026-10-06", "12:15", "20:00"),
    ("2026-10-08", "08:45", "13:15"),
    ("2026-10-09", "16:00", "23:30"),
    ("2026-10-10", "22:00", "02:00"),
]
```

Print each shift with its weekday and length, then the total time and the pay:

```
Mon 05 Oct  09:00 to 17:30  8h 30m
Tue 06 Oct  12:15 to 20:00  7h 45m
Thu 08 Oct  08:45 to 13:15  4h 30m
Fri 09 Oct  16:00 to 23:30  7h 30m
Sat 10 Oct  22:00 to 02:00  4h 00m
Total: 32h 15m
Pay at 12.00 per hour: 387.00
```

Look closely at the last shift: it starts on Saturday night and ends at 2 in the morning on **Sunday**. It must count as 4 hours, not minus 20.

**Rule:** write a function `hours_and_minutes(length)` that takes a `timedelta` and returns text like `"8h 30m"` or `"4h 00m"`. Use it for every shift and for the total.

<details>
<summary>Hint 1</summary>

Glue the day and the time together into one string, like `f"{day} {start_text}"`, then read it with `datetime.strptime(..., "%Y-%m-%d %H:%M")`. Do the same for the end.

</details>

<details>
<summary>Hint 2</summary>

If the end comes **before** the start, the shift went past midnight. Add `timedelta(days=1)` to the end time.

</details>

<details>
<summary>Hint 3</summary>

In `hours_and_minutes`, turn the timedelta into whole minutes first: `int(length.total_seconds()) // 60`. Then `//` and `%` from chapter 04 split minutes into hours and leftover minutes. `:02d` in an f-string pads the minutes to two digits, so `0` shows as `00`.

</details>

<details>
<summary>Hint 4</summary>

For the running total, start with an empty timedelta, `total = timedelta()`, and add each shift's length to it with `+=`.

</details>

---

## Exercise 5 (Challenge): Library loans that remember

Time to combine dates with JSON files from [chapter 21](../21-json-and-csv/notes.md). A small library keeps its loans in `loans.json`. Books are lent for 14 days. A late book costs 25 cents per day, up to a maximum fine of $5.00. (Work in whole cents, as in chapter 05.)

Start `ex5.py` with this setup code. It resets `loans.json` every time you run the program, so you always get the same output while you build it:

```python
import json

starter = [
    {"title": "The Hobbit", "member": "Asha", "borrowed": "2026-09-10", "returned": None},
    {"title": "Coraline", "member": "Ben", "borrowed": "2026-08-20", "returned": None},
    {"title": "Dune", "member": "Bikash", "borrowed": "2026-09-28", "returned": None},
    {"title": "Matilda", "member": "Chloe", "borrowed": "2026-09-20", "returned": "2026-10-01"},
    {"title": "Wonder", "member": "Sandip", "borrowed": "2026-10-01", "returned": None},
]
with open("loans.json", "w", encoding="utf-8") as f:
    json.dump(starter, f, indent=2)

TODAY = date(2026, 10, 9)
```

Write these functions:

- `load_loans(filename)` and `save_loans(filename, loans)`, using the load-with-a-default pattern from chapter 21.
- `due_date(loan)` returns the due date as a real `date`.
- `fine_for(loan, today)` returns the fine in cents (`0` if it isn't late).
- `report(loans, today)` prints every book that hasn't been returned, in three groups: overdue, due within 3 days, and the rest.
- `return_book(loans, title, today)` marks a book as returned (store today's date as ISO text) and prints the fine. If that title isn't currently on loan, it raises a `ValueError`.
- `borrow(loans, title, member, today)` adds a new loan.

Then, in the main part of the program: load the loans, print the report, return *The Hobbit*, let Asha borrow *Holes*, try to return *Matilda* (it was already returned, so catch the `ValueError`), and save.

Expected output:

```
Library report for Friday 09 October 2026
Overdue:
  The Hobbit (Asha): 15 days late, fine so far $3.75
  Coraline (Ben): 36 days late, fine so far $5.00
Due within 3 days:
  Dune (Bikash): due Monday 12 October 2026
Other loans:
  Wonder (Sandip): due Thursday 15 October 2026

Asha returned The Hobbit. Fine: $3.75
Asha borrowed Holes. Due back Friday 23 October 2026.
Can't return: Matilda is not on loan
Saved 6 loans to loans.json
```

Open `loans.json` afterwards. *The Hobbit* should now have `"returned": "2026-10-09"`, and *Holes* should be at the end with `"returned": null`.

**Finally:** delete the setup lines that reset the file, and run the program twice more. What changes, and why? (Expect a surprise when Asha borrows *Holes* again.)

<details>
<summary>Hint 1</summary>

Dates are stored in the JSON file as ISO text. Turn them into real dates with `date.fromisoformat()` whenever you need to do maths, and back into text with `.isoformat()` when you store them.

</details>

<details>
<summary>Hint 2</summary>

`fine_for`: work out the days late as `(today - due_date(loan)).days`. If that's `0` or less, there's no fine. Otherwise multiply by 25, and `min()` keeps it from going over 500.

</details>

<details>
<summary>Hint 3</summary>

In `report`, skip loans whose `"returned"` is not `None` (`is not None` from chapter 16). For the rest, `(due_date(loan) - today).days` tells you which group a loan belongs to: negative means overdue, `0` to `3` means due soon.

</details>

<details>
<summary>Hint 4</summary>

Build the three groups as three lists first, then print each heading followed by its list. That keeps the printing simple.

</details>

<details>
<summary>Hint 5</summary>

`return_book` loops over the loans looking for one with the right title **and** `"returned"` still `None`. If the loop finishes without finding one, `raise ValueError(f"{title} is not on loan")`, as in chapter 18.

</details>

---

## Before you move on

You've now used a lot of the standard library: `json`, `csv`, `pathlib`, `datetime`, `zoneinfo`. But to make time zones work on Windows, you needed something extra, `tzdata`, that isn't in the box.

Thousands of other packages are out there, written by people all over the world, ready to use. [Chapter 23](../23-pip-and-virtual-environments/notes.md) shows how to install them safely, without one project's packages getting in another's way.

