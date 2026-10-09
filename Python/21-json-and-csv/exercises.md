# 21 JSON and CSV: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.py`, `ex2.py`, and so on).
- Run each one with `python ex1.py` from a terminal opened in this folder.
- JSON files get `encoding="utf-8"`. CSV files get `newline=""` **and** `encoding="utf-8"`. Each exercise tells you which data files to use.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Saved settings

A music app wants to remember your settings between runs. Start `ex1.py` with this dictionary:

```python
settings = {
    "theme": "dark",
    "volume": 7,
    "notifications": True,
    "favorite_genres": ["comedy", "sci-fi"],
}
```

1. Save it to `settings.json`, pretty-printed with 2 spaces.
2. Load it back from the file into a **new** variable, and print three of the settings.
3. Turn the volume up by 1 in the loaded dictionary, and save it again.
4. Load the file one more time and print the new volume.

Expected output:

```
Theme: dark
Volume: 7
Favorite genres: comedy, sci-fi
Volume is now: 8
```

Then open `settings.json` in VS Code. It should look like this:

```json
{
  "theme": "dark",
  "volume": 8,
  "notifications": true,
  "favorite_genres": [
    "comedy",
    "sci-fi"
  ]
}
```

<details>
<summary>Hint 1</summary>

Saving to a file uses `json.dump` (no `s`), and loading from a file uses `json.load`. Each one goes inside its own `with open(...)` block.

</details>

<details>
<summary>Hint 2</summary>

`", ".join(...)` from chapter 06 turns the list of genres into `comedy, sci-fi`.

</details>

---

## Exercise 2 (Easy): Reading a weather report

Weather websites send their data as JSON text. Here's a small report, as one long string:

```python
weather_text = '{"city": "Kathmandu", "temp_c": 24.5, "raining": false, "forecast": [{"day": "Sat", "high": 26}, {"day": "Sun", "high": 23}, {"day": "Mon", "high": 25}]}'
```

Turn it into Python data, then print:

```
Weather for Kathmandu
Now: 24.5 C / 76.1 F
No rain today
Forecast:
  Sat: 26 C
  Sun: 23 C
  Mon: 25 C
Warmest day: Sat
```

**Rules:**

- Don't change `weather_text`, and don't type any of its values (like `"Kathmandu"` or `26`) in your own code.
- Work out Fahrenheit with the formula: F = C × 9 / 5 + 32.
- If `raining` were `true`, the third line should say `Rain today` instead.

<details>
<summary>Hint 1</summary>

This JSON is a string, not a file, so it's `json.loads` (with an `s`).

</details>

<details>
<summary>Hint 2</summary>

`weather["forecast"]` is a list of dictionaries. Loop over it, and keep track of the day with the biggest `"high"` as you go, like finding the maximum in chapter 09.

</details>

<details>
<summary>Hint 3</summary>

After `loads`, `raining` is a real Python `False`, so you can use it straight in an `if`.

</details>

---

## Exercise 3 (Medium): Bug hunt in the gradebook

A teacher's program writes a small grades spreadsheet, works out each student's average, and saves the averages as JSON. Copy it into `ex3.py` and fix it.

```python
# Turn the grades spreadsheet into a JSON summary
import csv
import json

with open("grades.csv", "w", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["student", "math", "science"])
    writer.writerow(["Asha", 78, 85])
    writer.writerow(["Bikash", 92, 88])
    writer.writerow(["Chloe", 65, 71])

summary = {}
with open("grades.csv", newline="", encoding="utf-8") as f:
    for row in csv.DictReader(f):
        average = (row["math"] + row["science"]) / 2
        summary[row["student"]] = average

with open("summary.json", "w", encoding="utf-8") as f:
    json.dumps(summary, f, indent=2)

with open("summary.json", encoding="utf-8") as f:
    loaded = json.loads(f)

for student, average in loaded.items():
    print(f"{student}: {average}")
```

There are 4 bugs. Three of them crash the program. The fourth one is sneaky: the output looks right even while it's still there. When everything is fixed, you should see:

```
Asha: 81.5
Bikash: 90.0
Chloe: 68.0
```

And when you print the contents of `grades.csv` (or open it in VS Code), there must be **no blank lines** between the rows.

**Rule:** fix the bugs, don't rewrite the program.

<details>
<summary>Hint 1</summary>

The first error is about `/` with a `'str'`. What type is every value that comes out of a CSV file?

</details>

<details>
<summary>Hint 2</summary>

Two of the crashes come from the same mix-up. Check the table in the notes: which JSON functions work with strings, and which work with open files?

</details>

<details>
<summary>Hint 3</summary>

For the sneaky one, add a `with open(...)` block at the end for a moment that reads `grades.csv` and prints `f.read()`. If you see blank lines, look at the `open()` line that **writes** the CSV. (`DictReader` quietly skips blank rows, which is why the averages still looked fine.)

</details>

---

## Exercise 4 (Medium): Running club leaderboard

Your running club logs every run. Start `ex4.py` with this list:

```python
runs = [
    {"date": "2026-10-01", "runner": "Ana", "km": 5.0},
    {"date": "2026-10-01", "runner": "Sandip", "km": 8.2},
    {"date": "2026-10-03", "runner": "Ben", "km": 10.5},
    {"date": "2026-10-04", "runner": "Ana", "km": 6.5},
    {"date": "2026-10-05", "runner": "Sandip", "km": 12.0},
    {"date": "2026-10-06", "runner": "Ben", "km": 4.0},
    {"date": "2026-10-07", "runner": "Ana", "km": 7.5},
]
```

**Part 1:** save it as `runs.csv` with `csv.DictWriter`. The file should look like this:

```
date,runner,km
2026-10-01,Ana,5.0
2026-10-01,Sandip,8.2
2026-10-03,Ben,10.5
2026-10-04,Ana,6.5
2026-10-05,Sandip,12.0
2026-10-06,Ben,4.0
2026-10-07,Ana,7.5
```

**Part 2:** read `runs.csv` back with `csv.DictReader` (don't use the `runs` list for this part, pretend the file came from someone else). Work out each runner's total distance and the longest single run, then print:

```
Total distance by runner:
  Sandip   20.2 km
  Ana      19.0 km
  Ben      14.5 km
Longest run: 12.0 km by Sandip on 2026-10-05
Saved leaderboard.json
```

**Part 3:** save the leaderboard to `leaderboard.json`, biggest total first:

```json
{
  "Sandip": 20.2,
  "Ana": 19.0,
  "Ben": 14.5
}
```

<details>
<summary>Hint 1</summary>

The totals use the counting pattern from chapter 13, adding kilometres instead of 1: `totals[runner] = totals.get(runner, 0) + km`. Don't forget that `row["km"]` is a string.

</details>

<details>
<summary>Hint 2</summary>

To sort the runners by distance, here's a trick from chapter 19: a `Counter` can be made from a dictionary of numbers, and `.most_common()` then gives you `(runner, total)` pairs, biggest first. `dict(...)` turns that list of pairs back into a dictionary for saving.

</details>

<details>
<summary>Hint 3</summary>

For the longest run, keep the whole row (a dictionary) of the longest run so far. Then at the end you have its distance, runner and date together.

</details>

---

## Exercise 5 (Challenge): Budget tracker with a bank import

You want to track your spending against a monthly budget of 300. Your bank lets you download your spending as a CSV file, and your program will keep everything in a JSON file between runs.

Start `ex5.py` with this setup code, which creates the bank's file:

```python
import csv

with open("bank_export.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["date", "description", "amount"])
    writer.writerow(["2026-10-01", "Corner Grocery", "42.50"])
    writer.writerow(["2026-10-02", "Bus pass", "30.00"])
    writer.writerow(["2026-10-03", "Cinema", "9.00"])
    writer.writerow(["2026-10-03", "Corner Grocery", "18.25"])
```

Then write these functions, and a few lines that use them:

- `load_data(filename)` loads `budget.json`. If the file doesn't exist, it returns the default `{"budget": 300, "expenses": []}`. If the file is broken, it prints `budget.json was broken, starting from scratch.` and returns the same default.
- `save_data(filename, data)` saves the data, pretty-printed.
- `import_csv(filename, data)` reads the bank's CSV and adds each expense (with `amount` as a real number) to `data["expenses"]`, **unless the same expense is already saved** (same date, description and amount). It returns two numbers: how many were new, and how many were already there.

After importing and saving, print a summary, and export a `summary.csv` with the total for each description, sorted by description, with 2 decimal places.

The first run should print:

```
Imported 4 new expenses (0 already saved).
Spent: 99.75 of 300.00
Left: 200.25
Biggest: Corner Grocery, 42.50 on 2026-10-01
Saved summary.csv
```

And `summary.csv` should contain:

```
description,total
Bus pass,30.00
Cinema,9.00
Corner Grocery,60.75
```

Now test it properly:

- **Run it a second time.** The first line should say `Imported 0 new expenses (4 already saved).`, and every total should stay the same. Importing the same bank file twice must not count your shopping twice.
- **Break `budget.json`**: open it, replace everything with `oops`, save, and run again. You should see `budget.json was broken, starting from scratch.` and then the same output as the first run.

<details>
<summary>Hint 1</summary>

`load_data` is the load-with-a-default pattern from the notes, with two `except` blocks: one for `FileNotFoundError` and one for `json.JSONDecodeError`.

</details>

<details>
<summary>Hint 2</summary>

To spot duplicates quickly, build a **set** (chapter 12) of tuples like `(date, description, amount)` from the expenses you already have. A set comprehension from chapter 15 does it in one line. Checking `key in seen` is then instant.

</details>

<details>
<summary>Hint 3</summary>

Convert the amount with `float()` **before** you build the tuple, so `"42.50"` from the CSV and `42.5` from the JSON file count as the same expense.

</details>

<details>
<summary>Hint 4</summary>

For `summary.csv`, total up each description with the counting pattern, loop over `sorted(totals.items())`, and write each row with an f-string like `f"{total:.2f}"` so it always has two decimal places.

</details>

---

## Before you move on

Your expenses have dates like `"2026-10-01"`, but to Python they're just text. Can you work out how many days ago that was? Which expenses happened this week? What weekday was it?

Strings can't answer those questions. [Chapter 22](../22-dates-and-times/notes.md) turns text like `"2026-10-01"` into real dates you can do maths with.
