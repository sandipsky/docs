# 33 Fetch and APIs

## What is it?

An **API** (Application Programming Interface) is a set of rules for how one program can ask another program for data, or ask it to do something. On the web, that usually means sending a request to a server's address and getting data back.

**`fetch`** is JavaScript's built-in function for sending those requests. It works in every modern browser, and in Node.

## Why does it matter?

Almost every app you use is built on APIs:

- A weather app asks a weather service for today's forecast.
- A shop page asks the shop's server for products and prices.
- A map loads new places as you drag it around.
- When you post a comment, the page sends your text to a server to be saved.

Until now, all your data has been typed into your own code. With `fetch` and `async`/`await` from [chapter 32](../32-async-await/notes.md), your programs can use live data from anywhere on the internet, and send data back.

## Real-world example

An API is like a waiter in a restaurant. You don't walk into the kitchen and cook your own food. You look at the menu, tell the waiter what you'd like, and the waiter brings it to you from the kitchen. If the kitchen can't make it, the waiter comes back and tells you.

| At the restaurant | With a web API |
|---|---|
| The menu | The API's documentation: what you're allowed to ask for |
| Your order: "the soup, please" | A **request**: a method and an address (sometimes with data) |
| The waiter | The API |
| The kitchen | The server and its database, which you never see |
| Your food on a plate | The **response**, usually data in JSON |
| "Sorry, we're out of soup" | An error code, like 404 |

You never need to know how the kitchen works. You only need to know how to order.

## How it works

### Before you start

- Node has had `fetch` built in since version 18, so your Node 24 is ready. You need an internet connection, of course.
- The examples use top-level `await`, so add a `package.json` file containing `{ "type": "module" }` to this folder ([chapter 29](../29-modules/notes.md), [chapter 32](../32-async-await/notes.md)).
- The examples use two free APIs that need no sign-up and no key:
  - **JSONPlaceholder** (`jsonplaceholder.typicode.com`): fake users, posts and to-dos, made for practice. Its data never changes, so your output will match the notes exactly.
  - **Open-Meteo** (`open-meteo.com`): real weather. Your numbers will be different, because the weather changes!

### URLs, endpoints and query parameters

Every request goes to a **URL** (a web address). Here's one, taken apart:

```
https://jsonplaceholder.typicode.com/posts?userId=1
```

| Part | Example | What it is |
|---|---|---|
| protocol | `https://` | how to talk (the `s` means secure) |
| host | `jsonplaceholder.typicode.com` | which server |
| path | `/posts` | what you want from it |
| query string | `?userId=1` | extra options, after the `?` |

An **endpoint** is one address in an API that gives you one kind of thing. JSONPlaceholder has endpoints like these:

| Endpoint | Gives you |
|---|---|
| `/users` | all 10 users |
| `/users/1` | the user with id 1 |
| `/posts?userId=1` | the posts written by user 1 |
| `/todos?userId=1` | user 1's to-do items |

**Query parameters** are the options in the query string, written as `key=value` and joined with `&`, like `?latitude=27.7&longitude=85.32`.

### Building URLs safely with `URL` and `URLSearchParams`

Some characters can't go into a URL as they are, like spaces, `&`, or letters like `ã`. They have to be **encoded**: turned into safe codes. The built-in `URL` object does this for you:

```js
const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
url.searchParams.set("name", "São Paulo");
url.searchParams.set("count", 1);

console.log(url.href);
// prints: https://geocoding-api.open-meteo.com/v1/search?name=S%C3%A3o+Paulo&count=1
```

The space became `+`, and `ã` became `%C3%A3`. `url.searchParams` is a **URLSearchParams** object: a handy list of query parameters that you can `set`, `get` and `delete`.

Why not glue the URL together with a template literal? Watch what happens with a recipe search:

```js
const dish = "mac & cheese";

console.log(`https://example.com/recipes?search=${dish}`);
// prints: https://example.com/recipes?search=mac & cheese

