# 05 Numbers and Math

## What is it?

Python has two main kinds of number, and you met both in [chapter 03](../03-data-types/notes.md): `int` for whole numbers like `47`, and `float` for decimals like `4.99`.

This chapter is about *working* with numbers: rounding them, handling money safely, using Python's built-in math helpers, and making random numbers for games. Some of these tools are always there. Others live in **modules**, extra toolboxes that come with Python and that you switch on with one line.

## Why does it matter?

Real programs need more than `+ - * /` from [chapter 04](../04-operators/notes.md):

- A shop must show prices like `3.3`, not `3.3000000000000003`.
- A party planner must round *up*: 47 guests at tables of 6 need 8 tables, not 7.83.
- A board game needs a random dice roll.
- A running app must turn 135 minutes into "2 h 15 min".

And there's a surprise waiting that trips up almost everyone:

```python
print(0.1 + 0.2)  # prints: 0.30000000000000004
```

This chapter explains why that happens, and how to handle it, especially when money is involved.

## Real-world example

Numbers in everyday life come with everyday questions. Each question needs a different tool:

| Everyday question | What you need | Python | Answer |
|---|---|---|---|
| 47 guests, tables seat 6. How many tables? | Round up | `math.ceil(47 / 6)` | `8` |
| 40 eggs, boxes hold 12. How many full boxes? | Round down | `math.floor(40 / 12)` | `3` |
| A 4.7-star rating. How many stars to show? | Round to the nearest | `round(4.7)` | `5` |
| Three test scores. Which is the best? | The biggest | `max(72, 95, 88)` | `95` |
| 135 minutes. How many hours and minutes? | Divide and keep the rest | `divmod(135, 60)` | `(2, 15)` |
| Roll a dice | A random whole number | `random.randint(1, 6)` | 1 to 6 |

By the end of this chapter, you'll know every tool in that table, and a few more.

## How it works

### A quick refresher: `int` and `float`

```python
print(type(47))    # prints: <class 'int'>
print(type(4.99))  # prints: <class 'float'>
print(5.0 + 2)     # prints: 7.0
print(10 / 2)      # prints: 5.0
```

Two rules from earlier chapters matter a lot here:

- Mixing an `int` and a `float` gives a `float` (chapter 03).
- `/` always gives a `float`, even when the answer is whole (chapter 04). Use `//` when you want a whole number.

("Float" is short for "floating-point number", the computer's way of storing decimals. You'll see why that matters in a moment.)

### Whole numbers have no size limit

In many languages, whole numbers have a maximum size. Go past it and the answer goes wrong. Python doesn't have that problem. An `int` grows as big as it needs to:

```python
print(2 ** 10)   # prints: 1024
print(2 ** 100)  # prints: 1267650600228229401496703205376
print(2 ** 100 + 1)  # prints: 1267650600228229401496703205377
```

That last line is exactly right, all 31 digits. Python just keeps adding digits, like a calculator with an endless screen. (The only real limit is your computer's memory, and you'll never get near it with normal numbers.)

> **If you did the [JavaScript course](../../JavaScript/README.md):** JavaScript numbers lose accuracy past about 9 quadrillion, so it needs a separate `BigInt` type for huge values. Python has no such limit and no `BigInt`. A plain `int` does it all.

### Underscores make big numbers readable

Is `1000000000` a hundred million or a billion? Hard to tell at a glance. In real life we'd write `1,000,000,000`. Python can't use commas inside a number (commas separate things, like the values in `print()`), but it lets you use underscores:

```python
population = 8_100_000_000
print(population)  # prints: 8100000000

prize = 1_000_000
print(prize * 3)  # prints: 3000000
```

Python ignores the underscores completely. They're only there for you, the human reading the code. `1_000_000` and `1000000` are exactly the same number.

Put one underscore between digits, never two in a row:

```python
y = 1__000
# SyntaxError: invalid decimal literal
```

A **literal** is a value typed straight into the code, like `1000` or `"hello"`. So the error means "I can't read this as a number".

### The `0.1 + 0.2` surprise

```python
print(0.1 + 0.2)         # prints: 0.30000000000000004
print(0.1 + 0.2 == 0.3)  # prints: False
```

Why? Computers store numbers in **binary**: using only 0s and 1s. Whole numbers fit perfectly, but many decimals don't. Think of trying to write 1/3 as a decimal: 0.33333... goes on forever, so at some point you have to stop and round. In binary, 0.1 is like that. The computer stores a number that's a tiny bit off, and when you add two slightly-off numbers, the tiny error can show up in the answer.

This isn't a Python bug. JavaScript, Java, C# and almost every other language give the same answer, because they all store decimals the same standard way.

Most of the time, an error that small doesn't matter. It matters in two places:

1. When you show numbers to people, especially prices.
2. When you compare decimals with `==`.

