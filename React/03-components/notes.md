# 03 Components

## What is it?

A **component** is a function that returns JSX. It's one piece of your page, with a name:

```tsx
function Greeting() {
  return <h1>Hello, React!</h1>;
}
```

Once it has a name, you can use it like an HTML tag:

```tsx
<Greeting />
```

You've already met one. `App`, in `src/App.tsx`, is a component. So is every exercise file you've written so far.

## Why does it matter?

Here's a café menu, written the way you know from [chapter 02](../02-jsx/notes.md):

```tsx
function App() {
  return (
    <div>
      <div className="card">
        <h2>Espresso</h2>
        <p>$2.50</p>
      </div>
      <div className="card">
        <h2>Latte</h2>
        <p>$3.50</p>
      </div>
      <div className="card">
        <h2>Flat White</h2>
        <p>$3.50</p>
      </div>
    </div>
  );
}
```

It works, but look at the problems:

- **The same shape is written three times.** Add an "Add to cart" button, and you edit three places. Miss one, and your page is inconsistent.
- **It's hard to read.** You have to look carefully at all those `<div>`s to see that the page is really just three cards.
- **A real menu has twenty items,** not three. This file would be 150 lines of almost-identical JSX.

This is the same problem that functions solve in plain JavaScript ([JavaScript chapter 09](../../JavaScript/09-functions/notes.md)): when you write the same thing twice, give it a name and write it once. A component *is* a function. It just happens to return a piece of a page.

Components also give your page a vocabulary. Instead of nested `<div>`s, you write:

```tsx
<Header />
<Menu />
<Footer />
```

Anyone can read that, including you in six months.

## Real-world example

A component is a **rubber stamp**.

| Rubber stamp | React component |
|---|---|
| You carve the stamp once, carefully | You write the function once |
| The name on the handle: "PAID" | The component's name: `Greeting` |
| Pressing it onto the paper | Writing `<Greeting />` |
| Pressing it in five places | Using it five times |
| Re-carving the stamp | Editing the function: every stamp on every page changes |

And because a component can contain other components, you can build big things out of small ones, like snapping LEGO bricks together.

## How it works

### Your first component

Make a file `src/ch03/Greeting.tsx`:

```tsx
function Greeting() {
  return <h1>Hello, React!</h1>;
}

export default Greeting;
```

That's the whole recipe, and it has three parts:

1. **A function** with a name that starts with a **capital letter**.
2. It **returns JSX**.
3. It's **exported**, so other files can use it ([JavaScript chapter 29](../../JavaScript/29-modules/notes.md)).

Now use it in `src/App.tsx`:

```tsx
import Greeting from "./ch03/Greeting.tsx";

function App() {
  return (
    <div>
      <Greeting />
      <Greeting />
    </div>
  );
}

export default App;
```

The page shows "Hello, React!" twice. One function, two stamps.

### The capital letter is a rule, not a style

This one trips up everybody once, so it's worth understanding properly.

When Vite translates your JSX, it looks at the **first letter of the tag**:

| You write | What it becomes | What it means |
|---|---|---|
| `<h1>` | `jsx("h1", ...)` | the *string* `"h1"`: a built-in HTML tag |
| `<Greeting />` | `jsx(Greeting, ...)` | the *variable* `Greeting`: your component |

Lowercase means "an HTML tag". Capital means "the thing in scope with this name". So a lowercase component name goes looking for an HTML tag that doesn't exist:

```tsx
function greeting() {
  return <h1>Hi</h1>;
}

// somewhere else
<greeting />
// ❌ Property 'greeting' does not exist on type 'JSX.IntrinsicElements'.
```

`JSX.IntrinsicElements` is React's list of built-in HTML tags. **Intrinsic** means "built in". So the error says: "there is no HTML tag called `greeting`."

The nasty version of this mistake is when your component's name happens to *be* a real HTML tag:

```tsx
function header() {
  return <h1>Corner Café</h1>;
}

<header />
```

No error at all. React quietly makes an empty `<header>` element, and your heading never appears. Nothing on the page, nothing in the Console, no red squiggle.

So: **component names start with a capital letter**. When the name is several words, capitalise each one: `MenuItem`, `SignUpForm`. That style is called **PascalCase**. Name the file the same way: `MenuItem.tsx`.

### Self-closing, or a pair of tags

These two are exactly the same:

```tsx
<Greeting />
<Greeting></Greeting>
```

