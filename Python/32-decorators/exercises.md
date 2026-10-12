# 32 Decorators: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.py`, `ex2.py`, and so on).
- Run each one with `python ex1.py` from a terminal opened in this folder.
- Put type hints on every function, and check each file with `python -m mypy ex1.py` (with your virtual environment active, like in [chapter 25](../25-type-hints/notes.md)). For decorators, `Func = Callable[..., Any]` from the notes is all you need.
- Put `@functools.wraps(func)` on every wrapper you write.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Cinema ticket rules

A cinema has different prices for different people. Start `ex1.py` with three pricing rules (all prices are in cents):

```python
from collections.abc import Callable


def adult(base_cents: int) -> int:
    return base_cents


def child(base_cents: int) -> int:
    return base_cents // 2


def senior(base_cents: int) -> int:
    return base_cents - 300
```

1. Write a function that **makes** a rule. It takes a fixed amount off, and returns a new function (a closure) that takes a base price and gives back the price minus that amount:

   ```python
   def make_fixed_off(cents_off: int) -> Callable[[int], int]:
   ```

2. Make a dictionary called `PRICE_RULES` that maps each kind of ticket to its rule: `"adult"`, `"child"` and `"senior"` to the three functions above, `"student"` to a rule from `make_fixed_off(200)`, and `"member"` to a rule from `make_fixed_off(450)`.
3. Write `ticket_price(kind: str, base_cents: int) -> int`. It looks up the rule in `PRICE_RULES` and uses it. **No `if` or `elif` allowed.**

Test code:

```python
print(ticket_price("child", 1200))
print(ticket_price("member", 1200))
for kind in PRICE_RULES:
    print(f"{kind:<8} ${ticket_price(kind, 1200) / 100:.2f}")
```

Expected output:

```
600
750
adult    $12.00
child    $6.00
senior   $9.00
student  $10.00
member   $7.50
```

Answer in a comment: `make_fixed_off` finished running long before `ticket_price("member", 1200)` was called. How does the member rule still know to take off 450?

<details>
<summary>Hint 1</summary>

Look at `make_multiplier` in the notes. `make_fixed_off` has the same shape: an inner `def` that uses `cents_off`, and `return` the inner function without brackets.

</details>

<details>
<summary>Hint 2</summary>

