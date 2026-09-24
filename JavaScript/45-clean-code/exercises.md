# 45 Clean Code: Exercises

**How to do these:**

- Every exercise gives you some messy code that works. Copy it into a new file in this folder (`ex1.js`, `ex2.js`, and so on) and run it with `node ex1.js` **before** you change anything.
- Then clean it up in small steps. After every step, run it again. The output must stay **exactly** the same as the expected output shown. That's how you know you refactored, instead of breaking something.
- Keep a copy of the messy version (like `ex1-before.js`) so you can compare. In VS Code, right-click one file, choose **Select for Compare**, then right-click the other and choose **Compare with Selected**.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Name game

A step-counter app works fine, but nobody can tell what anything means:

```js
function f(a, b) {
  return a * b;
}

function chk(n) {
  if (n >= 10000) {
    return true;
  }
  return false;
}

const d = [8200, 12050, 10000, 4300, 15800];
let t = 0;
let c = 0;

for (const s of d) {
  t += s;
  if (chk(s)) {
    c++;
  }
}

console.log(`Total steps: ${t}`);
console.log(`Days at goal: ${c}`);
console.log(`Distance walked: ${f(t, 0.0008).toFixed(1)} km`);
```

Give every function, parameter, and variable a name that explains itself. Use the naming table from the notes: verbs for functions, `is`/`has`/`can` for true/false, plural nouns for lists.

Expected output (before and after):

```
Total steps: 50350
Days at goal: 3
Distance walked: 40.3 km
```

**Rule:** change names only. Leave the numbers and the logic alone (the next exercise deals with the numbers).

**Bonus:** `chk` can become a one-line function without changing what it returns. How?

<details>
<summary>Hint 1</summary>

Work out what each thing *is* before you rename it. `d` holds one number per day: what are those numbers? `c` goes up by one for each day that... what?

</details>

<details>
<summary>Hint 2</summary>

Try VS Code's **Rename Symbol**: click a name and press `F2`. It renames every place that name is used, so you can't miss one.

</details>

---

## Exercise 2 (Easy): Gym fees

A gym's fee calculator is full of numbers that only the person who wrote it understands:

```js
function monthlyFee(age, months, hasTowelService) {
  let fee = 35;
  if (age < 18 || age >= 65) {
    fee = fee * 0.6;
  }
  if (months >= 12) {
    fee = fee - 5;
  }
  if (hasTowelService) {
    fee = fee + 4;
  }
  return fee;
}

console.log(`Adult, 1 month: $${monthlyFee(30, 1, false)}`);
console.log(`Teen, 12 months, towel: $${monthlyFee(16, 12, true)}`);
console.log(`Senior, 6 months, towel: $${monthlyFee(70, 6, true)}`);
console.log(`Adult, 24 months: $${monthlyFee(45, 24, false)}`);
```

Replace every magic number inside `monthlyFee` with a named constant, declared at the top of the file.

Expected output (before and after):

```
Adult, 1 month: $35
Teen, 12 months, towel: $20
Senior, 6 months, towel: $25
Adult, 24 months: $30
```

**Rule:** no bare numbers left inside `monthlyFee`. The constants use `UPPER_SNAKE_CASE`.

When you're done, imagine the gym puts the price up to $38. How many lines would you change now?

<details>
<summary>Hint 1</summary>

There are seven numbers in `monthlyFee`. For each one, ask: "What would I call this if I had to explain it to a new member of staff?" `35` might be `BASE_FEE`.

</details>

<details>
<summary>Hint 2</summary>

`18` and `65` are both age limits, but they mean different things. Give them different names that say which is which.

</details>

---

## Exercise 3 (Medium): Cinema door

The ticket scanner at a cinema door runs this check. It works, but it's a staircase of `if`s:

