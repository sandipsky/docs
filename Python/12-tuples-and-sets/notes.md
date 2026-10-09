# 12 Tuples and Sets

## What is it?

A **tuple** is like a list that can't be changed once it's made. A **set** is a collection with no duplicates and no order.

```python
birthday = (1998, 4, 23)            # a tuple: round brackets
club_members = {"Ana", "Ben", "Cara"}  # a set: curly braces
```

("Tuple" rhymes with "couple" or with "pupil". People say it both ways, and both are fine.)

## Why does it matter?

Lists from [chapter 11](../11-lists/notes.md) can do almost anything. So why learn two more collections? Because sometimes "can do anything" is the problem.

**Problem 1: some things should never change.** Say you store the corner of a game board as a list:

```python
corner = [0, 0]
corner[0] = 5   # oops, a typo somewhere else in the program
print(corner)   # prints: [5, 0]
```

Python happily changed it. A tuple would have refused, and you'd have found the bug straight away.

**Problem 2: duplicates.** Say people signed up for a party, and some signed up twice. To count the real guests with a list, you need a loop:

```python
guests = ["Ana", "Ben", "Ana", "Cara", "Ben"]
unique = []
for guest in guests:
    if guest not in unique:
        unique.append(guest)
print(len(unique))  # prints: 3
```

With a set, it's one line:

```python
guests = ["Ana", "Ben", "Ana", "Cara", "Ben"]
print(len(set(guests)))  # prints: 3
```

Tuples protect data that should stay put. Sets keep things unique and answer "is this in here?" very fast.

## Real-world example

| Everyday thing | Python | Why it fits |
|---|---|---|
| A to-do list on a whiteboard | list | You add, cross off and reorder all day. |
| A printed cinema ticket: row F, seat 7 | tuple | The details belong together and never change. You can read it, not edit it. |
| A sticker album | set | Each sticker goes in once. A second copy of the same sticker doesn't add anything, and there's no "first" or "last" sticker. |

## How it works

There are two halves here: tuples first, then sets (starting at "Sets: creating one").

### Creating a tuple

Put the values inside round brackets `( )`, separated by commas:

```python
point = (3, 4)
print(point)        # prints: (3, 4)
print(type(point))  # prints: <class 'tuple'>
```

Here's a surprise: it's the **commas** that make a tuple, not the brackets. The brackets are optional most of the time:

```python
point = 3, 4
print(point)  # prints: (3, 4)
```

Most people still write the brackets, because they make the tuple easy to spot. An empty tuple is `()`.

`tuple()` turns a list into a tuple, and `list()` turns a tuple back into a list:

```python
print(tuple(["a", "b"]))  # prints: ('a', 'b')
print(list((1, 2, 3)))    # prints: [1, 2, 3]
```

### The one-item trap

Since commas make the tuple, a tuple with one item needs a comma too:

```python
single = (5,)
print(single)        # prints: (5,)
print(type(single))  # prints: <class 'tuple'>

not_a_tuple = (5)
print(not_a_tuple)        # prints: 5
print(type(not_a_tuple))  # prints: <class 'int'>
```

Without the comma, `(5)` is just the number 5 in brackets, like the brackets in `(2 + 3) * 4` from [chapter 04](../04-operators/notes.md). The trailing comma looks odd, but it's the rule.

### Reading a tuple

Everything that *reads* a list also works on a tuple: indexes, negative indexes, slices, `len`, `in`, `for` loops, `count` and `index`.

```python
date = (2026, 10, 9)   # year, month, day
print(date[0])     # prints: 2026
print(date[-1])    # prints: 9
print(date[1:])    # prints: (10, 9)
print(len(date))   # prints: 3
print(10 in date)  # prints: True
```

A slice of a tuple is a new tuple. You can also join two tuples with `+`: `(1, 2) + (3, 4)` gives `(1, 2, 3, 4)`.

### Tuples can't change

