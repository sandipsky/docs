# 23 Outer Joins

## What is it?

The joins in chapter 22 only keep rows that **match** on both sides. They're called **inner joins**, and `JOIN` is short for `INNER JOIN`.

An **outer join** also keeps rows that *don't* match, filling the missing side with NULLs. `LEFT JOIN` keeps everything from the left table. `RIGHT JOIN` keeps everything from the right. `FULL JOIN` keeps everything from both.

## Why does it matter?

Some of the most useful questions are about what's **missing**:

- Which customers have never ordered?
- Which products have never sold?
- Which categories are empty?
- Which months had zero sales?

An inner join can't answer any of these, because a customer with no orders has nothing to match. They simply vanish from the result, silently. You've seen it twice: customer 5 missing from "orders per customer", Maya missing from "employees and managers". Outer joins bring them back.

## Real-world example

A teacher has a class list and a pile of handed-in homework.

- **Inner join:** "line up each homework with the student who handed it in." Students who handed nothing in don't appear. Neither does homework with no name on it.
- **Left join** (class list on the left): "go down the class list and attach each student's homework, if any." Every student appears. Those who handed nothing in get a blank. **Now you can see who's missing.**
- **Full join:** every student *and* every piece of homework, including the anonymous ones.

The question "who didn't do the homework?" is a left join followed by "where the homework is blank".

## How it works

Work in `sales`, with `\pset null '[NULL]'`.

### What the inner join loses

```sql
SELECT c.name, o.id AS order_id
FROM customers c
JOIN orders o ON o.customer_id = c.id
ORDER BY c.name, o.id;
```

12 rows, 5 names. Elina Maharjan, who has never ordered, isn't there.

### `LEFT JOIN`: keep everything on the left

```sql
SELECT c.name, o.id AS order_id, o.status
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
ORDER BY c.name, o.id;
```

```
      name       | order_id |  status
-----------------+----------+-----------
 Asha Rai        |        1 | paid
 Asha Rai        |        4 | cancelled
 Asha Rai        |        8 | shipped
 Asha Rai        |       12 | pending
 Bikram Shrestha |        2 | shipped
 Bikram Shrestha |        6 | shipped
 Chandra Gurung  |        3 | shipped
 Chandra Gurung  |        9 | shipped
 Dipesh Thapa    |        5 | shipped
 Dipesh Thapa    |       10 | paid
 Elina Maharjan  |   [NULL] | [NULL]
 Farhan Ali      |        7 | paid
 Farhan Ali      |       11 | pending
(13 rows)
```

Thirteen rows now. Elina appears once, with NULL in every column that comes from `orders`, because there was nothing to match.

"Left" means the table written **before** the `JOIN` keyword: here, `customers`. Every row from it survives. Rows from the right table (`orders`) appear only where they match.

### Finding what's missing

Elina's row is the only one with a NULL `order_id`. So:

```sql
SELECT c.name, c.email
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.id IS NULL;
```

```
      name      |       email
----------------+-------------------
 Elina Maharjan | elina@example.com
(1 row)
```

This is **the** outer join pattern. Left join, then `WHERE right_table.id IS NULL`. Say it as "customers with no matching order." The same shape answers "products never sold":

```sql
SELECT p.name, p.sku
FROM products p
LEFT JOIN order_items oi ON oi.product_id = p.id
WHERE oi.order_id IS NULL;
```

```
       name        |   sku
-------------------+---------
 Whiteboard marker | STA-005
(1 row)
```

Always test for NULL on a column that **can't** be NULL in the right table when there's a match: its primary key, or a `NOT NULL` column. `o.id` and `oi.order_id` are both perfect. If you tested `o.shipped_at IS NULL`, you'd also catch real orders that haven't shipped.

### Counting with a `LEFT JOIN`

Orders per customer, including zero:

```sql
SELECT c.name, count(o.id) AS orders
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.name
ORDER BY c.name;
```

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

Elina shows `0`. Now the chapter 20 lesson pays off: it has to be **`count(o.id)`**, not `count(*)`. Elina's group has one row (her own, with NULLs). `count(*)` would count that row and report `1`:

```sql
SELECT c.name, count(*) AS orders ...
```

