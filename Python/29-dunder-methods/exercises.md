# 29 Dunder Methods: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.py`, `ex2.py`, and so on).
- Run each one with `python ex1.py` from a terminal opened in this folder.
- Put type hints on every method, and check each file with `python -m mypy ex1.py` (in your virtual environment, like in [chapter 25](../25-type-hints/notes.md)). The goal is always `Success: no issues found in 1 source file`.
- Remember: dunder methods **return** their answer. They don't print it.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): A library book that prints nicely

A library program keeps its books as objects, but printing one is no help at all. Copy this into `ex1.py`:

```python
class Book:
    def __init__(self, title: str, author: str, year: int) -> None:
        self.title = title
        self.author = author
        self.year = year


dune = Book("Dune", "Frank Herbert", 1965)
emma = Book("Emma", "Jane Austen", 1815)
print(dune)
print(f"Just returned: {emma}")
print([dune, emma])
print(f"{dune!r}")
```

Right now, every line shows something like `<__main__.Book object at 0x...>`. Add a `__repr__` and a `__str__` method to `Book`, without changing the test code, so it prints:

```
Dune by Frank Herbert (1965)
Just returned: Emma by Jane Austen (1815)
[Book('Dune', 'Frank Herbert', 1965), Book('Emma', 'Jane Austen', 1815)]
Book('Dune', 'Frank Herbert', 1965)
```

Then add one more book at the bottom, and print it both ways:

```python
web = Book("Charlotte's Web", "E. B. White", 1952)
print(web)
print(repr(web))
```

```
Charlotte's Web by E. B. White (1952)
Book("Charlotte's Web", 'E. B. White', 1952)
```

Answer in a comment: why did the title get double quotes this time, when you didn't change your code? And if you deleted `__str__`, what would the first line print?

<details>
<summary>Hint 1</summary>

`print(dune)` and `f"...{emma}"` use one method. The list, and `!r`, use the other one. Which is which? The table in "`__repr__`: what programmers see" has the answer.

</details>

<details>
<summary>Hint 2</summary>

In `__repr__`, use `!r` on the attributes, like `{self.title!r}`, so the strings get their quotes. For the double quotes question, try `print(repr("it's"))` in the REPL.

</details>

---

## Exercise 2 (Easy): A cafe order

A cafe till keeps each customer's order in an `Order` object. Copy this into `ex2.py`:

```python
class Order:
    def __init__(self, customer: str) -> None:
        self.customer = customer
        self.items: list[str] = []

    def add(self, item: str) -> None:
        self.items.append(item)


order = Order("Priya")
if not order:
    print("Nothing ordered yet")
order.add("latte")
order.add("croissant")
order.add("latte")
print(len(order))
print("croissant" in order)
print("tea" in order)
print(order[0], order[-1])
print(order)
```

At the moment, it doesn't even get past `if not order:` correctly: an object is always truthy, so nothing prints there, and then `len(order)` crashes. Add four dunder methods (`__repr__`, `__len__`, `__contains__` and `__getitem__`) so that it prints:

```
Nothing ordered yet
3
True
False
latte latte
Order('Priya', ['latte', 'croissant', 'latte'])
```

Then add `print(order[3])` at the end. Which error do you get, and why did you get it for free?

Answer in a comment: you never wrote `__bool__`, so how does `if not order:` know the order is empty?

<details>
<summary>Hint 1</summary>

Look at the `Playlist` in the notes. Each method can hand the job straight to `self.items`, which is a normal list.

</details>

<details>
<summary>Hint 2</summary>

For the question, see "`__bool__`: is it truthy?" in the notes: which method does Python try when there's no `__bool__`?

</details>

---

## Exercise 3 (Medium): Sorting app versions

Maya looks after the computers in an office, and each one has a different version of the same app. Versions look like `"1.10.0"`: three whole numbers with dots between them. Sorting them as strings gives the wrong answer:

```python
print(sorted(["1.9.0", "1.10.0", "1.2.3"]))  # prints: ['1.10.0', '1.2.3', '1.9.0']
```

Strings are compared one character at a time, and the character `"1"` comes before `"9"`, so `"1.10.0"` lands before `"1.9.0"`. But version 1.10 is newer than 1.9!

