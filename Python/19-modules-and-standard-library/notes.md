# 19 Modules and the Standard Library

## What is it?

A **module** is simply a file of Python code. When you write `import math`, Python finds a file of ready-made code called `math`, runs it, and lets you use everything inside it.

The **standard library** is the big collection of modules that comes with Python when you install it. Nothing extra to download: it's already on your computer.

## Why does it matter?

There are two problems modules solve.

**Problem 1: your programs are getting long.** The shopping cart in [chapter 14](../14-project-shopping-cart/notes.md) was one big file. As programs grow, one file becomes hard to scroll through, and useful functions like `format_money()` get trapped inside it. If you want the same function in your next program, you'd have to copy and paste it. Modules let you split code into several files, and reuse a file in as many programs as you like.

**Problem 2: you keep writing things that already exist.** Say a cafe asks customers to vote for their favorite drink. With what you know from [chapter 13](../13-dictionaries/notes.md), you'd count the votes like this:

```python
votes = ["tea", "coffee", "tea", "juice", "tea", "coffee"]

counts = {}
for vote in votes:
    counts[vote] = counts.get(vote, 0) + 1

print(counts)  # prints: {'tea': 3, 'coffee': 2, 'juice': 1}
```

That works, and it was good practice. But Python already ships with a tool that does exactly this:

```python
from collections import Counter

votes = ["tea", "coffee", "tea", "juice", "tea", "coffee"]
print(Counter(votes))  # prints: Counter({'tea': 3, 'coffee': 2, 'juice': 1})
```

One line, already tested by millions of people. Python is often described as **"batteries included"**: it comes with tools for maths, random numbers, dates, files, counting, statistics and much more. Knowing what's in the box saves you hours.

## Real-world example

Think of a workshop.

You could make every tool yourself: forge your own hammer, carve your own ruler. Or you could open the toolboxes that came with the workshop and get straight to building. And when you invent a handy tool of your own, you put it in your own labeled box so you can find it next time.

| In the workshop | In Python |
|---|---|
| A toolbox | A module (one `.py` file) |
| The toolboxes that came with the workshop | The standard library |
| Carrying the whole toolbox to your bench | `import math` |
| Taking out just the hammer | `from math import sqrt` |
| Putting a shorter name sticker on the box | `import random as rnd` |
| A shelf holding several toolboxes | A package (a folder of modules) |
| Your own box of homemade tools | Your own module, like `helpers.py` |
| Tools you buy from a shop | Third-party packages ([chapter 23](../23-pip-and-virtual-environments/notes.md)) |

## How it works

### You've already used a module

Back in [chapter 05](../05-numbers-and-math/notes.md) you wrote this:

```python
import math

print(math.sqrt(16))   # prints: 4.0
print(math.pi)         # prints: 3.141592653589793
print(math.floor(3.7)) # prints: 3
```

`import math` loads the `math` module. After that, `math` is a name in your program, just like a variable. The dot means "look inside": `math.sqrt` is "the `sqrt` function inside the `math` module".

Everything in this chapter builds on that one line.

### Three ways to import

**1. Import the whole module.** You use the module's name in front of everything:

```python
import math

print(math.sqrt(25))  # prints: 5.0
```

**2. Import just the names you need**, with `from ... import ...`. Now you can use them without the module name in front:

```python
from math import sqrt, pi

print(sqrt(16))  # prints: 4.0
print(pi)        # prints: 3.141592653589793
```

You can list as many names as you like, separated by commas.

**3. Import a module under a shorter name**, with `as`. The new name is called an **alias** (a nickname):

```python
import random as rnd

print(rnd.randint(1, 6))  # prints a random number from 1 to 6
```

You'll see this a lot with long module names. For example, `import statistics as stats` lets you write `stats.mean(...)`.

| You write | You then use | Good for |
|---|---|---|
| `import math` | `math.sqrt(16)` | Most of the time. It's clear where `sqrt` came from. |
| `from math import sqrt` | `sqrt(16)` | When you use one or two names a lot. |
| `import random as rnd` | `rnd.randint(1, 6)` | Long module names you type often. |

> **Tip:** When in doubt, use plain `import math`. Six months from now, `math.sqrt` tells you instantly where that function lives. A bare `sqrt` makes you scroll to the top to find out.

