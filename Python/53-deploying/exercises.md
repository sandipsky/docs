# 53 Deploying: Exercises

**How to do these:**

- Work in your deployed project, `C:\code\expense-api`, with the changes from the [notes](notes.md): `settings.py`, the log lines, both requirements files, and (if you have Docker) the `Dockerfile`. Commit before each exercise, so you can always go back.
- Most exercises use the **dress rehearsal** from the notes. Start it in one terminal, and keep a second terminal (with `.venv` active) for everything else:

  ```
  $env:PORT = "8053"
  $env:EXPENSES_DB = "rehearsal.db"
  $env:CORS_ORIGINS = "http://localhost:4173"
  fastapi run app/main.py
  ```

  For a fresh start, stop the server, delete `rehearsal.db`, and start it again.
- Finish every exercise with the same four checks as your CI workflow: `python -m ruff check .`, `python -m ruff format --check .`, `python -m mypy app tests seed.py` (add any new `.py` files to the list), and `python -m pytest`.
- Exercises 1 to 4 only need your laptop. If your API is live on Render, try them there too. Exercise 5 needs Docker, or the PostgreSQL server from the [PostgreSQL course](../../PostgreSQL/README.md).
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Which version is running?

Sandip pushed a fix ten minutes ago, but the bug is still there. Is the live API running the new code yet, or the old one? Make the health check say which version it is.

Add a setting called `APP_VERSION` to `settings.py`, read from the environment variable of the same name, with `"dev"` as the default. Then make `GET /health` include it:

```
GET /health

200 OK
{"status":"ok","version":"dev"}
```

Stop the rehearsal, add `$env:APP_VERSION = "1.1.0"` to its settings, and start it again:

```
{"status":"ok","version":"1.1.0"}
```

Now run `python -m pytest`. One of chapter 46's tests fails, because it expected the old answer:

```
FAILED tests/test_expenses.py::test_health - AssertionError: assert {'status'...
1 failed, 20 passed in 0.99s
```

That's a test doing its job: the API's answer changed, so the test has to change too. Update it, and add a second test that checks a real version number shows up.

<details>
<summary>Hint 1</summary>

The setting is one line in `settings.py`, just like the others: `APP_VERSION = os.environ.get("APP_VERSION", "dev")`. In `main.py`, `health` returns `{"status": "ok", "version": settings.APP_VERSION}`, and its `dict[str, str]` hint is still right.

</details>

<details>
<summary>Hint 2</summary>

