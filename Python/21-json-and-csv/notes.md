# 21 JSON and CSV

## What is it?

**JSON** and **CSV** are two ways of writing data as plain text, so it can be saved in a file or sent to another program.

- **JSON** (short for JavaScript Object Notation, usually said like the name "Jason") stores structured data: dictionaries and lists, nested inside each other.
- **CSV** (short for comma-separated values) stores tables: rows and columns, like a spreadsheet.

Python's standard library has a module for each: `json` and `csv`.

## Why does it matter?

In [chapter 20](../20-files-and-folders/notes.md) you saved plain lines of text. That's fine for a shopping list, but real data has more shape. A to-do task has its text, a "done" flag, maybe a priority. What happens if you save a dictionary with `str()`?

```python
task = {"text": "Buy milk", "done": False}

with open("task.txt", "w", encoding="utf-8") as f:
    f.write(str(task))

with open("task.txt", encoding="utf-8") as f:
    loaded = f.read()

print(loaded)        # prints: {'text': 'Buy milk', 'done': False}
print(type(loaded))  # prints: <class 'str'>
print(loaded["text"])
# TypeError: string indices must be integers, not 'str'
```

It **looks** like a dictionary, but it came back as a string. Python has no safe, built-in way to turn that text back into a dictionary. You'd have to pull it apart by hand, character by character.

JSON solves exactly this. You hand it a dictionary or list, it turns it into text, and later it turns that text back into a real dictionary or list, with numbers still numbers and `True` still `True`.

And CSV is everywhere in the real world. Your bank lets you download statements as CSV. Excel and Google Sheets can save any sheet as CSV. Once Python can read CSV, it can total up your spending, find your best month, or tidy up a messy list from work.

## Real-world example

Think of the paperwork in a school office.

A **student record card** has labelled boxes: name, class, phone, a list of clubs. That's structured data, and it's what JSON is good at. A **class register** is a table: one row per student, the same columns in every row, with the column names written across the top. That's CSV.

| School office | Python |
|---|---|
| A record card with labelled boxes | A dictionary |
| Photocopying the card so you can post it | `json.dumps()`: data to text |
| Typing the posted card back into your filing system | `json.loads()`: text to data |
| The class register: one row per student | A CSV file |
| The column names across the top of the register | The CSV **header** row |
| Reading the register row by row | `csv.reader` or `csv.DictReader` |

## How it works

### What JSON looks like

Here's a library book written as JSON:

```json
{
  "title": "The Hobbit",
  "year": 1937,
  "price": 12.5,
  "available": true,
  "tags": ["fantasy", "classic"],
  "borrowed_by": null
}
```

It looks almost exactly like a Python dictionary. That's no accident: JSON grew out of JavaScript (if you did the [JavaScript course](../../JavaScript/23-json-and-local-storage/notes.md), you've used it there), and JavaScript objects look a lot like Python dictionaries. But JSON has its own strict rules:

| | JSON | Python |
|---|---|---|
| Text | Double quotes only: `"The Hobbit"` | `"..."` or `'...'` |
| Dictionary keys | Always strings in double quotes | Strings, numbers, tuples... |
| True and false | `true`, `false` (lowercase) | `True`, `False` |
| Nothing | `null` | `None` |
| A comma after the last item | Not allowed | Allowed |
| Comments | Not allowed | Allowed with `#` |

Almost every programming language can read and write JSON. That's why it's the standard way for apps and websites to swap data. When you fetch weather data from the internet in [chapter 40](../40-working-with-apis/notes.md), it'll arrive as JSON.

### From Python to JSON text: `json.dumps`

`json.dumps()` turns a Python value into a JSON string. Think of it as "dump to string": the `s` is for **string**.

```python
import json

book = {
    "title": "The Hobbit",
    "year": 1937,
    "price": 12.5,
    "available": True,
    "tags": ["fantasy", "classic"],
    "borrowed_by": None,
}

text = json.dumps(book)
print(text)
print(type(text))  # prints: <class 'str'>
```

You'll see:

```
{"title": "The Hobbit", "year": 1937, "price": 12.5, "available": true, "tags": ["fantasy", "classic"], "borrowed_by": null}
<class 'str'>
```

`True` became `true`, and `None` became `null`. Everything is on one long line, which is fine for computers but hard for people to read. Add `indent=2` to **pretty-print** it, spread over several lines with 2 spaces of indentation:

