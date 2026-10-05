# 33 Views

## What is it?

A **view** is a saved query that you can use like a table:

```sql
CREATE VIEW order_totals AS
SELECT o.id AS order_id, o.customer_id, o.ordered_at, o.status,
       sum(oi.quantity * oi.unit_price) AS total
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
GROUP BY o.id;

SELECT * FROM order_totals WHERE total > 50;
```

The view stores the *query*, not the data. Every time you select from it, PostgreSQL runs the saved query against the live tables. So it's always up to date, and it takes no space.

## Why does it matter?

You wrote "total each order" as a CTE in chapters 26, 28, and 29, over and over. A view writes it **once**, gives it a name, and every query in the project can use it. When the definition needs to change (say, to exclude cancelled orders), you change it in one place.

Views also hide complexity and hide columns. A `public_products` view that shows `name` and `price` but not `cost_price` or `supplier_id` can be handed to someone who should never see those. [Chapter 34](../34-users-roles-and-permissions/notes.md) uses that.

## Real-world example

A **saved search** or a **smart playlist**. You define "songs I rated 5 stars added this year" once. Every time you open it, it shows the current matches. It isn't a copy of the songs; it's a rule that's re-applied each time. Add a song that matches, and it appears. That's a view.

A **materialized view**, which you'll meet below, is the same playlist burned to a CD: fast to play, but it doesn't change until you burn it again.

## How it works

Work in `sales`, with `\pset null '[NULL]'`.

### Creating and using a view

Create `order_totals` as above. Then:

```sql
SELECT * FROM order_totals ORDER BY order_id LIMIT 3;
```

```
 order_id | customer_id |        ordered_at         | status  | total
----------+-------------+---------------------------+---------+--------
        1 |           1 | 2026-07-03 10:15:00+05:45 | paid    |  13.00
        2 |           2 | 2026-07-10 14:30:00+05:45 | shipped |  32.99
        3 |           3 | 2026-07-18 09:05:00+05:45 | shipped | 149.00
(3 rows)
```

It looks like a table with five columns. Join to it, filter it, group it:

```sql
SELECT c.name, count(*) AS orders, sum(ot.total) AS spent
FROM order_totals ot
JOIN customers c ON c.id = ot.customer_id
WHERE ot.status <> 'cancelled'
GROUP BY c.name
ORDER BY spent DESC
LIMIT 3;
```

```
      name      | orders | spent
----------------+--------+--------
 Chandra Gurung |      2 | 239.00
 Asha Rai       |      3 | 218.19
 Dipesh Thapa   |      2 |  86.23
(3 rows)
```

The chapter 26 two-CTE query, with the first CTE replaced by a view. Shorter, and the "total each order" logic now lives in exactly one place.

### Views are always current

```sql
BEGIN;
UPDATE order_items SET quantity = 10 WHERE order_id = 1 AND product_id = 1;
SELECT order_id, total FROM order_totals WHERE order_id = 1;   -- 41.00
ROLLBACK;
SELECT order_id, total FROM order_totals WHERE order_id = 1;   -- 13.00
```

The view reflected the change instantly, and the rollback instantly too. There's no copy to get stale. It's just the query, re-run.

### Seeing what's there

```
\dv                    -- list views
\d+ order_totals       -- columns, and the saved query
```

The `\d+` output ends with `View definition:` and the SQL, slightly reformatted by PostgreSQL. Useful when you've forgotten what a view does.

### Hiding columns and rows

```sql
CREATE VIEW public_products AS
SELECT id, name, price FROM products WHERE is_active;
```

Anyone using `public_products` sees three columns of active products. They can't see `stock`, `sku`, or discontinued items, because the view doesn't include them. Combined with permissions (next chapter), this is how you give a reporting tool or a junior colleague exactly what they need and nothing more.

### Changing a view

```sql
CREATE OR REPLACE VIEW public_products AS
SELECT id, name, price, stock FROM products WHERE is_active;
```

`CREATE OR REPLACE` swaps the definition. One limit: you can **add** columns at the end but not **remove** or reorder existing ones, because other views or queries may depend on them:

```sql
CREATE OR REPLACE VIEW public_products AS SELECT id, name FROM products WHERE is_active;
```

```
ERROR:  cannot drop columns from view
```

To shrink a view, `DROP VIEW` and `CREATE VIEW` again.

### Views on views

A view can select from another view:

```sql
CREATE VIEW customer_spending AS
SELECT c.id AS customer_id, c.name, c.city,
       count(ot.order_id) AS orders,
       coalesce(sum(ot.total), 0) AS spent
FROM customers c
LEFT JOIN order_totals ot ON ot.customer_id = c.id AND ot.status <> 'cancelled'
GROUP BY c.id;

SELECT * FROM customer_spending ORDER BY spent DESC;
```

```
 customer_id |      name       |   city    | orders | spent
-------------+-----------------+-----------+--------+--------
           3 | Chandra Gurung  | Lalitpur  |      2 | 239.00
           1 | Asha Rai        | Kathmandu |      3 | 218.19
           4 | Dipesh Thapa    | Kathmandu |      2 |  86.23
           6 | Farhan Ali      | Pokhara   |      2 |  64.75
           2 | Bikram Shrestha | Pokhara   |      2 |  55.99
           5 | Elina Maharjan  | Lalitpur  |      0 |      0
(6 rows)
```

Layers of views are like layers of CTEs: each one small and readable. Two or three layers is fine. Ten layers deep makes plans hard to read and slow; keep an eye on it.

### Views create dependencies

```sql
DROP TABLE orders;
```

