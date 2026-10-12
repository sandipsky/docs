# 37 Debugging and Logging: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.py`, `ex2.py`, and so on), and copy in the starting code where there is some. Most of it is broken on purpose.
- Run each one with `python ex1.py` from a terminal opened in this folder. For the exercises that ask for a test or a type check, use a virtual environment with pytest and mypy installed ([chapter 25](../25-type-hints/notes.md) and [chapter 36](../36-testing-with-pytest/notes.md)).
- For the bug hunts, follow the method from the notes: read the error, make one guess, **check** it, and only then change the code. Write your guess in a comment before you fix anything.
- Remember to delete every `breakpoint()` and debug `print` when you're done.
- Your times in log files will be different from the ones shown here.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Read the traceback

The town library works out late fines: 25 cents for every day a book comes back late, and nothing if it comes back early. Copy this into `ex1.py`, exactly as it is:

```python
from datetime import date

FINE_PER_DAY = 25  # cents


def days_late(loan: dict[str, date]) -> int:
    return (loan["returned"] - loan["due"]).days


def fine_for(loan: dict[str, date]) -> int:
    return max(days_late(loan), 0) * FINE_PER_DAY


def total_fines(loans: list[dict[str, date]]) -> int:
    total = 0
    for loan in loans:
        total += fine_for(loan)
    return total


loans = [
    {"due": date(2026, 10, 1), "returned": date(2026, 10, 5)},
    {"due": date(2026, 10, 3), "returned": date(2026, 10, 2)},
    {"due": date(2026, 10, 4), "retuned": date(2026, 10, 10)},
]
print(f"Total fines: {total_fines(loans)} cents")
```

Run it. It crashes with this traceback (your file paths will be longer):

```
Traceback (most recent call last):
  File "C:\...\37-debugging-and-logging\ex1.py", line 26, in <module>
    print(f"Total fines: {total_fines(loans)} cents")
                          ~~~~~~~~~~~^^^^^^^
  File "C:\...\37-debugging-and-logging\ex1.py", line 17, in total_fines
    total += fine_for(loan)
             ~~~~~~~~^^^^^^
  File "C:\...\37-debugging-and-logging\ex1.py", line 11, in fine_for
    return max(days_late(loan), 0) * FINE_PER_DAY
               ~~~~~~~~~^^^^^^
  File "C:\...\37-debugging-and-logging\ex1.py", line 7, in days_late
    return (loan["returned"] - loan["due"]).days
            ~~~~^^^^^^^^^^^^
KeyError: 'returned'
```

**Before you change anything**, answer these in comments at the top of the file:

1. What kind of exception was it, and what does its message mean?
2. Which function, and which line, actually crashed?
3. Write down the chain of calls that led there, starting from the main part of the file.
4. Add `print(f"{loan=}")` as the first line inside the `for` loop in `total_fines`, and run it again. Which loan was being worked on when it crashed? Copy its debug line into a comment.
5. Is the bug really in `days_late`? Where is it?

Then fix the real problem, remove the debug print, and run it again:

```
Total fines: 250 cents
```

<details>
<summary>Hint 1</summary>

Read from the bottom up. The last line says *what*, the `File` line just above it says *where*, and each `File` line further up is one step back along the chain of calls.

</details>

<details>
<summary>Hint 2</summary>

The debug print runs just before each loan is worked on, so the last `loan=...` line before the traceback is the one that broke. Compare its keys with the other loans, letter by letter.

</details>

---

## Exercise 2 (Easy): The workout streak

Zoe's fitness app shows her longest streak: the most days in a row she worked out. Each day is `True` (worked out) or `False` (rest day). Copy this into `ex2.py`:

```python
def longest_streak(days: list[bool]) -> int:
    """Return the most days in a row with a workout (True)."""
    best = 0
    current = 0
    for worked_out in days:
        if worked_out:
            current += 1
        else:
            best = max(best, current)
            current = 0
    return best


print(longest_streak([True, True, False, True, False]))  # should be 2
print(longest_streak([True, False, True, True, True]))   # should be 3
print(longest_streak([False, False]))                    # should be 0
print(longest_streak([True, True, True, True]))          # should be 4
```

It prints:

```
2
1
0
0
```

Two of the four are wrong, and there's no traceback to help.

