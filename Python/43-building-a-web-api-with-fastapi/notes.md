# 43 Building a Web API with FastAPI

## What is it?

A **web API** is a program that waits for requests over the internet and answers them, usually with JSON. In [chapter 40](../40-working-with-apis/notes.md), you were the one sending requests to other people's APIs. In this chapter, you write the API: the program on the other end that receives the request and decides what to send back.

**FastAPI** is a popular Python **framework** for building web APIs. A framework is a big toolkit that does the boring, repeated parts of a job for you, so you only write the parts that are special to your program. With FastAPI, you write ordinary Python functions, and FastAPI turns each one into an address that other programs can call. A complete, working web API is just six lines long, as you'll see in a moment.

## Why does it matter?

Think about the React apps from the [React course](../../React/README.md). Everything in a React app runs inside each visitor's browser. That's great for buttons and pages, but a browser can't do three important jobs:

1. **Share data between people.** If Maya adds a book to the shop on her laptop, Leo can't see it, because it only lives in Maya's browser. The data has to live somewhere everyone can reach.
2. **Keep secrets.** Anyone can open the browser's developer tools and read every line of a React app's code. A password for a database or a secret key for a payment service can never go there.
3. **Store data safely.** A browser can be closed, cleared or lost. Important data needs a home that stays put.

The answer is a **backend**: a program that runs on a server, keeps the data and the secrets, and answers requests from the app. (The React app is called the **frontend**.) The backend's "front door" is a web API, and that's what you'll build here.

You could build one with nothing but Python's standard library, but you'd spend days on details: reading raw requests, turning JSON into Python and back, checking every value, writing error messages. FastAPI does all of that for you. It checks incoming data using the type hints you already write ([chapter 25](../25-type-hints/notes.md)), and it even writes a documentation page for your API automatically.

## Real-world example

Remember the restaurant from chapter 40? You were the customer, ordering through a waiter. Now walk through the swinging doors into the kitchen. This time, **you run the kitchen**.

| The restaurant kitchen | Your FastAPI app |
|---|---|
| The menu: every dish you're willing to make | Your **endpoints**: every address and method your API answers, like `GET /books` |
| A customer's order slip | A **request**, with details in the address or in a JSON body |
| Checking the slip before cooking ("you can't order minus two pizzas") | FastAPI checking the data against your type hints, before your function even runs |
| The chef who cooks one kind of dish | One Python function |
| The plate that goes back out | The **response**: JSON, plus a status code |
| "Sorry, we're out of the salmon" | An error response, like `404 Not Found` |
| A printed menu that updates itself whenever the chef adds a dish | The free `/docs` page FastAPI writes for you |

An **endpoint** is one address plus one method. `GET /books` (list the books) and `POST /books` (add a book) share an address, but they're two different endpoints, like "soup of the day" and "soup to take away" being two lines on the menu.

## How it works

### Installing FastAPI

FastAPI is a package on PyPI, so it goes into a virtual environment, like every package since [chapter 23](../23-pip-and-virtual-environments/notes.md). Make a folder for this chapter's practice, for example `bookshop`, open a terminal in it, and run:

```
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install "fastapi[standard]"
```

(That's the PowerShell way to activate. In Command Prompt, use `.venv\Scripts\activate.bat`. On a Mac or Linux, use `source .venv/bin/activate`.)

The `[standard]` part asks pip for FastAPI **plus its recommended extras**. The most important extras are:

- **Uvicorn** (say "you-vee-corn"): the **web server**. It's the program that actually listens for requests coming in over the network and passes them to your FastAPI code. FastAPI decides what to answer; Uvicorn does the delivering.
- **The `fastapi` command**, which starts Uvicorn for you with sensible settings.
- **Pydantic**, the package FastAPI uses to check data. (Plain `fastapi` installs this too.)

Keep the quotes around `"fastapi[standard]"`. Some terminals, like the Mac's, treat square brackets as a special pattern and refuse to run the command without them.

This chapter was written with FastAPI 0.143, Pydantic 2.14 and Uvicorn 0.54. FastAPI changes quickly, so if you have a newer version, small details of the output might look different.

> **Watch out:** On Windows, the install can fail with a long error ending in something like `OSError: [Errno 2] No such file or directory`, followed by a hint that mentions "Windows Long Path support". Windows has an old limit of 260 characters for a file's full path, and some of FastAPI's extras have very deep folders. If your project folder's path is already long, the files inside `.venv` go over the limit. The easy fix is to move your project to a folder with a short path, like `C:\code\bookshop`, delete `.venv`, and try again. (The other fix is to switch on long paths in Windows, which needs an administrator. The link in pip's hint explains how.)

### Your first API

Save this as `main.py` in the `bookshop` folder:

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/")
def home() -> dict[str, str]:
    return {"message": "Hello from the kitchen!"}
