# 32 Why Is My Query Slow?

## What is it?

`EXPLAIN` shows you the **plan** PostgreSQL will use to run a query: which tables it reads, in what order, how (scan the whole thing or use an index), and how it joins and sorts them. `EXPLAIN ANALYZE` actually runs the query and shows what *really* happened, with timings.

Reading a plan is how you find out *why* a query is slow, instead of guessing.

## Why does it matter?

Someday a page in your app will take four seconds to load, and the database will be the reason. You'll have two choices: add indexes at random and hope, or look at the plan, see "Seq Scan on orders, 2 million rows, filter removed 1,999,990", and know exactly what to do.

The second way takes five minutes. The first can take a week. This chapter is the five-minute version.

## Real-world example

A sat-nav that shows its route before you drive:

| Sat-nav | PostgreSQL |
|---|---|
| "Take the motorway, then exit 12, then the B road" | The plan: scan this, join that, sort |
| Estimated time: 45 minutes | `cost=...` numbers (an estimate, in made-up units) |
| Actual drive: 52 minutes, because of a jam at exit 12 | `EXPLAIN ANALYZE`'s `actual time` |
| "Why did it go the long way?" | Reading the plan to find the slow step |

`EXPLAIN` is the preview. `EXPLAIN ANALYZE` is the drive with a stopwatch.

## How it works

Work in `sales`, with `big_orders` still around from chapter 31 (recreate it if you dropped it) and its index on `customer_id`.

### `EXPLAIN`: the plan

```sql
EXPLAIN SELECT * FROM products WHERE price > 20;
```

```
                         QUERY PLAN
------------------------------------------------------------
 Seq Scan on products  (cost=0.00..18.38 rows=223 width=93)
   Filter: (price > '20'::numeric)
(2 rows)
```

One step: read all of `products`, keep rows where `price > 20`. The numbers in brackets are **estimates**:

