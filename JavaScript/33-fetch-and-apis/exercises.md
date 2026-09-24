# 33 Fetch and APIs: Exercises

**How to do these:**

- You need an internet connection for all of them.
- Exercises 1 to 4 run in Node. Add a `package.json` file containing `{ "type": "module" }` to this folder (once), so you can use top-level `await`. Then make a file for each exercise (`ex1.js`, `ex2.js`, and so on) and run it with `node ex1.js`.
- Exercise 5 runs in the browser. Make a folder `ex5` with `index.html` and `script.js` inside, and double-click `index.html` to open it. It's a normal script, not a module, so you don't need Live Server, but you can't use top-level `await` there. Press `F12` → **Console** to see errors, and refresh after each change.
- JSONPlaceholder's data never changes, so those outputs must match exactly. Open-Meteo's weather is live, so your numbers will be different.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Contact card

Your address book app needs the details of user number 3. Fetch `https://jsonplaceholder.typicode.com/users/3` and print a small contact card.

Expected output:

```
Name: Clementine Bauch
Email: Nathan@yesenia.net
City: McKenziehaven
Company: Romaguera-Jacobson
```

<details>
<summary>Hint 1</summary>

You need two `await`s: one for `fetch`, and one for `response.json()`.

</details>

<details>
<summary>Hint 2</summary>

The city and the company name are inside nested objects. `console.log` the whole user first to see where they live.

</details>

---

## Exercise 2 (Easy): Check before you trust

A to-do app shows tasks by their number. Some numbers don't exist, and the app must say so instead of showing an empty task.

1. Write `async function getTodo(id)` that fetches `https://jsonplaceholder.typicode.com/todos/<id>`. If `response.ok` is `false`, it throws an `Error` with the message `not found (status 404)` (with the real status). Otherwise, it returns the to-do.
2. Write `async function showTodo(id)` that prints the to-do, or the error message, like in the expected output.
3. Show to-dos 1, 4 and 999, one after the other.

Expected output:

```
Todo 1: "delectus aut autem" (not done yet)
Todo 4: "et porro tempora" (done)
Todo 999: not found (status 404)
```

<details>
<summary>Hint 1</summary>

Each to-do has a `title` and a `completed` property (`true` or `false`). A ternary from [chapter 07](../07-conditionals/notes.md) can turn `completed` into "done" or "not done yet".

</details>

<details>
<summary>Hint 2</summary>

`getTodo` throws, and `showTodo` catches. Put a `try`/`catch` in `showTodo`, around the `await getTodo(id)`.

</details>

---

## Exercise 3 (Medium): Post a book review

A book club website lets members post reviews. Send this review to JSONPlaceholder's `/posts` endpoint:

```js
const review = { title: "Dune: a desert classic", body: "Slow start, amazing ending. 4 out of 5.", userId: 7 };
```

1. Write `async function saveReview(review)`. It sends a `POST` request with the review as JSON, throws an error if `response.ok` is `false`, prints the status, and returns the saved review that the server sends back.
2. Call it and print the saved review's `id` and `title`.

Expected output:

```
Status: 201
Saved review #101: "Dune: a desert classic"
```

Then try this experiment: delete the `headers` line and run it again. You should see:

```
Status: 201
Saved review #101: "undefined"
```

The server said "Created", but it ignored your data, because it didn't know the body was JSON. Put the header back when you're done.

<details>
<summary>Hint 1</summary>

The second argument to `fetch` is an options object with three properties: `method`, `headers` and `body`.

</details>

<details>
<summary>Hint 2</summary>

The body has to be text, so turn the object into JSON with `JSON.stringify` first ([chapter 23](../23-json-and-local-storage/notes.md)).

</details>

---

## Exercise 4 (Medium): Weather for any city

Turn the Kathmandu example from the notes into a reusable weather function.

1. Write `async function getWeather(city)`. It looks up the city with Open-Meteo's geocoding API, then gets the current temperature and wind speed from the forecast API, and **returns** a line like `Kathmandu, Nepal: 20.5°C, wind 3.2 km/h`.
2. If no place matches, it throws an `Error` with the message `no place called "Nowhereville"` (with the real name).
3. Get the weather for `Kathmandu`, `Lisbon` and `Nowhereville`, one after the other, using a `for...of` loop. Print each line, or `Sorry, <error message>` if it fails, and keep going.