```

Line by line:

| Line | What it does |
|---|---|
| `app = FastAPI()` | Makes your application: one object that holds every endpoint. |
| `@app.get("/")` | A **decorator** ([chapter 32](../32-decorators/notes.md)). It tells `app`: "when a `GET` request arrives for the path `/`, call the function below." |
| `def home() -> dict[str, str]:` | An ordinary function, with ordinary type hints. Its name doesn't matter to the outside world. |
| `return {...}` | Whatever you return, FastAPI turns into JSON and sends back. |

The **path** is the part of the address after the server's name: in `http://127.0.0.1:8000/books/3`, the path is `/books/3`. A path of `/` means "the front page".

There are decorators for each HTTP method from chapter 40: `@app.get`, `@app.post`, `@app.put` and `@app.delete`.

### Running it: `fastapi dev`

With the virtual environment active, start the server:

```
fastapi dev main.py
```

You'll see something like this (it's colourful in a real terminal):

```
 ⚡️ Starting FastAPI in development mode

 🐍 Using import string: main:app

 🌐 Server started at http://127.0.0.1:8000
    Documentation at http://127.0.0.1:8000/docs

  Logs:

INFO:     Will watch for changes in these directories: ['C:\\code\\bookshop']
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12380] using WatchFiles
INFO:     Started server process [17260]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

Notice the program **doesn't finish**. A server's whole job is to sit and wait for requests, like a shop that stays open. The terminal is busy now, so open a second terminal (click the **+** in VS Code's terminal panel) if you need to type other commands.

Open <http://127.0.0.1:8000> in your browser. You'll see:

```
{"message":"Hello from the kitchen!"}
```

And in the server's terminal, a new line appears for every request:

```
INFO:     127.0.0.1:59037 - "GET / HTTP/1.1" 200 OK
```

That's the server's log: who asked (`127.0.0.1`), what they asked for (`GET /`), and the status code that went back (`200 OK`).

A few words from the address:

- **`127.0.0.1`** is a special address that always means "this computer". You'll also see it called **localhost**. Nobody else on the internet can reach it, so it's a safe place to practise.
- **`8000`** is the **port**, like an apartment number for programs on your computer. You met ports in [React chapter 01](../../React/01-getting-started/notes.md), where Vite used `5173`. If 8000 is busy, choose another with `fastapi dev main.py --port 8001`.

**Auto-reload.** Change the message in `main.py` to `"Hello from the kitchen, Sandip!"` and save. The terminal shows:

```
WARNING:  WatchFiles detected changes in 'main.py'. Reloading...
```

and a moment later, the startup lines again. Refresh the browser, and the new message is there. That's what `dev` (development mode) gives you: the server restarts itself every time you save a `.py` file in the folder.

To stop the server, click in its terminal and press `Ctrl+C`.

> **Tip:** `fastapi run main.py` starts the server *without* auto-reload. That's the version for when your app runs for real on a server, which is a job for [chapter 53](../53-deploying/notes.md).

### The free documentation: `/docs`

With the server running, open <http://127.0.0.1:8000/docs>. FastAPI has written an interactive documentation page for your API, called **Swagger UI**. It lists every endpoint as a coloured bar, with the method on the left (`GET` in blue, `POST` in green, `PUT` in orange, `DELETE` in red). Click a bar to open it, click **Try it out**, fill in any values, and click **Execute**. The page sends a real request to your server and shows you the response.

You'll use `/docs` all the time to try your API without writing any code. There's a second, read-only style of documentation at <http://127.0.0.1:8000/redoc>.

Both pages are built from a description of your API that FastAPI makes from your code and type hints, in a standard format called **OpenAPI**. You can see the raw description at <http://127.0.0.1:8000/openapi.json>. Other tools can read it too, for example to write the code for calling your API automatically.

### Path parameters: values inside the address

Most endpoints need some information from the caller. The first way to send it is inside the path. In `/books/3`, the `3` says which book. Put a name in curly braces in the path, and add a parameter with the same name to the function:

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/books/{book_id}")
def get_book(book_id: int) -> dict[str, int]:
    return {"book_id": book_id}
```

Visit <http://127.0.0.1:8000/books/3>:

```
{"book_id":3}
```

Look closely: `3`, not `"3"`. Everything in an address arrives as text, but the hint `book_id: int` told FastAPI to turn it into an `int` before calling your function. Now try <http://127.0.0.1:8000/books/abc>:

```
{
  "detail": [
    {
      "type": "int_parsing",
      "loc": ["path", "book_id"],
      "msg": "Input should be a valid integer, unable to parse string as an integer",
      "input": "abc"
    }
  ]
}
```

(It arrives on one line. It's spread out here so it's easier to read.)

Your function never ran. FastAPI checked the value against the hint, saw that `abc` can't be an `int`, and answered for you with status code **422 Unprocessable Content**, which means "I understood your request, but the data in it is wrong". The error says exactly what went wrong (`msg`), where (`loc`: the `book_id` part of the path), and what was sent (`input`). Remember from chapter 25 that Python normally ignores hints when it runs your code? FastAPI is different: it reads the hints and enforces them.

