# 16 Relationships and Foreign Keys

## What is it?

A **relationship** links a row in one table to a row in another: this order belongs to that customer.

A **foreign key** is how you build the link. It's a column in one table that holds the primary key of a row in another table, plus a rule that says the link must always point at a real row.

This is the "relational" in relational database. It's the most important chapter in Level 2.

## Why does it matter?

Think back to chapter 01's spreadsheet problem number 4: the same fact repeated. Here's an `orders` table built the obvious way:

| id | customer_name | customer_email | total |
|---|---|---|---|
| 1 | Asha Rai | asha@example.com | 1200.00 |
| 2 | Asha Rai | asha@exmaple.com | 350.50 |
| 3 | Bikram Shrestha | bikram@example.com | 89.99 |

Asha's email is wrong on order 2. When she changes her email, someone has to update every order. "How many customers do we have?" is unanswerable, because Asha might be one person or two. The customer isn't a *thing* here, just some text copied onto each order.

The fix is to make customers a thing: a `customers` table, where Asha exists **once**, with an `id`. Then each order stores only her `id`. Her email lives in one place. Fix it there, and every order sees the fix.

That `customer_id` column on orders is the foreign key. And the rule that comes with it stops the next problem: an order whose `customer_id` is `99`, when there's no customer 99. Without the rule, that order points at nobody. It's called an **orphan**, and foreign keys make orphans impossible.

## Real-world example

Your phone's call history doesn't store your friend's name and number in each entry. It stores **which contact** the call was with. Rename the contact, and every past call shows the new name. Delete the contact, and the phone has to decide: keep the calls as "unknown number", or remove them too?

| Phone | Database |
|---|---|
| Contacts | The `customers` table (the "one" side) |
| Call history | The `orders` table (the "many" side) |
| Each call remembers which contact | `orders.customer_id` |
| You can't log a call to a contact that doesn't exist | The foreign key rule |
| "Delete this contact and their calls?" | `ON DELETE` behaviour |

## How it works

Work in `practice`. We'll build customers and orders properly.

### The parent table first

```sql
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS customers;

CREATE TABLE customers (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name text NOT NULL,
  email text NOT NULL UNIQUE
);
```

