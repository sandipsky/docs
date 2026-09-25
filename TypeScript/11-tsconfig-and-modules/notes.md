# 11 tsconfig and Modules

## What is it?

`tsconfig.json` is the settings file for the TypeScript checker. It says how strict to be, which features to allow, and how your files connect.

This chapter also covers TypeScript's extras for **modules** ([JavaScript chapter 29](../../JavaScript/29-modules/notes.md)): importing types, and **type definitions** for packages and for Node itself.

## Why does it matter?

The same code can pass or fail depending on the settings. With `"strict": false`, TypeScript misses whole families of bugs. Understanding the settings means you can read any project's `tsconfig.json`, and you'll know why a line that's fine in one project is an error in another.

## Real-world example

Think of the settings on a **spell-checker**:

| Spell-checker settings | tsconfig |
|---|---|
| Language: British or American English | `target` and `lib`: which JavaScript features exist |
| "Also check grammar" | `"strict": true` |
| A dictionary for medical words | `@types/node`: extra words (types) for Node |

## How it works

### Your playground settings, line by line

Here's the `tsconfig.json` from [chapter 01](../01-getting-started/notes.md):

```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "nodenext",
    "lib": ["esnext", "dom"],
    "strict": true,
    "noEmit": true,
    "allowImportingTsExtensions": true,
    "erasableSyntaxOnly": true,
    "verbatimModuleSyntax": true
  }
}
```

| Setting | What it means |
|---|---|
| `target: "esnext"` | You're writing modern JavaScript. Allow the newest features. |
| `module: "nodenext"` | Follow Node's module rules, including `"type": "module"` in `package.json`. |
| `lib: ["esnext", "dom"]` | Which built-in things exist: modern JavaScript, plus browser things like `document` and `fetch`. |
| `strict: true` | Turn on all the important safety checks (next section). |
| `noEmit: true` | Only check. Don't create `.js` files (Node runs `.ts` directly). |
| `allowImportingTsExtensions: true` | Allow `import ... from "./cart.ts"`, with `.ts`, which Node needs. |
| `erasableSyntaxOnly: true` | Warn about TypeScript features Node can't run, like `enum` (chapter 06). |
| `verbatimModuleSyntax: true` | Make you mark type-only imports clearly (see below). |

### What `strict` turns on

`"strict": true` is a bundle of checks. The ones you've already met:

| Check | Catches |
|---|---|
| `strictNullChecks` | Using something that might be `null` or `undefined` (chapter 02) |
| `noImplicitAny` | Parameters with no type (chapter 05) |
| `strictPropertyInitialization` | Class properties that never get a value (chapter 07) |

Always start new projects with `"strict": true`. Turning it on later, in a big project, means fixing hundreds of errors at once.

### Extra checks worth knowing

These aren't part of `strict`, but many teams add them:

- `"noUncheckedIndexedAccess": true` makes `array[i]` return `T | undefined`, fixing the "trusting array indexes" mistake from [chapter 03](../03-arrays-tuples-objects/notes.md). With it, `colors[1].toUpperCase()` gives `'c' is possibly 'undefined'.`
- `"noUnusedLocals": true` reports variables you declared but never used.

Try adding one to your playground, run `npx tsc`, and see what it finds.

### Importing and exporting

Modules work exactly like in JavaScript chapter 29. Types can be exported too:

```ts
// no-check
// cart.ts
export interface Product {
  name: string;
  price: number;
}

export function total(items: Product[]): number {
  return items.reduce((sum, product) => sum + product.price, 0);
}
```

One difference: with Node running `.ts` files directly, the import path uses the **`.ts`** extension.

### `import type`

`Product` is a type, and types disappear when the code runs. So when you import one, you mark it with `type`:

```ts
// no-check
// main.ts
import type { Product } from "./cart.ts";
import { total } from "./cart.ts";

const items: Product[] = [{ name: "Mug", price: 12 }];
console.log(total(items)); // prints: 12
```

Forget the `type`, and `verbatimModuleSyntax` reminds you:

```
error TS1484: 'Product' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.
```

Why bother? When Node strips the types, it needs to know which imports to delete. `import type` tells it: "this whole line is only for the checker".

You can also mix both in one line: `import { total, type Product } from "./cart.ts";`.

### Type definitions: `.d.ts` files and `@types`

Many npm packages are written in JavaScript. How does TypeScript know their types? From **type definition files**, which end in `.d.ts`. They contain only types, no code, like a menu without the kitchen.

- Many packages include their own `.d.ts` files. You install them, and the types just work.
- For others, the community writes definitions, published as `@types/<name>`, like `@types/lodash`.

**Node itself** is one of these. Using `process` fails at first:

```ts
// no-check
console.log(process.argv.length);
// ❌ Cannot find name 'process'. Do you need to install type definitions for node? ...
```

The fix is two steps:

1. Install the definitions: `npm install --save-dev @types/node`
2. Tell TypeScript to use them, by adding `"types": ["node"]` to `compilerOptions`.

(Recent TypeScript versions need step 2. Older tutorials only mention step 1.)

### When you need `.js` files

Node runs `.ts` directly, but browsers don't, and npm packages are usually published as JavaScript. Then you *do* want `tsc` (or a tool like Vite, [JavaScript chapter 50](../../JavaScript/50-tooling/notes.md)) to write `.js` files. In that case, you'd remove `noEmit`, and set an `outDir`, the folder where the `.js` files go:

```json
{
  "compilerOptions": {
    "outDir": "dist"
  }
}
```

For browser projects, Vite handles this for you ([chapter 12](../12-typescript-in-the-browser/notes.md)).

## Common mistakes

**1. Turning `strict` off to make errors go away**

The errors are bugs TypeScript found for you. Fix them, don't hide them.

**2. Importing a type without `type`**

With `verbatimModuleSyntax`, write `import type { Product }`, or `import { type Product }`.

**3. Leaving out `.ts` in import paths**

`import { total } from "./cart"` fails when Node runs it. Write `"./cart.ts"`.

**4. Installing `@types/node` and nothing else**

Also add `"types": ["node"]` to your `tsconfig.json`.

## Quick recap

- `tsconfig.json` holds the checker's settings. Always use `"strict": true`.
- `strict` includes `strictNullChecks`, `noImplicitAny` and `strictPropertyInitialization`.
- Import types with `import type`, and use `.ts` in import paths when Node runs your files.
- `.d.ts` files and `@types/...` packages describe the types of JavaScript code.
- For Node's own types: install `@types/node` and add `"types": ["node"]`.

---

**Next:** try the [exercises](exercises.md), then move on to [12 TypeScript in the Browser](../12-typescript-in-the-browser/notes.md).