Expected output (live weather, so your numbers will be different):

```
Kathmandu, Nepal: 20.5°C, wind 3.2 km/h
Lisbon, Portugal: 28°C, wind 1.8 km/h
Sorry, no place called "Nowhereville"
```

**Rule:** build both URLs with `new URL(...)` and `searchParams.set(...)`, not by gluing strings together.

<details>
<summary>Hint 1</summary>

Copy the `getJSON` helper from the notes. It saves you from writing the `response.ok` check twice.

</details>

<details>
<summary>Hint 2</summary>

When nothing matches, the geocoding answer has no `results` property at all. Check for that before you use `results[0]`.

</details>

<details>
<summary>Hint 3</summary>

Put the `try`/`catch` inside the loop, around one city, so a failure only affects that city ([chapter 32](../32-async-await/notes.md) did the same with orders).

</details>

**Bonus:** try a few place names of your own. Is there a town called Atlantis? (There is!)

---

## Exercise 5 (Challenge): Customer lookup page

A support team wants a page to look up a customer by id and see how they're getting on with their to-dos. This one runs in the browser.

Create `ex5/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>User Lookup</title>
  <script src="script.js" defer></script>
</head>
<body>
  <h1>User lookup</h1>
  <form id="lookup-form">
    <label for="user-id">User id (1 to 10):</label>
    <input id="user-id" type="number" min="1" value="1">
    <button id="lookup-button">Look up</button>
  </form>
  <p id="status"></p>
  <div id="card"></div>
</body>
</html>
```

Write `ex5/script.js` so that when the form is submitted:

1. The page doesn't reload ([chapter 22](../22-forms/notes.md)). Read the id from the input, and remember that it's a string.
2. While it's loading, the button is disabled, `#status` says `Loading...`, and `#card` is emptied.
3. It fetches the user (`/users/<id>`) and their to-dos (`/todos?userId=<id>`) **at the same time**, each with a 5-second time limit.
4. On success, `#status` is emptied, and `#card` gets three new elements: an `<h2>` with the name, a `<p>` saying `Lives in <city>, works at <company>`, and a `<p>` saying `To-dos done: <done> of <total>`.
5. On failure, `#status` says:
   - `No user with id 42.` for a 404 (with the real id)
   - `The server is taking too long. Please try again.` for a timeout
   - `Something went wrong. Check your connection and try again.` for anything else
6. Either way, the button is switched back on at the end.

What you should see:

| You look up | You see |
|---|---|
| `1` | **Leanne Graham**, `Lives in Gwenborough, works at Romaguera-Crona`, `To-dos done: 11 of 20` |
| `3` | **Clementine Bauch**, `Lives in McKenziehaven, works at Romaguera-Jacobson`, `To-dos done: 7 of 20` |
| `42` | `No user with id 42.` |

To test the "no connection" message, switch off your Wi-Fi, or in DevTools open the **Network** tab and change "No throttling" to **Offline**. Then click **Look up**.

**Rule:** put the data on the page with `createElement` and `textContent`, not `innerHTML` (remember the warning in [chapter 20](../20-dom-basics/notes.md)).

<details>
<summary>Hint 1</summary>

Start from the "Loading and error states" example in the notes. Listen for `submit` on the form instead of `click` on the button.

</details>

<details>
<summary>Hint 2</summary>

`const [user, todos] = await Promise.all([...])` with two requests inside. For the count, `filter` the to-dos that are `completed` ([chapter 13](../13-array-methods/notes.md)) and take the `length`.

</details>

<details>
<summary>Hint 3</summary>

To tell a 404 apart from other errors, the error has to carry the status. One neat way is a small `HttpError` class that extends `Error` and has a `status` property ([chapter 27](../27-classes/notes.md)), thrown by your `getJSON` helper. A timeout is an error whose `name` is `"TimeoutError"`.

</details>

---

## Before you move on

Your lookup page only sends a request when someone clicks the button. Now imagine it searched *as you type*. Typing "Clementine" would fire ten requests in about a second, and the answers could even arrive in the wrong order.

[Chapter 34: Debounce and Throttle](../34-debounce-and-throttle/notes.md) fixes exactly that. Debounce waits until you stop typing, and `AbortController` cancels the requests you no longer need. 🙂
