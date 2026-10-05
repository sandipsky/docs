# 08 Filtering Rows: Exercises

**How to do these:**

- Work in psql, connected to `practice`, with the `tasks` and `products` data from chapter 06 (run `playground/ch06/seed.sql` for a clean start).
- Run `\pset null '[NULL]'` first.
- Save each answer in `playground/ch08/ex1.sql`, `ex2.sql`, and so on.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your work.

---

## Exercise 1 (Easy): One condition each

Write a query for each:

1. The names and prices of products that are on sale.
2. The titles of tasks that are **not** done.
3. The names of products that cost less than 5.00.

Expected output of query 3:

```
     name
--------------
 Notebook
 Pen
 Sticky notes
(3 rows)
```

<details>
<summary>Hint</summary>

A boolean column can be tested directly: `WHERE on_sale` means "where on_sale is true", and `WHERE NOT is_done` means "where is_done is false". `WHERE on_sale = true` works too.

</details>

---

## Exercise 2 (Easy): Two conditions

1. Tasks that are not done **and** have priority 1.
2. Products that are on sale **or** cost less than 3.00.
3. Tasks due in October 2026 (use `BETWEEN`).

Expected output of query 3:

```
      title       |  due_date
------------------+------------
 Buy milk         | 2026-10-01
 Call the dentist | 2026-10-05
(2 rows)
```

---

## Exercise 3 (Medium): Patterns

1. Products whose name contains "note", ignoring case. (Both `Notebook` and `Sticky notes` should appear.)
2. Tasks whose title starts with a `B` or a `C`.
3. Products whose name is exactly three letters long. (There's one.)

<details>
<summary>Hint</summary>

For number 3, `_` matches exactly one character. Three underscores in a row match exactly three characters.

</details>

---

## Exercise 4 (Medium): Where's the NULL?

1. Tasks that have **no** due date.
2. Tasks that **do** have a due date and are not done.
3. Now run this and explain, in a comment, why the result is wrong:

```sql
SELECT title FROM tasks WHERE due_date <> '2026-10-01';
```

You'd expect 4 tasks (everything except "Buy milk"). How many do you get, and which one is missing? Fix the query so that all 4 appear.

<details>
<summary>Hint</summary>

"Is unknown different from 2026-10-01?" can't be answered. Add a second condition with `OR` that catches the unknown case.

</details>

---

## Exercise 5 (Challenge): The shop's front page

The shop wants to show products that are **either on sale or cost less than 3.00**, but **only** if there are at least 10 in stock (so the front page never shows something about to sell out).

Write the query, with brackets, showing `name`, `price`, `stock`, and `on_sale`.

Expected output:

```
   name    | price | stock | on_sale
-----------+-------+-------+---------
 Pen       |  1.20 |   500 | f
 Desk lamp | 24.99 |    15 | t
(2 rows)
```

Then remove the brackets and run it again. Which extra product sneaks in, and why?

<details>
<summary>Hint</summary>

Without brackets, `AND` is checked first, so the condition becomes "on sale, OR (cheap and at least 10 in stock)". Which on-sale product has fewer than 10 in stock?

</details>
