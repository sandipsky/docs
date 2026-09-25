# 05 Functions

## What is it?

In TypeScript, you add types to a function's **inputs** (its parameters) and, optionally, its **output** (its return value). You can also describe a whole function as a type, like "a function that takes a number and returns a string".

## Why does it matter?

Functions are where most mix-ups happen: calling with the arguments in the wrong order, forgetting one, or passing text instead of a number. Once a function's inputs are typed, every single call to it is checked, all over your project.

It also means you don't need to open a function to know how to use it. Hover over its name in VS Code, and the types tell you.

## Real-world example

A vending machine:

| Vending machine | Function types |
|---|---|
| "Coins only" slot | Parameter type: `coins: number` |
| A snack comes out | Return type: `: Snack` |
| The machine rejects a button, or a banknote | A type error at the call |
| "Exact change not needed" (optional) | Optional parameter: `change?: number` |

## How it works

### Typing parameters

Parameters are the one place you should (almost) always write types, because TypeScript can't guess what callers will pass:

```ts
function tip(bill: number, percent: number) {
  return bill * (percent / 100);
}

console.log(tip(50, 15)); // prints: 7.5
```

Now every call is checked:

```ts
function tip(bill: number, percent: number) {
  return bill * (percent / 100);
}

tip(50);
// ❌ Expected 2 arguments, but got 1.
tip("50", 15);
// ❌ Argument of type 'string' is not assignable to parameter of type 'number'.
```

If you leave a parameter's type out, strict mode complains:

```ts
function double(x) {
  // ❌ Parameter 'x' implicitly has an 'any' type.
  return x * 2;
}
```

### Return types

TypeScript infers the return type from your `return` statements. Hover over `tip` above, and it shows `function tip(bill: number, percent: number): number`.

You can also write it yourself, after the parentheses:

```ts
function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

console.log(formatPrice(4.5)); // prints: $4.50
```

Writing the return type is a good habit for important functions: if you accidentally return the wrong thing, the error appears inside the function, where the mistake is.

```ts
function isAdult(age: number): boolean {
  return age >= 18 ? "yes" : "no";
  // ❌ Type 'string' is not assignable to type 'boolean'.
}
```

### `void`: functions that return nothing

A function that only *does* something, like printing, returns nothing. Its return type is `void`:

```ts
function greet(name: string): void {
  console.log(`Hello, ${name}!`);
}

greet("Asha"); // prints: Hello, Asha!
```

### Optional and default parameters

Add `?` for a parameter that callers can skip. Inside the function, it might be `undefined`:

```ts
function greet(name: string, title?: string): string {
  if (title) {
    return `Hello, ${title} ${name}`;
  }
  return `Hello, ${name}`;
}

console.log(greet("Sharma", "Dr.")); // prints: Hello, Dr. Sharma
console.log(greet("Sam"));           // prints: Hello, Sam
```

A default value ([JavaScript chapter 09](../../JavaScript/09-functions/notes.md)) makes a parameter optional too, and TypeScript infers its type from the default:

```ts
function tip(bill: number, percent = 15) { // percent: number
  return bill * (percent / 100);
}

console.log(tip(40));     // prints: 6
console.log(tip(40, 20)); // prints: 8
```

Optional parameters must come after the required ones.

### Arrow functions

Same rules, same places:

```ts
const toCelsius = (fahrenheit: number): number => ((fahrenheit - 32) * 5) / 9;
console.log(toCelsius(212)); // prints: 100
```

### Rest parameters

A rest parameter ([JavaScript chapter 15](../../JavaScript/15-destructuring-spread-rest/notes.md)) is an array, so its type is an array type:

```ts
function sum(...numbers: number[]): number {
  return numbers.reduce((total, n) => total + n, 0);
}

console.log(sum(5, 10, 20)); // prints: 35
```

### Function types

Sometimes you need to describe a *function itself*, like a callback. A **function type** looks like an arrow function, with types instead of code:

```ts
type PriceFormatter = (price: number) => string;

const asDollars: PriceFormatter = (price) => `$${price.toFixed(2)}`;
const asRupees: PriceFormatter = (price) => `Rs. ${price}`;

function printPrices(prices: number[], format: PriceFormatter): void {
  for (const price of prices) {
    console.log(format(price));
  }
}

printPrices([3, 12.5], asDollars);
```

You'll see:

```
$3.00
$12.50
```

Notice that `(price) =>` needs no annotation: TypeScript already knows from `PriceFormatter` that `price` is a number. This is called **contextual typing**, and it's why callbacks for `map` and `filter` need no types either.

## Common mistakes

**1. Leaving parameters untyped**

`Parameter 'x' implicitly has an 'any' type.` means "tell me what this is". Add a type.

**2. Annotating callback parameters that are already known**

```ts
const prices = [3, 12.5];
const doubled = prices.map((price: number) => price * 2); // the ": number" adds nothing
```

TypeScript already knows `price` is a number from the array. Let it infer.

**3. Putting an optional parameter first**

```ts
// no-check
function greet(title?: string, name: string) {}
// ❌ A required parameter cannot follow an optional parameter.
```

Required parameters first, optional ones last.

**4. Mixing up `void` and `undefined` in your head**

`void` means "don't use the return value". Use it for functions that only *do* something, like printing or saving.

## Quick recap

- Always type parameters. TypeScript then checks every call: the number of arguments and their types.
- Return types are inferred, but writing them on important functions catches mistakes inside the function.
- `void` means the function returns nothing useful.
- `?` makes a parameter optional. A default value does too, and sets its type.
- `type Formatter = (price: number) => string` describes a function, which is handy for callbacks.

---

**Next:** try the [exercises](exercises.md), then move on to [06 Unions and Narrowing](../06-unions-and-narrowing/notes.md).
