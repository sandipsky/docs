# 04 Your First Database

## What is it?

One PostgreSQL server can hold many **databases**. Each one is a separate, walled-off collection of tables. In this chapter you create your own database called `practice`, connect to it, and learn your way around psql.

## Why does it matter?

Right now you're connected to the `postgres` database, which is a built-in one that PostgreSQL uses for its own housekeeping. You *could* practice there, but it's like doing your homework on the kitchen table where everyone eats. Better to have your own room.

You'll also learn the handful of psql commands that you'll use every single day: list the databases, connect to one, look around, get help, quit. Knowing these makes everything else faster.

## Real-world example

Think of the server as an **apartment building**:

| Apartment building | PostgreSQL |
|---|---|
| The building | The server |
| One apartment | One database |
| The rooms and furniture inside | The tables and data |
| Walking into a different apartment | Connecting to a different database |

Apartments don't share furniture. A table in one database is invisible from another. That's useful: your practice database can't mess up a real one.

## How it works

### Creating a database

Open psql (SQL Shell) and connect with the defaults. At the `postgres=#` prompt, type:

```sql
CREATE DATABASE practice;
```

PostgreSQL answers:

```
CREATE DATABASE
```

That's it. PostgreSQL repeats the command name back when a command succeeds and has nothing else to say. It looks like an echo, but it means "done".

### Listing databases: `\l`

