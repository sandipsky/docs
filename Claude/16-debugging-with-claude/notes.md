# 16 Debugging with Claude

## What is it?

**Debugging** is finding out *why* a program does the wrong thing, and then fixing that cause.

Debugging **with Claude** means treating it as a partner in the investigation. You bring the evidence. Claude reads the code, runs things, and reasons about what could explain what you're seeing. Together you find the cause before anyone changes a line.

## Why does it matter?

The quickest thing to type is "it's broken, fix it". It's also the prompt most likely to make things worse.

With no evidence and no direction, Claude does what a rushed person would do. It finds the line where the program falls over and makes that line stop falling over. The error disappears. The bug doesn't. It's now hidden, and it will come back somewhere harder to find.

There's a name for this: fixing the **symptom** instead of the **cause**.

| | Symptom fix | Cause fix |
|---|---|---|
| What it does | Makes the error message go away | Removes the reason for the error |
| How it looks today | "It works now!" | "It works now, and here's why it failed" |
| How it looks next month | The same bug, in a new disguise | Nothing. It's gone |

A good debugging session with Claude is one where you both understand the cause before the fix is written.

## Real-world example

Think about a visit to the doctor with a pain in your leg.

| A good doctor | Debugging well |
|---|---|
| "Show me where. When does it hurt?" | **Reproduce** the problem |
| Orders an X-ray | **Gather evidence** |
| "It's a small fracture, here." | **Find the cause** |
| Puts on a cast | **Fix the cause** |
| "Come back in six weeks for another X-ray." | **Prove** it's fixed |

Now picture a doctor who hears "my leg hurts" and hands over painkillers without looking. The pain stops. The leg is still broken. That's a symptom fix.

## How it works

*Checked against Claude Code 2.1.330 and Node.js 24, in November 2026.*

### Set up the practice project

This chapter has a small broken program called **Checkout**. It reads a shopping cart and prints a receipt. It has three bugs in it, on purpose.

Copy this chapter's `starter` folder to `claude-practice/checkout`, the same way you copied Bookshelf in [chapter 07](../07-your-first-session/notes.md). Then:

```
cd ~/claude-practice/checkout
git init
git add .
git commit -m "Start the checkout debugging project"
```

Don't read the code hunting for the bugs. The point is to practise the conversation.

### The five steps

```
Reproduce  →  Gather evidence  →  Find the cause  →  Fix the cause  →  Prove it
```

We'll walk through all five on the first bug. The other two are yours, in the exercises.

### Step 1: Reproduce

To **reproduce** a bug is to make it happen on demand. If you can't make it happen, you can't know when it's fixed.

Run the program:

```
npm start
```

It crashes:

```
Receipt for undefined
--------------------------------
file:///C:/Users/you/claude-practice/checkout/src/receipt.js:15
  for (const item of cart.items) {
                          ^

TypeError: cart.items is not iterable
    at printReceipt (file:///C:/Users/you/claude-practice/checkout/src/receipt.js:15:27)
    at file:///C:/Users/you/claude-practice/checkout/src/receipt.js:24:1
    at ModuleJob.run (node:internal/modules/esm/module_job:437:25)
```

Good. One command, same crash every time. That command is now your test for "is it fixed?".

### Step 2: Gather evidence

That wall of text is called a **stack trace**. It looks scary, and it's the most useful thing on your screen. Here's how to read it.

| Part | What it tells you |
|---|---|
| `TypeError: cart.items is not iterable` | **What** went wrong. The program tried to loop over `cart.items`, and it wasn't a list |
| `at printReceipt (...receipt.js:15:27)` | **Where**. In the function `printReceipt`, in `receipt.js`, on line 15 |
| The lines mentioning `node:internal` | Node's own machinery. Not your code. Ignore them |

Read from the top, and stop at the first line that names one of **your** files.

There's a second clue, and it's easy to miss. Before the crash, the program printed:

```
Receipt for undefined
```

It should have said "Receipt for Maya". So something was already wrong *before* line 15. Evidence that appears before the crash is often the best evidence of all.

In Claude Code you don't need to paste any of this. Let Claude run the command and see the output for itself:

```
Run "npm start" and look at what happens.
```

### Step 3: Find the cause

Here's the key move. Ask for the **cause**, and say clearly **not to fix it yet**.

```
Don't change any files. Work out the root cause of this crash,
and tell me what evidence supports your answer.
```

Claude reads the code and reports back. The answer is this.

The crash is on line 15. But the cause is on line 10:

```js
function printReceipt(path) {
  const cart = loadCart(path);        // line 10: the cause

  console.log(`Receipt for ${cart.customer}`);
  console.log("-".repeat(32));

  for (const item of cart.items) {    // line 15: the crash
```

`loadCart` is an `async` function, so it doesn't return the cart. It returns a **promise** of a cart, as you learned in your JavaScript course. The code forgot to `await` it. So `cart` is a promise, and a promise has no `customer` and no `items`. That explains both clues at once: the `undefined` name and the failed loop.

This is the most important lesson in the chapter:

> **The line where a program crashes is often not the line with the bug.**

