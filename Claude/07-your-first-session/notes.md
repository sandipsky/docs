# 07 Your First Session

## What is it?

A **session** is one conversation with Claude Code inside a project. In this chapter you'll run your first real one. You'll ask Claude about some code, let it make one small change, read exactly what it changed, and then undo it.

That's the whole shape of working with an agent, in miniature: **ask, change, review, undo if needed.**

## Why does it matter?

The first time an AI edits files on your computer, it can feel like handing over the car keys. Two fears are common:

- "What if it changes something and I can't tell what?"
- "What if it breaks things and I can't get back?"

Both have simple answers, and you'll practise them today. You can always see exactly what changed. And you can always go back. Once you trust those two facts, everything else in this course gets easier.

## Real-world example

Think about a first driving lesson.

You don't start on the motorway. You start in an empty car park. You learn where the brake is before you learn anything else. Nothing you do there can hurt anyone, so you're free to try things.

Today's project is the empty car park. The undo commands are the brake.

## How it works

*Checked against Claude Code 2.1.330, in November 2026.*

### Set up the practice project

This chapter comes with a small app called **Bookshelf**: a reading list that runs in the terminal. It's in this chapter's `starter` folder.

You're going to copy it **out** of this docs folder, into your `claude-practice` folder. There's a real reason for that. Claude Code reads an instructions file called `CLAUDE.md` from the folder you start it in, and from every folder above it. This docs folder has one, written for lessons ("treat me like a student, don't give answers"). If you practised in here, Claude would follow those rules while you're trying to learn how it normally behaves.

**1. Copy the starter.** Use your file explorer, or a command. Replace the first path with wherever this docs folder is on your computer.

On macOS, Linux, or Git Bash:

```
cp -r path/to/docs/Claude/07-your-first-session/starter ~/claude-practice/bookshelf
```

On Windows PowerShell:

```
Copy-Item -Recurse "path\to\docs\Claude\07-your-first-session\starter" "$HOME\claude-practice\bookshelf"
```

**2. Check Node.** Bookshelf needs Node.js 20 or newer:

```
node --version
```

**3. Try the app yourself**, before Claude touches it:

```
cd ~/claude-practice/bookshelf
node src/cli.js list
node src/cli.js stats
```

You should see three books, one of them marked `[x]` for finished.

**4. Put it under Git.** This is your safety net, and it's what lets you see changes clearly.

```
git init
git add .
git commit -m "Start the bookshelf practice project"
```

**5. Start Claude Code**, from inside the `bookshelf` folder:

```
claude
```

### Step 1: Ask questions

Start by asking, not changing. Reading files is safe, so Claude doesn't need your permission for it.

```
What does this project do? Give me a short tour of the files.
```

Claude will open the files, read them, and answer. Your screen will show something like this (the exact wording will differ):

```
● Read package.json
● Read src/cli.js
● Read src/books.js
  ...

This is a small command-line reading list. src/cli.js reads the command
you type and calls functions in src/books.js. Books are saved in
data/books.json by src/store.js...
```

Those lines starting with a dot are Claude's **tool calls**: the steps it chose to take. Watch them. They show you how Claude is thinking.

Try a few more:

```
Where are the books saved, and what happens to that file when I run "add"?
```

```
Explain @src/books.js to me, one function at a time.
```

That `@` is new. Typing `@` followed by a file name **mentions** the file, which puts it straight into the conversation. Start typing after the `@` and Claude Code suggests matching files.

You're doing the first step of the loop from [chapter 01](../01-what-claude-is/notes.md): gathering context. Notice that you're learning the project too.

### Step 2: Ask for one small change

Now ask for something tiny and specific.

```
In the list output, show finished books with [done] instead of [x].
Change only what's needed.
```

Claude finds the right file and prepares an edit. Then it **stops and asks you**. You'll see the change it wants to make, something like:

```
 src/format.js

 -  const mark = book.finished ? "[x]" : "[ ]";
 +  const mark = book.finished ? "[done]" : "[ ]";
```

Lines starting with `-` (usually red) will be removed. Lines starting with `+` (usually green) will be added. This view is called a **diff**, short for "difference".

