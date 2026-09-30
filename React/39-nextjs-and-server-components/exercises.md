# 39 Next.js and Server Components: Exercises

**How to do these:**

- Work in `React/next-practice`, the Next.js app you made in the notes. These exercises build one small recipe site, so each one adds pages to the same app. In Next.js, folders are routes, so there's no `src/ch39/ex1/` this time. You'll make folders like `src/app/categories/` instead.
- Keep `npm run dev` running, and keep its terminal where you can see it. Server logs and server errors show up there now, as well as in the browser's Console.
- Next.js shows errors in an overlay on top of the page while you develop. Read it, then close or minimise it to see what a visitor would see.
- An exercise is done when it works in the browser, VS Code shows no red squiggles, `npx tsc --noEmit` prints nothing, and neither the terminal nor the Console shows unexpected errors.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Pages, a layout, and a dynamic route

Give the recipe site its skeleton.

1. Replace `src/app/page.tsx` with a short home page: a heading and one sentence. Add an `/about` page.
2. Replace the root layout with a header holding the site name and a nav: **Home**, **About**, and a link to one recipe, `/recipes/52772`. Use `Link` from `next/link`.
3. Make `src/app/recipes/[id]/page.tsx` show `Recipe id: 52772` (or whatever id is in the URL). Type `params` yourself, and `await` it.
4. Prove the layout doesn't re-mount. Make a small `VisitCounter` component (a button that counts its clicks) and put it in the header. Click it a few times, then move between the pages. The number should survive.
5. Change one nav `Link` into a plain `<a href>`. Click it, and watch the counter. Write down what happened and why, then change it back.
6. Break it on purpose: remove the `await`, and use `params.id` directly. Write down the exact error VS Code shows. Then put it back, and visit `/recipes` with no id. What do you get, and why?
7. If you have time: make the nav highlight the current page, like chapter 24's `NavLink`.

<details>
<summary>Hint 1</summary>

The counter needs `useState`, so its file starts with `"use client"`. The layout itself stays a Server Component: it just renders `<VisitCounter />`, like any other component.

</details>

<details>
<summary>Hint 2</summary>

For step 6: look at which folders have a `page.tsx`. A folder without one isn't a page, even if a folder inside it is.

</details>

<details>
<summary>Hint 3</summary>

For step 7: `usePathname()` from `next/navigation` gives you the current path, like `"/about"`. It's a hook, so the link component that uses it has to be a Client Component. Compare the path with the link's `href`.

</details>

---

## Exercise 2 (Easy): Fetch on the server, and prove it

Show TheMealDB's recipe categories, with no `useEffect` in sight.

1. In `src/lib/mealdb.ts`, write `getCategories()` for `https://www.themealdb.com/api/json/v1/1/categories.php` (or extend the one from the notes). Return your own `Category` type with an id, name, thumbnail and description. Check `response.ok`.
2. Make `/categories` a Server Component that awaits it, and shows each category's name and thumbnail. Add it to the nav. (A plain `<img>` is fine. ESLint may suggest Next.js's own `<Image>` component instead. That's a warning, not an error.)
3. Add a `console.log` that includes `typeof window`. Find every place its output appears. Write down how you can tell which one is the real one.
4. In the Network tab, reload and filter for `categories.php`. Then filter for `themealdb`. Why does the second filter find requests when the first finds none? Answer in a comment.
5. View Source (`Ctrl + U`) and search for "Seafood".
6. Find your `CategoryList` from chapter 18's exercise 4 in the playground. Count its lines, count your new page's lines, and write both numbers in a comment.
7. Break it: put a typo in the URL. What do you see in the browser, and what's in the terminal? (There's no `error.tsx` yet. That's exercise 4.)

<details>
<summary>Hint 1</summary>

For step 4: look at the **Type** column for the requests that `themealdb` finds. Your HTML contains `<img>` tags pointing at TheMealDB, and who loads the pictures?

</details>

---

## Exercise 3 (Medium): A recipe page with a small client island

Turn `/recipes/[id]` into a real recipe page, with just one interactive part.

1. Add `getMeal(id)` to `src/lib/mealdb.ts`, using `lookup.php?i=<id>`. Return your own `Meal` type (id, name, category, area, instructions, thumbnail), or `null` when TheMealDB answers `{ meals: null }`.
2. Make the page a Server Component that shows the recipe. For now, if `getMeal` returns `null`, show a short message. (Exercise 4 improves this.)
3. Add a `FavouriteButton` Client Component that toggles on and off, using `aria-pressed`. Pass it only the data it needs, as plain strings.
4. Make favourites survive a refresh with `localStorage`. You can reuse your `useLocalStorage` hook from [chapter 20](../20-custom-hooks/notes.md). If the terminal says `localStorage is not defined`, work out *why* before you fix it. Watch the Console for hydration warnings, too.
5. View Source. Is the button's HTML already in the page, before any JavaScript runs? Write down what that tells you about Client Components.
6. Break it on purpose, one at a time, and write down each error: (a) move the `useState` into the page itself; (b) add `"use client"` to the page file, keeping its `async` and `await`; (c) add an `onToggle` prop to the button's props type, and pass `onToggle={() => console.log("hi")}` from the page.

