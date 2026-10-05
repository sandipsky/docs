# 27 Combining Results: Exercises

**How to do these:**

- Work in psql, connected to `sales`. Run `\pset null '[NULL]'`.
- Save each answer in `playground/ch27/ex1.sql`, `ex2.sql`, and so on.
- Before writing each query, say the question as a sentence with "and", "or", or "but not" in it. The sentence tells you which operator.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your work.

---

## Exercise 1 (Easy): One list from two

1. A single list of every product name and every category name, with a `kind` column saying which is which, sorted by kind then name. You should get 15 rows.
2. Create the `newsletter` temp table from the notes. One list of every email address the shop knows about, each once, alphabetical. You should get 7.

---

## Exercise 2 (Easy): `UNION` or `UNION ALL`?

1. Stack `SELECT city FROM customers` on top of itself with `UNION ALL`, then with `UNION`. How many rows each time?
2. In a comment, give a real example (not cities) where `UNION` would quietly throw away a row you needed.
3. Three one-row queries stacked with `UNION ALL` to make a mini summary table with two columns, `what` and `n`: how many orders, customers, and products there are.

Expected output of query 3:

```
   what    | n
-----------+----
 orders    | 12
 customers |  6
 products  | 11
(3 rows)
```

---

## Exercise 3 (Medium): Both, or one but not the other

1. Ids of customers who ordered in **both** July and August. Then wrap it so you get their **names**.
2. Ids of customers who ordered in July but **not** in September. Expected: just customer 2.
3. **Names** of products sold in **both** July and September.

Expected output of query 3:

```
   name
----------
 Backpack
 Notebook
 Pen
(3 rows)
```

<details>
<summary>Hint</summary>

Query 3's parts each need a join from `order_items` to `orders` to get at the date. Wrap the `INTERSECT` in `WHERE id IN (...)` on `products`.

</details>

---

## Exercise 4 (Medium): A report with a total

1. Orders per status, with a `TOTAL` row at the bottom, in that order. Use a sort key column.
2. Now hide the sort key: put the whole thing in a CTE and select only `status` and `orders` from it, still sorted correctly.
3. A **Furniture** price list with a `Subtotal` row: category, item, amount. Two products then the subtotal.

Expected output of query 3:

```
 category  |     item     | amount
-----------+--------------+--------
 Furniture | Desk lamp    |  24.99
 Furniture | Office chair | 149.00
 Furniture | Subtotal     | 173.99
(3 rows)
```

<details>
<summary>Hint</summary>

Query 2: `WITH report AS (...the UNION ALL with sort_key...) SELECT status, orders FROM report ORDER BY sort_key, status;`. `ORDER BY` can use a column you don't show.

</details>

---

## Exercise 5 (Challenge): Harder set questions

1. **Names** of products that were sold in **August but not in July**. Expected four: Laptop sleeve, Sticky notes, USB hub, Wireless mouse.
2. The **name** of the one customer who placed an order in every one of the three months.
3. Write "products never sold" three ways: with `EXCEPT`, with `NOT EXISTS`, and with `LEFT JOIN ... IS NULL`. All three must return the Whiteboard marker. Then write a comment on which you find most readable and why.

<details>
<summary>Hint</summary>

Query 2 is two `INTERSECT`s chained, wrapped in `WHERE id IN (...)`.

</details>
