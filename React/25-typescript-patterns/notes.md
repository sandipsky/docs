# 25 TypeScript Patterns for React

## What is it?

Four techniques for typing components that are genuinely reusable:

```tsx
<List items={books} renderItem={(book) => <BookCard book={book} />} />   // generic components
<Button variant="primary" onClick={...} type="submit" />                 // reusing HTML props
<Alert kind="error" message="..." />                                     // props that depend on each other
```

Everything up to now has typed props one component at a time, which is the right default. This chapter is about the handful of components — buttons, inputs, lists, modals — that get used *everywhere*, where a bit more type effort pays for itself many times over.

## Why does it matter?

You've written plenty of props types by now, and they've all had the same shape: a fixed list of fields with fixed types. That works perfectly until you try to write something genuinely general, and then it stops:

```tsx
type ListProps = {
  items: ???;                          // items of what?
  renderItem: (item: ???) => ReactNode;
};
```

There's no answer to fill in. `Book[]` makes the list only work for books. `any[]` makes it work for everything and check nothing — and then `renderItem`'s parameter is `any` too, so every typo inside it goes unnoticed. Neither is acceptable for a component you'll use fifty times.

The same wall shows up in three other places:

- **A `<Button>` wrapper** that needs to accept `onClick`, `disabled`, `type`, `aria-label` and the other forty things a real `<button>` accepts — without you typing all forty out by hand.
- **A component where one prop changes what others mean**: an `<Alert>` that needs a `retry` function when it's an error, and mustn't have one when it's a success.
- **Reusing a type you already have** rather than restating its shape and letting the two drift apart.

These patterns are how shared component libraries are built. You don't need them for a one-off card — you need them the moment something is used everywhere.

## Real-world example

Think about a **shelving system** versus a **bookcase**.

| A bookcase | Adjustable shelving |
|---|---|
| Built for books, specific height | `type ListProps = { items: Book[] }` |
| Works beautifully for books | Works beautifully for one case |
| Useless for shoes or files | Useless for anything but books |
| Buy a second one for shoes | Copy the component and change the type |
| **Adjustable shelving**: one system, any contents | **Generic component**: one component, any item type |
| Still holds things securely — it's not a pile on the floor | Still fully type-checked — it's not `any` |

The important half of that last row: adjustable doesn't mean flimsy. A generic component isn't "typed loosely" — it's typed *precisely*, just with the specific type filled in per use.

## How it works

### Generic components

A **generic** ([TypeScript chapter 08](../../TypeScript/08-generics/notes.md)) is a type you leave as a blank, filled in at each use. Components take them the same way functions do:

```tsx
type ListProps<T> = {
  items: readonly T[];
  renderItem: (item: T) => ReactNode;
  keyOf: (item: T) => string;
};

function List<T>({ items, renderItem, keyOf }: ListProps<T>) {
  if (items.length === 0) {
    return <p>Nothing to show.</p>;
  }

  return (
    <ul>
      {items.map((item) => (
        <li key={keyOf(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}
```

`<T>` after the component name declares the blank. Now `T` means "whatever type the items are," consistently, across all three props.

Using it, you don't specify `T` at all:

```tsx
<List
  items={books}
  keyOf={(book) => book.id}
  renderItem={(book) => <span>{book.title} ({book.year})</span>}
/>
```

TypeScript **infers** `T` as `Book` from `items`, and then knows `book` is a `Book` inside both callbacks — with full autocomplete, and an error if you write `book.titel`. The same component works for `User[]`, `Recipe[]`, anything:

```tsx
<List items={users} keyOf={(u) => u.email} renderItem={(u) => <b>{u.name}</b>} />
```

One component, fully checked, every time.

**Constraining the blank.** If your component needs the items to have something in particular, say so with `extends`:

```tsx
type ListProps<T extends { id: string }> = {
  items: readonly T[];
  renderItem: (item: T) => ReactNode;
};

function List<T extends { id: string }>({ items, renderItem }: ListProps<T>) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>{renderItem(item)}</li>   // ✅ id is guaranteed to exist
      ))}
    </ul>
  );
}
```

