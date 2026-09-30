# 32 Zod: Exercises

**How to do these:**

- Work in your practice app, one folder per exercise: `src/ch32/ex1/`, and so on.
- Install Zod if you haven't yet: `npm install zod`.
- Exercise 4 uses the practice API. Keep it running with `npm run api` in a second terminal, next to `npm run dev`. Exercise 3 uses TheMealDB, so you need to be online.
- Keep the Console open. Zod's messages are the whole point of this chapter, so read them properly.
- An exercise is done when it works in the browser, VS Code shows no red squiggles, `npx tsc -b` prints nothing, and the Console has no unexpected errors.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Check the to-do list

Chapter 10's to-do app saved tasks shaped like `{ id: string; text: string; done: boolean }`, and loaded them back with `as Task[]`. Write the schema that checks them for real.

1. In `src/ch32/ex1/task.ts`, write `TaskSchema`: `id` is a string, `text` is a trimmed string with at least 1 character (message: `A task needs some text`), and `done` is a boolean.
2. Export the type with `z.infer`. Hover over it in VS Code and check it matches chapter 10's `Task`.
3. Also export `TaskListSchema`: an array of tasks.
4. In `Ex1.tsx`, make an array of test values and run each through `TaskListSchema.safeParse` when a **Check** button is clicked. For each one, log `OK` and the data, or each issue as `path → message`. The test values:
   - a good list of two tasks
   - a list where one task has `done: "yes"`
   - a list where one task has `text: "   "`
   - a list where one task has no `id`
   - a list where one task has an extra `priority: "high"`
5. **Before** you click, write down in a comment what you expect for each one. Then click and compare. Which one surprised you?
6. Add a second button that calls `TaskListSchema.parse` (not `safeParse`) on the `done: "yes"` list. What does the Console say? Then wrap it in `try`/`catch` and log `z.prettifyError(error)` instead.

<details>
<summary>Hint 1</summary>

For an item inside an array, the `path` includes its index. `[1, "done"]` joined with `"."` reads as `1.done`: "the task at index 1, its `done` field".

</details>

<details>
<summary>Hint 2</summary>

In a `catch`, `error` is `unknown` ([TypeScript chapter 13](../../TypeScript/13-async-and-apis/notes.md)). Narrow it with `error instanceof z.ZodError` before you hand it to `z.prettifyError`.

</details>

<details>
<summary>Hint 3</summary>

The `priority` one doesn't fail at all. Look closely at the data it logs. The notes' section "Extra keys are dropped" explains what happened.

</details>

---

## Exercise 2 (Easy): A `useLocalStorage` that can't be fooled

Your `useLocalStorage` hook from [chapter 20](../20-custom-hooks/notes.md) does `JSON.parse(saved) as T`. That's another promise. Make it check.

1. Copy the hook into `src/ch32/ex2/useLocalStorage.ts`.
2. Give it a schema as a second argument, so it's called like `useLocalStorage("ch32-tasks", TaskListSchema, [])`. Reuse the schema from Exercise 1.
3. Inside, replace the `as T` with `safeParse`. If the saved value fails, use `initialValue`, and log a warning with `z.prettifyError` so you can see why.
4. In `Ex2.tsx`, build a tiny task list that uses it: add a task, tick a task. Refresh, and everything should still be there.
5. Hover over the `tasks` variable. It should be `Task[]`, worked out from the schema, with no `<Task[]>` written anywhere.
6. Now break the saved data. Open DevTools → **Application** → **Local Storage**, and edit the value to each of these in turn, refreshing after each one:
   - `not json at all`
   - `{"hello": 1}`
   - `[{"id": 1, "text": "Buy milk", "done": false}]`
   - `[]`

   The first three must start with an empty list and a warning in the Console, never a white screen. The last one is fine: it's a valid, empty list.

<details>
<summary>Hint 1</summary>

The type of a schema parameter, where `T` is the data it checks for, is `z.ZodType<T>`. Put it before `initialValue`, and TypeScript works out `T` from the schema you pass.

