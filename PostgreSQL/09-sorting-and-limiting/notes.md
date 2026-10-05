# 09 Sorting and Limiting

## What is it?

Three small tools that shape your results:

- `ORDER BY` puts rows in an order you choose.
- `LIMIT` gives you only the first few.
- `DISTINCT` removes duplicate rows.

## Why does it matter?

Remember: rows in a table have **no order**. When you ran `SELECT * FROM books` and got the rows in `id` order, that was PostgreSQL being convenient, not making a promise. Add a row, delete a row, and the order can change.

So any time order matters ("newest first", "cheapest first", "top 10"), you have to ask for it. And most of the time, order matters.

## Real-world example

A results page in an online shop:

| The shop shows | SQL |
|---|---|
| "Sort by: price, low to high" | `ORDER BY price` |
| "Sort by: newest first" | `ORDER BY added_on DESC` |
| "Showing 20 of 3,400 results" | `LIMIT 20` |
| "Page 3" | `LIMIT 20 OFFSET 40` |
| "Filter by brand" dropdown, listing each brand once | `SELECT DISTINCT brand` |

## How it works

You need the 9-row `books` table from [chapter 06](../06-adding-data/notes.md), and `\pset null '[NULL]'`.

### Sorting: `ORDER BY`

```sql
SELECT title, year FROM books ORDER BY year;
```

```
          title          |  year
-------------------------+--------
 Pride and Prejudice     |   1813
 The Hobbit              |   1937
 Charlotte's Web         |   1952
 Dune                    |   1965
 The BFG                 |   1982
 Matilda                 |   1988
 A Brief History of Time |   1988
 The Martian             |   2011
 Beowulf                 | [NULL]
(9 rows)
```

Oldest first. Smallest to largest is the default, called **ascending**. You can say it out loud with `ASC`, but nobody does.

Two things to notice:

1. **NULL came last.** PostgreSQL treats NULL as bigger than everything when sorting ascending.
2. **Matilda and A Brief History of Time both say 1988.** Which comes first? PostgreSQL doesn't promise. Run it again after adding a row and they might swap. A tie is a gap in your instructions.

### Largest first: `DESC`

```sql
SELECT title, year FROM books ORDER BY year DESC;
```

```
          title          |  year
-------------------------+--------
 Beowulf                 | [NULL]
 The Martian             |   2011
 Matilda                 |   1988
 A Brief History of Time |   1988
 ...
```

`DESC` is **descending**: biggest first. And now NULL is at the top, because "bigger than everything" gets flipped too. That's rarely what you want. Tell PostgreSQL where to put them:

```sql
SELECT title, year FROM books ORDER BY year DESC NULLS LAST;
```

`NULLS FIRST` also exists.

### Breaking ties: sort by more than one column

Give a second column to use when the first one is equal:

```sql
SELECT title, year FROM books ORDER BY year DESC NULLS LAST, title;
```

```
          title          | year
-------------------------+------
 The Martian             | 2011
 A Brief History of Time | 1988
 Matilda                 | 1988
 The BFG                 | 1982
 ...
```

Now the two 1988 books are in title order, every time. Read it as "sort by year, newest first; when years match, sort by title A to Z."

Each column gets its own direction. `ORDER BY year DESC, title` means year descending, **title ascending**. `DESC` only applies to the column right before it.

### Sorting text

```sql
SELECT title FROM books ORDER BY title;
```

```
          title
-------------------------
 A Brief History of Time
 Beowulf
 Charlotte's Web
 Dune
 Matilda
 Pride and Prejudice
 The BFG
 The Hobbit
 The Martian
(9 rows)
```

Alphabetical, as you'd hope. Honest note: the fine details (where capital letters go, whether spaces and punctuation count) depend on your computer's language settings, which PostgreSQL picked up during install. It's called the **collation**. For everyday use you won't notice. If a sort ever looks slightly odd, that's why.

One real gotcha: numbers stored as **text** sort as text. `'10'` comes before `'9'`, because `'1'` comes before `'9'`. That's one more reason to give columns the right type.

### Sorting by something you calculated

You can order by an alias or an expression from your `SELECT`:

```sql
SELECT title, 2026 - year AS age FROM books ORDER BY age DESC NULLS LAST;
```

Or by a column you *aren't* showing:

```sql
SELECT title FROM books ORDER BY year;
```

