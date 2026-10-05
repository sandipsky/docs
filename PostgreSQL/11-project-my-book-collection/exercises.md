# 11 Project: My Book Collection: Exercises

**How to do these:**

- These are extra features for your book collection. Finish all 6 milestones in the notes first.
- Keep working in `playground/ch11/`. After each exercise, the rebuild from Milestone 6 must still work.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to review your files.

---

## Exercise 1 (Easy): A wishlist

You want to track books you *want* but don't own yet. Add a column `is_owned boolean` to your table.

You haven't learned how to add a column to an existing table (that's [chapter 15](../15-changing-a-tables-shape/notes.md)). But you don't need to: edit `schema.sql`, add the column, and **rebuild** with your three `\i` commands. Then add two wishlist books with `is_owned = false`, and write a query that shows only the wishlist.

<details>
<summary>Hint</summary>

If you use the starter data, its `INSERT` doesn't mention `is_owned`, so those rows will get NULL. Think about whether that's what you want, or whether the column should default to `true`. `DEFAULT` is coming in chapter 13, but you can peek: `is_owned boolean DEFAULT true`.

</details>

---

## Exercise 2 (Easy): Recent reads

Write a query showing the books you finished in the **last 90 days**, counting from today, most recent first.

<details>
<summary>Hint</summary>

`current_date - 90` is a date 90 days ago. Compare `finished_on` to it.

</details>

---

## Exercise 3 (Medium): Re-reads

Some books you read more than once. Add a column `times_read integer` (rebuild, as in Exercise 1). Set it to `1` for finished books and `0` for unfinished ones, with two `UPDATE`s.

Then "re-read" one book: bump its `times_read` by one **without** typing the new number yourself, and update its `finished_on` to today, in one statement.

<details>
<summary>Hint</summary>

`SET times_read = times_read + 1` uses the old value. Chapter 10.

</details>

---

## Exercise 4 (Medium): Export to a spreadsheet

psql can write a query's result to a file. This is a psql meta-command, so it goes on **one line** with no semicolon at the end:

```
\copy (SELECT title, author, published_year, rating FROM books ORDER BY title) TO 'C:/Users/YourName/Desktop/books.csv' WITH (FORMAT csv, HEADER)
```

Run it (with your own path), then open `books.csv` in Excel or VS Code. Each row of your table is a line, with commas between values, and the first line is the column names.

Now change the query inside the brackets so the export only includes finished books, best rated first.

<details>
<summary>Hint</summary>

The whole `SELECT` goes inside the brackets, and it can have `WHERE` and `ORDER BY` like any other query. Forward slashes in the path, as always.

</details>

---

## Exercise 5 (Challenge): Reading speed

Add a column `started_on date` (rebuild), and fill it in for your finished books. Make up dates if you have to, but make each one earlier than the book's `finished_on`.

Then write a query showing, for each finished book: `title`, how many **days** it took you, and roughly how many **pages per day** you read. Fastest first.

Two traps to find and solve:

1. Dividing two whole numbers gives a whole number (chapter 03, exercise 2). `320 / 45` is `7`, not `7.1`. How do you get the decimal?
2. A book started and finished on the same day gives `0` days. What happens when you divide by zero? Keep those books out of the result.

<details>
<summary>Hint 1</summary>

`finished_on - started_on` is the number of days, as an integer. To get decimals, turn one side into a decimal first: `pages::numeric / (finished_on - started_on)`. The `::numeric` is a cast, covered in chapter 12.

</details>

<details>
<summary>Hint 2</summary>

`WHERE finished_on > started_on` keeps only books that took at least a day. The result will have many decimal places; chapter 24 has `round()` for that.

</details>
