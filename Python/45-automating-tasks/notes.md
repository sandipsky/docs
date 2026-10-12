# 45 Automating Tasks

## What is it?

**Automating** a task means writing a script that does a boring job for you, so you never have to do it by hand again. The script works through the files, runs the programs or makes the backups, the same way every time, while you get on with something else.

In this chapter you'll write scripts that tidy a messy folder, rename a pile of photos, zip up a backup with today's date in its name, run other programs, and start all by themselves at a set time every night.

## Why does it matter?

Look at a typical Downloads folder: 300 files, with photos, PDFs, installers and zip files all mixed together. Sorting them by hand means dragging files one at a time for an hour. Next month, it's a mess again.

Or think about the 250 holiday photos your phone called `IMG_2041.jpg`, `IMG_2042.jpg` and so on. Renaming them to something like `2026-09-holiday-001.jpg` by hand is slow, and you'll make typos. And backing up your notes "every evening" only works until the first evening you forget.

Computers love this kind of work. A script sorts 300 files in under a second, never gets bored, never makes typos, and never forgets. Once it's written, the job costs you nothing.

There's one catch, and it's a big one: a script that can move 300 files in a second can also **make a mess** of 300 files in a second. So this chapter is as much about doing it safely as about doing it at all.

## Real-world example

Think of a dishwasher with a timer.

| A dishwasher | An automation script |
|---|---|
| You load it, choose a programme, and walk away | You point the script at a folder, choose options, and let it run |
| The timer starts it at night, while you sleep | Windows Task Scheduler starts your script at a set time |
| The first time, you check the glasses before trusting it with the good plates | A **dry run**: the script only says what it *would* do |
| It washes dishes; it never throws them away | Move files into an archive folder; don't delete them |
| The display shows what it did, and any error codes | A log file, and the script's exit code |
| You don't stand next to it while it runs | Nobody is watching, so the script must cope on its own |

## How it works

### Safety first: practise on fake files

Before any script touches your real files, it gets tested on fake ones. These four rules will keep you out of trouble in this chapter and long after it:

1. **Practise on a test folder.** Never point a new script at your real Downloads or Documents folder first.
2. **Dry run first.** Make the script print what it *would* do, and only really do it when you add an option like `--apply`.
3. **Move, don't delete.** A file in the wrong folder can be moved back. A deleted file is usually gone (Python doesn't use the Recycle Bin).
4. **Never overwrite, and keep a log.** Check before replacing anything, and write down what happened, so you can see (and undo) it later.

Make a folder for this chapter's scripts, for example `tidy`, and open a terminal in it. Then save this script as `make_practice_folder.py`. It makes a fake Downloads folder full of fake files, with different sizes and dates:

```python
"""Make a practice folder full of fake files, so you can test safely."""

import os
from datetime import datetime
from pathlib import Path

PRACTICE = Path(__file__).parent / "practice" / "Downloads"

# (name, size in bytes, the day it was last changed)
FAKE_FILES = [
    ("IMG_2041.jpg", 2400, "2026-09-14"),
    ("IMG_2042.jpg", 2650, "2026-09-14"),
    ("IMG_2043.JPG", 1800, "2026-09-15"),
    ("holiday video.mp4", 9000, "2026-09-15"),
    ("bank statement.pdf", 1200, "2026-10-01"),
    ("CV Sandip.docx", 800, "2026-08-20"),
    ("budget.xlsx", 600, "2026-10-05"),
    ("notes.txt", 150, "2026-10-10"),
    ("song.mp3", 5000, "2026-07-30"),
    ("setup.exe", 7000, "2026-06-02"),
    ("photos.zip", 4000, "2026-09-16"),
    ("mystery_file", 50, "2026-10-11"),
    ("old stuff/receipt.pdf", 300, "2026-05-01"),
]

for name, size, day in FAKE_FILES:
    path = PRACTICE / name
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("x" * size, encoding="utf-8")  # fake content, the right size
    stamp = datetime.fromisoformat(day).timestamp()
    os.utime(path, (stamp, stamp))  # set the file's "last changed" time
print(f"Made {len(FAKE_FILES)} fake files in {PRACTICE}")
```

Run it with `python make_practice_folder.py`:

```
Made 13 fake files in C:\code\tidy\practice\Downloads
```

The "photos" are just the letter `x` repeated, but to a script they look like any other file: they have names, extensions, sizes and dates. `os.utime` sets a file's "last changed" time, so the files look as if they were downloaded over the last few months. (`.timestamp()` turns a `datetime` into the seconds-since-1970 number from [chapter 22](../22-dates-and-times/notes.md).)

