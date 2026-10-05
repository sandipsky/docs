# 13 Constraints

## What is it?

A **constraint** is a rule you attach to a table. Every time a row is added or changed, PostgreSQL checks the rule, and refuses anything that breaks it.

The four you'll use every day:

| Constraint | The rule |
|---|---|
| `NOT NULL` | This column must always have a value. |
| `UNIQUE` | No two rows may have the same value here. |
| `CHECK (...)` | This condition must be true for every row. |
| `DEFAULT ...` | If no value is given, use this one. (Not strictly a constraint, but it lives with them.) |

Two more, `PRIMARY KEY` and `FOREIGN KEY`, get their own chapters next.

## Why does it matter?

Types stop `'ten'` from going in a price column. But types don't stop:

- a price of `-5`,
- a product with no name,
- two users with the same email,
- a rating of `11` on a 1-to-5 scale.

Constraints do. And here's the key point: the check happens **in the database**, so it applies to *everyone* who ever writes to that table. Your React app, a colleague's Python script, a hurried fix typed into psql at midnight. Every one of them hits the same rule. An app can forget to validate. The database never forgets.

Think of it as the last line of defence. Your app should check things too, so it can show a friendly message. But the database is the one that can't be bypassed.

## Real-world example

A bouncer at the door of a club:

| The bouncer says | Constraint |
|---|---|
| "You must be a person, not a dog" | The column's type |
| "No entry without ID" | `NOT NULL` |
| "That ticket's already been used" | `UNIQUE` |
| "You must be 18 or over" | `CHECK (age >= 18)` |
| "No coat? Here's a house one" | `DEFAULT` |

One bouncer, one door, every guest checked the same way.

## How it works

Work in `practice`. Let's rebuild the `products` table with rules this time. (Your seed version of `products` will be replaced; you can always recreate it with your chapter 06 seed file.)

```sql
DROP TABLE IF EXISTS products;

CREATE TABLE products (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name text NOT NULL,
  sku text NOT NULL UNIQUE,
  price numeric(10, 2) NOT NULL CHECK (price >= 0),
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

(A **SKU**, "stock keeping unit", is a shop's own code for a product, like `PEN-001`.)

Constraints go right after the type, and a column can have several. Let's break each one on purpose.

### `NOT NULL`

```sql
INSERT INTO products (sku, price) VALUES ('PEN-001', 1.20);
```

```
ERROR:  null value in column "name" of relation "products" violates not-null constraint
DETAIL:  Failing row contains (1, null, PEN-001, 1.20, 0, t, 2026-09-30 10:15:02.11+05:45).
```

No name given, so `name` would be NULL, and the rule says it can't be. The whole row is refused. Notice the `DETAIL` line shows you the row PostgreSQL *would* have inserted, with the defaults filled in. That's handy for debugging.

(One small thing: even a failed insert uses up an id number. The next successful row will be `2`, not `1`. Gaps like this are normal.)

**When to use it:** almost always. A column that's *allowed* to be NULL should be a deliberate decision: "this really can be unknown" (a finished date on an unread book). Everything else gets `NOT NULL`.

### `UNIQUE`

```sql
INSERT INTO products (name, sku, price) VALUES ('Pen', 'PEN-001', 1.20);
INSERT INTO products (name, sku, price) VALUES ('Blue pen', 'PEN-001', 1.50);
```

```
INSERT 0 1
ERROR:  duplicate key value violates unique constraint "products_sku_key"
DETAIL:  Key (sku)=(PEN-001) already exists.
```

The first insert works. The second tries to reuse the SKU and is refused. PostgreSQL named the constraint for you: `products_sku_key`, from the table and column.

Two things to know about `UNIQUE`:

- It's **case-sensitive**: `'PEN-001'` and `'pen-001'` are different values. For emails, that's a problem you'll solve in [chapter 24](../24-built-in-functions/notes.md) by storing them in lowercase.
- On its own, it **allows several NULLs**, because two unknowns aren't "the same value". That's why you'll usually see `NOT NULL UNIQUE` together.

### `CHECK`

```sql
INSERT INTO products (name, sku, price) VALUES ('Free pen', 'PEN-002', -1.00);
```

```
ERROR:  new row for relation "products" violates check constraint "products_price_check"
DETAIL:  Failing row contains (3, Free pen, PEN-002, -1.00, 0, t, 2026-09-30 10:16:40.52+05:45).
```

`CHECK` takes any condition that's true or false, the same kind you write after `WHERE`:

```sql
CHECK (price >= 0)
CHECK (rating BETWEEN 1 AND 5)
CHECK (status IN ('draft', 'published', 'archived'))
CHECK (email LIKE '%@%')
CHECK (length(name) > 0)
```

That third one, `IN (...)`, is how you make a column that only accepts a fixed set of words. Very common.

**The NULL catch.** A `CHECK` only refuses rows where the condition is **false**. If the column is NULL, the condition is *unknown*, and unknown is let through. So `CHECK (rating BETWEEN 1 AND 5)` on its own still allows a NULL rating. If you don't want that, add `NOT NULL` too. This is the same three-way logic you met in [chapter 08](../08-filtering-rows/notes.md).

### `DEFAULT`

```sql
INSERT INTO products (name, sku, price) VALUES ('Stapler', 'STA-001', 8.00)
RETURNING *;
```

```
 id |  name   |   sku   | price | stock | is_active |          created_at
----+---------+---------+-------+-------+-----------+-------------------------------
  4 | Stapler | STA-001 |  8.00 |     0 | t         | 2026-09-30 10:18:05.30411+05:45