- `cost=0.00..18.38`: effort to produce the first row, then all rows, in PostgreSQL's own units. Only useful for comparing plans against each other.
- `rows=223`: how many rows it *expects*. (It guessed 223 for an 11-row table because the statistics are stale; that's normal on tiny tables.)
- `width=93`: average bytes per row.

Nothing ran. `EXPLAIN` only asks the planner what it *would* do.

### `EXPLAIN ANALYZE`: the plan plus reality

```sql
EXPLAIN ANALYZE SELECT * FROM products WHERE price > 20;
```

```
                                               QUERY PLAN
---------------------------------------------------------------------------------------------------------
 Seq Scan on products  (cost=0.00..18.38 rows=223 width=93) (actual time=0.008..0.008 rows=4.00 loops=1)
   Filter: (price > '20'::numeric)
   Rows Removed by Filter: 7
   Buffers: shared hit=1
 Planning Time: 0.023 ms
 Execution Time: 0.012 ms
(6 rows)
```

Now there's a second bracket: **`actual`**. `rows=4.00` really came out (not 223). `Rows Removed by Filter: 7` says how many were read and thrown away. `Execution Time` is the real total.

**`EXPLAIN ANALYZE` runs the query.** For a `SELECT`, that's harmless. For an `UPDATE` or `DELETE`, it really changes data. Wrap those in `BEGIN` ... `ROLLBACK`.

### Reading a plan

Plans are trees, printed with the **innermost steps indented furthest**. Read from the most indented line outwards: that's the order things happen.

```sql
EXPLAIN SELECT o.id, c.name FROM orders o JOIN customers c ON c.id = o.customer_id;
```

```
 Hash Join  (cost=1.14..23.44 rows=970 width=36)
   Hash Cond: (o.customer_id = c.id)
   ->  Seq Scan on orders o  (cost=0.00..19.70 rows=970 width=8)
   ->  Hash  (cost=1.06..1.06 rows=6 width=36)
         ->  Seq Scan on customers c  (cost=0.00..1.06 rows=6 width=36)
```

Bottom up: scan `customers` (6 rows), build a hash table from them (a fast in-memory lookup), scan `orders`, and for each order look up its customer in the hash. That's a **Hash Join**, the usual way to join a big table to a small one.

The node names you'll see most:

| Node | What it does | Good or bad? |
|---|---|---|
| **Seq Scan** | Reads every row of a table | Fine on small tables. Suspicious on big ones with a `Filter`. |
| **Index Scan** | Uses an index to fetch matching rows | Good for a few rows. |
| **Bitmap Index Scan** + **Bitmap Heap Scan** | Uses an index to find many scattered rows, then fetches them in disk order | Good for hundreds to thousands of rows. |
| **Index Only Scan** | Answers from the index alone, never touching the table | Best case. |
| **Hash Join** | Builds a lookup table from one side, probes with the other | Normal for big-to-small joins. |
| **Nested Loop** | For each row on one side, look up the other side | Great when the inner side is indexed and the outer is small. Terrible otherwise. |
| **Merge Join** | Both sides sorted, walked together | Normal for two big sorted inputs. |
| **Sort** | Sorts rows (for `ORDER BY`, `DISTINCT`, merge joins) | Fine for small sets. Expensive on big ones. |
| **HashAggregate / GroupAggregate** | Does the `GROUP BY` | Normal. |
| **Limit** | Stops after N rows | Good, if what's beneath it can stop early. |
| **Gather / Parallel ...** | Work split across CPU cores | Means the table was big enough to bother. |

You don't need to memorize these. You need to spot two things: a **Seq Scan on a big table with a Filter**, and a **Sort over a big input**. Those are where time goes.

### Finding the slow step

A real one. Newest five orders:

```sql
EXPLAIN ANALYZE SELECT * FROM big_orders ORDER BY ordered_at DESC LIMIT 5;
```

```
 Limit  (cost=20232.10..20232.69 rows=5 width=22) (actual time=56.539..59.345 rows=5.00 loops=1)
   ->  Gather Merge  (...)
         ->  Sort  (cost=19232.08..20377.91 rows=458333 width=22) (actual time=52.909..52.910 rows=5.00 loops=3)
               Sort Key: ordered_at DESC
               Sort Method: top-N heapsort  Memory: 25kB
               ->  Parallel Seq Scan on big_orders  (cost=0.00..11619.33 rows=458333 width=22) (actual time=0.196..24.575 rows=366666.67 loops=3)
 Planning Time: 0.073 ms
 Execution Time: 59.400 ms
```

Read from the bottom: scan **all** million rows (24 ms), **sort** them all by date (another 28 ms), then keep 5. Sixty milliseconds to get five rows, because there's no way to find "the newest" without looking at everything. The slow step is the Sort fed by a full scan.

The fix is an index on the sort column, because an index *is* a sorted list:

```sql
CREATE INDEX idx_big_orders_ordered_at ON big_orders (ordered_at);
EXPLAIN ANALYZE SELECT * FROM big_orders ORDER BY ordered_at DESC LIMIT 5;
```

```
 Limit  (cost=0.43..0.64 rows=5 width=22) (actual time=0.030..0.032 rows=5.00 loops=1)
   ->  Index Scan Backward using idx_big_orders_ordered_at on big_orders  (cost=0.43..47180.85 rows=1100000 width=22) (actual time=0.029..0.030 rows=5.00 loops=1)
 Planning Time: 0.218 ms
 Execution Time: 0.041 ms
```

From 59 ms to 0.04 ms: over a thousand times faster. PostgreSQL walked the index backwards from the end, read five entries, and stopped. No scan, no sort. This is the single most common fix in web apps: "latest N things" needs an index on the date column.

### Estimates vs reality

Compare the two `rows=` numbers on each line. In the plan above, the planner estimated `rows=996` for customer 42 and the real answer was `1050`: close, so it made a good decision. When the estimate is wildly off (expects 10, gets 100,000), the planner may pick a plan that's great for 10 rows and awful for 100,000. The fix is usually `ANALYZE table_name` to refresh statistics.

### Buffers: disk or memory?

```sql
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM big_orders WHERE customer_id = 42;
```

```
 Bitmap Heap Scan on big_orders  (...) (actual time=0.188..1.102 rows=1050.00 loops=1)
   Buffers: shared hit=972
   ...
```

`shared hit` means pages found in memory; `read` means fetched from disk, which is far slower. A query that's fast the second time and slow the first is paying for disk reads. Not much to do about it except have enough memory and not read more than you need.

### The checklist

When a query is slow, in this order:

1. **`EXPLAIN ANALYZE` it.** Find the step with the biggest `actual time`.
2. **Seq Scan with a Filter on a big table?** Index the filtered column (chapter 31).
3. **Sort over a big input, feeding a Limit?** Index the `ORDER BY` column.
4. **A function around an indexed column?** `WHERE lower(email) = ...`, `WHERE date(created_at) = ...`. Rewrite as a range (`created_at >= ... AND created_at < ...`) or add an expression index.
5. **`LIKE '%word%'`?** No normal index can help. Chapter 39.
6. **Nested Loop with a Seq Scan inside?** The inner table needs an index on the join column.
7. **Estimates way off?** `ANALYZE` the table.
8. **Selecting columns you don't use?** `SELECT *` on wide rows moves more data than needed. Ask for what you need. (It also lets the planner use Index Only Scans.)
9. **Running the query a thousand times?** See below.

### The N+1 problem

The slowest "query" is often not one query but a thousand small ones. A program fetches 12 orders, then loops and runs `SELECT * FROM order_items WHERE order_id = ?` for each. That's 1 + 12 = 13 round trips to the database. With 10,000 orders it's 10,001. Each is fast; together they take forever.

The database can't fix this; it only sees fast little queries. The fix is in the program: one query with a `JOIN` (or `WHERE order_id IN (...)`) that fetches everything at once. [Chapter 42](../42-orms/notes.md) shows how ORMs make this mistake easy, and how to avoid it.

### Finding slow queries in the first place

In a real system you don't know which query is slow until a user complains. PostgreSQL ships an extension, `pg_stat_statements`, that records every query's total and average time. Turning it on is a configuration change (adding it to `shared_preload_libraries` and restarting), and then `SELECT * FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10` shows your ten worst. Worth knowing exists; you'll meet it again when you run a real server.

Clean up when you're done:

```sql
DROP INDEX idx_big_orders_ordered_at;
DROP TABLE big_orders;
```

## Common mistakes

**1. Guessing instead of explaining**

Adding indexes "to be safe" slows writes and may not touch the real problem. Look first.

**2. Reading the plan top-down**

The first line is the *last* step. Start at the deepest indent.

**3. Panicking about Seq Scans on small tables**

Reading 11 rows directly is faster than any index. Seq Scan on a small table is correct.

**4. `EXPLAIN ANALYZE` on a `DELETE`**

It runs. Use `BEGIN` ... `ROLLBACK`.

**5. Trusting `cost` as time**

Costs are relative units for comparing plans. Only `actual time` is milliseconds.

**6. Fixing one query, forgetting the thousand**

N+1 looks fine in `EXPLAIN` and kills the app. Count the round trips.

## Quick recap

- `EXPLAIN` shows the plan; `EXPLAIN ANALYZE` runs it and shows actual rows and times. Read from the deepest indent outward.
- Spot **Seq Scan + Filter** on big tables and **Sort** over big inputs. Those are the slow steps.
- An index on the filtered column turns Seq Scan into Index Scan. An index on the `ORDER BY` column turns Sort + Limit into a quick Index Scan.
- Functions around indexed columns and `LIKE '%..%'` block index use. Rewrite or use an expression index.
- Compare estimated and actual rows; `ANALYZE` when they disagree badly.
- The N+1 problem lives in the program, not the plan. One join beats a thousand lookups.

---

**Next:** try the [exercises](exercises.md), then move on to [33 Views](../33-views/notes.md).
