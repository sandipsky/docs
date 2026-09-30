# 30 Axios

**Welcome to Level 4: the React Toolbox.** Each chapter in this level is a library that most React teams use. Each one solves a problem you've already felt by hand in Levels 2 and 3. So every chapter shows the plain React way first (or links back to it), then the library, then a short "When you don't need it" part. Libraries aren't magic, and none of them is compulsory. The skill is knowing when one is worth adding.

## What is it?

**Axios** is a library for making HTTP requests: asking a server for data, or sending it some. It does the same job as `fetch` ([JavaScript chapter 33](../../JavaScript/33-fetch-and-apis/notes.md)), with fewer chores.

```ts
const response = await axios.get("https://www.themealdb.com/api/json/v1/1/random.php");
console.log(response.data); // the JSON, already turned into an object
```

This chapter uses **Axios 1.x**. Install it inside your `playground` folder:

```
npm install axios
```

## Why does it matter?

Look back at [chapter 18](../18-fetching-data/notes.md). Every single request needed the same chores, and forgetting any one of them caused a bug. Here they are, next to what Axios does instead:

| Chore | With `fetch` | With Axios |
|---|---|---|
| Fail on a 404 or a 500 | Check `response.ok` and throw, every time | Throws for you |
| Read the JSON | A second `await response.json()` | Already in `response.data` |
| Send JSON | `JSON.stringify` plus a `Content-Type` header | Pass the object |
| Query strings | Build them, with `encodeURIComponent` | `params: { s: query }` |
| The server's address | Typed in full, in every file | Set `baseURL` once |
| Give up on a stuck server | Remember `AbortSignal.timeout(5000)` on each call | `timeout: 5000`, once |
| A login token on every request | Add the header to every call, and never forget one | An interceptor, once |

**Being honest:** `fetch` is built into every browser, costs nothing to install, and is perfectly fine. Plenty of good apps never use Axios. The biggest win isn't any single feature. It's that you set Axios up **once**, in one file, and every request in your app gets the same address, timeout, headers, and error behaviour. You'll also meet Axios in lots of real codebases, so it's worth being able to read it.

## Real-world example

Think about sending parcels.

| Posting it yourself at the post office (`fetch`) | A courier account (Axios) |
|---|---|
| You write the full address on every parcel | The account remembers your address (`baseURL`) |
| You wrap and label everything yourself | They pack it for you (objects become JSON) |
| The receipt says "delivered" even when the parcel came back | They tell you plainly when a delivery failed (throws on 404 / 500) |
| You unwrap every parcel that arrives | It arrives unwrapped (`response.data`) |
| You wait at the counter as long as it takes | They give up after a set time and tell you (`timeout`) |
| You show your ID at the counter, every time | Your account card goes on every parcel automatically (interceptors) |

Both get the parcel there. One of them needs a lot less remembering.

## How it works

### Your first request: `fetch` and Axios side by side

Here's chapter 18's "Surprise me!" request, both ways:

```ts
type MealDbResponse = {
  meals: null | Array<{ idMeal: string; strMeal: string; strMealThumb: string }>;
};

// With fetch (chapter 18)
async function getRandomMealWithFetch() {
  const response = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  const data: MealDbResponse = await response.json();
  return data.meals?.[0];
}

// With Axios
import axios from "axios";

async function getRandomMealWithAxios() {
  const response = await axios.get<MealDbResponse>("https://www.themealdb.com/api/json/v1/1/random.php");
  return response.data.meals?.[0];
}
```

(In a real file, the `import` goes at the top.) Four lines shorter, and nothing was forgotten: Axios checked the status and read the JSON for you.

### What's inside a response

Axios hands you a **response object**. The data is one part of it:

```ts
const response = await axios.get<MealDbResponse>("https://www.themealdb.com/api/json/v1/1/random.php");

console.log(response.status);                  // the status code: 200
console.log(response.headers["content-type"]); // a header (names are lower case): something like application/json
console.log(response.data.meals?.[0].strMeal); // the body, already an object: e.g. Chicken Handi (it's random!)
```

Most of the time you only want `response.data`.

### Typing the response: a promise, not a proof

The `<MealDbResponse>` in `axios.get<MealDbResponse>(...)` is a **generic** ([TypeScript chapter 08](../../TypeScript/08-generics/notes.md)). It tells TypeScript what `response.data` will be. Leave it out and `response.data` is `any`, which switches off checking.

