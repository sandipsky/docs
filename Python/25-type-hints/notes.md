# 25 Type Hints

## What is it?

A **type hint** is a small note in your code that says what type a value should be. `age: int = 25` says "`age` should hold an `int`". `def greet(name: str) -> str:` says "`greet` takes a string and gives back a string".

Python itself ignores these notes when it runs your code. They're there for you, for anyone reading your code, and for tools that check your code before you run it.

## Why does it matter?

Look at this function from a cafe's till:

```python
def total_with_tip(total, percent):
    return total + total * percent / 100


print(total_with_tip(45.50, 10))
print(total_with_tip("45.50", 10))
```

The first call prints `50.05`. The second one crashes:

```
TypeError: unsupported operand type(s) for /: 'str' and 'int'
```

Remember from [chapter 07](../07-input-and-output/notes.md) that `input()` always gives you a string? It's very easy to pass `"45.50"` by accident. Two things are wrong here:

1. **You find out too late.** The crash only happens when that exact line runs. If it's hidden in a rarely used part of the program, that might be weeks later, in front of a customer.
2. **The function doesn't say what it wants.** Is `total` a number or text? Is `percent` `10` or `0.1`? You have to read the body, or guess.

Here's the same function with hints:

```python
def total_with_tip(total: float, percent: int) -> float:
    return total + total * percent / 100
```

Now the first line tells you everything: a `float` and an `int` go in, a `float` comes out. And a checking tool can point at `total_with_tip("45.50", 10)` and say "that's a string, but this wants a float" before you ever run the program:

```
why.py:6: error: Argument 1 to "total_with_tip" has incompatible type "str"; expected "float"  [arg-type]
```

## Real-world example

Think about the recycling bins at a train station. Each bin has a label: "Paper", "Glass", "Plastic". The label doesn't physically stop you from throwing a bottle into the paper bin. But everyone who reads it knows what goes where. And an inspector who checks the bins before the truck comes can spot the bottle in the wrong bin and fix it.

