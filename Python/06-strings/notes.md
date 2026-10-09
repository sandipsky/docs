# 06 Strings

## What is it?

A **string** is a piece of text: a name, a password, a chat message, a whole paragraph. Python calls the type `str`. You've used strings since [chapter 01](../01-getting-started/notes.md) (text inside quotes), and you met them as a data type in [chapter 03](../03-data-types/notes.md).

This chapter is about *working* with text: building it, measuring it, cutting it into pieces, cleaning it up, searching it, and lining it up neatly with **f-strings**.

## Why does it matter?

Almost everything people type or read in an app is a string. Names, emails, search boxes, product codes, receipts.

And people type messy things. They add spaces by accident. They mix up capital letters. To a human, `"  Sam@Gmail.COM "` and `"sam@gmail.com"` are the same email. To Python, they're two completely different strings.

There's also some unfinished business from [chapter 05](../05-numbers-and-math/notes.md). Printing a price gave you `4.5` instead of `4.50`, and building a sentence from several values gets clumsy fast:

```python
name = "Aisha"
nights = 3
price = 4.5

print("Welcome,", name, "! You're staying", nights, "nights.")
print("Price:", price)
```

You'll see:

```
Welcome, Aisha ! You're staying 3 nights.
Price: 4.5
```

There's an ugly space before the `!`, and the price looks wrong. By the end of this chapter, you'll print `Welcome, Aisha! You're staying 3 nights.` and `Price: 4.50`, and you'll be able to clean up, check and slice any text people type.

## Real-world example

Think of a string as a strip of tape from a **label maker**.

| Label maker | Python string |
|---|---|
| Letters printed in order on a strip | Characters in order: `"COFFEE"` |
| Measuring how long the strip is | `len("COFFEE")` |
| Pointing at the 1st, 2nd, 3rd letter | Positions `[0]`, `[1]`, `[2]` (counting starts at 0) |
| Cutting off a piece of the strip | Slicing: `"COFFEE"[0:3]` is `"COF"` |
| Once it's printed, you can't change a letter | A string can't be changed |
| Want a different label? Print a new strip | String tools always give you a *new* string |

Keep that last row in mind. It explains the most common string mistake, and you'll see it again at the end of this chapter.

## How it works

### Quotes: a quick refresher

You can write a string with double quotes or single quotes. Both make exactly the same kind of string:

```python
city = "Kathmandu"
food = 'momo'
print(city, food)  # prints: Kathmandu momo
```

The quotes aren't part of the text. They only show where it starts and ends. This course uses double quotes by default. Single quotes are handy when the text itself contains a double quote, and the other way round:

```python
print("It's raining")       # prints: It's raining
print('She said "hello"')   # prints: She said "hello"
```

### f-strings: putting values inside text

So far you've built messages with commas or with `+`. Both work, but both get messy:

```python
guest = "Aisha"
nights = 3

print("Welcome,", guest, "! You're staying", nights, "nights.")
print("Welcome, " + guest + "! You're staying " + str(nights) + " nights.")
```

You'll see:

```
Welcome, Aisha ! You're staying 3 nights.
Welcome, Aisha! You're staying 3 nights.
```

The comma version adds a space you don't want. The `+` version is a jungle of quotes and plus signs, and it needs `str()` around every number, or you get the `TypeError` from chapter 03.

An **f-string** fixes both. Put the letter `f` right before the opening quote. Then, anywhere inside the text, curly braces `{ }` become a slot where Python drops in a value:

```python
guest = "Aisha"
nights = 3

print(f"Welcome, {guest}! You're staying {nights} nights.")
# prints: Welcome, Aisha! You're staying 3 nights.
```

It reads almost like the finished sentence. Think of `{ }` as a blank on a form that Python fills in for you. Numbers go in without any `str()`: the f-string turns them into text by itself. (The "f" stands for "formatted".)

You can put any calculation inside the braces, not only a variable:

```python
price_per_night = 85
nights = 3
print(f"Total: ${price_per_night * nights}")  # prints: Total: $255
```

The `$` is a normal dollar sign here. Only the curly braces are special.

You can even call functions inside the braces:

```python
name = "Sandip"
print(f"{name} has {len(name)} letters.")  # prints: Sandip has 6 letters.
```

