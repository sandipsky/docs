# 33 React Hook Form: Exercises

**How to do these:**

- Work in your practice app, one folder per exercise: `src/ch33/ex1/`, and so on.
- Install the libraries if you haven't yet: `npm install react-hook-form @hookform/resolvers`.
- Exercises 3 and 4 use the practice API and your chapter 31 hooks in `src/api/bookQueries.ts`. Keep the API running with `npm run api` in a second terminal, next to `npm run dev`.
- Exercise 5 uses Vitest and React Testing Library from [chapter 28](../28-testing/notes.md). Run `npm test` in another terminal.
- Test every form by **pressing Enter** as well as clicking the button, just like in chapter 09.
- An exercise is done when it works in the browser, VS Code shows no red squiggles, `npx tsc -b` prints nothing, and the Console has no unexpected errors.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Chapter 09's contact form, rebuilt

A contact form for a bookshop: **Name**, **Email**, **Topic** (a select: General, Order question, Complaint) and **Message** (a textarea).

1. In `src/ch33/ex1/ContactOld.tsx`, build it chapter 09 style: one `useState` per field, and errors shown only after a field has been left (`onBlur`). The rules: name is required, email contains an `@`, and the message is 10 to 500 characters, with a live `123 / 500` counter under it.
2. In `ContactNew.tsx`, build the same form with React Hook Form and **built-in rules only** (no Zod yet). Use `mode: "onTouched"` so errors appear at the same moments as the old version.
3. Show each error under its field. Make the live counter with `watch("message")`.
4. On submit, log the values, then `reset()` the form.
5. Count the lines in both files, and write both numbers in a comment at the top of `ContactNew.tsx`.
6. In React DevTools, open the **Components** tab settings (the cog) and turn on **Highlight updates when components render**. Type a sentence into **Name** in each version. Which one flashes on every key? Now type into **Message** in the new version. Why does it flash there? Write both answers in a comment.
7. The old version disabled Send until everything was valid. The new one lets people press it, then shows exactly what to fix and moves focus to the first problem. Which do you prefer, and why? One or two sentences in a comment.

<details>
<summary>Hint 1</summary>

Built-in rules go in `register`'s second argument, each with its own message: `{ required: "Please enter your name" }`, or `{ minLength: { value: 10, message: "..." } }`.

</details>

<details>
<summary>Hint 2</summary>

For the email, `pattern` takes a regular expression and a message ([JavaScript chapter 37](../../JavaScript/37-regular-expressions/notes.md)). Or `validate` takes a function that returns `true` when the value is fine, or an error message when it isn't.

</details>

<details>
<summary>Hint 3</summary>

For the counter, give `message` a starting value of `""` in `defaultValues`. Then `watch("message")` is always a string, and `.length` just works.

</details>

---

## Exercise 2 (Easy): Your sign-up form, with its schema plugged in

