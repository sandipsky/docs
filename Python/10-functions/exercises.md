# 10 Functions: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.py`, `ex2.py`, and so on).
- Run each one with `python ex1.py` from a terminal opened in this folder.
- Give every function a one-line docstring. Unless an exercise says otherwise, make functions **return** their answers, and do the printing outside them.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Temperature converter

You're planning a trip, and the weather apps keep mixing up Celsius and Fahrenheit. Write two functions:

- `celsius_to_fahrenheit(celsius)`: the formula is F = C × 9 / 5 + 32
- `fahrenheit_to_celsius(fahrenheit)`: the formula is C = (F - 32) × 5 / 9

Each function must **return** the answer, rounded to 1 decimal place. Then call them to print:

```
0°C = 32.0°F
100°C = 212.0°F
37°C = 98.6°F
-40°C = -40.0°F
98.6°F = 37.0°C
451°F = 232.8°C
0°F = -17.8°C
```

(You can copy the `°` symbol from this page, or leave it out.)

<details>
<summary>Hint 1</summary>

In Python, × is `*`. Use brackets for the `(F - 32)` part, so the subtraction happens first.

</details>

<details>
<summary>Hint 2</summary>

`round()` from [chapter 05](../05-numbers-and-math/notes.md) takes a second number: how many decimal places to keep. Do the rounding inside the function, right in the `return` line.

</details>

---

## Exercise 2 (Easy): Workout tracker helpers

A fitness app needs three small helper functions. Each one takes the length of a workout in minutes:

- `format_duration(minutes)` returns a string like `"1h 30m"`
- `get_calories_burned(minutes)` returns the calories burned, at 8 calories per minute
- `is_long_workout(minutes)` returns `True` if the workout is 60 minutes or more, and `False` if not

Start with:

```python
workout_minutes = 90
```

Expected output:

```
Workout: 1h 30m
Calories burned: 720
Long workout: True
```

Change `workout_minutes` to `45`, and you should see:

```
Workout: 0h 45m
Calories burned: 360
Long workout: False
```

**Rule:** each function's body is just a docstring and a single `return` line. No `if`.

<details>
<summary>Hint 1</summary>

For the hours, how many whole times does 60 go into the minutes? For the leftover minutes, think remainder. Both operators are in [chapter 04](../04-operators/notes.md).

</details>

<details>
<summary>Hint 2</summary>

A comparison like `minutes >= 60` is already `True` or `False`, so you can return it directly. Look at `is_adult` in the notes.

</details>

---

## Exercise 3 (Medium): Bug hunt at the gym

This gym membership calculator has **4 bugs**. Copy it into `ex3.py`, run it, and fix one bug at a time.

```python
# Gym membership calculator
print_header()


def print_header():
    """Print the gym's name."""
    print("=== FitLife Gym ===")


def get_monthly_price(yearly_price):
    """Return the price per month."""
    print(yearly_price / 12)


def get_student_price(price):
    """Return the price with the 20% student discount."""
    price * 0.8


def format_price(amount):
    """Return an amount as a string like $50.00."""
    return f"${amount:.2f}"


def get_total_cost(monthly_price, months):
    """Return the cost of several months."""
    return monthly_price * months


yearly_price = 600
monthly_price = get_monthly_price(yearly_price)
student_price = get_student_price(monthly_price)

print(f"Yearly: {format_price(yearly_price)}")
print(f"Monthly: {format_price(monthly_price)}")
print(f"Student monthly: {format_price(student_price)}")
print(f"3 months: {format_price(get_total_cost(3))}")
```

When it's fixed, you should see exactly this (and nothing else):

```
=== FitLife Gym ===
Yearly: $600.00
Monthly: $50.00
Student monthly: $40.00
3 months: $150.00
```

<details>
<summary>Hint 1</summary>

The first error is a `NameError` about `print_header`, but the function is right there in the file! Remember that Python runs the file from top to bottom. Has it seen the `def` yet when it reaches that line?

</details>

<details>
<summary>Hint 2</summary>

Next, you'll see a lonely `50.0`, then `TypeError: unsupported operand type(s) for *: 'NoneType' and 'float'`. Something was `None` when it should have been a number. Follow it back: which function was supposed to hand that number over? Look again at "print vs return" in the notes.

</details>

<details>
<summary>Hint 3</summary>

`TypeError: unsupported format string passed to NoneType.__format__` means `format_price` was handed `None`. `format_price` itself is fine. Which function calculated the value it was given, and does that function actually return anything?

</details>

