# 05 Models, Effort and Cost

## What is it?

Every time you use Claude, three dials are set, whether you touched them or not:

- **Model:** which size of Claude answers.
- **Effort:** how hard it thinks before answering.
- **Speed:** normal, or a faster mode that costs more.

This chapter explains each dial, what it costs you, and how to pick without overthinking it.

## Why does it matter?

Set the dials too low, and you get a fast, cheap, wrong answer. Then you spend an hour fixing it.

Set them too high, and a one-line rename takes two minutes and eats a chunk of your plan's allowance.

Most of the time the defaults are fine. But knowing the dials lets you fix the two situations that annoy beginners most: "why is this so slow?" and "why did I hit my limit already?"

## Real-world example

Think about getting help with a job at home.

| Who you call | Good for | Like |
|---|---|---|
| A handy neighbour, free in five minutes | Hanging a picture | **Haiku** |
| A general builder | Most jobs around the house | **Sonnet** |
| A senior builder who has seen everything | A full kitchen refit | **Opus** |
| A structural engineer | "Can I knock down this wall?" | **Fable** |

You wouldn't call the structural engineer to hang a picture. You wouldn't ask the neighbour about the wall.

**Effort** is a second question: once someone arrives, how long do you let them think before they start? A minute is right for a picture. For the wall, you want them to take their time.

## How it works

*Checked against Anthropic's models and pricing pages and Claude Code 2.1.330, in November 2026. Model names and prices change a few times a year. The ideas don't. For today's numbers, see [claude.com/pricing](https://claude.com/pricing).*

### Dial 1: the model

| Model | Best at | Speed | API price per million tokens (in / out) |
|---|---|---|---|
| **Fable 5.2** | The hardest reasoning and very long tasks | Moderate | $8 / $40 |
| **Opus 5.5** | Long coding and knowledge work. The usual starting point | Moderate | $4 / $20 |
| **Sonnet 5.5** | Everyday work with a good balance of speed and brains | Fast | $2 / $10 |
| **Haiku 5.5** | Small, simple, high-volume jobs | Fastest | from $0.10 / $0.50 |

All four have a context window of about a million tokens.

Two things to notice in the price column:

- **"In" and "out" are priced separately.** "In" is everything Claude reads. "Out" is everything Claude writes, including its thinking.
- **Output costs five times more than input.** Reading is cheap. Writing is expensive.

**Claude Code uses Opus 5.5 by default** on every plan. That's a sensible default for coding, so you can leave it alone until you have a reason to change.

### What does that cost in practice?

The prices above are for the **API**, where you pay for exactly what you use. Here's a simplified example. Say Claude reads 200,000 tokens and writes 20,000 while fixing a bug.

On Opus 5.5:

```
Reading:  0.2 million × $4   =  $0.80
Writing:  0.02 million × $20 =  $0.40
Total:                          $1.20
```

The same work on Haiku 5.5 would cost pennies. On Fable 5.2 it would cost $2.40.

Real sessions are messier than this. But the shape is right: the model you pick can change the price by a factor of ten or more.

### Dial 2: effort

Current Claude models always think before they answer. **Effort** sets how much.

| Level | Use it for |
|---|---|
| **Low** | Simple edits, renames, formatting, quick questions |
| **Medium** | Everyday coding. This is the default in Claude Code |
| **High** | A stubborn bug, a design decision, tricky logic |
| **Extra high** | Hard problems where a wrong answer is costly. Claude Code spells it `xhigh` |
| **Max** | Rare. When being right matters far more than time or cost |

More effort means better answers on hard problems. It also means a longer wait and more tokens used. On an easy task, extra effort buys you nothing.

Where to set it:

- **In the chat app:** in the same menu as the model picker.
- **In Claude Code:** type `/effort` and choose a level, or `/effort high` to set it directly.

Claude Code also has one keyword. If you include the word `ultrathink` in a prompt, that single turn gets extra thinking, and then things go back to normal. It's handy for one hard question in the middle of an easy session.

A useful rule: **raise the effort before you reach for a bigger model.** Opus at high effort handles most hard problems, and it's cheaper than switching to Fable.

