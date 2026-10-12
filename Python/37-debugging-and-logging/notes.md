# 37 Debugging and Logging

## What is it?

A **bug** is a mistake in a program that makes it do the wrong thing: crash, give a wrong answer, or get stuck. **Debugging** is the work of finding out *why* it happens, and fixing it. A **debugger** is a tool that lets you pause a running program and look inside it.

**Logging** means having your program write down what it's doing as it runs, with the time and how important each message is, on the screen or in a file. Python's built-in `logging` module does this for you.

## Why does it matter?

Bugs are normal. Every programmer writes them, every day, including the ones who've been at it for thirty years. What separates beginners from experienced developers isn't fewer bugs: it's how *quickly* they find them.

The slow way is guessing: change something, run it, change something else, run it again, and hope. The fast way is to find out what the program is really doing, step by step, until the moment it does something you didn't expect. This chapter gives you three tools for that: better `print` lines, Python's own debugger `pdb`, and the debugger in VS Code.

Logging solves a different problem. Some programs run when nobody's watching: a backup script at 2 a.m., a web server that runs for months, the library system you'll build in the next chapter. When something goes wrong there, there's no screen to look at and nobody to press a key. A log is the record you read the next morning to find out what happened.

## Real-world example

Imagine a detective with two superpowers. They can **freeze time** at the scene of a crime and walk around, looking at everything exactly as it was. And they can read the **logbook** that the ship's captain wrote all through the voyage: when they left port, when the storm started, when the engine first made that strange noise. (An aeroplane's "black box" is the same idea: a record that's there for when things go wrong.)

| The detective | Debugging and logging |
|---|---|
| Freezing time at the crime scene | Pausing the program with a **breakpoint** |
| Looking at every clue, exactly as it is | Looking at the variables while the program is paused |
| Letting time move forward one second at a time | **Stepping** through the code, one line at a time |
| Asking "how did we get here?" | The **call stack**: which function called which |
| The ship's logbook, written as things happen | A **log** file |
| "Routine", "warning", "emergency" entries | Log **levels**: `INFO`, `WARNING`, `ERROR` |

## How it works

### A method for finding bugs

Before any tools, here's a method. It works for every bug, in every language:

1. **Reproduce it.** Find the exact steps or input that make the bug happen, every time. A bug you can make happen on purpose is half solved.
2. **Read the error.** If there's a traceback, read it from the bottom up (you learned how in [chapter 18](../18-error-handling/notes.md)).
3. **Guess.** Make one specific guess about the cause: "I think `code` has a space in it."
4. **Check the guess.** Don't change any code yet. Look: print the value, or pause the program and inspect it. Was your guess right?
5. **Fix it.** Only now change the code, and run it again to be sure.
6. **Add a test.** Write a test that would have caught this bug ([chapter 36](../36-testing-with-pytest/notes.md)), so it can never sneak back in without you noticing.

The important part is step 4. Checking takes a minute. Changing code based on a wrong guess can take an afternoon.

### Reading a long traceback

In chapter 18 you read a short traceback. Real ones are often longer, because the error happens deep inside a chain of function calls. Here's a cafe till that gives discounts. Save it as `checkout.py`:

```python
DISCOUNTS = {"STUDENT": 10, "STAFF": 25}  # percent off


def discount_percent(code: str) -> int:
    return DISCOUNTS[code.upper()]


def apply_discount(total_cents: int, code: str) -> int:
    percent = discount_percent(code)
    return total_cents - total_cents * percent // 100


def checkout(prices: list[int], code: str) -> int:
    total = sum(prices)
    return apply_discount(total, code)


print(checkout([350, 275], "student"))
print(checkout([350, 275], "student "))
```

You'll see:

```
563
Traceback (most recent call last):
  File "C:\...\37-debugging-and-logging\checkout.py", line 19, in <module>
    print(checkout([350, 275], "student "))
          ~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\...\37-debugging-and-logging\checkout.py", line 15, in checkout
    return apply_discount(total, code)
  File "C:\...\37-debugging-and-logging\checkout.py", line 9, in apply_discount
    percent = discount_percent(code)
  File "C:\...\37-debugging-and-logging\checkout.py", line 5, in discount_percent
    return DISCOUNTS[code.upper()]
           ~~~~~~~~~^^^^^^^^^^^^^^
KeyError: 'STUDENT '
```

The first call worked (`563` cents). The second crashed. Read it from the bottom up:

1. **What:** `KeyError: 'STUDENT '`. Look very closely at the quotes: there's a space before the closing one. The key was `'STUDENT '`, with a space on the end, and `DISCOUNTS` only has `'STUDENT'`.
2. **Where:** line 5, inside `discount_percent`.
3. **How it got there:** going up, `discount_percent` was called by `apply_discount` (line 9), which was called by `checkout` (line 15), which was called from the main part of the file (line 19).

The traceback shows the whole chain, and the bug might be at any level of it. Here, `discount_percent` crashed, but the real cause came from outside: the code was typed with a space at the end. That happens all the time with `input()`. The fix is to tidy the code before looking it up: `DISCOUNTS[code.strip().upper()]`.

And step 6 of the method: a test in `test_checkout.py`, so the bug can't come back:

```python
from checkout import checkout


def test_code_with_spaces_still_works() -> None:
    assert checkout([350, 275], "student ") == 563
```

`python -m pytest` says `1 passed`. (Move the two `print` lines under `if __name__ == "__main__":` from [chapter 19](../19-modules-and-standard-library/notes.md) first, so they don't run every time the test imports `checkout`.)

> **Tip:** When you're stuck, explain your code out loud, line by line, to a rubber duck (or a patient friend, or a houseplant). It sounds silly, but it's a famous trick called **rubber duck debugging**. Saying what each line *should* do forces you to notice the line that doesn't.

### Print debugging, done better: `f"{total=}"`

Some bugs don't crash. The program runs happily and gives the wrong answer. Here's Sandip's basket total:

```python
def basket_total(prices: list[int], quantities: list[int]) -> int:
    """Add up price times quantity for every line in the basket (in cents)."""
    for price, quantity in zip(prices, quantities):
        total = 0
        total += price * quantity
    return total


print(basket_total([350, 275, 120], [2, 1, 3]))  # should be 1335
```

It prints `360`. No traceback, so you need to look inside. The quickest way is a `print`. Python has a handy shortcut for debug prints: put `=` at the end of the name inside the f-string's curly braces, and it prints the name *and* the value:

```python
    for price, quantity in zip(prices, quantities):
        total = 0
        total += price * quantity
        print(f"{price=} {quantity=} {total=}")
```

You'll see:

```
price=350 quantity=2 total=700
price=275 quantity=1 total=275
price=120 quantity=3 total=360
360
```

Now the bug jumps out. `total` should grow each time round the loop, but it starts again from scratch: `700`, then `275`, then `360`. That's because `total = 0` is *inside* the loop, so it's reset on every line of the basket. Move it above the `for`, and the answer is `1335`.

The `=` trick works with any expression, not just names: `print(f"{len(items)=}")` prints `len(items)=2`.

For strings, it also shows the quotes, which makes hidden spaces visible. Remember the discount code bug?

```python
code = "student "
print(code)          # prints: student
print(f"{code=}")    # prints: code='student '
print(f"{code!r}")   # prints: 'student '
```

With a plain `print(code)`, the space at the end is invisible. `f"{code=}"` shows the quotes, so you can see it. `!r` does the same without the name: it shows the value the way you'd type it in code (it's the `repr()` from [chapter 20](../20-files-and-folders/notes.md)).

> **Watch out:** Debug prints are temporary. When the bug is fixed, delete them, or your users will see `total=360` in the middle of their receipt. If you want to keep them for next time, use `logger.debug(...)`, which you'll meet later in this chapter.

### Pausing your program: `breakpoint()` and pdb

Prints are quick, but you have to decide in advance what to print, then run the program again for every new question. A **debugger** lets you pause the program at a line, ask it anything you like, and move forward one line at a time.

