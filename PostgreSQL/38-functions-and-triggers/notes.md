# 38 Functions and Triggers

## What is it?

A **function** is code saved inside the database that you call from SQL, like the built-ins from chapter 24, but written by you:

```sql
SELECT id, order_total(id) FROM orders;
```

A **trigger** is a function that runs **automatically** when something happens to a table: a row is inserted, updated, or deleted. You don't call it; the event does.

## Why does it matter?

Four jobs that are awkward or impossible without them:

1. **Reuse.** "Total of an order" is written in a dozen queries. As a function, it's written once and can't drift.
2. **Rules a `CHECK` can't express.** "A price can't drop by more than half in one update" compares the new value to the old one. "Frozen accounts can't move money" (chapter 36) needs to *refuse*, not silently update zero rows. A trigger can raise an error.
3. **Bookkeeping that must never be forgotten.** `updated_at` on every change. A history row for every price change. Stock reduced when an item is sold. If the app does it, one forgotten code path breaks it. If a trigger does it, it happens every time, from every client.
4. **Operations that must be one step.** A money transfer as a single function call that locks, checks, updates, and raises, so no caller can do it halfway.

Functions and triggers put logic *in* the database, next to the data it protects. That's powerful, and it has a cost you'll read about at the end.

## Real-world example

An office with standing rules:

| Office | Database |
|---|---|
| "To work out the invoice total, use the calculator on the shelf" (a shared procedure anyone can run) | A function |
| "Every letter that arrives gets date-stamped" (nobody decides; it just happens) | A `BEFORE INSERT` trigger setting a timestamp |
| "Every price change gets written in the log book" | An `AFTER UPDATE` trigger inserting a history row |
| "Refuse any refund over 50% unless a manager signs" | A `BEFORE UPDATE` trigger that raises an error |

The stamp and the log book aren't optional and nobody has to remember them. That's what triggers buy you.

## How it works

Work in `sales`, with `\pset null '[NULL]'`. Everything is cleaned up at the end.

### A function in plain SQL

```sql
CREATE FUNCTION order_total(p_order_id integer) RETURNS numeric
LANGUAGE sql STABLE
AS $$
  SELECT coalesce(sum(quantity * unit_price), 0)
  FROM order_items
  WHERE order_id = p_order_id;
$$;
```

Piece by piece:

- `order_total(p_order_id integer)`: the name, and one parameter. Prefixing parameters with `p_` keeps them distinct from column names.
- `RETURNS numeric`: what comes back.
- `LANGUAGE sql`: the body is ordinary SQL. The result of the last statement is returned.
- `STABLE`: a promise that the function doesn't change data and gives the same answer within one statement. (`IMMUTABLE` is for pure calculations with no table access; `VOLATILE`, the default, is for anything that changes data or depends on `now()`. PostgreSQL uses these to optimize; when unsure, leave the default.)
- `$$ ... $$`: **dollar quoting**. The body contains single quotes and semicolons, so it's wrapped in `$$` instead of `'`. You'll see `$body$ ... $body$` too; same idea.

Use it like any function:

```sql
SELECT id, status, order_total(id) AS total FROM orders ORDER BY id LIMIT 4;
```

```
 id |  status   | total
----+-----------+--------
  1 | paid      |  13.00
  2 | shipped   |  32.99
  3 | shipped   | 149.00
  4 | cancelled |  45.00
```

`order_total(999)` gives `0`, thanks to the `coalesce`. One definition, used everywhere, no CTE to repeat.

A function can return a whole table too:

```sql
CREATE FUNCTION customer_orders(p_customer_id integer)
RETURNS TABLE (order_id integer, ordered_on date, total numeric)
LANGUAGE sql STABLE
AS $$
  SELECT o.id, o.ordered_at::date, sum(oi.quantity * oi.unit_price)
  FROM orders o JOIN order_items oi ON oi.order_id = o.id
  WHERE o.customer_id = p_customer_id
  GROUP BY o.id ORDER BY o.id;
$$;

SELECT * FROM customer_orders(1);
```

A parameterized view, in effect.

### PL/pgSQL: functions with logic

For `IF`, variables, loops, and errors, PostgreSQL has a procedural language called **PL/pgSQL**:

```sql
CREATE FUNCTION price_tier(p_price numeric) RETURNS text
LANGUAGE plpgsql IMMUTABLE
AS $$
BEGIN
  IF p_price < 5 THEN
    RETURN 'cheap';
  ELSIF p_price < 50 THEN
    RETURN 'mid';
  ELSE
    RETURN 'premium';
  END IF;
END;
$$;

