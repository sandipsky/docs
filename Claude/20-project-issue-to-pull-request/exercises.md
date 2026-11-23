# 20 Project: From Issue to Pull Request: Exercises

These are **stretch goals**: more work on your finished `library-loans` project. Do them in any order, and do as many as you like.

**How to do these:**

- Finish all seven milestones first, with both issues merged into your main branch.
- Keep following the project's five rules: one task per branch and session, no code before you understand the problem, tests first, evidence instead of claims, and read every diff.
- Use the "done" checklist from the notes for each one.
- Write your prompts and what you noticed in `claude-practice/journal/ch20.md`.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to review your pull request descriptions as well as your code.

---

## Exercise 1 (Easy): Days until due

The front desk wants to tell a member how long they have left.

Add a function that takes a loan and today's date and returns how many days remain until the book is due.

- A book due in three days returns `3`.
- A book due today returns `0`.
- A book that's two days overdue returns `-2`.
- A returned loan has nothing left to count. Decide what should happen, and say so in your prompt.

Do it on its own branch, test first.

In your journal: the fourth rule needed a decision. What did you choose, and did you make that choice before or after Claude started?

<details>
<summary>Hint</summary>

Look at how the existing code works with dates, and ask Claude to follow the same approach. If your fix for issue 1 introduced a way of comparing two calendar dates, this function can probably reuse it. Reusing it is also a good test of whether that fix was built well.

</details>

---

## Exercise 2 (Easy): Is the README still true?

Documentation goes out of date quietly. Find out how yours is doing.

1. In a new session, ask Claude to compare `README.md` with the code and the tests, and to list everything in the README that's now wrong, missing, or misleading. Tell it not to change anything yet.
2. Read the list. Check two of the items yourself.
3. Decide which ones to fix. Have Claude update the README.
4. Read the diff. Is every new sentence true?

In your journal:

- How many problems did Claude find?
- Did it suggest adding anything you decided against? Why?
- Add a line to your `CLAUDE.md` so that the README gets checked whenever behaviour changes. Paste the line.

<details>
<summary>Hint</summary>

The README has a section listing the files in the `issues` folder and saying "they all pass today" about the tests. It also describes "Your job" as two open issues. After your work, how much of that is still accurate?

</details>

---

## Exercise 3 (Medium): Write the issue yourself

So far, someone else wrote the issues. Now you write one, and find out how clear it really is.

1. Choose a new feature for the library. Some ideas:
   - Sundays don't count as late days, because the library is closed.
   - Members under 12 are never charged a fee.
   - A member can't have more than five books on loan at once.
2. Write `issues/003-your-title.md` **by yourself**, without Claude. Use issue 2 as a model: the problem, what you want, the rules, and what's out of scope.
3. Start a **new** session. Go into plan mode and ask for a plan for issue 3. Add: "Ask me about anything the issue doesn't settle."
4. Count the questions Claude asks, and the assumptions it lists.
5. Improve your issue file so those questions are answered. Then build the feature.

In your journal:

- How many questions and assumptions were there?
- Which one surprised you most?
- Show one rule from your issue before and after you improved it.
- What makes a rule in an issue good enough to turn straight into a test?

<details>
<summary>Hint 1</summary>

A rule is ready when two people would write the same test for it. "Late fees should be fair" isn't ready. "A book due on Saturday and returned on Monday is one day late, not two" is.

</details>

<details>
<summary>Hint 2</summary>

Every one of the ideas above hides awkward cases. For Sundays: what if the due date itself is a Sunday? For members under 12: how does the code know a member's age, when a loan only stores a member's id? Finding those gaps is the exercise.

</details>

---

## Exercise 4 (Medium): Be the reviewer

Until now you've watched every edit as it happened. Reviewers don't get that. They see a finished branch and have to judge it cold.

1. Pick a small feature, such as a function that lists all overdue loans from a list of loans.
2. Make a branch. Start a new session and switch to the mode that **accepts edits automatically**.
3. Give Claude one clear prompt with the feature and the instruction to write tests. Then **don't look at the screen** until it's finished.
4. Now review the branch as a stranger would. Use `/diff`, or `git diff main`.
5. Write **three review comments** in your journal. Each should name a file and a line, and say what you'd like changed and why.
6. Give your comments to Claude, and have it address them.
7. Run `/code-review` and compare what it finds with what you found.

In your journal:

- Your three comments.
- Was reviewing a finished branch harder or easier than watching each edit? What did you miss, or notice, because of it?
- Did `/code-review` find something you didn't? Did you find something it didn't?
- For which kinds of work would you be comfortable letting Claude run this way? For which wouldn't you?

<details>
<summary>Hint 1</summary>

A useful review comment is specific and gives a reason. "This is confusing" doesn't help. "In `loans.js`, the name `d` on line 40 doesn't say what it holds. Call it `daysLate`, like the function above does" does.

</details>

<details>
<summary>Hint 2</summary>

When you review, start with the tests, not the code. The tests tell you what the author thinks the feature should do. If the tests are wrong or thin, the code underneath doesn't matter yet.

</details>

---

## Exercise 5 (Challenge): What did the process buy you?

You did issue 1 carefully. Now do it carelessly, and compare the two.

1. Copy the original `starter` folder again, to a new folder called `library-loans-fast`. Put it under Git.
2. Start a session there and switch to the mode that accepts edits automatically.
3. Send one prompt, and nothing else:

   ```
   Fix issue 1.
   ```

4. Accept whatever comes back. Don't steer.
5. Now compare it with your careful version.

| | Careful version | Fast version |
|---|---|---|
| Time taken | | |
| Lines changed in `src` | | |
| New tests added | | |
| Times of day covered by the tests | | |
| Fee for a 3:30pm return on the due date | | |
| Fee for a 9am return the day **after** the due date | | |
| Were any existing tests changed? | | |
| Could you explain the cause afterwards? | | |

To fill in the two fee rows, run the same checks against both projects.

In your journal:

- Did the fast version fix the cause, or the symptom in the issue?
- If the fast version turned out just as good, say so honestly. Then ask: how would you have **known** it was good, without doing the careful version?
- Which steps of the careful process gave you the most for the time they took? Which, if any, would you now skip for a bug this size?
- Write a short note to a friend who says "I just tell it to fix the issue and it works". What would you want them to know?

<details>
<summary>Hint 1</summary>

To check a fee in either project, ask Claude to run a short script that creates a loan and prints the fee for a given return time. Or write a small test for each case and run it in both folders.

</details>

<details>
<summary>Hint 2</summary>

There are two different questions here: "is the result good?" and "do I know the result is good?". The fast version might score well on the first. Think hard about the second. Shipping something you can't vouch for is the habit this whole level has been trying to replace.

</details>
