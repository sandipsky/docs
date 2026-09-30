# 31 TanStack Query: Exercises

**How to do these:**

- Work in your practice app, one folder per exercise: `src/ch31/ex1/`, and so on.
- Install TanStack Query and its devtools, and set up `QueryClientProvider` and `ReactQueryDevtools` in `main.tsx`, as in the notes.
- Reuse your `src/api/` files from chapter 30: `client.ts`, `books.ts`, and `meals.ts`.
- Exercises 2, 3, and 5 use the practice API. Keep it running with `npm run api` in a second terminal.
- Keep two panels open: the DevTools **Network** tab, and the TanStack Query devtools (the floating button in the corner of your page).
- An exercise is done when it works in the browser, VS Code shows no red squiggles, `npx tsc -b` prints nothing, and the Console has no unexpected errors.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): The recipe search, one more time

You've written this search three times now: by hand in chapter 18, with a hook in chapter 21, and with Axios in chapter 30. This is the last time, promise.

In `src/ch31/ex1/Ex1.tsx`:

1. A search box whose text goes through `useDebounce` (400ms) and then into `useQuery`, using `searchRecipes` from `src/api/meals.ts`.
2. Show four states: "Type something to search", "Searching...", an error, and the results (or "No recipes found").
3. Don't run a request for an empty search. Pass `signal` on to Axios.
4. Search `chicken`, then `beef`, then `chicken` again. Write down what happened on the third search, and what the Network tab showed.
5. **Break it on purpose (1):** take `query` out of the query key, so it's just `["recipes"]`. Search for two different things. Write down what you see, and why. Then put it back.
6. **Break it on purpose (2):** move your `isPending` check above the empty-search check. Clear the box. Write down what the page says, and why. Then put it back.
7. Count the lines in your component and compare them with your chapter 18 version. Write both numbers in a comment.

<details>
<summary>Hint 1</summary>

The key and the function go together: `queryKey: ["recipes", debouncedQuery]` and `queryFn: ({ signal }) => searchRecipes(debouncedQuery, signal)`. Use the *debounced* value in both, not the live one.

</details>

<details>
<summary>Hint 2</summary>

For step 6: a query with `enabled: false` and no data is pending, but not fetching. It will never leave that state on its own. Reread the "Watch out for this one" part of the notes.

</details>

---

## Exercise 2 (Easy): Cache experiments

Time to watch the cache work, with the reading list. No new features, just experiments. Write what you see in comments as you go.

In `src/ch31/ex2/Ex2.tsx`:

1. Build `BookCount` and `BookTitles` from the notes, both using the key `["books"]`. Render both.
2. **One request:** check the Network tab. How many `GET /books` requests were there? In the devtools panel, how many components does it say are using `["books"]`?
3. **Instant return:** add a **Show / hide** button around both components. Hide them, and look at the query's state in the devtools. Show them again. Did you see "Counting..."? Did a request run?
4. **Refetch on focus:** click into another window, then back into the browser. Watch the Network tab.
5. **Fresh for a while:** give both queries `staleTime: 30 * 1000`. Repeat step 4 straight away, then again after 30 seconds. Watch the query's label change in the devtools.
6. **Thrown away:** give both queries `gcTime: 5000`. Hide the components, wait 10 seconds, and watch the devtools. Then show them again. What's different from step 3?
7. **Server state, for real:** with the page open, edit `db.json` by hand and change a book's title. Save. Look at your page (nothing changes yet). Now click into another window and back. What happened, and which default made it happen?

<details>
<summary>Hint 1</summary>

The number next to a query in the devtools is how many components (called **observers**) are using it right now. When it drops to 0, the query becomes **inactive**, and the `gcTime` countdown starts.

</details>

<details>
<summary>Hint 2</summary>

If step 7 doesn't update, check your `staleTime`. From step 5, the data may still count as fresh, and fresh data isn't refetched on focus. Set `staleTime` back to the default and try again.

</details>

---

## Exercise 3 (Medium): The reading list, with mutations

In chapter 30's exercise 3, you reloaded the list by hand after every change. Let's do it properly.

In `src/ch31/ex3/Ex3.tsx`:

1. Show every book with `useQuery` and the key `["books"]`.
2. An **Add a book** button (hard-coded values are fine) using `useMutation` with `addBook`.
3. A `<select>` on each book to change its status between `want`, `reading`, and `finished`, using `updateBook`.
4. A **Delete** button on each book, using `deleteBook`.
5. Every mutation invalidates `["books"]`. Disable each control while its mutation is pending.
6. A separate `ReadingSummary` component, placed somewhere else on the page, that shows `2 want to read · 1 reading · 2 finished`. It gets **no props**: it calls `useQuery` with the same key. It must update by itself after every change.
7. Add three filter buttons: **Want**, **Reading**, **Finished**. Add a function `getBooksByStatus(status: BookStatus)` to `books.ts` that uses `params: { status }`, and give the filtered list the key `["books", { status }]`. Change a book's status and check that the filtered list updates too, even though you only invalidated `["books"]`.
8. In a comment, compare this with chapter 30's exercise 3. How many "reload the list" calls did you need this time?