### Query parameters: options after the `?`

The second way to send information is a **query string**, the `?name=value&name=value` part you met in chapter 40. Query strings are for options: filters, search words, how many results to show.

In FastAPI, **any function parameter that isn't in the path becomes a query parameter**. Give it a default value, and it's optional:

```python
from fastapi import FastAPI

app = FastAPI()

BOOKS = [
    {"title": "Dune", "author": "Frank Herbert"},
    {"title": "Emma", "author": "Jane Austen"},
    {"title": "Persuasion", "author": "Jane Austen"},
    {"title": "Matilda", "author": "Roald Dahl"},
]


@app.get("/books")
def list_books(author: str | None = None, limit: int = 10) -> list[dict[str, str]]:
    found = BOOKS
    if author is not None:
        found = [book for book in BOOKS if book["author"] == author]
    return found[:limit]


@app.get("/search")
def search(q: str) -> list[dict[str, str]]:
    return [book for book in BOOKS if q.lower() in book["title"].lower()]
```

| Address | Response |
|---|---|
| `/books` | All four books |
| `/books?limit=2` | `[{"title":"Dune","author":"Frank Herbert"},{"title":"Emma","author":"Jane Austen"}]` |
| `/books?author=Jane Austen` | `[{"title":"Emma","author":"Jane Austen"},{"title":"Persuasion","author":"Jane Austen"}]` |
| `/books?author=Jane Austen&limit=1` | `[{"title":"Emma","author":"Jane Austen"}]` |
| `/search?q=em` | `[{"title":"Emma","author":"Jane Austen"}]` |

You can type the space in `Jane Austen` straight into the browser's address bar. The browser turns it into `%20` for you, and FastAPI turns it back.

- `author: str | None = None` means "an optional piece of text". When it's left out, it's `None` ([chapter 25](../25-type-hints/notes.md)), and the function shows every author.
- `limit: int = 10` is optional too, and `?limit=lots` gets the same kind of 422 error as before.
- `q: str` has **no default**, so it's required. Visit `/search` with no `q`, and FastAPI answers with a 422 and the message `"Field required"`, with `"loc": ["query", "q"]`.

| You want | Write |
|---|---|
| A value that says *which thing* (`/books/3`) | A path parameter: `{book_id}` in the path, plus `book_id: int` |
| A required option (`/search?q=dune`) | A parameter with no default: `q: str` |
| An optional option (`/books?limit=2`) | A parameter with a default: `limit: int = 10`, or `author: str | None = None` |

### Request bodies: Pydantic models

Adding a book needs more than a number or two. It needs a title, an author and a price, all together. That goes in the request's **body** as JSON, the same way you sent JSON with `requests.post(..., json=...)` in chapter 40.

To describe what the body must look like, FastAPI uses **Pydantic**. You write a class that inherits from `BaseModel` ([chapter 28](../28-inheritance/notes.md)), with one hinted field per value. It looks a lot like a dataclass from [chapter 30](../30-dataclasses-and-enums/notes.md):

```python
from pydantic import BaseModel


class BookIn(BaseModel):
    title: str
    author: str
    price_cents: int


book = BookIn(title="Dune", author="Frank Herbert", price_cents=999)
print(book)               # prints: title='Dune' author='Frank Herbert' price_cents=999
print(book.title)         # prints: Dune
print(book.model_dump())  # prints: {'title': 'Dune', 'author': 'Frank Herbert', 'price_cents': 999}
```

(The price is in whole cents, like every amount of money in this course since [chapter 14](../14-project-shopping-cart/notes.md).) `.model_dump()` turns a model into a plain dictionary, like `asdict()` does for a dataclass.

The big difference from a dataclass: **Pydantic checks the values while your program runs**, and converts them when it sensibly can:

```python
cheap = BookIn(title="Emma", author="Jane Austen", price_cents="450")
print(cheap.price_cents + 1)  # prints: 451

BookIn(title="Matilda", author="Roald Dahl", price_cents="cheap")
```

The text `"450"` was turned into the number `450`. But `"cheap"` can't be a number, so the last line stops with an error:

```
pydantic_core._pydantic_core.ValidationError: 1 validation error for BookIn
price_cents
  Input should be a valid integer, unable to parse string as an integer [type=int_parsing, input_value='cheap', input_type=str]
```

(mypy would complain about both of those lines, because they pass a `str` where the hint says `int`. That's fine: they're here on purpose, to show what Pydantic does with bad data at run time.)

A dataclass with the same fields would quietly accept `price_cents="cheap"` and print `Book(title='Matilda', author='Roald Dahl', price_cents='cheap')`, and you'd only find the problem later, when some sum crashed. For data arriving from strangers over the internet, you want Pydantic's checks.

