# 04 Operators: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.py`, `ex2.py`, and so on).
- Run each one with `python ex1.py` from a terminal opened in this folder.
- Let Python do every calculation. Typing an answer yourself doesn't count!
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Pizza party

You ordered 3 pizzas, each cut into 8 slices, for 7 friends. Everyone gets the same number of whole slices, and any extra slices are left over.

Expected output:

```
Total slices: 24
Slices each: 3
Leftover slices: 3
Even split: False
```

**Rule:** start from three variables (pizzas, slices per pizza, and friends). Don't type 24 or any other answer yourself.

<details>
<summary>Hint 1</summary>

"Slices each" must be a whole number. Which division operator gives you only the whole part?

</details>

<details>
<summary>Hint 2</summary>

Which operator tells you what's left over after sharing things out equally?

</details>

<details>
<summary>Hint 3</summary>

"Even split" is `True` only when nothing is left over. Which operator asks "are these two values equal?"

</details>

---

## Exercise 2 (Easy): Cafe loyalty card

A cafe's loyalty card gives you 1 point for every dollar you spend. You start with 0 points and 0 visits. Here's your week:

- Visit 1: you spend 15 dollars.
- Visit 2: you spend 40 dollars.
- It's your birthday, so the cafe doubles your points.
- Visit 3: you swap 60 points for a free lunch (and spend nothing).

Expected output:

```
After visit 1: 15 points
After visit 2: 55 points
Birthday bonus: 110 points
After visit 3: 50 points
Total visits: 3
```

**Rule:** update your variables only with the shortcuts `+=`, `-=` and `*=`. No `points = points + ...` this time.

<details>
<summary>Hint 1</summary>

You need two variables: one for the points and one for the visits.

</details>

<details>
<summary>Hint 2</summary>

Doubling means multiplying by 2. Which shortcut multiplies a variable by something? And remember, Python has no `++`, so how do you add 1 to the visits?

</details>

---

## Exercise 3 (Medium): Movie marathon

You're planning a movie marathon: three films that are 148, 136 and 169 minutes long, with two 20-minute breaks in between. It starts at 10:00 in the morning.

Expected output:

```
Films: 453 minutes
Breaks: 40 minutes
Total: 493 minutes
That's 8 hours and 13 minutes
The marathon ends at 18:13
```

**Rules:**

- Don't type any of the answers.
- The break length never changes while the program runs, so name it like a constant.
- Use `//` and `%` to turn minutes into hours and minutes.

<details>
<summary>Hint 1</summary>

Take it one step at a time, with a variable for each step: the films, the breaks, then the total.

</details>

<details>
<summary>Hint 2</summary>

Turning 493 minutes into hours and minutes is the same trick as the film example in the notes.

</details>

<details>
<summary>Hint 3</summary>

For the end time, count in minutes since midnight. 10:00 is `10 * 60` minutes after midnight. Add the total, then turn the result back into hours and minutes.

</details>

<details>
<summary>Hint 4</summary>

Commas in `print()` add a space, so they'd give you `18 : 13`. To print `18:13` with no spaces, join the pieces with `+`. What do you need to do to a number before you can join it to text? (Remember chapter 03.)

</details>

---

## Exercise 4 (Medium): Bug hunt at the gym

A gym's check-in program was written by someone who usually writes JavaScript, and it shows. Copy it into `ex4.py` and fix it one error at a time.

```python
# Gym check-in
age = 17
visits = 0
is_member = true

visits++
visits += 1

can_join = age >= 16 && is_member
print("Visits:", visits)
print("Can join:", can_join)
print("Adult:", age = 18)
print("Discount:", age =< 18 or visits > 10)
```

The adult check should ask "is the person 18 or older?". There are **5 bugs**. When they're fixed, you should see:

```
Visits: 2
Can join: True
Adult: False
Discount: True
```

<details>
<summary>Hint 1</summary>

As in earlier bug hunts, Python reports all the SyntaxErrors first, before it runs anything. The other errors only appear once the file is running.

</details>

<details>
<summary>Hint 2</summary>

Three of the bugs are symbols that work in other languages but not in Python. The "Common mistakes" section of the notes lists them.

</details>

<details>
<summary>Hint 3</summary>

One error looks very odd: `TypeError: print() got an unexpected keyword argument 'age'`. Python thinks you're giving `print()` a special setting called `age` (you'll learn about those settings in chapter 10). The real problem is the `=` on that line. Is it putting a value in a box, or asking a question? And which comparison means "18 or older"?

</details>

<details>
<summary>Hint 4</summary>

One bug was already covered in chapter 03. Python's "Did you mean" will point you to it.

</details>

---

## Exercise 5 (Challenge): Bookshop checkout

You're building the checkout for an online bookshop. Start your file with these lines:

```python
# Quantities from the web page arrive as text
novels_text = "2"
cookbooks_text = "1"
is_member = False
```

Here's what else you know:

- A novel costs 14 dollars, and a cookbook costs 23. Prices never change while the program runs.
- One delivery box holds between 1 and 4 books.
- Delivery is free for members, or for orders of 50 dollars or more.
- Customers earn 1 loyalty point per dollar, and today is double-points day.

Expected output:

```
======================
Novels: 2 x 14 = 28
Cookbooks: 1 x 23 = 23
Subtotal: 51
Books in the order: 3
Average price per book: 17.0
Fits in one box: True
Free delivery: True
Even number of books: False
Points earned: 102
======================
```

**Rules:**

- Don't change the starting lines, and don't type any of the results yourself.
- Draw the two lines of `=` with string repetition, not by typing 22 equals signs.
- Check "Fits in one box" with a chained comparison.
- For the points, start a variable at 0, add the subtotal with `+=`, then double it with another shortcut.

<details>
<summary>Hint 1</summary>

Convert the quantities into numbers first (chapter 03), each into its own variable. Everything else builds on them.

</details>

<details>
<summary>Hint 2</summary>

Why is the average `17.0` and not `17`? Think about which division operator you used, and what type it always gives.

</details>

<details>
<summary>Hint 3</summary>

"Between 1 and 4 books" can be written just like in math class. Look at the chained comparisons section in the notes.

</details>

<details>
<summary>Hint 4</summary>

Free delivery needs just one of two things to be true. Which logical operator means "at least one of these"?

</details>

<details>
<summary>Hint 5</summary>

"Even number of books" is the even/odd check from the notes: `%`, then `== 0`.

</details>

---

## Before you move on

Guess what this prints, then run it:

```python
print(0.1 + 0.2)
```

Surprised? You're in good company. [Chapter 05](../05-numbers-and-math/notes.md) explains what's going on, and why it matters when your program handles money.
