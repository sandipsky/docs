# 18 Error Handling

## What is it?

When something goes wrong while your program is running, Python **raises an exception**: it stops what it's doing and creates an object that describes the problem, like `ValueError` or `KeyError`.

**Error handling** means catching that exception and dealing with it, so your program can show a friendly message and keep going instead of crashing.

## Why does it matter?

Real programs meet a messy world. Here's a tiny program from [chapter 07](../07-input-and-output/notes.md):

```python
age = int(input("How old are you? "))
print(f"Next year you'll be {age + 1}")
```

It works perfectly, until someone types `twenty`:

```
How old are you? twenty
Traceback (most recent call last):
  ...
ValueError: invalid literal for int() with base 10: 'twenty'
```

One unexpected answer, and the whole program crashes. In [chapter 08](../08-conditionals/notes.md) you protected against this by checking with `.isdigit()` first. That helps, but it's not perfect: `.isdigit()` says no to `"-5"`, even though `int("-5")` works fine. And for many problems, like a missing key, a file that isn't there, or a network that's down, there's no easy check to make first.

With error handling, you can:

- show a friendly message instead of a crash,
- ask again until the answer makes sense,
- skip one bad item and carry on with the rest,
- clean up (turn off a printer, close a file) no matter what happened.

It also works the other way round. Your own functions can raise the alarm the moment something is wrong, instead of quietly giving a wrong answer that nobody notices until much later.

## Real-world example

Think of a busy restaurant kitchen:

| In the kitchen | In Python |
|---|---|
| The chef tries to cook the order | `try:` runs code that might fail |
| The chef finds there's no salmon left and rings the bell: "Can't make this one!" | `raise ValueError("Out of salmon")` |
| The waiter hears the bell, tells the customer, and offers the chicken instead | `except ValueError:` handles the problem |
| If the cooking went fine, the waiter serves the dish | `else:` runs only when nothing went wrong |
| The kitchen gets cleaned at the end of the night, busy or quiet | `finally:` runs no matter what |
| Nobody hears the bell, and the whole restaurant shuts down | An exception nobody catches crashes the program |

Notice the split. The chef *spots* the problem, but the waiter *decides what to do about it*. That idea is at the heart of this chapter.

## How it works

### Exceptions you've already met

You've been seeing exceptions since [chapter 01](../01-getting-started/notes.md). Every error that appears while your program runs is one. Here are the most common ones, with the real messages Python gives:

| Exception | What it means | Example | Last line of the error |
|---|---|---|---|
| `ValueError` | The right type, but a value that makes no sense | `int("abc")` | `ValueError: invalid literal for int() with base 10: 'abc'` |
| `TypeError` | The wrong type for this job | `"5" + 3` | `TypeError: can only concatenate str (not "int") to str` |
| `ZeroDivisionError` | Dividing by zero | `10 / 0` | `ZeroDivisionError: division by zero` |
| `KeyError` | A dictionary key that isn't there | `{"tea": 250}["coffee"]` | `KeyError: 'coffee'` |
| `IndexError` | A list position that doesn't exist | `[1, 2, 3][5]` | `IndexError: list index out of range` |
| `NameError` | A name that doesn't exist (often a typo) | `print(totl)` | `NameError: name 'totl' is not defined` |
| `AttributeError` | A method or attribute the value doesn't have | `"abc".push("d")` | `AttributeError: 'str' object has no attribute 'push'` |

Each one has a name that tells you the **kind** of problem, and a message that tells you the **details**.

`SyntaxError` is different. It's a grammar mistake, like a missing bracket, and Python finds it while *reading* your file, before a single line runs. So nothing in this chapter can catch a `SyntaxError`: you just fix the typo.

There's one more kind of mistake that no exception will ever tell you about: a **logic error**, where the program runs happily but gives the wrong answer, like writing `test1 + test2 / 2` to average two test scores, when you meant `(test1 + test2) / 2`. Python can't know what you *meant*, so always check your results.

### Reading a traceback

When an exception isn't handled, Python stops and prints a report called a **traceback**. Learning to read it saves you a lot of time. Save this as `trace.py` and run it:

```python
def count_items(order):
    return len(order["items"])

def print_summary(order):
    count = count_items(order)
    print(f"Order {order['id']} has {count} items")

print_summary({"id": 7, "items": ["pizza", "cola"]})
print_summary({"id": 8})
print("Done")
```

