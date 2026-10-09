# 13 Dictionaries: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.py`, `ex2.py`, and so on).
- Run each one with `python ex1.py` from a terminal opened in this folder.
- Prices are whole cents, as in the notes. Only turn them into dollars when you print, with `price / 100` and the `:.2f` format spec.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): The cafe menu

Start your file with this menu (prices in cents):

```python
menu = {"coffee": 350, "tea": 250, "muffin": 300}
```

Then make these changes, one line each:

1. The cafe starts selling bagels for 275 cents.
2. Coffee goes up to 375 cents.
3. The muffins have sold out. Take them off the menu.

Finally, print the menu with lined-up prices in dollars, followed by four facts about it.

Expected output:

```
coffee    $3.75
tea       $2.50
bagel     $2.75
Items on the menu: 3
Do we sell cake? False
Cheapest price: $2.50
Price of a muffin: sold out
```

**Rule:** don't type any of the answers. The last line must come from looking `"muffin"` up in the dictionary, without crashing.

<details>
<summary>Hint 1</summary>

Adding and changing look the same: `menu[key] = value`. For removing, use `del` or `.pop()`.

</details>

<details>
<summary>Hint 2</summary>

Loop with `for item, price in menu.items():`. The item names are padded to 10 characters with `{item:<10}`, and the price is `price / 100` with `:.2f`.

</details>

<details>
<summary>Hint 3</summary>

For the cheapest price, which method gives you just the prices? `min()` can take it from there. For the last line, `.get()` can take a default, and the default doesn't have to be a number.

</details>

---

## Exercise 2 (Easy): Word counter

Count how many times each word appears in this sentence:

```python
sentence = "the cat sat on the mat and the dog sat on the log"
```

Print each word with its count, in the order the words first appear. Then print how many different words there are, the most common word, and how many times "zebra" appears.

Expected output:

```
the: 4
cat: 1
sat: 2
on: 2
mat: 1
and: 1
dog: 1
log: 1
Different words: 8
Most common: the (4 times)
Times 'zebra' appears: 0
```

**Rule:** use the counting pattern from the notes. Don't use the string method `count()`.

<details>
<summary>Hint 1</summary>

`sentence.split()` gives you a list of words. Loop over it, and for each word do `counts[word] = counts.get(word, 0) + 1`.

</details>

<details>
<summary>Hint 2</summary>

The order comes for free: dictionaries remember the order you added keys in.

</details>

<details>
<summary>Hint 3</summary>

The most common word is the "finding the biggest" pattern from chapter 11, but you remember two things: the best word so far and its count. Loop over `counts.items()`.

</details>

---

## Exercise 3 (Medium): Bug hunt at the library

A library keeps track of which member has borrowed each book. The keys are book titles, and the values are the borrowers' names. Copy this into `ex3.py` and fix it.

```python
# Library loans: book title -> who borrowed it
loans = {"Dune": "Maya", "Holes": "Tom", "Matilda": "Maya"}
print(f"Books on loan: {len(loans)}")
print(f"Holes is with {loans['holes']}")
loans["Wonder"] == "Lena"
for book, borrower in loans:
    print(f"{book}: {borrower}")
if "Maya" in loans:
    print("Maya has books out.")
borrower = loans.pop("Holes")
print(f"{borrower} returned Holes.")
print(f"Books on loan: {len(loans)}")
```

There are 4 bugs. Three crash the program. The last one doesn't crash, but a line that should print is missing. When it's fixed, you should see:

```
Books on loan: 3
Holes is with Tom
Dune: Maya
Holes: Tom
Matilda: Maya
Wonder: Lena
Maya has books out.
Tom returned Holes.
Books on loan: 3
```

(Yes, "Books on loan" is 3 both times. Lena borrowed a book, and then Tom returned one.)

**Rule:** fix the bugs, don't rewrite the program.

<details>
<summary>Hint 1</summary>

The first error is `KeyError: 'holes'`. Look closely at the capital letters.

</details>

<details>
<summary>Hint 2</summary>

The second error is `KeyError: 'Wonder'`, which seems strange on a line that's supposed to *add* Wonder. Python thinks you're *reading* `loans["Wonder"]`. Why? Look at the operator: is it "put this in" or "is this equal to"?

</details>

<details>
<summary>Hint 3</summary>

`too many values to unpack` in a `for` loop over a dict? Check common mistake 3 in the notes.

</details>

<details>
<summary>Hint 4</summary>

"Maya has books out." never prints. `in` checks the keys of a dict. Is "Maya" a key or a value here?

