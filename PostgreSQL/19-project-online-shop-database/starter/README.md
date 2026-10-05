# Online Shop Database: the client brief

This folder contains no SQL. It's the brief from the shop's owner and the sample data they want loaded, exactly as a real client would hand it to you. Everything else (the tables, the rules, the files) is yours to design. Follow the milestones in this chapter's [notes.md](../notes.md).

## The brief

> Hi! I run a small online stationery shop and I need a proper database. Right now it's all in a spreadsheet and it's a mess.
>
> We sell **products**. Each product has a name, a code we use internally (we call it the SKU, and no two products ever share one), a price, and how many we have in stock. Every product belongs to exactly one **category** (Stationery, Furniture, Bags, and we'll add more later). Prices are never negative, obviously, and stock can be zero but never below.
>
> **Customers** sign up with their name and email. The email has to be unique, we use it to log them in. We'd also like to know which city they're in, for delivery estimates.
>
> Customers place **orders**. An order belongs to one customer and has a date. Each order has a **status**: it starts as *pending*, and can become *paid*, *shipped*, or *cancelled*. Nothing else.
>
> An order contains one or more products, each with a quantity (at least 1). The same product shouldn't appear as two separate lines in one order; just increase the quantity.
>
> **Very important:** we need to know the price the customer actually paid for each item, *even if we change the product's price later*. We had a nightmare last year where a price change made every old receipt wrong.
>
> **Also very important:** we never, ever want to lose an order record. Even if a customer leaves or we stop selling a product, the orders they're in must stay exactly as they were.
>
> Thanks! Let me know when it's ready.

## Sample data

Load exactly this, so the checks in the notes line up.

### Categories

| name |
|---|
| Stationery |
| Furniture |
| Bags |

### Products

| name | sku | price | stock | category |
|---|---|---|---|---|
| Notebook | STA-001 | 3.50 | 120 | Stationery |
| Pen | STA-002 | 1.20 | 500 | Stationery |
| Sticky notes | STA-003 | 2.75 | 200 | Stationery |
| Stapler | STA-004 | 8.00 | 40 | Stationery |
| Desk lamp | FUR-001 | 24.99 | 15 | Furniture |
| Backpack | BAG-001 | 45.00 | 8 | Bags |

### Customers

| name | email | city |
|---|---|---|
| Asha Rai | asha@example.com | Kathmandu |
| Bikram Shrestha | bikram@example.com | Pokhara |
| Chandra Gurung | chandra@example.com | Lalitpur |

### Orders and their items

| order | customer | placed on | status | items (quantity × product) |
|---|---|---|---|---|
| 1 | Asha Rai | 2026-09-05 | paid | 2 × Notebook, 5 × Pen |
| 2 | Bikram Shrestha | 2026-09-12 | shipped | 1 × Desk lamp, 1 × Stapler |
| 3 | Asha Rai | 2026-09-20 | pending | 1 × Backpack |
| 4 | Chandra Gurung | 2026-09-28 | cancelled | 3 × Sticky notes |

For each item, the price paid is the product's current price in the table above. That's 6 order items in total.

## Change requests

The owner emailed again, a week after you finished. Handle these in Milestone 7, without dropping any table or losing any row.

1. "Can we store a **phone number** for customers? Optional, some people won't give one."
2. "We want to **stop selling the Stapler**, but order 2 has one in it. Please remove it from the shop." *(Think carefully about this one. Reread the brief.)*
3. "Orders need a **shipped date**, separate from the order date. It'll be empty until the order ships."
4. "We've decided SKUs should be **at least 7 characters**. All the current ones are fine."
5. "The Notebook is going up to **3.90**. Please update it. And please check order 1 still shows the old price!"

## Things the brief leaves vague

A real client won't think of everything. Decide these yourself and write your choices in `plan.md`:

- Can a product's stock be changed to a number below zero by an `UPDATE`? (The brief says never below zero.)
- What happens to a customer's orders if the customer is deleted? (The brief has a strong opinion.)
- Can a category be deleted while products are in it?
- Should `city` be free text, or a fixed list? (Either is defensible for three cities. Say why.)
