# 38 Project: Library System

This is the third big project, and the last chapter of Level 3. In [chapter 26](../26-project-todo-app/notes.md), every task was a dictionary, and a crowd of loose functions passed those dictionaries around. Since then, you've learned much better tools. Now you'll put them all to work in a program for a small library: its books, its members, and who has borrowed what.

You'll use nearly every chapter of Level 3: classes ([chapter 27](../27-classes-and-objects/notes.md)), a family of exceptions ([chapter 28](../28-inheritance/notes.md)), dunder methods ([chapter 29](../29-dunder-methods/notes.md)), dataclasses and an enum ([chapter 30](../30-dataclasses-and-enums/notes.md)), a generator ([chapter 31](../31-iterators-and-generators/notes.md)), a context manager ([chapter 33](../33-context-managers/notes.md)), `sorted()` with a `key=` ([chapter 34](../34-functional-tools/notes.md)), a regular expression ([chapter 35](../35-regular-expressions/notes.md)), pytest ([chapter 36](../36-testing-with-pytest/notes.md)) and logging ([chapter 37](../37-debugging-and-logging/notes.md)). Plus argparse, JSON, dates and type hints from Level 2.

It's bigger than the to-do app, so take it slowly. Build one milestone at a time, and run your code (and your tests) after every small change.

## What you'll build

A library app for your terminal, with sub-commands like the to-do app. When it's finished, you'll be able to:

- list every book and where it is, with late ones marked: `python main.py books`,
- find books by title or author: `python main.py search hobbit`,
- add books and members: `python main.py add-book "Emma" "Jane Austen" classic` and `python main.py add-member Priya`,
- lend a book to a member, and take it back: `python main.py lend B001 M004` and `python main.py return B001`,
- see every overdue loan and its fine: `python main.py overdue`,
- get a clear error message whenever a rule is broken (a book that's already out, a member with too many books, an ID that doesn't exist),
- and find a record of every change in a log file.

Here's a short session with the finished app and the sample data:

```
python main.py --today 2026-10-12 lend B001 M004
Lent Dune by Frank Herbert to Zoe. Due back 2026-10-26.

python main.py --today 2026-10-12 lend B002 M003
Error: Leo already has 3 books on loan, the most allowed

python main.py --today 2026-10-12 return B005
Sandip returned The Hobbit by J.R.R. Tolkien, 10 days late. Fine: $2.50

python main.py --today 2026-10-12 overdue
Due         Late  Fine   Member  Book
2026-10-09     3  $0.75  Leo     Coraline by Neil Gaiman
1 overdue loan, $0.75 in fines so far
```

What's `--today 2026-10-12`? A library app depends on the date all the time: due dates, late books, fines. If the outputs in this chapter used your real date, none of them would match yours. So the app has a little **time travel** option: `--today` tells it to pretend it's that day. Leave it out, and the app uses the real date, as you'd want in real life.

> **Watch out:** Every output in this chapter was made with `--today 2026-10-12` (a Monday), so add the same option to match. Commands that don't depend on the date, like `members`, don't need it.

## Before you start

### Setup

