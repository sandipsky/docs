# 16 Scope and Mutability: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.py`, `ex2.py`, and so on).
- Run each one with `python ex1.py` from a terminal opened in this folder.
- Some exercises ask you to **predict** the output before you run anything. Write your guesses down (on paper or as comments). Being wrong is the useful part: it shows you which rule to re-read.
- Don't use the `global` keyword in any exercise.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Scope detective

**Part 1.** A weather app has this code. Without running it, write down what you think each line prints:

```python
city = "Kathmandu"
temperature = 20

def weather_report():
    temperature = 25
    print(f"Inside: {city}, {temperature} degrees")

def make_label():
    label = f"{city} weather"
    return label

weather_report()
print(f"Outside: {city}, {temperature} degrees")
print(make_label())
```

Now run it and check your guesses. Then add `print(label)` as the very last line and run it again. What happens, and why?

**Part 2.** The app also counts rainy days, but this part crashes:

```python
rainy_days = 0

def add_rainy_day():
    rainy_days = rainy_days + 1

add_rainy_day()
add_rainy_day()
add_rainy_day()
print(f"Rainy days this week: {rainy_days}")
```

First, explain in one sentence (as a comment) why it crashes. Then fix it so it prints:

```
Rainy days this week: 3
```

**Rule:** no `global`. The function should take the current count as a parameter and return the new one.

<details>
<summary>Hint 1</summary>

For Part 1: `weather_report` *assigns* to `temperature`, but only *reads* `city`. Re-read "Assigning inside a function makes a local variable" in the notes.

</details>

<details>
<summary>Hint 2</summary>

For Part 2: look at the "pass values in and return them out" version of `record_visit` in the notes. Each call should look like `rainy_days = add_rainy_day(rainy_days)`.

</details>

---

## Exercise 2 (Easy): Same list, or a copy?

Sandip and Maya are sharing reading lists at the library. Copy this into `ex2.py`, but **don't run it yet**:

```python
reading_list = ["Dune", "Matilda"]
sandip_list = reading_list
maya_list = ["Dune", "Matilda"]
backup = reading_list.copy()

reading_list.append("Holes")

print(sandip_list)
print(maya_list)
print(backup)
print(reading_list == maya_list)
print(reading_list is sandip_list)
print(backup == maya_list)
print(backup is maya_list)
```

1. Draw the lists on paper, like the arrow pictures in the notes. How many separate lists are there? Which names point at which list?
2. Write down what you think each of the seven lines prints.
3. Run it and check.

Here's the output, so you can check your guesses once you've made them:

<details>
<summary>Show the output</summary>

```
['Dune', 'Matilda', 'Holes']
['Dune', 'Matilda']
['Dune', 'Matilda']
False
True
True
False
```

</details>

Finally, add one line at the bottom that uses `id()` to prove that `reading_list` and `sandip_list` are the same list. It should print `True`.

<details>
<summary>Hint</summary>

Count the new lists. Every `[...]` you type makes a new list, and so does `.copy()`. A plain `name = other_name` never makes a new list: it only adds another name to an existing one.

</details>

---

## Exercise 3 (Medium): Bug hunt in the family to-do lists

This program is meant to keep a separate to-do list for Sandip and for Maya. Copy it into `ex3.py` and run it.

```python
# Family to-do lists
tasks_added = 0

def add_task(task, tasks=[]):
    tasks_added = tasks_added + 1
    tasks.append(task)
    return tasks

def alphabetical(tasks):
    tasks.sort()
    return tasks

sandip = add_task("pay rent")
sandip = add_task("buy milk", sandip)
maya = add_task("walk dog")
maya = maya.append("call gran")

print(f"Sandip: {sandip}")
print(f"Sandip A-Z: {alphabetical(sandip)}")
print(f"Sandip, in the order added: {sandip}")
print(f"Maya: {maya}")
print(f"Tasks added: {tasks_added}")
```

There are 4 bugs, and every one of them is a mistake from this chapter's notes. When they're all fixed, you should see:

```
Sandip: ['pay rent', 'buy milk']
Sandip A-Z: ['buy milk', 'pay rent']
Sandip, in the order added: ['pay rent', 'buy milk']
Maya: ['walk dog', 'call gran']
Tasks added: 4
```

**Rule:** no `global`. You may change the last line, as long as it still prints the right number.

<details>
<summary>Hint 1</summary>

The first crash is an `UnboundLocalError`. Do you actually need a counter at all? Both lists already know how many tasks they hold.

</details>

<details>
<summary>Hint 2</summary>

Once that's fixed, Maya's list prints as `None`. Which list methods give back `None`? (Common mistake 3 in the notes.)

</details>

<details>
<summary>Hint 3</summary>

Next, Sandip's list has Maya's tasks in it and Maya's has Sandip's. Two calls used the default value for `tasks`. How many times is that default list made?

</details>

<details>
<summary>Hint 4</summary>

The last bug: "Sandip, in the order added" comes out in A-Z order. Asking for the alphabetical version shouldn't change the original. Which sorting tool gives you a new list?

</details>

