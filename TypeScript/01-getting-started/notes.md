# 01 Getting Started

## What is it?

**TypeScript** is JavaScript with **types** added. A **type** is a label that says what kind of value something should hold: a number, some text, a list of products.

A tool called the **type checker** reads those labels and points out mistakes *before* you run the code.

## Why does it matter?

In JavaScript, many bugs only show up while the program runs, sometimes in front of a user:

```js
const price = "5"; // oops, text instead of a number
console.log(price * 2 + 1); // 11 (works by luck)
console.log(price + 1);     // "51" (wrong, and no error!)
```

You met this exact bug in [JavaScript chapter 38](../../JavaScript/38-type-coercion/notes.md). TypeScript catches it while you're typing. Your editor underlines the mistake in red, like a spell-checker.

That's why most professional JavaScript projects now use TypeScript: fewer bugs, better autocomplete in VS Code, and code that explains itself.

## Real-world example

Think of the labels on moving boxes, from JavaScript chapter 02:

| Moving house | TypeScript |
|---|---|
| A box labeled "Books" | `let title: string` |
| A friend checks the label before packing | The type checker |
| "Hey, you're putting a lamp in the Books box!" | A type error |
| The labels don't change what's inside | Types are removed before the code runs |

The checker is a helpful friend, not a guard. It warns you, but it can't stop you. That last row matters, and you'll see why below.

## How it works

### Set up your playground (once)

You'll write all your TypeScript practice in one folder. Create a folder called `playground` inside this `TypeScript` folder, open a terminal in it, and run:

```
npm init -y
npm install --save-dev typescript
```

Then two small edits:

1. In `package.json`, change `"type": "commonjs"` to `"type": "module"` (same as [JavaScript chapter 29](../../JavaScript/29-modules/notes.md)).
2. Create a file called `tsconfig.json` with these settings:

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

You don't need to understand every line yet. [Chapter 11](../11-tsconfig-and-modules/notes.md) explains them. The important one is `"strict": true`, which turns on all the useful checks.

### Your first TypeScript file

TypeScript files end in `.ts` instead of `.js`. Create `playground/hello.ts`:

```ts
const price: number = 5;
console.log("Price:", price * 2); // prints: Price: 10
```

The new part is `: number`. It's a **type annotation**: a label saying "`price` must always be a number". Everything else is plain JavaScript.

There are two separate steps: **run** the code, and **check** the types.

```
node hello.ts
npx tsc
```

- `node hello.ts` runs the file. Node 24 understands `.ts` files directly: it removes the types and runs the JavaScript that's left.
- `npx tsc` runs the **TypeScript compiler**, `tsc`. With our settings, it doesn't create any files. It only checks every `.ts` file in the folder and reports problems. No output means no problems.

### Your first type error

Now break the rule on purpose:

```ts
let age: number = 30;
age = "thirty";
// ❌ Type 'string' is not assignable to type 'number'.
console.log(age);
```

Run `npx tsc` and you'll see:

```
hello.ts(2,1): error TS2322: Type 'string' is not assignable to type 'number'.
```

Read it like a JavaScript error message: file `hello.ts`, line 2, column 1. "Not assignable" means "you can't put this value in that box". In VS Code, the same message appears when you hover over the red squiggly line.

> **Tip:** in this course, `// ❌` in a code example means "TypeScript reports this error here".

### Types disappear when the code runs

Here's the surprise. Run the broken file with `node hello.ts`:

```
thirty
```

It runs! Node removes the types *without checking them*. Types only exist while you write code. They never exist at run time.

So the rule is: **always run `npx tsc` too**, or keep an eye on the red squiggles in VS Code. A program with type errors can still run, but it's a program with a known bug.

### You don't have to label everything

TypeScript is good at working types out by itself. This is called **inference**:

```ts
let score = 10; // TypeScript infers: score is a number
score = "ten";
// ❌ Type 'string' is not assignable to type 'number'.
```

No annotation, same protection. You'll learn when to write types and when to let TypeScript infer them in [chapter 02](../02-basic-types/notes.md).

## Common mistakes

**1. Thinking `node` checks your types**

`node file.ts` runs code even when it has type errors. Checking is `npx tsc`'s job (or VS Code's squiggles).

**2. Running `npx tsc hello.ts` with a file name**

```
error TS5112: tsconfig.json is present but will not be loaded if files are specified on commandline. Use '--ignoreConfig' to skip this error.
```

When you give `tsc` a file name, it ignores your `tsconfig.json`. Run plain `npx tsc` instead: it checks every file, with your settings.

**3. Forgetting `"type": "module"`**

With `"type": "commonjs"`, your `import` lines won't work with Node, just like in JavaScript chapter 29.

**4. Running `tsc` in the wrong folder**

`tsc` looks for `tsconfig.json` in the folder your terminal is in. Open the terminal in `playground`.

## Quick recap

- TypeScript is JavaScript plus types. A type says what kind of value something should hold.
- `: number` after a name is a type annotation. TypeScript can also infer types by itself.
- `node file.ts` runs your code. `npx tsc` checks the types. They're separate steps.
- Types disappear at run time, so a file with type errors still runs. Always check with `tsc`.

---

**Next:** try the [exercises](exercises.md), then move on to [02 Basic Types](../02-basic-types/notes.md).
