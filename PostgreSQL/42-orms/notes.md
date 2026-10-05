# 42 ORMs

## What is it?

An **ORM** (object-relational mapper) is a library that lets you talk to the database in your programming language instead of in SQL strings. You describe your tables once in TypeScript, and then write things like:

```ts
const cheap = await db.select().from(products).where(lt(products.price, "5"));
```

and the ORM writes and runs the SQL for you:

```sql
select * from "products" where "products"."price" < $1
```

The two you'll meet most in the Node world are **Drizzle** and **Prisma**. This chapter shows what they do, what they're good at, and when plain SQL (chapter 40) is the better tool.

## Why does it matter?

Three real benefits:

1. **Types.** With `pg`, `result.rows` is `any`. You can misspell a column and find out at runtime. With an ORM, `products.name` is a known column with a known type, and your editor catches the typo as you type. For a TypeScript developer, this is the big one.
2. **Less boilerplate.** Inserting an object, updating a few fields, building a `WHERE` from optional filters: with SQL strings these mean fiddly string-building. ORMs make them one-liners.
3. **Migrations included.** Both tools compare your TypeScript schema with the real database and generate the migration SQL (chapter 41) for you.

And one real cost, which the whole second half of this chapter is about: **an ORM hides the SQL**, and everything you learned in Levels 3 and 4 is about the SQL. Developers who only know the ORM write slow queries without knowing it. You know better. Now you'll learn to use an ORM *and* keep seeing through it.

## Real-world example

A **translator** between you and the librarian.

You can learn the librarian's language (SQL) and speak it yourself. Or you can tell a translator in your own language what you want, and they'll say it to the librarian. The translator is faster for everyday requests and never makes a grammar mistake. But for an unusual request, the translation may be clumsy or slow, and you may not realize unless you listen to what they actually said. A good ORM lets you listen (log the SQL). A good developer does.

## How it works

### Drizzle: SQL-shaped TypeScript

Drizzle's idea is "if you know SQL, you know Drizzle". Install it in your `node-shop` project:

```
npm install drizzle-orm
```

(It uses the `pg` driver you already have.)

**Describe your tables** in `schema.ts`. This mirrors `\d` for each table:

```ts
import { pgTable, integer, text, numeric, boolean, timestamp, date } from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull().unique(),
});

export const products = pgTable("products", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  categoryId: integer("category_id").notNull().references(() => categories.id),
  name: text("name").notNull(),
  sku: text("sku").notNull().unique(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const customers = pgTable("customers", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  city: text("city").notNull(),
  joinedOn: date("joined_on").notNull(),
});

export const orders = pgTable("orders", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  customerId: integer("customer_id").notNull().references(() => customers.id),
  orderedAt: timestamp("ordered_at", { withTimezone: true }).notNull(),
  status: text("status").notNull().default("pending"),
});
```

Every word here is something you learned in Level 2: identity primary keys (14), `notNull` and `unique` and `default` (13), `references` (16), `numeric(10, 2)` and `timestamp with time zone` (12). The TypeScript names (`categoryId`) can differ from the column names (`category_id`); Drizzle maps between them.

**Connect and query.** `drizzle-demo.ts`:

```ts
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, desc, sql } from "drizzle-orm";
import { products, categories, customers, orders } from "./schema.ts";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

// 1. Select with a where and an order
const cheap = await db
  .select({ name: products.name, price: products.price })
  .from(products)
  .where(sql`${products.price} < 5`)
  .orderBy(products.price);
console.log("cheap:", cheap);

// 2. A join
const bags = await db
  .select({ product: products.name, category: categories.name })
  .from(products)
  .innerJoin(categories, eq(categories.id, products.categoryId))
  .where(eq(categories.name, "Bags"));
console.log("bags:", bags);

// 3. Insert with returning
const inserted = await db
  .insert(categories)
  .values({ name: "Books" })
  .returning({ id: categories.id, name: categories.name });
console.log("inserted:", inserted);
await db.delete(categories).where(eq(categories.id, inserted[0].id));   // tidy up

// 4. Update
const updated = await db
  .update(products)
  .set({ stock: 119 })
  .where(eq(products.id, 1))
  .returning({ name: products.name, stock: products.stock });
console.log("updated:", updated);
await db.update(products).set({ stock: 120 }).where(eq(products.id, 1));

// 5. Group by, with a raw SQL fragment for the aggregate
const perCity = await db
  .select({ city: customers.city, customers: sql<number>`count(*)` })
  .from(customers)
  .groupBy(customers.city)
  .orderBy(customers.city);
console.log("per city:", perCity);

// 6. The latest order
const latest = await db.select().from(orders).orderBy(desc(orders.orderedAt)).limit(1);
console.log("latest order id:", latest[0].id);

// 7. See the SQL Drizzle would send
const q = db.select({ name: products.name }).from(products).where(eq(products.isActive, true));
console.log("generated SQL:", q.toSQL().sql);

await pool.end();
```

