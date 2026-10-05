# 12 Data Types in Depth

## What is it?

A **data type** says what kind of value a column can hold. You've been using four: `text`, `integer`, `boolean`, `date`. This chapter fills in the rest of the everyday set, explains the traps (money, time zones, dividing whole numbers), and gives you a simple guide for picking the right one.

## Why does it matter?

The type you pick decides three things:

1. **What PostgreSQL refuses.** An `integer` column refuses `'ten'`. That's the safety you've seen since chapter 06.
2. **How values behave.** `'10' < '9'` is true for text and false for numbers. `7 / 2` is `3` for whole numbers. Dates can be subtracted, text can't.
3. **What can go wrong later.** Store money as the wrong kind of number and totals will be off by a cent. Store a moment in time without a time zone and it'll be wrong for anyone in another country.

Choosing types is a small decision you make once, and live with forever. Worth ten minutes of thought.

## Real-world example

Think of the containers in a kitchen:

| Kitchen | Data types |
|---|---|
| A measuring jug with exact markings | `numeric`: exact decimals, for money |
| A kitchen scale that's good to about a gram | `double precision`: approximate decimals, for measurements |
| An egg carton with 12 slots | `integer`: whole numbers only |
| A label maker | `text`: any words, any length |
| A light switch | `boolean`: on or off |
| A calendar on the wall | `date` |
| A clock that also knows which city it's in | `timestamptz` |

You wouldn't measure flour in an egg carton. Pick the container that fits the thing.

## How it works

Work in `practice`. Everything here can be tried with `SELECT` alone, no tables needed, unless it says otherwise.

### Text

| Type | What it is | Use it? |
|---|---|---|
| `text` | Any length | **Yes, by default** |
| `varchar(n)` | At most `n` characters | Only when there's a real limit |
| `char(n)` | Exactly `n` characters, padded with spaces | No |

In PostgreSQL, `text` is fast and there's no penalty for using it. Reach for `varchar(50)` only when a limit is a genuine rule of your data, like a 2-letter country code. Then PostgreSQL enforces it:

```sql
CREATE TABLE codes (country varchar(2));
INSERT INTO codes VALUES ('NPL');
```

```
ERROR:  value too long for type character varying(2)
```

Avoid `char(n)`. It pads short values with spaces, which causes strange comparison bugs.

A habit you'll see in older code and tutorials: `varchar(255)` on everything. It's a leftover from other databases. In PostgreSQL, just write `text`.

### Whole numbers

| Type | Range | Use for |
|---|---|---|
| `smallint` | about ±32 thousand | Rarely. Tiny counts. |
| `integer` | about ±2.1 billion | **Most whole numbers**: counts, years, quantities |
| `bigint` | about ±9 quintillion (9 with 18 zeros) | Huge counters, ids in very large tables |

Go past the top and you get an error, not a wrong answer:

```sql
SELECT 2147483647 + 1;
```

```
ERROR:  integer out of range
```

`integer` is the everyday choice. For an `id` column on a table that might one day have billions of rows (every click on a big website), many teams use `bigint` from the start, because changing later is painful. Your practice tables are fine with `integer`.

### Dividing whole numbers

This is the surprise from chapter 03's exercises:

```sql
SELECT 7 / 2;      --  3      whole ÷ whole = whole, remainder thrown away
SELECT 7 / 2.0;    --  3.5    a decimal anywhere makes the answer a decimal
SELECT 7 % 2;      --  1      % gives the remainder
```

If you divide two integer *columns* and want a decimal, turn one into a decimal first. You'll see how in the casting section below.

### Decimals: exact or approximate?

There are two families, and picking the wrong one is one of the most common database mistakes in the world.

**`numeric(precision, scale)`** stores decimals **exactly**.

- `precision` is the total number of digits, `scale` is how many are after the point.
- `numeric(10, 2)` holds up to `99999999.99`: 10 digits, 2 of them decimals.
- Plain `numeric` with no brackets holds any size and any number of decimals.

