# 31 Iterators and Generators

## What is it?

An **iterator** is an object that hands you values one at a time, each time you ask for the next one. A **generator** is the easiest way to make your own iterator: a function that uses `yield` to hand out a value and pause, instead of building a whole list and returning it.

You've been using iterators since [chapter 09](../09-loops/notes.md) without knowing it. Every `for` loop runs on one.

## Why does it matter?

Say you want the first three square numbers, but your code makes ten million of them first:

```python
import time

start = time.time()
squares = [n * n for n in range(10_000_000)]  # builds all 10 million first
print(squares[0], squares[1], squares[2])
print(f"List: {time.time() - start:.2f} seconds")

start = time.time()
lazy_squares = (n * n for n in range(10_000_000))  # builds nothing yet
print(next(lazy_squares), next(lazy_squares), next(lazy_squares))
print(f"Generator: {time.time() - start:.2f} seconds")
```

On the computer used to test this chapter, it printed:

```
0 1 4
List: 0.96 seconds
0 1 4
Generator: 0.00 seconds
```

(Your times will be different.) Both halves print the same three numbers. The list version makes all ten million squares, stores every one of them, and then you use three. The second version is a generator. It only makes a value when someone asks for one, so it made exactly three. Don't worry about how it works yet: that's what this chapter is for.

The big idea is: **make values on demand, not in advance.** This is called being **lazy**, and in programming that's a compliment. It solves three everyday problems:

- **Memory.** A 5 GB log file won't fit in a list. Handled one line at a time, it hardly uses any memory at all.
- **Waiting.** If you only need the first few matches, you shouldn't have to wait while the program works through everything.
- **Endless sequences.** Ticket numbers, order numbers, "every Monday from now on": they never end, so they can never be a list. But you can hand them out one at a time, for as long as someone keeps asking.

## Real-world example

Picture the "take a number" machine at a deli counter. You pull a ticket, and you get the next number. The machine doesn't print the whole day's tickets at 8 a.m. and leave a giant pile on the counter. It prints one ticket each time someone pulls. All it has to remember is which number comes next.

| Deli counter | Python |
|---|---|
| The ticket machine | An iterator |
| Pulling a ticket | `next(machine)` |
| A ticket is only printed when someone pulls it | Values are made on demand (lazily) |
| Printing the whole day's tickets in the morning | Building a full list first |
| A ticket you've pulled doesn't go back in | An iterator gets used up |
| The paper roll runs out | `StopIteration`: there are no more values |
| The machine doesn't need to know how many customers will come | A generator can go on forever |

## How it works

### Iterables and iterators

In chapter 09, you learned that **iterable** means "something a `for` loop can go through, one item at a time". Lists, tuples, strings, dictionaries, sets, ranges and files are all iterable.

An **iterator** is the thing that does the actual handing out. It gives you one item at a time, and remembers where it's up to.

Think of a book and a bookmark. The book is the iterable: it holds all the pages. The bookmark is the iterator: it remembers which page you're on. One book can have several bookmarks in it (Maya's and Leo's) at different pages, and moving a bookmark doesn't change the book.

### `iter()` and `next()`

Two built-in functions let you work an iterator by hand:

- `iter(something)` gets a new iterator from an iterable. ("Give me a bookmark for this book.")
- `next(iterator)` gets the next item. ("Turn the page.")

```python
tickets = ["A1", "A2", "A3"]
machine = iter(tickets)

print(next(machine))  # prints: A1
print(next(machine))  # prints: A2
print(next(machine))  # prints: A3
print(next(machine))
```

The first three calls hand out the tickets in order. The fourth one crashes, with a traceback that ends in:

```
StopIteration
```

When there's nothing left, `next()` raises a **`StopIteration`** exception. It isn't really a mistake: it's how an iterator says "that's everything". (It has no message, so the last line is just its name.)

Often you'd rather get a default value than an exception. Give `next()` a second argument, and it hands that back once the iterator is used up:

```python
queue = iter(["Maya", "Leo"])
print(next(queue, "nobody"))  # prints: Maya
print(next(queue, "nobody"))  # prints: Leo
print(next(queue, "nobody"))  # prints: nobody
```

Every call to `iter()` gives you a new, separate iterator, like a second bookmark in the same book. If Maya and Leo each get one with `iter(tickets)`, moving Maya's doesn't move Leo's, and the list itself never changes.

