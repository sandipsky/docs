# 20 Files and Folders

## What is it?

A **file** is a named piece of data saved on your computer's disk, like `notes.txt` or `photo.jpg`. A **folder** (also called a **directory**) is a container that holds files and other folders.

Python can create files, write text into them, and read that text back later. It can also make folders and look around inside them.

## Why does it matter?

Everything your programs have stored so far lives in **memory**: the computer's short-term workspace. When the program ends, memory is wiped clean. Look at this to-do program:

```python
tasks = []
tasks.append("Buy milk")
tasks.append("Call the dentist")
print(f"You have {len(tasks)} tasks")  # prints: You have 2 tasks
```

Run it again tomorrow, and `tasks` starts empty. Every single time. A to-do app that forgets your to-dos isn't much use.

The **disk** is the computer's long-term storage. Files saved there survive when your program ends, when you close VS Code, even when you restart the computer. Saving to a file is how programs remember things.

Files also matter because so much real-world information already lives in them: reports, logs, notes, spreadsheets, settings. Once you can read and write files, Python can work with all of it.

## Real-world example

Think of a whiteboard and a notebook.

A whiteboard is quick and handy while you're working, but it gets wiped at the end of the day. That's memory: your variables. A notebook on a shelf keeps what you wrote for as long as you like. That's a file.

| The notebook | Python |
|---|---|
| Taking a notebook off the shelf and opening it | `open("notes.txt", ...)` |
| Opening it just to read | Mode `"r"` (read) |
| Tearing out every page and starting fresh | Mode `"w"` (write) |
| Adding a new entry at the end | Mode `"a"` (append) |
| Closing it and putting it back on the shelf | Closing the file (`with` does it for you) |
| The language the notebook is written in | The file's **encoding** (`"utf-8"`) |
| Where the notebook lives: "study, second shelf" | The file's **path**: `data/notes.txt` |

## How it works

### Writing your first file

Make a file called `write_notes.py`:

```python
with open("notes.txt", "w", encoding="utf-8") as f:
    f.write("Buy milk\n")
    f.write("Call the dentist\n")
    f.write("Water the plants\n")

print("Saved!")
```

Run it with `python write_notes.py`, and you'll see `Saved!`. Now look in VS Code's Explorer: a new file called `notes.txt` has appeared next to your program. Click it, and you'll find your three lines inside.

Here's the first line, piece by piece:

| Piece | What it means |
|---|---|
| `open(...)` | Open a file, ready to use. If it doesn't exist and you're writing, Python creates it. |
| `"notes.txt"` | The file's name (or path). |
| `"w"` | The **mode**: what you want to do with the file. `"w"` means write. |
| `encoding="utf-8"` | How letters are turned into bytes on disk. Always write this; you'll see why soon. |
| `with ... as f:` | Open the file, call it `f` while you use it, and close it automatically at the end. |
| The indented lines | What you do with the open file. |

`f` is a **file object**: a handle on the open file that has methods like `.write()` and `.read()`. You can call it anything, but `f` is the usual short name.

Notice the `\n` at the end of each line. That's the newline character from [chapter 06](../06-strings/notes.md). `.write()` writes exactly what you give it, nothing more, so you have to add the line breaks yourself.

### What `with` does

The `with` statement means: **open the file, use it, and automatically close it.** As soon as the indented block ends, Python closes the file for you.

Why does closing matter? When you write to a file, Python often holds the text in a waiting area in memory and saves it to disk in bigger chunks, because that's faster. Closing the file is what makes sure everything really reaches the disk. On Windows, an open file can also be locked, so other programs (or you, in File Explorer) can't rename or delete it.

You'll sometimes see the older way, without `with`:

```python
f = open("notes.txt", encoding="utf-8")
text = f.read()
print(f.closed)  # prints: False
f.close()
print(f.closed)  # prints: True
```

That works, but it's easy to forget `f.close()`. And if an error happens before the `close()` line, it never runs. `with` closes the file even when something goes wrong inside the block. So in this course, **always use `with`** to open files.

> **Tip:** `with` isn't only for files. It works with anything that needs tidying up afterwards. You'll learn how it works inside, and how to write your own, in [chapter 33](../33-context-managers/notes.md).

### Reading a whole file: `.read()`

