# 20 Project: From Issue to Pull Request

## What you'll build

You're joining a small project that already exists: the loan rules for a community library. Two **issues** are waiting. An issue is a written request for work, such as a bug report or a feature idea.

- **Issue 1** is a bug report. A member was charged a late fee she shouldn't have paid.
- **Issue 2** is a feature request. The librarians want members to be able to renew a loan.

You'll take each one the whole way, the way a professional would:

```
Issue  →  branch  →  explore  →  plan  →  test first  →  code  →  check  →  commit  →  pull request  →  review  →  merge
```

This is the everyday rhythm of a working developer. It's also the first time in this course that you'll use everything from Level 2 together.

**What you'll practise:**

| Skill | Chapter |
|---|---|
| Explore, plan, code, check | [10](../10-the-agentic-loop/notes.md) |
| A `CLAUDE.md` for a project you didn't write | [11](../11-claude-md-and-memory/notes.md) |
| One task per session | [12](../12-managing-context/notes.md) |
| Plan mode | [13](../13-plan-mode/notes.md) |
| Tests first, and asking for evidence | [14](../14-letting-claude-check-its-own-work/notes.md) |
| Branches, commits, and pull requests | [15](../15-git-with-claude/notes.md) |
| Finding the cause, not the symptom | [16](../16-debugging-with-claude/notes.md) |
| Spotting when Claude goes wrong | [19](../19-when-claude-goes-wrong/notes.md) |

Seven milestones. Take your time. A careful run through this project teaches more than three rushed ones.

## Getting started

*Checked against Claude Code 2.1.330 and Node.js 24, in November 2026.*

**1. Copy the starter.** Copy this chapter's `starter` folder to `claude-practice/library-loans`, as you did for the other projects.

**2. Put it under Git and run the tests.**

```
cd ~/claude-practice/library-loans
git init
git add .
git commit -m "Start the library-loans project"
npm test
```

You should see nine passing tests. You need Node.js 20 or newer.

**3. Read the project yourself.** Before you start Claude, read `README.md` and both files in the `issues` folder. It takes five minutes. You're the engineer here, and you can't judge Claude's work on a problem you haven't read.

**4. Decide how you'll do pull requests.** Pick one:

| Option | What you need |
|---|---|
| **A real pull request** | A private GitHub repository for this project. Push your main branch to it now |
| **A written one** | Nothing. You'll save each description in a `pull-requests` folder and merge on your own machine |

The first is closer to real work. The second teaches the same thinking. Either is fine.

## The rules for this project

1. **One issue, one branch, one session.** Clear the session between the two issues.
2. **No code before the cause is known.** For the bug, you and Claude both understand why it happens before anything changes.
3. **Tests come first.** Every fix and every rule starts as a failing test.
4. **Evidence, not claims.** "The tests pass" comes with the output.
5. **You read every diff.** Including the tests.

## Milestone 1: Get to know the project

Start Claude Code in the `library-loans` folder.

Begin by exploring. You're new here, and so is Claude.

```
Read the README and the code in src and test. Don't change anything.
Give me a short summary: what each file does, and the patterns the code
follows that a newcomer should copy.
```

Read the answer against the code. Then set the project up for the work ahead.

- Run `/init`, and **trim** what it writes, as in [chapter 11](../11-claude-md-and-memory/notes.md).
- Add what only you can decide. For example: the test command, a rule to run the tests after every change, your code style, and "don't change a test to make it pass without asking".
- Add an allow rule for `npm test`, and an ask rule for `git push`.

Commit this on its own:

```
Commit the CLAUDE.md and settings with a clear message.
```

**Check:** your `CLAUDE.md` is short, and every line is something Claude couldn't have worked out from the code.

## Milestone 2: Issue 1, find the cause

Make a branch for the bug:

```
! git switch -c fix-late-fee-due-date
```

Now investigate. Write your own prompt. It should tell Claude to read the issue and the code, to **reproduce** the problem, and to change nothing yet.

Things to look for in what comes back:

- **Did Claude reproduce it?** You want to see the wrong fee produced by a real command, not just an argument about why it would happen.
- **Is there evidence for the cause?** Ask what supports it.

Then test two things yourself, by asking.

**The reporter's guess.** The issue says morning returns are probably fine, but the reporter hasn't checked. A bug report is a mix of facts and guesses. Don't hand the guess to Claude as a fact. Ask it to check:

```
The reporter thinks morning returns on the due date are fine.
Is that true? Show me, don't assume.
```

**The passing tests.** All nine tests pass, and one of them is even called "no fee when the book comes back on the due date". So how did this bug get through?

```
There's already a test for returning on the due date, and it passes.
Why didn't it catch this?
```

The answer to that question is one of the most useful lessons in the project. Write it in your journal.

**Check:** you can explain the cause in one sentence, to someone who hasn't seen the code. Don't move on until you can.

## Milestone 3: Issue 1, plan and fix

Switch to plan mode and ask for a plan to fix the bug.

A good plan here has three parts:

1. **New tests first**, which fail today.
2. **The fix**, as small as possible.
3. **What stays the same.**

Before you approve, put the plan through the questions from [chapter 13](../13-plan-mode/notes.md). And ask one more, which matters a great deal for this bug:

```
Besides the case in the issue, which other returns does this bug affect?
What would a book returned at 9am on the day AFTER the due date cost
today, and what should it cost?
```

The issue describes one symptom. A symptom fix would make that one case right and leave the rest. A cause fix makes them all right. This question tells you which kind of plan you're looking at.

When you're satisfied, approve the plan and choose to check each edit by hand.

