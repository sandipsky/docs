# 44 Final Project: Exercises

**How to do these:**

- These are stretch goals for after your final project is deployed and written up. Each one goes deeper into a chapter.
- Add each one you do as a section in your README under "Stretch goals", with the evidence.
- Pick the ones that fit your app. You don't need all five.

---

## Stretch 1: A real dashboard

Build a **materialized view** (chapter 33) that summarizes your app's activity by day (sign-ups, orders, posts, whatever your app does), and an API route that returns it as JSON. Schedule a refresh: a small Node script run by Task Scheduler or your platform's scheduler, or a trigger that refreshes on change if the table is small. Include the view's `refreshed_at` in the response so users know how fresh it is.

---

## Stretch 2: Audit everything

Add an `audit_log (id, table_name, row_id, action, old_data jsonb, new_data jsonb, changed_by, changed_at)` and **one generic trigger function** (chapter 38) that writes to it, attached to your three most important tables. The trick: `to_jsonb(OLD)` and `to_jsonb(NEW)` turn any row into JSON, so one function serves every table. Then write a query that shows the full history of a single row.

---

## Stretch 3: Row-level security

Chapter 34 mentioned it. Read the PostgreSQL docs for `CREATE POLICY`, then make one table in your app show each user only their own rows when the app role runs `SET app.current_user_id = ...` at the start of a request. Prove it with two users in psql. In your README: what did it make easier, and what did it make harder?

---

## Stretch 4: The ORM comparison

Rewrite your five API routes with Drizzle or Prisma (chapter 42), side by side with the `pg` versions. Measure: lines of code, number of queries sent (turn on the ORM's query logging), and the time for your heaviest route. Write a paragraph: which would you choose for this app, and why?

---

## Stretch 5: Load it up

Use `generate_series` (chapter 31) to inflate your biggest table to a million rows, in a copy of your database. Run your ten queries from `queries.sql` with `EXPLAIN ANALYZE`. Which ones got slow? Fix each with an index or a rewrite, and record the before and after. Then, in your README, write the one sentence you'd tell your past self about designing for scale.
