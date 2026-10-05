# 37 JSON and Arrays

## What is it?

Two column types that hold **more than one value** in a single cell:

- **`jsonb`** holds a whole JSON object (or array, or anything JSON): `{"color": "black", "pages": 200, "ruled": true}`. If you've done the JavaScript course, it's an object, stored in a column.
- **Arrays** like `text[]` or `integer[]` hold a list of values of one type: `{eco, bestseller}`.

Yes, this breaks chapter 02's "one value per cell" rule. On purpose, in specific situations. This chapter is about what those situations are, and how to work with the data once it's there.

## Why does it matter?

Three real problems that plain columns handle badly:

1. **Attributes that differ by product.** A notebook has a page count and ruling. A lamp has bulbs and dimensions. A USB hub has ports. You can't make a column for every attribute of every kind of product; most would be NULL for most rows. A `specs jsonb` column holds whatever each product needs.
2. **Data that arrives as JSON.** APIs send JSON. Webhooks send JSON. Sometimes you want to store exactly what arrived and pick it apart later.
3. **Small, simple lists.** A handful of tags on a product. Chapter 17 taught the proper many-to-many table, and that's still right when tags need their own rows (descriptions, counts, foreign keys). For a free-form list that's only ever read with its parent row, an array is simpler.

And one more: your API will *send* JSON. PostgreSQL can build the exact JSON document your React app expects, nested items and all, in one query.

## Real-world example

A paper form with fixed boxes (name, date, amount) and a blank area at the bottom labelled **"Other details"**. The fixed boxes are columns: everyone fills them in, you can sort and total them. The blank area is `jsonb`: each form has whatever's relevant written there, and you can still search it, but you wouldn't design the whole form as one blank area.

## How it works

Work in `sales`, with `\pset null '[NULL]'`. Everything here is cleaned up at the end so later chapters see the normal dataset.

### `json` vs `jsonb`

PostgreSQL has both. **Always use `jsonb`.** `json` stores the exact text you typed (spaces, key order, duplicate keys). `jsonb` parses it into a binary form that's faster to query and can be indexed:

```sql
SELECT '{"a":1, "a":2, "b":  3}'::json AS json_keeps, '{"a":1, "a":2, "b":  3}'::jsonb AS jsonb_normalizes;
```

```
       json_keeps        | jsonb_normalizes
-------------------------+------------------
 {"a":1, "a":2, "b":  3} | {"a": 2, "b": 3}
```

The only reason to use `json` is when you must preserve the exact original text. That's rare.

### Adding JSON data

```sql
ALTER TABLE products ADD COLUMN specs jsonb;

UPDATE products SET specs = '{"color": "black", "pages": 200, "ruled": true}' WHERE id = 1;
UPDATE products SET specs = '{"color": "blue", "pack_size": 10}' WHERE id = 2;
UPDATE products SET specs = '{"color": "white", "bulbs": 1, "dimensions": {"width_cm": 15, "height_cm": 40}}' WHERE id = 6;
UPDATE products SET specs = '{"color": "black", "ports": 4, "usb_c": true}' WHERE id = 10;
```

