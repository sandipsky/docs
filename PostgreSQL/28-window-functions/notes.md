# 28 Window Functions

## What is it?

A **window function** calculates something for each row using a group of related rows (its "window"), **without collapsing the rows** the way `GROUP BY` does.

```sql
SELECT name, price, avg(price) OVER () AS avg_price FROM products;
```

Every product row stays. Each one gets the overall average next to it. The magic word is `OVER`.

## Why does it matter?

`GROUP BY` answers "what's the average per category?" and gives you one row per category. But many real questions want **each row plus some context**:

- Each product, with its category's average beside it.
- Each order, with its rank among that customer's orders.
- Each month's revenue, with a running total.
- Each month, compared with the month before.
- The top 2 products in *each* category.

Before window functions, these needed correlated subqueries (slow) or horrible self-joins. With them, each is one `OVER (...)`. If you learn one "advanced" SQL feature, make it this one. It's what separates people who can write reports from people who can only write lists.

## Real-world example

A race results sheet. One row per runner, and on each row:

| Column | How it's calculated | Window function |
|---|---|---|
| Position | Rank among all runners by time | `rank() OVER (ORDER BY time)` |
| Position in age group | Rank within runners of the same age group | `rank() OVER (PARTITION BY age_group ORDER BY time)` |
| Gap to the runner ahead | This time minus the previous row's time | `time - lag(time) OVER (ORDER BY time)` |
| Team average | Average of their team's times | `avg(time) OVER (PARTITION BY team)` |

Nobody is removed from the sheet. Every runner still has a row. That's the whole idea.

## How it works

Work in `sales`, with `\pset null '[NULL]'`.

### `OVER ()`: the whole table as the window

```sql
SELECT name, price, round(avg(price) OVER (), 2) AS avg_price
FROM products
ORDER BY price DESC
LIMIT 4;
```

```
     name     | price  | avg_price
--------------+--------+-----------
 Office chair | 149.00 |     27.44
 Backpack     |  45.00 |     27.44
 USB hub      |  29.99 |     27.44
 Desk lamp    |  24.99 |     27.44
(4 rows)
```

Empty brackets mean "the window is every row". `avg(price)` is the same aggregate you know; `OVER ()` turns it from "collapse into one row" into "compute it, then write it next to every row".

### `PARTITION BY`: one window per group

```sql
SELECT name, category_id, price,
       round(avg(price) OVER (PARTITION BY category_id), 2) AS category_avg
FROM products
ORDER BY category_id, price DESC;
```

```
       name        | category_id | price  | category_avg
-------------------+-------------+--------+--------------
 Stapler           |           1 |   8.00 |         3.53
 Notebook          |           1 |   3.90 |         3.53
 Sticky notes      |           1 |   2.75 |         3.53
 Whiteboard marker |           1 |   1.80 |         3.53
 Pen               |           1 |   1.20 |         3.53
 Office chair      |           2 | 149.00 |        87.00
 Desk lamp         |           2 |  24.99 |        87.00
 Backpack          |           3 |  45.00 |        32.25
 Laptop sleeve     |           3 |  19.50 |        32.25
 USB hub           |           4 |  29.99 |        22.87
 Wireless mouse    |           4 |  15.75 |        22.87
(11 rows)
```

`PARTITION BY category_id` splits the rows into one window per category. Each row sees the average of *its own* window. This is the chapter 25 correlated subquery, in one clause and much faster.

And now "how far is each product from its category average" is a one-liner: `round(price - avg(price) OVER (PARTITION BY category_id), 2)`.

### Ranking: `row_number`, `rank`, `dense_rank`

```sql
SELECT name, price, row_number() OVER (ORDER BY price DESC) AS position
FROM products
LIMIT 5;
```

```
     name      | price  | position
---------------+--------+----------
 Office chair  | 149.00 |        1
 Backpack      |  45.00 |        2
 USB hub       |  29.99 |        3
 Desk lamp     |  24.99 |        4
 Laptop sleeve |  19.50 |        5
(5 rows)
```

`ORDER BY` **inside** the `OVER` says how to number the rows. It's separate from the query's own `ORDER BY` (which decides display order). Here they happen to agree.

The three ranking functions differ on **ties**. Rank customers by city, where each city has two people:

```sql
SELECT name, city,
       rank() OVER (ORDER BY city) AS rank,
       dense_rank() OVER (ORDER BY city) AS dense_rank,
       row_number() OVER (ORDER BY city, name) AS row_number
FROM customers;
```

```
      name       |   city    | rank | dense_rank | row_number
-----------------+-----------+------+------------+------------
 Asha Rai        | Kathmandu |    1 |          1 |          1
 Dipesh Thapa    | Kathmandu |    1 |          1 |          2
 Chandra Gurung  | Lalitpur  |    3 |          2 |          3
 Elina Maharjan  | Lalitpur  |    3 |          2 |          4
 Bikram Shrestha | Pokhara   |    5 |          3 |          5
 Farhan Ali      | Pokhara   |    5 |          3 |          6
(6 rows)
```

