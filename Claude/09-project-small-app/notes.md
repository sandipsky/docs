# 09 Project: A Small App, Built Together

## What you'll build

A small **expense tracker** that runs in your browser. You'll build it from an empty folder, with Claude Code doing the typing and you doing the deciding.

When you're done, the app will let you:

- add an expense with a description, an amount, and a category,
- see all your expenses in a list,
- see the total,
- delete an expense,
- close the browser, come back tomorrow, and find everything still there.

```
Expense Tracker

[ Description        ] [ Amount ] [ Category ▾ ] [ Add ]

Lunch              Food          4.50    ×
Bus pass           Transport    25.00    ×
Notebook           Study         3.20    ×

Total: 32.70
```

The app is simple on purpose. This project isn't about the code. It's about the **way of working**: small steps, clear prompts, a review after every change.

**What you'll practise:**

| Skill | Chapter |
|---|---|
| Choosing Claude Code over chat for project work | [01](../01-what-claude-is/notes.md) |
| Not trusting what you haven't checked | [02](../02-how-claude-works/notes.md) |
| Goal, context, done, and limits | [03](../03-prompting-basics/notes.md) |
| Reading a diff, running the result, and rewinding | [07](../07-your-first-session/notes.md) |
| Answering permission questions on purpose | [08](../08-permissions-and-safety/notes.md) |

Seven milestones. After each one the app does a bit more, and you check it in the browser before moving on.

## Getting started

*Checked against Claude Code 2.1.330, in November 2026.*

This project gets its own folder, next to your `bookshelf` one.

```
cd ~/claude-practice
mkdir expense-tracker
cd expense-tracker
git init
```

Don't start Claude yet. First you need a brief.

## The rules of the road

You'll follow five rules for the whole project. They're the habits this course wants to build, so treat them as part of the exercise.

1. **One step per prompt.** Each milestone is one small thing. Don't combine them.
2. **Read every diff.** Before you approve an edit, check that it does what you asked and nothing else.
3. **Test in the browser yourself.** Claude can't see your screen in this chapter. You're the check.
4. **Commit after every milestone that works.** Then you can always get back to a working app.
5. **Undo, don't argue.** If a step goes wrong, rewind and write a clearer prompt.

Stay in the default permission mode, the one that asks before each edit. It's slower. That's the point.

## Milestone 1: Write the brief

A **brief** is a short description of what you're building and what you're not. It's the context from [chapter 03](../03-prompting-basics/notes.md), written down once so you don't repeat it in every prompt.

If you did exercise 4 in chapter 03, you already have one. Copy it into this folder as `BRIEF.md`. Otherwise, create `BRIEF.md` with this:

```markdown
# Expense Tracker

A tiny app for one person to track what they spend.

## How it must work

- It runs by opening index.html in a browser. No server, no build step.
- Three files only: index.html, style.css, app.js.
- Plain JavaScript. No packages, no frameworks.
- app.js is loaded with a normal script tag, not as a module.

## First version

- Add an expense: description, amount, category.
- Categories: Food, Transport, Study, Fun, Other.
- Show all expenses in a list.
- Show the total.
- Delete an expense.
- Remember expenses between visits.

## Style

- Simple and clean. Readable on a phone.
- Code a beginner can read: clear names, small functions, a few comments.
- Double quotes and semicolons in JavaScript.

## Not in the first version

- Editing an expense, charts, logins, or more than one user.
```

Look at the "How it must work" section. Those four lines are **limits**. Without them, Claude might well reach for React, a build tool, and twenty packages, because that's what most modern apps use. One of the lines has a practical reason too: a script loaded as a module won't run when you open a file directly, so the app would look broken.

Commit the brief:

```
git add .
git commit -m "Add the project brief"
```

## Milestone 2: Let Claude ask questions

Start Claude Code in the `expense-tracker` folder. Before any code, have it read the brief and look for gaps:

```
Read BRIEF.md. Don't write any code yet.
Ask me up to five questions about anything you'd otherwise have to guess.
```

Answer the questions. Where your answer changes the plan, ask Claude to update `BRIEF.md` so the decision is written down.

Typical things Claude might ask:

- Which currency symbol, if any?
- Newest expense first, or oldest first?
- What happens if someone types a negative amount?

You don't need the "right" answer. You need *an* answer, chosen by you instead of guessed by Claude.

**Check:** `BRIEF.md` now holds your decisions. Read the diff before approving any change to it. Then commit.

## Milestone 3: The smallest first version

Ask for the least that could work. Not the whole app.

```
Build the smallest first version from BRIEF.md: the page with the form,
and a list that shows expenses I add. Keep them in memory for now.
No total, no delete, and no saving yet. I'll add those one at a time.
```

