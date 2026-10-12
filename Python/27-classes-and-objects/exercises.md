# 27 Classes and Objects: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.py`, `ex2.py`, and so on).
- Run each one with `python ex1.py` from a terminal opened in this folder.
- Put type hints on every method's parameters and return value (but not on `self`). Check each file with `python -m mypy ex1.py` from your virtual environment, like in [chapter 25](../25-type-hints/notes.md).
- Each exercise gives you test code to put at the bottom of your file. Your output should match the expected output exactly.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): A library book

Write a `Book` class for a reading tracker.

- `__init__` takes a `title`, an `author` and the number of `pages`, and stores them as attributes. It also sets a `pages_read` attribute to `0`, because every book starts unread. (`pages_read` is **not** a parameter.)
- `read(pages)` adds to `pages_read`, but never past the end of the book. Reading 500 pages of a 412-page book leaves you at 412.
- `is_finished()` returns `True` once every page has been read.
- `describe()` **returns** (doesn't print) a string like `Dune by Frank Herbert, 250 of 412 pages read`.

Test code:

```python
dune = Book("Dune", "Frank Herbert", 412)
matilda = Book("Matilda", "Roald Dahl", 240)

print(dune.describe())
dune.read(150)
dune.read(100)
print(dune.describe())
print(dune.is_finished())
dune.read(500)
print(dune.describe())
print(dune.is_finished())
print(matilda.describe())

shelf = [dune, matilda, Book("Emma", "Jane Austen", 474)]
print([book.title for book in shelf if not book.is_finished()])
```

Expected output:

```
Dune by Frank Herbert, 0 of 412 pages read
Dune by Frank Herbert, 250 of 412 pages read
False
Dune by Frank Herbert, 412 of 412 pages read
True
Matilda by Roald Dahl, 0 of 240 pages read
['Matilda', 'Emma']
```

Notice that reading *Dune* didn't change *Matilda* at all: each book has its own `pages_read`.

<details>
<summary>Hint 1</summary>

An attribute doesn't have to come from a parameter. Inside `__init__`, `self.pages_read = 0` is perfectly fine, just like `self.done = False` in the notes' `Task` class.

</details>

<details>
<summary>Hint 2</summary>

To stop at the end of the book, work out the new total, then take the smaller of that and `self.pages`. `min()` from [chapter 05](../05-numbers-and-math/notes.md) does that in one step.

</details>

---

## Exercise 2 (Easy): Fix the loyalty card

A coffee shop gives every customer a card that collects stamps. Every 5 stamps earn a free coffee. Here's the program, but it has **four** bugs. Copy it into `ex2.py`, exactly as it is:

```python
class LoyaltyCard:
    """A coffee shop card. Every 5 stamps earn a free coffee."""

    def __int__(self, owner: str) -> None:
        self.owner = owner
        stamps = 0

    def add_stamp() -> None:
        self.stamps += 1

    def free_coffees(self) -> int:
        return self.stamps // 5


card = LoyaltyCard("Priya")
for visit in range(7):
    card.add_stamp()
print(f"{card.owner} has {card.stamps} stamps")
print(f"Free coffees earned: {card.free_coffees}")
```

Run it. It crashes straight away with `TypeError: LoyaltyCard() takes no arguments`. Python stops at the first problem, so you'll meet the bugs one at a time. Fix that one, run it again, read the next error, and so on.

Now run `python -m mypy ex2.py` on the **original** code too (undo your fixes, or copy it into a second file). mypy reports six errors, but they come from only three of the bugs. The fourth bug isn't an error at all, for Python or for mypy. You'll only spot it by looking at the output.

When everything is fixed, mypy says `Success`, and Python prints:

```
Priya has 7 stamps
Free coffees earned: 1
```

For each bug, write a short comment in your file that says what was wrong, and which section of the notes' "Common mistakes" it matches.

<details>
<summary>Hint 1</summary>

"Takes no arguments" for your own class almost always means one thing: Python can't find a correctly spelled `__init__`. Count the letters.

</details>

<details>
<summary>Hint 2</summary>

`card.add_stamp()` passes one argument (the card itself). How many parameters does `add_stamp` have room for? And inside `__init__`, is `stamps = 0` stored on the card, or is it a local variable?

</details>

<details>
<summary>Hint 3</summary>

If the last line prints something like `<bound method LoyaltyCard.free_coffees of ...>`, the method was mentioned, but never called.

</details>

---

## Exercise 3 (Medium): A shopping cart class

In [chapter 14](../14-project-shopping-cart/notes.md), your shopping cart was a dictionary passed around between loose functions. Now make it a class, so that each customer gets their own cart.

Start `ex3.py` with this price list (in cents) and helper function:

```python
PRICES = {"apple": 50, "bread": 250, "milk": 120, "cheese": 450}  # in cents


def format_money(cents: int) -> str:
    return f"${cents / 100:.2f}"
```

Then write a `ShoppingCart` class:

- `__init__(owner)` stores the owner's name, and an empty dictionary called `items` for the item names and their quantities.
- `add(item, quantity=1)` adds to the cart. Adding apples twice adds up the quantities. It raises `ValueError("we don't sell pizza")` (with the real item name) for anything that isn't in `PRICES`, and `ValueError("quantity must be at least 1")` for a quantity below 1.
- `remove(item)` takes an item out of the cart completely. It raises `ValueError("there's no cheese in the cart")` (with the real item name) if it isn't there.
- `item_count()` returns how many things are in the cart altogether (5 apples and 1 bread is 6).
- `total_cents()` returns the total price in cents.
- `print_receipt()` prints the owner's cart, one line per item, then a summary line. Each item line is two spaces, the item name padded to 8 characters, an `x`, the quantity padded to 4 characters, and the line's total, lined up on the right in 7 characters. The summary line is two spaces, then something like `6 items, total $5.00`.

Test code:

```python
maya_cart = ShoppingCart("Maya")
leo_cart = ShoppingCart("Leo")

maya_cart.add("apple", 3)
maya_cart.add("bread")
maya_cart.add("apple", 2)
leo_cart.add("milk", 2)

for item, quantity in [("pizza", 1), ("cheese", 0)]:
    try:
        maya_cart.add(item, quantity)
    except ValueError as e:
        print(f"Error: {e}")

maya_cart.print_receipt()
leo_cart.print_receipt()

maya_cart.remove("bread")
print(maya_cart.item_count(), format_money(maya_cart.total_cents()))

try:
    leo_cart.remove("cheese")
except ValueError as e:
    print(f"Error: {e}")
```

Expected output:

```
Error: we don't sell pizza
Error: quantity must be at least 1
Maya's cart
  apple   x5     $2.50
  bread   x1     $2.50
  6 items, total $5.00
Leo's cart
  milk    x2     $2.40
  2 items, total $2.40
5 $2.50
Error: there's no cheese in the cart
```

And `python -m mypy ex3.py` says `Success: no issues found in 1 source file`.

<details>
<summary>Hint 1</summary>

The empty dictionary needs a hint, or mypy will ask for one: `self.items: dict[str, int] = {}`. Make it inside `__init__`, not as a class attribute. (Why? See mistake 6 in the notes.)

</details>

<details>
<summary>Hint 2</summary>

For adding up quantities, `.get(item, 0)` from [chapter 13](../13-dictionaries/notes.md) gives 0 for an item that isn't in the cart yet. For removing, `del` removes a key from a dictionary.

</details>

<details>
<summary>Hint 3</summary>

`print_receipt` can call the object's other methods: `self.item_count()` and `self.total_cents()`. Methods use `self.` to reach each other, just like attributes. For the padding, look at f-string alignment in [chapter 06](../06-strings/notes.md): `{item:<8}` and `{text:>7}`.

</details>

---

## Exercise 4 (Medium): A safe thermostat

A smart home has a thermostat in every room. Nobody should be able to set a room to a silly temperature, so all changes go through methods that check the limits. Write a `Thermostat` class:

- Two class attributes: `MIN_TEMP = 10` and `MAX_TEMP = 30`. They're the same for every thermostat.
- `__init__(room, temperature=20)` stores the room name in a normal attribute, and the temperature in `_temperature`. If the starting temperature is outside the limits, it raises `ValueError("the temperature must be between 10 and 30")`.
- A read-only property `temperature` that returns `_temperature`.
- `warmer(degrees=1)` and `cooler(degrees=1)` change the temperature. If the change would go past a limit, they raise `ValueError("can't go above 30")` or `ValueError("can't go below 10")`, and leave the temperature as it was.

**Important:** don't type the numbers `10` and `30` anywhere except the two class attributes. Every check and every message must use the class attributes. The end of the test code shows why.

Test code:

```python
living_room = Thermostat("Living room")
bedroom = Thermostat("Bedroom", 17)

living_room.warmer()
living_room.warmer(3)
bedroom.cooler(2)
print(f"{living_room.room}: {living_room.temperature}")
print(f"{bedroom.room}: {bedroom.temperature}")

try:
    living_room.warmer(10)
except ValueError as e:
    print(f"Error: {e}")
print(f"{living_room.room}: {living_room.temperature}")

try:
    bedroom.cooler(6)
except ValueError as e:
    print(f"Error: {e}")

try:
    garage = Thermostat("Garage", 5)
except ValueError as e:
    print(f"Error: {e}")

print(Thermostat.MIN_TEMP, Thermostat.MAX_TEMP)

Thermostat.MAX_TEMP = 25  # the landlord lowers the limit for every room
try:
    bedroom.warmer(11)
except ValueError as e:
    print(f"Error: {e}")

living_room.temperature = 35
```

Expected output:

```
Living room: 24
Bedroom: 15
Error: can't go above 30
Living room: 24
Error: can't go below 10
Error: the temperature must be between 10 and 30
10 30
Error: can't go above 25
```

followed by a traceback that ends with:

```
AttributeError: property 'temperature' of 'Thermostat' object has no setter
```

That crash is on purpose: it proves nobody can skip your checks. mypy reports the last line too (`Property "temperature" defined in "Thermostat" is read-only`). Delete that line, and mypy says `Success`.

<details>
<summary>Hint 1</summary>

Inside the methods, read the limits as `Thermostat.MAX_TEMP` (or `self.MAX_TEMP`, which finds the same class attribute). Both work with the landlord's change at the end.

</details>

<details>
<summary>Hint 2</summary>

Check first, change second. Work out what the new temperature *would* be, raise if it's past the limit, and only then update `self._temperature`. Python lets you chain comparisons: `low <= value <= high` is a neat way to check a range. The property itself is the `@property` pattern from the notes, with `temperature` in place of `balance`.

</details>

---

## Exercise 5 (Challenge): A to-do list that saves itself

Time to rebuild the heart of the chapter 26 app with classes. You'll need [chapter 20](../20-files-and-folders/notes.md) (files and `pathlib`), [chapter 21](../21-json-and-csv/notes.md) (JSON), [chapter 22](../22-dates-and-times/notes.md) (dates) and [chapter 18](../18-error-handling/notes.md) (raising errors).

Start `ex5.py` with the `Task` class from the end of the notes, then add:

1. A method `Task.to_dict(self) -> dict[str, Any]` that returns the task as a dictionary that JSON can store, with the keys `"id"`, `"title"`, `"done"` and `"due"`. The due date becomes ISO text like `"2026-10-08"`, or `None` if there isn't one.
2. A normal function (outside any class) `task_from_dict(data: dict[str, Any]) -> Task` that does the opposite: it builds a `Task` from one of those dictionaries, with a real `date` and the right `done` value.
3. A `TodoList` class that keeps its tasks in a list called `_tasks` (internal, so it has an underscore). It has these methods:

   | Method | What it does |
   |---|---|
   | `__init__(self) -> None` | Starts with an empty list of tasks. |
   | `count(self) -> int` | Returns how many tasks there are. |
   | `add(self, title: str, due: date \| None = None) -> Task` | Strips the spaces off the title, makes a new task with the next free ID (one more than the biggest, or 1 for the first), adds it, and returns it. An empty title raises `ValueError("the task needs a title")`. |
   | `find(self, task_id: int) -> Task \| None` | Returns the task with that ID, or `None`. |
   | `mark_done(self, task_id: int) -> Task` | Marks the task as done and returns it. A missing ID raises `ValueError("there's no task with ID 9")` (with the real ID). |
   | `overdue(self, today: date) -> list[Task]` | Returns the tasks that are overdue on that day. |
   | `save(self, path: Path) -> None` | Saves every task to a JSON file, indented by 2. |
   | `load(self, path: Path) -> None` | Replaces the tasks with the ones in a JSON file. |

Test code:

```python
today = date(2026, 10, 9)
path = Path("todo_test.json")

todo = TodoList()
todo.add("Buy milk", due=date(2026, 10, 8))
todo.add("Call grandma")
todo.add("Renew passport", due=date(2029, 3, 1))
todo.add("Return library books", due=date(2026, 10, 1))
print(f"{todo.count()} tasks")

finished = todo.mark_done(4)
print(f"Done: {finished.title}")

try:
    todo.add("   ")
except ValueError as e:
    print(f"Error: {e}")

try:
    todo.mark_done(9)
except ValueError as e:
    print(f"Error: {e}")

for task in todo.overdue(today):
    print(f"Overdue: {task.id} {task.title} (due {task.due})")

todo.save(path)

fresh = TodoList()
fresh.load(path)
print(f"Loaded {fresh.count()} tasks")
for task in fresh.overdue(today):
    print(f"Overdue: {task.id} {task.title} (due {task.due})")

library_task = fresh.find(4)
if library_task is not None:
    print(f"Task 4 is still done after loading: {library_task.done}")

new_task = fresh.add("Bake a cake for Maya")
print(f"Added task {new_task.id}: {new_task.title}")
```

Expected output:

```
4 tasks
Done: Return library books
Error: the task needs a title
Error: there's no task with ID 9
Overdue: 1 Buy milk (due 2026-10-08)
Loaded 4 tasks
Overdue: 1 Buy milk (due 2026-10-08)
Task 4 is still done after loading: True
Added task 5: Bake a cake for Maya
```

"Return library books" was due on 1 October, but it isn't overdue, because it's done. Open `todo_test.json` too: each task is a dictionary with the four keys, the due dates are text like `"2026-10-08"`, and "Call grandma" has `"due": null`.

Finish with `python -m mypy ex5.py` saying `Success`.

<details>
<summary>Hint 1</summary>

You'll need these imports at the top: `json`, `date` from `datetime`, `Path` from `pathlib`, and `Any` from `typing`. The list of tasks needs a hint, because it starts empty: `self._tasks: list[Task] = []`.

</details>

<details>
<summary>Hint 2</summary>

`date.fromisoformat()` and `.isoformat()` from chapter 22 turn dates into text and back. Watch out for `None`: you can't call `.isoformat()` on it. A conditional expression from [chapter 08](../08-conditionals/notes.md) handles both cases in one line. In `task_from_dict`, `Task(...)` always starts with `done` set to `False`, so set `task.done` afterwards.

</details>

<details>
<summary>Hint 3</summary>

Methods can call other methods with `self.`. `mark_done` can use `self.find(task_id)` and then the task's own `mark_done()`. `save` can build a list with `[task.to_dict() for task in self._tasks]` and hand it to `json.dump`. `load` does the reverse with `json.load` and `task_from_dict`.

</details>

---

## Before you move on

Look back at your classes. `Book`, `ShoppingCart` and `Thermostat` are all quite different. But imagine a bank with three kinds of account: ordinary, savings and checking. They'd share almost everything: an owner, a balance, deposits and withdrawals. Only a few rules would differ. Copying the whole class three times would mean fixing every bug three times.

[Chapter 28](../28-inheritance/notes.md) shows how one class can build on another, so a `SavingsAccount` gets everything a `BankAccount` has, plus its own extra rules. (And if `todo.count()` felt clumsy next to `len()`, [chapter 29](../29-dunder-methods/notes.md) shows how to make `len(todo)` work.)
