# 02 How Claude Works

## What is it?

Under the hood, Claude does one thing: it reads text and predicts what text should come next. It does that one small piece at a time. Those pieces are called **tokens**.

Everything Claude can "see" during a conversation sits in a space called the **context window**. Think of it as Claude's short-term memory.

You don't need the maths. You need three ideas: tokens, the context window, and why a prediction machine sometimes gets things wrong.

## Why does it matter?

Two things surprise almost every beginner:

- **"It forgot what I told it."** You explained your project yesterday. Today Claude acts like you've never met.
- **"It made something up."** Claude told you, calmly and confidently, to use a function that doesn't exist.

Neither is a bug, and neither is Claude being lazy. Both follow directly from how it works. Once you understand the machine, you stop being surprised, and you start setting things up so these problems rarely bite.

It also matters for your wallet. Limits and prices are counted in tokens, so it helps to know what one is.

## Real-world example

Imagine a brilliant new colleague with an unusual way of working.

| The colleague | Claude |
|---|---|
| Has read a huge library, but stopped reading on a certain date | **Training.** Claude learned from a vast amount of text, up to a cutoff date |
| Works at a desk. Only what's on the desk exists for them right now | **The context window.** Claude only knows what's in the conversation |
| The desk is big, but it does fill up | The context window has a size limit |
| Every morning the desk is cleared | A new session starts empty |
| Has never visited your office before | Claude has never seen your project until it reads the files |
| When unsure, makes a confident guess instead of saying "I don't know" | **Hallucination** |

Keep this colleague in mind. Most of this course is about managing that desk well.

## How it works

### Tokens: the pieces Claude reads

Claude doesn't read letter by letter or word by word. It reads **tokens**: small chunks of text. A token can be a whole word, part of a word, a punctuation mark, or a single character.

A rough picture of how a sentence might be split:

```
"Unbelievable results!"   →   Un | believ | able |  results | !
```

Some handy numbers for the current models (November 2026):

- One token is a bit more than half an English word, on average.
- 1,000 words is very roughly 1,800 tokens.
- A million tokens is roughly 555,000 words.

These are averages. Code, numbers, and other languages often take more tokens than plain English. And the exact split changes between model versions, so treat these as a feel for size, not as exact sums.

Why care? Because **everything is counted in tokens**: how much fits in the context window, how fast you use up your plan's limits, and what the API costs.

### Prediction: one token at a time

When you send a message, Claude works out which token is most likely to come next, writes it, then does the same again with that new token included. It repeats this until the answer is finished.

That sounds too simple to be useful. But to predict the next piece of a correct program, you have to "understand" the program. To predict the end of a good explanation, you need a good explanation. Trained on enough text, a prediction machine becomes very capable.

Two things follow from this:

- **Answers can differ each time.** There's a little randomness in which token gets picked. Ask the same question twice and you may get two different answers. Both can be good.
- **It writes fluently even when it's wrong.** A wrong answer flows just as smoothly as a right one. We'll come back to this.

### Two kinds of knowing

This table is worth learning by heart.

| | Learned in **training** | Sitting in the **context** |
|---|---|---|
| What it is | Everything Claude absorbed before it was released | Everything in this conversation right now |
| Examples | How JavaScript works, what React is, how to write a loop | Your message, the files Claude has read, the output of a command |
| Can it change? | No. It's frozen | Yes. It grows as you talk |
| How reliable? | Good for common things, shaky for rare or recent ones | Very good. Claude is reading the real thing |

Claude's training has a **knowledge cutoff**: a date after which it knows little or nothing. For the current models that's around June 2026. A library released last month isn't in there. Neither is the new version of a tool you use.

Here's the practical lesson. **When Claude needs to be right about something, get the real thing into the context.** Don't ask it to remember how your function works. Let it read the file. Don't ask it to recall the latest syntax of a library. Give it the docs page.

### The context window

The **context window** is everything Claude can see at once. In Claude Code, that includes:

- instructions that came with Claude Code itself,
- your project's notes file (`CLAUDE.md`, coming in [chapter 11](../11-claude-md-and-memory/notes.md)),
- every message you've typed,
- every answer Claude has given,
- every file it has read,
- the output of every command it has run.

