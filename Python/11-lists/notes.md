# 11 Lists

## What is it?

A **list** is a collection of values, kept in order, stored under one name.

```python
shopping_list = ["milk", "eggs", "bread"]
```

Each value in the list is called an **item** (or an **element**). Each item has a position number, called its **index**.

## Why does it matter?

Say you're building a music app. Without lists, every song needs its own variable:

```python
song1 = "Morning Run"
song2 = "Rainy Day"
song3 = "Night Drive"
```

That falls apart fast:

- A playlist with 200 songs would need 200 variables.
- You can't loop over `song1`, `song2`, `song3`. A [loop](../09-loops/notes.md) needs one thing to step through.
- Adding a song means writing a new line of code, instead of just adding to a list.

With a list, the whole playlist lives in one variable:

```python
playlist = ["Morning Run", "Rainy Day", "Night Drive"]
```

Now you can add songs, remove songs, count them, sort them, and loop over them. Almost every program is built on lists: messages in a chat, products in a shop, photos in an album, tasks in a to-do list.

## Real-world example

Think of a list as a **train**:

| Train | Python list |
|---|---|
| The whole train | The list |
| One carriage | One item |
| The number painted on a carriage | The index |
| How many carriages there are | `len(the_list)` |
| Hooking a new carriage onto the back | `append()` |
| Unhooking the last carriage | `pop()` |

This train has one odd rule: the first carriage is number **0**, not 1. So a train with 3 carriages has carriages 0, 1 and 2.

That rule trips up almost everyone at first. Python counts positions from 0, just like it did with the letters of a string in [chapter 06](../06-strings/notes.md).

## How it works

### Creating a list

Put the values inside square brackets `[ ]`, separated by commas:

```python
shopping_list = ["milk", "eggs", "bread"]
print(shopping_list)        # prints: ['milk', 'eggs', 'bread']
print(type(shopping_list))  # prints: <class 'list'>
```

Python prints lists with single quotes around strings. That's only how it displays them. Your double quotes are fine.

A list can also start out empty and get filled later. That's very common:

```python
cart = []
print(cart)       # prints: []
print(len(cart))  # prints: 0
```

A list can hold any type from [chapter 03](../03-data-types/notes.md), even a mix:

```python
profile = ["Maya", 28, True, None]
print(profile)  # prints: ['Maya', 28, True, None]
```

That works, but quick: what does `profile[2]` mean? Hard to say. Most of the time, keep one kind of thing per list, like a list of names or a list of prices. For a bundle of different facts about one thing, the dictionaries in [chapter 13](../13-dictionaries/notes.md) are a much better fit.

### Reading items by index

Put the index in square brackets to get one item, exactly like getting one letter from a string:

```python
planets = ["Mercury", "Venus", "Earth", "Mars"]
print(planets[0])  # prints: Mercury
print(planets[2])  # prints: Earth
```

`planets[2]` means "the item at index 2", which is the *third* item. Counting from 0 feels strange for a week or so, then it becomes a habit.

Ask for an index that doesn't exist, and Python stops with an error:

```python
planets = ["Mercury", "Venus", "Earth", "Mars"]
print(planets[4])
# IndexError: list index out of range
```

There are 4 planets, so the indexes are 0, 1, 2 and 3. Index 4 is one step past the end.

> If you did the [JavaScript course](../../JavaScript/README.md): JavaScript quietly gives you `undefined` here. Python refuses and tells you straight away, which makes the bug much easier to find.

### Counting from the end: negative indexes

A negative index counts back from the end. `-1` is the last item, `-2` is the one before it:

```python
planets = ["Mercury", "Venus", "Earth", "Mars"]
print(planets[-1])  # prints: Mars
print(planets[-2])  # prints: Earth
```

This is the easy way to get the last item, however long the list is.

### How many items: `len()`

`len()` from chapter 06 works on lists too. It counts the items:

```python
planets = ["Mercury", "Venus", "Earth", "Mars"]
print(len(planets))                # prints: 4
print(planets[len(planets) - 1])  # prints: Mars
```

Since the first index is 0, the last index is always `len(...) - 1`. Here that's `4 - 1`, which is 3. You'll see this in older code, but `planets[-1]` says the same thing more simply.

