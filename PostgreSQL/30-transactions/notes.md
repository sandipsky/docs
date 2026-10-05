# 30 Transactions

## What is it?

A **transaction** is a group of statements that the database treats as **one unit**: either all of them take effect, or none of them do. You've been using the three commands since chapter 10:

| Command | Meaning |
|---|---|
| `BEGIN;` | Start the unit. Changes from here on are pending. |
| `COMMIT;` | Make every pending change permanent, all at once. |
| `ROLLBACK;` | Throw every pending change away. |

This chapter is about *why* that matters, what happens when something goes wrong in the middle, and what other people see while you're working.

## Why does it matter?

The classic example: moving 200 from Asha's account to Bikram's. That's two statements:

```sql
UPDATE accounts SET balance = balance - 200 WHERE id = 1;   -- Asha
UPDATE accounts SET balance = balance + 200 WHERE id = 2;   -- Bikram
```

Now imagine the power goes out between them. Asha has lost 200. Bikram hasn't received it. The money is gone, and no one can tell where. A transaction makes that impossible: both updates happen, or neither does.

The same problem is everywhere. An order with no items because the insert of the items failed. A user account created but the profile row missing. A stock count reduced but the sale not recorded. Every multi-step change to data is a transfer in disguise, and transactions are how you keep it whole.

The second reason: **other people**. A real database has many users and programs working at once. Transactions decide what they see of each other's half-finished work (nothing), and what happens when two of them touch the same row (one waits).

## Real-world example

An ATM withdrawal:

1. Check the balance.
2. Deduct the amount.
3. Dispense the cash.

If step 3 fails (the machine jams), step 2 must be undone, or you've paid for cash you never got. If step 2 fails, step 3 must not happen. The bank treats the whole thing as one operation. That's a transaction.

And while your withdrawal is in progress, someone checking your balance online sees the *old* balance until it completes. They don't see a half-done number. That's isolation.

## How it works

Work in `sales`. Make a small table to play with:

```sql
DROP TABLE IF EXISTS accounts;
CREATE TABLE accounts (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  owner text NOT NULL,
  balance numeric(12, 2) NOT NULL CHECK (balance >= 0)
);
INSERT INTO accounts (owner, balance) VALUES ('Asha', 500.00), ('Bikram', 100.00);
```

### A transfer that works

```sql
BEGIN;
UPDATE accounts SET balance = balance - 200 WHERE id = 1;
UPDATE accounts SET balance = balance + 200 WHERE id = 2;
COMMIT;

SELECT * FROM accounts ORDER BY id;
```

```
 id | owner  | balance
----+--------+---------
  1 | Asha   |  300.00
  2 | Bikram |  300.00
(2 rows)
```

Two updates, one commit. Between `BEGIN` and `COMMIT`, nobody else could see Asha's balance at 300 with Bikram's still at 100. The change appeared to the rest of the world in one step.

### A transfer that fails halfway

Asha tries to send 1000 she doesn't have:

```sql
BEGIN;
UPDATE accounts SET balance = balance - 1000 WHERE id = 1;
```

```
ERROR:  new row for relation "accounts" violates check constraint "accounts_balance_check"
DETAIL:  Failing row contains (1, Asha, -700.00).
```

The `CHECK (balance >= 0)` from chapter 13 refuses. Now watch what happens to the *rest* of the transaction:

```sql
UPDATE accounts SET balance = balance + 1000 WHERE id = 2;
```

```
ERROR:  current transaction is aborted, commands ignored until end of transaction block
```

After an error, the transaction is **aborted**. Every further statement is ignored, even ones that would have worked, even a plain `SELECT`. PostgreSQL is refusing to let you build on a broken foundation. The only way out is to end the transaction:

```sql
COMMIT;
```

```
ROLLBACK
```

You typed `COMMIT`, and PostgreSQL replied `ROLLBACK`. An aborted transaction cannot be committed. Everything since `BEGIN` is undone. Check:

```sql
SELECT * FROM accounts ORDER BY id;
```

```
 id | owner  | balance
----+--------+---------
  1 | Asha   |  300.00
  2 | Bikram |  300.00
```

Nothing changed. No half-transfer, no lost money. This is the whole point.