Then follow the test-first order from [chapter 14](../14-letting-claude-check-its-own-work/notes.md):

1. Claude writes the new tests.
2. Run them. **See them fail.** Paste the failure into your journal.
3. Claude fixes the code, without changing the tests.
4. Run everything, and look at the output.

**Check:**

- The new tests cover several times of day, not only the one in the issue.
- Every test passes, old and new.
- The diff in `src` is small. If it's large, ask why.
- No existing test was changed. If one was, you know why and you agreed.

Commit.

## Milestone 4: Issue 1, the pull request

Time to hand the work over for review.

Ask Claude to write the description. Tell it what a reviewer needs:

```
Write a pull request description for this branch. Cover what changed,
why, and how it was tested. Add a short note on anything that changes
behaviour for users, beyond the case in the issue.
```

That last sentence is important. Your fix probably changes the fee for some returns that nobody complained about. That's correct, but it's a change in what people are charged, and a reviewer must not find it out by surprise. A good pull request points at its own consequences.

A solid description looks like this in outline:

```
## What
One or two sentences on what changed.

## Why
The problem, and a link to the issue.

## How it was tested
The new tests, and anything you checked by hand.

## Notes for the reviewer
Anything surprising, risky, or worth a second look.
```

Then open the pull request, or save the description as `pull-requests/001-late-fee-on-due-date.md`.

**Now review it yourself.** Read the whole diff from top to bottom, as if a stranger wrote it. You can also run `/code-review` and see whether it finds anything you missed. If either of you finds something, fix it and commit again.

When you're happy, merge the branch into your main branch.

## Milestone 5: Issue 2, the feature

A new issue is a new task. Clear the desk first.

```
/rename issue-1-late-fee
/clear
```

Make a new branch from your updated main branch:

```
! git switch -c add-renew-loan
```

Go into plan mode, and ask for a plan for issue 2.

The issue lists seven rules. In a plan, each rule should become at least one test. Count them.

The issue also leaves some things open. A good plan either asks you about them or states what it assumed. Watch for these:

- What does the new function take, and what does it give back?
- How does the code know what "today" is?
- What exactly happens when a renewal is refused?
- Does it follow the patterns the existing functions use?

That last one deserves a close look. The project already has a way of doing things. A new function that works differently from its neighbours is the "drifting" and "ignoring what's there" problem from [chapter 19](../19-when-claude-goes-wrong/notes.md).

Ask the question that often finds a hidden assumption:

```
What did you assume that the issue doesn't say?
```

Approve the plan when it's right. Then, as before: tests first, see them fail, write the code, run everything.

Pay attention to the last rule in the issue: the late fee must still work for a renewed loan. That's the two issues meeting. If you fixed the cause of issue 1 properly, this part is easy. If you only patched a symptom, this is where it shows.

**Check:**

- At least one test for each of the seven rules.
- Every test passes, including all the ones from issue 1.
- The new code looks like it belongs with the old code.
- Nothing was built that the issue didn't ask for. The issue has an "Out of scope" section. Check against it.

Commit in small steps.

## Milestone 6: Issue 2, pull request and merge

Write the description, open the pull request, review your own diff, and merge, as in milestone 4.

This time, also check the **README**. It describes the project, and the project just changed. Is it still true? Out-of-date documentation is a bug that tests never catch.

## Milestone 7: Look back

Open `journal/ch20.md` and answer these honestly.

- **The bug.** In one sentence, what was the cause? Why did nine passing tests miss it?
- **The reporter.** Was the guess about morning returns right? What would have happened if you'd passed it to Claude as a fact?
- **Symptom or cause.** What does a 9am return on the day after the due date cost now? What did it cost before? Did your fix handle that because of a special case, or because the cause is gone?
- **The plans.** What did you change in each plan before approving it?
- **The diffs.** Did Claude ever add something you didn't ask for? What did you do?
- **Your setup.** What did you add to `CLAUDE.md` along the way?
- **Next time.** What would you do differently on a third issue?

## A checklist for "done"

Use this for every piece of work from now on.

- [ ] I can explain the change in one or two sentences.
- [ ] For a bug: I know the cause, not just the symptom.
- [ ] There's a test that failed before the change and passes after it.
- [ ] All tests pass, and I've seen the output.
- [ ] I've read every line of the diff, tests included.
- [ ] Nothing is in the diff that wasn't asked for.
- [ ] The commit messages say what and why.
- [ ] The pull request tells a reviewer what to look out for.
- [ ] The documentation is still true.

## Common mistakes

- **Starting Claude before reading the issues yourself.** You can't judge a fix for a problem you don't understand.
- **Passing on the reporter's guess as a fact.** Reports contain theories. Check them.
- **Fixing the one case in the issue.** Ask what else the same cause affects.
- **Trusting "all tests pass".** They passed while the bug was there. Ask what the tests actually cover.
- **Doing both issues in one session.** The first one clutters the second. Clear in between.
- **Tests written after the code.** Then you never saw them fail, and you don't know they can.
- **A pull request that hides its side effects.** If behaviour changes for users, say so.
- **Forgetting the README.** The code changed. Check that the words still match.

## Quick recap

- Real work travels a path: issue, branch, explore, plan, test first, code, check, commit, pull request, review, merge.
- Read the issue yourself first. A report is a mix of facts and guesses.
- Find the **cause** before any code changes, and ask what else it affects.
- Passing tests only prove what they test. Ask why a test didn't catch the bug.
- Each rule in a feature request becomes a test.
- A good pull request says what changed, why, how it was tested, and what a reviewer should watch for.
- One issue, one branch, one session.
