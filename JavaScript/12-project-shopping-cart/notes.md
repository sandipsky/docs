# 12 Project: Shopping Cart

This is your first real project. You'll build the checkout for a small online shop, using only what you learned in chapters 01 to 11.

Take your time. Build it one milestone at a time, and run your code after every small change. That's how professionals work too.

## What you'll build

You'll write a Node program in a single file, `cart.js`, for a stationery shop called Maple Stationery. It will:

- show a menu of products,
- let a customer add items to a cart, and politely refuse bad requests,
- work out the subtotal, apply discount codes, and add tax and shipping,
- let the customer change quantities and remove items,
- print a neat receipt.

When it's finished, your program will end by printing this receipt:

```
Maple Stationery - Receipt
==================================
ITEM                 QTY    AMOUNT
Notebook               5    $17.50
Backpack               1    $34.99
Sticky notes           2     $3.98
----------------------------------
Subtotal                    $56.47
Discount (SAVE10)           -$5.65
Tax (8%)                     $4.07
Shipping                      FREE
----------------------------------
TOTAL                       $54.89
==================================
Thank you for shopping with us!
```

Your program won't read from the keyboard yet (that comes in chapter 49). Instead, you'll "play the customer" by calling your own functions at the bottom of the file, like `addToCart(1, 3)`.

## Before you start

### Setup

Create a file called `cart.js` in this folder. Run it with `node cart.js` from a terminal opened in this folder, just like the exercises.

### The rules

- Use only what you learned in chapters 01 to 11. If you already know `map`, `filter`, `reduce`, destructuring, spread or classes from somewhere else, save them for later chapters. Here, loops and plain functions are the point.
- Each milestone has hints. Try first, and open a hint only when you're stuck.
- Your code doesn't have to look like anyone else's. If your output matches the expected output, it works. When you're done, ask Claude to review it.

### How to organize `cart.js`

Keep your file in three parts, from top to bottom:

```js
// ===== Data =====
// The products, the cart, and the shop's settings.

// ===== Functions =====
// One function for each job.

// ===== Try it out =====
// Calls to your functions, to test them.
```

Each milestone gives you some **test code** for the "Try it out" part. Replace the old test code with the new code, run `node cart.js`, and compare your output with the expected output. Your data and functions stay and keep growing. Only the test code changes.

### Money: work in cents

Remember the `0.1 + 0.2` surprise from [chapter 05](../05-numbers-and-math/notes.md)? It happens in shops too:

```js
console.log(1.1 * 3); // prints: 3.3000000000000003
console.log(110 * 3); // prints: 330
```

Three notebooks at $1.10 should cost exactly $3.30. Whole numbers don't have this problem, so real shops often store money as whole **cents**: $3.50 becomes `350`. You'll do the same:

- Every price and total in your program is a whole number of cents.
- When a calculation could give you part of a cent (like 10% off), round it with `Math.round`.
- Only turn cents into dollars at the very end, when you print.

## Milestone 1: The product catalog

**Goal:** store the shop's products and print a menu.

Here's what Maple Stationery sells:

| ID | Product | Price |
|---|---|---|
| 1 | Notebook | $3.50 |
| 2 | Pen set | $6.25 |
| 3 | Backpack | $34.99 |
| 4 | Water bottle | $12.00 |
| 5 | Desk lamp | $22.50 |
| 6 | Sticky notes | $1.99 |

1. In the Data part, create an array of objects called `products`, one object per product. Use exactly these property names, and prices in cents:

   ```js
   const products = [
     { id: 1, name: "Notebook", priceInCents: 350 },
     // ...and the other five products
   ];
   ```

2. Write a function `formatMoney(cents)` that **returns** a price as text, like `"$3.50"`.
3. Write a function `printMenu()` that prints a welcome line and then every product.

Test code:

```js
console.log(formatMoney(350));
console.log(formatMoney(1200));
console.log(formatMoney(5));
printMenu();
```

You'll see:

```
$3.50
$12.00
$0.05
Welcome to Maple Stationery!
1. Notebook - $3.50
2. Pen set - $6.25
3. Backpack - $34.99
4. Water bottle - $12.00
5. Desk lamp - $22.50
6. Sticky notes - $1.99
```

<details>
<summary>Hint 1</summary>

From cents to dollars: divide by 100. Then `toFixed(2)` from chapter 05 gives you exactly two decimal places, and it hands you back a string.

</details>

