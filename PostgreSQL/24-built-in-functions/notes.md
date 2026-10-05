# 24 Handy Built-in Functions

## What is it?

A **function** takes one or more values and gives you back a new one: `upper('hello')` gives `'HELLO'`, `round(27.44363, 2)` gives `27.44`, `date_trunc('month', some_date)` gives the first of that month.

PostgreSQL has hundreds. This chapter is the two dozen you'll actually use, grouped by what they work on: text, numbers, dates, and two special tools for handling NULL and "if this then that" (`COALESCE` and `CASE`).

## Why does it matter?

Real data is messy. Emails arrive in mixed case. Names have stray spaces. You need "the month" out of a timestamp, "the first letter" out of a name, "N/A" instead of a blank, and "cheap / mid / premium" instead of a raw price. Functions turn stored data into the shape a report or a screen needs, right inside the query.

You've already used a few: `length()`, `upper()`, `round()`, `now()`, `date_trunc()`. This chapter fills in the set, so you stop reaching for a programming language to do what SQL does in one line.

## Real-world example

A kitchen drawer of tools. Each one does one small job well:

| Tool | Function |
|---|---|
| A peeler: strips the outside off | `trim()` strips spaces from the ends |
| A knife: cuts a piece out | `substring()`, `left()`, `split_part()` |
| Measuring cups: round to the nearest mark | `round()`, `floor()`, `ceil()` |
| A calendar: which month is it? | `date_trunc()`, `extract()`, `to_char()` |
| A substitute ingredient when one is missing | `coalesce()` |
| A recipe step: "if it's too thick, add water" | `CASE WHEN` |

You don't memorize the whole drawer. You learn where the common tools are, and look up the rest.

## How it works

Work in `sales`, with `\pset null '[NULL]'`. Most examples here work with `SELECT` and no table, so you can try variations freely.

### Text

**Changing case and measuring:**

```sql
SELECT upper('hello') AS up, lower('HELLO') AS low, initcap('asha rai') AS cap, length('Kathmandu') AS len;
```

```
  up   |  low  |   cap    | len
-------+-------+----------+-----
 HELLO | hello | Asha Rai |   9
```

`lower()` matters more than it looks. `'Asha@Example.com'` and `'asha@example.com'` are different text to PostgreSQL, so a `UNIQUE` on `email` won't catch them. Store emails as `lower(email)`, and compare with `lower()` too.

**Cleaning up spaces:**

```sql
SELECT trim('   hello   ') AS trimmed, trim(both '-' from '--hi--') AS dashes;
```

```
 trimmed | dashes
---------+--------
 hello   | hi
```

User input nearly always has stray spaces. `trim()` before you store it.

**Joining text:**

```sql
SELECT 'Hello' || ' ' || 'World' AS pipes,
       concat('Hello', ' ', 'World') AS concat,
       concat_ws(', ', 'Rai', 'Asha') AS with_sep;
```

```
    pipes    |   concat    | with_sep
-------------+-------------+-----------
 Hello World | Hello World | Rai, Asha
```

`||` and `concat()` look the same until a NULL turns up. `'a' || NULL` is NULL (chapter 07). `concat('a', NULL, 'b')` is `'ab'`: it skips NULLs. `concat_ws` ("with separator") puts the separator between the parts. For building display text from columns that might be empty, `concat()` is the safer choice.

**Cutting pieces out:**

```sql
SELECT left('Kathmandu', 4) AS l, right('Kathmandu', 5) AS r, substring('Kathmandu' from 5 for 3) AS mid;
```

```
  l   |   r   | mid
------+-------+-----
 Kath | mandu | man
```

`substring(text from start for length)`. Positions start at 1, not 0.

**Finding and replacing:**

```sql
SELECT replace('2026-09-30', '-', '/') AS replaced,
       position('@' in 'asha@example.com') AS at_pos,
       split_part('asha@example.com', '@', 2) AS domain;
```

```
  replaced  | at_pos |   domain
------------+--------+-------------
 2026/09/30 |      5 | example.com
```

`split_part(text, separator, n)` is wonderful: split on the separator and take piece number *n*. Email domains, the second word of a name, parts of a product code.

**Padding and repeating:**

```sql
SELECT lpad('42', 5, '0') AS padded, repeat('=', 10) AS line, reverse('abc') AS rev;
```

```
 padded |    line    | rev
--------+------------+-----
 00042  | ========== | cba
```

`lpad` makes `'00042'`-style invoice numbers.

**On real data:**

```sql
SELECT name, left(name, 1) || left(split_part(name, ' ', 2), 1) AS initials
FROM customers ORDER BY name;
```

```
      name       | initials
-----------------+----------
 Asha Rai        | AR
 Bikram Shrestha | BS
 Chandra Gurung  | CG
 ...
```

Functions nest: the result of `split_part` goes straight into `left`.

### Numbers