But be clear about what it does. It's the same as `const data: MealDbResponse = await response.json()` in chapter 18. **It's a promise you're making, not a proof.** Axios doesn't look at the data and check it. If the server sends something different, your code still compiles and breaks later. [Chapter 32](../32-zod/notes.md) shows how to check for real, with Zod.

### Query strings with `params`

In [chapter 21](../21-project-recipe-finder/notes.md) you built search URLs by hand, and had to remember `encodeURIComponent`. Axios builds the query string from an object:

```ts
const response = await axios.get<MealDbResponse>("https://www.themealdb.com/api/json/v1/1/search.php", {
  params: { s: "chicken & rice" },
});
// Axios asks for something like: .../search.php?s=chicken+%26+rice
```

The `&` got encoded for you (`%26`), so it can't break the URL. Open the **Network** tab in DevTools and click the request to see the real address. A `params` value that is `undefined` is left out completely, which is handy for optional filters.

### A practice API of your own: json-server

TheMealDB only lets you *read*. To practise adding, changing, and deleting, you need a server that saves things. **json-server** is a tiny fake REST API that runs on your own computer. (A **REST API** is a server where each kind of thing has an address, like `/books`, and you use GET, POST, PATCH, and DELETE on it.) It reads a JSON file and turns it into a working API.

**1. Install it** inside `playground`. The `-D` makes it a **dev dependency**: a tool you use while building, not part of the app you ship.

```
npm install -D json-server
```

**2. Make `playground/db.json`.** It goes at the top of the project, next to `package.json`, **not** inside `src/`:

```json
{
  "books": [
    { "id": "1", "title": "The Hobbit", "author": "J.R.R. Tolkien", "pages": 310, "status": "finished" },
    { "id": "2", "title": "Atomic Habits", "author": "James Clear", "pages": 320, "status": "reading" },
    { "id": "3", "title": "Dune", "author": "Frank Herbert", "pages": 412, "status": "want" },
    { "id": "4", "title": "Sapiens", "author": "Yuval Noah Harari", "pages": 443, "status": "want" },
    { "id": "5", "title": "The Martian", "author": "Andy Weir", "pages": 369, "status": "finished" }
  ]
}
```

This is your **reading list**: books you want to read, are reading, or have finished.

**3. Add a script** to the `"scripts"` part of `package.json`. Your file has a few more scripts than this; leave them alone and add the `api` line (mind the commas):

```json
"scripts": {
  "dev": "vite",
  "api": "json-server --port 3001 db.json"
}
```

**4. Run it in a second terminal.** Keep `npm run dev` running in the first one. Open another terminal inside `playground` and run:

```
npm run api
```

It prints a short message with its address and a list of endpoints. Now visit `http://localhost:3001/books` in your browser. You'll see your five books.

**Why port 3001?** Vite uses 5173 and json-server's default is 3000. In [chapter 39](../39-nextjs-and-server-components/notes.md), Next.js also wants 3000, so we keep the practice API out of its way.

The **endpoints** (the addresses you can call) are:

| Request | What it does |
|---|---|
| `GET /books` | All the books |
| `GET /books/3` | The book with id `"3"` |
| `GET /books?status=want` | Only the books you want to read |
| `POST /books` | Add a book. json-server makes up the `id` |
| `PATCH /books/3` | Change some fields of book 3, keep the rest |
| `DELETE /books/3` | Remove book 3 |

A few things worth knowing:

- **Changes are real.** json-server writes them into `db.json`. Add a book and you'll see it appear in the file. To start fresh, paste the original five books back in.
- **Ids are strings**, like `"3"`. New books get a short random id.
- **It allows requests from other pages.** Your app runs on port 5173 and the API on 3001, which counts as a different origin. json-server allows it, so there's no CORS error ([JavaScript chapter 33](../../JavaScript/33-fetch-and-apis/notes.md)).
- **It notices hand edits.** In version 1, if you edit `db.json` while the server runs, it reloads the file. If you save broken JSON (a missing comma), the terminal shows an error until you fix it.
- **Version 1 has been labelled "beta" for a long time.** It works well, but details can change. Older tutorials use version 0.17, which had different options (like `--watch`, `_limit`, and number ids). This course avoids the sorting and paging options that changed between versions. When you need sorting, you'll do it in your own code.

### One shared instance: `src/api/client.ts`

So far you've typed full addresses. That's the "write the address on every parcel" problem. `axios.create` makes an **instance**: your own copy of Axios with settings built in. Make `src/api/client.ts`:

```ts
// src/api/client.ts
import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3001",
  timeout: 5000,
});

export const mealDb = axios.create({
  baseURL: "https://www.themealdb.com/api/json/v1/1",
});
```

- `baseURL` is put in front of every address. `api.get("/books")` asks for `http://localhost:3001/books`.
- `timeout: 5000` means "give up after 5 seconds" (5000 milliseconds). More on that below.
- Two instances, because you talk to two servers. Each has its own settings.

The instances are made **once**, when the file is first imported ([JavaScript chapter 29](../../JavaScript/29-modules/notes.md)). Every file that imports `api` gets the same one. When you deploy the app ([chapter 40](../40-deploying/notes.md)), the address changes. Because it lives in one place, that's a one-line change.

### When a request fails

Axios **throws** for any status outside the 200s. You don't check `response.ok`; you `catch`. Try asking for a book that doesn't exist:

```ts
import axios from "axios";
import { api } from "./client.ts";

async function tryMissingBook() {
  try {
    const response = await api.get("/books/999");
    console.log(response.data);
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if (err.response) {
        // The server answered, with bad news
        console.log(err.response.status); // 404
        console.log(err.message);         // Request failed with status code 404
      } else {
        // No answer at all: server not running, offline, or too slow
        console.log(err.code, err.message);
      }
    } else {
      console.log("Something else went wrong:", err);
    }
  }
}
```

Step by step:

- **`err` is `unknown`** in a `catch` ([TypeScript chapter 13](../../TypeScript/13-async-and-apis/notes.md)). Anything can be thrown, so TypeScript won't let you read `err.response` yet.
- **`axios.isAxiosError(err)`** is a type guard. Inside the `if`, TypeScript knows `err` is an Axios error.
- **`err.response`** exists when the server *did* answer. `err.response.status` is the code, and `err.response.data` is whatever body the server sent back.
- **No `err.response`** means no answer arrived. `err.code` tells you why. `"ERR_NETWORK"` (message `Network Error`) usually means the server isn't running or you're offline. A timeout usually shows `"ECONNABORTED"`.

Axios errors are real `Error` objects, so `err.message` always works. But messages like `Request failed with status code 404` are written for developers, not for the people using your app. You'll make friendlier ones in the exercises.

### Reading and writing: `src/api/books.ts`

[Chapter 21](../21-project-recipe-finder/notes.md) taught you to keep one file that knows about the API, so components never do. Here's that file for the reading list. Make `src/api/books.ts`:

```ts
// src/api/books.ts
import { api } from "./client.ts";

export type BookStatus = "want" | "reading" | "finished";

export type Book = {
  id: string;
  title: string;
  author: string;
  pages: number;
  status: BookStatus;
};

// A book before the server has given it an id
export type NewBook = Omit<Book, "id">;

// GET /books: every book on the list
export async function getBooks(): Promise<Book[]> {
  const response = await api.get<Book[]>("/books");
  return response.data;
}

// GET /books/:id: one book
export async function getBook(id: string): Promise<Book> {
  const response = await api.get<Book>(`/books/${id}`);
  return response.data;
}

// POST /books: add a book. The server sends it back with its new id.
export async function addBook(book: NewBook): Promise<Book> {
  const response = await api.post<Book>("/books", book);
  return response.data;
}

// PATCH /books/:id: change some fields, keep the rest
export async function updateBook(id: string, changes: Partial<NewBook>): Promise<Book> {
  const response = await api.patch<Book>(`/books/${id}`, changes);
  return response.data;
}

// DELETE /books/:id: remove a book
export async function deleteBook(id: string): Promise<void> {
  await api.delete(`/books/${id}`);
}
```

`Omit<Book, "id">` means "a `Book` without its `id`", and `Partial<NewBook>` means "any of those fields, all optional". Both are utility types from [TypeScript chapter 09](../../TypeScript/09-utility-types/notes.md). So `updateBook("3", { status: "reading" })` is fine, and `updateBook("3", { status: "done" })` is a type error.

Notice `addBook`. You passed a plain object. Axios turned it into JSON and set the `Content-Type` header for you. Compare that with the POST in [JavaScript chapter 33](../../JavaScript/33-fetch-and-apis/notes.md): no `method`, no `headers`, no `JSON.stringify`, no `response.ok`.

Every file after this chapter uses these five functions. Components will never see a URL.

### Using it in a component

Here's the reading list, with chapter 18's three-state pattern:

```tsx
// src/ch30/ReadingList.tsx
import { useEffect, useState } from "react";
import { getBooks } from "../api/books.ts";
import type { Book } from "../api/books.ts";

function ReadingList() {
  const [books, setBooks] = useState<Book[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    getBooks()
      .then((found) => {
        if (!ignore) setBooks(found);
      })
      .catch((err: unknown) => {
        if (!ignore) setError(err instanceof Error ? err.message : "Something went wrong");
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  if (isLoading) return <p>Loading your books...</p>;
  if (error) return <p>Something went wrong: {error}</p>;
  if (books === null || books.length === 0) return <p>Your reading list is empty.</p>;

  return (
    <ul>
      {books.map((book) => (
        <li key={book.id}>
          {book.title} by {book.author} ({book.status})
        </li>
      ))}
    </ul>
  );
}

export default ReadingList;
```

Stop `npm run api` and refresh: you'll see `Something went wrong: Network Error`. Start it again and the books come back.

**Be honest about what just happened.** The request got shorter. The component didn't. The loading state, the error state, and the `ignore` flag are all still here. And when you add a book, this list won't know. You'd have to reload it yourself. Axios makes *requests* nicer. It doesn't manage *data over time*. That's [chapter 31](../31-tanstack-query/notes.md)'s job.

### Cancelling a request

Axios takes the same `signal` as `fetch`, from chapter 18's `AbortController`:

```tsx
useEffect(() => {
  const controller = new AbortController();

  mealDb
    .get<MealDbResponse>("/search.php", {
      params: { s: query },
      signal: controller.signal,
    })
    .then((response) => setMeals(response.data.meals ?? []))
    .catch((err: unknown) => {
      if (axios.isCancel(err)) return; // we cancelled it on purpose: not a real error
      setError(err instanceof Error ? err.message : "Something went wrong");
    });

  return () => {
    controller.abort();
  };
}, [query]);
```

When `query` changes, the cleanup cancels the old request. Axios then throws a **cancel error**. `axios.isCancel(err)` recognises it (so does `err.code === "ERR_CANCELED"`). In chapter 18 you checked `err.name === "AbortError"` instead. Same idea, different name.

In the Network tab, a cancelled request shows `(canceled)` (Chrome spells it the American way). In development you'll also see one on first load. That's Strict Mode running your effect twice on purpose ([chapter 17](../17-effects/notes.md)).

### Interceptors: a checkpoint every request passes through

An **interceptor** is a function that runs for every request made through an instance. Think of the post room in a big office. Every outgoing letter gets stamped there, and every incoming letter gets sorted there, so nobody at a desk has to do it.

There are two kinds:

- A **request interceptor** runs before a request leaves. It can change it, for example by adding a header.
- A **response interceptor** runs when the answer comes back, before your code sees it.

**Adding a login token to every request.** Real APIs often need a **token**: a secret string that proves who you are, like a festival wristband. You send it in an `Authorization` header. Add this to `client.ts`, below the two instances:

```ts
// src/api/client.ts (continued)
api.interceptors.request.use((config) => {
  // A real app gets this from logging in. Ours is pretend.
  const token = "pretend-token-123";
  config.headers.Authorization = `Bearer ${token}`;
  return config; // hand the request back, or it never leaves
});
```

Now every call through `api` carries the header. Click a `/books` request in the Network tab and look under **Request Headers**. You'll also see an extra `OPTIONS` request: the CORS preflight from [JavaScript chapter 33](../../JavaScript/33-fetch-and-apis/notes.md), because of the custom header. json-server says yes to it.

Notice it's on `api`, **not** `mealDb`. Interceptors belong to one instance. That matters: you never want to send your token to somebody else's server.

**Logging every failed request.** A response interceptor takes two functions: one for success, one for failure.

```ts
api.interceptors.response.use(
  (response) => response, // success: pass it straight through
  (error: unknown) => {
    if (import.meta.env.DEV && axios.isAxiosError(error)) {
      console.warn(
        `[api] ${error.config?.method?.toUpperCase()} ${error.config?.url} failed:`,
        error.response?.status ?? error.code
      );
    }
    return Promise.reject(error); // keep it an error, so your catch still runs
  }
);
```

`import.meta.env.DEV` is `true` only while you run `npm run dev`, so the logging never reaches real users.

The last line matters most. If a failure interceptor *returns* something instead of rejecting, the error disappears, and the caller thinks the request worked ([JavaScript chapter 31](../../JavaScript/31-promises/notes.md)). Always `return Promise.reject(error)` unless you truly mean to recover.

