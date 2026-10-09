# 14 Project: Shopping Cart: Exercises

**How to do these:**

- These are stretch goals: extra features for your finished shopping cart. Finish all eight milestones in the [notes](notes.md) first.
- Before each one, copy your finished `cart.py` to a new file in this folder (`ex1.py`, `ex2.py`, and so on), so you always keep a working version. Run it with `python ex1.py`.
- Each stretch goal gives you test code. Just like in the project, put it in the "Try it out" part, in place of `run_shop()`. When the test output matches, put `run_shop()` back and try the new feature in the real shop too.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Prices with commas

Right now, `format_money(123456)` gives you `$1234.56`. Real shops write `$1,234.56`, with a comma between the thousands.

Change the inside of `format_money` so it adds the commas. Don't change anything else: every other function keeps calling `format_money` just like before.

Test code:

```python
print(format_money(320))
print(format_money(123456))
print(format_money(100000000))
add_to_cart(5, 100)
print_receipt(None)
```

Expected output:

```
$3.20
$1,234.56
$1,000,000.00
Added 100 x Coffee beans to your cart.
Sunny Corner Grocery - Receipt
==================================
ITEM                 QTY    AMOUNT
Coffee beans         100 $1,250.00
----------------------------------
Subtotal                 $1,250.00
Tax (5%)                    $62.50
Delivery                      FREE
----------------------------------
TOTAL                    $1,312.50
==================================
Thank you for shopping with us!
```

Somebody really likes coffee. Look how the receipt still lines up: the amounts are wider now, but the padding takes care of it.

<details>
<summary>Hint 1</summary>

In chapter 06 you met two format specs: `{n:,}` adds commas, and `{price:.2f}` shows two decimal places. You can use both at once. The comma comes first.

</details>

<details>
<summary>Hint 2</summary>

Try it in a tiny test file first: `print(f"{1234.5:,.2f}")`. What do you see?

</details>

---

## Exercise 2 (Easy): Loyalty points

Sunny Corner Grocery wants customers to come back. Customers earn 1 loyalty point for each whole dollar of their final total. Orders with a total of $40.00 or more earn double points.

1. Write `get_loyalty_points(total_cents)`, which returns the number of points.

Test code:

```python
print(get_loyalty_points(4384))
print(get_loyalty_points(1443))
print(get_loyalty_points(99))
```

Expected output:

```
86
14
0
```

2. Add a line to the receipt, just before `Thank you for shopping with us!`, that tells the customer how many points they earned.

Test code:

```python
add_to_cart(5, 3)
add_to_cart(2, 1)
code = apply_discount_code("welcome15")
print_receipt(code)
```

Expected output:

```
Added 3 x Coffee beans to your cart.
Added 1 x Bread to your cart.
Discount code WELCOME15 applied.
Sunny Corner Grocery - Receipt
==================================
ITEM                 QTY    AMOUNT
Coffee beans           3    $37.50
Bread                  1     $2.75
----------------------------------
Subtotal                    $40.25
Discount (WELCOME15)        -$6.04
Tax (5%)                     $1.71
Delivery                     $4.99
----------------------------------
TOTAL                       $40.91
==================================
You earned 80 loyalty points!
Thank you for shopping with us!
```

Look at the delivery: the subtotal is over $40.00, but after the $6.04 discount the order is only $34.21, so delivery isn't free. The total still reaches $40.91, though, so the points are doubled.

<details>
<summary>Hint 1</summary>

To get whole dollars from cents, you want to divide by 100 and throw away the remainder. Which operator from chapter 04 does exactly that?

</details>

<details>
<summary>Hint 2</summary>

Check your function with the first test: $43.84 is 43 whole dollars. The total is $40.00 or more, so the points are doubled: 86. Is there a setting in your Data part that already holds the $40.00 amount?

</details>

---

## Exercise 3 (Medium): Stock limits

The shop only has a few of some products. Right now, a customer could add 500 bags of coffee beans! Here's how many of each product the shop really has:

| ID | Product | Stock |
|---|---|---|
| 1 | Apples | 50 |
| 2 | Bread | 10 |
| 3 | Milk | 6 |
| 4 | Eggs | 5 |
| 5 | Coffee beans | 2 |
| 6 | Chocolate | 30 |

1. Add a `"stock"` key to each product's dictionary in `PRODUCTS`, using the table above.
2. Change `add_to_cart`. After the quantity check, check whether the quantity already in the cart **plus** the new quantity would be more than the stock. If it would, print `Sorry, we only have 2 x Coffee beans in stock.` (with the real stock and name) and stop.

Test code:

```python
add_to_cart(5, 1)
add_to_cart(5, 1)
add_to_cart(5, 1)
add_to_cart(4, 6)
add_to_cart(4, 5)
print_cart()
```

Expected output:

```
Added 1 x Coffee beans to your cart.
Added 1 x Coffee beans to your cart.
Sorry, we only have 2 x Coffee beans in stock.
Sorry, we only have 5 x Eggs in stock.
Added 5 x Eggs to your cart.
Your cart:
- 2 x Coffee beans: $25.00
- 5 x Eggs: $24.95
Subtotal: $49.95
```

**Bonus:** make `update_quantity` check the stock too, so nobody can change their coffee beans to 10.

<details>
<summary>Hint 1</summary>

How many of this product are already in the cart? `cart.get(product_id, 0)` answers that, even when the product isn't in the cart yet.

</details>

<details>
<summary>Hint 2</summary>

The third test line tries to add 1 bag of coffee beans when there are already 2 in the cart. That would make 3, which is more than the stock of 2.

</details>

---

## Exercise 4 (Medium): Buy 2, get 1 free

This week, chocolate is "buy 2, get 1 free": for every 3 bars in the cart, 1 of them is free. So 7 bars cost the same as 5.

1. Add `"buy_2_get_1": True` to the chocolate's dictionary only. The other products don't get this key at all.
2. Write `get_line_total(product_id, quantity)`, which returns the amount for one line of the cart, in cents, with the deal taken into account.
3. Use `get_line_total` everywhere you used to work out price times quantity.
4. In `print_cart`, show how many bars were free, like `(2 free!)`, but only when some were free.

Test code:

```python
add_to_cart(6, 7)
add_to_cart(1, 2)
print_cart()
```

Expected output:

```
Added 7 x Chocolate to your cart.
Added 2 x Apples to your cart.
Your cart:
- 7 x Chocolate: $9.00 (2 free!)
- 2 x Apples: $6.40
Subtotal: $15.40
```

<details>
<summary>Hint 1</summary>

For every full group of 3 bars, one bar is free. Floor division from chapter 04, `quantity // 3`, counts the full groups.

</details>

<details>
<summary>Hint 2</summary>

The other products don't have a `"buy_2_get_1"` key, so `product["buy_2_get_1"]` would crash with a `KeyError`. Which dictionary method from chapter 13 lets you give a default instead?

</details>

<details>
<summary>Hint 3</summary>

Did you write price times quantity in several places (like `get_subtotal`, `print_cart` and `print_receipt`)? Then each one has to change. That's why it pays to give each calculation its own function: next time, there's only one place to change.

</details>

---

## Exercise 5 (Challenge): A receipt you can keep

`print_receipt` prints straight to the screen. But what if the shop wants to email the receipt, or save it for later? For that, you need the whole receipt as one string.

Write `build_receipt(discount_code)`, which **returns** the whole receipt as a single string, with the lines separated by `"\n"` (the new-line character from chapter 06). It doesn't print anything itself. Printing it is then one line: `print(build_receipt(code))`.

Test code:

```python
add_to_cart(2, 2)
add_to_cart(3, 1)
receipt = build_receipt(None)
print(receipt)
lines = receipt.split("\n")
print(f"The receipt has {len(lines)} lines.")
print("FREE" in receipt)
```

Expected output:

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
The receipt has 13 lines.
False
```

The last two lines show why a string is so handy: you can count its lines, search it with `in`, and pass it around. None of that is possible with text that has already been printed. (In [chapter 20](../20-files-and-folders/notes.md), you'll save a string like this to a file.)

**Bonuses:**

- Make `print_receipt` use `build_receipt`, so the receipt's layout lives in only one place.
- Add a choice `6) Receipt` to the shop's menu that shows the receipt so far, without checking out. Remember to update the options line and the "not an option" message.

<details>
<summary>Hint 1</summary>

Start with an empty list of lines. Everywhere `print_receipt` printed a line, `append` that line to the list instead.

</details>

<details>
<summary>Hint 2</summary>

At the end, one string method from chapter 11 glues all the lines into a single string, with `"\n"` between them.

</details>

<details>
<summary>Hint 3</summary>

If you have a `print_line(label, value)` helper, turn it into `format_line(label, value)`, which **returns** the padded line instead of printing it.

</details>

---

## Before you move on

Look back through your `cart.py`. How many times did you write "make an empty list, loop, maybe check something, append"? Here's one you might have:

```python
names = []
for product in PRODUCTS:
    names.append(product["name"])
```

Python has a shortcut that turns those three lines into one. [Chapter 15](../15-comprehensions/notes.md) shows you how, and your loops will never look the same again.