```python
print(json.dumps(book, indent=2))
```

You'll see:

```
{
  "title": "The Hobbit",
  "year": 1937,
  "price": 12.5,
  "available": true,
  "tags": [
    "fantasy",
    "classic"
  ],
  "borrowed_by": null
}
```

### From JSON text to Python: `json.loads`

`json.loads()` goes the other way: "load from string". It reads JSON text and gives you real Python values:

```python
import json

text = '{"name": "Mia", "level": 7, "badges": ["speedy", "explorer"], "premium": false}'
player = json.loads(text)

print(type(player))         # prints: <class 'dict'>
print(player["name"])       # prints: Mia
print(player["level"] + 1)  # prints: 8
print(len(player["badges"]))  # prints: 2
print(player["premium"])    # prints: False
```

`player` is a real dictionary. `player["level"]` is a real number, so `+ 1` does maths. `false` came back as Python's `False`.

Why single quotes around `text`? JSON needs double quotes inside, so single quotes on the outside stop the first `"` from ending the string. In real programs you'll rarely type JSON by hand. It usually comes from a file or from the internet.

### How Python types map to JSON

JSON only knows a few kinds of value. Here's how Python's types are translated, both ways:

| Python | JSON | Back in Python after `loads` |
|---|---|---|
| `dict` | object `{...}` | `dict` |
| `list` | array `[...]` | `list` |
| `tuple` | array `[...]` | `list` (not a tuple!) |
| `str` | string `"..."` | `str` |
| `int` | number | `int` |
| `float` | number | `float` |
| `True` / `False` | `true` / `false` | `True` / `False` |
| `None` | `null` | `None` |

Two things change on the round trip, and both can surprise you:

```python
import json

point = (3, 4)
print(json.loads(json.dumps(point)))  # prints: [3, 4]

cart = {101: 2, 205: 1}  # product ID -> quantity
text = json.dumps(cart)
print(text)              # prints: {"101": 2, "205": 1}
print(json.loads(text))  # prints: {'101': 2, '205': 1}
```

The tuple came back as a list, and the number keys came back as **strings**, because JSON keys are always strings. So after loading, `cart[101]` gives `KeyError: 101`; you'd need `cart["101"]`. The simplest way to avoid that is to use string keys from the start when you know the data will be saved as JSON.

### Saving and loading files: `json.dump` and `json.load`

To save JSON to a file, use `json.dump()`, **without** the `s`. It writes straight into an open file:

```python
import json

tasks = [
    {"id": 1, "text": "Buy milk", "done": False},
    {"id": 2, "text": "Call the dentist", "done": True},
]

with open("tasks.json", "w", encoding="utf-8") as f:
    json.dump(tasks, f, indent=2)
```

Open `tasks.json` in VS Code, and you'll see:

```json
[
  {
    "id": 1,
    "text": "Buy milk",
    "done": false
  },
  {
    "id": 2,
    "text": "Call the dentist",
    "done": true
  }
]
```

To load it back, use `json.load()`, also without the `s`:

```python
with open("tasks.json", encoding="utf-8") as f:
    loaded = json.load(f)

print(loaded[0]["text"])  # prints: Buy milk
print(loaded == tasks)    # prints: True
```

`loaded == tasks` is `True`: what came back is exactly what you saved. That's the "table of records" pattern from [chapter 13](../13-dictionaries/notes.md) (a list of dictionaries), and now it survives between runs.

| Function | Works with | Direction |
|---|---|---|
| `json.dumps(data)` | a **s**tring | Python to JSON text |
| `json.loads(text)` | a **s**tring | JSON text to Python |
| `json.dump(data, f)` | an open file | Python to JSON, saved in the file |
| `json.load(f)` | an open file | JSON in the file to Python |

> **Tip:** JSON files also get `encoding="utf-8"`, like every text file. If your data has letters from other languages, like `"नमस्ते"`, JSON writes them as codes like `\u0928` by default. That's still correct, just hard to read. Add `ensure_ascii=False` to `json.dump()` to keep them as real letters in the file.

### What JSON can't save

JSON only understands the types in the table above. Anything else raises a `TypeError`. A set from [chapter 12](../12-tuples-and-sets/notes.md), for example:

```python
import json

club = {"name": "Running club", "members": {"Ann", "Bob"}}
json.dumps(club)
# TypeError: Object of type set is not JSON serializable
```

**Serializable** means "can be turned into text for saving". The fix is to turn the value into something JSON does understand before saving. A set becomes a list (sorted, so the order is always the same):

```python
club["members"] = sorted(club["members"])
print(json.dumps(club))  # prints: {"name": "Running club", "members": ["Ann", "Bob"]}
```

When you load it back, it'll be a list. If you need a set again, convert it: `set(club["members"])`.

Dates have the same problem. You'll learn about them in [chapter 22](../22-dates-and-times/notes.md), but here's a sneak peek, because you'll save dates as JSON very soon:

```python
import json
from datetime import date

json.dumps({"due": date(2026, 10, 9)})
# TypeError: Object of type date is not JSON serializable
```

The workaround is `str()`, which turns a date into text like `"2026-10-09"`:

```python
print(json.dumps({"due": str(date(2026, 10, 9))}))  # prints: {"due": "2026-10-09"}
```

When you load it, it's a string, and chapter 22 shows how to turn it back into a date.

### When the JSON is broken: `json.JSONDecodeError`

Data from outside your program isn't always in good shape. Someone edits the file by hand and makes a typo, the program crashes halfway through saving, or the file is simply empty. `json.load()` can't guess what broken JSON was meant to say, so it raises a `json.JSONDecodeError`:

```python
import json

with open("broken.json", encoding="utf-8") as f:
    data = json.load(f)
# json.decoder.JSONDecodeError: Expecting value: line 1 column 1 (char 0)
```

(The traceback says `json.decoder.JSONDecodeError`, because the error lives in a part of `json` called `decoder`. In your own code, just write `json.JSONDecodeError`.)

The message tells you what Python expected and where: `line 1 column 1` is the very first character, and `char 0` is the same spot counted from 0, like string indexes. Here are the messages for some classic mistakes:

| Broken JSON | What's wrong | The message |
|---|---|---|
| `{'name': 'Mia'}` | Single quotes | `Expecting property name enclosed in double quotes: line 1 column 2 (char 1)` |
| `{"done": True}` | Python's `True` instead of `true` | `Expecting value: line 1 column 10 (char 9)` |
| `[1, 2,]` | A comma after the last item | `Illegal trailing comma before end of array: line 1 column 6 (char 5)` |
| `{"level": 7, "coins": 120` | The end is missing | `Expecting ',' delimiter: line 1 column 26 (char 25)` |
| an empty file | Nothing to read at all | `Expecting value: line 1 column 1 (char 0)` |

You can't control what's in a file, so wrap the loading in `try`/`except` from [chapter 18](../18-error-handling/notes.md):

```python
import json

try:
    with open("broken.json", encoding="utf-8") as f:
        data = json.load(f)
except json.JSONDecodeError as e:
    print(f"Couldn't read the file: {e}")
    data = {}
```

If `broken.json` contains just the word `oops`, you'll see:

```
Couldn't read the file: Expecting value: line 1 column 1 (char 0)
```

### Loading with a default when the file is missing

When you load saved data, two things can go wrong:

1. **Nothing has been saved yet.** On the very first run, there's no file, so you get `FileNotFoundError` (chapter 20).
2. **The file is broken**, so you get `json.JSONDecodeError`.

Instead of handling both every time, write a `load` function once, and give it a sensible default. Here's a to-do list that remembers its tasks:

```python
import json


def load_tasks(filename):
    """Load the task list, or start with an empty one."""
    try:
        with open(filename, encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return []
    except json.JSONDecodeError as e:
        print(f"Could not read {filename} ({e}). Starting fresh.")
        return []


def save_tasks(filename, tasks):
    """Save the task list as pretty JSON."""
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(tasks, f, indent=2)


tasks = load_tasks("todo.json")
print(f"Loaded {len(tasks)} tasks")

tasks.append({"text": f"Task number {len(tasks) + 1}", "done": False})
save_tasks("todo.json", tasks)
print(f"Saved {len(tasks)} tasks")
```

Run it three times:

```
Loaded 0 tasks
Saved 1 tasks
```

```
Loaded 1 tasks
Saved 2 tasks
```

```
Loaded 2 tasks
Saved 3 tasks
```

The list grows, because each run loads what the last one saved. Now break it on purpose: open `todo.json`, replace everything with the word `broken`, save, and run again:

```
Could not read todo.json (Expecting value: line 1 column 1 (char 0)). Starting fresh.
Loaded 0 tasks
Saved 1 tasks
```

No crash. The program explains what happened and carries on. Notice that it doesn't hide the problem silently: the message tells you why your tasks disappeared.

The default matters. Because `load_tasks` always returns a list, the rest of your program can call `.append()` or loop over it straight away, even on the very first run. You'll use this exact pattern in the to-do project in [chapter 26](../26-project-todo-app/notes.md).

> **Watch out:** `"w"` mode empties the file the moment it opens (chapter 20). If your program crashes in the middle of `json.dump()`, you can be left with a half-written, broken file. That's one more reason `load_tasks` handles `JSONDecodeError`.

### What CSV looks like

Now for tables. Here's a CSV file of expenses, the kind your bank might let you download:

```
date,category,description,amount
2026-10-01,food,Groceries,42.5
2026-10-02,transport,Bus pass,30
2026-10-03,food,"Lunch, with friends",12.75
2026-10-05,fun,Cinema ticket,9
```

- Each line is one **row**, like one line of a spreadsheet.
- Commas separate the **columns**.
- The first row is usually the **header**: the names of the columns.
- When a value contains a comma itself, like `Lunch, with friends`, it's wrapped in double quotes so the comma isn't mistaken for a column break.

Double-click a `.csv` file on a computer with Excel, and it opens as a spreadsheet. In VS Code, you see the plain text above. Both are the same file.

### Writing CSV: `csv.writer`

The `csv` module turns lists into CSV rows for you, adding commas and quotes where needed:

```python
import csv

with open("expenses.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["date", "category", "description", "amount"])
    writer.writerow(["2026-10-01", "food", "Groceries", 42.50])
    writer.writerow(["2026-10-02", "transport", "Bus pass", 30])
    writer.writerow(["2026-10-03", "food", "Lunch, with friends", 12.75])
    writer.writerow(["2026-10-05", "fun", "Cinema ticket", 9])
```

`csv.writer(f)` wraps the open file in a **writer**: an object whose `.writerow()` method takes a list and writes it as one row. Open `expenses.csv` and you'll find exactly the file from the last section, quotes around `"Lunch, with friends"` included. You didn't have to think about the comma at all.

`.writerow()` turns numbers into text for you (notice `42.50` was saved as `42.5`, the way Python prints that float). There's also `.writerows()`, which takes a list of rows and writes them all at once.

### Why `newline=""`?

Look at the `open()` line again: `newline=""`. The official Python docs ask you to add it whenever you open a CSV file, for reading or writing. Here's what happens on Windows if you forget it:

```python
import csv

with open("bad.csv", "w", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["name", "age"])
    writer.writerow(["Ann", 30])
    writer.writerow(["Bob", 25])

with open("bad.csv", encoding="utf-8") as f:
    print(f.read(), end="")
```

You'll see:

```
name,age

Ann,30

Bob,25

```

Blank lines between every row! Open it in Excel, and you get an empty row between each real one.

Here's why. Windows marks the end of a line with two characters, `\r\n` (a "carriage return" and a "newline", names left over from typewriters). The `csv` module already writes `\r\n` at the end of each row. But a file opened normally on Windows **also** turns every `\n` into `\r\n` as it writes. So each row ends with `\r\r\n`, and the extra `\r` shows up as a blank line.

`newline=""` tells `open()`: "don't change line endings, the `csv` module is handling them". On a Mac or Linux the bug doesn't show, but adding `newline=""` is still correct, and it keeps your program working everywhere.

> **Tip:** The rule to remember: **CSV files get `newline=""` and `encoding="utf-8"`.** Other text files (chapter 20) and JSON files just get `encoding="utf-8"`.

### Reading CSV: `csv.reader`

`csv.reader` does the opposite: it reads each line and splits it into a list of strings:

```python
import csv

with open("expenses.csv", newline="", encoding="utf-8") as f:
    reader = csv.reader(f)
    for row in reader:
        print(row)
```

You'll see:

```
['date', 'category', 'description', 'amount']
['2026-10-01', 'food', 'Groceries', '42.5']
['2026-10-02', 'transport', 'Bus pass', '30']
['2026-10-03', 'food', 'Lunch, with friends', '12.75']
['2026-10-05', 'fun', 'Cinema ticket', '9']
```