Tuples are **immutable**, just like strings. You can't replace, add or remove items:

```python
point = (3, 4)
point[0] = 10
# TypeError: 'tuple' object does not support item assignment
```

```python
point = (3, 4)
point.append(5)
# AttributeError: 'tuple' object has no attribute 'append'
```

An **attribute** is anything you reach with a dot, like a method. The error says tuples simply don't have an `append` method. They don't have `remove`, `pop`, `sort` or `insert` either.

You can still point the variable at a whole new tuple. That doesn't change the old tuple. It replaces it:

```python
point = (3, 4)
point = (10, 4)
print(point)  # prints: (10, 4)
```

Why would you *want* something you can't change? For the same reason you'd write `UPPER_CASE` names in [chapter 02](../02-variables/notes.md), except this time Python really enforces it. If something should never change, like the days of the week, a tuple guarantees it:

```python
DAYS = ("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")
print(DAYS[5:])  # prints: ('Sat', 'Sun')
```

### Unpacking: one tuple into several variables

**Unpacking** means taking the items out of a tuple and putting each one in its own variable, all in one line:

```python
point = (3, 4)
x, y = point
print(x)  # prints: 3
print(y)  # prints: 4
```

Python matches them up by position: the first item goes into the first name, the second into the second. It reads really well with records:

```python
person = ("Sandip", 25, "Kathmandu")
name, age, city = person
print(f"{name} is {age} and lives in {city}.")
# prints: Sandip is 25 and lives in Kathmandu.
```

The number of names on the left must match the number of items:

```python
name, age = ("Sandip", 25, "Kathmandu")
# ValueError: too many values to unpack (expected 2)
```

Remember the swap trick from chapter 02, `a, b = b, a`? Now you can see how it works. The right side, `b, a`, builds a tuple (commas make tuples!). Then the left side unpacks it into `a` and `b`:

```python
a, b = 1, 2
a, b = b, a
print(a, b)  # prints: 2 1
```

### Returning more than one value

In [chapter 10](../10-functions/notes.md) you wrote `return a, b`, and we promised to explain it here. You can probably guess: `return a, b` returns **one** tuple with two items in it.

```python
def min_max(numbers):
    """Return the smallest and largest number as a tuple."""
    return min(numbers), max(numbers)

result = min_max([18, 24, 21, 27, 19])
print(result)        # prints: (18, 27)
print(type(result))  # prints: <class 'tuple'>
```

Most of the time you unpack it straight away:

```python
low, high = min_max([18, 24, 21, 27, 19])
print(f"Low: {low}, High: {high}")  # prints: Low: 18, High: 27
```

### Tuples as records, and lists of tuples

A tuple is a great fit for a small **record**: a few facts that belong together, like a point `(x, y)`, a date `(year, month, day)`, or a student and their score. Put many records in a list, and you have a little table:

```python
students = [("Ana", 90), ("Ben", 75), ("Cara", 82)]

for name, score in students:
    print(f"{name}: {score}")
```

You'll see:

```
Ana: 90
Ben: 75
Cara: 82
```

Look at `for name, score in students`. Each time around, the loop gets one tuple and unpacks it into `name` and `score`. Compare that with `student[0]` and `student[1]` from the lists-of-lists example in chapter 11. Names beat numbers.

This is exactly what `enumerate()` has been doing all along! It hands the loop a tuple each time:

```python
for pair in enumerate(["a", "b"]):
    print(pair)
```

You'll see:

```
(0, 'a')
(1, 'b')
```

So `for i, letter in enumerate(...)` is just unpacking those tuples.

The list holding the records can still change. You can append a new student: `students.append(("Dev", 68))`. It's each record that can't be changed.

Lists of tuples sort nicely, too. Python compares tuples item by item, starting with the first, like sorting words letter by letter:

```python
print(sorted([(90, "Ana"), (75, "Ben"), (82, "Cara")], reverse=True))
# prints: [(90, 'Ana'), (82, 'Cara'), (75, 'Ben')]
```

