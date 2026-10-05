# 43 PostgreSQL in the Cloud

## What is it?

So far your database lives on your laptop. Your deployed React app ([React chapter 40](../../React/40-deploying/notes.md)) lives on the internet, and it can't reach your laptop. A **cloud database** is PostgreSQL running on someone else's servers, reachable from anywhere with the right connection string, and looked after by them: updates, backups, disks, uptime.

You don't install anything. You sign up, click "create database", copy a connection string, and everything you've learned in this course works exactly the same.

## Why does it matter?

Two reasons:

1. **Your apps need it.** A deployed API has to talk to a database that's also deployed. The moment your project leaves your laptop, so must its data.
2. **Someone else does the hard parts.** Chapter 35 told you to back up nightly, keep copies elsewhere, test restores, and think about point-in-time recovery. Chapter 34 mentioned `pg_hba.conf`. A managed service does all of that with checkboxes, and also handles things this course didn't cover: version upgrades, taking over when a machine dies, monitoring, scaling. For one developer or a small team, it's the difference between *running* a database and *using* one.

## Real-world example

Owning a car versus using a taxi service:

| Your laptop's PostgreSQL | Managed cloud PostgreSQL |
|---|---|
| You own the car, service it, insure it, and it sits in your driveway | A fleet someone else maintains, available wherever you are |
| Free, once bought | Pay for what you use (often free for small use) |
| Only you can drive it, from your house | Anyone with the key (connection string) can connect, from anywhere |
| Breaks down: your problem, your weekend | Breaks down: their on-call engineer |

The car (local PostgreSQL) is still right for learning and development. The taxi is for going somewhere.

## How it works

### The providers

An honest note first: this is the part of the course most likely to go out of date, because these companies change their offers often. The names below were accurate when this was written; check current free tiers and prices before choosing.

| Kind | Examples | Good for |
|---|---|---|
| **PostgreSQL specialists** | Neon, Supabase, Crunchy Bridge | Developer-friendly, generous free tiers, quick to start. Neon adds database "branching" (a copy per git branch). Supabase adds login, file storage, and an automatic API on top of plain PostgreSQL. |
| **App platforms with a database add-on** | Railway, Render, Fly.io, Heroku | You deploy your Node API *and* click "add PostgreSQL" in the same place. The simplest full-stack setup. |
| **The big cloud providers** | AWS RDS and Aurora, Google Cloud SQL, Azure Database for PostgreSQL, DigitalOcean | What companies use at scale. More settings, more cost, more to learn. You'll meet these at work. |

For this course and your own projects: a specialist or an app platform. For a job interview: know that RDS exists and what "managed" means.

### What "managed" gives you

Every line here is something you'd otherwise do yourself:

- **Automatic backups**, usually daily, kept for 7 to 35 days.
- **Point-in-time recovery**: restore to any second inside that window (the fancier method chapter 35 mentioned).
- **Updates and security patches** to PostgreSQL itself.
- **High availability**: a standby copy that takes over if the main one fails.
- **Monitoring**: CPU, connections, slow queries, disk space, on a dashboard.
- **Scaling**: more CPU or disk with a slider, often without downtime.
- **Encrypted connections** by default.

What it does **not** give you: good table design, indexes, sensible queries, or least-privilege roles. Those are still yours. Everything in Levels 2 to 4 matters just as much in the cloud.

### Step by step

The flow is the same everywhere; only the buttons differ.

1. **Sign up** and create a project or database. Pick a **region** close to where your API server will run. Every query crosses that distance; a database on another continent adds 100 to 200 ms to every request.

2. **Copy the connection string.** It looks like your local one, with a real hostname and a long random password:

   ```
   postgres://shop_app:Xk9...@ep-cool-name-123456.ap-southeast-1.aws.neon.tech/sales?sslmode=require
   ```

   The new part is **`?sslmode=require`**: the connection is encrypted. Your local connection didn't need it; one that crosses the internet must have it. `pg` understands the parameter.

3. **Connect from psql** to check it works:

   ```
   psql "postgres://shop_app:Xk9...@ep-cool-name.../sales?sslmode=require"
   ```

   Same prompt, same `\dt`, same everything, just a little slower.

4. **Create your structure.** Run your migrations (chapter 41) against it by pointing `DATABASE_URL` at the new string. Or restore a dump from your laptop (chapter 35): `pg_restore -d "postgres://...?sslmode=require" sales.dump`.

5. **Point your app at it.** On the platform that hosts your Node API (Render, Railway, Vercel, wherever), set the **environment variable** `DATABASE_URL` to the connection string. Your code doesn't change at all; it already reads `process.env.DATABASE_URL`. This is why chapter 40 insisted on `.env` instead of a hard-coded string.

6. **Deploy.** Your React app calls your API, your API talks to the cloud database. The full stack is live.

