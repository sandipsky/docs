# 10 The Agentic Loop

## What is it?

The **agentic loop** is a four-step habit for getting good work out of Claude Code:

```
Explore  →  Plan  →  Code  →  Check
```

First Claude looks around. Then it says what it intends to do. Then it does it. Then it proves it worked.

You've met these steps one at a time already. This chapter puts them in order and makes them a routine.

## Why does it matter?

In [chapter 09](../09-project-small-app/notes.md) you built a small app from an empty folder. There was nothing to explore, and the steps were tiny, so "just ask for it" worked.

Real projects aren't empty. They have existing code, existing patterns, and helper functions that already do half of what you want. When you jump straight to "build this", three things tend to go wrong:

- **Claude solves the wrong problem.** It guessed what you meant, and guessed differently from you.
- **Claude ignores what's already there.** It writes a new date helper when the project has had one for years.
- **Claude says "done" and it isn't.** Nothing was run, so nobody knows.

Each step of the loop exists to stop one of those:

| Step | The problem it prevents |
|---|---|
| **Explore** | Working from guesses instead of the real code |
| **Plan** | Building the wrong thing, or building it the wrong way |
| **Code** | (This is the part everyone already does) |
| **Check** | "Done" with no proof |

The loop costs a few extra minutes at the start. It saves you from finding out at the end that an hour of work has to be thrown away.

## Real-world example

Think about a plumber fixing a leak.

| The plumber | The loop |
|---|---|
| Looks under the sink, turns the tap, finds where the water comes from | **Explore** |
| "It's the washer. I'll replace it. Twenty minutes, and I need to turn the water off." | **Plan** |
| Replaces the washer | **Code** |
| Turns the water back on and watches for drips | **Check** |

Now picture a plumber who skips straight to the third step. They walk in, replace the nearest pipe, and leave without turning the water on. You'd never hire them again. Yet that's how most people use an AI on day one.

## How it works

*Checked against Claude Code 2.1.330, in November 2026.*

Let's run the whole loop on a real task. In your Bookshelf project, there's no way to remove a book. We'll add one.

### Step 1: Explore

Ask Claude to look, and tell it clearly not to change anything yet.

```
I want to add a command that removes a book by its id.
Before doing anything, read the code and tell me how the existing
commands are put together. Don't change any files yet.
```

Claude reads the files and reports back. A good answer mentions things like:

- commands are handled in a `switch` in `src/cli.js`,
- the rules live in `src/books.js`, as functions that return a new list,
- `finishBook` already shows how to deal with an id that doesn't exist.

That third point is the valuable one. Claude has found the pattern to copy. Without exploring, it might have invented a different way of handling a missing id, and your app would behave two different ways for the same mistake.

**What you look for:** did Claude find the right files? Did it notice the existing patterns? Is anything in its summary wrong? This is your cheapest chance to correct a misunderstanding.

### Step 2: Plan

Now ask for a plan, still with no edits.

```
Good. Now plan how you'd add a "remove <id>" command.
List the files you'd change, what you'd add to each,
and how we can check that it works. Still no edits.
```

A good plan is short and specific:

```
1. src/books.js: add removeBook(books, id). It throws the same kind
   of error as finishBook when the id doesn't exist.
2. src/cli.js: add a "remove" case that calls removeBook and saves.
   Add a line to the help text.
3. Check: add a book, remove it, run "list", and confirm it's gone.
   Also try removing an id that doesn't exist.
```

**What you look for:**

- Is it the *smallest* change that does the job?
- Does it reuse what's there?
- Does it say how it'll be checked?
- Is there anything you'd do differently?

If something's off, say so now. Changing a plan costs one sentence. Changing code costs a review.

There's a dedicated **plan mode** that makes this step safer, because Claude can't edit files while it's on. [Chapter 13](../13-plan-mode/notes.md) covers it. For now, plain words work fine.

### Step 3: Code

This is the short part.

```
That plan is good. Go ahead.
```

Claude makes the edits and asks permission for each. Because you already agreed on the plan, reviewing the diffs is quick. You're only checking that the code matches what you agreed.

