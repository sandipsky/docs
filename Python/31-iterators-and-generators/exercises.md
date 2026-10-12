# 31 Iterators and Generators: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.py`, `ex2.py`, and so on).
- Run each one with `python ex1.py` from a terminal opened in this folder.
- Put type hints on every function, and check each file with `python -m mypy ex1.py` (with your virtual environment active, like in [chapter 25](../25-type-hints/notes.md)). Generators get `-> Iterator[...]`, from `collections.abc`.
- Exercise 4 uses `itertools.batched`, which needs Python 3.12 or newer. Check yours with `python --version`.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Next customer, please

A bakery has a queue, and two counters. Start `ex1.py` with this list:

```python
queue = ["Maya", "Leo", "Zoe", "Priya", "Sam"]
```

Then, without changing the list:

1. Make an iterator over `queue` with `iter()`, and call it `customers`.
2. Counter 1 serves the first two customers. Use `next()` twice, printing `Serving Maya` and `Serving Leo`.
3. Counter 2 opens. Use a `for` loop over `customers` to serve everyone who's left, printing `Counter 2 serves Zoe` and so on.
4. Print `Next up: ` followed by `next(customers, "nobody")`.
5. Print `queue`.

Expected output:

```
Serving Maya
Serving Leo
Counter 2 serves Zoe
Counter 2 serves Priya
Counter 2 serves Sam
Next up: nobody
['Maya', 'Leo', 'Zoe', 'Priya', 'Sam']
```

Then answer these in comments at the bottom of the file:

1. Why didn't the `for` loop start with Maya?
2. What would `next(customers)` do at the end, without the `"nobody"`? Write the exception's name.
3. What would happen if your `for` loop said `for name in queue:` instead? Try it, then put it back.

<details>
<summary>Hint 1</summary>

An iterator is a bookmark. `next()` moves it forward, and a `for` loop over the same iterator carries on from wherever the bookmark is.

</details>

<details>
<summary>Hint 2</summary>

For question 3, remember what a `for` loop does first: it calls `iter()` on what you give it. What does `iter()` on a list give you, a used bookmark or a fresh one?

</details>

---

## Exercise 2 (Easy): Seat labels for the cinema

A cinema prints a label for every seat: the row letter, then the seat number, like `A1`. Write a generator function:

```python
def seat_labels(rows: str, seats_per_row: int) -> Iterator[str]:
```

`rows` is a string of row letters, like `"AB"`. For each row, it yields the labels for seats 1 up to `seats_per_row`, in order. Use `yield`, not a list.

Test code:

```python
labels = seat_labels("AB", 3)
print(next(labels))
print(next(labels))
print(list(labels))
print(list(labels))
print(list(seat_labels("XYZ", 2)))
print(sum(1 for label in seat_labels("ABCDEFGHIJ", 12)))
```

Expected output:

```
A1
A2
['A3', 'B1', 'B2', 'B3']
[]
['X1', 'X2', 'Y1', 'Y2', 'Z1', 'Z2']
120
```

Answer in a comment: why is the second `list(labels)` empty, when the first one wasn't? And why does the last line work out 120 without ever building a list of 120 labels?

<details>
<summary>Hint 1</summary>

It's a loop inside a loop ([chapter 09](../09-loops/notes.md)): the outer one goes through the letters of `rows`, the inner one through the seat numbers with `range()`. The `yield` goes in the inner loop. (And don't forget `from collections.abc import Iterator` at the top, for the hint.)

</details>

---

## Exercise 3 (Medium): The gym log

Sandip keeps a log of his workouts in a text file. Save these lines as `gym.txt` in this folder:

```
# Sandip's gym log: date, exercise, sets x reps, kg
2026-10-01,squat,3x8,60
2026-10-01,bench press,3x10,40

2026-10-03,deadlift,2x5,90
# felt tired today
2026-10-03,squat,3x8,62.5
2026-10-06,bench press,3x8,45
2026-10-06,squat,4x6,65
```

Lines starting with `#` are comments, and blank lines should be skipped. Start `ex3.py` with this:

```python
from collections.abc import Iterable, Iterator
from dataclasses import dataclass
from datetime import date
from pathlib import Path

LOG_FILE = Path(__file__).parent / "gym.txt"


@dataclass
class Workout:
    day: date
    exercise: str
    sets: int
    reps: int
    kg: float
```

Now build a pipeline of three generator functions, like the log example in the notes:

```python
def read_entries(path: Path) -> Iterator[str]:
```

Yields each line of the file, stripped, skipping blank lines and lines that start with `#`.