You'll see this (the file paths are shortened here; yours will show where your file lives):

```
Order 7 has 2 items
Traceback (most recent call last):
  File "C:\...\18-error-handling\trace.py", line 9, in <module>
    print_summary({"id": 8})
    ~~~~~~~~~~~~~^^^^^^^^^^^
  File "C:\...\18-error-handling\trace.py", line 5, in print_summary
    count = count_items(order)
  File "C:\...\18-error-handling\trace.py", line 2, in count_items
    return len(order["items"])
               ~~~~~^^^^^^^^^
KeyError: 'items'
```

Read it from the **bottom up**:

1. **What went wrong:** the last line, `KeyError: 'items'`. Something looked up the key `"items"` in a dictionary that doesn't have one. Order 8 has no items.
2. **Where it broke:** the `File` line just above it: line 2 of `trace.py`, inside `count_items`. Python shows that line, with `^^^` marks under the exact part that failed.
3. **How it got there:** keep reading upwards. `count_items` was called from line 5, inside `print_summary`, which was called from line 9. `<module>` means "the main part of your file, outside any function".

"Most recent call last" at the top is a reminder of this order: the newest call is at the bottom, next to the error. It's the call stack from [chapter 17](../17-recursion/notes.md), the stack of plates, printed at the moment things went wrong.

Also notice that `Done` never printed. An exception that nobody handles stops the whole program.

> **Tip:** the bottom line is nearly always the best place to start. Read the exception's name and message first, then the `File` line just above it to find the spot in your own code.

### Catching an exception with `try` and `except`

Crashing isn't always what you want. `try` and `except` let you say: "try this, and if this kind of problem happens, do that instead."

```python
age_text = "twenty"

try:
    age = int(age_text)
    print(f"Next year you'll be {age + 1}")
except ValueError:
    print(f"'{age_text}' is not a whole number")

print("The program keeps going")
```

You'll see:

```
'twenty' is not a whole number
The program keeps going
```

Here's what happened, step by step:

1. Python runs the `try` block, line by line.
2. `int("twenty")` fails with a `ValueError`. Python **stops the `try` block right there** and jumps to the matching `except` block. The `print` with "Next year" never runs.
3. The `except ValueError:` block runs.
4. The program carries on after the whole `try`/`except`, as if nothing had crashed.

If nothing fails inside `try`, the `except` block is skipped completely. Change `age_text` to `"25"`, and you'll see `Next year you'll be 26` and then `The program keeps going`.

The layout follows the same rules as `if` and `else` from chapter 08: a colon at the end of each line, and the code inside indented by 4 spaces.

### Catch the exception you expect

Notice the `ValueError` after `except`. It means "catch this kind of problem, and only this kind". Any other exception still crashes the program as normal:

```python
try:
    result = 10 / 0
except ValueError:
    print("Bad value")
# ZeroDivisionError: division by zero
```

The `except` was waiting for a `ValueError`, but a `ZeroDivisionError` came along instead, so it went straight past.

That might sound like a problem, but it's exactly what you want. You only catch the problems you know how to handle. Anything you didn't expect, like a typo in your code, still shows up loudly, with a traceback that tells you where to look.

### Several `except` blocks

One `try` can have several `except` blocks, one for each kind of problem. Python checks them from top to bottom and runs the first one that matches. Here's a school working out average test scores, where some of the data is messy:

```python
def average(values):
    return sum(values) / len(values)


for sample in [[80, 90, 100], [], [80, "ninety"]]:
    try:
        print(f"Average: {average(sample)}")
    except ZeroDivisionError:
        print("Can't average an empty list")
    except TypeError:
        print("All the values must be numbers")
```

You'll see:

```
Average: 90.0
Can't average an empty list
All the values must be numbers
```

An empty list makes `len(values)` zero, so the division fails. A list with a string in it makes `sum()` fail, with a `TypeError`. Each problem gets its own friendly message. And because the `try` is *inside* the loop, one bad sample doesn't stop the others from being checked.

If two kinds of problem should be handled the same way, put them in brackets, as a tuple:

```python
for text in ["12", "abc", None]:
    try:
        print(int(text))
    except (ValueError, TypeError):
        print(f"Couldn't turn {text} into a number")
