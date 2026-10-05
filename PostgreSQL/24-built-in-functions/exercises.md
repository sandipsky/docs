# 24 Handy Built-in Functions: Exercises

**How to do these:**

- Work in psql, connected to `sales`. Run `\pset null '[NULL]'`.
- Save each answer in `playground/ch24/ex1.sql`, `ex2.sql`, and so on.
- When you're not sure what a function does, try it on a literal first: `SELECT split_part('a-b-c', '-', 2);`
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your work.

---

## Exercise 1 (Easy): Text clean-up

1. Show each customer's name and their **initials** (first letter of each of the two names), like `AR` for Asha Rai.
2. Show each customer's email **domain** (the part after `@`), and how many customers share each domain.
3. Show each product's name in **UPPERCASE** and its length, the three longest names first.

Expected output of query 3:

```
       name        | len
-------------------+-----
 WHITEBOARD MARKER |  17
 WIRELESS MOUSE    |  14
 LAPTOP SLEEVE     |  13
(3 rows)
```

<details>
<summary>Hint</summary>

Initials: `left(name, 1) || left(split_part(name, ' ', 2), 1)`.

</details>

---

## Exercise 2 (Easy): Dates for humans

For the first four orders (by id), show the order id, the date as `26 Sep 2026`-style text, the month as `Jul 2026`-style text, and the weekday as `Fri`.

Expected output:

```
 id |    day      | month_label | weekday
----+-------------+-------------+---------
  1 | 03 Jul 2026 | Jul 2026    | Fri
  2 | 10 Jul 2026 | Jul 2026    | Fri
  3 | 18 Jul 2026 | Jul 2026    | Sat
  4 | 25 Jul 2026 | Jul 2026    | Sat
(4 rows)
```

<details>
<summary>Hint</summary>

Three `to_char()` calls on `ordered_at` with patterns `'DD Mon YYYY'`, `'Mon YYYY'`, and `'Dy'`.

</details>

---

## Exercise 3 (Medium): Price bands and status groups

1. Label every product `cheap` (under 5), `mid` (5 to under 50), or `premium` (50 and up), then **count how many products are in each band**.
2. Group orders into `closed` (shipped or cancelled) and `open` (everything else), with a count of each.
3. Without `FILTER`, using `sum(CASE ...)`, show in one row: how many orders are shipped, and how many aren't.

Expected output of query 1:

```
  tier   | products
---------+----------
 cheap   |        4
 mid     |        6
 premium |        1
(3 rows)
```

<details>
<summary>Hint</summary>

Query 1 is a `CASE` expression with an alias, then `GROUP BY` that alias.

</details>

---

## Exercise 4 (Medium): Filling in blanks

1. List every order's id, status, and shipped date, showing the text `not shipped` where there's no date.
2. For every order that **has** shipped, show the id and the time to ship in **whole hours**.
3. Every customer's name and city, but show `(local)` instead of the city for customers in Kathmandu. Use `nullif` and `coalesce` together, not `CASE`.

Expected first rows of query 2:

```
 id | hours
----+-------
  1 |    47
  2 |    45
  3 |    49
  5 |    51
 ...
```

<details>
<summary>Hint</summary>

Query 2: `round(extract(epoch from shipped_at - ordered_at) / 3600)`. Query 3: `coalesce(nullif(city, 'Kathmandu'), '(local)')`. Say out loud what each layer does.

</details>

---

## Exercise 5 (Challenge): A monthly report, nicely formatted

Produce one row per month with: the month as `Jul 2026`-style text, the number of orders, the number shipped, and the **percentage shipped** rounded to one decimal place and shown with a `%` sign, like `50.0%`.

Expected output:

```
  month   | orders | shipped |  pct
----------+--------+---------+-------
 Jul 2026 |      4 |       2 | 50.0%
 Aug 2026 |      4 |       3 | 75.0%
 Sep 2026 |      4 |       1 | 25.0%
(3 rows)
```

Two traps: the months must come out in **date order**, not alphabetical (Aug, Jul, Sep would be wrong), and the division must not be integer division.

<details>
<summary>Hint 1</summary>

Group by `date_trunc('month', ordered_at)`, and `ORDER BY` that, but display `to_char(date_trunc('month', ordered_at), 'Mon YYYY')`. You can `GROUP BY` and `ORDER BY` an expression that isn't shown.

</details>

<details>
<summary>Hint 2</summary>

`round(100.0 * count(*) FILTER (WHERE status = 'shipped') / count(*), 1) || '%'`. The `100.0` (not `100`) is what makes the division decimal.

</details>
