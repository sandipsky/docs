# 05 Numbers and Math: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.py`, `ex2.py`, and so on).
- Run each one with `python ex1.py` from a terminal opened in this folder.
- Print with the comma style you already know, like `print("Total:", total)`. Use `round()` to tidy decimals.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Pizza party planner

You're ordering pizza for a party. There are 13 guests, each guest eats 3 slices, and every pizza is cut into 8 slices. How many pizzas should you order, and how many slices will be left over?

Make a variable for each of those three facts. Then work out the rest.

Expected output:

```
Guests: 13
Slices needed: 39
Pizzas to order: 5
Leftover slices: 1
```

**Rule:** don't type `39`, `5` or `1` yourself. Let Python work them out. Then change the number of guests to 16 and run it again. You should see `Pizzas to order: 6` and `Leftover slices: 0`.

<details>
<summary>Hint 1</summary>

You can't order 4.875 pizzas, and ordering 4 would leave people hungry. Which `math` tool always rounds *up*? Don't forget the `import` line.

</details>

<details>
<summary>Hint 2</summary>

Leftover slices = all the slices you bought, minus the slices people eat. How many slices did you buy?

</details>

---

## Exercise 2 (Easy): Game night randomizer

It's board game night with Sandip, Maya, Leo and Aisha. Write a program that sets up a game:

- Rolls one dice (1 to 6).
- Flips a coin (`"heads"` or `"tails"`).
- Picks who goes first, from the four names.
- Picks a lucky number from 1 to 100.

Your output will look something like this, but the values will differ every time you run it:

```
Dice roll: 4
Coin flip: tails
Goes first: Maya
Lucky number: 73
```

Run your program at least five times. Check that the dice never shows 0 or 7, and that every name gets picked sometimes.

<details>
<summary>Hint 1</summary>

Two of these are whole numbers in a range, and two are "pick one of these". Which `random` tool fits each kind?

</details>

<details>
<summary>Hint 2</summary>

`random.choice()` needs the choices inside square brackets, like the rock, paper, scissors example in the notes.

</details>

**Bonus:** roll two dice and save each one in its own variable. Print both dice, their total, and the higher of the two, like `Dice: 3 and 5 Total: 8 Highest: 5`.

---

## Exercise 3 (Medium): A week of weather

You're keeping a weather log for your neighbourhood. These are the afternoon temperatures (in °C) from Monday to Friday:

| Monday | Tuesday | Wednesday | Thursday | Friday |
|---|---|---|---|---|
| 14.5 | 18.2 | 11.8 | 16.0 | 19.4 |

Store each day in its own variable, then print the coldest and warmest temperatures, the **range** (the gap between the warmest and the coldest day), and the average.

Expected output:

```
Coldest: 11.8
Warmest: 19.4
Range: 7.6
Average: 16.0
```

**Rule:** the five temperatures appear only once in your file, when you create the variables.

<details>
<summary>Hint 1</summary>

Two built-in helpers find the coldest and warmest for you. You can pass them all five variables at once.

</details>

<details>
<summary>Hint 2</summary>

If your range comes out as `7.599999999999998`, you've met the binary storage problem from the notes. What can you do just before printing?

</details>

<details>
<summary>Hint 3</summary>

The average is the total divided by the number of days. `sum()` wants its numbers inside square brackets, and variables work in there too.

</details>

---

## Exercise 4 (Medium): Bug hunt at the cinema snack bar

A cinema wrote a small program for its snack bar, but it's broken. Copy it into `ex4.py` and fix it one bug at a time.

```python
# Cinema snack bar
popcorn = 4.40
drink = 2.20
candy = 1.10

total = sum(popcorn, drink, candy)
print("Total:", total)
print("Exactly 7.70?", total == 7.7)

# Popcorn for school groups comes in boxes of 6 bags
group_size = 25
boxes = math.Ceil(group_size / 6)
print("Boxes for the group:", boxes)

# Change from a 10 dollar note, worked out in cents
paid_cents = 1000
change_cents = paid_cents - 770
dollars, cents = divmod(change_cents, 100)
print("Change:", dollars, "dollars and", cents, "cents")
```

There are 4 bugs. Three of them crash the program. The fourth one doesn't crash anything: the program runs, but it prints something wrong. When it's all fixed, you should see:

```
Total: 7.7
Exactly 7.70? True
Boxes for the group: 5
Change: 2 dollars and 30 cents
```

**Rule:** fix the bugs, don't rewrite the program. Keep using `sum()` for the total.

<details>
<summary>Hint 1</summary>

Run the file, read the *last* line of the error and its line number, fix that one thing, and run it again. Repeat.

</details>

<details>
<summary>Hint 2</summary>

Two of the crashes are about `math`: one is about where Python can find it, and one is about spelling. Check common mistakes 2 and 3 in the notes.

</details>

<details>
<summary>Hint 3</summary>

The quiet bug shows up once the crashes are gone: look closely at the total and at `False`. Where in the program could you tidy the total, so that both the printed total and the comparison come out right?

</details>

---

## Exercise 5 (Challenge): Marathon results

Sandip just ran his first marathon (42.195 km)! The timing chip on his shoe sent back his finish time as **text**, in seconds:

```python
finish_text = "13924"
```

Start your file with that line. Then write a program that prints his results:

```
Finish time: 3 h 52 min 4 s
Pace: 5 min 30 s per km
Under 4 hours: True
Difference from 4 hours: 476 s
```

Your program must follow these rules:

- Turn the text into a number first (you learned how in [chapter 03](../03-data-types/notes.md)).
- Give every fixed number a name: the marathon distance, and four hours in seconds (work that one out with `*`, don't type `14400`).
- **Pace** means "how long one kilometre took on average". Work it out in seconds, round it to a whole number of seconds, then split it into minutes and seconds.
- "Under 4 hours" must be a `True`/`False` comparison, not typed by you.
- The difference is always shown as a positive number of seconds.

Now test it with a slower runner. Change the first line to `finish_text = "15000"` and run it again. You should see:

```
Finish time: 4 h 10 min 0 s
Pace: 5 min 55 s per km
Under 4 hours: False
Difference from 4 hours: 600 s
```

<details>
<summary>Hint 1</summary>

There are 3600 seconds in an hour. `divmod(finish_seconds, 3600)` gives you the hours *and* the seconds left over. What can you do with those leftover seconds to get minutes and seconds?

</details>

<details>
<summary>Hint 2</summary>

Unpack each `divmod()` straight into two variables, like `hours, minutes = divmod(135, 60)` in the notes. You'll need two `divmod()` calls for the finish time, and one more for the pace.

</details>

<details>
<summary>Hint 3</summary>

For the pace, divide the total seconds by the distance. That gives a decimal like `329.99...`. Round it to a whole number before you split it with `divmod()`.

</details>

<details>
<summary>Hint 4</summary>

For the last line, a slower runner gives a negative difference. Which built-in helper drops the minus sign?

</details>

---

## Before you move on

You can now do almost any everyday math. But numbers still look a bit rough: `4.5` instead of `4.50`. And what about text? Guess what each line prints, then run it:

```python
print("Sandip"[0])
print("Sandip"[-1])
print(len("Sandip"))
```

[Chapter 06](../06-strings/notes.md) explains all three lines, and finally gives you prices with exactly two decimals.
