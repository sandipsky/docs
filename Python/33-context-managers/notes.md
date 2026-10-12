# 33 Context Managers

## What is it?

A **context manager** is an object that sets something up at the start of a `with` block, and tidies it up at the end, however the block finishes. You've used one since [chapter 20](../20-files-and-folders/notes.md): the file you get from `open()`.

In this chapter you'll see what `with` really does behind the scenes, and you'll write context managers of your own.

## Why does it matter?

Lots of jobs come in pairs. Open a file, then close it. Start a timer, then stop it. Change a setting, then change it back. Step into a folder, then step back out. The second half **must** happen, even when something goes wrong in the middle.

You already know the manual way to make sure of that: `try` and `finally` from [chapter 18](../18-error-handling/notes.md).

```python
f = open("report.txt", "w", encoding="utf-8")
try:
    f.write("Sales report\n")
    f.write(f"Average sale: {420 / 0}\n")  # a bug: dividing by zero
finally:
    f.close()  # runs even though the line above crashed
```

The program still crashes with `ZeroDivisionError: division by zero`, but the file gets closed first. That works. But it has problems:

1. **It's extra typing, every single time.** Four lines of wrapping around one line of real work.
2. **It's easy to forget.** Leave out the `try` and `finally`, and the code still works on a good day. It only goes wrong on a bad day, which is the worst day to find out.
3. **The setup and the clean-up drift apart.** If the middle grows to thirty lines, the `close()` ends up a long way from the `open()`.

`with` packs that `try`/`finally` inside the object, so you write it once and never again:

```python
with open("report.txt", "w", encoding="utf-8") as f:
    f.write("Sales report\n")
```

And here's the part this chapter is about: `with` isn't just for files. When you have your **own** pair of jobs (start and stop, change and change back), you can build your own context manager. You write the clean-up once, and then every `with` that uses it gets it for free.

## Real-world example

Think about borrowing a friend's kitchen to cook dinner. The deal is simple: **always leave it as you found it.** You get the pans out, you cook, and then you wash up and put everything back. If the dinner turns out great, you wash up. If you burn the dinner and set off the smoke alarm, you *still* wash up.

| Borrowing a friend's kitchen | Context managers |
|---|---|
| The house rule: "leave it as you found it" | The `with` statement |
| Getting the pans out | **`__enter__`**: the setup |
| The pans your friend hands you | The value after `as` |
| Cooking | The indented block |
| Washing up and putting things back | **`__exit__`**: the clean-up |
| Washing up even when the dinner burns | `__exit__` runs even when the block raises an exception |

## How it works

### `with` cleans up even when things go wrong

Chapter 20 said that `with` closes the file "even when something goes wrong inside the block". Let's watch it happen. A file object has a `.closed` attribute that tells you whether it's closed yet:

```python
try:
    with open("notes.txt", "w", encoding="utf-8") as f:
        f.write("Buy milk\n")
        print(f"Inside the block, closed is {f.closed}")
        raise ValueError("something went wrong")
except ValueError as e:
    print(f"Caught: {e}")

print(f"After the block, closed is {f.closed}")
```

You'll see:

```
Inside the block, closed is False
Caught: something went wrong
After the block, closed is True
```

The error flew out of the `with` block, and the file was closed on the way out. Nobody had to remember to do it.

### What `with` really does

There's no magic here. A context manager is just an object with two special methods, the double-underscore kind you met in [chapter 29](../29-dunder-methods/notes.md):

- **`__enter__`** does the setup. Whatever it returns goes into the name after `as`.
- **`__exit__`** does the clean-up. Python calls it when the block ends, **whichever way** it ends.

When Python runs `with open("notes.txt", "w", encoding="utf-8") as f:`, it does these steps:

| Step | What Python does |
|---|---|
| 1 | Works out the expression after `with`: `open(...)` gives a file object. That object is the context manager. |
| 2 | Calls its `__enter__()` method, and puts whatever comes back into `f`. |
| 3 | Runs the indented block. |
| 4 | Calls its `__exit__()` method, whether the block finished normally, hit a `return`, or raised an exception. |

Here's roughly the same thing written out by hand, so you can see the `try`/`finally` hiding inside:

```python
manager = open("notes.txt", "w", encoding="utf-8")
f = manager.__enter__()
try:
    f.write("Buy milk\n")
finally:
    manager.__exit__(None, None, None)

print(f is manager)  # prints: True
print(f.closed)      # prints: True
```

