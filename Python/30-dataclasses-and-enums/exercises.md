# 30 Dataclasses and Enums: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.py`, `ex2.py`, and so on). Exercise 5 works on a copy of your chapter 26 app instead.
- Run each one with `python ex1.py` from a terminal opened in this folder.
- Put type hints on every method and function, and check each file with `python -m mypy ex1.py` (in your virtual environment, like in [chapter 25](../25-type-hints/notes.md)). The goal is always `Success`.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Cinema tickets

A cinema sells tickets for a film and a seat. Most tickets cost $12.00, but some are cheaper. Write a `Ticket` dataclass in `ex1.py` with three fields: `film` (a string), `seat` (a string) and `price_cents` (a whole number, with a default of `1200`). Add a `__str__` method, so that this test code:

```python
t1 = Ticket("Paddington", "F7")
t2 = Ticket("Paddington", "F8", 800)
t3 = Ticket("Paddington", "F7")
print(t1)
print(repr(t2))
print(t1 == t3)
print(t1 == t2)
print([t1, t2])
```

prints:

```
Paddington, seat F7: $12.00
Ticket(film='Paddington', seat='F8', price_cents=800)
True
False
[Ticket(film='Paddington', seat='F7', price_cents=1200), Ticket(film='Paddington', seat='F8', price_cents=800)]
```

Then try two experiments:

1. Move `price_cents` up so it's the first field (keep its default), and run the file. Copy the last line of the error into a comment, explain it in your own words, and move the field back.
2. Add `print(len({t1, t2, t3}))` at the end. You get `TypeError: unhashable type: 'Ticket'`. Change one thing about the `@dataclass` line so that it prints `2` instead. Why `2`, when you put three tickets in the set?

<details>
<summary>Hint 1</summary>

You only write `__str__`. `@dataclass` writes the `__init__`, `__repr__` and `__eq__` for you. For the price, `{self.price_cents / 100:.2f}` turns cents into dollars, like the `Money` class in chapter 29.

</details>

<details>
<summary>Hint 2</summary>

For experiment 2: an object can only go in a set if it can never change. Which option from the notes makes a dataclass unchangeable? (And which two tickets are equal?)

</details>

---

## Exercise 2 (Easy): Coffee sizes

A cafe till takes the cup size as typed by the person at the counter, and they're not always tidy about it. Write `ex2.py` with:

- An enum `Size` with the members `SMALL`, `MEDIUM` and `LARGE`, whose values are `"S"`, `"M"` and `"L"`.
- A function `price_cents(size: Size) -> int` that uses `match` to give 300, 350 or 400 cents.
- A function `parse_size(text: str) -> Size | None` that turns typed text into a `Size`. It ignores spaces around the text and capital letters, and it accepts either the letter (`"m"`) or the full name (`"medium"`). If the text isn't a size at all, it returns `None`.

Test code:

```python
print("Sizes:")
for size in Size:
    print(f"  {size.value}  {size.name:<8}${price_cents(size) / 100:.2f}")
for text in ["m", " L ", "small", "Large", "XL", "medum"]:
    chosen = parse_size(text)
    if chosen is None:
        print(f"{text!r} -> not a size")
    else:
        print(f"{text!r} -> {chosen.name}, ${price_cents(chosen) / 100:.2f}")
```

Expected output:

```
Sizes:
  S  SMALL   $3.00
  M  MEDIUM  $3.50
  L  LARGE   $4.00
'm' -> MEDIUM, $3.50
' L ' -> LARGE, $4.00
'small' -> SMALL, $3.00
'Large' -> LARGE, $4.00
'XL' -> not a size
'medum' -> not a size
```

Finally, add `EXTRA_LARGE = "XL"` to `Size`, without changing `price_cents`, and run mypy. Which line does it complain about, and why is that helpful?

<details>
<summary>Hint 1</summary>

