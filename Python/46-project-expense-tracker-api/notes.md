# 46 Project: Expense Tracker API

This is the last project of Level 4, and the biggest one yet. In [chapter 43](../43-building-a-web-api-with-fastapi/notes.md), you built a books API, but it forgot every book the moment the server restarted. In [chapter 42](../42-databases/notes.md), you kept data safe in an SQLite database. Now you'll put the two together and build a real **backend**: an API that keeps track of what you spend, remembers it for good, checks every value that comes in, and is ready for a React app to talk to.

You'll use a lot of Levels 3 and 4 along the way: Pydantic models with inheritance, a `StrEnum`, SQL with `?` placeholders, a generator that cleans up after itself, a regular expression, pytest fixtures, a package, and type hints checked by mypy. And you'll meet one new FastAPI idea, **dependencies**, which is how real FastAPI apps hand every request its own database connection.

Build it one milestone at a time, and try your API after every small change.

## What you'll build

An API for tracking your own spending. When it's finished, any program that speaks HTTP (your browser, the `/docs` page, a Python script, a React app) can use these endpoints:

| Method and path | What it does | Success code |
|---|---|---|
| `GET /health` | Says the API is up | 200 |
| `GET /categories` | Lists the six categories an expense can have | 200 |
| `POST /expenses` | Adds an expense | 201 |
| `GET /expenses` | Lists expenses, oldest first, with optional `?category=` and `?month=` filters | 200 |
| `GET /expenses/{expense_id}` | Shows one expense (404 if it isn't there) | 200 |
| `PUT /expenses/{expense_id}` | Replaces an expense's details | 200 |
| `DELETE /expenses/{expense_id}` | Deletes an expense | 204 |
| `GET /summary` | Adds up the spending per category, for one `?month=` or for all time | 200 |

Every expense is saved in a database file called `expenses.db`, so nothing is lost when the server stops. Bad data, like a negative amount or a date that doesn't exist, is refused with a clear error before it gets anywhere near the database.

Here's the finished API answering `http://127.0.0.1:8000/summary?month=2026-10` in a browser, with eight sample expenses saved:

```
{"month":"2026-10","total_cents":22454,"count":7,"by_category":[{"category":"bills","total_cents":9230,"count":2},{"category":"transport","total_cents":5500,"count":1},{"category":"food","total_cents":2725,"count":2},{"category":"shopping","total_cents":2599,"count":1},{"category":"fun","total_cents":2400,"count":1}]}
```

In the last milestone, a small React app on `http://localhost:5173` shows the same month's expenses, fetched from your API.

## Before you start

### Setup

1. Make a copy of this chapter's `starter` folder, in this chapter's folder, and call it `my-expense-api`. Work in the copy, so the starter stays clean (right-click `starter`, **Copy**, then **Paste** into the chapter folder, and rename it, like in [chapter 26](../26-project-todo-app/notes.md)).
2. Right-click `my-expense-api` and choose **Open in Integrated Terminal**. Every command in this chapter runs from there, in the project folder. Never from inside `app`.
3. Make a virtual environment and install everything the project needs. The list is in `requirements.txt` ([chapter 23](../23-pip-and-virtual-environments/notes.md)):

   ```
   python -m venv .venv
   .venv\Scripts\Activate.ps1
   python -m pip install -r requirements.txt
   ```

   (In Command Prompt, activate with `.venv\Scripts\activate.bat`. On a Mac or Linux, use `source .venv/bin/activate`.) That installs FastAPI with its extras, `httpx2` for the tests, pytest and mypy. If pip stops with an `OSError` about a missing file and a long path, your folder's path is too long for Windows: see the Watch out in [chapter 43](../43-building-a-web-api-with-fastapi/notes.md), and move the project to a short folder like `C:\code\my-expense-api`.

4. Pick the `.venv` interpreter in VS Code, and keep Pylance's Type Checking Mode on `basic` ([chapter 25](../25-type-hints/notes.md)).

Here's what's in the folder:

| File | What's in it |
|---|---|
| `requirements.txt` | The packages to install (you just did). |
| `app/__init__.py` | Empty. It makes `app` a package ([chapter 19](../19-modules-and-standard-library/notes.md)). |
| `app/models.py` | Stubs for the Pydantic models. |
| `app/database.py` | Stubs for everything that talks to SQLite. |
| `app/main.py` | Stubs for the endpoints. |
| `tests/test_expenses.py` | A pytest fixture and four tests, ready to use. You'll add more in milestone 8. |
| `seed.py` | A finished helper that adds eight sample expenses through your API, so you have something to list and add up. |

The stubs have no type hints and no `@app` decorators yet. Each milestone shows you the exact lines to write. This chapter was written with FastAPI 0.143, Pydantic 2.14, pytest 9.1 and mypy 2.4.

### The rules

- Use what you learned in chapters 01 to 45. The few new things (dependencies, `Annotated`, `Query`) are explained when they come up.
- Put type hints on every function. At the end, mypy must say `Success`.
- **Money is whole cents, always an `int`.** The API stores `1450`, never `14.50`. Remember from [chapter 05](../05-numbers-and-math/notes.md) that floats can't hold most decimal amounts exactly (`0.1 + 0.2` is `0.30000000000000004`). Turning `1450` into `$14.50` is the front end's job.
- Each milestone has hints. Try first, and open a hint only when you're stuck.
- Your code doesn't have to look like anyone else's. If your API gives the same answers, it works. When you're done, ask Claude to review it.

### How the app is organized

**A package with three modules.** Each module has one job, like `storage.py` and `todo.py` in chapter 26:

| Module | Its job | Imports from |
|---|---|---|
| `app/models.py` | The shapes of the data, and the rules each value must follow | Pydantic only |
| `app/database.py` | Every line of SQL, and the `expenses.db` file | `models` |
| `app/main.py` | The endpoints: paths, status codes and errors | `models` and `database` |

`main.py` never writes SQL, and `database.py` never mentions HTTP. If you moved to PostgreSQL one day ([chapter 42](../42-databases/notes.md)), only `database.py` would change. The modules import each other with the package name, like `from app.models import Expense` ([chapter 39](../39-project-structure-and-packaging/notes.md)). That only works when Python starts in the project folder, which is why every command runs from `my-expense-api`.

**One expense** looks like this in JSON:

```
{
  "description": "Lunch with Maya",
  "amount_cents": 1450,
  "category": "food",
  "spent_on": "2026-10-03",
  "id": 3
}
```

| Field | Python type | Rules | In the database |
|---|---|---|---|
| `id` | `int` | Chosen by the database, never by the client | `INTEGER PRIMARY KEY` |
| `description` | `str` | 1 to 100 characters, spaces at the ends trimmed | `TEXT` |
| `amount_cents` | `int` | More than 0 | `INTEGER` |
| `category` | `Category` | One of six fixed choices | `TEXT` |
| `spent_on` | `date` | A real date | `TEXT`, like `"2026-10-03"` |

The field is called `spent_on`, not `date`, so it never gets mixed up with the `date` type. Outside Python, dates always travel as ISO text: JSON has no date type ([chapter 21](../21-json-and-csv/notes.md)), and neither does SQLite ([chapter 42](../42-databases/notes.md)). Pydantic turns `"2026-10-03"` into a real `date` on the way in, and back into text on the way out.

### Trying your API

You'll use the three ways from chapter 43:

- **The browser**, for `GET` requests. Type an address like `http://127.0.0.1:8000/expenses?category=food`, and the JSON appears on one line.
- **`/docs`**, for everything. Open an endpoint, click **Try it out**, fill in the values or the JSON body, and click **Execute**. You'll see the status code and the response body, spread over several lines.
- **Tests**, from milestone 8, which do it all automatically.

In this chapter, a request and its response are shown like this:

```
POST /expenses
{"description": "Lunch with Maya", "amount_cents": 1450, "category": "food", "spent_on": "2026-10-03"}

201 Created
{
  "description": "Lunch with Maya",
  ...
}
```

First comes what you send: the method, the path, and the JSON body if there is one. After the blank line comes the answer: the status code, then the JSON, the way `/docs` shows it.

The server keeps one terminal busy, so you'll need a **second terminal** for other commands: click the **+** in VS Code's terminal panel, and activate `.venv` there too.

## Milestone 1: A running server

**Goal:** `fastapi dev app/main.py` starts your API, and `GET /health` answers.

1. At the top of `app/main.py`, under the comment, import `FastAPI` and create the app, with a title for the `/docs` page:

   ```python
   app = FastAPI(title="Expense Tracker API")
   ```

2. Write the health check. It always returns `{"status": "ok"}`:

   ```python
   @app.get("/health")
   def health() -> dict[str, str]:
   ```

   A **health check** is a tiny endpoint that answers "yes, I'm alive". It looks pointless now, but hosting services call it regularly, and restart your app if it stops answering ([chapter 53](../53-deploying/notes.md)).

Start the server from the project folder, with the path to `main.py`:

```
fastapi dev app/main.py
```

You'll see something like this (it's colourful in a real terminal):

