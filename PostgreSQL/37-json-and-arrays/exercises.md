# 37 JSON and Arrays: Exercises

**How to do these:**

- Work in psql, connected to `sales`. Run `\pset null '[NULL]'`.
- Save each answer in `playground/ch37/ex1.sql`, `ex2.sql`, and so on. End each file by dropping the columns or tables it added, so the dataset stays clean.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your work.

---

## Exercise 1 (Easy): Specs

1. Add `specs jsonb` to `products` and fill it for the four products in the notes, plus two more of your own design (the Office chair and the Backpack).
2. List every product that has a `color`, with the colour as text.
3. List every product whose specs **contain** `{"color": "black"}`, using the operator that can use an index.
4. For the Desk lamp, show the width and height as two separate text columns.

---

## Exercise 2 (Easy): Tags

1. Add `tags text[] NOT NULL DEFAULT '{}'` and tag at least five products, some with two or three tags.
2. Products with the tag `new`. Products with **both** `eco` and `bestseller`.
3. How many products have each tag? (Use `unnest`.)
4. Each category with an array of its product names, alphabetical.

<details>
<summary>Hint</summary>

"Both" is containment: `tags @> ARRAY['eco', 'bestseller']`.

</details>

---

## Exercise 3 (Medium): An API response

Write one query that returns a single JSON document for customer 1 shaped like this:

```json
{
  "customer": { "id": 1, "name": "Asha Rai", "city": "Kathmandu" },
  "orders": [
    { "order_id": 1, "status": "paid", "total": 13.00, "items": [ { "product": "Notebook", "quantity": 2 }, ... ] },
    ...
  ]
}
```

Use `jsonb_pretty` to check the shape. Every order Asha has placed should be in the array, each with its own nested `items` array.

<details>
<summary>Hint</summary>

Three levels of `jsonb_build_object`, with two `jsonb_agg` subqueries: one over orders (correlated to the customer), and inside it one over items (correlated to the order). The `total` is `(SELECT sum(quantity * unit_price) FROM order_items WHERE order_id = o.id)`.

</details>

---

## Exercise 4 (Medium): Changing JSON

With the `specs` from Exercise 1:

1. Add `"warranty_months": 12` to **every** product that has specs, in one `UPDATE`, without losing existing keys.
2. Change the Desk lamp's height to 45 with `jsonb_set`.
3. Remove `ruled` from the Notebook.
4. Create a GIN index on `specs`. `EXPLAIN` a `@>` query and a `->>` query. On this tiny table both will be Seq Scans; in a comment, say which one *could* use the index on a big table, and why the other can't.

---

## Exercise 5 (Challenge): Array or table?

Build the same feature twice and compare.

1. **Array version:** `tags text[]` on products, with a `CHECK` that only allows tags from a fixed list (`eco`, `new`, `bestseller`, `sale`). Prove the check rejects `'random'`.
2. **Table version:** `tags (id, name UNIQUE)` and `product_tags (product_id, tag_id)` as in chapter 17.
3. Write "products per tag, including tags with zero products" for **both** versions. Which one can even do it? (Think about where the list of all possible tags lives in each design.)
4. Write "rename `sale` to `clearance` everywhere" for both.
5. In a comment, decide which design this shop should use, in three sentences.

<details>
<summary>Hint 1</summary>

The check: `CHECK (tags <@ ARRAY['eco', 'new', 'bestseller', 'sale'])`. `<@` is "is contained by": every element of `tags` must be in the allowed list.

</details>

<details>
<summary>Hint 2</summary>

Renaming in the array version: `UPDATE products SET tags = array_replace(tags, 'sale', 'clearance') WHERE 'sale' = ANY (tags);` and you also have to change the `CHECK`. In the table version it's one `UPDATE tags SET name = ...`.

</details>
