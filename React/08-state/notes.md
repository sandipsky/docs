# 08 State

## What is it?

**State** is a component's memory: a value it keeps between renders, and that tells React to redraw the page when it changes.

```tsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  );
}
```

That's the whole of React's interactivity, in six lines. This is the most important chapter in Level 1.

## Why does it matter?

[Chapter 07](../07-events/notes.md) ended with a broken counter:

```tsx
function Counter() {
  let count = 0;

  function handleClick() {
    count = count + 1;
    console.log(count);   // 1, 2, 3...
  }

  return <button onClick={handleClick}>Clicked {count} times</button>;
}
```

The Console counts up. The button says **0** forever. Two separate problems:

1. **The variable doesn't survive.** Every time React renders `Counter`, it runs the whole function again, and `let count = 0` starts over. Local variables die when the function ends.
2. **Nothing tells React to redraw.** Changing a variable is invisible to React. It has no idea anything happened.

You need something that survives re-renders **and** tells React when it changes. Neither a `let` inside the component nor a variable outside it can do both. `useState` does both.

This is also the thing that makes React worth using at all. Back in [JavaScript chapter 24](../../JavaScript/24-project-todo-app/notes.md), you had to remember to call `render()` after every change to your `tasks` array. Miss one call, and the page silently showed stale data. With state, redrawing isn't something you remember to do. It's automatic.

## Real-world example

Think about a **café's chalkboard** showing how many cakes are left.

| The café | React |
|---|---|
| The number written on the board | The state value, `count` |
| Selling a cake | An event |
| The one person allowed to change the board | The setter, `setCount` |
| Everyone reads the board to know the number | Your JSX reads `count` |
| The board is rewritten, so everyone sees the new number | React re-renders |
| Muttering "that's 4 now" to yourself | Changing a local variable: nobody else finds out |

The rule that makes it work: **you never scribble on the board yourself.** You tell the one person whose job it is. In React, that's the setter, and going around it is the single most common source of "why isn't my page updating?".

## How it works

### `useState`

```tsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  // ...
}
```

Line by line:

- **`useState(0)`** says "I need a piece of memory, starting at `0`".
- It gives back an **array of two things**: the current value, and a function that changes it.
- **`const [count, setCount] = ...`** is array destructuring ([JavaScript chapter 15](../../JavaScript/15-destructuring-spread-rest/notes.md)). You pick both names.
- The convention is `thing` and `setThing`. Follow it; every React codebase does.
- **Import it from `react`.** Forget, and you get `Cannot find name 'useState'.`

Why an array and not an object? Purely so you can name them whatever you like: `useState` doesn't know if you're storing a count, a name, or a list of tasks.

### What actually happens on a click

This sequence is worth learning properly, because almost every React question comes back to it:

```tsx
function Counter() {
  const [count, setCount] = useState(0);
  console.log("rendering with", count);

  return <button onClick={() => setCount(count + 1)}>Clicked {count} times</button>;
}
```

1. **First render.** React runs `Counter`. `useState(0)` sets the value to `0` and returns it. The button reads "Clicked 0 times". The Console says `rendering with 0`.
2. **You click.** The handler runs `setCount(1)`.
3. **React makes a note.** "This component's state should be 1 now. I'll re-render it."
4. **React runs `Counter` again.** This time `useState(0)` returns **1**, not 0. The `0` was only ever the *starting* value; React ignores it from then on.
5. The button now reads "Clicked 1 times". The Console says `rendering with 1`.

Two things to take from that:

- **`count` is a `const` that changes between renders, not during one.** Inside a single render it never changes, which is why `const` is correct.
- **React calls your function again.** Your component runs from the top every time. That's why a `let` inside it resets, and why state has to live somewhere else — inside React.

Add that `console.log` to something you're building and watch it. It makes the whole model click.

### Typing state

Most of the time, TypeScript works it out from the starting value:

```tsx
const [count, setCount] = useState(0);        // number
const [name, setName] = useState("");         // string
const [isOpen, setIsOpen] = useState(false);  // boolean
```

Hover over `setCount`: `(value: number | ((prev: number) => number)) => void`. It only accepts numbers. `setCount("hello")` is an error, in this file and everywhere else.

Sometimes inference isn't enough, and there are two big cases.

**An empty array.** TypeScript sees `[]` and, with nothing to go on, infers `never[]` — "an array that can never contain anything":

```tsx
const [tasks, setTasks] = useState([]);
setTasks([{ id: "1", text: "Buy milk", done: false }]);
// ❌ Type '{ id: string; ... }' is not assignable to type 'never'.
```

Say what you mean, using the angle-bracket syntax from [TypeScript chapter 08](../../TypeScript/08-generics/notes.md):

```tsx
const [tasks, setTasks] = useState<Task[]>([]);
```

**Something that starts empty and fills in later.** A value that's `null` now and an object later:

```tsx
const [user, setUser] = useState<User | null>(null);
```

Without the annotation, TypeScript infers plain `null`, and you could never put a user in it. With it, you get a union ([TypeScript chapter 06](../../TypeScript/06-unions-and-narrowing/notes.md)), and TypeScript makes you check before you use it:

```tsx
if (user === null) {
  return <p>Not signed in.</p>;
}
return <p>Hello, {user.name}</p>;
```

That check isn't an annoyance. It's the "not signed in" case, which your app needs anyway.

**Rule of thumb:** let TypeScript infer when the starting value is a real example of the data. Annotate when it's a placeholder — `[]`, `null`, or `undefined`.

### Setting state replaces, it doesn't merge

```tsx
const [user, setUser] = useState({ name: "Maya", age: 30 });

setUser({ name: "Tom" });
// ❌ Property 'age' is missing in type '{ name: string; }' ...
```

The setter swaps the whole value. It doesn't merge in the way you might expect from other tools. To change one field, spread the rest ([JavaScript chapter 15](../../JavaScript/15-destructuring-spread-rest/notes.md)):

```tsx
setUser({ ...user, name: "Tom" });
```

TypeScript catches the missing field here, which is a nice safety net. [Chapter 11](../11-updating-objects-and-arrays/notes.md) is entirely about doing this well for objects and arrays.

### State updates are not instant

This one genuinely surprises everybody:

```tsx
function handleClick() {
  setCount(count + 1);
  console.log(count);     // still the OLD number!
}
```

`setCount` doesn't reach into the variable and change it. It tells React "re-render this component with a new value". The current render's `count` is a `const`; it was fixed the moment this render started, and nothing can change it now. The new number shows up in the **next** render.

React also **batches**: several setter calls in one handler cause one re-render, not several. That's why this famous bug happens:

```tsx
function handleClick() {
  setCount(count + 1);
  setCount(count + 1);
  setCount(count + 1);
}
```

Click it and the count goes up by **one**, not three. With `count` at `0`, all three lines say "set it to 1".

### The updater function

When the new value depends on the old one, pass a **function** instead of a value. React runs it with the latest value, in order:

```tsx
function handleClick() {
  setCount((prev) => prev + 1);
  setCount((prev) => prev + 1);
  setCount((prev) => prev + 1);
}
```

Now the count goes up by three: `0 → 1 → 2 → 3`.

**When to use which:**

- New value doesn't depend on the old one? Pass the value: `setName("Tom")`, `setTasks([])`.
- New value is built from the old one? Pass a function: `setCount((prev) => prev + 1)`, `setTasks((prev) => [...prev, newTask])`.

The updater form is never wrong, so when in doubt, use it. It becomes essential from [chapter 17](../17-effects/notes.md), where the value you captured could genuinely be stale.

(`prev` is just a parameter name. `c`, `current` and `oldCount` are all fine.)

### Each component has its own state

```tsx
function Ex() {
  return (
    <>
      <Counter />
      <Counter />
    </>
  );
}
```

