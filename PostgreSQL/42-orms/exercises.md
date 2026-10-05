# 42 ORMs: Exercises

**How to do these:**

- Work in `PostgreSQL/playground/node-shop/` with `npm install drizzle-orm` done and the `schema.ts` from the notes.
- One `.ts` file per exercise. Turn on query logging (`drizzle(pool, { logger: true })`) in every file, and paste the SQL that was logged into comments next to your code.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your work.

---

## Exercise 1 (Easy): Translate from SQL

Write each of these with Drizzle, run it, and compare the logged SQL with what you'd have written by hand:

1. `SELECT name, price FROM products WHERE is_active ORDER BY price DESC LIMIT 3;`
2. `SELECT name, email FROM customers WHERE city = 'Pokhara';`
3. `SELECT o.id, c.name FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status = 'pending';`

<details>
<summary>Hint</summary>

`import { eq, desc } from "drizzle-orm"`. Number 1 is `.where(eq(products.isActive, true)).orderBy(desc(products.price)).limit(3)`.

</details>

---

## Exercise 2 (Easy): Write, then read back

1. Insert a new customer with `.insert(customers).values({...}).returning()`. Note the `id`.
2. Update their city with `.update(...).set(...).where(...)`.
3. Delete them with `.delete(...).where(...)`.
4. Try to insert a customer with an email that already exists. Catch the error and print its `code`. Is it the same code as in chapter 40?

---

## Exercise 3 (Medium): Where the ORM runs out

1. Write "revenue per category, excluding cancelled orders" (chapter 22) in Drizzle. You'll need `sql` fragments for `sum(...)` and probably for the whole aggregate. Count how many lines it took.
2. Write the same query as one `sql` template passed to `db.execute(sql\`...\`)`. Count the lines.
3. Create the `order_totals` view from chapter 33 in psql, add it to `schema.ts` with `pgView`, and select from it in Drizzle as if it were a table.
4. In a comment: for this shop's reporting, which of the three approaches would you use, and why?

<details>
<summary>Hint</summary>

`import { pgView } from "drizzle-orm/pg-core"` and `export const orderTotals = pgView("order_totals", { orderId: integer("order_id"), ... }).existing();` tells Drizzle the view already exists in the database.

</details>

---

## Exercise 4 (Medium): Catch an N+1 in the act

1. Write the loop from the notes: fetch all orders, then fetch each order's items inside a `for` loop. With logging on, count the queries.
2. Rewrite it as one join that returns every order line with its order's status and the customer's name. Count the queries.
3. Rewrite it a third way: fetch all orders, collect their ids, then fetch all items `WHERE order_id IN (...)` in **one** query with `inArray`, and group them in JavaScript. Count the queries.
4. In a comment: with 10,000 orders, how many queries does each version send? Which would you ship?

---

## Exercise 5 (Challenge): Migrations with Drizzle Kit, or Prisma

Pick one:

**Option A: Drizzle Kit.** Install `drizzle-kit`, write its config file pointing at `schema.ts` and your `DATABASE_URL`, and run `generate` against a **fresh** database. Read the migration it produced. Then add a `phone` column to `customers` in `schema.ts`, generate again, and read that migration. Apply both with `migrate`. In a comment: what did the tool get right, and what would you still add by hand (chapter 31, chapter 16)?

**Option B: Prisma.** Follow Prisma's current PostgreSQL getting-started guide to set up a project against a **fresh** database. Model `categories` and `products`. Run the migration, generate the client, and write the three queries from Exercise 1 in Prisma's style. Turn on query logging and compare the SQL with Drizzle's. In a comment: which style did you find clearer, and what did each hide from you?

Either way, finish with one paragraph: how will you decide, on your next project, between plain `pg`, an ORM, and a mix?
