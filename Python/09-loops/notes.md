# 09 Loops

## What is it?

A **loop** runs the same block of code again and again, as many times as you need. Each trip through the loop is called an **iteration** (or a "round").

## Why does it matter?

Say you want to print the numbers from 1 to 100. Without a loop, that's 100 lines of `print()`. With a loop, it's 2 lines. Need 1 to 1,000 instead? You change one number.

Real programs repeat things all the time:

- Count down the seconds on a timer.
- Add interest to a savings account, year after year.
- Check every character of a password.
- Keep asking for a number until the person types a real one.

That last one fixes a problem from [chapter 08](../08-conditionals/notes.md). Your cash machine could spot bad input, but then it just ended. With a loop, it can ask again, and again, until it gets a good answer.

## Real-world example

You repeat things every day. The way you decide when to stop tells you which loop to use:

| Everyday task | What you know | Loop |
|---|---|---|
| "Do 10 push-ups." | Exactly how many times | `for` with `range()` |
| "Read out every letter on this sign." | You go through each thing in a group, one by one | `for` over a string |
| "Stir the sauce until it thickens." | When to stop, but not how many stirs that takes | `while` |

Every loop needs a way to stop. Push-ups stop at 10. The letters stop at the end of the sign. Stirring stops when the sauce is thick. A loop that never stops is a real problem, and you'll see why later.

## How it works

### The `for` loop and `range()`

Use `for` with `range()` when you know how many times to repeat. Here are 5 push-ups:

```python
for rep in range(5):
    print(f"Push-up number {rep}")
```

You'll see:

```
Push-up number 0
Push-up number 1
Push-up number 2
Push-up number 3
Push-up number 4
```

Five push-ups, but numbered 0 to 4! `range(5)` gives you five numbers, **starting at 0** and stopping **just before** 5. It's the same rule as string indexes and slices in [chapter 06](../06-strings/notes.md): counting starts at 0, and the "stop" number is never included.

For push-ups, you'd rather count from 1. Give `range()` a start and a stop:

```python
for rep in range(1, 6):
    print(f"Push-up number {rep}")
```

You'll see:

```
Push-up number 1
Push-up number 2
Push-up number 3
Push-up number 4
Push-up number 5
```

`range(1, 6)` means "start at 1, stop before 6". To get 1 to 5, the stop is one more than the last number you want.

Here's the first line, piece by piece:

| Piece | What it means |
|---|---|
| `for` | "Repeat the block below..." |
| `rep` | "...and each round, put the next number in a variable called `rep`..." |
| `in range(1, 6)` | "...taking the numbers from 1 up to (not including) 6." |
| `:` | "Here comes the block", exactly like the colon after `if` |

And here's the loop, one round at a time:

| Round | `rep` | What happens |
|---|---|---|
| 1 | 1 | prints `Push-up number 1` |
| 2 | 2 | prints `Push-up number 2` |
| ... | ... | ... |
| 5 | 5 | prints `Push-up number 5` |
| - | - | no numbers left, so the loop ends |

`rep` is called the **loop variable**. Python creates it for you and gives it a new value each round. You'll often see it called `i` (short for "index"). It's one of the few places where a one-letter name is normal.

> **Tip:** if you don't need the number at all, name the loop variable `_` (an underscore). It's a Python habit that means "I'm not going to use this":

```python
for _ in range(3):
    print("Hip hip hooray!")
```

You'll see:

```
Hip hip hooray!
Hip hip hooray!
Hip hip hooray!
```

### Counting in different ways

`range()` can take a third number: the **step**, which is how much to jump each time. A negative step counts down. Here's a rocket countdown:

```python
for seconds in range(5, 0, -1):
    print(seconds)
print("Liftoff!")
```

You'll see:

```
5
4
3
2
1
Liftoff!
```

Start at 5, stop *before* 0, and go down by 1 each time. `print("Liftoff!")` isn't indented, so it's not part of the loop. It runs once, after the loop has finished.

A bigger step skips numbers. Here's a bus timetable, with a bus every 15 minutes:

```python
for minute in range(0, 60, 15):
    print(f"A bus leaves at 9:{minute:02}")
```

You'll see:

```
A bus leaves at 9:00
A bus leaves at 9:15
A bus leaves at 9:30
A bus leaves at 9:45
```