const url = new URL("https://example.com/recipes");
url.searchParams.set("search", dish);
console.log(url.href);
// prints: https://example.com/recipes?search=mac+%26+cheese
```

In the first URL, the `&` starts a new parameter, so the server would only see `search=mac `. The `URL` version encodes `&` as `%26`, and the whole dish arrives safely.

You can also build a query string straight from an object:

```js
const params = new URLSearchParams({ latitude: 27.7, longitude: 85.32, current: "temperature_2m" });
console.log(params.toString());
// prints: latitude=27.7&longitude=85.32&current=temperature_2m
```

### HTTP in a nutshell

**HTTP** is the set of rules that browsers and servers use to talk to each other. Every conversation is a request followed by a response.

A **request** has:

- a **method**: what you want to do (read something, create something...)
- a **URL**: what you want to do it to
- **headers**: extra labels about the request, like the labels on a parcel ("the contents are JSON")
- sometimes a **body**: data you're sending, usually as JSON ([chapter 23](../23-json-and-local-storage/notes.md))

A **response** has a **status code** (a number that says how it went), headers, and a body with the data.

The five methods you'll meet most:

| Method | Means | At the restaurant |
|---|---|---|
| `GET` | read something | "What's today's special?" |
| `POST` | create something new | "I'd like to place an order" |
| `PUT` | replace something completely | "Swap my whole order for this one" |
| `PATCH` | change part of something | "Same order, but no onions" |
| `DELETE` | remove something | "Cancel my order" |

And the status codes you'll see most:

| Code | Name | Means |
|---|---|---|
| `200` | OK | It worked. Here's your data. |
| `201` | Created | It worked. Your new thing was created. |
| `400` | Bad Request | Your request doesn't make sense (a typo, a missing or wrong value). |
| `401` | Unauthorized | You need to log in first, or your key is wrong. |
| `404` | Not Found | There's nothing at that address. |
| `500` | Internal Server Error | Something broke on the server. |

A handy way to remember them: codes in the **200s** mean success, the **400s** mean something is wrong with *your* request, and the **500s** mean something went wrong on the *server*.

You'll meet real ones in this chapter. JSONPlaceholder answers `404` for a post that doesn't exist, and Open-Meteo answers `400` if you ask for the weather at latitude 999 (there's no such place on Earth), with the reason in the body: `Latitude must be in range of -90 to 90°. Given: 999.0.`

### Your first fetch

```js
const response = await fetch("https://jsonplaceholder.typicode.com/users/1");
console.log(response.status); // prints: 200
console.log(response.ok);     // prints: true

const user = await response.json();
console.log(user.name);         // prints: Leanne Graham
console.log(user.address.city); // prints: Gwenborough
```

There are two `await`s, one for each part of the answer:

1. `fetch(url)` sends a GET request and returns a promise for a **Response**: an object describing the answer, with its status and headers. It's ready as soon as the server starts answering, before the whole body has arrived.
2. `response.json()` reads the rest of the body and turns the JSON into a JavaScript object, like `JSON.parse` from chapter 23. It returns a promise too, so it needs its own `await`.

`response.ok` is `true` when the status is in the 200s. Try `console.log(user)` to see everything JSONPlaceholder knows about Leanne, including her nested `address` and `company` objects.

### `fetch` doesn't fail on a 404

This surprises almost everyone. Ask for a post that doesn't exist:

```js
const response = await fetch("https://jsonplaceholder.typicode.com/posts/9999");
console.log(response.status);       // prints: 404
console.log(response.ok);           // prints: false
console.log(await response.json()); // prints: {}
```

No error! `fetch` only rejects when it gets no answer at all. A 404 is still an answer. The waiter came back and said "we don't have that", and that counts as a successful trip to the kitchen.

So checking `response.ok` is your job. Here's the pattern you'll write again and again:

```js
async function getPost(id) {
  const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json();
}

