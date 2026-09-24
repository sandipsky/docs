# 22 Forms: Exercises

**How to do these:**

- Make a folder for each exercise in this chapter's folder (`ex1`, `ex2`, and so on). Inside it, create `index.html` (copy the HTML from the exercise) and `script.js` (your code).
- Open `index.html` by double-clicking it. Press `F12` and open the **Console** tab to see messages and errors. Save and refresh the page after each change, the same way as in [chapter 20](../20-dom-basics/notes.md).
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Library card

A library's website lets people sign up for a library card. Greet each new reader by name, but don't let an empty name through.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Library Card</title>
    <script src="script.js" defer></script>
  </head>
  <body>
    <h1>City Library</h1>
    <form id="card-form">
      <label for="reader">Your name</label>
      <input id="reader" name="reader" type="text">
      <button type="submit">Get my card</button>
    </form>
    <p id="message"></p>
  </body>
</html>
```

When the form is submitted:

1. Stop the page from reloading.
2. Read the name and trim the spaces off.
3. If the name is empty, show `Please type your name.` in the `#message` paragraph.
4. Otherwise, show the welcome message below and empty the name box, ready for the next reader.

Type `  Ana  ` and press Enter. The page shows:

```
Welcome to the library, Ana! Your card is ready.
```

Click "Get my card" with the box empty (or with only spaces in it), and the page shows:

```
Please type your name.
```

**Rule:** don't add `required` to the input. Do the check in JavaScript. (Remember why? `required` would let a name made of only spaces through.)

<details>
<summary>Hint 1</summary>

Listen for `submit` on the form, not `click` on the button. What's the very first thing your handler should do?

</details>

<details>
<summary>Hint 2</summary>

`trim()` first, then compare the result with `""`. To empty the box, you can set its `.value`, or reset the whole form.

</details>

---

## Exercise 2 (Easy): Split the bill

Four friends had dinner together and want to split the bill, tip included. Build the calculator.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Split the Bill</title>
    <script src="script.js" defer></script>
  </head>
  <body>
    <h1>Split the bill</h1>
    <form id="bill-form">
      <label for="bill">Bill ($)</label>
      <input id="bill" name="bill" type="number" min="0" step="0.01" required>

      <label for="tip">Tip</label>
      <select id="tip" name="tip">
        <option value="10">10%</option>
        <option value="15" selected>15%</option>
        <option value="20">20%</option>
      </select>

      <label for="people">People</label>
      <input id="people" name="people" type="number" min="1" value="2" required>

      <button type="submit">Split it</button>
    </form>
    <p id="result"></p>
  </body>
</html>
```

(`selected` makes 15% the starting choice, the way `checked` does for radio buttons.)

When the form is submitted, work out the tip, the total, and how much each person pays. Show them in `#result`, each with 2 decimal places.

For a bill of `84`, a 15% tip and `4` people, the page shows:

```
Tip: $12.60 | Total: $96.60 | Each pays: $24.15
```

For a bill of `50`, a 20% tip and `3` people:

```
Tip: $10.00 | Total: $60.00 | Each pays: $20.00
```

The fields use `required` and `min`, so the browser already stops empty or negative values. You don't need your own empty checks here.

<details>
<summary>Hint 1</summary>

Every value is a string, even the tip from the dropdown. Convert all three with `Number()` before doing any math.

</details>

<details>
<summary>Hint 2</summary>

The tip is `bill * tipPercent / 100`. Call `toFixed(2)` from [chapter 05](../05-numbers-and-math/notes.md) only at the very end, when you build the text, because it gives you back a string.

</details>

---

## Exercise 3 (Medium): Pizza order

