# 13 Typing Async Code and APIs

## What is it?

This chapter adds types to code that waits ([JavaScript chapters 31–33](../../JavaScript/31-promises/notes.md)): promises, `async` functions, and data from APIs with `fetch`.

The big idea: data from the outside world has **no guaranteed type**. TypeScript can only protect you if you check it when it arrives.

## Why does it matter?

`response.json()` gives back whatever the server sent. TypeScript can't see the server, so by default it calls the result `any`, and all checking silently stops. One renamed field on the server, and your app shows `undefined` everywhere, with no warning.

Typing API data properly is one of the most valuable things TypeScript does in real apps.

## Real-world example

A **parcel from an online shop**:

| Parcel | API data |
|---|---|
| The order confirmation says "1 blue mug" | Your `interface Mug` |
| The box that actually arrives | The JSON from the server |
| Assuming the box matches the order | `const data: Mug = await response.json()` |
| Opening it and checking before you pay | A type guard that checks the data |

## How it works

### Async functions return promises

An `async` function always returns a promise. Its return type is `Promise<...>`, with the value type in the brackets (a generic, [chapter 08](../08-generics/notes.md)):

```ts
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadScore(): Promise<number> {
  await wait(100); // pretend this is a slow server
  return 42;
}

const score = await loadScore(); // score: number
console.log(score); // prints: 42
```

(Top-level `await` works because our files are modules.) Forget the `Promise`, and TypeScript tells you:

```ts
async function loadScore(): number {
  // ❌ The return type of an async function or method must be the global Promise<T> type. Did you mean to write 'Promise<number>'?
  return 42;
}
```

### The `any` hiding in `fetch`

```ts
// no-check
const response = await fetch("https://jsonplaceholder.typicode.com/users/1");
const user = await response.json(); // user: any
console.log(user.nmae); // a typo, and no error: prints undefined
```

Hover over `user`: it's `any`. The typo `nmae` goes straight through.

### Option 1: say what you expect

You can annotate the result:

```ts
interface User {
  id: number;
  name: string;
  email: string;
}

const response = await fetch("https://jsonplaceholder.typicode.com/users/1");
const user: User = await response.json();
console.log(user.name); // prints: Leanne Graham
```

Now `user.nmae` would be an error. But be honest about what this is: a **promise to TypeScript**, not a check. If the server sends something different, TypeScript still believes you. It's fine for APIs you trust and control.

### Option 2: treat it as `unknown`, then check

For data you don't control, start from `unknown` ([chapter 02](../02-basic-types/notes.md)) and check its shape with a **type guard**: a function that returns `value is User`:

```ts
interface User {
  id: number;
  name: string;
  email: string;
}

function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value && typeof value.id === "number" &&
    "name" in value && typeof value.name === "string" &&
    "email" in value && typeof value.email === "string"
  );
}

const response = await fetch("https://jsonplaceholder.typicode.com/users/1");
const data: unknown = await response.json();

if (isUser(data)) {
  console.log(`${data.name} <${data.email}>`); // prints: Leanne Graham <Sincere@april.biz>
} else {
  console.log("The server sent something unexpected");
}
```

`value is User` means: "if this function returns `true`, treat `value` as a `User`". Inside the `if`, TypeScript narrows `data` to `User`, like the narrowing in [chapter 06](../06-unions-and-narrowing/notes.md), but with your own check.

Writing guards by hand gets long for big objects. In real projects, people use validation libraries like **Zod**, which build the check and the type from one description. Now you know what they do inside.

### A reusable, typed `fetchJson`

Put the pieces together in one generic helper. It checks `response.ok` (remember, `fetch` doesn't reject on 404, [JavaScript chapter 33](../../JavaScript/33-fetch-and-apis/notes.md)), and takes a guard for the data:

```ts
interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

function isTodo(value: unknown): value is Todo {
  return (
    typeof value === "object" && value !== null &&
    "id" in value && typeof value.id === "number" &&
    "title" in value && typeof value.title === "string" &&
    "completed" in value && typeof value.completed === "boolean"
  );
}

async function fetchJson<T>(url: string, guard: (value: unknown) => value is T): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  const data: unknown = await response.json();
  if (!guard(data)) {
    throw new Error("Unexpected data from the server");
  }
  return data;
}

const todo = await fetchJson("https://jsonplaceholder.typicode.com/todos/1", isTodo); // todo: Todo
console.log(todo.title, todo.completed); // prints: delectus aut autem false
```

### Errors in `catch` are `unknown`

In strict mode, the `error` in a `catch` block has the type `unknown`, because JavaScript lets you throw *anything*, not only errors:

```ts
try {
  JSON.parse("{ not json");
} catch (error) {
  console.log(error.message);
  // ❌ 'error' is of type 'unknown'.
}
```

Narrow it with `instanceof Error`:

```ts
try {
  JSON.parse("{ not json");
} catch (error) {
  if (error instanceof Error) {
    console.log("Could not read the data:", error.name); // prints: Could not read the data: SyntaxError
  }
}
```

### Results that can succeed or fail

A clean pattern for "it worked, or it didn't" is a discriminated union ([chapter 06](../06-unions-and-narrowing/notes.md)):

```ts
type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function parsePrice(text: string): Result<number> {
  const price = Number(text);
  if (Number.isNaN(price)) {
    return { ok: false, error: `"${text}" is not a number` };
  }
  return { ok: true, data: price };
}

const result = parsePrice("abc");
if (result.ok) {
  console.log(result.data * 2);
} else {
  console.log(result.error); // prints: "abc" is not a number
}
```

TypeScript won't let you read `result.data` until you've checked `result.ok`. You can't forget the failure case.

## Common mistakes

**1. Leaving API data as `any`**

If you never type `response.json()`, you've switched TypeScript off for the most important data in your app. Annotate it, or better, check it.

**2. Thinking an annotation checks the data**

`const user: User = await response.json()` is a promise to TypeScript. Only a real check (a type guard, or a library like Zod) catches bad data at run time.

**3. Using `error.message` without narrowing**

`catch (error)` gives you `unknown`. Check `error instanceof Error` first.

**4. Writing `: number` on an async function**

Async functions return `Promise<number>`, not `number`.

## Quick recap

- Async functions return `Promise<T>`. Write it as the return type.
- `response.json()` is `any` by default, so type it, or TypeScript stops checking.
- An annotation is a promise. A type guard (`value is User`) is a real check.
- A generic `fetchJson<T>` with a guard gives you checked, typed data everywhere.
- `catch (error)` gives `unknown`: narrow with `instanceof Error`.
- `Result<T>` unions make you handle both success and failure.

---

**Next:** try the [exercises](exercises.md), then move on to [14 Project: Typed Shopping Cart](../14-project-typed-shopping-cart/notes.md).