```
 ⚡️ Starting FastAPI in development mode

 🐍 Using import string: app.main:app

 🌐 Server started at http://127.0.0.1:8000
    Documentation at http://127.0.0.1:8000/docs
...
INFO:     Application startup complete.
```

Look at `Using import string: app.main:app`. The `fastapi` command noticed that `main.py` sits inside a package, so it imported it as `app.main` (the module) and found `app` (the variable) inside. That's why the imports between your modules will work.

Open <http://127.0.0.1:8000/health>:

```
{"status":"ok"}
```

Then open <http://127.0.0.1:8000/docs>. The heading says **Expense Tracker API**, with one endpoint so far.

<details>
<summary>Hint 1</summary>

This is the "Your first API" example from [chapter 43](../43-building-a-web-api-with-fastapi/notes.md), with a different path. `title=` goes inside the brackets of `FastAPI(...)`.

</details>

<details>
<summary>Hint 2</summary>

If the terminal says `fastapi` isn't recognized, the virtual environment isn't active in that terminal. Look for `(.venv)` at the start of the prompt.

</details>

## Milestone 2: Models and validation

**Goal:** `models.py` describes an expense, and refuses bad data.

1. Make `Category` a `StrEnum` ([chapter 30](../30-dataclasses-and-enums/notes.md)) with six members, in this order: `FOOD`, `TRANSPORT`, `BILLS`, `SHOPPING`, `FUN` and `OTHER`. Each one's value is its name in lowercase, like `FOOD = "food"`:

   ```python
   class Category(StrEnum):
   ```

   A `StrEnum` member *is* a string, so it goes into JSON and into the database as plain text, with no `.value` needed.

2. Write `ExpenseIn`, the shape of what a client sends. It starts like this:

   ```python
   class ExpenseIn(BaseModel):
       model_config = ConfigDict(str_strip_whitespace=True)
   ```

   Then add the four fields `description`, `amount_cents`, `category` and `spent_on`, with the types and rules from the table in "How the app is organized". Use `Field(...)` for the rules, like `BookIn` in chapter 43.

   The `model_config` line is new. It's a setting for the whole model: "strip the spaces off both ends of every string before checking it". So `"  Lunch with Maya "` is saved as `"Lunch with Maya"`, and a description of only spaces becomes `""`, which then fails `min_length=1`. One line, and nobody can add an expense called `"   "`.

3. Write `Expense`, which is everything in `ExpenseIn` plus an `id`. It's the same pattern as `Book(BookIn)` in chapter 43, using inheritance ([chapter 28](../28-inheritance/notes.md)):

   ```python
   class Expense(ExpenseIn):
   ```

   Why two models? The client never chooses the ID (two people might both pick 5). So the ID is only in what goes **out** (`Expense`), never in what comes **in** (`ExpenseIn`).

4. At the bottom of `models.py`, add this test code:

   ```python
   if __name__ == "__main__":
       # A dictionary like the JSON a client sends. Notice it's all text.
       lunch = ExpenseIn.model_validate(
           {"description": "  Lunch with Maya ", "amount_cents": 1450,
            "category": "food", "spent_on": "2026-10-03"}
       )
       print(lunch)
       print(repr(lunch.category))
       print(repr(lunch.spent_on))

       try:
           ExpenseIn.model_validate(
               {"description": "   ", "amount_cents": 0,
                "category": "pizza", "spent_on": "2026-02-30"}
           )
       except ValidationError as e:
           print(e)
   ```

   `model_validate` takes a dictionary and checks it, which is exactly what FastAPI does with every JSON body. (You could write `ExpenseIn(category="food", ...)` instead, and it would run. But mypy would complain that `"food"` isn't a `Category` and `"2026-10-03"` isn't a `date`.)

Run `python app/models.py`:

```
description='Lunch with Maya' amount_cents=1450 category=<Category.FOOD: 'food'> spent_on=datetime.date(2026, 10, 3)
<Category.FOOD: 'food'>
datetime.date(2026, 10, 3)
4 validation errors for ExpenseIn
description
  String should have at least 1 character [type=string_too_short, input_value='   ', input_type=str]
    For further information visit https://errors.pydantic.dev/2.14/v/string_too_short
amount_cents
  Input should be greater than 0 [type=greater_than, input_value=0, input_type=int]
    For further information visit https://errors.pydantic.dev/2.14/v/greater_than
category
  Input should be 'food', 'transport', 'bills', 'shopping', 'fun' or 'other' [type=enum, input_value='pizza', input_type=str]
    For further information visit https://errors.pydantic.dev/2.14/v/enum
spent_on
  Input should be a valid date or datetime, day value is outside expected range [type=date_from_datetime_parsing, input_value='2026-02-30', input_type=str]
    For further information visit https://errors.pydantic.dev/2.14/v/date_from_datetime_parsing
```

