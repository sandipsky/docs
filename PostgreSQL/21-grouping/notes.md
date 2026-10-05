# 21 Grouping

## What is it?

`GROUP BY` splits the rows into groups and runs the aggregates **once per group**. Instead of "how many orders?", you get "how many orders *per status*?" Instead of "total revenue?", "total revenue *per month*?"

`HAVING` filters the groups afterwards: "only statuses with more than one order".

## Why does it matter?

Almost every report is a `GROUP BY`. Sales per region. Users per sign-up month. Average rating per product. Orders per customer. If chapter 20 gave you the number at the bottom of the receipt, this chapter gives you the whole summary table, one row per thing you care about.

It's also the fix for the error you met last chapter. `SELECT name, count(*)` failed because PostgreSQL didn't know how to get one count for eleven names. `GROUP BY name` tells it: one count *for each* name.

## Real-world example

Sorting a pile of receipts into stacks:

| You | SQL |
|---|---|
| Make one stack per payment method | `GROUP BY payment_method` |
| Count each stack | `count(*)` |
| Add up each stack | `sum(total)` |
| Throw away stacks with fewer than 5 receipts | `HAVING count(*) >= 5` |
| Only sort receipts from this week in the first place | `WHERE ... ` (before stacking) |

The result is one line per stack. That's what `GROUP BY` returns: one row per group.

## How it works

Work in `sales`, with `\pset null '[NULL]'`.

### One group per value

```sql
SELECT status, count(*) FROM orders GROUP BY status ORDER BY status;
```

```
  status   | count
-----------+-------
 cancelled |     1
 paid      |     3
 pending   |     2
 shipped   |     6
(4 rows)
```

Read it as: "put the orders into one pile per status, then count each pile." Four statuses in the data, four rows back.

The rule that makes this work: **every column in `SELECT` must be either in the `GROUP BY` or inside an aggregate.** `status` is in the `GROUP BY`. `count(*)` is an aggregate. Both allowed.

### Any aggregate, per group

```sql
SELECT category_id, count(*) AS products, round(avg(price), 2) AS avg_price
FROM products
GROUP BY category_id
ORDER BY category_id;
```

```
 category_id | products | avg_price
-------------+----------+-----------
           1 |        5 |      3.53
           2 |        2 |     87.00
           3 |        2 |     32.25
           4 |        2 |     22.87
```

Everything from chapter 20 works per group. (Category *names* would be nicer than ids. That needs a join, next chapter.)

### The query you'll write most: totals per order

```sql
SELECT order_id, sum(quantity * unit_price) AS total
FROM order_items
GROUP BY order_id
ORDER BY order_id;
```

```
 order_id | total
----------+--------
        1 |  13.00
        2 |  32.99
        3 | 149.00
        4 |  45.00
        5 |  56.24
        6 |  23.00
        7 |  35.25
        8 | 173.99
        9 |  90.00
       10 |  29.99
       11 |  29.50
       12 |  31.20
(12 rows)
```

Twenty-one lines in, twelve totals out. This is the receipt total for every order at once. You'll build on this exact query for the rest of Level 3.

### Sorting by the aggregate

You can `ORDER BY` an aggregate or its alias:

```sql
SELECT customer_id, count(*) AS orders
FROM orders
GROUP BY customer_id
ORDER BY orders DESC, customer_id;
```

```
 customer_id | orders
-------------+--------
           1 |      4
           2 |      2
           3 |      2
           4 |      2
           6 |      2
(5 rows)
```

Customer 1 (Asha) is the most frequent buyer. Notice customer 5 is missing: she has no orders, so there's no group for her. `GROUP BY` can only group rows that exist. Including zeroes is a job for [chapter 23](../23-outer-joins/notes.md).

### Filtering groups: `HAVING`

`WHERE` filters rows *before* grouping. To filter *groups*, after the aggregates are computed, use `HAVING`:

```sql
SELECT order_id, sum(quantity * unit_price) AS total
FROM order_items
GROUP BY order_id
HAVING sum(quantity * unit_price) > 50
ORDER BY total DESC;
```

```
 order_id | total
----------+--------
        8 | 173.99
        3 | 149.00
        9 |  90.00
        5 |  56.24
(4 rows)
```

"Group the lines by order, total each one, and keep only the orders over 50." You can't do that with `WHERE`, because the total doesn't exist until after the grouping.

Note that `HAVING` repeats the whole expression. `HAVING total > 50` doesn't work, because aliases from `SELECT` aren't available yet at that stage (`ORDER BY` runs later, which is why `ORDER BY total` *does* work).

### `WHERE` and `HAVING` together

They do different jobs, and you'll often need both:

```sql
SELECT customer_id, count(*) AS orders
FROM orders
WHERE status <> 'cancelled'        -- 1. drop cancelled orders (rows)
GROUP BY customer_id               -- 2. one group per customer
HAVING count(*) >= 2               -- 3. keep customers with 2+ orders (groups)
ORDER BY customer_id;
```

```
 customer_id | orders
-------------+--------
           1 |      3
           2 |      2
           3 |      2
           4 |      2
           6 |      2
(5 rows)
```

Asha's count dropped from 4 to 3, because `WHERE` removed her cancelled order *before* the counting. A rule of thumb: **if the condition is about a single row's values, use `WHERE`. If it's about a group's total, use `HAVING`.**

### The order things happen in

This is worth memorizing, because it explains every "why doesn't this work" in grouping:

```
FROM        1. which table(s)
WHERE       2. keep some rows
GROUP BY    3. put rows into groups
HAVING      4. keep some groups
SELECT      5. compute the output columns (aggregates happen here)
ORDER BY    6. sort the result
LIMIT       7. cut it down
```

You *write* `SELECT` first, but it *runs* fifth. That's why `WHERE` can't see aggregates (they don't exist yet), `HAVING` can't see aliases (same reason), and `ORDER BY` can see both.

### Grouping by an expression

You don't have to group by a plain column. Group orders by month:

```sql
SELECT date_trunc('month', ordered_at)::date AS month, count(*) AS orders
FROM orders
GROUP BY month
ORDER BY month;
```

```
   month    | orders
------------+--------
 2026-07-01 |      4
 2026-08-01 |      4
 2026-09-01 |      4
(3 rows)
```

`date_trunc('month', ...)` chops a timestamp down to the first of its month ([chapter 24](../24-built-in-functions/notes.md)). PostgreSQL lets you `GROUP BY` the alias `month`, which many other databases don't; you can also write `GROUP BY 1`, meaning "the first output column". Both are fine. Repeating the whole expression in `GROUP BY` is the most portable.

### Grouping by two columns

One group per **combination**:

```sql
SELECT category_id, is_active, count(*)
FROM products
GROUP BY category_id, is_active
ORDER BY category_id, is_active;
```

```
 category_id | is_active | count
-------------+-----------+-------
           1 | f         |     1
           1 | t         |     4
           2 | t         |     2
           3 | t         |     2
           4 | t         |     2
(5 rows)
```

Category 1 splits into two rows, one for the discontinued Stapler and one for the four active products. Add more columns to `GROUP BY` and the groups get finer.

### Top N groups

`GROUP BY` plus `ORDER BY` plus `LIMIT` is the "top 3" pattern:

```sql
SELECT product_id, sum(quantity) AS units
FROM order_items
GROUP BY product_id
ORDER BY units DESC
LIMIT 3;
```

```
 product_id | units
------------+-------
          2 |    35
          1 |     8
          3 |     6
(3 rows)
```

Pens, notebooks, sticky notes. The three best-selling products by units.

### Two more aggregates worth knowing

**`FILTER`** from chapter 20 shines with grouping, for side-by-side counts per group:

```sql
SELECT date_trunc('month', ordered_at)::date AS month,
       count(*) AS orders,
       count(*) FILTER (WHERE status = 'shipped') AS shipped
FROM orders
GROUP BY month
ORDER BY month;
```

```
   month    | orders | shipped
------------+--------+---------
 2026-07-01 |      4 |       2
 2026-08-01 |      4 |       3
 2026-09-01 |      4 |       1
(3 rows)
```

**`string_agg`** glues a group's text values into one string:

```sql
SELECT city, string_agg(name, ', ' ORDER BY name) AS people
FROM customers
GROUP BY city
ORDER BY city;
```

```
   city    |             people
-----------+--------------------------------
 Kathmandu | Asha Rai, Dipesh Thapa
 Lalitpur  | Chandra Gurung, Elina Maharjan
 Pokhara   | Bikram Shrestha, Farhan Ali
(3 rows)
```

Great for reports. The `ORDER BY` inside the brackets controls the order of the names.

## Common mistakes

**1. A column that's neither grouped nor aggregated**

```sql
SELECT name, count(*) FROM products GROUP BY category_id;
```

```
ERROR:  column "products.name" must appear in the GROUP BY clause or be used in an aggregate function
```

Five products in category 1, one count. Which name should go in the row? PostgreSQL won't guess. Either add `name` to `GROUP BY` (changing what the groups mean) or aggregate it (`string_agg(name, ', ')`, `min(name)`).

**2. `WHERE` after `GROUP BY`**

```sql
SELECT status, count(*) FROM orders GROUP BY status WHERE count(*) > 1;
```

```
ERROR:  syntax error at or near "WHERE"
```

Filtering groups is `HAVING`. `WHERE` goes before `GROUP BY`, and it can't use aggregates.

**3. An alias in `HAVING`**

`HAVING total > 50` gives `column "total" does not exist`. Repeat the expression: `HAVING sum(quantity * unit_price) > 50`.

**4. Expecting missing groups to show as zero**

Customer 5 doesn't appear in "orders per customer". No rows, no group. Chapter 23.

**5. Using `HAVING` for row conditions**

`HAVING status = 'shipped'` sometimes works (if `status` is grouped) but it's doing `WHERE`'s job badly. Row conditions go in `WHERE`; it's clearer and faster.

**6. Forgetting `ORDER BY`**

Grouped results come back in whatever order PostgreSQL built the groups. Always sort a report.

## Quick recap

- `GROUP BY column` makes one group per value and runs aggregates once per group. One row out per group.
- Every `SELECT` column must be in the `GROUP BY` or inside an aggregate.
- `WHERE` filters **rows** before grouping. `HAVING` filters **groups** after. Use both when you need both.
- Execution order: `FROM`, `WHERE`, `GROUP BY`, `HAVING`, `SELECT`, `ORDER BY`, `LIMIT`. It explains what each clause can see.
- Group by expressions (`date_trunc('month', ...)`) and by several columns (one group per combination).
- `ORDER BY aggregate DESC LIMIT n` is the "top N" pattern.
- Groups only exist for rows that exist. Zero-rows groups need an outer join (chapter 23).

---

**Next:** try the [exercises](exercises.md), then move on to [22 Joins](../22-joins/notes.md).
