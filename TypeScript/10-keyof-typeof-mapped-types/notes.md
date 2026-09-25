# 10 keyof, typeof and Mapped Types

## What is it?

These are tools for **building types out of other types and values**:

- `keyof` gives you the property names of a type, as a union.
- `typeof` (in a type position) gives you the type of a value.
- **Indexed access**, like `User["email"]`, gives you the type of one property.
- `as const` makes a value's type as exact as possible.
- **Mapped types** make a new type by going through every property of another one.

This is how utility types like `Partial` from chapter 09 are built.

## Why does it matter?

The less you repeat yourself, the fewer things can get out of sync. These tools let you say "the keys of this type" or "the type of this object" instead of writing them out again. Change the original, and everything built from it updates by itself.

## Real-world example

A **restaurant menu** and the order slips the waiters use:

| Restaurant | TypeScript |
|---|---|
| The printed menu | An object value: `const menu = { soup: 5, pasta: 12 }` |
| The list of dishes you're allowed to order | `keyof typeof menu`: `"soup" \| "pasta"` |
| Add a dish to the menu, and the order slips update too | Types derived from values stay in sync |

## How it works

### `keyof`: the property names

```ts
interface Product {
  name: string;
  price: number;
  inStock: boolean;
}

type ProductKey = keyof Product; // "name" | "price" | "inStock"

const sortBy: ProductKey = "price";
const oops: ProductKey = "colour";
// ❌ Type '"colour"' is not assignable to type 'keyof Product'.
```

### Indexed access: the type of one property

Use square brackets on a *type* to get one property's type:

```ts
interface Product {
  name: string;
  price: number;
}

type Price = Product["price"]; // number

const discount: Price = 5;
console.log(discount); // prints: 5
```

### Put them together: a safe property getter

`keyof` and generics ([chapter 08](../08-generics/notes.md)) combine into something very useful:

```ts
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const mug = { name: "Mug", price: 12 };

const price = getProperty(mug, "price"); // price: number
const name = getProperty(mug, "name");   // name: string
console.log(name, price); // prints: Mug 12

getProperty(mug, "colour");
// ❌ Argument of type '"colour"' is not assignable to parameter of type '"name" | "price"'.
```

Read `K extends keyof T` as "K must be one of T's property names", and `T[K]` as "the type of that property".

### `typeof`: the type of a value

In normal code, `typeof` is JavaScript's run-time check ([JavaScript chapter 03](../../JavaScript/03-data-types/notes.md)). In a **type** position, it means "the type of this variable":

```ts
const defaultSettings = {
  theme: "light",
  fontSize: 16,
};

type Settings = typeof defaultSettings; // { theme: string; fontSize: number }

const mine: Settings = { theme: "dark", fontSize: 18 };
console.log(mine.theme); // prints: dark
```

Now the object is the single source of truth. Add a setting to `defaultSettings`, and `Settings` gets it too.

### `as const`: the most exact type

Normally, TypeScript widens values to general types: `"light"` becomes `string`. `as const` keeps them exact and makes everything read-only:

```ts
const sizes = ["small", "medium", "large"] as const;
// sizes: readonly ["small", "medium", "large"]

type Size = (typeof sizes)[number]; // "small" | "medium" | "large"

const pick: Size = "medium";
console.log(sizes.length, pick); // prints: 3 medium
```

`(typeof sizes)[number]` means "the type of any item in this array". This trick gives you a list you can loop over at run time *and* a union type, from one line. It's the enum replacement promised in [chapter 06](../06-unions-and-narrowing/notes.md):

```ts
const Status = {
  Pending: "pending",
  Shipped: "shipped",
} as const;

type Status = (typeof Status)[keyof typeof Status]; // "pending" | "shipped"

function ship(status: Status): string {
  return status === Status.Pending ? "Shipping now" : "Already shipped";
}

console.log(ship(Status.Pending)); // prints: Shipping now
```

### `satisfies`: check a value without changing its type

`satisfies` checks that a value matches a type, but keeps the value's exact inferred type:

```ts
type Size = "small" | "medium" | "large";

const prices = {
  small: 3,
  medium: 4,
  large: 5,
} satisfies Record<Size, number>;

console.log(prices.large); // prints: 5
```

If you forget a size or misspell one, TypeScript complains, like with a normal annotation.

### Mapped types

A **mapped type** goes through every key of a type and builds a new property for each one. It looks like a loop inside a type:

```ts
interface Settings {
  theme: string;
  fontSize: number;
}

type Flags<T> = {
  [K in keyof T]: boolean; // for each key K in T, make a boolean property
};

type ChangedSettings = Flags<Settings>; // { theme: boolean; fontSize: boolean }

const changed: ChangedSettings = { theme: true, fontSize: false };
console.log(changed); // prints: { theme: true, fontSize: false }
```

Here's how `Partial` from chapter 09 is really built:

```ts
// no-check
type MyPartial<T> = {
  [K in keyof T]?: T[K]; // same keys, same types, but optional
};
```

You won't write mapped types every day. But when you see one in a library, you'll know it's "a loop over the keys".

## Common mistakes

**1. Mixing up the two `typeof`s**

`typeof x === "string"` is JavaScript, and runs when the code runs. `type T = typeof x` is TypeScript, and only exists while type checking.

**2. Forgetting `as const`**

```ts
const sizes = ["small", "medium"];
type Size = (typeof sizes)[number]; // just string, not the exact sizes
```

Without `as const`, the array is a `string[]`, so the union collapses to `string`.

**3. Over-engineering**

These tools are powerful, which makes them tempting. If a simple `interface` does the job, use it (KISS). Reach for mapped types only when you'd otherwise repeat yourself a lot.

## Quick recap

- `keyof T` is a union of `T`'s property names, and `T["key"]` is one property's type.
- `K extends keyof T` with `T[K]` gives you type-safe property access.
- `typeof value` in a type gives you the type of a value, so a value can be the source of truth.
- `as const` keeps exact literal types. `(typeof arr)[number]` turns a list into a union.
- `satisfies` checks a value against a type without changing its type.
- Mapped types (`[K in keyof T]: ...`) build new types by looping over keys.

---

**Next:** try the [exercises](exercises.md), then move on to [11 tsconfig and Modules](../11-tsconfig-and-modules/notes.md).
