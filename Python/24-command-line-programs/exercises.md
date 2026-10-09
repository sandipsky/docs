# 24 Command-Line Programs: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.py`, `ex2.py`, and so on).
- Run each one from a terminal opened in this folder, with the arguments shown, like `python ex1.py milk eggs`.
- Exercise 1 uses `sys.argv`. From Exercise 2 on, use `argparse`.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): The shopping list

Write `ex1.py`, which takes any number of shopping items from the command line and prints them as a numbered list.

```
python ex1.py milk eggs "brown bread"
```

Expected output:

```
You gave me 3 items:
1. milk
2. eggs
3. brown bread
```

If no items are given at all, print this usage line to **standard error** and stop with exit code `1`:

```
Usage: python ex1.py ITEM [ITEM ...]
```

Check the exit code afterwards with `$LASTEXITCODE` (it should be `1`), then again after a normal run (it should be `0`).

**Rule:** use `sys.argv`, not argparse, for this one.

<details>
<summary>Hint 1</summary>

Item 0 of `sys.argv` is the script's name, which isn't a shopping item. A slice from [chapter 11](../11-lists/notes.md) gives you everything after it.

</details>

<details>
<summary>Hint 2</summary>

`enumerate()` numbers things for you. Look up its `start` argument, so the numbers begin at 1 instead of 0.

</details>

---

## Exercise 2 (Easy): A birthday card

Write `ex2.py`, a birthday card printer, with argparse:

- `name`: a positional argument, with the help text `who the card is for`.
- `--age`: a whole number, with the help text `their new age`. If it's left out, the card skips the age line.
- `--sign`: who the card is from, with the help text `who the card is from`. It defaults to `a friend`.
- `--balloons`: an on/off flag, with the help text `add some balloons`. It adds a line of balloons at the top.

Use `Print a birthday card.` as the description.

`python ex2.py Maya --age 30 --sign Sandip`:

```
Happy birthday, Maya!
30 years young today.
Love from Sandip
```

`python ex2.py Sam --balloons`:

```
o  o  o  o  o
Happy birthday, Sam!
Love from a friend
```

`python ex2.py -h`:

```
usage: ex2.py [-h] [--age AGE] [--sign SIGN] [--balloons] name

Print a birthday card.

positional arguments:
  name         who the card is for

options:
  -h, --help   show this help message and exit
  --age AGE    their new age
  --sign SIGN  who the card is from
  --balloons   add some balloons
```

And `python ex2.py Maya --age thirty` should end with:

```
ex2.py: error: argument --age: invalid int value: 'thirty'
```

<details>
<summary>Hint 1</summary>

An option you don't give a `default` gets `None` when it's left out. How can you check for `None` before printing the age line?

</details>

<details>
<summary>Hint 2</summary>

Which `action` turns an option into a flag that's either `True` or `False`?

</details>

---

## Exercise 3 (Medium): Bug hunt at the pizzeria

A pizzeria wrote a tool to price its orders, but it's full of bugs. Copy it into `ex3.py` and fix it one bug at a time.

```python
import argparse

PRICES = {"small": 8, "meduim": 10, "large": 13}

parser = argparse.ArgumentParser(description="Order pizza.")
parser.add_argument("size", choices=["small", "medium", "large"], help="pizza size")
parser.add_argument("--extra-cheese", action="store_true", help="add extra cheese ($2)")
parser.add_argument("--quantity", default=1, help="how many pizzas")
parser.add_argument("--toppings", nargs="+", default=[], help="toppings ($1 each)")
args = parser.parse_args

price = PRICES[args.size]
if args.extra-cheese:
    price = price + 2
price = price + len(args.toppings)
total = price * args.quantity
print(f"{args.quantity} x {args.size} pizza: ${total}")
```

There are 4 bugs. One of them doesn't crash at all: it just gives a very silly price. When they're all fixed:

`python ex3.py large --toppings mushroom olive --extra-cheese --quantity 2`

```
2 x large pizza: $34
```

`python ex3.py small`

```
1 x small pizza: $8
```

And `python ex3.py huge` ends with:

```
ex3.py: error: argument size: invalid choice: 'huge' (choose from 'small', 'medium', 'large')
```

**Rule:** fix the bugs, don't rewrite the program.

<details>
<summary>Hint 1</summary>

Run it with `python ex3.py large` first. The first error, `'function' object has no attribute 'size'`, means `args` isn't the answers at all. Look closely at the line that makes `args`.

</details>

<details>
<summary>Hint 2</summary>

To find all four, run it with different sizes and options: try `medium`, and try `--extra-cheese` and `--quantity 2`.

</details>

<details>
<summary>Hint 3</summary>

The silly price: a large pizza ordered twice costs `$2222222222222`. What does `13 * "2"` give in Python? Where does a string sneak in?

</details>

---

## Exercise 4 (Medium): The class results

A teacher wants a quick summary of a test. Write `ex4.py`, which takes one or more whole-number scores and an optional `--pass-mark` (default `40`).

