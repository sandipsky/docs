# 02 JSX

## What is it?

**JSX** lets you write HTML-like tags right inside your code:

```tsx
const heading = <h1>Hello, React!</h1>;
```

There are no quotes around it, so it's not a string. And it's not real HTML either. Before your code reaches the browser, Vite translates the JSX into plain JavaScript.

(JSX is short for "JavaScript XML". XML is a stricter cousin of HTML, which explains some of the rules below. When you use JSX in TypeScript, the files end in `.tsx`, and people sometimes call it TSX. It's the same thing.)

## Why does it matter?

In [JavaScript chapter 20](../../JavaScript/20-dom-basics/notes.md), you built a product card like this:

```js
const card = document.createElement("div");
card.classList.add("card");

const title = document.createElement("h2");
title.textContent = "Notebook";

const price = document.createElement("p");
price.textContent = "Price: $3.50";

card.append(title, price);
```

It works, but you have to read every line carefully to picture what's on the page. Here's the same card in JSX:

```tsx
<div className="card">
  <h2>Notebook</h2>
  <p>Price: $3.50</p>
</div>
```

It looks like the result. You can see the card's shape at a glance, which makes JSX quick to write and easy to read.

With TypeScript, you get a bonus: **TypeScript knows every HTML tag and attribute**. Misspell one, and VS Code underlines it before you even look at the browser. And as you'll see at the end of this chapter, JSX is also safer than building HTML by hand.

## Real-world example

Think of a birthday card from a shop. The design and most of the words are already printed. There are just a few blanks for you to fill in:

> Happy birthday, **\_\_\_\_\_**! You're **\_\_\_** today!

JSX works the same way:

| Birthday card | JSX |
|---|---|
| The printed design and words | The tags and plain text |
| A blank space | Curly braces: `{ }` |
| What you write in the blank | A JavaScript value, like `{name}` |
| The same card, for a different friend | The same JSX, with different data |

## How it works

### Where to try the examples

All the examples in this chapter go in `src/App.tsx`, inside the `App` function. The simplest one looks like this:

```tsx
function App() {
  return <h1>Hello, React!</h1>;
}

export default App;
```

`App` returns some JSX, and React shows it on the page. Whatever you put after `return` is what you'll see.

Keep `npx tsc -b` handy in a second terminal, like in [chapter 01](../01-getting-started/notes.md). Many of the mistakes in this chapter show up there, and as red squiggles in VS Code, but not in the browser.

### JSX is JavaScript in disguise

When Vite translates your JSX, this:

```tsx
<h1 className="title">Hello</h1>
```

becomes something like this:

```js
jsx("h1", { className: "title", children: "Hello" });
```

`jsx()` is a React function. It makes a small object that *describes* the element: "an `h1`, with this class, containing this text." React reads these descriptions and builds the real page from them.

You'll never write `jsx()` yourself. (Older tutorials show `React.createElement()` instead. It's the same idea, from older versions of React.) But knowing the secret helps in three ways:

- **JSX is a value**, like a number or a string. You can store it in a variable, or return it from a function.
- **TypeScript can check it.** The attributes become an object, `{ className: "title", ... }`, and React comes with types that describe which properties each tag's object may have. So TypeScript checks your tags like any other object ([TypeScript chapter 03](../../TypeScript/03-arrays-tuples-objects/notes.md)).
- **The rules below make sense.** They exist because, underneath, JSX is JavaScript.

### Rule 1: Return one parent element

This breaks:

```tsx
function App() {
  return (
    <h1>Corner Café</h1>
    <p>Fresh coffee every morning.</p>
  );
}
// ❌ JSX expressions must have one parent element.
```

> **Tip:** in this course, `// ❌` in a code example shows the error TypeScript reports, like in the TypeScript course. You'll see it when you hover over the red squiggly line in VS Code, and when you run `npx tsc -b`. Broken *syntax*, like this example, also shows up as an error box in the browser, because Vite can't translate the file at all. Type errors don't show up in the browser.

Why does this break? Each tag turns into a `jsx()` call, and a function can only return *one* value. You can't `return 1 2;` in JavaScript either.

The fix is to wrap them in one parent:

```tsx
function App() {
  return (
    <div>
      <h1>Corner Café</h1>
      <p>Fresh coffee every morning.</p>
    </div>
  );
}
```

That works, but it adds an extra `<div>` to your page. If you don't need it, use a **fragment**, written `<>` and `</>`:

```tsx
function App() {
  return (
    <>
      <h1>Corner Café</h1>
      <p>Fresh coffee every morning.</p>
    </>
  );
}
```

A fragment is an invisible wrapper. It groups the elements for React, but adds nothing to the page. Vite's starter `App.tsx` used one, too.

### Rule 2: Close every tag

