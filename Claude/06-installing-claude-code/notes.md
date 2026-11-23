# 06 Installing Claude Code

## What is it?

This chapter gets **Claude Code** onto your computer, signs you in, and shows you around the screen. By the end you'll have it running and know how to check that it's healthy.

## Why does it matter?

So far Claude has only been able to talk. Claude Code gives it hands: it can read your files, edit them, and run commands in your project.

Installing it takes a few minutes. But a handful of small things trip people up: the wrong plan, a missing tool on Windows, or starting it in the wrong folder. Getting those right now saves you an evening of confusion later.

## Real-world example

It's like a new teammate's first day.

| First day at work | Setting up Claude Code |
|---|---|
| Getting a desk | Installing the program |
| Getting a key card | Signing in to your account |
| "Can you open the front door? The printer?" | Checking the setup with `claude doctor` |
| A tour of the building | Looking around the screen |

Nobody does real work on day one. They make sure the key card works.

## How it works

*Checked against Claude Code 2.1.330, in November 2026. Install commands rarely change, but if one fails, compare it with the official setup page at [code.claude.com/docs](https://code.claude.com/docs).*

### Before you install

You need three things.

**1. A plan that includes Claude Code.** That means Pro, Max, Ultra, Team, or Enterprise. The Free plan does not include it. You can also pay as you go with a Claude Console account, as [chapter 05](../05-models-effort-and-cost/notes.md) explained.

**2. A supported computer.**

- macOS 13 or newer,
- Windows 10 or newer,
- or a recent Linux, such as Ubuntu 20.04 or newer.

It needs about 4 GB of memory and an internet connection. Claude itself runs on Anthropic's computers, not on yours, so Claude Code can't work offline.

**3. Git.** You used it in your other courses. Check with:

```
git --version
```

On Windows, install **Git for Windows** if you haven't. Claude Code works without it, but with it Claude can use the Bash shell, which most examples online assume.

You do **not** need Node.js for the recommended install.

### Install it

Open a terminal and run the command for your system.

**macOS, Linux, or WSL:**

```
curl -fsSL https://claude.ai/install.sh | bash
```

**Windows, in PowerShell:**

```
irm https://claude.ai/install.ps1 | iex
```

**Windows, in the old Command Prompt:**

```
curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
```

These download and run Anthropic's official installer. This is called the **native install**, and it keeps itself up to date.

There are other ways if you prefer a package manager:

| Tool | Command | Updates itself? |
|---|---|---|
| Homebrew (macOS) | `brew install --cask claude-code` | No. Run `brew upgrade claude-code` |
| WinGet (Windows) | `winget install Anthropic.ClaudeCode` | No. Run `winget upgrade Anthropic.ClaudeCode` |
| npm | `npm install -g @anthropic-ai/claude-code@latest` | Needs Node.js 22 or newer |

A warning about the npm way. If you use **nvm** to switch between Node versions, a global npm install belongs to *one* of those versions. Switch to another, and the `claude` command can stop working. The native install doesn't have this problem, which is one reason it's the recommended one.

When the install finishes, **close your terminal and open a new one**. Then check it worked:

```
claude --version
```

You should see a version number, like `2.1.330`.

### Start it and sign in

Claude Code works on whatever folder you start it in. So first move into a project folder. For now, use the practice folder you made in chapter 01:

```
cd claude-practice
claude
```

The first time, two things happen:

1. **It asks you to sign in.** A browser window opens. Log in with your Claude account and approve the connection.
2. **It asks whether you trust this folder.** Claude Code is about to read files here, so it checks with you first. Say yes for your own folders. Think twice for a project you just downloaded from a stranger.

Then you'll see a prompt box, waiting for you to type. That's it. Claude Code is running.

### A quick look around

Try these now. Each starts with a `/`, which marks a **slash command**: an instruction to Claude Code itself, not a message to Claude.

| Type this | What you get |
|---|---|
| `/help` | The list of commands |
| `?` (on an empty line) | The keyboard shortcuts |
| `/status` | Your version, model, and account |
| `/exit` | Leave Claude Code |

You can also leave by pressing **Ctrl + D** twice.

And you can simply talk to it. Type:

```
What can you do in this folder?
```

### Check the setup

If something seems off, run this from a normal terminal, outside Claude Code:

```
claude doctor
```

It checks your installation and prints what it finds, without changing anything.

Inside a session there's also `/doctor`. That one goes further: Claude looks at your setup, suggests fixes, and applies them if you agree.

### Keeping it up to date

Claude Code gets updates very often.

- The **native install** updates itself in the background.
- To update right now, run `claude update`.
- With **Homebrew** or **WinGet**, you update it yourself, using the commands in the table above.

To see what changed, type `/release-notes` inside a session.

### Signing in and out

- `/login` signs you in, or switches to another account.
- `/logout` signs you out.

### Other windows onto Claude Code

The terminal is one window. There are others, and they all use the same engine.

| Where | How to get it |
|---|---|
| **VS Code** | In the Extensions panel, search for **Claude Code** by Anthropic and install it. It adds a Claude panel inside your editor |
| **JetBrains editors** | Install the **Claude Code** plugin. It also needs the terminal version installed |
| **Desktop app** | Open the Claude app and choose the **Code** tab |
| **Web** | Go to [claude.ai/code](https://claude.ai/code). The work runs on Anthropic's computers |
| **Phone** | The Claude mobile app can start and check on sessions |

**Which should you use for this course?** The terminal. Every chapter here describes the terminal's commands and keys, and everything else is built on it.

A comfortable setup is to open your project in VS Code and run `claude` in VS Code's built-in terminal. You get your editor and Claude side by side. The VS Code extension is good too, and most of what you learn carries over. Where the terminal uses a key press, the extension usually has a button or a menu instead.

## Common mistakes

- **Signing up for Free and wondering why it won't start.** Claude Code needs a paid plan or a Console account.
- **Using `sudo` with npm.** Don't. It causes permission problems later. Use the native install.
- **Not opening a new terminal after installing.** The old terminal doesn't know the `claude` command exists yet.
- **Starting it in your home folder.** Claude Code treats the folder you start in as the project. Your home folder holds everything you own. Always `cd` into a real project first.
- **Switching Node versions and losing `claude`.** That's the npm and nvm problem from above. Reinstall with the native installer.
- **Trusting any folder without thinking.** A project from the internet can contain files written to mislead an AI. Trust your own work freely, and strangers' work carefully.
- **Panicking when a screen looks different.** Updates change small things all the time. `/help` always shows what your version can do.

## Quick recap

- Claude Code needs a paid Claude plan (or a Console account), a supported computer, and Git.
- Install with the official script for your system. The native install updates itself.
- Start it with `claude` **inside a project folder**, then sign in and trust the folder.
- `/help`, `?`, `/status`, and `/exit` get you around. `claude doctor` checks your setup.
- It also runs in VS Code, JetBrains, the desktop app, the web, and your phone. This course uses the terminal.