```sql
SELECT 0.1 + 0.2;    -- 0.3   (numbers you type are numeric by default)
```

**`double precision`** (and its smaller sibling `real`) store decimals **approximately**, the way most programming languages do. Fast, but:

```sql
SELECT 0.1::double precision + 0.2::double precision;
```

```
       ?column?
---------------------
 0.30000000000000004
```

That tiny error is harmless when you're measuring temperature. It's a disaster when you're adding up invoices. A cent goes missing, the totals don't match, and someone spends a day finding out why.

**Rule: money is always `numeric`.** Use `numeric(10, 2)` for ordinary prices, or wider (`numeric(12, 2)`, `numeric(14, 4)`) if you need bigger numbers or more decimal places.

Two things `numeric(10, 2)` does that you should know:

```sql
CREATE TABLE prices (amount numeric(10, 2));
INSERT INTO prices VALUES (12.345);           -- stored as 12.35: rounded to fit
INSERT INTO prices VALUES (123456789.00);     -- ERROR:  numeric field overflow
```

Too many decimals get rounded. Too many digits in total are refused.

PostgreSQL also has a type literally called `money`. **Don't use it.** Its formatting depends on the computer's language settings, and it's a well-known source of bugs. `numeric` does the job properly.

### Booleans

`boolean` holds `true`, `false`, or NULL (unknown). PostgreSQL is relaxed about how you write them:

```sql
SELECT true, 'yes'::boolean, 'no'::boolean, '1'::boolean, 'off'::boolean;
```

```
 bool | bool | bool | bool | bool
------+------+------+------+------
 t    | t    | f    | t    | f
```

`t`, `f`, `yes`, `no`, `on`, `off`, `1`, `0`, `y`, `n` are all accepted as input. But it's stored as a proper true/false and shown as `t`/`f`. Write `true` and `false` in your own SQL; save the aliases for reading other people's.

A boolean column can be used directly as a condition: `WHERE is_done` and `WHERE NOT is_done`, as you saw in chapter 08's exercises.

### Dates and times

| Type | Holds | Example | Use for |
|---|---|---|---|
| `date` | A calendar day | `'2026-09-30'` | Birthdays, due dates, publication dates |
| `time` | A time of day, no date | `'14:30'` | Opening hours. Rare. |
| `timestamp` | Date and time, **no time zone** | `'2026-09-30 14:30'` | Avoid for events. See below. |
| `timestamptz` | Date and time, **with time zone** | `'2026-09-30 14:30+05:45'` | **When something happened**: created, updated, logged in |
| `interval` | A length of time | `'3 days'`, `'2 hours 30 minutes'` | Durations |

**Always write dates as `YYYY-MM-DD`.** `'2026-09-30'`. No exceptions. `'30/09/2026'` and `'09/30/2026'` mean different things in different countries, and PostgreSQL may guess wrong.

**`timestamp` vs `timestamptz`.** This one matters. `timestamptz` (the `tz` is for time zone) stores an exact **moment**, the same instant for everyone on Earth, and shows it to you in your computer's time zone:

```sql
SELECT now();
```

```
              now
-------------------------------
 2026-09-30 14:30:12.48211+05:45
```

That `+05:45` is Nepal time. Someone running the same query in London would see the same moment as `08:45:12+01`. Plain `timestamp` drops the zone, so `'2026-09-30 14:30'` is just some 2:30pm, somewhere. When your React app has users in two countries, that's a bug.

**Rule: for "when did this happen", use `timestamptz`.** For calendar dates with no time, use `date`.

### Date maths

Dates and times are numbers underneath, so you can do arithmetic:

```sql
SELECT current_date;                              -- today
SELECT current_date + 30;                         -- 30 days from today
SELECT date '2026-12-25' - current_date;          -- days until Christmas, an integer
SELECT now() + interval '2 hours';                -- two hours from now
SELECT now() - interval '3 days';                 -- three days ago
SELECT date '2026-10-01' - date '2026-09-01';     -- 30
```

