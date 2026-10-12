# 48 Threads, Processes and the GIL: Exercises

**How to do these:**

- Make a folder called `threads-practice` in this chapter's folder, and open a terminal in it. Exercises 1, 2, 4 and 5 only need the standard library. For exercise 3, make and activate a virtual environment, and install `requests` and BeautifulSoup:

  ```
  python -m venv .venv
  .venv\Scripts\Activate.ps1
  python -m pip install requests beautifulsoup4
  ```

- Run each program with `python file_name.py`.
- Put type hints on every function. When you're done, `python -m mypy file_name.py` should say `Success`.
- Times in the expected outputs come from one run on the computer used to write these exercises (14 CPU cores). Times from `time.sleep` should match yours closely. Times for real work and for websites will be different on your computer, and that's fine: compare the times *within* your own run.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Where's my parcel?

Priya runs a small online shop, and every morning she checks on eight parcels, one by one, on the courier's slow website. Save this as `parcels.py`:

```python
import time

STATUSES = {
    "NP-1001": "Delivered",
    "NP-1002": "Out for delivery",
    "NP-1003": "At the sorting centre",
    "NP-1004": "Delivered",
    "NP-1005": "Waiting for collection",
    "NP-1006": "Out for delivery",
    "NP-1007": "Delivered",
    "NP-1008": "Lost (sorry!)",
}


def track(parcel_id: str) -> str:
    """Pretend to ask the courier's slow website about one parcel."""
    time.sleep(1)
    return STATUSES.get(parcel_id, "Unknown parcel")


start = time.perf_counter()
for parcel_id in STATUSES:
    print(f"{parcel_id}: {track(parcel_id)}")
print(f"Took {time.perf_counter() - start:.1f} seconds")
```

It takes `8.0` seconds. Don't change `track`. Change the bottom part so it uses a `ThreadPoolExecutor` and its `map`, and runs twice: once with `max_workers=4`, then with `max_workers=8`. Expected output:

```
NP-1001: Delivered
NP-1002: Out for delivery
NP-1003: At the sorting centre
NP-1004: Delivered
NP-1005: Waiting for collection
NP-1006: Out for delivery
NP-1007: Delivered
NP-1008: Lost (sorry!)
4 workers took 2.0 seconds
NP-1001: Delivered
NP-1002: Out for delivery
NP-1003: At the sorting centre
NP-1004: Delivered
NP-1005: Waiting for collection
NP-1006: Out for delivery
NP-1007: Delivered
NP-1008: Lost (sorry!)
8 workers took 1.0 seconds
```

Watch the screen while the 4-worker version runs: the lines appear in two groups of four. In a comment, explain why it takes exactly 2 seconds, and why the statuses still come out in the right order.

<details>
<summary>Hint 1</summary>

Loop over `[4, 8]`, and inside the loop, open `with ThreadPoolExecutor(max_workers=workers) as executor:`. `executor.map(track, STATUSES)` calls `track` with each parcel ID (looping over a dictionary gives its keys).

</details>

<details>
<summary>Hint 2</summary>

`executor.map` gives the statuses back in the same order as the parcel IDs went in, so `zip(STATUSES, executor.map(...))` pairs each ID with its status.

</details>

---

## Exercise 2 (Easy): The oversold cinema

Sam's cinema sells tickets online. Tonight's screening has 100 seats, and 120 people try to book at the same moment. Save this as `cinema.py` and run it:

```python
import time
from concurrent.futures import ThreadPoolExecutor


class Screening:
    def __init__(self, film: str, seats: int) -> None:
        self.film = film
        self.seats_left = seats
        self.sold = 0

    def book(self, customer: str) -> bool:
        """Sell one ticket if there's a seat left. Return True if it worked."""
        if self.seats_left > 0:
            time.sleep(0.01)  # taking the payment
            self.seats_left -= 1
            self.sold += 1
            return True
        return False


screening = Screening("Dune: Part Three", seats=100)
customers = [f"Customer {number}" for number in range(1, 121)]
with ThreadPoolExecutor(max_workers=20) as executor:
    results = list(executor.map(screening.book, customers))

print(f"Tickets sold: {screening.sold}")
print(f"Seats left:   {screening.seats_left}")
print(f"Turned away:  {results.count(False)}")
```

