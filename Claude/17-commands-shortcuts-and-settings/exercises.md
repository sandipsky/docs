# 17 Commands, Shortcuts and Settings: Exercises

**How to do these:**

- Do these in your practice project, `claude-practice/bookshelf`.
- Commit before you start, so changes to settings files are easy to undo.
- Write your answers in `claude-practice/journal/ch17.md`.
- The aim is muscle memory. Do each key press several times, not once.
- If a command or key behaves differently from the notes, your version may have changed it. Write down what you found. That's a correct answer too.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your journal for the chapter.

---

## Exercise 1 (Easy): Scavenger hunt

Without looking at the notes, find the command or key for each job. Use `/help`, the `?` key, or type `/` and browse.

1. See how much of your plan's allowance you've used.
2. Copy Claude's last answer to the clipboard.
3. Find out which version of Claude Code you're running.
4. Bring back a prompt you typed ten minutes ago.
5. Save this conversation to a file.
6. See a fuller view of the steps Claude just took.
7. Ask a quick question without adding it to the conversation.
8. See what changed in the most recent version of Claude Code.

In your journal: the answer for each, and how you found it.

Then answer: which way of looking things up was fastest for you?

<details>
<summary>Hint</summary>

Typing `/` followed by a word that describes what you want often finds it. Try `/us`, `/cop`, or `/exp` and see what appears. For the ones that are keys instead of commands, press `?` on an empty prompt.

</details>

---

## Exercise 2 (Easy): Finger drills

Practise each of these until you can do it without thinking.

1. **Stop.** Ask Claude to "explain every file in this project in great detail". As soon as it starts, press **Esc**. Do this three times.
2. **Modes.** Press **Shift + Tab** to go all the way round the modes and back to the start. Do it twice.
3. **Rewind.** Ask for a tiny change, approve it, and undo it with **Esc twice**. Do it twice.
4. **Shell.** Run three commands with `!`: one that lists files, one that shows Git's status, and one that runs the app.
5. **Mention.** Type `@` and use the suggestions to pick a file, without typing its full name.

In your journal:

- Which of these did you already do without thinking, and which were new?
- After pressing Esc in step 1, was anything lost? What could you do next?

<details>
<summary>Hint</summary>

After an interrupt, the conversation is still there. You can send a new message that redirects Claude, such as "Just the `cli.js` file, in three sentences." Stopping isn't the same as starting over.

</details>

---

## Exercise 3 (Medium): Long prompts

1. Write a three-line prompt using `\` and Enter at the end of each line.
2. Write another using **Ctrl + J**.
3. Try **Shift + Enter**. Does it work in your terminal? If not, run `/terminal-setup` and try again.
4. Press **Ctrl + G**. In the editor that opens, write a proper prompt with the four parts from chapter 03 (goal, context, done, and limits) for this task: add a `count` command that prints how many books are on the shelf. Save and close.
5. Send it, and build the feature.

In your journal:

- Which method of adding a new line works in your terminal, and which will you use?
- Was your prompt better when you had room to write it? What did you include that you'd normally leave out?

<details>
<summary>Hint</summary>

If Ctrl + G opens an editor you can't find your way out of, you're probably in Vim. Press Esc, type `:q!`, and press Enter to leave without saving. Then ask Claude how to choose a different editor for your system.

</details>

---

## Exercise 4 (Medium): Three layers of settings

See for yourself how the settings files stack.

1. In your **personal** file, `~/.claude/settings.json`, set the default permission mode to plan mode, as shown in the notes. If the file already has content, add to it without removing anything.
2. Start a new session in `bookshelf`. Which mode are you in?
3. Start a new session in `expense-tracker`. Which mode are you in?
4. Now, in `bookshelf` only, create `.claude/settings.local.json` and set the default mode back to `default`.
5. Start new sessions in both projects again.
6. Run `/status` and look for where it lists the settings files in use.
7. Decide which default you really want, and tidy up.

In your journal:

- The mode you saw in each project, at steps 2, 3, and 5.
- Which file won in `bookshelf`? Why?
- Should `settings.local.json` be committed to Git? What did you do about it?
- A teammate asks you to put "start in plan mode" in the shared project file. Is that a good idea? What would you say?

<details>
<summary>Hint 1</summary>

If a session doesn't start in the mode you expect, the file is probably not valid JSON. Check for a missing comma between items, or an extra one after the last item. You can ask Claude to check the file, or run `/doctor`.

</details>

<details>
<summary>Hint 2</summary>

The notes give a simple test for where a setting belongs: would a teammate want it? Starting in plan mode is a matter of taste. Compare that with a rule that denies reading `.env`.

</details>

---

## Exercise 5 (Challenge): Make it yours

Set up Claude Code the way you'll actually use it, and write your own cheat sheet.

**Part 1: a status line.**

1. Run `/statusline`. Ask for a bar that shows at least the current model, the current folder, and how full the context is.
2. Look at what it created. Ask Claude to explain how it works.
3. Work for a few minutes and watch it change.

**Part 2: a settings review.**

1. Open all your settings files: personal, and the project and local ones in `bookshelf`.
2. For every line, decide whether it's in the right file. Move anything that isn't.
3. Make sure nothing personal is in a file that gets committed.

**Part 3: your cheat sheet.**

Create `claude-practice/cheatsheet.md`: one page, written by you, with only what **you** will use.

- your ten most useful commands and keys, in your own words,
- the three you keep forgetting,
- your personal rules, such as "commit before any big change".

In your journal:

- What does your status line show? Has seeing the context level changed how you work?
- Did you move any setting in part 2? From where to where?
- Compare your ten with the ten in the notes. What's different, and why?

<details>
<summary>Hint 1</summary>

Describe the status line in plain words: "Show the model name, the current folder, and the percentage of the context window that's used." Claude Code writes the script for you. You don't have to write it by hand.

</details>

<details>
<summary>Hint 2</summary>

A cheat sheet you wrote yourself is worth more than a complete one written by someone else. Keep it to one page. If it's longer, you've listed things you don't use.

</details>