Nothing new here. `customers` is the **parent**: the table being pointed at. (You'll also hear "the one side".)

### The child table, with the foreign key

```sql
CREATE TABLE orders (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  customer_id integer NOT NULL REFERENCES customers (id),
  ordered_at timestamptz NOT NULL DEFAULT now(),
  total numeric(10, 2) NOT NULL CHECK (total >= 0)
);
```

The new part:

```sql
customer_id integer NOT NULL REFERENCES customers (id)
```

Read it as: "`customer_id` holds whole numbers, must always be filled in, and every value must be the `id` of a real row in `customers`."

- `REFERENCES customers (id)` creates the foreign key. `orders` is the **child** (the "many side").
- The type must match the parent's primary key: `integer` here, because `customers.id` is `integer`.
- `NOT NULL` because every order must have a customer. Leave it off when the link is optional (a task that may or may not belong to a project).

This is a **one-to-many** relationship: one customer, many orders. Each order has exactly one customer.

### Add some data

```sql
INSERT INTO customers (name, email) VALUES
  ('Asha Rai', 'asha@example.com'),
  ('Bikram Shrestha', 'bikram@example.com'),
  ('Chandra Gurung', 'chandra@example.com');

INSERT INTO orders (customer_id, total) VALUES
  (1, 1200.00),
  (1, 350.50),
  (2, 89.99);
```

Asha (id 1) has two orders, Bikram (id 2) has one, Chandra (id 3) has none. Her email is stored exactly once.

### The rule in action: no orphans

```sql
INSERT INTO orders (customer_id, total) VALUES (99, 10.00);
```

```
ERROR:  insert or update on table "orders" violates foreign key constraint "orders_customer_id_fkey"
DETAIL:  Key (customer_id)=(99) is not present in table "customers".
```

There's no customer 99, so there can be no order for customer 99. Refused. The constraint got an automatic name: `orders_customer_id_fkey`.

The rule works in the other direction too:

```sql
DELETE FROM customers WHERE id = 1;
```

```
ERROR:  update or delete on table "customers" violates foreign key constraint "orders_customer_id_fkey" on table "orders"
DETAIL:  Key (id)=(1) is still referenced from table "orders".
```

Asha has orders. Deleting her would orphan them. Refused. **A foreign key protects both ends of the link.**

### Deciding what happens on delete

Refusing is the default, and often right. But sometimes you want something else. You choose with `ON DELETE`:

| Option | When the parent row is deleted... | Good for |
|---|---|---|
| `ON DELETE RESTRICT` (or `NO ACTION`, the default) | Refuse the delete. | Orders, payments, anything that's a record you must keep |
| `ON DELETE CASCADE` | Delete the child rows too. | Comments on a post, items in a cart, anything meaningless without its parent |
| `ON DELETE SET NULL` | Keep the children, clear the link to NULL. The column must be nullable. | A task whose project was deleted, a post whose author left |

For example, comments that should vanish with their post:

```sql
post_id integer NOT NULL REFERENCES posts (id) ON DELETE CASCADE
```

A task that can outlive its project:

```sql
project_id integer REFERENCES projects (id) ON DELETE SET NULL
```

Pick deliberately, every time. `CASCADE` on the wrong table quietly deletes things you wanted. For `orders`, the default refusal is correct: a business never wants sales records to disappear. If a customer leaves, you mark them inactive instead ([chapter 19](../19-project-online-shop-database/notes.md) does exactly this).

There's also `ON UPDATE CASCADE`, for when a parent's primary key changes. With surrogate ids that never change, you'll rarely need it. It matters with natural keys, like the country codes in chapter 14's exercises.

### Seeing the links: `\d`

```
\d orders
```

At the bottom:

```
Foreign-key constraints:
    "orders_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES customers(id)
```

And the parent knows about it too:

```
\d customers
```

```
Referenced by:
    TABLE "orders" CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES customers(id)
```

### Order matters

Because children depend on parents:

- **Create** parents before children. `CREATE TABLE orders` fails with `relation "customers" does not exist` if customers isn't there yet.
- **Insert** parents before children. You can't order for customer 3 before customer 3 exists.
- **Delete** children before parents, unless `ON DELETE CASCADE` does it for you.
- **Drop** children before parents. That's why the top of this chapter dropped `orders` first. Or use `DROP TABLE customers CASCADE`, which drops the foreign key constraints on dependent tables for you (but not the tables themselves).

### Adding a foreign key to an existing table

```sql
ALTER TABLE orders
  ADD CONSTRAINT orders_customer_id_fkey
  FOREIGN KEY (customer_id) REFERENCES customers (id);
```

Every existing `customer_id` must already match a real customer, or the `ALTER` is refused. Same principle as chapter 15: clean the data, then add the rule.

### Naming convention

The foreign key column is the parent table's name, made singular, plus `_id`: `customer_id`, `project_id`, `post_id`. Follow this and anyone reading your tables knows instantly which table each column points at.

### One-to-one

Sometimes each parent has at most **one** child: a customer has one profile with their address and preferences. That's a foreign key with `UNIQUE` on it:

```sql
CREATE TABLE customer_profiles (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  customer_id integer NOT NULL UNIQUE REFERENCES customers (id) ON DELETE CASCADE,
  address text,
  newsletter boolean NOT NULL DEFAULT false
);
```

`UNIQUE` means no customer can appear twice, so it's one profile each. People use one-to-one to split rarely used or sensitive columns away from the main table. You won't need it often.

### Drawing it

A picture helps when there are more than two tables:

```
customers                          orders
──────────────                     ──────────────
id          ◄───────────────────   customer_id
name                               id
email                              ordered_at
                                   total

one customer ───< many orders
```

The arrow goes from the foreign key to the primary key it references. The `───<` with a fork on the "many" end is the standard way to draw one-to-many; you'll see it in every database diagram.

### A sneak peek: seeing both tables together

You've got the customer's name in one table and their orders in another. How do you see them side by side? With a `JOIN`:

```sql
SELECT orders.id, customers.name, orders.total
FROM orders
JOIN customers ON customers.id = orders.customer_id;
```

```
 id |      name       |  total
----+-----------------+---------
  1 | Asha Rai        | 1200.00
  2 | Asha Rai        |  350.50
  3 | Bikram Shrestha |   89.99
(3 rows)
```

`JOIN customers ON customers.id = orders.customer_id` says "for each order, find the customer whose `id` matches the order's `customer_id`, and line them up." Chandra has no orders, so Chandra doesn't appear.

This is a preview. [Chapter 22](../22-joins/notes.md) explains joins properly, and [chapter 23](../23-outer-joins/notes.md) shows how to include Chandra. For now, it's enough to know the link you built can be followed.

## Common mistakes

**1. Copying the parent's data into the child**

`customer_name` in `orders`. That's the spreadsheet all over again. Store the `customer_id`, and look up the name when you need it.

**2. An id column with no `REFERENCES`**

`customer_id integer` on its own is just a number. Nothing stops `99`. The word `REFERENCES` is what makes it a relationship.

**3. Type mismatch**

```sql
customer_id text REFERENCES customers (id)
```

```
ERROR:  foreign key constraint "orders_customer_id_fkey" cannot be implemented
DETAIL:  Key columns "customer_id" and "id" are of incompatible types: text and integer.
```

Match the parent's type exactly.

**4. The foreign key on the wrong side**

Putting `order_id` in `customers`. A customer has *many* orders. Which one would it hold? The foreign key always goes on the **many** side.

**5. `CASCADE` by habit**

Every `ON DELETE CASCADE` is a decision that deleting one row should silently delete others. Right for comments. Catastrophic for orders. Choose each time.

**6. Creating or dropping in the wrong order**

`relation "customers" does not exist` when creating; `cannot drop table customers because other objects depend on it` when dropping. Parents first to create, children first to drop.

## Quick recap

- A **foreign key** is a column that holds another table's primary key, plus the rule that it must point at a real row. Written `column type REFERENCES parent (id)`.
- It prevents **orphans** in both directions: no child without a parent, no deleting a parent that still has children.
- **One-to-many:** the foreign key goes on the **many** side. Name it `parent_id`.
- `ON DELETE RESTRICT` (default) refuses, `CASCADE` deletes children too, `SET NULL` unlinks them. Choose on purpose.
- Parents before children when creating and inserting; children before parents when deleting and dropping.
- `JOIN ... ON` follows the link to show both tables together. Chapter 22 covers it fully.

---

**Next:** try the [exercises](exercises.md), then move on to [17 Many-to-Many Relationships](../17-many-to-many-relationships/notes.md).
