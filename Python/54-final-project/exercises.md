# 54 Final Project: Exercises

This is a **project menu**. Pick one idea, and build it from start to finish.

**How to do these:**

- Pick **one** project. (Or bring your own idea: see the end of this page.)
- Make it its own project, **outside** your `docs` folder, in a short path like `C:\code\habits`, so it can be its own Git repository from day one (step 5 in the [notes](notes.md)).
- Follow the 10 steps in the notes. Steps 1 to 4 happen on paper, in your `plan.md`, before you create anything.
- The packages listed with each idea are **suggestions, not a shopping list**. Use step 4's rule: add a package when you feel the pain it removes.
- Every API and practice site on this menu was free and needed no key when this was written (October 2026). Websites change, though. Before you build on one, open one of its addresses in your browser and look at the answer.
- A project is done when the MVP works, the pre-commit hooks pass, `python -m mypy` says `Success`, `python -m pytest` passes, it has a README, and it's shipped: installable from GitHub, deployed, or running on its schedule.
- Ask Claude for a review after each working slice. There are no answers on this page, on purpose: there are lots of good ways to build each one.

---

## Exercise 1 (Easy): Habit Tracker

Tick off your daily habits from the terminal, and watch your streaks grow.

**Kind:** a command-line tool, installed as a real command.

**Must-haves:**
- Add and remove habits (drink water, read, stretch...).
- Mark a habit as done today: `habits done read`.
- `habits list` shows every habit, whether it's done today, and its current streak: the number of days in a row.
- Everything saved in SQLite, so the history survives.
- Clear errors for a habit that doesn't exist, or one marked done twice in a day.

**Nice-to-haves:** the best streak ever, a seven-day grid for each habit, habits that only count on weekdays, a `--today` time-travel option like chapter 38's, colours with rich, an export to CSV.

**Uses:** argparse sub-commands (24), dates (22), dataclasses (30), SQLite (42), tests (36), the src layout and a real command (39).

If you built a habit tracker in the [JavaScript](../../JavaScript/52-final-project/exercises.md) or [React](../../React/41-final-project/exercises.md) final project, build it the Python way, then compare the two plans. What changed, and what didn't?

<details>
<summary>Hint 1</summary>

Store one row for each habit on each day it was done (a fact), never the streak itself (worked out). Then write the streak as a pure function that takes the done dates and today's date, and test it before it goes anywhere near the command line. Try the awkward cases: nothing done yet, a streak that ended last week, and done yesterday but not *yet* today. Is that last streak broken? Decide, and write your decision down as a test.

</details>

<details>
<summary>Hint 2</summary>

"Done twice in one day" is a rule the database can enforce for you: a rule over two columns together, `UNIQUE (habit_id, done_on)`, at the end of the `CREATE TABLE` ([PostgreSQL chapter 13](../../PostgreSQL/13-constraints/notes.md) shows two-column rules). Then catch the `sqlite3.IntegrityError` in your storage module and turn it into your own exception, as Cake Day does with duplicate names.

</details>

---

## Exercise 2 (Easy): Spending Report

Turn your bank's CSV export into a monthly report of where the money went.

**Kind:** a data script.

**Must-haves:**
- Read a CSV of transactions: date, description, amount. Start with a made-up sample of 30 or so rows, shaped like your bank's export.
- Clean it: real dates, amounts in whole cents, money in kept apart from money out.
- Give each transaction a category, using rules from a file you can edit (anything with `TESCO` or `LIDL` in the description is food, say).
- A report for one month, chosen with `--month 2026-09`: the total for each category, biggest first, plus the total in and the total out.
- Save the report as an Excel file or a CSV.