Write a `Version` class in `ex3.py`. It's made from a string like `Version("1.10.0")`, and it compares the numbers properly. It needs `__repr__`, `__str__`, `__eq__`, `__hash__` and `__lt__`, plus `@total_ordering`. Test code:

```python
installed = [
    Version("1.9.0"),
    Version("1.10.0"),
    Version("1.2.3"),
    Version("1.10.0"),
    Version("2.0.0"),
]
print(sorted(installed))
print(f"Newest: {max(installed)}")
print(f"Oldest: {min(installed)}")
print(f"Different versions: {len(set(installed))}")
print(Version("1.10.0") == Version("1.10.0"))
print(Version("1.10.0") == "1.10.0")
print(Version("1.9.0") < Version("1.10.0"))
print(Version("2.0.0") >= Version("1.10.0"))
```

Expected output:

```
[Version('1.2.3'), Version('1.9.0'), Version('1.10.0'), Version('1.10.0'), Version('2.0.0')]
Newest: 2.0.0
Oldest: 1.2.3
Different versions: 4
True
False
True
True
```

You can assume every version string has exactly three numbers.

<details>
<summary>Hint 1</summary>

In `__init__`, split the text on `"."` ([chapter 06](../06-strings/notes.md)) and turn each part into an `int`. Store all three in one tuple, like `self.parts = (1, 10, 0)`.

</details>

<details>
<summary>Hint 2</summary>

Tuples already compare the way you want: Python compares the first items, and only looks at the second ones when the first are equal ([chapter 12](../12-tuples-and-sets/notes.md)). So `(1, 9, 0) < (1, 10, 0)` is `True`. Let `__eq__`, `__lt__` and `__hash__` all use the tuple.

</details>

<details>
<summary>Hint 3</summary>

`Version("1.10.0") == "1.10.0"` must be `False`, not a crash. And `>=` needs `@total_ordering` (from `functools`) above the class.

</details>

---

## Exercise 4 (Medium): Gym workout times

Sandip logs how long each gym workout takes, in seconds. Write a `Duration` class in `ex4.py`, made with `Duration(1830)`, with these dunder methods:

- `__repr__` shows `Duration(1830)`.
- `__str__` shows minutes and seconds, like `30:30`. When it's an hour or more, it shows hours too, like `1:02:05`. Minutes and seconds always have two digits after a colon.
- `__bool__`: a duration of 0 seconds (a rest day) is falsy.
- `__add__` adds two durations, and refuses anything else.
- `__radd__` makes `sum()` work.

Test code:

```python
week = [Duration(1830), Duration(2700), Duration(0), Duration(3725)]
for day, workout in zip(["Mon", "Tue", "Wed", "Thu"], week):
    if workout:
        print(f"{day}: {workout}")
    else:
        print(f"{day}: rest day")
total = sum(week)
print(f"Total: {total}")
print(repr(total))
print(Duration(90) + Duration(45))
print(Duration(90) + 45)
```