SELECT name, price, price_tier(price) AS tier FROM products ORDER BY price DESC LIMIT 3;
```

The body sits between `BEGIN` and `END` (nothing to do with transactions; it's just the block). `IF ... THEN ... ELSIF ... ELSE ... END IF`. Every `IF` ends with `END IF`, and statements end with `;`. It reads like a stiff version of any programming language.

### A function that does things, and refuses

The bank transfer from chapter 36, as one call. Make a small `accounts` table (two rows: Asha 500, Bikram 100), then:

```sql
CREATE FUNCTION transfer(p_from integer, p_to integer, p_amount numeric) RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_balance numeric;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive, got %', p_amount;
  END IF;

  SELECT balance INTO v_balance FROM accounts WHERE id = p_from FOR UPDATE;
  IF v_balance IS NULL THEN
    RAISE EXCEPTION 'Account % does not exist', p_from;
  END IF;
  IF v_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient funds: balance is %, tried to send %', v_balance, p_amount;
  END IF;

  UPDATE accounts SET balance = balance - p_amount WHERE id = p_from;
  UPDATE accounts SET balance = balance + p_amount WHERE id = p_to;
END;
$$;
```

New pieces: `DECLARE` introduces variables (prefixed `v_`). `SELECT ... INTO v_balance` puts a query result into one. `FOR UPDATE` locks the row, as in chapter 30. And **`RAISE EXCEPTION`** stops everything with an error message; each `%` is filled from the values after the comma.

```sql
SELECT transfer(1, 2, 100);      -- works: 400 / 200
SELECT transfer(1, 2, 10000);
```

```
ERROR:  Insufficient funds: balance is 400.00, tried to send 10000
CONTEXT:  PL/pgSQL function transfer(integer,integer,numeric) line 14 at RAISE
```

A clear, specific error, and nothing changed. The function runs **inside the caller's transaction**: if you `BEGIN; SELECT transfer(1, 2, 50); ROLLBACK;`, the transfer is undone. And if anything inside the function fails, every change it made is undone too. That's the "operation that must be one step".

### Triggers

A trigger needs two things: a function that `RETURNS trigger`, and the trigger itself, which says when to run it.

**`updated_at`, the classic:**

```sql
ALTER TABLE products ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();

CREATE FUNCTION set_updated_at() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER products_set_updated_at
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

Inside a trigger function, `NEW` is the row as it's about to be written, and `OLD` is the row as it was. A **`BEFORE`** trigger can **change `NEW`** before it's saved; this one stamps the time. `RETURN NEW` says "go ahead with this row". `FOR EACH ROW` means the function runs once per affected row (an `UPDATE` of 50 rows runs it 50 times).

```sql
UPDATE products SET stock = stock WHERE id = 1 RETURNING name, updated_at;
```

The timestamp moves, though the statement never mentioned `updated_at`. Every client, every path, forever.

**An audit log, with `AFTER`:**

```sql
CREATE TABLE price_history (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  product_id integer NOT NULL REFERENCES products (id),
  old_price numeric(10, 2) NOT NULL,
  new_price numeric(10, 2) NOT NULL,
  changed_at timestamptz NOT NULL DEFAULT now(),
  changed_by text NOT NULL DEFAULT current_user
);

CREATE FUNCTION log_price_change() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.price <> OLD.price THEN
    INSERT INTO price_history (product_id, old_price, new_price)
    VALUES (OLD.id, OLD.price, NEW.price);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER products_log_price_change
AFTER UPDATE OF price ON products
FOR EACH ROW EXECUTE FUNCTION log_price_change();
```

**`AFTER`** triggers run once the row is written; they're for side effects on *other* tables. `UPDATE OF price` means only updates that mention `price` fire it. The `IF` skips updates that set the same price again.

```sql
UPDATE products SET price = 4.20 WHERE id = 1;
UPDATE products SET price = 4.20 WHERE id = 1;    -- same price: no history row
UPDATE products SET price = 3.90 WHERE id = 1;
SELECT product_id, old_price, new_price, changed_by FROM price_history;
```

```
 product_id | old_price | new_price | changed_by
------------+-----------+-----------+------------
          1 |      3.90 |      4.20 | postgres
          1 |      4.20 |      3.90 | postgres
```

Who changed what, from what, to what, when. The chapter 19 exercise about order status history: this is how you make it automatic.

**Keeping stock in sync:**

```sql
CREATE FUNCTION reduce_stock() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE products SET stock = stock - NEW.quantity WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER order_items_reduce_stock
AFTER INSERT ON order_items
FOR EACH ROW EXECUTE FUNCTION reduce_stock();
```

Now inserting an order item reduces the product's stock, automatically. And watch what happens when the trigger's update breaks a constraint:

```sql
BEGIN;
INSERT INTO order_items VALUES (12, 10, 2, 29.99);      -- USB hub stock: 30 -> 28
INSERT INTO order_items VALUES (12, 7, 100, 149.00);    -- 100 chairs, stock is 6
```

```
ERROR:  new row for relation "products" violates check constraint "products_stock_check"
CONTEXT:  SQL statement "UPDATE products SET stock = stock - NEW.quantity WHERE id = NEW.product_id"
PL/pgSQL function reduce_stock() line 3 at SQL statement
```

