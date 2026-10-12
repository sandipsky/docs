# 53 Deploying

## What is it?

**Deploying** means putting your app on a computer that's always switched on and connected to the internet, so other people (and other programs) can use it. That computer is called a **host**.

You deployed a React app in [React chapter 40](../../React/40-deploying/notes.md). That was the easy kind: a folder of files that the host hands out. An API is different. It's a **program that has to keep running** on the host, waiting for requests, with its own settings and its own data.

In this chapter, you'll take the expense tracker API from [chapter 46](../46-project-expense-tracker-api/notes.md) all the way online: settings from the outside world, a rehearsal on your laptop, exact package versions, a **Docker** image (a box that runs the same everywhere), a cloud host, a React front end that talks to it, and a robot that checks every change.

An honest note before you start. Everything in this chapter that runs on your own laptop was run while writing it, with Python 3.13, FastAPI 0.143 and Ruff 0.17. Two parts were not: the Docker commands (Docker wasn't running on the computer used to write this) and the steps on the hosting website (that needs an account). Those parts were written carefully from the official documentation, and they're marked. Hosting companies also change their prices, free plans and dashboards often. If a button has moved, look for the same idea under a new name.

## Why does it matter?

An API that only runs on your laptop is useful to exactly one person. Your phone can't reach it. A friend can't use it. And a React app on Netlify can't reach `http://127.0.0.1:8000`, because that address means "this computer", and the visitor's computer has no API on it.

Running your app somewhere else also brings out bugs that `fastapi dev` hides:

- **Nobody can connect**, because the server only listens to its own computer.
- **The host can't find your app**, because it's listening on the wrong port.
- **Your data disappears** every time you deploy a new version.
- **It works on your laptop and crashes on the server**, because the server installed newer versions of your packages.
- **The browser blocks your React app**, because the CORS setting still says `localhost`.

You'll meet each of these, and fix them, in this chapter.

## Real-world example

Think about going from cooking at home to running a food truck. The recipes are the same. Everything around them changes.

| Running a food truck | Deploying your API |
|---|---|
| Cooking at home, just for yourself | `fastapi dev` on your laptop |
| The recipes written down exactly, with brands and amounts | A pinned `requirements.txt` |
| The plans for fitting out the truck's kitchen | A `Dockerfile` |
| A fitted-out truck, ready to drive anywhere | An image |
| The truck open and serving customers | A running container |
| A parking spot with power and a street address | A host, like Render, and your app's URL |
| Supplies and today's prices, delivered each morning | Environment variables |
| An inspector who knocks now and then: "still open?" | The health check |
| The order book, to look back at what happened | The logs |
| A locked storeroom that stays put when the truck drives off | A persistent disk, or a database server |

Whatever the truck needs to know about today (where it's parked, what things cost) comes from outside, every morning. It's never painted onto the truck.

## How it works

### What changes in production

**Production** is the real thing: the copy of your app that real people use. Here's what's different from your laptop:

| | On your laptop | In production |
|---|---|---|
| Start command | `fastapi dev app/main.py` | `fastapi run app/main.py` |
| Restarts when you save a file | Yes | No. The code only changes when you deploy. |
| Who can connect | Only this computer (`127.0.0.1`) | Anyone the host lets through (`0.0.0.0`) |
| Port | 8000, or whatever you choose | Whatever the host says, in a variable called `PORT` |
| Settings | Written in the code | **Environment variables** |
| Logs | Your terminal | The terminal output, collected by the host |
| Database | `expenses.db` next to the code | A disk that lasts, or a PostgreSQL server |
| CORS | `http://localhost:5173` | Your real front end's address |
| Package versions | Whatever was newest when you installed | Exact versions, the same every time |

The rest of the chapter goes through this table, row by row.

### Get the project ready

You'll deploy your finished chapter 46 project. Give it a home of its own, outside the `docs` folder, so it can become its own Git repository later ([React chapter 40](../../React/40-deploying/notes.md) explains why one app per repository is easiest):

1. Make a folder with a short path, like `C:\code\expense-api`. (A short path also avoids the Windows long-path problem from the Watch out in [chapter 43](../43-building-a-web-api-with-fastapi/notes.md).)
2. Copy in your `app` folder, your `tests` folder and `seed.py` from `my-expense-api`. **Leave `.venv` and `expenses.db` behind.** A virtual environment can't be moved ([chapter 23](../23-pip-and-virtual-environments/notes.md)), and your spending data isn't code.
3. Open a terminal in `C:\code\expense-api`. You'll make a new virtual environment in a moment, when you pin the packages.

### `fastapi run`: the production server

Back in [chapter 43](../43-building-a-web-api-with-fastapi/notes.md), a tip said that `fastapi run` starts the server without auto-reload, and that it's the version for running your app for real. Here are the differences:

| | `fastapi dev` | `fastapi run` |
|---|---|---|
| Auto-reload | On: it watches every file, and restarts when one changes | Off: it just serves |
| Listens on | `127.0.0.1` | `0.0.0.0` |
| Port | `8000`, or the `PORT` environment variable | The same |

Auto-reload is lovely while you're writing code, but on a server it's wasted effort. Nobody edits files there, and watching every file for changes costs memory and processor time. (`fastapi run --help` says it plainly: auto-reload is "resource intensive, use it only during development".)

The second row matters more than it looks. A computer can have several network addresses: `127.0.0.1` (which only the computer itself can use), its Wi-Fi address, and so on. A server **listens on** an address, which decides who can reach it:

- `127.0.0.1` means "only programs on this same computer may connect". Safe for practice, useless on a server.
- `0.0.0.0` means "accept connections on every address this computer has", so other computers can reach it too.

Think of a shop. Listening on `127.0.0.1` is a shop whose only door opens into the owner's own house. `0.0.0.0` opens the door onto the street. On a host, your app runs inside its own little computer, and the host's traffic comes in from outside it, so it has to be `0.0.0.0`.

And the port: hosts usually tell your app which port to use by setting an environment variable called `PORT`. `fastapi run` reads it for you. (So does `fastapi dev`, which will matter in a moment.)

### Settings from environment variables

Look at chapter 46's code for anything that should be different on a server. There are two:

```python
# database.py
DB_PATH = Path(__file__).parent.parent / "expenses.db"
```

```python
# main.py
    allow_origins=["http://localhost:5173"],
```

On a server, the database has to live on a disk that survives a redeploy, and the allowed origin must be your real website's address. You don't want to edit the code for each place it runs. Instead, read these settings from **environment variables**, like the API key in [chapter 40](../40-working-with-apis/notes.md) and the backup folder in [chapter 45](../45-automating-tasks/notes.md). The code stays the same everywhere, and each place gives it different settings, like the food truck's morning delivery.

Put every setting in one small new module, a **settings module** like `settings.py` in [chapter 52](../52-security-basics/notes.md): one file that reads each setting once, so the rest of the app never touches `os.environ`. Save it as `app/settings.py`:

```python
# Expense Tracker API: settings.py
# Every setting that changes between your laptop and a server lives here.
# Each one comes from an environment variable, with a default for your laptop.

import os
from pathlib import Path

# The project folder: the one with app, tests and requirements.txt in it
PROJECT_DIR = Path(__file__).parent.parent

# Where the SQLite file lives. On a server, point it at a disk that lasts.
DB_PATH = Path(os.environ.get("EXPENSES_DB", PROJECT_DIR / "expenses.db"))

# The web pages that may call the API (CORS), separated by commas
CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:5173").split(",")
```

Each setting has a **default** that's right for your laptop, so `fastapi dev` and your tests keep working without setting anything. `CORS_ORIGINS` can hold several origins, separated by commas, and `.split(",")` turns `"https://a.com,http://localhost:5173"` into a list of two.

Then use the settings. In `database.py`, delete the `DB_PATH = ...` line and its comment, and import it instead (keep `from pathlib import Path`, because `connect` still uses it):

```python
from app.models import Category, CategoryTotal, Expense, ExpenseIn, Summary
from app.settings import DB_PATH
```

In `main.py`, import `settings` next to `database`, and use it in the middleware:

```python
from app import database, settings
```

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Nothing else changes. `main.py` still never writes SQL, `database.py` still never mentions HTTP, and now `settings.py` is the one place to look for "what does this app need from the outside world?"

**Secrets** (passwords, API keys, a database address with a password in it) are settings too, and they always come from environment variables, never from code. On your laptop, a `.env` file can set them for you, and on a server, the host sets them. [Chapter 52](../52-security-basics/notes.md) covers `.env` files, `python-dotenv` and what to do if a secret leaks. This chapter's app has no secrets yet, but exercise 5 adds one. (Chapter 52's settings module also called `load_dotenv()`, and stopped with a clear error when a secret was missing. You can do both here too, once you have secrets.)

### Logs go to the terminal

On a server, nobody is watching your terminal. So where does the output go? Hosts and Docker collect everything your app writes to **standard output** and **standard error** (the two text streams from [chapter 24](../24-command-line-programs/notes.md)) and show it on a **Logs** page. That means a log file is the wrong idea in production: the host's disk may be wiped on every deploy, and nobody would look there anyway.

Uvicorn already logs every request. Add a few lines of your own, at the top of `main.py`, under the imports (add `import logging` to them):

```python
# Log to the terminal, never to a file: hosts collect what the app prints.
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(name)s: %(message)s")
logger = logging.getLogger(__name__)
logger.info("Database file: %s", settings.DB_PATH)
logger.info("CORS origins: %s", settings.CORS_ORIGINS)
```

This is [chapter 37](../37-debugging-and-logging/notes.md)'s rule: `basicConfig` once, in the main program. For a FastAPI app, `main.py` is the main program: it's the file the `fastapi` command loads. Without a `filename`, `basicConfig` writes to standard error, which is exactly what you want here.

Logging your settings when the app starts is a small habit that saves hours. When something is wrong on the server, the first lines of the log tell you which settings it really got. Only ever log settings that aren't secret. A database address with a password inside must never appear in a log ([chapter 37](../37-debugging-and-logging/notes.md) said this about passwords).

### A dress rehearsal on your laptop

Before a host runs your app, run it the way a host would. Pretend you're the host, and hand the app its settings through environment variables. In PowerShell, in the project folder, with your virtual environment active:

```
$env:PORT = "8053"
$env:EXPENSES_DB = "rehearsal.db"
$env:CORS_ORIGINS = "http://localhost:4173"
fastapi run app/main.py
```

(In Command Prompt, use `set PORT=8053` and so on. On a Mac or Linux, put them all in front of the command: `PORT=8053 EXPENSES_DB=rehearsal.db CORS_ORIGINS=http://localhost:4173 fastapi run app/main.py`.)

Port 8053 is a made-up "host's choice", so the rehearsal can't clash with a `fastapi dev` server on 8000. `rehearsal.db` is a separate database, so the rehearsal never touches your real `expenses.db`. And `http://localhost:4173` is where `npm run preview` serves a built React app ([React chapter 40](../../React/40-deploying/notes.md)), standing in for the real website. Here's what you'll see (the process number will be different):

```
 ⚡️ Starting FastAPI in production mode
INFO: app.main: Database file: rehearsal.db
INFO: app.main: CORS origins: ['http://localhost:4173']

 🐍 Using import string: app.main:app

 🌐 Server started at http://0.0.0.0:8053
    Documentation at http://0.0.0.0:8053/docs

  Logs:

INFO:     Started server process [19396]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8053 (Press CTRL+C to quit)
```

"Production mode", `0.0.0.0`, port 8053 from `PORT`, and your two log lines showing the settings it got. (They appear near the top, because the `fastapi` command imports your app to find it before it starts the server.)

The banner says `http://0.0.0.0:8053`, but `0.0.0.0` isn't an address you can visit, on Windows at least:

```
curl.exe http://0.0.0.0:8053/health
```

```
curl: (7) Failed to connect to 0.0.0.0:8053 after 0 ms: Could not connect to server
```

It means "every address", not "an address". Open <http://127.0.0.1:8053/health> instead, and you get `{"status":"ok"}`. Then check the CORS setting, pretending to be the React page, like in [chapter 46](../46-project-expense-tracker-api/notes.md):

```
curl.exe -i http://127.0.0.1:8053/health -H "Origin: http://localhost:4173"
```

```
HTTP/1.1 200 OK
date: Mon, 12 Oct 2026 08:24:30 GMT
server: uvicorn
content-length: 15
content-type: application/json
access-control-allow-origin: http://localhost:4173
vary: Origin

{"status":"ok"}
```

The new origin is allowed. Try `-H "Origin: http://localhost:5173"`, and the `access-control-allow-origin` line is gone: the setting replaced the default, it didn't add to it.

Finally, open <http://127.0.0.1:8053/expenses>. It's `[]`, because `rehearsal.db` is new and empty. Add an expense in `/docs`, stop the server with `Ctrl+C`, start it again, and it's still there. Your real `expenses.db` hasn't changed.

> **Watch out:** Environment variables stay set until you close the terminal. `fastapi dev` reads `PORT` too, so if you start it in the same terminal later, it quietly runs on 8053. Close the terminal when you're done, or unset them with `Remove-Item Env:PORT, Env:EXPENSES_DB, Env:CORS_ORIGINS`.

### Pin your packages

Chapter 46's `requirements.txt` said `fastapi[standard]>=0.143`: "0.143 or anything newer". That's fine for learning, but a server should install **exactly** the versions you tested. Otherwise, the day a package releases a new version with a breaking change, your next deploy installs it, and your app breaks without you changing a line. [Chapter 39](../39-project-structure-and-packaging/notes.md) explained the rule: applications pin exact versions of everything with `pip freeze` ([chapter 23](../23-pip-and-virtual-environments/notes.md)).

The trick is to freeze an environment with **only** what the app needs to run, so pytest and mypy don't end up on the server. In `C:\code\expense-api`:

```
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install "fastapi[standard]"
python -m pip freeze > requirements.txt
```

`requirements.txt` now has one line for every package, including the packages your packages need. With FastAPI 0.143, that's 56 lines. Here's the start and the end:

```
agent-detector==2.0.0
annotated-doc==0.0.5
annotated-types==0.8.0
anyio==4.15.1
...
uvicorn==0.54.0
watchfiles==1.3.0
websockets==17.2
```

(Your versions may be newer.) Freezing on Windows gives a Windows-flavoured list, but only just. `colorama` is there because the `click` package uses it for colours in a Windows terminal. It installs fine on Linux too, so leave it. And `uvloop`, a faster engine for async code that Uvicorn would use on Linux, is missing, because it doesn't exist for Windows. Your app runs fine without it. All 56 pinned versions were checked: every one has a ready-made package for Linux with Python 3.13, which is what the server will run.

The tools go in a second file, `requirements-dev.txt`, for your laptop and for the checking robot later in this chapter:

```
# What the app needs, plus the tools that check it (for your laptop and for CI).
# Install with: python -m pip install -r requirements-dev.txt
-r requirements.txt
httpx2==2.13.1
mypy==2.4.0
pytest==9.1.1
ruff==0.17.0
```

`-r requirements.txt` means "everything in that file too". So `python -m pip install -r requirements-dev.txt` gives you the app and the tools. Run it now, then `python -m pytest`: all of chapter 46's tests should pass. (These four are pinned by hand. Their own dependencies aren't pinned, which is fine for tools that never run on the server.)

