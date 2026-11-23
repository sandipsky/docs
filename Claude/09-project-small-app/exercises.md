# 09 Project: A Small App, Built Together: Exercises

These are **stretch goals**: extra features for your finished expense tracker. Do them in any order, and do as many as you like.

**How to do these:**

- Finish all seven milestones first, and commit. Then you always have a working version to go back to.
- Keep following the five rules of the road from the notes: one step per prompt, read every diff, test it yourself, commit when it works, undo instead of arguing.
- For each goal, write your prompt in `journal/ch09.md` **before** you send it. Afterwards, note whether it worked first time.
- After every goal, test the whole app again, not just the new part. Adding, deleting, and refreshing must all still work.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to review your prompts as well as your code.

---

## Exercise 1 (Easy): The biggest expense

Under the total, show two more lines:

- how many expenses there are,
- which single expense was the largest, with its description and amount.

**What you should see:** with Lunch at 4.50, Bus pass at 25.00, and Notebook at 3.20, the page shows 3 expenses and names the bus pass as the largest.

Decide before you prompt: what should those two lines show when the list is empty?

<details>
<summary>Hint</summary>

Your prompt needs the empty case in it. If you leave it out, look closely at the diff to see what Claude chose. It might show "undefined", hide the lines, or show a friendly message. Only one of those is likely to be what you want.

</details>

---

## Exercise 2 (Easy): Filter by category

Add a way to show only the expenses in one category.

1. A control above the list to pick **All** or one category.
2. The list shows only matching expenses.
3. The total shows the total of what's on screen.

**What you should see:** pick Food, and only food expenses show, with their own total. Pick All, and everything comes back.

Then answer in your journal: when the filter is set to Food and you add a Transport expense, what happens? Is it what you'd want as a user? Did you tell Claude what should happen, or did it decide?

<details>
<summary>Hint</summary>

There are at least two reasonable answers to the last question. The new expense could be saved but hidden, or the filter could switch back to All. Neither is wrong, but one of them will surprise your user less. That's a decision for your prompt.

</details>

---

## Exercise 3 (Medium): Edit an expense

The brief said editing was not part of the first version. Add it now.

1. Each expense gets a way to edit it.
2. You can change the description, the amount, and the category.
3. The same rules about bad input apply as when adding.
4. The change is saved and survives a refresh.

**Before you prompt,** update `BRIEF.md` first: move editing out of "Not in the first version" and describe how it should behave. Then ask Claude to build what the brief says.

In your journal:

- Did Claude reuse the code that checks for bad input, or write it a second time? How can you tell from the diff?
- If it wrote it twice, ask it to fix that. What did you say?

<details>
<summary>Hint 1</summary>

There are several ways editing could work on screen: filling the form at the top with the old values, or turning the row itself into input boxes. Pick one and name it. "Add editing" on its own leaves the biggest decision to chance.

</details>

<details>
<summary>Hint 2</summary>

To spot repeated code, look for two places in the diff that check the same things, such as "is the description empty" and "is the amount greater than zero". Two copies means two places to fix the next time the rules change.

</details>

---

## Exercise 4 (Medium): A monthly budget

Let the person set a budget and see how they're doing against it.

1. A box where they type their budget for the month. It's remembered between visits.
2. A line that shows how much is left.
3. When they've spent more than the budget, that line changes colour and says how far over they are.

**What you should see:** with a budget of 50 and a total of 32.70, the page says 17.30 is left. Add an expense of 20, and it turns to a warning that says 2.70 over.

In your journal: this feature needed several decisions that the description above doesn't settle. List at least three, and say how each one got made: by you in the prompt, by Claude asking, or by Claude guessing.

<details>
<summary>Hint</summary>

Some things the description leaves open: what shows before any budget is set, whether a budget of zero is allowed, what "this month" means when the app doesn't store dates, and what the warning colour is. A good first prompt might simply be: "Before building this, ask me about anything unclear."

</details>

---

## Exercise 5 (Challenge): Build it again, better

You now know things you didn't know at milestone 1. Use them.

1. Write a **new brief** from scratch, in a new folder called `expense-tracker-2`. Don't copy the old one. Put in everything you wish you'd said the first time, including the stretch goals you added.
2. Start a fresh Claude Code session there. Follow the same rules of the road.
3. Build the app again, in as many milestones as you think right.

Then compare the two projects.

| | First build | Second build |
|---|---|---|
| Number of prompts | | |
| Times you had to rewind | | |
| Things Claude added that you didn't want | | |
| Lines in `app.js` | | |
| Could you explain every line? | | |

In your journal:

- What were the three most valuable lines in your new brief?
- Was the second app's code better, or only different? How do you judge?
- What does this tell you about where the real work is when you build with an AI?

<details>
<summary>Hint 1</summary>

To count the lines in a file, ask Claude, or run `wc -l app.js` on macOS, Linux, or Git Bash. Fewer lines isn't automatically better, but a big difference is worth asking about.

</details>

<details>
<summary>Hint 2</summary>

A good way to compare the two versions: open a new session in your `claude-practice` folder and ask Claude to read both `app.js` files and tell you the three most important differences. Then decide whether you agree.

</details>
