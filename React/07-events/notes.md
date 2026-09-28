# 07 Events

## What is it?

An **event** is something that happens on the page: a click, a key press, a form being sent. You react to one by handing React a function:

```tsx
function Ex() {
  function handleClick() {
    console.log("Clicked!");
  }

  return <button onClick={handleClick}>Click me</button>;
}
```

Same idea as `addEventListener` from [JavaScript chapter 21](../../JavaScript/21-events/notes.md), written as an attribute.

## Why does it matter?

Everything you've built so far just sits there. Events are where your app starts listening.

Compare the two ways. In plain JavaScript you had to find the element first, then attach a listener to it:

```js
const button = document.querySelector("#save");
button.addEventListener("click", handleClick);
```

Two steps, and they're in different places: the `id` in the HTML, the `querySelector` in the JS. Rename the id and nothing tells you the listener has stopped working.

In React, the handler sits on the element it belongs to:

```tsx
<button onClick={handleClick}>Save</button>
```

One place, nothing to look up, nothing to keep in sync. And when React removes the button from the page, the handler goes with it. There's no cleaning up.

There's a bigger reason too. Events are how a child component talks **back** to its parent. [Chapter 04](../04-props/notes.md) said props only flow down and a child can never change its parent's data. Passing a **function** down as a prop is how the child says "the user did something", and lets the parent decide what that means. That pattern runs through the whole rest of this course.

## Real-world example

A **doorbell**.

| Doorbell | React event |
|---|---|
| The button by the door | `<button>` |
| Wiring it to a bell | `onClick={handleClick}` |
| Someone presses it | The event happens |
| The bell rings | Your function runs |
| A note saying who called and when | The **event object** |
| Wiring it to a bell that's *already ringing* | `onClick={handleClick()}` — the classic bug |

That last row is the mistake everyone makes once. You want to give React the bell to ring later, not ring it yourself while you're installing it.

## How it works

### Attach a handler

Event attributes are camelCase, and the value goes in braces:

```tsx
function Toolbar() {
  function handleSave() {
    console.log("Saving...");
  }

  return <button onClick={handleSave}>Save</button>;
}
```

Three things to get right:

- **`onClick`, not `onclick`.** TypeScript catches this: `Property 'onclick' does not exist on type '...'. Did you mean 'onClick'?`
- **Braces, not quotes.** `onClick="handleSave"` gives React the *text* "handleSave".
- **`handleSave`, not `handleSave()`.** This is the big one, and it gets its own section.

Define handlers inside the component, above the `return`. They need to see the component's props and (soon) its state.

### Pass the function, don't call it

```tsx
<button onClick={handleSave}>Save</button>     // ✅ here's a function, ring it later
<button onClick={handleSave()}>Save</button>   // ❌ calls it right now
```

The second one runs `handleSave` while React is *building* the page, and gives React whatever it returned — usually `undefined`. So the message appears immediately, on every render, and clicking does nothing.

It's worth being able to spot the shape rather than remembering the rule: **`()` means "do it now"**. In an `onClick`, you almost never want "now".

This bug can also be spectacular. From [chapter 08](../08-state/notes.md), a handler that sets state, called during render, sets state during render, which re-renders, which calls it again:

```
Too many re-renders. React limits the number of renders to prevent an infinite loop.
```

If you ever see that, look for a stray `()` in an event attribute.

### Passing arguments to a handler

So what if your handler needs an argument?

```tsx
<button onClick={deleteTask(task.id)}>Delete</button>   // ❌ deletes it immediately
```

Wrap it in a new function. That function is the one React holds on to, and *it* does the calling:

```tsx
<button onClick={() => deleteTask(task.id)}>Delete</button>   // ✅
```

Read it as: "when clicked, run `deleteTask(task.id)`". The arrow is the "when clicked" part.

This is the standard way to pass arguments, and you'll write it constantly, especially inside a `map`:

```tsx
{tasks.map((task) => (
  <li key={task.id}>
    {task.text}
    <button onClick={() => deleteTask(task.id)}>Delete</button>
  </li>
))}
```

Each button gets its own little function that remembers its own `task.id`. That works because of closures ([JavaScript chapter 25](../../JavaScript/25-closures/notes.md)).

### Inline or named?

```tsx
<button onClick={() => console.log("Hi")}>Hi</button>    // inline

function handleHi() {                                     // named
  console.log("Hi");
}
<button onClick={handleHi}>Hi</button>
```

Both are normal React. Use **inline** for one-liners and for passing arguments. Use a **named function** as soon as there's more than a line or two, because the JSX stays readable and the function gets a name that explains it.

Don't worry that a new arrow function is created on every render. It is, and it doesn't matter. [Chapter 27](../27-performance/notes.md) covers the rare cases where it does.

### Naming: `handleX` and `onX`

A convention worth following from day one:

- **`handleSomething`** for the function that does the work: `handleClick`, `handleSubmit`, `handleDeleteTask`.
- **`onSomething`** for a prop that carries a function: `onClick`, `onDelete`, `onTaskAdded`.

So the two meet like this:

```tsx
<TaskRow task={task} onDelete={handleDeleteTask} />
```

The parent *handles* it; the prop describes *when*. Every React codebase you ever open will use these names.

### The event object

Your handler gets one argument: an object describing what happened.

```tsx
function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
  console.log(event.type);          // "click"
  console.log(event.currentTarget); // the button
}
```

Most of the time you don't need it. When you do, it's usually for one of these:

| Property or method | What it's for |
|---|---|
| `event.currentTarget` | the element the handler is on |
| `event.target` | the element actually clicked, which may be inside it |
| `event.preventDefault()` | stop the browser's default behaviour |
| `event.stopPropagation()` | stop the event travelling up to parent elements |
| `event.key` | which key was pressed, on keyboard events |

`event.currentTarget` is almost always the one you want, and it's the one TypeScript types precisely. `event.target` could be any element, so TypeScript types it loosely and you'll have to prove what it is.

### Typing the event

Here's a wrinkle that catches every TypeScript beginner. Inline, TypeScript works the type out for you:

```tsx
<button onClick={(event) => console.log(event.currentTarget)}>Go</button>
```

Hover over `event`: `React.MouseEvent<HTMLButtonElement>`. TypeScript knows the handler is going on a `<button>`, so it knows what the event must be. This is **contextual typing** ([TypeScript chapter 05](../../TypeScript/05-functions/notes.md)).

Write the handler separately and that context is gone:

```tsx
function handleClick(event) {
// ❌ Parameter 'event' implicitly has an 'any' type.
```

So you annotate it yourself:

```tsx
function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
  console.log(event.currentTarget.textContent);
}
```

The ones you'll actually use:

| Event | Type |
|---|---|
| Click, on a button | `React.MouseEvent<HTMLButtonElement>` |
| Typing in a text box | `React.ChangeEvent<HTMLInputElement>` |
| A `<textarea>` | `React.ChangeEvent<HTMLTextAreaElement>` |
| A `<select>` | `React.ChangeEvent<HTMLSelectElement>` |
| Sending a form | `React.FormEvent<HTMLFormElement>` |
| A key press | `React.KeyboardEvent<HTMLInputElement>` |

The bit in angle brackets is the element the handler is attached to ([TypeScript chapter 08](../../TypeScript/08-generics/notes.md) explains that syntax). Getting it right is what makes `event.currentTarget.value` work without complaint.

Two shortcuts:

- If you don't need the event at all, leave the parameter off: `function handleClick() { ... }`. React passes it anyway; you're just ignoring it. This is by far the most common case.
- To get the type without looking it up: write it inline first, hover over `event`, and copy what VS Code tells you.

