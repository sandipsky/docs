# 22 Context: Exercises

**How to do these:**

- Work in your practice app, one folder per exercise: `src/ch22/ex1/`, and so on.
- Put each context in its own file, with its own guard hook, from the very first exercise. It's six lines and it's the habit worth building.
- Use the **Components** tab to check the provider is where you think it is — context bugs are nearly always "the provider isn't above the consumer."
- An exercise is done when the behaviour is correct, VS Code shows no red squiggles, `npx tsc -b` prints nothing, and the Console is empty.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Feel the drilling, then fix it

Build this **deliberately badly** first, in `src/ch22/ex1/`, so the fix means something.

Five components, each in its own file, nested five deep: `Ex1` → `Page` → `Sidebar` → `SettingsPanel` → `FontSizeControl`. Only the last one uses anything.

1. Put `fontSize` state (a number, 12–32) in `Ex1`, and drill it — plus a setter — all the way down through every layer as props. `FontSizeControl` renders `+` and `−` buttons. `Ex1` renders a paragraph whose `style` uses the size, so you can see it working.
2. Count how many of the five components mention `fontSize` in their props type. Write the number in a comment.
3. Now add a **second** thing the control needs — a `fontFamily` string — and drill that too. How many files did you have to edit?
4. Rewrite it with context: a `FontContext`, a `FontProvider`, and a `useFont` guard hook. `Page`, `Sidebar` and `SettingsPanel` should end up with **no props at all**.
5. Add a *third* setting (`fontWeight`). How many files this time?

<details>
<summary>Hint 1</summary>

Question 5 is the whole point of the exercise. With context, adding a setting touches the context type, the provider, and the one component that uses it — three files, no matter how deep the tree gets. Drilling touched every layer.

</details>

---

## Exercise 2 (Easy): The guard hook earns its keep

In `src/ch22/ex2/`, build a simple `UserContext` carrying `{ name: string; isLoggedIn: boolean }`, with a provider and a `useUser` hook.

Then break it on purpose and write down exactly what happens each time:

1. Render a component that calls `useUser` **outside** the provider, with the context defaulted to `null` and **no** guard hook — just `useContext(UserContext)` directly. What does TypeScript say when you try to read `user.name`? What happens at runtime if you force it through with `!`?
2. Now add the guard hook that throws. Render the same component outside the provider again. What's the error, and where in DevTools does it point you?
3. Finally, try it with a **fake default** instead — `createContext<UserValue>({ name: "", isLoggedIn: false })` and no guard. Render outside the provider. What happens now, and why is this the most dangerous of the three?

Write a one-paragraph comparison at the bottom of the file.

<details>
<summary>Hint 1</summary>

For question 3: nothing crashes. The component renders happily, showing a logged-out user, and you have no indication whatsoever that you forgot the provider. That's a bug that ships.

</details>

---

## Exercise 3 (Medium): Theme, properly

In `src/ch22/ex3/`, build a complete theming setup, the way you would in a real app.

1. `ThemeContext.ts`: a `Theme = "light" | "dark"`, a context typed `ThemeContextValue | null`, and a `useTheme` guard hook.
2. `ThemeProvider.tsx`: holds the state, persists it to `localStorage` with your `useLocalStorage` hook from [chapter 20](../20-custom-hooks/notes.md), and provides `{ theme, toggleTheme }`.
3. A page at least three components deep, where **two** widely separated components read the theme: a `ThemeToggle` button in a header, and a `Card` deep inside the content that styles itself from the theme.
4. The provider applies the theme by putting a class on a wrapping `<div>`, with CSS variables doing the actual colour work ([chapter 15](../15-styling/notes.md)).
5. Refresh the page — the theme persists, and neither the header nor the card needed a single prop.

Then answer in a comment: `ThemeProvider` uses `useLocalStorage`, which is a custom hook, inside a component that provides a context. Is that a problem? Why or why not?

