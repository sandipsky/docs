# 51 Design Patterns: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.py`, `ex2.py`, and so on), unless the exercise says otherwise. Run each one with `python ex1.py` from a terminal opened in this folder.
- Exercises 4 and 5 use pytest, and every exercise should pass mypy. Use a virtual environment with both installed, as in [chapter 36](../36-testing-with-pytest/notes.md): `python -m pip install pytest mypy`.
- Put type hints on every function, and finish each exercise with `python -m mypy` saying `Success`.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Cinema tickets, the strategy way

The Riverside Cinema's full ticket price is $12.00. Different customers pay different amounts:

| Kind | Price |
|---|---|
| `adult` | The full price |
| `child` | Half the full price (round down to a whole cent) |
| `senior` | 30% off the full price (rounded to the nearest cent) |
| `student` | $2.00 off the full price (but never below 0) |

In `ex1.py`, write one small function per kind, each taking the full price in cents and returning the ticket price in cents. Keep them in a dictionary called `PRICES`, with a type alias `PriceRule` for the functions. Then write:

- `ticket_price(kind, full_cents=1200)`, which looks the rule up and uses it. An unknown kind raises a `ValueError` whose message lists every kind there is.
- `basket_total(kinds, full_cents=1200)`, which adds up the prices of a list of kinds.

**Neither function may contain an `if` that checks for a particular kind**, like `if kind == "child"`.

When that works, the cinema adds a fifth kind: `member`, $3.00 off the full price (never below 0). Add it **without changing `ticket_price` or `basket_total` at all.**

Test code:

```python
for kind in PRICES:
    print(f"{kind:<8} {ticket_price(kind)}")
print(basket_total(["adult", "adult", "child", "senior"]))
print(basket_total(["student", "child"], full_cents=900))
try:
    ticket_price("vip")
except ValueError as e:
    print(f"Error: {e}")
```

Expected output:

```
adult    1200
child    600
senior   840
student  1000
member   900
3840
1150
Error: no such ticket: 'vip' (choose from adult, child, senior, student, member)
```

<details>
<summary>Hint 1</summary>

Look at `DELIVERY_RULES` in the notes. The alias is `PriceRule = Callable[[int], int]`, and each value in the dictionary is a function name with no brackets.

</details>

<details>
<summary>Hint 2</summary>

The error message can build its list of choices from the dictionary itself: `", ".join(PRICES)` gives the keys in order. Then a new kind shows up in the message without any extra work. `basket_total` can be one line with `sum()` and a generator expression ([chapter 31](../31-iterators-and-generators/notes.md)).

</details>

---

## Exercise 2 (Easy): Anything the library can lend

A library lends books, DVDs and magazines. They're three separate classes with no parent class, and they don't need one. Each has a `title` attribute and a `loan_days()` method:

| Class | `__init__` takes | `loan_days()` |
|---|---|---|
| `Book` | `title`, `author` | 21 |
| `Dvd` | `title`, `minutes` | 7 |
| `Magazine` | `title`, `issue` (an `int`) | 3 |

In `ex2.py`:

1. Write a protocol called `Borrowable` that says "anything with a `title` that's a `str`, and a `loan_days()` method that returns an `int`".
2. Write the three classes. None of them inherits from `Borrowable`.
3. Write `due_dates(items, today)`, which takes a list of `Borrowable` things and a `date`, and returns a list of lines like `Dune                 due 2026-11-02` (the title padded to 20 characters).

Test code:

```python
loans: list[Borrowable] = [
    Book("Dune", "Frank Herbert"),
    Dvd("Spirited Away", 125),
    Magazine("National Geographic", 112),
]
for line in due_dates(loans, date(2026, 10, 12)):
    print(line)
```

Expected output, and `python -m mypy ex2.py` says `Success`:

```
Dune                 due 2026-11-02
Spirited Away        due 2026-10-19
National Geographic  due 2026-10-15
```

Now the library starts lending umbrellas on rainy days. Add this class, and add `Umbrella("Red")` to the end of `loans`:

```python
class Umbrella:
    def __init__(self, colour: str) -> None:
        self.name = f"{colour} umbrella"

    def loan_days(self) -> int:
        return 1
```

Run the program, then run mypy. Python crashes before it prints anything, with `AttributeError: 'Umbrella' object has no attribute 'title'`. mypy says something like this, without running anything (your line number will be different):

```
ex2.py:58: error: List item 3 has incompatible type "Umbrella"; expected "Borrowable"  [list-item]
ex2.py:58: note: "Umbrella" is missing following "Borrowable" protocol member:
ex2.py:58: note:     title
```

Fix `Umbrella` so that it fits, until mypy says `Success` and the last line is `Red umbrella         due 2026-10-13`. Then answer in a comment: Python happily made the `Umbrella` object and put it in the list. Why didn't it complain until `due_dates` reached it?

