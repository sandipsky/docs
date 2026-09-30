# 38 Accessibility

**Welcome to Level 5: Mastery.** In Levels 1 to 4 you learned to build real apps, with the tools real teams use. Level 5 is the last two steps: building apps that **everyone** can use, and shipping them for the world to see. This chapter is the first step. [Chapter 39](../39-nextjs-and-server-components/notes.md) meets a React framework, [chapter 40](../40-deploying/notes.md) puts your apps online, and [chapter 41](../41-final-project/notes.md) is a project of your own.

## What is it?

**Accessibility** means building apps that everyone can use, whatever their body or situation. It's often written **a11y**: an "a", then 11 letters, then a "y". "Everyone" includes people who:

- are blind and use a **screen reader**: a program that reads the page aloud (or sends it to a braille display) and lets them move around it with the keyboard.
- can't use a mouse, and use a keyboard, a switch, or their voice instead.
- have low vision and zoom right in, or are colour blind.
- have shaky hands, or cognitive differences like dyslexia or ADHD.

The rulebook most teams use is **WCAG**, the Web Content Accessibility Guidelines. The current version is **WCAG 2.2**. Each rule has a level: **A** (the basics), **AA** (the usual target) and **AAA** (the strictest). Most teams, and many laws, aim for **AA**.

**There's nothing to install.** This chapter uses React 19, plain HTML, a little CSS, and tools already in your browser. It's about using HTML and React *well*.

An honest note: accessibility is a big field, and one chapter can't cover all of it. This one covers what you'll use every week. And ten minutes with a real screen reader will teach you more than any checklist, including this one.

## Why does it matter?

**It's real people.** The World Health Organization estimates that about **1 in 6** people worldwide live with a significant disability. If your app doesn't work for them, it doesn't work.

