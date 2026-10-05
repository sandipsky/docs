# 26 Common Table Expressions

## What is it?

A **common table expression** (everyone says **CTE**) is a named, temporary result that lives for one query. You define it at the top with `WITH`, then use it below as if it were a table:

```sql
WITH order_totals AS (
  SELECT order_id, sum(quantity * unit_price) AS total
  FROM order_items
  GROUP BY order_id
)
SELECT * FROM order_totals WHERE total > 50;
```

It's a subquery that you've pulled out, given a name, and put first.

## Why does it matter?

Chapter 25 ended with queries that were getting hard to read: a derived table inside a `FROM`, with another copy of the same derived table inside a scalar subquery. CTEs fix that in three ways:

1. **You read top to bottom.** Step one, step two, step three, final answer. Not inside-out.
2. **You write each step once** and reuse it by name.
3. **You can test each step** by itself: `WITH ... SELECT * FROM step_one;`.

Most professional SQL for reports is written as a chain of CTEs. It's the difference between a recipe with numbered steps and one long sentence.

## Real-world example

A recipe:

> 1. **Sauce:** simmer tomatoes, garlic, and oil for 20 minutes.
> 2. **Pasta:** boil until al dente.
> 3. Combine the sauce and the pasta. Serve.

Each named step is a CTE. Step 3 refers to steps 1 and 2 by name. You could write the whole thing as one tangled sentence ("combine pasta that has been boiled until al dente with tomatoes that have been simmered with..."), and that's a nested subquery. Nobody wants to cook from that.

## How it works

Work in `sales`, with `\pset null '[NULL]'`.

### One CTE

Order totals with customer names, biggest first:

```sql
WITH order_totals AS (
  SELECT order_id, sum(quantity * unit_price) AS total
  FROM order_items
  GROUP BY order_id
)
SELECT o.id, c.name, o.status, ot.total
FROM orders o
JOIN customers c ON c.id = o.customer_id
JOIN order_totals ot ON ot.order_id = o.id
ORDER BY ot.total DESC
LIMIT 5;
```

```
 id |      name      |  status   | total
----+----------------+-----------+--------
  8 | Asha Rai       | shipped   | 173.99
  3 | Chandra Gurung | shipped   | 149.00
  9 | Chandra Gurung | shipped   |  90.00
  5 | Dipesh Thapa   | shipped   |  56.24
  4 | Asha Rai       | cancelled |  45.00
(5 rows)
```

Step one: total each order (`order_totals`). Step two: join it to orders and customers. The main query reads like any other join, because `order_totals` behaves like a table.

Compare this with the chapter 22 version, which joined `order_items` directly and needed `count(DISTINCT o.id)` to avoid counting lines. Totalling first, in a CTE, sidesteps the whole trap: by the time you join, there's one row per order.

### Several CTEs

Separate them with commas. Later ones can use earlier ones:

```sql
WITH order_totals AS (
  SELECT order_id, sum(quantity * unit_price) AS total
  FROM order_items
  GROUP BY order_id
),
customer_totals AS (
  SELECT o.customer_id, count(*) AS orders, sum(ot.total) AS spent
  FROM orders o
  JOIN order_totals ot ON ot.order_id = o.id
  WHERE o.status <> 'cancelled'
  GROUP BY o.customer_id
)
SELECT c.name, ct.orders, ct.spent
FROM customers c
JOIN customer_totals ct ON ct.customer_id = c.id
ORDER BY ct.spent DESC;
```

```
      name       | orders | spent
-----------------+--------+--------
 Chandra Gurung  |      2 | 239.00
 Asha Rai        |      3 | 218.19
 Dipesh Thapa    |      2 |  86.23
 Farhan Ali      |      2 |  64.75
 Bikram Shrestha |      2 |  55.99
(5 rows)
```

Three clear steps: total the orders, total per customer, attach names. Each step is small enough to understand on its own, and `count(*)` is correct in step two because `order_totals` has one row per order.

Only one `WITH` at the top, then `name AS (...)`, comma, `name AS (...)`, and finally the main `SELECT` with no comma before it.

### The "aggregate an aggregate" problem, solved

Chapter 25's average order value, as a CTE:

```sql
WITH order_totals AS (
  SELECT order_id, sum(quantity * unit_price) AS total
  FROM order_items
  GROUP BY order_id
)
SELECT round(avg(total), 2) AS avg_order, max(total) AS biggest, min(total) AS smallest
FROM order_totals;
```

```
 avg_order | biggest | smallest
-----------+---------+----------
     59.10 |  173.99 |    13.00
(1 row)
```

Same answer as the derived table, and now you can get three aggregates from the step without repeating it.

### Testing a step

While building a long query, check the intermediate results:

```sql
WITH order_totals AS (
  SELECT order_id, sum(quantity * unit_price) AS total FROM order_items GROUP BY order_id
)
SELECT * FROM order_totals ORDER BY order_id;
```

Twelve rows, one per order, totals you recognize from chapter 21. Good. Now add the next step. Building queries this way, one verified step at a time, is how you avoid "the final number is wrong and I don't know which part did it".

### Filling in the gaps: a calendar CTE

`GROUP BY month` only shows months that had orders (chapter 21). To show every month, including empty ones, generate the months first and left-join the data onto them:

```sql
WITH months AS (
  SELECT generate_series(date '2026-06-01', date '2026-10-01', interval '1 month')::date AS month
),
monthly AS (
  SELECT date_trunc('month', ordered_at)::date AS month, count(*) AS orders
  FROM orders
  GROUP BY 1
)
SELECT m.month, coalesce(mo.orders, 0) AS orders
FROM months m
LEFT JOIN monthly mo ON mo.month = m.month
ORDER BY m.month;
```

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

