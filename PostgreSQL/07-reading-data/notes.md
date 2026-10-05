# 07 Reading Data

## What is it?

`SELECT` gets data out of a table. It's the **R** in CRUD: read.

You'll spend more time writing `SELECT` than everything else in SQL put together. This chapter covers the basics: which columns, renaming them, and doing a bit of maths on the way out. The next two chapters add filtering and sorting.

## Why does it matter?

Data you can't get back out is worthless. Every screen in every app is a `SELECT` underneath: your inbox, your order history, a product page, a leaderboard. Learning to ask the database precise questions is *the* core skill of this whole course.

## Real-world example

Asking the librarian:

| You say | SQL |
|---|---|
| "Show me everything about every book." | `SELECT * FROM books;` |
| "Just the titles, please." | `SELECT title FROM books;` |
| "Titles and authors." | `SELECT title, author FROM books;` |
| "And call that column 'Name' on the printout." | `SELECT title AS name FROM books;` |

Important: the librarian brings you a **photocopy**. Reading never changes what's on the shelves. You can `SELECT` all day and nothing in the table moves.

## How it works

You need the `books` table with the 9 rows from [chapter 06](../06-adding-data/notes.md). Run `\pset null '[NULL]'` too.

### Everything: `SELECT *`

```sql
SELECT * FROM books;
```

```
 id |          title          |     author      | year
----+-------------------------+-----------------+------
  1 | The Hobbit              | J.R.R. Tolkien  |   1937
  2 | Matilda                 | Roald Dahl      |   1988
  3 | Dune                    | Frank Herbert   |   1965
  4 | Pride and Prejudice     | Jane Austen     |   1813
  5 | The Martian             | Andy Weir       |   2011
  6 | Charlotte's Web         | E.B. White      |   1952
  7 | Beowulf                 | [NULL]          | [NULL]
  8 | The BFG                 | Roald Dahl      |   1982
  9 | A Brief History of Time | Stephen Hawking |   1988
(9 rows)
```

`*` means "all columns". `FROM books` says which table. You get every row, every column.

The rows came back in `id` order this time. **That's luck, not a promise.** Remember from chapter 02: rows have no fixed order. Chapter 09 shows how to ask for one.

### Just some columns

List the columns you want, separated by commas:

```sql
SELECT title, year FROM books;
```

```
          title          | year
-------------------------+------
 The Hobbit              |   1937
 Matilda                 |   1988
 ...
```

The result has only those two columns, **in the order you listed them**. Swap them (`SELECT year, title`) and the columns swap.

This matters more than it looks. In a real app, a table might have 40 columns, and a screen might need 3. Asking for only what you need is faster and clearer.

### Renaming columns: `AS`

The name in the result doesn't have to match the table:

```sql
SELECT title AS book, year AS published FROM books;
```

```
          book           | published
-------------------------+-----------
 The Hobbit              |      1937
 ...
```

`AS` gives the column an **alias**: a temporary name, just for this result. The table itself is unchanged.

If you want spaces or capitals in an alias, you need double quotes, because now you're naming something:

```sql
SELECT title AS "Book Title" FROM books;
```

This is the one place you'll use double quotes regularly. Notice the rule still holds: double quotes for **names**, single quotes for **values**.

### Doing maths in `SELECT`

You can put an expression where a column goes:

```sql
SELECT title, 2026 - year AS age FROM books;
```

```
          title          | age
-------------------------+-----
 The Hobbit              |  89
 Matilda                 |  38
 Dune                    |  61
 Pride and Prejudice     | 213
 The Martian             |  15
 Charlotte's Web         |  74
 Beowulf                 | [NULL]
 The BFG                 |  44
 A Brief History of Time |  38
(9 rows)
```

Two things to see here:

1. The maths runs **once per row**, using that row's `year`.
2. *Beowulf* has a NULL `year`, so `2026 - NULL` is... NULL. **Anything combined with NULL gives NULL.** "2026 minus I-don't-know" is "I don't know". You'll meet this again in the next chapter.

Without an alias, PostgreSQL labels a calculated column `?column?`. Always give expressions a name with `AS`.

