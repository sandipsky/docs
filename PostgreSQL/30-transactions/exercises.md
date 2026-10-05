# 30 Transactions: Exercises

**How to do these:**

- Work in psql, connected to `sales`. Create the `accounts` table from the notes (Asha 500, Bikram 100) at the start of each exercise file so it's re-runnable.
- Save each answer in `playground/ch30/ex1.sql`, `ex2.sql`, and so on. For the two-window exercises, write down what you saw as comments.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your work.

---

## Exercise 1 (Easy): Two transfers

1. Transfer 150 from Asha to Bikram in one transaction. Show both balances afterwards.
2. Try to transfer 900 from Bikram to Asha in one transaction. Read every message PostgreSQL prints, including the reply to your `COMMIT`. Show both balances afterwards and confirm nothing changed.

Expected balances after step 1: Asha 350.00, Bikram 250.00. After step 2: the same.

---

## Exercise 2 (Easy): The aborted state

1. `BEGIN`, then run a statement that fails (any constraint violation). Then run `SELECT 1;`. What happens, and why?
2. Look at your psql prompt. What character shows the transaction is broken?
3. Get out of it. Then, in a comment, explain in one sentence why PostgreSQL refuses to run even a harmless `SELECT` in an aborted transaction.

---

## Exercise 3 (Medium): A savepoint in a batch

A nightly job pays 10 interest to every account, then tries to charge a 500 fee to account 2 (which can't afford it), then records today's date in a `last_processed` column (add it with `ALTER TABLE`).

Write this as **one** transaction where the fee step is wrapped in a savepoint, so that when it fails, the interest and the date still commit.

Expected: both balances up by 10, no fee charged, `last_processed` set on both rows.

<details>
<summary>Hint</summary>

`SAVEPOINT before_fee;` ... the failing `UPDATE` ... `ROLLBACK TO SAVEPOINT before_fee;` ... then the date update and `COMMIT`.

</details>

---

## Exercise 4 (Medium): Two windows

Open two psql sessions, A and B, both on `sales`. Work through the isolation demo from the notes and record, as comments in `ex4.sql`:

1. What B's `SELECT` showed while A's update was uncommitted.
2. What happened when B ran an `UPDATE` on the **same** row (and roughly how long it waited).
3. What happened when B ran an `UPDATE` on the **other** row instead while A was still open. Did it wait?
4. The final balances after both committed, and why they're what they are.

---

## Exercise 5 (Challenge): Deadlock, then prevent it

1. Cause a deadlock on purpose with two windows: A updates row 1 then (after you switch windows) row 2; B updates row 2 then row 1. Copy the `deadlock detected` message. Which session got the error, and what happened to the other?
2. Now repeat, but make **both** sessions update row 1 first, then row 2. Describe what happens instead of a deadlock.
3. Write the "check balance, then withdraw" pattern safely: a transaction that `SELECT`s Asha's balance `FOR UPDATE`, and then (pretending you decided in code) updates it. In a second window, try to `SELECT ... FOR UPDATE` the same row while the first transaction is open. What happens?

<details>
<summary>Hint</summary>

For step 1, type A's first update, then B's first update, then A's second update (A now waits), then B's second update. Within a second one of them errors. For step 2, the second session simply waits on row 1, then proceeds after the first commits: a queue, not a cycle.

</details>