```js
function checkTicket(ticket, movie) {
  if (ticket) {
    if (ticket.movieId === movie.id) {
      if (!ticket.used) {
        if (ticket.age >= movie.minAge) {
          return `Enjoy ${movie.title}! Screen ${movie.screen}`;
        } else {
          return `Sorry, ${movie.title} is for ages ${movie.minAge}+`;
        }
      } else {
        return "This ticket has already been used";
      }
    } else {
      return "This ticket is for a different movie";
    }
  } else {
    return "No ticket scanned";
  }
}

const movie = { id: 7, title: "Space Pirates", minAge: 12, screen: 3 };

const tickets = [
  { movieId: 7, used: false, age: 15 },
  { movieId: 7, used: false, age: 9 },
  { movieId: 7, used: true, age: 30 },
  { movieId: 4, used: false, age: 30 },
  { movieId: 4, used: true, age: 8 },
  null,
];

for (const ticket of tickets) {
  console.log(checkTicket(ticket, movie));
}
```

Rewrite `checkTicket` with guard clauses.

Expected output (before and after):

```
Enjoy Space Pirates! Screen 3
Sorry, Space Pirates is for ages 12+
This ticket has already been used
This ticket is for a different movie
This ticket is for a different movie
No ticket scanned
```

**Rule:** no `else` at all, and no `if` inside another `if`. The "Enjoy" line (the happy path) is the last line of the function.

<details>
<summary>Hint 1</summary>

Start from the outside of the staircase and work in. The outermost `if` checks for a ticket, so your first guard clause is "if there's *no* ticket, leave". Flip each condition around: `===` becomes `!==`, `>=` becomes `<`.

</details>

<details>
<summary>Hint 2</summary>

If the fifth line of your output says "already been used", your checks are in a different order from the original. That ticket is both used *and* for the wrong movie, so the order decides which message wins. Keep the original order.

</details>

---

## Exercise 4 (Medium): Report card

A teacher's report function does everything in one long block, and it adds up marks in three different places:

```js
function report(students) {
  console.log("=== Report card ===");
  for (const s of students) {
    let sum = 0;
    for (const m of s.marks) {
      sum += m;
    }
    const avg = sum / s.marks.length;
    let grade;
    if (avg >= 90) {
      grade = "A";
    } else if (avg >= 75) {
      grade = "B";
    } else if (avg >= 60) {
      grade = "C";
    } else {
      grade = "F";
    }
    console.log(`${s.name.padEnd(8)}${avg.toFixed(1).padStart(5)}  ${grade}`);
  }
  let all = 0;
  let count = 0;
  for (const s of students) {
    for (const m of s.marks) {
      all += m;
      count++;
    }
  }
  console.log(`Class average: ${(all / count).toFixed(1)}`);
  let best = students[0];
  for (const s of students) {
    let sum1 = 0;
    for (const m of s.marks) {
      sum1 += m;
    }
    let sum2 = 0;
    for (const m of best.marks) {
      sum2 += m;
    }
    if (sum1 / s.marks.length > sum2 / best.marks.length) {
      best = s;
    }
  }
  console.log(`Top student: ${best.name}`);
}

const students = [
  { name: "Amara", marks: [88, 92, 95] },
  { name: "Ben", marks: [72, 65, 80, 71] },
  { name: "Chloe", marks: [55, 62, 58] },
  { name: "Dmitri", marks: [91, 89, 94, 90] },
];

report(students);
```

Split it into small functions that each do one job, so that `report` itself reads like a table of contents.

Expected output (before and after):

```
=== Report card ===
Amara    91.7  A
Ben      72.0  C
Chloe    58.3  F
Dmitri   91.0  A
Class average: 78.7
Top student: Amara
```

**Rules:**

- Write one `average(numbers)` function, and use it everywhere an average is needed. No other function adds up marks.
- `report` is at most 8 lines long, and it has no loops of its own apart from one `for...of` that prints the rows.

<details>
<summary>Hint 1</summary>

Look for the jobs hiding inside `report`: work out an average, turn an average into a letter grade, format one row, find the class average, find the top student. Each one can become a function with a verb or a clear noun as its name.

</details>

<details>
<summary>Hint 2</summary>

