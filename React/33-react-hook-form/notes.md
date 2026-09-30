# 33 React Hook Form

## What is it?

**React Hook Form** is a library that runs your forms for you: it keeps track of the values, checks them, collects the errors, and handles submitting. You write much less code than in chapter 09, and your form re-renders far less often.

```tsx
const { register, handleSubmit } = useForm<NewBook>();

<form onSubmit={handleSubmit(saveBook)}>
  <input {...register("title")} />
  <button type="submit">Add book</button>
</form>
```

This chapter uses **React Hook Form 7**, with **`@hookform/resolvers` 5** to connect it to Zod. You'll often see React Hook Form shortened to **RHF**. Install both inside `playground`:

```
npm install react-hook-form @hookform/resolvers
```

## Why does it matter?

[Chapter 09](../09-forms/notes.md) taught you to build forms by hand, and that's worth knowing. But look at what three fields with rules needed:

```tsx
// Chapter 09 style: three fields, and it's already long
const [title, setTitle] = useState("");
const [author, setAuthor] = useState("");
const [pages, setPages] = useState("");
const [touched, setTouched] = useState(new Set<string>());
const [hasSubmitted, setHasSubmitted] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);

const titleError = title.trim() === "" ? "Please enter a title" : null;
const authorError = author.trim() === "" ? "Please enter an author" : null;
const pagesError = Number.isInteger(Number(pages)) && Number(pages) > 0 ? null : "Pages must be a whole number";

// ...plus three inputs, each with value, onChange, onBlur, and an error message
```

Chapter 09 admitted three problems with this, and promised a fix:

- **It doesn't scale.** Every new field adds a `useState`, an `onChange`, a "touched" check, and an error. A 20-field form becomes hundreds of lines of plumbing.
- **Every keystroke re-renders the whole form**, because each letter goes into state. That's fine for three fields. With 30 fields and a live preview, you'll see it in the Profiler ([chapter 27](../27-performance/notes.md)).
- **TypeScript can't check your field names.** With one object and `name="emial"`, a typo just silently doesn't work.

There's a fourth problem too. Those rules (`title.trim() === ""`) are a second copy of the rules you already wrote in [chapter 32](../32-zod/notes.md)'s `NewBookSchema`. Two copies drift apart.

React Hook Form fixes all four. And the chapter 09 promise gets kept: with a typed `useForm<NewBook>()`, a misspelled field name is a type error, right in VS Code.

## Real-world example

Think about filling in a form at a **clinic's reception desk**.

| At the reception desk | React Hook Form |
|---|---|
| The receptionist doesn't watch you write each letter | Inputs keep their own values; typing doesn't re-render your component |
| They check the whole form when you hand it in | Validation runs on submit (the default) |
| They point at the exact boxes that need fixing | `errors.title.message`, shown next to that field, and focus moves to the first problem |
| They check against the clinic's official checklist | Your Zod schema, plugged in with a resolver |
| Once you're fixing a box, they tell you the moment it's right | After a failed submit, errors update as you type |
| "Sorry, our system is down, please try again" | A server error for the whole form, with `setError("root.serverError", ...)` |

A receptionist who commented on every letter as you wrote it would be exhausting. One who checks at the end and points at exactly what to fix is helpful.

## How it works

### Your first form: `useForm`, `register`, `handleSubmit`

```tsx
// src/ch33/FirstForm.tsx
import { useForm } from "react-hook-form";

type BookForm = {
  title: string;
  author: string;
};

function FirstForm() {
  const { register, handleSubmit } = useForm<BookForm>();

  function onSubmit(values: BookForm) {
    console.log(values); // { title: "Dune", author: "Frank Herbert" }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <label htmlFor="title">Title</label>
      <input id="title" {...register("title")} />

      <label htmlFor="author">Author</label>
      <input id="author" {...register("author")} />

      <button type="submit">Add book</button>
    </form>
  );
}

export default FirstForm;
```

Three new pieces:

- **`useForm<BookForm>()`** creates the form. The type says which fields exist.
- **`register("title")`** connects one input to the form, under the name `title`.
- **`handleSubmit(onSubmit)`** wraps your function. On submit, it calls `preventDefault` for you, collects all the values, checks them, and calls `onSubmit` **only if everything is valid**.

No `useState`, no `onChange`, no `event.preventDefault()`. Type something, press Enter, and the Console shows both values in one object.

### What `{...register("title")}` really gives the input

