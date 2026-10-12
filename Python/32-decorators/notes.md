# 32 Decorators

## What is it?

A **decorator** is a function that takes another function, and gives back a new version of it with some extra behavior wrapped around it. You put one on with an `@` line just above a `def`.

You've already used a few: `@property` in [chapter 27](../27-classes-and-objects/notes.md), `@abstractmethod` in [chapter 28](../28-inheritance/notes.md), `@total_ordering` in [chapter 29](../29-dunder-methods/notes.md), and `@dataclass` and `@classmethod` in [chapter 30](../30-dataclasses-and-enums/notes.md). This chapter shows what that `@` really does, and how to write your own.

## Why does it matter?

Here are two functions from a cafe's reporting program. Someone wants to know which one is slow, so each of them now measures its own time, with `time.perf_counter()`. That's the very precise clock that [chapter 22](../22-dates-and-times/notes.md) mentioned: it works like `time.time()`, but it's better for timing code.

```python
import time


def count_visitors(days: int) -> int:
    start = time.perf_counter()
    total = 0
    for day in range(days):
        total += day % 50
    print(f"count_visitors took {time.perf_counter() - start:.4f} seconds")
    return total


def make_report(rows: int) -> str:
    start = time.perf_counter()
    report = "\n".join(f"Row {n}" for n in range(rows))
    print(f"make_report took {time.perf_counter() - start:.4f} seconds")
    return report


count_visitors(1_000_000)
make_report(100_000)
```

On the computer used to test this chapter, it printed this (your times will be different):

```
count_visitors took 0.0408 seconds
make_report took 0.0212 seconds
```

It works, but look at what happened to the code:

- **The same lines are copied into every function.** With twenty functions, that's twenty copies. Want to change the message? Twenty edits.
- **The timing is tangled up with the real work.** `make_report` does one line of real work, wrapped in two lines of timing.
- **Taking it out again is a chore.** Once you've found the slow function, you have to remove the timing from every function, and it's easy to miss one.

With a decorator, you write the timing code **once**, and switch it on for any function by putting `@timer` on the line above its `def`. The same goes for any extra job you want around lots of functions: logging every call, checking the arguments, trying again when the network fails. By the end of this chapter, you'll have written all of those.

## Real-world example

Think of the gift-wrapping counter in a department store. You hand over a present, and you get it back wrapped: paper, a ribbon, a card. The present inside is exactly the same. The wrapping adds something **around** it. And the person at the counter can wrap any present you bring, books, mugs or socks, in the same way.

| Gift wrapping | Decorators |
|---|---|
| The present | Your original function |
| The wrapping paper and ribbon | The extra code that runs around it (timing, logging, checking) |
| The person at the gift-wrap counter | The decorator: a function that takes your function and hands back a wrapped one |
| The same counter wraps any present | One decorator works on many functions |
| A present in paper, then in a box | Stacking two decorators on one function |
| The gift tag that still says what's inside | `functools.wraps`, which keeps the function's name and docstring |

## How it works

### Part 1: Four building blocks

A decorator is built from four ideas that you haven't needed until now. Each one is small. Take them one at a time, and the decorators in Part 2 will make sense.

### Functions are values

In [chapter 10](../10-functions/notes.md), you saw what happens if you forget the brackets after a function's name: Python shows you the function itself, instead of calling it. That's not just a mistake. A function **is** a value, like a number or a list, and you can use it like one.

```python
def greet(name: str) -> str:
    return f"Hello, {name}!"


say_hello = greet  # no brackets: we're not calling it

print(say_hello("Maya"))  # prints: Hello, Maya!
print(say_hello)  # prints something like: <function greet at 0x0000025052FA14E0>
print(greet.__name__)  # prints: greet
print(say_hello is greet)  # prints: True
```

`say_hello = greet` doesn't copy the function. It ties a second name tag to the same function object (remember name tags from [chapter 16](../16-scope-and-mutability/notes.md)), so `say_hello is greet` is `True`. And every function knows its own name, in its `__name__` attribute. You'll use that a lot in this chapter.

Because functions are values, you can put them in a dictionary, and pass them to other functions as arguments, like any other value. Here's a shop with two pricing rules, in cents:

```python
from collections.abc import Callable


def add_vat(cents: int) -> int:
    return round(cents * 1.2)


def student_discount(cents: int) -> int:
    return round(cents * 0.9)


def apply_to_all(prices: list[int], rule: Callable[[int], int]) -> list[int]:
    """Use the rule on every price, and return the new prices."""
    return [rule(price) for price in prices]


price_rules = {"vat": add_vat, "student": student_discount}
rule = price_rules["student"]
print(rule(1000))  # prints: 900

menu = [350, 1299, 275]
print(apply_to_all(menu, add_vat))  # prints: [420, 1559, 330]
print(apply_to_all(menu, rule))  # prints: [315, 1169, 248]
```

`price_rules["student"]` gives you the `student_discount` function, so `rule(1000)` calls it. No `if`/`elif` chain needed to pick a rule.

`apply_to_all` doesn't know or care which rule it gets. It just calls `rule(price)` for each price. Notice that the call passes `add_vat` without brackets: the function itself, not its answer.

The hint for "a function" is **`Callable`**, from the same `collections.abc` module as `Iterator` in [chapter 31](../31-iterators-and-generators/notes.md). (Callable means "something you can call with brackets", as you saw in chapter 16.) Inside its square brackets go two things: a list of the argument types, then the return type. So `Callable[[int], int]` reads "a function that takes one `int` and returns an `int`".

### Functions inside functions, and closures

You can write a `def` inside another `def`. Chapter 16 showed this briefly, when it explained the "Enclosing" in LEGB. The inner function is a local name, like a local variable: it only exists inside the outer function. But the outer function can **return** it, and then it gets out as a value. Here's where that gets interesting:

```python
from collections.abc import Callable


def make_multiplier(factor: int) -> Callable[[int], int]:
    def multiply(n: int) -> int:
        return n * factor  # factor comes from make_multiplier

    return multiply  # hand back the function itself, without calling it


double = make_multiplier(2)
triple = make_multiplier(3)

print(double(10))  # prints: 20
print(triple(10))  # prints: 30
print(double(7))  # prints: 14
```

`return multiply`, with no brackets, hands back the inner function. So `double` is a function, and `double(10)` calls it. The return hint `Callable[[int], int]` says "this gives back a function that takes an `int` and returns an `int`".

Now think about what's going on. `make_multiplier(2)` ran, created `multiply`, returned it, and finished. Normally, a function's local variables vanish when it finishes. But `double(10)` still knows that `factor` is 2. And `triple` knows that its `factor` is 3.

The inner function **remembers** the variables from the place it was made. An inner function that remembers variables like this is called a **closure**. Each call to `make_multiplier` makes a brand-new `multiply`, with its own `factor` packed inside, like a lunchbox packed fresh each morning.

Closures are perfect for making functions to order: a discount maker that turns `10` into a "10% off" function, or a greeter that always uses the same greeting. And they're the key to decorators.

> **Tip:** If you did the [JavaScript course](../../JavaScript/25-closures/notes.md), closures work just the same way in Python.

### Changing a remembered variable: `nonlocal`

A closure can read the outer variables freely. Changing one is a different story. Say you make a deli's ticket machine with a closure: `make_counter()` sets `count = 0`, and its inner function `next_ticket()` does `count += 1` and returns `count`. Calling it crashes:

```
UnboundLocalError: cannot access local variable 'count' where it is not associated with a value
```

It's the same problem as with globals in chapter 16. `count += 1` assigns to `count`, so Python makes `count` a new local variable of `next_ticket`, and then can't read it. Chapter 16 fixed that with `global`. For a variable in the enclosing function, the keyword is **`nonlocal`**:

```python
from collections.abc import Callable


def make_counter() -> Callable[[], int]:
    count = 0

    def next_ticket() -> int:
        nonlocal count  # "I mean make_counter's count, not a new one"
        count += 1
        return count

    return next_ticket


deli = make_counter()
bakery = make_counter()
print(deli())  # prints: 1
print(deli())  # prints: 2
print(deli())  # prints: 3
print(bakery())  # prints: 1
```

