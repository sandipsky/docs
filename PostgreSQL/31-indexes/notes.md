# 31 Indexes

## What is it?

An **index** is a separate, sorted structure that lets PostgreSQL find rows by a column's value without reading the whole table. You create one with a single line:

```sql
CREATE INDEX idx_orders_customer_id ON orders (customer_id);
```

After that, "find the orders for customer 42" jumps straight to them instead of checking every row.

## Why does it matter?

On your 12-row `orders` table, every query is instant and indexes change nothing. On a real table with ten million rows, a query that checks every row takes seconds, and the same query with the right index takes a millisecond. That's not a small difference. It's the difference between an app that feels instant and one that feels broken.

Indexes are the single biggest performance tool you have. They're also the one most beginners don't know exists, which is why "the database is slow" is so often fixed by one `CREATE INDEX`.

## Real-world example

The index at the back of a textbook.

To find every mention of "mitochondria" without one, you'd read all 600 pages. With the index, you look up "mitochondria" in a sorted list, see "pages 41, 97, 215", and go straight there. The index is extra pages (it takes space), and every time the author adds a paragraph the index has to be updated (writes get slower). But lookups go from minutes to seconds.

A database index is exactly that: a sorted list of values with pointers to the rows that have them.

## How it works

You need a big table to feel this. Work in `sales` and build one with a million rows using `generate_series` and `random()`:

```sql
CREATE TABLE big_orders AS
SELECT g AS id,
       (random() * 1000)::integer + 1 AS customer_id,
       timestamptz '2025-01-01' + (random() * 600)::integer * interval '1 day' AS ordered_at,
       round((random() * 500)::numeric, 2) AS total
FROM generate_series(1, 1000000) AS g;

ALTER TABLE big_orders ADD PRIMARY KEY (id);
```

A million fake orders, spread over about a thousand customers. It takes a few seconds and about 70 MB (`SELECT pg_size_pretty(pg_total_relation_size('big_orders'));`).

(`CREATE TABLE ... AS SELECT` makes a table from a query's result. Handy for test data and for saving a report's output.)

### Measure first

Turn on timing in psql:

```
\timing on
```

Now every statement prints how long it took. Find one customer's orders:

```sql
SELECT count(*) FROM big_orders WHERE customer_id = 42;
```

```
 count
-------
  1050
(1 row)

Time: 33.627 ms
```

(Your count and time will differ: the data is random and your machine is different.) Thirty-odd milliseconds. Not slow, exactly. But ask PostgreSQL *how* it did it:

```sql
EXPLAIN SELECT * FROM big_orders WHERE customer_id = 42;
```

```
                                   QUERY PLAN
---------------------------------------------------------------------------------
 Gather  (cost=1000.00..13108.33 rows=5000 width=48)
   Workers Planned: 2
   ->  Parallel Seq Scan on big_orders  (cost=0.00..11608.33 rows=2083 width=48)
         Filter: (customer_id = 42)
(4 rows)
```

`EXPLAIN` shows the **plan**: the steps PostgreSQL will take. The key words are **Seq Scan**: a sequential scan, meaning "read every row of the table and check the filter". A million rows checked to find a thousand. (It split the work across workers to go faster, which is why it says Parallel and Gather. [Chapter 32](../32-why-is-my-query-slow/notes.md) reads plans in detail.)

### Add an index

```sql
CREATE INDEX idx_big_orders_customer_id ON big_orders (customer_id);
```

```
CREATE INDEX
Time: 343.969 ms
```

A third of a second to sort a million values. Now the same query:

```sql
SELECT count(*) FROM big_orders WHERE customer_id = 42;
```

```
 count
-------
  1050
(1 row)

Time: 0.961 ms
```

Thirty-five times faster, and the plan shows why:

```sql
EXPLAIN SELECT * FROM big_orders WHERE customer_id = 42;
```

```
                                         QUERY PLAN
---------------------------------------------------------------------------------------------
 Bitmap Heap Scan on big_orders  (cost=59.17..6419.17 rows=5000 width=48)
   Recheck Cond: (customer_id = 42)
   ->  Bitmap Index Scan on idx_big_orders_customer_id  (cost=0.00..57.92 rows=5000 width=0)
         Index Cond: (customer_id = 42)
(4 rows)
```