To update a package later: install the new version, run your tests, and freeze again. Updating becomes something you decide to do, not something that happens to you.

### Docker: a box that runs the same everywhere

Your app now needs three things on the server: Python 3.13, the exact packages, and your code. You could ask the host to set that up. But hosts differ, they run Linux rather than Windows, and "it works on my machine" is the oldest excuse in programming.

**Docker** solves this by packing everything into one box that runs the same on your laptop, on a teammate's Mac, and on any host. Two words to learn:

- An **image** is a frozen, ready-to-run package: a tiny Linux system with Python, your packages and your code inside. You build it once.
- A **container** is a running copy of an image. You can start as many as you like from one image.

An image is to a container what a class is to an object ([chapter 27](../27-classes-and-objects/notes.md)): one blueprint, many running copies. Back at the food truck, the image is the fitted-out truck design, and a container is one truck out on the street, serving.

**Installing Docker.** On Windows, install **Docker Desktop** from <https://docs.docker.com/desktop/setup/install/windows-install/>. It needs WSL 2 (the Windows Subsystem for Linux), because images are Linux, and the install page walks you through it. Docker Desktop is free for personal use, learning and small businesses; check that page for the rules for bigger companies. Start Docker Desktop before using the `docker` command.

> **Watch out:** The Docker commands in this chapter were written from Docker's and FastAPI's official documentation, but they were not run while writing it. The files were checked as far as possible without Docker running: the `Dockerfile` with a Dockerfile checker (hadolint), and `compose.yaml` with `docker compose config`. If something behaves differently for you, the error message plus Docker's docs, or Claude, will get you there.

