# 07 Input and Output

## What is it?

**Input** is information that goes *into* your program while it runs, like a name someone types. **Output** is what comes *out*, like the text your program prints.

You've been doing output since chapter 01 with `print()`. This chapter adds the other half: `input()`, which asks the person at the keyboard a question and waits for their answer. You'll also learn a few `print()` extras for tidier answers.

## Why does it matter?

Until now, every value lived inside your code:

```python
name = "Sandip"
age = 25
print(f"Hi {name}! Next year you'll be {age + 1}.")
```

That program only ever greets Sandip. To greet anyone else, you have to open the file and change it. Real programs don't work like that. A cash machine asks for your PIN. A quiz asks for your answer. A shop asks how many you want. The program stays the same, and the person using it supplies the values.

With `input()`, the same file works for everyone:

```python
name = input("What's your name? ")
age = int(input("How old are you? "))
print(f"Hi {name}! Next year you'll be {age + 1}.")
```

When you run it, it asks, waits, and answers:

```
What's your name? Maya
How old are you? 31
Hi Maya! Next year you'll be 32.
```

## Real-world example

Think of ordering at a cafe counter:

| At the cafe counter | In Python |
|---|---|
| The cashier asks "What can I get you?" | The **prompt**: `input("What can I get you? ")` |
| The cashier waits until you answer | The program pauses until you press Enter |
| They write your answer on the cup, exactly as you said it | `input()` gives back exactly what you typed, as text |
| "Two" scribbled on a cup isn't a number the till can add | `"2"` is text until you convert it with `int()` |
| The till works out the price | Your calculation |
| You get a receipt | `print()` |

Keep the third and fourth rows in mind. They're behind almost every beginner mistake with `input()`.

## How it works

### Your first `input()`

```python
name = input("What's your name? ")
print(f"Hello, {name}!")
```

Run it, and you'll see the question. The program stops there, with a blinking cursor, and waits for you. Type your name and press Enter:

```
What's your name? Sandip
Hello, Sandip!
```

