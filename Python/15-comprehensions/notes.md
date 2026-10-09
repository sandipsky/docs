# 15 Comprehensions

## What is it?

A **comprehension** is a short way to build a new list, dictionary or set out of another collection, in a single line.

It's Python's way of saying: "give me *this*, for each item in *that*".

## Why does it matter?

Look at the loops you've been writing since [chapter 11](../11-lists/notes.md). A lot of them follow the same pattern: make an empty list, loop over something, and `append` to the new list each time round.

```python
prices = [10, 20, 30]

doubled = []
for price in prices:
    doubled.append(price * 2)

print(doubled)  # prints: [20, 40, 60]
```

That's three lines of code for one simple idea: "double every price". Here's the same thing as a **list comprehension**:

```python
prices = [10, 20, 30]
doubled = [price * 2 for price in prices]
print(doubled)  # prints: [20, 40, 60]
```

One line, and it reads almost like English: "price times 2, for each price in prices".

Comprehensions matter for two reasons:

- **They save you typing** for one of the most common jobs in programming: turning one list into another.
- **You'll see them everywhere.** Python programmers use them all the time. Once you can read them, a lot of real Python code suddenly makes sense.

## Real-world example

Picture a teacher getting ready for a school trip. She has the class register, and she needs name badges for everyone going. She goes down the register one name at a time, skips anyone who didn't bring a permission slip, and writes each remaining name in capital letters on a new sheet of paper.

| The school trip | A comprehension |
|---|---|
| The class register | The original list: `students` |
| Going down the register, one name at a time | `for student in students` |
| "Only the ones with a permission slip" | An `if` filter at the end |
| Writing each name in capitals | The expression at the front: `student.upper()` |
| The new sheet of paper | The new list the comprehension builds |
| The register itself, still exactly as it was | The original list is not changed |

Here's that whole job in Python. Don't worry about the details yet; by the end of this chapter you'll be able to read every piece:

```python
students = ["ana", "ben", "cleo", "dev"]
has_slip = ["ana", "cleo", "dev"]

badges = [student.upper() for student in students if student in has_slip]
print(badges)    # prints: ['ANA', 'CLEO', 'DEV']
print(students)  # prints: ['ana', 'ben', 'cleo', 'dev']
```

The teacher never scribbles on the register. A comprehension works the same way: it always builds a **new** collection, and leaves the old one as it was.

## How it works

### From a loop to a comprehension

Every list comprehension can be written as a loop, and that's the best way to understand it. Look at how the pieces move:

```
doubled = []                        doubled = [price * 2 for price in prices]
for price in prices:                          ─────────  ───────────────────
    doubled.append(price * 2)                     │               │
                                                  │               └── the loop
                                                  └── what goes into the new list
```

The loop line `for price in prices` moves inside the square brackets. The thing you were appending, `price * 2`, moves to the front. The empty list and the `append` disappear, because the square brackets do that job for you.

| Piece | What it means |
|---|---|
| `[ ... ]` | "Build a new list." |
| `price * 2` | The **expression**: what to put in the new list for each item |
| `for price in prices` | The loop: go through `prices`, one item at a time, calling each one `price` |

An **expression** is any piece of code that gives you a value, like `price * 2`, `name.upper()` or `len(word)`.

Read a comprehension from the middle out: first find the `for` to see what it loops over, then look at the front to see what it makes from each item.

> **Tip:** The name after `for` is up to you, just like in a normal `for` loop. Use a singular name for one item (`price`) and a plural name for the list (`prices`). It makes the comprehension read like a sentence.

### The original list doesn't change

A comprehension builds a brand-new list. The one you started from is untouched:

```python
prices = [10, 20, 30]
doubled = [price * 2 for price in prices]

print(prices)   # prints: [10, 20, 30]
print(doubled)  # prints: [20, 40, 60]
```

