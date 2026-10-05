# 33 Views: Exercises

**How to do these:**

- Work in psql, connected to `sales`. Run `\pset null '[NULL]'`.
- Save each answer in `playground/ch33/ex1.sql`, `ex2.sql`, and so on. Start files with `DROP VIEW IF EXISTS ...` so they're re-runnable.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your work.

---

## Exercise 1 (Easy): The three views every report needs

Create these three views, then prove each works with a short `SELECT`:

1. `live_orders`: all columns of `orders` where status isn't cancelled.
2. `order_totals`: one row per order with `order_id`, `customer_id`, `ordered_at`, `status`, `total` (as in the notes).
3. `order_details`: one row per order **line** with order id, order date, customer name, product name, category name, quantity, unit price, and line total. Every join from Level 3 in one place.

Then write "revenue per category, live orders only" as a `SELECT` from `order_details`. It should be about four lines.

---

## Exercise 2 (Easy): Hiding things

1. Create `customer_directory` showing each customer's id, name, and city but **not** email or join date.
2. Try to `UPDATE customer_directory SET city = 'Bhaktapur' WHERE id = 5;` inside a transaction, then roll back. Did it work? Why?
3. Create `public_products` (active products, no stock or SKU). Try `UPDATE public_products SET stock = 0 WHERE id = 1;`. What happens, and why is that good?

---

## Exercise 3 (Medium): Rewrite the report

Take **three** sections of your chapter 29 `report.sql` (headline numbers, monthly trend, per-customer spending) and rewrite them to use `order_totals` and `live_orders` (or `order_details`) instead of their CTEs. They must produce exactly the same numbers as before.

In a comment: which version is easier to read? What's one disadvantage of the view version?

---

## Exercise 4 (Medium): Dependencies

1. Create a view `customer_spending` on top of `order_totals` (as in the notes).
2. Try to drop `order_totals`. Copy the error.
3. Try to rename `orders.status` to `state` with `ALTER TABLE`. Copy the error.
4. Try to add a column to `order_totals` with `CREATE OR REPLACE` (say, `count(*) AS lines`). Does it work? Now try to remove `status` from it the same way. Does that?
5. In a comment: explain to a teammate what they need to check before changing a table in a database that has views.

---

## Exercise 5 (Challenge): A dashboard that refreshes

1. Create a **materialized view** `dashboard` with one row: live order count, live revenue, average order value, and `now()` as `refreshed_at`.
2. Select from it. Note `refreshed_at`.
3. Inside a transaction, add an order with one item worth 50.00, select from `dashboard` (unchanged), refresh it, select again (changed), then roll back and refresh once more.
4. Create a plain view `dashboard_live` with the same query (no `refreshed_at`). Select from both after an insert-and-rollback. In a comment: when would you choose each one?
5. Add an index to the materialized view on `refreshed_at`. (Yes, you can.) Then drop everything you made in this exercise.

<details>
<summary>Hint</summary>

Materialized views can't be refreshed inside the same transaction in a way that others see until commit, but within your own session the refreshed data is visible, which is enough for this experiment. `CREATE INDEX ON dashboard (refreshed_at);` works like on a table.

</details>
