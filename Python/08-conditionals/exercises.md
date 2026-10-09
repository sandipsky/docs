# 08 Conditionals: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.py`, `ex2.py`, and so on).
- Run each one with `python ex1.py` from a terminal opened in this folder.
- Indent every block with 4 spaces (press Tab in VS Code). If Python complains about indentation, check the line it names and the line above it.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Grade calculator

A teacher wants a quick way to turn test scores into letter grades. Start with:

```python
score = 83
```

The grades are:

| Score | Grade |
|---|---|
| 90 to 100 | A |
| 80 to 89 | B |
| 70 to 79 | C |
| 60 to 69 | D |
| 0 to 59 | F |

Expected output:

```
Score 83: grade B
```

Change `score` to `59` and you should see `Score 59: grade F`. Change it to `90` and you should see `Score 90: grade A`.

Scores below 0 or above 100 are typing mistakes. For `101` (or `-5`), print this instead:

```
101 is not a valid score.
```

**Rule:** use one `if`, then `elif`s, then one `else`. Only the `score = ...` line should change between tests.

<details>
<summary>Hint 1</summary>

Check for the invalid scores first. Then, because the first true condition wins, you can go from the top grade down: `score >= 90`, then `score >= 80`, and so on. You don't need to write "80 or more *and* under 90".

</details>

<details>
<summary>Hint 2</summary>

An invalid score is one that's below 0 **or** above 100. Which logical operator joins those two checks?

</details>

---

## Exercise 2 (Easy): What should I wear?

Make a little weather helper. It asks two questions and gives one piece of advice.

It should ask:

```
Temperature in C: 
Is it raining? (yes/no) 
```

Then it picks the **first** rule that fits, from this list:

| Situation | Advice |
|---|---|
| Raining **and** below 10 degrees | `Take an umbrella and a warm coat.` |
| Raining | `Take an umbrella.` |
| Below 10 degrees | `Wear a warm coat.` |
| Above 28 degrees | `Sunglasses and water!` |
| Anything else | `Nice day. Enjoy your walk.` |

Here are five runs, one after another:

```
Temperature in C: 5
Is it raining? (yes/no) yes
Take an umbrella and a warm coat.
```

```
Temperature in C: 15
Is it raining? (yes/no) Yes
Take an umbrella.
```

```
Temperature in C: 3
Is it raining? (yes/no) no
Wear a warm coat.
```

```
Temperature in C: 31
Is it raining? (yes/no) NO
Sunglasses and water!
```

```
Temperature in C: 22
Is it raining? (yes/no) no
Nice day. Enjoy your walk.
```

**Rules:**

- `yes`, `Yes` and `YES` must all count as yes.
- You can assume the person types a whole number for the temperature.

<details>
<summary>Hint 1</summary>

Turn the answer into a `True`/`False` value once, near the top, and give it a good name: `is_raining = ...`. Then every condition below can use it. Which string method makes `"YES"` and `"yes"` the same?

</details>

<details>
<summary>Hint 2</summary>

The table is already in the right order for an `if`/`elif`/`else` chain. If the first rule were lower down, would it ever be reached?

</details>

---

## Exercise 3 (Medium): Bug hunt at the library

The library's late-fee program won't run. Copy it into `ex3.py` and fix it one error at a time.

```python
# Library late fees
# Days 1 to 7 cost $0.50 each. Every day after that costs $1.00.
# Members pay half.
days_late = 12
is_member = True

if days_late = 0
print("Returned on time. No fee!")
fee = 0
elif days_late <= 7:
    fee = days_late * 0.50
    else:
    fee = 7 * 0.50 + (days_late - 7) * 1.00

if is_member:
    fee = fee / 2

print(f"Days late: {days_late}")
print(f"Fee: ${fee:.2f}")
```

There are 4 bugs. When it's fixed, you should see:

```
Days late: 12
Fee: $4.25
```

Then test the other paths. With `days_late = 0`, you should see:

```
Returned on time. No fee!
Days late: 0
Fee: $0.00
```

And with `days_late = 5` and `is_member = False`:

```
Days late: 5
Fee: $2.50
```

**Rule:** fix the bugs, don't rewrite the program.

<details>
<summary>Hint 1</summary>

Python reports one problem at a time, and it won't run any of the file until they're all gone. Run it, read the last line of the error, fix that one thing, and run it again.

</details>

<details>
<summary>Hint 2</summary>

Two of the bugs are on the `if` line itself. One is about comparing, and one is about the character that says "a block is coming".

</details>

<details>
<summary>Hint 3</summary>

