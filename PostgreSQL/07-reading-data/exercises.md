# 07 Reading Data: Exercises

**How to do these:**

- Work in psql, connected to `practice`. You need the `tasks` and `products` tables with the data from chapter 06. If in doubt, run your `playground/ch06/seed.sql`.
- Run `\pset null '[NULL]'` first.
- Save each answer in `playground/ch07/ex1.sql`, `ex2.sql`, and so on.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your work.

---

## Exercise 1 (Easy): Pick your columns

Write three queries on `products`:

1. Every column of every product.
2. Only `name` and `price`.
3. `price` first, then `name`, then `stock`.

Expected output of query 2:

```
     name     | price
--------------+-------
 Notebook     |  3.50
 Pen          |  1.20
 Desk lamp    | 24.99
 Stapler      |  8.00
 Backpack     | 45.00
 Sticky notes |  2.75
(6 rows)
```

---

## Exercise 2 (Easy): Nicer headings

Show each task's title and due date, but label the columns `Task` and `Due` (with capital letters).

Expected output:

```
         Task         |    Due
----------------------+------------
 Buy milk             | 2026-10-01
 Finish SQL chapter 6 | 2026-09-30
 Call the dentist     | 2026-10-05
 Water the plants     | [NULL]
 Renew passport       | 2026-11-15
(5 rows)
```

<details>
<summary>Hint</summary>

Capital letters in an alias need double quotes: `AS "Task"`.

</details>

---

## Exercise 3 (Medium): Stock value

For each product, show its name and the **total value of its stock** (price times how many you have), labeled `stock_value`.

Expected output:

```
     name     | stock_value
--------------+-------------
 Notebook     |      420.00
 Pen          |      600.00
 Desk lamp    |      374.85
 Stapler      |      320.00
 Backpack     |      360.00
 Sticky notes |        0.00
(6 rows)
```

Then add a third column: the price with 20% added (for tax), labeled `price_with_tax`. Check the Desk lamp comes out as `29.988`. (Chapter 24 will show you how to round that. For now, just get the maths right.)

<details>
<summary>Hint</summary>

Multiplying by 1.2 adds 20%. Expressions can use more than one column: `price * stock`.

</details>

---

## Exercise 4 (Medium): A sentence per row

Make one text column called `summary` that reads like a sentence for each product. For example, the first row should be:

```
Notebook costs 3.50 and we have 120 in stock
```

<details>
<summary>Hint</summary>

Glue pieces together with `||`. Numbers join onto text without any conversion in PostgreSQL, so `'costs ' || price` works. Don't forget the spaces inside your quoted text.

</details>

---

## Exercise 5 (Challenge): Days until due

For each task, show its title and how many days are left until its due date, counting from **2026-09-30**, labeled `days_left`.

Expected output:

```
        title         | days_left
----------------------+-----------
 Buy milk             |         1
 Finish SQL chapter 6 |         0
 Call the dentist     |         5
 Water the plants     |    [NULL]
 Renew passport       |        46
(5 rows)
```

Then: why is `Water the plants` NULL? Write the reason as a comment in your file.

Bonus: replace the fixed date with `current_date` so the answer changes every day. Your numbers will be different from the expected output above, and that's fine.

<details>
<summary>Hint</summary>

Subtracting one date from another gives the number of days between them. You'll need to write the fixed date as a date, not text: `date '2026-09-30'`, or `'2026-09-30'::date`.

</details>