```sql
SELECT round(27.4436, 2) AS r2, round(27.4436) AS r0, ceil(27.1) AS up, floor(27.9) AS down, trunc(27.4436, 2) AS cut;
```

```
  r2   | r0 | up | down |  cut
-------+----+----+------+-------
 27.44 | 27 | 28 |   27 | 27.44
```

- `round(x, n)` rounds to *n* decimal places. `round(x)` rounds to a whole number. Halves round away from zero: `round(2.5)` is `3`.
- `ceil()` always goes up, `floor()` always goes down.
- `trunc()` chops without rounding.

```sql
SELECT abs(-5) AS absolute, 17 % 5 AS remainder, power(2, 10) AS pow, sqrt(144) AS root,
       greatest(3, 9, 4) AS big, least(3, 9, 4) AS small;
```

```
 absolute | remainder | pow  | root | big | small
----------+-----------+------+------+-----+-------
        5 |         2 | 1024 |   12 |   9 |     3
```

`greatest()` and `least()` pick the biggest or smallest **of several values in one row**. Don't confuse them with `max()` and `min()`, which work *down* a column across rows.

And the integer-division fix, one more time, because it bites everyone:

```sql
SELECT 10 / 3 AS int_div, round(10.0 / 3, 2) AS rounded;
```

```
 int_div | rounded
---------+---------
       3 |    3.33
```

### Dates and times

**Chopping to a unit: `date_trunc`**

```sql
SELECT date_trunc('month', timestamptz '2026-09-26 18:05+05:45') AS month_start;
```

```
        month_start
---------------------------
 2026-09-01 00:00:00+05:45
```

`date_trunc('month', ...)` turns any moment into the first instant of its month. Also `'year'`, `'week'`, `'day'`, `'hour'`. You used it in chapter 21 to group orders by month. Add `::date` when you only want the day part.

**Pulling a part out: `extract`**

```sql
SELECT extract(year from date '2026-09-26') AS yr,
       extract(month from date '2026-09-26') AS mon,
       extract(dow from date '2026-09-26') AS dow;
```

```
  yr  | mon | dow
------+-----+-----
 2026 |   9 |   6
```

`dow` is day of week, 0 = Sunday, so 6 is Saturday. `extract(epoch from interval)` turns an interval into seconds, which is how you get "hours to ship" as a plain number:

```sql
SELECT id, shipped_at - ordered_at AS time_to_ship,
       round(extract(epoch from shipped_at - ordered_at) / 3600) AS hours
FROM orders WHERE shipped_at IS NOT NULL ORDER BY id LIMIT 3;
```

```
 id |  time_to_ship   | hours
----+-----------------+-------
  1 | 1 day 22:45:00  |    47
  2 | 1 day 21:00:00  |    45
  3 | 2 days 00:55:00 |    49
```

**Formatting for humans: `to_char`**

```sql
SELECT to_char(date '2026-09-26', 'DD Mon YYYY') AS a,
       to_char(date '2026-09-26', 'FMDay') AS b,
       to_char(timestamptz '2026-09-26 18:05+05:45', 'HH24:MI') AS c,
       to_char(date '2026-09-26', 'YYYY-MM') AS d;
```

```
      a      |    b     |   c   |    d
-------------+----------+-------+---------
 26 Sep 2026 | Saturday | 18:05 | 2026-09
```

The pattern letters: `YYYY` year, `MM` month number, `Mon` short month name, `Month` full name, `DD` day, `Dy`/`Day` weekday, `HH24:MI` 24-hour time. `FM` in front strips padding spaces. `to_char` works on numbers too: `to_char(1234567.891, 'FM999,999,990.00')` gives `1,234,567.89`.

`to_char(ordered_at, 'YYYY-MM')` is a popular alternative to `date_trunc` for grouping by month, because the label is already readable. Either works.

**Going the other way: `to_date`, `make_date`**

```sql
SELECT to_date('26/09/2026', 'DD/MM/YYYY') AS parsed, make_date(2026, 12, 25) AS xmas;
```

```
   parsed   |    xmas
------------+------------
 2026-09-26 | 2026-12-25
```

`to_date` is how you import dates written in some other format. Tell it the pattern once, and it never guesses.

**Differences: `age`**

```sql
SELECT age(date '2026-09-30', date '2000-01-15') AS age;
```

```
           age
-------------------------
 26 years 8 mons 15 days
```

`age(later, earlier)` gives a human-friendly interval. Subtracting dates gives plain days; `age` gives years, months, and days.

**Arithmetic, recap from chapter 12:**

```sql
SELECT date '2026-09-30' + 7 AS next_week,
       (date '2026-09-30' + interval '1 month')::date AS next_month;
```

```
 next_week  | next_month
------------+------------
 2026-10-07 | 2026-10-30
```

### `CASE`: if this, then that

`CASE` lets you compute a value based on conditions, row by row. Price bands:

```sql
SELECT name, price,
       CASE
         WHEN price < 5 THEN 'cheap'
         WHEN price < 50 THEN 'mid'
         ELSE 'premium'
       END AS tier
FROM products ORDER BY price;
```

