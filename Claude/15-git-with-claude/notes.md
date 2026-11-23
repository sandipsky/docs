# 15 Git with Claude

## What is it?

You already know **Git**: it saves snapshots of your project, called **commits**, so you can see what changed and go back.

This chapter is about using Git *with* Claude Code. Claude can run Git for you: check what changed, write commit messages, make branches, and open pull requests. And Git, in turn, is what makes it safe to let Claude change your code at all.

## Why does it matter?

When you write code by hand, you change a few lines at a time and you remember what you did.

With Claude, a single prompt can change ten files in a minute. That speed is the whole point. It also means you need a reliable way to answer three questions, every time:

- **What exactly changed?**
- **Can I get back to how it was?**
- **Is this ready to share with other people?**

Git answers all three. Without it you're trusting your memory against a tool that types faster than you can read.

There's a nice bonus too. The parts of Git that people find tedious, like writing a clear commit message or describing a pull request, are jobs Claude is very good at.

## Real-world example

Think of a video game with save points.

| The game | Git with Claude |
|---|---|
| You save before the boss fight | You commit before a big change |
| The fight goes badly, so you reload | You go back to the commit |
| You never save, and lose two hours | You never commit, and lose an afternoon |
| A quick-save the game makes for you | Claude Code's **checkpoints** |
| Your own named save file | A **commit** |

Quick-saves are handy, but nobody trusts their whole game to them. You make real saves at the moments that matter.

## How it works

*Checked against Claude Code 2.1.330 and Git 2.53, in November 2026.*

### Two safety nets

You have two ways to go back. They cover different things.

| | Checkpoints | Git commits |
|---|---|---|
| Made by | Claude Code, automatically, before each of your messages | You, or Claude when you ask |
| Covers | Edits Claude made with its own editing tools | Everything Git tracks |
| Misses | Changes made by commands, and edits you made by hand | Nothing, once it's committed |
| Lasts | About 30 days, on your computer only | As long as the repository does |
| Shared with your team? | No | Yes, when you push |

Checkpoints are for the last few minutes. Git is for everything else. You need both, and neither replaces the other.

### The rewind menu

You met rewind in [chapter 07](../07-your-first-session/notes.md). Press **Esc twice** on an empty prompt, or type `/rewind`. Choose a point in the conversation, and you get this menu:

| Option | What it does |
|---|---|
| **Restore code and conversation** | Files and chat both go back |
| **Restore conversation** | The chat goes back. The files stay |
| **Restore code** | The files go back. The chat stays |
| **Summarize from here** | Replaces everything after this point with a summary |
| **Summarize up to here** | Replaces everything before this point with a summary |
| **Never mind** | Closes the menu |

The two "restore code" options only appear if files were edited after the point you chose.

Remember what rewind can't see. If Claude ran a command that deleted a file, moved a folder, or changed your data, a checkpoint doesn't bring it back. Only edits made with Claude's own file-editing tools are tracked.

### Let Claude run Git

You can ask for Git work in plain words.

```
What have I changed since the last commit?
```

Claude runs `git status` and `git diff`, and summarises them.

```
Commit this with a clear message.
```

Claude looks at the changes, writes a message, and makes the commit. It asks your permission first, because committing is a command.

A typical result:

```
Add remove command

Adds removeBook to books.js and a "remove" case in cli.js.
Removing an id that doesn't exist prints the same error as "finish".
```

That's a good message. The first line says what, and the rest says the details someone would want in six months.

**Read the message before you approve it.** It's part of the change. If it says something that isn't true, or misses the reason behind the change, say so and have it rewritten.

By default, Claude Code adds a line to the commit saying that it helped write it. Some teams like that and some don't. A setting called `attribution` lets you change or remove it.

### Commit small, commit often

With Claude, the right time to commit is **after every loop that works**.

```
loop: remove command  →  tests pass  →  commit
loop: search command  →  tests pass  →  commit
loop: sort option     →  tests pass  →  commit
```

Small commits give you three things:

- **A recent place to return to.** If the next step fails, you lose minutes, not hours.
- **A readable history.** Each commit is one idea.
- **Clean diffs.** `git diff` shows only the work in progress, not the whole day.

A good habit before any large change is to check the tree is clean:

```
! git status
```

If it says "nothing to commit", you have a safe starting point. If it doesn't, commit or throw away what's there first.

### One branch per task

A **branch** is a separate line of work. Changes on it don't touch the main line until you merge them.

With Claude, branches are cheap insurance. Start every task on its own:

```
Create a branch called add-search and switch to it.
```

Or do it yourself:

```
! git switch -c add-search
```