```

You gave three values and got seven. `stock` became `0`, `is_active` became `true`, and `created_at` became the current moment, all from their defaults.

`DEFAULT now()` is the one you'll write most. Every table that records "things happening" wants a `created_at timestamptz NOT NULL DEFAULT now()`. The `now()` runs at the moment of each insert, so every row gets its own time.

Two rules about defaults:

- A default is used only when you **leave the column out** (or write the word `DEFAULT` in its place). If you write `NULL` explicitly, you get NULL, and then `NOT NULL` will refuse it.
- `DEFAULT` and `NOT NULL` are a natural pair: "must have a value, and here's a sensible one if you don't say".

### Rules that involve two columns

A constraint that compares columns goes at the **end** of the table, after the last column. You can also give it your own name with `CONSTRAINT`:

```sql
CREATE TABLE events (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name text NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  CONSTRAINT ends_after_start CHECK (ends_at > starts_at)
);
```

Now an event that ends before it starts gets:

```
ERROR:  new row for relation "events" violates check constraint "ends_after_start"
```

Your own name makes the error mean something. Naming is optional for single-column constraints, where the automatic names are fine.

`UNIQUE` can also cover a **combination** of columns:

```sql
UNIQUE (room_id, booked_on)
```

That means "the same room can't be booked twice on the same day", while still letting the room appear on many days and many rooms appear on one day. You'll use this a lot in [chapter 17](../17-many-to-many-relationships/notes.md).

### Seeing the rules: `\d`

```
\d products
```

```
                                Table "public.products"
   Column   |           Type           | Collation | Nullable |           Default
------------+--------------------------+-----------+----------+------------------------------
 id         | integer                  |           | not null | generated always as identity
 name       | text                     |           | not null |
 sku        | text                     |           | not null |
 price      | numeric(10,2)            |           | not null |
 stock      | integer                  |           | not null | 0
 is_active  | boolean                  |           | not null | true
 created_at | timestamp with time zone |           | not null | now()
Indexes:
    "products_pkey" PRIMARY KEY, btree (id)
    "products_sku_key" UNIQUE CONSTRAINT, btree (sku)
Check constraints:
    "products_price_check" CHECK (price >= 0::numeric)
    "products_stock_check" CHECK (stock >= 0)
```

Everything is listed: `not null` in the Nullable column, defaults, the `UNIQUE` (shown under Indexes, because that's how PostgreSQL enforces it), and the checks. `timestamp with time zone` is the long name for `timestamptz`.

### Constraints apply to `UPDATE` too

Rules aren't only checked on the way in:

```sql
UPDATE products SET stock = stock - 5 WHERE sku = 'STA-001';
```

```
ERROR:  new row for relation "products" violates check constraint "products_stock_check"
```

Stock was 0; 0 minus 5 is negative; refused. This is how a `CHECK (balance >= 0)` on a bank account stops an overdraft, no matter which app tries it.

### Adding rules to an existing table

You can add or remove constraints later with `ALTER TABLE` ([chapter 15](../15-changing-a-tables-shape/notes.md)). The catch: every existing row has to pass the new rule, or the `ALTER` is refused. So clean the data first, then add the rule.

### What constraints can't do

They check **shape**, not **meaning**. A title of `'Jane Austen'` in a `title text NOT NULL` column passes every rule. `'Kathmandu'` and `'kathmandu'` are both valid text. Constraints stop nonsense; they don't stop mistakes that look like valid data. For that you need good design (chapters 16 to 18) and careful people.

## Common mistakes

**1. Forgetting `NOT NULL`**

The most common one. A `CHECK` lets NULL through, `UNIQUE` lets several NULLs through, and then your "required" column is half empty. Make `NOT NULL` your default habit.

**2. Trusting the app to validate**

"Our React form already checks the price is positive." Then someone writes a script, or edits in pgAdmin, or a second app appears. Put the rule in the database too.

**3. A `CHECK` that's too strict for real life**

`CHECK (length(phone) = 10)` breaks the moment someone from another country signs up. `CHECK (age >= 18)` blocks a legitimate 17-year-old with parental consent. Only encode rules you're sure about.

**4. `UNIQUE` on something that legitimately repeats**

Two customers can share a name. `UNIQUE` belongs on emails, usernames, SKUs, and codes, not on names.

**5. `DEFAULT 'now'` instead of `DEFAULT now()`**

With quotes, `'now'` is a piece of text that PostgreSQL converts to a time **once, when the table is created**, and then every row gets that same stale time. With brackets, `now()` is a function that runs for each insert. Always the brackets.

**6. Expecting a default to rescue an explicit `NULL`**

`INSERT INTO products (name, sku, price, stock) VALUES ('x', 'X-1', 1, NULL)` puts NULL in `stock`, and `NOT NULL` refuses it. Defaults only fill in what you leave out.

## Quick recap

- Constraints are rules the database checks on every `INSERT` and `UPDATE`, for everyone, always.
- `NOT NULL`: must have a value. Use it on almost every column.
- `UNIQUE`: no repeats. Case-sensitive, and allows several NULLs unless combined with `NOT NULL`.
- `CHECK (condition)`: any true/false rule. NULL passes, so pair with `NOT NULL`. `IN (...)` gives a fixed set of allowed values.
- `DEFAULT value`: used when the column is left out. `DEFAULT now()` for timestamps, with brackets.
- Two-column rules and your own names go at the end: `CONSTRAINT name CHECK (...)`, `UNIQUE (a, b)`.
- `\d table` shows every rule. Read the error's `DETAIL` line when something is refused.

---

**Next:** try the [exercises](exercises.md), then move on to [14 Primary Keys](../14-primary-keys/notes.md).