<details>
<summary>Hint 1</summary>

For the last question — no, it's completely normal, and worth understanding why. A provider is just a component. It can use any hook any other component can. Context and custom hooks solve different problems (delivery vs. reusable logic) and combine freely.

</details>

---

## Exercise 4 (Medium): Two contexts, and proving why

This exercise makes the "split by what changes together" rule visible rather than theoretical.

In `src/ch22/ex4/`, build a small app with a theme **and** a click counter that updates frequently.

**Part 1: one context.** Put both in a single `AppContext` providing `{ theme, toggleTheme, count, increment }`. Build two consumers: `ThemeLabel` (reads only `theme`) and `CountLabel` (reads only `count`). Put a `console.log("ThemeLabel rendered")` in the first.

Click the increment button ten times. How many times did `ThemeLabel` render? Was the theme involved at all?

**Part 2: two contexts.** Split them into `ThemeContext` and `CounterContext`, with separate providers, nested. Click increment ten times again. How many times does `ThemeLabel` render now?

**Part 3:** Write down the render counts from both parts, and explain in two or three sentences what rule you just demonstrated.

<details>
<summary>Hint 1</summary>

You can use your `useRenderCount` hook from [chapter 12's exercises](../12-how-rendering-works/exercises.md) instead of `console.log` if you'd rather see the number on the page.

</details>

<details>
<summary>Hint 2</summary>

Remember that StrictMode doubles render counts in development. That's fine — compare Part 1's number against Part 2's, rather than treating either as an absolute.

</details>

---

## Exercise 5 (Challenge): A toast notification system

Toasts — those small messages that slide in saying "Saved!" or "Something went wrong" — are the textbook case for context: **any** component, anywhere, needs to be able to trigger one, and none of them should have to receive a prop to do it.

In `src/ch22/ex5/`, build:

**`ToastContext.ts`** — a context providing one function:

```ts
type ToastContextValue = {
  showToast: (message: string, kind: "success" | "error") => void;
};
```

Plus a `useToast` guard hook.

**`ToastProvider.tsx`** — holds an array of active toasts in state, provides `showToast`, and renders the toasts themselves in a fixed-position stack, on top of `children`.

**A test page** with at least three completely unrelated components scattered at different depths — a form, a delete button, a settings panel — each calling `useToast()` and triggering different messages. None of them may take a toast-related prop.

Requirements:

1. Each toast has a unique id (`crypto.randomUUID()`), a message, and a kind.
2. Toasts stack — trigger three quickly and see three, in order.
3. Each toast disappears on its own after 4 seconds, and can also be dismissed early with an `×`.
4. Each toast's timer is cleaned up properly if it's dismissed early, or if the provider unmounts — no timers left running for toasts that are already gone.
5. The toast components themselves never mutate the array — adding and removing both follow [chapter 11](../11-updating-objects-and-arrays/notes.md).

<details>
<summary>Hint 1</summary>

The self-dismissing timer is the interesting part. Putting a `setTimeout` inside `showToast` works, but cleaning it up is awkward. A neater design: each rendered `<Toast>` owns its own effect with a `setTimeout` that calls `onDismiss(id)`, and a cleanup that clears it ([chapter 17](../17-effects/notes.md)). Then requirement 4 comes free — unmounting the toast unmounts its timer.

</details>

<details>
<summary>Hint 2</summary>

`showToast` is recreated on every render of `ToastProvider`, which means the context value changes every render. In an app this small it doesn't matter. If you want to do it properly, `useCallback` is [chapter 27](../27-performance/notes.md) — it's a reasonable time to skim ahead, but don't let it block you finishing the feature.

</details>

<details>
<summary>Hint 3</summary>

Use the updater form when adding a toast — `setToasts((prev) => [...prev, newToast])`. Three toasts triggered in quick succession from different components is exactly the situation where reading a stale `toasts` would lose one ([chapter 12](../12-how-rendering-works/notes.md)).

</details>
