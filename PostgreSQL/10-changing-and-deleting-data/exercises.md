# 10 Changing and Deleting Data: Exercises

**How to do these:**

- Work in psql, connected to `practice`. Run `playground/ch06/seed.sql` first so `tasks` and `products` are in their starting state.
- Run `\pset null '[NULL]'`.
- **Do the exercises in order.** Each one changes the data the next one uses.
- For every `UPDATE` and `DELETE`: write the `SELECT` with the same `WHERE` first, look, then change. Save both in your file.
- Save each answer in `playground/ch10/ex1.sql`, `ex2.sql`, and so on.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your work.

---

## Exercise 1 (Easy): Tick it off

You bought the milk. Mark the "Buy milk" task as done. Use `RETURNING` to show the changed row.

Expected output:

```
 id |  title   | is_done |  due_date  | priority
----+----------+---------+------------+----------
  1 | Buy milk | t       | 2026-10-01 |        2
(1 row)

UPDATE 1
```

---

## Exercise 2 (Easy): Sale prices

Everything that's on sale gets **10% added** to its price (the sale is ending). Update the prices in one statement, then show all products sorted by name.

Expected prices afterwards: Desk lamp `27.49`, Backpack `49.50`. The rest unchanged.

<details>
<summary>Hint</summary>

`price * 1.1` gives the new price. The column is `numeric(10, 2)`, so PostgreSQL rounds the result to 2 decimal places when it stores it. That's why 27.489 becomes 27.49.

</details>

---

## Exercise 3 (Medium): Delivery day

A delivery arrives: 200 Sticky notes and 25 Desk lamps.

1. Add 200 to the Sticky notes stock and 25 to the Desk lamp stock. You'll need two statements (or one clever one; two is fine).
2. The sale is over: set `on_sale` to false for **every** product, in one statement. Yes, this one really does mean every row. Say so in a comment above it.
3. Show `name`, `stock`, `on_sale` for all products.

Expected output of step 3 (sorted by name):

```
     name     | stock | on_sale
--------------+-------+---------
 Backpack     |     8 | f
 Desk lamp    |    40 | f
 Notebook     |   120 | f
 Pen          |   500 | f
 Stapler      |    40 | f
 Sticky notes |   200 | f
(6 rows)
```

---

## Exercise 4 (Medium): Clear the done tasks

1. Delete every task that is done. Use `RETURNING title` so you see what went.
2. Insert a new task: `'Book a haircut'`, not done, due `2026-10-10`, priority 3.
3. Show all tasks.

What `id` did the new task get? Write a comment explaining why it isn't 1 or 2, even though those ids are now free.

Expected output of step 3:

```
 id |      title       | is_done |  due_date  | priority
----+------------------+---------+------------+----------
  3 | Call the dentist | f       | 2026-10-05 |        3
  4 | Water the plants | f       | [NULL]     |        3
  5 | Renew passport   | f       | 2026-11-15 |        1
  6 | Book a haircut   | f       | 2026-10-10 |        3
(4 rows)
```

---

## Exercise 5 (Challenge): The seatbelt

1. Start a transaction. Set **every** product's price to `0.00`, on purpose. Run a `SELECT` to see the damage. Then roll back, and run the `SELECT` again to confirm everything is back.

2. Now a real change: the shop has stopped selling Staplers. Inside a transaction, delete the Stapler. Check with `SELECT` that only the Stapler is gone and 5 products remain. If so, commit. If not, roll back and try again.

3. Finally, run this and explain in a comment what went wrong and how you'd fix it. **Don't** "fix" the data, just explain:

```sql
UPDATE products SET stock = 0 WHERE name = 'backpack';
```

<details>
<summary>Hint</summary>

For step 3, look at the row count PostgreSQL replies with. Then look very carefully at the `WHERE`.

</details>
