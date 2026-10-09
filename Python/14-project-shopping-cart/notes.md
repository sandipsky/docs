# 14 Project: Shopping Cart

This is your first real project. You'll build the checkout for a small grocery shop, using only what you learned in chapters 01 to 13.

Take your time. Build it one milestone at a time, and run your code after every small change. That's how professionals work too.

## What you'll build

You'll write a Python program in a single file, `cart.py`, for a neighborhood shop called **Sunny Corner Grocery**. It will:

- show a list of products,
- let a customer add items to a cart, and politely refuse bad requests,
- work out the subtotal, apply discount codes, and add tax and delivery,
- let the customer change quantities and remove items,
- print a neat receipt,
- and, in the last milestone, run as a real interactive program, where the customer types their choices.

When it's finished, a customer's visit will end with a receipt like this:

```
Sunny Corner Grocery - Receipt
==================================
ITEM                 QTY    AMOUNT
Apples                 4    $12.80
Coffee beans           2    $25.00
Chocolate              2     $3.60
Eggs                   1     $4.99
----------------------------------
Subtotal                    $46.39
Discount (SAVE10)           -$4.64
Tax (5%)                     $2.09
Delivery                      FREE
----------------------------------
TOTAL                       $43.84
==================================
Thank you for shopping with us!
```

For milestones 1 to 7, you'll "play the customer" by calling your own functions at the bottom of the file, like `add_to_cart(1, 3)`. That makes every step easy to test. In milestone 8, you'll add a menu loop with `input()`, and the shop opens for real.

## Before you start

### Setup

Make a file called `cart.py` in this folder. Run it with `python cart.py` from a terminal opened in this folder (right-click the folder in VS Code's Explorer and choose **Open in Integrated Terminal**), just like the exercises.

### The rules

- Use only what you learned in chapters 01 to 13. If you already know `try`/`except`, comprehensions, classes or the `global` keyword from somewhere else, save them for later chapters. Here, plain loops, `if`, functions, lists and dictionaries are the point.
- Each milestone has hints. Try first, and open a hint only when you're stuck.
- Your code doesn't have to look like anyone else's. If your output matches the expected output, it works. When you're done, ask Claude to review it.

### How to organize `cart.py`

Keep your file in three parts, from top to bottom:

```python
# ===== Data =====
# The products, the cart, and the shop's settings.

# ===== Functions =====
# One function for each job.

# ===== Try it out =====
# Calls to your functions, to test them.
```

Each milestone gives you some **test code** for the "Try it out" part. Replace the old test code with the new code, run `python cart.py`, and compare your output with the expected output. Your data and functions stay and keep growing. Only the test code changes.

Since the whole program runs again from the top each time, the cart always starts empty when the test code begins.

> **Tip:** give every function a short docstring (chapter 10) that says what it does. When the file gets long, those one-line descriptions make it much easier to find your way around.

### Money: work in whole cents

Remember the `0.1 + 0.2` surprise from [chapter 05](../05-numbers-and-math/notes.md)? It happens in shops too:

```python
print(1.1 * 3)  # prints: 3.3000000000000003
print(110 * 3)  # prints: 330
```

Three apples at $1.10 should cost exactly $3.30. Whole numbers (`int`) don't have this problem, so real shops often store money as whole **cents**: $3.20 becomes `320`. You'll do the same:

- Every price and total in your program is an `int` number of cents.
- When a calculation could give you part of a cent (like 10% off), round it to a whole number with `round()`.
- Only turn cents into dollars at the very end, when you print.

## Milestone 1: The product catalog

**Goal:** store the shop's products and print them.

Here's what Sunny Corner Grocery sells:

| ID | Product | Price |
|---|---|---|
| 1 | Apples | $3.20 |
| 2 | Bread | $2.75 |
| 3 | Milk | $3.49 |
| 4 | Eggs | $4.99 |
| 5 | Coffee beans | $12.50 |
| 6 | Chocolate | $1.80 |

1. In the Data part, store the shop's name in `SHOP_NAME`. It never changes, so it gets an `UPPER_CASE` name (chapter 02).
2. Create a list of dictionaries called `PRODUCTS`, one dictionary per product: the "table of records" pattern from [chapter 13](../13-dictionaries/notes.md). Use exactly these keys, and prices in cents:

   ```python
   PRODUCTS = [
       {"id": 1, "name": "Apples", "price": 320},
       # ...and the other five products
   ]
   ```

3. Write a function `format_money(cents)` that **returns** an amount as text, like `"$3.20"`.
4. Write a function `print_menu()` that prints a welcome line and then every product.

Test code:

```python
print(format_money(320))
print(format_money(1250))
print(format_money(5))
print_menu()
```

You'll see:

```
$3.20
$12.50
$0.05
Welcome to Sunny Corner Grocery!
1. Apples - $3.20
2. Bread - $2.75
3. Milk - $3.49
4. Eggs - $4.99
5. Coffee beans - $12.50
6. Chocolate - $1.80
```

<details>
<summary>Hint 1</summary>

From cents to dollars: divide by 100. Then the f-string format spec `:.2f` from chapter 06 always shows exactly two decimal places. Dividing makes a float, but that's fine here: you only do it to *show* the money, never to calculate with it.

</details>

<details>
<summary>Hint 2</summary>

`format_money` should `return` the text, not print it. That way every other function can use it inside its own messages.

</details>

<details>
<summary>Hint 3</summary>

In `print_menu`, loop with `for product in PRODUCTS:`. Each line uses `product["id"]`, `product["name"]`, and `format_money(product["price"])`. Inside an f-string, use single quotes for the keys: `{product['name']}`.

</details>

## Milestone 2: Add to the cart

**Goal:** write `add_to_cart(product_id, quantity)`, which puts products in the cart and refuses bad requests.

Think of the cart as a note you hand to a cashier: "product 1, five of them. Product 5, one of them." The note doesn't need names or prices, because the cashier looks those up in the catalog.

That's a perfect job for a dictionary. Add this to the Data part:

```python
cart = {}  # product ID -> quantity
```

The keys are product IDs and the values are quantities, so `{1: 5, 5: 1}` means "5 of product 1, and 1 of product 5". It's not `UPPER_CASE`, because the cart changes all the time.

Your functions can change what's inside `cart`, like `cart[1] = 5`, even though `cart` was made outside them, because a dictionary is mutable (chapter 13). (One thing *won't* work: writing `cart = {}` inside a function to empty it. [Chapter 16](../16-scope-and-mutability/notes.md) explains why. Use `cart.clear()` if you ever need that.)

