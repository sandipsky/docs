# 42 Databases

## What is it?

A **database** is an organized place to keep data, with a program in charge of it that can find, change and protect that data quickly. You ask it for things in a small language called **SQL**.

Python comes with **SQLite** built in: a complete database that lives in a single file, like `tasks.db`. For bigger apps with many users, Python can also talk to a database server like **PostgreSQL**. This chapter covers both, starting with SQLite.

## Why does it matter?

Think back to the to-do app from [chapter 26](../26-project-todo-app/notes.md). Every command did the same three steps: load the whole of `tasks.json`, change the list, save the whole list back. That's perfect for four tasks. But it has limits:

1. **Everything, every time.** To tick off one task, the app reads and rewrites the entire file. With four tasks, nobody notices. With a shop's million orders, every click would rewrite a million orders.
2. **Two at once.** Say Sandip runs `done 1` at the very moment a little reminder script runs `add "Feed the cat"`. Both load the same list. Each changes its own copy. Each saves. Whoever saves second wins, and the other change quietly disappears.
3. **Searching means looping.** "Show every overdue task" means loading everything and checking each task in Python.
4. **No rules.** Nothing stops a bug (or a person editing the file) from saving a task with no title, or `"done": "maybe"`. And a crash halfway through saving leaves a broken file, as [chapter 21](../21-json-and-csv/notes.md) warned.

A database fixes all four. It changes one row without touching the rest. It lets many programs use it at once without losing anyone's changes. It finds rows fast, even among millions. It refuses data that breaks your rules. And it can make a group of changes **all or nothing**, even if the power goes out halfway.

## Real-world example

Imagine keeping your to-do list in a notebook, where the only way to change anything is to copy the whole notebook out again by hand, with the change in it. That's `tasks.json`.

Now imagine a filing cabinet with a librarian at the desk. You hand over a slip: "Tick off card 3." The librarian finds card 3, ticks it, and puts it back. Nothing else gets rewritten. If two people hand in slips at the same moment, the librarian deals with them one at a time. And if you hand in a card with no title, the librarian hands it straight back.

| Everyday thing | Database thing |
|---|---|
| The filing cabinet | The database (for SQLite, one file like `tasks.db`) |
| One drawer, for one kind of card | A **table**, like `tasks` |
| One card in the drawer | A **row** (one task) |
| The headings printed on every card | The **columns** (`id`, `title`, `done`, ...) |
| The slip you hand over | An SQL statement |
| The librarian | The database engine: SQLite or PostgreSQL |
| "Every card must have a title" | A **constraint**, like `NOT NULL` |
| "Do all of these slips, or none of them" | A **transaction** |

## How it works

### A five-minute SQL recap

SQL (say "S-Q-L" or "sequel") is its own small language, and every database speaks it, with tiny differences. If you've done Levels 1 to 3 of the [PostgreSQL course](../../PostgreSQL/README.md), skim this. If not, this is enough to follow the chapter:

```sql
CREATE TABLE tasks (
    id    INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    done  INTEGER NOT NULL DEFAULT 0
);
INSERT INTO tasks (title) VALUES ('Buy milk');
SELECT id, title FROM tasks WHERE done = 0 ORDER BY id;
UPDATE tasks SET done = 1 WHERE id = 1;
DELETE FROM tasks WHERE id = 1;
```

Read them aloud and they're almost English: "create a table called tasks", "insert into tasks a row with the title Buy milk", "select the id and title from tasks where done is 0, ordered by id". A few rules that trip up Python people: text goes in **single** quotes, "is equal to" is a single `=`, and capital letters for the keywords are just a habit (SQL doesn't mind).

| SQL | What it does | Learn more |
|---|---|---|
| `CREATE TABLE` | Makes a table and names its columns | [PostgreSQL 05](../../PostgreSQL/05-your-first-table/notes.md) |
| `INSERT INTO ... VALUES` | Adds rows | [PostgreSQL 06](../../PostgreSQL/06-adding-data/notes.md) |
| `SELECT ... FROM` | Reads rows | [PostgreSQL 07](../../PostgreSQL/07-reading-data/notes.md) |
| `WHERE`, `AND`, `OR`, `IS NULL` | Picks which rows | [PostgreSQL 08](../../PostgreSQL/08-filtering-rows/notes.md) |
| `ORDER BY`, `LIMIT` | Sorts, and keeps the first few | [PostgreSQL 09](../../PostgreSQL/09-sorting-and-limiting/notes.md) |
| `UPDATE`, `DELETE` | Changes or removes rows (always with a `WHERE`!) | [PostgreSQL 10](../../PostgreSQL/10-changing-and-deleting-data/notes.md) |
| `NOT NULL`, `CHECK`, `UNIQUE`, `DEFAULT` | Rules for a column | [PostgreSQL 13](../../PostgreSQL/13-constraints/notes.md) |
| `PRIMARY KEY` | A unique ID for every row | [PostgreSQL 14](../../PostgreSQL/14-primary-keys/notes.md) |
| `COUNT`, `SUM`, `GROUP BY` | Totals, and totals per group | [PostgreSQL 20](../../PostgreSQL/20-counting-and-totals/notes.md) and [21](../../PostgreSQL/21-grouping/notes.md) |

### Connecting to SQLite

