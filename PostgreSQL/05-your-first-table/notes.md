# 05 Your First Table

## What is it?

`CREATE TABLE` tells PostgreSQL: "I want a new table called *this*, with *these* columns, and each column holds *this kind* of value."

Those kinds of value are called **data types**. This chapter introduces the four you'll use most. [Chapter 12](../12-data-types-in-depth/notes.md) covers the rest.

## Why does it matter?

In chapter 02 you designed tables on paper. Now you make them real. And unlike a spreadsheet, where a column is just a heading, a database column is a **promise**: "this column will only ever hold whole numbers." PostgreSQL enforces that promise from the moment you create the table.

That's where a lot of the safety comes from. Bad data doesn't get in, because the table's shape won't allow it.

## Real-world example

A table is like a **form** with labeled boxes:

| A paper form | A table |
|---|---|
| The form design: which boxes, what labels | `CREATE TABLE` |
| "Year of birth: [ ][ ][ ][ ]" — four digit boxes | A column with type `integer` |
| A box that says "Name" with a long line | A column with type `text` |
| A tick box | A column with type `boolean` |
| One filled-in copy of the form | One row |

Designing the form is separate from filling it in. `CREATE TABLE` designs it. `INSERT` (next chapter) fills it in.

## How it works

### Creating the table

Connect to `practice` (`\c practice`), and create the `books` table from the last few chapters:

```sql
CREATE TABLE books (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title text,
  author text,
  year integer
);
```

```
CREATE TABLE
```

Let's take it apart:

- `CREATE TABLE books (` ... `);` says "make a table called `books`". The columns go inside the brackets, separated by commas.
- Each column is a **name** followed by a **type**: `title text`, `year integer`.
- The first line is special. Read on.

### The `id` line: a recipe for now

```sql
id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
```

Every table needs a column that identifies each row (chapter 02). This line makes one. In plain English: "a column called `id`, holding whole numbers, that identifies each row, and PostgreSQL fills it in automatically: 1, 2, 3, ..."

You don't need to understand every word of it yet. **Copy this line as the first column of every table you make.** [Chapter 14](../14-primary-keys/notes.md) explains exactly what `PRIMARY KEY` and `IDENTITY` mean. For now, it's a recipe, and the payoff is that you never have to type an id yourself.

### The four types you'll use most

| Type | Holds | Examples |
|---|---|---|
| `text` | Any text, any length | `'The Hobbit'`, `'Kathmandu'`, `''` |
| `integer` | Whole numbers, positive or negative | `1937`, `0`, `-5` |
| `boolean` | `true` or `false` | `true`, `false` |
| `date` | A calendar date | `'2026-09-30'` |

Two things to notice already:

- Text and dates are written inside **single quotes**. Numbers and booleans are not.
- Dates are always written **year-month-day**: `'2026-09-30'`. This is the international standard (ISO 8601), and PostgreSQL will never misread it. `'30/09/2026'` and `'09/30/2026'` are ambiguous, so avoid them.

Money and decimals need a different type (`numeric`), because computers are surprisingly bad at decimals. That's in chapter 12. For now, if you need a price, use `numeric(10, 2)`: up to 10 digits, 2 of them after the point.

### Looking at a table: `\d`

You can't see what you just made. Ask psql to **describe** it:

```
\d books
```

```
                            Table "public.books"
 Column |  Type   | Collation | Nullable |           Default
--------+---------+-----------+----------+------------------------------
 id     | integer |           | not null | generated always as identity
 title  | text    |           |          |
 author | text    |           |          |
 year   | integer |           |          |
Indexes:
    "books_pkey" PRIMARY KEY, btree (id)
```

Reading it:

- One line per column, with its type.
- `Nullable` shows `not null` for `id`: it can never be empty. The others *can* be empty (NULL), because you didn't say otherwise. Chapter 13 shows how to say otherwise.
- `Default` shows how `id` gets its value: automatically.
- The `Indexes` part is bookkeeping for `PRIMARY KEY`. Ignore it until chapter 31.
- `"public.books"`: `public` is the default section inside a database where tables live. Every table you make in this course goes there. You can ignore it.

