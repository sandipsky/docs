# 32 Zod

## What is it?

Zod is a library for checking data while your app runs. You describe what good data looks like as a **schema**: a description of the data's shape, written as real code. Zod then checks real data against it. As a bonus, it gives you the matching TypeScript type for free.

```ts
import { z } from "zod";

const BookSchema = z.object({
  title: z.string(),
  pages: z.number(),
});

BookSchema.parse({ title: "Dune", pages: 412 });   // ✅ gives the data back
BookSchema.parse({ title: "Dune", pages: "412" }); // ❌ throws an error: pages should be a number
```

This chapter uses **Zod 4**. Install it in your `playground` app:

```
npm install zod
```

**A warning about older tutorials.** Zod 4 came out in 2025, and lots of what you'll find online (blog posts, Stack Overflow answers, AI answers) is still written for Zod 3. Most code is the same in both, but a few names changed:

| Zod 3 (older tutorials) | Zod 4 (this chapter) |
|---|---|
| `z.string().email()` | `z.email()` |
| `error.flatten()` | `z.flattenError(error)` |
| `{ message: "Too short" }` | `{ error: "Too short" }` |
| `.passthrough()` | `z.looseObject({...})` |

The old names mostly still work in Zod 4, but they're **deprecated** (on their way out), so VS Code shows them ~~crossed out~~. If an example online looks slightly off, check the [Zod docs](https://zod.dev) before you copy it.

## Why does it matter?

TypeScript only exists while you're writing code. When Vite builds your app, every type is **erased**: deleted, leaving plain JavaScript for the browser to run. So a type can't check anything that arrives while the app is running, like a server's reply, a value saved in `localStorage`, or text someone typed.

You've made this kind of promise three times already:

```ts
return parsed as Task[];                            // chapter 10: loading saved tasks
const data: MealDbResponse = await response.json(); // chapters 18 and 21: TheMealDB
const response = await api.get<Book[]>("/books");   // chapter 30: the reading list
```

Each line says "trust me, it's this shape", and TypeScript believes you. Each time, the chapter said the same thing: this is **a promise, not a proof**, and Zod is how you check for real. Time to keep that promise.

Here's what goes wrong without a check. Say the reading list's server changes, and `title` is renamed to `name`. Your code still compiles. Then one of these happens:

- A component calls `book.title.toUpperCase()`, and the page crashes with `TypeError: Cannot read properties of undefined (reading 'toUpperCase')`. The error points at the component, far away from the real cause.
- Nothing crashes, and every title is quietly blank.
- Or `pages` arrives as the text `"412"`, and your "total pages read" comes out as `"310412320"`, because `+` joins strings together.

The bug is in the data, but it shows up somewhere else, later. Those are the hardest bugs to track down.

With Zod, bad data is stopped at the door, with a message saying exactly what was wrong and where:

```
✖ Invalid input: expected string, received undefined
  → at [2].title
```

That reads as "the book at index 2 has no title". One clear, early failure instead of a confusing one later.

## Real-world example

Think about a **party with a bouncer at the door**.

| At the party | In your app |
|---|---|
| The guest list you wrote down | Your TypeScript type. It says who should come in, but it can't stop anyone. |
| The bouncer checking each person's ID | Zod's `parse`, checking each piece of data as it arrives |
| "Sorry, you're not on the list, and here's why" | A `ZodError`, with the exact field and the reason |
| One bouncer, at the front door | Checking at the **boundary**, where data enters your app, not in every room |
| The host and the bouncer share one list | One schema gives you both the check *and* the type |

Once a guest is inside, nobody checks their ID again. That's the deal: check carefully at the door, then trust what's inside.

## How it works

### Your first schema

A schema is built from small pieces snapped together:

```ts
import { z } from "zod";

const BookSchema = z.object({
  id: z.string(),
  title: z.string(),
  author: z.string(),
  pages: z.number(),
});
```

`z.object({...})` means "an object with these keys". `z.string()`, `z.number()` and `z.boolean()` each describe one value. Everything comes from the one `z` import.

### `parse` and `safeParse`

There are two ways to check data. **`parse`** gives the data back if it's good, and **throws** an error if it isn't:

