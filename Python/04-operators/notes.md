# 04 Operators

## What is it?

An **operator** is a symbol (or a short word) that does something with values. For example, `+` adds two numbers, and `=` puts a value into a variable.

You've already used a few. This chapter fills in the rest: more math, shortcuts for updating variables, and operators that compare values and answer with `True` or `False`.

## Why does it matter?

Programs are constantly calculating and checking things:

- A shop adds up your basket, then checks whether you get free delivery.
- A game adds points, then checks whether you've beaten the high score.
- A cinema checks whether you're old enough to see a movie.

Operators are how you write those calculations and questions.

And getting them slightly wrong can be sneaky. If you forget that `*` happens before `+`, your program won't crash. It will calmly give you the wrong answer.

## Real-world example

Think of a day at a theme park. You use every kind of operator without noticing:

| At the theme park | Kind of operator |
|---|---|
| Adding up the price of tickets and snacks | **Arithmetic**: math like adding and multiplying |
| Topping up your ride card with more credit | **Assignment**: putting a new value into a variable |
| The "You must be this tall to ride" sign | **Comparison**: a yes/no question about two values |
| "You need a ticket AND you must be over 12" | **Logical**: combining yes/no answers |

Let's go through them one at a time.

## How it works

### Arithmetic operators

| Operator | Meaning | Example | Result |
|---|---|---|---|
| `+` | Add | `7 + 2` | `9` |
| `-` | Subtract | `7 - 2` | `5` |
| `*` | Multiply | `7 * 2` | `14` |
| `/` | Divide | `7 / 2` | `3.5` |
| `//` | Divide, keep only the whole part | `7 // 2` | `3` |
| `%` | Remainder | `7 % 2` | `1` |
| `**` | Power | `7 ** 2` | `49` |

You know the first four from chapter 01. The last three are new.

### `/` always gives a float

You noticed this in chapters 01 and 03: dividing with `/` always gives a `float`, even when the answer is a whole number.

```python
print(7 / 2)  # prints: 3.5
print(6 / 2)  # prints: 3.0
print(type(6 / 2))  # prints: <class 'float'>
```

Why? So that `/` always gives the same type of answer, whatever numbers you feed it. You never have to wonder whether the decimal part got lost. (Very old Python, version 2, worked differently: `7 / 2` gave `3`. That confused a lot of people, so Python 3 fixed it.)

### `//`: how many whole times?

Sometimes you only want the whole part. Say 3 friends share a pizza with 10 slices. How many slices does each friend get, if nobody gets a piece of a slice?

```python
slices = 10
friends = 3
print(slices / friends)  # prints: 3.3333333333333335
print(slices // friends)  # prints: 3
```

`/` gives the exact answer, but you can't hand out a third of a slice. `//` is called **floor division**: it divides, then drops everything after the decimal point, so you get "how many whole times does 3 go into 10".

If either number is a `float`, `//` still drops the decimal part, but gives back a `float`:

```python
print(7.0 // 2)  # prints: 3.0
```

> **Watch out:** "Floor" means "round down to the whole number below". For negative numbers that's further from zero: `-7 // 2` is `-4`, not `-3`. You'll rarely need `//` with negative numbers, but now you won't be surprised.

### `%`: what's left over

`%` is the **remainder** operator. It tells you what's left over after you share something out in equal groups. (You may hear it called "modulo".)

Back to the pizza: each of the 3 friends gets 3 slices, which uses up 9, so 1 slice is left over:

```python
slices = 10
friends = 3
print(slices % friends)  # prints: 1
```

A classic use is checking whether a number is even or odd. An even number divided by 2 leaves nothing over. An odd number leaves 1:

```python
print(8 % 2)  # prints: 0
print(7 % 2)  # prints: 1
```

### `//` and `%` together: minutes into hours

`//` and `%` make a great team. A film is 135 minutes long. How long is that in hours and minutes?

```python
total_minutes = 135
hours = total_minutes // 60  # how many whole hours fit
minutes = total_minutes % 60  # what's left over
print(hours, "h", minutes, "min")  # prints: 2 h 15 min
```

The same trick works for anything you share out: slices per friend, eggs per box, seconds into minutes, cents into dollars.

### `**`: powers