### What a `for` loop really does

Here's a normal loop, and then the same loop written out the long way, with `iter()` and `next()`:

```python
tickets = ["A1", "A2", "A3"]

for ticket in tickets:
    print(f"Now serving {ticket}")

print("---")

machine = iter(tickets)
while True:
    try:
        ticket = next(machine)
    except StopIteration:
        break
    print(f"Now serving {ticket}")
```

Both halves print the same three lines, `Now serving A1` to `Now serving A3`. Every `for` loop does exactly this behind the scenes:

1. It calls `iter()` on whatever you're looping over, to get an iterator.
2. It calls `next()` on that iterator, again and again, and runs the loop body with each item.
3. When `next()` raises `StopIteration`, the loop quietly stops.

That's a `while True` loop from chapter 09 with a `try`/`except` from [chapter 18](../18-error-handling/notes.md). You'll never write the long version in real code, but now you know there's no magic in a `for` loop.

It also explains something surprising. A `for` loop over an iterator picks up wherever that iterator already is:

```python
queue = ["Maya", "Leo", "Zoe", "Sam"]
customers = iter(queue)

first = next(customers)
print(f"Serving {first} first")

for name in customers:
    print(f"Then {name}")
```

You'll see:

```
Serving Maya first
Then Leo
Then Zoe
Then Sam
```

The loop didn't start again at Maya, because the iterator had already handed her out.

### Iterators get used up

You can loop over a list as many times as you like, because every loop calls `iter()` and gets a fresh bookmark. An iterator is the bookmark itself, though. It only moves forward, and once it reaches the end, it stays there.

Some built-in functions give you an iterator, not a list. `zip()` from [chapter 12](../12-tuples-and-sets/notes.md) is one of them:

```python
names = ["Maya", "Leo", "Zoe"]
orders = [3, 1, 2]

pairs = zip(names, orders)
print(list(pairs))  # prints: [('Maya', 3), ('Leo', 1), ('Zoe', 2)]
print(list(pairs))  # prints: []
```

The first `list()` pulled every pair out of `pairs`. The second one found nothing left. There's no error, just an empty list, which is what makes this sneaky. `enumerate()` and open files work the same way: they're iterators, so they get used up too.

If you need the values more than once, turn them into a list once, with `list(...)`, and keep that list.

### Generator functions and `yield`

Now the fun part: making your own iterators. The easy way is a **generator function**: a normal `def` with `yield` inside it.

```python
from collections.abc import Iterator


def three_tickets() -> Iterator[str]:  # the hint is explained below
    yield "A1"
    yield "A2"
    yield "A3"


machine = three_tickets()
print(machine)
print(next(machine))  # prints: A1
print(next(machine))  # prints: A2
print(next(machine))  # prints: A3
```

The first `print` shows something like this (the number will be different on your computer):

```
<generator object three_tickets at 0x000002554BE05A60>
```

Two surprises here:

1. **Calling `three_tickets()` didn't run its body.** It gave back a **generator object**: an iterator, ready to go, that hasn't started yet.
2. **Each `next()` ran the body only as far as the next `yield`.** `yield "A1"` handed out `"A1"`, and then the function **paused**, right there, until the next `next()`.

`yield` is like a `return` that doesn't end the function. `return` hands back a value, and the function is finished. `yield` hands back a value, and the function waits, with all its variables still in place, ready to carry on from the very next line.

### Watching a generator pause

A few prints make the pausing easy to see. Here's a ticket machine that talks:

```python
from collections.abc import Iterator


def ticket_machine(count: int) -> Iterator[int]:
    print("Machine switched on")
    for number in range(1, count + 1):
        print(f"  (printing ticket {number})")
        yield number
    print("Machine is out of paper")


machine = ticket_machine(3)
print("Nothing has happened yet")
print(f"Got ticket {next(machine)}")
print("The customer goes to the counter...")
print(f"Got ticket {next(machine)}")
print(f"Got ticket {next(machine)}")
print(next(machine, "no more tickets"))
```

You'll see:

```
Nothing has happened yet
Machine switched on
  (printing ticket 1)
Got ticket 1
The customer goes to the counter...
  (printing ticket 2)
Got ticket 2
  (printing ticket 3)
Got ticket 3
Machine is out of paper
no more tickets
```