`register` returns an ordinary object. Log it to see:

```tsx
console.log(register("title"));
// { name: "title", onChange: ƒ, onBlur: ƒ, ref: ƒ }
```

The `{...}` spread puts all four onto the `<input>` at once:

- **`name`** becomes the input's `name` attribute.
- **`onChange`** tells RHF "this field changed". It does **not** put the value into React state.
- **`onBlur`** tells RHF "the person left this field", so it knows the field was touched.
- **`ref`** hands RHF the real DOM input, like `useRef` in [chapter 19](../19-refs/notes.md).

That `ref` is the trick. These inputs are **uncontrolled**, as in [chapter 09](../09-forms/notes.md)'s last section: the browser keeps what's typed, and RHF reads it straight from the element when it needs it. Nothing goes through `useState`, so **typing doesn't re-render your component**.

See it for yourself. Put `console.log("render")` at the top of `FirstForm` and type a whole title. Nothing is logged. Do the same in a chapter 09 form and you'll get a log for every letter. (RHF does re-render when something you show changes, like an error appearing or disappearing.)

### Showing errors

`formState.errors` holds an entry for each field that failed, with its message. RHF has simple built-in rules you can pass to `register`:

```tsx
const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<BookForm>();

<input id="title" {...register("title", { required: "Please enter a title" })} />
{errors.title && <p className="field-error">{errors.title.message}</p>}
```

Other built-in rules include `minLength`, `maxLength`, `min`, `max`, and `pattern`, like `minLength: { value: 2, message: "At least 2 letters" }`. They're fine for a small form. But now your rules are scattered through the JSX, and chapter 32 already wrote them all down once, in a schema. You'll plug that in shortly.

By default, nothing is checked until the first submit. After that, each error disappears the moment you fix it.

### Field names are checked now

Here's chapter 09's promise, kept. Give `useForm` the chapter 32 `NewBook` type and misspell a field:

```tsx
const { register } = useForm<NewBook>();

<input {...register("emial")} />
// ❌ Argument of type '"emial"' is not assignable to parameter of type '"status" | "title" | "author" | "pages"'.
```

(The names may be listed in a different order for you.) `errors.emial` is flagged too: `Property 'emial' does not exist on type 'FieldErrors<...>'`. The field names come from the type, so a typo can't slip through.

### The real way: one schema, plugged in with `zodResolver`

A **resolver** is a small adapter that lets RHF use a validation library for its checking. `zodResolver` plugs in a Zod schema:

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NewBookSchema } from "../api/books.ts";
import type { NewBook } from "../api/books.ts";

const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<NewBook>({
  resolver: zodResolver(NewBookSchema),
});
```

On submit, RHF hands every value to `NewBookSchema`. Zod's issues come back as `errors`, one per field, with the messages you wrote in chapter 32. So `errors.title?.message` is `"Please enter a title"`, and `errors.pages?.message` might be `"Pages must be a whole number"`.

This is the big win. **One schema is now the type, the rules, and the messages**, shared by the API check in `books.ts` and the form. Change a rule once, and both follow.

A few things change with a resolver:

- **Drop the built-in rules.** With a resolver, RHF ignores `required`, `minLength` and the rest. Keep all the rules in the schema.
- **`onSubmit` gets the checked data.** It's Zod's output, so the title has already been trimmed.
- **The `<NewBook>` is optional.** The resolver tells `useForm` the types anyway. It's fine to keep it for clarity, as long as the schema has no `.default()` or `.transform()`. If it does, see mistake 10.

### Starting values: `defaultValues`

```tsx
useForm<NewBook>({
  resolver: zodResolver(NewBookSchema),
  defaultValues: { title: "", author: "", status: "want" },
});
```

`defaultValues` does three jobs. It's what each field starts with, what `reset()` goes back to, and what RHF compares against to know if anything changed. Give every field one.

The exception is `pages`. There's no good "empty" number (`0` would show up as a `0` in the box), so it's left out, and the box starts blank. That's a deliberate choice, not a slip.

### Numbers: `valueAsNumber`

Try the form now: type `320` for pages and submit. You'll see `Pages must be a number`. The browser always gives text from an input, even `type="number"`, so Zod got `"320"`. That's chapter 09's "number inputs still give you a string", back again.

Tell RHF to convert it:

```tsx
<input id="pages" type="number" {...register("pages", { valueAsNumber: true })} />
```

Now RHF converts the text to a number **before** checking it. An empty box becomes `NaN` (not a number), and Zod rejects it with `Pages must be a number`, which is exactly right.

Why not use `z.coerce.number()` in the schema instead? Because `NewBookSchema` is shared with the API. Coercing there would let a server reply of `"pages": "320"` slip through as if it were fine, and chapter 32 showed that coerce turns an empty box into `0`. Convert the text where it comes from: the input.

### A `<select>` for the status

A `<select>` registers just like an input:

```tsx
import { BookStatusSchema } from "../api/books.ts";
import type { BookStatus } from "../api/books.ts";