Here are the two everyday fixes.

### Fix 1: round the result for display

`round(number, digits)` rounds a number to that many decimal places:

```python
total = 0.1 + 0.2
print("Total:", total)            # prints: Total: 0.30000000000000004
print("Total:", round(total, 2))  # prints: Total: 0.3
```

The stored value hasn't changed. You've just asked for a tidy copy to show. Do all your math first, then round at the very end, right before you print.

Rounding also fixes comparisons. Round both sides to the same number of decimals, then compare:

```python
total = 0.1 + 0.2
print(round(total, 2) == 0.3)  # prints: True
```

> **Watch out:** `round()` gives you back a *number*, and Python never prints extra zeros at the end of a number. So a price of 4.50 shows as `4.5`:

```python
price = 4.50
print("Price:", round(price, 2))  # prints: Price: 4.5
```

For now, live with `4.5`. In [chapter 06](../06-strings/notes.md) you'll learn f-strings, which can show exactly two decimals (`4.50`) every time.

### Fix 2: work in whole cents for money

Whole numbers are stored exactly. So the safest way to handle money is to do all the math in **cents** (whole numbers), and turn the result into dollars only at the very end, for display.

A pen costs $1.10 and a notebook costs $2.20:

```python
print(1.10 + 2.20)  # prints: 3.3000000000000003

pen_cents = 110
notebook_cents = 220
total_cents = pen_cents + notebook_cents
print(total_cents)        # prints: 330
print(total_cents / 100)  # prints: 3.3
```

The cents version is exact: 330 cents is $3.30, every time. Many real payment systems work exactly like this: they store amounts in the smallest unit of the currency, such as cents or paisa.

You'll use this idea again in the shopping cart project in [chapter 14](../14-project-shopping-cart/notes.md).

### `round()` in detail

With no second number, `round()` rounds to the nearest whole number and gives you an `int`:

```python
print(round(4.7))  # prints: 5
print(round(4.2))  # prints: 4
print(type(round(4.7)))  # prints: <class 'int'>
```

With a second number, it keeps that many decimals and gives you a `float`:

```python
print(round(3.14159, 2))  # prints: 3.14
print(round(3.14159, 1))  # prints: 3.1
print(type(round(3.14159, 2)))  # prints: <class 'float'>
```

Now a surprise. What do you think `round(2.5)` gives?

```python
print(round(0.5))  # prints: 0
print(round(1.5))  # prints: 2
print(round(2.5))  # prints: 2
print(round(3.5))  # prints: 4
```

At school you probably learned "halves round up", so `2.5` would become `3`. Python does something different. When a number is *exactly* halfway, it rounds to the nearest **even** number. So `2.5` goes down to `2`, and `3.5` goes up to `4`.

Why? Imagine a bank rounding millions of amounts. If every half always went up, the total would slowly creep upwards. Rounding halves to the even neighbour sends half of them up and half of them down, so the errors cancel out. This is sometimes called **banker's rounding**.

It only affects numbers that are exactly halfway. `round(2.51)` is still `3`, and `round(2.49)` is still `2`.

> **Tip:** you may also see this one day: `round(2.675, 2)` gives `2.67`, not `2.68`. That's the binary storage problem again. `2.675` is really stored as something like `2.67499999...`, so it rounds down. For money, this is one more reason to work in whole cents.

### Dividing by zero

You can't split a bill between 0 people. Python agrees, and stops your program with an error:

```python
print(10 / 0)
# ZeroDivisionError: division by zero
```

