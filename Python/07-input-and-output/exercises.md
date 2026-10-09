# 07 Input and Output: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.py`, `ex2.py`, and so on).
- Run each one with `python ex1.py` from a terminal opened in this folder. Each program will stop and wait for you to type an answer and press Enter.
- In the sample sessions below, the text right after each question is what you type. Try the same answers first, so you can compare your output, then try your own.
- You don't need to handle silly answers (like `abc` for a number) yet. That comes in chapter 08.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Welcome card

A running club wants a welcome message for new members. Ask for the person's name and the city they live in, then greet them and tell them how many letters their name has.

People type carelessly, so clean up both answers: no extra spaces, and a capital letter at the start of each word.

Sample session:

```
What's your name? sandip
Where do you live?   kathmandu 

Hello, Sandip from Kathmandu!
Your name has 6 letters.
```

<details>
<summary>Hint 1</summary>

You can chain string methods straight onto `input()`, like `input("...").strip()`. Which method gives each word a capital first letter?

</details>

<details>
<summary>Hint 2</summary>

The blank line between the questions and the answer is an empty `print()`.

</details>

---

## Exercise 2 (Easy): Your age in numbers

Ask for the person's age, then show roughly how many months, days and hours they've been alive. Use 12 months a year, 365 days a year and 24 hours a day. Big numbers need commas.

Sample session:

```
How old are you? 25
That's about:
300 months
9,125 days
219,000 hours
```

Try it with `40` too. You should see `480 months`, `14,600 days` and `350,400 hours`.

<details>
<summary>Hint 1</summary>

Remember that `input()` always gives you a string. What must happen before you can multiply the age?

</details>

<details>
<summary>Hint 2</summary>

The commas come from a format spec in an f-string. Look at "Thousands separators" in [chapter 06](../06-strings/notes.md).

</details>

---

## Exercise 3 (Medium): Running club logbook

After every run, club members type their distance and time into a little program. Write it. It should ask for the distance in kilometres (it can have decimals) and the time in whole minutes. Then it prints:

- The distance in km and in miles, both with 2 decimals (1 km is 0.621371 miles).
- The **pace**: the average time for one kilometre, as minutes and seconds, like `5:30`.
- A log line for the club's spreadsheet, with the values separated by ` | `.

Sample session:

```
Distance (km): 10
Time (minutes): 55

Distance: 10.00 km = 6.21 miles
Pace: 5:30 per km
Log | run | 10.0 km | 55 min
```

A second run, for a shorter distance:

```
Distance (km): 5
Time (minutes): 27

Distance: 5.00 km = 3.11 miles
Pace: 5:24 per km
Log | run | 5.0 km | 27 min
```

**Rules:**

- Store 0.621371 in a constant (an `UPPER_CASE` name, from chapter 02).
- The last line must come from a single `print()` call that uses `sep`.

<details>
<summary>Hint 1</summary>

Work the pace out in seconds first: total seconds divided by the distance. Round it to a whole number of seconds. Then which chapter 05 tool turns seconds into minutes and seconds in one go?

</details>

<details>
<summary>Hint 2</summary>

The seconds in `5:04` need a leading zero. Look at "Padding with zeros" in [chapter 06](../06-strings/notes.md).

</details>

<details>
<summary>Hint 3</summary>

For the log line, pass several values to `print()`, separated by commas, and set `sep` to `" | "`. Some of the values can be small f-strings, like `f"{km} km"`.

</details>

---

## Exercise 4 (Medium): Bug hunt at the bookshop

A bookshop's order form keeps going wrong. Copy it into `ex4.py`:

```python
# Bookshop order form
title = input("Book title:")
price = int(input("Price: "))
copies = input("How many copies? ")

total = price * copies
print()
print("Order", "summary", sep="")
print(f"{title.title()} x {copies}")
print(f"Total: ${total:.2f}")
```

When it's fixed, this is what a run should look like:

```
Book title: the hobbit
Price: 12.50
How many copies? 3

Order summary
The Hobbit x 3
Total: $37.50
```

There are 4 bugs. Two of them crash the program. The other two only make the output look wrong, so compare your session with the one above, character by character.

**Rule:** fix the bugs, don't rewrite the program.

<details>
<summary>Hint 1</summary>

Type exactly the answers from the sample session. Read the last line of each error, fix that one thing, and run it again.

</details>

<details>
<summary>Hint 2</summary>

The first crash happens as soon as you type the price. Which converter can read `12.50`?

</details>

<details>
<summary>Hint 3</summary>

The second crash says something about multiplying a "sequence". A string is a sequence of characters. Which value is still a string when it shouldn't be?

</details>

<details>
<summary>Hint 4</summary>

For the two quiet bugs, look at the first line of the session (what's between the colon and `the hobbit`?) and the `Order summary` line. Common mistake 4 in the notes, and the `sep` section, will help.

</details>

---

## Exercise 5 (Challenge): Pizza party order form

Remember the pizza party planner from [chapter 05](../05-numbers-and-math/exercises.md)? Turn it into a proper program that anyone can use. It should ask for:

- The organiser's name (clean it up).
- How many guests are coming.
- How many slices each guest eats.
- The price of one pizza.

Every pizza has 8 slices. The program works out how many pizzas to order (enough for everyone, so round up), the total cost, and the cost per guest. Then it prints an order slip that's exactly 30 characters wide.

Sample session:

```
Your name:   sandip 
How many guests? 13
Slices per guest? 3
Price per pizza: 11.50

======== PIZZA ORDER =========
Name:                   Sandip
Guests:                     13
Pizzas:                      5
Total cost:              57.50
Per guest:                4.42
==============================
```

A second run:

```
Your name: maya
How many guests? 20
Slices per guest? 2
Price per pizza: 9.99

======== PIZZA ORDER =========
Name:                     Maya
Guests:                     20
Pizzas:                      5
Total cost:              49.95
Per guest:                2.50
==============================
```

**Rules:**

- Follow the three steps from the notes: ask (and convert straight away), compute, answer. Put a comment above each step.
- The 8 slices per pizza is a constant with an `UPPER_CASE` name.
- Every line of the slip is built with f-string format specs: labels on the left in 20 characters, values on the right in 10.

<details>
<summary>Hint 1</summary>

Which answers are whole numbers and which can have decimals? Pick `int()` or `float()` for each.

</details>

<details>
<summary>Hint 2</summary>

The number of pizzas is total slices divided by slices per pizza, rounded *up*. That's a tool from the `math` module, so you need an `import` at the top.

</details>

<details>
<summary>Hint 3</summary>

The title line is the text `" PIZZA ORDER "` (with a space at each end) centred in 30 characters, with `=` as the fill. You did something very similar for the cafe receipt in chapter 06.

</details>

<details>
<summary>Hint 4</summary>

Text and whole numbers both work with `>10`. Only the money values need `.2f` as well.

</details>

---

## Before you move on

Run your pizza program once more, and type `lots` when it asks for the number of guests. It crashes with a `ValueError`. Your program can already *find out* whether the answer is a number:

```python
print("lots".isdigit())  # prints: False
print("13".isdigit())    # prints: True
```

But it can't yet *do* anything different when the answer is `False`. Making decisions like "if it's a number, carry on, otherwise say something friendly" is exactly what [chapter 08](../08-conditionals/notes.md) is about.