| | `@dataclass` ([chapter 30](../30-dataclasses-and-enums/notes.md)) | Pydantic `BaseModel` |
|---|---|---|
| Writes `__init__` and `__repr__` for you | Yes | Yes |
| Checks the types while the program runs | No | Yes |
| Converts `"450"` into `450` | No | Yes |
| Turns into a dictionary | `asdict(book)` | `book.model_dump()` |
| Extra rules like "must be more than 0" | You write `__post_init__` | `Field(gt=0)` (next section) |
| Comes with Python | Yes | No, it's a package (installed with FastAPI) |

Now use the model in an endpoint. A parameter whose hint is a Pydantic model means "read this from the JSON body":

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class BookIn(BaseModel):
    title: str
    author: str
    price_cents: int


@app.post("/books")
def add_book(book: BookIn) -> BookIn:
    print(f"Adding {book.title} by {book.author}")
    return book
```

A browser's address bar can only send `GET` requests, so try this one from `/docs`: open `POST /books`, click **Try it out**, change the example JSON to `{"title": "Matilda", "author": "Roald Dahl", "price_cents": 799}`, and click **Execute**. Under **Responses**, you'll see the code `200` and the same book coming back. (You'll send requests like this from a script in a moment.)

By the time `add_book` runs, `book` is a real `BookIn` object, already checked. You use `book.title` with a dot, and VS Code can suggest the field names as you type. And the `print()`? Its output appears in the **server's** terminal, not in the response. The response only contains what you `return`.

Send a body with a missing author and a silly price, and the function never runs:

```
{"detail":[{"type":"missing","loc":["body","author"],"msg":"Field required","input":{"title":"Matilda","price_cents":"cheap"}},{"type":"int_parsing","loc":["body","price_cents"],"msg":"Input should be a valid integer, unable to parse string as an integer","input":"cheap"}]}
```

Notice that Pydantic reports **every** problem at once, not just the first one. That's kind to whoever is calling your API: they can fix everything in one go.

### Extra rules with `Field`

Type hints say "this must be an `int`". But a price of `0` or `-500` is an `int` too, and it's still nonsense. `Field` adds rules on top of the type:

```python
from pydantic import BaseModel, Field


class BookIn(BaseModel):
    title: str = Field(min_length=1)
    author: str = Field(min_length=1)
    price_cents: int = Field(gt=0)
```

| Rule | Means |
|---|---|
| `gt=0` | **g**reater **t**han 0 |
| `ge=1` | **g**reater than or **e**qual to 1 |
| `lt=100`, `le=100` | less than 100, less than or equal to 100 |
| `min_length=1` | text with at least 1 character (so not empty) |
| `max_length=200` | text with at most 200 characters |

Send `{"title": "", "author": "Roald Dahl", "price_cents": 0}`, and you get a 422 with two problems:

```
{"detail":[{"type":"string_too_short","loc":["body","title"],"msg":"String should have at least 1 character","input":"","ctx":{"min_length":1}},{"type":"greater_than","loc":["body","price_cents"],"msg":"Input should be greater than 0","input":0,"ctx":{"gt":0}}]}
```

Every rule you write here is a check you never have to write by hand inside your functions.

### What goes out: return types and status codes

Your API needs to give each book an ID, so callers can ask for it again later. The caller shouldn't choose the ID (two people might both pick `5`), so the ID is only in what goes **out**, not in what comes **in**. That's two models, and inheritance makes it short:

```python
class BookIn(BaseModel):
    """What a client sends to add or change a book."""

    title: str = Field(min_length=1)
    author: str = Field(min_length=1)
    price_cents: int = Field(gt=0)


class Book(BookIn):
    """A book as the API stores it and sends it back: BookIn plus an id."""

    id: int
```

`Book` has all three fields of `BookIn`, plus `id`. Endpoints take a `BookIn` and return a `Book`.

FastAPI uses your **return type hint** as a description of the response. It checks what your function returns against it, lists it on `/docs`, and **filters out anything extra**. That last part is a safety net. Here, the server keeps a password, but the return type doesn't mention one:

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class UserOut(BaseModel):
    """What the world may see."""

    name: str


class User(UserOut):
    """What the server keeps: everything in UserOut, plus a secret."""

    password: str


users = {1: User(name="Maya", password="tiger123")}


@app.get("/users/{user_id}")
def get_user(user_id: int) -> UserOut:
    return users[user_id]  # a full User, password and all
```

`/users/1` answers `{"name":"Maya"}`. The password never leaves the server, because the return type said only `name` goes out.

> **Tip:** In older code and in parts of FastAPI's documentation, you'll see the same idea written as `@app.get("/users/{user_id}", response_model=UserOut)`. It does the same job as the return type hint.

**Status codes.** Every successful response so far came back as `200 OK`. But chapter 40's table had a more precise code for "I made something new": `201 Created`. And for a delete, there's nothing to send back at all, so the right answer is `204 No Content`. Set the code in the decorator:

```python
@app.post("/books", status_code=201)
def add_book(book_in: BookIn) -> Book:
    ...


@app.delete("/books/{book_id}", status_code=204)
def delete_book(book_id: int) -> None:
    ...
```

(The `...` stands for the function's body, which you'll see in full soon.) A function that returns nothing, with `-> None`, sends back an empty body, which is exactly what 204 means.

### When things go wrong: `HTTPException`

What should `GET /books/42` do when there's no book 42? Not crash, and not pretend everything is fine. It should answer `404 Not Found`, with a message. That's what `HTTPException` is for:

```python
from fastapi import HTTPException


def find_book(book_id: int) -> Book:
    """Return the book with this id, or stop with a 404 error."""
    if book_id not in books:
        raise HTTPException(status_code=404, detail=f"Book {book_id} not found")
    return books[book_id]
```

You `raise` it, like any exception from [chapter 18](../18-error-handling/notes.md). It stops the function straight away, travels up (even out of a helper function like this one), and FastAPI catches it and turns it into a response:

```
{"detail":"Book 42 not found"}
```

with the status code `404`. You never write the JSON yourself.

### Putting it together: a books API

Here's a complete API for a small bookshop. It can **c**reate, **r**ead, **u**pdate and **d**elete books, the four basic jobs of almost every API, known together as **CRUD**. Each job matches an HTTP method:

| CRUD | Method and path | What it does | Success code |
|---|---|---|---|
| Create | `POST /books` | Add a book | 201 |
| Read | `GET /books` | List the books (optionally `?author=...`) | 200 |
| Read | `GET /books/{book_id}` | One book (404 if it's not there) | 200 |
| Update | `PUT /books/{book_id}` | Replace a book's details | 200 |
| Delete | `DELETE /books/{book_id}` | Remove a book | 204 |

For now, the books live in a dictionary in memory, from ID to `Book`. (That's a problem you'll see in Common mistakes. A real database comes in [chapter 46](../46-project-expense-tracker-api/notes.md).) Replace `main.py` with this:

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI(title="Bookshop API")


class BookIn(BaseModel):
    """What a client sends to add or change a book."""

    title: str = Field(min_length=1)
    author: str = Field(min_length=1)
    price_cents: int = Field(gt=0)


class Book(BookIn):
    """A book as the API stores it and sends it back: BookIn plus an id."""

    id: int


def sample_books() -> dict[int, Book]:
    """Two books to start with, so there's something to look at."""
    return {
        1: Book(id=1, title="Dune", author="Frank Herbert", price_cents=999),
        2: Book(id=2, title="Emma", author="Jane Austen", price_cents=450),
    }


# The "database" for now: a dictionary in memory, from id to Book.
books: dict[int, Book] = sample_books()


def find_book(book_id: int) -> Book:
    """Return the book with this id, or stop with a 404 error."""
    if book_id not in books:
        raise HTTPException(status_code=404, detail=f"Book {book_id} not found")
    return books[book_id]


@app.get("/books")
def list_books(author: str | None = None) -> list[Book]:
    found = list(books.values())
    if author is not None:
        found = [book for book in found if book.author.lower() == author.lower()]
    return found


@app.get("/books/{book_id}")
def get_book(book_id: int) -> Book:
    return find_book(book_id)


@app.post("/books", status_code=201)
def add_book(book_in: BookIn) -> Book:
    new_id = max(books, default=0) + 1  # biggest id so far, plus one
    book = Book(id=new_id, **book_in.model_dump())
    books[new_id] = book
    return book


@app.put("/books/{book_id}")
def update_book(book_id: int, book_in: BookIn) -> Book:
    find_book(book_id)  # stops with a 404 if there's no such book
    book = Book(id=book_id, **book_in.model_dump())
    books[book_id] = book
    return book


@app.delete("/books/{book_id}", status_code=204)
def delete_book(book_id: int) -> None:
    find_book(book_id)
    del books[book_id]
```

Two lines deserve a closer look:

- `max(books, default=0) + 1`: looping over a dictionary gives its keys, so `max(books)` is the biggest ID so far. `default=0` is what `max` gives back when the dictionary is empty, so the very first book gets ID `1`.
- `Book(id=new_id, **book_in.model_dump())`: `model_dump()` gives a dictionary like `{"title": "Matilda", ...}`, and `**` unpacks it into keyword arguments ([chapter 32](../32-decorators/notes.md)). It's a short way to write `Book(id=new_id, title=book_in.title, author=book_in.author, price_cents=book_in.price_cents)`.

`title="Bookshop API"` in `FastAPI(...)` is the heading on the `/docs` page. Open `/docs` now, and you'll see all five endpoints, with `Book` and `BookIn` described at the bottom under **Schemas**. FastAPI even made readable names like "List Books" and "Add Book" from your function names.

In the JSON that comes back, `id` is the last key, because `Book` adds it after `BookIn`'s fields. The order of keys doesn't matter in JSON, so that's fine.

### Calling your API with `requests`

`/docs` is great for poking around. For anything repeated, a script is better. With the server running, save this as `client.py` and run it from your second terminal:

```python
import requests

BASE_URL = "http://127.0.0.1:8000"

# Add a book (POST sends JSON in the request body)
new_book: dict[str, str | int] = {
    "title": "Matilda",
    "author": "Roald Dahl",
    "price_cents": 799,
}
response = requests.post(f"{BASE_URL}/books", json=new_book, timeout=5)
print(response.status_code, response.json())

# List all books
response = requests.get(f"{BASE_URL}/books", timeout=5)
for book in response.json():
    print(f"{book['id']}: {book['title']} by {book['author']}")

# Ask for a book that isn't there
response = requests.get(f"{BASE_URL}/books/42", timeout=5)
print(response.status_code, response.json())

# Delete the book we added
response = requests.delete(f"{BASE_URL}/books/3", timeout=5)
print(response.status_code, repr(response.text))
```

```
201 {'title': 'Matilda', 'author': 'Roald Dahl', 'price_cents': 799, 'id': 3}
1: Dune by Frank Herbert
2: Emma by Jane Austen
3: Matilda by Roald Dahl
404 {'detail': 'Book 42 not found'}
204 ''
```

Everything from chapter 40 works, because to `requests`, your API is just another API on the internet. The 204 really has an empty body: `''`. (The hint on `new_book` tells mypy that the values are strings or ints. Without it, mypy complains about the `json=` argument.) Meanwhile, the server's terminal logs each request:

```
INFO:     127.0.0.1:54983 - "POST /books HTTP/1.1" 201 Created
INFO:     127.0.0.1:54984 - "GET /books HTTP/1.1" 200 OK
INFO:     127.0.0.1:54985 - "GET /books/42 HTTP/1.1" 404 Not Found
INFO:     127.0.0.1:54986 - "DELETE /books/3 HTTP/1.1" 204 No Content
```

### Calling it from React, and CORS

Now the reason this chapter exists: a React app talking to your API. In [React chapter 18](../../React/18-fetching-data/notes.md), you fetched recipes from someone else's server. Fetching from your own is the same pattern, with your own address. Inside the effect from that chapter (with its loading and error state, and the `ignore` flag), the fetching part becomes:

```tsx
type Book = {
  id: number;
  title: string;
  author: string;
  price_cents: number;
};

async function loadBooks() {
  try {
    const response = await fetch("http://127.0.0.1:8000/books");
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    const data: Book[] = await response.json();
    setBooks(data);
  } catch (err) {
    setError(err instanceof Error ? err.message : "Something went wrong");
  }
}
```

and the component shows each one with `books.map((book) => <li key={book.id}>{book.title}</li>)`.

The `Book` type on the React side matches the `Book` model on the Python side, field for field. Adding a book is a `POST` with a JSON body ([JavaScript chapter 33](../../JavaScript/33-fetch-and-apis/notes.md)):

```tsx
const response = await fetch("http://127.0.0.1:8000/books", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title: "Matilda", author: "Roald Dahl", price_cents: 799 }),
});
```

But run the React app with `npm run dev`, and in Chrome or Edge your error state shows "Failed to fetch". The browser's console (`F12`, then **Console**) explains:

```
Access to fetch at 'http://127.0.0.1:8000/books' from origin 'http://localhost:5173' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