**It's everyone, some of the time.** Disability isn't always permanent. (This idea comes from Microsoft's inclusive design guides.)

| Permanent | Temporary | Situational |
|---|---|---|
| One arm | A broken arm | Holding a baby |
| Blind | Blurry eyes after an eye test | Bright sunlight on your phone |
| Deaf | An ear infection | A noisy train, no headphones |

**It's often the law.** Many countries require it, and their laws usually point at WCAG AA. For example, the European Accessibility Act has covered many online shops and banking services in the EU since June 2025. The details vary by country.

**It makes things better for everyone.** The little ramps where a pavement meets the road are called **curb cuts**. They were built for wheelchairs, and they help people with prams, suitcases and bikes too. Software is full of this **curb-cut effect**: captions help people in noisy cafés, and clear labels help everyone.

**It's cheap now and expensive later.** Most accessibility comes free with the right HTML element. A `<button>` costs nothing extra on day one. Replacing 200 `<div onClick>`s a year later costs weeks.

## Real-world example

Think about a **public library that's been built well**.

| A building everyone can use | Your app |
|---|---|
| A ramp beside the steps | A real `<button>`: works with a mouse, a keyboard and a screen reader |
| Doors that open by themselves, for anyone | Native elements (`<button>`, `<label>`, `<dialog>`) that do the hard work |
| A sign on every door | A label on every input, a name on every button |
| Braille on the lift buttons | `alt` text on images, `aria-label` on icon buttons |
| The lift says "Third floor" | Live regions that announce "Added to cart" |
| You step out of the lift facing the right way | Focus management: after an action, focus lands somewhere sensible |

Nobody thinks of the ramp as "special". It's just part of a good building.

## How it works

### Semantic HTML first

**Semantic HTML** means using the element that says what a thing *is*. It's the biggest accessibility win there is, and it's free.

```tsx
// ❌ Looks like a button. Isn't one.
<div className="btn" onClick={handleAdd}>Add to cart</div>

// ✅ Is one.
<button type="button" className="btn" onClick={handleAdd}>Add to cart</button>
```

| A real `<button>` | A `<div onClick>` |
|---|---|
| You can reach it with **Tab** | Tab skips straight past it |
| **Enter** and **Space** press it | Only a mouse click works |
| A screen reader says "Add to cart, button" | It says "Add to cart", like any text |
| `disabled` works | There's no such thing |

To fake all that, a div needs `role="button"`, `tabIndex={0}`, and an `onKeyDown` that handles Enter and Space. On every single one. People usually reach for a div because buttons come with browser styling, so reset the styling instead: `background: none; border: none; padding: 0; font: inherit; color: inherit;`.

**Link or button?** If it **goes somewhere** (the URL changes), it's a `<Link>` ([chapter 24](../24-react-router/notes.md)). If it **does something** on this page, it's a `<button>`. Screen reader users hear which one it is, and expect it to act that way.

This is also the **first rule of ARIA**. **ARIA** (Accessible Rich Internet Applications) is a set of attributes, `role` and the `aria-*` ones, that tell assistive technology what something is or what state it's in. The rule: **if a native HTML element can do the job, use it instead of ARIA.** ARIA only changes what's *announced*. It adds no behaviour. `role="button"` doesn't make a div work with Enter.

### Headings, lists and landmarks

A sighted person scans a page. A screen reader user jumps around it using its structure. WebAIM's well-known survey of screen reader users keeps finding that jumping from heading to heading is the most popular way to find things. So:

- **One `<h1>` per page**, saying what the page is.
- **Heading levels in order**, like a book's chapters and sections. Don't jump from `<h2>` to `<h4>` because the `<h4>` "looked the right size". Pick the level for its meaning, and set the size in CSS.
- **Lists are `<ul>` or `<ol>`.** A screen reader says "list, 12 items" before you start.
- **Landmarks** mark the big regions, so people can jump straight to them:

```tsx
<header className="site-header">
  <Link className="shop-name" to="/">Paper & Ink</Link>
  <nav aria-label="Main">{/* NavLinks */}</nav>
</header>
<main id="main-content">{/* the page */}</main>
<footer>© Paper & Ink</footer>
```

Many sites also add a **skip link** as the very first thing on the page: `<a href="#main-content">Skip to main content</a>`, hidden until it gets focus. Keyboard users can then jump past the nav instead of tabbing through it on every page.

### Names for everything

Every input and every button needs a **name**: the words a screen reader says for it. Tests find things by the same name, which is why `getByRole("button", { name: "Delete" })` worked in [chapter 28](../28-testing/notes.md).

**Inputs get a `<label>`,** as you've done since [chapter 09](../09-forms/notes.md). But in a **reusable** component, a hard-coded `id="email"` breaks as soon as there are two on one page, because ids must be unique. React's `useId()` makes a unique one for each use:

```tsx
import { useId } from "react";

type TextFieldProps = { label: string; value: string; onChange: (value: string) => void };

function TextField({ label, value, onChange }: TextFieldProps) {
  const id = useId(); // a different id every place TextField is used

  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <input id={id} value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}
```

**A placeholder is not a label.** Here's the full picture [chapter 10](../10-project-todo-app/notes.md) promised. A placeholder vanishes the moment someone types, so they have to remember what the box was for. It's usually pale grey and hard to read. And screen readers don't reliably announce it.

**When there's no room for a visible label,** keep a real one and hide it visually, with the `visually-hidden` class from your starter CSS:

```css
/* On screen: gone. For screen readers: still there. */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%); /* squashed to one pixel, then clipped to nothing */
  white-space: nowrap;
  border: 0;
}
```

Why not `display: none`? Because that hides it from screen readers too (there's a table on this below).

**Icon-only buttons need `aria-label`.** A screen reader reads `✕` as something like "times" or "multiplication x", depending on the screen reader. Neither says what the button does, or to what:

```tsx
// ❌ "times, button". Five of these in a cart all sound the same.
<button type="button" onClick={() => onRemove(item.bookId)}>✕</button>

// ✅ "Remove Dune from cart, button"
<button type="button" aria-label={`Remove ${item.title} from cart`} onClick={() => onRemove(item.bookId)}>✕</button>
```

Put the item's name in the label. Screen reader users can list every button on a page, and "Remove, Remove, Remove" is no help. You did this for chapter 10's `×` and [chapter 21](../21-project-recipe-finder/notes.md)'s ♡.

Emoji are read aloud too: `📚 Paper & Ink` becomes "books Paper & Ink". Hide decoration with `<span aria-hidden="true">📚</span>`. And when a button *has* visible words, its name should contain them. `<button aria-label="Close">Cancel</button>` confuses voice-control users, who say "click Cancel" and find nothing with that name.

**Images need `alt` text** that says what matters about the image, in its place on the page:

```tsx
<img src="/shop.jpg" alt="Our shop front, with a reading nook in the window" /> {/* tells you something new */}
<img className="book-cover" src={book.cover} alt="" /> {/* repeats the text next to it: decorative */}
<Link to="/"><img src="/logo.svg" alt="Paper & Ink home" /></Link> {/* the only thing in a link */}

<img src={book.cover} /> {/* ❌ no alt: some screen readers read the file name instead */}
<img src={book.cover} alt="image" /> {/* ❌ says nothing: it already says "image" */}
```

`alt=""` isn't lazy. It's a deliberate "skip this". The bookstore's [starter README](../29-project-online-bookstore/starter/README.md) explains why the covers use it: the title is right there, so a cover `alt` would read the title twice.

### Keyboard access

Many people use only a keyboard. These are the keys they expect to work:

| Key | What it does |
|---|---|
| **Tab** / **Shift + Tab** | Move to the next / previous interactive thing |
| **Enter** | Follow a link, press a button, submit a form |
| **Space** | Press a button, tick a checkbox |
| **Arrow keys** | Move within a group: radio buttons, a `<select>`, a menu |
| **Escape** | Close or cancel: a dialog, a menu |

Real elements handle all of these. Your job is mostly not to break them.

**Keep focus visible.** The **focus ring** is the outline around whatever the keyboard is on. Without it, a keyboard user is like a mouse user with an invisible pointer.

```css
button:focus { outline: none; } /* ❌ the ring is gone, and nothing replaces it */

/* ✅ A clear ring. :focus-visible shows it for keyboard users, not after mouse clicks. */
a:focus-visible,
button:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}
```

The browser decides when `:focus-visible` applies: roughly, yes when you Tab to something, and usually no when you click a button. Your starter stylesheets from chapters 10, 21 and 29 already have rules like this.

**Keep the Tab order logical.** Tab follows the order of the HTML, not the order on screen. If CSS moves things around (flexbox `order`, `row-reverse`), focus jumps about. Keep the HTML in reading order.

**`tabIndex`** controls whether something can take focus:

| Value | Meaning | Use it for |
|---|---|---|
| `0` | "Put this in the normal Tab order" | Rarely: a custom widget with no native element |
| `-1` | "Not in the Tab order, but code can focus it" | Headings and regions you focus from code |
| `1` or more | "Jump the queue" | **Never.** It scrambles the order for the whole page |

### Focus management in React

In React, things appear and disappear all the time. Each time, ask: **where is focus now, and where should it be?**

**After deleting something.** A keyboard user presses a row's delete button. The row disappears, and so does the button they were on. Focus falls back to `<body>`, the top of the page. They have to Tab all the way back, and a screen reader may say nothing at all. So move focus yourself, with a ref from [chapter 19](../19-refs/notes.md):

```tsx
function CartPage() {
  const { items } = useCart();
  const dispatch = useCartDispatch();
  const headingRef = useRef<HTMLHeadingElement>(null);

  function handleRemove(bookId: string) {
    dispatch({ type: "removed", bookId });
    headingRef.current?.focus(); // the heading is already on the page, so this is safe
  }

  return (
    <section className="page">
      <h1 ref={headingRef} tabIndex={-1} className="page-title">Your cart</h1>
      {items.length === 0 ? <p>Your cart is empty.</p> : <ul className="cart-list">{/* rows */}</ul>}
    </section>
  );
}
```

In chapter 19, focusing had to wait for an effect, because the input didn't exist yet. Here the heading already exists, so the handler can focus it straight away. `tabIndex={-1}` is what lets a heading take focus. Focusing the next row's button would be even kinder, but takes more code. (You'll also *announce* "Removed Dune" in a moment.)

**After a route change.** On a normal website, clicking a link loads a new page, and the screen reader announces it and starts at the top. A **single-page app** (one that swaps content without loading a new page, which is what React Router does) gives no such signal. Focus stays on the link you clicked, and a screen reader user may not know anything changed. A common fix: give every page's `<h1>` `tabIndex={-1}`, and let the layout focus it.

```tsx
function Layout() {
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const previousPath = useRef(pathname);

  useEffect(() => {
    if (pathname === previousPath.current) return; // first load: leave focus alone
    previousPath.current = pathname;
    mainRef.current?.querySelector("h1")?.focus();
  }, [pathname]);

  return <main id="main-content" ref={mainRef}><Outlet /></main>; // plus your header and footer
}
```

That's chapter 19's "remember the previous value" ref, doing real work. Comparing paths (rather than using a "first render?" flag) also stops Strict Mode's double effects from stealing focus on the first load. Watching only `pathname` matters too: typing in the bookstore's search box changes `?q=`, and you don't want focus yanked out of the box. If a page is lazy-loaded, its heading may not exist yet when this runs; then let the page focus its own heading when it mounts. A focus ring on a heading can look odd, and since a heading can't be clicked, hiding it is fine: `h1[tabindex="-1"]:focus { outline: none; }`.

Give each page its own title too. In React 19 you can render `<title>Your cart | Paper & Ink</title>` inside any component, and React moves it into the `<head>` for you. It's the first thing a screen reader reads on a new tab.

### Dialogs, the easy way: `<dialog>`

[Chapter 21's exercise 4](../21-project-recipe-finder/exercises.md) asked you to make the recipe modal keyboard-friendly by hand: an Escape listener, focus in, focus back. Even with all that, Tab could wander onto the page *behind* the overlay, and a screen reader could still read it.

HTML now has an element that does all of this: **`<dialog>`**. Open it with `showModal()` and the browser:

- moves focus into the dialog,
- makes the rest of the page **inert** (it can't be clicked, tabbed to or read), so focus stays inside,
- closes it when someone presses **Escape**,
- in current browsers, puts focus back where it was (usually the opening button) when it closes,
- gives you a `::backdrop` to style as the dark background.

`showModal()` is a method on the real element, so you need a ref:

```tsx
// src/components/Modal.tsx
import { useEffect, useId, useRef, type ReactNode } from "react";

type ModalProps = { title: string; onClose: () => void; children: ReactNode };

export function Modal({ title, onClose, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  // Open as a modal as soon as this component is on the page.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
  }, []);

  return (
    <dialog ref={dialogRef} className="modal" aria-labelledby={titleId} onClose={onClose}>
      <button type="button" className="modal-close" aria-label="Close" onClick={() => dialogRef.current?.close()}>
        ✕
      </button>
      <h2 id={titleId} className="modal-title">{title}</h2>
      {children}
    </dialog>
  );
}
```

Using it is chapter 21's conditional rendering: `{details && <Modal title={details.name} onClose={() => setSelectedId(null)}>...</Modal>}`.

**How closing works:** Escape (the browser) and the Close button (`close()`) both close the dialog. That fires its `close` event, which calls `onClose`, which removes the component. One path, every time. So always close *through the dialog*. If the parent just stops rendering an open dialog, the browser never closes it properly, and can't put focus back.

- **Don't add a cleanup that calls `close()`.** In development, Strict Mode runs effects twice ([chapter 17](../17-effects/notes.md)), and that extra `close()` would fire `onClose` and shut the modal the moment it opened. The `!dialog.open` check makes the second run harmless.
- **Clicking the backdrop doesn't close it** by default. That's fine: Escape and a Close button are what matter. Newer browsers support a `closedby="any"` attribute for backdrop clicks; check support before relying on it.
- **`aria-labelledby`** names the dialog, so a screen reader says something like "Chicken Parmesan, dialog", and a test can use `getByRole("dialog", { name: "Chicken Parmesan" })`.

### Announcing changes: live regions

A sighted user presses **Add to cart** and sees "Cart (3)". A screen reader user presses it and hears nothing. Focus didn't move, so the screen reader had no reason to speak.

A **live region** is an element the screen reader watches. When its text changes, it reads the new text out:

```tsx
// Always on the page. Only the text inside changes.
<p role="status" className="visually-hidden">{announcement}</p>
```

- **`role="status"`** is **polite**: it waits until the screen reader finishes what it's saying. Use it for "Added Dune to your cart", "Saved", "3 results found". (`aria-live="polite"` is the plain-attribute version.)
- **`role="alert"`** is **assertive**: it interrupts. Keep it for urgent things, like "Payment failed".

Four rules make them work:

1. **The region must be on the page *before* the text changes.** `{message && <p role="status">{message}</p>}` appears and fills at the same moment, and is often missed. Render the `<p>` always, and change its text. (`role="alert"` is usually announced even when it appears with its text, but always-there is safest.)
2. **The same text twice is no change,** so it isn't announced. Add something that differs: "Added Dune. 2 in your cart."
3. **It can be visible.** The bookstore's count helps everyone: `<p className="result-count" role="status">Showing {visible.length} of {books.length} books</p>`.
4. **Don't overdo it.** If a count changes on every keystroke and gets chatty, announce a debounced value (your `useDebounce` from [chapter 20](../20-custom-hooks/notes.md)).

### Hiding things: who can still find them?

[Chapter 05](../05-conditional-rendering/notes.md) warned that screen readers "may still announce" things you hide with CSS. Now you can be exact. It depends *how* you hide it:

| How you hide it | Seen on screen? | Read by a screen reader? | Still in the HTML? |
|---|---|---|---|
| Not rendering it: `{show && <p>...</p>}` | No | No | No |
| `display: none`, or the `hidden` attribute | No | No | Yes |
| `visibility: hidden` | No (leaves a gap) | No | Yes |
| `opacity: 0` | No, but it still takes space and can still be clicked and tabbed to | **Yes** | Yes |
| Off screen, or `visually-hidden` | No | **Yes** | Yes |
| `aria-hidden="true"` | **Yes** | No | Yes |

So `display: none` hides things from everyone, and `opacity: 0` hides them from almost no one. Chapter 05's advice stands: not rendering is the default. Use `visually-hidden` for "screen readers only", and `aria-hidden="true"` for "eyes only" (decoration, like that 📚). Never put `aria-hidden="true"` on a button or anything else that takes focus. Keyboard users can still Tab to it, and the screen reader then says nothing.

### Accessible forms

Forms are where people most often get stuck. Put together what you have so far:

```tsx
const emailId = useId();
const errorId = useId();

<div className="form-field">
  <label htmlFor={emailId}>Email</label>
  <input
    id={emailId}
    type="email"
    required
    value={email}
    onChange={(event) => setEmail(event.target.value)}
    aria-invalid={emailError !== null}
    aria-describedby={emailError ? errorId : undefined}
  />
  {emailError && (
    <p id={errorId} className="field-error">
      <span aria-hidden="true">⚠ </span>
      {emailError}
    </p>
  )}
</div>
```

Tab into this box and a screen reader says something like "Email, edit, required, invalid entry, Enter an email like name@example.com".

- **`required`** is announced. Show it visually too, with the word "required" or an explained asterisk. (It also turns on the browser's own pop-up checks. To show only your own messages, put `noValidate` on the `<form>`; the field is still announced as required.)
- **`aria-invalid`** says "this one is wrong". **`aria-describedby`** points at the error's id, so it's read after the label. It can list several ids, separated by spaces: a hint *and* an error.
- **The error is in words**, not just a red border. The ⚠ is decoration, so it's hidden.
- **On submit, move focus to the first field with an error.** [React Hook Form](../33-react-hook-form/notes.md) does this for you by default. By hand, it's a ref and `.focus()`.
- **Don't disable the submit button until the form is valid.** A disabled button can't be focused, and doesn't say *why* it won't work.

### ARIA states worth knowing

ARIA is at its best describing **state** that HTML has no attribute for:

| Attribute | Put it on | A screen reader adds |
|---|---|---|
| `aria-expanded` | A button that shows or hides something | "collapsed" / "expanded" |
| `aria-pressed` | A toggle button (on/off) | "pressed" / "not pressed" |
| `aria-current="page"` | The nav link for the page you're on | "current page" |

```tsx
<button type="button" aria-expanded={isOpen} onClick={() => setIsOpen(!isOpen)}>Delivery and returns</button>
<button type="button" aria-pressed={inStockOnly} onClick={() => setInStockOnly(!inStockOnly)}>In stock only</button>
```

For a simple show/hide, HTML has one built in: `<details>` and `<summary>`, which the hints in these exercises use. The first rule of ARIA again.

A toggle shows its state in one of two ways. Either keep the name fixed and use `aria-pressed`, or change the name ("Add to favourites" / "Remove from favourites", as in chapter 21) with no `aria-pressed`. Not both: "Remove from favourites, pressed" is confusing.

**`aria-current="page"`** is added for you by React Router's `NavLink` when the link is active. Your `active` class from chapter 24 tells eyes; this tells ears.

**`aria-label` or `aria-labelledby`?** Both set a name. `aria-label` is a name you type, which nobody sees. `aria-labelledby` says "my name is the text of that element", by id, like the dialog above. Prefer visible text inside the element, then `aria-labelledby`, then `aria-label`.

### Colour, size and motion

**Contrast.** WCAG AA asks for a **contrast ratio** of at least **4.5:1** for normal text, and 3:1 for large text (about 24px, or 19px bold) and for the edges of inputs and buttons. To check, inspect an element in DevTools and click the colour square next to `color` in the Styles pane: the picker shows the ratio, with a tick or a cross. Try it on your own projects. The pale "muted" grey in the to-do app's stylesheet (`#7b8794`), on white, comes out at about 3.7:1: fine for large text, too faint for small text.

**Never colour alone.** Roughly 1 in 12 men can't easily tell red from green. Colour can *add* meaning, but mustn't be the only sign of it. A red border says nothing to them; `<p className="promo-message error">That code isn't valid. Try BOOKS10.</p>` says it to everyone. Underline links inside paragraphs for the same reason.

**Size.** WCAG 2.2 asks for click targets of at least **24 by 24 pixels** (or enough space around smaller ones). That tiny ✕ matters to anyone with shaky hands, and to everyone on a bumpy bus.

**Motion.** Some people get dizzy or sick from animation, and turn on "reduce motion" in their operating system (on Windows: Settings, Accessibility, Visual effects, then turn off "Animation effects"). CSS can read that setting:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

That calms the skeleton-card pulse in your recipe finder and bookstore CSS. In JavaScript, `window.matchMedia("(prefers-reduced-motion: reduce)").matches` tells you the same, for example before chapter 19's smooth `scrollIntoView`. To fake the setting, open DevTools' **Rendering** panel (three-dots menu, More tools) and find "Emulate CSS media feature prefers-reduced-motion".

### Testing accessibility

No single check finds everything. Use four kinds.

**1. Unplug your mouse.** Put it out of reach and use every flow with the keyboard alone. Can I reach everything with Tab? Can I always see where focus is? Can I use it with Enter, Space, arrows and Escape? Can I get *out* of it again? After each action, does focus land somewhere sensible?

**2. Use a screen reader.** On Windows, install **NVDA** (free, from nvaccess.org), or use the built-in **Narrator** (**Ctrl + Windows + Enter** turns it on and off). On a Mac, **VoiceOver** is built in (**Cmd + F5**). Some NVDA keys to start with (the "NVDA key" is **Insert**, or **Caps Lock** if you chose the laptop layout):

| Key | What it does |
|---|---|
| **Ctrl** | Stop talking |
| **Insert + Down Arrow** | Read everything from here |
| **H** / **Shift + H** | Next / previous heading |
| **D** | Next landmark |
| **Insert + F7** | A list of all the links, headings and landmarks |
| **Insert + Q** | Quit NVDA |

It's normal to feel lost the first time: it talks fast, and it's a new way of moving around. NVDA's **Speech Viewer** (NVDA menu, then Tools) shows everything it says as text, which helps while you learn. Everyday screen reader users are experts, so your clumsy first try isn't their experience. The question is: *could* an expert do everything, and would it make sense?

**3. Let tools find the obvious things.**

- **DevTools' Accessibility pane.** In Chrome or Edge, inspect an element and open the **Accessibility** tab beside Styles. It shows the element's **role** and **name**, which is exactly what a screen reader gets.
- **Lighthouse.** In DevTools, open the **Lighthouse** tab, tick only **Accessibility**, and run it. You get a score and a list of problems.
- **axe DevTools**, a free browser extension from Deque. It adds a DevTools tab that scans the page and explains each problem.
- **Your linter.** Your projects use Oxlint ([chapter 01](../01-getting-started/notes.md)), which has a built-in **`jsx-a11y`** plugin that checks your JSX. Add it to `plugins` in `.oxlintrc.json`, keeping the ones already there (setting `plugins` replaces the default list). For example, if yours lists `react`, `typescript` and `oxc`, it becomes:

  ```json
  { "plugins": ["react", "typescript", "oxc", "jsx-a11y"] }
  ```

  Then run `npm run lint`. Most of its rules are in Oxlint's "correctness" group, which is on by default, and they catch things like an `<img>` with no `alt` or a `<div onClick>`. Check it's working: leave out an `alt` on purpose, and you should get a complaint. (If you don't, add `"categories": { "correctness": "warn" }` to the file.) If a project uses ESLint instead, the same rules come from the `eslint-plugin-jsx-a11y` package: import it in `eslint.config.js` and add `jsxA11y.flatConfigs.recommended` to the config. At the time of writing, that package officially supports ESLint only up to version 9, so npm may complain on a newer ESLint.

**An honest warning about tools.** Automated checks catch only some problems; commonly quoted figures range from about a third to a half. A tool can see that an image has `alt` text. It can't tell whether the text is any good, whether focus lands somewhere sensible, or whether the page makes sense read aloud. **A Lighthouse score of 100 doesn't mean your app is accessible.** It means the tools found nothing more to say.

**4. Write tests the way a screen reader reads.** [Chapter 28](../28-testing/notes.md) promised this: **if a test can't find it by role and name, neither can a screen reader.** So `getByRole` tests check accessibility as they go:

```tsx
test("the remove button says what it removes", async () => {
  const user = userEvent.setup();
  const onRemove = vi.fn();
  render(<CartRow item={{ bookId: "3", title: "Dune", price: 9.99, quantity: 1 }} onRemove={onRemove} />);

  await user.click(screen.getByRole("button", { name: "Remove Dune from cart" }));

  expect(onRemove).toHaveBeenCalledWith("3");
});
```

jest-dom has more: `expect(input).toHaveAccessibleDescription(/enter an email/i)`, `expect(screen.getByRole("status")).toHaveTextContent("Showing 3 of 12 books")`, and `expect(heading).toHaveFocus()` after a delete. `await user.tab()` presses Tab, so you can test where focus goes.

## Common mistakes

**1. `<div onClick>` instead of a button.** No Tab, no Enter, no Space, no "button". Use `<button>` and reset its styling in CSS.

**2. A placeholder instead of a label.** It vanishes as you type, and screen readers don't reliably read it. Every input gets a `<label>`, even a `visually-hidden` one.

**3. Icon buttons with no name.** `<button>✕</button>` is "times, button". Add an `aria-label` that says what it does, and to what.

**4. `outline: none` with nothing in its place.** Keyboard users lose track of where they are. Style a clear ring with `:focus-visible`.

**5. Missing or useless `alt` text.** No `alt` can mean the file name gets read out, and `alt="image"` says nothing. Describe what matters, or use `alt=""` for decoration.

**6. Picking heading levels for their size.** An `<h4>` straight after an `<h1>` breaks the outline people navigate by. Choose the level for its meaning; set the size in CSS.

**7. Colour-only messages.** A red border says nothing to a colour-blind user or a screen reader user. Say it in words.

**8. ARIA sprinkled everywhere.** Wrong ARIA is worse than none, because it makes the screen reader say things that aren't true. Native elements first, ARIA only for what HTML can't say.

**9. Losing focus.** Something is deleted, a dialog closes, or the route changes, and focus drops to `<body>`. Decide where it should go, and move it there with a ref.

**10. Announcing nothing.** "Added to cart", "Saved" and "No results" appear on screen and stay silent for a screen reader. Use a live region that's always on the page.

**11. Drag and drop with no alternative.** Dragging needs a mouse and a steady hand, and WCAG 2.2 asks for a single-click alternative. That's why [chapter 37's task board](../37-project-task-board/notes.md) moves cards with buttons: it works with a keyboard.

**12. Treating a clean score as "done".** Lighthouse and axe catch some problems, not most. Finish with the keyboard and a screen reader.

## Quick recap

- **Accessibility (a11y)** means everyone can use your app, including people using screen readers, keyboards, zoom, or shaky hands. **WCAG 2.2 AA** is the usual target.
- **The right HTML element does most of the work.** `<button>` to do, `<Link>` to go, headings in order, landmarks. Use ARIA only when HTML has no answer.
- **Everything needs a name:** a `<label>` for every input (`useId()` in reusable components), an `aria-label` for icon buttons, and fitting `alt` text (or `alt=""`).
- **Everything must work with a keyboard,** with a visible focus ring and a logical Tab order.
- **Manage focus when things change:** after a delete, a dialog, or a route change. `<dialog>` with `showModal()` does most of the dialog work for you.
- **Announce changes** with a live region that's on the page before its text changes.
- **Don't rely on colour alone,** keep text contrast at 4.5:1, and respect `prefers-reduced-motion`.
- **Test four ways:** keyboard, screen reader, automated tools, and `getByRole` tests. Tools find some problems. People find the rest.

---

**Next:** try the [exercises](exercises.md), then move on to [39 Next.js and Server Components](../39-nextjs-and-server-components/notes.md).
