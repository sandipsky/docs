# 46 Project: Expense Tracker API: Exercises

**How to do these:**

- These are stretch goals: extra features for your finished API. Finish all nine milestones in the [notes](notes.md) first.
- Before you start, copy your finished `app` and `tests` folders into a new folder called `finished`, so you always have a working version to go back to. Then add the stretch goals to `my-expense-api`, one after another.
- Before each exercise, reset the sample data, like in the milestones: with the server running, delete `expenses.db` and run `python seed.py` in your second terminal.
- Add a test or two for every new feature to `tests/test_expenses.py`, and finish each exercise with `python -m pytest` passing and `python -m mypy app tests seed.py` saying `Success`.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Search

Sandip remembers paying a bill, but not which one. Add a `q` query parameter to `GET /expenses` that keeps only the expenses whose description contains some text, ignoring capitals. It works together with the other filters.

```
GET /expenses?q=bill

200 OK
[
  {
    "description": "Electricity bill",
    "amount_cents": 6230,
    "category": "bills",
    "spent_on": "2026-10-02",
    "id": 2
  },
  {
    "description": "Phone bill",
    "amount_cents": 3000,
    "category": "bills",
    "spent_on": "2026-10-09",
    "id": 6
  }
]
```

| Address | Answer |
|---|---|
| `/expenses?q=BILL` | Expenses 2 and 6, the same as `q=bill` |
| `/expenses?q=with&category=food` | Only expense 3, "Lunch with Maya" |
| `/expenses?q=bill&month=2026-09` | `[]` |
| `/expenses?q=pizza` | `[]` |

Without `q`, the list is exactly what it was before.

<details>
<summary>Hint 1</summary>

It's one more optional query parameter, `q: str | None = None`, like `author` in chapter 43. In `list_expenses`, add `q` as a new last parameter with a default of `None`, so every other call to it keeps working.

</details>

<details>
<summary>Hint 2</summary>

It's one more condition, built the same way as the month: `description LIKE ?`, with the value `f"%{q}%"` ("anything, then the text, then anything"). SQLite's `LIKE` already ignores capitals, at least for the English letters A to Z. (Letters like `É` are compared exactly, unless you do some extra work.)

</details>

<details>
<summary>Hint 3</summary>

Try `/expenses?q=%25` (`%25` is how a URL writes `%`). You get all eight expenses, because `%` is a wildcard for `LIKE`, even when it arrives in a value. It's harmless here, so fixing it is optional. If you're curious, look up SQLite's `ESCAPE` keyword.

</details>

---

## Exercise 2 (Easy): Pages of results

After a year of tracking, `GET /expenses` will send back hundreds of expenses at once. Add two query parameters, so a front end can ask for one page at a time:

- `limit`: how many to send, 50 if it isn't given, and never less than 1 or more than 100.
- `offset`: how many to skip first, 0 if it isn't given, and never negative.

| Address | Answer |
|---|---|
| `/expenses?limit=3` | Expenses 8, 1 and 2 (the three oldest) |
| `/expenses?limit=3&offset=3` | Expenses 3, 4 and 5 |
| `/expenses?limit=3&offset=6` | Expenses 6 and 7 (only two are left) |
| `/expenses?limit=3&offset=9` | `[]` |
| `/expenses?category=food&limit=2` | Expenses 8 and 3 |
| `/expenses?limit=0` | 422, `"Input should be greater than or equal to 1"` |
| `/expenses?limit=500` | 422, `"Input should be less than or equal to 100"` |
| `/expenses?offset=-1` | 422, `"Input should be greater than or equal to 0"` |

Why a maximum? So that nobody can ask for a million rows at once and slow your server down for everyone else.

<details>
<summary>Hint 1</summary>

`Query` takes the same rules as `Field`: `limit: Annotated[int, Query(ge=1, le=100)] = 50`. The default goes after the `=`, like with `Month`.

</details>

<details>
<summary>Hint 2</summary>

SQL has words for this, at the very end of the statement, after `ORDER BY`: `LIMIT ? OFFSET ?` ([PostgreSQL chapter 09](../../PostgreSQL/09-sorting-and-limiting/notes.md)). The two numbers go at the end of `params`.

</details>

<details>
<summary>Hint 3</summary>

If mypy says `Argument 1 to "append" of "list" has incompatible type "int"; expected "str"`, it's right: `params` was a `list[str]`, and now it holds numbers too. Change its hint to `list[str | int]`.

</details>

---

## Exercise 3 (Medium): Download as a spreadsheet

Sandip's accountant friend Priya wants his October spending in a spreadsheet. Add `GET /expenses/export`, which sends the expenses (with the same optional `?month=`) as a CSV file ([chapter 21](../21-json-and-csv/notes.md)) instead of JSON. The amount is in dollars, so it looks right in Excel. Open it in a browser, and the browser downloads it as a file called `expenses-2026-10.csv` (or `expenses-all.csv` when there's no month).

```
curl.exe -i "http://127.0.0.1:8000/expenses/export?month=2026-10"
```