This is **CORS** (Cross-Origin Resource Sharing), a safety rule built into every browser. An **origin** is the start of an address: the scheme, the host and the port, like `http://localhost:5173`. Your React page comes from one origin and your API lives at another (`http://127.0.0.1:8000`), so the browser asks: "did this API agree to share its answers with pages from `localhost:5173`?" Unless the API says yes in a response header called `Access-Control-Allow-Origin`, the browser hides the answer from the page.

Why? Imagine you're logged in to your bank in one tab, and a dodgy website in another tab quietly calls the bank's API. Without CORS, that website could read your account details. With CORS, the browser only lets a page read another site's answers when that site has said "yes, I trust pages from there".

Think of the browser as a bouncer at a private party. Your API hands the bouncer a guest list. A page whose origin is on the list gets in, and everyone else is turned away at the door. The list is yours to write, with `CORSMiddleware`. Add these lines to `main.py`, just below `app = FastAPI(...)`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # your React app (Vite's address)
    allow_methods=["*"],  # allow GET, POST, PUT, DELETE...
    allow_headers=["*"],  # allow headers like Content-Type
)
```

(Put the `import` line at the top with the others.) A **middleware** is code that sits between the server and your endpoints and sees every request and response pass by. This one adds the header `Access-Control-Allow-Origin: http://localhost:5173` to the answers for requests that come from your React app. Save, and the React app shows the books.

For a `POST` with JSON, the browser is extra careful. Before the real request, it sends a quick "may I?" request with the method `OPTIONS`, called a **preflight**. You'll see both in the server's log:

```
INFO:     127.0.0.1:62121 - "OPTIONS /books HTTP/1.1" 200 OK
INFO:     127.0.0.1:62121 - "POST /books HTTP/1.1" 201 Created
```

`CORSMiddleware` answers the preflight for you.

> **Watch out:** The origin must match exactly, letter for letter. `http://localhost:5173` and `http://127.0.0.1:5173` point at the same place, but to a browser they're two different origins. Use whichever address you really open the React app at. And resist `allow_origins=["*"]` ("anyone may read my answers"): it's fine for a quick experiment, but it switches off the protection for real apps.

### Testing your API with `TestClient`

Clicking through `/docs` after every change gets old fast. You can test an API with pytest ([chapter 36](../36-testing-with-pytest/notes.md)), using FastAPI's **`TestClient`**. It pretends to be a client: you call `client.get(...)` and `client.post(...)` like `requests`, but it talks to your `app` object directly. No server needs to be running.

Install pytest, plus `httpx2`, the package `TestClient` uses to send its pretend requests:

```
python -m pip install pytest httpx2
```

Save this as `test_main.py`, next to `main.py`:

```python
import pytest
from fastapi.testclient import TestClient

import main


@pytest.fixture
def client() -> TestClient:
    """A test client, with the books reset to the two samples before each test."""
    main.books.clear()
    main.books.update(main.sample_books())
    return TestClient(main.app)


def test_list_books(client: TestClient) -> None:
    response = client.get("/books")
    assert response.status_code == 200
    titles = [book["title"] for book in response.json()]
    assert titles == ["Dune", "Emma"]


def test_get_missing_book(client: TestClient) -> None:
    response = client.get("/books/42")
    assert response.status_code == 404
    assert response.json() == {"detail": "Book 42 not found"}


def test_add_book(client: TestClient) -> None:
    new_book = {"title": "Matilda", "author": "Roald Dahl", "price_cents": 799}
    response = client.post("/books", json=new_book)
    assert response.status_code == 201
    assert response.json() == {**new_book, "id": 3}
    # And it's really there now:
    assert client.get("/books/3").json()["title"] == "Matilda"


def test_price_must_be_positive(client: TestClient) -> None:
    bad_book = {"title": "Matilda", "author": "Roald Dahl", "price_cents": 0}
    response = client.post("/books", json=bad_book)
    assert response.status_code == 422


def test_delete_book(client: TestClient) -> None:
    response = client.delete("/books/1")
    assert response.status_code == 204
    assert client.get("/books/1").status_code == 404
```

The fixture matters. The books live in one dictionary that every test shares, so a test that deletes book 1 would break the next test that expects it. The fixture puts the two sample books back before each test, so the tests don't depend on each other. (`{**new_book, "id": 3}` builds a new dictionary with everything from `new_book`, plus an `id`.)

Run it:

```
python -m pytest -v
```

```
============================= test session starts =============================
platform win32 -- Python 3.13.15, pytest-9.1.1, pluggy-1.6.0
rootdir: C:\code\bookshop
plugins: anyio-4.15.1
collected 5 items

test_main.py::test_list_books PASSED                                     [ 20%]
test_main.py::test_get_missing_book PASSED                               [ 40%]
test_main.py::test_add_book PASSED                                       [ 60%]
test_main.py::test_price_must_be_positive PASSED                         [ 80%]
test_main.py::test_delete_book PASSED                                    [100%]

============================== 5 passed in 2.05s ==============================
```

(The `anyio` plugin came with FastAPI. You can ignore it.) Five checks on a whole web API, in about two seconds, every time you change something.

