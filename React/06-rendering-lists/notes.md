# 06 Rendering Lists

## What is it?

To turn an array into a list on the page, you use `map` ([JavaScript chapter 13](../../JavaScript/13-array-methods/notes.md)):

```tsx
const drinks = ["Espresso", "Latte", "Mint Tea"];

<ul>
  {drinks.map((drink) => (
    <li key={drink}>{drink}</li>
  ))}
</ul>
```

`map` turns each item into a piece of JSX, and React shows them all. The odd-looking `key` is the important part of this chapter, and it gets a long section of its own.

## Why does it matter?

At the end of [chapter 05](../05-conditional-rendering/notes.md), you wrote out three `<LoanRow />`s by hand. That's fine for exactly three loans that never change. Real data isn't like that:

- You don't know how many items there are until the app is running.
- The number changes: someone adds a task, deletes a book, filters the list.
- The data arrives from a server, as an array.

Writing a component per item by hand isn't just tedious, it's impossible. You need a way to say "one of these for every item in that array", and `map` is it.

This is also where React starts to feel like a big win over plain JavaScript. In [JavaScript chapter 24](../../JavaScript/24-project-todo-app/notes.md), drawing the to-do list took a `render()` function that emptied the `<ul>` and rebuilt every `<li>` with `createElement`. Here it's three lines, and React works out what to change.

## Real-world example

Think about **mail merge**, or printing address labels.

| Address labels | Rendering a list |
|---|---|
| A spreadsheet of names and addresses | Your array |
| One blank label design | Your component |
| The printer runs the design once per row | `map` |
| A hundred rows means a hundred labels | React makes one element per item |
| Each label needs the *right* address on it | This is what `key` is for |

That last row is the one to remember. A stack of labels is useless if they're stuck to the wrong envelopes.

## How it works

### `map` inside braces

Curly braces accept any expression, and an **array** of JSX is one of the things React knows how to show (from the table in [chapter 02](../02-jsx/notes.md)). So you can drop a `map` straight in:

```tsx
function DrinkList() {
  const drinks = ["Espresso", "Latte", "Mint Tea"];

  return (
    <ul>
      {drinks.map((drink) => (
        <li key={drink}>{drink}</li>
      ))}
    </ul>
  );
}
```

`map` gives back `[<li>Espresso</li>, <li>Latte</li>, <li>Mint Tea</li>]`, and React renders each one in order.

It must be `map`, not `forEach`. `forEach` returns `undefined`, so you'd get a blank page and no error at all.

### Arrays of objects, with a component

Real lists hold objects, and each item usually deserves its own component:

```tsx
// Drink.ts
export type Drink = {
  id: number;
  name: string;
  price: number;
};

export const drinks: Drink[] = [
  { id: 1, name: "Espresso", price: 2.5 },
  { id: 2, name: "Latte", price: 3.5 },
  { id: 3, name: "Mint Tea", price: 2 },
];
```

```tsx
// MenuItem.tsx
type MenuItemProps = {
  drink: Drink;
};

function MenuItem({ drink }: MenuItemProps) {
  return (
    <li>
      {drink.name} — ${drink.price.toFixed(2)}
    </li>
  );
}
```

```tsx
// Menu.tsx
function Menu() {
  return (
    <ul>
      {drinks.map((drink) => (
        <MenuItem key={drink.id} drink={drink} />
      ))}
    </ul>
  );
}
```

That's the standard shape you'll write hundreds of times: **a list component that maps, and an item component that renders one thing.**

Two things to notice:

- **The `key` goes on the element the `map` returns** — here, on `<MenuItem />` — not on the `<li>` inside `MenuItem`. More on that below.
- **TypeScript needs no help.** `drinks` is `Drink[]`, so `drink` is a `Drink`. Hover over it and see. Misspell `drink.nmae` and you get an error, as always.

### The two shapes of an arrow function

This trips people up, so it's worth being explicit. These are the same:

```tsx
{drinks.map((drink) => (
  <MenuItem key={drink.id} drink={drink} />
))}

{drinks.map((drink) => {
  return <MenuItem key={drink.id} drink={drink} />;
})}
```

Round brackets `( )` after the arrow mean "here comes the value to return". Curly braces `{ }` mean "here comes a block of code", and a block needs the word `return`. Forget it and you get an empty list, silently.

Use the `( )` form when you're just returning JSX. Use `{ }` when you need a line or two of work first:

```tsx
{drinks.map((drink) => {
  const label = drink.price > 3 ? "Premium" : "Everyday";
  return <MenuItem key={drink.id} drink={drink} label={label} />;
})}
```

### Keys: why React needs them

Leave the `key` out and React complains in the Console:

```
Each child in a list should have a unique "key" prop.
```

It's worth understanding what React is actually asking for, because this is one of the few places where doing it thoughtlessly causes real bugs.

When your list changes, React doesn't rebuild the whole thing. It compares the new list with the old one and changes as little as possible. To do that, it has to answer one question for each item: **"is this the same item I had before, or a different one?"**

