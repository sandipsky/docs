# 01 What Is a Database?: Exercises

**How to do these:**

- No computer setup needed. These are thinking exercises.
- Write your answers in a file: create a folder `PostgreSQL/playground/ch01/` and put an `answers.md` in it. You'll use this `playground` folder for the whole course.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your answers.

---

## Exercise 1 (Easy): Spot the database

Pick three apps you use every day (for example a messaging app, a music app, a food delivery app).

For each one, list **three kinds of information** it must be storing somewhere. Think about what would be lost if the app's database vanished.

Example for a messaging app: users, messages, group chats.

<details>
<summary>Hint</summary>

Ask yourself: what does the app remember about me between sessions? What did I create? What did other people create that I can see?

</details>

---

## Exercise 2 (Easy): CRUD in real life

Take a to-do list app. Write down **one thing a user does** for each of the four CRUD actions:

- **Create:** ...
- **Read:** ...
- **Update:** ...
- **Delete:** ...

Then do the same for an online banking app.

<details>
<summary>Hint</summary>

Ticking a task as done is a change to an existing task. Which CRUD letter is that?

</details>

---

## Exercise 3 (Medium): The spreadsheet problem

A school keeps student attendance in a single shared spreadsheet. Twelve teachers open it each morning and type in who is present. The head teacher uses it for end-of-year reports.

List **three problems** this spreadsheet will run into. For each problem, say which of the six database strengths from the notes would fix it.

<details>
<summary>Hint</summary>

Think about: twelve people saving the same file, a student's name being spelled three different ways, and what happens to the report when someone accidentally deletes a row.

</details>

---

## Exercise 4 (Challenge): Read SQL before you learn it

You haven't learned SQL yet. But it's built from English words, so have a go. For each line below, write **in plain English** what you think it does. Don't worry about being exactly right.

```sql
SELECT name, price FROM products WHERE price < 10;
```

```sql
DELETE FROM tasks WHERE is_done = true;
```

```sql
UPDATE customers SET city = 'Pokhara' WHERE id = 7;
```

```sql
INSERT INTO books (title, author) VALUES ('Dune', 'Frank Herbert');
```

Bonus: which CRUD action is each one?

<details>
<summary>Hint</summary>

Read left to right, one word at a time. `FROM products` tells you which table. `WHERE ...` narrows down which rows. `SET` changes a value.

</details>