`:02` is the zero-padding format spec from [chapter 06](../06-strings/notes.md): "at least 2 digits wide, with zeros in front if needed", so `0` turns into `00`.

And `end=" "` from [chapter 07](../07-input-and-output/notes.md) keeps everything on one line. Here are the even numbers from 2 to 10:

```python
for number in range(2, 11, 2):
    print(number, end=" ")
print()
```

You'll see:

```
2 4 6 8 10
```

The empty `print()` at the end finishes the line.

Here's a cheat sheet:

| Code | Numbers you get |
|---|---|
| `range(5)` | 0, 1, 2, 3, 4 |
| `range(1, 6)` | 1, 2, 3, 4, 5 |
| `range(2, 11, 2)` | 2, 4, 6, 8, 10 |
| `range(0, 60, 15)` | 0, 15, 30, 45 |
| `range(5, 0, -1)` | 5, 4, 3, 2, 1 |

> **Watch out:** `print(range(5))` shows `range(0, 5)`, not the numbers. A range doesn't make all its numbers up front. It hands them out one at a time, when a loop asks for the next one.

> **If you did the JavaScript course:** there's no `for (let i = 0; i < 5; i++)` in Python. `for i in range(5)` does the same job.

### The loop body is a block

Everything you learned about blocks in [chapter 08](../08-conditionals/notes.md) works the same way here: a colon, then 4 spaces of indentation. Every indented line runs once per round. The first line back at the left edge runs after the loop is done.

```python
for lap in range(1, 4):
    print(f"Lap {lap}: run")
    print(f"Lap {lap}: rest")
print("Workout done!")
```

You'll see:

```
Lap 1: run
Lap 1: rest
Lap 2: run
Lap 2: rest
Lap 3: run
Lap 3: rest
Workout done!
```

The two indented lines take turns, three times. `Workout done!` prints once, at the very end.

### Looping over a string

A `for` loop doesn't only work with `range()`. Give it a string, and it hands you each character in turn:

```python
for letter in "cat":
    print(letter)
```

You'll see:

```
c
a
t
```

No numbers, no indexes, and no way to get them wrong. Read it as "for each letter in this string".

Loops and `if` make a great team. Here's how you count how many times a letter appears:

```python
river = "Mississippi"
count = 0

for letter in river:
    if letter == "s":
        count += 1

print(f"'s' appears {count} times in {river}.")
# prints: 's' appears 4 times in Mississippi.
```

Look at the indentation. `count += 1` has 8 spaces, because it's inside the `if`, which is inside the loop. The final `print` has none, so it runs once, after the loop.

### The accumulator pattern: running totals and counts

The Mississippi example follows a pattern you'll use all the time. It's called the **accumulator pattern** ("accumulate" means "build up bit by bit"):

1. **Before the loop**, create a variable with a starting value (often `0`).
2. **Inside the loop**, update it a little each round.
3. **After the loop**, use the result.

Think of a piggy bank. You start with it empty, drop a coin in every day, and count it all at the end.

Here's a running total of the numbers from 1 to 10:

```python
total = 0

for number in range(1, 11):
    total += number

print(f"1 + 2 + ... + 10 = {total}")  # prints: 1 + 2 + ... + 10 = 55
```

`+=` from [chapter 04](../04-operators/notes.md) is doing the work. To see it build up, print inside the loop too:

```python
total = 0

for number in range(1, 5):
    total += number
    print(f"Added {number}, total is now {total}")
```

You'll see:

```
Added 1, total is now 1
Added 2, total is now 3
Added 3, total is now 6
Added 4, total is now 10
```

The accumulator doesn't have to be a number. It can be a string that grows one piece at a time. This loop reverses a word by putting each new letter at the *front*:

```python
word = "stressed"
reversed_word = ""

for letter in word:
    reversed_word = letter + reversed_word

print(reversed_word)  # prints: desserts
```

(The slice `word[::-1]` from chapter 06 does the same thing in one step. Now you know what it saves you!)

### Positions: `range(len(...))` and `enumerate()`

Sometimes you need each character's *position* as well as the character. One way is to loop over the positions with `range(len(word))`, and look each character up by its index:

```python
word = "cat"

for i in range(len(word)):
    print(f"Position {i}: {word[i]}")
```

You'll see:

```
Position 0: c
Position 1: a
Position 2: t
```

`len("cat")` is 3, so `range(3)` gives 0, 1 and 2: exactly the indexes of `"cat"`.