`add_to_cart` follows these rules, in this order:

1. If there's no product with that ID, print `Sorry, we don't have a product with ID 42.` (with the real ID) and stop.
2. If the quantity is less than 1, print `Sorry, the quantity must be 1 or more.` and stop.
3. If that product is already in the cart, add to its quantity. Otherwise, put it in the cart with this quantity.
4. Print `Added 3 x Apples to your cart.` (with the real quantity and name).

Test code:

```python
add_to_cart(1, 3)
add_to_cart(5, 1)
add_to_cart(1, 2)
add_to_cart(42, 1)
add_to_cart(2, 0)
print(cart)
```

You'll see:

```
Added 3 x Apples to your cart.
Added 1 x Coffee beans to your cart.
Added 2 x Apples to your cart.
Sorry, we don't have a product with ID 42.
Sorry, the quantity must be 1 or more.
{1: 5, 5: 1}
```

Notice there's only one entry for apples, with a quantity of 5. Adding two more apples updated the quantity that was already there.

<details>
<summary>Hint 1</summary>

Start with a helper function, `find_product(product_id)`, that returns the product dictionary with that ID, or `None` if there isn't one. It's the same shape as `find_book` in chapter 13.

</details>

<details>
<summary>Hint 2</summary>

`None` is falsy and a dictionary with something in it is truthy (chapter 08), so after `product = find_product(product_id)`, the check `if not product:` reads as "if there's no product".

</details>

<details>
<summary>Hint 3</summary>

After each error message, stop the function straight away with `return`. A `return` on its own gives back `None` and ends the function, so the rest of it never runs.

</details>

<details>
<summary>Hint 4</summary>

Rule 3 is the counting pattern from chapter 13, except that you add `quantity` instead of 1. What does `cart.get(product_id, 0)` give you when the product isn't in the cart yet?

</details>

## Milestone 3: The subtotal

**Goal:** add up the cart, and show what's in it.

1. Write `get_subtotal()`, which **returns** the total of everything in the cart, in cents. For each item, that's the product's price times the quantity.
2. Write `print_cart()`, which prints each item with its amount, and then the subtotal. If the cart is empty, it prints `Your cart is empty.` instead.

Test code:

```python
print_cart()
add_to_cart(1, 4)
add_to_cart(5, 2)
add_to_cart(4, 1)
add_to_cart(6, 2)
print_cart()
print(get_subtotal())
```

You'll see:

```
Your cart is empty.
Added 4 x Apples to your cart.
Added 2 x Coffee beans to your cart.
Added 1 x Eggs to your cart.
Added 2 x Chocolate to your cart.
Your cart:
- 4 x Apples: $12.80
- 2 x Coffee beans: $25.00
- 1 x Eggs: $4.99
- 2 x Chocolate: $3.60
Subtotal: $46.39
4639
```

The last line is the plain number that `get_subtotal()` returns: 4639 cents, which is $46.39. Notice the cart lists the items in the order they were added. Dictionaries remember their order (chapter 13).

<details>
<summary>Hint 1</summary>

This is the "adding everything up" pattern from chapter 11. Loop with `for product_id, quantity in cart.items():`. The cart only stores IDs, so inside the loop, use `find_product` to get the price.

</details>

<details>
<summary>Hint 2</summary>

In `print_cart`, check for an empty cart first and `return` early. An empty dictionary is falsy, just like an empty list.

</details>

<details>
<summary>Hint 3</summary>

`print_cart` can call `get_subtotal()` for its last line. There's no need to add everything up twice.

</details>

## Milestone 4: Discount codes

**Goal:** let customers use a discount code.

Sunny Corner Grocery has two codes. Each code takes a percentage off the subtotal:

| Code | Discount |
|---|---|
| `SAVE10` | 10% off |
| `WELCOME15` | 15% off |

1. Store the codes in a dictionary called `DISCOUNT_CODES` in the Data part: each code is a key, and its percentage is the value. That's a lookup table, from chapter 13. Adding a new code next month will take one line.
2. Write `get_discount(subtotal, code)`, which **returns** the discount in cents, rounded to a whole number of cents. An unknown code, or no code at all (`None`), gives `0`.
3. Write `apply_discount_code(code)`. Customers type codes in all sorts of ways, so first clean the code up: `"  save10 "` should work just like `"SAVE10"`. Then:
   - If it's a valid code, print `Discount code SAVE10 applied.` and **return** the cleaned-up code.
   - Otherwise, print `Sorry, "HALFOFF" is not a valid discount code.` (with the cleaned-up code) and **return** `None`.

Why return the code instead of saving it somewhere? Because then the code that *called* the function decides where to keep it. The function stays small, and it's easy to test, as you can see below.

Test code:

```python
print(get_discount(4639, "SAVE10"))
print(get_discount(4639, "WELCOME15"))
print(get_discount(4639, "HALFOFF"))
print(get_discount(4639, None))
code = apply_discount_code("halfoff")
print(code)
code = apply_discount_code("  save10 ")
print(code)
```

You'll see:

```
464
696
0
0
Sorry, "HALFOFF" is not a valid discount code.
None
Discount code SAVE10 applied.
SAVE10
```

10% of 4639 cents is 463.9 cents. Nobody can pay 0.9 of a cent, so it rounds to 464 cents, which is $4.64. And 15% is 695.85 cents, which rounds to 696.

<details>
<summary>Hint 1</summary>

`get_discount` only calculates. It returns a number and prints nothing. Check whether the code is in the dictionary first (`in` checks the keys). If it is, look up its percentage.

</details>

<details>
<summary>Hint 2</summary>

A percentage of an amount is `amount * percent / 100`. Wrap it in `round()` so the result is a whole number of cents.

</details>

<details>
<summary>Hint 3</summary>

To clean up the code, chain `strip()` and `upper()` from chapter 06. The message about an invalid code has double quotes inside it, so write that string with single quotes on the outside: `f'Sorry, "{code}" is ...'`.

</details>

> **Watch out:** remember from chapter 05 that `round()` rounds an exact half to the nearest *even* number: `round(256.5)` is `256`, but `round(257.5)` is `258`. Banks use the same rule, so it's fine for a shop. Just don't be surprised when a discount of exactly half a cent rounds down.

## Milestone 5: Tax and delivery

**Goal:** work out the tax, the delivery fee, and the final total.

The shop's rules:

- **Tax** is 5% of the order *after* the discount, rounded to a whole number of cents. Delivery isn't taxed.
- **Delivery** costs $4.99, but it's free when the order after the discount is $40.00 or more.

1. In the Data part, store the shop's settings in `UPPER_CASE` variables with clear names: the tax percentage (`5`), the delivery fee, and the amount where delivery becomes free (money in cents, as always). If the tax changes next year, you'll only have to change one line.
2. Write `get_tax(amount)` and `get_delivery(amount)`. Both take an amount in cents and return cents.
3. Write `get_totals(discount_code)`, which works everything out for the current cart and **returns a dictionary** with these six keys, in this order: `"subtotal"`, `"discount"`, `"after_discount"`, `"tax"`, `"delivery"` and `"total"`. The total is the amount after the discount, plus tax, plus delivery.

Test code:

```python
print(get_tax(4175))
print(get_tax(1000))
print(get_delivery(4175))
print(get_delivery(3999))
add_to_cart(1, 4)
add_to_cart(5, 2)
add_to_cart(4, 1)
add_to_cart(6, 2)
print(get_totals("SAVE10"))
print(get_totals(None))
```

You'll see:

```
209
50
0
499
Added 4 x Apples to your cart.
Added 2 x Coffee beans to your cart.
Added 1 x Eggs to your cart.
Added 2 x Chocolate to your cart.
{'subtotal': 4639, 'discount': 464, 'after_discount': 4175, 'tax': 209, 'delivery': 0, 'total': 4384}
{'subtotal': 4639, 'discount': 0, 'after_discount': 4639, 'tax': 232, 'delivery': 0, 'total': 4871}
```

Why return one dictionary? Because `get_totals` works everything out once, in one place. In the next milestone, the receipt can then read `totals["tax"]`, `totals["total"]` and so on, without doing any math itself.

<details>
<summary>Hint 1</summary>

`get_delivery` asks one question: is the amount at least the free-delivery amount? If yes, delivery costs `0`. If not, it costs the delivery fee.

</details>

<details>
<summary>Hint 2</summary>

In `get_totals`, work out the values in order, each one using the ones before it: the subtotal, then the discount (with `get_discount`), then the amount after the discount, and so on. Store each one in its own variable.

</details>

<details>
<summary>Hint 3</summary>

At the end, build the dictionary from your six variables and return it. Writing one pair per line makes it easy to read.

</details>

## Milestone 6: The receipt

**Goal:** print a neat receipt with `print_receipt(discount_code)`.

Test code:

```python
add_to_cart(2, 2)
add_to_cart(3, 1)
print_receipt(None)
```

You'll see:

```
Added 2 x Bread to your cart.
Added 1 x Milk to your cart.
Sunny Corner Grocery - Receipt
==================================
ITEM                 QTY    AMOUNT
Bread                  2     $5.50
Milk                   1     $3.49
----------------------------------
Subtotal                     $8.99
Tax (5%)                     $0.45
Delivery                     $4.99
----------------------------------
TOTAL                       $14.43
==================================
Thank you for shopping with us!
```

The layout rules:

- Every line of the receipt fits in 34 characters. The `=` and `-` lines are exactly 34 characters long.
- **Item rows:** the name is padded to 20 characters on the left, then the quantity in 4 characters and the amount in 10 characters, both lined up on the right.
- **The header row** (`ITEM`, `QTY`, `AMOUNT`) uses the same widths as the item rows.
- **Totals rows:** the label is padded to 24 characters, and the amount sits in 10 characters, lined up on the right.
- **The discount row** only appears when there's a discount. It shows the code and a minus sign, like `Discount (SAVE10)` and `-$4.64`.
- **The tax row** shows the percentage from your settings, not a typed-in `5`.
- **Delivery** shows `FREE` when it costs nothing.

This test didn't use a discount code, so there's no discount row. And the order is under $40.00, so delivery isn't free. The full session at the end of this guide shows both.

<details>
<summary>Hint 1</summary>

The f-string alignment from chapters 06 and 07 does all the work: `{name:<20}` pads on the right so the text lines up on the left, and `{amount:>10}` pads on the left so it lines up on the right. They work on numbers too, so `{quantity:>4}` is fine. `"=" * 34` makes the long lines (chapter 04).

</details>

<details>
<summary>Hint 2</summary>

Format the money first, then pad it: `amount = format_money(...)`, then `{amount:>10}`. Padding the text means the `$` stays next to the number.

</details>

<details>
<summary>Hint 3</summary>

All the totals rows have the same shape: a label on the left and an amount on the right. A small helper like `print_line(label, value)` saves you from writing the padding again and again. For the header row, put the words straight into the braces: `{'ITEM':<20}`.

</details>

<details>
<summary>Hint 4</summary>

Start `print_receipt` by calling `get_totals(discount_code)` once. Then read everything you need from the dictionary it gives back.

</details>

## Milestone 7: Remove items and change quantities

**Goal:** let customers change their minds.

1. Write `remove_from_cart(product_id)`:
   - If the product isn't in the cart, print `That item isn't in your cart.`
   - Otherwise, remove it and print `Removed Milk from your cart.` (with the real name).
