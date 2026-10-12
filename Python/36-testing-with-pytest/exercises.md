# 36 Testing with pytest: Exercises

**How to do these:**

- Set up once: open a terminal in this chapter's folder, make and activate a virtual environment, and install the tools: `python -m pip install pytest mypy` (see the notes).
- Make a folder for each exercise (`ex1`, `ex2`, and so on). Each exercise has a module with the code, and a test file for your tests, side by side in its folder.
- Move into the folder and run the tests from there: `cd ex1`, then `python -m pytest -v`. (The virtual environment stays active when you `cd`.) Use `cd ..` to go back up.
- Put hints on every function, tests and fixtures included, and check each folder with `python -m mypy .` at the end.
- The times at the end of pytest's reports (like `in 0.10s`) will be different for you. Everything else should match.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): The cinema ticket machine

A cinema's ticket machine works out prices in cents. Save this as `cinema.py` in your `ex1` folder:

```python
def ticket_price(age: int) -> int:
    """Return the ticket price in cents.

    Children under 12 pay 600, people aged 65 and over pay 700,
    and everyone else pays 1200.
    """
    if age < 0:
        raise ValueError(f"age can't be negative, got {age}")
    if age < 12:
        return 600
    if age >= 65:
        return 700
    return 1200
```

Write `test_cinema.py` with these five tests, one `assert` each:

| Test name | Checks that... |
|---|---|
| `test_child_price` | an 8-year-old pays 600 |
| `test_adult_price` | a 30-year-old pays 1200 |
| `test_senior_price` | a 70-year-old pays 700 |
| `test_age_12_pays_adult_price` | a 12-year-old pays 1200 |
| `test_age_65_pays_senior_price` | a 65-year-old pays 700 |

`python -m pytest -v` should show (after the header):

```
test_cinema.py::test_child_price PASSED                                  [ 20%]
test_cinema.py::test_adult_price PASSED                                  [ 40%]
test_cinema.py::test_senior_price PASSED                                 [ 60%]
test_cinema.py::test_age_12_pays_adult_price PASSED                      [ 80%]
test_cinema.py::test_age_65_pays_senior_price PASSED                     [100%]

============================== 5 passed in 0.10s ==============================
```

Now break the machine on purpose. In `cinema.py`, change `age >= 65` to `age > 65`, and run the tests again. The end of the report should say:

```
FAILED test_cinema.py::test_age_65_pays_senior_price - assert 1200 == 700
========================= 1 failed, 4 passed in 0.16s =========================
```

Answer in a comment at the top of `test_cinema.py`: why did `test_senior_price` still pass, even though the code was wrong? What does that tell you about which ages are worth testing? Then put `>=` back, and check you're at `5 passed` again.

<details>
<summary>Hint 1</summary>

Each test is a function with no parameters, a `-> None` hint, and one line inside, like `assert ticket_price(8) == 600`. Don't forget `from cinema import ticket_price` at the top.

</details>

<details>
<summary>Hint 2</summary>

For the question: with `age > 65`, what does a 70-year-old pay? And a 65-year-old? Bugs like this hide right at the edges, which is why the notes call them edge cases.

</details>

---

## Exercise 2 (Easy): Booking a gym class

The gym's booking app refuses silly requests with a `ValueError`. Save this as `gym.py` in your `ex2` folder:

```python
def book_places(spaces_left: int, wanted: int) -> int:
    """Book places in a gym class, and return how many spaces are left."""
    if wanted < 1:
        raise ValueError("you must book at least one place")
    if wanted > spaces_left:
        raise ValueError(f"sorry, only {spaces_left} spaces left")
    return spaces_left - wanted
```

Write `test_gym.py` with four tests:

- `test_booking_reduces_spaces`: booking 3 places in a class with 10 spaces leaves 7.
- `test_booking_the_last_places`: booking 2 places when 2 are left leaves 0.
- `test_must_book_at_least_one`: booking 0 places raises a `ValueError` whose message contains `at least one`.
- `test_cannot_book_more_than_spaces_left`: booking 5 places when only 2 are left raises a `ValueError` whose message contains `only 2 spaces left`.

`python -m pytest` should end with:

```
test_gym.py ....                                                         [100%]

============================== 4 passed in 0.03s ==============================
```

A test you've never seen fail might not be testing anything. So check your error tests: delete the first `if` and its `raise` from `gym.py`, and run the tests again. You should see:

