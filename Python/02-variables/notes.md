# 02 Variables

## What is it?

A **variable** is a labeled box that holds a value. You give the box a name, put something inside, and then use the name whenever you need what's inside.

A **value** is a single piece of information, like the number `25` or the text `"Sandip"`.

## Why does it matter?

Remember the last exercise in [chapter 01](../01-getting-started/exercises.md), "Your life in numbers"? Your code probably looked something like this:

```python
print("Days alive:", 25 * 365)
print("Hours alive:", 25 * 365 * 24)
print("Minutes alive:", 25 * 365 * 24 * 60)
```

It works, but the age `25` is typed three times. When your birthday comes, you have to find and change every single one. Miss one, and your program quietly gives a wrong answer.

With a variable, you write the age once and use its name everywhere else:

```python
age = 25
print("Days alive:", age * 365)
print("Hours alive:", age * 365 * 24)
print("Minutes alive:", age * 365 * 24 * 60)
```

You'll see:

```
Days alive: 9125
Hours alive: 219000
Minutes alive: 13140000
```

Same result, but now the age lives in one place. Change `25` to `26`, run the file again, and every line updates by itself.

Variables also make code easier to read. `age * 365` tells you what's going on. With `25 * 365`, you have to guess what the 25 means.

## Real-world example

Think about moving house. You pack your things into boxes and write a label on each one: "Kitchen", "Books", "Winter clothes". Later, you don't open every box to find the plates. You read the labels.

Variables work the same way:

| Moving house | Python |
|---|---|
| A box | A variable |
| The label on the box ("Books") | The variable's name (`age`) |
| What's inside the box | The value (`25`) |
| Putting something in the box | Assigning a value |
| Emptying the box and putting something new in | Reassigning |
| A box labeled in big capitals: "GRANDMA'S CHINA, DO NOT TOUCH" | A constant: a value you promise not to change |

## How it works

### Creating a variable

```python
score = 0
print(score)  # prints: 0
```

Here's the first line, piece by piece:

| Piece | What it means |
|---|---|
| `score` | The label on the box: the variable's **name** |
| `=` | "Put this value in the box." |
| `0` | The value that goes inside |

Putting a value into a variable is called **assigning** it. That's all there is to it. In Python, a variable is created the first time you assign something to it. There's no special word to say "I'm making a new box". Just pick a name and use `=`.

To get the value back out, write the name with no quotes, like `print(score)`.

> **If you did the [JavaScript course](../../JavaScript/02-variables/notes.md):** Python has no `let`, `const` or `var`. You just write `score = 0`.

> **Watch out:** In Python, `=` doesn't mean "is equal to" like in math class. It means "put the value on the right into the box on the left". (Checking whether two values are equal uses `==`, which you'll learn in [chapter 04](../04-operators/notes.md).)

### Changing the value

Most variables change while the program runs. Picture a game where you start with 3 lives:

```python
lives = 3
print("Lives:", lives)  # prints: Lives: 3

lives = 2
print("Lives:", lives)  # prints: Lives: 2
```

The second `lives = 2` looks exactly like the first line. Python sees that a box called `lives` already exists, so it just puts the new value into it. This is called **reassigning**.

The old value, `3`, is gone. A box holds one value at a time.

### Updating from the old value

Often the new value depends on the old one. You score 10 points, so your score goes up by 10:

```python
score = 0
score = score + 10
print(score)  # prints: 10

score = score + 5
print(score)  # prints: 15
```

`score = score + 10` looks strange if you read it like a math equation. Read it in two steps instead:

1. **Right side first:** take what's in `score` (0) and add 10. That gives 10.
2. **Then the left side:** put that 10 back into `score`.

You'll use this pattern all the time: a bank balance after a deposit, the steps on a fitness tracker, the number of items in a basket.

```python
balance = 100
balance = balance + 250  # payday
balance = balance - 80  # weekly shopping
print("Balance:", balance)  # prints: Balance: 270
```

> **Tip:** There's a shorter way to write `score = score + 10`. You'll learn it in [chapter 04](../04-operators/notes.md).

### Using variables in calculations

You can do math with variables, just like with plain numbers. And you can store the result in a new variable. Say four friends each order a pizza and a drink:

```python
pizza_price = 15
drink_price = 3
people = 4

cost_per_person = pizza_price + drink_price
total_cost = cost_per_person * people

print("Each person pays:", cost_per_person)  # prints: Each person pays: 18
print("Total:", total_cost)  # prints: Total: 72
```

Giving each step its own name makes the calculation easy to follow. Anyone can read `cost_per_person * people` and understand it, without doing the math in their head.

Notice there are no quotes around the variable names. Quotes would turn a name into plain text:

```python
people = 4
print("people")  # prints: people
print(people)  # prints: 4
```

### Boxes can hold text too

A variable can hold text just as easily as a number. Remember that text always goes in quotes:

```python
name = "Maya"
city = "Lisbon"
print(name, "lives in", city)  # prints: Maya lives in Lisbon
```

Numbers, text and other kinds of values are called **data types**. They each have their own rules, and they're the whole topic of [chapter 03](../03-data-types/notes.md).

### Constants: values that shouldn't change

Some values should never change once they're set: the number of days in a week, the price of a movie ticket, the name of your shop. A value like that is called a **constant**.

Python has no special keyword for constants. Instead, programmers use a naming habit: **write the name in UPPER_CASE**, with underscores between the words.

```python
DAYS_IN_WEEK = 7
TICKET_PRICE = 12
print(DAYS_IN_WEEK * TICKET_PRICE)  # prints: 84
```

The capitals are a message to every human who reads the code: "this value is fixed, please don't change it."

But here's the honest truth: Python itself doesn't care. It won't stop you:

```python
MAX_PLAYERS = 4
MAX_PLAYERS = 5
print(MAX_PLAYERS)  # prints: 5
```

No error at all. Like the "DO NOT TOUCH" label on a box, an UPPER_CASE name is a **promise, not a rule**. It's up to you to keep it.

> **If you did the JavaScript course:** there's no `const` in Python, so nothing stops a constant from being changed. The UPPER_CASE name is the whole protection.

So which should you use? Ask yourself one question: "will this value change while the program runs?"

| Value | Does it change while the program runs? | Name it like |
|---|---|---|
| Days in a week | No | `DAYS_IN_WEEK` |
| The price of a movie ticket | No | `TICKET_PRICE` |
| The score in a game | Yes, every time you score | `score` |
| The balance of a bank account | Yes, with every deposit | `balance` |

### Naming rules

Python is strict about what a name can look like:

- Use only letters, digits and `_` (underscore). No spaces and no dashes.
- A name can't start with a digit.
- A name can't be a **keyword**: a word Python already uses for itself, like `if`, `for`, `class`, `True`, `None` or `import`.
- Names are case-sensitive: `score` and `Score` are two different boxes.

| Name | Allowed? | Why |
|---|---|---|
| `player_name` | Yes | Letters and an underscore |
| `player2` | Yes | Digits are fine after the first character |
| `_count` | Yes | It can start with an underscore |
| `2nd_place` | No | Starts with a digit |
| `first name` | No | Has a space |
| `player-name` | No | Python reads the `-` as a minus sign |
| `class` | No | Keyword |

If you break a rule, Python refuses to run the file at all. Each mistake gives a SyntaxError (remember those from [chapter 01](../01-getting-started/notes.md)?):

```python
2nd_place = "Sam"
# SyntaxError: invalid decimal literal
```

A **literal** is a value typed straight into your code, like `2` or `"Sam"`. Python sees the `2` at the start and thinks you're typing a number, then gets confused by the letters after it.

```python
player-name = "Sam"
# SyntaxError: cannot assign to expression here. Maybe you meant '==' instead of '='?
```

Python reads this as `player minus name`, a calculation, and you can't put a value into a calculation. The "Maybe you meant `==`" part is Python's best guess, and here it's a wrong guess. The real fix is an underscore: `player_name`.

```python
class = "Math"
# SyntaxError: invalid syntax
```

`class` is a keyword, so it's taken. Try `class_name` or `subject` instead.

Want to see every keyword? Python can show you the list:

```python
import keyword
print(keyword.kwlist)
```

You'll see:

```
['False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield']
```

`import keyword` loads a small extra tool that comes with Python. (You'll use `import` properly in [chapter 05](../05-numbers-and-math/notes.md), and the square brackets mean it's a list, which is [chapter 11](../11-lists/notes.md).) Don't try to memorize these words. You'll learn most of them as the course goes on, and VS Code colors them differently, so you'll spot them.

### Good names: snake_case and meaning

When a name is made of several words, Python programmers write it in **snake_case**: all lowercase, with an underscore between the words. The words lie flat along the ground, like a snake.

```
first_name    total_price    number_of_guests    high_score
```

This isn't just a habit. It comes from **PEP 8**, which is Python's official style guide: a document that says how Python code should look, so that everyone's code feels familiar. This course follows PEP 8 everywhere.

