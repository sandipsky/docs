# 39 Project Structure and Packaging: Exercises

**How to do these:**

- Exercises 1 to 4 build **one project**, step by step: a temperature converter, in a folder called `temp-converter` in this chapter's folder. Each exercise starts where the one before it ended. (If you'd like to keep each stage, copy the folder before you start the next exercise.)
- Exercise 5 packages your finished library system from [chapter 38](../38-project-library-system/notes.md).
- Run every command from a terminal opened in the project folder, unless the exercise says otherwise. When an exercise asks for a virtual environment, make it in the project folder as `.venv`, like in the notes.
- The first install needs the internet, because pip downloads Hatchling (the build backend) for you.
- Put hints on every function, and check your work with mypy when the exercise says so.
- Your file paths will be different from the ones shown. Everything else should match.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): From one script to a package

Zoe is moving to Chicago, where the weather forecast is in Fahrenheit. She wrote this little converter as one file, `tempconv.py`:

```python
import argparse


def c_to_f(celsius: float) -> float:
    """Turn degrees Celsius into degrees Fahrenheit."""
    return celsius * 9 / 5 + 32


def f_to_c(fahrenheit: float) -> float:
    """Turn degrees Fahrenheit into degrees Celsius."""
    return (fahrenheit - 32) * 5 / 9


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Convert temperatures.")
    parser.add_argument("degrees", type=float, help="the temperature to convert")
    parser.add_argument(
        "--to", choices=["c", "f"], default="f", help="the scale to convert to"
    )
    return parser


def main() -> None:
    args = build_parser().parse_args()
    if args.to == "f":
        print(f"{args.degrees:.1f} C = {c_to_f(args.degrees):.1f} F")
    else:
        print(f"{args.degrees:.1f} F = {f_to_c(args.degrees):.1f} C")


if __name__ == "__main__":
    main()
```

Turn it into a package called `tempconv`, inside a project folder called `temp-converter`:

```
temp-converter/
└── tempconv/
    ├── __init__.py
    ├── __main__.py
    ├── convert.py
    └── cli.py
```

- `__init__.py` holds a one-line docstring describing the package.
- `convert.py` holds the two conversion functions, and nothing else.
- `cli.py` holds `build_parser()` and `main()`, and imports what it needs from `convert.py` with an absolute import. Give the parser `prog="tempconv"`.
- `__main__.py` starts the program.

From the `temp-converter` folder, you should see:

```
python -m tempconv 100
100.0 C = 212.0 F

python -m tempconv 451 --to c
451.0 F = 232.8 C
```

and `python -m tempconv -h` should start with `usage: tempconv [-h] [--to {c,f}] degrees`.

Then try two things that **don't** work, and write down why in a comment at the top of `cli.py`:

1. `python tempconv/cli.py 100` gives `ModuleNotFoundError: No module named 'tempconv'`.
2. After `cd ..`, `python -m tempconv 100` gives `No module named tempconv`. (Go back with `cd temp-converter` afterwards.)

<details>
<summary>Hint 1</summary>

The import line in `cli.py` is `from tempconv.convert import c_to_f, f_to_c`. `cli.py` doesn't need the `if __name__ == "__main__":` block any more: that's `__main__.py`'s job now.

</details>

<details>
<summary>Hint 2</summary>

`__main__.py` is just three lines: import `main` from `tempconv.cli`, a blank line, and call `main()`. Look at the `tipcalc` one in the notes.

</details>

<details>
<summary>Hint 3</summary>

For the questions: when you run a file directly, which folder does Python search first ([chapter 19](../19-modules-and-standard-library/notes.md))? Is there a `tempconv` folder inside `tempconv/`? And with `python -m`, which folder is searched first?

</details>

---

## Exercise 2 (Easy): The src layout and a real command

Now give the project its proper shape, so Zoe can type `tempconv` from any folder.

1. Move the `tempconv` package into a new `src` folder, so it's at `temp-converter/src/tempconv/`.
2. Add a short `README.md` (a heading, one sentence, and an example command), and a `.gitignore` with the five lines from the notes.
3. Write `pyproject.toml`. Use Hatchling as the build backend. The project is called `tempconv`, version `0.1.0`, with the description `Convert temperatures between Celsius and Fahrenheit.`, your README, Python 3.13 or newer, and no dependencies. It adds a command called `tempconv` that runs `main()` from `tempconv.cli`.

