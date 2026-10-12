# 39 Project Structure and Packaging

## What is it?

**Project structure** is how you arrange the files and folders of a program, so that you (and anyone else) can tell at a glance what's what.

**Packaging** means turning your project into something pip can install, exactly like the packages you installed in [chapter 23](../23-pip-and-virtual-environments/notes.md). Everything pip needs to know about your project (its name, its version, what it needs, which commands it adds) goes into one small settings file called `pyproject.toml`.

## Why does it matter?

Sandip's tip calculator started as one file. A few weeks later, the folder looks like this:

```
tip-calculator/
├── tipcalc.py
├── helpers.py
├── test_tipcalc.py
├── tipcalc_old.py
├── tipcalc_new_DONT_USE.py
├── try_rounding.py
└── notes.txt
```

It works, but it has four problems:

1. **What's what?** Which file is the program? Which ones are experiments? Someone new, or Sandip in six months, has to open every file to find out.
2. **It only works from one place.** You've seen this already: in [chapter 36](../36-testing-with-pytest/notes.md), tests in a `tests` folder could only find the code when you ran `python -m pytest` from exactly the right folder. And to use the program, Sandip has to `cd` into this folder first, or type the whole path to `tipcalc.py`, every time.
3. **It's hard to reuse.** Sandip wants the bill-splitting function in another project. Today, that means copying the file, and then there are two copies to fix when he finds a bug.
4. **It's hard to share.** Maya gets a zip file, and has to guess which Python she needs, which packages to install, and which file to run.

Professional Python projects solve all four in the same way: a standard layout of folders, plus a `pyproject.toml` that describes the project. Then one command installs it, on any computer, and you get a real `tipcalc` command, like `pip` or `mypy`, that works from any folder.

## Real-world example

