# 03 Prompting Basics

## What is it?

A **prompt** is the message you give Claude. **Prompting** is the skill of writing that message so Claude can do the job well.

It isn't a secret language or a bag of magic words. A good prompt is a clear brief, the kind you'd give a smart new colleague who has never seen your project.

## Why does it matter?

Claude can't read your mind. It only has what's on the page.

When a prompt is vague, Claude doesn't stop and wait. It fills the gaps with the most ordinary guess. So a vague question gets a generic answer, and a vague task gets a generic app. Most moments that feel like "Claude is being dumb" are really "Claude is missing something I know and didn't say".

Compare these two requests for the same thing:

```
Make a function to check passwords.
```

```
Write a JavaScript function isStrongPassword(password) for our sign-up form.
It should return true only if the password has at least 10 characters,
one number, and one letter. Our users are not technical, so I'll show them
a message for each rule they miss. Return which rules failed, not just false.
```

The first one forces Claude to guess the language, the rules, and what to return. The second one can only be built one way. Same Claude, same effort from the model, very different result.

## Real-world example

Think about ordering a jacket from a tailor.

| What you say | What you get |
|---|---|
| "Make me a jacket." | A jacket. Probably not your size, colour, or style |
| "A navy wool jacket for a winter wedding, in my size, and I need it by the 12th." | Something you'll actually wear |
| The same, plus a photo of a jacket you love | Almost exactly what you pictured |

The tailor didn't get more skilled between the first row and the last. You gave a better brief.

## How it works

### The four parts of a good prompt

Almost every good prompt answers four questions.

| Part | The question it answers | Example |
|---|---|---|
| **Goal** | What do you want? | "Add a search box to the product list." |
| **Context** | What does Claude need to know that it can't see? | "The list is in `ProductList.tsx`. We already have a `useDebounce` hook." |
| **Done** | How will we know it's finished and correct? | "Typing 'mug' shows only products with 'mug' in the name. The existing tests still pass." |
| **Limits** | What should stay untouched? | "Don't add any new packages. Don't change the API." |

You don't need all four every time. "What does this error mean?" is a fine prompt on its own. But when a result disappoints you, check which of the four was missing. It's almost always one of them.

### Build one up, bit by bit

Let's improve a prompt step by step.

**Start:**

```
Fix the login.
```

Claude has to guess everything. What's broken? Where?

**Add the goal and the symptom:**

```
Users who type their email with capital letters can't log in.
```

Now there's a real problem to find.

**Add context:**

```
Users who type their email with capital letters can't log in.
The login code is in src/auth/login.js. Emails are saved in lowercase
when people sign up.
```

Claude now knows where to look, and has a strong clue about the cause.

**Add what "done" looks like:**

```
Users who type their email with capital letters can't log in.
The login code is in src/auth/login.js. Emails are saved in lowercase
when people sign up.

It's fixed when "Sam@Example.com" and "sam@example.com" both log in
to the same account. Add a test that proves it.
```

**Add limits:**

```
... Change only the login code. Don't touch sign-up or the database.
```

Each line removed a guess. That's all prompting is.

### Say why

A reason lets Claude make good small decisions that you didn't think to spell out.

| Without a reason | With a reason |
|---|---|
| "Keep the summary short." | "Keep the summary short. People will read it on their phone between meetings." |
| "Don't use a library for this." | "Don't use a library for this. The app must work offline, and we keep it tiny." |

With the phone reason, Claude will also skip wide tables and long code blocks, even though you never mentioned them. A rule tells Claude what to do in one case. A reason tells it what to do in all the cases you forgot.

### Give the real thing, not a description of it

Compare:

```
My code gives an error about undefined.
```

```
Running `node src/cli.js stats` prints this:

TypeError: Cannot read properties of undefined (reading 'length')
    at getStats (src/books.js:24:27)
    at main (src/cli.js:56:31)
```

The second prompt contains the line number. Your summary of an error throws away exactly the details Claude needs.

So paste the **real error**, the **real code**, the **real data**. If it's something visual, give a **screenshot**. In Claude Code you'll go one better and let Claude read the files and run the command itself.

### Show an example

If you want a certain format or style, one example beats a paragraph of description.

```
Write commit messages for these three changes. Follow this style:

Fix late fee on due-date returns

Books returned on the due date were charged one day's fee because
the code compared exact times. It now compares calendar dates.
```

Claude will match the length, the tone, and the structure. One caution: Claude copies examples closely. If your example has a quirk you don't want, it'll copy the quirk too.

### Ask Claude to ask you

You don't have to think of everything up front. Let Claude find the gaps:

```
I want to build a small expense tracker for students.
Before you write anything, ask me up to five questions
about things you'd otherwise have to guess.
```

This is called having Claude **interview** you. It's one of the most useful habits in this course. A few minutes of questions saves you from an hour of building the wrong thing.

### Say what to do, not only what to avoid

| Instead of | Try |
|---|---|
| "Don't use jargon." | "Explain it in everyday words, the way you'd tell a friend." |
| "Don't make it long." | "Answer in three sentences." |
| "Don't break anything." | "Run the tests after your change and show me the result." |

"Don't" tells Claude where not to go. It still has to guess where you *do* want it to go.

### It's a conversation, not a wish

Your first prompt doesn't have to be perfect. The normal rhythm is:

```
prompt  →  look at the result  →  say what to change  →  look again
```

Good follow-ups are specific:

- "Shorter. Cut the second paragraph."
- "Good, but use a `for...of` loop so a beginner can read it."
- "That's not what I meant. The total should include tax."

Keep one task per prompt when you can. "Fix the bug, add dark mode, and write the README" gives you three half-checked things instead of one finished one.

### Things you don't need

Old advice from the early days of AI still floats around. With current Claude models you can drop all of this:

- **SHOUTING IN CAPITALS** to make it listen. Calm, clear sentences work better.
- **Magic phrases** like "think step by step" or "take a deep breath".
- **Flattery and role-play** such as "You are a world-class 10x engineer".
- **Threats and bribes.** No, really. People tried.

Write the way you'd write to a capable colleague. Clear beats clever.

### A checklist to keep

Before you send a prompt for real work, glance at this:

1. Did I say **what** I want, in a full sentence?
2. Did I give the **context** Claude can't see?
3. Did I say what **done** looks like?
4. Did I say what to **leave alone**?
5. Did I include the **real** error, code, or data?

## Common mistakes

- **Too vague.** "Make it better" gives Claude nothing to aim at. Better how? Faster, shorter, easier to read?
- **Asking for your solution instead of your goal.** "How do I get the last three characters of a file name?" when you really want the file's extension. Say the real goal, and you'll often get a better way.
- **Dumping everything.** Pasting ten files "just in case" buries the one that matters. Give what's needed, and let Claude ask for more.
- **No finish line.** Without "done", Claude decides when it's finished. It might stop too early, or keep adding things you never wanted.
- **Hiding the error.** Describing an error in your own words instead of pasting it.
- **Taking the first answer.** The first result is a draft. Push back, ask for another way, ask what could go wrong.
- **Only saying "don't".** A list of bans with no picture of what you want.

## Quick recap

- A prompt is a brief for a smart colleague who knows nothing about your project.
- Cover four things: the **goal**, the **context**, what **done** looks like, and the **limits**.
- Say **why**. A reason handles the cases you forgot to mention.
- Give the real error, the real code, or one example of what you want.
- Ask Claude to **interview you** before big tasks.
- Prompting is a conversation. Look at the result and steer.
