# 18 Normalization: Exercises

**How to do these:**

- Exercises 1, 2 and 4 are on paper (or in `playground/ch18/answers.md`). Exercises 3 and 5 end in real `CREATE TABLE` statements in `.sql` files.
- Draw tables as Markdown tables or ASCII, whichever is faster.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your answers.

---

## Exercise 1 (Easy): Name the anomaly

A company keeps this `employees` table:

| id | name | department | department_phone | manager_name |
|---|---|---|---|---|
| 1 | Asha | Engineering | 01-5551000 | Dev Shrestha |
| 2 | Bikram | Engineering | 01-5551000 | Dev Shrestha |
| 3 | Chandra | Sales | 01-5552000 | Maya Rai |
| 4 | Dipesh | Engineering | 01-5551001 | Dev Shrestha |

1. Something's already gone wrong in the data. Find it.
2. Describe one **update anomaly**, one **insert anomaly**, and one **delete anomaly** this table will suffer. Be specific: "if X happens, then Y goes wrong".
3. Which rule (1, 2, or 3) is being broken? Which columns are facts about something other than the employee?

<details>
<summary>Hint</summary>

Ask "what is this a fact about?" for `department_phone` and `manager_name`. Neither is a fact about Asha.

</details>

---

## Exercise 2 (Easy): Rule 1

Fix this table so it obeys rule 1 (one value per cell, no repeating groups). Show the resulting table(s):

| student | phone_numbers | course_1 | course_2 | course_3 |
|---|---|---|---|---|
| Asha | 9841000001, 9841000002 | Maths | Art | |
| Bikram | 9841000003 | Maths | | |

You'll need more than one new table. Say which rows each one holds.

<details>
<summary>Hint</summary>

Phones: a student has many, a phone belongs to one student. That's one-to-many (chapter 16). Courses: a student takes many, a course has many students. That's many-to-many (chapter 17).

</details>

---

## Exercise 3 (Medium): Normalize an invoice sheet

A freelancer tracks work in one spreadsheet:

| invoice_no | invoice_date | client_name | client_email | client_address | service | hours | hourly_rate | line_total | invoice_total | paid |
|---|---|---|---|---|---|---|---|---|---|---|
| 101 | 2026-09-01 | Himal Tech | hi@himal.example | Lazimpat, Kathmandu | Web design | 10 | 2000 | 20000 | 35000 | yes |
| 101 | 2026-09-01 | Himal Tech | hi@himal.example | Lazimpat, Kathmandu | Hosting setup | 5 | 3000 | 15000 | 35000 | yes |
| 102 | 2026-09-15 | Everest Cafe | owner@everest.example | Thamel, Kathmandu | Logo | 4 | 2500 | 10000 | 10000 | no |

1. Follow the method: for each column, write what it's a fact about.
2. Design the tables. Decide which of `hourly_rate`, `line_total`, and `invoice_total` to **store**, which to treat as a **snapshot**, and which to **calculate**. Justify each in one sentence.
3. Write the `CREATE TABLE` statements in `playground/ch18/ex3.sql`, with primary keys, foreign keys, and sensible constraints, and run them in `practice`.

<details>
<summary>Hint</summary>

`hourly_rate` on a line is probably a snapshot: the freelancer's rate may rise next year, but this invoice was at this rate. `line_total` is hours × rate, so calculate it. `invoice_total` is the sum of lines, so calculate it too, unless you decide an issued invoice must be frozen, which is also defensible.

</details>

---

## Exercise 4 (Medium): Duplication or snapshot?

For each situation, decide: is the copied value a **duplication mistake** (remove it, use a foreign key) or a **deliberate snapshot** (keep it)? One sentence each, using the test from the notes.

1. `orders.customer_email`, copied from `customers.email` when the order is placed, "so we can email the receipt".
2. `orders.shipping_address`, copied from the customer's address when the order is placed.
3. `order_items.product_name`, copied from `products.name`.
4. `employees.department_name`, copied from `departments.name`.
5. `payslips.salary`, copied from `employees.salary` on the day the payslip is generated.
6. `posts.author_username`, copied from `users.username`.

<details>
<summary>Hint</summary>

Number 3 is the interesting one. If a product is renamed, should old receipts show the new name or the old one? There's a case either way. Pick one and say why. Number 1 is usually a mistake (you want the customer's *current* email), unless you have a rule that receipts go to the address used at the time.

</details>

---

## Exercise 5 (Challenge): A school timetable

A school's timetable is a spreadsheet with one row per lesson:

| day | period | class | subject | teacher | teacher_email | room | room_capacity |
|---|---|---|---|---|---|---|---|
| Mon | 1 | 7A | Maths | R. Thapa | rthapa@school.example | 101 | 30 |
| Mon | 1 | 7B | Science | S. Karki | skarki@school.example | Lab 1 | 24 |
| Mon | 2 | 7A | Science | S. Karki | skarki@school.example | Lab 1 | 24 |

Design a normalized set of tables, then write `CREATE TABLE` statements in `playground/ch18/ex5.sql` that enforce **all** of these rules with constraints:

- A room can't host two lessons at the same day and period.
- A teacher can't teach two lessons at the same day and period.
- A class can't have two lessons at the same day and period.
- `period` is between 1 and 8. `day` is one of Mon to Fri.

Insert the three lessons above, then prove each of the first three rules by trying to break it.

<details>
<summary>Hint 1</summary>

The `lessons` table is the junction in the middle, with foreign keys to `classes`, `subjects`, `teachers`, and `rooms`, plus `day` and `period`. Each of the three "can't double-book" rules is a `UNIQUE` on a different combination: `(room_id, day, period)`, `(teacher_id, day, period)`, `(class_id, day, period)`. One table can have several `UNIQUE` constraints.

</details>

<details>
<summary>Hint 2</summary>

`room_capacity` is a fact about the room, not the lesson. `teacher_email` is a fact about the teacher. Move both.

</details>
