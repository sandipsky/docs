# 41 Migrations

## What is it?

A **migration** is a file holding one change to your database's structure: create this table, add that column, build this index. Migrations are **numbered**, kept in your project next to the code, and **applied in order** by a small program that remembers which ones have already run.

```
migrations/
├── 001_create_notes.sql
├── 002_add_is_done_to_notes.sql
└── 003_create_tags.sql
```

You've been doing this by hand since chapter 15: an `ALTER TABLE` saved in a file, run inside a transaction. Migrations make it a system.

## Why does it matter?

Your `schema.sql` files from the projects rebuild a database from nothing. That's perfect for a database with no data in it. It's useless for one with real customers in it: you can't drop and recreate `orders` just to add a column.

And a real project has **many copies** of its database: your laptop, each teammate's laptop, a test server, production. Every copy must end up with the same structure. "Please run this `ALTER` on your machine too" in a chat message doesn't work for long. Someone forgets, someone runs it twice, someone's copy is slightly different, and a query that works for you fails for them.

Migrations fix both problems. Every change is a file in version control, applied exactly once, in the same order, on every copy. The history of your database becomes as easy to review as the history of your code.

## Real-world example

Building permits for a house people live in:

| House | Database |
|---|---|
| You can't knock the house down to add a window | You can't drop a table full of data to add a column |
| Each change is a numbered permit: "Permit 12: add a window to the east wall" | Each change is a numbered migration file |
| The council keeps a list of permits that have been carried out | The `schema_migrations` table |
| Every copy of the house (the show home, yours, your neighbour's) gets the same permits in the same order | Dev, test and production all run the same files |
| You don't edit a permit after the work is done; you file a new one | Never change a migration that has run; add another |

## How it works

### The idea in three steps

1. A table in the database, `schema_migrations`, records which files have been applied.
2. A small program (the **runner**) reads the `migrations/` folder, sorted by name.
3. For each file not yet in the table: run it inside a transaction, and record it. Stop at the first failure.

That's all a migration tool is. Let's build one. Twenty lines will teach you more than any tool's documentation.

### Two migrations

In your `node-shop` folder from chapter 40, make `migrations/001_create_notes.sql`:

```sql
-- 001: notes table for the migrations demo
CREATE TABLE notes (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

and `migrations/002_add_is_done_to_notes.sql`:

```sql
-- 002: notes can be ticked off
ALTER TABLE notes ADD COLUMN is_done boolean NOT NULL DEFAULT false;
CREATE INDEX idx_notes_is_done ON notes (is_done) WHERE NOT is_done;
```

Plain SQL, one change each, numbered so they sort in the right order. The number is what matters; the rest of the name is a description for humans.

### The runner

`migrate.ts`:

```ts
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const { Client } = pg;

const migrationsDir = path.join(import.meta.dirname, "migrations");

const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

// 1. The bookkeeping table: which migrations have already run?
await client.query(`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    version text PRIMARY KEY,
    applied_at timestamptz NOT NULL DEFAULT now()
  )
`);

const applied = new Set(
  (await client.query<{ version: string }>("SELECT version FROM schema_migrations")).rows.map((r) => r.version),
);

// 2. Every .sql file in the folder, in name order
const files = (await readdir(migrationsDir)).filter((f) => f.endsWith(".sql")).sort();

// 3. Run each one that hasn't been applied, inside its own transaction
for (const file of files) {
  if (applied.has(file)) {
    console.log("skip ", file);
    continue;
  }
  const sql = await readFile(path.join(migrationsDir, file), "utf8");
  try {
    await client.query("BEGIN");
    await client.query(sql);
    await client.query("INSERT INTO schema_migrations (version) VALUES ($1)", [file]);
    await client.query("COMMIT");
    console.log("apply", file);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("FAILED", file, "-", (err as Error).message);
    process.exitCode = 1;
    break;
  }
}

await client.end();
```

It uses a single `Client` rather than a `Pool`, because migrations run one at a time on one connection. The file's SQL and the `INSERT` into `schema_migrations` are in the **same transaction**: either the change happens *and* is recorded, or neither happens. That works because PostgreSQL's `ALTER TABLE` can be rolled back (chapter 15). In some other databases it can't, and migration tools there have a harder life.

### Running it

Make a fresh database to try it on, and point `DATABASE_URL` at it:

```
psql -U postgres -c "CREATE DATABASE migrations_demo;"
node --env-file=.env migrate.ts
```

```
apply 001_create_notes.sql
apply 002_add_is_done_to_notes.sql
```

Run it again:

```
skip  001_create_notes.sql
skip  002_add_is_done_to_notes.sql
```

Nothing happens, because both are recorded. **Running migrations is safe to repeat**, which is exactly what you want from something that runs on every deploy.

```sql
SELECT * FROM schema_migrations ORDER BY version;
```

```
           version            |            applied_at
------------------------------+----------------------------------
 001_create_notes.sql         | 2026-10-01 17:51:41.143656+05:45
 002_add_is_done_to_notes.sql | 2026-10-01 17:51:41.155609+05:45
```

The database now knows its own history.

### When a migration fails

Add `migrations/003_bad_migration.sql`, broken on purpose:

```sql
-- 003: deliberately broken, to show the rollback
ALTER TABLE notes ADD COLUMN priority integer NOT NULL DEFAULT 3;
ALTER TABLE notes ADD COLUMN priority integer;   -- duplicate column: this line fails
```

```
skip  001_create_notes.sql
skip  002_add_is_done_to_notes.sql
FAILED 003_bad_migration.sql - column "priority" of relation "notes" already exists
```

Now look at `\d notes` in psql: there is **no** `priority` column. The first `ALTER` in the file worked, the second failed, and the `ROLLBACK` undid the first. The file isn't recorded either, so once you fix it, the runner will try it again. A failed migration leaves the database exactly as it was. That's the whole reason for the transaction.

Delete or fix the bad file, run again, and you get two skips and no failures.

### The rules

**1. Never edit a migration that has been applied anywhere.** Your laptop has run `002`; so has your teammate's. If you change `002` now, their database and yours drift apart, and the runner won't notice, because `002` is already marked "done" on both. Want to change something? Write `003`.

**2. One change per file**, named for what it does. `005_add_phone_to_customers.sql`, not `005_misc.sql`. The folder listing becomes your schema's changelog.

**3. Migrations are code.** Commit them together with the feature that needs them, and review them. A pull request that adds a column has a migration in it.

**4. Run them when you deploy, before the new code starts.** The new code expects the column, so the column must exist first.

**5. Test them on a copy of real data** before production. A migration that's instant on your 12-row table can lock a 50-million-row table for an hour.

### Up and down

Some teams write a **down** migration for each one: `002_add_is_done_to_notes.down.sql` containing `ALTER TABLE notes DROP COLUMN is_done;`. It lets you undo the last change if a deploy goes wrong. Chapter 15's exercise 5 had you write a pair.

An honest opinion: down migrations are handy in development and rarely used in production. By the time you'd want to roll back, the new column usually has data in it that the down migration would destroy. Many teams write them anyway for the convenience; many don't. Both are defensible. Find out what your team does.

### Data migrations

Not every migration changes structure. Sometimes it's "lowercase every existing email", or "mark every product with stock as active". These are **data migrations**, and they're migrations too: numbered, recorded, run once.

The safe way to add a required column to a table that already has rows (chapter 15) fits in one file:

```sql
ALTER TABLE customers ADD COLUMN phone text;                 -- 1. nullable, so existing rows are fine
UPDATE customers SET phone = 'unknown' WHERE phone IS NULL;  -- 2. fill it (the data part)
ALTER TABLE customers ALTER COLUMN phone SET NOT NULL;       -- 3. now lock it down
```

### Starting from an existing database

If you already have a database (your `shop` from chapter 19, say), its first migration is a **baseline**: `000_baseline.sql`, containing the output of `pg_dump --schema-only` (chapter 35). On copies that already have those tables, mark it as applied without running it (`INSERT INTO schema_migrations (version) VALUES ('000_baseline.sql')`). On brand-new copies, let it run. From then on, every change is a new numbered file.

### Big tables and locks

Two things to know before running migrations against a table with millions of rows:

- **`ALTER TABLE` takes a lock** that blocks reads and writes while it runs. Adding a nullable column, or one with a fixed default, is instant. Changing a column's type, or adding `NOT NULL` without a default, reads or rewrites the whole table, and blocks everyone until it's done. Do those at quiet times.
- **`CREATE INDEX` blocks writes** while it builds. `CREATE INDEX CONCURRENTLY` doesn't, but it can't run inside a transaction, so your runner needs a way to run a file *without* `BEGIN` and `COMMIT` (real tools have a flag or a special comment for this). For the table sizes in this course you can ignore it. For a big production table, remember it exists.

### Real tools

The runner above is a teaching version. Real tools add a command that creates the next numbered file for you, down migrations, a lock so two deploys can't migrate at the same time, and a way to mark the files that can't run in a transaction. In the Node world you'll meet:

| Tool | Style |
|---|---|
| **node-pg-migrate** | Migrations in JavaScript or SQL, built on `pg`. Small and popular. |
| **dbmate** | One program, plain SQL files with `-- migrate:up` and `-- migrate:down` sections. Works with any language. |
| **Flyway** / **Liquibase** | The Java-world standards. Plain SQL works with both. Common in big companies. |
| **Prisma Migrate**, **Drizzle Kit** | Part of the ORMs in [chapter 42](../42-orms/notes.md). They *generate* the SQL by comparing your schema definition with the database. |

They all do what your twenty lines do, plus extras. Pick the one your team or ORM uses, and read its migration files with the understanding you now have.

## Common mistakes

**1. Editing an applied migration**

Databases drift apart, silently. Always a new file.

**2. Running SQL by hand on production**

The change isn't in a file, isn't on anyone else's copy, and isn't in version control. At the next deploy, something breaks. Every change goes through a migration.

**3. Migrations that depend on today's date or data**

`UPDATE prices SET ... WHERE created_at > now() - interval '1 day'` does different things on different days. A migration must do the same thing wherever and whenever it runs.

**4. No transaction**

A half-applied change with no record of it. Keep `BEGIN`/`COMMIT` around every file, unless the file truly can't run in one (concurrent indexes).

**5. Deploying code before running migrations**

The new code asks for a column that doesn't exist yet. Migrate first.

**6. One giant "fix everything" migration**

Hard to review, and if line 40 fails, lines 1 to 39 roll back too. Small files.

## Quick recap

- A migration is a numbered SQL file holding one change. A runner applies the files that haven't run yet, in order, and records each one in `schema_migrations`.
- A file's SQL and its record go in **one transaction**, so a failure leaves the database untouched.
- Running migrations is repeatable: files that already ran are skipped.
- **Never edit an applied migration.** Add a new one. One change per file, committed with the code, run before the new code starts.
- Data changes (backfills) are migrations too. For required columns on live tables: add nullable, fill, then `SET NOT NULL`.
- Real tools (node-pg-migrate, dbmate, Prisma Migrate, Drizzle Kit) do exactly this, with extras.

---

**Next:** try the [exercises](exercises.md), then move on to [42 ORMs](../42-orms/notes.md).