Without a key, all React has to go on is **position**. Item 1 matches item 1, item 2 matches item 2. That's the address-label problem: if you insert a new name at the top of the spreadsheet, every label after it is now on the wrong envelope.

A `key` is a name tag. It lets React say "this is the same item, it just moved" instead of "everything from position 2 onwards changed".

### What goes wrong without a good key

Here's the bug, concretely. Imagine a list where each row has a tick box:

```
[ ] Buy milk
[x] Book the dentist      <- you ticked this one
[ ] Call grandma
```

Now you add "Walk the dog" at the **top** of the array. With position-based matching, React thinks:

- Position 1 used to be "Buy milk", now it's "Walk the dog" → change the text.
- Position 2 used to be "Book the dentist", now it's "Buy milk" → change the text.
- ...and so on.

It only changes the *text*, because that's all that differs. The tick box at position 2 is left alone. So you get:

```
[ ] Walk the dog
[x] Buy milk              <- the tick stayed behind!
[ ] Book the dentist
[ ] Call grandma
```

The tick didn't follow its task. With `key={task.id}`, React knows "Book the dentist" is the same item that just moved down one, and moves the whole row, tick and all.

The same thing happens to anything React is keeping for that row: what you typed into a box, whether a section is open, an animation halfway through, and (from [chapter 08](../08-state/notes.md)) the row's own state.

### The rules for keys

A key must be:

1. **Unique among its siblings.** Two lists on the same page can both use key `1`. Two items *in the same list* cannot.
2. **Stable.** The same item must get the same key every time. Keys that change on every render are as bad as no keys, and slower.
3. **From your data.** An `id` from your database, a filename, an email address. Something that genuinely identifies the item.

```tsx
<MenuItem key={drink.id} drink={drink} />       // ✅ an id
<li key={filename}>{filename}</li>              // ✅ unique, stable text
<li key={index}>{name}</li>                     // ⚠ see below
<li key={Math.random()}>{name}</li>             // ❌ never
```

`key={Math.random()}` is the worst of all. Every render gives every item a brand-new key, so React throws away every row and rebuilds it from scratch, every single time.

### What about the index?

`map` hands you the index as a second argument, and it's tempting:

```tsx
{drinks.map((drink, index) => (
  <MenuItem key={index} drink={drink} />
))}
```

The index is the item's **position**, which is exactly the thing that isn't stable. Using it as a key is the same as having no key at all, just without the warning. That's why it's worse than it looks: it silences the message that was trying to help you.

The index is fine **only when all three of these are true**:

- the list never gets reordered or sorted,
- items are never added or removed except at the very end,
- the items have no state of their own and no inputs.

A fixed list of table headings? Fine. Anything a user can touch? No.

**If your data has no id, give it one.** Where the data comes from decides how:

- **From a server:** it almost always has an `id` already.
- **Made in your app:** generate one when you create the item, not when you render it. In the browser, `crypto.randomUUID()` gives you a unique string:

  ```ts
  const newTask = { id: crypto.randomUUID(), text: "Buy milk", done: false };
  ```

  The key part is *when*: the id is created once, when the task is born, and stored with it. That's what makes it stable.

### `key` is not a prop

This surprises everyone once:

```tsx
function MenuItem({ key, drink }: MenuItemProps) {
  console.log(key);   // undefined
```

React uses `key` itself and doesn't pass it through. If the component needs the id, pass it separately:

```tsx
<MenuItem key={drink.id} id={drink.id} drink={drink} />
```

(Usually it's already inside `drink`, so you don't need to.)

`key` is one of those `IntrinsicAttributes` that TypeScript mentioned back in [chapter 04](../04-props/notes.md): React's own built-in props, allowed on every component.

### Where exactly to put the key

On the **outermost element returned by the map callback**. Not inside the component:

```tsx
// ❌ the warning doesn't go away
function MenuItem({ drink }: MenuItemProps) {
  return <li key={drink.id}>{drink.name}</li>;
}

{drinks.map((drink) => <MenuItem drink={drink} />)}

// ✅
function MenuItem({ drink }: MenuItemProps) {
  return <li>{drink.name}</li>;
}

{drinks.map((drink) => <MenuItem key={drink.id} drink={drink} />)}
```

React needs the key at the point where it's comparing a list of things. That's the `map`.

If each item needs two elements with no wrapper, use a **fragment with a key**, which needs its long form:

```tsx
import { Fragment } from "react";

{drinks.map((drink) => (
  <Fragment key={drink.id}>
    <dt>{drink.name}</dt>
    <dd>${drink.price.toFixed(2)}</dd>
  </Fragment>
))}
```

The short `<>` can't take a key.

### Filtering, sorting and mapping together

`map` chains with everything else you know:

```tsx
{drinks
  .filter((drink) => drink.price < 3)
  .map((drink) => <MenuItem key={drink.id} drink={drink} />)}
```

