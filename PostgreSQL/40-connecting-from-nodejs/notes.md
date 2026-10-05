# 40 Connecting from Node.js

## What is it?

Until now, *you* have been the client: typing SQL into psql. From this chapter on, **your code** is the client. A Node.js program opens a connection to PostgreSQL, sends SQL, and gets rows back as JavaScript objects.

The library that does this is called **`pg`** (also known as node-postgres). It's small, it's been around for over a decade, and nearly everything else in the Node world (including the ORMs in chapter 42) is built on top of it.

## Why does it matter?

This is where the two halves of your learning meet. Your React apps fetch data from an API ([React chapter 18](../../React/18-fetching-data/notes.md)). That API is a Node program. This chapter is what that program does on the inside: run a query, turn the rows into JSON, send them back.

It's also where the single most dangerous security mistake in web development lives. You'll make it on purpose, watch it work, and then learn the one habit that makes it impossible.

## Real-world example

psql is you walking up to the librarian's desk. A Node program is a **phone line** to the librarian, kept open so your app can ask questions all day without walking over each time:

| Phone | `pg` |
|---|---|
| Dial the number once, keep the line open | A connection |
| Several lines, so many callers don't queue behind one | A **pool** of connections |
| "Find me the book called ___", with the blank read out separately so nothing you say is mistaken for an instruction | A parameterized query (`$1`) |
| Hang up when you're done | `pool.end()` |

## How it works

### Set up a project

Make a folder `PostgreSQL/playground/node-shop/`, open a terminal in it, and run:

```
npm init -y
npm pkg set type=module
npm install pg
npm install -D @types/pg
```

`"type": "module"` lets you use `import` and top-level `await`, as in the JavaScript and TypeScript courses. `@types/pg` gives VS Code autocomplete and type checking for the library.

Create a file called `.env` holding your connection details:

```
DATABASE_URL=postgres://postgres:yourpassword@localhost:5432/sales
```

A **connection string** packs everything into one line: `postgres://` *user* `:` *password* `@` *host* `:` *port* `/` *database*. Node reads `.env` for you with `--env-file`. **Never commit `.env`**: create a `.gitignore` with `.env` and `node_modules` in it right now, before you forget.

### Your first query

`list-products.ts`:

```ts
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const result = await pool.query("SELECT id, name, price FROM products ORDER BY id LIMIT 3");

console.log(result.rowCount, "rows");
console.log(result.rows);

await pool.end();
```

Run it:

```
node --env-file=.env list-products.ts
```

```
3 rows
[
  { id: 1, name: 'Notebook', price: '3.90' },
  { id: 2, name: 'Pen', price: '1.20' },
  { id: 3, name: 'Sticky notes', price: '2.75' }
]
```

Each row is a plain object with one property per column. That's the whole idea: SQL in, objects out.

Three things about this file:

- **`Pool`.** A pool keeps a few connections open and hands one out per query. Opening a connection takes time (tens of milliseconds), so you open a handful once and reuse them. Make **one pool per program**, at the top, and share it.
- **`pool.query(sql)`** returns a promise, so you `await` it. The result has `rows` (the data) and `rowCount` (how many).
- **`pool.end()`** closes the connections so the program can exit. In a script, call it at the end. In a server, don't: the pool lives as long as the server does.

Node 24 runs `.ts` files directly (as in the TypeScript course), stripping the types. The import is written `import pg from "pg"` then `const { Pool } = pg`, because `pg` is an older-style package; that's the form its own documentation uses.

### What comes back, and the `numeric` surprise

Look again: `price: '3.90'`. That's a **string**, not a number. Check a few more types:

```ts
const r = await pool.query(
  "SELECT id, ordered_at, status, shipped_at, (SELECT sum(quantity * unit_price) FROM order_items WHERE order_id = o.id) AS total, count(*) OVER () AS total_orders FROM orders o WHERE id = 1",
);
for (const [key, value] of Object.entries(r.rows[0])) {
  console.log(key.padEnd(13), typeof value, value instanceof Date ? "(Date)" : "", JSON.stringify(value));
}
```

```
id            number  1
ordered_at    object (Date) "2026-07-03T04:30:00.000Z"
status        string  "paid"
shipped_at    object (Date) "2026-07-05T03:15:00.000Z"
total         string  "13.00"
total_orders  string  "1"
```

| PostgreSQL type | Becomes | Why |
|---|---|---|
| `integer` | `number` | Fits safely |
| `text` | `string` | |
| `boolean` | `boolean` | |
| `timestamptz`, `date` | `Date` | A JavaScript `Date` (shown in UTC when printed as JSON, hence the `Z`) |
| `numeric` | **`string`** | JavaScript numbers can't hold decimals exactly (chapter 12's `0.1 + 0.2`). `pg` refuses to lose money in the conversion. |
| `bigint`, `count(*)` | **`string`** | Can be bigger than JavaScript's safe integer range |

