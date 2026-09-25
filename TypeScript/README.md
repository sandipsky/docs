# TypeScript: JavaScript With Types

TypeScript is JavaScript plus **types**: labels that say what kind of value each thing should hold. A tool reads those labels and warns you about mistakes *before* you run your code.

This folder only covers what TypeScript **adds**. Everything else (variables, loops, functions, classes, async...) works exactly like in the [JavaScript course](../JavaScript/README.md), so finish that first, or at least Level 1 and 2.

## How to use this folder

1. **Read** the chapter's `notes.md`.
2. **Type every example yourself** in your playground folder (set up in chapter 01).
3. **Do the exercises** in `exercises.md`. Try on your own before you open a hint.
4. **Ask Claude to check your work** when you're done or stuck.
5. **Tick the chapter off** below (change `[ ]` to `[x]`).

**What you need:** Node.js (already installed) and the TypeScript package, which chapter 01 installs.

---

## Level 1: The Basics

*Goal: add types to everyday JavaScript and understand what TypeScript is telling you.*

- [ ] [01 Getting Started](01-getting-started/notes.md): what TypeScript is, and your first type error
- [ ] [02 Basic Types](02-basic-types/notes.md): annotations, inference, `any` and `unknown`
- [ ] [03 Arrays, Tuples and Objects](03-arrays-tuples-objects/notes.md): typing lists and records
- [ ] [04 Type Aliases and Interfaces](04-type-aliases-and-interfaces/notes.md): naming your own types
- [ ] [05 Functions](05-functions/notes.md): typing inputs and outputs
- [ ] [06 Unions and Narrowing](06-unions-and-narrowing/notes.md): "this OR that", and how TypeScript figures out which
- [ ] [07 Classes](07-classes/notes.md): `public`, `private`, `readonly`, and `implements`

## Level 2: Reusable Types

*Goal: write flexible types once and reuse them everywhere.*

- [ ] [08 Generics](08-generics/notes.md): types with blanks you fill in later
- [ ] [09 Utility Types](09-utility-types/notes.md): `Partial`, `Pick`, `Omit`, `Record` and friends
- [ ] [10 keyof, typeof and Mapped Types](10-keyof-typeof-mapped-types/notes.md): building types from other types

## Level 3: Real Projects

*Goal: use TypeScript in real Node and browser projects.*

- [ ] [11 tsconfig and Modules](11-tsconfig-and-modules/notes.md): settings, strict mode, `import type`, and `@types`
- [ ] [12 TypeScript in the Browser](12-typescript-in-the-browser/notes.md): typing the DOM and events
- [ ] [13 Typing Async Code and APIs](13-async-and-apis/notes.md): promises, `fetch`, and data you can't trust
- [ ] [14 Project: Typed Shopping Cart](14-project-typed-shopping-cart/notes.md): convert a JavaScript project to TypeScript

---

**After this:** React with TypeScript is the most common next step.
