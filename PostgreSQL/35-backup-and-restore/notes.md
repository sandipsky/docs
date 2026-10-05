# 35 Backup and Restore

## What is it?

A **backup** is a copy of your database saved somewhere safe. **Restoring** is rebuilding a database from that copy. PostgreSQL ships two command-line tools for this:

- `pg_dump` writes one database to a file.
- `pg_restore` (or plain `psql`) loads it back.

Unlike everything so far, these run in your **terminal**, not inside psql.

## Why does it matter?

Every database eventually meets one of these:

- A `DELETE` without a `WHERE`, committed.
- A migration that dropped the wrong column.
- A disk that dies.
- A laptop that gets stolen.
- A cloud account that gets suspended.

Transactions protect you from half-done changes. Constraints protect you from bad data. Nothing protects you from a committed mistake or a dead disk **except a backup made before it happened**. People who've lost data back up religiously. People who haven't, don't yet.

There's a second, happier use: moving a database. From your laptop to a server, from one cloud to another, or to a teammate who needs a copy of the real data. That's a dump and a restore too.

## Real-world example

Photographing every page of your notebook and putting the photos in a safe:

| Notebook | Database |
|---|---|
| Photograph every page | `pg_dump` |
| The photos in a folder | The dump file |
| Spill coffee on the notebook | Drop the wrong table |
| Rewrite the pages from the photos | `pg_restore` |
| Photos from last month don't have this month's notes | A backup only contains what existed when it was taken |

The last row is the important one. A backup is a snapshot. Take them often enough that losing "everything since the last one" is bearable.

## How it works

