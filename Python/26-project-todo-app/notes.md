# 26 Project: To-Do List App

This is the second big project, and the last chapter of Level 2. In [chapter 14](../14-project-shopping-cart/notes.md), your shopping cart forgot everything the moment the program ended. This time you'll build a to-do list that **remembers**: add a task today, close the terminal, come back next week, and it's still there.

You'll use almost everything from Level 2 along the way: lists of dictionaries, JSON files, `pathlib`, dates, `try`/`except`, two modules working together, argparse sub-commands, and type hints on every function.

Build it one milestone at a time, and run your code after every small change.

## What you'll build

A to-do app for your terminal, driven by sub-commands like `pip install` and `pip list` from [chapter 24](../24-command-line-programs/notes.md). When it's finished, you'll be able to:

- add a task, with an optional due date: `python todo.py add "Buy milk" --due 2026-10-15`,
- list the tasks that still need doing, with overdue ones marked: `python todo.py list`,
- include the finished ones too: `python todo.py list --all`,
- tick a task off by its ID: `python todo.py done 3`,
- delete a task: `python todo.py remove 3`,
- delete every finished task at once: `python todo.py clear-done`,
- get clear error messages (and the right exit code) for mistakes like a bad date or an ID that doesn't exist.

Here's a short session with the finished app, starting with an empty list, on 9 October 2026:

```
python todo.py add "Buy milk" --due 2026-10-08
Added task 1: Buy milk (due 2026-10-08)

python todo.py add "Call grandma"
Added task 2: Call grandma

python todo.py add "Renew passport" --due 2029-03-01
Added task 3: Renew passport (due 2029-03-01)

python todo.py list
 ID  Done  Due         Task
  1  [ ]   2026-10-08  Buy milk  (OVERDUE)
  2  [ ]   -           Call grandma
  3  [ ]   2029-03-01  Renew passport
3 to do, 1 overdue, 0 done

python todo.py done 1
Marked task 1 as done: Buy milk

python todo.py done 7
Error: there's no task with ID 7
```

Every change is saved to a file called `tasks.json`, so the next run picks up exactly where the last one stopped.

> **Watch out:** "Overdue" depends on today's date, so some outputs in this chapter depend on the day you run them. They were made on 9 October 2026. If you run them much later, a task that was in the future might show as `(OVERDUE)` for you. That's your app working correctly.

## Before you start

### Setup

