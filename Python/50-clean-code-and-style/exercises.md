# 50 Clean Code and Style: Exercises

**How to do these:**

- Make a folder for this chapter's exercises, with a virtual environment inside it ([chapter 23](../23-pip-and-virtual-environments/notes.md)), and install the tools: `python -m pip install ruff mypy pytest pre-commit`.
- Exercises 1 to 4 each get their own file (or two). Exercise 5 is a small project in a folder of its own.
- In every exercise, **the program's output must not change** unless the exercise says so. That's what makes it a refactoring. Run the program (or the tests) before you start, and again after every small step.
- When an exercise says "Ruff is happy", it means `python -m ruff check` says `All checks passed!` with the starter rule set from the notes (`select = ["E", "F", "I", "B", "UP", "SIM"]` in a `pyproject.toml` in your exercises folder), and `python -m ruff format --check` says the files are already formatted.
- Put hints on every function you write.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to review your code, the way a kind senior developer would.

---

## Exercise 1 (Easy): A Pythonic makeover at the cafe

This program summarises a morning's orders at Sandip's cafe. It works, but it reads like it was translated from another language. Copy it into `ex1.py`:

```python
orders = ["Latte", "Tea", "Latte", "Mocha", "Tea", "Latte"]
prices = [350, 225, 350, 400, 225, 350]

total = 0
i = 0
while i < len(orders):
    total = total + prices[i]
    i = i + 1

big_orders = []
for i in range(len(orders)):
    if prices[i] > 300:
        big_orders.append(orders[i])

counts = {}
for order in orders:
    if order in counts.keys():
        counts[order] = counts[order] + 1
    else:
        counts[order] = 1

if len(big_orders) > 0:
    has_big_orders = True
else:
    has_big_orders = False

print("Total: $" + str(total / 100))
print("Big orders: " + str(len(big_orders)))
print("Any big orders? " + str(has_big_orders))
for name in counts:
    print(name + " x" + str(counts[name]))
```

It prints:

```
Total: $19.0
Big orders: 4
Any big orders? True
Latte x3
Tea x2
Mocha x1
```

First, run Ruff on it and write the rule codes it finds in a comment at the top. Then rewrite it the Pythonic way:

- No `while` with a counter, and no `range(len(...))`.
- Add up the prices with a built-in, and build `big_orders` with a comprehension over `zip(..., strict=True)`.
- Count the drinks with `Counter` ([chapter 19](../19-modules-and-standard-library/notes.md)).
- Give the 300 a name.
- `has_big_orders` in one line, without `if`.
- f-strings for every `print`.

The output must stay the same, with one improvement: money should always show two decimal places, so the first line becomes `Total: $19.00`. Ruff is happy, and mypy says `Success`.

<details>
<summary>Hint 1</summary>

`sum(prices)` replaces the whole `while` loop. For `big_orders`, `zip(orders, prices, strict=True)` gives you `(order, price)` pairs to loop over in a comprehension, with an `if` at the end.

</details>

<details>
<summary>Hint 2</summary>

An empty list is falsy and a full one is truthy, so `bool(big_orders)` is `True` exactly when the list has something in it. For the counts, loop over `counts.items()` to get each name and its count together.

</details>

---

## Exercise 2 (Easy): Ruff detective at the bookshop

The town bookshop's stock checker works, but it's full of small problems. In your exercises folder, make sure `pyproject.toml` has the starter Ruff set and mypy's `disallow_untyped_defs = true` (both from the notes). Then copy this into `bookshop.py`:

```python
import json
from typing import Dict, List
import sys


def stock_report(stock: Dict[str, int], low=5, ignore=[]) -> List[str]:
    l = []
    for title in stock.keys():
        if title in ignore:
            continue
        count = stock[title]
        if count < low:
            if count == 0:
                l.append(title + ": SOLD OUT")
            else:
                l.append(title + ": only " + str(count) + " left")
    total = len(l)
    return l


def is_bestseller(sold):
    if sold > 1000:
        return True
    else:
        return False


stock = {"Dune": 2, "Emma": 12, "Matilda": 0, "Beloved": 4}
for line in stock_report(stock):
    print(line)
print(is_bestseller(1500) == True)
```