### Dial 3: speed

Some models have a **fast mode**. You get the same model and the same quality, up to about two and a half times faster.

The catch is the price. Fast mode costs about double, and on a subscription it is **not** covered by your plan. It's charged separately, as extra usage. In Claude Code you switch it with `/fast`.

For learning, leave it off. It's for people who are paid by the hour and happy to pay more to wait less.

### Switching models in Claude Code

Type `/model` to see a picker, or name one directly:

```
/model sonnet
/model opus
/model haiku
/model fable
```

There's also `/model opusplan`. It uses Opus when Claude is planning and Sonnet when it's carrying out the plan. That gives you the stronger model for the thinking and the cheaper one for the typing.

### Two ways to pay

**1. A subscription.** You pay a fixed monthly price and get an allowance.

| Plan | Price per month | Claude Code? |
|---|---|---|
| **Free** | $0 | No |
| **Pro** | $20 | Yes |
| **Max** | $100, with about 5 times Pro's usage | Yes |
| **Ultra** | $200, with about 10 times Pro's usage | Yes |
| **Team** | from $25 per person | Yes |
| **Enterprise** | per person, plus usage | Yes |

Prices are in US dollars before tax. Claude Code isn't part of the Free plan, so you'll need at least Pro from [chapter 06](../06-installing-claude-code/notes.md) on.

**2. Pay as you go.** You add credit to a developer account, called the **Claude Console**, and pay the API prices from the table above for exactly what you use. There's no monthly fee and no allowance.

For learning, a subscription is simpler. You know what you'll spend.

### How subscription limits work

A subscription doesn't give you a number of messages. It gives you an **allowance of usage**, measured two ways:

- a **session limit** that resets every five hours,
- a **weekly limit** that resets once a week.

Three things to know:

- **The chat app and Claude Code share the same allowance.** A long morning in Claude Code leaves less for chat.
- **Heavier dials use it faster.** A bigger model, higher effort, longer conversations, and bigger files all drain it quicker.
- **You can see where you stand.** In the app, look in Settings under Usage. In Claude Code, type `/usage`.

If you hit a limit, you wait for the reset, or you buy extra usage if you've switched that on. [Chapter 18](../18-working-efficiently/notes.md) is about making the allowance last.

### A simple way to choose

You don't need to decide for every prompt. Start here and adjust only when something feels off.

| Situation | Model | Effort |
|---|---|---|
| Everyday coding in Claude Code | Opus (the default) | Medium (the default) |
| It's too slow for simple edits | Sonnet, or lower the effort | Low |
| Lots of small repeated jobs | Haiku | Low |
| Claude keeps getting a hard problem wrong | Same model | Raise to High first |
| Still wrong at high effort | Fable | High |

Notice what's *not* in that table: a better prompt. If the problem is that Claude is missing context, no model is big enough to guess it. Check your prompt before you turn any dial.

## Common mistakes

- **Maximum everything, all the time.** Max effort on the biggest model for a typo fix wastes time and allowance. It doesn't produce a better typo fix.
- **The smallest model for the hardest job.** Saving a few cents and then losing an afternoon to wrong answers is a bad trade.
- **Using a bigger model to fix a bad prompt.** A vague prompt gets a vague answer from every model.
- **Switching on fast mode and forgetting.** It's billed separately from your plan. Check before you leave it on.
- **Thinking in messages.** Limits are about tokens. One huge message can cost more than fifty small ones.
- **Trusting old numbers, including these.** Check the pricing page before you make a real decision.

## Quick recap

- Three dials: **model** (which size), **effort** (how hard it thinks), and **speed** (fast mode).
- Bigger models are smarter, slower, and cost more. Claude Code defaults to Opus, which suits most coding.
- Effort runs from low to max. Medium is the default. Raise it for hard problems, and before you switch to a bigger model.
- Output tokens cost about five times more than input tokens.
- Subscriptions give an allowance with a five-hour limit and a weekly limit, shared between chat and Claude Code.
- When results are poor, check the prompt first, then the effort, then the model.
