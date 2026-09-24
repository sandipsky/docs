# 09 Functions: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.js`, `ex2.js`, and so on).
- Run each one with `node ex1.js` from a terminal opened in this folder.
- Unless an exercise says otherwise, write named functions as function declarations, and make them **return** their answers. Do the printing outside the function.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Temperature converter

You're planning a trip, and the weather apps keep mixing up Celsius and Fahrenheit. Write two functions:

- `celsiusToFahrenheit(celsius)`: the formula is F = C × 9 / 5 + 32
- `fahrenheitToCelsius(fahrenheit)`: the formula is C = (F - 32) × 5 / 9

Each function must **return** the answer, rounded to 1 decimal place. Then call them to print:

```
0°C = 32°F
100°C = 212°F
37°C = 98.6°F
-40°C = -40°F
98.6°F = 37°C
451°F = 232.8°C
0°F = -17.8°C
```

(You can copy the `°` symbol from this page, or leave it out.)

<details>
<summary>Hint 1</summary>

In JavaScript, × is `*`. Use parentheses for the `(F - 32)` part, so the subtraction happens first.

</details>

<details>
<summary>Hint 2</summary>

To round to 1 decimal place and keep a number, multiply by 10, round, then divide by 10: `Math.round(value * 10) / 10`. Do the rounding inside the function, just before you return.

</details>

---

## Exercise 2 (Easy): Workout tracker helpers

A fitness app needs three small helper functions. Each one takes the length of a workout in minutes:

- `formatDuration(minutes)` returns a string like `"1h 30m"`
- `getCaloriesBurned(minutes)` returns the calories burned, at 8 calories per minute
- `isLongWorkout(minutes)` returns `true` if the workout is 60 minutes or more, and `false` if not

Start with:

```js
const workoutMinutes = 90;
```

Expected output:

```
Workout: 1h 30m
Calories burned: 720
Long workout: true
```

Change `workoutMinutes` to `45`, and you should see:

```
Workout: 0h 45m
Calories burned: 360
Long workout: false
```

**Rule:** write all three as arrow functions with an implicit return: no curly braces and no `return` keyword.

<details>
<summary>Hint 1</summary>

For the hours, how many whole times does 60 go into the minutes? `Math.floor` from [chapter 05](../05-numbers-and-math/notes.md) can help. For the leftover minutes, think `%`.

</details>

<details>
<summary>Hint 2</summary>

An arrow function can return a template literal, a calculation, or a comparison directly. A comparison like `minutes >= 60` is already `true` or `false`, so you don't need an `if`.

</details>

---

## Exercise 3 (Medium): Bug hunt

This gym membership calculator has **3 bugs**. Copy it into `ex3.js`, run it, and fix one bug at a time.

```js
// Gym membership calculator
function getMonthlyPrice(yearlyPrice) {
  console.log(yearlyPrice / 12);
}

const getStudentPrice = (price) => {
  price * 0.8;
};

function formatPrice(amount) {
  return `$${amount.toFixed(2)}`;
}

function getTotalCost(monthlyPrice, months) {
  return monthlyPrice * months;
}

const yearlyPrice = 600;
const monthlyPrice = getMonthlyPrice(yearlyPrice);
const studentPrice = getStudentPrice(monthlyPrice);

console.log(`Yearly: ${formatPrice(yearlyPrice)}`);
console.log(`Monthly: ${formatPrice(monthlyPrice)}`);
console.log(`Student monthly: ${formatPrice(studentPrice)}`);
console.log(`3 months: ${formatPrice(getTotalCost(3))}`);
```

When it's fixed, you should see exactly this (and nothing else):

```
Yearly: $600.00
Monthly: $50.00
Student monthly: $40.00
3 months: $150.00
```

<details>
<summary>Hint 1</summary>

The first run prints a lonely `50` at the top and then crashes with `TypeError: Cannot read properties of undefined (reading 'toFixed')`. The error points at `formatPrice`, but `formatPrice` is fine! It was handed `undefined`. Follow that value back: where did it come from?

</details>

<details>
<summary>Hint 2</summary>

Two of the bugs are about the difference between showing an answer and handing it back. Look again at "console.log vs return" and at the arrow function mistake in the notes.

</details>

<details>
<summary>Hint 3</summary>

