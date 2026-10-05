# 29 Project: Sales Report: Exercises

**How to do these:**

- These extend your `report.sql`. Finish all 10 milestones first.
- Add each as a new numbered section. After each, the whole file must still run clean after a seed reload.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to review the file.

---

## Exercise 1 (Easy): Basket size

Add a section showing the average number of **lines** per order and the average number of **units** per order, both to 2 decimal places, across all orders.

Expected: `1.75` lines, `5.25` units.

---

## Exercise 2 (Easy): Who to email

A section listing customers who have **never ordered**, with the month they joined (`Jun 2026`-style), so marketing can send them a welcome offer. Then a second list: customers whose **last** order was before 1 September (they may be drifting away).

<details>
<summary>Hint</summary>

The second one: a CTE with `max(ordered_at)` per customer, then keep rows where that's `< '2026-09-01'`. Bikram is the answer (last order 9 August).

</details>

---

## Exercise 3 (Medium): A month-by-category grid

Build a **pivot table**: one row per month, one column per category, each cell the revenue for that month and category (live orders only), with a total column. Use `FILTER`.

Expected output:

```
  month   | stationery | furniture |  bags  | electronics | total
----------+------------+-----------+--------+-------------+--------
 Jul 2026 |      21.00 |    173.99 |      0 |           0 | 194.99
 Aug 2026 |      33.50 |    173.99 |  19.50 |       61.49 | 288.48
 Sep 2026 |      41.20 |         0 | 109.50 |       29.99 | 180.69
(3 rows)
```

The row totals must match Milestone 3. Then, in a comment: what's the downside of this shape when the shop adds a fifth category?

<details>
<summary>Hint</summary>

Start from a CTE of live order lines joined to products and categories, with the line total and the month. Then one column per category: `coalesce(sum(line_total) FILTER (WHERE category = 'Stationery'), 0) AS stationery`, and so on, plus `sum(line_total) AS total`. Group and sort by the real month, display the text.

</details>

---

## Exercise 4 (Medium): What-if pricing

The owner asks: "If Pens had been 1.50 instead of 1.20 all along, how much more would we have made?"

Recompute live revenue with every Pen line repriced at 1.50, and show the difference from actual live revenue. Don't change any data; do it with a `CASE` inside the sum.

<details>
<summary>Hint</summary>

`sum(quantity * CASE WHEN product_id = 2 THEN 1.50 ELSE unit_price END)`. Pens sold 35 units in live orders, so the difference is 35 × 0.30.

</details>

---

## Exercise 5 (Challenge): A parameterized report

psql can hold **variables**. At the top of a file:

```
\set month_start '2026-08-01'
\set month_end '2026-09-01'
```

and in a query, `:'month_start'` (with the quotes) pastes the value in as text.

Rewrite your month-by-month section as a **single-month report**: headline numbers, by category, and top products, all for the month between the two variables. Run it for August, then change the two lines to September and run it again. Nothing else in the file should change.

Then one more: `\copy` the top-products result for the chosen month to a CSV on your desktop (chapter 11, exercise 4), so the owner can open it in Excel.

<details>
<summary>Hint</summary>

`WHERE o.ordered_at >= :'month_start' AND o.ordered_at < :'month_end'`. PostgreSQL will convert the text to a timestamp for the comparison. `\copy` can't use a CTE in brackets with variables easily on one line, so put the final query in a view (chapter 33 is coming) or keep it short.

</details>
