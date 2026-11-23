# 17 Commands, Shortcuts and Settings

## What is it?

Claude Code has three kinds of controls:

- **Slash commands:** words starting with `/` that tell Claude Code itself to do something, like `/clear` or `/model`.
- **Keyboard shortcuts:** keys that act instantly, like Esc to stop.
- **Settings:** saved choices in a file, so Claude Code behaves the way you want every time.

You've already met many of them. This chapter collects the ones worth knowing into one place.

## Why does it matter?

You could do nearly everything in this course by typing sentences. So why learn commands and keys?

Because of speed, and because of control. Pressing Esc the instant Claude goes wrong saves a minute of watching it finish. Knowing `/context` exists means you can actually see why a session has gone muddy. And one line in a settings file can remove a question you've been answering by hand twenty times a day.

There's a trap here too. Claude Code has dozens of commands, and people try to memorise them all. Don't. You need about ten. For the rest, you only need to know how to look them up.

## Real-world example

Think about learning to drive a new car.

| In the car | In Claude Code |
|---|---|
| The pedals and the wheel. You use them without thinking | A handful of keys: Esc, Shift + Tab, Esc twice |
| The buttons on the dashboard | Slash commands |
| Seat position, mirrors, and radio presets, set once | Settings |
| The owner's manual in the glove box | `/help` |

Nobody reads the whole manual before driving. You learn the pedals, adjust the seat, and look things up when a warning light comes on.

## How it works

*Checked against Claude Code 2.1.330, in November 2026. Commands are added, renamed, and removed often. If one here doesn't work, type `/help` to see what your version has.*

### The ten to know first

If you learn nothing else in this chapter, learn these.

| Type or press | What it does |
|---|---|
| **Esc** | Stops Claude right now |
| **Esc** twice (on an empty prompt) | Opens rewind, to undo |
| **Shift + Tab** | Switches permission mode |
| `/clear` | Starts fresh, with an empty context |
| `/context` | Shows what's filling the context |
| `/compact` | Summarises the conversation to free space |
| `/diff` | Shows what has changed in your files |
| `/model` | Chooses which model answers |
| `/usage` | Shows how much of your plan you've used |
| `/help` | Lists everything else |

### Slash commands by job

You don't need to memorise this. Skim it, so you know what exists.

**Managing the conversation**

| Command | What it does |
|---|---|
| `/clear` | Starts a new conversation. The old one can still be resumed |
| `/compact [what to keep]` | Summarises the conversation so far |
| `/context` | Shows what's using the context window |
| `/rewind` | Goes back to an earlier point |
| `/resume` | Opens a past session |
| `/rename [name]` | Names this session |
| `/btw [question]` | Asks a side question that isn't added to the history |
| `/copy` | Copies Claude's last answer to your clipboard |
| `/export` | Saves the conversation as a text file |

**Working on code**

| Command | What it does |
|---|---|
| `/plan [task]` | Enters plan mode |
| `/diff` | Shows the changes in your working files |
| `/init` | Writes a starter `CLAUDE.md` |
| `/memory` | Shows and manages your memory files |
| `/code-review` | Reviews your changes for bugs |
| `/security-review` | Checks your changes for security problems |

**Models and usage**

| Command | What it does |
|---|---|
| `/model [name]` | Switches model |
| `/effort [level]` | Sets how hard Claude thinks |
| `/fast` | Turns fast mode on or off. It costs extra |
| `/usage` | Shows plan usage, session cost, and statistics |

**Setup and health**

| Command | What it does |
|---|---|
| `/config` | Opens the settings screen |
| `/permissions` | Shows and edits allow, ask, and deny rules |
| `/status` | Shows your version, model, and account |
| `/doctor` | Checks your setup and offers fixes |
| `/keybindings` | Opens the file where you can change shortcuts |
| `/statusline` | Sets up the status bar at the bottom |
| `/release-notes` | Shows what changed in recent versions |
| `/login` and `/logout` | Signs you in and out |
| `/help` | Lists commands |
| `/exit` | Leaves Claude Code |

A few commands have more than one name. `/cost` and `/stats` both open `/usage`. `/undo` is the same as `/rewind`. `/settings` is the same as `/config`.

Type `/` and a few letters, and Claude Code shows the commands that match, with a short description of each. That's faster than any list.

### Keyboard shortcuts

| Keys | What it does |
|---|---|
| **Esc** | Interrupts Claude |
| **Esc** twice | Opens the rewind menu, when the prompt is empty |
| **Shift + Tab** | Cycles permission modes |
| **Ctrl + C** | Interrupts. With nothing running, it clears what you've typed. Press again to exit |
| **Ctrl + D** twice | Exits |
| **Ctrl + R** | Searches your earlier prompts |
| **Ctrl + O** | Opens a fuller view of what Claude did |
| **Ctrl + B** | Sends a long-running command to the background, so you can keep working |
| **Ctrl + G** | Opens your prompt in a text editor, for writing something long |
| **Ctrl + T** | Shows or hides Claude's to-do list for the current task |
| **Alt + P** (Option + P on a Mac) | Switches model |
| **Up arrow** | Brings back your previous prompts |
| **?** on an empty prompt | Shows the shortcuts |

