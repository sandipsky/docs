# 52 Security Basics

## What is it?

**Security** means protecting your program, its data and its users from mistakes and from people who want to misuse it. That covers keeping passwords and keys secret, refusing input that tries to trick your code, and keeping the packages you depend on up to date.

It sounds like a job for experts, and the deep end is. But most real break-ins use the same handful of beginner mistakes, and avoiding them is mostly a matter of **habits**. This chapter collects those habits in one place, including several you've already met.

## Why does it matter?

Small mistakes have big, real costs:

- **A key pushed to GitHub gets found within minutes.** Bots search public code all day for API keys and passwords ([chapter 40](../40-working-with-apis/notes.md)). A leaked cloud key can run up a bill of thousands of dollars overnight.
- **A leaked table of plain-text passwords hurts people far beyond your app.** Most people reuse passwords, so the attacker tries them on email and bank accounts next.
- **One unchecked input can hand over the whole database**, like the SQL injection in [chapter 42](../42-databases/notes.md) that deleted every task.
- **An old package can carry a known hole**, published for anyone to read about and use.

The good news: the fixes are small, and you can make them automatic. Tools can even check some of them for you.

## Real-world example

Think about keeping a home safe. You don't need a vault. You need sensible habits, every day:

| Keeping your home safe | Keeping your program safe |
|---|---|
| Don't leave the key under the doormat | Keep secrets out of your code: environment variables and `.env` files |
| If a key is lost, change the locks | If a secret leaks, **rotate** it: cancel it and make a new one |
| A lock nobody can pick by guessing | Random tokens from `secrets`, not `random` |
| Valuables in a safe, not in a drawer | Passwords stored as slow, salted hashes, never as text |
| Look through the peephole before opening the door | Validate every input |
| Don't let a stranger decide which room they walk into | Never let input become code, SQL, commands or file paths (**injection**) |
| Keep the locks up to date | Update your packages, and check them with `pip-audit` |
| Don't tape your PIN to your card | Don't print or log secrets |

## How it works

### Secrets out of your code: environment variables

A **secret** is anything that would let a stranger act as you or your app: passwords, API keys, database passwords, signing keys. The rule from chapter 40 still stands: a secret never goes in your code, because code gets shared. Instead, it lives in an **environment variable**, and your code reads it with `os.environ`:

```python
import os

api_key = os.environ.get("WEATHER_API_KEY")
```

That works, but setting every variable by hand in every new terminal (`$env:WEATHER_API_KEY = "..."`) gets old fast, especially once a project has five settings. The usual answer is a `.env` file.

### `.env` files with python-dotenv

A **`.env` file** (say "dot env") is a plain text file in your project folder, with one setting per line. The package **python-dotenv** reads it and copies each line into `os.environ`, as if you'd typed them all into the terminal. Install it in your project's virtual environment ([chapter 23](../23-pip-and-virtual-environments/notes.md)):

```
python -m pip install python-dotenv
```