### The `Dockerfile`

A **Dockerfile** is the recipe for building an image: a list of steps, run from top to bottom. Save this as `Dockerfile` (no extension) in `C:\code\expense-api`:

```
# Start from Python's official image: a small Debian Linux with Python 3.13
FROM python:3.13-slim

# Show print() output in the logs straight away, instead of saving it up
ENV PYTHONUNBUFFERED=1

# Work in /code inside the image (Docker makes the folder)
WORKDIR /code

# Install the packages first. This step is only redone when requirements.txt changes.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Then copy your code
COPY app ./app

# Make a user with no special powers, and a folder it may write the database to
RUN useradd --create-home appuser && mkdir /data && chown appuser /data
USER appuser

# Settings, which the host or docker run can change
ENV EXPENSES_DB=/data/expenses.db
ENV PORT=8000
EXPOSE 8000

# Start the server: fastapi run listens on 0.0.0.0 and reads PORT
CMD ["fastapi", "run", "app/main.py"]
```

Line by line:

| Line | What it does |
|---|---|
| `FROM python:3.13-slim` | Starts from the official Python image. `slim` is the small version, without extras you don't need. |
| `ENV PYTHONUNBUFFERED=1` | Sets an environment variable inside the image. This one makes `print()` output appear in the logs at once. |
| `WORKDIR /code` | Like `cd /code` for every step after it. Inside the image, paths are Linux paths, with `/`. |
| `COPY requirements.txt .` | Copies the file from your project into `/code`. |
| `RUN pip install ...` | Runs a command while building. `--no-cache-dir` stops pip keeping a copy of every download, which would only make the image bigger. |
| `COPY app ./app` | Copies your code. Only `app`: the server doesn't need your tests or `seed.py`. |
| `RUN useradd ...` and `USER appuser` | Makes an ordinary user and switches to it, so your app doesn't run as the all-powerful `root` user. If someone ever broke into your app, they'd get a user who can't change the system. The `/data` folder is the one place that user may write. |
| `ENV EXPENSES_DB=...` and `ENV PORT=8000` | Defaults for your settings. `docker run` and hosts can replace them. |
| `EXPOSE 8000` | A note for humans and tools: "this app listens on 8000". It doesn't open anything by itself. |
| `CMD [...]` | The command that runs when a container starts. |

