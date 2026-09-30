# 40 Deploying: Exercises

**How to do these:**

- This time you work in your finished project apps, not the playground: `React/bookstore` (chapter 29), `React/recipe-finder` (chapter 21), `React/taskboard` (chapter 37) and `React/next-practice` (chapter 39).
- Before each exercise, make sure the app works locally, `npx tsc -b` prints nothing, and (where the app has tests) `npm test -- --run` passes. Deploying a broken app just gives you a broken app with a URL.
- Remember the trap from the notes: your `docs` folder is already a Git repository. **Never run `git init` inside it.** Copy an app out first (option A), or push `docs` and set a base directory (option B).
- Hosting screens change often. If a button in these steps has moved, look for the same idea under a different name, or ask Claude where it went.
- An exercise is done when it works **on the live URL, on your phone**, and the Console there has no unexpected errors.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your work (share the live link, too).

---

## Exercise 1 (Easy): Look inside the box

Before you put your bookstore online, find out exactly what you'd be uploading.

1. In `React/bookstore`, open `package.json` and read the `build` script. Write down what it runs, and in which order. (A comment at the top of `App.tsx` is a fine place for all your answers.)
2. Run `npm run build`. Open the new `dist` folder in VS Code. Open `dist/index.html`: which JavaScript and CSS files does it load? Is the checkout chunk one of them? Why not?
3. Find the checkout chunk in `dist/assets/` and write down its full file name.
4. Change one word in `CheckoutPage.tsx` (the heading, say) and build again. Which file names in `dist/assets/` changed, and which stayed the same? Did the main `index-*.js` change too? Search inside it for `CheckoutPage-` and work out why.
5. Run `npm run preview`, open the Network tab, and go to `/books`, then `/checkout`. Note the moment the checkout chunk downloads.
6. Search the main `index-*.js` file for the title of one of your books. Found it? Write one sentence about what this means for anything you'd want to keep secret.
7. Break it on purpose: double-click `dist/index.html` to open it straight from the disk. Write down what you see and the first error in the Console. Why does a built app still need to be *served*?

<details>
<summary>Hint 1</summary>

For question 4: the main file has to know the checkout chunk's name, so it can ask for it later. So when that name changes, the main file's contents change, and a different content means a different fingerprint. The CSS file didn't mention the checkout at all, so its name has no reason to change.

</details>

<details>
<summary>Hint 2</summary>

For question 7: look at the `src` on the `<script>` tag in `dist/index.html`. It starts with `/`, meaning "from the root of the website". Opened from the disk, there is no website, so the browser looks at the root of your drive instead.

</details>

---

## Exercise 2 (Easy): Your bookstore, live

Time to open the stall.

