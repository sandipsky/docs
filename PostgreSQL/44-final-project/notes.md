# 44 Final Project

## What you'll build

The database for an app of **your own**, from a one-page brief to a deployed system your React front end can talk to. You choose the app. The checklist below makes sure it uses everything in this course.

There's no starter folder this time. The brief is yours to write.

By the end, you'll have a repository with:

- `BRIEF.md`: what the app does, written like the client briefs in chapters 19 and 36,
- `plan.md`: tables, columns, types, rules, relationships, and a diagram,
- `migrations/`: numbered files that build the whole structure from nothing,
- `seed.sql`: realistic sample data, including the awkward cases,
- `queries.sql`: the questions the app will ask, each one checked,
- `views.sql`, `functions.sql`, `roles.sql`: the database-side logic and access,
- `api/`: a Node service that answers at least five routes from the database,
- `backup.md` and `deploy.md`: proof you backed it up, restored it, and put it in the cloud,
- `README.md`: how to run it, and what you learned.

## Choosing your app

Pick something you'd actually use, with at least **five** kinds of thing in it and at least one **many-to-many** relationship. Good candidates from your React course:

| App | Things in it | The many-to-many |
|---|---|---|
| **Task board** (React chapter 37) | users, boards, lists, cards, labels, comments | cards ↔ labels |
| **Online bookstore** (React chapter 29) | books, authors, customers, orders, reviews | books ↔ authors |
| **Recipe finder** (React chapter 21) | recipes, ingredients, users, collections, ratings | recipes ↔ ingredients, collections ↔ recipes |
| **Something of your own** | A habit tracker, a club's membership system, a small clinic's appointments, a library | Find it in your nouns |

Avoid two things: anything that holds real people's private data, and anything so large you can't finish it in a few weeks. A small thing done completely beats a big thing done halfway.

## The checklist

Your project must include each of these, and your `README.md` must say **where** each one is. The chapter numbers tell you where you learned it.

**Design (Level 2)**
- [ ] At least 5 tables, each with a primary key, in third normal form (18)
- [ ] At least one one-to-many and one many-to-many relationship, with foreign keys and deliberate `ON DELETE` choices (16, 17)
- [ ] `NOT NULL`, `UNIQUE`, and `CHECK` constraints wherever the brief implies a rule (13)
- [ ] The right types: `numeric` for money, `timestamptz` for moments, `date` for days (12)
- [ ] At least one deliberate snapshot or stored total, explained in `plan.md` (18)

**Queries (Level 3)**
- [ ] At least 10 queries in `queries.sql` answering real questions from the brief, using joins, grouping, an outer join, a CTE, and a window function (20 to 28)
- [ ] Every "per X" report includes the X that has nothing (23)

**Safety and speed (Level 4)**
- [ ] Every multi-step write wrapped in a transaction, and one place where `FOR UPDATE` matters (30)
- [ ] Indexes on every foreign key and every column your queries filter or sort on, with one `EXPLAIN ANALYZE` before and after saved as evidence (31, 32)
- [ ] At least two views, one of which hides something from someone (33)
- [ ] An app role with least privilege, and a read-only role (34)
- [ ] A backup taken, restored into a copy, and checked (35)

**Real-app features (Level 5)**
- [ ] One `jsonb` or array column where it's genuinely the right choice, and one API response built with `jsonb_build_object` (37)
- [ ] One function and one trigger, each with a comment in `functions.sql` saying why it belongs in the database rather than the app (38)
- [ ] Full-text or trigram search on at least one text field (39)
- [ ] A Node API with parameterized queries, a transaction, and error codes mapped to friendly messages (40)
- [ ] The whole structure built by numbered migrations (41)
- [ ] The database deployed to a cloud provider, with the API connecting as the app role over SSL (43)

**Optional**
- [ ] The same data access written with an ORM, for comparison (42)
- [ ] A React front end calling the API