- `rank()`: ties share a number, and the next number **skips** (1, 1, 3, 3, 5, 5). Like sports: two silver medals, no bronze.
- `dense_rank()`: ties share a number, no skipping (1, 1, 2, 2, 3, 3).
- `row_number()`: no ties ever; each row gets its own number. Add a tie-breaker to its `ORDER BY` or the order among equals is arbitrary.

Use `row_number` when you need exactly one row per position (top-N per group, below). Use `rank` or `dense_rank` when ties should be honest.

### Running totals: `ORDER BY` inside `OVER`

When an aggregate's `OVER` has an `ORDER BY`, the window becomes "from the first row **up to this one**". That's a running total:

```sql
WITH monthly AS (
  SELECT date_trunc('month', o.ordered_at)::date AS month,
         sum(oi.quantity * oi.unit_price) AS revenue
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.id
  WHERE o.status <> 'cancelled'
  GROUP BY month
)
SELECT month, revenue, sum(revenue) OVER (ORDER BY month) AS running_total
FROM monthly
ORDER BY month;
```

```
   month    | revenue | running_total
------------+---------+---------------
 2026-07-01 |  194.99 |        194.99
 2026-08-01 |  288.48 |        483.47
 2026-09-01 |  180.69 |        664.16
(3 rows)
```

Notice the pattern: a CTE does the `GROUP BY`, and the window function runs over the grouped result. Window functions are evaluated **after** `GROUP BY` and `HAVING`, so this works, and it's the normal way to combine the two.

Without the `ORDER BY month` inside `OVER`, you'd get the grand total (664.16) on every row. The inner `ORDER BY` is what makes it *running*.

### Looking at neighbours: `lag` and `lead`

`lag(column)` gives the value from the **previous** row in the window; `lead(column)` the next. Month-over-month change:

```sql
WITH monthly AS ( ...same as above... )
SELECT month, revenue,
       lag(revenue) OVER (ORDER BY month) AS previous,
       revenue - lag(revenue) OVER (ORDER BY month) AS change
FROM monthly
ORDER BY month;
```

```
   month    | revenue | previous | change
------------+---------+----------+---------
 2026-07-01 |  194.99 |   [NULL] |  [NULL]
 2026-08-01 |  288.48 |   194.99 |   93.49
 2026-09-01 |  180.69 |   288.48 | -107.79
(3 rows)
```

July has no previous month, so `lag` is NULL there. August was up 93.49; September was down 107.79. `lag(column, 2)` looks two rows back; `lag(column, 1, 0)` gives `0` instead of NULL for the first row.

With `PARTITION BY`, `lag` looks at the previous row *within the group*: `ordered_at::date - lag(ordered_at::date) OVER (PARTITION BY customer_id ORDER BY ordered_at)` is "days since this customer's previous order".

### Top N per group

The most-asked window question. The two best-selling products in **each** category:

```sql
WITH product_revenue AS (
  SELECT p.name, c.name AS category, sum(oi.quantity * oi.unit_price) AS revenue
  FROM order_items oi
  JOIN products p ON p.id = oi.product_id
  JOIN categories c ON c.id = p.category_id
  JOIN orders o ON o.id = oi.order_id
  WHERE o.status <> 'cancelled'
  GROUP BY p.name, c.name
),
ranked AS (
  SELECT *, row_number() OVER (PARTITION BY category ORDER BY revenue DESC) AS rn
  FROM product_revenue
)
SELECT category, name, revenue, rn
FROM ranked
WHERE rn <= 2
ORDER BY category, rn;
```

```
  category   |      name      | revenue | rn
-------------+----------------+---------+----
 Bags        | Backpack       |   90.00 |  1
 Bags        | Laptop sleeve  |   39.00 |  2
 Electronics | USB hub        |   59.98 |  1
 Electronics | Wireless mouse |   31.50 |  2
 Furniture   | Office chair   |  298.00 |  1
 Furniture   | Desk lamp      |   49.98 |  2
 Stationery  | Pen            |   42.00 |  1
 Stationery  | Notebook       |   29.20 |  2
(8 rows)
```

Three steps: aggregate, number the rows within each category, keep numbers 1 and 2. Change `<= 2` to `= 1` for "the best in each category".

Why the extra `ranked` CTE? Because you **can't filter on a window function directly**:

```sql
SELECT name, price FROM products WHERE row_number() OVER (ORDER BY price DESC) <= 3;
```

```
ERROR:  window functions are not allowed in WHERE
```

Window functions run after `WHERE`, so `WHERE` can't see them. Compute the number in a CTE (or subquery), then filter in the next step.

### Window functions keep every row

To see the difference from `GROUP BY` clearly:

```sql
SELECT o.id, o.customer_id, o.ordered_at::date AS day,
       count(*) OVER (PARTITION BY o.customer_id) AS customer_orders
FROM orders o
ORDER BY o.customer_id, o.id
LIMIT 6;
```

