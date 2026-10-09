# 26 Project: To-Do List App: Exercises

**How to do these:**

- These are stretch goals: extra features for your finished to-do app. Finish all eight milestones in the [notes](notes.md) first.
- Before you start, copy your finished `todo.py` and `storage.py` into a new folder called `finished`, so you always have a working version to go back to. Then add the stretch goals to `my-todo-app`, one after another.
- Before each exercise, reset the sample data from the starter folder, just like in the milestones: `Copy-Item ..\starter\tasks.json .`
- Keep type hints on every new function, and finish each exercise with `python -m mypy todo.py storage.py` saying `Success`.
- The outputs below were made on 9 October 2026. Tasks with due dates may show as `(OVERDUE)` if you run them later.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Search

Your list is getting long, and you want to find the task about the passport. Add a `search` sub-command that shows every task (done or not) whose title contains some text, ignoring capital letters.

Use the help text `find tasks by a word in the title` for the sub-command, and `the text to look for` for its argument, called `text`.

```
python todo.py search milk
 ID  Done  Due         Task
  1  [ ]   2026-10-08  Buy milk  (OVERDUE)
1 match

python todo.py search an
 ID  Done  Due         Task
  3  [ ]   -           Call grandma
  4  [x]   2026-10-07  Water the plants
2 matches

python todo.py search PASS
 ID  Done  Due         Task
  2  [ ]   2029-03-01  Renew passport
1 match

python todo.py search pizza
No tasks match 'pizza'.
```

<details>
<summary>Hint 1</summary>

Write a function `search_tasks(tasks: list[Task], text: str) -> list[Task]`. A list comprehension with an `if` does the whole job. `in` checks whether one string is inside another ([chapter 06](../06-strings/notes.md)).

</details>

<details>
<summary>Hint 2</summary>

"Ignoring capitals" means comparing lowercase with lowercase: `.lower()` on both the text and the title. And `format_task` already builds each row for you.

</details>

---

## Exercise 2 (Easy): Priorities

Some tasks matter more than others. Add a `--priority` option to `add`, which can only be `high`, `normal` or `low`, with a default of `normal` and the help text `how important it is (default: normal)`. Save it in each new task as a `"priority"` key. In the table, a high-priority task gets `! ` in front of its title.

```
python todo.py add "Pay rent" --priority high --due 2027-01-01
Added task 5: Pay rent (due 2027-01-01)

python todo.py add "Tidy the desk" --priority low
Added task 6: Tidy the desk

python todo.py add "Fix the bike" --priority urgent
usage: todo.py add [-h] [--due DUE] [--priority {high,normal,low}] title
todo.py add: error: argument --priority: invalid choice: 'urgent' (choose from 'high', 'normal', 'low')

python todo.py list
 ID  Done  Due         Task
  1  [ ]   2026-10-08  Buy milk  (OVERDUE)
  2  [ ]   2029-03-01  Renew passport
  3  [ ]   -           Call grandma
  5  [ ]   2027-01-01  ! Pay rent
  6  [ ]   -           Tidy the desk
5 to do, 1 overdue, 1 done
```

In `tasks.json`, the new tasks now have six keys:

```
  {
    "id": 5,
    "title": "Pay rent",
    "done": false,
    "created": "2026-10-09",
    "due": "2027-01-01",
    "priority": "high"
  }
```

Here's the tricky part: the four sample tasks were saved **before** priorities existed, so they have no `"priority"` key at all. Your app must still work with them, without you editing `tasks.json` by hand.

<details>
<summary>Hint 1</summary>

Which argparse setting limits an option to a fixed list of values? You met it in [chapter 24](../24-command-line-programs/notes.md).

</details>

<details>
<summary>Hint 2</summary>

`task["priority"]` crashes with a `KeyError` on the old tasks. Which dictionary method from [chapter 13](../13-dictionaries/notes.md) reads a key, and gives a default when it's missing?

</details>

---

## Exercise 3 (Medium): Sorting

Add a `--sort` option to `list`. It can be `id` (the default), `due` or `title`, with the help text `the order to show tasks in (default: id)`.

- `--sort due` puts the earliest due date first, and tasks with no due date last.
- `--sort title` sorts alphabetically, ignoring capitals.

Reset the sample data, add one more task, then try:

```
python todo.py add "Post the birthday card" --due 2027-01-15
Added task 5: Post the birthday card (due 2027-01-15)

python todo.py list --sort due
 ID  Done  Due         Task
  1  [ ]   2026-10-08  Buy milk  (OVERDUE)
  5  [ ]   2027-01-15  Post the birthday card
  2  [ ]   2029-03-01  Renew passport
  3  [ ]   -           Call grandma
4 to do, 1 overdue, 1 done

python todo.py list --sort title
 ID  Done  Due         Task
  1  [ ]   2026-10-08  Buy milk  (OVERDUE)
  3  [ ]   -           Call grandma
  5  [ ]   2027-01-15  Post the birthday card
  2  [ ]   2029-03-01  Renew passport
4 to do, 1 overdue, 1 done
```

`--sort due --all` should put "Water the plants" (due 2026-10-07) at the very top.

**Rule:** use only what you know. (`sorted()` with a `key=` would make this shorter, but that's [chapter 34](../34-functional-tools/notes.md).)

<details>
<summary>Hint 1</summary>

Python can't sort dictionaries, but it can sort **tuples** ([chapter 12](../12-tuples-and-sets/notes.md)): it compares the first items, and only looks at the second items when the first ones are equal. Build a list of tuples like `(due_date_text, task_id)`, and `.sort()` it.

</details>

<details>
<summary>Hint 2</summary>

Dates in `YYYY-MM-DD` text sort in the right order even as plain strings, because the year comes first, then the month, then the day. For tasks with no due date, use a pretend date far in the future, like `"9999-12-31"`, so they end up last.

</details>

<details>
<summary>Hint 3</summary>

After sorting the tuples, loop over them and use `find_task` to turn each ID back into its task. If mypy then says `Incompatible types in assignment (expression has type "dict[str, Any] | None", variable has type "dict[str, Any]")`, you've probably reused a variable name: mypy remembers what type a name had the first time you used it in a function. Give the result of `find_task` a new name, like `found`.

</details>

---

## Exercise 4 (Medium): Editing a task

Typos happen, and plans change. Add an `edit` sub-command that changes a task's title, its due date, or both. It takes the task's `id`, plus three options:

- `--title` (help: `the new title`)
- `--due` (help: `the new due date, like 2026-10-15`)
- `--no-due`, a flag (help: `remove the due date`)

Use the help text `change a task's title or due date` for the sub-command. Then `python todo.py edit -h` shows:

```
usage: todo.py edit [-h] [--title TITLE] [--due DUE] [--no-due] id

positional arguments:
  id             the task's ID

options:
  -h, --help     show this help message and exit
  --title TITLE  the new title
  --due DUE      the new due date, like 2026-10-15
  --no-due       remove the due date
```

Reset the sample data, then try:

```
python todo.py edit 3 --title "Call grandma on Sunday" --due 2026-10-11
Updated task 3: Call grandma on Sunday (due 2026-10-11)

python todo.py edit 1 --no-due
Updated task 1: Buy milk

python todo.py edit 2
Error: nothing to change (use --title, --due or --no-due)

python todo.py edit 9 --title "Anything"
Error: there's no task with ID 9

python todo.py edit 2 --due 2029-13-01
Error: the due date must look like 2026-10-15, not '2029-13-01'

python todo.py edit 2 --due 2030-01-01 --no-due
Error: use --due or --no-due, not both

python todo.py edit 2 --title "  "
Error: the task needs a title

python todo.py list
 ID  Done  Due         Task
  1  [ ]   -           Buy milk
  2  [ ]   2029-03-01  Renew passport
  3  [ ]   2026-10-11  Call grandma on Sunday
3 to do, 0 overdue, 1 done
```

None of the failed edits changed anything: task 2 still has its old title and due date.

<details>
<summary>Hint 1</summary>

Write `edit_task(tasks: list[Task], task_id: int, title: str | None, due: str | None, no_due: bool) -> Task`. Do every check first (the task exists, there's something to change, not both `--due` and `--no-due`), and only then change the task.

</details>

<details>
<summary>Hint 2</summary>

You already have the tools for checking: `find_task` for the ID, and `parse_due` for the date. `--no-due` becomes `args.no_due` (dashes turn into underscores).

</details>

<details>
<summary>Hint 3</summary>

Why does the order matter? If you change the title first and *then* find out the date is bad, the error is raised before saving, so nothing is saved, which is fine. But it's a good habit to check everything before changing anything, because one day your code might save in the middle.

</details>

---

## Exercise 5 (Challenge): A colourful list with rich

Plain text is fine, but a real app deserves colour. **rich** is a popular package on PyPI for beautiful terminal output: colours, tables, progress bars and more. Use it to make `list` look like this (with overdue tasks in red, and done tasks dimmed):

```
                   My tasks                    
┏━━━━┳━━━━━━┳━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━┓
┃ ID ┃ Done ┃ Due        ┃ Task               ┃
┡━━━━╇━━━━━━╇━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━┩
│  1 │ [ ]  │ 2026-10-08 │ Buy milk (OVERDUE) │
│  2 │ [ ]  │ 2029-03-01 │ Renew passport     │
│  3 │ [ ]  │ -          │ Call grandma       │
│  4 │ [x]  │ 2026-10-07 │ Water the plants   │
└────┴──────┴────────────┴────────────────────┘
3 to do, 1 overdue, 1 done
```

(That's `list --all`. The colours don't show on this page.)

**Step 1: install it in your virtual environment** ([chapter 23](../23-pip-and-virtual-environments/notes.md)). Activate `.venv`, run `python -m pip install rich`, and save your shopping list with `python -m pip freeze > requirements.txt`. (You'll see mypy and its helpers in there too, plus a few packages rich needs.)

**Step 2: try rich on its own.** Save this as `rich_test.py` and run it:

```python
from rich.console import Console
from rich.table import Table

table = Table(title="My tasks")
table.add_column("ID", justify="right")
table.add_column("Task")
table.add_row("1", "Buy milk", style="red")
table.add_row("2", "Renew passport")

console = Console()
console.print(table)
console.print("[green]All saved![/green]")
```

You'll see (in colour):

```
       My tasks        
┏━━━━┳━━━━━━━━━━━━━━━━┓
┃ ID ┃ Task           ┃
┡━━━━╇━━━━━━━━━━━━━━━━┩
│  1 │ Buy milk       │
│  2 │ Renew passport │
└────┴────────────────┘
All saved!
```

A few things to know. `Table` builds a table: one `add_column` per column, then one `add_row` per row, where every value must be a **string**. `style=` colours a whole row: `"red"`, `"green"`, `"dim"`, `"bold"`, and many more. `Console().print()` prints it. And text in square brackets, like `[green]...[/green]`, is rich's **markup**: little tags that switch styles on and off.

**Step 3: use it in your app.** Change `print_tasks` so it builds a rich table instead of printing rows of text. Keep the summary line underneath, and keep `Nothing to do!` for an empty list.

**Step 4: don't break the app for people without rich.** If someone runs your app without rich installed, it should still work, with the plain table from the milestones. Test it: run `deactivate` and then `python todo.py list --all`. You should get the original plain table, not a traceback.

<details>
<summary>Hint 1</summary>

For step 4, put the rich imports inside a `try` block at the top of `todo.py`, and catch `ModuleNotFoundError`, like the banner challenge in [chapter 23](../23-pip-and-virtual-environments/exercises.md). Set a variable like `HAVE_RICH` to `True` or `False`, and check it in `print_tasks`.

</details>

<details>
<summary>Hint 2</summary>

Does your done task show an empty box instead of `[x]`? rich read `[x]` as a markup tag (a style called "x") and hid it! The same would happen to any task title with square brackets in it. rich has a function for exactly this: `from rich.markup import escape`, then pass `escape(box)` and `escape(title)` to `add_row`.

</details>

<details>
<summary>Hint 3</summary>

`add_row` wants strings, so the ID needs `str()`. And you only need one row style: `"dim"` for a done task, `"red"` for an overdue one, and `""` (no style) for the rest. A small `if`/`elif`/`else` picks it.

</details>

---

## Before you move on

Look at how often your code passes a task dictionary to a function: `is_overdue(task, today)`, `format_task(task, today)`, `mark_done(...)`. The data and the functions that work on it always travel together, but nothing in Python ties them to each other. And `Task = dict[str, Any]` admits that the hints can't really describe a task.

[Chapter 27](../27-classes-and-objects/notes.md) starts Level 3 with **classes**, which bundle data and the functions that use it into one thing, like a `Task` that knows whether it's overdue.
