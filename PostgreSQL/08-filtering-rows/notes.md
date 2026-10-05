# 08 Filtering Rows

## What is it?

`WHERE` picks out only the rows you care about. "Books written before 1950." "Tasks that aren't done." "Products on sale that are in stock."

Without `WHERE`, `SELECT` gives you every row. With it, you get exactly the ones that match your condition.

## Why does it matter?

Real tables have thousands or millions of rows. Nobody wants all of them. Every search box, every filter, every "show me my orders" is a `WHERE`. And it's not only for reading: in chapter 10, `WHERE` decides which rows get changed or deleted, so getting it right really matters.

## Real-world example

Asking the librarian, but with a condition:

| You say | SQL |
|---|---|
| "Every book" | `SELECT * FROM books` |
| "...written before 1950" | `WHERE year < 1950` |
| "...by Roald Dahl" | `WHERE author = 'Roald Dahl'` |
| "...by Dahl, and written after 1985" | `WHERE author = 'Roald Dahl' AND year > 1985` |
| "...whose title starts with The" | `WHERE title LIKE 'The %'` |

The librarian checks each card against your condition. Cards that pass go on the pile. Cards that fail, or where the answer is "can't tell", stay in the drawer.

## How it works

You need the 9-row `books` table from [chapter 06](../06-adding-data/notes.md), and `\pset null '[NULL]'`.

### A simple condition

```sql
SELECT title, year FROM books WHERE year < 1950;
```

```
        title        | year
---------------------+------
 The Hobbit          | 1937
 Pride and Prejudice | 1813
(2 rows)
```

`WHERE year < 1950` is a **condition**: something that's true or false for each row. PostgreSQL checks every row and keeps the ones where it's true.

`WHERE` goes after `FROM`. The order is always `SELECT ... FROM ... WHERE ...`.

### Comparing things

| Operator | Meaning | Example |
|---|---|---|
| `=` | equal to | `author = 'Roald Dahl'` |
| `<>` | not equal to (also written `!=`) | `author <> 'Roald Dahl'` |
| `<` | less than | `year < 1950` |
| `>` | greater than | `year > 2000` |
| `<=` | less than or equal | `year <= 1988` |
| `>=` | greater than or equal | `year >= 1988` |

Note that "equals" is a single `=`. If you've done the JavaScript course, you're used to `===`. Not here.

Text comparisons follow the quote rule from chapter 06: the value goes in single quotes.

```sql
SELECT title FROM books WHERE author = 'Roald Dahl';
```

```
  title
---------
 Matilda
 The BFG
(2 rows)
```

And they are **exact**, including capital letters:

```sql
SELECT title FROM books WHERE author = 'roald dahl';
```

```
 title
-------
(0 rows)
```

Zero rows, no error. `'roald dahl'` and `'Roald Dahl'` are different text. Later in this chapter, `ILIKE` gives you a way to ignore case.

### Combining conditions: `AND`, `OR`, `NOT`

**`AND`**: both must be true.

```sql
SELECT title, year FROM books
WHERE author = 'Roald Dahl' AND year > 1985;
```

```
  title  | year
---------+------
 Matilda | 1988
(1 row)
```

**`OR`**: at least one must be true.

```sql
SELECT title, year FROM books
WHERE year < 1900 OR year > 2000;
```

```
        title        | year
---------------------+------
 Pride and Prejudice | 1813
 The Martian         | 2011
(2 rows)
```

**`NOT`**: flips a condition.

```sql
SELECT title FROM books WHERE NOT author = 'Roald Dahl';
```

That gives 6 rows, not 7. *Beowulf* is missing, even though its author is certainly not Roald Dahl. Hold that thought until the NULL section below.

### Brackets when you mix `AND` and `OR`

`AND` is checked before `OR`, the way multiplication happens before addition. This surprises people:

```sql
-- Means: (Dahl books written after 1985) OR (any Austen book)
WHERE author = 'Roald Dahl' AND year > 1985 OR author = 'Jane Austen'
```

If you meant "Dahl or Austen, but only after 1985", you need brackets:

```sql
WHERE (author = 'Roald Dahl' OR author = 'Jane Austen') AND year > 1985
```

Rule of thumb: **whenever you mix `AND` and `OR`, use brackets.** Even when you don't strictly need them. It makes your intention obvious to the next person, who is usually you next week.

### Ranges: `BETWEEN`

```sql
SELECT title, year FROM books WHERE year BETWEEN 1950 AND 1990;
```

```
          title          | year
-------------------------+------
 Matilda                 | 1988
 Dune                    | 1965
 Charlotte's Web         | 1952
 The BFG                 | 1982
 A Brief History of Time | 1988
(5 rows)
```

`BETWEEN 1950 AND 1990` is the same as `year >= 1950 AND year <= 1990`. Both ends are **included**. It works with dates too: `due_date BETWEEN '2026-10-01' AND '2026-10-31'`.

### Lists: `IN`

Instead of chaining `OR`s:

```sql
SELECT title FROM books WHERE author IN ('Roald Dahl', 'Jane Austen', 'Andy Weir');
```