```

You'll see:

```
12
Couldn't turn abc into a number
Couldn't turn None into a number
```

### `except ... as e`: what exactly went wrong?

Add `as` and a name to the `except` line, and you get the exception object itself. Printing it gives you Python's message:

```python
try:
    int("abc")
except ValueError as e:
    print(f"Problem: {e}")
    print(type(e))
```

You'll see:

```
Problem: invalid literal for int() with base 10: 'abc'
<class 'ValueError'>
```

`e` is just a name, like a function parameter. You'll see `e`, `err` and `error` in other people's code. `type(e)` shows you which kind of exception it is.

For a `KeyError`, the message is the missing key, with quotes around it:

```python
prices = {"tea": 250}

try:
    print(prices["coffee"])
except KeyError as e:
    print(f"No price for {e}")  # prints: No price for 'coffee'
```

### Why a bare `except:` is a bad idea

You *can* write `except:` with no exception type at all. It catches everything. That sounds handy, but it's a trap:

```python
price = 4

try:
    total = prise * 2  # a typo!
    print(f"Total: {total}")
except:
    print("Something went wrong")
```

This prints `Something went wrong`, and that's all. The real problem was a `NameError` from the typo `prise`, but the bare `except:` swallowed it and printed a vague message instead. You'd never find the bug.

It's even worse than that. A bare `except:` also catches **`Ctrl + C`**, the keys you press to stop a stuck program ([chapter 09](../09-loops/notes.md)). Put one inside a `while True` loop, and you might not be able to stop your own program.

The rule: **always name the exception you expect.** If you truly need a catch-all, write `except Exception as e:` and print `e`, so at least you can see what happened. (`Exception` covers all the normal errors, but not `Ctrl + C`.)

### `else` and `finally`

A `try` can have two more optional parts:

- `else:` runs only if the `try` block finished **without** an exception.
- `finally:` runs **no matter what**: after success, after a handled exception, even after a crash.

Here's a cinema ticket machine. It must always switch itself off, whatever happens:

```python
def print_ticket(text):
    print("Ticket machine on")
    try:
        seat = int(text)
    except ValueError:
        print(f"'{text}' is not a seat number")
    else:
        print(f"Printing ticket for seat {seat}")
    finally:
        print("Ticket machine off")


print_ticket("12")
print_ticket("twelve")
```

You'll see:

```
Ticket machine on
Printing ticket for seat 12
Ticket machine off
Ticket machine on
'twelve' is not a seat number
Ticket machine off
```

Why put the printing in `else`, instead of at the end of `try`? Because it keeps the `try` block small. Only the one line that might fail with a `ValueError` is inside `try`, so you can be sure that the `except` is catching a bad seat number, and not some other `ValueError` from somewhere else.

`finally` is for clean-up: turning things off, closing things, saving things. It runs even when the function leaves early with `return`:

```python
def read_setting():
    try:
        return "dark"
    finally:
        print("cleaning up")


print(read_setting())
```

You'll see:

```
cleaning up
dark
```

The `return` was on its way out of the function, but `finally` got to run first. (In [chapter 20](../20-files-and-folders/notes.md) you'll meet `with`, which does this kind of clean-up for files automatically.)

### Raising your own exceptions

Python only raises exceptions for things it understands: text that isn't a number, a key that isn't there, dividing by zero. It has no idea that taking $500 out of an account with $100 in it is wrong. Only *your* code knows the rules of your program.

When your function hits a problem it can't solve, it can raise the alarm itself, with `raise`:

```python
def withdraw(balance, amount):
    if amount > balance:
        raise ValueError("Not enough money in the account")
    return balance - amount

print(withdraw(100, 30))
print(withdraw(100, 500))
```

You'll see:

```
70
Traceback (most recent call last):
  File "C:\...\18-error-handling\bank.py", line 7, in <module>
    print(withdraw(100, 500))
          ~~~~~~~~^^^^^^^^^^
  File "C:\...\18-error-handling\bank.py", line 3, in withdraw
    raise ValueError("Not enough money in the account")
