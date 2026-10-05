# 36 Project: Bank Account System

## What you'll build

The database for a small savings co-operative: customers, their accounts, and every movement of money as a permanent ledger. Transfers that can't half-happen. Rules that stop overdrafts and frozen accounts. Statements with running balances. A read-only auditor, a teller who can move money but not rewrite history, and a backup you've proven you can restore.

It's Level 4 end to end: transactions, locking, indexes, views, roles, and backups, applied to the one domain where getting it wrong costs real money.

By the end, you'll have, in `playground/ch36/`:

- `schema.sql`: three tables, every constraint, every index,
- `seed.sql`: customers, accounts, opening deposits,
- `operations.sql`: transfers (good and bad), fees, interest, all as proper transactions,
- `views.sql`: statements, overview, and a reconciliation check,
- `roles.sql`: teller and auditor, least privilege,
- `backup.md`: the commands you ran to back up and restore, and proof it worked,
- `concurrency.md`: what you saw with two windows open.

## Before you start

- Finish chapters 30 to 35.
- Read the [starter README](starter/README.md): the co-op's brief, the sample data, and the expected balances after every operation, so you can check yourself.
- Make `playground/ch36/`. Create a database called `bank`.
- `\pset null '[NULL]'`.

**The one design rule for this project:** money never just *changes*. Every change to a balance has a matching row in a **ledger** (`transactions`) saying what happened, when, and why. The balance on the account is a convenience copy of "the sum of the ledger". If they ever disagree, something is wrong, and you'll write the query that proves they agree.

## Milestone 1: Design

**Goal:** three tables and their rules, in `plan.md` first.

- `customers`: who.
- `accounts`: one customer has many; each has a unique account number, a kind (`current` or `savings`), a balance, and a frozen flag.
- `transactions`: the ledger. One row per movement: which account, how much (**negative for money out, positive for money in**), what kind (`deposit`, `withdrawal`, `transfer_in`, `transfer_out`, `fee`, `interest`), when, and a note. For transfers, both legs share a `transfer_id` so you can find the pair.

Decide and write down: types for money (chapter 12), which `CHECK`s (balance never negative; amount never zero; kinds from a fixed list), the primary key type for a ledger that will grow forever (chapter 14), which columns need indexes (chapter 31: every foreign key, and `created_at` because statements are date ranges).

<details>
<summary>Hint</summary>

