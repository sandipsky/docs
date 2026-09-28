# 25 TypeScript Patterns for React: Exercises

**How to do these:**

- Work in your practice app, one folder per exercise: `src/ch25/ex1/`, and so on.
- **The test for every exercise here is the error message, not the working case.** For each one, deliberately write the wrong call and check that TypeScript stops you with a *useful* message. A type that doesn't catch mistakes isn't doing its job.
- No `any`, no `as`, and no `@ts-ignore` anywhere in this chapter. If you're reaching for one, the type needs rethinking.
- An exercise is done when the good calls compile, the bad calls are caught, `npx tsc -b` prints nothing, and the page works.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): A generic `List`

In `src/ch25/ex1/`, build the generic `List` component from the notes, then prove it's genuinely generic.

1. `List<T>` takes `items: readonly T[]`, `renderItem: (item: T) => ReactNode`, and `keyOf: (item: T) => string`. It shows `Nothing to show.` for an empty array.
2. Use it **three** times on one page with three unrelated types: a list of books (objects), a list of plain `string` tags, and a list of `number`s.
3. In each `renderItem`, hover over the parameter and confirm TypeScript knows exactly what it is — `Book`, `string`, `number` — with no annotations from you.
4. Break it on purpose and write down each error:
   - misspell a field inside `renderItem` (`book.titel`)
   - pass `keyOf` a function returning a `number` instead of a `string`
   - pass `items={books}` but write `renderItem={(user: User) => ...}`
5. Now add a constrained version, `IdList<T extends { id: string }>`, that drops `keyOf` entirely. Use it with your books, then try to use it with the string array. What's the error, and is it a good one?

<details>
<summary>Hint 1</summary>

For question 5, the error appears at the *call site*, saying a `string` isn't assignable to `{ id: string }`. That's exactly right — the constraint is the component saying "I need items with ids," and the caller is the one who broke the promise.

</details>

---

## Exercise 2 (Easy): A `Button` that accepts everything

In `src/ch25/ex2/`, build the `Button` wrapper from the notes.

1. `ButtonProps` is `ComponentPropsWithoutRef<"button">` joined with your own `variant: "primary" | "secondary" | "danger"` and `size?: "small" | "large"`.
2. The component merges its own classes with any `className` the caller passes, and spreads the rest.
3. Render at least six buttons using a mix of your props and native ones: `type="submit"`, `disabled`, `onClick`, `aria-label`, `autoFocus`, `title`, and a custom `className`.
4. **Prove the className merge works**: render `<Button variant="primary" className="mt-4">` and check in the Elements tab that *both* `btn-primary` and `mt-4` are on the element. Then deliberately remove your `className` handling (leaving it in `...rest`) and confirm your own classes vanish.
5. Try `<Button variant="primary" hrefTarget="_blank">`. Write down the error.
6. Add a `<Card>` component, then type a `<FeaturedCard>` wrapper using `ComponentProps<typeof Card>` so it can never drift out of sync with `Card`'s props. Add a prop to `Card` and confirm `FeaturedCard` picks it up with no edit.

<details>
<summary>Hint 1</summary>

Question 4 is the one to actually run rather than reason about. The bug is invisible in the code and obvious in the Elements tab: `...rest` spread *after* your `className` attribute silently replaces it.

</details>

---

## Exercise 3 (Medium): Props that can't be wrong

In `src/ch25/ex3/`, build three components whose prop combinations are enforced by the types.

**1. `Alert`** — as in the notes: `kind: "success"` needs only a message; `kind: "error"` also requires `onRetry`.

**2. `Avatar`** — either an image or initials, never both, never neither:

```tsx
<Avatar imageUrl="/maya.jpg" name="Maya" />   // ✅
<Avatar initials="MS" name="Maya" />           // ✅
<Avatar name="Maya" />                          // ❌
<Avatar imageUrl="/maya.jpg" initials="MS" name="Maya" />  // ❌
```

**3. `Field`** — a form field where the `type` determines what else is allowed:

```tsx
<Field type="text" label="Name" value={name} onChange={setName} />              // ✅
<Field type="select" label="Size" value={size} onChange={setSize}
       options={["S", "M", "L"]} />                                              // ✅
<Field type="text" label="Name" value={name} onChange={setName}
       options={["S"]} />                                                        // ❌ options is select-only
<Field type="select" label="Size" value={size} onChange={setSize} />             // ❌ options is required
```

