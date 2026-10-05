# 01 What Is a Database?

## What is it?

A **database** is an organized collection of information, stored so that it can be found, changed, and kept safe.

The program that looks after that information is called a **database management system** (people just say "database" for both). PostgreSQL is one of these programs. It runs on your computer (or a server somewhere), guards your data, and answers questions about it.

No setup in this chapter. It's all reading and thinking, so you know *what* you're installing before you install it.

## Why does it matter?

Let's start with something you already know: a spreadsheet.

Imagine a small shop that keeps its orders in a spreadsheet. One row per order: customer name, address, what they bought, the price, the date. For 20 orders, this works fine.

Now imagine the shop grows. Three staff members, a website, 50,000 orders. Problems start piling up:

1. **It gets slow.** Scrolling and searching through 50,000 rows takes ages.
2. **People get in each other's way.** Two staff members open the file at once. Who wins when they both save?
3. **Mistakes slip in.** One row says `Kathmandu`, another `kathmandu`, another `Katmandu`. Someone types `ten` in the price column. Nothing stops them.
4. **The same fact is repeated.** A customer's address is typed out on every order. When they move house, someone has to fix it in 47 places, and they'll miss a few.
5. **Apps can't use it easily.** The website needs to save a new order in a fraction of a second, thousands of times a day, while people are still browsing.
6. **It's fragile.** Delete a column by accident, or lose power halfway through saving, and the data may be gone or broken.

A database is built to solve exactly these six problems. It's fast with millions of rows. It lets many people (and programs) work at the same time. It refuses bad data if you tell it the rules. It stores each fact once and links things together. And it's built so that a crash halfway through never leaves your data half-saved.

Spreadsheets aren't bad. They're great for small, personal, one-person data. But when many people, lots of data, or an app are involved, you want a database.

## Real-world example

Think of the difference between a **pile of books** in a garage and a **library**.

| Library | Database |
|---|---|
| The librarian | PostgreSQL, the program that manages everything |
| You ask the librarian for something | You send a request (a **query**) |
| The librarian's language | **SQL**, the language databases understand |
| The catalog, one card per book | A **table**, one row per item |
| Rules: every book has a shelf, you need a card to borrow | **Constraints**, the rules you give the database |
| You never wander into the back rooms yourself | You never open the database's files directly |

You'll meet every one of these in the coming chapters.

## How it works

### Two parts: the server and you

A database has two sides.

The **server** is a program that starts when your computer starts and waits quietly in the background. It owns some files on your disk, and it's the *only* thing that touches them. You never open those files yourself.

You talk to the server through a **client**: a program that sends your requests and shows you the answers. In this course you'll use two clients: **psql** (you type commands) and **pgAdmin** (you click around in a window). Later, your own programs will be the client.

```
 You, in psql or pgAdmin                PostgreSQL server           Files on disk
 ─────────────────────────              ─────────────────           ─────────────
 "Give me every book                    reads the request,
  written before 1950"      ───────►    finds the answer    ◄────►  books, customers,
                                        in its files                orders...
 "The Hobbit, 1937"         ◄───────    sends it back
```

The word "server" can sound big and scary. Here it just means "the program that serves you answers". In this course, it runs on your own laptop.

### Four things you do with data

Every app, from Instagram to your bank, does the same four things with its data:

| Action | Everyday example | SQL command | Chapter |
|---|---|---|---|
| **Create** (add something new) | Sign up for an account | `INSERT` | [06](../06-adding-data/notes.md) |
| **Read** (look something up) | Open your profile | `SELECT` | [07](../07-reading-data/notes.md) |
| **Update** (change something) | Change your password | `UPDATE` | [10](../10-changing-and-deleting-data/notes.md) |
| **Delete** (remove something) | Delete a post | `DELETE` | [10](../10-changing-and-deleting-data/notes.md) |

Together, these are called **CRUD**. If you can do these four things, you can build the data side of almost any app. Level 1 of this course is mostly about CRUD.

### SQL: the language

**SQL** (Structured Query Language) is how you talk to the database. Here's one line of it:

```sql
SELECT title FROM books WHERE year < 1950;
```

Read it out loud: *select the title, from books, where the year is less than 1950.* SQL was designed to read like English, and mostly it does.

Notice what you **didn't** say: you didn't say *how* to find the books. No "start at the top, check each row, stop at the end". You just described what you wanted, and the database works out the fastest way to get it. That's a big part of why SQL is so pleasant to use.

If you've done the [JavaScript course](../../JavaScript/README.md), you'll notice SQL feels quite different: there are no loops and no variables in a basic query. It's a language for *describing* data, not for giving step-by-step instructions.

### Relational databases

PostgreSQL is a **relational database**. That means two things:

1. Data lives in **tables** (rows and columns, like a spreadsheet sheet). [Chapter 02](../02-tables-rows-and-columns/notes.md) is all about them.
2. Tables can be **related** (linked) to each other: an order belongs to a customer, a customer has many orders. That's [chapter 16](../16-relationships-and-foreign-keys/notes.md).

Other relational databases you'll hear about: MySQL, SQLite, Microsoft SQL Server, Oracle. They all speak SQL, with small differences in dialect, like British and American English. Learn PostgreSQL and you can read all of them.

There are also **non-relational** databases (often called NoSQL), like MongoDB, that organize data differently. Not this course. Relational databases are the most common kind by far, and the best place to start.

### Where you'll meet databases

Everywhere:

- **A social app** stores users, posts, likes, and comments.
- **A bank** stores accounts and every transaction ever made.
- **An online shop** stores products, customers, orders, and reviews.
- **Your own React apps.** When a React app calls an API to fetch data ([React chapter 18](../../React/18-fetching-data/notes.md)), the server on the other end is usually reading from a database like PostgreSQL. This is the "back end" that your front end talks to.

## Common mistakes

**1. Thinking a database is a file you open**

You don't double-click a database like an Excel file. It's a program that's always running. You connect to it and send requests.

**2. Mixing up PostgreSQL and SQL**

SQL is the *language*. PostgreSQL is one *program* that understands the language. Like English and one particular person who speaks English.

**3. Thinking you need to be good at maths or programming**

You don't. What you need is clear thinking about how information is organized: "what things am I storing, and what do I want to know about them?" That's most of the skill.

**4. Thinking spreadsheets are wrong**

They aren't. A spreadsheet is the right tool for a small, personal list. A database is the right tool when many people, lots of data, or an app need to work with it.

## Quick recap

- A database is an organized collection of information plus the program (PostgreSQL) that looks after it.
- It solves the problems spreadsheets have at scale: speed, many users at once, bad data, repeated facts, apps, and safety.
- The **server** runs in the background and owns the data. You talk to it through a **client** like psql or pgAdmin.
- Almost everything you do with data is **CRUD**: create, read, update, delete.
- **SQL** is the language. You describe what you want, and the database works out how to get it.
- PostgreSQL is a **relational** database: data lives in tables, and tables can be linked.

---

**Next:** try the [exercises](exercises.md), then move on to [02 Tables, Rows and Columns](../02-tables-rows-and-columns/notes.md).