On some Windows terminals, Shift + Tab doesn't get through. If that's you, use **Alt + M** to switch modes.

### What you can type at the start of a line

| Start with | What it does | Example |
|---|---|---|
| `/` | Runs a command | `/context` |
| `@` | Mentions a file | `Explain @src/books.js` |
| `!` | Runs a terminal command, and shows Claude the result | `! npm test` |

### Writing a prompt on several lines

Pressing Enter sends your message. To start a new line instead:

| Method | Where it works |
|---|---|
| Type `\` then press **Enter** | Everywhere |
| **Ctrl + J** | Everywhere |
| **Shift + Enter** | In many terminals straight away. In VS Code's terminal and a few others, run `/terminal-setup` once first |
| **Ctrl + G** | Everywhere. Opens a real editor |

You can also paste several lines at once. For anything longer than a few lines, Ctrl + G is the most comfortable.

### Settings: where they live

Settings are kept in files named `settings.json`. There are three you'll use, and they stack.

| File | Applies to | Shared with your team? |
|---|---|---|
| `~/.claude/settings.json` | You, in every project | No |
| `.claude/settings.json` in a project | Everyone on this project | Yes. Commit it |
| `.claude/settings.local.json` in a project | You, in this project only | No. Keep it out of Git |

When they disagree, the more specific one wins: local beats project, and project beats your personal file. Companies can also set a fourth level, managed by an administrator, that beats all of these.

Lists are the exception. Permission rules from every level are **added together** instead of replacing each other. So a deny rule in your personal file still applies inside every project.

If this looks familiar, it should. It's the same idea as the `CLAUDE.md` locations in [chapter 11](../11-claude-md-and-memory/notes.md): one file for you, one for the team, and one for you inside a single project.

### Settings: changing them

The easy way is the settings screen:

```
/config
```

It lists the options with their current values, and saves your changes for you.

You can also edit the files directly. Here's a project settings file that pulls together what you've used so far:

```json
{
  "permissions": {
    "allow": ["Bash(npm test)", "Bash(node src/cli.js *)"],
    "ask": ["Bash(git push *)"],
    "deny": ["Read(./.env)", "Read(./.env.*)"]
  }
}
```

And a personal one that makes every new session start in plan mode:

```json
{
  "permissions": {
    "defaultMode": "plan"
  }
}
```

A warning about JSON. It's strict. A missing comma, a comma after the last item, or single quotes instead of double quotes will break the file. If your settings stop working after an edit, that's the first thing to check. `/doctor` can find the problem, and so can Claude if you ask it to look at the file.

### What goes in which file?

| The setting | Where |
|---|---|
| "Always allow `npm test`" | The project file. Everyone on the team benefits |
| "Never read `.env`" | The project file, and your personal file too |
| "I like to start in plan mode" | Your personal file. It's your taste |
| "Allow a script that only exists on my machine" | The local file |

A simple test: **would a teammate want this?** If yes, it goes in the project file and gets committed. If it's about your own taste or your own machine, it doesn't.

One safety detail. The more relaxed permission modes can't be switched on from a project's settings file. That's deliberate. Otherwise, a project you downloaded could quietly turn off your permission questions.

### Making it yours

Two small things are worth setting up once.

**The status line.** This is a bar at the bottom of the screen that can show things like the model, the folder, and how full the context is. Type `/statusline` and describe what you'd like to see. Having the context level always in view is a real help with the habits from [chapter 12](../12-managing-context/notes.md).

**Your own shortcuts.** `/keybindings` opens a file where you can change which keys do what. Leave this alone until a default key actually annoys you.

### Your own commands

You can add slash commands of your own. If you keep typing the same long instruction, such as how to prepare a release, you can save it once and run it with a short name.

In Claude Code these are called **skills**, and they get two chapters of their own, starting with chapter 21.

## Common mistakes

- **Trying to memorise every command.** Learn ten. Look up the rest with `/help` or by typing `/`.
- **Not knowing Esc.** Watching Claude do the wrong thing for a full minute, when one key stops it.
- **Using `/clear` when you meant `/compact`, or the other way round.** Clear is for a new task. Compact is for the same task in a long session.
- **A broken `settings.json`.** One stray comma, and your rules silently stop applying. Use `/config` or `/permissions` if you're unsure of the syntax.
- **Putting personal taste in the shared project file.** Your teammates now start in plan mode whether they like it or not.
- **Committing the local settings file.** It's meant to stay on your machine. Add it to `.gitignore`.
- **Trusting an old command list, including this one.** Commands change. `/help` is always right for your version.

## Quick recap

- Slash commands control Claude Code, shortcuts act instantly, and settings save your choices.
- Learn about ten: Esc, Esc twice, Shift + Tab, `/clear`, `/context`, `/compact`, `/diff`, `/model`, `/usage`, and `/help`.
- Start a line with `/` for a command, `@` for a file, or `!` for a terminal command.
- For a new line, type `\` then Enter, or press Ctrl + J.
- Settings stack: personal, then project, then local. Permission rules from all of them add up.
- Team settings go in the project file and into Git. Personal taste stays in your own files.