### Secrets

The connection string **is** the password. Rules:

- It lives in the hosting platform's environment variables and in your local `.env`. Nowhere else.
- Never in code, never in git, never in a screenshot, never in a chat message.
- If it leaks, **rotate** it (every provider has a "reset password" button) and update the environment variable.
- Make an app role (chapter 34) and put *its* string in the app. Keep the admin string for yourself, for migrations and psql.

### Connection limits and pooling

A cloud database allows a fixed number of connections at once, often 20 to 100 on small plans. One Node server with a pool of 10 is fine. But **serverless** platforms (Vercel functions, AWS Lambda, Cloudflare Workers) start a fresh copy of your code for every burst of traffic, and each copy makes its own pool. Fifty copies times ten connections is 500, and the database refuses: `too many connections`.

The fix is a **connection pooler** sitting between your app and the database. PgBouncer is the classic; Neon, Supabase, and others run one for you and give you a second, "pooled" connection string. Use the pooled string from serverless code, and the direct string for migrations and psql. (Poolers in their fastest mode don't support everything, which is why migrations use the direct one.)

If you deploy a normal, always-running Node server (Render, Railway, Fly), you don't have this problem: one process, one pool.

### Latency, and why it changes how you query

Locally, a query takes under a millisecond and the network adds nothing. In the cloud, the network adds a few milliseconds per round trip even within the same region. So:

- The **N+1 problem** (chapters 32 and 42) hurts far more: 100 small queries is now 100 × 5 ms = half a second, before any work is done. One join wins by a mile.
- Building JSON **in the database** (chapter 37) instead of assembling it in Node from several queries saves round trips.
- `\timing` in psql against the cloud database shows you the real number your users will feel.

### Costs

Free tiers typically give you a small database (a few hundred MB to a few GB), limited compute, and sometimes they pause after inactivity (the first query after a pause takes a second or two to wake up). That's fine for learning, portfolios, and small apps. Paid plans start at a few dollars a month. The things that cost money: storage, compute hours, data transferred out, and backups kept longer. **Set a billing alert** before you give anyone a card number.

### Moving data around

Everything from chapter 35 works across the internet:

```
pg_dump -Fc -d "postgres://...local.../sales" -f sales.dump
pg_restore -d "postgres://...cloud...?sslmode=require" --no-owner sales.dump
```

That's how you seed a new cloud database from your laptop, move from one provider to another, or pull a copy of production down to debug locally (after scrubbing sensitive columns; `pg_dump --exclude-table-data` helps). The `--no-owner` avoids errors when the cloud server doesn't have a role called `postgres`.

### Who can connect

Managed databases replace `pg_hba.conf` with an **IP allow list** in the dashboard: only connections from these addresses are accepted. Lock it to your API server's address and your own, if the provider supports it. Some providers accept connections from anywhere by default and rely on the password and SSL alone, which is acceptable for a small project and not for a company.

### Checklist before you go live

- [ ] The app connects as a **least-privilege role**, not the admin.
- [ ] The connection string is only in environment variables; `.env` is gitignored.
- [ ] `sslmode=require` on every connection.
- [ ] Migrations run on deploy, before the new code starts.
- [ ] Backups confirmed in the dashboard, and you've done one test restore.
- [ ] Indexes on every foreign key and every filtered or sorted column (chapter 31).
- [ ] The database's region matches your API server's region.
- [ ] The pooled connection string, if you're on serverless.
- [ ] A billing alert set.

## Common mistakes

**1. The admin connection string in the app**

One leak, total loss. App role.

**2. `sslmode` missing**

Some providers refuse the connection; others accept it unencrypted. Always `?sslmode=require`.

**3. Database and API in different regions**

Every query crosses an ocean. Put them together.

**4. Serverless without a pooler**

`too many connections` under load. Use the pooled string.

**5. Assuming "managed" means "designed"**

The provider keeps the server alive. Your schema, indexes, and queries are still yours to get right.

**6. Only ever testing locally**

Local is fast and forgiving. Run your report queries against the cloud database once and look at the timings.

## Quick recap

- A managed cloud database is PostgreSQL run and backed up by someone else, reached through a connection string with a real host and `?sslmode=require`.
- Pick a provider (specialist, app platform, or big cloud), a region near your API, and a free tier to start. Check current offers; they change.
- Your code doesn't change: `DATABASE_URL` becomes an environment variable on the hosting platform.
- Build the structure with migrations or a restored dump. Connect as an app role. Keep the string secret and rotate it if it leaks.
- Serverless needs a pooled connection string. Network latency makes N+1 and chatty code hurt, so join and build JSON in the database.
- Managed means the server is looked after. Design, indexes, roles, and queries are still your job.

---

**Next:** try the [exercises](exercises.md), then move on to the last chapter: [44 Final Project](../44-final-project/notes.md).