try {
  const post = await getPost(9999);
  console.log(post.title);
} catch (error) {
  console.log(error.message); // prints: Request failed with status 404
}
```

With `getPost(1)`, you'd see the post's title instead (JSONPlaceholder's titles are fake Latin, so it starts `sunt aut facere`).

That `if (!response.ok)` check is the most important habit in this chapter. It turns "the server said no" into a real error that your `catch` can handle.

### Network errors: when nothing comes back

When `fetch` can't reach the server at all, because you're offline, the address is wrong, or the server is down, the promise rejects:

```js
try {
  await fetch("https://no-such-shop.invalid/products");
} catch (error) {
  console.log(error.message);    // prints: fetch failed
  console.log(error.cause.code); // prints: ENOTFOUND
}
```

(Addresses ending in `.invalid` are reserved for examples, so this one can never exist.)

In Node, the message is `fetch failed`, and `error.cause` ([chapter 18](../18-error-handling/notes.md)) has the details. `ENOTFOUND` means "no server has that name". In the browser, the message is different, like `Failed to fetch` in Chrome.

So there are two different ways a request can go wrong, and a good program handles both:

| What happened | What `fetch` does | How you find out |
|---|---|---|
| The server answered with an error (404, 500...) | fulfills, with `ok: false` | check `response.ok` |
| There was no answer (offline, wrong address) | rejects | `try`/`catch` |

### Real data: the weather in Kathmandu

Time for a real API. Open-Meteo needs a place's latitude and longitude, so getting the weather for a city takes two requests: first look up the city, then ask for its weather. Both need the `response.ok` check, so let's turn `getPost` into a helper that works for any URL:

```js
async function getJSON(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json();
}
```

**Step 1: find the city.** Open-Meteo's geocoding API turns a place name into coordinates. (`fetch` accepts a `URL` object as well as a string.)

```js
const placeUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
placeUrl.searchParams.set("name", "Kathmandu");
placeUrl.searchParams.set("count", 1);

const places = await getJSON(placeUrl);
const { name, country, latitude, longitude } = places.results[0];
console.log(name, country, latitude, longitude); // prints: Kathmandu Nepal 27.70169 85.3206
```

The answer is an object with a `results` array (here with one place, because of `count=1`). Each place has lots of fields; these four are the ones you need.

**Step 2: ask for the weather.** The forecast API takes the coordinates, plus a `current` list of what you want to know:

```js
const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");
weatherUrl.searchParams.set("latitude", latitude);
weatherUrl.searchParams.set("longitude", longitude);
weatherUrl.searchParams.set("current", "temperature_2m,wind_speed_10m");

const weather = await getJSON(weatherUrl);
console.log(weather.current);
```

You'll see something like this (it's live weather, so your numbers will be different):

```
{
  time: '2026-09-24T11:15',
  interval: 900,
  temperature_2m: 20.5,
  wind_speed_10m: 3.2
}
```

`temperature_2m` is the temperature 2 metres above the ground, in °C, and `wind_speed_10m` is the wind speed in km/h. (The units are in `weather.current_units`, and the `time` is in UTC unless you add `timezone=auto`.) Now make it friendly:

```js
const { temperature_2m, wind_speed_10m } = weather.current;
console.log(`${name}, ${country}: ${temperature_2m}°C, wind ${wind_speed_10m} km/h`);
// prints something like: Kathmandu, Nepal: 20.5°C, wind 3.2 km/h
```

Try your own city!

> **Watch out:** if no place matches, the geocoding API still answers `200 OK`, but with no `results` at all, just `{ generationtime_ms: 0.25 }` (roughly). `response.ok` can't warn you, and `places.results[0]` crashes with `TypeError: Cannot read properties of undefined (reading '0')`. Check first, with `if (places.results === undefined)`, and show a friendly "city not found" message.

### Sending data: POST with a JSON body

So far, every request has been a GET: "please give me something". To *create* something, like a new blog post, you send a POST with the data in the body. `fetch` takes a second argument for this: an **options object** ([chapter 15](../15-destructuring-spread-rest/notes.md)).

```js
const newPost = { title: "My trip to Rome", body: "The pasta was amazing!", userId: 1 };

