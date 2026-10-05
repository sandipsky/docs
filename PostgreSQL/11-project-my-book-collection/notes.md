# 11 Project: My Book Collection

## What you'll build

A database of your own books, and a set of saved queries that answer questions about them: what haven't you read yet, what did you rate highest, what's the longest thing on your shelf.

It's the whole of Level 1 in one go: plan a table, create it, fill it, ask it questions, keep it up to date, and do all of that in files you can re-run from scratch.

By the end, you'll have:

- a `my_books` database with a `books` table you designed yourself,
- at least 15 books in it,
- a `queries.sql` file answering 10 questions about your collection,
- an `updates.sql` file with safe changes,
- a folder you can rebuild with three `\i` commands.

## Before you start

- Finish chapters 01 to 10.
- Make a folder `playground/ch11/`. **Every statement you type in this project goes in a file there**, even the one-liners. That's the point of Milestone 6.
- Look at the [starter folder](starter/README.md). It has 20 ready-made books you can load if you don't want to type your own, or want more data to play with.
- Run `\pset null '[NULL]'` in every psql session.

## Milestone 1: Plan on paper

**Goal:** decide what you want to know about each book, before touching SQL ([chapter 02](../02-tables-rows-and-columns/notes.md)).

Create `playground/ch11/plan.md` and write a table with three columns: **column name**, **type**, **example**. Start from this list and add anything you care about:

- the title and author,
- when it was published, and how long it is,
- what kind of book it is,
- whether you've finished it, when, and what you thought of it (1 to 5).

For each column, ask: **can this be empty?** An unread book has no rating and no finished date. That's NULL, not zero and not `1900-01-01`.

If you plan to use the starter data, your column names need to match the ones listed in the [starter README](starter/README.md). You can add extra columns on top.

<details>
<summary>Hint</summary>

A rating is a whole number. "Finished?" is a `boolean`. "Finished on" is a `date`. "How long" is pages, an `integer`. Genre is `text`, and it's **one** genre per book, for now.

</details>

## Milestone 2: Create the database and table

**Goal:** turn the plan into a real table ([chapters 04](../04-your-first-database/notes.md) and [05](../05-your-first-table/notes.md)).

1. In psql, `CREATE DATABASE my_books;` then `\c my_books`.
2. Create `playground/ch11/schema.sql`. Put your `CREATE TABLE books (...)` in it, with `DROP TABLE IF EXISTS books;` above it, and a comment at the top saying what the file is.
3. Run it with `\i`, then `\d books`.

**Check:** `\d books` shows every column from your plan, with the type you meant. The `id` line is your recipe from chapter 05.

## Milestone 3: Add your books

**Goal:** at least 15 rows ([chapter 06](../06-adding-data/notes.md)).

Two ways, and you can mix them:

- **Your own books.** Create `playground/ch11/my_books.sql` and write the `INSERT`s. Use one multi-row `INSERT` rather than 15 separate ones.
- **The starter books.** Run `\i` on `starter/books.sql` (full path, forward slashes).

Make sure your data has some variety, because the queries in the next milestone need it: some finished books with ratings and dates, some unread ones with NULLs, at least two by the same author, and at least one title with an apostrophe.

**Check:** `SELECT * FROM books;` and read the row count at the bottom. 15 or more.

## Milestone 4: Ask questions

**Goal:** one query per question, saved in `playground/ch11/queries.sql`, each with a comment above it saying which question it answers ([chapters 07](../07-reading-data/notes.md), [08](../08-filtering-rows/notes.md), [09](../09-sorting-and-limiting/notes.md)).

1. Every book, alphabetical by title. Just `title` and `author`.
2. Books you haven't finished.
3. Your **5 highest-rated** finished books, best first. Break ties by title.
4. All books in one genre of your choice, newest first.
5. Books whose author's name contains a word, ignoring case (for example `'weir'`).
6. The **3 longest** books.
7. Books published before 1950. (What happens to a book with an unknown year?)
8. Books you finished in 2026, in the order you finished them.
9. A data check: books that have a rating **but no finished date**, or a finished date but no rating. With clean data this returns nothing, which is the point.
10. One sentence per book, like `The Hobbit by J.R.R. Tolkien (1937)`, for finished books only.

