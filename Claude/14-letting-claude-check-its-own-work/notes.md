# 14 Letting Claude Check Its Own Work

## What is it?

A **check** is anything Claude can run that answers one question: **did it work?**

A test that passes or fails. A type checker that reports errors. A linter. The program itself, run with real input. Each one gives Claude a clear signal it can read and act on.

This chapter is about giving Claude those signals, so it can find and fix its own mistakes before you ever see them.

## Why does it matter?

In [chapter 09](../09-project-small-app/notes.md) you were the check. After every change, you opened the browser and clicked around. It worked, but it had three problems:

- **It was slow.** Every round needed you.
- **You only tested what you thought of.** The bug you didn't imagine went unnoticed.
- **Old features broke quietly.** Adding "delete" could break "total", and you'd only find out if you happened to re-test it.

Now imagine Claude can run a command that says "14 tests pass, 1 fails, and here's which one". Everything changes:

1. Claude makes a change.
2. It runs the check.
3. It sees the failure.
4. It fixes it and runs the check again.

All of that happens before it says "done". You get the result plus the proof.

The most common complaint about AI coding is "it said it was finished and it wasn't". That's almost never a problem with the model. It's a missing check. If Claude has no way to find out whether it worked, "done" only means "I stopped typing".

## Real-world example

Think about baking bread.

| Baking | Coding with Claude |
|---|---|
| "It's probably done. It's been about forty minutes." | "It should work now." |
| Push a thermometer into the loaf: 96 degrees. Done | Run the tests: all pass |
| Knock on the bottom and listen | Run the program and read the output |
| Take it out, cut it, and find it raw in the middle | Ship it, and find the bug in front of users |

A thermometer doesn't make you a better baker. It tells you the truth, quickly, so you can fix things while there's still time.

## How it works

*Checked against Claude Code 2.1.330 and Node.js 24, in November 2026.*

### Kinds of checks

| Check | The question it answers | Example command |
|---|---|---|
| **Tests** | Does the code do what we said it should? | `npm test` |
| **Type checker** | Do the types line up? | `npx tsc --noEmit` |
| **Linter** | Any common mistakes or style problems? | `npx eslint .` |
| **Build** | Does the project still compile? | `npm run build` |
| **Running it** | What actually happens with real input? | `node src/cli.js list` |
| **A screenshot** | Does it look right? | A browser tool. See chapter 32 |

The best checks share three features. They're **fast**, so Claude can run them often. They give a clear **pass or fail**. And when they fail, they say **where**.

### Give Bookshelf its first check

Bookshelf has no tests yet. Let's add some.

Node.js has a test runner built in, so there's nothing to install. Add a test script to `package.json`:

```json
"scripts": {
  "start": "node src/cli.js",
  "test": "node --test"
}
```

Then create `test/books.test.js`:

```js
import assert from "node:assert/strict";
import { test } from "node:test";
import { addBook, getStats } from "../src/books.js";

test("addBook gives the new book the next id", () => {
  const books = [{ id: 1, title: "Dune", author: "Frank Herbert", pages: 612, finished: false }];

  const updated = addBook(books, "Emma", "Jane Austen", 474);

  assert.equal(updated.length, 2);
  assert.equal(updated[1].id, 2);
  assert.equal(updated[1].finished, false);
});

test("getStats counts only the pages of finished books", () => {
  const books = [
    { id: 1, title: "Dune", author: "Frank Herbert", pages: 612, finished: true },
    { id: 2, title: "Emma", author: "Jane Austen", pages: 474, finished: false },
  ];

  assert.deepEqual(getStats(books), { total: 2, finished: 1, pagesRead: 612 });
});
```

A test has three parts: set something up, do the thing, and **assert** what should be true. `assert.equal(a, b)` means "these must be equal, or the test fails".

Run it:

```
npm test
```

```
✔ addBook gives the new book the next id (0.5798ms)
✔ getStats counts only the pages of finished books (0.6257ms)
ℹ tests 2
ℹ pass 2
ℹ fail 0
```

Notice why this was easy. `books.js` holds **pure functions**: they take a list and return a new one, without touching any files. You can test them with made-up data. Code that reads files or the network is much harder to test. That's a good reason to keep your rules separate from your file handling, and it's why `CLAUDE.md` for this project says to.

### What a failure looks like

Checks earn their keep when they fail. Suppose someone changes `nextId` so it adds 2 instead of 1. The same command now prints:

```
✖ addBook gives the new book the next id (1.5083ms)
✔ getStats counts only the pages of finished books (1.0991ms)
ℹ tests 2
ℹ pass 1
ℹ fail 1

✖ failing tests:

test at test\books.test.js:5:1
✖ addBook gives the new book the next id (1.5083ms)
  AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

  3 !== 2
```

Read what that gives Claude: which test failed, in which file, and that it got `3` when it expected `2`. That's enough to find the bug without you saying a word. This is the "says where" feature in action.

### Tell Claude the check exists

A check only helps if Claude runs it. Add a line to `CLAUDE.md`:

```markdown
## Commands

- Run the tests: `npm test`

## Rules

- Run `npm test` after every change. Don't say a task is done while a test fails.
```

Now "check your work" is part of every task, without you asking.

You can also save yourself a permission question each time with an allow rule, from [chapter 08](../08-permissions-and-safety/notes.md):

```json
"allow": ["Bash(npm test)"]
```

### Writing the test first

Here's a habit that works especially well with Claude. Write the test **before** the code.

Suppose you want `getStats` to also report how many pages are left to read.

**1. Ask for the test only.**

```
I want getStats to also return pagesLeft: the total pages of books
that aren't finished yet. Write a test for that first.
Don't change books.js yet.
```

**2. Run it and watch it fail.**

```
Run the tests. The new one should fail. Show me the output.
```

This step looks pointless, but it's the most important one. A test that passes before the feature exists isn't testing anything. Seeing it fail proves the test can tell the difference.

**3. Now ask for the code.**

```
Now make that test pass by changing books.js.
Don't change the test.
```

**4. Check everything.**

```
Run all the tests and show me the output.
```

This order is often called **test-driven development**, or **TDD**. It gives Claude a precise target, and it gives you a simple way to review. Reading a short test and asking "is this what I want?" is far easier than reading the code and working out what it does.

### Ask for evidence

Compare two endings:

```
I've added pagesLeft and everything works.
```

```
I've added pagesLeft. Test output:

✔ addBook gives the new book the next id
✔ getStats counts only the pages of finished books
✔ getStats reports the pages left to read
ℹ pass 3
ℹ fail 0
```

The first is a claim. The second is proof. Get into the habit of asking for the second:

```
Show me the output of the test run.
```

### Watch for shortcuts

When a test fails, there are two ways to make it pass: fix the code, or weaken the test. Current models nearly always do the right thing. But you should know what a shortcut looks like, so you recognise one in a diff.

| The shortcut | What it looks like |
|---|---|
| Changing what the test expects | The expected value quietly changes to match the wrong answer |
| Skipping the test | `test.skip(...)`, or the test is commented out |
| Hard-coding the answer | `if (id === 2) return 3;`, written only to satisfy the test |
| Swallowing the error | A `try` and `catch` that hides the failure |
| Deleting the test | It's simply gone from the diff |

The defence is plain. **Read test diffs as carefully as code diffs.** If a test changed during a bug fix, ask why. Sometimes the test really was wrong, and that's fine. But it should be a decision you made, not a thing you failed to notice.

It also helps to say it up front: "Fix the code. Don't change the tests."

### When tests aren't enough

Tests check what you thought to test. They can't tell you:

- whether a page **looks** right,
- whether a feature is **pleasant** to use,
- whether you built the **right thing** in the first place.

For a web page, the check is a real browser and a screenshot, which chapter 32 covers. For "the right thing", the check is still you.

Even a project with no tests has a check: run the program and read what it prints. That's much better than nothing.

## Common mistakes

- **No check at all.** Then "done" means "I stopped typing", and you're back to testing by hand.
- **Believing "all tests pass" without seeing the output.** Ask for it. It takes one line.
- **Tests written after the code that simply copy what the code does.** They pass by definition and prove nothing. Write the test from what *should* happen, ideally first.
- **Never seeing a test fail.** A test you've never seen fail might be unable to fail.
- **Letting tests change during a fix without asking why.** That's how a bug gets "fixed" by moving the goalposts.
- **A slow check.** If the tests take ten minutes, nobody runs them, including Claude. Keep a fast set for everyday work.
- **Thinking tests cover everything.** They don't cover looks, feel, or whether the idea was right.

## Quick recap

- A **check** is something Claude can run that says pass or fail.
- With a check, Claude finds and fixes its own mistakes. Without one, you are the check.
- Tests, type checkers, linters, builds, and simply running the program all count.
- Put the check command in `CLAUDE.md` so it runs after every change.
- **Write the test first**, watch it fail, then write the code.
- Ask for **evidence**: the real output, not a summary.
- Read test diffs carefully. A changed test deserves a question.