### Slicing: copying part of a list

Slicing works just like it did on strings in chapter 06. `[start:stop]` gives you a **new list** with the items from `start` up to, but not including, `stop`:

```python
months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
print(months[2:5])   # prints: ['Mar', 'Apr', 'May']
print(months[:2])    # prints: ['Jan', 'Feb']
print(months[4:])    # prints: ['May', 'Jun']
print(months[-3:])   # prints: ['Apr', 'May', 'Jun']
print(months[::2])   # prints: ['Jan', 'Mar', 'May']
print(months[::-1])  # prints: ['Jun', 'May', 'Apr', 'Mar', 'Feb', 'Jan']
print(months)        # prints: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
```

- Leave out `start` to begin at the start. Leave out `stop` to go to the end.
- Negative numbers count from the end, like negative indexes.
- A third number is the **step**: `::2` takes every second item, and `::-1` walks backwards.
- The last line shows the original list is untouched. A slice is always a copy.

Unlike an index, a slice never gives an error. `months[4:100]` just gives you what's there: `['May', 'Jun']`.

### Lists can change

Put an index on the left of `=` to replace an item:

```python
seats = ["free", "free", "free"]
seats[1] = "taken"
print(seats)  # prints: ['free', 'taken', 'free']
```

This is a big difference from strings. In chapter 06 you saw that strings are **immutable**: once made, they can't be changed in place. Try the same thing on a string and Python refuses:

```python
word = "cat"
word[0] = "b"
# TypeError: 'str' object does not support item assignment
```

Lists are **mutable**, which just means "can be changed". You can replace items, add items and remove items, and it's still the same list. Think of a shopping basket: you put things in and take things out all day, and it's still your basket.

### Adding items: `append`, `insert` and `extend`

Remember from chapter 06: a **method** is an action a value knows how to do, like `"hi".upper()`. Lists come with their own methods.

Picture a queue at a bakery:

```python
queue = ["Ana", "Ben"]

queue.append("Cara")     # Cara joins at the back
print(queue)             # prints: ['Ana', 'Ben', 'Cara']

queue.insert(0, "Dev")   # Dev has a VIP pass: put him at index 0
print(queue)             # prints: ['Dev', 'Ana', 'Ben', 'Cara']

queue.extend(["Eli", "Fay"])  # a whole group joins at the back
print(queue)             # prints: ['Dev', 'Ana', 'Ben', 'Cara', 'Eli', 'Fay']
```

| Method | What it does |
|---|---|
| `append(item)` | adds one item to the end |
| `insert(index, item)` | adds one item at that index, and moves the rest along |
| `extend(other_list)` | adds every item from another list to the end |

> **Tip:** `append` is the one you'll use most. Starting with an empty list `[]` and appending items to it is one of the most common patterns in programming.

You can also join two lists with `+`, just like joining strings in chapter 04. This makes a **new** list and leaves both originals alone:

```python
fruits = ["apple", "banana"]
veggies = ["carrot", "pea"]
groceries = fruits + veggies
print(groceries)  # prints: ['apple', 'banana', 'carrot', 'pea']
print(fruits)     # prints: ['apple', 'banana']
```

