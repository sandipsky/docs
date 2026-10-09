# 02 Variables: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.py`, `ex2.py`, and so on).
- Run each one with `python ex1.py` from a terminal opened in this folder.
- Use `snake_case` names for ordinary variables, and `UPPER_CASE` for values that should never change.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Your profile card

You're making a profile card for a running club's website. Create one variable for each detail: your first name, your city, your age, and your favorite food. Then print each one with a label.

Expected output (with your own details):

```
Name: Sandip
City: <your city>
Age: 25
Favorite food: momo
```

**Rule:** the details themselves (your name, city and so on) should only appear once each, when you create the variables. Inside `print()`, use the variable names.

<details>
<summary>Hint</summary>

Remember the comma trick from chapter 01: you can put a label and a value in the same `print()`, separated by a comma. A variable name works as the value.

</details>

---

## Exercise 2 (Easy): Basketball scoreboard

You're keeping score for your team at a basketball game. The score starts at 0. Then your team scores a 2-point shot, a 3-point shot, and a free throw (worth 1 point).

Use **one** variable for the score. After each basket, update it and print it.

Expected output:

```
Start: 0
After a 2-pointer: 2
After a 3-pointer: 5
After a free throw: 6
```

**Rule:** don't type the running totals (2, 5 and 6) yourself. Let Python work them out from the old score.

<details>
<summary>Hint</summary>

Look at "Updating from the old value" in the notes. The new score is the old score plus the points for that basket.

</details>

---

## Exercise 3 (Medium): Bug hunt at the library

A library wrote a small program to work out late fees, but it won't run. Copy it into `ex3.py` and fix it one error at a time.

```python
# Library late fees
fee_per_day = 2
1st_book_days = 3
second-book-days = 5

total_days = 1st_book_days + second-book-days
total_fee = total_days * fee_per_day
print("Days late:", total_days)
print("Total fee:", totalfee)

print("Fee after member discount:", discounted_fee)
discounted_fee = total_fee - 4
```

There are 4 bugs, and some of them show up in more than one place. When it's fixed, you should see:

```
Days late: 8
Total fee: 16
Fee after member discount: 12
```

**Rule:** fix the bugs, don't rewrite the program. Any new names you pick should follow the naming rules and use snake_case.

<details>
<summary>Hint 1</summary>

Same method as the bug hunt in chapter 01: run the file, read the last line of the error and its line number, fix that one thing, and run it again.

</details>

<details>
<summary>Hint 2</summary>

Two of the names break the naming rules (check the table in the notes). When you rename a variable, rename it everywhere it's used, not only where it's created.

</details>

<details>
<summary>Hint 3</summary>

One error message is misleading: "Maybe you meant '==' instead of '='?". Python reads the dashes in `second-book-days` as minus signs, so it thinks you're trying to put a value into a calculation. Changing `=` to `==` is *not* the fix. What does that tell you about dashes in names?

</details>

<details>
<summary>Hint 4</summary>

The last bug only shows up after the others are fixed, and it's not a spelling mistake. Remember: Python runs your code from top to bottom.

</details>

---

## Exercise 4 (Medium): Cinema seat shuffle

Three friends are at the cinema, sitting in seats 1, 2 and 3. Start your file with these lines:

```python
seat_1 = "Ana"
seat_2 = "Ben"
seat_3 = "Cleo"
```

First, Ana and Cleo swap seats. Then the usher asks everyone to move one seat to the right, and whoever is in seat 3 walks round to seat 1. Print the row at each step.

Expected output:

```
Before: Ana Ben Cleo
After the swap: Cleo Ben Ana
After moving along: Ana Cleo Ben
```

**Rules:**

- After the first three lines, don't type `"Ana"`, `"Ben"` or `"Cleo"` again. Move the values between the variables instead.
- Do each move (the swap, and the moving along) in **one line** of code. No "tray" variable.

<details>
<summary>Hint 1</summary>

The swap is just like the drinks example in the notes, using "several at once". Which two seats are swapping?

</details>

<details>
<summary>Hint 2</summary>

For the moving along, work out where each person ends up. The new seat 1 gets whoever was in seat 3. The new seat 2 gets whoever was in seat 1. What does the new seat 3 get? Then write all three on one line, with three names on the left and three on the right.

</details>

<details>
<summary>Hint 3</summary>

Remember that Python works out the whole right side first, using the *old* values, before it fills any box on the left. That's why one line is enough.

</details>

---

## Exercise 5 (Challenge): Your life in numbers, upgraded

Time to fix the program from [chapter 01's last exercise](../01-getting-started/exercises.md) for good. Write a new version of "Your life in numbers" that uses variables.

Your program must follow these rules:

- Your age appears **only once** in the whole file.
- Every fixed number gets a name too, written as a constant: days in a year (365), hours in a day (24), minutes in an hour (60), and heartbeats per minute (70).
- Each fact is its own variable, built from the one before it. For example, hours alive comes from days alive.
- Add one new fact: breaths taken (we breathe about 16 times a minute).
- Keep a comment above each calculation explaining what it works out, like in chapter 01.

Expected output for someone who is 25:

```
My life in numbers
Days alive: 9125
Hours alive: 219000
Minutes alive: 13140000
Heartbeats: 919800000
Breaths: 210240000
```

Now test it: change the age to 30 and run it again. The second line should say `Days alive: 10950`, and every other number should change too, without you touching those lines. Finally, put in your own age.

<details>
<summary>Hint 1</summary>

Start with the fixed values at the top of the file, each with a clear UPPER_CASE name, such as `DAYS_PER_YEAR`.

</details>

<details>
<summary>Hint 2</summary>

Work down the list in order. Days alive uses your age. Hours alive uses days alive. Which variable should minutes alive use?

</details>

<details>
<summary>Hint 3</summary>

Heartbeats and breaths both come from the same fact. Which one?

</details>

**Bonus:** bring back the "years asleep" line from chapter 01 (we sleep about 8 hours a day), with a named constant for the hours of sleep. For age 25 you should see a long decimal of about 8.33. You'll learn to tidy up long decimals like that in [chapter 05](../05-numbers-and-math/notes.md).

---

## Before you move on

Your boxes held two kinds of things: numbers like `25` and text like `"Lisbon"`. Does that difference matter? Guess what each line prints, then run them:

```python
print(25 + 1)
print("25" + 1)
```

If the second line surprised you, [chapter 03](../03-data-types/notes.md) explains why. 🙂