So money and counts arrive as strings. When you need maths, convert on purpose: `Number(row.total) * 2` gives `26`. When you're sending the value to a browser as JSON, a string is often fine (and safer). Forgetting this causes the classic bug where `'13.00' + '5.00'` gives `'13.005.00'`.

### Parameters, and the attack they prevent

Suppose a search box on your site sends a customer name, and you write:

```ts
const userInput = "' OR 1=1 --";   // what an attacker typed into the box

const unsafeSql = `SELECT name, email FROM customers WHERE name = '${userInput}'`;
const unsafe = await pool.query(unsafeSql);
console.log(unsafe.rowCount);
```

```
6
```

Six rows: **every customer's name and email**, from a search for one name. Look at the SQL that was actually sent:

```sql
SELECT name, email FROM customers WHERE name = '' OR 1=1 --'
```

The attacker's quote closed your string early, `OR 1=1` made the condition always true, and `--` turned the rest into a comment. This is **SQL injection**, and it has leaked more data than any other bug in the history of the web. With a different input it can delete tables or change passwords. It works against any app that glues user input into SQL text.

The fix is to never glue. Use a **placeholder**, and pass the value separately:

```ts
const safe = await pool.query("SELECT name, email FROM customers WHERE name = $1", [userInput]);
console.log(safe.rowCount);
```

```
0
```

Zero rows: no customer is literally named `' OR 1=1 --`. The value travelled to PostgreSQL *as a value*, separately from the SQL, so it could never be mistaken for SQL. `$1`, `$2`, `$3` match the positions in the array:

```ts
await pool.query(
  "SELECT name FROM customers WHERE city = $1 AND joined_on >= $2 ORDER BY name",
  ["Kathmandu", "2026-01-01"],
);
// rows: Asha Rai, Dipesh Thapa
```

**The rule has no exceptions: user input goes in the array, never in the string.** Not for numbers, not for "trusted" input, not "just this once". Every library you'll use (including ORMs) does this for you underneath. Your only job is to not go around it.

### Errors

A failing query throws. Catch it where you can do something useful:

```ts
try {
  await pool.query("INSERT INTO categories (name) VALUES ('Bags')");
} catch (err) {
  const e = err as { code: string; detail?: string };
  console.log(e.code, e.detail);
}
```

```
23505 Key (name)=(Bags) already exists.
```

PostgreSQL errors carry a five-character **code**. The ones you'll handle most:

| Code | Meaning | Typical response |
|---|---|---|
| `23505` | Unique violation | "That email is already registered" |
| `23503` | Foreign key violation | "That customer doesn't exist" |
| `23514` | Check violation | "Quantity must be positive" |
| `23502` | Not-null violation | "Name is required" |
| `42P01` | Table doesn't exist | A bug or a missing migration |

Switch on `e.code` to turn database refusals into friendly messages. For anything else: log it on the server and return a generic "something went wrong". Never send the raw message to a user, because it can contain table names or data.

### Transactions in code

A transaction must run on **one** connection. So you borrow one from the pool, use it for every statement, and give it back:

```ts
async function placeOrder(customerId: number, lines: { productId: number; quantity: number }[]) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const order = await client.query<{ id: number }>(
      "INSERT INTO orders (customer_id, ordered_at, status) VALUES ($1, now(), 'pending') RETURNING id",
      [customerId],
    );
    const orderId = order.rows[0].id;

    for (const line of lines) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
         VALUES ($1, $2, $3, (SELECT price FROM products WHERE id = $2))`,
        [orderId, line.productId, line.quantity],
      );
      await client.query("UPDATE products SET stock = stock - $1 WHERE id = $2", [line.quantity, line.productId]);
    }

    await client.query("COMMIT");
    return orderId;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
```

The shape to memorize: `connect`, then `try { BEGIN ... COMMIT } catch { ROLLBACK; rethrow } finally { release }`. Every statement goes through `client`, not `pool`. The `finally` guarantees the connection goes back to the pool even when something fails. Forget it, and your pool slowly runs dry.

Test it with a good order and a bad one:

```ts
const okId = await placeOrder(5, [{ productId: 2, quantity: 2 }, { productId: 10, quantity: 1 }]);
console.log("Placed order", okId);

