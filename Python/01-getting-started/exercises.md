# 01 Getting Started: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.py`, `ex2.py`, and so on).
- Run each one with `python ex1.py` from a terminal opened in this folder (right-click the folder in VS Code's Explorer and choose **Open in Integrated Terminal**).
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Calculator, two ways

**Part A: in the REPL.** Open a terminal, type `python` to start the REPL, and get Python to work out these four sums. Type each one after the `>>>` and press `Enter`:

- 125 + 378
- 1000 - 247
- 12 × 12
- 144 ÷ 12

Leave the REPL with `exit()` when you're done.

**Part B: in a file.** Now put the same four sums in `ex1.py`, each with a label, and run it.

Expected output:

```
125 + 378 = 503
1000 - 247 = 753
12 * 12 = 144
144 / 12 = 12.0
```

**Rule:** don't type the answers (503, 753 and so on) yourself. Let Python work them out.

<details>
<summary>Hint 1</summary>

In Python, `*` means multiply and `/` means divide.

</details>

<details>
<summary>Hint 2</summary>

In Part B, if you just write `125 + 378` on a line, nothing appears. Only the REPL shows answers by itself. In a file, you need `print()`.

You can put a label and a calculation in the same `print()`, separated by a comma. The label is text, so it goes in quotes. The calculation doesn't.

</details>

---

## Exercise 2 (Easy): Say hello

Print three lines about yourself: your name, where you live, and one thing you'd like to build with Python.

Expected output (with your own details):

```
Hi, I'm Sandip
I live in <your city>
I want to build a budget tracker
```

Then add a comment at the top of the file saying what the program does.

<details>
<summary>Hint</summary>

Use one `print()` per line. Remember that text needs quotes.

The first line has an apostrophe in `I'm`. An apostrophe is the same symbol as a single quote, so which kind of quotes is safe to put around that text?

</details>

---

## Exercise 3 (Medium): Cafe receipt

You're writing the receipt printer for a small cafe. A customer ordered:

- 2 coffees at $4 each
- 1 sandwich at $7
- 3 cookies at $2 each

Print this receipt:

```
===== Corner Cafe =====
Coffee x2: 8
Sandwich x1: 7
Cookie x3: 6
-----------------------
Total: 21
Thank you, come again!
```

**Rule:** don't type the numbers 8, 7, 6 or 21 yourself. Work them out from the prices and quantities.

<details>
<summary>Hint 1</summary>

The lines of `=` and `-` are just text. Print them like any other text.

</details>

<details>
<summary>Hint 2</summary>

For the total, you can write the whole calculation on one line. Python does `*` before `+`, just like the math you learned in school.

</details>

---

## Exercise 4 (Medium): Bug hunt

This code has **4 bugs**. Copy it into `ex4.py`, run it, and fix one error at a time until it works.

```python
# Morning greeting program
print("Good morning!')
Print("Time for coffee")
print(Let's learn Python)
print("Have a great day!"
```

When it's fixed, you should see:

```
Good morning!
Time for coffee
Let's learn Python
Have a great day!
```

**Rule:** fix one bug, run the file again, and read the new error. Don't try to fix everything at once.

<details>
<summary>Hint 1</summary>

Read the last line of each error message first. Then look just above it for the line number and the `^` marks.

</details>

<details>
<summary>Hint 2</summary>

The errors don't show up in line order. Python first checks the whole file for grammar mistakes (SyntaxErrors), and only then starts running it. So you'll fix three SyntaxErrors before the program prints anything. The last bug only appears once the file is running, which is why `Good morning!` gets printed just before it.

</details>

<details>
<summary>Hint 3</summary>

Look closely at the text `Let's`. It contains an apostrophe, which is the same symbol as a single quote. Which kind of quotes should wrap it?

</details>

---

## Exercise 5 (Challenge): Your life in numbers

Write a program that prints fun facts about your life, all worked out by Python. Use your own age.

- Days alive (roughly: age × 365)
- Hours alive
- Minutes alive
- Heartbeats (a heart beats about 70 times a minute)

Put a comment above each line explaining what it calculates.

Example output for someone who is 25:

```
My life in numbers
Days alive: 9125
Hours alive: 219000
Minutes alive: 13140000
Heartbeats: 919800000
```

<details>
<summary>Hint 1</summary>

Each fact builds on the one before it. Hours alive is just days alive × 24.

</details>

<details>
<summary>Hint 2</summary>

It's fine to write a long calculation on one line, like `25 * 365 * 24`. Use the comma trick from the notes to print the label and the calculation together.

</details>

**Bonus:** we sleep about 8 hours a day. Add a line showing how many *years* you've spent asleep. For age 25, the answer is about 8.33, but Python will print a long decimal like `8.333333333333332`. (The last few digits can change depending on the order of your math. That's normal, and [chapter 05](../05-numbers-and-math/notes.md) explains why.)

---

## Before you move on

In Exercise 5, did you have to type your age again and again? If your age changed, you'd have to fix it in every line, and if you missed one, the program would quietly give a wrong answer. Annoying, right?

[Chapter 02: Variables](../02-variables/notes.md) fixes exactly that. 🙂