<details>
<summary>Hint 1</summary>

`mutationFn` takes one argument. For the status change, pass an object and unpack it: `({ id, status }: { id: string; status: BookStatus }) => updateBook(id, { status })`.

</details>

<details>
<summary>Hint 2</summary>

The counts in `ReadingSummary` are **derived**: `filter` the books during render and count them ([chapter 08](../08-state/notes.md)). Don't store them in state.

</details>

<details>
<summary>Hint 3</summary>

For step 7: invalidating `["books"]` matches every key that *starts with* `"books"`. So `["books", { status: "want" }]` is marked out of date too. That's why keys go from general to specific.

</details>

---

## Exercise 4 (Medium): One query waits for another

Back to [chapter 18's exercise 5](../18-fetching-data/exercises.md): choose a category, then see its meals. That needed two effects and two sets of state. Let's see how it looks now.

In `src/ch31/ex4/Ex4.tsx`:

1. Add two functions to `src/api/meals.ts`: `getCategories()` (from `/list.php`, with `params: { c: "list" }`) and `getMealsByCategory(category: string, signal?: AbortSignal)` (from `/filter.php`, with `params: { c: category }`).
2. A `<select>` of categories from a query with the key `["categories"]`. Categories hardly ever change, so give it `staleTime: Infinity`.
3. A second query for the chosen category's meals. It must not run until a category is chosen.
4. A default `-- choose a category --` option. Choosing it again clears the meal list.
5. Choose **Beef**, then **Chicken**, then **Beef** again. The third choice should be instant.
6. While a *background* refetch runs, show a small `Updating...` next to the list, without hiding it.
7. Count your lines against your chapter 18 version, and write both numbers in a comment. Did you need to do anything special to keep the two loading states separate?

<details>
<summary>Hint 1</summary>

This is called a **dependent query**: one that waits for something else first. It's just `enabled`. Something like `enabled: category !== ""`, with `category` in the key too.

</details>

<details>
<summary>Hint 2</summary>

Step 6 is `isFetching`, not `isPending`. `isPending` means "no data yet". `isFetching` means "a request is running right now", even when there's data on screen.

</details>

---

## Exercise 5 (Challenge): Instant status changes, custom hooks, and a test

Make the reading list feel instant, then prove it with a test. Combines this chapter with chapters 20 and 28.

1. In `src/api/bookQueries.ts`, write `booksQuery` with `queryOptions`, a `useBooks()` hook, and a `useUpdateBook()` hook that returns a mutation for changing a book.
2. Make `useUpdateBook` **optimistic**, the cache way: cancel `["books"]` queries, save a snapshot, change the book in the cache, roll back on error, and invalidate when settled.
3. Rebuild exercise 3's status `<select>` with your hooks. Throttle to **Slow 3G**: the status should change the moment you choose it, long before the request finishes.
4. **Force a failure:** stop `npm run api`, then change a status. It should change, then snap back. Show a message like `Couldn't save that change, so it was undone.`
5. You'll use this exact pattern in the [task board project](../37-project-task-board/notes.md) for moving tasks between columns. Write a comment explaining, in your own words, why step 2's "cancel" part is needed.
6. **A test.** Add `QueryClientProvider` to your `renderWithProviders`, with a fresh `QueryClient` and `retry: false`. With `vi.mock("../api/books.ts")`, write a test that the list shows the books that `getBooks` returns.
7. **Bonus test:** make `updateBook` reject, change a book's status with `user-event`, and check that the old status comes back.

<details>
<summary>Hint 1</summary>

The cache change in step 2 is a `map`: every book stays the same, except the one whose `id` matches, which gets `{ ...book, ...changes }`. That's [chapter 11](../11-updating-objects-and-arrays/notes.md)'s copying rule, applied to the cache.

</details>

<details>
<summary>Hint 2</summary>

In step 4, the refetch in `onSettled` fails too, because the server is still stopped. Once its retries run out, the *list* query is in an error state as well. If your component does `if (isError) return ...`, the whole list disappears. Try showing the list whenever `data` exists, and the error as a small message above it.

</details>

<details>
<summary>Hint 3</summary>

For step 7, `user.selectOptions(select, "finished")` from [chapter 28](../28-testing/notes.md) chooses an option. Give each select a label (like `Status of Dune`), so you can find it with `getByRole("combobox", { name: ... })`. A `<select>` counts as a "combobox" for `getByRole`. To wait for the old value to come back, `findByDisplayValue` works on a select: it matches the text of the chosen option.

</details>

<details>
<summary>Hint 4</summary>

If the bonus test waits a long time and fails, check that `retry: false` is really in your test `QueryClient`. Mutations don't retry by default, but the refetch after the rollback is a query, and queries do.

</details>
