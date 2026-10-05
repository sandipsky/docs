# 19 Project: Online Shop Database

## What you'll build

A complete database for a small online shop, from a client's plain-English brief to a set of files that build it from nothing. Categories, products, customers, orders, and the items in each order. Rules that stop bad data. Links that stop orphans. And then, because this is how real projects go, the client changes their mind, and you change the tables without losing anything.

It's all of Level 2 in one piece of work: types, constraints, primary keys, `ALTER TABLE`, one-to-many, many-to-many, and normalization.

By the end, you'll have, in `playground/ch19/`:

- `plan.md`: the tables you found in the brief, with columns, types, rules, and a diagram,
- `schema.sql`: creates every table, in the right order, with every constraint,
- `seed.sql`: fills the shop with the sample data,
- `checks.sql`: a list of things that **must fail**, and proof that they do,
- `changes.sql`: the client's change requests, as `ALTER TABLE` statements,
- `queries.sql`: questions about the shop, answered.

## Before you start

- Finish chapters 12 to 18.
- Read the [client brief](starter/README.md) in the starter folder. It's written the way a real client talks: clear about what they want, vague about how. The sample data is in there too.
- Make a folder `playground/ch19/`.
- You'll work in a new database called `shop`. Create it in Milestone 4.
- Run `\pset null '[NULL]'` in each session.

**The golden rule, again:** every statement goes in a file. Milestone 9 will rebuild the whole thing from your files, and anything you typed straight into psql will be missing.

## Milestone 1: Find the things

**Goal:** turn the brief into a list of tables ([chapter 02](../02-tables-rows-and-columns/notes.md), [chapter 18](../18-normalization/notes.md)).

Read the brief and underline the nouns. For each one, decide: is this a *kind of thing* the shop needs to keep rows of, or just a detail of something else? Write your list in `plan.md`, with one sentence per table: "each row is one ____."

You should end up with five tables. If you have four, you've missed the one in the middle. If you have seven, you've probably made tables for details.

<details>
<summary>Hint</summary>

Categories, products, customers, orders. And "which products, and how many, are in each order" is a thing in its own right: an order item. Chapter 17.

</details>

## Milestone 2: Columns, types, and rules

**Goal:** for each table, decide every column, its type, and its constraints ([chapters 12](../12-data-types-in-depth/notes.md) and [13](../13-constraints/notes.md)).

Extend `plan.md` with a table per table: column, type, rules (`NOT NULL`? `UNIQUE`? `CHECK`? `DEFAULT`?), and an example value. Go back to the brief for every rule: "email must be unique", "we never sell for a negative price", "an order starts as pending".

Some things to decide, and write down your reasoning:

- Which columns can be NULL? (Very few.)
- What type is money? What type is "when the order was placed"?
- Where does the price the customer paid live, and why isn't it just `products.price`?
- What are the allowed order statuses, exactly?

<details>
<summary>Hint</summary>

Every table gets the `id` recipe, except possibly the one in the middle, which can use a composite key. Timestamps for "when" are `timestamptz NOT NULL DEFAULT now()`. Money is `numeric(10, 2)`. Statuses are `text NOT NULL DEFAULT 'pending' CHECK (status IN (...))`.

</details>

## Milestone 3: Draw the links

**Goal:** decide every relationship and every `ON DELETE` ([chapters 16](../16-relationships-and-foreign-keys/notes.md) and [17](../17-many-to-many-relationships/notes.md)).

Draw the five tables in `plan.md` the way chapter 18 does, with arrows from each foreign key to the primary key it points at, and a `───<` on each "many" end. Then, for each foreign key, write the `ON DELETE` you've chosen and **why**, in one sentence. The brief has opinions about this. Find them.

<details>
<summary>Hint</summary>

Four foreign keys. Two are one-to-many (product → category, order → customer). Two make up the many-to-many (order item → order, order item → product). The brief says the shop never wants to lose an order record. What does that mean for deleting a customer? For deleting a product that's been sold?

</details>

## Milestone 4: Build it

**Goal:** `schema.sql` creates everything from scratch, in the right order ([chapter 05](../05-your-first-table/notes.md), [chapter 16](../16-relationships-and-foreign-keys/notes.md)).

1. In psql: `CREATE DATABASE shop;` then `\c shop`.
2. Write `schema.sql`:
   - A comment at the top saying what it is.
   - `DROP TABLE IF EXISTS` for every table, **children first**.
   - `CREATE TABLE` for every table, **parents first**, with every constraint from your plan.
3. Run it with `\i`. Then run it **again**. It must work both times.
4. `\d` every table and compare with `plan.md`.

**Check:** `\dt` lists five tables. `\d order_items` shows two foreign keys and a primary key (or unique constraint) on the pair.

## Milestone 5: Load the data

**Goal:** `seed.sql` fills the shop with the sample data from the brief ([chapter 06](../06-adding-data/notes.md)).

Insert in dependency order: categories, then products, then customers, then orders, then order items. On a freshly built database, ids start from 1 in each table, so you can predict them. Say so in a comment, because it's an assumption.

For each order item, copy the product's price **at the time of the order** into your snapshot column. For these sample orders, that's the current price.

