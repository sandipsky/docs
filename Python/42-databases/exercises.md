# 42 Databases: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.py`, `ex2.py`, and so on), and run it with `python ex1.py` from a terminal opened here. Exercise 5 works on a copy of your `todo-sqlite` app from the notes.
- There's nothing to install: `sqlite3` is built in. To check your hints, use mypy from a virtual environment, as in [chapter 25](../25-type-hints/notes.md): `python -m mypy ex1.py`.
- Some exercises use a `":memory:"` database, so every run starts fresh. The others make a `.db` file. If a run goes wrong and leaves odd data behind, delete the file and run again.
- Every value goes in a placeholder (`?`), never in an f-string. Put type hints on every function.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): The cafe menu

A cafe wants its menu in a database. Write `ex1.py` that:

1. Connects to `cafe.db`, and sets `row_factory` so you can read columns by name.
2. Runs `DROP TABLE IF EXISTS menu` first. (`DROP TABLE` deletes a whole table. It makes every run start from an empty menu, so your output always matches.)
3. Creates a `menu` table with four columns: `id` (the primary key), `name` (text, required, and no two items with the same name), `category` (text, required) and `price_cents` (a whole number, required, and more than 0).
4. Adds these six items with **one** `executemany` call, and commits:

   ```python
   MENU = [
       ("Latte", "drink", 350),
       ("Tea", "drink", 225),
       ("Hot chocolate", "drink", 375),
       ("Croissant", "food", 275),
       ("Banana bread", "food", 320),
       ("Bagel", "food", 290),
   ]
   ```

5. Prints the menu sorted by category, then by price: the category padded to 7 characters, the name to 16, and the price lined up on the right in 6. Write a function `format_price(cents: int) -> str` for the prices.
6. Prints how many drinks there are, and the cheapest food item, each with its own `SELECT`. Let the database do the counting and the finding.
7. Prints how many items each category has, and its cheapest price, with **one** `GROUP BY` query.
8. Tries to add a `Muffin` costing `0`, and a second `Tea` costing `250`, and prints the database's refusal for each.

Expected output:

```
drink  Tea              $2.25
drink  Latte            $3.50
drink  Hot chocolate    $3.75
food   Croissant        $2.75
food   Bagel            $2.90
food   Banana bread     $3.20
3 drinks on the menu
Cheapest food: Croissant ($2.75)
drink: 3 items, from $2.25
food: 3 items, from $2.75
Refused: CHECK constraint failed: price_cents > 0
Refused: UNIQUE constraint failed: menu.name
```

<details>
<summary>Hint 1</summary>

"No two items with the same name" is the `UNIQUE` constraint, and "more than 0" is a `CHECK`. Look at the `tasks` table in the notes for the shape.

</details>

<details>
<summary>Hint 2</summary>

`ORDER BY` can take more than one column: `ORDER BY category, price_cents` sorts by category, and by price within each category. For the cheapest food, add `WHERE category = ?`, sort by price, and keep only the first row with `LIMIT 1`. Then `fetchone()`.

</details>

<details>
<summary>Hint 3</summary>

`GROUP BY category` gives one row per category, and `COUNT(*)` and `MIN(price_cents)` work inside each group ([PostgreSQL chapter 21](../../PostgreSQL/21-grouping/notes.md)). Give those columns names with `AS`, like `COUNT(*) AS items`, so you can read them as `row["items"]`.

</details>

<details>
<summary>Hint 4</summary>

The refusals are `sqlite3.IntegrityError`. Catch it, and print the error object itself after `Refused: `.

</details>

---

## Exercise 2 (Easy): Fix the gym sign-up

Here's a gym's sign-up script. It has **three** bugs. Copy it into `ex2.py`, exactly as it is:

```python
import sqlite3

con = sqlite3.connect("gym.db")
con.execute("""
    CREATE TABLE IF NOT EXISTS members (
        id    INTEGER PRIMARY KEY,
        name  TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE
    )
""")


def sign_up(con: sqlite3.Connection, name: str, email: str) -> None:
    con.execute(f"INSERT INTO members (name, email) VALUES ('{name}', '{email}')")
    print(f"Welcome, {name}!")


def find_member(con: sqlite3.Connection, email: str) -> str | None:
    row = con.execute("SELECT name FROM members WHERE email = ?", (email)).fetchone()
    if row is None:
        return None
    return row[0]


sign_up(con, "Priya Shah", "priya@example.com")
sign_up(con, "Zoe O'Brien", "zoe@example.com")
print(find_member(con, "zoe@example.com"))
print(find_member(con, "tom@example.com"))
count = con.execute("SELECT COUNT(*) FROM members").fetchone()[0]
print(f"{count} members")
con.close()
```