You can also `import type { MouseEvent } from "react"` and drop the `React.` prefix. Both are common. This course keeps `React.` so it's obvious the type comes from React and not from the browser's own `MouseEvent`, which is a different (but related) thing.

### `preventDefault`

Some elements do something by default. A `<form>` reloads the page when you submit it. A link navigates. `preventDefault()` stops that ([JavaScript chapter 22](../../JavaScript/22-forms/notes.md)):

```tsx
function ContactForm() {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    console.log("Sending...");
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" />
      <button type="submit">Send</button>
    </form>
  );
}
```

Leave `preventDefault` out and the page reloads, wiping everything your app was holding. The symptom is unmistakable: you click, the screen flashes, and everything resets.

Put the handler on the **`<form>`**, not the button. Then Enter in a text box works too, which people expect.

React doesn't have HTML's old `return false` trick. Call `preventDefault()`.

### Which events can you use?

Anything the browser offers, in camelCase:

| Attribute | When it fires |
|---|---|
| `onClick` | a click |
| `onDoubleClick` | a double click |
| `onChange` | the value of an input changed (see the warning below) |
| `onSubmit` | a form is sent |
| `onKeyDown` | a key goes down |
| `onFocus` / `onBlur` | an element gains or loses focus |
| `onMouseEnter` / `onMouseLeave` | the pointer arrives or leaves |

**One important difference from plain HTML.** In the browser, `change` on a text box only fires when you click away. React's `onChange` fires on **every keystroke**, like the browser's `input` event. That's almost always what you want, and it's what [chapter 09](../09-forms/notes.md) is built on. But it does mean your instincts from plain JavaScript are slightly off here.

VS Code will list every available event if you type `on` inside a tag and press Ctrl + Space.

### Events travel upwards

Just like in plain JavaScript, an event **bubbles**: it fires on the element you clicked, then its parent, then its parent's parent.

```tsx
<div onClick={() => console.log("card")}>
  <button onClick={() => console.log("button")}>Delete</button>
</div>
```

Click the button and you get **both** messages, button first.

Usually that's handy. When it isn't — a delete button inside a card that also opens the card — stop it:

```tsx
<button
  onClick={(event) => {
    event.stopPropagation();
    deleteTask(task.id);
  }}
>
  Delete
</button>
```

Use `stopPropagation` when you have a real conflict, not by default. Sprinkling it everywhere makes events mysteriously stop working elsewhere.

You don't need **event delegation** any more, by the way. In [JavaScript chapter 21](../../JavaScript/21-events/notes.md) you put one listener on the `<ul>` because elements created later had no listeners of their own. In React, the handler is part of the JSX, so every row gets one automatically, however many rows appear later. That whole class of bug is gone.

### Passing handlers down as props

Here's the pattern that matters most. A child component takes a function as a prop and calls it:

```tsx
type TaskRowProps = {
  task: Task;
  onDelete: (id: number) => void;
};

function TaskRow({ task, onDelete }: TaskRowProps) {
  return (
    <li>
      {task.text}
      <button onClick={() => onDelete(task.id)}>Delete</button>
    </li>
  );
}
```

```tsx
function TaskList({ tasks }: TaskListProps) {
  function handleDelete(id: number) {
    console.log("Parent should delete task", id);
  }

  return (
    <ul>
      {tasks.map((task) => (
        <TaskRow key={task.id} task={task} onDelete={handleDelete} />
      ))}
    </ul>
  );
}
```

Read the type out loud: `onDelete: (id: number) => void` is "a function that takes a number and returns nothing" ([TypeScript chapter 05](../../TypeScript/05-functions/notes.md)). `void` means the parent doesn't promise to give anything back.

The split is the point:

- `TaskRow` knows **when** something happened. It has the button.
- `TaskList` knows **what to do** about it. It has the data.

`TaskRow` can be dropped into any list, and the type tells you exactly what it expects. This is how information travels *up* in React: not by the child reaching into the parent, but by the parent handing down a function and the child calling it.