Two counters, counting separately. That's what [chapter 03](../03-components/notes.md) meant by "each use is its own thing". React keeps state per **place in the tree**, not per component function.

Which leads to the natural question: what if two components need the *same* number? Then the state has to live in a component above both of them, and come down as props. That's **lifting state up**, and it's [chapter 13](../13-lifting-state-up/notes.md). For now, when you're deciding where a piece of state goes, put it in the **closest component that contains everything that needs it**.

### State goes down as props

State and props aren't rivals. They work together:

```tsx
function TaskApp() {
  const [tasks, setTasks] = useState<Task[]>([]);

  function handleDelete(id: string) {
    setTasks(tasks.filter((task) => task.id !== id));
  }

  return <TaskList tasks={tasks} onDelete={handleDelete} />;
}
```

- **State** lives in one component, and only that component can change it.
- **Props** carry it down to whoever needs to show it.
- **Functions passed down as props** ([chapter 07](../07-events/notes.md)) let children ask for changes.

That triangle — state down as props, events back up as functions — is the shape of essentially every React app. Read `TaskApp` above a few times; the chapter 10 project is that component with more features.

### Don't change state directly

```tsx
const [tasks, setTasks] = useState<Task[]>([]);

tasks.push(newTask);          // ❌ nothing happens on screen
setTasks([...tasks, newTask]); // ✅
```

`push` changes the array in place. React compares the old value to the new one to decide whether to re-render, and it's the *same array object*, so React concludes nothing changed. Your data is now different from what's on screen, which is the worst kind of bug.

Make a new value every time:

```tsx
setTasks([...tasks, newTask]);                               // add
setTasks(tasks.filter((task) => task.id !== id));            // remove
setTasks(tasks.map((task) =>                                 // change one
  task.id === id ? { ...task, done: !task.done } : task
));
```

Those three lines are the bulk of the chapter 10 project. [Chapter 11](../11-updating-objects-and-arrays/notes.md) drills them properly.

### Don't store what you can calculate

A very common beginner move:

```tsx
const [tasks, setTasks] = useState<Task[]>([]);
const [taskCount, setTaskCount] = useState(0);   // ❌
```

Now every change has to update two things, and the day you forget one, the count is wrong. Just work it out during the render:

```tsx
const [tasks, setTasks] = useState<Task[]>([]);
const taskCount = tasks.length;
const remaining = tasks.filter((task) => !task.done).length;
```