**Index Scan** instead of Seq Scan. PostgreSQL looked up 42 in the index, got the list of matching rows, and fetched only those. No more checking a million rows. (The "Bitmap" variety is how it fetches a batch of scattered rows efficiently; a plain Index Scan appears when fetching one or a few.)

That's the whole idea. One line, and a query category goes from "reads everything" to "reads what it needs".

### Naming and seeing indexes

Name indexes `idx_table_column` (or `idx_table_col1_col2`). PostgreSQL will invent a name if you don't give one, but yours will be easier to recognize in plans and in `\d`:

```
\d big_orders
```

```
Indexes:
    "big_orders_pkey" PRIMARY KEY, btree (id)
    "idx_big_orders_customer_id" btree (customer_id)
```

`\di` lists all indexes in the database. `btree` is the index type: a balanced tree, the default, right for almost everything (equality, ranges, sorting). Other types exist for special data; chapters 37 and 39 use one called GIN.

### You already have some

`PRIMARY KEY` and `UNIQUE` create indexes automatically. That's how PostgreSQL enforces uniqueness fast, and why `WHERE id = 500000` is instant on any table:

```sql
EXPLAIN SELECT * FROM big_orders WHERE id = 500000;
```

```
 Index Scan using big_orders_pkey on big_orders  (cost=0.42..8.44 rows=1 width=48)
   Index Cond: (id = 500000)
```

