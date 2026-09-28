# 05 Conditional Rendering

## What is it?

**Conditional rendering** means showing part of your page only when it should be there.

```tsx
{isLate && <p>This book is overdue.</p>}
```

There's no special React feature here. You use `if`, the ternary `? :`, and `&&`, exactly as you learned them in [JavaScript chapter 07](../../JavaScript/07-conditionals/notes.md). What's new is *where* you can put them, and a couple of traps.

## Why does it matter?

Almost nothing on a real page is there all the time:

- An error message appears only when something went wrong.
- A "Loading..." spinner appears only while you're waiting.
- "Log in" or "Log out" depends on who's looking.
- An empty shopping cart shows "Your cart is empty", not an empty box.
- A delete button appears only for things you're allowed to delete.

In [chapter 04](../04-props/notes.md), the last exercise needed a "Vegan" line that only showed for some drinks, and the exercise before that needed a warning that disappeared entirely when there was nothing to warn about. You reached for the ternary and `null` because that was all you had. This chapter gives you the full set, and tells you which one to reach for when.

## Real-world example

Think about a **departure board** at a train station.

| Departure board | Conditional rendering |
|---|---|
| Every train shows a time and a platform | The parts that are always there |
| "DELAYED 10 MIN" appears only for late trains | `{isLate && <p>Delayed</p>}` |
| A train shows either "On time" or "Cancelled" | `{isCancelled ? "Cancelled" : "On time"}` |
| A platform that's blank until it's decided | `{platform ?? "TBC"}` |
| The board is empty, so it says "No departures" | An **empty state** |

The board isn't hiding the delay notice behind a curtain. For an on-time train, that notice **doesn't exist**. That's the important part, and it's how React works too.

## How it works

### The setup for this chapter

Most examples use this component. Put it in `src/ch05/Notice.tsx` and change the props as you read:

```tsx
type NoticeProps = {
  daysLate: number;
};

function Notice({ daysLate }: NoticeProps) {
  return (
    <div>
      <h2>Your loan</h2>
      {/* the interesting bit goes here */}
    </div>
  );
}

export default Notice;
```

### Option 1: `if` above the `return`

A component is a normal function, so you can use a normal `if` before you return anything:

```tsx
function Notice({ daysLate }: NoticeProps) {
  if (daysLate > 0) {
    return <p>This book is {daysLate} days overdue.</p>;
  }

  return <p>Nothing is overdue.</p>;
}
```

This is the plainest option, and it's often the best one. Two completely different-looking results, two plain returns, no cleverness.

When the first branch returns and the rest of the function carries on, it's called an **early return**. It keeps your code flat: no `else`, no extra indentation.

> **Coming later:** from [chapter 08](../08-state/notes.md), your components will call functions like `useState` at the top. Those must run on **every** render, so all your early returns have to come *after* them. There's nothing to do about that yet, but tuck it away.

### Option 2: return `null` for nothing at all

From [chapter 03](../03-components/notes.md): returning `null` means "put nothing on the page".

```tsx
function Notice({ daysLate }: NoticeProps) {
  if (daysLate === 0) {
    return null;
  }

  return <p>This book is {daysLate} days overdue.</p>;
}
```

Look in the **Elements** tab of DevTools: there is no empty `<p>`, no empty `<div>`, nothing. The element genuinely isn't in the page.

`null` is the honest way to say "nothing here". `<></>` would look the same on screen, but `null` says what you mean.

There's a design question hiding in here. Should the component decide for itself that it has nothing to say (return `null`), or should the parent decide not to render it at all?

```tsx
// the component decides
<Notice daysLate={0} />

// the parent decides
{daysLate > 0 && <Notice daysLate={daysLate} />}
```

Both are fine. Let the component decide when the rule is really about that component ("an overdue notice with no overdue days is nothing"). Let the parent decide when it's about the page's layout.

### Option 3: the ternary, inside JSX