1. Build the bookstore and deploy `dist` with Netlify Drop (or any host that lets you upload a folder).
2. Open the live link on your phone. Browse, add two books to the cart, and open the cart page.
3. Reproduce the refresh 404: open a book page, like `/books/3`, and refresh. Write down exactly what the host shows. Then paste the same link into a brand-new tab. Same result?
4. Fix it with a `public/_redirects` file. Build again and check that `dist/_redirects` exists before you deploy.
5. Deploy the new `dist` to the **same** site (drag it onto that site's Deploys page), so the URL stays the same.
6. Check all three: refreshing `/books/3` works, `/books/999` shows your "couldn't find that book" message, and `/banana` shows your own 404 page.
7. Add a book to the cart and refresh. Is the cart still there? Is that a hosting problem? Explain in one or two sentences.

**What you should see:** a bookstore that behaves exactly like `npm run preview` did, on a real URL.

<details>
<summary>Hint 1</summary>

If the fix didn't work, check three things. The file is in the `public/` folder at the top of your project (next to `src/`, not inside it). Its name is exactly `_redirects`, with no extension: Windows sometimes hides a `.txt` on the end, so create it in VS Code rather than Notepad. And you deployed the *new* `dist`.

</details>

<details>
<summary>Hint 2</summary>

For question 7: where does the cart live? Think back to chapter 29, and to its first stretch goal. The host just hands out files. It never sees your cart at all.

</details>

---

## Exercise 3 (Medium): The recipe finder, deployed from GitHub

Your recipe finder from chapter 21 gets a proper, automatic deploy, with its API address in an environment variable.

1. Decide: option A (copy `recipe-finder` to its own folder outside `docs`) or option B. Write down which, and why.
2. Move TheMealDB's address out of `api.ts` into `VITE_MEALDB_URL` in `.env.local`. Type it in `src/vite-env.d.ts` with `strictImportMetaEnv` on, and throw a clear error if it's missing. Misspell the name once in `api.ts` and read the type error, then fix it.
3. Put the app on GitHub. Before your first commit, run `git status` and check that `node_modules`, `dist` and `.env.local` are **not** in the list.
4. Connect the repository to a host (Netlify, Vercel or Cloudflare). Check the build settings. **Deploy once without setting the variable.** What happens on the live site? Where does your error message show up?
5. Now add `VITE_MEALDB_URL` in the host's settings and deploy again. Search for a recipe on your phone.
6. Change something visible (the title's emoji, say), commit and push. Time how long it takes from `git push` to seeing the change live.
7. Make a preview deploy: create a branch, change a colour, push it, and open a pull request on GitHub. Find the preview link. Check that the live site hasn't changed. Then merge, and watch the live site update.
8. Does the recipe finder need a `_redirects` file? Answer in a sentence, with your reason.

<details>
<summary>Hint 1</summary>

For step 4: the variable is baked in at build time, so a missing one means the built code contains `undefined`. Your `throw` runs as soon as `api.ts` loads, so look in the Console of the live site. After adding the variable, the host must **build again**. Look for a "Redeploy" or "Trigger deploy" button, or just push a new commit.

</details>

<details>
<summary>Hint 2</summary>

For step 8: the refresh 404 only happens for addresses the router shows but no file exists for. How many different addresses does your recipe finder have? (If you added routes in the stretch goals, the answer changes.)

</details>

---

## Exercise 4 (Medium): A robot that checks your work

Add CI to the bookstore, and watch it catch a bug you "forgot" to test.

1. Make the bookstore its own repository on GitHub, the same way as Exercise 3 (option A is easiest here).
2. Add `.github/workflows/ci.yml` from the notes. Commit, push, and watch it run in the **Actions** tab until you get a green ✓.
3. Break a rule on purpose: in `cartReducer.ts`, change the quantity cap from 10 to 11. **Don't run the tests yourself.** Commit and push. Find the red ✗, open it, and write down which step failed, which test failed, and what the message said.
4. Fix it, push, and get back to green.
5. Now break the types instead: pass a number where a component expects a string. Push. Which step fails this time? Why is it helpful that `npx tsc -b` has its own step?
6. Make a branch with a small change and open a pull request. Find where the check's ✓ or ✗ shows up on the pull request page.
7. Bonus: add a step that runs `npm run lint` (the linter Vite set up in chapter 01).

<details>
<summary>Hint 1</summary>

If GitHub says the workflow file is invalid, it's almost always indentation. YAML uses spaces, never tabs, and each level must line up exactly. Compare yours with the notes, line by line.

</details>

<details>
<summary>Hint 2</summary>

If `npm ci` fails with a message about `package.json` and `package-lock.json` not being in sync, you installed or changed a package without committing the updated lock file. Run `npm install` locally, then commit `package-lock.json`.

</details>

---

## Exercise 5 (Challenge): Ship the rest

Two apps that can't just be dragged onto a host, and a final check on both.

**Part A: the Next.js app.** Deploy `React/next-practice` from chapter 39.

1. Run the production version locally first: `npm run build`, then `npm start`.
2. Deploy it to a host that runs Next.js. Add any server-only environment variables in the host's settings.
3. On the live site, use something that runs on the server (submit a form that calls a Server Function). Then open the Sources tab and search for your secret's value. It must not be there.

**Part B: the task board, in demo mode.** Make `React/taskboard` work online without json-server.

1. Add a `VITE_DEMO_MODE` variable, typed in `vite-env.d.ts`. Remember it's a string.
2. Give **every** function in `src/api/tasks.ts` (`getTasks`, `getTask`, `createTask`, `updateTask`, `deleteTask`) a demo version that uses `localStorage`. Your routes, components and `queries.ts` must not change at all. Prove it: when you're done, `git diff` (or your memory!) should show changes only in `src/api/`, `vite-env.d.ts`, and one small banner.
3. On a visitor's first visit, start them with three or four example tasks, so they don't see an empty board.
4. Check saved data when you load it, with the `TaskListSchema` you already have ([chapter 32](../32-zod/notes.md)). Edit it into nonsense in DevTools and refresh: the board should start fresh, not crash.
5. Show a small banner in demo mode: "Demo: your tasks are saved in this browser only."
6. Write tests for the demo functions (Vitest's `jsdom` environment has `localStorage`).
7. Deploy with `VITE_DEMO_MODE=true` set on the host. Locally, with the variable unset, it should still use json-server exactly as before.

**Part C: check both.** Run Lighthouse on both live URLs. For each, fix one thing it reports (accessibility or performance), deploy again, and write down the score before and after.

<details>
<summary>Hint 1</summary>

For Part A: if `npm start` complains that it can't find a production build, you skipped `npm run build`. For a secret that shows up in the Sources tab: check whether its name starts with `NEXT_PUBLIC_`, and whether a Client Component reads it.

</details>

<details>
<summary>Hint 2</summary>

For Part B: keep `tasks.ts` readable by putting the `localStorage` work in its own small file, with plain functions like "load all tasks" and "save all tasks". Each api function then picks one path or the other. That file is also the easy one to test.

</details>

<details>
<summary>Hint 3</summary>

New demo tasks need ids, and there's no json-server to make them. `crypto.randomUUID()` gives you a unique string, and it's built into every modern browser. And don't worry about TanStack Query: after a demo mutation, invalidating the query makes it call your `getTasks` again, which now just reads `localStorage`. Your optimistic `useMoveTask` keeps working too, because it only ever calls `updateTask`.

</details>
