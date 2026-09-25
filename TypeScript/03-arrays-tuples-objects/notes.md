# 03 Arrays, Tuples and Objects

## What is it?

This chapter shows how to describe **groups** of values:

- **Array types** describe a list where every item has the same type, like `string[]`.
- **Tuple types** describe a short list with a fixed length, where each position has its own type, like `[string, number]`.
- **Object types** describe which properties an object has, and the type of each one.

## Why does it matter?

Most real data is lists and objects: a cart full of products, a user profile, a playlist. Typing them means TypeScript can catch a missing property, a misspelled one, or the wrong kind of item sneaking into a list.

## Real-world example

| Everyday thing | TypeScript |
|---|---|
| An egg carton: every slot holds an egg | An array: `string[]` |
| A map pin: exactly one latitude and one longitude, in that order | A tuple: `[number, number]` |
| A passport: fixed fields, like name and date of birth | An object type: `{ name: string; born: string }` |

## How it works

### Arrays

Write the item type, then `[]`:

```ts
const playlist: string[] = ["Blinding Lights", "Levitating"];
playlist.push("Flowers");
playlist.push(42);
// ❌ Argument of type 'number' is not assignable to parameter of type 'string'.
```

`string[]` reads as "an array of strings". You'll also see `Array<string>`, which means exactly the same thing ([chapter 08](../08-generics/notes.md) explains that style).

With a starting value, TypeScript infers the array type:

```ts
const scores = [90, 75, 81]; // inferred: number[]
const total = scores.reduce((sum, score) => sum + score, 0);
console.log(total); // prints: 246
```

Notice that `sum` and `score` got types too. TypeScript knows they're numbers because `scores` is a `number[]`, so array methods from [JavaScript chapter 13](../../JavaScript/13-array-methods/notes.md) are fully checked.

An **empty** array is the one case where you should write the type, because there's nothing to infer from:

```ts
const cart: string[] = [];
cart.push("apples");
console.log(cart); // prints: [ 'apples' ]
```

### Arrays that shouldn't change

Add `readonly` to stop a list from being changed by accident:

```ts
const weekdays: readonly string[] = ["Mon", "Tue", "Wed", "Thu", "Fri"];
weekdays.push("Sat");
// ❌ Property 'push' does not exist on type 'readonly string[]'.
```

It's like the "locked glass case" of `const` from [JavaScript chapter 02](../../JavaScript/02-variables/notes.md), but for the items inside, too.

### Tuples

A **tuple** is an array with a fixed length, where each position has a meaning and a type:

```ts
const location: [number, number] = [27.7172, 85.324]; // latitude, longitude
const entry: [string, number] = ["Asha", 92];         // name, score

console.log(entry[0], "scored", entry[1]); // prints: Asha scored 92
```

TypeScript checks the length and each position:

```ts
const point: [number, number] = [1, 2, 3];
// ❌ Type '[number, number, number]' is not assignable to type '[number, number]'.
```

Tuples work nicely with array destructuring ([JavaScript chapter 15](../../JavaScript/15-destructuring-spread-rest/notes.md)):

```ts
const entry: [string, number] = ["Asha", 92];
const [player, score] = entry; // player: string, score: number
console.log(`${player}: ${score}`); // prints: Asha: 92
```

Use tuples for small, fixed pairs. For anything with more than two or three parts, an object with named properties is easier to read.

### Object types

Describe an object by listing its properties and their types, separated by `;`:

```ts
const book: { title: string; pages: number } = {
  title: "Dune",
  pages: 412,
};
console.log(book.title); // prints: Dune
```

A missing property is caught:

```ts
const book: { title: string; pages: number } = { title: "Dune" };
// ❌ Property 'pages' is missing in type '{ title: string; }' but required in type '{ title: string; pages: number; }'.
```

And so is an extra one, which is often a typo:

```ts
const book: { title: string; pages: number } = {
  title: "Dune",
  pages: 412,
  author: "Frank Herbert",
  // ❌ Object literal may only specify known properties, and 'author' does not exist in type '{ title: string; pages: number; }'.
};
```

Writing the same object type again and again gets long. In [chapter 04](../04-type-aliases-and-interfaces/notes.md), you'll give it a name and write it once.

### Optional properties

Add `?` after a property name when it doesn't have to be there:

```ts
const book: { title: string; subtitle?: string } = { title: "Dune" };
console.log(book.subtitle); // prints: undefined
```

`subtitle?: string` means "a string, or not there at all". TypeScript treats its type as `string | undefined`, so it reminds you to check before using it:

```ts
const book: { title: string; subtitle?: string } = { title: "Dune" };
console.log(book.subtitle.toUpperCase());
// ❌ 'book.subtitle' is possibly 'undefined'.
console.log(book.subtitle?.toUpperCase()); // fine: optional chaining from JavaScript chapter 11
```

### Read-only properties

`readonly` stops a property from being changed after the object is created. Great for IDs:

```ts
const user: { readonly id: number; name: string } = { id: 7, name: "Sam" };
user.name = "Samira"; // fine
user.id = 8;
// ❌ Cannot assign to 'id' because it is a read-only property.
```

### Arrays of objects

The most common shape in real apps: a list of records.

```ts
const products: { name: string; price: number }[] = [
  { name: "Mug", price: 12 },
  { name: "Poster", price: 8 },
];

const names = products.map((product) => product.name); // string[]
console.log(names); // prints: [ 'Mug', 'Poster' ]
```

## Common mistakes

**1. Forgetting the type on an empty array**

```ts
// no-check
const cart = []; // TypeScript can't tell what will go in here
```

Always type empty arrays: `const cart: string[] = [];`.

**2. Trusting array indexes too much**

```ts
const colors: string[] = ["red", "green"];
const third = colors[2]; // TypeScript says: string
console.log(third);      // prints: undefined
```

TypeScript assumes an index gives you a real item, even when you read past the end. Check the length, or use `.at()` and handle `undefined`. (The setting `noUncheckedIndexedAccess` makes TypeScript stricter here. [Chapter 11](../11-tsconfig-and-modules/notes.md) covers settings.)

**3. Using commas and semicolons the wrong way round**

In a **type**, properties are usually separated by `;`. In an **object value**, they're separated by `,`. (TypeScript accepts commas in types too, but `;` is the common style.)

**4. Using a tuple when an object would be clearer**

`["Asha", 92, true, "2026-09-24"]` makes readers guess what each position means. `{ name, score, passed, date }` says it.

## Quick recap

- `string[]` is an array of strings. Type empty arrays yourself; otherwise, let TypeScript infer.
- `readonly string[]` can't be changed.
- A tuple like `[number, number]` has a fixed length and a type for each position.
- `{ title: string; pages: number }` describes an object. Missing and extra properties are errors.
- `?` makes a property optional, and `readonly` stops it from changing.

---

**Next:** try the [exercises](exercises.md), then move on to [04 Type Aliases and Interfaces](../04-type-aliases-and-interfaces/notes.md).