Two things to notice:

1. The header is just the first row. To skip it, call `next(reader)` once before your loop. `next()` takes the next item from the reader, so the loop starts at the second row.
2. **Every value is a string**, even the numbers: `'42.5'`, not `42.5`. CSV is plain text, and unlike JSON it has no way to say "this is a number". It's your job to convert with `float()` or `int()` (chapter 03).

Here's the total spent, with both of those handled:

```python
import csv

with open("expenses.csv", newline="", encoding="utf-8") as f:
    reader = csv.reader(f)
    header = next(reader)  # skip the header row
    total = 0
    for row in reader:
        total += float(row[3])  # column 3 is the amount

print(f"Total: {total:.2f}")  # prints: Total: 94.25
```

If you forget the `float()`, Python refuses to mix text and numbers: `row[3] + 10` gives `TypeError: can only concatenate str (not "int") to str`.

### Why not just use `split(",")`?

You might think: a CSV line is just values with commas between them, so why not use `.split(",")` from chapter 06? Because of the quoted commas:

```python
import csv

line = '2026-10-03,food,"Lunch, with friends",12.75'

print(line.split(","))
# prints: ['2026-10-03', 'food', '"Lunch', ' with friends"', '12.75']

print(next(csv.reader([line])))
# prints: ['2026-10-03', 'food', 'Lunch, with friends', '12.75']
```

`split` chopped the description in half and gave five columns instead of four. The `csv` module knows the quoting rules. (Passing `[line]`, a list with one line in it, is a quick way to try `csv.reader` without a file.)

### Rows as dictionaries: `csv.DictReader`

`row[3]` works, but it's not very readable: what was column 3 again? `csv.DictReader` uses the header row to turn every other row into a dictionary, with the column names as keys:

```python
import csv

with open("expenses.csv", newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(row)
```

You'll see:

```
{'date': '2026-10-01', 'category': 'food', 'description': 'Groceries', 'amount': '42.5'}
{'date': '2026-10-02', 'category': 'transport', 'description': 'Bus pass', 'amount': '30'}
{'date': '2026-10-03', 'category': 'food', 'description': 'Lunch, with friends', 'amount': '12.75'}
{'date': '2026-10-05', 'category': 'fun', 'description': 'Cinema ticket', 'amount': '9'}
```

The header row is used up automatically, so there's no `next()` to remember. Now you can write `row["amount"]` instead of `row[3]`, which also keeps working if someone adds a new column in the middle of the file. The values are still strings, so you still convert:

```python
import csv

with open("expenses.csv", newline="", encoding="utf-8") as f:
    for row in csv.DictReader(f):
        print(f"{row['description']:<22} {float(row['amount']):>8.2f}")
```

You'll see:

```
Groceries                 42.50
Bus pass                  30.00
Lunch, with friends       12.75
Cinema ticket              9.00
```

(Notice the single quotes inside the f-string: `row['description']`. Python 3.12 and newer would also accept double quotes there, but using the other kind of quote is easier to read, and it works in older versions too.)

### Writing dictionaries: `csv.DictWriter`

If your data is already a list of dictionaries (the table-of-records pattern), `csv.DictWriter` writes it straight out. You tell it the column names, in order, with `fieldnames`:

```python
import csv

members = [
    {"name": "Ann", "joined": "2026-01-15", "distance_km": 42},
    {"name": "Bob", "joined": "2026-03-02", "distance_km": 18.5},
]

with open("members.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["name", "joined", "distance_km"])
    writer.writeheader()        # writes the header row
    writer.writerows(members)   # writes one row per dictionary
```

`members.csv` now contains:

```
name,joined,distance_km
Ann,2026-01-15,42
Bob,2026-03-02,18.5
```

If a dictionary has a key that isn't in `fieldnames`, `DictWriter` stops you, so data can't quietly go missing:

```
ValueError: dict contains fields not in fieldnames: 'distance_km'
```

### Putting it together: an expenses report

Here's a small report that totals the expenses by category, using the counting pattern from chapter 13 (with amounts instead of 1s):