The spaces around the description are gone, `"food"` became a real `Category`, and the text date became a real `date`. The second dictionary breaks all four rules, and Pydantic reports all four at once. (There's no 30 February.)

5. Back in `main.py`, add the categories endpoint. It returns every member of `Category`:

   ```python
   @app.get("/categories")
   def list_categories() -> list[Category]:
   ```

Open <http://127.0.0.1:8000/categories>:

```
["food","transport","bills","shopping","fun","other"]
```

A React form can build its drop-down list from this, so the six categories are written down in one place only: your `Category` class.

<details>
<summary>Hint 1</summary>

The imports for `models.py` are `date` from `datetime`, `StrEnum` from `enum`, and `BaseModel`, `ConfigDict`, `Field` and `ValidationError` from `pydantic`. In `main.py`, import `Category` with `from app.models import Category`.

</details>

<details>
<summary>Hint 2</summary>

A field with a rule looks like `amount_cents: int = Field(gt=0)`. A field with no rule is just the name and the hint: `spent_on: date`. One `Field` can hold two rules: `Field(min_length=1, max_length=100)`.

</details>

<details>
<summary>Hint 3</summary>

Looping over an enum gives its members ([chapter 30](../30-dataclasses-and-enums/notes.md)), so `list(Category)` is a list of all six.

</details>

## Milestone 3: The database layer

**Goal:** `database.py` can create the table, save an expense and read it back. There's no web server in this milestone: you'll test the database code on its own.

1. Import `sqlite3`, `Iterator` from `collections.abc`, `date` from `datetime`, `Path` from `pathlib`, and `Category`, `Expense` and `ExpenseIn` from `app.models`. Then the file's location:

   ```python
   # The database file sits in the project folder, next to the app folder.
   DB_PATH = Path(__file__).parent.parent / "expenses.db"
   ```

   `Path(__file__).parent` is the `app` folder, like in chapter 26. One more `.parent` is the project folder. So the data lives outside the code, and it's always the same file, whichever folder you start the server from.

2. Add the table. Copy this exactly, because later milestones and the tests rely on these names:

   ```python
   SCHEMA = """
       CREATE TABLE IF NOT EXISTS expenses (
           id           INTEGER PRIMARY KEY AUTOINCREMENT,
           description  TEXT    NOT NULL,
           amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
           category     TEXT    NOT NULL,
           spent_on     TEXT    NOT NULL
       )
   """
   ```

   Two things are new compared with chapter 42. `AUTOINCREMENT` means an ID is **never reused**. With a plain `INTEGER PRIMARY KEY`, delete the newest expense (say number 8), and the next one added gets number 8 again. A React app that still remembers "expense 8" would then show the wrong one. With `AUTOINCREMENT`, the next one is 9. And the `CHECK` is a second safety net: Pydantic already refuses amounts of 0 or less, but if a bug ever slipped past it, the database would refuse too.

3. Write `connect`. It works like `connect` in chapter 42's `storage.py`: open the database, set `row_factory` to `sqlite3.Row`, run `SCHEMA`, and return the connection:

   ```python
   def connect(path: Path | str) -> sqlite3.Connection:
   ```

   Two small differences. The hint says `Path | str`, so that the test below can pass the text `":memory:"`. And open the file with `sqlite3.connect(path, check_same_thread=False)`. That setting is explained in milestone 4.

4. Write `row_to_expense`, which turns one row from the table back into an `Expense`. The row has the category and the date as text, so turn them back into a `Category` and a `date`:

   ```python
   def row_to_expense(row: sqlite3.Row) -> Expense:
   ```

5. Write `add_expense`. It inserts the expense with `?` placeholders, commits, and returns an `Expense` with the new ID:

   ```python
   def add_expense(con: sqlite3.Connection, expense: ExpenseIn) -> Expense:
   ```

6. Write `get_expense`, which returns the expense with that ID, or `None`:

   ```python
   def get_expense(con: sqlite3.Connection, expense_id: int) -> Expense | None:
   ```

7. At the bottom of `database.py`, add this test code:

   ```python
   if __name__ == "__main__":
       # A quick test with a database that only lives in memory.
       con = connect(":memory:")
       lunch = ExpenseIn.model_validate(
           {"description": "Lunch with Maya", "amount_cents": 1450,
            "category": "food", "spent_on": "2026-10-03"}
       )
       saved = add_expense(con, lunch)
       print(saved)
       print(get_expense(con, saved.id))
       print(get_expense(con, 99))
       print(dict(con.execute("SELECT * FROM expenses").fetchone()))
       con.close()
   ```

   `":memory:"` makes a throwaway database that vanishes when the connection closes, so this test never touches `expenses.db`.

This time, run it as a module, with `-m` and dots instead of slashes ([chapter 39](../39-project-structure-and-packaging/notes.md)):

```
python -m app.database
```

```
description='Lunch with Maya' amount_cents=1450 category=<Category.FOOD: 'food'> spent_on=datetime.date(2026, 10, 3) id=1
description='Lunch with Maya' amount_cents=1450 category=<Category.FOOD: 'food'> spent_on=datetime.date(2026, 10, 3) id=1
None
{'id': 1, 'description': 'Lunch with Maya', 'amount_cents': 1450, 'category': 'food', 'spent_on': '2026-10-03'}
```

The last line shows what's really in the table: the category and the date are plain text. `row_to_expense` turns them back into real Python types, which is why the second line matches the first.

Why `-m`? `python app/database.py` makes Python start inside the `app` folder, where there's no package called `app`, so the very first `from app.models import ...` line fails with `ModuleNotFoundError: No module named 'app'`. `python -m app.database` starts in the project folder and runs `database.py` as part of the package. (`models.py` worked without `-m` in milestone 2 only because it doesn't import anything from `app`.)

<details>
<summary>Hint 1</summary>

In `add_expense`, the values go in a tuple after the SQL: `(expense.description, expense.amount_cents, expense.category, expense.spent_on.isoformat())`. The category can go in as it is, because a `StrEnum` member is a string. The date needs `.isoformat()` to become text ([chapter 42](../42-databases/notes.md) shows why).

</details>

<details>
<summary>Hint 2</summary>

To build the `Expense` to return, chapter 43's trick works here: `Expense(id=new_id, **expense.model_dump())`. Get the new ID from `cur.lastrowid`, with the same `if cur.lastrowid is None: raise RuntimeError(...)` check as chapter 42's `add_task`, so mypy knows it's an `int`.

</details>

<details>
<summary>Hint 3</summary>

In `get_expense`, `fetchone()` gives `None` when no row matched. Check for that first. And a tuple with one item needs a comma: `(expense_id,)`.

</details>

## Milestone 4: Create and read, with a dependency

**Goal:** `POST /expenses` saves an expense in `expenses.db`, and `GET /expenses/{expense_id}` reads it back, even after the server restarts.

Every request needs its own database connection: open it, use it, and close it, even if something goes wrong halfway. You could write that out in every endpoint:

```python
con = database.connect(database.DB_PATH)
try:
    ...  # the real work
finally:
    con.close()
```

That's four extra lines in each of eight endpoints. It's easy to forget once, and worse, your tests could never swap in a different database. FastAPI has a better way: **dependencies**. A dependency is a function that FastAPI calls *for* your endpoint, to get something the endpoint needs. The endpoint only says what it needs, in its parameters, and FastAPI delivers it.

Think of a busy restaurant kitchen. The chef doesn't walk to the storeroom for every order. For each order, a kitchen helper brings a fresh tray of ingredients to the chef's station, and takes the tray away to be washed once the dish has gone out. All the chef ever says is "I need a tray".

| The kitchen | Your API |
|---|---|
| The chef cooking one dish | Your endpoint function |
| "I need a tray" | A parameter like `con: Db` |
| The kitchen helper | FastAPI |
| Bringing a fresh tray, then washing it after the dish has gone | `get_db` opening a connection, then closing it after the response |