Tidy the text first with `.strip()` and `.upper()` ([chapter 06](../06-strings/notes.md)). Then there are two ways to look a member up: `Size(text)` by its value, and `Size[text]` by its name.

</details>

<details>
<summary>Hint 2</summary>

A bad value gives a `ValueError`, and a bad name gives a `KeyError`. Try one lookup inside a `try`, and if it fails, try the other one inside a second `try` ([chapter 18](../18-error-handling/notes.md)). Only return `None` when both have failed.

</details>

---

## Exercise 3 (Medium): A recipe that scales

Maya wants to cook her pancake recipe for more people. Write `ex3.py` with two dataclasses:

- `Ingredient`, which is **frozen**, with a `name` (string) and `grams` (whole number). Its `__post_init__` refuses a weight that isn't more than 0.
- `Recipe`, with a `name`, a number of `servings`, and a list of `ingredients` that starts empty. Its `__post_init__` refuses fewer than 1 serving. It has two methods:
  - `add(self, name: str, grams: int) -> None` adds an ingredient.
  - `scaled(self, servings: int) -> "Recipe"` returns a **new** recipe for a different number of servings, with every weight changed to match and rounded to a whole number. The original recipe doesn't change.

Test code:

```python
pancakes = Recipe("Pancakes", servings=2)
pancakes.add("flour", 120)
pancakes.add("milk", 300)
pancakes.add("egg", 50)
print(pancakes)

big = pancakes.scaled(5)
print(f"{big.name} for {big.servings}:")
for item in big.ingredients:
    print(f"  {item.name:<6}{item.grams:>5} g")
print(len(pancakes.ingredients))

toast = Recipe("Toast", servings=1)
print(toast)

for servings in [0, -2]:
    try:
        Recipe("Air", servings)
    except ValueError as e:
        print(f"Error: {e}")
try:
    pancakes.add("salt", 0)
except ValueError as e:
    print(f"Error: {e}")
```

Expected output:

```
Recipe(name='Pancakes', servings=2, ingredients=[Ingredient(name='flour', grams=120), Ingredient(name='milk', grams=300), Ingredient(name='egg', grams=50)])
Pancakes for 5:
  flour   300 g
  milk    750 g
  egg     125 g
3
Recipe(name='Toast', servings=1, ingredients=[])
Error: servings must be at least 1, got 0
Error: servings must be at least 1, got -2
Error: salt: grams must be more than 0, got 0
```

Then add `pancakes.ingredients[0].grams = 200` at the end. What happens, and what does mypy say about that line? Answer in a comment: why is it good that `scaled` has to make new `Ingredient` objects instead of changing the old ones?

<details>
<summary>Hint 1</summary>

The list of ingredients needs `field(default_factory=list)`. A plain `= []` is refused (mistake 2 in the notes).

</details>

<details>
<summary>Hint 2</summary>

In `scaled`, make an empty `Recipe` with the new number of servings, then loop over your own ingredients and `add` each one with its new weight. For 2 servings scaled to 5, the new weight is `grams * 5 / 2`, and `round()` from [chapter 05](../05-numbers-and-math/notes.md) makes it whole again.

</details>

<details>
<summary>Hint 3</summary>

Each error message includes the bad value. For the ingredient, it starts with the ingredient's name: `f"{self.name}: grams must be ..."`.

</details>

---

## Exercise 4 (Medium): Gym classes, saved and loaded

A gym keeps its weekly classes in a JSON file. Write `ex4.py` with:

- A `StrEnum` called `Level` with the members `BEGINNER`, `INTERMEDIATE` and `ADVANCED`, whose values are the same words in lowercase.
- A `GymClass` dataclass with a `name` (string), a `day` (a `date`), a `level` (with a default of `Level.BEGINNER`) and `spaces` (with a default of `12`). Give it:
  - `__str__`, for the timetable lines in the expected output below: the date, two spaces, the name padded to 8 characters, the level padded to 14, then the spaces.
  - `to_dict(self) -> dict[str, Any]`, which gives a dictionary that `json` can save.
  - a class method `from_dict(cls, data: dict[str, Any]) -> "GymClass"`, which does the opposite.
