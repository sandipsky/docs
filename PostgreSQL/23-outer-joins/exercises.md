# 23 Outer Joins: Exercises

**How to do these:**

- Work in psql, connected to `sales`. Run `\pset null '[NULL]'`.
- Save each answer in `playground/ch23/ex1.sql`, `ex2.sql`, and so on.
- For each exercise, decide **which table is the one you want to keep**, and start your `FROM` with it.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your work.

---

## Exercise 1 (Easy): What's missing

1. Which customers have never placed an order? Name and email.
2. Which products have never been sold? Name and SKU.

Expected output of query 2:

```
       name        |   sku
-------------------+---------
 Whiteboard marker | STA-005
(1 row)
```

---

## Exercise 2 (Easy): Counting with zeroes

1. Orders per customer, **including** customers with none, alphabetical by name.
2. Run it again with `count(*)` instead. Which number changes, and why? Write the answer as a comment.

Expected output of query 1:

```
      name       | orders
-----------------+--------
 Asha Rai        |      4
 Bikram Shrestha |      2
 Chandra Gurung  |      2
 Dipesh Thapa    |      2
 Elina Maharjan  |      0
 Farhan Ali      |      2
(6 rows)
```

---

## Exercise 3 (Medium): Complete tables

1. Units sold per product, **every** product listed, zero for unsold ones. Most units first, then by name.
2. Add a category called `'Books'` (no products in it). Then list every category with its product count, including Books with 0. Afterwards, delete the Books category so the dataset is back to normal.
3. Each customer's **last order date**, including customers who have none (they should show `[NULL]` at the bottom). Most recent first.

Expected output of query 3:

```
      name       | last_order
-----------------+------------
 Asha Rai        | 2026-09-26
 Farhan Ali      | 2026-09-19
 Dipesh Thapa    | 2026-09-11
 Chandra Gurung  | 2026-09-04
 Bikram Shrestha | 2026-08-09
 Elina Maharjan  | [NULL]
(6 rows)
```

<details>
<summary>Hint</summary>

Query 3: `max(o.ordered_at)::date`, and `ORDER BY last_order DESC NULLS LAST`.

</details>

---

## Exercise 4 (Medium): `ON` or `WHERE`?

1. Every customer with their **pending** orders, keeping customers who have none. Elina, Bikram, Chandra, and Dipesh should all appear with NULL.
2. Now: which customers have **no** pending orders? Names only, alphabetical. You should get four.
3. Write the "wrong" version of query 1, with the status condition in `WHERE`, and explain in a comment what happened to the rows.

Expected output of query 2:

```
      name
-----------------
 Bikram Shrestha
 Chandra Gurung
 Dipesh Thapa
 Elina Maharjan
(4 rows)
```

<details>
<summary>Hint</summary>

Query 2 combines both tricks: the status condition goes in the `ON` (so customers with no pending orders survive), and then `WHERE o.id IS NULL` keeps only those.

</details>

---

## Exercise 5 (Challenge): Two lists, and a chain

1. Create the `newsletter` table from the notes. Write a `FULL JOIN` that shows **only** the mismatches: customers not subscribed, and subscribers who aren't customers. You should get five rows.
2. Spending per customer, **including** Elina with `0`, counting every order (cancelled too). Name, order count, total spent. Think carefully: this chains `customers` → `orders` → `order_items`, and the order count must be right.

Expected output of query 2:

```
      name       | orders | spent
-----------------+--------+--------
 Asha Rai        |      4 | 263.19
 Chandra Gurung  |      2 | 239.00
 Dipesh Thapa    |      2 |  86.23
 Farhan Ali      |      2 |  64.75
 Bikram Shrestha |      2 |  55.99
 Elina Maharjan  |      0 |   0.00
(6 rows)
```

<details>
<summary>Hint 1</summary>

Query 1: `WHERE c.id IS NULL OR n.email IS NULL`.

</details>

<details>
<summary>Hint 2</summary>

Query 2: both joins must be `LEFT JOIN`, the count must be `count(DISTINCT o.id)` (chapter 22's trap), and the sum needs `coalesce(..., 0)`. For the `0.00` formatting, `coalesce(sum(...), 0.00)` or a cast to `numeric(10, 2)` both work.

</details>