(In the boxes in this chapter, the text right after a question is what the person typed. Python doesn't print it; you see it because you typed it.)

Here's what happens, step by step:

1. Python prints the text in the brackets, called the **prompt**.
2. It waits while you type.
3. When you press Enter, `input()` gives back everything you typed (without the Enter) as a string.
4. `name = ...` saves that string in a variable, so you can use it later.

Notice the space at the end of the prompt, after the question mark. Without it, your typing sticks to the question:

```python
name = input("What's your name?")
```

```
What's your name?Sandip
```

It still works, but it looks cramped. Always end a prompt with a space.

You can also call `input()` with nothing in the brackets. It still waits, but the person sees only a blinking cursor and has no idea what to type. Always give a prompt.

> **Tip:** if your program seems frozen, look at the terminal. It's probably waiting for you to type something and press Enter.

### `input()` always gives you a string

This is the most important rule in this chapter. Whatever the person types, even if it looks like a number, `input()` gives you a **string**:

```python
age = input("How old are you? ")
print(type(age))
print(age * 2)
```

```
How old are you? 25
<class 'str'>
2525
```

`age` is the text `"25"`, not the number 25. So `age * 2` repeats the text twice (string repetition from [chapter 04](../04-operators/notes.md)), giving `2525` instead of `50`. And adding a number fails completely:

```python
age = input("How old are you? ")
print(age + 1)
# TypeError: can only concatenate str (not "int") to str
```

Why doesn't Python just turn it into a number for you? Because the keyboard only ever sends characters, and Python refuses to guess (remember `"25" + 1` from [chapter 03](../03-data-types/notes.md)). Someone might type `25`, or `twenty-five`, or their phone number `007`, which only makes sense as text. Python leaves the decision to you.

### Converting input to numbers

To get a number, wrap the text in `int()` or `float()`, the converters from chapter 03:

```python
age_text = input("How old are you? ")
age = int(age_text)
print(f"Next year you'll be {age + 1}.")
```

```
How old are you? 25
Next year you'll be 26.
```

Most Python programmers do it in one line:

```python
age = int(input("How old are you? "))
print(f"Next year you'll be {age + 1}.")
```

Read it from the inside out, like brackets in math: first `input()` asks and gives back the text `"25"`, then `int()` turns that into the number `25`, then `=` stores it.

Use `float()` when the answer can have decimals:

```python
height = float(input("Your height in metres: "))
print(f"That's {height * 100:.0f} cm.")
```

```
Your height in metres: 1.75
That's 175 cm.
```

(`.0f` is the format spec from [chapter 06](../06-strings/notes.md) with zero decimals.)

How do you choose?

| The question is about... | Use | Examples |
|---|---|---|
| A count of whole things | `int()` | age, tickets, people, copies |
| A measurement or money | `float()` | height, weight, price, distance |

Good news: `int()` and `float()` don't mind spaces around the number. If someone types `  25  `, `int()` still gives you `25`.

### What if they type something that isn't a number?

People don't always type what you expect. Run the age program again and type `abc`:

```
How old are you? abc
Traceback (most recent call last):
  ...
ValueError: invalid literal for int() with base 10: 'abc'
```

The `...` stands for the lines in between, which point at your file. As always, read the last line first. A **literal** is a value written out as text, and "base 10" just means normal counting with the digits 0 to 9. So the message says: "`'abc'` isn't a whole number I can read." Your program crashes, and everything after that line never runs.

The same happens if someone types a decimal like `25.5` into `int()`, or just presses Enter without typing anything:

```
ValueError: invalid literal for int() with base 10: '25.5'
ValueError: invalid literal for int() with base 10: ''
```

That last one shows an empty string `''`: pressing Enter on its own gives you text with nothing in it.

For now, that's OK. These are your own practice programs, and you'll type sensible answers. You'll learn to check the input *before* converting it in [chapter 08](../08-conditionals/notes.md), and to catch errors like this and ask again in [chapter 18](../18-error-handling/notes.md).

### Cleaning up text input

People add spaces by accident, and they type capitals however they like. The string methods from [chapter 06](../06-strings/notes.md) clean that up. Chain them straight onto `input()`:

```python
name = input("Your name: ").strip().title()
print(f"Welcome, {name}!")
```

```
Your name:    sANDIP shakya 
Welcome, Sandip Shakya!
```

Cleaning matters most when you compare what someone typed. Here's a yes/no question:

```python
answer = input("Do you want a receipt? (yes/no) ")
clean_answer = answer.strip().lower()

print(f"You typed: [{answer}]")
print(f"Cleaned:   [{clean_answer}]")
print(f"Wants a receipt: {clean_answer == 'yes'}")
```

```
Do you want a receipt? (yes/no)   YES 
You typed: [  YES ]
Cleaned:   [yes]
Wants a receipt: True
```

The square brackets show the spaces that were really there (the trick from chapter 06). Without cleaning, `"  YES "` is not equal to `"yes"`, and the answer would be `False`.

> **Tip:** make cleaning a habit. Almost every time you read text with `input()`, add `.strip()`. Add `.lower()` too if you're going to compare it with something.

### A first look at checking input: `.isdigit()`

You met `isdigit()` in chapter 06. It tells you whether every character in a string is a digit, which is exactly what you want to know before calling `int()`:

```python
typed = input("How many tickets? ")
print(f"Is it a whole number? {typed.strip().isdigit()}")
```

Here are three different runs:

```
How many tickets? 3
Is it a whole number? True
```

```
How many tickets? three
Is it a whole number? False
```

```
How many tickets? 2.5
Is it a whole number? False
```

So your program can now *know* whether the input is safe to convert. What it can't do yet is act on that answer: "if it's a number, carry on, otherwise ask again". That needs `if`, which is exactly what [chapter 08](../08-conditionals/notes.md) teaches. You'll come back to this example there.

### `print()` extras: `sep` and `end`

Remember that `print()` can take several values, separated by commas? It puts a space between them:

```python
print("Tea", "coffee", "juice")  # prints: Tea coffee juice
```

That space is a setting called `sep` (short for "separator"), and you can change it:

```python
print("2026", "10", "09", sep="-")               # prints: 2026-10-09
print("milk", "eggs", "bread", sep=", ")         # prints: milk, eggs, bread
print("Rice", "Dal", "Curry", sep=" | ")         # prints: Rice | Dal | Curry
print("a", "b", "c", sep="")                     # prints: abc
```

`sep="-"` is a **keyword argument**: a value you pass to a function by name, so Python knows which setting it's for. You'll write functions with keyword arguments of your own in [chapter 10](../10-functions/notes.md).

`print()` also adds a new line at the end, so the next `print()` starts on a fresh line. That's another setting, called `end`. Change it to keep going on the same line:

```python
print("Loading", end="")
print("...")
```

```
Loading...
```

```python
print("one", end=" ")
print("two", end=" ")
print("three")
```

```
one two three
```

The last `print()` has the normal `end`, so the line finishes properly.

When should you use `sep` instead of an f-string? Use f-strings for sentences that mix text and values. Use `sep` when you're joining several values with the same thing between each one, like the date above.

### Blank lines

An empty `print()` prints a blank line. It's the easiest way to give your output some breathing room:

```python
print("Line one")
print()
print("Line three")
```

```
Line one

Line three
```

You can also put `\n` (new line, from chapter 06) inside a string. Two in a row make a blank line:

```python
print("Top\n\nBottom")
```

```
Top

Bottom
```

### Lining up the answers: a small receipt

The f-string alignment from chapter 06 works just as well with values people type in. Here's a one-line receipt:

```python
item = input("Item: ")
price = float(input("Price: "))
quantity = int(input("Quantity: "))
line_total = price * quantity

print()
print(f"{'Item':<12}{'Qty':>5}{'Total':>10}")
print("-" * 27)
print(f"{item:<12}{quantity:>5}{line_total:>10.2f}")
```

```
Item: Latte
Price: 4.50
Quantity: 2

Item          Qty     Total
---------------------------
Latte           2      9.00
```

The empty `print()` separates the questions from the answer, so the receipt is easy to spot. And whatever price you type, `.2f` shows exactly two decimals.

### Putting it together: a tip calculator

Most small programs follow the same three steps:

1. **Ask:** get the values with `input()`, and convert them straight away.
2. **Compute:** do the math with plain numbers.
3. **Answer:** print the results, nicely formatted.

Here's a tip calculator for splitting a restaurant bill:

```python
print("=== Tip Calculator ===")

# 1. Ask
bill = float(input("Bill amount: "))
tip_percent = int(input("Tip percent: "))
people = int(input("How many people? "))

# 2. Compute
tip = bill * tip_percent / 100
total = bill + tip
per_person = total / people

# 3. Answer
print()
print(f"{'Bill:':<12}{bill:>8.2f}")
print(f"{'Tip:':<12}{tip:>8.2f}")
print(f"{'Total:':<12}{total:>8.2f}")
print(f"{'Each pays:':<12}{per_person:>8.2f}")
```

```
=== Tip Calculator ===
Bill amount: 64.80
Tip percent: 15
How many people? 3

Bill:          64.80
Tip:            9.72
Total:         74.52
Each pays:     24.84
```

Run it a few times with different numbers. The code never changes, but the answers do. That's the whole point of input.

Notice how the three steps are kept apart, with a comment above each. When something goes wrong, you'll know where to look: a crash in step 1 means bad input, a wrong number in step 2 means a math mistake, and messy output means step 3.

## Common mistakes

**1. Doing math before converting**

```python
year = input("What year were you born? ")
print(2026 - year)
# TypeError: unsupported operand type(s) for -: 'int' and 'str'
```

An **operand** is a value on either side of an operator like `-`. Python is saying: "you asked me to subtract a string from a number, and I can't". The fix is to convert first: `year = int(input("What year were you born? "))`. Multiplying text gives a different message, `TypeError: can't multiply sequence by non-int of type 'float'`, but it's the same mistake.

**2. Using `int()` for a decimal**

```python
price = int(input("Price: "))
# ValueError: invalid literal for int() with base 10: '4.50'
```

That's what you get when someone types `4.50`. `int()` only reads whole numbers. Use `float()` for anything that can have decimals, like prices and measurements.

**3. Forgetting to save the answer**

```python
input("What's your name? ")
print(f"Hello, {name}!")
# NameError: name 'name' is not defined
```

`input()` gave back the name, but nothing caught it, so it was thrown away. Always store the answer in a variable: `name = input("What's your name? ")`.

**4. No space at the end of the prompt**

```python
age = input("How old are you?")
```

```
How old are you?25
```

It works, but the answer is squashed against the question. End every prompt with a space: `"How old are you? "`.

**5. Comparing without cleaning**

```python
answer = input("Ready to order? (yes/no) ")
print(f"Ready: {answer == 'yes'}")
```

```
Ready to order? (yes/no) Yes
Ready: False
```

`"Yes"` with a capital Y is not the same string as `"yes"`. Clean before comparing: `answer.strip().lower() == 'yes'`.

**6. Converting things that only look like numbers**

```python
phone = int(input("Phone number: "))
print(phone)
```

```
Phone number: 0071234567
71234567
```

The leading zeros are gone, because the number 007 is just 7. Phone numbers, postcodes and PINs are made of digits, but you never do math with them. Keep them as strings.

## Quick recap

- `input("Prompt: ")` shows the prompt, waits for the person to type and press Enter, and gives back what they typed.
- `input()` **always** gives you a string. Convert with `int()` for whole numbers or `float()` for decimals before doing any math. If the text isn't a valid number, you get a `ValueError`.
- Clean text input with `.strip()`, and add `.lower()` before comparing it. `.isdigit()` tells you whether text is safe for `int()`; you'll act on that in chapter 08.
- `print()` puts `sep` between values (a space by default) and `end` after them (a new line by default). You can change both.
- `print()` on its own prints a blank line.
- Small programs follow three steps: ask, compute, answer. Line up the answers with f-string format specs.

---

**Next:** try the [exercises](exercises.md), then move on to [08 Conditionals](../08-conditionals/notes.md).