1. In `database.py`, write `get_db`. It's a generator ([chapter 31](../31-iterators-and-generators/notes.md)), shaped just like a `@contextmanager` function from [chapter 33](../33-context-managers/notes.md): connect to `DB_PATH`, then `yield` the connection inside a `try`, and close it in the `finally`:

   ```python
   def get_db() -> Iterator[sqlite3.Connection]:
   ```

   FastAPI runs `get_db` up to the `yield`, hands the connection to your endpoint, and runs the `finally` after the response has been sent, even if the endpoint raised an error.

2. In `main.py`, add the imports you need (`sqlite3`, `Annotated` from `typing`, `Depends` and `HTTPException` from `fastapi`, `from app import database`, and `Expense` and `ExpenseIn` from `app.models`), and this type alias below `app = FastAPI(...)`:

   ```python
   # "A sqlite3 connection, which FastAPI gets by calling database.get_db"
   Db = Annotated[sqlite3.Connection, Depends(database.get_db)]
   ```

   `Annotated[type, note]` is a type with a note attached. The type, `sqlite3.Connection`, is for you, Pylance and mypy. The note, `Depends(database.get_db)`, is for FastAPI: "to fill in this parameter, call `database.get_db`". Giving the whole thing a name with a type alias ([chapter 25](../25-type-hints/notes.md)) means each endpoint only has to write `con: Db`.

   Notice there are no brackets after `get_db`. You're handing FastAPI the function itself, for it to call once per request. (See Common mistakes for what `get_db()` does.)

   > **Tip:** In older code and many tutorials, you'll see `con: sqlite3.Connection = Depends(get_db)` instead. It does the same job. FastAPI's own documentation now recommends the `Annotated` way.

3. Write the endpoint that adds an expense. It's one line long, because `database.add_expense` does the work:

   ```python
   @app.post("/expenses", status_code=201)
   def create_expense(expense: ExpenseIn, con: Db) -> Expense:
   ```

4. Write the endpoint that shows one expense. When there's no such expense, raise an `HTTPException` with status code 404 and the detail `Expense 99 not found` (with the real ID):

   ```python
   @app.get("/expenses/{expense_id}")
   def read_expense(expense_id: int, con: Db) -> Expense:
   ```

   FastAPI works out where each parameter comes from. `expense_id` is in the path, so it's a path parameter. `expense: ExpenseIn` is a Pydantic model, so it's the JSON body. And `con: Db` has a `Depends` note, so FastAPI calls `get_db` for it. The caller never sees `con` at all: open `/docs`, and it isn't listed.

> **Watch out:** Remember from chapter 43 that FastAPI runs each plain `def` endpoint in a helper called a **thread**? It can run `get_db` in one thread and your endpoint in another. Out of the box, sqlite3 refuses to let a connection be used by a different thread from the one that opened it, because two threads using one connection *at the same moment* can go badly wrong. Here, that never happens: each request has its own connection, used by one piece of code at a time. `check_same_thread=False` (from milestone 3) tells sqlite3 "I know, it's fine". Without it, the API seems to work while you click around, and then fails when many requests arrive together (see Common mistakes). Threads get a whole chapter later: [chapter 48](../48-threads-processes-and-the-gil/notes.md).

Now try it in `/docs`. Open `POST /expenses`, click **Try it out**, replace the example body with this one, and click **Execute**:

```
POST /expenses
{"description": "Lunch with Maya", "amount_cents": 1450, "category": "food", "spent_on": "2026-10-03"}

201 Created
{
  "description": "Lunch with Maya",
  "amount_cents": 1450,
  "category": "food",
  "spent_on": "2026-10-03",
  "id": 1
}
```

The `id` comes last because `Expense` adds it after `ExpenseIn`'s fields. JSON doesn't care about the order. Now ask for it back, in the browser: <http://127.0.0.1:8000/expenses/1> gives the same JSON with `200 OK`, and a missing one gives a 404:

```
GET /expenses/99

404 Not Found
{
  "detail": "Expense 99 not found"
}
```

`GET /expenses/abc` gives a 422 with `"Input should be a valid integer, unable to parse string as an integer"`, like the books in chapter 43.

Then try some bad data. Send the lunch again with `"amount_cents": 0`, and you get this (shown on one line here, to save space):

```
422 Unprocessable Content
{"detail":[{"type":"greater_than","loc":["body","amount_cents"],"msg":"Input should be greater than 0","input":0,"ctx":{"gt":0}}]}
```

And a few more. Each one gets a 422, and nothing is saved:

| Change to the body | The `msg` in the answer |
|---|---|
| `"amount_cents": 14.5` | `Input should be a valid integer, got a number with a fractional part` |
| `"description": "   "` | `String should have at least 1 character` |
| `"category": "Food"` | `Input should be 'food', 'transport', 'bills', 'shopping', 'fun' or 'other'` |
| Leave out `category` and `spent_on` | `Field required`, once for each |

The `14.5` row is the "money is cents" rule at work: the API refuses a fractional amount instead of quietly rounding it. And `"Food"` with a capital F is refused, because a category must match exactly.

Now the big moment. Stop the server with `Ctrl+C`, start it again with `fastapi dev app/main.py`, and open <http://127.0.0.1:8000/expenses/1>. Lunch is still there. That's the difference from chapter 43: your data lives in `expenses.db`, which you can now see in the project folder.

**Add the sample data.** In your second terminal (with `.venv` active), delete `expenses.db` for a fresh start, then run the seed script while the server keeps running:

```
Remove-Item expenses.db
python seed.py
```

(In Command Prompt it's `del expenses.db`, and on a Mac or Linux `rm expenses.db`. You can also delete it in VS Code's Explorer.) You'll see:

```
Added expense 1: Bus pass for October ($55.00)
Added expense 2: Electricity bill ($62.30)
Added expense 3: Lunch with Maya ($14.50)
Added expense 4: Cinema tickets with Leo ($24.00)
Added expense 5: Coffee beans ($12.75)
Added expense 6: Phone bill ($30.00)
Added expense 7: Birthday present for Zoe ($25.99)
Added expense 8: Groceries at Fresh Mart ($45.20)
```

Deleting the file while the server runs is fine: every request opens its own connection, so nothing holds the file open between requests, and the next request creates a new, empty database. `seed.py` is a small API client, like the ones in [chapter 40](../40-working-with-apis/notes.md): it sends each expense with `POST /expenses`, exactly like `/docs` did. Have a look inside it. If it says `Error: can't reach the API at http://127.0.0.1:8000. Is it running?`, start the server in the first terminal.

<details>
<summary>Hint 1</summary>

`get_db` is five lines: `con = connect(DB_PATH)`, then `try:` with `yield con` inside, then `finally:` with `con.close()` inside.

</details>

<details>
<summary>Hint 2</summary>

In `read_expense`, call `database.get_expense(con, expense_id)`, and check the result for `None` before returning it, like `find_book` in chapter 43. mypy will remind you if you forget: the endpoint promises an `Expense`, and `get_expense` might give `None`.

</details>

<details>
<summary>Hint 3</summary>

If the server won't start, and the terminal ends with `TypeError: <generator object get_db at 0x...> is not a callable object`, look for brackets after `get_db` inside `Depends(...)`.

</details>

## Milestone 5: Listing, with filters

**Goal:** `GET /expenses` lists the expenses, oldest first, and `?category=` and `?month=` narrow the list down.