<details>
<summary>Hint 2</summary>

`formatMoney` should `return` the text, not print it. That way, every other function can use it inside its own messages.

</details>

<details>
<summary>Hint 3</summary>

In `printMenu`, loop over `products` with `for...of`. Each menu line uses the product's `id` and `name`, plus `formatMoney` for the price.

</details>

## Milestone 2: Add to the cart

**Goal:** write `addToCart(productId, quantity)`, which puts products in the cart and refuses bad requests.

Think of the cart as a note you hand to a cashier: "product 1, three of them. Product 3, one of them." The note doesn't need the names or prices, because the cashier looks those up in the catalog.

So add `const cart = [];` to the Data part. Each item in the cart is an object with just two properties: `productId` and `quantity`.

`addToCart` follows these rules, in this order:

1. If there's no product with that ID, print `Sorry, we don't have a product with ID 42.` (with the real ID) and stop.
2. If the quantity isn't a whole number of 1 or more, print `Sorry, the quantity must be a whole number of 1 or more.` and stop.
3. If that product is already in the cart, add to its quantity. Otherwise, add a new item to the cart.
4. Print `Added 3 x Notebook to your cart.` (with the real quantity and name).

Test code:

```js
addToCart(1, 3);
addToCart(3, 1);
addToCart(1, 2);
addToCart(42, 1);
addToCart(2, 0);
addToCart(2, 1.5);
console.log(cart);
```

You'll see:

```
Added 3 x Notebook to your cart.
Added 1 x Backpack to your cart.
Added 2 x Notebook to your cart.
Sorry, we don't have a product with ID 42.
Sorry, the quantity must be a whole number of 1 or more.
Sorry, the quantity must be a whole number of 1 or more.
[ { productId: 1, quantity: 5 }, { productId: 3, quantity: 1 } ]
```

Notice there's only one notebook item, with a quantity of 5. Adding two more notebooks updated the item that was already in the cart.

<details>
<summary>Hint 1</summary>

Start with a helper function, `findProduct(productId)`, that returns the product with that ID, or `null` if there isn't one. It's very close to the `findProduct` example in [chapter 11](../11-objects/notes.md).

</details>

<details>
<summary>Hint 2</summary>

`Number.isInteger(quantity)` from chapter 05 is `false` for `1.5`, and also for anything that isn't a number at all. You still need a second check for numbers below 1.

</details>

<details>
<summary>Hint 3</summary>

After each error message, stop the function straight away with `return`. Those checks are the guard clauses from chapter 09.

</details>

<details>
<summary>Hint 4</summary>

For rule 3, write a second helper, `findCartItem(productId)`, that searches the cart instead of the catalog. If it finds an item, change that item's `quantity`. If it gives you `null`, push a new object into the cart. Shorthand properties from chapter 11 make that object very short to write.

</details>

## Milestone 3: The subtotal

**Goal:** add up the cart, and show what's in it.

1. Write `getSubtotal()`, which **returns** the total of everything in the cart, in cents. For each item, that's the product's price times the quantity.
2. Write `printCart()`, which prints each item with its amount, and then the subtotal. If the cart is empty, it prints `Your cart is empty.` instead.

Test code:

```js
printCart();
addToCart(1, 5);
addToCart(3, 1);
addToCart(6, 2);
printCart();
console.log(getSubtotal());
```

You'll see:

```
Your cart is empty.
Added 5 x Notebook to your cart.
Added 1 x Backpack to your cart.
Added 2 x Sticky notes to your cart.
Your cart:
- 5 x Notebook: $17.50
- 1 x Backpack: $34.99
- 2 x Sticky notes: $3.98
Subtotal: $56.47
5647
```

The last line is the plain number that `getSubtotal()` returns: 5647 cents, which is $56.47.

<details>
<summary>Hint 1</summary>

This is the "adding everything up" pattern from chapter 10. The cart only stores each product's ID, so inside the loop, use `findProduct` to get the price.

</details>

<details>
<summary>Hint 2</summary>

In `printCart`, check for an empty cart first and `return` early. Remember that an empty array is truthy, so check its `length`.

</details>

<details>
<summary>Hint 3</summary>

`printCart` can call `getSubtotal()` for its last line. There's no need to add everything up twice.

</details>

## Milestone 4: Discount codes

**Goal:** let customers use a discount code.

Maple Stationery has two codes:

| Code | What it does |
|---|---|
| `SAVE10` | 10% off the subtotal, rounded to the nearest cent |
| `FLAT5` | $5.00 off, but only when the subtotal is over $30.00 |

1. Write `getDiscount(subtotal, code)`, which **returns** the discount in cents. An unknown code, no code at all (`null`), or a `FLAT5` order of $30.00 or less all give `0`.
2. Add `let discountCode = null;` to the Data part, because the customer hasn't used a code yet.
3. Write `applyDiscountCode(code)`. Customers type codes in all sorts of ways, so first clean the code up: `" save10 "` should work just like `"SAVE10"`. Then:
   - If it's a valid code, store the cleaned-up code in `discountCode`, and print `Discount code SAVE10 applied.`
   - Otherwise, print `Sorry, "HALFOFF" is not a valid discount code.` (with the cleaned-up code).

Test code:

```js
console.log(getDiscount(5647, "SAVE10"));
console.log(getDiscount(5647, "FLAT5"));
console.log(getDiscount(2500, "FLAT5"));
console.log(getDiscount(5647, null));
applyDiscountCode("halfoff");
applyDiscountCode("  save10 ");
console.log(discountCode);
```

You'll see:

```
565
500
0
0
Sorry, "HALFOFF" is not a valid discount code.
Discount code SAVE10 applied.
SAVE10
```

10% of 5647 cents is 564.7 cents. Nobody can pay 0.7 of a cent, so it rounds to 565 cents, which is $5.65.

<details>
<summary>Hint 1</summary>

`getDiscount` only calculates. It returns a number and prints nothing. An `if...else if` chain or a `switch` from chapter 07 both work well.

</details>

<details>
<summary>Hint 2</summary>

10% of an amount is `amount * 0.1`. Wrap it in `Math.round` so the result is a whole number of cents.

</details>

<details>
<summary>Hint 3</summary>

To clean up the code, chain `trim()` and `toUpperCase()` from chapter 06. To check whether it's valid, you could keep the valid codes in an array and use `includes` from chapter 10.

</details>

## Milestone 5: Tax and shipping

**Goal:** work out the tax, the shipping, and the final total.

The shop's rules:

- **Tax** is 8% of the order *after* the discount, rounded to the nearest cent. Shipping isn't taxed.
- **Shipping** costs $4.99, but it's free when the order after the discount is $50.00 or more.

1. In the Data part, store the shop's settings in variables with clear names: the tax rate (`0.08`), the shipping fee, and the amount where shipping becomes free (money in cents, as always). If the tax rate changes next year, you'll only have to change one line.
2. Write `getTax(amount)` and `getShipping(amount)`. Both take an amount in cents and return cents.
3. Write `getTotals()`, which works everything out for the current cart and **returns an object** with these six properties, in this order: `subtotal`, `discount`, `afterDiscount`, `tax`, `shipping` and `total`. The total is `afterDiscount + tax + shipping`.

Test code:

```js
console.log(getTax(5082));
console.log(getTax(1000));
console.log(getShipping(5082));
console.log(getShipping(4999));
addToCart(1, 5);
addToCart(3, 1);
addToCart(6, 2);
applyDiscountCode("SAVE10");
console.log(getTotals());
```

You'll see:

```
407
80
0
499
Added 5 x Notebook to your cart.
Added 1 x Backpack to your cart.
Added 2 x Sticky notes to your cart.
Discount code SAVE10 applied.
{
  subtotal: 5647,
  discount: 565,
  afterDiscount: 5082,
  tax: 407,
  shipping: 0,
  total: 5489
}
```

Node prints this object over several lines because it's too long for one.

Why return one object? Because `getTotals` works everything out once, in one place. In the next milestone, the receipt can then read `totals.tax`, `totals.total` and so on, without doing any math itself.

<details>
<summary>Hint 1</summary>

`getShipping` asks one question: is the amount at least the free-shipping amount? If yes, shipping costs `0`. If not, it costs the shipping fee.

</details>

<details>
<summary>Hint 2</summary>

In `getTotals`, work out the values in order, each one using the ones before it: the subtotal, then the discount (using the stored `discountCode`), then the amount after the discount, and so on.

</details>

<details>
<summary>Hint 3</summary>

Once you have six variables with the right names, shorthand properties from chapter 11 let you return them all in one short line.

</details>

## Milestone 6: The receipt

**Goal:** print a neat receipt with `printReceipt()`.

Test code:

```js
addToCart(2, 2);
addToCart(4, 1);
printReceipt();
```

You'll see:

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
```

