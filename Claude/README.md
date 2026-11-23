# Claude: Building Software with an AI Teammate

Claude is an **AI model** made by a company called Anthropic. You can chat with it like a very well-read friend. **Claude Code** is the version that works *inside your project*: it reads your files, runs commands, edits code, and checks its own work. The first is like texting a knowledgeable friend. The second is like that friend pulling up a chair and working at your keyboard.

This way of working has a name: **agentic development**. An **agent** is an AI that takes steps on its own to reach a goal, instead of only answering one question at a time. You say "add a search box to the products page," and Claude finds the right files, writes the code, runs the tests, and tells you what it did.

This course is written the way a senior engineer who builds with Claude every day would teach a new teammate. It takes you from your first chat to running whole projects with Claude: new ones and ones that already exist. Along the way you'll learn the tools around it (skills, MCP, subagents, hooks) and, just as important, how to ship work that doesn't look like an AI threw it together. There are 62 chapters in six levels. They go in order, and each one builds on the ones before it.

**Before you start:** finish at least Levels 1 to 3 of the [JavaScript course](../JavaScript/README.md) or the [Python course](../Python/README.md). You don't need to be an expert. But you must be able to *read* code well enough to notice when something is wrong. Claude makes you faster. It does not replace understanding. From Level 4 on, the projects use React, so Levels 1 and 2 of the [React course](../React/README.md) will help.

## Start here: how Claude gets a job done

Picture hiring a contractor to redo your kitchen. You don't hand over every hammer swing. You describe what you want, they look around, do the work, check it, and show you. Claude Code works the same way, in a loop:

```
You describe the job
      ↓
  Gather context    Claude reads files, searches, and asks you questions
      ↓
  Take action       it edits files and runs commands
      ↓
  Check the work    it runs tests, reads errors, or looks at a screenshot
      ↓
  Not right yet?    back to "Gather context"
      ↓
  Claude reports back, and you review
```

A few building blocks make that loop better. You'll meet each one properly later:

| Piece | What it is | In the kitchen job |
| --- | --- | --- |
| **CLAUDE.md** | A notes file Claude reads at the start of every session | The house rules on the fridge: "shoes off, don't touch the blue wall" |
| **Skill** | A packaged how-to that Claude opens only when a task needs it | The instruction booklet pulled out for one tricky appliance |
| **MCP server** | A plug that connects Claude to another app, like Figma or a browser | A key to another building: the design studio, the test lab |
| **Subagent** | A helper Claude sends off to do one job and report back | An apprentice sent to measure the windows |
| **Hook** | A script that *always* runs at a set moment | The smoke alarm: it doesn't rely on anyone remembering |
| **Plugin** | A bundle of the pieces above, installed in one go | A ready-packed toolbox |

Don't worry if this feels fuzzy right now. Level 1 gets you working, and Level 3 explains each piece.

## How to use this folder

1. **Read** the chapter's `notes.md`.
2. **Do every step yourself** in a practice project (set up in chapter 07). Watching isn't the same as doing.
3. **Do the exercises** in `exercises.md`. Try on your own before you open a hint.
4. **Ask Claude to check your work** when you're done or stuck.
5. **Tick the chapter off** below (change `[ ]` to `[x]`).

**What you need:** a computer with a terminal (Windows, macOS, or Linux), Git, VS Code, and a Claude account that includes Claude Code. Chapter 06 walks through installing it and which plans work, because those details change.

**Three ideas run through the whole course:**

- **You are still the engineer.** Claude writes. You decide, and you answer for the result. Never ship code you haven't read.
- **Context beats cleverness.** Most bad results come from Claude not knowing something, not from Claude being weak. Good notes, the right files, and a clear goal fix more problems than a fancy prompt.
- **Give Claude a way to check its work.** A test it can run, an error it can read, or a screenshot it can look at. With a check, Claude fixes its own mistakes. Without one, you become the check.