---

## Exercise 4 (Medium): Cinema seating plan

A small cinema stores its seating plan as a list of rows. Each row is a list of seats, and each seat is `"free"` or `"taken"`:

```python
seats = [
    ["free", "free", "free"],
    ["free", "taken", "free"],
]
```

The manager wants to try out bookings on a copy of the plan, without touching the real one.

1. Write `book_seat(plan, row, seat)`. It returns a **new** plan with that seat marked `"taken"`, and leaves the plan it was given exactly as it was. (`row` and `seat` are list positions, starting at 0.)
2. Write `print_plan(plan)`, which prints each row with `X` for a taken seat and `.` for a free one, numbering the rows from 1.
3. Test it with this code:

```python
tonight = book_seat(seats, 0, 1)
tonight = book_seat(tonight, 1, 2)

print("Original plan:")
print_plan(seats)
print("Tonight:")
print_plan(tonight)
print(f"Same plan? {seats is tonight}")
```

Expected output:

```
Original plan:
Row 1: . . .
Row 2: . X .
Tonight:
Row 1: . X .
Row 2: . X X
Same plan? False
```

<details>
<summary>Hint 1</summary>

The plan is a list of lists, so it's nested data. Which kind of copy do you need? Re-read "Shallow copies and nested data" in the notes, and remember to `import copy` at the top of your file.

</details>

<details>
<summary>Hint 2</summary>

For `print_plan`, a list comprehension from chapter 15 can turn a row like `["free", "taken", "free"]` into `[".", "X", "."]`, and `" ".join(...)` puts spaces between them. `enumerate()` from chapter 11 gives you each row's position, so add 1 for a human-friendly row number.

</details>

**Bonus:** change `book_seat` to use `plan.copy()` instead, and run it again. The "Same plan?" line still says `False`, but look at the original plan. Explain what happened, using the word "shallow".

---

## Exercise 5 (Challenge): The bank, with no globals

You're writing the core of a tiny bank for two customers. Start with this:

```python
accounts = {
    "sandip": {"balance": 500, "history": []},
    "maya": {"balance": 300, "history": []},
}
```

Write these functions:

1. `balances(accounts)` returns a **new** dictionary of each name and their balance, like `{'sandip': 500, 'maya': 300}`. Use a dictionary comprehension.
2. `deposit(account, amount)` adds money to one account and adds a note like `"+200"` to its history. Changing the account is this function's job, so it mutates the account it's given and returns nothing.
3. `withdraw(account, amount)` takes money out and adds a note like `"-450"` to its history. If there isn't enough money, it changes nothing at all. It returns `True` if the withdrawal happened and `False` if it was refused.
4. `transfer(accounts, from_name, to_name, amount)` moves money from one customer to another, using your `withdraw` and `deposit`. It returns `True` or `False` too.
5. `with_interest(accounts, rate)` returns a **new** dictionary of what each balance would be with interest added, rounded to 2 decimal places. It must not change any real balance.

Then, before doing anything else, save a `snapshot` of `accounts` that will never change, no matter what happens later. Run these three transactions, and print the results:

- Maya withdraws 800.
- Sandip transfers 200 to Maya.
- Maya withdraws 450.

Expected output:

```
Before: {'sandip': 500, 'maya': 300}
Withdraw 800 from maya: refused
Transfer 200 from sandip to maya: done
Withdraw 450 from maya: done
After: {'sandip': 300, 'maya': 50}
Sandip's history: ['-200']
Maya's history: ['+200', '-450']
With 1% interest: {'sandip': 303.0, 'maya': 50.5}
Balances after the interest check: {'sandip': 300, 'maya': 50}
Snapshot: {'sandip': 500, 'maya': 300}
Snapshot history for maya: []
```

**Rule:** no `global`, and no function may print anything. All the printing happens in the main part of your file.

<details>
<summary>Hint 1</summary>

Each customer's account is a dictionary inside a dictionary, and each history is a list inside that. So the snapshot needs a deep copy. Take it before the first transaction.

</details>

<details>
<summary>Hint 2</summary>

In `withdraw`, check for "not enough money" first, and `return False` straight away if so. That way, the lines that change the balance and the history only run when the withdrawal is allowed.

</details>

<details>
<summary>Hint 3</summary>

`transfer` only deposits if the withdrawal worked. Since `withdraw` returns `True` or `False`, you can put the call straight into an `if`.

</details>

<details>
<summary>Hint 4</summary>

To turn `True`/`False` into `"done"`/`"refused"`, the conditional expression from chapter 08 fits nicely: `"done" if ok else "refused"`.

</details>

**Bonus:** replace the deep copy with `accounts.copy()` and run it again. Which lines of the output change? Draw a picture of the dictionaries to explain why.

---

## Before you move on

You've seen functions call other functions. But can a function call **itself**? Guess what this prints:

```python
def countdown(n):
    if n == 0:
        print("Liftoff!")
        return
    print(n)
    countdown(n - 1)

countdown(3)
```

Run it to check, then find out how it works in [chapter 17](../17-recursion/notes.md).