The `CHECK (stock >= 0)` from chapter 13 fired *inside the trigger*, which fails the `INSERT` that caused it. You can't sell what you don't have, and no app code had to check. (`ROLLBACK` to undo the first insert too.)

**Validation, with `BEFORE` and `RAISE`:**

```sql
CREATE FUNCTION block_big_price_cut() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.price < OLD.price * 0.5 THEN
    RAISE EXCEPTION 'Price cut too large for %: % -> %', OLD.name, OLD.price, NEW.price;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER products_block_big_price_cut
BEFORE UPDATE OF price ON products
FOR EACH ROW EXECUTE FUNCTION block_big_price_cut();

UPDATE products SET price = 1.00 WHERE id = 7;
```

```
ERROR:  Price cut too large for Office chair: 149.00 -> 1.00
```

A rule that compares old and new, something no `CHECK` can do. This is the proper answer to chapter 36's frozen-account problem: a `BEFORE UPDATE` trigger on `accounts` that raises when `OLD.is_frozen` and the balance changes.

### `BEFORE` or `AFTER`?

| Use `BEFORE` when you want to | Use `AFTER` when you want to |
|---|---|
| Change the row being written (`NEW.x := ...`) | Write to *other* tables (audit, stock, totals) |
| Reject the row (`RAISE EXCEPTION`) | React to something that definitely happened |
| Fill in defaults that depend on other columns | |

`BEFORE` triggers must `RETURN NEW` (or `RETURN NULL` to silently skip the row, which is rarely a good idea). `AFTER` triggers' return value is ignored, but `RETURN NEW` is the convention.

### Seeing and removing them

```
\df                      -- your functions
\d products              -- ends with a "Triggers:" section
```

```sql
DROP TRIGGER products_block_big_price_cut ON products;
DROP FUNCTION block_big_price_cut;
```

Drop the trigger before the function it uses, or use `DROP FUNCTION ... CASCADE`.

### The cost of putting logic in the database

Triggers are invisible. A developer runs `UPDATE products SET price = 1.00` and gets an error about price cuts from code they've never seen. Six months later nobody remembers that inserting an order item changes stock. Debugging "why did this row change?" means hunting through triggers.

So:

- **Prefer a `CHECK` or a foreign key** when one can express the rule. Constraints are visible in `\d`.
- **Use triggers for bookkeeping that must be universal**: timestamps, audit logs, derived counts, and rules that compare old and new. Keep them small and obvious.
- **Keep business decisions in application code** where the team can read them: pricing logic, workflow, notifications.
- **Name triggers `table_what_it_does`** and keep all of them in one `triggers.sql` in your project, so they're discoverable.
- **Document them in the table's comment or your README.** A surprise trigger is a bug waiting to be written.

Clean up: drop the four triggers and seven functions, `price_history`, `accounts`, and the `updated_at` column, and set the Notebook back to 3.90 and the Office chair to 149.00 if you changed them.

## Common mistakes

**1. Forgetting `RETURN NEW`**

A `BEFORE` trigger that returns nothing fails with `control reached end of trigger procedure without RETURN`. Always return.

**2. Side effects in `BEFORE`, changes to `NEW` in `AFTER`**

Writing to other tables works in either, but belongs in `AFTER`. Changing `NEW` in an `AFTER` trigger does nothing: the row's already written.

**3. A trigger that triggers itself**

An `AFTER UPDATE` trigger on `products` that runs `UPDATE products ...` fires itself again, forever (until PostgreSQL stops it with a stack error). Use `BEFORE` and set `NEW` instead, or guard with a condition.

**4. Single quotes instead of `$$`**

The body has quotes in it. Dollar-quote it.

**5. Too much logic in the database**

If a trigger is 80 lines of business rules, it's application code hiding in the wrong place.

**6. Not documenting triggers**

The next developer (or you, next year) will be surprised. Write them down.

## Quick recap

- `CREATE FUNCTION name(params) RETURNS type LANGUAGE sql|plpgsql AS $$ ... $$;` saves code in the database. SQL bodies for queries, PL/pgSQL for `IF`, variables, and `RAISE EXCEPTION`.
- Functions run inside the caller's transaction; if they fail, everything they did is undone.
- A **trigger** = a function `RETURNS trigger` + `CREATE TRIGGER name BEFORE|AFTER INSERT|UPDATE|DELETE ON table FOR EACH ROW EXECUTE FUNCTION f()`.
- `BEFORE` triggers modify `NEW` or reject the row. `AFTER` triggers write to other tables. `OLD` is the previous row.
- Use triggers for universal bookkeeping (timestamps, audit logs, stock) and old-vs-new rules. Prefer constraints when possible. Keep business logic in the app. Document every trigger.

---

**Next:** try the [exercises](exercises.md), then move on to [39 Full-Text Search](../39-full-text-search/notes.md).