Use the short one. (Putting something *between* the tags does have a meaning, and it's the `children` prop in [chapter 04](../04-props/notes.md).)

Forget to close it at all, and you get the same error as any other tag:

```tsx
<Greeting>
// ❌ JSX element 'Greeting' has no corresponding closing tag.
```

### A component is a normal function

Everything you know about functions still applies. You can do work above the `return`:

```tsx
function TodayBanner() {
  const today = new Date();
  const weekday = today.toLocaleDateString("en-GB", { weekday: "long" });

  return <p>Happy {weekday}! Coffee is half price today.</p>;
}
```

(`toLocaleDateString` is from [JavaScript chapter 19](../../JavaScript/19-dates-and-times/notes.md).)

The pattern is always the same: **work out your values above the `return`, then show them in the JSX**.

### Returning nothing on purpose

A component can return `null`, which means "put nothing on the page":

```tsx
function Nothing() {
  return null;
}
```

That's useful, and [chapter 05](../05-conditional-rendering/notes.md) uses it a lot.

Returning nothing **by accident** is a different story. This happens with arrow functions:

```tsx
const Greeting = () => {
  <h1>Hello!</h1>;   // no return!
};
```

The function body is in `{ }`, so JavaScript needs a `return`. Without one, the function gives back `undefined`, React shows nothing, and there's **no error message** anywhere: not in VS Code, not in the terminal, not in the Console. If a component of yours shows nothing at all, check for a missing `return` first.

### Components inside components

A component can use other components. That's how you build a page:

```tsx
function Header() {
  return <h1>Corner Café</h1>;
}

function Footer() {
  return <p>Open 7am to 5pm, every day</p>;
}

function Page() {
  return (
    <>
      <Header />
      <p>Fresh coffee every morning.</p>
      <Footer />
    </>
  );
}
```

`Page` is the **parent**. `Header` and `Footer` are its **children**. Notice that `Page` mixes your components and HTML tags freely. React doesn't care which is which.

Line those relationships up and you get the **component tree**:

```
App
└── Page
    ├── Header
    ├── p
    └── Footer
```

Every React app is one tree like this, growing from a single **root** component. In your app, that root is `App`, which `main.tsx` renders into `<div id="root">`.

This is where the **React Developer Tools** extension from [chapter 01](../01-getting-started/notes.md) starts to pay off. Press `F12`, open the **Components** tab, and you'll see exactly this tree, live. Click any component to highlight it on the page. Get in the habit of looking here when something is missing: if a component isn't in the tree, it never ran.

### Back to the café menu

So can you fix that repeated menu from the start of the chapter? Partly:

```tsx
function MenuItem() {
  return (
    <div className="card">
      <h2>Espresso</h2>
      <p>$2.50</p>
    </div>
  );
}
```

Now `<MenuItem />` gives you the card's *shape* in one line. But every single one says "Espresso", which isn't much of a menu. To fix that, a component needs to accept information from outside:

```tsx
<MenuItem name="Latte" price={3.5} />
```

Those are **props**, and they're the whole of [chapter 04](../04-props/notes.md). This chapter and the next are really two halves of one idea, so don't worry that your components feel a bit rigid right now.

Plenty of components genuinely never change, though: a header, a footer, a logo, an "about us" paragraph, a divider. Those are useful on their own today.

### One component per file

The usual convention:

- **One component per file**, and the file is named after it: `MenuItem.tsx`.
- **Export it as the default** export.
- If a small helper component is only ever used by one parent, it can live in the same file as that parent.

```
src/
├── App.tsx
├── main.tsx
└── ch03/
    ├── Header.tsx
    ├── Footer.tsx
    └── MenuItem.tsx
```

([Chapter 14](../14-thinking-in-react/notes.md) talks about organising bigger apps.)

Both kinds of export from [JavaScript chapter 29](../../JavaScript/29-modules/notes.md) work:

```tsx
// default export: the importer picks the name
export default Greeting;
import Greeting from "./ch03/Greeting.tsx";

// named export: the name must match
export function Greeting() { /* ... */ }
import { Greeting } from "./ch03/Greeting.tsx";
```

Vite's starter and React's own docs use default exports, so this course does too. Some teams prefer named exports, because then everyone spells the component the same way. Either is fine. Just don't mix them up, or you'll hit mistake 3 below.

**The file must end in `.tsx`.** A `.ts` file can't contain tags.

### What TypeScript thinks a component is

Hover over `Greeting` in VS Code and you'll see:

```
function Greeting(): React.JSX.Element
```

TypeScript worked out the return type by itself, from the JSX you returned. You don't have to write it, and this course doesn't.

You'll see older tutorials write components like this:

```tsx
const Greeting: React.FC = () => {
  return <h1>Hi</h1>;
};
```

`React.FC` is short for `FunctionComponent`, a type React provides. It isn't wrong, but it isn't needed either, and React's own documentation uses plain functions. Plain functions are also easier to type when props get complicated ([chapter 25](../25-typescript-patterns/notes.md)). If you join a team that uses `React.FC`, use `React.FC`. Otherwise, keep it simple.

### Declaration or arrow function?

All three of these are the same component as far as React is concerned:

```tsx
function Greeting() {
  return <h1>Hi</h1>;
}

const Greeting = () => {
  return <h1>Hi</h1>;
};

const Greeting = () => <h1>Hi</h1>;   // returns without the word "return"
```

This course uses `function`, because it's hoisted ([JavaScript chapter 14](../../JavaScript/14-scope-and-hoisting/notes.md)), so the order of components in a file never matters. Use whichever your team uses. Just remember the missing-`return` trap above.

### Each use is its own thing

When you write `<Greeting />` twice, React puts two separate copies on the page. They look the same, but they are not connected. Change one later and the other doesn't follow.

That sounds obvious for a heading. It matters enormously from [chapter 08](../08-state/notes.md), when components start remembering things: two `<Counter />`s on one page count separately, each with its own number.

### Don't define a component inside another component

```tsx
function App() {
  function Menu() {            // ❌ don't do this
    return <p>Today's menu</p>;
  }

  return <Menu />;
}
```

This looks tidy and it even works at first. But React runs `App` again every time something changes, and each run creates a **brand new** `Menu` function. React compares functions to decide whether it's looking at the same component as before, so a new function every time means "this is a different component": it throws the old one away and builds a fresh one from scratch. Anything the component was remembering is lost, and the page does far more work than it needs to.

The fix is easy: define components at the **top level** of a file, side by side.

### A component should be predictable

Given the same input, a component should always return the same JSX, and it shouldn't reach out and change things outside itself while it's running. This is called being **pure** ([JavaScript chapter 43](../../JavaScript/43-functional-programming/notes.md) covers pure functions).

Here's the impure version:

```tsx
let count = 0;

function Counter() {
  count = count + 1;      // ❌ changing something outside the component
  return <p>Rendered {count} times</p>;
}
```

Run it and you'll see **2**, not 1. That's `<StrictMode>` in `main.tsx` doing its job: during development it calls each component twice on purpose, precisely so that this kind of bug is loud instead of silent. React reserves the right to call your component whenever it likes, so a component that counts its own runs will give you different answers on different days.

Keep components to reading their input and returning JSX. When something genuinely needs to change, that's state ([chapter 08](../08-state/notes.md)) or an effect ([chapter 17](../17-effects/notes.md)).

### How small should a component be?

There's no rule, but these signals are reliable:

- **You've written the same JSX twice.** Make a component.
- **A chunk has a name you'd say out loud** ("the search bar", "the price tag"). Make a component.
- **The function is too long to see on one screen.** Split it.
- **It's used once, it's three lines, and it has no name in your head.** Leave it alone.

Beginners usually split too little rather than too much, but don't go hunting for components either. Split when it makes the file easier to read.

## Common mistakes

**1. A lowercase component name**

```tsx
<greeting />
// ❌ Property 'greeting' does not exist on type 'JSX.IntrinsicElements'.
```

And if the name is a real HTML tag, like `header` or `section`, there's no error at all: it just renders empty. Capital letters, always.

**2. Calling a component like a function**

```tsx
<div>{Greeting()}</div>     // works, but don't
<div><Greeting /></div>     // ✅
```

Calling it drops the JSX straight in, so the page looks right. But React never learns that a component was involved: it won't appear in the Components tab, and from chapter 08 it can't keep its own state. Always use the tag.

**3. Export and import don't match**

```tsx
export default Header;                      // default export
import { Header } from "./ch03/Header.tsx"; // named import
// ❌ Module '"./ch03/Header.tsx"' has no exported member 'Header'.
```

And if you forget `export` entirely, the import is `undefined`, and the page crashes with `Element type is invalid: expected a string or a class/function but got: undefined`.

**4. An arrow function with no `return`**

```tsx
const Footer = () => {
  <p>Corner Café 2026</p>;
};
```

Blank page, no error message at all. Add `return`, or drop the braces: `const Footer = () => <p>Corner Café 2026</p>;`

**5. Returning two elements side by side**

```tsx
return (
  <Header />
  <Footer />
);
// ❌ JSX expressions must have one parent element.
```

Same rule as chapter 02. Wrap them in a fragment: `<>` and `</>`.

**6. Putting JSX in a `.ts` file**

You get strange errors that don't mention JSX at all, like `Cannot find name 'h1'`, because in a plain `.ts` file `<h1>` looks like a type assertion, not a tag. Rename the file to `.tsx`.

**7. Defining a component inside another component**

Covered above. Move it out to the top level of the file.

**8. Getting the case wrong in an import path**

```tsx
import Header from "./ch03/header.tsx";   // the file is really Header.tsx
```

Windows and macOS don't care about the case of file names, so this works fine on your computer. Most servers run Linux, which *does* care, and your app breaks the moment you put it online. Type import paths carefully, or let VS Code's autocomplete write them for you.

## Quick recap

- A component is a function that returns JSX. Use it like a tag: `<Greeting />`.
- **Names must start with a capital letter.** Lowercase means "HTML tag", so `<greeting />` is an error and `<header />` silently renders nothing.
- Components nest inside each other and form a tree, growing from `App`. The React DevTools **Components** tab shows you that tree.
- One component per file, named after the component, with a default export. Files with tags end in `.tsx`.
- Do your work above the `return`. Define components at the top level, never inside another component, and don't change anything outside the component while it renders.
- A component on its own is a fixed stamp. Props, in chapter 04, are what let you press the same stamp with different words.

---

**Next:** try the [exercises](exercises.md), then move on to [04 Props](../04-props/notes.md).
