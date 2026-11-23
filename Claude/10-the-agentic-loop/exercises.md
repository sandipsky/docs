# 10 The Agentic Loop: Exercises

**How to do these:**

- Do these in your practice project, `claude-practice/bookshelf`.
- Commit before each exercise, so every experiment is easy to throw away.
- Write your prompts and what you noticed in `claude-practice/journal/ch10.md`.
- Write your prompts in your own words. Don't copy the ones from the notes.
- An exercise is done when the feature works, you've seen real output that proves it, and you've committed.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your journal for the chapter.

---

## Exercise 1 (Easy): Which step was skipped?

Here are four short stories. For each one, say which step of the loop was skipped, and what it cost.

1. Mina asked Claude to add a date to each book. Claude wrote a new function to format dates. A week later Mina found the project already had one, and now the app shows dates in two different styles.
2. Raj asked for a login page. Claude built it with email and password. Raj had wanted "sign in with Google".
3. Lena asked Claude to fix a crash. Claude changed a line and said "Fixed!". Lena committed. The app still crashed.
4. Omar asked for a search feature, sorting, and a new colour scheme in one message. The result had a bug, and he couldn't tell which of the three changes caused it.

<details>
<summary>Hint</summary>

One of these isn't really a skipped step. It's a loop that was too big. The notes have a section about that.

</details>

---

## Exercise 2 (Easy): Explore only

Practise the first step by itself.

1. Ask Claude to trace what happens, from start to finish, when you run:

   ```
   node src/cli.js finish 2
   ```

   Tell it not to change any files and not to run the command.
2. From Claude's answer, draw the path yourself in your journal, like this:

   ```
   cli.js  →  ?  →  ?  →  ?
   ```

3. Open the files and check Claude's answer against the real code.

In your journal:

- Was any part of Claude's answer wrong or vague?
- What did you learn about the project that you didn't know?
- Did Claude change anything, or try to? What in your prompt prevented it?

<details>
<summary>Hint</summary>

Be explicit about the limits: no edits, and no running anything. If you only say "explain", Claude may decide to run the command to see what happens, which would change your data file.

</details>

---

## Exercise 3 (Medium): The full loop

Add a `remove` command to Bookshelf, using all four steps. Use your own words for every prompt.

The feature:

- `node src/cli.js remove 2` removes the book with id 2.
- Removing an id that doesn't exist prints a clear message and changes nothing.
- The help text mentions the new command.

Work through Explore, Plan, Code, and Check, one message each.

In your journal, record:

- your four prompts,
- one thing you changed or questioned in Claude's plan,
- the evidence from the Check step: paste the real output,
- whether the check left anything behind in `data/books.json`, and how you dealt with it.

<details>
<summary>Hint 1</summary>

In the Plan step, ask how the change will be checked. If the plan doesn't include the "id doesn't exist" case, ask for it to be added before any code is written.

</details>

<details>
<summary>Hint 2</summary>

Testing `remove` means adding a book first, and both commands write to your data file. Before you start, decide how you'll get the file back to normal. Git can do it in one command.

</details>

---

## Exercise 4 (Medium): Catch the extra

Run the full loop again for a second feature: `list --unread` should show only the books that aren't finished yet.

This time, pay special attention to the **Code** step.

1. Get a plan and agree to it.
2. As each diff arrives, compare it with the plan line by line.
3. If a diff contains anything the plan didn't mention, don't approve it. Ask why it's there.

In your journal:

- Did every diff match the plan? If not, what was extra?
- Was the extra thing a good idea, a bad idea, or harmless? What did you do about it?
- Plain `list` must still show every book. How did you check that?

<details>
<summary>Hint</summary>

Checking that an old feature still works after a change has a name: it's called checking for **regressions**. Ask for it in the Check step: "Also show me that plain `list` still shows every book."

</details>

---

## Exercise 5 (Challenge): Break the loop on purpose

The best way to believe in the loop is to see what happens without it. You'll build the same feature twice.

The feature: let each book have a rating from 1 to 5. A book can only be rated once it's finished. The list should show the rating.

**Round 1: no loop.**

1. Commit your work. Then make a new branch: `git switch -c ratings-no-loop`
2. Send one prompt, with no exploring, no planning, and no checking:

   ```
   Add ratings.
   ```

3. Approve what comes back. Don't steer. Then test it by hand and commit.

**Round 2: the loop.**

1. Go back and make a second branch: `git switch main`, then `git switch -c ratings-loop`
2. Start a **new** session, so Claude doesn't remember round 1.
3. Build the same feature with all four steps.

Then compare.

| | No loop | With the loop |
|---|---|---|
| Does it match the feature described above? | | |
| How many files changed? | | |
| Anything built that nobody asked for? | | |
| What happens if you rate an unfinished book? | | |
| How long did it take, including fixing? | | |

In your journal:

- What did Claude have to guess in round 1? List every guess you can find.
- Which round would you rather hand to a teammate for review? Why?
- Keep the better branch and delete the other.

<details>
<summary>Hint 1</summary>

To compare what each branch changed, try `git diff main ratings-no-loop --stat` and the same for the other branch. It lists the files that differ and how much.

</details>

<details>
<summary>Hint 2</summary>

Round 1 might produce something that works well. That's worth noticing too. Then look at *which* decisions it made for you: where ratings are stored, what the command is called, what happens with a rating of 0 or 6. Would you have chosen the same?

</details>