try {
  await placeOrder(5, [{ productId: 1, quantity: 1 }, { productId: 7, quantity: 1000 }]);
} catch (err) {
  console.log("Order failed:", (err as Error).message);
}
```

```
Placed order 13
Order failed: new row for relation "products" violates check constraint "products_stock_check"
```

The second order inserted a notebook line, then tried to take 1000 chairs from a stock of 6. The `CHECK` refused, the `catch` rolled back, and the notebook line and the order row vanished with it. Nothing half-done. (Chapter 30 explains why. The `RETURNING id` and the price-lookup subquery are from chapters 06 and 25.) Reload the seed afterwards if you want the dataset back to normal.

### A tiny API

Here's the bridge to your React apps: an HTTP server that answers with JSON straight from the database. No framework, just Node's built-in `http` module. `api.ts`:

```ts
import { createServer } from "node:http";
import pg from "pg";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  res.setHeader("Content-Type", "application/json");

  try {
    // GET /products  or  /products?category=Bags
    if (url.pathname === "/products") {
      const category = url.searchParams.get("category"); // null if not given
      const result = await pool.query(
        `SELECT p.id, p.name, p.price, c.name AS category
         FROM products p JOIN categories c ON c.id = p.category_id
         WHERE p.is_active AND ($1::text IS NULL OR c.name = $1)
         ORDER BY p.name`,
        [category],
      );
      res.end(JSON.stringify(result.rows));
      return;
    }

    // GET /orders/5
    const match = url.pathname.match(/^\/orders\/(\d+)$/);
    if (match) {
      const result = await pool.query(
        `SELECT jsonb_build_object(
           'order_id', o.id,
           'customer', c.name,
           'status', o.status,
           'items', (SELECT jsonb_agg(jsonb_build_object('product', p.name, 'quantity', oi.quantity, 'unit_price', oi.unit_price) ORDER BY p.name)
                     FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE oi.order_id = o.id)
         ) AS doc
         FROM orders o JOIN customers c ON c.id = o.customer_id
         WHERE o.id = $1`,
        [match[1]],
      );
      if (result.rowCount === 0) {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: "Order not found" }));
        return;
      }
      res.end(JSON.stringify(result.rows[0].doc));
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ error: "Not found" }));
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: "Something went wrong" }));
  }
});

server.listen(3000, () => console.log("API listening on http://localhost:3000"));
```

Run it with `node --env-file=.env api.ts`, then open these in your browser:

- `http://localhost:3000/products?category=Bags` gives the two bags as a JSON array.
- `http://localhost:3000/orders/5` gives the nested order document from chapter 37, built by the database and sent as-is.
- `http://localhost:3000/orders/999` gives `{"error":"Order not found"}` with status 404.

A React component can `fetch` any of those URLs today.

Notice: the `category` from the URL goes in as `$1`, never into the string. The `$1::text IS NULL OR c.name = $1` trick makes the filter optional: with no category, the first half is true and every product comes back. The pool is created once and never ended, because the server runs until you stop it (Ctrl+C). Errors are logged on the server and hidden from the client.

Real projects use a framework like Express or Fastify for the routing instead of `if` statements on the path, but the database part is exactly this.

### Habits

1. **One pool, created once.** Not one per request.
2. **Parameters, always.** `$1`, never string concatenation.
3. **Transactions on a `client`**, with `try/catch/finally` and `release()`.
4. **Convert `numeric` and `bigint` on purpose.** They're strings.
5. **Connection string in `.env`**, and `.env` in `.gitignore`.
6. **Never run your app as `postgres`.** Chapter 34: make a `shop_app` role and put *its* details in `DATABASE_URL`.
7. **Map error codes to messages.** Don't leak raw errors to users.

## Common mistakes

**1. String concatenation**

The injection. Even once. Even for a number.

**2. Running a transaction through `pool.query`**

Each call may land on a different connection, so `BEGIN` on one and `UPDATE` on another means no transaction at all. Use `pool.connect()` and one `client`.

**3. Forgetting `client.release()`**

After about ten leaked connections (the pool's default size), every query waits forever. Put it in `finally`.

**4. Treating `numeric` as a number**

`'13.00' + '5.00'`. Convert with `Number()`, or keep it as a string for display.

**5. Ending the pool in a server**

`pool.end()` is for scripts. A server keeps the pool open.

**6. Committing `.env`**

Your password is now on GitHub, and deleting the commit later doesn't remove it from history. Make the `.gitignore` first, then the `.env` file.

## Quick recap

- `npm install pg`, then `import pg from "pg"; const { Pool } = pg;`. One `Pool` per program, built from `DATABASE_URL` in `.env`.
- `const result = await pool.query(sql, [params]);` then use `result.rows` and `result.rowCount`.
- `$1, $2` placeholders with a values array are the only defence against SQL injection, and the rule has no exceptions.
- `numeric`, `bigint` and `count(*)` come back as **strings**; dates come back as `Date`.
- Transactions: `pool.connect()`, `BEGIN`/`COMMIT` on that `client`, `ROLLBACK` in `catch`, `release()` in `finally`.
- Errors have codes (`23505` unique, `23503` foreign key, `23514` check). Turn them into friendly messages.
- A `node:http` server plus `pool.query` plus `JSON.stringify(rows)` is a working API for your React app.

---

**Next:** try the [exercises](exercises.md), then move on to [41 Migrations](../41-migrations/notes.md).