## Milestones

Work through these in order. Each is a day or two.

### 1. The brief

Write `BRIEF.md` in plain English, as the app's owner would: what it does, who uses it, what must never happen ("a card can't be in two lists at once", "a review needs a purchase"). One page. Include at least three rules that will become constraints and one that will need a trigger.

### 2. The plan

Nouns become tables. Columns, types, which can be NULL, which constraints. Relationships with their `ON DELETE` decisions. The diagram. Normalize, then name your deliberate exceptions. Check it against the Level 2 part of the checklist before writing any SQL.

### 3. Migrations and seed

`001_` creates the first tables, and so on. Run them with your chapter 41 runner into a fresh local database. Then write `seed.sql` with data that includes the awkward cases: the user with nothing, the thing that's never been used, the cancelled one, the item that appears in both a live and a dead parent. Those are what make your queries honest.

### 4. Break it on purpose

`checks.sql`: for every rule in the brief, a statement that tries to break it, and the error PostgreSQL gave. If a rule can't be broken, you haven't enforced it.

### 5. Queries

`queries.sql`, with a comment above each saying which question from the brief it answers. Check each one against the seed data by hand for at least one row.

### 6. Database logic

Views for the shared calculations and for hiding columns. A function for the operation that must be one step. A trigger for the bookkeeping that must never be forgotten. Search on the field people will actually search.

### 7. Protect it

Roles. Indexes, with evidence. A backup, restored, checked.

### 8. The API

Five routes minimum. One with an optional filter. One that writes, in a transaction. One that returns a nested JSON document built by the database. Friendly errors.

### 9. Deploy

Cloud database, migrations run against it, API deployed with `DATABASE_URL` as an environment variable, connecting as the app role. Open a route from your phone.

### 10. Write it up

`README.md`: how to run it locally (three commands), how it's deployed, the checklist with the location of each item, and a section called **"What I'd do differently"**. That last section is the one a future employer will read first.

## How to get unstuck

- **The design feels wrong?** Reread chapter 18's method: "what is this a fact about?"
- **A query gives the wrong number?** Chapter 29's traps: cancelled rows leaking in, zeroes dropped by a join, counting lines instead of orders.
- **Something's slow?** `EXPLAIN ANALYZE` it. Chapter 32.
- **Not sure whether it should be a constraint, a trigger, or app code?** Chapter 38's last section.
- **Stuck for more than an hour?** Ask Claude, with your `plan.md` and the exact error message.

## Common mistakes

**1. Too big**

Fifteen tables and a half-finished API. Five tables, finished, deployed, written up.

**2. Skipping the brief**

Without the rules written down, there's nothing to enforce and nothing to test. The brief is where constraints come from.

**3. Seed data that's too clean**

If every user has orders and every product has sold, your outer joins are never tested. Add the empties.

**4. Hand-edited production**

Everything through migrations, even when it's "just one column".

**5. Admin credentials in the deployed app**

The last checklist item exists for a reason.

**6. No write-up**

The project isn't done until someone else could run it and understand your decisions.

## Quick recap

- Pick a small app you care about, with five tables and a many-to-many.
- Brief, plan, migrations, seed, checks, queries, then views and functions and triggers and search, then roles and indexes and backup, then the API, then deploy, then the README.
- Every item on the checklist, with its location named in the README.
- Finished and deployed beats ambitious and half-done.

---

**Congratulations!** You've reached the end of the PostgreSQL course. 🎉 You started with "what is a database?" and you've ended with a normalized, indexed, access-controlled, backed-up database in the cloud, with your own API in front of it. That's what back-end developers do. Try the [exercises](exercises.md) if you want to push further, then go back to the [roadmap](../README.md) and tick the last box.

**After this:** a Node framework like Express or Fastify will tidy up your API's routing. React Native lets your database power a phone app. And nearly everything here transfers unchanged to MySQL, SQLite, and SQL Server.
