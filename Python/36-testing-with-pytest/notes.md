# 36 Testing with pytest

## What is it?

A **test** is a small piece of code that runs some of your code and checks that the answer is right. Instead of running your program and reading the output yourself, you write the check down once, and the computer does the checking for you, as often as you like.

**pytest** is the most popular tool for writing and running tests in Python. It finds your tests, runs them all, and gives you a short report: what passed, what failed, and why.

## Why does it matter?

Think about how you've checked your code so far. In [chapter 19](../19-modules-and-standard-library/notes.md), you put a few `print` calls under `if __name__ == "__main__":`, ran the file, and read the output:

```python
if __name__ == "__main__":
    print(format_money(1250))  # prints: $12.50
    print(format_money(5))  # prints: $0.05
    print(apply_discount(2000, 10))  # prints: 1800
```

That's fine for three lines. But it has three problems, and they get worse as your programs grow:

1. **You are the checker.** You have to remember that `$0.05` is right and `$0.5` would be wrong, every single time. By the tenth run, you've stopped reading carefully.
2. **You only check what you just changed.** In [chapter 26](../26-project-todo-app/notes.md), one change to `storage.py` could break `list`, `add` and `done`. Checking every command by hand after every change takes ages, so nobody does it.
3. **Old bugs come back.** You fix a bug on Monday. On Friday, a "small tidy-up" brings it back, and nobody notices for weeks. A bug that comes back is called a **regression**.

Tests fix all three. You write each check once, as code. Then one command runs every check in about a second, and tells you exactly which ones broke. That's what lets programmers change code without being scared of it: if the tests still pass, nothing they were checking broke.

## Real-world example

Before every flight, a pilot goes through a **pre-flight checklist**: fuel, flaps, brakes, instruments. The same checks, in the same order, every time, even on the pilot's thousandth flight. It's quick, and it catches problems on the ground, where they're cheap, instead of in the air.

| Pre-flight checklist | Testing |
|---|---|
| One item on the list ("Fuel tank full?") | One test function |
| The whole checklist | All your test files |
| Going through it before every flight | Running `python -m pytest` after every change |
| A tick next to an item | A passing test |
| A failed check: the plane stays on the ground until it's fixed | A failing test: you fix the code before you use or share it |
| Adding a new item after a near miss | Adding a test after you fix a bug, so it can't come back |

## How it works

### Checking with `assert`

Python has a built-in statement for checking things: `assert`. You give it something that should be true. If it is true, nothing happens. If it's false, Python raises an `AssertionError` and stops.

Save this as `check_money.py`:

```python
def format_money(cents: int) -> str:
    """Turn a number of cents into text like $12.50."""
    return f"${cents / 100:.2f}"


assert format_money(1250) == "$12.50"
assert format_money(5) == "$0.05"
print("All checks passed")
```

Run it, and you'll see only `All checks passed`. Both `assert` lines were true, so they stayed quiet.

Now change the last check to a wrong answer, `assert format_money(5) == "$0.5"`, and run it again. You get a traceback pointing at line 7, ending with just:

```
AssertionError
```

`assert` is the heart of every test. But on its own, in a script like this, it's clumsy:

- It stops at the **first** failure, so you never find out whether the checks after it passed.
- It doesn't tell you **what the real answer was**. You know `format_money(5)` wasn't `"$0.5"`, but what was it? (You can add a message after a comma, like `assert result == "$0.5", f"got {result}"`, but writing that for every check gets old fast.)
- The checks are mixed in with the code they check.

pytest keeps the simple `assert` and fixes all three.

### Installing pytest

pytest is a package on PyPI, so you install it the way you installed mypy in [chapter 25](../25-type-hints/notes.md). Make a folder for this chapter's examples called `cafe`, open a terminal in it, and make and activate a virtual environment ([chapter 23](../23-pip-and-virtual-environments/notes.md)):

```
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install pytest
```

(In Command Prompt or on a Mac, use the activate command for your terminal from chapter 23.)

The output ends with something like this:

```
Successfully installed colorama-0.4.6 iniconfig-2.3.1 packaging-26.3 pluggy-1.6.0 pygments-2.21.0 pytest-9.1.1
```

pytest brought a few helper packages along: its dependencies. This chapter was written with pytest 9.1. Everything here works the same in the versions from the last few years, but the reports may look a tiny bit different in older ones.