const statusLabels: Record<BookStatus, string> = {
  want: "Want to read",
  reading: "Reading",
  finished: "Finished",
};

<label htmlFor="status">Status</label>
<select id="status" {...register("status")}>
  {BookStatusSchema.options.map((status) => (
    <option key={status} value={status}>
      {statusLabels[status]}
    </option>
  ))}
</select>
```

`BookStatusSchema.options` is the array `["want", "reading", "finished"]`, straight from the schema. `Record<BookStatus, string>` makes TypeScript insist on a label for every status. And remember chapter 09's hint about a typo in an `<option value>`? TypeScript still can't see that one, but now Zod catches it the moment you submit.

### When to show errors: `mode`

`useForm` takes a `mode` option that decides when fields are first checked:

| `mode` | First check | How it feels |
|---|---|---|
| `"onSubmit"` (the default) | When you submit. After that, as you type | Quiet until you try, then helpful |
| `"onTouched"` | When you leave a field. After that, as you type | Chapter 09's "touched" pattern, for free |
| `"onBlur"` | Every time you leave a field | Updates only when you move on |
| `"onChange"` | Every keystroke | Complains while you're still typing, and re-renders the most |

For short forms, the default is fine. For longer ones, `"onTouched"` is usually the friendliest: nobody sees red before they've had a go, and a finished field gets checked straight away. Avoid `"onChange"`. Nobody likes a form that tells them their email is wrong after one letter.

### Submitting and saving: `isSubmitting` and `useAddBook`

Now connect the form to the server, through the `useAddBook()` hook from [chapter 31](../31-tanstack-query/notes.md):

```tsx
import { useAddBook } from "../api/bookQueries.ts";

function AddBookForm() {
  const addBook = useAddBook();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewBook>({
    resolver: zodResolver(NewBookSchema),
    defaultValues: { title: "", author: "", status: "want" },
    mode: "onTouched",
  });

  async function onSubmit(values: NewBook) {
    await addBook.mutateAsync(values);
    reset(); // only reached if the save worked
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* ...the fields... */}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Add book"}
      </button>
    </form>
  );
}
```

- **`isSubmitting`** is `true` from the moment you submit until `onSubmit`'s promise finishes. That's why `onSubmit` is `async` and **awaits** the save. `mutateAsync` returns a promise; `mutate` doesn't, so with `mutate` the button would flick back to "Add book" instantly.
- **`useAddBook()` invalidates `["books"]`**, so your book list updates by itself. Its `onSuccess` returns that promise, so "Saving..." stays until the new book is actually on screen.
- **`reset()` comes after the `await`.** If the save fails, `mutateAsync` throws, `reset()` never runs, and whatever the person typed is still there. Clearing their typing before the save worked would be cruel.
- **`noValidate`** switches off the browser's own error bubbles (for example, `type="number"` refusing `abc`). Your Zod messages are clearer, and it's confusing to get both.

(RHF's docs also show another way to reset: watch `formState.isSubmitSuccessful` in an effect. Both work. Resetting right after the `await` keeps "save, then clear" together in one place.)

### Server errors: `setError("root.serverError", ...)`

The form can be perfect and the save can still fail: the server is down, or it says no. That error doesn't belong to any one field. RHF has a spot for whole-form errors, called `root`:

```tsx
const { setError /* ...and the rest */ } = useForm<NewBook>({ /* ... */ });

async function onSubmit(values: NewBook) {
  try {
    await addBook.mutateAsync(values);
    reset();
  } catch {
    setError("root.serverError", {
      message: "Couldn't save the book. Is the practice API running?",
    });
  }
}
```

```tsx
{errors.root?.serverError && (
  <p role="alert" className="field-error">
    {errors.root.serverError.message}
  </p>
)}
<button type="submit" disabled={isSubmitting}>
  {isSubmitting ? "Saving..." : "Add book"}
