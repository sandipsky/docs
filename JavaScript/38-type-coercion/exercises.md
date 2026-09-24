# 38 Type Coercion: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.js`, `ex2.js`, and so on).
- Run each one with `node ex1.js` from a terminal opened in this folder.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Predict the output

Type these lines into `ex1.js`, but **don't run it yet**. Next to each line, write a comment with what you think it prints.

```js
console.log("3" + 4);
console.log("3" - 4);
console.log("3" * "4");
console.log(3 + 4 + "5");
console.log("3" + 4 + 5);
console.log(true + 1);
console.log("7" > "10");
console.log(Number(""));
console.log(Number(" 12 "));
console.log(Boolean("0"));
```

Now run it and compare. For every line you got wrong, add a second comment saying which rule from the notes explains it.

<details>
<summary>Check your predictions</summary>

```
34
-1
12
75
345
2
true
0
12
true
```

</details>

<details>
<summary>Hint</summary>

For each line, ask two questions. Which operator is it (`+` behaves differently from `-`, `*` and the comparisons)? And what types are on each side?

</details>

---

## Exercise 2 (Easy): Cinema booking form

A cinema's booking form sends the number of adults, the number of children, and the ticket price. Form values are always strings, and the code below forgot that:

```js
// These arrived from a booking form, so they're all strings.
const adults = "2";
const children = "3";
const ticketPrice = "12";

const people = adults + children;
const cost = people * ticketPrice;

console.log(`People: ${people}`);
console.log(`Cost: $${cost}`);
```

Run it, and you'll see:

```
People: 23
Cost: $276
```

Fix it, so it prints:

```
People: 5
Cost: $60
```

**Rule:** convert each value once, near the top, and don't change the two `console.log` lines.

<details>
<summary>Hint 1</summary>

Why is `people` wrong, but `cost` still gives a number? Look at which operator each line uses.

</details>

<details>
<summary>Hint 2</summary>

Wrap each form value in the conversion function from this chapter, right where it's created. Then every line below it works with real numbers.

</details>

---

## Exercise 3 (Medium): Loose, strict, or `Object.is`?

Write a function `compare(label, a, b)` that prints how `==`, `===` and `Object.is` each judge the same pair of values. Test it with:

```js
compare('"1" and 1', "1", 1);
compare('"" and 0', "", 0);
compare('"0" and false', "0", false);
compare("null and undefined", null, undefined);
compare("null and 0", null, 0);
compare('"true" and true', "true", true);
compare("NaN and NaN", NaN, NaN);
compare("0 and -0", 0, -0);
compare('[] and ""', [], "");
```

Expected output:

```
"1" and 1 -> ==: true, ===: false, Object.is: false
"" and 0 -> ==: true, ===: false, Object.is: false
"0" and false -> ==: true, ===: false, Object.is: false
null and undefined -> ==: true, ===: false, Object.is: false
null and 0 -> ==: false, ===: false, Object.is: false
"true" and true -> ==: false, ===: false, Object.is: false
NaN and NaN -> ==: false, ===: false, Object.is: true
0 and -0 -> ==: true, ===: true, Object.is: false
[] and "" -> ==: true, ===: false, Object.is: false
```

Then, for every line where `==` says `true` but `===` says `false`, add a comment above that `compare` call naming the `==` rule (from the notes) that made it `true`.

<details>
<summary>Hint 1</summary>

The label is only there for printing. The function compares `a` and `b`, and puts the three results into one template literal.

</details>

<details>
<summary>Hint 2</summary>

This is one of the few times you'll write `==` on purpose, just to see what it does. Keep using `===` in your real code.

</details>

---

## Exercise 4 (Medium): A safe number reader

Text from a form can be anything: a number, extra spaces, words, or nothing at all. Write a function `readNumber(text)` that returns a number when the text really is one, and `null` when it isn't:

- Ignore spaces at the start and the end.
- Empty text (or only spaces) gives `null`, **not** `0`.
- Text that isn't a number gives `null`.
- Anything else gives the number.

Test it with:

```js
const inputs = ["5", " 12 ", "", "   ", "abc", "3.5", "0", "7 apples"];
for (const text of inputs) {
  console.log(`"${text}" -> ${readNumber(text)}`);
}
```

Expected output:

```
"5" -> 5
" 12 " -> 12
"" -> null
"   " -> null
"abc" -> null
"3.5" -> 3.5
"0" -> 0
"7 apples" -> null
```

<details>
<summary>Hint 1</summary>

`Number("")` is `0`, which is why empty text needs its own check. Do that check after trimming, so text with only spaces counts as empty too.

</details>

<details>
<summary>Hint 2</summary>

After converting, how do you find out whether you got `NaN`? Remember that `NaN === NaN` is `false`, so you need the special check from chapter 05.

</details>

<details>
<summary>Hint 3</summary>

Watch the `"0"` line. If you check the number with something like `if (!number)`, you'll wrongly turn `0` into `null`, because `0` is falsy.

</details>

---

## Exercise 5 (Challenge): Debug the checkout

This checkout page gets every value from a web form, so everything is a string. The code runs without a single error, but it has **three coercion bugs**. Copy it into `ex5.js`:

```js
// Everything here arrived as text, from a web form.
const order = [
  { name: "Notebook", price: "3.50", quantity: "2" },
  { name: "Backpack", price: "34.99", quantity: "1" },
  { name: "Pen set", price: "6.25", quantity: "3" }
];
const extraNotebooks = "2"; // the customer asked for 2 more notebooks
const giftWrap = "0";       // "0" means no gift wrap, "1" means yes

order[0].quantity = order[0].quantity + extraNotebooks;

let mostExpensive = order[0];
let total = 0;
for (const item of order) {
  console.log(`${item.name} x${item.quantity}`);
  if (item.price > mostExpensive.price) {
    mostExpensive = item;
  }
  total = total + item.price * item.quantity;
}
if (giftWrap) {
  total = total + 2; // gift wrap costs $2
}

console.log(`Most expensive: ${mostExpensive.name}`);
console.log(`Total: $${total.toFixed(2)}`);
```

Right now, it prints:

```
Notebook x22
Backpack x1
Pen set x3
Most expensive: Pen set
Total: $132.74
```

Find and fix all three bugs, so it prints:

```
Notebook x4
Backpack x1
Pen set x3
Most expensive: Backpack
Total: $67.74
```

**Rule:** instead of sprinkling `Number()` all over the code, convert the order's prices and quantities once, before anything else uses them.

<details>
<summary>Hint 1</summary>

Look at each wrong line of output, and ask which operator produced it. `x22` comes from `+`. The wrong "most expensive" comes from `>`. And the extra $2 comes from an `if`.

</details>

<details>
<summary>Hint 2</summary>

A small `for...of` loop right after the `order` array can replace each item's `price` and `quantity` with a real number. Don't forget that `extraNotebooks` is a string too.

</details>

<details>
<summary>Hint 3</summary>

For the gift wrap, remember that `"0"` is truthy. Compare the value with exactly what "yes" looks like.

</details>

<details>
<summary>Hint 4</summary>

Interesting detail: the line `total = total + item.price * item.quantity` was never a bug. Why not? Which operator runs first, and what does it do with strings?

</details>

---

## Before you move on

Chapter 39 is a project: a real weather app. Keep an eye on where each value comes from. The city name the user types is a string. The temperatures inside the API's JSON are already real numbers. Convert at the edges, as you did here, and none of this chapter's surprises will catch you.

On to [39 Project: Weather App](../39-project-weather-app/notes.md). ⛅