Now `T` can be any type *that has a string `id`*, which lets you drop the `keyOf` prop entirely. Pass something without an `id` and TypeScript stops you at the call site.

> **A `.tsx` gotcha:** in a `.tsx` file, `const List = <T>(props: Props<T>) => ...` fails to parse — TypeScript reads `<T>` as a JSX tag. Use a `function` declaration (as above), or write `<T,>` with a trailing comma to disambiguate. This course uses `function` declarations everywhere, which sidesteps it.

### Reusing HTML props

Writing a `<Button>` wrapper that forwards everything a real button accepts:

```tsx
type ButtonProps = {
  variant: "primary" | "secondary";
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  // ...and aria-label, autoFocus, form, name, title, onFocus, onBlur...
};
```

This is unwinnable by hand — the list is enormous, and you'll always be missing whichever one you need next. React already has these types. Borrow them:

```tsx
import type { ComponentPropsWithoutRef } from "react";

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant: "primary" | "secondary";
};

function Button({ variant, className, ...rest }: ButtonProps) {
  return (
    <button className={`btn btn-${variant} ${className ?? ""}`} {...rest} />
  );
}
```

`ComponentPropsWithoutRef<"button">` is "every prop a real `<button>` accepts." `&` joins it with your own additions ([TypeScript chapter 04](../../TypeScript/04-type-aliases-and-interfaces/notes.md)). Now this all works, fully checked, for free:

```tsx
<Button variant="primary" type="submit" disabled aria-label="Save the form">Save</Button>
<Button variant="primary" onClick={handleClick} autoFocus>Go</Button>
<Button variant="primary" hrefTarget="_blank">Nope</Button>
// ❌ Property 'hrefTarget' does not exist on type ...
```

Two things doing real work in that component:

- **`...rest`** collects every prop you didn't name and spreads it onto the real `<button>` ([JavaScript chapter 15](../../JavaScript/15-destructuring-spread-rest/notes.md)). This is the one place where spreading props ([chapter 04](../04-props/notes.md) warned about it) is genuinely the right call — the whole purpose of the component is to pass them through.
- **Pulling `className` out separately** so you can merge it with your own classes rather than letting the caller's version silently replace them. Forget this, and `<Button className="mt-4">` would wipe out `btn btn-primary`.

**`ComponentPropsWithoutRef` vs `ComponentProps`.** Use `WithoutRef` unless you're deliberately handling a `ref`. If you *do* want the wrapper to forward a ref, React 19 makes that a plain prop ([chapter 19](../19-refs/notes.md)), so use `ComponentProps<"button">` and pass `ref` through with everything else.

It works for your own components too: `ComponentProps<typeof RecipeCard>` gives you exactly that component's props, so a wrapper can never drift out of sync with what it's wrapping.

### Props that depend on each other

Some components have props that only make sense in certain combinations:

```tsx
type AlertProps = {
  kind: "success" | "error";
  message: string;
  onRetry?: () => void;      // ⚠️ only meaningful for errors
};
```

Nothing stops `<Alert kind="success" onRetry={...} />`, which is meaningless, or `<Alert kind="error" />` with no way to retry, which may be a bug. Comments can't enforce it. A **discriminated union** can — the same tool as [chapter 23](../23-use-reducer/notes.md)'s actions, applied to props:

```tsx
type AlertProps =
  | { kind: "success"; message: string }
  | { kind: "error"; message: string; onRetry: () => void };

function Alert(props: AlertProps) {
  if (props.kind === "error") {
    return (
      <div className="alert error">
        {props.message}
        <button onClick={props.onRetry}>Try again</button>
      </div>
    );
  }

  return <div className="alert success">{props.message}</div>;
}
```

Now the rules are enforced at every call site:

```tsx
<Alert kind="error" message="Failed" onRetry={handleRetry} />   // ✅
<Alert kind="success" message="Saved" />                        // ✅
<Alert kind="error" message="Failed" />
// ❌ Property 'onRetry' is missing in type ... but required in type '{ kind: "error"; ... }'.
<Alert kind="success" message="Saved" onRetry={handleRetry} />
// ❌ Object literal may only specify known properties, and 'onRetry' does not exist in type '{ kind: "success"; message: string; }'.
```

**Note the parameter isn't destructured here.** `function Alert(props: AlertProps)` rather than `function Alert({ kind, message, onRetry }: AlertProps)` — because narrowing needs `props.kind` checked as a whole. Destructure up front and TypeScript loses track of the connection between `kind` and the rest. Destructure *inside* each branch if you want to, once the narrowing has happened.

### `satisfies`, for checking without widening

A newer operator worth knowing ([TypeScript chapter 02](../../TypeScript/02-basic-types/notes.md) covers literal types). Compare:

```tsx
const variants: Record<string, string> = {
  primary: "btn-blue",
  secondary: "btn-grey",
};
variants.primry;    // no error — Record<string, string> allows any key
```

```tsx
const variants = {
  primary: "btn-blue",
  secondary: "btn-grey",
} satisfies Record<string, string>;

variants.primry;
// ❌ Property 'primry' does not exist on type '{ primary: string; secondary: string; }'.
```

`satisfies` **checks** the value against a type without **replacing** the value's own, more specific type. You get the validation of the annotation and the precision of inference at once — very useful for the lookup objects from [chapter 05](../05-conditional-rendering/notes.md).

### Deriving types instead of restating them

When two types must agree, derive one from the other so they can't drift:

```tsx
type ButtonProps = {
  variant: "primary" | "secondary" | "outline";
  size: "small" | "large";
};

// ✅ derived — add a variant and this updates itself
const variantClasses: Record<ButtonProps["variant"], string> = {
  primary: "btn-blue",
  secondary: "btn-grey",
  outline: "btn-outline",
};

// ❌ restated — add a variant and this silently goes stale
const variantClasses: Record<"primary" | "secondary" | "outline", string> = { ... };
```

`ButtonProps["variant"]` is an **indexed access type**: "whatever type that property has." Add `"danger"` to `ButtonProps` and the derived version immediately errors with "Property 'danger' is missing," pointing straight at the thing you forgot.

The same idea, with `typeof`, works from a value:

```tsx
const ROLES = ["admin", "editor", "viewer"] as const;
type Role = (typeof ROLES)[number];    // "admin" | "editor" | "viewer"
```

`as const` makes the array's contents literal types rather than `string[]`, and `[number]` means "the type of any element." Now one list drives both the runtime values (for a `<select>`, say) and the type — they cannot disagree.

### Typing children precisely

`children: ReactNode` is right nearly always. Two variations worth knowing:

```tsx
type Props = {
  children: ReactNode;                    // anything renderable — the default
};

type Props = {
  children: (item: Item) => ReactNode;    // a function — "render props"
};
```

The second is a component that hands data *back* to whatever's inside it:

```tsx
<DataLoader url="/api/books">
  {(books) => <List items={books} renderItem={(b) => b.title} />}
</DataLoader>
```

You'll meet this in older libraries especially. Custom hooks ([chapter 20](../20-custom-hooks/notes.md)) have replaced it for most purposes — `const books = useBooks(url)` is plainly easier to read — but recognise it when you see it.

### A worked example: a typed, reusable `Select`

Putting three of these together:

```tsx
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type SelectProps<T> = Omit<ComponentPropsWithoutRef<"select">, "onChange" | "value"> & {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  getLabel: (option: T) => string;
  getValue: (option: T) => string;
};

function Select<T>({
  label,
  options,
  value,
  onChange,
  getLabel,
  getValue,
  ...rest
}: SelectProps<T>) {
  return (
    <label>
      {label}
      <select
        value={getValue(value)}
        onChange={(event) => {
          const found = options.find((o) => getValue(o) === event.target.value);
          if (found) onChange(found);
        }}
        {...rest}
      >
        {options.map((option) => (
          <option key={getValue(option)} value={getValue(option)}>
            {getLabel(option)}
          </option>
        ))}
      </select>
    </label>
  );
}
```