2. Write `update_quantity(product_id, quantity)`, which follows these rules, in this order:
   1. If the product isn't in the cart, print `That item isn't in your cart.`
   2. If the new quantity is `0`, remove the item. (Your `remove_from_cart` can do that.)
   3. If the quantity is less than 0, print `Sorry, the quantity must be 0 or more.`
   4. Otherwise, change the quantity and print `Chocolate quantity changed to 2.` (with the real name and quantity).

Test code:

```python
add_to_cart(1, 3)
add_to_cart(6, 4)
add_to_cart(3, 1)
update_quantity(6, 2)
update_quantity(1, -1)
update_quantity(4, 2)
remove_from_cart(3)
remove_from_cart(3)
update_quantity(1, 0)
print_cart()
```

You'll see:

```
Added 3 x Apples to your cart.
Added 4 x Chocolate to your cart.
Added 1 x Milk to your cart.
Chocolate quantity changed to 2.
Sorry, the quantity must be 0 or more.
That item isn't in your cart.
Removed Milk from your cart.
That item isn't in your cart.
Removed Apples from your cart.
Your cart:
- 2 x Chocolate: $3.60
Subtotal: $3.60
```

<details>
<summary>Hint 1</summary>

The cart is a dictionary, so "is this product in the cart?" is just `product_id in cart`. Removing it is `del cart[product_id]` (or `cart.pop(product_id)`).

</details>

<details>
<summary>Hint 2</summary>

Get the product's name *before* or *after* you delete it from the cart? Either works, because the name comes from `find_product`, which looks in `PRODUCTS`, not in the cart.

</details>

<details>
<summary>Hint 3</summary>

In `update_quantity`, each rule ends with a `return`, so only one of them runs. Rule 2 can be just two lines: call `remove_from_cart(product_id)`, then `return`.

</details>

## Milestone 8: Open the shop

**Goal:** turn your functions into a real program that the customer drives by typing.

Until now, *you* called the functions from the test code. Now the customer will choose what happens, with `input()` from [chapter 07](../07-input-and-output/notes.md) and a `while True` menu loop from [chapter 09](../09-loops/notes.md).

1. Write `ask_number(prompt)`. It asks with `input(prompt)`, cleans the answer up with `.strip()`, and checks it with `.isdigit()` (chapter 08):
   - If the answer is a whole number, it **returns** it as an `int`.
   - If not, it prints `Please type a whole number, like 2.` and **asks again**, until the customer gets it right.
2. Write `print_options()`. It prints a one-line summary of the cart, then the list of choices:

   ```
   Cart: 3 items, $5.40
   1) Products  2) Add  3) Change  4) Discount  5) Check out  q) Quit
   ```

   The number is the total number of items (all the quantities added up). When it's exactly 1, the word is `item`, not `items`.
3. Write `run_shop()`. It prints the product list once, then repeats this, forever:
   - print an empty line, then the options,
   - ask `Choose an option: ` and clean the answer up (`.strip()` and `.lower()`, so `Q` works too),
   - then do what the customer chose:

   | Choice | What happens |
   |---|---|
   | `1` | Print the product list. |
   | `2` | Ask `Product ID: ` and `How many? `, then call `add_to_cart`. |
   | `3` | Ask `Product ID: ` and `New quantity: `, then call `update_quantity`. |
   | `4` | Ask `Discount code: `, then call `apply_discount_code`. If the code was valid, remember it. |
   | `5` | If the cart is empty, print `Your cart is empty, so there's nothing to check out yet.` Otherwise, print an empty line and the receipt, and **end** the loop. |
   | `q` | Print `Goodbye! Come back soon.` and end the loop. |
   | anything else | Print `Sorry, that's not an option. Type a number from 1 to 5, or q.` |