Run it. It welcomes Priya, then crashes with:

```
sqlite3.OperationalError: near "Brien": syntax error
```

Fix that, run it again, and the next bug shows itself:

```
sqlite3.ProgrammingError: Incorrect number of bindings supplied. The current statement uses 1, and there are 15 supplied.
```

Fix that too, and the script seems to work:

```
Welcome, Priya Shah!
Welcome, Zoe O'Brien!
Zoe O'Brien
None
2 members
```

But the third bug is hiding. Run it a **second** time. Both members should already be in the database from the first run, so the second run should print this:

```
priya@example.com is already a member.
zoe@example.com is already a member.
Zoe O'Brien
None
2 members
```

If it welcomes them again instead, nothing was ever saved. Fix the last bug, and make `sign_up` print the "already a member" message instead of crashing when the email is taken. Delete `gym.db`, then run your fixed script twice to check both outputs.

Finally, answer in a comment: why did mypy say `Success` about the buggy version?

<details>
<summary>Hint 1</summary>

Count the letters in `zoe@example.com`. Where does the number 15 come from? Look at "Common mistakes" in the notes.

</details>

<details>
<summary>Hint 2</summary>

The hidden bug is a missing `commit`. A `with con:` block around the `INSERT` commits it, and that's also the right place for a `try`/`except sqlite3.IntegrityError`: the `UNIQUE` rule on `email` is what refuses the second sign-up.

</details>

<details>
<summary>Hint 3</summary>

For the mypy question: mypy checks types, not SQL. To mypy, the SQL is just a string, and `(email)` is a perfectly good `str`.

</details>

---

## Exercise 3 (Medium): Library loans

A small library keeps its books in a table where `borrowed_by` holds the borrower's name, or NULL when the book is on the shelf. Write `ex3.py`, starting with this:

```python
import sqlite3

SCHEMA = """
    CREATE TABLE books (
        id          INTEGER PRIMARY KEY,
        title       TEXT NOT NULL,
        author      TEXT NOT NULL,
        borrowed_by TEXT
    )
"""
```

Then write five functions. Each one changes or reads only what it needs, and the ones that change something commit their change:

```python
def add_book(con: sqlite3.Connection, title: str, author: str) -> int:
def search(con: sqlite3.Connection, word: str) -> list[sqlite3.Row]:
def lend(con: sqlite3.Connection, book_id: int, member: str) -> bool:
def give_back(con: sqlite3.Connection, book_id: int) -> bool:
def on_shelf(con: sqlite3.Connection) -> list[str]:
```

- `add_book` adds a book and returns its new ID.
- `search` returns every book whose title **or** author contains `word`, ignoring capitals, sorted by title.
- `lend` lends a book to a member. It returns `False` if there's no such book, or if it's already out. Use **one** `UPDATE` statement, no `SELECT` first.
- `give_back` marks a book as returned. It returns `False` if there's no such book, or if it wasn't out.
- `on_shelf` returns the titles of the books that aren't borrowed, sorted by title.

Test code:

```python
con = sqlite3.connect(":memory:")
con.row_factory = sqlite3.Row
con.execute(SCHEMA)
for title, author in [
    ("Dune", "Frank Herbert"),
    ("Emma", "Jane Austen"),
    ("Matilda", "Roald Dahl"),
    ("Pride and Prejudice", "Jane Austen"),
    ("The BFG", "Roald Dahl"),
]:
    print(f"Added book {add_book(con, title, author)}: {title}")

for book in search(con, "austen"):
    print(f"Found: {book['title']} by {book['author']}")
print(len(search(con, "dahl")), len(search(con, "and")), len(search(con, "zzz")))

print(lend(con, 2, "Maya"))
print(lend(con, 2, "Leo"))
print(lend(con, 9, "Leo"))
print(lend(con, 5, "Leo"))
print(on_shelf(con))
print(give_back(con, 2))
print(give_back(con, 2))
print(on_shelf(con))
con.close()
```

Expected output:

```
Added book 1: Dune
Added book 2: Emma
Added book 3: Matilda
Added book 4: Pride and Prejudice
Added book 5: The BFG
Found: Emma by Jane Austen
Found: Pride and Prejudice by Jane Austen
2 1 0
True
False
False
True
['Dune', 'Matilda', 'Pride and Prejudice']
True
False
['Dune', 'Emma', 'Matilda', 'Pride and Prejudice']
```

And `python -m mypy ex3.py` says `Success: no issues found in 1 source file`.

<details>
<summary>Hint 1</summary>

SQL's `LIKE` matches patterns: `%` stands for "any text, or none". So `title LIKE '%austen%'` means "the title contains austen". In SQLite, `LIKE` already ignores capitals for English letters. Build the pattern in Python, `f"%{word}%"`, and pass it as a value, once for each `?`.

