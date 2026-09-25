# 08 Generics

## What is it?

A **generic** is a type with a blank in it, which gets filled in later. You write the blank as `<T>` (short for "Type"), and TypeScript fills it in based on how you use it.

You've already used generics without knowing: `Array<string>` is the generic `Array` with its blank filled in as `string`.

## Why does it matter?

Say you want a function that returns the first item of any list. Without generics, you have two bad choices:

- Write one version per type (`firstString`, `firstNumber`, `firstProduct`...). Lots of copying.
- Use `any`, and lose all type checking.

Generics give you one function that works for every type *and* keeps the types. If you pass in a list of products, TypeScript knows you get a product back.

## Real-world example

A **lunch box**:

| Lunch box | Generics |
|---|---|
| The same box can carry a sandwich, rice, or fruit | One generic type: `Box<T>` |
| Today it's labeled "sandwich" | `Box<Sandwich>` |
| Open it, and you know what you'll find | TypeScript knows the type of what comes out |
| "Must fit in the fridge" | A constraint: `T extends ...` |

## How it works

### A generic function

```ts
function first<T>(items: T[]): T | undefined {
  return items[0];
}

const song = first(["Flowers", "Levitating"]); // song: string | undefined
const score = first([90, 75, 81]);             // score: number | undefined

console.log(song, score); // prints: Flowers 90
```

Read `first<T>(items: T[]): T` as: "for any type `T`, take an array of `T`, and give back a `T`".

You never said what `T` is. TypeScript **inferred** it from the argument: an array of strings means `T` is `string`. You can also fill it in yourself: `first<string>([...])`. That's rarely needed.

(`| undefined` is there because an empty array has no first item.)

### Compare with `any`

```ts
function firstAny(items: any[]): any {
  return items[0];
}

const song = firstAny(["Flowers"]);
song.toFixed(2); // no error from TypeScript... but it crashes when it runs
```

With `any`, the type information is thrown away. With `T`, it flows through the function.

### Generic interfaces and types

Types can have blanks too. A common one is an API response that can hold any kind of data:

```ts
interface ApiResponse<T> {
  ok: boolean;
  data: T;
}

interface User {
  name: string;
}

const userResponse: ApiResponse<User> = { ok: true, data: { name: "Asha" } };
const countResponse: ApiResponse<number> = { ok: true, data: 42 };

console.log(userResponse.data.name);   // prints: Asha
console.log(countResponse.data + 1);   // prints: 43
```

Write the interface once, reuse it for every kind of data. [Chapter 13](../13-async-and-apis/notes.md) uses exactly this with `fetch`.

### Generics you already know

| You've written | It's the generic... |
|---|---|
| `string[]` | `Array<string>` |
| An `async` function's result | `Promise<T>`, like `Promise<number>` |
| `new Map()` from JavaScript chapter 35 | `Map<K, V>`, like `Map<string, number>` |

```ts
const stock = new Map<string, number>(); // keys are strings, values are numbers
stock.set("mug", 12);
stock.set("poster", "lots");
// ❌ Argument of type 'string' is not assignable to parameter of type 'number'.
```

### Constraints: "T, but it must have..."

Sometimes your function needs something from `T`. This fails, because not every type has `.length`:

```ts
function longest<T>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
  // ❌ Property 'length' does not exist on type 'T'.
}
```

Add a **constraint** with `extends`: "T can be any type, as long as it has a `length` number":

```ts
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}

console.log(longest("tea", "coffee")); // prints: coffee
console.log(longest([1, 2], [1, 2, 3])); // prints: [ 1, 2, 3 ]
longest(10, 20);
// ❌ Argument of type 'number' is not assignable to parameter of type '{ length: number; }'.
```

A very practical example: find any item by its `id`, whatever kind of item it is:

```ts
function findById<T extends { id: number }>(items: T[], id: number): T | undefined {
  return items.find((item) => item.id === id);
}

const products = [
  { id: 1, name: "Mug", price: 12 },
  { id: 2, name: "Poster", price: 8 },
];

const found = findById(products, 2); // found: { id: number; name: string; price: number } | undefined
console.log(found?.name); // prints: Poster
```

### More than one blank

Use a second letter for a second type:

```ts
function pair<A, B>(first: A, second: B): [A, B] {
  return [first, second];
}

const entry = pair("Asha", 92); // entry: [string, number]
console.log(entry); // prints: [ 'Asha', 92 ]
```

`T`, `U`, `K` (key) and `V` (value) are the usual letters. For clarity, you can use full names too, like `<Item>`.

## Common mistakes

**1. Using `any` when you mean "any type, but keep it"**

If the output type depends on the input type, you want a generic, not `any`.

**2. Adding generics that aren't needed**

```ts
function greet<T extends string>(name: T): string {
  return `Hi, ${name}`;
}
```

`T` is only used once, so it adds nothing. `function greet(name: string)` is simpler. A generic is useful when it **connects** two things, like the input and the output.

**3. Forgetting the constraint**

`Property 'x' does not exist on type 'T'` means TypeScript doesn't know `T` has `x`. Add `T extends { x: ... }`.

## Quick recap

- A generic is a type with a blank, written `<T>`, that gets filled in later.
- TypeScript usually infers `T` from the arguments, so the types flow through your function.
- Interfaces and types can be generic too: `ApiResponse<T>`, `Box<T>`.
- `Array<T>`, `Promise<T>` and `Map<K, V>` are generics you already use.
- `T extends { id: number }` is a constraint: any type, as long as it has what you need.

---

**Next:** try the [exercises](exercises.md), then move on to [09 Utility Types](../09-utility-types/notes.md).
