# 29 Project: Sales Report

## What you'll build

A complete sales report for the shop you've been querying since chapter 20: headline numbers, trends by month, breakdowns by category, customer, product, and city, operational checks, and a short written summary of what the numbers mean.

It's every tool from Level 3 used together: aggregates, grouping, joins, outer joins, functions, subqueries, CTEs, set operations, and window functions. More importantly, it's the thing people will actually ask you to produce: "can you pull the numbers?"

By the end, you'll have, in `playground/ch29/`:

- `report.sql`: one file, numbered sections, each a query answering one question, that runs clean from top to bottom,
- `findings.md`: five plain-English sentences a shop owner could act on, each backed by a number from the report.

## Before you start

- Finish chapters 20 to 28.
- Read the [starter README](starter/README.md). It describes the dataset's quirks: the cancelled order, the price change, the product that never sold, the customer who never ordered. Every one of them is a trap for a careless query.
- Make `playground/ch29/`.
- Reload the dataset so you're starting clean: `\c sales` then `\i .../starter/seed.sql`.
- `\pset null '[NULL]'`.

**Two rules for every query in this report:**

1. **Revenue excludes cancelled orders.** A cancelled order is money that never arrived. Decide early how you'll exclude it (a `live_orders` CTE is the cleanest), and do it the same way everywhere.
2. **Every "per X" report lists every X**, including the ones with zero. The customer who never ordered and the product that never sold must appear. That means outer joins or `coalesce`, and you must check.

## Milestone 1: Sanity checks

**Goal:** know your data before you summarize it.

Start `report.sql` with a section that prints row counts for all five tables, the grand total of all order lines, and the grand total excluding the cancelled order.

**Check:** 4 categories, 11 products, 6 customers, 12 orders, 21 lines. `709.16` for everything, `664.16` live. If those don't match, reload the seed.

## Milestone 2: Headline numbers

**Goal:** one row, four numbers.

For live (non-cancelled) orders: how many orders, total revenue, average order value, and the biggest single order.

**Check:** `11 | 664.16 | 60.38 | 173.99`.

<details>
<summary>Hint</summary>

A CTE that totals each live order, then aggregates over it. The chapter 26 pattern.

</details>

## Milestone 3: Month by month

**Goal:** the trend.

One row per month with: the month as `Jul 2026`-style text, number of orders, revenue, running total, and change from the previous month.

**Check:**

```
  month   | orders | revenue | running_total | change
----------+--------+---------+---------------+---------
 Jul 2026 |      3 |  194.99 |        194.99 |  [NULL]
 Aug 2026 |      4 |  288.48 |        483.47 |   93.49
 Sep 2026 |      4 |  180.69 |        664.16 | -107.79
```

**The trap in this milestone:** if you `ORDER BY` the text label, you get Aug, Jul, Sep, because that's alphabetical. Sort by the real date (`date_trunc`), display the text. Your running total will look wrong until you fix this, which is how you'll notice.

## Milestone 4: By category

**Goal:** where the money comes from.

Per category: units sold, revenue, and percentage of total revenue (one decimal). Biggest first.

**Check:** Furniture 52.4%, Bags 19.4%, Stationery 14.4%, Electronics 13.8%. Stationery sells 50 units for less money than Furniture makes on 4.

## Milestone 5: By customer and by city

**Goal:** who buys.

1. Per customer, **all six**: name, city, live order count, total spent, average order. Highest spender first. Elina must appear with `0`.
2. Per city: number of customers, orders, revenue.

**Check:** Chandra 239.00 on 2 orders (average 119.50); Asha 218.19 on 3; Elina 0. Kathmandu 304.42, Lalitpur 239.00, Pokhara 120.74.

<details>
<summary>Hint</summary>

Total live orders in a CTE, then `customers LEFT JOIN` that CTE. Count the CTE's id column, not `*`.

</details>

## Milestone 6: By product

**Goal:** what sells, and what doesn't.