```
ERROR:  cannot drop table orders because other objects depend on it
DETAIL:  constraint order_items_order_id_fkey on table order_items depends on table orders
view order_totals depends on table orders
view customer_spending depends on view order_totals
HINT:  Use DROP ... CASCADE to drop the dependent objects too.
```

PostgreSQL won't pull a table out from under a view. That's protection. `DROP TABLE orders CASCADE` would drop the views too, which is rarely what you want. Also, renaming a column that a view uses is blocked the same way. In a project with many views, every schema change has to consider them, which is one reason not to make a view for everything.

### Can you write through a view?

Simple views (one table, no `GROUP BY`, no aggregates, no `DISTINCT`) are **automatically updatable**:

```sql
BEGIN;
UPDATE public_products SET price = 4.00 WHERE id = 1 RETURNING *;
SELECT id, name, price FROM products WHERE id = 1;    -- 4.00: the real table changed
ROLLBACK;
```

PostgreSQL translates the update onto `products`. Views with grouping can't be updated this way:

```sql
UPDATE order_totals SET total = 0 WHERE order_id = 1;
```

```
ERROR:  cannot update view "order_totals"
DETAIL:  Views containing GROUP BY are not automatically updatable.
```

Which makes sense: `total` is computed, so what would it mean to set it? Mostly you'll use views for reading. Updatable simple views are a nice bonus for the "hide some columns" case.

### Materialized views: a saved copy

A normal view re-runs its query every time. If the query is slow (a complex report over millions of rows) and the data doesn't need to be live to the second, store the result instead:

```sql
CREATE MATERIALIZED VIEW monthly_revenue AS
SELECT date_trunc('month', ordered_at)::date AS month, count(*) AS orders, sum(total) AS revenue
FROM order_totals
WHERE status <> 'cancelled'
GROUP BY 1;

SELECT * FROM monthly_revenue ORDER BY month;
```

```
   month    | orders | revenue
------------+--------+---------
 2026-07-01 |      3 |  194.99
 2026-08-01 |      4 |  288.48
 2026-09-01 |      4 |  180.69
(3 rows)
```

That result is **stored**, like a table. Reading it is instant no matter how slow the query behind it is. The cost is that it goes stale:

```sql
BEGIN;
INSERT INTO orders (customer_id, ordered_at, status) VALUES (5, '2026-09-28 10:00+05:45', 'paid');
INSERT INTO order_items VALUES (currval(pg_get_serial_sequence('orders', 'id')), 2, 100, 1.20);
SELECT * FROM monthly_revenue WHERE month = '2026-09-01';    -- still 4 orders, 180.69
REFRESH MATERIALIZED VIEW monthly_revenue;
SELECT * FROM monthly_revenue WHERE month = '2026-09-01';    -- now 5 orders, 300.69
ROLLBACK;
REFRESH MATERIALIZED VIEW monthly_revenue;                    -- back to 4
```

New data doesn't appear until `REFRESH MATERIALIZED VIEW`. In practice you schedule the refresh (hourly, nightly) and accept that the dashboard is a little behind. `\dm` lists materialized views. They can have indexes, like tables.

Use a materialized view when the query is expensive and slightly-old data is fine. Use a plain view everywhere else.

### Dropping views

```sql
DROP MATERIALIZED VIEW monthly_revenue;
DROP VIEW customer_spending;
DROP VIEW public_products;
DROP VIEW order_totals;
```

Drop dependents first (or use `CASCADE` on the one they depend on).

### Where views fit

| Use a view for | Example |
|---|---|
| A calculation many queries share | `order_totals` |
| Hiding columns or rows from some users | `public_products`, with permissions |
| Giving a long join a short name | `order_details` with customer, product, and item columns |
| A stable interface while tables change underneath | Rename a column, update the view, nobody's queries break |

| Don't use a view for | Why |
|---|---|
| Something used by one query | A CTE is simpler and has no dependency |
| Storing data | Views store queries. Use a table (or a materialized view) |
| Replacing every join in the project | Ten layers of views are slow to read and slow to run |

## Common mistakes

**1. Expecting a view to be faster**

A plain view is exactly as fast as its query. It saves typing, not time. For speed, materialize or index.

**2. Forgetting a materialized view is stale**

The dashboard shows yesterday's numbers because nobody refreshed. Schedule the refresh, and show the refresh time on the dashboard.

**3. `CASCADE` on a `DROP TABLE`**

Takes all dependent views with it, silently. Read the `DETAIL` list first.

**4. Too many layers**

A view on a view on a view. Each layer is a query; the planner has to merge them all. Flatten when it gets deep.

**5. Trying to drop a column via `CREATE OR REPLACE`**

Not allowed. `DROP VIEW` then `CREATE VIEW`.

**6. Views as the only security**

A view hides columns, but only if the user can't also read the base table. Pair it with the permissions in the next chapter.

## Quick recap

- `CREATE VIEW name AS SELECT ...` saves a query to use like a table. It stores the query, not the data, so it's always current.
- Use views for shared calculations, hiding columns, naming long joins, and a stable interface.
- `CREATE OR REPLACE` can add columns, not remove them. Views block dropping or renaming what they depend on.
- Simple one-table views can be updated; grouped views can't.
- **Materialized views** store the result: fast, but stale until `REFRESH MATERIALIZED VIEW`.
- `\dv`, `\dm`, `\d+ view_name`.

---

**Next:** try the [exercises](exercises.md), then move on to [34 Users, Roles and Permissions](../34-users-roles-and-permissions/notes.md).