In HTML, some tags don't need closing, like `<img>`, `<br>`, and `<input>`. In JSX, **every** tag must be closed. For tags with nothing inside, add a slash before the `>`:

```tsx
<img src="/favicon.svg" alt="Site logo" />
<br />
<input type="text" />
```

This is called a **self-closing** tag. Forget the slash, and you get:

```tsx
<img src="/favicon.svg" alt="Site logo">
// ❌ JSX element 'img' has no corresponding closing tag.
```

(`/favicon.svg` is the tab icon in your `public` folder. Files in `public` are available at `/` plus their name.)

### Rule 3: Attributes use camelCase, and `class` becomes `className`

JSX attributes are really JavaScript property names. So they follow JavaScript's rules, and use camelCase (from [JavaScript chapter 02](../../JavaScript/02-variables/notes.md)):

| HTML | JSX | Why |
|---|---|---|
| `class="card"` | `className="card"` | `class` is a JavaScript keyword ([JavaScript chapter 27](../../JavaScript/27-classes/notes.md)) |
| `for="email"` | `htmlFor="email"` | `for` is a JavaScript keyword too (loops) |
| `tabindex="0"` | `tabIndex={0}` | camelCase, and it's a number (more on that below) |
| `maxlength="20"` | `maxLength={20}` | camelCase, and it's a number |
| `onclick="..."` | `onClick={...}` | camelCase (events are chapter 07) |

Two kinds of attributes keep their dashes: the ones that start with `aria-` and `data-`. You used both in your JavaScript to-do app:

```tsx
<button aria-label="Delete task" data-id="3">×</button>
```

If you write `class` by mistake, TypeScript catches it straight away:

```tsx
<h1 class="title">Hi</h1>
// ❌ Property 'class' does not exist on type 'DetailedHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>'. Did you mean 'className'?
```

That error looks scary, so here's how to read it. **Read the last sentence first:** `Did you mean 'className'?` That's usually all you need. `DetailedHTMLProps<HTMLAttributes<HTMLHeadingElement>, ...>` is just TypeScript's long name for "the list of attributes a heading can have". (The full message starts with one more line above this one. It mentions `children`, which means whatever is between the opening and closing tags.)

If you ignore the squiggle, the page may even look right. But React also warns you in the Console (`F12`): ``Invalid DOM property `class`. Did you mean `className`?`` Always fix both kinds of warnings.

### Curly braces: a window back into JavaScript

This is the most important part of JSX. Inside JSX, **curly braces `{ }` let you drop in any JavaScript value**, like the blanks on the birthday card:

```tsx
function App() {
  const shopName = "Corner Café";
  const coffeePrice = 3.5;
  const cups = 2;

  return (
    <div>
      <h1>Welcome to {shopName}!</h1>
      <p>{cups} coffees cost ${(coffeePrice * cups).toFixed(2)}</p>
      <p>Shout it: {shopName.toUpperCase()}</p>
    </div>
  );
}
```

The page shows:

```
Welcome to Corner Café!
2 coffees cost $7.00
Shout it: CORNER CAFÉ
```

A few things to notice:

- `{shopName}` shows what's in the variable, just like `${shopName}` in a template literal ([JavaScript chapter 06](../../JavaScript/06-strings/notes.md)).
- You can do math, and call functions and methods, like `toFixed` from [JavaScript chapter 05](../../JavaScript/05-numbers-and-math/notes.md).
- The `$` in `$7.00` is just a dollar sign. In JSX, the braces do all the work by themselves, so a `$` in front of them is plain text.
- There are no type annotations. TypeScript infers the types from the values, and checks them everywhere they're used. Hover over `shopName` in VS Code: because it's a `const`, you'll see the exact value as its type, `"Corner Café"` (a literal type, from [TypeScript chapter 02](../../TypeScript/02-basic-types/notes.md)).
- Do your setup (the `const` lines) *above* the `return`. Keep the JSX for showing things.

### Only expressions go inside the braces

Braces take an **expression**: a piece of code that produces a value. `cups`, `cups * 2`, and `shopName.toUpperCase()` are all expressions.

A **statement** *does* something instead of producing a value, like `if`, `for`, or `const`. Statements don't work in braces:

```tsx
<p>{if (isOpen) { "Open" }}</p>
// ❌ Expression expected.
```

When you need to choose between two values, use the ternary operator from [JavaScript chapter 07](../../JavaScript/07-conditionals/notes.md). It's an expression, so it's allowed:

```tsx
const isOpen = true;

<p>We're {isOpen ? "open" : "closed"}.</p>
// shows: We're open.
```

[Chapter 05](../05-conditional-rendering/notes.md) shows all the ways to show things only sometimes.

### Curly braces in attributes

