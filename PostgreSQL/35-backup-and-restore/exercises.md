# 35 Backup and Restore: Exercises

**How to do these:**

- Work in a **terminal** (not psql), in `playground/ch35/`. Keep a `commands.md` there with every command you ran and what happened.
- Never restore over `sales` itself. Always into a copy.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your notes.

---

## Exercise 1 (Easy): Dump, read, restore

1. Dump `sales` to `sales.sql` (plain format). Open it in VS Code. Find the `CREATE TABLE` for `orders`, its `COPY` block, and the line that adds the foreign key from `order_items` to `orders`. In what order do these three appear, and why does that order matter?
2. Create `sales_copy` and restore the dump into it. Run the chapter 29 headline-numbers query against the copy. Same answers?
3. Drop `sales_copy`.

---

## Exercise 2 (Easy): Custom format

1. Dump `sales` with `-Fc` to `sales.dump`. Compare the file sizes of `sales.sql` and `sales.dump`.
2. List the dump's contents with `pg_restore -l`. How many `TABLE DATA` items are there?
3. Restore it into a fresh `sales_copy`. Check `\dt` and a row count.

---

## Exercise 3 (Medium): The 3pm rescue

Simulate the classic disaster and recovery:

1. Take a `-Fc` backup of `sales`.
2. In psql, on `sales_copy` (a restore of that backup, so you're not risking the real one), "accidentally" run `DELETE FROM order_items;` and commit.
3. Restore **only** `order_items` from the dump into `sales_copy`. You'll need to drop the empty table first (why?). Confirm 21 rows are back.
4. In `commands.md`: write the four commands a colleague would need to do this at 3pm on a bad day, with no explanation needed.

<details>
<summary>Hint</summary>

`pg_restore -t order_items` tries to `CREATE TABLE`, which fails if the table exists. Either `DROP TABLE order_items` first, or add `--clean` to the restore. Both are fine; know what each does.

</details>

---

## Exercise 4 (Medium): Pieces

1. Produce a `schema.sql` (structure only) and a `data.sql` (data only, as `INSERT` statements) for `sales`.
2. Create an empty `sales_rebuilt`, load `schema.sql`, then `data.sql`. Does it work? Check the foreign keys held.
3. Open `data.sql` and find `OVERRIDING SYSTEM VALUE`. In a comment, explain what it does and why `pg_dump` needs it (chapter 14).
4. Dump roles with `pg_dumpall --globals-only`. Which roles appear? (You may have cleaned up chapter 34's; that's fine.)

---

## Exercise 5 (Challenge): Automate it

1. Write `backup.bat` (Windows) that dumps `sales` in custom format to a `backups` folder, with today's date in the filename. Run it by double-clicking. (If it asks for a password, set up `pgpass.conf` as described in the notes.)
2. Open Task Scheduler and schedule it to run daily at a time your laptop is usually on. Run the task manually once to prove it works.
3. Write a second script, `restore-test.bat`, that drops and recreates `sales_copy` and restores the **newest** file from `backups` into it, then runs `psql -c "SELECT count(*) FROM orders"` against the copy.
4. In `commands.md`: your backup policy in five lines. How often, kept where, how many kept, how often tested, and what you do before a risky change.

<details>
<summary>Hint</summary>

In a `.bat` file, `%DATE%` contains slashes on some systems, which aren't allowed in filenames. `set TODAY=%DATE:/=-%` replaces them. For the newest file: `for /f %%f in ('dir /b /o-d backups\*.dump') do (set NEWEST=%%f & goto :found)`. Ask Claude if the batch syntax fights you; the point is the policy, not the scripting.

</details>