### Your own components don't have real events

This surprises people:

```tsx
<TaskRow onClick={handleClick} />
```

That does **nothing** unless `TaskRow` takes an `onClick` prop and puts it on something. `onClick` is only magic on real HTML tags. On your own component it's an ordinary prop with an ordinary name, and TypeScript will tell you it doesn't exist if you haven't declared it.

### And now, the cliffhanger

Try this:

```tsx
function Counter() {
  let count = 0;

  function handleClick() {
    count = count + 1;
    console.log(count);
  }

  return <button onClick={handleClick}>Clicked {count} times</button>;
}
```

Click it. The Console counts up: 1, 2, 3. The button still says **0**.

Two things are wrong, and they're the same thing twice:

1. Changing a plain variable doesn't tell React anything, so the component never re-renders.
2. Even if it did, `let count = 0` runs again on every render, resetting it.

A component needs a memory that survives re-renders, and changing it has to tell React to redraw. That's `useState`, and it's the next chapter. Events and state are the two halves of making a page interactive; you've now got the first half.

## Common mistakes

**1. Calling the handler instead of passing it**

```tsx
<button onClick={handleSave()}>Save</button>
```

Runs during render, does nothing on click. Drop the `()`, or wrap it: `onClick={() => handleSave()}`.

**2. Lowercase event names**

```tsx
<button onclick={handleSave}>Save</button>
// ❌ Property 'onclick' does not exist on type '...'. Did you mean 'onClick'?
```

**3. Quotes instead of braces**

```tsx
<button onClick="handleSave">Save</button>
// ❌ Type 'string' is not assignable to type 'MouseEventHandler<HTMLButtonElement>'.
```

**4. Forgetting `preventDefault` on a form**

The page reloads and everything resets. Put `onSubmit` on the `<form>` and call `event.preventDefault()` first thing.

**5. An untyped event parameter**

```tsx
function handleChange(event) {
// ❌ Parameter 'event' implicitly has an 'any' type.
```

Annotate it, or if you don't need it, remove the parameter entirely.

**6. The wrong element in the event type**

```tsx
function handleChange(event: React.ChangeEvent<HTMLElement>) {
  console.log(event.currentTarget.value);
  // ❌ Property 'value' does not exist on type 'HTMLElement'.
}
```

Not every element has a `value`. Say which one it is: `HTMLInputElement`.

**7. Expecting the page to change**

```tsx
function handleClick() {
  count = count + 1;   // the page doesn't move
}
```

Only state changes cause a re-render. Chapter 08.

**8. `onClick` on your own component**

```tsx
<MenuItem onClick={handleClick} />
// ❌ Property 'onClick' does not exist on type 'IntrinsicAttributes & MenuItemProps'.
```

Add it to the props type, and put it on a real element inside.

## Quick recap

- Handle events with camelCase attributes and a function in braces: `onClick={handleClick}`.
- **Pass the function, don't call it.** `onClick={handleClick()}` runs during render. To pass arguments, wrap it: `onClick={() => deleteTask(task.id)}`.
- Name the worker `handleX` and the prop `onX`.
- The event object is the handler's one argument. Inline handlers get their type for free; separate ones need an annotation like `React.ChangeEvent<HTMLInputElement>`. If you don't need it, leave the parameter off.
- Put `onSubmit` on the `<form>` and call `event.preventDefault()`, or the page reloads.
- React's `onChange` fires on every keystroke, unlike the browser's `change`.
- Events bubble; `stopPropagation()` when there's a real conflict. You never need event delegation in React.
- A **function passed down as a prop** is how a child tells its parent something happened. That's how data gets back up.
- Changing a plain variable in a handler does nothing to the page. That's what state is for.

---

**Next:** try the [exercises](exercises.md), then move on to [08 State](../08-state/notes.md).
