# 27 Performance: Exercises

**How to do these:**

- Work in your practice app, one folder per exercise: `src/ch27/ex1/`, and so on.
- **Every exercise here requires numbers, not opinions.** Record actual measurements from the React DevTools Profiler before and after each change. "It feels faster" is not an answer in this chapter.
- Turn on **"Record why each component rendered"** in the Profiler's settings (the gear icon) before you start. It's the single most useful setting in the tool.
- Remember StrictMode double-renders in development. Compare before-and-after numbers with each other, not against an absolute.
- An exercise is done when you have measurements showing whether your change helped, VS Code shows no red squiggles, and `npx tsc -b` prints nothing.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Learn to read the Profiler

In `src/ch27/ex1/`, build a page with a search input and a list of 200 generated items (`Array.from({ length: 200 }, (_, i) => ({ id: String(i), name: `Item ${i}` }))`), rendered by an `ItemRow` component. Include a `Sidebar` component that takes no props and renders some static text.

1. Open the Profiler, record, type five characters in the search box, and stop.
2. Answer from the flame graph: how many components rendered per keystroke? Did `Sidebar` render? Did every `ItemRow`?
3. Click on `Sidebar` in the profiler and read **why** it rendered. Write down the exact wording React gives you.
4. Now do the same on a production build (`npm run build && npm run preview`, then profile there). How do the timings compare with the dev build?
5. Finally: was any of this actually slow enough for a user to notice? Write an honest yes or no with the millisecond figure that justifies it.

<details>
<summary>Hint 1</summary>

Question 5 is the real exercise. At 200 rows, on a modern machine, the answer is almost certainly "no" — and the correct response to that is to change nothing. Learning to stop here is the skill most React developers skip.

</details>

---

## Exercise 2 (Easy): Make `memo` fail

In `src/ch27/ex2/`, take exercise 1's list and try to optimise it — badly, on purpose, first.

1. Wrap `ItemRow` in `memo`. Profile again. Did the number of rendering rows go down?
2. It didn't — because the parent passes `onSelect={(id) => console.log(id)}` inline. Confirm this by reading "why did this render" on an `ItemRow`.
3. Fix it with `useCallback` in the parent. Profile again and record the new number of rendering rows per keystroke.
4. Now break it again in a different way: pass `style={{ padding: 4 }}` inline to each row. Profile. What happened, and why?
5. Fix that too, by hoisting the object outside the component. Confirm with a final profile.
6. Write a sentence describing the rule that connects steps 2, 4 and 5.

<details>
<summary>Hint 1</summary>

Both failures are the same rule from [chapter 11](../11-updating-objects-and-arrays/notes.md): an object or function literal creates a **new reference** every render, and `memo` compares by reference. Content being identical is irrelevant.

</details>

---

## Exercise 3 (Medium): The structural fix beats memoisation

This exercise makes the notes' central claim concrete.

In `src/ch27/ex3/`, build the "slow" version deliberately:

```tsx
function Ex3() {
  const [query, setQuery] = useState("");

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <p>Searching for: {query}</p>
      <HugeList />      {/* 1000 rows, each doing a small amount of pointless work */}
    </div>
  );
}
```

Give each row a deliberately slow render (a loop summing to 100,000, say) so the problem is real and measurable.

1. Profile typing five characters. Record the total render time per keystroke.
2. **Fix it with memoisation**: `memo(HugeList)`. Profile again, record the number.
3. **Now throw that away** and fix it structurally instead: move `query` state into its own `SearchBox` component so the input owns it, and `HugeList` is a sibling that never re-renders. No `memo` anywhere. Profile, record the number.
4. **Third approach**: revert to the original structure, but pass `<HugeList />` as `children` to a component that holds the state. No `memo` anywhere. Profile, record.
5. Compare all four numbers in a table in a comment. Which approaches worked? Which was the least code? Which would be easiest for a colleague to accidentally break six months from now?

<details>
<summary>Hint 1</summary>

All three fixes should produce roughly the same render time. The interesting differences are in the *other* columns of your table: lines of code, and how easy it is to accidentally undo. The `memo` version breaks the moment someone adds an inline prop; the structural ones can't break that way.

</details>

---

## Exercise 4 (Medium): When `useMemo` earns its place, and when it doesn't

In `src/ch27/ex4/`, build a page with a large dataset — 5,000 records with a name, a category, and a number — plus a search box, a category filter, and a "sort by" selector.

1. Compute the filtered-and-sorted list **without** `useMemo`. Profile typing in the search box, and record the time.
2. Add an unrelated piece of state — a counter button that has nothing to do with the list. Click it while profiling. Does the expensive sort run again? Should it?
3. Wrap the computation in `useMemo` with the right dependencies. Profile the counter button again. What changed?
4. Now profile typing in the **search box** again. Did `useMemo` help there? Why or why not?
5. Deliberately leave one dependency out of the array (drop `sortBy`). What breaks, and does anything warn you?
6. Finally, add a `useMemo` around something trivial — `const doubled = useMemo(() => count * 2, [count])`. Profile. Is it faster, slower, or unmeasurable? Write down your conclusion about where the line sits.

<details>
<summary>Hint 1</summary>

Questions 2–4 together are the point. `useMemo` doesn't make the calculation faster — it makes it **not happen** when its inputs are unchanged. So it's a large win for the unrelated counter, and no win at all for typing in the search box, because typing genuinely does change the inputs.

</details>

---

## Exercise 5 (Challenge): Profile and fix a real app

Take your [chapter 21](../21-project-recipe-finder/notes.md) Recipe Finder, or your [chapter 24](../24-react-router/notes.md) exercise 5 app, and do a genuine optimisation pass — including being willing to conclude that nothing needs changing.

1. **Build for production** and profile three real interactions: typing in the search box, opening a recipe, and toggling a favourite.
2. For each, record: total render time, how many components rendered, and the top three slowest.
3. **Write down which, if any, are actually a problem**, with a threshold you've decided in advance (a common rule of thumb: anything under 16ms per interaction is imperceptible, since that's one frame at 60fps).
4. For anything over your threshold, find the cause using "why did this render" — and try a **structural** fix first.
5. Only if structure can't fix it, apply the minimum memoisation that does, and profile again to confirm it helped.
6. **Deliberately over-optimise**: now add `memo` to every component, `useCallback` to every handler, and `useMemo` to every derived value in the app. Profile the same three interactions. Record the numbers.
7. Write a short conclusion comparing step 5 and step 6. Include your view on readability, not just speed.

Then a last one, for honesty:

8. If your measurements in step 3 showed nothing over the threshold, say so plainly and revert everything. That's a completely valid — and common — outcome, and being able to reach it deliberately is the whole point of the chapter.

<details>
<summary>Hint 1</summary>

Step 6 usually produces numbers that are the same or very slightly *worse*, with considerably more code. That result is worth having in your own measurements rather than taking on trust — it's the strongest argument you'll ever have against reflexive memoisation in a code review.

</details>

<details>
<summary>Hint 2</summary>

If you want a bigger problem to find, temporarily seed the Recipe Finder with several hundred fake recipes rather than the handful an API search returns. Small apps often genuinely have no performance problem to fix, which makes step 8 the honest answer.

</details>
