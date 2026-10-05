# 22 Joins: Exercises

**How to do these:**

- Work in psql, connected to `sales`. Run `\pset null '[NULL]'`.
- Save each answer in `playground/ch22/ex1.sql`, `ex2.sql`, and so on. Use table aliases and prefix every column.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your work.

---

## Exercise 1 (Easy): Names instead of ids

1. Every order with its customer's name and status, in order id order.
2. Every product with its category name and price, sorted by category then product name.
3. Every order placed by a customer from **Pokhara**: order id, customer name, order date (as a date).

Expected output of query 3:

```
 id |      name       | ordered_at
----+-----------------+------------
  2 | Bikram Shrestha | 2026-07-10
  6 | Bikram Shrestha | 2026-08-09
  7 | Farhan Ali      | 2026-08-15
 11 | Farhan Ali      | 2026-09-19
(4 rows)
```

---

## Exercise 2 (Easy): A receipt

Show the lines of order **8**: product name, quantity, unit price, and line total.

Expected output:

```
     name     | quantity | unit_price | line_total
--------------+----------+------------+------------
 Desk lamp    |        1 |      24.99 |      24.99
 Office chair |        1 |     149.00 |     149.00
(2 rows)
```

---

## Exercise 3 (Medium): Reports across tables

1. For each category (by **name**), the number of products and the average price, most expensive category first.
2. Total units sold per category name, most units first. Include every order, cancelled or not.
3. Each customer's spending, **excluding** cancelled orders: name, number of orders, total spent. Highest spender first. Make sure the order count is right (reread the trap in the notes).

Expected output of query 3:

```
      name       | orders | spent
-----------------+--------+--------
 Chandra Gurung  |      2 | 239.00
 Asha Rai        |      3 | 218.19
 Dipesh Thapa    |      2 |  86.23
 Farhan Ali      |      2 |  64.75
 Bikram Shrestha |      2 |  55.99
(5 rows)
```

<details>
<summary>Hint</summary>

Query 2: `order_items` → `products` → `categories`. Query 3: `customers` → `orders` → `order_items`, with `count(DISTINCT o.id)`.

</details>

---

## Exercise 4 (Medium): Questions with a `WHERE`

1. Which **distinct** products were sold in September 2026? Names only, alphabetical.
2. Which customers have bought an **Office chair**? Names only, each once.
3. All active Stationery products, cheapest first. (Filter on the category's name, show the product's name and price.)

Expected output of query 2:

```
      name
----------------
 Asha Rai
 Chandra Gurung
(2 rows)
```

<details>
<summary>Hint</summary>

Query 1: `ordered_at >= '2026-09-01'` is enough, since nothing is later than September. In real data you'd add `AND ordered_at < '2026-10-01'`.

</details>

---

## Exercise 5 (Challenge): Receipts, all at once

1. One row per order showing: order id, customer name, status, and the order **total**. In order id order. (This is the chapter 21 totals query, plus a join. Think about what goes in `GROUP BY`.)
2. Build the `employees` table from the notes, and add a row for `'Ram Lama'` whose manager is Asha Thapa. Then write a self-join showing each employee next to their manager **and their manager's manager**. Ram's row should read `Ram Lama | Asha Thapa | Dev Shrestha`.

Expected first rows of query 1:

```
 id |      name       |  status   | total
----+-----------------+-----------+--------
  1 | Asha Rai        | paid      |  13.00
  2 | Bikram Shrestha | shipped   |  32.99
  3 | Chandra Gurung  | shipped   | 149.00
 ...
(12 rows)
```

<details>
<summary>Hint 1</summary>

Query 1: every non-aggregated column in `SELECT` must be in `GROUP BY`: `GROUP BY o.id, c.name, o.status`.

</details>

<details>
<summary>Hint 2</summary>

Query 2 joins `employees` to itself **twice**, with three aliases: `e`, `m`, and `mm`. The second `ON` matches `mm.id = m.manager_id`. Employees without a manager's manager will vanish; that's expected for an inner join.

</details>