In [chapter 32's exercise 5](../32-zod/exercises.md), you built a sign-up form with `useState` and Zod, and counted its lines. Rebuild it with React Hook Form, using **the same schema file, unchanged**.

1. In `src/ch33/ex2/Ex2.tsx`, import `SignUpSchema` from your chapter 32 file, and create the form with `resolver: zodResolver(SignUpSchema)`.
2. Register all five fields, including the checkbox. Show each error under its field, linked with `aria-invalid` and `aria-describedby`, as in the notes.
3. On a successful submit, show `Welcome, Maya!` (with their name) in place of the form.
4. **Break it on purpose.** Change one `register("confirmPassword")` to `register("confirmPasword")`. Write down the exact TypeScript error in a comment. Then try `errors.emial` and write that one down too. Put both back.
5. Make every mistake at once and submit. Then fix the fields one by one, and watch each error disappear as you type. Does `Passwords don't match` disappear when you fix the **password** box to match, or only when you type in the confirm box? Write down what you see.
6. Count the lines, the `useState` calls, and the `onChange` handlers. Write them next to your chapter 32 numbers.
7. **Break it another way.** In a copy of the schema, add `newsletter: z.boolean().default(false)`, and use it with `useForm<SignUp>`. Read the error (it's mistake 10 in the notes). Fix it by removing `<SignUp>`.

<details>
<summary>Hint 1</summary>

If TypeScript complains about `agree: false` in `defaultValues`, that's chapter 32's hint about the checkbox, back again: the schema says `agree` must be `true`, and the form's types come from the schema. Two ways out: leave `agree` out of `defaultValues` (an unticked checkbox reads as `false` anyway), or write the rule as `z.boolean()` with a `.refine` that checks it's `true`, so the form is allowed to hold either value.

</details>

<details>
<summary>Hint 2</summary>

For step 5: after a failed submit, RHF re-checks **the field you're typing in**. The mismatch error lives on `confirmPassword`, so typing in the password box may not clear it. Look up the `deps` option of `register` in the React Hook Form docs. It tells RHF "when this field changes, re-check those fields too".

</details>

---

## Exercise 3 (Medium): "Add a book", for real

Build the reading list's real "Add a book" form, then break it on purpose to see why each piece is there.

1. In `src/ch33/ex3/AddBookForm.tsx`, build the form with four fields: title, author, pages, and status. Use `zodResolver(NewBookSchema)`, `defaultValues`, `valueAsNumber` for pages, and a `<select>` built from `BookStatusSchema.options`.
2. Every field has a label connected with `useId`, plus `aria-invalid` and `aria-describedby` on its error.
3. Submit through `useAddBook()` from `src/api/bookQueries.ts`. While saving, the button says `Saving...` and is disabled. After a successful save, `reset()`.
4. Put your chapter 31 book list (using `useBooks()`) under the form. A new book must appear in it without a reload.
5. After a save, show `Added Dune to your list.` above the form (with the real title). It should disappear as soon as the person starts typing the next title.
6. **Server errors.** Stop `npm run api` and submit a valid book. A message appears above the button, and everything typed is still there. Start the API again and submit: the message goes and the book saves.
7. **Break it on purpose**, one at a time. Write down what happens each time, then undo it:
   1. Remove `valueAsNumber`.
   2. Change `await addBook.mutateAsync(values)` to `addBook.mutate(values)`. Turn on **Slow 3G** throttling in the Network tab and watch the button.
   3. Move `reset()` above the `await`, then submit with the API stopped.
8. Type `   Dune   ` (with spaces) as the title and save. Look at `db.json`. What was saved, and why?

<details>
<summary>Hint 1</summary>

`mutateAsync` gives back the saved book, id and all. So `const saved = await addBook.mutateAsync(values)` lets you use `saved.title` in your message.

</details>

<details>
<summary>Hint 2</summary>

For step 5, `register` accepts its own `onChange` option, which runs as well as RHF's (mistake 3 in the notes). Hide the message there.

</details>

<details>
<summary>Hint 3</summary>

For step 8, think about who handed `onSubmit` its values. The resolver passes on Zod's **output**, not what was typed. Which rule in `BookSchema` changes the text?

</details>

---

## Exercise 4 (Medium): "Edit book", filled in when the data arrives

1. In `src/ch33/ex4/Ex4.tsx`, show the books with `useBooks()`, each with an **Edit** button. Clicking one stores that book's id in state, and renders `<EditBookPage id={editingId} />` below the list.
2. `EditBookPage` loads the book with `useBook(id)`, shows loading and error states, and only then renders `EditBookForm`, with a `key`.
3. Don't copy and paste the four fields from exercise 3. Move them into a `BookFields` component that both forms use.
4. **Save** is enabled only when something changed. **Discard changes** puts the saved values back. After a successful save, show `Saved.`, and Save disables again.
5. Save through your `useUpdateBook()` from chapter 31's exercise 5.
6. Turn on **Slow 3G**. Click Edit on one book, then quickly on another. The form must end up showing the second book, never the first one's values.
7. **An experiment.** Start editing a book's title, but don't save. Now change that same book's **author** by hand in `db.json`, then click into another window and back (chapter 31's refetch on window focus). What does the form show? Now try it with RHF's `values` option instead of the "wait, then build" pattern, and then with `resetOptions: { keepDirtyValues: true }` added. Write down what happens each time. Which would you want in a real app, and why? There's no single right answer.

<details>
<summary>Hint 1</summary>

For `BookFields`, React Hook Form exports types for the two things it needs: `UseFormRegister<NewBook>` for `register`, and `FieldErrors<NewBook>` for `errors`. Pass both in as props.

</details>

<details>
<summary>Hint 2</summary>

For step 4: after saving, `reset(values)` makes what you saved the new starting point, so `isDirty` goes back to `false`. Plain `reset()` goes back to the *old* starting values.

</details>

<details>
<summary>Hint 3</summary>

For step 6, the `key` on `EditBookForm` is what makes this safe. Try taking it out, and switch between books while one is loading. Can you get the wrong values to show?

</details>

---

## Exercise 5 (Challenge): A recipe form, with a list of ingredients and tests

Combine this chapter with Zod ([chapter 32](../32-zod/notes.md)), refs as props ([chapter 19](../19-refs/notes.md)), and testing ([chapter 28](../28-testing/notes.md)).

1. In `src/ch33/ex5/recipeSchema.ts`, write `RecipeSchema`:
   - name: trimmed, required
   - servings: a whole number from 1 to 12
   - category: one of a `z.enum` of your choice
   - ingredients: a list of `{ name, amount }` (both text, like `"Flour"` and `"200g"`). Each name is required, and there must be **at least one** ingredient.
   - method: at least 20 characters
2. In `RecipeForm.tsx`, use `useFieldArray` for the ingredients, with **Add ingredient** and **Remove** buttons. Start with one empty row. Allow removing the last row, so the "at least one" rule can really fail.
3. Accessible errors everywhere: every field, every ingredient row, and the whole-list error. Give each ingredient input a label like `Ingredient 1 name` (it can be visually hidden).
4. Make a reusable `TextField` component (label, input, error text, the `aria` wiring, and `useId` inside it) and use it for every text input. `{...register("name")}` must work on it.
5. `RecipeForm` takes a prop `onSubmit: (recipe: Recipe) => void`, so it can be tested without a server.
6. In `RecipeForm.test.tsx`, write these tests:
   1. Submitting the empty form shows `Please enter a name`, and does **not** call `onSubmit`.
   2. Removing the only ingredient and submitting shows your "at least one ingredient" message.
   3. Filling in everything (with two ingredients) and submitting calls `onSubmit` once, with exactly the right values. `servings` must be a number, and the name must be trimmed.
   4. After a failed submit, the first invalid field has focus.
7. **Extra challenge:** add a **Move up** button to each row, using `useFieldArray`'s `move` or `swap`. Check that a row's error moves with it.

<details>
<summary>Hint 1</summary>

For `TextField`, type the props as `ComponentProps<"input">` plus your own `label` and `error`. In React 19, `ref` is an ordinary prop ([chapter 19](../19-refs/notes.md)), so when you spread the rest of the props onto the real `<input>`, `register`'s `ref` goes along with them.

</details>

<details>
<summary>Hint 2</summary>

The whole-list error doesn't belong to any one input. Log `errors.ingredients` after submitting with no rows. Depending on whether rows were registered before, React Hook Form puts a list-level message at `errors.ingredients.root.message` or at `errors.ingredients.message`. Showing `errors.ingredients?.root?.message ?? errors.ingredients?.message` covers both.

</details>

<details>
<summary>Hint 3</summary>

Checking is async, so find error messages with `await screen.findByText(...)`. And read the notes' "Testing a form" part before test 3: `handleSubmit` calls your function with **two** arguments.

</details>

<details>
<summary>Hint 4</summary>

For test 4, `expect(element).toHaveFocus()` comes with jest-dom. Find the element the way a user would: `getByLabelText("Recipe name")` or similar.

</details>

<details>
<summary>Hint 5</summary>

Build it in small steps: name and servings with one test first, then the ingredients list, then the rest. A big form built all at once is a big form you can't debug (chapter 09 said the same about multi-step forms).

</details>