| Recycling bins | Type hints |
|---|---|
| A bin | A variable, a parameter, or a function's return value |
| The label on the bin ("Glass") | A hint, like `name: str` |
| Nothing physically stops a bottle going in the paper bin | Python ignores hints when it runs your code |
| The inspector who checks before the truck comes | VS Code and **mypy**, which check your code before you run it |
| A label that says "Glass, or leave empty" | A hint that says "a string, or nothing at all" (you'll meet it below) |

## How it works

### Hints on variables

Put a colon and the type after the variable's name:

```python
age: int = 25
name: str = "Sandip"
price: float = 4.5
is_member: bool = True
```

Read `age: int = 25` aloud as "age, which is an int, equals 25".

You won't write hints on most variables, though. When you write `age = 25`, the checking tools can already see that it's an `int`. Hints on variables are most useful when the starting value doesn't tell the whole story, which you'll see with `None` and empty lists below.

### Hints on functions

Functions are where hints really pay off. Each parameter gets a hint after its name, and the return value gets one after an arrow `->` before the colon:

```python
def greet(name: str) -> str:
    return f"Hello, {name}!"
```

Read it aloud: "greet takes a `name`, which is a `str`, and returns a `str`."

| Piece | Means |
|---|---|
| `name: str` | The `name` parameter should be a string. |
| `-> str` | The function returns a string. |

The hints sit in the first line of the function, so anyone using it can see what it needs without reading the body. VS Code shows them too: hover over `greet` anywhere in your code, and a little box pops up with `(function) def greet(name: str) -> str`.

### Python doesn't check them

This surprises most people. Hints are notes, not rules. Python reads them, stores them, and then carries on as if they weren't there:

```python
def greet(name: str) -> str:
    return f"Hello, {name}!"


print(greet("Sandip"))  # prints: Hello, Sandip!
print(greet(5))  # prints: Hello, 5!
```

`5` isn't a string, but the program runs anyway, because an f-string can include an `int` just fine. Sometimes a wrong type doesn't crash at all and quietly does something strange instead:

```python
def double(n: int) -> int:
    return n * 2


print(double(21))  # prints: 42
print(double("ha"))  # prints: haha
```

So who reads the hints? Tools that check your code without running it. You'll set two of them up later in this chapter: Pylance in VS Code, and a program called mypy.

> **Tip:** If you did the [TypeScript course](../../TypeScript/README.md), this will feel familiar. Type hints are Python's cousin of TypeScript's types, with one big difference: TypeScript refuses to build your code when the types are wrong, but Python runs it anyway. Only the checking tools complain.

### `-> None`: functions that don't return anything

Some functions do a job, like printing, and don't give anything back. In [chapter 10](../10-functions/notes.md), you saw that such a function returns `None` by itself. Say so with `-> None`:

```python
def print_receipt(total: float) -> None:
    print(f"Total: ${total:.2f}")
```

That's useful, because it lets the checker catch a classic mix-up: using the result of a function that only prints.

```python
result = print_receipt(4.5)
```

mypy says:

```
none_return.py:5: error: "print_receipt" does not return a value (it only ever returns None)  [func-returns-value]
```

### Hints with default values

A parameter with a default value gets its hint first, then the default. When there's a hint, PEP 8 puts spaces around the `=`:

```python
def make_order(drink: str, size: str = "medium", sugar: int = 0) -> str:
    return f"{size} {drink}, {sugar} sugar"


print(make_order("latte"))  # prints: medium latte, 0 sugar
print(make_order("tea", "large", sugar=2))  # prints: large tea, 2 sugar
```

(Without a hint, it's still `size="medium"` with no spaces, like in chapter 10.)

### Lists, dictionaries, tuples and sets

For a collection, you can say what's *inside* it, in square brackets:

```python
scores: list[int] = [72, 85, 90]
prices: dict[str, float] = {"latte": 3.5, "tea": 2.25}
point: tuple[int, int] = (3, 4)
tags: set[str] = {"python", "beginner"}
```

| Hint | Means |
|---|---|
| `list[int]` | A list of `int`s |
| `dict[str, float]` | A dictionary whose keys are `str` and whose values are `float` |
| `tuple[int, int]` | A tuple of exactly two `int`s |
| `set[str]` | A set of `str`s |

They can go inside each other too. The "table of records" pattern from [chapter 13](../13-dictionaries/notes.md), a list of dictionaries with string keys and values, is `list[dict[str, str]]`.

Now the checker can spot the wrong thing going *into* a collection:

```python
scores.append("ninety")
prices["cake"] = "4.00"
```

```
collections_demo.py:6: error: Argument 1 to "append" of "list" has incompatible type "str"; expected "int"  [arg-type]
collections_demo.py:7: error: Incompatible types in assignment (expression has type "str", target has type "float")  [assignment]
```

> **Watch out:** Writing `list[int]` with the built-in `list` needs Python 3.9 or newer. In older code, you'll see `List[int]` and `Dict[str, float]` with capital letters, imported from the `typing` module. They mean the same thing. Use the lowercase ones in your own code.

### "Maybe nothing": `int | None`

Lots of functions give back a real value most of the time, and `None` when there's nothing to give. Like a cafe looking up a price:

```python
PRICES: dict[str, float] = {"latte": 3.5, "tea": 2.25}


def find_price(item: str) -> float | None:
    """Return the price of an item, or None if the cafe doesn't sell it."""
    return PRICES.get(item)
```

`float | None` reads "a `float`, or `None`". The `|` means "or" here. This spelling needs Python 3.10 or newer.

In older code you'll see the same idea written as `Optional[float]`, with `Optional` imported from the `typing` module. Here's the same function, the older way:

```python
from typing import Optional


def find_price(item: str) -> Optional[float]:
    """Return the price of an item, or None if the cafe doesn't sell it."""
    return PRICES.get(item)
```

`Optional[float]` means exactly the same as `float | None`. ("Optional" is a slightly confusing name: it doesn't mean the argument is optional, it means the value might be `None`.) Use `str | None` in new code.

The `None` hint is also where hints on variables are worth writing. A variable that starts as `None` and gets a real value later needs to tell the checker what it will hold:

```python
nickname: str | None = None
```

### Type aliases: giving a long hint a short name

The shopping cart from [chapter 14](../14-project-shopping-cart/notes.md) is a dictionary of product IDs to quantities: `dict[int, int]`. Writing that in every function is long, and it doesn't say what the dictionary *means*. A **type alias** gives the hint a name, using a normal assignment:

```python
Cart = dict[int, int]  # product ID -> quantity


def add_to_cart(cart: Cart, product_id: int, quantity: int = 1) -> None:
    cart[product_id] = cart.get(product_id, 0) + quantity


def count_items(cart: Cart) -> int:
    return sum(cart.values())


my_cart: Cart = {}
add_to_cart(my_cart, 3)
add_to_cart(my_cart, 1, 4)
add_to_cart(my_cart, 3)
print(my_cart)  # prints: {3: 2, 1: 4}
print(count_items(my_cart))  # prints: 6
```

Aliases are written in `CapitalWords`, like `Cart` or `Book`, so they stand out from ordinary variables. If the cart ever changes shape, you only change one line.

> **Tip:** Python 3.12 added a special statement for this: `type Cart = dict[int, int]`. It does the same job. You'll see both, and the plain `Cart = ...` version works on every Python 3.

### Checking your hints in VS Code

The Python extension for VS Code includes **Pylance**, the part that colours your code, suggests names as you type, and underlines mistakes. It can check your hints too, but out of the box that's switched off. To switch it on:

1. Open the settings with `Ctrl+,` (Control and comma).
2. Search for **type checking mode**.
3. Find **Python > Analysis: Type Checking Mode** and change it from `off` to `basic`.

(If you prefer editing `settings.json` directly, the line is `"python.analysis.typeCheckingMode": "basic"`.)

Now go back to the file with `greet(5)` in it. The `5` gets a red squiggly underline. Hover over it, and Pylance explains, with a message something like:

```
Argument of type "Literal[5]" cannot be assigned to parameter "name" of type "str" in function "greet"
```

`Literal[5]` is Pylance's way of saying "the exact value `5`, which is an `int`". The exact wording changes a little between Pylance versions, but the idea is always the same: what you passed, and what the function wanted. Press `Ctrl+Shift+M` to open the **Problems** panel, which lists every problem in your open files.

There are stricter modes too (`standard` and `strict`). `basic` is the friendliest place to start.

### Checking your hints with mypy

**mypy** (say "my-pie") is the original type checker for Python. It's a separate program that reads your files, checks every hint, and prints a report. It's handy because it works the same everywhere: in any editor, on any computer, and in automatic checks that run before code is shared.

mypy is a package on PyPI, so install it the way you learned in [chapter 23](../23-pip-and-virtual-environments/notes.md). In your project folder, make and activate a virtual environment if you don't have one yet, then install it:

```
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install mypy
```

(That's the PowerShell way to activate. In Command Prompt or on a Mac, use the activate command for your terminal from chapter 23.)

Then point it at a file:

```
python -m mypy greet.py
```

For the `greet` example from earlier, you'll see:

```
greet.py:6: error: Argument 1 to "greet" has incompatible type "int"; expected "str"  [arg-type]
Found 1 error in 1 file (checked 1 source file)
```

Each problem is one line, in the same shape:

| Part | Means |
|---|---|
| `greet.py:6` | The file, and the line number |
| `error:` | How serious it is (sometimes you'll see `note:` lines with extra advice) |
| `Argument 1 to "greet" has ...` | What's wrong, in words |
| `[arg-type]` | The name of the rule that was broken, in case you want to look it up |

Fix it (change `greet(5)` to `greet("Maya")`), run mypy again, and you get the line you're hoping for:

```
Success: no issues found in 1 source file
```

You can also check every file in the folder at once with `python -m mypy .` (the dot means "this folder").

> **Tip:** mypy keeps notes about your files in a folder called `.mypy_cache`, so the next check is faster. You can ignore it, and add `.mypy_cache/` to your `.gitignore` next to `.venv/`.

### The bug hints catch best: forgetting `None`

Remember `find_price`? It returns `None` for things the cafe doesn't sell. Now look at this:

```python
PRICES: dict[str, float] = {"latte": 3.5, "tea": 2.25}


def find_price(item: str) -> float | None:
    """Return the price of an item, or None if the cafe doesn't sell it."""
    return PRICES.get(item)


price = find_price("mocha")
print(price * 2)
```

Run it, and it crashes:

```
TypeError: unsupported operand type(s) for *: 'NoneType' and 'int'
```

That's one of the most common bugs in all of programming: forgetting that something might be `None`. Without hints, you'd only find it on the day a customer orders a mocha. mypy finds it straight away, before the program runs:

```
cafe.py:10: error: Unsupported operand types for * ("None" and "int")  [operator]
cafe.py:10: note: Left operand is of type "float | None"
Found 1 error in 1 file (checked 1 source file)
```

The fix is to deal with the `None` case first:

```python
price = find_price("mocha")
if price is None:
    print("Sorry, we don't sell that.")
else:
    print(f"Two of those: ${price * 2:.2f}")
```

```
Sorry, we don't sell that.
```

And mypy is happy: `Success: no issues found in 1 source file`. It's clever enough to follow your `if`: inside the `else`, `price` can't be `None` any more, so it must be a `float`.

### You don't have to hint everything

Hints are optional, and you can add them a bit at a time. mypy only checks the inside of functions that have at least one hint. Functions with no hints at all are left alone:

```python
def add_tax(price):
    return price * "1.08"


def add_tip(price: float) -> float:
    return price * "1.10"
```

Both functions have the same bug, but mypy only reports the one it was told about:

```
untyped.py:6: error: Unsupported operand types for * ("float" and "str")  [operator]
Found 1 error in 1 file (checked 1 source file)
```

That makes it easy to start: add hints to your most important functions first, and let the checker help more as you add more.

A good rule of thumb for your own code from now on: **put hints on every function's parameters and return value.** Leave out hints on variables unless the checker asks for one, or the variable starts as `None` or an empty collection.

## Common mistakes

**1. Thinking hints protect you while the program runs**

```python
def double(n: int) -> int:
    return n * 2


print(double("ha"))  # prints: haha
```

The hint says `int`, but Python ran it anyway and printed `haha`. Hints don't check anything by themselves. If you want the protection, run mypy (or switch on Pylance's checking) and read what it says. And for values that come from outside your program, like `input()`, command-line arguments or files, you still need real checks with `try`/`except` from [chapter 18](../18-error-handling/notes.md).

**2. Forgetting that a function can return `None`**

```python
BOOKS = {"B1": "Dune", "B2": "Emma"}


def find_title(book_id: str) -> str:
    if book_id in BOOKS:
        return BOOKS[book_id]
    return None
```

```
findbook.py:7: error: Incompatible return value type (got "None", expected "str")  [return-value]
```

The hint promises a `str` every time, but the last line breaks the promise. Fix the hint so it tells the truth: `-> str | None`. Then mypy will make sure everyone who calls `find_title` handles the `None` case.

**3. A hint that doesn't match what the code does**

```python
def average(scores: list[int]) -> int:
    return sum(scores) / len(scores)
```

```
average.py:2: error: Incompatible return value type (got "float", expected "int")  [return-value]
```

Remember from [chapter 04](../04-operators/notes.md) that `/` always gives a `float`? The average of `[72, 85, 90]` is `82.33333333333333`, not an `int`. Here the code is right and the hint is wrong: change it to `-> float`. A wrong hint is worse than no hint, because people trust it.

**4. Using brackets instead of `list[...]`**

```python
def total(prices: [float]) -> float:
    return sum(prices)
```

```
brackets.py:1: error: Bracketed expression "[...]" is not valid as a type  [valid-type]
brackets.py:1: note: Did you mean "List[...]"?
```

`[float]` is a list *containing* the `float` type, not a type. Write `list[float]`. (mypy suggests the older `List[...]` spelling, but the lowercase `list[float]` is the modern one.)

**5. Using a type alias before you've made it**

```python
def add_item(cart: Cart, product_id: int) -> None:
    cart[product_id] = cart.get(product_id, 0) + 1


Cart = dict[int, int]
```

In Python 3.13, this crashes as soon as Python reaches the `def` line:

```
NameError: name 'Cart' is not defined
```

Python 3.13 works out what each hint means when it creates the function, and at that moment `Cart` doesn't exist yet. (Strangely, mypy doesn't complain, because it reads the whole file before checking.) Put your aliases at the top of the file, just after the imports. Python 3.14 changed how hints are read, so there this mistake no longer crashes, but aliases at the top are still the clearest place for them.

**6. Running mypy where it isn't installed**

```
python -m mypy greet.py
```

```
C:\Users\Sandip\AppData\Local\Programs\Python\Python313\python.exe: No module named mypy
```

The path shows that this was your global Python, not the one in `.venv`. You installed mypy into the virtual environment, so activate it first (look for `(.venv)` in the prompt), then try again.

## Quick recap

- A type hint says what type a value should be: `age: int = 25`, and `def greet(name: str) -> str:` for a function's parameters and return value.
- Python ignores hints when it runs your code. Tools like Pylance (in VS Code, with Type Checking Mode set to `basic`) and mypy (`python -m mypy file.py`) read them and catch mistakes before you run anything.
- Use `-> None` for functions that return nothing, and put the hint before the default: `size: str = "medium"`.
- Say what's inside collections: `list[int]`, `dict[str, float]`, `tuple[int, int]`, `set[str]`.
- `float | None` means "a float, or nothing". `Optional[float]` is the older spelling. Check for `None` before you use the value.
- A type alias gives a long hint a short name: `Cart = dict[int, int]`.
- From now on, put hints on every function you write.

---

**Next:** try the [exercises](exercises.md), then move on to [26 Project: To-Do List App](../26-project-todo-app/notes.md).