To read the file back, open it in mode `"r"` and call `.read()`. It gives you the whole file as one string:

```python
with open("notes.txt", "r", encoding="utf-8") as f:
    text = f.read()

print(text)
```

You'll see:

```
Buy milk
Call the dentist
Water the plants

```

(There's an empty line at the end, because the file ends with `\n` and `print()` adds one more.)

The text is an ordinary string, so everything from chapter 06 works on it:

```python
print(type(text))  # prints: <class 'str'>
print(len(text))   # prints: 43
print(repr(text))  # prints: 'Buy milk\nCall the dentist\nWater the plants\n'
```

`repr()` shows a string the way you'd type it in code, so you can see the hidden `\n` characters. It's a great tool when text from a file looks strange.

`"r"` is the default mode, so you can leave it out. These two lines do the same thing:

```python
with open("notes.txt", "r", encoding="utf-8") as f:
    ...

with open("notes.txt", encoding="utf-8") as f:
    ...
```

(The `...` is a real piece of Python, called **Ellipsis**. Here it just means "your code goes here".)

Notice that `text` was used **after** the `with` block ended. That's fine: the file is closed, but the string you read is still in your variable. A good habit is to read what you need inside `with`, and do the rest of the work outside it.

### Reading line by line

Most text files are made of lines: one task per line, one log entry per line. A file object works with a `for` loop, and gives you one line each time round:

```python
with open("notes.txt", encoding="utf-8") as f:
    for line in f:
        print(line)
```

You'll see:

```
Buy milk

Call the dentist

Water the plants

```

Why the blank lines? Each line from the file still has its `\n` on the end, and `print()` adds a second one. The fix is `.strip()` from chapter 06, which removes spaces and newlines from both ends:

```python
with open("notes.txt", encoding="utf-8") as f:
    for line in f:
        print(line.strip())
```

You'll see:

```
Buy milk
Call the dentist
Water the plants
```

> **Tip:** Get into the habit of writing `line.strip()` every time you read lines from a file. It also removes stray spaces at the end of lines, which are invisible and cause confusing bugs.

Looping line by line is also kind to your computer's memory. It reads one line at a time, so it works even for a file that's millions of lines long.

`enumerate()` from [chapter 11](../11-lists/notes.md) gives you line numbers:

```python
with open("notes.txt", encoding="utf-8") as f:
    for number, line in enumerate(f, start=1):
        print(f"{number}. {line.strip()}")
```

You'll see:

```
1. Buy milk
2. Call the dentist
3. Water the plants
```

### Getting a list of lines

Sometimes you want all the lines in a list, so you can sort them, count them or pick one out. `.readlines()` does that, but each line keeps its `\n`:

```python
with open("notes.txt", encoding="utf-8") as f:
    lines = f.readlines()

print(lines)  # prints: ['Buy milk\n', 'Call the dentist\n', 'Water the plants\n']
```

Usually you want them clean. `.read().splitlines()` reads the whole file and splits it at the line breaks, dropping the `\n` characters:

```python
with open("notes.txt", encoding="utf-8") as f:
    lines = f.read().splitlines()

print(lines)  # prints: ['Buy milk', 'Call the dentist', 'Water the plants']
```

A comprehension from [chapter 15](../15-comprehensions/notes.md) also works: `[line.strip() for line in f]`.

| You want | Use |
|---|---|
| The whole file as one string | `f.read()` |
| To handle one line at a time | `for line in f:` (with `line.strip()`) |
| A list of clean lines | `f.read().splitlines()` |
| A list of lines with `\n` still on them | `f.readlines()` |

> **Watch out:** A file object remembers how far it has read, like a bookmark. After `f.read()`, the bookmark is at the end, so a second `f.read()` gives you an empty string `''`. If you need the text twice, store it in a variable the first time.

### Writing: `.write()` and `print(..., file=f)`

`.write()` writes exactly the text you give it. Forget the `\n`, and everything ends up on one line:

```python
with open("oops.txt", "w", encoding="utf-8") as f:
    f.write("Buy milk")
    f.write("Call the dentist")
```

`oops.txt` now contains:

```
Buy milkCall the dentist
```

`.write()` also only accepts strings:

```python
with open("score.txt", "w", encoding="utf-8") as f:
    f.write(42)
# TypeError: write() argument must be str, not int
```

Fix it with `str(42)`, or an f-string like `f"{score}\n"`.

There's a friendlier option you already know: `print()`. Give it `file=f`, and instead of showing the text on screen, it writes it into the file. It adds the newline for you, and it happily takes numbers and several values, just like on screen:

```python
with open("shopping.txt", "w", encoding="utf-8") as f:
    print("Buy milk", file=f)
    print("Call the dentist", file=f)
    print("Total items:", 2, file=f)
```

`shopping.txt` now contains:

```
Buy milk
Call the dentist
Total items: 2
```

Use whichever feels clearer. `print(..., file=f)` is great for reports; `.write()` gives you exact control.

### Modes: read, write, append

The mode is the second argument to `open()`. These three are the ones you'll use:

| Mode | Name | If the file exists | If the file doesn't exist |
|---|---|---|---|
| `"r"` | read (the default) | Reads it | `FileNotFoundError` |
| `"w"` | write | **Empties it first**, then writes | Creates it |
| `"a"` | append | Adds to the end | Creates it |

`"w"` deserves a big warning. It wipes the file the moment it opens it, before you write a single character:

```python
with open("diary.txt", "w", encoding="utf-8") as f:
    f.write("Monday: went for a run\n")

with open("diary.txt", "w", encoding="utf-8") as f:
    f.write("Tuesday: rain, stayed in\n")

with open("diary.txt", encoding="utf-8") as f:
    print(f.read(), end="")
```

You'll see only:

```
Tuesday: rain, stayed in
```

Monday is gone for good. There's no undo and no recycle bin. When you want to **add** to a file, use `"a"`:

```python
with open("diary.txt", "a", encoding="utf-8") as f:
    f.write("Wednesday: cooked dal bhat\n")

with open("diary.txt", encoding="utf-8") as f:
    print(f.read(), end="")
```

You'll see:

```
Tuesday: rain, stayed in
Wednesday: cooked dal bhat
```

(`end=""` stops `print()` adding an extra blank line, since the file already ends with `\n`. You saw `end=` in [chapter 07](../07-input-and-output/notes.md).)

### Always write `encoding="utf-8"`

Computers store everything as numbers. An **encoding** is the rule for turning letters into numbers on disk, and back again. **UTF-8** is the modern encoding that can store every letter of every language, plus symbols and emoji. It's what almost every website and app uses.

The trouble is, if you leave out `encoding=`, Python uses your computer's default. On most Windows computers that's an old encoding (often called `cp1252`, or "charmap" in error messages) that only knows Western European letters. Try saving a greeting in Nepali without saying which encoding to use:

```python
with open("greeting.txt", "w") as f:
    f.write("नमस्ते, Sandip!\n")
# UnicodeEncodeError: 'charmap' codec can't encode characters in position 0-5: character maps to <undefined>
```

Add `encoding="utf-8"`, and it works:

```python
with open("greeting.txt", "w", encoding="utf-8") as f:
    f.write("नमस्ते, Sandip!\n")

with open("greeting.txt", encoding="utf-8") as f:
    print(f.read(), end="")  # prints: नमस्ते, Sandip!
```

The same problem happens when reading: a UTF-8 file read with the wrong encoding gives a `UnicodeDecodeError`, or quietly turns letters into nonsense like `Ã©`. A Mac or Linux computer usually defaults to UTF-8 already, so code without `encoding=` can work for a friend and crash for you, or the other way round.

Python's developers plan to make UTF-8 the default everywhere in a future version, but writing `encoding="utf-8"` yourself means your program behaves the same on every computer and every version. So the rule for this course is simple: **every `open()` for text gets `encoding="utf-8"`.**

> **Tip:** If your terminal shows boxes or question marks instead of Nepali or Hindi letters, the file is still fine. That's the terminal's font. Open the file in VS Code to check.

### When the file isn't there: `FileNotFoundError`

Reading a file that doesn't exist is an error:

```python
with open("missing.txt", encoding="utf-8") as f:
    text = f.read()
# FileNotFoundError: [Errno 2] No such file or directory: 'missing.txt'
```

(`[Errno 2]` is the operating system's own error number for "not found". You can ignore it.)

This happens all the time in real programs. The very first time someone runs your to-do app, there's no saved file yet. That's not a bug, it's just a fresh start. Handle it with `try`/`except` from [chapter 18](../18-error-handling/notes.md):

```python
try:
    with open("tasks.txt", encoding="utf-8") as f:
        tasks = f.read().splitlines()
except FileNotFoundError:
    print("No saved tasks yet. Starting with an empty list.")
    tasks = []

print(f"You have {len(tasks)} tasks")
```

The first time, you'll see:

```
No saved tasks yet. Starting with an empty list.
You have 0 tasks
```

Once `tasks.txt` exists, the program loads it instead. Notice the `except` names `FileNotFoundError` exactly. Other problems, like a typo in your code, should still show up as errors, not get hidden.

### Paths: telling Python where a file is

A **path** is the address of a file: the folders you go through to reach it, then the file name.

- An **absolute path** starts from the very top of the drive: `C:/Users/Sandip/Documents/notes.txt`. It works from anywhere, but only on your computer.
- A **relative path** starts from the **current working directory**: the folder your terminal is in when you run the program. `notes.txt` means "in this folder", and `data/notes.txt` means "in the `data` folder inside this folder". `..` means "the folder above".

Relative paths are the usual choice, because your program keeps working when you move the whole project folder or share it with a friend.

> **Watch out:** a relative path is measured from **the terminal's folder**, not from the folder your `.py` file is in. Say your program is `project/read_notes.py`, and `notes.txt` sits next to it. Open the terminal in `project` and run `python read_notes.py`: it works. Open the terminal one folder higher and run `python project/read_notes.py`, and you get `FileNotFoundError: [Errno 2] No such file or directory: 'notes.txt'`, because Python looked for `notes.txt` in the higher folder. That's why the exercises always say: open the terminal **in the chapter folder**. (`os.getcwd()` from [chapter 19](../19-modules-and-standard-library/notes.md) tells you which folder that is.)

**Backslashes are a trap.** Windows shows paths with backslashes, like `C:\Users\Sandip\notes.txt`. But in a Python string, a backslash starts an escape sequence (chapter 06): `\n` is a newline, `\t` is a tab. Look what happens:

```python
print("C:\temp\new\notes.txt")
```

You'll see:

```
C:	emp
ew
otes.txt
```

`\t` became a tab, and both `\n`s became line breaks. Some backslash paths even stop your program from starting:

```python
path = "C:\Users\Sandip\notes.txt"
# SyntaxError: (unicode error) 'unicodeescape' codec can't decode bytes in position 2-3: truncated \UXXXXXXXX escape
```

There are three easy fixes:

```python
print("C:/temp/new/notes.txt")   # 1. Forward slashes. Windows understands them too!
print(r"C:\temp\new\notes.txt")  # 2. A raw string (chapter 06): backslashes stay as they are
```

You'll see:

```
C:/temp/new/notes.txt
C:\temp\new\notes.txt
```

And fix number 3 is the best one: let `pathlib` build paths for you.

### `pathlib`: paths as objects

`pathlib` is a standard library module (chapter 19) for working with paths. Instead of plain strings, it gives you `Path` objects that know how to join folders, check whether files exist, and much more.

```python
from pathlib import Path

folder = Path("data")
notes = folder / "notes.txt"

print(notes)  # prints: data\notes.txt
```

The `/` operator joins path pieces together. It isn't division here: `pathlib` borrows the slash because it looks like a path. You can chain as many pieces as you like:

```python
from pathlib import Path

report = Path("reports") / "2026" / "october.txt"
print(report)  # prints: reports\2026\october.txt
```

On Windows, `Path` shows backslashes, because that's the Windows style. On a Mac it would show `reports/2026/october.txt`. Either way, you never type a backslash yourself, so the escape-character trap can't bite.

### Checking, creating, reading and writing with `Path`

A `Path` comes with handy methods:

```python
from pathlib import Path

folder = Path("data")
folder.mkdir(exist_ok=True)  # make the folder, unless it already exists

notes = folder / "notes.txt"
print(notes.exists())  # prints: False (the first time you run it)

notes.write_text("Buy milk\nCall the dentist\n", encoding="utf-8")
print(notes.exists())  # prints: True

text = notes.read_text(encoding="utf-8")
print(text.splitlines())  # prints: ['Buy milk', 'Call the dentist']
```

| Method | What it does |
|---|---|
| `.exists()` | `True` if the file or folder is there |
| `.mkdir(exist_ok=True)` | Makes the folder. `exist_ok=True` means "don't complain if it's already there" |
| `.write_text(text, encoding="utf-8")` | Opens the file in `"w"` mode, writes the text, closes it. **Replaces** what was there |
| `.read_text(encoding="utf-8")` | Opens the file, reads it all into a string, closes it |
| `.is_file()`, `.is_dir()` | Is it a file? Is it a folder? |

`.write_text()` and `.read_text()` are perfect for small files that you read or write all in one go. For appending, or for going through a big file line by line, use `with open(...)` as before. `open()` happily takes a `Path`:

```python
with open(notes, "a", encoding="utf-8") as f:
    f.write("Water the plants\n")
```

Without `exist_ok=True`, `.mkdir()` raises an error the second time you run the program:

```
FileExistsError: [WinError 183] Cannot create a file when that file already exists: 'data'
```

And to make several folders inside each other in one go, add `parents=True`: `Path("data/reports/2026").mkdir(parents=True, exist_ok=True)`.

### The parts of a path

A `Path` can tell you about its own name:

```python
from pathlib import Path

report = Path("reports") / "2026" / "october.txt"

print(report.name)    # prints: october.txt
print(report.stem)    # prints: october
print(report.suffix)  # prints: .txt
print(report.parent)  # prints: reports\2026
```

| Attribute | Meaning | For `reports/2026/october.txt` |
|---|---|---|
| `.name` | The last part, the full file name | `october.txt` |
| `.stem` | The name without the extension | `october` |
| `.suffix` | The **extension**: the dot and the letters that say what kind of file it is | `.txt` |
| `.parent` | The folder it sits in | `reports\2026` |

These are attributes, not methods, so there are no brackets: `report.name`, not `report.name()`.

### Looking inside a folder: `.iterdir()` and `.glob()`

Say you keep a running journal, one file per day, in a folder called `journal`:

```python
from pathlib import Path

folder = Path("journal")
folder.mkdir(exist_ok=True)
(folder / "monday.txt").write_text("Ran 5 km\n", encoding="utf-8")
(folder / "tuesday.txt").write_text("Rest day\n", encoding="utf-8")
(folder / "photo.jpg").write_text("not really a photo", encoding="utf-8")

for item in sorted(folder.iterdir()):
    print(item)
```

You'll see:

```
journal\monday.txt
journal\photo.jpg
journal\tuesday.txt
```

`.iterdir()` gives you a `Path` for everything in the folder, files and folders alike. (The brackets around `(folder / "monday.txt")` make Python build the path first, then call `.write_text()` on it.) The order `.iterdir()` uses isn't guaranteed, so wrap it in `sorted()` when order matters.

`.glob()` is pickier. You give it a **pattern**, where `*` means "anything":

```python
for item in sorted(folder.glob("*.txt")):
    text = item.read_text(encoding="utf-8").strip()
    print(f"{item.name}: {text}")
```

You'll see:

```
monday.txt: Ran 5 km
tuesday.txt: Rest day
```

`"*.txt"` means "any name that ends in `.txt`", so the photo is skipped. Other patterns work too: `"report*"` finds names that start with `report`, and `"*"` matches everything.

### Files next to your program

Remember that relative paths start from the terminal's folder. When a file must always sit next to your `.py` file, no matter where the terminal is, use this line:

```python
from pathlib import Path

HERE = Path(__file__).parent

with open(HERE / "notes.txt", encoding="utf-8") as f:
    print(f.read(), end="")
```

`__file__` is another "dunder" name, like `__name__` in chapter 19. It holds the path of the `.py` file that's running. Its `.parent` is the folder that file is in. Now `HERE / "notes.txt"` always points at the right place.

In this course, you'll normally just open the terminal in the right folder. But this trick is good to know for programs other people will run.

### Putting it together: a log file

A **log** is a file where a program writes down what it did, one line at a time, like a ship's logbook. Logs are how developers find out what happened while nobody was watching. New lines always go at the end, so a log is the perfect job for append mode:

```python
def log(message):
    """Add one line to the end of the log file."""
    with open("cafe.log", "a", encoding="utf-8") as f:
        f.write(message + "\n")


log("Cafe opened")
log("Sold 2 lattes")
log("Cafe closed")

with open("cafe.log", encoding="utf-8") as f:
    print(f.read(), end="")
```

The first time you run it, you'll see:

```
Cafe opened
Sold 2 lattes
Cafe closed
```

Run it again, and the log keeps growing, because `"a"` never wipes the file:

```
Cafe opened
Sold 2 lattes
Cafe closed
Cafe opened
Sold 2 lattes
Cafe closed
```

Real logs also record **when** each thing happened. You'll add the date and time to each line in [chapter 22](../22-dates-and-times/notes.md). (Python even has a whole `logging` module for this, which you'll meet in [chapter 37](../37-debugging-and-logging/notes.md).)

## Common mistakes

**1. Using `"w"` when you meant `"a"`**

```python
with open("diary.txt", "w", encoding="utf-8") as f:
    f.write("Thursday: went swimming\n")
```

No error appears, but every earlier diary entry is gone. `"w"` empties the file as soon as it opens it. Fix: use `"a"` to add to the end. Before running anything with `"w"`, ask yourself: "am I happy to lose what's in this file?"

**2. Forgetting `\n` with `.write()`**

```python
with open("shopping.txt", "w", encoding="utf-8") as f:
    f.write("Eggs")
    f.write("Bread")
```

The file contains `EggsBread` on one line. `.write()` never adds a newline for you. Fix: `f.write("Eggs\n")`, or use `print("Eggs", file=f)`, which adds it automatically.

**3. Leaving out `encoding="utf-8"`**

```python
with open("greeting.txt", "w") as f:
    f.write("नमस्ते, Sandip!\n")
# UnicodeEncodeError: 'charmap' codec can't encode characters in position 0-5: character maps to <undefined>
```

Without an encoding, Windows often uses an old one that can't store Nepali letters, emoji, or many symbols. Worse, this code might work on one computer and crash on another. Fix: always add `encoding="utf-8"`, both when writing and when reading.

**4. Backslashes in a Windows path**

```python
path = "C:\Users\Sandip\notes.txt"
# SyntaxError: (unicode error) 'unicodeescape' codec can't decode bytes in position 2-3: truncated \UXXXXXXXX escape
```

`\U` starts a special escape code, and `\n` would become a newline. Fix: use forward slashes (`"C:/Users/Sandip/notes.txt"`), a raw string (`r"C:\Users\Sandip\notes.txt"`), or better still, a relative path built with `pathlib`.

**5. Running from the wrong folder**

```
FileNotFoundError: [Errno 2] No such file or directory: 'notes.txt'
```

But the file is right there, next to your program! Relative paths start from the terminal's folder, not the program's. Fix: open the terminal in the folder where the files are (right-click the folder in VS Code's Explorer, **Open in Integrated Terminal**). Or use `Path(__file__).parent`, as shown above.

**6. Using the file after the `with` block**

```python
with open("notes.txt", encoding="utf-8") as f:
    print("Opened the notes")

text = f.read()
# ValueError: I/O operation on closed file.
```

The file closed when the indented block ended. **I/O** stands for input/output: reading and writing. Fix: do all your reading inside the `with` block, and save what you need in variables.

## Quick recap

- Variables vanish when a program ends. Files on disk stay, so files are how programs remember.
- Open files with `with open(path, mode, encoding="utf-8") as f:`. `with` opens the file, lets you use it, and closes it automatically.
- Modes: `"r"` reads (the default), `"w"` **empties the file** and writes, `"a"` adds to the end.
- Read with `f.read()`, `for line in f:` (plus `line.strip()`), or `f.read().splitlines()`. Write with `f.write(text)` (add your own `\n`) or `print(..., file=f)`.
- A missing file raises `FileNotFoundError`. Catch it with `try`/`except` when "no file yet" is normal.
- Relative paths start from the terminal's folder. Avoid backslashes in path strings.
- `pathlib.Path` builds paths with `/`, and gives you `.exists()`, `.mkdir(exist_ok=True)`, `.read_text()`, `.write_text()`, `.iterdir()`, `.glob("*.txt")`, `.name`, `.stem` and `.suffix`.

---

**Next:** try the [exercises](exercises.md), then move on to [21 JSON and CSV](../21-json-and-csv/notes.md).
