# 18 Working Efficiently: Exercises

**How to do these:**

- Do these in your practice project, `claude-practice/bookshelf`.
- Commit before you start.
- Write your answers in `claude-practice/journal/ch18.md`.
- You'll be measuring, so write numbers down as you go. Your numbers will differ from anyone else's. What matters is how they compare with each other.
- Some of these use a little more of your allowance than usual, on purpose. If you're close to a limit today, do exercise 4 first. It needs no session at all.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your journal for the chapter.

---

## Exercise 1 (Easy): Read your own meter

1. In a session, run `/usage`.
2. Find and write down:
   - how much of your **session** limit you've used,
   - how much of your **weekly** limit you've used,
   - when each one resets.
3. Look at the breakdown of what used your allowance, and at any suggestions it gives.
4. In the chat app, find the same information under Settings.

In your journal:

- The numbers from step 2.
- Is the chat app showing the same allowance as Claude Code, or a separate one?
- One suggestion `/usage` made. Does it match a habit from the notes?
- At your current pace, would you run out before the weekly reset?

<details>
<summary>Hint</summary>

`/usage` has more than one view. Look for tabs or sections for limits, for the current session, and for statistics. If you pay as you go with a Console account instead of a subscription, you'll see costs in dollars and no plan limits.

</details>

---

## Exercise 2 (Easy): The same request, twice

See for yourself that the context changes the cost.

**Round A: a cluttered session.**

1. Start a session. Ask Claude to read and explain every file in `src`, in detail.
2. Run `! npm test`.
3. Run `/context` and write down how much is used.
4. Now ask: "In `format.js`, change the word `Pages` to `Total pages` in the stats output."
5. Run `/context` again.

**Round B: a fresh session.**

1. Rewind the change. Then `/clear`.
2. Run `/context` and write down how much is used.
3. Send the exact same request as step 4 above.
4. Run `/context` again.

In your journal:

| | Round A | Round B |
|---|---|---|
| Context before the request | | |
| Context after the request | | |

- The request was identical. Roughly how many times more context did round A carry?
- The notes say every message is processed with the whole conversation. What does that mean for the cost of round A's request?
- Was round A's answer any better for having all that context?

<details>
<summary>Hint</summary>

Compare the two "before" numbers. That's everything round A's request had to carry along with it. The change itself was a single word in both rounds.

</details>

---

## Exercise 3 (Medium): Turn the effort dial

Use a new session for each run, and time it roughly.

**An easy task:**

```
Add a comment above each function in src/format.js saying what it does.
```

1. Run it with `/effort low`. Note the time, and look at the diff.
2. Rewind. Run it again with `/effort high`. Note the time, and look at the diff.

**A harder question:**

```
Without changing anything: if two people ran the "add" command at exactly
the same moment, could a book be lost? Explain your reasoning.
```

3. Ask it with `/effort low`.
4. In a new session, ask it with `/effort high`.

In your journal:

| | Low effort | High effort |
|---|---|---|
| Easy task: time | | |
| Easy task: quality | | |
| Hard question: time | | |
| Hard question: quality | | |

- On which task did the extra effort pay for itself?
- Write a one-line rule for yourself about when to raise the effort.
- Set the effort back to where you want it for everyday work.

<details>
<summary>Hint</summary>

For the hard question, judge the reasoning, not just the conclusion. Does the answer look at how `store.js` reads and writes the file? Does it describe the exact order of events that would lose a book? A short "yes, it could" and a careful walk-through are very different answers.

</details>

---

## Exercise 4 (Medium): Find the waste

Read this story of a working session, then answer the questions. You don't need Claude for this one.

> Dev starts Claude Code at 9:00 and types: "Read the whole project so you understand it." The project has 300 files.
>
> At 9:20 Dev asks: "Make the dashboard better." Claude redesigns the layout. Dev wanted it to load faster. "No, I mean faster." Claude adds caching to every page. "Not everything, just the dashboard." Claude tries again. "It's still slow." Claude tries a fourth approach.
>
> At 10:30 the dashboard is fixed. In the same session, Dev asks for a new sign-up form. Then a fix to the email settings. Then asks, "What does this regular expression do?" and gets a long, detailed answer, of which Dev reads the first line.
>
> At 12:00 Dev sets the effort to max "to be safe" and asks Claude to fix a typo in the footer.
>
> At 14:00 Claude starts forgetting that the project uses tabs, a rule Dev mentioned at 9:05. Dev repeats it. And again at 15:00.
>
> At 15:30 Dev hits the session limit.

In your journal:

1. Find at least **eight** separate wasteful habits. For each, quote the part of the story.
2. For each one, name the habit from the notes that would have fixed it.
3. Which **one** change would have saved the most? Why?
4. Rewrite Dev's 9:20 prompt so the first attempt would have been right.
5. Where should the rule about tabs have been written?

<details>
<summary>Hint 1</summary>

Look at each time on the clock. At every one, ask: what's in the context right now that isn't needed for this request? And: did Dev say what "done" looks like?

</details>

<details>
<summary>Hint 2</summary>

Some of the waste is hidden in what *didn't* happen. Dev never cleared, never planned, never looked at `/usage`, and never pressed Esc. Missing habits count too.

</details>

---

## Exercise 5 (Challenge): Your own rules

Turn this chapter into something personal.

**Part 1: look back.**

Go through your journal for chapters 07 to 17. Find three moments where you wasted time or allowance. For each, write what happened and which habit would have helped.

**Part 2: write your rules.**

Write **five** efficiency rules for yourself. They should be yours, in your own words, and specific enough to check. "Be efficient" isn't a rule. "Clear after every commit" is.

Add them to the cheat sheet you made in chapter 17.

**Part 3: test them.**

Pick a small feature for Bookshelf, such as a `list --longest` option that shows only the longest book. Build it while following all five rules deliberately. Before you start, run `/context` and note the time.

In your journal:

- Your three moments from part 1.
- Your five rules.
- For the feature in part 3: how many prompts did it take, how long, and how full was the context at the end?
- Which rule was hardest to follow? Did any of them slow you down for no benefit?
- One of your rules probably belongs in `~/.claude/CLAUDE.md`, and the others don't. Which one, and why not the rest?

<details>
<summary>Hint 1</summary>

Good rules have a trigger: "When X happens, I do Y." For example: "When I've corrected Claude twice, I clear and re-prompt." A trigger makes a rule easy to notice and easy to check.

</details>

<details>
<summary>Hint 2</summary>

For the last question, think about who each rule is for. A rule about how *Claude* should behave can go in a notes file that Claude reads. A rule about what *you* should do, such as when to clear, is a habit for you. Claude can't press the keys on your behalf.

</details>
