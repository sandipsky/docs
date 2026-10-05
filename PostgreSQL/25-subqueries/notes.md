# 25 Subqueries

## What is it?

A **subquery** is a query inside another query. You put a whole `SELECT` in brackets and use its result as if it were a value, a list, or a table.

```sql
SELECT name, price FROM products
WHERE price > (SELECT avg(price) FROM products);
```

The inner query works out the average. The outer query uses it. One statement, two steps.

## Why does it matter?

Some questions have two parts: "find the average, then find the products above it." "Find the customers who have orders, then list everyone *else*." "Total each order, then average the totals." Until now you'd run the first query, read the answer, and type it into the second. A subquery lets the database do both parts in one go, and the answer stays right when the data changes.

Subqueries also give you new ways to ask about existence ("customers who have *any* cancelled order") and absence ("products that appear in *no* order"), which are often clearer than the outer-join tricks of chapter 23.

## Real-world example

Asking the librarian a two-part question:

| You say | SQL |
|---|---|
| "What's the average page count?" (pause) "OK, show me every book longer than that." | `WHERE pages > (SELECT avg(pages) ...)` |
| "Which members have overdue books? Right, send *them* a letter." | `WHERE id IN (SELECT member_id FROM loans WHERE ...)` |
| "Is there *any* loan for this book? If so, don't put it in the sale." | `WHERE EXISTS (SELECT 1 FROM loans WHERE ...)` |

The bracketed part is you waiting for the first answer before asking the second.

## How it works

Work in `sales`, with `\pset null '[NULL]'`.

### A subquery as a single value

When a subquery returns exactly one row and one column, you can use it anywhere a value goes:

```sql
SELECT name, price
FROM products
WHERE price > (SELECT avg(price) FROM products)
ORDER BY price DESC;
```

```
     name     | price
--------------+--------
 Office chair | 149.00
 Backpack     |  45.00
 USB hub      |  29.99
(3 rows)
```

The average is 27.44, and three products beat it. This is called a **scalar subquery** (scalar means "a single value"). If the data changes, so does the average, and the query stays right.

A scalar subquery works in `SELECT` too:

```sql
SELECT name, price, round(price - (SELECT avg(price) FROM products), 2) AS vs_average
FROM products
ORDER BY vs_average DESC
LIMIT 4;
```

```
     name     | price  | vs_average
--------------+--------+------------
 Office chair | 149.00 |     121.56
 Backpack     |  45.00 |      17.56
 USB hub      |  29.99 |       2.55
 Desk lamp    |  24.99 |      -2.45
(4 rows)
```

If a scalar subquery returns more than one row, PostgreSQL refuses:

```
ERROR:  more than one row returned by a subquery used as an expression
```

That error means "you used a list where a single value was needed". Either add `LIMIT 1` (if any one will do), make the subquery an aggregate, or switch to `IN`.

### A subquery as a list: `IN`

When the inner query returns many rows of one column, use it with `IN`:

```sql
SELECT name
FROM customers
WHERE id IN (SELECT customer_id FROM orders WHERE status = 'pending')
ORDER BY name;
```

```
    name
------------
 Asha Rai
 Farhan Ali
(2 rows)
```

"Customers whose id is in the list of customer ids with a pending order." Read it from the inside out: the inner query makes the list, the outer picks from it.

`NOT IN` gives the opposite:

```sql
SELECT name
FROM customers
WHERE id NOT IN (SELECT customer_id FROM orders);
```

```
      name
----------------
 Elina Maharjan
(1 row)
```

The chapter 23 "never ordered" question, without a join. Many people find this version easier to read.

**The `NOT IN` trap.** If the inner list contains even one NULL, `NOT IN` returns *nothing*, with no error. Why? `id NOT IN (1, 2, NULL)` means `id <> 1 AND id <> 2 AND id <> NULL`, and that last part is unknown, which poisons the whole condition. Here `customer_id` is `NOT NULL`, so we're safe. When the column can be NULL, use `NOT EXISTS` instead. That's next.

### Does one exist? `EXISTS`

`EXISTS (subquery)` is true if the subquery returns at least one row. It doesn't care *what* the rows are, only whether there are any:

```sql
SELECT c.name
FROM customers c
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'cancelled');
```

```
   name
----------
 Asha Rai
(1 row)
```

"Customers for whom there exists at least one cancelled order." The `SELECT 1` is a convention: since only existence matters, select the simplest thing.

Notice the inner query mentions `c.id`, a column from the **outer** query. That makes it a **correlated subquery**: it's re-run for each customer, with that customer's id plugged in. More on that below.

`NOT EXISTS` is the safest way to ask "has none":

```sql
SELECT p.name
FROM products p
WHERE NOT EXISTS (SELECT 1 FROM order_items oi WHERE oi.product_id = p.id);
```

```
       name
-------------------
 Whiteboard marker
(1 row)
```

Products with no order lines at all. Unlike `NOT IN`, `NOT EXISTS` is never confused by NULLs, so prefer it for "has none" questions.

### Correlated subqueries

A correlated subquery refers to the current row of the outer query. Each product next to its own category's average:

```sql
SELECT p.name, p.price,
       (SELECT round(avg(p2.price), 2) FROM products p2 WHERE p2.category_id = p.category_id) AS category_avg
FROM products p
ORDER BY p.category_id, p.price DESC;
```

```
       name        | price  | category_avg
-------------------+--------+--------------
 Stapler           |   8.00 |         3.53
 Notebook          |   3.90 |         3.53
 Sticky notes      |   2.75 |         3.53
 Whiteboard marker |   1.80 |         3.53
 Pen               |   1.20 |         3.53
 Office chair      | 149.00 |        87.00
 Desk lamp         |  24.99 |        87.00
 ...
(11 rows)
```

