# Bank Account System: the brief

No SQL in this folder. The tables, the transactions, the views, the roles, and the backup are all yours to write. Follow the milestones in this chapter's [notes.md](../notes.md). This file has the brief, the data, and the numbers you should get, so you can check yourself at every step.

## The brief

> We're a small savings co-operative and we've outgrown the spreadsheet. We need a proper system.
>
> **Members** have one or more **accounts**. Every account has a unique account number, and it's either a *current* account or a *savings* account. An account can be **frozen** (for example while we check something), and a frozen account must not be able to send or receive money.
>
> **Every movement of money must be recorded, permanently.** Deposits, withdrawals, transfers between accounts, our monthly fee, and interest. We need to be able to print a statement for any account for any period, with a running balance, and it must add up. Nobody, not even staff, should ever be able to edit or delete a past entry.
>
> A transfer between two accounts must **never half-happen**. If the money leaves one account, it must arrive in the other, or the whole thing must be undone. Accounts can **never go below zero**.
>
> At the end of each month, every current account pays a **50.00 fee**, and every savings account earns **1% interest** on its balance.
>
> Our **tellers** need to move money and freeze accounts, but must never be able to change history. Our **auditor** needs to read statements and totals, but must not be able to change anything, and shouldn't have raw access to member details.
>
> And please make sure we can get everything back if the computer dies.

## Sample data

### Members

| name | email |
|---|---|
| Asha Rai | asha@example.com |
| Bikram Shrestha | bikram@example.com |
| Chandra Gurung | chandra@example.com |

### Accounts and opening deposits

| account_number | member | kind | opening deposit |
|---|---|---|---|
| ACC-1001 | Asha Rai | current | 5000.00 |
| ACC-1002 | Asha Rai | savings | 20000.00 |
| ACC-2001 | Bikram Shrestha | current | 1500.00 |
| ACC-3001 | Chandra Gurung | current | 300.00 |

Each opening deposit is a ledger entry (kind `deposit`) **and** sets the balance.

## Operations to perform, in order

| Step | Operation | Outcome |
|---|---|---|
| 1 | Transfer 1200.00 from ACC-1001 to ACC-2001, note "Rent" | Succeeds |
| 2 | Transfer 500.00 from ACC-3001 to ACC-1001 | **Must fail**: Chandra only has 300.00 |
| 3 | Transfer 3000.00 from ACC-1002 to ACC-1001 (Asha moving her own money) | Succeeds |
| 4 | Freeze ACC-2001, attempt to withdraw 100.00 from it | **Must not happen**: zero rows updated, roll back. Unfreeze afterwards. |
| 5 | Monthly fee: 50.00 from every current account | Succeeds, 3 ledger rows |
| 6 | Monthly interest: 1% on every savings account | Succeeds, 1 ledger row |

## Expected numbers

After the opening deposits:

| account | balance |
|---|---|
| ACC-1001 | 5000.00 |
| ACC-1002 | 20000.00 |
| ACC-2001 | 1500.00 |
| ACC-3001 | 300.00 |

After step 1: ACC-1001 3800.00, ACC-2001 2700.00. Six ledger rows.

After step 2: unchanged. Still six ledger rows.

After all six steps:

| account | kind | balance |
|---|---|---|
| ACC-1001 | current | 6750.00 |
| ACC-1002 | savings | 17170.00 |
| ACC-2001 | current | 2650.00 |
| ACC-3001 | current | 250.00 |

Total held: **26820.00**. Twelve ledger rows. Every account's stored balance equals the sum of its ledger rows.

Statement for ACC-1001, running balance: 5000.00 → 3800.00 → 6800.00 → 6750.00.

## The traps

| Trap | Where it bites |
|---|---|
| The ledger and the balance disagree | Any operation that does one without the other, or does them in separate transactions |
| A transfer with the wrong sign | `transfer_out` must be negative; the two legs must sum to zero |
| A frozen account that still moves money | `UPDATE ... WHERE id = x` without `AND NOT is_frozen`, or not checking the row count |
| Two transfers locking rows in different orders | Deadlock. Always `ORDER BY id` in the `FOR UPDATE` |
| A teller who can `UPDATE transactions` | The ledger stops being history |
| An auditor who can read `customers` | They asked for totals, not personal details. Views only. |
