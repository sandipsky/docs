# 41 Final Project

You've reached the last chapter of the React course. 🎉

This time there's no step-by-step recipe. You'll pick your own project and take it all the way from an idea to a live URL, the way professional developers do. That's a big jump from following milestones, so this chapter walks you through the process, one step at a time.

## What you'll build

Something of your own! The [exercises](exercises.md) have a menu of project ideas, from a habit tracker to your own portfolio site. You can also bring your own idea.

To show you the process, this chapter follows one example project all the way through: **Pantry Pal**, an app that shows what food is in your kitchen, what expires soon, and what you could cook with it. It isn't on the menu, so there's nothing to copy. Watch *how* it gets decided and built, then do the same with your project.

```
┌──────────────────────────────────────────────────┐
│  🥫 Pantry Pal                 Pantry   + Add    │
├──────────────────────────────────────────────────┤
│  ⚠ 2 things expire in the next 3 days            │
│                                                  │
│  [ All ] [ Fridge ] [ Freezer ] [ Cupboard ]     │
│                                                  │
│  Chicken breast   2 fillets   Expires tomorrow   │
│                               [Ideas] [Used it]  │
│  Spinach          1 bag       3 days left        │
│                               [Ideas] [Used it]  │
│  Rice             1 kg        214 days left      │
│                               [Ideas] [Used it]  │
└──────────────────────────────────────────────────┘
```

Here are the steps:

1. Pick one small idea.
2. Split the must-haves from the nice-to-haves.
3. Sketch the screens, then break them into components.
4. Sketch the data, and give every piece of state a home.
5. Choose your tools, only the ones you need.
6. Plan your folders.
7. Build the smallest working version, in small steps.
8. Test the logic that matters.
9. Do an accessibility pass.
10. Deploy it, and write a README.
11. Ask for a code review.

If you did the [JavaScript final project](../../JavaScript/52-final-project/notes.md), some of these will feel familiar. That's on purpose. The process doesn't change much. What's new is how many more decisions React gives you, and steps 4 and 5 are where you make them.

## Getting started