Each counter has its own `count`, packed inside it. The deli's tickets don't affect the bakery's. (`Callable[[], int]` means "a function that takes no arguments and returns an `int`".)

### `*args`: any number of arguments

Every function you've written so far takes a fixed number of arguments. But some functions don't know in advance how many they'll get. `print()` is one: `print("a")`, `print("a", "b", "c")` and `print()` all work.

Put a `*` in front of a parameter's name, and it collects **all** the extra positional arguments into a tuple ([chapter 12](../12-tuples-and-sets/notes.md)):

```python
def order_total(*prices: int) -> int:
    print(prices)
    return sum(prices)


print(order_total(350, 1299, 275))
print(order_total(500))
print(order_total())
```

You'll see:

```
(350, 1299, 275)
1924
(500,)
500
()
0
```

Inside the function, `prices` is a tuple holding whatever was passed in: three prices, one, or none. The hint `*prices: int` means "each argument is an `int`".

You can have normal parameters first. They take their arguments as usual, and the starred one collects whatever is left: with `def receipt(customer: str, *prices: int)`, the call `receipt("Maya", 350, 1299)` puts `"Maya"` in `customer` and `(350, 1299)` in `prices`.

The name `args` (short for "arguments") is the tradition when there's no better name, so you'll often see `*args`. The star is what matters; the name is up to you.

### `**kwargs`: any number of keyword arguments

Two stars do the same thing for **keyword arguments** (`milk="oat"`, from chapter 10). They're collected into a dictionary, with the names as keys:

```python
def make_coffee(size: str, **extras: str) -> str:
    print(extras)
    order = f"{size} coffee"
    for name, choice in extras.items():
        order += f", {name}: {choice}"
    return order


print(make_coffee("large", milk="oat", syrup="vanilla"))
print(make_coffee("small"))
```

You'll see:

```
{'milk': 'oat', 'syrup': 'vanilla'}
large coffee, milk: oat, syrup: vanilla
{}
small coffee
```

The traditional name is `kwargs`, short for "keyword arguments". The hint `**extras: str` means "each value is a `str`".

### Unpacking with `*` and `**` when you call

The stars also work the other way round, when you **call** a function. `*` in a call unpacks a list (or tuple) into separate positional arguments. `**` unpacks a dictionary into separate keyword arguments:

```python
def order_total(*prices: int) -> int:
    return sum(prices)


def make_coffee(size: str, milk: str = "none", syrup: str = "none") -> str:
    return f"{size} coffee, milk: {milk}, syrup: {syrup}"


basket = [350, 1299, 275]
print(order_total(basket[0], basket[1], basket[2]))  # prints: 1924
print(order_total(*basket))  # prints: 1924

usual = {"milk": "oat", "syrup": "vanilla"}
print(make_coffee("large", **usual))  # prints: large coffee, milk: oat, syrup: vanilla

print(*basket)  # prints: 350 1299 275
print(*basket, sep=" + ")  # prints: 350 + 1299 + 275
```

`order_total(*basket)` means exactly `order_total(350, 1299, 275)`. And `make_coffee("large", **usual)` means `make_coffee("large", milk="oat", syrup="vanilla")`. Leave out the star, and you pass the whole list as **one** argument: `order_total(basket)` crashes with `TypeError: unsupported operand type(s) for +: 'int' and 'list'`, because `sum()` tried to add a list to a number.

| Where | `*` | `**` |
|---|---|---|
| In a `def` | Collects extra positional arguments into a tuple | Collects extra keyword arguments into a dict |
| In a call | Unpacks a list or tuple into positional arguments | Unpacks a dict into keyword arguments |

> **Tip:** If you did the [JavaScript course](../../JavaScript/15-destructuring-spread-rest/notes.md), `*args` is like a rest parameter (`...args`), and `*` in a call is like spread.

### Passing everything on

Put both together, and you get a function that accepts **any** arguments at all, and passes them on, untouched, to another function:

```python
from typing import Any


def make_coffee(size: str, milk: str = "none", syrup: str = "none") -> str:
    return f"{size} coffee, milk: {milk}, syrup: {syrup}"


def pass_it_on(*args: Any, **kwargs: Any) -> str:
    print(f"args: {args}")
    print(f"kwargs: {kwargs}")
    return make_coffee(*args, **kwargs)


print(pass_it_on("small", syrup="caramel"))
```

