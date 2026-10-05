# 15 Changing a Table's Shape

## What is it?

`ALTER TABLE` changes a table that already exists: add a column, remove one, rename things, change a type, add or drop a rule. It's how a table keeps up with a changing app without being thrown away and rebuilt.

This chapter also tidies up the three ways to get rid of things: `DELETE`, `TRUNCATE`, and `DROP`.

## Why does it matter?

So far, when a table was wrong, you dropped it and created it again. That works when the table holds 9 practice rows. It does not work when it holds three years of customer orders.

Real tables live for years and requirements change constantly. "We need a phone number on customers." "Prices need more decimal places." "Rename `on_sale` to `is_on_sale` to match the others." Every one of those is an `ALTER TABLE`, run while the data stays put.

In a team, these changes are written as scripts and run in order on every copy of the database. Those scripts are called **migrations**, and [chapter 41](../41-migrations/notes.md) is about them. `ALTER TABLE` is what's inside.

## Real-world example

Renovating a house **while people live in it**:

| Renovation | `ALTER TABLE` |
|---|---|
| Add a room | `ADD COLUMN` |
| Knock a room down (and everything in it is gone) | `DROP COLUMN` |
| Put a new name on the door | `RENAME` |
| Rewire a room, carefully, with the lights still on | `ALTER COLUMN ... TYPE` |
| Add a house rule: "no shoes indoors" | `ADD CONSTRAINT` |

