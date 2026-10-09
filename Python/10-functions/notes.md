# 10 Functions

## What is it?

A **function** is a reusable block of code with a name. You write it once, and then you can run it whenever you like, just by using its name.

You've been using functions since chapter 01: `print()`, `input()`, `len()`, `int()` and `round()` are all functions that someone else wrote. In this chapter, you'll write your own.

## Why does it matter?

At the end of [chapter 09](../09-loops/notes.md), you learned to keep asking until someone types a whole number. Now picture a ticket machine that needs *two* numbers. Without functions, you copy the loop:

```python
while True:
    answer = input("Adult tickets: ").strip()
    if answer.isdigit():
        break
    print("Please type a whole number.")
adults = int(answer)

while True:
    answer = input("Child tickets: ").strip()
    if answer.isdigit():
        break
    print("Please type a whole number.")
children = int(answer)
```

It works, but:

- Your program gets long and hard to read.
- When you find a bug, you have to fix every copy (and you'll miss one).
- Nobody can tell what a chunk of code does without reading every line.

Here's the same program with a function. Don't worry about the details yet. By the end of this chapter, every line will make sense:

```python
def ask_whole_number(question):
    """Keep asking until the user types a whole number, then return it."""
    while True:
        answer = input(question).strip()
        if answer.isdigit():
            return int(answer)
        print("Please type a whole number.")


adults = ask_whole_number("Adult tickets: ")
children = ask_whole_number("Child tickets: ")
total = adults * 14 + children * 8
print(f"Total: ${total}")
```

Here's one run:

```
Adult tickets: 2
Child tickets: abc
Please type a whole number.
Child tickets: 1
Total: $36
```

The asking loop is written once, and it has a name that says what it does. Need a third question? One more line. Programmers have a motto for this: **DRY**, which stands for "Don't Repeat Yourself".

## Real-world example

A function is like a **coffee machine**.

| Coffee machine | Function |
|---|---|
| Someone builds the machine once | You **define** (create) the function once, with `def` |
| You press the button whenever you want a coffee | You **call** (run) the function whenever you need it |
| The machine has slots for water, beans and milk | The function has **parameters** |
| The beans and milk you put in today | The **arguments** you pass in |
| The cup of coffee that comes out | The **return value** |

And here's the best part: you don't need to know how the machine works inside. You only need to know what to put in and what comes out. Functions are the same. Once one works, you can use it without thinking about its insides.

## How it works

### Defining and calling a function

Here's a function for a cafe's welcome screen:

```python
def greet_customer():
    print("Welcome to Bean There Cafe!")
    print("What can I get you today?")


greet_customer()
greet_customer()
```

You'll see:

```
Welcome to Bean There Cafe!
What can I get you today?
Welcome to Bean There Cafe!
What can I get you today?
```

There are two separate steps here:

1. **Defining** the function creates it. You write the keyword `def` (short for "define"), a name, brackets `()`, and a colon. Underneath comes an indented block, just like after `if` or `for`. That block is called the function's **body**. Defining a function doesn't run the body. It's like building the coffee machine.
2. **Calling** the function runs its body. You write its name followed by brackets: `greet_customer()`. That's pressing the button. Here we pressed it twice, so the body ran twice.

Function names follow the same rules as variable names: `snake_case`, letters, digits and underscores ([chapter 02](../02-variables/notes.md)).

> **Tip:** PEP 8 asks for **two blank lines** before and after a function definition. Python doesn't need them, but they make each function stand out, like a gap between paragraphs.

### Parameters and arguments

A welcome message is nicer with the customer's name in it. You can give a function **parameters**: names in the brackets that stand for values you'll hand over later.

```python
def greet_customer(name):
    print(f"Welcome, {name}!")


greet_customer("Aisha")  # prints: Welcome, Aisha!
greet_customer("Tom")    # prints: Welcome, Tom!
```

When you call `greet_customer("Aisha")`, the value `"Aisha"` is called an **argument**. Python puts it into the parameter `name`, and the body runs with it. The next call puts `"Tom"` in instead.

- **Parameter:** the empty slot in the machine (`name`). You write it when you *define* the function.
- **Argument:** what you actually put in the slot (`"Aisha"`). You write it when you *call* the function.

A function can have several parameters, separated by commas. The arguments fill them **in order**: the first argument goes into the first parameter, and so on. These are called **positional arguments**, because their position decides where they go.

```python
def describe_order(size, drink):
    print(f"One {size} {drink}, coming right up!")


describe_order("large", "latte")  # prints: One large latte, coming right up!
describe_order("latte", "large")  # prints: One latte large, coming right up!
```

Python doesn't know what the words mean. It just matches them up by position, so the order you pass them in matters. (You'll see a way around that later in this chapter.)

