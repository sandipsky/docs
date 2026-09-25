# 06 Unions and Narrowing

## What is it?

A **union type** says a value can be one of several types: `string | number` means "a string OR a number".

**Narrowing** is how TypeScript works out which one it is right now, by following your `if` checks.

A **literal type** is a type that allows only one exact value, like `"small"`. Unions of literals, like `"small" | "medium" | "large"`, are one of TypeScript's most useful tools.

## Why does it matter?

Real data is often "this or that": an ID that's a number or a string, a result that's data or an error, an order that's `"pending"`, `"shipped"` or `"delivered"`.

Unions let you describe that exactly. Narrowing makes sure you handle every case before you use the value. And literal types turn typos like `"shiped"` into errors.

## Real-world example

A coffee shop menu:

| Coffee shop | TypeScript |
|---|---|
| "Pay by cash or card" | `type Payment = Cash \| Card` |
| The cashier checks which one you're holding before doing anything | Narrowing |
| Cup sizes: small, medium or large only | `type Size = "small" \| "medium" \| "large"` |
| "Can I get a huge?" "Sorry, that's not a size." | A type error |

## How it works

### Union types

```ts
function printId(id: number | string): void {
  console.log(`Your ID is ${id}`);
}

printId(101);     // prints: Your ID is 101
printId("A-202"); // prints: Your ID is A-202
```

With a union, you can only use what **all** the members have in common:

```ts
function shout(id: number | string) {
  return id.toUpperCase();
  // ❌ Property 'toUpperCase' does not exist on type 'string | number'.
}
```

That's TypeScript protecting you: if `id` is a number, `toUpperCase` would crash.

### Narrowing with `typeof`

Check the type first, and TypeScript follows along:

```ts
function formatId(id: number | string): string {
  if (typeof id === "string") {
    return id.toUpperCase(); // here, id is a string
  }
  return id.toFixed(0);      // here, id must be a number
}

console.log(formatId("a-202")); // prints: A-202
console.log(formatId(101));     // prints: 101
```

Hover over `id` on each line in VS Code, and you'll see its type change. After the `if` returns, TypeScript knows the string case is handled, so the rest is a number.

### Other ways to narrow

Most normal JavaScript checks narrow types:

```ts
function welcome(name: string | null): string {
  if (name === null) {
    return "Welcome, guest!";
  }
  return `Welcome, ${name}!`; // name is a string here
}

console.log(welcome(null));  // prints: Welcome, guest!
console.log(welcome("Sam")); // prints: Welcome, Sam!
```

| Check | Narrows... |
|---|---|
| `typeof x === "string"` | basic types |
| `x === null`, `if (x)` | away `null` and `undefined` |
| `Array.isArray(x)` | arrays |
| `"price" in x` | objects with a certain property |
| `x instanceof Date` | class instances |

### Literal types

A literal type allows exactly one value. On its own, that's not very useful. In a union, it's brilliant:

```ts
type Size = "small" | "medium" | "large";

function coffeePrice(size: Size): number {
  if (size === "small") return 3;
  if (size === "medium") return 4;
  return 5;
}

console.log(coffeePrice("medium")); // prints: 4
coffeePrice("huge");
// ❌ Argument of type '"huge"' is not assignable to parameter of type 'Size'.
```

VS Code also autocompletes the three sizes when you type `coffeePrice("`.

Remember from chapter 02 that `const` gives a literal type: `const size = "small"` has the type `"small"`, while `let size = "small"` has the type `string`.

### Discriminated unions

Here's the pattern you'll use most. Several object types share one property, like `kind`, with a different literal value in each:

```ts
interface Cash {
  kind: "cash";
  amount: number;
}

interface Card {
  kind: "card";
  amount: number;
  last4: string;
}

type Payment = Cash | Card;

function describe(payment: Payment): string {
  switch (payment.kind) {
    case "cash":
      return `Cash: $${payment.amount}`;
    case "card":
      return `Card ending ${payment.last4}: $${payment.amount}`; // last4 exists here
  }
}

console.log(describe({ kind: "cash", amount: 20 }));
console.log(describe({ kind: "card", amount: 35, last4: "4242" }));
```

You'll see:

```
Cash: $20
Card ending 4242: $35
```

The shared `kind` property is called the **discriminant**: checking it tells TypeScript which type you have, so inside `case "card"`, it knows `last4` exists.

### Never miss a case

What if someone adds a third payment type later? You can make TypeScript tell you about every `switch` that forgot it. The type `never` means "this can't happen":

```ts
interface Cash { kind: "cash"; amount: number }
interface Card { kind: "card"; amount: number }
interface Voucher { kind: "voucher"; code: string }
type Payment = Cash | Card | Voucher;

function describe(payment: Payment): string {
  switch (payment.kind) {
    case "cash":
      return "Cash";
    case "card":
      return "Card";
    default: {
      const unhandled: never = payment;
      // ❌ Type 'Voucher' is not assignable to type 'never'.
      return unhandled;
    }
  }
}
```

If every case is handled, nothing can reach `default`, and `payment` has the type `never` there. When a case is missing, the error names it: you forgot `Voucher`. Add `case "voucher"`, and the error goes away.

### What about `enum`?

In other code, you'll see `enum`, an older way to make a set of named values:

```ts
// no-check
enum Size { Small, Medium, Large }
```

Node can't run `enum` directly (you'd get `TypeScript enum is not supported in strip-only mode`), and our `erasableSyntaxOnly` setting warns about it. A union of literals does the same job and is simpler, so this course uses those. If you need the values at run time too, use an object with `as const` ([chapter 10](../10-keyof-typeof-mapped-types/notes.md)).

## Common mistakes

**1. Using a member-only method without narrowing**

`Property 'x' does not exist on type 'A | B'` means "only one of them has this". Narrow first.

**2. Typos in literal strings**

```ts
type Status = "pending" | "shipped";
const status: Status = "shiped";
// ❌ Type '"shiped"' is not assignable to type 'Status'. Did you mean '"shipped"'?
```

This is exactly the kind of bug literal types catch, and TypeScript even suggests the fix. Plain `string` would have let it through.

**3. Using `let` when you want a literal**

`let size = "small"` is a `string`, so it won't fit a `Size` parameter later. Use `const`, or write `let size: Size = "small"`.

**4. Forgetting the discriminant**

If your object types don't share a `kind` (or `type`, or `status`) property with different literal values, TypeScript can't tell them apart in a `switch`. Add one.

## Quick recap

- `A | B` means "A or B". You can only use what both have in common until you narrow.
- `typeof`, `=== null`, `in`, `Array.isArray` and `instanceof` checks all narrow the type.
- Unions of literals, like `"small" | "medium" | "large"`, allow only those exact values.
- A discriminated union shares a `kind` property, so a `switch` on `kind` narrows to the right type.
- A `never` check in `default` makes TypeScript tell you when a case is missing.

---

**Next:** try the [exercises](exercises.md), then move on to [07 Classes](../07-classes/notes.md).
