# 02 Tables, Rows and Columns

## What is it?

A **table** stores one kind of thing: books, customers, tasks. Each **row** is one of those things. Each **column** is one detail that every row has.

That's nearly all there is to it. Almost everything in a relational database is a table.

Still no setup needed. This chapter is about learning to *see* tables in everyday information, which you'll do on paper.

## Why does it matter?

Before you write any SQL, you need to look at real-world information and see the tables hiding in it. This is the skill that separates people who "know some SQL" from people who can build a database.

Get the tables right, and every question you ask later is easy. Get them wrong, and every question is a fight. So it's worth slowing down here.

## Real-world example

A table is a lot like one sheet in a spreadsheet:

| Spreadsheet | Database |
|---|---|
| One sheet | One table |
| One row | One row |
| A column heading, like "Title" | A column |
| One cell | One value |

But there are some important differences, and they're what make a database more reliable:

1. **Every column has a fixed type.** The `year` column holds whole numbers, always. You can't type `nineteen` into it.
2. **Every row has exactly the same columns.** No row can have an extra cell on the end.
3. **No formatting.** No colors, no merged cells, no formulas. Just data.
4. **Rows have no fixed order.** This surprises people. When you want rows in a certain order, you ask for it when you read them ([chapter 09](../09-sorting-and-limiting/notes.md)).
5. **No empty grid.** A table only has the rows you put in. There's no "row 1000" waiting to be filled.

Another way to picture it: a box of index cards. The box is the table. Each card is a row. The labels printed on every card ("Title:", "Author:") are the columns.

## How it works

### The parts of a table

Here's a table called `books`:

```
             column   column      column           column
               │        │           │                │
               ▼        ▼           ▼                ▼
             ┌────┬────────────┬─────────────────┬──────┐
 header ──►  │ id │ title      │ author          │ year │
             ├────┼────────────┼─────────────────┼──────┤
 row ─────►  │  1 │ The Hobbit │ J.R.R. Tolkien  │ 1937 │
 row ─────►  │  2 │ Matilda    │ Roald Dahl      │ 1988 │
 row ─────►  │  3 │ Dune       │ Frank Herbert   │ 1965 │
             └────┴────────────┴─────────────────┴──────┘
                                        ▲
                                    one value
```

- The table has **4 columns** (`id`, `title`, `author`, `year`) and **3 rows**.
- Each row is one book. Each column is one fact about a book.
- Where a row and a column meet, there's exactly **one value**. `Frank Herbert` is the `author` of row 3.

### One kind of thing per table

The `books` table holds only books. Not books *and* the people who borrowed them *and* the shelves they sit on. Each of those is a different kind of thing, so each gets its own table.

A quick test: can you describe every row with the same sentence? "This row is one book." If some rows would need a different sentence ("this row is a borrower"), you need another table.

### Every column holds one type of value

Look at each column and ask "what kind of value goes here?":

| Column | Kind of value |
|---|---|
| `id` | a whole number |
| `title` | text |
| `author` | text |
| `year` | a whole number |

In [chapter 05](../05-your-first-table/notes.md), you'll tell PostgreSQL these kinds when you create a table. They're called **data types**. Once a column has a type, PostgreSQL refuses anything else. That's how the "someone typed `ten` in the price column" problem from chapter 01 disappears.

### One value per cell

This is the most important rule in this chapter.

Each cell holds **one** value. Not a list. Not "Fantasy, Adventure". Not "555-1234 / 555-9876".

```
 ❌ Don't do this                       ✅ Each cell holds one value
┌────────────┬─────────────────────┐   ┌────────────┬──────────┐
│ title      │ genres              │   │ title      │ genre    │
├────────────┼─────────────────────┤   ├────────────┼──────────┤
│ The Hobbit │ Fantasy, Adventure  │   │ The Hobbit │ Fantasy  │
└────────────┴─────────────────────┘   └────────────┴──────────┘
```

Why? If `genres` holds `Fantasy, Adventure`, then asking "which books are Adventure?" means pulling the text apart, and "how many Fantasy books are there?" becomes a mess. With one value per cell, both questions are a single easy line of SQL.