```python
def parse_workouts(lines: Iterable[str]) -> Iterator[Workout]:
```

Turns each line like `2026-10-03,squat,3x8,62.5` into a `Workout`, with a real `date` ([chapter 22](../22-dates-and-times/notes.md)) and real numbers.

```python
def only(workouts: Iterable[Workout], exercise: str) -> Iterator[Workout]:
```

Lets through only the workouts for one exercise.

Then add this helper, exactly as it is:

```python
def all_workouts() -> Iterator[Workout]:
    """Build a fresh pipeline (a generator only works once)."""
    return parse_workouts(read_entries(LOG_FILE))
```

Each question below calls `all_workouts()` again, so each one gets its own fresh generator to use up.

And one more function, which uses `next()` with a generator expression to find the first workout heavier than `kg` (no `for` loop allowed in this one):

```python
def first_over(kg: float) -> str:
```

Test code:

```python
print(list(read_entries(LOG_FILE))[:2])
print(next(all_workouts()))
for workout in only(all_workouts(), "squat"):
    print(f"{workout.day}  {workout.sets}x{workout.reps} at {workout.kg} kg")

total = sum(w.sets * w.reps * w.kg for w in all_workouts())
print(f"Total lifted: {total:,.0f} kg")
print(f"Heaviest weight: {max(w.kg for w in all_workouts())} kg")
print(first_over(80))
print(first_over(100))
```

Expected output:

```
['2026-10-01,squat,3x8,60', '2026-10-01,bench press,3x10,40']
Workout(day=datetime.date(2026, 10, 1), exercise='squat', sets=3, reps=8, kg=60.0)
2026-10-01  3x8 at 60.0 kg
2026-10-03  3x8 at 62.5 kg
2026-10-06  4x6 at 65.0 kg
Total lifted: 7,680 kg
Heaviest weight: 90.0 kg
First lift over 80 kg: deadlift on 2026-10-03
No lift over 100 kg yet
```

And `python -m mypy ex3.py` says `Success: no issues found in 1 source file`.

<details>
<summary>Hint 1</summary>

`read_entries` is almost the same as `read_lines` in the notes. Add `and not line.startswith("#")` to the `if`.

</details>

<details>
<summary>Hint 2</summary>

In `parse_workouts`, split twice: first the line at the commas into four pieces, then the `"3x8"` piece at the `"x"` into sets and reps. Then build the `Workout` with `date.fromisoformat(...)`, `int(...)` and `float(...)`, and `yield` it.

</details>

<details>
<summary>Hint 3</summary>

In `first_over`, `next((w for w in all_workouts() if w.kg > kg), None)` gives you a `Workout` or `None`. Check for `None` first, as in [chapter 25](../25-type-hints/notes.md), and mypy will be happy with the rest.

</details>

---

## Exercise 4 (Medium): Pickup codes at the cafe

A cafe gives every drink a pickup code, like `T-001`, and the barista makes drinks in batches of three. Start `ex4.py` with:

```python
from collections.abc import Iterator
from itertools import batched, chain, count, islice

online = ["latte", "tea", "mocha"]
at_counter = ["juice", "latte", "espresso", "hot chocolate"]
```

1. Write an **endless** generator that hands out codes with a prefix, a dash, and a number with three digits, starting at 1. Use `count()` inside it:

   ```python
   def pickup_codes(prefix: str) -> Iterator[str]:
   ```

2. Print the first three codes with prefix `T`, using `islice`. Then make a second generator with prefix `A` and print its first two codes with `next()`.
3. Put the online orders and the counter orders together with `chain`, and pair each drink with a code from a new `pickup_codes("T")` using `zip`. Keep the pairs in a list called `tickets`, and print each one.
4. Use `batched` to split `tickets` into batches of 3, and print each batch on one line, numbered from 1.

Expected output:

```
['T-001', 'T-002', 'T-003']
A-001
A-002
T-001  latte
T-002  tea
T-003  mocha
T-004  juice
T-005  latte
T-006  espresso
T-007  hot chocolate
Batch 1: T-001 latte, T-002 tea, T-003 mocha
Batch 2: T-004 juice, T-005 latte, T-006 espresso
Batch 3: T-007 hot chocolate
```

Answer in a comment: `pickup_codes("T")` never ends, so why does the `zip` in step 3 stop after seven pairs?

<details>
<summary>Hint 1</summary>

`for number in count(1):` is an endless loop that counts up. Yield an f-string with the zero padding from [chapter 06](../06-strings/notes.md): `{number:03}`.

</details>

<details>
<summary>Hint 2</summary>

