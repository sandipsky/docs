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
