# 12 Data Types in Depth: Exercises

**How to do these:**

- Work in psql, connected to `practice`. Save each answer in `playground/ch12/ex1.sql`, `ex2.sql`, and so on.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your work.

---

## Exercise 1 (Easy): Predict, then run

**Before** running them, write down what you think each line returns. Then run them and compare.

```sql
SELECT 10 / 4;
SELECT 10 / 4.0;
SELECT 10 % 4;
SELECT 10::numeric / 4;
SELECT '5' + 3;
SELECT '5' || 3;
SELECT 0.1 + 0.2;
SELECT 0.1::double precision + 0.2::double precision;
SELECT date '2026-03-01' - date '2026-02-01';
SELECT date '2026-03-01' - 1;
```

Two of them might surprise you. Write a comment next to each surprise explaining what happened.

<details>
<summary>Hint</summary>

For `'5' + 3`, PostgreSQL sees a quoted value next to a `+` and a number, and works out that `'5'` must be meant as a number. For `'5' || 3`, it sees `||` and knows that means text. Same `'5'`, two different guesses.

</details>

---

## Exercise 2 (Easy): Pick the type

For each piece of information, write the type you'd use and one sentence saying why:

1. A customer's phone number
2. A postcode
3. A birthday
4. An account balance
5. The moment a user signed up
6. Whether a user is an admin
7. A parcel's weight in kilograms, from a scale
8. A product code like `SKU-00421`
9. A blog post's body
10. How many likes a post has

<details>
<summary>Hint</summary>

Ask two questions for each: "would I ever do maths on this?" and "does it need to be exact?"

</details>

---

## Exercise 3 (Medium): Watch `numeric` work

```sql
DROP TABLE IF EXISTS measurements;
CREATE TABLE measurements (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  exact_value numeric(6, 2),
  approx_value double precision
);
```

1. Insert a row with `1234.567` in **both** columns. Select it back. What did each column store?
2. Insert a row with `12345.67` in both. What happens, and why does only one column complain?
3. Insert `0.1` in both columns. Then run a query that multiplies each column by `3`. Compare the two answers.

Write a comment explaining, in your own words, when you'd choose each type.

<details>
<summary>Hint</summary>

`numeric(6, 2)` has room for 6 digits in total, 2 of them after the point. Count the digits in `12345.67`.

</details>

---

## Exercise 4 (Medium): Date arithmetic

Write one `SELECT` for each, using `current_date` or `now()` so the answers stay correct tomorrow:

1. The date 100 days from today.
2. How many days until the next New Year's Day (1 January 2027).
3. The date and time exactly 6 hours ago.
4. How old, in days, someone born on `2000-01-01` is today.
5. The date 3 months from today. (Use an `interval`.)

<details>
<summary>Hint</summary>

Number 5: `current_date + interval '3 months'` gives you a `timestamp`, not a `date`. Cast it back with `::date` if you want just the day.

</details>

---

## Exercise 5 (Challenge): Flight times

Create a `flights` table with `flight_number text`, `departs_at timestamptz`, `arrives_at timestamptz`.

Insert this flight from Kathmandu (time zone `+05:45`) to Dubai (time zone `+04:00`):

- Departs `2026-10-01 08:00` Kathmandu time.
- Arrives `2026-10-01 10:30` Dubai time.

Write each time with its own offset, like `'2026-10-01 08:00+05:45'`.

1. Select both columns. PostgreSQL shows them in **your** time zone. Are the numbers what you typed? Why or why not?
2. Write a query showing the flight number and how long the flight took (`arrives_at - departs_at`). If you did it right, the answer is 4 hours 15 minutes, even though the clock times are only 2.5 hours apart.
3. Now redo it with `timestamp` (no tz) columns, inserting `'2026-10-01 08:00'` and `'2026-10-01 10:30'`. What duration do you get, and why is it wrong?

<details>
<summary>Hint</summary>

`timestamptz` stores one exact moment and knows that 08:00 in Kathmandu is 02:15 in London and 06:15 in Dubai. Plain `timestamp` doesn't know where the clock was, so it just subtracts the numbers.

</details>
