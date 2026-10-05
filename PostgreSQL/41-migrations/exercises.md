# 41 Migrations: Exercises

**How to do these:**

- Work in `PostgreSQL/playground/node-shop/`. Create a database called `migrations_demo` and point `DATABASE_URL` at it for these exercises. (Or make a second file, `.env.migrations`, and run with `--env-file=.env.migrations`.)
- Write down what each run printed in `playground/ch41/notes.md`.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your work.

---

## Exercise 1 (Easy): Build and run the runner

1. Create `migrate.ts` and the two migrations from the notes. Run it. Run it again. Copy both outputs into your notes.
2. Look at `schema_migrations` and `\d notes` in psql.
3. Add `003_create_tags.sql`: a `tags` table and a `note_tags` junction table (chapter 17). Run the migrator. Only `003` should apply.

---

## Exercise 2 (Easy): Watch a failure

1. Write `004_broken.sql` with two statements where the **second** one fails (a duplicate column, a type that doesn't exist, anything). Run the migrator and copy the error.
2. Check in psql that the first statement's change did **not** survive, and that `004` isn't in `schema_migrations`.
3. Fix the file (keep the same name, since it never ran anywhere) and run again.
4. In your notes: why was it fine to edit `004` here, when editing `002` would not be?

---

## Exercise 3 (Medium): Migrate the shop

Turn your chapter 19 project into migrations, in a fresh database called `shop_migrated`:

1. `001_create_shop.sql`: the contents of your `schema.sql`, without the `DROP` lines. (A migration creates. It never drops what came before it.)
2. `002_seed_reference_data.sql`: the categories. Reference data that the app needs in order to work belongs in a migration. Sample customers and orders don't; those stay in a seed file.
3. `003_` to `006_`: one file per change request from chapter 19's Milestone 7.
4. Run them all. Then run your old `seed.sql` (without the categories) and `queries.sql` against the result. Same answers as before?

---

## Exercise 4 (Medium): A required column on a live table

In `shop_migrated`, with customers in it, add a **required** column `country text NOT NULL`.

1. First try the naive way: one migration with `ALTER TABLE customers ADD COLUMN country text NOT NULL;`. Watch it fail, and check that the runner left the table unchanged.
2. Write it properly as one migration with three statements: add it nullable, fill it with `'Nepal'`, then set `NOT NULL`.
3. In your notes: on a table with 50 million rows, which of the three statements would be slow, and what could you do about it?

<details>
<summary>Hint</summary>

The `UPDATE` touches every row. On a huge table you'd fill it in batches (`WHERE id BETWEEN ...`), spread over several runs, and set `NOT NULL` last. Alternatively, `ADD COLUMN country text NOT NULL DEFAULT 'Nepal'` is instant in modern PostgreSQL, because the default is stored once instead of being written into every row.

</details>

---

## Exercise 5 (Challenge): Down migrations

Extend `migrate.ts`:

1. When run as `node --env-file=.env migrate.ts down`, it should find the **most recently applied** migration, run the matching `NNN_name.down.sql` file inside a transaction, and delete that migration's row from `schema_migrations`.
2. Write `.down.sql` files for your `notes` migrations (001 to 003). Run `down` three times, then run normally once. The database should end up complete again.
3. In your notes: write the down migration for Exercise 4's `country` column. What data does it destroy? When, if ever, would you run it in production?

<details>
<summary>Hint</summary>

`SELECT version FROM schema_migrations ORDER BY applied_at DESC LIMIT 1`, then `version.replace(".sql", ".down.sql")` gives the file name. `process.argv[2] === "down"` chooses the mode. Make sure the `.down.sql` files are skipped by the normal "up" loop (filter out names ending in `.down.sql`).

</details>