In the dictionary, write the function names without brackets: `"adult": adult`. The student rule is whatever `make_fixed_off(200)` gives back. (If you want to hint the dictionary itself, it's `dict[str, Callable[[int], int]]`.)

</details>

---

## Exercise 2 (Easy): Orders and ratings

A restaurant's app needs two flexible functions. Write them in `ex2.py`:

```python
def average_rating(*stars: int) -> float | None:
```

Takes any number of star ratings and returns their average, rounded to 1 decimal place, or `None` if there are no ratings at all.

```python
def make_order(table: int, *dishes: str, **notes: str) -> str:
```

Returns the text of a kitchen ticket: a first line like `Table 4: 2 dishes`, then one line per dish starting with `- `, then one line per note like `Note for pasta: no cheese`. The lines are joined with `"\n"`.

Test code:

```python
print(average_rating(5, 4, 4))
print(average_rating())
todays_ratings = [5, 4, 4, 3, 5, 2]
print(average_rating(*todays_ratings))

print(make_order(4, "soup", "pasta", pasta="no cheese"))
print()
dishes = ["salad", "curry", "rice"]
requests = {"curry": "extra hot", "salad": "no onions"}
print(make_order(7, *dishes, **requests))
print()
print(make_order(2))
```

Expected output:

```
4.3
None
3.8
Table 4: 2 dishes
- soup
- pasta
Note for pasta: no cheese

Table 7: 3 dishes
- salad
- curry
- rice
Note for curry: extra hot
Note for salad: no onions

Table 2: 0 dishes
```

Then try `print(average_rating(todays_ratings))`, without the star. What happens, and why? Write the answer in a comment.

<details>
<summary>Hint 1</summary>

Inside `average_rating`, `stars` is a tuple. An empty tuple is falsy ([chapter 08](../08-conditionals/notes.md)), so `if not stars:` catches the "no ratings" case before you divide by zero.

</details>

<details>
<summary>Hint 2</summary>

Inside `make_order`, `dishes` is a tuple and `notes` is a dictionary. Build a list of lines, loop over `dishes`, then over `notes.items()`, and finish with `"\n".join(lines)`.

</details>

---

## Exercise 3 (Medium): A bank's transaction log

A bank wants every transaction written to its log, including the ones that fail. Start `ex3.py` with these two functions, and don't change their bodies:

```python
def deposit(balance: int, amount: int) -> int:
    """Add amount to balance and return the new balance."""
    if amount <= 0:
        raise ValueError("deposit must be positive")
    return balance + amount


def withdraw(balance: int, amount: int) -> int:
    """Take amount out of balance and return the new balance."""
    if amount <= 0:
        raise ValueError("withdrawal must be positive")
    if amount > balance:
        raise ValueError("not enough money")
    return balance - amount
```

Write a decorator `log_transaction`, and put it on both functions. For every call, it prints one line that looks like the call itself:

- When the call works: `deposit(100, 50) -> 150`. Positional arguments are shown with `repr()`, and keyword arguments as `name=value`, like `withdraw(150, amount=30) -> 120`.
- When the call raises a `ValueError`: `withdraw(120, 500) raised ValueError: not enough money`. Then the same error must still reach the caller, so the caller can catch it.

Test code:

```python
balance = 100
balance = deposit(balance, 50)
balance = withdraw(balance, amount=30)
try:
    balance = withdraw(balance, 500)
except ValueError as e:
    print(f"Caught: {e}")
print(f"Balance: {balance}")
print(deposit.__name__)
print(deposit.__doc__)
```

Expected output:

```
deposit(100, 50) -> 150
withdraw(150, amount=30) -> 120
withdraw(120, 500) raised ValueError: not enough money
Caught: not enough money
Balance: 120
deposit
Add amount to balance and return the new balance.
```

<details>
<summary>Hint 1</summary>

Build the "call" text first. A list comprehension gives `[repr(arg) for arg in args]`, another gives `f"{name}={value!r}"` for each item in `kwargs.items()`. Join them all with `", "` and put `func.__name__` and brackets around them.

</details>

<details>
<summary>Hint 2</summary>

Put the call to `func(*args, **kwargs)` inside a `try`. In `except ValueError as e:`, print the message, then write `raise` on its own. A bare `raise` inside an `except` block sends the same exception on its way again. `type(e).__name__` gives you the text `ValueError`. (And if the last two lines print `wrapper` and `None`, you forgot `@functools.wraps(func)`.)

</details>

---

## Exercise 4 (Medium): The loyalty stamp card

A cafe gives a stamp for every purchase, and every fifth stamp earns a free one. Write a decorator `stamp_card` in `ex4.py` that counts how many times the decorated function has been called. After each call, it prints `  Stamp 3 on the buy_coffee card` (two spaces at the front, with the real count and function name), and after every fifth stamp it also prints `  Free one earned!`.

Each decorated function must get **its own** stamp card. Use these two functions:

```python
@stamp_card
def buy_coffee(name: str, size: str = "medium") -> None:
    print(f"A {size} coffee for {name}")


@stamp_card
def buy_cake(name: str) -> None:
    print(f"A slice of cake for {name}")
```

Test code:

```python
for customer in ["Maya", "Leo", "Zoe"]:
    buy_coffee(customer)
buy_cake("Sam")
buy_coffee("Aisha", size="large")
buy_coffee("Tom")
buy_cake("Priya")
print(buy_coffee.__name__)
```

Expected output:

```
A medium coffee for Maya
  Stamp 1 on the buy_coffee card
A medium coffee for Leo
  Stamp 2 on the buy_coffee card
A medium coffee for Zoe
  Stamp 3 on the buy_coffee card
A slice of cake for Sam
  Stamp 1 on the buy_cake card
A large coffee for Aisha
  Stamp 4 on the buy_coffee card
A medium coffee for Tom
  Stamp 5 on the buy_coffee card
  Free one earned!
A slice of cake for Priya
  Stamp 2 on the buy_cake card
buy_coffee
```

Answer in a comment: you wrote `stamp_card` once, so why do `buy_coffee` and `buy_cake` have separate counts?

<details>
<summary>Hint 1</summary>

The count lives in the decorator, outside the wrapper: `stamps = 0`, just above `def wrapper`. It's the `make_counter` idea from the notes. The wrapper changes `stamps`, so it needs `nonlocal stamps`, or you'll get the `UnboundLocalError` from the notes.

</details>

<details>
<summary>Hint 2</summary>

`stamps % 5 == 0` is true on every fifth stamp. And for the question: think about when the line `stamps = 0` runs, and how many times.

</details>

---

## Exercise 5 (Challenge): Members only at the gym

A gym has three membership levels, and some services need a higher level. Write a decorator **with an argument**, so you can say which level a function needs: `@requires(Level.GOLD)`. This uses an enum and a dataclass ([chapter 30](../30-dataclasses-and-enums/notes.md)) and your own exception ([chapter 18](../18-error-handling/notes.md)). Start `ex5.py` with:

```python
import functools
from collections.abc import Callable
from dataclasses import dataclass
from enum import Enum
from typing import Any

Func = Callable[..., Any]


class Level(Enum):
    BASIC = 1
    SILVER = 2
    GOLD = 3


@dataclass
class Member:
    name: str
    level: Level


class AccessDenied(Exception):
    pass


def log_calls(func: Func) -> Func:
    @functools.wraps(func)
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        print(f"[log] {func.__name__} called")
        return func(*args, **kwargs)

    return wrapper
```

Now write:

```python
def requires(level: Level) -> Callable[[Func], Func]:
```

The functions it decorates always take a `Member` as their **first** argument. Before calling the function, the wrapper checks the member's level. If it's lower than `level`, it raises `AccessDenied` with a message like `Leo is SILVER, but book_sauna needs GOLD`, and the function doesn't run. Otherwise it calls the function and returns its result.

Use it on these three functions:

```python
@log_calls
@requires(Level.SILVER)
def book_class(member: Member, class_name: str) -> str:
    """Book a place in a group class."""
    return f"{member.name} is booked into {class_name}"


@log_calls
@requires(Level.GOLD)
def book_sauna(member: Member, minutes: int = 30) -> str:
    """Book the sauna."""
    return f"{member.name} has the sauna for {minutes} minutes"


@requires(Level.BASIC)
def open_door(member: Member) -> str:
    return f"Welcome, {member.name}!"
```

Test code:

```python
maya = Member("Maya", Level.GOLD)
leo = Member("Leo", Level.SILVER)
tom = Member("Tom", Level.BASIC)

print(open_door(tom))
print(book_class(leo, "spin"))
print(book_sauna(maya, minutes=45))

for member in [leo, tom]:
    try:
        print(book_sauna(member))
    except AccessDenied as e:
        print(f"Sorry: {e}")

print(book_sauna.__name__)
print(book_class.__doc__)
```

Expected output:

```
Welcome, Tom!
[log] book_class called
Leo is booked into spin
[log] book_sauna called
Maya has the sauna for 45 minutes
[log] book_sauna called
Sorry: Leo is SILVER, but book_sauna needs GOLD
[log] book_sauna called
Sorry: Tom is BASIC, but book_sauna needs GOLD
book_sauna
Book a place in a group class.
```

And `python -m mypy ex5.py` says `Success: no issues found in 1 source file`.

Finally, swap the two decorator lines on `book_sauna`, so `@requires(Level.GOLD)` is on top, and run it again. Answer in a comment: what changed in the output, and why? Which order would a gym manager want, if the log is meant to show every attempt to book the sauna? Put the lines back the way they were when you're done.

<details>
<summary>Hint 1</summary>

It's the `retry` shape from the notes: `requires(level)` defines `decorator(func)`, which defines `wrapper`, and each layer returns the one inside it. `wrapper` can see both `level` and `func`, thanks to closures.

</details>

<details>
<summary>Hint 2</summary>

Give the wrapper the member as its own parameter, before the rest: `def wrapper(member: Member, *args: Any, **kwargs: Any) -> Any:`. Then call `func(member, *args, **kwargs)`. A plain `Enum` can't be compared with `<`, but its `.value` can: `member.level.value < level.value`. And `.name` gives you the text `GOLD`.

</details>

<details>
<summary>Hint 3</summary>

For the last question, remember that stacked decorators wrap from the bottom up, and the outermost wrapper runs first. If the outer one raises an error, does the inner one ever get to run?

</details>

---

## Before you move on

You can now read and write the `@` lines that frameworks are full of. You've also seen a pattern twice: something has to happen **before** the real work and something **after** it, like starting and stopping a timer.

Python has a second tool built for exactly that "before and after" shape, which you've been using since chapter 20: the `with` statement. In [chapter 33](../33-context-managers/notes.md), you'll see how `with` works inside, and write your own, including one made from a generator and a decorator.