```ts
const book = BookSchema.parse({ id: "1", title: "The Hobbit", author: "J.R.R. Tolkien", pages: 310 });
console.log(book.title); // prints: The Hobbit

BookSchema.parse({ id: "2", title: "Atomic Habits", author: "James Clear", pages: "320" });
// ❌ throws a ZodError
```

**`safeParse`** never throws. It gives back a result object that says whether it worked:

```ts
const result = BookSchema.safeParse({ id: "2", title: "Atomic Habits", author: "James Clear", pages: "320" });

if (result.success) {
  console.log(result.data.title);   // the checked data
} else {
  console.log(result.error.issues); // what was wrong
}
```

```
[
  {
    expected: 'number',
    code: 'invalid_type',
    path: [ 'pages' ],
    message: 'Invalid input: expected number, received string'
  }
]
```

`result` is a union: either `{ success: true, data }` or `{ success: false, error }`. Checking `result.success` narrows it, just like the discriminated unions in [TypeScript chapter 06](../../TypeScript/06-unions-and-narrowing/notes.md). Try to read `result.data.title` before the `if`, and TypeScript stops you with `'result.data' is possibly 'undefined'`. It's the same idea as the `Result<T>` type from [TypeScript chapter 13](../../TypeScript/13-async-and-apis/notes.md), ready-made.

Which one should you use?

- **`parse`** when bad data means something is genuinely broken, like a server sending the wrong shape. Throwing is right, because it *is* an error.
- **`safeParse`** when bad data is normal and expected, like what someone typed into a form, or an old value in `localStorage`. You want to handle it, not crash.

### One source of truth: `z.infer`

You don't write the `Book` type by hand any more. Zod works it out from the schema:

```ts
type Book = z.infer<typeof BookSchema>;
// { id: string; title: string; author: string; pages: number }
```

Read it as "the type that `BookSchema` checks for". `typeof BookSchema` gets the type of the schema value ([TypeScript chapter 10](../../TypeScript/10-keyof-typeof-mapped-types/notes.md)), and `z.infer` pulls the data's type out of it.

This matters more than it looks. If you wrote a type *and* a schema, one day someone would add a field to one and forget the other. With `z.infer`, there's only one thing to change. The schema is the **single source of truth**: the one place the answer lives.

`parse` returns that type too. `BookSchema.parse(data)` hands you a `Book`, with no `as` anywhere.

### Arrays, fixed choices, and missing values

A book in the reading list also has a status. `z.enum` describes a value that must be one of a fixed list of strings:

```ts
const BookSchema = z.object({
  id: z.string(),
  title: z.string(),
  author: z.string(),
  pages: z.number(),
  status: z.enum(["want", "reading", "finished"]), // "want" | "reading" | "finished"
});
```

The inferred type for `status` is the union `"want" | "reading" | "finished"`, exactly like chapter 30's hand-written `BookStatus`.

A few more pieces you'll use all the time, shown on a reader's profile:

```ts
const ReaderSchema = z.object({
  name: z.string(),
  favouriteGenres: z.array(z.string()),   // string[]
  nickname: z.string().optional(),        // may be missing
  currentBookId: z.string().nullable(),   // must be there, but may be null
  newsletter: z.boolean().default(false), // missing? use false
});
```

- **`z.array(X)`**: an array where every item matches `X`.
- **`.optional()`**: the key can be left out. The type is `string | undefined`.
- **`.nullable()`**: the key must be there, but its value can be `null`. TheMealDB's `{ meals: null }` is exactly this.
- **`.default(false)`**: if the value is missing, Zod fills in `false`. So the data you get back always has it.

One subtle point about `.default()`: the data *going in* can skip that key, but the data *coming out* always has it. `z.infer` gives you the coming-out type. If you ever need the going-in type, it's `z.input<typeof ReaderSchema>`. You'll meet this again in [chapter 33](../33-react-hook-form/notes.md).

### Rules for strings and numbers

A type says "it's a string". Real data needs more, like "a string that isn't empty". Zod adds rules by chaining them on:

