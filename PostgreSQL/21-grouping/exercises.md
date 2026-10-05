# 21 Grouping: Exercises

**How to do these:**

- Work in psql, connected to `sales`. Run `\pset null '[NULL]'`.
- Save each answer in `playground/ch21/ex1.sql`, `ex2.sql`, and so on. Always `ORDER BY` your grouped results.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your work.

---

## Exercise 1 (Easy): One row per value

1. How many customers are in each city?
2. How many orders are there in each status?

Expected output of query 1:

```
   city    | customers
-----------+-----------
 Kathmandu |         2
 Lalitpur  |         2
 Pokhara   |         2
(3 rows)
```

---

## Exercise 2 (Easy): Per category

For each `category_id`, show the number of products, the cheapest price, and the most expensive price.

Expected output:

```
 category_id | products |  min  |  max
-------------+----------+-------+--------
           1 |        5 |  1.20 |   8.00
           2 |        2 | 24.99 | 149.00
           3 |        2 | 19.50 |  45.00
           4 |        2 | 15.75 |  29.99
(4 rows)
```

---

## Exercise 3 (Medium): `HAVING`

1. Which orders have **more than one** line? Show the order id and the number of lines.
2. Which products have sold **3 or more units** in total? Show `product_id` and units, best seller first.
3. Which customers have placed **at least 2 orders that weren't cancelled**? Show `customer_id` and the count.

Expected output of query 2:

```
 product_id | units
------------+-------
          2 |    35
          1 |     8
          3 |     6
          8 |     3
(4 rows)
```

<details>
<summary>Hint</summary>

Question 3 needs both a `WHERE` (to drop cancelled rows) and a `HAVING` (to keep groups with 2+). Which comes first in the query?

</details>

---

## Exercise 4 (Medium): Months

1. How many orders were placed in each month? Use `date_trunc('month', ordered_at)::date`.
2. Extend it: in the same query, also show how many of each month's orders are `shipped`, using `FILTER`.
3. Now group by **month and status** together. How many rows do you get, and why is it more than 3?

Expected output of query 2:

```
   month    | orders | shipped
------------+--------+---------
 2026-07-01 |      4 |       2
 2026-08-01 |      4 |       3
 2026-09-01 |      4 |       1
(3 rows)
```

---

## Exercise 5 (Challenge): A customer summary

For each customer who has ordered, show their `customer_id`, how many orders they've placed, the date of their **first** order, and the date of their **latest** order. Most recent latest-order first.

Expected output:

```
 customer_id | orders | first_order | last_order
-------------+--------+-------------+------------
           1 |      4 | 2026-07-03  | 2026-09-26
           6 |      2 | 2026-08-15  | 2026-09-19
           4 |      2 | 2026-08-02  | 2026-09-11
           3 |      2 | 2026-07-18  | 2026-09-04
           2 |      2 | 2026-07-10  | 2026-08-09
(5 rows)
```

Then, as a comment: one customer is missing from this list. Who, and why can't `GROUP BY` include them?

<details>
<summary>Hint</summary>

`min(ordered_at)::date` and `max(ordered_at)::date`. You can `ORDER BY` an alias.

</details>