Imports go at the **top of the file**, before any other code. That way anyone reading your program can see at a glance which toolboxes it uses. (PEP 8, Python's style guide from [chapter 02](../02-variables/notes.md), asks for this too.)

### Why `from math import *` is frowned on

There's a fourth way you'll see online: the `*` means "import every name from the module".

```python
from math import *
```

It looks convenient, but it dumps dozens of names into your program without telling you which ones. Some of them can quietly replace names you were already using. Python has a built-in `pow()` function, and `math` has its own `pow()` too. Watch what happens:

```python
print(pow(2, 3))  # prints: 8

from math import *

print(pow(2, 3))  # prints: 8.0
```

Same line, different answer! The `math` version of `pow` replaced the built-in one, and nothing warned you. In a bigger program, bugs like this are very hard to track down. So the rule is simple: **don't use `import *`**. Name what you import.

### Writing your own module

Here's the best news in this chapter: **any `.py` file you write is already a module.** There's nothing special to add. Let's split a small cafe program into two files.

**Step 1: Make a folder** called `cafe` with two files in it:

```
cafe/
├── helpers.py
└── main.py
```

**Step 2: Put some reusable tools in `helpers.py`:**

```python
"""Small helpers for the cafe program."""

TAX_RATE = 0.13


def format_money(cents):
    """Turn a number of cents into text like $12.50."""
    return f"${cents / 100:.2f}"


def add_tax(cents):
    """Return the price with tax added, in whole cents."""
    return round(cents * (1 + TAX_RATE))
```

(Money is in whole cents to avoid float surprises, as in [chapter 05](../05-numbers-and-math/notes.md).)

**Step 3: Use them from `main.py`:**

```python
import helpers

price = 1000
total = helpers.add_tax(price)
print(helpers.format_money(total))  # prints: $11.30
print(helpers.TAX_RATE)             # prints: 0.13
```

**Step 4: Run the main file.** Open a terminal in the `cafe` folder and run:

```
python main.py
```

You'll see:

```
$11.30
0.13
```

A few things to notice:

- The module's name is the file name **without** `.py`. The file `helpers.py` is imported as `import helpers`.
- Both files sit in the **same folder**. That's where Python looks first (more on that soon).
- You run `main.py`, the file that starts everything. It's often called the **entry point**: the front door of your program.
- The other import styles work on your own modules too:

```python
from helpers import format_money, add_tax

print(format_money(add_tax(1000)))  # prints: $11.30
print(format_money(add_tax(450)))   # prints: $5.08
```

After you run it, a new folder called `__pycache__` appears next to your files. That's Python saving a pre-translated copy of `helpers.py` so it loads faster next time. You can ignore it, and it's safe to delete: Python just makes it again.

### Importing runs the module's code

When Python imports a module, it **runs the whole file from top to bottom**, once. Defining functions doesn't print anything, so you usually don't notice. But any loose code at the top level of the module runs too.

Say you added a quick test at the bottom of `helpers.py`, to check your function while writing it:

```python
def format_money(cents):
    """Turn a number of cents into text like $12.50."""
    return f"${cents / 100:.2f}"


# Quick test
print(format_money(1250))
print(format_money(99))
```

And `main.py` is:

```python
from helpers import format_money

print("Welcome to the cafe")
print(format_money(450))
```

Run `python main.py`, and you'll see:

```
$12.50
$0.99
Welcome to the cafe
$4.50
```

The test lines from `helpers.py` sneaked into your cafe program, because importing ran them. You want those tests when you run `helpers.py` on its own, but not when another file imports it. That's exactly what the next trick is for.

### `if __name__ == "__main__":`

This line looks scary, but the idea is simple. Every module has a hidden variable called `__name__` (two underscores on each side; Python programmers call these "dunder" names, short for "double underscore"). Python fills it in for you:

- If you **run** the file directly (`python helpers.py`), its `__name__` is `"__main__"`.
- If another file **imports** it, its `__name__` is the module's name, `"helpers"`.

You can see it for yourself. Put this one line in `helpers.py`:

```python
print(f"helpers.py says: __name__ is {__name__}")
```

And this in `main.py`:

```python
import helpers

print(f"main.py says: __name__ is {__name__}")
```

Run `python main.py`:

```
helpers.py says: __name__ is helpers
main.py says: __name__ is __main__
```

Now run `python helpers.py`:

```
helpers.py says: __name__ is __main__
```

So `__name__ == "__main__"` really means **"was this file run directly?"** Put your test code under that `if`, and it only runs when you want it to:

```python
def format_money(cents):
    """Turn a number of cents into text like $12.50."""
    return f"${cents / 100:.2f}"


if __name__ == "__main__":
    # Quick test: only runs when you run helpers.py directly
    print(format_money(1250))
    print(format_money(99))
```

| You run | What prints |
|---|---|
| `python helpers.py` | `$12.50` and `$0.99` (the tests run) |
| `python main.py` | `Welcome to the cafe` and `$4.50` (the tests stay quiet) |

Think of a restaurant's practice kitchen: the chef tastes the sauce while cooking it, but the tasting spoon never goes out to the customers. This `if` is the tasting spoon.

> **Tip:** You'll see this line at the bottom of lots of real Python programs, often calling a function named `main()`. It's a polite way of saying "this file can be run on its own, but it's also safe to import".

### Where Python looks for modules

When you write `import something`, Python searches a list of folders, in order, and uses the **first** match it finds:

1. **The folder of the file you ran.** That's why `helpers.py` must sit next to `main.py`.
2. **The standard library folders**, which were installed along with Python.
3. **The `site-packages` folder**, where packages you install yourself end up ([chapter 23](../23-pip-and-virtual-environments/notes.md)).

The list lives in `sys.path`, and you can print it:

```python
import sys

for folder in sys.path:
    print(folder)
```

You'll see something like this (your folders will be different):

```
C:\Users\Sandip\Python\19-modules-and-standard-library
C:\Users\Sandip\AppData\Local\Programs\Python\Python313\python313.zip
C:\Users\Sandip\AppData\Local\Programs\Python\Python313\DLLs
C:\Users\Sandip\AppData\Local\Programs\Python\Python313\Lib
C:\Users\Sandip\AppData\Local\Programs\Python\Python313
C:\Users\Sandip\AppData\Local\Programs\Python\Python313\Lib\site-packages
```

The first line is the folder your program is in. The `Lib` folder is where the standard library lives: open it in File Explorer some time and you'll find `random.py`, `statistics.py` and many more. They're ordinary Python files, just like yours. (A few, like `math`, are built into Python itself, so you won't find a `math.py`.)

If Python searches every folder and finds nothing, you get a `ModuleNotFoundError`:

```python
import maths
# ModuleNotFoundError: No module named 'maths'
```

### Name clashes: don't call your file `random.py`

Because your own folder is searched **first**, your files can hide the standard library's. This catches nearly every beginner once. You're practising random numbers, so you name your file `random.py`:

```python
import random

print(random.randint(1, 6))
```

Run it, and you'll see (with your own folder in place of `...`):

```
AttributeError: module 'random' has no attribute 'randint' (consider renaming 'C:\...\random.py' since it has the same name as the standard library module named 'random' and prevents importing that standard library module)
```

What happened? `import random` searched your folder first, found **your** `random.py`, and imported that instead of the real one. Your file has no `randint`, so it fails. Worse, any other program in the same folder that does `import random` breaks too.

Python 3.13 added the helpful "consider renaming" part. Older versions only say `module 'random' has no attribute 'randint'`, which is much more confusing.

**The fix:** rename your file to something like `dice.py`, and delete any `__pycache__` folder next to it. Never name your files `random.py`, `math.py`, `time.py`, `statistics.py`, `csv.py`, `json.py`, or after any other module you plan to import.

### A tour of the standard library

The standard library has about 200 modules. You don't need to learn them all. Here are a few you'll use again and again. Try each one in a scratch file.

**`math`: maths beyond `+` and `*`** (you met it in [chapter 05](../05-numbers-and-math/notes.md))

```python
import math

print(math.sqrt(81))   # prints: 9.0
print(math.ceil(3.2))  # prints: 4
print(math.gcd(12, 18))  # prints: 6
```

`math.gcd` gives the greatest common divisor: the biggest number that divides both. Handy for simplifying fractions.

**`random`: picking and shuffling**

```python
import random

print(random.randint(1, 6))                       # a whole number from 1 to 6
print(random.choice(["tea", "coffee", "juice"]))  # one item from a list

cards = [1, 2, 3, 4, 5]
random.shuffle(cards)  # mixes up the list itself, returns None
print(cards)           # for example: [3, 4, 2, 1, 5]

print(random.sample(range(1, 50), 6))  # 6 different numbers, like a lottery draw
```

Your output will be different every time. That's the point.

**`time`: waiting**

`time.sleep(seconds)` pauses your program. It's great for countdowns, or for not hammering a website too fast later on:

```python
import time

for number in range(3, 0, -1):
    print(number)
    time.sleep(1)  # wait one second
print("Go!")
```

You'll see `3`, `2`, `1` appear one second apart, then `Go!`. ([Chapter 22](../22-dates-and-times/notes.md) has more on `time`.)

**`os`: talking to the operating system**

The **operating system** is the main program that runs your computer, like Windows. The `os` module lets Python ask it things:

```python
import os

print(os.getcwd())  # prints the folder your terminal is in, for example: C:\Users\Sandip\Python
```

`getcwd` stands for "get current working directory". The **current working directory** is the folder your terminal is "standing in" when you run the program. It matters a lot for files, which is next chapter's topic.

**`sys`: talking to Python itself**

```python
import sys

print(sys.version)  # for example: 3.13.15 (tags/v3.13.15:4061bc4, Aug  5 2026, 13:05:39) [MSC v.1944 64 bit (AMD64)]
```

`sys.exit()` stops your program straight away. You can give it a number: `0` means "all went well", anything else means "something went wrong". Other programs can check that number (you'll use this in [chapter 24](../24-command-line-programs/notes.md)).

```python
import sys

balance = -5
if balance < 0:
    print("Something is wrong with the balance.")
    sys.exit(1)

print("This line never runs")
```

You'll see only:

```
Something is wrong with the balance.
```

**`collections.Counter`: counting things**

You saw `Counter` at the start of the chapter. It takes a list (or a string) and counts how often each item appears:

```python
from collections import Counter

votes = ["tea", "coffee", "tea", "juice", "tea", "coffee"]
counts = Counter(votes)

print(counts["tea"])            # prints: 3
print(counts["water"])          # prints: 0
print(counts.most_common(2))    # prints: [('tea', 3), ('coffee', 2)]
print(Counter("mississippi"))   # prints: Counter({'i': 4, 's': 4, 'p': 2, 'm': 1})
```

A `Counter` works like a dictionary from chapter 13, with two bonuses: a missing item gives `0` instead of a `KeyError`, and `.most_common(n)` gives you the top `n` items as a list of tuples.

**`itertools`: clever looping**

`itertools` has tools for combining items in every possible way. Say three friends want to play table tennis, and everyone should play everyone else once:

```python
import itertools

players = ["Ana", "Ben", "Sandip"]
for match in itertools.combinations(players, 2):
    print(match)
```

You'll see:

```
('Ana', 'Ben')
('Ana', 'Sandip')
('Ben', 'Sandip')
```

`combinations(players, 2)` gives every pair, each one only once. Doing that with nested loops by hand is surprisingly easy to get wrong.

**`statistics`: averages and friends**

```python
import statistics

grades = [72, 85, 90, 85, 68, 95]

print(statistics.mean(grades))    # prints: 82.5
print(statistics.median(grades))  # prints: 85.0
print(statistics.mode(grades))    # prints: 85
```

- The **mean** is the usual average: add them all up and divide by how many there are.
- The **median** is the middle value once they're sorted. (With an even count, it's halfway between the two middle ones.)
- The **mode** is the value that appears most often.

**And much more.** Here's a map of modules you'll meet in this course:

| Module | What it's for | Where you'll use it |
|---|---|---|
| `math` | Square roots, rounding up and down, pi | [Chapter 05](../05-numbers-and-math/notes.md) |
| `random` | Random numbers, shuffling, picking | Chapter 05 and this chapter |
| `pathlib` | Files and folders | [Chapter 20](../20-files-and-folders/notes.md) |
| `json`, `csv` | Saving and loading data | [Chapter 21](../21-json-and-csv/notes.md) |
| `datetime` | Dates and times | [Chapter 22](../22-dates-and-times/notes.md) |
| `argparse` | Programs that take options | [Chapter 24](../24-command-line-programs/notes.md) |
| `re` | Finding patterns in text | [Chapter 35](../35-regular-expressions/notes.md) |
| `sqlite3` | A small database in a file | [Chapter 42](../42-databases/notes.md) |

The full list is in the official docs at <https://docs.python.org/3/library/>. Don't read it cover to cover. Instead, when you're about to write something fiddly, ask yourself: "is there a module for that?" There often is.

### Exploring a module: `dir()` and `help()`

You don't need the internet to find out what's in a module. Two built-in functions tell you.

`dir()` lists every name inside a module:

```python
import math

print(dir(math))
```

The list is long, and it starts with some odd names like `'__doc__'` and `'__name__'`. Those are Python's own bookkeeping. You can skip them with a comprehension from [chapter 15](../15-comprehensions/notes.md):

```python
import math

names = [name for name in dir(math) if not name.startswith("_")]
print(names[:8])  # prints: ['acos', 'acosh', 'asin', 'asinh', 'atan', 'atan2', 'atanh', 'cbrt']
print(len(names))  # prints: 62 (on Python 3.13; other versions may differ)
```

`help()` shows the documentation for a module or function, including the docstrings you learned to write in [chapter 10](../10-functions/notes.md):

```python
import math

help(math.sqrt)
```

You'll see:

```
Help on built-in function sqrt in module math:

sqrt(x, /)
    Return the square root of x.

```

(Don't worry about the `/`. It just means you can't write `sqrt(x=16)`.)

`help()` works on your own modules too. Try `import helpers` and `help(helpers)` in the REPL from inside the `cafe` folder: your docstrings show up, nicely laid out. That's one more reason to write them.

> **Tip:** `help()` on a whole module, like `help(math)`, gives a long page. In the terminal it shows one screen at a time: press **Space** for the next screen, and **q** to quit.

### Packages: folders of modules

When you have lots of modules, you can group them in a folder. A folder of modules is called a **package**:

```
cafe/
├── main.py
└── shop/
    ├── __init__.py
    ├── money.py
    └── tax.py
```

The `__init__.py` file can be completely empty. It marks the folder as a package. (Modern Python can often manage without it, but adding it is the clear, traditional way.) You import from a package with dots, like a path:

```python
from shop.money import format_money
from shop.tax import add_tax

print(format_money(add_tax(2000)))  # prints: $22.60
```

You've used a package already: `collections`, `json` and `pathlib` are all packages or modules of the standard library. Packages written by other people, like `requests` for the internet or `pandas` for data, aren't included with Python. You download them with a tool called `pip`, which is [chapter 23](../23-pip-and-virtual-environments/notes.md). Laying out a bigger project of your own is [chapter 39](../39-project-structure-and-packaging/notes.md).

## Common mistakes

**1. Naming your file after a module**

You save your dice game as `random.py`, and `import random` gives:

```
AttributeError: module 'random' has no attribute 'randint' (consider renaming 'C:\...\random.py' since it has the same name as the standard library module named 'random' and prevents importing that standard library module)
```

Python imported your own file instead of the real `random`. Fix: rename your file (for example `dice.py`) and delete the `__pycache__` folder next to it.

**2. Using the module name after `from ... import`**

```python
from math import sqrt

print(math.sqrt(16))
# NameError: name 'math' is not defined. Did you forget to import 'math'?
```

`from math import sqrt` brings in `sqrt` only. The name `math` itself was never created. Fix: either write `sqrt(16)`, or change the import to `import math`. Pick one style and stick to it.

**3. Adding `.py` to the import**

```python
import helpers.py
# ModuleNotFoundError: No module named 'helpers.py'; 'helpers' is not a package
```

The dot in an import means "look inside a package", so Python goes looking for a module called `py` inside a package called `helpers`. Fix: `import helpers`, with no `.py`.

**4. Misspelling a module or a name inside it**

```python
import maths
# ModuleNotFoundError: No module named 'maths'
```

```python
import math

print(math.squareroot(16))
# AttributeError: module 'math' has no attribute 'squareroot'
```

The module is `math`, and the function is `sqrt`. When you're not sure of a name, check with `dir()` or `help()`, or look it up in the docs.

**5. Hiding a module behind a variable**

```python
import random

random = 7
print(random.randint(1, 6))
# AttributeError: 'int' object has no attribute 'randint'
```

A module's name is just a variable. `random = 7` replaced the module with the number 7, and numbers have no `randint`. Fix: give your variable a different name, like `lucky_number`.

**6. Test code that runs on import**

You put `print(format_money(1250))` at the bottom of `helpers.py` to test it, and now `$12.50` appears every time `main.py` runs. Importing a module runs its top-level code. Fix: put test code under `if __name__ == "__main__":`.

## Quick recap

- A **module** is any `.py` file. `import math` loads a module, `from math import sqrt` takes one name from it, and `import random as rnd` gives it a nickname. Avoid `from x import *`.
- Your own file `helpers.py` is imported as `import helpers`, when it sits in the same folder as the file you run.
- Importing runs the module's code once. Put test code under `if __name__ == "__main__":` so it only runs when the file is run directly.
- Python looks in your program's folder first, then the standard library. So never name your files `random.py`, `math.py` and so on.
- The **standard library** is the toolbox that comes with Python: `math`, `random`, `time`, `os`, `sys`, `collections.Counter`, `itertools`, `statistics`, and many more.
- `dir(module)` lists what's inside, and `help(thing)` shows its documentation.
- A **package** is a folder of modules. Packages from other people are installed with `pip` in [chapter 23](../23-pip-and-virtual-environments/notes.md).

---

**Next:** try the [exercises](exercises.md), then move on to [20 Files and Folders](../20-files-and-folders/notes.md).