```ts
const Title = z.string().trim().min(1, "Please enter a title").max(200, "Keep the title under 200 characters");

const Email = z.email("Please enter a valid email");

const Pages = z
  .number({ error: "Pages must be a number" })
  .int("Pages must be a whole number")
  .positive("Pages must be more than 0");
```

- **`.trim()`** removes spaces from both ends **before** the later rules run. So `"   "` becomes `""`, and `.min(1)` catches it. The trimmed text is also what you get back: `Title.parse("  Dune  ")` gives `"Dune"`.
- **`.min()` and `.max()`** on a string count characters.
- **`z.email()`** checks the text looks like an email address.
- **`.int()`** means a whole number. **`.positive()`** means more than 0. Numbers have `.min()` and `.max()` too.
- **`{ error: "..." }`** on `z.number()` itself is the message for "this isn't a number at all".

The text at the end of each rule is your own error message. It's a shortcut for `{ error: "..." }`. Leave it out and Zod uses its default, like `Too small: expected number to be >0`. That's fine for a developer, but not something to show your users.

### Reading the errors

Every failed check gives you a `ZodError`. Its `issues` array lists **every** problem, not just the first. Each issue has a `path` (where) and a `message` (what):

```ts
const result = BookSchema.safeParse({
  id: "1",
  name: "Dune", // oops: should be "title"
  author: "Frank Herbert",
  pages: 412,
  status: "someday",
});

if (!result.success) {
  for (const issue of result.error.issues) {
    console.log(issue.path.join("."), "→", issue.message);
  }
}
```

```
title → Invalid input: expected string, received undefined
status → Invalid option: expected one of "want"|"reading"|"finished"
```

For a person to read, `z.prettifyError(result.error)` gives a tidy summary, like the one at the top of this chapter.

For forms, you usually want "the errors for each field". `z.flattenError` groups the messages by field name:

```ts
const fieldErrors = z.flattenError(result.error).fieldErrors;
// { title: ["Invalid input: expected string, received undefined"], status: ["Invalid option: ..."] }

fieldErrors.title?.[0]; // the first message for title, or undefined if title is fine
```

Each field gets an array, because one field can break several rules at once. There's also `formErrors`, for problems that don't belong to one field.

### Changing the shape: `.transform()`

In [chapter 18](../18-fetching-data/notes.md), you gave TheMealDB's reply a type, then converted `idMeal`, `strMeal` and `strMealThumb` into your own clean `Recipe`. In [chapter 30](../30-axios/notes.md) you did the same again, in `searchRecipes` in `src/api/meals.ts`: a `MealDbSearchResponse` type (a promise) and a `.map(...)` by hand.

Zod can do both jobs in one step. `.transform()` runs after the checks pass, and turns the data into whatever you return. Replace the hand-written type and mapping in `src/api/meals.ts`:

```ts
// src/api/meals.ts
import { z } from "zod";
import { mealDb } from "./client.ts";

export const MealSchema = z
  .object({
    idMeal: z.string(),
    strMeal: z.string(),
    strMealThumb: z.string(),
  })
  .transform((meal) => ({
    id: meal.idMeal,
    name: meal.strMeal,
    thumbnail: meal.strMealThumb,
  }));

export const MealListSchema = z
  .object({ meals: z.array(MealSchema).nullable() })
  .transform((data) => data.meals ?? []); // TheMealDB sends null for "no results"

export type Recipe = z.infer<typeof MealSchema>;
// { id: string; name: string; thumbnail: string }

export async function searchRecipes(query: string, signal?: AbortSignal): Promise<Recipe[]> {
  const response = await mealDb.get<unknown>("/search.php", {
    params: { s: query },
    signal,
  });
  return MealListSchema.parse(response.data);
}
```

This is chapter 18's boundary rule, now enforced. The ugly field names live in one schema, get checked, and never leak into your components. `z.infer` gives the type **after** the transform, so `Recipe` is exactly the clean shape chapter 30 wrote by hand, and nothing that uses `searchRecipes` needs to change.

Notice `mealDb.get<unknown>`. That's you being honest: you don't know what's in the reply yet. Chapter 30's `<Book[]>` was a promise. `<unknown>` plus a schema is a proof.

### Text that should be a number: `z.coerce`

