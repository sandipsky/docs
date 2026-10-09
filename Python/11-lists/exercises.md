# 11 Lists: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.py`, `ex2.py`, and so on).
- Run each one with `python ex1.py` from a terminal opened in this folder.
- Let Python do the work: if a list method or a loop can find an answer, don't type the answer yourself.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): The shopping list

Start your file with this line:

```python
shopping_list = ["milk", "eggs", "bread"]
```

Then change the list, one step at a time:

1. You remember you need apples. Add `"apples"` to the **end**.
2. Butter is the most important thing today. Add `"butter"` to the **front**.
3. You find eggs in the fridge after all. Remove `"eggs"`.

Finally, print the whole list, how many items are on it, a numbered list, and the last item.

Expected output:

```
Shopping list: ['butter', 'milk', 'bread', 'apples']
Items to buy: 4
1. butter
2. milk
3. bread
4. apples
Last item: apples
```

**Rule:** after the first line, don't type the list out again. Use list methods to change it, and a loop for the numbered lines.

<details>
<summary>Hint 1</summary>

Look at the table in "Adding items" in the notes. One method adds to the end, and another puts an item at any index you choose. Which index is the front?

</details>

<details>
<summary>Hint 2</summary>

For the numbered lines, `enumerate()` with `start=1` gives you the number and the item together.

</details>

<details>
<summary>Hint 3</summary>

The last item is at a negative index. Which one?

</details>

---

## Exercise 2 (Easy): Quiz results

Your class just took a quiz. Start with these scores:

```python
scores = [72, 95, 88, 60, 79]
```

Print a short report about them.

Expected output:

```
Scores: 5
Highest: 95
Lowest: 60
Average: 78.8
Best to worst: [95, 88, 79, 72, 60]
Original order: [72, 95, 88, 60, 79]
Anyone got 100? False
Top three: [95, 88, 79]
```

**Rule:** don't type any of the answers. Every number and list in the report must come from Python. And the "Original order" line must print `scores` itself, which proves you didn't change it.

<details>
<summary>Hint 1</summary>

`len`, `max`, `min` and `sum` do most of the work. The average is the total divided by how many there are. Show it with one decimal place using the f-string format spec `:.1f` from chapter 06.

</details>

<details>
<summary>Hint 2</summary>

To get "best to worst" without changing `scores`, do you need `sort()` or `sorted()`? Which keyword argument flips the order?

</details>

<details>
<summary>Hint 3</summary>

The top three are the first three items of the "best to worst" list. A slice can grab them.

</details>

---

## Exercise 3 (Medium): Bug hunt at the fun run

A running club wrote a program to check runners in, sort them by name, and send the first one off. It won't run. Copy it into `ex3.py` and fix it one error at a time.

```python
# Race check-in
runners = ["Maya", "Ben", "Chloe"]
runners.append("Dev", "Ana")
runners = runners.sort()
first = runners.pop[0]
print(f"First to start: {first}")
print("Still waiting:")
for i in range(1, len(runners) + 1):
    print(f"{i}. {runners[i]}")
```

There are 4 bugs. When it's fixed, you should see:

```
First to start: Ana
Still waiting:
1. Ben
2. Chloe
3. Dev
4. Maya
```

**Rule:** fix the bugs, don't rewrite the program. Keep the `for i in range(...)` loop (don't switch to `enumerate`), so you get practice with indexes.

<details>
<summary>Hint 1</summary>

Run the file, read the **last line** of the error and its line number, fix that one thing, and run it again. Repeat until it works.

</details>

<details>
<summary>Hint 2</summary>

The first error says `append()` takes exactly one argument. Which method adds several items from another list?

</details>

<details>
<summary>Hint 3</summary>

What does `sort()` give back? Look at common mistake 2 in the notes.

</details>

<details>
<summary>Hint 4</summary>

`pop` is a method, so how do you call a method? Square brackets are for indexes.

</details>

<details>
<summary>Hint 5</summary>

The last bug is an off-by-one error. The indexes need to start at 0, but the printed numbers start at 1. Change the `range`, then add 1 only where you print the number.

</details>

---

## Exercise 4 (Medium): A week of weather