Luigi's Pizza wants an order form that shows a summary and the price before the order goes to the kitchen.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Pizza Order</title>
    <script src="script.js" defer></script>
  </head>
  <body>
    <h1>Luigi's Pizza</h1>
    <form id="order-form">
      <fieldset>
        <legend>Size</legend>
        <input id="small" type="radio" name="size" value="small" checked>
        <label for="small">Small ($8)</label>
        <input id="medium" type="radio" name="size" value="medium">
        <label for="medium">Medium ($10)</label>
        <input id="large" type="radio" name="size" value="large">
        <label for="large">Large ($12)</label>
      </fieldset>

      <fieldset>
        <legend>Toppings ($1.50 each)</legend>
        <input id="mushrooms" type="checkbox" name="topping" value="mushrooms">
        <label for="mushrooms">Mushrooms</label>
        <input id="olives" type="checkbox" name="topping" value="olives">
        <label for="olives">Olives</label>
        <input id="peppers" type="checkbox" name="topping" value="peppers">
        <label for="peppers">Peppers</label>
      </fieldset>

      <label for="method">How do you want it?</label>
      <select id="method" name="method">
        <option value="pickup">Pickup (free)</option>
        <option value="delivery">Delivery (+$3)</option>
      </select>

      <button type="submit">Order</button>
    </form>
    <p id="summary"></p>
  </body>
</html>
```

The prices: a small pizza is $8, a medium is $10, and a large is $12. Each topping adds $1.50, and delivery adds $3.

When the form is submitted, show the order in `#summary`. A large pizza with mushrooms and olives, for delivery:

```
Your order: large pizza with mushrooms, olives, for delivery. Total: $18.00
```

A medium pizza with all three toppings, for pickup:

```
Your order: medium pizza with mushrooms, olives, peppers, for pickup. Total: $14.50
```

The starting choices (small, no toppings, pickup):

```
Your order: small pizza with no toppings, for pickup. Total: $8.00
```

**Rule:** read the form with `FormData`, not with one `querySelector` per field.

<details>
<summary>Hint 1</summary>

`formData.get("size")` gives you the chosen size. The three toppings all share the name `topping`. Which `FormData` method gives you *all* the ticked ones?

</details>

<details>
<summary>Hint 2</summary>

Keep the size prices in an object, like `{ small: 8, medium: 10, large: 12 }`. Then bracket notation from [chapter 11](../11-objects/notes.md) looks up the price for whichever size was chosen.

</details>

<details>
<summary>Hint 3</summary>

The toppings come back as an array. Its `length` tells you how many to charge for, and `join(", ")` from [chapter 10](../10-arrays/notes.md) turns them into text. What should the text say when the array is empty?

</details>

---

## Exercise 4 (Medium): Restaurant feedback

A restaurant asks guests for a star rating and a short comment. Comments must fit on the receipt, so they're limited to 120 characters, and a counter shows how many are left.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Feedback</title>
    <style>
      .error { color: crimson; }
    </style>
    <script src="script.js" defer></script>
  </head>
  <body>
    <h1>How was your meal?</h1>
    <form id="feedback-form">
      <fieldset>
        <legend>Rating</legend>
        <input id="star1" type="radio" name="rating" value="1" required>
        <label for="star1">1</label>
        <input id="star2" type="radio" name="rating" value="2">
        <label for="star2">2</label>
        <input id="star3" type="radio" name="rating" value="3">
        <label for="star3">3</label>
        <input id="star4" type="radio" name="rating" value="4">
        <label for="star4">4</label>
        <input id="star5" type="radio" name="rating" value="5">
        <label for="star5">5</label>
      </fieldset>

      <label for="comment">Your comments</label>
      <textarea id="comment" name="comment" maxlength="120" rows="4"></textarea>
      <p id="counter">120 characters left</p>
      <p id="comment-error" class="error"></p>

      <button type="submit">Send feedback</button>
    </form>
    <p id="thanks"></p>
  </body>
</html>
```

`required` on one radio button makes the whole group required, so the browser already stops a form with no rating. Your job:

1. **Live counter:** as the guest types, update `#counter` to show how many of the 120 characters are left.
2. **Custom check:** when the form is submitted, if the comment (trimmed) is shorter than 10 characters, show `Please write at least 10 characters.` in `#comment-error`, clear `#thanks`, and stop.
3. **Success:** otherwise, clear the error, show the thanks message with the real rating in `#thanks`, and reset the form. After the reset, the counter must say `120 characters left` again.

Type `Great pasta, friendly staff!` and the counter shows:

```
92 characters left
```

Choose 4 stars and click "Send feedback". The form empties, the counter goes back to `120 characters left`, and the page shows:

```
Thanks for the 4-star review!
```

Choose any rating, type `Yum`, and submit. The page shows:

```
Please write at least 10 characters.
```

<details>
<summary>Hint 1</summary>

For the counter, listen for the `input` event on the textarea. The number left is 120 minus the length of what's in the box.