Some data always arrives as text, even when it means a number. URL search params are the classic case: `?page=3` gives you `"3"`. **Coercing** means converting the value first, then checking it:

```ts
const PageNumber = z.coerce.number().int().positive();

PageNumber.parse("3");   // 3, a real number
PageNumber.parse("abc"); // ❌ Invalid input: expected number, received NaN
```

`z.coerce.number()` runs JavaScript's `Number(...)` on the input first. That brings along `Number`'s surprises:

```ts
z.coerce.number().parse("");       // 0, because Number("") is 0
z.coerce.boolean().parse("false"); // true, because any non-empty string is true
```

An empty box silently becomes `0`. It's the same trap as `Number(event.target.value)` in [chapter 09](../09-forms/notes.md). So only coerce where the input really is text, and add a rule (like `.positive()`) that catches the `0`. For `"true"` and `"false"` text, use `z.stringbool()`, which understands them properly.

### Rules across fields: `.refine()`

Some rules need two fields at once. "Confirm password must match password" can't be checked by looking at one field alone. `.refine()` adds your own check to the whole object:

```ts
const SignUpSchema = z
  .object({
    email: z.email("Please enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords don't match",
    path: ["confirmPassword"],
  });
```

Your function returns `true` for good data and `false` for bad. `path` says which field the error belongs to, so it can appear under the confirm box instead of floating at the top of the form:

```ts
const result = SignUpSchema.safeParse({
  email: "maya@example.com",
  password: "12345678",
  confirmPassword: "1234",
});

if (!result.success) {
  console.log(z.flattenError(result.error).fieldErrors);
  // { confirmPassword: ["Passwords don't match"] }
}
```

A small Zod 4 detail: the refine still runs when other fields break rules like `.min()`, so people see all their mistakes at once. It's skipped if a field has the wrong *type* altogether, like a number where a string should be. Form fields are strings, so this rarely comes up.

### Extra keys are dropped

```ts
const book = BookSchema.parse({ id: "1", title: "Dune", author: "Frank Herbert", pages: 412, status: "want", rating: 5 });
console.log(book); // no rating in here: it's gone
```

By default, `z.object` **strips** keys it doesn't know about. That's usually what you want: your app only gets what it asked for. If you'd rather:

- **fail** on unknown keys, use `z.strictObject({...})`. The error says `Unrecognized key: "rating"`.
- **keep** them, use `z.looseObject({...})`.

If a field seems to vanish after parsing, this is why. Add it to the schema.

### Where to validate: at the boundaries

You don't sprinkle Zod everywhere. You check where data **enters** your app from somewhere you don't control. Those places are called **boundaries**:

| Boundary | Example | Use |
|---|---|---|
| API responses | `getBooks()` | `parse`, inside the API function |
| Saved data | `localStorage`, loaded at startup | `safeParse`, with a fallback |
| Forms | What someone typed | `safeParse`, or React Hook Form ([chapter 33](../33-react-hook-form/notes.md)) |
| URL params | `?page=3`, `/books/:id` | `safeParse`, often with `z.coerce` |

Inside your app, between your own components and functions, TypeScript already checks everything. Once data is through the door, trust it. Checking it again in every component is like the bouncer following each guest from room to room.

### The reading list, checked for real

Now apply this to chapter 30's `src/api/books.ts`. The hand-written types go, and schemas take their place:

```ts
// src/api/books.ts
import { z } from "zod";
import { api } from "./client.ts";

export const BookStatusSchema = z.enum(["want", "reading", "finished"]);

export const BookSchema = z.object({
  id: z.string(),
  title: z.string().trim().min(1, "Please enter a title"),
  author: z.string().trim().min(1, "Please enter an author"),
  pages: z
    .number({ error: "Pages must be a number" })
    .int("Pages must be a whole number")
    .positive("Pages must be more than 0"),
  status: BookStatusSchema,
});

export const BookListSchema = z.array(BookSchema);

// Everything except id: what you send when you add a book
export const NewBookSchema = BookSchema.omit({ id: true });

export type BookStatus = z.infer<typeof BookStatusSchema>;
export type Book = z.infer<typeof BookSchema>;
export type NewBook = z.infer<typeof NewBookSchema>;
```

