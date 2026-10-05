# 06 Adding Data

## What is it?

`INSERT` puts a new row into a table. It's the **C** in CRUD: create.

## Why does it matter?

An empty table is a form nobody has filled in. Every sign-up, every order, every saved message in every app you've used was an `INSERT`. It's also where you first see PostgreSQL *checking* your data against the column types, and refusing what doesn't fit.

## Real-world example

Filling in one copy of the form from chapter 05:

| Paper form | SQL |
|---|---|
| Pick up a blank `books` form | `INSERT INTO books` |
| Which boxes you're filling in | `(title, author, year)` |
| What you write in them, in the same order | `VALUES ('The Hobbit', 'J.R.R. Tolkien', 1937)` |
| Hand it in | `;` |
| The clerk stamps a number on it | `id` gets filled in for you |

## How it works

Make sure you have the `books` table from [chapter 05](../05-your-first-table/notes.md), empty. If you're not sure, recreate it:

```sql
DROP TABLE IF EXISTS books;

CREATE TABLE books (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title text,
  author text,
  year integer
);
```

### Inserting one row

```sql
INSERT INTO books (title, author, year)
VALUES ('The Hobbit', 'J.R.R. Tolkien', 1937);
```

```
INSERT 0 1
```

The reply means "1 row inserted". (The `0` is a leftover from old versions of PostgreSQL. Ignore it.)

Read the statement in two halves:

1. `INSERT INTO books (title, author, year)`: which table, and which columns you're giving values for.
2. `VALUES ('The Hobbit', 'J.R.R. Tolkien', 1937)`: the values, **in the same order** as the columns.

The first column matches the first value, the second the second, and so on. Three columns, three values.

You didn't mention `id`. PostgreSQL filled it in: this row is number 1.

### Peeking at the table

You'll learn `SELECT` properly next chapter, but you need a way to see what you've done. This shows every row:

```sql
SELECT * FROM books;
```

```
 id |   title    |     author     | year
----+------------+----------------+------
  1 | The Hobbit | J.R.R. Tolkien | 1937
(1 row)
```

There it is, with its automatic `id`.

### Inserting several rows at once

Put more brackets after `VALUES`, separated by commas:

```sql
INSERT INTO books (title, author, year)
VALUES
  ('Matilda', 'Roald Dahl', 1988),
  ('Dune', 'Frank Herbert', 1965),
  ('Pride and Prejudice', 'Jane Austen', 1813),
  ('The Martian', 'Andy Weir', 2011);
```

```
INSERT 0 4
```

Four rows in one go. This is faster than four separate statements, and easier to read. Note the commas *between* the bracket groups and none after the last one, the same rule as columns in `CREATE TABLE`.

### Quotes: single for values, double for names

This trips up everyone, so let's be very clear:

- **Single quotes `'...'`** wrap a **value**: `'The Hobbit'`, `'2026-09-30'`.
- **Double quotes `"..."`** wrap a **name** (a table or column). You almost never need them.

Get it backwards and PostgreSQL thinks your book title is a column name:

```sql
INSERT INTO books (title) VALUES ("Dune");
```

```
ERROR:  column "Dune" does not exist
LINE 1: INSERT INTO books (title) VALUES ("Dune");
                                          ^
```

That's the error from chapter 03's exercise 4, explained. Values get single quotes. Always.

Numbers and booleans don't need quotes at all: `1937`, `true`. Wrapping a number in quotes usually still works (PostgreSQL converts `'1937'` to a number), but it's a habit worth avoiding, because it hides mistakes.

### Text with an apostrophe in it

If a value contains a single quote, like *Charlotte's Web*, write the quote **twice**:

```sql
INSERT INTO books (title, author, year)
VALUES ('Charlotte''s Web', 'E.B. White', 1952);
```

Two single quotes in a row, `''`, mean "one real apostrophe inside the text". It's not a double-quote character. It's stored as `Charlotte's Web`, with one apostrophe.

If you forget, the prompt turns into `practice'#`, waiting for the closing quote. Ctrl+C, then fix it.

### Leaving columns out: NULL

You don't have to give every column a value. *Beowulf* is a poem with no known author and no known year:

```sql
INSERT INTO books (title) VALUES ('Beowulf');
```

The columns you didn't mention get **NULL**, the "no value" marker from chapter 02.

```sql
SELECT * FROM books;
```

```
 id |        title        |     author     | year
----+---------------------+----------------+------
  1 | The Hobbit          | J.R.R. Tolkien | 1937
  2 | Matilda             | Roald Dahl     | 1988
  3 | Dune                | Frank Herbert  | 1965
  4 | Pride and Prejudice | Jane Austen    | 1813
  5 | The Martian         | Andy Weir      | 2011
  6 | Charlotte's Web     | E.B. White     | 1952
  7 | Beowulf             |                |
(7 rows)
```

