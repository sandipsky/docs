# 34 Functional Tools: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.py`, `ex2.py`, and so on).
- Run each one with `python ex1.py` from a terminal opened in this folder.
- Put type hints on every function you write (lambdas can't have them, and that's fine), and check each file with `python -m mypy ex1.py`. The goal is `Success: no issues found in 1 source file`.
- No `for` loops for sorting or finding the biggest and smallest: that's what `key=` is for. (Loops for printing results are fine.)
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): The bookshelf

Leo is tidying his bookshelf. Start `ex1.py` with his books:

```python
books = ["the Hobbit", "Dune", "Matilda", "a Room with a View",
         "Frankenstein", "Little Women"]
```

Print each of these, one per line, using `sorted()`, `max()` and `key=`:

1. The books in plain `sorted()` order, with no key.
2. The books in alphabetical order, ignoring capital letters.
3. The books from the shortest title to the longest (counting every character, spaces too).
4. Just the one book with the longest title.
5. The books sorted by how many **words** are in the title, fewest first. Books with the same number of words go in alphabetical order, ignoring capitals.
6. The original `books` list, to prove it hasn't changed.

Expected output:

```
['Dune', 'Frankenstein', 'Little Women', 'Matilda', 'a Room with a View', 'the Hobbit']
['a Room with a View', 'Dune', 'Frankenstein', 'Little Women', 'Matilda', 'the Hobbit']
['Dune', 'Matilda', 'the Hobbit', 'Frankenstein', 'Little Women', 'a Room with a View']
a Room with a View
['Dune', 'Frankenstein', 'Matilda', 'Little Women', 'the Hobbit', 'a Room with a View']
['the Hobbit', 'Dune', 'Matilda', 'a Room with a View', 'Frankenstein', 'Little Women']
```

Then answer two questions in comments:

- In line 1, why are `a Room with a View` and `the Hobbit` at the end?
- In line 3, "Frankenstein" and "Little Women" have exactly the same length. Why does "Frankenstein" come first?

<details>
<summary>Hint 1</summary>

Lines 2 to 4 each need a function that already exists. You don't have to write any of them yourself. Remember: hand the function over, without brackets.

</details>

<details>
<summary>Hint 2</summary>

For line 5, a lambda can return a tuple: the number of words first, then the title in small letters. `"a Room with a View".split()` gives you a list of the words, and `len()` counts them.

</details>

<details>
<summary>Hint 3</summary>

For the second question, look at "Sorting is stable" in the notes, and at the order the two books were in the original list.

</details>

---

## Exercise 2 (Easy): The cafe menu

Maya's cafe keeps its prices (in cents) and its stock in two dictionaries. Start `ex2.py` with them:

```python
menu = {"latte": 350, "tea": 225, "mocha": 400,
        "muffin": 300, "flapjack": 275, "smoothie": 450}
stock = {"latte": 40, "tea": 60, "mocha": 0,
         "muffin": 12, "flapjack": 5, "smoothie": 8}
```

Write code that prints:

1. The cheapest and the most expensive item, with their prices.
2. The item with the most in stock.
3. A blank line, then the whole menu, most expensive first, with each name padded to 10 characters.
4. A blank line, then the answers to three questions, using `any()` or `all()`: Is anything sold out? Is everything under $5? Is everything in stock?

Expected output:

```
Cheapest: tea ($2.25)
Dearest: smoothie ($4.50)
Most in stock: tea

smoothie  $4.50
mocha     $4.00
latte     $3.50
muffin    $3.00
flapjack  $2.75
tea       $2.25

Anything sold out? True
Everything under $5? True
Everything in stock? False
```

<details>
<summary>Hint 1</summary>

Look at the "hottest day" example in the notes. `min(menu, ...)` loops over the menu's **names**, and the `key=` can look up each name's price in the dictionary. `min()` then gives you back a name.

</details>

<details>
<summary>Hint 2</summary>

