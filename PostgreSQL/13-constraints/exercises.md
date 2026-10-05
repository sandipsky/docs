# 13 Constraints: Exercises

**How to do these:**

- Work in psql, connected to `practice`. Save each answer in `playground/ch13/ex1.sql`, `ex2.sql`, and so on.
- Start each file with `DROP TABLE IF EXISTS ...;` so it can be run again.
- When an exercise says "try to break it", run the failing statement, and paste the **first line of the error** into your file as a comment.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your work.

---

## Exercise 1 (Easy): A users table with rules

Create a `users` table where:

- `email` and `username` are required and can't repeat,
- `is_admin` is required and defaults to false,
- `created_at` is required and defaults to the current moment,
- `display_name` is optional.

Then run these five inserts. **Before** running each, write a comment predicting whether it succeeds or fails, and which rule it hits.

```sql
INSERT INTO users (email, username) VALUES ('asha@example.com', 'asha');
INSERT INTO users (email, username) VALUES ('asha@example.com', 'asha2');
INSERT INTO users (email) VALUES ('bikram@example.com');
INSERT INTO users (email, username, is_admin) VALUES ('chandra@example.com', 'chandra', NULL);
INSERT INTO users (email, username, display_name) VALUES ('dev@example.com', 'dev', NULL);
```

Finish with `SELECT * FROM users;`. You should have exactly 2 rows.

<details>
<summary>Hint</summary>

The fourth one is the sneaky one. Read the "Expecting a default to rescue an explicit NULL" mistake in the notes.

</details>

---

## Exercise 2 (Easy): Read the error, name the rule

Someone ran statements against a table you can't see, and got these errors. For each, write which kind of constraint was hit, and what the table's rule probably is:

```
ERROR:  duplicate key value violates unique constraint "employees_badge_number_key"
```

```
ERROR:  null value in column "hired_on" of relation "employees" violates not-null constraint
```

```
ERROR:  new row for relation "employees" violates check constraint "employees_salary_check"
```

```
ERROR:  new row for relation "employees" violates check constraint "leaves_after_joins"
```

Bonus: which one of the four was given a name by a person rather than by PostgreSQL? How can you tell?

---

## Exercise 3 (Medium): Reviews

Create a `reviews` table for product reviews:

- `product_name` required.
- `rating` required, a whole number from 1 to 5.
- `body` required, and at least 10 characters long. Give this rule your own name, `body_long_enough`.
- `is_verified` required, default false.
- `written_at` required, default now.

Try to break each rule with a separate insert (rating 0, rating 6, a 5-character body, a missing rating). Then insert two valid reviews.

<details>
<summary>Hint</summary>

`length(body) >= 10` is a valid `CHECK` condition. Because it's about one column, you can put it right after the column, but to give it a name you'll need the `CONSTRAINT name CHECK (...)` form at the end of the table.

</details>

---

## Exercise 4 (Medium): No overdrafts

Create an `accounts` table with `owner text NOT NULL` and `balance numeric(12, 2) NOT NULL DEFAULT 0 CHECK (balance >= 0)`.

1. Insert an account for `'Asha'` with no balance given. What does it start at?
2. Add 500 to it with an `UPDATE`.
3. Take 200 out.
4. Try to take 400 out. Read the error.
5. Now do step 4 again, but inside `BEGIN;` ... `ROLLBACK;`. Does the constraint still fire? What does the balance show after the rollback?

Write a comment: why is this `CHECK` more trustworthy than a "you can't withdraw more than your balance" check written in an app?

---

## Exercise 5 (Challenge): Meeting rooms

A company books meeting rooms by the day. Create `room_bookings` with:

- `room_name` required.
- `booked_on` a required date.
- `booked_by` required.
- `status` required, default `'pending'`, and only ever `'pending'`, `'confirmed'`, or `'cancelled'`.
- **A room can only be booked once per day.**

Then:

1. Book `'Everest'` for `2026-10-03` by Asha. Book `'Everest'` for `2026-10-04` by Bikram. Book `'Annapurna'` for `2026-10-03` by Chandra. All three should succeed.
2. Try to book `'Everest'` for `2026-10-03` again. It must fail.
3. Try to insert a booking with status `'maybe'`. It must fail.
4. Confirm Asha's booking with an `UPDATE`. Then try to set its status to `'done'`. It must fail.
5. Run `\d room_bookings` and find where PostgreSQL lists your "once per day" rule.

<details>
<summary>Hint 1</summary>

"Once per room per day" is uniqueness of a **pair** of columns. It goes at the end of the table: `UNIQUE (room_name, booked_on)`.

</details>

<details>
<summary>Hint 2</summary>

The fixed set of statuses is `CHECK (status IN ('pending', 'confirmed', 'cancelled'))`. Combine it with `NOT NULL` and `DEFAULT 'pending'` on the same column.

</details>