The current models have a window of about **one million tokens**. That's several long novels. It sounds endless, but a long working session reads a lot of files and a lot of command output, and it adds up.

Two things happen as the window fills:

1. **Quality drops before space runs out.** More stuff on the desk means more noise. An instruction you gave an hour ago is now buried under fifty files. Claude is more likely to lose track of it.
2. **When it's nearly full, Claude Code tidies up.** It replaces the older part of the conversation with a summary. This is called **compaction**. Summaries lose detail.

So the size of the window isn't the thing to manage. *What's in it* is. [Chapter 12](../12-managing-context/notes.md) is all about that.

### No memory between sessions

Each new conversation starts with an empty desk.

If you tell Claude on Monday that your project uses tabs, and open a new session on Tuesday, that fact is gone. Claude isn't being forgetful. Monday's desk was cleared.

The fix is to write lasting facts down somewhere Claude reads at the start of every session. In Claude Code that's the `CLAUDE.md` file. In the chat app there are projects and a memory feature, which [chapter 04](../04-claude-in-the-chat-app/notes.md) covers.

### Why it makes things up

When Claude doesn't know something, the prediction machine doesn't stop. It produces the most *plausible-looking* text. Sometimes that text is false. This is called a **hallucination**.

Here's the kind of thing that happens:

```
You:     How do I shuffle an array in JavaScript?
Claude:  Use the built-in method: myArray.shuffle()
```

JavaScript arrays have no `shuffle` method. But it *looks* right. Arrays have `sort`, `reverse`, and `filter`, so `shuffle` fits the pattern perfectly. That's exactly why a prediction machine might produce it.

Current models do this much less than older ones, and they're better at saying "I'm not sure". But it still happens. It's most likely with:

- **small or niche libraries** that didn't appear much in training,
- **exact details**: version numbers, option names, dates, quotes, web addresses,
- **anything recent**, after the knowledge cutoff,
- **your own code**, when Claude is guessing instead of reading it.

You can't make hallucination disappear. You can make it harmless:

| Defence | How |
|---|---|
| Let it read the real thing | Point it at the file or the docs instead of asking from memory |
| Run the code | A made-up function fails the moment you run it. In Claude Code, Claude runs it and sees the failure itself |
| Ask for sources | "Where in the docs is that?" |
| Ask what it's unsure about | "Which parts of that answer are you least sure of?" |

The second row is the big one. An agent that runs its own code catches most of its own inventions. That's a large part of why Claude Code is more reliable than copying code out of a chat.

### Thinking before answering

Claude can reason privately before it writes its answer, a bit like working on scratch paper. This is usually called **thinking**.

More thinking helps on hard problems: a tricky bug, a design decision, a long piece of logic. It also takes more time and more tokens. You can turn the amount up and down with a setting called **effort**, which [chapter 05](../05-models-effort-and-cost/notes.md) covers.

## Common mistakes

- **"It said it, so it's true."** Fluent isn't the same as correct. Check anything that matters, especially exact names and numbers.
- **Expecting it to remember.** If a fact should last beyond today, write it where Claude will read it next time.
- **Asking from memory when the real thing is right there.** "How does my login function work?" is a guess. "Read `login.js` and explain it" is a fact.
- **Trusting it on last month's release.** Anything after the knowledge cutoff needs the docs in the context.
- **Stuffing the window "just in case".** More isn't better. Ten files Claude doesn't need make it worse at using the one it does.
- **Arguing with a cluttered session.** If Claude keeps losing the thread in a very long conversation, the desk is the problem. Start a fresh one.

## Quick recap

- Claude reads and writes **tokens**: chunks of text a bit smaller than a word. Limits and prices are counted in them.
- It works by predicting the next token, so its answers are fluent even when they're wrong.
- It knows things two ways: from **training** (frozen, with a cutoff date) and from the **context** (what's in the conversation now). The context is far more reliable.
- The **context window** is Claude's short-term memory. It's big, but it fills up, and a cluttered window gives worse answers.
- A new session starts empty. Lasting facts need to be written down.
- **Hallucination** is a confident guess. Beat it by letting Claude read the real thing and run the code.