You'll see:

```
args: ('small',)
kwargs: {'syrup': 'caramel'}
small coffee, milk: none, syrup: caramel
```

`pass_it_on` collects everything with `*args, **kwargs`, then unpacks it all again into `make_coffee`. `Any`, from the `typing` module, is the "any type at all" hint you met in [chapter 26](../26-project-todo-app/notes.md). This pattern, collect everything and pass it on, is the heart of every decorator.

### Part 2: Decorators

You now have all four building blocks: functions are values, functions inside functions, closures, and `*args, **kwargs`. Time to put them together.

### Your first decorator, by hand

A decorator is a function that takes a function, and returns a new function that wraps around it. Here's one that makes a greeting louder:

```python
from collections.abc import Callable


def shout(func: Callable[[str], str]) -> Callable[[str], str]:
    def wrapper(name: str) -> str:
        result = func(name)  # call the original function
        return result.upper() + "!!"  # add something on the way out

    return wrapper


def greet(name: str) -> str:
    return f"Hello, {name}"


loud_greet = shout(greet)

print(greet("Leo"))  # prints: Hello, Leo
print(loud_greet("Leo"))  # prints: HELLO, LEO!!
```

Step by step:

1. `shout(greet)` hands the `greet` function to `shout`, where it's called `func`.
2. `shout` defines a new function, `wrapper`, and returns it **without calling it**. Nothing has been greeted yet.
3. `wrapper` is a closure: it remembers `func`, the original `greet`.
4. When you call `loud_greet("Leo")`, you're really calling `wrapper("Leo")`. It calls the original `greet("Leo")`, gets `"Hello, Leo"`, and changes it on the way out.

The present (`greet`) is untouched: `greet("Leo")` still works exactly as before. `loud_greet` is the same present, wrapped.

### The `@` shorthand

Usually you don't want two versions lying around. You want the wrapped one to **replace** the original, under the same name: `greet = shout(greet)`. That's so common that Python has a shorthand for it. Put `@shout` on the line above the `def`. Add this below the code above:

```python
@shout
def say_goodbye(name: str) -> str:
    return f"Goodbye, {name}"


print(say_goodbye("Zoe"))  # prints: GOODBYE, ZOE!!
```

That's all `@` is. These two pieces of code do exactly the same thing:

```
@shout                              def say_goodbye(name):
def say_goodbye(name):                  ...
    ...                             say_goodbye = shout(say_goodbye)
```

Python defines the function, passes it to the decorator straight away, and keeps whatever the decorator returns under the original name. You can put `@shout` on as many functions as you like: the same gift-wrap counter, any present.

### A decorator for any function

`shout` only fits functions that take exactly one argument. Put it on `order_ready(name, drink)`, which takes two, and calling it crashes:

```
TypeError: shout.<locals>.wrapper() takes 1 positional argument but 2 were given
```