You've kept a weather log for a week. Start with these two lists. They match up by index: `days[0]` goes with `temperatures[0]`, and so on.

```python
days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
temperatures = [18, 24, 21, 27, 19, 22, 25]
```

Print each day with its temperature, then a short summary:

- the hottest day, with its name and temperature,
- how many days were **above** 20 degrees,
- the "warm days": the days that were 22 degrees **or more**, joined into one line with commas,
- the average temperature, with one decimal place.

Expected output:

```
Mon: 18 degrees
Tue: 24 degrees
Wed: 21 degrees
Thu: 27 degrees
Fri: 19 degrees
Sat: 22 degrees
Sun: 25 degrees
Hottest day: Thu (27 degrees)
Days above 20 degrees: 5
Warm days: Tue, Thu, Sat, Sun
Average: 22.3 degrees
```

Now test it: change Monday's temperature to `30` and run it again. The hottest day should change to `Mon (30 degrees)`, without you touching any other line.

<details>
<summary>Hint 1</summary>

The two lists share their indexes, so loop over the indexes with `for i in range(len(days)):`. Then `days[i]` and `temperatures[i]` belong together.

</details>

<details>
<summary>Hint 2</summary>

For the hottest day, you need its **position**, not just the number, so you can look up the day's name. There are two ways: use `max()` and then `index()` to find where it is, or use the "finding the biggest" pattern from the notes and remember the index instead of the value.

</details>

<details>
<summary>Hint 3</summary>

For the warm days, start with an empty list and `append` each matching day's name. Then `", ".join(...)` turns the list into one line.

</details>

---

## Exercise 5 (Challenge): Word tools

Write three small functions that work on a list of words. Each one takes a list and **returns** something. None of them prints anything.

1. `longest_word(words)` returns the longest word. If two words tie, return the first one.
2. `words_longer_than(words, length)` returns a **new** list of the words with more than `length` letters, in their original order.
3. `reverse_words(words)` returns a **new** list with the words in reverse order, and leaves the original list alone.

Then test them with this code at the bottom of your file:

```python
sentence = "the quick brown fox jumps over the lazy dog"
words = sentence.split()
print(f"Words: {len(words)}")
print(f"Longest word: {longest_word(words)}")
print(f"Alphabetical: {' '.join(sorted(words))}")
print(f"Long words: {', '.join(words_longer_than(words, 4))}")
print(f"Backwards: {' '.join(reverse_words(words))}")
print(f"Times 'the' appears: {words.count('the')}")
```

Expected output:

```
Words: 9
Longest word: quick
Alphabetical: brown dog fox jumps lazy over quick the the
Long words: quick, brown, jumps
Backwards: dog lazy the over jumps fox brown quick the
Times 'the' appears: 2
```

**Rules:**

- Don't use `max()`, `reverse()` or `[::-1]` inside your functions. Build each answer with a loop. (You'll know the shortcuts exist, and that's the point: you'll see what they do for you.)
- Give each function a docstring, like in chapter 10.
- Try your functions with your own sentence too. Does `longest_word` still work when the longest word is the very last one?

<details>
<summary>Hint 1</summary>

`longest_word` is the "finding the biggest" pattern from the notes, but you compare `len(word)` instead of the word itself. Use `>` (not `>=`) so that a tie keeps the first word.

</details>

<details>
<summary>Hint 2</summary>

`words_longer_than` is the "building a new list" pattern: an empty list, a loop, an `if`, and `append`.

</details>

<details>
<summary>Hint 3</summary>

For `reverse_words`, think about `insert`. If you keep inserting each word at index 0, where does the first word end up?

</details>

<details>
<summary>Hint 4</summary>

Inside the f-strings in the test code, the separators use single quotes, like `' '.join(...)`. That's because the f-string itself uses double quotes. You saw this trick in chapter 06.

</details>

---

## Before you move on

Lists can change, and that's usually what you want. But what about things that should *never* change, like the days of the week or a point on a map? And what's the quickest way to remove all the duplicates from a list? Try this, and look closely at the order:

```python
votes = ["pizza", "sushi", "pizza", "tacos", "sushi", "pizza"]
print(set(votes))
```

[Chapter 12](../12-tuples-and-sets/notes.md) explains what just happened.
