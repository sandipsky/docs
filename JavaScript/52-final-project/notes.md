# 52 Final Project

You've reached the last chapter of the course. 🎉

This time, there's no step-by-step recipe to follow. You'll pick your own project and build it from start to finish, the way professional developers do. That's a big jump from following milestones, so this chapter shows you the process, one step at a time.

## What you'll build

Something of your own! The [exercises](exercises.md) have a menu of eight project ideas, from a small Pomodoro timer to a Kanban board. You can also bring your own idea.

To show you the process, this chapter follows one small example project all the way through: **Plant Pal**, a page that shows which of your houseplants need water today. It isn't on the menu, so there's nothing to copy. Watch *how* it gets built, then do the same with your project.

Here are the steps:

1. Pick one small idea.
2. Split the must-haves from the nice-to-haves.
3. Sketch the screens and the data.
4. Plan your files.
5. Build the smallest working version, in small steps.
6. Test the logic.
7. Ask for a code review.
8. Polish.
9. Share it.

Professionals follow roughly this path whether the project takes a weekend or a year. The steps are what make a project finishable.

## Step 1: Pick one small idea

A good project starts with a problem you can describe in one sentence:

> **Plant Pal:** see which of my plants need water today.

When you pick your idea:

- **Pick something you'd actually use**, or that a friend would. You'll care more about finishing it, and you'll notice what's missing.
- **Keep it small.** A small app that's finished beats a big app that isn't. Cutting a project down to size is a real skill that professionals use every week.
- **Watch out for "and".** If your one-sentence description needs "and" three times, it's probably three projects.

| Too big | Just right |
|---|---|
| A social network for gardeners | A page that shows which plants need water |
| A budgeting app that connects to your bank | An expense tracker for one person |
| A 3D racing game | A typing speed test |

## Step 2: Must-haves and nice-to-haves

Before you write any code, make two lists:

- **Must-haves** are the features that make the app useful at all. Without any one of them, the app doesn't do its job.
- **Nice-to-haves** would be great, *later*.

Together, the must-haves are your **MVP**, short for **minimum viable product**: the smallest version of the app that's actually useful. You build that first, and nothing else.

| Must-have (the MVP) | Nice-to-have (later, maybe) |
|---|---|
| See a list of my plants | Delete a plant |
| See when each one needs water next | Sort them, thirstiest first |
| Press "Watered" to reset a plant's timer | A photo of each plant |
| Add a new plant | A reminder notification |
| My plants are still there after a refresh | Share the list with my roommate |

Look at the last nice-to-have. Sharing needs a server and user accounts, which is a whole project of its own. That's exactly why it sits on the right. Remember YAGNI from [chapter 45](../45-clean-code/notes.md): "You Aren't Gonna Need It". Nice-to-haves wait until the must-haves work.

## Step 3: Sketch the screens and the data

Grab a pen and paper. Boxes and words are enough: what does the person see, and what can they click?

```
Plant Pal
---------------------------------------------
Fern       Water today!     [Watered]
Basil      in 1 day         [Watered]
Cactus     in 12 days       [Watered]
---------------------------------------------
Name [__________]   Every [ 3 ] days   [Add plant]
```

Then sketch the **data**: what does the app need to remember? For Plant Pal, it's an array of objects, one per plant ([chapter 11](../11-objects/notes.md)):

```js
const plants = [
  { id: 1, name: "Fern", everyDays: 3, lastWatered: "2026-09-21" },
  { id: 2, name: "Basil", everyDays: 2, lastWatered: "2026-09-23" },
  { id: 3, name: "Cactus", everyDays: 14, lastWatered: "2026-09-22" },
];
```

