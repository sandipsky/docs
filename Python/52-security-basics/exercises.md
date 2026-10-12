# 52 Security Basics: Exercises

**How to do these:**

- Make a new folder for each exercise in this chapter's folder (`ex1`, `ex2`, and so on), and open a terminal in it. Run each one with `python ex1.py` (or the file name the exercise gives).
- Use a virtual environment ([chapter 23](../23-pip-and-virtual-environments/notes.md)). Between them, the exercises need `python-dotenv`, `"pwdlib[argon2]"`, `bandit`, `pip-audit`, `"fastapi[standard]"`, `pytest`, `httpx2` and `mypy`. Install each one when an exercise asks for it.
- Every value in these exercises that looks like a key or password is fake. Keep it that way: never paste a real key into a practice file.
- Put type hints on every function, and finish each exercise with `python -m mypy` saying `Success`.
- Tokens, PINs and hashes are random, so some of your output will be different from the examples. Each exercise says which lines.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): A secrets toolbox

Riverside Bank needs four small helpers. Write them in `ex1.py`, using only the `secrets` module:

- `reset_link(site: str) -> str` returns a password-reset link: the site, then `/reset?token=`, then a token from `secrets.token_urlsafe(32)`.
- `card_pin() -> str` returns a 4-digit PIN as text. `"0042"` is a perfectly good PIN, so leading zeros must stay.
- `passphrase(words: list[str], count: int = 4) -> str` picks `count` random words from the list and joins them with dashes, like `river-lamp-otter-comet`.
- `codes_match(sent: str, expected: str) -> bool` compares a code the user typed with the real one, safely.

Test code:

```python
WORDS = ["apple", "river", "tiger", "lamp", "cloud", "maple", "otter", "piano",
         "rocket", "garden", "violet", "kettle", "harbor", "pepper", "comet", "zebra"]

link = reset_link("https://bank.example.com")
print(link)
print(len(link), link.startswith("https://bank.example.com/reset?token="))
pin = card_pin()
print(pin, len(pin) == 4 and pin.isdigit())
print(passphrase(WORDS))
print(passphrase(WORDS, count=6).count("-"))
print(codes_match("042917", "042917"), codes_match("042917", "042918"))
pins = [card_pin() for _ in range(1000)]
print(all(len(p) == 4 for p in pins), any(p.startswith("0") for p in pins))
```

One run gave this. Lines 1, 3 and 4 will be different for you, every time. The rest must match exactly:

```
https://bank.example.com/reset?token=BfOCJP4V15FpQGelQvL1AM9T0a1vwfO7UT4SFQ2Q2JY
80 True
5038 True
harbor-zebra-piano-kettle
5
True False
True True
```

The last line checks the leading zeros: out of 1000 PINs, every one has 4 digits, and some start with `0`.

Then answer in a comment: why would `random.randint(1000, 9999)` be wrong here for **two** different reasons?

<details>
<summary>Hint 1</summary>

The table in the notes' `secrets` section has a row for each job. `secrets.randbelow(10_000)` gives a number from 0 to 9999.

</details>

<details>
<summary>Hint 2</summary>

To keep leading zeros, format the number: `f"{number:04}"` pads it with zeros to 4 digits. For the passphrase, a generator expression inside `"-".join(...)` works nicely.

</details>

---

## Exercise 2 (Easy): The cafe's settings

The Riverside Cafe's ordering app has been keeping its payment key in the code. Move it out.

1. In your `ex2` folder, make a `.env` file (the key is fake):

   ```
   # Riverside Cafe settings for THIS computer. Never commit this file.
   CAFE_NAME=Riverside Cafe
   PAYMENT_API_KEY=fake-pay-key-for-practice-7781
   MAX_ORDER_CENTS=20000
   ```

