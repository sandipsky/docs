# 18 Error Handling: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.py`, `ex2.py`, and so on).
- Run each one with `python ex1.py` from a terminal opened in this folder.
- Always catch a **named** exception type, like `except ValueError:`. No bare `except:` anywhere.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Name that exception

Here are five broken lines from a cafe's ordering program:

```python
# 1
price = float("twelve")

# 2
menu = {"tea": 250, "coffee": 350}
print(menu["cake"])

# 3
orders = ["latte", "mocha"]
print(orders[2])

# 4
total = "Total: " + 42

# 5
cups_each = 12 / 0
```

First, **without running anything**, write down which exception you think each one raises: `ValueError`, `TypeError`, `ZeroDivisionError`, `KeyError` or `IndexError`.

Then test your guesses. Put each numbered piece in its own `try`, with an `except` for the type **you guessed**, and print the number, the type and the message. At the very end, print `All five caught!`

If a guess is wrong, your program will crash, and the last line of the traceback tells you the right answer. Fix the guess and run it again.

Expected output:

```
1. ValueError: could not convert string to float: 'twelve'
2. KeyError: 'cake'
3. IndexError: list index out of range
4. TypeError: can only concatenate str (not "int") to str
5. ZeroDivisionError: division by zero
All five caught!
```

<details>
<summary>Hint 1</summary>

If you put all five pieces in *one* `try`, only the first problem gets caught, because `try` stops at the first exception. That's why each piece needs its own.

</details>

<details>
<summary>Hint 2</summary>

`except ValueError as e:` gives you the exception as `e`, and `f"1. ValueError: {e}"` prints the message after your label.

</details>

---

## Exercise 2 (Easy): Bill splitter

Four friends are splitting a restaurant bill, and you're writing the little program that works out each share. It asks for the bill total and the number of people, and it must never crash, whatever anyone types.

1. Write `ask_float(prompt)`, which keeps asking until the user types a number (decimals allowed), then returns it as a `float`.
2. Write `ask_people(prompt)`, which keeps asking until the user types a whole number of **at least 1**, then returns it.
3. Print each person's share with two decimal places.

Here's a sample session, typing `forty`, `84.50`, `0`, `three` and `3`:

```
Bill total: forty
'forty' is not a number. Try again.
Bill total: 84.50
How many people? 0
There must be at least 1 person. Try again.
How many people? three
'three' is not a whole number. Try again.
How many people? 3
Each person pays $28.17
```

<details>
<summary>Hint 1</summary>

`ask_float` is the `ask_int` function from the notes, with `float()` instead of `int()` and a different message.

</details>

<details>
<summary>Hint 2</summary>

`ask_people` needs two checks: first "is it a whole number?" (that's a `try`), then "is it at least 1?" (that's an `if`, after the conversion worked). If the conversion fails, `continue` from chapter 09 jumps straight back to the top of the loop.

</details>

<details>
<summary>Hint 3</summary>

Why can't 0 people get through? Because then `bill / people` would be a `ZeroDivisionError`. Checking for it when you ask is much friendlier than crashing later.

</details>

---

## Exercise 3 (Medium): Cinema booking

You're writing the booking system for a small cinema. Start your file with your own exception type:

```python
class SoldOut(Exception):
    pass
```

Write a function `book_seats(seats_left, wanted)` that returns how many seats are left after the booking, or raises an exception if the booking breaks a rule.

The rules, checked in this order:

| Problem | Raise |
|---|---|
| `wanted` isn't a whole number | `TypeError` with `Seats must be a whole number` |
| fewer than 1 seat | `ValueError` with `You must book at least 1 seat` |
| more than 8 seats | `ValueError` with `You can book at most 8 seats at once` |
| more seats than are left | `SoldOut` with `Sorry, only 6 seats left` (use the real number) |

Then test it with this code at the bottom of your file:

```python
seats_left = 10
requests = [4, 0, "two", 12, 7, 2]
```

Loop over `requests`. Try each booking, update `seats_left` when it works, and print a message when it doesn't. Each kind of problem gets its own `except` block and its own label.

Expected output:

```
Booked 4 seats. 6 left.
Bad request: You must book at least 1 seat
Wrong type: Seats must be a whole number
Bad request: You can book at most 8 seats at once
Sold out: Sorry, only 6 seats left
Booked 2 seats. 4 left.
```

**Rule:** use guard clauses in `book_seats`: one flat `if` per rule, each with a `raise`, and the `return` at the bottom. No `elif` or `else`.

<details>
<summary>Hint 1</summary>

The second version of `withdraw` in the notes has exactly this shape. `isinstance(wanted, int)` from chapter 17 checks the type.

</details>

<details>
<summary>Hint 2</summary>

Write `seats_left = book_seats(seats_left, wanted)` inside the `try`. When `book_seats` raises, the assignment never happens, so `seats_left` stays as it was.

</details>

**Bonus:** comment out the type check and run it again. It's still a `TypeError` for `"two"`, but the message changes. Where does the new message come from, and which of the two messages would you rather show a customer?

---

## Exercise 4 (Medium): Bug hunt at the gym