(If today is September 24th, 2026, that's exactly the sketch above.)

Three good habits are hiding in that data:

- **Store the facts, and work out the rest.** The data remembers *when* each plant was last watered, not the words "Water today!". That label changes every day, so the app works it out fresh each time it draws the page.
- **Store dates as ISO strings**, like `"2026-09-21"`. They survive the trip through JSON and `localStorage` ([chapter 23](../23-json-and-local-storage/notes.md)), and nobody has to guess what `03/04` means ([chapter 19](../19-dates-and-times/notes.md)).
- **Give every item an `id`.** Names can change or repeat, but an id never does. A "Watered" button can carry its plant's id in a `data-id` attribute, so one listener knows which plant was clicked ([chapter 21](../21-events/notes.md)).

Sketching takes ten minutes, and it saves hours. Most "how do I build this?" questions turn out to be "what should my data look like?" questions.

## Step 4: Plan your files

Now decide which file does which job:

```
plant-pal/
├── index.html       the page
├── style.css        the looks
├── main.js          starts the app, listens to events, decides what happens
├── plants.js        the logic: plain functions, no page code at all
├── storage.js       save() and load(), from chapter 23
├── ui.js            draws the plants on the page
├── plants.test.js   tests for plants.js
└── package.json     { "type": "module" }, so Node can run the tests
```

It's the same idea as the weather app in [chapter 39](../39-project-weather-app/notes.md): each file has one job, and when something breaks, you know where to look.

The most important line in that plan is `plants.js`. It never touches the page. It takes data in and hands answers back, like the pure functions in [chapter 43](../43-functional-programming/notes.md). That has a big payoff: Node can run its tests. Node has no `document`, so any file that touches the page can't be tested there, but a file of plain functions can.

Because the app uses modules, open it with **Live Server**, not by double-clicking ([chapter 29](../29-modules/notes.md)).

## Step 5: Build the smallest working version first

An **MVP** (minimum viable product) is the smallest version of your app that works from start to finish. For Plant Pal: show a fixed list of plants with their "water in N days" labels. No form, no saving, no styling yet.

Then add one must-have at a time, and run the app after each one:

1. Show a hard-coded list of plants.
2. Add a plant with the form.
3. The "Watered" button updates a plant.
4. Save and load with `localStorage`.
5. Only then: styling and nice-to-haves.

Think of building a house: foundation first, then walls, then paint. If you paint first, you'll repaint everything later.

> **Tip:** if a step feels too big, it is. Split it until each piece takes under an hour.

## Step 6: Test the logic

Because `plants.js` has no page code, you can test it with Node's built-in test runner ([chapter 46](../46-testing/notes.md)). Here's one function and its tests:

```js
// plants.js
const DAY_MS = 24 * 60 * 60 * 1000;

// How many days until this plant needs water? 0 means "today" (or overdue).
export function daysUntilWater(plant, today) {
  const last = new Date(plant.lastWatered);
  const next = new Date(last.getTime() + plant.everyDays * DAY_MS);
  const days = Math.round((next - new Date(today)) / DAY_MS);
  return Math.max(days, 0);
}
```

```js
// plants.test.js
import { test } from "node:test";
import assert from "node:assert/strict";
import { daysUntilWater } from "./plants.js";

test("a fern watered 3 days ago needs water today", () => {
  const fern = { name: "Fern", everyDays: 3, lastWatered: "2026-09-21" };
  assert.equal(daysUntilWater(fern, "2026-09-24"), 0);
});

test("an overdue plant still says 0, never a negative number", () => {
  const basil = { name: "Basil", everyDays: 2, lastWatered: "2026-09-01" };
  assert.equal(daysUntilWater(basil, "2026-09-24"), 0);
});
```

Run `node --test` in the project folder. Notice that `today` is a parameter instead of reading the real date inside the function. That makes the function pure, so the tests give the same answer every day.

## Step 7: Save your progress often

Professionals use **git** to save snapshots of their code, so they can go back if something breaks. It'll get its own folder in this course. Until then, at least copy your project folder to a backup after each working step.

## Step 8: Ask for a code review

When a feature works, ask Claude to review it. A good request looks like this:

> "Here's my `plants.js` and `main.js` for Plant Pal. It works, but please review it for bugs, naming, and anything I could make simpler."

Use the feedback from [chapter 45](../45-clean-code/notes.md) and [chapter 51](../51-security-basics/notes.md) as your own checklist before you ask.

## Step 9: Polish and share

Before you share, check:

- It works on a phone-sized window (F12, then the device toolbar icon).
- Errors show friendly messages, not a blank page ([chapter 18](../18-error-handling/notes.md)).
- User text goes in with `textContent`, never `innerHTML` ([chapter 51](../51-security-basics/notes.md)).
- Import paths match file names exactly, including capital letters. Windows forgives `./Plants.js` for `plants.js`, but web servers usually don't.

To put it online for free, **GitHub Pages** and **Netlify** can host a folder of HTML, CSS, and JavaScript. Both have short "getting started" guides, and both give you HTTPS automatically.

## Your skills checklist

Try to show off as many of these as fit your idea (don't force them in):

| Skill | Chapter |
|---|---|
| Arrays of objects and array methods | [10](../10-arrays/notes.md), [11](../11-objects/notes.md), [13](../13-array-methods/notes.md) |
| DOM, events, and event delegation | [20](../20-dom-basics/notes.md), [21](../21-events/notes.md) |
| Forms with validation | [22](../22-forms/notes.md) |
| Saving with `localStorage` | [23](../23-json-and-local-storage/notes.md) |
| Modules | [29](../29-modules/notes.md) |
| `fetch` with loading and error states | [33](../33-fetch-and-apis/notes.md) |
| Debounce or throttle | [34](../34-debounce-and-throttle/notes.md) |
| Pure functions and tests | [43](../43-functional-programming/notes.md), [46](../46-testing/notes.md) |
| Clean code and security basics | [45](../45-clean-code/notes.md), [51](../51-security-basics/notes.md) |

## Common mistakes

**1. Starting too big.** "A social network with chat" never gets finished. "A habit tracker that saves to `localStorage`" does. Finish small, then grow it.

**2. Styling before it works.** Hours of CSS on a page whose buttons don't work yet. Build the MVP first.

**3. Mixing logic and page code.** If your calculations live inside click handlers, you can't test them. Keep them in plain functions in their own file.

**4. Writing a lot before running anything.** Run the app after every small change. A bug from the last five minutes is easy to find. A bug from the last five hours isn't.

## Quick recap

- Pick one small idea, and split features into must-haves and nice-to-haves.
- Sketch the screens and the data before writing code.
- Give each file one job, and keep the logic in pure, testable functions.
- Build an MVP first, then add one feature at a time, testing as you go.
- Get a review, polish, and share it online.

---

## Congratulations! 🎉

You've gone from `console.log("Hello, world!")` to building, testing, and shipping real apps. That's a huge journey. Be proud of it.

**Where to go next:**

- **TypeScript:** JavaScript with types, which catches many bugs before you even run the code.
- **React:** the most popular library for building bigger user interfaces.
- **Node.js frameworks** like Express: build real servers and APIs.
- **Data structures and algorithms:** the deeper computer science behind fast code.

Each of these will get its own folder here. Until then, pick a project idea from the [exercises](exercises.md) and build it.

[Back to the roadmap](../README.md)