`python ex4.py 72 85 90 41`:

```
Scores: 72, 85, 90, 41
Average: 72.0
Passed: 4 of 4 (pass mark 40)
```

`python ex4.py 72 85 90 41 --pass-mark 75`:

```
Scores: 72, 85, 90, 41
Average: 72.0
Passed: 2 of 4 (pass mark 75)
```

A score below 0 or above 100 is a typing mistake. Before printing anything, check every score. If one is out of range, print an error to standard error and stop with exit code `1`. `python ex4.py 72 105 88`:

```
Error: 105 is not between 0 and 100
```

argparse should handle the rest of the mistakes for you: no scores at all, or a score like `B+`.

<details>
<summary>Hint 1</summary>

`nargs="+"` and `type=int` together give you a list of `int`s.

</details>

<details>
<summary>Hint 2</summary>

`--pass-mark` has a dash, so what's its name on `args`?

</details>

<details>
<summary>Hint 3</summary>

For the `Scores:` line, `join()` only joins strings. A list comprehension from [chapter 15](../15-comprehensions/notes.md) can turn every score into a string first. Another comprehension, with an `if`, can collect the scores that passed.

</details>

---

## Exercise 5 (Challenge): A piggy bank in your terminal

Build `ex5.py`, a piggy bank with four sub-commands that remembers its money between runs, using a JSON file ([chapter 21](../21-json-and-csv/notes.md)).

| Sub-command | Arguments | What it does |
|---|---|---|
| `deposit` | `amount` (like `12.50`) | Puts money in |
| `withdraw` | `amount` | Takes money out, if there's enough |
| `balance` | none | Shows the balance |
| `history` | none | Lists every deposit and withdrawal, then the balance |

The rules:

- Store everything in `piggy.json`, in the same folder as `ex5.py`. If the file doesn't exist yet, start with a balance of 0 and an empty history.
- Keep money as whole **cents** in an `int` (`12.50` becomes `1250`), like the shopping cart in [chapter 14](../14-project-shopping-cart/notes.md). Only turn it into dollars when you print.
- Every deposit and withdrawal is saved in the history with today's date ([chapter 22](../22-dates-and-times/notes.md)), its type, and its amount in cents.
- An amount of 0 or less prints `Error: the amount must be more than 0` to standard error and exits with code `1`.
- Withdrawing more than the balance prints `Error: you only have $15.50` (with the real balance) to standard error and exits with code `1`. Nothing is saved.

Here's a whole session, starting with no `piggy.json` (your dates will be different):

```
python ex5.py balance
Balance: $0.00

python ex5.py deposit 12.50
Deposited $12.50. Balance: $12.50

python ex5.py deposit 3
Deposited $3.00. Balance: $15.50

python ex5.py withdraw 20
Error: you only have $15.50

python ex5.py withdraw 5.25
Withdrew $5.25. Balance: $10.25

python ex5.py history
2026-10-09  deposit    $12.50
2026-10-09  deposit     $3.00
2026-10-09  withdraw    $5.25
Balance: $10.25
```

Afterwards, `piggy.json` looks like this:

```
{
  "balance_cents": 1025,
  "history": [
    {
      "date": "2026-10-09",
      "type": "deposit",
      "cents": 1250
    },
    {
      "date": "2026-10-09",
      "type": "deposit",
      "cents": 300
    },
    {
      "date": "2026-10-09",
      "type": "withdraw",
      "cents": 525
    }
  ]
}
```

And `python ex5.py -h` should list all four sub-commands with their help texts.

<details>
<summary>Hint 1</summary>

Start with the parser alone, and `print(args)` to check it, before you write any of the money code. The `cafe.py` example in the notes has the shape you need.

</details>

<details>
<summary>Hint 2</summary>

Write small functions: `load()` returns the piggy bank's data (or a fresh one if the file is missing), `save(bank)` writes it, and `money(cents)` turns cents into text like `$12.50`.

</details>

<details>
<summary>Hint 3</summary>

`12.50 * 100` might not come out as exactly `1250` (remember the float surprises from [chapter 05](../05-numbers-and-math/notes.md)). Wrap it in `round()` to get a whole number of cents.

</details>

<details>
<summary>Hint 4</summary>

To store the file next to `ex5.py` no matter which folder you run it from, build the path from `Path(__file__).parent`. `__file__` is the path of the script that's running.

</details>

<details>
<summary>Hint 5</summary>

In the history, the type is padded to 8 characters on the left, and the money to 7 characters on the right. f-string alignment from [chapter 06](../06-strings/notes.md) does both.

</details>

---

## Before you move on

In Exercise 5, what does your `money()` function expect to be given? An `int`? A `float`? A string? You know, because you wrote it. But in a month, or for someone else reading your code, it's a guessing game.

[Chapter 25](../25-type-hints/notes.md) shows you how to write the answer right into the code, so that VS Code can warn you before you pass the wrong thing.
