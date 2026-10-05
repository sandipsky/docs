# 17 Many-to-Many Relationships: Exercises

**How to do these:**

- Work in psql, connected to `practice`. Save each answer in `playground/ch17/ex1.sql`, `ex2.sql`, and so on.
- Start each file by dropping its tables, junction table first, with `IF EXISTS`.
- Use the two-join query from the notes whenever you need to see names instead of ids.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your work.

---

## Exercise 1 (Easy): Books and genres, properly

You need the 9-row `books` table from chapter 06 (or any `books` table with an `id`).

1. Create `genres` and `book_genres` as shown at the end of the notes.
2. Insert genres: Fantasy, Adventure, Children, Science Fiction, Classic, Poetry.
3. Link *The Hobbit* to Fantasy **and** Adventure. Link *Matilda* and *The BFG* to Children. Link *Dune* and *The Martian* to Science Fiction. Link *Beowulf* to Poetry.
4. Try to link *The Hobbit* to Fantasy again. It must fail.
5. Write the two-join query that lists every book title next to each of its genres, sorted by title. *The Hobbit* should appear twice.

<details>
<summary>Hint</summary>

Look up ids with `SELECT id, title FROM books;` and `SELECT id, name FROM genres;` before writing the `book_genres` inserts.

</details>

---

## Exercise 2 (Easy): Users and roles

An app has users, and each user can have several roles (`admin`, `editor`, `viewer`). A role is held by many users.

1. Create `app_users`, `roles`, and a junction table. The junction table should record **when** each role was granted.
2. Give one user all three roles, another user just `viewer`, and leave a third user with no roles.
3. In a comment: `granted_on` is a fact about what? Why can't it live on `app_users` or on `roles`?
4. Remove `editor` from the first user by deleting one junction row.

---

## Exercise 3 (Medium): Playlists

A music app has playlists and songs. The same song can be in many playlists. Within a playlist, songs have a **position** (1st, 2nd, 3rd), and the **same song can appear twice** in one playlist at different positions.

1. Design the junction table. Think hard about the primary key: `(playlist_id, song_id)` is **wrong** here. Why? What uniqueness rule *is* right?
2. Build all three tables, insert one playlist with four entries (one song twice), and prove that two songs can't share a position in the same playlist.
3. Write the query that shows one playlist in order: position, song title.

<details>
<summary>Hint</summary>

The rule is "one song per slot", not "one slot per song". So the unique pair is `(playlist_id, position)`. Give the junction table its own `id` as primary key, and put `UNIQUE (playlist_id, position)` on it.

</details>

---

## Exercise 4 (Medium): Actors and films

An actor appears in many films; a film has many actors. Each appearance has a **role name**, and an actor can play **two roles in the same film** (it happens).

1. Design the junction table so that the same (actor, film, role) can't be recorded twice, but (actor, film) with a different role can.
2. Build it, and insert one actor playing two roles in one film, plus two more actors in that film.
3. Write a query listing the film's cast: actor name and role, alphabetical by actor.
4. In a comment: compare your primary key here with the one in Exercise 3. Both are "more than two columns" or "not the obvious pair". What's the general lesson about choosing a junction table's key?

<details>
<summary>Hint</summary>

`PRIMARY KEY (actor_id, film_id, role)` works, with `role text NOT NULL`. The lesson: the key is whatever combination must be unique *in the real world*, not automatically the two foreign keys.

</details>

---

## Exercise 5 (Challenge): Order items with a price snapshot

Build the `orders` / `products` / `order_items` design from the notes. You can reuse `customers` and `orders` from chapter 16 and `products` from chapter 13, or create fresh ones.

1. Insert three products with prices, one customer, and one order for that customer.
2. Add three items to the order, copying each product's **current** price into `unit_price`. Try to add the same product to the same order twice. It must fail.
3. Write a query showing, for that order: product name, quantity, unit price, and a `line_total` column (quantity × unit price).
4. Now **raise the price** of one of those products in `products`. Run the query from step 3 again. Did the order's line total change? Write a comment explaining why that's correct, and what would have gone wrong if `order_items` had no `unit_price` column.
5. Try to delete a product that's in the order. What happens, and why is that the right behaviour?

<details>
<summary>Hint</summary>

For step 2, look up each price with `SELECT id, price FROM products;` and type it into the insert. In chapter 25 you'll learn to have the database copy it for you with a subquery.

</details>
