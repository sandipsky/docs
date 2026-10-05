# My Book Collection: starter data

One file, `books.sql`, with 20 books ready to insert. Use it if you don't want to type your own collection, or if you want more rows to test your queries on. It is data, not a solution: the table design, the queries, and the updates are all yours to write. Follow the milestones in this chapter's [notes.md](../notes.md).

## How to use it

1. Do Milestones 1 and 2 first. Your `books` table must exist before you run this.
2. Make sure your table has **at least** the columns below, with these exact names and types. You can add more columns; the insert leaves them NULL.
3. In psql, connected to `my_books`, run it with `\i` and the full path (forward slashes):

   ```
   \i C:/Users/YourName/Downloads/Projects/Sandip/docs/PostgreSQL/11-project-my-book-collection/starter/books.sql
   ```

4. You should see `INSERT 0 20`.

To start again, run your `schema.sql` (which drops and recreates the table), then this file.

## The columns it expects

| Column | Type | Notes |
|---|---|---|
| `title` | `text` | |
| `author` | `text` | NULL for one book with no known author |
| `published_year` | `integer` | NULL for that same book |
| `pages` | `integer` | |
| `genre` | `text` | one genre per book |
| `rating` | `integer` | 1 to 5, NULL for unread books |
| `is_finished` | `boolean` | |
| `finished_on` | `date` | NULL for unread books |

Your `id` column isn't mentioned in the insert, so PostgreSQL fills it in.

## What's in the data

- 15 finished books with ratings and dates, and 5 unread ones with NULLs, so both kinds of query have something to find.
- Two authors appear twice (Roald Dahl and Andy Weir).
- One title has an apostrophe.
- One book (*Beowulf*) has no known author or year.
- The ratings and dates are made up. They're one reader's imaginary diary, not facts about the books.

## An honest compromise

*The Pragmatic Programmer* has two authors, David Thomas and Andrew Hunt. This table only has room for one, so the file stores the first. That's the "one value per cell" rule from chapter 02 biting for real. The proper fix, a separate `authors` table linked to books, is [chapter 17](../../17-many-to-many-relationships/notes.md). For now, live with it, and notice how it feels wrong. That feeling is good design sense developing.
