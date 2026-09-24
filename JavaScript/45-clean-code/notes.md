# 45 Clean Code

## What is it?

**Clean code** is code that's easy to read, easy to understand, and easy to change, both for other people and for you in six months' time.

It isn't about clever tricks or fewer lines. Clean code is *clear* code: someone reading it can tell what it does, and why, without having to decode it.

## Why does it matter?

Code is read far more often than it's written. You write a function once, but you (and your teammates) will read it again every time you fix a bug near it, add a feature, or wonder why something happened.

Messy code costs you every single time it's read:

- **Bugs hide in it.** When you can't easily see what code does, you can't easily see what it does *wrong*.
- **Changes get scary.** If you don't understand a function, you're afraid to touch it, so problems pile up.
- **Your future self is a stranger.** In six months, you'll have forgotten why you wrote `x * 0.85`. Write for that person.

The good news: clean code is mostly a set of small habits. None of them are hard, and every idea in this chapter comes as a before/after pair, so you can see the difference for yourself.

## Real-world example

Think of a kitchen.

You can cook a great meal in a messy kitchen, as long as you're the one who made the mess. The trouble starts when someone else cooks there, or when you come back after a month away. Is the white powder in that unlabeled jar salt or sugar?

| Messy kitchen | Tidy kitchen | In code |
|---|---|---|
| Three identical jars with no labels | Every jar has a label | Meaningful names |
| One giant drawer for everything | A drawer for each kind of thing | Small functions that each do one job |
| A recipe that says "add 2 of the white stuff" | "Add 2 teaspoons of sugar" | Named constants, not mystery numbers |
| The same sauce recipe scribbled in five places | One recipe card that everyone uses | Don't repeat yourself |
| A note saying "stir" | A note saying "stir all the time, or it burns" | Comments that explain *why* |

A tidy kitchen doesn't make the food taste better. It makes cooking faster, safer, and possible for more than one person. Clean code does the same for programs.

## How it works