ValueError: Not enough money in the account
```

Two new things here:

- `ValueError("...")` makes a new exception object with your message. You can use any of the built-in types from the table above.
- `raise` sends it flying. The function stops on the spot, a bit like `return`, but for problems. The exception travels back to whoever called the function, then to whoever called *that*, and so on, until an `except` catches it. If nothing does, the program crashes, just like with Python's own exceptions.

Now the caller can catch it:

```python
try:
    new_balance = withdraw(100, 500)
    print(f"New balance: {new_balance}")
except ValueError as e:
    print(f"Sorry: {e}")  # prints: Sorry: Not enough money in the account
```

That's the kitchen and the waiter again. `withdraw` spots *what* is wrong. The caller decides *what to do about it*: show a message, suggest a smaller amount, or something else.

Why not just `print` a message inside `withdraw` and `return` something? Because then the caller can't easily tell a problem from a success, and the program carries on with a wrong balance. An exception can't be ignored by accident.

### Checking every rule at the top

A real function usually has several rules to check. A good way to lay them out is with **guard clauses**: checks at the very top of the function that leave straight away (with `raise`, or with `return` from [chapter 10](../10-functions/notes.md)) when something is wrong. They're like a bouncer at the door: trouble gets turned away before it gets inside. Each rule gets one flat `if`, and the real work sits at the bottom:

```python
def withdraw(balance, amount):
    if amount <= 0:
        raise ValueError("Amount must be more than 0")
    if amount > balance:
        raise ValueError(f"Not enough money. Balance: {balance}, requested: {amount}")
    return balance - amount  # the happy path


balance = 100
for amount in [30, -5, 500, 20]:
    try:
        balance = withdraw(balance, amount)
        print(f"Withdrew {amount}. Balance: {balance}")
    except ValueError as e:
        print(f"Rejected: {e}")
```

You'll see:

```
Withdrew 30. Balance: 70
Rejected: Amount must be more than 0
Rejected: Not enough money. Balance: 70, requested: 500
Withdrew 20. Balance: 50
```

Look at `balance = withdraw(balance, amount)`. When `withdraw` raises, the assignment never happens, so a bad request can't damage `balance`. Checking values like this is called **validating** them.

Which exception type should you raise? Use the one that describes the problem:

- `ValueError` when the value is the right type but makes no sense (a negative amount, a month of 13).
- `TypeError` when the value is the wrong type altogether (a string where you needed a number).

```python
def set_volume(level):
    if not isinstance(level, int):
        raise TypeError("Volume must be a whole number")
    if level < 0 or level > 10:
        raise ValueError(f"Volume must be 0 to 10, got {level}")
    print(f"Volume set to {level}")


set_volume(7)  # prints: Volume set to 7

for level in [11, "loud"]:
    try:
        set_volume(level)
    except ValueError as e:
        print(f"Bad value: {e}")
    except TypeError as e:
        print(f"Bad type: {e}")
```

You'll see:

```
Volume set to 7
Bad value: Volume must be 0 to 10, got 11
Bad type: Volume must be a whole number
```

(`isinstance()` is the "is this value of this type?" check from [chapter 17](../17-recursion/notes.md).)

### Making your own exception type

Sometimes none of the built-in types quite fits. "Not enough money" isn't really a bad *value*: the amount was fine, the account just couldn't cover it. You can make your own exception type, with a name that says exactly what went wrong, in two lines:

```python
class InsufficientFunds(Exception):
    pass
```

This uses `class`, which you'll learn properly in [chapter 27](../27-classes-and-objects/notes.md). For now, you only need to copy the pattern: `class`, your new name, `(Exception)`, a colon, and `pass` on the next line (`pass` is Python's way of saying "nothing else to add here"). It means "a new kind of exception, that works just like the normal ones". By tradition, exception names are written in **CamelCase** (each word starts with a capital letter, no underscores), like the built-in ones.

Now `withdraw` can raise two different kinds of problem, and the caller can handle each one differently:

```python
class InsufficientFunds(Exception):
    pass


def withdraw(balance, amount):
    if amount <= 0:
        raise ValueError("Amount must be more than 0")
    if amount > balance:
        raise InsufficientFunds(f"Balance is {balance}, requested {amount}")
    return balance - amount


balance = 100
for amount in [30, -5, 500]:
    try:
        balance = withdraw(balance, amount)
        print(f"Withdrew {amount}. Balance: {balance}")
    except InsufficientFunds as e:
        print(f"Not enough money: {e}")
    except ValueError as e:
        print(f"Bad amount: {e}")