`balance numeric(14, 2) NOT NULL DEFAULT 0 CHECK (balance >= 0)`. `transactions.id bigint`. `transfer_id uuid` (nullable: deposits don't have one). `gen_random_uuid()` makes one.

</details>

## Milestone 2: Schema and seed

**Goal:** `schema.sql` builds it; `seed.sql` fills it.

Schema: drop in child-first order, create in parent-first order, constraints inline, indexes at the end. Seed: the three customers and four accounts from the brief, then the **opening deposits**. Each opening deposit is a ledger row *and* a balance update, inside **one transaction**: the ledger and the balance must never disagree, even for a moment.

**Check:** `SELECT account_number, balance FROM accounts ORDER BY id;` gives 5000.00, 20000.00, 1500.00, 300.00. `SELECT count(*) FROM transactions;` gives 4.

## Milestone 3: A transfer, done right

**Goal:** 1200 from Asha's current account (ACC-1001) to Bikram (ACC-2001), as one transaction in `operations.sql`.

The shape, from chapters 27 and 30:

```sql
BEGIN;
SELECT id, balance, is_frozen FROM accounts WHERE id IN (1, 3) ORDER BY id FOR UPDATE;
UPDATE accounts SET balance = balance - 1200 WHERE id = 1 AND NOT is_frozen;
UPDATE accounts SET balance = balance + 1200 WHERE id = 3 AND NOT is_frozen;
WITH t AS (SELECT gen_random_uuid() AS tid)
INSERT INTO transactions (account_id, amount, kind, transfer_id, note)
SELECT 1, -1200, 'transfer_out', tid, 'Rent' FROM t
UNION ALL
SELECT 3,  1200, 'transfer_in',  tid, 'Rent' FROM t;
COMMIT;
```

Three things to notice and write in a comment: why the `FOR UPDATE` comes first and is `ORDER BY id` (deadlocks, chapter 30); why both `UPDATE`s say `AND NOT is_frozen` (keep reading); why the two ledger rows come from one CTE (they must share the same `transfer_id`).

**Check:** balances 3800.00 and 2700.00. Six ledger rows. `SELECT transfer_id, count(*), sum(amount) FROM transactions WHERE transfer_id IS NOT NULL GROUP BY 1;` shows 2 legs netting to 0.00.

## Milestone 4: A transfer that must fail

**Goal:** Chandra (300.00) tries to send 500 to Asha.

Write it exactly like Milestone 3. Run it. Read every line PostgreSQL prints, and write them as comments: the `CHECK` violation, the "current transaction is aborted" lines, and `ROLLBACK` as the reply to your `COMMIT`.

**Check:** nothing changed. Still 6 ledger rows, Chandra still 300.00. Then write one sentence: what would have happened to Chandra's money if these statements had run without `BEGIN`?

## Milestone 5: Frozen accounts

**Goal:** freeze Bikram's account and try to take 100 out.

Set `is_frozen = true` on ACC-2001. Then `BEGIN`, and run `UPDATE accounts SET balance = balance - 100 WHERE id = 3 AND NOT is_frozen;`. PostgreSQL says `UPDATE 0`. **No error.** The row simply didn't match.

That means the person or program running this must *look at the row count* and `ROLLBACK` when it's zero, or the ledger insert that follows will record a withdrawal that never happened. Write the `ROLLBACK`, and a comment explaining why a `CHECK` constraint can't express this rule and what [chapter 38](../38-functions-and-triggers/notes.md) will offer instead (a trigger that raises an error). Unfreeze the account afterwards.

## Milestone 6: Batch operations

**Goal:** the monthly run. Two transactions in `operations.sql`:

1. A **50.00 fee** on every `current` account: one `INSERT ... SELECT` that writes a `fee` ledger row per current account, and one `UPDATE` that reduces their balances. Same transaction.
2. **1% interest** on every `savings` account, the same way, rounded to 2 decimal places.

Also do the internal transfer from the brief first (3000 from Asha's savings to her current account), so the numbers line up.

**Check:** ACC-1001 6750.00, ACC-1002 17170.00, ACC-2001 2650.00, ACC-3001 250.00. Total held 26820.00.

## Milestone 7: Views

**Goal:** `views.sql`, three of them.

1. `account_statements`: every ledger row with its account number and a **running balance** per account (`sum(amount) OVER (PARTITION BY account_id ORDER BY created_at, id)`, chapter 28). For ACC-1001 it should read 5000 → 3800 → 6800 → 6750.
2. `customer_overview`: each customer with number of accounts and total balance, including customers with no accounts.
3. `reconciliation`: each account's stored balance next to the sum of its ledger, and the difference. **Every difference must be 0.00.** This view is your alarm. Run it after every operation for the rest of the project.

## Milestone 8: Indexes and plans

**Goal:** prove the statement lookup is fast.

`EXPLAIN SELECT * FROM transactions WHERE account_id = 1 ORDER BY created_at;`. You should see your `account_id` index being used. Then, in a comment, name the two other indexes you created and the query each one is for. If you can't name a query, drop the index.

## Milestone 9: Roles

**Goal:** `roles.sql`. Two roles, least privilege (chapter 34):

- `teller`: may read everything, insert into `transactions`, and update **only** `balance` and `is_frozen` on `accounts`. May not delete or update anything in `transactions`, ever. May not change account numbers or kinds.
- `auditor`: may read the three views and nothing else. Not even the tables.

Connect as each in a second window and prove it: the teller can run a transfer; the teller gets `permission denied` trying to `DELETE FROM transactions`; the auditor can read `reconciliation` and gets `permission denied` on `SELECT * FROM accounts`.

## Milestone 10: Two windows

**Goal:** `concurrency.md`. Open two sessions as `postgres` (or `teller`).

1. In A: `BEGIN;` and the `SELECT ... FOR UPDATE` for accounts 1 and 3. Don't commit. In B: start the same transfer. B waits. Commit A. B proceeds. Record what you saw.
2. Now the dangerous one. Set ACC-3001 to 300.00 again if needed. In A: begin a 200 withdrawal from ACC-3001 (`FOR UPDATE`, `UPDATE`, don't commit). In B: begin a 200 withdrawal from the same account. B waits on the `FOR UPDATE`. Commit A. What happens to B's `UPDATE`? Why is that exactly right? Roll B back.
3. Write two sentences on what would have gone wrong in step 2 if the app had checked the balance with a plain `SELECT`, decided "300 ≥ 200, fine", and then updated.

## Milestone 11: Backup and restore

**Goal:** `backup.md`.

Dump `bank` in custom format. Create `bank_copy`, restore into it, and run `SELECT sum(balance) FROM accounts;` on the copy: 26820.00. Then delete all ledger rows in the copy (on purpose), restore **only** `transactions` from the dump, and show the reconciliation view on the copy is all zeroes again. Write every command and its output.

## Common mistakes

**1. Updating a balance without a ledger row, or the reverse**

The reconciliation view catches it. Always both, always one transaction.

**2. Forgetting the amount sign**

Money out is negative. A `transfer_out` of `+1200` makes the ledger lie and the reconciliation fail.

**3. Not checking the row count**

`UPDATE 0` is not an error. Frozen account, wrong id, typo: all silent. Look at the count.

**4. Locking rows in different orders**

Transfer A locks 1 then 3; transfer B locks 3 then 1: deadlock. `ORDER BY id` in the `FOR UPDATE`, every time.

**5. A teller who can edit the ledger**

If `transactions` rows can be updated or deleted, the ledger is worthless. Insert only.

**6. A backup nobody restored**

Milestone 11 is the proof. Do it.

## Quick recap

- Money moves are **ledger row + balance change, in one transaction**. The balance is a copy; the ledger is the truth; a reconciliation view keeps them honest.
- Lock the rows you're about to change with `SELECT ... FOR UPDATE ORDER BY id` before changing them.
- Rules the data can express go in `CHECK`s. Rules that need a decision (frozen) need a row-count check now, and a trigger later.
- Views give the auditor exactly what they need. Roles give the teller exactly what they need. Nobody uses `postgres`.
- Back it up, restore it somewhere else, and check the total.

---

**Congratulations!** You've finished Level 4. 🎉 You can now keep data safe from mistakes, from concurrent users, from strangers, and from disks, and keep it fast as it grows. Try the [exercises](exercises.md), then head back to the [roadmap](../README.md). Level 5 connects all of this to the apps you build.
