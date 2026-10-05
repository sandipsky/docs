# 38 Functions and Triggers: Exercises

**How to do these:**

- Exercises 1, 2, 4 and 5 use `sales`; Exercise 3 uses your `bank` database from chapter 36.
- Save each answer in `playground/ch38/ex1.sql`, `ex2.sql`, and so on. Start each file with the matching `DROP TRIGGER IF EXISTS ... ON ...;` and `DROP FUNCTION IF EXISTS ...;` lines so it's re-runnable.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your work.

---

## Exercise 1 (Easy): SQL functions

1. `line_total(p_order_id integer, p_product_id integer)` returning that line's `quantity * unit_price`.
2. `customer_spend(p_customer_id integer)` returning the customer's total over non-cancelled orders, `0` for customers with none.
3. `customer_orders(p_customer_id)` returning a table, as in the notes. Call it for customer 5. What comes back?

Expected: `customer_spend(3)` is `239.00`; `customer_spend(5)` is `0`.

---

## Exercise 2 (Easy): PL/pgSQL

1. `stock_status(p_stock integer)` returning `'out'` for 0, `'low'` for under 20, otherwise `'ok'`. Use it to count products per status.
2. `safe_divide(a numeric, b numeric)` returning `a / b`, or NULL when `b` is zero, with an `IF`. Compare with chapter 24's `nullif` trick.
3. `shout(p_text text)` returning the text uppercased with `'!'` on the end. Then `RAISE EXCEPTION` if the text is empty.

---

## Exercise 3 (Medium): The bank, properly

In `bank`, replace chapter 36's hand-written transfer with a function `transfer(p_from, p_to, p_amount, p_note)` that:

- rejects non-positive amounts,
- locks both accounts `FOR UPDATE` in id order,
- rejects if either account is missing or **frozen**, with a message saying which,
- rejects insufficient funds with the balance in the message,
- updates both balances **and** inserts both ledger rows with a shared `transfer_id`.

Then add a `BEFORE UPDATE` trigger on `accounts` that raises an exception if `OLD.is_frozen` is true and `NEW.balance <> OLD.balance`. Freeze an account and prove both the function and a plain `UPDATE` are refused with a real error (not `UPDATE 0`).

Run your reconciliation view afterwards. Still all zeroes?

<details>
<summary>Hint</summary>

To lock in id order regardless of which is `p_from`: `PERFORM id FROM accounts WHERE id IN (p_from, p_to) ORDER BY id FOR UPDATE;` (`PERFORM` is PL/pgSQL for "run this query and ignore the result"). Then `SELECT ... INTO` the two balances and frozen flags separately. `gen_random_uuid()` into a `v_transfer_id uuid` variable, used in both inserts.

</details>

---

## Exercise 4 (Medium): Timestamps and audit

1. Add `updated_at` to `customers` with a `BEFORE UPDATE` trigger that sets it.
2. Add an `email_history` table and an `AFTER UPDATE OF email` trigger that records old and new email, when, and who. Change a customer's email twice and show the history.
3. Add a `BEFORE UPDATE OF email` trigger that lowercases `NEW.email` before saving. Update an email to `'ASHA@Example.com'` and show what was stored.
4. In a comment: list the order in which the three triggers fire for one `UPDATE customers SET email = ...`, and explain how you know. (Hint: `\d customers`, and the rule that `BEFORE` runs before `AFTER`, alphabetically by name within each.)

Clean up: drop the triggers, functions, table, and column, and restore the original emails.

---

## Exercise 5 (Challenge): The shop's bookkeeping

Three triggers on the `sales` tables, each tested inside a transaction you roll back:

1. **Stock:** `AFTER INSERT ON order_items` reduces `products.stock` (as in the notes), **and** `AFTER DELETE ON order_items` puts it back. Insert and delete a line; stock must end where it started.
2. **Status history:** an `order_status_history (order_id, status, changed_at, changed_by)` table filled by an `AFTER UPDATE OF status ON orders` trigger, only when the status actually changed. Move an order from `pending` to `paid` to `shipped` and show three... no, two history rows (why not three?).
3. **Protect history:** a `BEFORE DELETE ON orders` trigger that raises an exception if `OLD.status = 'shipped'`. Try to delete order 2.

Then, in a comment: of these three, which would you keep as a trigger in a real shop, which would you move to application code, and why?

<details>
<summary>Hint</summary>

For `AFTER DELETE`, `NEW` is NULL; use `OLD.product_id` and `OLD.quantity`. Question 2 has two rows because the status started as `pending`; only *changes* are logged. If you want the initial status recorded too, you'd add an `AFTER INSERT` trigger on `orders`.

</details>
