# 14 Letting Claude Check Its Own Work: Exercises

**How to do these:**

- Do these in your practice project, `claude-practice/bookshelf`. You need Node.js 20 or newer for the built-in test runner.
- Commit before each exercise.
- Write your answers in `claude-practice/journal/ch14.md`.
- Whenever Claude says tests pass, ask to see the output. Paste the important part into your journal.
- An exercise is done when the tests pass, you've seen them pass, and you can explain what each test proves.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your journal for the chapter.

---

## Exercise 1 (Easy): The first tests

Give Bookshelf a check.

1. Add the `test` script to `package.json` and create `test/books.test.js`, as shown in the notes. Type the two tests in yourself.
2. Run `npm test` and see both pass.
3. Now ask Claude to add tests for the functions that don't have any yet, such as `finishBook` and `nextId`. Tell it to cover the case where an id doesn't exist.
4. **Read every test** before you approve it.
5. Add the test command and a "run the tests after every change" rule to your `CLAUDE.md`.

In your journal:

- How many tests do you have now?
- Pick one test Claude wrote. In one sentence, what does it prove?
- Did Claude write a test for something you wouldn't have thought of?

<details>
<summary>Hint</summary>

To test that a function throws an error, Node's `assert` has a helper called `assert.throws`. You don't need to know the details. Ask Claude to explain any line in a test that you can't read, before you approve it.

</details>

---

## Exercise 2 (Easy): Make it fail

You should see a failure with your own eyes before you trust a pass.

1. Open `src/books.js` yourself and break something on purpose. For example, in `nextId`, change `+ 1` to `+ 2`.
2. Run `npm test`.
3. Read the output carefully. Find three things in it: **which** test failed, **what** it expected, and **what** it got.
4. Don't fix it yourself. Start a new Claude session and say only: "The tests are failing. Find out why and fix it." Watch what it does.
5. Check the diff, and run the tests again.

In your journal:

- Paste the part of the output that names the failing test.
- What steps did Claude take to find the cause? Did it need you to tell it where to look?
- Did Claude fix the code, or change the test? How do you know?

<details>
<summary>Hint</summary>

Look at the diff for step 5. It should touch `src/books.js` and nothing in the `test` folder. If a test file changed, that deserves a question.

</details>

---

## Exercise 3 (Medium): Test first

Add a feature the test-first way. Follow the four steps in the notes, one message each.

The feature: `getStats` should also return `pagesLeft`, the total pages of all books that aren't finished. The `stats` command should print it on a new line.

1. Ask for the test only. No changes to `books.js`.
2. Run it and **see it fail**. Paste the failure into your journal.
3. Ask for the code. Tell Claude not to change the test.
4. Run all the tests and see them pass.
5. Run `node src/cli.js stats` yourself.

In your journal:

- Why does step 2 matter? What would it mean if the new test had passed straight away?
- There are tests for `getStats`, but is there one for what `stats` prints on screen? Should there be? How would you check that part?
- Was reviewing the test easier or harder than reviewing the code?

<details>
<summary>Hint 1</summary>

An existing test compares the whole result of `getStats` with an exact object. Adding a new field will make that test fail too. That's correct behaviour, not a problem. Decide with Claude how the old test should change, and make sure you understand why.

</details>

<details>
<summary>Hint 2</summary>

`formatStats` in `format.js` is also a pure function: it takes some numbers and returns text. That makes it as easy to test as the functions in `books.js`.

</details>

---

## Exercise 4 (Medium): A test that's wrong

What does Claude do when the *test* is the problem? Find out.

1. Commit your work.
2. Open `test/books.test.js` yourself and add a test that is clearly wrong. For example, one that says a brand-new book should have `finished` set to `true`.
3. Run the tests and see it fail.
4. Start a new session and say exactly this, and nothing more:

   ```
   Make the tests pass.
   ```

5. Watch what Claude does. Read the diff before approving anything.

In your journal:

- Did Claude change the code to match the wrong test? Did it change the test? Did it stop and ask you which one was right?
- Which of those three would you want from a human teammate?
- Rewrite the prompt from step 4 so that the right outcome is more likely.
- Go back to your commit, so the wrong test is gone.

<details>
<summary>Hint</summary>

"Make the tests pass" tells Claude what result you want and nothing about what's correct. A better prompt says where the truth lives. Is the test the specification, or is the code? If you don't know which is wrong, say that, and ask Claude to investigate before changing either.

</details>

---

## Exercise 5 (Challenge): Close a gap, test first

Bookshelf accepts whatever you type. In chapter 07 you saw what happens with a page count of `abc`. Now fix that kind of problem properly, with tests leading the way.

1. Decide the rules. Write them in your journal first. For example:
   - a title and an author must contain something other than spaces,
   - pages must be a whole number greater than zero.
2. Use plan mode to decide **where** the checks belong: in `cli.js`, in `books.js`, or in a new function.
3. Have Claude write tests for every rule, including the edge cases. Run them and see them fail.
4. Have Claude write the code to make them pass, without changing the tests.
5. Try to break it yourself from the command line.

If you already fixed the page count in chapter 07, extend it instead: the app should refuse to add a book whose title and author exactly match one that's already on the shelf.

In your journal:

- Your rules, as you wrote them in step 1.
- A list of the edge cases your tests cover. Aim for at least six.
- Did you find a way to break it in step 5 that no test had covered? If so, what did you do next?
- Where did you decide the checks belong, and why does that choice make them easier to test?

<details>
<summary>Hint 1</summary>

Edge cases live at the boundaries. For a page count: zero, one, a negative number, a decimal such as `12.5`, text, an empty string, and a very large number. For a title: empty, only spaces, and a single character.

</details>

<details>
<summary>Hint 2</summary>

If you break the app in step 5, don't just ask for a fix. First ask for a failing test that captures what you found. Then ask for the fix. That way the bug can never come back unnoticed.

</details>

<details>
<summary>Hint 3</summary>

Think about which kind of function is easiest to test. A function that takes values and returns "valid" or a reason can be tested with plain data. A check buried inside the code that reads the command line is much harder to reach from a test.

</details>
