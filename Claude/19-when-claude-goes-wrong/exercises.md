# 19 When Claude Goes Wrong: Exercises

**How to do these:**

- Do these in your practice project, `claude-practice/bookshelf`.
- Commit before each exercise. Several of them invite Claude to go wrong on purpose, and you'll want to throw the result away.
- Write your answers in `claude-practice/journal/ch19.md`.
- You're trying to **cause** some of these patterns so you can practise spotting them. Current models are good, and sometimes Claude simply does the right thing. That's a fine result. Write down what it did and what in your prompt might have helped.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your journal for the chapter.

---

## Exercise 1 (Easy): Name the pattern

For each short story, name the pattern from the notes, name the root cause, and say what the first move should be.

1. Aiko asks for a "forgot password" link. The diff adds the link, plus two-step login, plus a password strength meter.
2. Ben's tests were failing. Claude says they pass now. Ben notices one test has been changed to `test.skip`.
3. Carla asks why a page is slow. She adds, "It's the database, right?" Claude agrees and rewrites three queries. The page is still slow. The real cause was a huge image.
4. Dan asks for a date to be formatted. Claude uses `Date.prototype.toShortFormat()`. The app crashes.
5. Ella tells Claude at 9:00 to always use British spelling. At 11:30 it writes "color".
6. Femi asks Claude to fix a bug in checkout. The diff fixes it, and also reorders the imports in six other files.
7. Gita has asked three times for a crash to be fixed. Each fix is different, and each one fails. Claude's fourth idea is the same as its first.
8. Hari asks Claude to "improve the search". Claude makes the results look nicer. Hari wanted typos to be forgiven.
9. Ines asks for a new command. Claude says it's finished and working. When Ines runs it, it prints nothing.

<details>
<summary>Hint</summary>

Use the one-page table in the notes. Two of these stories share a pattern, and two of them share a first move even though the patterns differ.

</details>

---

## Exercise 2 (Easy): Invite over-building

1. Send this prompt, exactly as written:

   ```
   Add a way to export my books.
   ```

2. When the plan or the first diff appears, **don't approve it**. List everything it includes.
3. Mark each item: **asked for**, or **not asked for**.
4. Rewind. Write a new prompt with a tight scope. For example: one format, one command, and no options.
5. Compare the two results.

In your journal:

- Your list from step 2, with the marks from step 3.
- Your tighter prompt.
- Roughly how many lines did each version change?
- The first prompt was only seven words. What did Claude have to decide on your behalf?

<details>
<summary>Hint</summary>

Things that often get decided for you: the file format, the file's name and location, what happens if the file already exists, and whether finished and unfinished books are treated differently. If Claude asked you about these instead of guessing, note that. It's the behaviour you want, and worth knowing how to encourage.

</details>

---

## Exercise 3 (Medium): Ask for something that doesn't exist

1. Send this prompt:

   ```
   Simplify src/store.js by using the built-in fs.readJsonSync function
   from node:fs to load the books.
   ```

   Node's `fs` module has no such function. A popular add-on package does, which is what makes this one tempting.
2. Watch what Claude does. Don't approve anything without reading.
3. Whatever happens, run the app afterwards to see whether it still works.
4. Go back to your commit.

In your journal:

- Did Claude tell you the function doesn't exist? Did it use it anyway? Did it suggest something else?
- If it wrote the code, how did you find out it was wrong? Which defence from chapter 02 caught it?
- If Claude had tests to run, and a rule in `CLAUDE.md` to run them, how would that have changed things?
- Your prompt *told* Claude the function existed. What does that say about how you word your own requests?

<details>
<summary>Hint</summary>

This is also pattern 9 from the notes. You stated something false with confidence. Notice whether Claude pushed back or went along. Then think about how often you state your own guesses as facts in a prompt.

</details>

---

## Exercise 4 (Medium): A post-mortem

A **post-mortem** is a short, honest look back at something that went wrong. The purpose isn't blame. It's to change something so it doesn't happen again.

1. Look through your journal for chapters 07 to 18. Pick **two** moments where a session went badly: a wrong result, a wasted half hour, or something you had to redo.
2. For each one, fill in:

   | | |
   |---|---|
   | What I asked for | |
   | What I got | |
   | The pattern | |
   | The root cause (one of the four) | |
   | How I fixed it at the time | |
   | What I could change so it doesn't happen again | |

3. Make at least one of those changes for real: a line in `CLAUDE.md`, a new test, or a permission rule.

In your journal:

- Both tables.
- The change you made, and where.
- Was either root cause on *your* side, such as the prompt, or the size of the task? Be honest.

<details>
<summary>Hint</summary>

If you can't find anything that went wrong, look for moments where you corrected Claude more than once, or where you rewound. Those are small failures, and they count. If you had to say the same thing twice, there's almost certainly a line missing from `CLAUDE.md`.

</details>

---

## Exercise 5 (Challenge): Build your guardrails

A **guardrail** is something in your setup that makes a mistake hard to make. You're going to give Bookshelf several.

For each of these five patterns, design one concrete guardrail:

1. Over-building
2. "Done", with no proof
3. Drifting off task
4. Bending the test
5. A risky command

Each guardrail must be one of these: a specific line in `CLAUDE.md`, a test, a permission rule, or a habit of your own with a clear trigger.

Then:

1. **Implement at least three** of them in your Bookshelf project.
2. **Test each one.** Start a new session and try to cause the pattern. Did the guardrail hold?
3. Commit your setup.

In your journal:

| Pattern | My guardrail | What kind is it? | Did it hold when tested? |
|---|---|---|---|
| | | | |

Then answer:

- Which of your guardrails are **advice**, and which are **enforced**? Look back at "Notes are advice, not locks" in chapter 11.
- Which pattern was hardest to guard against, and why?
- Your `CLAUDE.md` just got longer. Is it still short enough that every line gets noticed? Is there anything you could now remove?

<details>
<summary>Hint 1</summary>

Match the guardrail to the root cause. "No way to check" needs something Claude can run, which means a test or a command. "A prompt can't guarantee it" needs something that enforces, which means a permission rule. "Missing information" can be solved with a line of text.

</details>

<details>
<summary>Hint 2</summary>

To test a guardrail against over-building, reuse the vague prompt from exercise 2 in a new session. To test one against a risky command, ask Claude to do the thing your rule covers and see whether you're stopped or asked.

</details>

<details>
<summary>Hint 3</summary>

Not every guardrail can be a file. "After two failed corrections, I clear and re-prompt" lives in your head. That's fine, as long as it has a trigger you'll notice. Put it on your cheat sheet from chapter 17.

</details>
