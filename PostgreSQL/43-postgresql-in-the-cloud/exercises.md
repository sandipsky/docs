# 43 PostgreSQL in the Cloud: Exercises

**How to do these:**

- You'll need to sign up for a free-tier PostgreSQL provider. Any from the notes is fine; the steps are the same everywhere. Keep `playground/ch43/notes.md` with what you did and what you saw.
- **Never paste a connection string into these notes or into git.** Write `postgres://...` and leave it at that.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your notes.

---

## Exercise 1 (Easy): Hello, cloud

1. Create a free database. Note the region you chose and why.
2. Connect to it from psql with the connection string. Run `SELECT version(), now();`. Is the version the same as your local one? Is the time zone?
3. Turn on `\timing` and run `SELECT 1;` ten times. Write down the typical time, and compare it with the same query on your laptop.

---

## Exercise 2 (Easy): Move the shop up

1. Dump your local `sales` database in custom format (chapter 35).
2. Restore it into the cloud database.
3. Run your chapter 29 headline-numbers query against the cloud. Still `664.16`?
4. Run the whole `report.sql` with `\timing`. Which section is slowest, and roughly how much slower is it than locally?

<details>
<summary>Hint</summary>

`pg_restore -d "postgres://...?sslmode=require" --no-owner sales.dump`.

</details>

---

## Exercise 3 (Medium): Least privilege, remotely

1. In the cloud database, create `shop_app` with the chapter 34 grants (read everything, write orders and order items, update stock).
2. Give your `node-shop` project a second env file, `.env.cloud` (gitignored), whose `DATABASE_URL` connects **as `shop_app`** to the cloud database.
3. Run chapter 40's `list-products.ts` and `transaction.ts` with `--env-file=.env.cloud`. Both should work. Then try a script that deletes a category. It should be refused.
4. In your notes: where exactly does the admin connection string live now, and where does the app's?

---

## Exercise 4 (Medium): Feel the latency

Run chapter 42's N+1 exercise against the cloud database: twelve separate item queries versus one join. Time both from Node with `console.time` and `console.timeEnd`.

Then do the same for `GET /orders/5` two ways: the single `jsonb_build_object` query from chapter 40, versus one query for the order plus one for its items, assembled in JavaScript.

In your notes: the local difference was tiny. What's the cloud difference, and what does it tell you about how to write queries for a deployed app?

---

## Exercise 5 (Challenge): Ship it

1. Deploy your chapter 40 API (the `node:http` server, or an Express version if you've learned it) to a platform that runs Node (Render, Railway, Fly.io, or similar), with `DATABASE_URL` set as an environment variable to the **`shop_app`** cloud string.
2. Open `/products?category=Bags` on the public URL, from your phone.
3. If you have a React app from the React course deployed, point its `fetch` at your API's public URL and render the products. (You'll need the CORS header from chapter 40's exercise 5.)
4. Go through the "checklist before you go live" in the notes and tick each item honestly in your notes, with one sentence of evidence for each.

<details>
<summary>Hint</summary>

Most platforms need a `start` script in `package.json`. `"start": "node --env-file=.env api.ts"` won't work there, because no `.env` file exists on the server; the variables are injected for you. Use `"start": "node api.ts"` and let `process.env.DATABASE_URL` come from the platform. If the platform's Node version can't run `.ts` files directly, compile with `tsc` first or rename the file to `.js` for the deploy.

</details>