const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(newPost),
});

console.log(response.status); // prints: 201
console.log(await response.json());
```

You'll see:

```
201
{
  title: 'My trip to Rome',
  body: 'The pasta was amazing!',
  userId: 1,
  id: 101
}
```

Three things make it work:

- `method: "POST"` says what you want to do.
- The `Content-Type: application/json` header tells the server "the body is JSON". Without it, many servers don't know how to read your data.
- `body` must be a string, so `JSON.stringify` turns your object into JSON text first.

The server answers `201 Created` and sends back the new post with its `id`. (JSONPlaceholder only pretends: it answers as if it saved your post, but nothing is really stored. A real API would keep it.)

`PUT` and `PATCH` look just the same, with their own method name. For example, `method: "PATCH"` with the body `JSON.stringify({ title: "Just a new title" })` changes only post 1's title, and answers `200`. `DELETE` usually needs no body at all:

```js
const response = await fetch("https://jsonplaceholder.typicode.com/posts/1", { method: "DELETE" });
console.log(response.status); // prints: 200
```

### Sending your own headers

`Content-Type` isn't the only header you can send. The `headers` object can hold any headers you like, with any method. Some common ones:

| Header | What it tells the server |
|---|---|
| `Authorization` | Who you are, like `"Bearer abc123"` (a login token) |
| `Accept` | Which format you'd like back, like `"application/json"` |
| `Accept-Language` | Which language you'd like, like `"ne"` or `"en"` |
| `X-Something` | Anything your own API needs. Custom headers often start with `X-`. |

To see headers in action, use **httpbin.org**, a free test service. Its `/headers` address sends back the headers it received, like a mirror:

```js
const response = await fetch("https://httpbin.org/headers", {
  headers: {
    Authorization: "Bearer my-token-123",
    "X-App-Version": "1.4.0",
  },
});

const data = await response.json();
console.log(data.headers.Authorization);   // prints: Bearer my-token-123
console.log(data.headers["X-App-Version"]); // prints: 1.4.0
```

Header names with a `-` need quotes in the object, just like any object key with a dash ([chapter 11](../11-objects/notes.md)). Header names don't care about capital letters: `authorization` and `Authorization` are the same header.

> **Watch out:** it's fine to send a token the server gave the logged-in user. But never type a *secret* key straight into front-end code: anyone can read it (see "API keys" below, and [chapter 51](../51-security-basics/notes.md)).

### Reading the server's headers

Responses have headers too, and `response.headers.get()` reads one. Here, the server says what kind of data it sent:

```js
const response = await fetch("https://jsonplaceholder.typicode.com/posts/1");

console.log(response.headers.get("Content-Type")); // prints: application/json; charset=utf-8
console.log(response.headers.get("X-Not-There"));  // prints: null
console.log(response.headers.has("content-type")); // prints: true
```

`get` returns `null` when the header isn't there. Real uses: checking that the response really is JSON before calling `.json()`, or reading headers some APIs use to say how many requests you have left.

### Loading and error states on a web page

On a real page, a request can take a second or two, and sometimes it fails. If nothing happens on the screen meanwhile, people think the page is broken and click again and again. A good page shows three **states**:

1. **Loading:** a "Loading..." message, and the button switched off so it can't be clicked twice.
2. **Success:** the data.
3. **Error:** a friendly message, instead of a blank page.

Say the page has `<button id="load">Load user</button>` and `<p id="message"></p>`, and the script also includes the `getJSON` helper from above:

```js
const loadButton = document.querySelector("#load");
const message = document.querySelector("#message");

