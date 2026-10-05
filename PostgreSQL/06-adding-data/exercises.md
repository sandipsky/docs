# 06 Adding Data: Exercises

**How to do these:**

- Work in psql, connected to `practice`. Save each answer in `playground/ch06/ex1.sql`, `ex2.sql`, and so on, and run it with `\i`.
- Run `\pset null '[NULL]'` first so you can see NULLs.
- After each insert, run `SELECT * FROM your_table;` to check.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your work.

**Important:** the next few chapters' exercises use the exact data below, so the expected outputs match. Use these values as written.

---

## Exercise 1 (Easy): Fill the to-do list

You made a `tasks` table in chapter 05 (`title`, `is_done`, `due_date`, `priority`). If it's gone, recreate it exactly like that.

Insert these five tasks. Use **one** `INSERT` for the first two, and **one** `INSERT` for the last three.

| title | is_done | due_date | priority |
|---|---|---|---|
| Buy milk | false | 2026-10-01 | 2 |
| Finish SQL chapter 6 | true | 2026-09-30 | 1 |
| Call the dentist | false | 2026-10-05 | 3 |
| Water the plants | false | *(no due date)* | 3 |
| Renew passport | false | 2026-11-15 | 1 |

Expected `SELECT * FROM tasks;`:

```
 id |        title         | is_done |  due_date  | priority
----+----------------------+---------+------------+----------
  1 | Buy milk             | f       | 2026-10-01 |        2
  2 | Finish SQL chapter 6 | t       | 2026-09-30 |        1
  3 | Call the dentist     | f       | 2026-10-05 |        3
  4 | Water the plants     | f       | [NULL]     |        3
  5 | Renew passport       | f       | 2026-11-15 |        1
(5 rows)
```

(psql shows booleans as `t` and `f`.)

<details>
<summary>Hint</summary>

For "no due date", either leave `due_date` out of the column list for that row... but you can't do that for just one row in a multi-row insert. So write `NULL` in its place instead.

</details>

---

## Exercise 2 (Easy): Fix the broken inserts

Each of these fails. Run it, read the error, fix it, run it again. Use a throwaway table:

```sql
DROP TABLE IF EXISTS notes;
CREATE TABLE notes (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  body text,
  written_on date,
  stars integer
);
```

```sql
INSERT INTO notes (body, written_on, stars) VALUES ("Great day", '2026-09-30', 5);
```

```sql
INSERT INTO notes (body, written_on, stars) VALUES ('Rainy', '2026-09-31', 3);
```

```sql
INSERT INTO notes (body, written_on) VALUES ('Tired', '2026-09-29', 2);
```

```sql
INSERT INTO notes (body, written_on, stars) VALUES ('Sam's birthday', '2026-10-02', 5);
```

<details>
<summary>Hint</summary>

Four different mistakes: the wrong kind of quotes, a date that doesn't exist, a count that doesn't match, and an apostrophe that ends the text too early.

</details>

---

## Exercise 3 (Medium): Stock the shop

To keep later chapters matching, recreate `products` with **exactly** these columns:

```sql
DROP TABLE IF EXISTS products;
CREATE TABLE products (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name text,
  price numeric(10, 2),
  stock integer,
  on_sale boolean,
  added_on date
);
```

Insert all six products in **one** statement, and use `RETURNING` to show the `id` and `name` of each new row.

| name | price | stock | on_sale | added_on |
|---|---|---|---|---|
| Notebook | 3.50 | 120 | false | 2026-09-01 |
| Pen | 1.20 | 500 | false | 2026-09-01 |
| Desk lamp | 24.99 | 15 | true | 2026-09-10 |
| Stapler | 8.00 | 40 | false | 2026-09-12 |
| Backpack | 45.00 | 8 | true | 2026-09-20 |
| Sticky notes | 2.75 | 0 | false | 2026-09-25 |

Expected output of the `RETURNING`:

```
 id |     name
----+--------------
  1 | Notebook
  2 | Pen
  3 | Desk lamp
  4 | Stapler
  5 | Backpack
  6 | Sticky notes
(6 rows)

INSERT 0 6
```

---

## Exercise 4 (Medium): Break the promises

Using the `products` table, try to insert:

1. A product whose `price` is the text `'cheap'`.
2. A product whose `stock` is `12.5`.
3. A product whose `on_sale` is `'maybe'`.
4. A product with an `id` of `100`.

None should work. Write the first line of each error message as a comment in your `ex4.sql`. Then run `SELECT * FROM products;` and confirm you still have exactly 6 rows.

<details>
<summary>Hint</summary>

Number 2 might surprise you. PostgreSQL rounds `12.5` to fit an `integer` rather than refusing it. Check what got stored, and delete that row afterwards with `DELETE FROM products WHERE name = '...';` (you'll learn `DELETE` properly in chapter 10).

</details>

---

## Exercise 5 (Challenge): A re-runnable seed file

A **seed file** is a `.sql` file that fills a database with starting data. Developers use them to get a fresh database into a known state.

Write `playground/ch06/seed.sql` that:

1. Drops `tasks` and `products` if they exist.
2. Creates both tables.
3. Inserts all the data from Exercises 1 and 3.
4. Ends with `SELECT * FROM tasks;` and `SELECT * FROM products;` so you can see the result.

Run it with `\i` twice in a row. It should work both times with no errors, and you should end up with 5 tasks and 6 products, ids starting from 1.

You'll use this file at the start of the next few chapters whenever you want a clean start.

<details>
<summary>Hint</summary>

Why do the ids start from 1 again after dropping and recreating? Because the automatic counter belongs to the table. Drop the table, and the counter goes with it.

</details>
