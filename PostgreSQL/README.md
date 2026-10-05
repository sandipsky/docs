# PostgreSQL: Storing and Finding Data

A **database** is an organized place to keep information so you can find it again quickly. Think of a well-run library, where every book has its place and you can find any one in seconds.

**PostgreSQL** (say "post-gres-Q-L", or just "Postgres") is a program that runs databases. It's free, it's **open source** (its code is public, so anyone can use it and check how it works), and it's one of the most popular databases in the world.

You talk to PostgreSQL in a language called **SQL** (Structured Query Language; say "S-Q-L" or "sequel"). Picture PostgreSQL as a librarian. SQL is the language you use to ask the librarian for things.

This course takes you from "what is a database?" all the way to designing, protecting, and connecting databases for real apps. There are 44 chapters in five levels. They go in order, and each one builds on the ones before it.

**Before you start:** nothing! This course assumes you've never touched a database. You don't need to know any programming language for Levels 1 to 4 either. SQL is its own small language, and you'll learn it from scratch here.

## Start here: five words to know

You'll meet these words in every chapter. Chapters 01 and 02 explain them properly, so don't worry if they feel fuzzy right now.

| Word | What it means | Everyday comparison |
| --- | --- | --- |
| **Database** | An organized collection of information | A filing cabinet |
| **Table** | A group of similar things, laid out in rows and columns | One drawer in the cabinet, or one sheet in a spreadsheet |
| **Row** | One single item in a table | One card in the drawer, like one book |
| **Column** | One detail that every row has | A heading printed on every card, like "Title" |
| **Query** | A question or instruction you send to the database | Asking the librarian for something |

Here's a tiny table called `books`. It has 3 rows and 4 columns:

| id | title | author | year |
| --- | --- | --- | --- |
| 1 | The Hobbit | J.R.R. Tolkien | 1937 |
| 2 | Matilda | Roald Dahl | 1988 |
| 3 | Dune | Frank Herbert | 1965 |

And here's a SQL query that asks it a question:

```sql
-- "Give me the title of every book written before 1950."
SELECT title FROM books WHERE year < 1950;
```

The answer is `The Hobbit`. You don't need to understand this yet. Just notice that SQL reads almost like English: *select the title from books where the year is less than 1950.*

## How to use this folder

1. **Read** the chapter's `notes.md`.
2. **Type every query yourself** in psql or pgAdmin (both set up in chapter 03). Don't copy and paste. Typing is how it sticks.
3. **Do the exercises** in `exercises.md`. Try on your own before you open a hint.
4. **Ask Claude to check your work** when you're done or stuck.
5. **Tick the chapter off** below (change `[ ]` to `[x]`).

**What you need:** your computer and PostgreSQL, which is free. Chapter 03 installs it, along with two tools for talking to it: **psql** (you type commands in a terminal) and **pgAdmin** (you click around in a window). VS Code is handy for saving your queries in `.sql` files.

**You can't break anything important.** Your practice databases live only on your computer. If something goes wrong, you can delete the database and start again. Making mistakes is part of learning.

**Versions:** this course is written for PostgreSQL 18 or newer. A new version comes out about once a year, but the basics of SQL almost never change, so any recent version will work. When a chapter uses a newer feature, it will say so.

**Projects:** five chapters are projects where you build something real. Some come with a `starter/` folder holding a `.sql` file that fills your database with sample data, so you can get straight to the interesting part.

---

## Level 1: The Basics

*Goal: understand what a database is, and store, find, change, and delete data in a single table.*

Chapters 01 and 02 need no setup at all. They're just reading and thinking.