(The package is called `python-dotenv`, but you import it as `dotenv`. Careful: a different, old package called plain `dotenv` exists too. Copy package names from the official documentation, a habit you'll meet again later in this chapter.) This chapter was written with python-dotenv 1.2.

Make a file called `.env` in the project folder. The values here are fake, made up for practice:

```
# Settings and secrets for this computer only. Never commit this file!
EXPENSES_API_KEY=fake-key-for-practice-123
WEATHER_API_KEY=another-fake-key-456
DEBUG=true
```

No quotes, no spaces around the `=`, and lines starting with `#` are comments. Now a **settings module**: one file that reads every setting once, so the rest of the program never touches `os.environ`. It's the Python singleton from [chapter 51](../51-design-patterns/notes.md): a module, imported wherever it's needed. Save this as `settings.py`:

```python
"""The app's settings, from environment variables (and .env, if there is one)."""

import os

from dotenv import load_dotenv

load_dotenv()  # copies the lines in .env into os.environ (real variables win)


def require(name: str) -> str:
    """The value of a setting that must be there. Stops the program if it's missing."""
    value = os.environ.get(name)
    if not value:
        raise RuntimeError(f"{name} is not set. Add it to .env or to the environment.")
    return value


EXPENSES_API_KEY = require("EXPENSES_API_KEY")
WEATHER_API_KEY = require("WEATHER_API_KEY")
DEBUG = os.environ.get("DEBUG", "false").lower() == "true"
```

And a tiny `app.py` that uses it:

```python
import settings

print(f"Debug mode: {settings.DEBUG}")
print(f"API key loaded: {len(settings.EXPENSES_API_KEY)} characters")
```

```
Debug mode: True
API key loaded: 25 characters
```

A few things to notice:

- **`load_dotenv()` looks for `.env` next to your script**, and in the folders above it, so it works whichever folder you run it from.
- **Real environment variables win.** If `WEATHER_API_KEY` is already set in the terminal, `load_dotenv()` leaves it alone. That matters later: on a server ([chapter 53](../53-deploying/notes.md)), there's no `.env` file at all. You type the values into the host's settings page, they arrive as real environment variables, and the very same code picks them up.
- **Every value is a string.** `DEBUG=true` arrives as the text `"true"`, so `DEBUG` compares it with `"true"` to make a `bool`. A number needs `int(...)`.
- **Missing secrets stop the program straight away**, with a clear message. Empty the `WEATHER_API_KEY=` line in `.env`, and `python app.py` ends with:

  ```
  RuntimeError: WEATHER_API_KEY is not set. Add it to .env or to the environment.
  ```

  That's much better than starting up happily and failing an hour later, the first time someone asks for the weather.
- **The app never prints the key itself**, only its length. More on that in "Errors and logs".

> **Tip:** There's a package called `pydantic-settings` that does the same job with a Pydantic model ([chapter 43](../43-building-a-web-api-with-fastapi/notes.md)), so every setting gets a type and is checked. It's worth a look once your settings grow.

### Keep `.env` out of Git, and share `.env.example` instead

A `.env` file is only safe if it never leaves your computer. Add it to `.gitignore` ([chapter 23](../23-pip-and-virtual-environments/notes.md)), next to `.venv/`:

```
.env
.venv/
__pycache__/
```

But then how does Maya, who's working on the project with you, know which settings it needs? Commit a second file, **`.env.example`**, with the same names and no real values:

```
# Copy this file to .env, then fill in your own values.
EXPENSES_API_KEY=
WEATHER_API_KEY=
DEBUG=false
```

Check that Git agrees. In a project with `app.py`, `.env` and `.env.example`, `git status --short` lists all three as new (`??`):

```
?? .env
?? .env.example
?? app.py
```

Add `.env` to `.gitignore`, and run it again:

```
?? .env.example
?? .gitignore
?? app.py
```

`.env` has disappeared from the list. Git won't add it, even with `git add .`. Check before your first commit, every time.

### If a secret gets committed anyway

It happens to everyone eventually. Say `.env` went into a commit, and you then deleted it with `git rm --cached .env` and committed again. The file is gone from the project, but **Git's history still has it**. Anyone with a copy of the repository can ask for the old version:

```
git log --oneline
5af5821 Remove .env, add .gitignore
0eef3e2 First version

git show HEAD~1:.env
WEATHER_API_KEY=fake-key-for-practice-123
```

(`HEAD~1` means "one commit before the latest".) So the order matters:

1. **Rotate the secret first.** Go to the service's website, cancel (**revoke**) the leaked key, and make a new one. Put the new one in `.env`. Now the leaked one is useless, wherever it ends up. Don't skip this step because "nobody saw it": if the repository was ever public, assume a bot did.
2. **Then clean up**: add `.env` to `.gitignore` and remove it from the project. There are tools that rewrite Git's history to remove a file completely, but treat that as tidying up, not as the fix. Rotating is the fix.

> **Tip:** GitHub scans pushed code for many well-known kinds of keys, and may warn you or even block the push. That's a welcome safety net, but it can't recognise every secret (it has no idea your database password is a password). Your `.gitignore` is the real protection.

### The `secrets` module: random you can't guess

In [chapter 05](../05-numbers-and-math/notes.md), a Watch out said `random` is fine for games, but not for anything secret, and promised a separate module called `secrets`. Here it is.

**Why not `random`?** Its numbers *look* random, but they come from a formula. Know the starting point (the **seed**), and you know every number that follows:

```python
import random
import string

random.seed(2026)  # someone who knows (or guesses) the seed...
print("".join(random.choices(string.ascii_letters, k=12)))
random.seed(2026)  # ...gets exactly the same "random" code
print("".join(random.choices(string.ascii_letters, k=12)))
```

```
gAASflFCOCLN
gAASflFCOCLN
```

Same code twice, and the same two lines on every computer that runs this file. Even without a seed, someone who sees enough of `random`'s numbers can work out the formula's position and predict the next ones. That's fine for shuffling a quiz. It's a disaster for a password-reset link.

**`secrets`** gets its randomness from your operating system, which mixes in unpredictable things like tiny differences in hardware timing. Nobody can predict it, not even someone who knows how it works:

```python
import secrets
import string

print(secrets.token_urlsafe(16))  # for links, like a password-reset link
print(secrets.token_hex(16))  # the same idea, written with 0-9 and a-f
print(f"{secrets.randbelow(1_000_000):06}")  # a 6-digit code for a text message

alphabet = string.ascii_letters + string.digits
password = "".join(secrets.choice(alphabet) for _ in range(16))
print(password)
```

One run gave this. (Yours will be different. That's the whole point. Every run is different.)

```
qTBUiZsU3-IMuiLJTAnyNw
02a24ec2c5d5c54c52b22018369a420e
551686
CjaivOcEzQ0H29Dd
```

| You need | Use |
|---|---|
| A token for a link or a login (reset links, session tokens, API keys) | `secrets.token_urlsafe(32)` |
| The same, as letters 0-9 and a-f only | `secrets.token_hex(32)` |
| A number from 0 up to (not including) n, like a 6-digit code | `secrets.randbelow(n)` |
| A random pick from a list or string | `secrets.choice(items)` |

The number is how many random **bytes** go in (a byte is a number from 0 to 255, the unit computers store everything in). 32 bytes is a good size for anything that guards an account: there are more possible tokens than atoms in the Earth. `:06` pads the code with zeros, so `4071` shows as `004071`.

**Comparing secrets: `compare_digest`.** If you did the API key exercise in [chapter 46](../46-project-expense-tracker-api/exercises.md), you've used this already. `==` stops at the first letter that's different, so a wrong guess that starts with the right letters takes a tiny bit longer to reject. With enough patience and a stopwatch, an attacker can find a key letter by letter. `secrets.compare_digest` always takes the same time:

```python
import secrets

expected = "fake-key-for-practice-123"
print(secrets.compare_digest("fake-key-for-practice-123", expected))  # prints: True
print(secrets.compare_digest("guess", expected))  # prints: False
```

Use it whenever you compare something secret: API keys, tokens, codes. (It only accepts plain English letters, digits and symbols in strings. With anything else, like `"café"`, it raises `TypeError: comparing strings with non-ASCII characters is not supported`. Tokens from `secrets` never have that problem.)

### Passwords: never store them, store a hash

Sooner or later, an app needs users with passwords. The most important rule in this chapter: **never store the password itself.** Not as plain text, and not encrypted either.

- **Plain text** means that anyone who sees the database (an attacker, a backup left on a laptop, a curious employee) sees every password.
- **Encrypted** sounds safer, but encryption is designed to be undone with a key. If an attacker gets the database, they can often get the key too. And your app never needs to *know* the password. It only needs to *check* it.

The answer is a **hash**: a one-way fingerprint. A **hash function** turns any text into a long jumble of characters. The same input always gives the same jumble, but there's no way to turn the jumble back into the text. To check a login, you hash what was typed and compare the fingerprints.

Python's `hashlib` module has hash functions. Hash functions work on bytes, not `str`, so `.encode()` turns the text into bytes first (using UTF-8, as in [chapter 20](../20-files-and-folders/notes.md)), and `.hexdigest()` writes the answer as readable 0-9 and a-f:

```python
import hashlib

for user, password in [("maya", "tiger123"), ("leo", "tiger123"), ("zoe", "Tiger123")]:
    digest = hashlib.sha256(password.encode()).hexdigest()
    print(f"{user:<5} {digest}")
```

```
maya  3dbfc980dc71faf9ce9bb51a91bacd5f7b19a7c2669c9ba9411f6772cf8d9515
leo   3dbfc980dc71faf9ce9bb51a91bacd5f7b19a7c2669c9ba9411f6772cf8d9515
zoe   f403fa9e73ffe68e6f0a787a598a7744bad37712b187ce6f358d91bbcf749f23
```

One capital letter changes everything, which is good. But look at Maya and Leo: the same password gives the same hash, so anyone with the database can see they share a password. Worse, attackers keep huge ready-made lists of common passwords and their SHA-256 hashes, so `tiger123` is found by simply looking it up.

And SHA-256 is built to be **fast**. Here's how fast, guessing a million passwords:

```python
import hashlib
import time

start = time.perf_counter()
for number in range(1_000_000):
    hashlib.sha256(f"guess{number}".encode()).hexdigest()
elapsed = time.perf_counter() - start
print(f"1,000,000 guesses in {elapsed:.2f} seconds")
```

```
1,000,000 guesses in 0.74 seconds
```

(Your time will be different.) That's one ordinary laptop, in Python. Attackers use graphics cards that try **billions** of guesses a second. Fast is great for checking that a download isn't damaged. For passwords, fast is the enemy.

So a password hash needs two more things:

1. **A salt**: a random value, different for every user, mixed in before hashing and stored next to the hash. It isn't secret. It just makes Maya's hash and Leo's hash different, even with the same password, so ready-made lists are useless.
2. **Slowness on purpose**: a hash designed to take a noticeable moment and a good chunk of memory, such as **scrypt**, **bcrypt** or **Argon2**. One login waits a twentieth of a second, which nobody notices. An attacker trying billions of guesses waits for years.

The standard library has scrypt, so you can see the whole idea with nothing to install:

```python
import hashlib
import hmac
import secrets
import time


def hash_password(password: str) -> tuple[bytes, bytes]:
    """Return (salt, hash). Store both. Never store the password itself."""
    salt = secrets.token_bytes(16)  # 16 random bytes, different for every user
    digest = hashlib.scrypt(password.encode(), salt=salt, n=2**14, r=8, p=1)
    return salt, digest


def check_password(password: str, salt: bytes, digest: bytes) -> bool:
    """Hash the attempt with the same salt, and compare the results."""
    attempt = hashlib.scrypt(password.encode(), salt=salt, n=2**14, r=8, p=1)
    return hmac.compare_digest(attempt, digest)


maya_salt, maya_hash = hash_password("tiger123")
leo_salt, leo_hash = hash_password("tiger123")
print(maya_hash.hex()[:32])
print(leo_hash.hex()[:32])

print(check_password("tiger123", maya_salt, maya_hash))  # prints: True
print(check_password("Tiger123", maya_salt, maya_hash))  # prints: False

start = time.perf_counter()
check_password("guess", maya_salt, maya_hash)
print(f"One guess took {time.perf_counter() - start:.3f} seconds")
```

One run (the hashes are different every time, because the salts are random, and your time will differ too):

```
a864f463ab211203d5265dd02adb0e92
d56e2b99ae0e92d3a1b99d618b8033a2
True
False
One guess took 0.047 seconds
```

Maya and Leo now have different hashes for the same password. And one guess takes about 0.05 seconds instead of under a millionth of one: roughly 60,000 times slower for an attacker. (`n`, `r` and `p` are scrypt's "how slow and how much memory" settings. `hmac.compare_digest` is the same as `secrets.compare_digest`; both modules have it. `.hex()` writes bytes as 0-9 and a-f, and `[:32]` keeps the printout short.)

**For real apps, use a library.** The scrypt version shows the idea, but it leaves you choosing settings and storing two values. A password-hashing library does it all, and picks good settings for you. FastAPI's own documentation uses **pwdlib** with **Argon2**, the current recommended choice:

```
python -m pip install "pwdlib[argon2]"
```

```python
from pwdlib import PasswordHash

password_hash = PasswordHash.recommended()  # Argon2, with sensible settings

stored = password_hash.hash("tiger123")  # this is what goes in the database
print(stored)
print(password_hash.verify("tiger123", stored))  # prints: True
print(password_hash.verify("Tiger123", stored))  # prints: False
```

```
$argon2id$v=19$m=65536,t=3,p=4$ag2jv6/KDD+ecL7SVH75xw$YJp7rmA+3X3HCW8w39CIz1tC73dahH8Ua3Nct10VwjU
True
False
```

(Written with pwdlib 0.3. Your hash will be different, because the salt is random.) Read the stored string between the `$` signs: the method (`argon2id`), its version, its settings (64 MB of memory, 3 rounds, 4 lanes), the salt, and finally the hash. Everything needed to check a password later is in that one string, so it fits in one column of a database table. And if the recommended settings change in future, old hashes still say how they were made.

> **Tip:** You'll also see **argon2-cffi** used directly: `PasswordHasher().hash(password)`. Watch the argument order when you check: `hasher.verify(stored, password)`, with the hash first. And a wrong password doesn't return `False`: it raises `VerifyMismatchError: The password does not match the supplied hash`. pwdlib is built on top of it, with a friendlier shape.

### How logins work (in brief)

[Chapter 46](../46-project-expense-tracker-api/exercises.md)'s last exercise locked the API with one shared key, and promised that real logins with passwords would come later. Here's how they work. Building a complete login system is a big job, so this section gives you the shape, and the exercises build a small one.

1. **Sign up.** The user sends a username and password, over HTTPS. The server stores the username and the password **hash**. Never the password.
2. **Log in.** The user sends them again. The server finds the user's hash and checks the password against it. If the user doesn't exist **or** the password is wrong, the answer is the same: "Wrong username or password". A different message for each would tell an attacker which usernames are real.
3. **Hand out a token.** Nobody wants to send their password with every request. So after a good login, the server gives the user a token, and every later request carries it in a header: `Authorization: Bearer <token>` (the same header you sent in [chapter 40](../40-working-with-apis/notes.md)).

There are two common kinds of token:

| | Session token | Signed token (JWT) |
|---|---|---|
| What it is | A long random string, from `secrets.token_urlsafe(32)` | The user's details, plus a signature made with the server's secret key |
| How the server checks it | Looks it up in a table of active sessions | Checks the signature, no lookup needed |
| Logging out | Delete the row: the token stops working at once | Hard: it works until it expires |
| Everyday version | A cloakroom ticket: just a number, and the attendant looks up your coat | A festival wristband with a hologram: staff can check it's real at a glance, but can't cancel it |

For most apps you'll build, **session tokens are simpler and safer**. You'll still see **JWT** (JSON Web Token, say "jot") everywhere, including FastAPI's tutorials, so here's the honest version. A JWT is **signed, not secret**: anyone holding one can read what's inside. With the PyJWT package (`python -m pip install pyjwt`):

```python
from datetime import datetime, timedelta, timezone

import jwt

SECRET = "fake-signing-secret-for-practice"  # really: from an environment variable

expires = datetime.now(timezone.utc) + timedelta(minutes=30)
token = jwt.encode({"sub": "maya", "exp": expires}, SECRET, algorithm="HS256")
print(token)

# Anyone can read what's inside, without the secret. It's signed, not hidden!
print(jwt.decode(token, options={"verify_signature": False}))

# But only the server, with SECRET, can check the signature
print(jwt.decode(token, SECRET, algorithms=["HS256"])["sub"])  # prints: maya
try:
    jwt.decode(token, "someone-else-guessing-the-secret", algorithms=["HS256"])
except jwt.InvalidSignatureError as e:
    print(f"Rejected: {e}")  # prints: Rejected: Signature verification failed
```

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtYXlhIiwiZXhwIjoxNzkxNzk1NzYwfQ.2G7xTwK3k3c2h2Z-Bd-eas1FCMsYBVohMMnXqz01pnY
{'sub': 'maya', 'exp': 1791795760}
maya
Rejected: Signature verification failed
```

(Written with PyJWT 2.15. Your token is different, because the expiry time is different.) `"sub"` (subject) is who the token is about, and `"exp"` is when it stops working, as a count of seconds since 1 January 1970 (the usual way computers store a moment in time). So: never put anything secret inside a JWT, always pass `algorithms=[...]` when decoding, keep expiry times short, and keep the signing key in an environment variable, made with `secrets.token_urlsafe(32)`. (PyJWT even warns you, with an `InsecureKeyLengthWarning`, if the key is shorter than 32 bytes.)

Two more things every real login needs: a limit on wrong guesses (for example, five tries, then wait a minute), and HTTPS so passwords and tokens can't be read on the way. When you're ready to build one properly, FastAPI's [security tutorial](https://fastapi.tiangolo.com/tutorial/security/) walks through it with pwdlib and PyJWT. And for anything that handles real money or real people's data, consider a well-known login service instead of writing your own.

### The injection family: input must never become instructions

**Injection** is the name for one mistake that comes in many costumes: text from a user gets glued into something that Python, a database or the operating system will *run*, so the user gets to write part of your program. The fix is always the same idea: keep the data separate from the instructions.

**SQL** ([chapter 42](../42-databases/notes.md)). `f"DELETE FROM tasks WHERE title = '{title}'"` let `nothing' OR '1'='1` delete every task. The fix: placeholders (`?` in sqlite3, `%s` in psycopg), with the values passed separately. No exceptions.

**Commands** ([chapter 45](../45-automating-tasks/notes.md)). `subprocess.run(f"echo Hello {name}", shell=True)` let `Sandip & echo HACKED` run a second command. The fix: pass a list, and leave out `shell=True`. Better still, do the job in Python (`shutil`, `pathlib`) and run no command at all.

**File paths.** This one is new. Say a cafe app lets customers download their receipts, and builds the path from the name they ask for:

```python
from pathlib import Path

RECEIPTS = Path(__file__).parent / "receipts"


def read_receipt(name: str) -> str:
    """DON'T DO THIS: the name goes straight into the path."""
    return (RECEIPTS / name).read_text(encoding="utf-8")


print(read_receipt("order-1.txt"))  # what you meant
print(read_receipt("../.env"))  # what an attacker types
```

With a `receipts` folder holding `order-1.txt`, and the project's `.env` next to it:

```
Receipt 1: latte $3.50

EXPENSES_API_KEY=fake-key-for-practice-123

```

`..` means "the folder above" ([chapter 20](../20-files-and-folders/notes.md)), so `receipts/../.env` walked straight out of the receipts folder and handed over your secrets. This is called **path traversal**. It gets worse: joining an **absolute** path replaces everything before it, so `RECEIPTS / "C:/Windows/win.ini"` is simply `C:\Windows\win.ini`.

The fix: work out the real, full path with `.resolve()` (which also sorts out every `..`), then check that it's still inside the folder with `.is_relative_to()`:

```python
from pathlib import Path

RECEIPTS = (Path(__file__).parent / "receipts").resolve()


def read_receipt(name: str) -> str:
    """Read a receipt, but only from inside the receipts folder."""
    target = (RECEIPTS / name).resolve()  # the real, full path, with .. worked out
    if not target.is_relative_to(RECEIPTS):
        raise ValueError(f"not allowed: {name!r}")
    return target.read_text(encoding="utf-8")


print(read_receipt("order-1.txt"), end="")
for name in ["../.env", "..\\.env", "C:/Windows/win.ini"]:
    try:
        read_receipt(name)
    except ValueError as e:
        print(e)
```

```
Receipt 1: latte $3.50
not allowed: '../.env'
not allowed: '..\\.env'
not allowed: 'C:/Windows/win.ini'
```

(`"..\\.env"` is the Windows way of writing the same trick, with a backslash. Windows accepts both.) Even better is not to use the name as a path at all: look it up in your database, or allow only names that match a strict pattern, like `[a-z0-9-]+\.txt` with `re.fullmatch` ([chapter 35](../35-regular-expressions/notes.md)). Exercise 3 does both.

**`eval` and `exec`.** `eval(text)` runs text as a Python expression, and `exec(text)` runs it as Python code. It's tempting for a calculator:

```python
typed = "2 + 3 * 4"  # what a user typed into a "calculator"
print(eval(typed))  # prints: 14

typed = "__import__('os').listdir('.')"  # what an attacker types
print(eval(typed))
```

The second one listed the files in the folder, `['calc.py', 'eval_bad.py', 'notes.txt']`. It could just as easily have deleted them, or read `.env`. **Never call `eval` or `exec` on text that came from outside your program.** People have tried to make it safe by blocking certain words, and attackers have found ways around every attempt. If you need to read a Python-style list or dictionary from text, `ast.literal_eval` only understands plain values:

```python
import ast

print(ast.literal_eval("[350, 1299, 275]"))  # prints: [350, 1299, 275]
print(ast.literal_eval("{'tea': 225}"))  # prints: {'tea': 225}
ast.literal_eval("__import__('os').listdir('.')")
```

The last line is refused with `ValueError: malformed node or string on line 1: <ast.Call object at 0x...>`. For data from other programs, JSON ([chapter 21](../21-json-and-csv/notes.md)) is better still.

**`pickle`.** The standard library's `pickle` module can save almost any Python object to bytes and load it back. Handy, but loading a pickle can **run code**, because the file itself says what to call while it's being loaded:

```python
import pickle


class Surprise:
    """An attacker's class. __reduce__ tells pickle what to call when loading."""

    def __reduce__(self) -> tuple[object, tuple[str]]:
        return (print, ("This ran just because you loaded the file!",))


data = pickle.dumps(Surprise())  # the attacker makes a "save file"...

pickle.loads(data)  # ...and you load it
```

```
This ran just because you loaded the file!
```

Here it only printed. A real attacker would call something nastier than `print`. So: only unpickle data that you made yourself and that nobody else could have changed. For anything that comes from users, the internet or another program, use JSON, which can only ever hold plain data. (The same warning applies to other "load any object" functions, like pandas' `read_pickle`.)

### Validate input: look through the peephole

Every value that arrives from outside (a form, a URL, a JSON body, a file, a command-line argument) might be wrong by accident or wrong on purpose. Check it at the door, before it gets near anything important. You've done this with Pydantic in [chapters 43](../43-building-a-web-api-with-fastapi/notes.md) and [46](../46-project-expense-tracker-api/notes.md). Two habits make those checks much stronger:

- **Allow-lists beat block-lists.** Don't try to list every bad value ("no quotes, no semicolons, no `DROP`..."): you'll never think of them all. List the good values instead, and refuse everything else. An enum ([chapter 30](../30-dataclasses-and-enums/notes.md)) or `Literal[...]` does exactly that. `Literal["latte", "croissant"]` (from `typing`) means "exactly one of these strings".
- **Limit sizes.** Without a maximum, someone can send a 100 MB "comment" or a list of a million tags, and your server spends its memory and time on it while everyone else waits. Give text a `max_length`, numbers a range, and lists a maximum length.

```python
from typing import Literal

from pydantic import BaseModel, Field, ValidationError


class Review(BaseModel):
    """A customer's review of a cafe dish."""

    dish: Literal["latte", "croissant", "dal bhat"]  # an allow-list: only these
    stars: int = Field(ge=1, le=5)
    comment: str = Field(max_length=500)
    tags: list[str] = Field(default_factory=list, max_length=5)


sent = {
    "dish": "latte'; DROP TABLE reviews; --",
    "stars": 50,
    "comment": "x" * 100_000,
}
try:
    Review.model_validate(sent)
except ValidationError as e:
    print(e)
```

```
3 validation errors for Review
dish
  Input should be 'latte', 'croissant' or 'dal bhat' [type=literal_error, input_value="latte'; DROP TABLE reviews; --", input_type=str]
    For further information visit https://errors.pydantic.dev/2.14/v/literal_error
stars
  Input should be less than or equal to 5 [type=less_than_equal, input_value=50, input_type=int]
    For further information visit https://errors.pydantic.dev/2.14/v/less_than_equal
comment
  String should have at most 500 characters [type=string_too_long, input_value='xxxxxxxxxxxxxxxxxxxxxxxx...xxxxxxxxxxxxxxxxxxxxxxx', input_type=str]
    For further information visit https://errors.pydantic.dev/2.14/v/string_too_long
```

All three problems are caught before any of your code runs. In a FastAPI endpoint, this is a 422 with no extra work.

And **always check on the server**. If you did the React course, your forms may already refuse a 6-star review in the browser. That's a kindness to honest users, nothing more: anyone can skip the browser and send any request they like with `requests` or `curl`. The server's checks are the only ones that count.

### HTTPS, and never `verify=False`

**HTTPS** (the padlock in the browser) does two jobs: it scrambles everything sent, so nobody on the café Wi-Fi can read passwords or tokens on the way, and it proves the server is who it claims to be, using a **certificate**: a digital ID card for the website. `requests` checks every certificate for you, and refuses to talk to a site whose certificate is wrong. The test site expired.badssl.com has a certificate that ran out years ago, on purpose:

```python
import requests

requests.get("https://expired.badssl.com/", timeout=10)
```

```
requests.exceptions.SSLError: HTTPSConnectionPool(host='expired.badssl.com', port=443): Max retries exceeded with url: / (Caused by SSLError(SSLCertVerificationError(1, '[SSL: CERTIFICATE_VERIFY_FAILED] certificate verify failed: certificate has expired (_ssl.c:1032)')))
```

Search the web for that error, and someone will suggest `verify=False`. It "works":

```python
import requests

response = requests.get("https://expired.badssl.com/", timeout=10, verify=False)
print(response.status_code)  # prints: 200
```

Even then, a warning appears: `InsecureRequestWarning: Unverified HTTPS request is being made to host 'expired.badssl.com'. Adding certificate verification is strongly advised.` With `verify=False`, your program will happily talk to *anyone* pretending to be that server, and hand over whatever it sends. That's like accepting any ID card at all, even one drawn in crayon. Fix the real cause instead: your computer's clock may be wrong, the site's certificate may really be broken (tell its owners), or, on a work network that inspects HTTPS, ask your IT team for the company's certificate and point the `REQUESTS_CA_BUNDLE` environment variable at it.

On your own side: only call APIs with `https://` addresses, and when your API goes online, serve it over HTTPS. Hosting services give you that for free ([chapter 53](../53-deploying/notes.md)).

### Dependencies: keep the locks up to date

Every package you install is code written by strangers, running with all the permissions your program has. Most of it is excellent. But bugs get found in popular packages every week, and once a hole is announced, attackers look for programs that still use the old version. Four habits:

1. **Pin your versions** in `requirements.txt` with `==` ([chapter 23](../23-pip-and-virtual-environments/notes.md)), so you always know exactly what you're running.
2. **Update regularly.** `python -m pip list --outdated` shows what's behind. Update one package at a time, and run your tests after each one ([chapter 36](../36-testing-with-pytest/notes.md)).
3. **Check the name before you install.** Attackers upload fake packages with names one typo away from popular ones (like `reqeusts` instead of `requests`), hoping someone mistypes. This is called **typosquatting**. Copy install commands from the official documentation, and if a package is new to you, look at its page on [pypi.org](https://pypi.org) first: how long it's been around, and whether it links to a real project.
4. **Check for known problems with `pip-audit`.**

**`pip-audit`** compares your packages with a public database of known security problems (called **vulnerabilities**). Install it into your project's virtual environment:

```
python -m pip install pip-audit
```

Then `pip-audit` on its own checks everything installed in the active virtual environment, and `pip-audit -r requirements.txt` checks a requirements file. Here's a `requirements.txt` from a project that hasn't been updated in a while. It's the same shape as `pip freeze` made in chapter 23, but with an older `requests`:

```
certifi==2026.7.22
charset-normalizer==2.0.12
idna==3.20
requests==2.28.0
urllib3==1.26.20
```

```
pip-audit -r requirements.txt
```

```
Found 20 known vulnerabilities in 2 packages
Name     Version ID              Fix Versions
-------- ------- --------------- ------------
requests 2.28.0  PYSEC-2023-74   2.31.0
requests 2.28.0  PYSEC-2023-74   2.31.0
requests 2.28.0  PYSEC-2026-1873 2.32.0
requests 2.28.0  PYSEC-2026-1872 2.32.4
requests 2.28.0  PYSEC-2026-2275 2.33.0
...
urllib3  1.26.20 PYSEC-2026-1999 2.5.0
urllib3  1.26.20 PYSEC-2026-4177 2.8.0
urllib3  1.26.20 PYSEC-2026-4175 2.8.0
```

(The `...` stands for 12 more lines like these. pip-audit printed some progress first, too.) Each row is one known problem: the package, your version, the problem's ID (search for it to read what it is), and the first version that fixes it. Some appear twice, because the database holds two write-ups of the same problem. Your list will be different: new problems are found all the time, which is exactly why you run it regularly, not just once.

`pip-audit -r` doesn't change your virtual environment: it makes a temporary one of its own to look at. To fix the problems, update the pins to versions at or above the fix versions (the newest ones from chapter 23's `pip freeze` will do), reinstall, run your tests, and audit again:

```
certifi==2026.7.22
charset-normalizer==3.5.2
idna==3.20
requests==2.34.2
urllib3==2.8.0
```

```
No known vulnerabilities found
```

**Checking your own code: `bandit`.** pip-audit checks other people's code. **Bandit** reads *your* code and points out risky lines, much like mypy points out type mistakes. Install it with `python -m pip install bandit` (this chapter used bandit 1.9). Here's a cafe admin script full of the mistakes from this chapter. Don't copy it!

```python
"""A small admin script for the cafe, with LOTS of security problems. Don't copy it!"""

import hashlib
import pickle
import random
import sqlite3
import subprocess

import requests

ADMIN_PASSWORD = "tiger123"


def find_orders(con: sqlite3.Connection, customer: str) -> list[tuple[int, str]]:
    return con.execute(f"SELECT id, item FROM orders WHERE customer = '{customer}'").fetchall()


def backup(folder: str) -> None:
    subprocess.run(f"tar -czf backup.tar.gz {folder}", shell=True)


def reset_code() -> str:
    return str(random.randint(100000, 999999))


def store_password(password: str) -> str:
    return hashlib.md5(password.encode()).hexdigest()


def load_settings(data: bytes) -> object:
    return pickle.loads(data)


def calculate(expression: str) -> object:
    return eval(expression)


def prices() -> object:
    return requests.get("https://example.com/prices.json", verify=False).json()
```

Save it as `shop_admin.py` and run:

```
bandit shop_admin.py
```

It prints a report for each problem. Here are two of them:

```
>> Issue: [B105:hardcoded_password_string] Possible hardcoded password: 'tiger123'
   Severity: Low   Confidence: Medium
   CWE: CWE-259 (https://cwe.mitre.org/data/definitions/259.html)
   More Info: https://bandit.readthedocs.io/en/1.9.4/plugins/b105_hardcoded_password_string.html
   Location: .\shop_admin.py:11:17
10
11	ADMIN_PASSWORD = "tiger123"
12

--------------------------------------------------
>> Issue: [B602:subprocess_popen_with_shell_equals_true] subprocess call with shell=True identified, security issue.
   Severity: High   Confidence: High
   CWE: CWE-78 (https://cwe.mitre.org/data/definitions/78.html)
   More Info: https://bandit.readthedocs.io/en/1.9.4/plugins/b602_subprocess_popen_with_shell_equals_true.html
   Location: .\shop_admin.py:19:4
18	def backup(folder: str) -> None:
19	    subprocess.run(f"tar -czf backup.tar.gz {folder}", shell=True)
20
```

and it ends with a summary:

```
Run metrics:
	Total issues (by severity):
		Undefined: 0
		Low: 4
		Medium: 4
		High: 3
```

Eleven issues in all, and it found every mistake in the file: the password in the code (B105), SQL built with an f-string (B608), `shell=True` (B602), `random` for a reset code (B311), MD5 for a password (B324), `pickle.loads` (B301), `eval` (B307), `verify=False` (B501), a request with no timeout (B113), and two warnings just for importing `pickle` and `subprocess` (B403, B404), which say "be careful with these". Each issue has:

- An **ID** like `B602`, and a link to a page explaining it.
- A **severity** (how bad it would be) and a **confidence** (how sure bandit is that it's a real problem). Bandit can't understand your program, only spot risky patterns, so some reports will be false alarms.
- The **file, line and column**, and the lines around it.

Check a whole project with `bandit -r src` (`-r` means "and every folder inside"). When bandit reports something you've checked and are sure is fine, you can add `# nosec B404` to the end of that line, with a comment saying why. Use it rarely: every `# nosec` is a door you've decided not to lock.

> **Tip:** If you set up Ruff in [chapter 50](../50-clean-code-and-style/notes.md), it can run the same checks: add `"S"` (for security) to the `select` list in `pyproject.toml`. `ruff check --select S shop_admin.py` finds nine of the same problems, one line each. For example, the `shell=True` line shows up as `S602`, with the message "subprocess call with shell=True identified, security issue".

### Errors and logs: don't hand out a map of the house

**Don't show tracebacks to users.** A traceback shows your folder names, your package versions and lines of your code: a map for an attacker. FastAPI already gets this right. When an endpoint crashes with an error you didn't catch, the caller gets status `500` and the body `Internal Server Error`, nothing more, while the full traceback goes to the server's terminal, where it belongs. Two ways to undo that, both of which you should avoid:

- **`FastAPI(debug=True)`**. In debug mode, a crash sends the **whole traceback** back to the caller, server paths and all, ending in lines like `return {"cents": PRICES[item]}` and `KeyError: 'cake'`. Handy for five minutes on your own computer, never on a real server.
- **Putting the error's text in your own answers**, like `HTTPException(status_code=500, detail=str(e))`. A database error message can contain table names and pieces of SQL. Log the details, and send the caller something short and boring: "Something went wrong".

**Don't log secrets** ([chapter 37](../37-debugging-and-logging/notes.md)). Log files get copied, emailed and uploaded. Log *that* something happened (`Login failed for maya`), never the password, the token, the API key or the `Authorization` header. If you must show which key is in use, show only the end of it, like `****7781`.

**CORS is not a security wall** ([chapter 43](../43-building-a-web-api-with-fastapi/notes.md)). CORS only tells **browsers** which web pages may read your API's answers. `requests`, `curl` and any script ignore it completely. So `allow_origins` keeps other websites from using your visitors' browsers against you, but it doesn't keep anyone out of your API. For that you need a real check on every request: an API key or a login.

### Where to go next: the OWASP Top 10

**OWASP** (the Open Worldwide Application Security Project) is a non-profit that publishes free guides about web security. Its most famous one is the **[OWASP Top 10](https://owasp.org/Top10/)**: the ten most common kinds of security problem in web apps, each with examples and ways to prevent them. The 2025 edition starts with broken access control (users reaching things that aren't theirs) and includes several things from this chapter: injection, weak password storage, problems in the packages you depend on, and careless error handling. Read one item a week, and look for it in your own code.

## Common mistakes

**1. Committing a secret**

```python
WEATHER_API_KEY = "fake-key-for-practice-123"  # "just for now"
```

"Just for now" becomes "in Git forever" the moment you commit. And deleting the line in the next commit doesn't help: `git show` brings it back. Fix: keep secrets in `.env` (with `.env` in `.gitignore`) or real environment variables from day one. If one ever leaks, **rotate it first**, then clean up.

**2. Using `random` for anything secret**

```python
reset_code = str(random.randint(100000, 999999))
```

It looks random, but it's predictable to anyone who learns the generator's state, and bandit flags it straight away: `B311: Standard pseudo-random generators are not suitable for security/cryptographic purposes`. Fix: `f"{secrets.randbelow(1_000_000):06}"`, or `secrets.token_urlsafe(32)` for anything in a link.

**3. Storing passwords as text, or with a fast hash**

```python
stored = hashlib.md5(password.encode()).hexdigest()
```

MD5 and SHA-256 are fast and unsalted, so the same password always gives the same hash, and attackers can try billions of guesses a second. MD5 is also broken in other ways, and bandit marks it `High`. Fix: `PasswordHash.recommended().hash(password)` from pwdlib, which salts and slows everything down for you.

**4. `shell=True` with anything from a user**

```python
subprocess.run(f"tar -czf backup.tar.gz {folder}", shell=True)
```

A folder named `x & del /q *` runs a second command. Fix: a list with no `shell=True` (`["tar", "-czf", "backup.tar.gz", folder]`), or better, Python's own tools: `shutil.make_archive("backup", "gztar", root_dir=folder)` ([chapter 45](../45-automating-tasks/notes.md)).

**5. `verify=False` to "fix" a certificate error**

It makes the error go away by switching off the one check that proves you're talking to the right server. Fix the cause (the clock, the certificate, your company's certificate in `REQUESTS_CA_BUNDLE`), never the check.

**6. Trusting checks done only in the browser**

Your React form only allows 1 to 5 stars, so the API doesn't check. Then someone skips the form, and sends a review with `"stars": -1000` straight to your API with `requests.post` ([chapter 40](../40-working-with-apis/notes.md)), and the average rating of your best dish drops below zero. Browser checks are for convenience. Fix: every rule is enforced on the server, with Pydantic `Field` rules, allow-lists and size limits.

**7. Unpickling data you didn't make**

```python
settings = pickle.loads(uploaded_file_bytes)
```

Loading a pickle can run any code the file's author chose. Fix: use JSON for anything that crosses into your program from outside. Keep `pickle` for your own files, on your own computer.

**8. Comparing secrets with `==`**

```python
if sent_key == expected_key:
```

It works, but it leaks timing: wrong guesses with more correct letters at the start take slightly longer to reject. Fix: `secrets.compare_digest(sent_key, expected_key)`.

## Quick recap

- Secrets live in environment variables, never in code. `python-dotenv`'s `load_dotenv()` reads them from a `.env` file, real variables win, and a settings module reads each one once with a clear error if it's missing. Put `.env` in `.gitignore` and commit a `.env.example`. If a secret leaks, rotate it first: Git's history keeps everything.
- `random` is predictable. Use `secrets`: `token_urlsafe(32)` for tokens, `randbelow` for codes, `choice` for passwords, and `compare_digest` to compare secrets.
- Never store passwords, not even encrypted. Store a slow, salted hash: pwdlib with Argon2 (`PasswordHash.recommended()`), not MD5 or SHA-256. Logins give the same error for a wrong user and a wrong password, then hand out a random session token. A JWT is signed, not secret.
- Injection is input becoming instructions: use placeholders for SQL, lists without `shell=True` for commands, `resolve()` plus `is_relative_to()` for paths, never `eval` or `exec` on input, and JSON instead of `pickle` for data from outside.
- Validate everything on the server, with allow-lists and size limits. Keep HTTPS checks on: never `verify=False`.
- Pin and update your packages, check names for typosquatting, and run `pip-audit` (known holes in packages) and `bandit` (risky lines in your code).
- Don't show tracebacks or log secrets. CORS only guides browsers; it doesn't lock your API. The OWASP Top 10 is your next reading list.

---

**Next:** try the [exercises](exercises.md), then move on to [53 Deploying](../53-deploying/notes.md).