**Nice-to-haves:** a bar chart saved as a PNG (the matplotlib tip at the end of chapter 44's "The same job, two ways"), this month next to last month, a warning for any single spend over a limit, a list of transactions that matched no rule.

**Uses:** CSV (21), regular expressions for the rules (35), pandas (44), argparse (24), tests (36).

> **Watch out:** Your real bank data never goes into Git, or into your tests. Make a sample of made-up rows for the repository, and add the real files to `.gitignore`.

<details>
<summary>Hint 1</summary>

Every bank's export is different: the date format, one amount column with minus signs or separate columns for in and out, sometimes even the text encoding. Open yours and look before you plan. Then write one loading function that hides all of that, and hands back the same clean shape whatever the bank. Only that function changes if you switch banks.

</details>

<details>
<summary>Hint 2</summary>

The categorising rule is the logic that matters, and it doesn't need pandas at all. Make it a plain function that takes one description and the rules, and test it with strings like `"CARD PAYMENT TESCO STORES 3021"`. Then pandas can call it for every row.

</details>

---

## Exercise 3 (Medium): Recipe Box API

Your own recipes, behind a FastAPI service, searchable by what's in your fridge.

**Kind:** a web API.

**Must-haves:**
- Add, list, show, change and delete recipes: title, minutes, servings, ingredients and steps.
- Search by ingredient: `GET /recipes?ingredient=garlic`.
- "What can I cook?": `GET /cook?have=rice,egg,onion` lists recipes in order of how few ingredients are missing, and says which ones.
- SQLite, with recipes in one table and their ingredients in another.
- Tests with `TestClient` and a fresh test database for each test, like chapter 46.

**Nice-to-haves:** scale a recipe to more servings, import a recipe from TheMealDB (`https://www.themealdb.com/api/json/v1/1/search.php?s=dal`), a React front end ([React course](../../React/README.md)), deploy it (53).

**Uses:** FastAPI and Pydantic (43), SQLite (42), the dependency and test setup from 46, the Repository pattern (51), deploying (53).

<details>
<summary>Hint 1</summary>

One recipe has many ingredients: that's a one-to-many relationship, like gift ideas pointing at a person in the notes ([PostgreSQL chapter 16](../../PostgreSQL/16-relationships-and-foreign-keys/notes.md)). And clean every ingredient name in one function before it's saved or searched for, so `"Garlic "` and `"garlic"` match.

</details>

<details>
<summary>Hint 2</summary>

"What's missing?" is a set question ([chapter 12](../12-tuples-and-sets/notes.md)): the recipe's ingredients minus the ones you have. Write that as a pure function and test it, then sort the recipes by how many are missing with `key=` ([chapter 34](../34-functional-tools/notes.md)).

</details>

---

## Exercise 4 (Medium): Price Watcher

Watch the prices of a few books, and get told when one drops to your target.

**Kind:** a scraper with a report, running on a schedule.

Practise on **Books to Scrape** (`https://books.toscrape.com`), the pretend bookshop from [chapter 41](../41-web-scraping/notes.md).

**Must-haves:**
- A watch list: each book's page address and your target price, in a file you can edit.
- Fetch each page politely, with chapter 41's rules (say who you are, pause between pages), and read the price into whole pence.
- Save every price with the date it was seen, so you build up a price history.
- An alert when a price is at or below its target: printed, and written to a log file ([chapter 37](../37-debugging-and-logging/notes.md)).
- Runs by itself every morning, with Task Scheduler ([chapter 45](../45-automating-tasks/notes.md)).

**Nice-to-haves:** an email alert (look up the standard library's `smtplib`, and keep the password in a `.env` file, [chapter 52](../52-security-basics/notes.md)), a chart of a book's price history (44), a `report` command with each book's lowest price ever, watching a real shop (read its terms and `robots.txt` first, and look for an API).

**Uses:** requests and BeautifulSoup (40, 41), SQLite (42), logging (37), scheduling (45), secrets (52).

<details>
<summary>Hint 1</summary>

Books to Scrape's prices never change: it's built for practice. So to see your alert fire, set one target above the current price. And test the "has it dropped to the target?" logic with made-up price history in a test, not with the real site.

</details>

<details>
<summary>Hint 2</summary>

A scheduled task doesn't start in your project folder, and it doesn't activate anything, so remember chapter 45's two rules. If your watcher is installed as a command, the scheduler runs the `.exe` in your `.venv\Scripts` folder by its full path. And its data file needs a fixed home, like Cake Day's `Path.home()`.

</details>

---

## Exercise 5 (Medium): Weather Diary

Collect your city's weather every day, and chart each month.

**Kind:** an automation that feeds a data report.

It uses Open-Meteo, from [chapter 40](../40-working-with-apis/notes.md). Here are the two kinds of address you'll need, for Kathmandu (put in your own city's latitude and longitude):

- The last few days: `https://api.open-meteo.com/v1/forecast?latitude=27.7&longitude=85.32&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&past_days=7&forecast_days=1&timezone=auto`
- Older days, for filling in the past: `https://archive-api.open-meteo.com/v1/archive?latitude=27.7&longitude=85.32&start_date=2026-09-01&end_date=2026-09-30&daily=temperature_2m_max,precipitation_sum&timezone=auto`

**Must-haves:**
- Fetch yesterday's highest and lowest temperature and its rainfall, and save one row per day in SQLite.
- Safe to run twice: the same day is never saved twice.
- Fill in a past month from the archive.
- A monthly report: the warmest day, the coldest night, the wettest day, the average high and the total rain.
- A chart of the month, saved as a PNG.
- Runs by itself every morning ([chapter 45](../45-automating-tasks/notes.md)).

**Nice-to-haves:** two cities side by side, this month next to the same month last year, a FastAPI endpoint that serves the diary as JSON, fetching several cities at once with async ([chapter 47](../47-async-python/notes.md)).

**Uses:** requests (40), dates (22), SQLite (42), pandas and a chart (44), scheduling (45).

<details>
<summary>Hint 1</summary>

Open one address in your browser first and read the answer. Under `daily`, each value is a list, and the lists line up: the first temperature belongs to the first date. `zip()` ([chapter 12](../12-tuples-and-sets/notes.md)) pairs them up. And `timezone=auto` makes "a day" mean a day in that city, not in UTC.

</details>

<details>
<summary>Hint 2</summary>

Make the day the table's primary key, so the database refuses a second row for it. Then decide what *should* happen when the same day arrives twice (keep the old numbers, or replace them with the new ones?). For "replace", SQLite's **upsert**, `INSERT ... ON CONFLICT (day) DO UPDATE SET ...`, is worth looking up.

</details>

---

## Exercise 6 (Challenge): Link Checker

Find every broken link in a folder of Markdown notes. A folder like this one.

**Kind:** a command-line tool that does many slow things at once.

**Must-haves:**
- `linkcheck docs` finds every `.md` file in a folder and all its subfolders.
- It finds the links in each file (`[text](target)`) with a regular expression.
- Links to other files are checked on disk, relative to the file they're in.
- Web links are checked with `httpx.AsyncClient`, many at once but never more than about 10 at a time, each with a timeout.
- Each web address is checked only once, even if twenty files use it.
- Every broken link is reported with its file and line number, and the exit code is `1` if anything is broken, so other programs (like CI) can tell.

**Nice-to-haves:** an `--offline` option that skips web links, remembering good web links for a day, checking `#section` links, a GitHub Actions workflow that runs it on every push (53), timing the async version against a plain loop (49).

**Uses:** `pathlib` and `rglob` (20, 45), regular expressions (35), argparse and exit codes (24), async with a `Semaphore` (47), measuring (49), tests with `tmp_path` (36).

<details>
<summary>Hint 1</summary>

Split "find the links" from "check them". Finding is pure: text in, a list of links out, easy to test with a few strings. Checking files on disk is easy to test with a tiny folder in `tmp_path` (one good link, one broken one). Keep the network out of almost every test.

</details>

<details>
<summary>Hint 2</summary>

Links come in more than one shape. `[text](target)` is the common one, but `<https://...>` exists too, and examples inside code blocks shouldn't count at all. Start with the common shape, and add the others as later slices. On the web side, some sites answer `403` or `429` to programs even when the page is fine, so decide which status codes really mean "broken", and say who you are with a `User-Agent`, like in [chapter 41](../41-web-scraping/notes.md).

</details>

---

## Exercise 7 (Challenge): The Library, Online

Turn your library system from [chapter 38](../38-project-library-system/notes.md) into a web API with a React front end, live on the internet.

**Kind:** a mix: a web API, a front end, and a deployment.

**Must-haves:**
- FastAPI endpoints for books, members and loans: list and search the books, lend, return, and the overdue list with fines.
- The rules from chapter 38 stay exactly the same. Reuse your models and your `LibraryError` family, and turn each kind of error into the right status code (a book that doesn't exist is a 404, a book that's already on loan is a 409 Conflict).
- SQLite on your computer, PostgreSQL once it's deployed ([chapters 42](../42-databases/notes.md) and [53](../53-deploying/notes.md)).
- Tests for every rule, each with its own test database (46).
- A React page that lists the books and where they are, with a form to lend one ([React chapter 18](../../React/18-fetching-data/notes.md), or TanStack Query from [chapter 31](../../React/31-tanstack-query/notes.md)).
- Deployed: the API with Docker on a cloud host (53), the front end on Netlify ([React chapter 40](../../React/40-deploying/notes.md)), and CORS set to the front end's real address.

**Nice-to-haves:** logins for librarians (52), reservations (chapter 38's exercise 5), a members page, CI.

**Uses:** 38, 42, 43, 46, 51, 52, 53, and the React course.

<details>
<summary>Hint 1</summary>

Look up `@app.exception_handler` in FastAPI's guide to handling errors: <https://fastapi.tiangolo.com/tutorial/handling-errors/>. One small function can turn every `LibraryError` into a JSON error with the right status code, so your endpoints don't need a `try`/`except` each.

</details>

<details>
<summary>Hint 2</summary>

Hide the database behind a repository with a `Protocol` ([chapter 51](../51-design-patterns/notes.md)): a SQLite one, a PostgreSQL one, and an in-memory one for fast tests. The library's rules never know which one they're talking to.

</details>

---

## Exercise 8 (Challenge): Publish a Package

Make a small library that other people can `pip install`, and release it properly.

**Kind:** a library: code that other people import into *their* programs.

Some ideas: money helpers in whole cents (formatting, reading `"12.50"`, splitting a bill fairly: grow chapter 39's `tipcalc`), a generator of fake test data, a unit converter, a tiny text-table printer.

**Must-haves:**
- The src layout and `pyproject.toml` from [chapter 39](../39-project-structure-and-packaging/notes.md), with loose rules for any dependencies (or none).
- Type hints on everything, checked by mypy, plus an empty file called `py.typed` in the package folder, so that other people's mypy uses your hints too.
- Tests for every public function, and a README whose examples really work.
- CI on every push: Ruff, mypy and pytest ([chapters 50](../50-clean-code-and-style/notes.md) and [53](../53-deploying/notes.md)).
- Version 0.1.0 published on TestPyPI, then installed from TestPyPI into a brand-new virtual environment, to prove it works.

**Nice-to-haves:** a `CHANGELOG.md`, a 0.2.0 release that adds a feature without breaking anything, CI that tests on Python 3.12 and 3.13, publishing to the real PyPI with Trusted Publishing, so no upload token is stored anywhere (<https://docs.pypi.org/trusted-publishers/>).

**Uses:** type hints (25), tests (36), packaging and versions (39), Ruff and pre-commit (50), CI (53).

<details>
<summary>Hint 1</summary>

Choose the name first, and check it's free on both PyPI and TestPyPI before you write any code. Remember chapter 39's dash-and-underscore rule, and its rule that every upload needs a new version number.

</details>

<details>
<summary>Hint 2</summary>

`py.typed` sits next to `__init__.py`, and it really is empty: its being there is the whole message. Hatchling packs it into the wheel by itself. A wheel is a zip file (chapter 39), so look inside yours and check.

</details>

---

## Bring your own idea

Have something you'd rather build? Great. That's usually the project you'll finish. Before you start, check it against the notes:

1. **Say it in one sentence**, with no more than one "and".
2. **Name its kind**, from step 1's table. If it's a mix, pick the part to build first.
3. **Write the must-have list.** Five to eight items. If it's twenty, cut it in half, then in half again.
4. **Fill in the stored-or-worked-out table** from step 3. If you can't place something, ask Claude about it before you write any code.
5. **Check any API.** Is it free? Does it need a key? Try one address in your browser before you plan around it. A key goes in an environment variable or a `.env` file, never in your code or in Git ([chapter 52](../52-security-basics/notes.md)).
6. **Scraping?** Read the site's terms and its `robots.txt` first, and look for an API ([chapter 41](../41-web-scraping/notes.md)).
7. **Personal data?** Yours or other people's, it stays out of Git and out of your logs.

---

## When you're done

- **Share it.** Ask a friend to install it or open it using only your README, and watch without helping. Where do they get stuck?
- **Ask Claude for a review** of the whole project, using the request in step 10 as a starting point.
- **Write down three things:** one decision you're glad you made, one you'd make differently, and what you'd build next.

Then pick another idea. Every project you finish makes the next one easier.
