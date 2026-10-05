# 20 Counting and Totals: Exercises

**How to do these:**

- Work in psql, connected to `sales` (set up in the notes, from the [chapter 29 seed file](../29-project-sales-report/starter/seed.sql)).
- Run `\pset null '[NULL]'` first.
- Save each answer in `playground/ch20/ex1.sql`, `ex2.sql`, and so on. Give every aggregate a name with `AS`.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your work.

---

## Exercise 1 (Easy): Three counts

Write three queries:

1. How many customers are there?
2. How many products are active?
3. How many orders have actually been shipped? (Use the `shipped_at` column, not `status`.)

Expected answers: `6`, `10`, `7`.

<details>
<summary>Hint</summary>

Number 3 is `count(column)`, not `count(*)`. Why does that work here?

</details>

---

## Exercise 2 (Easy): The product shelf

In **one** query on `products`, show:

- the total number of units in stock,
- the cheapest and most expensive price,
- the average price, rounded to 2 decimal places.

Expected output:

```
 units_in_stock | cheapest | priciest | avg_price
----------------+----------+----------+-----------
           1249 |     1.20 |   149.00 |     27.44
(1 row)
```

---

## Exercise 3 (Medium): Receipt totals

For order **8**, show how many lines it has, how many units in total, and the order total. Then do the same for order **11**.

Expected output for order 8:

```
 lines | units | total
-------+-------+--------
     2 |     2 | 173.99
(1 row)
```

For order 11 you should get 2 lines, 22 units, `29.50`.

<details>
<summary>Hint</summary>

A "line" is a row in `order_items`. "Units" is the sum of `quantity`. The total is the sum of `quantity * unit_price`.

</details>

---

## Exercise 4 (Medium): Distinct things

1. How many **different** customers have placed at least one order?
2. How many **different** products have ever been sold?
3. Using the answer to question 1 and the total number of customers from Exercise 1, how many customers have **never** ordered? (Work it out by hand for now. Chapter 23 shows how to make the database do it.)

Expected: `5`, `10`, and one customer.

---

## Exercise 5 (Challenge): Real business questions

1. Total revenue **excluding** the cancelled order. First find the cancelled order's id with a `SELECT`, then use it in a `WHERE` on `order_items`. (Chapter 22 will let you do this in one query with a join.) Expected: `664.16`.
2. The average value of a single order line, rounded to 2 places. Expected: `33.77`.
3. The slowest and fastest time from order to shipping. Expected: `2 days 02:40:00` and `1 day 20:30:00`.
4. In one query, using `FILTER`: how many orders are `shipped`, how many are `pending`, and how many in total. Expected: `6`, `2`, `12`.

<details>
<summary>Hint</summary>

For number 3, `shipped_at - ordered_at` is an interval, and `min()` and `max()` work on intervals. Think about whether you need a `WHERE` for the unshipped orders.

</details>