**Check:** `SELECT * FROM order_items;` shows 6 rows. The `JOIN` preview from chapter 16, adapted, shows each order's customer name. Try: `SELECT orders.id, customers.name, orders.status FROM orders JOIN customers ON customers.id = orders.customer_id;`

## Milestone 6: Try to break it

**Goal:** `checks.sql` proves every rule works ([chapter 13](../13-constraints/notes.md)).

Write one statement for each of these. **Every one must fail.** Above each, write a comment saying which rule should stop it. Below each, after you've run it, paste the first line of the error.

1. A product with a negative price.
2. A product with a SKU that's already used.
3. A second customer with an existing email.
4. An order for a customer who doesn't exist.
5. An order item for a product that doesn't exist.
6. An order item with a quantity of 0.
7. An order with status `'lost'`.
8. The same product added twice to the same order.
9. Deleting a customer who has orders.
10. Deleting a product that's in an order.

Run them **one at a time**, not inside a transaction. (A failed statement inside a transaction puts the whole transaction in an error state, and everything after it is ignored until you `ROLLBACK`. Try it once, to see what that looks like.)

If any of the ten **succeeds**, you've found a missing rule. Fix `schema.sql`, rebuild, reseed, and run the checks again.

## Milestone 7: The client changes their mind

**Goal:** `changes.sql` applies the client's change requests without dropping anything ([chapter 15](../15-changing-a-tables-shape/notes.md)).

The brief ends with a list of changes the owner thought of after you'd built everything. This always happens. For each one, write an `ALTER TABLE` (or whatever it takes), inside a `BEGIN` ... `COMMIT`, with a check in between.

One of the changes is a trap: it asks you to remove a product that's already been sold. Your own Milestone 6 check number 10 says that's impossible, and the brief says the shop never loses order records. Find the solution that satisfies both, and explain it in a comment. It's a pattern you'll use for the rest of your career.

**Check:** after running `changes.sql`, every row of every table is still there, and `\d` shows the new shape.

## Milestone 8: Ask questions

**Goal:** `queries.sql` answers these, one query per question, using everything from Level 1 plus the join preview:

1. All active products in the Stationery category, cheapest first.
2. Every order, with the customer's name and the order status, newest first.
3. The items in order 1: product name, quantity, unit price, and the line total.
4. Products with fewer than 20 in stock, that are still active.
5. Orders that are `pending` and older than a given date.
6. All orders placed by Asha Rai.

You can't yet total an order or find customers with no orders. Those need [chapters 20](../20-counting-and-totals/notes.md) and [23](../23-outer-joins/notes.md). Write them down as "TODO" comments at the bottom of the file; you'll come back for them.

<details>
<summary>Hint</summary>

Question 3 needs the three-table pattern from chapter 17: start from `order_items`, join `products`, filter by `order_id`. Question 2 is the two-table join from chapter 16 with an `ORDER BY`.

</details>

## Milestone 9: Rebuild from nothing

**Goal:** prove the files are complete.

Connect to `postgres`, `DROP DATABASE shop;`, `CREATE DATABASE shop;`, `\c shop`. Then:

```
\i .../playground/ch19/schema.sql
\i .../playground/ch19/seed.sql
\i .../playground/ch19/changes.sql
\i .../playground/ch19/queries.sql
```

Four files, no errors, sensible output. If anything fails, fix the file, not the database, and start again from the drop.

Then look at what you've made: a database that any developer could rebuild on any machine in under a minute, from a handful of text files, with every rule from the client's brief enforced. That's professional work.

## Common mistakes

**1. Copying names instead of ids**

`customer_name` on `orders`. The whole of chapter 18 says why not. If you see yourself typing a name into any table except the one that owns it, stop.

**2. Forgetting the snapshot**

`order_items` with no `unit_price`, "because the price is in `products`". Then the client's change request to raise prices silently rewrites every past order. The brief warns you about this.

**3. `CASCADE` on the wrong key**

Deleting a product that cascades into `order_items` quietly removes lines from sold orders. Restrict, and deactivate instead.

**4. Wrong order in `schema.sql`**

`relation "customers" does not exist` because `orders` came first. Parents first to create, children first to drop.

**5. Hard-coding ids without saying so**

`seed.sql` assumes the first category is id 1. On a fresh build that's true. Write the assumption as a comment, so future-you knows why it broke if it ever does.

**6. Running `checks.sql` inside one transaction**

The first failure poisons everything after it. One statement at a time, or `ROLLBACK` between them.

## Quick recap

- Brief → nouns → tables. "Each row is one ____."
- Columns and rules come from the brief. Money is `numeric`, "when" is `timestamptz`, statuses are a `CHECK (... IN ...)`.
- Four foreign keys, each with a deliberate `ON DELETE`. Restrict where records must survive; deactivate instead of delete.
- `schema.sql`, `seed.sql`, `checks.sql`, `changes.sql`, `queries.sql`. Files are the project. The database is disposable.
- Prove rules by trying to break them. Every check must fail.
- Change the shape with `ALTER TABLE` in a transaction. Never drop a table with real data to "fix" it.

---

**Congratulations!** You've finished Level 2. 🎉 You can design a multi-table database from a brief, with the rules and links that keep its data honest. Try the [exercises](exercises.md) for extra features, then head back to the [roadmap](../README.md). Level 3 teaches you to ask the hard questions across all these tables: totals, groupings, and joins.