Some renovations are trivial (an empty new room). Some need care (rewiring a room that's in use). PostgreSQL will tell you which is which, by refusing anything that would break the existing data.

## How it works

Work in `practice`, on the 9-row `books` table from [chapter 06](../06-adding-data/notes.md). If yours has changed, recreate it with the chapter 06 statements. Run `\pset null '[NULL]'`.

### Adding a column

```sql
ALTER TABLE books ADD COLUMN pages integer;
```

```
ALTER TABLE
```

Every existing row now has a `pages` column, holding NULL, because nothing was there before. Fill it with `UPDATE`:

```sql
UPDATE books SET pages = 310 WHERE id = 1;
```

### Adding a column that can't be NULL

```sql
ALTER TABLE books ADD COLUMN is_read boolean NOT NULL;
```

```
ERROR:  column "is_read" of relation "books" contains null values
```

PostgreSQL can't add a required column to 9 existing rows without knowing what to put in it. Give it a default:

```sql
ALTER TABLE books ADD COLUMN is_read boolean NOT NULL DEFAULT false;
```

Now every existing row gets `false`, and the rule holds. This is the normal way to add a required column to a table that already has rows.

The other way, when the right value differs per row: add it nullable, fill it with `UPDATE`s, then lock it down with `SET NOT NULL` (below).

### Removing a column

```sql
ALTER TABLE books DROP COLUMN pages;
```

Gone, and so is every value that was in it. No undo, unless you're inside a transaction (keep reading).

### Renaming

```sql
ALTER TABLE books RENAME COLUMN year TO published_year;
ALTER TABLE books RENAME TO my_books;
ALTER TABLE my_books RENAME TO books;
```

Renaming is instant and safe for the data. It's **not** safe for everything that uses the old name: your saved `.sql` files, your future apps. Any query that says `year` is now broken. Renaming is a decision to go and update those too.

(Keep the column as `published_year` for the rest of this chapter. It's a better name anyway.)

### Changing a column's type

Some changes PostgreSQL can do on its own, because every value converts cleanly:

```sql
ALTER TABLE books ALTER COLUMN published_year TYPE smallint;    -- all years fit
ALTER TABLE books ALTER COLUMN published_year TYPE text;        -- numbers become text
```

Going back is harder. Text to number isn't automatic, because text *might* contain `'hello'`:

```sql
ALTER TABLE books ALTER COLUMN published_year TYPE integer;
```

```
ERROR:  column "published_year" cannot be cast automatically to type integer
HINT:  You might need to specify "USING published_year::integer".
```

The hint tells you what to do. `USING` says *how* to convert each existing value:

```sql
ALTER TABLE books ALTER COLUMN published_year TYPE integer USING published_year::integer;
```

If any value can't convert, the whole `ALTER` fails and nothing changes. That's the lights-on rewiring: PostgreSQL won't leave you half done.

Widening is always easy (`numeric(10, 2)` to `numeric(12, 2)`, `integer` to `bigint`). Narrowing fails if any value won't fit.

### Defaults and `NOT NULL` on existing columns

```sql
ALTER TABLE books ALTER COLUMN author SET DEFAULT 'Unknown';
ALTER TABLE books ALTER COLUMN author DROP DEFAULT;
```

Defaults only affect **future** inserts. Existing rows don't change.

```sql
ALTER TABLE books ALTER COLUMN author SET NOT NULL;
```

```
ERROR:  column "author" of relation "books" contains null values
```

*Beowulf* has no author. Same story as before: the data must already obey the rule. Fix the data, then add the rule:

```sql
UPDATE books SET author = 'Unknown' WHERE author IS NULL;
ALTER TABLE books ALTER COLUMN author SET NOT NULL;
```

And the reverse, `DROP NOT NULL`, always works.

### Adding and removing constraints

```sql
ALTER TABLE books ADD CONSTRAINT year_is_sensible
  CHECK (published_year BETWEEN 1 AND 2100);
```

Existing rows are checked. If one fails:

```
ERROR:  check constraint "year_is_sensible" of relation "books" is violated by some row
```

Clean the data first, then try again. To remove a rule, use its name:

```sql
ALTER TABLE books DROP CONSTRAINT year_is_sensible;
```

You can see constraint names with `\d books`. Automatic names look like `books_title_key` or `books_published_year_check`.

`UNIQUE` works the same way:

```sql
ALTER TABLE books ADD CONSTRAINT books_title_key UNIQUE (title);
```

### Several changes in one statement

Separate actions with commas:

```sql
ALTER TABLE books
  ADD COLUMN pages integer,
  ADD COLUMN isbn text,
  ALTER COLUMN is_read SET DEFAULT true;
```

Either all of them happen or none do.

### A PostgreSQL superpower: structure changes can be rolled back

In many databases, `ALTER TABLE` and `DROP TABLE` are permanent the instant you press Enter. In PostgreSQL, they obey transactions:

```sql
BEGIN;
ALTER TABLE books DROP COLUMN is_read;
\d books                      -- is_read is gone
ROLLBACK;
\d books                      -- is_read is back, data and all
```

This is a big deal. **Every risky `ALTER` should start with `BEGIN;`.** Make the change, look at `\d` and a `SELECT`, and only `COMMIT` when it's right.

### The three ways to remove things

| Command | What goes | What stays | Undo? |
|---|---|---|---|
| `DELETE FROM t WHERE ...` | Some rows | Table, structure, other rows | Only inside a transaction |
| `TRUNCATE t` | All rows | Empty table, structure | Only inside a transaction |
| `DROP COLUMN c` | One column and all its values | The rest of the table | Only inside a transaction |
| `DROP TABLE t` | Everything | Nothing | Only inside a transaction |

`DROP TABLE` has one extra: if another table points at this one (next chapter), PostgreSQL refuses, and you'll need `DROP TABLE t CASCADE` to take the dependents down with it. More on that in [chapter 16](../16-relationships-and-foreign-keys/notes.md).

### The recipe for a safe change

1. **Write the `ALTER` in a `.sql` file**, not straight into psql. You'll want it again on the next copy of the database.
2. `BEGIN;`
3. Run the file.
4. Check: `\d table`, and a `SELECT` on the affected column.
5. `COMMIT;` if it's right, `ROLLBACK;` if not.

That file is your first migration. In chapter 41 you'll learn how teams number and track them.

### In pgAdmin

Right-click a table → **Properties** → **Columns** tab. You can add, remove, and rename columns with clicks, and the **SQL** tab shows the `ALTER TABLE` it's about to run. It's a good way to check your understanding of the syntax. But for anything that matters, write the SQL yourself, in a file, inside a transaction.

## Common mistakes

**1. `DROP COLUMN` outside a transaction**

The data is gone. A `BEGIN` costs nothing and gives you a way back.

**2. Adding a `NOT NULL` column with no `DEFAULT` to a full table**

Fails every time. Add a default, or add nullable and fill it first.

**3. Renaming and forgetting who uses the old name**

The `ALTER` works. Your `queries.sql` from chapter 11 and your future app code break. Search your files for the old name before you rename.

**4. Type change without `USING`**

Read the `HINT`. It usually hands you the exact `USING` you need.

**5. Changing the table and not saving the statement**

The database on your laptop now differs from the one in your files. Next time you rebuild from `schema.sql`, the change is missing. Every `ALTER` goes in a file.

**6. Confusing `DROP COLUMN` with `DELETE`**

`DELETE` removes rows (data). `DROP COLUMN` removes a column (structure, and the data in it). Very different sizes of mistake.

## Quick recap

- `ALTER TABLE t ADD COLUMN c type` adds a column; existing rows get NULL, or the `DEFAULT` if you give one.
- `DROP COLUMN`, `RENAME COLUMN a TO b`, `RENAME TO`, `ALTER COLUMN c TYPE t [USING ...]`, `SET/DROP DEFAULT`, `SET/DROP NOT NULL`, `ADD/DROP CONSTRAINT`.
- **Existing data must already obey any new rule**, or the `ALTER` is refused. Clean, then constrain.
- In PostgreSQL, structure changes **can be rolled back**. Wrap every risky `ALTER` in `BEGIN` ... `COMMIT`/`ROLLBACK`.
- `DELETE` removes rows, `TRUNCATE` empties, `DROP COLUMN` removes a column, `DROP TABLE` removes everything.
- Save every `ALTER` in a file. That's a migration.

---

**Next:** try the [exercises](exercises.md), then move on to [16 Relationships and Foreign Keys](../16-relationships-and-foreign-keys/notes.md).