Type `\l` (that's a backslash and a lowercase L) and press Enter:

```
                                List of databases
   Name    |  Owner   | Encoding | ... 
-----------+----------+----------+-----
 postgres  | postgres | UTF8     | ...
 practice  | postgres | UTF8     | ...
 template0 | postgres | UTF8     | ...
 template1 | postgres | UTF8     | ...
(4 rows)
```

Your `practice` database is there. The others:

- `postgres`: the default database you've been connected to.
- `template0` and `template1`: blueprints PostgreSQL copies when you create a new database. Leave them alone.

The real output has more columns. Don't worry about them.

### Two kinds of commands

You've now seen both kinds of thing you can type in psql, and it's important to tell them apart:

| | SQL statements | psql commands |
|---|---|---|
| Example | `CREATE DATABASE practice;` | `\l` |
| Start with | A word like `SELECT`, `CREATE` | A backslash `\` |
| End with | A semicolon `;` | Nothing, just press Enter |
| Who understands it | The PostgreSQL server | Only psql |
| Case | Doesn't matter | **Matters**: `\l` and `\L` are different |

SQL is the real language, and it works everywhere: psql, pgAdmin, your future apps. The backslash commands are psql's own shortcuts for common tasks. They're called **meta-commands**, and pgAdmin doesn't understand them. It has buttons instead.

### Connecting to a database: `\c`

You created `practice`, but you're still inside `postgres`. Look at the prompt. To move:

```
\c practice
```

```
You are now connected to database "practice" as user "postgres".
practice=#
```

The prompt changed to `practice=#`. From now on, everything you type happens inside `practice`. **Always glance at the prompt before you create or delete anything.** It tells you where you are.

### Reading the prompt

The prompt is packed with information:

```
practice=#
│       ││
│       │└── # means you're a superuser (the all-powerful postgres account)
│       └─── = means "ready for a new statement"
└─────────── the database you're connected to
```

When the second-to-last character isn't `=`, psql is waiting for you to finish something:

| Prompt | What psql is waiting for |
|---|---|
| `practice=#` | Nothing. Ready. |
| `practice-#` | A semicolon. You started a statement and didn't end it. |
| `practice(#` | A closing bracket `)`. |
| `practice'#` | A closing single quote `'`. |
| `practice"#` | A closing double quote `"`. |

If you get stuck and don't know what it wants, press **Ctrl+C**. That throws away what you typed and gives you a fresh `=#` prompt.

### Getting help

Two commands you'll come back to often:

- `\?` lists every psql meta-command. It's long. Press the **space bar** to page through, and **q** to stop.
- `\h` followed by an SQL command shows its syntax. Try `\h CREATE DATABASE`.

The output of `\h` looks scary at first, full of square brackets and `|` signs. Square brackets mean "optional", and `|` means "or". You'll get used to reading it. And you can always ask Claude instead.

### Quitting: `\q`

`\q` quits psql. Your database and data stay exactly as they were. The server keeps running in the background.

### Deleting a database

Make a throwaway one, then delete it:

```sql
CREATE DATABASE scratch;
DROP DATABASE scratch;
```

```
CREATE DATABASE
DROP DATABASE
```

`DROP` is SQL's word for "delete this whole thing". It's instant and there's no undo, no recycle bin. It asks no questions.

You can't drop the database you're currently connected to:

```sql
DROP DATABASE practice;
```

```
ERROR:  cannot drop the currently open database
```

That's PostgreSQL being careful. Connect somewhere else first (`\c postgres`), then drop.

### Writing SQL that's easy to read

Three habits worth starting now:

**1. Comments.** Anything after two dashes `--` is a note for humans. PostgreSQL ignores it.

```sql
-- This makes a database for the SQL course.
CREATE DATABASE practice;
```

**2. UPPERCASE for SQL words, lowercase for your names.** PostgreSQL doesn't care (`create database practice;` works), but your eyes will thank you.

**3. Several lines are fine.** PostgreSQL only cares about the semicolon. You can spread one statement over many lines:

```sql
CREATE DATABASE
  practice;
```

### Set up your playground

You'll write a lot of SQL in this course, and it's worth saving. Create this folder now, inside your `PostgreSQL` folder:

```
PostgreSQL/
└── playground/
    ├── ch01/        (you may already have these from the earlier exercises)
    ├── ch02/
    └── ch04/
```

For each chapter, save your queries in `.sql` files, like `playground/ch04/ex1.sql`. VS Code understands `.sql` files and colors the SQL words for you.

### Running a `.sql` file: `\i`

Create `playground/ch04/hello.sql` in VS Code with this inside:

```sql
-- My first SQL file
SELECT 'Hello from a file!' AS greeting;
```

Then in psql, run it with `\i` and the full path. **Use forward slashes**, even on Windows:

```
\i C:/Users/YourName/Downloads/Projects/Sandip/docs/PostgreSQL/playground/ch04/hello.sql
```

```
      greeting
--------------------
 Hello from a file!
(1 row)
```

`\i` means "include": run every statement in this file as if I'd typed it. This is how you'll run your exercise files.

**In pgAdmin**, the Query Tool has a folder icon (Open File) that loads a `.sql` file into the editor. Then press F5.

### Connecting straight from a terminal

If you did the optional PATH step in chapter 03, you can skip the SQL Shell questions and connect directly from any terminal:

```
psql -U postgres -d practice
```

`-U` is the user, `-d` is the database. It asks for your password, and you land in `practice=#`.

## Common mistakes

**1. Putting a semicolon on a meta-command**

`\c practice;` sometimes works by luck and sometimes gives strange results. Meta-commands don't take semicolons.

**2. Forgetting the semicolon on SQL, then typing the next command**

```
practice=# CREATE DATABASE scratch
practice-# \l
```

Now `\l` gets tangled up with the unfinished `CREATE`. Press Ctrl+C, and start again with the semicolon.

**3. Working in the wrong database**

You created a table, and it "disappeared". Check the prompt. You're probably in `postgres` when you meant `practice`, or the other way round.

**4. Typing `\L` or `\C`**

Meta-commands are case-sensitive. `\l` lists databases. `\L` does something else. Always lowercase unless told otherwise.

**5. Using backslashes in `\i` paths**

`\i C:\Users\...` confuses psql, because `\` is its special character. Use `C:/Users/...`.

## Quick recap

- One server holds many **databases**, each a walled-off collection of tables. `CREATE DATABASE name;` makes one.
- **SQL statements** end with `;` and work everywhere. **Meta-commands** start with `\`, have no semicolon, and only work in psql.
- `\l` lists databases, `\c name` connects to one, `\q` quits, `\?` and `\h` give help.
- The prompt tells you **where you are** and **what psql is waiting for**. `=#` means ready. **Ctrl+C** escapes a stuck prompt.
- `DROP DATABASE` deletes a database instantly, with no undo.
- Save your work in `playground/chNN/*.sql` and run files with `\i C:/path/with/forward/slashes.sql`.

---

**Next:** try the [exercises](exercises.md), then move on to [05 Your First Table](../05-your-first-table/notes.md).