You *could* also swap the error for a friendlier one here. But then `axios.isAxiosError` and `err.response?.status` stop working for everyone downstream. It's usually better to keep the real error and turn it into a friendly message where you show it. Exercise 4 does exactly that.

### Timeouts

Without a timeout, Axios waits as long as the browser does, which can be a very long time. The `timeout: 5000` in `client.ts` means: no answer in 5 seconds, give up and throw. The error has no `response`, and its message is something like `timeout of 5000ms exceeded`.

You can change it for one request, like a slow report:

```ts
const response = await api.get("/books", { timeout: 20000 }); // this one may take 20 seconds
```

(With `fetch`, modern browsers let you write `signal: AbortSignal.timeout(5000)`. It works, but you have to remember it on every call.)

### When you don't need Axios

- **A small app with a few GET requests.** `fetch` plus one small helper, like `fetchJson` from [TypeScript chapter 13](../../TypeScript/13-async-and-apis/notes.md), is perfectly good.
- **Every kilobyte counts.** Axios adds a little to your download. `fetch` adds nothing.
- **Your framework builds on `fetch`.** Next.js ([chapter 39](../39-nextjs-and-server-components/notes.md)) adds its own features to `fetch`, so plain `fetch` is the normal choice there.

There are also small libraries built on top of `fetch` (like `ky`) that give you some of the same comforts. Whichever you pick, the real lesson is the same: **one file that knows your API**, with small typed functions like `getBooks`, and components that never see a URL.

## Common mistakes

**1. Forgetting `.data`**

```ts
const response = await api.get<Book[]>("/books");
setBooks(response);      // ❌ a type error mentioning AxiosResponse<Book[], ...>
setBooks(response.data); // ✅
```

The response is the whole parcel: status, headers, and data. Your books are in `.data`.

**2. Turning the body into JSON yourself**

```ts
api.post("/books", JSON.stringify(book)); // ❌ Axios expects the object
api.post("/books", book);                 // ✅ Axios converts it and sets the header
```

That's a `fetch` habit. With Axios, it's extra work at best. At worst, the server gets a plain string with the wrong label and saves nothing useful.

**3. Reading `err.response` without checking first**

```ts
catch (err) {
  console.log(err.response.status);
  // ❌ 'err' is of type 'unknown'.
}
```

Narrow it with `axios.isAxiosError(err)`, then use `err.response?.status`, because `response` is missing when no answer came back.

**4. Checking for errors before checking for cancels**

A cancelled request is *also* an Axios error, with no `response`. If you check `isAxiosError` first, a harmless cancel looks exactly like "the server is down". Check `axios.isCancel(err)` first, and return quietly.

**5. Creating an instance inside a component**

```tsx
function ReadingList() {
  const api = axios.create({ baseURL: "http://localhost:3001" }); // ❌ a new one every render
}
```

Make instances once, in `client.ts`, and import them. Adding interceptors inside a component is worse: they pile up, one more every render, and you'll see each log two, three, ten times.

**6. Trusting the generic as a guarantee**

`api.get<Book[]>` doesn't check anything. If the server sends `{ "items": [...] }` instead of an array, TypeScript can't tell you. [Chapter 32](../32-zod/notes.md) fixes this.

**7. Forgetting to start the practice API**

```
GET http://localhost:3001/books net::ERR_CONNECTION_REFUSED
```

The Console shows that line, and your error is `Network Error` with `err.code` of `"ERR_NETWORK"`. Nothing is wrong with your code. Open a second terminal in `playground` and run `npm run api`.

## Quick recap

- **Axios** does what `fetch` does, minus the chores: it throws on 404 / 500, reads the JSON into `response.data`, sends objects as JSON, and builds query strings from `params`.
- The big win is **one shared instance** in `src/api/client.ts`, with a `baseURL` and a `timeout`.
- **json-server** turns `db.json` into a real practice API on port 3001. Run `npm run api` in a second terminal.
- Keep every request in small, typed functions like `getBooks` and `addBook` in `src/api/books.ts`. Components never see a URL.
- In a `catch`, check `axios.isCancel(err)` first, then `axios.isAxiosError(err)`. `err.response` exists only when the server answered.
- **Interceptors** are checkpoints every request passes through: add a header, log failures. Always hand the request back, and always reject errors you don't handle.
- `axios.get<Book[]>` is a promise, not a proof. And Axios doesn't manage loading, caching, or refetching. That's the next chapter.

---

**Next:** try the [exercises](exercises.md), then move on to [31 TanStack Query](../31-tanstack-query/notes.md).
