# 17 Many-to-Many Relationships

## What is it?

A **many-to-many** relationship is when each row on *both* sides can be linked to many rows on the other. A student takes many courses, and a course has many students. A book has many genres, and a genre has many books.

You can't build this with one foreign key. You build it with a **third table** that sits in the middle and holds the pairs. People call it a **junction table**, a **join table**, or a **linking table**. Same thing.

## Why does it matter?

Chapter 02 gave you a rule: one value per cell, no `'Fantasy, Adventure'`. Chapter 16 gave you one-to-many: put a foreign key on the "many" side. But a book with two genres has no "many side". Both sides are many. Where does the foreign key go?

Nowhere. If you put `genre_id` on `books`, a book gets one genre. If you put `book_id` on `genres`, a genre gets one book. Either way, something is lost.

This comes up constantly: products in orders, tags on posts, actors in films, users with roles, students in courses, friends on a social network. Once you can see the pattern and build the middle table, a whole class of design problems becomes routine.

## Real-world example

A school needs to record who is in which class.

- One page per class, listing its students? Then "which classes is Asha in?" means flipping through every page.
- One page per student, listing their classes? Then "who's in SQL Basics?" means flipping through every student.

Schools solved this long ago with **enrollment slips**: one slip per (student, class) pair. "Asha, SQL Basics." "Asha, Web Design." "Bikram, SQL Basics." The stack of slips answers both questions, and each slip can carry extra facts, like the date enrolled and the grade.

The stack of slips is the junction table.

## How it works

Work in `practice`.

### The two sides

```sql
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS courses;

CREATE TABLE students (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name text NOT NULL
);

CREATE TABLE courses (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title text NOT NULL UNIQUE
);
```

Nothing links them yet. Neither table mentions the other. That's correct.

### The table in the middle

```sql
CREATE TABLE enrollments (
  student_id integer NOT NULL REFERENCES students (id) ON DELETE CASCADE,
  course_id integer NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
  enrolled_on date NOT NULL DEFAULT current_date,
  grade text,
  PRIMARY KEY (student_id, course_id)
);
```

Take it apart:

- **Two foreign keys**, one to each side. Each row is one "slip": this student, this course.
- **`PRIMARY KEY (student_id, course_id)`**: the pair identifies the row. This is the composite key from [chapter 14](../14-primary-keys/notes.md). It means the same student can't be enrolled in the same course twice, while still allowing many courses per student and many students per course.
- **`ON DELETE CASCADE` on both.** If a student leaves, their enrollment slips should go too. A slip without a student is meaningless. This is the one place `CASCADE` is almost always right.
- **`enrolled_on` and `grade`** are facts about the *pair*. Asha's grade in SQL Basics isn't a fact about Asha alone or SQL Basics alone. The junction table is exactly where such facts belong.

### Add data

```sql
INSERT INTO students (name) VALUES ('Asha Rai'), ('Bikram Shrestha'), ('Chandra Gurung');
INSERT INTO courses (title) VALUES ('SQL Basics'), ('Web Design'), ('Maths');

INSERT INTO enrollments (student_id, course_id, grade) VALUES
  (1, 1, 'A'),      -- Asha, SQL Basics
  (1, 2, NULL),     -- Asha, Web Design (no grade yet)
  (2, 1, 'B'),      -- Bikram, SQL Basics
  (3, 1, NULL),     -- Chandra, SQL Basics
  (3, 3, 'A');      -- Chandra, Maths
```

Asha is in two courses. SQL Basics has three students. Both directions, no lists in cells.

### The composite key at work

```sql
INSERT INTO enrollments (student_id, course_id) VALUES (1, 1);
```

```
ERROR:  duplicate key value violates unique constraint "enrollments_pkey"
DETAIL:  Key (student_id, course_id)=(1, 1) already exists.
```

Asha is already in SQL Basics. Refused. And the foreign keys still do their job: `(1, 99)` fails because there's no course 99.

### Following the links

To answer "which courses is Asha in?", you walk from `students` through `enrollments` to `courses`. That's two joins (sneak peek again, full story in [chapter 22](../22-joins/notes.md)):

```sql
SELECT students.name, courses.title, enrollments.grade
FROM enrollments
JOIN students ON students.id = enrollments.student_id
JOIN courses  ON courses.id  = enrollments.course_id
ORDER BY students.name, courses.title;
```

```
      name       |   title    | grade
-----------------+------------+-------
 Asha Rai        | SQL Basics | A
 Asha Rai        | Web Design | [NULL]
 Bikram Shrestha | SQL Basics | B
 Chandra Gurung  | Maths      | A
 Chandra Gurung  | SQL Basics | [NULL]
(5 rows)
```

Read it as: start from the slips, look up each slip's student, look up each slip's course. Add `WHERE students.name = 'Asha Rai'` for just her, or `WHERE courses.title = 'SQL Basics'` for the class list. Same query, two questions.