```
cheap: [
  { name: 'Pen', price: '1.20' },
  { name: 'Whiteboard marker', price: '1.80' },
  { name: 'Sticky notes', price: '2.75' },
  { name: 'Notebook', price: '3.90' }
]
bags: [
  { product: 'Backpack', category: 'Bags' },
  { product: 'Laptop sleeve', category: 'Bags' }
]
inserted: [ { id: 7, name: 'Books' } ]
updated: [ { name: 'Notebook', stock: 119 } ]
per city: [
  { city: 'Kathmandu', customers: '2' },
  { city: 'Lalitpur', customers: '2' },
  { city: 'Pokhara', customers: '2' }
]
latest order id: 12
generated SQL: select "name" from "products" where "products"."is_active" = $1
```

Read it against the SQL you know: `select ... from ... where ... orderBy` is `SELECT ... FROM ... WHERE ... ORDER BY`. `innerJoin(table, eq(a, b))` is `JOIN table ON a = b`. `insert(...).values(...).returning(...)` is `INSERT ... VALUES ... RETURNING`. Nothing is hidden. The last line proves it: `toSQL()` shows exactly what will be sent, and it's parameterized (`$1`), so injection is impossible by construction.

Two things to notice from chapter 40 that haven't changed: `price` is still a **string** (it's `numeric`), and `count(*)` is still a string. The ORM uses the same driver underneath, so the same conversions apply.

The `sql` tag (`sql\`${products.price} < 5\``) is Drizzle's escape hatch: any SQL fragment, with the column reference and parameters handled safely. You'll use it for aggregates, window functions, `date_trunc`, and anything else Drizzle doesn't have a helper for. That's a feature, not a workaround: the ORM gets out of the way when you need it to.

**Migrations with Drizzle Kit.** `npm install -D drizzle-kit`, a small config file pointing at `schema.ts` and `DATABASE_URL`, and then `npx drizzle-kit generate` compares your schema file with the database and writes a numbered SQL migration into a folder, exactly like the ones from chapter 41, which `npx drizzle-kit migrate` applies. You change `schema.ts`, generate, read the SQL it produced (always read it), commit, deploy. The tool's docs have the config details; they're short.

### Prisma: a schema language and a generated client

Prisma takes a different route. You describe tables in its own language, in `prisma/schema.prisma`:

```prisma
model Category {
  id       Int       @id @default(autoincrement())
  name     String    @unique
  products Product[]
}

model Product {
  id         Int      @id @default(autoincrement())
  name       String
  sku        String   @unique
  price      Decimal  @db.Decimal(10, 2)
  stock      Int      @default(0)
  isActive   Boolean  @default(true) @map("is_active")
  category   Category @relation(fields: [categoryId], references: [id])
  categoryId Int      @map("category_id")

  @@map("products")
}
```

Then `npx prisma migrate dev` writes and applies the migration, and `npx prisma generate` builds a **client** with a method for every model:

```ts
const cheap = await prisma.product.findMany({
  where: { price: { lt: 5 } },
  orderBy: { price: "asc" },
  select: { name: true, price: true },
});

const bags = await prisma.product.findMany({
  where: { category: { name: "Bags" } },
  include: { category: true },         // the join, expressed as "include the related row"
});

const order = await prisma.order.findUnique({
  where: { id: 5 },
  include: { customer: true, items: { include: { product: true } } },   // nested relations
});
```

Prisma reads less like SQL and more like describing the shape of the object you want back. `include` fetches related rows and nests them, which is lovely for the "order with its items with their products" case. For a one-off `GROUP BY` with a window function, you'll reach for `prisma.$queryRaw` and write SQL.

Honest note: Prisma's setup (how the client is generated, where it's imported from, whether a driver adapter is needed) has changed noticeably between its major versions. The model syntax and the query style above are stable; for the exact install and generate commands, follow the current "Getting started with PostgreSQL" guide on Prisma's site rather than any blog post.

### Drizzle or Prisma?

