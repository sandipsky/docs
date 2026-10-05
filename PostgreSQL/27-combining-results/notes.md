# 27 Combining Results

## What is it?

Joins combine tables **side by side**: more columns. The three operators in this chapter combine query results **top to bottom**: more rows.

| Operator | Gives you |
|---|---|
| `UNION ALL` | Every row from both queries, stacked |
| `UNION` | The same, with duplicate rows removed |
| `INTERSECT` | Only rows that appear in **both** results |
| `EXCEPT` | Rows in the first result that are **not** in the second |

They're called **set operations**, because they treat each result as a set of rows and combine the sets.

## Why does it matter?

Some questions are about two lists:

- "Give me every email address we have, from customers *and* newsletter subscribers, each once." (`UNION`)
- "Which customers ordered in July *and* in August?" (`INTERSECT`)
- "Which products were sold in August but *not* in July?" (`EXCEPT`)
- "Add a TOTAL row to the bottom of this report." (`UNION ALL`)

You can often get the same answers with joins or `EXISTS`. But when the question is naturally "this list and that list", the set operators say exactly what you mean, in the order you'd say it.

## Real-world example

Two guest lists, for a wedding and for a birthday party:

| You want | Operator |
|---|---|
| One combined mailing list, each person once | `UNION` |
| The combined list, even if some people appear twice | `UNION ALL` |
| People invited to both | `INTERSECT` |
| People invited to the wedding but not the birthday | `EXCEPT` |

Same two lists, four different questions.

## How it works

Work in `sales`, with `\pset null '[NULL]'`.

### `UNION ALL`: stack two results

```sql
SELECT name, 'customer' AS kind FROM customers
UNION ALL
SELECT name, 'category' FROM categories
ORDER BY kind, name;
```

```
      name       |   kind
-----------------+----------
 Bags            | category
 Electronics     | category
 Furniture       | category
 Stationery      | category
 Asha Rai        | customer
 Bikram Shrestha | customer
 ...
(10 rows)
```

Six customers plus four categories, ten rows. The second query's rows are appended under the first's.

Three rules, which apply to all four operators:

1. **Same number of columns.** `SELECT name, email ... UNION SELECT name ...` fails with `each UNION query must have the same number of columns`.
2. **Matching types, position by position.** `SELECT name ... UNION SELECT id ...` fails with `UNION types text and integer cannot be matched`.
3. **Column names come from the first query.** The second query's names are ignored.

The `'customer' AS kind` column is a habit worth copying: a literal label so you can tell which rows came from where. Without it, the stacked rows are anonymous.

### `UNION`: stack and remove duplicates

```sql
SELECT city FROM customers
UNION ALL
SELECT city FROM customers;
```

12 rows: every city, twice. Now with `UNION`:

```sql
SELECT city FROM customers
UNION
SELECT city FROM customers
ORDER BY city;
```

```
   city
-----------
 Kathmandu
 Lalitpur
 Pokhara
(3 rows)
```

`UNION` removes **every** duplicate row, including duplicates that were already inside one of the queries. It's `UNION ALL` followed by `DISTINCT`.

Which to use? **`UNION ALL` unless you specifically need duplicates removed.** It's faster (no sorting to find duplicates), and it never silently merges two rows that happened to look the same but meant different things.

### `ORDER BY` and `LIMIT` with set operations

An `ORDER BY` at the end applies to the **combined** result. You can't put one inside a part:

```sql
SELECT name FROM customers ORDER BY name
UNION
SELECT name FROM categories;
```

```
ERROR:  syntax error at or near "UNION"
```

If you want a `LIMIT` or `ORDER BY` on just one part (say, the two most expensive and the two cheapest products), wrap that part in brackets:

```sql
(SELECT name, price FROM products ORDER BY price DESC LIMIT 2)
UNION ALL
(SELECT name, price FROM products ORDER BY price ASC LIMIT 2);
```

```
       name        | price
-------------------+--------
 Office chair      | 149.00
 Backpack          |  45.00
 Pen               |   1.20
 Whiteboard marker |   1.80
(4 rows)
```

### `INTERSECT`: in both

Customers who ordered in July **and** in August:

```sql
SELECT customer_id FROM orders WHERE ordered_at >= '2026-07-01' AND ordered_at < '2026-08-01'
INTERSECT
SELECT customer_id FROM orders WHERE ordered_at >= '2026-08-01' AND ordered_at < '2026-09-01'
ORDER BY customer_id;
```

```
 customer_id
-------------
           1
           2
(2 rows)
```

Asha and Bikram. The first query lists July's customers, the second August's, and `INTERSECT` keeps the ids on both lists. Say it as a sentence and it's exactly the question.

You can chain them. Customers active in **all three** months:

```sql
SELECT customer_id FROM orders WHERE ordered_at < '2026-08-01'
INTERSECT
SELECT customer_id FROM orders WHERE ordered_at >= '2026-08-01' AND ordered_at < '2026-09-01'
INTERSECT
SELECT customer_id FROM orders WHERE ordered_at >= '2026-09-01';
```

One row: customer 1, Asha.