```

You'll see:

```
Withdrew 30. Balance: 70
Bad amount: Amount must be more than 0
Not enough money: Balance is 70, requested 500
```

If nobody catches it, the traceback ends with your own exception's name, which makes the problem obvious at a glance:

```
InsufficientFunds: Balance is 100, requested 500
```

### Asking again until the answer is valid

Here's the classic use of everything so far: asking the user for a number, and asking again until they type one. It's a `while True` loop from [chapter 09](../09-loops/notes.md), with a `try` inside:

```python
def ask_int(prompt):
    """Keep asking until the user types a whole number, then return it."""
    while True:
        text = input(prompt)
        try:
            return int(text)
        except ValueError:
            print(f"'{text}' is not a whole number. Try again.")


tickets = ask_int("How many tickets? ")
print(f"You asked for {tickets} tickets")
```

If you type `two`, then `3.5`, then `3`, you'll see:

```
How many tickets? two
'two' is not a whole number. Try again.
How many tickets? 3.5
'3.5' is not a whole number. Try again.
How many tickets? 3
You asked for 3 tickets
```

When `int(text)` works, `return` hands the number back and leaves the function, which also ends the loop. When it fails, the `except` prints a message, and the loop goes round again. Put this function in your toolbox: you'll use it in a lot of programs.

> **Tip:** `int()` is quite forgiving. It accepts spaces around the number (`" 7 "`) and a minus sign (`"-5"`). If those aren't allowed in your program (a ticket count can't be negative), add a check after the conversion.

### Ask forgiveness, or look before you leap?

There are two ways to deal with something that might go wrong, and they have names:

- **LBYL**, "look before you leap": check first, and only do it if the check passes. That's the `.isdigit()` check from chapter 08.
- **EAFP**, "it's easier to ask forgiveness than permission": just try it, and handle the exception if it fails. That's `try`/`except`.

Here are both, side by side:

```python
def check_first(text):
    """LBYL: look before you leap."""
    if text.isdigit():
        return int(text)
    return None


def just_try(text):
    """EAFP: easier to ask forgiveness than permission."""
    try:
        return int(text)
    except ValueError:
        return None


for text in ["42", "-5", " 7 ", "abc", "3.5"]:
    label = f"'{text}'"
    print(f"{label:<6} check first: {check_first(text)}, just try: {just_try(text)}")
```

You'll see:

```
'42'   check first: 42, just try: 42
'-5'   check first: None, just try: -5
' 7 '  check first: None, just try: 7
'abc'  check first: None, just try: None
'3.5'  check first: None, just try: None
```

The two disagree about `"-5"` and `" 7 "`. `.isdigit()` only says yes when *every* character is a digit, so it turns away numbers that `int()` would happily accept. That's the weakness of looking first: your check has to match the real rules exactly, and that's often harder than it looks. With EAFP, `int()` itself decides, so the check and the real work can never disagree.

Both styles are fine Python, though, and sometimes looking first reads more clearly. For a dictionary, all three of these work:

```python
prices = {"tea": 250}
item = "coffee"

# Look before you leap
if item in prices:
    print(prices[item])
else:
    print("Not on the menu")

# Ask forgiveness
try:
    print(prices[item])
except KeyError:
    print("Not on the menu")

# Or skip the question entirely, with .get() from chapter 13
print(prices.get(item, "Not on the menu"))
```

Each one prints `Not on the menu`. Here, the `in` check and `.get()` are short and clear, so most people would pick one of those. A good rule of thumb: **if a simple check matches the real rule exactly, look first. If the check would be complicated or easy to get wrong, just try it.**

### When to catch, and when to let it crash

Catching isn't always the right move. Before you write an `except`, ask yourself: *can I do something useful here?*

| Catch it when you can... | Let it crash when... |
|---|---|
| show the user a friendly message, or ask again | it's a bug in your own code (a typo, a wrong key name) |
| fall back to a sensible default | there's nothing sensible to do at this spot |
| skip one bad item and carry on with the rest | carrying on would give wrong results, like charging a customer twice |

A crash with a clear traceback is annoying, but it's honest: it tells you exactly where to look. A program that hides a problem and keeps going with wrong data is much worse.

## Common mistakes

**1. Swallowing an exception silently**

```python
def save_high_score(score):
    raise ValueError("Save file is full")  # pretend saving failed