**Don't create the app yet.** Steps 1 to 6 happen on paper (or in a notes file). You'll create the app in step 7 (with `npm create vite@latest`, or with Next.js's own setup command if step 5 picks Next.js), once you know what you're building.

When you do, make the project **outside** your `docs` folder, next to it for example. Then it can be its own Git repository from the first day, and you avoid the repo-inside-a-repo trap from [chapter 40](../40-deploying/notes.md). (Keeping it in `docs/React/` works too. You'll just set a base directory when you deploy.)

## The big idea: decide before you type

In every project so far, the big decisions were made for you: "the cart lives in context", "use TanStack Query for the tasks". In this project, **you** make them. That's the real skill this chapter practises.

Two questions do most of the work:

- **Where does each piece of state live?** You learned the four homes in Level 4: local, URL, shared client, and server. Most of the pain in a React app comes from state in the wrong home.
- **Which tools do I actually need?** Level 4's theme was that every library solves a problem you've already felt by hand. So here's the rule: **start with plain React, and add a library when you feel the pain it removes.** Not before, "because you can".

A project where these two questions were answered well feels easy to build. A project where they weren't feels like wading through mud, no matter how good the code is.

## Step 1: Pick one small idea

A good project starts with a problem you can say in one sentence:

> **Pantry Pal:** see which food in my kitchen I should use up first.

When you pick yours:

- **Pick something you'd actually use**, or that a friend would. You'll care more about finishing it, and you'll notice what's missing.
- **Keep it small.** A small app that's finished and online beats a big app that's half-built on your laptop.
- **Watch out for "and".** If your sentence needs "and" three times, it's probably three projects.

| Too big | Just right |
|---|---|
| A meal-planning platform with shopping, nutrition and friends | A page that shows which food to use up first |
| A Trello clone with teams and live updates | A task board for one person (you built one in chapter 37!) |
| An app that scans receipts with the camera | Typing in what you bought |
| A social network for readers | A bookshelf of what you're reading |

**Check it:** you can say your idea in one sentence, to someone who isn't a programmer, and they get it.

## Step 2: Must-haves and nice-to-haves

Make two lists before you write any code:

- **Must-haves** make the app useful at all. Without any one of them, it doesn't do its job.
- **Nice-to-haves** would be great, *later*.

Together, the must-haves are your **MVP**, short for **minimum viable product**: the smallest version of the app that's genuinely useful. You build that first, and nothing else.

| Must-have (the MVP) | Nice-to-have (later, maybe) |
|---|---|
| See my food, soonest to expire first | Edit an item |
| See how many days each item has left | A shopping list of things I've used up |
| Add an item: name, amount, where it's kept, expiry date | Scan a barcode to add an item |
| Mark an item "used it" | A reminder the day before something expires |
| Show only the fridge, freezer or cupboard | Share the pantry with my housemates |
| Get recipe ideas for an item | Dark mode |
| Everything's still there after a refresh | Stats on how much food I've saved |

Look at "share the pantry with my housemates". Sharing means a server, accounts and a database. That's a project of its own (the Node.js course, later), which is exactly why it sits on the right.

**Check it:** you have five to eight must-haves, and every one of them passes the question "would the app be useless without this?"

## Step 3: Sketch the screens, then break them into components

Grab a pen. Boxes and words are enough: what does the person see, and what can they press? Pantry Pal has three screens: the pantry list (sketched at the top of this chapter), an **Add item** form, and a page of recipe ideas:

```
┌──────────────────────────────────────────────────┐
│  Ideas for: chicken breast      ← Back to pantry │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ [photo]  │  │ [photo]  │  │ [photo]  │        │
│  │ Brown    │  │ Chicken  │  │ Chicken  │        │
│  │ Stew     │  │ Couscous │  │ Handi    │        │
│  └──────────┘  └──────────┘  └──────────┘        │
└──────────────────────────────────────────────────┘
```

Now do step 1 of [chapter 14](../14-thinking-in-react/notes.md): draw a box around every chunk you could name out loud in one breath. "That's the header." "That's one item row." "That's the little expiry label." Each box is a component:

```
App                        (the routes)
└── Layout                 (header, nav, <Outlet />)
    ├── PantryPage         /
    │   ├── ExpiringSoonBanner
    │   ├── FilterTabs     (All, Fridge, Freezer, Cupboard)
    │   └── ItemList
    │       └── ItemRow    (name, amount, ExpiryBadge, two buttons)
    ├── AddItemPage        /add
    │   └── ItemForm
    └── IdeasPage          /ideas/:ingredient
        └── RecipeCard
```

Notice `ExpiryBadge`. It's tiny, but it has a real job ("tomorrow", "3 days left", "Expired!"), and it's used in every row. Small components with one job are the easiest ones to get right.

**Check it:** every box on your sketch has a component name, and every component has one job you can describe in a sentence.

## Step 4: Sketch the data, and give every piece of state a home

What does the app need to *remember*? For Pantry Pal, it's one list of items:

```ts
export type StoredIn = "fridge" | "freezer" | "cupboard";

export type PantryItem = {
  id: string;
  name: string;       // "Chicken breast"
  amount: string;     // "2 fillets" (free text, on purpose)
  storedIn: StoredIn;
  expiresOn: string;  // "2026-10-01", an ISO date
};
```

The same habits as the JavaScript final project, now with types:

- **Store the facts, and work out the rest.** The item remembers *when* it expires, not the words "3 days left". Those words change every day, so the app works them out during render ([chapter 08](../08-state/notes.md)).
- **Dates as ISO strings**, like `"2026-10-01"`. They survive `localStorage` and JSON, and nobody has to guess what `01/10` means.
- **A union type for anything with a fixed set of values.** `storedIn` can only ever be one of three words, and TypeScript will hold you to it. (Why not call the type `Location`? The browser already has a type with that name, for `window.location`, and a clash would be confusing.)

Next, list **how the items change**. You did this for the bookstore's cart in chapter 29. It becomes your reducer's action type:

```ts
export type PantryAction =
  | { type: "added"; item: PantryItem }
  | { type: "used_up"; id: string };
```

That's the whole MVP: two actions. (The new item's `id` is made in the event handler with `crypto.randomUUID()`, not in the reducer, so the reducer stays pure.)

Now the most important table in your plan. Sort **every** piece of state into its home, using the four homes from Level 4:

| Piece of state | Kind | Home |
|---|---|---|
| What's half-typed in the Add form | Local UI | `useState` in `ItemForm` |
| Whether "Are you sure?" is showing | Local UI | `useState` in `ItemRow` |
| Which place is showing (`?where=fridge`) | URL | `useSearchParams` |
| Which ingredient's ideas are showing | URL | The path: `/ideas/chicken%20breast` |
| The pantry items | Shared client | One reducer, shared with context, saved to `localStorage` |
| Recipe ideas from TheMealDB | Server | TanStack Query, key `["ideas", ingredient]` |
| "3 days left", the banner's count, the sort order | None! | Derived during render |

That last row matters as much as the others. Everything in it is worked out from the items and today's date, so it can never go stale.

The quick tests from chapter 29, with one more added: **Does the data really live somewhere else?** → server state. **Would someone want to send it in a link?** → URL. **Does a component far away need it?** → shared. **None of those?** → local.

**Check it:** every piece of state in your app appears in your table exactly once, and your "derived" row isn't empty.

## Step 5: Choose your tools, only the ones you need

Here's a table for making this decision on purpose:

| I need… | Reach for… | But only if… |
|---|---|---|
| More than one page, with real URLs | React Router ([24](../24-react-router/notes.md)), or TanStack Router ([36](../36-tanstack-router/notes.md)) | There's more than one screen worth linking to |
| Data from a server | TanStack Query ([31](../31-tanstack-query/notes.md)), with `fetch` or Axios ([30](../30-axios/notes.md)) | The data really lives somewhere else |
| To check data from outside my code | Zod ([32](../32-zod/notes.md)) | It comes from an API, `localStorage`, or the URL |
| A big form | React Hook Form ([33](../33-react-hook-form/notes.md)) | Lots of fields, or rules that connect fields |
| Client state that many parts share | Context + `useReducer` ([22](../22-context/notes.md), [23](../23-use-reducer/notes.md)), or Zustand ([34](../34-zustand/notes.md)) / Redux Toolkit ([35](../35-redux-toolkit/notes.md)) | Far-apart components read and change it |
| Server-only code, secrets, or pages search engines must find | Next.js ([39](../39-nextjs-and-server-components/notes.md)) | You have a secret key, or search results matter |

And here's how Pantry Pal answers it, including the tools it **deliberately leaves out**:

| Tool | Pantry Pal? | Why |
|---|---|---|
| React Router | ✅ Yes | Three screens, and the ideas page deserves a real URL |
| TanStack Query | ✅ Yes | Recipe ideas come from TheMealDB. Opening "Ideas" for chicken twice should use the cache |
| Zod | ✅ Yes | Checks TheMealDB's answers, *and* the saved pantry when it's loaded (users can edit `localStorage`) |
| Axios | ❌ No | One endpoint, read-only. Plain `fetch` in one api file is enough |
| React Hook Form | ❌ No | One form with four fields. A controlled form from [chapter 09](../09-forms/notes.md) is fine |
| Zustand or Redux Toolkit | ❌ Not yet | Two pages share the items. The bookstore's reducer + context pattern handles that. If more pages needed them and the provider started to feel heavy, Zustand would be the next step |
| Next.js | ❌ No | No secret keys, and nobody needs to find their own pantry on Google |

Every "no" is a thing you don't have to install, learn the quirks of, or keep up to date. That's a real saving, not a missed opportunity.

**Check it:** for every library you picked, you can name the pain it removes *in your app*. For every one you didn't, you can say why not.

## Step 6: Plan your folders

Decide which folder does which job, before there are forty files:

```
pantry-pal/
├── public/
│   └── _redirects                the refresh fix, from chapter 40
├── src/
│   ├── main.tsx                  providers: router, query client, pantry
│   ├── App.tsx                   the route table
│   ├── api/
│   │   └── recipes.ts            TheMealDB calls and their Zod schemas
│   ├── pantry/
│   │   ├── types.ts
│   │   ├── expiry.ts             daysUntilExpiry and friends: pure functions
│   │   ├── expiry.test.ts
│   │   ├── pantryReducer.ts
│   │   ├── pantryReducer.test.ts
│   │   └── PantryContext.tsx     provider, usePantry(), usePantryDispatch()
│   ├── pages/
│   │   ├── PantryPage.tsx
│   │   ├── AddItemPage.tsx
│   │   ├── AddItemPage.test.tsx  the one user flow that matters most
│   │   └── IdeasPage.tsx
│   └── components/
│       ├── ItemRow.tsx
│       ├── ExpiryBadge.tsx
│       └── RecipeCard.tsx
├── README.md
└── package.json
```

Three habits in that tree:

- **Tests sit next to the file they test.** When you open `expiry.ts`, its tests are right there.
- **`api/` is the only folder that knows TheMealDB exists**, the same three-layer split as the recipe finder in [chapter 21](../21-project-recipe-finder/notes.md). If you use Zustand, a `src/stores/` folder is the usual home for stores.
- **`expiry.ts` never imports React.** It takes data in and hands answers back, so it's the easiest file in the project to test.

**Check it:** you can point at the folder where any feature on your must-have list will live.

## Step 7: Build the MVP in small steps

Now create the app (`npm create vite@latest`, naming it `pantry-pal`), install only the tools step 5 chose, and make your first commit:

```
git init
git add .
git commit -m "Empty Vite app"
```

(Run `git status` first. Outside `docs`, it should say `not a git repository`.)

Then add **one** piece at a time, and run the app after each one:

1. Hard-coded items, shown on one page. No state at all: the static version from [chapter 14](../14-thinking-in-react/notes.md).
2. The expiry labels, from `daysUntilExpiry` (step 8 shows it).
3. The reducer and context. "Used it" removes an item.
4. Routes, and the Add page with its form.
5. Save and load with `localStorage`, checked with Zod on the way in.
6. The Ideas page, with TanStack Query.
7. The fridge / freezer / cupboard filter, in the URL.
8. Only now: the styling, and nice-to-haves.

**After each working step, commit.** `git add .`, then `git commit -m "Add the expiry labels"`. Each commit is a save point: if step 5 goes horribly wrong, you can get back to the end of step 4.

> **Tip:** if a step feels too big, it is. Split it until each piece takes under an hour.

**Check it:** the app runs, `npx tsc -b` prints nothing, and you have a commit, after every numbered step.

## Step 8: Test the logic that matters

You can't test everything, and you don't need to ([chapter 28](../28-testing/notes.md)). Test what would really hurt if it broke. For Pantry Pal, the most important logic is working out how long food has left:

```ts
// src/pantry/expiry.ts
const DAY_MS = 24 * 60 * 60 * 1000;

// Days until the item expires. 0 means today. Negative means it already has.
export function daysUntilExpiry(expiresOn: string, today: string): number {
  const difference = new Date(expiresOn).getTime() - new Date(today).getTime();
  return Math.round(difference / DAY_MS);
}
```

```ts
// src/pantry/expiry.test.ts
import { daysUntilExpiry } from "./expiry.ts";

test("chicken that expires tomorrow has 1 day left", () => {
  expect(daysUntilExpiry("2026-10-01", "2026-09-30")).toBe(1);
});

test("food that expires today has 0 days left", () => {
  expect(daysUntilExpiry("2026-09-30", "2026-09-30")).toBe(0);
});

test("food that expired two days ago gives -2", () => {
  expect(daysUntilExpiry("2026-09-28", "2026-09-30")).toBe(-2);
});
```

`npm test` runs them (with the `globals: true` setup from chapter 28). Notice that `today` is a **parameter**, not read from the clock inside the function. That keeps it pure, so the tests give the same answer every day, including the day you show it to someone. The page passes in today's date, and that's the only place the real clock is read. (Careful: `new Date().toISOString()` gives the date in UTC, which can be a day out just after midnight. [JavaScript chapter 19](../../JavaScript/19-dates-and-times/notes.md) has the details.)

After that, in order of value:

1. **The reducer.** One test per rule, just like the bookstore's cart. It's the highest-value testing in a React app.
2. **The saved-data schema.** Hand it nonsense, and check the app starts with an empty pantry instead of crashing.
3. **One user flow**: type a new item into the form, press Add, and see it in the list. `renderWithProviders` with a `MemoryRouter`, `user-event`, and `getByRole` throughout.

Don't test TheMealDB, TanStack Query or React Router. They have their own tests.

**Check it:** `npm test -- --run` passes, and the logic you'd be most embarrassed to get wrong is covered.

## Step 9: The accessibility pass

Don't save this for the very end, when it's hardest to change. Do a quick pass after the MVP works, using the checklist from [chapter 38](../38-accessibility/notes.md):

- **Unplug the mouse.** Can you add an item, filter, open ideas and mark something used, with only the keyboard? Can you always see where the focus is?
- **Every input has a real label**, not just a placeholder.
- **Every button has a name that makes sense on its own.** Five buttons all called "Used it" are confusing to a screen reader user. "Used it: Chicken breast" isn't.
- **Colour is never the only signal.** A red badge also says "Expired!" in words.
- **Headings go in order**, and each page has a clear `<h1>`.
- **Run Lighthouse and axe DevTools**, and fix what they find.
- **Then spend ten minutes with a screen reader** (NVDA or Narrator), because a clean score doesn't mean the app makes sense read aloud.

**Check it:** you did the whole main flow with only the keyboard, and again with a screen reader, and the tools have no easy wins left.

## Step 10: Deploy it, and write a README

Put it online the way [chapter 40](../40-deploying/notes.md) showed you: a GitHub repository, a Git-connected host, `_redirects` (or your host's version), and a CI workflow. Then check it on your phone.

**"It's not ready yet" is not a reason to wait.** Deploy the MVP. You can deploy again every day. An app that's online and a bit plain is worth far more than a perfect one nobody can see.

Then write a `README.md`. It's the first thing anyone sees on GitHub, so it's your project's front door:

- **The name and one sentence** (your step 1 sentence!).
- **A live link**, right at the top.
- **A screenshot.** Put the image in the repo, and show it with Markdown's image syntax. The text in the square brackets is the image's alt text:

  ```md
  ![Pantry Pal's pantry page, with two items expiring soon](screenshot.png)
  ```

- **What it does**: your must-have list, in plain words.
- **Built with**: React 19, TypeScript, and the tools from step 5. Credit the APIs you use (for Pantry Pal, TheMealDB).
- **How to run it**: `npm install`, `npm run dev`, `npm test`.
- **What I learned**: two or three honest sentences. One thing that was harder than you expected is great.
- **What's next**: your nice-to-have list.

**Check it:** a friend can open your README, click the live link, and use the app without asking you anything.

## Step 11: Ask for a code review

When a feature works, ask Claude to review it. A good request says what the code is, what you're unsure about, and what kind of help you want:

> "Here's my Pantry Pal project: `pantryReducer.ts`, `PantryContext.tsx` and `PantryPage.tsx`. It works and the tests pass. Please review it for bugs, state that's in the wrong home, and accessibility problems. I'm not sure the fridge / freezer filter belongs in the URL. Don't rewrite it for me: point out the problems and explain why."

Go through the skills checklist below and the accessibility pass above before you ask. It's much more useful to get feedback on the things you *didn't* spot.

**Check it:** you asked for at least one review, and you understood (and fixed or argued with!) every point in it.

## Your skills checklist

Show off the skills that fit your idea. Don't force them all in: a project that uses a library it doesn't need shows *less* skill, not more.

| Skill | Chapters |
|---|---|
| Components, props, lists and events | [03](../03-components/notes.md) to [07](../07-events/notes.md) |
| State, forms, and updating objects and arrays | [08](../08-state/notes.md), [09](../09-forms/notes.md), [11](../11-updating-objects-and-arrays/notes.md) |
| Planning components and where state lives | [13](../13-lifting-state-up/notes.md), [14](../14-thinking-in-react/notes.md) |
| Styling, or Tailwind | [15](../15-styling/notes.md), [16](../16-tailwind-css/notes.md) |
| Effects, fetching and custom hooks | [17](../17-effects/notes.md), [18](../18-fetching-data/notes.md), [20](../20-custom-hooks/notes.md) |
| Context and reducers | [22](../22-context/notes.md), [23](../23-use-reducer/notes.md) |
| Routing with real URLs | [24](../24-react-router/notes.md) or [36](../36-tanstack-router/notes.md) |
| TypeScript patterns (generic components, `satisfies`) | [25](../25-typescript-patterns/notes.md) |
| Error boundaries and lazy loading | [26](../26-error-boundaries-and-suspense/notes.md) |
| Measuring before optimising | [27](../27-performance/notes.md) |
| Tests that check behaviour | [28](../28-testing/notes.md) |
| Server data with TanStack Query | [30](../30-axios/notes.md), [31](../31-tanstack-query/notes.md) |
| Checking outside data, and bigger forms | [32](../32-zod/notes.md), [33](../33-react-hook-form/notes.md) |
| A store for shared client state | [34](../34-zustand/notes.md) or [35](../35-redux-toolkit/notes.md) |
| Accessibility | [38](../38-accessibility/notes.md) |
| Server Components, when you need a server | [39](../39-nextjs-and-server-components/notes.md) |
| Deploying and CI | [40](../40-deploying/notes.md) |

## Common mistakes

**1. Starting too big.** "A recipe social network" never gets finished. "A page that shows which food to use up first" does. Finish small, then grow it.

**2. Adding every Level 4 library "because you can".** Zustand, Redux Toolkit, React Hook Form and Axios, all in a two-page app with one form. Each one is more to learn, more to set up, and more to go wrong. Add a library when you feel the pain it removes.

**3. Styling before it works.** Hours of CSS on buttons that don't do anything yet. Build the MVP first. Paint last.

**4. State in the wrong home.** Filters in `useState` (they can't be shared), server data copied into a store (it goes stale), or a "days left" number stored instead of worked out (it's wrong tomorrow). Step 4's table catches all three.

**5. Writing a lot before running anything.** Run the app after every small change. A bug from the last five minutes is easy to find. A bug from the last five hours isn't.

**6. Leaving accessibility until the end.** By then the structure is set, and a `<div onClick>` in forty places is forty fixes. A quick keyboard walk after the MVP costs ten minutes.

**7. Never deploying because it's "not ready yet".** It will never feel ready. Deploy the MVP, and let the live URL push you to finish.

## Quick recap

- Pick **one small idea** you can say in a sentence, and build the **MVP** first.
- Sketch the screens, then **break them into components**, the chapter 14 way.
- Sort every piece of state into its **home** (local, URL, shared client, server) and derive everything else.
- **Choose tools on purpose.** Start with plain React, and add a library only when you feel the pain it removes.
- Build in **small steps**, run it after each one, and commit every working step.
- Test the logic that matters, do an **accessibility pass**, then **deploy early** with a good README.
- Ask for a code review, and learn from it.

---

## Congratulations! 🎉

Look at how far you've come. In chapter 01, you replaced Vite's welcome page with `<h1>Hello, React!</h1>`. Now you can plan an app from a blank page, choose your tools and say why, build it with typed components, test the parts that matter, make it work for people using a keyboard or a screen reader, and put it on the internet for anyone to use.

| Project | What it taught you |
|---|---|
| To-do app (10) | Components and state, the React way |
| Recipe Finder (21) | Data from someone else's server, and hooks that compose |
| Bookstore (29) | Pages, shared state, and tests that give you confidence |
| Task Board (37) | The whole toolbox, and why server state is different |
| Your project (41) | Making every decision yourself, and shipping it |

That's the journey from "following a tutorial" to "building software". Be proud of it.

**Where to go next:**

- **Node.js frameworks, like Express:** build your own APIs for your React apps to talk to. Your task board could finally have a real backend, and your secrets a server to live on.
- **React Native:** use everything you've learned here to build apps for phones.

Each of these will get its own folder here. Until then, keep building. Pick another idea from the [exercises](exercises.md), rebuild an app you use every day, or go back to one of your projects and do its nice-to-haves. Every project you finish makes the next one easier.

[Back to the roadmap](../README.md)
