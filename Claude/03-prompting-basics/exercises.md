# 03 Prompting Basics: Exercises

**How to do these:**

- Use the chat app at [claude.ai](https://claude.ai).
- Write your prompts and what you noticed in `journal/ch03.md`, inside your `claude-practice` folder.
- Start a **new chat** each time you compare two prompts. Otherwise the second prompt gets help from the first.
- There isn't one correct prompt for any of these. A good answer is one where you can say *why* your prompt got a better result.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your journal for the chapter.

---

## Exercise 1 (Easy): Fill the gaps

Each of these prompts is too vague. Rewrite each one so it covers the four parts: goal, context, done, and limits. Make up sensible details where you need to.

1. `Write a function to sort my list.`
2. `Make the page look nicer.`
3. `Why is my code slow?`
4. `Write some tests.`

For each one, also write down which of the four parts was missing **most** badly.

<details>
<summary>Hint</summary>

For each prompt, ask: "What would Claude have to guess?" Sort a list of what, in which language, by what, smallest first or largest first? Every guess you can name is a line your prompt needs.

</details>

---

## Exercise 2 (Easy): Add the reason

Find a news article or a long blog post. Then, in two separate new chats:

1. Paste it with this prompt: `Summarise this in three bullet points.`
2. Paste it with the same prompt **plus a reason**. Invent one that would change what matters, for example: "I'm deciding whether to share this with my team of junior developers" or "I only care about what this means for people on a small budget."

In your journal:

- Copy both summaries.
- Underline what changed.
- Did the reason change *what* was included, *how* it was written, or both?

<details>
<summary>Hint</summary>

Pick a reason that points somewhere specific. "Because I'm busy" changes nothing, since a summary is already short. "Because I need to explain it to my grandmother" changes the words. "Because I'm checking it for mistakes" changes what gets picked.

</details>

---

## Exercise 3 (Medium): Teach a format with one example

You want product descriptions for an online shop, and they must all follow the same pattern.

1. Write **one** example description yourself, for any product, in a clear pattern. For instance: a short name line, one sentence about who it's for, then exactly three bullet points.
2. Give Claude your example and ask for descriptions of three other products in the same style.
3. Check the result against your pattern, line by line.
4. Now put a small quirk in your example on purpose, such as ending every bullet with an exclamation mark. Try again in a new chat.

In your journal, answer: did Claude copy the quirk? What does that teach you about choosing examples?

<details>
<summary>Hint</summary>

Tell Claude what the example is for: "Follow the style of this example." If you want it to copy the structure but not the wording, say so. Otherwise all three descriptions may start with the same words as your example.

</details>

---

## Exercise 4 (Medium): Let Claude interview you

You're going to plan a tiny app without writing any code.

1. Start a new chat with this idea: a small expense tracker for a student who wants to see where their money goes.
2. Ask Claude to interview you first. Limit it to five questions, and ask it to wait for your answers.
3. Answer honestly. If you don't know, say "you choose, and tell me what you picked".
4. Ask Claude to write a short **brief**: one paragraph describing the app, then a list of the features for the first version.

Save the brief in `journal/ch03-brief.md`. **Keep it.** You'll build this app in chapter 09.

Then answer in your journal:

- Which question made you think of something you hadn't considered?
- What would Claude have guessed wrong if it had started building straight away?

<details>
<summary>Hint 1</summary>

Something like: "Before you suggest anything, ask me up to five questions about things you'd otherwise have to guess. Ask them one at a time and wait for my answer."

</details>

<details>
<summary>Hint 2</summary>

If the brief comes back long, ask for the smallest version that would still be useful: "Cut this to what a first version really needs. Move everything else to a 'later' list."

</details>

---

## Exercise 5 (Challenge): The prompt clinic

Pick an exercise you already solved in your JavaScript or Python course. You know what a correct answer looks like, which makes you a fair judge.

1. Write the **worst** prompt you can that still mentions the task. Run it in a new chat and save the result.
2. Write the **best** prompt you can, using the checklist at the end of the notes. Run it in a new chat and save the result.
3. Run both pieces of code yourself.

In your journal, fill in this table:

| | Worst prompt | Best prompt |
|---|---|---|
| Did the code run? | | |
| Did it solve the real task? | | |
| Could a beginner read it? | | |
| Did it add things you never asked for? | | |

Then write three sentences: what was the single most valuable line in your best prompt, and how do you know?

<details>
<summary>Hint 1</summary>

To find your most valuable line, try removing lines one at a time. Take one line out of the best prompt, run it again in a new chat, and see whether the result gets worse.

</details>

<details>
<summary>Hint 2</summary>

Don't be surprised if the worst prompt still produces working code. Look closer: did it guess the same function name, the same input format, the same edge cases as your course exercise asked for? A result can run perfectly and still be the answer to a different question.

</details>