The layout rules:

- Every line of the receipt fits in 34 characters. The `=` and `-` lines are exactly 34 characters long.
- **Item rows:** the name is padded to 20 characters, the quantity to 4, and the amount to 10. The quantity and the amount line up on the right.
- **The header row** (`ITEM`, `QTY`, `AMOUNT`) uses the same widths as the item rows.
- **Totals rows:** the label is padded to 24 characters, and the amount to 10, lined up on the right.
- **The discount row** only appears when there's a discount. It shows the code and a minus sign, like `Discount (SAVE10)` and `-$5.65`.
- **Shipping** shows `FREE` when it costs nothing.

This test didn't use a discount code, so there's no discount row. And the order is under $50.00, so shipping isn't free. The final program at the end of this guide shows both.

<details>
<summary>Hint 1</summary>

`padEnd(20)` adds spaces after the text until it's 20 characters long, so it lines up on the left. `padStart(10)` adds spaces in front, so it lines up on the right. `"=".repeat(34)` makes the long lines. All three are from chapter 06.

</details>

<details>
<summary>Hint 2</summary>

`padStart` is a string method, but the quantity is a number. Turn it into a string first with `String()`.

</details>

<details>
<summary>Hint 3</summary>

All the totals rows have the same shape: a label on the left and an amount on the right. A small helper like `printLine(label, value)` saves you from writing the padding again and again.

