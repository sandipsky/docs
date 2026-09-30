# 38 Accessibility: Exercises

**How to do these:**

- Most of these improve apps you've already built: the to-do app ([chapter 10](../10-project-todo-app/notes.md)), the recipe finder ([chapter 21](../21-project-recipe-finder/notes.md)), the bookstore ([chapter 29](../29-project-online-bookstore/notes.md)) and the task board ([chapter 37](../37-project-task-board/notes.md)). Exercise 2 uses your `playground`, in `src/ch38/ex2/`.
- **Before you change a project, commit it** (or copy the folder), so you can compare before and after.
- Install **NVDA** (free, from nvaccess.org), or use **Narrator** (**Ctrl + Windows + Enter**). Headphones help. Keep NVDA's Speech Viewer open while you're learning.
- Turn on the `jsx-a11y` plugin in each project's `.oxlintrc.json`, as in the notes, and run `npm run lint`.
- An exercise is done when it works in the browser **with the keyboard alone**, VS Code shows no red squiggles, `npx tsc -b` prints nothing, `npm run lint` shows no accessibility warnings you can't explain, and the Console has no unexpected errors.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Unplug your mouse

Your chapter 10 to-do app looks finished. Time to find out whether it is.

1. Put your mouse out of reach. Using only the keyboard, add three tasks, tick one off, delete one, try each filter, and use **Clear completed**. (Include dark mode and editing, if you did those stretch goals.)
2. Write down every problem in a comment at the top of `App.tsx`: what you did, what happened, and what should have happened. Aim for at least three. Pay special attention to anything that **disappears right after you press it**.
3. Run **Lighthouse** (Accessibility only) and add anything new it finds to your list.
4. Turn on NVDA or Narrator, and Tab to the filter buttons. Without looking at the screen, can you tell which filter is selected? If not, add that to the list.
5. Fix every problem on your list.
6. Do the whole keyboard walk again, from the start. Then write one sentence: which problem would you never have found with a mouse?

<details>
<summary>Hint 1</summary>

When a task's delete button disappears, focus drops to `<body>`. Something that's always on the page makes a safe landing spot, like the "New task" input or a heading with `tabIndex={-1}`. A ref ([chapter 19](../19-refs/notes.md)) gets you there. The same problem hides in at least two other places in this app. Look for other things that vanish when you use them.

</details>

<details>
<summary>Hint 2</summary>

The selected filter only *looks* different, because of a CSS class. Ears can't see classes. Which ARIA state from the notes means "this toggle is on"? And if Lighthouse flags contrast, the fix lives in `--text-muted` in `index.css` (check dark mode too, if you built it).

</details>

---

## Exercise 2 (Easy): Fix the broken book card

Someone wrote this card in a hurry. It looks fine. It has **at least six** accessibility problems.

In `src/ch38/ex2/`, create `BookCard.tsx` with this code, and render it from `Ex2.tsx` under an `<h1>Books</h1>`:

```tsx
import { useState } from "react";

type BookCardProps = {
  title: string;
  price: number;
  cover: string;
  isSaved: boolean;
  onAdd: () => void;
  onToggleSave: () => void;
};

export function BookCard({ title, price, cover, isSaved, onAdd, onToggleSave }: BookCardProps) {
  const [email, setEmail] = useState("");
  const [hasError, setHasError] = useState(false);

  return (
    <div className="card">
      <img src={cover} />
      <h4>{title}</h4>
      <p>£{price.toFixed(2)}</p>
      <div className="btn" onClick={onAdd}>Add to cart</div>
      <button onClick={onToggleSave}>{isSaved ? "♥" : "♡"}</button>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          setHasError(!email.includes("@"));
        }}
      >
        <input
          placeholder="Email me when the price drops"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          style={{ borderColor: hasError ? "red" : "#ccc" }}
        />
        <button>Notify me</button>
      </form>
    </div>
  );
}
```

1. **Before changing anything**, list every problem you can find, as comments. For each one, write who it hurts: a keyboard user, a screen reader user, a colour-blind user, or someone else.
2. Run `npm run lint` with `jsx-a11y` on. Which of your problems did it catch? Which did it miss? Write that down too.
3. In `BookCard.test.tsx`, write tests that **fail right now**, all using `getByRole` with a name: the Add to cart button, the save button (with a name that includes the book's title), the email box (found by its label), and the title as a heading with `level: 2`. Add one more: after an invalid submit, the email box `toHaveAccessibleDescription` with your error text.
4. Fix the component until every test passes. Don't change the tests to make them pass.
5. Tab through the card, then listen to it with a screen reader. Does it make sense without seeing it?

<details>
<summary>Hint 1</summary>

For the image, decide first: is the cover decorative here, or does it tell you something the text next to it doesn't? The notes (and the bookstore's starter README) have an opinion. If you choose `alt=""`, notice that `queryByRole("img")` then finds nothing. An image with an empty `alt` is left out of what screen readers get.

</details>

<details>
<summary>Hint 2</summary>

For the heart, the notes give you two honest options: a fixed name like "Save Dune for later" with `aria-pressed`, or a name that changes. Pick one, not both. With the first option, a test can even check the state: `getByRole("button", { name: /save dune/i, pressed: true })`.

</details>

---

## Exercise 3 (Medium): A real dialog for the recipe finder

Replace the recipe finder's hand-built modal with the native `<dialog>`.

1. Build the typed `Modal` from the notes in `src/components/Modal.tsx`: a `<dialog>`, `showModal()` through a ref, and a name from `aria-labelledby` with `useId()`.
2. Use it for the recipe details. Delete the `modal-overlay` div; the dialog's `::backdrop` replaces it. (While the details load, the dialog still needs a title. Try it with the Network tab throttled.)
3. Check each of these with the keyboard only:
   - Opening a card puts focus on the dialog's close button.
   - Tab never reaches the cards behind the dialog.
   - **Escape** closes it.
   - After it closes, focus is back on the card you opened, and Tab carries on to the next card.