(You'll meet `len()` properly in a moment.)

> **From now on**, this course uses f-strings whenever it prints values with text. They're what Python developers use every day. They've been in Python since version 3.6, so any Python you install today has them.

> **If you did the [JavaScript course](../../JavaScript/README.md):** f-strings are Python's version of template literals. `` `Hi ${name}` `` in JavaScript is `f"Hi {name}"` in Python: an `f` in front, normal quotes, and no `$` before the braces.

### Escape characters

What if you need a double quote *inside* a double-quoted string? Or a new line in the middle of your text?

You use an **escape character**: a backslash `\` that gives the next character a special meaning.

| You type | You get |
|---|---|
| `\n` | a new line |
| `\t` | a tab (a wide space) |
| `\"` | a `"` inside a double-quoted string |
| `\'` | a `'` inside a single-quoted string |
| `\\` | one real backslash |

```python
print("Shopping list:\n- milk\n- eggs")
```

You'll see:

```
Shopping list:
- milk
- eggs
```

```python
print("She said \"hello\"")  # prints: She said "hello"
print("Backslash: \\")       # prints: Backslash: \
```

The backslash and the letter after it count as *one* character. `"a\nb"` is three characters: `a`, a new line, and `b`.

### Windows paths and raw strings

Windows file paths are full of backslashes, and that causes trouble. Look at this path:

```python
print("C:\new\table")
```

You'll see:

```
C:
ew	able
```

Python read `\n` in `\new` as "new line", and `\t` in `\table` as a tab. The path is ruined, and Python didn't even warn you.

Some backslash combinations are so wrong that Python refuses to run the file at all. `\U` is one of them:

```python
print("C:\Users\Sam\notes.txt")
# SyntaxError: (unicode error) 'unicodeescape' codec can't decode bytes in position 2-3: truncated \UXXXXXXXX escape
```

Scary message, simple cause: `\U` has a special meaning, and `\Users` isn't what Python expected after it. There are two fixes. Write every real backslash as `\\`, or put the letter `r` in front of the string to make a **raw string**, where backslashes are just backslashes:

```python
print("C:\\Users\\Sam\\notes.txt")  # prints: C:\Users\Sam\notes.txt
print(r"C:\Users\Sam\notes.txt")    # prints: C:\Users\Sam\notes.txt
```

The `r` stands for "raw". You won't need raw strings often, but they're perfect for Windows paths. (In [chapter 20](../20-files-and-folders/notes.md) you'll learn an even easier way to handle paths.)

### Multi-line strings

Three quotes in a row, `"""`, start a **triple-quoted string**. It can run over several lines, and the line breaks become part of the text:

```python
poem = """Roses are red,
Violets are blue,
Python is fun,
And so are you."""

print(poem)
```

You'll see:

```
Roses are red,
Violets are blue,
Python is fun,
And so are you.
```

Triple quotes are great for longer text like a menu, a help message or an email template. You can put `"` and `'` inside them freely, too.

### Measuring with `len()`

Every string has a length: how many characters it holds. A **character** is one letter, digit, space or symbol. The built-in function `len()` counts them:

```python
word = "pizza"

print(len(word))        # prints: 5
print(len("New York"))  # prints: 8 (the space counts too)
print(len(""))          # prints: 0 (an empty string)
```

`""` with nothing between the quotes is an **empty string**: a string with no characters at all. It's still a string, like an empty box is still a box.

### Indexing: one character at a time

Each character has a position number, called its **index**. Counting starts at 0, not 1:

```
 p   i   z   z   a
[0] [1] [2] [3] [4]
```

Put the index in square brackets to read one character:

```python
word = "pizza"

print(word[0])  # prints: p
print(word[1])  # prints: i
print(word[4])  # prints: a
```

Why start at 0? Think of the index as "how many steps from the start". The first character is 0 steps away. Most programming languages count this way, and you'll get used to it quickly.

Because counting starts at 0, the last character of `"pizza"` is at index 4, not 5. Ask for a position that doesn't exist, and Python stops with an error:

```python
word = "pizza"
print(word[5])
# IndexError: string index out of range
```

**Negative indexes** count from the end. `-1` is the last character, `-2` the one before it, and so on:

```
 p   i   z   z   a
[-5][-4][-3][-2][-1]
```

```python
word = "pizza"

print(word[-1])  # prints: a
print(word[-2])  # prints: z
```

`word[-1]` is the easy way to get the last character, whatever the length of the string.

### Slicing: cutting out a piece

A **slice** copies part of a string. You write `[start:stop]`. It starts at `start` and stops *just before* `stop`. The character at `stop` isn't included:

```
 2   0   2   6   -   1   0   -   0   9
[0] [1] [2] [3] [4] [5] [6] [7] [8] [9]
```

```python
date = "2026-10-09"

print(date[0:4])  # prints: 2026
print(date[5:7])  # prints: 10
print(date[8:10]) # prints: 09
```

A nice way to remember it: `[0:4]` gives you 4 - 0 = 4 characters.

You can leave out either side. No start means "from the beginning". No stop means "to the end":

```python
date = "2026-10-09"

print(date[:4])   # prints: 2026
print(date[8:])   # prints: 09
print(date[-2:])  # prints: 09 (the last two characters)
```

Slices are forgiving. If you ask for more than there is, you just get what's there, with no error:

```python
word = "pizza"
print(word[0:50])  # prints: pizza
```

A slice can take a third number, the **step**: how far to jump each time. `[::2]` means "the whole string, every second character", and a step of `-1` walks backwards, which reverses the string:

```python
word = "pizza"

print(word[::2])   # prints: pza
print(word[::-1])  # prints: azzip
```

You won't use the step often, but `[::-1]` is a famous Python trick for reversing text.

### Strings can't be changed

Back to the label maker. Once a label is printed, you can't swap one of its letters. Strings are the same: they're **immutable**, which means "can't be changed".

```python
pet = "cat"
pet[0] = "b"
# TypeError: 'str' object does not support item assignment
```

"Item assignment" means putting a new value at one position. Strings don't allow it. What you *can* do is build a brand-new string and put it in the variable. That's like printing a new label:

```python
pet = "cat"
pet = "b" + pet[1:]
print(pet)  # prints: bat
```

`pet[1:]` is `"at"`, so the new string is `"b"` + `"at"`.

### Methods: tools that belong to a string

Strings come with lots of built-in tools called **methods**. A method is a function that belongs to a value. You call it with a dot, its name, and brackets:

```python
greeting = "Hello, World"

print(greeting.upper())  # prints: HELLO, WORLD
print(greeting.lower())  # prints: hello, world
print("sandip shakya".title())  # prints: Sandip Shakya
```

- `upper()` makes every letter a capital.
- `lower()` makes every letter small.
- `title()` gives each word a capital first letter, like a book title.

Compare `len(word)` with `word.upper()`. `len()` is a normal function: the value goes *inside* the brackets. `upper()` is a method: the value goes *before the dot*. You'll get a feel for which is which as you use them.

Here's the important part. Because strings can't be changed, a method never changes the original string. It gives you back a **new** string:

```python
username = "sam"
loud_name = username.upper()

print(loud_name)  # prints: SAM
print(username)   # prints: sam
```

The original is untouched. If you want to keep the result, save it in a variable (a new one, or the same one: `username = username.upper()`).

### Cleaning up spaces with `strip()`

People often type extra spaces by accident, especially before or after an email address. `strip()` removes spaces from both ends, but never from the middle:

```python
typed_email = "   sam@example.com  "

print(f"[{typed_email}]")          # prints: [   sam@example.com  ]
print(f"[{typed_email.strip()}]")  # prints: [sam@example.com]
```

The square brackets are only there so you can *see* the spaces. It's a handy trick when you're checking text.

`strip()` also removes tabs and new lines from the ends, which matters when you read text that people type ([chapter 07](../07-input-and-output/notes.md)) or text from files ([chapter 20](../20-files-and-folders/notes.md)). If you only want to clean one side, use `lstrip()` (left) or `rstrip()` (right):

```python
padded = "  hi  "
print(f"[{padded.lstrip()}]")  # prints: [hi  ]
print(f"[{padded.rstrip()}]")  # prints: [  hi]
```

### Replacing text

`replace(old, new)` swaps every match of `old` for `new`:

```python
phone = "555-123-4567"

print(phone.replace("-", ""))   # prints: 5551234567
print(phone.replace("-", " "))  # prints: 555 123 4567
```

It's case-sensitive, so only exact matches are swapped:

```python
sentence = "I like cats. Cats are great."
print(sentence.replace("cats", "dogs"))  # prints: I like dogs. Cats are great.
```

`"Cats"` with a capital C didn't match `"cats"`, so it stayed.

> **If you did the JavaScript course:** JavaScript's `replace` only swaps the first match. Python's `replace` swaps them all.

### Searching: `find()`, `count()` and `in`

**`find(text)`** tells you *where* something is. It gives the index of the first match, or `-1` if there's no match at all:

```python
email = "sam@example.com"

print(email.find("@"))  # prints: 3
print(email.find("e"))  # prints: 4 (only the first "e" counts)
print(email.find("#"))  # prints: -1 (not found)
```

**`count(text)`** tells you *how many times* it appears:

```python
email = "sam@example.com"
print(email.count("e"))  # prints: 2
```

**`in`** answers a simple yes/no question: is this text anywhere inside? It's not a method but an operator, like `==`, so there's no dot and no brackets:

```python
email = "sam@example.com"

print("@" in email)          # prints: True
print("gmail" in email)      # prints: False
print("gmail" not in email)  # prints: True
```

`not in` is the opposite: `True` when the text is missing.

`find()` gets really useful when you combine it with slicing. You don't know where the `@` in an email will be, but you can ask:

```python
email = "sam@example.com"
at_position = email.find("@")

print(email[:at_position])      # prints: sam
print(email[at_position + 1:])  # prints: example.com
```

Everything before the `@` is the username. Everything after it is the domain. This works for any email, however long.

### Checking text: `startswith()`, `endswith()` and `isdigit()`

These methods answer yes/no questions too, so they give you `True` or `False`:

```python
file_name = "holiday-photo.jpg"

print(file_name.startswith("holiday"))  # prints: True
print(file_name.endswith(".jpg"))       # prints: True
print(file_name.endswith(".pdf"))       # prints: False
```

**`isdigit()`** checks whether *every* character is a digit from 0 to 9:

```python
print("25".isdigit())   # prints: True
print("2.5".isdigit())  # prints: False (the dot isn't a digit)
print("-5".isdigit())   # prints: False (neither is the minus sign)
print("abc".isdigit())  # prints: False
print("".isdigit())     # prints: False (an empty string has no digits at all)
```

This will matter soon. When people type a number into your program, it arrives as text. `isdigit()` lets you check that text before you turn it into an `int` with `int()`. You'll see that in [chapter 07](../07-input-and-output/notes.md), and act on the answer in [chapter 08](../08-conditionals/notes.md).

> **Watch out:** all of these are case-sensitive. `"Hello".startswith("hello")` is `False`, because `H` and `h` are different characters.

### Splitting and joining

**`split(separator)`** cuts a string wherever it finds the separator:

```python
groceries = "milk,eggs,bread"
print(groceries.split(","))  # prints: ['milk', 'eggs', 'bread']
```

The result isn't a string. The square brackets show it's a **list**: several values kept together in order. Python shows the text inside it with single quotes. You'll learn to work with lists in [chapter 11](../11-lists/notes.md). For now, just know that `split()` is how you turn text into a list.

With no separator at all, `split()` cuts at any run of spaces, and ignores spaces at the ends. That's perfect for splitting a sentence into words:

```python
print("The quick brown fox".split())    # prints: ['The', 'quick', 'brown', 'fox']
print("  lots   of   space  ".split())  # prints: ['lots', 'of', 'space']
```

**`join()`** goes the other way. It glues a list of strings together into one string. The odd part is that you call it *on the glue*:

```python
print(", ".join(["milk", "eggs", "bread"]))  # prints: milk, eggs, bread
print("-".join(["2026", "10", "09"]))        # prints: 2026-10-09
```

Read `", ".join(...)` as "join these together, with a comma and a space between each one". Together, `split()` and `join()` can swap one separator for another:

```python
groceries = "milk,eggs,bread"
print(" | ".join(groceries.split(",")))  # prints: milk | eggs | bread
```

### Chaining methods

Every string method gives you a new string. So you can call another method straight on the result. This is called **method chaining**:

```python
typed_email = "   Sam@Example.COM  "
clean_email = typed_email.strip().lower()

print(clean_email)  # prints: sam@example.com
```

Read it from left to right, like a car wash with several stations:

1. `typed_email` is the dirty car: `"   Sam@Example.COM  "`
2. `.strip()` washes off the spaces: `"Sam@Example.COM"`
3. `.lower()` polishes the capitals: `"sam@example.com"`

Here's a chain that turns a full name into a username:

```python
full_name = "  Priya Sharma "
username = full_name.strip().lower().replace(" ", ".")

print(username)  # prints: priya.sharma
```

### Formatting numbers in f-strings

Now for the fix you've been waiting for since chapter 05. Inside the braces of an f-string, you can add a colon `:` and a **format spec**: a short code that says how the value should look.

The most useful one is `.2f`, which means "show exactly 2 decimal places":

```python
price = 4.5
print(f"Price: ${price:.2f}")  # prints: Price: $4.50

total = 0.1 + 0.2
print(f"Total: {total}")      # prints: Total: 0.30000000000000004
print(f"Total: {total:.2f}")  # prints: Total: 0.30
```

Read `{price:.2f}` as "the value of `price`, shown with 2 decimals". The `.2` is the number of decimals, and the `f` stands for "fixed-point", a fancy name for a normal decimal number. Change the number for more or fewer decimals:

```python
print(f"{3.14159:.3f}")  # prints: 3.142
print(f"{3.14159:.1f}")  # prints: 3.1
```

It rounds for display, and adds zeros when it needs to. The value stored in your variable doesn't change at all.

> **Tip:** `round(price, 2)` from chapter 05 gives you a *number* to keep calculating with. `{price:.2f}` gives you *text* for showing. So do your math first, and format at the very end, right inside the f-string.

**Thousands separators.** A comma in the format spec adds commas between groups of three digits. You can combine it with `.2f`:

```python
population = 8_100_000_000
print(f"{population:,}")       # prints: 8,100,000,000
print(f"{1234567.891:,.2f}")  # prints: 1,234,567.89
```

**Padding with zeros.** `02` means "at least 2 characters wide, filled with zeros". It's perfect for clocks:

```python
hours = 2
minutes = 7
print(f"Time: {hours}:{minutes:02}")  # prints: Time: 2:07
```

### Lining things up in columns

A format spec can also set a **width**: how many characters wide the value should be. Python fills the rest with spaces. Then `<`, `>` and `^` choose where the value sits inside that space:

```python
name = "Sandip"

print(f"[{name:<10}]")  # prints: [Sandip    ]
print(f"[{name:>10}]")  # prints: [    Sandip]
print(f"[{name:^10}]")  # prints: [  Sandip  ]
```

- `<10`: left-aligned in 10 characters.
- `>10`: right-aligned in 10 characters.
- `^10`: centred in 10 characters.

If you give only a width, text goes on the left and numbers go on the right, which is usually what you want:

```python
name = "Sandip"
print(f"[{name:10}]")  # prints: [Sandip    ]
print(f"[{25:10}]")    # prints: [        25]
```

You can put a width and decimals together. `>8.2f` means "right-aligned, 8 characters wide, 2 decimals":

```python
total = 20.5
print(f"[{total:>8.2f}]")  # prints: [   20.50]
```

This is how receipts and tables line up. Give every column the same width on every line:

```python
latte = 4.5
croissant = 3.25
muffin = 2.75

print(f"{'Item':<12}{'Qty':>5}{'Total':>10}")
print("-" * 27)
print(f"{'Latte':<12}{2:>5}{latte * 2:>10.2f}")
print(f"{'Croissant':<12}{1:>5}{croissant * 1:>10.2f}")
print(f"{'Muffin':<12}{3:>5}{muffin * 3:>10.2f}")
print("-" * 27)
print(f"{'Total':<17}{latte * 2 + croissant + muffin * 3:>10.2f}")
```

You'll see:

```
Item          Qty     Total
---------------------------
Latte           2      9.00
Croissant       1      3.25
Muffin          3      8.25
---------------------------
Total                 20.50
```

A few things to notice:

- `'Item'` inside the braces is a plain string. It uses single quotes, so Python doesn't think the f-string has ended. (Python 3.12 and newer also allow double quotes there, but single quotes work in every version.)
- Each row is 12 + 5 + 10 = 27 characters wide, so the dashed line is `"-" * 27` (string repetition from chapter 04).
- The `Total` row has no Qty column, so its label gets 12 + 5 = 17 characters.

You can also choose the **fill character**. Put it just before the `<`, `>` or `^`. Dots make a classic menu:

```python
print(f"{'Pizza':.<15}{9.5:>6.2f}")
print(f"{'Garlic bread':.<15}{4.25:>6.2f}")
```

You'll see:

```
Pizza..........  9.50
Garlic bread...  4.25
```

### Comparing strings

`==` checks whether two strings are exactly the same, character for character. That includes capital letters:

```python
print("apple" == "apple")  # prints: True
print("Apple" == "apple")  # prints: False
```

So when you compare something a person typed, clean it up first. Imagine a quiz where the answer is "paris":

```python
typed_answer = "PARIS"

print(typed_answer == "paris")          # prints: False
print(typed_answer.lower() == "paris")  # prints: True
```

You can also use `<` and `>` to check alphabetical order. But there are two surprises:

```python
print("apple" < "banana")  # prints: True (a comes before b)
print("Zoe" < "adam")      # prints: True (surprise!)
print("10" < "9")          # prints: True (surprise!)
```

Python compares strings one character at a time, using a code number for each character. In that code, **all capital letters come before all lowercase letters**. So `"Z"` comes before `"a"`.

And `"10"` vs `"9"` is text, not numbers. The first characters are `"1"` and `"9"`, and `"1"` comes first, so Python stops there. If you mean numbers, convert them first with `int()` from [chapter 03](../03-data-types/notes.md).

## Common mistakes

**1. Forgetting to save the result**

```python
city = "  london "
city.strip()
city.title()

print(f"[{city}]")  # prints: [  london ]
```

Nothing changed! Strings can't be changed, so `strip()` and `title()` made new strings... and then threw them away. Save the result: `city = city.strip().title()`.

**2. Forgetting the `f`**

```python
guest = "Aisha"
print("Welcome, {guest}!")  # prints: Welcome, {guest}!
```

Without the `f` in front, the braces are just ordinary characters. Python prints them exactly as typed. Fix: `print(f"Welcome, {guest}!")`.

**3. Counting from 1 instead of 0**

```python
word = "pizza"
print(word[1])  # prints: i
```

The first character is at index 0, so `word[1]` is the *second* one. And remember that a slice stops *before* the stop index: `word[0:2]` is `"pi"`, not `"piz"`. Ask for an index past the end, like `word[5]`, and you get `IndexError: string index out of range`.

**4. Forgetting the brackets on a method**

```python
name = "sandip"
print(name.upper)  # prints something like: <built-in method upper of str object at 0x000001787FC5B960>
```

Without the `()`, Python doesn't run the method. It shows you the method itself (the long number is a memory address, and yours will be different). Fix: `name.upper()`. The same goes the other way: `len` is a normal function, so it's `len(name)`, not `name.len()`.

**5. Using a number format on text**

```python
price = "4.5"
print(f"{price:.2f}")
# ValueError: Unknown format code 'f' for object of type 'str'
```

`.2f` only works on numbers, and `"4.5"` in quotes is text. Turn it into a number first: `f"{float(price):.2f}"`. This one will bite you in [chapter 07](../07-input-and-output/notes.md), where everything people type arrives as text.

**6. Gluing text and numbers with `+`**

```python
age = 25
print("Age: " + age)
# TypeError: can only concatenate str (not "int") to str
```

**Concatenate** means "join strings end to end". `+` can only join a string to another string. You could write `"Age: " + str(age)`, but an f-string is simpler and needs no conversion: `print(f"Age: {age}")`.

## Quick recap

- A string is text in quotes. Escape characters start with a backslash (`\n` new line, `\t` tab, `\"` a quote), and a raw string `r"..."` treats backslashes as plain characters. Triple quotes `"""..."""` span several lines.
- `len()` counts characters. Indexes start at 0, and negative indexes count from the end: `word[-1]` is the last character.
- Slicing copies a piece: `text[start:stop]` stops *before* `stop`. Leave out either side to go from the start or to the end. `[::-1]` reverses.
- Strings can't be changed. Every method returns a **new** string, so save the result.
- Key methods: `upper`, `lower`, `title`, `strip`, `replace`, `find`, `count`, `startswith`, `endswith`, `isdigit`, `split` and `join`. Use `in` to check whether text contains something.
- f-strings put values into text: `f"Hello, {name}!"`. Anything can go inside the braces, even a calculation.
- Format specs go after a colon: `{price:.2f}` (2 decimals), `{n:,}` (thousands commas), `{name:<10}` and `{total:>8.2f}` (columns), `{minutes:02}` (zero padding).

---

**Next:** try the [exercises](exercises.md), then move on to [07 Input and Output](../07-input-and-output/notes.md).