4. Replace all your test code with a single line:

   ```python
   run_shop()
   ```

To test it, run `python cart.py` and type these answers, pressing Enter after each one: `5`, `2`, `9`, `1`, `2`, `6`, `two`, `3`, `x`, `q`.

You'll see this (what you typed appears after each prompt, just like in your terminal):

```
Welcome to Sunny Corner Grocery!
1. Apples - $3.20
2. Bread - $2.75
3. Milk - $3.49
4. Eggs - $4.99
5. Coffee beans - $12.50
6. Chocolate - $1.80

Cart: 0 items, $0.00
1) Products  2) Add  3) Change  4) Discount  5) Check out  q) Quit
Choose an option: 5
Your cart is empty, so there's nothing to check out yet.

Cart: 0 items, $0.00
1) Products  2) Add  3) Change  4) Discount  5) Check out  q) Quit
Choose an option: 2
Product ID: 9
How many? 1
Sorry, we don't have a product with ID 9.

Cart: 0 items, $0.00
1) Products  2) Add  3) Change  4) Discount  5) Check out  q) Quit
Choose an option: 2
Product ID: 6
How many? two
Please type a whole number, like 2.
How many? 3
Added 3 x Chocolate to your cart.

Cart: 3 items, $5.40
1) Products  2) Add  3) Change  4) Discount  5) Check out  q) Quit
Choose an option: x
Sorry, that's not an option. Type a number from 1 to 5, or q.

Cart: 3 items, $5.40
1) Products  2) Add  3) Change  4) Discount  5) Check out  q) Quit
Choose an option: q
Goodbye! Come back soon.
```