These examples assume `pg_dump` and `pg_restore` are on your PATH (chapter 03's optional step). If not, use the full path, in quotes:

```
"C:\Program Files\PostgreSQL\18\bin\pg_dump.exe" ...
```

Every command below will ask for the `postgres` password. To stop that, create a file at `%APPDATA%\postgresql\pgpass.conf` containing one line, `localhost:5432:*:postgres:yourpassword`, and the tools will read it. (Treat that file like a password, because it is one.)

Work in a terminal, in a folder where you want the backup files to land, like `playground/ch35/`.

### A plain SQL dump

```
pg_dump -U postgres -d sales -f sales.sql
```

That's it. `-U` user, `-d` database, `-f` output file. For the `sales` database it finishes instantly and produces a text file of a few hundred lines. Open it in VS Code:

```sql
--
-- PostgreSQL database dump
--

-- Dumped from database version 18.6
...
CREATE TABLE public.categories (
    id integer NOT NULL,
    name text NOT NULL
);
...
COPY public.categories (id, name) FROM stdin;
1	Stationery
2	Furniture
3	Bags
4	Electronics
\.
...
SELECT pg_catalog.setval('public.categories_id_seq', 5, true);
...
ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;
```

It's SQL you could have written yourself: `CREATE TABLE` for every table, the data as `COPY ... FROM stdin` blocks (a fast bulk-load format, tab-separated), the identity counters reset to where they were, and the constraints added **last**, after the data, so there are no ordering problems. Run this file against an empty database and you get your database back, exactly.

Because it's plain text, you can read it, search it, and even edit it before restoring. That's the big advantage of this format.

### Restoring a plain dump

A plain dump is just SQL, so `psql` runs it:

```
psql -U postgres -c "CREATE DATABASE sales_copy;"
psql -U postgres -d sales_copy -f sales.sql
psql -U postgres -d sales_copy -c "SELECT count(*) FROM orders;"
```

```
 count
-------
    12
```

The dump doesn't create the database itself (by default), so you make an empty one first, then load into it. Now you have an exact copy to experiment on, without touching the original. This is also how you'd hand a database to a teammate: send the file, they run these three lines.

Two useful flags when dumping: `--clean --if-exists` adds `DROP TABLE IF EXISTS ...` lines at the top, so you can restore over an existing copy without emptying it first.

### The custom format

For anything bigger than a toy, use `-Fc` ("format: custom"):

```
pg_dump -U postgres -d sales -Fc -f sales.dump
```

The file is **compressed** (a quarter the size or better), and it's **restorable in pieces**: one table, schema only, data only. You can't read it in an editor, but you can list it:

```
pg_restore -l sales.dump
```

```
230; 1259 16386 TABLE public categories postgres
234; 1259 16424 TABLE public customers postgres
...
3494; 0 16386 TABLE DATA public categories postgres
3498; 0 16424 TABLE DATA public customers postgres
...
3344; 2606 16468 FK CONSTRAINT public order_items order_items_order_id_fkey postgres
```

Every table, every chunk of data, every constraint, as a separate item. Restore all of it:

```
psql -U postgres -c "CREATE DATABASE sales_copy;"
pg_restore -U postgres -d sales_copy sales.dump
```

Or just one table:

```
pg_restore -U postgres -d sales_copy -t order_items sales.dump
```

That last one is the everyday rescue: someone wiped `order_items` at 3pm, and you restore just that table from last night's dump into a scratch database, then copy the rows you need back. With a plain dump you'd be hunting through a text file for the right `COPY` block.

**Use `-Fc` for backups. Use plain SQL when you want to read or share the file.**

### Partial dumps

| You want | Command |
|---|---|
| One table | `pg_dump -U postgres -d sales -t customers -f customers.sql` |
| Structure, no data | `pg_dump -U postgres -d sales --schema-only -f schema.sql` |
| Data, no structure | `pg_dump -U postgres -d sales --data-only -f data.sql` |
| Data as `INSERT` statements instead of `COPY` | add `--column-inserts` |

`--schema-only` gives you a `schema.sql` like the ones you wrote by hand in the projects, generated from the real database. `--column-inserts` makes a data file that other databases can read, at the cost of being much slower to load:

```sql
INSERT INTO public.customers (id, name, email, city, joined_on) OVERRIDING SYSTEM VALUE VALUES (1, 'Asha Rai', 'asha@example.com', 'Kathmandu', '2026-01-15');
```

(Note the `OVERRIDING SYSTEM VALUE`: chapter 14's escape hatch for inserting explicit ids into an identity column, used here so the restored rows keep their original ids.)

### Roles aren't in the dump

`pg_dump` copies one database. Roles and their passwords live outside any database, so they're not included. For those:

```
pg_dumpall -U postgres --globals-only -f roles.sql
```

```sql
CREATE ROLE postgres;
ALTER ROLE postgres WITH SUPERUSER ... PASSWORD 'SCRAM-SHA-256$...';
CREATE ROLE shop_app;
...
```

A full backup of a server is: `pg_dumpall --globals-only` for the roles, plus `pg_dump -Fc` per database. (`pg_dumpall` with no flags dumps everything, every database, as one big plain-SQL file. Fine for small servers.)

### Where the data actually lives

Your databases are files under the data directory (`SHOW data_directory;` in psql shows the path, something like `C:\Program Files\PostgreSQL\18\data`). You might think "I'll just copy that folder". **Don't**, at least not while the server is running: the files change constantly and a copy taken mid-write is corrupt. `pg_dump` exists precisely so you get a consistent snapshot while the database stays live. (There *is* a way to copy the files safely, called a base backup, and it's the foundation of the fancier methods below.)

### The habit

A backup you've never restored is a hope, not a backup. The routine that works:

1. **Automate the dump.** On Windows, Task Scheduler can run a `.bat` file nightly containing `pg_dump -U postgres -d sales -Fc -f "D:\backups\sales_%DATE%.dump"`. On a server, `cron`.
2. **Copy it somewhere else.** A backup on the same disk as the database dies with the disk. Another drive, another machine, a cloud bucket.
3. **Keep several.** Last 7 days, last 4 weeks. The mistake you discover on Thursday might have happened on Monday.
4. **Test the restore.** Once a month, restore the latest dump into a scratch database and run a few queries. If you can't restore it, you don't have a backup.
5. **Before every risky change**, take a one-off dump. A migration that drops a column, a bulk update, an upgrade. Thirty seconds now saves a very bad day later.

### Beyond dumps

A nightly dump means you can lose up to a day of data. Systems that can't accept that use **continuous archiving** (PostgreSQL keeps a log of every change, and that log is backed up as it's written), which allows **point-in-time recovery**: "restore to exactly 14:59, one minute before the bad `DELETE`". It's set up on the server, not with these commands, and it's the kind of thing a managed cloud database ([chapter 43](../43-postgresql-in-the-cloud/notes.md)) gives you with a checkbox. Know it exists; for your own projects, scheduled dumps are the right start.

## Common mistakes

**1. No backup**

The default state of every hobby project. Set up the scheduled dump before you have data you'd miss.

**2. Never testing a restore**

Dumps can be incomplete, truncated, or taken of the wrong database. Restore into a scratch database and look.

**3. Backup on the same disk**

One failure takes both. Copy it elsewhere.

**4. Copying the data directory while the server runs**

Corrupt. Use `pg_dump`.

**5. Forgetting roles**

The dump restores, the app can't log in, because `shop_app` doesn't exist on the new server. `pg_dumpall --globals-only`.

**6. Restoring over the live database by accident**

`pg_restore -d sales` with `--clean` *drops and recreates* your real tables. Always restore into a copy first, check it, and only then decide what to do with the original.

## Quick recap

- `pg_dump -U postgres -d name -f file.sql` makes a readable SQL backup. Restore it with `psql -d copy -f file.sql` into a fresh database.
- `pg_dump -Fc -f file.dump` makes a compressed backup you can restore in pieces with `pg_restore` (`-l` to list, `-t table` for one table).
- `--schema-only`, `--data-only`, `-t table`, `--column-inserts` for partial dumps.
- Roles aren't in a database dump. `pg_dumpall --globals-only` for those.
- Never copy the data directory while the server is running.
- Automate, copy elsewhere, keep several, **test the restore**, and dump before every risky change.

---

**Next:** try the [exercises](exercises.md), then move on to the Level 4 project: [36 Project: Bank Account System](../36-project-bank-account-system/notes.md).
