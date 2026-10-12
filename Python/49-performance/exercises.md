# 49 Performance: Exercises

**How to do these:**

- Make a folder for this chapter's exercises, and a new file for each one (`ex1.py`, `ex2.py`, and so on). Open a terminal in that folder.
- All five exercises use only the standard library. To check them with mypy (`python -m mypy ex1.py`) and to run pytest in exercise 5, make and activate a virtual environment as in [chapter 23](../23-pip-and-virtual-environments/notes.md), and install both.
- **Every timing below is from one run on one computer.** Yours will be different, and they'll change a little every time you run. What matters is the *pattern*: which version is faster, and how the times grow. Everything that isn't a timing should match exactly.
- Put hints on every function, as usual.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Count the votes three ways

Sandip's cafe asked 100,000 customers to vote for their favourite drink. Start `ex1.py` with the votes (the seed makes everyone's "random" votes the same):

```python
import random

DRINKS = ["Latte", "Tea", "Mocha", "Flat white", "Chai", "Hot chocolate"]

random.seed(1)
votes = [random.choice(DRINKS) for _ in range(100_000)]
```

Write three functions that take no arguments and return a `dict[str, int]` of drink to number of votes, each in a different way:

- `count_with_loop()`: a `for` loop over `votes`, with `counts.get(vote, 0) + 1` ([chapter 13](../13-dictionaries/notes.md)).
- `count_with_counter()`: `Counter` from [chapter 19](../19-modules-and-standard-library/notes.md), turned into a plain dict with `dict(...)`.
- `count_with_count()`: a dict comprehension that calls `votes.count(drink)` for each drink in `DRINKS`.

Then write `best_ms(func)`, which uses `timeit.repeat` to call `func` 5 times per batch, in 5 batches, and returns the best time for **one** call, in milliseconds. Finish with:

```python
print(count_with_loop() == count_with_counter() == count_with_count())
print(count_with_count())
for func in [count_with_loop, count_with_counter, count_with_count]:
    print(f"{func.__name__:<20}{best_ms(func):>6.2f} ms")
```

One run printed:

```
True
{'Latte': 16630, 'Tea': 16730, 'Mocha': 16520, 'Flat white': 16851, 'Chai': 16718, 'Hot chocolate': 16551}
count_with_loop       4.60 ms
count_with_counter    3.33 ms
count_with_count      4.49 ms
```

The first two lines should match exactly. The times are yours.

**Part 2.** The cafe adds lots of new drinks. Change the menu line to `DRINKS = [f"Drink {n}" for n in range(60)]`, and take out the `print(count_with_count())` line. **Before you run it**, write a comment: which of the three functions do you expect to get slower, and roughly by how much? Then run it. One run printed:

```
True
count_with_loop       5.31 ms
count_with_counter    3.70 ms
count_with_count     55.35 ms
```

Answer in a comment, using a word from Big-O: why did only one of them get much slower?

<details>
<summary>Hint 1</summary>

`timeit.repeat(func, number=5, repeat=5)` gives a list of 5 totals, each for 5 calls. Take the `min`, divide by 5, and multiply by 1000 for milliseconds. The hint for a function that takes nothing and returns a dict is `Callable[[], dict[str, int]]` (`Callable` is in `collections.abc`).

</details>

<details>
<summary>Hint 2</summary>

For part 2: how many times does `votes.count(drink)` walk through all 100,000 votes? Once per drink. With 6 drinks that's 6 walks; with 60 drinks, it's 60. The other two walk through the votes once, however many drinks there are.

</details>

---

## Exercise 2 (Easy): Spot the Big-O at the library

The town library's catalogue program has three small functions. Copy this into `ex2.py`:

```python
import timeit
from collections.abc import Callable
from functools import partial


def newest_book(books: list[str]) -> str:
    """Return the book added last."""
    return books[-1]


def count_starting_with(books: list[str], letter: str) -> int:
    """Count the titles that start with a letter."""
    count = 0
    for title in books:
        if title.startswith(letter):
            count += 1
    return count


def has_duplicates(books: list[str]) -> bool:
    """Return True if any title appears more than once."""
    for title in books:
        if books.count(title) > 1:
            return True
    return False


def best_ms(func: Callable[[], object]) -> float:
    """Return the best time for one call of func, in milliseconds."""
    return min(timeit.repeat(func, number=10, repeat=3)) / 10 * 1000


print(f"{'books':>6} {'newest':>10} {'count':>10} {'duplicates':>12}")
for size in [2_000, 4_000, 8_000]:
    books = [f"Book {n}" for n in range(size)]
    newest = best_ms(partial(newest_book, books))
    count = best_ms(partial(count_starting_with, books, "B"))
    duplicates = best_ms(partial(has_duplicates, books))
    print(f"{size:>6,} {newest:>7.4f} ms {count:>7.3f} ms {duplicates:>9.2f} ms")
```

