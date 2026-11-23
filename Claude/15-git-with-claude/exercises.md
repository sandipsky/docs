# 15 Git with Claude: Exercises

**How to do these:**

- Do these in your practice project, `claude-practice/bookshelf`. It must be a Git repository.
- Start with a clean tree. Run `git status` and commit anything left over.
- Write your answers in `claude-practice/journal/ch15.md`.
- These exercises break and throw away work on purpose. That's safe here, because everything that matters is committed first.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your journal for the chapter.

---

## Exercise 1 (Easy): Let Claude commit

1. Ask Claude for one small change, such as making the `stats` output show a heading line.
2. Review and approve the edit.
3. Ask: "What have I changed since the last commit?" Compare Claude's summary with `! git diff`.
4. Ask Claude to commit it with a clear message.
5. **Read the message before you approve the commit.**
6. Look at the result: `! git log --oneline -5`

In your journal:

- Paste the commit message.
- Does it say *what* changed? Does it say *why*?
- Did Claude add a line about itself to the commit? Run `! git log -1` to see the whole message.
- Rewrite the message yourself, as you'd want to read it in six months.

<details>
<summary>Hint</summary>

Claude can only write the "why" if it knows it. If your prompt was "add a heading", the reason isn't anywhere. Either put the reason in your original request, or tell Claude when you ask for the commit.

</details>

---

## Exercise 2 (Easy): A branch for the task

Do one small feature on its own branch, from start to finish.

1. Create a branch called `count-by-author` and switch to it.
2. Build this in two small steps, with a commit after each:
   - a function that counts how many books each author has,
   - an `authors` command that prints the counts.
3. Run the tests.
4. Switch back to your main branch. Run `node src/cli.js authors`. What happens?
5. Merge the branch, and run the command again.

In your journal:

- What happened in step 4, and why?
- Paste `git log --oneline` after the merge.
- Why is it useful that the main branch didn't have the feature until you merged?

<details>
<summary>Hint</summary>

`git switch -c name` creates a branch and moves you onto it. `git switch main` goes back. `git merge name` brings a branch's commits into the one you're on. Your main branch may be called `master` instead: `git branch` shows the names.

</details>

---

## Exercise 3 (Medium): Climb the undo ladder

You'll undo three different mistakes with three different tools. Commit first.

**Rung 1: rewind.**

1. Ask Claude to rename the `finish` command to `done` everywhere.
2. Approve the edits. Then decide you don't want it.
3. Undo with **Esc twice**, and restore the code.
4. Run `! git status`.

**Rung 2: git restore.**

1. Run `! node src/cli.js add "Throwaway" "Nobody" 10`. This changes your data file with a **command**.
2. Try to undo it with rewind. What happens?
3. Undo it with Git instead.

**Rung 3: git revert.**

1. Ask Claude for a small change, and **commit** it.
2. Decide the commit was a mistake.
3. Undo it with `git revert`, and look at `git log --oneline`.

In your journal:

- For each rung: what did you undo, and which tool worked?
- In rung 2, why couldn't rewind help?
- After rung 3, how many commits are in the log? Why didn't the bad commit just disappear, and why is that a good thing when you work in a team?

<details>
<summary>Hint 1</summary>

For rung 2, think about what checkpoints track. The notes say it in the table "Two safety nets". The `add` command changed a file, but nothing Claude tracks was involved.

</details>

<details>
<summary>Hint 2</summary>

`git revert HEAD` undoes the most recent commit by making a new commit that does the opposite. History isn't rewritten. That matters when other people already have the old commit on their computers.

</details>

---

## Exercise 4 (Medium): A deliberate pause

1. Add an **ask** rule for `git push` to your project's `.claude/settings.json`, as shown in the notes.
2. Add a **deny** rule that blocks force-pushing.
3. Start a new session and switch to the mode that accepts edits automatically.
4. Ask Claude to push your branch. You don't need a remote for this. You only want to see whether you're asked.

In your journal:

- Paste your `settings.json`.
- In step 4, were you asked, even though the mode was a more relaxed one?
- What's the difference between your ask rule and your deny rule? When would you want each?
- Name one more Git command you'd add a rule for, and say which kind of rule.

<details>
<summary>Hint</summary>

Rules can match the beginning of a command, with `*` standing for whatever comes after. Look at the ask rule in the notes and adapt it. Remember the order from chapter 08: deny is checked first, then ask, then allow.

</details>

---

## Exercise 5 (Challenge): Your first pull request with Claude

Take one feature through the whole journey, to a real pull request.

1. Create an empty **private** repository on GitHub for your Bookshelf project, and connect your local project to it. Push your main branch.
2. Create a branch for a new feature. Choose something small, such as a `list --finished` option.
3. Build it with the full loop: explore, plan, code, check. Commit in small steps.
4. Push the branch.
5. Open a pull request. Have Claude write the description, covering what changed, why, and how it was tested.
6. Read your own PR on GitHub, top to bottom, as if a stranger had written it.
7. Find at least one thing to improve. Fix it, push again, and watch the PR update.
8. Merge it.

In your journal:

- Paste the PR description Claude wrote. What did you change in it?
- What did you find in step 6 that you'd missed while building?
- Did you use the `gh` tool, or the GitHub website? What did Claude do, and what did you do yourself?
- Before you pushed, did you check that nothing secret and nothing generated was in the commit? How?

<details>
<summary>Hint 1</summary>

If you don't have the `gh` tool, that's fine. Push with `git push -u origin your-branch-name`. GitHub prints a link for creating the pull request. Open it, and paste in the description you asked Claude to write.

</details>

<details>
<summary>Hint 2</summary>

Reading a diff on the GitHub page feels different from reading it in your terminal. You're no longer in the middle of building, so you notice things: a leftover debug line, a name that isn't clear, a test you forgot. That change of view is the reason for step 6.

</details>

<details>
<summary>Hint 3</summary>

For the last question, `git status` before a commit lists the files going in. Do you have a `.env` file from chapter 08? Is it in your `.gitignore`? Check on GitHub that it isn't in the repository.

</details>
