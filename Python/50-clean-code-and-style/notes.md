# 50 Clean Code and Style

## What is it?

**Clean code** is code that's easy to read, easy to understand and easy to change, for other people and for you in six months' time. **Style** is how the code looks: names, spacing, line breaks, the order of imports.

Python has an official style guide, called **PEP 8**, and a word for code that uses the language the way it was meant to be used: **Pythonic**. This chapter covers both, and the tools that check your code and tidy it for you: **Ruff**, **mypy** and **pre-commit**.

## Why does it matter?

What does this line do?

```python
print(price("plus", 20, True, 0))  # prints: 3200
```

You can't tell. What's `True`? What's `0`? Is 3200 dollars, or cents? To find out, you have to open `price` and read it, and here it is:

```python
def price(t, a, s, m):
    # calculate price
    if t == "basic" or t == "plus" or t == "premium":
        if t == "basic":
            p = 2500
        elif t == "plus":
            p = 4000
        else:
            p = 6000
        if a < 18 or a >= 65:
            p = p - p * 30 // 100
        else:
            if s == True:
                p = p - p * 20 // 100
        if m >= 12:
            p = p - 500  # 10% off for loyal members
        return p
    else:
        return -1
```

It works. It gives the right prices. But every name is one letter, the numbers have no names, the rules are buried three levels deep, and one comment is simply wrong (taking off 500 cents isn't "10% off"). Later in this chapter, you'll turn it into this, without changing a single price:

```python
print(monthly_price("plus", 20, is_student=True))  # prints: 3200
```

**Code is read much more often than it's written.** PEP 8, Python's style guide, says so near its start. You write a function once, but you, your teammates and code reviewers will read it every time they fix a bug near it or add a feature. Messy code costs a little extra on every one of those reads. Bugs hide in it, changes feel scary, and the person most often confused by your old code is you.

The ideas in this chapter aren't new if you did the [JavaScript course](../../JavaScript/45-clean-code/notes.md): good names, small functions, no magic numbers. This is the Python version, plus the tools that do most of the work for you.

## Real-world example

Think of a recipe. Your own scribbled notes work fine for you: "flour, the usual amount, bake till done". But hand them to a friend, and they're lost. A recipe written for other people uses standard measurements, numbered steps, and a note where something is surprising.

| Your scribbled notes | A recipe for others | In code |
|---|---|---|
| "the white stuff" | "200 g plain flour" | Meaningful names |
| "the usual amount" | "2 teaspoons" | Named constants, not magic numbers |
| One long paragraph | Numbered steps, one job each | Small functions that do one thing |
| Your own shorthand | Standard measurements everyone knows | PEP 8: everyone's Python looks alike |
| "careful here" | "Rest the dough 10 minutes, or it shrinks" | Comments that explain *why* |
| A friend who checks the recipe before it's printed | A proofreader | Ruff and mypy |
| Re-typing the recipe neatly | A tidy layout, done for you | `ruff format` |

## How it works

### What "Pythonic" means

Type this into the Python REPL:

```python
import this
```

You'll see a poem called **The Zen of Python**:

```
The Zen of Python, by Tim Peters

Beautiful is better than ugly.
Explicit is better than implicit.
Simple is better than complex.
Complex is better than complicated.
Flat is better than nested.
Sparse is better than dense.
Readability counts.
Special cases aren't special enough to break the rules.
Although practicality beats purity.
Errors should never pass silently.
Unless explicitly silenced.
In the face of ambiguity, refuse the temptation to guess.
There should be one-- and preferably only one --obvious way to do it.
Although that way may not be obvious at first unless you're Dutch.
Now is better than never.
Although never is often better than *right* now.
If the implementation is hard to explain, it's a bad idea.
If the implementation is easy to explain, it may be a good idea.
Namespaces are one honking great idea -- let's do more of those!
```

It's a little joke hidden in Python, but it's also the closest thing Python has to a philosophy. A few lines you'll meet again in this chapter:

- **Readability counts.** That's the whole chapter in two words.
- **Explicit is better than implicit.** Say what you mean: `is_student=True`, not a mystery `True`.
- **Flat is better than nested.** Guard clauses ([chapter 18](../18-error-handling/notes.md)) instead of `if` inside `if` inside `if`.
- **Errors should never pass silently.** Don't hide problems with a bare `except:`, and don't return a secret `-1` for "something went wrong".
- **One obvious way to do it.** (The "Dutch" line is a friendly joke about Guido van Rossum, Python's creator, who is Dutch.)

Code is **Pythonic** when it uses Python's own tools for a job, instead of copying habits from other languages. Here's a to-do list printer written the long way:

```python
tasks = ["Buy milk", "Call grandma", "Water the plants"]
done = [False, True, False]

i = 0
while i < len(tasks):
    if done[i] == True:
        box = "x"
    else:
        box = " "
    print(str(i + 1) + ". [" + box + "] " + tasks[i])
    i = i + 1

if len(tasks) == 0:
    print("Nothing to do!")
```

And the Pythonic way, using things you already know:

```python
tasks = ["Buy milk", "Call grandma", "Water the plants"]
done = [False, True, False]

for number, (task, is_done) in enumerate(zip(tasks, done, strict=True), start=1):
    box = "x" if is_done else " "
    print(f"{number}. [{box}] {task}")

if not tasks:
    print("Nothing to do!")
```

Both print:

```
1. [ ] Buy milk
2. [x] Call grandma
3. [ ] Water the plants
```

`zip` pairs each task with its done flag ([chapter 12](../12-tuples-and-sets/notes.md)), `enumerate(..., start=1)` numbers them ([chapter 11](../11-lists/notes.md)), and the brackets in `(task, is_done)` unpack each pair. `strict=True` (Python 3.10 or newer) is a safety catch: if the two lists ever have different lengths, `zip` stops with `ValueError: zip() argument 2 is shorter than argument 1`, instead of quietly dropping the extra tasks. Ruff, coming later, reminds you to add it.

The usual swaps:

| Instead of | Write | From |
|---|---|---|
| `for i in range(len(tasks)):` and `tasks[i]` | `for task in tasks:` | [Chapter 09](../09-loops/notes.md) |
| Your own counter, `i = i + 1` | `enumerate(tasks, start=1)` | [Chapter 11](../11-lists/notes.md) |
| Two lists by index | `zip(names, scores, strict=True)` | [Chapter 12](../12-tuples-and-sets/notes.md) |
| `if is_done == True:` | `if is_done:` | [Chapter 08](../08-conditionals/notes.md) |
| `if len(tasks) == 0:` | `if not tasks:` (empty is falsy) | [Chapter 08](../08-conditionals/notes.md) |
| `if result == None:` | `if result is None:` | [Chapter 16](../16-scope-and-mutability/notes.md) |
| `"Total: " + str(total)` | `f"Total: {total}"` | [Chapter 06](../06-strings/notes.md) |
| `temp = a`, `a = b`, `b = temp` | `a, b = b, a` | [Chapter 12](../12-tuples-and-sets/notes.md) |
| A loop that only appends | A comprehension | [Chapter 15](../15-comprehensions/notes.md) |
| `if key in prices:` ... `else:` a default | `prices.get(key, default)` | [Chapter 13](../13-dictionaries/notes.md) |
| `f = open(...)` and `f.close()` | `with open(...) as f:` | [Chapter 20](../20-files-and-folders/notes.md) |

And remember EAFP and LBYL from [chapter 18](../18-error-handling/notes.md): both are Pythonic. Look first when a simple check matches the rule exactly. Otherwise, just try it and catch the exception.

### PEP 8: Python's style guide

A **PEP** is a "Python Enhancement Proposal": a document that suggests a change or a rule for Python. **PEP 8** is the one about style, and you've been following it since [chapter 02](../02-variables/notes.md). Here are the essentials in one place:

| What | PEP 8 says | Example |
|---|---|---|
| Variables and functions | `snake_case` | `total_cents`, `send_reminder()` |
| Classes | `CapitalWords` | `BankAccount`, `LibraryCard` |
| Constants | `UPPER_CASE` | `MAX_LOANS = 5` |
| Internal names | One leading underscore | `_balance` ([chapter 27](../27-classes-and-objects/notes.md)) |
| Indentation | 4 spaces, never tabs | |
| Line length | At most 79 characters (many teams agree on more; Ruff uses 88) | |
| Blank lines | Two around top-level functions and classes, one between methods | |
| Spaces | Around `=` and operators, after commas, none inside brackets (and none around `=` in `tip_percent=15`, chapter 10) | `total = price * (1 + rate)` |
| `None`, `True`, `False` | Compare with `is`, or just use truthiness | `if card is None:` |
| Imports | At the top, one per line, in three groups | See below |

Imports go in three groups, with a blank line between them: the **standard library** first, then **third-party** packages you installed, then **your own** modules:

```python
"""Monthly report for Sandip's gym."""

import csv
import sys
from datetime import date

import requests

from gym import monthly_price
```

(`gym` is your own module: you'll write it later in this chapter.) You'll never sort imports by hand again, though: Ruff does it for you.

PEP 8 also has a section called "A Foolish Consistency is the Hobgoblin of Little Minds". It says the guide isn't a law: being consistent *within one project* matters more, and you can break a rule when following it would make the code harder to read. The whole guide is at <https://peps.python.org/pep-0008/>. It's worth one slow read.

### Docstrings: PEP 257

[Chapter 10](../10-functions/notes.md) introduced docstrings. **PEP 257** is the short guide for writing them:

```python
"""Late fees for the town library, in whole cents."""

FEE_PER_DAY_CENTS = 25
MAX_FEE_CENTS = 1000


def late_fee(days_late: int) -> int:
    """Return the late fee for one book, in cents.

    The fee is 25 cents a day, but never more than $10. A book
    that comes back on time (or early) costs nothing.
    """
    if days_late <= 0:
        return 0
    return min(days_late * FEE_PER_DAY_CENTS, MAX_FEE_CENTS)


help(late_fee)
print(late_fee(3), late_fee(100), late_fee(-2))  # prints: 75 1000 0
```

`help(late_fee)` shows:

```
Help on function late_fee in module __main__:

late_fee(days_late: int) -> int
    Return the late fee for one book, in cents.

    The fee is 25 cents a day, but never more than $10. A book
    that comes back on time (or early) costs nothing.
```

The rules:

- Always triple double quotes, `"""`, even for one line.
- The first line is a short summary that **gives a command**: "Return the late fee", not "Returns the late fee" or "This function returns...". It ends with a full stop.
- For more detail, leave one blank line after the summary, then write as much as you need.
- A docstring at the very top of a file describes the whole **module**.

Write about what the function does and what it gives back, not how it works inside. Type hints already say *what types* go in and out, so the docstring can talk about meaning instead. (You'll see longer styles in big projects, with headings like `Args:` and `Returns:`. They're fine too: pick one and stick to it.)

### Good names

A name is a tiny piece of documentation that's there every time the thing is used. Compare:

```python
from datetime import date


def chk(d1, d2):
    x = (d2 - d1).days
    if x > 30:
        return True
    else:
        return False


print(chk(date(2026, 8, 1), date(2026, 10, 12)))
```

```python
from datetime import date

INACTIVE_AFTER_DAYS = 30


def is_inactive(last_visit: date, today: date) -> bool:
    """Return True if a gym member hasn't been in for a while."""
    days_away = (today - last_visit).days
    return days_away > INACTIVE_AFTER_DAYS


print(is_inactive(date(2026, 8, 1), today=date(2026, 10, 12)))
```

Both print `True`. But only the second one tells you what it's for, what goes in, and what the 30 means. Notice `return days_away > INACTIVE_AFTER_DAYS`: a comparison already gives `True` or `False`, so `if ...: return True else: return False` was just a long way of saying it.

Some habits:

- **Functions do things, so start with a verb:** `send_reminder`, `load_orders`, `calculate_total`. A function that just works out a value can be named after the value: `late_fee`, `monthly_price`.
- **True/false names ask a question:** `is_inactive`, `is_student`, `has_paid`, `can_borrow`. Then `if is_student:` reads like English.
- **Plurals for collections:** `book` is one, `books` is a list of them, and `for book in books:` reads naturally.
- **Put the unit in the name:** `price_cents`, `timeout_seconds`, `distance_km`.
- **No cryptic abbreviations:** `customer`, not `cstmr`. Short names are fine where everyone knows them: `i` in a tiny loop, `f` for an open file, `e` in `except ValueError as e`.
- **Don't hide built-ins:** a variable called `list`, `id`, `sum` or `input` hides the built-in function of the same name ([chapter 16](../16-scope-and-mutability/notes.md)).

### Small functions, few parameters

A function should do **one job**, and its name should say what that job is. If describing it needs the word "and" ("reads the file *and* works out the totals *and* prints the report"), it wants to be split up. Small functions are easier to name, to test ([chapter 36](../36-testing-with-pytest/notes.md)) and to reuse.

Functions should also take as few parameters as they can. Three is fine. Six is hard to call correctly, especially when some of them are `True`/`False` flags. Python has a neat fix for flags: put a `*` in the parameter list, and every parameter after it **must** be passed by name. They're called **keyword-only** parameters:

```python
def book_class(
    member: str, class_name: str, *, waitlist: bool = False, send_email: bool = True
) -> str:
    """Book a member into a gym class."""
    note = " (waitlist)" if waitlist else ""
    email = ", email sent" if send_email else ""
    return f"{member} booked into {class_name}{note}{email}"


print(book_class("Maya", "Yoga"))
print(book_class("Leo", "Spin", waitlist=True, send_email=False))
print(book_class("Zoe", "Pilates", True, False))
```

```
Maya booked into Yoga, email sent
Leo booked into Spin (waitlist)
```

Then the third call crashes:

```
TypeError: book_class() takes 2 positional arguments but 4 were given
```

That's exactly what you want. `book_class("Zoe", "Pilates", True, False)` is the mystery-`True` problem from the start of the chapter, and now Python refuses it. (mypy catches it before you run anything: `Too many positional arguments for "book_class"`.) It's Python's answer to the "options object" from the JavaScript course.

### Magic numbers, repeats, comments and dead code

Four more habits, all shown in the walkthrough that comes next:

- **No magic numbers.** A **magic number** is a number with no explanation, like the `30` in `chk`. Give it a name in `UPPER_CASE` at the top of the file ([chapter 02](../02-variables/notes.md)). When the rule changes, you change one line. (Obvious numbers, like `/ 100` for a percentage or `+ 1` to count from 1, don't need names.)
- **DRY, but don't overdo it.** "Don't Repeat Yourself" ([chapter 10](../10-functions/notes.md)) means each *piece of knowledge*, like a price or a rule, lives in one place. It doesn't mean squashing every pair of similar-looking lines into one clever function. A common rule of thumb: wait until you've written the same thing three times.
- **Comments say why, not what.** The code already says *what* it does. `# add 1 to count` is noise, and `# 10% off` next to code that takes off $5 is worse than noise. Good comments explain what the code *can't*: "The bank rejects amounts over $10,000, so we split them here."
- **Delete dead code.** Commented-out old versions and functions nobody calls just get in the way. If you use Git, it remembers every old version for you.

### A refactoring walkthrough: the gym's prices

**Refactoring** means changing how code is written *without* changing what it does. Let's refactor the `price` function from the start of the chapter, safely.

**Step 0: tests first.** Before you change anything, write tests that pin down what the code does *now*, right or wrong. Make a folder called `gym`, save the messy function from "Why does it matter?" as `gym.py`, and save this as `test_gym.py`. It uses `parametrize` from [chapter 36](../36-testing-with-pytest/notes.md):

```python
import pytest

from gym import price


@pytest.mark.parametrize(
    ("plan", "age", "is_student", "months", "expected"),
    [
        ("basic", 30, False, 0, 2500),
        ("plus", 16, False, 0, 2800),  # under 18: 30% off
        ("premium", 65, False, 0, 4200),  # 65 and over: 30% off
        ("plus", 20, True, 0, 3200),  # students: 20% off
        ("basic", 17, True, 0, 1750),  # only one discount, never both
        ("premium", 40, False, 12, 5500),  # 12 months or more: $5 off
        ("plus", 70, True, 24, 2300),
    ],
)
def test_price(
    plan: str, age: int, is_student: bool, months: int, expected: int
) -> None:
    assert price(plan, age, is_student, months) == expected


def test_unknown_plan() -> None:
    assert price("gold", 30, False, 0) == -1
```

Make a virtual environment in the folder, install pytest, and run `python -m pytest`:

```
============================= test session starts =============================
platform win32 -- Python 3.13.15, pytest-9.1.1, pluggy-1.6.0
rootdir: C:\Users\Sandip\projects\gym
collected 8 items

test_gym.py ........                                                     [100%]

============================== 8 passed in 0.04s ==============================
```

Green. These tests are your safety net: after every step below, run them again. If one goes red, undo the last step and look closer.

**Step 1: honest names, hints, and keyword-only flags.** Rename the function and its parameters so they say what they mean, add hints, and make the two extra settings keyword-only with sensible defaults:

```python
def monthly_price(
    plan: str, age: int, *, is_student: bool = False, months_as_member: int = 0
) -> int:
    if plan == "basic" or plan == "plus" or plan == "premium":
        if plan == "basic":
            price = 2500
        elif plan == "plus":
            price = 4000
        else:
            price = 6000
        if age < 18 or age >= 65:
            price = price - price * 30 // 100
        else:
            if is_student:
                price = price - price * 20 // 100
        if months_as_member >= 12:
            price = price - 500
        return price
    else:
        return -1
```

The callers must change too. In `test_gym.py`, import `monthly_price` instead of `price`, rename the test to `test_monthly_price`, and change the two calls:

```python
    result = monthly_price(plan, age, is_student=is_student, months_as_member=months)
    assert result == expected
```

```python
    assert monthly_price("gold", 30) == -1
```

Run the tests: `8 passed`. The lying comment is gone too (the code itself is clear about the $5 now), and so is `== True`.

**Step 2: name the numbers.** Every price and rule gets a name at the top of the file. The three-way `if` for the plan prices becomes a dictionary, so `if plan == "basic" or ...` turns into `if plan in PLAN_PRICES:` and the price is just `PLAN_PRICES[plan]`. The `else:` with an `if` inside becomes an `elif`, and every number in the function is replaced by its name, like `price - price * AGE_DISCOUNT_PERCENT // 100`. You'll see all of it in step 3's code. `8 passed`. The gym's whole price list now sits at the top of the file, where anyone can find it and change it.

**Step 3: flatten it, and give the discount rule its own function.** A guard clause handles the unknown plan first, and the "which discount?" rule moves into a small function with a name:

```python
"""Monthly membership prices for Sandip's gym, in whole cents."""

PLAN_PRICES = {"basic": 2500, "plus": 4000, "premium": 6000}  # cents a month
ADULT_AGE = 18
SENIOR_AGE = 65
AGE_DISCOUNT_PERCENT = 30
STUDENT_DISCOUNT_PERCENT = 20
LOYALTY_MONTHS = 12
LOYALTY_DISCOUNT_CENTS = 500


def discount_percent(age: int, is_student: bool) -> int:
    """Return the member's discount. Only one discount ever applies."""
    if age < ADULT_AGE or age >= SENIOR_AGE:
        return AGE_DISCOUNT_PERCENT
    if is_student:
        return STUDENT_DISCOUNT_PERCENT
    return 0


def monthly_price(
    plan: str, age: int, *, is_student: bool = False, months_as_member: int = 0
) -> int:
    """Return a member's monthly price in cents, after any discounts."""
    if plan not in PLAN_PRICES:
        return -1
    price = PLAN_PRICES[plan]
    price -= price * discount_percent(age, is_student) // 100
    if months_as_member >= LOYALTY_MONTHS:
        price -= LOYALTY_DISCOUNT_CENTS
    return price
```

`8 passed`. Read `monthly_price` out loud now: "If it's not a plan we sell, stop. Start from the plan's price. Take off the discount. Take off the loyalty discount if they've been here a year. Done." Each line is one step of the rule. And the "never both discounts" rule, which was hidden in an `else` before, now has a docstring that says so.

**Step 4: fix the design, as a separate step.** One thing is still wrong: `-1` for an unknown plan. A caller can forget to check for it and happily charge someone -1 cents ("Errors should never pass silently"). The Pythonic way is to raise an exception ([chapter 18](../18-error-handling/notes.md)). But that **changes what the code does**, so it isn't a refactoring, and it gets its own step. Test first: change `test_unknown_plan` to expect the new behaviour:

```python
def test_unknown_plan() -> None:
    with pytest.raises(ValueError, match="unknown plan"):
        monthly_price("gold", 30)
```

Red, as it should be:

```
FAILED test_gym.py::test_unknown_plan - Failed: DID NOT RAISE ValueError
========================= 1 failed, 7 passed in 0.09s =========================
```

Now change `return -1` to `raise ValueError(f"unknown plan: {plan!r}")`. Green again: `8 passed`. Same prices, honest errors, and code you can read in one go.

> **Tip:** Keep refactoring and changing behaviour apart, like steps 1 to 3 and step 4 here. If a test goes red during a refactoring, you know you broke something by accident. If you mix the two, you can't tell an accident from the change you wanted. The [JavaScript course](../../JavaScript/45-clean-code/notes.md) has more refactorings, and VS Code can do some for you: click a name and press `F2` to rename it everywhere at once.

### Ruff: a spell-checker for code

You could check all those PEP 8 rules by eye, but that's slow and boring, and you'd miss things. Two kinds of tool do it for you:

- A **linter** reads your code without running it and points out likely bugs and style problems, like a spell-checker. (The name comes from "lint", the fluff you pick off a jumper.)
- A **formatter** rewrites your code's layout (spaces, line breaks, quotes) into one standard style, automatically.

**Ruff** is both, in one very fast tool, and it has quickly become a very popular choice for Python projects. (It does the jobs of several older tools you'll see mentioned online: Flake8 for linting, along with many of Pylint's checks, isort for sorting imports, and Black for formatting. Ruff's formatter makes almost exactly the same layout as Black.) Install it into your project's virtual environment:

```
python -m pip install ruff
```

This chapter was written with **Ruff 0.17**. Ruff's version still starts with 0, which means its makers still change things between versions, like which rules are on by default. The ideas stay the same, but your messages may look a little different.

Here's a small program from the town library. Make a new folder (with no `pyproject.toml` in it yet), and save this as `fines.py`:

```python
import sys
import os
from typing import List, Optional

DAILY_FINE_CENTS = 25


def total_fine(days_late: List[int], member: Optional[str] = None, paid=[]) -> int:
    total = 0
    for days in days_late:
        if days > 0:
            if member == None:
                total += days*DAILY_FINE_CENTS
            else:
                total += days*DAILY_FINE_CENTS // 2
    try:
        limit = int(sys.argv[1])
    except:
        limit = 1000
    return min(total, limit) - sum(paid)


print(total_fine([3, 0, 12]))
print(total_fine([3, 0, 12], member='Maya'))
```

It runs, and prints `375` and `187`. Now ask Ruff what it thinks:

```
python -m ruff check fines.py
```

Ruff shows each problem with the lines around it, so the full report is long. Here's the short version, which you get by adding `--output-format concise`:

```
fines.py:1:1: I001 [*] Import block is un-sorted or un-formatted
fines.py:2:8: F401 [*] `os` imported but unused
fines.py:3:1: UP035 `typing.List` is deprecated, use `list` instead
fines.py:8:27: UP006 [*] Use `list` instead of `List` for type annotation
fines.py:8:46: UP045 [*] Use `X | None` for type annotations
fines.py:8:73: B006 Do not use mutable data structures for argument defaults
fines.py:18:5: E722 Do not use bare `except`
Found 7 errors.
[*] 4 fixable with `--fix` (1 unsafe fix available with `--fix --unsafe-fixes`).
```

Each line gives the file, the line and column, a **rule code** like `F401`, and a message. Here's one in full, the way Ruff shows it without `concise`:

```
B006 Do not use mutable data structures for argument defaults
  --> fines.py:8:73
   |
 8 | def total_fine(days_late: List[int], member: Optional[str] = None, paid=[]) -> int:
   |                                                                         ^^
 9 |     total = 0
10 |     for days in days_late:
   |
help: Replace with `None`; initialize within function
   |
7  |
   - def total_fine(days_late: List[int], member: Optional[str] = None, paid=[]) -> int:
8  + def total_fine(days_late: List[int], member: Optional[str] = None, paid=None) -> int:
9  +     if paid is None:
10 +         paid = []
11 |     total = 0
   |
note: This is an unsafe fix and may change runtime behavior
```

That's the mutable default trap from [chapter 16](../16-scope-and-mutability/notes.md), found without running anything, with a suggested fix. Look at the other finds: an unused import, old-style hints (`List` and `Optional` are how hints were written before Python 3.9 and 3.10; [chapter 25](../25-type-hints/notes.md) taught you the modern `list[int]` and `str | None`), and a bare `except:` that would hide any error at all ([chapter 18](../18-error-handling/notes.md)).

The `[*]` marks the problems Ruff can fix by itself. Let it:

```
python -m ruff check --fix fines.py
```

```
fines.py:6:70: B006 Do not use mutable data structures for argument defaults
fines.py:16:5: E722 Do not use bare `except`
Found 8 errors (6 fixed, 2 remaining).
1 unsafe fix available with `--fix --unsafe-fixes`.
```

(It says 8, not 7: once `List` and `Optional` were gone, the whole `typing` import was unused, so Ruff removed that too.) The two that are left need a human, because the right fix depends on what you meant. Ruff calls its fix for B006 **unsafe**: it might change what the program does, so it won't make it unless you ask. In fact, its suggestion here would leave the hint as `list[int]` when the default is now `None`, and mypy would complain. Fix both by hand: `paid: list[int] | None = None` with an `if paid is None:` inside, and `except (IndexError, ValueError):`, the two errors `int(sys.argv[1])` can really raise. Run the check again:

```
All checks passed!
```

### `ruff format`: never think about layout again

The file still has `days*DAILY_FINE_CENTS` with no spaces, single quotes in one place and double quotes in others, and a `def` line that's far too long. `--diff` shows what the formatter would change, without changing anything:

```
python -m ruff format --diff fines.py
```

Here's part of what it showed. Lines starting with `-` go, lines starting with `+` come in:

```
-def total_fine(days_late: list[int], member: str | None = None, paid: list[int] | None = None) -> int:
+def total_fine(
+    days_late: list[int], member: str | None = None, paid: list[int] | None = None
+) -> int:
```

```
-                total += days*DAILY_FINE_CENTS
+                total += days * DAILY_FINE_CENTS
```

```
-print(total_fine([3, 0, 12], member='Maya'))
+print(total_fine([3, 0, 12], member="Maya"))
```

The long line is split, spaces go around `*`, and every string gets double quotes. `python -m ruff format fines.py` makes the changes (`1 file reformatted`), and `python -m ruff format .` does every Python file in the folder. The program still prints `375` and `187`: a formatter only ever changes layout, never what the code does.

The formatter has almost no settings, on purpose. Its style isn't everyone's favourite, but it's the same for everyone, and that's the point: nobody on a team ever has to argue about spaces again.

### Choosing your rules: `pyproject.toml`

Look closely at the fixed file: `if member == None:` is still there, and Ruff said "All checks passed!". Ruff knows hundreds of rules, grouped by the old tool they came from, and it only checks the ones that are switched on. Since version 0.16, if you don't choose, Ruff switches on a big default set of about 400 rules that its makers picked. `E711`, the rule about `== None`, isn't one of them.

You choose the rules in `pyproject.toml` ([chapter 39](../39-project-structure-and-packaging/notes.md)), in two `[tool.ruff]` tables. Make one next to `fines.py`:

```
[project]
name = "library-fines"
version = "0.1.0"
requires-python = ">=3.13"

[tool.ruff]
line-length = 88

[tool.ruff.lint]
select = ["E", "F", "I", "B", "UP", "SIM"]
```

`select` **replaces** Ruff's default set with your own list. This is a good starter set: small enough that you'll understand every message, and it catches the things that matter most. Each letter is a group of rules:

| Code | Group | What it catches | Example |
|---|---|---|---|
| `E` | pycodestyle | PEP 8 problems | `E711` comparing with `== None`, `E722` bare `except`, `E501` line too long |
| `F` | Pyflakes | Real mistakes | `F401` unused import, `F821` a name that doesn't exist (a typo) |
| `I` | isort | Imports out of order | `I001`: fixes the three groups for you |
| `B` | flake8-bugbear | Likely bugs | `B006` mutable default, `B905` `zip()` without `strict=` |
| `UP` | pyupgrade | Old-fashioned code for your Python | `UP006` `List[int]`, becomes `list[int]` |
| `SIM` | flake8-simplify | Code that could be simpler | `SIM103` `if x: return True else: return False` |

`requires-python = ">=3.13"` matters too: it tells Ruff which Python you use, so the `UP` rules know which modern features are allowed. `line-length = 88` is Ruff's default anyway; writing it down makes the choice visible. Run the check again, and the `== None` is caught (shown in the short form):

```
fines.py:14:26: E711 Comparison to `None` should be `cond is None`
Found 1 error.
1 unsafe fix available with `--fix --unsafe-fixes`.
```

Fix it, and you're clean. To learn what any rule is about, ask Ruff: `python -m ruff rule E711` prints an explanation with examples. It starts with `# none-comparison (E711)`, says which old tool the rule comes from, and explains what it checks and why.

Once you're comfortable, try adding groups one at a time (Ruff's website lists them all), or use `extend-select` instead of `select` to add groups to Ruff's big default set instead of replacing it.

> **Tip:** Sometimes a rule is wrong for one particular line. Then you can switch it off for that line only, with a comment that names the rule: `# noqa: E501`. ("noqa" means "no quality assurance".) Always name the rule. Mistake 4 shows why.

### mypy settings

You've used mypy since [chapter 25](../25-type-hints/notes.md), and chapter 39 put its settings in `pyproject.toml`. Remember that mypy skips the inside of any function with no hints at all? Here's chapter 25's example again, with one more function, `add_fee`, that has hints on its parameter but not on its return value. Save it as `untyped.py`:

```python
def add_tax(price):
    return price * "1.08"


def add_tip(price: float) -> float:
    return price * "1.10"


def add_fee(price: float):
    return price + 0.50
```

`python -m mypy untyped.py` only reports the bug in `add_tip`. Now add this to `pyproject.toml`:

```
[tool.mypy]
disallow_untyped_defs = true
```

and run it again:

```
untyped.py:1: error: Function is missing a type annotation  [no-untyped-def]
untyped.py:6: error: Unsupported operand types for * ("float" and "str")  [operator]
untyped.py:9: error: Function is missing a return type annotation  [no-untyped-def]
Found 3 errors in 1 file (checked 1 source file)
```

Now mypy enforces the course rule, "put hints on every function", so no function can slip through unchecked.

You'll also see `strict = true` recommended. It switches on a whole bundle of extra checks. On this file, it added a fourth error, `Returning Any from function declared to return "float"`. Strict mode is great for a brand-new project, but on an existing project it can produce hundreds of messages at once, and some of them (especially about third-party packages without hints) are hard for a beginner to fix. A sensible path: start with `disallow_untyped_defs`, and try `strict` later, when the messages make sense to you. (The finished gym code passes `strict`, if you want to try it.)

### pre-commit: the checks run themselves

Tools only help if you remember to run them. **pre-commit** runs them for you, every time you save a version of your project with Git. (Git is the tool that saves versions of your project, from [chapter 23](../23-pip-and-virtual-environments/notes.md). If you haven't used it yet, the [React course's setup chapter](../../React/00-project-setup/notes.md) shows `git init`, `git add` and `git commit`.)

Git can run a small program just before each commit, called a **hook**. If the hook fails, the commit doesn't happen. pre-commit fills that hook with your checks, so messy code can't even get into your project's history.

Here's the full setup for the gym project. Its `pyproject.toml` lists the tools in a dependency group ([chapter 39](../39-project-structure-and-packaging/notes.md)), along with the Ruff and mypy settings:

```
[project]
name = "gym-prices"
version = "0.1.0"
requires-python = ">=3.13"
dependencies = []

[dependency-groups]
dev = ["pytest", "mypy", "ruff", "pre-commit"]

[tool.ruff]
line-length = 88

[tool.ruff.lint]
select = ["E", "F", "I", "B", "UP", "SIM"]

[tool.mypy]
disallow_untyped_defs = true
```

Install the group with `python -m pip install --group dev`. Then add a file called `.pre-commit-config.yaml` (note the dot at the start). It's written in **YAML**, another settings format: indentation shows what belongs to what, and a `-` starts a list item.

```
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.17.0
    hooks:
      - id: ruff-check
        args: [--fix]
      - id: ruff-format
  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v2.4.0
    hooks:
      - id: mypy
```

Each `repo` is a place pre-commit downloads a tool from, and `rev` is the exact version to use. The hooks are: `ruff check --fix`, then `ruff format`, then mypy. Now, in the project folder (with the virtual environment active), switch it on once:

```
git init
pre-commit install
```

```
pre-commit installed at .git\hooks\pre-commit
```

From now on, every `git commit` runs the checks on the files you're committing. The very first time, pre-commit downloads the tools into a folder of its own, which takes a minute:

```
[INFO] Initializing environment for https://github.com/astral-sh/ruff-pre-commit.
[INFO] Initializing environment for https://github.com/pre-commit/mirrors-mypy.
[INFO] Installing environment for https://github.com/astral-sh/ruff-pre-commit.
[INFO] Once installed this environment will be reused.
[INFO] This may take a few minutes...
```

Then, with the clean gym code from the walkthrough:

```
git add .
git commit -m "Gym prices"
```

```
ruff check...............................................................Passed
ruff format..............................................................Passed
mypy.....................................................................Passed
```

and the commit goes through. Now Sandip adds a day pass in a hurry. He puts `import math` at the top of `gym.py` (he thought he'd need it), and this at the bottom:

```python
def day_pass_price(age, is_weekend=False):
    price=1200
    if is_weekend == True:
        price += 300
    return price
```

He runs `git add gym.py` and `git commit -m "Add day passes"`, and the commit is stopped. Here's the output, with Ruff's code picture for E712 left out to save space:

```
ruff check...............................................................Failed
- hook id: ruff-check
- exit code: 1
- files were modified by this hook

E712 Avoid equality comparisons to `True`; use `is_weekend:` for truth checks
  --> gym.py:37:8

Found 2 errors (1 fixed, 1 remaining).
1 unsafe fix available with `--fix --unsafe-fixes`.

ruff format..............................................................Failed
- hook id: ruff-format
- files were modified by this hook

1 file reformatted

mypy.....................................................................Failed
- hook id: mypy
- exit code: 1

gym.py:34: error: Function is missing a type annotation  [no-untyped-def]
Found 1 error in 1 file (checked 1 source file)
```

Three hooks, three failures, and no commit. "files were modified by this hook" means the hooks already fixed what they could: Ruff removed the unused `import math`, and the formatter wrote `price = 1200`. (That's also why mypy's line number is smaller: two lines had already gone.) The rest is Sandip's job. He gives the function hints and a docstring, drops the unused `age`, makes the flag keyword-only, names the prices (`DAY_PASS_CENTS = 1200` and `WEEKEND_EXTRA_CENTS = 300`, at the top with the others), and loses the `== True`:

```python
def day_pass_price(*, is_weekend: bool = False) -> int:
    """Return the price of a one-day pass, in cents."""
    if is_weekend:
        return DAY_PASS_CENTS + WEEKEND_EXTRA_CENTS
    return DAY_PASS_CENTS
```

Because the hooks changed `gym.py`, he has to `git add gym.py` again, then commit:

```
ruff check...............................................................Passed
ruff format..............................................................Passed
mypy.....................................................................Passed
```

A few more things worth knowing:

- `pre-commit run --all-files` runs every check on every file, not just the ones you're committing. Do it once after setting up pre-commit in an existing project.
- `pre-commit autoupdate` changes each `rev` to the newest version of the tool. Do it now and then, and commit the change.
- The mypy hook runs in its own little environment, so it can't see the packages in your `.venv`. (That's also why this hook ignores missing imports by default.) To let it check code that uses, say, pytest or pandas properly, list them under the hook: `additional_dependencies: [pytest, pandas-stubs]`.
- `git commit --no-verify` skips the hooks. It exists for emergencies. If you find yourself using it often, fix the code or the settings instead.

> **Watch out:** pre-commit downloads each tool into a cache folder, with quite deep folder names. On Windows, if the full path gets longer than 260 characters, the download fails with a `FileNotFoundError`. That's very unlikely in the normal cache folder in your user folder, but if it happens, ask Claude about Windows' "long paths" setting.

### Your editor: Ruff in VS Code

You don't have to wait for a commit to see Ruff's messages. Install the **Ruff** extension in VS Code (made by Astral, the company behind Ruff). It underlines problems as you type, with the same rule codes. To format and fix every time you save, open your settings as JSON (Command Palette, then "Preferences: Open User Settings (JSON)") and add:

```
"[python]": {
    "editor.defaultFormatter": "charliermarsh.ruff",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
        "source.fixAll": "explicit",
        "source.organizeImports": "explicit"
    }
}
```

Now every save formats the file, applies Ruff's safe fixes and sorts the imports. It reads the same `[tool.ruff]` settings from your `pyproject.toml`, so the editor, pre-commit and you all agree. (These settings come from the extension's documentation. Menus and setting names change now and then, so check the extension's page if something doesn't match.)

### Code review: a second pair of eyes

In most teams, nobody's code goes in until someone else has read it. That's a **code review**. Tools catch the mechanical things; a reviewer catches what tools can't: a confusing name, a missing test, a simpler way to do it, a rule that's been misunderstood.

When you review someone's code:

- Start with what's good. Then ask questions rather than give orders: "What happens if `days_late` is negative?" teaches more than "Wrong."
- Talk about the code, not the person: "this function is hard to follow", not "you write confusing code".
- Leave layout to the formatter. If the tools pass, spaces and quotes are not up for discussion.

When your code is reviewed, remember that every comment is free help, and that being questioned isn't being attacked. You can try it today: when you finish an exercise, ask Claude to review it the way a kind senior developer would.

## Common mistakes

**1. Clever one-liners**

```python
scores = [("Maya", 91), ("Leo", 65), ("Maya", 88), ("Sandip", 82), ("Leo", 70)]

avg = {
    n: sum(s for m, s in scores if m == n) / len([s for m, s in scores if m == n])
    for n in sorted({m for m, _ in scores})
}
print(avg)
```

```
{'Leo': 67.5, 'Maya': 89.5, 'Sandip': 82.0}
```

It works, and it even passes Ruff (after `ruff format` split it over four lines). But what are `n`, `m` and `s`? And it goes through every score twice for every student: the hidden O(n²) from [chapter 49](../49-performance/notes.md). Tools can fix layout, not cleverness. The clear version is longer, and much easier to read and trust:

```python
def averages_by_name(scores: list[tuple[str, int]]) -> dict[str, float]:
    """Return each student's average score, in alphabetical order."""
    by_name: dict[str, list[int]] = {}
    for name, score in scores:
        if name not in by_name:
            by_name[name] = []
        by_name[name].append(score)
    return {name: sum(marks) / len(marks) for name, marks in sorted(by_name.items())}


scores = [("Maya", 91), ("Leo", 65), ("Maya", 88), ("Sandip", 82), ("Leo", 70)]
print(averages_by_name(scores))
```

Same output. Short code isn't the goal. Clear code is.

**2. Comments that repeat the code, or tell lies**

```python
visits = 41
price_cents = 6000

visits = visits + 1  # add 1 to visits
price_cents = price_cents - 500  # 10% off for loyal members
print(visits, price_cents)  # prints: 42 5500
```

The first comment adds nothing: the code already says it. The second is worse: it's wrong (500 cents off 6000 is about 8%, not 10%), and nothing checks comments, so it stayed wrong. Fix: delete comments that repeat the code, and turn "what" comments into names (`LOYALTY_DISCOUNT_CENTS = 500`). Keep comments for *why*.

**3. Giant functions**

A 200-line `main()` that reads the file, checks the data, works out totals, formats a report and emails it can't be tested in pieces, and nobody can hold it all in their head. A sign you've got one: comments like `# --- step 3: totals ---` that split it into sections. Fix: each section becomes a function, and its comment becomes the function's name. `main()` then reads like a table of contents.

**4. A blanket `# noqa`**

```python
import os  # noqa


def total_price(price_cents: int, quantity: int) -> int:
    return price_cents * quantitty  # noqa


print(total_price(350, 2))
```

Ruff says `All checks passed!`, because a bare `# noqa` switches off **every** rule on that line, including the one that would have caught the typo. Then the program crashes:

```
NameError: name 'quantitty' is not defined. Did you mean: 'quantity'?
```

Fix: never write a bare `# noqa`. Name the one rule you mean, like `# noqa: E501`, and only when you have a good reason. Ruff can even check this for you: add `"PGH004"` to your `select` list, and it reports "Use specific rule codes when using `noqa`" on both lines.

**5. Arguing about formatting**

Tabs or spaces? Single or double quotes? Where does the bracket go? Teams have wasted days on this. Fix: let the formatter decide, put `ruff format` in pre-commit, and move on to things that matter. The formatter's choice won't always be your favourite, and that's fine.

**6. Mutable default arguments**

```python
def add_guest(name: str, guests: list[str] = []) -> list[str]:
    guests.append(name)
    return guests
```

This is the trap from [chapter 16](../16-scope-and-mutability/notes.md): the `[]` is made once, so every call shares the same list. mypy says `Success` (the types are fine), but Ruff's bugbear rules catch it, just as they did in `fines.py`:

```
mutable.py:1:46: B006 Do not use mutable data structures for argument defaults
```

Fix: `guests: list[str] | None = None`, then `if guests is None: guests = []` inside. This is one of the best reasons to have `"B"` in your `select` list.

## Quick recap

- Code is read far more often than it's written, so write for the reader. **Pythonic** code uses Python's own tools: `for item in items`, `enumerate`, `zip(..., strict=True)`, truthiness, f-strings, comprehensions, `with`.
- **PEP 8** sets the style (`snake_case`, `CapitalWords`, `UPPER_CASE`, 4 spaces, imports in three groups), and **PEP 257** the docstrings (a one-line command, like "Return the late fee.").
- Good names say what things are and do. Functions do one job, take few parameters, and use `*` to make flags keyword-only. Guard clauses keep code flat, constants replace magic numbers, and comments explain *why*.
- Refactor in small steps with tests running after each one, and keep behaviour changes as separate steps.
- **Ruff** checks (`ruff check`, `--fix`) and formats (`ruff format`). Choose rules in `[tool.ruff.lint]`: `E`, `F`, `I`, `B`, `UP` and `SIM` make a good start. `disallow_untyped_defs` makes mypy check every function.
- **pre-commit** runs Ruff and mypy on every commit, so messy code never gets in. Never use a blanket `# noqa`, and let the formatter end all arguments about layout.

---

**Next:** try the [exercises](exercises.md), then move on to [51 Design Patterns](../51-design-patterns/notes.md).
