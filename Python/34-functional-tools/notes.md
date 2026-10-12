# 34 Functional Tools

## What is it?

This chapter is a toolbox of small tools that all work the same way: **you hand them a function**, and they use it on your data.

- `sorted(..., key=...)` asks: "what should I look at on each item?"
- `map()` asks: "what should I do to each item?"
- `filter()` asks: "which items should I keep?"

Along the way you'll meet `lambda`, a way to write a tiny function right where you need it, and the `functools` module, which includes a decorator that makes a slow function remember its answers.

Passing functions to other functions like this is the heart of a style called **functional programming**. You saw in [chapter 32](../32-decorators/notes.md) that a function is a value you can pass around. This chapter puts that to everyday use.

## Why does it matter?

Here are three problems from earlier chapters.

**1. Sorting things that aren't plain numbers or text.** A cafe has a list of orders, and wants them from cheapest to most expensive:

```python
orders = [{"item": "latte", "price": 350}, {"item": "tea", "price": 225}]
print(sorted(orders))
```

```
TypeError: '<' not supported between instances of 'dict' and 'dict'
```

Python has no idea how to put one dictionary before another. Should it look at the item? The price? In [chapter 26's exercises](../26-project-todo-app/exercises.md), you got around this by building tuples by hand and sorting those. It worked, but it took a whole loop.

**2. Finding *which one* is the biggest.** `max()` tells you the hottest temperature was 27 degrees. But which **day** was it? [Chapter 11](../11-lists/notes.md) needed a loop for that.

**3. A slow function.** The recursive `fib` from [chapter 17](../17-recursion/notes.md) took about two seconds for `fib(35)` on the computer used to test this chapter, because it works out the same answers again and again.

In this chapter, each of these becomes a single short line.

## Real-world example

Imagine you've got a big pile of recipe cards, and a friend offers to sort them for you. You don't explain *how* to sort (which card to pick up first, where to slot it in). You just say **what to look at**: "Sort them by cooking time." Your friend glances at the cooking time on each card, and does the rest.

| Sorting recipe cards | Python |
|---|---|
| The pile of cards | A list |
| Your friend, who does the sorting | `sorted()` |
| "Look at the cooking time on each card" | `key=`: a function that picks the cooking time out of one card |
| "Longest first, please" | `reverse=True` |
| "If two take the same time, go alphabetical" | A tuple as the key, for breaking ties |
| A sticky note where you jot down answers you've already worked out | `@cache` |

## How it works

### `key=`: tell `sorted` what to look at

Normally, `sorted()` compares the items themselves. Words are sorted alphabetically:

```python
words = ["banana", "fig", "cherry", "kiwi", "apple"]
print(sorted(words))  # prints: ['apple', 'banana', 'cherry', 'fig', 'kiwi']
```

Give it a **key function**, and it sorts by what that function says about each item instead. Here, `len`, so the words are sorted by their length:

```python
print(sorted(words, key=len))  # prints: ['fig', 'kiwi', 'apple', 'banana', 'cherry']
```

Behind the scenes, `sorted()` calls `len()` once on every word, and sorts by the answers. These are the numbers it compares:

```python
print([len(word) for word in words])  # prints: [6, 3, 6, 4, 5]
```

The words themselves come out the other end unchanged. The key only decides the **order**.

Notice that it's `key=len`, with no brackets. You're not calling `len` yourself. You're handing the function over, so `sorted()` can call it for you, once per item. (Common mistake 2 shows what happens with brackets.)

Any function that takes one item works as a key. Remember from chapter 11 that every capital letter sorts before every small letter? `str.lower` fixes that, by making `sorted()` compare the small-letter version of each name:

```python
names = ["maya", "Leo", "zoe", "Aisha", "Sam", "priya"]
print(sorted(names))
# prints: ['Aisha', 'Leo', 'Sam', 'maya', 'priya', 'zoe']
print(sorted(names, key=str.lower))
# prints: ['Aisha', 'Leo', 'maya', 'priya', 'Sam', 'zoe']
```

`str.lower` is the `lower` method, reached through its class. `str.lower("Leo")` gives `'leo'`, exactly like `"Leo".lower()`.

### Your own key function

When no built-in function picks out what you want, write your own. Here's a cafe menu, and you'd like it sorted by price. A dictionary's `.items()` gives you `(name, price)` pairs ([chapter 13](../13-dictionaries/notes.md)), and sorting those normally goes by the name, since tuples compare their first items first ([chapter 12](../12-tuples-and-sets/notes.md)):

```python
menu = {"latte": 350, "tea": 225, "mocha": 400, "muffin": 300}
print(sorted(menu.items()))
# prints: [('latte', 350), ('mocha', 400), ('muffin', 300), ('tea', 225)]
```

So write a function that takes **one** pair and returns the thing to sort by:

```python
def price_of(item: tuple[str, int]) -> int:
    """Pick the price out of one (name, price) pair."""
    return item[1]


print(price_of(("latte", 350)))  # prints: 350

for name, price in sorted(menu.items(), key=price_of):
    print(f"{name:<8}${price / 100:.2f}")
```

You'll see:

```
tea     $2.25
muffin  $3.00
latte   $3.50
mocha   $4.00
```

That's how you **sort a dictionary by its values**. If you want a dictionary back, wrap the result in `dict(...)`: dictionaries remember the order you put things in.

### `lambda`: a function without a name

`price_of` is a whole function, with a name, a docstring and a `return`, just to say "the second item, please". For tiny jobs like that, Python has a shortcut.

A **lambda** is a small function with no name, written in one line:

```python
print(sorted(menu.items(), key=lambda item: item[1]))
# prints: [('tea', 225), ('muffin', 300), ('latte', 350), ('mocha', 400)]
```

Read `lambda item: item[1]` as "a function that takes `item`, and gives back `item[1]`". It does exactly the same job as `price_of`:

| `def` | `lambda` |
|---|---|
| `def price_of(item):` | `lambda item:` |
| `    return item[1]` | `item[1]` |
| Has a name | Has no name |
| Can have many lines | Just one expression |
| Has `return` | Gives back its expression automatically, no `return` |

(The name comes from a branch of maths called the lambda calculus. You don't need to know anything about it.)

A lambda can only hold one **expression**: something that gives a value, like `item[1]` or `price * 2`. It can't hold statements like `if` blocks, loops or assignments. And lambdas can't have type hints. That's fine: mypy works out the types from where the lambda is used. Here it knows `item` is one of the menu's `(str, int)` pairs.

So when should you use which?

- **Use a lambda** for a tiny, throwaway function that's passed straight into something else, like a `key=`.
- **Use `def`** when the function needs more than one simple expression, when you'll use it in more than one place, or when a good name would make the code easier to read.

### Sorting objects by an attribute

Lambdas really shine with objects. Here are some recipe cards as a dataclass ([chapter 30](../30-dataclasses-and-enums/notes.md)):

```python
from dataclasses import dataclass


@dataclass
class Recipe:
    name: str
    minutes: int
    rating: int  # 1 to 5 stars


recipes = [
    Recipe("Lasagne", 90, 5),
    Recipe("Omelette", 10, 4),
    Recipe("Dal bhat", 45, 5),
    Recipe("Toast", 5, 3),
    Recipe("Fried rice", 20, 4),
]

for recipe in sorted(recipes, key=lambda recipe: recipe.minutes):
    print(f"{recipe.minutes:>3} min  {recipe.name}")
```

You'll see:

```
  5 min  Toast
 10 min  Omelette
 20 min  Fried rice
 45 min  Dal bhat
 90 min  Lasagne
```

That's the recipe cards from the real-world example, sorted "by cooking time".

[Chapter 29](../29-dunder-methods/notes.md) said that `__lt__` is only right for things with **one** natural order, like amounts of money. Recipes don't have one: by time? by rating? by name? A `key=` lets you pick a different order every time you sort, without touching the class.

### Biggest first, and breaking ties

`reverse=True` (from chapter 11) works with `key=` too. Here are the best-rated recipes first:

```python
for recipe in sorted(recipes, key=lambda recipe: recipe.rating, reverse=True):
    print(f"{recipe.rating} stars  {recipe.name}")
```

You'll see:

```
5 stars  Lasagne
5 stars  Dal bhat
4 stars  Omelette
4 stars  Fried rice
3 stars  Toast
```

Lasagne and Dal bhat both have 5 stars. Which should come first? It would be nice to break ties alphabetically. The trick is to make the key a **tuple**. Python compares tuples item by item: it looks at the first items, and only when they're equal does it look at the second ones.

But there's a snag: you want the rating from high to low, and the name from A to Z. `reverse=True` would flip both. So flip just the number, by making it negative:

```python
for recipe in sorted(recipes, key=lambda recipe: (-recipe.rating, recipe.name)):
    print(f"{recipe.rating} stars  {recipe.name}")
```

You'll see:

```
5 stars  Dal bhat
5 stars  Lasagne
4 stars  Fried rice
4 stars  Omelette
3 stars  Toast
```

The keys were `(-5, "Lasagne")`, `(-4, "Omelette")`, `(-5, "Dal bhat")`, and so on. Small numbers sort first, and -5 is smaller than -4, so the 5-star recipes come first. Between the two `-5`s, the names decide. (The minus trick only works on numbers. To flip a string, sort twice instead, as the next section shows.)

### Sorting is stable

Look at the 5-star list from before the tie-breaker: Lasagne came before Dal bhat, because that's the order they were in the original list. Python's sorting is **stable**: items with equal keys keep the order they had before. `sorted(words, key=len)` did the same: `banana` and `cherry` both have 6 letters, and `banana` stayed first.

That gives you another way to sort by two things: sort by the less important one first, then by the more important one. The second sort keeps the first sort's order wherever there's a tie:

```python
by_name = sorted(recipes, key=lambda recipe: recipe.name)
best_first = sorted(by_name, key=lambda recipe: recipe.rating, reverse=True)
print([recipe.name for recipe in best_first])
# prints: ['Dal bhat', 'Lasagne', 'Fried rice', 'Omelette', 'Toast']
```

Same result as the tuple key. The tuple is usually shorter, but sorting twice works for anything, including putting strings in reverse order.

### `.sort()` takes a `key` too

Everything here works with the list method `.sort()` as well, which sorts the list itself instead of making a new one (chapter 11):

```python
recipes.sort(key=lambda recipe: recipe.name)
print([recipe.name for recipe in recipes])
# prints: ['Dal bhat', 'Fried rice', 'Lasagne', 'Omelette', 'Toast']
```

### `min` and `max` with `key=`

`min()` and `max()` take a `key=` too, and they give you back the whole **item**, not just the number. That's the "which day was the hottest?" problem from chapter 11, solved:

```python
temperatures = {"Mon": 18, "Tue": 24, "Wed": 21, "Thu": 27, "Fri": 19}

hottest = max(temperatures, key=lambda day: temperatures[day])
print(f"Hottest day: {hottest}, {temperatures[hottest]} degrees")
# prints: Hottest day: Thu, 27 degrees
```

Looping over a dictionary gives its keys, the days. The `key=` says "compare the days by their temperatures", and `max()` hands back the winning day.

It works with objects too (using the same `recipes` list):

```python
quickest = min(recipes, key=lambda recipe: recipe.minutes)
print(quickest)  # prints: Recipe(name='Toast', minutes=5, rating=3)

longest_name = max(["Sandip", "Zoe", "Aisha"], key=len)
print(longest_name)  # prints: Sandip
```

When there's a tie, `min()` and `max()` give you the first one they find.

### Sorting the to-do list

Let's go back to the to-do app from chapter 26, with the `Task` dataclass and `Priority` enum from chapter 30:

```python
from dataclasses import dataclass
from datetime import date
from enum import StrEnum


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


tasks = [
    Task(1, "Buy milk", date(2026, 10, 5), due=date(2026, 10, 8)),
    Task(2, "Renew passport", date(2026, 10, 5), due=date(2029, 3, 1),
         priority=Priority.HIGH),
    Task(3, "Call grandma", date(2026, 10, 6), priority=Priority.HIGH),
    Task(4, "Water the plants", date(2026, 10, 7), due=date(2026, 10, 7),
         priority=Priority.LOW),
    Task(5, "Post the birthday card", date(2026, 10, 9), due=date(2027, 1, 15)),
]


def show(tasks: list[Task]) -> None:
    for task in tasks:
        due = task.due.isoformat() if task.due else "-"
        print(f"{task.id:>3}  {due:<10}  {task.priority:<6}  {task.title}")
```

(When a call is too long for one line, you can break it inside the brackets, and Python carries on reading on the next line.)

Sorting by title works just like the recipes: `key=lambda task: task.title.lower()`. Dates and priorities are more interesting.

**By due date.** Here's a catch: some tasks have no due date, and `None` can't be compared with a `date` (common mistake 6 shows the error). In chapter 26, you used a pretend date far in the future, `"9999-12-31"`, so those tasks came last. The `datetime` module has that date ready-made, as `date.max`:

```python
print(date.max)  # prints: 9999-12-31
show(sorted(tasks, key=lambda task: task.due or date.max))
```

```
  4  2026-10-07  low     Water the plants
  1  2026-10-08  normal  Buy milk
  5  2027-01-15  normal  Post the birthday card
  2  2029-03-01  high    Renew passport
  3  -           high    Call grandma
```

`task.due or date.max` means "the due date, or if there isn't one, the last day of the year 9999". It works because `or` doesn't just give `True` or `False`: `a or b` gives back `a` itself if `a` is truthy, and otherwise gives back `b`. A date is always truthy, and `None` is falsy ([chapter 08](../08-conditionals/notes.md)).

**By priority.** This one has a trap. A `StrEnum` compares like its text, so sorting by `task.priority` puts the priorities in **alphabetical** order:

```python
show(sorted(tasks, key=lambda task: task.priority))
```

The tasks come out as high, high, low, normal, normal. That's alphabetical, but `low` before `normal` is wrong. The fix is a small dictionary that gives each priority a rank number, and a key that looks up the rank:

```python
PRIORITY_RANK = {Priority.HIGH: 0, Priority.NORMAL: 1, Priority.LOW: 2}

show(sorted(tasks, key=lambda task: PRIORITY_RANK[task.priority]))
```

```
  2  2029-03-01  high    Renew passport
  3  -           high    Call grandma
  1  2026-10-08  normal  Buy milk
  5  2027-01-15  normal  Post the birthday card
  4  2026-10-07  low     Water the plants
```

**By priority, then due date**, with a tuple key. As a lambda, that key gets too long for one comfortable line, so this is a good moment to switch to `def` and give it a name that says what it does:

```python
def priority_then_due(task: Task) -> tuple[int, date]:
    """Sort key: most important first, then soonest due (no due date last)."""
    return (PRIORITY_RANK[task.priority], task.due or date.max)


tasks.append(Task(6, "Pay the rent", date(2026, 10, 9), due=date(2026, 10, 10),
                  priority=Priority.HIGH))
show(sorted(tasks, key=priority_then_due))
```

```
  6  2026-10-10  high    Pay the rent
  2  2029-03-01  high    Renew passport
  3  -           high    Call grandma
  1  2026-10-08  normal  Buy milk
  5  2027-01-15  normal  Post the birthday card
  4  2026-10-07  low     Water the plants
```

The new high-priority task, due tomorrow, goes straight to the top. Within each priority, the soonest due date comes first, and tasks with no due date go last.

### `map`: do the same thing to every item

`map(function, items)` calls the function on every item, and hands you the results:

```python
prices = [350, 225, 400, 300]


def add_tax(cents: int) -> int:
    return round(cents * 1.08)


with_tax = map(add_tax, prices)
print(with_tax)        # prints something like: <map object at 0x00000213A3E65C90>
print(list(with_tax))  # prints: [378, 243, 432, 324]
```

Why the strange `<map object ...>`? Because `map()` doesn't do any work straight away. It gives you an **iterator** ([chapter 31](../31-iterators-and-generators/notes.md)) that works out each result only when you ask for it. `list()` asks for all of them. That's lazy in the good way: on a huge list, nothing is done until it's needed.

But an iterator gets used up. Ask again, and there's nothing left:

```python
print(list(with_tax))  # prints: []
```

`map()` is neatest when the function already exists, like these built-in ones:

```python
names = ["maya", "leo", "zoe"]
print(list(map(str.title, names)))  # prints: ['Maya', 'Leo', 'Zoe']

numbers = list(map(int, "12 7 30".split()))
print(numbers)       # prints: [12, 7, 30]
print(sum(numbers))  # prints: 49
```

That second one is a classic: turning a line of text typed by a user into a list of numbers.

### `filter`: keep the items that pass a test

`filter(function, items)` keeps the items where the function returns something truthy, and drops the rest. Like `map()`, it gives you a lazy iterator:

```python
def is_cheap(cents: int) -> bool:
    return cents < 320


print(list(filter(is_cheap, prices)))                    # prints: [225, 300]
print(list(filter(lambda cents: cents < 320, prices)))   # prints: [225, 300]
```

A handy extra: `filter(None, items)` keeps only the truthy items. It's a quick way to drop empty strings:

```python
answers = ["Sandip", "", "Maya", "", "Leo"]
print(list(filter(None, answers)))  # prints: ['Sandip', 'Maya', 'Leo']
```

### Comprehension, or `map` and `filter`?

You already know another way to do both jobs: comprehensions, from [chapter 15](../15-comprehensions/notes.md).

```python
print([add_tax(cents) for cents in prices])         # prints: [378, 243, 432, 324]
print([cents for cents in prices if cents < 320])   # prints: [225, 300]
```

Most Python programmers find comprehensions easier to read, especially when you'd need a lambda: `[cents * 2 for cents in prices]` is clearer than `list(map(lambda cents: cents * 2, prices))`. A good rule:

- Use `map()` when you already have a function with a name: `map(int, parts)`, `map(str.title, names)`.
- Use a comprehension for everything else.

You'll see `map()` and `filter()` in other people's code (and in other languages, like JavaScript's `.map()` and `.filter()`), so it's good to know them either way.

### `any` and `all`: is it true for some, or for all?

Two more built-in functions that pair nicely with generator expressions:

- `any(...)` is `True` if **at least one** item is truthy.
- `all(...)` is `True` if **every** item is truthy.

```python
stock = {"milk": 4, "bread": 0, "eggs": 12, "butter": 2}

print(any(count == 0 for count in stock.values()))  # prints: True
print(all(count > 0 for count in stock.values()))   # prints: False
```

Read them aloud: "is any count zero?" Yes, the bread. "Are all counts above zero?" No. Each one replaces a whole loop with a flag variable.

They're great for checking a list of rules. Here's a password check:

```python
password = "Coffee4ever"
checks = [
    len(password) >= 8,
    any(ch.isdigit() for ch in password),
    any(ch.isupper() for ch in password),
]
print(checks)       # prints: [True, True, True]
print(all(checks))  # prints: True
```

Two things worth knowing:

**They stop early.** `any()` stops at the first truthy item, because the answer can't change after that. With a generator expression, the rest of the items are never even worked out:

```python
def check(n: int) -> bool:
    print(f"checking {n}")
    return n > 10


print(any(check(n) for n in [3, 15, 8, 20]))
```

You'll see:

```
checking 3
checking 15
True
```

**Empty lists give a surprise:** `any([])` is `False`, but `all([])` is `True`. Think of it this way: in an empty classroom, "all students handed in their homework" is true, because nobody failed to. If an empty list should count as a failure, check for that separately.

### `functools.reduce`: boil a list down to one value

The `functools` module (the name means "tools for functions") is part of the standard library. Its `reduce()` combines a list into a single value, two items at a time:

```python
from functools import reduce

numbers = [2, 3, 4, 5]
print(reduce(lambda a, b: a * b, numbers))  # prints: 120
```

It takes the first two items and combines them (2 x 3 = 6), then combines that answer with the next item (6 x 4 = 24), and so on (24 x 5 = 120), like a running total.

To be honest, you'll rarely need it. For most jobs there's a clearer tool: `sum()` for adding up, `max()` and `min()`, `"".join()` for joining strings, and `math.prod()` for multiplying:

```python
import math

print(math.prod(numbers))  # prints: 120
```

Reach for `reduce()` only when none of those fit. You'll still see it in other people's code, so now you can read it.

### `functools.partial`: fill in some arguments ahead of time

Say you've got a function to format prices, with the currency symbol as a parameter:

```python
from functools import partial


def format_price(cents: int, symbol: str = "$") -> str:
    return f"{symbol}{cents / 100:.2f}"


in_rupees = partial(format_price, symbol="Rs ")

print(format_price(350))  # prints: $3.50
print(in_rupees(350))     # prints: Rs 3.50
print(list(map(in_rupees, [350, 225, 400])))
# prints: ['Rs 3.50', 'Rs 2.25', 'Rs 4.00']
```

`partial(format_price, symbol="Rs ")` makes a **new function** that works like `format_price`, with `symbol="Rs "` already filled in. It's like a pre-filled form: some boxes are done, and you only fill in the rest.

You could write the same thing as `lambda cents: format_price(cents, symbol="Rs ")`. `partial` is shorter, and it's what the `make_multiplier` closure from chapter 32 does, ready-made. It's especially handy when another function wants a function that takes one argument, like `map()` here.

### `functools.cache`: never work out the same thing twice

Now let's fix the slow `fib` from chapter 17. Here it is again, with hints, and timed with `time.perf_counter()`:

```python
import time


def fib(n: int) -> int:
    if n < 2:
        return n  # base cases: fib(0) is 0, fib(1) is 1
    return fib(n - 1) + fib(n - 2)


start = time.perf_counter()
print(fib(35))
print(f"took {time.perf_counter() - start:.2f} seconds")
```

On the computer used to test this chapter, you'll see:

```
9227465
took 2.06 seconds
```

(Your time will be different.) Chapter 17 showed why: `fib(35)` works out `fib(2)` millions of times, from scratch, every time. Nobody writes the answer down.

So let's write the answers down. Add one import and one line:

```python
import time
from functools import cache


@cache
def fib(n: int) -> int:
    if n < 2:
        return n  # base cases: fib(0) is 0, fib(1) is 1
    return fib(n - 1) + fib(n - 2)


start = time.perf_counter()
print(fib(35))
print(f"took {time.perf_counter() - start:.6f} seconds")
```

You'll see something like:

```
9227465
took 0.000071 seconds
```

From about two seconds to well under a thousandth of a second. `fib(100)` is instant too, and it would take the old version longer than you'll live.

`@cache` is a decorator, like the ones you wrote in chapter 32. It wraps `fib` with a **cache**: a little notebook of answers. Each time `fib` is called, the wrapper checks the notebook first. If it has seen this `n` before, it gives back the saved answer straight away, without running `fib` at all. If not, it runs `fib`, writes the answer down, and then gives it back. So every `fib(n)` is worked out only **once**. Saving answers like this is called **caching**, or **memoization** (making a memo, a note to yourself).

You can peek into the notebook with `.cache_info()`:

```python
print(fib.cache_info())
# prints: CacheInfo(hits=33, misses=36, maxsize=None, currsize=36)
```

| Field | Means |
|---|---|
| `hits` | How many times the answer was already in the notebook |
| `misses` | How many times it wasn't, so `fib` really had to run |
| `maxsize` | The most answers it will keep. `None` means no limit |
| `currsize` | How many answers it's holding right now |

36 misses: one for each `n` from 0 to 35. Compare that with the millions of calls in chapter 17. And `fib.cache_clear()` empties the notebook, if you ever need a fresh start.

> **Watch out:** A cache makes recursion fast, but not shallow. Called on a fresh cache, `fib(1000)` still needs about a thousand calls waiting on top of each other, and gives `RecursionError: maximum recursion depth exceeded` (chapter 17). For really big numbers, the loop version from chapter 17 is still the right tool.

### `lru_cache`: a cache with a size limit

`@cache` never forgets anything. For `fib`, that's fine. But imagine a function that looks things up for thousands of different inputs: the notebook could grow until it uses up lots of memory.

`@lru_cache(maxsize=...)` keeps at most that many answers. When it's full, it throws away the answer that was used **least recently**. That's what **LRU** stands for: "least recently used". It's like a desk with room for only a few books: when you need a new one, the book you haven't touched for longest goes back on the shelf.

```python
from functools import lru_cache


@lru_cache(maxsize=2)
def delivery_fee(postcode: str) -> int:
    """Pretend this asks a courier's website, which is slow."""
    print(f"  (asking the courier about {postcode}...)")
    return 500 if postcode.startswith("K") else 300


for postcode in ["KT1", "SW1", "KT1", "N1", "SW1"]:
    print(f"{postcode}: {delivery_fee(postcode)} cents")

print(delivery_fee.cache_info())
```

You'll see:

```
  (asking the courier about KT1...)
KT1: 500 cents
  (asking the courier about SW1...)
SW1: 300 cents
KT1: 500 cents
  (asking the courier about N1...)
N1: 300 cents
  (asking the courier about SW1...)
SW1: 300 cents
CacheInfo(hits=1, misses=4, maxsize=2, currsize=2)
```

The second `KT1` came from the cache (no "asking" line). When `N1` arrived, the cache was full, so it dropped `SW1`, the one used least recently. That's why the last `SW1` had to ask again.

`@cache` is the same as `@lru_cache(maxsize=None)`, just shorter. It was added in Python 3.9, so in older code you'll see `@lru_cache(maxsize=None)`, or `@lru_cache` on its own, which keeps 128 answers.

### When is caching safe?

A cache gives back an old answer without running the function. So only cache a function when that's always correct:

- **The same inputs always give the same output.** `fib(35)` is always 9227465. But a function that uses today's date, a random number, or a file that might change would give stale, out-of-date answers.
- **It doesn't need to *do* anything each time.** A function that prints, saves a file or sends an email would only do it the first time. (That's why `delivery_fee` printed only on the misses.)
- **Its arguments can be dictionary keys.** The cache is a dictionary underneath, with the arguments as the key. So they have to be **hashable**: numbers, strings, tuples, but not lists or dictionaries ([chapter 13](../13-dictionaries/notes.md)). Common mistake 7 shows the error.

### `operator.itemgetter` and `attrgetter`

Lambdas like `lambda item: item[1]` and `lambda recipe: recipe.minutes` are so common that the standard library's `operator` module has ready-made versions:

```python
from operator import attrgetter, itemgetter

print(sorted(menu.items(), key=itemgetter(1)))
# prints: [('tea', 225), ('muffin', 300), ('latte', 350), ('mocha', 400)]

by_time = sorted(recipes, key=attrgetter("minutes"))
print([recipe.name for recipe in by_time])
# prints: ['Toast', 'Omelette', 'Fried rice', 'Dal bhat', 'Lasagne']
```

`itemgetter(1)` makes a function that does `thing[1]`, and `attrgetter("minutes")` makes one that does `thing.minutes`. Give them several names, and they return a tuple, ready for tie-breaking: `itemgetter(1, 0)` is `lambda item: (item[1], item[0])`.

Use whichever you find clearer. Many people stick with lambdas, which work for everything. Just recognise these when you see them.

## Common mistakes

**1. `names = names.sort(key=len)`**

```python
names = ["Priya", "Sam", "Aisha"]
names = names.sort(key=len)
print(names)  # prints: None
print(names[0])
```

```
TypeError: 'NoneType' object is not subscriptable
```

You met this in chapter 11, and a `key=` doesn't change it. `.sort()` sorts the list in place and returns `None`, so the assignment throws your list away. Fix: `names.sort(key=len)` on its own line, or `names = sorted(names, key=len)`. (mypy catches it too: `Incompatible types in assignment (expression has type "None", variable has type "list[str]")`.)

**2. Brackets after the key function**

```python
names = ["Priya", "Sam", "Aisha"]
print(sorted(names, key=len()))
```

```
TypeError: len() takes exactly one argument (0 given)
```

`len()` with brackets **calls** `len` right now, with nothing to measure, before `sorted()` even starts. You want to hand the function over, not call it: `key=len`. The same goes for your own functions: `key=price_of`, not `key=price_of()`.

**3. Printing a `map` (or `filter`) and getting gibberish**

```python
prices = [350, 225, 400]
print(map(lambda cents: cents / 100, prices))
```

```
<map object at 0x000001E4400F4AF0>
```

`map()` gives you a lazy iterator, not a list, and printing an iterator shows what it is, not what's in it. Fix: `print(list(map(...)))`. Or use a list comprehension, which gives you a real list straight away.

**4. Using a `map` or `filter` twice**

```python
prices = [350, 225, 400]
cheap = filter(lambda cents: cents < 360, prices)
print(f"{len(list(cheap))} cheap items")
for cents in cheap:
    print(cents)
print("done")
```

You'll see:

```
2 cheap items
done
```

The `for` loop printed nothing! `list(cheap)` used the iterator up, and a used-up iterator stays empty, with no error to warn you (chapter 31). Fix: if you need the results more than once, turn them into a list once, and keep that: `cheap = list(filter(...))`.

**5. Giving a lambda a name**

```python
double = lambda n: n * 2
print(double(21))        # prints: 42
print(double.__name__)   # prints: <lambda>
print(double("x", 3))
```

```
TypeError: <lambda>() takes 1 positional argument but 2 were given
```

It works, but the whole point of a lambda is that it has no name. Once you write `double = ...`, you've made a normal function the awkward way. It can't have hints or a docstring, and error messages say `<lambda>` instead of `double`, so in a big program you can't tell which lambda broke. PEP 8 says: use `def` when you want a name. With `def double(n: int) -> int:`, the same error says `double() takes 1 positional argument but 2 were given`.

**6. Sorting values that can't be compared**

```python
show(sorted(tasks, key=lambda task: task.due))
```

```
TypeError: '<' not supported between instances of 'NoneType' and 'datetime.date'
```

Task 3 has no due date, so its key is `None`, and Python can't say whether `None` comes before or after a date. It's the same as `sorted([350, "free", 225])` failing, from chapter 11: every key must be comparable with every other key. Fix: make sure the key never gives a mix, for example with `task.due or date.max`. mypy spots this one before you run anything, with a long message that starts `Argument "key" to "sorted" has incompatible type "Callable[[Task], date | None]"`. The important part is the `date | None` at the end.

**7. Caching a function that takes a list**

```python
from functools import cache


@cache
def basket_total(prices: list[int]) -> int:
    return sum(prices)


print(basket_total([350, 225, 400]))
```

```
TypeError: unhashable type: 'list'
```

The cache stores answers in a dictionary, with the arguments as the key, and a list can't be a dictionary key, because it can change. Fix: take a tuple instead, which can't change. Hint the parameter as `tuple[int, ...]` (a tuple of any number of `int`s), and call it with `basket_total((350, 225, 400))`, or `basket_total(tuple(basket))` if you have a list.

## Quick recap

- `sorted(items, key=function)` sorts by whatever the function says about each item. Write `key=len`, not `key=len()`. `.sort()`, `min()` and `max()` take a `key=` too, and `min()`/`max()` give back the whole item.
- `lambda x: expression` is a tiny unnamed function for one-off jobs like keys. Use `def` when it needs a name or more than one expression.
- Break ties with a tuple key like `(-score, name)`. Sorting is stable, so equal items keep their order.
- `map()` transforms every item and `filter()` keeps some. Both return lazy iterators that get used up. Comprehensions are usually clearer.
- `any()` and `all()` check whether some or every item is true, and stop early.
- `functools` has `reduce` (rarely needed), `partial` (pre-fill arguments), and `@cache`/`@lru_cache`, which remember answers. Only cache functions whose answers never change for the same hashable inputs.

---

**Next:** try the [exercises](exercises.md), then move on to [35 Regular Expressions](../35-regular-expressions/notes.md).