This is simplified (the real `with` hands `__exit__` details about any error, as you'll see soon), but it's the right idea. And notice `f is manager`: a file's `__enter__` returns the file itself, so `f` and `manager` are the same object.

You'd never write that by hand. The point is: **any object with `__enter__` and `__exit__` works with `with`.** That's the whole secret. Python calls this pair of methods the **context manager protocol**. (A **protocol** is a set of methods an object promises to have, a bit like the standard plug from chapter 29.)

### Your first context manager: a timer

Say you want to know how long a piece of code takes. You'd note the time before, note it after, and subtract. That's a setup and a clean-up, so it's a perfect job for a context manager.

`time.perf_counter()` gives you a very precise clock reading in seconds ([chapter 22](../22-dates-and-times/notes.md) mentioned it, and [chapter 32](../32-decorators/notes.md) used it in `@timer`). Here's a `Timer` class:

```python
import time
from types import TracebackType


class Timer:
    """Measure how long the code inside a with block takes."""

    def __init__(self, label: str) -> None:
        self.label = label
        self.start = 0.0
        self.seconds = 0.0

    def __enter__(self) -> "Timer":
        self.start = time.perf_counter()
        return self  # this is what "as t" receives

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc_value: BaseException | None,
        traceback: TracebackType | None,
    ) -> None:
        self.seconds = time.perf_counter() - self.start
        print(f"{self.label} took {self.seconds:.3f} seconds")


with Timer("Adding up") as t:
    total = sum(range(10_000_000))

print(total)
print(f"Saved in t.seconds: {t.seconds:.3f}")
```

You'll see something like this (your times will be different, because they depend on your computer):

```
Adding up took 0.108 seconds
49999995000000
Saved in t.seconds: 0.108
```

Let's go through it:

- `__init__` is the normal setup from [chapter 27](../27-classes-and-objects/notes.md). It runs when `Timer("Adding up")` creates the object, just before the `with` starts.
- `__enter__` starts the clock and returns `self`, the timer object. That's why `t` is the timer, and why `t.seconds` still works after the block.
- `-> "Timer"` is in quotes because the class doesn't exist yet while Python is still reading it, just like in chapter 29.
- `__exit__` stops the clock and prints the result. Its first line is long, and you'll learn what its three parameters mean in a moment. It's the same in every context manager you'll write, so you can copy it.

The `as t` part is optional. If you don't need the object, leave it out: `with Timer("Adding up"):` works just fine.

And here's the real point. The timer still does its job when the block crashes:

```python
prices = {"latte": 350, "tea": 225}

with Timer("Price check"):
    print(prices["latte"])
    print(prices["mocha"])
    print("This line never runs")
```

You'll see (with the same `Timer` class above it in the file):

```
350
Price check took 0.000 seconds
Traceback (most recent call last):
  File "C:\...\33-context-managers\price_check.py", line 31, in <module>
    print(prices["mocha"])
          ~~~~~~^^^^^^^^^
KeyError: 'mocha'
```

Look at the order. Python hit the `KeyError`, ran `__exit__` (so the timer printed its line), and *then* let the error carry on and crash the program.

### The three parameters of `__exit__`

When the block ends, Python tells `__exit__` how it ended, through three parameters. Let's make a context manager that just prints what it's given:

```python
from types import TracebackType


class Inspector:
    """Show what Python hands to __exit__."""

    def __enter__(self) -> None:
        print("enter")

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc_value: BaseException | None,
        traceback: TracebackType | None,
    ) -> None:
        print("exit")
        print("  exc_type: ", exc_type)
        print("  exc_value:", exc_value)
        print("  traceback:", traceback)


with Inspector():
    print("all good")

try:
    with Inspector():
        print(10 / 0)
except ZeroDivisionError:
    print("The error still reached the except block")
```

You'll see (the number after `at` will be different for you):

```
enter
all good
exit
  exc_type:  None
  exc_value: None
  traceback: None
enter
exit
  exc_type:  <class 'ZeroDivisionError'>
  exc_value: division by zero
  traceback: <traceback object at 0x00000258E7429D80>
The error still reached the except block
```

| Parameter | When the block finished normally | When the block raised an exception |
|---|---|---|
| `exc_type` | `None` | The exception's class, like `ZeroDivisionError` |
| `exc_value` | `None` | The exception object itself, the same thing `e` holds in `except ... as e` |
| `traceback` | `None` | Where it happened: the information Python uses to print a traceback ([chapter 18](../18-error-handling/notes.md)) |

So `__exit__` can check `if exc_type is None:` to tell a happy ending from a crash. And the hints read like this:

- `type[BaseException] | None` means "an exception **class** (like `ZeroDivisionError` itself, not one particular error), or `None`". **`BaseException`** is the parent of every exception in Python, even the `KeyboardInterrupt` you get from `Ctrl + C`, which `Exception` leaves out (chapter 18, and [chapter 28](../28-inheritance/notes.md) for how exception families work).
- `BaseException | None` means "an exception object, or `None`".
- `TracebackType | None` means "a traceback object, or `None`". `TracebackType` comes from the standard library's `types` module, which is why there's an import at the top.

### Returning `True` swallows the error

Notice the last line of that output: `__exit__` saw the error, but the error still reached the `except` block outside. That's what normally happens. `__exit__` returns `None`, and Python carries on raising the error.

But if `__exit__` returns `True`, Python takes that to mean "I've dealt with the error, forget about it", and the error disappears:

```python
from types import TracebackType


class Quietly:
    """Hide every error inside the block. (Don't do this!)"""

    def __enter__(self) -> None:
        pass

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc_value: BaseException | None,
        traceback: TracebackType | None,
    ) -> bool:
        return True  # True means "I've dealt with the error, carry on"


total = 42

with Quietly():
    print("Before the typo")
    print(totl)  # oops: a typo
    print("After the typo")

print("The program carries on as if nothing happened")
```

You'll see:

```
Before the typo
The program carries on as if nothing happened
```

The typo raised a `NameError`, the rest of the block was skipped, and `Quietly` threw the error away. No traceback, no clue. It's the bare `except:` problem from chapter 18 all over again: it hides bugs.

> **Watch out:** Only return `True` from `__exit__` when you mean to swallow an error, and only for the exact kind of error you expect (check `exc_type` first). Normally, `__exit__` should return `None`: just don't write a `return` at all.

You'll rarely need to write this yourself, though. To ignore one kind of error on purpose, Python has a ready-made context manager called `suppress`, which you'll meet below.

### The easy way: `@contextmanager`

Writing a class with three methods is a lot of work just to say "do this before, and that after". The standard library's `contextlib` module has a shortcut: the **`@contextmanager`** decorator ([chapter 32](../32-decorators/notes.md)). It turns a generator function ([chapter 31](../31-iterators-and-generators/notes.md)) into a context manager.

Here's the borrowed kitchen, as code:

```python
from collections.abc import Iterator
from contextlib import contextmanager


@contextmanager
def kitchen(cook: str) -> Iterator[str]:
    print(f"1. {cook} gets the pans out")
    try:
        yield "frying pan"
    finally:
        print(f"3. {cook} washes up and puts everything back")


with kitchen("Maya") as pan:
    print(f"2. Cooking with the {pan}")

print()

try:
    with kitchen("Leo") as pan:
        print(f"2. Cooking with the {pan}")
        raise ValueError("the omelette caught fire")
except ValueError as e:
    print(f"4. Oh no: {e}")
```

You'll see:

```
1. Maya gets the pans out
2. Cooking with the frying pan
3. Maya washes up and puts everything back

1. Leo gets the pans out
2. Cooking with the frying pan
3. Leo washes up and puts everything back
4. Oh no: the omelette caught fire
```

Remember from chapter 31 that a generator **pauses** at `yield`. `@contextmanager` uses exactly that:

| In the generator function | What it does |
|---|---|
| The code **before** `yield` | The setup. It runs when the `with` starts, like `__enter__`. |
| The value after `yield` | Goes into the name after `as`. (A plain `yield` with nothing after it gives `None`.) |
| The pause at `yield` | The indented `with` block runs while the generator waits here. |
| The code **after** `yield` | The clean-up. It runs when the block ends, like `__exit__`. |

Why the `try` and `finally`? When the block raises an error, `@contextmanager` raises that same error **inside your generator, at the `yield` line**. Without `try`/`finally`, the error would skip the clean-up code, just like it would anywhere else. With `finally`, the washing up always happens. (Common mistake 2 shows what goes wrong without it.)

The hint `Iterator[str]` says "this generator hands out strings", the way you hinted generators in chapter 31. For a plain `yield` that hands out nothing, write `Iterator[None]`.

Here's the timer again, this time as a generator function. Compare it with the class version: it does the same job in half the lines.

```python
import time
from collections.abc import Iterator
from contextlib import contextmanager


@contextmanager
def timer(label: str) -> Iterator[None]:
    """Print how long the code inside the with block took."""
    start = time.perf_counter()  # before yield: the setup
    try:
        yield  # the with block runs here
    finally:
        seconds = time.perf_counter() - start  # after yield: the clean-up
        print(f"{label} took {seconds:.3f} seconds")


with timer("Adding up"):
    total = sum(range(10_000_000))

print(total)
```

It prints `Adding up took ... seconds` and then the total, just like the class version did.

### Leave it as you found it: a temporary change

Here's a pattern you'll use a lot: change something for a short while, then put it back exactly as it was. Say an app keeps its settings in a dictionary, and you want dark mode for just one part of the program:

```python
from collections.abc import Iterator
from contextlib import contextmanager


@contextmanager
def temporary_setting(settings: dict[str, str], key: str, value: str) -> Iterator[None]:
    """Change one setting for the with block, then put the old value back."""
    old_value = settings[key]
    settings[key] = value
    try:
        yield
    finally:
        settings[key] = old_value  # leave it as you found it


settings = {"theme": "light", "language": "English"}

print(settings["theme"])
with temporary_setting(settings, "theme", "dark"):
    print(settings["theme"])
print(settings["theme"])
```

You'll see:

```
light
dark
light
```

It's the borrowed kitchen again: whatever happens inside, the setting goes back. Tests use this trick all the time, to change something just for one test and then undo it ([chapter 36](../36-testing-with-pytest/notes.md)).

### A class, or `@contextmanager`?

Both make the same kind of object, and `with` can't tell them apart.

- **Use `@contextmanager`** most of the time. It's shorter, and the setup and clean-up sit right next to each other, around the `yield`.
- **Use a class** when the context manager is also a useful object in its own right, with its own data and methods, like the `Timer` whose `t.seconds` you can read after the block.

### Handy context managers from the standard library

Python comes with lots of context managers ready to use. Here are four you'll reach for often.

**`suppress`: ignore one kind of error.** Say your program keeps a `cache.txt` file, and you want to delete it if it's there. `Path.unlink()` deletes a file, but it raises an error when the file is missing:

```
FileNotFoundError: [WinError 2] The system cannot find the file specified: 'cache.txt'
```

`suppress` from `contextlib` swallows the kinds of error you name, and nothing else:

```python
from contextlib import suppress
from pathlib import Path

cache = Path("cache.txt")
cache.write_text("old data\n", encoding="utf-8")

with suppress(FileNotFoundError):
    cache.unlink()  # delete the file
print("Deleted once")

with suppress(FileNotFoundError):
    cache.unlink()  # it's already gone, but that's fine
print("Deleted twice, no crash")
```

You'll see:

```
Deleted once
Deleted twice, no crash
```

It's a short way to write `try`, `except FileNotFoundError:`, `pass`. Like any swallowed error, though, it ends the block early: if the block had more lines after the one that failed, they'd be skipped. So keep a `suppress` block short, ideally just the one line that might fail.

> **Tip:** For deleting files there's an even shorter way: `cache.unlink(missing_ok=True)` does nothing if the file isn't there. `suppress` is for everything else.

**`chdir`: step into a folder, then back out.** Remember the **current working directory** from [chapter 19](../19-modules-and-standard-library/notes.md), the folder your program is "standing in"? Relative paths start from there (chapter 20). `chdir` from `contextlib` moves into another folder for the length of the block, then moves back:

```python
from contextlib import chdir
from pathlib import Path

Path("reports").mkdir(exist_ok=True)

print(Path.cwd().name)
with chdir("reports"):
    print(Path.cwd().name)
    Path("october.txt").write_text("Sales: 42\n", encoding="utf-8")
print(Path.cwd().name)

print(Path("reports/october.txt").exists())
```

`Path.cwd()` gives the current working directory as a `Path`, and `.name` is its last part. Run from this chapter's folder, you'll see:

```
33-context-managers
reports
33-context-managers
True
```

Inside the block, the plain name `"october.txt"` meant "in the `reports` folder". After the block, you're back where you started, even if the block had crashed. `chdir` needs Python 3.11 or newer.

> **Watch out:** The working directory belongs to your whole program, not just to the block. That's fine in the small programs in this course. Programs that do several things at once ([chapter 48](../48-threads-processes-and-the-gil/notes.md)) shouldn't use it.

**Several context managers in one `with`.** Copying from one file into another needs two open files at the same time. You can put both in one `with`, separated by a comma. When the line gets long, wrap them in brackets, one per line:

```python
from pathlib import Path

Path("prices.txt").write_text("latte,350\ntea,225\nmuffin,300\n", encoding="utf-8")

with (
    open("prices.txt", encoding="utf-8") as source,
    open("prices_with_tax.txt", "w", encoding="utf-8") as target,
):
    for line in source:
        name, cents = line.strip().split(",")
        with_tax = round(int(cents) * 1.08)
        target.write(f"{name},{with_tax}\n")

print(Path("prices_with_tax.txt").read_text(encoding="utf-8"), end="")
```

You'll see:

```
latte,378
tea,243
muffin,324
```

The bracketed form needs Python 3.10 or newer. (Without brackets, `with open(...) as source, open(...) as target:` on one line works on every Python 3.)

When there are several, Python enters them from left to right, and exits them in the **opposite** order: last in, first out, like plates on a stack. Here, `target` is closed first, then `source`. That order matters when the second one depends on the first, and you'll need it in exercise 3.

**`TemporaryDirectory`: a folder that deletes itself.** Sometimes you need a scratch folder for a few files: to try something out, or for a test. The `tempfile` module makes one in your computer's temporary folder, and deletes it, with everything inside, when the block ends:

```python
import tempfile
from pathlib import Path

with tempfile.TemporaryDirectory() as folder:
    print(type(folder))
    draft = Path(folder) / "draft.txt"
    draft.write_text("Dear Maya,\n", encoding="utf-8")
    print(draft.exists())

print(draft.exists())
print(Path(folder).exists())
```

You'll see:

```
<class 'str'>
True
False
False
```

Here, `__enter__` doesn't give back the context manager itself, like a file does. It gives back the folder's path, as a plain string (something like `C:\Users\Sandip\AppData\Local\Temp\tmpame97g8f`, with a random name at the end). Wrap it in `Path(...)` to use it with `pathlib`.

**More to come.** You'll meet more context managers later in the course: `with pytest.raises(...)` checks that code raises an error ([chapter 36](../36-testing-with-pytest/notes.md)), and `with con:` makes a group of database changes all happen, or none of them ([chapter 42](../42-databases/notes.md)).

### Putting it together: a safe save

Chapter 26 said files get damaged when "the computer loses power halfway through saving". Here's why that's possible. Opening a file in `"w"` mode **empties it straight away** (chapter 20). If the program then crashes halfway through writing, you're left with half a file, and the good data that was there before is gone.

You don't even need a power cut. A bug is enough. Here's the chapter 26 save function, with a task that has a `date` in it by mistake (and JSON can't store dates, [chapter 21](../21-json-and-csv/notes.md)):

```python
import json
from datetime import date
from pathlib import Path
from typing import Any

TASKS_FILE = Path("tasks.json")


def save_tasks(tasks: list[dict[str, Any]], path: Path) -> None:
    with open(path, "w", encoding="utf-8") as f:
        json.dump(tasks, f, indent=2)


tasks: list[dict[str, Any]] = [{"id": 1, "title": "Buy milk", "done": False}]
save_tasks(tasks, TASKS_FILE)
print("First save worked")

tasks.append({"id": 2, "title": "Renew passport", "due": date(2029, 3, 1)})  # oops!
try:
    save_tasks(tasks, TASKS_FILE)
except TypeError as e:
    print(f"Save failed: {e}")

print(TASKS_FILE.read_text(encoding="utf-8"))
```

You'll see:

```
First save worked
Save failed: Object of type date is not JSON serializable
[
  {
    "id": 1,
    "title": "Buy milk",
    "done": false
  },
  {
    "id": 2,
    "title": "Renew passport",
    "due": 
```

`json.dump` writes a bit at a time, so it had already written part of the file when it reached the `date` and crashed. Now `tasks.json` is broken, and the next time the to-do app starts, it can't load anything. The error was caught, but the damage was done.

The fix is an old trick: **write to a different file first, then swap it in.** Write everything to `tasks.tmp`. Only if that finishes without an error, swap `tasks.tmp` into the place of `tasks.json` in one step. If anything goes wrong, throw `tasks.tmp` away, and `tasks.json` is never touched.

That's a setup and a clean-up, so let's make it a context manager:

```python
import json
from collections.abc import Iterator
from contextlib import contextmanager
from datetime import date
from pathlib import Path
from typing import Any, TextIO

TASKS_FILE = Path("tasks.json")


@contextmanager
def safe_write(path: Path) -> Iterator[TextIO]:
    """Write to a temporary file, and only swap it in if nothing went wrong."""
    temp = path.with_suffix(".tmp")  # tasks.json -> tasks.tmp
    try:
        with open(temp, "w", encoding="utf-8") as f:
            yield f  # the with block writes into the temporary file
        temp.replace(path)  # only reached if the block finished without an error
    finally:
        temp.unlink(missing_ok=True)  # throw away a half-written file, if there is one


def save_tasks(tasks: list[dict[str, Any]], path: Path) -> None:
    with safe_write(path) as f:
        json.dump(tasks, f, indent=2)
```

Keep the same test code underneath (everything from `tasks: list[...] = ...` down), add one more line at the very end, `print(Path("tasks.tmp").exists())`, and run it again. You'll see:

```
First save worked
Save failed: Object of type date is not JSON serializable
[
  {
    "id": 1,
    "title": "Buy milk",
    "done": false
  }
]
False
```

The second save failed, but `tasks.json` still holds the good data from the first save, and there's no leftover `tasks.tmp`. Here's how `safe_write` works, step by step:

| Line | What it does |
|---|---|
| `path.with_suffix(".tmp")` | Makes a new path with a different extension: `tasks.json` becomes `tasks.tmp`. |
| `with open(temp, "w", ...) as f:` | A context manager inside a context manager! It opens the temporary file, and makes sure it's closed. |
| `yield f` | Hands the open temporary file to the `with` block in `save_tasks`, which writes into it. |
| `temp.replace(path)` | Swaps the finished file into place. Only reached if the block didn't raise an error. |
| `temp.unlink(missing_ok=True)` | Always runs. After a successful swap, `tasks.tmp` is already gone, so it does nothing. After a crash, it deletes the half-written file. |

`TextIO` (from `typing`) is the hint for a file opened in text mode, the kind you've been using since chapter 20.

The key is `Path.replace()`. It renames `tasks.tmp` to `tasks.json`, replacing the old file, in a single step. There's never a moment when `tasks.json` is half-written: it's either the old file or the new one. Programmers call a change like that **atomic**: it can't be split into smaller pieces, so it either happens completely or not at all.

Your chapter 26 to-do app could use this right away: only `save_tasks` in `storage.py` changes, and `todo.py` doesn't notice. The library project in [chapter 38](../38-project-library-system/notes.md) saves its data this way.

> **Watch out:** On Windows, `replace()` fails if another program has `tasks.json` open at that moment (for example, if it's open in an editor that locks files): `PermissionError: [WinError 5] Access is denied: 'tasks.tmp' -> 'tasks.json'`. The good news is that `safe_write` still cleans up the temporary file, and the old `tasks.json` stays as it was.

## Common mistakes

**1. Using a file after its `with` block**

```python
with open("prices.txt", encoding="utf-8") as f:
    first = f.readline()

print(first, end="")
rest = f.read()
```

```
ValueError: I/O operation on closed file.
```

You met this in chapter 20. Now you know exactly why it happens: when the block ended, Python called the file's `__exit__`, and that closed it. The name `f` still exists, but it points at a closed file. Fix: do all your reading inside the block, and keep what you need in variables.

**2. No `try`/`finally` around the `yield`**

```python
from collections.abc import Iterator
from contextlib import contextmanager


@contextmanager
def temporary_setting(settings: dict[str, str], key: str, value: str) -> Iterator[None]:
    old_value = settings[key]
    settings[key] = value
    yield
    settings[key] = old_value  # skipped if the block raises an error!


settings = {"theme": "light", "language": "English"}
try:
    with temporary_setting(settings, "theme", "dark"):
        raise ValueError("something broke")
except ValueError:
    pass
print(settings["theme"])  # prints: dark
```

The setting was never put back to `light`. There's no error message to warn you: the clean-up just quietly didn't happen. The error from the block was raised at the `yield` line, so the line after it never ran. Fix: always wrap the `yield` in `try`, with the clean-up in `finally`.

**3. A generator that doesn't yield, or yields twice**

A `@contextmanager` generator must `yield` **exactly once**. This one forgets to yield when the cafe is closed:

```python
from collections.abc import Iterator
from contextlib import contextmanager


@contextmanager
def opening_hours(open_now: bool) -> Iterator[None]:
    if open_now:
        print("Doors open")
        yield
        print("Doors closed")


with opening_hours(False):
    print("Serving coffee")
```

```
RuntimeError: generator didn't yield
```

The `with` block needs somewhere to run, and the generator finished without ever pausing. And this one yields twice:

```python
@contextmanager
def shift(name: str) -> Iterator[None]:
    print(f"{name} starts work")
    yield
    print(f"{name} takes a break")
    yield
    print(f"{name} goes home")


with shift("Priya"):
    print("Making coffee")
```

```
Priya starts work
Making coffee
Priya takes a break
...
RuntimeError: generator didn't stop
```

A `with` block runs once, so there's nothing for a second `yield` to wait for. Fix: make sure every path through the function reaches one `yield`, and only one. (If something has to happen in several steps, it probably needs several `with` blocks, or a plain function.)

**4. `__exit__` returning `True` by accident**

It's tempting to end `__exit__` with `return True  # all done!`, as if it meant "all went well". Say the `Timer`'s `__exit__` did that (with its hint changed to `-> bool`). Then this code gives a confusing error:

```python
prices = {"latte": 350, "tea": 225}

with Timer("Price check"):
    price = prices["mocha"]

print(f"A mocha costs {price} cents")
```

```
Price check took 0.000 seconds
Traceback (most recent call last):
  ...
NameError: name 'price' is not defined. Did you mean: 'prices'?
```

The real problem was a `KeyError` for `"mocha"`, but `__exit__` returned `True` and swallowed it. So `price` was never made, and the crash happened later, somewhere else, with the wrong error. Fix: don't return anything from `__exit__` (hint it `-> None`) unless you truly mean to hide an error.

**5. `__enter__` not returning `self`**

```python
    def __enter__(self) -> None:
        self.start = time.perf_counter()  # forgot: return self
```

```python
with Timer("Adding up") as t:
    total = sum(range(1_000_000))

print(t.seconds)
```

```
AttributeError: 'NoneType' object has no attribute 'seconds'
```

The name after `as` gets whatever `__enter__` returns, **not** the object after `with`. A method with no `return` gives back `None` ([chapter 10](../10-functions/notes.md)), so `t` is `None`. Fix: end `__enter__` with `return self`, and hint it `-> "Timer"`. If you'd hinted it `-> None`, mypy would warn you: `error: "None" has no attribute "seconds"  [attr-defined]`.

**6. Forgetting the brackets**

```python
with Timer:
    total = sum(range(1_000_000))
```

```
TypeError: 'type' object does not support the context manager protocol
```

`Timer` on its own is the class, the blueprint. You need an object made from it: `with Timer("Adding up"):`. The same goes for a `@contextmanager` function: `with timer:` gives `TypeError: 'function' object does not support the context manager protocol`, and `with timer("Adding up"):` works.

## Quick recap

- A **context manager** sets something up at the start of a `with` block and cleans it up at the end, even when the block raises an exception. It's `try`/`finally`, packed into a reusable object.
- `with` calls the object's **`__enter__`** (whose return value goes after `as`), runs the block, then always calls **`__exit__`**.
- `__exit__` gets three parameters that describe the error, or three `None`s if there wasn't one. Returning `True` swallows the error, so normally return nothing.
- `@contextmanager` from `contextlib` turns a generator into a context manager: setup before `yield`, clean-up after it, and **always** a `try`/`finally` around the `yield`.
- Handy ready-made ones: `suppress` (ignore one kind of error), `chdir` (Python 3.11+), `tempfile.TemporaryDirectory`, and several managers in one `with`.
- To save a file safely, write to a temporary file, then swap it in with `Path.replace()`, so a crash never leaves a half-written file.

---

**Next:** try the [exercises](exercises.md), then move on to [34 Functional Tools](../34-functional-tools/notes.md).