To list all the tables in the current database:

```
\dt
```

```
        List of relations
 Schema | Name  | Type  |  Owner
--------+-------+-------+----------
 public | books | table | postgres
(1 row)
```

PostgreSQL calls tables "relations" in a few places. Same thing.

In **pgAdmin**, expand your database → Schemas → public → Tables in the tree on the left. Right-click the table and choose **Properties** to see the columns, or **View/Edit Data → All Rows** to see what's in it.

### Naming rules

Table and column names must:

- start with a letter or underscore,
- contain only letters, numbers, and underscores,
- avoid SQL's own words like `select`, `table`, `order`, `user`.

Follow the chapter 02 conventions (lowercase, `snake_case`, plural tables, singular columns) and you'll never have a naming problem.

If you break a rule, PostgreSQL usually tells you at once:

```sql
CREATE TABLE order (id integer);
```

```
ERROR:  syntax error at or near "order"
LINE 1: CREATE TABLE order (id integer);
                     ^
```

`order` is an SQL word (you'll meet `ORDER BY` in chapter 09). Use `orders` instead. Notice how the error points at the exact spot with `^`. PostgreSQL's error messages are good. Read them.

### Deleting a table

```sql
DROP TABLE books;
```

```
DROP TABLE
```

Gone, along with every row in it. No undo. Same as `DROP DATABASE`, just smaller.

Try to create a table that already exists and you get:

```
ERROR:  relation "books" already exists
```

While you're learning, you'll often want to wipe a table and start fresh. Two helpers:

```sql
DROP TABLE IF EXISTS books;   -- no error if it isn't there
CREATE TABLE IF NOT EXISTS books ( ... );   -- no error if it is
```

`IF EXISTS` is handy at the top of a `.sql` file: drop, then create, so the file can be run again and again.

### A second table

Let's make a `tasks` table for a to-do app, using all four types:

```sql
CREATE TABLE tasks (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title text,
  is_done boolean,
  due_date date,
  priority integer
);
```

Then `\dt` shows two tables, and `\d tasks` shows its five columns. That's the whole rhythm: design on paper, `CREATE TABLE`, `\d` to check.

### Creating a table in pgAdmin

You can also click your way there: right-click **Tables → Create → Table**, then fill in the name and add columns on the **Columns** tab. Before you click Save, look at the **SQL** tab. pgAdmin shows you the `CREATE TABLE` statement it's about to run. It's a nice way to check your understanding, but typing the SQL yourself is what makes it stick.

## Common mistakes

**1. Forgetting the commas between columns**

```sql
CREATE TABLE books (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY
  title text
);
```

```
ERROR:  syntax error at or near "title"
```

Every column needs a comma after it, except the last one.

**2. A comma after the last column**

```sql
  year integer,
);
```

```
ERROR:  syntax error at or near ")"
```

The opposite problem. No comma before the closing bracket.

**3. Using a type that doesn't exist**

```sql
title string
```

```
ERROR:  type "string" does not exist
```

It's `text`. Also: `int` works as a short form of `integer`, `bool` for `boolean`. But `string`, `number`, and `varchar` without a length are either wrong or a bad idea.

**4. Spaces or capitals in names**

`CREATE TABLE My Books` fails. `CREATE TABLE "My Books"` works, but now you have to type the double quotes and exact capitals *every time you use it*. Stick to `my_books`.

**5. Forgetting the `id` line**

The table will work, but soon you'll have no way to point at one row. Copy the recipe every time.

## Quick recap

- `CREATE TABLE name ( column type, column type, ... );` makes a table. Commas between columns, none after the last.
- The four everyday types: `text`, `integer`, `boolean`, `date`. Text and dates go in single quotes; dates are `'YYYY-MM-DD'`.
- Start every table with the recipe `id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,` for an automatic row number.
- `\d table_name` describes a table. `\dt` lists all tables.
- `DROP TABLE` deletes a table and everything in it. `IF EXISTS` / `IF NOT EXISTS` make files re-runnable.
- Read error messages. The `^` points at the problem.

---

**Next:** try the [exercises](exercises.md), then move on to [06 Adding Data](../06-adding-data/notes.md).