### `return`: handing back a value

Most useful functions work something out and hand you the result. That's what `return` does:

```python
def calculate_tip(bill, tip_percent):
    return bill * tip_percent / 100


tip = calculate_tip(40, 15)

print(tip)                            # prints: 6.0
print(f"Total with tip: ${40 + tip}")  # prints: Total with tip: $46.0
```

(It's `6.0`, not `6`, because `/` always gives a float. Remember that from [chapter 04](../04-operators/notes.md)? Use `{40 + tip:.2f}` in the f-string if you want `$46.00`.)

When Python reaches `return`, two things happen:

1. The function **stops** right there.
2. The value after `return` is **handed back** to the place where the function was called.

You can picture the call being swapped for its answer. `tip = calculate_tip(40, 15)` turns into `tip = 6.0`.

The value that comes back is called the **return value**. You've used return values all along: `len("cat")` returns `3`, and `input()` returns whatever the person typed.

### No `return`? You get `None`

If a function has no `return`, it still hands something back: `None`, Python's way of saying "nothing here" ([chapter 03](../03-data-types/notes.md)).

```python
def say_hi():
    print("Hi!")


result = say_hi()
print(result)
```

You'll see:

```
Hi!
None
```

`say_hi()` printed `Hi!`, but it didn't return anything, so `result` got `None`.

### `print` vs `return` (read this twice)

Both seem to "give you the answer", so almost every beginner mixes them up at some point. But they do completely different jobs.

Think about the coffee machine again. When your latte is ready, two things can happen:

- The little **screen** on the machine lights up: "Your latte is ready!" That's `print`. It's a message for the person standing there. You can read it, but you can't drink it, and you can't do anything else with it.
- A **cup** comes out. That's `return`. You can pick it up, add sugar, carry it to your table, or hand it to a friend.

A machine that shows "Your latte is ready!" but never gives you a cup looks like it worked. But you've got nothing to drink.

Here are two functions for a pizza shop. Both add a $5 delivery fee to the price. One *shows* the answer. The other *returns* it:

```python
def show_total(price):
    print(price + 5)  # the screen message


def get_total(price):
    return price + 5  # the cup


shown = show_total(20)      # prints: 25
returned = get_total(20)    # (prints nothing)

print(shown)     # prints: None
print(returned)  # prints: 25
```

Look at what happened:

- `show_total(20)` printed `25` on the screen. But it didn't hand anything back, so `shown` got `None`. An empty cup.
- `get_total(20)` didn't print anything. It quietly handed back `25`, and `returned` kept it.

The difference really shows when you try to *use* the answer. Say a customer places two orders like this one, each with its own delivery:

```python
print(show_total(20) * 2)
```

You'll see:

```
25
Traceback (most recent call last):
  ...
TypeError: unsupported operand type(s) for *: 'NoneType' and 'int'
```

`show_total` printed its screen message (`25`), then handed back `None`. And `None * 2` makes no sense, so Python stops with a `TypeError`. (`NoneType` is the type of `None`.) The version with `return` just works:

```python
print(get_total(20) * 2)  # prints: 50
```

| | `print(value)` | `return value` |
|---|---|---|
| In the coffee machine | The screen message | The cup of coffee |
| Who gets the value? | You, reading the terminal | The code that called the function |
| Can you save it or do math with it? | No | Yes |
| Does it stop the function? | No | Yes |

**The rule of thumb:** if a function works something out, it should `return` the answer. Let the code that *calls* the function decide what to do with it: print it, save it, or use it in the next calculation.

`print` is still your best friend for *looking* at values while you write and test code. Just don't use it as a way to hand answers back.

### Returning early

Because `return` stops the function, you can use it to leave as soon as you know the answer. Here's a cash machine:

```python
def withdraw(balance, amount):
    if amount <= 0:
        return "Please enter an amount above zero."
    if amount > balance:
        return "Sorry, you don't have enough money."
    return f"Here's your ${amount}. New balance: ${balance - amount}."


print(withdraw(100, 30))   # prints: Here's your $30. New balance: $70.
print(withdraw(100, 500))  # prints: Sorry, you don't have enough money.
print(withdraw(100, -5))   # prints: Please enter an amount above zero.
```

This is the cleaner trick promised in [chapter 08](../08-conditionals/notes.md). Each problem case is checked at the top, and it leaves straight away with a `return`. These checks are called **guard clauses**. No `else`, no `elif`, no nesting: if the code gets past the guards, everything is fine, and the happy case sits at the bottom.

Once a `return` runs, the rest of the function is skipped. Anything after it never happens:

```python
def double(number):
    return number * 2
    print("This never prints")


print(double(4))  # prints: 8
```

`return` works inside a loop too, and it leaves the loop *and* the function in one go. That's how `ask_whole_number` at the top of this chapter escapes its `while True:` loop: there's no `break`, because `return int(answer)` ends everything at once.

### Default parameter values

What happens if you forget an argument?

```python
def calculate_tip(bill, tip_percent):
    return bill * tip_percent / 100


print(calculate_tip(40))
# TypeError: calculate_tip() missing 1 required positional argument: 'tip_percent'
```

Python counts the arguments, sees one is missing, and refuses to run the function. A **default value** gives a parameter a backup, used only when the argument is left out. Write it with `=` in the brackets:

```python
def calculate_tip(bill, tip_percent=15):
    return bill * tip_percent / 100


print(calculate_tip(40))      # prints: 6.0 (uses the default 15%)
print(calculate_tip(40, 20))  # prints: 8.0 (20% replaces the default)
```

The restaurant suggests a 15% tip, so that's the default. Anyone who wants to tip a different amount can still pass their own number.

Notice there are no spaces around the `=` in `tip_percent=15`. That's the PEP 8 style for defaults, and it helps you tell them apart from a normal assignment like `tip = 6`.

Parameters with defaults must come **after** the ones without:

```python
def calculate_tip(tip_percent=15, bill):
    return bill * tip_percent / 100
# SyntaxError: parameter without a default follows parameter with a default
```

Why? If you called `calculate_tip(40)`, Python couldn't tell whether `40` was meant for `tip_percent` or `bill`. Fix: put the required ones first, `(bill, tip_percent=15)`.

### Keyword arguments

Remember `describe_order("latte", "large")` printing "One latte large"? You can avoid that mix-up by naming the parameter when you call the function. These are called **keyword arguments**:

```python
def describe_order(size, drink):
    print(f"One {size} {drink}, coming right up!")


describe_order(drink="latte", size="large")  # prints: One large latte, coming right up!
```

With names attached, the order doesn't matter any more. Python puts each value into the parameter with that name. You've already used keyword arguments: `print(..., end="")` and `print(..., sep=", ")` in [chapter 07](../07-input-and-output/notes.md).

Keyword arguments and defaults are a great team. Here's a coffee machine with three settings, each with a default. You only mention the ones you want to change:

```python
def make_coffee(drink="espresso", size="medium", sugar=0):
    return f"{size} {drink} with {sugar} sugar"


print(make_coffee())                  # prints: medium espresso with 0 sugar
print(make_coffee(sugar=2))           # prints: medium espresso with 2 sugar
print(make_coffee("latte", sugar=1))  # prints: medium latte with 1 sugar
```

`make_coffee(sugar=2)` skips straight to the third setting and leaves the first two at their defaults. Without keyword arguments, you'd have to write `make_coffee("espresso", "medium", 2)`.

You can mix both kinds in one call, as the last line does, but positional arguments must come first:

```python
describe_order(size="small", "tea")
# SyntaxError: positional argument follows keyword argument
```

Fix: `describe_order("small", drink="tea")`, or name both.

### Docstrings: a note for the next reader

A **docstring** is a short description of what a function does. It goes on the first line of the body, inside triple quotes (the multi-line strings from [chapter 06](../06-strings/notes.md)):

```python
def calculate_tip(bill, tip_percent=15):
    """Return the tip for a bill, using a percentage (15 by default)."""
    return bill * tip_percent / 100
```

Isn't that just a comment? Not quite. A comment is thrown away when Python runs your code. A docstring is kept and attached to the function, so tools can show it. Try `help()`:

```python
def calculate_tip(bill, tip_percent=15):
    """Return the tip for a bill, using a percentage (15 by default)."""
    return bill * tip_percent / 100


help(calculate_tip)
```

You'll see:

```
Help on function calculate_tip in module __main__:

calculate_tip(bill, tip_percent=15)
    Return the tip for a bill, using a percentage (15 by default).
```

VS Code reads docstrings too. Hover your mouse over `calculate_tip` anywhere in your file, and a little box shows the parameters and the docstring. That's how you remember how to use a function you wrote three weeks ago.

(If help text is long, it may open in a scrolling viewer. Press Space to scroll and Q to get back. Try `help(len)` or `help(print)` in the REPL to read about Python's own functions.)

A good docstring says *what* the function does and *what it returns*, in one sentence that starts with a verb: "Return the tip...", "Print a receipt...", "Keep asking until...". If you need more room, add a blank line and then the details:

```python
def celsius_to_fahrenheit(celsius):
    """Convert a temperature from Celsius to Fahrenheit.

    The formula is F = C * 9 / 5 + 32.
    """
    return celsius * 9 / 5 + 32
```

### Returning more than one value

Sometimes a function works out two answers at once. Splitting a bill between friends gives you each person's share *and* the leftover:

```python
def split_bill(total, people):
    each = total // people
    left_over = total % people
    return each, left_over


share, remainder = split_bill(100, 3)
print(f"Each pays ${share}, with ${remainder} left over.")
# prints: Each pays $33, with $1 left over.
```

`return each, left_over` hands back both values, separated by a comma. And `share, remainder = ...` catches them in two variables, in order: the same trick as `a, b = 1, 2` from [chapter 02](../02-variables/notes.md).

What actually comes back is a single value that holds both numbers. Peek at it:

```python
result = split_bill(100, 3)
print(result)        # prints: (33, 1)
print(type(result))  # prints: <class 'tuple'>
```

That `(33, 1)` is a **tuple**: a small, fixed group of values in round brackets. You'll learn all about tuples in [chapter 12](../12-tuples-and-sets/notes.md). For now, just catch the values in separate variables.

### Functions calling functions

A function can call other functions. That's how you build big programs: out of small pieces that each do one job well, like LEGO bricks.

Here's a food delivery receipt. Delivery is free for orders of $30 or more:

```python
def format_money(amount):
    """Return an amount as a string like $4.99."""
    return f"${amount:.2f}"


def get_delivery_fee(food_total):
    """Return the delivery fee: free from $30, otherwise $4.99."""
    return 0 if food_total >= 30 else 4.99


def print_receipt(food_total):
    """Print a receipt with the food, the delivery fee and the total."""
    fee = get_delivery_fee(food_total)
    print(f"Food: {format_money(food_total)}")
    print(f"Delivery: {format_money(fee)}")
    print(f"Total: {format_money(food_total + fee)}")


print_receipt(25)
```

You'll see:

```
Food: $25.00
Delivery: $4.99
Total: $29.99
```

Each function is small and easy to understand on its own. `format_money` is used three times, but written only once. And if the delivery rules change, there's exactly one place to fix. (`get_delivery_fee` uses the conditional expression from [chapter 08](../08-conditionals/notes.md).)

Notice which function prints. `format_money` and `get_delivery_fee` work something out, so they `return`. Only `print_receipt` prints, and its name says so.

### Functions that answer yes or no

A function can return `True` or `False`. These make your `if` statements read like plain English:

```python
def is_adult(age):
    """Return True if the age is 18 or over."""
    return age >= 18


def has_digit(text):
    """Return True if the text contains at least one digit."""
    for character in text:
        if character in "0123456789":
            return True
    return False


print(is_adult(15))            # prints: False
print(has_digit("sunny7day"))  # prints: True
print(has_digit("sunnyday"))   # prints: False
```

`is_adult` doesn't need an `if` at all: `age >= 18` is already `True` or `False`, so just return it.

`has_digit` returns `True` as soon as it finds a digit, straight from inside the loop. If the loop gets all the way to the end without finding one, the last line returns `False`. Watch the indentation: `return False` lines up with the `for`, not the `if`, so it only runs after the loop has finished.

Now an `if` like `if has_digit(password):` reads almost like a sentence.

### Naming functions

A function *does* something, so give it a name that starts with a verb (an action word), written in `snake_case`:

| Good name | Why it's good |
|---|---|
| `calculate_tip` | Says exactly what it works out |
| `format_money` | Says what it does to the value |
| `print_receipt` | "print" tells you it shows something on the screen |
| `ask_whole_number` | "ask" tells you it uses `input()` |
| `is_adult`, `has_digit` | Starting with `is_` or `has_` tells you it returns `True` or `False` |

Avoid vague names like `do_stuff`, `handle` or `process`. And don't name a function like a value (`tip`, `total`): that sounds like a number, not an action. A good name means you can read `calculate_tip(40)` and know what happens without looking inside.

### Why small functions are good

When you're starting out, it's tempting to write one long program from top to bottom. Small functions are better, for lots of reasons:

- **Easier to read.** `if is_valid_quantity(answer):` tells you what's going on. Five lines of checks don't.
- **Easier to test.** You can try a small function on its own, with a few inputs, and know it works.
- **Easier to fix.** A bug lives in one small place, not spread across copies.
- **Easier to reuse.** A good `format_money` works in every program you'll ever write about money.

Here's a check from [chapter 08](../08-conditionals/notes.md), wrapped up in a function with a clear name:

```python
def is_valid_quantity(text):
    """Return True if the text is a whole number above zero."""
    return text.isdigit() and int(text) > 0


print(is_valid_quantity("3"))    # prints: True
print(is_valid_quantity("0"))    # prints: False
print(is_valid_quantity("abc"))  # prints: False
```

A good rule of thumb: if you can't describe what a function does in one short sentence (its docstring!), it's probably doing too much. Split it up.

### Variables inside a function stay inside

A variable created inside a function only exists inside that function. The parameters, too:

```python
def calculate_bill(price):
    tip_amount = price * 0.15
    return price + tip_amount


print(calculate_bill(40))  # prints: 46.0
print(tip_amount)
# NameError: name 'tip_amount' is not defined
```

Think of a restaurant kitchen. The chef uses bowls, knives and chopping boards in there, but only the finished dish comes out through the hatch. `tip_amount` is one of the kitchen bowls. The dish is the return value. These inside-only variables are called **local variables**. Code inside a function *can* read variables from outside it, but there are some surprises there, and [chapter 16](../16-scope-and-mutability/notes.md) tells the full story. For now, the safe habit is: pass values *in* as arguments, and get answers *out* with `return`.

## Common mistakes

**1. Defining a function but never calling it**

```python
def show_welcome():
    print("Welcome to the gym!")
```

You run the file and... nothing happens. No output, no error. Defining a function only builds the machine. Nothing runs until you press the button. Fix: add `show_welcome()` below it.

**2. Forgetting the brackets**

```python
def get_greeting():
    return "Good morning!"


print(get_greeting)
```

You'll see something like this (the number at the end will be different on your computer):

```
<function get_greeting at 0x000002269D4214E0>
```

Without `()`, you're pointing at the machine instead of pressing its button. Python shows you the function itself, and that strange number is where it lives in your computer's memory. Fix: `print(get_greeting())`.

**3. Printing the answer instead of returning it**

```python
def calculate_area(width, height):
    print(width * height)


area = calculate_area(4, 5)
print(f"The room is {area} square meters.")
```

You'll see:

```
20
The room is None square meters.
```

The function showed `20` on the screen, but handed nothing back, so `area` is `None`. It's the screen message without the cup. Fix: `return width * height`.

**4. Calling a function before it's defined**

```python
show_welcome()


def show_welcome():
    print("Welcome to the gym!")
# NameError: name 'show_welcome' is not defined
```

Python runs your file from top to bottom. When it reaches line 1, the `def` hasn't happened yet, so there's no function with that name. Fix: put your function definitions at the top of the file, and the code that calls them underneath.

**5. Passing the wrong number of arguments**

```python
def describe_order(size, drink):
    print(f"One {size} {drink}, coming right up!")


describe_order("large", "latte", "extra hot")
# TypeError: describe_order() takes 2 positional arguments but 3 were given
```

The function has two slots, and you tried to fill three. Too few gives the "missing 1 required positional argument" error you saw earlier. Fix: check the `def` line (or hover over the name in VS Code) to see what the function expects.

**6. Passing arguments in the wrong order**

```python
def calculate_speed(distance_km, hours):
    return distance_km / hours


print(calculate_speed(2, 120))  # prints: 0.016666666666666666
```

We meant "120 km in 2 hours", but the arguments went into the wrong slots. There's no error, just a wrong answer, which makes this one sneaky. Fix: `calculate_speed(120, 2)` gives `60.0`. Even safer, use keyword arguments: `calculate_speed(distance_km=120, hours=2)`.

## Quick recap

- A function is a named, reusable block of code. Define it once with `def name():` and an indented body, then call it with `name()` as often as you like.
- **Parameters** are the slots in the definition. **Arguments** are the real values you pass in. Positional arguments are matched by order, keyword arguments (`size="large"`) by name.
- `return` hands a value back and stops the function. With no `return`, a function gives back `None`.
- `print` shows a value to *you*. `return` gives it to *your code*. If a function works something out, return it.
- Default values (`tip_percent=15`) fill in missing arguments. Guard clauses (early `return`s) handle problem cases first.
- A docstring in triple quotes, on the first line of the body, says what the function does. `help()` and VS Code show it.
- `return a, b` hands back two values (as a tuple), and `x, y = f()` catches them.
- Keep functions small, name them with verbs, and remember that variables made inside a function stay inside.

---

**Next:** try the [exercises](exercises.md), then move on to [11 Lists](../11-lists/notes.md).