Look at the "When indentation goes wrong" section of the notes. Which lines belong to the `if days_late ...` block? And should `else` line up with the code *inside* the `elif` block, or with the `elif` itself?

</details>

---

## Exercise 4 (Medium): The cafe order machine

A cafe wants a self-service screen. The menu is:

| Drink | Price |
|---|---|
| latte | $3.50 |
| cappuccino | $3.75 |
| tea | $2.00 |
| hot chocolate | $3.25 |

The program asks which drink, then how many, then prints the total. Here are some runs:

```
What would you like? Latte
How many? 2
2 cups of latte: $7.00
```

```
What would you like? tea
How many? 1
1 cup of tea: $2.00
```

```
What would you like?   HOT CHOCOLATE 
How many?  3
3 cups of hot chocolate: $9.75
```

```
What would you like? cola
Sorry, we don't make cola.
```

```
What would you like? cappuccino
How many? three
'three' is not a valid number of cups.
```

```
What would you like?
You didn't type anything.
```

**Rules:**

- The program must never crash, whatever the customer types.
- If the drink isn't on the menu (or nothing was typed), don't ask "How many?" at all.
- `0` cups is not a valid number of cups.
- Say `1 cup`, but `2 cups`.

<details>
<summary>Hint 1</summary>

Clean up the drink answer first, so `"  HOT CHOCOLATE "` becomes `"hot chocolate"`. Two string methods from chapters 06 and 07 do it in one line.

</details>

<details>
<summary>Hint 2</summary>

Set the price with an `if`/`elif` chain (or `match`/`case`). In the final `else`, you know the drink isn't on the menu. One way to remember that is to set the price to `0`, then check for it afterwards.

</details>

<details>
<summary>Hint 3</summary>

For the number of cups, look at the one-line check with `and` in the notes. Because of short-circuiting, `int()` only runs once `.isdigit()` has said yes. And for "cup" or "cups", a conditional expression fits nicely.

</details>

---

## Exercise 5 (Challenge): Cash machine

Build the screen of a cash machine. Start with these two values, which should never change while the program runs (remember `UPPER_CASE` from [chapter 02](../02-variables/notes.md)):

```python
BALANCE = 250
DAILY_LIMIT = 500
```

The machine shows the balance, asks how much to take out, and then checks the request in **this order**:

1. Not a whole number: `Please type a whole number of dollars.`
2. Zero: `Please enter an amount above zero.`
3. Not a multiple of 20 (the machine only has $20 notes): `This machine only has $20 notes. Try a multiple of 20.`
4. More than the daily limit: `The daily limit is $500.`
5. More than the balance: `Insufficient funds. You have $250.`
6. Otherwise, hand over the money, say how many notes, and show the new balance.

Here are some runs:

```
Balance: $250
Amount to withdraw: 60
Here is $60 (3 x $20 notes).
New balance: $190
```

```
Balance: $250
Amount to withdraw: 20
Here is $20 (1 x $20 note).
New balance: $230
```

```
Balance: $250
Amount to withdraw: 50
This machine only has $20 notes. Try a multiple of 20.
```

```
Balance: $250
Amount to withdraw: 300
Insufficient funds. You have $250.
```

```
Balance: $250
Amount to withdraw: 600
The daily limit is $500.
```

```
Balance: $250
Amount to withdraw: abc
Please type a whole number of dollars.
```

```
Balance: $250
Amount to withdraw: 0
Please enter an amount above zero.
```

**Rules:**

- The program must never crash.
- The numbers 250 and 500 appear only once each, in `BALANCE` and `DAILY_LIMIT`. Change `BALANCE` to `1000`, try `600`, and you should get the daily limit message.
- Say `1 x $20 note`, but `3 x $20 notes`.

<details>
<summary>Hint 1</summary>

This is the "fuller version" of the ticket check in the notes, with more steps. Handle each problem with its own `elif`, in the order given, and put the happy case in the final `else`.

</details>

<details>
<summary>Hint 2</summary>

"Is it a multiple of 20?" means "does dividing by 20 leave no remainder?" Which operator from [chapter 04](../04-operators/notes.md) gives you the remainder? And which one tells you how many whole 20s fit in the amount?

</details>

<details>
<summary>Hint 3</summary>

Once the first check has made sure the text is all digits, every `elif` below it can safely use `int(answer)`.

</details>

---

## Before you move on

Your programs can now spot bad input. But they only give people **one** chance: type `abc` into the cash machine and it says "Please type a whole number", then just... ends. A real cash machine would ask again, and keep asking until it gets a good answer.

Doing something again and again, until you're happy, is what [chapter 09](../09-loops/notes.md) is all about.
