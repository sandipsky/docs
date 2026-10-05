# 16 Relationships and Foreign Keys: Exercises

**How to do these:**

- Work in psql, connected to `practice`. Save each answer in `playground/ch16/ex1.sql`, `ex2.sql`, and so on.
- Start each file by dropping its tables **children first**, with `IF EXISTS`.
- When something should fail, run it, and paste the error's first line as a comment.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your work.

---

## Exercise 1 (Easy): Authors get their own table

Since chapter 06, `books.author` has been text, and Roald Dahl is typed out twice. Fix it properly.

1. Create an `authors` table (`id`, `name NOT NULL`, `country`).
2. Create a **new** `library_books` table with `title`, `published_year`, and an `author_id` that references `authors` and can't be NULL.
3. Insert three authors and five books, with at least two books by the same author.
4. Try to insert a book with `author_id = 42`. Try to delete an author who has books. Both must fail.
5. Use the sneak-peek `JOIN` from the notes to list each book's title next to its author's name.

<details>
<summary>Hint</summary>

Parents first: insert the authors, note their ids (they'll be 1, 2, 3 on a fresh table), then insert the books using those ids.

</details>

---

## Exercise 2 (Easy): Optional links

Back in chapter 02, tasks could belong to a project, but didn't have to.

1. Create `projects` (`id`, `name NOT NULL UNIQUE`) and `project_tasks` (`id`, `title NOT NULL`, `is_done NOT NULL DEFAULT false`, `project_id` referencing `projects`, **nullable**, with `ON DELETE SET NULL`).
2. Insert two projects, two tasks in each, and one task with no project.
3. Delete one project. Select all tasks. What happened to the two tasks that were in it?
4. In a comment: why would `ON DELETE CASCADE` have been a worse choice here? And why would `NOT NULL` on `project_id` have made step 3 fail?

---

## Exercise 3 (Medium): Three ways to say goodbye

Create a parent table `teams` and **three** child tables, each referencing `teams (id)` with a different `ON DELETE`:

- `team_messages` with `CASCADE`,
- `team_invoices` with `RESTRICT`,
- `team_members` with `SET NULL` (so `team_id` must be nullable).

Insert one team, one row in each child table pointing at it. **Before** running anything else, write a comment predicting what `DELETE FROM teams WHERE id = 1;` will do.

Then run it. Were you right? Fix whatever stopped it (in the way a real business would), and run the delete again. Finally, select from all three child tables and describe what you see.

<details>
<summary>Hint</summary>

The invoice is the blocker, on purpose. A business doesn't delete invoices; it would delete the invoice row only if it was a mistake, or (more realistically) never delete the team at all. For this exercise, deleting the invoice row first is fine, but say in a comment what you'd really do.

</details>

---

## Exercise 4 (Medium): Fix the backwards design

A colleague designed this:

```sql
CREATE TABLE customers (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name text NOT NULL,
  order_id integer
);

CREATE TABLE orders (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  total numeric(10, 2) NOT NULL
);
```

1. In a comment, explain the two problems: what happens when Asha places her second order, and what stops `order_id` being `999`?
2. Rewrite both tables correctly, with the foreign key on the right side, the right `NOT NULL`, and a sensible `ON DELETE`.
3. Insert one customer with three orders to prove the new design handles it.

---

## Exercise 5 (Challenge): A small blog

Design and build:

- `users` (`id`, `username NOT NULL UNIQUE`).
- `posts` (`id`, `author_id` → users, required, `title`, `body`, `published_at DEFAULT now()`).
- `comments` (`id`, `post_id` → posts, required, `author_id` → users, **optional**, `body`, `written_at DEFAULT now()`).

Decide the `ON DELETE` for each of the three foreign keys, and justify each in a comment. Think about: what should happen to a user's posts and comments when they delete their account? What should happen to a post's comments when the post is deleted?

Then:

1. Insert two users, two posts (one each), and three comments (one of them by the post's own author, one by the other user, one on the other post).
2. Delete one user. Select from `posts` and `comments`. Does the result match your justification?
3. Use the sneak-peek `JOIN` to list each comment's body next to the title of the post it's on.

<details>
<summary>Hint 1</summary>

A common answer: `posts.author_id` is `RESTRICT` (make the user delete or transfer their posts first, or mark the account inactive), `comments.post_id` is `CASCADE` (a comment is meaningless without its post), `comments.author_id` is `SET NULL` (the comment stays, shown as "deleted user"). Other answers are fine if you can defend them.

</details>

<details>
<summary>Hint 2</summary>

If you chose `RESTRICT` on posts, step 2 will refuse to delete a user who has posts. That's the design working. Delete a user who has only comments, or delete the posts first, and write down which you did.

</details>
