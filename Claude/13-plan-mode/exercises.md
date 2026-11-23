# 13 Plan Mode: Exercises

**How to do these:**

- Do these in your practice project, `claude-practice/bookshelf`.
- Commit before each exercise.
- Write your answers in `claude-practice/journal/ch13.md`.
- When a plan is approved in these exercises, choose the option that lets you **approve each edit by hand**.
- An exercise is done when you can say what you changed in Claude's plan and why.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your journal for the chapter.

---

## Exercise 1 (Easy): In and out

Practise switching, so it becomes automatic.

1. Start a session. Press **Shift + Tab** until plan mode is on. Write down what the screen shows.
2. Ask Claude to change one line of text in the help message. What happens?
3. Leave plan mode with **Shift + Tab**.
4. Now enter it a second way, with the `/plan` command.
5. Exit Claude Code and start it a third way, already in plan mode.

In your journal:

- What did Claude do in step 2 instead of editing?
- Write the three ways to enter plan mode, from memory.
- Which one will you use most? Why?

<details>
<summary>Hint</summary>

For step 5, the notes give a command that starts Claude Code in plan mode from the terminal. In step 2, notice that Claude doesn't refuse and stop. It does everything it's still allowed to do.

</details>

---

## Exercise 2 (Easy): Judge a plan

1. In plan mode, ask for the search feature described in the notes: a `search <text>` command that matches titles and authors, ignoring upper and lower case.
2. When the plan appears, **don't approve it yet**. Copy it into your journal.
3. Go through the six questions in "Reading a plan" and answer each one about this plan.
4. Choose to keep planning for now, and leave the feature unbuilt. You'll finish it in the next exercise.

In your journal, answer all six questions. For the last one, "What's missing?", find at least **two** things the plan doesn't cover.

<details>
<summary>Hint</summary>

Think about unusual ways someone might use the command. What if they type no search text at all? What if the text has a space in it? What if every book matches? What if none does? A plan doesn't have to handle every one, but each should be a decision, not an accident.

</details>

---

## Exercise 3 (Medium): Push back, then build

Continue from exercise 2, or ask for the search plan again.

1. Choose **No, keep planning**.
2. Give **one** clear piece of feedback about something the plan missed or got wrong.
3. Read the revised plan. Did it change only what you asked?
4. Give a second round of feedback, about how the feature will be checked.
5. When you're satisfied, approve it and choose to approve edits by hand.
6. Compare each diff with the final plan as it arrives.
7. Run the checks from the plan, and commit.

In your journal:

- Your two pieces of feedback, and how the plan changed after each.
- Did any diff contain something the plan didn't mention?
- How long did the planning take, compared with the building?

<details>
<summary>Hint</summary>

Keep each round of feedback to one topic. If you send four changes at once and the new plan gets one of them wrong, it's harder to say which. Small, clear corrections are easier for you and for Claude.

</details>

---

## Exercise 4 (Medium): Take the pen

Sometimes it's quicker to edit the plan yourself.

1. In plan mode, ask for this feature: a `list --sort title` option that shows the books in alphabetical order by title.
2. When the plan appears, press **Ctrl + G** to open it in your editor.
3. Make two changes by hand:
   - remove any step you think isn't needed, or shorten one,
   - add a limit of your own, such as "Don't change how the books are stored in the file. Only the order they're displayed in."
4. Save and close the editor.
5. Approve the plan and build it.

In your journal:

- What did you remove, and what did you add?
- Did Claude follow your edited version?
- When is editing the plan yourself better than typing feedback?

<details>
<summary>Hint</summary>

If Ctrl + G opens an editor you don't know how to use, close it without saving and ask Claude in a `/btw` how to set your preferred editor. Many systems use the `EDITOR` setting to decide which one opens.

</details>

---

## Exercise 5 (Challenge): Two plans, one choice

Real features usually have more than one reasonable design. Use plan mode to compare them before you commit to either.

The feature: let a reader record **when** they finished a book, and show that date in the list.

1. In plan mode, ask Claude for **two different approaches**, and what each one costs. Don't hint at which you prefer.
2. Ask a follow-up about each: "What could go wrong with this one?"
3. Ask: "What did you assume that I didn't tell you?"
4. Choose an approach. Tell Claude which, and why.
5. Get the final plan, approve it, build it, and check it.

In your journal:

| | Approach A | Approach B |
|---|---|---|
| In one sentence, what is it? | | |
| Files changed | | |
| Biggest risk | | |
| What happens to books that are already finished? | | |

Then answer:

- Which did you choose, and what decided it?
- What assumptions did Claude list in step 3? Was any of them wrong?
- The last row of the table is about existing data. Did either plan mention it before you asked? What does that tell you about reading plans?

<details>
<summary>Hint 1</summary>

Your data file already has a finished book in it, saved before dates existed. Whatever you build has to cope with a finished book that has no date. That's the kind of thing a plan often forgets, because it only thinks about new data.

</details>

<details>
<summary>Hint 2</summary>

If the two approaches Claude offers are nearly the same, say so and ask for a genuinely different one. For example, one might store a date, and another might store more than that. You're practising getting real alternatives, not two versions of the same idea.

</details>
