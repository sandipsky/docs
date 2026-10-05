# 03 Installing PostgreSQL

## What is it?

In this chapter you install three things, all in one go:

1. **The PostgreSQL server**: the program that stores your data and runs in the background.
2. **psql**: a client where you *type* commands. It looks like a plain black terminal window.
3. **pgAdmin**: a client where you *click*. It has menus, a tree of databases on the left, and a box to type queries in.

By the end, you'll have run your first SQL statement.

## Why does it matter?

You can't practice on paper forever. From chapter 04 on, every chapter has you typing real SQL and seeing real answers. That needs a real database on your computer.

Why two clients? **psql** is what most developers use day to day. It's fast, it's on every server, and knowing it makes you look like you know what you're doing. **pgAdmin** is friendlier when you want to *look* at things: browse tables, see data in a grid, click through the structure. You'll use psql for most of this course and pgAdmin whenever you want a visual check.

## Real-world example

Installing PostgreSQL is like setting up a new shop:

| Setting up a shop | Installing PostgreSQL |
|---|---|
| Hire a manager who's always there | The server, which runs in the background from now on |
| Give the manager a master key | The `postgres` password you choose during install |
| A phone line to call the manager on | The **port** (5432), the number the server listens on |
| The counter where you speak to staff | psql and pgAdmin |

You'll choose the master key during installation. **Write it down.** More on that below.

## How it works

These steps are for **Windows**, which is what you're using. There's a short note for Mac at the end.

Honest warning: installer screens change a little between versions. If a screen looks slightly different from what's described here, read it and pick the default. The defaults are fine.

### Step 1: Download the installer