**What you look for:** anything in the diff that *wasn't* in the plan. An extra file, a "while I was here" tidy-up, a renamed function. If you see one, ask why, or say no.

### Step 4: Check

Never end on "done". End on proof.

```
Now check it. Add a test book, remove it, and list the books.
Then try removing id 999. Show me the output of each command.
```

Claude runs the commands and shows what happened. You're asking for **evidence**, not a summary. "It works" is a claim. The output of the command is proof.

Then check once yourself:

```
! node src/cli.js list
```

**What you look for:** does the output show what should happen, including the case that should fail? Did running the check leave any mess behind, such as a test book still saved in your data file?

When you're happy, commit. One loop, one commit.

### The whole loop at a glance

| Step | You say | You look for |
|---|---|---|
| **Explore** | "Read the code and tell me how it works. No changes yet." | The right files, the existing patterns |
| **Plan** | "Plan the change. Which files, what, and how we'll check it." | Small, reuses what's there, has a check |
| **Code** | "Go ahead." | Diffs that match the plan and nothing more |
| **Check** | "Run it and show me the output." | Real evidence, including the failure case |

### When to skip steps

The loop is a habit, not a law. Using all four steps to fix a typo would be silly.

A handy test: **could you describe the whole change in one sentence, and would you know at a glance if it was right?** If yes, just ask for it.

| Task | What to do |
|---|---|
| Fix a typo, rename a variable, change some wording | Just ask. Check the diff |
| A small change in a place you know well | Skip Explore. Maybe skip Plan. Never skip Check |
| Anything touching several files | The full loop |
| Code you've never seen before | The full loop, with a long Explore |
| You're not sure what you want yet | Stay in Explore and Plan until you are |

Notice that **Check never gets skipped.** It only gets smaller. For a typo, the check is reading the diff.

### Steering inside the loop

The loop isn't a train you can't get off.

- **Press Esc** the moment Claude heads the wrong way. Don't wait for it to finish.
- **Correct early.** A wrong idea in the Explore step costs nothing to fix. The same wrong idea after the Code step costs a rewind.
- **Go back a step.** If the plan turns out to be wrong halfway through coding, stop and plan again.
- **Start fresh after two failed fixes.** If you've corrected Claude twice on the same thing and it's still wrong, the conversation is now full of wrong attempts. Type `/clear` and start again with a better prompt, using what you learned.

### Loops inside loops

There are really two loops running.

Claude has its own: read a file, make an edit, run a command, look at the result, try again. It does that many times inside each of your steps.

You run a bigger, slower one around it: explore, plan, code, check.

Your job isn't to do Claude's loop for it. It's to run yours well: point it in the right direction, agree the plan, and insist on proof.

### Keep each loop small

One big loop is risky. Ten small ones are safe.

"Add accounts, logins, and sharing" is a week of work in one request. If the result is wrong, you can't tell which part broke it.

Split it instead. Each piece gets its own loop and its own commit:

```
Loop 1: remove a book        →  check  →  commit
Loop 2: search by title      →  check  →  commit
Loop 3: sort the list        →  check  →  commit
```

If loop 3 goes wrong, you throw away loop 3. Loops 1 and 2 are safe in Git.

## Common mistakes

- **Skipping Explore.** Claude then builds from guesses and misses the helper that already exists.
- **Accepting a plan you didn't read.** The plan is where you catch the wrong approach cheaply. Skimming it throws that away.
- **A plan with no check in it.** If nobody said how it'll be verified, it won't be.
- **Ending on "done".** Ask for the output. A claim isn't proof.
- **One giant loop.** The bigger the step, the harder the review, and the more you lose when it goes wrong.
- **Using the full loop for a typo.** Match the ceremony to the size of the change.
- **Correcting the same thing a third time.** After two failed corrections, clear the session and restart with a better prompt.

## Quick recap

- The loop is **Explore, Plan, Code, Check**.
- **Explore** stops Claude from guessing. **Plan** stops it from building the wrong thing. **Check** stops "done" from being a lie.
- Say "no changes yet" during Explore and Plan.
- In Check, ask for **evidence**: the real output of a real command.
- Skip steps for tiny changes, but never skip the check.
- Keep loops small: one piece of work, one check, one commit.
