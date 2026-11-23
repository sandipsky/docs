# 04 Claude in the Chat App

## What is it?

The **chat app** is the door most people meet first. You type a message, and Claude answers. It runs in three places:

- on the **web**, at [claude.ai](https://claude.ai),
- as a **desktop app** for macOS and Windows (Linux is in beta), from [claude.com/download](https://claude.com/download),
- as a **mobile app** for iPhone and Android.

It's more than a text box. It can read your files, search the web, remember things about you, keep a workspace for each subject, and build documents and small tools you can share.

## Why does it matter?

Claude Code is the star of this course. So why spend a chapter on chat?

Because a lot of an engineer's work isn't typing code into a project:

- understanding a new idea,
- deciding between two approaches,
- planning a feature before anyone builds it,
- writing a message to a teammate,
- turning a rough idea into a clear brief.

The chat app is the right door for all of that. It's also the quickest place to practise prompting, because nothing can break.

And knowing its features stops you from doing things the slow way. People paste the same background into every new chat for months before they discover projects.

## Real-world example

Think of the chat app as a study desk with a tutor sitting at it.

| On the desk | In the app |
|---|---|
| Handing the tutor a page from your textbook | **File uploads** |
| A binder for one subject: your notes, plus the rules for that subject | **Projects** |
| The tutor popping to the library to check a fact | **Web search** |
| A finished poster you can hang up and show people | **Artifacts** |
| Giving the tutor a key to your filing cabinet | **Connectors** |
| The tutor remembering you from last week | **Memory** |

## How it works

*Checked against the Claude apps in November 2026. One warning first: the app's menus are being reorganised right now. Anthropic is merging its chat and "Cowork" modes, and moving skills and connectors onto a single Plugins page. Your screen may use slightly different names from the ones below. Look for the idea, not the exact button.*

### The basics

- **New chat** starts a fresh conversation with an empty context. Use one per topic.
- The **model picker** sits next to the send button. It shows which model will answer. [Chapter 05](../05-models-effort-and-cost/notes.md) explains the choices.
- The **+** button opens the extras: attach a file, turn on a tool, and so on.

### File uploads

You can give Claude files to read instead of pasting text.

- **Documents:** PDF, Word, plain text, CSV, HTML, JSON, Excel, and a few more.
- **Images:** JPEG, PNG, GIF, and WebP. A screenshot of an error or a design counts.
- You can attach up to 20 files to one chat.

This is the idea from [chapter 02](../02-how-claude-works/notes.md) in action: put the real thing in the context. "Here is the error" with a screenshot beats describing the error from memory.

### Projects

A **project** is a workspace for one subject. It holds three things:

- **Project instructions:** rules Claude follows in every chat inside the project.
- **Project knowledge:** files Claude can refer to in every chat inside the project.
- **Its own chat history and memory**, separate from the rest of your account.

Say you're studying JavaScript. You could make a project with these instructions:

```
I'm a beginner learning JavaScript. Explain new terms in one plain sentence.
When I share an exercise, give hints, not full solutions.
```

Then add your course notes as knowledge. Now every chat in that project starts with a tutor who already knows the rules and has read your notes. You never paste them again.

Projects are on every plan. Free accounts can have up to five.

Keep this in mind for later: project instructions are the chat app's version of the `CLAUDE.md` file you'll meet in [chapter 11](../11-claude-md-and-memory/notes.md). It's the same idea, a note Claude reads at the start of every session.

### Web search and Research

By default, Claude answers from its training, which stops at a cutoff date. **Web search** lets it look things up on the live internet.

Answers that used search come with **citations**: links to the pages Claude read. Click them. A citation only proves where Claude looked. You still judge whether the page is trustworthy.

**Research** is the heavier version. Claude runs many searches, reads many pages, and writes a report with sources. It takes a few minutes. Web search is on every plan. Research needs a paid plan.

Use search for anything recent or exact: the latest version of a library, today's price of something, what changed in a new release.

### Artifacts

An **artifact** is something Claude builds that is worth keeping: a document, a set of slides, a diagram, a dashboard, or a small interactive tool. It opens in its own panel beside the chat, and you keep improving it by talking.

For example:

```
Make a one-page cheat sheet of JavaScript array methods,
with a tiny example for each one.
```

Then: "Add `reduce`." "Make the examples about a shopping cart." The artifact updates each time.

Artifacts start **private to you**. You can share one with specific people, or with anyone who has the link. If Claude can't create one, check that file creation is switched on in your settings, under Capabilities.

### Connectors

A **connector** links Claude to another app, so it can read your data there and take actions. There are connectors for things like Google Drive, Gmail, Slack, and Linear.

With Google Drive connected, you could ask:

```
Find my notes from last week's planning meeting and list the action items.
```

Connectors are built on **MCP**, the Model Context Protocol. That's the same standard Claude Code uses to plug into other tools, and chapter 23 explains it properly.

Two cautions:

- **Connect only what you need.** Every connector is a door into your data.
- **Be careful with custom connectors.** You can add one by pasting a web address, but Anthropic hasn't checked those. Only add ones from people you trust.

### Memory

On personal plans, the app can **remember** things from your chats and bring them into new ones. That's why it might already know you're learning Django when you open a fresh chat.

This seems to break the rule from chapter 02 that each session starts empty. It doesn't. The app saves a short summary about you and quietly puts it into the context of each new chat. The model itself still starts fresh. The app just lays some notes on the desk first.

You control it in **Settings**:

- See what Claude remembers, and edit or delete it.
- Pause memory, or switch it off.
- Use an **incognito chat** (the ghost icon) for a conversation that shouldn't be saved or remembered.

### Instructions for Claude

In Settings you can write **instructions that apply to every chat** on your account. Good ones are short and about how you like to work:

```
I'm a developer in Nepal learning web development.
Use plain English and short sentences. Show code examples in TypeScript.
```

Project instructions are for one subject. These are for you, everywhere.

### Skills

A **skill** is a packaged how-to that Claude loads only when a task needs it. The app comes with skills for making Word, Excel, PowerPoint, and PDF files. Skills are a big topic in Claude Code, and chapter 21 covers them.

### Your privacy setting

Before you use the app for real work, look at one setting on purpose.

On personal plans (Free, Pro, Max, and Ultra), **you choose** whether your chats can be used to improve Anthropic's models. The switch is under **Settings, then Privacy**, and it's called something like "Help improve our AI models". Go and look at it, and set it the way you want. Don't leave it to whatever it happens to be.

Company plans (Team and Enterprise) and the API are different: by default, Anthropic doesn't train on that content.

Whatever you choose, keep this habit: **never paste passwords, API keys, or other people's private data into a chat.** [Chapter 08](../08-permissions-and-safety/notes.md) comes back to this.

### Chat or Claude Code?

| Use the chat app when... | Use Claude Code when... |
|---|---|
| You're learning or asking "what is...?" | The work is inside a project folder |
| You're planning, comparing options, or writing a brief | Several files need to change |
| You need a document, a diagram, or a quick tool to share | Something needs to be run and tested |
| You want an answer with web sources | You'd otherwise be copying code back and forth |

A common rhythm among engineers: think and plan in chat, then build in Claude Code.

The app also has a **Code** tab. That's Claude Code running on Anthropic's computers instead of yours. It's handy, but learn the terminal version first. Everything else builds on it.

## Common mistakes

- **One endless chat for everything.** Topics pile up, the context gets cluttered, and answers get worse. Start a new chat for a new topic.
- **Pasting the same background every time.** If you've explained your situation three times, it belongs in a project or in your account instructions.
- **Pasting secrets.** Passwords and keys don't belong in any chat.
- **Trusting an answer about something recent with no search.** Without web search, Claude is working from old training. Turn search on, then check the citations.
- **Reading the citation count as proof.** Five links means Claude read five pages. It doesn't mean the pages were right.
- **Connecting every app you own.** Add connectors when you have a real use for them.
- **Building a multi-file app by copy and paste.** That's the wrong door. Use Claude Code.

## Quick recap

- The chat app runs on the web, the desktop, and your phone. It's the right door for learning, planning, and writing.
- **Uploads** put the real thing in front of Claude. **Projects** save you from repeating yourself.
- **Web search** gets current facts, with citations you should check.
- **Artifacts** are things Claude builds that you can keep improving and share.
- **Connectors** link Claude to your other apps. Add them sparingly.
- **Memory** and **account instructions** carry things between chats. You control both in Settings.
- Check your privacy setting on purpose, and keep secrets out of every chat.