```
FAILED test_gym.py::test_must_book_at_least_one - Failed: DID NOT RAISE Value...
========================= 1 failed, 3 passed in 0.15s =========================
```

(The summary line is cut short with `...`. Scroll up to the `E` line to see the whole message: `Failed: DID NOT RAISE ValueError`.) Put the `if` back, and you're at `4 passed` again.

<details>
<summary>Hint 1</summary>

Add `import pytest` at the top of the test file, above `from gym import book_places`, with a blank line between them.

</details>

<details>
<summary>Hint 2</summary>

The call that should fail goes *inside* the `with` block: `with pytest.raises(ValueError, match="at least one"):` on one line, then `book_places(10, 0)` indented underneath.

</details>

---

## Exercise 3 (Medium): A shopping cart with a fixture

A coffee shop's website has a cart class. Save this as `cart.py` in your `ex3` folder:

```python
class Cart:
    """A shopping cart: item names and their prices in cents."""

    def __init__(self) -> None:
        self.items: dict[str, int] = {}

    def add(self, name: str, price_cents: int) -> None:
        if price_cents <= 0:
            raise ValueError("price must be positive")
        self.items[name] = price_cents

    def remove(self, name: str) -> None:
        if name not in self.items:
            raise KeyError(f"{name} isn't in the cart")
        del self.items[name]

    def total(self) -> int:
        return sum(self.items.values())

    def total_with_code(self, code: str) -> int:
        """The total after a discount code. Codes ignore capitals.

        SAVE10 takes 10% off, HALF takes 50% off. Unknown codes change nothing.
        """
        percents = {"SAVE10": 10, "HALF": 50}
        percent = percents.get(code.upper(), 0)
        return self.total() - round(self.total() * percent / 100)
```

In `test_cart.py`, write a fixture called `cart` that returns a `Cart` with two things already in it: `"Coffee beans"` for 1250 cents and `"Mug"` for 850 cents. Then write these tests, each one using the fixture:

- `test_total`: the total is 2100.
- `test_add_item`: after adding `"Filter papers"` for 399, the total is 2499.
- `test_remove_item`: after removing the `"Mug"`, the total is 1250.
- `test_remove_missing_item`: removing a `"Teapot"` raises a `KeyError`.
- `test_price_must_be_positive`: adding a `"Free sticker"` for 0 cents raises a `ValueError` whose message contains `positive`.
- `test_discount_codes`: one parametrized test with these four cases: `SAVE10` gives 1890, `HALF` gives 1050, `save10` gives 1890, and `BOGUS` gives 2100.

`python -m pytest -v` should show:

```
test_cart.py::test_total PASSED                                          [ 11%]
test_cart.py::test_add_item PASSED                                       [ 22%]
test_cart.py::test_remove_item PASSED                                    [ 33%]
test_cart.py::test_remove_missing_item PASSED                            [ 44%]
test_cart.py::test_price_must_be_positive PASSED                         [ 55%]
test_cart.py::test_discount_codes[SAVE10-1890] PASSED                    [ 66%]
test_cart.py::test_discount_codes[HALF-1050] PASSED                      [ 77%]
test_cart.py::test_discount_codes[save10-1890] PASSED                    [ 88%]
test_cart.py::test_discount_codes[BOGUS-2100] PASSED                     [100%]

============================== 9 passed in 0.05s ==============================
```