| | Drizzle | Prisma |
|---|---|---|
| Schema written in | TypeScript | Prisma's own language |
| Queries look like | SQL | Object shapes (`where`, `include`, `select`) |
| Joins | Explicit `innerJoin`, like SQL | Implicit via `include` (and a relational query API that also nests) |
| When SQL doesn't fit | `sql\`...\`` fragments anywhere | `$queryRaw` for whole queries |
| Generated SQL | One query, visible via `toSQL()` | Can be several queries per `include`; log to see |
| Learning curve for you | Small, since you know SQL | Different mental model, very good docs |
| Feels best for | People who think in SQL and want types | People who think in objects and want nesting for free |

Both are good. Both are widely used. If you've done this course, Drizzle will feel like SQL with autocomplete, which is a nice place to be. Prisma is worth knowing because many teams use it. Try both in the exercises and pick the one that makes you *more* aware of the database, not less.

### Seeing through the ORM

This is the part that matters more than which library you choose.

**Turn on query logging.** Drizzle: `drizzle(pool, { logger: true })`. Prisma: `new PrismaClient({ log: ["query"] })`. Now every query the ORM sends is printed. Leave it on in development, always.

**Watch for N+1.** The most common ORM disaster (chapter 32). Code that looks innocent:

```ts
const allOrders = await db.select().from(orders);
for (const o of allOrders) {
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, o.id));   // one query per order
}
```

sends 1 + 12 queries on our data and 1 + 10,000 in production. With logging on, you'll see the flood. The fix is one join (or one `IN (...)`), as it always was. Prisma's `include` does the right thing *for you* in most cases, which is its great strength; Drizzle makes you write the join, which means you'll notice.

**Know when to drop to SQL.** Reports with `GROUP BY`, `HAVING`, window functions, CTEs, `date_trunc`, full-text search: these are what Level 3 taught you, and ORMs are clumsy at most of them. The right move is a `sql` fragment or a raw query, or a **view** (chapter 33) that the ORM reads like a table. Nobody will be impressed by a 40-line ORM expression that replaces a 6-line CTE.

**Still design the database.** ORMs generate migrations from your schema file, but they don't choose indexes for foreign keys (chapter 31), decide `ON DELETE` behaviour (16), write `CHECK` constraints that compare columns (13), or normalize (18). Those are still yours, in the schema file or in hand-written migrations alongside the generated ones.

**Still use a least-privilege role.** The ORM connects with whatever `DATABASE_URL` you give it. Chapter 34 still applies.

### The shape of a real project

Most production Node projects end up like this:

- An ORM for the everyday work: `findMany`, `insert`, `update`, simple joins, with full types.
- Hand-written SQL (through the ORM's escape hatch, or `pg` directly) for reports, searches, bulk operations, and anything performance-sensitive.
- Views and functions in the database for logic that belongs there (chapters 33 and 38).
- The ORM's migration tool for structure changes, with the generated SQL **read before it's run**.
- Query logging on in development, and `EXPLAIN ANALYZE` (chapter 32) on anything slow.

That mix is what "knows the database *and* the ORM" looks like, and it's rarer and more valuable than either alone.

## Common mistakes

**1. Learning the ORM instead of SQL**

Then every performance problem is a mystery. You've done it the right way round.

**2. Never looking at the generated SQL**

Turn on logging. Read `toSQL()`. If you can't explain what the ORM sent, you don't know what your code does.

**3. N+1 in a loop**

A query inside a `for` over rows. Join instead.

**4. Forcing a report through the ORM**

Forty lines of nested objects to avoid a CTE. Use `sql`, `$queryRaw`, or a view.

**5. Treating the schema file as the whole design**

Indexes on foreign keys, `ON DELETE` choices, check constraints, roles: still your job.

**6. Trusting generated migrations blindly**

A rename can be generated as drop-column-plus-add-column, which destroys the data. Read every generated migration before running it.

## Quick recap

- An ORM lets you query in TypeScript with types; underneath it's `pg` and parameterized SQL.
- **Drizzle** is SQL-shaped: `select().from().where().orderBy()`, explicit joins, a `sql` tag for anything else, `toSQL()` to see the output.
- **Prisma** is object-shaped: a schema language, a generated client, `include` for nested relations, `$queryRaw` for SQL.
- Both generate migrations from your schema. Read the SQL they produce.
- `numeric` and `count(*)` are still strings. The driver hasn't changed.
- Turn on query logging, watch for N+1, drop to SQL for reports, and keep designing the database yourself.

---

**Next:** try the [exercises](exercises.md), then move on to [43 PostgreSQL in the Cloud](../43-postgresql-in-the-cloud/notes.md).