Braces work in attributes too. Use them instead of quotes when the value comes from JavaScript:

```tsx
const logoUrl = "/favicon.svg";
const shopName = "Corner Café";

<img src={logoUrl} alt={shopName + " logo"} />
```

The rule is: **quotes for fixed text, braces for JavaScript. Never both.** Writing `src="{logoUrl}"` gives the image the text `{logoUrl}` as its address, so you get a broken image.

**Numbers go in braces, too.** Quotes always make a string, even when there's a number inside them. TypeScript knows which attributes want a number:

```tsx
<input type="email" maxLength="50" />
// ❌ Type 'string' is not assignable to type 'number'.

<input type="email" maxLength={50} /> // ✅ a real number
```

Plain HTML doesn't care about this difference, but TypeScript does. It's the same rule as in [TypeScript chapter 02](../../TypeScript/02-basic-types/notes.md): `"50"` and `50` are different types.

### TypeScript knows every tag and attribute

Because React comes with types for every HTML tag, TypeScript spots typos in your JSX just like typos in your objects. And it usually suggests the fix:

```tsx
<button onclick={() => {}}>Go</button>
// ❌ Property 'onclick' does not exist on type '...'. Did you mean 'onClick'?

<input maxlength={20} />
// ❌ Property 'maxlength' does not exist on type '...'. Did you mean 'maxLength'?
```