</details>

<details>
<summary>Hint 2</summary>

For `lend`, put both conditions in the `WHERE`: the right ID, **and** `borrowed_by IS NULL`. If either one isn't true, the `UPDATE` changes nothing, and `rowcount` is `0`. (`= NULL` never matches anything in SQL. Always write `IS NULL`.)

</details>

<details>
<summary>Hint 3</summary>

mypy will complain about returning `cur.lastrowid` from `add_book`, because its type is `int | None`. The notes show how to check it first.

</details>

---

## Exercise 4 (Medium): A bank transfer, all or nothing

Moving money is two changes: take it from one account, add it to the other. If only the first one happens, money vanishes. Write `ex4.py` with an `accounts` table and this function:

```python
def transfer(con: sqlite3.Connection, from_id: int, to_id: int, amount_cents: int) -> None:
```

The rules:

- An amount of zero or less raises `ValueError("the amount must be more than zero")`, before touching the database.
- Both `UPDATE`s happen inside **one** `with con:` block.
- If either account doesn't exist, it raises `ValueError("there's no account with ID 9")` (with the real ID), and **nothing** changes.
- The table has `CHECK (balance_cents >= 0)`, so the database itself refuses an overdraft. Turn that refusal into `ValueError("not enough money")`.

Start the program like this (an in-memory database, so every run starts fresh):

```python
con = sqlite3.connect(":memory:")
con.execute("""
    CREATE TABLE accounts (
        id            INTEGER PRIMARY KEY,
        owner         TEXT    NOT NULL,
        balance_cents INTEGER NOT NULL CHECK (balance_cents >= 0)
    )
""")
con.executemany(
    "INSERT INTO accounts (owner, balance_cents) VALUES (?, ?)",
    [("Sandip", 50000), ("Maya", 12000)],
)
con.commit()
```

Write a `show_balances(con: sqlite3.Connection) -> None` function too, which prints every account's owner and balance on one line, then try these transfers (each one is `(from_id, to_id, amount_cents)`), catching `ValueError` and showing the balances after each one:

```python
attempts = [(1, 2, 12000), (1, 2, 99999), (1, 9, 5000), (7, 1, 5000), (2, 1, 0)]
```

Expected output:

```
Sandip: $500.00, Maya: $120.00
Moved $120.00 from account 1 to account 2
Sandip: $380.00, Maya: $240.00
Error: not enough money
Sandip: $380.00, Maya: $240.00
Error: there's no account with ID 9
Sandip: $380.00, Maya: $240.00
Error: there's no account with ID 7
Sandip: $380.00, Maya: $240.00
Error: the amount must be more than zero
Sandip: $380.00, Maya: $240.00
```

Look closely at the third attempt. Sandip's `UPDATE` ran first and worked; only then did account 9 turn out not to exist. Answer in a comment: what would Sandip's balance be after that attempt if the two `UPDATE`s were **not** inside the `with con:` block, and the program committed later?

**Extra (optional):** if you have PostgreSQL from the [PostgreSQL course](../../PostgreSQL/README.md), write `ex4_pg.py` doing the same thing with psycopg. The output should be identical.

<details>
<summary>Hint 1</summary>

To take money out: `UPDATE accounts SET balance_cents = balance_cents - ? WHERE id = ?`. The database does the subtraction, so you never need to read the balance first. After each `UPDATE`, `rowcount` tells you whether that account exists.

</details>

<details>
<summary>Hint 2</summary>

Raising an exception **inside** the `with con:` block is what rolls back the first `UPDATE`. So raise the "no account" `ValueError` in there, right after checking `rowcount`. For the overdraft, wrap the whole `with con:` block in a `try`, catch `sqlite3.IntegrityError`, and raise your `ValueError` from the `except`.

</details>

<details>
<summary>Hint 3</summary>

For the PostgreSQL extra: create the table with `integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY`, use `%s` placeholders, `with conn.transaction():` in place of `with con:`, and catch `psycopg.errors.CheckViolation`. To add the two accounts, open a cursor with `with conn.cursor() as cur:` and use `cur.executemany(...)`, then `conn.commit()`. Start with `DROP TABLE IF EXISTS accounts` so each run starts fresh.

</details>

---

## Exercise 5 (Challenge): The to-do app, done properly

In the notes, the to-do app moved into SQLite by changing only `storage.py`. But it still loads and saves every task, every time. Now make it use the database properly: each command changes only the rows it needs.

Make a copy of your `todo-sqlite` folder called `todo-sqlite-v2`, and work there. Delete the `tasks.db` in the copy, so you start with an empty list.