loadButton.addEventListener("click", async () => {
  loadButton.disabled = true;
  message.textContent = "Loading...";
  try {
    const user = await getJSON("https://jsonplaceholder.typicode.com/users/1");
    message.textContent = `Hello, ${user.name}!`;
  } catch (error) {
    message.textContent = "Sorry, something went wrong. Please try again.";
  } finally {
    loadButton.disabled = false;
  }
});
```

- Before the request: show "Loading..." and set `disabled` to `true` (the button goes grey and ignores clicks).
- `try`: show the data. `catch`: show a friendly error, for a 404 and for "no connection" alike.
- `finally` switches the button back on, whichever way it went ([chapter 31](../31-promises/notes.md) used `.finally` for exactly this).

Opening the page by double-clicking `index.html` works fine here, because these APIs allow requests from any page. That's thanks to CORS.

### CORS in two sentences

**CORS** (Cross-Origin Resource Sharing) is a browser safety rule: a page may only read a response from *another* website if that website allows it, with a response header called `Access-Control-Allow-Origin`. JSONPlaceholder and Open-Meteo allow everyone, but if your console ever says a request was "blocked by CORS policy", the fix is on the server's side, not in your `fetch` code.

(Node doesn't apply this rule. That's why your Node scripts never run into it.)

### Headers and the browser's rules

The browser adds two rules about request headers. Node has neither.

**1. Some headers are off-limits.** The browser sets headers like `Cookie`, `Host`, `Origin` and `Referer` itself, so your page can't fake them. If you try, the browser ignores your value without an error.

**2. Custom headers to another website need permission first.** A simple request, like a plain GET, goes straight out. But when you send a custom header like `X-App-Version` (or `Authorization`) to another website, the browser first sends a small "may I?" request, called a **preflight**. It's like phoning a restaurant to ask whether they take card before you go:

```
Browser  →  Server:  "May I send a request with the header X-App-Version?"   (preflight)
Server   →  Browser: "Yes, that header is allowed."
Browser  →  Server:  the real request
```

If the server doesn't say yes, the real request never happens, and the console shows a CORS error. You'll see the preflight in the DevTools **Network** tab as an extra request with the method `OPTIONS`. As with all CORS problems, the fix is on the server: it has to allow your header.

### Cancelling a request: `AbortController`

Sometimes you want to give up on a request: the user closed the pop-up, typed a new search, or the server is taking forever. An **`AbortController`** is like a remote control with one button, "abort". You pass its `signal` to `fetch`, and pressing the button cancels the request:

```js
const controller = new AbortController();

const request = fetch("https://jsonplaceholder.typicode.com/posts", {
  signal: controller.signal,
});
controller.abort(); // changed my mind!

try {
  await request;
} catch (error) {
  console.log(error.name);    // prints: AbortError
  console.log(error.message); // prints: This operation was aborted
}
```

A cancelled `fetch` rejects with an error named `AbortError`, so your `catch` can tell "I cancelled it" apart from a real failure.

For a time limit, there's a shortcut: `AbortSignal.timeout(ms)` gives you a signal that aborts by itself after that many milliseconds.

```js
try {
  const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
    signal: AbortSignal.timeout(5000), // give up after 5 seconds
  });
  console.log(response.status); // prints: 200
} catch (error) {
  if (error.name === "TimeoutError") {
    console.log("The server took too long. Please try again.");
  } else {
    console.log("Something went wrong:", error.message);
  }
}
```

JSONPlaceholder answers well within 5 seconds, so you'll see `200`. Change the limit to `1` millisecond, and you'll see the "took too long" message instead. Unlike the `Promise.race` time limit in chapter 31, this really stops the request.

### Retrying with backoff

Networks hiccup. A request that fails now might work a moment later. A common pattern is to try again a few times, waiting a little longer after each failure. That growing wait is called **backoff**:

```js
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getJSONWithRetry(url, attempts = 3) {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await getJSON(url); // "await" here, so the catch below sees failures
    } catch (error) {
      if (attempt === attempts) {
        throw error; // out of tries: give up
      }
      const delay = 500 * 2 ** (attempt - 1); // 500 ms, then 1000 ms, then 2000 ms...
      console.log(`Attempt ${attempt} failed. Trying again in ${delay} ms...`);
      await wait(delay);
    }
  }
}