| Style | Looks like | Use it for |
|---|---|---|
| snake_case | `total_price` | Ordinary variables |
| UPPER_CASE | `TICKET_PRICE` | Constants (values that shouldn't change) |
| camelCase | `totalPrice` | Nothing in Python. It's JavaScript's style, so avoid it here |

A good name also tells you what's inside the box. These two programs do exactly the same thing:

```python
a = 12
b = 3
print(a * b)  # prints: 36
```

```python
ticket_price = 12
ticket_count = 3
print(ticket_price * ticket_count)  # prints: 36
```

In the first one, you have to guess what `a` and `b` are. The second one explains itself. Names cost nothing, so make them clear. A longer name is fine if it's clearer: `minutes_per_day` beats `mpd`.

### Assigning several at once

Python lets you fill several boxes in one line. Put the names on the left and the values on the right, separated by commas:

```python
width, height = 20, 15
print(width)  # prints: 20
print(height)  # prints: 15
print("Area:", width * height)  # prints: Area: 300
```

The first name gets the first value, the second name gets the second value, and so on. The counts must match on both sides:

```python
width, height = 20, 15, 10
# ValueError: too many values to unpack (expected 2)
```

Three values, but only two boxes to put them in. ("Unpack" is Python's word for taking several values apart and putting each one in its own box.)

Use this for values that belong together, like a width and a height. For unrelated values, one per line is easier to read.

### The swap trick

At a busy cafe, a waiter put two drinks on the wrong tables:

```python
table1 = "orange juice"
table2 = "hot chocolate"
```

How do you swap them? Your first try might be `table1 = table2`. But then the orange juice is gone, because a box holds only one value at a time. A real waiter would put one drink down on a tray for a moment:

```python
tray = table1  # put the orange juice on the tray
table1 = table2  # move the hot chocolate to table 1
table2 = tray  # move the orange juice from the tray to table 2

print("Table 1:", table1)  # prints: Table 1: hot chocolate
print("Table 2:", table2)  # prints: Table 2: orange juice
```

That works in every language. But Python has a neater way, using the "several at once" idea:

```python
table1, table2 = table2, table1
print("Table 1:", table1)  # prints: Table 1: orange juice
print("Table 2:", table2)  # prints: Table 2: hot chocolate
```

(They've swapped back again, because this runs after the first swap.)

Python works out the whole right side first, *then* fills the boxes on the left. So both old values are safely picked up before anything gets replaced. No tray needed.

### A box with nothing in it yet

Sometimes you know you'll need a box, but you don't have its value yet. Think of a raffle: there will be a winner, but nobody knows who yet.

In Python, every variable needs a value the moment you create it. So for "nothing yet", Python has a special value called `None`:

```python
winner = None
print(winner)  # prints: None

winner = "Maya"
print(winner)  # prints: Maya
```

`None` is Python's word for "nothing here". You'll learn more about it in [chapter 03](../03-data-types/notes.md).

## Common mistakes

**1. Using a variable before creating it**

```python
print(total)
total = 50
# NameError: name 'total' is not defined
```

Code runs from top to bottom, so line 1 tries to open a box that doesn't exist yet. Create the variable first, then use it.

**2. Putting the name in quotes**

```python
city = "Lisbon"
print("city")  # prints: city
```

Quotes make it text, so you get the word "city", not what's in the box. Fix: `print(city)`.

**3. A typo or the wrong capital letters**

```python
total_price = 50
print(totalprice)
# NameError: name 'totalprice' is not defined. Did you mean: 'total_price'?
```

Python is case-sensitive, and every character counts. There's no box called `totalprice`, only one called `total_price`. Copy names exactly. (Python's "Did you mean" guess is often right, so read it.)

**4. Writing the assignment backwards**

```python
total = 0
100 = total
# SyntaxError: cannot assign to literal here. Maybe you meant '==' instead of '='?
```

The box always goes on the left of `=`, and the value on the right. You can't put something "into" the number 100. Fix: `total = 100`.

**5. Using a dash or a space in a name**

```python
late-fee = 5
# SyntaxError: cannot assign to expression here. Maybe you meant '==' instead of '='?
```

The error message is confusing here. Python reads `late-fee` as "late minus fee". Use an underscore: `late_fee = 5`.

**6. Using Python's own names for your variables**

```python
print = "Hello"
print(print)
# TypeError: 'str' object is not callable
```

`print` isn't a keyword, so Python lets you use it as a name. But now the box called `print` holds text, and the real `print()` is hidden. "Not callable" means "you can't run this with brackets, it's not a function". Pick a different name, like `message`. Also steer clear of `type`, `input`, `int`, `str`, `sum`, `min` and `max`, which you'll meet as tools in the next few chapters.

## Quick recap

- A variable is a labeled box: a name that holds a value. It's created the first time you assign to it with `=`.
- `=` means "put the value on the right into the box on the left". To update a value from its old one, write `score = score + 10`.
- Names use letters, digits and `_`, can't start with a digit, can't be keywords, and are case-sensitive.
- Follow PEP 8: `snake_case` for ordinary variables, `UPPER_CASE` for constants. An UPPER_CASE name is a promise, not a rule: Python won't stop you changing it.
- `a, b = 1, 2` fills two boxes at once, and `a, b = b, a` swaps them.
- Using a name before it has a value gives a `NameError`. Use `None` for "nothing here yet".

---

**Next:** try the [exercises](exercises.md), then move on to [03 Data Types](../03-data-types/notes.md).