(The `'...'` is a shortcut for the long type name you saw in Rule 3. It's there in the real message.)

As you type an attribute in VS Code, a list pops up with the attributes that tag allows. That's TypeScript too. Use it: it's faster than remembering, and you can't misspell what you pick from a list.

### What shows up on the page

Not every value appears on the page the way you might expect:

| You write | The page shows |
|---|---|
| `{"hello"}` | hello |
| `{42}` | 42 |
| `{0}` | 0 (yes, zero shows up) |
| `{true}` or `{false}` | nothing |
| `{null}` or `{undefined}` | nothing |
| `{["a", "b"]}` | ab (each item; [chapter 06](../06-rendering-lists/notes.md) does this properly) |
| `{ {name: "Pen"} }` (an object) | a type error (and a crash if you run it anyway) |

Everything React can show (text, numbers, JSX, `true`, `false`, `null`, `undefined`, and arrays of these) has one type name: **`ReactNode`**. An object isn't on that list, so TypeScript stops you. You'll see `ReactNode` again in chapter 04.

Showing nothing for `true`, `false`, `null` and `undefined` sounds odd, but it's very useful. Chapter 05 uses it to hide things. Keep in mind that `0` *does* show, because it trips people up in chapter 05.

### The `style` attribute takes an object

In HTML, `style` is a string. In JSX, it's a JavaScript object:

```tsx
<h1 style={{ color: "tomato", fontSize: 32 }}>Sale!</h1>
```

The **double braces** look odd, but they're two different things:

- The outer `{ }` means "here comes JavaScript".
- The inner `{ }` is the object itself, like in [JavaScript chapter 11](../../JavaScript/11-objects/notes.md).

The CSS property names are camelCase too: `font-size` becomes `fontSize`, and `background-color` becomes `backgroundColor`. A plain number means pixels for sizes, so `fontSize: 32` becomes `32px`.

TypeScript knows every CSS property name, so it catches typos here too:

```tsx
<h1 style={{ fontsize: 32 }}>Sale!</h1>
// ❌ Object literal may only specify known properties, but 'fontsize' does not exist in type 'Properties<string | number, string & {}>'. Did you mean to write 'fontSize'?
```

Use `style` for quick experiments. For real styling, `className` with a CSS file is usually better. [Chapter 15](../15-styling/notes.md) covers that.

### Comments inside JSX

Between tags, a comment needs braces too, because it's JavaScript:

```tsx
<div>
  {/* The menu goes here later */}
  <h1>Corner Café</h1>
</div>
```

A normal `// comment` there doesn't work. It shows up on the page as text!

### Long JSX: wrap it in parentheses

When your JSX takes more than one line, put it in parentheses after `return`, like all the examples above. Without them, this happens:

```tsx
function App() {
  return
    <h1>Corner Café</h1>;
}
```

JavaScript sees `return` alone on its line and stops right there, so `App` returns nothing and the page is blank. VS Code shows the `<h1>` line faded out, which means "this code never runs". The `(` right after `return` tells JavaScript "keep going, there's more".

### JSX is a value you can store

Since JSX is a value, you can keep a piece of it in a variable and use it later:

```tsx
function App() {
  const badge = <span>⭐ Bestseller</span>;

  return (
    <div>
      <h2>The Hobbit</h2>
      {badge}
    </div>
  );
}
```

Hover over `badge` in VS Code. TypeScript says its type is `React.JSX.Element`: a piece of JSX.

This feels small now, but it's the start of something big. In chapter 03, you'll put JSX in functions and reuse it anywhere.

### JSX keeps you safe

In [JavaScript chapter 51](../../JavaScript/51-security-basics/notes.md), you learned that putting user text into `innerHTML` can let an attacker run code (XSS). JSX protects you automatically:

```tsx
const comment = "<img src=x onerror=alert('hacked')>";

<p>{comment}</p>
```

The page shows the comment as plain text, angle brackets and all. It never becomes a real `<img>`, so nothing runs. React treats everything in braces as text, like `textContent` does.

(React does have a way to insert raw HTML. It's called `dangerouslySetInnerHTML`, and the name is the warning. You won't need it in this course.)

### From HTML to JSX: a checklist

You'll often copy HTML from somewhere and turn it into JSX. Go through this list:

1. Wrap everything in **one parent** (or a fragment).
2. **Close every tag**: `<br>` becomes `<br />`.
3. Change `class` to **`className`** and `for` to **`htmlFor`**.
4. Change other attributes to **camelCase**: `tabindex` becomes `tabIndex`.
5. Put **numbers in braces**: `maxlength="50"` becomes `maxLength={50}`.
6. Turn `style` strings into **objects**: `style="color: red"` becomes `style={{ color: "red" }}`.
7. Turn HTML comments `<!-- -->` into **`{/* */}`**.

Then let TypeScript check your work. Any red squiggle left over is something you missed.

## Common mistakes

**1. Two elements side by side**

```tsx
return (
  <h2>Menu</h2>
  <p>Coffee, tea, cake</p>
);
// ❌ JSX expressions must have one parent element.
```

Wrap them in a `<div>` or a fragment (`<>` and `</>`).

**2. Forgetting to close a tag**

```tsx
<input type="email">
// ❌ JSX element 'input' has no corresponding closing tag.
```

Fix: `<input type="email" />`.

**3. Writing `class` instead of `className`**

```tsx
<h1 class="title">Hi</h1>
// ❌ Property 'class' does not exist on type '...'. Did you mean 'className'?
```

It's the same for `for`: TypeScript asks `Did you mean 'htmlFor'?`

**4. Putting a number in quotes**

```tsx
<input maxLength="50" />
// ❌ Type 'string' is not assignable to type 'number'.
```

Quotes make a string. Fix: `maxLength={50}`.

**5. Putting quotes around braces**

```tsx
const photo = "/favicon.svg";
<img src="{photo}" alt="Photo" />
```

The image is broken, because its address is the text `{photo}`. TypeScript *can't* catch this one, because `"{photo}"` is a perfectly good string. Fix: `src={photo}`.

**6. Writing `${ }` out of habit**

After template literals, it's easy to type this:

```tsx
const name = "Maya";
<p>Hello, ${name}!</p>
// shows: Hello, $Maya!
```

No error, just a stray `$` on the page. TypeScript can't catch this one either, because a `$` is allowed in text. In JSX, the braces alone are enough: `<p>Hello, {name}!</p>`.

**7. Putting a whole object in braces**

```tsx
const product = { name: "Pen", price: 2 };
<p>{product}</p>
// ❌ Type '{ name: string; price: number; }' is not assignable to type 'ReactNode'.
```

React doesn't know how to show a whole object, so pick the parts you want: `{product.name}` costs `{product.price}`. (If you run it anyway, the page crashes with `Objects are not valid as a React child`.)

**8. Writing `style` as a string**

```tsx
<h1 style="color: red">Sale!</h1>
// ❌ Type 'string' has no properties in common with type 'Properties<string | number, string & {}>'.
```

`Properties<...>` is TypeScript's name for "an object of CSS properties". Fix: `style={{ color: "red" }}`.

## Quick recap

- JSX lets you write HTML-like tags in your code. In TypeScript, those files end in `.tsx`. Vite translates JSX into plain JavaScript function calls.
- Three rules: return **one parent** (a fragment `<>...</>` works), **close every tag**, and use **camelCase** attributes, with `className` instead of `class`.
- Curly braces `{ }` drop any JavaScript **expression** into JSX, in text or in attributes. Statements like `if` don't work there. Use the ternary instead.
- TypeScript knows every tag, attribute and CSS property, so it catches typos. Numbers go in braces: `maxLength={50}`. Read long errors from the last sentence.
- `true`, `false`, `null` and `undefined` show nothing. `0` does show. Objects aren't a `ReactNode`, so they're an error.
- `style` takes an object with camelCase names: `style={{ fontSize: 24 }}`. JSX shows text in braces as text, which protects you from XSS.

---

**Next:** try the [exercises](exercises.md), then move on to [03 Components](../03-components/notes.md).