> **Watch out:** these methods change the list itself and give back `None` (Python's "nothing", from chapter 03). So `result = queue.append("Gus")` puts `None` in `result`. Just call the method on its own line.

### Removing items: `remove`, `pop` and `del`

There are three ways to take things out, depending on what you know:

| You know... | Use | Example |
|---|---|---|
| the **value** you want gone | `remove(value)` | `tasks.remove("buy stamps")` |
| the **index**, and you want the item back | `pop(index)` | `first = tasks.pop(0)` |
| the **index**, and you just want it gone | `del` | `del tasks[1]` |

Here they are with a to-do list:

```python
tasks = ["email Sam", "buy stamps", "call the dentist", "pay rent"]

tasks.remove("buy stamps")
print(tasks)  # prints: ['email Sam', 'call the dentist', 'pay rent']

last = tasks.pop()      # no index: takes the LAST item
print(last)             # prints: pay rent
print(tasks)            # prints: ['email Sam', 'call the dentist']

first = tasks.pop(0)    # takes the item at index 0
print(first)            # prints: email Sam
print(tasks)            # prints: ['call the dentist']
```

`pop()` is the only one that hands the removed item back to you, so you can keep it in a variable. It's like the person at the front of the bakery queue: they leave the queue, and you serve them.

`del` is a Python keyword (a word built into the language), not a method, so there's no dot. It can delete one item or a whole slice:

```python
colors = ["red", "green", "blue", "yellow"]
del colors[1]
print(colors)  # prints: ['red', 'blue', 'yellow']
del colors[0:2]
print(colors)  # prints: ['yellow']
```

A few things worth knowing:

- `remove` only removes the **first** match. `["a", "b", "a"]` becomes `["b", "a"]`.
- If the value isn't there, `remove` stops with an error: `ValueError: list.remove(x): x not in list`. Check with `in` first (next section).
- `pop()` on an empty list is an error too: `IndexError: pop from empty list`.
- `clear()` empties the whole list in one go: `tasks.clear()` leaves `[]`.

### Finding things: `in`, `index` and `count`

`in` works on lists just like it did on strings in chapter 08. It answers yes or no:

```python
guests = ["Asha", "Ben", "Chloe", "Ben"]
print("Ben" in guests)      # prints: True
print("ben" in guests)      # prints: False
print("Dan" not in guests)  # prints: True
print(guests.index("Chloe"))  # prints: 2
print(guests.count("Ben"))    # prints: 2
```

- `in` and `not in` give you `True` or `False`. They're case-sensitive, so `"ben"` doesn't match `"Ben"`.
- `index(value)` tells you *where* the first match is.
- `count(value)` tells you how many times it appears.

> **Watch out:** if the value isn't in the list, `index` stops with an error: `guests.index("Dan")` gives `ValueError: 'Dan' is not in list`. (Strings have `find()`, which gives `-1` instead, but lists don't have `find`.) Check with `in` first.

`in` fits nicely inside an `if` from [chapter 08](../08-conditionals/notes.md):

```python
guests = ["Asha", "Ben", "Chloe"]
visitor = "Dan"

if visitor in guests:
    print(f"Welcome in, {visitor}!")
else:
    print(f"Sorry {visitor}, you're not on the list.")
# prints: Sorry Dan, you're not on the list.
```

### Sorting: `sort()` or `sorted()`?

Python has two ways to sort, and the difference matters.

**`list.sort()`** sorts the list itself, in place. The old order is gone:

```python
scores = [72, 95, 88, 60]
scores.sort()
print(scores)  # prints: [60, 72, 88, 95]

scores.sort(reverse=True)  # biggest first
print(scores)  # prints: [95, 88, 72, 60]
```

`reverse=True` is a keyword argument, like the ones you wrote in [chapter 10](../10-functions/notes.md).

**`sorted(a_list)`** is a function, not a method. It gives you a **new**, sorted list and leaves the original alone:

```python
names = ["Chloe", "Ana", "Ben"]
in_order = sorted(names)
print(in_order)  # prints: ['Ana', 'Ben', 'Chloe']
print(names)     # prints: ['Chloe', 'Ana', 'Ben']
```

Think of a deck of cards. `sort()` is like sorting the deck in your hands. `sorted()` is like writing a sorted copy on a notepad, while the deck stays as it was.

| | `my_list.sort()` | `sorted(my_list)` |
|---|---|---|
| Changes the original? | **Yes** | No |
| Gives back | `None` | a new sorted list |
| Works on | lists only | lists, strings, and anything you can loop over |

Two things to know about sorting:

- Text sorts by character code, and every capital letter comes before every small letter. So `sorted(["banana", "Cherry", "apple"])` gives `['Cherry', 'apple', 'banana']`. Keep your capitals consistent and this won't bite you.
- Python won't sort a mix of numbers and text. `[3, "a", 1].sort()` stops with `TypeError: '<' not supported between instances of 'str' and 'int'`, because Python refuses to guess whether `"a"` is bigger than `3`.

### Flipping the order: `reverse()`

A chat app stores messages oldest first, but you want to show the newest first:

```python
messages = ["Hi!", "How are you?", "See you at 6"]
messages.reverse()
print(messages)  # prints: ['See you at 6', 'How are you?', 'Hi!']
```

