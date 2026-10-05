# 10 Changing and Deleting Data

## What is it?

`UPDATE` changes values in rows that already exist. `DELETE` removes rows. They're the **U** and **D** in CRUD.

Both use `WHERE` to decide *which* rows. And both do something new for you: they change data permanently, with no undo button. So this chapter is also about being careful.

## Why does it matter?

Data changes. A customer moves house. A task gets ticked off. A price goes up. An account gets closed. Every one of those is an `UPDATE` or a `DELETE`.

And here's the thing that makes them different from everything so far: **a `SELECT` with a mistake gives you a wrong answer. An `UPDATE` with a mistake gives you wrong data**, for everyone, from now on. So professionals have habits for these two commands, and you'll learn them here.

## Real-world example

Back to the library's index cards:

| Librarian's job | SQL |
|---|---|
| Correct a spelling mistake on one card | `UPDATE books SET author = ... WHERE id = 10` |
| Cross out every card for books that were thrown away | `DELETE FROM books WHERE ...` |
| Photocopy the drawer before making changes, in case | `BEGIN` ... `ROLLBACK` |
| Find the cards first, *then* pick up the pen | `SELECT` with the same `WHERE`, then `UPDATE` |

A careful librarian checks which cards they're about to change *before* writing on them. So will you.

## How it works

You need the 9-row `books` table from [chapter 06](../06-adding-data/notes.md), and `\pset null '[NULL]'`.

### Adding a row with a mistake in it

Let's add a book, with two deliberate errors: the author's name is misspelled and the year is off by one.

```sql
INSERT INTO books (title, author, year)
VALUES ('Emma', 'Jane Austin', 1816)
RETURNING *;
```

```
 id | title |   author    | year
----+-------+-------------+------
 10 | Emma  | Jane Austin | 1816
```

Now let's fix it.

### Changing a value: `UPDATE`

```sql
UPDATE books SET author = 'Jane Austen' WHERE id = 10;
```

```
UPDATE 1
```

Read it: *update `books`, set `author` to `'Jane Austen'`, where `id` is 10.*

- `SET column = value` says what to change.
- `WHERE` says which rows. Here, exactly one.
- The reply `UPDATE 1` tells you **how many rows changed**. Always read this number. If you expected 1 and see 47, something went wrong.

### Using the old value in the new one

The right-hand side of `SET` can be an expression, using the row's current values:

```sql
UPDATE books SET year = year - 1 WHERE id = 10;
```

```
UPDATE 1
```

"Set year to the current year minus one." 1816 becomes 1815. This is how you do "raise every price by 10%" (`SET price = price * 1.1`) or "add one to the view count" (`SET views = views + 1`).

### Several columns at once

Separate them with commas:

```sql
UPDATE books
SET author = 'Jane Austen',
    year = 1815
WHERE id = 10;
```

That's both fixes in one statement. Commas between the `SET` parts, not `AND`.

### Getting the changed rows back

`RETURNING` works here too:

```sql
UPDATE books SET title = 'Emma (a novel)' WHERE id = 10 RETURNING id, title;
```

```
 id |     title
----+----------------
 10 | Emma (a novel)
(1 row)

UPDATE 1
```

Handy for checking what you did without a second query.

### The disaster: forgetting `WHERE`

Here's what every database developer has done at least once. Without `WHERE`, `UPDATE` changes **every row**:

```sql
UPDATE books SET year = 2000;
```

```
UPDATE 10
```

Every book is now from the year 2000. There's no undo. If this were a real shop's product table, you'd have just set every price to the same number.

**Don't run that.** Instead, let's learn the safety net that lets you try it without consequences.

### The safety net: `BEGIN` and `ROLLBACK`

PostgreSQL can treat a group of statements as a **draft**. Nothing becomes permanent until you say so:

```sql
BEGIN;
```

```
BEGIN
```

Now try the disaster:

```sql
UPDATE books SET year = 2000;
SELECT title, year FROM books LIMIT 3;
```

```
UPDATE 10

    title    | year
-------------+------
 The Hobbit  | 2000
 Matilda     | 2000
 Dune        | 2000
(3 rows)
```

It looks done. But it's a draft. Throw it away:

```sql
ROLLBACK;
```

```
ROLLBACK
```

```sql
SELECT title, year FROM books LIMIT 3;
```

```
    title    | year
-------------+------
 The Hobbit  | 1937
 Matilda     | 1988
 Dune        | 1965
(3 rows)
```

Everything is back. Here's the vocabulary:

| Command | Meaning |
|---|---|
| `BEGIN;` | Start a draft. From now on, changes are pending. |
| `ROLLBACK;` | Throw the draft away. Nothing you did since `BEGIN` happened. |
| `COMMIT;` | Make the draft permanent. |