These are **derived values**. They can't go stale, because they're recalculated every render. (Worried about the cost? Don't be. [Chapter 27](../27-performance/notes.md) deals with the rare case where it matters.)

**Ask of every new piece of state: can I work this out from something I already have?** If yes, don't store it.

### Hooks, and their two rules

`useState` is a **hook**: a function that hooks your component into a React feature. You can spot one by its name — hooks always start with `use`. You'll meet `useEffect`, `useRef`, `useContext` and others later, and they all follow the same two rules.

**Rule 1: call hooks at the top level of your component.** Never inside an `if`, a loop, or a nested function.

```tsx
function Bad({ isOpen }: Props) {
  if (isOpen) {
    const [count, setCount] = useState(0);   // ❌
  }
}
```

React doesn't know your state's *name*. It keeps state in a list, in the order the hooks were called, and matches them up by position on every render. Skip a hook one time round and everything after it shifts by one, which is exactly as bad as it sounds. React usually catches it:

```
React has detected a change in the order of Hooks called by Bad.
```

Your linter should catch it too, before you even save.

**This is why early returns go *after* your hooks** — the thing [chapter 05](../05-conditional-rendering/notes.md) told you to tuck away:

```tsx
function TaskList({ tasks }: Props) {
  const [filter, setFilter] = useState("all");   // hooks first

  if (tasks.length === 0) {                      // then early returns
    return <p>Nothing to do!</p>;
  }
  // ...
}
```

**Rule 2: only call hooks from React components or from other hooks.** Not from plain functions, not from event handlers.

### Two more things worth knowing now

**Lazy initial state.** The argument to `useState` is only used on the first render, but if it's a function *call*, that call still happens every render:

```tsx
const [tasks, setTasks] = useState(loadFromStorage());     // runs every render
const [tasks, setTasks] = useState(() => loadFromStorage()); // runs once
```

Pass a function and React only calls it the first time. It matters for anything slow, like reading `localStorage` or parsing JSON, and you'll want it in [chapter 10](../10-project-todo-app/notes.md).

**Never set state during render.**

```tsx
function Bad() {
  const [count, setCount] = useState(0);
  setCount(count + 1);   // ❌
  return <p>{count}</p>;
}
```

Setting state causes a re-render, which sets state, which causes a re-render:

```
Too many re-renders. React limits the number of renders to prevent an infinite loop.
```

Set state in **event handlers**, or in effects ([chapter 17](../17-effects/notes.md)). Never in the body of a component.

### Seeing state in DevTools

Open the **Components** tab, click a component, and its hooks are listed on the right under **hooks** — `State: 0`, and so on. You can even edit the value there and watch the page update. When something's wrong, this tells you in one glance whether the state is wrong or only the display is.

## Common mistakes

**1. Changing the variable instead of calling the setter**

```tsx
count = count + 1;     // ❌ and TypeScript stops you: count is a const
tasks.push(newTask);   // ❌ TypeScript allows this one, and it silently does nothing
```

The second is the dangerous one. Always make a new value and pass it to the setter.

**2. Expecting the new value immediately**

```tsx
setCount(count + 1);
console.log(count);   // the old number
```

The new value arrives on the next render. To log what you're about to set, log `count + 1`.

**3. Setting from a stale value repeatedly**

```tsx
setCount(count + 1);
setCount(count + 1);   // goes up by one, not two
```

Use the updater: `setCount((prev) => prev + 1)`.

**4. `useState([])` with no type**

```tsx
const [tasks, setTasks] = useState([]);
// ❌ Type 'Task' is not assignable to type 'never'.
```

Write `useState<Task[]>([])`.

**5. Calling a hook inside a condition**

```tsx
if (isOpen) {
  const [x, setX] = useState(0);   // ❌
}
```

Hooks go at the top level, before any early return.

**6. Setting state during render**

```
Too many re-renders.
```

Look for a setter called in the component body, or a stray `()` in an event attribute: `onClick={handleClick()}`.

**7. Storing what you could calculate**

```tsx
const [remaining, setRemaining] = useState(0);   // ❌ goes stale
const remaining = tasks.filter((t) => !t.done).length;  // ✅ can't go stale
```

**8. Forgetting to import `useState`**

```
Cannot find name 'useState'.
```

`import { useState } from "react";` at the top. VS Code will add it if you accept its suggestion.

**9. One giant piece of state for unrelated things**

```tsx
const [stuff, setStuff] = useState({ tasks: [], filter: "all", isDark: false });
```

Now every change means spreading the whole object. Use separate `useState` calls for things that change separately. Group them only when they really change together.

## Quick recap

- `const [value, setValue] = useState(initial)` gives a component a memory that survives re-renders and tells React to redraw when it changes.
- React runs your component function again on every render. The starting value is only used the first time.
- **State updates aren't instant.** After `setCount(count + 1)`, `count` is still the old value until the next render.
- When the new value depends on the old one, pass a function: `setCount((prev) => prev + 1)`.
- **Never change state in place.** Make a new array or object and pass it to the setter.
- Don't store what you can calculate. Derived values can't go stale.
- Hooks are called at the **top level** of a component, before any early return, and never inside an `if` or a loop.
- State lives in one component and flows **down** as props; children ask for changes through **functions** passed down as props.

---

**Next:** try the [exercises](exercises.md), then move on to [09 Forms](../09-forms/notes.md).