**Before you run it**, write a comment above each function with your guess: O(1), O(n) or O(n²)? Then run it (it takes a few seconds). One run printed:

```
 books     newest      count   duplicates
 2,000  0.0001 ms   0.051 ms     42.78 ms
 4,000  0.0001 ms   0.178 ms    182.79 ms
 8,000  0.0001 ms   0.479 ms    799.72 ms
```

Check your guesses against the table: when the number of books doubles, does a column stay the same, roughly double, or roughly go up four times?

Then rewrite `has_duplicates` so it's O(n), in **one line**, without changing its name, hint or docstring. Add these checks above the table:

```python
print(has_duplicates(["Dune", "Emma", "Dune"]))  # prints: True
print(has_duplicates(["Dune", "Emma"]))  # prints: False
```

Run it again. The duplicates column should now be well under a millisecond for every size.

<details>
<summary>Hint 1</summary>

`books.count(title)` is a hidden loop: it walks through every book. And it's inside a `for` loop over every book. A loop inside a loop is O(n²).

</details>

<details>
<summary>Hint 2</summary>

A set throws away duplicates ([chapter 12](../12-tuples-and-sets/notes.md)). If the list has duplicates, what happens to its length when you turn it into a set?

</details>

---

## Exercise 3 (Medium): Profile the overdue report

The library's overdue report is slow, and there's more than one reason. First, save this as `make_loans.py` and run it once. It writes `loans.csv` (20,000 loans) and `returned.txt` (the IDs of the 8,000 loans that have come back):

```python
"""Make a big, made-up loans file for the town library."""

import csv
import random
from datetime import date, timedelta

random.seed(3)
first_due = date(2026, 9, 1)

with open("loans.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["loan_id", "member_id", "due"])
    for loan_id in range(1, 20_001):
        member_id = f"M{random.randint(1, 3_000):04}"
        due = first_due + timedelta(days=random.randint(0, 59))
        writer.writerow([loan_id, member_id, due.strftime("%d/%m/%Y")])

returned = random.sample(range(1, 20_001), 8_000)
with open("returned.txt", "w", encoding="utf-8") as f:
    for loan_id in returned:
        f.write(f"{loan_id}\n")

print("Wrote loans.csv and returned.txt")
```

Now save the report as `overdue.py`:

```python
"""Overdue loans report for the town library."""

import csv
import time
from collections import Counter
from datetime import date, datetime

TODAY = date(2026, 10, 12)
FINE_PER_DAY_CENTS = 25


def load_returned(path: str) -> list[str]:
    """Read the IDs of the loans that have been returned."""
    with open(path, encoding="utf-8") as f:
        return [line.strip() for line in f]


def parse_due(text: str) -> date:
    """Turn a due date like 25/09/2026 into a date."""
    return datetime.strptime(text, "%d/%m/%Y").date()


def overdue_loans(path: str, returned: list[str]) -> list[dict[str, str]]:
    """Return the loans that aren't back yet and are past their due date."""
    overdue: list[dict[str, str]] = []
    with open(path, newline="", encoding="utf-8") as f:
        for loan in csv.DictReader(f):
            if loan["loan_id"] not in returned and parse_due(loan["due"]) < TODAY:
                overdue.append(loan)
    return overdue


def main() -> None:
    returned = load_returned("returned.txt")
    overdue = overdue_loans("loans.csv", returned)
    fines = sum(
        (TODAY - parse_due(loan["due"])).days * FINE_PER_DAY_CENTS for loan in overdue
    )
    print(f"Overdue loans: {len(overdue):,}")
    print(f"Fines owed: ${fines / 100:,.2f}")
    worst = Counter(loan["member_id"] for loan in overdue).most_common(3)
    print("Most overdue loans:")
    for member_id, count in worst:
        print(f"  {member_id}: {count}")


if __name__ == "__main__":
    start = time.perf_counter()
    main()
    print(f"Took {time.perf_counter() - start:.2f} seconds")
```

`python overdue.py` printed this (your time will be different, but everything else should match):

```
Overdue loans: 8,216
Fines owed: $43,019.75
Most overdue loans:
  M2073: 10
  M0508: 10
  M0281: 9
Took 1.70 seconds
```

Your job: make it faster **one measured step at a time**, the way the notes did it.

1. Run `python -m cProfile -s tottime overdue.py`. In a comment at the top of `overdue.py`, write which function has the biggest `tottime`, and which line inside it you think is to blame.
2. Fix that one thing. Run the report: the five report lines must be exactly the same. (One run: `Took 0.13 seconds`.)
3. Profile again. The top of the table looks completely different now. Write down in your comment what's on top now, and how many times it was called.
4. Fix that too, with a tool from [chapter 34](../34-functional-tools/notes.md). Check the five report lines again. (One run: `Took 0.04 seconds`.)
5. Add `print(parse_due.cache_info())` at the end of `main`, run once, and explain the numbers in your comment. Then take the line out again.