The usual operators work: `+`, `-`, `*`, `/`. One catch from chapter 03's exercise: dividing two whole numbers gives a whole number (`7 / 2` is `3`). Chapter 12 explains why and how to get `3.5`.

### Joining text together: `||`

Two vertical bars glue text end to end:

```sql
SELECT title || ' by ' || author AS description FROM books;
```

```
              description
----------------------------------------
 The Hobbit by J.R.R. Tolkien
 Matilda by Roald Dahl
 Dune by Frank Herbert
 Pride and Prejudice by Jane Austen
 The Martian by Andy Weir
 Charlotte's Web by E.B. White
 [NULL]
 The BFG by Roald Dahl
 A Brief History of Time by Stephen Hawking
(9 rows)
```

Once again NULL spreads: *Beowulf* has a NULL author, so the whole description is NULL. Chapter 24 has a fix (`COALESCE`), but notice the pattern now.

### A first look at functions

A **function** is a ready-made tool that takes a value and gives you something back. You've used two already: `version()` and `now()`. Here are two for text:

```sql
SELECT upper(title) AS shouty, length(title) AS letters FROM books;
```

```
         shouty          | letters
-------------------------+---------
 THE HOBBIT              |      10
 MATILDA                 |       7
 ...
```

`upper()` makes text uppercase. `length()` counts its characters. The value goes inside the brackets. [Chapter 24](../24-built-in-functions/notes.md) is a whole tour of these. For now, just know they exist and that this is what they look like.

### `SELECT` without a table

You've done this since chapter 03:

```sql
SELECT 2 + 2;
SELECT now();
```

No `FROM`, so no rows to work through. PostgreSQL just works out the value once and hands it back. Useful as a calculator and for testing an expression before you use it on real data.

### The result is a temporary table

Every `SELECT` gives you back something shaped like a table: columns and rows. But it's a **result**, not a stored table. It exists only on your screen, and the next query replaces it. Nothing you do in `SELECT` changes the data in `books`.

This idea, "a query gives back a table-shaped answer", becomes powerful later, when you'll feed one query's result into another (chapters 25 and 26).

### Wide results: `\x`

When a table has many columns, rows wrap and become unreadable. Toggle **expanded display**:

```
\x
```

Now each row prints as a vertical list of `column | value`. Type `\x` again to switch back. `\x auto` lets psql decide based on width. pgAdmin's grid doesn't have this problem, which is one reason to keep it around.

## Common mistakes

**1. A missing comma turns a column into an alias**

```sql
SELECT title author FROM books;
```

No error! PostgreSQL reads `title author` as `title AS author` (the `AS` is optional). You get one column of titles, labeled "author". If a column seems to have vanished, look for a missing comma.

**2. Forgetting `FROM`**

```sql
SELECT title;
```

```
ERROR:  column "title" does not exist
```

Without a table, `title` means nothing. "Column does not exist" often means "you forgot which table" or "you misspelled the name".

**3. Double quotes around a value**

```sql
SELECT title || " by " || author FROM books;
```

```
ERROR:  zero-length delimited identifier at or near """"
```

Scary message, simple cause: `" by "` in double quotes is treated as a (badly formed) name. Single quotes for text.

**4. Using `SELECT *` everywhere**

Fine while learning and exploring. In a real app, ask for the columns you need. It's faster, and your code won't break when someone adds a column.

**5. Expecting NULL to behave like zero or empty text**

`2026 - NULL` is NULL, not 2026. `'a' || NULL` is NULL, not `'a'`. NULL means "unknown", and unknown stays unknown.

## Quick recap

- `SELECT columns FROM table;` reads data. `*` means all columns. Reading never changes the table.
- List columns in the order you want them. Rename with `AS alias`. Aliases with spaces need double quotes.
- Any expression can be a column: `2026 - year`, `title || ' by ' || author`, `upper(title)`. Always alias it.
- **NULL spreads:** any calculation involving NULL gives NULL.
- `SELECT` without `FROM` is a calculator. `\x` makes wide results readable in psql.
- The result of a `SELECT` is a temporary table on your screen, not stored anywhere.

---

**Next:** try the [exercises](exercises.md), then move on to [08 Filtering Rows](../08-filtering-rows/notes.md).