```
 Elina Maharjan  |      1    ← wrong
```

`count(o.id)` skips the NULL and gives `0`. **With outer joins, count a column from the right table, never `*`.**

### Sums with a `LEFT JOIN`

```sql
SELECT p.name, sum(oi.quantity) AS units_sold
FROM products p
LEFT JOIN order_items oi ON oi.product_id = p.id
GROUP BY p.name
ORDER BY units_sold DESC NULLS LAST, p.name;
```

The Whiteboard marker comes out with `[NULL]`, because the sum of nothing is NULL. To show a proper zero, wrap it in `coalesce()`, which returns the first non-NULL value it's given:

```sql
SELECT p.name, coalesce(sum(oi.quantity), 0) AS units_sold
FROM products p
LEFT JOIN order_items oi ON oi.product_id = p.id
GROUP BY p.name
ORDER BY units_sold DESC, p.name;
```

```
       name        | units_sold
-------------------+------------
 Pen               |         35
 Notebook          |          8
 Sticky notes      |          6
 Backpack          |          3
 Desk lamp         |          2
 Laptop sleeve     |          2
 Office chair      |          2
 USB hub           |          2
 Wireless mouse    |          2
 Stapler           |          1
 Whiteboard marker |          0
(11 rows)
```

A complete sales table, every product present. `coalesce` gets its full introduction in [chapter 24](../24-built-in-functions/notes.md); for now, `coalesce(x, 0)` means "x, or 0 if x is NULL".

### The `ON` vs `WHERE` difference

This is the subtle part of outer joins, and it matters.

Suppose you want every customer, with their **shipped** orders, keeping customers who have none. Put the condition in the `ON`:

```sql
SELECT c.name, o.id AS shipped_order
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'shipped'
ORDER BY c.name, o.id;
```

```
      name       | shipped_order
-----------------+---------------
 Asha Rai        |             8
 Bikram Shrestha |             2
 Bikram Shrestha |             6
 Chandra Gurung  |             3
 Chandra Gurung  |             9
 Dipesh Thapa    |             5
 Elina Maharjan  |        [NULL]
 Farhan Ali      |        [NULL]
(8 rows)
```

All six customers. Elina and Farhan (whose two orders are paid and pending, not shipped) show NULL.

Now put the same condition in the `WHERE` instead:

```sql
SELECT c.name, o.id AS shipped_order
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.status = 'shipped'
ORDER BY c.name, o.id;
```

```
      name       | shipped_order
-----------------+---------------
 Asha Rai        |             8
 Bikram Shrestha |             2
 Bikram Shrestha |             6
 Chandra Gurung  |             3
 Chandra Gurung  |             9
 Dipesh Thapa    |             5
(6 rows)
```

Elina and Farhan are gone. Why? The `LEFT JOIN` gave them rows with NULL status. Then `WHERE o.status = 'shipped'` asked "is NULL equal to shipped?", got unknown, and dropped them. The `WHERE` quietly turned your outer join back into an inner one.

The rule: **conditions about the right table go in the `ON`. Conditions about the left table go in the `WHERE`.** The one exception is the deliberate `WHERE right.id IS NULL` pattern for finding what's missing.

### `RIGHT JOIN`: the mirror image

```sql
SELECT c.name, o.id AS order_id
FROM orders o
RIGHT JOIN customers c ON o.customer_id = c.id
ORDER BY c.name, o.id;
```

Exactly the same 13 rows as the first `LEFT JOIN`. A `RIGHT JOIN` keeps everything from the table **after** `JOIN`. Any right join can be rewritten as a left join by swapping the tables, and nearly everyone does, because "the table I start with is the one I keep" is easier to read. You'll rarely write `RIGHT JOIN`; just recognize it.

### `FULL JOIN`: keep both sides

Sometimes neither table is "the main one". The shop has a newsletter list that isn't tied to customer accounts:

```sql
CREATE TEMP TABLE newsletter (email text PRIMARY KEY, subscribed_on date NOT NULL);
INSERT INTO newsletter VALUES
  ('asha@example.com', '2026-03-01'),
  ('elina@example.com', '2026-07-01'),
  ('guest@example.com', '2026-08-15');

SELECT c.name, c.email AS customer_email, n.email AS subscriber_email
FROM customers c
FULL JOIN newsletter n ON n.email = c.email
ORDER BY c.name NULLS LAST, n.email;
```