- [ ] [01 What Is a Database?](01-what-is-a-database/notes.md): why apps need one, and why a spreadsheet isn't enough
- [ ] [02 Tables, Rows and Columns](02-tables-rows-and-columns/notes.md): how a database organizes information, with no code yet
- [ ] [03 Installing PostgreSQL](03-installing-postgresql/notes.md): setting it up, and meeting psql and pgAdmin
- [ ] [04 Your First Database](04-your-first-database/notes.md): creating a database and finding your way around in psql
- [ ] [05 Your First Table](05-your-first-table/notes.md): `CREATE TABLE`, and a first look at data types (what kind of value each column holds)
- [ ] [06 Adding Data](06-adding-data/notes.md): putting rows into a table with `INSERT`
- [ ] [07 Reading Data](07-reading-data/notes.md): getting rows back out with `SELECT`
- [ ] [08 Filtering Rows](08-filtering-rows/notes.md): `WHERE`, `AND`, `OR`, and `NULL` (the database's way of saying "unknown")
- [ ] [09 Sorting and Limiting](09-sorting-and-limiting/notes.md): `ORDER BY`, `LIMIT`, and removing duplicates with `DISTINCT`
- [ ] [10 Changing and Deleting Data](10-changing-and-deleting-data/notes.md): `UPDATE`, `DELETE`, and why forgetting `WHERE` is dangerous
- [ ] [11 Project: My Book Collection](11-project-my-book-collection/notes.md): create, fill, search, and tidy up a table of your own books

## Level 2: Designing Good Tables

*Goal: plan tables that keep your data clean, and link them together.*

- [ ] [12 Data Types in Depth](12-data-types-in-depth/notes.md): text, numbers, money, dates and times, true/false, and picking the right one
- [ ] [13 Constraints](13-constraints/notes.md): rules that stop bad data getting in (`NOT NULL`, `UNIQUE`, `CHECK`, `DEFAULT`)
- [ ] [14 Primary Keys](14-primary-keys/notes.md): giving every row its own ID, like a passport number
- [ ] [15 Changing a Table's Shape](15-changing-a-tables-shape/notes.md): adding and removing columns with `ALTER TABLE`, and deleting tables with `DROP TABLE`
- [ ] [16 Relationships and Foreign Keys](16-relationships-and-foreign-keys/notes.md): linking tables together, like customers and their orders
- [ ] [17 Many-to-Many Relationships](17-many-to-many-relationships/notes.md): when both sides can have many, like students and classes
- [ ] [18 Normalization](18-normalization/notes.md): organizing tables so the same fact is never stored twice
- [ ] [19 Project: Online Shop Database](19-project-online-shop-database/notes.md): design customers, products, and orders from scratch, and draw it as a diagram

## Level 3: Asking Better Questions

*Goal: answer real questions by combining, counting, and summarizing data across many tables.*

- [ ] [20 Counting and Totals](20-counting-and-totals/notes.md): `COUNT`, `SUM`, `AVG`, `MIN`, and `MAX`
- [ ] [21 Grouping](21-grouping/notes.md): totals for each group with `GROUP BY`, and filtering groups with `HAVING`
- [ ] [22 Joins](22-joins/notes.md): combining two tables into one answer with `INNER JOIN`
- [ ] [23 Outer Joins](23-outer-joins/notes.md): `LEFT JOIN` and friends, and finding things with no match (like customers who never ordered)
- [ ] [24 Handy Built-in Functions](24-built-in-functions/notes.md): working with text, numbers, and dates, plus `CASE` and `COALESCE`
- [ ] [25 Subqueries](25-subqueries/notes.md): a question inside a question
- [ ] [26 Common Table Expressions](26-common-table-expressions/notes.md): breaking a big query into small, named steps with `WITH`
- [ ] [27 Combining Results](27-combining-results/notes.md): stacking answers together with `UNION`, `INTERSECT`, and `EXCEPT`
- [ ] [28 Window Functions](28-window-functions/notes.md): rankings, running totals, and "top 3 in each group"
- [ ] [29 Project: Sales Report](29-project-sales-report/notes.md): answer real business questions, like "who are our top 10 customers?"

## Level 4: Keeping Data Safe and Fast

*Goal: protect your data from mistakes, crashes, and strangers, and keep queries fast as your data grows.*

- [ ] [30 Transactions](30-transactions/notes.md): all-or-nothing changes, so money never vanishes halfway through a transfer
- [ ] [31 Indexes](31-indexes/notes.md): finding rows fast, just like the index at the back of a book
- [ ] [32 Why Is My Query Slow?](32-why-is-my-query-slow/notes.md): asking PostgreSQL how it runs your query with `EXPLAIN`
- [ ] [33 Views](33-views/notes.md): saving a query and using it like a table
- [ ] [34 Users, Roles and Permissions](34-users-roles-and-permissions/notes.md): deciding who can see and change what
- [ ] [35 Backup and Restore](35-backup-and-restore/notes.md): making copies of your database, and getting it back when things go wrong
- [ ] [36 Project: Bank Account System](36-project-bank-account-system/notes.md): safe transfers, rules that block bad data, and limited access

## Level 5: PostgreSQL in Real Apps

*Goal: use PostgreSQL's special features, and connect it to the apps you build.*

**Before chapter 40:** you'll need the [JavaScript course](../JavaScript/README.md) up to [Node.js Basics](../JavaScript/49-nodejs-basics/notes.md) (chapter 49), and the [TypeScript course](../TypeScript/README.md). From chapter 40 on, you'll write code that talks to your database.

- [ ] [37 JSON and Arrays](37-json-and-arrays/notes.md): storing flexible, nested data (like JavaScript objects) inside a column
- [ ] [38 Functions and Triggers](38-functions-and-triggers/notes.md): code that lives inside the database and can run automatically
- [ ] [39 Full-Text Search](39-full-text-search/notes.md): building a search box that finds words, not just exact matches
- [ ] [40 Connecting from Node.js](40-connecting-from-nodejs/notes.md): running queries from your own code, and stopping SQL injection (a common way attackers break in)
- [ ] [41 Migrations](41-migrations/notes.md): saving every change to your tables as a file, so every copy of the database stays in step
- [ ] [42 ORMs](42-orms/notes.md): tools like Prisma and Drizzle that let you work with the database using TypeScript, and when plain SQL is better
- [ ] [43 PostgreSQL in the Cloud](43-postgresql-in-the-cloud/notes.md): putting your database online so your deployed apps can reach it
- [ ] [44 Final Project](44-final-project/notes.md): design, build, and connect a database for an app of your own (maybe one of your React apps)

---

**After this:** Node.js frameworks (like Express) let you build your own APIs, so your [React](../React/README.md) apps can save and load data from PostgreSQL. That's a complete "full-stack" app, front to back. Other databases like MySQL and SQLite use almost the same SQL, so most of what you learn here carries over.