`reverse()` just flips the order. It doesn't sort anything. Like `sort()`, it changes the list itself. If you want a reversed copy instead, use the slice `messages[::-1]` from earlier.

### Quick answers: `min`, `max` and `sum`

You met `min()`, `max()` and `sum()` in [chapter 05](../05-numbers-and-math/notes.md). Give them a list, and they work on every item:

```python
temperatures = [18, 24, 21, 27, 19]
print(min(temperatures))  # prints: 18
print(max(temperatures))  # prints: 27
print(sum(temperatures))  # prints: 109

average = sum(temperatures) / len(temperatures)
print(f"Average: {average:.1f}")  # prints: Average: 21.8
```

`sum()` only works on numbers. `min()` and `max()` work on text too: `min(["pear", "apple", "fig"])` gives `'apple'`, the first in alphabetical order.

### Looping over a list

This is where lists really pay off. A `for` loop from [chapter 09](../09-loops/notes.md) visits every item, however long the list is:

```python
scores = [72, 88, 95]

for score in scores:
    print(f"Score: {score}")
```

You'll see:

```
Score: 72
Score: 88
Score: 95
```

Each time around the loop, `score` holds the next item. The name is up to you. A good habit is a plural name for the list and the singular for one item: `for score in scores`, `for task in tasks`.

**Need the position too?** Use `enumerate()`, which you met with strings in chapter 09:

```python
scores = [72, 88, 95]

for position, score in enumerate(scores, start=1):
    print(f"Player {position}: {score} points")
```

You'll see:

```
Player 1: 72 points
Player 2: 88 points
Player 3: 95 points
```

`start=1` makes the count begin at 1, because humans count from 1. Without it, the count starts at 0.

**Want to change the items?** Changing the loop variable doesn't touch the list:

```python
prices = [100, 250, 80]
for price in prices:
    price = price * 2   # only changes the variable, not the list
print(prices)  # prints: [100, 250, 80]
```

`price` is just a temporary name for one item. To change the list itself, you need the index, so loop over `range(len(prices))`:

```python
prices = [100, 250, 80]
for i in range(len(prices)):
    prices[i] = prices[i] * 2
print(prices)  # prints: [200, 500, 160]
```

`range(len(prices))` gives you 0, 1, 2: exactly the valid indexes.

| Loop | Use it when |
|---|---|
| `for item in items` | you only need each item (most of the time) |
| `for i, item in enumerate(items)` | you also want a position number |
| `for i in range(len(items))` | you want to change items in the list |

### Three loop patterns you'll use all the time

**1. Adding everything up.** Start a running total at `0`, then add each item to it. That's the accumulator pattern from chapter 09. Wrap it in a [function](../10-functions/notes.md), and it works for any list:

```python
def sum_all(numbers):
    total = 0
    for number in numbers:
        total += number
    return total

print(sum_all([4.5, 12, 3.25]))  # prints: 19.75
print(sum_all([10, 20, 30]))     # prints: 60
print(sum_all([]))               # prints: 0
```

Yes, `sum()` already does this. But the same shape works for jobs `sum()` can't do, like adding up only the prices over $10.

**2. Finding the biggest.** Assume the first item is the biggest. Then check every item, and whenever you find a bigger one, remember that one instead:

```python
temperatures = [18, 24, 21, 27, 19]
highest = temperatures[0]

for temp in temperatures:
    if temp > highest:
        highest = temp
print(f"Hottest day: {highest} degrees")  # prints: Hottest day: 27 degrees
```

Again, `max()` does this for plain numbers. The loop version shines when you need more than the number, like *which day* was the hottest.

**3. Building a new list.** Start with an empty list, and `append` only the items you want to keep:

```python
ages = [12, 19, 15, 21, 30]
adults = []

for age in ages:
    if age >= 18:
        adults.append(age)
print(adults)  # prints: [19, 21, 30]
print(ages)    # prints: [12, 19, 15, 21, 30]
```

The original `ages` list doesn't change.

> In [chapter 15](../15-comprehensions/notes.md) you'll learn a shorter way to write this last pattern, called a comprehension. Knowing the loop version first means you'll understand what the shortcut is doing for you.