```
HTTP/1.1 200 OK
date: Mon, 12 Oct 2026 05:42:30 GMT
server: uvicorn
content-disposition: attachment; filename="expenses-2026-10.csv"
content-length: 353
content-type: text/csv; charset=utf-8
vary: Origin

id,spent_on,category,description,amount
1,2026-10-01,transport,Bus pass for October,55.00
2,2026-10-02,bills,Electricity bill,62.30
3,2026-10-03,food,Lunch with Maya,14.50
4,2026-10-04,fun,Cinema tickets with Leo,24.00
5,2026-10-07,food,Coffee beans,12.75
6,2026-10-09,bills,Phone bill,30.00
7,2026-10-11,shopping,Birthday present for Zoe,25.99
```

(Your `date` line will be different.) The `content-disposition` header is what tells the browser "save this as a file, with this name". Without a month, the file has all eight expenses, starting with expense 8. A month with no expenses gives a file with only the heading row, and `?month=Oct` gives the usual 422.

<details>
<summary>Hint 1</summary>

To send something that isn't JSON, return a `Response` (import it from `fastapi`) and give the endpoint the return type `-> Response`: `Response(content=text, media_type="text/csv", headers={"Content-Disposition": f'attachment; filename="{filename}"'})`.

</details>

<details>
<summary>Hint 2</summary>

`csv.writer` wants a file to write to, but you want a string. `io.StringIO()` from the standard library is a pretend file that lives in memory: give it to `csv.writer`, write the rows, then `.getvalue()` gives you everything as one string. Reuse `database.list_expenses(con, None, month)` for the rows.

</details>

<details>
<summary>Hint 3</summary>

If you get a 422 saying `"loc":["path","expense_id"]` with `"input":"export"`, it's the route order mistake from chapter 43: `/expenses/{expense_id}` caught `/expenses/export` first. Put the export endpoint **above** it in `main.py`.

</details>

---

## Exercise 4 (Medium): Monthly budgets

Sandip wants to spend at most $200 a month on food, $80 on bills, and $50 on fun. Add budgets:

- A second table, `budgets`, with two columns: `category` (the primary key, so one budget per category) and `limit_cents` (more than 0).
- `PUT /budgets/{category}` with a body like `{"limit_cents": 20000}` sets a category's budget, or replaces it if it already has one, and sends it back.
- `GET /budgets?month=2026-10` shows each category that has a budget, in alphabetical order: its limit, how much was spent that month, and how much is left (negative when it's over). Here the month is **required**.

Reset the sample data, then:

```
PUT /budgets/food
{"limit_cents": 20000}

200 OK
{
  "category": "food",
  "limit_cents": 20000
}
```

Do the same for `bills` (`8000`) and `fun` (`5000`). Then (one budget per line, to save space):

```
GET /budgets?month=2026-10

200 OK
[
  {"category": "bills", "limit_cents": 8000, "spent_cents": 9230, "left_cents": -1230},
  {"category": "food", "limit_cents": 20000, "spent_cents": 2725, "left_cents": 17275},
  {"category": "fun", "limit_cents": 5000, "spent_cents": 2400, "left_cents": 2600}
]
```

Bills are $12.30 over. Now cut the fun budget with `PUT /budgets/fun` and `{"limit_cents": 2000}`, and fun's `left_cents` becomes `-400`. September (`?month=2026-09`) shows food with `4520` spent and the others with `0`.

| Request | Answer |
|---|---|
| `PUT /budgets/pizza` | 422, because `pizza` isn't a `Category` (`"loc":["path","category"]`) |
| `PUT /budgets/food` with `{"limit_cents": 0}` | 422, `"Input should be greater than 0"` |
| `GET /budgets` (no month) | 422, `"Field required"` for `month` |

Use three new models: `BudgetIn` (only `limit_cents`, the body), `Budget` (`category` and `limit_cents`), and `BudgetStatus`, which is a `Budget` plus `spent_cents` and `left_cents`.

<details>
<summary>Hint 1</summary>

Add the second `CREATE TABLE IF NOT EXISTS` to `SCHEMA`, with a `;` after each statement. Then you'll meet `sqlite3.ProgrammingError: You can only execute one statement at a time.`: `con.execute` runs exactly one statement. `con.executescript(SCHEMA)` runs several. Your existing `expenses.db` gets the new table the next time `connect` runs. (That trick only works for brand-new tables. Changing a table that already has data needs `ALTER TABLE`, or a migration tool like the ones in [PostgreSQL chapter 41](../../PostgreSQL/41-migrations/notes.md).)

</details>

<details>
<summary>Hint 2</summary>

SQLite has a short way to say "add this row, or replace the one with the same primary key": `INSERT OR REPLACE INTO budgets (category, limit_cents) VALUES (?, ?)`. For a required query parameter with a pattern, leave out the default: `month: Annotated[str, Query(pattern=MONTH_PATTERN)]`.

</details>

<details>
<summary>Hint 3</summary>

You already know how much was spent per category: `get_summary` works it out. Turn its `by_category` into a dictionary from category to `total_cents`, then loop over the budget rows. A category with a budget but no spending isn't in the summary at all, so `.get(category, 0)` ([chapter 13](../13-dictionaries/notes.md)) is your friend.

</details>

---

## Exercise 5 (Challenge): Lock it with an API key

Right now, anyone who can reach your API can read and delete your expenses. Add a simple lock: every endpoint except `/health` needs a header called `X-API-Key`, and its value must match the environment variable `EXPENSES_API_KEY` on the server ([chapter 40](../40-working-with-apis/notes.md) showed API keys from the caller's side).

- A missing or wrong key gets `401 Unauthorized` with `{"detail": "Missing or wrong API key"}`.
- If `EXPENSES_API_KEY` isn't set on the server at all, every locked request gets that same 401. A forgotten setting should lock everyone out, not let everyone in.
- `seed.py` sends the key, read from the same environment variable.
- The tests still pass: the fixture sets a test key and sends it with every request. Add tests for a missing key, a wrong key, `/health` without a key, and a server with no key set.

Start the server with a key. An environment variable belongs to one terminal session ([chapter 40](../40-working-with-apis/notes.md)), so set it in both terminals:

```
$env:EXPENSES_API_KEY = "tiger-lily-42"
fastapi dev app/main.py
```

(In Command Prompt it's `set EXPENSES_API_KEY=tiger-lily-42`, and on a Mac or Linux `export EXPENSES_API_KEY=tiger-lily-42`.) In the second terminal, run `python seed.py` once *without* setting the variable, then once with it:

```
Error: the API said 401: {"detail":"Missing or wrong API key"}
```

```
Added expense 1: Bus pass for October ($55.00)
...
Added expense 8: Groceries at Fresh Mart ($45.20)
```

Then try `curl.exe`, without and with the key:

```
curl.exe -i http://127.0.0.1:8000/expenses/3
```

```
HTTP/1.1 401 Unauthorized
date: Mon, 12 Oct 2026 05:42:05 GMT
server: uvicorn
content-length: 37
content-type: application/json
vary: Origin

{"detail":"Missing or wrong API key"}
```

```
curl.exe -i http://127.0.0.1:8000/expenses/3 -H "X-API-Key: tiger-lily-42"
```

```
HTTP/1.1 200 OK
date: Mon, 12 Oct 2026 05:42:05 GMT
server: uvicorn
content-length: 102
content-type: application/json
vary: Origin

{"description":"Lunch with Maya","amount_cents":1450,"category":"food","spent_on":"2026-10-03","id":3}
```

A wrong key (`-H "X-API-Key: guess"`) gets the 401, and `curl.exe -i http://127.0.0.1:8000/health` still answers `{"status":"ok"}` with no key at all. With the four new tests, the finished set ends with `25 passed` (your count will depend on your tests).

Be honest with yourself about what this protects. A React app would have to send the key from the browser, where anyone can read it in the developer tools. So a key like this keeps out strangers and scripts, not a determined person. Real logins with passwords are a bigger topic, coming in [chapter 52](../52-security-basics/notes.md).

<details>
<summary>Hint 1</summary>

The lock is a dependency that returns nothing and raises a 401 when the key is wrong. FastAPI can read a header for it: `def check_api_key(x_api_key: Annotated[str | None, Header()] = None) -> None:` (import `Header` from `fastapi`). FastAPI turns the underscores in `x_api_key` into dashes, and header names ignore capitals, so this reads `X-API-Key`.

</details>

<details>
<summary>Hint 2</summary>

A dependency you don't need a value from goes in the decorator: `@app.get("/expenses", dependencies=[Depends(check_api_key)])`. Read the server's key with `os.environ.get("EXPENSES_API_KEY")`, and compare with `secrets.compare_digest(sent, expected)` from the standard library instead of `==`. It takes the same time whether the first letter is wrong or the last, so nobody can guess the key letter by letter by timing your answers.

</details>

<details>
<summary>Hint 3</summary>

For the tests, `monkeypatch` is another built-in pytest fixture, like `tmp_path`: ask for it in the fixture's parameters (hint: `monkeypatch: pytest.MonkeyPatch`), and `monkeypatch.setenv("EXPENSES_API_KEY", "test-key")` sets the variable for one test only, and puts things back afterwards (`monkeypatch.delenv(...)` removes it). `TestClient(app, headers={"X-API-Key": "test-key"})` sends the key with every request, and a plain `TestClient(app)` sends none. The browser's CORS preflight carries no key, but that's fine: `CORSMiddleware` answers it before your dependency ever runs.

</details>

---

## Before you move on

Look at what your API does while it waits. Every request sits idle while SQLite reads the disk, and a real app might also wait for another API or a payment service. FastAPI hides that by running your plain `def` endpoints in threads (you met them through `check_same_thread`). Python has a second way to do many slow things at once, built into the language with `async` and `await`, and FastAPI is built on it. [Chapter 47](../47-async-python/notes.md) starts Level 5 with exactly that.

And if you've done the [React course](../../React/README.md), you now have everything for a bigger project of your own: a full front end for this API, with the month's list, a form to add expenses, delete buttons, and the summary as a chart.
