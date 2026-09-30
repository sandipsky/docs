# 30 Axios: Exercises

**How to do these:**

- Work in your practice app, one folder per exercise: `src/ch30/ex1/`, and so on.
- Install Axios first (`npm install axios`) and make `src/api/client.ts` as in the notes.
- Exercises 2 to 4 use the practice API. Set up json-server as in the notes, then keep it running with `npm run api` in a second terminal, next to `npm run dev`.
- Keep the DevTools **Network** tab open. Click any request to see its address, headers, and response.
- An exercise is done when it works in the browser, VS Code shows no red squiggles, `npx tsc -b` prints nothing, and the Console has no unexpected errors.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Surprise me, the Axios way

Your "Surprise me!" meal picker from chapter 18 works. Time to see how it looks with Axios.

In `src/ch30/ex1/Ex1.tsx`:

1. Rebuild [chapter 18's exercise 1](../18-fetching-data/exercises.md): a **Surprise me!** button that loads a random meal from `/random.php` and shows its name and thumbnail.
2. Use the `mealDb` instance from `client.ts`, so the address in your component is just `"/random.php"`.
3. Give the request a generic, so `response.data` is typed. Keep loading, error, and meal as three pieces of state.
4. Log `response.status` and `response.headers["content-type"]` once, and write what you saw in a comment.
5. **Break it on purpose:** put a typo in `mealDb`'s `baseURL` domain. Click the button and write down the exact error message your page shows, and the value of `err.code` (log it). Then fix the typo.
6. Count the lines inside your click handler, and in the chapter 18 version. Write both numbers in a comment.

<details>
<summary>Hint 1</summary>

The random endpoint still answers with an array holding one meal: `{ meals: [ ... ] }`. With Axios, that's `response.data.meals?.[0]`.

</details>

<details>
<summary>Hint 2</summary>

To read `err.code` in the `catch`, narrow first: `if (axios.isAxiosError(err)) console.log(err.code);`. A domain that doesn't exist means no answer ever came back, so there's no `err.response` at all.

</details>

---

## Exercise 2 (Easy): Your reading list, from your own API

You've got a real API on your own computer. Let's use it.

1. With `npm run api` running, visit `http://localhost:3001/books` in the browser. Then try `http://localhost:3001/books/2` and `http://localhost:3001/books?status=want`. Write in a comment what each one returned.
2. Make `src/api/books.ts` as in the notes (type it, don't paste).
3. In `src/ch30/ex2/Ex2.tsx`, show every book with its title, author, and page count, using `getBooks`. Include loading, error, and empty states.
4. Below the list, add a **Look up book 999** button that calls `getBook("999")`. When it fails with a 404, show `That book isn't on your list.` For any other failure, show a general message.
5. Stop `npm run api` and click the button again. Your page should say something different from the 404 case, because no answer arrived at all. Start the API again afterwards.

<details>
<summary>Hint 1</summary>

The 404 check is `axios.isAxiosError(err) && err.response?.status === 404`. The `?.` matters: when the server isn't running, there is no `response`.

</details>

<details>
<summary>Hint 2</summary>

Keep the lookup's result and error in their own state, separate from the list's. The list shouldn't disappear just because one lookup failed. That's the same "two separate loading states" lesson as chapter 18's exercise 5.

</details>

---

## Exercise 3 (Medium): Add, finish, delete

A reading list you can't change isn't much use. Time for POST, PATCH, and DELETE.

In `src/ch30/ex3/Ex3.tsx`, starting from your exercise 2 list:

1. An **Add a book** button that calls `addBook` with hard-coded values (for example `Project Hail Mary` by Andy Weir, 476 pages, status `"want"`). No form yet: that's [chapter 33](../33-react-hook-form/notes.md).
2. A **Mark finished** button on each book that isn't finished yet, using `updateBook(book.id, { status: "finished" })`.
3. A **Delete** button on each book, using `deleteBook`.
4. After **every** change, reload the list from the server, so the page shows what's really saved.
5. While a change is being saved, disable that button, so a double click can't add two books.
6. Open `db.json` in VS Code while you click. Watch your changes appear in the file. Look at the id json-server made for the new book.
7. When it all works, write a comment answering: how many places in your code had to remember to reload the list? What would happen if you forgot one?

**What you should see:** every click changes the list within a moment, and a page refresh shows the same list, because it's really saved.

<details>
<summary>Hint 1</summary>

One way to reload: move the loading code out of the effect into a `loadBooks` function, call it from the effect, and call it again after each change. Another way: keep a `reloadCount` number in state, put it in the effect's dependency array, and add one to it after each change.

</details>

<details>
<summary>Hint 2</summary>

Each handler is `async`, and follows the same shape: set a "saving" state, `await` the change, reload, then clear the saving state in a `finally`. Notice how often you're writing that shape. Remember the number for chapter 31.

</details>

---

## Exercise 4 (Medium): Interceptors and friendly errors

Your API calls work. Now make them easier to debug, and kinder to the people using your app.

1. **A logger.** In `client.ts`, add a request interceptor to `api` that logs the method and URL of every request, like `[api] GET /books`. Only log while `import.meta.env.DEV` is true.
2. **A fake login.** Add the pretend `Authorization` header from the notes. Check in the Network tab that `/books` requests carry it, and that `mealDb` requests from exercise 1 **don't**.
3. **Break it on purpose:** delete the `return config` line from your request interceptor. Write down exactly what TypeScript says. Then put it back.
4. **Friendly messages.** Make `src/api/errors.ts` with a function `getErrorMessage(err: unknown): string` that turns any error into a sentence a normal person understands:
   - a 404: `We couldn't find that.`
   - a 500 or above: `The server had a problem. Please try again.`
   - a timeout: `The server took too long to answer.`
   - no answer at all: `Couldn't reach the server. Check your connection.`
   - anything else: a general message.
5. Use `getErrorMessage` in your exercise 2 and 3 components instead of `err.message`.
6. **Force a timeout.** Add a temporary test button that calls `api.get("/books", { timeout: 10 })` (just 10 milliseconds), and set the Network tab's throttling to **Slow 3G**. Click it and confirm your timeout message appears. Turn throttling off and remove the button afterwards.

<details>
<summary>Hint 1</summary>

Check things in order, from most specific to least: is it an Axios error? Did the server answer (`err.response`)? What was the status? If there was no answer, was it a timeout (`err.code === "ECONNABORTED"`)? Everything else falls through to the general message.

</details>

<details>
<summary>Hint 2</summary>

A timeout's exact `err.code` can depend on your Axios settings. If `"ECONNABORTED"` doesn't match, log `err.code` and `err.message` during step 6 and see what you really get. Checking real values beats guessing.

</details>

---

## Exercise 5 (Challenge): Recipe search, the Axios way

Rebuild the heart of the [Recipe Finder](../21-project-recipe-finder/notes.md) search, with everything this chapter taught. Combines chapters 18, 20, and 21.

1. Make `src/api/meals.ts` with a `Recipe` type (`id`, `name`, `thumbnail`) and a function:

   ```ts
   export async function searchRecipes(query: string, signal?: AbortSignal): Promise<Recipe[]>
   ```

   It uses `mealDb` with `params` (no hand-built query string), passes the `signal` on to Axios, handles `{ meals: null }`, and converts TheMealDB's field names into your `Recipe` type.
2. Write a `useRecipeSearch(query)` hook in `src/ch30/ex5/useRecipeSearch.ts`, like chapter 21's, but cancel stale requests with an `AbortController` instead of an `ignore` flag. An empty query does no request.
3. In `Ex5.tsx`, a search box feeding the query through `useDebounce` (400ms, from [chapter 20](../20-custom-hooks/notes.md)), then into your hook. Show loading, error, empty, and results states.
4. A cancelled request must **never** show an error message. Throttle to Slow 3G, type `chicken`, pause, then quickly change it to `beef`. The Network tab should show a `(canceled)` request, and your page should just show beef results.
5. Search for `chicken & rice` and check the real request address in the Network tab. Write in a comment what Axios turned it into.
6. Compare your hook with chapter 21's `useRecipeSearch`. What got shorter? What didn't? Write two sentences.

**Keep `src/api/meals.ts`.** Chapter 31 uses `searchRecipes` again.

<details>
<summary>Hint 1</summary>

In the hook's `catch`, the order of checks matters: `axios.isCancel(err)` first (return quietly), then everything else. A cancel is also an Axios error, so checking `isAxiosError` first would show it as a failure.

</details>

<details>
<summary>Hint 2</summary>

The empty-query guard goes at the top of the effect, before the `AbortController` is made. Clear the results and return early, just like chapter 21's version.

</details>

<details>
<summary>Hint 3</summary>

For question 6, the honest answer is: the request itself got shorter (no `response.ok`, no `json()`, no `encodeURIComponent`), but the loading, error, and cancelling code around it barely changed. Keep that thought for the next chapter.

</details>
