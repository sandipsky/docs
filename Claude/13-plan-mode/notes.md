# 13 Plan Mode

## What is it?

**Plan mode** is a setting where Claude can look and think, but **can't change your files**. It reads the code, researches the problem, and writes a plan. Then it stops and waits for you to approve it.

It's the Plan step of the loop from [chapter 10](../10-the-agentic-loop/notes.md), with a safety catch added.

## Why does it matter?

In chapter 10 you asked for a plan with plain words: "Plan this. No edits yet." That works. But it relies on Claude keeping its promise, and on you remembering to say it every time.

Plan mode turns the promise into a guarantee. While it's on, edits are off.

That matters most in exactly the situations where mistakes are expensive:

- a change that touches many files,
- code you don't know well,
- a task where you're not yet sure what you want.

Reading a plan takes a minute. Reviewing three hundred changed lines, discovering the approach is wrong, and unpicking it takes much longer. Plan mode moves your review to the cheapest possible moment.

## Real-world example

Think about using a map app before a long drive.

| The drive | Plan mode |
|---|---|
| You type the destination | You describe the task |
| The app shows the route before you set off | Claude shows the plan before it edits |
| "That goes through the city centre at rush hour. Avoid motorways." | "Don't change the database. Keep it in one file." |
| The app works out a new route | Claude revises the plan |
| You press Start | You approve |

You wouldn't start driving and *then* find out the route crosses a toll bridge. The preview costs nothing, and it's the best moment to change your mind.

## How it works

*Checked against Claude Code 2.1.330, in November 2026.*

### Turning it on

There are three ways.

**1. Cycle to it.** Press **Shift + Tab** until the line near the prompt says plan mode is on. (On some Windows terminals the key is **Alt + M**.)

**2. Use the command.** Type `/plan`, or add the task straight after it:

```
/plan add a search command that finds books by title or author
```

**3. Start in it.** From your terminal:

```
claude --permission-mode plan
```

### What Claude can do in plan mode

| Can | Can't |
|---|---|
| Read any file in the project | Edit your source files |
| Search the code | Create new source files |
| Run commands to explore | |
| Ask you questions | |
| Write the plan | |

So it's still doing real work. It's doing the Explore and Plan steps, and stopping before Code.

### The flow

Let's plan a search feature for Bookshelf. In plan mode, type:

```
Add a "search <text>" command that lists books whose title or author
contains the text. Upper and lower case shouldn't matter.
```

Claude reads the code, perhaps asks you a question or two, and then presents a plan. Something like this:

```
Plan: add a search command

1. src/books.js
   Add searchBooks(books, text). It returns the books whose title or
   author contains the text, ignoring case.

2. src/cli.js
   Add a "search" case. Print each match with formatBook.
   If nothing matches, print "No books match".
   Add a line to the help text.

3. Check
   Run: search dune, search TOLKIEN, search xyz
   Expect: one match, one match, and the "no books" message.
```

Then you get three choices:

| Choice | What happens |
|---|---|
| **Yes, and use auto mode** | Claude carries out the plan without asking about each step |
| **Yes, manually approve edits** | Claude carries out the plan, and asks before each edit |
| **No, keep planning** | Nothing changes. You tell Claude what to rethink |

On some setups the first option reads "Yes, auto-accept edits" instead.

While you're learning, choose **manual**. You've agreed to the plan, but you still want to see that each diff matches it.

One warning. When this question is on screen, pressing **Shift + Tab** *approves* the plan. If you just want to leave, press **Esc** first.

### Reading a plan

A plan is only useful if you actually judge it. Here's what to look for.

| Question | Why it matters |
|---|---|
| Does it solve **my** problem? | Claude may have understood something slightly different |
| Is it the **smallest** change that works? | Plans tend to grow. Extra parts mean extra risk |
| Does it **reuse** what's already there? | New code that copies old code is a future bug |
| Which files does it touch? | A surprise on that list is worth a question |
| How will it be **checked**? | No check in the plan means no check at the end |
| What's **missing**? | The empty case, the error case, the unusual input |

Go back to the search plan. A careful reader might ask:

- What if someone runs `search` with no text at all?
- Should an empty result count as a failure, or is it fine?

Neither is in the plan. That doesn't make it a bad plan. It means there are two decisions nobody has made yet, and now is the time.

### Pushing back

Choose **No, keep planning**, and say what you want changed.

```
Two things. If no text is given, print the usage line, like "add" does.
And put the check for an empty result in cli.js, not in books.js.
```

Claude revises the plan and shows it again. Go round as many times as you need. Each round costs seconds.

Other useful things to say:

- "What's the simplest version of this that would still be useful?"
- "Give me two different ways to do this, and what each one costs."
- "What could go wrong with this plan?"
- "What did you assume that I didn't tell you?"

That last one is surprisingly powerful. Claude will often list an assumption you'd never have agreed to.

### Editing the plan yourself

Sometimes it's faster to fix the plan by hand than to explain what's wrong. Press **Ctrl + G** while the plan is showing, and it opens in your text editor. Change it, save, and close. Claude continues with your version.

### Where plans go

Claude Code saves each plan as a file, in a `plans` folder inside `~/.claude`.

Plans also have a useful property from [chapter 12](../12-managing-context/notes.md): they survive a compact. If a long task runs out of room and the conversation is summarised, the plan is kept. That makes an approved plan a good anchor for a big piece of work.

### When to use it

Planning has a cost: a little time, and a little of your attention. Spend it where it pays.

| Use plan mode | Skip it |
|---|---|
| The change touches several files | A typo, a rename, or a one-line fix |
| You don't know this part of the code | You could describe the whole diff in a sentence |
| There's more than one reasonable approach | There's only one obvious way |
| A mistake would be expensive | It's trivial to undo |
| You're not sure what you want yet | You know exactly what you want |

That last row on the left matters more than it looks. Plan mode isn't only for hard tasks. It's a safe place to think out loud. You can explore an idea with Claude, knowing nothing can be changed until you say so.

### Planning with one model, building with another

In [chapter 05](../05-models-effort-and-cost/notes.md) you met `/model opusplan`. It uses the stronger model while you're in plan mode, and switches to a faster one to carry the plan out. The hard thinking happens in the plan, so that's where the stronger model earns its keep.

## Common mistakes

- **Approving a plan you skimmed.** Then plan mode has given you nothing but a delay. Read every step.
- **Choosing the auto option too early.** While you're learning, approve edits by hand and compare each diff with the plan.
- **Planning a one-line change.** It's ceremony for nothing. Just ask.
- **A plan with no check in it.** Ask for one before you approve.
- **Letting the plan grow.** If step 6 is "also tidy up the other commands", say no. That's a different task.
- **Pressing Shift + Tab to leave the approval question.** That approves it. Press Esc.
- **Treating the plan as fixed.** If something surprising turns up while Claude is coding, stop and plan again.

## Quick recap

- In **plan mode**, Claude can read and research, but can't edit your files until you approve a plan.
- Turn it on with **Shift + Tab**, with `/plan`, or by starting with `--permission-mode plan`.
- When the plan appears, you choose: approve with auto, approve and check each edit, or keep planning.
- Judge the plan: is it small, does it reuse what exists, how will it be checked, and what's missing?
- Push back as often as you like. Changing a plan is nearly free.
- Use it for anything large, unfamiliar, or uncertain. Skip it for trivial changes.
