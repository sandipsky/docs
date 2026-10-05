# 18 Normalization

## What is it?

**Normalization** is organizing your tables so that each fact is stored **exactly once**, in the one place it belongs.

You've been doing it informally since chapter 02: one kind of thing per table, one value per cell, link instead of copy. This chapter gives the ideas their names, shows a step-by-step method, and explains when it's right to break the rules on purpose.

## Why does it matter?

Here's a single-table design for an online shop, the kind that starts life as a spreadsheet:

| order_id | order_date | customer_name | customer_email | customer_city | products | quantities | total |
|---|---|---|---|---|---|---|---|
| 1 | 2026-09-05 | Asha Rai | asha@example.com | Kathmandu | Notebook, Pen | 2, 5 | 13.00 |
| 2 | 2026-09-12 | Bikram Shrestha | bikram@example.com | Pokhara | Desk lamp | 1 | 24.99 |
| 3 | 2026-09-20 | Asha Rai | asha@exmaple.com | Kathmandu | Backpack | 1 | 45.00 |
| 4 | 2026-09-28 | Chandra Gurung | chandra@example.com | lalitpur | Sticky notes | 3 | 8.25 |

It *works*, in the sense that the data is in there. But look at what goes wrong. Each of these has a name:

- **Update anomaly.** Asha changes her email. It's on orders 1 and 3 (and order 3 already has a typo). You must find and fix every copy, and you'll miss one.
- **Insert anomaly.** A new customer signs up but hasn't ordered yet. Where do they go? There's no row for a customer without an order.
- **Delete anomaly.** Order 2 is cancelled and deleted. Bikram's name, email, and city vanish with it. You just lost a customer by deleting an order.
- **Inconsistency.** `Kathmandu` and `lalitpur`: free text, typed by hand, every time. "How many customers in Lalitpur?" now depends on spelling.
- **Lists in cells.** `Notebook, Pen` and `2, 5`. "How many Pens have we sold?" needs you to pull text apart and line two lists up by position.

Every one of these is the same disease: **a fact stored in more than one place, or facts about different things crammed into one row.** Normalization is the cure.

## Real-world example

Two ways to keep a birthday card list:

- **The messy way:** a notebook where each page is a card you sent, and you write the friend's full address on every page. Your friend moves house: you have twelve pages to correct, and you'll miss some.
- **The normalized way:** an address book with one entry per friend, and a card list that just says "Sent to Priya, 2026". Priya moves: one line in the address book changes, and every card record is automatically right.

Normalization is the address book. One fact, one place, and everything else points at it.

## How it works

### Rule 1: one value per cell

Also known as **first normal form** (1NF). You know this one. No lists, no numbered column groups (`product_1`, `product_2`).

Applied to the shop table, each product in an order becomes its own row:

| order_id | order_date | customer_name | customer_email | ... | product | quantity |
|---|---|---|---|---|---|---|
| 1 | 2026-09-05 | Asha Rai | asha@example.com | ... | Notebook | 2 |
| 1 | 2026-09-05 | Asha Rai | asha@example.com | ... | Pen | 5 |
| 2 | 2026-09-12 | Bikram Shrestha | bikram@example.com | ... | Desk lamp | 1 |

Better: "how many Pens sold?" is now easy. Worse: Asha's email is now repeated *within* one order. Rule 1 alone isn't enough. That's expected; it's the first step, not the last.

### Rule 2: every column must be about the whole key

This is **second normal form** (2NF), and it only matters when a table's key is a combination of columns.

The rows above are identified by `(order_id, product)`. Now ask, for each column: *is this a fact about the whole pair, or about just part of it?*

- `quantity`: about the pair. 2 Notebooks *in order 1*. Stays.
- `order_date`: about `order_id` only. It's the same for every product in the order.
- `customer_name`, `customer_email`: about `order_id` only (really about the customer, but we'll get there).

Columns that depend on only *part* of the key get moved out to a table keyed by that part. `order_date` and the customer columns move to an `orders` table keyed by `order_id`. What's left, `(order_id, product, quantity)`, is `order_items`.

### Rule 3: every column must be about the key, and nothing else

This is **third normal form** (3NF). Now look at the `orders` table:

| order_id | order_date | customer_name | customer_email | customer_city |
|---|---|---|---|---|

`order_date` is a fact about the order. But `customer_email`? That's a fact about the *customer*, who happens to be on this order. It depends on `customer_name`, not on `order_id`. Columns that describe some *other* thing get moved to that thing's table: `customers`, with its own `id`, and `orders` keeps just a `customer_id`.

The classic phrase for rules 2 and 3 together: **every column must depend on the key, the whole key, and nothing but the key.**

- *the key*: each row has a primary key, and columns describe that row.
- *the whole key*: not just part of a composite key (rule 2).
- *nothing but the key*: not some other column that's really a different thing (rule 3).

### The result

Four tables, each about exactly one thing:

```
customers              orders                 order_items              products
──────────             ──────────             ─────────────            ──────────
id                ◄──  customer_id            order_id  ────────►  ◄── product_id
name                   id            ◄──────  product_id               id
email                  ordered_at             quantity                 name
city                   status                 unit_price               price
                                                                       stock

customers ───< orders ───< order_items >─── products
```

Check against the anomalies:

- Asha's email changes: one `UPDATE` on one row of `customers`.
- A new customer with no orders: a row in `customers`. Fine.
- Order 2 deleted: Bikram stays in `customers`.
- Lalitpur spelled wrong: still possible in `city`, but now it's one cell per customer rather than one per order. (For a fixed list of cities, a `cities` table with a foreign key fixes it completely. Whether that's worth it is a judgment call. See "when to stop" below.)
- Lists in cells: gone. One `order_items` row per product per order.