Three things to notice:

- **The type names haven't changed.** `Book`, `NewBook` and `BookStatus` are the same names chapter 30 used, so no other file needs to change.
- **`.omit({ id: true })`** is Zod's version of TypeScript's `Omit<Book, "id">` ([TypeScript chapter 09](../../TypeScript/09-utility-types/notes.md)). `NewBookSchema` gets all the same rules for free: title and author required, pages a positive whole number, status one of the three. [Chapter 33](../33-react-hook-form/notes.md) uses it to check the "Add a book" form.
- **The rules are written once**, on `BookSchema`, and both the API and the form use them.

Then the API functions check what comes back:

```ts
export async function getBooks(): Promise<Book[]> {
  const response = await api.get<unknown>("/books");
  return BookListSchema.parse(response.data);
}

export async function getBook(id: string): Promise<Book> {
  const response = await api.get<unknown>(`/books/${id}`);
  return BookSchema.parse(response.data);
}
```

Do the same in `addBook` and `updateBook`. The server replies with the saved book, so `BookSchema.parse(response.data)` works there too. `deleteBook` gets nothing back, so there's nothing to check.

`api.get<Book[]>` has become `api.get<unknown>` plus a real check. You've swapped a promise for a proof, and the API can no longer lie to your components.

### What TanStack Query shows when the data is wrong

Your [chapter 31](../31-tanstack-query/notes.md) code doesn't change at all. `useBooks()` from `src/api/bookQueries.ts` still gives you a `Book[]`. The difference is what happens when the data is bad.

Try it. With the API running, open `db.json`, change one book to `"pages": "lots"`, and save. (json-server 1 notices hand edits and reloads the file, as chapter 30 said.) Then reload your book list.

`getBooks` calls `parse`, and `parse` throws a `ZodError`. TanStack Query treats that like any other failed request:

1. It **retries**, 3 times by default, waiting a little longer each time. So for about 7 seconds you see your loading state.
2. Then the query goes into its **error state**, and `error` is the `ZodError`.

If your component shows `error.message`, you'll see something like this on the page:

```
[
  {
    "expected": "number",
    "code": "invalid_type",
    "path": [2, "pages"],
    "message": "Invalid input: expected number, received string"
  }
]
```

Ugly, but honest: it points straight at the `pages` of the book at index 2. Before Zod, the list would have rendered happily, and your "total pages" would have quietly turned into nonsense. A loud, early failure at the boundary beats a quiet, late one deep inside a component.

For real users, show a friendly message and keep the details in the Console. `instanceof` narrows the error, as in [TypeScript chapter 13](../../TypeScript/13-async-and-apis/notes.md):

```tsx
if (error) {
  if (error instanceof z.ZodError) {
    console.error(z.prettifyError(error)); // the details, for you
    return <p>The server sent book data we didn't expect.</p>;
  }
  return <p>Something went wrong: {error.message}</p>;
}
```

If you need this in several components, move it into a small `getErrorMessage(error)` function. And since retrying won't fix bad data, you can tell TanStack Query not to bother. Chapter 31 said `retry` can be a function that gets the error. Add this to `booksQuery` in `bookQueries.ts`:

```ts
retry: (failureCount, error) => !(error instanceof z.ZodError) && failureCount < 3,
```

Put `db.json` back when you're done.

### Loading from `localStorage` safely

Chapter 10's `loadTasks` checked `Array.isArray`, then promised `as Task[]`. Here's the Zod way, shown with a small settings object for the reading list:

```ts
const SettingsSchema = z.object({
  view: z.enum(["grid", "list"]),
  showFinished: z.boolean(),
});

type Settings = z.infer<typeof SettingsSchema>;

const defaultSettings: Settings = { view: "grid", showFinished: true };

function loadSettings(): Settings {
  const saved = localStorage.getItem("reading-list-settings");
  if (saved === null) return defaultSettings;

  try {
    const result = SettingsSchema.safeParse(JSON.parse(saved));
    return result.success ? result.data : defaultSettings;
  } catch {
    return defaultSettings; // not even valid JSON
  }
}
```