```python
import csv

totals = {}
with open("expenses.csv", newline="", encoding="utf-8") as f:
    for row in csv.DictReader(f):
        category = row["category"]
        amount = float(row["amount"])
        totals[category] = totals.get(category, 0) + amount

print("Expenses by category")
print("-" * 24)
for category, amount in sorted(totals.items()):
    print(f"{category:<12}{amount:>12.2f}")
print("-" * 24)
print(f"{'Total':<12}{sum(totals.values()):>12.2f}")
```

You'll see:

```
Expenses by category
------------------------
food               55.25
fun                 9.00
transport          30.00
------------------------
Total              94.25
```

Add a new row to `expenses.csv` (in VS Code, or with a little program using mode `"a"`), run the report again, and the totals update by themselves.

### JSON or CSV?

| | JSON | CSV |
|---|---|---|
| Shape of the data | Anything: nested dicts and lists | A flat table: rows and columns |
| Keeps types (numbers, true/false) | Yes | No, everything comes back as text |
| Opens nicely in Excel | No | Yes |
| Good for | App data, settings, data from the internet | Spreadsheets, bank statements, simple lists of records |
| Python module | `json` | `csv` |

A rough rule: if a person will open it in a spreadsheet, use CSV. If only your program needs it, or the data is nested, use JSON.

## Common mistakes

**1. Mixing up `load` and `loads` (or `dump` and `dumps`)**

```python
import json

data = json.load("tasks.json")
# AttributeError: 'str' object has no attribute 'read'
```

`json.load()` wants an open file, not a file name. It tried to call `.read()` on the string `"tasks.json"`. The opposite mix-up is just as confusing:

```python
with open("tasks.json", encoding="utf-8") as f:
    data = json.loads(f)
# TypeError: the JSON object must be str, bytes or bytearray, not TextIOWrapper
```

(`TextIOWrapper` is the type of an open text file.) Remember: the `s` stands for **string**. Files get `load`/`dump`, strings get `loads`/`dumps`.

**2. Forgetting that CSV values are strings**

```python
amounts = ["42.5", "30", "12.75"]  # what csv.reader gives you
print(sum(amounts))
# TypeError: unsupported operand type(s) for +: 'int' and 'str'
```

Everything from a CSV file is text. Fix: convert each value as you read it, with `float(row["amount"])` or `int(...)`.

**3. Forgetting `newline=""` with CSV**

No error appears, but on Windows every row is followed by a blank row, and `csv.reader` gives you empty lists `[]` for them. Fix: always open CSV files with `newline=""`, for reading and writing.

**4. Saving a set (or a date) as JSON**

```python
json.dumps({"tags": {"fantasy", "classic"}})
# TypeError: Object of type set is not JSON serializable
```

JSON has no sets and no dates. Fix: convert first, with `sorted(tags)` or `list(tags)` for a set, and `str(...)` for a date.

**5. Expecting number keys to survive**

```python
cart = json.loads(json.dumps({101: 2}))
print(cart[101])
# KeyError: 101
```

JSON keys are always strings, so the key came back as `"101"`. Fix: use `cart["101"]`, or use string keys from the start.

**6. Giving `csv.reader` a file name**

```python
import csv

for row in csv.reader("expenses.csv"):
    print(row)
```

You'll see one letter per row: `['e']`, `['x']`, `['p']`, and so on. No error, just nonsense. `csv.reader` reads whatever you give it line by line, and looping over a plain string gives one character at a time. Fix: open the file with `with open(...)` first, and pass the file object `f` to `csv.reader`.

## Quick recap

- **JSON** saves dictionaries and lists as text. `json.dumps` / `json.loads` work with strings, and `json.dump` / `json.load` work with open files. Add `indent=2` to make it readable.
- JSON maps `dict`, `list`, `str`, `int`, `float`, `True`/`False` and `None` to object, array, string, number, `true`/`false` and `null`. Tuples come back as lists, and keys always come back as strings.
- Sets and dates can't be saved directly: convert them first (`sorted()`, `list()`, `str()`).
- Broken JSON raises `json.JSONDecodeError`. Write a load function that returns a default when the file is missing or broken.
- **CSV** is a table as text. Open CSV files with `newline=""` and `encoding="utf-8"`. Use `csv.writer` / `csv.reader` for lists, and `csv.DictWriter` / `csv.DictReader` for dictionaries.
- Every value read from CSV is a string. Convert numbers with `float()` or `int()`.

---

**Next:** try the [exercises](exercises.md), then move on to [22 Dates and Times](../22-dates-and-times/notes.md).