Make a new folder for this chapter's examples and open a terminal in it. Nothing to install: `sqlite3` is part of the standard library ([chapter 19](../19-modules-and-standard-library/notes.md) listed it).

```python
import sqlite3

con = sqlite3.connect("tasks.db")
print(sqlite3.sqlite_version)  # prints: 3.50.4 (yours may be different)
con.close()
```

Run it, and a new file called `tasks.db` appears in the folder. `sqlite3.connect()` opens the database file, and creates it if it isn't there yet. What you get back is a **connection**: an open line to the database, like a phone line to the librarian. Everything you ask goes through it, and `con.close()` hangs up.

### Creating a table

A new database is empty, so the first job is a table. Save this as `create_table.py`:

```python
import sqlite3

con = sqlite3.connect("tasks.db")
con.execute("""
    CREATE TABLE IF NOT EXISTS tasks (
        id      INTEGER PRIMARY KEY,
        title   TEXT    NOT NULL CHECK (title <> ''),
        done    INTEGER NOT NULL DEFAULT 0 CHECK (done IN (0, 1)),
        created TEXT    NOT NULL,
        due     TEXT
    )
""")
con.close()
print("Table ready")
```

`con.execute()` sends one SQL statement to the database. The SQL is just a Python string; triple quotes let it spread over several lines so it's readable.

These are the same five fields as a chapter 26 task:

- `id INTEGER PRIMARY KEY`: a unique number for every row. If you don't give one, SQLite fills it in: one more than the biggest ID so far, just like `next_id` in chapter 26.
- `title TEXT NOT NULL CHECK (title <> '')`: text that must be there (`NOT NULL`) and can't be empty (`<>` means "is not equal to" in SQL).
- `done INTEGER ... CHECK (done IN (0, 1))`: SQLite has no true/false type, so `done` is `0` or `1`, and the `CHECK` refuses anything else.
- `created TEXT NOT NULL` and `due TEXT`: SQLite has no date type either, so dates are stored as ISO text like `'2026-10-08'`, the same as in `tasks.json`. `due` has no `NOT NULL`, so it can be empty. An empty value in a database is called **NULL**, and Python sees it as `None`.

`IF NOT EXISTS` means "only if there isn't one already", so the script is safe to run again and again.

### Adding a row: `?` placeholders and `commit()`

Save this as `add_one.py`:

```python
import sqlite3

con = sqlite3.connect("tasks.db")
cur = con.execute(
    "INSERT INTO tasks (title, created, due) VALUES (?, ?, ?)",
    ("Buy milk", "2026-10-05", "2026-10-08"),
)
print(f"New task ID: {cur.lastrowid}")  # prints: New task ID: 1
con.commit()  # save the change for real
con.close()
```

Three new things:

1. **The `?` marks are placeholders.** You write the SQL with a `?` wherever a value goes, and pass the values separately, as a tuple, in the same order. `sqlite3` slots them in safely. Never paste values into the SQL string yourself; you'll see why in "Why `?` matters" below.
2. **`con.execute()` gives back a cursor.** A **cursor** is the object that runs one statement and holds what came back, like a bookmark that moves through the results. For an `INSERT`, `cur.lastrowid` is the ID the new row got.
3. **`con.commit()` saves the change for good.** Until you commit, your change is only "pending". If the program ends without committing, the change is thrown away. (That's a classic mistake, coming up at the end.)

> **Tip:** Each run adds another row. Run `add_one.py` twice and you get a second "Buy milk" with ID 2. To start again, delete `tasks.db` and run `create_table.py`.

### Adding many rows: `executemany`

To add a whole list of rows, `executemany()` runs the same statement once for each tuple. Here are the other three tasks from chapter 26's sample file, in `add_many.py`:

```python
import sqlite3

new_tasks = [
    ("Renew passport", 0, "2026-10-05", "2029-03-01"),
    ("Call grandma", 0, "2026-10-06", None),
    ("Water the plants", 1, "2026-10-06", "2026-10-07"),
]

con = sqlite3.connect("tasks.db")
cur = con.executemany(
    "INSERT INTO tasks (title, done, created, due) VALUES (?, ?, ?, ?)",
    new_tasks,
)
print(f"Added {cur.rowcount} tasks")  # prints: Added 3 tasks
con.commit()
con.close()
```

`None` becomes NULL in the database. `cur.rowcount` says how many rows the statement changed.

### Reading rows: `fetchall`, `fetchone`, and loops

A `SELECT` gives you rows back through the cursor. `fetchall()` collects them all into a list. Save this as `read_all.py`:

```python
import sqlite3

con = sqlite3.connect("tasks.db")
cur = con.execute("SELECT id, title, done, due FROM tasks ORDER BY id")
rows = cur.fetchall()
print(rows)
for task_id, title, done, due in rows:
    box = "[x]" if done else "[ ]"
    print(f"{task_id:>3}  {box}  {title}")
con.close()
```

You'll see:

```
[(1, 'Buy milk', 0, '2026-10-08'), (2, 'Renew passport', 0, '2029-03-01'), (3, 'Call grandma', 0, None), (4, 'Water the plants', 1, '2026-10-07')]
  1  [ ]  Buy milk
  2  [ ]  Renew passport
  3  [ ]  Call grandma
  4  [x]  Water the plants
```

Each row is a tuple, with the columns in the order you asked for them, so you can unpack it straight into names ([chapter 12](../12-tuples-and-sets/notes.md)). The NULL due date came back as `None`.

When you expect at most one row, `fetchone()` gives you that row, or `None` if nothing matched. And you can loop over the cursor directly, without collecting everything first:

```python
import sqlite3

con = sqlite3.connect("tasks.db")
row = con.execute("SELECT title, due FROM tasks WHERE id = ?", (2,)).fetchone()
print(row)  # prints: ('Renew passport', '2029-03-01')
missing = con.execute("SELECT title, due FROM tasks WHERE id = ?", (99,)).fetchone()
print(missing)  # prints: None

count = con.execute("SELECT COUNT(*) FROM tasks WHERE done = 0").fetchone()[0]
print(f"{count} to do")  # prints: 3 to do

for (title,) in con.execute("SELECT title FROM tasks WHERE due IS NULL"):
    print(f"No due date: {title}")  # prints: No due date: Call grandma
con.close()
```

Notice `(2,)`, with a comma. The values always go in a tuple, even when there's only one, and a one-item tuple needs that comma. Forgetting it is one of the most common mistakes (see the end of the chapter). Also notice that the counting happened inside the database: `COUNT(*)` sent back one number, not every row.

### Rows you can read by name: `sqlite3.Row`

`row[1]` works, but what was column 1 again? Set the connection's `row_factory` to `sqlite3.Row`, and every row can be read by column name too:

```python
import sqlite3

con = sqlite3.connect("tasks.db")
con.row_factory = sqlite3.Row  # rows you can read by column name
row = con.execute("SELECT * FROM tasks WHERE id = ?", (1,)).fetchone()
print(row["title"], row["due"])  # prints: Buy milk 2026-10-08
print(row[0])  # prints: 1
print(row.keys())  # prints: ['id', 'title', 'done', 'created', 'due']
print(dict(row))
con.close()
```

The last line prints a real dictionary, the same shape as a chapter 26 task (except that `done` is `0`, not `False`):

```
{'id': 1, 'title': 'Buy milk', 'done': 0, 'created': '2026-10-05', 'due': '2026-10-08'}
```

`SELECT *` means "every column". It's handy for quick looks; in real code, naming the columns you want is clearer.

### Changing and deleting: `UPDATE`, `DELETE` and `rowcount`

`UPDATE` and `DELETE` work the same way. `rowcount` tells you how many rows were affected, which is how you find out whether the ID existed. Save as `change.py`:

```python
import sqlite3

con = sqlite3.connect("tasks.db")
cur = con.execute("UPDATE tasks SET due = ? WHERE id = ?", ("2026-10-10", 3))
print(f"Updated {cur.rowcount} task")  # prints: Updated 1 task
cur = con.execute("UPDATE tasks SET due = ? WHERE id = ?", ("2026-10-10", 99))
print(f"Updated {cur.rowcount} tasks")  # prints: Updated 0 tasks
cur = con.execute("DELETE FROM tasks WHERE done = 1")
print(f"Deleted {cur.rowcount} task")  # prints: Deleted 1 task
con.commit()

titles = [title for (title,) in con.execute("SELECT title FROM tasks")]
print(titles)  # prints: ['Buy milk', 'Renew passport', 'Call grandma']
con.close()
```

There's no task 99, so nothing was updated and no error happened. A `rowcount` of `0` is how your code notices.

> **Watch out:** `DELETE FROM tasks` with no `WHERE` deletes **every** row, and `UPDATE tasks SET done = 1` with no `WHERE` ticks off every task. The database won't ask "are you sure?". Write the `WHERE` first.

### Why `?` matters: SQL injection

Why not just build the SQL with an f-string? Two reasons. The first one shows up with perfectly innocent data:

```python
import sqlite3

con = sqlite3.connect("tasks.db")
title = "Call Maya's mum"
sql = f"INSERT INTO tasks (title, created) VALUES ('{title}', '2026-10-12')"
print(sql)
con.execute(sql)
```

```
INSERT INTO tasks (title, created) VALUES ('Call Maya's mum', '2026-10-12')
sqlite3.OperationalError: near "s": syntax error
```

The apostrophe in `Maya's` ended the SQL text early, and the database couldn't make sense of `s mum'`. Any title with an apostrophe crashes this program.

The second reason is worse. When someone *deliberately* types SQL into your program, they can change what your statement does. This is called **SQL injection**, and it's one of the most common ways real websites get broken into. Here's a "remove a task by its title" feature written both ways. It runs on a throwaway database in memory (`":memory:"` makes a database that vanishes when the program ends), so your real tasks are safe:

```python
import sqlite3


def remove_unsafe(con: sqlite3.Connection, title: str) -> int:
    """Delete tasks with this title. DON'T DO THIS: the title is glued into the SQL."""
    cur = con.execute(f"DELETE FROM tasks WHERE title = '{title}'")
    return cur.rowcount


def remove_safe(con: sqlite3.Connection, title: str) -> int:
    """Delete tasks with this title, passing it separately with a ? placeholder."""
    cur = con.execute("DELETE FROM tasks WHERE title = ?", (title,))
    return cur.rowcount


def fresh_database() -> sqlite3.Connection:
    con = sqlite3.connect(":memory:")  # a throwaway database, only in memory
    con.execute("CREATE TABLE tasks (id INTEGER PRIMARY KEY, title TEXT NOT NULL)")
    con.executemany(
        "INSERT INTO tasks (title) VALUES (?)",
        [("Buy milk",), ("Renew passport",), ("Call grandma",)],
    )
    return con


typed = "nothing' OR '1'='1"  # what someone typed into the "remove" box

print(f"Unsafe: deleted {remove_unsafe(fresh_database(), typed)} tasks")
print(f"Safe: deleted {remove_safe(fresh_database(), typed)} tasks")
```

```
Unsafe: deleted 3 tasks
Safe: deleted 0 tasks
```

Glued into the f-string, the SQL became `DELETE FROM tasks WHERE title = 'nothing' OR '1'='1'`. The typed quote closed the text early, and `OR '1'='1'` is true for every row, so every task was deleted. With `?`, the typed text travels to the database separately, **as a value**, so it can never become part of the SQL. The safe version looked for a task literally called `nothing' OR '1'='1`, found none, and deleted nothing.

The rule has no exceptions: **values go in the placeholders, never in the SQL string.** Not for numbers, not for "trusted" data, not just this once. (The [PostgreSQL course](../../PostgreSQL/40-connecting-from-nodejs/notes.md) shows the same attack from Node.js.)

### Rules the database enforces

Remember the constraints in the `CREATE TABLE`? The database checks them on every change, and refuses a row that breaks one by raising `sqlite3.IntegrityError`. Catch it like any other exception ([chapter 18](../18-error-handling/notes.md)):

```python
import sqlite3

con = sqlite3.connect("tasks.db")
bad_tasks = [("", 0), ("Pay rent", 2), (None, 0)]
for title, done in bad_tasks:
    try:
        with con:
            con.execute(
                "INSERT INTO tasks (title, done, created) VALUES (?, ?, ?)",
                (title, done, "2026-10-12"),
            )
    except sqlite3.IntegrityError as e:
        print(f"Refused {title!r}: {e}")
con.close()
```

```
Refused '': CHECK constraint failed: title <> ''
Refused 'Pay rent': CHECK constraint failed: done IN (0, 1)
Refused None: NOT NULL constraint failed: tasks.title
```

(The `with con:` is explained in the next section.) Your Python code should still check its input, like `parse_due` did in chapter 26. The constraints are a safety net underneath: even a buggy program can't save a task with no title.

> **Watch out:** SQLite is relaxed about column types. It will happily store the text `'next week'` in `due`, or even `'lots'` in an `INTEGER` column. That's why the `CHECK` rules matter, and why your code should check dates before saving them. (PostgreSQL is strict about types, and refuses both.)

### Transactions: `with con:`

A **transaction** is a group of changes that happen all together or not at all. Python's `sqlite3` starts one for you before your first change, and `commit()` ends it. But there's a neater way: use the connection in a `with` block. When the block finishes normally, it commits. If an exception escapes from the block, it **rolls back**: every change in the block is thrown away. Save as `transaction.py`:

```python
import sqlite3

con = sqlite3.connect("tasks.db")
try:
    with con:  # one transaction: all of it, or none of it
        con.execute(
            "INSERT INTO tasks (title, created) VALUES (?, ?)",
            ("Book the dentist", "2026-10-12"),
        )
        con.execute(
            "INSERT INTO tasks (title, created) VALUES (?, ?)",
            ("", "2026-10-12"),  # an empty title breaks the CHECK rule
        )
except sqlite3.IntegrityError as e:
    print(f"Refused: {e}")

count = con.execute("SELECT COUNT(*) FROM tasks").fetchone()[0]
print(f"{count} tasks")
con.close()
```

```
Refused: CHECK constraint failed: title <> ''
3 tasks
```

Still 3 tasks. The first insert worked, but the second failed, so the whole block was rolled back and "Book the dentist" vanished with it. Nothing half-done. That's exactly what you want for a bank transfer: take money from one account, add it to another, and never just one of the two ([PostgreSQL chapter 30](../../PostgreSQL/30-transactions/notes.md) tells the whole story).

Now look at the line after the `with` block: it ran a `SELECT` on `con`, and it worked. **`with con:` does not close the connection.** That's different from `with open(...)` in [chapter 20](../20-files-and-folders/notes.md), and it surprises almost everyone. You still need `con.close()` when you're done. The `storage.py` later in this chapter shows a safe way: `con.close()` in the `finally` part of a `try` ([chapter 18](../18-error-handling/notes.md)), so it runs even if something goes wrong. (The `contextlib` module from [chapter 33](../33-context-managers/notes.md) has another way: `from contextlib import closing`, then `with closing(sqlite3.connect("tasks.db")) as con:` closes the connection at the end of the block.)

### Dates and true/false in SQLite

SQLite has no date type and no true/false type, so you convert at the edges:

- **Dates** go in as ISO text with `.isoformat()`, and come out with `date.fromisoformat()` ([chapter 22](../22-dates-and-times/notes.md)).
- **True/false** goes in as `True`/`False` (stored as `1`/`0`), and comes out as `1`/`0`. Turn it back with `bool()`.

ISO dates have a lovely property: as text, they sort and compare in date order, because the year comes first. So the database can find overdue tasks for you with a plain `<`:

```python
import sqlite3
from datetime import date

today = date(2026, 10, 12)
con = sqlite3.connect("tasks.db")
rows = con.execute(
    "SELECT id, title, due FROM tasks WHERE done = 0 AND due < ? ORDER BY due",
    (today.isoformat(),),  # the date as text: '2026-10-12'
).fetchall()
for task_id, title, due in rows:
    days_late = (today - date.fromisoformat(due)).days
    print(f"Task {task_id}: {title} is {days_late} days late")
con.close()
```

```
Task 1: Buy milk is 4 days late
Task 3: Call grandma is 2 days late
```

"Renew passport" isn't due until 2029, so `due < '2026-10-12'` is false for it. And a task with no due date is never picked: NULL compared with anything is never true ([PostgreSQL chapter 08](../../PostgreSQL/08-filtering-rows/notes.md) explains why).

What if you save that as `overdue.py` and pass the `date` itself, `(today,)`? It still works today, but Python 3.12 and newer print a warning above the results:

```
C:\...\overdue.py:6: DeprecationWarning: The default date adapter is deprecated as of Python 3.12; see the sqlite3 documentation for suggested replacement recipes
  rows = con.execute(
Task 1: Buy milk is 4 days late
Task 3: Call grandma is 2 days late
```

**Deprecated** means "still works, but will be removed in a future version, so stop relying on it". Converting the date yourself with `.isoformat()` is clear, and it works on every version.

### Looking inside the database file

A `.db` file isn't text, so opening it in VS Code's editor shows gibberish. Three ways to look inside:

- **A VS Code extension.** Search the Extensions view for "SQLite Viewer". Several free extensions open a `.db` file as a table you can scroll through.
- **DB Browser for SQLite**, a free app from [sqlitebrowser.org](https://sqlitebrowser.org), lets you browse tables, edit rows and try SQL by clicking around.
- **Python's own SQLite shell** (Python 3.12 or newer), right in the terminal:

  ```
  python -m sqlite3 tasks.db
  sqlite3 shell, running on SQLite version 3.50.4
  Connected to 'tasks.db'

  Each command will be run using execute() on the cursor.
  Type ".help" for more information; type ".quit" or CTRL-Z to quit.
  sqlite> SELECT * FROM tasks;
  (1, 'Buy milk', 0, '2026-10-05', '2026-10-08')
  (2, 'Renew passport', 0, '2026-10-05', '2029-03-01')
  (3, 'Call grandma', 0, '2026-10-06', '2026-10-10')
  sqlite> .quit
  ```

> **Tip:** Close the viewer before your program writes to the database. While another program holds the file open with changes in progress, yours may get `sqlite3.OperationalError: database is locked`.

### The to-do app, now with a database

Chapter 26 made a promise: "If you ever want to save tasks somewhere else, like a database, only `storage.py` has to change." Time to keep it.

Copy your finished `my-todo-app` folder from chapter 26 into this chapter's folder, and call the copy `todo-sqlite`. Keep the old `storage.py` as `storage_json.py` if you like, and replace `storage.py` with this. It does the same two jobs as before, with the same names and the same first lines:

```python
# storage.py: loads and saves the tasks, now in an SQLite database.
import sqlite3
from pathlib import Path
from typing import Any

# One task, like {"id": 1, "title": "Buy milk", "done": False, ...}
Task = dict[str, Any]

# The database file lives next to this file, whichever folder you run from.
TASKS_FILE = Path(__file__).parent / "tasks.db"

SCHEMA = """
    CREATE TABLE IF NOT EXISTS tasks (
        id      INTEGER PRIMARY KEY,
        title   TEXT    NOT NULL CHECK (title <> ''),
        done    INTEGER NOT NULL DEFAULT 0 CHECK (done IN (0, 1)),
        created TEXT    NOT NULL,
        due     TEXT
    )
"""


def connect(path: Path) -> sqlite3.Connection:
    """Open the database, creating the file and the table if needed."""
    con = sqlite3.connect(path)
    con.row_factory = sqlite3.Row
    try:
        con.execute(SCHEMA)
    except sqlite3.DatabaseError:
        con.close()
        raise ValueError(f"{path.name} is broken (it isn't a database). Fix it or delete it.")
    return con


def load_tasks(path: Path) -> list[Task]:
    """Read every task from the database, in ID order."""
    con = connect(path)
    try:
        rows = con.execute("SELECT * FROM tasks ORDER BY id").fetchall()
    finally:
        con.close()
    tasks: list[Task] = []
    for row in rows:
        task = dict(row)
        task["done"] = bool(task["done"])  # SQLite gives back 0 or 1
        tasks.append(task)
    return tasks


def save_tasks(tasks: list[Task], path: Path) -> None:
    """Replace every task in the database with this list, in one transaction."""
    con = connect(path)
    try:
        with con:  # if anything fails, nothing changes
            con.execute("DELETE FROM tasks")
            con.executemany(
                "INSERT INTO tasks (id, title, done, created, due) "
                "VALUES (:id, :title, :done, :created, :due)",
                tasks,
            )
    finally:
        con.close()
```

What's going on:

- **`connect`** opens the database and makes sure the table exists, so the very first run works with no file at all, just like the missing `tasks.json` did. If the file isn't a database (someone saved a text file as `tasks.db`), SQLite raises `sqlite3.DatabaseError`, and `connect` turns it into the same kind of friendly `ValueError` as milestone 8, which `main()` in `todo.py` already catches.
- **`load_tasks`** reads every row and turns each one into a task dictionary, with `done` turned back into `True` or `False`.
- **`save_tasks`** empties the table and inserts every task again, inside **one transaction**. If anything goes wrong halfway, the `with con:` rolls back and the old tasks are still there. (The JSON version could leave a half-written file behind.)
- **`:id`, `:title`, ...** are **named placeholders**. Instead of `?`, each one has a name, and you pass a dictionary for each row: `sqlite3` looks up each name as a key. Tasks are already dictionaries, so the list goes straight in.

`todo.py` doesn't change at all. It still imports `TASKS_FILE`, `Task`, `load_tasks` and `save_tasks`, and it still gets back a list of task dictionaries.

To bring your old tasks along, run this once. Save it as `import_json.py` next to the other files, with a copy of chapter 26's `tasks.json`:

```python
# import_json.py: copy the tasks from tasks.json into tasks.db. Run it once.
import json
from pathlib import Path

from storage import TASKS_FILE, load_tasks, save_tasks

json_file = Path(__file__).parent / "tasks.json"
with open(json_file, encoding="utf-8") as f:
    old_tasks = json.load(f)

save_tasks(old_tasks, TASKS_FILE)
print(f"Copied {len(load_tasks(TASKS_FILE))} tasks into {TASKS_FILE.name}")
```

Then try the app (these were run on 12 October 2026):

```
python import_json.py
Copied 4 tasks into tasks.db

python todo.py list
 ID  Done  Due         Task
  1  [ ]   2026-10-08  Buy milk  (OVERDUE)
  2  [ ]   2029-03-01  Renew passport
  3  [ ]   -           Call grandma
3 to do, 1 overdue, 1 done

python todo.py add "Call Maya's mum"
Added task 5: Call Maya's mum

python todo.py done 1
Marked task 1 as done: Buy milk

python todo.py done 99
Error: there's no task with ID 99
```

Every command from chapter 26 behaves exactly as before, apostrophes included. And `python -m mypy todo.py storage.py` still says `Success: no issues found in 2 source files`.

### A better `storage.py` (and why it needs `todo.py` to change)

The new `storage.py` keeps the promise, but be honest about what it does: it still loads and saves **everything**, every time. It's the notebook again, just stored in a filing cabinet.

To use the database properly, `storage.py` needs one function per job, each changing only the rows it needs. Here are two of them:

```python
import sqlite3
from datetime import date


def add_task(con: sqlite3.Connection, title: str, due: str | None, today: date) -> int:
    """Add one task, and return the ID the database gave it."""
    cur = con.execute(
        "INSERT INTO tasks (title, created, due) VALUES (?, ?, ?)",
        (title, today.isoformat(), due),
    )
    con.commit()
    if cur.lastrowid is None:  # mypy knows lastrowid can be None
        raise RuntimeError("the database didn't give the task an ID")
    return cur.lastrowid


def mark_done(con: sqlite3.Connection, task_id: int) -> bool:
    """Tick off one task. Return False if there was no such task to tick off."""
    cur = con.execute(
        "UPDATE tasks SET done = 1 WHERE id = ? AND done = 0", (task_id,)
    )
    con.commit()
    return cur.rowcount == 1
```

`add_task` inserts one row, and the database picks the ID (no more `next_id`). `mark_done` changes one row, and `rowcount` says whether it found an unfinished task with that ID. (The `if cur.lastrowid is None` check is for mypy: `lastrowid` is `None` until something has been inserted, so its type is `int | None`, like the `None` checks in [chapter 25](../25-type-hints/notes.md).)

The catch: `todo.py` has to call these instead of changing a list, so this time both files change. That's the challenge exercise for this chapter.

### PostgreSQL with psycopg

SQLite is perfect for one program on one computer. A website with thousands of users, or a team sharing one database, needs a database **server**: a program that runs all the time and accepts connections over the network. PostgreSQL is the one from the [PostgreSQL course](../../PostgreSQL/README.md). The SQL is almost the same; the Python is almost the same too.

**Setup.** You need a running PostgreSQL server ([PostgreSQL chapter 03](../../PostgreSQL/03-installing-postgresql/notes.md)) and an empty database for this chapter. In psql, run `CREATE DATABASE todo;`. Then, in your project's virtual environment ([chapter 23](../23-pip-and-virtual-environments/notes.md)), install **psycopg** (version 3), the most popular PostgreSQL package for Python:

```
python -m pip install "psycopg[binary]"
```

The `[binary]` part also installs the C library psycopg needs to talk to PostgreSQL, so you don't have to install anything else. (This section was written with psycopg 3.3 and PostgreSQL 18.)

**The password.** Never write a password in your code, where it ends up in Git for anyone to read. Keep it in an **environment variable** instead, as in [chapter 40](../40-working-with-apis/notes.md). In PowerShell, set it for this terminal:

```
$env:PGPASSWORD = "your-postgres-password"
```

(In Command Prompt: `set PGPASSWORD=your-postgres-password`. On Mac or Linux: `export PGPASSWORD=your-postgres-password`.) Then save this as `pg_tasks.py`:

```python
import os
from datetime import date

import psycopg
from psycopg.rows import dict_row

with psycopg.connect(
    host="localhost",
    port=5432,
    dbname="todo",
    user="postgres",
    password=os.environ["PGPASSWORD"],
    row_factory=dict_row,
) as conn:
    conn.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            id      integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
            title   text    NOT NULL CHECK (title <> ''),
            done    boolean NOT NULL DEFAULT false,
            created date    NOT NULL DEFAULT current_date,
            due     date
        )
    """)
    new = conn.execute(
        "INSERT INTO tasks (title, due) VALUES (%s, %s) RETURNING id",
        ("Buy milk", date(2026, 10, 15)),
    ).fetchone()
    print(new)

    for task in conn.execute("SELECT * FROM tasks ORDER BY id"):
        print(task)

print(conn.closed)
```

You'll see (your `created` date will be the day you run it, and each run adds another "Buy milk"):

```
{'id': 1}
{'id': 1, 'title': 'Buy milk', 'done': False, 'created': datetime.date(2026, 10, 12), 'due': datetime.date(2026, 10, 15)}
True
```

Most of it will look familiar. The differences from `sqlite3`:

| | `sqlite3` | `psycopg` |
|---|---|---|
| Placeholders | `?` (or `:name`) | `%s` for every type, numbers too (or `%(name)s`) |
| Rows as dictionaries | `con.row_factory = sqlite3.Row` | `row_factory=dict_row` when connecting |
| ID of a new row | `cur.lastrowid` | `RETURNING id` in the SQL, then `fetchone()` |
| Dates and true/false | Text and `0`/`1`: convert yourself | Real `date` and `boolean` columns: you get `date` objects and `True`/`False` back |
| Leaving `with ... as conn:` | Commits (or rolls back), stays **open** | Commits (or rolls back), then **closes** |

- **`%s` is a placeholder, not Python's old `%` formatting.** psycopg sends the values separately, exactly like `?`. Never write `"... %s" % title` yourself: that glues the value into the string, and you're back to SQL injection.
- **`RETURNING id`** asks PostgreSQL to send back columns of the row it just inserted ([PostgreSQL chapter 06](../../PostgreSQL/06-adding-data/notes.md)). (SQLite has supported `RETURNING` since version 3.35 as well.)
- **The `with` block** commits when it ends normally and rolls back if an exception escapes, then closes the connection. The last line printed `True` because `conn.closed` is `True` after the block. This is the opposite of `sqlite3`, so don't mix them up.
- **Cursors.** `conn.execute()` is a shortcut that makes a cursor for you. In most psycopg examples online you'll see the longer form, which does the same thing:

  ```python
  with conn.cursor() as cur:
      cur.execute("SELECT count(*) FROM tasks")
      print(cur.fetchone())
  ```

> **Tip:** Looking for part of a title? Put the `%` wildcards in the **value**, not the SQL: `conn.execute("SELECT title FROM tasks WHERE title ILIKE %s", (f"%{word}%",))`. (`ILIKE` is PostgreSQL's pattern match that ignores capitals, and `%` in the pattern means "any text, or none".)

**Transactions.** Like `sqlite3`, psycopg starts a transaction for you, and the `with psycopg.connect(...)` block commits it at the end. For a smaller all-or-nothing group inside a longer connection, use `with conn.transaction():`:

```python
import os

import psycopg

with psycopg.connect(
    host="localhost", port=5432, dbname="todo", user="postgres",
    password=os.environ["PGPASSWORD"],
) as conn:
    try:
        with conn.transaction():  # all of it, or none of it
            conn.execute("INSERT INTO tasks (title) VALUES (%s)", ("Book the dentist",))
            conn.execute("INSERT INTO tasks (title) VALUES (%s)", ("",))
    except psycopg.errors.CheckViolation as e:
        print(f"Refused: {e}")

    print(conn.execute("SELECT count(*) FROM tasks").fetchone())
```

```
Refused: new row for relation "tasks" violates check constraint "tasks_title_check"
DETAIL:  Failing row contains (3, , f, 2026-10-12, null).
(1,)
```

Still one task: the dentist was rolled back with the bad row. PostgreSQL's errors are more detailed than SQLite's, and psycopg has an exception class for each kind, like `psycopg.errors.CheckViolation` and `psycopg.errors.UniqueViolation`.

> **Watch out:** If `PGPASSWORD` isn't set in the terminal you're using, the program stops at once with `KeyError: 'PGPASSWORD'`. If it's set but wrong, you get `psycopg.OperationalError: connection failed: ... password authentication failed for user "postgres"`. Environment variables only last until you close the terminal.

### SQLite or PostgreSQL?

| | SQLite | PostgreSQL |
|---|---|---|
| What it is | A library inside your program; the database is one file | A separate server program that you connect to |
| Setup | None: `import sqlite3` | Install and run a server, then `pip install "psycopg[binary]"` |
| Many people at once | Many readers, but only one writer at a time | Built for many users reading and writing at once |
| Types | Relaxed: no dates or true/false | Strict, with real dates, true/false, money and much more |
| Great for | Desktop and phone apps, small sites, tests, learning, your own tools | Web apps and APIs with many users, teams, big data |

Start with SQLite when it's just you and your program. Move to PostgreSQL when many users or several programs need the same data. The SQL you write barely changes.

### What about ORMs?

An **ORM** (object-relational mapper) is a library that lets you work with rows as Python objects and writes the SQL for you. The big one in Python is **SQLAlchemy**. **SQLModel**, by the author of FastAPI ([chapter 43](../43-building-a-web-api-with-fastapi/notes.md)), is built on top of it, and Django has its own. They save typing and give you better type hints. But they hide the SQL, and when a page is slow, the problem is almost always the SQL. So learn plain SQL first (you just did), and reach for an ORM when a project grows. [PostgreSQL chapter 42](../../PostgreSQL/42-orms/notes.md) weighs ORMs against plain SQL in TypeScript, and the trade-offs are the same in Python.

## Common mistakes

**1. Forgetting `commit()`**

```python
import sqlite3

con = sqlite3.connect("shop.db")
con.execute("CREATE TABLE IF NOT EXISTS orders (item TEXT NOT NULL)")
con.execute("INSERT INTO orders (item) VALUES (?)", ("latte",))
print(con.execute("SELECT COUNT(*) FROM orders").fetchone()[0])
con.close()
```

Run it three times, and it prints `1` every time. No error, and inside the program the order is even there. But the change was never committed, so closing the connection threw it away, and each run starts from zero again. Add `con.commit()` after your changes, or put them in a `with con:` block.

**2. Building SQL with f-strings**

```python
title = "Call Maya's mum"
con.execute(f"INSERT INTO tasks (title, created) VALUES ('{title}', '2026-10-12')")
```

```
sqlite3.OperationalError: near "s": syntax error
```

That's the friendly version of the problem. The unfriendly version is SQL injection. Always use placeholders: `?` for SQLite, `%s` for psycopg.

**3. `(name)` instead of `(name,)`**

```python
name = "Sandip"
con.execute("INSERT INTO members (name) VALUES (?)", (name))
```

```
sqlite3.ProgrammingError: Incorrect number of bindings supplied. The current statement uses 1, and there are 6 supplied.
```

Six? Brackets on their own don't make a tuple ([chapter 12](../12-tuples-and-sets/notes.md)), so `(name)` is just the string `"Sandip"`, and `sqlite3` treated its six letters as six values. With a number, like `(7)`, you get `sqlite3.ProgrammingError: parameters are of unsupported type` instead. The comma makes the tuple: `(name,)`.

**4. Mixing up `?` and `%s`**

Each library has its own placeholder. `%s` in `sqlite3` gives:

```
sqlite3.OperationalError: near "%": syntax error
```

and `?` in psycopg gives:

```
psycopg.ProgrammingError: the query has 0 placeholders but 1 parameters were passed
```

SQLite: `?`. psycopg: `%s`.

**5. Thinking `with sqlite3.connect(...)` closes the connection**

```python
import sqlite3
from pathlib import Path

with sqlite3.connect("scratch.db") as con:
    con.execute("CREATE TABLE IF NOT EXISTS notes (text TEXT)")
    con.execute("INSERT INTO notes (text) VALUES (?)", ("hello",))

print(con.execute("SELECT COUNT(*) FROM notes").fetchone())  # still open!
Path("scratch.db").unlink()  # try to delete the file
```

```
(1,)
PermissionError: [WinError 32] The process cannot access the file because it is being used by another process: 'scratch.db'
```

The `with` block committed, but the connection stayed open, so the `SELECT` worked and Windows refused to delete a file that's still in use. With `sqlite3`, `with con:` means "one transaction", not "close when done". Call `con.close()` yourself (in a `finally`), or use `contextlib.closing`.

**6. A relative path that makes a new, empty database**

```python
con = sqlite3.connect("tasks.db")
print(con.execute("SELECT COUNT(*) FROM tasks").fetchone())
```

From the right folder, this prints `(3,)`. From the folder above, it crashes:

```
sqlite3.OperationalError: no such table: tasks
```

`"tasks.db"` means "in whatever folder the terminal is in". There was no `tasks.db` there, so `connect()` quietly **created a new, empty one**, with no tables in it. Now you have two database files and a confusing error. Build the path from the code's own folder, like chapter 26 did: `Path(__file__).parent / "tasks.db"`. Then delete the stray empty `tasks.db`.

## Quick recap

- A database keeps data organized and safe: it changes one row at a time, enforces rules, handles many users, and makes groups of changes all or nothing (a transaction).
- `sqlite3` is built in: `con = sqlite3.connect("tasks.db")`, then `con.execute(sql, values)`, `fetchone()`, `fetchall()` or a loop, and `con.close()`. `con.row_factory = sqlite3.Row` lets you read columns by name.
- Always use placeholders (`?` in SQLite, `%s` in psycopg) with the values in a tuple, like `(task_id,)`. Gluing values into the SQL breaks on apostrophes and opens the door to SQL injection.
- Changes need `con.commit()`. `with con:` commits or rolls back as one transaction, but doesn't close the connection. `lastrowid` and `rowcount` tell you what happened.
- SQLite stores dates as ISO text and true/false as `0`/`1`: convert with `.isoformat()`, `date.fromisoformat()` and `bool()`.
- The to-do app moved into SQLite by changing only `storage.py`. Using the database fully means one function per job.
- For PostgreSQL, use `psycopg`: the password from an environment variable, `%s` placeholders, `dict_row`, `RETURNING id`, and a `with` block that commits **and closes**.

---

**Next:** try the [exercises](exercises.md), then move on to [43 Building a Web API with FastAPI](../43-building-a-web-api-with-fastapi/notes.md).