- Three functions: `save_classes(classes: list[GymClass], path: Path) -> None`, `load_classes(path: Path) -> list[GymClass]`, and `classes_for(level: Level, classes: list[GymClass]) -> list[GymClass]`, which keeps only the classes at that level.

Test code:

```python
classes = [
    GymClass("Yoga", date(2026, 10, 13)),
    GymClass("Spin", date(2026, 10, 14), Level.ADVANCED, spaces=20),
    GymClass("Pilates", date(2026, 10, 15), Level.INTERMEDIATE),
    GymClass("Boxing", date(2026, 10, 16), Level.ADVANCED, spaces=8),
]
path = Path(__file__).parent / "classes.json"
save_classes(classes, path)
loaded = load_classes(path)
print(loaded == classes)
for gym_class in loaded:
    print(gym_class)
choice = "advanced"  # what input() might give you
print([gym_class.name for gym_class in classes_for(Level(choice), loaded)])
print(repr(loaded[1]))
```

Expected output:

```
True
2026-10-13  Yoga    beginner      12 spaces
2026-10-14  Spin    advanced      20 spaces
2026-10-15  Pilates intermediate  12 spaces
2026-10-16  Boxing  advanced      8 spaces
['Spin', 'Boxing']
GymClass(name='Spin', day=datetime.date(2026, 10, 14), level=<Level.ADVANCED: 'advanced'>, spaces=20)
```

And `classes.json` starts like this:

```
[
  {
    "name": "Yoga",
    "day": "2026-10-13",
    "level": "beginner",
    "spaces": 12
  },
  {
    "name": "Spin",
    "day": "2026-10-14",
    "level": "advanced",
    "spaces": 20
  },
```

<details>
<summary>Hint 1</summary>

Follow `to_dict` and `from_dict` in the finished `Task` from the notes. This time there's only one date to convert, and the level needs nothing on the way out, because a `StrEnum` goes into JSON as plain text. On the way in, `Level(...)` turns the text back into a member.

</details>

<details>
<summary>Hint 2</summary>

Saving and loading use `with open(...)`, `encoding="utf-8"`, `json.dump(..., indent=2)` and `json.load(...)`, like `storage.py` in chapter 26. A list comprehension turns the whole list into dictionaries, or back into `GymClass` objects, in one line.

</details>

<details>
<summary>Hint 3</summary>

Does your timetable show `Level.ADVANCED` instead of `advanced`? Then `Level` is a plain `Enum`, not a `StrEnum`. A `StrEnum` member is a string, so padding like `{self.level:<14}` works on its value.

</details>

---

## Exercise 5 (Challenge): Upgrade your to-do app

In chapter 26, a task was `Task = dict[str, Any]`, and mypy couldn't check anything inside it. Now you'll give your to-do app a real `Task` dataclass, without changing what the app does.