`**` raises a number to a **power**: `4 ** 2` means 4 × 4, and `2 ** 3` means 2 × 2 × 2.

It's handy for areas. A square room with 4-meter walls has a floor area of `4 ** 2` square meters:

```python
wall_length = 4
print(wall_length ** 2)  # prints: 16
print(2 ** 3)  # prints: 8
print(2 ** 10)  # prints: 1024
```

### Which goes first? (precedence)

When a calculation has several operators, Python follows the same order you learned in school math. The order is called **precedence**:

1. Brackets `( )` first
2. Then powers `**`
3. Then `*`, `/`, `//` and `%`, from left to right
4. Then `+` and `-`, from left to right

```python
print(2 + 3 * 4)  # prints: 14
print((2 + 3) * 4)  # prints: 20
```

In the first line, `3 * 4` happens first, then `2 +`. In the second, the brackets make `2 + 3` happen first.

Here's how this causes a real bug. You want the average of three test scores:

```python
test1 = 80
test2 = 90
test3 = 70

wrong_average = test1 + test2 + test3 / 3
right_average = (test1 + test2 + test3) / 3
print(wrong_average)  # prints: 193.33333333333334
print(right_average)  # prints: 80.0
```

Without brackets, only `test3` gets divided by 3. No error, just a wrong answer.

> **Tip:** When in doubt, add brackets. They cost nothing, and they make it clear to the reader what you meant.

### Assignment shortcuts: `+=`, `-=`, `*=`, `/=`