<details>
<summary>Hint 1</summary>

`data.meals?.[0]` gives you either the first meal or `undefined`, in one step. That covers both "no meals" and "empty list".

</details>

<details>
<summary>Hint 2</summary>

For step 4: a hook that reads `localStorage` inside its `useState` starting value runs during render, and Client Components render on the server too. Start with a safe default that's the same on both sides, then read the real value in a `useEffect` ([chapter 17](../17-effects/notes.md)), which only runs in the browser. Starting with the same value on both sides is also what stops the hydration warning.

</details>

---

## Exercise 4 (Medium): Loading, errors, and not found

Make the recipe page behave well when things are slow, broken, or missing.

1. Add a `loading.tsx` to `recipes/[id]`. To actually see it, slow `getMeal` down with `await new Promise((resolve) => setTimeout(resolve, 2000));`. Click through from the home page with a `Link`. What stays on screen while it loads? Remove the delay afterwards.
2. Replace exercise 3's "not found" message with `notFound()`, and add a `not-found.tsx` that links back to `/categories`. Try `/recipes/999999`, and check the header and nav are still there.
3. Add a root `src/app/not-found.tsx` too, and try `/nonsense`. Which of your two not-found pages shows, and why?
4. Add an `error.tsx` with a **Try again** button. To test it, make the page throw an error when the id is `crash`, and visit `/recipes/crash`.
5. Compare development with production. Stop the dev server, run `npm run build`, then `npm run start`, and visit `/recipes/crash` again. Write down the error message you see in each, and why they're different.
6. Remove the `if (!meal)` check for a moment. What does TypeScript say about `meal.name`? Put the check back, and notice that after `notFound()` you need no `!`.

<details>
<summary>Hint 1</summary>

The test crash can be one line at the top of the page, right after you await `params`: `if (id === "crash") throw new Error("The kitchen is on fire");`

</details>

<details>
<summary>Hint 2</summary>

For step 3: a `not-found.tsx` inside a folder is only used when code in that folder calls `notFound()`. A URL that matches no page at all goes to the one at the top of `app/`.

</details>

---

## Exercise 5 (Challenge): A reading list with Server Functions

The reading list from Level 4, the Next.js way: no json-server, no Axios, no TanStack Query.

1. Create `data/reading-list.json` (next to `package.json`) with three books copied from the playground's `db.json`, keeping the same fields: `id`, `title`, `author`, `pages`, `status`.
2. In `src/lib/reading-list.ts`, starting with `import "server-only";`, write `getBooks()` and `saveBooks(books)` using `node:fs/promises`.
3. A `/reading-list` page (a Server Component) lists the books with their status. Add it to the nav.
4. An **Add a book** form with title, author, pages, and a status `<select>`. It calls an `addBook` Server Function in `src/app/reading-list/actions.ts`.
5. `addBook` validates with a Zod schema like chapter 32's `NewBookSchema`: title and author required, pages a positive whole number, and status one of `"want"`, `"reading"` or `"finished"`. Use `useActionState` to show each field's error under that field.
6. When validation fails, the visitor's typing mustn't disappear. Try it first: you'll probably find it does.
7. A `SubmitButton` using `useFormStatus` that says **Adding...** while the form is pending. Add a one-second delay inside `addBook` so you can see it.
8. Call `revalidatePath` after saving. Then comment it out, add a book, and write down what happens. Put it back.
9. Give each book a **Remove** button that calls a second Server Function, `removeBook`. It must check that the id it's given really exists.
10. Try it in production: `npm run build`, then `npm run start`. Add a book. Then comment out `revalidatePath` again, rebuild, add another book, and reload the page. Explain what you see, using the caching section of the notes.
11. Answer in a comment at the top of `page.tsx`:
    - Anyone can call `removeBook`, not only your form. What stops a stranger emptying your list? What would you need to add?
    - What would it take to build this same feature in the Vite playground? List the pieces.

<details>
<summary>Hint 1</summary>

`FormData` values are always strings. `pages` arrives as `"310"`, not `310`. Zod's `z.coerce.number()` turns the string into a number before the other checks run.

</details>

<details>
<summary>Hint 2</summary>

For step 6: in React 19, a form is reset after its action finishes, even when your function returned errors. One fix: return what they typed as part of your state, next to the errors, and use it as each field's `defaultValue`.

</details>

<details>
<summary>Hint 3</summary>

For step 9: a Server Function can take extra arguments. `removeBook.bind(null, book.id)` makes a version with the id already filled in, which you can pass to a small form's `action`. A hidden `<input name="id">` works too. Either way, the id comes from the browser, so look it up before you trust it.

</details>

<details>
<summary>Hint 4</summary>

For step 10: this page has no dynamic `[segment]` and reads nothing from the request. What might `npm run build` do with a page like that?

</details>

<details>
<summary>Hint 5</summary>

For the Vite question: think about where `reading-list.json` would live, what program would read and write it, how the browser would reach that program, and where you'd validate. [Chapter 30](../30-axios/notes.md) is a big clue.

</details>
