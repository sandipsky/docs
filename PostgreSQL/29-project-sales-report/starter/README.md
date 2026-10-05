# Sales Report: the dataset

`seed.sql` builds the shop used by every chapter in Level 3 (20 to 29). It drops and recreates five tables and fills them with three months of made-up sales, July to September 2026.

## Loading it

```sql
CREATE DATABASE sales;      -- once
\c sales
\i C:/Users/YourName/Downloads/Projects/Sandip/docs/PostgreSQL/29-project-sales-report/starter/seed.sql
```

Run the `\i` again any time you want a clean copy. It takes less than a second.

## The tables

Same shape as the shop you designed in chapter 19:

```
categories ───< products ───< order_items >─── orders >─── customers
```

| Table | Rows | Notes |
|---|---|---|
| `categories` | 4 | Stationery, Furniture, Bags, Electronics |
| `products` | 11 | `price` is the **current** price; `is_active` marks discontinued items |
| `customers` | 6 | with `city` and `joined_on` |
| `orders` | 12 | `status` is pending / paid / shipped / cancelled; `shipped_at` is NULL until shipped |
| `order_items` | 21 | `unit_price` is the price **paid at the time**, which can differ from `products.price` |

## The traps, on purpose

Each of these is designed to catch a careless query. Know them before you start.

| Quirk | Where | What it catches |
|---|---|---|
| **Order 4 is cancelled** (Asha, one Backpack, 45.00) | `orders.status` | Revenue totals that forget to exclude cancelled orders. Live revenue is **664.16**; everything is 709.16. |
| **Elina Maharjan has never ordered** | `customers` id 5 | Per-customer reports built with an inner join lose her. |
| **The Whiteboard marker has never sold** | `products` id 5 | Per-product reports built with an inner join lose it. |
| **The Stapler is discontinued** (`is_active = false`) but was sold once | `products` id 4 | Reports that filter on `is_active` hide historical sales. |
| **The Notebook's price rose** from 3.50 to 3.90 in September | `order_items.unit_price` vs `products.price` | Revenue computed from `products.price` instead of `unit_price` is wrong. |
| **The Backpack is in both the cancelled order and a live one** | orders 4 and 9 | Shows 3 units / 135.00 if the cancelled order leaks in; the right answer is 2 units / 90.00. |
| **Two orders share a month and a customer** | Asha, orders 1 and 4 in July | Counting lines instead of orders gives inflated order counts. |

## Sanity numbers

If your query gives one of these, you're on track:

| Question | Answer |
|---|---|
| Orders, live orders | 12, 11 |
| Revenue, live revenue | 709.16, 664.16 |
| Live revenue by month | Jul 194.99, Aug 288.48, Sep 180.69 |
| Live revenue by category | Furniture 347.98, Bags 129.00, Stationery 95.70, Electronics 91.48 |
| Top customer (live) | Chandra Gurung, 239.00 over 2 orders |
| Top product (live) | Office chair, 298.00 |
| Average live order value | 60.38 |
| Pens sold (all orders) | 35 units |
| Orders per weekday | Fri 5, Sat 5, Sun 2 |

## Timestamps

All times are written with a `+05:45` offset (Nepal). PostgreSQL stores the exact moment and shows it in *your* time zone, so if your computer isn't on Nepal time, the hours you see will differ from the ones in the file. The dates won't change for any of these orders (none are near midnight), so grouping by month and day is safe everywhere.
