# 30 Dataclasses and Enums

## What is it?

A **dataclass** is a class that Python writes most of for you. You list the pieces of data it holds, each with a type hint, put `@dataclass` above the class, and Python writes `__init__`, `__repr__` and `__eq__` for you.

An **enum** (short for "enumeration", which means a list of things, one by one) is a fixed set of named choices, like the sizes small, medium and large. A value of that type can only ever be one of those choices.

## Why does it matter?

**Problem 1: classes that hold data take a lot of typing.** Here's a library book written by hand, with the dunder methods from [chapter 29](../29-dunder-methods/notes.md) that make it print nicely and compare properly:

```python
class Book:
    def __init__(self, title: str, author: str, year: int) -> None:
        self.title = title
        self.author = author
        self.year = year

    def __repr__(self) -> str:
        return f"Book(title={self.title!r}, author={self.author!r}, year={self.year!r})"

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Book):
            return NotImplemented
        return (self.title, self.author, self.year) == (
            other.title,
            other.author,
            other.year,
        )


print(Book("Dune", "Frank Herbert", 1965))
print(Book("Dune", "Frank Herbert", 1965) == Book("Dune", "Frank Herbert", 1965))
```

```
Book(title='Dune', author='Frank Herbert', year=1965)
True
```

It works, but count how many times you typed `title`: seven! Add a fourth piece of data, like the number of pages, and you have to remember to change `__init__`, `__repr__` and `__eq__`. Forget one, and nothing warns you. Code like this, which you have to write again and again and which is always the same shape, is called **boilerplate**.

**Problem 2: choices written as strings invite typos.** A cafe's till works out the price of a coffee from its size:

```python
def coffee_price(size: str) -> int:
    """Price in cents for a coffee of this size."""
    if size == "small":
        return 300
    if size == "medium":
        return 350
    return 400


print(coffee_price("medium"))  # prints: 350
print(coffee_price("medum"))  # prints: 400
```

A typo, and the customer pays for a large. There's no error, and mypy says `Success`, because `"medum"` is a perfectly good `str`. Nothing knows that only three sizes exist.

And remember chapter 26? A task was `Task = dict[str, Any]`, and the `Any` admitted that the hints couldn't really describe a task. This chapter gives you the better way that chapter promised: a `Task` with a hint for every field.

## Real-world example

Think of a printed form at the doctor's. It has labeled boxes: "Name: ____", "Date of birth: ____". Some boxes come already filled in, like "Country: Nepal", and you only change them if you need to. Everyone fills in the same boxes, nobody forgets one, and anyone can read a filled-in form.

Now think of the coffee cups at a cafe. There are exactly three sizes, printed on the stack of cups: small, medium and large. You can't order a "medum", because there's no such cup.

| Everyday thing | Python thing |
|---|---|
| A blank form with labeled boxes | A dataclass: `@dataclass class Book:` |
| One labeled box, "Title: ____" | A **field** with a type hint: `title: str` |
| A box that comes already filled in | A field with a default value: `done: bool = False` |
| One filled-in form | An object: `Book("Dune", "Frank Herbert", 1965)` |
| The three cup sizes printed on the cups | An enum: `class Size(Enum):` with `SMALL`, `MEDIUM` and `LARGE` |
| Asking for a cup size that doesn't exist | `Size("XL")` gives a `ValueError` |

## How it works

### Your first dataclass

Here's the same `Book`, as a dataclass:

```python
from dataclasses import dataclass


@dataclass
class Book:
    title: str
    author: str
    year: int


dune = Book("Dune", "Frank Herbert", 1965)
emma = Book(title="Emma", author="Jane Austen", year=1815)
print(dune.title)  # prints: Dune
print(dune)  # prints: Book(title='Dune', author='Frank Herbert', year=1965)
print(dune == Book("Dune", "Frank Herbert", 1965))  # prints: True
print(dune == emma)  # prints: False
```

Five lines instead of seventeen, and it does everything the long version did. Here's what's going on:

- `dataclasses` is a module in the standard library, so there's nothing to install.
- `@dataclass` on the line above the class is a **decorator**, like `@property` in [chapter 27](../27-classes-and-objects/notes.md). It reads your class and adds methods to it. ([Chapter 32](../32-decorators/notes.md) shows how decorators work.)
- Each line like `title: str` is a **field**: one piece of data that every `Book` has. A field is a name and a type hint, with no `self.` in front. The hint isn't optional: it's how `@dataclass` spots a field (Common mistakes shows what happens without one).