<details>
<summary>Hint 4</summary>

If you get `missing 1 required positional argument: 'months'`, count how many arguments `get_total_cost` expects, and how many it's getting.

</details>

---

## Exercise 4 (Medium): The coffee machine

Time to build the coffee machine from the notes! Write a function `order_coffee(drink, size)` that **returns** a message for the customer.

The menu:

| Drink | Price (medium) |
|---|---|
| `"espresso"` | $2.50 |
| `"latte"` | $3.50 |
| `"cappuccino"` | $3.75 |

A `"small"` costs $0.50 less, and a `"large"` costs $1.00 more.

**Rules:**

- If the customer doesn't say which drink, they get an espresso. If they don't say which size, it's a medium. Use default values for this.
- If the drink isn't on the menu, return `Sorry, we don't make DRINK.` (with the drink's name) straight away.
- The function must return the message, not print it.

Call it like this:

```python
print(order_coffee("latte", "large"))
print(order_coffee("cappuccino"))
print(order_coffee())
print(order_coffee("tea", "small"))
print(order_coffee(size="small", drink="latte"))
print(order_coffee(size="large"))
```

Expected output:

```
Here's your large latte. That's $4.50, please.
Here's your medium cappuccino. That's $3.75, please.
Here's your medium espresso. That's $2.50, please.
Sorry, we don't make tea.
Here's your small latte. That's $3.00, please.
Here's your large espresso. That's $3.50, please.
```

<details>
<summary>Hint 1</summary>

Default values go right in the brackets of the `def` line, with `=` and no spaces around it.

</details>

<details>
<summary>Hint 2</summary>

Set the base price with an `if`/`elif` chain (or `match`/`case`) on the drink. The final `else` is the perfect spot for the early `return` for drinks that aren't on the menu.

</details>

<details>
<summary>Hint 3</summary>

Once you have the base price, adjust it for the size with `-=` or `+=`. Then build the message with an f-string, using `:.2f` for the price.

</details>

---

## Exercise 5 (Challenge): Password strength checker

A sign-up page tells people how strong their new password is. Build it from small functions that work together:

- `count_digits(text)` returns how many digits (`0` to `9`) the text contains.
- `has_uppercase(text)` returns `True` if the text contains at least one capital letter.
- `get_password_strength(password)` returns `"weak"`, `"medium"` or `"strong"`:
  - **weak:** fewer than 8 characters
  - **strong:** at least 12 characters, at least one capital letter, **and** at least 2 digits
  - **medium:** everything else
- `mask_password(password)` returns the password with everything after the first 2 characters hidden by `*`. Real apps never show passwords on the screen, so `"Sunshine2026"` becomes `"Su**********"`.
- `print_strength(password)` prints the masked password and its strength.

Call `print_strength` with these passwords:

```python
print_strength("cat123")
print_strength("sunshine")
print_strength("Sunshine2026")
print_strength("sunshine2026")
print_strength("CorrectHorse9")
```

Expected output:

```
ca****: weak
su******: medium
Su**********: strong
su**********: medium
Co***********: medium
```

**Rules:**

- `get_password_strength` must use `count_digits` and `has_uppercase`.
- `print_strength` must use `mask_password` and `get_password_strength`.
- Only `print_strength` prints anything.

<details>
<summary>Hint 1</summary>

`count_digits` is the accumulator pattern from [chapter 09](../09-loops/notes.md): a counter before the loop, and `in "0123456789"` to test each character.

</details>

<details>
<summary>Hint 2</summary>

How can you tell if a character is a capital letter? A capital letter changes when you make it lowercase, and other characters don't. So compare the character with its `.lower()` version. And as soon as you find one capital, you can `return True` straight away, even from inside the loop, just like `has_digit` in the notes.

</details>

<details>
<summary>Hint 3</summary>

In `get_password_strength`, use guard clauses: check for "weak" first and return early. Then check the "strong" rules. Whatever is left is "medium".

</details>

<details>
<summary>Hint 4</summary>

For `mask_password`, you need the first 2 characters (a slice from [chapter 06](../06-strings/notes.md)), plus the right number of stars. `"*" * 3` is `"***"`, and `len()` tells you how many characters are left to hide.

</details>

---

## Before you move on

You checked five passwords with five separate lines of code. What if a website had 10,000 passwords to check? Or a shop had 500 products, or a class had 30 test scores? You'd want to keep them all together, in one variable, and loop over them.

That's called a list, and it's what [chapter 11](../11-lists/notes.md) is about.
