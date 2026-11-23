# 12 Managing Context: Exercises

**How to do these:**

- Do these in your practice project, `claude-practice/bookshelf`.
- Commit before you start.
- Write your answers in `claude-practice/journal/ch12.md`.
- These exercises are about watching the context, so run `/context` often and write down what you see. The exact numbers will differ from anyone else's. Look at how they change.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your journal for the chapter.

---

## Exercise 1 (Easy): Watch the desk fill up

1. Start a **new** session in `bookshelf`. Before typing anything else, run `/context` and write down how much of the window is used.
2. Ask Claude to read and explain all four files in `src`.
3. Run `/context` again.
4. Run a command with `!`, such as `! node src/cli.js list`.
5. Run `/context` once more.

In your journal:

- The three readings.
- What was already using space before you'd said anything? Name two things.
- Which step added the most? Does that surprise you?

<details>
<summary>Hint</summary>

Even a brand-new session isn't empty. Claude Code's own instructions and your `CLAUDE.md` are already there. Look at the categories that `/context` lists and see which ones have a number next to them at the very start.

</details>

---

## Exercise 2 (Easy): Point, or let it search

Compare two ways of asking the same thing. Use a **new session** for each.

**Session A:**

```
Why do the lines in the stats output line up neatly?
```

**Session B:**

```
Look at @src/format.js. Why do the lines in the stats output line up neatly?
```

In your journal:

- In session A, which files did Claude open before it answered?
- In session B, which did it open?
- Were the two answers equally good?
- When is it worth pointing, and when is it fine to let Claude search?

<details>
<summary>Hint</summary>

Watch the lines that show Claude's steps as it works. In one session it has to go looking. In the other, you handed it the file. In a project with four files the difference is small. Imagine it with four hundred.

</details>

---

## Exercise 3 (Medium): Show, don't tell

1. Run `node src/cli.js list` in a normal terminal and take a **screenshot** of the output.
2. In a Claude Code session, paste the screenshot into the prompt.
3. Ask: "The page counts don't line up in a column. Suggest how the output should look, and show me an example. Don't change any code yet."
4. Now start a new session and ask for the same thing **without** the screenshot, describing the problem in words only.

In your journal:

- Which prompt was quicker to write?
- Which got an answer that matched what you actually see?
- Name two kinds of problem where a screenshot is clearly the better choice.

<details>
<summary>Hint</summary>

On Windows, **Win + Shift + S** lets you select part of the screen and copies it to the clipboard. Then press **Alt + V** in Claude Code. On macOS, **Cmd + Ctrl + Shift + 4** copies a selection, and **Ctrl + V** pastes it.

</details>

---

## Exercise 4 (Medium): Clear versus compact

**Part 1: compact.**

1. Start a session. Tell Claude a rule in conversation only, not in any file: "For this session, call me Captain in every reply."
2. Have a short working chat. Ask it to explain two files.
3. Run `/compact` with a note that tells it to keep the summary of the two files.
4. Ask another question. Does it still call you Captain?

**Part 2: clear.**

1. Run `/rename captain-test`.
2. Run `/clear`.
3. Ask Claude what you were just working on.
4. Use `/resume` to get the old conversation back.

In your journal:

- What happened to the Captain rule after the compact? Was that what you expected?
- After the clear, what did Claude know? Where did that knowledge come from?
- Where would the Captain rule need to be written to survive both?
- What did naming the session make easier?

<details>
<summary>Hint</summary>

The rule may or may not survive the compact. It depends on what ends up in the summary, and your note asked it to keep the file summaries, not the rule. That uncertainty is the point of the exercise. Look at the table "What survives, and what doesn't" in the notes.

</details>

---

## Exercise 5 (Challenge): Plan a working afternoon

You have these five jobs to do this afternoon in a medium-sized project:

1. Fix a bug in the checkout page. You have the error message.
2. Add a "sort by price" option to the product list. Needs changes in four files.
3. Ask what a confusing regular expression in one file does.
4. Update the README to describe the new sort option.
5. Investigate why the test suite became slow last week. This could take a while and involve reading a lot of files and logs.

Write a plan in your journal. For each job, say:

- whether it gets a **new session**, continues the previous one, or is a `/btw`,
- what you'd put in the first prompt to give Claude the right context,
- where you'd `/clear`, where you might `/compact`, and where you'd commit,
- one thing that should go into `CLAUDE.md` so it survives the whole afternoon.

Then answer:

- Which two jobs belong in the same session, and why?
- Which job is most likely to clutter the context? What could you do about it?
- A colleague says, "I just keep one session open all day so Claude remembers everything." Write them a short, friendly reply.

<details>
<summary>Hint 1</summary>

Look for jobs that share the same files and the same knowledge. If one job's result is needed for the next, keeping them together makes sense. If they have nothing in common, the first one is only clutter for the second.

</details>

<details>
<summary>Hint 2</summary>

Job 3 is a quick question that has nothing to do with whatever else you're in the middle of. The notes describe a command made for exactly that.

</details>

<details>
<summary>Hint 3</summary>

Job 5 will read a lot. Think about whether its findings, once you have them, are short. If a long investigation produces a three-line answer, where would you like the long part to happen?

</details>