Here's what `@dataclass` wrote for you:

| Method | What it does |
|---|---|
| `__init__(self, title: str, author: str, year: int) -> None` | Takes one argument per field, in the order you listed them, and stores each one as `self.title` and so on. |
| `__repr__` | Shows the class name and every field: `Book(title='Dune', author='Frank Herbert', year=1965)`, with `!r` on each value. |
| `__eq__` | Two books are equal when every field is equal. (Comparing with something that isn't a `Book` gives `False`, using `NotImplemented` just like in chapter 29.) |

You use it exactly like a class you wrote yourself: dots to read and change attributes, keywords when you call it (`Book(title="Emma", ...)`), and the class name as a type hint, like `list[Book]`. VS Code and mypy know about the `__init__` that `@dataclass` wrote, so they check your arguments too. Save the example as `books.py`, add this line at the bottom, and run mypy:

```python
Book("Dune", "Frank Herbert", "1965")
```

```
books.py:17: error: Argument 3 to "Book" has incompatible type "str"; expected "int"  [arg-type]
```

(Like all hints, Python itself doesn't check these when it runs. That `Book` would be made with the text `"1965"` as its year. mypy is the one that catches it.)

### Methods still work

A dataclass is still a normal class. You can add your own methods, including dunder methods:

```python
from dataclasses import dataclass


@dataclass
class Book:
    title: str
    author: str
    year: int

    def __str__(self) -> str:
        return f"{self.title} by {self.author} ({self.year})"

    def age(self, this_year: int) -> int:
        return this_year - self.year


dune = Book("Dune", "Frank Herbert", 1965)
print(dune)  # prints: Dune by Frank Herbert (1965)
print(repr(dune))  # prints: Book(title='Dune', author='Frank Herbert', year=1965)
print(dune.age(2026))  # prints: 61
```

This follows the rule from chapter 29: `@dataclass` gives you `__repr__` for free, and you add `__str__` when you want a friendlier version. If you write a method that `@dataclass` would normally write, like your own `__repr__`, yours is kept.

### Default values

A field can have a default value, just like a function parameter:

```python
from dataclasses import dataclass


@dataclass
class Coffee:
    drink: str
    size: str = "medium"
    sugar: int = 0


print(Coffee("latte"))  # prints: Coffee(drink='latte', size='medium', sugar=0)
print(Coffee("tea", "large", sugar=2))  # prints: Coffee(drink='tea', size='large', sugar=2)
```

There's one rule: **fields with a default must come after the fields without one.** Put `size: str = "medium"` above `drink: str`, and Python refuses with a `TypeError` as soon as it reads the class (mistake 3 at the end shows it). It's the same rule as for function parameters in [chapter 10](../10-functions/notes.md), because `@dataclass` builds `__init__` from the fields in order. If `size` came first and had a default, would `Coffee("latte")` mean a latte, or a coffee of size `"latte"`?

### A list as a default: `field(default_factory=list)`

A cafe order starts empty, and items get added to it. So you try `items: list[str] = []` as a field, and `@dataclass` refuses with `ValueError: mutable default <class 'list'> for field items is not allowed: use default_factory` (mistake 2 at the end).

`@dataclass` is protecting you here. One `[]` written in the class would be one list, shared by every order: Priya's latte would appear in Sam's order too. It's the shared list trap from [chapter 16](../16-scope-and-mutability/notes.md) and chapter 27, and `@dataclass` refuses to let you fall into it. (**Mutable** means "can be changed", like a list, a dictionary or a set.)

The error message says what to do instead:

```python
from dataclasses import dataclass, field


@dataclass
class Order:
    customer: str
    items: list[str] = field(default_factory=list)


priya = Order("Priya")
sam = Order("Sam")
priya.items.append("latte")
print(priya)  # prints: Order(customer='Priya', items=['latte'])
print(sam)  # prints: Order(customer='Sam', items=[])
```

`field(default_factory=list)` means "every time a new `Order` is made, call `list()` to make a brand-new empty list for it". A **factory** is anything that makes new things. Notice it's `list`, with no brackets: you're handing over the function, so that the dataclass can call it later, once for each order. Use `default_factory=dict` or `default_factory=set` in the same way.

### `frozen=True`: objects that can't change

In chapter 29, `Money` came with a rule written in its docstring: "never change `.cents`". Rules in comments are easy to break. A **frozen** dataclass makes Python enforce it:

```python
from dataclasses import dataclass


@dataclass(frozen=True)
class Money:
    cents: int


price = Money(350)
print(price)  # prints: Money(cents=350)
print({Money(350), Money(275), Money(350)})  # prints: {Money(cents=350), Money(cents=275)}
price.cents = 1
```

```
dataclasses.FrozenInstanceError: cannot assign to field 'cents'
```

Notice that the decorator now has brackets with an option inside: `@dataclass(frozen=True)`. mypy catches the change before you run anything, too: `Property "cents" defined in "Money" is read-only`.

The set worked as well! Remember the table at the end of the `__hash__` section in chapter 29? An object that defines `__eq__` only gets a hash if it can never change. `@dataclass` follows the same rule:

- A normal dataclass writes `__eq__` and can change, so it's **unhashable**. `{Book("Dune", "Frank Herbert", 1965)}` gives `TypeError: unhashable type: 'Book'`.
- A frozen dataclass can't change, so it writes a `__hash__` too, based on all the fields. Frozen objects can go in sets and be dictionary keys.

To get a different amount, you make a new object. `replace()` from the `dataclasses` module copies an object with some fields changed: `replace(price, cents=400)` gives `Money(cents=400)`, and `price` stays `Money(cents=350)`.

### `order=True`: sorting by the fields

Add `order=True`, and `@dataclass` writes `__lt__`, `__le__`, `__gt__` and `__ge__` as well. It compares the fields one by one, in the order you listed them, just like tuples. Here are the app versions from the chapter 29 exercises again, in five lines:

```python
from dataclasses import dataclass


@dataclass(frozen=True, order=True)
class Version:
    major: int
    minor: int
    patch: int


versions = [Version(1, 10, 0), Version(1, 2, 3), Version(1, 9, 0)]
print(sorted(versions))
print(max(versions))  # prints: Version(major=1, minor=10, patch=0)
print(Version(1, 9, 0) < Version(1, 10, 0))  # prints: True
```

```
[Version(major=1, minor=2, patch=3), Version(major=1, minor=9, patch=0), Version(major=1, minor=10, patch=0)]
```

> **Watch out:** `order=True` always sorts by the first field, then the second, and so on. A `Book` with `order=True` sorts by title first, because `title` is listed first. That's often not what you want. If you'd like to sort by something else, such as the year, use `sorted()` with a `key=` ([chapter 34](../34-functional-tools/notes.md)) instead.

The `Money` class from chapter 29 shrinks too. `@dataclass(frozen=True, order=True)` writes its `__init__`, `__repr__`, `__eq__`, `__hash__` and all four comparisons. You'd only write `__str__`, `__bool__`, `__add__` and `__radd__` yourself.

### `__post_init__`: checking the values

`@dataclass` writes `__init__` for you, so where do you check that the values make sense? In a method called `__post_init__` ("post" means "after"). Python calls it straight after the `__init__` that `@dataclass` wrote, when all the fields are already stored:

```python
from dataclasses import dataclass


@dataclass
class Coffee:
    drink: str
    size: str = "medium"
    sugar: int = 0

    def __post_init__(self) -> None:
        if self.size not in ("small", "medium", "large"):
            raise ValueError(f"unknown size: {self.size!r}")
        if not 0 <= self.sugar <= 4:
            raise ValueError(f"sugar must be 0 to 4, got {self.sugar}")


print(Coffee("latte", "large"))  # prints: Coffee(drink='latte', size='large', sugar=0)
try:
    Coffee("latte", "medum")
except ValueError as e:
    print(f"Error: {e}")  # prints: Error: unknown size: 'medum'
Coffee("tea", sugar=9)
```

```
ValueError: sugar must be 0 to 4, got 9
```

These are the guard clauses from [chapter 18](../18-error-handling/notes.md), and `0 <= self.sugar <= 4` is the chained comparison from [chapter 04](../04-operators/notes.md). A bad coffee can't even be made.

That's better than charging for the wrong size. But the typo is still only caught when that line runs, and the list of sizes is written out as strings in two places now. Enums, coming up soon, fix that properly.

### `asdict()`: from dataclass to dictionary

To save objects in a JSON file ([chapter 21](../21-json-and-csv/notes.md)), you need dictionaries, because `json` doesn't know your classes. `asdict()` turns a dataclass into a dictionary, with one key per field:

```python
import json
from dataclasses import asdict, dataclass


@dataclass
class Book:
    title: str
    author: str
    year: int


dune = Book("Dune", "Frank Herbert", 1965)
print(asdict(dune))  # prints: {'title': 'Dune', 'author': 'Frank Herbert', 'year': 1965}
print(json.dumps(asdict(dune)))  # prints: {"title": "Dune", "author": "Frank Herbert", "year": 1965}
```

Going the other way, from a dictionary back to a `Book`, needs one more tool.

### `@classmethod`: another way to make an object

When you load books from a JSON file, you get dictionaries. You could write `Book(data["title"], data["author"], data["year"])` every time you need a book, but that's the kind of thing that belongs in the class itself, written once. Something like `Book.from_dict(data)`. (If you did the challenge in [chapter 27's exercises](../27-classes-and-objects/exercises.md), you wrote a loose function, `task_from_dict(data)`, for this job. Now it can move inside the class.)

