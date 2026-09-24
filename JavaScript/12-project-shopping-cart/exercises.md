# 12 Project: Shopping Cart: Exercises

**How to do these:**

- These are stretch goals: extra features for your finished shopping cart. Finish all seven milestones in the [notes](notes.md) first.
- Before each one, copy your finished `cart.js` to a new file in this folder (`ex1.js`, `ex2.js`, and so on), so you always keep a working version. Run it with `node ex1.js`.
- Each stretch goal gives you new test code. Just like in the project, replace the "Try it out" part with it.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Prices with commas

Right now, `formatMoney(123456)` gives you `$1234.56`. Real shops write `$1,234.56`, and `Intl.NumberFormat` from [chapter 05](../05-numbers-and-math/notes.md) knows how every country writes money.

Change the inside of `formatMoney` so it uses `Intl.NumberFormat` with US dollars. Don't change anything else: every other function keeps calling `formatMoney` just like before.

Test code:

```js
console.log(formatMoney(350));
console.log(formatMoney(123456));
console.log(formatMoney(100000000));
```

Expected output:

```
$3.50
$1,234.56
$1,000,000.00
```

Then run the whole shopping trip from "Putting it all together" again. The receipt should look exactly the same as before, because every amount on it is under $1,000.

**Bonus:** try other countries. `"en-GB"` with `"GBP"` gives `£1,234.56`. `"en-IN"` with `"INR"` turns `formatMoney(12345678900)` into `₹12,34,56,789.00`, because in India, digits after the first thousand are grouped in twos.

<details>
<summary>Hint 1</summary>

In chapter 05, you made a formatter with `new Intl.NumberFormat(...)`. You gave it a locale like `"en-US"`, plus options with `style: "currency"` and a `currency`. Then you called its `format` method.

</details>

<details>
<summary>Hint 2</summary>

The formatter works with dollars, not cents. What do you need to do to the cents first?

</details>

---

## Exercise 2 (Easy): Loyalty points

Maple Stationery wants customers to come back. Customers earn 1 loyalty point for each whole dollar of their final total. Orders with a total of $50.00 or more earn double points.

1. Write `getLoyaltyPoints(totalInCents)`, which returns the number of points.

Test code:

```js
console.log(getLoyaltyPoints(5489));
console.log(getLoyaltyPoints(3145));
console.log(getLoyaltyPoints(99));
```

Expected output:

```
108
31
0
```

2. Add a line to the receipt, just before `Thank you for shopping with us!`, that tells the customer how many points they earned.

Test code:

```js
addToCart(3, 1);
addToCart(1, 5);
applyDiscountCode("FLAT5");
printReceipt();
```

Expected output:

```
Added 1 x Backpack to your cart.
Added 5 x Notebook to your cart.
Discount code FLAT5 applied.
Maple Stationery - Receipt
==================================
ITEM                 QTY    AMOUNT
Backpack               1    $34.99
Notebook               5    $17.50
----------------------------------
Subtotal                    $52.49
Discount (FLAT5)            -$5.00
Tax (8%)                     $3.80
Shipping                     $4.99
----------------------------------
TOTAL                       $56.28
==================================
You earned 112 loyalty points!
Thank you for shopping with us!
```

Look at the shipping: the subtotal is over $50.00, but after the $5.00 discount the order is only $47.49, so shipping isn't free.

<details>
<summary>Hint 1</summary>

To get whole dollars, divide the cents by 100 and round *down*. Which `Math` method always rounds down?

</details>

<details>
<summary>Hint 2</summary>

Check your function with the first test: $54.89 is 54 whole dollars. The total is $50.00 or more, so the points are doubled: 108.

</details>

---

## Exercise 3 (Medium): Stock limits

The shop only has a few of some products. Right now, a customer could add 500 backpacks! Here's how many of each product the shop really has:

| ID | Product | Stock |
|---|---|---|
| 1 | Notebook | 50 |
| 2 | Pen set | 10 |
| 3 | Backpack | 2 |
| 4 | Water bottle | 5 |
| 5 | Desk lamp | 1 |
| 6 | Sticky notes | 30 |

1. Add a `stock` property to each product, using the table above.
2. Change `addToCart`. After the quantity check, check whether the quantity already in the cart plus the new quantity would be more than the stock. If it would, print `Sorry, we only have 2 x Backpack in stock.` (with the real stock and name) and stop.

Test code:

```js
addToCart(3, 1);
addToCart(3, 1);
addToCart(3, 1);
addToCart(5, 2);
addToCart(5, 1);
printCart();
```

