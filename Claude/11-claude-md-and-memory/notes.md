# 11 CLAUDE.md and Memory

## What is it?

`CLAUDE.md` is a plain text file of notes that Claude Code reads **at the start of every session**. You write down what Claude should always know about your project, and from then on you don't have to say it again.

There's also **auto memory**: notes that Claude writes *for itself* as it learns how you like to work.

Together they answer the problem from [chapter 02](../02-how-claude-works/notes.md): a new session starts with an empty desk. These files are what gets put on the desk before you arrive.

## Why does it matter?

Think back to the expense tracker in chapter 09. How many times did you tell Claude "no packages" or "use double quotes"? Every time you opened a new session, that knowledge was gone.

Without a notes file, you have two bad options:

- repeat yourself in every prompt, or
- forget to, and get code that doesn't fit your project.

With one, Claude starts every session already knowing your commands, your conventions, and your "never do this" list. It's the single biggest improvement you can make to how Claude behaves in a project, and it takes ten minutes.

## Real-world example

Think of the note you'd leave for a house-sitter, stuck to the fridge.

| A good fridge note | A bad fridge note |
|---|---|
| "The back door sticks. Lift the handle as you push." | "Please take care of the house." |
| "Bins go out Tuesday night." | A history of when the house was built |
| "Don't let the cat into the bedroom." | A list of every room, which they can see for themselves |

A good note is short, specific, and full of things a newcomer couldn't work out alone. `CLAUDE.md` is that note.

## How it works

*Checked against Claude Code 2.1.330, in November 2026.*

### Create one with /init

In your Bookshelf project, start a session and type:

```
/init
```

Claude reads through the project and writes a starter `CLAUDE.md` for you. If one already exists, it suggests improvements instead of replacing it.

Treat the result as a first draft. `/init` describes what it can see, and it often includes things Claude would work out anyway. Your job is to cut it down and add what only you know.

### What a good one looks like

Here's a `CLAUDE.md` for Bookshelf:

```markdown
# Bookshelf

A small command-line reading list. Plain JavaScript, no packages.

## Commands

- Run the app: `node src/cli.js <command>`

## Rules

- Use double quotes and semicolons.
- Functions in `src/books.js` take the list of books and return a new
  list. They never read or write files.
- Only `src/store.js` touches the file system.
- Don't add packages. Ask first if you think one is needed.
- Never edit `data/books.json` by hand to make something work.
```

It's fifteen lines. Every line is something Claude would otherwise have to guess, or would only discover after getting it wrong.

### What goes in, and what stays out

Use this test for every line: **could Claude find this out by reading the code, and would it actually go and look?** If yes, leave it out.

| Put in | Leave out |
|---|---|
| Commands to run, test, and check the project | A tour of the folders. Claude can list them |
| Conventions: quotes, naming, where things go | A list of your packages. It's in `package.json` |
| Gotchas: "the tests need the database running" | An explanation of how the code works. Claude can read it |
| Decisions that aren't written in the code: "we chose X over Y because..." | Long step-by-step procedures. Those belong in a skill (chapter 21) |
| Things to never do | Anything secret. No passwords or keys, ever |

Write rules that someone could **check**:

| Vague | Checkable |
|---|---|
| "Write clean code." | "Functions do one thing and are under 30 lines." |
| "Format the code properly." | "Use 2 spaces to indent, double quotes, and semicolons." |
| "Test your changes." | "Run `npm test` before you say you're done." |

### Keep it short

Aim for **under 200 lines**. Shorter is better.

This isn't about tidiness. The whole file goes into the context at the start of every session, so every line costs a little. And a long file hides its important lines. If Claude ignores one of your rules, the usual cause is that the rule is buried among fifty others that don't matter.

Writing a rule in capital letters, or adding "IMPORTANT", doesn't reliably help. Cutting the file down does.

### Where the files live

There can be several `CLAUDE.md` files. Claude reads them all and stacks them together.

| File | Who it's for | Share it? |
|---|---|---|
| `CLAUDE.md` in the project folder (or `.claude/CLAUDE.md`) | Everyone working on this project | Yes. Commit it to Git |
| `CLAUDE.local.md` in the project folder | Just you, in this project | No. Add it to `.gitignore` |
| `~/.claude/CLAUDE.md` in your home folder | Just you, in **every** project | No. It's personal |
| A `CLAUDE.md` inside a subfolder | Anyone working in that part of the project | Yes |

Some details worth knowing:

- **Parent folders count.** Claude reads `CLAUDE.md` from the folder you start in and from every folder above it. That's why you practise outside this docs folder.
- **Subfolder files load later.** A `CLAUDE.md` in `src/payments/` is only read when Claude works on a file in there. That keeps it out of the way the rest of the time.
- **Nothing overrides anything.** The files are joined together, not ranked. If two of them disagree, Claude may pick either one. Keep them consistent.

A good split: the project file holds the team's rules, and your personal file holds your own preferences, such as "explain new terms in one sentence".

### Splitting things up

When a project file grows too long, you have two ways to break it up. Both are for later, so here's just the idea.

**Imports.** Write `@` and a path inside `CLAUDE.md`, and that file is pulled in:

```markdown
See @docs/git-workflow.md for how we branch and commit.
```

It keeps things organised, but it doesn't save any context. The imported file loads too.

**Rules files.** Put small Markdown files in a `.claude/rules/` folder. Each one can say which files it applies to, and it only loads when Claude touches a matching file:

```markdown
---
paths:
  - "src/api/**/*.js"
---

Every API function returns an object with `ok` and `data`.
```

That one *does* save context. Rules about your API only appear when Claude is working on your API.

### Auto memory: Claude's own notes

`CLAUDE.md` is what **you** write. **Auto memory** is what **Claude** writes.

When you correct Claude or tell it a preference, it can save a short note for next time. You can also ask directly:

```
Remember that I always want tests written before the code.
```

These notes are kept on your computer, in a folder for this project inside `~/.claude/projects/`. They're separate from your code and they aren't shared with your team. An index file called `MEMORY.md` is loaded at the start of each session, and Claude opens the individual notes when they're relevant.

Auto memory is on by default. To see what's there, or to switch it off, type:

```
/memory
```

That command lists every memory file that applies, yours and Claude's, and lets you open any of them.

Read Claude's notes now and then. They're usually helpful, but a wrong note keeps steering Claude wrong until someone deletes it.

### Which one should hold a fact?

| The fact | Where it belongs |
|---|---|
| "Run `npm test` before finishing" | Project `CLAUDE.md`. The whole team needs it |
| "I prefer short explanations" | Your personal `~/.claude/CLAUDE.md` |
| "My local database is on port 5433" | `CLAUDE.local.md`. True only on your machine |
| Something Claude learned from being corrected | Auto memory. Let Claude keep it |
| "Never push to main" | Not a notes file at all. See below |

### Notes are advice, not locks

This is the most important thing to understand about `CLAUDE.md`.

It's **context**. Claude reads it and nearly always follows it. But it's advice in a conversation, and in a long, busy session a line can get lost.

For a rule that must hold **every single time**, don't rely on a note. Use something that enforces it:

- a **deny** rule, from [chapter 08](../08-permissions-and-safety/notes.md), or
- a **hook**, from chapter 25: a script that always runs at a set moment.

A note says "please don't". A deny rule makes it impossible.

### Check what was loaded

If Claude isn't following your notes, first make sure it read them.

```
/context
```

This shows what's filling the context window, including which memory files were loaded. If your file isn't on the list, Claude never saw it. Check the file's name and where you put it.

### Keep it alive

A notes file isn't something you write once.

**The second-time rule:** the first time Claude gets something wrong, correct it. The second time it makes the same mistake, add a line to `CLAUDE.md`.

And prune as well as add. When a rule stops being true, delete it. A notes file that's half out of date is worse than a short one, because Claude can't tell which half to trust.

## Common mistakes

- **Never trimming what `/init` wrote.** It's a draft. Cut what Claude could work out for itself.
- **A five-hundred-line file.** The important rules drown. Shorter files get followed better.
- **Describing the architecture.** Claude can read the code. Tell it what the code *can't* tell it.
- **Vague rules.** "Write good code" changes nothing. "Run `npm test` before you say you're done" does.
- **Two files that disagree.** Your personal file says tabs and the project file says spaces. Claude picks one, and you don't know which.
- **Putting secrets in it.** The file gets committed and shared. No passwords, no keys.
- **Expecting it to enforce anything.** For a rule that must never be broken, use a deny rule or a hook.
- **Never reading auto memory.** Claude's notes about you can be wrong. Look at them sometimes.

## Quick recap

- `CLAUDE.md` is a notes file Claude reads at the start of every session. `/init` writes a first draft.
- Put in commands, conventions, gotchas, and never-do rules. Leave out anything Claude can find by reading the code.
- Keep it under 200 lines, with rules specific enough to check.
- Project notes are shared in Git. Personal notes live in `~/.claude/CLAUDE.md` or `CLAUDE.local.md`.
- **Auto memory** is Claude's own notebook. Use `/memory` to see and manage it.
- Notes are advice. For rules that must always hold, use deny rules or hooks.
