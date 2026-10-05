# 09 Sorting and Limiting: Exercises

**How to do these:**

- Work in psql, connected to `practice`, with the `tasks` and `products` data from chapter 06 (run `playground/ch06/seed.sql` for a clean start).
- Run `\pset null '[NULL]'` first.
- Save each answer in `playground/ch09/ex1.sql`, `ex2.sql`, and so on.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your work.

---

## Exercise 1 (Easy): Cheapest first, soonest first

1. All products, cheapest first. Show `name` and `price`.
2. All tasks, soonest due date first, with the task that has no due date at the **bottom**. Show `title` and `due_date`.

Expected output of query 2:

```
        title         |  due_date
----------------------+------------
 Finish SQL chapter 6 | 2026-09-30
 Buy milk             | 2026-10-01
 Call the dentist     | 2026-10-05
 Renew passport       | 2026-11-15
 Water the plants     | [NULL]
(5 rows)
```

---

## Exercise 2 (Easy): Top three

1. The three most expensive products (`name`, `price`).
2. The two products with the most stock (`name`, `stock`).
3. The single newest product (by `added_on`).

Expected output of query 1:

```
   name    | price
-----------+-------
 Backpack  | 45.00
 Desk lamp | 24.99
 Stapler   |  8.00
(3 rows)
```

<details>
<summary>Hint</summary>

"Most expensive first" is descending. Then limit.

</details>

---

## Exercise 3 (Medium): Priority, then date

Show all tasks ordered by priority (1 is most urgent, so 1 first), and within the same priority, by due date, soonest first. Show `title`, `priority`, `due_date`.

Expected output:

```
        title         | priority |  due_date
----------------------+----------+------------
 Finish SQL chapter 6 |        1 | 2026-09-30
 Renew passport       |        1 | 2026-11-15
 Buy milk             |        2 | 2026-10-01
 Call the dentist     |        3 | 2026-10-05
 Water the plants     |        3 | [NULL]
(5 rows)
```

---

## Exercise 4 (Medium): Each value once

1. List each distinct `priority` value in `tasks`, smallest first.
2. List each distinct `added_on` date in `products`, newest first. How many rows do you get, and why isn't it 6?
3. List the distinct combinations of `on_sale` and `added_on` in `products`.

---

## Exercise 5 (Challenge): Pages and a combined query

1. The shop shows products **2 per page**, sorted by name A to Z. Write the query for **page 2**.

Expected output:

```
   name    | price
-----------+-------
 Notebook  |  3.50
 Pen       |  1.20
(2 rows)
```

2. Write one query that answers: "What's the cheapest product that's in stock and **not** on sale?" It should return exactly one row.

3. Write a query showing the tasks that aren't done, most urgent first, but only the top 2. Then explain in a comment why `LIMIT 2` **without** `ORDER BY` would be a bug here, even though it also returns 2 rows.

<details>
<summary>Hint</summary>

Page 2 of 2-per-page means skip 2, take 2. Check the clause order: `WHERE`, then `ORDER BY`, then `LIMIT`/`OFFSET`.

</details>