Before you install anything, run `python -m tempconv 37` from `temp-converter`. You'll see `No module named tempconv`. Explain why, in a `#` comment at the top of `pyproject.toml`.

Now make and activate a virtual environment in `temp-converter`, and install the project in editable mode. The output should end with:

```
Successfully installed tempconv-0.1.0
```

Then:

```
tempconv 37
37.0 C = 98.6 F
```

Go up one folder with `cd ..` and check that it works from there too (go back afterwards):

```
tempconv 451 --to c
451.0 F = 232.8 C

python -m tempconv -40
-40.0 C = -40.0 F
```

Finally, `python -m pip list` should show `tempconv` with a path in the last column:

```
Package  Version Editable project location
-------- ------- -------------------------
pip      26.2.1
tempconv 0.1.0   C:\...\temp-converter
```

(Your pip version may be newer, and the path will be your real one.)

<details>
<summary>Hint 1</summary>

Copy the `[build-system]` and `[project]` tables from the notes, and change the values. Remember that every text value in TOML needs double quotes, and `dependencies` is a list, even when it's empty.

</details>

<details>
<summary>Hint 2</summary>

The command goes in `[project.scripts]`, as `command name = "module:function"`. The module part uses dots, exactly like an import.

</details>

<details>
<summary>Hint 3</summary>

If `pip install -e .` fails with `Unable to determine which files to ship inside the wheel`, the `name` in `pyproject.toml` doesn't match the folder in `src`. Check both for typos.

</details>

---

## Exercise 3 (Medium): Tests, dev tools and settings

A converter that gives wrong temperatures is worse than none. Add tests, and let `pyproject.toml` set up the tools.

