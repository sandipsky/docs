# 03 Data Types: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.py`, `ex2.py`, and so on).
- Run each one with `python ex1.py` from a terminal opened in this folder.
- When a result looks strange, check its type with `type()`. It's often the answer.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): The library record

A library keeps a record for every book. Create one variable for each detail of this book, and pick the right type each time:

- Title: The Hobbit
- Author: J.R.R. Tolkien
- Pages: 310
- Price: 12.5
- Available to borrow: yes
- Due date: nothing, because nobody has borrowed it

Then print each value next to its type.

Expected output:

```
Title: The Hobbit -> <class 'str'>
Author: J.R.R. Tolkien -> <class 'str'>
Pages: 310 -> <class 'int'>
Price: 12.5 -> <class 'float'>
Available: True -> <class 'bool'>
Due date: None -> <class 'NoneType'>
```

**Rule:** let `type()` work out the types. Don't type `str`, `int` and so on yourself.

<details>
<summary>Hint 1</summary>

"Yes" is a job for a boolean. For "nothing", reread the section on `None`.

</details>

<details>
<summary>Hint 2</summary>

One `print()` can hold a label, a variable, the text `"->"` and the variable's type, all separated by commas.

</details>

---

## Exercise 2 (Easy): Conference name badge

You're printing name badges for a baking conference. Start your file with these lines:

```python
first_name = "Maya"
last_name = "Patel"
job_title = "Head Baker"
company = "Blue Owl Bakery"
```

Build and print the three lines of the badge.

Expected output:

```
Maya Patel
Head Baker at Blue Owl Bakery
Hi, I'm Maya!
```

**Rule:** no commas inside `print()` this time. Build each line with `+`. And don't type `Maya`, `Patel` or the other details again: use the variables.

<details>
<summary>Hint 1</summary>

`+` never adds spaces for you. Look at the expected output and find every space. Each one has to come from a string you write.

</details>

<details>
<summary>Hint 2</summary>

The last line contains an apostrophe in `I'm`. Remember the `Let's` bug in chapter 01's bug hunt: which kind of quotes can safely go around it?

</details>

---

## Exercise 3 (Medium): The broken basket

Your online shop reads its prices from a web page, so they arrive as text. A customer is buying a shirt and a cap. Copy this into `ex3.py` and run it:

```python
# Prices arrive from the web page as text
shirt_price = "20"
cap_price = "12"
shipping = 5

total = shirt_price + cap_price + shipping
print("Total:", total)
print("Type:", type(total))
```

It crashes with a `TypeError`. Fix the program, then add a friendly last line, so it prints:

```
Total: 37
Type: <class 'int'>
Your order comes to 37 dollars.
```

**Rules:**

- Don't change the three lines that create `shirt_price`, `cap_price` and `shipping`. The prices really do arrive as text.
- Build the last line with `+`, not commas.

<details>
<summary>Hint 1</summary>

Check each of the three values with `type()`. Which ones are strings, and which is a number? Read the error's last line again with that in mind.

</details>

<details>
<summary>Hint 2</summary>

Turn the text into numbers before adding them. Which function turns `"20"` into `20`?

</details>

<details>
<summary>Hint 3</summary>

Here's an experiment: what would `shirt_price + cap_price` give on its own, without the shipping? It doesn't crash, but is it the answer you want?

</details>

<details>
<summary>Hint 4</summary>

For the last line, `total` is now a number. What do you need to do to a number before you can join it to text with `+`?

</details>

---

## Exercise 4 (Medium): Bug hunt at the cafe till

A cafe's till program takes an order. Everything typed in at the till arrives as text. The program has **4 bugs**, and each one gives a different kind of error. Copy it into `ex4.py` and fix it one error at a time.

```python
# Cafe order: everything typed in at the till arrives as text
customer = "Maya"
cakes_text = "2"
price_text = "3.5"
is_takeaway = false
table_number = none

cakes = int(cakes_text)
price = int(price_text)
cakes_total = cakes * price
print("Customer: " + customer)
print("Cakes: " + cakes)
print("Total: " + str(cakes_total))
print("Takeaway:", is_takeaway)
print("Table:", table_number)
```

When it's fixed, you should see:

```
Customer: Maya
Cakes: 2
Total: 7.0
Takeaway: False
Table: None
```

**Rules:**

- Keep `cakes_text` and `price_text` as text: that's how the till sends them.
- Don't change any of the `print()` lines except the one that crashes.

<details>
<summary>Hint 1</summary>

Read only the last line of each error first. The word before the colon (`NameError`, `ValueError`, `TypeError`) tells you what kind of problem it is. The notes have a section on each one.

</details>

<details>
<summary>Hint 2</summary>

Python offers a "Did you mean" guess for two of the bugs. Trust it.

</details>

<details>
<summary>Hint 3</summary>

`"3.5"` has a decimal point. Which conversion function can read that?

</details>

<details>
<summary>Hint 4</summary>

Notice that `Customer: Maya` gets printed just before the last error. That tells you the lines above it are fine now. Look at the line right after it: what type is `cakes`, and what type does `+` need?

</details>

<details>
<summary>Hint 5</summary>

Why does the total come out as `7.0` and not `7`? Think about what happens when you multiply an `int` by a `float`. That one isn't a bug!

</details>

---

## Exercise 5 (Challenge): Cinema booking summary

A cinema's booking form sends everything as text, even the number of tickets. Start your file with these lines:

```python
# From the booking form (a form always sends text)
movie_title = "Dune: Part Two"
adult_tickets_text = "2"
child_tickets_text = "1"
```

Here's what else you know:

- An adult ticket costs 12.5 dollars, and a child ticket costs 8. These prices never change while the program runs.
- The customer asked for seats together (yes).
- The customer didn't enter a promo code (nothing).

Print this booking summary:

```
=== Booking summary ===
Movie: Dune: Part Two
Tickets: 3 (2 adult, 1 child)
Total: 33.0 dollars
Seats together: True
Promo code: None
Check: <class 'str'> -> <class 'int'>
```

The last line checks your work: it shows the type of `adult_tickets_text`, then the type of your converted adult tickets.

**Rules:**

- Don't change the starting lines. After them, don't type the numbers 2, 1, 3 or 33.0 yourself: work them out from the variables.
- The ticket prices are values that never change, so name them the way chapter 02 taught for constants.
- Build the `Tickets:` line and the `Total:` line with `+`, and store each one in a variable before printing it.

<details>
<summary>Hint 1</summary>

Convert the two ticket counts into numbers first, each in its own variable. Everything else builds on those two.

</details>

<details>
<summary>Hint 2</summary>

Getting a `TypeError` about `str` and `int`? You're joining a number onto text with `+`. Which function turns a number into text?

</details>

<details>
<summary>Hint 3</summary>

The `Tickets:` line has many pieces: text, a number, text, another number, and so on. Build it one piece at a time, and run your file after each piece to check the spaces and brackets.

</details>

<details>
<summary>Hint 4</summary>

Why `33.0` and not `33`? One of the prices is a `float`. Look back at what happens when you mix `int` and `float`.

</details>

---

## Before you move on

In this chapter, you typed `True` and `False` yourself. In real programs, most booleans come from asking questions. Guess what these two lines print, then run them:

```python
print(10 > 5)
print(3 > 7)
```

[Chapter 04](../04-operators/notes.md) teaches you how to ask questions like these, and a lot more.