1. Per product, **all eleven**: name, category, units, revenue from live orders. Best first. The Whiteboard marker must show 0.
2. Each product's rank within its category by revenue.
3. The top 2 products per category.

**The trap in this milestone:** the Backpack appears in the cancelled order (1 unit, 45.00) *and* a live one (2 units, 90.00). If your product report says Backpack sold 3 units for 135.00, the cancelled order leaked in. A `LEFT JOIN` to `order_items` then `JOIN orders ... WHERE status <> 'cancelled'` turns your left join back into an inner join and drops the Whiteboard marker too (chapter 23). The clean fix: a `live_items` CTE (order items joined to live orders), then `products LEFT JOIN live_items`.

**Check:** Office chair 298.00, Backpack **90.00** (2 units), ..., Whiteboard marker 0.

## Milestone 7: Operations

**Goal:** things the shop needs to *do*.

1. Orders and total value per status.
2. How many pending orders, and how much money is waiting in them.
3. Average time from order to shipping, per month. The raw `avg()` of intervals can print odd things like `1 day 24:23:20`; wrap it in `justify_interval()` to tidy.
4. Active products with fewer than 20 in stock, lowest first.
5. Which weekdays orders arrive on.

**Check:** shipped 6 / 525.22, paid 3 / 78.24, pending 2 / 60.70, cancelled 1 / 45.00. Low stock: Office chair 6, Backpack 8, Desk lamp 15. Fridays and Saturdays get 5 orders each, Sundays 2.

## Milestone 8: Customer behaviour

**Goal:** the questions a marketing person asks.

1. New customers per month (by the month of their **first** order). Jul 3, Aug 2.
2. Repeat vs one-time customers (2+ live orders vs 1).
3. Days between each customer's orders (chapter 28, exercise 3).
4. Which products make up the first 80% of revenue (cumulative percentage).
5. Customers who ordered in all three months (set operations), and customers who ordered in July but not since.

## Milestone 9: Write it up

**Goal:** `findings.md`, five sentences.

Each sentence must contain a number from your report and say what the shop should do about it. Not "revenue was 664.16" but "September revenue fell 107.79 from August, mostly because no Furniture sold; the shop should check Office chair stock (6 left) before the next promotion." You're translating queries into decisions. That's the actual job.

## Milestone 10: Run it clean

Reload the seed, then `\i report.sql`. Every section runs, no errors, every number matches the checks above. Read through the output once more as if you were the shop owner. If anything would confuse them (a NULL, an unlabeled column, 16 decimal places), fix it.

## Common mistakes

**1. Cancelled revenue leaking in**

Decide once (a `live_orders` or `live_items` CTE), reuse everywhere. Check Backpack: 90.00, not 135.00.

**2. Losing the zeroes**

A `JOIN` after a `LEFT JOIN`, or a `WHERE` on the right table, drops Elina and the Whiteboard marker. Every "per X" needs a check that all X are there.

**3. Sorting by a text label**

`Aug` before `Jul`. Sort by the date, show the text.

**4. Counting lines as orders**

Total per order first (CTE), then count. Or `count(DISTINCT o.id)`.

**5. Raw averages**

`27.4436363636` in a report. `round(..., 2)` everything that's money or an average.

**6. Numbers without sentences**

A report nobody can act on is a spreadsheet. Milestone 9 is not optional.

## Quick recap

- Decide how to exclude cancelled orders once, in a CTE, and reuse it.
- Every per-X report includes all X: outer joins, `coalesce`, and a check.
- Aggregate in a CTE, then join, window, or filter in the next step.
- Sort by real dates, display formatted text.
- Round money and averages. Label every column.
- Finish with sentences a person can act on.

---

**Congratulations!** You've finished Level 3. 🎉 You can now answer almost any question about data spread across many tables, which is the skill most people mean when they say "knows SQL". Try the [exercises](exercises.md) for extra report features, then head back to the [roadmap](../README.md). Level 4 is about keeping data safe and fast: transactions, indexes, permissions, and backups.