It works, but there's a neater way. **`enumerate()`** hands you the position *and* the character together, each round:

```python
for position, letter in enumerate("cat"):
    print(f"Position {position}: {letter}")
```

You'll see the same three lines. Notice the two loop variables, separated by a comma. It's the same trick as `a, b = 1, 2` from [chapter 02](../02-variables/notes.md): each round, `enumerate()` gives back a pair, and Python unpacks it into `position` and `letter`.

> **Tip:** when you only need the characters, loop over the string directly. When you need positions too, reach for `enumerate()` before `range(len(...))`. It's shorter and harder to get wrong.

### A sneak peek: lists

A string is a group of characters. In [chapter 11](../11-lists/notes.md) you'll meet **lists**, which are groups of *anything*: numbers, words, prices. A `for` loop goes through a list in exactly the same way:

```python
for fruit in ["apple", "banana", "cherry"]:
    print(fruit)
```

You'll see:

```
apple
banana
cherry
```

That's all you need to know about lists for now. Just remember that `for` works on any group of things, one item at a time.

### The `while` loop

Sometimes you don't know how many rounds you'll need. You only know when to stop. That's what `while` is for. It repeats its block **as long as** a condition is `True`:

```python
count = 1

while count <= 3:
    print(count)
    count += 1

print("Done")
```

You'll see:

```
1
2
3
Done
```

Before every round, `while` checks its condition, just like an `if`. `True`? Run the block, then come back and check again. `False`? The loop ends and the program moves on.

Here's where `while` really shines. You put $1,000 in a savings account that pays 5% interest each year. How many years until you have $1,500? You could work it out with a pen and paper... or let a loop try year after year:

```python
balance = 1000
years = 0

while balance < 1500:
    balance = balance * 1.05  # add 5% interest
    years += 1

print(f"After {years} years, you'll have ${balance:.2f}.")
# prints: After 9 years, you'll have $1551.33.
```

You didn't need to know the answer (9 years) in advance. The loop found it.

A `while` loop has no built-in counter. So *you* must make sure something inside the block changes, so the condition eventually becomes `False`. Here, `balance` grows every round.

If the condition is `False` from the very start, the block never runs at all:

```python
lives = 0

while lives > 0:
    print("Playing...")

print("Game over")
# prints: Game over
```

### Infinite loops (and how to stop them)

An **infinite loop** is a loop whose condition never becomes `False`, so it never stops. It's one of the most common beginner bugs:

```python
count = 1

while count <= 3:
    print(count)
    # oops: we forgot count += 1
```

`count` stays `1` forever, so `1 <= 3` is always `True`. Your terminal fills up with `1`s, over and over, as fast as your computer can print them.

**Don't panic.** Click in the terminal and press **`Ctrl + C`**. That stops the running program straight away. Python prints a short traceback that ends with `KeyboardInterrupt`, which just means "you pressed the stop keys". Then fix the loop so something changes every round (here, add `count += 1` inside the block).

> **Tip:** before you run a new `while` loop, ask yourself: "What changes each round, and when does the condition become `False`?" If you can't answer, the loop might never end.

### `break`: stop the loop early

`break` jumps out of a loop straight away, even if there are rounds left.

A website checks that a new password contains at least one digit. As soon as it finds one, there's no point checking the rest:

```python
password = "sunny7day"

for character in password:
    if character in "0123456789":
        print(f"Found a digit: {character}")
        break
    print(f"Checked {character}")
```

You'll see:

```
Checked s
Checked u
Checked n
Checked n
Checked y
Found a digit: 7
```

The loop never looks at `d`, `a` or `y`. It found what it needed and stopped.

### `continue`: skip to the next round

`continue` skips the rest of the current round and jumps to the next one. The loop keeps going.

Many hotels don't have a 13th floor, because some people think 13 is unlucky. Here's the hotel's lift:

```python
for floor in range(10, 16):
    if floor == 13:
        continue  # skip floor 13
    print(f"Floor {floor}")
```

You'll see:

```
Floor 10
Floor 11
Floor 12
Floor 14
Floor 15
```

The difference in one sentence: `break` leaves the loop for good, `continue` only skips one round.

### `while True` and `break`: keep going until you say stop

Here's a pattern you'll use constantly. `while True:` is a loop whose condition is *always* true, so on its own it would never end. Inside, you use `break` to leave when you're ready.

