# 41 Final Project: Exercises

This is a **project menu**. Pick one idea, and build it from start to finish.

**How to do these:**

- Pick **one** project. (Or bring your own idea: see the end of this page.)
- Make it its own app, **outside** your `docs` folder, so it can be its own Git repository from day one ([chapter 40](../40-deploying/notes.md)).
- Follow the 11 steps in [notes.md](notes.md). Steps 1 to 6 happen on paper, before you create the app.
- The tools listed with each idea are **suggestions, not a shopping list**. Use step 5's rule: add a library when you feel the pain it removes.
- Every API on this menu was free and needed no key when this was written (autumn 2026). APIs change, though. Before you build on one, read its docs and try one request in your browser's address bar. (REST Countries used to be the classic free countries API, and it now needs a key. That's exactly why you check.)
- A project is done when the MVP works, `npx tsc -b` prints nothing, `npm test -- --run` passes, it's live on a URL, and it has a README.
- Share your code with Claude for a review after each working feature.

---

## Exercise 1 (Easy): Habit Tracker

Tick off your daily habits and watch your streaks grow.

**Must-haves:**
- Add and remove habits (drink water, read, stretch...).
- A checkbox for each habit, for today.
- Each habit's current streak: days in a row.
- Everything saved in `localStorage`.

**Nice-to-haves:** a seven-day grid per habit, a "best streak" record, reorder habits, a dark theme with context.

**Practices:** state and forms (08, 09), updating arrays (11), `useLocalStorage` (20), a reducer (23), tests (28). No library needed, and that's the point.

If you built this in [JavaScript chapter 52](../../JavaScript/52-final-project/exercises.md), rebuild it the React way, then compare the two, like you did with the to-do app in chapter 10.

<details>
<summary>Hint</summary>

Store the dates each habit was done as ISO strings, like `"2026-09-30"`. Then write `getStreak(doneDates, today)` as a pure function, and test it before it goes anywhere near a component. Try the awkward cases: nothing done yet, done today but not yesterday, and a streak that ended last week.

</details>

---

## Exercise 2 (Easy): Study Timer

A Pomodoro timer: 25 minutes of focus, then a 5-minute break.

**Must-haves:**
- The time left, shown as `mm:ss`.
- Start, pause and reset buttons.
- Switches between "Focus" and "Break" by itself.
- Counts how many focus sessions you've finished today.

**Nice-to-haves:** change the lengths (saved), a sound when time's up, the time left in the browser tab's title, press Space to pause.

**Practices:** effects with cleanup (17), refs (19), a custom hook like `useCountdown` (20), a reducer for the modes (23), and `aria-live` so a screen reader hears "Break time!" (38).

<details>
<summary>Hint 1</summary>

Don't count ticks. `setInterval` isn't exact, and a background tab slows it down. Save the moment the timer should end (`Date.now()` plus the length), and on every tick work out the time left from that. [JavaScript chapter 30](../../JavaScript/30-timers-and-callbacks/notes.md) explains why.

</details>

<details>
<summary>Hint 2</summary>

If the timer runs twice as fast in development, your effect isn't cleaning up its interval. StrictMode runs effects twice on purpose to catch exactly this ([chapter 17](../17-effects/notes.md)).

</details>

---

## Exercise 3 (Medium): Book Shelf

Search for books and keep your own shelf: want to read, reading, finished.

**Must-haves:**
- A search box with debounced results: title, author, first published year, and a cover.
- Loading, error and "nothing found" states.
- Add a book to your shelf with a status. Change its status. Remove it.
- The shelf is saved, and the search text lives in the URL (`?q=dune`).

Uses the free Open Library API: `https://openlibrary.org/search.json?q=the+hobbit&limit=10`. Covers come from `https://covers.openlibrary.org/b/id/<cover_i>-M.jpg`.

**Nice-to-haves:** filter the shelf by status (in the URL), a star rating, pages-read progress, a "finished this year" count.

**Practices:** TanStack Query with the search text in the query key (31), Zod (32), `useDebounce` (20), URL state (24), context or Zustand for the shelf (22, 34).