Both work.

### Only the first few: `LIMIT`

```sql
SELECT title, year FROM books ORDER BY year LIMIT 3;
```

```
        title        | year
---------------------+------
 Pride and Prejudice | 1813
 The Hobbit          | 1937
 Charlotte's Web     | 1952
(3 rows)
```

The three oldest books. `LIMIT` goes last, after `ORDER BY`.

**`LIMIT` without `ORDER BY` means "any 3 rows"**, in whatever order PostgreSQL happens to find them. Sometimes that's fine ("show me a few rows so I can see what this table looks like"). But "the 3 cheapest" or "the 10 newest" always need an `ORDER BY`.

### Skipping some: `OFFSET`

```sql
SELECT title, year FROM books ORDER BY year, title LIMIT 3 OFFSET 3;
```

```
          title          | year
-------------------------+------
 Dune                    | 1965
 The BFG                 | 1982
 A Brief History of Time | 1988
(3 rows)
```

`OFFSET 3` skips the first 3, then `LIMIT 3` takes the next 3. Books 4, 5 and 6. This is how apps do **pages**: page 1 is `LIMIT 20`, page 2 is `LIMIT 20 OFFSET 20`, page 3 is `LIMIT 20 OFFSET 40`.

Notice the `, title` tie-breaker. Without it, the two 1988 books could land on different pages on different days.

### Removing duplicates: `DISTINCT`

```sql
SELECT author FROM books;
```

lists Roald Dahl twice. If you want each author once:

```sql
SELECT DISTINCT author FROM books ORDER BY author;
```

```
     author
-----------------
 Andy Weir
 E.B. White
 Frank Herbert
 J.R.R. Tolkien
 Jane Austen
 Roald Dahl
 Stephen Hawking
 [NULL]
(8 rows)
```

8 rows: 7 authors plus NULL, which `DISTINCT` treats as one value.

With several columns, `DISTINCT` removes rows where the **whole combination** repeats:

```sql
SELECT DISTINCT author, year FROM books;
```

Roald Dahl appears twice here (1988 and 1982), because those are different combinations.

### The order of the clauses

Every part has a fixed place. You can leave parts out, but you can't rearrange them:

```sql
SELECT   DISTINCT title, year      -- 1. which columns (DISTINCT goes right after SELECT)
FROM     books                     -- 2. which table
WHERE    year IS NOT NULL          -- 3. which rows
ORDER BY year DESC, title          -- 4. in what order
LIMIT    5 OFFSET 0;               -- 5. how many
```

Say it as a sentence: *select these columns, from this table, where this is true, ordered like this, only this many.*

## Common mistakes

**1. `LIMIT` without `ORDER BY`**

"The 5 most expensive products" with `LIMIT 5` but no `ORDER BY price DESC` gives 5 random products. No error, wrong answer.

**2. Clauses in the wrong order**

```sql
SELECT title FROM books ORDER BY year WHERE year > 1950;
```

```
ERROR:  syntax error at or near "WHERE"
```

`WHERE` always comes before `ORDER BY`.

**3. Expecting `DESC` to apply to every column**

`ORDER BY year, title DESC` sorts year **ascending** and title descending. Put the direction after each column that needs it.

**4. Forgetting about NULL**

Sorting descending puts NULLs first. Add `NULLS LAST` when a column can be empty.

**5. Ties**

If two rows can have the same value in your sort column, add a tie-breaker (usually `id` or a name). Otherwise the order can change between runs, which is a nasty bug in a paginated list.

## Quick recap

- Rows have no natural order. **Always `ORDER BY`** when order matters.
- `ORDER BY col` is ascending. `DESC` flips it. Add more columns to break ties: `ORDER BY year DESC, title`.
- NULLs sort last ascending, first descending. Control it with `NULLS LAST` / `NULLS FIRST`.
- `LIMIT n` takes the first n rows. `OFFSET m` skips m first. Together they make pages. Both need `ORDER BY` to mean anything.
- `DISTINCT` removes duplicate rows (whole-row duplicates, when you list several columns).
- Clause order: `SELECT`, `FROM`, `WHERE`, `ORDER BY`, `LIMIT`/`OFFSET`.

---

**Next:** try the [exercises](exercises.md), then move on to [10 Changing and Deleting Data](../10-changing-and-deleting-data/notes.md).