`//` and `%` give the same kind of error. If you ever see `ZeroDivisionError`, look for a value that became 0 by accident, like a number of guests or a count of items. (You'll learn to check for this before dividing in [chapter 08](../08-conditionals/notes.md).)

> **If you did the JavaScript course:** JavaScript gives `Infinity` when you divide by zero and keeps going. Python stops straight away and tells you, which makes the bug much easier to find.

### Handy built-in helpers: `abs`, `min`, `max`, `sum`

These four are **built-in functions**: tools that are always available, like `print()` and `type()`. You don't need to switch anything on to use them.

**`abs()`** gives the **absolute value**: how far a number is from zero, without the minus sign. It's handy for "how big is the difference?", whichever way round you subtract:

```python
print(abs(-7))  # prints: 7
print(abs(7))   # prints: 7

morning_temp = 12
afternoon_temp = 19
print("Temperature change:", abs(morning_temp - afternoon_temp))  # prints: Temperature change: 7
```

**`max()`** and **`min()`** find the biggest and smallest of several numbers:

```python
print(max(72, 95, 88))  # prints: 95
print(min(72, 95, 88))  # prints: 72
print(max(3, 7.5))      # prints: 7.5
```

**`sum()`** adds numbers up, but it works a little differently. It wants the numbers *inside square brackets*:

```python
print(sum([72, 95, 88]))  # prints: 255
```

The square brackets make a **list**: several values kept together in order. You'll learn all about lists in [chapter 11](../11-lists/notes.md). For now, just copy the pattern: square brackets inside the round ones.

With `sum()`, working out an average is easy. Add everything up and divide by how many there are:

```python
average = sum([72, 95, 88, 64]) / 4
print("Average score:", average)  # prints: Average score: 79.75
print("Rounded:", round(average, 1))  # prints: Rounded: 79.8
```

### `divmod()`: divide and keep the rest

With `//` (floor division) and `%` (remainder) from [chapter 04](../04-operators/notes.md), you can turn minutes into hours and minutes:

```python
total_minutes = 135
print(total_minutes // 60)  # prints: 2
print(total_minutes % 60)   # prints: 15
```

That's so common that Python has one tool that does both at once. `divmod(a, b)` gives you the whole-number answer *and* the remainder together:

```python
print(divmod(135, 60))  # prints: (2, 15)
```

The `(2, 15)` in round brackets is a **tuple**: a small, fixed group of values. You'll meet tuples properly in [chapter 12](../12-tuples-and-sets/notes.md). The useful trick right now is that you can catch both values at once, with the "assign several at once" trick from [chapter 02](../02-variables/notes.md):

```python
hours, minutes = divmod(135, 60)
print(hours, "h", minutes, "min")  # prints: 2 h 15 min
```

It works for money too. 330 cents is how many dollars and how many cents?

```python
dollars, cents = divmod(330, 100)
print("Dollars:", dollars, "Cents:", cents)  # prints: Dollars: 3 Cents: 30
```

### The `math` module

Python comes with a big collection of extra tools, called the **standard library**. It's grouped into **modules**: each module is a toolbox for one kind of job. One of them, `math`, holds the math tools.

A module isn't switched on by default. You load it with `import`, usually at the very top of your file:

```python
import math

print(math.sqrt(16))  # prints: 4.0
```

Notice the dot in `math.sqrt`. It means "the `sqrt` tool from the `math` toolbox". You'll write `math.` in front of every tool from this module. (You'll learn more ways to import, and how to write your own modules, in [chapter 19](../19-modules-and-standard-library/notes.md).)

Here are the four `math` tools you'll use most.

**`math.floor()` and `math.ceil()`: always round down, or always round up.** "Floor" is the ground you stand on, and "ceil" is short for ceiling, the top of the room.

```python
import math

print(math.floor(4.7))  # prints: 4
print(math.ceil(4.2))   # prints: 5
print(math.ceil(4.0))   # prints: 4
```

`math.ceil(4.0)` stays `4`, because it's already whole. There's nothing to round up.

Picking the right one depends on the question you're asking. Rounding up makes sure everyone gets a seat:

```python
import math

guests = 47
seats_per_table = 6
print("Tables needed:", math.ceil(guests / seats_per_table))  # prints: Tables needed: 8
```

Rounding down counts only the complete groups:

```python
import math

eggs = 40
eggs_per_box = 12
print("Full boxes:", math.floor(eggs / eggs_per_box))  # prints: Full boxes: 3
```

(For positive numbers, `eggs // eggs_per_box` gives the same `3`. Use whichever reads more clearly to you.)

You now have four ways to turn a decimal into a whole number. They agree on some numbers and disagree on others:

| Tool | What it does | `4.7` | `4.2` | `-4.7` |
|---|---|---|---|---|
| `round()` | Nearest whole number | `5` | `4` | `-5` |
| `math.floor()` | Always down (towards minus) | `4` | `4` | `-5` |
| `math.ceil()` | Always up (towards plus) | `5` | `5` | `-4` |
| `int()` | Chops off the decimals (chapter 03) | `4` | `4` | `-4` |

The last column is where they differ most. "Down" for `-4.7` means *more* negative, so `math.floor(-4.7)` is `-5`. But `int()` just chops off the `.7`, leaving `-4`. Think of a thermometer: below zero, going "down" means getting colder.

**`math.sqrt()`: the square root.** The square root is the number that, multiplied by itself, makes the one you started with. `math.sqrt(16)` is `4.0`, because 4 × 4 = 16. It always gives a `float`.

Here's a ladder leaning against a wall. The top is 4 metres up, and the bottom is 3 metres from the wall. How long is the ladder? (That's Pythagoras from school.)

```python
import math

wall_height = 4
distance_from_wall = 3
ladder_length = math.sqrt(wall_height ** 2 + distance_from_wall ** 2)
print("Ladder length:", ladder_length)  # prints: Ladder length: 5.0
```

**`math.pi`: the number π.** It's a value, not a tool, so it has no brackets. Here's the area of a pizza with a 15 cm radius:

```python
import math

radius = 15
area = math.pi * radius ** 2
print(math.pi)  # prints: 3.141592653589793
print("Pizza area:", round(area), "square cm")  # prints: Pizza area: 707 square cm
```

### Random numbers with the `random` module

Games, quizzes and raffles need numbers you can't predict. The `random` module makes them. Like `math`, you `import` it first.

**`random.randint(a, b)`** gives a random whole number from `a` to `b`, *including both ends*. A dice roll is one line:

```python
import random

roll = random.randint(1, 6)
print("You rolled:", roll)  # prints something like: You rolled: 4
```

Your number will be different, and it changes every time you run the file. Run it a few times and watch.

Rolling two dice is just two calls added together:

```python
import random

total = random.randint(1, 6) + random.randint(1, 6)
print("Two dice:", total)  # prints something like: Two dice: 9
```

**`random.choice()`** picks one item at random. Give it a list (the square brackets again), and it picks one of the things inside:

```python
import random

move = random.choice(["rock", "paper", "scissors"])
print("Computer plays:", move)  # prints something like: Computer plays: scissors
```

It also works on a string, and picks one character:

```python
import random

print(random.choice("ABCDEF"))  # prints something like: C
```

**`random.random()`** gives a random decimal from 0 up to (but never quite reaching) 1:

```python
import random

print(random.random())  # prints something like: 0.7318234081530475
```

On its own, that's not very useful. It's handy for "a 30% chance" kind of ideas, which you'll be able to build once you know `if` in [chapter 08](../08-conditionals/notes.md).

> **If you did the JavaScript course:** you may remember the recipe `Math.floor(Math.random() * 6) + 1`. Python's `random.randint(1, 6)` does the whole job in one step, and both ends are included.

> **Watch out:** `random` is fine for games, but not for anything secret, like passwords or security codes. Its numbers aren't unpredictable enough. Python has a separate module called `secrets` for that, which you'll meet in [chapter 52](../52-security-basics/notes.md).

## Common mistakes

**1. Comparing decimals with `==`**

```python
total = 0.1 + 0.2
print(total == 0.3)  # prints: False
```

The tiny storage error makes the two values slightly different. Round before you compare (`round(total, 2) == 0.3` gives `True`), or work in whole numbers like cents (`10 + 20 == 30` is always `True`).

**2. Forgetting to import the module**

```python
print(math.sqrt(16))
# NameError: name 'math' is not defined. Did you forget to import 'math'?
```

Python doesn't load `math` or `random` until you ask. Add `import math` at the top of the file. Notice how helpful the error message is: it even guesses what you forgot.

**3. Wrong capital letters in a module's tools**

```python
import math
print(math.PI)
# AttributeError: module 'math' has no attribute 'PI'. Did you mean: 'pi'?
```

An **attribute** is something that belongs to a module (or a value), reached with a dot. Python is case-sensitive, so `PI` and `pi` are different names. The tools in `math` and `random` are all lowercase: `math.pi`, `math.ceil`, `random.randint`.

**4. Expecting `round()` to always round halves up**

```python
print(round(2.5))  # prints: 2
```

Python rounds exact halves to the nearest *even* number, so `2.5` becomes `2` and `3.5` becomes `4`. If you need "always up", use `math.ceil()`. If you need "always down", use `math.floor()`.

**5. Giving `sum()` loose numbers**

```python
print(sum(72, 95, 88))
# TypeError: sum() takes at most 2 arguments (3 given)
```

An **argument** is a value you pass into a function's brackets. `max()` and `min()` happily take loose numbers, but `sum()` wants them grouped in a list. Add square brackets: `sum([72, 95, 88])`.

**6. Expecting `round()` to show trailing zeros**

```python
print(round(4.50, 2))  # prints: 4.5
```

`round()` gives back a number, and numbers never print with extra zeros at the end. That's fine for math, but not for a price tag. You'll fix this properly with f-strings in [chapter 06](../06-strings/notes.md).

## Quick recap

- `int` is for whole numbers and has no size limit. `float` is for decimals. Use underscores to make big numbers readable: `1_000_000`.
- Some decimals can't be stored exactly, so `0.1 + 0.2` isn't exactly `0.3`. Use `round(x, 2)` for display and before comparing, and work in whole cents for money.
- `round()` rounds exact halves to the nearest even number: `round(2.5)` is `2`.
- Built-in helpers: `abs()`, `min()`, `max()`, `sum([...])`, and `divmod()` for "how many, and what's left over".
- `import math` gives you `math.floor`, `math.ceil`, `math.sqrt` and `math.pi`.
- `import random` gives you `random.randint(a, b)` (both ends included), `random.choice(...)` and `random.random()`.
- Dividing by zero stops your program with a `ZeroDivisionError`.

---

**Next:** try the [exercises](exercises.md), then move on to [06 Strings](../06-strings/notes.md).