`Omit<..., "onChange" | "value">` ([TypeScript chapter 09](../../TypeScript/09-utility-types/notes.md)) removes the native versions of those two props, because this component replaces them with its own, better-typed versions — the native `onChange` hands you an event with a string; this one hands you the actual `T` you passed in.

```tsx
<Select
  label="Author"
  options={authors}
  value={selectedAuthor}
  onChange={setSelectedAuthor}     // receives an Author, not a string
  getLabel={(a) => a.name}
  getValue={(a) => a.id}
  disabled={isLoading}              // a real <select> prop, still available
/>
```

### Don't do this everywhere

A closing caution, because this chapter is easy to over-apply. **Most components should have a plain, boring props type.** A `<RecipeCard>` used in one place gains nothing from being generic, and a lot of clever typing makes code harder to read and much harder to fix when it goes wrong.

The signal for reaching into this chapter is **reuse across unrelated things**: you're writing your third nearly-identical list, or you're building a component every screen in the app will use. Until then, `type Props = { ... }` is the right answer.

## Common mistakes

**1. `any[]` instead of a generic**

```tsx
type ListProps = { items: any[]; renderItem: (item: any) => ReactNode };
```

Compiles, checks nothing, and silently makes every callback parameter unchecked too. A generic is barely more typing and keeps everything checked.

**2. Arrow function generics in a `.tsx` file**

```tsx
const List = <T>(props: ListProps<T>) => { ... };
// ❌ parsed as JSX
```

Use a `function` declaration, or `<T,>` with a trailing comma.

**3. Destructuring props before narrowing a discriminated union**

```tsx
function Alert({ kind, message, onRetry }: AlertProps) {
  if (kind === "error") {
    onRetry();    // ❌ TypeScript no longer knows onRetry exists here
  }
}
```

Take the whole `props` object, narrow on `props.kind`, then destructure inside the branch.

**4. Forgetting to merge `className` in a wrapper**

```tsx
function Button({ variant, ...rest }: ButtonProps) {
  return <button className={`btn btn-${variant}`} {...rest} />;
}
```

`...rest` includes `className` if the caller passed one — and because it comes **after** your `className`, it silently overwrites yours entirely. Pull it out and merge it deliberately.

**5. Restating a union instead of deriving it**

Two copies of `"primary" | "secondary" | "outline"` will drift apart. `ButtonProps["variant"]` can't.

**6. Reaching for `ComponentProps` when you just need a few props**

If your component only ever needs `onClick` and `disabled`, listing them is clearer than inheriting forty. Use the HTML-props trick for genuine pass-through wrappers, not everywhere.

**7. Making everything generic**

A generic with only ever one concrete type isn't buying anything — it's just harder to read. Wait for the second real use case.

## Quick recap

- A **generic component** (`function List<T>(props: ListProps<T>)`) works with any item type while staying fully checked. TypeScript infers `T` from the props at each call site.
- Constrain it with `extends` when your component needs the items to have something — `T extends { id: string }`.
- **`ComponentPropsWithoutRef<"button">`** gives you every prop a real element accepts. Join it with `&`, spread the `...rest`, and remember to merge `className` rather than let it be overwritten.
- **Discriminated union props** make impossible prop combinations un-writable. Don't destructure the parameter, or narrowing won't work.
- **`satisfies`** checks a value against a type without widening it — ideal for lookup objects.
- **Derive types rather than restating them**: `ButtonProps["variant"]`, or `(typeof ROLES)[number]` with `as const`.
- In a `.tsx` file, write generic components as `function` declarations — arrow-function generics collide with JSX syntax.
- Save all of this for components used **across unrelated things**. A plain props type is the right default.

---

**Next:** try the [exercises](exercises.md), then move on to [26 Error Boundaries and Suspense](../26-error-boundaries-and-suspense/notes.md).
