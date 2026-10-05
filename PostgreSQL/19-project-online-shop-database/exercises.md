# 19 Project: Online Shop Database: Exercises

**How to do these:**

- These are extra features for your shop. Finish all 9 milestones in the notes first.
- Each one is a new file in `playground/ch19/`, like `002_reviews.sql`, written as a migration: `BEGIN`, changes, checks, `COMMIT`. After each, the Milestone 9 rebuild (now with one more file) must still work.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to review your files.

---

## Exercise 1 (Easy): Product reviews

Customers can review products. A review has a rating (1 to 5), optional text, and when it was written. **A customer can review a product only once.**

Design and add the table. Decide what happens to reviews when a customer is deleted, and when a product is deleted (remember products aren't deleted, they're deactivated, so what does that mean here?). Insert two reviews, then try to add a second review by the same customer for the same product.

<details>
<summary>Hint</summary>

It's a junction table between customers and products with extra facts on it (chapter 17). The "only once" rule is the composite key or a `UNIQUE (customer_id, product_id)`.

</details>

---

## Exercise 2 (Easy): Multiple addresses

The brief gave each customer one city. Real customers have several addresses (home, work, a parent's house). Move addresses into their own table: a customer has many addresses, each with a label, street, city, and whether it's the default.

Migrate the existing `city` data into the new table (one address per customer, labeled `'home'`, marked default), then drop the old column. All inside one transaction.

<details>
<summary>Hint</summary>

`INSERT INTO addresses (customer_id, label, city, is_default) SELECT id, 'home', city, true FROM customers;` copies every customer's city into a new address row. `INSERT ... SELECT` is new, but it reads naturally: insert whatever this `SELECT` returns. Then `ALTER TABLE customers DROP COLUMN city;`.

</details>

---

## Exercise 3 (Medium): Tags

Products can have any number of tags (`eco`, `bestseller`, `new`, `clearance`), and a tag applies to many products. Add `tags` and the junction table. Tag at least three products, one with three tags. Then write a query listing every product that has the `bestseller` tag.

Then, in a comment: the brief's `categories` are one-to-many (a product has one category) while tags are many-to-many. Give one example of a real shop where categories should be many-to-many too, and one where they shouldn't.

---

## Exercise 4 (Medium): Stock movements

Right now `products.stock` is a single number that gets overwritten. The owner wants to know *why* it changed: a delivery of 50, a sale of 2, a stock-take correction of −1.

1. Add a `stock_movements` table: which product, how many (positive or negative), a reason from a fixed list, and when.
2. Record the movements that would explain each product's current stock, starting from zero.
3. In a comment: `products.stock` is now a value you could calculate from `stock_movements`. Chapter 18 says "don't store what you can calculate." Should you drop `products.stock`? Argue both sides in two or three sentences, and pick one. (Chapter 38 will show how to keep a stored total correct automatically, which may change your answer.)

<details>
<summary>Hint</summary>

`quantity_change integer NOT NULL CHECK (quantity_change <> 0)` and `reason text NOT NULL CHECK (reason IN ('delivery', 'sale', 'correction', 'return'))`. Movements are a history, so this table never gets `UPDATE`d or `DELETE`d, only `INSERT`ed.

</details>

---

## Exercise 5 (Challenge): Order status history

The owner asks: "When did order 2 get shipped? And who marked it paid?" Your `status` column can't answer that; it only knows the current value.

1. Add an `order_status_history` table: which order, the status it changed **to**, when, and a `changed_by text`. Keep `orders.status` as the current value (a deliberate snapshot of the latest history row).
2. Backfill the history for the four sample orders with plausible timestamps: every order started as `pending`; paid and shipped orders have those steps too; the cancelled one went pending → cancelled.
3. Write a query showing order 2's full history in time order.
4. Now change order 3 from `pending` to `paid` the **right way**: insert a history row and update `orders.status`, in one transaction. Then explain in a comment what could go wrong if someone updates `orders.status` directly and forgets the history. Chapter 38 (triggers) is the fix; name it as a TODO.

<details>
<summary>Hint</summary>

The history table's `status` column should have the **same** `CHECK (... IN ...)` list as `orders.status`. If the list exists in two places, a future change has to update both. That's a small normalization smell, and some teams solve it with a tiny `order_statuses` lookup table and two foreign keys. Either approach is fine here; say which you chose and why.

</details>