### Lists inside lists

A list can hold other lists. That's called a **nested list**, and it's perfect for grids, like a tic-tac-toe board:

```python
board = [
    ["X", "O", "X"],
    ["O", "X", "O"],
    [" ", " ", "X"],
]

print(board[0][2])  # prints: X
board[2][0] = "O"

for row in board:
    print(" | ".join(row))
```

You'll see:

```
X
X | O | X
O | X | O
O |   | X
```

`board[0]` is the first row, which is itself a list. `board[0][2]` is the item at index 2 of that row. Read it as "row 0, column 2". (The comma after the last row is allowed, and many people add it so every row looks the same.)

Small lists inside a list are also handy for simple records, like a name and a score:

```python
students = [["Ana", 90], ["Ben", 75], ["Cara", 82]]

for student in students:
    print(f"{student[0]} scored {student[1]}")
```

You'll see:

```
Ana scored 90
Ben scored 75
Cara scored 82
```

It works, but `student[1]` doesn't say much. [Chapter 12](../12-tuples-and-sets/notes.md) shows a neater way to unpack pairs like this, and [chapter 13](../13-dictionaries/notes.md) gives every piece a name.

### From text to a list and back: `split()` and `join()`

You met `split()` and `join()` in chapter 06. Now you know what they really work with: lists. `split()` turns a string into a list, and `join()` turns a list back into a string. They're opposites:

```python
line = "Tokyo,Paris,Lima"
cities = line.split(",")
print(cities)              # prints: ['Tokyo', 'Paris', 'Lima']
print(len(cities))         # prints: 3
print(" | ".join(cities))  # prints: Tokyo | Paris | Lima
```

With no argument, `split()` splits on any spaces, which is great for counting words:

```python
sentence = "the quick brown fox"
words = sentence.split()
print(words)       # prints: ['the', 'quick', 'brown', 'fox']
print(len(words))  # prints: 4
```

Remember that `join()` is a method of the *separator* string, and it only joins strings. Numbers have to become strings first:

```python
numbers = [1, 2, 3]
as_text = []
for number in numbers:
    as_text.append(str(number))
print(", ".join(as_text))  # prints: 1, 2, 3
```

`list()` turns other things into a list. Give it a string, and you get a list of letters. Give it a `range()`, and you get the numbers:

```python
letters = list("stressed")
print(letters)  # prints: ['s', 't', 'r', 'e', 's', 's', 'e', 'd']
letters.reverse()
print("".join(letters))  # prints: desserts
print(list(range(5)))    # prints: [0, 1, 2, 3, 4]
```

### Lists and functions

A list is a value like any other, so you can pass it into a function and return one from a function:

```python
def average(numbers):
    """Return the average of a list of numbers."""
    return sum(numbers) / len(numbers)

print(average([80, 90, 100]))  # prints: 90.0
```

There's one thing that surprises people. When you pass a list into a function, the function gets the **same** list, not a copy. So if the function changes it, your list changes too:

```python
def add_bonus(scores, bonus):
    """Add a bonus to every score in the list."""
    for i in range(len(scores)):
        scores[i] = scores[i] + bonus

class_scores = [70, 85, 60]
add_bonus(class_scores, 5)
print(class_scores)  # prints: [75, 90, 65]
```

Notice `add_bonus` has no `return`. It didn't need one, because it changed the list you gave it. Sometimes that's what you want. When it isn't, build and return a new list instead (pattern 3 above).

### Two names, one list (a preview)

Here's the same surprise without a function:

```python
original = ["milk", "eggs"]
also_original = original
also_original.append("bread")
print(original)  # prints: ['milk', 'eggs', 'bread']
```

We added bread to `also_original`, but `original` changed too! That's because `also_original = original` doesn't copy the list. It sticks a second name tag on the **same** list. Think of a shared shopping list on the fridge: two people can call it different things, but there's only one piece of paper.

With numbers and strings, you never notice this, because they can't be changed in place. With lists, you will. [Chapter 16](../16-scope-and-mutability/notes.md) explains exactly what's going on, and how to make a real copy when you need one.

### Is the list empty?

In chapter 08 you learned that some values are **falsy** (they count as `False` in an `if`). An empty list is one of them, and a list with anything in it is **truthy**:

```python
cart = []
if cart:
    print("Ready to check out!")
else:
    print("Your cart is empty.")
# prints: Your cart is empty.
```

So `if cart:` reads as "if the cart has anything in it". You'll also see `if len(cart) == 0:`, which does the same job and is fine too.

## Common mistakes

**1. Reading past the end of the list**

```python
podium = ["gold", "silver", "bronze"]
print(podium[3])
# IndexError: list index out of range
```

The last index is always one less than the length: 2 here, not 3. When you want the last item, use `podium[-1]`.

The same mistake hides in loops. This loop prints `silver` and `bronze`, then crashes with the same `IndexError`:

```python
podium = ["gold", "silver", "bronze"]
for i in range(1, len(podium) + 1):
    print(podium[i])
```

It skips `gold` at index 0 and then asks for index 3. This is called an **off-by-one error**, and every programmer makes it sometimes. Fix: `for i in range(len(podium)):`, or better, `for medal in podium:`, which can't run off the end.

**2. Saving the result of `sort()`**

```python
scores = [72, 95, 88]
scores = scores.sort()
print(scores[0])
# TypeError: 'NoneType' object is not subscriptable
```

`sort()` sorts the list in place and gives back `None`. So `scores = scores.sort()` throws your list away and keeps `None`. **Subscriptable** means "you can use `[ ]` on it", and `None` can't. Fix: either `scores.sort()` on its own line, or `scores = sorted(scores)`. The same goes for `append`, `insert`, `extend`, `remove` and `reverse`: they all give back `None`.

**3. Using `append` when you meant `extend`**

```python
numbers = [1, 2]
numbers.append([3, 4])
print(numbers)       # prints: [1, 2, [3, 4]]
print(len(numbers))  # prints: 3
```

`append` adds exactly **one** item. Here that one item is a whole list, so you get a list inside a list. To add each item separately, use `numbers.extend([3, 4])`, which gives `[1, 2, 3, 4]`. (And `numbers.append(3, 4)` is an error: `TypeError: list.append() takes exactly one argument (2 given)`.)

**4. Removing items from a list while looping over it**

```python
numbers = [2, 4, 6, 8]
for n in numbers:
    if n % 2 == 0:
        numbers.remove(n)
print(numbers)  # prints: [4, 8]
```

Every number is even, so you'd expect an empty list. But each time an item is removed, the rest slide along one place, and the loop skips the item that slid into the gap. Fix: don't change a list while you loop over it. Build a new list of the items you want to keep (pattern 3), and use that.

**5. Joining numbers**

```python
ages = [25, 31]
print(", ".join(ages))
# TypeError: sequence item 0: expected str instance, int found
```

`join` only glues strings together. Turn each number into a string with `str()` first, as in the `join` section above.

**6. Expecting the loop variable to change the list**

```python
prices = [100, 250, 80]
for price in prices:
    price = price * 2
print(prices)  # prints: [100, 250, 80]
```

No error, but nothing changed. `price` is a temporary name for each item, and giving it a new value doesn't reach back into the list. Fix: loop with `for i in range(len(prices)):` and set `prices[i]`.

## Quick recap

- A list is an ordered collection in one variable: `days = ["Mon", "Tue", "Wed"]`.
- Indexes start at 0. `-1` is the last item. Going past the end gives `IndexError`. Slices like `[1:3]` make a copy and never give an error.
- Lists are mutable. Add with `append`, `insert` and `extend`. Remove with `remove` (by value), `pop` (by index, and you get it back) and `del`.
- Find things with `in`, `index` and `count`. Get quick answers with `len`, `min`, `max` and `sum`.
- `sort()` changes the list and gives back `None`. `sorted()` gives you a new sorted list and leaves the original alone.
- Loop with `for item in items`. Add `enumerate` for a position, or use `range(len(items))` to change items.
- `split()` turns text into a list, and `join()` turns a list of strings back into text.
- A second name for a list, or a list passed to a function, is the **same** list, not a copy (more in chapter 16).

---

**Next:** try the [exercises](exercises.md), then move on to [12 Tuples and Sets](../12-tuples-and-sets/notes.md).