### Drawing it

```
students            enrollments              courses
──────────          ─────────────────        ──────────
id        ◄─────    student_id (FK)          id
name                course_id  (FK)   ─────► title
                    enrolled_on
                    grade

students ───< enrollments >─── courses
```

The middle table has a fork on **both** ends. When you see that shape, you're looking at a many-to-many.

### An alternative shape: `id` plus `UNIQUE`

Some teams give every table an `id`, even junction tables, and protect the pair with `UNIQUE` instead:

```sql
CREATE TABLE enrollments (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  student_id integer NOT NULL REFERENCES students (id) ON DELETE CASCADE,
  course_id integer NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
  enrolled_on date NOT NULL DEFAULT current_date,
  grade text,
  UNIQUE (student_id, course_id)
);
```

Same protection, and now each enrollment has its own `id`, which is handy if other tables need to point at an enrollment (an attendance record, say), or if your tools expect every table to have an `id` column ([chapter 42](../42-orms/notes.md) will). Both designs are correct. Pick one style for a project and stick to it.

### Second example: products in orders

This one you'll build in the [Level 2 project](../19-project-online-shop-database/notes.md). An order has many products; a product appears in many orders. The slip is an **order item**:

```sql
CREATE TABLE order_items (
  order_id integer NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  product_id integer NOT NULL REFERENCES products (id),
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric(10, 2) NOT NULL,
  PRIMARY KEY (order_id, product_id)
);
```

Two things to notice:

- **`quantity`** is a fact about the pair: how many of *this product* in *this order*. Right where it belongs. The composite key means the same product can't appear twice in one order; you raise the quantity instead.
- **`unit_price`** looks like a copy of `products.price`. It isn't. It's the price the customer *paid*, at the moment of ordering. Prices change; receipts mustn't. This is a **snapshot**, and it's deliberate. [Chapter 18](../18-normalization/notes.md) talks about when copying a value is a mistake and when it's exactly right.

Also notice the `ON DELETE` choices: cascading from `orders` (an item without its order is meaningless), but **not** from `products`. You can't delete a product that's been sold; you mark it inactive.

### Naming the middle table

Two conventions:

- Name it for the real-world thing it records when one exists: `enrollments`, `order_items`, `memberships`, `bookings`.
- Otherwise, join the two table names: `book_genres`, `post_tags`, `user_roles`.

Prefer the first when you can. "An enrollment" is easier to talk about than "a student_course".

### Fixing the book genres, at last

The problem from chapter 02 and the project in chapter 11:

```sql
CREATE TABLE genres (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name text NOT NULL UNIQUE
);

CREATE TABLE book_genres (
  book_id integer NOT NULL REFERENCES books (id) ON DELETE CASCADE,
  genre_id integer NOT NULL REFERENCES genres (id) ON DELETE CASCADE,
  PRIMARY KEY (book_id, genre_id)
);
```

*The Hobbit* gets two rows in `book_genres`: one for Fantasy, one for Adventure. One value per cell, every genre spelled exactly once in `genres`, and "which books are Adventure?" is a simple join. You'll build this in the exercises.

## Common mistakes

**1. Comma-separated lists**

`genres = 'Fantasy, Adventure'`. This whole chapter exists to replace that.

**2. Numbered columns**

`genre_1`, `genre_2`, `genre_3`. The same problem sideways. What about the fourth genre? How do you search all three at once?

**3. The foreign key on one side only**

`course_id` on `students`. Now Asha can take exactly one course. If you catch yourself writing a foreign key and thinking "but they could have several...", you need a junction table.

**4. No composite key or `UNIQUE` on the pair**

Without it, Asha can be enrolled in SQL Basics twice. Every junction table needs `PRIMARY KEY (a, b)` or `UNIQUE (a, b)`.

**5. Pair facts stored on one side**

`grade` on `students`. Which course is that the grade for? Facts about the pair live on the junction table.

**6. Cascading from the wrong side**

`order_items` cascading from `products` means deleting a product silently rewrites every past order. Cascade from the side that *owns* the pair (orders), restrict the other.

## Quick recap

- When both sides can have many, you need a **junction table** holding one row per pair.
- It has **two foreign keys**, one to each side, and a **composite primary key** (or `UNIQUE`) on the pair so no pair repeats.
- Facts about the pair (`grade`, `quantity`, `enrolled_on`) belong on the junction table.
- `ON DELETE CASCADE` is usually right on a junction table, but think about each side separately.
- Follow the links with two joins: from the middle table out to each side.
- `unit_price` on an order item is a deliberate **snapshot**, not a copying mistake.

---

**Next:** try the [exercises](exercises.md), then move on to [18 Normalization](../18-normalization/notes.md).