This draft is called a **transaction**, and it's one of the most important ideas in databases. [Chapter 30](../30-transactions/notes.md) covers it fully. For now, use it as a seatbelt: **when you're about to run an `UPDATE` or `DELETE` you're not sure about, type `BEGIN;` first.** Check the result. If it's right, `COMMIT;`. If not, `ROLLBACK;`.

Without `BEGIN`, every statement commits itself the moment it finishes. That's why the disaster above would have been permanent.

While you're in a transaction, the psql prompt changes to `practice=*#`. The `*` means "you have a draft open". If you see it and don't know why, `ROLLBACK;` is the safe choice.

### Removing rows: `DELETE`

```sql
DELETE FROM books WHERE id = 10;
```

```
DELETE 1
```

*Emma* is gone. `DELETE FROM table WHERE condition` removes every row that matches. Same shape as `UPDATE`, same rule: **read the number in the reply.**

Two things to know:

1. **The `id` is not reused.** The next book you insert gets `id` 11, not 10. Gaps in ids are normal and harmless.
2. **`DELETE` without `WHERE` deletes every row.** The table stays, empty. Same danger as `UPDATE`, same safety net.

`RETURNING` works with `DELETE` too, giving you one last look at what you removed:

```sql
DELETE FROM books WHERE author = 'Roald Dahl' RETURNING title;
```

(Wrap that in `BEGIN` / `ROLLBACK` if you try it. You want to keep those books for the project.)

### Emptying a table: `TRUNCATE`

To remove every row on purpose, there's a faster command:

```sql
TRUNCATE books;
```

It's like `DELETE FROM books` with no `WHERE`, but quicker on big tables. Add `RESTART IDENTITY` to also reset the automatic `id` counter to 1. Don't run it now.

| Command | Removes | Keeps |
|---|---|---|
| `DELETE FROM t WHERE ...` | Some rows | The table, the other rows |
| `DELETE FROM t` / `TRUNCATE t` | All rows | The empty table |
| `DROP TABLE t` | Everything | Nothing. The table is gone. |

### When nothing matches

```sql
UPDATE books SET year = 1900 WHERE id = 999;
```

```
UPDATE 0
```

Not an error. Zero rows matched, zero rows changed. Which is exactly why you read the number: `UPDATE 0` when you expected `UPDATE 1` means your `WHERE` is wrong, usually a typo or a case mismatch.

### The habits of careful people

1. **`SELECT` first.** Write your `WHERE`, run it as a `SELECT`, look at the rows. If those are the rows you mean, change `SELECT *` to `UPDATE ... SET` or `DELETE`, keeping the `WHERE` identical.
2. **Prefer `WHERE id = ...`** for single rows. It can't match the wrong row.
3. **`BEGIN` when unsure.** Then `COMMIT` or `ROLLBACK`.
4. **Read the row count.** Every time.
5. **Never type `UPDATE` or `DELETE` without a `WHERE`** unless you really do mean every row, and you've said so out loud.

### In pgAdmin

View/Edit Data → All Rows opens a grid. Double-click a cell to change it, or select a row and click the bin icon to delete it. Then press **Save**. pgAdmin writes the `UPDATE` or `DELETE` for you, always with `WHERE id = ...`. Fine for quick fixes.

## Common mistakes

**1. No `WHERE`**

Every row changed or gone. Covered above. It will happen to you eventually; make sure it's inside a `BEGIN`.

**2. `AND` between `SET` parts**

```sql
UPDATE books SET author = 'Jane Austen' AND year = 1815 WHERE id = 10;
```

```
ERROR:  argument of AND must be type boolean, not type text
```

Commas separate the things you're setting. `AND` is only for conditions.

**3. `UPDATE 0` because of case or spelling**

`WHERE title = 'the hobbit'` matches nothing. Check with a `SELECT` first, or use `ILIKE`.

**4. Confusing `DELETE` and `DROP`**

`DELETE FROM books` empties the table. `DROP TABLE books` destroys it. Very different.

**5. Leaving a transaction open**

If the prompt shows `*`, you have uncommitted changes. Other people (and other windows) can't see them, and some things may hang waiting for you. `COMMIT` or `ROLLBACK`, then carry on.

## Quick recap

- `UPDATE table SET col = value, col2 = value2 WHERE ...;` changes matching rows. The value can use the old one: `SET year = year - 1`.
- `DELETE FROM table WHERE ...;` removes matching rows. Ids are never reused.
- **Without `WHERE`, both hit every row.** No undo.
- `BEGIN;` opens a draft. `ROLLBACK;` throws it away. `COMMIT;` keeps it. Use it as a seatbelt.
- Read the reply: `UPDATE 1`, `DELETE 3`, `UPDATE 0`. It's PostgreSQL telling you what just happened.
- Habit: **`SELECT` with the same `WHERE` first**, then change it to `UPDATE` or `DELETE`.

---

**Next:** try the [exercises](exercises.md), then move on to your first project: [11 Project: My Book Collection](../11-project-my-book-collection/notes.md).