If you get `3 months: $NaN`, count how many arguments `getTotalCost` expects, and how many it's getting.

</details>

---

## Exercise 4 (Medium): The coffee machine

Time to build the coffee machine from the notes! Write a function `orderCoffee(drink, size)` that **returns** a message for the customer.

The menu:

| Drink | Price (medium) |
|---|---|
| `"espresso"` | $2.50 |
| `"latte"` | $3.50 |
| `"cappuccino"` | $3.75 |

A `"small"` costs $0.50 less, and a `"large"` costs $1.00 more.

**Rules:**

- If the customer doesn't say which drink, they get an espresso. If they don't say which size, it's a medium. Use default parameters for this.
- If the drink isn't on the menu, return `Sorry, we don't make DRINK.` (with the drink's name) straight away.
- The function must return the message, not print it.

Call it like this:

```js
console.log(orderCoffee("latte", "large"));
console.log(orderCoffee("cappuccino"));
console.log(orderCoffee());
console.log(orderCoffee("tea", "small"));
console.log(orderCoffee("latte", "small"));
```

Expected output:

```
Here's your large latte. That's $4.50, please.
Here's your medium cappuccino. That's $3.75, please.
Here's your medium espresso. That's $2.50, please.
Sorry, we don't make tea.
Here's your small latte. That's $3.00, please.
```

<details>
<summary>Hint 1</summary>

Default parameters go right in the parentheses: `function orderCoffee(drink = "espresso", size = "medium")`.

</details>

<details>
<summary>Hint 2</summary>

A `switch` on the drink ([chapter 07](../07-conditionals/notes.md)) is a nice way to set the base price. Its `default` case is the perfect spot for the early `return` for drinks that aren't on the menu.

</details>

<details>
<summary>Hint 3</summary>

Once you have the base price in a `let` variable, adjust it for the size. Then build the message with a template literal, using `toFixed(2)` for the price.

</details>

---

## Exercise 5 (Challenge): Password strength checker

A sign-up page tells people how strong their new password is. Build it from small functions that work together:

- `countDigits(text)` returns how many digits (`0` to `9`) the text contains.
- `hasUppercase(text)` returns `true` if the text contains at least one capital letter.
- `getPasswordStrength(password)` returns `"weak"`, `"medium"`, or `"strong"`:
  - **weak:** fewer than 8 characters
  - **strong:** at least 12 characters, at least one capital letter, **and** at least 2 digits
  - **medium:** everything else
- `maskPassword(password)` returns the password with everything after the first 2 characters hidden by `*`. Real apps never show passwords on the screen, so `"Sunshine2026"` becomes `"Su**********"`.
- `printStrength(password)` prints the masked password and its strength.

Call `printStrength` with these passwords:

```js
printStrength("cat123");
printStrength("sunshine");
printStrength("Sunshine2026");
printStrength("sunshine2026");
printStrength("CorrectHorse9");
```

Expected output:

```
ca****: weak
su******: medium
Su**********: strong
su**********: medium
Co***********: medium
```

**Rule:** `getPasswordStrength` must use `countDigits` and `hasUppercase`, and `printStrength` must use `maskPassword` and `getPasswordStrength`. Only `printStrength` prints anything.

<details>
<summary>Hint 1</summary>

`countDigits` is a loop over the characters with a counter, like the Mississippi example in [chapter 08](../08-loops/notes.md). The string `"0123456789"` and `includes` can tell you whether a character is a digit.

</details>

<details>
<summary>Hint 2</summary>

How can you tell if a character is a capital letter? A capital letter changes when you make it lowercase, and other characters don't. So compare the character with its `toLowerCase()` version. And as soon as you find one capital, you can `return true` straight away, even from inside the loop.

</details>

<details>
<summary>Hint 3</summary>

In `getPasswordStrength`, use guard clauses: check for "weak" first and return early. Then check the "strong" rules. Whatever is left is "medium". For `maskPassword`, remember `slice` and `repeat` from [chapter 06](../06-strings/notes.md).

</details>

---

## Before you move on

You checked five passwords with five separate lines of code. What if a website had 10,000 passwords to check? Or a shop had 500 products? You'd want to keep them all together in one list, and loop over it.

That list is called an array, and it's what [chapter 10](../10-arrays/notes.md) is about. 🙂
