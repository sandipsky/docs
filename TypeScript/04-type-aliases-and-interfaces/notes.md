# 04 Type Aliases and Interfaces

## What is it?

A **type alias** gives a name to a type, with the `type` keyword. An **interface** gives a name to an object's shape, with the `interface` keyword.

Both let you write a type once and reuse it everywhere.

## Why does it matter?

In chapter 03, you wrote `{ title: string; pages: number }` over and over. That's tiring, and if a book gets a new property, you'd have to update every copy.

A named type fixes both problems. You write `Book` once, use it everywhere, and change it in one place. The name also documents your code: `function lend(book: Book)` says a lot more than a long inline shape.

## Real-world example

Think of a **form template**, like a blank job application:

| Paper forms | TypeScript |
|---|---|
| The blank template, with labeled fields | `interface Applicant { name: string; ... }` |
| A filled-in copy | An object, like `{ name: "Asha", ... }` |
| Checking a copy against the template | The type checker |
| A longer form that adds fields to the basic one | `interface Manager extends Employee` |

## How it works

### Type aliases

`type` + a name + `=` + any type:

```ts
type Book = {
  title: string;
  pages: number;
};

const dune: Book = { title: "Dune", pages: 412 };
const hobbit: Book = { title: "The Hobbit", pages: 310 };

console.log(dune.pages + hobbit.pages); // prints: 722
```

Type names use **PascalCase** (every word starts with a capital), like `Book` or `ShoppingCart`, so they stand out from variables.

An alias can name *any* type, not only objects:

```ts
type Coordinates = [number, number]; // a tuple
type Price = number;                 // a clearer name for a number

const kathmandu: Coordinates = [27.7172, 85.324];
const ticket: Price = 12;
console.log(kathmandu, ticket); // prints: [ 27.7172, 85.324 ] 12
```

### Interfaces

An interface does the same job, but only for object shapes. Notice there's no `=`:

```ts
interface Product {
  name: string;
  price: number;
  inStock?: boolean; // optional, like in chapter 03
}

const mug: Product = { name: "Mug", price: 12 };
const poster: Product = { name: "Poster" };
// ❌ Property 'price' is missing in type '{ name: string; }' but required in type 'Product'.
```

The error message now uses the name `Product`. Much easier to read than a long inline shape.

### Extending: building on another type

Often one type is "another type, plus a few things". An interface can **extend** another one:

```ts
interface Employee {
  name: string;
  salary: number;
}

interface Manager extends Employee {
  teamSize: number;
}

const boss: Manager = { name: "Priya", salary: 5000, teamSize: 8 };
console.log(`${boss.name} manages ${boss.teamSize} people`); // prints: Priya manages 8 people
```

A `Manager` has everything an `Employee` has, plus `teamSize`. It's like inheritance with `extends` in [JavaScript chapter 27](../../JavaScript/27-classes/notes.md), but for types.

Type aliases do the same with `&`, called an **intersection** ("this AND that"):

```ts
type Employee = { name: string; salary: number };
type Manager = Employee & { teamSize: number };

const boss: Manager = { name: "Priya", salary: 5000, teamSize: 8 };
console.log(boss.salary); // prints: 5000
```

### Named types in functions and arrays

This is where names really pay off:

```ts
interface Product {
  name: string;
  price: number;
}

const cart: Product[] = [
  { name: "Mug", price: 12 },
  { name: "Poster", price: 8 },
];

function describe(product: Product): string {
  return `${product.name} costs $${product.price}`;
}

console.log(describe(cart[0])); // prints: Mug costs $12
```

(Typing function parameters like `product: Product` is the topic of [chapter 05](../05-functions/notes.md).)

### `type` or `interface`?

For object shapes, both work, and the differences are small:

| | `type` | `interface` |
|---|---|---|
| Object shapes | Yes | Yes |
| Other types (unions, tuples, a name for `number`) | Yes | No |
| Combining | `&` | `extends` |
| Can be "reopened" to add more properties later | No | Yes |

That last row is called **declaration merging**: if you write `interface Product` twice, TypeScript combines them. It's mostly used by libraries, and you'll rarely need it.

**This course's rule:** use `interface` for object shapes, and `type` for everything else. Many teams use `type` for everything, and that's fine too. Just be consistent within a project.

## Common mistakes

**1. Adding `=` to an interface, or leaving it off a type**

```ts
// no-check
interface Book = { title: string }  // wrong: interfaces have no =
type Book { title: string }         // wrong: types need =
```

Remember: `type Name = ...` but `interface Name { ... }`.

**2. Starting type names with a lowercase letter**

`interface product` works, but it looks like a variable. Use `Product`.

**3. Copying the same shape into many places**

If you see the same `{ ... }` object type twice, give it a name.

**4. Thinking types exist when the code runs**

```ts
// no-check
interface Book { title: string }
console.log(Book); // ❌ 'Book' only refers to a type, but is being used as a value here.
```

Types disappear before your code runs (chapter 01). You can't print them, loop over them, or pass them to functions.

## Quick recap

- `type Name = ...` names any type. `interface Name { ... }` names an object shape.
- Use PascalCase for type names: `Book`, `ShoppingCart`.
- Interfaces combine with `extends`. Type aliases combine with `&`.
- Named types make error messages and function signatures much easier to read.
- This course uses `interface` for objects and `type` for everything else.

---

**Next:** try the [exercises](exercises.md), then move on to [05 Functions](../05-functions/notes.md).