- `date + integer` gives a date.
- `date - date` gives an integer (days).
- `timestamptz + interval` gives a timestamptz.
- `timestamptz - timestamptz` gives an interval.

Intervals read like English: `interval '1 year'`, `interval '90 minutes'`, `interval '1 month 2 weeks'`.

`current_date` and `now()` are the two you'll use most. `now()` is the moment the current statement started, as a `timestamptz`.

### Casting: changing one type into another

Sometimes you have a value of one type and need another. That's a **cast**, and PostgreSQL has a short syntax for it: two colons.

```sql
SELECT '42'::integer + 8;          -- 50    text to number
SELECT 42::text || ' items';       -- 42 items    number to text
SELECT '2026-09-30'::date + 1;     -- 2026-10-01
SELECT 7::numeric / 2;             -- 3.5000000000000000
```

That last one is the answer to the integer division problem: cast one side to `numeric` and the division becomes decimal. (Chapter 24 shows `round()` to tidy up all those zeros.)

The long form is `CAST('42' AS integer)`. It means the same thing and works in every database. The `::` form is PostgreSQL's, and it's what you'll see most.

A cast that can't work fails loudly:

```sql
SELECT 'hello'::integer;
```

```
ERROR:  invalid input syntax for type integer: "hello"
```

### Types you'll meet later

Just so the names aren't strange when you see them:

- `uuid`: a long random id like `a3f1...-...`, an alternative to numbered ids. [Chapter 14](../14-primary-keys/notes.md) mentions it.
- `serial`: an older way to write an auto-numbered column. Also chapter 14.
- `jsonb`: stores a whole JavaScript-style object in one cell. [Chapter 37](../37-json-and-arrays/notes.md).
- `text[]`: an array (list) in one cell, which is sometimes acceptable despite chapter 02's rule. Also chapter 37.

### Choosing a type: the short guide

| You're storing | Use |
|---|---|
| Names, emails, addresses, descriptions | `text` |
| Counts, quantities, years, ratings | `integer` |
| Ids on a table that might get enormous | `bigint` |
| Money, prices, percentages | `numeric(10, 2)` or wider |
| Scientific measurements, coordinates | `double precision` |
| Yes/no | `boolean` |
| A calendar date | `date` |
| The moment something happened | `timestamptz` |
| A duration | `interval` |
| A phone number, postcode, product code | `text` (see mistakes below) |

## Common mistakes

**1. `double precision` or `real` for money**

Cents go missing. Always `numeric`.

**2. Numbers that aren't really numbers**

A phone number like `01-4412345` or `+977 98...` isn't something you add or divide. Store it as `text`. Same for postcodes (`'0800'` loses its zero as an integer), and product codes. If you'd never do maths on it, it's text.

**3. Dates as text**

`'30/09/2026'` in a `text` column can't be sorted, compared, or have 30 days added. Use `date`, and write `YYYY-MM-DD`.

**4. `timestamp` when you meant `timestamptz`**

Works fine until your first user in another time zone. Use `timestamptz` for events.

**5. Booleans as text**

`status text` holding `'yes'`, `'Yes'`, `'Y'`, `'true'`. Use `boolean`.

**6. Forgetting integer division**

`total_pages / days` in a query gives a whole number and nobody notices for a month. Cast one side: `total_pages::numeric / days`.

## Quick recap

- **Text:** `text`, nearly always. `varchar(n)` only for real limits.
- **Whole numbers:** `integer` by default, `bigint` for huge counts. `7 / 2` is `3`.
- **Decimals:** `numeric(p, s)` is exact, use it for **money**. `double precision` is approximate, for measurements.
- **Dates:** `date` for days, `timestamptz` for moments. Always `YYYY-MM-DD`. Dates can be added and subtracted.
- **Casting:** `value::type` changes the type. `x::numeric / y` fixes integer division.
- Phone numbers, postcodes and codes are `text`, because you never do maths on them.

---

**Next:** try the [exercises](exercises.md), then move on to [13 Constraints](../13-constraints/notes.md).
