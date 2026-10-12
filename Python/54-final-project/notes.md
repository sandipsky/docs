# 54 Final Project

You've reached the last chapter of the Python course. 🎉

This time there's no starter folder and no milestones. You'll pick your own project and take it all the way from an idea to something other people can use, the way professional developers do. That's a big jump from following steps someone else wrote, so this chapter walks you through the process, one step at a time.

## What you'll build

Something of your own! The [exercises](exercises.md) have a menu of project ideas, from a habit tracker to a link checker to a web API with a React front end. You can also bring your own idea.

To show you the process, this chapter follows one example project all the way through: **Cake Day**, a command that tells you whose birthday is coming up, in time to get a card. It isn't on the menu, so there's nothing to copy. Watch *how* it gets decided and built, then do the same with your project.

Here's how Cake Day should feel to use. It's a sketch, typed out before any code existed. (The finished MVP prints exactly this on Monday 12 October 2026, so the sketch did its job.)

```
cakeday add Aisha 2004-02-29
Added Aisha: birthday on 29 February.

cakeday soon
Today: Priya turns 35!
Coming up:
  Wed 14 Oct  Maya turns 28 (in 2 days)
  Sat 24 Oct  Leo turns 31 (in 12 days)
  Tue 10 Nov  Zoe turns 9 (in 29 days)

cakeday remove Tom
Error: there's no one called 'Tom'. See everyone with 'cakeday list'.
```

Here are the steps:

1. Pick one small idea.
2. Split the must-haves from the nice-to-haves.
3. Sketch the data.
4. Plan the modules, the folders and the packages.
5. Set up the project.
6. Build it in thin slices, with tests.
7. Do an errors, logging and security pass.
8. Speed it up, but only if you need to.
9. Write a README, and ship it.
10. Ask for a code review.

If you did the [JavaScript final project](../../JavaScript/52-final-project/notes.md) or the [React one](../../React/41-final-project/notes.md), these steps will feel familiar. That's on purpose: the process hardly changes from one language to the next. What's new is how many kinds of program Python can make, and steps 3 and 4 are where you choose.

## Getting started

**Don't create the project yet.** Steps 1 to 4 happen on paper, or in a notes file called `plan.md`. You'll create the project in step 5, once you know what you're building, and `plan.md` moves into it then, so your future self (and anyone reviewing your code) can see *why* you decided what you did.

When you do create it, make the project **outside** your `docs` folder, in a short path like `C:\code\cakeday`. Two reasons:

- `docs` is already a Git repository, and a repository inside a repository confuses Git ([React chapter 40](../../React/40-deploying/notes.md) explains the trap). Outside `docs`, your project can be its own repository from day one.
- Windows has a limit on how long a file's path can be. Deep folders plus some packages' deep insides can break installs, as the Watch out in [chapter 43](../43-building-a-web-api-with-fastapi/notes.md) showed. Short paths avoid it.

## The big idea: decide before you type

In every project so far, the big decisions were made for you. Chapter 26 said "two modules, and the tasks live in `tasks.json`". Chapter 38 gave you five modules and the arrows between them. Chapter 46 gave you the three modules, the table and every endpoint. In this project, **you** make those decisions. That's the real skill this chapter practises.

Think of the difference between cooking from a recipe card and cooking a dinner for friends. The card tells you everything. For the dinner, you decide what to cook, check what's in the cupboard, write a shopping list, and work out what to start first so it's all ready together. Ten minutes of planning, and the evening goes smoothly. No planning, and you find out at 7 pm that there's no rice.

Three questions do most of the planning:

- **What does my program remember, and what does it work out?** Store the facts. Work everything else out from the facts, fresh each time, so it can never go stale.
- **Which tools do I actually need?** Start with the standard library and the tools you already know. Add a package when you feel the pain it removes, not "because you can".
- **Where does my program touch the outside world?** The keyboard, the screen, the clock, files, databases, the network. Keep those touches at the edges, in one or two modules, and the middle of your program becomes easy to understand and easy to test.

A project where these were answered well feels easy to build. A project where they weren't feels like wading through mud, however good the code is.

## Step 1: Pick one small idea

A good project starts with a problem you can say in one sentence:

> **Cake Day:** tell me whose birthday is coming up, in time to get a card.

When you pick yours:

- **Pick something you'd actually use**, or that a friend or your family would. You'll care more about finishing it, and you'll notice what's missing.
- **Keep it small.** A small program that's finished and in use beats a big one that's half-built on your laptop.
- **Watch out for "and".** If your sentence needs "and" three times, it's probably three projects.

| Too big | Just right |
|---|---|
| A personal finance app that connects to all my bank accounts | A report of last month's spending, from my bank's CSV export |
| A social network for my family, with birthdays, photos and chat | A command that tells me whose birthday is coming up |
| A scraper that compares prices in every online shop | A watcher for the price of three books in one shop |
| A smart home system that waters the garden | A morning message saying whether it'll rain today |

Then decide what **kind** of program it is. Python can make all of these, and you've built every kind in this course:

| Kind | What it does | Where you learned it |
|---|---|---|
| A command-line tool | You type a command, and it does one job well | [24](../24-command-line-programs/notes.md), [26](../26-project-todo-app/notes.md), [38](../38-project-library-system/notes.md), [39](../39-project-structure-and-packaging/notes.md) |
| A web API | Other programs, like a React app, ask it for data over HTTP | [43](../43-building-a-web-api-with-fastapi/notes.md), [46](../46-project-expense-tracker-api/notes.md) |
| A data script | Reads a pile of data, answers questions about it, and makes a report or a chart | [21](../21-json-and-csv/notes.md), [44](../44-working-with-data/notes.md) |
| An automation | Does a boring job for you, often by itself on a schedule | [45](../45-automating-tasks/notes.md) |
| A scraper with a report | Collects facts from web pages, politely, then does something useful with them | [41](../41-web-scraping/notes.md), [42](../42-databases/notes.md) |