Expected output:

```
Added 1 x Backpack to your cart.
Added 1 x Backpack to your cart.
Sorry, we only have 2 x Backpack in stock.
Sorry, we only have 1 x Desk lamp in stock.
Added 1 x Desk lamp to your cart.
Your cart:
- 2 x Backpack: $69.98
- 1 x Desk lamp: $22.50
Subtotal: $92.48
```

**Bonus:** make `updateQuantity` check the stock too.

<details>
<summary>Hint 1</summary>

`findCartItem` tells you whether the product is already in the cart. If it is, its `quantity` is how many are already there. If it isn't, there are 0 already there.

</details>

<details>
<summary>Hint 2</summary>

The third test line tries to add 1 backpack when there are already 2 in the cart. That would make 3, which is more than the stock of 2.

</details>

---

## Exercise 4 (Medium): Buy 2, get 1 free

This week, sticky notes are "buy 2, get 1 free": for every 3 packs in the cart, 1 of them is free. So 7 packs cost the same as 5.

1. Add `buyTwoGetOneFree: true` to the sticky notes product.
2. Write `getLineTotal(item)`, which returns the amount for one cart item, with the deal taken into account.
3. Use `getLineTotal` everywhere you used to work out price times quantity.
4. In `printCart`, show how many packs were free, like `(2 free!)`, but only when some were free.

Test code:

```js
addToCart(6, 7);
addToCart(1, 2);
printCart();
```

Expected output:

```
Added 7 x Sticky notes to your cart.
Added 2 x Notebook to your cart.
Your cart:
- 7 x Sticky notes: $9.95 (2 free!)
- 2 x Notebook: $7.00
Subtotal: $16.95
```

<details>
<summary>Hint 1</summary>

For every full group of 3 packs, one pack is free. `Math.floor(quantity / 3)` counts the full groups.

</details>

<details>
<summary>Hint 2</summary>

The other products don't have a `buyTwoGetOneFree` property at all. Reading it gives `undefined`, which is falsy, so a plain `if` can tell the two kinds of product apart.

</details>

<details>
<summary>Hint 3</summary>

Did you write price times quantity in several places (like `getSubtotal`, `printCart` and `printReceipt`)? Then each one has to change. That's why it pays to give each calculation its own function: next time, there's only one place to change.

</details>

---

## Exercise 5 (Challenge): A receipt you can keep

`printReceipt` prints straight to the screen. But what if the shop wants to email the receipt, or save it to a file? For that, you need the whole receipt as one string.

Write `buildReceipt()`, which **returns** the whole receipt as a single string, with the lines separated by `"\n"` (the new-line character from chapter 06). It doesn't print anything itself. Printing it is then one line: `console.log(buildReceipt())`.

Test code:

```js
addToCart(2, 2);
addToCart(4, 1);
const receipt = buildReceipt();
console.log(receipt);
console.log(`The receipt has ${receipt.split("\n").length} lines.`);
console.log(receipt.includes("FREE"));
```

Expected output:

```
Added 2 x Pen set to your cart.
Added 1 x Water bottle to your cart.
Maple Stationery - Receipt
==================================
ITEM                 QTY    AMOUNT
Pen set                2    $12.50
Water bottle           1    $12.00
----------------------------------
Subtotal                    $24.50
Tax (8%)                     $1.96
Shipping                     $4.99
----------------------------------
TOTAL                       $31.45
==================================
Thank you for shopping with us!
The receipt has 13 lines.
false
```

The last two lines show why a string is so handy: you can count its lines, search it, and pass it around, and none of that is possible with text that has already been printed.

**Bonus:** make `printReceipt` use `buildReceipt`, so the receipt's layout lives in only one place.

<details>
<summary>Hint 1</summary>

Start with an empty array of lines. Everywhere `printReceipt` printed a line, `push` that line into the array instead.

</details>

<details>
<summary>Hint 2</summary>

At the end, one array method from chapter 10 glues all the lines into a single string, with `"\n"` between them.

</details>

<details>
<summary>Hint 3</summary>

If you have a `printLine(label, value)` helper, turn it into `formatLine(label, value)`, which returns the padded line instead of printing it.

</details>

---

## Before you move on

Look back through your `cart.js`. How many loops did you write that search an array for one item? How many add things up?

Those patterns are so common that JavaScript has shortcuts for them, like `find` and `reduce`. [Chapter 13](../13-array-methods/notes.md) shows you how they work, and you'll see your cart loops shrink to a line or two.