It prints:

```
Dune: only 2 left
Matilda: SOLD OUT
Beloved: only 4 left
True
```

`python -m ruff check bookshop.py --output-format concise` finds 13 problems:

```
bookshop.py:1:1: I001 [*] Import block is un-sorted or un-formatted
bookshop.py:1:8: F401 [*] `json` imported but unused
bookshop.py:2:1: UP035 `typing.Dict` is deprecated, use `dict` instead
bookshop.py:2:1: UP035 `typing.List` is deprecated, use `list` instead
bookshop.py:3:8: F401 [*] `sys` imported but unused
bookshop.py:6:25: UP006 [*] Use `dict` instead of `Dict` for type annotation
bookshop.py:6:55: B006 Do not use mutable data structures for argument defaults
bookshop.py:6:62: UP006 [*] Use `list` instead of `List` for type annotation
bookshop.py:7:5: E741 Ambiguous variable name: `l`
bookshop.py:8:9: SIM118 [*] Use `key in dict` instead of `key in dict.keys()`
bookshop.py:17:5: F841 Local variable `total` is assigned to but never used
bookshop.py:22:5: SIM103 Return the condition `sold > 1000` directly
bookshop.py:31:7: E712 Avoid equality comparisons to `True`; use `is_bestseller(1500):` for truth checks
Found 13 errors.
[*] 6 fixable with `--fix` (4 unsafe fixes available with `--fix --unsafe-fixes`).
```

Your job:

1. For each **different** rule code, write one line in a comment at the top of the file saying what it means in your own words. Use `python -m ruff rule E741` (and so on) for the ones you don't know.
2. Run `python -m ruff check --fix bookshop.py`. Which problems are left? (Ruff's summary says how many it fixed.)
3. Fix the rest by hand: hints on everything, a docstring for each function, a real name instead of `l`, named constants for `5` and `1000`, and `.items()` to get each title and count together. While you're there, flatten the nested `if` in `stock_report` with a guard clause.
4. Run `python -m ruff format bookshop.py`.

At the end, the program prints exactly the same four lines, Ruff is happy, and `python -m mypy bookshop.py` says `Success`.

<details>
<summary>Hint 1</summary>

E741 is about names like `l`, `O` and `I`, which look like the digits 1 and 0 in many fonts. F841 is a variable you made and never used: if nothing needs `total`, delete the line.

</details>

<details>
<summary>Hint 2</summary>

For B006, use the pattern from [chapter 16](../16-scope-and-mutability/notes.md): `ignore: list[str] | None = None`, then `if ignore is None:` inside. For the guard clause: skip the title when it's ignored **or** when there's plenty of it, with one `if ...: continue`.

</details>

---

## Exercise 3 (Medium): The cinema's mystery function

The Riverside cinema's ticket price function was written in a hurry. Save it as `cinema.py`:

```python
def tp(a, d, s, m):
    # work out the price
    if d == 5 or d == 6:
        p = 1400
    else:
        p = 1100
    if a < 12:
        p = p - 400
    if s == "3d":
        p = p + 250  # 3D glasses
    if m == True:
        p = p * 90 // 100  # members get 15% off
    return p
```

`a` is the customer's age, `d` is the day of the week as `date.weekday()` numbers it ([chapter 22](../22-dates-and-times/notes.md): 0 is Monday, 5 is Saturday), `s` is `"2d"` or `"3d"`, and `m` says whether they're a member. Before you touch it, save these tests as `test_cinema.py`, and check they pass with `python -m pytest`:

```python
import pytest

from cinema import tp


@pytest.mark.parametrize(
    ("age", "weekday", "screen", "member", "expected"),
    [
        (30, 0, "2d", False, 1100),  # Monday, adult
        (30, 5, "2d", False, 1400),  # Saturday
        (8, 2, "2d", False, 700),  # Wednesday, child
        (30, 6, "3d", False, 1650),  # Sunday, 3D
        (8, 5, "3d", True, 1125),  # Saturday, child, 3D, member
        (40, 1, "2d", True, 990),  # Tuesday, member
    ],
)
def test_tp(age: int, weekday: int, screen: str, member: bool, expected: int) -> None:
    assert tp(age, weekday, screen, member) == expected
```

```
......                                                                   [100%]
6 passed in 0.04s
```

(That's what `python -m pytest -q` prints. `-q` means "quiet".) Now refactor `cinema.py` in small steps, running the tests after each one:

1. The new first line of the function must be:

   ```python
   def ticket_price(
       age: int, weekday: int, *, is_3d: bool = False, is_member: bool = False
   ) -> int:
   ```

   Change the test to match: import `ticket_price`, rename the test function to `test_ticket_price`, swap the `"2d"`/`"3d"` column for `False`/`True` and rename it to `is_3d`, rename `member` to `is_member`, and pass the two flags by name. **Don't change any expected price.**

2. Give every number a name in `UPPER_CASE` at the top of the file. The weekend can be a set: `WEEKEND_DAYS = {5, 6}`.
3. Add a module docstring and a function docstring. Delete comments that only repeat the code.

Then add this at the bottom of `cinema.py`:

```python
if __name__ == "__main__":
    print(ticket_price(30, 5))  # prints: 1400
    print(ticket_price(8, 5, is_3d=True, is_member=True))  # prints: 1125
```

At the end: `6 passed`, Ruff is happy, mypy says `Success`, and `python cinema.py` prints `1400` and `1125`.

One more thing: the old comment said members get **15%** off, but the code took off 10%, and the tests (which describe what customers really paid) agree with the code. In a comment, say what you did about it, and what you'd ask the cinema's manager.

<details>
<summary>Hint 1</summary>

In the test, the call becomes `ticket_price(age, weekday, is_3d=is_3d, is_member=is_member)`. If the line gets long, `ruff format` will split it for you.

</details>

<details>
<summary>Hint 2</summary>

`price = WEEKEND_PRICE_CENTS if weekday in WEEKEND_DAYS else WEEKDAY_PRICE_CENTS` replaces the first four lines of the old function. It's the one-line `if` from [chapter 08](../08-conditionals/notes.md), and Ruff's SIM108 suggests the same thing.

</details>

<details>
<summary>Hint 3</summary>

A refactoring never changes what the code does, so the price stays at 10% off. The name `MEMBER_DISCOUNT_PERCENT = 10` now tells the truth, and nothing can quietly disagree with it. Whether the cinema *meant* 15% is a question for a person, not for the code.

</details>

---

## Exercise 4 (Medium): Flatten the library's loan check

The library's loan check is correct, and Ruff even says `All checks passed!`. But it's nested five levels deep. Save it as `loans.py`:

```python
from dataclasses import dataclass, field


@dataclass
class Member:
    name: str
    is_active: bool = True
    loans: list[str] = field(default_factory=list)


@dataclass
class Book:
    title: str
    copies_left: int


def check_loan(member: Member | None, book: Book) -> str:
    if member is not None:
        if member.is_active:
            if len(member.loans) < 5:
                if book.copies_left > 0:
                    if book.title not in member.loans:
                        return member.name + " can borrow " + book.title
                    else:
                        return "You already have this book"
                else:
                    return "No copies left"
            else:
                return "You can only borrow 5 books at a time"
        else:
            return "Your membership has expired"
    else:
        return "Please sign in first"
```

(`field(default_factory=list)` is the dataclass way to give every member their own empty list, from [chapter 30](../30-dataclasses-and-enums/notes.md).) And save its tests as `test_loans.py`:

```python
from loans import Book, Member, check_loan

DUNE = Book("Dune", copies_left=2)


def test_happy_path() -> None:
    assert check_loan(Member("Maya"), DUNE) == "Maya can borrow Dune"


def test_not_signed_in() -> None:
    assert check_loan(None, DUNE) == "Please sign in first"


def test_expired_membership() -> None:
    leo = Member("Leo", is_active=False)
    assert check_loan(leo, DUNE) == "Your membership has expired"


def test_too_many_loans() -> None:
    zoe = Member("Zoe", loans=["A", "B", "C", "D", "E"])
    assert check_loan(zoe, DUNE) == "You can only borrow 5 books at a time"


def test_no_copies_left() -> None:
    assert check_loan(Member("Sam"), Book("Emma", copies_left=0)) == "No copies left"


def test_already_borrowed() -> None:
    priya = Member("Priya", loans=["Dune"])
    assert check_loan(priya, DUNE) == "You already have this book"


def test_expired_beats_everything_else() -> None:
    tom = Member("Tom", is_active=False, loans=["A", "B", "C", "D", "E"])
    assert check_loan(tom, Book("Emma", copies_left=0)) == "Your membership has expired"
```

`python -m pytest -q` says `7 passed`. Rewrite `check_loan` with **guard clauses**:

- No `else` and no `elif` anywhere in the function.
- Nothing indented more than one level inside the function.
- The happy path, the "can borrow" message, is the last line.
- The 5 becomes a constant, `MAX_LOANS`, used in both the check and the message.
- f-strings instead of `+`, and a docstring.

At the end, still `7 passed`, and Ruff and mypy are happy. Answer in a comment: the last test checks that an expired member gets the "expired" message even though they also have too many loans and there are no copies. Why does the **order** of your guard clauses matter for that test?

<details>
<summary>Hint 1</summary>

Turn each condition around. `if member is not None:` with everything inside becomes `if member is None: return "Please sign in first"` at the top, and the rest of the function no longer needs to be indented under it.

</details>

<details>
<summary>Hint 2</summary>

The guards are checked from top to bottom, and the first one that matches wins. The old nested version checked "expired" before "too many loans", so your guards must keep that order.

</details>

---

## Exercise 5 (Challenge): A clean corner shop, guarded by pre-commit

Sandip's corner shop prints receipts with this script. Your job is to set up a proper project around it, with tests and pre-commit, and then clean it up without breaking anything.

**Part 1: set up the project.**

1. Make a folder called `corner-shop` with its own virtual environment.
2. Write a `pyproject.toml` with the same settings as the gym project in the notes ("pre-commit: the checks run themselves"), but the name `corner-shop`. Install the tools with `python -m pip install --group dev`.
3. Add a `.gitignore` (the one from [chapter 39](../39-project-structure-and-packaging/notes.md), plus `.ruff_cache/`) and the `.pre-commit-config.yaml` from the notes.
4. Run `git init` and `pre-commit install`.

**Part 2: save the messy script and pin down what it does.** Save this as `receipt.py`:

```python
import math


def r(items, c=None, d=[]):
    t = 0
    s = ""
    for i in range(len(items)):
        n = items[i][0]
        p = items[i][1]
        q = items[i][2]
        t = t + p * q
        s = s + n + " x" + str(q) + "  $" + str(p * q / 100) + "\n"
    if c == "SAVE10":
        t = t - t * 10 // 100
    if t > 5000:
        t = t
    else:
        t = t + 499
    s = s + "Total: $" + str(t / 100)
    return s


print(r([("Milk", 125, 2), ("Bread", 250, 1), ("Eggs", 310, 1)]))
print()
print(r([("Coffee beans", 1450, 4)], "SAVE10"))
```

Each item is a tuple: the name, the price of one in cents, and how many. Orders of $50 or less pay $4.99 delivery, and the coupon `SAVE10` takes 10% off first. It prints:

```
Milk x2  $2.5
Bread x1  $2.5
Eggs x1  $3.1
Total: $13.09

Coffee beans x4  $58.0
Total: $52.2
```

Before changing anything, write `test_receipt.py` with three tests that call `r` and compare the **whole** receipt text with what it returns *today*, odd-looking money and all: a small order that pays delivery, the coffee order with the coupon, and an order of exactly $50 (one item at 5000 cents). `python -m pytest -q` says `3 passed`.

**Part 3: watch the guard work.** Run `git add .` and `git commit -m "Corner shop receipts"`. The commit is refused, and all three hooks fail:

```
ruff check...............................................................Failed
...
ruff format..............................................................Failed
...
mypy.....................................................................Failed
```

Read the messages in between. Which problems did the hooks already fix in your file, and which ones are left for you? (Run `git diff receipt.py` to see what the hooks changed.)

**Part 4: refactor, with the tests green after every step.** Turn `r` into:

- `format_money(cents: int) -> str`, the one place that turns cents into text.
- `order_total(items: list[Item], coupon: str = "") -> int`, which works out what the customer pays. `Item` is a type alias for `tuple[str, int, int]` ([chapter 25](../25-type-hints/notes.md)).
- `receipt_text(items: list[Item], *, coupon: str = "") -> str`, which builds the lines (a comprehension, then `"\n".join(...)`).
- Named constants for the delivery fee, the free-delivery limit, and a `COUPONS = {"SAVE10": 10}` dictionary, so a new coupon is one new entry.
- The three `print` calls under `if __name__ == "__main__":`, so importing `receipt` in the tests doesn't print anything.

Update the tests to call `receipt_text` (with `coupon=` by name). Same expected text, still `3 passed`.

**Part 5: fix the money, as a separate step.** Now change the behaviour on purpose: money should always have two decimal places (`$2.50`, `$52.20`). Change the tests first and watch them fail, then fix `format_money`, and add a fourth test showing that an unknown coupon changes nothing. `python receipt.py` now prints:

```
Milk x2  $2.50
Bread x1  $2.50
Eggs x1  $3.10
Total: $13.09

Coffee beans x4  $58.00
Total: $52.20
```

**Part 6: commit.** `git add .` and commit again:

```
ruff check...............................................................Passed
ruff format..............................................................Passed
mypy.....................................................................Passed
```

**Part 7: prove the guard still works.** Add this function to `receipt.py` and try to commit it:

```python
def add_item(item: Item, cart: list[Item] = []) -> list[Item]:
    """Add an item to a cart, and return the cart."""
    cart.append(item)
    return cart
```

The commit is refused with `B006 Do not use mutable data structures for argument defaults`. Fix it the [chapter 16](../16-scope-and-mutability/notes.md) way (or delete the function if you don't need it), and commit again.

<details>
<summary>Hint 1</summary>

For the Part 2 tests, the easiest way to get the exact text is to print `repr(r(...))` once: it shows the `\n` line breaks, so you can copy it into your test. The $50 order is `r([("Wine", 5000, 1)])`. Does it get free delivery?

</details>

<details>
<summary>Hint 2</summary>

In Part 3, "files were modified by this hook" means Ruff and the formatter changed `receipt.py`: they removed the unused `import math` and tidied the layout. What's left (the mutable default `d=[]`, the odd `if t > 5000: t = t`, and the missing hints) needs you. You'll fix all of it in Part 4 anyway, and remember to `git add` again after the hooks change a file.

</details>

<details>
<summary>Hint 3</summary>

In `order_total`, `COUPONS.get(coupon, 0)` gives the percent off, or 0 for no coupon or an unknown one, so you don't need an `if` for the coupon at all. For delivery, turn the old `if`/`else` around: add the fee `if total <= FREE_DELIVERY_OVER_CENTS:`.

</details>

---

## Before you move on

You can now make code that other people enjoy reading: Pythonic, consistent with PEP 8, with honest names and small functions, cleaned up in safe steps with tests running, and guarded by Ruff, mypy and pre-commit on every commit.

Clean code also has bigger shapes than single functions: proven ways to arrange whole groups of classes and functions so they're easy to change and test. Those shapes have names, like Strategy, Factory and Repository. In [chapter 51](../51-design-patterns/notes.md), you'll meet them, the Python way.