1. Go to [postgresql.org/download/windows](https://www.postgresql.org/download/windows/).
2. Click **Download the installer**. This takes you to a page run by a company called EDB, which builds the official Windows installer.
3. Pick the newest version (18 or higher) for **Windows x86-64**, and download it.

The file is a few hundred megabytes. It contains everything: the server, psql, and pgAdmin.

### Step 2: Run the installer

Double-click the downloaded file. Windows may ask if you want to allow it to make changes. Click yes. Then walk through the screens:

| Screen | What to do |
|---|---|
| **Installation Directory** | Leave the default (`C:\Program Files\PostgreSQL\18`). |
| **Select Components** | Keep **PostgreSQL Server**, **pgAdmin 4**, and **Command Line Tools** ticked. **Untick Stack Builder** (it's for extra add-ons you don't need). |
| **Data Directory** | Leave the default. This is where your databases will live. |
| **Password** | Choose a password for the `postgres` user. This is the master key. **Write it down somewhere safe right now.** |
| **Port** | Leave `5432`. |
| **Advanced Options** (Locale) | Leave `[Default locale]`. |
| **Pre Installation Summary** | Click Next. |
| **Ready to Install** | Click Next, and wait a few minutes. |
| **Completing** | If it offers to launch Stack Builder, untick that. Click Finish. |

**About that password.** `postgres` is the name of the built-in administrator account, called a **superuser**. It can do anything. The password you chose is the only way in, and if you forget it, resetting it is fiddly. Save it in your password manager or write it on paper.

For a learning setup on your own laptop, something simple is fine. You're not protecting anything valuable yet.

### Step 3: Meet psql

Open the Start menu and type **SQL Shell**. Open **SQL Shell (psql)**. A black window appears and asks you a few questions. **Press Enter for each one** to accept the default, then type your password:

```
Server [localhost]:            ← Enter
Database [postgres]:           ← Enter
Port [5432]:                   ← Enter
Username [postgres]:           ← Enter
Password for user postgres:    ← type your password (nothing shows while you type), then Enter
```

What those questions mean:

- **Server** `localhost` means "this computer". The server is running right here.
- **Database** `postgres` is a default database that always exists. It's just somewhere to start.
- **Port** `5432` is the number the server listens on.
- **Username** `postgres` is the superuser account.

If it worked, you'll see something like:

```
psql (18.0)
WARNING: Console code page (437) differs from Windows code page (1252)
         8-bit characters might not work correctly. See psql reference
         page "Notes for Windows users" for details.
Type "help" for help.

postgres=#
```

That warning is normal on Windows and you can ignore it. It's about how the terminal shows special characters like é or ñ.

The important part is the last line: `postgres=#`. This is the **prompt**. It's psql saying "I'm connected to the database called `postgres`, and I'm ready. Type something."

### Step 4: Your first SQL

At the prompt, type this exactly, including the semicolon, and press Enter:

```sql
SELECT version();
```

You'll get back something like:

```
                          version
------------------------------------------------------------
 PostgreSQL 18.0 on x86_64-windows, compiled by msvc-19.44.35213, 64-bit
(1 row)
```

You just sent a request to the server, and it answered. That's the whole client-server picture from chapter 01, happening for real.

Try one more:

```sql
SELECT 2 + 2;
```

```
 ?column?
----------
        4
(1 row)
```

The database does maths too. (The `?column?` heading means "you didn't name this column". You'll learn to name it in [chapter 07](../07-reading-data/notes.md).)

Two rules that will save you frustration:

1. **Every SQL statement ends with a semicolon `;`.** If you press Enter without one, psql thinks you're not finished and waits for more. The prompt changes to `postgres-#` (a dash instead of `=`). Just type `;` and press Enter.
2. **Uppercase doesn't matter to PostgreSQL.** `SELECT` and `select` are the same. This course writes SQL words in UPPERCASE and your own names in lowercase, because it's easier to read.

To leave psql, type `\q` and press Enter. To come back, open SQL Shell again.

### Step 5: Meet pgAdmin

Open the Start menu, type **pgAdmin**, and open **pgAdmin 4**. It takes a moment to start and opens in a window (or a browser tab).

1. The first time, it asks you to set a **master password**. This is pgAdmin's *own* password, used to protect the server passwords it saves for you. It doesn't have to match your `postgres` password, but you can use the same one to keep life simple.
2. On the left, you'll see a tree. Expand **Servers**. There's an entry called something like **PostgreSQL 18**. Click it.
3. It asks for the password of the `postgres` user. Type the one you chose during install, tick **Save Password**, and click OK.
4. Expand **PostgreSQL 18 → Databases**. You'll see the `postgres` database.
5. Click `postgres`, then in the top menu choose **Tools → Query Tool**. A text area opens.
6. Type `SELECT version();` and press **F5** (or click the ▶ **Execute** button). The result shows in a grid underneath.

Same server, same answer, different window. That's the point: the clients are just different ways to talk to the same database.

### What's running now?

The PostgreSQL server is now a **Windows service**. It starts when your computer starts and sits quietly in the background, using very little memory. You don't need to start or stop it yourself.

If you're ever curious, open the Start menu, type **Services**, and look for `postgresql-x64-18`. It should say "Running".

### Optional: run psql from any terminal

The SQL Shell shortcut works fine for this course. But if you'd like to type `psql` in any terminal (like the one in VS Code), Windows needs to know where to find it:

1. Open the Start menu, type **environment variables**, and choose **Edit the system environment variables**.
2. Click **Environment Variables...**
3. Under **User variables**, select **Path** and click **Edit**.
4. Click **New** and paste: `C:\Program Files\PostgreSQL\18\bin` (change `18` if your version is different).
5. Click OK on every window. Then **close and reopen** any terminal.

Now `psql -U postgres` in any terminal connects you, after asking for your password. (`-U` means "as this user".)

### If you're on a Mac

The easiest route is [Postgres.app](https://postgresapp.com), which gives you the server and psql. For pgAdmin, download it separately from [pgadmin.org](https://www.pgadmin.org/download/). Everything else in this course is the same.

## Common mistakes

**1. Forgetting the `postgres` password**

The most common problem by far. If you're reading this after forgetting it: the simplest fix is to uninstall PostgreSQL, delete the data folder (`C:\Program Files\PostgreSQL\18\data`), and reinstall. You'll lose your practice databases, which is fine this early. Then write the password down.

**2. Mixing up the two passwords in pgAdmin**

pgAdmin asks for a **master password** (its own) when it opens, and the **`postgres` password** (the server's) when you connect to the server. If you used the same one for both, this never bites you.

**3. Waiting forever after typing a statement**

You forgot the semicolon. Look at the prompt: `postgres-#` means "waiting for more". Type `;` and press Enter.

**4. "Port 5432 is already in use" during install**

Something else is using that number, usually an older PostgreSQL install. Either uninstall the old one first, or let the installer use a different port like `5433`, and remember to type it whenever psql asks for the port.

**5. Panicking about the code page warning**

The `Console code page` warning in psql is harmless. Everything works.

## Quick recap

- One installer gives you the **server**, **psql** (type), and **pgAdmin** (click).
- The `postgres` user is the superuser. Its password is your master key. **Write it down.**
- The server listens on port `5432` and runs in the background as a Windows service.
- In psql, every statement ends with `;`. If the prompt shows `-#`, it's waiting for one.
- `SELECT version();` proves you're connected. `\q` leaves psql.

---

**Next:** try the [exercises](exercises.md), then move on to [04 Your First Database](../04-your-first-database/notes.md).
