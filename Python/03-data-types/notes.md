# 03 Data Types

## What is it?

Every value in Python has a **type**: the kind of value it is. Text is one type, whole numbers are another, and yes/no answers are a third.

The type decides what you can do with a value. You can multiply two numbers, but multiplying two names makes no sense.

## Why does it matter?

Look at these two lines:

```python
print(5 + 3)  # prints: 8
print("5" + "3")  # prints: 53
```

They look almost the same, but the results are completely different. The only difference is the type: `5` is a number, and `"5"` (in quotes) is text. With numbers, `+` adds. With text, `+` glues the two pieces together.

This isn't only a puzzle. It causes real bugs. Picture an online shop where a T-shirt costs 20 and socks cost 5, but the basket shows a total of `205`. That happens when the prices arrive as text instead of numbers.

And if you mix the two types, Python stops you:

```python
print("5" + 3)
# TypeError: can only concatenate str (not "int") to str
```

Once you know about types, results and errors like these stop being mysterious, and you'll know how to fix them.

## Real-world example

Think of the sign-up form at a gym. Each box on the form expects a different kind of answer:

| On the form | Example answer | Python type |
|---|---|---|
| Full name | Maya Patel | `str` (text) |
| Age | 29 | `int` (whole number) |
| Height in meters | 1.68 | `float` (decimal number) |
| Tick box: "Do you want a locker?" | Yes or no | `bool` (`True` or `False`) |
| Middle name: you don't have one | Nothing | `None` |

You can do math with the age (how many years until you're 30?), but not with the name. A tick box can only ever be yes or no.

Python's types work the same way: each kind of value has its own rules.

## How it works

### The five basic types

| Type | Short for | What it holds | Examples |
|---|---|---|---|
| `str` | string | Text, inside quotes | `"Maya"`, `"Hello!"`, `"42"` |
| `int` | integer | Whole numbers, positive or negative | `42`, `0`, `-10` |
| `float` | floating-point number | Numbers with a decimal point | `3.5`, `0.25`, `-1.0` |
| `bool` | boolean | Yes or no | `True`, `False` |
| `NoneType` | | "Nothing here" | `None` (the only value of this type) |

An **integer** is just the math word for a whole number. A **float** gets its odd name from the decimal point, which can "float" to any position in the number: `1.5`, `15.0`, `0.015`.

These are the building blocks. Later chapters add types that hold many values at once, like lists ([chapter 11](../11-lists/notes.md)) and dictionaries ([chapter 13](../13-dictionaries/notes.md)). For now, these five are all you need.

### Checking a type with `type()`

Put a value inside `type()`, and Python tells you its type:

```python
print(type("Maya"))  # prints: <class 'str'>
print(type(42))  # prints: <class 'int'>
print(type(3.5))  # prints: <class 'float'>
print(type(True))  # prints: <class 'bool'>
print(type(None))  # prints: <class 'NoneType'>
```

Ignore the word `class` for now. Here it just means "kind of thing". The part in quotes is the type's name. (You'll learn what a class really is in [chapter 27](../27-classes-and-objects/notes.md).)

`type()` works on variables too, and it's the best way to tell two look-alike values apart. `print()` shows text without its quotes, so a number and a piece of text can look identical:

```python
price = 20
price_text = "20"
print(price, price_text)  # prints: 20 20
print(type(price), type(price_text))  # prints: <class 'int'> <class 'str'>
```

When a result looks strange, check the type. It's often the answer.

> **Tip:** In the REPL from chapter 01, you can skip `print()` and just type `type(42)` after the `>>>`. It's a quick way to check things while you learn.

### Strings: text

A **string** (`str`) is text. You met strings in chapter 01: anything inside quotes. Python accepts double quotes `"..."` or single quotes `'...'`. This course uses double quotes.

Anything inside quotes is a string, even if it's made of digits. Even `""` is a string: it's called an **empty string**, like a text box with nothing typed in it.

```python
print(type("42"))  # prints: <class 'str'>
print(type(""))  # prints: <class 'str'>
```

Double quotes are handy when your text has an apostrophe in it:

```python
print("It's a nice day")  # prints: It's a nice day
```

### Joining strings with `+`

When you use `+` with two strings, it glues them together. This is called **concatenation** (a fancy word for joining).

```python
first_name = "Ada"
last_name = "Lovelace"
full_name = first_name + " " + last_name
print(full_name)  # prints: Ada Lovelace
```

See the `" "` in the middle? It's a string that holds a single space. Without it, you'd get `AdaLovelace`. The `+` adds nothing extra, not even a space.

You already know another way to print several things: commas in `print()`. Here's the difference:

```python
city = "Oslo"
print("Welcome to", city)  # prints: Welcome to Oslo
print("Welcome to " + city)  # prints: Welcome to Oslo

greeting = "Welcome to " + city + "!"
print(greeting)  # prints: Welcome to Oslo!
```

- **Commas** print several values, and `print()` puts a space between them for you.
- **`+`** builds one new string. You add the spaces yourself, but you can store the result in a variable and use it later.

