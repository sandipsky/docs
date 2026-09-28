# 17 Effects: Exercises

**How to do these:**

- Work in your practice app, one folder per exercise: `src/ch17/ex1/`, and so on.
- **Watch the Console for effect and cleanup messages, not just the page.** Add a `console.log` at the top of every effect and every cleanup function while you build these — seeing the order they fire in is most of what this chapter teaches.
- An exercise is done when the behaviour is correct, the Console shows the right sequence of messages (no duplicates that shouldn't be there, no missing cleanup), VS Code shows no red squiggles, and `npx tsc -b` prints nothing.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Three dependency arrays

In `src/ch17/ex1/Ex1.tsx`, build a component with two independent counters, `countA` and `countB`, each with its own `+1` button.

1. Add `useEffect(() => console.log("no array"))` — no dependency array at all.
2. Add `useEffect(() => console.log("empty array"), [])`.
3. Add `useEffect(() => console.log("watching A"), [countA])`.

Click each button several times, alternating between them, and answer in a comment:

4. Which effect(s) fire when you click A's button? Which fire when you click B's?
5. Does "empty array" ever fire more than once, no matter what you click?
6. Does "no array" fire on a click of **either** button? Why does that make it a poor choice for most real effects?

<details>
<summary>Hint 1</summary>

Remember every click that changes state causes the whole component to re-render, whichever button was clicked. "No array" and "watching A" both react to *every* render, just for different reasons — read the notes on what an empty array versus no array versus a filled array each actually promise.

</details>

---

## Exercise 2 (Easy): Document title sync

In `src/ch17/ex2/Ex2.tsx`, build a simple counter, and use an effect to keep the browser tab's title in sync: `Count: 3`.

1. Click the button a few times and watch the actual browser tab, not just the page.
2. Add a second, completely unrelated piece of state — a text input for a name, say — with its own effect-free `<p>{name}</p>` display. Confirm typing in it does **not** cause the title effect to log again (add a `console.log` inside the effect to check).
3. Deliberately leave `count` out of the dependency array and observe the tab title get stuck. Put it back.
4. In a comment, explain why this is a textbook case for an effect rather than something to calculate directly in the JSX — what's actually "outside React" here that JSX can't reach on its own?

<details>
<summary>Hint 1</summary>

`document.title = ...` is changing something in the browser that exists completely outside anything React renders — there's no JSX for a browser tab. That's the signal that this belongs in an effect rather than being calculated during render.

</details>

---

## Exercise 3 (Medium): Build a leaking timer, then fix it

In `src/ch17/ex3/Ex3.tsx`:

```tsx
function Ex3() {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
  }, [isRunning]);

  return (
    <div>
      <p>{seconds} seconds</p>
      <button onClick={() => setIsRunning(!isRunning)}>
        {isRunning ? "Pause" : "Resume"}
      </button>
    </div>
  );
}
```

1. Run it. Click **Pause**, then **Resume**, then **Pause** again, several times, fairly quickly. Watch the number. What goes wrong, and why — connect it explicitly to the missing piece from the notes.
2. Fix it with a proper cleanup function.
3. After fixing it, click Pause/Resume rapidly again, ten or more times. Confirm the seconds count now goes up at a completely steady, correct rate regardless of how much you clicked.
4. There's a second bug: **Pause doesn't actually pause anything** — the timer never stops, it just keeps setting `seconds`, even while paused. Fix this too, using `isRunning` inside the effect (you may need to add it to the dependency array if it's not already effectively covered — think about what "effectively covered" even means here).

<details>
<summary>Hint 1</summary>

For question 1: every time `isRunning` changes, this effect runs *again*, starting a brand-new interval — and the old one is never stopped. Toggle it five times and you have five intervals all firing at once.

</details>

<details>
<summary>Hint 2</summary>

For question 4, the simplest fix is an early return inside the effect: if `isRunning` is `false`, don't start an interval at all, just return with nothing scheduled (and nothing to clean up).

</details>

---

## Exercise 4 (Medium): The race condition, caught in the act

This exercise makes a race condition happen on purpose, with a fake, slow "API," so you can watch the wrong data win.

In `src/ch17/ex4/`, start with `fakeApi.ts`:

```ts
export function fetchUser(id: string): Promise<{ id: string; name: string }> {
  // id "1" is deliberately slow, id "2" is fast — so requesting 1 then 2 quickly
  // means 2's response can arrive BEFORE 1's.
  const delay = id === "1" ? 2000 : 200;
  const name = id === "1" ? "Slow Sam" : "Fast Fiona";

  return new Promise((resolve) => {
    setTimeout(() => resolve({ id, name }), delay);
  });
}
```

Build `Ex4.tsx`: two buttons, **Load user 1** and **Load user 2**, and a component showing whichever user was last requested, using `fetchUser` inside a `useEffect` keyed on a `userId` piece of state.

1. Build the **broken** version first — no `ignore` flag, nothing guarding against a stale response.
2. Click **Load user 1**, then *immediately* click **Load user 2** (within the same second). Watch what the page ends up showing after both requests have had time to finish. Is it correct?
3. Fix it with the `ignore` flag pattern from the notes.
4. Repeat the same rapid double-click test. Confirm it now always ends up showing Fiona (the last one you actually asked for), no matter how the delays land.
5. Log a message from inside the cleanup function so you can see, in the Console, exactly when the stale request for Sam gets its response ignored.

<details>
<summary>Hint 1</summary>

The effect depends on `userId`. Clicking the second button changes `userId`, which runs the cleanup for the *first* effect (setting its `ignore` to `true`) before starting the new one — even though the first request's `.then()` hasn't resolved yet. When it finally does resolve, its own `ignore` check stops it from calling `setUser`.

</details>

---

## Exercise 5 (Challenge): An effect that shouldn't be one

This one is about **removing** an effect, which is a skill in its own right.

In `src/ch17/ex5/Ex5.tsx`, start from this deliberately over-engineered component:

```tsx
type Item = { id: string; name: string; price: number; quantity: number };

function ShoppingCart({ items }: { items: Item[] }) {
  const [itemCount, setItemCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [isEmpty, setIsEmpty] = useState(true);
  const [mostExpensive, setMostExpensive] = useState<Item | null>(null);

  useEffect(() => {
    setItemCount(items.reduce((sum, item) => sum + item.quantity, 0));
  }, [items]);

  useEffect(() => {
    setTotal(items.reduce((sum, item) => sum + item.price * item.quantity, 0));
  }, [items]);

  useEffect(() => {
    setIsEmpty(items.length === 0);
  }, [items]);

  useEffect(() => {
    if (items.length === 0) {
      setMostExpensive(null);
      return;
    }
    const sorted = [...items].sort((a, b) => b.price - a.price);
    setMostExpensive(sorted[0]);
  }, [items]);

  return (
    <div>
      {isEmpty ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <p>{itemCount} items — ${total.toFixed(2)}</p>
          <p>Most expensive: {mostExpensive?.name}</p>
        </>
      )}
    </div>
  );
}
```

1. Add a `console.log("ShoppingCart rendered")` at the top of the component, above every hook. Add a few items via a parent component's state and watch how many times `ShoppingCart` renders for **one** change to `items`. Write the number down, and explain in a comment why it's more than one.
2. Rewrite the whole component with **zero** `useEffect` calls and **zero** extra `useState` calls beyond what's genuinely needed — which, once you're done, should be none at all beyond the `items` prop itself. Every value shown should be calculated directly during render.
3. Confirm the render count from question 1, repeated on your new version, is now exactly one per change to `items`.
4. In a closing comment, state the general rule this exercise was built to teach, in one or two sentences, using the words "render" and "effect."

<details>
<summary>Hint 1</summary>

Every one of these four `useEffect` calls is the "calculating something you already have everything you need for" mistake from the notes, four times over. None of them touch anything outside React — they only ever read `items`, which is already sitting right there as a prop.

</details>

<details>
<summary>Hint 2</summary>

For question 1's render count: the *first* render shows the default state (`itemCount: 0`, `total: 0`, etc.) while `items` already has real data in it — briefly showing wrong numbers — and then each of the four effects fires afterwards, each one calling its own `set`, potentially causing further renders on top of that. Watching it directly is far more convincing than being told the number.

</details>