### `EXCEPT`: in the first, not the second

Customers who ordered in July but **not** in September:

```sql
SELECT customer_id FROM orders WHERE ordered_at >= '2026-07-01' AND ordered_at < '2026-08-01'
EXCEPT
SELECT customer_id FROM orders WHERE ordered_at >= '2026-09-01'
ORDER BY customer_id;
```

```
 customer_id
-------------
           2
(1 row)
```

Bikram. Order matters with `EXCEPT`: *first list minus second list*. Swap them and you get a different answer.

`EXCEPT` is a third way to write "never sold", after `LEFT JOIN ... IS NULL` and `NOT EXISTS`:

```sql
SELECT id FROM products
EXCEPT
SELECT product_id FROM order_items;
```

One row: product 5, the Whiteboard marker. All three ways are correct. Pick the one that reads best for the question in front of you.

### Comparing two lists

The newsletter table from chapter 23, with all three operators:

```sql
CREATE TEMP TABLE newsletter (email text PRIMARY KEY);
INSERT INTO newsletter VALUES ('asha@example.com'), ('elina@example.com'), ('guest@example.com');

-- Every address we have, once
SELECT email FROM customers UNION SELECT email FROM newsletter ORDER BY email;        -- 7 rows

-- Customers who also subscribe
SELECT email FROM customers INTERSECT SELECT email FROM newsletter ORDER BY email;    -- asha, elina

-- Subscribers who aren't customers
SELECT email FROM newsletter EXCEPT SELECT email FROM customers;                      -- guest@example.com
```

That's the chapter 23 `FULL JOIN` broken into three plain questions, each one line.

### A report with a total row

The classic `UNION ALL` trick:

```sql
SELECT status, count(*) AS orders, 1 AS sort_key FROM orders GROUP BY status
UNION ALL
SELECT 'TOTAL', count(*), 2 FROM orders
ORDER BY sort_key, status;
```

```
  status   | orders | sort_key
-----------+--------+----------
 cancelled |      1 |        1
 paid      |      3 |        1
 pending   |      2 |        1
 shipped   |      6 |        1
 TOTAL     |     12 |        2
(5 rows)
```

The `sort_key` column exists only to force `TOTAL` to the bottom (without it, `TOTAL` would sort alphabetically among the statuses). It's a bit ugly in the output; in a real report you'd leave it out of the final `SELECT` by wrapping the whole thing in a CTE. Same idea gives subtotals per category, or a "summary" block at the top of a dashboard query.

### Getting names back

Set operations work on whatever columns you give them, and ids are the safest thing to compare. To show names, wrap the operation in a subquery:

```sql
SELECT name FROM customers
WHERE id IN (
  SELECT customer_id FROM orders WHERE ordered_at < '2026-08-01'
  INTERSECT
  SELECT customer_id FROM orders WHERE ordered_at >= '2026-08-01' AND ordered_at < '2026-09-01'
)
ORDER BY name;
```

Asha Rai, Bikram Shrestha. The set operation makes the id list; `IN` turns it into names.

### `INTERSECT ALL` and `EXCEPT ALL`

Like `UNION ALL`, these keep duplicates. `EXCEPT ALL` removes one matching row from the first list for each row in the second, instead of removing all of them. Rare. Know they exist.

### Set operations or joins?

| Question shape | Reach for |
|---|---|
| "Combine columns from two tables about the same thing" | A join |
| "One list made from two sources" | `UNION ALL` / `UNION` |
| "Things on both lists" | `INTERSECT` (or `EXISTS`) |
| "Things on this list but not that one" | `EXCEPT` (or `NOT EXISTS`) |
| "Add a total row" | `UNION ALL` |

## Common mistakes

**1. Different numbers of columns**

Count them. Every part must have the same number.

**2. Types that don't line up**

`SELECT name, id ... UNION SELECT id, name ...` fails. Columns match **by position**, not by name. Put them in the same order.

**3. `UNION` when you meant `UNION ALL`**

Two genuinely different orders for the same amount on the same day look identical in a `SELECT amount, day` and `UNION` merges them. Default to `UNION ALL`.

**4. No label column**

Stacked rows with no way to tell them apart. Add `'something' AS kind`.

**5. `ORDER BY` inside a part**

Syntax error. Order the whole result at the end, or wrap the part in brackets.

**6. Swapping the sides of `EXCEPT`**

"July minus September" and "September minus July" are different questions. Say the sentence out loud before you write it.

## Quick recap

- `UNION ALL` stacks results. `UNION` stacks and removes duplicates. Prefer `UNION ALL` unless duplicates must go.
- `INTERSECT` keeps rows in both. `EXCEPT` keeps rows in the first but not the second. Order matters for `EXCEPT`.
- All parts need the **same number of columns** with **matching types, by position**. Names come from the first part.
- One `ORDER BY` at the very end. Brackets for a per-part `LIMIT`.
- Add a literal label column so you know where each row came from.
- Set operations work best on ids; wrap in `IN (...)` to get names.

---

**Next:** try the [exercises](exercises.md), then move on to [28 Window Functions](../28-window-functions/notes.md).