1. Add this line as the last line inside the loop (at the same indent as `if`), and look at the second call's output:

   ```python
           print(f"{worked_out=} {current=} {best=}")
   ```

   For the second call you'll see:

   ```
   worked_out=True current=1 best=0
   worked_out=False current=0 best=1
   worked_out=True current=1 best=1
   worked_out=True current=2 best=1
   worked_out=True current=3 best=1
   1
   ```

   Write in a comment: what do the two wrong cases have in common? Why does `best` never become 3?

2. Before fixing it, write a test file `test_streak.py` with one test for each of the four calls (and one more for an empty list, which should give `0`). Move the four `print` lines under `if __name__ == "__main__":` first, so they don't run when the test imports `longest_streak`. Run `python -m pytest`: the tests for the second and fourth calls should **fail**, showing `assert 1 == 3` and `assert 0 == 4`.
3. Now fix the function and delete the debug print. Run the tests again until they all pass (pytest's last line says `5 passed`). And `python ex2.py` prints:

   ```
   2
   3
   0
   4
   ```

<details>
<summary>Hint 1</summary>

In the debug output, `current` reaches 3. But look at *when* `best` gets updated: only on a rest day. What if the list ends without a rest day?

</details>

<details>
<summary>Hint 2</summary>

There are two ways to fix it. You could compare `best` with `current` once more after the loop. Or you could update `best` every time `current` grows, instead of only on rest days. The second way is simpler.

</details>

<details>
<summary>Hint 3</summary>

A test is just a function whose name starts with `test_` and that contains an `assert`, like `assert longest_streak([False, False]) == 0`. Writing the test before the fix, and watching it fail, is the "red" step of red, green, refactor from chapter 36.

</details>

---

## Exercise 3 (Medium): Split the bill with pdb

Sam and his friends often eat out together, and he wrote a program to split the bill, tip included. There's a rule: **the shares must always add up to exactly the total**, so nobody at the restaurant is short. Copy this into `ex3.py`:

```python
def add_tip(subtotal_cents: int, tip_percent: int) -> int:
    return subtotal_cents + subtotal_cents * tip_percent // 100


def split_bill(prices: list[int], tip_percent: int, people: int) -> list[int]:
    """Split the bill, tip included, into one share per person (in cents).

    The shares must always add up to exactly the total.
    """
    total = add_tip(sum(prices), tip_percent)
    share = total // people
    return [share] * people


BILLS = [  # (prices, tip percent, people)
    ([1250, 980, 1500], 10, 3),
    ([1000], 0, 3),
    ([2000, 1000], 15, 2),
]

for prices, tip, people in BILLS:
    shares = split_bill(prices, tip, people)
    print(f"{shares} add up to {sum(shares)}")
```

It prints:

```
[1367, 1367, 1367] add up to 4101
[333, 333, 333] add up to 999
[1725, 1725] add up to 3450
```

The last bill is fine, but the first two lose some cents. This time, investigate with **pdb**, not prints:

1. Put `breakpoint()` as the first line inside `split_bill`, and run the program.
2. Use `n` to get to the `total = ...` line. Then use `s` to step **into** `add_tip`. Use `w` to see the call stack, and `p subtotal_cents` to see what it was given. (For the first bill, that's `3730`.)
3. Use `n` to come back out of `add_tip` and keep going until you reach the `return` line of `split_bill`. Then try these, and write down what each one shows:

   ```
   p total
   p share
   p share * people
   p total - share * people
   ```

   For the first bill, `p total` shows `4103` and `p share` shows `1367`.

4. Press `c`. The breakpoint stops again for the second bill. Check `p total - share * people` there too, then press `c` again to finish (or `q` to stop).

Answer in comments: where do the missing cents go, and why does the third bill not have the problem?

Then fix `split_bill` so the left-over cents are shared out one each, to the first people in the list. Remove the `breakpoint()`. Now it prints:

```
[1368, 1368, 1367] add up to 4103
[334, 333, 333] add up to 1000
[1725, 1725] add up to 3450
```

**Bonus:** do the same investigation with the VS Code debugger instead. Set a red-dot breakpoint on the `return` line, press `F5`, and add `total - share * people` in the **Watch** panel.

<details>
<summary>Hint 1</summary>

`//` throws away the remainder. `p total % people` shows you the remainder directly: that's how many cents nobody is paying.

</details>

<details>
<summary>Hint 2</summary>

Work out `left_over = total - share * people` (or `total % people`). Then build the list so that the first `left_over` people pay `share + 1`, and everyone else pays `share`. A loop with `range(people)` works, and so does a list comprehension with a conditional expression (chapter 08).

</details>

---

## Exercise 4 (Medium): Logging at the bank

Aisha's bank account program reports everything with `print`, and it's getting noisy. Copy it into `ex4.py`:

```python
class BankAccount:
    def __init__(self, owner: str, balance: int = 0) -> None:
        self.owner = owner
        self.balance = balance

    def deposit(self, amount: int) -> None:
        print(f"DEBUG: deposit({amount}) for {self.owner}")
        if amount <= 0:
            raise ValueError("deposit must be positive")
        self.balance += amount
        print(f"{self.owner} deposited {amount}, balance is {self.balance}")

    def withdraw(self, amount: int) -> None:
        print(f"DEBUG: withdraw({amount}) for {self.owner}")
        if amount <= 0:
            raise ValueError("withdrawal must be positive")
        if amount > self.balance:
            raise ValueError("not enough money")
        self.balance -= amount
        print(f"{self.owner} withdrew {amount}, balance is {self.balance}")
        if self.balance < 20:
            print(f"WARNING: {self.owner}'s balance is low: {self.balance}")


account = BankAccount("Aisha", 100)
actions = [
    ("deposit", 50),
    ("withdraw", 30),
    ("withdraw", 500),
    ("deposit", -5),
    ("withdraw", 105),
]

for action, amount in actions:
    try:
        if action == "deposit":
            account.deposit(amount)
        else:
            account.withdraw(amount)
    except ValueError as e:
        print(f"ERROR: {action} of {amount} refused: {e}")
```

1. Replace every `print` with a logging call at the right level, using `logger = logging.getLogger(__name__)` and `%s` placeholders. Move the code at the bottom into a `main()` function, which sets up logging with `basicConfig` and the format `"%(levelname)-8s %(message)s"`. Run `python ex4.py`:

   ```
   INFO     Aisha deposited 50, balance is 150
   INFO     Aisha withdrew 30, balance is 120
   ERROR    withdraw of 500 refused: not enough money
   ERROR    deposit of -5 refused: deposit must be positive
   INFO     Aisha withdrew 105, balance is 15
   WARNING  Aisha's balance is low: 15
   ```

2. Add a `--verbose` flag (help text `show debug messages too`). `python ex4.py --verbose` also shows the debug lines:

   ```
   DEBUG    deposit(50) for Aisha
   INFO     Aisha deposited 50, balance is 150
   DEBUG    withdraw(30) for Aisha
   INFO     Aisha withdrew 30, balance is 120
   DEBUG    withdraw(500) for Aisha
   ERROR    withdraw of 500 refused: not enough money
   DEBUG    deposit(-5) for Aisha
   ERROR    deposit of -5 refused: deposit must be positive
   DEBUG    withdraw(105) for Aisha
   INFO     Aisha withdrew 105, balance is 15
   WARNING  Aisha's balance is low: 15
   ```

Finish with `python -m mypy ex4.py` saying `Success`.

<details>
<summary>Hint 1</summary>

The `DEBUG:`, `WARNING:` and `ERROR:` prefixes tell you which level each message should be. The two lines without a prefix are normal events, so they're `INFO`. Drop the prefixes from the messages themselves: the format adds the level for you.

</details>

<details>
<summary>Hint 2</summary>

A refused withdrawal isn't a bug in your code, and the message already says exactly what happened, so a one-line `logger.error(...)` is enough here. Save `logger.exception(...)` for surprises that you'll need a traceback to investigate.

</details>

<details>
<summary>Hint 3</summary>

Look at `open_cafe.py` in the notes. The `--verbose` flag doesn't touch the logging calls at all: it only changes which level you pass to `basicConfig`. Remember that the argparse code and `basicConfig` must both run before the first message is logged.

</details>

---

## Exercise 5 (Challenge): The order importer

The cafe's website saves online orders in a CSV file, and some rows are always a mess. Build an importer that reads the good rows, skips the bad ones, and keeps a proper log of every problem. It brings together modules ([chapter 19](../19-modules-and-standard-library/notes.md)), CSV files ([chapter 21](../21-json-and-csv/notes.md)), argparse ([chapter 24](../24-command-line-programs/notes.md)) and dataclasses ([chapter 30](../30-dataclasses-and-enums/notes.md)).

Save this as `orders.csv`:

```
order_id,customer,item,quantity,price_cents
1001,Maya,latte,2,350
1002,Leo,muffin,1,275
1003,Zoe,tea,two,250
1004,Priya,cookie,3,120
1005,,latte,1,350
1006,Sam,cake,1,abc
```

Split the program into two files:

- `importer.py` has an `Order` dataclass (`order_id`, `customer`, `item`, `quantity` and `price_cents`, all hinted, plus a `total_cents()` method) and a function `read_orders(path: Path) -> tuple[list[Order], int]` that returns the good orders and the number of rows it skipped. It has its own `logger = logging.getLogger(__name__)`, and **never** calls `basicConfig`.
- `ex5.py` is the program you run. It takes the CSV file's name, a `--verbose` flag, and a `--log-file` option (default `import.log`). It sets up logging to the file, calls `read_orders`, and prints a short summary on the screen.

Rows are numbered like a spreadsheet: the header is row 1, so the first order is row 2. The rules:

- A row with no customer is skipped with a `WARNING`.
- A row whose numbers can't be read is skipped with an `ERROR` that includes the traceback.
- Every good row gets a `DEBUG` line, so it only shows with `--verbose`.

`python ex5.py orders.csv` prints:

```
Imported 3 orders, skipped 3.
Total value: $13.35
See import.log for details.
```

and `import.log` contains something like this (your times will differ, and your traceback lines will match your own code):

```
2026-10-12 11:18:16 INFO __main__: Importing orders.csv
2026-10-12 11:18:16 ERROR importer: Row 4: could not read order 1003
Traceback (most recent call last):
  File "C:\...\37-debugging-and-logging\importer.py", line 36, in read_orders
    quantity=int(row["quantity"]),
             ~~~^^^^^^^^^^^^^^^^^
ValueError: invalid literal for int() with base 10: 'two'
2026-10-12 11:18:16 WARNING importer: Row 6: order 1005 has no customer, skipping it
2026-10-12 11:18:16 ERROR importer: Row 7: could not read order 1006
Traceback (most recent call last):
  File "C:\...\37-debugging-and-logging\importer.py", line 37, in read_orders
    price_cents=int(row["price_cents"]),
                ~~~^^^^^^^^^^^^^^^^^^^^
ValueError: invalid literal for int() with base 10: 'abc'
2026-10-12 11:18:16 INFO importer: Read 3 orders, skipped 3
2026-10-12 11:18:16 INFO __main__: Done
```

Delete `import.log`, then run `python ex5.py orders.csv --verbose`. The same lines appear, plus one `DEBUG` line for each good order, in between the others:

```
2026-10-12 11:18:17 DEBUG importer: Row 2: order 1001, 2 x latte for Maya
2026-10-12 11:18:17 DEBUG importer: Row 3: order 1002, 1 x muffin for Leo
2026-10-12 11:18:17 DEBUG importer: Row 5: order 1004, 3 x cookie for Priya
```

Finally, a missing file: `python ex5.py nothere.csv` prints `No such file: nothere.csv` to `sys.stderr` and ends with exit code `1`, and the log gets a `CRITICAL` line:

```
2026-10-12 11:18:19 INFO __main__: Importing nothere.csv
2026-10-12 11:18:19 CRITICAL __main__: No such file: nothere.csv
```

Finish with `python -m mypy ex5.py importer.py` saying `Success`.

<details>
<summary>Hint 1</summary>

The log format is `"%(asctime)s %(levelname)s %(name)s: %(message)s"` with `datefmt="%Y-%m-%d %H:%M:%S"`. Because each file has its own `getLogger(__name__)`, `%(name)s` shows `importer` or `__main__` by itself.

</details>

<details>
<summary>Hint 2</summary>

`csv.DictReader` (chapter 21) gives you each row as a dictionary. Wrap it in `enumerate(..., start=2)` to get the spreadsheet row numbers. Check for an empty customer first, then put the `int()` conversions inside a `try`, with `logger.exception(...)` in the `except ValueError:` block, followed by `continue`.

</details>

<details>
<summary>Hint 3</summary>

Remember that `basicConfig` must come before any logging at all, and that it belongs in `ex5.py` only. Catch `FileNotFoundError` around the call to `read_orders`, log it with `logger.critical(...)`, print the message to `sys.stderr`, and `sys.exit(1)`.

</details>

---

## Before you move on

You now have a method for bugs, and the tools to back it up: `f"{x=}"` for quick looks, pdb and the VS Code debugger for stepping through code, and `logging` for a record of what happened when nobody was watching.

That's the last tool for Level 3. In [chapter 38](../38-project-library-system/notes.md), you'll put everything together in a bigger project: a library system with books, members and loans, built with classes, tested with pytest, and keeping a log of everything it does.