### Your first test file

Put the code you want to test in a module. Save this as `shop.py` in the `cafe` folder:

```python
"""Money helpers for Sandip's cafe till."""


def format_money(cents: int) -> str:
    """Turn a number of cents into text like $12.50."""
    return f"${cents / 100:.2f}"


def apply_discount(total_cents: int, percent: int) -> int:
    """Return the total after taking off a discount, in whole cents."""
    if percent < 0 or percent > 100:
        raise ValueError(f"discount must be between 0 and 100, not {percent}")
    return total_cents - round(total_cents * percent / 100)
```

Now make a second file next to it, called `test_shop.py`:

```python
from shop import format_money


def test_format_money_whole_dollars() -> None:
    assert format_money(1200) == "$12.00"


def test_format_money_with_cents() -> None:
    assert format_money(1250) == "$12.50"
```

That's a complete test file. Each test is a plain function with an `assert` inside. It takes nothing and returns nothing, so its hint is `-> None`.

Run the tests:

```
python -m pytest
```

You'll see:

```
============================= test session starts =============================
platform win32 -- Python 3.13.15, pytest-9.1.1, pluggy-1.6.0
rootdir: C:\Users\Sandip\projects\cafe
collected 2 items

test_shop.py ..                                                          [100%]

============================== 2 passed in 0.02s ==============================
```

Here's how to read it:

| Line | What it means |
|---|---|
| `platform win32 -- Python 3.13.15, pytest-9.1.1, ...` | Which Python and which pytest ran the tests. |
| `rootdir: ...` | The folder pytest treated as the project. |
| `collected 2 items` | pytest found two tests. |
| `test_shop.py ..` | One character per test in that file. A dot means it passed. |
| `2 passed in 0.02s` | The summary, shown in green when everything passed. |

The time at the end will be different for you. And notice that you never called the test functions yourself: pytest found them and called them.