To start again at any point, delete the `practice` folder in VS Code's Explorer and run the script again.

### Finding files: `pathlib`, plus `rglob` and `stat`

You met `pathlib` in [chapter 20](../20-files-and-folders/notes.md): `.iterdir()`, `.glob("*.txt")`, `.name`, `.stem` and `.suffix`. Automation scripts use them all the time, plus two new tools.

**`.rglob()` looks in every subfolder too.** The `r` stands for "recursive" (like [chapter 17](../17-recursion/notes.md)'s functions that call themselves, it keeps going down into folders inside folders):

```python
from pathlib import Path

folder = Path("practice/Downloads")

for path in folder.glob("*.pdf"):
    print(path.name)

for path in folder.rglob("*.pdf"):
    print(path)
```

```
bank statement.pdf
practice\Downloads\bank statement.pdf
practice\Downloads\old stuff\receipt.pdf
```

`.glob()` only found the PDF at the top. `.rglob()` also found the receipt inside `old stuff`. Both hand out paths one at a time, like the generators from [chapter 31](../31-iterators-and-generators/notes.md).

**`.stat()` tells you about a file.** It gives back an object full of facts. The two you'll use most are the size and the "last changed" time:

```python
from pathlib import Path

info = Path("practice/Downloads/budget.xlsx").stat()
print(info.st_size)   # prints: 600
print(info.st_mtime)  # prints a timestamp, something like: 1791137700.0
```

`st_size` is the size in **bytes** (1 KB is 1024 bytes). `st_mtime` is the **m**odification **time**: when the file was last changed, as a timestamp. `datetime.fromtimestamp()` turns that back into a readable date. Here's a small report of the five biggest files, sorted with `key=` from [chapter 34](../34-functional-tools/notes.md):

```python
from datetime import datetime
from pathlib import Path

folder = Path("practice/Downloads")
files = [path for path in folder.rglob("*") if path.is_file()]
files.sort(key=lambda path: path.stat().st_size, reverse=True)

print(f"{len(files)} files. The five biggest:")
for path in files[:5]:
    info = path.stat()
    changed = datetime.fromtimestamp(info.st_mtime)
    print(f"{info.st_size:>6} bytes  {changed:%Y-%m-%d}  {path.relative_to(folder)}")
```

```
13 files. The five biggest:
  9000 bytes  2026-09-15  holiday video.mp4
  7000 bytes  2026-06-02  setup.exe
  5000 bytes  2026-07-30  song.mp3
  4000 bytes  2026-09-16  photos.zip
  2650 bytes  2026-09-14  IMG_2042.jpg
```

`rglob("*")` finds folders too, so `path.is_file()` keeps only the files. `path.relative_to(folder)` shows each path starting from `folder`, which is shorter to read.

> **Watch out:** On Windows, `folder.glob("*.jpg")` also finds `IMG_2043.JPG`, because Windows doesn't care about capital letters in file names. On a Mac or Linux, it doesn't. When you sort files by type, compare `path.suffix.lower()` with `".jpg"`, and your script works the same everywhere.

### Copying, moving and zipping: `shutil`

`pathlib` finds files. For copying and moving them, Python has the `shutil` module (short for "shell utilities": the file jobs you'd normally do in a terminal or in File Explorer). Run these one at a time, and look in the `practice` folder after each.

**Copying files:**

```python
import shutil
from datetime import datetime
from pathlib import Path

downloads = Path("practice/Downloads")
backup = Path("practice/Backup")
backup.mkdir(exist_ok=True)

shutil.copy2(downloads / "budget.xlsx", backup)  # copies the "last changed" time too
shutil.copy(downloads / "notes.txt", backup)  # the copy is "changed" right now

for path in sorted(backup.iterdir()):
    info = path.stat()
    changed = datetime.fromtimestamp(info.st_mtime)
    print(f"{path.name:<12} {info.st_size:>4} bytes  changed {changed:%Y-%m-%d %H:%M}")
```

```
budget.xlsx   600 bytes  changed 2026-10-05 00:00
notes.txt     150 bytes  changed 2026-10-12 11:33
```

`copy2` kept the original date of `budget.xlsx`, but `copy` gave `notes.txt` today's date and time (yours will show the moment you ran it). For backups, use `copy2`, so the copy still tells you when the file was really last changed. You can give either function a folder (the copy keeps the same name) or a full path with a new name.

**Moving a file** with `shutil.move()`. It gives back where the file ended up:

```python
import shutil
from pathlib import Path

backup = Path("practice/Backup")
old = backup / "Old"
old.mkdir(exist_ok=True)

new_place = shutil.move(backup / "notes.txt", old)
print(new_place)  # prints: practice\Backup\Old\notes.txt
```

**Copying a whole folder** with `shutil.copytree()`, everything inside included:

```python
import shutil

copy = shutil.copytree("practice/Downloads", "practice/Downloads-copy")
print(f"Copied the whole folder to {copy}")
```

```
Copied the whole folder to practice/Downloads-copy
```

Run it a second time, and it refuses, because the folder is already there: `FileExistsError: [WinError 183] Cannot create a file when that file already exists: 'practice/Downloads-copy'`. (If you really want to copy into a folder that exists, add `dirs_exist_ok=True`.)

**Zipping a folder** with `shutil.make_archive()`. A dated name, built with chapter 22's `date`, is perfect for backups, because they sort in date order and never clash with yesterday's:

```python
import shutil
from datetime import date

name = f"practice/Downloads-{date.today().isoformat()}"
archive = shutil.make_archive(name, "zip", root_dir="practice/Downloads")
print(archive)
```

```
C:\code\tidy\practice\Downloads-2026-10-12.zip
```

(Your date will be today's.) You give the name **without** `.zip`, then the format, then `root_dir`: the folder whose contents go into the zip. It gives back the full path of the zip file it made.

**Deleting a whole folder** with `shutil.rmtree()`:

```python
import shutil
from pathlib import Path

copy = Path("practice/Downloads-copy")
shutil.rmtree(copy)  # deletes the folder and EVERYTHING inside it
print(copy.exists())  # prints: False
```

> **Watch out:** `rmtree` is the most dangerous line in this chapter. It deletes a folder and everything inside it, straight away, with no "Are you sure?" and **no Recycle Bin**. One wrong path, and years of photos are gone in a blink. Only ever use it on folders your own script just made (like a temporary copy), and print the path first. When you're tidying, move things to an archive folder instead.

**What does `move` do when the name is already taken?** This matters, so here's exactly what happens on Windows with Python 3.13:

| You write | A file with that name is already there, so... |
|---|---|
| `shutil.move(file, folder)` | It stops with `shutil.Error: Destination path 'practice\Backup\Old\notes.txt' already exists`. Nothing is lost. |
| `shutil.move(file, folder / "notes.txt")` | It **silently replaces** the old file. The old one is gone for good. |

The second one is the trap: no error, no warning, and the old file has vanished. The same happens on a Mac or Linux. So before you move a file to a full path, check whether that path already exists, and pick a new name if it does. That's the next job.

### Project: tidy a Downloads folder

Time for a real tool. `organize.py` moves every file into a subfolder for its type (`Images`, `Documents`, `Music`...), with a dry run, name-clash protection and a log. It uses argparse from [chapter 24](../24-command-line-programs/notes.md) and logging from [chapter 37](../37-debugging-and-logging/notes.md):

```python
"""Tidy a folder: move each file into a subfolder for its type.

It's a dry run unless you add --apply.
"""

import argparse
import logging
import shutil
import sys
from pathlib import Path

HERE = Path(__file__).parent
LOG_FILE = HERE / "organize.log"

# Which subfolder each kind of file goes into
FOLDERS = {
    ".jpg": "Images",
    ".jpeg": "Images",
    ".png": "Images",
    ".mp4": "Videos",
    ".mp3": "Music",
    ".pdf": "Documents",
    ".docx": "Documents",
    ".xlsx": "Documents",
    ".txt": "Documents",
    ".zip": "Archives",
    ".exe": "Installers",
}

logger = logging.getLogger(__name__)


def folder_for(path: Path) -> str:
    """Return the name of the subfolder this file belongs in, like "Images"."""
    return FOLDERS.get(path.suffix.lower(), "Other")


def unique_path(target: Path) -> Path:
    """Return target if it's free, or else "name (1).ext", "name (2).ext"..."""
    candidate = target
    number = 1
    while candidate.exists():
        candidate = target.with_name(f"{target.stem} ({number}){target.suffix}")
        number += 1
    return candidate


def organize(folder: Path, apply: bool) -> int:
    """Move every file in folder (or only say what would move). Return the count."""
    count = 0
    for path in sorted(folder.iterdir()):
        if not path.is_file():
            continue  # leave folders alone
        target = unique_path(folder / folder_for(path) / path.name)
        if apply:
            target.parent.mkdir(exist_ok=True)
            shutil.move(path, target)
            logger.info("Moved %s -> %s", path, target)
            print(f"Moved {path.name} -> {target.relative_to(folder)}")
        else:
            print(f"Would move {path.name} -> {target.relative_to(folder)}")
        count += 1
    return count


def main() -> None:
    parser = argparse.ArgumentParser(description="Sort files into folders by type.")
    parser.add_argument("folder", type=Path, help="the folder to tidy")
    parser.add_argument("--apply", action="store_true", help="really move the files")
    args = parser.parse_args()

    logging.basicConfig(
        filename=LOG_FILE,
        encoding="utf-8",
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    if not args.folder.is_dir():
        print(f"Error: {args.folder} is not a folder", file=sys.stderr)
        sys.exit(1)

    count = organize(args.folder, args.apply)
    if args.apply:
        print(f"Done. Files moved: {count}. The details are in {LOG_FILE.name}.")
    else:
        print(f"Dry run. Files that would move: {count}. Add --apply to do it.")


if __name__ == "__main__":
    main()
```

The new pieces:

- `type=Path` in `add_argument` works just like `type=int`: argparse hands you a ready-made `Path`, so `args.folder.is_dir()` works straight away.
- `folder_for` looks the lowercased suffix up in `FOLDERS`, and anything it doesn't know (including a file with no suffix at all) goes to `Other`.
- `unique_path` is the name-clash protection. `target.with_name(...)` gives the same path with a different file name. If `notes.txt` is taken, it tries `notes (1).txt`, then `notes (2).txt`, until it finds a free one, just like Windows does when you download the same file twice.
- The log records the full paths, so you could put everything back if you had to.

**The dry run** is what you get without `--apply`:

```
python organize.py practice/Downloads
```

```
Would move bank statement.pdf -> Documents\bank statement.pdf
Would move budget.xlsx -> Documents\budget.xlsx
Would move CV Sandip.docx -> Documents\CV Sandip.docx
Would move holiday video.mp4 -> Videos\holiday video.mp4
Would move IMG_2041.jpg -> Images\IMG_2041.jpg
Would move IMG_2042.jpg -> Images\IMG_2042.jpg
Would move IMG_2043.JPG -> Images\IMG_2043.JPG
Would move mystery_file -> Other\mystery_file
Would move notes.txt -> Documents\notes.txt
Would move photos.zip -> Archives\photos.zip
Would move setup.exe -> Installers\setup.exe
Would move song.mp3 -> Music\song.mp3
Dry run. Files that would move: 12. Add --apply to do it.
```

Nothing has moved yet. Read the list. Is every file going where you'd expect? (Notice that the `old stuff` folder is left alone.) Only when you're happy, run it for real:

```
python organize.py practice/Downloads --apply
```

```
Moved bank statement.pdf -> Documents\bank statement.pdf
Moved budget.xlsx -> Documents\budget.xlsx
...
Moved song.mp3 -> Music\song.mp3
Done. Files moved: 12. The details are in organize.log.
```

Look in `practice/Downloads`: seven new folders, with every file inside the right one. And `organize.log` (next to the script) has one line per file, with your own date and time:

```
2026-10-12 11:32:37 INFO Moved practice\Downloads\bank statement.pdf -> practice\Downloads\Documents\bank statement.pdf
2026-10-12 11:32:37 INFO Moved practice\Downloads\budget.xlsx -> practice\Downloads\Documents\budget.xlsx
```

Now test the clash protection. Make a new, empty file called `notes.txt` in `practice/Downloads` (right-click the folder in VS Code's Explorer, choose **New File**), and run the script with `--apply` again:

```
Moved notes.txt -> Documents\notes (1).txt
Done. Files moved: 1. The details are in organize.log.
```

The first `notes.txt` is safe, and the new one sits next to it.

### Batch renaming

Next job: those camera names. `rename_photos.py` renames every `IMG_` photo in a folder to the month it was taken, a label you choose, and a three-digit number. It uses a regular expression from [chapter 35](../35-regular-expressions/notes.md) to pick out the camera names:

```python
"""Rename camera photos like IMG_2041.jpg to 2026-09-holiday-001.jpg.

It's a dry run unless you add --apply.
"""

import argparse
import re
from datetime import datetime
from pathlib import Path

CAMERA_NAME = re.compile(r"IMG_\d+")  # names like IMG_2041


def plan_renames(folder: Path, label: str) -> list[tuple[Path, Path]]:
    """Pair each camera photo with its new name, oldest photo first."""
    photos = [
        path
        for path in folder.iterdir()
        if path.is_file() and CAMERA_NAME.fullmatch(path.stem)
    ]
    photos.sort(key=lambda path: (path.stat().st_mtime, path.name))

    plan = []
    for number, photo in enumerate(photos, start=1):
        taken = datetime.fromtimestamp(photo.stat().st_mtime)
        new_name = f"{taken:%Y-%m}-{label}-{number:03}{photo.suffix.lower()}"
        plan.append((photo, photo.with_name(new_name)))
    return plan


def main() -> None:
    parser = argparse.ArgumentParser(description="Give camera photos tidy names.")
    parser.add_argument("folder", type=Path, help="the folder with the photos")
    parser.add_argument("label", help="a word for the new names, like holiday")
    parser.add_argument("--apply", action="store_true", help="really rename them")
    args = parser.parse_args()

    plan = plan_renames(args.folder, args.label)
    if not plan:
        print("No camera photos found.")
    for old, new in plan:
        if not args.apply:
            print(f"Would rename {old.name} -> {new.name}")
        elif new.exists():
            print(f"Skipped {old.name}: {new.name} already exists")
        else:
            old.rename(new)
            print(f"Renamed {old.name} -> {new.name}")


if __name__ == "__main__":
    main()
```

The heart of it is `f"{number:03}"`: the number, padded with zeros to 3 digits, so `1` becomes `001`. Padded numbers keep the files in the right order in File Explorer (without them, `10` sorts before `2`). The sort key is a tuple ([chapter 34](../34-functional-tools/notes.md)): oldest first, and the name breaks ties between photos from the same moment. `fullmatch` means the **whole** stem must look like `IMG_` plus digits, so a file like `IMG_2041 (1)` is left alone.

Try it on the `Images` folder that `organize.py` made, dry run first:

```
python rename_photos.py practice/Downloads/Images holiday
```

```
Would rename IMG_2041.jpg -> 2026-09-holiday-001.jpg
Would rename IMG_2042.jpg -> 2026-09-holiday-002.jpg
Would rename IMG_2043.JPG -> 2026-09-holiday-003.jpg
```

Then with `--apply`, the same three lines start with `Renamed`. Run it once more, and it says `No camera photos found.`, because there aren't any `IMG_` names left.

The `new.exists()` check matters. Say a new photo from September, `IMG_2078.jpg`, turns up later. Its number starts at `001` again, so the script would want to call it `2026-09-holiday-001.jpg`, which is taken. Instead of overwriting the old photo, it says:

```
Skipped IMG_2078.jpg: 2026-09-holiday-001.jpg already exists
```

(On Windows, `old.rename(new)` would also refuse with a `FileExistsError` if the new name were taken. On a Mac or Linux, it silently replaces the other file, so the check is what keeps your script safe everywhere.)

### Running other programs: `subprocess`

Python can start other programs too, like you would by typing a command in the terminal: Git, an image converter, or another Python script. The tool for this is `subprocess.run()`. Save this as `run_it.py`:

```python
import subprocess
import sys

result = subprocess.run([sys.executable, "--version"])
print(result.returncode)
```

```
Python 3.13.15
0
```

- The command is a **list**: the program first, then each argument as its own string. It's exactly what you'd type in the terminal (`python --version`), split at the spaces.
- `sys.executable` is the full path of the Python that's running your script ([chapter 23](../23-pip-and-virtual-environments/notes.md)). Using it, rather than the word `"python"`, guarantees the new program runs with the same Python and the same virtual environment.
- `run()` waits until the program finishes, and gives back a result. `result.returncode` is the program's exit code from [chapter 24](../24-command-line-programs/notes.md): `0` means it went well.

The program's output went straight to the screen. To get it into a variable instead, add `capture_output=True` (catch what it prints) and `text=True` (as a string, not raw bytes):

```python
import subprocess
import sys

result = subprocess.run([sys.executable, "--version"], capture_output=True, text=True)
print(repr(result.stdout))  # prints: 'Python 3.13.15\n'
print(result.stdout.strip())  # prints: Python 3.13.15
```

`result.stdout` is what the program printed, and `result.stderr` is its error messages ([chapter 24](../24-command-line-programs/notes.md)'s two channels).

**When the program fails.** Here's a tiny script, `greet.py`, that needs a name:

```python
import sys

name = sys.argv[1]
print(f"Hello, {name}!")
```

Run it through `subprocess` without a name, and it crashes with an `IndexError`. But your script carries on as if nothing happened, unless you check the exit code yourself. The easy way is `check=True`, which turns a failure into an exception you can't miss:

```python
import subprocess
import sys

try:
    subprocess.run(
        [sys.executable, "greet.py"], capture_output=True, text=True, check=True
    )
except subprocess.CalledProcessError as e:
    print(f"It failed with exit code {e.returncode}")
    print(f"Its error said: {e.stderr.splitlines()[-1]}")
```

```
It failed with exit code 1
Its error said: IndexError: list index out of range
```

Without the `try`, the `CalledProcessError` stops your script with a message like `subprocess.CalledProcessError: Command '['C:\\code\\tidy\\.venv\\Scripts\\python.exe', 'greet.py']' returned non-zero exit status 1.` Either way, a failure can't slip past unnoticed.

**When the program doesn't exist** (or isn't installed), you get a different error, before anything runs:

```python
subprocess.run(["magick", "--version"])
```

```
FileNotFoundError: [WinError 2] The system cannot find the file specified
```

That's what you'd see without the ImageMagick image tool installed. You'd get the same error from `subprocess.run(["dir"])`, even though `dir` works in Command Prompt. Commands like `dir`, `copy` and `echo` aren't programs on Windows: they're built into Command Prompt itself. To run one, you need `shell=True` and the command as one string, which asks Command Prompt to run it for you: `subprocess.run("dir /b *.py", shell=True)` lists the `.py` files in the folder. But you rarely need it, because Python can do those jobs itself (`Path.glob`, `shutil.copy2`). And `shell=True` has a real danger: the shell treats some characters as instructions. Watch what happens when a name typed by a user goes into the command:

```python
import subprocess
import sys

name = "Sandip & echo HACKED"  # imagine a user typed this

subprocess.run(f"echo Hello {name}", shell=True)  # cmd.exe sees TWO commands
subprocess.run([sys.executable, "greet.py", name])  # just one odd name
```

```
Hello Sandip 
HACKED
Hello, Sandip & echo HACKED!
```

With `shell=True`, the `&` split it into two commands, and the second one ran. Here it only printed a word, but it could just as easily have been a command that deletes files. With a list, the whole text arrived as one harmless argument. So: **use a list, and leave `shell=True` out**, especially when any part of the command comes from a user or a file.

> **Tip:** `subprocess.run(["git", "pull"], cwd=project_folder, check=True)` runs a command *inside* another folder. `cwd` means "current working directory". It's how a script can update ten Git projects in one go.

### Settings from environment variables

A script for one person often has settings baked in, like which folder to back up. To change them without editing the code, read them from **environment variables**, which you met in [chapter 40](../40-working-with-apis/notes.md). `os.environ.get(name, default)` gives the variable's value, or the default if it isn't set.

Here's `backup.py`, which zips a folder into a `backups` folder with today's date in the name. The folder to back up comes from `BACKUP_SOURCE`, if it's set:

```python
"""Back up a folder into a zip file with today's date in its name."""

import logging
import os
import shutil
import sys
from datetime import date
from pathlib import Path

HERE = Path(__file__).parent  # the folder this script is in
BACKUP_DIR = HERE / "backups"
LOG_FILE = HERE / "backup.log"
DEFAULT_SOURCE = HERE / "practice" / "Downloads"

logger = logging.getLogger(__name__)


def make_backup(source: Path, today: date) -> Path:
    """Zip source into BACKUP_DIR, with a name like Downloads-2026-10-12.zip."""
    BACKUP_DIR.mkdir(exist_ok=True)
    base_name = BACKUP_DIR / f"{source.name}-{today.isoformat()}"
    archive = shutil.make_archive(str(base_name), "zip", root_dir=source)
    return Path(archive)


def main() -> None:
    logging.basicConfig(
        filename=LOG_FILE,
        encoding="utf-8",
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    # A setting from an environment variable, with a sensible default
    source = Path(os.environ.get("BACKUP_SOURCE", DEFAULT_SOURCE))
    if not source.is_dir():
        logger.error("Can't back up %s: not a folder", source)
        print(f"Error: {source} is not a folder", file=sys.stderr)
        sys.exit(1)

    archive = make_backup(source, date.today())
    size_kb = archive.stat().st_size / 1024
    logger.info("Backed up %s to %s (%.1f KB)", source, archive, size_kb)
    print(f"Backed up {source.name} to {archive.name} ({size_kb:.1f} KB)")


if __name__ == "__main__":
    main()
```

(`make_archive` wants the name as a string, hence `str(base_name)`.) In PowerShell:

```
python backup.py
$env:BACKUP_SOURCE = "practice\Downloads\Documents"
python backup.py
Remove-Item Env:BACKUP_SOURCE
```

```
Backed up Downloads to Downloads-2026-10-12.zip (3.0 KB)
Backed up Documents to Documents-2026-10-12.zip (0.9 KB)
```

(Your sizes and date will differ. In Command Prompt, set the variable with `set BACKUP_SOURCE=...`; on a Mac or Linux, with `export BACKUP_SOURCE=...`.) `Remove-Item Env:BACKUP_SOURCE` unsets it again. Run the backup twice on the same day, and the second zip replaces the first, because it has the same name. For a daily backup, that's exactly right.

Notice that every path in `backup.py` is built from `HERE`, the script's own folder ([chapter 20](../20-files-and-folders/notes.md)). That's not just neat. It's what lets the script run on a schedule.

### Running on a schedule

A backup you have to remember to run isn't automatic. The last step is asking the computer to start your script at a set time. Before you do, check two rules, because a scheduled script runs without you, and without your terminal:

1. **Use the full path to your virtual environment's `python.exe`**, like `C:\code\tidy\.venv\Scripts\python.exe`. The scheduler doesn't activate anything, so plain `python` would be your global Python, without your packages.
2. **Build every file path from `Path(__file__).parent`.** A scheduled task doesn't start in your project folder (often it starts in `C:\Windows\System32`), so relative paths point at the wrong place. You'll see what that looks like in Common mistakes.

One scheduled task can run several jobs, using `subprocess` and `check=True`. Save this as `nightly.py`:

```python
"""Run the nightly jobs one after another, and stop at the first failure."""

import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).parent
DOWNLOADS = HERE / "practice" / "Downloads"

JOBS = [
    [sys.executable, str(HERE / "backup.py")],
    [sys.executable, str(HERE / "organize.py"), str(DOWNLOADS), "--apply"],
]

for job in JOBS:
    name = Path(job[1]).name
    print(f"--- Running {name}")
    try:
        subprocess.run(job, check=True)
    except subprocess.CalledProcessError as e:
        print(f"{name} failed with exit code {e.returncode}. Stopping.", file=sys.stderr)
        sys.exit(1)

print("--- All jobs finished")
```

With one new file waiting in the practice Downloads folder, `python nightly.py` prints:

```
--- Running backup.py
Backed up Downloads to Downloads-2026-10-12.zip (3.0 KB)
--- Running organize.py
Moved shopping.txt -> Documents\shopping.txt
Done. Files moved: 1. The details are in organize.log.
--- All jobs finished
```

The backup runs first, so if tidying ever went wrong, yesterday's files would still be safe in the zip. And if a job fails, the rest don't run, and the exit code is `1`. That exit code is what the scheduler shows you as the task's result. (You could import the two scripts' functions instead, like [chapter 19](../19-modules-and-standard-library/notes.md). `subprocess` shines when the jobs are separate programs, or not Python at all.)

**Windows Task Scheduler** is the program that starts things at set times. To add your task:

1. Press the Windows key, type **Task Scheduler**, and open it.
2. In the **Actions** panel on the right, click **Create Basic Task...**.
3. Give it a name, like `Nightly tidy`, and click **Next**.
4. Choose when it runs (**Daily**), click **Next**, set the time (say `21:00`), and click **Next**.
5. Choose **Start a program**, and click **Next**.
6. In **Program/script**, put the full path to the venv's Python: `C:\code\tidy\.venv\Scripts\python.exe`.
7. In **Add arguments**, put the full path to the script: `C:\code\tidy\nightly.py`.
8. In **Start in**, put the script's folder: `C:\code\tidy`. (Your script doesn't need this, thanks to `HERE`, but it's a good habit.)
9. Click **Next**, then **Finish**.

To test it straight away, find your task in the **Task Scheduler Library**, right-click it, and choose **Run**. Then check `organize.log` and the `backups` folder, and look at the task's **Last Run Result** column: `The operation completed successfully. (0x0)` means exit code 0. By default, the task only runs while you're logged in, and a terminal window flashes up while it works. (Using `pythonw.exe` instead of `python.exe` runs it without a window. Then nothing printed is ever seen, which is one more reason your scripts log to a file.)

These menus can look slightly different between Windows versions. If you prefer typing, the `schtasks` command does the same job from a terminal:

```
schtasks /Create /TN "Nightly tidy" /SC DAILY /ST 21:00 /TR "C:\code\tidy\.venv\Scripts\python.exe C:\code\tidy\nightly.py"
schtasks /Run /TN "Nightly tidy"
schtasks /Delete /TN "Nightly tidy" /F
```

The first line creates the task, the second runs it now, and the third removes it. Keep your project in a folder with no spaces in its path: then the command needs no extra quotes inside the quotes.

On a Mac or Linux, the scheduler is called **cron**. You run `crontab -e` and add one line, like `0 21 * * * /home/sandip/tidy/.venv/bin/python /home/sandip/tidy/nightly.py`, which means "at minute 0 of hour 21, every day". The same two rules apply.

## Common mistakes

**1. Running for real without a dry run**

```
python organize.py C:\Users\Sandip --apply
```

You meant your Downloads folder, but typed your whole user folder. With `--apply`, hundreds of files move into `Images` and `Documents` folders before you notice, and every program that expected them in their old place is confused. There's no error to warn you: the script did exactly what you asked. Fix: always run without `--apply` first and read the list. Make "dry run unless asked" the default in every script you write, like `organize.py` does.

**2. Relative paths in a scheduled task**

```python
import shutil
from datetime import date

# Relative paths: measured from wherever the program is started!
archive = shutil.make_archive(
    f"backups/Downloads-{date.today()}", "zip", "practice/Downloads"
)
print(f"Saved {archive}")
```

Run it from its own folder, and it works. Run it from anywhere else, which is exactly what Task Scheduler does, and it crashes:

```
FileNotFoundError: [WinError 3] The system cannot find the path specified: 'practice/Downloads'
```

Relative paths start from the folder the program was started in, not the folder the script is in ([chapter 20](../20-files-and-folders/notes.md)). In a scheduled task, nobody sees the crash: the backup just quietly never happens. Fix: build every path from `HERE = Path(__file__).parent`, like `backup.py` does.

**3. Overwriting a file when you move it**

```python
shutil.move("practice/Downloads/notes.txt", "practice/Downloads/Documents/notes.txt")
```

If `Documents` already has a `notes.txt`, it's silently replaced, and the old one is gone. No error, no warning. Fix: check `target.exists()` first, and pick a free name (like `unique_path` in `organize.py`), or skip the file and say so.

**4. Writing the command as one string**

```python
import subprocess
import sys

name = "Sandip Shakya"
subprocess.run([sys.executable, "greet.py", name])
subprocess.run(f"{sys.executable} greet.py {name}")
```

```
Hello, Sandip Shakya!
Hello, Sandip!
```

The list kept `Sandip Shakya` together as one argument. The string was split at every space, so `greet.py` got `Sandip` and `Shakya` as two arguments, and the surname was lost. The same thing breaks file names with spaces, like `holiday video.mp4`. On a Mac or Linux, the string version doesn't even run: without `shell=True`, Python treats the whole string as the name of one program, can't find a program with that long name, and stops with a `FileNotFoundError`. Fix: always pass a list, one item per argument.

**5. Forgetting `check=True`**

```python
subprocess.run([sys.executable, "backup.py"])
print("Backup done!")
```

If `backup.py` fails, this still cheerfully prints `Backup done!`, and you find out a month later, when you need the backup and it isn't there. `run()` doesn't raise an error for a failed program unless you ask. Fix: add `check=True`, or look at `result.returncode` yourself.

**6. Deleting the wrong folder**

```python
import os
from pathlib import Path

old_backups = Path(os.environ.get("OLD_BACKUPS", ""))  # forgot to set it!
print(repr(old_backups))
print(old_backups.resolve())
```

```
WindowsPath('.')
C:\code\tidy
```

The variable wasn't set, so the path became `Path("")`, which means `.`: **the current folder**. One `shutil.rmtree(old_backups)` after this would have deleted your whole project, scripts and all. Fix: don't use `rmtree` in tidying scripts at all (move things to an archive folder instead). If you truly must delete, check the path first (is it inside the folder you expect?), print it, and do a dry run.

## Quick recap

- Automation scripts do boring, repeated jobs with files and programs. Keep them safe: practise on fake files, dry run first (`--apply` to act), move instead of delete, never overwrite, and log what you did.
- `pathlib` finds files: `.iterdir()`, `.glob()`, `.rglob()` (subfolders too), `.suffix.lower()`, and `.stat()` for the size (`st_size`) and last-changed time (`st_mtime`).
- `shutil` moves them: `copy2` (keeps the date), `move`, `copytree`, `make_archive` (a zip, nicely with a dated name), and `rmtree` (deletes everything, no Recycle Bin: avoid it). `move` to a full path silently replaces an existing file, so check first.
- Batch renames: build new names with f-strings like `f"{number:03}"`, check `new.exists()` before `rename`.
- `subprocess.run([...], capture_output=True, text=True, check=True)` runs other programs. Pass a list, not a string, and leave out `shell=True`.
- Read settings with `os.environ.get(name, default)`. For scheduled tasks (Task Scheduler on Windows, cron on Mac and Linux), use the venv's full `python.exe` path and build every path from `Path(__file__).parent`.

---

**Next:** try the [exercises](exercises.md), then move on to [46 Project: Expense Tracker API](../46-project-expense-tracker-api/notes.md).
