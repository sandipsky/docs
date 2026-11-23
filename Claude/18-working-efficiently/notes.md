# 18 Working Efficiently

## What is it?

Working efficiently with Claude means getting the result you want while spending as little as you can of two things:

- **your time**, and
- **your allowance**: the usage your plan gives you, counted in tokens.

This chapter is a set of habits. None of them is clever. Together they make the difference between running out by lunchtime and comfortably finishing the day.

## Why does it matter?

Two people have the same plan and do the same kind of work. One hits the limit most afternoons. The other never does. The difference is almost never the amount of work. It's the habits.

Wasted tokens are usually wasted time too. A session that burns through your allowance is typically one where Claude read things it didn't need, tried the same fix three times, or worked in a context so cluttered it kept losing the thread. Fix the habit, and you save both at once.

There's a balance to keep, though. Your time is worth more than tokens. Spending five minutes to save a few cents is a bad trade. The aim is not to be stingy. It's to stop paying for things that don't help.

## Real-world example

Think about a taxi with the meter running.

| In the taxi | With Claude |
|---|---|
| The meter runs the whole time you're in the car | Every turn costs tokens |
| A clear address gets you there directly | A clear prompt gets the result first time |
| "Just drive around, I'll know it when I see it" | "Make it better" |
| Taking the long way with five bags in the boot | A long session carrying a huge context |
| A limousine to go two streets | The biggest model at maximum effort for a typo |
| Getting out and taking a fresh taxi when you're lost | `/clear`, and a better prompt |

You wouldn't refuse to take taxis. You'd just stop saying "drive around".

## How it works

*Checked against Claude Code 2.1.330 and Anthropic's help pages, in November 2026. Limits and prices change, so check `/usage` and [claude.com/pricing](https://claude.com/pricing) for today's numbers.*

### Know your budget

On a subscription, your allowance has two limits, as [chapter 05](../05-models-effort-and-cost/notes.md) explained:

- a **session limit** that resets every five hours,
- a **weekly limit** that resets once a week.

The chat app and Claude Code draw from the same allowance.

To see where you stand:

```
/usage
```

It shows how much of each limit you've used. It also breaks your usage down by what consumed it, and suggests ways to use less. Look at it once a day for a week, and you'll learn your own patterns quickly.

### Where tokens go

Here is the one idea that explains most of this chapter.

**Every time you send a message, Claude processes the whole conversation again**, not just your new line. Your message, plus every earlier message, every file it read, and every command output still in the context.

So the cost of a message depends on how much is already on the desk.

| What you send | In a fresh session | In a long, cluttered session |
|---|---|---|
| "Rename this variable" | Cheap | Expensive |

Same request. Very different cost. This is why context habits and cost habits turn out to be the same habits.

The other things that drive usage:

| Driver | Effect |
|---|---|
| **A long conversation** | Every new message carries all of it |
| **Big files and long output** | They stay in the context once they're read |
| **A bigger model** | Each token costs more |
| **Higher effort** | More thinking, and thinking is output |
| **Long answers** | Output costs about five times as much as input |
| **Retries** | A failed attempt still costs, and it stays in the context |

### Cheap habits

**1. Clear between tasks.** This is the big one. When you finish something, commit, then:

```
/rename search-feature
/clear
```

The next task starts light. Nothing else on this list saves as much.

**2. Be specific the first time.** A vague prompt leads to a wrong result, then a correction, then another. Three rounds cost about three times as much as one, and each round is heavier than the last. The four parts from [chapter 03](../03-prompting-basics/notes.md) are a cost-saving tool.

**3. Point at what matters.** "Look at `@src/format.js`" is cheaper than letting Claude search the whole project. Naming the function is cheaper than "find where prices are calculated".

**4. Plan before big changes.** A plan costs a little. Building the wrong thing and throwing it away costs a lot. Use plan mode from [chapter 13](../13-plan-mode/notes.md) whenever a task is large or unclear.

**5. Give Claude a check.** With a test to run, Claude finds its own mistakes in one pass. Without one, you find them later and start another round.

**6. Stop early.** The moment Claude heads the wrong way, press **Esc**. Every second you wait, it's producing output you'll throw away.

