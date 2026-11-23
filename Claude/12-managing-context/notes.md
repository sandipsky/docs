# 12 Managing Context

## What is it?

**Context** is everything Claude can see right now: your messages, its answers, the files it has read, and the output of commands it has run. It all sits in the **context window**, the "desk" from [chapter 02](../02-how-claude-works/notes.md).

**Managing context** means two things:

- putting the **right** things on the desk, and
- clearing the desk when it gets cluttered.

## Why does it matter?

A session that starts sharp often ends muddled. After an hour, Claude forgets a rule you gave it at the start. It re-reads files it already read. It starts mixing up two tasks.

Claude didn't get tired. The desk got crowded. Every file, every long command output, and every abandoned idea is still sitting there, and the one thing that matters now is buried under all of it.

Good context is the difference between a session where Claude gets it right first time and one where you correct it five times. It also decides how fast you use up your plan's allowance, because everything on the desk is counted on every turn.

Experienced people who work with Claude all day tend to say the same thing: most of the skill is managing context.

## Real-world example

Picture a shared whiteboard in a meeting room.

| The whiteboard | The context window |
|---|---|
| You write up the facts everyone needs | You point Claude at the right files |
| After two hours it's covered in old notes | A long session fills with old output |
| Someone can't find today's plan among last week's scribbles | Claude loses track of your instruction |
| You photograph the important corner, then wipe the board | `/compact` |
| New meeting, clean board | `/clear` |
| The rules printed on the wall never get wiped | `CLAUDE.md` |

Nobody would run six different meetings on one whiteboard without cleaning it. That's what one giant session is.

## How it works

*Checked against Claude Code 2.1.330, in November 2026.*

### See what's on the desk

Type:

```
/context
```

You get a breakdown of what's using the window: Claude Code's own instructions, your memory files, the conversation so far, and how much room is left. It also offers tips for freeing space.

Run it now and then. You'll soon get a feel for what's expensive. Reading one big file can cost more than an hour of chatting.

### Putting the right things on the desk

Claude is good at finding files for itself. But when you already know what matters, pointing saves time and tokens.

**Mention a file with `@`.**

```
Look at @src/format.js. Why are the stats lines padded with spaces?
```

The file goes straight into the conversation. Claude doesn't have to search for it.

**Give the real thing.** Paste the actual error, not your memory of it:

```
I ran "node src/cli.js stats" and got this:

TypeError: Cannot read properties of undefined (reading 'length')
    at getStats (src/books.js:24:27)
```

**Let Claude see a command's output.** Start a line with `!` and the output joins the conversation:

```
! node src/cli.js list
```

Then just say: "The second line looks wrong. Why?"

**Show it a picture.** For anything visual, a screenshot beats a description. Copy an image to your clipboard, then paste it into the prompt:

| System | Paste an image with |
|---|---|
| Windows | **Alt + V** |
| macOS and Linux | **Ctrl + V** |

A small `[Image #1]` marker appears in your prompt. This is how you show Claude a design, a broken layout, or an error that's only on screen.

### What fills the desk

Some things take far more room than you'd expect.

| Costly | Why |
|---|---|
| Reading whole large files | Every line counts, even if Claude needed three of them |
| Long command output | A test run that prints 2,000 lines puts 2,000 lines on the desk |
| "Read the whole project first" | Most of it won't matter for this task |
| Several attempts at the same fix | Every failed attempt stays in view |
| One session for many tasks | Task one's files are still there during task five |

The fix is rarely "give less". It's "give what's relevant". Ask Claude to search for the function instead of reading every file. Ask for the failing test's output instead of the whole run.

### Clearing the desk: /clear

```
/clear
```

This starts a new conversation with an empty context. Your `CLAUDE.md` and memory are loaded again, just like a fresh session.

Use it **between unrelated tasks**. Finished the search feature and moving on to a bug in stats? Clear first. The search work can only get in the way.

The old conversation isn't deleted. You can get back to it with `/resume`. To make it easy to find later, give it a name before you clear:

```
/rename search-feature
/clear
```

### Tidying the desk: /compact

Sometimes you're in the middle of a long task and don't want to lose the thread. That's what `/compact` is for:

```
/compact
```

Claude replaces the conversation so far with a summary, and keeps going. You free up space without starting over.

You can say what the summary should hold on to:

```
/compact Keep the plan we agreed on and the list of files already changed.
```

Claude Code also does this by itself when the window is nearly full. That's called **auto-compaction**. It's better to compact at a moment *you* choose, such as between two steps of a task, than to have it happen halfway through an edit.

### What survives, and what doesn't

A summary is shorter than the original, so something always gets left out.

| Survives a compact | Can be lost |
|---|---|
| Your project `CLAUDE.md`. It's read again from the file | An instruction you only gave in conversation |
| Auto memory | The exact wording of an earlier decision |
| The plan, if you made one in plan mode | Details from early in a long session |
| The files Claude edited most recently | Why an approach was rejected |

The lesson is simple, and it connects straight to [chapter 11](../11-claude-md-and-memory/notes.md): **if an instruction must last, put it in `CLAUDE.md`.** Things you only *say* can be summarised away. Things in the file get re-read.

### Clear or compact?

| Situation | Use |
|---|---|
| Starting a different task | `/clear` |
| Same task, but the session is long | `/compact`, with a note about what to keep |
| You've corrected Claude twice and it's still wrong | `/clear`, then a better prompt |
| You want to stop for the day | Just exit. `claude --continue` brings it back |

### A quick question that doesn't clutter

Sometimes you want to ask something small without it becoming part of the main conversation:

```
/btw what does the padEnd method do?
```

Claude answers in a side panel. The question and the answer are **not** added to the conversation's history. You can even ask while Claude is in the middle of working on something else.

### Finding your way back

Sessions are saved for each project folder.

| Command | What it does |
|---|---|
| `/rename my-name` | Gives this session a name you'll recognise |
| `/resume` | Shows your past sessions for this project |
| `claude --continue` | From the terminal, reopens the most recent one |
| `claude --resume` | From the terminal, shows the list |

Naming sessions is worth the two seconds. "search-feature" is much easier to find next week than a list of dates.

### One task, one session

If you remember one rule from this chapter, make it this one.

**A session should be about one thing.** When that thing is done, commit, clear, and start the next one fresh.

It feels wasteful to throw away a session that "knows" so much. It isn't. Almost everything Claude needs for the next task is in the code and in `CLAUDE.md`, and it will read those again in seconds. What you're throwing away is mostly clutter.

Later in the course you'll meet **subagents** (chapter 24). They're helpers that do a big search or investigation in their own separate context, and hand back only the result. They're another way to keep your main desk clear.

## Common mistakes

- **One marathon session for the whole day.** By the afternoon, Claude is working through the morning's leftovers.
- **"Read the entire codebase first."** It fills the desk with things that don't matter for this task. Let Claude search for what it needs.
- **Pasting a huge log.** If the error is in the last thirty lines, give the last thirty lines. Or let Claude search the log file.
- **Giving a rule once and expecting it to last all day.** A spoken rule can be lost in a compact. A rule in `CLAUDE.md` can't.
- **Clearing without naming.** If you might want that conversation again, `/rename` it first.
- **Never looking at `/context`.** You can't manage what you never look at.
- **Arguing in a cluttered session.** After two failed corrections, the clutter is the problem. Clear and restart.

## Quick recap

- Context is everything on Claude's desk. A crowded desk gives worse answers and costs more.
- `/context` shows what's using the space.
- Put the right things in: `@file`, pasted errors, `!command` output, and screenshots.
- `/clear` between unrelated tasks. `/compact` in the middle of a long one.
- Compaction keeps `CLAUDE.md` and can lose things you only said out loud. Lasting rules go in the file.
- `/btw` asks a side question without adding to the history.
- One task, one session.
