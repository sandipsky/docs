# 19 When Claude Goes Wrong

## What is it?

Claude makes mistakes. They aren't random. They fall into a small number of **patterns**, and each pattern has a cause and a fix.

This chapter is a field guide to those patterns: how to spot each one, how to steer out of it, and how to stop it happening again.

## Why does it matter?

There are two ways to fail with an AI coding tool.

The first is to **trust it too much**. You stop reading the diffs, and one day you ship something broken that you never looked at.

The second is to **trust it too little**. Claude gets one thing wrong, you decide "AI can't do this", and you go back to typing everything by hand.

Both come from the same gap: not understanding *how* it goes wrong. Once you can name the pattern in front of you, a mistake stops being a surprise and becomes a routine. "Ah, it's over-building again. I'll tighten the scope."

That's what makes someone calm and effective with these tools. It isn't that their Claude never fails. It's that they recognise each failure in seconds and know the move.

## Real-world example

Think of a driving instructor in a car with dual controls.

| The instructor | You, with Claude |
|---|---|
| Lets the learner drive | Lets Claude do the work |
| Knows the usual mistakes: drifting, braking late, missing a sign | Knows the patterns in this chapter |
| Spots the drift early, from small signs | Reads the plan and the diffs |
| Gives a short, specific correction | "Only change `cli.js`" |
| Has a brake pedal, and uses it without drama | Esc, and rewind |
| Afterwards, practises the weak spot | Adds a line to `CLAUDE.md`, or a test |

A good instructor isn't nervous and isn't asleep. They're watching for a few specific things.

## How it works

*Checked against Claude Code 2.1.330 and Anthropic's best-practices guide, in November 2026.*

### The four root causes

Before the patterns, here's the idea that ties them together. Almost every failure comes from one of four causes.

| Root cause | Sounds like | The fix |
|---|---|---|
| **Missing information** | "It built the wrong thing." | Tell Claude what it couldn't see |
| **No way to check** | "It said done, and it wasn't." | Give it a test or a command to run |
| **A prompt can't guarantee it** | "It did the one thing I said never to do." | Use a rule that enforces, not a request |
| **Too much clutter** | "It keeps making the same mistake." | Clear the context and start again |

When something goes wrong, don't only fix the result. Ask which of the four it was. Then you can fix the **cause**, and it won't happen next time. It's the same thinking as [chapter 16](../16-debugging-with-claude/notes.md), applied to your way of working instead of your code.

### Pattern 1: Over-building

**What you see.** You asked for a small thing and got a big one. A request for an export command comes back with three file formats, a settings file, and a progress bar.

**Why it happens.** Claude wants to be helpful, and "complete" looks helpful. With no limits given, it fills the space.

**Steer.** Say no to the diff, and name the scope: "Only CSV. No options. One function."

**Prevent.**

- Put limits in the prompt: "the smallest version that works".
- Read the plan first. Over-building shows up there, before any code exists.
- Add a line to `CLAUDE.md`: "Build only what's asked. Suggest extras, don't add them."

### Pattern 2: Made-up functions

**What you see.** Code that calls a function, an option, or a package that doesn't exist. It looks completely plausible.

**Why it happens.** This is the hallucination from [chapter 02](../02-how-claude-works/notes.md). Claude is predicting what *should* exist. It's most likely with small libraries, recent versions, and exact option names.

**Steer.** Run the code. A made-up function fails at once.

**Prevent.**

- Give Claude a check to run. It will catch most of these itself.
- For a library, put the real documentation in the context instead of relying on memory. Chapter 35 shows a good way.
- Be suspicious of any package name you've never heard of. Look it up before you install it.

### Pattern 3: Drifting off task

**What you see.** You asked for one fix. The diff also renames some variables, reformats a file, and "tidies up" a function nobody mentioned.

**Why it happens.** While reading the code, Claude noticed things it could improve, and improved them.

**Steer.** "Undo everything except the fix I asked for."

**Prevent.**

- Say it in the prompt: "Change only what's needed for this."
- Compare each diff with the plan, as you practised in [chapter 10](../10-the-agentic-loop/notes.md).
- If the tidy-up is a good idea, make it a separate task with its own commit. A bug fix mixed with a reformat is very hard to review.

### Pattern 4: "It works", with no proof

**What you see.** Claude announces success. You try it, and it doesn't work. Or it works for the one case Claude thought about.

**Why it happens.** Nothing was run. Claude reasoned that the code *should* work, and reported that as a result.

**Steer.** "Run it and show me the output."

**Prevent.**

- Have a check, and put it in `CLAUDE.md`: "Run `npm test` before you say you're done."
- Make evidence a habit. Ask for the output every time, as in [chapter 14](../14-letting-claude-check-its-own-work/notes.md).

### Pattern 5: Going round in circles

**What you see.** A fix fails. Claude tries something else. That fails too. The third attempt looks a lot like the first.

**Why it happens.** The conversation is now full of failed attempts, and they pull Claude back toward the same ideas. There may also be a wrong assumption, made early, that nobody has questioned.

**Steer.** Stop. Don't try a fourth time in the same session.

**Prevent.**

- After two failed corrections, `/clear`. Write a fresh prompt that includes what you've learned and what's been ruled out.
- Ask: "What are you assuming that might be wrong?"
- For a really hard problem, raise the effort.

### Pattern 6: Solving the wrong problem

**What you see.** Good, working code that does something other than what you wanted. You asked for the dashboard to be faster, and got a new layout.

**Why it happens.** Your prompt had more than one meaning, and Claude picked a different one from you. Nothing was "wrong" with Claude here.