For the full menu, sort `menu.items()`. Each item is a `(name, cents)` pair, so the key needs the second part of the pair. Then turn cents into dollars with `cents / 100` and `:.2f`.

</details>

<details>
<summary>Hint 3</summary>

"Is everything in stock?" can be very short: remember that `0` is falsy ([chapter 08](../08-conditionals/notes.md)), and `all()` checks whether every item is truthy.

</details>

---

## Exercise 3 (Medium): The gym leaderboard

The gym ran a fitness challenge: as many push-ups as possible, and the longest plank. Start `ex3.py` with the results, as a dataclass ([chapter 30](../30-dataclasses-and-enums/notes.md)):

```python
from dataclasses import dataclass


@dataclass
class Result:
    name: str
    push_ups: int
    plank_seconds: int


results = [
    Result("Sandip", 32, 75),
    Result("Maya", 41, 50),
    Result("Leo", 32, 90),
    Result("Zoe", 28, 120),
    Result("Priya", 41, 65),
    Result("Tom", 15, 40),
    Result("Aisha", 32, 75),
]
```

Write code for these jobs:

1. **The leaderboard.** Most push-ups first. When two people did the same number of push-ups, the longer plank wins. If that's a tie too, go alphabetical by name. Number the places with `enumerate` (starting at 1).
2. **The plank club.** Using `filter()` and then `map()`, make a list of the **names** of everyone who held the plank for 60 seconds or more, in the original order.
3. **Points.** Write a function `points(result: Result) -> int`: two points per push-up, plus one point for every whole 10 seconds of plank. Print everyone's points with `map()`, then find the winner with `max()`.
4. **Two questions**, with `all()` and `any()`: did everyone do at least 20 push-ups? Did anyone hold the plank for 2 minutes or more?

Expected output:

```
Leaderboard:
1. Priya   41 push-ups    65s plank
2. Maya    41 push-ups    50s plank
3. Leo     32 push-ups    90s plank
4. Aisha   32 push-ups    75s plank
5. Sandip  32 push-ups    75s plank
6. Zoe     28 push-ups   120s plank
7. Tom     15 push-ups    40s plank
Planked a minute or more: ['Sandip', 'Leo', 'Zoe', 'Priya', 'Aisha']
Points: [71, 87, 73, 68, 88, 34, 71]
Most points: Priya (88)
Everyone did 20 push-ups? False
Anyone plank 2 minutes? True
```

Finally, write job 2 again as a single list comprehension, and add a comment saying which version you find easier to read, and why.

<details>
<summary>Hint 1</summary>

The leaderboard key is a tuple with three parts. You want two of them from high to low and one from A to Z, so use the minus trick from the notes on the two numbers.

</details>

<details>
<summary>Hint 2</summary>

`filter()` gives you an iterator of `Result` objects. Pass that straight into `map()` with a lambda that picks out the `.name`, and wrap the whole thing in `list()`. (Or try `attrgetter("name")` from the `operator` module.)

</details>

<details>
<summary>Hint 3</summary>

"One point for every whole 10 seconds" is floor division from [chapter 04](../04-operators/notes.md): `75 // 10` is `7`. Since `points` already has a name, you can hand it to `map()` and to `max(..., key=points)` directly.

</details>

---

## Exercise 4 (Medium): Climbing the stairs, quickly

A fitness app asks: "In how many different ways can you climb a staircase, if you take 1, 2 or 3 steps at a time?" For 3 steps there are 4 ways: 1+1+1, 1+2, 2+1 and 3.

It's a recursive problem ([chapter 17](../17-recursion/notes.md)). The last move onto the top step was a 1-step, a 2-step or a 3-step, so:

- the ways to climb `n` steps = the ways to climb `n - 1`, plus the ways to climb `n - 2`, plus the ways to climb `n - 3`,
- there's exactly **1** way to climb 0 steps (do nothing),
- and **0** ways to climb a negative number of steps.