`settings.py` reads the variable once, when the app is first imported, so setting the environment variable inside a test comes too late. Change the setting itself instead. `monkeypatch` (from chapter 46's exercise 5) can do that too, and it puts the old value back after the test: ask for `monkeypatch: pytest.MonkeyPatch`, then `monkeypatch.setattr(settings, "APP_VERSION", "1.1.0")`. Import `settings` with `from app import database, settings`.

</details>

<details>
<summary>Hint 3</summary>

On Render, add `APP_VERSION` on the **Environment** page, and change it with each release. Or skip that chore: Render sets `RENDER_GIT_COMMIT` for you, holding the ID of the Git commit it deployed. You could use that when `APP_VERSION` isn't set, and compare it with the commit IDs on GitHub.

</details>

---

## Exercise 2 (Easy): Seed any copy of the API

`seed.py` always talks to `http://127.0.0.1:8000`. Now you have three copies of the API: `fastapi dev`, the rehearsal on port 8053, and the live one. Make `seed.py` read the address from an environment variable called `EXPENSES_API_URL`, with `http://127.0.0.1:8000` as the default.

With the rehearsal running on a fresh `rehearsal.db`, and no `fastapi dev` server, run `python seed.py` in your second terminal:

```
Error: can't reach the API at http://127.0.0.1:8000. Is it running?
```

That's the default address, and nothing is listening there. Now point it at the rehearsal:

```
$env:EXPENSES_API_URL = "http://127.0.0.1:8053"
python seed.py
```

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

<http://127.0.0.1:8053/summary?month=2026-10> now says `"total_cents":22454`, the same as in chapter 46.

One more rule: an address with a slash at the end, like `http://127.0.0.1:8053/` (easy to copy from a browser), must work too. Without a fix, it gives:

```
Error: the API said 404: {"detail":"Not Found"}
```

When it all works, point it at your live API on Render, if you have one, and see the sample data appear there.

<details>
<summary>Hint 1</summary>

It's the same pattern as `settings.py`: `API_URL = os.environ.get("EXPENSES_API_URL", "http://127.0.0.1:8000")`, with `import os` at the top. Nothing else in `seed.py` needs to change, because it already builds every address from `API_URL`.

</details>

<details>
<summary>Hint 2</summary>

Why the 404? With a slash at the end, `f"{API_URL}/expenses"` becomes `http://127.0.0.1:8053//expenses`, with two slashes, and no endpoint has that path. The string method `.rstrip("/")` removes any slashes from the end ([chapter 06](../06-strings/notes.md)).

</details>

<details>
<summary>Hint 3</summary>

On Render's free plan, a sleeping API can take about a minute to wake up, which is longer than `seed.py`'s `timeout=5`. Open `/health` in your browser first, wait for `{"status":"ok"}`, then run the seed script.

</details>

---

## Exercise 3 (Medium): A smoke test for every deploy

After a deploy, you want to know in five seconds whether the new version really works: not just `/health`, but saving and reading data too. A quick check like that is called a **smoke test** (from electronics: switch it on, and see if smoke comes out).

Write `smoke_test.py`. It takes the API's address from the command line ([chapter 24](../24-command-line-programs/notes.md)), runs six checks, prints one line per check, and **cleans up after itself**, so it's safe to run against your live API:

1. `GET /health` answers 200.
2. `GET /categories` gives 6 categories.
3. `POST /expenses` with a test expense answers 201.
4. `GET /expenses/{id}` gives back exactly what the `POST` returned.
5. `DELETE /expenses/{id}` answers 204.
6. `GET /expenses/{id}` now answers 404.

Use this test expense:

```python
TEST_EXPENSE = {
    "description": "Smoke test",
    "amount_cents": 100,
    "category": "other",
    "spent_on": "2026-10-12",
}
```

With the rehearsal running and seeded (exercise 2):

```
python smoke_test.py http://127.0.0.1:8053
```

```
Checking http://127.0.0.1:8053
OK   GET /health
OK   GET /categories (6 categories)
OK   POST /expenses (id 9)
OK   GET /expenses/9
OK   DELETE /expenses/9
OK   GET /expenses/9 is gone (404)
All 6 checks passed.
```

(The ID depends on what's in the database: 9 is the next one after the eight sample expenses.) At the first check that fails, it prints `FAIL` and the check, and stops with exit code 1. Stop the rehearsal and try again:

```
Checking http://127.0.0.1:8053
FAIL can't reach http://127.0.0.1:8053
```

`$LASTEXITCODE` is `1`. Run it without an address, and it prints `Usage: python smoke_test.py URL` and stops with exit code 2. Those exit codes are what make the script useful to other programs: a CI workflow, or a scheduled task from [chapter 45](../45-automating-tasks/notes.md), can tell pass from fail without reading the text.

<details>
<summary>Hint 1</summary>

A small helper keeps `main` short: `def check(passed: bool, label: str) -> None:` prints `OK   ` or `FAIL ` and the label, and calls `sys.exit(1)` when `passed` is false. Then each check is one line, like `check(health.status_code == 200, "GET /health")`.

</details>

<details>
<summary>Hint 2</summary>

`httpx.Client(base_url=base_url, timeout=10)` is a client that remembers the start of the address, so `client.get("/health")` asks for `base_url + "/health"`. Use it in a `with` block ([chapter 33](../33-context-managers/notes.md)), so its connections are closed at the end. Strip a trailing slash from the address first, like in exercise 2.

</details>

<details>
<summary>Hint 3</summary>

When nothing is listening, the first request raises an exception instead of returning a response. Catch `httpx.TransportError`, which covers "can't connect" and "took too long", print the `FAIL` line, and `sys.exit(1)` right there, so the checks below never run without a response.

</details>

---

## Exercise 4 (Medium): Refuse bad settings at startup

Two mistakes from the notes let the app start and look healthy while it's really broken: a CORS origin with a slash at the end, and a database file in a folder that doesn't exist. A setting that's wrong should stop the app **when it starts**, with a clear message, not cause mysterious failures later. That's what [chapter 52](../52-security-basics/notes.md)'s settings module did for a missing secret, and the same idea works for settings that are present but wrong. On a host, that means the broken deploy fails its health check, and the old version keeps running.

Add two functions to `settings.py`, and use them for the two settings:

```python
def parse_origins(text: str) -> list[str]:
```

```python
def check_db_path(path: Path) -> Path:
```

- `parse_origins` splits the text on commas, strips the spaces around each origin, and skips empty pieces. It raises a `ValueError` for an origin that doesn't start with `http://` or `https://`, or that ends with a slash.
- `check_db_path` returns the path unchanged, or raises a `ValueError` if the folder it would be in doesn't exist.

```python
print(parse_origins("http://localhost:5173"))
print(parse_origins(" https://my-expenses.netlify.app , http://localhost:5173, "))
print(check_db_path(Path("rehearsal.db")))
```

```
['http://localhost:5173']
['https://my-expenses.netlify.app', 'http://localhost:5173']
rehearsal.db
```

And the errors:

```
ValueError: CORS origin 'https://my-expenses.netlify.app/' must not end with a slash
ValueError: CORS origin 'my-expenses.netlify.app' must start with http:// or https://
ValueError: The folder for EXPENSES_DB doesn't exist: data
```

(The last one is for `Path("data") / "expenses.db"`, when there's no `data` folder.) Now start the rehearsal with `$env:CORS_ORIGINS = "https://my-expenses.netlify.app/"`. The app refuses to start. The output begins like this:

```
 ⚡️ Starting FastAPI in production mode
ERROR    Import error: CORS origin 'https://my-expenses.netlify.app/' must not
         end with a slash
WARNING  Ensure all the package directories have an __init__.py file
```

followed by a long traceback in a box, ending with the same `ValueError`. Ignore the `__init__.py` warning: the `fastapi` command shows it for every error while importing your app, and here it's a red herring. The first and last lines tell you the real problem.

Write the tests in a new file, `tests/test_settings.py`: one origin, spaces and empty pieces, both kinds of bad origin, and both cases of `check_db_path`. Here's a finished set, from `python -m pytest tests/test_settings.py -v` (your test names will be different):

```
tests/test_settings.py::test_one_origin PASSED                           [ 16%]
tests/test_settings.py::test_spaces_and_empty_pieces_are_ignored PASSED  [ 33%]
tests/test_settings.py::test_bad_origins_are_refused[https://my-expenses.netlify.app/] PASSED [ 50%]
tests/test_settings.py::test_bad_origins_are_refused[my-expenses.netlify.app] PASSED [ 66%]
tests/test_settings.py::test_db_path_in_a_missing_folder PASSED          [ 83%]
tests/test_settings.py::test_db_path_in_a_real_folder PASSED             [100%]

============================== 6 passed in 0.05s ==============================
```

<details>
<summary>Hint 1</summary>

A list comprehension with an `if` does the splitting in one line ([chapter 15](../15-comprehensions/notes.md)): keep `piece.strip()` for each piece, but only `if piece.strip()`. And `startswith` accepts a tuple, meaning "any of these": `origin.startswith(("http://", "https://"))`.

</details>

<details>
<summary>Hint 2</summary>

`path.parent` is the folder a file would be in ([chapter 20](../20-files-and-folders/notes.md)), and `.is_dir()` says whether it exists. For a plain name like `rehearsal.db`, the parent is `.`, the current folder, which always exists.

</details>

<details>
<summary>Hint 3</summary>

`with pytest.raises(ValueError):` checks that the code inside raises that exception ([chapter 36](../36-testing-with-pytest/notes.md)), and `match="doesn't exist"` also checks the message. `tmp_path / "nowhere" / "expenses.db"` is a path in a folder that's sure not to exist, and `@pytest.mark.parametrize` runs one test with both bad origins.

</details>

---

## Exercise 5 (Challenge): PostgreSQL with Docker Compose

Time to fix the vanishing data for good. Move the API from SQLite to PostgreSQL, the "managed database" option from the notes, and run both on your laptop with Docker Compose: one container for PostgreSQL, one for your API.

1. **`database.py` for PostgreSQL.** Rewrite it with psycopg ([chapter 42](../42-databases/notes.md)). Keep every function name and what it returns, so `main.py` barely changes. `get_db` connects to a new setting, `DATABASE_URL`. Use a real `date` column for `spent_on`, and make sure IDs are still never reused.
2. **`settings.py`.** Replace `EXPENSES_DB` with `DATABASE_URL`, defaulting to `postgresql://postgres@localhost:5432/expenses`. With no password in the address, psycopg uses the `PGPASSWORD` environment variable, like in chapter 42.
3. **`requirements.txt`.** Install `"psycopg[binary]"` into the app's environment and freeze again.
4. **`compose.yaml`.** Two services: `db`, from the official `postgres:18` image, keeping its data in a volume, and `api`, built from your `Dockerfile`, which waits until the database is ready. The database password lives in a `.env` file next to `compose.yaml` (it's already in `.gitignore` and `.dockerignore`), never in `compose.yaml` itself.

Then:

```
docker compose up --build
```

In a second terminal, `python seed.py` gives the same eight "Added expense" lines as exercise 2, and <http://127.0.0.1:8000/summary?month=2026-10> gives the same answer as ever:

```
{"month":"2026-10","total_cents":22454,"count":7,"by_category":[{"category":"bills","total_cents":9230,"count":2},{"category":"transport","total_cents":5500,"count":1},{"category":"food","total_cents":2725,"count":2},{"category":"shopping","total_cents":2599,"count":1},{"category":"fun","total_cents":2400,"count":1}]}
```

Delete expense 8, add `{"description": "Bubble tea", "amount_cents": 650, "category": "food", "spent_on": "2026-10-12"}`, and it gets ID 9, not 8. `/summary` now says `"total_cents":23104`, with food at `3375`. Run `docker compose down`, then `docker compose up` again: everything is still there, because it lives in the volume.

No Docker? Use the PostgreSQL server from [PostgreSQL chapter 03](../../PostgreSQL/03-installing-postgresql/notes.md) instead: `CREATE DATABASE expenses;` in psql, set `PGPASSWORD`, and run `fastapi run app/main.py`. You'll get the same answers on port 8000. (On a real host, the database would be a managed one, like Neon from [PostgreSQL chapter 43](../../PostgreSQL/43-postgresql-in-the-cloud/notes.md), and `DATABASE_URL` would be set on the host's Environment page.)

The SQLite tests from chapter 46 won't work against this version as they are. Updating them is a bonus (hint 3).

(An honest note: the PostgreSQL code for this exercise was run against a real PostgreSQL 18 server while writing the course, but the Docker Compose part wasn't, because Docker wasn't running on that computer. The `compose.yaml` in hint 2 was checked with `docker compose config`, which reads and checks the file without starting anything.)

<details>
<summary>Hint 1</summary>

The changes, compared with chapter 42's table of differences:

- `?` becomes `%s`. `cur.lastrowid` becomes `RETURNING id` at the end of the `INSERT`, then `.fetchone()`. It returns `None` when there's no row, so check for that before reading `row["id"]` (mypy will remind you, like it did for `lastrowid`).
- `id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY` never reuses an ID, like `AUTOINCREMENT`. And `spent_on date NOT NULL` is a real date: pass the `date` itself (no `.isoformat()`), and you get a `date` back (no `date.fromisoformat()`).
- `LIKE` doesn't work on a date. Match the month with `to_char(spent_on, 'YYYY-MM') = %s`, and pass the month itself, like `"2026-10"`.
- `connect` opens with `psycopg.connect(url, row_factory=dict_row)`, runs `SCHEMA`, then `conn.commit()`.

For type hints, `from psycopg.rows import DictRow, dict_row`, and a type alias `Connection = psycopg.Connection[DictRow]`. In `main.py`, `Db` becomes `Annotated[database.Connection, Depends(database.get_db)]`, and `import sqlite3` can go. Delete the log line for the database file, and don't add one for `DATABASE_URL`: in the containers, it holds the password.

</details>

<details>
<summary>Hint 2</summary>

Here's the shape of `compose.yaml`. Inside Compose, each service's name is also its address, so the API reaches the database at `db`, not `localhost`:

```yaml
services:
  db:
    image: postgres:18
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: expenses
    volumes:
      - pg-data:/var/lib/postgresql
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "postgres"]
      interval: 5s
      retries: 10

  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://postgres:${POSTGRES_PASSWORD}@db:5432/expenses
      CORS_ORIGINS: http://localhost:5173
    depends_on:
      db:
        condition: service_healthy

volumes:
  pg-data:
```

Compose fills in `${POSTGRES_PASSWORD}` from the `.env` file, which needs one line: `POSTGRES_PASSWORD=` and a practice password. If it's missing, Compose warns `The "POSTGRES_PASSWORD" variable is not set. Defaulting to a blank string.` (Write `${POSTGRES_PASSWORD:?Put POSTGRES_PASSWORD in .env}` to make it stop with that message instead.) The volume goes at `/var/lib/postgresql`: PostgreSQL 18's image moved its data folder, and guides for older versions say `/var/lib/postgresql/data`. `pg_isready` and `service_healthy` make the API wait until the database accepts connections.

</details>

<details>
<summary>Hint 3</summary>

For the tests, use a second database (`CREATE DATABASE expenses_test;`) read from a `TEST_DATABASE_URL` variable. In the `client` fixture, empty the table before each test with `conn.execute("TRUNCATE expenses RESTART IDENTITY")` inside a `with database.connect(TEST_DATABASE_URL) as conn:` block. `RESTART IDENTITY` starts the IDs at 1 again, so `test_create_expense` still gets ID 1. The override function opens `TEST_DATABASE_URL` instead of `test_db`, and `tmp_path` isn't needed any more. All 21 tests can pass unchanged after that.

</details>

---

## Before you move on

Look at what you can do now. You can build an API, test it, check it with Ruff and mypy, pack it into an image, put it on the internet, connect a front end to it, and have a robot check every change before it goes live. That's the whole journey of a real project, from the first line to real users.

[Chapter 54](../54-final-project/notes.md) is the last one, and it's yours: you'll plan and build a project of your own, from start to finish, using everything in this course. Whatever you build, you now know how to ship it.
