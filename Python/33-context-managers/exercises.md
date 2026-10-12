# 33 Context Managers: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.py`, `ex2.py`, and so on).
- Run each one with `python ex1.py` from a terminal opened in this folder.
- Put type hints on every function and method, and check each file with `python -m mypy ex1.py` (with your virtual environment active, as in [chapter 25](../25-type-hints/notes.md)). The goal is `Success: no issues found in 1 source file`.
- For the long first line of `__exit__`, it's fine to copy it from the notes. It's the same every time.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Lights down, lights up

A cinema dims the lights when a film starts, and brings them back up when it ends. The lights must come back up even if the projector breaks halfway through, or people will be stumbling around in the dark.

Write a class called `Screening`, which works as a context manager:

- `Screening("Paddington")` stores the film's name in `self.film`.
- When the `with` block starts, it prints `Lights down for <film>`, and `as` gives you the `Screening` object.
- When the block ends normally, it prints `The film ended. Lights up.`
- When the block ends with an error, it prints `The film stopped early (<the error message>). Lights up.`, and the error carries on as normal.

Test code:

```python
with Screening("Paddington") as show:
    print(f"Now showing: {show.film}")

try:
    with Screening("Dune") as show:
        print(f"Now showing: {show.film}")
        raise RuntimeError("the projector broke")
except RuntimeError as e:
    print(f"Refunds for everyone: {e}")
```

Expected output:

```
Lights down for Paddington
Now showing: Paddington
The film ended. Lights up.
Lights down for Dune
Now showing: Dune
The film stopped early (the projector broke). Lights up.
Refunds for everyone: the projector broke
```

<details>
<summary>Hint 1</summary>

You need three methods: `__init__`, `__enter__` and `__exit__`. For `show.film` to work, think about what `__enter__` must return.

</details>

<details>
<summary>Hint 2</summary>

Look at the table under "The three parameters of `__exit__`" in the notes. Which parameter is `None` when nothing went wrong? Which one holds the message "the projector broke"?

</details>

---

## Exercise 2 (Easy): Who's in the gym?

A gym's door counts how many people are inside. Everyone who checks in must be counted out again, even if their workout ends badly.

The count lives in a dictionary, `gym = {"inside": 0}`. Write a `@contextmanager` generator function called `visit(gym, name)` that:

- adds 1 to `gym["inside"]`, then prints `<name> checks in (<count> inside)`,
- lets the `with` block run,
- takes 1 away again, then prints `<name> checks out (<count> inside)`, even when the block raised an error.

Test code:

```python
gym = {"inside": 0}

with visit(gym, "Sandip"):
    print("Sandip lifts weights")
    with visit(gym, "Aisha"):
        print("Aisha runs on the treadmill")

try:
    with visit(gym, "Tom"):
        raise ValueError("Tom pulled a muscle")
except ValueError as e:
    print(f"Ouch: {e}")

print(f"At closing time: {gym['inside']} inside")
```

Expected output:

```
Sandip checks in (1 inside)
Sandip lifts weights
Aisha checks in (2 inside)
Aisha runs on the treadmill
Aisha checks out (1 inside)
Sandip checks out (0 inside)
Tom checks in (1 inside)
Tom checks out (0 inside)
Ouch: Tom pulled a muscle
At closing time: 0 inside
```

When it works, try an experiment. Take the `try` and `finally` out of `visit` (keep the lines, just remove the wrapping). **Before you run it**, write down what you think the last line will say. Then run it, and answer in a comment: why is this kind of bug so hard to notice in a real program?

<details>
<summary>Hint 1</summary>

The shape is the same as `temporary_setting` in the notes: change something, `yield`, change it back. The hint for a generator that yields nothing is `Iterator[None]`.

</details>

<details>
<summary>Hint 2</summary>

For the experiment: look at common mistake 2 in the notes. Did any error message appear? Is anything about the output obviously wrong, unless you happen to check the count?

</details>

---

## Exercise 3 (Medium): A practice folder

Before you let a program loose on real files, it's smart to practise in a folder you don't care about. Write `ex3.py` so it does all of this inside a temporary folder that cleans itself up:

1. Remember where you started, with `start = Path.cwd()`.
2. Make a temporary folder with `tempfile.TemporaryDirectory()`, and step into it with `chdir`. Use **one** `with` statement for both.
3. Inside, using plain relative names (no folder in the path), create three files:
   - `breakfast.txt` containing `Pancakes` and `Porridge`, one per line,
   - `lunch.txt` containing `Soup` and `Sandwich`,
   - `old_menu.txt` containing `Jelly`.
4. Print the sorted names of the `.txt` files in the current folder. (Write a small helper function `txt_files() -> list[str]` for this, since you'll need it twice.)
5. Read `breakfast.txt` back, and print its dishes on one line, separated by commas.
6. Delete `old_menu.txt` **twice** in a loop, using `suppress`, so the second try doesn't crash. Print a line after each try.
7. Print the file names again.
8. After the `with` block, print whether you're back where you started, and whether the temporary folder still exists.

Expected output:

```
Files: ['breakfast.txt', 'lunch.txt', 'old_menu.txt']
Breakfast: Pancakes, Porridge
Delete attempt 1 done
Delete attempt 2 done
Files: ['breakfast.txt', 'lunch.txt']
Back where we started: True
Temporary folder still there: False
```

**Rule:** use `suppress` for step 6, not `missing_ok=True`. (This time, the point is to practise `suppress`.)

<details>
<summary>Hint 1</summary>

Several context managers can share one `with`, separated by a comma. The second one can use the name the first one gave you after `as`: `with A() as folder, B(folder):`.

</details>

<details>
<summary>Hint 2</summary>

`Path().glob("*.txt")` looks in the current folder. You need just the `.name` of each path, sorted. A list comprehension inside `sorted(...)` does it.

</details>

<details>
<summary>Hint 3</summary>

If Windows gives you `PermissionError: [WinError 32] The process cannot access the file because it is being used by another process`, Python tried to delete the temporary folder while your program was still standing inside it. Think about the order in which several context managers exit, and which one must exit first.

</details>

---

## Exercise 4 (Medium): All or nothing

Sandip is paying back three friends after a trip. Either **every** payment goes through, or **none** of them should. Paying Maya and then finding there's not enough money left for Zoe would leave the accounts in a mess.

Start with the simple `BankAccount` class from [chapter 27](../27-classes-and-objects/notes.md) (the first version, where `balance` is a plain attribute, so your code can put it back), and these two functions:

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


def pay_friends(payer: BankAccount, payments: list[tuple[BankAccount, int]]) -> None:
    """Pay several friends at once: either every payment happens, or none do."""
    friends = [friend for friend, amount in payments]
    with Transaction([payer] + friends):
        for friend, amount in payments:
            payer.withdraw(amount)
            friend.deposit(amount)


def show(accounts: list[BankAccount]) -> None:
    print(", ".join([f"{account.owner}: {account.balance}" for account in accounts]))
```

Your job is to write the `Transaction` class (put it between `BankAccount` and `pay_friends`):

- `Transaction(accounts)` takes a list of accounts.
- When the `with` block starts, it remembers every account's balance.
- When the block ends normally, it prints `Transaction complete.`
- When the block ends with an error, it puts every balance back to what it was, prints `Transaction cancelled (<the error message>). Balances restored.`, and lets the error carry on, so the caller still finds out.

Test code:

```python
sandip = BankAccount("Sandip", 100)
maya = BankAccount("Maya")
leo = BankAccount("Leo")
zoe = BankAccount("Zoe")
everyone = [sandip, maya, leo, zoe]

pay_friends(sandip, [(maya, 30), (leo, 40)])
show(everyone)

try:
    pay_friends(sandip, [(maya, 10), (zoe, 50)])
except ValueError as e:
    print(f"Payment failed: {e}")
show(everyone)
```

Expected output:

```
Transaction complete.
Sandip: 30, Maya: 30, Leo: 40, Zoe: 0
Transaction cancelled (not enough money). Balances restored.
Payment failed: not enough money
Sandip: 30, Maya: 30, Leo: 40, Zoe: 0
```

To see why this matters, try the second payment without the protection: change `with Transaction([payer] + friends):` to `if True:` for a moment. The last line becomes `Sandip: 20, Maya: 40, Leo: 40, Zoe: 0`. Maya got paid twice, and Zoe got nothing. Put the `with` back.

Databases do exactly this, and call it a **transaction**: you'll meet the real thing in [chapter 42](../42-databases/notes.md).

<details>
<summary>Hint 1</summary>

In `__enter__`, save the balances in a list attribute, like `self.saved`, in the same order as `self.accounts`. Give it a hint in `__init__`: `self.saved: list[int] = []`.

</details>

<details>
<summary>Hint 2</summary>

To put them back, walk through both lists side by side with `zip()` ([chapter 12](../12-tuples-and-sets/notes.md)).

</details>

<details>
<summary>Hint 3</summary>

To let the error carry on, `__exit__` should return nothing (hint it `-> None`). If you want to leave the method early after the happy case, a bare `return` is fine.

</details>

---

## Exercise 5 (Challenge): Edit a file, safely

Lots of programs follow the same three steps you used in chapter 26: load a file, change the data, save it back. Let's turn those three steps into one context manager, so a pantry tracker can be written like this:

```python
with editing(PANTRY) as pantry:
    pantry["eggs"] = 12
```

Write `ex5.py` with three functions:

- `safe_write(path)`: the safe-save context manager from the notes. Copy it.
- `load_counts(path) -> dict[str, int]`: loads a dictionary from a JSON file, or returns an empty dictionary if the file doesn't exist yet ([chapter 21](../21-json-and-csv/notes.md)).
- `editing(path)`: a `@contextmanager` generator that loads the data, hands it to the `with` block, and then saves it with `safe_write`, but **only if the block finished without an error**. Save it with plain `json.dump(data, f)` (no `indent`), so the file is a single line.

Test code:

```python
PANTRY = Path("pantry.json")
PANTRY.unlink(missing_ok=True)  # start fresh every run

with editing(PANTRY) as pantry:
    pantry["eggs"] = 12
    pantry["rice"] = 2
print(PANTRY.read_text(encoding="utf-8"))

with editing(PANTRY) as pantry:
    pantry["eggs"] -= 3
print(PANTRY.read_text(encoding="utf-8"))

try:
    with editing(PANTRY) as pantry:
        pantry["eggs"] -= 2
        pantry["flour"] -= 1  # there's no flour in the pantry!
except KeyError as e:
    print(f"Edit cancelled, missing item: {e}")
print(PANTRY.read_text(encoding="utf-8"))
print(f"Leftover temporary file: {PANTRY.with_suffix('.tmp').exists()}")
```

Expected output:

```
{"eggs": 12, "rice": 2}
{"eggs": 9, "rice": 2}
Edit cancelled, missing item: 'flour'
{"eggs": 9, "rice": 2}
Leftover temporary file: False
```

Look at the third edit. The line `pantry["eggs"] -= 2` really did run, so the dictionary in memory said 7 eggs. But the file still says 9, because the edit as a whole failed.

Finally, answer in a comment: every `@contextmanager` in the notes had a `try`/`finally` around its `yield`. Does `editing` need one? What would the file say after the third edit if you put the saving code inside a `finally`?

<details>
<summary>Hint 1</summary>

The hint for the value `editing` hands out is a dictionary, so the generator is `Iterator[dict[str, int]]`. The value after `yield` is what `as pantry` receives.

</details>

<details>
<summary>Hint 2</summary>

When the block raises an error, it's raised at your `yield` line. Any code after the `yield` that isn't in a `finally` is skipped. Here, is skipping the save a problem, or exactly what you want?

</details>

<details>
<summary>Hint 3</summary>

For the question, try it: wrap the `yield` in `try`, move the saving code into `finally`, run the test again, and look at the fourth line of output. Then change it back.

</details>

---

## Before you move on

You now know what `with` does behind the scenes, and you can write your own context managers, as classes or with `@contextmanager`. Whenever you see a pair of jobs that must always go together, like start and stop, or change and change back, think "context manager".

You've also seen functions handed to other functions: `@contextmanager` takes your generator function and gives back something new. In [chapter 34](../34-functional-tools/notes.md), you'll pass functions around even more, to tell `sorted()` how to sort, to transform and filter lists, and to make a slow function remember its answers.