</button>
```

Put it just above the button, where the person is looking. RHF clears `root` errors automatically on the next submit. `role="alert"` makes screen readers read it out as soon as it appears ([chapter 38](../38-accessibility/notes.md) explains more).

The `try`/`catch` matters. If `onSubmit` throws, `handleSubmit` passes the error on, and you get `Uncaught (in promise)` in the Console with nothing on screen. (For friendlier messages, like "That book already exists", check `axios.isAxiosError(error)` and `error.response?.status`, as in [chapter 30](../30-axios/notes.md).)

Try it: stop `npm run api`, fill in the form, and submit. The message appears, and everything you typed is still there.

### Accessible errors

An error message only helps if everyone can find it. Here's one field, done properly:

```tsx
import { useId } from "react";

const titleId = useId();
const titleErrorId = `${titleId}-error`;

<label htmlFor={titleId}>Title</label>
<input
  id={titleId}
  aria-invalid={errors.title ? "true" : "false"}
  aria-describedby={errors.title ? titleErrorId : undefined}
  {...register("title")}
/>
{errors.title && (
  <p id={titleErrorId} className="field-error">
    {errors.title.message}
  </p>
)}
```

- **`htmlFor` and `id`** connect the label to the input, as in chapter 09. Clicking the label focuses the box, and screen readers announce the label.
- **`useId()`** makes an id that's unique for each copy of the component. A hard-coded `id="title"` breaks if two forms are on one page (an Add form and an Edit form, say), because ids must be unique.
- **`aria-invalid`** tells assistive technology this field has a problem. (ARIA attributes are extra labels for screen readers and similar tools.)
- **`aria-describedby`** links the error text to the input, so a screen reader reads it with the field, something like "Title, invalid entry, Please enter a title". (The exact words depend on the screen reader.)
- **RHF moves focus to the first invalid field** when a submit fails. Keyboard and screen reader users land right on the problem, without hunting for it. It works because `register` gave RHF the input's `ref`.

That's a lot to repeat for every field, so it's a good job for a small component of your own (exercise 5 tries it). [Chapter 38](../38-accessibility/notes.md) goes much further.

### An edit form: load, fill in, save only when changed

Editing means the form starts with a book's current values. But the book has to load first. The simplest safe approach is: **wait for the data, then build the form**.

```tsx
import { useBook, useUpdateBook } from "../api/bookQueries.ts";
import type { Book } from "../api/books.ts";

function EditBookPage({ id }: { id: string }) {
  const { data: book, isPending, isError } = useBook(id);

  if (isPending) return <p>Loading the book...</p>;
  if (isError) return <p>Couldn't load this book.</p>;

  return <EditBookForm key={book.id} book={book} />;
}

function EditBookForm({ book }: { book: Book }) {
  const updateBook = useUpdateBook();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<NewBook>({
    resolver: zodResolver(NewBookSchema),
    defaultValues: {
      title: book.title,
      author: book.author,
      pages: book.pages,
      status: book.status,
    },
  });

  async function onSubmit(values: NewBook) {
    await updateBook.mutateAsync({ id: book.id, changes: values });
    reset(values); // what you just saved is the new starting point
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* the same fields as the Add form */}
      <button type="submit" disabled={!isDirty || isSubmitting}>
        Save
      </button>
      <button type="button" disabled={!isDirty} onClick={() => reset()}>
        Discard changes
      </button>
    </form>
  );
}
```

`defaultValues` is read **once**, when the form is first created. So the page component deals with loading and errors, and only renders the form once the book exists. The form is born already filled in, with no effect needed.

- **`useBook(id)`** is chapter 31's hook for the `["books", id]` query. `useUpdateBook()` is the one you wrote in chapter 31's exercise 5. If yours takes different arguments, change the `mutateAsync` call to match.
- **`isDirty`** is `true` when any value differs from `defaultValues`. So Save stays disabled until something really changed. Change a field back to how it was, and Save disables again.
- **`reset(values)`** after a save makes the saved values the new defaults, so `isDirty` goes back to `false`. Plain `reset()` throws away unsaved changes.
- **`key={book.id}`** gives each book its own fresh form. If the page switches to another book, React builds a new form with the new book's values: the same `key` trick as [chapter 26](../26-error-boundaries-and-suspense/notes.md)'s error boundaries.
- **Background refetches can't wipe what someone's typing.** When TanStack Query refetches on window focus, `book` changes, but the form already read its defaults.

RHF also has a `values` option that refills the form whenever the data changes. It's handy, but a background refetch would then overwrite half-typed changes, unless you also set `resetOptions: { keepDirtyValues: true }`. That's why this chapter prefers "wait, then build".

### Watching values: `watch` and `useWatch`

Sometimes you want to show a value as it's typed, like a live preview:

```tsx
const { register, watch } = useForm<NewBook>({ /* ... */ });