Reading it out loud gets you the meaning: take the drinks, keep the cheap ones, make a card for each.

When the chain gets long, pull it above the `return` and give it a name:

```tsx
function Menu() {
  const cheapDrinks = drinks.filter((drink) => drink.price < 3);

  return (
    <ul>
      {cheapDrinks.map((drink) => (
        <MenuItem key={drink.id} drink={drink} />
      ))}
    </ul>
  );
}
```

Same rule as always: work above the `return`, show in the JSX.

**Careful with `sort`.** It changes the array it's called on ([JavaScript chapter 16](../../JavaScript/16-values-vs-references/notes.md)), which would be changing your data during a render — exactly the impurity [chapter 03](../03-components/notes.md) warned about. Sort a copy:

```tsx
const byPrice = [...drinks].sort((a, b) => a.price - b.price);
const byPrice = drinks.toSorted((a, b) => a.price - b.price);  // newer, same idea
```

### Don't forget the empty list

`map` over an empty array gives an empty array, which renders nothing at all. Usually you want to say something ([chapter 05](../05-conditional-rendering/notes.md)):

```tsx
function Menu() {
  if (drinks.length === 0) {
    return <p>Nothing on the menu today.</p>;
  }

  return (
    <ul>
      {drinks.map((drink) => (
        <MenuItem key={drink.id} drink={drink} />
      ))}
    </ul>
  );
}
```

This matters even more with a filter, because the *source* list can be full while the filtered list is empty. "No drinks under $3" is a different message from "nothing on the menu today".

### Lists inside lists

Nesting works exactly as you'd hope. Each `map` needs its own keys, unique among its own siblings:

```tsx
{categories.map((category) => (
  <section key={category.id}>
    <h2>{category.name}</h2>
    <ul>
      {category.drinks.map((drink) => (
        <MenuItem key={drink.id} drink={drink} />
      ))}
    </ul>
  </section>
))}
```

The inner keys only need to be unique inside their own `<ul>`, not across the whole page.

### Typing a list prop

A component that takes a list takes an array prop. Use `readonly` so you can't accidentally change the parent's data ([chapter 04](../04-props/notes.md)):

```tsx
type MenuProps = {
  drinks: readonly Drink[];
};

function Menu({ drinks }: MenuProps) {
  return (
    <ul>
      {drinks.map((drink) => (
        <MenuItem key={drink.id} drink={drink} />
      ))}
    </ul>
  );
}
```

`map`, `filter`, `toSorted` and friends all work on a `readonly` array, because none of them change it. `push` and `sort` don't, which is exactly what you want.

## Common mistakes

**1. No key**

```
Each child in a list should have a unique "key" prop.
```

Never ignore this. It's telling you the address labels might end up on the wrong envelopes.

**2. Using the index as the key in a list that changes**

```tsx
{tasks.map((task, index) => <TaskRow key={index} task={task} />)}
```

No warning, and it works until someone deletes a row or sorts the list. Then ticks, typing and highlights stay behind on the wrong rows. Use a real id.

**3. `key={Math.random()}`**

Silences the warning and makes everything worse: every item is "new" on every render, so React rebuilds the entire list each time.

**4. Duplicate keys**

```
Encountered two children with the same key, `3`.
```

Two items sharing a key confuses React exactly as much as no key. Usually it means your ids aren't as unique as you thought.

**5. `forEach` instead of `map`**

```tsx
{drinks.forEach((drink) => <MenuItem key={drink.id} drink={drink} />)}
```

Blank list, no error. `forEach` returns `undefined`, and React shows nothing for `undefined`.

**6. Braces without `return`**

```tsx
{drinks.map((drink) => {
  <MenuItem key={drink.id} drink={drink} />;    // no return
})}
```

Blank list again, and again no error. Either add `return`, or swap the `{ }` for `( )`.

**7. The key inside the item component**

The warning stays. Put it on what the `map` returns.

**8. Sorting your props**

```tsx
drinks.sort((a, b) => a.price - b.price);   // ❌ changes the parent's array
```

Copy first: `[...drinks].sort(...)` or `drinks.toSorted(...)`. Typing the prop `readonly Drink[]` makes TypeScript stop you.

## Quick recap

- Turn an array into JSX with `map`. It goes straight inside curly braces.
- The usual shape is a **list component** that maps and an **item component** that renders one thing.
- Every item in a list needs a **`key`**: unique among siblings, stable, and taken from your data — normally an `id`.
- Keys let React tell "the same item moved" from "this item changed". Without them, ticks, typed text and state stay behind on the wrong rows.
- **The index is a position, not an identity.** Only use it for lists that never change order or length.
- `key` goes on what the `map` returns, and React never passes it to your component.
- Chain `filter` and `map` freely, but sort a **copy**, and always handle the empty list.

---

**Next:** try the [exercises](exercises.md), then move on to [07 Events](../07-events/notes.md).