If you do want to replace the old list, assign the result back to the same name: `prices = [price * 2 for price in prices]`. (Why "a new list" and "the same list" are different things is the big idea of [chapter 16](../16-scope-and-mutability/notes.md).)

### Any expression works at the front

The front part can be any expression: a method call, a function, some maths, an f-string.

```python
names = ["ana", "ben", "cleo"]

tidy = [name.title() for name in names]
print(tidy)  # prints: ['Ana', 'Ben', 'Cleo']

lengths = [len(name) for name in names]
print(lengths)  # prints: [3, 3, 4]
```

Functions you wrote yourself work too:

```python
def add_tax(price):
    """Return the price with 10% tax added."""
    return round(price * 1.1, 2)


prices = [10, 20, 30]
with_tax = [add_tax(price) for price in prices]
print(with_tax)  # prints: [11.0, 22.0, 33.0]
```

### Filtering with `if`

Often you only want *some* of the items. Add an `if` at the end, and only the items that pass the test make it into the new list. Here are the exam scores of a small class, where 60 or more is a pass:

```python
scores = [72, 45, 88, 91, 60]
passed = [score for score in scores if score >= 60]
print(passed)  # prints: [72, 88, 91, 60]
```

Read it as: "score, for each score in scores, if score is 60 or more". Here's the same thing as a loop, so you can see where the `if` came from:

```python
passed = []
for score in scores:
    if score >= 60:
        passed.append(score)
```

The order of the pieces in the comprehension follows the loop from top to bottom (`for`, then `if`), except that the thing you append jumps to the very front.

You can use any condition from [chapter 08](../08-conditionals/notes.md), including `in`, `not in`, `and` and `or`:

```python
tasks = ["buy milk", "call mum", "pay rent"]
done = ["call mum"]

todo = [task for task in tasks if task not in done]
print(todo)  # prints: ['buy milk', 'pay rent']
```

### Choosing between two values with `if` and `else`

Sometimes you don't want to drop any items. You want to turn *every* item into one of two things. For that, use the conditional expression from chapter 08, `x if condition else y`, as the expression at the front:

```python
scores = [72, 45, 88, 91, 60]
labels = ["pass" if score >= 60 else "fail" for score in scores]
print(labels)  # prints: ['pass', 'fail', 'pass', 'pass', 'pass']
```

There's nothing new here. `"pass" if score >= 60 else "fail"` is just an expression that gives you one of two strings, so it can sit at the front like any other expression.

This is where a lot of beginners get mixed up, because there are now two places an `if` can go, and they do different jobs:

| Where the `if` goes | What it does | How many items come out |
|---|---|---|
| At the **end**: `[x for x in items if test]` | Filters: keeps only the items that pass | The same or fewer |
| At the **front**: `[a if test else b for x in items]` | Chooses: every item becomes `a` or `b` | Exactly the same number |

A filter at the end has no `else` (an item is either kept or skipped). A choice at the front must have an `else` (every item needs a value). Mix those up and Python gives you a `SyntaxError`, which you'll see in Common mistakes.

Here's one more, for a weather log. Every temperature gets a label, so the `if`/`else` goes at the front:

```python
temps = [18, 22, 15, 25]
feel = ["warm" if temp >= 20 else "cool" for temp in temps]
print(feel)  # prints: ['cool', 'warm', 'cool', 'warm']
```

### Looping over strings and `range`

A comprehension can loop over anything a `for` loop can, like a string or a `range()` from [chapter 09](../09-loops/notes.md).

```python
# Each letter of a word
vowels = [letter for letter in "programming" if letter in "aeiou"]
print(vowels)  # prints: ['o', 'a', 'i']

# The squares of 1 to 5
squares = [n * n for n in range(1, 6)]
print(squares)  # prints: [1, 4, 9, 16, 25]

# The even numbers from 1 to 10
evens = [n for n in range(1, 11) if n % 2 == 0]
print(evens)  # prints: [2, 4, 6, 8, 10]

# Seat labels for row A of a cinema
seats = [f"A{n}" for n in range(1, 4)]
print(seats)  # prints: ['A1', 'A2', 'A3']
```

