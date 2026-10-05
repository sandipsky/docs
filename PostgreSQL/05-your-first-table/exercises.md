# 05 Your First Table: Exercises

**How to do these:**

- Work in psql, connected to `practice`. Save each answer in `playground/ch05/ex1.sql`, `ex2.sql`, and so on, and run it with `\i`.
- Start each file with `DROP TABLE IF EXISTS ...;` so you can run it as many times as you like.
- After every `CREATE TABLE`, check it with `\d`.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your work.

---

## Exercise 1 (Easy): Fix the broken statements

Each of these has one mistake. Find it, fix it, and run the corrected version.

```sql
CREATE TABLE pets (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY
  name text,
  species text
);
```

```sql
CREATE TABLE cities (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name string,
  population integer
);
```

```sql
CREATE TABLE movies (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title text,
  release date,
);
```

<details>
<summary>Hint</summary>

Read the error message each time. It points at the spot where PostgreSQL got confused, which is usually *just after* the real mistake.

</details>

---

## Exercise 2 (Easy): The contacts table, for real

In chapter 02 exercise 2 you designed a `contacts` table on paper. Create it now, with the `id` recipe and at least five other columns. Use at least three different types.

Run `\d contacts` and check every column has the type you meant.

---

## Exercise 3 (Medium): A shopping cart

An online shop needs a table of products. Each product has a name, a price, how many are in stock, whether it's currently on sale, and the date it was added to the shop.

1. Create the `products` table. Use the right type for each column. (Reread the note about money in the notes.)
2. Run `\d products`.
3. Then create a second table, `cart_items`, for things a customer has put in their basket: which product (by its id), how many, and when it was added.

<details>
<summary>Hint</summary>

Price is a decimal, so it's `numeric(10, 2)`, not `integer`. For "which product", a column called `product_id` of type `integer` will do for now. Chapter 16 shows how to link it properly.

</details>

---

## Exercise 4 (Medium): Read the description

Run `\d products` from Exercise 3 and answer, in a comment at the bottom of your `ex4.sql` file:

1. Which column can never be empty (NULL), and why?
2. What does the `Default` column say for `id`, and what does it mean in plain English?
3. What is `products_pkey`?

---

## Exercise 5 (Challenge): The library, in SQL

In chapter 02 exercise 4 you designed tables for a library: books, members, and loans. Create all three in one `.sql` file that:

- starts by dropping all three tables if they exist,
- creates the three tables,
- can be run with `\i` over and over without errors.

Then run `\dt` and make sure all three are listed.

<details>
<summary>Hint 1</summary>

For "which book" and "which member" in the loans table, use `book_id integer` and `member_id integer`, the same trick as Exercise 3.

</details>

<details>
<summary>Hint 2</summary>

If you get an error about a name, check it isn't an SQL word. `date` is a type name, so a column called `date` is asking for trouble. Try `loan_date` or `borrowed_on`.

</details>