Mixes are fine (a scraper that fills a database, with an API on top), but build one part at a time. Cake Day is a command-line tool: one person, one computer, a few commands.

**Check it:** you can say your idea in one sentence to someone who isn't a programmer, and they get it. And you know which kind of program it is.

## Step 2: Must-haves and nice-to-haves

Make two lists before you write any code:

- **Must-haves** make the program useful at all. Without any one of them, it doesn't do its job.
- **Nice-to-haves** would be great, *later*.

Together, the must-haves are your **MVP**, short for **minimum viable product**: the smallest version that's genuinely useful. You build that first, and nothing else.

| Must-have (the MVP) | Nice-to-have (later, maybe) |
|---|---|
| Add someone: their name and birth date | A reminder every morning at 8, without typing anything ([chapter 45](../45-automating-tasks/notes.md)) |
| See whose birthday is in the next 30 days, soonest first | Gift ideas for each person, with a budget |
| See the age each person is turning | Import everyone from a CSV file your phone exports ([chapter 21](../21-json-and-csv/notes.md)) |
| Today's birthdays stand out at the top | An email a week before ([chapter 52](../52-security-basics/notes.md) for the password) |
| List everyone, and remove someone | People whose birth year I don't know |
| Everything is still there next time | A colourful table with rich |
| Clear errors for mistakes, never a traceback | A web page the whole family can add to |

Look at the last one. A web page for the family means an API, a front end, accounts so strangers can't read it, and a host to run it on. That's a whole project of its own (the exercises have one like it), which is exactly why it sits on the right.

**Check it:** you have five to eight must-haves, and every one of them passes the question "would the program be useless without this?"

## Step 3: Sketch the data

What does the program need to *remember*? For Cake Day, it's one kind of thing: a person. It's mostly data, so it's a dataclass ([chapter 30](../30-dataclasses-and-enums/notes.md)):

```python
"""The records Cake Day keeps."""

from dataclasses import dataclass
from datetime import date


@dataclass(frozen=True)
class Person:
    """Someone whose birthday I want to remember."""

    id: int
    name: str  # "Maya"
    born: date  # the whole date, so Cake Day can work out their age
```

```python
maya = Person(id=1, name="Maya", born=date(1998, 10, 14))
print(maya)  # prints: Person(id=1, name='Maya', born=datetime.date(1998, 10, 14))
```

The habits from earlier projects, all in one place:

- **Store the facts, and work out the rest.** Cake Day stores *when* someone was born, never their age or "in 2 days". Those change every day, so they're worked out each time from the birth date and today's date.
- **Dates as ISO text in the database** (`"1998-10-14"`), and real `date` objects in Python ([chapters 22](../22-dates-and-times/notes.md) and [42](../42-databases/notes.md)).
- **Money in whole cents**, if your project has money (the gift-ideas nice-to-have would).
- **A `StrEnum` for anything with a fixed set of choices**, like the expense categories in [chapter 46](../46-project-expense-tracker-api/notes.md). Cake Day has none: names and dates are free.
- **Records point at each other by id**, like a loan pointing at a book in [chapter 38](../38-project-library-system/notes.md).

Now sort everything the program shows into **stored** or **worked out**. This table is the most important part of the plan:

| Thing | Stored or worked out? | Where |
|---|---|---|
| Name and birth date | Stored | The `people` table |
| The next birthday (this year or next) | Worked out from the birth date and today | `birthdays.py` |
| How many days until it | Worked out | `cli.py`, from the next birthday |
| The age they're turning | Worked out | `cli.py`, from the next birthday |
| The order, and words like "tomorrow" | Worked out | `cli.py` |

Notice how little is stored. Everything in the bottom four rows is worked out from the top row and the date, so none of it can ever be out of date.

### Where does it live?

| Store | Good for | Chapters |
|---|---|---|
| A JSON file | One small list, read and written as a whole | [21](../21-json-and-csv/notes.md), [26](../26-project-todo-app/notes.md) |
| A CSV file | Tables you'll open in Excel, and reports | [21](../21-json-and-csv/notes.md), [44](../44-working-with-data/notes.md) |
| SQLite | Several kinds of record that point at each other, looking things up, history that grows | [42](../42-databases/notes.md), [46](../46-project-expense-tracker-api/notes.md) |
| PostgreSQL | Data shared by several people or computers, like a web app on a server | [42](../42-databases/notes.md), [53](../53-deploying/notes.md), the [PostgreSQL course](../../PostgreSQL/README.md) |

Honestly, a JSON file would do for Cake Day's MVP, just like chapter 26. It uses SQLite anyway, for three reasons: it looks people up by name, names must be unique (and the database can enforce that), and the gift-ideas nice-to-have will point at people, which is exactly what databases are good at. Either choice is fine. What matters is that you chose for a reason, and that only one module knows which (step 4).

Here's the table, written as it will appear in `storage.py`:

```python
SCHEMA = """
    CREATE TABLE IF NOT EXISTS people (
        id   INTEGER PRIMARY KEY,
        name TEXT    NOT NULL UNIQUE COLLATE NOCASE,
        born TEXT    NOT NULL
    )
"""
```