`order_ready` is really `wrapper` now, and `wrapper` only has room for one argument. (`shout.<locals>.wrapper` is Python's way of saying "the `wrapper` that lives inside `shout`".) The fix is the "pass everything on" pattern: the wrapper takes `*args, **kwargs`, and hands them all to the original function. Here's a decorator that logs every call, and works on any function:

```python
from collections.abc import Callable
from typing import Any


def log_calls(func: Callable[..., Any]) -> Callable[..., Any]:
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        print(f"Calling {func.__name__} with {args} {kwargs}")
        result = func(*args, **kwargs)
        print(f"{func.__name__} returned {result!r}")
        return result

    return wrapper


@log_calls
def order_ready(name: str, drink: str) -> str:
    return f"{name}, your {drink} is ready"


@log_calls
def add_tip(cents: int, percent: int = 10) -> int:
    """Return the price in cents with a tip added."""
    return cents + cents * percent // 100


message = order_ready("Maya", "latte")
print(message)
print()
total = add_tip(2000, percent=15)
print(total)
```

You'll see:

```
Calling order_ready with ('Maya', 'latte') {}
order_ready returned 'Maya, your latte is ready'
Maya, your latte is ready

Calling add_tip with (2000,) {'percent': 15}
add_tip returned 2300
2300
```

`Callable[..., Any]` is the hint for "any function at all": the `...` (the Ellipsis from [chapter 20](../20-files-and-folders/notes.md)) means "any arguments", and `Any` means "any result". `{result!r}` shows the result the way you'd type it, with quotes around strings, like `repr()` in chapter 29.

This is the shape almost every decorator has. Learn it, and you can read most decorators you'll ever meet:

```python
from collections.abc import Callable
from typing import Any


def decorator(func: Callable[..., Any]) -> Callable[..., Any]:
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        # before: anything you want to do first
        result = func(*args, **kwargs)  # call the original, with all its arguments
        # after: anything you want to do afterwards
        return result  # hand back the original's answer

    return wrapper  # hand back the wrapper, without calling it
```

Two `return` lines, and both matter. The inner one hands back the original function's answer. The outer one hands back the wrapper. (Common mistakes shows what happens if you forget either.)

### `functools.wraps`: keep the gift tag

There's one problem left. Add these lines at the bottom of the `log_calls` example:

```python
print(add_tip.__name__)  # prints: wrapper
print(add_tip.__doc__)  # prints: None
help(add_tip)
```

`help()` prints:

```
Help on function wrapper in module __main__:

wrapper(*args: Any, **kwargs: Any) -> Any
```

`add_tip` is really `wrapper` now, so it has `wrapper`'s name, no docstring, and `wrapper`'s parameters, which tell you nothing. Error messages and logs show the wrong name too. The present is wrapped so well that the tag saying what's inside is gone.

The standard library's `functools` module has the fix: **`functools.wraps`**. Put `@functools.wraps(func)` on the line above `def wrapper`. It copies the original function's name, docstring and a few other details onto the wrapper:

```python
import functools
from collections.abc import Callable
from typing import Any


def log_calls(func: Callable[..., Any]) -> Callable[..., Any]:
    @functools.wraps(func)  # copy func's name and docstring onto wrapper
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        print(f"Calling {func.__name__} with {args} {kwargs}")
        result = func(*args, **kwargs)
        print(f"{func.__name__} returned {result!r}")
        return result

    return wrapper
```

Run the same three lines again, and you get the real thing back:

```
add_tip
Return the price in cents with a tip added.
Help on function add_tip in module __main__:

add_tip(cents: int, percent: int = 10) -> int
    Return the price in cents with a tip added.
```

Yes, `wraps` is itself a decorator, used inside your decorator, and it takes an argument. You'll see how that works in a moment. For now, the rule is simple: **always put `@functools.wraps(func)` on your wrapper.**

### A practical decorator: `@timer`

Back to the problem from the start of the chapter. Here's the timing code, written once, as a decorator:

```python
import functools
import time
from collections.abc import Callable
from typing import Any

Func = Callable[..., Any]  # "any function": any arguments, any result


def timer(func: Func) -> Func:
    """Print how long each call to func takes."""

    @functools.wraps(func)
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"{func.__name__} took {elapsed:.4f} seconds")
        return result

    return wrapper


@timer
def count_visitors(days: int) -> int:
    total = 0
    for day in range(days):
        total += day % 50
    return total


@timer
def make_report(rows: int) -> str:
    return "\n".join(f"Row {n}" for n in range(rows))


visitors = count_visitors(1_000_000)
report = make_report(100_000)
print(visitors)  # prints: 24500000
```

One run printed this before the total (your times will be different, and they change a little every run):

```
count_visitors took 0.1289 seconds
make_report took 0.0598 seconds
```

`Func` is a type alias ([chapter 25](../25-type-hints/notes.md)), so the long `Callable[..., Any]` is only written once. Now compare the two functions with the ones at the start of the chapter. They're back to doing only their own work. When you've found the slow one, delete the `@timer` lines, and that's it.

### Decorators with arguments: `@retry(times=3)`

Some decorators need a setting. Say the kitchen printer in a cafe sometimes doesn't answer the first time. You'd like any function that talks to it to try again, up to 3 times. The number of tries should be a choice: `@retry(times=3)` on one function, `@retry(times=5)` on another.

That needs **three** layers of functions, one inside the next. Take it slowly:

```python
import functools
from collections.abc import Callable
from typing import Any

Func = Callable[..., Any]


def retry(times: int) -> Callable[[Func], Func]:
    """Make a decorator that tries a function up to `times` times."""

    def decorator(func: Func) -> Func:
        @functools.wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            for attempt in range(1, times):
                try:
                    return func(*args, **kwargs)
                except ConnectionError as e:
                    print(f"Attempt {attempt} failed ({e}). Trying again...")
            return func(*args, **kwargs)  # the last try: errors get through

        return wrapper

    return decorator


# Pretend replies from a shaky kitchen printer: two timeouts, then success.
printer_answers = iter(["timeout", "timeout", "ok"])


@retry(times=3)
def print_order(order_id: int) -> str:
    if next(printer_answers) == "timeout":
        raise ConnectionError("the kitchen printer didn't answer")
    return f"Order {order_id} printed"


print(print_order(42))
```

You'll see:

```
Attempt 1 failed (the kitchen printer didn't answer). Trying again...
Attempt 2 failed (the kitchen printer didn't answer). Trying again...
Order 42 printed
```

(There's no real printer here, of course. `printer_answers` is an iterator from chapter 31 that hands out two pretend timeouts and then an "ok", so you can watch the retrying happen.)

Here's how to read the three layers, from the outside in:

| Layer | Takes | Returns | Its job |
|---|---|---|---|
| `retry(times)` | The setting | `decorator` | Remembers `times`, and makes a decorator |
| `decorator(func)` | The function | `wrapper` | A normal decorator, exactly like `timer` |
| `wrapper(*args, **kwargs)` | The real arguments | The result | The code that runs on every call |

The trick is in the `@` line. `@retry(times=3)` has brackets, so Python **calls** `retry(times=3)` first. That gives back `decorator`, and *that* is what gets used as the decorator:

```python
three_tries = retry(times=3)  # step 1: make a decorator
print_order = three_tries(print_order)  # step 2: use it, like any decorator
```

Or in one line: `print_order = retry(times=3)(print_order)`. And thanks to closures, `wrapper` can still see `times` (from `retry`) and `func` (from `decorator`), long after both have finished.

Inside `wrapper`, the `for` loop makes the first `times - 1` attempts inside a `try`. If one works, `return` hands back its answer, and the loop is over. The last attempt sits outside the `try`. So if the printer fails all three times, the first two failures are printed, and the third `ConnectionError` gets through to the caller, who can catch it with `try`/`except` ([chapter 18](../18-error-handling/notes.md)).

Notice that `retry` only catches `ConnectionError`. Trying again makes sense when a problem might go away by itself, like a busy printer or network. It makes no sense for a bug, like a typo in your code, which would fail three times in a row. Catch only what you expect, as chapter 18 taught.

> **Tip:** A real retry decorator would usually wait a little between attempts, with `time.sleep()` from [chapter 19](../19-modules-and-standard-library/notes.md), so a busy printer or website gets a moment to recover. It would also let you choose which exceptions to retry. Both would be extra parameters on `retry`.

### Stacking decorators

You can put more than one decorator on a function. The one **closest to the `def`** wraps first, and the top one goes around the outside, like paper first and then a box:

```python
import functools
from collections.abc import Callable

TextFunc = Callable[[str], str]


def in_box(func: TextFunc) -> TextFunc:
    @functools.wraps(func)
    def wrapper(name: str) -> str:
        return f"[ {func(name)} ]"

    return wrapper


def with_bow(func: TextFunc) -> TextFunc:
    @functools.wraps(func)
    def wrapper(name: str) -> str:
        return f"{func(name)} *bow*"

    return wrapper


@in_box
@with_bow
def gift(name: str) -> str:
    return f"present for {name}"


print(gift("Zoe"))  # prints: [ present for Zoe *bow* ]
```

Stacking `@in_box` on top of `@with_bow` means `gift = in_box(with_bow(gift))`. The bow goes on first, then the whole thing goes in the box. Swap the two `@` lines, and the bow ends up outside the box: `[ present for Zoe ] *bow*`. **Order matters.**

When you call a stacked function, the outermost wrapper runs first. So with `@log_calls` on top of `@timer`, the "Calling count_visitors" line is printed before the timing even starts, and the "returned" line comes last.

### Decorators you've met, and will meet

Now you can read every `@` line in this course:

| Decorator | Chapter | What it does to what's below it |
|---|---|---|
| `@property` | [27](../27-classes-and-objects/notes.md) | Turns a method into something you read like an attribute |
| `@abstractmethod` | [28](../28-inheritance/notes.md) | Marks a method that every child class must write for itself |
| `@functools.total_ordering` | [29](../29-dunder-methods/notes.md) | Writes the missing comparison methods for a class |
| `@dataclass` | [30](../30-dataclasses-and-enums/notes.md) | Writes `__init__`, `__repr__` and `__eq__` for a class |
| `@classmethod` | [30](../30-dataclasses-and-enums/notes.md) | Makes a method receive the class (`cls`) instead of an object |
| `@contextlib.contextmanager` | [33](../33-context-managers/notes.md) | Turns a generator into something that works with `with` |
| `@functools.cache` | [34](../34-functional-tools/notes.md) | Remembers each answer, so a slow function only works it out once |
| `@pytest.fixture` | [36](../36-testing-with-pytest/notes.md) | Marks a function that prepares things for your tests |
| `@app.get("/books")` | [43](../43-building-a-web-api-with-fastapi/notes.md) | Connects a function to a web address (a decorator with arguments, like `retry`) |

Two of these, `@total_ordering` and `@dataclass`, go on a **class** instead of a function. It's the same idea: Python passes the class to the decorator, and keeps whatever comes back (the same class, with new methods added).

You've also seen `@dataclass(frozen=True)`, with brackets, and `@dataclass`, without. Now you know those are two different calls. `dataclass` is specially written to work both ways. Your own decorators usually pick one style: no brackets (like `timer`), or always brackets (like `retry`).

### Type hints for decorators

Run mypy on any full example in this chapter, and it says `Success`. But be honest with yourself about what `Callable[..., Any]` gives up. Make a file called `timer_hints.py`, with the imports, `Func` and `timer` from the `@timer` section at the top, and then this:

```python
@timer
def add_tip(cents: int, percent: int = 10) -> int:
    return cents + cents * percent // 100


def plain_add_tip(cents: int, percent: int = 10) -> int:
    return cents + cents * percent // 100


add_tip("twenty dollars")
plain_add_tip("twenty dollars")
```

Both calls at the bottom are wrong, but `python -m mypy timer_hints.py` only finds one:

```
timer_hints.py:33: error: Argument 1 to "plain_add_tip" has incompatible type "str"; expected "int"  [arg-type]
Found 1 error in 1 file (checked 1 source file)
```

`timer` promises to return `Callable[..., Any]`: "a function that takes anything and returns anything". So once `add_tip` is decorated, mypy forgets what its real arguments were. For the decorators in this course, that's a fair trade, and it keeps the hints readable.

There is a way to keep the real arguments, and you'll see it in libraries. With Python 3.12 or newer, the first lines of `timer` would look like this:

```python
def timer[**P, R](func: Callable[P, R]) -> Callable[P, R]:
    @functools.wraps(func)
    def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
        ...  # the same body as before

    return wrapper
```

`P` stands for "whatever arguments `func` takes" and `R` for "whatever it returns", so the wrapper promises exactly the same as the original, and mypy catches `add_tip("twenty dollars")` again. (Older code spells it with `ParamSpec` and `TypeVar` from the `typing` module.) Don't worry about writing these yet. `Callable[..., Any]` is fine for now.

## Common mistakes

**1. Forgetting to return the wrapper**

```python
def log_calls(func):
    def wrapper(*args, **kwargs):
        print(f"Calling {func.__name__}")
        return func(*args, **kwargs)


@log_calls
def make_tea(sugar):
    return f"Tea with {sugar} sugar"


print(make_tea(1))
```

```
TypeError: 'NoneType' object is not callable
```

`log_calls` defines `wrapper`, but never returns it. A function without a `return` gives back `None` ([chapter 10](../10-functions/notes.md)), so `@log_calls` replaced `make_tea` with `None`, and you can't call `None`. Fix: add `return wrapper` at the end of the decorator, lined up with `def wrapper`, not inside it.

**2. Forgetting to return the result inside the wrapper**

```python
def log_calls(func):
    def wrapper(*args, **kwargs):
        print(f"Calling {func.__name__}")
        func(*args, **kwargs)

    return wrapper


@log_calls
def add_tip(cents, percent=10):
    return cents + cents * percent // 100


total = add_tip(2000)
print(total)
```

```
Calling add_tip
None
```

The wrapper called `add_tip`, which worked out 2200, and then threw the answer away. The wrapper itself has no `return`, so every decorated function now returns `None`. No error, just a missing answer. Fix: `return func(*args, **kwargs)`, or keep it in `result` and `return result` at the end.

**3. Brackets in the wrong place: `@timer()` vs `@timer`**

```python
@timer()
def make_report(rows):
    return "\n".join(f"Row {n}" for n in range(rows))
```

```
TypeError: timer() missing 1 required positional argument: 'func'
```

With brackets, Python calls `timer()` first, with no arguments, as if it were a decorator with settings like `retry`. But `timer` needs the function. Fix: `@timer`, with no brackets.

The opposite mistake is sneakier. `@retry` without its brackets doesn't crash. `retry` receives the function as `times`, and gives back its inner `decorator`, so `print(print_order(42))` shows something like `<function retry.<locals>.decorator.<locals>.wrapper at 0x...>` instead of a message. Rule: if the decorator takes settings, use brackets. If it doesn't, don't.

**4. Leaving out `functools.wraps`**

You saw the wrong name in the `functools.wraps` section. With stacking, it gets confusing fast. Here are `timer` and `log_calls` written without `wraps`, stacked:

```python
@log_calls
@timer
def make_report(rows):
    return "\n".join(f"Row {n}" for n in range(rows))


report = make_report(1000)
```

```
Calling wrapper
make_report took 0.0002 seconds
```

`timer` went on first, and replaced `make_report` with its `wrapper`. Then `log_calls` got that `wrapper`, so it proudly logs a call to "wrapper". Imagine reading a log full of those. Fix: put `@functools.wraps(func)` above every `def wrapper`. Then each layer passes the real name on.

**5. Putting the work outside the wrapper**

```python
def log_calls(func):
    print(f"Calling {func.__name__}")  # in the wrong place!

    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)

    return wrapper


@log_calls
def make_tea():
    return "Tea is ready"


print("The program starts here")
print(make_tea())
print(make_tea())
```

```
Calling make_tea
The program starts here
Tea is ready
Tea is ready
```

"Calling make_tea" was printed once, **before the program even started**, and never when `make_tea` was actually called. The decorator itself runs only once, at the `@` line, when the function is defined. Only the code inside `wrapper` runs on every call. Fix: move the `print` inside `wrapper`, above the `return`.

## Quick recap

- Functions are values: you can store them in variables and dictionaries, pass them to other functions, and return them. The hint is `Callable[[int], int]`, or `Callable[..., Any]` for any function.
- An inner function can remember the variables of the function it was made in. That's a **closure**, like `make_multiplier(2)`. Use `nonlocal` to change a remembered variable.
- `*args` collects extra positional arguments into a tuple, and `**kwargs` collects extra keyword arguments into a dict. In a call, `*` and `**` unpack them again.
- A **decorator** takes a function and returns a wrapper around it. `@deco` above a `def` is shorthand for `func = deco(func)`.
- A good wrapper takes `*args, **kwargs`, calls `func(*args, **kwargs)`, returns the result, and has `@functools.wraps(func)` on top. The decorator returns the wrapper.
- A decorator with settings, like `@retry(times=3)`, needs three layers: the settings, the decorator, the wrapper.
- Stacked decorators wrap from the bottom up: the one closest to the `def` goes on first.

---

**Next:** try the [exercises](exercises.md), then move on to [33 Context Managers](../33-context-managers/notes.md).