In most of the before/after pairs below, the "after" does exactly what the "before" does. Only the way it reads changes. (Two of them also fix a bug, and they'll tell you when.)

### Meaningful names

Names are the labels on your jars. A good name tells the reader what something *is* or what it *does*, so they don't have to work it out.

Before:

```js
function calc(d, t) {
  const x = d / t;
  return x > 100;
}

console.log(calc(300, 2)); // prints: true
```

After:

```js
function isSpeeding(distanceKm, hours) {
  const speedKmh = distanceKm / hours;
  return speedKmh > 100;
}

console.log(isSpeeding(300, 2)); // prints: true
```

Same logic, but now you can read it out loud and it makes sense. Some simple rules:

| Kind of thing | Name it with | Examples |
|---|---|---|
| A value | A noun | `total`, `userName`, `speedKmh` |
| A list | A plural noun | `products`, `scores`, `openOrders` |
| A function | A verb | `calculateTotal`, `sendReminder`, `formatPrice` |
| A true/false value, or a function that answers yes or no | `is`, `has`, or `can` | `isOpen`, `hasDiscount`, `canVote`, `isSpeeding` |

A few more habits that help:

- **A function that only works out a value** can be named after that value instead of a verb, like `average(numbers)` or `shippingCost(order)`. What matters is that the name says what you get back.
- **Put units in the name** when there are any: `delayMs`, `weightKg`, `priceInCents`.
- **Avoid vague names** like `data`, `info`, `temp`, or `doStuff`. They tell the reader nothing.
- **Avoid shortening words**: `customer` beats `cstmr`. Short, well-known names like `i` in a small loop, or `a` and `b` in a sort compare function, are fine.
- **Be consistent.** If you call it `fetchUser` in one place, don't call the same idea `getCustomer` somewhere else.

There's still a mystery number in `isSpeeding`, though. What is `100`? That's next.

### No magic numbers

A **magic number** is a number in your code with no explanation. It works like magic: nobody knows why it's there, and nobody dares change it.

Before:

```js
function finalPrice(price) {
  if (price > 50) {
    return price * 1.2;
  }
  return price * 1.2 + 4.99;
}
```

What's `1.2`? What's `50`? Is the `4.99` the same `4.99` that appears in the checkout code, or a different one?

After:

```js
const TAX_RATE = 0.2;
const FREE_SHIPPING_OVER = 50;
const SHIPPING_FEE = 4.99;

function finalPrice(price) {
  const priceWithTax = price * (1 + TAX_RATE);
  if (price > FREE_SHIPPING_OVER) {
    return priceWithTax;
  }
  return priceWithTax + SHIPPING_FEE;
}

console.log(finalPrice(40).toFixed(2)); // prints: 52.99
```

Now the numbers have names, and each lives in exactly one place. When the tax rate changes, you change one line.

Notice the `UPPER_SNAKE_CASE` names: capital letters with underscores between the words. That's the usual way to write a **constant**: a fixed setting that's known before the program runs and never changes. Ordinary `const` variables inside functions, like `priceWithTax`, stay in camelCase.

Not every number is magic. `0`, `1`, `* 2` for doubling, or `/ 100` for a percentage are usually clear on their own. Ask yourself: would a new reader know what this number means?

### Small functions that do one thing

A function should do one job, and its name should say what that job is. If you need the word "and" to describe it, like "checks the cart *and* works out the total *and* prints a receipt", it's doing too much.

Before:

```js
function checkout(cart) {
  // check the cart
  if (cart.length === 0) {
    console.log("Your cart is empty.");
    return;
  }
  // work out the total
  let total = 0;
  for (const item of cart) {
    total += item.price * item.quantity;
  }
  // print the receipt
  for (const item of cart) {
    console.log(`${item.name} x${item.quantity}: $${(item.price * item.quantity).toFixed(2)}`);
  }
  console.log(`Total: $${total.toFixed(2)}`);
}
```

Look at those comments: `// check the cart`, `// work out the total`, `// print the receipt`. When you need a comment to label a *section* of a function, that section usually wants to be its own function, with the comment as its name.

After:

```js
function lineTotal(item) {
  return item.price * item.quantity;
}

function cartTotal(cart) {
  return cart.reduce((sum, item) => sum + lineTotal(item), 0);
}

function printReceipt(cart) {
  for (const item of cart) {
    console.log(`${item.name} x${item.quantity}: $${lineTotal(item).toFixed(2)}`);
  }
  console.log(`Total: $${cartTotal(cart).toFixed(2)}`);
}

function checkout(cart) {
  if (cart.length === 0) {
    console.log("Your cart is empty.");
    return;
  }
  printReceipt(cart);
}
```

Try both versions with the same cart:

```js
checkout([
  { name: "Notebook", price: 3.5, quantity: 2 },
  { name: "Pen", price: 1.25, quantity: 4 },
]);
```

Both print exactly the same:

```
Notebook x2: $7.00
Pen x4: $5.00
Total: $12.00
```

The "after" version is longer, and that's fine. Clean doesn't mean short. What you gained:

- `checkout` now reads like a table of contents: check the cart, then print the receipt.
- `item.price * item.quantity` lives in one place (`lineTotal`) instead of two.
- Each small function can be reused on its own, and tested on its own ([chapter 46](../46-testing/notes.md)).

### Guard clauses instead of deep nesting

You met guard clauses in [chapter 18](../18-error-handling/notes.md): checks at the top of a function that leave early. They're one of the quickest ways to make code easier to read.

Before:

```js
function checkLoan(member, book) {
  if (member) {
    if (member.isActive) {
      if (book.copiesLeft > 0) {
        return `${member.name} can borrow ${book.title}`;
      } else {
        return "Sorry, no copies left";
      }
    } else {
      return "Your membership has expired";
    }
  } else {
    return "Please sign in first";
  }
}
```

To find out what happens when a member isn't signed in, your eyes have to travel all the way to the bottom and match up the braces. Deeply nested code like this drifts to the right, and it gets harder to follow with every level.

After:

```js
function checkLoan(member, book) {
  if (!member) {
    return "Please sign in first";
  }
  if (!member.isActive) {
    return "Your membership has expired";
  }
  if (book.copiesLeft <= 0) {
    return "Sorry, no copies left";
  }

  return `${member.name} can borrow ${book.title}`;
}
```

Each problem gets one flat check, right next to its message. The normal case, the **happy path**, sits at the bottom with nothing wrapped around it.

### DRY, KISS, and YAGNI

These three short rules of thumb come up all the time. You met KISS and YAGNI briefly in [chapter 44](../44-design-patterns/notes.md).

**DRY** ("Don't Repeat Yourself"): each piece of knowledge should live in one place. When the same logic is copied around, a fix in one copy gets forgotten in the others.

Before:

```js
const shirtPrice = 20 - 20 * 0.15;
const shoesPrice = 60 - 60 * 0.15;
const hatPrice = 12 - 12 * 0.15;
```

After:

```js
const SALE_DISCOUNT = 0.15;

function salePrice(price) {
  return price - price * SALE_DISCOUNT;
}

const shirtPrice = salePrice(20); // 17
const shoesPrice = salePrice(60); // 51
const hatPrice = salePrice(12); // 10.2
```

When the sale changes to 20% off, you change one number instead of hunting for every `0.15`.

But be careful: DRY is about repeated *knowledge*, not code that happens to look alike. Two bits of code can look the same today and need to change for different reasons tomorrow. A common rule of thumb is to wait until you've written the same thing three times before you pull it into a shared function.

**KISS** ("Keep It Simple"): pick the plain, obvious solution over the clever one.

Before:

```js
function isWeekend(day) {
  return [0, 6].indexOf(day) !== -1 ? true : false;
}
```

After:

```js
function isWeekend(day) {
  return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
}
```

A comparison already gives you `true` or `false`, so `? true : false` adds nothing. And a reader understands `day === 0 || day === 6` at a glance.

**YAGNI** ("You Aren't Gonna Need It"): don't build features or options "just in case". Unused options still have to be read, tested, and kept working.

Before:

```js
function greet(name, greeting = "Hello", punctuation = "!", shout = false, times = 1) {
  // ...20 lines handling options that nobody uses
}
```

After:

```js
function greet(name) {
  return `Hello, ${name}!`;
}
```

When a real need for another option shows up, add it then. You'll know much more about what's needed by that point.

### Comments explain why, not what

The code already says *what* it does. A comment that repeats it is just noise, and it can go out of date. Save comments for what the code *can't* say: why it's done this way.

Before:

```js
// multiply the price by the quantity
const cost = price * quantity;

// add 1 to the page index
const pageNumber = pageIndex + 1;
```

After:

```js
const cost = price * quantity;

// The API counts pages from 0, but people count from 1.
const pageNumber = pageIndex + 1;
```

Good reasons to write a comment:

- **Why** something looks odd: "The bank rejects amounts with more than 2 decimal places, so we round here."
- **A warning**: "Don't reorder these steps: the stock must be checked before charging the card."
- **A note for later**: `// TODO: support gift cards`.

> **Tip:** a comment just above a function that starts with `/**` is a **doc comment**. VS Code shows it when you hover over the function's name anywhere in your code, which makes it a handy place to explain what a function expects and returns.

### Consistent formatting

**Formatting** is the layout of your code: spaces, indentation, line breaks, quotes, semicolons. JavaScript doesn't care about most of it, but people do.

Before:

```js
function   sumPrices(items){
let sum=0
  for(const item of items){ sum+=item.price }
    return sum}
```

After:

```js
function sumPrices(items) {
  let sum = 0;
  for (const item of items) {
    sum += item.price;
  }
  return sum;
}
```

Both work. Only one is pleasant to read. The exact style matters less than using the *same* style everywhere. The best way is to let a tool do it for you: **Prettier** can reformat your whole file every time you save. You'll set it up in [chapter 50](../50-tooling/notes.md).

### An options object instead of a long parameter list

What do `true`, `false`, and `30` mean here?

Before:

```js
createAccount("Sam", "sam@example.com", true, false, 30);
```

You'd have to open the function to find out, and it's easy to mix up the order. The options object from [chapter 15](../15-destructuring-spread-rest/notes.md) fixes both problems:

After:

```js
function createAccount({ name, email, newsletter = false, isAdmin = false, trialDays = 14 }) {
  return { name, email, newsletter, isAdmin, trialDays };
}

const account = createAccount({
  name: "Sam",
  email: "sam@example.com",
  newsletter: true,
  trialDays: 30,
});

console.log(account.trialDays, account.isAdmin); // prints: 30 false
```

Now every value is labeled at the place where it's used, the order doesn't matter, and you can leave out anything that has a sensible default. A good rule of thumb: once a function needs more than three parameters, or any true/false flags, reach for an options object.

### Avoid shared global state

**Global state** is data that lives outside your functions, where any function can read it and change it. It causes bugs that are hard to find, because the result of a function depends on what *other* code did earlier.

Before:

```js
let discount = 0;

function applyVoucher(code) {
  if (code === "SAVE10") {
    discount = 10;
  }
}

function checkoutTotal(subtotal) {
  return subtotal - discount;
}

applyVoucher("SAVE10");
console.log(checkoutTotal(50)); // prints: 40
console.log(checkoutTotal(80)); // prints: 70  <- the next customer got the voucher too!
```

After:

```js
function voucherDiscount(code) {
  return code === "SAVE10" ? 10 : 0;
}

function checkoutTotal(subtotal, voucherCode) {
  return subtotal - voucherDiscount(voucherCode);
}

console.log(checkoutTotal(50, "SAVE10")); // prints: 40
console.log(checkoutTotal(80)); // prints: 80
```

This one is more than a tidy-up: it fixes a real bug. Each function now gets everything it needs through its parameters and hands back a result, like the pure functions in [chapter 43](../43-functional-programming/notes.md). Nothing leaks from one customer to the next.

### Fail loudly

When something is wrong, say so straight away, with a clear message. Code that quietly carries on with bad data is much harder to debug later.

Before:

```js
function lineTotal(price, quantityText) {
  const quantity = Number(quantityText);
  return price * quantity;
}

console.log(lineTotal(4.5, "2")); // prints: 9
console.log(lineTotal(4.5, "two")); // prints: NaN
```

That `NaN` won't crash anything. It will quietly flow into the cart total, and a customer will see "Total: $NaN" days later, far away from the line that caused it.

After:

```js
function lineTotal(price, quantityText) {
  const quantity = Number(quantityText);
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error(`Invalid quantity: "${quantityText}"`);
  }
  return price * quantity;
}

console.log(lineTotal(4.5, "2")); // prints: 9
console.log(lineTotal(4.5, "two"));
// Error: Invalid quantity: "two"
```

This is the second bug fix: the problem now shows up at the exact spot where it happens, with a message that says what's wrong. A loud crash today beats a quiet wrong answer next month. (Chapter 18 covers when to catch errors like this one.)

### Refactor in small steps

**Refactoring** means changing how code is written *without* changing what it does. Every "before → after" in this chapter is a refactoring (apart from the two bug fixes).

The safe way to refactor is in small steps:

1. **Run the code and save what it prints**, so you know what "working" looks like. (Tests do this job even better. They're next, in chapter 46.)
2. **Make one small change**: rename one variable, or pull one piece into a function.
3. **Run it again and compare.** Same output? Great, keep going. Different? Undo that one step and look closer.
4. **Repeat.**

Small steps mean that when something breaks, you know exactly which change broke it.

> **Tip:** VS Code can do some refactorings for you. Click a name and press `F2` (**Rename Symbol**) to rename it everywhere it's used, in one go. Select a few lines and press `Ctrl+Shift+R` to see the **Refactor** menu, which can pull the selected lines out into a new function for you.

Also, don't mix refactoring with fixing bugs or adding features. Do one kind of change at a time. If you find a bug while you're tidying up, write it down, finish the tidy-up, and then fix the bug as a separate step.

## Common mistakes

**1. Changing the behavior while "cleaning up"**

```js
// Before
function canRentCar(age) {
  if (age >= 21) {
    return true;
  }
  return false;
}

console.log(canRentCar(21)); // prints: true
```

```js
// After "cleaning up"
const MIN_RENTAL_AGE = 21;

function canRentCar(age) {
  return age > MIN_RENTAL_AGE;
}

console.log(canRentCar(21)); // prints: false
```

The new version is shorter and has a named constant, but `>=` quietly became `>`. Every 21-year-old is now turned away. This is why you run the code before and after every small step, and compare. The fix: `return age >= MIN_RENTAL_AGE;`

**2. A name that lies**

```js
function getHighScore(scores) {
  scores.sort((a, b) => b - a);
  return scores[0];
}

const scores = [40, 95, 70];
console.log(getHighScore(scores)); // prints: 95
console.log(scores); // prints: [ 95, 70, 40 ]  <- the original order is gone
```

A name starting with `get` promises to *look*, not to *change*. But `sort` changes the array it's called on ([chapter 16](../16-values-vs-references/notes.md)), so the caller's list got rearranged behind their back. Either make the function match its name (`Math.max(...scores)`, or `toSorted`), or give it an honest name.

**3. A comment that lies**

```js
// Members get 10% off
const memberPrice = price * 0.85;
```

Is the discount 10% or 15%? Someone changed the code and forgot the comment. Now nobody knows which one is right. Comments don't get checked when the code runs, so they go out of date without anyone noticing. Here, a named constant says it better, and it can't go out of date:

```js
const MEMBER_DISCOUNT = 0.15;
const memberPrice = price * (1 - MEMBER_DISCOUNT);
```

**4. Over-DRY: forcing different things into one function**

```js
function format(value, type) {
  if (type === "price") {
    return `$${value.toFixed(2)}`;
  }
  if (type === "percent") {
    return `${value * 100}%`;
  }
  if (type === "date") {
    return value.toISOString().slice(0, 10);
  }
}

console.log(format(5, "price")); // prints: $5.00
console.log(format(5, "Price")); // prints: undefined
```

These three jobs share nothing except the word "format". Squashing them together made one function that's harder to read and easy to call wrongly. Three small functions, `formatPrice`, `formatPercent`, and `formatDate`, would each be clearer, and a typo in a function name gives you a helpful `ReferenceError` instead of a silent `undefined`.

## Quick recap

- Code is read far more often than it's written, so write it for the reader (including future you).
- Use names that explain themselves: nouns for values, verbs for functions, `is`/`has`/`can` for true/false values.
- Replace magic numbers with named constants in `UPPER_SNAKE_CASE`, and keep functions small, each doing one job.
- Use guard clauses instead of deep nesting, and an options object instead of a long list of parameters.
- DRY, KISS, and YAGNI: don't repeat knowledge, keep it simple, and don't build things you don't need yet.
- Comments explain *why*. Let a tool like Prettier handle formatting. Avoid shared global state, and fail loudly.
- Refactor in small steps, and check that the output stays the same after every step.

---

**Next:** try the [exercises](exercises.md), then move on to [46 Testing](../46-testing/notes.md).
