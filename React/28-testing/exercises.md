# 28 Testing: Exercises

**How to do these:**

- These need the test setup from the notes installed in your practice app. Run `npm test` in a terminal and leave it running — it re-runs on every save, which is the whole point.
- One folder per exercise: `src/ch28/ex1/`, with test files sitting next to the components they test (`Counter.tsx` and `Counter.test.tsx`).
- **Watch a test fail before you make it pass.** Write the assertion, see red, then write the code. A test you've never seen fail might not be testing anything.
- An exercise is done when the tests pass, they still pass after you rename internal variables, `npx tsc -b` prints nothing, and no test calls a real API.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Your first tests, and the query ladder

In `src/ch28/ex1/`, build a `Greeting` component taking `name: string` and `isVip?: boolean`. It shows an `<h1>` greeting, and a "VIP member" badge only when `isVip` is true.

Write these tests:

1. It shows the name in a heading.
2. It shows the VIP badge when `isVip` is `true`.
3. It does **not** show the badge when `isVip` is omitted. (Which query prefix do you need here?)

Then, an exercise in query choice — find the heading four different ways:

4. `getByRole("heading", { name: /maya/i })`
5. `getByText("Hello, Maya!")`
6. `getByTestId("greeting")` (you'll need to add a `data-testid`)
7. Now **change the `<h1>` to an `<h2>`**. Which of your three queries still pass? Which broke? What does that tell you about which to prefer?
8. Change the greeting text from `Hello,` to `Hi,`. Which break now?

<details>
<summary>Hint 1</summary>

Question 7 is the interesting one: `getByRole("heading")` still passes, because an `<h2>` is still a heading. That's a test correctly *not* caring about a change that doesn't affect users — which is exactly the property you want.

</details>

---

## Exercise 2 (Easy): Testing a reducer

The highest value per line of effort in this whole chapter. Take your cart reducer from [chapter 23, exercise 3](../23-use-reducer/exercises.md) (or rebuild a simple version) and test it thoroughly in `src/ch28/ex2/`.

No `render`, no DOM, no `user-event` — a reducer is a pure function, so these tests are just calling a function and checking what comes back.

Write a test for each rule:

1. Adding a new product puts it in the cart with quantity 1.
2. Adding a product that's already there increases its quantity instead of adding a second line.
3. `quantity_changed` to 0 removes the item entirely.
4. `discount_applied` with `SAVE10` applies the discount.
5. `discount_applied` with anything else leaves the state **completely unchanged** — assert the returned state is the *same object* (`toBe`, not `toEqual`).
6. `cleared` empties the items and removes any discount.
7. The reducer never mutates its input: capture the state before, run an action, and assert the original object is unchanged.

<details>
<summary>Hint 1</summary>

For requirement 5, `expect(after).toBe(before)` checks reference equality, and it will only pass if your reducer returns the exact same object rather than a copy. That's the behaviour [chapter 11](../11-updating-objects-and-arrays/notes.md) recommended, now pinned down by a test.

</details>

<details>
<summary>Hint 2</summary>

For requirement 7, the cleanest version: build the state, `JSON.stringify` it, run the action, then assert the stringified original still matches. Or deep-freeze it with `Object.freeze` and let a mutation throw.

</details>

---

## Exercise 3 (Medium): Testing a form

In `src/ch28/ex3/`, build a sign-up form (email, password, a terms checkbox, a submit button) with validation, then test it properly.

Tests:

1. The submit button is disabled initially.
2. Filling everything in correctly enables the button.
3. An invalid email shows an error message **after the field is blurred**, not while typing.
4. Submitting calls an `onSubmit` prop exactly once, with the right values.
5. Submitting clears the form.
6. Pressing **Enter** in the email field submits, just like clicking the button.
7. The password is never included in anything the component logs (add a `console.log` on submit, spy on it with `vi.spyOn(console, "log")`, and assert the password isn't in what was logged).

Then, the important part:

8. **Refactor the component's internals** — switch from four `useState` calls to one `useReducer`. Do **not** change a single test. They should all still pass. If any test breaks, it was testing implementation; rewrite it to test behaviour instead.

<details>
<summary>Hint 1</summary>

Question 8 is the real exam. Any test that broke was reaching into *how* the component works. Tests that click, type, and check what's on screen sail through a refactor like this without noticing — which is exactly why they're worth writing.

</details>

<details>
<summary>Hint 2</summary>

For requirement 6, `user.keyboard("{Enter}")` after typing in the field, or `user.type(input, "text{Enter}")` in one go.

</details>

---

## Exercise 4 (Medium): Testing async and mocked fetch

In `src/ch28/ex4/`, build a small component that fetches a list of users from an API and shows loading, error, and success states — the three-state pattern from [chapter 18](../18-fetching-data/notes.md).

Tests, each with `fetch` stubbed differently:

1. Shows "Loading…" immediately on mount.
2. Shows the list of users once the fetch resolves (`findBy`).
3. The loading message is gone afterwards (`queryBy`).
4. Shows an error message when the fetch rejects.
5. Shows an error message when the response has `ok: false` with a 500 status — a different path from a rejection, and one that's easy to get wrong.
6. Shows "No users found" when the API returns an empty array — which is a **success**, not an error.
7. Clicking a **Retry** button after a failure fires a new request (assert the fetch mock's call count).

Requirements:

8. No test may call the real network. Confirm by disconnecting your wifi and running the suite.
9. Reset your mocks between tests so one test's stub can't leak into another. Prove it by deliberately removing the reset and watching a test fail.

<details>
<summary>Hint 1</summary>

For question 9, `beforeEach`/`afterEach` with `vi.unstubAllGlobals()`, or `vi.restoreAllMocks()`. Leaky mocks produce the worst kind of test failure: one that only happens when tests run in a particular order.

</details>

<details>
<summary>Hint 2</summary>

For requirement 5, remember `fetch` doesn't reject on a 500 — your stub should resolve with `{ ok: false, status: 500 }`, and your component's `response.ok` check is what turns that into an error. If your test passes without that check in the component, the test isn't testing what you think.

</details>

---

## Exercise 5 (Challenge): Test a real feature end to end

Take your [chapter 21](../21-project-recipe-finder/notes.md) Recipe Finder — or the task board from [chapter 23, exercise 5](../23-use-reducer/exercises.md) — and write a test suite for a genuine, whole feature, not just isolated components.

Pick **favourites** (Recipe Finder) or **the whole task flow** (task board), and cover:

1. **A `renderWithProviders` helper** setting up every context and router the component tree needs. Write it once, use it in every test.
2. The full happy path as a single test that reads like a user story: search → see results → favourite one → switch to the favourites view → see it there.
3. Persistence: favouriting something writes to `localStorage`, and a fresh render picks it up. (Stub `localStorage`, or clear it between tests.)
4. Un-favouriting removes it from both the view and storage.
5. The empty state: with no favourites, the favourites view says so rather than showing an empty box.
6. An error path: the API fails, the error message shows, and the rest of the app (the search box) still works.
7. **An accessibility check that falls out for free**: every one of your queries uses `getByRole` with an accessible name. If any element can't be found that way — an icon-only button, an unlabelled input — **fix the component**, not the test.

Then:

8. Run `npx vitest --coverage`. Note which files are untested. Pick the **one** with the most real logic in it and add tests for that. Then stop — don't chase the number.
9. Write a short comment answering: which of these tests would have caught a bug you actually hit while building the project originally?

<details>
<summary>Hint 1</summary>

Requirement 7 is doing double duty on purpose. A heart button showing only `♥` has no accessible name at all, so `getByRole("button", { name: /favourite/i })` can't find it — and neither can a screen reader user. The fix is the `aria-label` the project notes asked for, and your test is what proves it's actually there.

</details>

<details>
<summary>Hint 2</summary>

For requirement 3, `localStorage` works in jsdom but persists across tests in the same file. `beforeEach(() => localStorage.clear())` keeps them independent — and that independence is what makes a failing test mean something.

</details>

<details>
<summary>Hint 3</summary>

Question 9 is worth taking seriously rather than answering glibly. Think back to what actually broke while you were building chapter 21 — a stale result from a race condition, a favourite that didn't persist, a crash on an empty search. Writing the test that would have caught it is the most direct way to learn what tests are *for*.

</details>
