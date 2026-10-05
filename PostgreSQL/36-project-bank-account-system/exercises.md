# 36 Project: Bank Account System: Exercises

**How to do these:**

- These extend your `bank` database. Finish all 11 milestones first.
- Each exercise is a new `.sql` file in `playground/ch36/`. Run the reconciliation view after each one; it must still be all zeroes.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to review your files.

---

## Exercise 1 (Easy): Deposits and withdrawals

Write the two simplest operations as transactions: a **deposit** of 1000 into ACC-3001, and a **withdrawal** of 75 from ACC-1001. Each is one ledger row plus one balance update. Then try to withdraw 5000 from ACC-3001 and watch it fail cleanly.

Expected afterwards: ACC-3001 1250.00, ACC-1001 6675.00.

---

## Exercise 2 (Easy): A monthly statement

Write a query (then make it a view, `monthly_statement`) that, for one account and one calendar month, shows: the **opening balance** (sum of all ledger rows before the month), each transaction in the month with its running balance, and the **closing balance**. Test it for ACC-1001 and the current month.

<details>
<summary>Hint</summary>

Opening balance is a scalar subquery: `(SELECT coalesce(sum(amount), 0) FROM transactions WHERE account_id = 1 AND created_at < date_trunc('month', now()))`. The running balance within the month starts from that number: add it to the window sum.

</details>

---

## Exercise 3 (Medium): A daily limit

The co-op limits withdrawals and outgoing transfers to **2000 per account per day**. Write a withdrawal transaction that:

1. Locks the account row.
2. Adds up today's `withdrawal` and `transfer_out` amounts for that account.
3. Only proceeds if today's total plus this withdrawal stays within the limit. (For now, "doesn't proceed" means you look at the result and `ROLLBACK`. Chapter 38 will let the database refuse by itself.)

Test it by withdrawing 1500, then trying 600 more on the same day.

<details>
<summary>Hint</summary>

`SELECT coalesce(-sum(amount), 0) FROM transactions WHERE account_id = $x AND kind IN ('withdrawal', 'transfer_out') AND created_at >= current_date;` gives today's outgoing total as a positive number.

</details>

---

## Exercise 4 (Medium): Closing an account

Add an `is_closed boolean NOT NULL DEFAULT false` to `accounts`, with a **constraint** that a closed account must have a zero balance. Then write the "close account" transaction: it must refuse (via the constraint) if there's money left, so the right procedure is: transfer the remaining balance to another account of the same customer, *then* close.

Close ACC-1002 (Asha's savings) by moving its balance to ACC-1001 first. Prove that trying to close an account with money in it fails, and that a closed account can't receive a deposit (add `AND NOT is_closed` to your updates, and check the row count, as in Milestone 5).

<details>
<summary>Hint</summary>

`CONSTRAINT closed_accounts_are_empty CHECK (NOT is_closed OR balance = 0)`. Read it as "either it's open, or it's empty".

</details>

---

## Exercise 5 (Challenge): The auditor's toolkit

Give the auditor three more views, and grant them:

1. `unbalanced_transfers`: any `transfer_id` whose legs don't sum to zero or don't come in pairs. (Should be empty. Prove it catches problems by inserting a lone `transfer_out` row inside a transaction, selecting from the view, and rolling back.)
2. `large_movements`: every ledger row with an absolute amount over 1000, newest first, with the customer's name.
3. `daily_totals`: per day, total in, total out, and net, for the whole co-op.

Then, as the auditor, run all three. Finally, dump just the **ledger** (`transactions`, data only, as `INSERT` statements) to a file, and write a comment: why might an auditor want exactly that file?

<details>
<summary>Hint</summary>

Unbalanced: `GROUP BY transfer_id HAVING count(*) <> 2 OR sum(amount) <> 0`. Daily totals: `sum(amount) FILTER (WHERE amount > 0)` and `FILTER (WHERE amount < 0)`, grouped by `created_at::date`.

</details>