Why write it that way? Because sometimes you can only decide whether to stop in the *middle* of a round, after you've asked a question.

Here's the fix for chapter 08's one-chance problem. It asks for a number, and keeps asking until it gets one:

```python
while True:
    answer = input("How old are you? ").strip()
    if answer.isdigit():
        break
    print("Please type a whole number.")

age = int(answer)
print(f"Thanks! You are {age}.")
```

Here's one run, where the person needed three tries:

```
How old are you? twenty
Please type a whole number.
How old are you?
Please type a whole number.
How old are you? 20
Thanks! You are 20.
```

Read the loop body from top to bottom: ask; if the answer is good, `break` out; otherwise complain and go round again. Once the loop ends, you *know* `answer` is all digits, so `int(answer)` is safe.

The same pattern makes a **menu loop**: the program shows some choices, does what the user picked, and shows the menu again, until they choose to quit. Here's a cafe till:

```python
total = 0

while True:
    print()
    print("1) Add a coffee ($3)")
    print("2) Add a cake ($4)")
    print("3) Show total")
    print("4) Pay and leave")
    choice = input("Choose 1-4: ").strip()

    if choice == "1":
        total += 3
        print("Coffee added.")
    elif choice == "2":
        total += 4
        print("Cake added.")
    elif choice == "3":
        print(f"Total so far: ${total}")
    elif choice == "4":
        break
    else:
        print(f"'{choice}' is not on the menu.")

print(f"Thanks for visiting! You paid ${total}.")
```

Here's a run where the customer picks `1`, then `7` (oops), then `2`, then `4`:

```

1) Add a coffee ($3)
2) Add a cake ($4)
3) Show total
4) Pay and leave
Choose 1-4: 1
Coffee added.

1) Add a coffee ($3)
2) Add a cake ($4)
3) Show total
4) Pay and leave
Choose 1-4: 7
'7' is not on the menu.

1) Add a coffee ($3)
2) Add a cake ($4)
3) Show total
4) Pay and leave
Choose 1-4: 2
Cake added.

1) Add a coffee ($3)
2) Add a cake ($4)
3) Show total
4) Pay and leave
Choose 1-4: 4
Thanks for visiting! You paid $7.
```

Notice that `choice` is compared with the *strings* `"1"`, `"2"` and so on. `input()` always gives back text, so there's no need to convert it, and a typo like `abc` can't crash anything. It simply lands in the `else`.

> **If you did the JavaScript course:** Python has no `do...while` loop. `while True:` with a `break` is how Python does "run at least once, then check".

### Nested loops

A loop can go inside another loop. This is a **nested loop**. The inner loop runs all the way through, from start to finish, for *every single round* of the outer loop.

Think of a clock. The minute hand goes all the way around for every one step of the hour hand:

```python
for hour in range(9, 11):
    for minute in range(0, 60, 20):
        print(f"{hour}:{minute:02}")
```

You'll see:

```
9:00
9:20
9:40
10:00
10:20
10:40
```

The outer loop runs 2 times, and the inner loop runs 3 times for each of those. That's 2 × 3 = 6 lines. The inner loop's block has 8 spaces: 4 for the outer loop, and 4 more for the inner one.

Nested loops are how you build anything with rows and columns. Here's a times table. The outer loop makes the rows. The inner loop builds each row as a string, one number at a time, and then the row is printed:

```python
for row in range(1, 5):
    line = ""
    for column in range(1, 5):
        line += f"{row * column:>4}"
    print(line)
```

You'll see:

```
   1   2   3   4
   2   4   6   8
   3   6   9  12
   4   8  12  16
```

`:>4` is the right-alignment format spec from chapter 06. It makes every number 4 characters wide, so the columns line up. Look at where each line sits: `line = ""` and `print(line)` are in the outer loop (4 spaces), so they happen once per row. `line += ...` is in the inner loop (8 spaces), so it happens once per number.

The inner loop doesn't have to run the same number of times in every round. Here, it runs `row` times, so each row gets one more star than the row before it:

```python
for row in range(1, 5):
    stars = ""
    for _ in range(row):
        stars += "*"
    print(stars)
```

You'll see:

```
*
**
***
****
```

(`"*" * row` from [chapter 04](../04-operators/notes.md) would give you the same row in one step. Now you know how much work it saves you!)

