# 04 Your First Database: Exercises

**How to do these:**

- Work in psql. Save each answer in `playground/ch04/ex1.sql`, `ex2.sql`, and so on, and run it with `\i`.
- Meta-commands (`\l`, `\c`) can't go in a `.sql` file you run from pgAdmin, but they're fine in a file you run with `\i` in psql.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your work.

---

## Exercise 1 (Easy): Make, list, connect, leave

1. Create a database called `sandbox`.
2. List all databases and confirm it's there.
3. Connect to it. Check the prompt says `sandbox=#`.
4. Connect back to `practice`.

Which of those four steps were SQL, and which were meta-commands?

---

## Exercise 2 (Easy): Clean up

Delete the `sandbox` database.

Then try to delete `practice` **while connected to it**, and read the error. Don't actually delete `practice`. You need it for the rest of the course.

<details>
<summary>Hint</summary>

You can only drop a database you're *not* connected to. Where do you need to be first?

</details>

---

## Exercise 3 (Easy): Escape the trap

Type each of these, exactly as written, one at a time. After each, look at the prompt and work out what psql is waiting for. Then give it what it wants.

1. `SELECT 'hello`
2. `SELECT (1 + 2`
3. `SELECT 5 * 5`

Write down the three different prompts you saw.

<details>
<summary>Hint</summary>

If you get tangled up, Ctrl+C always gets you back to `=#`.

</details>

---

## Exercise 4 (Medium): A file with several statements

Create `playground/ch04/ex4.sql` containing **three** `SELECT` statements, each on its own line, each with a comment above it saying what it does. For example, one could work out how many days are in 12 weeks.

Run the file with `\i`. You should see three separate results.

Expected shape of the output:

```
 ?column?
----------
       84
(1 row)

 ...two more results...
```

<details>
<summary>Hint</summary>

Every statement needs its own semicolon, or PostgreSQL will try to read two lines as one statement and complain.

</details>

---

## Exercise 5 (Challenge): Read the help

Run `\h CREATE DATABASE` and look at the syntax it prints.

1. Everything in square brackets `[...]` is optional. How many optional parts can you count?
2. One of them is `OWNER`. Based on the name, what do you think it does?
3. Try creating a database using **one** of the optional parts, then drop it again. If you get an error, read it, and try to work out what went wrong.

<details>
<summary>Hint</summary>

A safe one to try is `CREATE DATABASE test_db WITH OWNER = postgres;`. It creates a database owned by the `postgres` user, which is what you'd get anyway.

</details>