**Steer.** Rewind, and ask again with a clearer prompt. Don't try to correct your way from the wrong solution to the right one.

**Prevent.**

- Say what "done" looks like.
- Have Claude ask questions first: "Before you start, ask me about anything unclear."
- Use plan mode. A misunderstanding is obvious in a plan and expensive in code.

### Pattern 7: Bending the test

**What you see.** A failing test now passes, but the diff changed the test, skipped it, or added a special case just for it.

**Why it happens.** You said "make the tests pass". That's what happened.

**Steer.** "Put the test back. Fix the code."

**Prevent.**

- Say which side is the truth: "The test is correct. Fix the code. Don't change the tests."
- Read test diffs as carefully as code diffs.

### Pattern 8: Forgetting a rule

**What you see.** You gave an instruction at the start. An hour later, Claude isn't following it.

**Why it happens.** The instruction lived only in the conversation. It got buried under new material, or summarised away in a compact.

**Steer.** Repeat it once.

**Prevent.**

- If you've said it twice, it belongs in `CLAUDE.md`.
- If it's in `CLAUDE.md` and still ignored, the file may be too long. Trim it.
- If it must **never** be broken, a note isn't enough. Use a deny rule from [chapter 08](../08-permissions-and-safety/notes.md) or a hook from chapter 25.

Writing the rule in capital letters, or adding "IMPORTANT", doesn't reliably help. A shorter file does.

### Pattern 9: Agreeing with you when you're wrong

**What you see.** You suggest a cause, and Claude says "You're right!" and builds on it. Later you find you were wrong.

**Why it happens.** Claude is built to be cooperative, and a confident statement from you carries weight.

**Steer.** Ask for the other side: "What's the strongest argument against that?"

**Prevent.**

- Ask open questions, not leading ones. "What's causing this?" is better than "It's the cache, isn't it?"
- Invite disagreement directly: "Tell me if you think I'm wrong."

### The whole field guide on one page

| You see | Root cause | First move |
|---|---|---|
| Far more than you asked for | Missing information (no limits) | State the scope |
| A function that doesn't exist | No way to check | Run it |
| Extra changes in the diff | Missing information (no limits) | "Only what's needed" |
| "Done", but it isn't | No way to check | "Show me the output" |
| The same fix again and again | Clutter | `/clear` and re-prompt |
| The wrong problem, solved well | Missing information (no finish line) | Rewind and re-prompt |
| A test changed so it passes | Missing information (what's the truth?) | "Fix the code, not the test" |
| A rule from earlier, forgotten | Clutter, or a prompt can't guarantee it | Move it to `CLAUDE.md`, or enforce it |
| It agreed, and you were wrong | Missing information (a leading question) | Ask for the case against |

### Your steering toolkit

From the lightest touch to the heaviest:

| Tool | Use it when |
|---|---|
| **Esc** | It's heading the wrong way right now |
| **A short, specific correction** | The direction is right and a detail is wrong |
| **Say no to the diff** | The edit isn't what you agreed to |
| **Rewind** | The last step was a mistake |
| `/clear` **and a better prompt** | Two corrections have failed |
| **A smaller step** | The task was too big to get right in one go |
| **A change to your setup** | The same thing keeps going wrong |

Use the lightest tool that works. And notice the last row. If the same mistake keeps coming back, the fix isn't a better correction. It's a line in `CLAUDE.md`, a new test, or a rule.

### Fix the system, not just the mistake

When something goes wrong, ask two questions.

1. **How do I fix this one?** That's steering.
2. **How do I make sure it doesn't happen again?** That's improving your setup.

Most people stop at the first. The second is what compounds.

| It went wrong like this | So change this |
|---|---|
| Claude used the wrong code style | Add the style to `CLAUDE.md` |
| A bug slipped past | Add a test for it |
| Claude ran something risky | Add an ask rule or a deny rule |
| You built the wrong thing | Change your own habit: plan first |

Every mistake is a chance to make your project a little harder to get wrong. After a few weeks of this, Claude works noticeably better in your project than in a new one. The model didn't change. You taught the project how to guide it.

### Sometimes it isn't Claude

Be honest about this part.

- **The prompt was unclear.** You knew what you meant. Could a new colleague have known?
- **The codebase is inconsistent.** If your project does the same thing three different ways, Claude will copy whichever one it reads first.
- **The task was too big.** Nobody, human or AI, gets a week of work right in a single step.

When a result disappoints you, check your side first. It's the side you can change fastest.

## Common mistakes

- **Giving up after one failure.** A wrong answer is information. Name the pattern and make the move.
- **Not reading diffs.** Most of these patterns are plain to see in a diff, and invisible if you don't look.
- **Correcting endlessly in one session.** After two tries, clear and start again.
- **Shouting.** Capital letters and "IMPORTANT" don't fix a missing limit or a cluttered context.
- **Fixing the result and never the cause.** Then you'll meet the same mistake next week.
- **Blaming the model for an unclear prompt.** Check your own side first.
- **Trusting it more because the last ten changes were fine.** The eleventh still needs a read.

## Quick recap

- Claude's mistakes follow patterns. Learn to name them.
- Nearly all come from four causes: **missing information**, **no way to check**, **something a prompt can't guarantee**, and **clutter**.
- Common patterns: over-building, made-up functions, drifting, "done" with no proof, circles, the wrong problem, bent tests, forgotten rules, and agreeing when you're wrong.
- Steer with the lightest tool that works: Esc, a short correction, a no, a rewind, or a fresh start.
- After you fix a mistake, fix the **system**: a line in `CLAUDE.md`, a test, or a rule.
- Check your own prompt before you blame the model.