**Part 1.** Write `ways(steps: int) -> int` as a plain recursive function, with no cache. Test it with:

```python
import time

print([ways(n) for n in range(1, 8)])
start = time.perf_counter()
print(ways(27))
print(f"took {time.perf_counter() - start:.2f} seconds")
```

You'll see something like this (your time will be different):

```
[1, 2, 4, 7, 13, 24, 44]
8646064
took 1.68 seconds
```

Now add `@cache` from `functools`, change the timing line to show six decimal places (`:.6f`), and add these lines at the end:

```python
print(ways.cache_info())
print(ways(100))
print(ways.cache_info())
```

You'll see something like:

```
[1, 2, 4, 7, 13, 24, 44]
8646064
took 0.000019 seconds
CacheInfo(hits=59, misses=30, maxsize=None, currsize=30)
180396380815100901214157639
CacheInfo(hits=206, misses=103, maxsize=None, currsize=103)
```

Answer in a comment: there were 30 misses after `ways(27)`, not 28. Which values of `steps` were worked out, from the smallest to the biggest? (Count them.)

**Part 2.** The gym also wants a cached function for the price of a bundle of classes. Add this to the same file, exactly as it is:

```python
@cache
def class_price(sessions: list[str]) -> int:
    """Price in cents for a bundle of classes: the third and later are half price."""
    print(f"  (working out the price for {len(sessions)} classes...)")
    prices = {"yoga": 800, "spin": 1000, "boxing": 1200}
    total = 0
    for number, session in enumerate(sessions, start=1):
        price = prices[session]
        total += price if number < 3 else price // 2
    return total


week = ["yoga", "spin", "boxing", "yoga"]
print(class_price(week))
print(class_price(week))
print(class_price.cache_info())
```

Run it, and it crashes with `TypeError: unhashable type: 'list'`. Run mypy too, and see how it warns you. Fix the function and the calls (keep `week` as a list), so the output ends with:

```
  (working out the price for 4 classes...)
2800
2800
CacheInfo(hits=1, misses=1, maxsize=None, currsize=1)
```

The "working out" line appears only once: the second call came from the cache.

<details>
<summary>Hint 1</summary>

Put the two base cases at the top of `ways`: first the negative check, then the zero check. The rest is one `return` line with three recursive calls added together.

</details>

<details>
<summary>Hint 2</summary>

For the question in part 1: when `ways(1)` runs, it calls `ways(0)`, `ways(-1)` and `ways(-2)`. What's the smallest value that ever gets passed in?

</details>

<details>
<summary>Hint 3</summary>

For part 2, look at common mistake 7 in the notes. A tuple can be a dictionary key, and `tuple(week)` turns the list into one. Remember to change the type hint as well.

</details>

---

## Exercise 5 (Challenge): The to-do report

Time to bring back the to-do list from [chapter 26](../26-project-todo-app/notes.md), as `Task` objects from chapter 30, loaded from JSON ([chapter 21](../21-json-and-csv/notes.md)), and turn it into a report.

Start `ex5.py` with the `Priority` enum and the `Task` dataclass from the notes (copy them, methods and all), then this:

```python
TASKS_JSON = """
[
  {"id": 1, "title": "Buy milk", "created": "2026-10-05", "done": false,
   "due": "2026-10-08", "priority": "normal"},
  {"id": 2, "title": "Renew passport", "created": "2026-10-05", "done": false,
   "due": "2029-03-01", "priority": "high"},
  {"id": 3, "title": "Call grandma", "created": "2026-10-06", "done": false,
   "due": null, "priority": "high"},
  {"id": 4, "title": "Water the plants", "created": "2026-10-07", "done": true,
   "due": "2026-10-07", "priority": "low"},
  {"id": 5, "title": "Book the dentist", "created": "2026-09-20", "done": false,
   "due": "2026-10-01", "priority": "high"},
  {"id": 6, "title": "Pay the rent", "created": "2026-10-09", "done": false,
   "due": "2026-10-15", "priority": "high"},
  {"id": 7, "title": "Return library books", "created": "2026-10-01", "done": false,
   "due": "2026-10-11", "priority": "low"},
  {"id": 8, "title": "Post the birthday card", "created": "2026-10-09", "done": false,
   "due": "2027-01-15", "priority": "normal"}
]
"""

TODAY = date(2026, 10, 12)
PRIORITY_RANK = {Priority.HIGH: 0, Priority.NORMAL: 1, Priority.LOW: 2}
```