</details>

<details>
<summary>Hint 2</summary>

There are two different kinds of failure: text that isn't JSON (so `JSON.parse` throws), and JSON in the wrong shape (so `safeParse` fails). The notes' `loadSettings` handles both.

</details>

<details>
<summary>Hint 3</summary>

Something to think about, as a comment: after a failed load, the hook's effect saves `initialValue` straight back, so the bad data is gone for good. For a to-do list that's fine. When might quietly deleting someone's saved data be a problem?

</details>

---

## Exercise 3 (Medium): TheMealDB, checked and reshaped

In [chapter 31's exercise 4](../31-tanstack-query/exercises.md), you added `getCategories()` and `getMealsByCategory()` to `src/api/meals.ts`, each with a hand-written type. Swap those promises for proofs, then add a new function.

1. **`getMealsByCategory`**: `filter.php` replies in the same shape as `search.php`. Check its reply with the notes' `MealListSchema`. Does it need any changes? (Try it and see.)
2. **`getCategories`**: `list.php?c=list` replies with `{ meals: [{ strCategory: "Beef" }, ...] }`. Yes, the key is called `meals` even though they're categories. Write a schema with a `.transform` so the function returns a plain `string[]` of names, like `["Beef", "Breakfast", ...]`.
3. **A new one, `getCategoryCards`**: `categories.php` replies with `{ categories: [...] }`, where each item has `idCategory`, `strCategory`, `strCategoryThumb` and `strCategoryDescription`. Transform each into your own `Category` type: `{ id, name, thumbnail, description }`, and export the type with `z.infer`.
4. In `Ex3.tsx`, show the category cards (picture and name) with `useQuery` and the key `["categoryCards"]`. Clicking a card shows that category's meals below, using `getMealsByCategory`.
5. No `strSomething` names anywhere outside `meals.ts`. Search your `src/ch32/ex3/` folder to check.
6. **Break it on purpose.** In your category schema, rename `strCategory` to `strCategoryName`. Reload. Write down what the page shows, roughly how long it took to show it, and the exact message `z.prettifyError` gives. Then undo it.
7. **Break it another way.** Change `idCategory: z.string()` to `z.number()`. What's the message now? This time the server is right and *your* schema is wrong. Zod catches wrong assumptions on your side too.

<details>
<summary>Hint 1</summary>

A `.transform` can go on the **outer** object, not just on each item. For `getCategories`, the outer transform can pull out `data.meals` and map each one to its `strCategory`. Then the function returns exactly the `string[]` its callers want.

</details>

<details>
<summary>Hint 2</summary>

For step 6, it takes several seconds because TanStack Query retries 3 times first. The notes show a `retry` function that skips retrying a `ZodError`. It works in any `useQuery`, not just `booksQuery`.

</details>

<details>
<summary>Hint 3</summary>

The descriptions are long. A transform can do more than rename: it can also shorten, join, or work things out. If you want a one-line summary on each card, the transform is a fine place to make it.

</details>

---

## Exercise 4 (Medium): The reading list can't lie any more

Apply the notes to your real reading-list code, then try to fool it.

1. Replace the hand-written types in `src/api/books.ts` with the schemas from the notes. Keep the exported type names (`Book`, `NewBook`, `BookStatus`), so nothing else has to change. Run `npx tsc -b`. It should print nothing, which proves every other file still compiles.
2. Make `getBooks`, `getBook`, `addBook` and `updateBook` all parse the server's reply. Use `<unknown>` instead of `<Book[]>` or `<Book>` on every request.
3. Your chapter 31 reading list should work exactly as before. Check the Network tab: the same requests, the same results.
4. Now the experiments. For each one, edit `db.json` and save, reload the page, and write down what the page shows and what the Console says. Put the book back the way it was after each one.
   1. One book has `"pages": "lots"`.
   2. One book has no `"title"` at all.
   3. One book has `"status": "abandoned"`.
   4. One book has an extra `"rating": 5`. Does anything break? Where did `rating` go?
5. Change the list's error display, so users see a friendly sentence and the Console gets the `z.prettifyError` details.
6. Add the `retry` function from the notes to `booksQuery`. Repeat experiment 1 and time how long the error takes to appear, before and after.
7. Answer in a comment: before this chapter, what would experiment 1 have done to your page? Where would the bug have shown up, and how would you have found the cause?

<details>
<summary>Hint 1</summary>

If `npx tsc -b` complains about another file after step 1, you've probably renamed or forgotten an export. The other files import `Book`, `NewBook`, `BookStatus` and the five functions, so those names must all still exist.

</details>

<details>
<summary>Hint 2</summary>

Chapter 30 said json-server 1 reloads `db.json` when you save it by hand. If your edit seems to be ignored, check the terminal running `npm run api`: a missing comma makes the file invalid JSON, and json-server says so there.

</details>

<details>
<summary>Hint 3</summary>

For experiment 4, open the TanStack Query devtools panel and look at the cached data for `["books"]`. Compare it with `http://localhost:3001/books` in a browser tab.

</details>

---

## Exercise 5 (Challenge): A sign-up form, checked by Zod

Combine [chapter 09](../09-forms/notes.md)'s controlled inputs with a Zod schema. Keep it in plain `useState`: no form library yet. That's the point.

The form has **Name**, **Email**, **Password**, **Confirm password**, and an **I agree to the terms** checkbox.

1. In `src/ch32/ex5/signUpSchema.ts`, write `SignUpSchema`:
   - name: trimmed, at least 2 characters
   - email: a valid email address
   - password: at least 8 characters, **and** at least one digit (look up `.regex()` in the Zod docs)
   - confirm password: must match the password, with the error on the confirm field
   - agree: must be `true` (look up `z.literal`)

   Give every rule a friendly message, and export `type SignUp = z.infer<typeof SignUpSchema>`.
2. Build the form in `Ex5.tsx`, chapter 09 style: controlled inputs, values in `useState`, and a real `<label>` for every field.
3. On submit, `safeParse` the values. If it fails, show the first message for each field under that field, using `z.flattenError`. If it passes, log `result.data` and show `Welcome, Maya!` in place of the form.
4. No red before the first submit. After a failed submit, the errors update as the person types, so each one disappears the moment it's fixed.
5. Link each error to its input: give the error `<p>` an `id`, point the input's `aria-describedby` at it, and set `aria-invalid` on the input while it has an error. ([Chapter 38](../38-accessibility/notes.md) explains why. For now, just wire it up.)
6. Test it by making every mistake at once. Each field should show its own error, including `Passwords don't match`.
7. Finally, count the lines in `Ex5.tsx` (not the schema), and write the number in a comment. Also count your `useState` calls and your `onChange` handlers. You'll rebuild this exact form in [chapter 33](../33-react-hook-form/notes.md) and compare.

<details>
<summary>Hint 1</summary>

Your state can't be typed as `SignUp`. `SignUp` says `agree` is `true`, but the box starts unticked. The form's values *while someone is filling it in* aren't the same thing as *valid data*. Give the state its own type (with `agree: boolean`), and let `safeParse` turn it into a `SignUp`.

</details>

<details>
<summary>Hint 2</summary>

You don't need a piece of state for the errors. Keep one boolean, `hasSubmitted`. Then, during render, run `safeParse` on the current values when `hasSubmitted` is `true`. The errors are a **derived value** ([chapter 08](../08-state/notes.md)), so they're always up to date, and requirement 4 comes for free.

</details>

<details>
<summary>Hint 3</summary>

`z.flattenError(result.error).fieldErrors.confirmPassword?.[0]` is either the first message or `undefined`. That's exactly the shape you need for `{message && <p id="...">{message}</p>}`.

</details>

<details>
<summary>Hint 4</summary>

For the checkbox, remember chapter 09: `checked={values.agree}` and `event.target.checked`, not `value`.

</details>