Finally, an experiment. Add `print("making a new cart")` as the first line of your fixture, and run `python -m pytest -s -q`. Count how many times the message appears (it's mixed in with the dots). Answer in a comment: why that many times? And why does `test_remove_item` still find the `"Mug"`, even though `test_add_item` changed the cart just before it? Take the `print` out again when you're done.

<details>
<summary>Hint 1</summary>

The fixture makes a `Cart()`, calls `.add(...)` twice, and returns the cart. Its return hint is `-> Cart`. Each test then takes a parameter with exactly the same name as the fixture: `def test_total(cart: Cart) -> None:`.

</details>

<details>
<summary>Hint 2</summary>

A parametrized test can use a fixture too. Put the fixture's name first, then the parameters from the table: `def test_discount_codes(cart: Cart, code: str, expected: int) -> None:`.

</details>

<details>
<summary>Hint 3</summary>

The parametrize names go in a tuple of strings, `("code", "expected")`, and each case is a tuple like `("SAVE10", 1890)`.

</details>

---

## Exercise 4 (Medium): Bug hunt in the recipe book

Maya keeps her recipes in a JSON file, and her app prints a shopping list for the meals she picks. She tried it with one recipe and it looked fine. Save her code as `recipes.py` in your `ex4` folder, exactly as it is:

```python
import json
from pathlib import Path

Recipes = dict[str, list[str]]  # recipe name -> its ingredients


def save_recipes(recipes: Recipes, path: Path) -> None:
    """Save all the recipes to a JSON file."""
    with open(path, "w", encoding="utf-8") as f:
        json.dump(recipes, f, indent=2)


def load_recipes(path: Path) -> Recipes:
    """Load the recipes from a JSON file. No file yet means no recipes."""
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return {}


def print_shopping_list(recipes: Recipes, names: list[str]) -> None:
    """Print every ingredient needed for these recipes, once each, A to Z."""
    needed: list[str] = []
    for name in names:
        needed.extend(recipes[name])
    for ingredient in sorted(needed):
        print(f"[ ] {ingredient}")
    print(f"{len(needed)} items")


if __name__ == "__main__":
    book = {
        "Pancakes": ["eggs", "flour", "milk"],
        "Omelette": ["cheese", "eggs", "milk"],
    }
    print_shopping_list(book, ["Pancakes"])
```

The code has one bug. Don't go looking for it. Write tests from the docstrings, and let them find it. In `test_recipes.py`:

1. Write a fixture called `book` that returns the same two recipes as the code at the bottom of `recipes.py`.
2. Write these five tests. Use `tmp_path` for every file, so nothing is saved in your `ex4` folder:
   - `test_save_creates_the_file`: after saving, the file exists.
   - `test_save_then_load`: loading what you saved gives back the same recipes.
   - `test_missing_file_means_no_recipes`: loading a file that isn't there gives `{}`.
   - `test_shopping_list`: the list for `["Pancakes", "Omelette"]` prints exactly this (use `capsys`):

     ```
     [ ] cheese
     [ ] eggs
     [ ] flour
     [ ] milk
     4 items
     ```

   - `test_unknown_recipe`: asking for `["Lasagne"]` raises a `KeyError`.

Run the tests. One of them should fail:

```
E       AssertionError: assert '[ ] cheese\n...lk\n6 items\n' == '[ ] cheese\n...lk\n4 items\n'
E         
E           [ ] cheese
E         + [ ] eggs
E           [ ] eggs
E           [ ] flour
E           [ ] milk
E         + [ ] milk...
```

and the report ends with `1 failed, 4 passed`. Read the `+` lines: what did the function print that it shouldn't have? Now fix the bug in `recipes.py`, **without changing your tests**, until you get `5 passed`. Then run `python recipes.py`, and check it still prints the Pancakes list (`[ ] eggs`, `[ ] flour`, `[ ] milk`, `3 items`).

<details>
<summary>Hint 1</summary>

Each test that touches a file needs both fixtures: `def test_save_then_load(tmp_path: Path, book: Recipes) -> None:`. Build the file's path with `tmp_path / "recipes.json"`. You can import `Recipes` from `recipes` along with the functions.

</details>

<details>
<summary>Hint 2</summary>

For the shopping list, call the function, then compare `capsys.readouterr().out` with the whole expected text, with `\n` after every line, including the last one.

</details>

<details>
<summary>Hint 3</summary>

Eggs and milk are in both recipes. Which collection type from [chapter 12](../12-tuples-and-sets/notes.md) keeps only one of each thing? `sorted()` works on it too, and gives back a list.

</details>

---

## Exercise 5 (Challenge): The car park, test first

The car park next to the cafe wants a fee calculator, and this time you'll build it with test-driven development: **every function is written after its test.** Here are the rules:

- The first 30 minutes are free.
- After that, every **started** hour of the whole stay costs $2.00 (200 cents). So 31 minutes costs 200, 60 minutes costs 200, and 61 minutes costs 400.
- A visit never costs more than $15.00 (1500 cents).
- Only whole minutes count: 30 minutes and 59 seconds is still 30 minutes.
- Bad input (negative minutes, or leaving before arriving) raises a `ValueError`.

You'll write three functions in `parking.py`, in your `ex5` folder:

```python
def parking_fee(minutes: int) -> int:
def minutes_parked(arrived: datetime, left: datetime) -> int:
def receipt(arrived: datetime, left: datetime) -> str:
```

`receipt` returns one line like `Parked 1h 35m: $4.00`.

Work through this list **one test at a time**. For each one: write the test in `test_parking.py`, run it and watch it fail (red), write just enough code to pass (green), then tidy up if you want (refactor), with every test still passing.

1. `test_short_stay_is_free`: 20 minutes costs 0. (Red, the very first time, means `parking.py` doesn't even have the function yet.)
2. `test_30_minutes_is_still_free`: 30 minutes costs 0.
3. `test_started_hours_are_charged`: parametrized, with the cases 31 minutes costs 200, 60 costs 200, 61 costs 400, and 180 costs 600.
4. `test_fee_never_goes_over_15_dollars`: 600 minutes costs 1500.
5. `test_negative_minutes_are_refused`: -5 minutes raises a `ValueError`.
6. `test_minutes_parked`: from 9:15 to 10:50 on 12 October 2026 is 95 minutes.
7. `test_seconds_are_ignored`: from 9:15:00 to 9:45:59 is 30 minutes.
8. `test_leaving_before_arriving_is_refused`: arriving at 9:15 and leaving at 8:00 raises a `ValueError` whose message contains `before you arrive`.
9. `test_receipt`: arriving at 9:15 and leaving at 10:50 gives `"Parked 1h 35m: $4.00"`.

When you're done, `python -m pytest -v` shows:

```
test_parking.py::test_short_stay_is_free PASSED                          [  8%]
test_parking.py::test_30_minutes_is_still_free PASSED                    [ 16%]
test_parking.py::test_started_hours_are_charged[31-200] PASSED           [ 25%]
test_parking.py::test_started_hours_are_charged[60-200] PASSED           [ 33%]
test_parking.py::test_started_hours_are_charged[61-400] PASSED           [ 41%]
test_parking.py::test_started_hours_are_charged[180-600] PASSED          [ 50%]
test_parking.py::test_fee_never_goes_over_15_dollars PASSED              [ 58%]
test_parking.py::test_negative_minutes_are_refused PASSED                [ 66%]
test_parking.py::test_minutes_parked PASSED                              [ 75%]
test_parking.py::test_seconds_are_ignored PASSED                         [ 83%]
test_parking.py::test_leaving_before_arriving_is_refused PASSED          [ 91%]
test_parking.py::test_receipt PASSED                                     [100%]

============================= 12 passed in 0.09s ==============================
```

and `python -m mypy .` says `Success: no issues found in 2 source files`.

Last, add an `if __name__ == "__main__":` block to `parking.py` that prints the receipts for three visits on 12 October 2026: 9:15 to 9:40, 9:15 to 19:05, and 9:15 to 10:16. `python parking.py` should print:

```
Parked 0h 25m: $0.00
Parked 9h 50m: $15.00
Parked 1h 01m: $4.00
```

<details>
<summary>Hint 1</summary>

"Every started hour" means rounding *up*: 61 minutes is 1.02 hours, which counts as 2. `math.ceil()` from [chapter 05](../05-numbers-and-math/notes.md) rounds up. Then `min()` keeps the fee from going over the limit.

</details>

<details>
<summary>Hint 2</summary>

A `datetime` minus a `datetime` is a `timedelta`, and `.total_seconds()` turns it into seconds ([chapter 22](../22-dates-and-times/notes.md)). `//` by 60 throws away the leftover seconds, and `int()` turns the answer into a whole number.

</details>

<details>
<summary>Hint 3</summary>

For `receipt`, `divmod(minutes, 60)` gives the hours and the leftover minutes, and `:02` pads the minutes to two digits, like `01`. You'll need a `format_money` too: you know that one by heart by now.

</details>

<details>
<summary>Hint 4</summary>

Try not to write code that no test needs yet. After test 1, `return 0` is a perfectly good `parking_fee`! It feels silly, but the next tests will force the real rules out of you, one at a time, and each rule will have a test that proves it.

</details>

---

## Before you move on

You now have a safety net: change your code, run `python -m pytest`, and know within a second whether you broke something. But a failing test only tells you *that* something is wrong, not always *why*. In [chapter 37](../37-debugging-and-logging/notes.md), you'll learn to pause a program in the middle of running and look around inside it, and to keep a record of what your programs do while you're not watching.
