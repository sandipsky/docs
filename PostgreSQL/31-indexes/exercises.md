# 31 Indexes: Exercises

**How to do these:**

- Work in psql, connected to `sales`, with `big_orders` from the notes. Run `\timing on`.
- Save each answer in `playground/ch31/ex1.sql`, `ex2.sql`, and so on, and write the timings and plan node names you observed as comments. Your exact numbers will differ from anyone else's; the *pattern* is what matters.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your work.

---

## Exercise 1 (Easy): Before and after

1. Drop the `idx_big_orders_customer_id` index if it exists. Time `SELECT count(*) FROM big_orders WHERE customer_id = 7;` twice (the second run is fairer: the first includes reading from disk).
2. `EXPLAIN` the same query. Write down the scan type.
3. Create the index. Time the query twice more, and `EXPLAIN` it again.
4. In a comment: how many times faster was it, and what changed in the plan?

---

## Exercise 2 (Easy): Sizes and lists

1. Show the table's size and the index's size side by side with `pg_size_pretty(pg_relation_size(...))`.
2. List all indexes in the database with `\di`.
3. Run `\d order_items` in `sales` and answer in a comment: which lookups on this table are indexed, and which foreign key column isn't? Write the `CREATE INDEX` that would fix it (and run it).

---

## Exercise 3 (Medium): Column order

1. Create `idx_big_orders_customer_date ON big_orders (customer_id, ordered_at)`.
2. `EXPLAIN` three queries: filter on `customer_id` only; on `customer_id` and `ordered_at`; on `ordered_at` only. Which use the index?
3. Drop it and create the reverse, `(ordered_at, customer_id)`. Run the same three `EXPLAIN`s. What changed?
4. In a comment: the shop's most common query is "this customer's orders, newest first". Which column order is right, and why?

<details>
<summary>Hint</summary>

Think about the phone book. A query can use the index when it filters on the **first** column (and optionally more). It can't skip the first column.

</details>

---

## Exercise 4 (Medium): Case-insensitive uniqueness

1. On the real `customers` table, create a **unique expression index** on `lower(email)`.
2. Try to insert a customer with email `'BIKRAM@example.com'`. It must fail. Copy the error.
3. Try to insert one with `'bikram.s@example.com'`. It must succeed. Then delete it again.
4. In a comment: why couldn't a plain `UNIQUE (email)` constraint from chapter 13 do this?

---

## Exercise 5 (Challenge): The price of writing

1. Create a fresh copy: `CREATE TABLE big_copy AS SELECT * FROM big_orders;` (no indexes at all). Time an insert of 100,000 new rows from `generate_series`.
2. Add four indexes to `big_copy` (on `customer_id`, `ordered_at`, `total`, and `(customer_id, ordered_at)`). Time the same insert again.
3. Create a partial index on `big_copy (ordered_at) WHERE total > 490`, and `EXPLAIN SELECT * FROM big_copy WHERE total > 495 ORDER BY ordered_at LIMIT 10;`. Does it use the partial index? What about `WHERE total > 100`?
4. Drop `big_copy`. In a comment: write the rule of thumb you'd give a teammate about how many indexes a table should have.

<details>
<summary>Hint</summary>

For the insert: `INSERT INTO big_copy SELECT g, 5, now(), 1 FROM generate_series(2000001, 2100000) g;`. Step 3's second query asks for a range the partial index doesn't cover (`total > 100` includes rows with total ≤ 490), so PostgreSQL can't use it.

</details>