**Setup:** make a new folder called `my-todo-app` in this chapter's folder, and copy three files into it: `todo.py` and `storage.py` from your finished chapter 26 app, and `tasks.json` from chapter 26's `starter` folder. (VS Code's Explorer can copy and paste files between folders.) Open a terminal in the new folder, and make a virtual environment with mypy in it, like in [chapter 26](../26-project-todo-app/notes.md). To reset the sample data at any time, run:

```
Copy-Item ..\..\26-project-todo-app\starter\tasks.json .
```

(In Command Prompt it's `copy ..\..\26-project-todo-app\starter\tasks.json .`, and on Mac or Linux `cp ../../26-project-todo-app/starter/tasks.json .`.)

**Your job:**

1. In `storage.py`, replace the line `Task = dict[str, Any]` with a `Task` dataclass: the five fields, `mark_done`, `is_overdue`, `to_dict` and `from_dict`, like the finished `Task` in the notes, but without the priority for now. Because it's still called `Task`, the line `from storage import ... Task ...` in `todo.py` keeps working.
2. Change `load_tasks` so it returns real `Task` objects, and `save_tasks` so it saves them.
3. Run `python -m mypy todo.py storage.py`. With a real `Task`, mypy can finally see inside a task, so it lists every line in `todo.py` that still treats a task as a dictionary. They look like this (your line numbers will be different):

   ```
   todo.py:42: error: Value of type "Task" is not indexable  [index]
   todo.py:97: error: Argument 1 to "append" of "list" has incompatible type "dict[str, object]"; expected "Task"  [arg-type]
   ```

4. Fix them one by one, until mypy says `Success: no issues found in 2 source files`.

Every command must work exactly as it did in chapter 26. Reset the sample data, then check this session (made on 12 October 2026: if you run it much later, more tasks may show as overdue):

```
python todo.py list --all
 ID  Done  Due         Task
  1  [ ]   2026-10-08  Buy milk  (OVERDUE)
  2  [ ]   2029-03-01  Renew passport
  3  [ ]   -           Call grandma
  4  [x]   2026-10-07  Water the plants
3 to do, 1 overdue, 1 done

python todo.py add "Return library books" --due 2026-10-01
Added task 5: Return library books (due 2026-10-01)

python todo.py add "Pick up parcel" --due 2027-02-30
Error: the due date must look like 2026-10-15, not '2027-02-30'

python todo.py done 1
Marked task 1 as done: Buy milk

python todo.py done 1
Error: task 1 is already done

python todo.py remove 3
Removed task 3: Call grandma

python todo.py clear-done
Cleared 2 done tasks.

python todo.py list
 ID  Done  Due         Task
  2  [ ]   2029-03-01  Renew passport
  5  [ ]   2026-10-01  Return library books  (OVERDUE)
2 to do, 1 overdue, 0 done
```

Open `tasks.json` afterwards. The new task is saved like this (with the day you ran it as `"created"`):

```
  {
    "id": 5,
    "title": "Return library books",
    "created": "2026-10-12",
    "done": false,
    "due": "2026-10-01"
  }
```

The keys now come out in the dataclass's field order, so `"created"` is before `"done"`. That's fine: JSON doesn't care about the order of keys.

**Bonus:** if you did chapter 26's priority exercise, bring it back with the `Priority` enum from the notes, as a sixth field. `--priority urgent` should still give argparse's `invalid choice` error, high-priority tasks still get `! ` in front of their title, and the four sample tasks, which have no `"priority"` key, must still load.

<details>
<summary>Hint 1</summary>

Here's what usually changes in `todo.py`: every `task["title"]` becomes `task.title` (and the same for the other keys). The loose `is_overdue(task, today)` function can go, because the task has its own `task.is_overdue(today)` method. And `mark_done` can call `task.mark_done()`, which already raises `task 1 is already done`.

</details>

<details>
<summary>Hint 2</summary>

Dates are real `date` objects now, so `parse_due` can return `date | None` instead of text, and `add_task` builds a `Task(...)` with `created=today`. In the table, a missing due date still shows as `-`, so you'll need a small check before calling `.isoformat()` on `task.due`.

</details>

<details>
<summary>Hint 3</summary>

For the bonus, argparse's `choices=` can be built from the enum: `[p.value for p in Priority]` gives `["high", "normal", "low"]`. Then `Priority(args.priority)` turns the text into a member. `from_dict` already uses `data.get("priority", "normal")` for the old tasks.

</details>

---

## Before you move on

You've now got a toolbox for describing things in Python: classes for objects with rules, dunder methods so they plug into Python, dataclasses for records, and enums for fixed choices.

Next, you'll look at how Python hands out values one at a time. In [chapter 31](../31-iterators-and-generators/notes.md), you'll find out what a `for` loop really does behind the scenes, write generators with `yield`, and finally give the `Playlist` from chapter 29 a proper `__iter__` method.
