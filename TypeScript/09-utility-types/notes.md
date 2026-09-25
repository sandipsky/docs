# 09 Utility Types

## What is it?

**Utility types** are ready-made generic types that come with TypeScript. Each one takes a type you already have and makes a new version of it: all properties optional, some properties removed, everything read-only, and so on.

## Why does it matter?

Real apps need many *variations* of the same type. Take a `User`:

- The sign-up form needs every field.
- The "edit profile" form lets you change just some fields.
- The public profile must never include the password.

Without utility types, you'd copy `User` three times and keep all the copies in sync by hand. With them, you write `User` once and describe each variation in one line.

## Real-world example

A **photo editing app**: you don't retake the photo to make a variation. You apply a filter to the original.

| Photo filter | Utility type |
|---|---|
| Crop to just the faces | `Pick<User, "name" \| "email">` |
| Blur out one thing | `Omit<User, "password">` |
| "Make every part optional" | `Partial<User>` |
| Lock the photo so it can't be edited | `Readonly<User>` |

The original stays the same. Each filter gives you a new version.

## How it works

All the examples below use this type:

```ts
// no-check
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}
```

### `Partial<T>`: every property optional

Perfect for updates, where you only send what changed:

```ts
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

function updateUser(user: User, changes: Partial<User>): User {
  return { ...user, ...changes }; // spread from JavaScript chapter 15
}

const sam: User = { id: 1, name: "Sam", email: "sam@example.com", password: "secret" };
const updated = updateUser(sam, { email: "sam@new.com" });
console.log(updated.email); // prints: sam@new.com
```

`Partial<User>` means `{ id?: number; name?: string; email?: string; password?: string }`, without you writing it.

### `Required<T>`: the opposite

`Required<T>` makes every property required, even the ones marked `?`. Handy when a settings object has optional fields, but after you fill in the defaults, they're all there.

### `Pick<T, Keys>` and `Omit<T, Keys>`

`Pick` keeps only the properties you name. `Omit` keeps everything *except* the ones you name. The property names are written as a union of literals ([chapter 06](../06-unions-and-narrowing/notes.md)):

```ts
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

type PublicUser = Omit<User, "password">; // id, name, email
type LoginForm = Pick<User, "email" | "password">; // email, password

const profile: PublicUser = { id: 1, name: "Sam", email: "sam@example.com" };
const login: LoginForm = { email: "sam@example.com", password: "secret" };

const leaky: PublicUser = { id: 1, name: "Sam", email: "sam@example.com", password: "secret" };
// ❌ Object literal may only specify known properties, and 'password' does not exist in type 'PublicUser'.
```

That last line is TypeScript helping with security: a `PublicUser` can't accidentally carry a password ([JavaScript chapter 51](../../JavaScript/51-security-basics/notes.md)).

### `Readonly<T>`: nothing can change

```ts
interface Settings {
  theme: string;
  fontSize: number;
}

const defaults: Readonly<Settings> = { theme: "light", fontSize: 16 };
defaults.fontSize = 20;
// ❌ Cannot assign to 'fontSize' because it is a read-only property.
```

Like `Object.freeze` from [JavaScript chapter 43](../../JavaScript/43-functional-programming/notes.md), but checked before the code runs. (It's shallow too: nested objects aren't locked.)

### `Record<Keys, Value>`: a lookup table

`Record` describes an object where every key has the same type of value:

```ts
type Size = "small" | "medium" | "large";

const coffeePrices: Record<Size, number> = {
  small: 3,
  medium: 4,
  large: 5,
};

console.log(coffeePrices.medium); // prints: 4
```

With literal keys like `Size`, TypeScript also checks that none are missing:

```ts
type Size = "small" | "medium" | "large";

const teaPrices: Record<Size, number> = { small: 2, medium: 3 };
// ❌ Property 'large' is missing in type '{ small: number; medium: number; }' but required in type 'Record<Size, number>'.
```

With `string` keys, like `Record<string, number>`, it's a flexible dictionary (a `Map` from JavaScript chapter 35 is often better for those).

### `ReturnType<T>`: the type a function returns

Sometimes a function already exists, and you want the type of what it returns without writing it again:

```ts
function createOrder(item: string, quantity: number) {
  return { item, quantity, createdAt: "2026-09-24" };
}

type Order = ReturnType<typeof createOrder>;
// Order is { item: string; quantity: number; createdAt: string }

const order: Order = createOrder("mug", 2);
console.log(order.quantity); // prints: 2
```

`typeof createOrder` means "the type of this function". You'll see more of this `typeof` in [chapter 10](../10-keyof-typeof-mapped-types/notes.md).

### Quick reference

| Utility | Gives you |
|---|---|
| `Partial<T>` | All properties optional |
| `Required<T>` | All properties required |
| `Readonly<T>` | All properties read-only |
| `Pick<T, "a" \| "b">` | Only `a` and `b` |
| `Omit<T, "a">` | Everything except `a` |
| `Record<K, V>` | An object with keys `K` and values `V` |
| `ReturnType<typeof fn>` | What `fn` returns |
| `NonNullable<T>` | `T` without `null` and `undefined` |

## Common mistakes

**1. Copying a type instead of deriving it**

If `EditUserForm` is "User, but everything optional", write `Partial<User>`. When `User` changes, the variation updates by itself.

**2. Misspelling a key in `Pick` or `Omit`**

```ts
interface User {
  name: string;
  email: string;
}

type OnlyName = Pick<User, "nmae">;
// ❌ Type '"nmae"' does not satisfy the constraint 'keyof User'.
```

The error mentions `keyof`, which [chapter 10](../10-keyof-typeof-mapped-types/notes.md) explains.

**3. Expecting `Readonly` to lock nested objects**

`Readonly<T>` only locks the top level, like `Object.freeze`.

## Quick recap

- Utility types make new versions of a type you already have, so you write the original once.
- `Partial` and `Required` flip whether properties are optional.
- `Pick` keeps some properties, and `Omit` removes some.
- `Readonly` stops changes, and `Record` describes lookup tables.
- `ReturnType<typeof fn>` gives you the type a function returns.

---

**Next:** try the [exercises](exercises.md), then move on to [10 keyof, typeof and Mapped Types](../10-keyof-typeof-mapped-types/notes.md).