psql shows NULL as an empty space, which is easy to miss and easy to confuse with empty text. Make it visible:

```
\pset null '[NULL]'
```

Now the `Beowulf` row shows `[NULL]` in both empty cells. This setting lasts until you quit psql. It's worth typing at the start of every session.

You can also write `NULL` on purpose, as a value. This would have done exactly the same thing (don't run it now, or you'll have two Beowulfs):

```sql
INSERT INTO books (title, author, year) VALUES ('Beowulf', NULL, NULL);
```

`NULL` has no quotes; it's a keyword, not text. Writing it out is useful when you insert several rows at once and only some of them have a missing value.

### Getting the new row back: `RETURNING`

Often you want to know the `id` PostgreSQL just gave you. Add `RETURNING`:

```sql
INSERT INTO books (title, author, year)
VALUES
  ('The BFG', 'Roald Dahl', 1982),
  ('A Brief History of Time', 'Stephen Hawking', 1988)
RETURNING id, title;
```

```
 id |          title
----+-------------------------
  8 | The BFG
  9 | A Brief History of Time
(2 rows)

INSERT 0 2
```

`RETURNING *` gives back every column of the new rows. Apps use this constantly: insert a new order, get its `id` back, show it to the customer.

### When the value doesn't fit

The table's types are promises, and `INSERT` is where PostgreSQL checks them:

```sql
INSERT INTO books (title, author, year)
VALUES ('Emma', 'Jane Austen', 'eighteen fifteen');
```

```
ERROR:  invalid input syntax for type integer: "eighteen fifteen"
LINE 2: VALUES ('Emma', 'Jane Austen', 'eighteen fifteen');
                                       ^
```

Nothing was inserted. The row is rejected as a whole. That's the "someone typed `ten` in the price column" problem from chapter 01, gone for good.

### Trying to set the `id` yourself

```sql
INSERT INTO books (id, title) VALUES (50, 'Emma');
```

```
ERROR:  cannot insert a non-DEFAULT value into column "id"
DETAIL:  Column "id" is an identity column defined as GENERATED ALWAYS.
HINT:  Use OVERRIDING SYSTEM VALUE to override.
```

This is the `id` recipe doing its job. PostgreSQL owns that column. Leave it out of your inserts and let it count.

### Adding rows in pgAdmin

Right-click the table → **View/Edit Data → All Rows**. A grid opens. You can type into the empty last row and press the **Save** (💾) button. Behind the scenes, pgAdmin writes an `INSERT` for you. Handy for a quick fix. But type the SQL yourself while you're learning.

## Common mistakes

**1. Wrong number of values**

```sql
INSERT INTO books (title, author, year) VALUES ('Emma', 'Jane Austen');
```

```
ERROR:  INSERT has more target columns than expressions
```

Three columns named, two values given. Count them. (The opposite, more values than columns, gives `INSERT has more expressions than target columns`.)

**2. Values in the wrong order**

```sql
INSERT INTO books (title, author, year) VALUES ('Jane Austen', 'Emma', 1815);
```

No error, because both are text. But now you have a book called *Jane Austen* by someone named Emma. PostgreSQL can only check types, not meaning. Match your values to your column list carefully.

**3. Skipping the column list**

```sql
INSERT INTO books VALUES ('Emma', 'Jane Austen', 1815);
```

Without a column list, PostgreSQL assumes you mean *every* column in table order, starting with `id`. Here it tries to put `'Emma'` into `id` and fails. Always write the column list. It's clearer, and it keeps working if the table changes later.

**4. Double quotes around text**

Covered above, but it will happen again. `"Dune"` is a column. `'Dune'` is a value.

**5. Confusing NULL with empty text**

`''` (two quotes with nothing between) is empty text: a value that happens to be blank. `NULL` is *no value at all*. They behave differently in chapter 08. If you don't know something, use NULL.

## Quick recap

- `INSERT INTO table (col1, col2) VALUES (val1, val2);` adds a row. Values match columns by position.
- Insert many rows with `VALUES (...), (...), (...)`.
- **Single quotes** for values. **Double quotes** for names. Numbers and booleans have no quotes.
- An apostrophe inside text is written as two single quotes: `'Charlotte''s Web'`.
- Columns you leave out become **NULL**. `\pset null '[NULL]'` makes NULL visible in psql.
- `RETURNING id` hands back the automatic id (or any columns) of the new rows.
- If a value doesn't match the column's type, the whole row is rejected. That's the point.

---

**Next:** try the [exercises](exercises.md), then move on to [07 Reading Data](../07-reading-data/notes.md).
