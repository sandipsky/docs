# 16 Debugging with Claude: Exercises

**How to do these:**

- Do exercises 1 to 4 in the Checkout project: copy this chapter's `starter` folder to `claude-practice/checkout`, and put it under Git, as the notes describe. You need Node.js 20 or newer.
- **Don't read the source files looking for the bugs first.** Let the evidence lead you.
- Do the exercises **in order**. Each bug hides behind the one before it.
- Write your answers in `claude-practice/journal/ch16.md`.
- For every bug, follow the five steps, and don't let Claude change a file until you both know the cause. Commit after each fix.
- An exercise is done when you can explain the cause in one sentence to someone who hasn't seen the code.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your journal for the chapter.

---

## Exercise 1 (Easy): The crash

The notes walked through this bug. Now do it yourself, as practice for the routine.

1. **Reproduce.** Run `npm start` and see the crash.
2. **Gather evidence.** In the stack trace, find: what went wrong, which file, and which line. Find the second clue that was printed before the crash.
3. **Find the cause.** Ask Claude for the root cause, and tell it not to change anything.
4. **Fix the cause.** Ask for the smallest fix.
5. **Prove it.** Run `npm start` again.

In your journal:

- Your prompt for step 3.
- The line number where the program crashed, and the line number where the bug was.
- How many lines did the fix change?
- Is the receipt correct now? Look at the README for what the total should be.

<details>
<summary>Hint</summary>

If Claude starts editing before you've agreed on the cause, press Esc and say so. A firm "Don't change any files yet" at the start of the prompt usually prevents it.

</details>

---

## Exercise 2 (Easy): The failing test

The program runs now. Let's see what the tests think.

1. Run `npm test`. One test fails.
2. Read the output yourself before you ask Claude anything. Write down: the name of the failing test, the value it expected, and the value it got.
3. Open the README and read the shop's rules. Which rule is this test about?
4. Ask Claude for the root cause, without changing anything.
5. Before you approve a fix, decide: is the **code** wrong, or is the **test** wrong? Say which, and how you know.
6. Fix it, and run all the tests.

In your journal:

- The three things from step 2.
- Your answer to step 5, with your reason.
- The fix was tiny. Describe it in five words or fewer.
- Run `npm start` again. What changed on the receipt? Is the total correct yet?

<details>
<summary>Hint 1</summary>

For step 5, you need a source of truth that is neither the code nor the test. The README states the shop's rule in plain words. Compare the rule with what the test expects, and then with what the code does.

</details>

<details>
<summary>Hint 2</summary>

Pay attention to the exact words of the rule: "3 **or more**". Bugs like this one have a nickname: off-by-one errors. They hide at the edges of a rule, which is why the test for ten items passed and the test for three didn't.

</details>

---

## Exercise 3 (Medium): The quiet one

Every test passes now. The program doesn't crash. And the receipt is still wrong.

This is the hardest kind of bug, because nothing is complaining.

1. Run `npm start`. Compare the receipt with the total the README promises. Which line looks wrong?
2. Work out, by hand, what that line **should** say.
3. **Before any fix**, ask Claude to write a failing test that captures the problem. Tell it not to touch the source code yet.
4. Run the tests. Your new test must fail. Paste the failure into your journal.
5. Now ask for the root cause.
6. Ask for the fix, with the instruction not to change the test.
7. Run the tests, then run `npm start`. Check the total against the README.

In your journal:

- All the tests were passing while the program was wrong. How is that possible?
- What does that tell you about the sentence "all tests pass"?
- What was the cause? Why did it only affect one item in the cart?
- Name one other price that would have gone wrong in the same way.

<details>
<summary>Hint 1</summary>

Look at how the prices are written in `data/cart.json`. One of them has a character that the others don't.

</details>

<details>
<summary>Hint 2</summary>

If you want to see the moment it goes wrong, ask Claude for temporary logging: print each price as text and as a number, right after it's read. Remember to have the logging removed afterwards, and check the diff to be sure.

</details>

<details>
<summary>Hint 3</summary>

Tests can only catch what someone thought to test. Look at the existing test for reading a price. Which kind of price did its author try? Which kind did they not think of?

</details>

---

## Exercise 4 (Medium): Symptom or cause?

Here are three "fixes" that someone might have accepted for the three bugs. Each one makes the problem seem to go away.

**Fix A**, for the crash:

```js
try {
  printReceipt("data/cart.json");
} catch {
  console.log("Could not print the receipt.");
}
```

**Fix B**, for the failing test. The test is changed to expect the wrong number:

```js
assert.equal(lineTotal({ name: "Notebook", price: 4.5, quantity: 3 }), 13.5);
```

**Fix C**, for the wrong total:

```js
if (item.name === "Laptop") {
  item.price = 1299;
}
```

For each one, write in your journal:

- Why does it make the problem look fixed?
- What is still broken?
- Describe a real situation, a week later, in which this "fix" causes trouble for a customer or for the shop.
- If you saw this in a diff, what would you say to Claude?

Then answer: what do all three have in common?

<details>
<summary>Hint</summary>

For each fix, change the input slightly and imagine the result. Fix C handles a laptop. What about a television that costs $2,400? Fix B makes the test pass. What does a customer who buys three notebooks pay?

</details>

---

## Exercise 5 (Challenge): Plant your own bug

Now reverse the roles. You'll hide a bug, and see how Claude hunts for it with only a symptom to go on.

Use your **Bookshelf** project for this one.

1. Commit your work and create a branch called `bug-hunt`.
2. **By hand**, without Claude, introduce one bug into the source code. Make it a realistic mistake, not nonsense. Some ideas:
   - a comparison that's slightly off, such as `>` where `>=` belongs,
   - the wrong property name,
   - a function that changes the list it was given instead of returning a new one.
3. Check that at least one of your tests fails, or that the app visibly misbehaves. If neither happens, that's interesting too: write down why.
4. Start a **new** session. Describe only the **symptom**, the way a user would. Don't say which file or what you changed.
5. Watch Claude work through it. Take notes on what it does.
6. Throw the branch away afterwards.

In your journal:

- The bug you planted, and the symptom you reported.
- The steps Claude took, in order. Did it reproduce the problem before reading code?
- Did it find the cause, or patch a symptom?
- If your tests didn't catch your own bug in step 3, what does that tell you about your tests? Write the test that would have caught it.
- How could your symptom report have been better? Rewrite it as a proper bug report: what you did, what you expected, and what happened instead.

<details>
<summary>Hint 1</summary>

A good symptom report sounds like a user, not a programmer: "When I finish a book, the pages read total goes down instead of up." It says what was done, what was expected, and what happened. It doesn't say where the problem is.

</details>

<details>
<summary>Hint 2</summary>

If Claude heads straight for a fix, remind it of the routine: reproduce first, cause second, fix third. Notice whether you had to. That tells you something to add to your `CLAUDE.md`.

</details>
