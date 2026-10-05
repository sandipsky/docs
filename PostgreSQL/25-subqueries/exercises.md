# 25 Subqueries: Exercises

**How to do these:**

- Work in psql, connected to `sales`. Run `\pset null '[NULL]'`.
- Save each answer in `playground/ch25/ex1.sql`, `ex2.sql`, and so on.
- Any exercise that changes data must be wrapped in `BEGIN;` ... `ROLLBACK;`, so the dataset stays the same for the next chapters.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your work.

---

## Exercise 1 (Easy): Compared to the average

1. Products that cost **less** than the average product price, cheapest first.
2. Orders whose total is **above the average order total**. Show order id and total, biggest first. (Total each order in a derived table, then compare against the average of another derived table.)

Expected output of query 2:

```
 order_id | total
----------+--------
        8 | 173.99
        3 | 149.00
        9 |  90.00
(3 rows)
```

<details>
<summary>Hint</summary>

Query 2 needs the "totals per order" query twice: once as the table you select from, once inside `avg()` in a scalar subquery. Chapter 26 will show how to write it once.

</details>

---

## Exercise 2 (Easy): `IN` and `NOT IN`

1. Names of customers who have at least one **shipped** order.
2. Names of products that have appeared in a **cancelled** order.
3. Names of customers who have bought anything from the **Stationery** category. (The inner query will need a join.)

Expected output of query 3:

```
      name
-----------------
 Asha Rai
 Bikram Shrestha
 Dipesh Thapa
 Farhan Ali
(4 rows)
```

---

## Exercise 3 (Medium): `EXISTS` and `NOT EXISTS`

1. Rewrite "customers who have never ordered" with `NOT EXISTS`.
2. Customers for whom **every** order has shipped. (They must have at least one order, and no order that isn't shipped.) Expected: Bikram Shrestha and Chandra Gurung.
3. In a comment: why is `NOT EXISTS` safer than `NOT IN` for question 1, even though both give the same answer here?

<details>
<summary>Hint</summary>

Question 2 is two conditions: `EXISTS (some order for this customer)` AND `NOT EXISTS (an order for this customer whose status <> 'shipped')`.

</details>

---

## Exercise 4 (Medium): Correlated

1. Each product with its price and its **category's average price**, in one query, no join.
2. Only the products priced **above** their own category's average.
3. Each customer's name and their **number of orders**, using a correlated scalar subquery in the `SELECT` (not a `GROUP BY`). Elina should show `0`.

Expected output of query 2:

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

<details>
<summary>Hint</summary>

Query 3: `(SELECT count(*) FROM orders o WHERE o.customer_id = c.id) AS orders`. `count(*)` of nothing is 0, which is why Elina doesn't need a `coalesce`.

</details>

---

## Exercise 5 (Challenge): Subqueries that change data

All inside `BEGIN;` ... `ROLLBACK;`.

1. Add a line to order 12: 4 Pens, with the unit price **looked up** from `products`, not typed. Use `RETURNING *`.
2. Deactivate every product that has never been sold, with `RETURNING name`.
3. Delete every order item belonging to a **cancelled** order, with `RETURNING *`. How many rows, and what was their value? (Use a nested `IN`: items whose `order_id` is in the list of cancelled order ids.)
4. Check with `SELECT count(*) FROM order_items;` that you still have 21 rows after the `ROLLBACK`.

<details>
<summary>Hint</summary>

Query 3: `WHERE order_id IN (SELECT id FROM orders WHERE status = 'cancelled')`. One row, worth 45.00.

</details>