1. Make `tests/test_convert.py` (in `temp-converter`, next to `src`) with these tests:
   - `test_water_boils`: 100 C is 212 F.
   - `test_water_freezes`: 32 F is 0 C.
   - `test_body_temperature`: 37 C is 98.6 F. (Careful: that's a `float`. See [chapter 36](../36-testing-with-pytest/notes.md).)
   - `test_minus_40_is_the_same_on_both_scales`: -40 converts to -40 in **both** directions.
   - `test_there_and_back`: parametrized with `-10.5`, `0`, `21.3`, `36.6` and `1000`. Converting each one to Fahrenheit and back to Celsius gives the number you started with.
2. In `pyproject.toml`, add a `dev` dependency group with pytest and mypy, tell pytest that the tests are in `tests`, and tell mypy to check `src` and `tests`.
3. Install the project again, this time with the dev group.

Now `python -m pytest`, with no other arguments, should show:

```
============================= test session starts =============================
platform win32 -- Python 3.13.15, pytest-9.1.1, pluggy-1.6.0
rootdir: C:\...\temp-converter
configfile: pyproject.toml
testpaths: tests
collected 9 items

tests\test_convert.py .........                                          [100%]

============================== 9 passed in 0.03s ==============================
```

and `python -m mypy`, also with no other arguments:

```
Success: no issues found in 5 source files
```

Last, run plain `pytest` (no `python -m`). It passes too. In [chapter 36](../36-testing-with-pytest/notes.md), plain `pytest` couldn't find your code when the tests were in their own folder. Answer in a comment at the top of `test_convert.py`: why does it work now?

<details>
<summary>Hint 1</summary>

The tests import from the installed package, exactly like a user would: `from tempconv.convert import c_to_f, f_to_c`.

</details>

<details>
<summary>Hint 2</summary>

`c_to_f(37)` is really `98.60000000000001`, so `==` fails. Which pytest helper means "close enough"? The there-and-back test needs it too.

</details>

<details>
<summary>Hint 3</summary>

The install command is `python -m pip install -e . --group dev`. If pip says `no such option: --group`, your pip is older than 25.1: run `python -m pip install --upgrade pip` first.

</details>

---

## Exercise 4 (Medium): Version 0.2.0, installed like a user

Time to ship it to Zoe, and then ship an update.

**Part A: version 0.1.0.**

1. Give `tempconv` a `--version` option that reads the version with `importlib.metadata`, so that `tempconv --version` prints `tempconv 0.1.0`.
2. Install `build` in your virtual environment and build the project. The last line should be:

   ```
   Successfully built tempconv-0.1.0.tar.gz and tempconv-0.1.0-py3-none-any.whl
   ```

3. Be Zoe. Open a **second terminal** in a new folder called `try-tempconv`, next to `temp-converter` (not inside it). Make and activate a fresh virtual environment there, and install the wheel by its path. Then:

   ```
   tempconv 20
   20.0 C = 68.0 F

   tempconv --version
   tempconv 0.1.0
   ```

   and `python -m pip list` shows only two packages:

   ```
   Package  Version
   -------- -------
   pip      26.2.1
   tempconv 0.1.0
   ```

**Part B: a new feature.** Back in the first terminal (in `temp-converter`), add kelvin. Kelvin is the scientists' temperature scale: 0 C is 273.15 K.

1. Add `c_to_k(celsius: float) -> float` to `convert.py`.
2. Add `k` to the `--to` choices. For `k`, the input is in Celsius, and the answer is shown with **two** decimals: `tempconv 20 --to k` prints `20.0 C = 293.15 K`.
3. Add `test_kelvin`: 0 C is 273.15 K. Now `python -m pytest` shows `10 passed`, and mypy still says `Success`.

**Part C: shipping the update.** First, make the classic mistake on purpose: build again **without** changing the version, and in Zoe's terminal, install the new wheel. You'll see:

```
tempconv is already installed with the same version as the provided wheel. Use --force-reinstall to force an installation of the wheel.
```

and `tempconv 20 --to k` still fails, because Zoe still has the old code:

```
usage: tempconv [-h] [--to {c,f}] [--version] degrees
tempconv: error: argument --to: invalid choice: 'k' (choose from 'c', 'f')
```

Now do it properly. You added a feature, and nothing old broke. Which part of the version number changes? Change it in `pyproject.toml`, build again, and install the new wheel in Zoe's terminal. The output ends with:

```
Installing collected packages: tempconv
  Attempting uninstall: tempconv
    Found existing installation: tempconv 0.1.0
    Uninstalling tempconv-0.1.0:
      Successfully uninstalled tempconv-0.1.0
Successfully installed tempconv-0.2.0
```

And then:

```
tempconv 20 --to k
20.0 C = 293.15 K

tempconv --version
tempconv 0.2.0
```

<details>
<summary>Hint 1</summary>

For `--version`, copy the `add_argument` call from the notes and change the package name inside `version(...)`. Import it with `from importlib.metadata import version`.

</details>

<details>
<summary>Hint 2</summary>

To install the wheel from `try-tempconv`, give pip the path to the file in the other folder's `dist`, like `python -m pip install ..\temp-converter\dist\tempconv-0.1.0-py3-none-any.whl`. `..` means "the folder above this one".

</details>

<details>
<summary>Hint 3</summary>

In `main()`, the three choices are a good fit for `if`, `elif` and `else`. Remember that `:.2f` shows two decimals.

</details>

<details>
<summary>Hint 4</summary>

Semantic versioning: `MAJOR.MINOR.PATCH`. A new feature that doesn't break anything is a MINOR change, and the PATCH number goes back to 0.

</details>

---

## Exercise 5 (Challenge): Package the library system

Your library system from [chapter 38](../38-project-library-system/notes.md) works, but only from inside `my-library`, and only as `python main.py`. Turn it into a proper package with a `library` command that works from any folder, so the librarian can keep the library's data wherever she likes.

**Don't change `my-library`.** Make a new project folder called `library-system` in this chapter's folder, and copy in only your code and tests: the five modules (`models.py`, `errors.py`, `library.py`, `storage.py` and `main.py`) and the `tests` folder. Leave behind `.venv`, `__pycache__`, `library.json` and `library.log`.

1. **Layout.** Put the five modules into `src/library_system/`, add an `__init__.py` (a one-line docstring) and a `__main__.py`, and keep `tests/` at the top, next to `src`.
2. **Imports.** Your modules import each other with lines like `from errors import LibraryError`. Change every one of them, in the modules **and** in the tests, to absolute imports from the package, like `from library_system.errors import LibraryError`.
3. **The data file and the log.** In chapter 38, `library.json` and `library.log` live next to the code, thanks to `Path(__file__).parent`. Once the package is installed, that would be inside `.venv` (read the **Watch out** about data files in the notes). Change both paths so that the files are in the **folder the command is run from**.
4. **The command's name.** Give the parser `prog="library"`, so the help screen says `usage: library ...`.
5. **`pyproject.toml`.** Hatchling as the backend. The project name is `library-system`, version `1.0.0` (it's finished, after all), with a one-sentence description, a README, Python 3.13 or newer, and no dependencies. Add a command called `library` that runs `main()` from `library_system.main`, a `dev` group with pytest and mypy, and the pytest and mypy settings from the notes. Write a short `README.md`, and a `.gitignore` that also lists `library.json` and `library.log` (a library's data is private, and doesn't belong in Git).
6. **Install and check.** Make a virtual environment in `library-system`, and install the project, editable, with the dev group. Then `python -m pytest` should pass every test you had at the end of chapter 38 (`21 passed` if you didn't add any in the stretch goals), and `python -m mypy` should say:

   ```
   Success: no issues found in 9 source files
   ```

   That's your five modules, `__init__.py`, `__main__.py` and the two test files.
7. **Use it from somewhere else.** Make a folder called `my-shelf` anywhere you like, outside `library-system`. Copy the sample `library.json` from chapter 38's `starter` folder into it, open a terminal there, and activate the `library-system` virtual environment. (From inside `my-shelf`, the activate command needs the full path, like `C:\...\library-system\.venv\Scripts\Activate.ps1`.) Then:

   ```
   library --today 2026-10-12 overdue
   Due         Late  Fine   Member  Book
   2026-10-02    10  $2.50  Sandip  The Hobbit by J.R.R. Tolkien
   2026-10-09     3  $0.75  Leo     Coraline by Neil Gaiman
   2 overdue loans, $3.25 in fines so far
   ```

   That's exactly what chapter 38 printed. `python -m library_system --today 2026-10-12 books` should end with `8 books: 3 on the shelf, 5 on loan, 2 overdue`. And check that `library.log` appeared in `my-shelf`, not in `src`.
8. **Ship it.** Build the project. Notice the underscore in the file names:

   ```
   Successfully built library_system-1.0.0.tar.gz and library_system-1.0.0-py3-none-any.whl
   ```

   Then, in another new folder with a fresh virtual environment and a fresh copy of the sample `library.json`, install the wheel and lend a book:

   ```
   library --today 2026-10-12 lend B001 M004
   Lent Dune by Frank Herbert to Zoe. Due back 2026-10-26.
   ```

   `python -m pip list` in that environment shows only `library-system 1.0.0` and pip.

<details>
<summary>Hint 1</summary>

Search the whole folder for `from errors`, `from models`, `from library` and `from storage` (in VS Code, `Ctrl+Shift+F`). Every hit needs `library_system.` in front of the module name. The standard library imports, like `from datetime import date`, stay as they are.

</details>

<details>
<summary>Hint 2</summary>

A path with no folder in front, like `Path("library.json")`, means "in the current working directory": the folder the terminal is standing in ([chapter 20](../20-files-and-folders/notes.md)). That's the opposite of the advice in chapter 26, and on purpose: an installed tool works on *your* folder, like Git does.

</details>

<details>
<summary>Hint 3</summary>

The project's name has a dash (`library-system`), and the package folder has an underscore (`library_system`). Hatchling treats those as a match. If install says `Unable to determine which files to ship inside the wheel`, check the folder's spelling, or look at mistake 5 in the notes.

</details>

<details>
<summary>Hint 4</summary>

If `library` gives `not recognized`, the virtual environment isn't active in that terminal. If `python -m pytest` gives `No module named 'library_system'`, the project isn't installed in the active environment yet: run the editable install from the `library-system` folder.

</details>

---

## Before you move on

Your projects now have a proper shape: a package anyone can install with one command, tests that test what users get, and all the settings in one `pyproject.toml`. That's how real Python projects are built, and you'll use this layout from here on. Next, your programs reach out to the internet: in [chapter 40](../40-working-with-apis/notes.md), you'll fetch live weather data from a web API with `requests`, which you could now list as a dependency of your own package.