```
        title
---------------------
 Matilda
 Pride and Prejudice
 The Martian
 The BFG
(4 rows)
```

`IN (...)` means "matches any value in this list". `NOT IN (...)` means none of them.

### Patterns: `LIKE` and `ILIKE`

For "starts with", "ends with", or "contains", use `LIKE` with two special characters:

- `%` matches **any number** of characters, including none.
- `_` matches **exactly one** character.

```sql
SELECT title FROM books WHERE title LIKE 'The %';
```

```
    title
-------------
 The Hobbit
 The Martian
 The BFG
(3 rows)
```

`'The %'` means: `The`, a space, then anything. Some more patterns:

| Pattern | Matches |
|---|---|
| `'The %'` | starts with "The " |
| `'%Time'` | ends with "Time" |
| `'%of%'` | contains "of" anywhere |
| `'D_ne'` | D, any one character, ne: "Dune", "Dane", "Done" |
| `'%'` | anything at all (not very useful) |

`LIKE` is case-sensitive, like `=`. **`ILIKE`** (the I is for "insensitive") ignores case:

```sql
SELECT title FROM books WHERE title LIKE '%the%';    -- 0 rows: no lowercase "the"
SELECT title FROM books WHERE title ILIKE '%the%';   -- 3 rows: The Hobbit, The Martian, The BFG
```

`ILIKE` is a PostgreSQL extra; most other databases don't have it. It's very handy for search boxes.

### Missing values: `IS NULL`

Here's the trap everyone falls into once:

```sql
SELECT title FROM books WHERE year = NULL;
```

```
 title
-------
(0 rows)
```

Zero rows, even though *Beowulf* has a NULL year. Why?

NULL means "unknown". Asking "is this year equal to unknown?" can't be answered yes or no. The answer is itself unknown. And `WHERE` only keeps rows where the condition is **definitely true**. Unknown isn't true, so the row is dropped.

The same thing explains the `NOT author = 'Roald Dahl'` puzzle from earlier. "Is unknown not equal to Roald Dahl?" Unknown. Dropped.

To ask about NULL, use the special words `IS NULL` and `IS NOT NULL`:

```sql
SELECT title FROM books WHERE year IS NULL;
```

```
  title
---------
 Beowulf
(1 row)
```

```sql
SELECT title FROM books WHERE year IS NOT NULL;   -- the other 8
```

Remember this one: **`= NULL` never works. Use `IS NULL`.**

### Filtering on columns you don't show

The `WHERE` is checked against the whole row, before `SELECT` picks which columns to display. So you can filter on `year` and show only `title`:

```sql
SELECT title FROM books WHERE year > 2000;
```

The filter column doesn't have to appear in the result.

### Putting it together

```sql
SELECT title, author, year
FROM books
WHERE (author = 'Roald Dahl' OR title LIKE 'The %')
  AND year IS NOT NULL
  AND year BETWEEN 1930 AND 1990;
```

```
   title    |     author     | year
------------+----------------+------
 The Hobbit | J.R.R. Tolkien | 1937
 Matilda    | Roald Dahl     | 1988
 The BFG    | Roald Dahl     | 1982
(3 rows)
```

Long conditions are easier to read spread over several lines, one condition per line, with `AND`/`OR` at the start of each. PostgreSQL doesn't care about the line breaks.

## Common mistakes

**1. `= NULL`**

Returns nothing, always. Use `IS NULL` or `IS NOT NULL`.

**2. Forgetting the quotes on text**

```sql
WHERE author = Roald Dahl
```

```
ERROR:  syntax error at or near "Dahl"
```

Or worse, `WHERE author = Dahl` gives `column "dahl" does not exist`. Unquoted words are treated as column names.

**3. `AND` when you mean `OR`**

"Show me books by Dahl and Austen" sounds like `AND`, but no single book is by both. You want `author = 'Roald Dahl' OR author = 'Jane Austen'`, or `IN`.

**4. Using `=` with a pattern**

```sql
WHERE title = 'The %'
```

That looks for a book literally called "The %". Patterns only work with `LIKE` and `ILIKE`.

**5. Mixing `AND` and `OR` without brackets**

You'll get rows you didn't expect, with no error. Add brackets.

**6. Case**

`'Dahl'` doesn't match `'dahl'`. Use `ILIKE` when case shouldn't matter, or make sure your data is stored consistently (chapter 13 helps with that).

## Quick recap

- `WHERE condition` keeps only rows where the condition is **true**. It goes after `FROM`.
- Compare with `=`, `<>`, `<`, `>`, `<=`, `>=`. Text comparisons are exact and case-sensitive.
- Combine with `AND`, `OR`, `NOT`. **Use brackets** whenever `AND` and `OR` meet.
- `BETWEEN a AND b` is an inclusive range. `IN (...)` matches a list.
- `LIKE` matches patterns: `%` is anything, `_` is one character. `ILIKE` ignores case.
- NULL is unknown. **`= NULL` never matches.** Use `IS NULL` / `IS NOT NULL`.

---

**Next:** try the [exercises](exercises.md), then move on to [09 Sorting and Limiting](../09-sorting-and-limiting/notes.md).