In psql, the prompt shows you the state: `sales=*#` means a transaction is open, `sales=!#` means it's open **and aborted**. When you see `!`, type `ROLLBACK;`.

### The four promises: ACID

You'll hear "transactions are ACID". It's four words, each one a promise:

| Letter | Promise | Plain English |
|---|---|---|
| **A**tomic | All or nothing | The transfer can't half-happen. You just saw this. |
| **C**onsistent | Rules hold before and after | Every constraint is true when the transaction ends. A commit can never leave a negative balance. |
| **I**solated | Others don't see your half-done work | While your transaction is open, other sessions see the data as it was before you began. Below. |
| **D**urable | Once committed, it's safe | When `COMMIT` returns, the change is written to disk. A crash one millisecond later won't lose it. |

You don't have to do anything to get these. You just have to put the related statements inside one `BEGIN` ... `COMMIT`.

### Autocommit: every statement is a tiny transaction

When you run a statement *without* `BEGIN`, PostgreSQL wraps it in its own transaction and commits it immediately. That's why a single `UPDATE` without a `WHERE` in chapter 10 was instantly permanent. `BEGIN` is you saying "hold on, I want several statements in the same unit".

### Partial undo: `SAVEPOINT`

Sometimes one step failing shouldn't sink the whole transaction. A **savepoint** is a marker you can roll back to:

```sql
BEGIN;
UPDATE accounts SET balance = balance - 50 WHERE id = 1;
SAVEPOINT before_bonus;
UPDATE accounts SET balance = balance - 10000 WHERE id = 2;     -- fails: would go negative
ROLLBACK TO SAVEPOINT before_bonus;                             -- undo just that, un-abort
UPDATE accounts SET balance = balance + 50 WHERE id = 2;
COMMIT;

SELECT * FROM accounts ORDER BY id;
```

```
 id | owner  | balance
----+--------+---------
  1 | Asha   |  250.00
  2 | Bikram |  350.00
```

The failed update was undone, the transaction came back to life, and the rest committed. Savepoints are how a program can try something optional inside a transaction and carry on if it fails. Most of the time you won't need them; when you do, nothing else will do.

### What other sessions see: isolation

This needs two psql windows. Open SQL Shell twice, connect both to `sales`, and run `\pset null '[NULL]'` in each. Call them **A** and **B**.

In **A**:

```sql
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
SELECT balance FROM accounts WHERE id = 1;    -- A sees 150.00
```

Don't commit. Now in **B**:

```sql
SELECT balance FROM accounts WHERE id = 1;    -- B sees 250.00
```

B sees the **old** value. A's change is pending, invisible to everyone else. Reading never waits: B got an answer immediately, just not A's unfinished one.

Now in **B**, try to change the same row:

```sql
UPDATE accounts SET balance = balance - 50 WHERE id = 1;
```

B **hangs**. Nothing comes back. The row is **locked**: A's uncommitted update holds it, and B's update must wait until A finishes, because the result depends on what A does.

In **A**:

```sql
COMMIT;
```

The instant A commits, B's update runs on top of A's result, and B gets `UPDATE 1`. Check in either window: balance is 100.00 (250 − 100 − 50). Both changes applied, in order, nothing lost.

Three rules fall out of this:

1. **Readers never block, and are never blocked.** A `SELECT` always gets an answer: the latest *committed* data.
2. **Two writers on the same row take turns.** The second waits for the first to commit or roll back.
3. **Rows, not tables.** B could have updated Bikram's row (id 2) at the same time with no waiting. Only the *same row* conflicts.

This default behaviour is called the **read committed** isolation level: each statement sees whatever was committed before it started. PostgreSQL has stricter levels (`REPEATABLE READ`, `SERIALIZABLE`) for special cases, like a report that must see one consistent snapshot across many queries. You won't need them for a long time; the default is right for almost everything.

### The lost update, and why `balance = balance - 50` matters

Suppose an app does the transfer the "obvious" way: read the balance into a variable, subtract in code, write the new number back.

```
Session A reads 250.   Session B reads 250.
A writes 250 - 100 = 150.
B writes 250 - 50 = 200.      ← overwrites A's change. The 100 is lost.
```

Two sessions, two reads of the same old value, and the second write clobbers the first. This is the **lost update**, and it's a real bug in real apps.

