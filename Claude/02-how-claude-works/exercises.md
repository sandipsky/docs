# 02 How Claude Works: Exercises

**How to do these:**

- Use the chat app at [claude.ai](https://claude.ai). A free account is enough.
- Write your answers in `journal/ch02.md`, inside your `claude-practice` folder.
- Start a **new chat** for each exercise, unless it says otherwise. Several of these only work in a fresh chat.
- These are experiments. Your results may differ from a friend's, and that's part of the lesson.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your journal for the chapter.

---

## Exercise 1 (Easy): Get a feel for tokens

Using the rough numbers from the notes, estimate how many tokens each of these is. Show your working.

1. A 500-word blog post.
2. A 300-page novel with about 300 words on each page.
3. This sentence: `The quick brown fox jumps over the lazy dog.`
4. How many 500-word blog posts would fill a one-million-token context window?

Then answer: a file of code and an essay have the same number of characters. Which one probably uses more tokens, and why?

<details>
<summary>Hint</summary>

The notes say 1,000 words is very roughly 1,800 tokens. So multiply the number of words by 1.8. For question 4, work out the tokens in one post first, then divide a million by it.

</details>

---

## Exercise 2 (Easy): Find the edge of its knowledge

1. Ask Claude: "What is your knowledge cutoff date?"
2. Pick a tool you use, such as React, Django, or Node.js. Ask Claude: "What is the latest version of this that you know about, from your training alone? Don't search the web."
3. Now look up the real latest version on the tool's official website.

In your journal:

- Write down both version numbers.
- Is there a gap? How big?
- Name one thing that could go wrong if you asked Claude to write code for that tool from memory.

<details>
<summary>Hint</summary>

If Claude offers to search the web, or does so by itself, say you want its answer from memory only. You're testing what's in its training, not what it can look up.

</details>

---

## Exercise 3 (Medium): Watch it forget

1. Start a new chat. Tell Claude a few made-up facts about a project:

   ```
   My project is called Blue Heron. It uses tabs, not spaces.
   The main file is called nest.js. Please remember this.
   ```

2. In the **same** chat, ask: "What's my project called and what's its main file?"
3. Now start a **brand-new** chat and ask the exact same question.

In your journal:

- What happened in step 2? What happened in step 3?
- Explain the difference using the desk from the notes.
- Where would these facts need to live so that Claude knows them tomorrow? Name the place for Claude Code and one option for the chat app.

<details>
<summary>Hint 1</summary>

If Claude does know the answer in the brand-new chat, it's because the chat app has a memory feature that can carry things between conversations. Chapter 04 covers it. Try once more in an **incognito chat** (look for a ghost icon), which doesn't use memory.

</details>

<details>
<summary>Hint 2</summary>

For the last question, look at the sections "No memory between sessions" and "The context window" in the notes. One of the items in the context window list is a file.

</details>

---

## Exercise 4 (Medium): Go hunting for a hallucination

You're going to ask about something that doesn't exist and see what Claude does.

1. Ask Claude: "Show me how to use the built-in `Array.prototype.shuffleInPlace` method in JavaScript."
2. Whatever it says, ask: "Where is that in the official documentation?"
3. Check it yourself. Open a terminal, run `node`, and type:

   ```js
   [1, 2, 3].shuffleInPlace();
   ```

4. Try the same idea once more with a made-up function from a library you know.

In your journal:

- Did Claude tell you the method doesn't exist, or did it play along?
- Which of the four defences in the notes did you use in step 2? In step 3?
- Which defence gave you a certain answer, and why is it stronger than asking Claude?

<details>
<summary>Hint</summary>

Either result teaches you something. If Claude corrects you, good: note how it worded it. If it invents an explanation, that's the hallucination you were hunting. The point is step 3. Running the code gives you an answer that doesn't depend on trusting anyone.

</details>

---

## Exercise 5 (Challenge): Same question, different answers

1. Open three separate new chats. In each one, paste exactly this:

   ```
   Suggest one small project to practise JavaScript arrays. One sentence only.
   ```

2. Write down the three answers.
3. Now write a much more specific prompt. Say who it's for, how long it should take, and what it must include. Run *that* in three more new chats.
4. Write down those three answers too.

In your journal:

- Were the first three answers the same? Were they all acceptable?
- Did the answers get closer together with the specific prompt?
- The notes say there's "a little randomness" in which token gets picked. Based on your experiment, what's the best way to make Claude's output more predictable?
- When might you *want* different answers each time?

<details>
<summary>Hint 1</summary>

A specific prompt might say: "for someone who just learned `map` and `filter`", "should take about an hour", "must use real-life data such as a shopping list".

</details>

<details>
<summary>Hint 2</summary>

For the last question, think about brainstorming. If you're stuck for ideas, is it helpful or unhelpful that asking again gives you something new?

</details>