Claude will create three files, and ask your permission for each one. Read them as they come.

Then open the page. Double-click `index.html`, or from the terminal:

| System | Command |
|---|---|
| Windows | `start index.html` |
| macOS | `open index.html` |
| Linux | `xdg-open index.html` |

**Check in the browser:**

- Can you add an expense and see it appear?
- Add three. Do they all show?
- Refresh the page. They should disappear. That's correct for now.
- Open the browser's console with **F12**. Are there any red errors?

**If something's wrong,** tell Claude exactly what you saw. "It doesn't work" gives it nothing. "I click Add and nothing appears, and the console says `addExpense is not defined`" gives it everything.

When it works, commit:

```
! git add . && git commit -m "First version: add and list expenses"
```

## Milestone 4: The total

From here on, you write the prompts. Each one should say what you want, how you'll check it, and what to leave alone.

**Your goal:** show the total of all expenses under the list, and keep it correct as you add more.

**Check in the browser:**

- Add 4.50 and 25. Does the total say 29.50?
- Add 0.10 and 0.20. What does the total show? If it says something like `0.30000000000000004`, you've met a famous JavaScript surprise. Tell Claude what you see and ask it to explain and fix it.

Commit when it works.

## Milestone 5: Delete

**Your goal:** each expense gets a way to remove it, and the total updates.

**Check in the browser:**

- Delete the middle one of three. Did the right one go?
- Delete them all. What does the page show when the list is empty? Is that what you want?

That last question matters. Nobody asked for an "empty" message. If you want one, say so. If Claude added one on its own, decide whether you like it.

Commit when it works.

## Milestone 6: Remember between visits

**Your goal:** expenses survive closing the browser.

Browsers have a small built-in storage called **localStorage**. It keeps text for one website on one computer. You may remember it from your JavaScript course.

**Check in the browser:**

- Add two expenses and refresh. Still there?
- Close the browser completely and open the file again. Still there?
- Delete one and refresh. Is it still gone?

Before you approve the edit, read how Claude handles the very first visit, when nothing has been saved yet. Does the code cope with that?

Commit when it works.

## Milestone 7: Refuse bad input, then read it all

**Your goal:** the app refuses an expense with no description, or with an amount that's zero, negative, or not a number. It tells the person what's wrong.

This milestone needs decisions. Where does the message appear? What does it say? Decide first, then put your decisions in the prompt.

**Check in the browser:** try to break it. Empty fields. Letters in the amount. A huge number. Spaces only.

Then finish with a read-through. This is the most important step in the project.

```
I want to understand every line of app.js before I call this done.
Walk me through it one function at a time. Stop after each function
so I can ask questions.
```

If there's any part you can't explain afterwards, ask again. Then ask one more question:

```
Is there anything in this code that a careful reviewer would want
simplified or removed? Don't change anything. Just list it.
```

Pick one item from the list, have Claude make that change, and review it.

Commit. You're done.

## Looking back

Open your journal, `journal/ch09.md`, and answer these.

- **Where did Claude add something you didn't ask for?** Was it welcome? How could your prompt have prevented it?
- **Which of your prompts worked best first time?** What did it have that the others lacked?
- **Did you rewind at all?** What had gone wrong: the prompt, the size of the step, or something else?
- **What did you explain more than once?** Perhaps "double quotes", or "no packages". Things you repeat belong in a notes file that Claude reads every session. That's `CLAUDE.md`, coming in [chapter 11](../11-claude-md-and-memory/notes.md).
- **Who was the check in this project?** You were, by clicking around in a browser. That was slow, and you could only test what you thought of. [Chapter 14](../14-letting-claude-check-its-own-work/notes.md) shows how to let Claude check its own work.

## Common mistakes

- **Asking for the whole app at once.** You get four hundred lines to review in one go, and when something's broken you don't know where to look.
- **Skipping the brief.** Then every prompt has to carry the context, and you'll forget it somewhere.
- **Approving three new files without reading them.** New files are diffs too. They're just all green.
- **Testing only the happy path.** Adding one normal expense proves little. Try the empty list, the bad input, the refresh.
- **Not committing after a working step.** When the next step breaks something, you have nothing to go back to.
- **Finishing without understanding the code.** If you can't explain it, you haven't finished. You've only stopped.

## Quick recap

- A written **brief** carries your context and your limits, so prompts can stay short.
- Let Claude **ask questions** before it builds.
- Build the **smallest version first**, then add one feature per step.
- After every step: **read the diff, test it yourself, commit.**
- When a step goes wrong, **rewind** and write a clearer prompt.
- You're done when you can explain every line, not when it runs.