The SQL you've been writing avoids it: `SET balance = balance - 50` reads and writes the current value in **one** statement, inside the row lock, so the two sessions queue up properly. When a program really must read first and decide in code (check a balance, then withdraw), lock the row while deciding:

```sql
BEGIN;
SELECT balance FROM accounts WHERE id = 1 FOR UPDATE;    -- lock it now
-- ...decide in code...
UPDATE accounts SET balance = balance - 50 WHERE id = 1;
COMMIT;
```

`FOR UPDATE` makes the `SELECT` take the same lock an `UPDATE` would, so a second session's `SELECT ... FOR UPDATE` waits. You'll use this in the [bank project](../36-project-bank-account-system/notes.md).

### Deadlocks

Two sessions can get stuck waiting for each other. A locks Asha's row then wants Bikram's; B locks Bikram's row then wants Asha's. Neither can proceed:

```
ERROR:  deadlock detected
DETAIL:  Process 343 waits for ShareLock on transaction 819; blocked by process 350.
Process 350 waits for ShareLock on transaction 818; blocked by process 343.
```

PostgreSQL notices within about a second, kills **one** of the two transactions with this error (that one is rolled back), and lets the other finish. Your program should catch the error and retry.

The usual cure is to lock rows **in a consistent order** everywhere: always the lower `id` first, say. If both sessions update Asha before Bikram, the second just waits for the first; no cycle, no deadlock.

### Two small things worth knowing

**`now()` is frozen inside a transaction.** It returns the time the transaction *started*, so every row you insert in one transaction gets the same timestamp. That's usually what you want. `clock_timestamp()` gives the real current time if you need it.

**Structure changes are transactional too.** As you saw in chapter 15, `ALTER TABLE` and `DROP TABLE` can be rolled back. Most other databases can't do this. Use it.

### Habits

1. **Group related writes in one transaction.** If two statements must both happen, `BEGIN` before the first, `COMMIT` after the last.
2. **Keep transactions short.** A transaction holds locks until it ends. Never open one, then go and read your email. Never wait for user input inside one.
3. **Always end it.** `COMMIT` or `ROLLBACK`. Watch for `*` and `!` in the prompt.
4. **In code, `ROLLBACK` on any error.** [Chapter 40](../40-connecting-from-nodejs/notes.md) shows the try/catch pattern.
5. **Change values in place** (`balance = balance - 50`), or lock with `FOR UPDATE` when you must read first.
6. **Lock in a consistent order** to avoid deadlocks.

Clean up:

```sql
DROP TABLE accounts;
```

## Common mistakes

**1. Carrying on after an error inside a transaction**

Every statement is ignored until you `ROLLBACK`. The `!` in the prompt is telling you.

**2. Expecting `COMMIT` to save an aborted transaction**

It rolls back instead. If anything failed, nothing is kept.

**3. Leaving a transaction open**

Locks held, other sessions waiting, and in a program, a connection stuck forever. Short and closed.

**4. Read-then-write in application code without a lock**

The lost update. Use `SET x = x - n`, or `SELECT ... FOR UPDATE`.

**5. Thinking a `SELECT` will show you another session's uncommitted work**

It never does. If you don't see a change, the other session hasn't committed.

**6. Fearing deadlocks**

They're rare, PostgreSQL detects them, and consistent lock ordering prevents most. Catch the error, retry.

## Quick recap

- A transaction is **all or nothing**: `BEGIN`, statements, `COMMIT`. Any error aborts it, and `COMMIT` then becomes `ROLLBACK`.
- **ACID**: atomic, consistent, isolated, durable. You get it by grouping statements; nothing else to do.
- `SAVEPOINT` lets you undo part of a transaction and carry on.
- Other sessions see only **committed** data. Readers never wait. Two writers on the same row take turns; the second waits for the first to finish.
- `SET balance = balance - 50` is safe against lost updates. `SELECT ... FOR UPDATE` locks a row when you must read before writing.
- Deadlocks are detected and one side is rolled back. Lock rows in a consistent order.
- Keep transactions short, and always end them.

---

**Next:** try the [exercises](exercises.md), then move on to [31 Indexes](../31-indexes/notes.md).