Remember updating a variable from its old value in [chapter 02](../02-variables/notes.md)? `score = score + 10` is so common that it has a shortcut: `score += 10`. Both mean exactly the same thing. These shortcuts are called **augmented assignment** ("augmented" just means "made bigger": it's an assignment with a bit of math added).

Here's a player's coins in a game:

```python
coins = 100

coins += 50  # found a treasure chest
print(coins)  # prints: 150

coins -= 30  # bought a potion
print(coins)  # prints: 120

coins *= 2  # double-coins weekend
print(coins)  # prints: 240

coins /= 4  # shared equally with a team of 4
print(coins)  # prints: 60.0
```

| Shortcut | Means the same as |
|---|---|
| `coins += 50` | `coins = coins + 50` |
| `coins -= 30` | `coins = coins - 30` |
| `coins *= 2` | `coins = coins * 2` |
| `coins /= 4` | `coins = coins / 4` |

Notice the last result: `60.0`, not `60`. `/=` divides with `/`, and `/` always gives a float. If you want to stay with whole numbers, there's `//=` too, and it works just like `//`.

`+=` works on strings as well, which is handy for building text a piece at a time:

```python
shopping_list = "Milk"
shopping_list += ", Bread"
shopping_list += ", Eggs"
print(shopping_list)  # prints: Milk, Bread, Eggs
```

### No `++` in Python

Adding 1 to a counter is very common. Picture the door counter at a museum. In Python you write `+= 1`:

```python
visitors = 0
visitors += 1  # someone came in
visitors += 1  # and another
print(visitors)  # prints: 2

visitors -= 1  # one person left
print(visitors)  # prints: 1
```

Many other languages have a `++` operator for this, but Python doesn't:

```python
visitors = 0
visitors++
# SyntaxError: invalid syntax
```

> **If you did the [JavaScript course](../../JavaScript/04-operators/notes.md):** Python has no `++` or `--`. Use `+= 1` and `-= 1`.

### Comparison operators

A comparison asks a yes/no question about two values. The answer is always a boolean, `True` or `False` (remember [chapter 03](../03-data-types/notes.md)?).

| Operator | The question it asks | Example | Result |
|---|---|---|---|
| `>` | Is the left bigger? | `5 > 3` | `True` |
| `<` | Is the left smaller? | `5 < 3` | `False` |
| `>=` | Is the left bigger or equal? | `5 >= 5` | `True` |
| `<=` | Is the left smaller or equal? | `4 <= 3` | `False` |
| `==` | Are they equal? | `5 == 5` | `True` |
| `!=` | Are they different? | `5 != 3` | `True` |

Here's the height check for a ride at the theme park:

```python
height = 125  # in centimeters
minimum_height = 120
can_ride = height >= minimum_height
print("Can ride:", can_ride)  # prints: Can ride: True
print(type(can_ride))  # prints: <class 'bool'>
```

Storing the answer in a variable with a yes/no name, like `can_ride`, makes your code read like plain English. For now you'll print these answers. In [chapter 08](../08-conditionals/notes.md), you'll use them to make decisions, like "if they can ride, open the gate".

Math happens before comparisons, so this even/odd check needs no brackets. A dance class needs an even number of people, so everyone has a partner:

```python
dancers = 7
print("Everyone has a partner:", dancers % 2 == 0)  # prints: Everyone has a partner: False
```

### `==` checks if two values are equal

`==` (two equals signs) asks "are these the same?":

```python
print(5 == 5)  # prints: True
print("cat" == "cat")  # prints: True
print("Cat" == "cat")  # prints: False
print(5 == 5.0)  # prints: True
print(5 == "5")  # prints: False
```

- Strings must match exactly, including capital letters.
- An `int` and a `float` can be equal if they're the same amount.
- A number and a string are never equal, even if they look alike. Python doesn't convert one into the other. If you need to compare text with a number, convert the text first: `int("5") == 5` gives `True`.

`!=` is the opposite. It's `True` when the two values are different:

```python
locker_code = 4821
print(locker_code != 1234)  # prints: True
```

> **If you did the JavaScript course:** Python has no `===`. Its `==` already works like JavaScript's `===` for numbers and text: no sneaky conversions, so `5 == "5"` is `False`.

### Chained comparisons: `1 < x < 10`

Want to check whether a value is between two others? In Python, you can write it just like in math class:

```python
age = 15
print(13 <= age <= 19)  # prints: True

age = 70
print(18 <= age <= 65)  # prints: False
```

`13 <= age <= 19` means "13 is less than or equal to `age`, **and** `age` is less than or equal to 19". This is called a **chained comparison**, and it's one of Python's nicest small features. Many languages (JavaScript included) give a wrong answer if you try it.

### Logical operators: `and`, `or` and `not`

Logical operators combine yes/no answers into one bigger answer. In Python they're plain English words:

- `and` is `True` only when both sides are `True`. "You can use the gym if you're a member AND it's open."
- `or` is `True` when at least one side is `True`. "Delivery is free if you're a member OR your order is 50 or more."
- `not` flips `True` to `False`, and `False` to `True`.

```python
is_member = True
is_open = False

print(is_member and is_open)  # prints: False
print(is_member or is_open)  # prints: True
print(not is_open)  # prints: True
```

Here's every possible combination:

| Left side | Right side | Left `and` right | Left `or` right |
|---|---|---|---|
| `True` | `True` | `True` | `True` |
| `True` | `False` | `False` | `True` |
| `False` | `True` | `False` | `True` |
| `False` | `False` | `False` | `False` |

In short: `and` is picky (both must be true). `or` is easygoing (one true is enough).

Most of the time, you'll combine comparisons. Comparisons happen before `and` and `or`, so you don't need brackets:

```python
age = 15
has_ticket = True

is_teenager = age >= 13 and age <= 19
can_enter = age >= 12 and has_ticket
print("Teenager:", is_teenager)  # prints: Teenager: True
print("Can enter:", can_enter)  # prints: Can enter: True
```

(`is_teenager` could also be written with a chained comparison: `13 <= age <= 19`. Both are fine.)

When you mix `and` and `or` in one line, add brackets anyway, so nobody has to remember which one goes first. Here, delivery is free for members, or for orders of 40 or more during the holidays:

```python
order_total = 42
is_member = False
is_holiday = True

free_delivery = is_member or (order_total >= 40 and is_holiday)
print("Free delivery:", free_delivery)  # prints: Free delivery: True
```

And `not` reads nicely with yes/no names:

```python
is_raining = False
print("Picnic time:", not is_raining)  # prints: Picnic time: True
```

`and` and `or` also behave in interesting ways with values that aren't `True` or `False`, and you'll see some of that in [chapter 08](../08-conditionals/notes.md). In this chapter, only use them with booleans.

> **If you did the JavaScript course:** `&&` is `and`, `||` is `or`, and `!` is `not`. The symbols don't work in Python at all.

### `+` and `*` on strings

You already know that `+` joins strings (chapter 03). `*` works on strings too: a string times a whole number repeats the string that many times.

```python
print("=" * 20)  # prints: ====================
print("ab" * 3)  # prints: ababab
```

That's perfect for drawing lines on a receipt or a menu. And the usual precedence applies, so `*` happens before `+`:

```python
print("-" * 5 + " Menu " + "-" * 5)  # prints: ----- Menu -----
```

Watch the types, though. With text, `*` repeats, it doesn't multiply:

```python
print("5" * 3)  # prints: 555
```

And you can't multiply two strings together:

```python
print("5" * "3")
# TypeError: can't multiply sequence by non-int of type 'str'
```

A **sequence** is a value made of items in order, and a string is a sequence of characters. Python is saying: "I can repeat a string a whole number of times, but not a string number of times."

### A quick peek at `in`

One more operator to know about for later. `in` asks "is this inside that?":

```python
print("a" in "cat")  # prints: True
```

You'll use `in` a lot with text in [chapter 06](../06-strings/notes.md).

### `=` vs `==`

These two look alike, but they do completely different jobs:

| Symbol | Name | What it does | Example |
|---|---|---|---|
| `=` | Assignment | Puts a value into a box | `lives = 0` |
| `==` | Equality | Asks a question: "are these equal?" | `lives == 0` |

A good way to read them aloud: `=` is "becomes", and `==` is "is equal to". So `lives = 0` reads "lives becomes 0", and `lives == 0` reads "lives is equal to 0?".

## Common mistakes

**1. Using `=` when you mean `==`**

```python
lives = 3
is_game_over = (lives = 0)
# SyntaxError: invalid syntax. Maybe you meant '==' or ':=' instead of '='?
```

You wanted to ask "is `lives` 0?", but a single `=` doesn't ask anything. Python spots it and suggests `==`. (Ignore the `:=` it mentions. It's a rarely used operator you don't need.) Fix: `is_game_over = lives == 0`.

**2. Using `==` when you mean `=`**

```python
lives = 3
lives == 0  # meant to reset lives to 0
print(lives)  # prints: 3
```

This one is sneakier, because there's no error at all. `lives == 0` asks a question, gets the answer `False`, and throws it away. Nothing changes. Fix: `lives = 0`.

**3. Using `^` for powers**

```python
print(2 ^ 3)  # prints: 1
```

In some calculators and spreadsheets, `^` means "to the power of". In Python, it does something else entirely (a rare trick with the binary digits of a number), so you get a strange answer and no error. Use `**`: `2 ** 3` gives `8`.

**4. Writing symbols from other languages**

```python
can_join = age >= 16 && is_member
# SyntaxError: invalid syntax
```

Python uses words, not symbols: `and`, `or` and `not` instead of `&&`, `||` and `!`. And there's no `++` or `--`: use `+= 1` and `-= 1`.

**5. Writing `=<` or `=>` instead of `<=` or `>=`**

```python
height = 125
print(height =< 120)
# SyntaxError: invalid syntax
```

The `=` always comes second: `<=` and `>=`. Say it out loud in that order: "less than or equal".

**6. Comparing text with a number**

```python
age_text = "18"  # typed in by a user, so it's text
print(age_text == 18)  # prints: False
```

Text is never equal to a number, and Python doesn't warn you. Convert it first: `int(age_text) == 18` gives `True`.

## Quick recap

- Arithmetic: `+ - * / // % **`. `/` always gives a float, `//` keeps only the whole part, `%` gives the remainder, and `**` raises to a power.
- Precedence: brackets first, then `**`, then `* / // %`, then `+ -`. When in doubt, add brackets.
- Shortcuts: `x += 5` means `x = x + 5` (the same goes for `-=`, `*=`, `/=` and `//=`). There's no `++` in Python.
- Comparisons (`== != < > <= >=`) answer with `True` or `False`. You can chain them: `13 <= age <= 19`.
- `and`, `or` and `not` combine true/false answers. They're words, not symbols.
- `+` joins strings and `*` repeats them: `"=" * 20`.
- `=` puts a value in a box. `==` asks whether two values are equal.

---

**Next:** try the [exercises](exercises.md), then move on to [05 Numbers and Math](../05-numbers-and-math/notes.md).
