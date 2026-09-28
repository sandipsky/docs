# 04 Props

## What is it?

**Props** are the information you pass into a component. You write them like HTML attributes:

```tsx
<Greeting name="Maya" />
```

Inside the component, they arrive as the function's argument:

```tsx
function Greeting({ name }: GreetingProps) {
  return <h1>Hello, {name}!</h1>;
}
```

"Props" is short for **properties**. If a component is a function that returns a piece of a page, props are that function's parameters.

## Why does it matter?

[Chapter 03](../03-components/notes.md) left the café menu half-finished. You had a `MenuItem` component, but it could only ever say "Espresso":

```tsx
function MenuItem() {
  return (
    <div className="card">
      <h2>Espresso</h2>
      <p>$2.50</p>
    </div>
  );
}
```

To show three drinks you'd need three nearly identical components, which is exactly the copy-and-paste you were trying to escape.

With props, you write the card **once** and fill in the blanks each time you use it:

```tsx
<MenuItem name="Espresso" price={2.5} />
<MenuItem name="Latte" price={3.5} />
<MenuItem name="Flat White" price={3.5} />
```

Three lines instead of eighteen. Change the card's design once, and all three change. Add a fourth drink, and it's one more line.

That's the whole point of components, and props are what unlock it. Without props, components just give names to fixed lumps of HTML. With props, they become reusable tools.

There's a second benefit, and it's a TypeScript one. Because you *describe* what a `MenuItem` needs, TypeScript can check every use of it:

```tsx
<MenuItem name="Latte" />
// ❌ Property 'price' is missing in type '{ name: string; }' but required in type 'MenuItemProps'.
```

You can't forget a piece of information, misspell one, or pass a number where text belongs. That check happens as you type, in every file that uses the component.

## Real-world example

Props are a **coffee order**.

| Ordering a coffee | Props |
|---|---|
| The barista, who can make any drink | The component |
| "A large oat latte, extra hot" | `<Coffee size="large" milk="oat" extraHot />` |
| The order slip they write it on | The props object |
| The barista makes what the slip says | The component shows what the props say |
| The barista can't change your order for you | Props are **read-only** |
| Same barista all day, different drinks | Same component, different props |

One more detail that matters later: orders only travel **one way**, from you to the barista. If the barista needs to tell you something ("we're out of oat milk"), that's a different conversation. Props work the same way, and you'll see that in the "Data flows down" section.

## How it works

### Passing props and receiving them

Passing them looks exactly like HTML attributes:

```tsx
<Greeting name="Maya" />
```

React collects every attribute you wrote into **one object** and hands it to your function as its first argument:

```tsx
function Greeting(props) {
  return <h1>Hello, {props.name}!</h1>;
}
```

So `<Greeting name="Maya" age={30} />` sends `{ name: "Maya", age: 30 }`. One object, always, no matter how many props there are. If you pass none, you get an empty object `{}`, never `undefined`.

That code has one problem, though. In TypeScript, an unannotated parameter is an error:

```tsx
function Greeting(props) {
// ❌ Parameter 'props' implicitly has an 'any' type.
```

You met this in [TypeScript chapter 05](../../TypeScript/05-functions/notes.md): TypeScript can't guess a parameter's type, and strict mode won't let it silently become `any`. So props always come with a type.

### Typing props

Describe the object with a **type alias** ([TypeScript chapter 04](../../TypeScript/04-type-aliases-and-interfaces/notes.md)), right above the component:

```tsx
type GreetingProps = {
  name: string;
};

function Greeting(props: GreetingProps) {
  return <h1>Hello, {props.name}!</h1>;
}

export default Greeting;
```

The name `GreetingProps` is a convention: the component's name plus `Props`. Nothing enforces it, but everyone does it, so do it too. Keep the type in the same file as the component, and `export` it as well if a parent needs it.

Now TypeScript checks every use of `<Greeting />` for you:

```tsx
<Greeting name="Maya" />       // ✅

<Greeting />
// ❌ Property 'name' is missing in type '{}' but required in type 'GreetingProps'.

<Greeting name={42} />
// ❌ Type 'number' is not assignable to type 'string'.

<Greeting nmae="Maya" />
// ❌ Property 'nmae' does not exist on type 'IntrinsicAttributes & GreetingProps'. Did you mean 'name'?
```

