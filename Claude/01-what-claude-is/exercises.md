# 01 What Claude Is: Exercises

**How to do these:**

- You only need the chat app for this chapter. Go to [claude.ai](https://claude.ai) and sign in. A free account is enough for chapters 01 to 05.
- Make a folder for this course **outside** this docs folder, for example `claude-practice` in your home or projects folder. You'll keep all your practice work there. Chapter 07 explains why it should live outside.
- Inside it, make a `journal` folder with one file per chapter: `journal/ch01.md`, `journal/ch02.md`, and so on. Write your answers there.
- Start a **new chat** for each exercise, unless it says otherwise.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your journal for the chapter.

---

## Exercise 1 (Easy): Which door?

Here are eight jobs. For each one, write which door fits best: **chat app**, **Claude Code**, or **API**. Add one sentence saying why.

1. You want to understand what a "closure" is in JavaScript.
2. Your to-do app has a bug somewhere in its twelve files.
3. You run an online shop and want every new product description checked for spelling automatically.
4. You're writing a cover letter for a job.
5. You want to rename a function that is used in thirty places in your project.
6. You want to talk through whether to learn Django or FastAPI next.
7. You're building a phone app that answers customers' questions.
8. You want tests added to an existing project, and you want them run.

<details>
<summary>Hint</summary>

Ask two questions about each job. Does it need to see or change files in a project? Then it's Claude Code. Does it need to happen by itself, inside a program, with no person typing? Then it's the API. Everything else is a conversation.

</details>

---

## Exercise 2 (Easy): Your first conversation

Pick one idea from your JavaScript or Python course that you found hard. Then:

1. Ask Claude to explain it **to a ten-year-old**.
2. In the same chat, ask Claude to explain it again **to a senior engineer**.
3. Ask it for one small code example, and type that example out yourself and run it.

In your journal, write down:

- two things that changed between the first explanation and the second,
- whether the code example ran the first time.

<details>
<summary>Hint</summary>

Write a full sentence, not keywords. For example: "I'm learning JavaScript and I don't really understand callbacks. Explain them to a ten-year-old, using an everyday example."

</details>

---

## Exercise 3 (Medium): Spot the loop

Read this short story of an agent at work:

> Sam asks Claude Code: "The total on the cart page is wrong when there's a discount."
> Claude opens `cart.js`. Then it opens `discount.js`. It runs the tests, and one fails.
> It changes one line in `discount.js`. It runs the tests again. They pass.
> It opens the cart page code to see if anything else uses the old behaviour. Nothing does.
> It tells Sam what was wrong, what it changed, and that the tests pass now.

1. Copy each of Claude's steps into your journal, one per line.
2. Label each step **gather**, **act**, or **check**.
3. Which step would a plain chatbot have been unable to do at all? Why?
4. Sam wrote one sentence. Count the steps Claude chose by itself.

<details>
<summary>Hint</summary>

A step can gather *and* check. Running the tests the first time tells Claude where the problem is. Running them the second time tells it whether the fix worked. Same action, different purpose.

</details>

---

## Exercise 4 (Medium): Be the hands

This exercise makes you feel the copy-and-paste loop, so you know what Claude Code saves you from.

1. In the chat app, ask Claude to write a small program in JavaScript or Python that reads a list of prices and prints the total and the most expensive item.
2. Copy the code into a file on your computer and run it yourself.
3. Now ask for a change: prices under 1 should be ignored. Copy the new code over and run it again.
4. Ask for one more change of your own choosing, and repeat.

In your journal:

- Count how many times you copied something **out of** the chat, and how many times you pasted something **into** it.
- Name one thing Claude could not see during this exercise that it would have needed if something had gone wrong.
- In two sentences, describe how the same job would go in Claude Code.

<details>
<summary>Hint</summary>

Think about what happens after you press Run. Who sees the output? If the program had crashed, how would Claude have found out?

</details>

---

## Exercise 5 (Challenge): Catch it being wrong

Claude knows a lot about famous things and much less about small, local ones. Use that to see its limits for yourself.

1. Pick a topic you know very well and the internet barely covers: your school, your neighbourhood, a small local sports team, or a program you wrote yourself.
2. Ask Claude three specific factual questions about it.
3. For each answer, mark it in your journal as **right**, **wrong**, or **honestly unsure** (Claude said it didn't know).
4. Pick one answer and ask: "How sure are you about that, and how could I check it?"

Then answer these:

- Did any wrong answer *sound* less confident than the right ones?
- What does that tell you about using confidence as a sign of truth?
- Look back at "What Claude is not" in the notes. Which point did you just see in action?

<details>
<summary>Hint 1</summary>

Good questions have one checkable answer: a year, a name, a number. "Who was the head teacher in 2015?" is better than "Tell me about my school."

</details>

<details>
<summary>Hint 2</summary>

If Claude says "I don't have reliable information about that", count it as a good result, not a failure. An honest "I don't know" is far more useful than a made-up answer.

</details>