JSON goes in as text inside single quotes, with double quotes for keys and string values (that's JSON's rule, not SQL's). Four products, four different shapes, one column. Invalid JSON is refused:

```sql
UPDATE products SET specs = '{"color": black}' WHERE id = 2;
```

```
ERROR:  invalid input syntax for type json
DETAIL:  Token "black" is invalid.
```

### Reading values: `->` and `->>`

```sql
SELECT name, specs->>'color' AS color, specs->'pages' AS pages_json, specs->>'pages' AS pages_text
FROM products WHERE specs IS NOT NULL ORDER BY id;
```

```
   name    | color | pages_json | pages_text
-----------+-------+------------+------------
 Notebook  | black | 200        | 200
 Pen       | blue  | [NULL]     | [NULL]
 Desk lamp | white | [NULL]     | [NULL]
 USB hub   | black | [NULL]     | [NULL]
```

Two arrows, and the difference matters:

- `->` gives you the value **as JSON** (still `jsonb`). Use it to go deeper.
- `->>` gives you the value **as text**. Use it when you want to display, compare, or cast.

Missing keys give NULL, not an error.

For nested values, chain `->` and finish with `->>`, or use `#>>` with a path:

```sql
SELECT specs->'dimensions'->>'height_cm' AS height, specs #>> '{dimensions,height_cm}' AS height2
FROM products WHERE id = 6;
```

Both give `40`.

Everything from `->>` is **text**. To do maths, cast:

```sql
SELECT name, (specs->>'pages')::integer * 2 AS double_pages FROM products WHERE specs ? 'pages';
```

```
   name   | double_pages
----------+--------------
 Notebook |          400
```

### Filtering on JSON

Three ways, from simplest to most powerful:

```sql
SELECT name FROM products WHERE specs->>'color' = 'black';          -- compare extracted text
SELECT name FROM products WHERE specs @> '{"color": "black"}';       -- containment
SELECT name FROM products WHERE specs ? 'ports';                     -- key exists
```

The first two both return Notebook and USB hub. The `@>` operator means "contains this JSON": the row's `specs` must have everything on the right. It can check several keys at once (`'{"color": "black", "usb_c": true}'`) and, crucially, **it can use an index**:

```sql
CREATE INDEX idx_products_specs ON products USING gin (specs);
```

A **GIN** index (generalized inverted index) indexes every key and value inside the JSON, so `@>` and `?` queries stay fast on millions of rows. `->>` comparisons can't use it (same rule as chapter 31: a function on the column defeats the index). When a JSON query matters for speed, write it with `@>`.

### Changing JSON

```sql
UPDATE products SET specs = specs || '{"ruled": false, "cover": "hard"}' WHERE id = 1 RETURNING specs;
```

```
 {"color": "black", "cover": "hard", "pages": 200, "ruled": false}
```

`||` merges: new keys are added, existing keys are overwritten. For a nested value, `jsonb_set(target, path, new_value)`:

```sql
UPDATE products SET specs = jsonb_set(specs, '{dimensions,height_cm}', '42') WHERE id = 6
RETURNING specs->'dimensions' AS dimensions;
```

```
 {"width_cm": 15, "height_cm": 42}
```

And `-` removes a key:

```sql
UPDATE products SET specs = specs - 'cover' WHERE id = 1 RETURNING specs;
```

Note that all of these **replace the whole column value**. JSON isn't edited in place; you compute the new document and store it. That's fine for documents of a few kilobytes, and a reason not to store huge ones.

### Looking inside

```sql
SELECT jsonb_pretty(specs) FROM products WHERE id = 6;               -- indented, readable
SELECT key, value FROM products, jsonb_each(specs) WHERE id = 10;    -- one row per key
SELECT jsonb_object_keys(specs) FROM products WHERE id = 6;          -- just the keys
```

`jsonb_each` turns an object into rows, which means you can `GROUP BY key` or count how many products have each attribute: the "schemaless" data becomes queryable again.

### Building JSON for your API

This is the part that'll change how you write back ends. One product as JSON:

```sql
SELECT jsonb_build_object('id', id, 'name', name, 'price', price) AS product FROM products WHERE id = 1;
```

```
 {"id": 1, "name": "Notebook", "price": 3.90}
```

`jsonb_build_object` takes key, value, key, value. `jsonb_agg` collects many rows into a JSON array. Together, with a subquery, they build a nested document:

```sql
SELECT jsonb_pretty(jsonb_build_object(
  'order_id', o.id,
  'customer', c.name,
  'items', (
    SELECT jsonb_agg(jsonb_build_object('product', p.name, 'quantity', oi.quantity, 'unit_price', oi.unit_price) ORDER BY p.name)
    FROM order_items oi JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = o.id
  )
)) AS order_document
FROM orders o JOIN customers c ON c.id = o.customer_id
WHERE o.id = 5;
```

```
{
    "items": [
        {"product": "Notebook", "quantity": 3, "unit_price": 3.50},
        {"product": "USB hub", "quantity": 1, "unit_price": 29.99},
        {"product": "Wireless mouse", "quantity": 1, "unit_price": 15.75}
    ],
    "customer": "Dipesh Thapa",
    "order_id": 5
}
```

That's exactly what a `GET /orders/5` endpoint would return, built by the database in one round trip, with no loop in your code to fetch the items (the N+1 problem from chapter 32, avoided). [Chapter 40](../40-connecting-from-nodejs/notes.md) sends this straight to a browser.

### Arrays

```sql
ALTER TABLE products ADD COLUMN tags text[] NOT NULL DEFAULT '{}';

UPDATE products SET tags = ARRAY['eco', 'bestseller'] WHERE id = 1;
UPDATE products SET tags = '{bestseller,new}' WHERE id = 2;
UPDATE products SET tags = ARRAY['new'] WHERE id = 10;

SELECT name, tags FROM products WHERE id IN (1, 2, 10) ORDER BY id;
```

```
   name   |       tags
----------+------------------
 Notebook | {eco,bestseller}
 Pen      | {bestseller,new}
 USB hub  | {new}
```

Two ways to write one: `ARRAY['a', 'b']` or the text form `'{a,b}'`. `'{}'` is an empty array, which is what the default gives every other product (not NULL: an empty list is a known fact, "no tags").

**Searching arrays:**

```sql
SELECT name FROM products WHERE 'bestseller' = ANY (tags);     -- has this tag
SELECT name FROM products WHERE tags @> ARRAY['new'];           -- contains all of these
```

`= ANY` is "equals at least one element". `@>` is containment again, and again it's the one a GIN index can speed up (`CREATE INDEX ... USING gin (tags)`).

**Working with arrays:**

```sql
SELECT name, cardinality(tags) AS tag_count, tags[1] AS first_tag FROM products WHERE cardinality(tags) > 0;
```

`cardinality()` is the length. **Array positions start at 1**, not 0: `tags[1]` is the first tag.

```sql
UPDATE products SET tags = array_append(tags, 'sale') WHERE id = 1 RETURNING tags;    -- {eco,bestseller,sale}
UPDATE products SET tags = array_remove(tags, 'sale') WHERE id = 1 RETURNING tags;    -- {eco,bestseller}
```

**Turning an array into rows** (and back) is the key trick:

```sql
SELECT tag, count(*) FROM products, unnest(tags) AS tag GROUP BY tag ORDER BY 2 DESC, 1;
```

```
    tag     | count
------------+-------
 bestseller |     2
 new        |     2
 eco        |     1
```

`unnest` makes one row per element, and then every tool from Level 3 applies. The reverse, `array_agg`, collects rows into an array; you've been using its cousin `string_agg` since chapter 21:

```sql
SELECT c.name AS category, array_agg(p.name ORDER BY p.name) AS products
FROM products p JOIN categories c ON c.id = p.category_id
GROUP BY c.name ORDER BY c.name;
```

```
  category   |                         products
-------------+-----------------------------------------------------------
 Bags        | {Backpack,"Laptop sleeve"}
 Electronics | {"USB hub","Wireless mouse"}
 Furniture   | {"Desk lamp","Office chair"}
 Stationery  | {Notebook,Pen,Stapler,"Sticky notes","Whiteboard marker"}
```

### Array or table?

Chapter 17's `book_genres` table and a `genres text[]` column solve the same problem. Pick by asking:

| Question | Array | Junction table |
|---|---|---|
| Do tags need their own data (description, colour, owner)? | No | **Yes** |
| Must every tag be a valid, known one? | Only with a `CHECK (tags <@ ARRAY[...])` | **Yes**, via foreign key |
| Is "all products with tag X" a hot query? | Fine with a GIN index | Fine with the FK index |
| Do you rename a tag everywhere at once? | Painful | **One `UPDATE`** |
| Is it a short list read with its row and rarely queried alone? | **Yes** | Overkill |

Rule of thumb: arrays for small lists of plain values that belong to one row. Tables for anything that's a *thing* in its own right. The same logic applies to `jsonb` vs columns: if you filter, join, or `GROUP BY` a value regularly, it wants to be a real column.

Clean up:

```sql
ALTER TABLE products DROP COLUMN specs, DROP COLUMN tags;
```

## Common mistakes

**1. `->` when you meant `->>`**

`specs->'color' = 'black'` compares JSON to text and fails or misbehaves. Comparing or displaying: `->>`. Going deeper: `->`.

**2. Forgetting that `->>` is text**

`specs->>'pages' > 100` compares text to a number. Cast: `(specs->>'pages')::integer`.

**3. Everything in one `jsonb` column**

"We'll just store the whole form as JSON." Six months later, nothing can be validated, indexed, or joined. Columns for what you know, JSON for the genuinely variable rest.

**4. `json` instead of `jsonb`**

Slower, no indexing, no containment operators. `jsonb`.

**5. Arrays for relationships that need integrity**

An `integer[]` of product ids has no foreign key: it can hold ids that don't exist. Lists of *references* belong in a junction table.

**6. Zero-based indexing**

`tags[0]` is NULL. Arrays start at 1.

## Quick recap

- `jsonb` stores a JSON document in one column. Use it for attributes that vary by row and for data that arrives as JSON. Never `json`.
- `->` gives JSON (go deeper), `->>` gives text (compare, display, cast). `#>>` takes a path.
- Filter with `@>` (containment) and `?` (key exists); those can use a **GIN index**. Change with `||`, `jsonb_set`, and `-`.
- `jsonb_build_object` and `jsonb_agg` build nested API responses in one query.
- Arrays (`text[]`) hold small lists. `ANY`, `@>`, `cardinality`, `unnest` (array to rows), `array_agg` (rows to array). Positions start at 1.
- If you filter, join, or group on it regularly, make it a real column or a real table.

---

**Next:** try the [exercises](exercises.md), then move on to [38 Functions and Triggers](../38-functions-and-triggers/notes.md).