### `for` and `else` (a rare extra)

This one surprises people: a `for` loop can have an `else`. The `else` block runs only if the loop finished **without** hitting `break`:

```python
password = "sunnyday"

for character in password:
    if character in "0123456789":
        print("Found a digit!")
        break
else:
    print("No digits in this password.")
# prints: No digits in this password.
```

Read the `else` as "if we never broke out". Change the password to `"sunny7day"` and you'll see `Found a digit!` instead, and the `else` is skipped.

You won't need this often, and many programmers find it confusing, so don't worry if it feels odd. Just recognize it if you see it. Notice that the `else` lines up with the `for`, not with the `if`.

### Choosing the right loop

| Your situation | Use |
|---|---|
| You know how many times to repeat (10 push-ups, the numbers 1 to 100) | `for` with `range()` |
| You want every character of a string | `for letter in text:` |
| You need each character's position as well | `for i, letter in enumerate(text):` |
| You repeat until something happens, but don't know when (a savings goal) | `while condition:` |
| You decide whether to stop halfway through a round (asking for input, a menu) | `while True:` with `break` |

When in doubt, start with a `for` loop. It's the most common by far, and it can't run forever by accident.

## Common mistakes

**1. Going one step too far (or not far enough)**

```python
for number in range(1, 10):
    print(number, end=" ")
print()
# prints: 1 2 3 4 5 6 7 8 9
```

We wanted 1 to 10, but `range()` stops *before* its stop number. This is called an **off-by-one error**: the loop runs one time too many or one time too few. It's so common that programmers joke about it. Fix: `range(1, 11)`. When a loop looks wrong, check the first round and the last round.

**2. Running past the end of a string**

```python
word = "cat"

for i in range(len(word) + 1):
    print(word[i])
```

You'll see:

```
c
a
t
Traceback (most recent call last):
  ...
IndexError: string index out of range
```

`"cat"` has 3 characters, so its last index is 2. The `+ 1` lets `i` reach 3, and there's no character there. Fix: `range(len(word))`, or better, loop over the string directly with `for letter in word:`.

**3. Starting the accumulator inside the loop**

```python
fruit = "banana"

for letter in fruit:
    count = 0
    if letter == "a":
        count += 1

print(count)  # prints: 1 (should be 3!)
```

`count = 0` is inside the loop, so it's reset to 0 at the start of *every* round. The count never gets past 1. Fix: move `count = 0` to *before* the loop, like the Mississippi example.

**4. Forgetting to change anything in a `while` loop**

If nothing inside a `while` loop changes the variable in its condition, the loop never ends. Press `Ctrl + C` to stop it, then add the missing step (like `count += 1`). See "Infinite loops" above.

**5. Looping over a number instead of a range**

```python
for i in len("cat"):
    print(i)
# TypeError: 'int' object is not iterable
```

**Iterable** means "something a `for` loop can go through, one item at a time". Strings and ranges are iterable. A plain number like `3` isn't: what would its "items" be? Fix: wrap it in `range()`, as in `for i in range(len("cat")):`.

**6. Changing the loop variable to skip ahead**

```python
for i in range(5):
    if i == 1:
        i = 4  # trying to skip ahead
    print(i)
```

You'll see:

```
0
4
2
3
4
```

Changing `i` only changes it for the rest of *that* round. At the start of the next round, the `for` loop puts the next number from the range into `i`, as if nothing happened. Fix: to skip rounds, use `continue`. To stop early, use `break`. If you really need to control the counter yourself, use a `while` loop.

## Quick recap

- A loop repeats a block of code. Every loop needs a way to stop.
- `for i in range(...)` repeats a set number of times. `range(5)` is 0 to 4, `range(1, 6)` is 1 to 5, and a third number sets the step, like `range(5, 0, -1)`.
- `for letter in text:` goes through a string one character at a time. `enumerate()` gives you the position too.
- The accumulator pattern: start a variable before the loop, update it inside, use it after.
- `while condition:` repeats until the condition is `False`. `while True:` with `break` is perfect for menus and for asking until the input is good.
- `break` leaves the loop early. `continue` skips to the next round.
- In a nested loop, the inner loop runs completely for every round of the outer loop.
- Stuck in an infinite loop? Press `Ctrl + C` in the terminal.

---

**Next:** try the [exercises](exercises.md), then move on to [10 Functions](../10-functions/notes.md).