2. Make a `.env.example` with the same names, and an empty `PAYMENT_API_KEY=`. Make a `.gitignore` that keeps out `.env`, `.venv/` and `__pycache__/`.
3. Write `settings.py`, a settings module like the one in the notes. It loads `.env`, and has:
   - `require(name: str) -> str`, which stops the program with a clear `RuntimeError` if a setting is missing or empty,
   - `require_int(name: str) -> int`, which also stops it if the value isn't a whole number,
   - `masked(secret: str) -> str`, which hides everything but the last 4 characters behind `*`,
   - and the settings themselves: `CAFE_NAME` (with `"My Cafe"` if it's missing), `PAYMENT_API_KEY` (required) and `MAX_ORDER_CENTS` (a required whole number).
4. Use this `cafe.py`:

   ```python
   import settings

   print(f"Welcome to {settings.CAFE_NAME}!")
   print(f"Payments key: {settings.masked(settings.PAYMENT_API_KEY)}")
   print(f"Largest order: ${settings.MAX_ORDER_CENTS / 100:.2f}")
   ```

`python cafe.py` prints:

```
Welcome to Riverside Cafe!
Payments key: **************************7781
Largest order: $200.00
```

Now try to break it. Empty the `PAYMENT_API_KEY=` line in `.env`, and the program ends with:

```
RuntimeError: PAYMENT_API_KEY is not set. Add it to .env or to the environment.
```

Put the key back, and change the last line to `MAX_ORDER_CENTS=two hundred`:

```
RuntimeError: MAX_ORDER_CENTS must be a whole number, not 'two hundred'
```

Put `20000` back. Then check that a real environment variable wins over `.env`:

```
$env:PAYMENT_API_KEY = "from-the-terminal-0042"
python cafe.py
```

The second line is now `Payments key: ******************0042`. Run `Remove-Item Env:PAYMENT_API_KEY` afterwards. (In Command Prompt, it's `set PAYMENT_API_KEY=from-the-terminal-0042` and `set PAYMENT_API_KEY=`.)

Finally, make sure Git agrees: run `git init`, then `git status --short`. You should see these four, and **no** `.env`:

```
?? .env.example
?? .gitignore
?? cafe.py
?? settings.py
```

<details>
<summary>Hint 1</summary>

`require_int` can call `require` first, then try `int(...)` inside `try`/`except ValueError` ([chapter 18](../18-error-handling/notes.md)), and raise the `RuntimeError` from the `except` block.

</details>

<details>
<summary>Hint 2</summary>

For `masked`, string repetition from [chapter 06](../06-strings/notes.md) does it: as many `"*"` as there are characters minus 4, then the last 4 characters with a slice.

</details>

---

## Exercise 3 (Medium): A safe e-book reader

The Riverside Library's website lets members read the first line of an e-book by typing its file name. Set up your `ex3` folder like this:

- A folder `ebooks`, with two files: `moby-dick.txt`, whose first line is `Call me Ishmael.`, and `pride-and-prejudice.txt`, whose first line is `It is a truth universally acknowledged...`.
- Next to `ebooks` (not inside it), a `.env` file with one fake line: `LIBRARY_ADMIN_KEY=fake-admin-key-000`. That's the file an attacker would love to read.

Write `open_ebook(name: str) -> str` in `ex3.py`. It returns the first line of the e-book, and raises `ValueError` with a clear message otherwise. It has **two** layers of protection, checked in this order:

1. **An allow-list:** the name must match the pattern `[a-z0-9-]+\.txt` completely (lowercase letters, digits and dashes, then `.txt`). Otherwise: `not a valid e-book name: '...'`.
2. **A folder check:** the resolved path must still be inside the `ebooks` folder. Otherwise: `outside the e-books folder: '...'`.

And if the file doesn't exist: `no such e-book: '...'`.

Test code:

```python
requests_from_users = [
    "moby-dick.txt",
    "pride-and-prejudice.txt",
    "../.env",
    "C:/Windows/win.ini",
    "Moby-Dick.TXT",
    "dracula.txt",
    "",
]
for name in requests_from_users:
    try:
        print(f"OK: {open_ebook(name)}")
    except ValueError as e:
        print(f"Refused: {e}")
```

Expected output:

```
OK: Call me Ishmael.
OK: It is a truth universally acknowledged...
Refused: not a valid e-book name: '../.env'
Refused: not a valid e-book name: 'C:/Windows/win.ini'
Refused: not a valid e-book name: 'Moby-Dick.TXT'
Refused: no such e-book: 'dracula.txt'
Refused: not a valid e-book name: ''
```

**Part 2: why both layers?** Layer 1 caught almost everything, so is layer 2 just extra work? Comment out the allow-list check, and run it again. **Predict first**, in a comment: which lines will change?

Here's what really happens on Windows:

```
OK: Call me Ishmael.
OK: It is a truth universally acknowledged...
Refused: outside the e-books folder: '../.env'
Refused: outside the e-books folder: 'C:/Windows/win.ini'
OK: Call me Ishmael.
Refused: no such e-book: 'dracula.txt'
```

and then a crash, ending with `PermissionError: [Errno 13] Permission denied:` and the path of your `ebooks` folder.

Layer 2 still kept the secrets safe. But answer in comments: why did `Moby-Dick.TXT` open the book? (Windows and Macs ignore capital letters in file names by default; Linux doesn't.) Why did the empty name `""` crash instead of being refused? And what does that tell you about relying on just one check? Put the allow-list back when you're done.

<details>
<summary>Hint 1</summary>

Compile the pattern once at the top with `re.compile` and use `.fullmatch(name)` ([chapter 35](../35-regular-expressions/notes.md)): `fullmatch` only succeeds if the **whole** name fits the pattern, not just part of it.

</details>

<details>
<summary>Hint 2</summary>

Build the folder path once with `.resolve()`, exactly like `RECEIPTS` in the notes, and resolve the requested path too before calling `.is_relative_to()`. For the empty name: what is `ebooks / ""`?

</details>

---

## Exercise 4 (Medium): A security review

The Riverside Cinema's booking desk uses these helpers. They work, but they aren't safe. Save them as `cinema_booking.py` in your `ex4` folder:

```python
"""Helpers for the Riverside Cinema's booking desk. They work, but they aren't safe."""

import hashlib
import random
import sqlite3
import subprocess

STAFF_PASSWORD = "popcorn2026"


def is_staff(password: str) -> bool:
    return password == STAFF_PASSWORD


def booking_code() -> str:
    return "".join(random.choice("ABCDEFGHJKMNPQRSTUVWXYZ23456789") for _ in range(8))


def hash_card_pin(pin: str) -> str:
    return hashlib.md5(pin.encode()).hexdigest()


def find_bookings(con: sqlite3.Connection, name: str) -> list[tuple[int, str]]:
    sql = f"SELECT id, film FROM bookings WHERE name = '{name}' ORDER BY id"
    return con.execute(sql).fetchall()


def archive_tickets(folder: str) -> None:
    subprocess.run(f"tar -czf tickets.tar.gz {folder}", shell=True)
```

**Part 1: your code.** Before running anything, list every problem you can see in a comment. Then install bandit and run `bandit cinema_booking.py`. It finds six issues:

| ID | Line | Severity |
|---|---|---|
| B404 (importing `subprocess`) | 6 | Low |
| B105 (a password in the code) | 8 | Low |
| B311 (`random` for something secret) | 16 | Low |
| B324 (MD5) | 20 | High |
| B608 (SQL built from a string) | 24 | Medium |
| B602 (`shell=True`) | 29 | High |

Did you find them all before bandit did? Now fix every one, using what the notes taught:

- The staff password comes from an environment variable called `STAFF_PASSWORD`, compared safely. If it isn't set, nobody is staff.
- Booking codes use `secrets`, with the same 31 letters and digits.
- The cinema shouldn't keep card PINs at all: the bank checks those. Replace `hash_card_pin` with `hash_member_password(password: str) -> str` for the members' website, using pwdlib.
- `find_bookings` uses a placeholder.
- `archive_tickets(folder: str) -> Path` makes the archive with Python's own tools, no command at all, and returns its path.

When you're done, bandit says `No issues identified.` Then check that it all still works with this `try_it.py`:

```python
import os
import sqlite3

from cinema_booking import booking_code, find_bookings, hash_member_password, is_staff

print(len(booking_code()))
print(is_staff("popcorn2026"))
os.environ["STAFF_PASSWORD"] = "popcorn2026"
print(is_staff("popcorn2026"), is_staff("Popcorn2026"))
print(hash_member_password("tiger-lily-42")[:10])
con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE bookings (id INTEGER PRIMARY KEY, name TEXT, film TEXT)")
con.executemany(
    "INSERT INTO bookings (name, film) VALUES (?, ?)", [("Maya", "Dune"), ("Leo", "Up")]
)
print(find_bookings(con, "Maya"))
print(find_bookings(con, "nobody' OR '1'='1"))
```

```
8
False
True False
$argon2id$
[(1, 'Dune')]
[]
```

(`os.environ["STAFF_PASSWORD"] = ...` sets the variable for this one run, the way your host's settings would. The second line is `False` because it isn't set yet.)

**Part 2: their code.** The cinema's website pins these packages in `requirements.txt`:

```
jinja2==3.1.2
markupsafe==2.1.5
```

Install pip-audit and run `pip-audit -r requirements.txt`. It reports something like this (newer problems may have been found since this was written, so your list may be longer):

```
Found 10 known vulnerabilities in 1 package
Name   Version ID              Fix Versions
------ ------- --------------- ------------
jinja2 3.1.2   PYSEC-2026-1473 3.1.3
jinja2 3.1.2   PYSEC-2026-1474 3.1.4
jinja2 3.1.2   PYSEC-2026-1475 3.1.5
jinja2 3.1.2   PYSEC-2026-1472 3.1.5
jinja2 3.1.2   PYSEC-2026-1471 3.1.6
...
```

Update the pins until `pip-audit -r requirements.txt` says:

```
No known vulnerabilities found
```

<details>
<summary>Hint 1</summary>

Every fix has a matching section in the notes: environment variables and `compare_digest` for the password, the `secrets` table for codes, pwdlib's `PasswordHash.recommended()` for passwords, placeholders for SQL, and Common mistake 4 for the archive.

</details>

<details>
<summary>Hint 2</summary>

`shutil.make_archive` returns the archive's path as a string, so wrap it in `Path(...)`. Notice that bandit's B404 warning goes away on its own once `subprocess` isn't imported any more.

</details>

<details>
<summary>Hint 3</summary>

For Part 2, look at the "Fix Versions" column: the pin must be at least the highest fix version listed. `python -m pip index versions jinja2` shows what's available. Updating markupsafe to its newest version too is a good habit.

</details>

---

## Exercise 5 (Challenge): Log in to the library

Build the login system from "How logins work" in the notes, as a small FastAPI app for the Riverside Library ([chapters 43](../43-building-a-web-api-with-fastapi/notes.md) and [46](../46-project-expense-tracker-api/notes.md)). Install `"fastapi[standard]"`, `"pwdlib[argon2]"`, `pytest`, `httpx2` and `mypy` in a venv in your `ex5` folder.

Keep everything in memory, in `main.py`, with two dictionaries:

```python
users: dict[str, str] = {}  # username -> password hash (never the password!)
sessions: dict[str, str] = {}  # token -> username
```

The rules:

- **`POST /signup`** takes JSON with `username` and `password`. A username is 3 to 20 lowercase letters or digits. A password is 10 to 128 characters. It stores the **hash**, and answers `201` with `{"username": "maya"}`. A taken name gets `409` and `{"detail": "Username taken"}`.
- **`POST /login`** takes the same JSON. If the user exists and the password is right, it makes a session token with `secrets.token_urlsafe(32)`, remembers it in `sessions`, and answers `{"token": "..."}`. Otherwise `401`, with **exactly the same** `{"detail": "Wrong username or password"}` whether the user is unknown or the password is wrong.
- **`GET /me`** reads the `Authorization: Bearer <token>` header, and answers `{"username": "maya"}`. A missing, badly shaped or unknown token gets `401` and `{"detail": "Not logged in"}`. Write the token check as a **dependency** with `Depends`, like `get_db` in chapter 46, so any future endpoint can reuse it.
- **`POST /logout`** forgets the token, and answers `204`.

Here's a session, made with `TestClient`, showing the status code and the JSON for each request:

```
POST /signup maya                      201 {'username': 'maya'}
POST /signup maya again                409 {'detail': 'Username taken'}
POST /signup "Leo!" / "short"          422 username: String should match pattern '^[a-z0-9]{3,20}$'
                                           password: String should have at least 10 characters
POST /login maya, wrong password       401 {'detail': 'Wrong username or password'}
POST /login zoe (no such user)         401 {'detail': 'Wrong username or password'}
POST /login maya                       200 a token of 43 characters
GET  /me with the token                200 {'username': 'maya'}
GET  /me with no token                 401 {'detail': 'Not logged in'}
POST /logout with the token            204
GET  /me with the same token           401 {'detail': 'Not logged in'}
```

And Maya's entry in `users` starts with `$argon2id$v=19$m=65536,t=3,p=4$`: a hash, not her password.

Then write `test_main.py` with at least seven tests, using a `client` fixture that empties both dictionaries first ([chapter 36](../36-testing-with-pytest/notes.md)): signing up, logging in and reading `/me`; the password not being stored; the same answer for a wrong password and an unknown user; a taken username; a short password; `/me` without a valid token; and logging out. `python -m pytest` should say `7 passed` (or more), and mypy `Success`.

Finally, answer in a comment: the sessions live in a dictionary. What happens to everyone's login when the server restarts ([chapter 43](../43-building-a-web-api-with-fastapi/notes.md) had the same problem with books)? Where would a real app keep them?

<details>
<summary>Hint 1</summary>

FastAPI reads a header when a parameter is marked with `Header()`: `authorization: Annotated[str | None, Header()] = None` gets the `Authorization` header, or `None`. `str.removeprefix("Bearer ")` cuts the start off.

</details>

<details>
<summary>Hint 2</summary>

Pydantic does the username and password rules for you: `Field(pattern=r"^[a-z0-9]{3,20}$")` and `Field(min_length=10, max_length=128)`. Those mistakes then get FastAPI's automatic `422`.

</details>

<details>
<summary>Hint 3</summary>

For the same answer every time, check both things in one `if`: `if stored is None or not password_hash.verify(...)`. And a dependency that raises `HTTPException(status_code=401, ...)` stops the request before the endpoint runs.

</details>

---

## Before you move on

You now have the habits that stop most real break-ins: secrets in environment variables, `secrets` for anything unguessable, slow salted hashes for passwords, input that never becomes instructions, checks on the server, and packages you keep an eye on.

They matter most the moment your app leaves your computer. In [chapter 53](../53-deploying/notes.md), you'll put the expense tracker from chapter 46 online, with its settings typed into the host's dashboard as real environment variables, and HTTPS from the host for free.
