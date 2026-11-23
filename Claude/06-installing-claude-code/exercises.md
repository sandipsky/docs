# 06 Installing Claude Code: Exercises

**How to do these:**

- From this chapter on, you need Claude Code, which needs a paid Claude plan or a Console account.
- Work in the `claude-practice` folder you made in chapter 01. Don't start Claude Code inside this docs folder. Chapter 07 explains why.
- Write your answers in `journal/ch06.md`.
- Nothing here changes any files, so you can't break anything. Explore freely.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, start a session and ask Claude to check your journal for the chapter.

---

## Exercise 1 (Easy): Install and prove it

1. Check that Git is installed: `git --version`.
2. Install Claude Code with the command for your system.
3. Open a **new** terminal and run `claude --version`.
4. Move into your `claude-practice` folder and start Claude Code.
5. Sign in, and answer the question about trusting the folder.
6. Ask it: "What folder are you working in, and what files can you see?"

In your journal, write down:

- the version number,
- which install method you used, and whether it updates itself,
- what Claude said it could see.

<details>
<summary>Hint</summary>

If the terminal says `claude` isn't recognised, you're probably still in the terminal you installed from. Close it and open a new one. If it still fails, run the install command again and read its last few lines, which usually say what went wrong.

</details>

---

## Exercise 2 (Easy): A health check

1. In a normal terminal, outside Claude Code, run `claude doctor`.
2. Start a session and type `/status`.

In your journal, write down:

- which **model** your sessions use,
- which **account** or plan you're signed in with,
- anything `claude doctor` warned you about, in your own words.

Then answer: what's the difference between `claude doctor` and `/doctor`? When would you use each?

<details>
<summary>Hint</summary>

One of them only looks and reports. The other can change things, with your permission. The notes describe both under "Check the setup".

</details>

---

## Exercise 3 (Medium): Read the map

You don't need to memorise commands. You need to know how to find them.

1. Type `/help` and scroll through the list.
2. On an empty line, press `?` to see the keyboard shortcuts.
3. Pick **three** commands you haven't seen in this course yet. For each one, *before* trying it, write down what you think it does.
4. Now find out. Read its description, or ask Claude: "What does the /context command do?"

In your journal, for each command: your guess, what it really does, and whether you were right.

Finally, type `/release-notes`. Find one change from the last month and write it down in one sentence.

<details>
<summary>Hint</summary>

If you start typing `/` and a few letters, Claude Code shows the matching commands with a short description of each. That's often the quickest way to remind yourself what something does.

</details>

---

## Exercise 4 (Medium): A second window

Install Claude Code in one other place. Pick whichever you'll actually use:

- the **VS Code extension**,
- the **desktop app** (open the Code tab),
- or simply run `claude` inside **VS Code's built-in terminal**.

Open your `claude-practice` folder there and ask the same question as in exercise 1: "What folder are you working in, and what files can you see?"

In your journal:

- Which window did you choose, and why?
- Name two things that look or work differently from the plain terminal.
- Name one thing that is exactly the same.

<details>
<summary>Hint</summary>

In VS Code, the built-in terminal opens from the **Terminal** menu, or with **Ctrl + `** (the key above Tab). To find the extension, open the Extensions panel and search for "Claude Code". Check that the publisher is Anthropic.

</details>

---

## Exercise 5 (Challenge): Where does it all live?

Claude Code keeps its own files in a folder called `.claude` inside your home folder. You're going to look, without touching.

1. Find the folder. On macOS and Linux it's `~/.claude`. On Windows it's `C:\Users\your-name\.claude`.
2. List what's inside it. **Don't edit or delete anything.**
3. For each file or folder you see, write a guess about what it's for, based only on its name.
4. Now start a Claude Code session and ask Claude to explain what those files and folders are for. Compare with your guesses.
5. Sign out with `/logout`, start `claude` again, and sign back in.

In your journal:

- Your guesses, and how many were close.
- After signing out and in again, did Claude Code still know your settings? What does that tell you about where settings live versus where your login lives?
- One file in that folder you should never share with anyone. Why?

<details>
<summary>Hint 1</summary>

Folders that start with a dot are hidden by default. In a terminal, `ls -a ~` shows them on macOS and Linux. In PowerShell, try `Get-ChildItem -Force $HOME`.

</details>

<details>
<summary>Hint 2</summary>

For the last question, think about what proves to Anthropic that you are you. Anything that holds your sign-in details is as sensitive as a password.

</details>