([Chapter 06](../06-strings/notes.md) shows a much neater way to build text, called f-strings.)

### Numbers: `int` and `float`

Python has two main kinds of number:

- **`int`** for whole numbers: a number of guests, a year, a temperature like `-3`.
- **`float`** for numbers with a decimal point: a price like `4.99`, a height like `1.68`.

```python
guests = 12
temperature = -3
price = 4.99
print(type(guests), type(temperature), type(price))
```

You'll see:

```
<class 'int'> <class 'int'> <class 'float'>
```

The decimal point is what decides it. `3` is an `int`, but `3.0` is a `float`, even though they're the same amount.

When you mix an `int` and a `float` in a calculation, the answer is a `float`. Python keeps the decimal point so nothing gets lost:

```python
print(3 + 2)  # prints: 5
print(3 + 1.5)  # prints: 4.5
print(2 * 1.0)  # prints: 2.0
print(type(3 + 2))  # prints: <class 'int'>
print(type(3 + 2.0))  # prints: <class 'float'>
```

And as you saw in chapter 01, dividing with `/` always gives a `float`, even when the answer is a whole number:

```python
print(10 / 2)  # prints: 5.0
```

[Chapter 04](../04-operators/notes.md) shows how to divide and get an `int`, and [chapter 05](../05-numbers-and-math/notes.md) covers a few surprises that floats have up their sleeve.

> **If you did the [JavaScript course](../../JavaScript/03-data-types/notes.md):** JavaScript has one `number` type for everything. Python splits numbers into `int` and `float`.

### Python refuses to guess: `"25" + 1`

What should `"25" + 1` be? Maybe `26`, if you treat the text as a number. Maybe `"251"`, if you treat the number as text. It's not clear, so Python doesn't pick. It stops with an error:

```python
print("25" + 1)
# TypeError: can only concatenate str (not "int") to str
```

Read the last line slowly: "I can only join (concatenate) a `str` to another `str`, and you gave me an `int`." A **TypeError** means you used a value of the wrong type for the job.

The other way round gives a slightly different message, but the same idea:

```python
print(1 + "25")
# TypeError: unsupported operand type(s) for +: 'int' and 'str'
```

An **operand** is a value on either side of an operator like `+`. Python is saying "`+` doesn't work between an `int` and a `str`".

This might feel strict, but it's a gift. An error now, on the exact line, is much easier to fix than a wrong answer that sneaks through your whole program.

> **If you did the JavaScript course:** in JavaScript, `"25" + 1` quietly gives `"251"`. Python refuses. You have to say exactly what you mean, by converting one side.

### Converting between types: `int()`, `float()` and `str()`

Text that looks like a number isn't a number yet. This matters more than you'd think. When someone types into your program (you'll learn how in [chapter 07](../07-input-and-output/notes.md)), Python receives text, even if they typed digits.

`int()` turns a value into a whole number:

```python
tickets_text = "3"  # typed in by a user, so it's text
tickets = int(tickets_text)

print(tickets + 2)  # prints: 5
print(type(tickets))  # prints: <class 'int'>
```

`float()` turns a value into a decimal number:

```python
print(float("3.5"))  # prints: 3.5
print(float("3"))  # prints: 3.0
print(float(7))  # prints: 7.0
```

`str()` goes the other way. It turns a value into text, which is exactly what you need to join a number onto a string with `+`:

```python
year = 2026
year_text = str(year)
print(year_text, type(year_text))  # prints: 2026 <class 'str'>
print("Year: " + str(year))  # prints: Year: 2026
```

Converting never changes the original variable. `int(tickets_text)` makes a *new* value, and `tickets_text` is still the string `"3"`. That's why you store the result in a variable.

### When converting fails: `ValueError`

What if the text isn't a number at all?

```python
print(int("abc"))
# ValueError: invalid literal for int() with base 10: 'abc'
```

A **ValueError** means the type was fine (`int()` does accept text), but this particular value makes no sense. "Base 10" is just our normal way of counting with the digits 0 to 9, and a "literal" (from chapter 02) is a value written out in full. So the message means: "`'abc'` isn't a whole number I can read."

Here's one that catches everyone out. `int()` can't read text with a decimal point:

```python
print(int("3.5"))
# ValueError: invalid literal for int() with base 10: '3.5'
```

For text with a decimal point, use `float()` instead: `float("3.5")` gives `3.5`.

A few spaces around the digits are fine, though. Python ignores them:

```python
print(int("  42  "))  # prints: 42
print(int("-7"))  # prints: -7
```

Later, in [chapter 18](../18-error-handling/notes.md), you'll learn how to catch errors like this and ask the user to try again, instead of letting your program crash.

### `int()` cuts off, it doesn't round

When you turn a `float` into an `int`, Python simply chops off everything after the decimal point:

```python
print(int(3.9))  # prints: 3
print(int(3.1))  # prints: 3
print(int(-3.9))  # prints: -3
```

`3.9` is very nearly 4, but `int()` gives `3`. It doesn't round, it cuts. If you want proper rounding, there's a `round()` function, and you'll meet it in [chapter 05](../05-numbers-and-math/notes.md).

### Booleans: `True` or `False`

A **boolean** (`bool`) has only two possible values: `True` and `False`. Think of a light switch: it's either on or off, nothing in between. (It's named after George Boole, a mathematician who worked out the math of true and false.)