### `zip()`: pairing up two lists

In exercise 4 of chapter 11, you had two lists that matched up by index, and you looped over `range(len(...))`. `zip()` is the neat way to do that. Like a zip on a jacket, it joins two sides together, one tooth at a time:

```python
names = ["Ana", "Ben", "Cara"]
scores = [90, 75, 82]

for name, score in zip(names, scores):
    print(f"{name}: {score}")
```

You'll see:

```
Ana: 90
Ben: 75
Cara: 82
```

`zip()` hands the loop one tuple at a time: `("Ana", 90)`, then `("Ben", 75)`, and so on. To see them all at once, turn the result into a list:

```python
print(list(zip(names, scores)))
# prints: [('Ana', 90), ('Ben', 75), ('Cara', 82)]
```

It works with three or more lists too:

```python
days = ["Mon", "Tue", "Wed"]
highs = [24, 27, 21]
lows = [15, 18, 14]

for day, high, low in zip(days, highs, lows):
    print(f"{day}: {low} to {high}")
```

You'll see:

```
Mon: 15 to 24
Tue: 18 to 27
Wed: 14 to 21
```

If the lists have different lengths, `zip()` stops at the end of the shortest one, without any error. `list(zip([1, 2, 3], ["a", "b"]))` gives `[(1, 'a'), (2, 'b')]`, and the `3` is quietly left out.

### List or tuple?

| Use a list when... | Use a tuple when... |
|---|---|
| the items will change (a cart, a queue) | the items should never change (a date, a point) |
| it's many things of the same kind (100 scores) | it's a few facts about one thing (name, age, city) |
| you'll add or remove items | you want to return several values from a function |

When in doubt, use a list. Reach for a tuple when you want the "can't change" guarantee, or when the items are a small record.

### Sets: creating one

Now for the second half. A set uses curly braces `{ }`:

```python
colors = {"red", "green", "blue"}
print(type(colors))  # prints: <class 'set'>
print(len(colors))   # prints: 3
```

A set has two big rules: **no duplicates** and **no order**.

**No duplicates.** If you put the same value in twice, the set keeps only one:

```python
numbers = {3, 1, 2, 3, 1}
print(numbers)       # prints: {1, 2, 3}
print(len(numbers))  # prints: 3
```

**No order.** A set doesn't remember the order you put things in, and it has no "first" item. Watch what happens when you print a set of strings. Here's the same two-line program, run four times:

```python
votes = ["pizza", "sushi", "pizza", "tacos", "sushi", "pizza"]
print(set(votes))
```

You'll see something like this (your order will probably be different):

```
{'sushi', 'pizza', 'tacos'}
{'sushi', 'tacos', 'pizza'}
{'tacos', 'pizza', 'sushi'}
{'pizza', 'tacos', 'sushi'}
```

The same three items every time, but in a different order each run. That's normal for sets, and it's why we won't show set output with text in it as `# prints:` comments. Small whole numbers, like `{1, 2, 3}` above, often *look* sorted, but that's luck, not a promise.

When you need a set in a predictable order, `sorted()` gives you a sorted **list**:

```python
colors = {"red", "green", "blue"}
print(sorted(colors))  # prints: ['blue', 'green', 'red']
```

Since there's no order, there are no indexes either. `colors[0]` gives `TypeError: 'set' object is not subscriptable`.

### Removing duplicates from a list

This is the most common everyday job for a set. `set()` turns a list into a set, which drops the duplicates. Then `sorted()` turns it back into a tidy list:

```python
tags = ["python", "beginner", "python", "loops", "beginner"]
print(len(tags))            # prints: 5
print(len(set(tags)))       # prints: 3
print(sorted(set(tags)))    # prints: ['beginner', 'loops', 'python']
```

`set()` works on anything you can loop over. `set("banana")` gives you the letters `b`, `a` and `n`, once each.