const title = watch("title");
const author = watch("author");

<p>Preview: {title || "Untitled"} by {author || "someone"}</p>
```

`watch` works, but it has a cost: the **whole form component** re-renders on every keystroke in a watched field. That gives back the re-render saving RHF gave you. For a small form, fine. For a big one, move the preview into its own small component with `useWatch`, so only that component re-renders:

```tsx
import { useWatch } from "react-hook-form";
import type { Control } from "react-hook-form";

function TitlePreview({ control }: { control: Control<NewBook> }) {
  const title = useWatch({ control, name: "title" });
  return <p>Preview: {title || "Untitled"}</p>;
}

// in the form: const { control } = useForm<NewBook>(...);  and  <TitlePreview control={control} />
```

### Inputs that aren't real inputs: `Controller`

`register` needs a real HTML input to attach its `ref` to and read from. Some components don't have one: a star rating made of buttons, a date picker from a library, a fancy dropdown. They're controlled components, with `value` and `onChange` props like chapter 09's. `Controller` is the adapter between the two. Say your review form's schema has `rating: z.number().int().min(1).max(5)`:

```tsx
import { Controller } from "react-hook-form";

<Controller
  name="rating"
  control={control}
  render={({ field }) => (
    <StarPicker value={field.value} onChange={field.onChange} />
  )}
/>
```

`field` has `value`, `onChange`, `onBlur`, `name` and `ref`. You hand over whichever the component understands. Use `register` for normal inputs, and `Controller` only when you have to.

### Lists of fields: `useFieldArray`

Some forms have a list of the same fields: ingredients in a recipe, guests at a booking. `useFieldArray` handles adding and removing rows:

```tsx
import { useFieldArray, useForm } from "react-hook-form";

const RecipeSchema = z.object({
  name: z.string().trim().min(1, "Please enter a name"),
  ingredients: z
    .array(z.object({ name: z.string().trim().min(1, "Please enter an ingredient") }))
    .min(1, "Add at least one ingredient"),
});
type RecipeForm = z.infer<typeof RecipeSchema>;

const { register, control, handleSubmit } = useForm<RecipeForm>({
  resolver: zodResolver(RecipeSchema),
  defaultValues: { name: "", ingredients: [{ name: "" }] },
});
const { fields, append, remove } = useFieldArray({ control, name: "ingredients" });

