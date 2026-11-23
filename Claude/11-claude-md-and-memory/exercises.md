# 11 CLAUDE.md and Memory: Exercises

**How to do these:**

- Do these in your practice project, `claude-practice/bookshelf`.
- Commit before you start.
- Write your answers in `claude-practice/journal/ch11.md`.
- Several exercises say to start a **new session**. That matters: `CLAUDE.md` is read when a session begins, so a change may not show until the next one.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your journal for the chapter.

---

## Exercise 1 (Easy): Draft, then cut

1. In the `bookshelf` folder, start a session and run `/init`.
2. Read the `CLAUDE.md` it wrote. Count the lines.
3. Go through it line by line. For each line, ask: "Could Claude find this out by reading the code?" If yes, delete it.
4. Add at least three lines that only **you** know. Think about the style you want, and things Claude should never do in this project.
5. Count the lines again.

In your journal:

- How many lines before, and how many after?
- Paste two lines you deleted and say why.
- Paste the three lines you added.

<details>
<summary>Hint</summary>

Lines that describe the folder layout, list the files, or explain what each function does are almost always safe to cut. Lines about *how to work* in the project are the ones to keep: how to run it, what style to use, what's off limits.

</details>

---

## Exercise 2 (Easy): Does it follow the rule?

Test that your notes change what Claude does.

1. Make sure your `CLAUDE.md` says to use double quotes and semicolons.
2. Add one more rule, something easy to spot. For example: "Every new function gets a one-line comment above it saying what it does."
3. Start a **new** session.
4. Ask for a small new function, without mentioning style at all: "Add a function that returns the longest book."
5. Read the diff.

In your journal:

- Did the code follow both rules, without you asking?
- Now delete your new rule from `CLAUDE.md`, start another new session, rewind the change, and ask again. What's different?

<details>
<summary>Hint</summary>

If Claude didn't follow a rule, check that the file was loaded before you blame the rule. Type `/context` and look for your `CLAUDE.md` in the list. A typo in the file name is the usual culprit.

</details>

---

## Exercise 3 (Medium): A note that follows you everywhere

Your project file is for the project. Now make a personal one.

1. Create `~/.claude/CLAUDE.md` in your home folder. On Windows that's `C:\Users\your-name\.claude\CLAUDE.md`.
2. Write two or three lines about how **you** like to work. For example: "When you use a technical word I might not know, explain it in one sentence."
3. Start a session in `bookshelf` and ask a question that would bring it out, such as "What is a pure function?"
4. Now start a session in a **different** folder, such as `expense-tracker`, and ask the same question.

In your journal:

- Did your preference show up in both projects?
- You now have two notes files in play in `bookshelf`. Type `/memory`. What does it list?
- Write one fact that belongs in the personal file and one that belongs in the project file. Say why each couldn't go in the other.

<details>
<summary>Hint</summary>

Think about who else reads each file. A teammate who clones the project gets the project file. They never see your personal one. So a rule the whole team needs can't live in your home folder, and your own taste shouldn't be forced on the team.

</details>

---

## Exercise 4 (Medium): Claude's own notebook

1. In a `bookshelf` session, tell Claude something to remember. For example:

   ```
   Remember that in this project I want every new command to be
   added to the help text.
   ```

2. Type `/memory` and find where Claude saved it. Open the note and read it.
3. Start a **new** session. Ask for a small new command, without mentioning the help text.
4. Look at the diff. Did Claude update the help text?
5. Remove the note again. Use `/memory` to open the memory folder and delete the file, or ask Claude to forget it.

In your journal:

- Where on your computer was the note saved? Is that inside your project folder?
- Would a teammate who clones your project get this note? What does that mean for rules the team needs?
- How was Claude's wording of the note different from what you typed?

<details>
<summary>Hint</summary>

The notes say auto memory lives in a folder inside `~/.claude/projects/`, not in your project. Compare that with where `CLAUDE.md` lives, and with which of the two goes into Git.

</details>

---

## Exercise 5 (Challenge): Sort the lines

Here are twelve lines that someone wants to put in a project's `CLAUDE.md`. Sort each one into a column and give a short reason.

| Keep in `CLAUDE.md` | Leave out | Belongs somewhere else |
|---|---|---|

1. "Run `npm test` before you say a task is done."
2. "The `src` folder contains the source code."
3. "We use PostgreSQL 17."
4. "The database password is hunter2."
5. "Never push directly to the main branch."
6. "Write clean, maintainable code."
7. "Dates are always stored in UTC and shown in the user's local time."
8. "To release: update the version, write the changelog, tag the commit, build, upload, and announce it in the team chat."
9. "I like my explanations short."
10. "The test database must be running first. Start it with `npm run db:start`."
11. "API functions in `src/api/` always return `{ ok, data }`."
12. "This project was started in 2021 by the mobile team."

For every line in the third column, say where it belongs instead: a deny rule, a hook, a skill, a personal file, a rules file, or nowhere at all.

Then rewrite line 6 so that it would earn a place in the file.

<details>
<summary>Hint 1</summary>

For each line, ask three questions in order. Is it secret? Could Claude find it by reading the code? Is it advice, or must it hold every single time?

</details>

<details>
<summary>Hint 2</summary>

Line 8 is a long procedure that only matters once a month. Loading it into every session is a waste. Line 11 only matters when Claude is working in one folder. Look at "Splitting things up" in the notes for a place that fits each.

</details>

<details>
<summary>Hint 3</summary>

Line 5 is good advice, but what happens on the one day Claude misses it? Reread "Notes are advice, not locks".

</details>