Expected output, ending in a crash on the last line (that's on purpose):

```
Mon: 30:30
Tue: 45:00
Wed: rest day
Thu: 1:02:05
Total: 2:17:35
Duration(8255)
2:15
```

```
TypeError: unsupported operand type(s) for +: 'Duration' and 'int'
```

<details>
<summary>Hint 1</summary>

`//` and `%` from [chapter 04](../04-operators/notes.md) split the seconds up. `seconds // 3600` is the whole hours. `seconds % 60` is the seconds left over. What gives the minutes in between?

</details>

<details>
<summary>Hint 2</summary>

`{minutes:02}` in an f-string pads a number to two digits with a zero, like the clock example in [chapter 06](../06-strings/notes.md).

</details>

<details>
<summary>Hint 3</summary>

`__add__` and `__radd__` follow the `Money` class from the notes almost line for line. The crash on the last line comes from `__add__` returning `NotImplemented`, so don't try to "fix" it.

</details>

---

## Exercise 5 (Challenge): The cafe menu

Time to put this chapter together with modules, JSON and your own exceptions. A cafe keeps its prices in a file, and you'll build a `Menu` class that works like a dictionary of `Money` prices.

**Setup:**

1. Copy the whole `Money` class from the end of the notes into `money.py` in this folder, with the `from functools import total_ordering` line at the top. Leave out the test lines at the bottom, or they'll run every time you import the module ([chapter 19](../19-modules-and-standard-library/notes.md)).
2. Save this as `menu.json` in the same folder (prices in cents):

   ```
   {
     "latte": 350,
     "tea": 225,
     "croissant": 275,
     "cake": 425
   }
   ```

**Your job,** in `ex5.py`:

- Import `Money` from your `money` module.
- Make your own exception, `NotOnMenuError`, with the two-line pattern from [chapter 18](../18-error-handling/notes.md).
- Write a `Menu` class whose `__init__` takes a `dict[str, Money]`. Give it:
  - `__len__`: the number of items on the menu.
  - `__contains__`: `"Tea" in menu` is `True`. Ignore capital letters.
  - `__getitem__`: `menu["LATTE"]` gives the latte's `Money`, also ignoring capitals. An item that isn't on the menu raises `NotOnMenuError` with the message `we don't sell 'mocha'` (with the name as it was typed).
  - `__str__`: the whole menu, cheapest first, as in the expected output below: a title line, then each name padded to 12 characters and each price lined up on the right in 6.
  - A normal method, `total(self, items: list[str]) -> Money`, that adds up the prices of a list of items.
- Write a function `load_menu(path: Path) -> Menu` that reads `menu.json` and builds the `Menu`.

Test code:

```python
menu = load_menu(Path(__file__).parent / "menu.json")
print(menu)
print(f"{len(menu)} items")
print("Tea" in menu)
print("mocha" in menu)
print(menu["LATTE"])
print(f"Order total: {menu.total(['latte', 'croissant', 'Latte'])}")
try:
    menu.total(["latte", "mocha"])
except NotOnMenuError as e:
    print(f"Sorry, {e}.")
```

Expected output:

```
--- Cafe menu ---
tea          $2.25
croissant    $2.75
latte        $3.50
cake         $4.25
4 items
True
False
$3.50
Order total: $9.75
Sorry, we don't sell 'mocha'.
```

And `python -m mypy ex5.py` says `Success: no issues found in 1 source file`.

<details>
<summary>Hint 1</summary>

`json.load` gives you a dictionary of names and whole numbers. A dictionary comprehension ([chapter 15](../15-comprehensions/notes.md)) turns each number into a `Money`. Inside the class, store the names in lowercase, and `.lower()` whatever the user asks for.

</details>

<details>
<summary>Hint 2</summary>

To sort the menu by price without `key=`, use the tuple trick from [chapter 26's sorting exercise](../26-project-todo-app/exercises.md): build a list of `(price, name)` tuples and sort it. That works because `Money` has `__lt__`. Then glue the lines together with `"\n".join(...)` ([chapter 06](../06-strings/notes.md)).

</details>

<details>
<summary>Hint 3</summary>

If you get `TypeError: unsupported format string passed to Money.__format__`, you wrote something like `{price:>6}`. Padding like `:>6` only works on strings and numbers, so turn the price into a string first: `{str(price):>6}`.

</details>

<details>
<summary>Hint 4</summary>

In `total`, `self[item]` calls your own `__getitem__`, which already raises the error for you. If mypy says `Incompatible return value type (got "Money | Literal[0]", expected "Money")` about `sum(...)`, it's worried the list might be empty, so `sum` would give back a plain `0`. Give `sum` a starting value, as in the Tip in the notes.

</details>

---

## Before you move on

Look back at the `Version` and `Duration` classes you just wrote. Most of their code is the same few patterns: an `__init__` that stores some values, a `__repr__` that lists them, an `__eq__` that compares them. Writing that by hand for every class gets boring fast, and every copy is a chance for a typo.

In [chapter 30](../30-dataclasses-and-enums/notes.md), you'll meet **dataclasses**, which write `__init__`, `__repr__` and `__eq__` for you from a short list of fields, and **enums**, for things that can only be one of a fixed set of choices.
