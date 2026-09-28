# 12 How Rendering Works: Exercises

**How to do these:**

- Work in your practice app, one folder per exercise: `src/ch12/ex1/`, and so on.
- This chapter is about **predicting** what will happen before you run it, then checking. For every exercise, write your prediction in a comment **before** you click anything. Being wrong is the useful part — it tells you exactly which bit of the model hasn't clicked yet.
- Keep the Console open the whole time.
- An exercise is done when your code matches your (corrected) prediction, VS Code shows no red squiggles, and `npx tsc -b` prints nothing.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Predict the log

In `src/ch12/ex1/Ex1.tsx`:

```tsx
import { useState } from "react";

function Ex1() {
  const [count, setCount] = useState(0);

  function handleClick() {
    console.log("before:", count);
    setCount(count + 1);
    console.log("after:", count);
  }

  return <button onClick={handleClick}>Count is {count}</button>;
}

export default Ex1;
```

1. **Before running it**, write down in a comment what you think the Console will show after one click.
2. Run it, click once, and compare. Were you right?
3. Click four more times in a row, quickly. Write down what the sequence of logs looks like, and explain why "after" is always one behind "the number now on the button."
4. Add a `setTimeout(() => console.log("later:", count), 2000);` inside `handleClick`. Click, wait, and write down what it logs. Why does waiting not change the answer?

<details>
<summary>Hint 1</summary>

Read "The snapshot: state is fixed for the whole render" in the notes. `count` inside `handleClick` was fixed the moment this render's `Ex1` function ran — nothing that happens afterwards, however long you wait, can change it.

</details>

---

## Exercise 2 (Easy): Three clicks, one render

In `src/ch12/ex2/Ex2.tsx`, build a counter with a `+3` button.

1. Write it the "obvious" way first: three separate `setCount(count + 1)` calls in the handler. Predict what happens on one click, then test it.
2. Fix it with the updater form so it really adds 3.
3. Add `console.log("rendering, count is", count);` above the `return`. Click `+3` once. How many times does that line print? Was that a surprise?
4. Now wrap `<Ex2 />`'s render in `<StrictMode>` (check `main.tsx` — it may already be there) versus without it, if you want to compare. Which one doubles the render count, and why is that safe to ignore here specifically?

<details>
<summary>Hint 1</summary>

For question 3, read "Batching" in the notes. Three `setCount` calls inside one handler cause **one** re-render, not three — so your render log should print once per click, not three times, regardless of how many `setCount` calls are inside the handler.

</details>

---

## Exercise 3 (Medium): The reluctant child

In `src/ch12/ex3/Ex3.tsx`:

```tsx
function Timestamp() {
  console.log("Timestamp rendered");
  return <p>Rendered, but I take no props and have no state.</p>;
}

function Ex3() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Clicked {count} times</button>
      <Timestamp />
    </div>
  );
}
```

1. Click the button a few times. Does `"Timestamp rendered"` print every time? Write down what you expected before checking, and whether you were right.
2. In a comment, explain in your own words **why** this happens, using the words "render" and "commit" correctly and separately.
3. Open the **Elements** tab (not Components) and watch the `<p>` while you click. Does the actual DOM text node get touched on every click, or only sometimes? What does that tell you about the difference between a component re-rendering and the DOM actually changing?
4. Add a *second* completely unrelated counter, `<AnotherCounter />`, as a sibling of `Ex3`'s button — its own `useState`, its own button. Clicking the first counter's button: does the second counter's component function run? Write your prediction first.

<details>
<summary>Hint 1</summary>

For question 3, React only touches the parts of the real DOM that actually changed between renders. `Timestamp`'s output is identical every time, so even though its function runs, nothing about it needs updating on screen.

</details>

<details>
<summary>Hint 2</summary>

For question 4: think about which component's state changed, and which components are *nested inside* that one. `AnotherCounter` is a sibling, not a child, of the button that changed — is it inside the component whose state changed, or outside it?

</details>

---

## Exercise 4 (Medium): The stale closure, on purpose

This exercise makes you build the classic React bug yourself, so you recognise it instantly later.

In `src/ch12/ex4/Ex4.tsx`, build a component with a number input and a button labelled **Log in 3 seconds**.

1. Clicking the button should, after a 3-second delay, log the number that was in the box **at the moment you clicked**, and nothing else.
2. Build the "broken" version first: read the input's value into a plain variable (not state) via a ref-free approach — just a `let` inside the component, set from an `onChange` — and log that variable inside the `setTimeout`. Type `5`, click, then type `9` before the 3 seconds are up. What gets logged?
3. Now build it with `useState` for the number, and log the state variable inside the same kind of `setTimeout`, started from a click handler. Repeat the same test: type `5`, click, type `9` before 3 seconds pass. What gets logged this time, and why is it different from step 2?
4. Explain the difference in a comment, using "snapshot" somewhere in your explanation.

<details>
<summary>Hint 1</summary>

A plain `let` inside the component body gets **reassigned** by every render and every `onChange`, so by the time the timeout fires 3 seconds later, it's reading whatever the *latest* value happens to be — not the value from when you clicked. That's the opposite of what a snapshot gives you.

</details>

<details>
<summary>Hint 2</summary>

State works differently because the handler that started the timeout was created during a specific render, and it closes over that render's `const` value of the state — which can never change, no matter what happens to state afterwards. That's exactly the mechanism from Exercise 1.

</details>

---

## Exercise 5 (Challenge): Build a tiny render logger

Put everything in this chapter to use by building a small debugging tool — something real React developers actually reach for.

In `src/ch12/ex5/`, build `useRenderCount.ts`, a **custom hook** (don't worry about the official rules for writing one yet — [chapter 20](../20-custom-hooks/notes.md) covers that properly; for now, just a function starting with `use` that calls `useRef`, which you also haven't met yet — see the hint) that returns how many times the calling component has rendered, **without causing any extra renders itself**.

```tsx
function ProfileCard() {
  const renderCount = useRenderCount();
  // ...
  return <p>This component has rendered {renderCount} times.</p>;
}
```

Then build `Ex5.tsx`: a component using `useRenderCount`, with a text field, a counter button, and a **totally unrelated** sibling component also using `useRenderCount`. Use it to answer, with evidence from the numbers on screen (not just a guess):

1. Does typing in the text field bump the counter component's render count?
2. Does clicking the counter button bump the text field component's render count?
3. What does `<StrictMode>` do to these numbers on the very first render, compared to later ones?
4. If you wrap one of the two components in `React.memo` (skim ahead to [chapter 27](../27-performance/notes.md) if you want the one-line version: `export default memo(ProfileCard)`), does its render count change when its sibling's state changes?

Write your answer to each as a comment, with the actual numbers you saw.

<details>
<summary>Hint 1</summary>

You need something that survives across renders **without** itself triggering a re-render when it changes — which rules out `useState`. That's exactly what a ref is for, and you're about to meet them properly in [chapter 19](../19-refs/notes.md). For now:

```tsx
import { useRef } from "react";

function useRenderCount() {
  const count = useRef(0);
  count.current = count.current + 1;
  return count.current;
}
```

</details>

<details>
<summary>Hint 2</summary>

For question 3, remember StrictMode double-invokes your component's render in development. Watch what the count does on the very first paint versus what it does on a click afterwards — is the "extra" render a permanent, ongoing thing, or a one-off?

</details>