One run printed:

```
Tickets sold: 119
Seats left:   -19
Turned away:  1
```

Nineteen people have a ticket for a seat that doesn't exist. Fix `Screening` with a lock, so that it always prints:

```
Tickets sold: 100
Seats left:   0
Turned away:  20
```

In a comment, explain the race in your own words: what goes wrong between `if self.seats_left > 0:` and `self.seats_left -= 1`? It's a different shape of race from the bank account in the notes, but the same problem underneath.

<details>
<summary>Hint 1</summary>

Give each `Screening` its own lock in `__init__`: `self._lock = threading.Lock()` (and `import threading` at the top).

</details>

<details>
<summary>Hint 2</summary>

The check ("is there a seat?") and the change ("take one") must happen as one unbroken step. So both have to be inside the same `with self._lock:` block. Locking only the two lines that subtract and add isn't enough. Why not?

</details>

<details>
<summary>Hint 3</summary>

Time the fixed version with `time.perf_counter()`: it takes about a second, because 100 payments now happen one at a time. A real booking system would hold the lock only for a moment, to reserve the seat, and take the payment afterwards, outside the lock. You don't need to do that here, but think about it.

</details>

---

## Exercise 3 (Medium): The cheapest book on each page

Back to the pretend bookshop from [chapter 41](../41-web-scraping/notes.md), `books.toscrape.com`. Its catalogue is spread over 50 pages, at addresses like `https://books.toscrape.com/catalogue/page-1.html`. Write `bookshop_pages.py` that finds the cheapest book on pages 1 to 6, plus page 51 (which doesn't exist), downloading **3 pages at a time** with `requests` in a `ThreadPoolExecutor`.

Write this function. It downloads one page and returns the title and price (in pence) of its cheapest book:

```python
def cheapest_on_page(page: int) -> tuple[str, int]:
```

Rules:

- Be polite: at most 3 pages at a time, `timeout=10`, and a `User-Agent` header, like chapter 41.
- Print the pages in page order, even though they may finish in a different order.
- Page 51 answers `404`. Your program must print a message for it and carry on, not crash.

Expected output (your time will be different):

```
Page 1: £13.99  Starving Hearts (Triangular Trade Trilogy, #1)
Page 2: £12.84  In Her Wake
Page 3: £14.27  Untitled Collection: Sabbath Poems 2014
Page 4: £16.77  The Life-Changing Magic of Tidying Up: The Japanese Art of Decluttering and Organizing
Page 5: £10.16  Patience
Page 6: £15.97  First and First (Five Boroughs #3)
Page 51: failed (404 Client Error: Not Found for url: https://books.toscrape.com/catalogue/page-51.html)
Took 4.04 seconds
```

Then change `max_workers` to `1`, which downloads one page at a time, and compare. On the computer used for these exercises, that took about 10 seconds. Write both times in a comment.

<details>
<summary>Hint 1</summary>

Borrow from chapter 41: `response.encoding = "utf-8"` before reading `response.text` (the `£` trap), `soup.select("article.product_pod")` for the books, the link's `title` attribute for the full title, and `round(float(price_text.replace("£", "")) * 100)` for the pence. `min(books, key=...)` finds the cheapest ([chapter 34](../34-functional-tools/notes.md)).

</details>

<details>
<summary>Hint 2</summary>

Use `executor.submit` for each page, and keep the futures in a dictionary from page number to future: `{page: executor.submit(cheapest_on_page, page) for page in pages}`. A dictionary keeps the order you put things in, so looping over it gives the pages in order.

</details>

<details>
<summary>Hint 3</summary>

The 404 happens inside a thread, when `raise_for_status()` runs. It comes back out when you call `future.result()` for page 51. So put that call inside `try`, and catch `requests.RequestException`.

</details>

---

## Exercise 4 (Medium): The birthday puzzle

Here's a famous puzzle: in a class of 23 people, how likely is it that two of them share a birthday? Most people guess something small, like 6%. You'll find out by simulating hundreds of thousands of random classes. That's pure CPU work.

Save this as `birthdays.py`:

```python
"""How likely is it that two people in a class of 23 share a birthday? Simulate it."""

import os
import random
import time
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor

CLASS_SIZE = 23
CLASSES_PER_CHUNK = 50_000
SEEDS = list(range(8))  # 8 chunks, each with its own seed


def count_shared(seed: int) -> int:
    """Simulate one chunk of random classes. Count the ones with a shared birthday."""
    rng = random.Random(seed)
    shared = 0
    for _ in range(CLASSES_PER_CHUNK):
        birthdays = {rng.randint(1, 365) for _ in range(CLASS_SIZE)}
        if len(birthdays) < CLASS_SIZE:
            shared += 1
    return shared
```

How `count_shared` works: `random.Random(seed)` makes a random number generator of its own ([chapter 05](../05-numbers-and-math/notes.md) used the shared one in the `random` module). Starting it from a fixed **seed** means it gives the same "random" numbers every run, so your counts will match these exactly. Each class gets 23 random birthdays in a set ([chapter 12](../12-tuples-and-sets/notes.md)), and if two people share a day, the set ends up with fewer than 23 days in it.

Add the rest of the program. Run all 8 chunks three ways: one by one with the built-in `map`, with a `ThreadPoolExecutor`, and with a `ProcessPoolExecutor` (leave out `max_workers` for both). Add up the 8 counts each time, and print a line like the ones below. Expected output (your times will be different):

```
This computer has 14 CPU cores
One by one: 203,089 of 400,000 classes (50.8%) in 3.79 s
Threads:    203,089 of 400,000 classes (50.8%) in 3.78 s
Processes:  203,089 of 400,000 classes (50.8%) in 1.05 s
```

Just over 50%! Then answer in comments:

1. Why are the threads no faster than one by one?
2. This computer has 14 cores, and there are 8 chunks. So why weren't the processes 8 times faster?
3. Remove the `if __name__ == "__main__":` line (and un-indent what was under it). Run it, and describe what happens. Then put it back.

<details>
<summary>Hint 1</summary>

Follow `primes.py` in the notes: a `main()` function with three timed parts, called from under `if __name__ == "__main__":`. Each part is `sum(something.map(count_shared, SEEDS))`.

</details>

<details>
<summary>Hint 2</summary>

To avoid writing the long `print` three times, write a small helper, like `def report(label: str, shared: int, seconds: float) -> None:`. `f"{shared:,}"` puts commas in big numbers, and `f"{fraction:.1%}"` turns `0.5077` into `50.8%`.

</details>

<details>
<summary>Hint 3</summary>

For question 2, think about what happens before a single class is simulated (starting the processes, importing the file), and what else a computer's cores do when they're all busy at once.

</details>

---

## Exercise 5 (Challenge): A day at the bank

A bank has three customers and four cashiers. All the day's transactions wait in one queue, and each cashier takes the next one, handles it, and goes back for more, until the bank closes. This combines classes ([chapter 27](../27-classes-and-objects/notes.md)), your own exceptions ([chapter 18](../18-error-handling/notes.md)), a queue, and locks.

Save this as `bank_day.py`:

```python
"""A day at the bank: 4 cashier threads work through a queue of transactions."""

import queue
import threading
import time
from concurrent.futures import ThreadPoolExecutor

Transaction = tuple[str, str, int]  # (owner, "deposit" or "withdraw", cents)


class InsufficientFunds(Exception):
    pass


class BankAccount:
    def __init__(self, owner: str, balance: int = 0) -> None:
        self.owner = owner
        self.balance = balance  # in cents

    def deposit(self, amount: int) -> None:
        current = self.balance
        time.sleep(0.001)  # pretend to update the bank's records
        self.balance = current + amount

    def withdraw(self, amount: int) -> None:
        current = self.balance
        if amount > current:
            raise InsufficientFunds(f"{self.owner} can't withdraw {amount} cents")
        time.sleep(0.001)  # pretend to update the bank's records
        self.balance = current - amount


def make_transactions() -> list[Transaction]:
    """The day's transactions, in the order they arrive."""
    transactions: list[Transaction] = []
    for _ in range(50):
        transactions.append(("Maya", "deposit", 1000))
        transactions.append(("Leo", "deposit", 500))
        transactions.append(("Maya", "withdraw", 300))
        transactions.append(("Leo", "withdraw", 200))
        transactions.append(("Zoe", "deposit", 250))
        transactions.append(("Zoe", "withdraw", 100))
    transactions.append(("Leo", "withdraw", 1_000_000))  # far too much
    transactions.append(("Zoe", "withdraw", 1_000_000))  # far too much
    return transactions
```

The accounts start with Maya on 20,000 cents, Leo on 10,000 and Zoe on 5,000. (That's enough to cover every normal withdrawal, in any order. Only the two huge ones should ever be refused.)

Write two more functions:

```python
def cashier(
    jobs: queue.Queue[Transaction | None], accounts: dict[str, BankAccount]
) -> tuple[int, list[str]]:
```

```python
def main() -> None:
```

- `cashier` takes transactions from the queue and carries them out, until it gets `None` ("closing time"). It catches `InsufficientFunds`, and returns how many transactions it handled, plus a list of the refusal messages.
- `main` creates the three accounts, puts every transaction in the queue, then one `None` for each cashier. It runs 4 cashiers at once, adds up their results, and prints a summary.

Run it **without changing `BankAccount`** first. One run printed this (yours will be wrong in a different way):

```
Handled 302 transactions in 0.12 seconds
Refused: Leo can't withdraw 1000000 cents
Refused: Zoe can't withdraw 1000000 cents
Maya: 33000 cents
Leo: 2600 cents
Zoe: 6300 cents
```

Work out the right final balances by hand, write them in a comment, and then fix `BankAccount`, so that every run prints the same balances (only the time changes):

```
Handled 302 transactions in 0.16 seconds
Refused: Leo can't withdraw 1000000 cents
Refused: Zoe can't withdraw 1000000 cents
Maya: 55000 cents
Leo: 25000 cents
Zoe: 12500 cents
```

Finally, answer in a comment: you added locks, so why is the fixed version still fast? (Hint: how many locks are there, and who has to wait for whom?)

<details>
<summary>Hint 1</summary>

`cashier` is a `while True:` loop around `jobs.get()`, like the printer in the notes. Unpack each transaction with `owner, kind, cents = job`, and call `accounts[owner].deposit(cents)` or `.withdraw(cents)`. Count every transaction you handled, refused or not.

</details>

<details>
<summary>Hint 2</summary>

A plain `threading.Thread` can't return anything, but an executor can. In `main`, submit `cashier` four times to a `ThreadPoolExecutor(max_workers=4)`, keep the four futures, and call `.result()` on each to get its `(count, refusals)`. Sort the refusals before you print them, because the cashiers may find them in either order.

</details>

<details>
<summary>Hint 3</summary>

Give each `BankAccount` its own lock in `__init__`. In `deposit`, everything from reading the balance to writing the new one goes inside `with self._lock:`. In `withdraw`, the check `if amount > current` goes inside too: a check made with an out-of-date balance is no check at all.

</details>

---

## Before you move on

You've now seen all three ways Python does more than one thing at a time: async juggling for lots of waiting, threads for waiting with ordinary code, and processes for real number-crunching on several cores. You've also seen what goes wrong when threads share data, and how a lock or a queue fixes it.

Every exercise here started with a measurement, and that's no accident. Before reaching for threads or processes, you need to know where your program actually spends its time. [Chapter 49](../49-performance/notes.md) is all about that: measuring first, finding the slow part, and the usual fixes, many of which make a program faster without any extra cooks at all.