`COLLATE NOCASE` makes SQLite ignore capitals when it compares names, so `UNIQUE` refuses `maya` when there's already a `Maya`, and looking up `maya` finds her.

It's worth sketching a nice-to-have's table too, without building it, just to check the MVP's design won't box you in. Gift ideas point at a person:

```python
GIFTS = """
    CREATE TABLE IF NOT EXISTS gift_ideas (
        id          INTEGER PRIMARY KEY,
        person_id   INTEGER NOT NULL REFERENCES people (id) ON DELETE CASCADE,
        idea        TEXT    NOT NULL,
        price_cents INTEGER NOT NULL CHECK (price_cents >= 0)
    )
"""
```

`REFERENCES` and `ON DELETE CASCADE` are the foreign keys from [PostgreSQL chapter 16](../../PostgreSQL/16-relationships-and-foreign-keys/notes.md): a gift idea must belong to a real person, and removing a person removes their gift ideas too. The `people` table doesn't have to change at all to allow this. Good: the MVP's design is safe.

> **Watch out:** SQLite only checks `REFERENCES` rules when you switch them on, once per connection, with `con.execute("PRAGMA foreign_keys = ON")` (a **pragma** is a setting for SQLite itself). Without it, deleting Maya quietly leaves her gift ideas behind, and SQLite even accepts a gift for person 99, who doesn't exist. With it, that insert fails with `sqlite3.IntegrityError: FOREIGN KEY constraint failed`, and deleting Maya removes her gift ideas. PostgreSQL always checks.

**Check it:** everything stored is a fact that doesn't change by itself overnight, and your "worked out" rows aren't empty.

## Step 4: Plan the modules, the folders and the packages

Decide which module does which job before there are fifteen files. Cake Day uses the src layout from [chapter 39](../39-project-structure-and-packaging/notes.md):

```
cakeday/
├── pyproject.toml
├── README.md
├── plan.md
├── .gitignore
├── .pre-commit-config.yaml
├── src/
│   └── cakeday/
│       ├── __init__.py
│       ├── __main__.py      so python -m cakeday works
│       ├── models.py        Person: just data
│       ├── errors.py        CakeDayError and its children
│       ├── birthdays.py     next_birthday: pure date sums
│       ├── storage.py       every line of SQL
│       └── cli.py           argparse, printing, exit codes
└── tests/
    ├── test_birthdays.py
    ├── test_storage.py
    └── test_cli.py
```

Like [chapter 38](../38-project-library-system/notes.md), read each arrow as "can import from":

```
cli.py  ->  storage.py and birthdays.py  ->  models.py and errors.py
```

Three habits in that plan:

- **Only `storage.py` knows SQL exists**, like `database.py` in chapter 46. If Cake Day ever moved to a JSON file or to PostgreSQL, only `storage.py` would change. That's the Repository pattern from [chapter 51](../51-design-patterns/notes.md).
- **`birthdays.py` never reads the clock, the database or the keyboard.** Today's date comes in as a parameter, like `is_overdue(today)` in chapter 38. Data goes in, answers come out, so it's the easiest file in the project to test (step 6).
- **`cli.py` is the only module that prints or calls `sys.exit`.** Everything else hands back values or raises exceptions, so it could be reused by a web API one day without changing a line.

And one decision about the data file. An installed command shouldn't keep data next to its code (the Watch out in [chapter 39](../39-project-structure-and-packaging/notes.md)), so Cake Day keeps it in your home folder, `Path.home() / "cakeday.db"`, with a `--db` option to point somewhere else. The tests use that option to get their own empty database.

### Choose your packages, only the ones you need

Here's a table for making this decision on purpose:

| I need... | Reach for... | But only if... |
|---|---|---|
| Commands with options | argparse ([24](../24-command-line-programs/notes.md)) | It's a command-line tool. It comes with Python. |
| Data that survives | `json` ([21](../21-json-and-csv/notes.md)) or `sqlite3` ([42](../42-databases/notes.md)) | Both come with Python. SQLite once records point at each other. |
| Records with rules | dataclasses ([30](../30-dataclasses-and-enums/notes.md)), or Pydantic ([43](../43-building-a-web-api-with-fastapi/notes.md)) | Pydantic when data arrives from outside as JSON |
| Data from someone else's API | requests ([40](../40-working-with-apis/notes.md)), or httpx | The data really lives somewhere else |
| Facts from web pages | BeautifulSoup ([41](../41-web-scraping/notes.md)) | There's no API, and the site allows it |
| Other programs (or a React app) using your data | FastAPI ([43](../43-building-a-web-api-with-fastapi/notes.md), [46](../46-project-expense-tracker-api/notes.md)) | Someone other than you, on another computer, needs it |
| Big tables of numbers, and charts | pandas ([44](../44-working-with-data/notes.md)) | You're grouping, joining or summing lots of rows |
| Many slow downloads at once | async ([47](../47-async-python/notes.md)) or threads ([48](../48-threads-processes-and-the-gil/notes.md)) | You've measured that waiting is the slow part ([49](../49-performance/notes.md)) |
| A job that runs by itself every day | Task Scheduler ([45](../45-automating-tasks/notes.md)) | It's a job you'd otherwise forget |

And here's how Cake Day answers it, including the tools it **deliberately leaves out**:

| Tool | Cake Day? | Why |
|---|---|---|
| argparse | Yes | Four sub-commands: `add`, `soon`, `list` and `remove` |
| sqlite3 | Yes | Step 3's three reasons |
| dataclasses | Yes | The data comes from Cake Day's own database, not from strangers, so Pydantic isn't needed |
| FastAPI | No | One person, one computer. A command is enough. |
| pandas | No | A few dozen people at most. A loop and `sort()` do the job. |
| async or threads | No | Nothing to wait for: no network at all |
| requests | No | Nothing lives anywhere else |
| rich | Not yet | Plain text first. Colour is a nice-to-have. |

So Cake Day's list of dependencies is **empty**. Everything it needs comes with Python. Every "no" is a package you don't have to install, learn the quirks of, keep up to date, or check for security problems. That's a real saving, not a missed opportunity.

**Check it:** you can point at the module where each must-have will live. For every package you picked, you can name the pain it removes *in your project*, and for every one you didn't, you can say why not.

## Step 5: Set up the project

Now, finally, the project. Make a folder called `cakeday` outside `docs` (say `C:\code\cakeday`), open it in VS Code, and open a terminal there. Then start a Git repository and a virtual environment ([chapter 23](../23-pip-and-virtual-environments/notes.md)):

```
git init
python -m venv .venv
.venv\Scripts\Activate.ps1
```

(In Command Prompt, activate with `.venv\Scripts\activate.bat`. On a Mac or Linux, use `source .venv/bin/activate`.) Git answers `Initialized empty Git repository in C:/code/cakeday/.git/`. If you've never used Git, [React chapter 40](../../React/40-deploying/notes.md) explains the few commands you need: **Git** saves snapshots of your project, called **commits**, so you can always go back.

Next, the files. `pyproject.toml` is chapter 39's file, plus chapter 50's settings for Ruff and mypy:

```
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "cakeday"
version = "0.1.0"
description = "Whose birthday is coming up?"
readme = "README.md"
requires-python = ">=3.13"
dependencies = []

[project.scripts]
cakeday = "cakeday.cli:main"

[dependency-groups]
dev = ["pytest", "mypy", "ruff", "pre-commit"]

[tool.pytest.ini_options]
testpaths = ["tests"]

[tool.mypy]
files = ["src", "tests"]
disallow_untyped_defs = true

[tool.ruff]
line-length = 88

[tool.ruff.lint]
select = ["E", "F", "I", "B", "UP", "SIM"]
```

Every line is something you've met: the project's label and its `cakeday` command ([chapter 39](../39-project-structure-and-packaging/notes.md)), your tools in the `dev` group, and the settings that make mypy insist on type hints for every function and Ruff check the starter set of rules ([chapter 50](../50-clean-code-and-style/notes.md)).

`.gitignore` lists everything Git should never save. Write it **before** your first commit:

```
.venv/
__pycache__/
.pytest_cache/
.mypy_cache/
.ruff_cache/
dist/
*.db
.env
```

`*.db` matters more than it looks. Cake Day's database holds real people's birthdays, and that's personal data. It stays on your computer, never on GitHub. `.env` is there for the day your project has a secret ([chapter 52](../52-security-basics/notes.md)).

Then `.pre-commit-config.yaml`, exactly as in [chapter 50](../50-clean-code-and-style/notes.md), so Ruff and mypy check your code every time you commit:

```
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.17.0
    hooks:
      - id: ruff-check
        args: [--fix]
      - id: ruff-format
  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v2.4.0
    hooks:
      - id: mypy
```