<details>
<summary>Hint 1</summary>

A protocol can list attributes as well as methods. Write them just like dataclass fields ([chapter 30](../30-dataclasses-and-enums/notes.md)), with no value: `title: str`.

</details>

<details>
<summary>Hint 2</summary>

`timedelta(days=...)` from [chapter 22](../22-dates-and-times/notes.md) adds days to a date, and `.isoformat()` turns it into text like `2026-11-02`. The `loans: list[Borrowable]` hint matters: without it, mypy decides the list is a `list[object]`, as in the notes' adapter section.

</details>

---

## Exercise 3 (Medium): Welcome to the gym

Riverside Gym wants several things to happen whenever a new member joins. Write an `EventBus` class for them in `ex3.py`, like the one in the notes, but with two improvements:

- `unsubscribe(event, listener)` removes a listener. Unsubscribing a listener that isn't subscribed does nothing (no error).
- `publish(event, member)` keeps going when a listener fails. If a listener raises any exception, print `  (print_card failed: the card printer is out of plastic)` (the listener's name and the error message), and carry on with the next listener. `publish` returns how many listeners finished without an error.

Here are the `Member` class, the listeners and the test code. Put your `EventBus` between `Listener` and `newsletter`:

```python
from collections.abc import Callable
from dataclasses import dataclass


@dataclass
class Member:
    name: str
    plan: str  # "basic" or "premium"


Listener = Callable[[Member], None]

newsletter: list[str] = []


def welcome(member: Member) -> None:
    print(f"  Welcome to Riverside Gym, {member.name}!")


def add_to_newsletter(member: Member) -> None:
    newsletter.append(member.name)
    print(f"  {member.name} added to the newsletter")


def book_trainer(member: Member) -> None:
    if member.plan == "premium":
        print(f"  Personal trainer booked for {member.name}")


def print_card(member: Member) -> None:
    raise RuntimeError("the card printer is out of plastic")


bus = EventBus()
for listener in [welcome, add_to_newsletter, print_card, book_trainer]:
    bus.subscribe("member_joined", listener)

for member in [Member("Priya", "premium"), Member("Tom", "basic")]:
    print(f"{member.name} joined:")
    told = bus.publish("member_joined", member)
    print(f"  {told} of 4 listeners done")

bus.unsubscribe("member_joined", print_card)
bus.unsubscribe("member_joined", add_to_newsletter)
print("Aisha joined:")
print(f"  {bus.publish('member_joined', Member('Aisha', 'premium'))} listeners done")
print(f"Newsletter: {newsletter}")
print(bus.publish("member_left", Member("Tom", "basic")))
```

Expected output:

```
Priya joined:
  Welcome to Riverside Gym, Priya!
  Priya added to the newsletter
  (print_card failed: the card printer is out of plastic)
  Personal trainer booked for Priya
  3 of 4 listeners done
Tom joined:
  Welcome to Riverside Gym, Tom!
  Tom added to the newsletter
  (print_card failed: the card printer is out of plastic)
  3 of 4 listeners done
Aisha joined:
  Welcome to Riverside Gym, Aisha!
  Personal trainer booked for Aisha
  2 listeners done
Newsletter: ['Priya', 'Tom']
0
```

Notice that the broken card printer didn't stop Priya's trainer from being booked. That's the point of the improvement.

<details>
<summary>Hint 1</summary>

Lists have a `.remove(item)` method ([chapter 11](../11-lists/notes.md)), but it raises a `ValueError` if the item isn't there. Check with `in` first. Functions can be compared like any value, so `print_card in some_list` works.

</details>

<details>
<summary>Hint 2</summary>

Every function knows its own name: `listener.__name__` ([chapter 32](../32-decorators/notes.md)). Wrap the call in `try`/`except Exception as e:`. Catching every exception is usually a bad idea ([chapter 18](../18-error-handling/notes.md)), but an event bus is one of the few good places for it: one listener's bug shouldn't stop the others. In a real program, you'd use `logger.exception(...)` instead of `print`.

</details>

<details>
<summary>Hint 3</summary>

Count inside the `try`, after the call: if the listener raised, the counting line never runs. Nobody subscribed to `"member_left"`, so `.get(event, [])` gives an empty list and the count stays `0`.

</details>

---

## Exercise 4 (Medium): The SQLite repository

The notes promised that moving the to-do tasks into a database is one new class. Time to write it.

Make a folder called `ex4`, and copy `tasks.py` from the notes into it. Add a class called `SqliteTaskRepository` with the same three methods as the others, plus a `close()` method. Its `__init__` takes a `Path`, connects to that database file, and creates the `tasks` table if it doesn't exist yet. Use [chapter 42](../42-databases/notes.md)'s SQLite: `?` placeholders, `with con:` for every change, `lastrowid` and `rowcount`.

Then save this test file as `ex4/test_repos.py`. It checks that **every** repository follows the same rules, by running each test three times, once per class:

```python
from collections.abc import Callable
from pathlib import Path

import pytest

from tasks import (
    InMemoryTaskRepository,
    JsonTaskRepository,
    SqliteTaskRepository,
    TaskRepository,
)

MakeRepo = Callable[[Path], TaskRepository]


def make_memory(folder: Path) -> TaskRepository:
    return InMemoryTaskRepository()


def make_json(folder: Path) -> TaskRepository:
    return JsonTaskRepository(folder / "tasks.json")


def make_sqlite(folder: Path) -> TaskRepository:
    return SqliteTaskRepository(folder / "tasks.db")


# Every test below runs three times: once for each kind of repository
every_repo = pytest.mark.parametrize(
    "make_repo", [make_memory, make_json, make_sqlite], ids=["memory", "json", "sqlite"]
)


@every_repo
def test_starts_empty(make_repo: MakeRepo, tmp_path: Path) -> None:
    repo = make_repo(tmp_path)
    assert repo.list_all() == []


@every_repo
def test_add_gives_ids_in_order(make_repo: MakeRepo, tmp_path: Path) -> None:
    repo = make_repo(tmp_path)
    first = repo.add("Buy milk")
    second = repo.add("Call grandma")
    assert (first.id, second.id) == (1, 2)
    assert [task.title for task in repo.list_all()] == ["Buy milk", "Call grandma"]


@every_repo
def test_mark_done_only_once(make_repo: MakeRepo, tmp_path: Path) -> None:
    repo = make_repo(tmp_path)
    repo.add("Buy milk")
    assert repo.mark_done(1) is True
    assert repo.mark_done(1) is False  # already done
    assert repo.mark_done(99) is False  # no such task
    assert repo.list_all()[0].done is True
```

(`every_repo` is `@pytest.mark.parametrize` from [chapter 36](../36-testing-with-pytest/notes.md), saved in a variable so that three tests can share it. A decorator is just a value, as you saw in [chapter 32](../32-decorators/notes.md). `ids=` gives each run a readable name.)

Run the tests **before** you write the class, from inside `ex4`. They can't even start:

```
E   ImportError: cannot import name 'SqliteTaskRepository' from 'tasks' (C:\...\ex4\tasks.py). Did you mean: 'JsonTaskRepository'?
```

When your class is done, `python -m pytest -v` shows (after the header):

```
test_repos.py::test_starts_empty[memory] PASSED                          [ 11%]
test_repos.py::test_starts_empty[json] PASSED                            [ 22%]
test_repos.py::test_starts_empty[sqlite] PASSED                          [ 33%]
test_repos.py::test_add_gives_ids_in_order[memory] PASSED                [ 44%]
test_repos.py::test_add_gives_ids_in_order[json] PASSED                  [ 55%]
test_repos.py::test_add_gives_ids_in_order[sqlite] PASSED                [ 66%]
test_repos.py::test_mark_done_only_once[memory] PASSED                   [ 77%]
test_repos.py::test_mark_done_only_once[json] PASSED                     [ 88%]
test_repos.py::test_mark_done_only_once[sqlite] PASSED                   [100%]

============================== 9 passed in 0.13s ==============================
```

Finally, copy `try_repos.py` from the notes into `ex4`, and change it to use a `JsonTaskRepository` and a `SqliteTaskRepository` (close the SQLite one at the end). With no `tasks.json` or `tasks.db` yet, it prints:

```
JsonTaskRepository: 2 to do, 1 done
SqliteTaskRepository: 2 to do, 1 done
```

<details>
<summary>Hint 1</summary>

A good table for this is `id INTEGER PRIMARY KEY, title TEXT NOT NULL, done INTEGER NOT NULL DEFAULT 0`. SQLite hands back `done` as `0` or `1`, so turn it back into a `bool` when you build each `Task`.

</details>

<details>
<summary>Hint 2</summary>

For `mark_done`, one `UPDATE` can do all the checking: `WHERE id = ? AND done = 0`. Then `cur.rowcount == 1` is exactly "it was there, and it wasn't done yet". For `add`, `cur.lastrowid` is the new ID, but mypy knows it can be `None` (chapter 42 showed what to do about that).

</details>

<details>
<summary>Hint 3</summary>

If the JSON test passes but SQLite's IDs start at the wrong number, check that each test really gets a new database: `tmp_path` is a fresh, empty folder for every test, so `folder / "tasks.db"` is a new file each time.

</details>

---

## Exercise 5 (Challenge): Exchange rates from two services

Sandip is building a travel budget app that converts US dollars into other currencies. He has found two exchange-rate services. Their answers have completely different shapes, and neither knows every currency. Here are their answers, already turned from JSON into Python. Put them at the top of a file called `rates.py`:

```python
from typing import Any

# What the Frankfurt service answers: numbers, in a dictionary
FRANKFURT_ANSWER: dict[str, Any] = {
    "base": "USD",
    "date": "2026-10-12",
    "rates": {"EUR": 0.92, "GBP": 0.79, "NPR": 133.5},
}

# What the Kathmandu service answers: text, in a list
KATHMANDU_ANSWER: dict[str, Any] = {
    "data": [
        {"code": "INR", "per_usd": "83.10"},
        {"code": "NPR", "per_usd": "133.20"},
        {"code": "EUR", "per_usd": "0.9150"},
    ]
}
```

(They're pretend services, written out here so this exercise works without the internet.) A rate means "how much of that currency one US dollar buys". Write:

1. A protocol `RateSource`, with one method: `rate(currency: str) -> float`. If a source doesn't know a currency, it raises a `LookupError` with a helpful message.
2. Two adapters, `FrankfurtAdapter` and `KathmanduAdapter`. Each takes its service's answer in `__init__`, and follows `RateSource`.
3. `FirstThatKnows`, which takes a list of rate sources, and is a rate source itself. Its `rate` asks each source in turn, and gives back the first rate it gets. If none of them knows, it raises `LookupError("nobody knows the rate for JPY")` (with the real currency).
4. `convert(usd_cents, currency, source)`, which returns the amount in cents of the other currency, rounded to a whole number.

Test code, at the bottom of `rates.py`, under `if __name__ == "__main__":`:

```python
    frankfurt = FrankfurtAdapter(FRANKFURT_ANSWER)
    kathmandu = KathmanduAdapter(KATHMANDU_ANSWER)
    both = FirstThatKnows([frankfurt, kathmandu])
    for currency in ["EUR", "NPR", "INR", "JPY"]:
        try:
            print(f"$25.00 = {convert(2500, currency, both) / 100:.2f} {currency}")
        except LookupError as e:
            print(f"Error: {e}")
    print(convert(2500, "NPR", kathmandu))
    print(convert(2500, "NPR", FirstThatKnows([kathmandu, frankfurt])))
```

Expected output:

```
$25.00 = 23.00 EUR
$25.00 = 3337.50 NPR
$25.00 = 2077.50 INR
Error: nobody knows the rate for JPY
333000
333000
```

Look at the rupees: Frankfurt was asked first in `both`, so its rate was used. Put Kathmandu first, and its slightly different rate wins.

Then write `test_rates.py` with **three tests that never use the two real adapters**. Write a small `FakeRates` class instead, which takes a dictionary of rates and also remembers which currencies it was asked about. Test that:

- `convert` rounds to whole cents (for example, a rate of `0.9154` turns `1000` into `915`).
- `FirstThatKnows` falls back to the second source when the first doesn't know, and the first source really was asked.
- `FirstThatKnows` raises a `LookupError` with the right message when nobody knows (use `pytest.raises(..., match=...)` from chapter 36).

`python -m pytest -q` shows `3 passed`, and `python -m mypy rates.py test_rates.py` says `Success`.

Finally, answer in a comment: which patterns from the chapter did you use, and where?

<details>
<summary>Hint 1</summary>

Each adapter turns its own shape into one `float`. Frankfurt: look in `answer["rates"]`. Kathmandu: loop over `answer["data"]` until the `"code"` matches, and `float()` the text. If the loop ends without finding it, raise.

</details>

<details>
<summary>Hint 2</summary>

`FirstThatKnows.rate` is a loop with a `try` inside: `return source.rate(currency)` in the `try`, and `except LookupError: continue`. The final `raise` goes after the loop. Remember from [chapter 28](../28-inheritance/notes.md) that `KeyError` is a child of `LookupError`, so an adapter that lets a `KeyError` escape would still be caught. A message of your own is kinder, though.

</details>

<details>
<summary>Hint 3</summary>

`FakeRates` is like `FakeSender` in the notes: `self.asked: list[str] = []` in `__init__`, and `rate` appends each currency before it looks it up. Then a test can `assert first.asked == ["NPR"]`.

</details>

---

## Before you move on

You now have names for the shapes good code keeps taking: strategies you can swap, factories that pick a class, repositories that hide the storage, and parts passed in so tests can use fakes. Notice how often the reason was "so it's easy to test". The same habits make code easier to keep safe, too.

Safety is next. In [chapter 52](../52-security-basics/notes.md), you'll learn to keep passwords and API keys out of your code, store passwords properly, and close the doors that attackers try first.
