# 34 Users, Roles and Permissions

## What is it?

So far you've done everything as `postgres`, the **superuser**, who can do anything to anything. That's fine for learning. It's dangerous for a real system.

A **role** is an account in PostgreSQL. It can be a person, a program, or a group. **Permissions** (PostgreSQL calls them privileges) say what each role may do: read this table, write that one, nothing at all to a third.

```sql
CREATE ROLE reporter LOGIN PASSWORD 'report123';
GRANT SELECT ON ALL TABLES IN SCHEMA public TO reporter;
```

Now `reporter` can read every table and change nothing.

## Why does it matter?

Three reasons, in order of how soon they'll bite you:

1. **Mistakes.** A report script that connects as a read-only role can't accidentally `DELETE FROM orders`. The database says no, before the damage.
2. **Attackers.** If your web app's database password leaks (it happens), an app role that can only read and insert does far less harm than a superuser.
3. **Privacy.** The analyst needs sales numbers, not customer emails. A role that can see a view without the email column solves it.

The principle is called **least privilege**: every role gets exactly what it needs to do its job, and nothing else. It's the single most effective security habit in databases, and it costs nothing.

## Real-world example

Keys in an office building:

| Office | PostgreSQL |
|---|---|
| The master key that opens everything | The `postgres` superuser |
| A visitor badge: read the noticeboards, open no doors | A read-only role |
| A staff key: your own office and the shared kitchen | An app role: write to its tables, read the rest |
| "All cleaners get these doors" | A group role, with people added to it |
| Someone leaves: take the key back | `REVOKE`, then `DROP ROLE` |

Nobody gives the visitor the master key "because it's easier".

## How it works

Work as `postgres` in `sales`, in one psql window. You'll open a second window to connect as the new roles.

### Creating a role that can log in

```sql
CREATE ROLE reporter LOGIN PASSWORD 'report123';
```

`LOGIN` means this role can connect (a role without `LOGIN` is a group, below). The password is for connecting over the network, which includes your own laptop's SQL Shell.

See all roles:

```
\du
```

```
 Role name |                         Attributes
-----------+------------------------------------------------------------
 postgres  | Superuser, Create role, Create DB, Replication, Bypass RLS
 reporter  |
```

The new role has no attributes: it's an ordinary account.

### Connecting as the new role

Open a second SQL Shell. When it asks for the username, type `reporter` instead of accepting `postgres`, then the password `report123`. (Or in a terminal: `psql -U reporter -d sales`.) The prompt will be `sales=>`, with `>` instead of `#`: you're not a superuser.

Try to read something:

```sql
SELECT count(*) FROM orders;
```

```
ERROR:  permission denied for table orders
```

A brand-new role can connect, and that's all. It can't read a single table. This is least privilege by default, and it's exactly right.

### Granting read access

Back in the `postgres` window:

```sql
GRANT CONNECT ON DATABASE sales TO reporter;
GRANT USAGE ON SCHEMA public TO reporter;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO reporter;
```

Three layers:

- `CONNECT ON DATABASE`: may connect to this database at all. (Often granted to everyone by default, which is why `reporter` could connect before, but say it explicitly.)
- `USAGE ON SCHEMA public`: may *see* the tables in the `public` schema (the section of the database where your tables live).
- `SELECT ON ALL TABLES`: may read them.

Now in the `reporter` window:

```sql
SELECT count(*) FROM orders;              -- 12. Works.
INSERT INTO categories (name) VALUES ('Hacked');
```

```
ERROR:  permission denied for table categories
```

```sql
DELETE FROM orders;
```

```
ERROR:  permission denied for table orders
```

```sql
DROP TABLE products;
```

```
ERROR:  must be owner of table products
```

Reading works. Everything else is refused. The report script can't hurt anything.

### Seeing who can do what

```
\dp orders
```

```
 Schema |  Name  | Type  |     Access privileges      | Column privileges | Policies
--------+--------+-------+----------------------------+-------------------+----------
 public | orders | table | postgres=arwdDxtm/postgres+|                   |
        |        |       | reporter=r/postgres        |                   |
```

The letters: `r` read (SELECT), `a` append (INSERT), `w` write (UPDATE), `d` DELETE, `D` TRUNCATE, `x` REFERENCES, `t` TRIGGER, `m` MAINTAIN. `postgres` has all of them; `reporter` has `r`. The `/postgres` says who granted it.

### Tables you create later

`GRANT ... ON ALL TABLES` covers the tables that exist **now**. Make a new one:

```sql
CREATE TABLE audit_log (id integer);
```

and `reporter` gets `permission denied for table audit_log`. To cover future tables too:

```sql
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO reporter;
```

From now on, every table `postgres` creates in `public` is readable by `reporter` automatically. Do both: `GRANT ... ON ALL TABLES` for what exists, `ALTER DEFAULT PRIVILEGES` for what's coming. Forgetting the second is the classic "it worked yesterday" permissions bug.

### A role for your app

Your web app shouldn't be a superuser either. It needs to read everything, create orders, and adjust stock. Nothing more:

```sql
CREATE ROLE shop_app LOGIN PASSWORD 'app123';
GRANT CONNECT ON DATABASE sales TO shop_app;
GRANT USAGE ON SCHEMA public TO shop_app;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO shop_app;
GRANT INSERT, UPDATE ON orders, order_items TO shop_app;
GRANT UPDATE (stock) ON products TO shop_app;
```

That last line is a **column-level** grant: `shop_app` may update `stock` and no other column of `products`. Connect as `shop_app` and try:

```sql
INSERT INTO orders (customer_id, ordered_at, status) VALUES (5, now(), 'pending') RETURNING id;   -- works
UPDATE products SET stock = stock - 1 WHERE id = 1 RETURNING name, stock;                        -- works
UPDATE products SET price = 0 WHERE id = 1;
```

```
ERROR:  permission denied for table products
```

```sql
DELETE FROM orders WHERE customer_id = 5;
```

```
ERROR:  permission denied for table orders
```

The app can take orders and adjust stock. It cannot change prices or delete history. If its password leaks, an attacker gets the same limits. (Clean up that test order as `postgres` afterwards.)

Identity columns need no extra grants: inserting into `orders` worked without touching its sequence. (Older `serial` columns sometimes need `GRANT USAGE ON SEQUENCE`; another small reason to prefer `IDENTITY`.)

### Group roles

Grant permissions to a **group**, then put people in it:

```sql
CREATE ROLE readonly NOLOGIN;
GRANT USAGE ON SCHEMA public TO readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly;

CREATE ROLE analyst LOGIN PASSWORD 'an123' IN ROLE readonly;
GRANT CONNECT ON DATABASE sales TO analyst;
```

`readonly` can't log in; it's a bundle of permissions. `analyst` is a member (`IN ROLE readonly`) and inherits them. When a second analyst joins, it's one line: `CREATE ROLE ... IN ROLE readonly`. When the read-only set needs a new table, you grant it to `readonly` once. `GRANT readonly TO existing_role` adds an existing role to the group.

This is how real teams manage it: a handful of group roles (`readonly`, `app_writer`, `admin`), and every person or program is a member of one.

### Taking it away

```sql
REVOKE SELECT ON ALL TABLES IN SCHEMA public FROM reporter;
```

`reporter` is back to `permission denied`. To remove the role entirely:

```sql
DROP ROLE reporter;
```

```
ERROR:  role "reporter" cannot be dropped because some objects depend on it
DETAIL:  privileges for schema public
privileges for database sales
privileges for default privileges on new relations belonging to role postgres in schema public
```

A role that owns anything or holds any grant can't be dropped until those are cleared. The shortcut:

```sql
DROP OWNED BY reporter;    -- removes its privileges and anything it owns, in this database
DROP ROLE reporter;
```

(If the role has grants in several databases, run `DROP OWNED BY` in each first.)

### Who am I?

```sql
SELECT current_user;
SELECT rolsuper FROM pg_roles WHERE rolname = current_user;
```

Handy in scripts, and in the panic moment of "wait, which account am I running this as?"

### Views plus permissions

Chapter 33's `public_products` view hides columns. With permissions, it becomes real protection:

```sql
GRANT SELECT ON public_products TO analyst;
-- and do NOT grant SELECT on products itself
```

Now `analyst` can read names and prices, and literally cannot read `sku` or `stock`, because the only path to them is a table they can't touch. For truly sensitive data (emails, phone numbers, addresses), this is the pattern: a view with the safe columns, granted; the table, not.

### Where connections are allowed from

Permissions decide what a role may *do*. A separate file, `pg_hba.conf` ("host-based authentication"), decides who may *connect*, from where, and how they prove it. On your Windows install it's in the data directory (`SHOW hba_file;` tells you the exact path). Its default lines say roughly "local connections must give a password". When you run a real server, you'll edit it to allow your app server's address and nothing else. Just know it's there; you won't need to touch it in this course.

### Two more things, briefly

- **Row-level security** lets a table show different rows to different roles ("customers see only their own orders") with policies attached to the table. Powerful, and a chapter of its own in a more advanced course.
- **Never put passwords in SQL files you share.** `CREATE ROLE ... PASSWORD 'report123'` in a committed file is a leak. Set passwords interactively (`\password reporter` in psql) or from a secrets store.

## Common mistakes

**1. Running the app as `postgres`**

The most common mistake in small projects. One leaked password, total loss. Make an app role on day one.

**2. Forgetting `ALTER DEFAULT PRIVILEGES`**

New tables are invisible to everyone but their owner. Grant for existing tables *and* future ones.

**3. Granting more than needed "for now"**

"For now" lasts years. Grant the minimum, add when asked.

**4. `DROP ROLE` without `DROP OWNED BY`**

Fails with a dependency error. Clear the privileges first.

**5. Protecting a view but not the table**

If the role can read the table, the view hides nothing. Grant on the view only.

**6. Passwords in version control**

Set them interactively. Treat SQL files as public.

## Quick recap

- A **role** is an account. `LOGIN` roles connect; `NOLOGIN` roles are groups.
- New roles can do **nothing** until granted. Grant `CONNECT` on the database, `USAGE` on the schema, then table privileges (`SELECT`, `INSERT`, `UPDATE`, `DELETE`), even per column.
- `GRANT ... ON ALL TABLES` covers existing tables; `ALTER DEFAULT PRIVILEGES` covers future ones. Do both.
- Make group roles (`readonly`, `app_writer`) and add people with `IN ROLE` or `GRANT group TO role`.
- Give your app its own role with the minimum it needs. Never run it as `postgres`.
- Views + grants hide sensitive columns for real. `REVOKE` takes rights away; `DROP OWNED BY` then `DROP ROLE` removes an account.
- `\du`, `\dp table`, `current_user`.

---

**Next:** try the [exercises](exercises.md), then move on to [35 Backup and Restore](../35-backup-and-restore/notes.md).