<details>
<summary>Hint 1</summary>

Log one response and look at it before you write a schema. The books are in `docs`, and plenty of them have no `author_name` or `cover_i` at all. Make those optional in Zod, and decide what the card shows when they're missing.

</details>

<details>
<summary>Hint 2</summary>

If the results flash empty on every keystroke, look up `placeholderData: keepPreviousData` in TanStack Query v5. It keeps showing the old results until the new ones arrive.

</details>

---

## Exercise 4 (Medium): Flag Quiz

Guess the country from its flag, ten flags a round.

**Must-haves:**
- Show a flag and four possible countries. One is right.
- Say whether the answer was right (in words, not just colour), then move on.
- A score, and a results screen after ten questions, with **Play again**.
- A best score, saved.

Uses the free Flagpedia files: the list of codes and names is at `https://flagcdn.com/en/codes.json`, and each flag is an image like `https://flagcdn.com/w320/fr.png`.

**Nice-to-haves:** a "learn" page listing every flag with a search box, a timed mode, a harder mode with eight choices.

**Practices:** a reducer as a small state machine (23), a discriminated union for the game's phases (25), TanStack Query to load the list once (31), tests (28), `aria-live` and focus management (38).

<details>
<summary>Hint 1</summary>

`codes.json` has more than countries in it: US states (`us-ca`), parts of the UK (`gb-eng`), and groups like `eu` and `un`. Decide what counts as a country for your quiz, and filter the list in one pure, tested function.

</details>

<details>
<summary>Hint 2</summary>

Randomness makes tests flaky. Shuffle the questions *outside* the reducer and pass them in with a "start" action, the same trick as passing `today` into `daysUntilExpiry`. Then your tests can hand the reducer a fixed list and know exactly what happens.

</details>

---

## Exercise 5 (Medium): Expense Tracker, with charts

See where your money goes each month.

**Must-haves:**
- Add an expense: description, amount in £, category, and date, with validation (amount above zero, no dates in the future).
- The list and the total for one month, with the month in the URL (`?month=2026-09`).
- Delete an expense.
- Everything saved in `localStorage`.

**Nice-to-haves:** a chart of spending by category, a budget per category with a warning, edit an expense, export to CSV.

**Practices:** React Hook Form with a Zod schema (32, 33), a reducer or Zustand (23, 34), URL state (24), tests for the totals (28), `Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" })` for money.

For the chart, you can use a chart library such as Recharts. It's optional, so check it supports React 19 when you install it. Or start with plain CSS bars, where each bar's width is a percentage. You might find that's all you need.

<details>
<summary>Hint</summary>

Store amounts in pence, as whole numbers (£12.50 is `1250`), just as the shopping cart in [JavaScript chapter 12](../../JavaScript/12-project-shopping-cart/notes.md) stored cents. Adding up decimals gives surprises like `0.1 + 0.2 = 0.30000000000000004`. Every total and every chart bar is derived from the list, never stored.

</details>

---

## Exercise 6 (Medium): Pokédex

Browse every Pokémon, page by page, and open any one for its details.

**Must-haves:**
- A list, 20 per page, with the page in the URL (`?page=3`). Next and Previous buttons.
- A detail page for each one (`/pokemon/pikachu`): picture, types, and stats.
- A type filter (fire, water...) in the URL, too.
- Loading and error states, and the browser's back button works everywhere.

Uses the free PokéAPI: `https://pokeapi.co/api/v2/pokemon?limit=20&offset=40` for a page, `https://pokeapi.co/api/v2/pokemon/pikachu` for one, and `https://pokeapi.co/api/v2/type/fire` for a type.

**Nice-to-haves:** pick a team of six (saved), compare two side by side, load the next page early when someone hovers over **Next**.

**Practices:** TanStack Router with validated search params, or React Router (36, 24), TanStack Query with the page in the query key (31), Zod (32), lazy-loaded routes (26), `loading="lazy"` on images (27).

<details>
<summary>Hint 1</summary>

The list endpoint only gives each Pokémon's name and a URL. The number at the end of that URL is its id. The picture is in the detail response: look for `official-artwork` inside `sprites`.

