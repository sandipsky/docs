# 34 Users, Roles and Permissions: Exercises

**How to do these:**

- Work as `postgres` in one psql window on `sales`, and open a second window to connect as each new role (SQL Shell asks for the username; or `psql -U rolename -d sales`).
- Save each answer in `playground/ch34/ex1.sql`, `ex2.sql`, and so on. Record what each role could and couldn't do as comments, with the exact error messages.
- **Clean up** at the end of each exercise: `DROP OWNED BY role; DROP ROLE role;`.
- Use throwaway passwords, and don't commit these files anywhere public.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your work.

---

## Exercise 1 (Easy): A read-only reporter

1. Create `reporter` with `LOGIN` and a password. Connect as it in the second window. Try `SELECT count(*) FROM products;` and copy the error.
2. Grant the three layers (connect, schema usage, select on all tables). Try again: it works.
3. As `reporter`, try to `INSERT`, `UPDATE`, `DELETE`, and `DROP TABLE`. Copy each error. Which one is worded differently, and why?
4. `\dp products` as `postgres`. Which letter does `reporter` have?

---

## Exercise 2 (Easy): Future tables

1. As `postgres`, create a table `notes (id integer)`. As `reporter`, try to read it. Copy the error.
2. Fix it so this never happens again, with `ALTER DEFAULT PRIVILEGES`. Create another table, `notes2`. Can `reporter` read it now? Can it read `notes`? (Fix that one too.)
3. Drop both tables. In a comment: explain the difference between the two kinds of grant to a teammate.

---

## Exercise 3 (Medium): The app's own key

Create `shop_app` for the web shop. It must be able to:

- read everything,
- create orders and order items,
- update an order's `status` and `shipped_at`, but **not** its `customer_id` or `ordered_at`,
- reduce stock, but not change prices or names.

As `shop_app`, prove each of these with a working statement and a refused one. Then, as `postgres`, undo any test data the app inserted.

<details>
<summary>Hint</summary>

Column-level grants: `GRANT UPDATE (status, shipped_at) ON orders TO shop_app;` and `GRANT UPDATE (stock) ON products TO shop_app;`. Remember `INSERT` on `orders` and `order_items` too.

</details>

---

## Exercise 4 (Medium): Groups

1. Create a `NOLOGIN` role `readonly` with schema usage and select on all tables (and default privileges for future ones).
2. Create two login roles, `analyst1` and `analyst2`, as members of `readonly`. Connect as each; both should read, neither should write.
3. Grant `readonly` select on a brand new table. Do both analysts get it with no further grants?
4. Remove `analyst2` from the group with `REVOKE readonly FROM analyst2;`. What can `analyst2` do now?
5. In a comment: why is this better than granting tables to each analyst directly?

---

## Exercise 5 (Challenge): Hide the emails, for real

The marketing analyst must be able to see customer names and cities and all sales data, but **never** email addresses.

1. Create a view `customer_directory` (id, name, city) and a role `marketing` that can select from the view, from `orders`, `order_items`, `products`, and `categories`, but **not** from `customers`.
2. As `marketing`: select from the view (works), select `email` from `customers` (fails), and write a per-city revenue query using the view instead of `customers` (works).
3. Now deliberately make the mistake: `GRANT SELECT ON customers TO marketing;`. Show that the view no longer protects anything. Revoke it.
4. In a comment: write the two-sentence rule you'd put in the team's wiki about views and permissions.
5. Clean up every role from this chapter. `\du` should show only `postgres`.

<details>
<summary>Hint</summary>

The view is owned by `postgres`, who can read `customers`, so `marketing` reading the view works even without access to the table. That's the feature. Step 3 shows the one way to break it.

</details>
