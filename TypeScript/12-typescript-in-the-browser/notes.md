# 12 TypeScript in the Browser

## What is it?

TypeScript knows every part of the browser's **DOM** ([JavaScript chapter 20](../../JavaScript/20-dom-basics/notes.md)): every element type, every event, every property. This chapter shows how to work with those types, and how to run TypeScript in a web page.

## Why does it matter?

DOM code is full of hidden "what if"s. What if `querySelector` doesn't find anything? What if the element isn't an input, so it has no `.value`? In JavaScript, you find out when the page crashes. In TypeScript, the checker asks you these questions up front.

## Real-world example

A **parcel locker** at a shop:

| Parcel locker | DOM types |
|---|---|
| You ask for locker 12 | `document.querySelector("#locker-12")` |
| It might be empty | The result might be `null` |
| The screen says "Parcel", but is it a letter or a box? | `Element`, but is it an `HTMLInputElement`? |
| Check the label before you open it | A `null` check, then `instanceof` |

## How it works

### Elements might be `null`

```ts
const button = document.querySelector("#buy");
button.addEventListener("click", () => {});
// ❌ 'button' is possibly 'null'.
```

`querySelector` returns `null` when nothing matches: a typo in the selector, or a script that runs before the HTML exists. TypeScript makes you handle that:

```ts
const button = document.querySelector("#buy");

if (button === null) {
  throw new Error("Missing #buy button"); // fail loudly, as in JavaScript chapter 18
}

button.addEventListener("click", () => {
  console.log("Added to cart");
});
```

After the check, TypeScript knows `button` is an element.

### Which kind of element?

Different elements have different properties. Inputs have `.value`, images have `.src`. But an ID alone doesn't tell TypeScript what kind of element it is:

```ts
const input = document.getElementById("email");
if (input !== null) {
  console.log(input.value);
  // ❌ Property 'value' does not exist on type 'HTMLElement'.
}
```

There are three ways to tell TypeScript the element's type:

**1. Select by tag name.** TypeScript knows what `"input"` means:

```ts
const input = document.querySelector("input"); // HTMLInputElement | null
console.log(input?.value);
```

**2. Check with `instanceof`.** This really checks, at run time, so it's the safest:

```ts
const input = document.getElementById("email");
if (input instanceof HTMLInputElement) {
  console.log(input.value); // fine: input is an HTMLInputElement here
}
```

**3. Say it with a generic.** Quick, but it's a promise TypeScript can't check:

```ts
const input = document.querySelector<HTMLInputElement>("#email"); // HTMLInputElement | null
console.log(input?.value);
```

Common element types:

| Element | Type | Useful properties |
|---|---|---|
| `<input>` | `HTMLInputElement` | `value`, `checked` |
| `<button>` | `HTMLButtonElement` | `disabled` |
| `<img>` | `HTMLImageElement` | `src`, `alt` |
| `<form>` | `HTMLFormElement` | `reset()` |
| `<select>` | `HTMLSelectElement` | `value` |
| Anything else | `HTMLElement` | `textContent`, `classList`, `style` |

### Events

Event listeners get typed events for free:

```ts
document.addEventListener("keydown", (event) => {
  // event: KeyboardEvent, so TypeScript knows about event.key
  if (event.key === "Escape") {
    console.log("Closing the menu");
  }
});
```

You didn't write `KeyboardEvent`. TypeScript knows that `"keydown"` events are keyboard events, the same contextual typing as in [chapter 05](../05-functions/notes.md).

`event.target` needs care, though. It could be *anything* on the page:

```ts
const form = document.querySelector("form");
form?.addEventListener("input", (event) => {
  console.log(event.target.value);
  // ❌ 'event.target' is possibly 'null'.
  // ❌ Property 'value' does not exist on type 'EventTarget'.
});
```

Two problems: the target might be `null`, and even if it isn't, TypeScript only knows it's an `EventTarget`, which could be a button, a div, or the whole page.

Narrow it with `instanceof`, like before:

```ts
const form = document.querySelector("form");
form?.addEventListener("input", (event) => {
  if (event.target instanceof HTMLInputElement) {
    console.log(`${event.target.name} is now ${event.target.value}`);
  }
});
```

This fits nicely with event delegation from [JavaScript chapter 21](../../JavaScript/21-events/notes.md): one listener, and an `instanceof` check to see what was actually clicked.

### Running TypeScript in a web page

Browsers can't run `.ts` files. Something has to turn them into JavaScript first. The easiest tool is **Vite** ([JavaScript chapter 50](../../JavaScript/50-tooling/notes.md)):

```
npm create vite@latest
```

Choose **Vanilla**, then **TypeScript**. Then:

```
cd my-project
npm install
npm run dev
```

Your code lives in `src/main.ts`. Every time you save, Vite converts it and refreshes the page. VS Code shows type errors as you type, and `npx tsc` checks the whole project.

(Vite's prompts can change a little between versions, but the idea stays the same.)

## Common mistakes

**1. Using `!` to silence `null` errors**

```ts
const button = document.querySelector("#buy")!; // "trust me, it's there"
```

The `!` (called the **non-null assertion**) tells TypeScript "this isn't null". If you're wrong, the page still crashes. Prefer a real check that throws a clear error.

**2. Using `as` when `instanceof` would check for real**

`document.getElementById("email") as HTMLInputElement` is a promise, not a check. If the element is actually a `<div>`, TypeScript believes you, and the bug waits for run time. `instanceof` checks for real.

**3. Using `event.target` without narrowing**

`event.target` can be any element, or even `null`. Check it with `instanceof` before using element-specific properties.

## Quick recap

- `querySelector` and `getElementById` can return `null`. Check before you use the result.
- Different elements have different types, like `HTMLInputElement` and `HTMLImageElement`.
- Tag selectors, `instanceof` checks, and `querySelector<Type>` all tell TypeScript the element type. `instanceof` is the safest.
- Event listeners get typed events automatically, but `event.target` must be narrowed.
- Browsers can't run `.ts` files. Use Vite with its TypeScript template.

---

**Next:** try the [exercises](exercises.md), then move on to [13 Typing Async Code and APIs](../13-async-and-apis/notes.md).