The crash is where the damage finally showed. The cause is earlier, where things first went wrong.

### Why "just fix it" goes wrong here

Suppose you'd skipped step 3. Here's a "fix" that makes the error vanish:

```js
try {
  printReceipt("data/cart.json");
} catch {
  console.log("Could not print the receipt.");
}
```

Run it, and there's no crash. There's also no receipt. Every customer now gets "Could not print the receipt", forever, and nobody knows why. The bug is still there. It's just been silenced.

Whenever a fix adds a `try` and `catch`, a "just in case" check, or a special case for one value, ask one question: **does this remove the cause, or hide the symptom?**

### Step 4: Fix the cause

Now the fix is small and obvious:

```
Fix the root cause. Change as little as possible.
```

```js
async function printReceipt(path) {
  const cart = await loadCart(path);
```

Two words. Compare that with the `try` and `catch` version. The real fix is usually smaller than the patch, because it goes to the right place.

When you can, write a **failing test** first that captures the bug, as in [chapter 14](../14-letting-claude-check-its-own-work/notes.md). Then fix it and watch the test pass. A bug with a test can never quietly come back.

### Step 5: Prove it

Run the same command that failed in step 1:

```
npm start
```

```
Receipt for Maya
--------------------------------
1 x Laptop                 $1.00
3 x Notebook              $13.50
10 x Pen                  $10.80
--------------------------------
Total: $25.30
```

The crash is gone, and the name is right. So that bug is fixed.

Now look again, honestly. A laptop for one dollar? The project's README says the total should be $1321.95.

"It doesn't crash any more" is not the same as "it's correct". The first bug was hiding the next one. That's normal. Those are yours to find in the exercises.

### Three kinds of bugs

Bugs announce themselves in different ways, and each kind gives you different evidence.

| Kind | How you notice | Your evidence |
|---|---|---|
| **A crash** | The program stops with an error | The stack trace |
| **A failing test** | A test goes red | The test's name, what it expected, and what it got |
| **A wrong answer** | Everything "works", but the result is wrong | Only the difference between what you got and what you wanted |

The third kind is the hardest, because the computer isn't complaining. You have to notice it yourself, and then work out precisely what "right" would be. The best first move for a wrong answer is to turn it into the second kind: write a test that fails.

### Useful things to say

| When | Say |
|---|---|
| At the start | "Don't change anything yet. Reproduce it and tell me the root cause." |
| You get one theory | "What else could explain this? How would we tell them apart?" |
| You're not convinced | "What evidence would prove that wrong?" |
| Before the fix | "Write a failing test that captures this bug first." |
| The fix looks like a patch | "Does this remove the cause, or hide the symptom?" |
| After the fix | "Run the original command and all the tests. Show me the output." |

### Looking inside with temporary logging

Sometimes you can't tell what's happening from the outside. Then ask Claude to add a few lines that print what's going on:

```
Add temporary console.log lines to show the price of each item right
after it's parsed. Run it, show me the output, then remove the lines.
```

It's a simple trick, and it settles arguments quickly. Afterwards, check the diff to make sure every temporary line is really gone.

### Check the boring things first

A surprising number of "bugs" aren't in the code at all. Before a long hunt, rule these out:

- Are you in the **right folder**?
- Did you **save** the file?
- Is it the **right version** of Node? Check with `node --version`.
- Did you **install** the packages?
- Are you running the code you think you're running, or an old build?

Claude can check all of these in a few seconds. Ask it to.

### When you're stuck

If two fixes have failed, stop. Don't try a third in the same conversation. It's now full of wrong guesses, and they pull Claude back toward the same ideas.

1. Type `/clear`.
2. Write a fresh summary: the symptom, how to reproduce it, what you've tried, and what you've ruled out.
3. For a truly hard bug, raise the effort with `/effort high`, as [chapter 05](../05-models-effort-and-cost/notes.md) described.

A clean start with a good summary beats a long argument nearly every time.

## Common mistakes

- **"It doesn't work."** With no error text and no steps to reproduce, Claude can only guess. Give the command and the output.
- **Pasting half the error.** The line you cut off is often the one that names the file.
- **Asking for a fix before knowing the cause.** That's how symptom patches get written.
- **Fixing the line that crashed.** The crash site and the cause are often different places.
- **Accepting a `try` and `catch` that hides the error.** The error message was helping you. Silence isn't a fix.
- **Stopping at "no more crash".** Check that the answer is actually right.
- **No test for the bug.** Then nothing stops it from returning.
- **A third attempt in a cluttered session.** After two failures, clear and restart with a summary.

## Quick recap

- Fix the **cause**, not the **symptom**. A symptom fix hides the bug for later.
- Five steps: **reproduce, gather evidence, find the cause, fix the cause, prove it**.
- Read a stack trace from the top: what went wrong, and the first line that names your own file.
- The line that crashes is often not the line with the bug.
- Say "don't change anything yet" until you both understand the cause.
- Turn a wrong answer into a failing test before fixing it.
- After two failed fixes, `/clear` and start again with a clear summary.
