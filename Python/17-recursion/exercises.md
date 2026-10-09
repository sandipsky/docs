# 17 Recursion: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.py`, `ex2.py`, and so on).
- Copy the starting data from the exercise into your file, then write your code below it.
- Run each one with `python ex1.py` from a terminal opened in this folder.
- If you get `RecursionError: maximum recursion depth exceeded`, don't panic. Check your base case, and check that every call gets closer to it.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Can pyramid

A supermarket stacks cans of beans in a pyramid. The bottom row has a certain number of cans, each row above has one can fewer, and the top row has just 1.

```
      []
     [][]
    [][][]
   [][][][]     ← 4 rows: 1 + 2 + 3 + 4 = 10 cans
```

1. Write a recursive function `cans_in_pyramid(rows)` that returns how many cans a pyramid with that many rows needs. A pyramid with 0 rows needs 0 cans.
2. **On paper first**, write the trace for `cans_in_pyramid(4)` in the same style as the factorial trace in the notes (`= 4 + cans_in_pyramid(3)` and so on).
3. Print these results:

```
cans_in_pyramid(0) = 0
cans_in_pyramid(1) = 1
cans_in_pyramid(4) = 10
cans_in_pyramid(10) = 55
cans_in_pyramid(100) = 5050
```

**Rule:** no loops inside `cans_in_pyramid`. (A loop to print the five results is fine.)

<details>
<summary>Hint 1</summary>

What's the smallest pyramid you can answer without thinking? That's your base case.

</details>

<details>
<summary>Hint 2</summary>

A pyramid with 4 rows is the bottom row of 4 cans, plus a smaller pyramid with 3 rows sitting on top of it.

</details>

---

## Exercise 2 (Easy): Letters and palindromes

A word game needs two small tools.

1. `count_letter(text, letter)` returns how many times `letter` appears in `text`.
2. `is_palindrome(word)` returns `True` if the word reads the same backwards, like "level", and `False` if it doesn't. It should ignore capital letters.

Test them so you see:

```
'banana' has 3 a's
'Mississippi' has 4 s's
'' has 0 z's
Is 'level' a palindrome? True
Is 'Racecar' a palindrome? True
Is 'rocket' a palindrome? False
Is 'a' a palindrome? True
Is 'noon' a palindrome? True
```

**Rule:** both functions must be recursive. No loops, no `.count()`, and no `[::-1]`. The point is to practise recursion.

<details>
<summary>Hint 1</summary>

For `count_letter`: the empty string contains no letters at all, so that's the base case. Otherwise, look at the first letter `text[0]`: it counts as 1 if it matches, or 0 if it doesn't. Then add the count for the rest, `text[1:]`.

</details>

<details>
<summary>Hint 2</summary>

For `is_palindrome`: a word with 0 or 1 letters is always a palindrome. Otherwise, if the first letter and the last letter (`word[-1]`) are different, it can't be one. If they match, the answer depends on the middle part: `word[1:-1]` is everything except the first and last letters.

</details>

<details>
<summary>Hint 3</summary>

Call `.lower()` on the word first, so "R" and "r" count as the same letter.

</details>

---

## Exercise 3 (Medium): Bug hunt in the number tools

A kids' maths game uses these recursive helpers, but the program is broken. Copy it into `ex3.py`, run it, and fix one problem at a time.

```python
# Number tools for a kids' maths game

def sum_digits(n):
    """Add up the digits of a whole number: 1234 gives 10."""
    if n < 10:
        return n
    n % 10 + sum_digits(n // 10)


def power(base, exponent):
    """Multiply base by itself exponent times: power(2, 3) gives 8."""
    if exponent == 0:
        return 1
    return base * power(base, exponent)


def countdown_by(n, step):
    """Count down from n in steps of step, then print Go!"""
    if n == 0:
        print("Go!")
        return
    print(n)
    countdown_by(n - step, step)


def digits_of(n, digits=[]):
    """Return the digits of n as a list: 507 gives [5, 0, 7]."""
    if n < 10:
        digits.append(n)
        return digits
    digits_of(n // 10, digits)
    digits.append(n % 10)
    return digits


print(f"Digit sum of 1234: {sum_digits(1234)}")
print(f"2 to the power 10: {power(2, 10)}")
countdown_by(10, 3)
print(f"Digits of 507: {digits_of(507)}")
print(f"Digits of 42: {digits_of(42)}")
```

There are 4 bugs, one in each function, and each one is a mistake from the notes. When they're all fixed, you should see:

```
Digit sum of 1234: 10
2 to the power 10: 1024
10
7
4
1
Go!
Digits of 507: [5, 0, 7]
Digits of 42: [4, 2]
```

**Rule:** keep every function recursive. Fix the bugs, don't rewrite the functions.

<details>
<summary>Hint 1</summary>

The first error is `TypeError: unsupported operand type(s) for +: 'int' and 'NoneType'`. Something gave back `None` where a number was expected. Which line works out an answer and then forgets to hand it back?

</details>

<details>
<summary>Hint 2</summary>

The next error is a `RecursionError`. Read the traceback: which function's line repeats? Then ask the second question from the notes: does every call get closer to the base case?

</details>

<details>
<summary>Hint 3</summary>