Python comes with a debugger called **pdb** (the Python debugger). It works in any terminal. To use it, put `breakpoint()` on the line where you want the program to stop.

Here's a loyalty-card program with a bug. Customers get one point for every whole dollar, and double points on Tuesdays. Save it as `points.py`:

```python
from datetime import date


def is_double_points_day(day: date) -> bool:
    """Tuesdays earn double points."""
    return day.weekday() == 2


def points_for(total_cents: int, day: date) -> int:
    """One point for every whole dollar, double on Tuesdays."""
    breakpoint()
    points = total_cents // 100
    if is_double_points_day(day):
        points = points * 2
    return points


tuesday = date(2026, 10, 13)
print(points_for(1250, tuesday))  # should be 24
```

13 October 2026 is a Tuesday, so $12.50 should earn 24 points. Run it with `python points.py`. Instead of finishing, it stops at the `breakpoint()` line and shows a `(Pdb)` prompt, waiting for you to type a command. Here's a whole session. The commands after each `(Pdb)` are what you type:

```
> c:\...\37-debugging-and-logging\points.py(11)points_for()
-> breakpoint()
(Pdb) l
  6         return day.weekday() == 2
  7
  8
  9     def points_for(total_cents: int, day: date) -> int:
 10         """One point for every whole dollar, double on Tuesdays."""
 11  ->     breakpoint()
 12         points = total_cents // 100
 13         if is_double_points_day(day):
 14             points = points * 2
 15         return points
 16
(Pdb) n
> c:\...\37-debugging-and-logging\points.py(12)points_for()
-> points = total_cents // 100
(Pdb) n
> c:\...\37-debugging-and-logging\points.py(13)points_for()
-> if is_double_points_day(day):
(Pdb) p points
12
(Pdb) p total_cents
1250
(Pdb) s
--Call--
> c:\...\37-debugging-and-logging\points.py(4)is_double_points_day()
-> def is_double_points_day(day: date) -> bool:
(Pdb) n
> c:\...\37-debugging-and-logging\points.py(6)is_double_points_day()
-> return day.weekday() == 2
(Pdb) p day
datetime.date(2026, 10, 13)
(Pdb) p day.weekday()
1
(Pdb) w
  c:\...\37-debugging-and-logging\points.py(19)<module>()
-> print(points_for(1250, tuesday))  # should be 24
  c:\...\37-debugging-and-logging\points.py(13)points_for()
-> if is_double_points_day(day):
> c:\...\37-debugging-and-logging\points.py(6)is_double_points_day()
-> return day.weekday() == 2
(Pdb) c
12
```

Here's what happened:

- pdb always shows **where** it is: the file, the line number in brackets, and the function. The line after `->` is the next line to run. It hasn't run yet.
- `l` **listed** the code around the current line, with `->` marking where we are.
- `n` ran the current line and stopped at the **next** one, twice.
- `p points` **printed** a variable: `12`, which is right so far.
- At line 13, `s` **stepped** into the function being called, `is_double_points_day`, so we could follow it inside.
- `p day.weekday()` showed the bug: Tuesday's weekday number is `1`, not `2`. Remember from [chapter 22](../22-dates-and-times/notes.md) that `.weekday()` counts from Monday as `0`. The code was checking for Wednesday!
- `w` showed **where** we are in the call stack: the main program called `points_for` (line 19), which called `is_double_points_day` (line 13). It's the same chain a traceback shows, but live.
- `c` **continued** running normally. The program finished and printed the wrong answer, `12`. Now we know why. The fix is `== 1`, and then you delete the `breakpoint()` line.

Here are the commands you'll use most:

| Command | Short for | What it does |
|---|---|---|
| `n` | next | Run the current line, and stop at the next one. If the line calls a function, run the whole function without stopping inside. |
| `s` | step | Run the current line, but if it calls one of your functions, stop at the start of that function. |
| `c` | continue | Keep running until the next `breakpoint()`, or the end. |
| `p something` | print | Show the value of a variable or any expression, like `p total * 2`. |
| `l` | list | Show the code around the current line. |
| `w` | where | Show the call stack: which function called which, to get here. |
| `q` | quit | Stop the program right now. |
| `h` | help | List all the commands. `h n` explains one. |