> **Tip:** Why `python -m pytest`, and not just `pytest`? For the same reason as `python -m pip` in chapter 23: it runs the pytest that belongs to the Python in your active `.venv`. It also adds the current folder to the places Python looks for modules, which matters when your tests live in their own folder (you'll see that below).

### How pytest finds your tests

pytest looks through the current folder, and every folder inside it, for **files** whose names start with `test_` (or end with `_test.py`), and inside those files, for **functions** whose names start with `test`. Everything else is left alone. So `shop.py` is never run as a test, and a helper function called `make_cart()` inside a test file isn't either.

Give your tests long names that say what they check. `test_discount_rounds_to_whole_cents` beats `test2`. When a test fails, its name is the first thing you see, and a good name tells you what broke before you read anything else.

### Reading a failure

Sandip remembers the float surprise from [chapter 05](../05-numbers-and-math/notes.md), and decides to rewrite `format_money` without dividing by 100. He uses `//` and `%` instead:

```python
def format_money(cents: int) -> str:
    """Turn a number of cents into text like $12.50."""
    dollars = cents // 100
    left_over = cents % 100
    return f"${dollars}.{left_over}"
```

He tries `format_money(1250)`, sees `$12.50`, and is happy. Then he runs the tests. After the same header as before, pytest says:

```
test_shop.py F.                                                          [100%]

================================== FAILURES ===================================
_______________________ test_format_money_whole_dollars _______________________

    def test_format_money_whole_dollars() -> None:
>       assert format_money(1200) == "$12.00"
E       AssertionError: assert '$12.0' == '$12.00'
E         
E         - $12.00
E         ?      -
E         + $12.0

test_shop.py:5: AssertionError
=========================== short test summary info ===========================
FAILED test_shop.py::test_format_money_whole_dollars - AssertionError: assert...
========================= 1 failed, 1 passed in 0.09s =========================
```

Read it from the top down:

1. `test_shop.py F.`: the first test failed (`F`), and the second passed (`.`).
2. Under `FAILURES` comes the name of the failing test, then its code. The `>` arrow points at the line that failed.
3. The `E` lines (E for error) explain what happened: `assert '$12.0' == '$12.00'`. **pytest shows you the real value.** `format_money(1200)` gave `'$12.0'`, not `'$12.00'`. Then it shows the difference: the `-` line is what you expected, the `+` line is what you got, and the `?` line marks the exact spot where they differ.
4. `test_shop.py:5` is the file and the line number.
5. The summary at the bottom gives every failure one line, then the count.

So the bug is a missing zero: `1200 % 100` is `0`, and an f-string shows that as `0`, not `00`. The fix is the zero padding from [chapter 06](../06-strings/notes.md): `f"${dollars}.{left_over:02}"`. Run the tests again, and you're back to `2 passed`.

This is exactly what tests are for. Sandip tried one example by hand, and it looked fine. The tests tried another one, and caught the bug straight away.

> **Tip:** Always put the real result on the left and the value you expect on the right, like `assert format_money(1200) == "$12.00"`. Then pytest's `-` line (expected) and `+` line (what you got) always mean the same thing.

### What to test

You can't test every possible input, so pick a few that matter. For each function, think of three kinds of case:

- **Normal cases:** everyday use. A 10% discount on $20.00 gives $18.00.
- **Edge cases:** values at the very edges, where bugs love to hide. A 0% discount, a 100% discount, an amount of 5 cents, an empty list, the biggest and smallest values allowed.
- **Error cases:** bad input that should be refused. A 150% discount should raise a `ValueError`, not give a negative price.

Here are tests of the first two kinds. Add them to `test_shop.py`, and change the import line to `from shop import apply_discount, format_money`:

```python
def test_format_money_small_amount() -> None:
    assert format_money(5) == "$0.05"


def test_discount_normal() -> None:
    assert apply_discount(2000, 10) == 1800


def test_discount_rounds_to_whole_cents() -> None:
    assert apply_discount(999, 15) == 849


def test_discount_zero_percent_changes_nothing() -> None:
    assert apply_discount(2000, 0) == 2000


def test_discount_hundred_percent_is_free() -> None:
    assert apply_discount(2000, 100) == 0
```

(15% of 999 cents is 149.85 cents. `round()` makes that 150, and 999 minus 150 is 849.)

Each test checks **one thing**. If `test_discount_hundred_percent_is_free` fails one day, you know what's wrong before you even open the code.

### Testing errors: `pytest.raises`

The third kind of case is "this should raise an exception". You can't just call `apply_discount(2000, 150)` in a test, because the `ValueError` would crash the test. Instead, wrap the call in `with pytest.raises(...)`:

```python
import pytest

from shop import apply_discount, format_money


def test_discount_over_100_is_refused() -> None:
    with pytest.raises(ValueError):
        apply_discount(2000, 150)
```

Read it as "inside this block, I expect a `ValueError`". If the code inside raises a `ValueError`, pytest catches it and the test **passes**. If nothing is raised, the test fails. (`import pytest` goes at the top, above your own imports, with a blank line between them. PEP 8 puts installed packages first and your own modules after them.)

To see that it really checks something, delete the `if` and the `raise` from `apply_discount` for a moment, and run the tests:

```
    def test_discount_over_100_is_refused() -> None:
>       with pytest.raises(ValueError):
             ^^^^^^^^^^^^^^^^^^^^^^^^^
E       Failed: DID NOT RAISE ValueError
```

Put them back. You can also check the error's **message**, with `match=`:

```python
def test_discount_below_zero_is_refused() -> None:
    with pytest.raises(ValueError, match="between 0 and 100"):
        apply_discount(2000, -5)
```

Now the test only passes if the message contains `between 0 and 100`. If it doesn't, pytest shows you both:

```
E       AssertionError: Regex pattern did not match.
E         Expected regex: 'from 0 to 100'
E         Actual message: 'discount must be between 0 and 100, not -5'
```

As that says, `match=` is a **regular expression** from [chapter 35](../35-regular-expressions/notes.md), and it's searched for anywhere in the message, like `re.search`. For plain words, that makes no difference. But characters like `.`, `$`, `(` and `?` have special meanings in a pattern, so if your message contains them, escape them in a raw string (`match=r"costs \$5\.00"`), or let `re.escape()` do it for you.

### Handy ways to run tests

`test_shop.py` now has nine tests. pytest has lots of options for running them. These are the ones you'll use most:

| Command | What it does |
|---|---|
| `python -m pytest` | Run every test |
| `python -m pytest -v` | Verbose: one line per test, with its name |
| `python -m pytest -q` | Quiet: just the dots and the summary |
| `python -m pytest -k discount` | Only the tests with `discount` in their name |
| `python -m pytest test_shop.py` | Only the tests in one file |
| `python -m pytest test_shop.py::test_discount_normal` | Just one test |
| `python -m pytest -x` | Stop at the first failure |
| `python -m pytest -s` | Show what your code prints (pytest normally hides it) |

`-v` shows every test by name. After the header, you'll see:

```
test_shop.py::test_format_money_whole_dollars PASSED                     [ 11%]
test_shop.py::test_format_money_with_cents PASSED                        [ 22%]
test_shop.py::test_format_money_small_amount PASSED                      [ 33%]
test_shop.py::test_discount_normal PASSED                                [ 44%]
...
test_shop.py::test_discount_below_zero_is_refused PASSED                 [100%]

============================== 9 passed in 0.09s ==============================
```

(The `...` stands for four more lines just like these.)

`test_shop.py::test_discount_normal` is the test's full name, called its **node ID**. It's also exactly what you type to run just that one test.

`-k` picks tests by name, which is handy while you work on one part of the code. `python -m pytest -k discount` runs the six tests with `discount` in their names, and the report ends with `6 passed, 3 deselected`. You can combine words too: `-k "discount and refused"` runs the two tests with both words in their names, and `-k "not discount"` runs the other three.

### Comparing decimals: `pytest.approx`

Remember from chapter 05 that `0.1 + 0.2` isn't exactly `0.3`? That bites in tests too. Here's a function that averages a cafe's star ratings, in `reviews.py`:

```python
def average_rating(stars: list[float]) -> float:
    """Return the average of some star ratings."""
    return sum(stars) / len(stars)
```

And a test for it, in `test_reviews.py`:

```python
from reviews import average_rating


def test_average_rating() -> None:
    assert average_rating([4.7, 4.1, 4.4]) == 4.4
```

Any person would say the average is 4.4. pytest disagrees:

```
>       assert average_rating([4.7, 4.1, 4.4]) == 4.4
E       assert 4.3999999999999995 == 4.4
E        +  where 4.3999999999999995 = average_rating([4.7, 4.1, 4.4])
```

The `where` line shows what the function returned. The function is fine. It's the tiny float error from chapter 05. `pytest.approx` means "close enough". Add `import pytest` at the top, and change the check to:

```python
    assert average_rating([4.7, 4.1, 4.4]) == pytest.approx(4.4)
```

Now it passes. By default, `approx` accepts a difference of up to one millionth of the expected value, which is far smaller than anything you'd care about, and far bigger than float errors. Use it whenever you compare `float`s. And notice that the money tests above never needed it: whole cents are `int`s, and `int`s are always exact. That's one more reason to keep money in cents.

### Arrange, act, assert

Most tests have the same three steps. Here they are for the `BankAccount` class from [chapter 27](../27-classes-and-objects/notes.md). Save the class as `bank.py`:

```python
class BankAccount:
    def __init__(self, owner: str, balance: int = 0) -> None:
        self.owner = owner
        self.balance = balance

    def deposit(self, amount: int) -> None:
        if amount <= 0:
            raise ValueError("deposit must be positive")
        self.balance += amount

    def withdraw(self, amount: int) -> None:
        if amount <= 0:
            raise ValueError("withdrawal must be positive")
        if amount > self.balance:
            raise ValueError("not enough money")
        self.balance -= amount
```

And the tests as `test_bank.py`:

```python
import pytest

from bank import BankAccount


def test_deposit_adds_money() -> None:
    # Arrange: set up what the test needs
    account = BankAccount("Sandip", 100)

    # Act: do the one thing you're testing
    account.deposit(50)

    # Assert: check the result
    assert account.balance == 150


def test_cannot_withdraw_more_than_balance() -> None:
    account = BankAccount("Sandip", 100)

    with pytest.raises(ValueError, match="not enough money"):
        account.withdraw(500)

    assert account.balance == 100
```

**Arrange, act, assert** is a simple shape for a test: set things up, do one thing, check what happened. A blank line between the three parts makes them easy to spot, even without the comments. The second test checks two things: the withdrawal was refused, **and** the balance didn't change. Notice that the check on the balance goes **after** the `with` block, not inside it.

### Fixtures: a fresh start for every test

Look at the two tests again. Both start with the same line: `account = BankAccount("Sandip", 100)`. With twenty tests, that's twenty copies, and if the class changes, twenty places to fix.

A **fixture** is a function that prepares something your tests need. You write it once, and any test can ask for it:

```python
import pytest

from bank import BankAccount


@pytest.fixture
def account() -> BankAccount:
    """A fresh account with 100 in it, for each test that asks for one."""
    return BankAccount("Sandip", 100)


def test_deposit_adds_money(account: BankAccount) -> None:
    account.deposit(50)
    assert account.balance == 150


def test_withdraw_takes_money_out(account: BankAccount) -> None:
    account.withdraw(30)
    assert account.balance == 70


def test_cannot_withdraw_more_than_balance(account: BankAccount) -> None:
    with pytest.raises(ValueError, match="not enough money"):
        account.withdraw(500)
    assert account.balance == 100
```

Here's what happens when pytest runs `test_deposit_adds_money`:

1. It sees that the test has a parameter called `account`.
2. It looks for a fixture with that exact name, and finds the `account()` function marked with `@pytest.fixture`.
3. It calls that function, and passes what it returns into the test.

The `@pytest.fixture` line is a decorator ([chapter 32](../32-decorators/notes.md)): it labels the function as a fixture, so pytest knows about it. The fixture gets a return hint like any function, and the test's parameter gets the same type.

The most important part: **every test gets its own, brand-new account.** The first test deposits 50, but the second test still starts with 100. Tests that change things can't mess each other up. Run them in any order, or just one of them, and the result is the same.

> **Tip:** If several test files need the same fixture, move it into a file called `conftest.py` in the same folder. pytest reads that file by itself, and every test file next to it can use its fixtures without importing anything.

### Where test files live

For a small project, the test file sits right next to the module it tests, like `test_shop.py` next to `shop.py`. As a project grows, the tests usually move into their own `tests` folder:

```
cafe/
├── bank.py
├── shop.py
└── tests/
    ├── test_bank.py
    └── test_shop.py
```

The test files don't change at all. They still say `from shop import format_money`. Just make sure you run `python -m pytest` from the `cafe` folder: as the tip earlier said, `python -m` adds the current folder to the places Python looks for modules, so the tests can find `shop.py`. If you run plain `pytest` instead, it may fail with:

```
E   ModuleNotFoundError: No module named 'shop'
```

That's because plain `pytest` only adds the `tests` folder itself, and `shop.py` isn't in there. Real projects solve this more neatly, by installing their own code into the virtual environment. That's part of [chapter 39](../39-project-structure-and-packaging/notes.md).

### Testing with files: `tmp_path`

How do you test code that saves files without messing up your real data? Copy your finished `storage.py` from chapter 26 into the `cafe` folder. Remember its two functions:

```python
def load_tasks(path: Path) -> list[Task]:
def save_tasks(tasks: list[Task], path: Path) -> None:
```

A missing file gives an empty list, and a broken one raises a `ValueError` saying it `isn't valid JSON`. Both take the file's path as an argument, which is exactly what makes them easy to test.

pytest comes with some fixtures built in. You use them the same way: just ask for them by name. `tmp_path` gives each test its own brand-new, empty folder, as a `Path` from [chapter 20](../20-files-and-folders/notes.md). Your test can make any files it likes in there, and your real files are never touched. Save this as `test_storage.py`:

```python
from pathlib import Path

import pytest

from storage import load_tasks, save_tasks


def test_save_then_load_gives_the_same_tasks(tmp_path: Path) -> None:
    path = tmp_path / "tasks.json"
    tasks = [
        {"id": 1, "title": "Buy milk", "done": False, "due": "2026-10-15"},
        {"id": 2, "title": "Call grandma", "done": True, "due": None},
    ]

    save_tasks(tasks, path)

    assert load_tasks(path) == tasks


def test_missing_file_means_no_tasks(tmp_path: Path) -> None:
    assert load_tasks(tmp_path / "nothing-here.json") == []


def test_broken_file_gives_a_friendly_error(tmp_path: Path) -> None:
    path = tmp_path / "tasks.json"
    path.write_text('[{"id": 1, "title": "Buy milk"', encoding="utf-8")

    with pytest.raises(ValueError, match="isn't valid JSON"):
        load_tasks(path)
```

All three pass. The first one is called a **round-trip** test: save, load, and check that you got back exactly what you saved. The third one writes a broken file on purpose (the JSON is missing its closing `}]`) to check the error message from chapter 26's milestone 8, without you having to break a real file by hand.

Where is that folder? If you `print(tmp_path)` inside a test and run it with `-s`, you'll see something like `C:\Users\Sandip\AppData\Local\Temp\pytest-of-Sandip\pytest-2\test_where_is_tmp_path0`: Windows' folder for temporary files, then a folder named after the test. pytest keeps the folders from your last few runs, so you can look inside them if a test fails, and it deletes older ones by itself.

### Testing printed output: `capsys`

Some functions print instead of returning. Here's one for the cafe. Add it to `shop.py`:

```python
def print_receipt(items: dict[str, int]) -> None:
    """Print each item with its price, then the total."""
    for name, cents in items.items():
        print(f"{name:<10}{format_money(cents):>8}")
    print(f"{'Total':<10}{format_money(sum(items.values())):>8}")
```

`print_receipt({"Latte": 350, "Croissant": 275})` prints three lines: the two items and the total, with the prices lined up on the right. The built-in fixture `capsys` **captures** everything printed during a test, so you can check it. Save this as `test_receipt.py`:

```python
import pytest

from shop import print_receipt


def test_print_receipt(capsys: pytest.CaptureFixture[str]) -> None:
    print_receipt({"Latte": 350, "Croissant": 275})

    captured = capsys.readouterr()
    assert captured.out == (
        "Latte        $3.50\n"
        "Croissant    $2.75\n"
        "Total        $6.25\n"
    )
```

`capsys.readouterr()` gives back everything printed so far. `.out` is what went to standard output, and `.err` is what went to standard error ([chapter 24](../24-command-line-programs/notes.md)). Every `print` ends with a newline, so the expected text has a `\n` at the end of each line. (The brackets just let one long string run over several lines. Python joins strings that sit next to each other.) The hint `pytest.CaptureFixture[str]` looks odd, but it just means "the capsys fixture, capturing text".

> **Tip:** Functions that **return** text are easier to test than functions that print it. That's why chapter 26 had `format_task()` return a row instead of printing it. Keep the printing in a thin layer on top, and test the functions underneath with plain `assert`. Use `capsys` for the bits that really must print.

### Many cases, one test: `@pytest.mark.parametrize`

Look back at the discount tests. Four tests, all with the same shape: call `apply_discount` with two numbers, and compare the answer with a third. `parametrize` lets you write that shape once, with a table of cases. Save this as `test_discounts.py`:

```python
import pytest

from shop import apply_discount


@pytest.mark.parametrize(
    ("total", "percent", "expected"),
    [
        (2000, 10, 1800),
        (999, 15, 849),
        (2000, 0, 2000),
        (2000, 100, 0),
        (0, 50, 0),
    ],
)
def test_apply_discount(total: int, percent: int, expected: int) -> None:
    assert apply_discount(total, percent) == expected


@pytest.mark.parametrize("percent", [-5, 101, 150])
def test_bad_discounts_are_refused(percent: int) -> None:
    with pytest.raises(ValueError):
        apply_discount(2000, percent)
```

The first argument names the parameters. The second is a list of cases, one tuple per case, in the same order. When a test takes only one parameter, like the second one, the name is a plain string and the cases are plain values. pytest runs the test once per case, and each case counts as its own test. With `-v`:

```
test_discounts.py::test_apply_discount[2000-10-1800] PASSED              [ 12%]
test_discounts.py::test_apply_discount[999-15-849] PASSED                [ 25%]
test_discounts.py::test_apply_discount[2000-0-2000] PASSED               [ 37%]
test_discounts.py::test_apply_discount[2000-100-0] PASSED                [ 50%]
test_discounts.py::test_apply_discount[0-50-0] PASSED                    [ 62%]
test_discounts.py::test_bad_discounts_are_refused[-5] PASSED             [ 75%]
test_discounts.py::test_bad_discounts_are_refused[101] PASSED            [ 87%]
test_discounts.py::test_bad_discounts_are_refused[150] PASSED            [100%]
```

The part in square brackets says which case it was. If one case fails, only that case fails, and its brackets tell you which one. Here's what you'd see with a wrong expected value, `(999, 15, 850)`:

```
FAILED test_discounts.py::test_apply_discount[999-15-850] - assert 849 == 850
========================= 1 failed, 7 passed in 0.10s =========================
```

Adding a new case is now one line in the table.

### A taste of test-driven development

So far you've written the code first and the tests after. Some programmers do it the other way round, on purpose. **Test-driven development** (TDD) is a way of working in three small steps, over and over:

1. **Red:** write a test for something the code doesn't do yet. Run it, and watch it fail. (pytest shows failures in red.)
2. **Green:** write the simplest code that makes the test pass.
3. **Refactor:** tidy the code up, while the tests check that you didn't break anything. To **refactor** means to change how code is written without changing what it does.

Let's try it. Sandip wants a `split_bill` function: split a bill between friends so that the shares add up to **exactly** the total. When cents don't divide evenly, the first people pay one cent more. No code yet, just tests, in `test_split.py`:

```python
from shop import split_bill


def test_split_evenly() -> None:
    assert split_bill(1200, 3) == [400, 400, 400]


def test_extra_cents_go_to_the_first_people() -> None:
    assert split_bill(1000, 3) == [334, 333, 333]
```

**Red.** Run `python -m pytest test_split.py`:

```
E   ImportError: cannot import name 'split_bill' from 'shop' (C:\Users\Sandip\projects\cafe\shop.py)
=========================== short test summary info ===========================
ERROR test_split.py
!!!!!!!!!!!!!!!!!!! Interrupted: 1 error during collection !!!!!!!!!!!!!!!!!!!!
```

Of course: the function doesn't exist yet. An `ERROR` like this means pytest couldn't even load the test file. Now you know exactly what to build.

**Green.** Add the simplest thing that works to `shop.py`. `divmod()` from chapter 05 gives the share and the cents left over in one go:

```python
def split_bill(total_cents: int, people: int) -> list[int]:
    """Split a bill into fair shares that add up to exactly the total."""
    share, extra = divmod(total_cents, people)
    shares = []
    for i in range(people):
        if i < extra:
            shares.append(share + 1)
        else:
            shares.append(share)
    return shares
```

Run the tests again: `2 passed`.

**Refactor.** That loop is just building a list, so a comprehension ([chapter 15](../15-comprehensions/notes.md)) says it more clearly:

```python
def split_bill(total_cents: int, people: int) -> list[int]:
    """Split a bill into fair shares that add up to exactly the total."""
    share, extra = divmod(total_cents, people)
    return [share + 1 if i < extra else share for i in range(people)]
```

Run the tests: still `2 passed`. You changed how the code works, and the tests proved it still does the same job.

Then go round again. What should happen with 0 people? **Red:**

```python
def test_nobody_to_pay_is_refused() -> None:
    with pytest.raises(ValueError, match="at least one person"):
        split_bill(1000, 0)
```

(Add `import pytest` at the top of `test_split.py`.) It fails with `ZeroDivisionError: integer division or modulo by zero`, which is not the friendly error the test asks for. **Green:** add a guard clause ([chapter 18](../18-error-handling/notes.md)) at the top of `split_bill`: `if people < 1:`, then `raise ValueError("there must be at least one person to pay")`. Now it's `3 passed`. Each loop is a couple of minutes, and at every step you know exactly where you are.

Why bother? Writing the test first makes you decide what the function should do **before** you get lost in how. Every line of code exists to make a test pass, so nothing goes untested. And you've seen every test fail once, so you know each one really checks something. You don't have to work this way all the time, but it's a great habit for tricky functions and for bug fixes: first a test that shows the bug (red), then the fix (green).

> **Tip:** Curious which lines your tests never run? A plugin called **pytest-cov** measures your tests' **coverage**: `python -m pip install pytest-cov`, then `python -m pytest --cov=shop --cov-report=term-missing`. It prints a small table with the percentage of `shop.py` your tests ran, and the line numbers they missed. 100% doesn't mean your code is bug-free (a line can run and still be wrong), but a line no test ever runs is a line nobody has checked.

## Common mistakes

**1. Names that don't start with `test`**

```python
from shop import format_money


def check_format_money() -> None:
    assert format_money(1250) == "$12.50"
```

```
============================ no tests ran in 0.26s ============================
```

pytest only collects functions whose names start with `test`, in files whose names start with `test_`. This function is called `check_format_money`, so pytest never ran it. Rename it `test_format_money`. The same goes for the file: tests in `checks.py` or `shop_tests.py` are never found. (`no tests ran` also gives exit code `5` instead of `0`, so an automatic check would notice.)

**2. Printing instead of asserting**

```python
from shop import format_money


def test_format_money() -> None:
    print(format_money(1200) == "$12.00")
```

With the buggy `format_money` from earlier, this test **passes**: `1 passed`. It printed `False` (you'd only see it with `-s`), but a test only fails when something raises an exception, like `assert` does. A test without an `assert` checks nothing. Every test needs at least one `assert` (or a `pytest.raises`).

**3. Comparing floats with `==`**

```python
from recipe import scale


def test_scale_flour() -> None:
    assert scale(1.1, 3) == 3.3
```

```
E       assert 3.3000000000000003 == 3.3
E        +  where 3.3000000000000003 = scale(1.1, 3)
```

`scale` just multiplies `1.1` by `3`, and the answer is a tiny bit off, as floats often are. Use `assert scale(1.1, 3) == pytest.approx(3.3)`. (And for money, use whole cents, so you never need it.)

**4. Tests that depend on each other**

```python
from bank import BankAccount

account = BankAccount("Sandip", 100)


def test_deposit() -> None:
    account.deposit(50)
    assert account.balance == 150


def test_withdraw() -> None:
    account.withdraw(30)
    assert account.balance == 120
```

Run all the tests, and both pass. Then run just one of them, with `python -m pytest -k withdraw`:

```
>       assert account.balance == 120
E       assert 70 == 120
```

Both tests share one account, made once at the top of the file. `test_withdraw` only passed because `test_deposit` happened to run first and add 50. Run it on its own, or in a different order, and it fails. Every test must set up everything it needs. Use a fixture, so each test gets its own fresh account.

**5. Calling the function outside `pytest.raises`**

```python
def test_cannot_withdraw_more_than_balance() -> None:
    account = BankAccount("Sandip", 100)

    account.withdraw(500)

    with pytest.raises(ValueError):
        assert account.balance == 100
```

```
>           raise ValueError("not enough money")
E           ValueError: not enough money

bank.py:15: ValueError
```

Arrange, act, assert tempted you to do the "act" first, on its own line. But the exception happened right there, before `pytest.raises` was even listening, so it crashed the test. The line that should raise must be **inside** the `with` block. Checks on what happened afterwards go after it:

```python
    with pytest.raises(ValueError):
        account.withdraw(500)
    assert account.balance == 100
```

**6. Running pytest where it isn't installed**

You type `python -m pytest`, and get:

```
C:\Users\Sandip\AppData\Local\Programs\Python\Python313\python.exe: No module named pytest
```

The path shows this was your global Python, not the one in `.venv`. You installed pytest into the virtual environment, so activate it first (look for `(.venv)` in the prompt), then try again. It's the same mistake as mypy in [chapter 25](../25-type-hints/notes.md).

## Quick recap

- A test is a function whose name starts with `test`, in a file whose name starts with `test_`, with an `assert` inside. Run them all with `python -m pytest` (installed in your `.venv`), add `-v` for names, `-k word` to pick some, and `file.py::test_name` for just one.
- When a test fails, pytest shows the real value next to the one you expected. Read the `>` line and the `E` lines.
- Test normal cases, edge cases and error cases. Check errors with `with pytest.raises(ValueError, match="...")`, and compare floats with `pytest.approx`.
- Arrange, act, assert: set up, do one thing, check. Every test should work on its own, in any order.
- Fixtures (`@pytest.fixture`) give each test a fresh copy of what it needs. The built-in ones help too: `tmp_path` for files, `capsys` for printed output.
- `@pytest.mark.parametrize` runs one test with a whole table of cases.
- Test-driven development: red (a failing test), green (the simplest code that passes), refactor (tidy up with the tests watching).

---

**Next:** try the [exercises](exercises.md), then move on to [37 Debugging and Logging](../37-debugging-and-logging/notes.md).