(`TODAY` is fixed, so everyone gets the same report, whatever day they run it.)

Then:

1. Write `task_from_dict(data: dict[str, Any]) -> Task`, which turns one dictionary from the JSON into a `Task`: dates become `date` objects, a `null` due date becomes `None`, and the priority text becomes a `Priority`. Use it with **`map()`** to turn the whole JSON list into a list of tasks.
2. **Overdue, most overdue first.** Write `days_late(task: Task, today: date) -> int`. Find the overdue tasks with **`filter()`**, and sort them by how many days late they are, most first. Use **`partial()`** at least once here, to fill in `today`. Say "1 day", but "4 days".
3. **Coming up next.** The next three tasks that aren't done and are due today or later, soonest first.
4. **To do, most important first.** Every task that isn't done, by priority (high first), then alphabetically by title.
5. **Waiting longest.** The unfinished task that was created earliest, found with `min()` or `max()`.
6. **Two questions:** is any high-priority task overdue? Is everything done?

Expected output:

```
Report for 2026-10-12

Overdue, most overdue first:
  Book the dentist (11 days late)
  Buy milk (4 days late)
  Return library books (1 day late)

Coming up next:
  2026-10-15  Pay the rent
  2027-01-15  Post the birthday card
  2029-03-01  Renew passport

To do, most important first:
  high    Book the dentist
  high    Call grandma
  high    Pay the rent
  high    Renew passport
  normal  Buy milk
  normal  Post the birthday card
  low     Return library books

Waiting longest: Book the dentist (since 2026-09-20)
Any high priority task overdue? True
All done? False
```

And `python -m mypy ex5.py` says `Success`.

<details>
<summary>Hint 1</summary>

`date.fromisoformat("2026-10-05")` turns text into a `date` ([chapter 22](../22-dates-and-times/notes.md)), and `Priority("high")` looks an enum member up by its value (chapter 30). For the due date, a conditional expression can choose between `date.fromisoformat(...)` and `None`. `json.loads(TASKS_JSON)` gives you the list of dictionaries to hand to `map()`.

</details>

<details>
<summary>Hint 2</summary>

`Task.is_overdue` is a function that takes a task and a `today`. `partial(Task.is_overdue, today=TODAY)` makes a new function that takes just the task, which is exactly what `filter()` wants. The same trick turns `days_late` into a key for `sorted()`. Subtracting two dates gives a `timedelta`, and its `.days` is a whole number.

</details>

<details>
<summary>Hint 3</summary>

mypy doesn't know that you've already removed the tasks with no due date, so a key like `lambda task: task.due` still looks like `date | None` to it. The `task.due or date.max` trick from the notes keeps it happy. For "most important first", a tuple key with `PRIORITY_RANK[...]` and the title in small letters does it.

</details>

---

## Before you move on

You can now tell Python *what to look at* instead of *how to do it*: sorting with `key=`, picking the biggest or smallest of anything, transforming and filtering lists, checking rules with `any()` and `all()`, and making a slow function fast with a cache. These tools turn up in almost every Python program you'll read.

Most of this chapter's keys picked out a piece of an object or a dictionary. Next, you'll learn to pick out pieces of **text**. In [chapter 35](../35-regular-expressions/notes.md), regular expressions let you describe a pattern, like "three digits, then a dash", and find every match in a page of text.