try:
    save_high_score(9800)
except ValueError:
    pass  # do nothing

print("Game over. See you next time!")  # prints: Game over. See you next time!
```

`pass` is Python's way of saying "nothing to do here". The save failed, but the player never finds out, and neither do you. Their high score is just gone. At the very least, report the problem:

```python
except ValueError as e:
    print(f"Couldn't save your score: {e}")
```

And if you can't do anything useful with an exception, don't catch it at all.

**2. Using a variable from a `try` that failed**

```python
try:
    age = int("twenty")
except ValueError:
    print("Not a number")

print(f"Age: {age}")
# NameError: name 'age' is not defined
```

You'll see `Not a number`, then the crash. `int("twenty")` failed before anything was stored in `age`, so `age` was never created. Fix: make sure the variable always gets a value. Give it a default before the `try` (`age = 0`), use it inside an `else:` block, or use an "ask again" loop like `ask_int`, which only finishes once it has a real number.

**3. Catching the wrong type**

```python
def to_number(text):
    try:
        return int(text)
    except ValueError:
        return 0


print(to_number("abc"))  # prints: 0
print(to_number(None))
# TypeError: int() argument must be a string, a bytes-like object or a real number, not 'NoneType'
```

The function was ready for a `ValueError`, but `int(None)` raises a `TypeError`, which goes straight past. Fix: read the last line of the error to see which type actually happened. If `None` really can arrive, catch both: `except (ValueError, TypeError):`.

**4. A `try` block that blames the wrong thing**

```python
def withdraw(balance, amount):
    if amount > balance:
        raise ValueError("Not enough money")
    return balance - amount


balance = 100
try:
    balance = withdraw(balance, 20)
    print(f"New balance: {balanse}")  # a typo!
except Exception:
    print("Not enough money!")
# prints: Not enough money!
```

The withdrawal worked. The real problem is the typo `balanse`, a `NameError`. But the `except` caught *everything* and guessed, and guessed wrong, so now you're hunting for a money problem that doesn't exist. To avoid this:

- Catch the specific type you expect (`except ValueError`), so a typo still crashes loudly.
- Keep `try` blocks small, around just the line that can fail. Put the rest in `else:`.
- Print `e` instead of guessing. Here it would have said `name 'balanse' is not defined` straight away.

**5. Raising a plain string**

```python
stock = 0
if stock == 0:
    raise "Out of stock"
# TypeError: exceptions must derive from BaseException
```

`raise` needs an exception object, not just a message. (`BaseException` is the family that every exception belongs to.) Fix: wrap the message in an exception type: `raise ValueError("Out of stock")`.

**6. Expecting `try` to catch a syntax error**

```python
try:
    print("Hi"
except SyntaxError:
    print("Caught it!")
# SyntaxError: '(' was never closed
```

"Caught it!" never prints. Python reads the whole file before running any of it, finds the missing bracket, and stops right there, so the `try` never gets its chance. `try`/`except` only catches problems that happen while the program runs. Fix the typo instead.

## Quick recap

- When something goes wrong at run time, Python **raises an exception**, like `ValueError`, `TypeError`, `ZeroDivisionError`, `KeyError` or `IndexError`.
- Read a traceback from the **bottom up**: the exception and its message, then the line where it broke, then the calls that led there.
- `try` runs code that might fail. `except SomeError:` handles that kind of problem. Add `as e` to get the message. Several `except` blocks can handle different problems.
- Always name the exception you expect. A bare `except:` hides bugs (and even `Ctrl + C`).
- `else:` runs only when nothing went wrong. `finally:` runs no matter what, which makes it the place for clean-up.
- `raise ValueError("...")` lets your own functions raise the alarm. `class MyError(Exception): pass` makes your own exception type.
- To get valid input, loop with `while True`, `try` the conversion, and ask again in the `except`.
- EAFP (just try it) and LBYL (check first) are both fine. Check first when a simple check matches the rule exactly; otherwise, just try it.

---

**Next:** try the [exercises](exercises.md), then move on to [19 Modules and the Standard Library](../19-modules-and-standard-library/notes.md).
