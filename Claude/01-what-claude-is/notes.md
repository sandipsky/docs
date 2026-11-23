# 01 What Claude Is

## What is it?

**Claude** is an AI made by a company called **Anthropic**. It is a **large language model**, or **LLM**: a program that has read an enormous amount of text and learned to read, write, and reason with words and code.

You don't use "Claude" in just one place. You reach the same brain through different doors: a **chat app**, a coding tool called **Claude Code**, and an **API** (a way for your own programs to talk to it). This chapter is a map of those doors, so you always know which one to walk through.

## Why does it matter?

Think about how most people first use AI for coding:

1. Ask the chat app for some code.
2. Copy the answer.
3. Paste it into your editor.
4. Run it. It breaks.
5. Copy the error.
6. Paste it back into the chat.
7. Repeat.

You are the hands. The AI thinks, and you carry things back and forth like a waiter between two kitchens. It works, but it's slow, and the AI never sees your real project. It only sees the bits you remembered to paste.

Claude Code removes the carrying. It sits inside your project, reads the real files, makes the edit, runs the code, reads the error itself, and tries again. That one change is the difference between **asking an AI** and **working with an AI**, and it's what this whole course is about.

But the chat app isn't the "worse" door. Each door fits different jobs. Picking the wrong one wastes time.

## Real-world example

Imagine you're learning to cook, and you know a great chef.

| How you get help | What it's like | Which door |
|---|---|---|
| You phone the chef and describe your soup | Good advice, but they can't taste it. You do all the cooking | The **chat app** |
| The chef comes to your kitchen | They open your fridge, taste the soup, fix it, and explain what they did | **Claude Code** |
| You open a restaurant and hire chefs to run it | They work to your recipes all day without you standing there | The **API** |

Same chef in all three. What changes is how close they are to your kitchen, and how much they do with their own hands.

## How it works

### One family of models

"Claude" is really a family of models of different sizes. A bigger model is smarter but slower and costs more. A smaller one is faster and cheaper.

At the time of writing (November 2026) there are four current models:

| Model | Think of it as |
|---|---|
| **Fable 5.2** | The specialist you call for the hardest problems |
| **Opus 5.5** | The senior engineer. This is what Claude Code uses by default |
| **Sonnet 5.5** | The solid all-rounder for everyday work |
| **Haiku 5.5** | The quick assistant for small, simple jobs |

New versions come out several times a year, so the names and numbers will change. The idea won't: you pick a size that fits the job. [Chapter 05](../05-models-effort-and-cost/notes.md) covers how to choose.

### Three doors to the same brain

