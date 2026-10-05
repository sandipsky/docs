# 28 Window Functions: Exercises

**How to do these:**

- Work in psql, connected to `sales`. Run `\pset null '[NULL]'`.
- Save each answer in `playground/ch28/ex1.sql`, `ex2.sql`, and so on.
- Build in steps: a CTE to aggregate, then the window, then (if you need to filter on the window) one more step.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your work.

---

## Exercise 1 (Easy): Context on every row

Every product with: its name, its price, the **overall** average price, and its **category's** average price, both rounded to 2 places. Sorted by category then price descending.

The first row should be `Stapler | 8.00 | 27.44 | 3.53`.

---

## Exercise 2 (Easy): Rankings

1. Products numbered 1, 2, 3... from most to least expensive, using `row_number()`.
2. Customers ranked by total spending (excluding cancelled orders), with `rank()`. Chandra should be 1.
3. Customers ranked by **city** with `rank()`, `dense_rank()`, and `row_number()` side by side. In a comment, explain the three different numbers on the Lalitpur rows.

Expected output of query 2:

```
      name       | spent  | rank
-----------------+--------+------
 Chandra Gurung  | 239.00 |    1
 Asha Rai        | 218.19 |    2
 Dipesh Thapa    |  86.23 |    3
 Farhan Ali      |  64.75 |    4
 Bikram Shrestha |  55.99 |    5
(5 rows)
```

---

## Exercise 3 (Medium): Over time

1. Monthly revenue (excluding cancelled) with a **running total** column.
2. Extend it with the **previous month's** revenue and the **change** from the previous month.
3. Each order, with the number of **days since that customer's previous order**. The first order for each customer shows NULL. Sorted by customer then date.

Expected first rows of query 3:

```
 customer_id | id |    day     | days_since_previous
-------------+----+------------+---------------------
           1 |  1 | 2026-07-03 |              [NULL]
           1 |  4 | 2026-07-25 |                  22
           1 |  8 | 2026-08-21 |                  27
           1 | 12 | 2026-09-26 |                  36
           2 |  2 | 2026-07-10 |              [NULL]
 ...
```

<details>
<summary>Hint</summary>

Query 3: `ordered_at::date - lag(ordered_at::date) OVER (PARTITION BY customer_id ORDER BY ordered_at)`.

</details>

---

## Exercise 4 (Medium): Shares

1. Each order's total and what **percentage of its customer's total spending** it represents (one decimal place). Order 8 should be 66.1% of Asha's spending.
2. Each order ranked **within its month** by total, biggest first.

Expected first rows of query 2:

```
   month    | id | total  | rank_in_month
------------+----+--------+---------------
 2026-07-01 |  3 | 149.00 |             1
 2026-07-01 |  4 |  45.00 |             2
 2026-07-01 |  2 |  32.99 |             3
 2026-07-01 |  1 |  13.00 |             4
 2026-08-01 |  8 | 173.99 |             1
 ...
```

<details>
<summary>Hint</summary>

Both start with the same CTE: one row per order with its total (and customer, and month). Then `sum(total) OVER (PARTITION BY customer_id)` for query 1, `rank() OVER (PARTITION BY month ORDER BY total DESC)` for query 2.

</details>

---

## Exercise 5 (Challenge): Top N and the 80% rule

1. The **top 2 products by revenue in each category**, excluding cancelled orders. Eight rows.
2. Products sorted by revenue (excluding cancelled), with a **cumulative percentage of total revenue**. Then answer in a comment: which products together make up the first 80% of revenue?

Expected output of query 2:

```
      name      | revenue | cumulative_pct
----------------+---------+----------------
 Office chair   |  298.00 |           44.9
 Backpack       |   90.00 |           58.4
 USB hub        |   59.98 |           67.5
 Desk lamp      |   49.98 |           75.0
 Pen            |   42.00 |           81.3
 Laptop sleeve  |   39.00 |           87.2
 Wireless mouse |   31.50 |           91.9
 Notebook       |   29.20 |           96.3
 Sticky notes   |   16.50 |           98.8
 Stapler        |    8.00 |          100.0
(10 rows)
```

<details>
<summary>Hint 1</summary>

Query 1 is the three-step pattern from the notes: aggregate per product and category, `row_number() OVER (PARTITION BY category ORDER BY revenue DESC)`, then `WHERE rn <= 2`.

</details>

<details>
<summary>Hint 2</summary>

Query 2: `round(100 * sum(revenue) OVER (ORDER BY revenue DESC) / sum(revenue) OVER (), 1)`. The first `sum` is running (it has an `ORDER BY`); the second is the grand total (no `ORDER BY`).

</details>
