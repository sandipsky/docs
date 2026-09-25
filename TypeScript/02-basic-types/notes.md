# 02 Basic Types

## What is it?

The **basic types** are TypeScript's names for JavaScript's everyday values: `string`, `number`, `boolean`, `null` and `undefined`. Plus two special ones: `any` (turn checking off) and `unknown` (check before you use it).

## Why does it matter?

Once TypeScript knows a value's type, it can tell you what you're allowed to do with it. Text has `.toUpperCase()`, numbers don't. So instead of finding out at run time with a `TypeError`, you find out while typing.

You also get **autocomplete**: type a dot after a string in VS Code, and it lists every string method. No more guessing method names.

## Real-world example

Think of the plugs and sockets in your house:

| Plugs and sockets | TypeScript |
|---|---|
| Each plug has a shape | Each value has a type |
| A socket accepts one shape | A variable or parameter accepts one type |
| A UK plug won't go in a US socket | `"thirty"` won't go in a `number` box |
| A universal adapter fits anything, but gives no protection | `any` |

## How it works

### Annotations for the basic types

You met `: number` in chapter 01. The other basic types work the same way:

```ts
const city: string = "Kathmandu";
const temperature: number = 23.5; // whole numbers and decimals are both "number"
const isRaining: boolean = false;

console.log(city, temperature, isRaining); // prints: Kathmandu 23.5 false
```

They're the same types you learned with `typeof` in [JavaScript chapter 03](../../JavaScript/03-data-types/notes.md), always written in lowercase.

### Inference: let TypeScript do the work

Most of the time, you don't need to write the type. TypeScript sees the starting value and works it out:

```ts
let city = "Kathmandu"; // TypeScript infers: string
let temperature = 23.5; // number

city = 42;
// ❌ Type 'number' is not assignable to type 'string'.
```

Hover over `city` in VS Code, and it shows `let city: string`. The protection is exactly the same as with an annotation.

So when should you write types yourself? A simple rule:

- **Let TypeScript infer** when you give a variable its value straight away.
- **Write the type** when TypeScript can't see the value yet: function parameters ([chapter 05](../05-functions/notes.md)), empty arrays, and variables you fill in later.

```ts
let winner: string; // no value yet, so say what it will hold
winner = "Maya";
console.log(winner); // prints: Maya
```

### The checker knows what each type can do

This is where TypeScript really pays off:

```ts
let price = 25;
console.log(price.toUpperCase());
// ❌ Property 'toUpperCase' does not exist on type 'number'.
```

In plain JavaScript, that's a `TypeError` at run time. In TypeScript, it's a red squiggle before you even save.

It also catches typos in method names:

```ts
let name = "sam";
console.log(name.toUppercase());
// ❌ Property 'toUppercase' does not exist on type 'string'. Did you mean 'toUpperCase'?
```

### `null` and `undefined`

With `"strict": true`, a `string` can't secretly be `null` or `undefined`:

```ts
let nickname: string = "Sam";
nickname = null;
// ❌ Type 'null' is not assignable to type 'string'.
```

If something really can be missing, you say so with `|` ("or"):

```ts
let nickname: string | null = null; // text, or nothing yet
nickname = "Sam";
console.log(nickname); // prints: Sam
```

That `|` is called a **union type**. It's so useful that [chapter 06](../06-unions-and-narrowing/notes.md) is all about it.

### `any`: switching the checker off

`any` means "this can be anything, don't check it":

```ts
let data: any = "hello";
data = 42;
data.fly(); // no error from TypeScript... but it crashes when it runs
```

`any` is the universal adapter: it fits everything and protects nothing. You'll see it in older code and quick experiments. Avoid writing it yourself.

### `unknown`: the safe version of `any`

Sometimes you really don't know the type yet, like data from a user or an API. Use `unknown`. It accepts anything, but won't let you *use* the value until you check what it is:

```ts
let input: unknown = "hello";

console.log(input.toUpperCase());
// ❌ 'input' is of type 'unknown'.

if (typeof input === "string") {
  console.log(input.toUpperCase()); // fine: inside this if, input is a string
}
```

That `typeof` check is called **narrowing**: TypeScript follows your `if` and knows the type inside it. More in [chapter 06](../06-unions-and-narrowing/notes.md).

| Type | Accepts any value? | Can you use it freely? |
|---|---|---|
| `any` | Yes | Yes, with no protection |
| `unknown` | Yes | No, check it first |

## Common mistakes

**1. Using capital letters**

```ts
const title: String = "Dune"; // works, but it's the wrong type
```

`String`, `Number` and `Boolean` (capitalized) are JavaScript's wrapper objects, not the basic types. Always use lowercase: `string`, `number`, `boolean`.

**2. Annotating everything**

```ts
const count: number = 5; // the annotation adds nothing here
```

TypeScript already knows `5` is a number. Extra annotations are just noise. Save them for places inference can't see.

**3. Reaching for `any` to make an error go away**

It makes the red line disappear, but it also makes the bug disappear from view, not from your program. Use `unknown` and check the value, or fix the real type.

**4. Forgetting that some values can be `null`**

If a value can be missing, include `| null` in its type. Then TypeScript reminds you to handle the empty case.

## Quick recap

- The basic types are `string`, `number`, `boolean`, `null` and `undefined`, all lowercase.
- TypeScript infers types from starting values. Write types when it can't see the value.
- The checker knows what each type can do, so typos and wrong methods get caught early.
- In strict mode, missing values must be allowed on purpose, like `string | null`.
- `any` turns checking off. Prefer `unknown`, which makes you check before you use it.

---

**Next:** try the [exercises](exercises.md), then move on to [03 Arrays, Tuples and Objects](../03-arrays-tuples-objects/notes.md).