(The mypy hook runs in its own little environment, without your project's packages. When your code imports packages like `requests` or `pandas`, chapter 50 shows how to hand them to the hook with `additional_dependencies`.)

Finally, a `README.md` with just the name and your step 1 sentence for now, an `src\cakeday` folder with an `__init__.py` holding a one-line docstring, an empty `tests` folder, and your `plan.md`. Then install the project with its tools, switch on the hooks, and make your first commit:

```
python -m pip install -e . --group dev
pre-commit install
git status
git add .
git commit -m "Empty project, with its tools"
```

`git status` lists the files about to be saved. Check that `.venv` isn't among them. The commit runs the hooks first:

```
ruff check...............................................................Passed
ruff format..............................................................Passed
mypy.....................................................................Passed
```

The very first time, pre-commit sets up its own copies of Ruff and mypy before that, which needs the internet and takes a minute or so. Git may also warn that `LF will be replaced by CRLF`: that's Git on Windows tidying line endings, and it's harmless.

> **Watch out:** Run `python -m mypy` right now and it says `There are no .py[i] files in directory 'tests'`, because `files` in `pyproject.toml` includes `tests`, and it's still empty. That's fine: it goes away with your first test file in step 6. (`python -m pytest` likewise says `no tests ran`.)

**Check it:** the commit worked, the hooks passed, and `git status` says `nothing to commit, working tree clean`.

## Step 6: Build it in thin slices, with tests

Think of a layered cake. You could bake all the sponge first, then make all the cream, then do all the icing, and nobody gets to eat anything until the very end. Or you can cut slices: each slice has a bit of every layer, and each one is something you can eat.

Code is the same. Building **layer by layer** means writing all of `storage.py`, then all of `birthdays.py`, then all of `cli.py`, and nothing works until the last day. Building in **thin slices** means one small feature at a time, through every layer it needs (the command, the logic, the database), so the program works after every slice and only gets more useful.

The first slice is the thinnest of all: a **walking skeleton**, a version that runs from end to end and does nothing useful yet. It proves the boring parts work (the package, the `cakeday` command, the tools) before you've written anything you could lose.

Here's Cake Day's plan, one slice per evening or so:

1. **The skeleton.** A `cli.py` with only `--version`, as in [chapter 39](../39-project-structure-and-packaging/notes.md). `cakeday --version` prints `cakeday 0.1.0`.
2. **Add and list people.** `models.py`, the `people` table and its functions in `storage.py`, the `add` and `list` sub-commands, and tests for the storage functions.
3. **What's coming up.** `birthdays.py` and its tests first, then the `soon` sub-command. Now Cake Day is useful: type in your family's birthdays and start using it for real.
4. **Remove someone.**
5. **Friendly errors and logging** (that's step 7).
6. **Only now: nice-to-haves**, one slice each.

After each slice, run the program, run the checks, and commit:

```
python -m mypy
python -m pytest
git add .
git commit -m "Add and list people"
```

The hooks run Ruff and mypy on everything you commit. If one fails, the commit doesn't happen: fix what it says (Ruff has often fixed it for you already), `git add .` again, and commit again. Each commit is a save point. If slice 4 goes horribly wrong, you can get back to the end of slice 3.

> **Tip:** if a slice feels too big, it is. Split it until each piece takes an evening or less.

### Test the logic that matters

You can't test everything, and you don't need to ([chapter 36](../36-testing-with-pytest/notes.md)). Test what would really hurt if it broke. For Cake Day, that's working out the next birthday, because birthdays have awkward cases. Here's `birthdays.py`:

```python
"""Birthday sums. Pure functions: no clock, no database, no printing."""

from datetime import date


def birthday_in(born: date, year: int) -> date:
    """Someone's birthday in a given year."""
    try:
        return date(year, born.month, born.day)
    except ValueError:  # 29 February, in a year that doesn't have one
        return date(year, 2, 28)


def next_birthday(born: date, today: date) -> date:
    """The next birthday, counting today."""
    birthday = birthday_in(born, today.year)
    if birthday < today:  # already happened this year
        birthday = birthday_in(born, today.year + 1)
    return birthday
```

Remember the impossible dates from [chapter 22](../22-dates-and-times/notes.md)? Aisha was born on 29 February 2004, and `date(2027, 2, 29)` raises `ValueError: day is out of range for month`, because 2027 has no 29 February. So `birthday_in` asks forgiveness ([chapter 18](../18-error-handling/notes.md)) and moves her birthday to the 28th. Some people celebrate on 1 March instead. It's your program, so pick a rule, and write it down as a test, so it stays picked.

And here are the tests, in `tests/test_birthdays.py`. Each one is an awkward case you can say out loud:

```python
from datetime import date

from cakeday.birthdays import next_birthday

TODAY = date(2026, 10, 12)


def test_birthday_later_this_year() -> None:
    assert next_birthday(date(1998, 10, 14), TODAY) == date(2026, 10, 14)


def test_birthday_today_counts_as_the_next_one() -> None:
    assert next_birthday(date(1991, 10, 12), TODAY) == TODAY


def test_birthday_already_passed_is_next_year() -> None:
    assert next_birthday(date(2000, 3, 14), TODAY) == date(2027, 3, 14)


def test_leap_day_moves_to_28_february() -> None:
    assert next_birthday(date(2004, 2, 29), TODAY) == date(2027, 2, 28)


def test_leap_day_stays_put_in_a_leap_year() -> None:
    assert next_birthday(date(2004, 2, 29), date(2028, 1, 1)) == date(2028, 2, 29)
```

```
python -m pytest tests/test_birthdays.py -v
```

```
tests/test_birthdays.py::test_birthday_later_this_year PASSED            [ 20%]
tests/test_birthdays.py::test_birthday_today_counts_as_the_next_one PASSED [ 40%]
tests/test_birthdays.py::test_birthday_already_passed_is_next_year PASSED [ 60%]
tests/test_birthdays.py::test_leap_day_moves_to_28_february PASSED       [ 80%]
tests/test_birthdays.py::test_leap_day_stays_put_in_a_leap_year PASSED   [100%]

============================== 5 passed in 0.03s ==============================
```

Notice that `today` is a **parameter**, not read from the clock inside the function. That keeps it pure, so the tests give the same answer every day, including the day you show your project to someone. Only `cli.py` reads the real date, with `date.today()`, as the default for a `--today` time-travel option, exactly like chapter 38's.

After that, in order of value:

1. **The storage functions**, each test with a brand-new database in `tmp_path`, using a fixture like chapter 46's: adding and finding someone, a duplicate name refused (`Maya` and `MAYA`), a name that isn't there, removing someone.
2. **One or two whole commands**, with `capsys` ([chapter 36](../36-testing-with-pytest/notes.md)). Give `main` an optional parameter, `def main(argv: list[str] | None = None) -> None:`, and pass it on with `build_parser().parse_args(argv)`. `None` means "read the real command line", so the `cakeday` command still works, and a test can hand it a list:

```python
from pathlib import Path

import pytest

from cakeday.cli import main


def test_soon(tmp_path: Path, capsys: pytest.CaptureFixture[str]) -> None:
    db = str(tmp_path / "test.db")
    main(["--db", db, "add", "Maya", "1998-10-14"])
    main(["--db", db, "add", "Sam", "2000-01-03"])
    capsys.readouterr()  # forget what was printed so far
    main(["--db", db, "--today", "2026-10-12", "soon"])
    assert capsys.readouterr().out == (
        "Coming up:\n  Wed 14 Oct  Maya turns 28 (in 2 days)\n"
    )
```

Don't test argparse, sqlite3 or `datetime` themselves. They have their own tests.

**Check it:** after every slice, the program runs, `python -m mypy` says `Success`, `python -m pytest` passes, and there's a commit. And the logic you'd be most embarrassed to get wrong is covered by a test.

## Step 7: Errors, logging and a security pass

Once the MVP works, go through it with three questions: what does the user see when something goes wrong, can you find out what happened, and is anything unsafe?

### Errors the user can fix

Cake Day uses a family of exceptions, like the library's in [chapter 28](../28-inheritance/notes.md): `CakeDayError`, with two children, `PersonNotFoundError` and `DuplicatePersonError`, in `errors.py`. `storage.py` raises them (it turns SQLite's `IntegrityError` into a `DuplicatePersonError`, so nothing outside `storage.py` ever sees a database error). And `main` in `cli.py` catches `CakeDayError` in exactly one place, prints `Error: ...` to `sys.stderr`, and exits with `1` ([chapter 24](../24-command-line-programs/notes.md)), just like chapter 38's `main`. So mistakes look like this:

```
cakeday remove Tom
Error: there's no one called 'Tom'. See everyone with 'cakeday list'.

cakeday add maya 1999-05-01
Error: there's already someone called 'maya'.

cakeday add Tom 2027-01-01
Error: 2027-01-01 is in the future.

cakeday add Tom 1995-02-30
usage: cakeday add [-h] name born
cakeday add: error: argument born: '1995-02-30' isn't a real date (use YYYY-MM-DD, like 1998-10-14)
```

`$LASTEXITCODE` is `1` after the first three and `2` after the last, argparse's code for "you ran me the wrong way". A good error says what went wrong *and* what to do about it. The last one is argparse's own error, with a friendlier message: `born` uses a small `type=` function that tries `date.fromisoformat` and, when that fails, raises `argparse.ArgumentTypeError` with the message you want. (Plain `type=date.fromisoformat` works too, but its message is `invalid fromisoformat value: '1995-02-30'`, which means nothing to most people.)

Everything else, a real bug, should **not** be caught. Let it crash with a full traceback, so you can find it ([chapter 18](../18-error-handling/notes.md), "When to catch, and when to let it crash").

### Logging

The [chapter 37](../37-debugging-and-logging/notes.md) way: `logger = logging.getLogger(__name__)` at the top of each module that has something to say, `logging.basicConfig` once, in `main`, and a `-v`/`--verbose` flag that switches on the debug messages:

```
cakeday -v soon --days 3
DEBUG cakeday.storage: Opening C:\Users\Sandip\cakeday.db
Today: Priya turns 35!
Coming up:
  Wed 14 Oct  Maya turns 28 (in 2 days)
```

Log messages go to standard error, so they never get mixed into output someone sends to a file. And never log secrets, passwords, or more personal data than you need.

### The security pass

Go through [chapter 52](../52-security-basics/notes.md)'s habits, and tick off each one that applies to your project:

- [ ] Every value goes into SQL through `?` placeholders, never an f-string ([chapter 42](../42-databases/notes.md)).
- [ ] No secrets in the code or in Git. Keys live in environment variables or a `.env` file that's in `.gitignore`, with a `.env.example` that is committed ([chapters 40](../40-working-with-apis/notes.md) and 52).
- [ ] Your own data isn't in Git either (`*.db` in `.gitignore`).
- [ ] Input is checked at the edge: argparse `type=` for commands, Pydantic models for APIs ([chapter 43](../43-building-a-web-api-with-fastapi/notes.md)).
- [ ] No `shell=True` with anything a user typed ([chapter 45](../45-automating-tasks/notes.md)), no `eval`, and no `pickle` from strangers.
- [ ] File names from users can't escape their folder (`resolve()` and `is_relative_to`, chapter 52).
- [ ] For a web API: users never see a traceback, CORS only allows your own front end, and passwords are only ever stored as slow, salted hashes (chapter 52).
- [ ] `bandit` and `pip-audit` have nothing to report.

The last two tools are from chapter 52. Install them in your virtual environment with `python -m pip install bandit pip-audit` (or add them to the `dev` group). For Cake Day, the lines that matter in `bandit -r src`'s report are:

```
Test results:
	No issues identified.
```

and `pip-audit` with:

```
No known vulnerabilities found
Name    Skip Reason
------- ----------------------------------------------------------------------
cakeday Dependency not found on PyPI and could not be audited: cakeday (0.1.0)
```

The skipped line is Cake Day itself: it isn't on PyPI, so there's nothing to look up. That's fine.

**Check it:** every mistake you can think of gives a clear message and the right exit code, `-v` tells you what the program did, and every box that applies to your project is ticked.

## Step 8: Speed it up, but only if you need to

The order from [chapter 49](../49-performance/notes.md): make it work, make it right, then make it fast, and only if you've measured that it's slow. So measure. PowerShell can time any command:

```
(Measure-Command { cakeday soon }).TotalSeconds
```

```
0.2838077
```

(Your number will be different.) About a quarter of a second from Enter to answer, and Cake Day's own work (opening the database, reading six people, doing the sums, printing) is about 0.02 seconds of it. The rest is Python starting up and loading modules. Nobody can feel that. So Cake Day's performance work is: **nothing**. For most small projects, that's the right answer, and it's worth saying so in your plan.

When performance work *is* worth it, it's usually one of these:

| Your project... | The usual fix | Chapters |
|---|---|---|
| Downloads many pages or API answers, one after another | Do them at the same time | [47](../47-async-python/notes.md), [48](../48-threads-processes-and-the-gil/notes.md) |
| Checks `in` on a long list, inside a loop | A set or a dictionary | [12](../12-tuples-and-sets/notes.md), [13](../13-dictionaries/notes.md), [49](../49-performance/notes.md) |
| Asks the database once per item | One query with a join, or `executemany` | [42](../42-databases/notes.md), [49](../49-performance/notes.md) |
| Works out the same answer again and again | `@cache` | [34](../34-functional-tools/notes.md) |
| Loops over a huge CSV file by hand | pandas | [44](../44-working-with-data/notes.md) |
| Does heavy number-crunching | Several processes | [48](../48-threads-processes-and-the-gil/notes.md) |

Whichever it is: measure first (`perf_counter`, `cProfile`), change one thing, and measure again.

**Check it:** you measured, with realistic data, before changing anything for speed.

## Step 9: Write a README, and ship it

### The README

`README.md` is the first thing anyone sees on GitHub, so it's your project's front door. Write it for someone who has never heard of your project:

- **The name and one sentence**: your step 1 sentence.
- **How to install it**, or, for a web API, its live address.
- **How to use it**: a short example session. Your sketch from the top of this chapter is perfect.
- **How to work on it**: make a venv, `python -m pip install -e . --group dev`, `pre-commit install`, `python -m pytest`.
- **Built with**: Python 3.13 and the packages from step 4. (Cake Day's honest answer: nothing but the standard library.) Credit any API or data you use.
- **What I learned**: two or three honest sentences. Something that was harder than you expected is great.
- **What's next**: your nice-to-have list.

### Shipping it

"Shipping" means getting it to the people it's for. How depends on the kind of program:

| Your project is... | Ship it by... | Chapters |
|---|---|---|
| A command-line tool | Putting it on GitHub, so people can install it straight from there (or sending them the wheel). Practise publishing on TestPyPI, if you like. | [39](../39-project-structure-and-packaging/notes.md) |
| A web API | A Docker image on a cloud host, with its settings in environment variables and a health check | [53](../53-deploying/notes.md) |
| A script that runs by itself | Task Scheduler, on a computer that's switched on when the job is due | [45](../45-automating-tasks/notes.md) |
| A data report | The code on GitHub, and the report (a spreadsheet, a chart) for whoever needs it | [44](../44-working-with-data/notes.md) |

Whatever the kind, add the continuous integration workflow from [chapter 53](../53-deploying/notes.md), so GitHub runs Ruff, mypy and pytest on every push. Then a broken test can never sneak in on a day you forgot to run them.

For Cake Day, that means pushing it to GitHub ([React chapter 40](../../React/40-deploying/notes.md) has the commands). Then anyone with Python and Git can install it in their own virtual environment, in one line (`sandip` is a made-up user name: use yours):

```
python -m pip install git+https://github.com/sandip/cakeday.git
cakeday --version
```

```
cakeday 0.1.0
```

> **Watch out:** Before your first push, look at the list of files that will go up (`git status`, or the commit's file list). No `.venv`, no `.db` files, no `.env`. If a secret ever does get committed, deleting the file isn't enough, because Git's history still has it: change the secret itself ([chapter 52](../52-security-basics/notes.md)).

**"It's not ready yet" is not a reason to wait.** Ship the MVP. You can ship again every day. A project people are using, a bit plain, is worth far more than a perfect one nobody can see.

**Check it:** a friend can follow your README, install or open your project, and use it, without asking you anything.

## Step 10: Ask for a code review

When a slice works, ask Claude to review it. A good request says what the code is, what you're unsure about, and what kind of help you want:

> "Here's my Cake Day project: `birthdays.py`, `storage.py` and `cli.py`, with their tests. It works, the tests pass, and Ruff and mypy are happy. Please review it for bugs, for code in the wrong module, and for error messages that would confuse someone. I'm not sure `show_soon` in `cli.py` does too much. Don't rewrite it for me: point out the problems and explain why."

Go through the skills checklist below and step 7's security pass before you ask. Feedback on the things you *didn't* spot is the most useful kind. And a review is about the code, not about you: a list of problems is a gift, not a grade. ([Chapter 50](../50-clean-code-and-style/notes.md) has more on code reviews.)

**Check it:** you asked for at least one review, and you understood (and fixed, or argued with!) every point in it.

## Your skills checklist

Show off the skills that fit your idea. Don't force them all in: a project that uses a package or a pattern it doesn't need shows *less* skill, not more. Cake Day leaves out half the course, and it's better for it.

| Skill | Chapters | In Cake Day |
|---|---|---|
| Functions, lists, dictionaries, comprehensions | [10](../10-functions/notes.md) to [15](../15-comprehensions/notes.md) | Everywhere |
| Your own exception family | [18](../18-error-handling/notes.md), [28](../28-inheritance/notes.md) | `errors.py` |
| Modules, packages and the src layout | [19](../19-modules-and-standard-library/notes.md), [39](../39-project-structure-and-packaging/notes.md) | The whole folder |
| Files and paths | [20](../20-files-and-folders/notes.md) | `Path.home() / "cakeday.db"` |
| JSON and CSV | [21](../21-json-and-csv/notes.md) | Not yet: the CSV import nice-to-have |
| Dates | [22](../22-dates-and-times/notes.md) | `birthdays.py`, `--today` |
| Virtual environments and pip | [23](../23-pip-and-virtual-environments/notes.md) | Step 5 |
| Command-line programs, exit codes | [24](../24-command-line-programs/notes.md) | `cli.py` |
| Type hints and mypy | [25](../25-type-hints/notes.md) | Every function, checked on every commit |
| Classes and dataclasses | [27](../27-classes-and-objects/notes.md), [30](../30-dataclasses-and-enums/notes.md) | `Person` |
| Generators and context managers | [31](../31-iterators-and-generators/notes.md), [33](../33-context-managers/notes.md) | `with con:` transactions, a `yield` fixture |
| Sorting and functional tools | [34](../34-functional-tools/notes.md) | The order of `cakeday soon` |
| Regular expressions | [35](../35-regular-expressions/notes.md) | Not needed |
| Tests: fixtures, `tmp_path`, `capsys` | [36](../36-testing-with-pytest/notes.md) | `tests/` |
| Logging | [37](../37-debugging-and-logging/notes.md) | `-v` |
| APIs and web scraping | [40](../40-working-with-apis/notes.md), [41](../41-web-scraping/notes.md) | Not needed |
| SQLite | [42](../42-databases/notes.md) | `storage.py` |
| FastAPI | [43](../43-building-a-web-api-with-fastapi/notes.md), [46](../46-project-expense-tracker-api/notes.md) | Not needed (the family web page would) |
| pandas | [44](../44-working-with-data/notes.md) | Not needed |
| Automation and scheduling | [45](../45-automating-tasks/notes.md) | Not yet: the morning reminder |
| Async, threads and processes | [47](../47-async-python/notes.md), [48](../48-threads-processes-and-the-gil/notes.md) | Not needed: nothing to wait for |
| Measuring performance | [49](../49-performance/notes.md) | Step 8: measured, nothing to fix |
| Ruff, pre-commit and clean code | [50](../50-clean-code-and-style/notes.md) | Every commit |
| Design patterns | [51](../51-design-patterns/notes.md) | `storage.py` is a repository, and `today` is passed in |
| Security | [52](../52-security-basics/notes.md) | Step 7's pass |
| Deploying and CI | [53](../53-deploying/notes.md) | CI on GitHub |

## Common mistakes

**1. Starting too big.** "A family social network" never gets finished. "A command that says whose birthday is coming up" does. Finish small, ship it, then grow it.

**2. Adding every package "because you can".** FastAPI, PostgreSQL, Docker and async, for a tool one person uses on one computer. Each one is more to learn, more to set up, more to keep up to date, and more to go wrong. Add a package when you feel the pain it removes.

**3. Building layer by layer.** All the SQL first, then all the logic, then the command line, and nothing you can run for two weeks. Cut thin slices, and keep the program working after every one.

**4. Reading the clock (or the network) deep inside your logic.** If `next_birthday` called `date.today()` itself, a test written on 9 October 2026 that expects 10 October for a birthday on the 10th would pass that day, and fail three days later:

```
E       assert datetime.date(2027, 10, 10) == datetime.date(2026, 10, 10)
```

Nothing in the code changed. Only the calendar did. Pass `today` in, and read the real clock in one place, at the edge.

**5. Committing your data or your secrets.** Write `.gitignore` before the first `git add .`. A `.db` file full of real people's details, or a `.env` with an API key, is very hard to take back once it's on GitHub.

**6. Catching every exception.** `except Exception:` with a polite "Something went wrong" hides your real bugs from you, forever. Catch your own family of errors, the ones the user can fix, and let bugs crash loudly.

**7. Writing a lot before running anything.** Run the program after every small change, and the tests after every slice. A bug from the last five minutes is easy to find. A bug from the last five hours isn't.

**8. Never shipping because it's "not ready yet".** It will never feel ready. Ship the MVP, and let real use show you what's missing.

## Quick recap

- Pick **one small idea** you can say in a sentence, decide what **kind** of program it is, and build the **MVP** first.
- **Sketch the data**: store the facts, work out the rest, and choose where it lives for a reason.
- **Plan the modules** so that only one knows about the database, only one talks to the user, and the logic in the middle is pure and easy to test.
- **Choose packages on purpose.** Start with the standard library, and add a package only when you feel the pain it removes.
- **Set up properly** (Git, a venv, `pyproject.toml`, Ruff, mypy, pytest, pre-commit), then build in **thin slices**, testing and committing after each one.
- Do an **errors, logging and security pass**, measure before you optimise, then **ship it** with a good README.
- Ask for a **code review**, and learn from it.

---

## Congratulations! 🎉

Look at how far you've come. In chapter 01, you typed `print("Hello")` and Python answered. Now you can plan a program from a blank page, choose your tools and say why, build it in slices with tests and type checks, keep it safe, and put it where other people can use it.

| Project | What it taught you |
|---|---|
| Shopping Cart (14) | Lists, dictionaries and loops working together |
| To-Do List App (26) | Files, modules, and a real command line |
| Library System (38) | Classes, tests and logging in a bigger program |
| Expense Tracker API (46) | A real backend: a database, an API, and tests |
| Your project (54) | Making every decision yourself, and shipping it |

That's the journey from "following a tutorial" to "building software". Be proud of it.

**Where to go next:**

- **Django:** the big, "batteries-included" web framework. It comes with user accounts, an admin site and its own way of talking to databases built in, so it's a natural next step after FastAPI.
- **Data science:** NumPy (fast maths on big arrays of numbers), more pandas, charts with matplotlib, and machine learning with scikit-learn. This is where Python really shines.
- **The other courses in this folder:** a [React](../../React/README.md) front end for your API, or the [PostgreSQL course](../../PostgreSQL/README.md) for databases in depth.

Each of the first two could get its own folder here. Until then, keep building. Rebuild a tool you use every day, go back to one of your projects and do its nice-to-haves, or try an idea that scares you a little. Every project you finish makes the next one easier.

---

**Next:** pick an idea from the [exercises](exercises.md), or bring your own, and start building.

[Back to the roadmap](../README.md)
