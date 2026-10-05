# 22 Joins

## What is it?

A **join** combines rows from two tables into one result, matching them up by a shared value. Usually that value is a foreign key on one side and a primary key on the other: `orders.customer_id` matches `customers.id`.

You've seen a sneak peek twice already (chapters 16 and 17). Now it gets its proper chapter.

## Why does it matter?

Level 2 taught you to split data into tables so each fact lives once. The cost is that the data you want to *see* is spread out: the order has a `customer_id`, but the name is in another table. Joins pay that cost back. They let you store data in the clean, normalized way and still read it as one combined picture, whenever you need to.

Every real report is a join. "Revenue per category" needs `order_items`, `products`, and `categories`. "Orders with customer names" needs `orders` and `customers`. If `GROUP BY` is the most-written clause in reporting, `JOIN` is a close second.

## Real-world example

Two filing cabinets in an office: one with customer cards (numbered), one with order forms, each form showing only a customer number. A new clerk asked for "orders with the customer's name on them" would:

1. Take an order form.
2. Read the customer number.
3. Find the card with that number.
4. Write the name onto a combined sheet.
5. Repeat for every form.

That's a join. The "customer number on the form matches the number on the card" rule is the `ON` clause.

## How it works

Work in `sales`, with `\pset null '[NULL]'`.

### The basic join

```sql
SELECT orders.id, customers.name, orders.status
FROM orders
JOIN customers ON customers.id = orders.customer_id
ORDER BY orders.id;
```

```
 id |      name       |  status
----+-----------------+-----------
  1 | Asha Rai        | paid
  2 | Bikram Shrestha | shipped
  3 | Chandra Gurung  | shipped
  4 | Asha Rai        | cancelled
  5 | Dipesh Thapa    | shipped
  ...
(12 rows)
```

Read it as: "from `orders`, join in `customers`, matching each order to the customer whose `id` equals the order's `customer_id`." Twelve orders in, twelve rows out, each now carrying a name.

Columns are written as `table.column`, because both tables have an `id` and PostgreSQL needs to know which one you mean.

### Table aliases

Typing `customers.` and `orders.` everywhere gets old. Give each table a short nickname right after its name:

```sql
SELECT o.id, c.name, o.status
FROM orders o
JOIN customers c ON c.id = o.customer_id
ORDER BY o.id;
```

Same result. `o` means `orders`, `c` means `customers`, for this query only. Almost everyone writes joins this way. Pick aliases that are obvious: first letter, or a short abbreviation (`oi` for `order_items`).

### Ambiguous columns

```sql
SELECT id, name FROM orders JOIN customers ON customers.id = orders.customer_id;
```

```
ERROR:  column reference "id" is ambiguous
```

Both tables have an `id`. Which one? Always prefix columns in a join, even when only one table has that column. It's clearer, and it won't break when someone adds a column later.

### Products with their category names

The query chapter 21 couldn't write:

```sql
SELECT p.name, c.name AS category, p.price
FROM products p
JOIN categories c ON c.id = p.category_id
ORDER BY c.name, p.name;
```

```
       name        |  category   | price
-------------------+-------------+--------
 Backpack          | Bags        |  45.00
 Laptop sleeve     | Bags        |  19.50
 USB hub           | Electronics |  29.99
 Wireless mouse    | Electronics |  15.75
 Desk lamp         | Furniture   |  24.99
 Office chair      | Furniture   | 149.00
 Notebook          | Stationery  |   3.90
 ...
(11 rows)
```

Both tables have a `name`, so the category's gets an alias. Same pattern as before: foreign key on one side, primary key on the other.

### Three tables

A line on a receipt needs the item, the order, and the product. Chain the joins:

```sql
SELECT o.id AS order_id, p.name AS product, oi.quantity, oi.unit_price,
       oi.quantity * oi.unit_price AS line_total
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
JOIN products p ON p.id = oi.product_id
WHERE o.id = 5
ORDER BY p.name;
```

```
 order_id |    product     | quantity | unit_price | line_total
----------+----------------+----------+------------+------------
        5 | Notebook       |        3 |       3.50 |      10.50
        5 | USB hub        |        1 |      29.99 |      29.99
        5 | Wireless mouse |        1 |      15.75 |      15.75
(3 rows)
```

Each `JOIN ... ON` adds one table. Start from the table in the middle (`order_items`, which has foreign keys to both) and reach out. The `WHERE` and `ORDER BY` can use columns from any joined table.

### Four tables

Everything Asha has ever bought:

```sql
SELECT o.id AS order_id, c.name AS customer, p.name AS product, oi.quantity
FROM orders o
JOIN customers c ON c.id = o.customer_id
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE c.name = 'Asha Rai'
ORDER BY o.id, p.name;
```

```
 order_id | customer |    product    | quantity
----------+----------+---------------+----------
        1 | Asha Rai | Notebook      |        2
        1 | Asha Rai | Pen           |        5
        4 | Asha Rai | Backpack      |        1
        8 | Asha Rai | Desk lamp     |        1
        8 | Asha Rai | Office chair  |        1
       12 | Asha Rai | Laptop sleeve |        1
       12 | Asha Rai | Notebook      |        3
(7 rows)
```

Four tables, three `ON` clauses, each one following a foreign key. Draw the tables and arrows from chapter 18 and the joins write themselves: every arrow is an `ON`.

### Joins and `GROUP BY` together

This is where Level 3 comes together. Revenue per category, excluding the cancelled order:

```sql
SELECT c.name AS category, sum(oi.quantity) AS units, sum(oi.quantity * oi.unit_price) AS revenue
FROM order_items oi
JOIN products p ON p.id = oi.product_id
JOIN categories c ON c.id = p.category_id
JOIN orders o ON o.id = oi.order_id
WHERE o.status <> 'cancelled'
GROUP BY c.name
ORDER BY revenue DESC;
```