1. Make a copy of this chapter's `starter` folder, in this chapter's folder, and call it `my-todo-app`. Work in the copy, so the starter stays clean. (In VS Code's Explorer, right-click `starter`, choose **Copy**, then right-click the chapter folder and choose **Paste**, and rename the copy.)
2. Right-click `my-todo-app` and choose **Open in Integrated Terminal**. Every command in this chapter runs from there.
3. Make a virtual environment for the project and install mypy into it, like in [chapter 25](../25-type-hints/notes.md). The app itself only uses the standard library, so mypy is the only package you need:

   ```
   python -m venv .venv
   .venv\Scripts\Activate.ps1
   python -m pip install mypy
   ```

   (Use the activate command for your terminal from [chapter 23](../23-pip-and-virtual-environments/notes.md) if you're not in PowerShell.)

4. Pick the `.venv` interpreter in VS Code, and make sure Pylance's Type Checking Mode is set to `basic`. Then Pylance underlines type mistakes while you type.

There are three files in the folder:

| File | What's in it |
|---|---|
| `todo.py` | The program you run. For now: a comment listing the milestones, and an empty **stub** for each function. A stub is just the function's first line, a docstring saying what it should do, and `pass`. |
| `storage.py` | The module that loads and saves tasks. Two stubs. |
| `tasks.json` | Four sample tasks, so there's something to list from the start. |

The stubs have no type hints yet. Each milestone shows you the exact first line to write, hints included. (They can't be in the starter, because the hints use names like `Task` that you'll create yourself in milestone 1.)

### The rules

- Use only what you learned in chapters 01 to 25. In particular, no classes: a task is a plain dictionary. (Classes start in the next chapter.)
- Put type hints on every function.
- Each milestone has hints. Try first, and open a hint only when you're stuck.
- Your code doesn't have to look like anyone else's. If your output matches the expected output, it works. When you're done, ask Claude to review it.

### How the app is organized

**Two modules.** `storage.py` knows about the file: how to read it and how to write it. `todo.py` knows about tasks and commands, and imports what it needs from `storage.py` ([chapter 19](../19-modules-and-standard-library/notes.md)). If you ever want to save tasks somewhere else, like a database ([chapter 42](../42-databases/notes.md)), only `storage.py` has to change.

**One task is one dictionary.** Here's the first task in the sample `tasks.json`:

```
{
  "id": 1,
  "title": "Buy milk",
  "done": false,
  "created": "2026-10-05",
  "due": "2026-10-08"
}
```

| Key | Type in Python | Meaning |
|---|---|---|
| `"id"` | `int` | A number that's different for every task, like a ticket number |
| `"title"` | `str` | What needs doing |
| `"done"` | `bool` | `True` once it's ticked off |
| `"created"` | `str` | The day the task was added, as `"YYYY-MM-DD"` |
| `"due"` | `str` or `None` | The due date as `"YYYY-MM-DD"`, or `None` (`null` in JSON) if there isn't one |

Why are the dates strings? Because JSON has no date type ([chapter 21](../21-json-and-csv/notes.md)), so `json.dump` can't save a `date` object. The app stores dates as text in the ISO format, and turns them into real `date` objects with `date.fromisoformat()` ([chapter 22](../22-dates-and-times/notes.md)) only when it needs to compare them.

**Every command follows the same three steps:**

1. **Load** all the tasks from `tasks.json` into a list.
2. **Change** the list (add a task, tick one off, remove one), or just print it.
3. **Save** the whole list back to `tasks.json`, if anything changed.

Think of a paper to-do list pinned to your fridge. You take it down, cross something off or write something new, and pin it back up. Next time, you start from the paper, not from memory. `tasks.json` is the paper.

## Milestone 1: Loading and saving

**Goal:** `storage.py` can read the tasks from `tasks.json`, and write them back.

1. At the top of `storage.py`, under the comment, import what you need: `json`, `Path` from `pathlib`, and `Any` from `typing` (explained next).
2. Make a type alias for one task:

   ```python
   # One task, like {"id": 1, "title": "Buy milk", "done": False, ...}
   Task = dict[str, Any]
   ```

   The keys of a task are all strings, but the values are a mix: an `int`, some `str`s, a `bool`, and sometimes `None`. `Any` is a special hint that means "any type at all". It tells mypy not to check the values, which is a fair trade for now. ([Chapter 30](../30-dataclasses-and-enums/notes.md) shows a much better way to describe a record like this, with a hint for every field.)

3. Make a constant for the file's location:

   ```python
   # The data file lives next to this file, whichever folder you run from.
   TASKS_FILE = Path(__file__).parent / "tasks.json"
   ```

   `__file__` is a variable Python fills in for you: the path of the `.py` file that's running this code. `.parent` is the folder it's in. So `TASKS_FILE` always points at the `tasks.json` next to `storage.py`, even if you run the app from a different folder. (A plain `Path("tasks.json")` would look in whatever folder the terminal is standing in.)

4. Write `load_tasks`. If the file doesn't exist yet, that just means there are no tasks, so return an empty list:

   ```python
   def load_tasks(path: Path) -> list[Task]:
   ```

5. Write `save_tasks`. It writes the whole list, nicely indented so you can read the file yourself:

   ```python
   def save_tasks(tasks: list[Task], path: Path) -> None:
   ```

6. At the bottom of `storage.py`, add this test code:

   ```python
   if __name__ == "__main__":
       tasks = load_tasks(TASKS_FILE)
       print(f"Loaded {len(tasks)} tasks from {TASKS_FILE.name}")
       for task in tasks:
           print(f"- {task['title']}")
       save_tasks(tasks, TASKS_FILE)
       print(load_tasks(TASKS_FILE) == tasks)
       print(load_tasks(Path("no-such-file.json")))
   ```

   Remember `if __name__ == "__main__":` from [chapter 19](../19-modules-and-standard-library/notes.md)? This code runs when you run `storage.py` directly, but not when `todo.py` imports it. That makes it a handy place for a quick test.

Run `python storage.py`. You'll see:

```
Loaded 4 tasks from tasks.json
- Buy milk
- Renew passport
- Call grandma
- Water the plants
True
[]
```

The `True` means that saving and loading again gives back exactly the same tasks. The `[]` is what a missing file gives you. Open `tasks.json` too: it should look just like before, because `save_tasks` writes it in the same format.

<details>
<summary>Hint 1</summary>

Both functions use `with open(...)` and `encoding="utf-8"` ([chapter 20](../20-files-and-folders/notes.md)). Loading uses `json.load(f)`, and saving uses `json.dump(tasks, f, indent=2)` with the file opened in `"w"` mode ([chapter 21](../21-json-and-csv/notes.md)).

</details>

<details>
<summary>Hint 2</summary>

For the missing file, wrap the `with open(...)` block in `try`, and catch `FileNotFoundError`. That's the "loading with a default" pattern from chapter 21.

</details>

## Milestone 2: The command line

**Goal:** `todo.py` understands all five sub-commands. It doesn't do anything with them yet. It just prints what it understood.

1. At the top of `todo.py`, import `argparse`.
2. Write `build_parser()`, which creates the parser and returns it, without parsing anything:

   ```python
   def build_parser() -> argparse.ArgumentParser:
   ```

   Use the description `A to-do list for your terminal.`, and the sub-commands, arguments and help texts in this table, so your help screens match the ones below:

   | Sub-command | Its help text | Arguments |
   |---|---|---|
   | `add` | `add a new task` | `title` (help: `what needs doing`), and an option `--due` (help: `the due date, like 2026-10-15`) |
   | `list` | `show your tasks` | a flag `--all` (help: `include done tasks`) |
   | `done` | `mark a task as done` | `id`, a whole number (help: `the task's ID`) |
   | `remove` | `delete a task` | `id`, a whole number (help: `the task's ID`) |
   | `clear-done` | `delete every done task` | none |

3. Write `main()`. For now, it only parses the command line and prints the result:

   ```python
   def main() -> None:
       """Read the command line, do the job, and save if anything changed."""
       args = build_parser().parse_args()
       print(args)
   ```

4. At the very bottom of `todo.py`, call `main()` when the file is run directly:

   ```python
   if __name__ == "__main__":
       main()
   ```

Now try the help screens. `python todo.py -h`:

```
usage: todo.py [-h] {add,list,done,remove,clear-done} ...

A to-do list for your terminal.

positional arguments:
  {add,list,done,remove,clear-done}
    add                 add a new task
    list                show your tasks
    done                mark a task as done
    remove              delete a task
    clear-done          delete every done task

options:
  -h, --help            show this help message and exit
```

`python todo.py add -h`:

```
usage: todo.py add [-h] [--due DUE] title

positional arguments:
  title       what needs doing

options:
  -h, --help  show this help message and exit
  --due DUE   the due date, like 2026-10-15
```

Then some real commands. Each one prints what argparse understood:

```
python todo.py add "Buy milk" --due 2026-10-15
Namespace(command='add', title='Buy milk', due='2026-10-15')

python todo.py add "Call grandma"
Namespace(command='add', title='Call grandma', due=None)

python todo.py list --all
Namespace(command='list', all=True)

python todo.py done 3
Namespace(command='done', id=3)

python todo.py clear-done
Namespace(command='clear-done')
```

Notice that `id=3` has no quotes: it's already an `int`. And argparse already catches lots of mistakes for you:

```
python todo.py done abc
usage: todo.py done [-h] id
todo.py done: error: argument id: invalid int value: 'abc'

python todo.py finish 3
usage: todo.py [-h] {add,list,done,remove,clear-done} ...
todo.py: error: argument command: invalid choice: 'finish' (choose from 'add', 'list', 'done', 'remove', 'clear-done')

python todo.py add Buy milk
usage: todo.py [-h] {add,list,done,remove,clear-done} ...
todo.py: error: unrecognized arguments: milk
```

That last one is the "forgot the quotes" mistake from chapter 24. A title with spaces needs quotes around it.

<details>
<summary>Hint 1</summary>

The `cafe.py` example in [chapter 24](../24-command-line-programs/notes.md) has exactly this shape: `add_subparsers(dest="command", required=True)`, then one `add_parser(...)` for each sub-command, then `add_argument(...)` on each of those.

</details>

<details>
<summary>Hint 2</summary>

`clear-done` has no arguments, but it still needs its own `add_parser("clear-done", help=...)` line, or argparse won't know it exists.

</details>

<details>
<summary>Hint 3</summary>

If you get the error `'NoneType' object has no attribute 'parse_args'`, check that `build_parser` ends with `return parser`.

</details>

## Milestone 3: Listing tasks

**Goal:** `python todo.py list` shows the tasks that still need doing, as a table, with overdue tasks marked. `--all` shows the done ones too.

1. Add two imports at the top of `todo.py`: `date` from `datetime`, and `TASKS_FILE`, `Task` and `load_tasks` from `storage`.
2. Write `is_overdue`. A task is overdue when it isn't done, it has a due date, and that date is before today:

   ```python
   def is_overdue(task: Task, today: date) -> bool:
   ```

3. Write `format_task`, which **returns** one row of the table as a string (it doesn't print):

   ```python
   def format_task(task: Task, today: date) -> str:
   ```

   A row is: the ID lined up on the right in 3 characters, two spaces, `[ ]` (or `[x]` when done), three spaces, the due date lined up on the left in 10 characters (or `-` when there isn't one), two spaces, and the title. An overdue task gets `  (OVERDUE)` on the end.

4. Write `print_tasks`:

   ```python
   def print_tasks(tasks: list[Task], show_all: bool, today: date) -> None:
   ```

   - It shows every task when `show_all` is `True`, and only the ones that aren't done when it's `False`.
   - If there's nothing to show, it prints `Nothing to do!` and stops.
   - Otherwise it prints the header line ` ID  Done  Due         Task` (it starts with one space), then one row per task, then a summary like `3 to do, 1 overdue, 1 done`. The summary always counts **all** the tasks, even the hidden ones.

5. Update `main()`. It now loads the tasks, and handles `list`. The other commands still just print `args` for now:

   ```python
   def main() -> None:
       """Read the command line, do the job, and save if anything changed."""
       args = build_parser().parse_args()
       today = date.today()
       tasks = load_tasks(TASKS_FILE)
       if args.command == "list":
           print_tasks(tasks, args.all, today)
       else:
           print(args)  # the other commands come in later milestones
   ```

Why pass `today` into the functions, instead of calling `date.today()` inside each one? Two reasons. The whole run uses one "today", even if it runs past midnight. And it makes the functions easy to test with any date you like, for example `is_overdue(task, date(2026, 10, 9))`.

Run `python todo.py list`:

```
 ID  Done  Due         Task
  1  [ ]   2026-10-08  Buy milk  (OVERDUE)
  2  [ ]   2029-03-01  Renew passport
  3  [ ]   -           Call grandma
3 to do, 1 overdue, 1 done
```

Then `python todo.py list --all`:

```
 ID  Done  Due         Task
  1  [ ]   2026-10-08  Buy milk  (OVERDUE)
  2  [ ]   2029-03-01  Renew passport
  3  [ ]   -           Call grandma
  4  [x]   2026-10-07  Water the plants
3 to do, 1 overdue, 1 done
```

"Water the plants" was due on the 7th too, but it's done, so it isn't overdue.

Finally, check the empty case. In VS Code's Explorer, rename `tasks.json` to `tasks-backup.json` for a moment, and run `python todo.py list` again:

```
Nothing to do!
```

No file means no tasks, thanks to milestone 1. Rename it back to `tasks.json` before you go on.

<details>
<summary>Hint 1</summary>

In `is_overdue`, deal with the easy cases first: a done task, or a task whose `"due"` is `None`, is never overdue. Only then turn the due date into a real date with `date.fromisoformat()` and compare it with `<`.

</details>

<details>
<summary>Hint 2</summary>

For the row, f-string alignment from [chapter 06](../06-strings/notes.md) does the work: `{task['id']:>3}` and `{due:<10}`. A conditional expression from [chapter 08](../08-conditionals/notes.md) picks `"[x]"` or `"[ ]"` in one line.

</details>

<details>
<summary>Hint 3</summary>

List comprehensions with an `if` ([chapter 15](../15-comprehensions/notes.md)) are perfect here: one for the tasks to show, and others to count the tasks that aren't done and the ones that are overdue. `len()` turns each list into a count.

</details>

## Milestone 4: Adding tasks

**Goal:** `python todo.py add "Book summer holiday" --due 2027-06-01` adds a task and saves it, and mistakes give a clear error message and exit code `1`.

This milestone has four parts.

**Part A: a new ID.** Write `next_id`:

```python
def next_id(tasks: list[Task]) -> int:
```

It returns one more than the biggest ID in the list, or `1` if the list is empty. Why not just `len(tasks) + 1`? Because tasks get removed. If you have tasks 1, 2 and 3 and remove task 1, there are two tasks left, and `len(tasks) + 1` gives `3`, an ID that's already taken. One more than the biggest ID is always free.

**Part B: checking the due date.** Write `parse_due`:

```python
def parse_due(text: str | None) -> str | None:
```

- If `text` is `None` (no `--due` was given), return `None`.
- Otherwise, turn it into a `date` with `date.fromisoformat()`, and return it as text again with `.isoformat()`. That might look like a round trip for nothing, but it checks that the date is real, and it tidies it up: Python 3.11 and newer also accept `20261015`, and `.isoformat()` turns that into `2026-10-15`.
- If `date.fromisoformat()` raises a `ValueError`, raise your own `ValueError` with a friendlier message: `the due date must look like 2026-10-15, not '01/11/2026'` (with the text that was typed).

**Part C: making the task.** Write `add_task`:

```python
def add_task(tasks: list[Task], title: str, due: str | None, today: date) -> Task:
```

It strips the spaces off the title. If nothing is left, it raises `ValueError("the task needs a title")`. Otherwise it builds the new task dictionary (with all five keys, `"done"` set to `False`, and `"created"` set to today's date as text), appends it to the list, and returns it.

**Part D: reporting errors properly.** Notice that `parse_due` and `add_task` don't print anything when something's wrong, and they don't stop the program either. They `raise` a `ValueError` with a message ([chapter 18](../18-error-handling/notes.md)). `main()` catches it, and decides how errors look, in one place, for every command:

```python
try:
    ...  # load the tasks and run the command
except ValueError as e:
    print(f"Error: {e}", file=sys.stderr)
    sys.exit(1)
```

That's the pattern from [chapter 24](../24-command-line-programs/notes.md): the message goes to standard error, and the exit code says something went wrong. Import `sys` and `save_tasks`. In `main()`, move everything from `tasks = load_tasks(TASKS_FILE)` to the end of the function inside that `try` block. Then add an `add` branch next to the `list` one: it calls `add_task`, saves the list with `save_tasks`, and prints a message like `Added task 5: Book summer holiday (due 2027-06-01)`. Leave out the `(due ...)` part when there's no due date.

**Before you test, reset the sample data.** Your `tasks.json` should start as the starter version. Copy it back from the starter folder with:

```
Copy-Item ..\starter\tasks.json .
```

(In Command Prompt it's `copy ..\starter\tasks.json .`, and on Mac or Linux `cp ../starter/tasks.json .`.) You'll do this at the start of every milestone from now on, so your output matches.

Now try these, one at a time:

```
python todo.py add "Book summer holiday" --due 2027-06-01
Added task 5: Book summer holiday (due 2027-06-01)

python todo.py add "Bake a cake for Maya"
Added task 6: Bake a cake for Maya

python todo.py add "Return library books" --due 2026-10-01
Added task 7: Return library books (due 2026-10-01)

python todo.py add "   "
Error: the task needs a title

python todo.py add "Pick up parcel" --due 01/11/2026
Error: the due date must look like 2026-10-15, not '01/11/2026'

python todo.py add "Pick up parcel" --due 2027-02-30
Error: the due date must look like 2026-10-15, not '2027-02-30'

python todo.py list
 ID  Done  Due         Task
  1  [ ]   2026-10-08  Buy milk  (OVERDUE)
  2  [ ]   2029-03-01  Renew passport
  3  [ ]   -           Call grandma
  5  [ ]   2027-06-01  Book summer holiday
  6  [ ]   -           Bake a cake for Maya
  7  [ ]   2026-10-01  Return library books  (OVERDUE)
6 to do, 2 overdue, 1 done
```

There's no 30 February, so that date is refused too. Run `$LASTEXITCODE` straight after one of the errors, and you'll see `1`. And the new IDs start at 5, because task 4 is still there (it's done, but it hasn't been removed).

Open `tasks.json`. Your new tasks are at the end, with today's date as `"created"` (yours will be the day you run it):

```
  {
    "id": 7,
    "title": "Return library books",
    "done": false,
    "created": "2026-10-09",
    "due": "2026-10-01"
  }
```

<details>
<summary>Hint 1</summary>

For `next_id`, a list comprehension gives you all the IDs, and `max()` from [chapter 05](../05-numbers-and-math/notes.md) finds the biggest. Check for an empty list first, because `max()` of an empty list is an error.

</details>

<details>
<summary>Hint 2</summary>

In `parse_due`, put only the `date.fromisoformat(text)` line inside the `try`. In the `except ValueError:` block, `raise ValueError(...)` with your own message.

</details>

<details>
<summary>Hint 3</summary>

In `main()`, `args.title` and `args.due` are exactly what `add_task` needs. Don't forget to save after adding, or the task disappears when the program ends.

</details>

## Milestone 5: Ticking tasks off

**Goal:** `python todo.py done 1` marks task 1 as done, and bad IDs give a clear error.

1. Write `find_task`, which searches the list for a task by its ID:

   ```python
   def find_task(tasks: list[Task], task_id: int) -> Task | None:
   ```

2. Write `mark_done`. It finds the task, sets its `"done"` to `True`, and returns it. If there's no task with that ID, it raises `ValueError` with the message `there's no task with ID 99` (with the real ID). If the task is already done, the message is `task 1 is already done`.

   ```python
   def mark_done(tasks: list[Task], task_id: int) -> Task:
   ```

3. Add a `done` branch to `main()`: call `mark_done` with `args.id`, save, and print `Marked task 1 as done: Buy milk` (with the real ID and title).

Reset the sample data (`Copy-Item ..\starter\tasks.json .`), then try:

```
python todo.py done 1
Marked task 1 as done: Buy milk

python todo.py done 1
Error: task 1 is already done

python todo.py done 99
Error: there's no task with ID 99

python todo.py list --all
 ID  Done  Due         Task
  1  [x]   2026-10-08  Buy milk
  2  [ ]   2029-03-01  Renew passport
  3  [ ]   -           Call grandma
  4  [x]   2026-10-07  Water the plants
2 to do, 0 overdue, 2 done
```

"Buy milk" isn't overdue any more, because done tasks never are. Run `python todo.py list` without `--all` too: the done tasks are hidden.

<details>
<summary>Hint 1</summary>

`find_task` is a loop with a `return` inside it, and `return None` after the loop, for when nothing matched. It's the same kind of search you've written before: look at each item until one matches.

</details>

<details>
<summary>Hint 2</summary>

`find_task` gives back the task dictionary that's *inside* the list, not a copy ([chapter 16](../16-scope-and-mutability/notes.md)). So setting `task["done"] = True` changes the task in the list, and saving the list saves the change.

</details>

<details>
<summary>Hint 3</summary>

Pylance and mypy will complain if you use the result of `find_task` before checking it for `None`, just like the library example in chapter 25. Check `if task is None:` and raise first.

</details>

## Milestone 6: Removing tasks

**Goal:** `python todo.py remove 3` deletes task 3 for good.

1. Write `remove_task`. It uses `find_task`, raises the same `there's no task with ID 3` error when there's no such task, removes the task from the list, and returns it:

   ```python
   def remove_task(tasks: list[Task], task_id: int) -> Task:
   ```

2. Add a `remove` branch to `main()` that saves and prints `Removed task 3: Call grandma`.

Reset the sample data, then try:

```
python todo.py remove 3
Removed task 3: Call grandma

python todo.py remove 3
Error: there's no task with ID 3

python todo.py list --all
 ID  Done  Due         Task
  1  [ ]   2026-10-08  Buy milk  (OVERDUE)
  2  [ ]   2029-03-01  Renew passport
  4  [x]   2026-10-07  Water the plants
2 to do, 1 overdue, 1 done
```

Notice that the other tasks keep their IDs: there's a gap where 3 used to be. That's on purpose. If IDs were renumbered after every removal, `done 4` could mean a different task tomorrow than it does today.

<details>
<summary>Hint</summary>

Once `find_task` has given you the task itself, the list method `remove()` from [chapter 11](../11-lists/notes.md) can take it out of the list.

</details>

## Milestone 7: Clearing done tasks

**Goal:** `python todo.py clear-done` deletes every done task at once.

1. Write `clear_done`. It doesn't change the list it's given. It **returns a new list** with only the tasks that aren't done:

   ```python
   def clear_done(tasks: list[Task]) -> list[Task]:
   ```

2. Add a `clear-done` branch to `main()`. It works out how many tasks were cleared by comparing the lengths of the old and new lists, saves the **new** list, and prints `Cleared 2 done tasks.` Mind the grammar: it's `Cleared 1 done task.`, but `Cleared 0 done tasks.` and `Cleared 2 done tasks.`

Reset the sample data, then try:

```
python todo.py clear-done
Cleared 1 done task.

python todo.py clear-done
Cleared 0 done tasks.

python todo.py done 1
Marked task 1 as done: Buy milk

python todo.py done 2
Marked task 2 as done: Renew passport

python todo.py clear-done
Cleared 2 done tasks.

python todo.py list --all
 ID  Done  Due         Task
  3  [ ]   -           Call grandma
1 to do, 0 overdue, 0 done
```

<details>
<summary>Hint 1</summary>

`clear_done` is a single list comprehension with an `if` ([chapter 15](../15-comprehensions/notes.md)). Why a new list, instead of removing the done tasks from the old one inside a `for` loop? See "Common mistakes" at the end of this chapter.

</details>

<details>
<summary>Hint 2</summary>

A conditional expression picks `"task"` or `"tasks"` in one line, depending on whether the number is exactly 1.

</details>

## Milestone 8: A broken file, and a final check

**Goal:** the app copes with a damaged `tasks.json`, and mypy confirms that every hint in both files is honest.

Files get damaged. Someone edits `tasks.json` by hand and deletes a bracket, or the computer loses power halfway through saving. Reset the sample data, open `tasks.json` in VS Code, delete the very last `]` in the file, and save it. Then run `python todo.py list`:

```
Error: Expecting ',' delimiter: line 30 column 1 (char 486)
```

It didn't crash! `json.load` raised a `json.JSONDecodeError`, and that happens to be a special kind of `ValueError`, so your `except ValueError` in `main()` caught it. But the message only makes sense to a programmer. Let's make it friendly.

1. In `load_tasks`, add a second `except` block for `json.JSONDecodeError`. It raises a `ValueError` with this message (using the file's real name, from `path.name`):

   ```
   tasks.json is broken (it isn't valid JSON). Fix it or delete it.
   ```

2. Run `python todo.py list` again:

   ```
   Error: tasks.json is broken (it isn't valid JSON). Fix it or delete it.
   ```

   The exit code is `1`, and no traceback in sight. Every command that loads the file (which is all of them) now gives this same clear message.

3. Put the `]` back (or reset the sample data), and check that everything works again.

Now the final check. With your virtual environment active, run mypy on both files:

```
python -m mypy todo.py storage.py
```

The goal is this line:

```
Success: no issues found in 2 source files
```

If mypy finds problems, read each one, fix it, and run it again. The most likely one is using a task from `find_task` without checking for `None` first. It looks like this (your line numbers will be different):

```
todo.py:108: error: Value of type "dict[str, Any] | None" is not indexable  [index]
```

Notice that mypy shows `Task` by its real shape, `dict[str, Any]`.

<details>
<summary>Hint 1</summary>

In `load_tasks`, you can have more than one `except` after a `try`. Raising a new `ValueError` inside the `except json.JSONDecodeError:` block works just like the one in `parse_due`.

</details>

<details>
<summary>Hint 2</summary>

If mypy complains about a function's hints, compare its first line with the one in the milestone. Every first line in this chapter has the hints you need.

</details>

## Putting it all together

Time for a full run, from an empty list. Delete `tasks.json` (your app will make a new one), and run these commands one by one:

```
python todo.py list
Nothing to do!

python todo.py add "Buy milk" --due 2026-10-08
Added task 1: Buy milk (due 2026-10-08)

python todo.py add "Call grandma"
Added task 2: Call grandma

python todo.py add "Renew passport" --due 2029-03-01
Added task 3: Renew passport (due 2029-03-01)

python todo.py add "Water the plants"
Added task 4: Water the plants

python todo.py done 4
Marked task 4 as done: Water the plants

python todo.py list
 ID  Done  Due         Task
  1  [ ]   2026-10-08  Buy milk  (OVERDUE)
  2  [ ]   -           Call grandma
  3  [ ]   2029-03-01  Renew passport
3 to do, 1 overdue, 1 done

python todo.py list --all
 ID  Done  Due         Task
  1  [ ]   2026-10-08  Buy milk  (OVERDUE)
  2  [ ]   -           Call grandma
  3  [ ]   2029-03-01  Renew passport
  4  [x]   -           Water the plants
3 to do, 1 overdue, 1 done

python todo.py done 1
Marked task 1 as done: Buy milk

python todo.py clear-done
Cleared 2 done tasks.

python todo.py list
 ID  Done  Due         Task
  2  [ ]   -           Call grandma
  3  [ ]   2029-03-01  Renew passport
2 to do, 0 overdue, 0 done
```

Now close the terminal, open a new one in `my-todo-app`, and run `python todo.py list` again. Your two tasks are still there. 🎉 That's a real, working command-line app that remembers.

### Test it like a user

Before you call it finished, try to break it. Tick each box once it works:

- [ ] `python todo.py -h` and `python todo.py add -h` show tidy help screens.
- [ ] A title with spaces works when it's in quotes, and an empty title (`"   "`) gives an error.
- [ ] Bad dates (`15/10/2026`, `2026-02-30`, `tomorrow`) give an error, and nothing is saved.
- [ ] `done` and `remove` with an ID that doesn't exist give an error, and so does `done abc`.
- [ ] After every error, `$LASTEXITCODE` is not `0`.
- [ ] Tasks, ticks and removals all survive closing the terminal.
- [ ] A broken `tasks.json` gives a friendly message, not a traceback.
- [ ] It works from another folder: go up one level with `cd ..`, and run `python my-todo-app/todo.py list`. You should see the same tasks.
- [ ] `python -m mypy todo.py storage.py` says `Success`.

> **Tip:** You'll notice a new `__pycache__` folder next to your files. Python creates it when `todo.py` imports `storage.py`, to make the next import faster. It's safe to delete, and it belongs in `.gitignore` along with `.venv/` and `.mypy_cache/`.

## Common mistakes

**1. Changing the list, but forgetting to save**

```python
elif args.command == "done":
    task = mark_done(tasks, args.id)
    print(f"Marked task {task['id']} as done: {task['title']}")
```

It prints the right message, and the task even shows as done if you list it in the same run. But the next run loads `tasks.json` again, and the task is back to not done. Changing the list only changes the copy in memory. Every command that changes something must end with `save_tasks(...)`.

**2. Removing items from a list while looping over it**

It's tempting to write `clear_done` like this:

```python
tasks = [
    {"id": 1, "title": "Buy milk", "done": True},
    {"id": 2, "title": "Call grandma", "done": True},
    {"id": 3, "title": "Renew passport", "done": False},
]
for task in tasks:
    if task["done"]:
        tasks.remove(task)
print([task["title"] for task in tasks])
```

You'll see:

```
['Call grandma', 'Renew passport']
```

"Call grandma" was done, but it survived! When "Buy milk" was removed, everything after it moved up one place, and the loop stepped right over "Call grandma". Never remove items from a list while a `for` loop is walking through it. Build a new list with a comprehension instead, as in milestone 7.

**3. Comparing a date string with a `date`**

```python
from datetime import date

task = {"id": 1, "title": "Buy milk", "done": False, "due": "2026-10-08"}
print(task["due"] < date.today())
```

```
TypeError: '<' not supported between instances of 'str' and 'datetime.date'
```

The due date is stored as text, because JSON can't hold dates. Turn it into a `date` first: `date.fromisoformat(task["due"]) < today`.

**4. Forgetting `type=int` on the ID**

Without `type=int`, `args.id` is the string `"3"`, and a string is never equal to a number:

```python
tasks = [{"id": 3, "title": "Call grandma"}]
task_id = "3"
found = None
for task in tasks:
    if task["id"] == task_id:
        found = task
print(found)  # prints: None
```

So `python todo.py done 3` says `Error: there's no task with ID 3`, even though task 3 is right there. Add `type=int` to the `id` arguments in `build_parser()`. (Type hints can't save you here. `args` can hold values of any type, so mypy has no idea what `args.id` is, and stays quiet. The `type=int` is the only protection.)

**5. Putting a `date` straight into a task**

```python
import json
from datetime import date

task = {"id": 1, "title": "Buy milk", "due": date(2026, 10, 15)}
print(json.dumps(task))
```

```
TypeError: Object of type date is not JSON serializable
```

`json` only knows about strings, numbers, booleans, `None`, lists and dictionaries. Store dates as text with `.isoformat()`, like `today.isoformat()` for `"created"`.

**6. Using a plain `Path("tasks.json")`**

If `TASKS_FILE` is `Path("tasks.json")`, the app looks for the file in whatever folder the terminal is in. Run it from the right folder, and everything's fine. Run `python my-todo-app/todo.py list` from the folder above, and you get `Nothing to do!`: it looked for a `tasks.json` that isn't there. Worse, the next `add` creates a second, separate `tasks.json` in the wrong folder. Build the path from `Path(__file__).parent`, so it's always next to your code.

## Quick recap

In this project, you practised:

- Splitting a program into two modules with clear jobs: `storage.py` for the file, `todo.py` for the commands ([chapter 19](../19-modules-and-standard-library/notes.md)).
- Keeping data between runs: load the whole list from JSON, change it, save it back ([chapters 20](../20-files-and-folders/notes.md) and [21](../21-json-and-csv/notes.md)).
- Storing dates as ISO text, and turning them back into `date` objects to compare them ([chapter 22](../22-dates-and-times/notes.md)).
- Building a real command-line tool with argparse sub-commands ([chapter 24](../24-command-line-programs/notes.md)).
- One clear error pattern: helper functions `raise ValueError`, and `main()` prints the message to standard error and exits with code `1` ([chapter 18](../18-error-handling/notes.md)).
- Type hints on every function, checked by Pylance and mypy ([chapter 25](../25-type-hints/notes.md)).

Look at how you stored each task: a dictionary with the same five keys every time, and a group of functions that all take a task and do something with it. Python has a tool built for exactly that: a **class**, which bundles the data and the functions that work on it into one thing. That's where Level 3 begins.

---

**Next:** try the stretch goals in the [exercises](exercises.md), then start Level 3 with [27 Classes and Objects](../27-classes-and-objects/notes.md).