Think of a flat-pack bookshelf from a furniture shop. (Chapter 23 already compared a wheel to flat-pack furniture. Now you're the factory.) Inside the box, the parts come in labeled bags. There's an instruction sheet. And on the outside, a label says what it is, its model number, and what else you need ("requires: 1 screwdriver, not included").

| Flat-pack furniture | A Python project |
|---|---|
| The box, with everything inside | The project folder |
| The labeled bags of parts | Your package's modules, in `src/tipcalc/` |
| The label on the box: name, model number, "requires a screwdriver" | `pyproject.toml`: name, version, dependencies |
| The instruction sheet | `README.md` |
| The quality-check sheet that's never shipped to customers | The `tests` folder |
| The factory packing a box for the shop | `python -m build` making a wheel |
| Putting it together at home | `pip install` |
| A new model number when the design changes | A new version number |

## How it works

### Step 1: from scripts to a package

In [chapter 19](../19-modules-and-standard-library/notes.md), you met packages: a folder of modules with an `__init__.py` file in it. That's the first step. Sandip moves the code into a package called `tipcalc`, with one module per job:

```
tip-calculator/
└── tipcalc/
    ├── __init__.py
    ├── calc.py
    └── cli.py
```

`tip-calculator` is just the project folder. You could call it anything. `tipcalc` inside it is the package: that's the name you'll import.

`__init__.py` holds a one-line docstring that says what the package is:

```python
"""tipcalc: work out the tip, and split the bill."""
```

`calc.py` does the sums. Money is in whole cents, as always:

```python
"""The sums. All money is in whole cents."""


def parse_money(text: str) -> int:
    """Turn text like "47.80" into whole cents, like 4780."""
    return round(float(text) * 100)


def tip_cents(bill_cents: int, percent: int) -> int:
    """Return the tip for a bill, rounded to whole cents."""
    return round(bill_cents * percent / 100)


def split(total_cents: int, people: int) -> list[int]:
    """Split a total into fair shares that add up to exactly the total."""
    if people < 1:
        raise ValueError("there must be at least one person to pay")
    share, extra = divmod(total_cents, people)
    return [share + 1 if i < extra else share for i in range(people)]


def format_money(cents: int) -> str:
    """Turn a number of cents into text like $12.50."""
    return f"${cents / 100:.2f}"
```

(`split` is the function you built with test-driven development in chapter 36.)

`cli.py` is the command line, with argparse from [chapter 24](../24-command-line-programs/notes.md). CLI stands for **command-line interface**:

```python
"""The command line: tipcalc 47.80 --percent 15 --people 3"""

import argparse

from tipcalc.calc import format_money, parse_money, split, tip_cents


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="tipcalc",
        description="Work out the tip, and split the bill.",
    )
    parser.add_argument("bill", help="the bill, like 47.80")
    parser.add_argument(
        "--percent", type=int, default=10, help="tip size (default: 10)"
    )
    parser.add_argument(
        "--people", type=int, default=1, help="how many people pay (default: 1)"
    )
    return parser


def main() -> None:
    args = build_parser().parse_args()
    bill = parse_money(args.bill)
    tip = tip_cents(bill, args.percent)
    total = bill + tip
    print(f"Bill:   {format_money(bill)}")
    print(f"Tip:    {format_money(tip)} ({args.percent}%)")
    print(f"Total:  {format_money(total)}")
    if args.people > 1:
        shares = [format_money(share) for share in split(total, args.people)]
        print(f"Shares: {', '.join(shares)}")
```

Splitting the code like this means each file has one job. `calc.py` knows nothing about the command line, so it's easy to test, and easy to reuse in another program (a website, say) that has no command line at all.

### Absolute and relative imports

Look at the import line in `cli.py`:

```python
from tipcalc.calc import format_money, parse_money, split, tip_cents
```

That's an **absolute import**: it gives the full path from the package's name, `tipcalc`, down to the module, `calc`. Inside a package, you can also write a **relative import**, where a dot means "this package":

```python
from .calc import format_money, parse_money, split, tip_cents
```

Two dots, `..`, would mean "the package above this one". Both lines do the same job here. Absolute imports are easier to read (you can see exactly where `calc` lives), and PEP 8 recommends them, so this chapter uses them. You'll meet relative imports in other people's code, though, so it's good to recognize them. One of the common mistakes at the end of this chapter is about them.

### Running a package: `python -m` and `__main__.py`

How do you run a package? Add one more file to it, called `__main__.py`:

```python
from tipcalc.cli import main

main()
```

`python -m tipcalc` means "run the package called `tipcalc`", and that runs its `__main__.py`. You've used this many times without knowing it: `python -m pip` and `python -m pytest` run the `__main__.py` of the `pip` and `pytest` packages. From the `tip-calculator` folder:

```
python -m tipcalc 47.80 --percent 15 --people 3
```

```
Bill:   $47.80
Tip:    $7.17 (15%)
Total:  $54.97
Shares: $18.33, $18.32, $18.32
```

The shares add up to exactly $54.97, with the leftover cent going to the first person.

Why `prog="tipcalc"` in the parser? Without it, argparse names the program after the file that started it, and with `python -m` that file is `__main__.py`. The help screen would say `usage: __main__.py [-h] ...`, which means nothing to anyone.

So far so good. But go up one folder (`cd ..`) and try again:

```
python -m tipcalc 47.80
```

```
C:\Users\Sandip\AppData\Local\Programs\Python\Python313\python.exe: No module named tipcalc
```

Python looks for modules in the folder you're standing in, the standard library, and `site-packages` (chapter 19). From the project folder, it found the `tipcalc` folder. From anywhere else, it doesn't. To make `tipcalc` work from anywhere, it needs to be **installed**, just like `cowsay` in chapter 23. That's what the rest of this chapter is about.

### The src layout

Here's how many modern Python projects are laid out. It's called the **src layout**, because the package goes inside a folder called `src`:

```
tip-calculator/
├── pyproject.toml
├── README.md
├── .gitignore
├── src/
│   └── tipcalc/
│       ├── __init__.py
│       ├── __main__.py
│       ├── calc.py
│       └── cli.py
└── tests/
    └── test_calc.py
```

| Item | What it's for |
|---|---|
| `pyproject.toml` | The label on the box: describes the project to pip and other tools (next section) |
| `README.md` | The instruction sheet: what it is, how to install it, how to use it |
| `.gitignore` | Files Git should ignore ([chapter 23](../23-pip-and-virtual-environments/notes.md)) |
| `src/tipcalc/` | The package: the code that gets installed |
| `tests/` | The tests. They check the code, but they aren't part of what gets installed. |

The experiments (`try_rounding.py`, `tipcalc_old.py`) are gone. Old versions belong in Git's history, not in the folder.

Here's the test file, `tests/test_calc.py`:

```python
import pytest

from tipcalc.calc import format_money, parse_money, split, tip_cents


def test_parse_money() -> None:
    assert parse_money("47.80") == 4780


def test_tip_is_rounded_to_whole_cents() -> None:
    assert tip_cents(4780, 15) == 717


def test_split_shares_add_up_to_the_total() -> None:
    assert split(5497, 3) == [1833, 1832, 1832]


def test_split_needs_someone_to_pay() -> None:
    with pytest.raises(ValueError, match="at least one person"):
        split(5497, 0)


def test_format_money() -> None:
    assert format_money(5497) == "$54.97"
```

And `.gitignore` lists the folders that tools create, which never belong in Git:

```
.venv/
__pycache__/
.pytest_cache/
.mypy_cache/
dist/
```

Now something surprising. From the `tip-calculator` folder, `python -m tipcalc 47.80` gives `No module named tipcalc`, and `python -m pytest` fails with:

```
E   ModuleNotFoundError: No module named 'tipcalc'
```

That's on purpose! The package is inside `src`, so it isn't in the folder you're standing in any more. The only way to import it is to **install** it. That sounds like extra work, but it's the whole point:

- **Your tests test what your users get.** They import the installed package, exactly as a user would. If you forget to include a file, the tests notice, instead of a user.
- **No accidents.** Python can never pick up a half-finished copy just because your terminal happens to be in the project folder.
- **Clear edges.** Everything under `src` gets installed for users. Everything else (tests, notes, settings) doesn't.

> **Tip:** The src layout isn't the only choice. Plenty of well-known projects use the **flat layout**, with the package folder right next to `pyproject.toml` (like the "Step 1" folder above). It works fine too. The official Python packaging guide uses the src layout, and so does this course.

### `pyproject.toml`: the label on the box

`pyproject.toml` is written in **TOML**, a simple format for settings files. You only need four rules to read it: `[name]` in square brackets starts a section (called a **table**), each setting is `key = value`, text goes in double quotes, and lists go in square brackets. `#` starts a comment, like in Python.

Here's the whole file for `tipcalc`:

```
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "tipcalc"
version = "0.1.0"
description = "Work out the tip, and split the bill."
readme = "README.md"
requires-python = ">=3.13"
dependencies = []

[project.scripts]
tipcalc = "tipcalc.cli:main"

[dependency-groups]
dev = ["pytest", "mypy"]

[tool.pytest.ini_options]
testpaths = ["tests"]

[tool.mypy]
files = ["src", "tests"]
```

Let's go through it one table at a time.

### `[build-system]`: who packs the box

pip doesn't build packages itself. It hands that job to a **build backend**: a tool that knows how to turn your folder into an installable package. This table says which one to use. Here it's **Hatchling** (from the Hatch project). pip downloads it by itself, the first time it needs it, so you never install it yourself.

There are several build backends, and they all read the same `[project]` table. You'll often see **setuptools** (the oldest and most common), and also `flit-core`, `poetry-core` and `uv_build`. If you meet one in someone else's project, it's doing the same job.

### `[project]`: what's in the box

| Key | Means |
|---|---|
| `name` | The name people `pip install`. On PyPI it must be unique, first come, first served. |
| `version` | The version number, as text. More on version numbers below. |
| `description` | One sentence. It shows up in `pip show` and on PyPI. |
| `readme` | The file with the long description. PyPI shows it as the project's front page. |
| `requires-python` | Which Pythons it works on. `">=3.13"` means 3.13 or newer. |
| `dependencies` | The packages it needs to run. `tipcalc` only uses the standard library, so the list is empty. |

`requires-python` really is checked. Here's what happened when Sandip tried to install `tipcalc` into an old Python 3.12 environment:

```
ERROR: Package 'tipcalc' requires a different Python: 3.12.10 not in '>=3.13'
```

There are more keys you can add, like `authors`, `license` and links to your website. The official guide lists them all: <https://packaging.python.org/en/latest/guides/writing-pyproject-toml/>.

### `[project.scripts]`: making a real command

```
[project.scripts]
tipcalc = "tipcalc.cli:main"
```

This line says: "when this package is installed, create a command called `tipcalc`, and when someone runs it, call the `main` function in the `tipcalc.cli` module". The part before the colon is the module (with dots, like an import), and the part after it is the function. The function must take no arguments. It reads the command line itself, with argparse.

On Windows, pip turns this into a small program called `tipcalc.exe` in your virtual environment's `Scripts` folder, right next to `pip.exe`. That's exactly how the `pip`, `pytest` and `mypy` commands got there too.

### `[dependency-groups]`: tools for you, not for users

```
[dependency-groups]
dev = ["pytest", "mypy"]
```

pytest and mypy help *you* build `tipcalc`, but people who just want to work out a tip don't need them. A **dependency group** is a named list of packages for working on the project. They're never installed for users. `dev` is the usual name, but you can make several groups, like `test` and `docs`.

> **Watch out:** Dependency groups are new. They need pip 25.1 or newer (2025). With an older pip, you'll see `no such option: --group`. The fix is `python -m pip install --upgrade pip` inside your virtual environment.

### `[tool.*]`: settings for your tools

Many tools read their settings from `pyproject.toml`, each from its own `[tool.name]` table. So all your project's settings live in one file:

- `[tool.pytest.ini_options]` with `testpaths = ["tests"]` tells pytest where the tests are. (The odd name is historical: pytest settings used to live in a file called `pytest.ini`.)
- `[tool.mypy]` with `files = ["src", "tests"]` tells mypy what to check, so you can just type `python -m mypy`.

> **Tip:** pytest 9 also understands a shorter `[tool.pytest]` table. `[tool.pytest.ini_options]` works in old and new versions alike, so it's the safe choice for now.

### Installing your project: `pip install -e .`

Time to install it. In the `tip-calculator` folder, make and activate a virtual environment, then install the project:

```
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -e .
```

The `.` means "the project in this folder". You'll see something like this (shortened):

```
Obtaining file:///C:/Users/Sandip/projects/tip-calculator
  Installing build dependencies ... done
  ...
Successfully built tipcalc
Installing collected packages: tipcalc
Successfully installed tipcalc-0.1.0
```

pip downloaded Hatchling, Hatchling read `pyproject.toml` and built the package, and pip installed it. Now `tipcalc` is a real command:

```
tipcalc 47.80 --percent 15 --people 3
```

```
Bill:   $47.80
Tip:    $7.17 (15%)
Total:  $54.97
Shares: $18.33, $18.32, $18.32
```

And it works from any folder, as long as the virtual environment is active. So does `python -m tipcalc`. Try `cd ..` and run `tipcalc 47.80 --people 2`:

```
Bill:   $47.80
Tip:    $4.78 (10%)
Total:  $52.58
Shares: $26.29, $26.29
```

**What does `-e` do?** It stands for **editable**. A normal install *copies* your code into the virtual environment's `site-packages` folder. An editable install doesn't copy anything. Instead, pip leaves a tiny note in `site-packages` that says "for `tipcalc`, look in `C:\Users\Sandip\projects\tip-calculator\src`". So when you change your code, the command uses the new code straight away, with no reinstalling.

Try it. In `cli.py`, change the default tip from `10` to `12` (in both places on that line), save, and run `tipcalc 47.80` again:

```
Bill:   $47.80
Tip:    $5.74 (12%)
Total:  $53.54
```

The change is live. (Change it back to 10 afterwards.) Use `-e` for your own projects while you work on them.

`python -m pip list` shows which installs are editable, in an extra column:

```
Package Version Editable project location
------- ------- ---------------------------------------
pip     26.2.1
tipcalc 0.1.0   C:\Users\Sandip\projects\tip-calculator
```

Now install the dev tools too. `--group dev` adds the `dev` group from `pyproject.toml`:

```
python -m pip install -e . --group dev
```

The output ends with a long `Successfully installed ...` line that includes `mypy-2.4.0` and `pytest-9.1.1` (your versions may be newer). Now run the tests:

```
python -m pytest
```

```
============================= test session starts =============================
platform win32 -- Python 3.13.15, pytest-9.1.1, pluggy-1.6.0
rootdir: C:\Users\Sandip\projects\tip-calculator
configfile: pyproject.toml
testpaths: tests
collected 5 items

tests\test_calc.py .....                                                 [100%]

============================== 5 passed in 0.04s ==============================
```

The `configfile` and `testpaths` lines show that pytest read its settings from `pyproject.toml`. And mypy, with no file names at all:

```
python -m mypy
```

```
Success: no issues found in 5 source files
```

That's the four modules in `src/tipcalc` plus the test file. One more nice thing: because `tipcalc` is installed, even plain `pytest` (without `python -m`) works now. The problem from chapter 36 is gone for good.

### Dependencies: what your package needs

When your package uses someone else's package, list it under `dependencies`. Say the weather app you'll build in [chapter 40](../40-working-with-apis/notes.md) became a package. It would need `requests`:

```
dependencies = ["requests>=2.32"]
```

`>=2.32` means "version 2.32 or newer". When anyone installs your package, pip reads this list and installs `requests` too, plus whatever `requests` itself needs. In pip's output, you'd see a line like `Collecting requests>=2.32 (from weather==0.1.0)`. That's the label on the box saying "requires a screwdriver", except pip fetches the screwdriver for you.

For a package that other people will install, keep the rules loose (`>=2.32`, or `>=2.32,<3` for "but not version 3"). Exact pins like `==2.34.2` make it impossible to install your package next to another one that needs a slightly different version.

You may also see `[project.optional-dependencies]`. These are **extras**: optional features that *users* can choose. With `color = ["colorama>=0.4"]`, people run `python -m pip install "tipcalc[color]"` to get the extra package as well. (Put it in quotes: some terminals give square brackets a special meaning.) Older tutorials put pytest and mypy in an extra called `dev`, installed with `python -m pip install -e ".[dev]"`. That works too, but dependency groups are the newer, cleaner way to list tools that users never need.

### Version numbers

Most Python packages use **semantic versioning**: three numbers, `MAJOR.MINOR.PATCH`, and each one has a meaning.

| Change | Example | When |
|---|---|---|
| PATCH | `0.1.0` to `0.1.1` | You fixed a bug. Nothing else changed. |
| MINOR | `0.1.1` to `0.2.0` | You added a feature, and everything old still works. |
| MAJOR | `0.2.0` to `1.0.0` | You changed something in a way that could break code or commands people already use. |

Versions that start with `0.` mean "still settling in, things may change". Moving to `1.0.0` is your promise that it's ready for real use.

A program can ask for any installed package's version with `importlib.metadata`:

```python
from importlib.metadata import version

print(version("tipcalc"))  # prints: 0.1.0
print(version("pytest"))  # prints: 9.1.1
```

That's the neat way to give your command a `--version` option, because the number then lives in one place only: `pyproject.toml`. argparse has a special `action="version"` for it. Add this to `build_parser()` in `cli.py`, before `return parser`, and add `from importlib.metadata import version` to the imports:

```python
    parser.add_argument(
        "--version", action="version", version=f"%(prog)s {version('tipcalc')}"
    )
```

```
tipcalc --version
```

```
tipcalc 0.1.0
```

(`%(prog)s` is argparse's way of saying "the program's name". It fills it in for you.)

> **Watch out:** The version is read when the package is **installed**, even with `-e`. If you change `version` in `pyproject.toml`, `tipcalc --version` still says `0.1.0` until you run `python -m pip install -e .` again. Your code changes are live, but changes to `pyproject.toml` need a reinstall.

### Building a wheel: `python -m build`

`pip install -e .` is for you, on your computer. To give `tipcalc` to someone else, you **build** it: pack it into files that pip can install anywhere. The standard tool is called `build`. Install it in your virtual environment, then run it from the project folder:

```
python -m pip install build
python -m build
```

```
* Creating isolated environment: venv+pip...
* Installing packages in isolated environment:
  - hatchling
* Getting build dependencies for sdist...
* Installed build dependency versions:
  - hatchling==1.32.4
* Building sdist...
* Building wheel from sdist
* Creating isolated environment: venv+pip...
* Installing packages in isolated environment:
  - hatchling
* Getting build dependencies for wheel...
* Installed build dependency versions:
  - hatchling==1.32.4
* Building wheel...
Successfully built tipcalc-0.1.0.tar.gz and tipcalc-0.1.0-py3-none-any.whl
```

(It needs the internet the first time, to fetch Hatchling.) There's a new `dist` folder with two files in it:

| File | What it is |
|---|---|
| `tipcalc-0.1.0-py3-none-any.whl` | The **wheel**: the finished package, ready to install. pip just unpacks it. This is the one people use. |
| `tipcalc-0.1.0.tar.gz` | The **sdist** (source distribution): a zipped copy of your project's source, with `pyproject.toml`. pip can build a wheel from it when there's no wheel that fits. |

The wheel's name is made of parts: the name, the version, then `py3-none-any`, which means "any Python 3, nothing compiled, any operating system". That's what you get for pure Python code, so this one wheel works on Windows, Mac and Linux.

A wheel is really just a zip file. If you look inside, there's your package (`tipcalc/__init__.py`, `tipcalc/calc.py`, and the rest) and a `tipcalc-0.1.0.dist-info` folder with the details from `pyproject.toml`. No tests, no `.gitignore`: only what users need.

Now pretend you're Maya. Make a brand-new folder somewhere else, called `try-tipcalc`, open a terminal there, and make and activate a fresh virtual environment. Then install the wheel by its path:

```
python -m pip install C:\Users\Sandip\projects\tip-calculator\dist\tipcalc-0.1.0-py3-none-any.whl
```

```
Processing C:\Users\Sandip\projects\tip-calculator\dist\tipcalc-0.1.0-py3-none-any.whl
Installing collected packages: tipcalc
Successfully installed tipcalc-0.1.0
```

`tipcalc 47.80 --percent 15 --people 3` works there too. And `python -m pip list` shows:

```
Package Version
------- -------
pip     26.2.1
tipcalc 0.1.0
```

No pytest, no mypy. Maya gets just the bookshelf, not the factory's tools.

> **Watch out:** Remember `Path(__file__).parent / "tasks.json"` from [chapter 26](../26-project-todo-app/notes.md), the trick to keep a data file next to your code? Once a package is installed normally, "next to your code" means deep inside `.venv\Lib\site-packages`. That's no place for someone's data: it disappears when the virtual environment is rebuilt, and on some computers it can't be written to at all. An installed tool should keep its data somewhere that belongs to the user. The simplest choice is the folder they run the command from, `Path("tasks.json")`, the way Git works on whatever folder you're in. Other choices are an option like `--file`, or a file in their home folder, `Path.home() / "tasks.json"`.

### Sharing your package

There are three common ways, from simplest to most public:

1. **Send the wheel.** Email it, or put it on a shared drive. Anyone with a recent Python can `pip install` the `.whl` file, as Maya just did.
2. **Install straight from Git.** If your project is on GitHub (and the person has Git installed), pip can fetch and build it in one go:

   ```
   python -m pip install git+https://github.com/sandip/tip-calculator.git
   ```

   pip clones the repository, builds a wheel with your `pyproject.toml`, and installs it. Add `@v0.1.0` to the end of the address to install one particular tag or branch.
3. **Publish on PyPI.** Then anyone in the world can run `python -m pip install tipcalc`. Publishing is permanent and public, so practise first on **TestPyPI** (<https://test.pypi.org>), a separate copy of PyPI for exactly this. The steps, in short:
   - Make an account on TestPyPI (and later on <https://pypi.org>), switch on two-factor login, and create an **API token**: a long password made just for uploading.
   - Pick a name that isn't taken. For practice, use something clearly yours, like `tipcalc-sandip`.
   - Install **twine**, the upload tool, and check your files: `python -m pip install twine`, then `python -m twine check dist/*`. (Both files should say `PASSED`.)
   - Upload to TestPyPI: `python -m twine upload --repository testpypi dist/*`. When it asks for your API token, paste it.
   - Test it from a fresh virtual environment: `python -m pip install --index-url https://test.pypi.org/simple/ tipcalc-sandip`.
   - When everything works, upload to the real PyPI with `python -m twine upload dist/*`.

   Each upload needs a **new version number**. PyPI never accepts the same version twice, not even after you delete it.

> **Watch out:** Uploading wasn't tried out for this chapter (filling the package index with practice packages isn't polite), so treat these steps as a map, not a recipe. They follow the official guide at <https://packaging.python.org/en/latest/tutorials/packaging-projects/>, which has screenshots and the latest details. Read it before your first upload, because the account and token steps change from time to time.

### `requirements.txt` or `pyproject.toml`?

You learned `requirements.txt` in chapter 23. Do you still need it? It depends on what you're making:

- **A library**, meaning code that other people install and import into *their* projects: list what it needs in `pyproject.toml`'s `dependencies`, with loose rules like `requests>=2.32`. Your package has to fit in next to everyone else's packages.
- **An application**, meaning a program that runs on its own, like a website on a server: you want the exact same versions everywhere, every time. That's what `pip freeze > requirements.txt` gives you: exact pins of everything, including dependencies of dependencies.

Lots of applications use both: `pyproject.toml` for the description and loose rules, and a pinned `requirements.txt` (or a newer **lock file**) for the exact versions on the server. For your own small tools, `pyproject.toml` alone is plenty.

### Other tools: uv, Poetry and Hatch

You've done everything here with pip, venv and build, which come with Python or install in one line. You'll also see all-in-one tools that wrap these jobs in fewer commands. **uv** (from chapter 23) can make a new project with `uv init --package`, add a dependency with `uv add`, and build with `uv build`. **Poetry** and **Hatch** are older all-in-one tools along the same lines. They all read and write the same `pyproject.toml`, so what you learned here carries straight over. They change quickly, so follow their own docs if you pick one up. Knowing the plain pip way first means you'll understand what they're doing for you.

## Common mistakes

**1. Running a file inside a package directly**

You're working on `cli.py`, which uses the relative import `from .calc import ...`, so you press Run in VS Code (or type `python src/tipcalc/cli.py 47.80`):

```
ImportError: attempted relative import with no known parent package
```

When you run a file directly, Python treats it as a lone script called `__main__`, not as part of the `tipcalc` package, so "the package this file is in" doesn't exist. With an absolute import, you get a different error instead: `ModuleNotFoundError: No module named 'tipcalc'` (if the package isn't installed). Either way, the fix is the same: run the package, not the file. Use `python -m tipcalc` or the `tipcalc` command, after `pip install -e .`.

**2. Forgetting `-e`**

You installed with `python -m pip install .` (no `-e`), then changed the default tip to 12 in `cli.py`. But `tipcalc 47.80` still says:

```
Tip:    $4.78 (10%)
```

Without `-e`, pip copied your code into `site-packages` at the moment you installed. Your edits change the original, not the copy. Run `python -m pip install -e .` once, and from then on every edit is live. (Check with `python -m pip list`: an editable install has a path in the `Editable project location` column.)

**3. Naming your package after a module that already exists**

Leo writes a family calendar package called `calendar`, installs it with `pip install -e .`, and tries it out:

```python
from calendar import add_event
```

```
ImportError: cannot import name 'add_event' from 'calendar' (C:\Users\Leo\AppData\Local\Programs\Python\Python313\Lib\calendar.py)
```

Look at the path: that's Python's own `calendar` module from the standard library. Python searches the standard library *before* `site-packages`, so Leo's package can never be found. It's the same trap as `random.py` in chapter 19 and `cowsay.py` in chapter 23, in a bigger form. Pick a name that isn't a standard library module (check <https://docs.python.org/3/py-modindex.html>), and if you might publish it, isn't taken on <https://pypi.org> either. `family_calendar` would be fine.

**4. The command isn't found**

```
tipcalc 47.80
```

```
tipcalc: The term 'tipcalc' is not recognized as a name of a cmdlet, function, script file, or executable program.
Check the spelling of the name, or if a path was included, verify that the path is correct and try again.
```

(Command Prompt says `'tipcalc' is not recognized as an internal or external command`.) The `tipcalc.exe` command lives inside `.venv\Scripts`, and that folder is only on the list of places Windows looks for commands while the virtual environment is active. Activate it (look for `(.venv)` in the prompt), and the command is back. If it's still missing, check that you installed the project into *this* environment, and that `[project.scripts]` is in `pyproject.toml`.

**5. Dashes and underscores**

Names on PyPI often have dashes, like `tip-calc`. But a dash means "minus" in Python, so it can't be part of an import:

```python
import tip-calc
```

```
SyntaxError: invalid syntax
```

The convention: the name in `pyproject.toml` (what people `pip install`) may use a dash, and the package folder (what people `import`) uses an underscore instead: `name = "tip-calc"`, with the folder `src/tip_calc`, imported as `import tip_calc`. pip treats `tip-calc` and `tip_calc` as the same name, so either works for installing. Hatchling uses that rule to find your package folder. If the folder's name doesn't match the project's name at all (say `name = "tip-calculator"` but the folder is `src/tipcalc`), installing fails with an error that ends like this:

```
ValueError: Unable to determine which files to ship inside the wheel using the following heuristics: https://hatch.pypa.io/latest/plugins/builder/wheel/#default-file-selection

The most likely cause of this is that there is no directory that matches the name of your project (tip_calculator).
```

Either rename one of them so they match, or tell Hatchling where the package is, as the rest of the message suggests:

```
[tool.hatch.build.targets.wheel]
packages = ["src/tipcalc"]
```

**6. Not bumping the version**

Sandip fixes a bug, runs `python -m build` again, and sends Maya the new wheel. She installs it over the old one:

```
tipcalc is already installed with the same version as the provided wheel. Use --force-reinstall to force an installation of the wheel.
```

Both wheels say `0.1.0`, so as far as pip can tell, Maya already has it, and it keeps her old, buggy copy. Every release that you give to other people needs a new version number: a bug fix makes it `0.1.1`. Change `version` in `pyproject.toml` *before* you build. (PyPI is even stricter: it refuses to accept a version number it has seen before.)

## Quick recap

- Give a bigger project a clear shape: the package in `src/yourpackage/` (with `__init__.py` and a `__main__.py` for `python -m yourpackage`), tests in `tests/`, plus `pyproject.toml`, `README.md` and `.gitignore` at the top.
- Use absolute imports (`from tipcalc.calc import split`). Run packages with `python -m`, never their files directly.
- `pyproject.toml` describes the project: `[build-system]` (who builds it, like Hatchling), `[project]` (name, version, description, readme, requires-python, dependencies), `[project.scripts]` (commands), `[dependency-groups]` (your dev tools), and `[tool.*]` settings for pytest and mypy.
- `python -m pip install -e . --group dev` installs your project, editable, with your tools. Your command works from any folder while the virtual environment is active, and your code changes are live.
- Versions are `MAJOR.MINOR.PATCH`. Read them with `importlib.metadata.version()`, and bump the version before every release.
- `python -m build` makes a wheel (`.whl`) and an sdist (`.tar.gz`) in `dist/`. Share the wheel, install from Git with `git+https://...`, or publish on PyPI with twine (practise on TestPyPI first).
- Libraries list loose dependencies in `pyproject.toml`. Applications often pin exact versions in `requirements.txt` as well.

---

**Next:** try the [exercises](exercises.md), then move on to [40 Working with APIs](../40-working-with-apis/notes.md).