**In `storage.py`**, keep `Task`, `TASKS_FILE`, `SCHEMA` and `connect`, but replace `load_tasks` and `save_tasks` with these six functions. Each one takes the open connection:

```python
def all_tasks(con: sqlite3.Connection) -> list[Task]:
def get_task(con: sqlite3.Connection, task_id: int) -> Task | None:
def add_task(con: sqlite3.Connection, title: str, due: str | None, today: date) -> Task:
def mark_done(con: sqlite3.Connection, task_id: int) -> Task:
def remove_task(con: sqlite3.Connection, task_id: int) -> Task:
def clear_done(con: sqlite3.Connection) -> int:
```

- `mark_done` and `remove_task` raise the same `ValueError` messages as chapter 26 (`there's no task with ID 7`, `task 1 is already done`).
- `clear_done` deletes every done task with **one** statement, and returns how many it deleted.
- Every change is committed.

**In `todo.py`**, delete `next_id`, `find_task`, and the old `add_task`, `mark_done`, `remove_task` and `clear_done`: the database does those jobs now. Keep `build_parser`, `is_overdue`, `format_task`, `print_tasks` and `parse_due`, and keep checking the title and the due date in `todo.py` before you call `storage.add_task`. Then rewrite `main()` so it opens **one** connection, uses it for the command, and always closes it.

Then run this session (made on 12 October 2026):

```
python todo.py list
Nothing to do!

python todo.py add "Buy milk" --due 2026-10-08
Added task 1: Buy milk (due 2026-10-08)

python todo.py add "Call grandma"
Added task 2: Call grandma

python todo.py add "Renew passport" --due 2029-03-01
Added task 3: Renew passport (due 2029-03-01)

python todo.py add "Water the plants"
Added task 4: Water the plants

python todo.py done 4
Marked task 4 as done: Water the plants

python todo.py list --all
 ID  Done  Due         Task
  1  [ ]   2026-10-08  Buy milk  (OVERDUE)
  2  [ ]   -           Call grandma
  3  [ ]   2029-03-01  Renew passport
  4  [x]   -           Water the plants
3 to do, 1 overdue, 1 done

python todo.py done 1
Marked task 1 as done: Buy milk

python todo.py done 1
Error: task 1 is already done

python todo.py remove 9
Error: there's no task with ID 9

python todo.py add "Pick up parcel" --due 2026-02-30
Error: the due date must look like 2026-10-15, not '2026-02-30'

python todo.py clear-done
Cleared 2 done tasks.

python todo.py add "Pay rent" --due 2026-11-01
Added task 4: Pay rent (due 2026-11-01)

python todo.py list
 ID  Done  Due         Task
  2  [ ]   -           Call grandma
  3  [ ]   2029-03-01  Renew passport
  4  [ ]   2026-11-01  Pay rent
3 to do, 0 overdue, 0 done
```

And `python -m mypy todo.py storage.py` says `Success: no issues found in 2 source files`.

Last question: "Pay rent" got ID **4**, the ID of a task that was deleted. Why? (Chapter 26's `next_id` would have done exactly the same.) Is that a problem, and how would you stop it?

<details>
<summary>Hint 1</summary>

Many functions need to turn a row into a task. Write a small helper first, like `row_to_task(row: sqlite3.Row) -> Task`, which makes a dictionary from the row and turns `done` into `True` or `False`. Then `get_task` is one `SELECT ... WHERE id = ?` plus `fetchone()`.

</details>

<details>
<summary>Hint 2</summary>

`mark_done` and `remove_task` need the task's title for their message, so call `get_task` first: if it's `None`, raise; otherwise run the `UPDATE` or `DELETE`. `add_task` can use `cur.lastrowid` and then `get_task` to return the complete new task.

</details>

<details>
<summary>Hint 3</summary>

In `main()`, open the connection inside the existing `try` (so a broken `tasks.db` still gives the friendly error), then put the command code in an inner `try` with `con.close()` in its `finally`.

</details>

<details>
<summary>Hint 4</summary>

For the last question: SQLite gives a new row one more than the biggest ID in the table, and after task 4 was cleared, the biggest was 3. Search the SQLite documentation for `AUTOINCREMENT` to see how to make it never reuse an ID.

</details>

---

## Before you move on

You can now keep data safely in a database, read it back, and change it one row at a time, with placeholders keeping every value in its place. A database on its own is only half of a real app, though. A [React](../../React/README.md) app in the browser can't open your `tasks.db`: something on a server has to take its requests, talk to the database, and send back JSON.

That something is a web API, and in [chapter 43](../43-building-a-web-api-with-fastapi/notes.md) you'll build one with FastAPI.
