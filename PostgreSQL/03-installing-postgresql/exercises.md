# 03 Installing PostgreSQL: Exercises

**How to do these:**

- These make sure your setup works and get your fingers used to psql. There's nothing to save this time.
- Try on your own first. Only open a hint if you've been stuck for a while.
- If anything doesn't work, tell Claude exactly what you typed and what appeared on screen.

---

## Exercise 1 (Easy): In and out

1. Open SQL Shell (psql) and connect with all the defaults.
2. Run `SELECT version();` and read which version you have.
3. Quit with `\q`.
4. Open it again and connect again. This should feel boring by the third time. That's the goal.

---

## Exercise 2 (Easy): The database does maths

In psql, run each of these and look at the answers:

```sql
SELECT 10 * 5;
SELECT 100 / 8;
SELECT 100 / 8.0;
```

One of those answers might surprise you. Write down which one, and your guess at why. (You'll get the real explanation in [chapter 12](../12-data-types-in-depth/notes.md).)

<details>
<summary>Hint</summary>

Compare the last two. What's different about `8` and `8.0`?

</details>

---

## Exercise 3 (Easy): The semicolon trap

On purpose, type `SELECT 1 + 1` **without** a semicolon and press Enter.

1. What does the prompt look like now?
2. Type `;` and press Enter. What happens?

Getting stuck like this will happen to you by accident many times. Now you know how to get out.

---

## Exercise 4 (Medium): Text and time

Run these:

```sql
SELECT 'Hello, database!';
SELECT now();
SELECT current_date;
```

Notice that text goes inside **single quotes** `'...'`. Now try it with double quotes:

```sql
SELECT "Hello, database!";
```

You'll get an error. Copy the first line of the error into your notes. In [chapter 06](../06-adding-data/notes.md), you'll learn exactly why single and double quotes mean different things in SQL.

<details>
<summary>Hint</summary>

Errors in PostgreSQL always start with `ERROR:`. Read the whole line. It usually tells you what it *thought* you meant.

</details>

---

## Exercise 5 (Medium): The same thing in pgAdmin

1. Open pgAdmin, connect to your server, and open the Query Tool on the `postgres` database.
2. Run `SELECT now();` there.
3. Run `SELECT 'psql' AS client;` in psql, and `SELECT 'pgAdmin' AS client;` in pgAdmin. Look at how each one shows the result.

Which do you prefer for reading results? There's no right answer. You'll use both.