(`IntrinsicAttributes` is React's own small list of built-in props, like `key`, which you'll meet in [chapter 06](../06-rendering-lists/notes.md). It's joined to your type with `&`, from [TypeScript chapter 04](../../TypeScript/04-type-aliases-and-interfaces/notes.md). You can read straight past it.)

Best of all: type `<Greeting ` and press **Ctrl + Space** in VS Code. TypeScript lists the props this component takes, and what type each one is. You never have to open the component file to remember what it needs.

`interface GreetingProps { name: string }` works just as well. The differences are in [TypeScript chapter 04](../../TypeScript/04-type-aliases-and-interfaces/notes.md); this course uses `type` throughout.

### Destructuring props

Writing `props.` over and over gets noisy. Since props are just an object, you can destructure them ([JavaScript chapter 15](../../JavaScript/15-destructuring-spread-rest/notes.md)) right in the parameter list:

```tsx
function Greeting({ name }: GreetingProps) {
  return <h1>Hello, {name}!</h1>;
}
```

Same thing, less typing, and the first line tells you exactly what this component uses. This is what most React code looks like, and it's what the rest of this course does.

With several props:

```tsx
type MenuItemProps = {
  name: string;
  price: number;
};

function MenuItem({ name, price }: MenuItemProps) {
  return (
    <div className="card">
      <h2>{name}</h2>
      <p>${price.toFixed(2)}</p>
    </div>
  );
}
```

Hover over `price` inside the function: TypeScript says `number`, so `toFixed` is offered in autocomplete.

Keep `props.something` when there are a lot of props, or when you want the extra clarity of seeing where a value came from. Both styles are fine, and you'll meet both in real code.

### Quotes for text, braces for everything else

This is the rule from [chapter 02](../02-jsx/notes.md), and it matters even more now:

```tsx
<MenuItem
  name="Latte"                    // string: quotes
  price={3.5}                     // number: braces
  vegan={true}                    // boolean: braces
  tags={["hot", "milky"]}         // array: braces
  shop={{ city: "Leeds" }}        // object: braces (double, like style)
/>
```

**Only strings get quotes. Everything else goes in braces.** Get it wrong and TypeScript tells you straight away:

```tsx
<MenuItem name="Latte" price="3.5" />
// ❌ Type 'string' is not assignable to type 'number'.
```

You can put a string in braces too, and you'll need to when it comes from a variable: `name={drinkName}`.

### Booleans have a shortcut

For a prop typed `boolean`, writing just the name means `true`:

```tsx
<MenuItem name="Latte" price={3.5} vegan />
// exactly the same as vegan={true}
```

Leaving it out does **not** mean `false`, though. If `vegan: boolean` is required, leaving it out is a missing-prop error. To make "left out" mean "no", make the prop optional with a default, which is next.

### Optional props and default values

Put a `?` after the name to make a prop optional ([TypeScript chapter 05](../../TypeScript/05-functions/notes.md)):

```tsx
type BadgeProps = {
  label: string;
  colour?: string;
};
```

Now `<Badge label="New" />` is fine. But inside the component, `colour` has the type `string | undefined`, so you have to handle the missing case ([TypeScript chapter 06](../../TypeScript/06-unions-and-narrowing/notes.md)).

The tidy way is a **default value** in the destructuring:

```tsx
function Badge({ label, colour = "steelblue" }: BadgeProps) {
  return <span style={{ color: colour }}>{label}</span>;
}
```

Two nice things happen:

- `<Badge label="New" />` gets `"steelblue"`, and `<Badge label="Sale" colour="tomato" />` gets `"tomato"`.
- Hover over `colour` inside the function: TypeScript now says plain `string`, not `string | undefined`. The default removed the `undefined` case, so there's nothing left to check.

One catch: **a default only fills in `undefined`.** Pass `colour={null}` or `colour=""` and you get `null` or an empty string, not `"steelblue"`. (And `colour={null}` is a type error anyway, unless you asked for it.)

Make a prop optional when there's a sensible default, or when the information genuinely might not exist (a user with no photo). Otherwise keep it required and let TypeScript make sure it's there.

### The `children` prop

There's one prop you don't write as an attribute. Whatever you put **between** a component's tags arrives as a prop called `children`:

```tsx
<Card>
  <h2>Espresso</h2>
  <p>$2.50</p>
</Card>
```

```tsx
import type { ReactNode } from "react";

type CardProps = {
  children?: ReactNode;
};

function Card({ children }: CardProps) {
  return <div className="card">{children}</div>;
}
```

The type is `ReactNode`, the "anything React can show" type from [chapter 02](../02-jsx/notes.md): text, numbers, JSX, arrays of those, `null`, `undefined`. It comes from React, and `import type` brings in a type without importing any actual code ([TypeScript chapter 11](../../TypeScript/11-tsconfig-and-modules/notes.md)).

The `?` makes an empty `<Card />` allowed. Drop it if a card with nothing inside makes no sense.

This is a big idea, and it's called **composition**. `Card` owns the frame: the border, the padding, the shadow. It has no idea what's inside, and doesn't need to. The parent decides that:

```tsx
<Card>
  <h2>Espresso</h2>
  <p>$2.50</p>
</Card>

<Card>
  <img src="/favicon.svg" alt="Logo" />
</Card>
```

One `Card` component, any content. You'll use this shape constantly for layouts, panels, and dialogs.

### Data flows down

Props travel in one direction: from parent to child. Here's a two-level example:

```tsx
function PriceTag({ price }: { price: number }) {
  return <p>${price.toFixed(2)}</p>;
}

function MenuItem({ name, price }: MenuItemProps) {
  return (
    <div className="card">
      <h2>{name}</h2>
      <PriceTag price={price} />
    </div>
  );
}

function Menu() {
  return <MenuItem name="Latte" price={3.5} />;
}
```

`Menu` gives the price to `MenuItem`, which passes it on to `PriceTag`:

```
Menu
└── MenuItem      name, price
    └── PriceTag  price
```

React calls this **one-way data flow**. It makes bugs much easier to find: when a wrong price shows up, you only ever look *upwards* to see where it came from. Nothing else on the page could have changed it.

(That `{ price: number }` written straight in the parameter list is fine for a tiny one-prop component. For anything bigger, a named type is easier to read.)

A child can never reach up and change its parent's data. When a child needs to tell its parent something ("the user clicked me"), the parent passes down a **function** as a prop, and the child calls it. That's [chapter 07](../07-events/notes.md), and [chapter 13](../13-lifting-state-up/notes.md) makes it a proper pattern.

### Props are read-only

Your component must not change what it was given. This is the rule that keeps one-way data flow honest.

Reassigning the parameter is pointless but harmless, since it only affects your local copy:

```tsx
function Greeting({ name }: GreetingProps) {
  name = name.toUpperCase();   // confusing; make a new variable instead
```

Changing an object or array you were given is the real problem, because that object belongs to the parent ([JavaScript chapter 16](../../JavaScript/16-values-vs-references/notes.md)):

```tsx
function Cart({ items }: CartProps) {
  items.push("Pen");           // ❌ you just changed the parent's array
```

React doesn't watch for this, so nothing on the page updates, but the parent's data is now different. These bugs are horrible to track down. Always make a **new** value instead:

```tsx
const withPen = [...items, "Pen"];
```

TypeScript can enforce this for you with `readonly` ([TypeScript chapter 03](../../TypeScript/03-arrays-tuples-objects/notes.md)):

```tsx
type CartProps = {
  items: readonly string[];
};

// items.push("Pen");
// ❌ Property 'push' does not exist on type 'readonly string[]'.
```

A `readonly string[]` still accepts a normal `string[]` from the parent. It just stops *you* from changing it. It's a cheap, honest way to say "I only read this". [Chapter 11](../11-updating-objects-and-arrays/notes.md) turns copying-instead-of-changing into a habit.

### Many small props, or one object?

Both of these work:

```tsx
<MenuItem name="Latte" price={3.5} vegan />

<MenuItem drink={latte} />
```

Use **separate props** when there are only a few values, or when they come from different places. It reads well and each one is checked on its own.

Use **one object prop** when the thing is a real item in your data, like a product, a user, or a repair job. Then you already have a type for it, and you just reuse it:

```tsx
type Drink = {
  name: string;
  price: number;
  vegan: boolean;
};

type MenuItemProps = {
  drink: Drink;
};

function MenuItem({ drink }: MenuItemProps) {
  return (
    <div className="card">
      <h2>{drink.name}</h2>
      <p>${drink.price.toFixed(2)}</p>
    </div>
  );
}
```

The object style becomes the obvious choice in [chapter 06](../06-rendering-lists/notes.md), when you turn an array of drinks into a list of cards.

### Spreading props

If you already have an object whose properties match the props, you can spread it ([JavaScript chapter 15](../../JavaScript/15-destructuring-spread-rest/notes.md)):

```tsx
const latte = { name: "Latte", price: 3.5 };

<MenuItem {...latte} />
// the same as: <MenuItem name={latte.name} price={latte.price} />
```

TypeScript still checks it properly: a missing or wrong property is still an error.

It's tempting, but use it sparingly. Reading `<MenuItem {...latte} />` tells you nothing about what `MenuItem` is actually receiving, and if `latte` picks up an extra property later you may not notice. It earns its place in one situation, which [chapter 25](../25-typescript-patterns/notes.md) covers: wrapper components that pass a pile of standard HTML props straight through.

### Props can hold anything, including JSX

A prop's type can be anything TypeScript can describe. Arrays, objects, functions (chapter 07), and even JSX:

```tsx
type PanelProps = {
  title: ReactNode;      // text, or a whole piece of JSX
  children?: ReactNode;
};

<Panel title={<em>Today only</em>}>
  <p>Half price pastries.</p>
</Panel>
```

`children` is just the one that gets special treatment from JSX. Everything else is an ordinary prop.

### Seeing props in DevTools

Open the **Components** tab (`F12`), and click any component in the tree. The panel on the right lists its props and their current values. When something on screen is wrong, this tells you immediately whether the component got bad data or displayed good data badly.

## Common mistakes

**1. A number in quotes**

```tsx
<MenuItem name="Latte" price="3.5" />
// ❌ Type 'string' is not assignable to type 'number'.
```

Quotes always make a string. Braces: `price={3.5}`.

**2. Using a prop name you didn't destructure**

```tsx
function Greeting(props: GreetingProps) {
  return <h1>Hello, {name}!</h1>;
}
// ❌ Cannot find name 'name'.
```

Either write `props.name`, or destructure: `function Greeting({ name }: GreetingProps)`.

**3. Forgetting a required prop**

```tsx
<MenuItem name="Latte" />
// ❌ Property 'price' is missing in type '{ name: string; }' but required in type 'MenuItemProps'.
```

Pass it, or mark it optional with `?` and give it a default.

**4. The name in the type and the name you pass don't match**

```tsx
type MenuItemProps = { name: string; price: number };

<MenuItem title="Latte" price={3.5} />
// ❌ Property 'title' does not exist on type 'IntrinsicAttributes & MenuItemProps'.
// ❌ Property 'name' is missing in type ...
```

One typo gives you two errors: an unexpected prop and a missing one. That pair is a reliable sign of a misspelt prop name.

**5. Changing an object or array prop**

```tsx
items.push("Pen");     // ❌ that array belongs to the parent
```

Make a new one: `[...items, "Pen"]`. Type the prop as `readonly string[]` so TypeScript stops you.

**6. Expecting props to update on their own**

```tsx
let price = 3.5;

function App() {
  price = 4;                          // nothing happens on screen
  return <MenuItem name="Latte" price={price} />;
}
```

Changing a plain variable doesn't tell React anything, so the page keeps showing the old value. Data that changes over time has to live in **state** ([chapter 08](../08-state/notes.md)). Props are how state gets handed down.

**7. Reaching for `any` when the type gets awkward**

```tsx
function MenuItem(props: any) {   // ❌ every check you just built, switched off
```

`any` makes the red squiggle go away and takes your autocomplete, your typo checking and your safety with it ([TypeScript chapter 02](../../TypeScript/02-basic-types/notes.md)). If you're stuck on a type, write the shape out longhand, or ask. Don't reach for `any`.

**8. Forgetting that `children` is spelled exactly that way**

```tsx
type CardProps = { content?: ReactNode };

<Card>
  <p>Hi</p>
</Card>
// ❌ Property 'children' does not exist on type 'IntrinsicAttributes & CardProps'.
```

React always calls it `children`. `content`, `body` and `inner` are ordinary props that must be passed as attributes.

## Quick recap

- Props pass information into a component, like arguments to a function: `<Greeting name="Maya" />`. React gathers them into one object.
- Describe them with a type alias called `<Component>Props`, then destructure in the parameter list: `function Greeting({ name }: GreetingProps)`.
- TypeScript then checks every use: missing props, wrong types, and misspelt names are all errors, and VS Code autocompletes the props for you.
- **Strings get quotes. Everything else gets braces.** A `boolean` prop on its own means `true`.
- `?` makes a prop optional, and a default in the destructuring (`colour = "steelblue"`) fills in the gap and removes `undefined` from its type.
- Whatever sits between a component's tags arrives as the `children` prop, typed `ReactNode`. That's how you build reusable frames like `Card`.
- Data flows **down** only, and props are **read-only**: never change an object or array you were given, and use `readonly` to prove it.

---

**Next:** try the [exercises](exercises.md), then move on to [05 Conditional Rendering](../05-conditional-rendering/notes.md).