```
       name        | price  |  tier
-------------------+--------+---------
 Pen               |   1.20 | cheap
 Whiteboard marker |   1.80 | cheap
 Sticky notes      |   2.75 | cheap
 Notebook          |   3.90 | cheap
 Stapler           |   8.00 | mid
 ...
 Backpack          |  45.00 | mid
 Office chair      | 149.00 | premium
(11 rows)
```

Conditions are checked top to bottom; the first true one wins. `ELSE` catches everything else. Without an `ELSE`, unmatched rows get NULL.

`CASE` is an expression, so it goes anywhere a value goes. In a `GROUP BY`:

```sql
SELECT CASE WHEN status IN ('shipped', 'cancelled') THEN 'closed' ELSE 'open' END AS state, count(*)
FROM orders GROUP BY state ORDER BY state;
```

```
 state  | count
--------+-------
 closed |     7
 open   |     5
```

Inside a `sum()`, to count conditionally (the portable version of `FILTER`):

```sql
SELECT sum(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) AS shipped FROM orders;
```

In an `ORDER BY`, to put one value first: `ORDER BY CASE WHEN status = 'pending' THEN 0 ELSE 1 END, ordered_at`.

### `COALESCE`: the first thing that isn't NULL

```sql
SELECT id, status, coalesce(shipped_at::date::text, 'not shipped') AS shipped
FROM orders ORDER BY id LIMIT 5;
```

```
 id |  status   |   shipped
----+-----------+-------------
  1 | paid      | 2026-07-05
  2 | shipped   | 2026-07-12
  3 | shipped   | 2026-07-20
  4 | cancelled | not shipped
  5 | shipped   | 2026-08-04
```

`coalesce(a, b, c, ...)` returns the first argument that isn't NULL. Three everyday uses:

- **Display:** `coalesce(author, 'Unknown')`, `coalesce(phone, 'no phone')`.
- **Maths:** `coalesce(sum(x), 0)` so an empty total is `0`, not NULL ([chapter 23](../23-outer-joins/notes.md)).
- **Fallbacks:** `coalesce(nickname, first_name, 'friend')`.

All arguments must be the same type, which is why `shipped_at` was cast to text above before being paired with `'not shipped'`.

### `NULLIF`: turn a value into NULL

The opposite tool. `nullif(a, b)` returns NULL if `a` equals `b`, otherwise `a`. Its classic job is stopping division by zero:

```sql
SELECT 10 / nullif(0, 0) AS safe_division;
```

```
 safe_division
---------------
        [NULL]
```

`10 / 0` is an error that kills the whole query. `10 / nullif(x, 0)` gives NULL for that row instead and lets the rest through. Also handy for treating empty strings as missing: `nullif(trim(notes), '')`.

### Finding more

- In psql, `\df upper` shows a function's signatures; `\df *date*` lists everything with "date" in the name.
- The official docs chapter "Functions and Operators" is the full catalogue. It's long. Skim the section headings, and search when you need something.
- Ask Claude "is there a PostgreSQL function that...". There nearly always is.

## Common mistakes

**1. `||` with a column that can be NULL**

The whole string goes NULL. Use `concat()`, or wrap the column in `coalesce()`.

**2. Positions starting at 0**

SQL counts from 1. `substring('abc' from 1 for 1)` is `'a'`.

**3. `max()` when you mean `greatest()`**

`max(a, b)` is an error. Across rows is `max()`; within a row is `greatest()`.

**4. `CASE` without `ELSE`**

Rows that match nothing become NULL, often silently. Add an `ELSE` unless NULL is what you want.

**5. Mismatched types in `coalesce`**

`coalesce(shipped_at, 'not shipped')` fails: a timestamp and a text can't share a column. Cast first.

**6. Guessing `to_char` patterns**

`MM` is month, `MI` is minutes, `mm` is also month (case only affects *names* like `Mon`/`MON`). When a date comes out strange, check the pattern letters.

## Quick recap

- **Text:** `lower`/`upper`, `trim`, `length`, `concat`/`concat_ws` (NULL-safe), `left`/`right`/`substring`, `replace`, `split_part`, `lpad`.
- **Numbers:** `round(x, n)`, `ceil`, `floor`, `trunc`, `abs`, `%`, `greatest`/`least` (within a row).
- **Dates:** `date_trunc` to chop, `extract` to pull a part out, `to_char` to format, `to_date` to parse, `age` for human differences.
- **`CASE WHEN ... THEN ... ELSE ... END`** computes a value from conditions, anywhere a value can go.
- **`coalesce(a, b)`** is the first non-NULL. **`nullif(a, b)`** makes NULL on purpose, especially to avoid dividing by zero.
- `\df name` and the docs for everything else.

---

**Next:** try the [exercises](exercises.md), then move on to [25 Subqueries](../25-subqueries/notes.md).