Below it are your choices. They amount to:

- **Yes:** make this one edit.
- **Yes, and stop asking about edits for the rest of this session.**
- **No:** don't make it. You can then tell Claude what to do instead.

**Read the diff before you answer.** Is this the file you expected? Is it only the change you asked for? Here it's one line in `format.js`, which is exactly right. Choose **Yes**.

### Step 3: See it working

Don't take Claude's word for it. Run the app.

You can do that without leaving Claude Code. Start a line with `!` and the rest runs as a normal terminal command:

```
! node src/cli.js list
```

You should see:

```
[done] 1. The Hobbit by J.R.R. Tolkien (310 pages)
[ ] 2. Dune by Frank Herbert (612 pages)
[ ] 3. Atomic Habits by James Clear (320 pages)
```

The `!` is called **shell mode**. The output is also added to the conversation, so Claude sees it too.

### Step 4: Review everything that changed

One edit is easy to follow. After twenty, you'll want the full picture. There are two ways to get it.

Inside Claude Code:

```
/diff
```

Or ask Git, which works anywhere:

```
! git diff
```

Both show every change since your last commit. Get into the habit of looking before you commit anything.

### Step 5: Undo it

Now the brake. Say you've decided you liked `[x]` better.

Make sure the prompt box is empty, then press **Esc twice**. (Or type `/rewind`.) A list of your earlier messages appears. Pick the one where you asked for the change. Then choose what to restore:

| Option | What it does |
|---|---|
| **Restore code and conversation** | Puts the files *and* the chat back to how they were |
| **Restore conversation** | Rewinds the chat only. The files stay as they are |
| **Restore code** | Puts the files back. The chat stays |

Choose **Restore code and conversation**. Then check:

```
! git diff
```

Nothing. The change is gone, as if it never happened.

This works because Claude Code saves a **checkpoint** before each of your messages: a snapshot it can return to.

One limit to know from day one. Checkpoints only cover edits Claude made with its own file-editing tools. If Claude runs a *command* that changes or deletes files, that isn't tracked. This is why you also have Git. [Chapter 15](../15-git-with-claude/notes.md) covers both properly.

### Stopping Claude mid-task

If Claude heads off in the wrong direction, press **Esc** once. It stops what it's doing and waits. Nothing is lost. Tell it what you actually wanted, and carry on.

Don't sit and watch it do the wrong thing out of politeness. Stopping early is normal.

### Leaving and coming back

Type `/exit`, or press **Ctrl + D** twice.

Your session is saved. To pick it up again from the same folder:

| Command | What it does |
|---|---|
| `claude --continue` | Reopens your most recent session in this folder |
| `claude --resume` | Shows a list of past sessions to choose from |

Inside a session, `/resume` shows the same list.

## Common mistakes

- **Saying yes without reading the diff.** This is the one habit that separates people who are in control from people who are along for the ride. Read every diff, even tiny ones.
- **Asking for five things at once.** "Change the marker, add colours, and sort by title" gives you one big diff that's hard to check. One change, one review.
- **No Git.** Without a commit to compare against, you can't see what changed, and you can't get back.
- **Choosing "stop asking" too early.** It's convenient later. While you're learning, being asked every time is the lesson.
- **Arguing instead of rewinding.** If a change went wrong, undo it and ask again more clearly. That's usually faster than three rounds of "no, not like that".
- **Starting in the wrong folder.** If Claude seems confused about your project, check where you started it. Ask: "What folder are you in?"
- **Believing "done" without running it.** Claude said it changed the output. Did it? One `!` command tells you.

## Quick recap

- Copy practice projects **out** of this docs folder, and put them under Git.
- Start by **asking questions**. Reading is safe and needs no permission.
- `@file` mentions a file. `!command` runs a terminal command.
- Before any edit, Claude shows a **diff** and asks. Read it, then decide.
- `/diff` or `git diff` shows everything that changed.
- **Esc** stops Claude. **Esc twice** (or `/rewind`) takes you back to a checkpoint.
- `claude --continue` picks up where you left off.
