# 20 Files and Folders: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.py`, `ex2.py`, and so on).
- Run each one with `python ex1.py` from a terminal opened in this folder. (This matters even more than usual: relative paths start from the terminal's folder.)
- Every `open()` uses `with` and `encoding="utf-8"`. Each exercise tells you which file names to use, so your files don't clash.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Packing list

You're going on a trip and want your packing list saved, so you can check it again on the day.

Start with this list:

```python
items = ["Passport", "Phone charger", "Toothbrush", "Rain jacket"]
```

1. Write every item to a file called `packing.txt`, one item per line.
2. Print `Packing list saved.`
3. In a **separate** `with` block, open `packing.txt` again, read it line by line, and print each item with a number.

Expected output:

```
Packing list saved.
1. Passport
2. Phone charger
3. Toothbrush
4. Rain jacket
```

Open `packing.txt` in VS Code afterwards. It should show four lines, with no numbers and no blank lines.

**Rule:** use a loop to write the items. Don't type the four items a second time.

<details>
<summary>Hint 1</summary>

Inside the writing `with` block, loop over `items` and write each one. What do you need to add to the end of each item so it lands on its own line?

</details>

<details>
<summary>Hint 2</summary>

When reading, `enumerate(f, start=1)` gives you the numbers, and `.strip()` removes the `\n` at the end of each line.

</details>

---

## Exercise 2 (Easy): Water tracker

You want to drink 8 glasses of water a day. Write a program that you run once each time you drink a glass. Every run adds one line, `Glass of water`, to a file called `water.txt`, then tells you how you're doing.

Running it three times in a row should show:

```
Glasses today: 1
7 to go.
```

```
Glasses today: 2
6 to go.
```

```
Glasses today: 3
5 to go.
```

On the eighth run it should say `Glasses today: 8` and `Goal reached! Well done.` (Delete `water.txt` in VS Code's Explorer to start a new day.)

**Rules:**

- The very first run, when `water.txt` doesn't exist yet, must not crash.
- Never use mode `"w"` in this program.

<details>
<summary>Hint 1</summary>

You need two steps: first count the lines already in the file, then append one more line. The count you print is the old count plus one.

</details>

<details>
<summary>Hint 2</summary>

Opening a missing file for reading raises `FileNotFoundError`. Wrap the reading part in `try`/`except` from chapter 18, and set the count to `0` in the `except` block.

</details>

---

## Exercise 3 (Medium): Bug hunt at the bowling alley

A friend wrote a program to save their bowling scores and show the best game. It's full of bugs. Copy it into `ex3.py` and fix it one error at a time.

```python
# Save the bowling scores, then show the best one
from pathlib import Path

scores = [134, 178, 152, 201, 167]

Path("data").mkdir()
for score in scores:
    with open("data\new_scores.txt", "w", encoding="utf-8") as f:
        f.write(score)

with open("data\new_scores.txt", encoding="utf-8") as f:
    print("Scores saved.")
lines = f.read().splitlines()

numbers = [int(line) for line in lines]
print(f"Games: {len(numbers)}")
print(f"Best: {max(numbers)}")
```

There are 6 bugs. Four of them crash the program, and two just give the wrong answer. When it's fixed, it should print this **every time you run it**, not just the first time:

```
Scores saved.
Games: 5
Best: 201
```

**Rule:** fix the bugs, don't rewrite the program. Keep the `data` folder and the file name `new_scores.txt`.

<details>
<summary>Hint 1</summary>

The first error is `OSError: [Errno 22] Invalid argument: 'data\new_scores.txt'`. Which two characters in that path does Python read as one special character? Look back at "Backslashes are a trap" in the notes.

</details>

<details>
<summary>Hint 2</summary>

The second run crashes in a new place, even though nothing changed. What did the first run leave behind? `.mkdir()` has an option for that.

</details>

<details>
<summary>Hint 3</summary>

`ValueError: I/O operation on closed file.` means the file was used after its `with` block ended. Look at the indentation of the line that reads the file.

</details>

<details>
<summary>Hint 4</summary>

If you see `Games: 1`, ask: how many times does the file get opened in `"w"` mode, and what does `"w"` do to a file each time? Then, if the best score looks like a giant number, open `data/new_scores.txt` in VS Code and look at it.

</details>

---

## Exercise 4 (Medium): Recipe folder report

You keep your recipes as text files, one ingredient per line. Start `ex4.py` with this setup code. It creates a `recipes` folder with some files in it, so everyone gets the same results:

```python
from pathlib import Path

folder = Path("recipes")
folder.mkdir(exist_ok=True)
(folder / "dal_bhat.txt").write_text("lentils\nrice\nturmeric\ncumin\n", encoding="utf-8")
(folder / "momo.txt").write_text("flour\nminced chicken\nonion\ngarlic\nginger\n", encoding="utf-8")
(folder / "pancakes.txt").write_text("flour\nmilk\neggs\n", encoding="utf-8")
(folder / "shopping.md").write_text("# Not a recipe\n", encoding="utf-8")
```

Then write code that goes through every `.txt` file in the folder, in alphabetical order, and prints a report:

```
Dal Bhat    4 ingredients
Momo        5 ingredients
Pancakes    3 ingredients
3 recipes, 12 ingredients in total
Most used ingredient: flour (2 recipes)
```

Finally, save the same report lines into a file called `recipe_report.txt` in this chapter folder (**not** inside `recipes`).

**Rules:**

- Don't type the recipe names anywhere in your report code. Get them from the file names.
- `shopping.md` must be left out, without an `if` that mentions it by name.
- Use a `Counter` from [chapter 19](../19-modules-and-standard-library/notes.md) for the most used ingredient.

<details>
<summary>Hint 1</summary>

`sorted(folder.glob("*.txt"))` gives you just the recipe files, in alphabetical order.

</details>

<details>
<summary>Hint 2</summary>

`path.stem` gives `dal_bhat`. Two string methods from chapter 06 turn that into `Dal Bhat`: one swaps the underscore for a space, and one capitalizes each word.

</details>

<details>
<summary>Hint 3</summary>

Keep one big list of every ingredient from every recipe (`.extend()` from chapter 11 helps). Its length is the total, and a `Counter` of it gives the most used one.

</details>

<details>
<summary>Hint 4</summary>

To print the report and also save it, build the lines in a list first. Then loop over the list twice: once with `print(line)`, and once inside a `with` block with `print(line, file=f)`.

</details>

**Think about it:** why would saving the report as `recipes/report.txt` cause trouble the next time you run the program?

---

## Exercise 5 (Challenge): A notes app that remembers

Build a small notes app with a menu. Your notes are saved in `data/notes.txt` (in a `data` folder inside this chapter folder), so they're still there next time you run it.

The menu:

```
--- Notes ---
1. Add a note
2. Show notes
3. Search
4. Delete a note
5. Quit
```

Here's a sample session, starting with no saved notes. What the user types is shown after each prompt:

```
--- Notes ---
1. Add a note
2. Show notes
3. Search
4. Delete a note
5. Quit
Choose: 2
No notes yet.
Choose: 1
Note: Buy milk
Saved.
Choose: 1
Note: Call the dentist about Tuesday
Saved.
Choose: 1
Note: Buy a birthday card for Mum
Saved.
Choose: 2
1. Buy milk
2. Call the dentist about Tuesday
3. Buy a birthday card for Mum
Choose: 3
Search for: buy
1. Buy milk
3. Buy a birthday card for Mum
Choose: 4
Delete which number? 2
Deleted: Call the dentist about Tuesday
Choose: 4
Delete which number? 9
There is no note 9.
Choose: 4
Delete which number? two
Please type a number.
Choose: 3
Search for: holiday
No matching notes.
Choose: 5
Bye! Your notes are saved in data\notes.txt
```

Run it again, choose `2`, and `Buy milk` and `Buy a birthday card for Mum` should still be there.

**Requirements:**

- Build the file path with `pathlib`, and create the `data` folder if it's missing.
- Write small functions: at least `load_notes()` (returns a list of notes, or an empty list if the file doesn't exist yet), `save_notes(notes)` and `add_note(text)`.
- Adding a note appends to the file. Deleting rewrites the whole file without that note.
- Search ignores capital letters, and shows each note's real number.
- Bad input never crashes the program: not in the menu, not when deleting.

<details>
<summary>Hint 1</summary>

Use the menu loop from [chapter 09](../09-loops/notes.md): `while True`, `input()`, `if`/`elif` for each choice, and `break` for Quit.

</details>

<details>
<summary>Hint 2</summary>

`load_notes()` is the `try`/`except FileNotFoundError` pattern from the notes, returning `f.read().splitlines()` or `[]`.

</details>

<details>
<summary>Hint 3</summary>

To delete: load the list, remove the item with `.pop(number - 1)` (the list counts from 0, people count from 1), then call `save_notes()`, which opens the file in `"w"` mode and writes every remaining note back.

</details>

<details>
<summary>Hint 4</summary>

`int("two")` raises a `ValueError`. Catch it, print the message, and `continue` back to the menu. Check the number is between `1` and `len(notes)` before you pop.

</details>

<details>
<summary>Hint 5</summary>

For search, compare lowercase with lowercase: `word in note.lower()`. Loop with `enumerate(..., start=1)` over **all** the notes, so the numbers you print match the "Show notes" numbers.

</details>

---

## Before you move on

Your notes app saves plain lines of text. But what if each note also had a due date, a priority and a "done" flag? Squeezing all that into one line, and pulling it apart again, gets messy fast.

[Chapter 21](../21-json-and-csv/notes.md) shows the formats real apps use to save structured data: JSON and CSV.