```
 id | customer_id |    day     | customer_orders
----+-------------+------------+-----------------
  1 |           1 | 2026-07-03 |               4
  4 |           1 | 2026-07-25 |               4
  8 |           1 | 2026-08-21 |               4
 12 |           1 | 2026-09-26 |               4
  2 |           2 | 2026-07-10 |               2
  6 |           2 | 2026-08-09 |               2
(6 rows)
```

All twelve orders stay (six shown). `GROUP BY customer_id` would have given five rows. The window version lets you keep order-level detail *and* show the customer-level count.

### Percent of total

Divide a row's value by the window's total:

```sql
SELECT name, price, round(100 * price / sum(price) OVER (), 1) AS pct_of_total
FROM products
ORDER BY price DESC
LIMIT 3;
```

```
     name     | price  | pct_of_total
--------------+--------+--------------
 Office chair | 149.00 |         49.4
 Backpack     |  45.00 |         14.9
 USB hub      |  29.99 |          9.9
(3 rows)
```

Add `PARTITION BY` for "percent of its category". Add `ORDER BY` to the sum for a cumulative percentage, which is how you find "the products that make up 80% of revenue".

### Frames: how far the window reaches

When `OVER` has an `ORDER BY`, the default window for aggregates is "from the start of the partition to the current row". You can change it. A three-order moving average:

```sql
WITH t AS (
  SELECT o.id, o.ordered_at, sum(oi.quantity * oi.unit_price) AS total
  FROM orders o JOIN order_items oi ON oi.order_id = o.id GROUP BY o.id
)
SELECT id, total,
       round(avg(total) OVER (ORDER BY ordered_at ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS moving_avg_3
FROM t ORDER BY ordered_at;
```

```
 id | total  | moving_avg_3
----+--------+--------------
  1 |  13.00 |        13.00
  2 |  32.99 |        23.00
  3 | 149.00 |        65.00
  4 |  45.00 |        75.66
  5 |  56.24 |        83.41
 ...
```

`ROWS BETWEEN 2 PRECEDING AND CURRENT ROW` means "this row and the two before it". Frames are the fine print of window functions. The default is right for running totals; reach for an explicit frame only for moving averages and the like.

### Other useful ones

- `first_value(name) OVER (PARTITION BY category_id ORDER BY price DESC)`: the name of the priciest product in each row's category.
- `ntile(3) OVER (ORDER BY price)`: splits rows into 3 equal-sized bands (cheap / mid / expensive by position, not by fixed prices).
- `sum(sum(x)) OVER ()`: a window over an aggregate, when you `GROUP BY` and want the grand total on the same row. Looks odd, works fine.

### Naming a window

If several functions share the same `OVER (...)`, name it once:

```sql
SELECT name, price,
       rank() OVER w AS rank_in_category,
       round(avg(price) OVER w, 2) AS running_avg
FROM products
WINDOW w AS (PARTITION BY category_id ORDER BY price DESC)
ORDER BY category_id, rank_in_category;
```

The `WINDOW` clause goes after `WHERE`/`GROUP BY`/`HAVING` and before `ORDER BY`.

## Common mistakes

**1. Window function in `WHERE` or `HAVING`**

Not allowed. Compute it in a CTE, filter in the next step.

**2. Forgetting `ORDER BY` inside `OVER` for a running total**

You get the grand total on every row. Running means ordered.

**3. `rank()` when you need exactly one per group**

Ties give two "number 1"s, and `WHERE rn = 1` returns both. Use `row_number()` with a tie-breaker.

**4. Mixing up the two `ORDER BY`s**

`OVER (ORDER BY ...)` controls the calculation. The query's `ORDER BY` controls display. They're independent. Set both.

**5. `PARTITION BY` when you meant `GROUP BY`**

If you want fewer rows, it's `GROUP BY`. If you want every row with extra columns, it's a window. Different tools.

**6. Window directly over line-level rows**

`sum(quantity * unit_price) OVER (PARTITION BY customer_id)` on `order_items` gives per-customer totals repeated on every *line*. Usually you want to aggregate per order first (CTE), then window.

## Quick recap

- `function() OVER (...)` computes a value per row from a window of rows, **keeping every row**.
- `OVER ()` is the whole table. `PARTITION BY col` makes one window per group. `ORDER BY col` inside `OVER` orders the window, which turns aggregates into **running** totals.
- Ranking: `row_number()` (no ties), `rank()` (ties, gaps), `dense_rank()` (ties, no gaps).
- `lag()` / `lead()` read the previous / next row: month-over-month change, days since last order.
- **Top N per group:** CTE with `row_number() OVER (PARTITION BY group ORDER BY value DESC)`, then `WHERE rn <= N`.
- Window functions run after `GROUP BY` and can't be used in `WHERE`. Aggregate in a CTE, window in the next step, filter in the step after.

---

**Next:** try the [exercises](exercises.md), then move on to the Level 3 project: [29 Project: Sales Report](../29-project-sales-report/notes.md).
