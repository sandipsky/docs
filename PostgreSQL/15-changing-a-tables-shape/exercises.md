# 15 Changing a Table's Shape: Exercises

**How to do these:**

- Work in psql, connected to `practice`. Run `playground/ch06/seed.sql` first so `products` is in its 6-row starting state.
- Save each answer in `playground/ch15/ex1.sql`, `ex2.sql`, and so on. **Do them in order**: each exercise changes the table the next one uses.
- Wrap every change in `BEGIN;` ... `COMMIT;`, with a `\d products` or `SELECT` in between to check.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your work.

---

## Exercise 1 (Easy): A category for every product

1. Add a `category text` column to `products`.
2. Fill it in with `UPDATE`s: Notebook, Pen, Sticky notes and Stapler are `'Stationery'`; Desk lamp is `'Furniture'`; Backpack is `'Bags'`. Try to do it in three statements, not six.
3. Now make the column required (`NOT NULL`).
4. Prove it worked: try to insert a product with no category.

Expected `\d products` afterwards: `category | text | | not null |`.

<details>
<summary>Hint</summary>

`WHERE name IN ('Notebook', 'Pen', 'Sticky notes', 'Stapler')` sets four at once. Step 3 would have failed if you'd done it *before* step 2. Why?

</details>

---

## Exercise 2 (Easy): Better names, better types

1. Rename `on_sale` to `is_on_sale`, to match the `is_` style of boolean columns in this course.
2. Rename `added_on` to `added_at` and change its type to `timestamptz`. Select the column afterwards: what time of day did the old dates become?
3. Write a comment listing which of your earlier exercise files (chapters 07 to 10) would now be broken by these renames.

<details>
<summary>Hint</summary>

A `date` converts to a `timestamptz` automatically, at midnight in your time zone, so no `USING` is needed.

</details>

---

## Exercise 3 (Medium): Rules the data must already follow

1. Add a constraint that `price` must be `>= 0`. This should succeed. Why?
2. Try to add a constraint that `stock` must be `> 0`. Read the error. Which row is the problem?
3. Decide: is the right fix to change the *data* or to change the *rule*? Do it, and add the constraint successfully.
4. Add a constraint named `name_not_blank` so `name` can't be an empty string. Test it.

<details>
<summary>Hint</summary>

Sticky notes have 0 in stock. A shop can genuinely run out, so `>= 0` is the honest rule, and `> 0` was wrong. `CHECK (length(name) > 0)` or `CHECK (name <> '')` both work for step 4.

</details>

---

## Exercise 4 (Medium): Rewiring with the lights on

1. Widen `price` from `numeric(10, 2)` to `numeric(12, 2)`. Confirm the values are unchanged.
2. Inside a transaction that you will **roll back**, change `price` to `integer`. PostgreSQL will tell you it needs a `USING`. Give it one that rounds. Select the prices, and write a comment about which information would be lost forever if you committed. Then roll back.
3. Still thinking: `stock` is an `integer`. Someone suggests making it `numeric(10, 2)` "in case we sell half a notebook". Would the `ALTER` succeed? Would it be a good idea? Two sentences.

<details>
<summary>Hint</summary>

`ALTER COLUMN price TYPE integer USING round(price)`. The `round()` function is from chapter 24, but you can use it early.

</details>

---

## Exercise 5 (Challenge): Your first migration, and its undo

Write **two** files.

`playground/ch15/001_add_sku.sql` should, inside a single transaction:

1. Add a `sku text` column.
2. Fill it with a unique code per product, like `STA-001`, `STA-002`, `FUR-001`, `BAG-001`.
3. Make it `NOT NULL` and `UNIQUE`.
4. Drop the `is_on_sale` column (the shop has decided sales will be handled differently).
5. `COMMIT`.

`playground/ch15/001_add_sku_down.sql` should reverse every step, so running it after the first file leaves the table as it was before (an `is_on_sale` column back, with `false` everywhere, and no `sku`).

Run up, check `\d products`, run down, check again, run up again. Both should work every time in that order.

<details>
<summary>Hint 1</summary>

The "down" file can't bring back the old `is_on_sale` values, because `DROP COLUMN` destroyed them. That's normal: a down migration restores the *shape*, not always the *data*. Say so in a comment. It's also why step 4 of the up migration deserves a `BEGIN` and a hard look before `COMMIT`.

</details>

<details>
<summary>Hint 2</summary>

The `UNIQUE` constraint gets an automatic name, probably `products_sku_key`. Check `\d products` so your down file drops the right name. Or give it your own name in the up file, which is why people name constraints.

</details>
