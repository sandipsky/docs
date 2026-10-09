# 08 Conditionals

## What is it?

A **conditional** is code that only runs when something is true. It's how a program makes decisions: *if* this is true, do that, *otherwise* do something else.

## Why does it matter?

Until now, your programs ran every single line, top to bottom, no matter what. That's fine for a calculator. It's not fine for most real programs.

Here's a ticket machine from [chapter 07](../07-input-and-output/notes.md):

```python
tickets = int(input("How many tickets? "))
total = tickets * 12
print(f"Total: ${total}")
```

Type `3` and it works:

```
How many tickets? 3
Total: $36
```

But type `two`, and the whole program crashes:

```
How many tickets? two
Traceback (most recent call last):
  ...
ValueError: invalid literal for int() with base 10: 'two'
```

The program can't *check* anything first. It just charges ahead. Real programs react to what's going on:

- The input is a number? Use it. Not a number? Ask nicely for a number.
- The password is right? Let them in. Wrong? Show an error.
- The customer is a child? Charge the child's price.
- The order is over $50? Shipping is free.

In [chapter 04](../04-operators/notes.md), comparisons like `age >= 18` gave you `True` or `False`. Now you'll *act* on them.

## Real-world example

You already make decisions like this every morning:

| What you think | What it looks like in Python |
|---|---|
| "**If** it's raining, I'll take an umbrella." | `if is_raining:` |
| "**Otherwise**, I'll wear sunglasses." | `else:` |
| "If it's raining, umbrella. **Otherwise, if** it's cold, a coat. Otherwise, a T-shirt." | `if ...:` then `elif ...:` then `else:` |

You look at the weather, and you pick *one* option. Never two, never none. Conditionals work exactly the same way.

## How it works

### `if`: run code only when something is true

```python
temperature = 32

if temperature > 30:
    print("It's hot! Drink some water.")

print("Have a nice day.")
```

You'll see:

```
It's hot! Drink some water.
Have a nice day.
```

Here's how to read it:

- `if` starts the decision.
- `temperature > 30` is the **condition**: a question with a `True` or `False` answer.
- The colon `:` at the end of the line means "here comes the code that belongs to this `if`".
- The indented line underneath is the **block**: the code that runs only when the condition is `True`.

Change `temperature` to `20` and run it again. Now the condition is `False`, so Python skips the block, and you only see:

```
Have a nice day.
```

The last line isn't indented, so it's not part of the `if`. It runs every time.

### Blocks, the colon and indentation

Back in [chapter 01](../01-getting-started/notes.md), you got a first taste that spaces at the start of a line matter in Python. This is where you learn the full rule, because from now on you'll use it in every chapter.

A **block** is a group of lines that belong together. Many languages wrap a block in curly braces `{ }`. Python doesn't. It uses **indentation**: the spaces at the start of a line.

The rule has three parts:

1. **A line that starts a block ends with a colon `:`.** The colon is like the words "as follows" in a sentence. It tells Python a block is coming.
2. **Every line in the block is indented by the same amount.** The standard is **4 spaces** (PEP 8, Python's style guide, says so, and so does everyone else).
3. **The block ends when the indentation goes back.** The first line that's back at the old level is outside the block.

```python
temperature = 32

if temperature > 30:
    print("It's hot!")
    print("Drink some water.")
print("Have a nice day.")
```

You'll see:

```
It's hot!
Drink some water.
Have a nice day.
```

The two indented lines are the block. They run together, or not at all. `print("Have a nice day.")` is back at the left edge, so the block has ended, and that line always runs.

Think of a recipe with sub-steps:

```
Make the sauce:
    Chop the onion.
    Fry it for 5 minutes.
Boil the pasta.
```

You can tell at a glance that chopping and frying are part of "make the sauce", and boiling the pasta isn't. Python reads your code the same way, from the indentation alone.

> **Tip:** you never have to count spaces by hand. In VS Code, press **Tab** in a Python file and you get 4 spaces. Press **Shift + Tab** to go back one level. After you type a line ending in `:` and press Enter, VS Code indents the next line for you.

> **If you did the JavaScript course:** in JavaScript, indentation was only for humans, and the braces did the real work. In Python, the indentation *is* the structure. Get it wrong, and the program means something different, or won't run at all.

### When indentation goes wrong: `IndentationError`

Python checks your indentation before it runs a single line. If something doesn't fit, you get an **`IndentationError`**. Here are the three you'll meet most.

**No indentation after the colon:**

```python
temperature = 32

if temperature > 30:
print("It's hot!")
# IndentationError: expected an indented block after 'if' statement on line 3
```

The colon promised a block, but the next line is at the left edge, so the block is empty. Fix: indent the `print` by 4 spaces.

**Indentation where none belongs:**

```python
temperature = 32
    print("It's hot!")
# IndentationError: unexpected indent
```

There's no colon above this line, so nothing started a block. Python doesn't know what this indented line belongs to. Fix: move it back to the left edge.

**Lines in the same block don't line up:**

```python
temperature = 32

if temperature > 30:
    print("It's hot!")
  print("Drink some water.")
# IndentationError: unindent does not match any outer indentation level
```

The first `print` has 4 spaces, the second only 2. Python can't tell whether the second line is in the block or out of it. Fix: give both lines exactly 4 spaces.

And if you forget the colon itself, Python tells you straight out:

```python
temperature = 32

if temperature > 30
    print("It's hot!")
# SyntaxError: expected ':'
```

> **Tip:** when Python reports an indentation problem, look at the line it names *and* the line just above it. The real mistake is often a missing colon or a stray space one line earlier.

### `else`: the plan B

`else` gives Python something to do when the condition is `False`:

```python
balance = 40
price = 55

if balance >= price:
    print("Payment approved.")
else:
    print("Sorry, not enough money.")
# prints: Sorry, not enough money.
```

Exactly one of the two blocks runs. Never both, and never neither.

Notice that `else` has its own colon and its own indented block, and it lines up with the `if` it belongs to. `else` never has a condition: it simply catches everything the `if` didn't.

### `elif`: more than two choices

A cinema has four ticket prices: free for babies under 3, $8 for children under 13, $9 for seniors (65 and over), and $14 for everyone else.

```python
age = 70

if age < 3:
    print("Ticket: free")
elif age < 13:
    print("Ticket: $8 (child)")
elif age >= 65:
    print("Ticket: $9 (senior)")
else:
    print("Ticket: $14 (adult)")
# prints: Ticket: $9 (senior)
```

`elif` is short for "else if". You can have as many as you need.

Python checks the conditions from top to bottom and **stops at the first one that's `True`**. Only that block runs. If none are `True`, the `else` block runs. (The `else` is optional. Without it, if nothing matches, nothing happens.)

Notice that the second check is only `age < 13`, not "3 or older and under 13". If Python gets that far, it already knows `age < 3` was `False`.

> **If you did the JavaScript course:** Python spells it `elif`, not `else if`. Writing `else if` on one line is a `SyntaxError` in Python.

### Saving the decision in a variable

Often you want to *save* the decision instead of printing it straight away. Give the variable a value in every branch:

```python
age = 8

if age < 3:
    price = 0
elif age < 13:
    price = 8
elif age >= 65:
    price = 9
else:
    price = 14

print(f"Ticket price: ${price}")  # prints: Ticket price: $8
```

A variable created inside an `if` block still exists after the block ends, so the last line can use `price`. Every branch sets it, so it always has a value.

> **Watch out:** if no branch sets the variable, it never gets created:

```python
age = 30

if age < 13:
    ticket_price = 8

print(ticket_price)
# NameError: name 'ticket_price' is not defined
```

Age 30 isn't under 13, so the line inside the block never ran, and `ticket_price` was never made. Fix: add an `else` that sets it too, or give it a starting value before the `if`.

### Combining conditions with `and`, `or` and `not`

Remember `and`, `or` and `not` from [chapter 04](../04-operators/notes.md)? They let one `if` check several things at once.

An online shop gives free shipping on orders of $50 or more, **or** to anyone with a membership:

```python
order_total = 45
is_member = True

if order_total >= 50 or is_member:
    print("Shipping: FREE")
else:
    print("Shipping: $4.99")
# prints: Shipping: FREE
```

The order is under $50, but the customer is a member, so `or` is happy with one out of two.

A concert only lets you in if you're 18 or older **and** you have a ticket:

```python
age = 20
has_ticket = True

if age >= 18 and has_ticket:
    print("Welcome to the concert!")
# prints: Welcome to the concert!
```

`not` flips `True` to `False` and back again. It reads like plain English:

```python
is_raining = False

if not is_raining:
    print("No umbrella needed.")
# prints: No umbrella needed.
```

And the chained comparison from chapter 04 works in an `if` too. It's perfect for "between" checks, like a grade band:

```python
score = 75

if 70 <= score < 80:
    print("Grade: C")
# prints: Grade: C
```

### `in`: is this text inside that text?

In [chapter 06](../06-strings/notes.md) you met `in`, which checks whether one string appears inside another. It gives `True` or `False`, so it fits straight into an `if`:

```python
answer = "Yes, please!"

if "yes" in answer.lower():
    print("Great, adding it to your order.")
# prints: Great, adding it to your order.
```

`.lower()` turns `"Yes, please!"` into `"yes, please!"` first, so it doesn't matter how the customer typed it. That matters, because `in` is case-sensitive:

```python
print("cat" in "concatenate")  # prints: True
print("Cat" in "concatenate")  # prints: False
print("z" not in "pizza")      # prints: False
```

`not in` is the opposite: "is this text missing from that text?" There's a `z` in pizza (two of them!), so `"z" not in "pizza"` is `False`.

A neat trick is to check one character against a string of allowed characters:

```python
letter = "e"

if letter in "aeiou":
    print(f"{letter} is a vowel")
# prints: e is a vowel
```

> **Tip:** `in` works on lists too, and that's where it really shines. You'll see that in [chapter 11](../11-lists/notes.md).

### Nested `if` (and keeping it shallow)

You can put an `if` inside another `if`. This is called **nesting**. Each level gets 4 more spaces. Here's the check for an admin page on a website:

```python
is_logged_in = True
is_admin = False

if is_logged_in:
    if is_admin:
        print("Welcome to the admin panel.")
    else:
        print("Sorry, admins only.")
else:
    print("Please log in first.")
# prints: Sorry, admins only.
```

The indentation tells you which `else` belongs to which `if`. The inner `else` (8 spaces) lines up with the inner `if`. The outer `else` (no spaces) lines up with the outer `if`.

It works, but every extra level pushes the code further to the right and makes it harder to follow. Here's the same logic, flat:

```python
is_logged_in = True
is_admin = False

if not is_logged_in:
    print("Please log in first.")
elif not is_admin:
    print("Sorry, admins only.")
else:
    print("Welcome to the admin panel.")
# prints: Sorry, admins only.
```

The trick: **deal with the problem cases first**, then the happy case at the end. Each check is one line, and you can read it from top to bottom like a checklist. In [chapter 10](../10-functions/notes.md) you'll learn an even cleaner version of this trick.

### Truthy and falsy

So far, every condition has been a real `True` or `False`, like `age >= 18`. But you can put *any* value after `if`. Python quietly asks "does this count as true?" first.

Values that count as `False` are called **falsy**. Here are the ones you know so far:

| Falsy value | What it is |
|---|---|
| `False` | the boolean itself |
| `0` | zero |
| `0.0` | zero as a float |
| `""` | an empty string |
| `None` | Python's "nothing here" ([chapter 03](../03-data-types/notes.md)) |

**Everything else is truthy**, which means it counts as `True`. (Empty collections are falsy too, like an empty list `[]`. You'll meet lists in [chapter 11](../11-lists/notes.md).)

You can check any value with `bool()`. It converts a value to `True` or `False`, the same way `int()` and `str()` convert to whole numbers and strings:

```python
print(bool(0))        # prints: False
print(bool(""))       # prints: False
print(bool(None))     # prints: False
print(bool(42))       # prints: True
print(bool(-1))       # prints: True
print(bool("hello"))  # prints: True
print(bool("0"))      # prints: True (surprise!)
print(bool(" "))      # prints: True (surprise!)
```

`"0"` and `" "` aren't empty. They each contain one character, so they're truthy. Only the completely empty string `""` is falsy. And any number that isn't zero is truthy, even a negative one.

Truthiness makes some checks short and sweet. Here's a sign-up form checking that the name box isn't empty:

```python
typed_name = ""

if typed_name:
    print(f"Hello, {typed_name}!")
else:
    print("Please enter your name.")
# prints: Please enter your name.
```

`if typed_name:` means "if there's something in `typed_name`". Put `"Leo"` in it, and you'll see `Hello, Leo!` instead. The opposite, `if not typed_name:`, means "if it's empty".

> **If you did the JavaScript course:** Python's falsy values are similar, but there's no `undefined` or `NaN`, and an empty list is falsy in Python (in JavaScript, an empty array is truthy).

### The conditional expression: a one-line `if`/`else`

Sometimes you just want to pick one of two *values*. Writing a full `if`/`else` for that feels long:

```python
age = 16

if age >= 18:
    label = "adult"
else:
    label = "minor"
```

A **conditional expression** does the same thing in one line:

```python
age = 16
label = "adult" if age >= 18 else "minor"

print(label)  # prints: minor
```

Read it almost like English: "`label` is `"adult"` if age is 18 or more, else `"minor"`."

```
value_if_true if condition else value_if_false
```

It's great for getting the words right. Online shops use this trick so they never say "1 items":

```python
item_count = 3
word = "item" if item_count == 1 else "items"
print(f"You have {item_count} {word} in your cart.")
# prints: You have 3 items in your cart.
```

You can even put it straight inside the braces of an f-string. Use single quotes inside, so they don't clash with the f-string's double quotes:

```python
item_count = 1
print(f"You have {item_count} {'item' if item_count == 1 else 'items'} in your cart.")
# prints: You have 1 item in your cart.
```

> **Tip:** use the conditional expression to choose between two values. When you need to *do* things (several lines of code), use a normal `if`/`else`. And never put one conditional expression inside another. It gets hard to read fast.

> **If you did the JavaScript course:** this is Python's version of the ternary `condition ? a : b`. The order is different: the "true" value comes first, then the condition.

### Checking input before you convert it

Now you can fix the ticket machine from the top of this chapter. The problem was `int("two")`: it crashes. So check the text *before* you convert it.

In [chapter 06](../06-strings/notes.md) you met `.isdigit()`. It gives `True` only if the string is made of digits, and nothing else:

```python
print("42".isdigit())   # prints: True
print("4.5".isdigit())  # prints: False (the dot isn't a digit)
print("-3".isdigit())   # prints: False (neither is the minus sign)
print("abc".isdigit())  # prints: False
print("".isdigit())     # prints: False (an empty string has no digits)
```

That makes it a perfect guard in front of `int()`:

```python
answer = input("How many tickets? ")

if answer.isdigit():
    tickets = int(answer)
    print(f"Booking {tickets} tickets.")
else:
    print(f"'{answer}' is not a whole number. Please try again.")
```

Run it twice. With a number:

```
How many tickets? 3
Booking 3 tickets.
```

And with a word:

```
How many tickets? abc
'abc' is not a whole number. Please try again.
```

No crash. `int(answer)` only runs inside the `if` block, where you already know it's safe.

Real programs check more than one thing. Here's a fuller version. It strips stray spaces ([chapter 07](../07-input-and-output/notes.md)), then deals with each problem in turn, and leaves the happy case for last:

```python
answer = input("How many tickets? ").strip()

if not answer:
    print("You didn't type anything.")
elif not answer.isdigit():
    print(f"'{answer}' is not a whole number.")
elif int(answer) == 0:
    print("You need at least 1 ticket.")
else:
    tickets = int(answer)
    print(f"Booking {tickets} tickets.")
```

Here's what four different people might see:

```
How many tickets?
You didn't type anything.
```

```
How many tickets? two
'two' is not a whole number.
```

```
How many tickets? 0
You need at least 1 ticket.
```

```
How many tickets?   3
Booking 3 tickets.
```

The order matters. By the time Python reaches `int(answer) == 0`, the `elif` above has already made sure `answer` is all digits, so `int()` is safe.

You can also squeeze the check into one line with `and`:

```python
answer = input("How many tickets? ").strip()

if answer.isdigit() and int(answer) > 0:
    print(f"Booking {answer} tickets.")
else:
    print("Please type a whole number above zero.")
```

Type `abc`, and you'll see `Please type a whole number above zero.`, not a crash. Why doesn't `int("abc")` blow up? Because `and` is lazy in a useful way. If the left side is `False`, the whole thing must be `False`, so Python doesn't even *look* at the right side. This is called **short-circuiting**. The `int()` only runs when `isdigit()` has already said yes.

> **Watch out:** `.isdigit()` says no to negative numbers (`"-3"`) and decimals (`"4.5"`), so it only suits whole numbers of zero or more. That covers tickets, ages and quantities. A more flexible way to handle bad input, using `try` and `except`, comes in [chapter 18](../18-error-handling/notes.md).

### `match` and `case` (Python 3.10 and newer)

This section is optional. Everything here can be done with `if`/`elif`, but you'll see `match` in newer code, so it's good to recognize it.

When you compare *one value* against a list of exact options, `match` can be tidier than a long `elif` chain. Here's a self-driving car reading a traffic light:

```python
light = "yellow"

match light:
    case "green":
        print("Go!")
    case "yellow":
        print("Slow down.")
    case "red":
        print("Stop!")
    case _:
        print("Light is broken. Drive carefully.")
# prints: Slow down.
```

- `match light:` says which value to look at.
- Each `case` is one possible match. Python checks them from top to bottom and runs the first one that fits.
- `case _:` (an underscore) matches anything. It's the "none of the above" option, like a final `else`.

To let several values share one case, separate them with `|`, which you can read as "or":

```python
key = "w"

match key:
    case "w" | "up":
        print("Move up")
    case "s" | "down":
        print("Move down")
    case _:
        print("That key does nothing.")
# prints: Move up
```

`match` only arrived in Python 3.10 (2021), so it won't work on older versions. This course uses 3.13, so you're fine. For ranges, like `age < 13`, stick with `if`/`elif`.

> **If you did the JavaScript course:** `match` looks like `switch`, but there's no `break`, and no falling through into the next case. Only one case ever runs.

## Common mistakes

**1. Using `=` instead of `==`**

```python
score = 40

if score = 100:
    print("Perfect score!")
# SyntaxError: invalid syntax. Maybe you meant '==' or ':=' instead of '='?
```

A single `=` puts a value into a variable ([chapter 02](../02-variables/notes.md)). A double `==` compares. Python spots this mix-up and even suggests the fix. Fix: `if score == 100:`. (You can ignore the `:=` in the message. It's an advanced operator you won't need for a long time.)

**2. Mixing tabs and spaces**

In this code, the last line starts with a Tab character instead of 4 spaces. On screen, they can look exactly the same:

```python
is_open = True

if is_open:
    print("Come in!")
	print("We're open until 6.")
# TabError: inconsistent use of tabs and spaces in indentation
```

This usually happens when you copy code from a website or an email. VS Code helps: in the bottom-right corner it shows `Spaces: 4` for Python files, and pressing Tab inserts spaces. Fix: delete the indentation on that line and press Tab again in VS Code.

**3. Forgetting to repeat the variable with `or`**

```python
color = "blue"

if color == "red" or "orange":
    print("Warm color!")
# prints: Warm color! (wrong!)
```

This reads fine in English, but Python sees two separate things: `color == "red"`, **or** `"orange"`. A non-empty string is truthy, so the condition is always true, whatever the color. No error warns you. Fix: `if color == "red" or color == "orange":`.

**4. Putting `elif` checks in the wrong order**

```python
order_total = 120

if order_total > 50:
    print("You get 10% off!")
elif order_total > 100:
    print("You get 20% off!")
# prints: You get 10% off! (should be 20%!)
```

The first true condition wins, and the rest are skipped. 120 is more than 50, so Python never reaches the second check. Fix: put the biggest (most specific) check first.

**5. Comparing input with a number**

```python
age = input("Your age: ")

if age >= 18:
    print("You can vote.")
# TypeError: '>=' not supported between instances of 'str' and 'int'
```

`input()` always gives you a string, even when the person types digits ([chapter 07](../07-input-and-output/notes.md)). Python won't compare text with a number. Fix: check it with `.isdigit()`, then convert it with `int(age)` before comparing.

**6. Wrong capital letters on `True`, `False` and `else`**

```python
is_open = true
# NameError: name 'true' is not defined. Did you mean: 'True'?
```

Python is case-sensitive. `True` and `False` start with a capital letter. Python thinks `true` is the name of a variable you never made. It goes the other way for keywords: `if`, `elif` and `else` are all lowercase, and writing `Else:` gives `SyntaxError: invalid syntax`.

## Quick recap

- `if` runs a block only when its condition is `True`. `else` is the plan B. `elif` adds more choices, and the first true condition wins.
- A line that starts a block ends with a colon. The block is indented 4 spaces, and it ends when the indentation goes back. Bad indentation gives an `IndentationError`.
- Combine conditions with `and`, `or` and `not`. Use `in` to look for text inside text. Keep nesting shallow by handling the problem cases first.
- `False`, `0`, `0.0`, `""` and `None` are falsy. Everything else is truthy, even `"0"` and `" "`.
- `value_if_true if condition else value_if_false` picks one of two values in a single line.
- Check input with `.isdigit()` before you call `int()`, so a typo can't crash your program.
- `match`/`case` (Python 3.10+) compares one value against several exact options.

---

**Next:** try the [exercises](exercises.md), then move on to [09 Loops](../09-loops/notes.md).