```
  category   | units | revenue
-------------+-------+---------
 Furniture   |     4 |  347.98
 Bags        |     4 |  129.00
 Stationery  |    50 |   95.70
 Electronics |     4 |   91.48
(4 rows)
```

Join to reach every column you need, `WHERE` to drop rows, `GROUP BY` the column you want one row per. Furniture sells few units but makes the most money; stationery is the opposite.

### The join-and-count trap

Here's a mistake that gives a wrong answer with no error. Orders and spending per customer:

```sql
SELECT c.name, count(o.id) AS orders, sum(oi.quantity * oi.unit_price) AS spent
FROM customers c
JOIN orders o ON o.customer_id = c.id
JOIN order_items oi ON oi.order_id = o.id
WHERE o.status <> 'cancelled'
GROUP BY c.name
ORDER BY spent DESC;
```

```
      name       | orders | spent
-----------------+--------+--------
 Chandra Gurung  |      2 | 239.00
 Asha Rai        |      6 | 218.19
 Dipesh Thapa    |      4 |  86.23
 ...
```

Asha has 3 orders, not 6. What happened? Joining `order_items` turned each order into one row *per line*. Asha's three orders have six lines between them, so `count(o.id)` counted six. The `sum` is right (every line counted once), but the count is wrong.

The fix is `count(DISTINCT o.id)`:

```sql
SELECT c.name, count(DISTINCT o.id) AS orders, sum(oi.quantity * oi.unit_price) AS spent
...
```

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

**Whenever you join to a "many" table and count, ask: am I counting the thing I think I'm counting, or the lines?** `count(DISTINCT ...)` is the usual answer. [Chapter 26](../26-common-table-expressions/notes.md) shows a cleaner way: total each order first, then join.

### The old way: commas

You'll see this in older code:

```sql
SELECT o.id, c.name FROM orders o, customers c WHERE c.id = o.customer_id;
```

It's the same inner join, with the match condition hiding in the `WHERE`. It works, but when you have four tables and six conditions it's hard to tell which conditions are joins and which are filters. Write `JOIN ... ON`. Recognize the comma version when you meet it.

### Forgetting the match: `CROSS JOIN`

What if there's no `ON`? Every row of one table gets paired with every row of the other:

```sql
SELECT count(*) FROM orders CROSS JOIN customers;
```

```
 count
-------
    72
(1 row)
```

12 orders × 6 customers = 72 nonsense rows. This is called a **cross join** or Cartesian product. Occasionally useful (every size with every colour, chapter 23), usually a mistake. If a join gives you far more rows than you expected, you probably lost an `ON` condition, or wrote the comma version and forgot the `WHERE`.

### Joining a table to itself

A table can join to itself when rows refer to other rows in the same table. Employees and their managers:

```sql
CREATE TEMP TABLE employees (
  id integer PRIMARY KEY,
  name text,
  manager_id integer REFERENCES employees (id)
);
INSERT INTO employees VALUES
  (1, 'Maya Rai', NULL), (2, 'Dev Shrestha', 1), (3, 'Asha Thapa', 2),
  (4, 'Bikram Karki', 2), (5, 'Sita Gurung', 1);

SELECT e.name AS employee, m.name AS manager
FROM employees e
JOIN employees m ON m.id = e.manager_id
ORDER BY e.name;
```

```
   employee   |   manager
--------------+--------------
 Asha Thapa   | Dev Shrestha
 Bikram Karki | Dev Shrestha
 Dev Shrestha | Maya Rai
 Sita Gurung  | Maya Rai
(4 rows)
```

The same table, two aliases, two roles. `e` is "the employee", `m` is "the manager". Maya has no manager, so she's missing; the next chapter fixes that.

(`CREATE TEMP TABLE` makes a table that disappears when you quit psql. Handy for experiments.)

## Common mistakes

**1. Ambiguous column names**

Always `alias.column` in a join. Every time.

**2. Counting lines instead of orders**

The trap above. `count(DISTINCT o.id)`, or total the lines first (chapter 26).

**3. Missing `ON`**

```
ERROR:  syntax error at or near "ORDER"
```

A `JOIN` without `ON` is a syntax error (unless you write `CROSS JOIN` on purpose). If the error points just after a table name, you forgot the `ON`.

**4. Joining on the wrong columns**

`ON c.id = o.id` instead of `ON c.id = o.customer_id`. No error, nonsense result: order 3 gets customer 3 regardless of who placed it. Check each `ON` follows a real foreign key.

**5. Row explosion**

Thousands of rows from a small query means a join condition is too loose or missing. Count the rows before you trust the sums.

**6. Filtering in `ON` instead of `WHERE`**

For inner joins, `ON c.id = o.customer_id AND o.status = 'shipped'` and putting the status in `WHERE` give the same answer. For outer joins (next chapter) they don't. Get in the habit: `ON` for matching, `WHERE` for filtering.

## Quick recap

- `FROM a JOIN b ON b.id = a.b_id` lines up rows from two tables by a shared value. Every foreign key arrow is an `ON`.
- Give tables short aliases and prefix every column: `o.id`, `c.name`.
- Chain joins to reach more tables. Start from the table in the middle.
- `JOIN` + `WHERE` + `GROUP BY` answers real reporting questions across tables.
- Joining a "many" table multiplies rows. Use `count(DISTINCT ...)` or total first.
- A join with no `ON` pairs everything with everything. If you get far too many rows, look for a lost condition.
- A table can join to itself with two aliases.

---

**Next:** try the [exercises](exercises.md), then move on to [23 Outer Joins](../23-outer-joins/notes.md).