</details>

---

## Exercise 4 (Medium): The running club log

A running club logs every run as a record in a list of dictionaries:

```python
runs = [
    {"runner": "Ana", "km": 5},
    {"runner": "Ben", "km": 3},
    {"runner": "Ana", "km": 8},
    {"runner": "Cara", "km": 10},
    {"runner": "Ben", "km": 4},
    {"runner": "Ana", "km": 2},
]
```

Write a weekly report:

1. How many runs were logged, and the total distance.
2. Each runner's **total** distance, in the order they first appear in the log.
3. The top runner and their total.
4. The "10 km club": everyone whose total is 10 km or more.

Expected output:

```
Runs logged: 6
Total distance: 32 km
Ana: 15 km
Ben: 7 km
Cara: 10 km
Top runner: Ana (15 km)
10 km club: Ana, Cara
```

Now add a new run to the list, `{"runner": "Dev", "km": 20}`, and run it again. Dev should appear with 20 km, become the top runner, and join the 10 km club, without you changing anything else.

<details>
<summary>Hint 1</summary>

Each item in `runs` is a dictionary, so inside `for run in runs:` you read `run["runner"]` and `run["km"]`.

</details>

<details>
<summary>Hint 2</summary>

The totals per runner are the counting pattern, except that you add the kilometers instead of 1: `totals[name] = totals.get(name, 0) + ...`.

</details>

<details>
<summary>Hint 3</summary>

Once you have the `totals` dictionary, the last two questions are loops over `totals.items()`: one finds the biggest, and one builds a list of names to `join`.

</details>

**Bonus:** build a second dictionary, `history`, that groups each runner's runs into a list. Printing it should show `{'Ana': [5, 8, 2], 'Ben': [3, 4], 'Cara': [10]}` (before you add Dev).

---

## Exercise 5 (Challenge): Taking cafe orders

Customers type their orders in all sorts of ways: capital letters, extra spaces, and things the cafe doesn't sell. Your job is to tidy up an order, count it, and print the bill.

Start with:

```python
MENU = {"coffee": 350, "tea": 250, "muffin": 300}
```

Write three functions:

1. `format_money(cents)` **returns** an amount as text, like `"$10.50"`.
2. `count_items(order, menu)` takes a list of what the customer typed and **returns** a dictionary of `item -> quantity`. It cleans up each item first (so `" COFFEE "` counts as `"coffee"`). If an item isn't on the menu, it prints `Sorry, we don't sell cake.` (with the real item) and skips it.
3. `print_bill(counts, menu)` prints one line for each item, then the total.

Test code:

```python
order = ["Coffee", " tea", "muffin", "coffee", "cake", "COFFEE ", "muffin"]
counts = count_items(order, MENU)
print(counts)
print_bill(counts, MENU)
```

Expected output:

```
Sorry, we don't sell cake.
{'coffee': 3, 'tea': 1, 'muffin': 2}
3 x coffee      $10.50
1 x tea          $2.50
2 x muffin       $6.00
Total:          $19.00
```

The layout: each item line is the quantity, `" x "`, the item name padded to 10 characters, and the amount lined up on the right in 8 characters. The `Total:` label is padded to 14 characters, so its amount lines up with the others.

**Rules:**

- Work in cents everywhere. Only `format_money` turns cents into dollars.
- `count_items` must work for any menu you pass in, so use the `menu` parameter, not `MENU`, inside it.

<details>
<summary>Hint 1</summary>

To clean up what the customer typed, chain two string methods from chapter 06: one removes the spaces at the ends, and one makes everything lowercase.

</details>

<details>
<summary>Hint 2</summary>

In `count_items`, check `if item not in menu:` first. Otherwise, it's the counting pattern.

</details>

<details>
<summary>Hint 3</summary>

In `print_bill`, loop over `counts.items()`. The amount for a line is the price from the menu times the quantity. Keep a running total as you go.

</details>

<details>
<summary>Hint 4</summary>

The format spec `:>8` lines text up on the right, and it works on the string that `format_money` gives back: `f"{format_money(amount):>8}"`. For the total line, `f"{'Total:':<14}"` pads the label.

</details>

---

## Before you move on

You now know every building block of Level 1: variables, strings, input, decisions, loops, functions, lists, tuples, sets and dictionaries. That's enough to build a real program.

In [chapter 14](../14-project-shopping-cart/notes.md), you'll put them all together in a shopping cart that runs in your terminal, with a menu, discount codes, and a receipt. Exercise 5 was a warm-up for it.