Pressing Enter on an empty line repeats the last command, which is handy for pressing `n` over and over.

> **Watch out:** `q` stops the program by raising an exception, so you'll see a traceback ending in `bdb.BdbQuit`. That's not a new bug, it's just pdb switching the program off.

A few more things worth knowing:

- In Python 3.13, the program stops *on* the `breakpoint()` line itself. Older versions stop on the line just after it. Either way, the next `n` takes you into the code you care about.
- You can also start a program inside pdb without editing it: `python -m pdb points.py` stops before the very first line.
- If one of your variables has the same name as a command (like `n` or `c`), typing just the name runs the command. Use `p n` to see the variable.

### The VS Code debugger

pdb works everywhere, even on a server with no screen. But while you're writing code on your own computer, VS Code's debugger does the same job with buttons and panels, and many people find it easier. The **Python Debugger** extension it uses is installed automatically with the Python extension from [chapter 01](../01-getting-started/notes.md).

The steps below are from the VS Code documentation. The menus and labels can look a little different depending on your version of VS Code, but the ideas are the same.

1. **Set a breakpoint.** Open `points.py` (without the `breakpoint()` line), and click in the empty space just to the left of a line number, say line 12. A red dot appears. That's a breakpoint. Click it again to remove it. (`F9` adds or removes one on the current line.)
2. **Start debugging.** Press `F5`. The first time, VS Code asks which debugger to use: pick **Python Debugger**, and then **Python File** (debug the file that's open). Another way is the small arrow next to the Run button at the top right of the editor, then **Python Debugger: Debug Python File**.
3. **The program pauses** at your red dot, and that line is highlighted. On the left, the Run and Debug view shows:
   - **Variables**: every variable and its value right now. Click the arrows to look inside lists and dictionaries.
   - **Watch**: expressions you want to keep an eye on. Click `+` and type `day.weekday()`, and its value updates every time the program pauses.
   - **Call Stack**: the chain of function calls, like pdb's `w`. Click a line to see that function's variables.
   - **Breakpoints**: a list of all your red dots.
4. **Move forward** with the toolbar at the top, or the keys:

   | Button | Key | Same as pdb |
   |---|---|---|
   | Continue | `F5` | `c` |
   | Step Over | `F10` | `n` |
   | Step Into | `F11` | `s` |
   | Step Out (finish this function, and stop in the one that called it) | `Shift+F11` | |
   | Restart | `Ctrl+Shift+F5` | |
   | Stop | `Shift+F5` | `q` |

5. **Ask questions** in the **Debug Console** (`Ctrl+Shift+Y`), at the bottom. Type any expression, like `points * 2`, and press Enter to see its value, just like `p` in pdb.

Two kinds of breakpoint save a lot of time:

- A **conditional breakpoint** only stops when something is true. Right-click in the space left of a line number, choose **Add Conditional Breakpoint**, pick **Expression**, and type something like `item == "cookie"`. That's perfect for a loop that goes round 500 times when only one item is a problem. (To change an existing one, right-click the red dot and choose **Edit Breakpoint**.)
- A **logpoint** doesn't stop at all. It prints a message in the Debug Console each time that line runs. Right-click, choose **Add Logpoint**, and type a message with expressions in curly braces, like `total is {total}`. It's a debug print that you never have to delete from your code.

### Logging: a logbook for your program

Back to the second half of the chapter. Why not just use `print` to report what a program is doing?

- **No importance.** "Cafe opened" and "the card machine is on fire" look exactly the same.
- **No time.** You can't tell when anything happened.
- **All or nothing.** To hide the chatty messages, you have to delete them. To get them back, you type them again.
- **One place only.** Prints go to the screen. A program that runs at night needs its messages saved in a file.

You already solved some of this by hand: in chapter 20 you wrote a `log()` function that appended lines to a file, and in chapter 22 you added the time to each line. The `logging` module does all of that, and more, for you.

### Your first log messages

```python
import logging

logging.warning("Only 3 croissants left")
logging.info("Cafe opened")
logging.error("The card machine is offline")
```

You'll see:

```
WARNING:root:Only 3 croissants left
ERROR:root:The card machine is offline
```

Each line shows the level, the word `root`, and your message. (`root` is the name of the main logger: you'll make your own named ones soon.) These lines go to **standard error**, the stream for messages and warnings from [chapter 24](../24-command-line-programs/notes.md), not standard output where `print` writes.

But where did "Cafe opened" go? It wasn't an error. It was hidden on purpose. To understand why, you need the levels.

### The five levels

Every log message has a **level**: how important it is.

| Level | Use it for | Example |
|---|---|---|
| `DEBUG` | Details that only help when hunting a bug | `Basket has 3 items: ['latte', 'muffin', 'tea']` |
| `INFO` | Normal events, to show the program is working | `Cafe opened`, `Order 1042 paid` |
| `WARNING` | Something unexpected, but the program carries on | `Only 3 croissants left` |
| `ERROR` | Something failed: one job couldn't be done | `Payment for order 1042 failed` |
| `CRITICAL` | Something so bad the whole program may stop | `Can't open the database` |

There's one function for each: `logging.debug()`, `logging.info()`, `logging.warning()`, `logging.error()` and `logging.critical()`.

Logging has a **level setting**, like a volume knob. It shows messages at that level and above, and hides the rest. Out of the box, the setting is `WARNING`. That's why `info` was hidden: Python assumes you only want to hear about problems until you say otherwise.

### Choosing what to see: `logging.basicConfig`

`logging.basicConfig()` sets logging up. Call it once, near the start of your program, before any logging happens:

```python
import logging

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s %(levelname)s %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

logging.debug("Basket has 3 items")
logging.info("Cafe opened")
logging.warning("Only 3 croissants left")
logging.error("The card machine is offline")
logging.critical("Fire alarm! Everybody out")
```

You'll see something like this, with your own date and time:

```
2026-10-12 11:12:09 DEBUG Basket has 3 items
2026-10-12 11:12:09 INFO Cafe opened
2026-10-12 11:12:09 WARNING Only 3 croissants left
2026-10-12 11:12:09 ERROR The card machine is offline
2026-10-12 11:12:09 CRITICAL Fire alarm! Everybody out
```

Here's what each setting does:

- `level=logging.DEBUG` turns the knob all the way down, so every message shows. With `level=logging.INFO`, the debug line would be hidden. In a finished program, `INFO` is the usual choice.
- `format=` is a template for each line. Each `%(...)s` is filled in for you:

  | Code | Becomes |
  |---|---|
  | `%(asctime)s` | The date and time |
  | `%(levelname)s` | The level: `INFO`, `WARNING`... |
  | `%(message)s` | Your message |
  | `%(name)s` | The logger's name (more on that soon) |

- `datefmt=` says how to write the date and time, with the same `%Y`, `%m`, `%H` codes as `strftime` in chapter 22. Without it, you get the time down to the millisecond, after a comma: `2026-10-12 11:12:10,120`.

> **Tip:** `%(levelname)-8s` pads the level to 8 characters, so the messages line up neatly: `INFO     Cafe opened` and `WARNING  Only 3 croissants left`. It's the same idea as the `:<8` padding in f-strings.

### Writing the log to a file

Give `basicConfig` a `filename`, and the messages go into that file instead of onto the screen. Here's the cafe log from chapters 20 and 22, rewritten with `logging`:

```python
import logging

logging.basicConfig(
    filename="cafe.log",
    encoding="utf-8",
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

logging.info("Cafe opened")
logging.info("Sold 2 lattes")
logging.warning("Only 3 croissants left")
logging.info("Cafe closed")
```

Nothing appears on the screen. Open `cafe.log`, and you'll find (with your own times):

```
[2026-10-12 11:12:11] INFO Cafe opened
[2026-10-12 11:12:11] INFO Sold 2 lattes
[2026-10-12 11:12:11] WARNING Only 3 croissants left
[2026-10-12 11:12:11] INFO Cafe closed
```

Compare that with chapter 22's `log()` function. You didn't write `open()`, `"a"` or `strftime` this time, and you got levels for free. A few details:

- `encoding="utf-8"` works just like it does for `open()` (chapter 20). Always add it, so names like Zoë or नमस्ते don't crash your log.
- The file is opened in append mode, like chapter 20's log. Run the program again, and four more lines are added at the end. (If you'd rather start a fresh file each run, add `filemode="w"`.)
- The file name is relative, so it's created in the terminal's folder (chapter 20). Use `Path(__file__).parent / "cafe.log"` if it must sit next to your program.

> **Tip:** Want the messages on the screen *and* in the file? Give `basicConfig` a list of **handlers** (the parts that send messages somewhere) instead of a `filename`: `handlers=[logging.FileHandler("cafe.log", encoding="utf-8"), logging.StreamHandler()]`. `FileHandler` writes to the file, and `StreamHandler` writes to the screen.

### One logger per module: `getLogger(__name__)`

So far, everything went through the main "root" logger. In a program with several modules ([chapter 19](../19-modules-and-standard-library/notes.md)), each module should have a logger of its own, so you can see which part of the program wrote each line. Put this line at the top of every module, just after the imports:

```python
logger = logging.getLogger(__name__)
```

`__name__` is the module's name (or `"__main__"` for the file you ran), so each logger is named after its module automatically. Then use `logger.info(...)` and friends instead of `logging.info(...)`.

Here's a till split into two files. `orders.py` does the work:

```python
import logging

logger = logging.getLogger(__name__)

PRICES = {"latte": 350, "tea": 250, "muffin": 275}  # in cents


def order_total(items: list[str]) -> int:
    """Add up the price of every item in the order (in cents)."""
    logger.debug("Pricing %s items", len(items))
    total = 0
    for item in items:
        if item not in PRICES:
            logger.warning("No price for %r, skipping it", item)
            continue
        total += PRICES[item]
    logger.info("Order total is %s cents", total)
    return total
```

And `main.py` is the program you run. It's the **only** place that calls `basicConfig`:

```python
import logging

from orders import order_total

logger = logging.getLogger(__name__)


def main() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(levelname)-8s %(name)s: %(message)s",
    )
    logger.info("Till started")
    order_total(["latte", "cake", "muffin"])
    logger.info("Till closed")


if __name__ == "__main__":
    main()
```

Run `python main.py`:

```
INFO     __main__: Till started
WARNING  orders: No price for 'cake', skipping it
INFO     orders: Order total is 625 cents
INFO     __main__: Till closed
```

The `%(name)s` part shows who wrote each line: `orders` or `__main__`. The debug line from `orders.py` is hidden, because the level is `INFO`.

Why only configure logging in `main.py`? Think of the logbook on a ship. Every crew member writes in it, but only the captain decides where the book is kept and how much detail goes in. Your modules just write messages. The main program decides whether they go to the screen or a file, and which levels to show. That way, the same `orders.py` can be reused in a different program that wants its logs somewhere else.

### `%s` placeholders or f-strings?

You may have noticed the messages in `orders.py` look a bit odd: `logger.info("Order total is %s cents", total)`. That's logging's own placeholder style. Each `%s` is replaced by the next argument after the message (`%r` uses the `repr()` instead, with quotes, like `!r`). Both of these lines print `Sold 2 lattes to Maya`:

```python
logger.info("Sold %s lattes to %s", count, name)
logger.info(f"Sold {count} lattes to {name}")
```

Honestly, both are fine. The `%s` style has two small advantages: logging only builds the message if it's actually going to be shown (so hidden debug messages cost almost nothing), and log tools can group messages that share the same template. You'll see it in most real code, so this course uses it for logging from here on. The f-string style is easier to read, and many people use it anyway. Pick one and be consistent.

The one thing you can't do is mix them up and write it like `print`, with commas. You'll see why in the common mistakes.

### Logging an exception: `logger.exception`

When something fails inside a `try`, you want to log *what* went wrong and *where*. `logger.exception()` does both. Use it inside an `except` block: it logs your message at the `ERROR` level, and adds the full traceback underneath.

Here's a cafe reading its online orders, where one order has been typed badly. Following chapter 18's advice, the program skips the bad one and carries on. Save it as `read_orders.py`:

```python
import logging

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
logger = logging.getLogger(__name__)

orders = ["2 lattes", "1 muffin", "two teas", "3 cookies"]

for order in orders:
    try:
        count_text, item = order.split(" ", 1)
        count = int(count_text)
    except ValueError:
        logger.exception("Could not read the order %r", order)
        continue
    logger.info("Making %s x %s", count, item)
```

You'll see:

```
INFO Making 2 x lattes
INFO Making 1 x muffin
ERROR Could not read the order 'two teas'
Traceback (most recent call last):
  File "C:\...\37-debugging-and-logging\read_orders.py", line 11, in <module>
    count = int(count_text)
ValueError: invalid literal for int() with base 10: 'two'
INFO Making 3 x cookies
```

The program didn't crash, and the log has everything you need to find the problem tomorrow: which order, which line, and Python's own error message. (`order.split(" ", 1)` splits at the first space only, so `"3 cookies"` becomes `["3", "cookies"]`.)

### Turning debug messages on and off

Remember the debug prints you had to delete? Make them `logger.debug(...)` calls instead, and you can switch them on whenever you need them. A `--verbose` flag (argparse, [chapter 24](../24-command-line-programs/notes.md)) is the usual way. Save this as `open_cafe.py`:

```python
import argparse
import logging

logger = logging.getLogger(__name__)


def main() -> None:
    parser = argparse.ArgumentParser(description="Open the cafe for the day.")
    parser.add_argument(
        "--verbose", action="store_true", help="show debug messages too"
    )
    args = parser.parse_args()

    level = logging.DEBUG if args.verbose else logging.INFO
    logging.basicConfig(level=level, format="%(levelname)-8s %(message)s")

    logger.debug("Coffee machine temperature: %s C", 93)
    logger.debug("Float in the till: %s cents", 15000)
    logger.info("Cafe opened")


if __name__ == "__main__":
    main()
```

`python open_cafe.py` shows only `INFO     Cafe opened`. `python open_cafe.py --verbose` shows everything:

```
DEBUG    Coffee machine temperature: 93 C
DEBUG    Float in the till: 15000 cents
INFO     Cafe opened
```

## Common mistakes

**1. `info` messages that never show up**

```python
import logging

logging.info("Backup started")
logging.info("Backup finished")
```

The program runs, and prints nothing at all. The default level is `WARNING`, so `INFO` and `DEBUG` messages are hidden. Fix: call `logging.basicConfig(level=logging.INFO)` at the start of the program.

**2. Calling `basicConfig` a second time**

```python
import logging

logging.basicConfig(level=logging.WARNING)
logging.basicConfig(level=logging.DEBUG, format="%(levelname)s: %(message)s")
logging.debug("Can you see me?")
logging.warning("Disk almost full")
```

You'll see only `WARNING:root:Disk almost full`, in the old format. Once logging is set up, `basicConfig` quietly does nothing. A sneakier version: any `logging.info()`, `logging.warning()` (and so on) **before** `basicConfig` sets logging up with the defaults, so your `basicConfig` that comes after it is ignored:

```python
import logging

logging.warning("Starting up")  # this quietly sets up logging with the defaults
logging.basicConfig(level=logging.DEBUG, format="%(levelname)s: %(message)s")
logging.debug("Can you see me?")  # never shows
```

Again, you'll see only `WARNING:root:Starting up`. Fix: call `basicConfig` once, as the very first thing your program does, in the main program only. If you really need to replace the setup, add `force=True`: `logging.basicConfig(level=logging.DEBUG, force=True)`.

**3. Leaving `breakpoint()` in your code**

You fixed the bug, but forgot to delete the `breakpoint()` line. Next time the program runs, it stops at a `(Pdb)` prompt and waits. If it runs at night with nobody there, it waits forever. Fix: search your files for `breakpoint` before you share or commit your code (`Ctrl+Shift+F` in VS Code searches every file). In an emergency, you can switch off every `breakpoint()` without editing anything, by setting an environment variable first: `$env:PYTHONBREAKPOINT = "0"` in PowerShell (`set PYTHONBREAKPOINT=0` in Command Prompt, `export PYTHONBREAKPOINT=0` on Mac and Linux).

**4. Forgetting your debug prints**

```python
print(f"{total=}")
print(f"Total: ${total / 100:.2f}")
```

The customer's receipt now says `total=625` above the real total. Debug prints are easy to forget, especially in a big program. Fix: delete them when you're done, or use `logger.debug(...)` instead, which is hidden unless you ask for it.

**5. Logging an error without the traceback**

```python
    except ValueError as e:
        logger.error(f"Could not read the order {order!r}: {e}")
```

```
ERROR Could not read the order 'two teas': invalid literal for int() with base 10: 'two'
```

That's better than nothing, but there's no line number and no chain of calls. In a big program, you won't know where it came from. Fix: use `logger.exception(...)` inside an `except` block. It adds the full traceback for you.

**6. Writing log calls like `print`**

```python
import logging

logging.basicConfig(level=logging.INFO)
total = 625
logging.info("Total:", total)
```

`print("Total:", total)` would be fine, but logging treats everything after the message as values for `%s` placeholders, and there aren't any. Instead of your message, you get a scary block ending like this:

```
TypeError: not all arguments converted during string formatting
Call stack:
  File "C:\...\37-debugging-and-logging\mistake6.py", line 5, in <module>
    logging.info("Total:", total)
Message: 'Total:'
Arguments: (625,)
```

The block starts with `--- Logging error ---`. Your program keeps running (logging never crashes your program over a bad message), but the message you wanted is lost. Fix: `logging.info("Total: %s", total)` or `logging.info(f"Total: {total}")`.

**7. Logging secrets**

```python
logger.info("Login: user=%s password=%s", username, password)
```

```
INFO Login: user=sandip password=mango-tree-42
```

Log files get copied, emailed, uploaded and read by lots of people. Anything in a log should be treated as public. Never log passwords, card numbers, API keys, or other private details. Log *that* something happened (`User sandip logged in`), not the secret itself. There's more on keeping secrets safe in [chapter 52](../52-security-basics/notes.md).

## Quick recap

- Bugs are normal. Find them with a method: reproduce, read the traceback from the bottom up, guess, check the guess, fix, and add a test so it never comes back.
- `print(f"{total=}")` prints a name and its value, with quotes around strings so hidden spaces show up. Delete debug prints afterwards.
- `breakpoint()` pauses your program in pdb. Use `n` (next line), `s` (step into), `c` (continue), `p name` (print), `l` (list), `w` (where) and `q` (quit). VS Code's debugger does the same with red-dot breakpoints, `F5`, `F10` and `F11`, plus conditional breakpoints and logpoints.
- `logging` has five levels: `DEBUG`, `INFO`, `WARNING`, `ERROR`, `CRITICAL`. The default level is `WARNING`, so call `logging.basicConfig(level=logging.INFO, format=..., datefmt=...)` once, at the start of the main program.
- Add `filename="app.log", encoding="utf-8"` to log to a file. In each module, use `logger = logging.getLogger(__name__)`.
- Inside `except`, use `logger.exception(...)` to log the traceback too. Use `%s` placeholders (or f-strings), never `print`-style commas. Never log secrets.

---

**Next:** try the [exercises](exercises.md), then move on to [38 Project: Library System](../38-project-library-system/notes.md).