1. In `database.py`, write `list_expenses`:

   ```python
   def list_expenses(
       con: sqlite3.Connection, category: Category | None, month: str | None
   ) -> list[Expense]:
   ```

   The SQL depends on which filters were given, so build it from pieces. Start with two empty lists, one for the conditions and one for their values:

   ```python
   conditions: list[str] = []
   params: list[str] = []
   if category is not None:
       conditions.append("category = ?")
       params.append(category)
   ```

   Do the same for `month`. A month like `"2026-10"` matches every date that starts with `2026-10-`, and SQL's `LIKE` does exactly that: `spent_on LIKE ?` with the value `"2026-10-%"`. (`%` means "anything here", like in [PostgreSQL chapter 08](../../PostgreSQL/08-filtering-rows/notes.md).) Then put the SQL together: `SELECT * FROM expenses`, plus `WHERE` and the conditions joined with `AND` if there are any, plus `ORDER BY spent_on, id`.

   Is building SQL from pieces safe? Yes, as long as you follow one rule: **only text you wrote yourself goes into the SQL string**, like `"category = ?"`. Every value from the outside goes into `params`, through a `?` placeholder ([chapter 42](../42-databases/notes.md)).

   And why does `ORDER BY spent_on` put the dates in the right order, when they're text? Because ISO dates start with the year, then the month, then the day, so sorting them as text gives date order (you might remember this from chapter 26's sorting exercise). `id` breaks ties between expenses on the same day.

2. In `main.py`, describe what a month must look like, with a regular expression ([chapter 35](../35-regular-expressions/notes.md)), and make another `Annotated` alias:

   ```python
   # "Text like 2026-10, or None": a year, a dash, and a month from 01 to 12
   MONTH_PATTERN = r"^\d{4}-(0[1-9]|1[0-2])$"
   Month = Annotated[str | None, Query(pattern=MONTH_PATTERN)]
   ```

   This time the note is `Query(...)`, which adds rules to a query parameter, the way `Field(...)` adds them to a model field. `pattern=` means "must match this regular expression", so `?month=October` is refused with a 422 before your code runs. Add `Query` to the `fastapi` import.

3. Write the endpoint:

   ```python
   @app.get("/expenses")
   def read_expenses(
       con: Db, category: Category | None = None, month: Month = None
   ) -> list[Expense]:
   ```

   `category: Category | None = None` is a plain optional query parameter, like `author` in chapter 43. But because its type is your `Category`, FastAPI only accepts the six real categories.

Reset the sample data first (second terminal: `Remove-Item expenses.db`, then `python seed.py`). You'll do this at the start of every milestone from now on, so your answers match. Then open <http://127.0.0.1:8000/expenses>. You get all eight expenses in date order, and the first one is expense 8, the groceries from 28 September. It was added last, but it's the oldest: an old receipt that turned up late. Now the filters:

```
GET /expenses?category=food&month=2026-10

200 OK
[
  {
    "description": "Lunch with Maya",
    "amount_cents": 1450,
    "category": "food",
    "spent_on": "2026-10-03",
    "id": 3
  },
  {
    "description": "Coffee beans",
    "amount_cents": 1275,
    "category": "food",
    "spent_on": "2026-10-07",
    "id": 5
  }
]
```

