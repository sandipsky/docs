# 45 Automating Tasks: Exercises

**How to do these:**

- Work in the folder you used for the notes (or make a new one in this chapter's folder), next to `make_practice_folder.py` from the notes. Make a new file for each exercise (`ex1.py`, `ex2.py`, and so on), and run it with `python ex1.py` from a terminal opened in that folder.
- **Start every exercise with a fresh practice folder:** delete the `practice` folder in VS Code's Explorer, then run `python make_practice_folder.py`. The expected outputs below all start from there.
- Only ever point these scripts at the practice folder. Never at your real Downloads or Documents.
- Everything you need is in the standard library, so there's nothing to install. Put type hints on every function, and if you have mypy in a virtual environment, check each file with `python -m mypy ex1.py`.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): What's taking up space?

Before tidying a folder, it helps to know what's in it. Write `ex1.py` that looks at every file in `practice/Downloads`, **including the ones in subfolders**, and prints a table: for each kind of file (its extension, in lowercase), how many files there are and how much space they take in KB. Files with no extension count as `(none)`. Put the biggest total first, and add a total line at the end.

Expected output:

```
Type     Files      KB
.mp4         1     8.8
.exe         1     6.8
.jpg         3     6.7
.mp3         1     4.9
.zip         1     3.9
.pdf         2     1.5
.docx        1     0.8
.xlsx        1     0.6
.txt         1     0.1
(none)       1     0.0
Total       13    34.1
```

Notice `.jpg` has 3 files, even though one of them is called `IMG_2043.JPG`, and `.pdf` has 2, because of the receipt in `old stuff`.

<details>
<summary>Hint 1</summary>

`folder.rglob("*")` gives you everything, folders included, so keep only the paths where `path.is_file()` is true. The size is `path.stat().st_size`, in bytes. Divide by 1024 for KB.

</details>

<details>
<summary>Hint 2</summary>

A dictionary works well for the totals, with the extension as the key. `path.suffix.lower() or "(none)"` gives `"(none)"` when the suffix is the empty string, because an empty string is falsy ([chapter 08](../08-conditionals/notes.md)).

</details>

<details>
<summary>Hint 3</summary>

To put the biggest first, sort the dictionary's `.items()` with a `key=` that picks out the total size, and `reverse=True` ([chapter 34](../34-functional-tools/notes.md)). The table uses the padding from [chapter 06](../06-strings/notes.md): `:<8` for the type, `:>6` for the count and `:>8.1f` for the KB.

</details>

---

## Exercise 2 (Easy): A smart document backup

Leo wants a backup of his documents, but copying everything every night is slow. Write `ex2.py` that copies every document (`.pdf`, `.docx`, `.xlsx` and `.txt`, in any capitals) from `practice/Downloads` **and its subfolders** into one folder, `practice/DocBackup`. It should only copy what's needed:

- If the backup doesn't have the file yet, copy it, and print `Copied <name>`.
- If the backup has a file with that name, **and** it has the same size and the same last-changed time, it's up to date: skip it quietly.
- Otherwise the original has changed: copy it again, and print `Updated <name>`.

Go through the files in alphabetical order of their names (ignoring capitals), and finish with a summary line. Keep the original "last changed" times on the copies, or the "up to date" check can never work.

The first run:

```
Copied bank statement.pdf
Copied budget.xlsx
Copied CV Sandip.docx
Copied notes.txt
Copied receipt.pdf
5 copied, 0 updated, 0 up to date
```

Run it again straight away:

```
0 copied, 0 updated, 5 up to date
```

Now open `practice/Downloads/notes.txt` in VS Code, add a line (like `Pick up the dry cleaning`), save it, and run once more:

```
Updated notes.txt
0 copied, 1 updated, 4 up to date
```

In a comment, answer: why would the "up to date" check fail every time if you used `shutil.copy` instead of `shutil.copy2`?

<details>
<summary>Hint 1</summary>

Build a list of the documents with `rglob("*")`, keeping files whose `path.suffix.lower()` is in a set of document extensions. Then sort that list with `key=lambda path: path.name.lower()`.

</details>

<details>
<summary>Hint 2</summary>

A small helper keeps the main loop readable: `def same_file(a: Path, b: Path) -> bool:` that compares `st_size` and `st_mtime` from both files' `.stat()`.

</details>

<details>
<summary>Hint 3</summary>

Updating a copy *in the backup folder* is fine, even though the notes say "never overwrite": that folder belongs to your script, and its whole job is to hold the newest copy of each document. Your original files are never touched.

</details>

---

## Exercise 3 (Medium): Tidy recipe names

Maya's recipe folder is a mess of capitals, spaces and "FINAL" versions. First, save this as `make_recipes.py` and run it:

```python
from pathlib import Path

RECIPES = Path(__file__).parent / "practice" / "Recipes"
MESSY_NAMES = [
    "Dal Bhat FINAL.TXT",
    "chicken  curry.txt",
    "Veg_Momo.txt",
    "Mango Lassi (copy).txt",
    "mango lassi.txt",
    "pancakes.txt",
]

RECIPES.mkdir(parents=True, exist_ok=True)
for name in MESSY_NAMES:
    (RECIPES / name).write_text(f"Recipe: {name}\n", encoding="utf-8")
print(f"Made {len(MESSY_NAMES)} recipe files in {RECIPES}")
```

(Look closely: `chicken  curry.txt` has two spaces.) Now write `ex3.py`, a command-line tool that takes a folder and an `--apply` flag, and gives every file a tidy name using these rules:

1. Make the name lowercase.
2. Remove the word `final` and the text `(copy)`.
3. Turn every run of spaces, underscores or dashes into a single dash, and remove any dashes left at the start or end.
4. Put the extension back, in lowercase.

So `Dal Bhat FINAL.TXT` becomes `dal-bhat.txt`. Files whose name is already tidy are left alone, silently. If a new name is already taken, by a file that's there or by an earlier rename in the same run, skip that file and say so. Go through the files in alphabetical order, ignoring capitals.

`python ex3.py practice/Recipes`:

```
Would rename 'chicken  curry.txt' -> 'chicken-curry.txt'
Would rename 'Dal Bhat FINAL.TXT' -> 'dal-bhat.txt'
Would rename 'Mango Lassi (copy).txt' -> 'mango-lassi.txt'
Skipped 'mango lassi.txt': 'mango-lassi.txt' is already taken
Would rename 'Veg_Momo.txt' -> 'veg-momo.txt'
Dry run: 4 to rename, 1 skipped. Add --apply to do it.
```

`python ex3.py practice/Recipes --apply` prints the same lines with `Renamed` instead of `Would rename`, and ends with `Done: 4 renamed, 1 skipped.` Run the dry run once more afterwards:

```
Skipped 'mango lassi.txt': 'mango-lassi.txt' is already taken
Dry run: 0 to rename, 1 skipped. Add --apply to do it.
```

The two mango lassi files are a decision for a human (which one is the real recipe?), and your script was right not to guess.

<details>
<summary>Hint 1</summary>

The quotes come from `!r` ([chapter 29](../29-dunder-methods/notes.md)): `f"{path.name!r}"`. It makes the double space in `'chicken  curry.txt'` easy to see.

</details>

<details>
<summary>Hint 2</summary>

Write `def clean_name(path: Path) -> str:` and test it on its own first. Two `re.sub` calls ([chapter 35](../35-regular-expressions/notes.md)) do most of the work: one that replaces `\(copy\)` or the whole word `final` (`\bfinal\b`) with nothing, and one that replaces `[\s_-]+` with `"-"`. Then `.strip("-")` tidies the ends.

</details>

<details>
<summary>Hint 3</summary>

Checking `new_path.exists()` isn't enough in a dry run, because nothing has really been renamed yet. Keep a set of names that are taken: start it with the names of every file in the folder, and add each new name as you plan it. Then `if new_name in taken:` catches both kinds of clash.

</details>

---

## Exercise 4 (Medium): A job runner with a time limit

Aisha runs three little scripts every morning, and wants one tool that runs them all and tells her what happened. Save these three files:

`job_backup.py`

```python
print("Backup finished: 12 files")
```

`job_report.py`

```python
import sys

print("Report failed: no sales data for today", file=sys.stderr)
sys.exit(2)
```

`job_slow.py`

```python
import time

time.sleep(5)
print("Slow job done")
```

Write `run_jobs.py`, which runs the three jobs in that order with `subprocess`, using `sys.executable`, and prints one line per job:

- If it worked (exit code 0): `OK`, and what the job printed.
- If it failed: `FAILED`, the exit code, and what the job printed to its error channel.
- If it was still running after 2 seconds: `TIMEOUT`. (The new part: `subprocess.run(..., timeout=2)` stops the program after 2 seconds and raises `subprocess.TimeoutExpired`.)

At the end, if any job had a problem, print how many and exit with code `1`. Otherwise print `All jobs went well.`

`python run_jobs.py` (it takes about 2 seconds), then `$LASTEXITCODE`:

```
job_backup.py   OK       Backup finished: 12 files
job_report.py   FAILED   exit code 2: Report failed: no sales data for today
job_slow.py     TIMEOUT  still running after 2 seconds, stopped
2 of 3 jobs had problems.
1
```

Then change the time limit to 10 seconds, and run it again:

```
job_backup.py   OK       Backup finished: 12 files
job_report.py   FAILED   exit code 2: Report failed: no sales data for today
job_slow.py     OK       Slow job done
1 of 3 jobs had problems.
```

<details>
<summary>Hint 1</summary>

Put the time limit in a constant at the top (`TIME_LIMIT = 2`), so changing it is one edit. A function like `def run_job(script: str) -> bool:` that prints the line and returns whether the job went well keeps the main loop short.

</details>

<details>
<summary>Hint 2</summary>

Don't use `check=True` here: a failed job isn't a reason to stop, it's something to report. Look at `result.returncode` instead, and use `result.stdout.strip()` or `result.stderr.strip()` for the message. Wrap the `subprocess.run(...)` call in `try`/`except subprocess.TimeoutExpired:` for the slow one.

</details>

<details>
<summary>Hint 3</summary>

The columns are `f"{script:<16}"` followed by the status padded to 9 characters. And remember from [chapter 24](../24-command-line-programs/notes.md) why the exit code matters: when Task Scheduler runs `run_jobs.py`, the exit code is all it sees.

</details>

---

## Exercise 5 (Challenge): Archive old downloads

Sam never deletes anything, so his Downloads folder only grows. He wants a tool that moves files he hasn't touched in a while into an archive, sorted by month. Write `archive_old.py`:

- **Which folder:** a folder given on the command line, or, if none is given, the folder in the environment variable `ARCHIVE_SOURCE`. With neither, print `Error: give a folder, or set ARCHIVE_SOURCE` to standard error and exit with code `1`.
- **Which files:** only the files directly in that folder (not folders, and not files inside subfolders), whose last change was **more than** `--days` days before today (default: 30).
- **Where to:** `Archive/YYYY-MM/` inside the folder, using the month the file was last changed. Never overwrite: if the name is taken, use `name (1).ext` and so on.
- **Safety:** a dry run unless you add `--apply`. Every real move is logged to `archive.log`, next to the script.
- **Testing:** a `--today` option (a date like `2026-10-12`, default: the real today), so you can try it out on any day and get the outputs below.

`python archive_old.py practice/Downloads --today 2026-10-12`:

```
Would archive CV Sandip.docx -> Archive\2026-08\CV Sandip.docx (53 days old)
Would archive setup.exe -> Archive\2026-06\setup.exe (132 days old)
Would archive song.mp3 -> Archive\2026-07\song.mp3 (74 days old)
Dry run: 3 files to archive. Add --apply to move them.
```

`python archive_old.py practice/Downloads --today 2026-10-12 --days 25`:

```
Would archive CV Sandip.docx -> Archive\2026-08\CV Sandip.docx (53 days old)
Would archive holiday video.mp4 -> Archive\2026-09\holiday video.mp4 (27 days old)
Would archive IMG_2041.jpg -> Archive\2026-09\IMG_2041.jpg (28 days old)
Would archive IMG_2042.jpg -> Archive\2026-09\IMG_2042.jpg (28 days old)
Would archive IMG_2043.JPG -> Archive\2026-09\IMG_2043.JPG (27 days old)
Would archive photos.zip -> Archive\2026-09\photos.zip (26 days old)
Would archive setup.exe -> Archive\2026-06\setup.exe (132 days old)
Would archive song.mp3 -> Archive\2026-07\song.mp3 (74 days old)
Dry run: 8 files to archive. Add --apply to move them.
```

Now use the environment variable, and do it for real (in PowerShell):

```
$env:ARCHIVE_SOURCE = "practice\Downloads"
python archive_old.py --today 2026-10-12 --apply
```

```
Archived CV Sandip.docx -> Archive\2026-08\CV Sandip.docx (53 days old)
Archived setup.exe -> Archive\2026-06\setup.exe (132 days old)
Archived song.mp3 -> Archive\2026-07\song.mp3 (74 days old)
Done: archived 3 files.
```

`archive.log` now has three lines like `2026-10-12 11:39:19 INFO Archived practice\Downloads\CV Sandip.docx -> practice\Downloads\Archive\2026-08\CV Sandip.docx` (with your own time). Run the dry run again, and it finds nothing: `Dry run: 0 files to archive. Add --apply to move them.` Finally, close the terminal (so the variable is gone), open a new one, and check that `python archive_old.py` gives the error and `$LASTEXITCODE` is `1`, and that a date like `--today 12/10/2026` is rejected by argparse:

```
archive_old.py: error: argument --today: invalid fromisoformat value: '12/10/2026'
```

<details>
<summary>Hint 1</summary>

argparse's `type=` takes any function that turns a string into a value, not just `int`. So `type=date.fromisoformat` turns `--today 2026-10-12` into a real `date` ([chapter 22](../22-dates-and-times/notes.md)), and rejects anything else. For the optional folder, use `nargs="?"` ([chapter 24](../24-command-line-programs/notes.md)) with `default=os.environ.get("ARCHIVE_SOURCE")`.

</details>

<details>
<summary>Hint 2</summary>

`datetime.fromtimestamp(path.stat().st_mtime).date()` gives the day a file was last changed. Subtract it from `today` and take `.days` for its age. `f"{changed:%Y-%m}"` gives the month folder's name.

</details>

<details>
<summary>Hint 3</summary>

Reuse `unique_path` from `organize.py` in the notes, and its logging setup. Remember `parents=True` when you make the month folder, because `Archive` might not exist yet either. Because you only look at files directly in the folder, the `Archive` folder itself (and everything already in it) is skipped automatically.

</details>

---

## Before you move on

You can now make the computer do the boring jobs: find files, copy and move them safely, rename hundreds at once, run other programs, and do it all on a timer while you sleep. Most importantly, you know how to do it without wrecking anything: fake files first, dry runs, no deleting, no overwriting, and a log of everything.

The next chapter is the last project of Level 4. In [chapter 46](../46-project-expense-tracker-api/notes.md), you'll bring together FastAPI from chapter 43 and the database from chapter 42 to build an expense tracker API, ready for a React front end.