`reduce` ([chapter 13](../13-array-methods/notes.md)) makes `average` short. For the letter grade, guard clauses with early `return`s replace the `let grade` and the `else if` chain.

</details>

<details>
<summary>Hint 3</summary>

Careful with the class average: it's the average of *all 14 marks*, not the average of the four students' averages. Those give different answers here (78.7 vs 78.3). `flatMap` can put every student's marks into one array for `average`.

</details>

---

## Exercise 5 (Challenge): The cafe till

This is the till program at a small cafe. It has almost every problem from the notes: mystery names, magic numbers, deep nesting, a long list of true/false parameters, global variables, and even a comment that lies.

```js
let orders = [];
let total = 0;

// Add an order
function add(n, s, m, x, t) {
  let p = 0;
  if (s === "small") {
    p = 3;
  } else {
    if (s === "medium") {
      p = 3.5;
    } else {
      if (s === "large") {
        p = 4;
      }
    }
  }
  if (m) {
    p = p + 0.5;
  }
  if (x) {
    p = p + 0.75;
  }
  // 10% off for takeaway
  if (t) {
    p = p * 0.8;
  }
  orders.push({ n: n, p: p });
  total = total + p;
}

function print() {
  for (let i = 0; i < orders.length; i++) {
    console.log(orders[i].n + ": $" + orders[i].p.toFixed(2));
  }
  console.log("Total: $" + total.toFixed(2));
  if (total > 10) {
    console.log("Loyalty stamp earned!");
  }
}

add("Latte", "medium", true, false, false);
add("Mocha", "large", false, true, true);
add("Flat white", "small", true, true, false);
add("Latte", "huge", false, false, false);
print();
```

(In `add`: `m` means oat milk, `x` means an extra shot, and `t` means takeaway.)

Clean it up so that:

- every name explains itself, and there are no magic numbers,
- the drink's options are passed as an **options object**, like `{ size: "large", extraShot: true, takeaway: true }`, with sensible defaults,
- there are **no global variables** that functions change. Functions take what they need as parameters and return results. The total is worked out from the list of orders, not kept in a separate running total,
- there's no `if` inside another `if`, and no `if` chain for the sizes,
- string joining with `+` becomes template literals.

Expected output (before and after):

```
Latte: $4.00
Mocha: $3.80
Flat white: $4.25
Latte: $0.00
Total: $12.05
Loyalty stamp earned!
```

Yes, that includes the free `huge` latte. An unknown size silently costs $0, which is a bug, but a refactoring must not change behavior. Write the bug down, and fix it *after* the clean-up, as its own step:

**Bonus:** now make unknown sizes fail loudly. Throw an error from the function that prices a drink, catch it where the orders are created, and skip that order. The new expected output:

```
Could not add Latte: Unknown size "huge"
Latte: $4.00
Mocha: $3.80
Flat white: $4.25
Total: $12.05
Loyalty stamp earned!
```

<details>
<summary>Hint 1</summary>

Look closely at the takeaway comment and the code under it. `* 0.8` doesn't take 10% off. When a comment and the code disagree, the code is what actually runs, so keep the behavior and fix the words. A constant with an honest name can replace the comment completely.

</details>

<details>
<summary>Hint 2</summary>

The size prices can live in one object, like the strategies in [chapter 44](../44-design-patterns/notes.md): `{ small: 3, medium: 3.5, large: 4 }`. Looking up a missing size gives `undefined`, and `??` can turn that into the same `0` the old code used.

</details>

<details>
<summary>Hint 3</summary>

One way to split the jobs: a function that works out one drink's price from the options, one that creates an order object, one that adds up a list of orders, and one that prints them. Build the list of orders as an array at the bottom of the file, and pass it to the printing function.

</details>

---

## Before you move on

After every step in these exercises, you ran the code and compared the output by eye. That works for five lines of output. What about a real app with hundreds of functions?

In [chapter 46](../46-testing/notes.md), you'll write small programs that check your code for you, in a fraction of a second, every time you change something. ✅