### Working with records

Comprehensions really shine with the "table of records" pattern from [chapter 13](../13-dictionaries/notes.md): a list of dictionaries. Here's a small stationery shop:

```python
products = [
    {"name": "Notebook", "price": 4, "in_stock": True},
    {"name": "Pen", "price": 1, "in_stock": False},
    {"name": "Backpack", "price": 35, "in_stock": True},
    {"name": "Mug", "price": 9, "in_stock": True},
]

# Just the names
names = [product["name"] for product in products]
print(names)  # prints: ['Notebook', 'Pen', 'Backpack', 'Mug']

# Only what's in stock
available = [product["name"] for product in products if product["in_stock"]]
print(available)  # prints: ['Notebook', 'Backpack', 'Mug']

# In stock AND under 10
cheap = [
    product["name"]
    for product in products
    if product["in_stock"] and product["price"] < 10
]
print(cheap)  # prints: ['Notebook', 'Mug']

# Add up every price
total = sum([product["price"] for product in products])
print(total)  # prints: 49
```

Notice the `cheap` example is split over several lines. Inside brackets, Python lets you break a line wherever you like, so a long comprehension can be laid out with the expression, the `for` and the `if` each on their own line. That's much easier to read than one very long line.

When the list holds tuples ([chapter 12](../12-tuples-and-sets/notes.md)), you can unpack them right in the `for`, just like in a normal loop:

```python
results = [("Ana", 92), ("Ben", 78), ("Cleo", 85)]
lines = [f"{name}: {score}" for name, score in results]
print(lines)  # prints: ['Ana: 92', 'Ben: 78', 'Cleo: 85']
```

### Two loops in one comprehension

You can put more than one `for` inside a comprehension. It works like a loop inside a loop ([chapter 09](../09-loops/notes.md)). Say a T-shirt shop sells two colours in two sizes, and wants a list of every combination:

```python
colors = ["red", "blue"]
sizes = ["S", "M"]

# The loop version
combos = []
for color in colors:
    for size in sizes:
        combos.append(f"{color} {size}")
print(combos)  # prints: ['red S', 'red M', 'blue S', 'blue M']

# The comprehension version
combos = [f"{color} {size}" for color in colors for size in sizes]
print(combos)  # prints: ['red S', 'red M', 'blue S', 'blue M']
```

The two `for` parts appear in the **same order** as in the loop version: the outer loop first, then the inner loop.

A handy use is flattening a list of lists into one list. Here are a cinema's seat numbers, row by row:

```python
rows = [[1, 2, 3], [4, 5, 6]]
all_seats = [seat for row in rows for seat in row]
print(all_seats)  # prints: [1, 2, 3, 4, 5, 6]
```

Read it as: "seat, for each row in rows, for each seat in that row".

> **Watch out:** two loops in one line is about the limit. Three `for`s, or two `for`s plus a couple of `if`s, quickly turns into a puzzle. If you have to read a comprehension twice to understand it, write it as a normal loop instead. Nobody gets a prize for the shortest code.

### Dictionary comprehensions

The same idea works for dictionaries. Use curly braces, and write a `key: value` pair at the front:

```python
names = ["Ana", "Ben", "Cleo"]
name_lengths = {name: len(name) for name in names}
print(name_lengths)  # prints: {'Ana': 3, 'Ben': 3, 'Cleo': 4}
```

Here's the loop version, from chapter 13:

```python
name_lengths = {}
for name in names:
    name_lengths[name] = len(name)
```

`zip()` from chapter 12 pairs up two lists, which is perfect for building a dictionary:

```python
names = ["Ana", "Ben", "Cleo"]
scores = [92, 78, 85]

grade_book = {name: score for name, score in zip(names, scores)}
print(grade_book)  # prints: {'Ana': 92, 'Ben': 78, 'Cleo': 85}
```

You can also loop over an existing dictionary with `.items()`, and build a changed version of it. Here's a cafe menu stored in whole cents (remember why from [chapter 05](../05-numbers-and-math/notes.md)), turned into display prices:

```python
menu = {"tea": 250, "coffee": 350, "cake": 475, "water": 100}

display = {item: f"${cents / 100:.2f}" for item, cents in menu.items()}
print(display)  # prints: {'tea': '$2.50', 'coffee': '$3.50', 'cake': '$4.75', 'water': '$1.00'}
```

Filtering works exactly as before, with an `if` at the end:

```python
cheap_menu = {item: cents for item, cents in menu.items() if cents < 300}
print(cheap_menu)  # prints: {'tea': 250, 'water': 100}
```

And one neat trick: swapping keys and values, so you can look things up the other way round.

```python
grade_book = {"Ana": 92, "Ben": 78, "Cleo": 85}
by_score = {score: name for name, score in grade_book.items()}
print(by_score)  # prints: {92: 'Ana', 78: 'Ben', 85: 'Cleo'}
```