"But my book really has two genres!" True, and there's a proper way to handle that with a second table. It's [chapter 17](../17-many-to-many-relationships/notes.md). For now, just remember the rule.

### Empty cells: NULL

Sometimes a value is missing. A book you haven't finished has no "date finished". The database has a special marker for this: **NULL**.

NULL means "there's no value here". It's not zero, and it's not empty text. It's the absence of a value, like a blank on a form. You'll learn how to work with it in [chapter 08](../08-filtering-rows/notes.md).

### Every row needs an identity

What if you own two different books both called *Dune*? Or two customers both named Sam Shrestha? You need a way to point at *exactly one row*.

That's what the `id` column is for. Every row gets its own number, and no two rows share one. It's the row's passport number, or a library barcode.

Nearly every table you make will have an `id` column, and PostgreSQL can fill it in for you automatically. [Chapter 14](../14-primary-keys/notes.md) explains the details.

### Naming things

Names matter, because you'll type them hundreds of times. This course uses these conventions:

- **Lowercase, with underscores between words:** `published_year`, not `Published Year` or `publishedYear`. (This style is called **snake_case**, because the words look like they're joined by a snake.)
- **Table names are plural:** `books`, `customers`. A table holds many of them.
- **Column names are singular:** `title`, `email`. Each cell holds one.
- **Letters, numbers, and underscores only.** Start with a letter. No spaces.

Honest note: not every team does it this way. Some use singular table names (`book`). What matters most is picking one style and sticking to it.

### From an app to tables: a worked example

Let's find the tables in a simple to-do app. Here's a method you can use every time:

**Step 1: List the nouns.** What *things* does the app deal with? Looking at a to-do app: tasks. That's it for a simple one.

**Step 2: For each noun, list its details.** A task has: a title, whether it's done, a due date, a priority.

**Step 3: Turn each detail into a column with a type.** Add an `id`.

| Column | Type | Example |
|---|---|---|
| `id` | whole number | 1 |
| `title` | text | Buy milk |
| `is_done` | true or false | false |
| `due_date` | date | 2026-10-03 |
| `priority` | text | high |

**Step 4: Check the rules.** One kind of thing per table? Yes, every row is one task. One value per cell? Yes.

Now suppose the app grows and adds **projects** ("Work", "Home") so tasks can be grouped. "Project" is a new noun, so it gets its own table: `projects` with `id` and `name`. Then each task needs to know which project it belongs to. You'd add a `project_id` column to `tasks` holding the project's `id`. That's a **relationship**, and it's the whole topic of [chapter 16](../16-relationships-and-foreign-keys/notes.md). For now, just notice how a second noun became a second table.

## Common mistakes

**1. Lists in a cell**

`tags = 'urgent, work, email'`. Covered above. One value per cell, always.

**2. A column per item**

`phone_1`, `phone_2`, `phone_3`. What happens when someone has four phones? Or when you want "everyone with this phone number"? This is the list-in-a-cell problem sideways. Same fix: a second table (chapter 16).

**3. Mixing kinds of things in one table**

A `products` table that holds books *and* DVDs *and* games, with columns for `author`, `director`, `platform`, mostly left blank. Sometimes a shared table is fine, but blank columns everywhere are a warning sign. [Chapter 18](../18-normalization/notes.md) gives you a way to decide.

**4. Relying on row order**

"The last row is the newest order." No. Rows have no order you can count on. If you care *when* something happened, store the date in a column.

**5. Storing things you can work out**

Storing `age` goes wrong every birthday. Store `birth_date` and work out the age when you need it. In general, store the facts, and calculate the rest.

## Quick recap

- A **table** holds one kind of thing. A **row** is one of them. A **column** is one detail every row has.
- Every column holds one type of value, and every cell holds exactly **one** value. No lists.
- A missing value is **NULL**: not zero, not empty text, just "nothing here".
- Every row gets an **id**, so you can always point at exactly one row.
- Name things in lowercase with underscores. Tables plural, columns singular.
- To find tables in an app: list the nouns, list each noun's details, turn details into typed columns, then check the rules.

---

**Next:** try the [exercises](exercises.md), then move on to [03 Installing PostgreSQL](../03-installing-postgresql/notes.md).
