# 05 Models, Effort and Cost: Exercises

**How to do these:**

- Use the chat app at [claude.ai](https://claude.ai). A free account lets you compare two models, which is enough.
- Write your answers in `journal/ch05.md`, inside your `claude-practice` folder.
- For the sums, use the price table in the notes. Then check one price on [claude.com/pricing](https://claude.com/pricing) to see whether it has changed since this chapter was written.
- When you compare two models or two effort levels, use a **new chat** each time and paste exactly the same prompt.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your journal for the chapter.

---

## Exercise 1 (Easy): Set the dials

For each job, pick a model and an effort level, and give one reason.

1. Rename a variable in one file.
2. Find out why an app sometimes loses a user's shopping cart. Nobody has managed to work it out.
3. Add a short comment above each of 200 functions.
4. Decide how to split a large app into smaller services.
5. Write a regular expression that checks a phone number.
6. Fix a typo in a README.
7. Build a normal sign-up form with validation.
8. Review a plan for moving a live database with no downtime.

<details>
<summary>Hint</summary>

Ask two questions about each job. How bad is it if the answer is wrong? And how much thinking does it really need? A typo needs none. A live database move needs a lot, and a mistake is expensive.

</details>

---

## Exercise 2 (Easy): Do the sums

Use the API prices in the notes. Show your working.

1. A session reads 500,000 tokens and writes 40,000 tokens. What does it cost on Sonnet 5.5? On Opus 5.5? On Fable 5.2?
2. How many times more expensive is Fable than Sonnet for that session?
3. A script sends 10,000 short requests to Haiku 5.5. Each one reads 800 tokens and writes 100. What's the total cost?
4. In question 1, which part cost more on Opus: the reading or the writing? What does that tell you about asking for very long answers?

<details>
<summary>Hint</summary>

Turn tokens into millions first. 500,000 tokens is 0.5 million. Then multiply by the price per million. Do input and output separately and add them up. For question 3, work out the total tokens across all 10,000 requests before you multiply.

</details>

---

## Exercise 3 (Medium): Two models, same prompt

Open the model picker in the chat app and find two different models you have access to.

Run each of these prompts on both models, in new chats:

**An easy one:**

```
Write a JavaScript function that returns the largest number in an array.
```

**A harder one:**

```
A farmer has to get a fox, a chicken, and a sack of grain across a river.
The boat holds the farmer and one item. The fox can't be left alone with
the chicken, and the chicken can't be left alone with the grain.
Now add a second chicken, with the same rules. Is it still possible?
Explain your reasoning step by step.
```

In your journal, fill in:

| | Smaller model | Bigger model |
|---|---|---|
| Easy prompt: correct? | | |
| Easy prompt: how long did it take? | | |
| Hard prompt: correct and well reasoned? | | |
| Hard prompt: how long did it take? | | |

Then answer: on which prompt did the model choice matter? What does that suggest about when to switch?

<details>
<summary>Hint</summary>

You don't need a stopwatch. "A couple of seconds" versus "about half a minute" is enough. For the hard prompt, don't just read the last line. Check each step of the reasoning yourself, because a wrong path can still end with a confident conclusion.

</details>

---

## Exercise 4 (Medium): Turn the effort dial

Find the effort setting in the chat app. It's in the same menu as the model picker.

1. Pick a question that needs real thought. A logic puzzle works, or a design question such as: "I'm building a to-do app for one user. Should I store the tasks in a file, in the browser's local storage, or in a database? Give me your recommendation and the main trade-off."
2. Ask it in a new chat with effort set to the **lowest** level.
3. Ask it in another new chat with effort set to a **high** level.

In your journal:

- How long did each take?
- What did the high-effort answer consider that the low-effort one skipped?
- Was the low-effort answer wrong, or just thinner?
- Now think of a task where the low-effort answer would be exactly as good. Write it down.

<details>
<summary>Hint</summary>

If you can't find an effort setting, your current model may not offer one. Switch to a different model in the picker and look again. The notes list the level names.

</details>

---

## Exercise 5 (Challenge): Recommend a plan

Three people ask you which Claude plan to get. Open [claude.com/pricing](https://claude.com/pricing) and use **today's** prices, not the ones in the notes.

1. **Asha** is a student. She codes for about an hour most evenings and mainly wants help learning. She has very little money.
2. **Ben** is a freelance developer. He uses Claude Code most of the working day and sometimes runs out of allowance by mid-afternoon.
3. **Chen** leads a team of five developers at a small company. The work is for clients, so privacy matters.

For each person, write:

- the plan you'd recommend, and its price today,
- the default model and effort you'd suggest,
- one habit that would help them get more from their allowance,
- one thing you'd tell them to watch out for.

Finally: did any price or plan on the live page differ from the notes? Write down what changed.

<details>
<summary>Hint 1</summary>

For Asha, remember which plans include Claude Code and which don't. What could she do for free while she decides?

</details>

<details>
<summary>Hint 2</summary>

For Chen, look back at "Your privacy setting" in chapter 04. Personal plans and company plans treat your content differently by default.

</details>