This gym sign-up checker has **4 bugs**, and all of them are error-handling mistakes from the notes. Copy it into `ex4.py`, run it, and fix one problem at a time.

```python
# Gym sign-up checker
def check_age(text):
    age = int(text)
    if age < 16:
        raise f"must be 16 or older (got {age})"
    return age


new_members = [("Asha", "28"), ("Ben", "14"), ("Chen", "thirty")]

checked = 0
for name, age_text in new_members:
    try:
        age = check_age(age_text)
        message = f"welcome! (age {age})"
    except:
        pass
    print(f"{name}: {message}")
    checked = checked + 1

print(f"Sign-ups checked: {checkd}")
```

When it's fixed, you should see:

```
Asha: welcome! (age 28)
Ben: must be 16 or older (got 14)
Chen: invalid literal for int() with base 10: 'thirty'
Sign-ups checked: 3
```

**Rule:** your fixed version must only catch `ValueError`.

<details>
<summary>Hint 1</summary>

The crash at the end is the easy one: read the last line of the traceback. But look at the output *above* the crash too. Ben is 14 and Chen's age isn't even a number, so why are they both welcomed?

</details>

<details>
<summary>Hint 2</summary>

When something goes wrong for Ben, what does the `except` block do? And what's still stored in `message` from the last time round the loop?

</details>

<details>
<summary>Hint 3</summary>

Once the `except` block saves the exception's message in `message`, Ben's line says `exceptions must derive from BaseException`. That's Python complaining about the `raise` line, not about Ben. Common mistake 5 in the notes shows the fix.

</details>

<details>
<summary>Hint 4</summary>

Both problems you actually expect here (a bad age, an age that isn't a number) are `ValueError`s. So `except ValueError as e:` handles them, and anything else you didn't plan for still shows up loudly.

</details>

---

## Exercise 5 (Challenge): Grade importer

A teacher exported her class grades as lines of text, but some lines got mangled on the way. Your program imports the good lines, reports the bad ones, and never lets one bad line stop the rest.

```python
lines = [
    "Maya, 92",
    "Leo, 78",
    "Sofia, 105",
    "Omar, 85",
    "Ivy, A+",
    ", 70",
    "Zara 88",
    "Noah, 71",
]
```

Start with your own exception type, `GradeError`, using the two-line pattern from the notes. Then write three functions:

1. **`parse_line(line)`** turns `"Maya, 92"` into `{"name": "Maya", "grade": 92}`. When the line is bad, it raises a `GradeError`. Check in this order:

   | Problem | Message |
   |---|---|
   | The line doesn't split into exactly 2 parts at the comma | `Expected "name, grade" but got "Zara 88"` |
   | The name is empty | `Name is missing` |
   | The grade isn't a whole number | `Grade "A+" is not a whole number` |
   | The grade is below 0 or above 100 | `Grade 105 is out of range (0-100)` |

2. **`import_grades(lines)`** calls `parse_line` on every line. It returns a dictionary with two lists: `"students"` (the good results) and `"problems"` (a message for each bad line, like `Line 3: Grade 105 is out of range (0-100)`). Line numbers start at 1. If no line at all is valid, it raises a `GradeError` with `No valid grades found`.

3. **`print_report(result)`** prints the report you see below, with the average to one decimal place.

Then run both of these at the bottom of your file:

```python
print_report(import_grades(lines))

try:
    print_report(import_grades(["", "Bob"]))
except GradeError as e:
    print(f"Import failed: {e}")
```

Expected output:

```
Imported 4 students
Average grade: 81.5
Top student: Maya (92)
Problems:
- Line 3: Grade 105 is out of range (0-100)
- Line 5: Grade "A+" is not a whole number
- Line 6: Name is missing
- Line 7: Expected "name, grade" but got "Zara 88"
Import failed: No valid grades found
```

<details>
<summary>Hint 1</summary>

`line.split(",")` gives you a list of parts (chapter 06). Check its length *before* you use the parts, and `.strip()` each part, because of the space after the comma.

</details>

<details>
<summary>Hint 2</summary>

For the grade, `try` the `int()` conversion. In its `except ValueError:` block, `raise` your own `GradeError` with the friendlier message. Some of the messages contain double quotes, so write those strings with single quotes around the outside, like `f'Grade "{grade_text}" is not a whole number'`.

</details>

<details>
<summary>Hint 3</summary>

The `try`/`except GradeError` goes *inside* the loop in `import_grades`, around the call to `parse_line`, so each line gets its own chance. `enumerate()` from chapter 11 counts from 0, so add 1 for the line number.

</details>

<details>
<summary>Hint 4</summary>

For the report, a list comprehension (chapter 15) can pull out all the grades for the average. To find the top student, start with the first student and loop through the rest, keeping whichever one has the higher grade.

</details>

---

## Before you move on

Your programs are getting bigger, and some of your functions, like `ask_int`, are good enough to use again and again. Copying them into every new file isn't the answer.

In [chapter 19](../19-modules-and-standard-library/notes.md), you'll learn to split your code across files, and you'll explore the big toolbox of modules that comes free with Python.