There's a catch. A normal method needs an object to be called on (it becomes `self`), but here you don't have a `Book` yet: making one is the whole point. That's what a **class method** is for. It's called on the class, not on an object, and it gets the class itself as its first parameter instead of an object:

```python
import json
from dataclasses import dataclass
from typing import Any


@dataclass
class Book:
    title: str
    author: str
    year: int

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "Book":
        """Make a Book from a dictionary, like one loaded from JSON."""
        return cls(data["title"], data["author"], data["year"])


data = {"title": "Dune", "author": "Frank Herbert", "year": 1965}
dune = Book.from_dict(data)
print(dune)  # prints: Book(title='Dune', author='Frank Herbert', year=1965)

text = '{"title": "Emma", "author": "Jane Austen", "year": 1815}'
emma = Book.from_dict(json.loads(text))
print(emma.year)  # prints: 1815
```

- `@classmethod` above the method is another decorator. It means "pass the class in as the first argument, not an object".
- That first parameter is called `cls` by tradition (`class` itself is a keyword, so it can't be a name). Like `self`, you never pass it, and it gets no hint. When you call `Book.from_dict(data)`, `cls` is `Book`, so `cls(...)` is the same as `Book(...)`.
- Why write `cls(...)`, and not `Book(...)`? It works better with inheritance ([chapter 28](../28-inheritance/notes.md)): if a class inherits `from_dict`, `cls` is that child class, so you get the right kind of object back.
- `dict[str, Any]` is the same `Any` as in chapter 26: data loaded from JSON can hold values of any type, so the hint can't be more exact.
- The return hint is `"Book"`, in quotes, because the class isn't finished yet while Python reads it. Chapter 29 explained this with `Money`.

A method like `from_dict`, whose job is to make a new object in a different way, is called an **alternative constructor**. You've used some already: `date.today()` and `date.fromisoformat("2026-10-09")` from [chapter 22](../22-dates-and-times/notes.md) are both class methods that make a `date`.

> **Tip:** In other people's code, you'll often see `-> Self` instead of `-> "Book"`, with `from typing import Self` at the top (Python 3.11 or newer). It means "an object of this same class", and it works well with inheritance. Both are fine. This course uses the quoted class name, because there's nothing extra to import.

You may also meet `@staticmethod`. It makes a method that gets neither `self` nor `cls`: a plain function that lives inside the class because it belongs with it. It's rare in everyday code, and a normal function in the same module usually does the job just as well.

### The to-do task, as a dataclass

Here's chapter 26's task, with a hint for every field, and the two methods from chapter 27:

```python
from dataclasses import dataclass
from datetime import date


@dataclass
class Task:
    id: int
    title: str
    created: date
    done: bool = False
    due: date | None = None

    def mark_done(self) -> None:
        if self.done:
            raise ValueError(f"task {self.id} is already done")
        self.done = True

    def is_overdue(self, today: date) -> bool:
        if self.done or self.due is None:
            return False
        return self.due < today


today = date(2026, 10, 9)
milk = Task(1, "Buy milk", created=date(2026, 10, 5), due=date(2026, 10, 8))
grandma = Task(3, "Call grandma", created=date(2026, 10, 6))
print(milk)
print(grandma)
print(milk.is_overdue(today))  # prints: True
milk.mark_done()
print(milk.is_overdue(today))  # prints: False
```

The two `print` lines show:

```
Task(id=1, title='Buy milk', created=datetime.date(2026, 10, 5), done=False, due=datetime.date(2026, 10, 8))
Task(id=3, title='Call grandma', created=datetime.date(2026, 10, 6), done=False, due=None)
```

(`datetime.date(2026, 10, 5)` is the `__repr__` of a `date`: the code that would make it.)

A few things to notice:

- **The field order is different from chapter 26's JSON**, where `"done"` came before `"created"`. It has to be: `done` and `due` have defaults, so they go after `created`, which doesn't.
- **The dates are real `date` objects**, not text, so `is_overdue` can compare them straight away.
- **The field is called `id`**, even though chapter 27 called the parameter `task_id` so it wouldn't hide the built-in `id()`. In a dataclass, the field's name is also the parameter's name. It only hides `id()` inside the `__init__` that `@dataclass` wrote, which never uses it, so it's harmless here.

Compare it with `Task = dict[str, Any]`. Now every field has its own hint, and mypy checks every one. Save the example as `tasks.py`, and add two mistakes at the bottom:

```python
print(milk.titel)
Task(2, "Renew passport", created="2026-10-05")
```

```
tasks.py:32: error: "Task" has no attribute "titel"; maybe "title"?  [attr-defined]
tasks.py:33: error: Argument "created" to "Task" has incompatible type "str"; expected "date"  [arg-type]
```

There's one problem left. Try to save a task as JSON with `asdict()`:

```python
print(json.dumps(asdict(milk)))
```

```
TypeError: Object of type date is not JSON serializable
```

`asdict()` keeps the `date` objects as they are, and `json` can't save dates (you met this error in chapter 26). You'll fix it at the end of this chapter, once the task has a priority too. But first: enums.

### Enums: a fixed set of choices

Back to the coffee sizes. Here's an enum for them:

```python
from enum import Enum


class Size(Enum):
    SMALL = "S"
    MEDIUM = "M"
    LARGE = "L"


size = Size.MEDIUM
print(size)  # prints: Size.MEDIUM
print(repr(size))  # prints: <Size.MEDIUM: 'M'>
print(size.name)  # prints: MEDIUM
print(size.value)  # prints: M
print(size == Size.MEDIUM)  # prints: True
print(size == Size.LARGE)  # prints: False
print(size is Size.MEDIUM)  # prints: True
```

- `class Size(Enum):` makes a new enum. `Enum` comes from the `enum` module in the standard library. The `(Enum)` means `Size` is built on top of `Enum`, which is inheritance from [chapter 28](../28-inheritance/notes.md).
- `SMALL`, `MEDIUM` and `LARGE` are the enum's **members**: the only three sizes that exist. They're constants, so their names are in `UPPER_CASE`.
- Every member has a **`.name`** (the name you wrote, `"MEDIUM"`) and a **`.value`** (what's after the `=`, here `"M"`).
- There's only ever one `Size.MEDIUM` in your whole program, so `==` and `is` both work. Use `==`, as usual.

Now a typo can't hide:

```python
size = Size.MEDUM
```

```
AttributeError: type object 'Size' has no attribute 'MEDUM'. Did you mean: 'MEDIUM'?
```

And mypy finds it before you run anything: `"type[Size]" has no attribute "MEDUM"`. Compare that with the string `"medum"` from the start of the chapter, which slipped straight through.

### Looking up, looping, and `auto()`

Often a choice arrives as text, from `input()` or a file. **Call the enum with a value** to get the member that has it:

```python
choice = "M"  # what input() might give you
size = Size(choice)
print(repr(size))  # prints: <Size.MEDIUM: 'M'>
print(Size["LARGE"])  # prints: Size.LARGE

for text in ["L", "XL", "m"]:
    try:
        print(f"{text}: {Size(text).name}")
    except ValueError as e:
        print(f"Error: {e}")
```

```
L: LARGE
Error: 'XL' is not a valid Size
Error: 'm' is not a valid Size
```

`Size("M")` looks a member up by its value. `Size["LARGE"]`, with square brackets, looks it up by its name (a bad name gives a `KeyError`). A value that isn't one of the members gives a `ValueError`, so you can catch it with `try`/`except`, just like a bad number from `int()`. Notice that `"m"` fails: values are compared exactly, so `.upper()` the text first if you want to accept lowercase.

You can loop over an enum to get every member, in the order you wrote them, and `len()` counts them. That's handy for menus:

```python
for size in Size:
    print(f"{size.name:<8}{size.value}")
print(len(Size))  # prints: 3
```

```
SMALL   S
MEDIUM  M
LARGE   L
```

Sometimes the values don't matter at all: only the names do. Then let **`auto()`** pick them for you. It numbers the members 1, 2, 3, and so on. Here's the traffic light from [chapter 08](../08-conditionals/notes.md):

```python
from enum import Enum, auto


class Light(Enum):
    GREEN = auto()
    YELLOW = auto()
    RED = auto()
```

`Light.GREEN.value` is `1`, but you'll rarely look at it. What matters is that `Light.GREEN` is different from the other two.

### Enums with `match`

Enums and `match` from chapter 08 fit together nicely. Here's the coffee price again, now taking a `Size`:

```python
def coffee_price(size: Size) -> int:
    """Price in cents for a coffee of this size."""
    match size:
        case Size.SMALL:
            return 300
        case Size.MEDIUM:
            return 350
        case Size.LARGE:
            return 400


print(coffee_price(Size.MEDIUM))  # prints: 350
```

There's no `case _:`, and no `return` at the end, and mypy is fine with that, because it knows `Size` has exactly these three members, so every one of them is handled.

Now the cafe adds a new size, `EXTRA_LARGE = "XL"`, to the enum, and forgets to update `coffee_price`. Python wouldn't complain until someone ordered one (and then `coffee_price` would quietly return `None`). mypy spots it straight away:

```
coffee.py:11: error: Missing return statement  [return]
```

That's "an extra-large coffee would fall off the end of this function". In a big program, that check is worth a lot: add a choice, run mypy, and it shows you every place that needs updating.

And passing a plain string is caught too. `coffee_price("medium")` gives `Argument 1 to "coffee_price" has incompatible type "str"; expected "Size"`.

### `StrEnum`: choices that are also strings

A plain `Enum` member is not a string, even if its value is one. That's a problem when the choice has to leave your program as text: in a JSON file, a CSV file, or on the command line. **`StrEnum`** (Python 3.11 or newer) makes members that **are** strings:

```python
import json
from enum import StrEnum


class Priority(StrEnum):
    HIGH = "high"
    NORMAL = "normal"
    LOW = "low"


print(Priority.HIGH)  # prints: high
print(repr(Priority.HIGH))  # prints: <Priority.HIGH: 'high'>
print(Priority.HIGH == "high")  # prints: True
print(Priority("low"))  # prints: low
print(f"Priority: {Priority.NORMAL}")  # prints: Priority: normal
print(json.dumps({"title": "Pay rent", "priority": Priority.HIGH}))
```

The last line prints:

```
{"title": "Pay rent", "priority": "high"}
```

A `StrEnum` member prints as its value, equals its value, and goes into JSON as plain text, all without `.value`. A plain `Enum` does none of that: `Size.MEDIUM == "M"` is `False`, and `json` refuses a `Size` unless you save `Size.MEDIUM.value` (mistakes 4 and 5 at the end show both).

These are the same three priorities as in chapter 26's priority exercise, with the same strings, so tasks saved by that version would still load.

> **Tip:** In a `StrEnum`, `auto()` gives each member its own name in lowercase. So `HIGH = auto()` is the same as `HIGH = "high"`. This chapter writes the strings out, so you can see them, but you'll meet both.

Which kind should you use? A `StrEnum` when the values are text that leaves your program: files, JSON, command-line options. A plain `Enum` when they're only used inside your code. (There's an `IntEnum` for numbers, too.)

> **Watch out:** `StrEnum` members compare like their strings, and that includes sorting. `sorted(Priority)` gives high, low, normal: alphabetical order, not order of importance. To sort by importance, use `sorted()` with a `key=` ([chapter 34](../34-functional-tools/notes.md)).

### Putting it together: a task with a priority

Here's the finished `Task`: a dataclass with a `Priority` enum as a field, and the two methods that turn it into JSON and back. Save it as `task.py`:

```python
import json
from dataclasses import asdict, dataclass
from datetime import date
from enum import StrEnum
from typing import Any


class Priority(StrEnum):
    HIGH = "high"
    NORMAL = "normal"
    LOW = "low"


@dataclass
class Task:
    id: int
    title: str
    created: date
    done: bool = False
    due: date | None = None
    priority: Priority = Priority.NORMAL

    def mark_done(self) -> None:
        if self.done:
            raise ValueError(f"task {self.id} is already done")
        self.done = True

    def is_overdue(self, today: date) -> bool:
        if self.done or self.due is None:
            return False
        return self.due < today

    def to_dict(self) -> dict[str, Any]:
        """Turn the task into a dictionary that json can save."""
        data = asdict(self)
        data["created"] = self.created.isoformat()
        data["due"] = self.due.isoformat() if self.due is not None else None
        return data

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "Task":
        """Make a Task from a dictionary loaded from JSON."""
        due = data["due"]
        return cls(
            id=data["id"],
            title=data["title"],
            created=date.fromisoformat(data["created"]),
            done=data["done"],
            due=date.fromisoformat(due) if due is not None else None,
            priority=Priority(data.get("priority", "normal")),
        )


tasks = [
    Task(1, "Buy milk", created=date(2026, 10, 5), due=date(2026, 10, 8)),
    Task(5, "Pay rent", created=date(2026, 10, 9), priority=Priority.HIGH),
]
text = json.dumps([task.to_dict() for task in tasks], indent=2)
print(text)

loaded = [Task.from_dict(data) for data in json.loads(text)]
print(loaded == tasks)  # prints: True
print(loaded[1])
```

You'll see:

```
[
  {
    "id": 1,
    "title": "Buy milk",
    "created": "2026-10-05",
    "done": false,
    "due": "2026-10-08",
    "priority": "normal"
  },
  {
    "id": 5,
    "title": "Pay rent",
    "created": "2026-10-09",
    "done": false,
    "due": null,
    "priority": "high"
  }
]
True
Task(id=5, title='Pay rent', created=datetime.date(2026, 10, 9), done=False, due=None, priority=<Priority.HIGH: 'high'>)
```

Here's how the two new methods work:

- **`to_dict`** starts from `asdict(self)`, then replaces the two dates with ISO text, the format from chapter 22. The priority needs nothing at all, because a `StrEnum` goes into JSON as plain text.
- **`from_dict`** goes the other way: `date.fromisoformat()` turns the text back into dates, and `Priority(...)` turns `"high"` back into `Priority.HIGH`. It uses `data.get("priority", "normal")`, so tasks saved before priorities existed, like chapter 26's `tasks.json`, still load with a normal priority. That was the tricky part of chapter 26's priority exercise.
- **`loaded == tasks` is `True`**: saving and loading gives back exactly the same tasks. The `__eq__` that `@dataclass` wrote compares every field.

`python -m mypy task.py` says `Success: no issues found in 1 source file`.

In chapter 26's app, `storage.py` would do the converting: `Task.from_dict` on each dictionary as it loads the file, and `task.to_dict()` on each task as it saves. The rest of the program would only ever see real `Task` objects. You'll try exactly that in the exercises.

### Dictionary, class or dataclass?

You now have three ways to keep a record together. Here's how they compare:

| | Dictionary | Class written by hand | Dataclass |
|---|---|---|---|
| Example | `{"title": "Dune", "year": 1965}` | `class Book:` with your own `__init__` | `@dataclass class Book:` with fields |
| A hint for each piece | No: `dict[str, Any]` at best | Yes | Yes |
| mypy catches misspelled names | No | Yes | Yes |
| Nice printing and `==` | Yes, built in | Only if you write `__repr__` and `__eq__` | Yes, written for you |
| Methods | No: separate functions | Yes | Yes |
| Best for | Quick, loose data, and data straight from a JSON file | Objects with rules and behaviour, like a `BankAccount` that guards its balance | Records: objects that mainly hold data |

A good rule of thumb: if a class is mostly a list of fields, make it a dataclass. If it's mostly behaviour and rules, like `BankAccount` with its protected `_balance`, write it by hand.

(You may also meet `NamedTuple`, from the `typing` module: an older cousin of the frozen dataclass, which is a tuple whose items also have names. Dataclasses can do more, so this course sticks with them.)

## Common mistakes

**1. A field without a type hint**

```python
@dataclass
class Book:
    title: str
    author = "Unknown"


print(Book("Dune"))  # prints: Book(title='Dune')
Book("Dune", "Frank Herbert")
```

```
TypeError: Book.__init__() takes 2 positional arguments but 3 were given
```

`author` didn't show up in the `__repr__`, and `__init__` has no room for it. Without a hint, `author = "Unknown"` isn't a field at all. It's a class attribute from chapter 27, which `@dataclass` ignores. (The error says "2 positional arguments" because `self` counts as one, as you saw in chapter 27.) Fix: give every field a hint, `author: str = "Unknown"`.

**2. A list (or dictionary) as a default**

```python
@dataclass
class Order:
    customer: str
    items: list[str] = []
```

```
ValueError: mutable default <class 'list'> for field items is not allowed: use default_factory
```

One list would be shared by every order. Fix: `items: list[str] = field(default_factory=list)`, with `field` imported from `dataclasses`.

**3. A field without a default after one with a default**

```python
@dataclass
class Coffee:
    size: str = "medium"
    drink: str
```

```
TypeError: non-default argument 'drink' follows default argument 'size'
```

mypy says it too: `Attributes without a default cannot follow attributes with one`. Fix: move every field that has a default below the ones that don't. That's why `Task` has `created` before `done`.

**4. Comparing a plain `Enum` with a string**

```python
size = Size.MEDIUM
if size == "M":
    print("One medium coffee")
else:
    print("That's not a medium?!")
```

```
That's not a medium?!
```

A plain `Enum` member is never equal to a string, not even to its own value, so this `if` can never be true. There's no error, and mypy says `Success` too (unless you turn on its extra `--strict-equality` check). Fix: compare members with members, `if size == Size.MEDIUM:`. If the text comes from outside, turn it into a member first with `Size(text)`. Or, if the values really are strings that you compare a lot, use a `StrEnum`.

**5. Saving a plain `Enum` to JSON**

```python
print(json.dumps({"drink": "latte", "size": Size.MEDIUM}))
```

```
TypeError: Object of type Size is not JSON serializable
```

`json` only knows strings, numbers, booleans, `None`, lists and dictionaries. Fix: save `Size.MEDIUM.value`, and turn it back into a member with `Size(...)` when you load it. Or use a `StrEnum`, which goes into JSON as plain text by itself.

**6. Changing a frozen dataclass**

```python
@dataclass(frozen=True)
class Seat:
    row: str
    number: int


seat = Seat("F", 7)
seat.number = 8
```

```
dataclasses.FrozenInstanceError: cannot assign to field 'number'
```

That's frozen doing its job. mypy warns you first: `Property "number" defined in "Seat" is read-only`. If you really want a different seat, make a new one, `Seat("F", 8)`, or copy it with `replace(seat, number=8)`. And if the objects need to change all the time, they probably shouldn't be frozen.

## Quick recap

- `@dataclass` turns a list of **fields** (`title: str`) into a class, and writes `__init__`, `__repr__` and `__eq__` for you. You can still add methods. Every field needs a hint.
- Fields with defaults go after fields without. Use `field(default_factory=list)` for an empty list.
- `@dataclass(frozen=True)` makes objects that can't change, which also makes them hashable. `order=True` makes them sortable, field by field. `__post_init__` checks the values after `__init__`.
- `asdict()` turns a dataclass into a dictionary for JSON. A `@classmethod` such as `from_dict(cls, data)` is an alternative constructor that builds an object from one.
- An **enum** is a fixed set of named choices: `class Size(Enum):`. Members have `.name` and `.value`, `Size("M")` looks one up by value (a bad value is a `ValueError`), and you can loop over them and `match` on them.
- A `StrEnum` (Python 3.11 or newer) has members that are also strings: they print as their value, equal it, and go straight into JSON. A plain `Enum` needs `.value`.

---

**Next:** try the [exercises](exercises.md), then move on to [31 Iterators and Generators](../31-iterators-and-generators/notes.md).
