# 20 Counting and Totals

## What is it?

An **aggregate function** takes many rows and boils them down to one number. The five you'll use constantly:

| Function | Answers |
|---|---|
| `count()` | How many? |
| `sum()` | What's the total? |
| `avg()` | What's the average? |
| `min()` | What's the smallest / earliest / first alphabetically? |
| `max()` | What's the biggest / latest / last alphabetically? |

Until now, every query gave you back rows. Aggregates give you back **answers**.

## Why does it matter?

"How many orders did we get this month?" "What's our total revenue?" "What's the average price?" "When was the last order?" These are the questions people actually ask a database. Nobody wants to see 50,000 order rows. They want one number.

Level 3 is about answering real business questions, and aggregates are the first tool. Chapter 21 adds "per group" (total *per customer*, count *per month*), and chapter 22 adds joins so the answers can span several tables.

## Real-world example

A shopkeeper at the end of the day:

| The shopkeeper | SQL |
|---|---|
| Counts the receipts | `count(*)` |
| Adds up the money | `sum(total)` |
| Works out the average sale | `avg(total)` |
| Finds the smallest and biggest sale | `min(total)`, `max(total)` |

They don't want to see every receipt. They want the totals at the bottom.

## How it works

### The Level 3 dataset

Chapters 20 to 29 share one dataset: a small stationery shop with three months of orders. It lives in the [chapter 29 project's starter folder](../29-project-sales-report/starter/seed.sql), because that project uses it too. Set it up once:

```sql
CREATE DATABASE sales;
\c sales
\i C:/Users/YourName/Downloads/Projects/Sandip/docs/PostgreSQL/29-project-sales-report/starter/seed.sql
```

Five tables, the same shape as your chapter 19 shop: `categories`, `products`, `customers`, `orders`, `order_items`. Spend two minutes looking around: `\dt`, then `SELECT * FROM ...` on each. The important facts: 11 products (one discontinued, one never sold), 6 customers (one never ordered), 12 orders from July to September 2026 (one cancelled), 21 order lines.

Run `\pset null '[NULL]'` as always.

### `count(*)`: how many rows?

```sql
SELECT count(*) FROM orders;
```

```
 count
-------
    12
(1 row)
```

One row back, with one number in it. `count(*)` counts every row the query would otherwise have returned. Add a `WHERE` and it counts only the matches:

```sql
SELECT count(*) FROM products WHERE is_active;
```

```
 count
-------
    10
(1 row)
```

### `count(column)`: how many non-empty values?

Here's a distinction that trips people up:

```sql
SELECT count(*) AS all_orders, count(shipped_at) AS shipped_orders FROM orders;
```

```
 all_orders | shipped_orders
------------+----------------
         12 |              7
(1 row)
```

`count(*)` counts rows. `count(shipped_at)` counts rows where `shipped_at` **is not NULL**. Five orders haven't shipped yet, so their `shipped_at` is NULL, and they're skipped.

This is handy and dangerous in equal measure. Handy: "how many orders have shipped?" is just `count(shipped_at)`. Dangerous: `count(some_column)` can silently give you a smaller number than you expected. When you mean "how many rows", write `count(*)`.

### `count(DISTINCT column)`: how many different values?

```sql
SELECT count(customer_id) AS rows_with_customer,
       count(DISTINCT customer_id) AS distinct_customers
FROM orders;
```

```
 rows_with_customer | distinct_customers
--------------------+--------------------
                 12 |                  5
(1 row)
```

12 orders, but only 5 different customers placed them. `DISTINCT` inside `count()` means "count each value once". It's how you answer "how many customers have ever ordered?"

### `sum()`: add it up

```sql
SELECT sum(stock) AS units_in_stock FROM products;
```

```
 units_in_stock
----------------
           1249
(1 row)
```

`sum()` takes an expression, not just a column. The most useful one in this whole dataset:

```sql
SELECT sum(quantity * unit_price) AS revenue FROM order_items;
```

```
 revenue
---------
  709.16
(1 row)
```

For each line, multiply quantity by price, then add all the results. That's the shop's total sales (including one cancelled order; you'll fix that in chapter 22).

### `avg()`: the average

```sql
SELECT avg(price) FROM products;
```

```
         avg
---------------------
 27.4436363636363636
(1 row)
```

That's a lot of decimal places. `avg()` gives you the exact answer, and it's your job to tidy it:

```sql
SELECT round(avg(price), 2) AS average_price FROM products;
```

```
 average_price
---------------
         27.44
(1 row)
```

`round(value, 2)` rounds to 2 decimal places. You'll meet it properly in [chapter 24](../24-built-in-functions/notes.md), but it's so useful with `avg()` that you need it now.

Two things to know about `avg()`:

- It **ignores NULLs**. The average of `{10, NULL, 20}` is 15, not 10. Missing values aren't counted as zero.
- It always returns a decimal, even for whole-number columns. `avg(quantity)` on our order lines is `3.0000000000000000`. Round it.

### `min()` and `max()`: the extremes

```sql
SELECT min(price) AS cheapest, max(price) AS priciest FROM products;
```

```
 cheapest | priciest
----------+----------
     1.20 |   149.00
(1 row)
```

They work on anything that can be sorted: numbers, dates, text.

```sql
SELECT min(ordered_at) AS first_order, max(ordered_at) AS latest_order FROM orders;
```

```
        first_order        |       latest_order
---------------------------+---------------------------
 2026-07-03 10:15:00+05:45 | 2026-09-26 18:05:00+05:45
(1 row)
```

On text, `min()` is the first alphabetically and `max()` the last: `min(name)` on customers gives `Asha Rai`, `max(name)` gives `Farhan Ali`.

### Several at once

You can ask for as many aggregates as you like in one query:

```sql
SELECT count(*) AS products,
       round(avg(price), 2) AS avg_price,
       min(price),
       max(price),
       sum(stock) AS stock
FROM products;
```

```
 products | avg_price | min  |  max   | stock
----------+-----------+------+--------+-------
       11 |     27.44 | 1.20 | 149.00 |  1249
(1 row)
```

Still one row. Every aggregate looks at the same set of rows (all 11 products) and reports its own answer.

### Aggregates and `WHERE`

`WHERE` picks the rows first, then the aggregates work on what's left:

```sql
SELECT count(*) AS items, sum(quantity) AS units, sum(quantity * unit_price) AS total
FROM order_items
WHERE order_id = 5;
```

```
 items | units | total
-------+-------+-------
     3 |     5 | 56.24
(1 row)
```

Order 5 has three lines, five items in total, worth 56.24. That's an order total, and it's exactly what a receipt needs at the bottom.

### When there's nothing to count

```sql
SELECT count(*) AS items, sum(quantity * unit_price) AS total
FROM order_items
WHERE order_id = 999;
```

```
 items | total
-------+--------
     0 | [NULL]
(1 row)
```

No order 999, so no rows. `count` of nothing is `0`. But `sum` of nothing is **NULL**, not 0. Same for `avg`, `min`, `max`. If you need a zero, wrap it: `coalesce(sum(...), 0)`, which chapter 24 explains. For now, just know that an empty total shows up as NULL.

### The error everyone hits

```sql
SELECT name, count(*) FROM products;
```

```
ERROR:  column "products.name" must appear in the GROUP BY clause or be used in an aggregate function
```

Think about what you asked for. `count(*)` is one number for the whole table. `name` is eleven different values. PostgreSQL can't fit eleven names into a one-row answer, so it refuses. You either want *one* answer (drop `name`) or *one answer per name* (that's `GROUP BY`, and it's the whole of the [next chapter](../21-grouping/notes.md)).

### A PostgreSQL bonus: `FILTER`

Sometimes you want two counts with different conditions, side by side:

```sql
SELECT count(*) FILTER (WHERE is_active) AS active,
       count(*) FILTER (WHERE NOT is_active) AS inactive
FROM products;
```

```
 active | inactive
--------+----------
     10 |        1
(1 row)
```

`FILTER (WHERE ...)` applies a condition to one aggregate only. It works on any aggregate. Other databases make you do this with `CASE` (chapter 24); PostgreSQL gives you the clean version.

### Aggregates on dates

Subtracting two timestamps gives an interval, and you can average those too:

```sql
SELECT avg(shipped_at - ordered_at) AS avg_time_to_ship
FROM orders
WHERE shipped_at IS NOT NULL;
```

```
 avg_time_to_ship
------------------
 1 day 23:25:00
(1 row)
```

Just under two days from order to dispatch. Notice the `WHERE`: without it, the NULL `shipped_at` values would be skipped by `avg()` anyway, but saying so makes the query honest.

## Common mistakes

**1. `count(column)` when you mean `count(*)`**

You'll get a smaller number with no warning, because NULLs are skipped. Use `count(*)` for "how many rows".

**2. Expecting `sum()` of nothing to be 0**

It's NULL. Wrap it in `coalesce(..., 0)` when you need a real zero.

**3. Mixing a plain column with an aggregate**

`SELECT name, count(*)`. Covered above. Either drop the column or wait for `GROUP BY`.

**4. Averaging something that shouldn't be averaged**

`avg(id)` runs fine and means nothing. `avg(price)` over *products* is the average list price, not the average price *sold*; for that you'd weight by quantity. Think about what the number means before you report it.

**5. Forgetting that aggregates ignore NULL**

`avg(rating)` on 10 books where 4 are unrated is the average of the 6 ratings. Usually that's what you want. Sometimes it isn't. Know which.

**6. Not rounding `avg()`**

Sixteen decimal places helps nobody. `round(avg(x), 2)`.

## Quick recap

- Aggregates turn many rows into one answer: `count`, `sum`, `avg`, `min`, `max`.
- `count(*)` counts rows. `count(col)` counts non-NULL values. `count(DISTINCT col)` counts different values.
- `sum()` and `avg()` take expressions: `sum(quantity * unit_price)`.
- Every aggregate except `count` **ignores NULL** and returns NULL when there are no rows.
- `WHERE` filters first; aggregates work on what's left.
- A plain column next to an aggregate is an error, until `GROUP BY`.
- `FILTER (WHERE ...)` gives one aggregate its own condition.

---

**Next:** try the [exercises](exercises.md), then move on to [21 Grouping](../21-grouping/notes.md).