Booleans are perfect for yes/no facts:

```python
is_open = True
has_ticket = False
print(is_open, has_ticket)  # prints: True False
print(type(is_open))  # prints: <class 'bool'>
```

Two things to remember:

- **They start with a capital letter.** `True` and `False`, never `true` or `false`.
- **They never go in quotes.** With quotes, you get a string that just happens to spell the word.

```python
print(type(True))  # prints: <class 'bool'>
print(type("True"))  # prints: <class 'str'>
```

> **Tip:** Boolean names often start with `is_`, `has_` or `can_`, like `is_raining`, `has_paid` or `can_vote`. They read like yes/no questions.

So far you've typed `True` and `False` yourself. Most booleans come from questions like "Is 10 bigger than 5?" You'll learn to ask those in [chapter 04](../04-operators/notes.md), and to make decisions with the answers in [chapter 08](../08-conditionals/notes.md).

### `None`: "nothing here"

Sometimes a value doesn't exist, or isn't known yet. A customer has no coupon code. A delivery date hasn't been decided. For that, Python has a special value: `None`.

```python
coupon_code = None  # the customer has no coupon
delivery_date = None  # not decided yet

print(coupon_code)  # prints: None
print(type(delivery_date))  # prints: <class 'NoneType'>

delivery_date = "Friday"  # now it's decided
print(delivery_date)  # prints: Friday
```

`None` is not zero, and it's not an empty string. It's its own thing: an empty box with a note inside saying "nothing here". And like `True` and `False`, it starts with a capital letter.

You can't do math with nothing:

```python
print(None + 1)
# TypeError: unsupported operand type(s) for +: 'NoneType' and 'int'
```

If you ever see `NoneType` in an error message, it means one of your variables held `None` when you expected a real value.

> **If you did the JavaScript course:** JavaScript has two kinds of nothing, `undefined` and `null`. Python keeps it simple and has just one: `None`.

### A variable can hold any type

In some languages, like Java or C#, you pick a type for each variable when you create it, and it can never hold anything else. Python doesn't work that way. It's **dynamically typed**: the same box can hold a number now and text later.

```python
answer = 42
print(type(answer))  # prints: <class 'int'>

answer = "forty-two"
print(type(answer))  # prints: <class 'str'>
```

This freedom is handy, but it can also lead to confusing bugs. A good habit: keep each variable to one type. (In [chapter 25](../25-type-hints/notes.md), you'll learn how to label what type a variable should hold, so VS Code can warn you when it changes.)

## Common mistakes

**1. Adding numbers that are really text**

```python
morning_steps = "4000"
evening_steps = "3500"
print(morning_steps + evening_steps)  # prints: 40003500
```

Both values are strings, so `+` joins them instead of adding. No error, just a silly answer. Convert them first: `int(morning_steps) + int(evening_steps)` gives `7500`.

**2. Joining text and a number with `+`**

```python
age = 25
print("Age: " + age)
# TypeError: can only concatenate str (not "int") to str
```

`+` can't join a `str` and an `int`. Either convert the number with `str(age)`, or use a comma instead: `print("Age:", age)`.

**3. Small letters on `True`, `False` or `None`**

```python
is_open = true
# NameError: name 'true' is not defined. Did you mean: 'True'?
```

With a small letter, Python thinks `true` is the name of a variable you never created. These three words always start with a capital.

**4. Putting `True` or `False` in quotes**

```python
is_member = "False"
print(type(is_member))  # prints: <class 'str'>
```

It looks like a boolean, but it's a string. That difference will matter a lot when you start making decisions in [chapter 08](../08-conditionals/notes.md). Fix: `is_member = False`.

**5. Using `int()` on text with a decimal point**

```python
price = int("3.5")
# ValueError: invalid literal for int() with base 10: '3.5'
```

`int()` only reads whole numbers. Use `float("3.5")` for decimals.

**6. Trusting what `print()` shows you**

```python
score = "10"
print(score)  # prints: 10
```

It looks like a number, but it's a string: `print()` doesn't show the quotes. When a result seems odd, check with `print(type(score))`.

## Quick recap

- Every value has a type. The five basic ones are `str` (text), `int` (whole numbers), `float` (decimal numbers), `bool` (`True` or `False`) and `None` ("nothing here").
- `type()` tells you a value's type. Use it whenever a result looks strange.
- `+` adds numbers but joins strings. Python refuses to mix them: `"25" + 1` is a `TypeError`.
- Convert with `int()`, `float()` and `str()`. Text that isn't a number gives a `ValueError`, and `int()` cuts off decimals instead of rounding.
- Mixing an `int` and a `float` gives a `float`, and `/` always gives a `float`.
- `True`, `False` and `None` start with a capital letter and never go in quotes.

---

**Next:** try the [exercises](exercises.md), then move on to [04 Operators](../04-operators/notes.md).