If the work turns out well, merge it. If it turns out badly, delete the branch, and your main line never knew.

This matters more with an agent than without one. You'll sometimes let Claude try an idea you're not sure about. On a branch, a failed experiment costs nothing.

### The undo ladder

Something went wrong. Which tool do you reach for? Start at the top and go down only as far as you need.

| What happened | What to use |
|---|---|
| Claude is going the wrong way **right now** | **Esc**. It stops |
| Claude's last edits were wrong | **Esc twice**, then restore the code |
| Uncommitted changes are a mess, however they got there | `git restore .` puts tracked files back to the last commit |
| A bad change was already committed | `git revert <commit>` makes a new commit that undoes it |
| The whole branch was a mistake | Switch away and delete the branch |

A word on `git restore .`. It throws away every uncommitted change to your tracked files, and there's no undo for that. Run `git status` first, so you know what you're about to lose.

### Pull requests

A **pull request**, or **PR**, is a request to merge your branch into the main line. On GitHub it's a page showing your changes, where teammates can read them, comment, and approve.

A PR needs a description, and writing a good one is a job Claude does well. It has read every change, so it can explain what was done and why.

There are two ways to open one.

**With the GitHub command-line tool.** If you've installed `gh` and signed in with `gh auth login`, Claude can do the whole thing:

```
Push this branch and open a pull request. In the description, say what
changed, why, and how I tested it.
```

**Without it.** Push the branch yourself, open the link GitHub prints, and ask Claude for the text:

```
Write a pull request description for this branch. Say what changed,
why, and how it was tested. Keep it short.
```

Then paste it in.

A good PR description answers three questions:

| Question | Example |
|---|---|
| **What** changed? | "Adds a `search` command that matches titles and authors." |
| **Why**? | "Readers with long lists couldn't find a book without scrolling." |
| **How was it tested?** | "Three new tests. Also ran search by hand with no matches and with no text." |

Before you ask anyone else to review, review it yourself. Open the PR page and read the diff from top to bottom, as if someone else had written it. Claude Code also has a `/code-review` command that looks over your changes for bugs. Chapter 48 covers reviewing properly.

### Commands that deserve a pause

Most Git commands are safe. A few can destroy work, yours or a teammate's.

| Command | Why to be careful |
|---|---|
| `git push --force` | Overwrites what's on the server. Can erase a teammate's commits |
| `git reset --hard` | Throws away commits and uncommitted work |
| `git clean -fd` | Deletes files Git isn't tracking. They don't go to a recycle bin |
| `git checkout .` or `git restore .` | Throws away all uncommitted changes |

Claude may suggest one of these for a good reason. When it does, ask what it will do and whether there's a gentler way.

You can make sure you're always asked, whatever mode you're in, with an **ask** rule from [chapter 08](../08-permissions-and-safety/notes.md):

```json
{
  "permissions": {
    "ask": ["Bash(git push *)"]
  }
}
```

Pushing is the moment your work leaves your computer. It's worth one deliberate yes.

### What should never be committed

Before any commit, glance at the list of files. Two things don't belong:

- **Secrets.** `.env` files, keys, and passwords. Once pushed, treat them as leaked, and change them.
- **Generated folders.** `node_modules`, build output, and the like. They belong in `.gitignore`.

Claude usually avoids both. "Usually" is why you look.

## Common mistakes

- **No commit before a big change.** Then there's nothing to come back to when it goes wrong.
- **One giant commit at the end of the day.** You can't undo part of it, and nobody can review it.
- **Trusting checkpoints for everything.** They don't cover changes made by commands. Git does.
- **Approving a commit message without reading it.** A message that says the wrong thing misleads everyone later.
- **Letting Claude push straight to the main branch.** Work on a branch and merge through a pull request.
- **Running `git restore .` without looking.** Check `git status` first. Something you wanted may be in there.
- **Committing a secret.** Check the file list before every commit, and keep `.env` in `.gitignore`.
- **Force-pushing because Claude suggested it.** Ask what it will overwrite, and whether there's a safer way.

## Quick recap

- Git is what makes it safe to let Claude change your code. Checkpoints cover minutes. Commits cover everything.
- Rewind only tracks Claude's own file edits, not changes made by commands.
- Ask Claude to commit, and **read the message** before you approve.
- Commit after every loop that works. Start each task on its own branch.
- Use the undo ladder: Esc, rewind, `git restore`, `git revert`, delete the branch.
- Claude writes good PR descriptions: what changed, why, and how it was tested.
- Pause before force-push, hard reset, and clean. Add an **ask** rule for `git push`.