4. Check it with a screen reader. It should announce the recipe's name and "dialog". Press **H** in NVDA while the dialog is open: can you reach any heading behind it?
5. If you did [chapter 21's exercise 4](../21-project-recipe-finder/exercises.md) by hand, delete the code that `<dialog>` now does for you. Write in a comment how many lines went.
6. Write one test: clicking a card opens a dialog named after the recipe (`findByRole("dialog", { name: ... })`), and clicking the close button removes it.

<details>
<summary>Hint 1</summary>

The starter CSS was written for a `<div>`. On a `<dialog>` you'll probably need `border: none` (browsers give dialogs a default border), and `position: fixed` instead of `.modal`'s `position: relative`, or the dialog can end up in the wrong place when the page is scrolled. Style the dark background with `.modal::backdrop`.

</details>

<details>
<summary>Hint 2</summary>

If focus doesn't come back to the card, check how the modal closes. Does *every* path go through `dialog.close()` (or the browser's own Escape), so the `close` event fires? If the parent simply stops rendering the dialog, the browser never closes it properly.

</details>

<details>
<summary>Hint 3</summary>

At the time of writing, jsdom (the pretend browser your tests run in) doesn't implement `showModal()` or `close()`, so the test crashes with an error saying `showModal` is not a function. A small stand-in in `src/test-setup.ts` gets you going:

```ts
HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
  this.setAttribute("open", "");
};
HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
  this.removeAttribute("open");
  this.dispatchEvent(new Event("close"));
};
```

It's only a stand-in: it doesn't keep focus inside or handle Escape. You check those by hand, in a real browser.

</details>

---

## Exercise 4 (Medium): Speak up, bookstore

Make the bookstore tell screen reader users what sighted users can see.

1. When any **Add to cart** button is pressed, on any page, politely announce `Added Dune to your cart`. The announcing region lives in `Layout`, is always rendered, and is `visually-hidden`.
2. Add the same book twice. The second press must be announced too.
3. Make `Showing 3 of 12 books` a polite status. Type in the search box with a screen reader on. If it's too chatty, announce from a debounced value.
4. Removing a book on the cart page announces `Removed Dune from your cart`, and focus lands somewhere sensible.
5. Make the checkout form's errors accessible: a `<label>` on every field, `aria-invalid`, `aria-describedby` pointing at each error, errors in words (not only colour), and focus on the first bad field when a submit fails.
6. The promo code message (`Code applied` or `That code isn't valid`) is announced when it appears.
7. Test it all with NVDA or Narrator. Write down exactly what it said for steps 1, 3 and 5.
8. Add tests: after adding a book, the `status` role has the right text; after an invalid checkout submit, the email field `toHaveAccessibleDescription` with its error.

<details>
<summary>Hint 1</summary>

Lots of components need to announce things, but the region should live in one place. That's a job for context ([chapter 22](../22-context/notes.md)): an `AnnouncerProvider` holding the message, with an `announce(text)` function any component can call, and a guard hook like the ones you've written before.

</details>

<details>
<summary>Hint 2</summary>

For step 2: if the text doesn't change, nothing is announced. Including the new quantity ("Added Dune. 2 in your cart.") changes it.

</details>

<details>
<summary>Hint 3</summary>

For step 6: is a wrong promo code urgent enough to interrupt someone mid-sentence? Decide between `role="status"` and `role="alert"`, and remember the rule about the region being on the page before its text changes.

</details>

---

## Exercise 5 (Challenge): A full audit

Take your **task board** from [chapter 37](../37-project-task-board/notes.md), or the bookstore, and audit it the way a professional would.

1. **Keyboard walk:** every flow, no mouse.
2. **Screen reader walk:** jump through the headings with **H**, the landmarks with **D**, and open the elements list with **Insert + F7**. Does the outline make sense? Does every button's name say what it does?
3. **Tools:** run Lighthouse and axe DevTools on every page, and `npm run lint` with `jsx-a11y` on.
4. Record every problem in a table in a new `a11y-audit.md` in the project: the problem, who it affects, and **which check found it** (keyboard, screen reader, Lighthouse, axe, lint, or a test).
5. Fix the **five most harmful** problems. Rank by harm: "can't do the task at all" beats "confusing", which beats "annoying".
6. Move focus to each page's `<h1>` on route change, and give every page its own `<title>`.
7. On the task board, move a card to another column using only the keyboard. Where does focus go afterwards? It should stay with the card (on its button in the new column, for example), and the move should be announced, like `Moved "Write tests" to Done`.
8. Finish with a short paragraph: how many problems did the tools find, and how many only a person found? Does that match the warning in the notes?

<details>
<summary>Hint 1</summary>

When a card moves column, React renders it in a different list, so it's a brand-new element and focus is lost. Remember the moved card's id, and once the new render is on the page, focus that card's button. An effect that runs when the id changes (like chapter 19's "focus after render" example) does it.

</details>

<details>
<summary>Hint 2</summary>

If your task board uses TanStack Router ([chapter 36](../36-tanstack-router/notes.md)), it has its own `useLocation()` hook. Import it from `@tanstack/react-router`, and the notes' route-change pattern works the same way.

</details>

---

## When you're done

That's the first chapter of Level 5. From now on, "works with a keyboard and a screen reader" is part of "done", just like "the tests pass". When [chapter 40](../40-deploying/notes.md) puts your apps online, run Lighthouse and axe again on the live sites. And make accessibility part of the plan for your [final project](../41-final-project/notes.md) from day one, when it's cheap.