> **Watch out:** If you skip `httpx2`, the tests still pass, but pytest adds a warning: `StarletteDeprecationWarning: Using httpx with starlette.testclient is deprecated; install httpx2 instead.` **Starlette** is the toolkit FastAPI is built on, and it recently switched its `TestClient` from the older `httpx` package to the newer `httpx2`. Installing `httpx2` makes the warning go away. This is very new (it's how things stand with FastAPI 0.143), so if your version doesn't warn, you don't need to worry about it.

### `async def`: you'll see it everywhere

In FastAPI's documentation and in other people's code, you'll often see endpoints written with `async def`:

```python
@app.get("/")
async def home() -> dict[str, str]:
    return {"message": "Hello from the kitchen!"}
```

That works too, and gives the same response. `async` is a way of doing many slow things at once (like waiting for several websites together), and it's the topic of [chapter 47](../47-async-python/notes.md). Until then, use plain `def`. FastAPI handles plain functions well: it runs each one in a separate helper (called a **thread**), so one slow request doesn't hold up everyone else. The one thing to avoid is the mix: don't call slow, blocking things like `requests.get()` or `time.sleep()` inside an `async def` endpoint, because that *does* make everyone wait.

## Common mistakes

**1. `fastapi` isn't recognized**

```
fastapi dev main.py
```

```
fastapi : The term 'fastapi' is not recognized as the name of a cmdlet, function, script file, or operable program.
```

(PowerShell 7 words it slightly differently.) The `fastapi` command lives inside `.venv`, so the terminal can only find it when the virtual environment is active. Activate it (look for `(.venv)` at the start of the prompt), and try again. This catches everyone in the second terminal they open, because a new terminal starts with nothing activated.

**2. A fixed path after a path parameter**

```python
@app.get("/books/{book_id}")
def get_book(book_id: int) -> dict[str, str]:
    return {"title": TITLES[book_id]}


@app.get("/books/search")
def search_books(q: str) -> list[str]:
    return [title for title in TITLES.values() if q.lower() in title.lower()]
```

Visit `/books/search?q=em`, and instead of search results, you get:

```
{"detail":[{"type":"int_parsing","loc":["path","book_id"],"msg":"Input should be a valid integer, unable to parse string as an integer","input":"search"}]}
```

FastAPI checks the endpoints **in the order you wrote them**, and uses the first one whose path fits. `/books/{book_id}` fits `/books/search`, with `book_id` being the text `"search"`, which isn't an `int`. Fix: put the fixed path (`/books/search`) **above** the one with the parameter.

**3. Expecting data to survive a restart**

Add a book, stop the server, start it again, and list the books: your book is gone, and only Dune and Emma are back. Everything in the `books` dictionary lives in memory, and memory is wiped every time the program stops ([chapter 20](../20-files-and-folders/notes.md)). In `dev` mode it's even sneakier: the server restarts every time you save **any** `.py` file in the folder, including your `client.py`. That's fine for practice, but a real API needs to keep its data in a file or a database. That's exactly what [chapter 46](../46-project-expense-tracker-api/notes.md) does, with SQLite from [chapter 42](../42-databases/notes.md).

**4. A CORS error that only happens in the browser**

Your API works perfectly from `/docs`, from `requests`, and from your tests. But the React app says "Failed to fetch", and the console shows `blocked by CORS policy`. That's not a bug in your Python code: in fact, the server's log shows the request arrived and was answered with `200 OK`. CORS is a rule that only **browsers** apply, so only the browser hides the answer. Fix: add `CORSMiddleware` with your React app's exact origin, as shown above.

**5. Forgetting the `{curly braces}` in the path**

```python
@app.get("/books")
def get_book(book_id: int) -> dict[str, str]:
    return {"title": TITLES[book_id]}
```

Visit `/books/1`, and you get `{"detail":"Not Found"}` with a 404. Visit `/books`, and you get a 422 saying `"loc":["query","book_id"]`, `"msg":"Field required"`. Without `{book_id}` in the path, FastAPI decided `book_id` was a query parameter, so this endpoint only answers `/books?book_id=1`. Fix: `@app.get("/books/{book_id}")`.

**6. Returning `None` instead of raising `HTTPException`**

```python
@app.get("/books/{book_id}")
def get_book(book_id: int) -> Book | None:
    if book_id not in books:
        print("No such book!")
        return None
    return books[book_id]
```

Ask for a missing book, and the caller gets `null` with the status `200 OK`: "everything went fine, here's nothing". The `print()` only appears in the server's terminal, where the caller can't see it. A React app would happily try to show the title of `null`, and crash there instead.

With the honest hint `-> Book`, it's worse: mypy reports `Incompatible return value type (got "None", expected "Book")`, and if you run it anyway, the caller gets `500 Internal Server Error` while the terminal shows a `ResponseValidationError`. Fix: when something is missing, `raise HTTPException(status_code=404, detail=...)`, so the caller gets a clear answer and the right status code.

## Quick recap

- A web API waits for requests and answers with JSON. FastAPI turns ordinary, hinted Python functions into endpoints: `@app.get("/books")` above a function means "call this for `GET /books`".
- Install `"fastapi[standard]"` in a venv, and run `fastapi dev main.py`. It serves on `http://127.0.0.1:8000`, reloads when you save, and writes interactive docs at `/docs`.
- `{book_id}` in the path plus `book_id: int` makes a path parameter. Other parameters are query parameters, optional when they have a default. A Pydantic `BaseModel` parameter is read from the JSON body. Bad data gets a `422` automatically.
- Pydantic models check and convert data while the program runs. `Field(gt=0, min_length=1)` adds rules. The return type hint describes, checks and filters what goes out.
- Use `status_code=201` for creating and `204` for deleting, and `raise HTTPException(status_code=404, detail=...)` when something isn't there.
- Browsers block a React app from reading your API's answers unless you allow its origin with `CORSMiddleware`. `requests` and tests don't care about CORS.
- Test with `TestClient` and pytest: no running server needed. Use plain `def` for now; `async def` is chapter 47.

---

**Next:** try the [exercises](exercises.md), then move on to [44 Working with Data](../44-working-with-data/notes.md).