```
      name       |   customer_email    | subscriber_email
-----------------+---------------------+-------------------
 Asha Rai        | asha@example.com    | asha@example.com
 Bikram Shrestha | bikram@example.com  | [NULL]
 Chandra Gurung  | chandra@example.com | [NULL]
 Dipesh Thapa    | dipesh@example.com  | [NULL]
 Elina Maharjan  | elina@example.com   | elina@example.com
 Farhan Ali      | farhan@example.com  | [NULL]
 [NULL]          | [NULL]              | guest@example.com
(7 rows)
```

Customers who aren't subscribed (NULL on the right), a subscriber who isn't a customer (NULL on the left), and the two who are both. `FULL JOIN` is less common than `LEFT JOIN`, but it's exactly right for comparing two lists.

### `CROSS JOIN`: every combination, on purpose

Chapter 22 called this a mistake. Sometimes it's the goal:

```sql
CREATE TEMP TABLE sizes (size text);
INSERT INTO sizes VALUES ('S'), ('M'), ('L');
CREATE TEMP TABLE colours (colour text);
INSERT INTO colours VALUES ('red'), ('blue');

SELECT size, colour FROM sizes CROSS JOIN colours ORDER BY size, colour;
```

```
 size | colour
------+--------
 L    | blue
 L    | red
 M    | blue
 M    | red
 S    | blue
 S    | red
(6 rows)
```

Every size with every colour: six product variants. No `ON`, because there's nothing to match. Write `CROSS JOIN` explicitly so nobody thinks you forgot the `ON`.

### The family

| Join | Keeps | Use for |
|---|---|---|
| `JOIN` (inner) | Only matching rows | Most queries |
| `LEFT JOIN` | All left rows, matching right rows | "All X, with their Y if any"; "X with no Y" |
| `RIGHT JOIN` | All right rows, matching left rows | Rare; rewrite as `LEFT JOIN` |
| `FULL JOIN` | Everything from both | Comparing two lists |
| `CROSS JOIN` | Every combination | Generating variants |

## Common mistakes

**1. `count(*)` with an outer join**

Gives `1` for things that have nothing. Count a right-table column: `count(o.id)`.

**2. A right-table condition in `WHERE`**

Turns the outer join back into an inner join. Move it to the `ON`.

**3. Testing the wrong column for NULL**

`WHERE o.shipped_at IS NULL` catches unshipped orders *and* customers with no orders. Test the right table's primary key, or a `NOT NULL` column.

**4. Forgetting `coalesce` on sums**

`sum()` over a group of NULLs is NULL. `coalesce(sum(...), 0)` for a clean zero.

**5. Chaining outer joins carelessly**

`customers LEFT JOIN orders JOIN order_items` makes the second join inner, and the inner join on `order_items` drops Elina's NULL row again. If you want to keep the left side all the way through, every join in the chain must be `LEFT JOIN`.

**6. Writing `RIGHT JOIN` when you could swap**

Not wrong, just harder to read. Start from the table you want to keep, and use `LEFT JOIN`.

## Quick recap

- `JOIN` keeps only matches. **`LEFT JOIN`** keeps every row from the left table, filling the right side with NULL when there's no match.
- **Find what's missing:** `LEFT JOIN` then `WHERE right.id IS NULL`.
- **Count with outer joins** using a right-table column (`count(o.id)`), and wrap sums in `coalesce(..., 0)`.
- **`ON` vs `WHERE`:** right-table conditions go in `ON`, or you lose the unmatched rows.
- `RIGHT JOIN` is a `LEFT JOIN` with the tables swapped. `FULL JOIN` keeps both sides. `CROSS JOIN` makes every combination.
- In a chain of joins, every link after a `LEFT JOIN` must also be `LEFT JOIN` to keep the unmatched rows.

---

**Next:** try the [exercises](exercises.md), then move on to [24 Handy Built-in Functions](../24-built-in-functions/notes.md).
