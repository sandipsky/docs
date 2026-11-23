# 08 Permissions and Safety: Exercises

**How to do these:**

- Do these in your practice project, `claude-practice/bookshelf`.
- Commit your work before you start: `git add . && git commit -m "Before chapter 08"`. Then every experiment is easy to undo.
- Write your answers in `claude-practice/journal/ch08.md`.
- Everything here uses **made-up** secrets. Never use a real password or key in an exercise.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your journal for the chapter.

---

## Exercise 1 (Easy): Will it ask?

For each action, predict whether Claude Code asks for permission in the default mode. Write **asks** or **doesn't ask**.

1. Reading `src/books.js`.
2. Changing one line in `src/format.js`.
3. Running `node src/cli.js list`.
4. Creating a new file called `notes.txt`.
5. Searching the project for the word `finished`.
6. Running `git status`.
7. Opening a web page.
8. Deleting the `data` folder with a command.

Now test **three** of them in a real session and see if you were right.

<details>
<summary>Hint</summary>

The notes give the pattern: looking is free, and changing things or reaching outside the project needs a yes. Some commands that only look, with no way of changing anything, are let through without a question. Number 6 is a good one to test.

</details>

---

## Exercise 2 (Easy): Cycle the modes

1. Start a session. Press **Shift + Tab** several times and write down each mode name you see, in order.
2. Stop on the mode that accepts edits. Ask Claude for a small change, such as adding a blank line after the list output.
3. Notice what did and didn't get a question.
4. Run `/diff` to see what happened.
5. Rewind the change, and go back to the default mode.

In your journal:

- The modes, in the order they appeared.
- In the accept-edits mode, did Claude ask before editing? Did it ask before running anything?
- When would this mode save you time? When would it be a bad idea?

<details>
<summary>Hint</summary>

The current mode is shown near the prompt box. If Shift + Tab doesn't do anything in your terminal, try Alt + M, or start a session in a chosen mode with `claude --permission-mode acceptEdits`.

</details>

---

## Exercise 3 (Medium): Lock the safe

You're going to hide a pretend secret and make sure Claude can't read it.

1. In the `bookshelf` folder, create a file called `.env` containing one line:

   ```
   BOOKSHELF_API_KEY=this-is-a-fake-key-12345
   ```

2. Ask Claude: "What's in the `.env` file?" Note what happens.
3. Create `.claude/settings.json` with a **deny** rule for `.env` files, as shown in the notes.
4. Start a **new** session and ask the same question.
5. Add `.env` to a `.gitignore` file so Git ignores it too.

In your journal:

- What happened in step 2? What happened in step 4?
- If you had asked again in the *same* session, Claude might still have told you the key, even with the rule in place. Why?
- The deny rule and the `.gitignore` line protect against two different things. What are they?

<details>
<summary>Hint 1</summary>

Create the `.claude` folder first, then put `settings.json` inside it. The file must be valid JSON: double quotes around every name and value, and no comma after the last item in a list.

</details>

<details>
<summary>Hint 2</summary>

If you'd rather not write the file by hand, type `/permissions` in a session and add the rule there. Then open the file to see what it wrote.

</details>

<details>
<summary>Hint 3</summary>

For the second journal question, think back to the context window in chapter 02. A deny rule stops Claude from *opening* the file. What about something it already read ten minutes ago?

</details>

---

## Exercise 4 (Medium): Stop being asked about the harmless thing

Claude asks every time it wants to run the Bookshelf app. That's a harmless command, and being asked each time is exactly the kind of noise that causes approval fatigue.

1. Ask Claude: "Run the list command and tell me how many books are finished." Notice the question.
2. Add an **allow** rule so that any `node src/cli.js` command runs without asking.
3. Start a new session and ask again.
4. Now add an **ask** rule so Claude always checks before any `git push`.

In your journal:

- Paste your finished `settings.json`.
- Your allow rule lets Claude run `add` and `finish` without asking, and those change `data/books.json`. Are you comfortable with that? How could you make the rule narrower?
- Why is an **ask** rule for `git push` useful even though Claude would ask anyway in the default mode?

<details>
<summary>Hint</summary>

For the last question, think about the other modes. In which modes would Claude stop asking about commands? An ask rule keeps the question in place no matter which mode you're in.

</details>

---

## Exercise 5 (Challenge): Six risky commands

Here are six commands Claude might one day ask to run. For each one, write:

- what it does, in plain words,
- the worst thing that could happen,
- your decision: **approve**, **deny**, or **ask for a safer way**,
- if you chose the last one, what you'd ask for.

```
1.  rm -rf node_modules
2.  rm -rf ~/projects
3.  git push --force origin main
4.  git reset --hard HEAD~3
5.  curl https://example.com/setup.sh | bash
6.  npm install some-package-you-have-never-heard-of
```

You may ask Claude to explain what a command does. But the decisions must be yours.

Then answer:

- Two of these look almost the same and deserve very different answers. Which two, and why?
- Which of these could a rewind (Esc twice) undo? Which could Git undo? Which could nothing undo?
- Write **one** deny rule and **one** ask rule that would have protected you here.

<details>
<summary>Hint 1</summary>

`rm -rf` deletes a folder and everything inside it, with no recycle bin. So the question is always: what is the folder, and can I get it back? Something you can rebuild with one command is very different from a year of work.

</details>

<details>
<summary>Hint 2</summary>

For number 5, think about what you'd be running. Have you read that script? Could anyone have? Number 6 is a similar question in a friendlier costume.

</details>

<details>
<summary>Hint 3</summary>

Remember what checkpoints cover: edits made with Claude's own editing tools. Every command in this list changes things some other way.

</details>