This is exactly the design you'll build in the [Level 2 project](../19-project-online-shop-database/notes.md).

### A method you can follow

1. **Write it messy first.** Imagine the data as one wide spreadsheet. It's much easier to fix a bad table than to design a perfect one from nothing.
2. **Split lists into rows** (rule 1).
3. **For each column, ask "what is this a fact about?"** Write the answer next to it: "the order", "the customer", "the product", "this product in this order". Each distinct answer is a table.
4. **Give each table an `id`**, and replace copied facts with a foreign key to where the fact now lives.
5. **Check each table with one sentence:** "each row is one ____." If you need "and", split again.
6. **Look at anything that still appears to be duplicated**, and decide: mistake, or snapshot? (Next section.)

### Duplication versus snapshots

Look at `order_items.unit_price` next to `products.price`. Isn't that a fact stored twice?

No. They're **two different facts**: what the product costs *now*, and what the customer *paid then*. If the shop raises the Notebook price next month, the current price changes and the old receipt doesn't. Store both, because both are true.

A **snapshot** is a value copied on purpose because it records history. Shipping addresses on orders are another one: the customer may move, but the parcel went to the old address. Snapshots are not a normalization failure.

The test: *if the source changes, should this copy change too?* If yes, it's duplication: remove it and use a foreign key. If no, it's a snapshot: keep it, and name it clearly (`unit_price`, not `price`).

### Things you can work out

`total` on the original spreadsheet is the sum of quantity × unit price over the order's items. If you store it, it can disagree with the items. If you don't, you calculate it every time (easy, with [chapter 20](../20-counting-and-totals/notes.md)).

The default is **don't store what you can calculate**. The exception is when calculating is slow or the value must be frozen (a tax total on an issued invoice). If you do store a calculated value, it's your job to keep it right, which is what [triggers](../38-functions-and-triggers/notes.md) are for.

### When to stop

Taken to extremes, normalization gives you a `cities` table, a `first_names` table, and a `postcodes` table that determines cities. Each is technically "more normal". Most are not worth it.

Aim for the three rules above (3NF). Then ask of each further split: *does this fact actually change, or get spelled wrong, in a way that would hurt?* A list of 50 cities you filter and report by: yes, make a table. A free-text "notes" column: leave it alone.

Deliberately storing data in a less normalized shape, for speed or convenience, is called **denormalization**. Real systems do it, especially for reporting. The rule is: normalize first, denormalize only for a measured reason, and know how you'll keep the copies in sync.

### The names, honestly

You'll hear "first, second, third normal form", and also BCNF, 4NF, 5NF. Interviewers like asking about them. In practice:

- 1NF, 2NF, 3NF are the three rules in this chapter. Aim for them.
- The higher ones handle rare, specific situations. You can look them up if a design ever feels wrong in a way the three rules don't explain.

You don't need to recite definitions. You need the method and the habit of asking "what is this a fact about?"

## Common mistakes

**1. Under-normalizing "for convenience"**

`customer_name` on `orders` "so we don't have to join". Three months later, two spellings of every name. Join. It's one line.

**2. Over-normalizing**

A table for every noun in sight. A `genders` table with two rows. A `first_names` table. If a split doesn't prevent a real anomaly, it's just more joins.

**3. "Fixing" snapshots**

Someone sees `unit_price` and `price`, decides it's duplication, and deletes `unit_price`. Every historical receipt now shows today's prices. Ask the "if the source changes, should this change?" question first.

**4. Storing calculated values without a plan**

A `total` on orders that nobody updates when an item is removed. Either don't store it, or make its maintenance automatic.

**5. Normalizing a table with no primary key**

The rules are all about "the key". No key, no rules. Give every table an `id` first.

## Quick recap

- Normalization: each fact **once**, in the table that's about that thing. It cures update, insert, and delete anomalies.
- **Rule 1:** one value per cell. **Rule 2:** every column depends on the whole key. **Rule 3:** every column depends on the key and nothing else. "The key, the whole key, and nothing but the key."
- Method: write it messy, split lists, ask "what is this a fact about?" for each column, make a table per answer, link with foreign keys.
- A **snapshot** (`unit_price`) is a deliberate copy that records history. Not a mistake. Test: should it change when the source changes?
- Don't store what you can calculate, unless you have a reason and a plan to keep it right.
- Aim for the three rules; split further only when it prevents a real problem.

---

**Next:** try the [exercises](exercises.md), then move on to the Level 2 project: [19 Project: Online Shop Database](../19-project-online-shop-database/notes.md).