</details>

<details>
<summary>Hint 2</summary>

Does `form.reset()` fire an `input` event? Look back at the notes. If it doesn't, what do you have to update yourself after resetting?

</details>

---

## Exercise 5 (Challenge): Loan calculator

A bank wants a loan calculator on its website. The "Calculate" button stays greyed out until every field is valid, and helpful messages appear while the customer types.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Loan Calculator</title>
    <style>
      .error { color: crimson; }
    </style>
    <script src="script.js" defer></script>
  </head>
  <body>
    <h1>Loan calculator</h1>
    <form id="loan-form">
      <label for="amount">Amount ($1,000 to $500,000)</label>
      <input id="amount" name="amount" type="number" min="1000" max="500000" required>
      <p id="amount-error" class="error"></p>

      <label for="years">Years (1 to 30)</label>
      <input id="years" name="years" type="number" min="1" max="30" required>
      <p id="years-error" class="error"></p>

      <label for="rate">Interest rate (% per year, 0.1 to 20)</label>
      <input id="rate" name="rate" type="number" min="0.1" max="20" step="any" required>
      <p id="rate-error" class="error"></p>

      <button id="calculate-button" type="submit" disabled>Calculate</button>
    </form>

    <p>Monthly payment: <strong id="monthly">-</strong></p>
    <p>Total paid: <strong id="total">-</strong></p>
    <p>Total interest: <strong id="interest">-</strong></p>
  </body>
</html>
```

(`step="any"` lets the rate have any number of decimals, like `4.5` or `3.75`.)

**1. The math.** Write a function `calculateLoan(amount, years, rate)` that returns an object with three numbers: `monthly`, `total` and `interest`. It must not touch the page. Here's the formula banks use:

```
monthlyRate = rate / 100 / 12
months      = years * 12
monthly     = amount * monthlyRate / (1 - (1 + monthlyRate) ** -months)
total       = monthly * months
interest    = total - amount
```

Test it before you build anything else. `console.log(calculateLoan(20000, 5, 6).monthly.toFixed(2));` should print `386.66`.

**2. Live checks.** Every time the user types in any field, go through all three fields. If a field isn't empty but breaks its rules, show its message under it. Otherwise, clear its message. Enable "Calculate" only when the whole form is valid.

| Field | Message |
|---|---|
| `amount` | `Enter an amount from $1,000 to $500,000.` |
| `years` | `Enter 1 to 30 years.` |
| `rate` | `Enter a rate from 0.1% to 20%.` |

For example, type `500` in the amount box. The amount message appears under it, and the button stays greyed out.

**3. The result.** On submit, get the three values with `Object.fromEntries(new FormData(form))` and destructuring from [chapter 15](../15-destructuring-spread-rest/notes.md). Call `calculateLoan`, and show the three results as dollars with `Intl.NumberFormat` from [chapter 05](../05-numbers-and-math/notes.md).

A car loan of `20000` over `5` years at `6`%:

```
Monthly payment: $386.66
Total paid: $23,199.36
Total interest: $3,199.36
```

A home loan of `250000` over `30` years at `4.5`%:

```
Monthly payment: $1,266.71
Total paid: $456,016.78
Total interest: $206,016.78
```

<details>
<summary>Hint 1</summary>

Build it in three steps, and test each one before moving on: first `calculateLoan` with `console.log`, then the submit handler (remove `disabled` from the button while you test it), and the live checks last.

</details>

<details>
<summary>Hint 2</summary>

The messages fit nicely in an object whose keys are the field names: `{ amount: "Enter an amount...", years: ..., rate: ... }`. Loop over `Object.entries()` of it. For each name, you can find the field with `` `#${name}` `` and its message paragraph with `` `#${name}-error` ``.

</details>

<details>
<summary>Hint 3</summary>

A field "isn't empty but breaks its rules" when its `value` isn't `""` and its `checkValidity()` is `false`. And remember: the values from `FormData` are strings. Convert them before calling `calculateLoan`.

</details>

---

## Before you move on

Refresh any of these pages, and everything is gone: the half-written review, the loan you just worked out. Wouldn't it be nice if the page could remember?

[Chapter 23: JSON and Local Storage](../23-json-and-local-storage/notes.md) shows you how to save data in the browser, so it's still there next time. 🙂