The countdown prints 10, 7, 4, 1, -2, -5... and then crashes. Counting down in threes from 10 never lands exactly on 0. How can the base case catch "0 or below"?

</details>

<details>
<summary>Hint 4</summary>

The last bug doesn't crash: `digits_of(42)` gives `[5, 0, 7, 4, 2]`. Where did the 5, 0 and 7 come from? Common mistake 5 in the notes has the answer.

</details>

---

## Exercise 4 (Medium): Comment thread

A recipe website lets people reply to comments, and reply to replies, as deep as they like. Each comment is a dictionary, and its `"replies"` is a list of more comments:

```python
comments = [
    {
        "author": "Ana",
        "text": "Great recipe!",
        "replies": [
            {"author": "Ben", "text": "Agreed, making it tonight.", "replies": []},
            {
                "author": "Cleo",
                "text": "Did you use fresh basil?",
                "replies": [
                    {"author": "Ana", "text": "Yes, from my garden.", "replies": []},
                ],
            },
        ],
    },
    {"author": "Dev", "text": "A bit too salty for me.", "replies": []},
]
```

Write three recursive functions:

1. `print_thread(comment_list, depth=0)` prints every comment in the list, with each reply indented 2 more spaces than the comment it answers.
2. `count_comments(comment_list)` returns how many comments there are in total, replies included.
3. `authors(comment_list)` returns a **set** of everyone who commented, at any depth.

Expected output:

```
Ana: Great recipe!
  Ben: Agreed, making it tonight.
  Cleo: Did you use fresh basil?
    Ana: Yes, from my garden.
Dev: A bit too salty for me.
Total comments: 5
People in the thread: ['Ana', 'Ben', 'Cleo', 'Dev']
```

(Print the set with `sorted()`, so the names always come out in the same order.)

<details>
<summary>Hint 1</summary>

This works like `print_tree` in the notes, except that your function receives a whole *list* of comments. Loop over the list: print each comment, then hand its `"replies"` to `print_thread`, one level deeper.

</details>

<details>
<summary>Hint 2</summary>

Where's the base case? Look at the comments with `"replies": []`. What does a `for` loop do with an empty list?

</details>

<details>
<summary>Hint 3</summary>

For `count_comments`, each comment counts as 1, plus however many comments are in its replies. For `authors`, each comment adds its own author, plus everyone in its replies. The set union `|` from chapter 12 joins two sets together.

</details>

---

## Exercise 5 (Challenge): Shop menu and breadcrumbs

An online shop organizes its products into categories, which can hold smaller categories. Only the smallest categories (the ones with no `"children"`) hold products directly.

```python
menu = {
    "name": "All products",
    "children": [
        {
            "name": "Electronics",
            "children": [
                {"name": "Phones", "products": 12},
                {
                    "name": "Computers",
                    "children": [
                        {"name": "Laptops", "products": 8},
                        {"name": "Desktops", "products": 5},
                    ],
                },
            ],
        },
        {
            "name": "Home",
            "children": [
                {"name": "Kitchen", "products": 20},
                {"name": "Garden", "products": 7},
            ],
        },
    ],
}
```

Write three recursive functions:

1. `count_products(category)` returns how many products a category holds, including everything in its subcategories.
2. `print_menu(category, depth=0)` prints each category, indented by level, with its product count in brackets.
3. `find_path(category, target)` returns the list of category names from the top down to the one called `target`, like `['All products', 'Home', 'Garden']`. If there's no category with that name, it returns `None`.

Then print the menu, followed by the **breadcrumbs** (the "you are here" trail that shops show at the top of a page) for `"Laptops"`, `"Garden"` and `"Toys"`:

```
All products (52)
  Electronics (25)
    Phones (12)
    Computers (13)
      Laptops (8)
      Desktops (5)
  Home (27)
    Kitchen (20)
    Garden (7)
All products > Electronics > Computers > Laptops
All products > Home > Garden
Toys: not found
```

**Rule:** none of your functions may change `menu`. They only read it.

<details>
<summary>Hint 1</summary>

`count_products` works like `count_files` in the notes. A category without `"children"` is the base case: its answer is its own `"products"` number. A list comprehension inside `sum()` (chapter 15) is a neat way to add up the children's answers.

</details>

<details>
<summary>Hint 2</summary>

`print_menu` is `print_tree` from the notes, plus a call to `count_products` for each line. `category.get("children", [])` (chapter 13) gives you an empty list for categories that have no children, so the same `for` loop works for every category.

</details>

<details>
<summary>Hint 3</summary>

`find_path` is the tricky one. Base case: if this category's name is the target, the path is a list holding just this name. Otherwise, try each child. If a child comes back with a path (not `None`), put this category's name in front of it with `+` and return the result. If no child finds it, return `None`.

</details>

<details>
<summary>Hint 4</summary>

Test `find_path` on its own before the breadcrumbs: `print(find_path(menu, "Garden"))` should print `['All products', 'Home', 'Garden']`. Then `" > ".join(path)` turns a path into breadcrumbs. Check for `None` with `is None`, as you learned in chapter 16.

</details>

---

## Before you move on

When your recursion ran too deep, the whole program crashed with a `RecursionError` and stopped dead. In a real app, you don't want one problem to bring everything down.

[Chapter 18](../18-error-handling/notes.md) shows you how to catch errors like that, deal with them calmly, and even raise your own.