For each, write out the good and bad calls above in your test page, confirm the bad ones are caught, and record the error messages in a comment.

<details>
<summary>Hint 1</summary>

For `Avatar`, the union has two members that share `name` but differ otherwise. Excess property checking is what catches the "both" case — passing `initials` to the image variant isn't a known property of that member.

</details>

<details>
<summary>Hint 2</summary>

Remember not to destructure the parameter for any of these. `function Field(props: FieldProps)`, then narrow on `props.type`, then destructure inside the branch if you like.

</details>

---

## Exercise 4 (Medium): Derive, don't restate

In `src/ch25/ex4/`, build a small status-badge system that makes drift impossible.

1. Define the statuses **once**, as a `const` array with `as const`:

   ```ts
   export const STATUSES = ["draft", "review", "published", "archived"] as const;
   ```

2. Derive the type from it: `type Status = (typeof STATUSES)[number]`.
3. Build a `StatusBadge` component taking `status: Status`, using a lookup object for label and colour, typed with `Record<Status, StatusStyle>` **and** written with `satisfies` so the object's own keys stay precise.
4. Build a `<StatusFilter>` `<select>` whose options are generated by mapping over `STATUSES` — so the runtime list and the type come from the same place.
5. **Now add a fifth status, `"deleted"`, to the array only.** Save, and write down every error TypeScript gives you and which file each points at. Fix them all.
6. Do the same experiment on a "restated" version where `Status` is written out by hand as a union and the array is written out separately. Add a sixth status to just one of them. How many errors do you get, and how long would that bug have survived?

<details>
<summary>Hint 1</summary>

Question 6 is the point of the whole exercise. In the restated version, adding to the array only means the `<select>` gains an option that nothing else knows about — no error at all, and a badge that silently renders nothing when someone picks it.

</details>

---

## Exercise 5 (Challenge): A typed data table

Build the component every app eventually needs, in `src/ch25/ex5/`: a generic, fully typed `<DataTable>`.

```tsx
<DataTable
  items={books}
  getRowId={(book) => book.id}
  columns={[
    { header: "Title", render: (book) => book.title, sortBy: (book) => book.title },
    { header: "Year", render: (book) => book.year, sortBy: (book) => book.year },
    { header: "Author", render: (book) => book.author },
  ]}
/>
```

Requirements:

1. `DataTable<T>` takes `items: readonly T[]`, `getRowId: (item: T) => string`, and `columns`.
2. A column is `{ header: string; render: (item: T) => ReactNode; sortBy?: (item: T) => string | number }`. Give it its own exported `Column<T>` type.
3. Inside `render` and `sortBy`, the parameter must be correctly typed as `T` with **no annotation from the caller**.
4. Columns with a `sortBy` get a clickable header that sorts by it; clicking again reverses. Columns without one are not clickable at all.
5. Sorting never mutates `items` ([chapter 11](../11-updating-objects-and-arrays/notes.md)).
6. Show `No rows.` for an empty array.
7. Use it **twice** on one page with two unrelated types, to prove it's really generic.

Then, the type-level tests — write each of these and record what happens:

8. A column whose `render` reads a field that doesn't exist on `T`.
9. `sortBy` returning a `boolean`.
10. `items={books}` with a column written as `render: (user: User) => user.name`.

<details>
<summary>Hint 1</summary>

For requirement 4, tracking "which column is sorted" is tricky when columns are objects rather than strings. The simplest approach that stays type-safe: store the sorted column's **index** (`number | null`) plus a direction, and look the column up when you need it.

</details>

<details>
<summary>Hint 2</summary>

For requirement 3 to work, `columns` needs to be typed as `readonly Column<T>[]` so that `T` flows from `items` into every column's callbacks. If TypeScript infers `unknown` for your callback parameters, the link between `items` and `columns` has been broken somewhere — check that both mention the *same* `T`.

</details>

<details>
<summary>Hint 3</summary>

For requirement 5, remember `sortBy` can return a `string` or a `number`, and those sort differently. `localeCompare` for strings, subtraction for numbers — a small `if (typeof a === "string")` inside the comparator handles both, and TypeScript narrows it properly.

</details>