| Door | What it is | Best for |
|---|---|---|
| **Chat app** | A website ([claude.ai](https://claude.ai)) and apps for your computer and phone. You type, it answers | Questions, learning, writing, thinking through an idea, quick one-off code |
| **Claude Code** | A tool that works inside your project folder. It can read files, edit them, and run commands | Real work on a real codebase |
| **API** | A way for programs to send text to Claude and get an answer back | Building your own apps and agents on top of Claude |

**API** stands for "application programming interface". Remember the waiter from your other courses: your program gives the waiter an order, and the waiter brings back what the kitchen made. Here, the kitchen is Claude.

You'll spend chapters 01 to 05 in the chat app, because it's the easiest place to learn how Claude thinks. From [chapter 06](../06-installing-claude-code/notes.md) on, you'll work in Claude Code. The API gets a first taste at the very end of the course.

### What "agentic" means

A plain chatbot does one thing: you send a message, it sends one back.

An **agent** is an AI that takes **steps on its own** to reach a goal. It decides what to look at, does something, checks the result, and decides what to do next. It keeps going until the job is done or it needs you.

An agent is made of three parts:

- **A model.** The brain. Here, that's Claude.
- **Tools.** Actions the model can ask for, like "read this file", "edit this file", or "run this command". A model without tools can only talk.
- **A loop.** The model picks a tool, sees what came back, and picks the next step. Over and over.

Here's what that looks like. Say you ask Claude Code to add a "remove a book" command to a small app. This is a simplified picture of what happens:

```
You:     Add a "remove" command that deletes a book by its id.

Claude:  (reads cli.js to see how commands work)
         (reads books.js to see how books are stored)
         (edits books.js: adds a removeBook function)
         (edits cli.js: adds the "remove" command)
         (runs the app: adds a book, removes it, lists the books)
         (sees the book is gone)

Claude:  Done. I added removeBook in books.js and wired it into cli.js.
         I tested it by adding a book and removing it. Here is the output...
```

You wrote one sentence. Claude took six steps, and it chose them itself. Nobody told it to read `cli.js` first. It worked out that it needed to.

That loop has a shape you'll see in every chapter:

```
Gather context  →  Take action  →  Check the work  →  repeat until done
```

"Agentic development" just means building software this way: you set the goal and review the result, and the agent does the steps in between.

### Where Claude Code runs

Claude Code is one engine with several windows. You can use it:

- in a **terminal**, by typing `claude`,
- inside **VS Code** or a **JetBrains** editor, as an extension,
- in the Claude **desktop app**,
- on the **web**, at claude.ai/code, where the work happens on Anthropic's computers instead of yours,
- and from the Claude **mobile app**, to start or check on work while you're away.

They all share the same brain and the same core features. This course teaches the terminal, because every other window is built on it. [Chapter 06](../06-installing-claude-code/notes.md) gets you set up.

### What Claude is not

Knowing the limits early saves you a lot of confusion.

- **It's not a search engine.** It doesn't look things up unless it has a search tool and uses it. By default it answers from what it learned in training.
- **It's not always right.** It can state a wrong thing in a calm, confident voice. [Chapter 02](../02-how-claude-works/notes.md) explains why.
- **It doesn't remember you.** Each new conversation starts fresh, unless you give it notes to read. [Chapter 11](../11-claude-md-and-memory/notes.md) covers those notes.
- **It doesn't know your project.** Not until it reads the files. It has never seen your code before today.
- **It's not an autopilot.** An agent that can edit files and run commands can also break things. You stay in charge.

### You are still the engineer

This is the most important idea in the course, so here it is on day one.

Claude can write code faster than any person. But it can't *want* anything. It doesn't know which feature matters, whether the design is right for your users, or what "good enough" means for this project. Those calls are yours.

A good way to picture the split:

| You | Claude |
|---|---|
| Decide what to build, and why | Works out how, and does the typing |
| Give the context it can't see | Reads the code it can see |
| Judge the result | Checks its own work when you give it a way to |
| Answer for what ships | Has no name on the commit that matters |

If you can't explain what a piece of code does, you're not done reviewing it. That rule will keep you safe through this whole course.

## Common mistakes

- **Talking to Claude like a search box.** Typing `javascript sort array` gets you a generic answer. Full sentences with your real situation get a useful one. [Chapter 03](../03-prompting-basics/notes.md) is all about this.
- **Using the chat app for project work.** If you're pasting your fourth file into a chat window, you're in the wrong door. Use Claude Code.
- **Using Claude Code for a quick general question.** "What's the difference between `let` and `const`?" doesn't need your codebase. The chat app is quicker.
- **Believing a confident answer.** Confidence is just Claude's writing style. It isn't proof.
- **Expecting it to remember yesterday.** A new session knows nothing about the last one unless you've written it down somewhere Claude reads.
- **Thinking "agent" means "hands off".** The agent does the steps. You still set the goal, read the result, and decide.

## Quick recap

- Claude is a family of AI models from Anthropic. Bigger models are smarter, smaller ones are faster and cheaper.
- There are three doors: the **chat app** for talking, **Claude Code** for working inside a project, and the **API** for building your own tools.
- An **agent** is a model plus tools plus a loop. It gathers context, acts, checks, and repeats.
- Claude Code runs in the terminal, in your editor, in the desktop app, on the web, and on your phone.
- Claude is fast and capable, but it can be wrong, it forgets between sessions, and it doesn't know your project until it reads it.
- You are still the engineer. Claude does the steps, and you own the result.