{fields.map((field, index) => (
  <div key={field.id}>
    <input {...register(`ingredients.${index}.name`)} />
    <button type="button" onClick={() => remove(index)}>Remove</button>
  </div>
))}
<button type="button" onClick={() => append({ name: "" })}>Add ingredient</button>
```

- **Each row is an object**, `{ name: "" }`, not a plain string. `useFieldArray` needs objects.
- **`key={field.id}`**, not the index. RHF makes a stable id for each row, for exactly the reasons in [chapter 06](../06-rendering-lists/notes.md).
- **The names are paths**, like `ingredients.0.name`, and they're type-checked too: `ingredients.${index}.nmae` is an error.
- **`type="button"`** on Add and Remove, or they'd submit the form (chapter 09's mistake 8).

### Testing a form

Forms test well with [chapter 28](../28-testing/notes.md)'s tools, with three things to know:

- **Checking is async.** After `await user.click(submitButton)`, find the error with `await screen.findByText(...)`, not `getByText`.
- **`handleSubmit` calls your function with two arguments**: the values, then the submit event. So if a test passes a `vi.fn()` in as `onSubmit`, `toHaveBeenCalledWith(values)` fails. Check the first argument only, or add `expect.anything()` for the second.
- **Don't let `vi.mock` replace your schemas.** Chapter 31's `vi.mock("../api/books.ts")` turns *everything* in that file into fakes, including `NewBookSchema`, and the form's checking falls over. Keep the real file and fake only what you need:

```tsx
vi.mock("../api/books.ts", async (importOriginal) => {
  const real = await importOriginal<typeof import("../api/books.ts")>();
  return { ...real, addBook: vi.fn() }; // real schemas, fake addBook
});
```

### When you don't need it

- **Small forms.** A search box, a login, a single "add task" field: chapter 09's `useState` is short, clear, and fine.
- **A form that drives the page as you type**, like a live filter. There, updating state on every keystroke is the whole point.
- **React 19's form actions in a framework.** In Next.js ([chapter 39](../39-nextjs-and-server-components/notes.md)), `<form action={...}>` and `useActionState` can send a form to the server with very little code. Plenty of teams still use RHF there for rich checking in the browser.

And whichever you use, remember [JavaScript chapter 51](../../JavaScript/51-security-basics/notes.md): **the browser checks for convenience, the server checks for safety.** Anyone can skip your form and send anything. A real server must check again.

## Common mistakes

**1. Forgetting the spread**

```tsx
<input {register("title")} />   // ❌ '...' expected.
<input ref={register} />        // ❌ an old (version 6) tutorial: a long type error
<input {...register("title")} /> // ✅
```

**2. Numbers arriving as text**

Without `valueAsNumber: true`, typing `320` gives `Pages must be a number`, because Zod receives `"320"`. Add it to every number input.

**3. Mixing `value` and `onChange` with `register`**

```tsx
<input {...register("title")} value={title} onChange={(e) => setTitle(e.target.value)} /> // ❌
```

Your `onChange` replaces RHF's, so RHF never hears about the typing. If you need to react to changes, use `register("title", { onChange: ... })`, or `watch`.

**4. `onSubmit={handleSubmit}` instead of `onSubmit={handleSubmit(onSubmit)}`**

TypeScript rejects it with a long error that includes `Types of parameters 'onValid' and 'event' are incompatible.` `handleSubmit` is a function that *makes* your submit handler. Call it with yours.

**5. Not awaiting the save**

```tsx
function onSubmit(values: NewBook) {
  addBook.mutate(values); // ❌ returns nothing to wait for
}
```

`isSubmitting` flicks off at once, and an impatient double-click can save the book twice. Make `onSubmit` `async` and `await addBook.mutateAsync(values)`.

**6. No `defaultValues`**

Then `reset()` has nothing to go back to, `isDirty` has nothing to compare with, and `Controller` inputs can warn about switching from uncontrolled to controlled (chapter 09's warning). Give every field a starting value.

**7. `watch` everywhere**

Each `watch` re-renders the whole form on every keystroke in that field. Watch only what you display, and use `useWatch` in a small child component for big forms.

**8. Error text that isn't linked to its field**

A red message under a box is invisible to a screen reader unless the input points at it with `aria-describedby`. Add `aria-invalid` too.

**9. Resetting before the save worked**

```tsx
reset();                               // ❌ the typing is gone...
await addBook.mutateAsync(values);     // ...and then the save fails
```

Always `await` the save first, then `reset()`.

**10. `useForm<T>` with a schema that has `.default()` or `.transform()`**

```
Type 'Resolver<{ ...; status?: ... | undefined; }, any, { ...; status: ...; }>' is not assignable to type 'Resolver<...>'.
```

With `.default()`, the data going in and the data coming out have different types (chapter 32), but `useForm<T>` says they're the same. Leave out `<T>` and let the resolver tell `useForm` both types.

## Quick recap

- **React Hook Form** runs your forms: values, checking, errors, and submitting. `useForm`, then `{...register("name")}` on each input, then `onSubmit={handleSubmit(onSubmit)}`.
- `register` spreads `name`, `onChange`, `onBlur` and `ref`. Inputs stay **uncontrolled**, so typing doesn't re-render the form.
- With a typed `useForm<NewBook>()`, field names are type-checked: `register("emial")` is a type error.
- `resolver: zodResolver(NewBookSchema)` makes one schema the type, the rules, and the messages, shared with the API. Use `valueAsNumber` for number inputs.
- Give every field `defaultValues`. `mode: "onTouched"` is usually the friendliest time to show errors.
- Make `onSubmit` `async`, `await` the mutation, then `reset()`. `isSubmitting` covers the wait, and `setError("root.serverError", ...)` shows a save that failed.
- Link errors with `aria-invalid` and `aria-describedby`. RHF focuses the first invalid field for you.
- For editing, load first and build the form second. `isDirty` enables Save only when something changed. `watch` has a re-render cost, `Controller` wraps non-native inputs, and `useFieldArray` handles lists.

---

**Next:** try the [exercises](exercises.md), then move on to [34 Zustand](../34-zustand/notes.md).