mypy should say `Success` at the end.

<details>
<summary>Hint 1</summary>

In step 1, `overdue_loans` has a huge `tottime`, so the slow part is in its own lines, not in something it calls. Which of its operations walks through a list of 8,000 items, once for every one of the 20,000 loans?

</details>

<details>
<summary>Hint 2</summary>

In step 3, the top rows are names like `_strptime`, from Python's own date-parsing code. How many *different* due dates are there in the file? Look at `make_loans.py`: `random.randint(0, 59)`.

</details>

<details>
<summary>Hint 3</summary>

In step 5, you should see `misses=60`. The number of hits plus misses is how many times `parse_due` was called. Why is that more than 20,000? Think about where else `parse_due` is called.

</details>

---

## Exercise 4 (Medium): The gym's memory bill

Sandip's gym logs every visit: who came, and how many minutes they stayed. Start `ex4.py` with a generator ([chapter 31](../31-iterators-and-generators/notes.md)) that makes up a million visits:

```python
import sys
import tracemalloc
from collections.abc import Callable, Iterator

VISITS = 1_000_000


def check_ins(count: int) -> Iterator[tuple[str, int]]:
    """Make up `count` gym visits: (member ID, minutes spent)."""
    for n in range(count):
        yield f"M{n % 5_000:04}", 20 + (n * 37) % 90
```

Write two functions that both return the average visit length in minutes:

- `average_from_list(count)` turns `check_ins(count)` into a list first, then works out the average from the list. Before it returns, it prints the list's size according to `sys.getsizeof`, in MB.
- `average_streaming(count)` loops over `check_ins(count)` directly, keeping a running total and a running count. No list.

Then write `peak_mb(func)`, which resets the peak with `tracemalloc.reset_peak()`, calls `func(VISITS)`, and returns a tuple: the answer, and the peak memory in MB. Finish with:

```python
tracemalloc.start()
for func in [average_from_list, average_streaming]:
    average, peak = peak_mb(func)
    print(f"{func.__name__:<18} average {average:.2f} minutes, peak {peak:.2f} MB")
```

Expected output (your memory numbers may be a little different on another Python version):

```
  (sys.getsizeof says the list is 8.4 MB)
average_from_list  average 64.50 minutes, peak 110.45 MB
average_streaming  average 64.50 minutes, peak 0.11 MB
```

Answer in a comment: `getsizeof` says the list is 8.4 MB, but `tracemalloc` saw a peak of over 100 MB. Where did the rest come from?

<details>
<summary>Hint 1</summary>

`average_streaming` needs two numbers that start at 0 before the loop: the total minutes, and how many visits you've seen. You can unpack each visit with `for _, minutes in check_ins(count):`, because the member ID isn't needed.

</details>

<details>
<summary>Hint 2</summary>

`peak_mb` takes a function that takes an `int` and returns a `float`, so its hint is `Callable[[int], float]`. Its return hint is `tuple[float, float]`. `tracemalloc.get_traced_memory()` gives back `(current, peak)` in bytes.

</details>

<details>
<summary>Hint 3</summary>

For the question: what does the list actually hold? A million tuples, and each tuple holds a string and a number. Chapter 31 warned that `getsizeof` only measures the list itself.

</details>

---

## Exercise 5 (Challenge): The bank's slow night

Every night, Sandip's bank imports the day's transactions and prints a summary. It's getting slower as the bank grows. Save this as `bank_slow.py`:

```python
"""Import a day's transactions, then show every account's balance."""

import sqlite3
import time
from pathlib import Path

NAMES = ["Sandip", "Maya", "Leo", "Zoe", "Priya", "Sam", "Aisha", "Tom"]


def make_transactions() -> list[tuple[int, int]]:
    """1,000 made-up transactions: (account ID, amount in cents)."""
    return [(n % 100 + 1, (n * 7919) % 20_000 - 5_000) for n in range(1_000)]


def create_tables(con: sqlite3.Connection) -> None:
    con.execute("CREATE TABLE accounts (id INTEGER PRIMARY KEY, owner TEXT NOT NULL)")
    con.execute(
        "CREATE TABLE transactions "
        "(account_id INTEGER NOT NULL, amount_cents INTEGER NOT NULL)"
    )
    owners = [(n, f"{NAMES[n % 8]} {n}") for n in range(1, 101)]
    con.executemany("INSERT INTO accounts VALUES (?, ?)", owners)
    con.commit()


def import_transactions(
    con: sqlite3.Connection, transactions: list[tuple[int, int]]
) -> None:
    for account_id, amount_cents in transactions:
        con.execute(
            "INSERT INTO transactions VALUES (?, ?)", (account_id, amount_cents)
        )
        con.commit()


def balances(con: sqlite3.Connection) -> list[tuple[str, int]]:
    """Return (owner, balance in cents) for every account, in ID order."""
    result: list[tuple[str, int]] = []
    accounts = con.execute("SELECT id, owner FROM accounts ORDER BY id").fetchall()
    for account_id, owner in accounts:
        (balance,) = con.execute(
            "SELECT SUM(amount_cents) FROM transactions WHERE account_id = ?",
            (account_id,),
        ).fetchone()
        result.append((owner, balance))
    return result


def main() -> None:
    Path("bank.db").unlink(missing_ok=True)  # start fresh every run
    con = sqlite3.connect("bank.db")
    create_tables(con)

    start = time.perf_counter()
    import_transactions(con, make_transactions())
    print(f"Imported 1,000 transactions in {time.perf_counter() - start:.3f} seconds")

    queries: list[str] = []
    con.set_trace_callback(queries.append)  # remember every SQL statement run
    start = time.perf_counter()
    all_balances = balances(con)
    seconds = time.perf_counter() - start
    con.set_trace_callback(None)
    print(f"Balances for {len(all_balances)} accounts in {seconds:.4f} seconds")
    print(f"SQL statements run: {len(queries)}")

    owner, richest = max(all_balances, key=lambda pair: pair[1])
    print(f"Richest: {owner} with ${richest / 100:,.2f}")
    total = sum(balance for _, balance in all_balances)
    print(f"All balances together: ${total / 100:,.2f}")
    con.close()


if __name__ == "__main__":
    main()
```

One new thing: `con.set_trace_callback(queries.append)` tells the connection to call `queries.append` with the text of every SQL statement it runs, so `len(queries)` counts them. `set_trace_callback(None)` switches that off again. Run it:

```
Imported 1,000 transactions in 4.128 seconds
Balances for 100 accounts in 0.0111 seconds
SQL statements run: 101
Richest: Sandip 96 with $685.50
All balances together: $50,005.00
```

Copy it to `bank.py`, and make `bank.py` fast. Keep `bank_slow.py` as it is: your tests will need it.

1. Rewrite `import_transactions` so it adds all the transactions in **one** transaction, with no loop in your code.
2. Rewrite `balances` so it gets everything with **one** SQL statement. It must give back exactly the same list, in the same order. (Every account in this data has at least one transaction, so you don't need to worry about accounts with none.)
3. Write `test_bank.py` with pytest ([chapter 36](../36-testing-with-pytest/notes.md)) that proves the fast version gives the same balances as the slow one. Use `":memory:"` databases, so the tests don't touch `bank.db`. Add a second test with three tiny transactions of your own, where you can work out the right balances by hand.

When you're done, `python bank.py` printed:

```
Imported 1,000 transactions in 0.006 seconds
Balances for 100 accounts in 0.0006 seconds
SQL statements run: 1
Richest: Sandip 96 with $685.50
All balances together: $50,005.00
```

`python -m pytest` passes, and `python -m mypy bank.py bank_slow.py test_bank.py` says `Success`. Finally, answer in a comment at the top of `bank.py`: on SQLite, fixing the balances only saved a few milliseconds. Why would the same fix matter much more if the bank used a PostgreSQL server on another computer?

<details>
<summary>Hint 1</summary>

For step 1, look at "Batch your database work" in the notes: `executemany` inside a `with con:` block. The list of transactions is already in the right shape for it.

</details>

<details>
<summary>Hint 2</summary>

For step 2, you need each owner next to the total of their transactions. That's a `JOIN` between the two tables on the account ID, with `SUM(...)` and `GROUP BY accounts.id`, then `ORDER BY accounts.id` ([PostgreSQL chapters 21 and 22](../../PostgreSQL/21-grouping/notes.md)). SQLite understands the same SQL.

</details>

<details>
<summary>Hint 3</summary>

For the tests, write a small helper that makes a `":memory:"` connection and calls `create_tables` on it. In the first test, import the same `make_transactions()` into two fresh databases, one with `bank_slow.import_transactions` and one with `bank.import_transactions`, then compare `bank.balances(...)` with `bank_slow.balances(...)`.

</details>

---

## Before you move on

You can now find out where a program spends its time and memory, instead of guessing, and you know the handful of fixes that solve most slow programs. You also saw, again and again, that the fast version was usually no harder to read than the slow one, as long as you picked the right tool.

Readable code is the theme of the next chapter. In [chapter 50](../50-clean-code-and-style/notes.md), you'll learn what "Pythonic" really means, follow Python's style guide, and let tools like Ruff tidy your code and catch bugs for you.