**7. Start over after two failed corrections.** If you've corrected the same thing twice, the conversation is now full of wrong attempts. `/clear`, and write one better prompt. It's cheaper than a third try, and it usually works.

**8. Match the dials to the job.** Use the default for everyday work. Drop the effort for simple edits. Raise it only for hard problems:

```
/effort low
```

```
/effort high
```

**9. Keep `CLAUDE.md` short.** It's loaded into every single session. A two-hundred-line file costs you those lines every time, forever.

**10. Compact on purpose.** If one task is running long, compact at a natural break and say what to keep:

```
/compact Keep the plan and the list of files already changed.
```

### Expensive habits

| Habit | Why it costs | Do this instead |
|---|---|---|
| One session all day | Each message carries the whole day | One task per session |
| "Read the whole codebase first" | Most of it is never needed | Let Claude search for what it needs |
| Pasting a full log | Thousands of lines for one error | Paste the relevant part |
| Arguing | Each round re-sends the whole argument | Rewind or clear, then re-prompt |
| Re-explaining the project every session | You pay for it every time, in typing and in tokens | Put it in `CLAUDE.md` once |
| Max effort and the biggest model, always | You pay top price for simple work | Use the defaults, and raise them when stuck |
| Asking for long explanations you don't read | Output is the costly part | Ask for the length you want |
| Leaving fast mode on | It's charged on top of your plan | Turn it on only when you mean to |

### Saving time, not only tokens

Your attention is the scarcer thing. A few habits for that.

**Write the long prompt once.** A careful first prompt takes two minutes. Three rounds of correction take ten. For anything longer than a few lines, press **Ctrl + G** to write it in an editor.

**Let it work while you do something else.** Once a plan is agreed and a check is in place, you don't have to watch every step. Use the time to review the previous change, or to think about the next task.

**Review at the right size.** While you're learning, approve every edit. Once you trust the direction of a task, you can switch to the mode that accepts edits and review everything at the end with `/diff`. That's faster, and it's safe as long as you really do read that final diff.

**Send slow commands to the background.** If Claude starts something long-running, such as a server, **Ctrl + B** moves it to the background so the conversation can carry on.

**Do two things at once.** You can run more than one Claude session at a time, each in its own copy of the project. That's the subject of chapter 27.

### When you hit a limit

Sooner or later you'll see a message saying you've reached your session limit or your weekly limit. You have three choices:

- **Wait.** A session limit resets within five hours.
- **Switch model.** Some limits apply to one model family only, and the message will say so. Moving to another model can let you continue.
- **Buy extra usage**, if you've switched that on. In Claude Code, `/usage-credits` manages it.

Then ask what got you there. Open `/usage` and look at the breakdown. Usually one or two habits account for most of it.

### Don't over-optimise

A warning in the other direction. Don't let this chapter make you timid.

- Don't starve Claude of context to save tokens. A wrong answer costs far more than the file you didn't let it read.
- Don't drop to the smallest model for a hard problem. Fixing bad output is the most expensive thing there is.
- Don't spend ten minutes shaving a prompt to save a cent.

The goal is to cut **waste**: tokens spent on things that didn't help. Tokens spent on getting it right are money well spent.

## Common mistakes

- **Never looking at `/usage`.** You can't improve what you don't measure.
- **One marathon session.** It's the single most expensive habit, and the one that hurts quality the most.
- **Correcting a third and fourth time.** After two, start fresh.
- **Thinking in messages.** One message into a huge context can cost more than twenty into a small one.
- **Maximum effort by default.** It's slower and costlier, and on easy tasks it isn't better.
- **Saving tokens by giving too little context.** That produces wrong work, which is the most expensive result of all.
- **Leaving fast mode on by accident.** It's billed outside your plan.

## Quick recap

- You have two budgets: your **time** and your **allowance**. Wasting one usually wastes the other.
- Every message is processed with the **whole conversation**, so a cluttered context makes everything cost more.
- The best single habit: **one task per session**, with `/clear` in between.
- Be specific, point at files, plan big changes, and give Claude a check.
- Press **Esc** early. After two failed corrections, start fresh.
- Use `/usage` to see where your allowance goes.
- Cut waste, but don't starve Claude of what it needs to get things right.
