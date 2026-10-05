# 32 Why Is My Query Slow?: Exercises

**How to do these:**

- Work in psql, connected to `sales`, with `big_orders` (chapter 31) and its `customer_id` index.
- Save each answer in `playground/ch32/ex1.sql`, `ex2.sql`, and so on. Paste the relevant plan lines as comments, and note the `Execution Time` before and after each fix.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your work.

---

## Exercise 1 (Easy): Read the plan

Run `EXPLAIN ANALYZE` on these and, for each, write down: the node type at the deepest indent, the estimated vs actual rows on that line, and the total execution time.

```sql
SELECT * FROM customers WHERE city = 'Pokhara';
SELECT * FROM big_orders WHERE id = 123456;
SELECT * FROM big_orders WHERE customer_id = 123;
SELECT count(*) FROM big_orders WHERE total > 499;
```

Which of the four reads the whole table? Is that a problem for each one? Say why or why not.

---

## Exercise 2 (Easy): The newest N

1. `EXPLAIN ANALYZE SELECT * FROM big_orders ORDER BY total DESC LIMIT 10;`. Find the Sort and note the time.
2. Add the index that fixes it. Run again. How many times faster?
3. Now `EXPLAIN ANALYZE SELECT * FROM big_orders ORDER BY total DESC, id LIMIT 10;` (a tie-breaker added). Does your index still help fully? What index would?

<details>
<summary>Hint</summary>

Step 3: a sort on two columns wants an index on both, in that order: `(total DESC, id)`. An index can be declared with a direction.

</details>

---

## Exercise 3 (Medium): The function trap

A developer wrote these to find a customer's orders on a given day:

```sql
EXPLAIN ANALYZE SELECT * FROM big_orders WHERE customer_id = 42 AND date(ordered_at) = '2026-03-15';
```

1. Does it use the `customer_id` index? Does it use anything for the date? What does the plan have to do with the 1000-odd rows for customer 42?
2. Rewrite the date condition as a **range** on `ordered_at` (from midnight to midnight) and compare plans.
3. Create a two-column index `(customer_id, ordered_at)`. Run the range version again. Describe the plan.
4. In a comment: why does the `date(...)` version block the index even after step 3?

---

## Exercise 4 (Medium): Joins big and small

1. Create a `big_customers` table with 1001 rows: `CREATE TABLE big_customers AS SELECT g AS id, 'Customer ' || g AS name FROM generate_series(1, 1001) g;` (no primary key yet).
2. `EXPLAIN ANALYZE` a join of `big_orders` to `big_customers` on `customer_id = id`, filtered to `big_orders.customer_id BETWEEN 1 AND 3`, returning order id and customer name. Note the join type and time.
3. Add a primary key to `big_customers`. Run again. Did the plan change?
4. Drop `big_customers`. In a comment: explain why indexing the **small** table's join column mattered here.

<details>
<summary>Hint</summary>

Without an index on `big_customers.id`, each matching order (a few thousand) may trigger a scan of the 1001-row table, or PostgreSQL builds a hash of it. With the primary key, it can look each one up directly. Compare the inner node.

</details>

---

## Exercise 5 (Challenge): The N+1 problem, measured

1. Write a `.sql` file that does the N+1 version by hand for the real `sales` tables: one `SELECT id FROM orders;` followed by **twelve** separate `SELECT * FROM order_items WHERE order_id = N;` statements. Run it with `\timing on` and add up the times.
2. Write the one-query version with a `JOIN`. Time it.
3. In a comment: the twelve small queries each took well under a millisecond. Explain to a teammate why the N+1 pattern is still a serious problem in a web app with 10,000 orders. Mention round trips.
4. Drop `big_orders` and any indexes you made. You're done with it.
