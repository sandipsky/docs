# 02 Tables, Rows and Columns: Exercises

**How to do these:**

- Still no software needed. Write your answers in `playground/ch02/answers.md`.
- Draw tables the way the notes do, or as Markdown tables. Whatever is quickest.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your answers.

---

## Exercise 1 (Easy): Label the parts

Here's a table called `products`:

| id | name | price | in_stock |
|---|---|---|---|
| 1 | Notebook | 3.50 | true |
| 2 | Pen | 1.20 | true |
| 3 | Desk lamp | 24.99 | false |
| 4 | Stapler | 8.00 | true |

Answer:

1. How many rows? How many columns?
2. What value is in the `price` column of the row where `name` is `Desk lamp`?
3. For each column, what kind of value does it hold (whole number, decimal number, text, or true/false)?
4. Which column is the row's identity?

---

## Exercise 2 (Easy): Design a contacts table

You're building a simple contacts app, like the one on your phone. Design a `contacts` table.

- Give it an `id` and at least **five** other columns.
- For each column, write its name (following the naming conventions), the kind of value it holds, and one example value.
- Fill in two example rows.

<details>
<summary>Hint</summary>

What does your phone show when you open a contact? Name, phone number, email... Also think about whether someone might not have an email. What goes in that cell?

</details>

---

## Exercise 3 (Medium): Fix the bad table

A school made this `students` table. It has at least **three** problems from this chapter.

| id | name | courses | phone_1 | phone_2 | age |
|---|---|---|---|---|---|
| 1 | Anita Rai | Maths, Art | 9841000001 | 9841000002 | 15 |
| 2 | Bikash Thapa | Maths | 9841000003 | | 16 |
| 3 | Chandra Gurung | Art, Music, PE | 9841000004 | | 15 |

1. Find the problems and explain *why* each is a problem (what goes wrong later).
2. Suggest a fix for each. You don't have to know how to do the fix in SQL yet. Just describe it, like "move X to its own table".

<details>
<summary>Hint</summary>

Look at the `courses` cells. Look at the two phone columns together. And think about what happens to `age` next year.

</details>

---

## Exercise 4 (Medium): Find the tables in a library

A small library needs to keep track of its books, its members, and who has borrowed what.

1. List the nouns (the kinds of things).
2. Design a table for each, with columns and types.
3. Check each table against the rules: one kind of thing per table, one value per cell.

<details>
<summary>Hint</summary>

"Who has borrowed what" is a thing too: a *loan*. It happens on a date, involves one book and one member, and has a due date. How would a loan row point at its book and its member?

</details>

---

## Exercise 5 (Challenge): A cinema booking app

Design the tables for an app where people book cinema seats.

Think about: films, screenings (a film showing at a certain time in a certain room), rooms, seats, customers, and bookings.

1. List the tables and their columns.
2. Draw arrows showing which tables point to which (like `tasks.project_id → projects.id` in the notes).
3. Write one sentence describing what a single row in each table means. If you can't, that table is probably mixing things up.

<details>
<summary>Hint 1</summary>

A screening is *not* the same as a film. *Dune* is one film, but it might be shown 12 times this week. Each showing is one screening row.

</details>

<details>
<summary>Hint 2</summary>

A booking connects one customer to one seat at one screening. So a booking row will have three "pointer" columns.

</details>