There are two kinds of bad data here, and two guards. `try`/`catch` handles text that isn't JSON at all. `safeParse` handles JSON in the wrong shape, like something an older version of your app saved. Either way, the app starts with sensible settings instead of a white screen. This is `safeParse`'s natural home: bad saved data is expected, not an emergency. ([JavaScript chapter 23](../../JavaScript/23-json-and-local-storage/notes.md) has more on `localStorage`.)

### When you don't need it

- **Data that's already inside your app.** Props, state and function arguments are checked by TypeScript. Don't check them again.
- **Data you wrote yourself**, like a list of books in a `.ts` file. TypeScript can already see it.
- **Tiny one-off checks.** `if (query.trim() === "")` doesn't need a library.

Reach for Zod at the boundaries, and wherever the rules are big enough that writing the checks by hand would be long and easy to get wrong. (The type guards you wrote by hand in [TypeScript chapter 13](../../TypeScript/13-async-and-apis/notes.md) are exactly what Zod writes for you.)

## Common mistakes

**1. Writing the type and the schema separately**

```ts
type Book = { id: string; title: string; pages: number };                   // ❌ a second copy
const BookSchema = z.object({ id: z.string(), title: z.string(), pages: z.number(), status: z.string() });
```

They've already drifted apart: the type has no `status`. Delete the hand-written type and use `z.infer<typeof BookSchema>`.

**2. Using `parse` where bad data is normal**

`parse` on a form's values, or on `localStorage`, throws on everyday bad input. In an event handler, that's an uncaught error. During render, it's a white screen. When bad data is expected, use `safeParse` and handle both cases.

**3. Validating deep inside components**

```tsx
function BookCard({ book }: { book: Book }) {
  const checked = BookSchema.parse(book); // ❌ already checked in getBooks
}
```

Check once, at the boundary (the API function). Everything after that gets data that's already been checked, and TypeScript knows its type.

**4. Forgetting `typeof` in `z.infer`**

```ts
type Book = z.infer<BookSchema>;
// ❌ 'BookSchema' refers to a value, but is being used as a type here. Did you mean 'typeof BookSchema'?
```

A schema is a value, not a type. `z.infer<typeof BookSchema>` is always the shape.

**5. Being surprised by `z.coerce`**

`z.coerce.number()` turns `""` into `0`, and `z.coerce.boolean()` turns `"false"` into `true`. Only coerce text you really need to convert, and add a rule that catches the surprise values.

**6. Expecting unknown keys to survive**

A key that isn't in the schema is stripped from the result. If `rating` "disappears" after parsing, add it to the schema (or use `z.looseObject`).

**7. Checking your own internal data**

Running Zod on props, state, or data your own code just built adds work and catches nothing. TypeScript already checks it. Zod is for data from outside.

**8. Copying Zod 3 code from the internet**

`z.string().email()`, `error.flatten()` and `{ message: "..." }` still mostly work, but they're deprecated. If VS Code crosses something out, look up the Zod 4 name (the table at the top of this chapter covers the common ones).

## Quick recap

- TypeScript types are erased when your code runs, so `as Task[]`, `data: MealDbResponse` and `api.get<Book[]>` are promises, not proofs. Zod checks for real.
- A **schema** describes the shape. `parse` returns the data or throws. `safeParse` returns `{ success, data }` or `{ success, error }`, and TypeScript narrows it.
- `z.infer<typeof Schema>` makes the schema your **single source of truth**: one place for both the type and the rules.
- Add rules with `.trim()`, `.min()`, `.max()`, `z.email()`, `.int()`, `.positive()`, and your own messages. Read failures with `error.issues`, `z.prettifyError`, or `z.flattenError(error).fieldErrors` for forms.
- `.transform()` checks and reshapes in one step. `.refine()` handles rules across fields, with `path` saying where the error belongs.
- `z.coerce` converts text first, including its surprises (`""` becomes `0`). Unknown keys are stripped by default.
- Validate at the **boundaries**: API responses (inside the API functions), `localStorage`, forms, and URL params. When `getBooks` finds bad data, TanStack Query shows its error state, early and clearly.

---

**Next:** try the [exercises](exercises.md), then move on to [33 React Hook Form](../33-react-hook-form/notes.md).