**Why copy `requirements.txt` before the code?** Docker saves the result of each step as a **layer**, and reuses it on the next build if nothing that step depends on has changed. Installing 56 packages takes a while; copying your code takes a moment. With this order, changing a line in `main.py` only redoes the last few steps, and the build log says `CACHED` next to the steps it reused. Copy everything first, and every tiny change reinstalls every package.

**Why `CMD ["fastapi", "run", "app/main.py"]` with brackets and quotes?** That's the **exec form**, and FastAPI's documentation asks you to always use it. Written without brackets (`CMD fastapi run app/main.py`), Docker starts a shell that starts your app, and the "please stop" signal goes to the shell instead of your app, so it can't shut down cleanly.

### The `.dockerignore` file

When you build, Docker first sends your project folder to the builder. A `.dockerignore` file lists what it must never send. It works like `.gitignore`. Save this as `.dockerignore`:

```
# Never send these to Docker: they're big, private, or made on your laptop
.venv/
__pycache__/
.mypy_cache/
.pytest_cache/
.ruff_cache/
.git/
.env
*.db
```

Your `.venv` alone is around 160 MB in over 8,000 files, and it's Windows-only anyway. `.env` holds secrets, and `*.db` holds your data. None of them belong in an image (see Common mistakes).

### Build it and run it

