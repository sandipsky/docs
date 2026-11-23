# 07 Your First Session: Exercises

**How to do these:**

- Do these in your copy of the practice project, `claude-practice/bookshelf`, set up as the notes describe. It must be a Git repository with at least one commit.
- Start Claude Code from **inside** the `bookshelf` folder.
- Write your answers in `claude-practice/journal/ch07.md`.
- For now, answer every permission question yourself. Don't choose the option that stops Claude from asking.
- An exercise is done when you can explain, in your own words, what changed in the files and why.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your journal for the chapter.

---

## Exercise 1 (Easy): Take the tour

Ask Claude these three questions, one at a time. Watch which files it opens for each.

1. "What does this project do? Give me a short tour of the files."
2. "When I run the `finish` command, which functions run, and in what order?"
3. "What does the `nextId` function do, and why does it use `reduce`?"

In your journal:

- For each question, list the files Claude read.
- Pick the answer to question 2. Open the files yourself and check it step by step. Was it right?
- Did Claude ask your permission for anything? Why not?

<details>
<summary>Hint</summary>

The lines that show Claude's steps name the tool and the file, such as a read of `src/cli.js`. If they scroll past too quickly, press **Ctrl + O** to open a fuller view of what Claude did.

</details>

---

## Exercise 2 (Easy): One change, one review

Ask Claude for one small change to what the app prints. Choose one:

- Show the total number of books on a line under the list.
- Print each title in capital letters.
- Add a line of dashes between the heading and the totals in `stats`.

Then:

1. Read the diff before you approve it. Write down which file it touches and how many lines.
2. Approve it.
3. Run the app with `!` to see the change.
4. Run `/diff` and compare it with what you approved.

In your journal: did the diff contain **only** what you asked for? If Claude changed anything extra, what was it?

<details>
<summary>Hint</summary>

Add "Change only what's needed" to your prompt. If Claude still touches more than you expected, you can say no at the permission question and tell it which part you don't want.

</details>

---

## Exercise 3 (Medium): Practise the brake

Keep the change from exercise 2 in place. You're going to undo it two different ways.

**Part 1: rewind.**

1. With the prompt box empty, press **Esc** twice.
2. Pick the message where you asked for the change, and restore the code and the conversation.
3. Run `! git diff`. What does it show?

**Part 2: Git.**

1. Ask Claude for the same change again, and approve it.
2. This time, undo it with Git: `! git restore .`
3. Run `! git diff` again.

In your journal:

- After part 1, did Claude still "remember" asking to make the change? Scroll up and look.
- After part 2, what does Claude think the file contains? Ask it: "What does `format.js` look like now?" What did it do to answer you?
- Name one situation where rewind is the better tool, and one where Git is.

<details>
<summary>Hint 1</summary>

If pressing Esc twice does nothing, check that the prompt box is completely empty first. You can also type `/rewind`.

</details>

<details>
<summary>Hint 2</summary>

For the last question, reread "Step 5: Undo it" in the notes. One of the two undo tools knows nothing about changes made by commands. The other knows nothing about your conversation.

</details>

---

## Exercise 4 (Medium): Say no, and steer

Saying no is a skill too.

1. Ask: "Make the list output look nicer."
   This prompt is vague on purpose.
2. When Claude shows you a diff, **don't approve it**. Read it and decide what you don't like about it.
3. Say no. Then tell Claude exactly what you'd like instead, in one or two sentences.
4. Repeat until you get a diff you're happy to approve.

In your journal:

- What did Claude's first idea of "nicer" include?
- How many rounds did it take?
- Rewrite your original prompt so it would have worked the first time. Use the four parts from chapter 03.
- Now rewind to before the whole exchange, and try your better prompt. Did it work in one go?

<details>
<summary>Hint</summary>

When you say no, be specific about what to keep and what to drop: "Keep the alignment, but don't add colours or emoji." A plain "no" leaves Claude guessing which part you disliked.

</details>

---

## Exercise 5 (Challenge): Find the gap

The Bookshelf app trusts whatever you type. Let's see where that goes wrong.

1. **Predict first.** Without running anything, write in your journal what you think happens when you run:

   ```
   node src/cli.js add "Mystery Book" "Nobody" abc
   ```

2. Ask Claude the same question, and tell it **not to change anything yet**: "What would happen if I ran this command? Don't run it and don't edit anything. Just read the code and tell me."
3. Now run the command yourself with `!`. Then run `stats`, and look inside `data/books.json`.
4. Compare three things: your prediction, Claude's prediction, and what really happened.
5. Ask Claude to fix the problem. Before you approve anything, decide what "fixed" should mean, and say so in your prompt.
6. Review the diff, test it, and put your data file back the way it was.

In your journal:

- Who was closer, you or Claude? Did Claude find it by guessing or by reading?
- What did you decide "fixed" means? Did Claude's first attempt match it?
- Besides the code, what else did step 3 change in your project? How did you put it right?

<details>
<summary>Hint 1</summary>

Look at the line in `cli.js` that turns the page count into a number. What does JavaScript give you when you turn the text `abc` into a number? And what happens to that value when it's saved as JSON?

</details>

<details>
<summary>Hint 2</summary>

"Fixed" needs decisions that only you can make. Should the app refuse to add the book? What should the message say? Should zero pages be allowed? What about a negative number? If you don't say, Claude will choose for you.

</details>

<details>
<summary>Hint 3</summary>

Running `add` saved a broken book into `data/books.json`. That's a change made by a command, not by one of Claude's edits. Which of your two undo tools can see it?

</details>