`zip(pickup_codes("T"), chain(online, at_counter))` gives `(code, drink)` pairs. `zip` stops as soon as one of its inputs runs out.

</details>

<details>
<summary>Hint 3</summary>

For the batches, `enumerate(batched(tickets, 3), start=1)` gives you the batch number too. Each batch is a tuple of `(code, drink)` pairs, so `", ".join(...)` with a generator expression turns it into one line.

</details>

---

## Exercise 5 (Challenge): A to-do list you can loop over

Time to give the to-do app from [chapter 26](../26-project-todo-app/notes.md) a proper class, using classes ([chapter 27](../27-classes-and-objects/notes.md)), a dunder method ([chapter 29](../29-dunder-methods/notes.md)), a dataclass ([chapter 30](../30-dataclasses-and-enums/notes.md)) and generators. Start `ex5.py` with this `Task`:

```python
from collections.abc import Iterator
from dataclasses import dataclass
from datetime import date, timedelta
from itertools import count


@dataclass
class Task:
    id: int
    title: str
    due: date | None = None
    done: bool = False

    def is_overdue(self, today: date) -> bool:
        return not self.done and self.due is not None and self.due < today
```

Write a `TaskList` class with:

- `__init__(self) -> None`: an empty list of tasks, and an ID counter made with `count(1)`.
- `add(self, title: str, due: date | None = None) -> Task`: makes a task with the next ID from the counter, stores it, and returns it.
- `__len__`: the number of tasks.
- `__iter__`: hands out every task in order. **It must be a generator** (use `yield`).
- `still_to_do(self) -> Iterator[Task]`: the tasks that aren't done.
- `overdue(self, today: date) -> Iterator[Task]`: the overdue tasks.
- `due_soon(self, today: date, days: int) -> Iterator[Task]`: the tasks that aren't done and are due between `today` and `days` days later (both days included).
- `mark_done(self, task_id: int) -> Task`: finds the task with `next()` and a generator expression (no `for` loop in this method), sets `done` to `True`, and returns it. If there's no such task, it raises `ValueError` with the message `there's no task with ID 9` (with the real ID).

Test code:

```python
today = date(2026, 10, 12)
todo = TaskList()
todo.add("Buy milk", date(2026, 10, 10))
todo.add("Call grandma")
todo.add("Pay rent", date(2026, 10, 15))
todo.add("Renew passport", date(2029, 3, 1))
todo.add("Return library books", date(2026, 10, 11))

print(f"{len(todo)} tasks")
for task in todo:
    print(f"{task.id}. {task.title}")

print([task.title for task in todo.overdue(today)])
print([task.title for task in todo.due_soon(today, 7)])

done = todo.mark_done(1)
print(f"Done: {done.title}")
print([task.title for task in todo.overdue(today)])
print(sum(1 for task in todo.still_to_do()))

try:
    todo.mark_done(9)
except ValueError as e:
    print(f"Error: {e}")

late = todo.overdue(today)
print(next(late).title)
print(next(late, None))
print(todo.add("Water the plants").id)
```

Expected output:

```
5 tasks
1. Buy milk
2. Call grandma
3. Pay rent
4. Renew passport
5. Return library books
['Buy milk', 'Return library books']
['Pay rent']
Done: Buy milk
['Return library books']
4
Error: there's no task with ID 9
Return library books
None
6
```

And `python -m mypy ex5.py` says `Success: no issues found in 1 source file`.

<details>
<summary>Hint 1</summary>

Store the counter on the object in `__init__`: `self.ids = count(1)`. Then `next(self.ids)` in `add` gives 1, then 2, then 3, and it never hands out the same ID twice.

</details>

<details>
<summary>Hint 2</summary>

Once `__iter__` works, your other generator methods can loop over `self` itself: `for task in self:`. And `due_soon` can loop over `self.still_to_do()`. The chained comparisons from [chapter 04](../04-operators/notes.md) work with dates too: `today <= task.due <= last_day`, where `last_day` is `today + timedelta(days=days)`.

</details>

<details>
<summary>Hint 3</summary>

In `mark_done`, `next((t for t in self if t.id == task_id), None)` is the whole search. mypy knows the result is `Task | None`, so check for `None` and raise before you change anything.

</details>

---

## Before you move on

You've now seen functions that pause in the middle (generators), functions stored on objects (methods), and lines starting with `@` that you've been copying since chapter 27: `@property`, `@dataclass`, `@classmethod`.

In [chapter 32](../32-decorators/notes.md), you'll find out what that `@` really does. It turns out functions are values, just like numbers and lists: you can pass them around, wrap them, and hand back new ones. That's how you add timing, logging or retrying to any function without touching its code.