(This only works well when the values are all different. If two students both scored 85, the second one would replace the first, because a dictionary can't have the same key twice.)

### Set comprehensions

Curly braces **without** a colon make a set ([chapter 12](../12-tuples-and-sets/notes.md)). Because a set throws away duplicates, a set comprehension is a quick way to collect the *different* values:

```python
emails = ["Ana@Mail.com", "ben@mail.com", "ANA@mail.com"]
unique_emails = {email.lower() for email in emails}

print(len(unique_emails))     # prints: 2
print(sorted(unique_emails))  # prints: ['ana@mail.com', 'ben@mail.com']
```

Three sign-ups, but only two real people, because Ana signed up twice with different capital letters.

Remember that sets have no order. If you print a set of strings directly, the order can change from one run to the next. That's why the example above uses `sorted()` from [chapter 11](../11-lists/notes.md) to print it: `sorted()` gives you a list in a fixed order.

Here's the difference between the three kinds side by side:

| You write | You get |
|---|---|
| `[x for x in items]` | A list (square brackets) |
| `{x for x in items}` | A set (curly braces, no colon) |
| `{k: v for x in items}` | A dictionary (curly braces with `key: value`) |

> **Tip:** there's no "tuple comprehension". Round brackets do something different, which you'll meet at the end of this chapter.

### When to use a plain loop instead

Comprehensions are great, but they're not always the right tool. Use a normal `for` loop when:

**1. You want to *do* something, not *build* something.** A comprehension's whole job is to make a new collection. If you just want to print each item, or save each one somewhere, that's a loop:

```python
names = ["Ana", "Ben"]
for name in names:
    print(f"Hello, {name}")
```

Doing something extra while the code runs, like printing, is called a **side effect**. Loops are for side effects. Comprehensions are for building values.

**2. Each item needs more than one line of thinking.** Here's a cafe working out order totals. It skips empty orders and gives 10% off any order over $20:

```python
orders = [("Ana", 3, 4.5), ("Ben", 0, 2.0), ("Cleo", 2, 12.0)]

report = []
for name, quantity, price in orders:
    if quantity == 0:
        continue  # skip empty orders
    total = quantity * price
    if total > 20:
        total = total * 0.9  # 10% off big orders
    report.append(f"{name}: ${total:.2f}")

print(report)  # prints: ['Ana: $13.50', 'Cleo: $21.60']
```

You *could* squeeze this into a comprehension, but it would be one long, confusing line, and you'd lose the comments. The loop is clearer.

**3. You need `break`.** A comprehension always goes through every item. If you want to stop early, as soon as you've found something, use a loop with `break` ([chapter 09](../09-loops/notes.md)).

Here's a simple rule to decide:

| If the job is... | Use |
|---|---|
| "Make a new list/dict/set from this one" in one simple step | A comprehension |
| "Make a new list, but each item takes several steps" | A loop with `append` |
| "Do something with each item" (print, save, change something) | A loop |
| "Find the first match and stop" | A loop with `break` |

### A peek ahead: generator expressions

If you write a comprehension with round brackets instead of square ones, you get a **generator expression**, which hands out its values one at a time instead of building a whole list first, and you'll learn how that works in [chapter 31](../31-iterators-and-generators/notes.md).

You'll mostly see it inside a function call, where the function's own brackets are enough:

```python
total = sum(n * n for n in range(1, 6))
print(total)  # prints: 55
```

For now, you can read that exactly like `sum([n * n for n in range(1, 6)])`.

## Common mistakes

**1. Forgetting the brackets**

```python
prices = [10, 20, 30]
doubled = price * 2 for price in prices
# SyntaxError: invalid syntax
```

The square brackets are what tell Python "build a list". Without them, it's not a comprehension at all. Fix: `doubled = [price * 2 for price in prices]`.

**2. Putting `else` on a filter**

```python
scores = [72, 45, 88]
passed = [score for score in scores if score >= 60 else 0]
# SyntaxError: invalid syntax
```

An `if` at the end is a filter: an item is either kept or skipped, so there's nothing for an `else` to do. Decide what you want. To drop the failing scores, remove `else 0`. To keep every item but change some of them, move the whole `if`/`else` to the front: `[score if score >= 60 else 0 for score in scores]`.

**3. An `if` at the front without an `else`**

```python
scores = [72, 45, 88]
bonus = [score + 5 if score < 60 for score in scores]
# SyntaxError: expected 'else' after 'if' expression
```

An `if` at the front is a choice, so Python needs to know what to use when the test is `False`. Fix: add the `else`: `[score + 5 if score < 60 else score for score in scores]` gives `[72, 50, 88]`.

**4. Forgetting to store the result**

```python
names = ["ana", "ben"]
[name.title() for name in names]
print(names)  # prints: ['ana', 'ben']
```

The comprehension built a brand-new list... and then threw it away, because nothing kept it. The original `names` was never changed. Fix: give the new list a name: `names = [name.title() for name in names]`.

**5. Using a comprehension just to print**

```python
names = ["Ana", "Ben"]
result = [print(f"Hello, {name}") for name in names]
print(result)  # prints: [None, None]
```

It does print the greetings, but it also builds a useless list of `None`s (because `print()` gives nothing back, and a function that gives nothing back returns `None`, as you saw in [chapter 10](../10-functions/notes.md)). Fix: when you want a side effect, use a normal `for` loop.

**6. Using the loop name after the comprehension**

```python
names = ["ana", "ben"]
tidy = [name.title() for name in names]
print(name)
# NameError: name 'name' is not defined. Did you mean: 'names'?
```

The name after `for` in a comprehension only exists *inside* the brackets. (A normal `for` loop is different: its variable stays around after the loop, holding the last item.) Fix: use the new list, `tidy`, or loop over it again.

## Quick recap

- A list comprehension `[expression for item in items]` builds a new list in one line. It's a short way to write "empty list, loop, append".
- Add `if test` at the **end** to filter items out. Use `a if test else b` at the **front** to turn every item into one of two values.
- Comprehensions work over anything you can loop over: lists, strings, `range()`, `zip()`, and `.items()`.
- `{key: value for ...}` builds a dictionary, and `{value for ...}` builds a set (which drops duplicates).
- A comprehension never changes the original. It makes a new collection, so remember to store it.
- Use a normal loop for side effects like printing, for work that takes several steps, and when you need `break`.

---

**Next:** try the [exercises](exercises.md), then move on to [16 Scope and Mutability](../16-scope-and-mutability/notes.md).