**Foreign key columns are not indexed automatically.** Look at `\d order_items` in `sales`: the primary key covers `(order_id, product_id)`, so lookups by `order_id` are indexed (it's the first column), but lookups by `product_id` are not. "Which orders contain this product?" would scan the table. In a real system, **index every foreign key column** unless you have a reason not to. It's the most common missing index.

### What indexes help with

An index on a column speeds up:

- `WHERE column = value` and `WHERE column IN (...)`
- `WHERE column BETWEEN a AND b`, `<`, `>` (ranges)
- `JOIN ... ON column = other` (joins look things up too)
- `ORDER BY column` (the index is already sorted, so `ORDER BY ... LIMIT 10` can read just 10 entries)

It does **not** help with:

- `WHERE lower(email) = ...` or any function or arithmetic on the column. The index holds `email`, not `lower(email)`. Watch:

  ```sql
  EXPLAIN SELECT * FROM big_orders WHERE customer_id + 0 = 42;
  ```

  Back to `Parallel Seq Scan`. The `+ 0` does nothing mathematically and completely defeats the index. Keep the indexed column bare on one side of the comparison, or make an expression index (below).

- `WHERE text_column LIKE '%word%'`. A leading `%` means "anything first", which a sorted list can't help with. Chapter 39 has the fix.
- Queries that match most of the table. If a condition matches 80% of rows, reading them all is faster than hopping around via the index, and PostgreSQL will choose a Seq Scan on purpose. That's not a bug.

### Indexes on more than one column

```sql
CREATE INDEX idx_big_orders_customer_date ON big_orders (customer_id, ordered_at);
```

This index is sorted by `customer_id`, then by `ordered_at` within each customer, like a phone book sorted by surname then first name. It helps queries on `customer_id` alone, and on `customer_id` **and** `ordered_at` together:

```sql
EXPLAIN SELECT * FROM big_orders WHERE customer_id = 42 AND ordered_at >= '2026-01-01';
-- Bitmap Index Scan on idx_big_orders_customer_date
```

But **not** on `ordered_at` alone:

```sql
EXPLAIN SELECT * FROM big_orders WHERE ordered_at >= '2026-06-01' AND ordered_at < '2026-06-02';
-- Parallel Seq Scan
```

You can't find everyone named "Asha" in a phone book sorted by surname. **Column order matters**: put the column you always filter on first, the one you sometimes add second.

### Partial indexes

Index only the rows you'll actually look up:

```sql
CREATE INDEX idx_orders_pending ON orders (ordered_at) WHERE status = 'pending';
```

A tiny index containing only pending orders. "Show me pending orders, oldest first" flies, and the index doesn't grow with the millions of shipped orders nobody queries that way. Great for "active", "unprocessed", "unread" style flags.

### Expression indexes

If you always search `lower(email)`, index that:

```sql
CREATE INDEX idx_customers_lower_email ON customers (lower(email));
```

Now `WHERE lower(email) = 'asha@example.com'` *can* use an index, because the index holds the lowered values. (On the 6-row `customers` table PostgreSQL will still choose a Seq Scan, because reading 6 rows is faster than opening an index. It'd matter at 60,000.)

### Unique indexes

`CREATE UNIQUE INDEX` is a constraint and an index in one, and it works on expressions, which plain `UNIQUE` can't:

```sql
CREATE UNIQUE INDEX idx_customers_email_unique ON customers (lower(email));
INSERT INTO customers (name, email, city, joined_on) VALUES ('Dup', 'ASHA@example.com', 'X', current_date);
```

```
ERROR:  duplicate key value violates unique constraint "idx_customers_email_unique"
DETAIL:  Key (lower(email))=(asha@example.com) already exists.
```

Case-insensitive unique emails, the problem chapter 13 left open, solved in one line.

### The cost

Indexes aren't free:

- **Space.** The index on `customer_id` is about 7 MB next to a 50 MB table. Each index is a copy of one or more columns.
- **Slower writes.** Every `INSERT`, `UPDATE` of an indexed column, or `DELETE` must update every index on the table too. A table with eight indexes writes much slower than one with two.
- **Maintenance.** Indexes that nobody uses are pure cost. PostgreSQL tracks index usage (`pg_stat_user_indexes`), and it's worth checking occasionally.

The rule: **index the columns your queries filter, join, and sort on. Don't index everything.** A table with a primary key, indexes on its foreign keys, and one or two for its hot queries is typical.

Removing one is easy:

```sql
DROP INDEX idx_big_orders_customer_date;
```

### Keep the statistics fresh

PostgreSQL decides whether to use an index based on statistics about your data (how many rows, how many distinct values). It updates them automatically in the background, but after you load a lot of data at once, give it a nudge:

```sql
ANALYZE big_orders;
```

If a plan looks wrong after a big import, `ANALYZE` first.

Clean up when you're done with this chapter and the next:

```sql
DROP TABLE big_orders;
```

## Common mistakes

**1. No indexes on foreign keys**

Joins and "find children of this parent" scan the table. Index them.

**2. A function on the indexed column**

`WHERE lower(email) = ...`, `WHERE date(ordered_at) = ...`, `WHERE price * 1.2 > 100`. The index can't help. Rewrite the condition (`ordered_at >= '...' AND ordered_at < '...'`) or make an expression index.

**3. Indexing everything**

Slow writes, wasted disk, no benefit. Index what you query.

**4. Wrong column order in a multi-column index**

`(ordered_at, customer_id)` doesn't help `WHERE customer_id = 42`. Lead with the column you always filter on.

**5. Judging on a tiny table**

PostgreSQL ignores indexes on tables with a few hundred rows, correctly. Test on realistic data sizes.

**6. Expecting `LIKE '%text%'` to use an index**

It can't. Chapter 39.

## Quick recap

- An index is a sorted copy of a column with pointers to rows. `CREATE INDEX idx_table_col ON table (col);`
- It turns a **Seq Scan** (read everything) into an **Index Scan** (read what matches). On big tables, that's 10 to 1000 times faster.
- Primary keys and `UNIQUE` are indexed automatically. **Foreign keys are not**: add them.
- Indexes help `WHERE =`, ranges, joins, and `ORDER BY` on the column. They don't help functions on the column or `LIKE '%...'`.
- Multi-column indexes work left to right. Partial indexes cover a subset. Expression indexes cover `lower(email)` and friends. Unique indexes enforce uniqueness on expressions.
- Every index costs space and slows writes. Index what you query, and `ANALYZE` after big loads.

---

**Next:** try the [exercises](exercises.md), then move on to [32 Why Is My Query Slow?](../32-why-is-my-query-slow/notes.md).