Read the output next to the code:

- `ticket_machine(3)` printed nothing at all. The machine wasn't even switched on until the first `next()`.
- The first `next()` ran from the top of the function down to the first `yield`, and paused.
- Each later `next()` carried on from that pause, went once round the loop, and paused at `yield` again. In between, the rest of the program ran normally ("The customer goes to the counter...").
- The last `next()` carried on after the loop, printed "out of paper", and reached the end of the function. The end of a generator function means "no more values", so `next()` handed back the default.

In a `for` loop, it looks like this:

```python
for ticket in ticket_machine(3):
    print(f"Now serving number {ticket}")
```

```
Machine switched on
  (printing ticket 1)
Now serving number 1
  (printing ticket 2)
Now serving number 2
  (printing ticket 3)
Now serving number 3
Machine is out of paper
```

The loop and the generator take turns: one ticket printed, one customer served, one ticket printed, and so on. At no point is there a list of all the tickets.

### Type hints for generators

A generator function gives back a generator, which is an iterator. So its return hint is `Iterator[...]`, with the type of the values it yields inside the brackets. `Iterator[int]` means "an iterator that hands out `int`s".

`Iterator` comes from the standard library's `collections.abc` module, which holds names for kinds of collections. Its cousin **`Iterable[...]`** means "anything you can loop over", and it's the best hint for a parameter: a function that takes an `Iterable[str]` happily accepts a list, a tuple, a file or a generator of strings. You'll use both in the pipeline below.