Run the whole file with `\i` and read through the results one by one.

**Check, if you used the starter data:** question 2 gives 5 books. Question 3 gives Dune, Project Hail Mary, The Hobbit, The Name of the Wind, then Educated. Question 6 starts with The Name of the Wind. Question 8 gives 6 books.

<details>
<summary>Hint</summary>

Question 9 is two conditions joined with `OR`, and each condition is itself two things joined with `AND`. Use brackets. Question 10 needs `||`, and unfinished books will produce NULL sentences if you forget the `WHERE`.

</details>

## Milestone 5: Keep it up to date

**Goal:** safe changes, saved in `playground/ch11/updates.sql` ([chapter 10](../10-changing-and-deleting-data/notes.md)).

1. **You finished a book.** Pick an unread one. In a single `UPDATE`, set it to finished, give it a rating, and set the finished date to today (`current_date`). Wrap it in `BEGIN;` ... `COMMIT;`, with a `SELECT` in between to check.
2. **Fix a mistake.** Change one book's genre or year. Use `WHERE id = ...`.
3. **You gave a book away.** Delete it, with `RETURNING title` so you see it go.
4. **Rerun question 2 and question 9** from Milestone 4. Do the results make sense after your changes?

Above each statement, write the `SELECT` you used to check the `WHERE` first, as a comment or as a real statement.

**Check:** every reply says `UPDATE 1` or `DELETE 1`. If you ever see a bigger number, that's a `ROLLBACK` moment.

## Milestone 6: Rebuild from scratch

**Goal:** prove your files are complete.

In psql, connected to `my_books`, run in order:

```
\i .../playground/ch11/schema.sql
\i .../playground/ch11/my_books.sql      (or the starter books.sql)
\i .../playground/ch11/queries.sql
```

If all three run without an error and the queries show sensible results, you have a **reproducible** database: anyone (including you, on a new laptop) can rebuild it from your files. This is how real projects work. The database is disposable; the files are what matter.

If something fails, fix the *file*, not the database, and run all three again.

## Common mistakes

**1. Using 0 or a made-up date for "not yet"**

A rating of `0` for an unread book will show up in "lowest-rated books". A finished date of `1900-01-01` will show up in "books finished before 1950". Use NULL. It exists for exactly this.

**2. Lists in a cell**

`genre = 'Fantasy, Adventure'` breaks question 4. One genre per book for now. Chapter 17 fixes this properly.

**3. Typing straight into psql**

It works, and then it's gone. If it's not in a file, Milestone 6 will fail. Type it in VS Code, run it with `\i`.

**4. Skipping the `SELECT` before an `UPDATE`**

You'll get away with it nine times. The tenth time, you'll change every row. Build the habit while the stakes are low.

**5. Booleans as text**

`is_finished text` with values `'yes'` and `'Yes'` and `'y'`. Then `WHERE is_finished = 'yes'` misses two thirds of your books. Use `boolean`.

## Quick recap

- Plan first: columns, types, and **what can be NULL**.
- `schema.sql` creates, `my_books.sql` fills, `queries.sql` asks. Three files, one `\i` each.
- Variety in your data (NULLs, repeats, apostrophes) is what makes your queries worth testing.
- Every change goes through: `SELECT` first, `BEGIN`, change, check, `COMMIT`.
- If you can rebuild from files, you've done it right.

---

**Congratulations!** You've finished Level 1. 🎉 You can now store, find, change, and delete data in a table, which is more SQL than most people ever learn. Try the [exercises](exercises.md) for extra features, then head back to the [roadmap](../README.md). Level 2 is about designing tables well, and linking them together.