You can't use `if` inside curly braces, because braces take an **expression** ([chapter 02](../02-jsx/notes.md)), and `if` is a statement. The ternary is the expression version of `if`:

```tsx
function Notice({ daysLate }: NoticeProps) {
  return (
    <div>
      <h2>Your loan</h2>
      <p>{daysLate > 0 ? "Overdue" : "On time"}</p>
    </div>
  );
}
```

It works with whole chunks of JSX too, not just text:

```tsx
<div>
  <h2>Your loan</h2>
  {daysLate > 0 ? (
    <p style={{ color: "crimson" }}>Overdue by {daysLate} days</p>
  ) : (
    <p style={{ color: "green" }}>On time</p>
  )}
</div>
```

Wrapping each branch in `( )` isn't required, but it keeps multi-line JSX readable. Your code formatter will do it for you.

Use a ternary when you want **one thing or the other thing**, in the middle of some JSX that stays the same.

### Option 4: `&&`, for "show this, or show nothing"

Very often there's no "other thing". You want a line that's either there or absent:

```tsx
<div>
  <h2>Your loan</h2>
  {daysLate > 0 && <p>Overdue by {daysLate} days</p>}
</div>
```

To understand why this works, remember what `&&` really does in JavaScript ([chapter 04](../../JavaScript/04-operators/notes.md)). It is **not** a yes/no question. It looks at the left side:

- If the left side is **falsy**, the whole expression is that falsy value, and the right side never runs.
- If the left side is **truthy**, the whole expression is the **right side**.