With Docker Desktop running, in the project folder:

```
docker build -t expense-api .
```

`-t expense-api` gives the image a name (a **tag**), and the `.` at the end means "the project is this folder". The first build downloads the Python image and installs every package, so it takes a minute or two. Then start a container:

```
docker run --rm -d -p 8000:8000 --name expenses expense-api
```

| Option | Means |
|---|---|
| `--rm` | Delete the container when it stops (not the image, and not named volumes) |
| `-d` | Run in the background ("detached"), and give the terminal back |
| `-p 8000:8000` | Connect port 8000 on your laptop to port 8000 inside the container. Your laptop's port comes first: `-p 8053:8000` would let you open it at `127.0.0.1:8053` |
| `--name expenses` | A name for the container, so later commands can refer to it |
| `expense-api` | The image to start |

Open <http://127.0.0.1:8000/health>, and your API answers from inside the container. Three more commands you'll use all the time:

```
docker ps                   # list the running containers
docker logs expenses        # show what the app has printed (add -f to keep watching)
docker stop expenses        # stop it (and --rm deletes it)
```

`docker logs` shows the same startup lines as your rehearsal, with `Database file: /data/expenses.db` and `Uvicorn running on http://0.0.0.0:8000`.

**Settings and data.** `-e` sets an environment variable in the container, and `-v` attaches a **volume**: storage that Docker keeps outside the container, so it survives when the container is deleted. Run it again like this:

```
docker run --rm -d -p 8000:8000 --name expenses -e CORS_ORIGINS=http://localhost:5173 -v expense-data:/data expense-api
```

`-v expense-data:/data` means "keep the container's `/data` folder in a volume called `expense-data`", and `/data` is exactly where `EXPENSES_DB` points. Run `python seed.py`, stop the container, start a new one with the same command, and the eight expenses are still there. Without the `-v`, every new container starts with an empty database. (`docker volume ls` lists your volumes, and `docker volume rm expense-data` deletes one, data and all.)

### Docker Compose: the run command, written down

That `docker run` line is getting long, and you'd have to remember it exactly. **Docker Compose** keeps it in a file instead. Save this as `compose.yaml` in the project folder:

```yaml
services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      CORS_ORIGINS: "http://localhost:5173"
    volumes:
      - expense-data:/data

volumes:
  expense-data:
```

It's a **YAML** file, a settings format where indentation matters (you met it in React chapter 40's workflow file). Each part matches one `docker run` option. Then:

```
docker compose up --build       # build the image if needed, and start everything
docker compose down             # stop and remove the containers (the volume stays)
```

Compose really shines when an app needs more than one container, like your API plus a PostgreSQL server. That's exercise 5. (Compose names the volume after your folder, like `expense-api_expense-data`, and `docker compose down -v` deletes it, so be careful with `-v` there.)

### Where does the data live?

Here's the most important idea in this chapter, and the one that surprises everybody. **A container's own files are temporary.** Every new container starts as a fresh copy of the image. Anything the app wrote inside it, outside a volume, is gone when the container is replaced.

Hosts work the same way, and they replace your container all the time: on every deploy, on every restart, and on free plans, whenever the app goes to sleep. Without a volume, `expenses.db` would quietly start empty again each time. You have three honest options:

| Option | How | Good for |
|---|---|---|
| SQLite on a **persistent disk** | Ask the host for a disk, mounted at `/data` (where `EXPENSES_DB` already points) | One server, small apps. Usually a paid extra. |
| A **managed PostgreSQL** database | A database server that someone else runs and backs up ([PostgreSQL chapter 43](../../PostgreSQL/43-postgresql-in-the-cloud/notes.md)). Your app gets its address in a `DATABASE_URL` variable. | Real apps, and the usual choice. Needs `database.py` rewritten with psycopg ([chapter 42](../42-databases/notes.md)): exercise 5. |
| Accept that the data resets | Nothing | A demo or a portfolio piece, as long as you say so |

This is where chapter 46's design pays off: only `database.py` talks to the database, so moving to PostgreSQL changes one module, plus one setting.

### Putting it online with Render

You need a host that runs containers. This chapter uses **Render** for the walkthrough, because at the time of writing (autumn 2026) it has a free plan for web services, builds straight from a `Dockerfile`, and supports health checks. Other hosts that run containers include Railway, Fly.io, Koyeb and Google Cloud Run. What they give for free varies a lot (a trial, a small monthly credit, or a free allowance that needs a credit card), and some have no free plan for new accounts at all. **Prices and free plans change often**, so check each host's own pricing page before you choose.

> **Watch out:** These steps follow Render's documentation as it was in October 2026, but they weren't tried out for this chapter (that needs an account). Treat them as a map, not a recipe.

What Render's free plan gave you at the time of writing, from its own docs:

- **The app goes to sleep** after 15 minutes without a request. The next request wakes it, which takes about a minute.
- **The disk is temporary.** Files are lost on every redeploy, restart and sleep. Persistent disks are only for paid plans.
- **750 free hours a month**, enough for one app running all month.
- **Free PostgreSQL databases expire** 30 days after you create them.

So on the free plan, your expenses will disappear regularly. That's fine for learning how deploying works, and the table in the last section shows the ways out.

**Step 1: Put the project on GitHub.** Give `C:\code\expense-api` its own repository and push it, exactly like option A in [React chapter 40](../../React/40-deploying/notes.md). First add a `.gitignore`:

```
.venv/
__pycache__/
.mypy_cache/
.pytest_cache/
.ruff_cache/
.env
*.db
```

Then run `git status` after `git add .` and before your first commit. You should see `app`, `tests`, `seed.py`, both requirements files, `Dockerfile`, `.dockerignore`, `compose.yaml` and `.gitignore`, and nothing else.

**Step 2: Create the web service.** Sign up at [render.com](https://render.com) (you can log in with GitHub), then choose **New**, then **Web Service**, and pick your repository. Fill in the form:

| Field | Your value |
|---|---|
| Name | `expense-api` (it becomes part of the address) |
| Language | **Docker**. Render finds your `Dockerfile` and builds the image itself. |
| Branch | `main` |
| Region | The one nearest to you |
| Instance type | **Free** |

**Step 3: Set the environment variables.** In the same form (or later, on the service's **Environment** page), add `CORS_ORIGINS` with `http://localhost:5173` for now. You'll change it to your real front end's address soon. You don't need to set `PORT`. Render's docs say its default is 10000, and that Render can usually spot whichever port your app opened. Since `fastapi run` reads `PORT`, either way works.

**Step 4: Set the health check.** Under **Advanced**, set **Health Check Path** to `/health`. This is the promise from [chapter 46](../46-project-expense-tracker-api/notes.md): that tiny endpoint finally has a job. According to Render's docs:

- Every few seconds, Render calls `/health`. An answer with a `2xx` or `3xx` status within five seconds counts as healthy.
- If it fails for 15 seconds in a row, Render stops sending visitors to that copy of your app. After 60 seconds, it restarts it.
- When you deploy a new version, the old one keeps serving until the new one passes its health check. A broken new version never replaces a working old one. That's called a **zero-downtime deploy**.

**Step 5: Deploy and watch the logs.** Click **Create Web Service**. The **Logs** page shows Docker building your image, then the same startup lines as your rehearsal, with Render's port. When it says the service is live, Render shows your address, something like `https://expense-api-a1b2.onrender.com`. Render adds HTTPS (the padlock) for you, for free.

**Step 6: Test the live API.** Open `/health` and `/docs` on your new address, and try a request or two. Exercises 2 and 3 give you scripts that fill the live API with sample data and check every endpoint in one go.

From now on, every `git push` to `main` deploys again, automatically.

> **Tip:** Render can also run Python without Docker. Choose **Python 3** as the language, `pip install -r requirements.txt` as the build command, and `fastapi run app/main.py` as the start command. New services get Python 3.14 by default at the time of writing, so add a file called `.python-version` containing `3.13` to match what you tested. Docker is still worth learning: the same image runs on almost any host.

### Connecting the React front end

In [chapter 46](../46-project-expense-tracker-api/notes.md), `ExpenseList.tsx` had the API's address written into it: `const API_URL = "http://127.0.0.1:8000";`. Online, that's the "pointing a deployed app at `localhost`" mistake from [React chapter 40](../../React/40-deploying/notes.md). Use the same fix as there, a `VITE_` environment variable:

```tsx
// The API's address comes from the build settings (React chapter 40)
const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error("VITE_API_URL is missing. Add it to .env.local, or to your host's settings.");
}
```

Then three settings, in this order, because each side needs the other's address:

| Where | Setting | Value |
|---|---|---|
| Your laptop, in the React project's `.env.local` | `VITE_API_URL` | `http://127.0.0.1:8000` |
| Netlify, under the site's environment variables | `VITE_API_URL` | `https://expense-api-a1b2.onrender.com` (yours) |
| Render, on the service's **Environment** page | `CORS_ORIGINS` | `https://my-expenses.netlify.app` (yours) |

Deploy the React app on Netlify as in React chapter 40, with `VITE_API_URL` set **before** it builds, because Vite bakes the value in at build time. Then change `CORS_ORIGINS` on Render and save (Render redeploys with the new value). Open your Netlify site, and your October spending appears, served by your API on Render. If the API was asleep, the page shows "Loading..." for up to a minute first.

Copy the origin exactly from the browser's address bar: `https://`, no path, and **no slash at the end** (see Common mistakes).

### Continuous integration with GitHub Actions

Now every push deploys. That's great, as long as nobody pushes broken code. **Continuous integration** (CI), which you met in [React chapter 40](../../React/40-deploying/notes.md), is a robot that checks every push. For a Python project, the checks are the ones you already run by hand: Ruff ([chapter 50](../50-clean-code-and-style/notes.md)), mypy and pytest.

Create `.github/workflows/ci.yml` in the project:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-python@v7
        with:
          python-version: "3.13"
      - run: python -m pip install -r requirements-dev.txt
      - run: python -m ruff check .
      - run: python -m ruff format --check .
      - run: python -m mypy app tests seed.py
      - run: python -m pytest
```

| Step | What it does |
|---|---|
| `actions/checkout@v7` | Downloads your code onto a fresh Linux computer borrowed from GitHub |
| `actions/setup-python@v7` | Installs Python 3.13 on it |
| `pip install -r requirements-dev.txt` | Installs the app and the tools, at your pinned versions |
| `ruff check .` | Looks for likely bugs and style problems |
| `ruff format --check .` | Checks the formatting, without changing anything |
| `mypy` and `pytest` | Your type check and your tests, exactly as on your laptop |

`"3.13"` is in quotes on purpose. YAML reads an unquoted `3.10` as the number 3.1, which would install the wrong Python. Quoting every version is a good habit. (`@v7` was the latest version of both actions in October 2026. Check their pages on GitHub for newer ones.)

**Run the same commands on your laptop first.** That's the whole point: if they pass for you, they'll pass for the robot. Here's what happened when these exact commands ran on a finished chapter 46 project, with this chapter's changes:

```
python -m ruff check .
```

```
All checks passed!
```

```
python -m ruff format --check .
```

```
unformatted: File would be reformatted
   --> app\database.py:166:10
...
2 files would be reformatted, 5 files already formatted
```

That's a red ✗ waiting to happen. The test code at the bottom of `models.py` and `database.py` packs a dictionary onto two lines, and Ruff's formatter would spread it out. Fix it by letting the formatter do its job:

```
python -m ruff format .
```

```
2 files reformatted, 5 files left unchanged
```

Then the other two:

```
python -m mypy app tests seed.py
```

```
Success: no issues found in 7 source files
```

```
python -m pytest
```

```
============================= test session starts =============================
platform win32 -- Python 3.13.15, pytest-9.1.1, pluggy-1.6.0
rootdir: C:\code\expense-api
plugins: anyio-4.15.1
collected 21 items

tests\test_expenses.py .....................                             [100%]

============================== 21 passed in 1.00s ==============================
```

(Seven files now: `settings.py` is the new one.) Commit, push, and open the **Actions** tab on GitHub to watch the robot do the same. The workflow file itself wasn't run on GitHub for this chapter, but it was checked against GitHub's published rules for workflow files, and its commands are exactly the ones above.

**Deploy only green code.** On Render, the service's **Auto-Deploy** setting has an option called **After CI Checks Pass**. With it, a push deploys only when every check on that commit has passed. A red ✗ means the live app stays as it was.

### After launch

Your API is live. A few habits keep it that way:

- **Read the logs.** When something breaks, the host's Logs page (or `docker logs`) is the first place to look. Your startup lines say which settings the app got, and a 500 error leaves its traceback there.
- **Watch it from outside.** An **uptime monitor** is a service that calls your `/health` every few minutes and emails you when it stops answering. Several have free plans.
- **Back up your data.** A database you haven't backed up is a database you're willing to lose. For PostgreSQL, that's `pg_dump` ([PostgreSQL chapter 35](../../PostgreSQL/35-backup-and-restore/notes.md)), or the provider's backups (check whether your plan has them: Render's free databases don't).
- **Update safely.** Change things on a branch, let CI check them, then merge. If a deploy goes wrong anyway, Render's **Deploys** page has a **Rollback** button next to earlier deploys. (Rolling back switches auto-deploy off, so turn it on again after the fix.)
- **Keep packages current, on purpose.** Every month or so, update, run the tests, freeze, and deploy. `pip-audit` from [chapter 52](../52-security-basics/notes.md) tells you when a pinned version has a known security problem.

## Common mistakes

**1. Listening on `127.0.0.1` inside a container**

```
CMD ["uvicorn", "app.main:app"]
```

The container starts, the logs look perfect, and every request from outside fails. Uvicorn's default address is `127.0.0.1`, and so is `fastapi dev`'s, so the app only accepts connections from inside its own container. You can see the same thing on your laptop. Find your laptop's own network address with `ipconfig` (look for "IPv4 Address", something like `192.168.1.23`), then start the rehearsal with `fastapi run app/main.py --host 127.0.0.1` and ask for it at that address:

```
curl.exe http://192.168.1.23:8053/health
```

```
curl: (7) Failed to connect to 192.168.1.23:8053 after 2046 ms: Could not connect to server
```

`http://127.0.0.1:8053/health` still works, because that's the one door the app opened. Without `--host 127.0.0.1`, both addresses answer. Fix: use `fastapi run`, which listens on `0.0.0.0`. (With plain Uvicorn, add `--host 0.0.0.0`.)

**2. A hard-coded port**

```
CMD ["fastapi", "run", "app/main.py", "--port", "8000"]
```

Many hosts send traffic only to the port in `PORT`. A `--port` on the command line beats the variable. Here it is on your laptop, with `PORT` set like a host would:

```
$env:PORT = "10000"
fastapi run app/main.py --port 8053
```

```
INFO:     Uvicorn running on http://0.0.0.0:8053 (Press CTRL+C to quit)
```

The app ignored `PORT`, so `curl.exe http://127.0.0.1:10000/health` fails with `Could not connect to server`. On a host, the health check knocks on the wrong door, and the deploy fails. Fix: leave `--port` out, and let `fastapi run` read `PORT`.

**3. Auto-reload in production**

```
CMD ["fastapi", "dev", "app/main.py"]
```

`fastapi dev` makes two mistakes at once: it listens on `127.0.0.1` (mistake 1), and it keeps watching every file for changes, using memory and processor time for nothing. The same goes for `--reload`. Fix: `fastapi run` on servers, `fastapi dev` only on your laptop.

**4. Secrets baked into the image**

```
COPY . .
ENV EXPENSES_API_KEY=tiger-lily-42
```

Without a `.dockerignore`, `COPY . .` copies your `.env` file into the image. And `ENV` writes the key into the image's settings. Either way, anyone who gets a copy of the image can read the secret, and images get shared, pushed to registries and cached on build servers. Fix: list `.env` in `.dockerignore`, and give secrets to the running container instead, with `-e`, `--env-file .env`, or the host's Environment page ([chapter 52](../52-security-basics/notes.md)).

**5. The SQLite file vanishing on redeploy**

Everything works, you add a week of expenses, you push a small fix, and the list is empty. The new container started from the image, with no `expenses.db` in it. Fix: keep the database outside the container, on a volume or persistent disk, or in a database server (see "Where does the data live?").

A cousin of this mistake: pointing `EXPENSES_DB` at a folder that doesn't exist. Rehearse with `$env:EXPENSES_DB = "data\expenses.db"`, without making a `data` folder, and the app starts happily. `/health` even says `200 OK`. But `/expenses` gives `500 Internal Server Error`, and the log says:

```
sqlite3.OperationalError: unable to open database file
```

A health check that never touches the database can't notice this. Exercise 4 makes the app refuse to start instead.

**6. No `.dockerignore`**

With `COPY . .` and no `.dockerignore`, everything in the folder goes into the image: about 160 MB of Windows `.venv` that can't even run on Linux, your caches, your `.env`, and your own `expenses.db`. The build is slow, the image is huge, and your private data ships with it. Fix: always add a `.dockerignore`, and copy only what the app needs (`COPY app ./app`).

**7. A CORS origin that doesn't match**

You copy your site's address with the slash at the end and set `CORS_ORIGINS=https://my-expenses.netlify.app/`. The log shows the setting arrived:

```
INFO: app.main: CORS origins: ['https://my-expenses.netlify.app/']
```

But the browser sends its origin without a slash, and the answer has no `access-control-allow-origin` header:

```
curl.exe -i http://127.0.0.1:8053/health -H "Origin: https://my-expenses.netlify.app"
```

```
HTTP/1.1 200 OK
date: Mon, 12 Oct 2026 08:27:18 GMT
server: uvicorn
content-length: 15
content-type: application/json
vary: Origin

{"status":"ok"}
```

So the React page says "Failed to fetch", with a CORS error in the console. An origin must match letter for letter: `https` not `http`, no path, no trailing slash, and no space after the comma between two origins. Fix: `CORS_ORIGINS=https://my-expenses.netlify.app`. Exercise 4 catches these mistakes when the app starts.

**8. `localhost` in the front end's API address**

The React app works on your laptop and shows "Failed to fetch" on everyone else's. Its API address still says `http://127.0.0.1:8000`, which on a visitor's phone means "this phone". It even seems fine on your laptop while your own API happens to be running there: the trap from [React chapter 40](../../React/40-deploying/notes.md). Fix: read the address from `VITE_API_URL`, set it on Netlify, rebuild, and test on another device.

## Quick recap

- Deploying means running your app on a host that's always on. In production, use `fastapi run`: no auto-reload, listening on `0.0.0.0`, on the port from `PORT`.
- Everything that changes between places comes from environment variables, gathered in one `settings.py`, with laptop-friendly defaults. Secrets never go in code or images ([chapter 52](../52-security-basics/notes.md)). Log your non-secret settings at startup, to the terminal.
- Rehearse on your laptop first: set the variables like a host would, run `fastapi run`, and check the health check and CORS with `curl.exe`.
- Pin exact versions with `pip freeze` in an environment that holds only the app's packages. Tools go in `requirements-dev.txt`.
- A `Dockerfile` builds an image (the blueprint); a container is a running copy. Install requirements before copying code, run as a non-root user, use the exec form of `CMD`, and always add a `.dockerignore`. Containers' own files are temporary: keep data in a volume, a persistent disk, or a database server.
- On a host like Render: connect the GitHub repository, choose Docker, set the environment variables and the health check path, and watch the logs. Point the React app at the API with `VITE_API_URL`, and the API at the React app with `CORS_ORIGINS`.
- CI runs `ruff check`, `ruff format --check`, mypy and pytest on every push. Run the same commands locally first, and deploy only green commits.

---

**Next:** try the [exercises](exercises.md), then move on to the [54 Final Project](../54-final-project/notes.md).