For each product `p`, the inner query averages the products `p2` in the same category. Same table, two aliases, like the self-join in chapter 22. Then filter on it to find products above their category's average:

```sql
SELECT p.name, p.price
FROM products p
WHERE p.price > (SELECT avg(p2.price) FROM products p2 WHERE p2.category_id = p.category_id)
ORDER BY p.category_id;
```

```
     name     | price
--------------+--------
 Notebook     |   3.90
 Stapler      |   8.00
 Office chair | 149.00
 Backpack     |  45.00
 USB hub      |  29.99
(5 rows)
```

Correlated subqueries are easy to read but can be slow on big tables, because the inner query runs once per outer row. [Chapter 28](../28-window-functions/notes.md) shows a faster way to do "compare to the group" calculations.

### A subquery as a table: in `FROM`

A subquery can stand in for a table. Average order value: first total each order, then average the totals.

```sql
SELECT round(avg(total), 2) AS avg_order_value
FROM (
  SELECT order_id, sum(quantity * unit_price) AS total
  FROM order_items
  GROUP BY order_id
) AS order_totals;
```

```
 avg_order_value
-----------------
           59.10
(1 row)
```

The inner query is the chapter 21 "totals per order" result. The outer query treats it as a table called `order_totals` and averages its `total` column. This is called a **derived table**.

You can't write `avg(sum(...))` directly; aggregates don't nest. Two steps is the honest way, and a derived table is how you write two steps in one statement.

Give derived tables a name (`AS order_totals`). Older PostgreSQL versions required it, and even where it's optional, a name tells the reader what the inner result *is*.

### Subqueries in `INSERT`, `UPDATE`, `DELETE`

Remember chapter 17, where you typed a product's price into an order item by hand? Let the database look it up:

```sql
BEGIN;
INSERT INTO order_items (order_id, product_id, quantity, unit_price)
VALUES (12, 2, 4, (SELECT price FROM products WHERE id = 2))
RETURNING *;
ROLLBACK;
```

```
 order_id | product_id | quantity | unit_price
----------+------------+----------+------------
       12 |          2 |        4 |       1.20
```

The scalar subquery fetches the current price at the moment of insert: a proper snapshot. (The `ROLLBACK` keeps the dataset unchanged for later chapters.)

`UPDATE` and `DELETE` take subqueries in their `WHERE` too. Deactivate products that have never sold:

```sql
BEGIN;
UPDATE products SET is_active = false
WHERE NOT EXISTS (SELECT 1 FROM order_items oi WHERE oi.product_id = products.id)
RETURNING name, is_active;
ROLLBACK;
```

```
       name        | is_active
-------------------+-----------
 Whiteboard marker | f
```

Inside `UPDATE products`, there's no alias, so the outer row is referred to as `products.id`.

### `ANY` and `ALL`

Two comparison helpers you'll see occasionally. `> ALL (list)` means "bigger than every value"; `> ANY (list)` means "bigger than at least one". Products priced above every Stationery item:

```sql
SELECT name, price FROM products
WHERE price > ALL (SELECT price FROM products WHERE category_id = 1)
ORDER BY price;
```

Six rows, from the Wireless mouse up. `= ANY (...)` is exactly `IN (...)`. These read well once in a while; most people reach for `IN`, `EXISTS`, or `max()` instead.

### Join or subquery?

Often both work. Rough guide:

| You want | Reach for |
|---|---|
| Columns from both tables in the result | A join |
| To filter one table by what's in another, showing only the first | `IN` or `EXISTS` |
| "Has none" | `NOT EXISTS` |
| A single computed number to compare against | A scalar subquery |
| To aggregate an aggregate | A derived table (or a CTE, next chapter) |

When a query gets long, the next chapter's **CTEs** let you name each step. They're subqueries you can read top to bottom.

## Common mistakes

**1. A list where a value was needed**

`WHERE id = (SELECT customer_id FROM orders)` fails with "more than one row". Use `IN`, or make the subquery return one row.

**2. `NOT IN` with NULLs**

Returns nothing, silently. Use `NOT EXISTS` when the inner column can be NULL.

**3. Forgetting the outer reference in a correlated subquery**

`WHERE price > (SELECT avg(price) FROM products WHERE category_id = category_id)` compares the column to itself: always true. Use aliases: `p2.category_id = p.category_id`.

**4. Selecting real columns in `EXISTS`**

`EXISTS (SELECT o.* ...)` works but misleads. `SELECT 1` says "I only care whether rows exist".

**5. Nesting aggregates**

`avg(sum(x))` is an error. Sum in a derived table, average outside.

**6. Unreadable nesting**

Three subqueries deep is hard for everyone. The next chapter fixes that.

## Quick recap

- A subquery is a `SELECT` in brackets, used as a **value** (one row, one column), a **list** (`IN`), a **test** (`EXISTS`), or a **table** (in `FROM`).
- Scalar subqueries compare against a computed number: `WHERE price > (SELECT avg(price) ...)`.
- `IN (subquery)` picks from a list. `NOT IN` breaks if the list has a NULL; prefer `NOT EXISTS`.
- `EXISTS` / `NOT EXISTS` ask "is there any?" / "is there none?", usually correlated to the outer row.
- A derived table in `FROM` lets you aggregate an aggregate. Name it.
- Subqueries work inside `INSERT`, `UPDATE`, and `DELETE` too: look up the price, deactivate the unsold.

---

**Next:** try the [exercises](exercises.md), then move on to [26 Common Table Expressions](../26-common-table-expressions/notes.md).