So `daysLate > 0 && <p>...</p>` is either `false` (when there's nothing to say) or the `<p>` itself. And from the table in [chapter 02](../02-jsx/notes.md): React shows nothing for `false`. That's the whole trick.

This is the most common pattern in React, and it's the one with the famous trap.

### The `0` trap

Here's a bug you will write one day, so let's write it now:

```tsx
type CartProps = {
  itemCount: number;
};

function Cart({ itemCount }: CartProps) {
  return (
    <div>
      {itemCount && <p>You have {itemCount} items.</p>}
    </div>
  );
}
```

With `itemCount={3}`, you get "You have 3 items." Good.

With `itemCount={0}`, you get a bare **0** sitting on your page.

Why? `0` is falsy, so `&&` gives back the left side, which is `0`. And `0` is one of the few falsy values React **does** show. (`false`, `null` and `undefined` show nothing; `0` shows `0`.) That warning in chapter 02 was pointing straight at this.

The fix is to make the left side a real true-or-false:

```tsx
{itemCount > 0 && <p>You have {itemCount} items.</p>}
```

**Rule of thumb: put a real comparison on the left of `&&`, never a bare number.** `list.length` is the same trap, because an empty array has length `0`:

```tsx
{books.length && <BookList books={books} />}    // ❌ shows "0" when empty
{books.length > 0 && <BookList books={books} />} // ✅
```

Strings are safer, because an empty string renders as nothing. But a comparison still reads better: `{name !== "" && <p>{name}</p>}`.

### Option 5: a variable that holds JSX

When the logic gets long, lift it out of the JSX entirely. JSX is a value, so you can build it up above the `return`:

```tsx
function Notice({ daysLate }: NoticeProps) {
  let message = <p style={{ color: "green" }}>On time</p>;

  if (daysLate > 7) {
    message = <p style={{ color: "crimson" }}>Very overdue. Please return it.</p>;
  } else if (daysLate > 0) {
    message = <p style={{ color: "orange" }}>Overdue by {daysLate} days.</p>;
  }

  return (
    <div>
      <h2>Your loan</h2>
      {message}
    </div>
  );
}
```

Now the JSX at the bottom is easy to read, and the decision is written as a plain `if`/`else if` chain, which is easy to read too. This is the answer whenever you catch yourself nesting ternaries.

(Hover over `message` in VS Code: TypeScript infers `React.JSX.Element` from the first assignment, which is exactly what you want.)

### Option 6: pick with an object

For "one of several fixed choices", a lookup object is often tidiest ([JavaScript chapter 11](../../JavaScript/11-objects/notes.md)):

```tsx
type Status = "on-time" | "late" | "lost";

type BadgeProps = {
  status: Status;
};

const labels: Record<Status, string> = {
  "on-time": "On time",
  late: "Overdue",
  lost: "Reported lost",
};

function Badge({ status }: BadgeProps) {
  return <span>{labels[status]}</span>;
}
```

`Record<Status, string>` is a utility type from [TypeScript chapter 09](../../TypeScript/09-utility-types/notes.md): "an object with one key for every `Status`, each holding a string". The payoff is real: add `"damaged"` to `Status` and forget to add a label, and TypeScript tells you which one is missing. A chain of ternaries would just quietly show nothing.

The values can be JSX, not just text.

### Choosing between them

| Situation | Use |
|---|---|
| Show something, or show nothing | `&&` with a real comparison |
| Show A or B, inside surrounding JSX | ternary `? :` |
| Two completely different pages | `if` with early returns |
| Nothing at all to show | `return null` |
| Three or more cases | `if`/`else if` into a variable |
| One of a fixed set of options | a lookup object |

If you're ever unsure, use `if` above the `return`. Nobody has ever been confused by an `if`.

### Conditional attributes and classes

The same tools work inside attributes:

```tsx
<p style={{ color: daysLate > 0 ? "crimson" : "green" }}>
  {daysLate > 0 ? "Overdue" : "On time"}
</p>

<button disabled={itemCount === 0}>Check out</button>

<li className={task.completed ? "task done" : "task"}>{task.text}</li>
```

Note `disabled={itemCount === 0}`. Attributes take real values, so you don't need `&&` or a ternary. Just give it the boolean.

Careful with `&&` in an attribute, though. It doesn't disappear the way it does in text:

```tsx
<div className={isActive && "active"}>
// ❌ Type 'false | "active"' is not assignable to type 'string | undefined'.
```

There, `false` would end up as the class name. TypeScript catches it. Use a ternary with an empty string: `className={isActive ? "active" : ""}`. ([Chapter 15](../15-styling/notes.md) shows a tidier way for class names.)

### The empty state

When a list is empty, showing an empty box is a bad experience. Say something:

```tsx
type BookListProps = {
  books: readonly string[];
};

function BookList({ books }: BookListProps) {
  if (books.length === 0) {
    return <p>You have no books on loan.</p>;
  }

  return <p>You have {books.length} books on loan.</p>;
}
```

Getting the empty state right is one of the clearest signs of a thoughtful app. Ask yourself for every list: what does this look like on someone's very first day, when they have nothing? ([Chapter 06](../06-rendering-lists/notes.md) actually draws the list.)

### Hiding with CSS is not the same thing

You could hide something with CSS instead:

```tsx
<p style={{ display: daysLate > 0 ? "block" : "none" }}>Overdue</p>
```

The page looks the same, but the paragraph **is still there**, in the HTML. That matters:

- Screen readers may still announce it ([chapter 38](../38-accessibility/notes.md)).
- Anyone can see it in DevTools, so it's no good for anything private.
- With hundreds of rows, you're building elements nobody sees.

Not rendering is the default choice. CSS hiding is for things that must keep their place on screen, or need to animate in and out.

### TypeScript and narrowing

Conditions do double duty in TypeScript: they also **narrow** types ([TypeScript chapter 06](../../TypeScript/06-unions-and-narrowing/notes.md)). This matters most with optional props:

```tsx
type UserCardProps = {
  name: string;
  photoUrl?: string;
};

function UserCard({ name, photoUrl }: UserCardProps) {
  return (
    <div>
      <h2>{name}</h2>
      {photoUrl && <img src={photoUrl} alt={name} />}
    </div>
  );
}
```

`photoUrl` is `string | undefined`. Inside the `&&`, TypeScript knows it's a `string`, so `src={photoUrl}` is accepted. Take the check away and you get:

```tsx
<img src={photoUrl} alt={name} />
// ❌ Type 'string | undefined' is not assignable to type 'string'.
```

The error isn't in your way. It's telling you there's a case you haven't thought about.

This works with early returns too:

```tsx
function UserCard({ name, photoUrl }: UserCardProps) {
  if (photoUrl === undefined) {
    return <h2>{name}</h2>;
  }

  // from here down, TypeScript knows photoUrl is a string
  return (
    <div>
      <h2>{name}</h2>
      <img src={photoUrl} alt={name} />
    </div>
  );
}
```

### Nullish coalescing for defaults

When you want a fallback *value* rather than a different element, `??` is neat ([JavaScript chapter 38](../../JavaScript/38-type-coercion/notes.md)):

```tsx
<p>Platform {platform ?? "TBC"}</p>
```

`??` only steps in for `null` and `undefined`, so a legitimate `0` or `""` is kept. `||` would replace those too, which is usually a bug.

## Common mistakes

**1. A bare number on the left of `&&`**

```tsx
{books.length && <BookList />}   // ❌ shows "0" when the list is empty
{books.length > 0 && <BookList />} // ✅
```

The single most common React bug. If a stray `0` ever appears on your page, look for an `&&`.

**2. Trying to use `if` inside braces**

```tsx
<p>{if (isLate) { "Overdue" }}</p>
// ❌ Expression expected.
```

Braces take expressions. Use a ternary, or move the `if` above the `return`.

**3. Nested ternaries**

```tsx
{daysLate > 7 ? <VeryLate /> : daysLate > 0 ? <Late /> : <OnTime />}
```

This works, and you'll meet it in real code. Two levels is already hard to read, and three is impossible. Move it into a variable with `if`/`else if`.

**4. Hiding with CSS when you meant to not render**

`display: none` still puts the element in the page. Use a condition unless you specifically need the element to stay.

**5. `&&` in a `className`**

```tsx
<div className={isActive && "active"}>
// ❌ Type 'false | "active"' is not assignable to type 'string | undefined'.
```

Use a ternary with an empty string for the false case.

**6. Expecting the condition to re-check by itself**

```tsx
let isLoggedIn = false;

function App() {
  isLoggedIn = true;   // the page does not change
  return <div>{isLoggedIn && <p>Welcome back!</p>}</div>;
}
```

React only re-runs your component when **state** changes. That's [chapter 08](../08-state/notes.md). A condition is checked when the component renders, and not a moment later.

**7. Using `||` where you meant `??`**

```tsx
<p>You have {count || "no"} items.</p>   // count of 0 becomes "no"... by accident
```

Fine here by luck, but `{price || "Free"}` turns a price of `0` into "Free" and a price of `0.0` into "Free" too. `??` only replaces `null` and `undefined`.

**8. Forgetting the empty case entirely**

The app looks perfect with your three test items and looks broken for a brand-new user with none. Always try it with nothing.

## Quick recap

- Conditional rendering is plain JavaScript conditions, used to decide what JSX to return.
- `if` above the `return` (with early returns) is the plainest tool. `return null` means "nothing at all", and leaves nothing in the page.
- Inside JSX, use a **ternary** for "A or B", and `&&` for "this or nothing".
- **Always put a real comparison on the left of `&&`.** `{count && ...}` prints a stray `0`. `{count > 0 && ...}` doesn't.
- For three or more cases, build the JSX into a variable with `if`/`else if`, or look it up in an object. Don't nest ternaries.
- Conditions narrow types, so checking an optional prop is what makes TypeScript let you use it.
- Not rendering is better than hiding with CSS, and every list needs an empty state.

---

**Next:** try the [exercises](exercises.md), then move on to [06 Rendering Lists](../06-rendering-lists/notes.md).
