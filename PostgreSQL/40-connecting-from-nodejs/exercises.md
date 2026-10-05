# 40 Connecting from Node.js: Exercises

**How to do these:**

- Work in `PostgreSQL/playground/node-shop/`, set up as in the notes, with `DATABASE_URL` pointing at `sales`.
- One `.ts` file per exercise (`ex1.ts`, `ex2.ts`, ...). Run with `node --env-file=.env ex1.ts`.
- **Every** value that comes from outside the program (a command-line argument, a URL) goes in the parameters array. If you catch yourself writing `${...}` inside SQL, stop.
- Undo any test data you insert, or reload the seed afterwards, so `sales` stays as the seed left it.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): List and count

1. Print every customer's name and city, one per line, formatted like `Asha Rai (Kathmandu)`.
2. Print the number of orders and the total revenue, both excluding cancelled orders, as one sentence. The revenue comes back as a string; turn it into a number before formatting it with two decimals.

Expected second output: `11 orders, revenue 664.16`.

---

## Exercise 2 (Easy): A command-line search

Read a city from the command line (`process.argv[2]`) and print the customers who live there, newest member first. Run it as `node --env-file=.env ex2.ts Pokhara`.

Then run it with the argument `"' OR 1=1 --"` (in double quotes). If it prints all six customers, you have an injection. Fix it.

<details>
<summary>Hint</summary>

`const city = process.argv[2];` then `pool.query("... WHERE city = $1 ...", [city])`.

</details>

---

## Exercise 3 (Medium): Friendly errors

Write a function `addCategory(name)` that inserts a category and returns its new id. Call it three times: with a new name, with `'Bags'` (already exists), and with an empty string, after adding `CHECK (length(name) > 0)` to the table in psql.

For each failure, catch the error, look at `code`, and print a **friendly** message (`A category called Bags already exists`, `Category name can't be empty`), never the raw error. For any code you didn't expect, print `Unexpected error` and rethrow.

Clean up afterwards: delete the category you added, and drop the check.

<details>
<summary>Hint</summary>

`23505` is unique, `23514` is check. A `switch (e.code)` reads well here.

</details>

---

## Exercise 4 (Medium): A transaction that moves stock

Write `placeOrder(customerId, lines)` from the notes, then extend it:

1. Throw, before touching the database, if `lines` is empty.
2. Record the unit price from `products` with a subquery, as in the notes.
3. After the loop, `SELECT` the order total inside the same transaction, and return `{ orderId, total }`.

Test it: a good order for Elina (customer 5), then an order that oversells a product. Afterwards, prove with a query that Elina has exactly one order and the oversold product's stock is unchanged. Then delete the test order and put the stock back (or reload the seed).

---

## Exercise 5 (Challenge): An API for your React app

Build the `node:http` server from the notes, then add:

1. `GET /customers/:id/orders`: that customer's orders as a JSON array, each with its total and number of items. Return `404` if the customer doesn't exist.
2. `GET /search?q=term`: products whose name contains the term, ignoring case, using a parameterized `ILIKE`.
3. Proper status codes: `200`, `404`, and `500` for unexpected errors, with the real error only in the server's log.

Test every route in the browser, including a bad id and a search for `' OR 1=1 --`. Then, if you have an app from the React course handy, `fetch` `/products` from it and render the list. You've just built your first full stack.

<details>
<summary>Hint</summary>

For the search pattern: `const pattern = "%" + q + "%";` then `WHERE name ILIKE $1` with `[pattern]`. The `%` signs are part of the value, not the SQL, so this is still safe. Your browser may block a `fetch` from a React dev server on a different port. That's **CORS**, and adding the header `Access-Control-Allow-Origin: *` to your responses fixes it for local development.

</details>
