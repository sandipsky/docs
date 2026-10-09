# 06 Strings: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.py`, `ex2.py`, and so on).
- Run each one with `python ex1.py` from a terminal opened in this folder.
- Use f-strings for every line you print that mixes text and values.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Name badge

You're printing name badges for a running club event. People typed their names into a sign-up form all in lowercase. Start your file with:

```python
first_name = "sandip"
last_name = "shakya"
```

Print a badge with the name in title case, the initials, the name in capitals (for the loudspeaker announcement), and how many letters the name has (not counting the space).

Expected output:

```
Badge: Sandip Shakya
Initials: S.S.
Shout: SANDIP SHAKYA
Letters in name: 12
```

**Rule:** after the first two lines, don't type any part of the name again. Then try it with your own name, or a friend's.

<details>
<summary>Hint 1</summary>

The initials are the first character of each name. Which index is the first character? And which method turns a letter into a capital?

</details>

<details>
<summary>Hint 2</summary>

You can call methods and functions right inside the braces of an f-string, like `{first_name.title()}` or `{len(first_name)}`.

</details>

---

## Exercise 2 (Easy): Order code decoder

A bookshop gives every order a code like this one:

```python
order_code = "ORD-2026-0042"
```

The first three letters are the type of document, then the year, then a four-digit number. Pull the pieces apart and print them.

Expected output:

```
Type: ORD
Year: 2026
Order number: 42
Is an order: True
```

Notice that the order number shows `42`, not `0042`.

Now change the code to `"INV-2025-0815"` (an invoice) and run it again. You should see `Type: INV`, `Year: 2025`, `Order number: 815` and `Is an order: False`, without changing any other line.

<details>
<summary>Hint 1</summary>

Write the code out on paper with the index under each character, like the date example in the notes. Then pick the slices.

</details>

<details>
<summary>Hint 2</summary>

The last four characters are easy to grab with a negative index in a slice. To get rid of the leading zeros, turn the text into a number with a tool from chapter 03.

</details>

<details>
<summary>Hint 3</summary>

"Is an order" should be `True` or `False`. Which method checks how a string begins? Inside the f-string braces, use single quotes for any text, like `'ORD'`.

</details>

---

## Exercise 3 (Medium): Sign-up form clean-up

Someone typed their details into your website's sign-up form, and the data came in messy. Start with:

```python
typed_name = "   sANDIP shakya  "
typed_email = "  Sandip.Shakya@Example.COM "
```

Clean them up, then print the tidy name and email, the username (everything before the `@`), the domain (everything after it), and two checks.

Expected output:

```
Name: Sandip Shakya
Email: sandip.shakya@example.com
Username: sandip.shakya
Domain: example.com
Has an @: True
Ends with .com: True
```

**Rule:** your program must still work if the email is longer or shorter. So don't count the characters yourself: let Python find the `@`.

<details>
<summary>Hint 1</summary>

Clean each value once, with a chain of methods, and save the result in a new variable. Then use the clean variables for everything else.

</details>

<details>
<summary>Hint 2</summary>

`find("@")` tells you where the `@` is. The username is the slice *up to* that position. The domain starts one character *after* it.

</details>

<details>
<summary>Hint 3</summary>

"Has an @" is a yes/no question about whether one string is inside another. That's an operator, not a method.

</details>

---

## Exercise 4 (Medium): Bug hunt at the cinema

A cinema's ticket printer has gone wrong. Copy this program into `ex4.py`:

```python
# Cinema ticket printer
movie = "the lost city"
seat = "H12"
price = 12.5
tickets = 2

movie.title()
print("Movie: {movie}")
print(f"Row: {seat[1]}")
print(f"Seat number: {seat[1:]}")
print(f"Tickets: " + tickets)
print(f"Total: ${price * tickets:.2}")
```

The seat code `"H12"` means row H, seat 12. When the program is fixed, you should see:

```
Movie: The Lost City
Row: H
Seat number: 12
Tickets: 2
Total: $25.00
```

There are 5 bugs. Only one of them crashes the program. The other four just print the wrong thing, so compare every line of your output with the expected output above.

**Rule:** fix the bugs, don't rewrite the program.

<details>
<summary>Hint 1</summary>

Start with the crash. Read the last line of the error. Then look at the f-string lesson: what's the simplest way to put a number into text?

</details>

<details>
<summary>Hint 2</summary>

One line prints `{movie}` with the braces still showing. What's missing at the front of that string?

</details>

<details>
<summary>Hint 3</summary>

Once the braces are gone, the movie name is still in lowercase, even though the program calls `title()`. Look at common mistake 1 in the notes.

</details>

<details>
<summary>Hint 4</summary>

The total shows `2.5e+01`, which is scientific notation for 25. Compare the format spec with the one in the notes: a single letter is missing.

</details>

---

## Exercise 5 (Challenge): The cafe receipt

You've been asked to print receipts for a small cafe called Himalayan Beans. Today's order is for three friends:

| Item | Quantity | Price each |
|---|---|---|
| Masala chai | 2 | 3.25 |
| Veg momo | 1 | 9.25 |
| Banana bread | 3 | 2.75 |

VAT (a sales tax) is 13%, and the friends split the bill three ways. Write a program that prints this receipt, exactly:

```
=======HIMALAYAN BEANS========
Item             Qty     Total
------------------------------
Masala chai        2      6.50
Veg momo           1      9.25
Banana bread       3      8.25
------------------------------
Subtotal                 24.00
VAT (13%)                 3.12
Total                    27.12
------------------------------
Split 3 ways: 9.04 each
```

Your program must follow these rules:

- Start with `cafe_name = "himalayan beans"`, and make the capitals with a method.
- Every price, quantity, the tax percent (`13`) and the number of people (`3`) gets its own variable, and appears only once in the file.
- Python works out every total. Don't type `6.50`, `24.00`, `3.12` or any other result yourself.
- Every line of the receipt, except the last "Split" line, is exactly 30 characters wide.

Then test it: change the tax percent to `10` and run it again. The VAT line should read `VAT (10%)` with `2.40`, and the total `26.40`.

<details>
<summary>Hint 1</summary>

Plan your columns first. The item names need 15 characters, Qty 5, and Total 10. That adds up to 30. The Subtotal, VAT and Total lines have a 20-character label and a 10-character number.

</details>

<details>
<summary>Hint 2</summary>

The top line is the cafe name, centred in 30 characters, with `=` as the fill character. Look at the dotted menu example in the notes, and use `^` instead of `<`.

</details>

<details>
<summary>Hint 3</summary>

The VAT label has a value inside it. It's easiest to build it first in its own variable, like `vat_label = f"VAT ({tax_percent}%)"`, then line it up in the next f-string.

</details>

<details>
<summary>Hint 4</summary>

Tax is the subtotal times the percent, divided by 100 (chapter 04 operators). Do all the math with plain numbers first, and only use `.2f` when you print.

</details>

---

## Before you move on

Every value in your programs so far was typed into the code by you. To greet someone else, you have to edit the file. What if the program could just *ask*? Try this in a new file, run it, and type your name when it waits:

```python
name = input("What's your name? ")
print(f"Nice to meet you, {name}!")
```

[Chapter 07](../07-input-and-output/notes.md) is all about programs that ask questions and print tidy answers.