| Address | Answer |
|---|---|
| `/expenses?category=food` | Expenses 8, 3 and 5 (the groceries, lunch and coffee) |
| `/expenses?month=2026-09` | Only expense 8, the groceries |
| `/expenses?month=2026-12` | `[]`, an empty list (a month with no spending isn't an error) |
| `/expenses?month=October` | 422, `"String should match pattern '^\\d{4}-(0[1-9]\|1[0-2])$'"` |
| `/expenses?category=pizza` | 422, `"Input should be 'food', 'transport', 'bills', 'shopping', 'fun' or 'other'"` |

(The doubled backslash in `\\d` is how JSON writes a single backslash.)

<details>
<summary>Hint 1</summary>

`" AND ".join(conditions)` glues the conditions together with `AND` between them ([chapter 06](../06-strings/notes.md)). Only add `" WHERE "` and the joined conditions when the list isn't empty: `if conditions:`.

</details>

<details>
<summary>Hint 2</summary>

`con.execute(sql, params)` is happy with a list instead of a tuple. Then turn every row into an `Expense` with a list comprehension and `row_to_expense`. And the month's value is `f"{month}-%"`: the `%` goes in the **value**, not in the SQL string, like the `ILIKE` tip in chapter 42.

</details>

## Milestone 6: Changing and deleting

**Goal:** `PUT /expenses/{expense_id}` replaces an expense, and `DELETE /expenses/{expense_id}` removes it.

1. In `database.py`, write `update_expense`. It runs an `UPDATE` that sets all four columns, commits, and uses `rowcount` ([chapter 42](../42-databases/notes.md)) to find out whether the expense existed. It returns the updated `Expense`, or `None`:

   ```python
   def update_expense(
       con: sqlite3.Connection, expense_id: int, expense: ExpenseIn
   ) -> Expense | None:
   ```

2. Write `delete_expense`. It returns `True` if an expense was deleted, and `False` if there was nothing to delete:

   ```python
   def delete_expense(con: sqlite3.Connection, expense_id: int) -> bool:
   ```

3. In `main.py`, write the two endpoints. Both give the same 404 as `read_expense` when the expense doesn't exist:

   ```python
   @app.put("/expenses/{expense_id}")
   def replace_expense(expense_id: int, expense: ExpenseIn, con: Db) -> Expense:
   ```

   ```python
   @app.delete("/expenses/{expense_id}", status_code=204)
   def remove_expense(expense_id: int, con: Db) -> None:
   ```

Reset the sample data, then try these in `/docs`. The coffee beans turned out to be a 1 kg bag, and the cinema refunded the tickets:

```
PUT /expenses/5
{"description": "Coffee beans (1 kg)", "amount_cents": 1850, "category": "food", "spent_on": "2026-10-07"}

200 OK
{
  "description": "Coffee beans (1 kg)",
  "amount_cents": 1850,
  "category": "food",
  "spent_on": "2026-10-07",
  "id": 5
}

DELETE /expenses/4

204 No Content

DELETE /expenses/4

404 Not Found
{
  "detail": "Expense 4 not found"
}
```

The first delete answers `204 No Content` with an empty body: "done, and there's nothing to show you". The second finds nothing left to delete. A `PUT` to `/expenses/99` gets the same kind of 404. Open `/expenses?category=food&month=2026-10` again, and the coffee beans now say `"Coffee beans (1 kg)"` and `1850`.

`PUT` means **replace**, so the body must be a complete expense. Send only `{"amount_cents": 1850}`, and you get a 422 with `Field required` for `description`, `category` and `spent_on`. (Changing just one field is a job for a different method, `PATCH`. That's not in this project.)

<details>
<summary>Hint 1</summary>

The `UPDATE` has five placeholders: four for the new values, and one for the ID in `WHERE id = ?`. The tuple of values must be in the same order as the `?`s.

</details>

<details>
<summary>Hint 2</summary>

After an `UPDATE` or `DELETE`, `cur.rowcount` is `0` when no row had that ID. For `delete_expense`, `return cur.rowcount > 0` is the whole answer.

</details>

<details>
<summary>Hint 3</summary>

`remove_expense` returns nothing (`-> None`), and FastAPI sends the empty 204. It only needs an `if not database.delete_expense(con, expense_id):` that raises the 404.

</details>

## Milestone 7: The monthly summary

**Goal:** `GET /summary?month=2026-10` adds up the spending per category, and the total.

1. In `models.py`, write the two models the summary needs:

   ```python
   class CategoryTotal(BaseModel):
   ```

   ```python
   class Summary(BaseModel):
   ```

   | Model | Fields |
   |---|---|
   | `CategoryTotal` | `category: Category`, `total_cents: int`, `count: int` |
   | `Summary` | `month: str \| None`, `total_cents: int`, `count: int`, `by_category: list[CategoryTotal]` |

   Yes, a model can have a list of other models as a field. Pydantic turns it into a list of JSON objects.

2. In `database.py`, write `get_summary`. Let the database do the adding up, with `GROUP BY` ([PostgreSQL chapter 21](../../PostgreSQL/21-grouping/notes.md)):

   ```python
   def get_summary(con: sqlite3.Connection, month: str | None) -> Summary:
   ```

   The SQL is `SELECT category, SUM(amount_cents) AS total_cents, COUNT(*) AS count FROM expenses`, then the same optional `WHERE spent_on LIKE ?` as before, then `GROUP BY category ORDER BY total_cents DESC, category`. Each row that comes back is one category: its total and how many expenses it had. The `AS` names let you read them as `row["total_cents"]` and `row["count"]`. The biggest spending comes first, and `category` sorts any ties alphabetically.

   The overall `total_cents` and `count` are just the sums of the categories' numbers. Work them out in Python with `sum()` and a generator expression ([chapter 31](../31-iterators-and-generators/notes.md)).

3. In `main.py`, add the endpoint, reusing the `Month` alias. (Add the new models to the `from app.models import ...` lines in both files.)

   ```python
   @app.get("/summary")
   def read_summary(con: Db, month: Month = None) -> Summary:
   ```

Reset the sample data, then open <http://127.0.0.1:8000/summary?month=2026-10>. Here's the answer, with one category per line to make it easier to read (`/docs` spreads it over more lines):

```
GET /summary?month=2026-10

200 OK
{
  "month": "2026-10",
  "total_cents": 22454,
  "count": 7,
  "by_category": [
    {"category": "bills", "total_cents": 9230, "count": 2},
    {"category": "transport", "total_cents": 5500, "count": 1},
    {"category": "food", "total_cents": 2725, "count": 2},
    {"category": "shopping", "total_cents": 2599, "count": 1},
    {"category": "fun", "total_cents": 2400, "count": 1}
  ]
}
```

Check it with a calculator: the two bills are $62.30 and $30.00, which is $92.30, or `9230` cents. The September groceries aren't counted, so there are 7 expenses, not 8.

| Address | Answer |
|---|---|
| `/summary` | All time: `"month": null`, `"total_cents": 26974`, `"count": 8`, and food has moved up to second place with `7245` |
| `/summary?month=2026-11` | `{"month":"2026-11","total_cents":0,"count":0,"by_category":[]}` |
| `/summary?month=2026-13` | 422, because there's no month 13 |

November has no expenses, so `GROUP BY` finds no groups at all, the list is empty, and `sum()` of nothing is `0`. No special case needed.

<details>
<summary>Hint 1</summary>

The SQL is long, so build it in parts like in milestone 5: start with the `SELECT ... FROM expenses` part, add the `WHERE` if there's a month, then add the `GROUP BY ... ORDER BY ...` part with `+=`.

</details>

<details>
<summary>Hint 2</summary>

Build `by_category` with a list comprehension that makes one `CategoryTotal` per row (remember `Category(row["category"])`). Then `sum(item.total_cents for item in by_category)` gives the total.

</details>

## Milestone 8: Tests

**Goal:** pytest checks the whole API in a couple of seconds, without touching your real `expenses.db`.

Open `tests/test_expenses.py`. It already has four tests, and a fixture called `client` that every test uses. Here it is, without its comments:

```python
@pytest.fixture
def client(tmp_path: Path) -> Iterator[TestClient]:
    """A TestClient for the app, with a new, empty database for each test."""
    test_db = tmp_path / "test.db"

    def get_test_db() -> Iterator[sqlite3.Connection]:
        con = database.connect(test_db)
        try:
            yield con
        finally:
            con.close()

    app.dependency_overrides[database.get_db] = get_test_db
    yield TestClient(app)
    app.dependency_overrides.clear()
```

Read it slowly, because it's where milestone 4's dependency pays off:

- `tmp_path` is pytest's brand-new empty folder for each test ([chapter 36](../36-testing-with-pytest/notes.md)), so `test_db` is a database file that no other test uses.
- `get_test_db` is a copy of your `get_db`, but it opens `test_db` instead of `DB_PATH`.
- `app.dependency_overrides` is a dictionary that FastAPI checks before calling any dependency. The line says: "whenever an endpoint asks for `database.get_db`, call `get_test_db` instead". Your endpoints don't change at all, and they never know.
- This fixture uses `yield` instead of `return`. Like `get_db`, pytest runs it up to the `yield`, hands the `TestClient` to the test, and runs the rest after the test has finished. That last line clears the override, so one test's setup never leaks into the next.

So every test starts with an empty database of its own. That's why `test_create_expense` can expect the ID to be `1`, and why the tests don't depend on each other.

Run the tests from the project folder:

```
python -m pytest
```

```
============================= test session starts =============================
platform win32 -- Python 3.13.15, pytest-9.1.1, pluggy-1.6.0
rootdir: C:\Users\Sandip\...\my-expense-api
plugins: anyio-4.15.1
collected 4 items

tests\test_expenses.py ....                                              [100%]

============================== 4 passed in 0.74s ==============================
```

(`python -m pytest` starts Python in the project folder, so `from app.main import app` in the test file works, for the same reason as milestone 3.)

Now write your own tests at the bottom of the file, one for each feature. Here's a helper and an example to get you started. `add` posts a copy of `LUNCH` with some fields changed, using `**changes` ([chapter 32](../32-decorators/notes.md)) and the `{**a, **b}` trick from chapter 43:

```python
def add(client: TestClient, **changes: Any) -> dict[str, Any]:
    """POST a copy of LUNCH with some fields changed, and return the JSON."""
    response = client.post("/expenses", json={**LUNCH, **changes})
    assert response.status_code == 201
    result: dict[str, Any] = response.json()
    return result


def test_list_filters(client: TestClient) -> None:
    add(client, spent_on="2026-09-28")
    add(client, category="fun", spent_on="2026-10-04")
    add(client, spent_on="2026-10-07")
    food_in_october = client.get("/expenses?category=food&month=2026-10").json()
    assert [expense["id"] for expense in food_in_october] == [3]
```

(Add `from typing import Any` at the top. `response.json()` returns `Any`, and the hint on `result` tells mypy what this function really returns.)

Ideas for more tests, roughly one per milestone:

- `GET /categories` gives the six categories, in order.
- `GET /expenses/{id}` gives back exactly what `POST` returned.
- Bad bodies all give 422: an amount of 0, an amount of 12.5, a blank description, an unknown category, 30 February.
- The list is oldest first, even when expenses are added out of order.
- A bad month gives 422, on `/expenses` and on `/summary`.
- `PUT` changes an expense, and `PUT` on a missing one gives 404.
- `DELETE` gives 204, and then the expense is gone (404), and deleting it again gives 404.
- An ID is never reused after deleting the newest expense.
- The summary adds up correctly for one month, and an empty month gives zeros.

When you're done, run `python -m pytest -v`. Here's the end of a finished set (your test names and number of tests will be different):

```
tests/test_expenses.py::test_create_rejects_bad_data[changes4] PASSED    [ 52%]
tests/test_expenses.py::test_list_filters PASSED                         [ 57%]
tests/test_expenses.py::test_list_is_oldest_first PASSED                 [ 61%]
...
tests/test_expenses.py::test_summary PASSED                              [ 90%]
tests/test_expenses.py::test_summary_of_empty_month PASSED               [ 95%]
tests/test_expenses.py::test_cors_allows_the_react_app PASSED            [100%]

============================= 21 passed in 2.14s ==============================
```

(The CORS test is for milestone 9.) Twenty-one checks on the whole API, and `expenses.db` wasn't touched once: look at its "modified" time in the Explorer.

<details>
<summary>Hint 1</summary>

The five bad bodies are a perfect job for `@pytest.mark.parametrize` ([chapter 36](../36-testing-with-pytest/notes.md)), with a list of dictionaries like `{"amount_cents": 0}`, each one merged into `LUNCH`.

</details>

<details>
<summary>Hint 2</summary>

To test "IDs are never reused": add two expenses, delete the second one, add another, and check that its ID is 3, not 2.

</details>

<details>
<summary>Hint 3</summary>

If lots of tests fail with `sqlite3.OperationalError: no such table: expenses`, check that `connect` runs `SCHEMA`. The test database starts as an empty file, and `connect` is what creates the table in it.

</details>

## Milestone 9: CORS, React, and a final check

**Goal:** a React app running on `http://localhost:5173` can use your API, and mypy and pytest are both happy.

1. Let the React app in. Add `CORSMiddleware` to `main.py`, just below `app = FastAPI(...)`, exactly as in [chapter 43](../43-building-a-web-api-with-fastapi/notes.md):

   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["http://localhost:5173"],
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

   `allow_methods` and `allow_headers` matter more here than for the books, because the React app will send `POST`, `PUT` and `DELETE` requests with JSON. For those, the browser first sends an `OPTIONS` "may I?" request, the **preflight** ([JavaScript chapter 33](../../JavaScript/33-fetch-and-apis/notes.md)), and the middleware answers it.

2. Check the headers yourself with `curl.exe`, which comes with Windows. `-i` shows the response headers, and `-H` sends a header, here pretending to be the React page:

   ```
   curl.exe -i http://127.0.0.1:8000/health -H "Origin: http://localhost:5173"
   ```

   ```
   HTTP/1.1 200 OK
   date: Mon, 12 Oct 2026 05:23:50 GMT
   server: uvicorn
   content-length: 15
   content-type: application/json
   access-control-allow-origin: http://localhost:5173
   vary: Origin

   {"status":"ok"}
   ```

   There's the `access-control-allow-origin` header, the "yes, you may read this" from chapter 43. Try `"Origin: http://localhost:3000"`, and that line disappears. (On a Mac or Linux, the command is plain `curl`.)

3. Now the React side. In a Vite app from [React chapter 01](../../React/01-getting-started/notes.md), add this component as `src/ExpenseList.tsx`. It's the fetching pattern from [React chapter 18](../../React/18-fetching-data/notes.md), pointed at your API:

   ```tsx
   import { useEffect, useState } from "react";

   const API_URL = "http://127.0.0.1:8000";

   // The same shape as the Expense model in app/models.py
   type Expense = {
     id: number;
     description: string;
     amount_cents: number;
     category: string;
     spent_on: string;
   };

   function formatMoney(cents: number): string {
     return `$${(cents / 100).toFixed(2)}`;
   }

   export default function ExpenseList() {
     const [expenses, setExpenses] = useState<Expense[] | null>(null);
     const [error, setError] = useState<string | null>(null);

     useEffect(() => {
       let ignore = false;

       async function loadExpenses() {
         try {
           const response = await fetch(`${API_URL}/expenses?month=2026-10`);
           if (!response.ok) {
             throw new Error(`Request failed: ${response.status}`);
           }
           const data: Expense[] = await response.json();
           if (!ignore) {
             setExpenses(data);
           }
         } catch (err) {
           if (!ignore) {
             setError(err instanceof Error ? err.message : "Something went wrong");
           }
         }
       }

       loadExpenses();

       return () => {
         ignore = true;
       };
     }, []);

     if (error) return <p>Something went wrong: {error}</p>;
     if (expenses === null) return <p>Loading...</p>;
     if (expenses.length === 0) return <p>No expenses this month.</p>;

     return (
       <ul>
         {expenses.map((expense) => (
           <li key={expense.id}>
             {expense.spent_on}: {expense.description}, {formatMoney(expense.amount_cents)}
           </li>
         ))}
       </ul>
     );
   }
   ```

   Show it from `App.tsx` under a heading, run `npm run dev`, and open `http://localhost:5173`. With the sample data, the page shows:

   ```
   October spending

   - 2026-10-01: Bus pass for October, $55.00
   - 2026-10-02: Electricity bill, $62.30
   - 2026-10-03: Lunch with Maya, $14.50
   - 2026-10-04: Cinema tickets with Leo, $24.00
   - 2026-10-07: Coffee beans, $12.75
   - 2026-10-09: Phone bill, $30.00
   - 2026-10-11: Birthday present for Zoe, $25.99
   ```

   Notice who does what: the API sends `1450`, and `formatMoney` on the React side turns it into `$14.50`. Adding an expense from a form ([React chapter 09](../../React/09-forms/notes.md)) is a `POST` with a JSON body. Call a function like this from the form's submit handler:

   ```ts
   // Everything except the id: the database picks that
   type NewExpense = Omit<Expense, "id">;

   async function addExpense(expense: NewExpense): Promise<Expense> {
     const response = await fetch(`${API_URL}/expenses`, {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify(expense),
     });
     if (!response.ok) {
       throw new Error(`Request failed: ${response.status}`);
     }
     return response.json();
   }
   ```

   (`Omit` is from [TypeScript chapter 09](../../TypeScript/09-utility-types/notes.md).) If the form sends a bad amount, `response.status` is `422`, and `await response.json()` holds the same `detail` list you've seen in `/docs`, so the form can show the `msg` next to the right field.

4. Finally, check every hint in the project with mypy:

   ```
   python -m mypy app tests seed.py
   ```

   The goal is:

   ```
   Success: no issues found in 6 source files
   ```

   (The six are the four files in `app`, the test file and `seed.py`.) The most likely complaint is a missing `None` check after `cur.lastrowid` (your line number will be different):

   ```
   app\database.py:68: error: Argument "id" to "Expense" has incompatible type "int | None"; expected "int"  [arg-type]
   ```

   And run `python -m pytest` one last time. Everything should pass.

<details>
<summary>Hint 1</summary>

The import is `from fastapi.middleware.cors import CORSMiddleware`. The middleware must be added to the same `app` object your endpoints use, so put it right after `app = FastAPI(...)`.

</details>

<details>
<summary>Hint 2</summary>

If the React page says "Something went wrong: Failed to fetch", open the browser's console (`F12`, then **Console**). If it mentions CORS, compare the origin in the message with your `allow_origins` list, letter for letter, port included. Also check that the API is running.

</details>

## Putting it all together

Time for a full run from nothing. Stop the server, delete `expenses.db`, and then:

1. Start the API in the first terminal: `fastapi dev app/main.py`.
2. In the second terminal, run `python seed.py`, and see the eight "Added expense" lines.
3. Open <http://127.0.0.1:8000/summary?month=2026-10>, and check that the total is `22454`.
4. In `/docs`, add a new expense for today: `{"description": "Bubble tea", "amount_cents": 650, "category": "food", "spent_on": "2026-10-12"}`. It gets ID 9. Open the summary again: the total is now `23104`, and food has gone up to `3375`.
5. Refresh the React page, and Bubble tea is at the bottom of the list.
6. Run `python -m pytest` and `python -m mypy app tests seed.py`. Both are clean, and your Bubble tea is still in `expenses.db` afterwards, because the tests never touch it.

That's a real backend: it keeps its data, checks everything that comes in, answers with the right status codes, has automatic tests, and is ready for a front end. It's the same shape as the APIs behind real apps, just smaller.

### Test it like a user

Before you call it finished, try to break it. Tick each box once it works:

- [ ] `/docs` lists all eight endpoints, and **Try it out** works on each one.
- [ ] `POST` with a missing field, a zero or negative amount, `12.5`, a blank description, an unknown category, or `2026-02-30` gives 422, and `GET /expenses` shows nothing new was saved.
- [ ] `GET`, `PUT` and `DELETE` on an ID that doesn't exist all give 404.
- [ ] Expenses survive stopping and starting the server.
- [ ] Deleting the newest expense, then adding another, never reuses the old ID.
- [ ] `?month=2026-1`, `?month=October` and `?month=2026-13` all give 422.
- [ ] The summary's `total_cents` equals the sum of its categories, and matches adding up `GET /expenses` for the same month by hand.
- [ ] It works from another folder: stop the server, `cd ..`, and run `fastapi dev my-expense-api/app/main.py`. You see the same expenses, because `DB_PATH` is built from `__file__`.
- [ ] `python -m pytest` passes, and `python -m mypy app tests seed.py` says `Success`.

> **Tip:** If you use Git, add `expenses.db` to your `.gitignore`, next to `.venv/`, `__pycache__/`, `.mypy_cache/` and `.pytest_cache/`. Code goes in Git. Your own spending data doesn't.

## Common mistakes

**1. Forgetting `con.commit()`**

Leave `con.commit()` out of `add_expense`, and the API looks fine at first: `POST /expenses` answers `201 Created`, with `"id": 1`. Then:

```
GET /expenses/1

404 Not Found
{
  "detail": "Expense 1 not found"
}
```

The insert happened inside a transaction that was never committed, so when `get_db` closed the connection, SQLite threw the change away. The 201 was a lie. Every function that changes data (`add_expense`, `update_expense`, `delete_expense`) needs `con.commit()` before it returns.

**2. Leaving out `check_same_thread=False`**

```python
con = sqlite3.connect(path)
```

Click around in `/docs`, and everything works. Run the tests, and they pass. But send many requests at once, as a busy React app would, and some of them fail with `500 Internal Server Error`, while the server's terminal shows:

```
sqlite3.ProgrammingError: SQLite objects created in a thread can only be used in that same thread. The object was created in thread id 25112 and this is thread id 9772.
```

(Your thread numbers will be different.) When it's quiet, FastAPI often happens to use the same thread for `get_db` and the endpoint, so the bug hides. Under load it uses different ones. This is the worst kind of bug: invisible while you test, and it only shows up when real people use your app. Add `check_same_thread=False` in `connect`, as milestone 4 explains.

**3. Calling the dependency inside `Depends`**

```python
Db = Annotated[sqlite3.Connection, Depends(database.get_db())]
```

The app won't even start. The error ends with:

```
TypeError: <generator object get_db at 0x00000240956F28E0> is not a callable object
```

With the brackets, `get_db()` runs once, right there, and gives back a generator object instead of the function. FastAPI needs the function itself, so it can call it again for every request: `Depends(database.get_db)`.

**4. Running a module inside the package as a plain script**

```
python app/database.py
```

```
ModuleNotFoundError: No module named 'app'
```

Python started inside the `app` folder, where there's no `app` package to import from. Run it from the project folder as a module instead: `python -m app.database`. The same goes for the tests: run `python -m pytest` from the project folder, not from inside `tests`.

**5. Putting values straight into the SQL**

```python
conditions.append(f"category = '{category}'")
```

It works for `food`, which is exactly why it's tempting. Here FastAPI happens to protect you, because `category` can only be one of the six enum values and `month` must match the pattern. But the first time you add a filter for free text, like a search word, this line becomes an open door for SQL injection ([chapter 42](../42-databases/notes.md)). Make the habit automatic: SQL text you wrote yourself goes in the string, and every value goes through `?` and `params`.

**6. The React app runs on a different port**

Vite picks the next free port when 5173 is busy, as [React chapter 01](../../React/01-getting-started/notes.md) mentioned. If it prints `http://localhost:5174/`, the page says "Failed to fetch", and the console shows:

```
Access to fetch at 'http://127.0.0.1:8000/expenses?month=2026-10' from origin 'http://localhost:5174' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

Your API only allows `http://localhost:5173`, and an origin includes the port. Either stop whatever is using 5173, or add `"http://localhost:5174"` to `allow_origins` while you need it. Don't reach for `["*"]`.

## Quick recap

In this project, you practised:

- Splitting an API into a package with three jobs: `models.py` for the shapes of the data, `database.py` for the SQL, and `main.py` for the endpoints ([chapters 19](../19-modules-and-standard-library/notes.md) and [39](../39-project-structure-and-packaging/notes.md)).
- Pydantic models that check everything coming in: `Field` rules, a `StrEnum`, real dates, trimmed text, and separate models for what comes in and what goes out ([chapters 30](../30-dataclasses-and-enums/notes.md) and [43](../43-building-a-web-api-with-fastapi/notes.md)).
- Keeping data in SQLite with plain `sqlite3`: `?` placeholders, `commit`, `lastrowid`, `rowcount`, SQL built safely from pieces, and `GROUP BY` for totals ([chapter 42](../42-databases/notes.md)).
- A FastAPI **dependency**: a generator that opens a connection for each request and always closes it, used through `Annotated[..., Depends(...)]`.
- Swapping that dependency in tests with `app.dependency_overrides` and `tmp_path`, so tests are fast, independent, and never touch real data ([chapter 36](../36-testing-with-pytest/notes.md)).
- Letting a React app in with `CORSMiddleware`, and fetching from it with the pattern from [React chapter 18](../../React/18-fetching-data/notes.md).

That's the end of Level 4. One thing you saw along the way: FastAPI quietly ran your endpoints in threads, so that one slow request doesn't hold up everyone else. Python has another way to juggle many slow jobs at once, built into the language with two keywords, `async` and `await`. That's where Level 5 begins.

---

**Next:** try the stretch goals in the [exercises](exercises.md), then start Level 5 with [47 Async Python](../47-async-python/notes.md).