</details>

<details>
<summary>Hint 2</summary>

The type endpoint returns *every* Pokémon of that type in one go, with no paging. So when a type is chosen, page through that list yourself with `slice`. Your page number still lives in the URL either way.

</details>

---

## Exercise 7 (Challenge): Week Meal Planner

Plan the week's dinners, and get the shopping list for free.

**Must-haves:**
- Search for recipes and add one to a day, Monday to Sunday.
- Move a meal to another day, or remove it.
- Open a planned meal to see its ingredients and instructions.
- A shopping list built from every planned meal's ingredients, where you can tick things off.
- The plan and the ticks are saved.

Uses TheMealDB, which you know well: `search.php?s=`, `lookup.php?i=` and `random.php`.

**Nice-to-haves:** drag and drop between days (with buttons as a keyboard alternative), a "surprise me" dinner, a printable shopping list (CSS `@media print`), drinks for the weekend from TheCocktailDB (`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=mojito`).

**Practices:** TanStack Query, including `useQueries` for several meals at once (31), Zod (32), Zustand or Redux Toolkit for the plan (34, 35), routes (24), accessibility for anything draggable (38).

<details>
<summary>Hint 1</summary>

Save only the meal **ids** in your plan, never whole recipes. That was a common mistake in [chapter 21](../21-project-recipe-finder/notes.md): a second copy of the truth that quietly goes out of date. TanStack Query fetches and caches the details from the ids.

</details>

<details>
<summary>Hint 2</summary>

Don't try to add up the amounts. TheMealDB's measures are free text ("1 cup", "200g", "a pinch"). Group the list by ingredient name and show each measure next to it. It's honest, and it's what a real shopper needs.

</details>

---

## Exercise 8 (Challenge): Your Portfolio Site, in Next.js

A site about you, showing the projects you've built, live on the internet. It's the one project on this menu that will help you every time you apply for a job.

**Must-haves:**
- A home page: who you are and what you like building.
- A projects page with at least three projects: a screenshot, one sentence each, a live link and a code link.
- A page per project (`/projects/bookstore`), with what it does and what you learned.
- A way to contact you (a `mailto:` link is fine).
- Deployed, with good Lighthouse scores for performance and accessibility.

**Nice-to-haves:** a contact form that sends through a Server Function (checked with Zod on the server), a dark theme, a short blog post about one thing you learned.

**Practices:** Next.js App Router and Server Components (39), page titles and descriptions so search engines understand each page (the reason Next.js fits this one), `next/image`, accessibility (38), deploying (40).

<details>
<summary>Hint 1</summary>

Keep your projects in one typed array, in a file like `projects.ts`, and use `satisfies` ([chapter 25](../25-typescript-patterns/notes.md)) so a typo in a field name is an error. Every page reads from that one array. Adding a project later means adding one object.

</details>

<details>
<summary>Hint 2</summary>

Each project page is a dynamic route, like `app/projects/[slug]/page.tsx`. In recent Next.js versions, `params` is a promise you `await`. Check chapter 39 and the current Next.js docs, because this is exactly the kind of detail that changes between versions.

</details>

---

## Bring your own idea

Have something you'd rather build? Great. That's usually the project you'll finish. Before you start, check it against the notes:

1. **Say it in one sentence**, with no more than one "and".
2. **Write the must-have list.** Five to eight items. If it's twenty, cut it in half, then in half again.
3. **Check your API.** Is it free? Does it need a key? (If it needs a *secret* key, you need a server: that means Next.js, or waiting for the Node.js course.) Try one request in your browser before you plan around it.
4. **Fill in the four-homes table** from step 4. If you can't place something, ask Claude about it before you write any code.

---

## When you're done

- **Share the link.** Send it to a friend and watch them use it without helping. Where do they get stuck?
- **Ask Claude for a review** of the whole project, using the request in step 11 as a starting point.
- **Write down three things:** one decision you're glad you made, one you'd make differently, and what you'd build next.

Then pick another idea. Every project you finish makes the next one easier.