</details>

<details>
<summary>Hint 4</summary>

Start `printReceipt` by calling `getTotals()` once. Then read everything you need from the object it gives back.

</details>

## Milestone 7: Remove items and change quantities

**Goal:** let customers change their minds.

1. Write `removeFromCart(productId)`:
   - If the product isn't in the cart, print `That item isn't in your cart.`
   - Otherwise, remove it and print `Removed Desk lamp from your cart.` (with the real name).
2. Write `updateQuantity(productId, quantity)`, which follows these rules, in this order:
   1. If the product isn't in the cart, print `That item isn't in your cart.`
   2. If the new quantity is `0`, remove the item. (Your `removeFromCart` can do that.)
   3. If the quantity isn't a whole number of 0 or more, print `Sorry, the quantity must be a whole number of 0 or more.`
   4. Otherwise, change the quantity and print `Sticky notes quantity changed to 2.` (with the real name and quantity).

Test code:

```js
addToCart(1, 3);
addToCart(6, 4);
addToCart(5, 1);
updateQuantity(6, 2);
updateQuantity(1, -1);
updateQuantity(4, 2);
removeFromCart(5);
removeFromCart(5);
updateQuantity(1, 0);
printCart();
```

You'll see:

```
Added 3 x Notebook to your cart.
Added 4 x Sticky notes to your cart.
Added 1 x Desk lamp to your cart.
Sticky notes quantity changed to 2.
Sorry, the quantity must be a whole number of 0 or more.
That item isn't in your cart.
Removed Desk lamp from your cart.
That item isn't in your cart.
Removed Notebook from your cart.
Your cart:
- 2 x Sticky notes: $3.98
Subtotal: $3.98
```

<details>
<summary>Hint 1</summary>

`splice` from chapter 10 can remove the item, but it needs to know the item's index. Loop over the cart with a `for` loop and an index, and look for the item whose `productId` matches.

</details>

<details>
<summary>Hint 2</summary>

Once you have the index, `cart.splice(index, 1)` removes one item at that spot.

</details>

<details>
<summary>Hint 3</summary>

`updateQuantity` can reuse what you've already built: `findCartItem` to find the item, and `removeFromCart` for a quantity of 0.

</details>

## Putting it all together

Replace your test code one last time, with a whole shopping trip:

```js
printMenu();
console.log("");
addToCart(1, 3);
addToCart(3, 1);
addToCart(6, 4);
addToCart(5, 1);
addToCart(1, 2);
addToCart(9, 1);
addToCart(2, -1);
updateQuantity(6, 2);
removeFromCart(5);
applyDiscountCode(" save10 ");
console.log("");
printReceipt();
```

You'll see:

```
Welcome to Maple Stationery!
1. Notebook - $3.50
2. Pen set - $6.25
3. Backpack - $34.99
4. Water bottle - $12.00
5. Desk lamp - $22.50
6. Sticky notes - $1.99

Added 3 x Notebook to your cart.
Added 1 x Backpack to your cart.
Added 4 x Sticky notes to your cart.
Added 1 x Desk lamp to your cart.
Added 2 x Notebook to your cart.
Sorry, we don't have a product with ID 9.
Sorry, the quantity must be a whole number of 1 or more.
Sticky notes quantity changed to 2.
Removed Desk lamp from your cart.
Discount code SAVE10 applied.

Maple Stationery - Receipt
==================================
ITEM                 QTY    AMOUNT
Notebook               5    $17.50
Backpack               1    $34.99
Sticky notes           2     $3.98
----------------------------------
Subtotal                    $56.47
Discount (SAVE10)           -$5.65
Tax (8%)                     $4.07
Shipping                      FREE
----------------------------------
TOTAL                       $54.89
==================================
Thank you for shopping with us!
```

`console.log("")` prints an empty line, which gives the output some room to breathe.

Look at the shipping: the subtotal was $56.47, and after the $5.65 discount the order is $50.82. That's still $50.00 or more, so shipping is free.

🎉 That's a complete, working shopping cart, built from nothing but the basics. Every online shop you've ever used does these same steps behind the scenes.

## Common mistakes

**1. Doing math with formatted money**

```js
const subtotal = "$56.47"; // what formatMoney gives back: text!
console.log(subtotal * 0.1); // prints: NaN
```

`formatMoney` returns a string, ready for printing. You can't do math with `"$56.47"`. Keep the plain number of cents for every calculation, and only call `formatMoney` when you build a line to print.

**2. Forgetting to stop after an error message**

```js
function findProduct(productId) {
  return null; // pretend the product doesn't exist
}

function addToCart(productId, quantity) {
  const product = findProduct(productId);
  if (product === null) {
    console.log(`Sorry, we don't have a product with ID ${productId}.`);
  }
  console.log(`Added ${quantity} x ${product.name} to your cart.`);
}

addToCart(42, 1);
// prints: Sorry, we don't have a product with ID 42.
// TypeError: Cannot read properties of null (reading 'name')
```

The message printed, but the function kept going, and `product` is `null`. Fix: `return` straight after the error message, so the rest of the function never runs. That turns the check into a guard clause, like the ones in chapter 09.

**3. Mixing up `1` and `"1"`**

```js
const product = { id: 1, name: "Notebook" };
console.log(product.id === 1);   // prints: true
console.log(product.id === "1"); // prints: false
```

If you call `addToCart("1", 2)`, you'll get `Sorry, we don't have a product with ID 1.`, even though product 1 exists! The ID you passed is the *string* `"1"`, and `===` checks the type too. Pass numbers. If an ID ever arrives as text (like typed input, later in the course), convert it first with `Number()` from chapter 05.

**4. Printing a value instead of returning it**

```js
function getSubtotal() {
  const subtotal = 5647;
  console.log(subtotal); // shows the number on screen...
}                        // ...but never returns it

const subtotal = getSubtotal();
console.log("Subtotal in dollars:", subtotal / 100);
```

You'll see:

```
5647
Subtotal in dollars: NaN
```

This is the `console.log` vs `return` mix-up from [chapter 09](../09-functions/notes.md). A function without `return` gives back `undefined`, and `undefined / 100` is `NaN`. Fix: `return subtotal;`. A good rule for this project: functions named `get...` return a value, and functions named `print...` print.

**5. Calling `padStart` on a number**

```js
const quantity = 5;
console.log(quantity.padStart(4));
// TypeError: quantity.padStart is not a function
```

`padStart` and `padEnd` are string methods, and numbers don't have them. Fix: `String(quantity).padStart(4)`.

## Quick recap

In this project, you practiced:

- Storing data as arrays of objects: the catalog and the cart (chapters 10 and 11).
- Splitting a big job into small functions that each do one thing, and returning values instead of printing them (chapter 09).
- Checking input, and stopping early with a clear message when something's wrong (chapters 07 and 09).
- Looping to search, to add up, and to print (chapters 08 and 10).
- Handling money safely in whole cents, with `Math.round` and `toFixed` (chapter 05).
- Lining up text in columns with `padEnd`, `padStart` and `repeat` (chapter 06).

In chapter 13, you'll learn shorter ways to write many of the loops you just wrote.

---

**Next:** try the stretch goals in the [exercises](exercises.md), then move on to [13 Array Methods](../13-array-methods/notes.md).