`generate_series(start, stop, step)` is a built-in that produces a list of values: numbers or dates. It's the standard way to make a "calendar" to join against. June and October show zero instead of vanishing. This pattern appears in nearly every dashboard.

### Recursive CTEs

A CTE can refer to **itself**. That lets a query repeat until it runs out of rows: counting, walking a tree, following a chain. Start with the smallest possible example:

```sql
WITH RECURSIVE numbers AS (
  SELECT 1 AS n              -- the starting row
  UNION ALL
  SELECT n + 1 FROM numbers  -- each round: take the previous rows and add one
  WHERE n < 5                -- until this stops being true
)
SELECT n FROM numbers;
```

```
 n
---
 1
 2
 3
 4
 5
(5 rows)
```

Two halves joined by `UNION ALL` ([chapter 27](../27-combining-results/notes.md)): the starting row, and a step that builds on what's there so far. The `WHERE` is the brake. Forget it and the query runs forever (press Ctrl+C).

For plain numbers and dates, `generate_series` is simpler. Recursion earns its keep on **hierarchies**: an org chart, nested categories, folders inside folders. Using the employees from chapter 22, plus one more level:

```sql
CREATE TEMP TABLE employees (id integer PRIMARY KEY, name text, manager_id integer REFERENCES employees (id));
INSERT INTO employees VALUES
  (1, 'Maya Rai', NULL), (2, 'Dev Shrestha', 1), (3, 'Asha Thapa', 2),
  (4, 'Bikram Karki', 2), (5, 'Sita Gurung', 1), (6, 'Ram Lama', 3);

WITH RECURSIVE chain AS (
  SELECT id, name, manager_id, 1 AS level
  FROM employees
  WHERE manager_id IS NULL                     -- start at the top
  UNION ALL
  SELECT e.id, e.name, e.manager_id, chain.level + 1
  FROM employees e
  JOIN chain ON chain.id = e.manager_id        -- each round: the people who report to the last round
)
SELECT repeat('  ', level - 1) || name AS org_chart, level
FROM chain
ORDER BY level, name;
```

```
    org_chart     | level
------------------+-------
 Maya Rai         |     1
   Dev Shrestha   |     2
   Sita Gurung    |     2
     Asha Thapa   |     3
     Bikram Karki |     3
       Ram Lama   |     4
(6 rows)
```

Round one finds Maya (no manager). Round two finds everyone who reports to Maya. Round three finds their reports, and so on until a round finds nobody. A plain join can only go a fixed number of levels; recursion goes as deep as the data does.

"Everyone under Dev, however far down" is the same shape with a different starting row (`WHERE name = 'Dev Shrestha'`), and gives Asha, Bikram, and Ram.

You won't write recursive CTEs often. But when you need one, nothing else will do, and now you'll recognize the shape.

### CTEs that change data

`INSERT`, `UPDATE`, and `DELETE` can live inside a CTE too, with `RETURNING` feeding the rows to the main query. Remove the lines of cancelled orders and report what went:

```sql
BEGIN;
WITH cancelled_items AS (
  DELETE FROM order_items
  WHERE order_id IN (SELECT id FROM orders WHERE status = 'cancelled')
  RETURNING *
)
SELECT count(*) AS removed_lines, sum(quantity * unit_price) AS removed_value
FROM cancelled_items;
ROLLBACK;
```

```
 removed_lines | removed_value
---------------+---------------
             1 |         45.00
(1 row)
```

Delete and summarize in one statement. Handy for migrations and clean-up scripts.

### A note on performance

PostgreSQL usually treats a CTE like a subquery: it can merge it into the main query and optimize the whole thing. If you ever need the opposite (compute the CTE once and store it, for example when the CTE is used several times and is expensive), write `WITH name AS MATERIALIZED (...)`. You won't need this for a long time. Write CTEs for clarity and let PostgreSQL worry about speed.

## Common mistakes

**1. A comma before the main `SELECT`**

```sql
WITH a AS (...), b AS (...),
SELECT ...
```

Syntax error. Commas go between CTEs, not after the last one.

**2. Forgetting `RECURSIVE`**

A CTE that refers to itself without the keyword gives `relation "numbers" does not exist`. If it recurses, say `WITH RECURSIVE`.

**3. No brake on a recursive CTE**

Without a `WHERE` in the recursive half, it never ends. Ctrl+C, add the condition.

**4. Rewriting a simple query as five CTEs**

A query that was clear as one `SELECT` doesn't get clearer with a `WITH`. Use CTEs when there are real steps.

**5. Using a CTE in a different statement**

A CTE lives for one statement. `WITH t AS (...) SELECT ...;` then `SELECT * FROM t;` fails. If you need a result across statements, that's a view ([chapter 33](../33-views/notes.md)) or a temp table.

**6. `count(*)` after joining line-level data**

The chapter 22 trap. The CTE way around it: total per order first, then join and count.

## Quick recap

- `WITH name AS (SELECT ...) SELECT ... FROM name` names a step and uses it like a table. Read top to bottom.
- Chain steps with commas; later CTEs can use earlier ones. No comma before the final `SELECT`.
- CTEs solve "aggregate an aggregate" and the join-and-count trap cleanly: total first, then join.
- Test each step with `SELECT * FROM step` before adding the next.
- `generate_series` + `LEFT JOIN` fills in missing months or days.
- `WITH RECURSIVE` repeats until no rows are left: for hierarchies like org charts and nested folders. Always include a brake.
- A CTE can wrap `DELETE`/`UPDATE`/`INSERT ... RETURNING` and report on what changed.

---

**Next:** try the [exercises](exercises.md), then move on to [27 Combining Results](../27-combining-results/notes.md).