Look at what your earlier milestones are doing here. The checks you wrote in `add_to_cart` politely refused product 9, and the loop just carried on. Every piece you built is now a building block.

<details>
<summary>Hint 1</summary>

`ask_number` is a `while True` loop with a `return` inside it. `return` ends the function, and that ends the loop too. If the answer isn't a number, print the message, and the loop goes around and asks again.

</details>

<details>
<summary>Hint 2</summary>

Why `.isdigit()` and not just `int()`? Because `int("two")` crashes the whole program with a `ValueError`. Checking first means it never gets the chance. (In [chapter 18](../18-error-handling/notes.md) you'll learn another way, with `try` and `except`.) A nice bonus: `"-1".isdigit()` is `False`, so nobody can type a negative quantity.

</details>

<details>
<summary>Hint 3</summary>

`input()` gives back text, but your product IDs are numbers. That's exactly why `ask_number` returns `int(answer)`. Without it, `find_product("1")` would find nothing, because `"1"` is not `1`.

</details>

<details>
<summary>Hint 4</summary>

For the summary, `sum(cart.values())` adds up all the quantities. For "item" or "items", a conditional expression from chapter 08 fits on one line: `word = "item" if item_count == 1 else "items"`.

</details>

<details>
<summary>Hint 5</summary>

The discount code lives in a variable inside `run_shop`. Set `discount_code = None` before the loop. For choice 4, keep what `apply_discount_code` returns in a new variable, and only copy it into `discount_code` if it isn't `None`. That way, a typo doesn't wipe out a code that already worked. When the customer checks out, pass `discount_code` to `print_receipt`.

</details>

<details>
<summary>Hint 6</summary>

`break` ends the `while True` loop (chapter 09). Choices 5 and `q` both need one.

</details>

## Putting it all together

Here's a whole shopping trip with your finished program. Run `python cart.py` and type these answers (each group is one trip around the menu):

| Choice | Then type | What the customer is doing |
|---|---|---|
| `2` | `1`, `4` | 4 x Apples |
| `2` | `5`, `2` | 2 x Coffee beans |
| `2` | `3`, `1` | 1 x Milk |
| `2` | `6`, `4` | 4 x Chocolate |
| `2` | `4`, `1` | 1 x Eggs |
| `3` | `6`, `2` | Changes the chocolate to 2 |
| `3` | `3`, `0` | Changes the milk to 0, which removes it |
| `4` | `halfoff` | Tries a code that doesn't exist |
| `4` | `Save10` | Tries a real code (typed in mixed case) |
| `5` | | Checks out |

You'll see:

```
Welcome to Sunny Corner Grocery!
1. Apples - $3.20
2. Bread - $2.75
3. Milk - $3.49
4. Eggs - $4.99
5. Coffee beans - $12.50
6. Chocolate - $1.80

Cart: 0 items, $0.00
1) Products  2) Add  3) Change  4) Discount  5) Check out  q) Quit
Choose an option: 2
Product ID: 1
How many? 4
Added 4 x Apples to your cart.

Cart: 4 items, $12.80
1) Products  2) Add  3) Change  4) Discount  5) Check out  q) Quit
Choose an option: 2
Product ID: 5
How many? 2
Added 2 x Coffee beans to your cart.

Cart: 6 items, $37.80
1) Products  2) Add  3) Change  4) Discount  5) Check out  q) Quit
Choose an option: 2
Product ID: 3
How many? 1
Added 1 x Milk to your cart.

Cart: 7 items, $41.29
1) Products  2) Add  3) Change  4) Discount  5) Check out  q) Quit
Choose an option: 2
Product ID: 6
How many? 4
Added 4 x Chocolate to your cart.

Cart: 11 items, $48.49
1) Products  2) Add  3) Change  4) Discount  5) Check out  q) Quit
Choose an option: 2
Product ID: 4
How many? 1
Added 1 x Eggs to your cart.

Cart: 12 items, $53.48
1) Products  2) Add  3) Change  4) Discount  5) Check out  q) Quit
Choose an option: 3
Product ID: 6
New quantity: 2
Chocolate quantity changed to 2.

Cart: 10 items, $49.88
1) Products  2) Add  3) Change  4) Discount  5) Check out  q) Quit
Choose an option: 3
Product ID: 3
New quantity: 0
Removed Milk from your cart.

Cart: 9 items, $46.39
1) Products  2) Add  3) Change  4) Discount  5) Check out  q) Quit
Choose an option: 4
Discount code: halfoff
Sorry, "HALFOFF" is not a valid discount code.

Cart: 9 items, $46.39
1) Products  2) Add  3) Change  4) Discount  5) Check out  q) Quit
Choose an option: 4
Discount code: Save10
Discount code SAVE10 applied.

Cart: 9 items, $46.39
1) Products  2) Add  3) Change  4) Discount  5) Check out  q) Quit
Choose an option: 5

Sunny Corner Grocery - Receipt
==================================
ITEM                 QTY    AMOUNT
Apples                 4    $12.80
Coffee beans           2    $25.00
Chocolate              2     $3.60
Eggs                   1     $4.99
----------------------------------
Subtotal                    $46.39
Discount (SAVE10)           -$4.64
Tax (5%)                     $2.09
Delivery                      FREE
----------------------------------
TOTAL                       $43.84
==================================
Thank you for shopping with us!
```

Look at the delivery: the subtotal was $46.39, and after the $4.64 discount the order is $41.75. That's still $40.00 or more, so delivery is free. The tax is 5% of $41.75, which is 208.75 cents, rounded to 209 cents: $2.09.

That's a complete, working shop, built from nothing but the basics. Every online shop you've ever used does these same steps behind the scenes.

## Common mistakes

**1. Doing math with formatted money**

```python
subtotal = "$46.39"   # what format_money gives back: text!
print(subtotal * 0.1)
# TypeError: can't multiply sequence by non-int of type 'float'
```

`format_money` returns a string, ready for printing. You can't do math with `"$46.39"`. Keep the plain number of cents for every calculation, and only call `format_money` when you build a line to print.

**2. Forgetting to stop after an error message**

```python
def add_to_cart(product_id, quantity):
    product = find_product(product_id)
    if not product:
        print(f"Sorry, we don't have a product with ID {product_id}.")
    print(f"Added {quantity} x {product['name']} to your cart.")

add_to_cart(42, 1)
```

You'll see the message, and then a crash:

```
Sorry, we don't have a product with ID 42.
TypeError: 'NoneType' object is not subscriptable
```

The message printed, but the function kept going, and `product` is `None`. Fix: `return` straight after the error message, so the rest of the function never runs. A check like this, which leaves the function early, is often called a **guard clause**: it guards the code below it from bad values.

**3. Mixing up `1` and `"1"`**

```python
print(find_product(1))    # prints: {'id': 1, 'name': 'Apples', 'price': 320}
print(find_product("1"))  # prints: None
```

The ID in `PRODUCTS` is the number `1`, and `==` says the text `"1"` is not equal to it. So `add_to_cart("1", 2)` prints `Sorry, we don't have a product with ID 1.`, even though product 1 exists! This is the bug you get if you pass the result of `input()` straight in. Fix: convert with `int()` first, after checking with `.isdigit()`. That's exactly what `ask_number` does.

**4. Printing a value instead of returning it**

```python
def get_subtotal():
    subtotal = 4639
    print(subtotal)   # shows the number on screen...
                      # ...but never returns it

subtotal = get_subtotal()
print(f"Subtotal in dollars: {subtotal / 100}")
```

You'll see `4639`, and then:

```
TypeError: unsupported operand type(s) for /: 'NoneType' and 'int'
```

This is the `print` vs `return` mix-up from [chapter 10](../10-functions/notes.md). A function without `return` gives back `None`, and you can't divide `None` by 100. Fix: `return subtotal`. A good rule for this project: functions named `get_...` return a value, and functions named `print_...` print.

**5. Calling `int()` on input without checking it**

```python
quantity = int(input("How many? "))
```

That works until someone types `two`:

```
ValueError: invalid literal for int() with base 10: 'two'
```

The whole program crashes, and the customer's cart is lost. Fix: check with `.isdigit()` first, and ask again if it's not a number, like `ask_number` does.

**6. Forgetting `break`**

If choice `5` prints the receipt but has no `break`, the menu comes straight back after the receipt, and the customer can never leave. If your program is stuck in a loop, press **Ctrl+C** in the terminal to stop it (chapter 09), then add the missing `break`.

## Quick recap

In this project, you practiced:

- Storing data as a list of dictionaries (the catalog) and a dictionary of `ID -> quantity` (the cart), from chapters 11 and 13.
- Splitting a big job into small functions that each do one thing, and returning values instead of printing them (chapter 10).
- Checking requests, and stopping early with `return` and a clear message when something's wrong (chapters 08 and 10).
- Looping to search, to add up, and to print (chapters 09 and 11), and lookup tables for the discount codes (chapter 13).
- Handling money safely in whole cents, with `round()` and `:.2f` (chapters 05 and 06).
- Lining up columns with f-string alignment like `:<20` and `:>10` (chapters 06 and 07).
- An interactive menu with `input()`, `while True`, `break` and `.isdigit()` (chapters 07, 08 and 09).

That's the end of Level 1. In Level 2, you'll learn to write the same things more neatly, handle errors properly with `try` and `except`, and save data to files so it's still there tomorrow. Your first step: shorter ways to write many of the loops you just wrote.

---

**Next:** try the stretch goals in the [exercises](exercises.md), then move on to [15 Comprehensions](../15-comprehensions/notes.md), the first chapter of Level 2.