try {
  await getJSONWithRetry("https://no-such-shop.invalid/products");
} catch (error) {
  console.log("Giving up:", error.message);
}
```

You'll see:

```
Attempt 1 failed. Trying again in 500 ms...
Attempt 2 failed. Trying again in 1000 ms...
Giving up: fetch failed
```

Look at `return await getJSON(url)`. Without that `await`, the function would hand back the promise straight away, before it fails, so the `catch` would never run and nothing would be retried.

Only retry when trying again might help: network errors, timeouts, and 500s. Don't retry a 404: the missing post won't appear by asking again.

### API keys: keep secrets secret

Many APIs need an **API key**: a long secret code that identifies your app, a bit like a password. The APIs in this chapter don't need one, but you'll meet them soon.

Never put a secret key in front-end code. Anyone can open DevTools on your page and read it in seconds, and then use your account (and maybe your money). Keep secret keys on a server, and let your server talk to the API. [Chapter 51](../51-security-basics/notes.md) covers this properly.

## Common mistakes

**1. Not checking `response.ok`**

```js
const response = await fetch("https://jsonplaceholder.typicode.com/users/11");
const user = await response.json();
console.log(user.name); // prints: undefined
```

There are only 10 users, so this is a 404, and the body is `{}`. But nothing complains, so the program carries on with empty data. Fix: check `response.ok` and throw if it's `false`, like `getJSON` does.

**2. Forgetting `await` on `response.json()`**

```js
const response = await fetch("https://jsonplaceholder.typicode.com/users/1");
const user = response.json(); // forgot await
console.log(user);      // prints: Promise { <pending> }
console.log(user.name); // prints: undefined
```

Reading the body takes time too, so `response.json()` returns a promise. Fix: `const user = await response.json();`.

**3. Forgetting `JSON.stringify`**

```js
const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: newPost, // forgot JSON.stringify
});
console.log(response.status, response.statusText); // prints: 500 Internal Server Error
```

The body has to be text. Given an object, `fetch` turns it into the text `[object Object]`, which isn't JSON, and JSONPlaceholder's server chokes on it. Fix: `body: JSON.stringify(newPost)`.

**4. Forgetting the `Content-Type` header**

```js
const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
  method: "POST",
  body: JSON.stringify(newPost), // no Content-Type header
});
console.log(await response.json()); // prints: { id: 101 }
```

It still says `201 Created`, but your title and body are gone. Without the header, the server didn't know the body was JSON, so it ignored it. Fix: add `headers: { "Content-Type": "application/json" }`.

**5. Reading the body twice**

```js
const response = await fetch("https://jsonplaceholder.typicode.com/users/1");
console.log(await response.json()); // works
console.log(await response.json()); // fails
// TypeError: Body is unusable: Body has already been read
```

A response's body can only be read once. After that, it's used up. Fix: read it once, store the result in a variable, and use the variable as often as you like.

> **On Windows:** when a script crashes after using `fetch`, Node 24 may print one extra line at the very end, starting with `Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)`. That's a quirk of Node on Windows, not a bug in your code. The real error is the one above it.

## Quick recap

- An API lets your program ask another program for data. On the web, that's a **request** (method, URL, headers, maybe a body) and a **response** (status code, headers, body).
- `const response = await fetch(url)` gets the response, and `await response.json()` turns its body into an object.
- `fetch` only rejects when there's no answer at all. A 404 or 500 still fulfills, so always check `response.ok`.
- Build URLs with `URL` and `URLSearchParams`, so every value is encoded safely.
- To send data, give `fetch` a `method`, a `Content-Type: application/json` header, and a `JSON.stringify`-ed `body`.
- The `headers` option sends any headers you like, and `response.headers.get(name)` reads the server's. In the browser, some headers are off-limits, and custom headers to other sites trigger a CORS preflight.
- On a page, show loading and error states. Cancel with `AbortController` or `AbortSignal.timeout`, and retry with backoff only when it can help.
- Never put secret API keys in front-end code.

---

**Next:** try the [exercises](exercises.md), then move on to [34 Debounce and Throttle](../34-debounce-and-throttle/notes.md).
