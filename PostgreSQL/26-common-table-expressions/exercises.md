# 26 Common Table Expressions: Exercises

**How to do these:**

- Work in psql, connected to `sales`. Run `\pset null '[NULL]'`.
- Save each answer in `playground/ch26/ex1.sql`, `ex2.sql`, and so on.
- Build each query one CTE at a time, checking each step with `SELECT * FROM step` before moving on.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your work.

---

## Exercise 1 (Easy): Rewrite with a CTE

Take chapter 25's "orders above the average order total" (Exercise 1, question 2). Rewrite it so the "totals per order" query appears **once**, as a CTE, and is used twice in the main query.

Expected output:

```
 order_id | total
----------+--------
        8 | 173.99
        3 | 149.00
        9 |  90.00
(3 rows)
```

<details>
<summary>Hint</summary>

`SELECT order_id, total FROM order_totals WHERE total > (SELECT avg(total) FROM order_totals)`.

</details>

---

## Exercise 2 (Easy): Monthly revenue

Using an `order_totals` CTE, show for each month: the number of orders, and the revenue, **excluding cancelled orders**. In month order.

Expected output:

```
   month    | orders | revenue
------------+--------+---------
 2026-07-01 |      3 |  194.99
 2026-08-01 |      4 |  288.48
 2026-09-01 |      4 |  180.69
(3 rows)
```

<details>
<summary>Hint</summary>

Join `orders` to `order_totals`, filter on status, group by `date_trunc('month', o.ordered_at)::date`. Because there's one total per order, `count(*)` is correct here.

</details>

---

## Exercise 3 (Medium): Share of revenue

Show each category's revenue (excluding cancelled orders) and its **percentage of total revenue**, rounded to one decimal place, biggest first.

Expected output:

```
  category   | revenue | pct
-------------+---------+------
 Furniture   |  347.98 | 52.4
 Bags        |  129.00 | 19.4
 Stationery  |   95.70 | 14.4
 Electronics |   91.48 | 13.8
(4 rows)
```

<details>
<summary>Hint</summary>

Two CTEs: `category_revenue` (the chapter 22 query) and `total` (one row: `sum(revenue)` from the first CTE). The main query can select from both at once: `FROM category_revenue, total` is a tiny cross join against a one-row table, which is a common trick for "divide by the grand total".

</details>

---

## Exercise 4 (Medium): Every month, even the empty ones

1. Build a `months` CTE with `generate_series` from June to October 2026. Left-join the monthly order counts onto it so June and October show `0`.
2. Extend it: add a second data column, revenue excluding cancelled orders, also showing `0.00` for empty months.

Expected output of query 1:

```
   month    | orders
------------+--------
 2026-06-01 |      0
 2026-07-01 |      4
 2026-08-01 |      4
 2026-09-01 |      4
 2026-10-01 |      0
(5 rows)
```

---

## Exercise 5 (Challenge): Recursion

1. Build the `employees` temp table from the notes. Write a recursive CTE that lists **everyone who reports to Dev Shrestha, directly or indirectly**, alphabetical. Expected: Asha Thapa, Bikram Karki, Ram Lama.
2. Write a recursive CTE that produces every date from `2026-10-01` to `2026-10-05`, with the weekday name next to each. Then write a comment: why would `generate_series` be the better tool for this one?
3. **Repeat customers:** using a CTE that finds each customer's first order date, show each customer's name and how many orders they placed **after** their first one. Most repeat orders first.

Expected output of query 3:

```
      name       | later_orders
-----------------+--------------
 Asha Rai        |            3
 Bikram Shrestha |            1
 Chandra Gurung  |            1
 Dipesh Thapa    |            1
 Farhan Ali      |            1
(5 rows)
```

<details>
<summary>Hint 1</summary>

Query 1: the starting row is `WHERE name = 'Dev Shrestha'`; the recursive half joins `employees e ON e.manager_id = team.id`. Exclude Dev himself in the final `SELECT`.

</details>

<details>
<summary>Hint 2</summary>

Query 3: `first_orders AS (SELECT customer_id, min(ordered_at) AS first_at FROM orders GROUP BY customer_id)`, then join `orders` on `customer_id` **and** `ordered_at > first_at`, and count.

</details>