1. Make a copy of this chapter's `starter` folder, in this chapter's folder, and call it `my-library`. Work in the copy, so the starter stays clean.
2. Right-click `my-library` and choose **Open in Integrated Terminal**. Every command in this chapter runs from there. That matters more than ever this time, because the tests only find your code when you run them from this folder.
3. Make a virtual environment and install the two tools you'll use, pytest and mypy ([chapter 23](../23-pip-and-virtual-environments/notes.md)). The app itself only uses the standard library.

   ```
   python -m venv .venv
   .venv\Scripts\Activate.ps1
   python -m pip install pytest mypy
   ```

   (Use the activate command for your terminal from chapter 23 if you're not in PowerShell.)

4. Pick the `.venv` interpreter in VS Code, and keep Pylance's Type Checking Mode on `basic`.

Here's what's in the folder:

| File | What's in it |
|---|---|
| `models.py` | The records: `Book`, `Member` and `Loan`, and a `Genre` enum. For now, empty classes and method **stubs** (a first line, a docstring and `pass`), like in chapter 26. |
| `errors.py` | Six empty exception classes, waiting for their parents. |
| `library.py` | The `Library` class, which holds everything and knows the rules. Stubs. |
| `storage.py` | Loading and saving the library as JSON. Stubs. |
| `main.py` | The command-line program. Stubs. |
| `library.json` | Sample data: 8 books, 4 members and 9 loans (5 of them still out). |
| `tests/test_models.py`, `tests/test_library.py` | A few finished tests and a **fixture** to start you off. You'll add more in almost every milestone. |

The stubs have no type hints yet. Each milestone shows the exact first line to write, hints included.

### The rules

The library has four house rules:

- A loan lasts **14 days**.
- A member can have at most **3 books** at once.
- A late book costs **25 cents per day** (money is kept in whole cents, like in [chapter 14](../14-project-shopping-cart/notes.md)).
- The library has one copy of each book, so a book is either on the shelf or out with one member.

And four rules for you:

- Use only what you learned in chapters 01 to 37.
- Put type hints on every function and method.
- Each milestone has hints. Try first, and open a hint only when you're stuck.
- Your code doesn't have to look like anyone else's. If your output matches and your tests pass, it works. When you're done, ask Claude to review it.

### How the app is organized

**Five modules, each with one job:**

```
main.py  ->  storage.py  ->  library.py  ->  models.py and errors.py
```

`models.py` describes the records. `errors.py` names the problems. `library.py` holds the records and enforces the rules. `storage.py` turns the library into a file and back. `main.py` talks to the person at the keyboard. Read each arrow as "can import from": a module may import from any module to its right (`main.py` uses all four), but never from one to its left. (You'll see why that matters in "Common mistakes".)

**Records are dataclasses, the library is a normal class.** A book, a member and a loan mostly hold data, which is exactly what dataclasses are for. The `Library` is different: it's one object with lots of behavior (lending, returning, searching), so it's a plain class with an `__init__`, like the `BankAccount` in chapter 27.

**A loan points at a book and a member by their IDs.** `library.json` holds three lists: `"books"`, `"members"` and `"loans"`. Here's one item from each, squashed onto one line (in the file, each one is spread over several lines):

```
{"id": "B005", "title": "The Hobbit", "author": "J.R.R. Tolkien", "genre": "fantasy"}
{"id": "M001", "name": "Sandip"}
{"book_id": "B005", "member_id": "M001", "borrowed": "2026-09-18", "due": "2026-10-02", "returned": null}
```

A real library slip works the same way: it has the book's number and your card number on it, not a copy of the book. Every book ID is `B` and three digits, and every member ID is `M` and three digits. `"returned": null` means the book is still out.

**Every command follows the same steps**, like the to-do app: load the whole library from `library.json`, do the job, and save it back if anything changed.

## Milestone 1: Books, members and loans

**Goal:** `models.py` describes the three kinds of record, and a loan can tell you whether it's late and what the fine is.

1. At the top of `models.py`, under the comment, import `dataclass` from `dataclasses`, `date` from `datetime`, and `StrEnum` and `auto` from `enum`. Then add the fine as a constant:

   ```python
   FINE_PER_DAY = 25  # cents for every day a book is late
   ```

2. Turn `Genre` into a `StrEnum` with five members, all made with `auto()`: `CHILDREN`, `CLASSIC`, `FANTASY`, `MYSTERY` and `SCIFI`. Remember from chapter 30 that `auto()` in a `StrEnum` gives each member its name in lowercase as its value, so `Genre.SCIFI == "scifi"` is `True`. That will make saving to JSON easy.

3. Turn `Book` into a dataclass with four fields, in this order: `id: str` (like `"B001"`), `title: str`, `author: str` and `genre: Genre`. Then write its `__str__`, which returns text like `Dune by Frank Herbert`:

   ```python
   def __str__(self) -> str:
   ```

4. Turn `Member` into a dataclass with two fields: `id: str` and `name: str`.

5. Turn `Loan` into a dataclass with five fields: `book_id: str`, `member_id: str`, `borrowed: date`, `due: date`, and `returned: date | None = None`. Then write its three methods:

   ```python
   def is_overdue(self, today: date) -> bool:
   def days_late(self, today: date) -> int:
   def fine(self, today: date) -> int:
   ```

   - `is_overdue` is `True` when the book is still out and `today` is after the due date.
   - `days_late` counts the days after the due date: up to `today` while the book is out, or up to the day it came back. It's never negative: a book that's early or on time is `0` days late.
   - `fine` is the days late times `FINE_PER_DAY`, in cents.

   Why does a returned book still have `days_late`? Because the fine depends on when it came back. A book returned three days late cost three days of fines, even after it's safely on the shelf.

6. At the bottom of `models.py`, add this test code:

   ```python
   if __name__ == "__main__":
       today = date(2026, 10, 12)
       hobbit = Book("B005", "The Hobbit", "J.R.R. Tolkien", Genre.FANTASY)
       print(hobbit)
       print(repr(hobbit))
       print(Genre("scifi"), Genre.SCIFI == "scifi")

       loan = Loan("B005", "M001", date(2026, 9, 18), date(2026, 10, 2))
       print(loan.is_overdue(today), loan.days_late(today), loan.fine(today))
       loan.returned = date(2026, 10, 5)
       print(loan.is_overdue(today), loan.days_late(today), loan.fine(today))
   ```

Run `python models.py`. You'll see:

```
The Hobbit by J.R.R. Tolkien
Book(id='B005', title='The Hobbit', author='J.R.R. Tolkien', genre=<Genre.FANTASY: 'fantasy'>)
scifi True
True 10 250
False 3 75
```

`print()` uses your `__str__`, and `repr()` uses the `__repr__` the dataclass wrote for you ([chapter 29](../29-dunder-methods/notes.md)). The loan was due on 2 October, so on the 12th it's 10 days late: 250 cents. Once it came back on the 5th, it's not overdue any more, but its fine is fixed at 3 days, 75 cents.

**Your first tests.** Open `tests/test_models.py`. It already has two tests for this milestone. Run them:

```
python -m pytest tests/test_models.py
```

You should see `2 passed`. Now write a third test under the comment that says `Milestone 1`: `test_returned_loan_is_not_overdue`. Make a loan due on 2 October 2026 and returned on the 5th, and check that it isn't overdue on `TODAY` and that its fine is `75`. Run pytest again, and you should see `3 passed`.

<details>
<summary>Hint 1</summary>

Each class needs `@dataclass` on the line above it, and each field is a name with a hint, like `title: str`, with no `self.` ([chapter 30](../30-dataclasses-and-enums/notes.md)). Delete the `pass` lines as you go. A field with a default value, like `returned`, must come after all the fields without one.

</details>

<details>
<summary>Hint 2</summary>

In `days_late`, first pick the end date: `self.returned` if it isn't `None`, otherwise `today` (a conditional expression fits on one line). Then `(end - self.due).days` gives the gap as a number, which is negative when the book was early ([chapter 22](../22-dates-and-times/notes.md)). `max(0, ...)` turns anything below zero into zero. And `fine` can simply call `self.days_late(today)`, so the counting is written only once.

</details>

## Milestone 2: The Library class and its errors

**Goal:** `errors.py` has a family of exceptions, and `library.py` has a `Library` that holds books and members.

**Part A: the family of errors.** Open `errors.py`. Give each class a parent in brackets, as in [chapter 28](../28-inheritance/notes.md). The docstring is enough of a body, so there's no `pass`:

| Class | Its parent | Raised when |
|---|---|---|
| `LibraryError` | `Exception` | (the parent of the whole family) |
| `InvalidIdError` | `LibraryError` | an ID has the wrong shape, like `B1` |
| `NotFoundError` | `LibraryError` | no book or member has that ID |
| `AlreadyOnLoanError` | `LibraryError` | someone tries to borrow a book that's out |
| `NotOnLoanError` | `LibraryError` | someone tries to return a book that's on the shelf |
| `LoanLimitError` | `LibraryError` | a member with 3 books tries to borrow a fourth |

Why a family? Because `main.py` will catch `LibraryError` once, in one place, and that catches every child too. Meanwhile, tests (and future code) can still tell the problems apart, because each one has its own name.

**Part B: the Library class.** At the top of `library.py`, import `LibraryError` and `NotFoundError` from `errors`, and `Book`, `Genre`, `Loan` and `Member` from `models`. Then write these seven methods:

```python
def __init__(self) -> None:
def __len__(self) -> int:
def __contains__(self, book_id: str) -> bool:
def add_book(self, book: Book) -> None:
def add_member(self, member: Member) -> None:
def get_book(self, book_id: str) -> Book:
def get_member(self, member_id: str) -> Member:
```

- `__init__` makes three attributes, each starting empty: `books`, a dictionary from book ID to `Book`; `members`, a dictionary from member ID to `Member`; and `loans`, a list of every `Loan`. Because they start empty, give each one a hint, as in [chapter 25](../25-type-hints/notes.md). The first one is `self.books: dict[str, Book] = {}`.
- `len(library)` is the number of books, and `"B002" in library` checks whether there's a book with that ID ([chapter 29](../29-dunder-methods/notes.md)).
- `add_book` and `add_member` put a record into its dictionary, under its ID.
- `get_book` returns the book with that ID, or raises `NotFoundError` with the message `there's no book with ID B999` (with the real ID). `get_member` does the same for members: `there's no member with ID M999`.

Why dictionaries, and not lists? Because almost everything the app does starts with "find the book with this ID". A dictionary jumps straight to it, like the index at the back of a book, instead of reading every page.

At the bottom of `library.py`, add this test code:

```python
if __name__ == "__main__":
    library = Library()
    library.add_book(Book("B001", "Dune", "Frank Herbert", Genre.SCIFI))
    library.add_book(Book("B002", "Matilda", "Roald Dahl", Genre.CHILDREN))
    library.add_member(Member("M001", "Sandip"))
    print(f"{len(library)} books, {len(library.members)} member")
    print("B002" in library, "B999" in library)
    for book_id in ["B002", "b002", "B999", "B1", "book7"]:
        try:
            print(f"{book_id}: {library.get_book(book_id)}")
        except LibraryError as e:
            print(f"{book_id}: {type(e).__name__}: {e}")
```

Run `python library.py`:

```
2 books, 1 member
True False
B002: Matilda by Roald Dahl
b002: NotFoundError: there's no book with ID b002
B999: NotFoundError: there's no book with ID B999
B1: NotFoundError: there's no book with ID B1
book7: NotFoundError: there's no book with ID book7
```

It works, but look at the last four lines. Someone who types `b002` meant book `B002`, and `B1` and `book7` aren't missing books, they're typos. You'll fix that in the next milestone.

Now run all the tests, in both files, with `python -m pytest`. The two tests in `tests/test_library.py` use the **fixture** at the top of that file: a function marked `@pytest.fixture` that builds a fresh little library (four books, two members) for every test that asks for it by name ([chapter 36](../36-testing-with-pytest/notes.md)). You should see `5 passed`.

<details>
<summary>Hint 1</summary>

The parent goes in brackets after the class name: `class NotFoundError(LibraryError):`. A class whose body is only a docstring is perfectly valid Python. And `__len__` and `__contains__` are one line each: they pass the question on to the `books` dictionary, which already knows the answer.

</details>

<details>
<summary>Hint 2</summary>

In `get_book`, put the check first, as a guard clause ([chapter 18](../18-error-handling/notes.md)): `if book_id not in self.books:`, raise. The happy path, returning the book, goes at the bottom.

</details>

## Milestone 3: Checking IDs with a regular expression

**Goal:** IDs are tidied up before they're used, so `b002` finds book `B002`, and `B1` and `book7` get a clear "that's not an ID" error.

A book ID is the letter `B` followed by exactly three digits. As a regular expression ([chapter 35](../35-regular-expressions/notes.md)), that's `B\d{3}`: `\d` means any digit, and `{3}` means exactly three of them. A member ID is the same with `M`.

1. Import `re` at the top of `library.py`, and add `InvalidIdError` to the imports from `errors`.
2. Write `clean_id`, a plain function above the class:

   ```python
   def clean_id(text: str, prefix: str) -> str:
   ```

   - Strip the spaces off `text` and make it uppercase.
   - Check the result with `re.fullmatch(prefix + r"\d{3}", cleaned)`. `fullmatch` checks the **whole** string. (`re.search` would happily find `B001` inside `XB0012`.)
   - If it doesn't match, raise `InvalidIdError` with a message like `'B1' isn't a valid ID (it should look like B001)`. Show the text exactly as it was typed, and use the prefix in the example.
   - Otherwise, return the tidy version.

3. Make the first line of `get_book` `book_id = clean_id(book_id, "B")`, and the first line of `get_member` `member_id = clean_id(member_id, "M")`.

Run `python library.py` again:

```
2 books, 1 member
True False
B002: Matilda by Roald Dahl
b002: Matilda by Roald Dahl
B999: NotFoundError: there's no book with ID B999
B1: InvalidIdError: 'B1' isn't a valid ID (it should look like B001)
book7: InvalidIdError: 'book7' isn't a valid ID (it should look like B001)
```

Now every method that starts with `get_book` or `get_member` (and nearly all of them will) gets this checking for free.

**Test it.** In `tests/test_library.py`, add `clean_id` and `InvalidIdError` to the imports, and write two tests under the `Milestone 3` comment:

- `test_clean_id_tidies_up`: `clean_id(" b001 ", "B")` gives `"B001"`.
- `test_clean_id_rejects_bad_shapes`: every one of `"B1"`, `"B0001"`, `"book7"`, `"M001"` and `""` raises `InvalidIdError` when the prefix is `"B"`. (`M001` is a fine member ID, but it isn't a book ID.) Write it once, with `@pytest.mark.parametrize`, so pytest runs it five times:

  ```python
  @pytest.mark.parametrize("text", ["B1", "B0001", "book7", "M001", ""])
  def test_clean_id_rejects_bad_shapes(text: str) -> None:
  ```

Run `python -m pytest`. You should see `11 passed`: each of the five values counts as its own test.

<details>
<summary>Hint 1</summary>

`re.fullmatch()` returns a match object when the pattern fits, and `None` when it doesn't. So the check is `if re.fullmatch(...) is None:`. The `r` in `r"\d{3}"` makes it a raw string, so Python leaves the backslash alone for `re` to read, and adding two strings with `+` gives one pattern: `"B" + r"\d{3}"` is the text `B\d{3}`.

</details>

<details>
<summary>Hint 2</summary>

For the parametrized test, the body is a `with pytest.raises(InvalidIdError):` block with the `clean_id(text, "B")` call inside it.

</details>

## Milestone 4: Saving and loading safely

**Goal:** the whole library goes into `library.json` and comes back out exactly the same, and a crash halfway through saving can never damage the file.

**Part A: records to dictionaries and back.** Each record gets two new methods in `models.py`: `to_dict`, which turns it into a dictionary that `json` can save, and `from_dict`, an alternative constructor that builds a record from a loaded dictionary ([chapter 30](../30-dataclasses-and-enums/notes.md)). Add `asdict` to the `dataclasses` import, and `from typing import Any`. Here are the first lines for `Book`:

```python
def to_dict(self) -> dict[str, Any]:

@classmethod
def from_dict(cls, data: dict[str, Any]) -> "Book":
```

`Member` and `Loan` get the same two, with `"Member"` and `"Loan"` as their return hints. Don't skip the quotes. Without them, Python 3.13 stops with `NameError: name 'Book' is not defined`, because the class doesn't exist yet while Python is still reading its body (chapter 29 explains this).

- For `Book` and `Member`, `to_dict` is just `asdict(self)`. The genre is a `StrEnum`, so `json` saves it as plain text, like `"fantasy"`.
- For `Loan`, `asdict(self)` isn't enough, because `json` can't save a `date`. Start from `asdict(self)` and replace each date with its `.isoformat()` text. `returned` stays `None` while the book is out.
- Each `from_dict` does the opposite: `Genre(data["genre"])` turns the text back into a `Genre`, and `date.fromisoformat()` turns text back into dates.

**Part B: the file.** Open `storage.py`. Import `json`, `Iterator` from `collections.abc`, `contextmanager` from `contextlib`, `Path` from `pathlib`, and `TextIO` from `typing`. Then import `LibraryError`, `Library`, and the three record classes from your own modules. Add the file's location, built from `Path(__file__).parent` like in chapter 26:

```python
# The data file lives next to this file, whichever folder you run from.
LIBRARY_FILE = Path(__file__).parent / "library.json"
```

Now the safe save. `json.dump` writes a file bit by bit. If the program crashes halfway, or the power goes off, you're left with half a file, and the whole library is lost. So write `safe_write`, the context manager from [chapter 33](../33-context-managers/notes.md):

```python
@contextmanager
def safe_write(path: Path) -> Iterator[TextIO]:
```

It opens a temporary file next to the real one (`path.with_suffix(".tmp")`), yields it to the `with` block, and only when the block has finished without an error does it swap the temporary file in with `.replace(path)`. Either way, it tidies up the temporary file in a `finally`. So the real file is always either the complete old version or the complete new one, never half of each. It's like copying out a fresh recipe card before you throw the old one away.

Then write the two functions that use it:

```python
def save_library(library: Library, path: Path) -> None:
def load_library(path: Path) -> Library:
```

- `save_library` builds one dictionary with three keys, `"books"`, `"members"` and `"loans"`, each holding a list of `to_dict()` results. Then it writes it inside `with safe_write(path) as f:`, using `json.dump(data, f, indent=2)`.
- `load_library` reads the file with `json.load`. A missing file means a brand-new library, so return an empty `Library()`. A broken file raises `LibraryError` with the message `library.json is broken (it isn't valid JSON). Fix it or delete it.` (using `path.name`). Otherwise, it makes a `Library()` and fills it: `add_book(Book.from_dict(...))` for each book, `add_member` for each member, and each loan appended to `library.loans`.

**Part C: try it.** Add this test code to the bottom of `storage.py`:

```python
if __name__ == "__main__":
    library = load_library(LIBRARY_FILE)
    members, loans = len(library.members), len(library.loans)
    print(f"{len(library)} books, {members} members, {loans} loans")
    save_library(library, LIBRARY_FILE)
    again = load_library(LIBRARY_FILE)
    print(again.books == library.books and again.loans == library.loans)
    print(len(load_library(Path("no-such-file.json"))))

    try:
        with safe_write(LIBRARY_FILE) as f:
            f.write('{"books": [')
            raise RuntimeError("the power went off!")
    except RuntimeError as e:
        print(f"Saving failed: {e}")
    print(f"After the crash: {len(load_library(LIBRARY_FILE))} books")
```

Run `python storage.py`:

```
8 books, 4 members, 9 loans
True
0
Saving failed: the power went off!
After the crash: 8 books
```

The `True` means saving and loading gives back exactly the same books and loans (dataclasses compare their fields with `==`). The last part pretends the power went off after writing half a file. The real `library.json` didn't notice: it still loads all 8 books, and there's no `library.tmp` left lying around. Open `library.json` too: it should look just like the starter's.

**Test it.** Write three tests:

- In `tests/test_models.py`: `test_loan_survives_a_round_trip`. Turn a loan into a dictionary and back. Check that the dictionary's `"due"` is the text `"2026-10-02"`, that `"returned"` is `None`, and that `Loan.from_dict(data) == loan`.
- In `tests/test_library.py`: `test_save_and_load`, which uses the fixture and pytest's built-in `tmp_path` fixture, a fresh empty folder for each test. Saving into it means your tests never touch your real `library.json`:

  ```python
  def test_save_and_load(library: Library, tmp_path: Path) -> None:
      path = tmp_path / "library.json"
      save_library(library, path)
      loaded = load_library(path)
      assert loaded.books == library.books
      assert loaded.members == library.members
  ```

- Also in `tests/test_library.py`: `test_failed_save_keeps_the_old_file`. Write a small file into `tmp_path` with `path.write_text(...)`. Then, inside a `with pytest.raises(RuntimeError):` block, open `safe_write(path)`, write half a file, and raise a `RuntimeError`. After the block, check that the file still holds the old text.

Add `Path`, `json` (if you use it), and the storage functions to the imports. Then `python -m pytest` should show `14 passed`. (Once lending works in milestone 7, come back and add a loan to `test_save_and_load`, so it checks the loans too.)

<details>
<summary>Hint 1</summary>

For `Loan.to_dict`: `data = asdict(self)`, then `data["due"] = self.due.isoformat()`, and the same for `borrowed`. Only change `data["returned"]` when `self.returned is not None`. For `from_dict`, `cls(...)` makes the new object; give it the five values in field order.

</details>

<details>
<summary>Hint 2</summary>

The order inside `safe_write` matters. `try:` first. Inside it, the `with open(temp, "w", encoding="utf-8") as f:` block, with `yield f` inside that. Then, still inside the `try` but after the inner `with`, `temp.replace(path)`. Last, `finally: temp.unlink(missing_ok=True)`. If the `with` block in the caller raises, the error comes out of the `yield`, so the `replace` line never runs.

</details>

<details>
<summary>Hint 3</summary>

`load_library` uses the pattern from chapter 26: `try`, then two `except` blocks, one for `FileNotFoundError` and one for `json.JSONDecodeError`. Build the `Library` after the `try`, once you know you have the data.

</details>

## Milestone 5: The command line

**Goal:** `main.py` understands all eight sub-commands, and `books` and `members` work.

1. At the top of `main.py`, import `argparse` and `sys`, `date` from `datetime`, `LibraryError`, `Library`, `Book` and `Genre`, and `LIBRARY_FILE`, `load_library` and `save_library` from `storage`.

2. Write `plural`, a small helper for the summary lines:

   ```python
   def plural(count: int, word: str, words: str) -> str:
   ```

   `plural(1, "book", "books")` returns `"1 book"`, and `plural(8, "book", "books")` returns `"8 books"`. (It takes both words because English isn't simple: `match` becomes `matches`.)

3. Write `build_parser()`:

   ```python
   def build_parser() -> argparse.ArgumentParser:
   ```

   Use the description `A small library: books, members and loans.` The main parser gets one option of its own, for time travel:

   ```python
   parser.add_argument(
       "--today",
       type=date.fromisoformat,
       default=date.today(),
       help="pretend today is this date, like 2026-10-12",
   )
   ```

   `type=` can be any function that takes a string. In chapter 24 it was `int`. Here, `date.fromisoformat` turns `"2026-10-12"` into a real `date`, and argparse reports an error if it fails. Then add the sub-commands, using `add_subparsers(dest="command", required=True)` like in chapter 26:

   | Sub-command | Its help text | Arguments |
   |---|---|---|
   | `books` | `list the books and where they are` | a flag `--available` (help: `only show books on the shelf`) |
   | `search` | `find books by title or author` | `text` (help: `the text to look for`) |
   | `add-book` | `add a new book` | `title` (help: `the book's title`), `author` (help: `who wrote it`), `genre` (help: `what kind of book it is`) |
   | `members` | `list the members` | none |
   | `add-member` | `add a new member` | `name` (help: `the member's name`) |
   | `lend` | `lend a book to a member` | `book_id` (help: `the book's ID, like B001`), `member_id` (help: `the member's ID, like M001`) |
   | `return` | `take a book back` | `book_id` (help: `the book's ID, like B001`) |
   | `overdue` | `list overdue loans and their fines` | none |

   The `genre` argument only accepts the enum's values: `choices=[genre.value for genre in Genre]`. Looping over an enum gives you its members (chapter 30), so that comprehension makes the list `["children", "classic", "fantasy", "mystery", "scifi"]`.

4. Back in `library.py`, add four methods that the lists need:

   ```python
   def current_loan(self, book_id: str) -> Loan | None:
   def loans_of(self, member_id: str) -> list[Loan]:
   def sorted_books(self) -> list[Book]:
   def available_books(self) -> list[Book]:
   ```

   - `current_loan` returns the loan of that book that hasn't been returned yet, or `None` when the book is on the shelf.
   - `loans_of` returns the member's loans that haven't been returned yet.
   - `sorted_books` returns all the books, sorted by title, ignoring capitals: `sorted(self.books.values(), key=lambda book: book.title.lower())` ([chapter 34](../34-functional-tools/notes.md)). Without `.lower()`, every capital letter sorts before every small one, so a book called `the Hobbit` would end up after `Wonder`.
   - `available_books` returns the sorted books that have no current loan.

5. In `main.py`, write three functions that print:

   ```python
   def book_status(library: Library, book: Book, today: date) -> str:
   def print_books(library: Library, books: list[Book], today: date) -> None:
   def print_members(library: Library) -> None:
   ```

   - `book_status` returns `on the shelf`, or `on loan to Maya, due 2026-10-20` (with the member's name and the due date). An overdue loan gets ` (OVERDUE)` on the end.
   - `print_books` prints the header `ID    Book                               Status`, then one row per book: the ID, two spaces, the book's text lined up on the left in 33 characters, two spaces, and its status.
   - `print_members` prints the header `ID    Name      Books`, then one row per member: the ID, two spaces, the name in 8 characters, two spaces, and how many books they have.

6. Write `run_command`, which does the job and says whether the library needs saving, and `main`:

   ```python
   def run_command(args: argparse.Namespace, library: Library, today: date) -> bool:
       """Do the job. Return True if the library changed and needs saving."""
       match args.command:
           case "books":
               ...  # your code
           case "members":
               print_members(library)
           case _:
               print(args)  # the other commands come in later milestones
       return False


   def main() -> None:
       """Read the command line, load the library, run the command,
       and save if anything changed."""
       args = build_parser().parse_args()
       try:
           library = load_library(LIBRARY_FILE)
           if run_command(args, library, args.today):
               save_library(library, LIBRARY_FILE)
       except LibraryError as e:
           print(f"Error: {e}", file=sys.stderr)
           sys.exit(1)


   if __name__ == "__main__":
       main()
   ```

   `args` is an `argparse.Namespace`: that's the type of what `parse_args()` returns. `match` is from [chapter 08](../08-conditionals/notes.md), and it reads nicely with eight commands. Saving lives in one place: any branch that changes the library returns `True`, and `main` saves. The `books` branch prints the books (only the available ones with `--available`), or `No books to show.` if there are none, and then a summary line that always counts every book.

Try the help screens first. `python main.py -h` lists the eight sub-commands with their help texts, and the `--today` option. Then one sub-command, `python main.py lend -h`:

```
usage: main.py lend [-h] book_id member_id

positional arguments:
  book_id     the book's ID, like B001
  member_id   the member's ID, like M001

options:
  -h, --help  show this help message and exit
```

Then the lists:

```
python main.py --today 2026-10-12 books
ID    Book                               Status
B004  Coraline by Neil Gaiman            on loan to Leo, due 2026-10-09 (OVERDUE)
B001  Dune by Frank Herbert              on the shelf
B006  Emma by Jane Austen                on loan to Leo, due 2026-10-15
B003  Holes by Louis Sachar              on loan to Maya, due 2026-10-20
B002  Matilda by Roald Dahl              on the shelf
B008  The Big Sleep by Raymond Chandler  on loan to Leo, due 2026-10-24
B005  The Hobbit by J.R.R. Tolkien       on loan to Sandip, due 2026-10-02 (OVERDUE)
B007  Wonder by R.J. Palacio             on the shelf
8 books: 3 on the shelf, 5 on loan

python main.py members
ID    Name      Books
M001  Sandip    1
M002  Maya      1
M003  Leo       3
M004  Zoe       0

python main.py --today 2026-10-12 lend B001 M004
Namespace(today=datetime.date(2026, 10, 12), command='lend', book_id='B001', member_id='M004')
```

Try `books --available` too: you get only Dune, Matilda and Wonder, with the same summary line. The `lend` line shows that `--today` has already become a real `date` by the time your code sees it.

> **Watch out:** `--today` belongs to the whole program, not to one sub-command, so it goes **before** the sub-command: `python main.py --today 2026-10-12 books`. Put it at the end, and argparse says `main.py: error: unrecognized arguments: --today 2026-10-12`.

<details>
<summary>Hint 1</summary>

The `cafe.py` example in [chapter 24](../24-command-line-programs/notes.md) has this shape. Give each sub-parser its own variable, like `lend_parser = subparsers.add_parser("lend", help=...)`, then add its arguments. `members` and `overdue` have no arguments, but still need their `add_parser` lines.

</details>

<details>
<summary>Hint 2</summary>

In `book_status`, call `library.current_loan(book.id)` first. If it's `None`, you're done. Otherwise the member's name is `library.members[loan.member_id].name`, and `loan.is_overdue(today)` decides about the ` (OVERDUE)` part.

</details>

<details>
<summary>Hint 3</summary>

If `print_books` crashes with `TypeError: unsupported format string passed to Book.__format__`, see the first common mistake at the end of this chapter.

</details>

## Milestone 6: Searching and adding

**Goal:** `search` finds books by a word in the title or author, and `add-book` and `add-member` add new records with the next free ID.

1. In `library.py`, write `next_id`, a plain function next to `clean_id`:

   ```python
   def next_id(ids: list[str], prefix: str) -> str:
   ```

   It's chapter 26's `next_id` with a twist: the IDs are text. `next_id(["B001", "B007"], "B")` returns `"B008"`, and an empty list gives `"B001"`. Slice the letter off and turn the rest into an `int` (`int("B007"[1:])` is `7`), find the biggest, add one, and pad it back to three digits with the format spec `:03` ([chapter 06](../06-strings/notes.md)).

2. Add `search`, `new_book` and `new_member` to the class:

   ```python
   def search(self, text: str) -> list[Book]:
   def new_book(self, title: str, author: str, genre: Genre) -> Book:
   def new_member(self, name: str) -> Member:
   ```

   - `search` returns the books whose title or author contains the text, ignoring capitals, sorted by title.
   - `new_book` strips the spaces off the title and author. If either is empty, it raises `LibraryError("a book needs a title and an author")`. (The parent of the family works fine as an error by itself.) Otherwise it makes a `Book` with the next free ID, adds it, and returns it. `list(self.books)` gives you a list of the dictionary's keys, which are the IDs.
   - `new_member` does the same for a name, with the message `a member needs a name`.

3. In `run_command`, add three branches:

   - `search` prints the matching books with `print_books`, and then `2 matches` or `1 match`. If nothing matches, it prints `No books match 'pizza'.` (with the real text).
   - `add-book` calls `new_book`, prints `Added book B009: The Secret Garden by Frances Hodgson Burnett`, and returns `True`. `args.genre` is plain text, so turn it into a `Genre` first: `Genre(args.genre)`.
   - `add-member` prints `Added member M005: Priya` and returns `True`.

**Reset the sample data first.** This milestone changes `library.json`, so copy the starter's version back before you test, and before every milestone from now on:

```
Copy-Item ..\starter\library.json .
```

(In Command Prompt it's `copy ..\starter\library.json .`, and on Mac or Linux `cp ../starter/library.json .`.) Now try:

```
python main.py --today 2026-10-12 search ho
ID    Book                               Status
B003  Holes by Louis Sachar              on loan to Maya, due 2026-10-20
B005  The Hobbit by J.R.R. Tolkien       on loan to Sandip, due 2026-10-02 (OVERDUE)
2 matches

python main.py --today 2026-10-12 search pizza
No books match 'pizza'.

python main.py add-book "The Secret Garden" "Frances Hodgson Burnett" children
Added book B009: The Secret Garden by Frances Hodgson Burnett

python main.py add-book "   " "Anon" classic
Error: a book needs a title and an author

python main.py add-member Priya
Added member M005: Priya
```

`search DAHL` finds Matilda by its author (`1 match`), and `add-member "  "` gives `Error: a member needs a name`. Run `python main.py members` to see Priya at the bottom with `0` books. And try a genre that doesn't exist, like `poetry`: argparse refuses it and lists the five choices. (In `books`, *The Secret Garden by Frances Hodgson Burnett* is longer than 33 characters, so its status gets pushed to the right. That's fine.)

**Test it.** Write two tests in `tests/test_library.py`:

- `test_search_ignores_case_and_sorts`: searching the fixture's library for `"IL"` gives *Coraline* and then *Matilda*. ("Matilda" has `il` in its title, and Coraline's author, Neil Gaiman, has it in his name. And *Coraline* comes first even though it was added last, because the results are sorted.)
- `test_new_book_gets_the_next_id`: adding *Emma* by Jane Austen gives it the ID `"B005"`, and afterwards `"B005" in library` is true.

`python -m pytest` should show `16 passed`.

<details>
<summary>Hint 1</summary>

`search` is one list comprehension with an `if`, looping over `self.sorted_books()`. Since that list is already sorted, the results come out sorted too. Lowercase the search text once, before the loop.

</details>

<details>
<summary>Hint 2</summary>

`max()` of an empty list is an error, but `max(numbers, default=0)` gives `0` instead, so `next_id` needs no `if`.

</details>

## Milestone 7: Lending and returning

**Goal:** `lend` and `return` work, and they never break a house rule.

1. At the top of `library.py`, under the imports, add the rules as constants:

   ```python
   LOAN_DAYS = 14  # how long a member can keep a book
   MAX_LOANS = 3  # how many books a member can have at once
   ```

   Add `timedelta` to the `datetime` import, and the three remaining errors to the `errors` import.

2. Write `lend` and `return_book`:

   ```python
   def lend(self, book_id: str, member_id: str, today: date) -> Loan:
   def return_book(self, book_id: str, today: date) -> Loan:
   ```

   `lend` checks everything first, in this order, and only then changes anything:

   1. The book and the member exist (`get_book` and `get_member` already raise the right errors).
   2. The book isn't already out. If it is: `AlreadyOnLoanError`, with a message like `Holes by Louis Sachar is already on loan (due back 2026-10-20)`.
   3. The member has fewer than `MAX_LOANS` books. If not: `LoanLimitError`, with a message like `Leo already has 3 books on loan, the most allowed`.

   Then it makes the new `Loan` (due `LOAN_DAYS` days after `today`), appends it to `self.loans`, and returns it.

   `return_book` finds the book, then its current loan. If there isn't one, it raises `NotOnLoanError`, like `Matilda by Roald Dahl isn't on loan`. Otherwise it sets the loan's `returned` to `today` and returns the loan. (Why not call it `return`? Because `return` is a Python keyword, so it can't be a method name.)

3. In `main.py`, write `format_money`, the same as in chapters 14 and 19:

   ```python
   def format_money(cents: int) -> str:
   ```

4. Add `lend` and `return` branches to `run_command`. Both return `True`.

   - `lend` prints `Lent Dune by Frank Herbert to Zoe. Due back 2026-10-26.`
   - `return` prints `Maya returned Holes by Louis Sachar on time.` when there's no fine, and otherwise `Sandip returned The Hobbit by J.R.R. Tolkien, 10 days late. Fine: $2.50`. Use `plural` for `1 day` and `10 days`.

Reset the sample data, then try:

```
python main.py --today 2026-10-12 lend B001 M004
Lent Dune by Frank Herbert to Zoe. Due back 2026-10-26.

python main.py --today 2026-10-12 lend B001 M001
Error: Dune by Frank Herbert is already on loan (due back 2026-10-26)

python main.py --today 2026-10-12 lend B002 M003
Error: Leo already has 3 books on loan, the most allowed

python main.py --today 2026-10-12 lend B002 M009
Error: there's no member with ID M009

python main.py --today 2026-10-12 return B005
Sandip returned The Hobbit by J.R.R. Tolkien, 10 days late. Fine: $2.50

python main.py --today 2026-10-12 return B003
Maya returned Holes by Louis Sachar on time.

python main.py --today 2026-10-12 return B003
Error: Holes by Louis Sachar isn't on loan

python main.py --today 2026-10-10 return B004
Leo returned Coraline by Neil Gaiman, 1 day late. Fine: $0.25
```

Look at that last one: time travel to the 10th, the day after Coraline was due. Run `$LASTEXITCODE` after one of the errors, and you'll see `1`. Then run `python main.py members`: Sandip and Maya are down to `0` books, Leo to `2`, and Zoe has `1`.

**Test it.** Write four tests, each using the fixture and `TODAY`:

- `test_lend_gives_14_days`: a loan made on `TODAY` is due on 26 October 2026, and `current_loan` finds it.
- `test_cannot_lend_a_book_twice`: lending `B001` to Sandip and then to Maya raises `AlreadyOnLoanError`.
- `test_three_books_at_most`: after Sandip borrows three books, borrowing a fourth raises `LoanLimitError` (use `match="Sandip"`, so you know the message names him).
- `test_late_return_has_a_fine`: lend a book on 18 September 2026, return it on `TODAY`, and check the loan's `returned` date, its fine (`250`), and that `current_loan` is now `None`.

Now go back to `test_save_and_load`, lend a book before saving, and add a line that checks the loans. `python -m pytest` should show `20 passed`.

<details>
<summary>Hint 1</summary>

After `book = self.get_book(book_id)`, use `book.id` from then on, not `book_id`. The book has the tidy ID (`B001`), but `book_id` is still exactly what was typed, which might be ` b001 `.

</details>

<details>
<summary>Hint 2</summary>

`current_loan` hands you the very loan object that's inside `self.loans`, not a copy ([chapter 27](../27-classes-and-objects/notes.md)). So `loan.returned = today` changes the loan in the list, and saving the library saves the change.

</details>

<details>
<summary>Hint 3</summary>

In `run_command`, both branches get a `Loan` back. The book is `library.books[loan.book_id]`, and the member's name is `library.members[loan.member_id].name`.

</details>

## Milestone 8: Overdue loans and fines

**Goal:** `overdue` lists every late book, the most overdue first, with the fine so far.

1. In `library.py`, import `Iterator` from `collections.abc`, and write `overdue_loans` as a **generator** ([chapter 31](../31-iterators-and-generators/notes.md)). It looks at each loan, and `yield`s the ones that are overdue on that day:

   ```python
   def overdue_loans(self, today: date) -> Iterator[Loan]:
   ```

   Why a generator, and not a list? It hands out overdue loans one at a time, as they're asked for, and lets the caller decide what to do with them: loop over them, count them, sort them, or stop at the first one. With nine loans it makes no real difference. But a caller that only wants to know "is anything late?" can stop at the first late loan, and the rest are never even checked.

2. In `main.py`, write `print_overdue`:

   ```python
   def print_overdue(library: Library, today: date) -> None:
   ```

   - Sort the overdue loans by due date, oldest first: `sorted(library.overdue_loans(today), key=lambda loan: loan.due)`. `sorted()` takes any iterable, a generator included, and always gives back a **list**. That matters, because you need to go through the loans twice: once for the rows, and once for the total.
   - If there are none, print `No overdue loans.` and stop.
   - Otherwise print the header `Due         Late  Fine   Member  Book`, then one row per loan: the due date, two spaces, the days late lined up on the right in 4 characters, two spaces, the fine (from `format_money`) on the right in 5, two spaces, the member's name on the left in 6, two spaces, and the book.
   - Finish with a summary like `2 overdue loans, $3.25 in fines so far`.

3. Add an `overdue` branch to `run_command` that calls `print_overdue`. It changes nothing, so it doesn't return `True`.

4. Make the `books` summary count the overdue loans too, so it ends like `5 on loan, 2 overdue`. You can't use `len()` on a generator, but `len(list(...))` works.

Reset the sample data, then try:

```
python main.py --today 2026-10-12 overdue
Due         Late  Fine   Member  Book
2026-10-02    10  $2.50  Sandip  The Hobbit by J.R.R. Tolkien
2026-10-09     3  $0.75  Leo     Coraline by Neil Gaiman
2 overdue loans, $3.25 in fines so far

python main.py --today 2026-10-30 overdue
Due         Late  Fine   Member  Book
2026-10-02    28  $7.00  Sandip  The Hobbit by J.R.R. Tolkien
2026-10-09    21  $5.25  Leo     Coraline by Neil Gaiman
2026-10-15    15  $3.75  Leo     Emma by Jane Austen
2026-10-20    10  $2.50  Maya    Holes by Louis Sachar
2026-10-24     6  $1.50  Leo     The Big Sleep by Raymond Chandler
5 overdue loans, $20.00 in fines so far
```

The second one travels forward to the end of October, when every book that's out is late. And `python main.py --today 2026-10-12 books` now ends with `8 books: 3 on the shelf, 5 on loan, 2 overdue`.

**Test it.** Write `test_overdue_loans`: lend `B001` on 18 September 2026 (overdue by `TODAY`), lend `B002` on 1 October (due on the 15th, so not overdue yet), and lend `B003` on 20 September but return it on 3 October (late, but back). Then `list(library.overdue_loans(TODAY))` should contain only the loan of `B001`. `python -m pytest` should show `21 passed`.

<details>
<summary>Hint 1</summary>

The whole generator is three lines: a `for` loop over `self.loans`, an `if` that asks the loan whether it's overdue, and `yield loan`.

</details>

<details>
<summary>Hint 2</summary>

`format_money` returns text like `"$2.50"`, so line it up as text: `{fine:>5}`, where `fine = format_money(loan.fine(today))`. For the total, `sum()` with a generator expression adds up the fines in cents, and `format_money` shows the result.

</details>

## Milestone 9: A log file, and a final check

**Goal:** the app keeps a record of every change in `library.log`, and pytest and mypy confirm that everything works.

The terminal only shows what happened just now. A log file remembers: which books went out, which came back, which requests were refused, and when. If Zoe says "I returned that book last week!", the log can settle it ([chapter 37](../37-debugging-and-logging/notes.md)).

1. In `library.py`, import `logging`, and under the constants, make the module's logger:

   ```python
   logger = logging.getLogger(__name__)
   ```

   Then add one `logger.info(...)` line to each method that changes the library, just before it returns:

   | Method | The log line |
   |---|---|
   | `new_book` | `logger.info("Added book %s: %s", book.id, book)` |
   | `new_member` | `logger.info("Added member %s: %s", member.id, member.name)` |
   | `lend` | `logger.info("Lent %s to %s, due %s", book.id, member.id, loan.due)` |
   | `return_book` | `logger.info("%s returned %s, fine %d cents", loan.member_id, book.id, loan.fine(today))` |

2. In `main.py`, import `logging` and `Path`, and add the log file's location and a logger of its own under the imports:

   ```python
   LOG_FILE = Path(__file__).parent / "library.log"

   logger = logging.getLogger(__name__)
   ```

   In `main()`, set up logging straight after `parse_args()`:

   ```python
   logging.basicConfig(
       filename=LOG_FILE,
       encoding="utf-8",
       level=logging.INFO,
       format="%(asctime)s %(levelname)s %(name)s: %(message)s",
       datefmt="%Y-%m-%d %H:%M:%S",
   )
   ```

   And log every refused command as a warning, as the first line of the `except` block: `logger.warning("%s refused: %s", args.command, e)`.

   Notice that only `main.py` calls `basicConfig`. The library just writes to its logger, and the main program decides where the messages end up. That's why your tests, which use the `Library` without `main.py`, don't fill up `library.log`.

3. Reset the sample data, delete `library.log` if you have one, and run a few commands:

   ```
   python main.py --today 2026-10-12 lend B001 M004
   python main.py --today 2026-10-12 lend B001 M001
   python main.py --today 2026-10-12 return B005
   python main.py add-member Priya
   ```

   Open `library.log`:

   ```
   2026-10-12 11:15:56 INFO library: Lent B001 to M004, due 2026-10-26
   2026-10-12 11:15:57 WARNING __main__: lend refused: Dune by Frank Herbert is already on loan (due back 2026-10-26)
   2026-10-12 11:15:58 INFO library: M001 returned B005, fine 250 cents
   2026-10-12 11:15:59 INFO library: Added member M005: Priya
   ```

   Your times will be different: the log records the real clock, even when you time travel with `--today`, because that's when the command really ran. `library` and `__main__` are the loggers' names, so you can see which module wrote each line. (`__main__` is `main.py`'s name when you run it directly, as you know from chapter 19.)

4. Try to break it. Open `library.json`, delete the very last `}`, save, and run `python main.py members`:

   ```
   Error: library.json is broken (it isn't valid JSON). Fix it or delete it.
   ```

   A friendly message, exit code `1`, and a `WARNING` line in the log. Reset the sample data afterwards.

Now the final check. Run the whole test suite:

```
python -m pytest
```

```
============================= test session starts =============================
platform win32 -- Python 3.13.15, pytest-9.1.1, pluggy-1.6.0
rootdir: C:\...\38-project-library-system\my-library
collected 21 items

tests\test_library.py .................                                  [ 80%]
tests\test_models.py ....                                                [100%]

============================= 21 passed in 0.26s ==============================
```

Then mypy, on the whole folder at once:

```
python -m mypy .
```

```
Success: no issues found in 7 source files
```

That's your five modules and two test files. (mypy skips the `.venv` folder by itself.) If mypy finds a problem, read it, fix it, and run it again.

<details>
<summary>Hint 1</summary>

If `library.log` has no `INFO` lines, check that `basicConfig` has `level=logging.INFO`. Without it, the level is `WARNING`, so all the `info` lines are thrown away and only the refused commands appear. Also make sure `basicConfig` runs before `run_command`, so logging is set up before anything is logged.

</details>

<details>
<summary>Hint 2</summary>

If mypy says `Item "None" of "Loan | None" has no attribute "returned"`, you used the result of `current_loan` before checking it for `None`. Raise the error first, and mypy knows that the loan must be real after that.

</details>

## Putting it all together

Time for a full day at the library. Reset the sample data, delete `library.log`, and run these commands one by one:

```
python main.py add-member Priya
Added member M005: Priya

python main.py add-book "Charlotte's Web" "E.B. White" children
Added book B009: Charlotte's Web by E.B. White

python main.py --today 2026-10-12 return B005
Sandip returned The Hobbit by J.R.R. Tolkien, 10 days late. Fine: $2.50

python main.py --today 2026-10-12 lend B005 M005
Lent The Hobbit by J.R.R. Tolkien to Priya. Due back 2026-10-26.

python main.py --today 2026-10-12 lend B009 M005
Lent Charlotte's Web by E.B. White to Priya. Due back 2026-10-26.

python main.py --today 2026-10-12 lend B001 M003
Error: Leo already has 3 books on loan, the most allowed

python main.py --today 2026-10-12 return B004
Leo returned Coraline by Neil Gaiman, 3 days late. Fine: $0.75

python main.py --today 2026-10-12 lend B001 M003
Lent Dune by Frank Herbert to Leo. Due back 2026-10-26.

python main.py --today 2026-10-12 overdue
No overdue loans.

python main.py --today 2026-10-28 overdue
Due         Late  Fine   Member  Book
2026-10-15    13  $3.25  Leo     Emma by Jane Austen
2026-10-20     8  $2.00  Maya    Holes by Louis Sachar
2026-10-24     4  $1.00  Leo     The Big Sleep by Raymond Chandler
2026-10-26     2  $0.50  Priya   The Hobbit by J.R.R. Tolkien
2026-10-26     2  $0.50  Priya   Charlotte's Web by E.B. White
2026-10-26     2  $0.50  Leo     Dune by Frank Herbert
6 overdue loans, $7.75 in fines so far
```

Look at the last three rows: they're all due on the same day, and they stay in the order they were lent. Sorting in Python is **stable**: when two keys are equal, the items keep their original order ([chapter 34](../34-functional-tools/notes.md)). Then open `library.log` and read the whole day back, one line per change. That's a real, tested, logged application, built from classes. Well done!

### Test it like a user

Before you call it finished, try to break it. Tick each box once it works:

- [ ] `python main.py -h` and the help for each sub-command (`python main.py lend -h`) look tidy.
- [ ] IDs work in small letters and with spaces (`lend " b001 " m004`), and bad IDs (`B1`, `book7`, `M001` as a book) give the "isn't a valid ID" error.
- [ ] Every house rule holds: no fourth book, no lending a book that's out, no returning a book that's on the shelf.
- [ ] A bad `--today` (like `12/10/2026`) gets an argparse error, and so does a genre that isn't one of the five.
- [ ] After every error, `$LASTEXITCODE` is not `0`, and nothing is saved.
- [ ] A broken `library.json` gives a friendly message, not a traceback.
- [ ] It works from another folder: `cd ..`, then `python my-library/main.py members`.
- [ ] `python -m pytest` shows all green, and `python -m mypy .` says `Success`.

> **Tip:** Your folder now has some extra visitors: `__pycache__`, `.pytest_cache`, `.mypy_cache` and `library.log`. All of them are made by tools or by your app, so they belong in `.gitignore`, along with `.venv/`.

## Common mistakes

**1. Giving an object a width in an f-string**

```python
from dataclasses import dataclass


@dataclass
class Book:
    id: str
    title: str
    author: str

    def __str__(self) -> str:
        return f"{self.title} by {self.author}"


book = Book("B001", "Dune", "Frank Herbert")
print(f"{book.id}  {book:<33}  on the shelf")
```

```
TypeError: unsupported format string passed to Book.__format__
```

`<33` is a format spec, and format specs belong to strings and numbers. Your `Book` has a `__str__`, but it doesn't know what `<33` means. Turn it into a string first: `{str(book):<33}`.

**2. Going through a generator twice**

```python
loans = library.overdue_loans(today)
for loan in loans:
    print(loan.book_id, loan.fine(today))
total = sum(loan.fine(today) for loan in loans)
print(f"Total: {total}")
```

The rows print fine, but the total is always `0`. A generator is used up after one trip ([chapter 31](../31-iterators-and-generators/notes.md)), so the second loop found nothing left. The same goes for `len(library.overdue_loans(today))`, which fails straight away with `TypeError: object of type 'generator' has no len()`. When you need the values more than once, make a list first, with `list(...)` or `sorted(...)`.

**3. Forgetting to return `True` after a change**

```python
case "lend":
    loan = library.lend(args.book_id, args.member_id, today)
    book = library.books[loan.book_id]
    name = library.members[loan.member_id].name
    print(f"Lent {book} to {name}. Due back {loan.due}.")
```

It prints the right message, but the branch falls through to `return False`, so `main()` never saves. The next command loads the old `library.json`, and the loan never happened. Every branch that changes the library must end with `return True`.

**4. A circle of imports**

Say you decide that `library.py` should save after every change, and add `from storage import save_library` to it. Now every run crashes:

```
Traceback (most recent call last):
  File "C:\...\my-library\main.py", line 10, in <module>
    from library import Library
  File "C:\...\my-library\library.py", line 17, in <module>
    from storage import save_library
  File "C:\...\my-library\storage.py", line 10, in <module>
    from library import Library
ImportError: cannot import name 'Library' from 'library' (consider renaming 'C:\\...\\my-library\\library.py' if it has the same name as a library you intended to import)
```

Ignore the advice about renaming: Python 3.13 adds that hint for a different mistake (a file that hides a real package, like `cowsay.py` in chapter 23). Read the `File` lines instead. `main.py` imports `library`, which imports `storage`, which imports `library` again, while `library` is still only half-loaded, so `Library` doesn't exist yet. That's a circle. The fix is to keep the arrows pointing one way: `library.py` knows nothing about files, and `main.py` saves.

**5. Running the tests the wrong way**

Plain `pytest`, without `python -m`, fails with:

```
E   ModuleNotFoundError: No module named 'errors'
```

`python -m pytest` puts the folder you're standing in onto Python's list of places to look for modules, so `from errors import ...` finds your `errors.py` ([chapter 36](../36-testing-with-pytest/notes.md)). Plain `pytest` doesn't. You get the same error if you `cd tests` first. Always run `python -m pytest` from `my-library`. ([Chapter 39](../39-project-structure-and-packaging/notes.md) shows the proper, permanent fix.)

## Quick recap

In this project, you practised:

- Modelling records as dataclasses with an enum and methods, and the main object as a class with dunder methods (`__str__`, `__len__`, `__contains__`) ([chapters 27](../27-classes-and-objects/notes.md), [29](../29-dunder-methods/notes.md) and [30](../30-dataclasses-and-enums/notes.md)).
- A family of exceptions under one parent, so `main()` catches them all in one place ([chapter 28](../28-inheritance/notes.md)).
- Checking input with a regular expression, `re.fullmatch` ([chapter 35](../35-regular-expressions/notes.md)).
- Saving safely with your own context manager, so a crash can't leave half a file ([chapter 33](../33-context-managers/notes.md)).
- A generator for overdue loans, and `sorted()` with a `key=` for every list ([chapters 31](../31-iterators-and-generators/notes.md) and [34](../34-functional-tools/notes.md)).
- Tests with a fixture, `tmp_path`, `pytest.raises` and `parametrize`, written milestone by milestone ([chapter 36](../36-testing-with-pytest/notes.md)).
- A log file set up once in the main program, with a logger in each module ([chapter 37](../37-debugging-and-logging/notes.md)).
- Time travel with `--today`, so code that depends on the date can be tested on any date you like.

Look at your folder: five modules, a `tests` folder, a data file, a log, and a rule that the tests only work from one particular folder. That's a real project, and it's outgrown "a folder of scripts". Level 4 starts by giving a project like this a proper shape: one that anyone can install and run with a single command.

---

**Next:** try the stretch goals in the [exercises](exercises.md), then start Level 4 with [39 Project Structure and Packaging](../39-project-structure-and-packaging/notes.md).