**Versions:** this roadmap was written in November 2026. Claude Code gets updates very often, sometimes several in one week, so commands and menus can change. Each chapter says which version it was checked against. If something looks different on your screen, type `/help`, or just ask Claude: it can look up how its own features work. The models change too. At the time of writing they are Fable 5.2 (the most capable), Opus 5.5, Sonnet 5.5, and Haiku 5.5 (the smallest and fastest). Chapter 05 covers how to choose.

**Tools you don't use:** Level 4 covers real tools like Figma, Jira, and Sentry. Each of those chapters stands alone, so skip any tool you don't have.

**Projects:** seven chapters are projects where you build something real. Some come with a `starter/` folder, so you can focus on the Claude parts.

---

## Level 1: Meet Claude

*Goal: understand what Claude is, talk to it well, and finish your first small task in Claude Code.*

- [ ] [01 What Claude Is](01-what-claude-is/notes.md): the models, the chat app, Claude Code, and what "agentic" really means
- [ ] [02 How Claude Works](02-how-claude-works/notes.md): tokens, the context window (Claude's short-term memory), and why it can sound sure and still be wrong
- [ ] [03 Prompting Basics](03-prompting-basics/notes.md): say what you want, why you want it, and what "done" looks like
- [ ] [04 Claude in the Chat App](04-claude-in-the-chat-app/notes.md): projects, artifacts, file uploads, and connectors, and when chat is a better fit than Claude Code
- [ ] [05 Models, Effort and Cost](05-models-effort-and-cost/notes.md): picking between the big and small models, how hard Claude thinks, and what it costs you
- [ ] [06 Installing Claude Code](06-installing-claude-code/notes.md): the terminal, VS Code, the desktop app, and the web, and signing in
- [ ] [07 Your First Session](07-your-first-session/notes.md): ask questions about a codebase, make one small change, read the diff, and undo it
- [ ] [08 Permissions and Safety](08-permissions-and-safety/notes.md): what Claude may do without asking, the permission modes, and keeping passwords out of the chat
- [ ] [09 Project: A Small App, Built Together](09-project-small-app/notes.md): build a tiny expense tracker with Claude, one reviewed step at a time

## Level 2: The Daily Workflow

*Goal: get good results on real tasks, every day, without wasting time or tokens.*

- [ ] [10 The Agentic Loop](10-the-agentic-loop/notes.md): explore, plan, code, check: the four-step habit behind almost every good session
- [ ] [11 CLAUDE.md and Memory](11-claude-md-and-memory/notes.md): the notes file Claude reads every session, what belongs in it, and what to leave out
- [ ] [12 Managing Context](12-managing-context/notes.md): pointing Claude at the right files, pasting screenshots, and knowing when to clear and start fresh
- [ ] [13 Plan Mode](13-plan-mode/notes.md): making Claude think and show you its plan before it touches a file
- [ ] [14 Letting Claude Check Its Own Work](14-letting-claude-check-its-own-work/notes.md): tests, type checks, and linters as a feedback loop, and writing the test first
- [ ] [15 Git with Claude](15-git-with-claude/notes.md): commits, branches, pull requests, and rewinding when a change goes wrong
- [ ] [16 Debugging with Claude](16-debugging-with-claude/notes.md): errors, logs, and stack traces, and fixing the cause instead of hiding the symptom
- [ ] [17 Commands, Shortcuts and Settings](17-commands-shortcuts-and-settings/notes.md): the slash commands and keys worth learning, and where your settings live
- [ ] [18 Working Efficiently](18-working-efficiently/notes.md): usage limits, cheap habits and expensive ones, and when a fresh session beats arguing with an old one
- [ ] [19 When Claude Goes Wrong](19-when-claude-goes-wrong/notes.md): over-building, made-up functions, drifting off task, and "it works" with no proof, and how to steer back
- [ ] [20 Project: From Issue to Pull Request](20-project-issue-to-pull-request/notes.md): take a bug report and a feature request through plan, code, tests, and a clean pull request

## Level 3: Extending Claude

*Goal: teach Claude new tricks, and connect it to your other tools.*

- [ ] [21 Skills](21-skills/notes.md): packaged instructions Claude loads only when a task needs them, and how to install and use them
- [ ] [22 Writing Your Own Skill](22-writing-your-own-skill/notes.md): a `SKILL.md` file, a description that triggers at the right moment, and helper scripts
- [ ] [23 MCP Basics](23-mcp-basics/notes.md): the Model Context Protocol, a standard plug that connects Claude to other apps, and how to add a server
- [ ] [24 Subagents](24-subagents/notes.md): helpers with their own fresh memory, for research, review, and side jobs, and when not to use one
- [ ] [25 Hooks](25-hooks/notes.md): scripts that always run at set moments, like formatting after every edit or blocking a risky command
- [ ] [26 Plugins and Marketplaces](26-plugins-and-marketplaces/notes.md): installing skills, subagents, hooks, and MCP servers as one bundle, and sharing your own
- [ ] [27 Parallel Work](27-parallel-work/notes.md): Git worktrees (extra copies of your project folder), background tasks, and several sessions at once
- [ ] [28 Orchestrating Many Agents](28-orchestrating-many-agents/notes.md): splitting one big job across a team of agents, and when that is worth the tokens
- [ ] [29 Automation](29-automation/notes.md): running Claude with no chat window: in scripts, in CI (the robots that test your code on every push), and on a schedule
- [ ] [30 Project: Your Own Toolkit](30-project-your-own-toolkit/notes.md): build a skill, a hook, and a subagent that fit the way you work

## Level 4: Real-Life Tools

*Goal: use the tools working developers plug into Claude every day. Each chapter stands alone, so skip any tool you don't use.*

**Before chapter 31:** Levels 1 and 2 of the [React course](../React/README.md). **Before chapter 36:** Level 1 of the [PostgreSQL course](../PostgreSQL/README.md).

- [ ] [31 Figma MCP](31-figma-mcp/notes.md): turning a real design into code that matches it, using the design's own colors, spacing, and components
- [ ] [32 Playwright MCP](32-playwright-mcp/notes.md): letting Claude drive a real browser to click through your app, take screenshots, and write end-to-end tests
- [ ] [33 Graphify](33-graphify/notes.md): turning a codebase or a pile of docs into a knowledge graph (a map of what connects to what) that you can ask questions
- [ ] [34 GitHub](34-github/notes.md): issues, pull requests, and reviews from the terminal, and mentioning Claude inside a pull request
- [ ] [35 Up-to-Date Docs](35-up-to-date-docs/notes.md): Context7 and web search, so Claude reads today's library docs instead of guessing from memory
- [ ] [36 Databases](36-databases/notes.md): giving Claude safe, read-only access to explore your tables, write queries, and plan migrations
- [ ] [37 Jira and Confluence](37-jira-and-confluence/notes.md): from ticket to code and back, and writing docs where your team already reads them
- [ ] [38 Sentry and Logs](38-sentry-and-logs/notes.md): from a real error in production to a tested fix
- [ ] [39 Office Files](39-office-files/notes.md): Word, PDF, Excel, and slides, made and edited with skills
- [ ] [40 Choosing and Trusting MCP Servers](40-choosing-and-trusting-mcp-servers/notes.md): what a server can see and do, prompt injection (hidden instructions inside content Claude reads), and when a plain command-line tool is the better choice
- [ ] [41 Project: From Design to Tested Screen](41-project-design-to-tested-screen/notes.md): build a screen from a Figma design in React, then have Claude test it in a real browser

## Level 5: Apps That Don't Look Vibe Coded

*"Vibe coding" means accepting whatever the AI writes without reading it. Goal: ship work that looks and reads like a careful team built it.*

- [ ] [42 Spotting Vibe-Coded Work](42-spotting-vibe-coded-work/notes.md): the giveaways in the screen and in the code, and why they happen
- [ ] [43 Design Basics for Developers](43-design-basics-for-developers/notes.md): spacing, type, color, and hierarchy: just enough design to give Claude good directions
- [ ] [44 Design Systems and Tokens](44-design-systems-and-tokens/notes.md): one source of truth for colors and spacing, and making Claude reuse components instead of inventing new ones
- [ ] [45 Directing UI Work](45-directing-ui-work/notes.md): references, screenshots, and Figma, and improving a screen with a look, fix, look again loop
- [ ] [46 The Details That Sell It](46-the-details-that-sell-it/notes.md): empty, loading, and error states, real words instead of filler, phones, keyboards, and dark mode
- [ ] [47 Code That Reads Like a Team Wrote It](47-code-that-reads-like-a-team-wrote-it/notes.md): shared conventions, small changes, clear names, and deleting what Claude over-built
- [ ] [48 Reviewing Like a Senior](48-reviewing-like-a-senior/notes.md): reading every diff, automated code review, a second-opinion agent, and tests that really prove something
- [ ] [49 Security and Secrets](49-security-and-secrets/notes.md): the holes AI-written code often leaves open, and how to find and close them
- [ ] [50 Project: De-Vibe an App](50-project-de-vibe-an-app/notes.md): take a messy, AI-built starter app and bring it up to a professional standard

## Level 6: Real Projects, Start to Finish

*Goal: run a whole project with Claude, both a brand-new one and one that already exists.*

**Starting a new project** (chapters 51 to 53)

- [ ] [51 Starting from Scratch](51-starting-from-scratch/notes.md): from a rough idea to a written spec, a chosen stack, and a plan, all before any code
- [ ] [52 Setting Up a Repo for Claude](52-setting-up-a-repo-for-claude/notes.md): CLAUDE.md, tests, linting, permissions, and hooks from day one
- [ ] [53 Building in Slices](53-building-in-slices/notes.md): one thin feature working end to end, checked and committed, then the next

**Working on an existing project** (chapters 54 to 56)

- [ ] [54 Joining an Existing Codebase](54-joining-an-existing-codebase/notes.md): getting Claude, and yourself, up to speed on code you didn't write
- [ ] [55 Changing Existing Code Safely](55-changing-existing-code-safely/notes.md): tests as a safety net, following the patterns already there, and small pull requests
- [ ] [56 Large and Legacy Codebases](56-large-and-legacy-codebases/notes.md): monorepos (many projects in one repository), old code with no tests, and big migrations done in pieces

**For every project** (chapters 57 to 62)

- [ ] [57 Working in a Team](57-working-in-a-team/notes.md): shared settings and skills, and being open about AI-written code in reviews
- [ ] [58 Shipping and After](58-shipping-and-after/notes.md): CI, deploying, watching for errors, and writing release notes
- [ ] [59 Building Your Own Agents](59-building-your-own-agents/notes.md): a first taste of the Claude API, the Agent SDK (Claude Code as a library), and Managed Agents (Anthropic runs the agent for you)
- [ ] [60 Staying Current](60-staying-current/notes.md): new models and features arrive all the time, and how to keep your setup fresh without chasing every trend
- [ ] [61 Capstone Project: A New App from Zero](61-capstone-project-new-app-from-zero/notes.md): take your own idea from a blank folder to a live, tested app
- [ ] [62 Capstone Project: A Feature in an Existing Codebase](62-capstone-project-feature-in-existing-codebase/notes.md): add a real feature to a project you didn't start, the way a new teammate would

---

**After this:** you'll have a way of working, not just a list of commands. The tools will keep changing, and the habits won't: give good context, plan first, make Claude prove its work, and read what you ship. From here, go deeper on chapter 59 and build agents of your own with the Claude API.
