# 19 Modules and the Standard Library: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.py`, `ex2.py`, and so on). Exercises 3 and 5 also need a module file, and they tell you its name.
- Run each one with `python ex1.py` from a terminal opened in this folder.
- Never name a file after a module you import (no `random.py`, `math.py` or `statistics.py` in this folder).
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Pizza party

You're ordering pizza for 13 guests. Each pizza is 30 cm across and cut into 8 slices, and each guest will eat 3 slices.

Write a program that works out:

- the area of one pizza, using the circle formula: area = pi × radius × radius (the radius is half the width),
- how many slices you need,
- how many pizzas to order (you can't order half a pizza, so always round **up**),
- how many slices will be left over.

Expected output:

```
One pizza: 706.9 square cm
Slices needed: 39
Pizzas to order: 5
Leftover slices: 1
```

**Rules:**

- Get `pi` and `ceil` with **one** `from ... import ...` line. Don't type `3.14` yourself.
- Store the fixed values (30 cm, 8 slices) in `UPPER_CASE` names.

When it works, change your import line to `import math` and fix the rest of the program to match. The output should be exactly the same.

<details>
<summary>Hint 1</summary>

`ceil` is short for "ceiling": it always rounds up to the next whole number. `ceil(4.1)` is `5`.

</details>

<details>
<summary>Hint 2</summary>

Show the area with one decimal place using the f-string format spec from chapter 06: `{area:.1f}`.

</details>

---

## Exercise 2 (Easy): Running club report

Your running club logged these runs this month:

```python
distances = [5, 10, 7, 5, 12, 8, 5, 6]
routes = ["park", "river", "park", "hill", "river", "park", "track", "park"]
```

Use the `statistics` module and `collections.Counter` to print this report:

```
Runs this month: 8
Average distance: 7.25 km
Median distance: 6.5 km
Most common distance: 5 km
Favorite routes:
  park: 4 runs
  river: 2 runs
```

**Rules:**

- Import `statistics` with the alias `stats`.
- No counting loops and no counting dictionaries of your own. Let the modules do the work. (A short loop to **print** the top routes is fine.)

<details>
<summary>Hint 1</summary>

Look back at the `statistics` section in the notes: there's one function for each of the average, the middle value, and the most common value.

</details>

<details>
<summary>Hint 2</summary>

`.most_common(2)` on a `Counter` gives you a list of two tuples. Each tuple is `(route, count)`, so you can unpack it straight in the `for` line, like you did with `.items()` in chapter 13.

</details>

---

## Exercise 3 (Medium): Your own cafe toolbox

Time to write your first module. Make **two** files in this folder:

**`cafe_tools.py`** (the module) with two functions:

- `format_money(cents)` returns text like `"$4.50"` for `450`.
- `add_service_charge(cents, percent=10)` returns the price with a service charge added, rounded to whole cents. `add_service_charge(1000)` is `1100`, and `add_service_charge(1000, 15)` is `1150`.

Give each function a docstring. At the bottom, add a self-test that runs **only** when you run `cafe_tools.py` directly. Running `python cafe_tools.py` should print:

```
Testing cafe_tools...
$4.50
$0.05
$11.00
$11.50
```

**`ex3.py`** (the program) imports both functions and prints a bill for this order:

```python
order = {"latte": 450, "croissant": 325, "orange juice": 375}
```

Running `python ex3.py` should print this, and **not** the self-test lines:

```
latte            $4.50
croissant        $3.25
orange juice     $3.75
Subtotal        $11.50
With service    $12.65
```

Finally, open the REPL in this folder (type `python`), then run `import cafe_tools` and `help(cafe_tools)`. Do your docstrings show up?

<details>
<summary>Hint 1</summary>

The self-test prints are the "quick test" code from the notes. Which `if` line keeps them quiet when another file imports the module?

</details>

<details>
<summary>Hint 2</summary>

In `ex3.py`, the import line names the module without `.py`: `from cafe_tools import ...`.

</details>

<details>
<summary>Hint 3</summary>

For the columns, the item name is padded to 14 characters on the left (`:<14`) and the money is lined up on the right in 8 characters (`:>8`). The words "Subtotal" and "With service" can go in the same pattern as strings.

</details>

---

## Exercise 4 (Medium): Bug hunt at movie night

A friend wrote a program to plan a movie night, but it keeps crashing. Copy it into `ex4.py` and fix it one error at a time.

```python
# Movie night planner
import maths
import statistics as stats
from collections import counter
import time

votes = ["comedy", "horror", "comedy", "drama", "comedy", "horror"]
ratings = [8, 6, 9, 7, 9, 6]

top_genre = counter(votes).most_common(1)[0][0]
print(f"Tonight's genre: {top_genre}")
print(f"Average rating: {statistics.mean(ratings)}")

guests = 25
rows = maths.ceil(guests / 6)
print(f"Rows of chairs needed: {rows}")

time = 3
print(f"Starting in {time} seconds...")
for second in range(time, 0, -1):
    print(second)
    time.sleep(1)
print("Lights off!")
```

There are 4 bugs, and some show up in more than one place. When it's fixed, you should see this, with the countdown numbers one second apart:

```
Tonight's genre: comedy
Average rating: 7.5
Rows of chairs needed: 5
Starting in 3 seconds...
3
2
1
Lights off!
```

**Rule:** fix the bugs, don't rewrite the program. Keep the alias `stats`, and keep the one-second pause.

<details>
<summary>Hint 1</summary>

Run the file, read the **last line** of the error, fix that one thing, and run again. Python 3.13's messages often end with a helpful "Did you mean...?".

</details>

<details>
<summary>Hint 2</summary>

Module and class names must be spelled exactly, capital letters included. Check the notes for how `Counter` is written.

</details>

<details>
<summary>Hint 3</summary>

The last bug is mistake 5 from the notes. After the line `time = 3`, what does the name `time` hold: the module, or a number?

</details>

---

## Exercise 5 (Challenge): Table tennis tournament

Your running club is holding a small table tennis tournament, where every player plays every other player once.

**Part 1: the module.** Make a file called `tournament.py` with two functions:

- `make_fixtures(players)` returns a **list** of every pair of players, as tuples. Use `itertools`, not nested loops. A **fixture** is a match on the schedule.
- `check_results(fixtures, winners)` checks a list of winners, one per fixture, in the same order. It raises a `ValueError` (chapter 18) if the number of winners doesn't match the number of fixtures, or if a winner didn't even play in that match. The message for the second case should look like `match 6 was Chen vs Sandip, not Ben`.

Add a self-test, so that `python tournament.py` prints the fixtures for three players called `A`, `B` and `C`:

```
('A', 'B')
('A', 'C')
('B', 'C')
```

**Part 2: the program.** In `ex5.py`, start with:

```python
players = ["Ana", "Ben", "Chen", "Sandip"]
winners = ["Ana", "Chen", "Sandip", "Chen", "Sandip", "Chen"]
```

Your program should:

1. Stop with `sys.exit(1)` and a friendly message if there are fewer than 2 players.
2. Make the fixtures, and check the results with `check_results`. If it raises a `ValueError`, print the problem and stop with `sys.exit(1)`.
3. Announce each match with half a second's pause between them, using `time.sleep`.
4. Print a leaderboard, most wins first, using a `Counter`. Players who won nothing must still appear, with `0`.

Expected output:

```
Running Club Table Tennis
Match 1: Ana vs Ben -> Ana wins
Match 2: Ana vs Chen -> Chen wins
Match 3: Ana vs Sandip -> Sandip wins
Match 4: Ben vs Chen -> Chen wins
Match 5: Ben vs Sandip -> Sandip wins
Match 6: Chen vs Sandip -> Chen wins

Leaderboard
Chen      3
Sandip    2
Ana       1
Ben       0
```

Now test the safety checks:

- Change the last winner to `"Ben"`. You should see only `Problem with the results: match 6 was Chen vs Sandip, not Ben`.
- Change `players` to `["Ana"]`. You should see your "fewer than 2 players" message.

<details>
<summary>Hint 1</summary>

`itertools.combinations(players, 2)` gives the pairs, but not as a list. Wrap it in `list(...)` before returning it.

</details>

<details>
<summary>Hint 2</summary>

To walk through fixtures and winners side by side, `zip()` from chapter 12 pairs them up. `enumerate(..., start=1)` gives you the match numbers. Or keep it simple with `for i in range(len(fixtures)):` and index both lists.

</details>

<details>
<summary>Hint 3</summary>

A fixture is a tuple like `("Chen", "Sandip")`. The `in` operator works on tuples, so `winner in match` tells you whether the winner was one of the two players.

</details>

<details>
<summary>Hint 4</summary>

`Counter(winners).most_common()` (with no number) gives every winner, most wins first. A player who never won isn't in the `Counter` at all. A comprehension can find the players who are missing from it.

</details>

---

## Before you move on

Every program you've written so far forgets everything the moment it ends. Your tournament results, your cafe orders, your running log: gone. Where could a program put information so it's still there tomorrow?

That's [chapter 20](../20-files-and-folders/notes.md): reading and writing files.