> **Watch out:** a set forgets the original order. If the order matters (say, guests in the order they signed up), use the loop from "Why does it matter?" instead.

### Adding and removing

Sets can change, just like lists. They have their own methods:

```python
members = {"Ana", "Ben"}
members.add("Cara")
members.add("Ana")      # already there, so nothing happens
print(sorted(members))  # prints: ['Ana', 'Ben', 'Cara']

members.remove("Ben")
print(sorted(members))  # prints: ['Ana', 'Cara']
```

| Method | What it does |
|---|---|
| `add(item)` | adds one item (if it's already there, nothing happens) |
| `remove(item)` | removes the item, and stops with an error if it isn't there |
| `discard(item)` | removes the item, and quietly does nothing if it isn't there |
| `clear()` | empties the set |

`remove` and `discard` are twins with one difference:

```python
members = {"Ana", "Cara"}
members.discard("Zed")  # not there: no problem
members.remove("Zed")
# KeyError: 'Zed'
```

Use `remove` when the item *should* be there, so a mistake shows up. Use `discard` when "already gone" is fine.

There's no `append` (a set has no end to append to) and no `insert` (no positions). It's always `add`.

### `in` is fast

`in` works on sets, just like on lists:

```python
banned_words = {"spam", "scam", "free money"}
word = "scam"
if word in banned_words:
    print("Blocked!")
# prints: Blocked!
```

The difference is speed. To answer `in` on a list, Python checks the items one by one, like reading a guest list from the top. A set is built so Python can jump straight to the answer, a bit like looking a name up in a phone book instead of reading every page. With 5 items you won't notice. With a million, a set answers in an instant while the list is still reading.

So when your main question is "is this in here?", a set is the right tool.

### Set operations: union, intersection and difference

This is where sets really shine. Say a running club and a chess club want to compare their members:

```python
running = {"Ana", "Ben", "Cara", "Dev"}
chess = {"Cara", "Dev", "Eli"}

print(sorted(running | chess))  # prints: ['Ana', 'Ben', 'Cara', 'Dev', 'Eli']
print(sorted(running & chess))  # prints: ['Cara', 'Dev']
print(sorted(running - chess))  # prints: ['Ana', 'Ben']
print(sorted(chess - running))  # prints: ['Eli']
```

| Operator | Name | Question it answers | Answer |
|---|---|---|---|
| `running \| chess` | union | Who is in **either** club? (everyone, once each) | Ana, Ben, Cara, Dev, Eli |
| `running & chess` | intersection | Who is in **both** clubs? | Cara, Dev |
| `running - chess` | difference | Who runs but **doesn't** play chess? | Ana, Ben |
| `chess - running` | difference | Who plays chess but **doesn't** run? | Eli |

Notice that difference depends on the order, just like subtraction: `running - chess` and `chess - running` are different answers.

A few ways to remember them: `|` is "or" (in this one or that one), `&` is "and" (in this one and that one), and `-` is "take away".

If you prefer words, each operator has a method that does the same job: `running.union(chess)`, `running.intersection(chess)` and `running.difference(chess)`.

> **Tip:** there's one more, `^` (symmetric difference): who is in exactly one club, but not both? `sorted(running ^ chess)` gives `['Ana', 'Ben', 'Eli']`. You won't need it often.

### The empty set is `set()`, not `{}`

Here's a trap. Curly braces with nothing inside don't make an empty set:

```python
empty = {}
print(type(empty))  # prints: <class 'dict'>
```

`{}` makes an empty **dictionary**, which you'll meet in [chapter 13](../13-dictionaries/notes.md). Dictionaries also use curly braces, and they got `{}` first. For an empty set, use `set()`:

```python
guests = set()
print(guests)        # prints: set()
print(type(guests))  # prints: <class 'set'>
guests.add("Ana")
print(guests)        # prints: {'Ana'}
```

Even Python prints an empty set as `set()`, to avoid mixing it up with `{}`.

### What can go in a set?

Only values that can't change can go in a set: numbers, strings, booleans, `None`, and tuples. A list can't:

```python
groups = {["Ana", "Ben"], ["Cara"]}
# TypeError: unhashable type: 'list'
```

**Hashable** is Python's word for "can be used for fast lookups". To find things instantly, a set files each item away based on its value. If an item could change after it was filed, the set would look in the wrong place. So Python only allows unchangeable items in a set.

Tuples are fine, which makes them handy for things like grid squares:

```python
visited = {(0, 0), (1, 2), (0, 0)}
print(len(visited))     # prints: 2
print(sorted(visited))  # prints: [(0, 0), (1, 2)]
```

The same rule applies to dictionary keys in chapter 13, so remember it.

> **Tip:** Python also has a **frozenset**: a set that can't be changed after it's made, made with `frozenset(["a", "b"])`. You'll rarely need one, but now you'll know what it is if you see it.

## Common mistakes

**1. A one-item tuple without the comma**

```python
sizes = ("small")
print(len(sizes))  # prints: 5
```

You wanted a tuple with one size in it, but `("small")` is just the string `"small"` in brackets, so `len` counts its 5 letters. With a number, it's even more confusing: `len((5))` gives `TypeError: object of type 'int' has no len()`. Fix: add the comma, `("small",)`.

**2. Trying to change a tuple**

```python
date = (2026, 10, 9)
date[2] = 10
# TypeError: 'tuple' object does not support item assignment
```

Tuples can't change, and that's the whole point of them. If you need to change one item, build a new tuple: `date = (date[0], date[1], 10)`. If you keep needing changes, you probably wanted a list.

**3. Using `{}` for an empty set**

```python
guests = {}
guests.add("Ana")
# AttributeError: 'dict' object has no attribute 'add'
```

`{}` is an empty dictionary, and dictionaries don't have `add`. Fix: `guests = set()`.

**4. Expecting a set to keep its order, or to have indexes**

```python
winners = {"Ana", "Ben", "Cara"}
print(winners[0])
# TypeError: 'set' object is not subscriptable
```

A set has no first item, so there's nothing at index 0. If order matters, use a list (or a tuple). If you only need a predictable order for printing, use `sorted(winners)`.

**5. Unpacking the wrong number of values**

```python
person = ("Sandip", 25, "Kathmandu")
name, age = person
# ValueError: too many values to unpack (expected 2)
```

Three items, two names. Python won't guess which item to drop. Fix: give every item a name, `name, age, city = person`. With too few items you get the opposite: `ValueError: not enough values to unpack (expected 3, got 2)`.

**6. Putting a list in a set**

```python
seats = {["F", 7], ["G", 2]}
# TypeError: unhashable type: 'list'
```

Lists can change, so they can't go in a set. Use tuples for the items instead: `{("F", 7), ("G", 2)}`.

## Quick recap

- A tuple is like a list that can't change: `point = (3, 4)`. Commas make it a tuple, so a one-item tuple is `(5,)`.
- Tuples can be read like lists (indexes, slices, `len`, `in`, loops), but not changed.
- Unpacking puts each item in its own variable: `x, y = point`. `return a, b` returns a tuple, and `for name, score in pairs` unpacks as it loops.
- `zip()` pairs up items from two or more lists, one tuple at a time.
- A set has no duplicates and no order: `{"Ana", "Ben"}`. Use `add`, `remove` and `discard`. `set(a_list)` removes duplicates.
- `in` on a set is very fast. `|`, `&` and `-` give you union (either), intersection (both) and difference (one but not the other).
- The empty set is `set()`, because `{}` is an empty dictionary. Only unchangeable things (like strings, numbers and tuples) can go in a set.

---

**Next:** try the [exercises](exercises.md), then move on to [13 Dictionaries](../13-dictionaries/notes.md).