(There's also a longer `Generator[int, None, None]` hint, for generators that do fancier tricks. `Iterator[int]` is all you need in this course.)

### A list, or one at a time?

Here's the same job done both ways: a function that builds a list and returns it, and a generator that yields each value.

```python
from collections.abc import Iterator


def even_list(limit: int) -> list[int]:
    """Build the whole list, then hand it over."""
    result = []
    for n in range(0, limit + 1, 2):
        result.append(n)
    return result


def even_gen(limit: int) -> Iterator[int]:
    """Hand the numbers out one at a time."""
    for n in range(0, limit + 1, 2):
        yield n


print(even_list(10))  # prints: [0, 2, 4, 6, 8, 10]
print(list(even_gen(10)))  # prints: [0, 2, 4, 6, 8, 10]

for n in even_gen(6):
    print(n, end=" ")  # prints: 0 2 4 6
print()
```

The generator version is shorter: no empty list, no `append`, no `return`. Each `yield` replaces an `append`. And when you do need a real list, `list(...)` collects everything the generator hands out.

A generator is a normal iterator, so everything from earlier in this chapter works on it: `next()`, `for`, `list()`, and getting used up. (`iter()` on a generator even gives back the very same object, because it already is its own bookmark.)

### Generator expressions, revisited

[Chapter 15](../15-comprehensions/notes.md) gave you a peek: a comprehension in round brackets is a **generator expression**. Now you know what that means. It's a quick way to write a small generator, without a `def`:

```python
squares_list = [n * n for n in range(1, 6)]
squares_gen = (n * n for n in range(1, 6))

print(squares_list)  # prints: [1, 4, 9, 16, 25]
print(squares_gen)  # prints something like: <generator object <genexpr> at 0x0000023AC113B850>
print(list(squares_gen))  # prints: [1, 4, 9, 16, 25]

total = sum(n * n for n in range(1, 6))
print(total)  # prints: 55
```

The square brackets build all five squares straight away. The round brackets build nothing yet: they make a generator that will work out each square when it's asked for it.

When a generator expression is the only thing inside a function call, you can leave out its own brackets, which is why `sum(n * n for n in range(1, 6))` works. `sum`, `min`, `max`, `sorted`, `list`, `set` and `", ".join(...)` all accept one:

```python
prices = [350, 1299, 275, 4500, 899]  # cents

print(max(p for p in prices if p < 1000))  # prints: 899
print(", ".join(f"${p / 100:.2f}" for p in prices))
# prints: $3.50, $12.99, $2.75, $45.00, $8.99
```

Here's a really handy trick: `next()` with a generator expression finds the **first** match, and stops looking:

```python
orders = [("Maya", 1850), ("Leo", 12500), ("Zoe", 300), ("Sam", 21000)]

first_big = next((name for name, cents in orders if cents > 10000), None)
print(first_big)  # prints: Leo

nobody = next((name for name, cents in orders if cents > 99999), None)
print(nobody)  # prints: None
```

It finds Leo's order and stops. It never even looks at Sam's. Chapter 15 said "find the first match and stop" needs a loop with `break`. This does the same job in one line, and the `None` is the default for when nothing matches. (The generator expression needs its own brackets here, because `next()` has a second argument.)

### How much memory does it save?

The `sys` module's `getsizeof()` function tells you roughly how many bytes an object takes up in your computer's memory. Compare a list of a million squares with a generator for the same squares:

```python
import sys

big_list = [n * n for n in range(1_000_000)]
big_gen = (n * n for n in range(1_000_000))

print(f"List:      {sys.getsizeof(big_list):,} bytes")
print(f"Generator: {sys.getsizeof(big_gen):,} bytes")

print(sum(big_gen) == sum(big_list))  # prints: True
```

On the computer used to test this chapter (Python 3.13):

```
List:      8,448,728 bytes
Generator: 200 bytes
True
```

About 8 MB against 200 bytes, for the same total. The list keeps every value. The generator only keeps its place, so it stays the same tiny size whether it will hand out ten values or ten billion. (Your numbers may be a little different, depending on your Python version and computer. And the list's number doesn't even include the million numbers stored inside it, which take up more room again. The gap is always huge.)

A good rule of thumb: if you need the values **once, in order** (to add them up, find the biggest, write them to a file), use a generator. If you need them more than once, by position (`items[3]`), or with `len()`, use a list.

### A pipeline: reading a big log file lazily

Here's where generators really shine. In [chapter 20](../20-files-and-folders/notes.md), you saw that looping over a file reads one line at a time, which works even for huge files. An open file is an iterator. So you can feed it into generators, and feed those into more generators, like stations on an assembly line. Each station handles one item, passes it on, and waits for the next.

Save these lines as `shop.log` (the blank line in the middle is on purpose):

```
2026-10-12 09:00:01 INFO Shop opened
2026-10-12 09:03:17 INFO Order 101 paid: 1850 cents
2026-10-12 09:04:02 ERROR Payment declined for order 102

2026-10-12 09:10:45 INFO Order 103 paid: 499 cents
2026-10-12 09:12:09 WARNING Only 2 croissants left
2026-10-12 09:15:30 ERROR Receipt printer offline
2026-10-12 09:20:11 INFO Order 104 paid: 1200 cents
2026-10-12 09:31:58 ERROR Payment declined for order 105
```

Then save this next to it, as `errors.py`:

```python
from collections.abc import Iterable, Iterator
from pathlib import Path

LOG_FILE = Path(__file__).parent / "shop.log"


def read_lines(path: Path) -> Iterator[str]:
    """Hand out the file's lines one at a time, without blank lines."""
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                yield line


def only_errors(lines: Iterable[str]) -> Iterator[str]:
    """Let through only the ERROR lines."""
    for line in lines:
        if " ERROR " in line:
            yield line


def parse_entries(lines: Iterable[str]) -> Iterator[tuple[str, str]]:
    """Turn each line into a (time, message) pair."""
    for line in lines:
        day, time, level, message = line.split(" ", 3)
        yield time, message


lines = read_lines(LOG_FILE)
errors = only_errors(lines)
entries = parse_entries(errors)

for time, message in entries:
    print(f"{time}  {message}")
```

You'll see:

```
09:04:02  Payment declined for order 102
09:15:30  Receipt printer offline
09:31:58  Payment declined for order 105
```

Three small generators, each with one job:

| Station | Takes | Hands on |
|---|---|---|
| `read_lines` | a file path | each non-empty line, stripped |
| `only_errors` | lines | only the lines with ` ERROR ` in them |
| `parse_entries` | lines | a `(time, message)` tuple for each one |

(`line.split(" ", 3)` splits at the first three spaces only, so the message keeps the spaces inside it. `Path(__file__).parent` finds `shop.log` next to the script, as in [chapter 26](../26-project-todo-app/notes.md).)

The three lines that build the pipeline don't read anything. They just connect the stations. The work only starts when the `for` loop asks `parse_entries` for its first entry. It asks `only_errors`, which asks `read_lines`, which reads one line from the file. The line travels along until it's printed or thrown away, and then the next one starts.

You can see that for yourself. Add one line to `read_lines`, so it reports every line it reads, and ask for only the first error:

```python
def read_lines(path: Path) -> Iterator[str]:
    """Hand out the file's lines one at a time, without blank lines."""
    with open(path, encoding="utf-8") as f:
        for number, line in enumerate(f, start=1):
            print(f"  (reading line {number})")
            line = line.strip()
            if line:
                yield line


entries = parse_entries(only_errors(read_lines(LOG_FILE)))
print(next(entries))
```

You'll see:

```
  (reading line 1)
  (reading line 2)
  (reading line 3)
('09:04:02', 'Payment declined for order 102')
```

The first error is on line 3, so only three lines were read. The rest of the file was never touched. With a log of 50 million lines, that's the difference between an instant answer and a long wait. And the full pipeline never holds more than one line in memory at a time, however big the file is.

For a quick count, a generator expression on top of `read_lines` is enough:

```python
error_count = sum(1 for line in read_lines(LOG_FILE) if " ERROR " in line)
print(error_count)  # prints: 3
```

> **Tip:** The file stays open while the generator is paused at a `yield`, and `with` closes it when the generator finishes. If you stop early, like with `next(entries)` above, Python closes the file when the paused generator is thrown away. That's fine for scripts like this one. [Chapter 33](../33-context-managers/notes.md) looks at `with` much more closely.

### Endless generators

A generator doesn't have to end. Here's the deli's ticket machine, for real this time:

```python
from collections.abc import Iterator


def ticket_numbers(start: int = 1) -> Iterator[int]:
    """Hand out ticket numbers forever: start, start + 1, start + 2, ..."""
    number = start
    while True:
        yield number
        number += 1


machine = ticket_numbers(41)
print(next(machine))  # prints: 41
print(next(machine))  # prints: 42

for ticket in ticket_numbers():
    if ticket > 3:
        break
    print(f"Ticket {ticket}")
```

You'll see:

```
41
42
Ticket 1
Ticket 2
Ticket 3
```

In chapter 09, a `while True` loop with no `break` was a bug that froze your program. Inside a generator it's fine, because the function pauses at every `yield`. It only works out the next number when someone asks for it.

> **Watch out:** Never call `list()` on an endless generator. `list(ticket_numbers())` tries to collect every number there is, and never finishes. (Press `Ctrl + C` to stop it, like in chapter 09.) Take only as many as you need: with `next()`, with a loop that has a `break`, or with `islice`, coming up next.

### `itertools`: ready-made iterator tools

You met the `itertools` module in [chapter 19](../19-modules-and-standard-library/notes.md), with `combinations`. It's full of tools that take iterators and give back new ones. Here are four of the most useful:

```python
from itertools import batched, chain, count, islice

# count: an endless counter, like the ticket machine
machine = count(101)
print(next(machine))  # prints: 101
print(next(machine))  # prints: 102

# islice: take just a slice of any iterator
print(list(islice(count(1), 5)))  # prints: [1, 2, 3, 4, 5]
print(list(islice("ABCDEFG", 2, 5)))  # prints: ['C', 'D', 'E']

# chain: one after another
morning = ["latte", "tea"]
afternoon = ["mocha", "juice", "tea"]
for drink in chain(morning, afternoon):
    print(drink, end=" ")  # prints: latte tea mocha juice tea
print()

# batched: groups of a fixed size (Python 3.12+)
guests = ["Maya", "Leo", "Zoe", "Priya", "Sam", "Aisha", "Tom"]
for table in batched(guests, 3):
    print(table)
```

The last loop prints:

```
('Maya', 'Leo', 'Zoe')
('Priya', 'Sam', 'Aisha')
('Tom',)
```

| Tool | What it does | Everyday example |
|---|---|---|
| `count(start)` | Counts up forever: start, start + 1, ... | The deli ticket machine |
| `islice(it, stop)` or `islice(it, start, stop)` | Like slicing with `[start:stop]`, but for any iterator, even an endless one | "Just the first five, please" |
| `chain(a, b, ...)` | Goes through `a`, then `b`, and so on, as if they were one | Morning orders, then afternoon orders |
| `batched(it, n)` | Groups items into tuples of `n`. The last group can be smaller. Needs Python 3.12 or newer. | Seating guests at tables of 3 |

They all work lazily, so they're happy with huge or endless inputs. `islice` is the safe way to take a few values from an endless generator: `list(islice(ticket_numbers(), 3))` gives `[1, 2, 3]`.

### `yield from`: handing on another iterable

Sometimes a generator just wants to hand out everything from another list, or another generator. `yield from` does that in one line:

```python
from collections.abc import Iterator

MORNING = ["latte", "tea"]
AFTERNOON = ["mocha", "juice"]


def todays_orders() -> Iterator[str]:
    yield from MORNING  # same as: for drink in MORNING: yield drink
    yield from AFTERNOON
    yield "staff coffee"


print(list(todays_orders()))
# prints: ['latte', 'tea', 'mocha', 'juice', 'staff coffee']
```

`yield from MORNING` means "yield each item of `MORNING`, one at a time". It's just a shorter way to write that `for` loop, and you can mix it with normal `yield` lines.

### Making your own class iterable: `__iter__`

In [chapter 29](../29-dunder-methods/notes.md), the `Playlist` class learned `len()`, `in` and `[0]`. A `for` loop over it worked too, but only by an old fallback through `__getitem__` that mypy refuses. A plain class with none of those methods can't be looped over at all: `for song in road_trip:` fails with `TypeError: 'Playlist' object is not iterable`.

The proper fix is the dunder method that `for` calls: **`__iter__`**. It must return an iterator, and the easiest way to do that is to write it as a generator:

```python
from collections.abc import Iterator
from itertools import islice


class Playlist:
    """A named list of songs."""

    def __init__(self, name: str, songs: list[str]) -> None:
        self.name = name
        self.songs = songs

    def __len__(self) -> int:
        return len(self.songs)

    def __iter__(self) -> Iterator[str]:
        for song in self.songs:
            yield song

    def on_repeat(self) -> Iterator[str]:
        """Play the songs in order, then start again, forever."""
        while True:
            yield from self.songs


road_trip = Playlist("Road trip", ["Africa", "Yellow", "Dancing Queen", "Wonderwall"])

for song in road_trip:
    print(f"Now playing: {song}")

print(list(road_trip))  # prints: ['Africa', 'Yellow', 'Dancing Queen', 'Wonderwall']
print(sorted(road_trip))  # prints: ['Africa', 'Dancing Queen', 'Wonderwall', 'Yellow']
print(list(islice(road_trip.on_repeat(), 6)))
# prints: ['Africa', 'Yellow', 'Dancing Queen', 'Wonderwall', 'Africa', 'Yellow']
```

The loop prints:

```
Now playing: Africa
Now playing: Yellow
Now playing: Dancing Queen
Now playing: Wonderwall
```

Now the playlist works everywhere Python wants something iterable: `for` loops, `list()`, `sorted()`, `sum()`, generator expressions, unpacking. And mypy is happy with it, because `__iter__` is the proper way.

Why can you loop over `road_trip` again and again, when a generator can only be used once? Because every `for` loop calls `__iter__` again, and gets a brand-new generator. The playlist is the book. Each generator from `__iter__` is a new bookmark.

`on_repeat` is an ordinary generator method: an endless one, built with `yield from`. A class can have as many of these as you like, each one handing out its items in a different way.

> **Tip:** `__iter__` could also be the single line `return iter(self.songs)`, which hands out the list's own iterator. The generator version is just as short with `yield from self.songs`, and it lets you add your own logic later, like skipping songs or changing the order.

### The long way: an iterator class with `__next__`

Before generators existed, you made an iterator by writing a class with two dunder methods: `__iter__`, which returns the iterator itself, and `__next__`, which returns the next value or raises `StopIteration`. Here's a countdown, written that way and as a generator:

```python
from collections.abc import Iterator


class Countdown:
    """An iterator written by hand: 3, 2, 1."""

    def __init__(self, start: int) -> None:
        self.current = start

    def __iter__(self) -> Iterator[int]:
        return self

    def __next__(self) -> int:
        if self.current <= 0:
            raise StopIteration
        value = self.current
        self.current -= 1
        return value


def countdown(start: int) -> Iterator[int]:
    """The same thing as a generator."""
    while start > 0:
        yield start
        start -= 1


print(list(Countdown(3)))  # prints: [3, 2, 1]
print(list(countdown(3)))  # prints: [3, 2, 1]
```

Same result. But the class has to remember where it's up to in an attribute, and raise `StopIteration` by hand. The generator gets both for free: its variables stay alive while it's paused, and finishing the function raises `StopIteration` for you. `next(x)` simply calls `x.__next__()`, and a generator writes that method for you.

You'll see the class version in older code and inside libraries, so it's good to recognise. For your own code, write a generator.

> **Tip:** If you did the [JavaScript course](../../JavaScript/36-iterators-and-generators/notes.md), this is the same idea as JavaScript's iterators and `function*` generators. Python's `next()` gives you the value directly instead of a `{ value, done }` object, and signals the end with `StopIteration`.

## Common mistakes

**1. Looping over a generator twice**

```python
prices = [350, 1299, 275]
cheap = (p for p in prices if p < 1000)

print(f"Cheapest: {min(cheap)}")
print(f"Most expensive cheap item: {max(cheap)}")
```

The first line prints `Cheapest: 275`, then the second crashes:

```
ValueError: max() iterable argument is empty
```

`min()` used the generator up, so `max()` got nothing. Some functions don't even complain: `sum()` of a used-up generator is just `0`, which gives you a wrong answer with no warning. Fix: if you need the values more than once, make a list (`cheap = [p for p in prices if p < 1000]`), or make a fresh generator each time.

**2. Calling `next()` on a list**

```python
queue = ["Maya", "Leo", "Zoe"]
print(next(queue))
```

```
TypeError: 'list' object is not an iterator
```

A list is iterable (a book), but it isn't an iterator (a bookmark). It doesn't remember a position, so there's no "next". Fix: get an iterator first, and keep it in a variable: `customers = iter(queue)`, then `next(customers)`.

**3. Printing a generator**

```python
squares = (n * n for n in range(5))
print(squares)
```

```
<generator object <genexpr> at 0x000001F8F5194EE0>
```

A generator hasn't made its values yet, so there's nothing to show except the object itself. Fix: loop over it, or collect the values with `print(list(squares))`, which prints `[0, 1, 4, 9, 16]`.

**4. Using `len()` or `[0]` on a generator**

```python
squares = (n * n for n in range(5))
print(len(squares))
```

```
TypeError: object of type 'generator' has no len()
```

And `squares[0]` gives `TypeError: 'generator' object is not subscriptable`. A generator doesn't know how many values it will hand out (it might be endless), and it can't jump to a position. Fix: if you need a length or positions, use a list. For "the first one" use `next(squares)`, and for "the first few" use `islice`.

**5. `return` instead of `yield`**

```python
def even_numbers(numbers: list[int]):
    for n in numbers:
        if n % 2 == 0:
            return n


print(even_numbers([1, 2, 3, 4, 6]))  # prints: 2
for n in even_numbers([1, 2, 3, 4, 6]):
    print(n)
```

```
TypeError: 'int' object is not iterable
```

`return` ends the function at the first even number, so you get the plain number `2`, not a generator, and you can't loop over a number. Fix: change `return n` to `yield n`. If the function has an honest hint, `-> Iterator[int]`, mypy catches this before you run anything: `Incompatible return value type (got "int", expected "Iterator[int]")`.

## Quick recap

- An **iterable** is anything a `for` loop can go through. An **iterator** hands out its items one at a time with `next()`, and raises `StopIteration` when it's done. `iter(x)` gets an iterator from an iterable, and `next(it, default)` gives a default instead of the exception.
- A `for` loop is just `iter()`, then `next()` again and again until `StopIteration`.
- Iterators get used up. `zip()`, `enumerate()`, files and generators only work once. Make a list if you need the values twice.
- `yield` turns a function into a **generator**: it hands out a value and pauses until the next one is asked for. Hint it as `-> Iterator[int]`, and use `Iterable[...]` for parameters.
- A generator expression `(x * x for x in items)` is a lazy comprehension. `sum(...)`, `max(...)` and `next((... for ...), None)` work nicely with it, and it takes almost no memory.
- Generators connect into pipelines that handle huge files one line at a time. `itertools` adds `count`, `islice`, `chain` and `batched`, and `yield from` hands on another iterable's items.
- Give a class an `__iter__` method written as a generator, and it works in `for` loops, `list()`, `sorted()` and the rest.

---

**Next:** try the [exercises](exercises.md), then move on to [32 Decorators](../32-decorators/notes.md).
