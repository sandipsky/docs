# 23 useReducer

## What is it?

`useReducer` is a second way to hold state. Instead of calling setters directly, components **describe what happened**, and one function decides what the new state should be.

```tsx
const [state, dispatch] = useReducer(reducer, initialState);

dispatch({ type: "added", text: "Buy milk" });
```

The function that decides is called a **reducer**. It takes the current state and a description of what happened, and returns the new state:

```tsx
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "added":
      return { ...state, tasks: [...state.tasks, newTask(action.text)] };
    // ...
  }
}
```

Everything you can do with `useReducer` you can do with `useState`. It's not more powerful — it's better *organised*, for a specific kind of problem.

## Why does it matter?

`useState` is perfect while your state is small and its updates are simple. It starts to creak when a feature has many related pieces of state updated in many different ways, from many different places.

Picture the to-do app from [chapter 10](../10-project-todo-app/notes.md), grown up a bit:

```tsx
function TaskApp() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [editingId, setEditingId] = useState<string | null>(null);

  function handleAdd(text: string) {
    setTasks([...tasks, { id: crypto.randomUUID(), text, done: false }]);
    setEditingId(null);
  }

  function handleDelete(id: string) {
    setTasks(tasks.filter((task) => task.id !== id));
    if (editingId === id) setEditingId(null);          // easy to forget
  }

  function handleClearCompleted() {
    setTasks(tasks.filter((task) => !task.done));
    if (editingId !== null && !tasks.some((t) => t.id === editingId && !t.done)) {
      setEditingId(null);                               // even easier to forget
    }
  }
  // ...six more handlers
}
```

Look at what's going wrong. The **rules** — "deleting a task you're editing must stop the edit" — are scattered across handlers, restated slightly differently each time. Add a tenth handler and you have to remember every rule again. Miss one, and you get a bug that only shows up in a specific sequence of clicks.

`useReducer` gathers all of those rules into **one function**, where they sit side by side and can be read in one pass. The component goes back to doing what components are good at: describing what the user did, and rendering.

## Real-world example

Think about the difference between **everyone editing a shared document** and **submitting request forms to one clerk**.

| Everyone edits directly | Everyone submits a form |
|---|---|
| Each handler calls setters itself | Each handler calls `dispatch` |
| The rules live wherever someone remembered them | The rules live in one place: the clerk |
| Two people can make contradictory edits | One clerk, one decision, one at a time |
| To learn the rules, read every handler | To learn the rules, read the clerk |
| That's `useState` | That's `useReducer` |
| No paper trail | Every form is a record of exactly what was asked |

That last row matters more than it sounds. Because every change arrives as a plain object saying what happened, you can log them, replay them, or write down the sequence that produced a bug — which is exactly what the DevTools for libraries like Redux ([chapter 35](../35-redux-toolkit/notes.md)) do.

## How it works

### The three pieces

```tsx
const [state, dispatch] = useReducer(reducer, initialState);
```

- **`state`** — the current state. Read it in your JSX exactly like a `useState` value.
- **`dispatch`** — call it with an **action** to say what happened. Like a setter, it triggers a re-render.
- **`reducer`** — the function that turns `(state, action)` into the next state.

Compare it directly with what you know:

| | `useState` | `useReducer` |
|---|---|---|
| Getting the value | `const [count, setCount]` | `const [state, dispatch]` |
| Changing it | `setCount(count + 1)` | `dispatch({ type: "incremented" })` |
| Where the logic lives | In each handler | In the reducer |
| Good for | A few independent values | Several related values with shared rules |

### A complete, small example

```tsx
type CounterState = {
  count: number;
  step: number;
};

type CounterAction =
  | { type: "incremented" }
  | { type: "decremented" }
  | { type: "step_changed"; step: number }
  | { type: "reset" };

const initialState: CounterState = { count: 0, step: 1 };

function counterReducer(state: CounterState, action: CounterAction): CounterState {
  switch (action.type) {
    case "incremented":
      return { ...state, count: state.count + state.step };
    case "decremented":
      return { ...state, count: Math.max(0, state.count - state.step) };
    case "step_changed":
      return { ...state, step: action.step };
    case "reset":
      return initialState;
  }
}

function Counter() {
  const [state, dispatch] = useReducer(counterReducer, initialState);

  return (
    <div>
      <p>Count: {state.count} (step {state.step})</p>
      <button onClick={() => dispatch({ type: "incremented" })}>+</button>
      <button onClick={() => dispatch({ type: "decremented" })}>−</button>
      <button onClick={() => dispatch({ type: "step_changed", step: 5 })}>Step 5</button>
      <button onClick={() => dispatch({ type: "reset" })}>Reset</button>
    </div>
  );
}
```

Read `Counter` on its own: every handler is one line, and each says only *what happened*. The rule that the count can't go below zero lives in the reducer, once — not repeated in every place that might decrement.

### Typing actions: the discriminated union

This is where TypeScript pays off enormously, and it's the pattern to learn from this chapter:

```tsx
type CounterAction =
  | { type: "incremented" }
  | { type: "decremented" }
  | { type: "step_changed"; step: number }
  | { type: "reset" };
```

That's a **discriminated union** ([TypeScript chapter 06](../../TypeScript/06-unions-and-narrowing/notes.md)): several object shapes, told apart by one shared field — here, `type`. It buys you three things:

**1. TypeScript narrows inside each `case`.**

```tsx
case "step_changed":
  return { ...state, step: action.step };   // ✅ TypeScript knows action has .step here

case "reset":
  return { ...state, step: action.step };
  // ❌ Property 'step' does not exist on type '{ type: "reset"; }'.
```

Inside `case "step_changed"`, `action` is narrowed to exactly that one shape. You can't read a field that action doesn't carry.

**2. Typos in action names are caught immediately.**

```tsx
dispatch({ type: "incremeted" });
// ❌ Type '"incremeted"' is not assignable to type '"incremented" | "decremented" | ...'.
```

**3. Missing data is caught too.**

```tsx
dispatch({ type: "step_changed" });
// ❌ Property 'step' is missing in type '{ type: "step_changed"; }'.
```

Compare that with a pile of loose `useState` setters, where nothing connects "the kind of change" to "the data that change needs." This is one of the clearest wins TypeScript offers in a React app.

### Exhaustiveness: catching a case you forgot

Add a new action type and forget to handle it, and by default the reducer just falls through and returns nothing — leaving `state` as `undefined`. You can make TypeScript catch that instead:

```tsx
function counterReducer(state: CounterState, action: CounterAction): CounterState {
  switch (action.type) {
    case "incremented":
      return { ...state, count: state.count + state.step };
    // ... other cases ...
    default: {
      const exhaustive: never = action;
      throw new Error(`Unknown action: ${JSON.stringify(exhaustive)}`);
    }
  }
}
```

If every case is handled, `action` in the `default` branch has type `never` — "this can't happen" — and assigning it to a `never` variable is fine. The moment you add a fifth action type and don't handle it, `action` in `default` is that fifth shape, which **isn't** assignable to `never`, and TypeScript stops you:

```
❌ Type '{ type: "doubled"; }' is not assignable to type 'never'.
```

A compile-time error, pointing at exactly the case you forgot. This little trick is worth using in every reducer you write.

### Reducers must be pure

A reducer follows the same rules as a component's render ([chapter 12](../12-how-rendering-works/notes.md)):

- **Return a new state object — never mutate the old one.** All of [chapter 11](../11-updating-objects-and-arrays/notes.md) applies, unchanged.
- **No side effects.** No `fetch`, no `localStorage`, no `Math.random()`, no `Date.now()`, no logging to a server. Given the same state and action, it must always return the same result.

```tsx
case "added":
  state.tasks.push(newTask);        // ❌ mutation
  return state;                      // ❌ and the same reference, so React may not even re-render

case "added":
  return { ...state, tasks: [...state.tasks, newTask] };   // ✅
```

Purity is why StrictMode can call your reducer twice in development without breaking anything, and it's what makes actions replayable.

**So where do side effects go?** Exactly where they went before: in event handlers, or in effects. Generate the id *before* dispatching, and pass it in the action:

```tsx
function handleAdd(text: string) {
  dispatch({ type: "added", id: crypto.randomUUID(), text });
}
```

The reducer stays pure; the randomness happens outside it.

### Naming actions

Two conventions you'll meet. Name actions after **what happened**, not what should change:

```tsx
dispatch({ type: "added", text });          // ✅ describes the event
dispatch({ type: "set_tasks", tasks });     // ⚠️ describes the mechanism
```

The first reads like a log of user activity, which is the whole point — a reducer full of `set_x` actions is just `useState` with extra steps. Past-tense names (`added`, `deleted`, `filter_changed`) keep you honest about this.

### Converting `useState` to `useReducer`

You'll usually start with `useState` and move over when it starts hurting. The steps:

1. **Gather the related state into one object.** That object's type is your `State`.
2. **List every way it can change.** Each one becomes a member of your `Action` union, carrying whatever data it needs.
3. **Move each handler's body into the matching `case`**, changing `setX(...)` into `return { ...state, x: ... }`.
4. **Replace each handler body with a single `dispatch`.**

The to-do app's reducer, done this way, ends up looking like this:

```tsx
type TaskAction =
  | { type: "added"; id: string; text: string }
  | { type: "toggled"; id: string }
  | { type: "deleted"; id: string }
  | { type: "cleared_completed" }
  | { type: "filter_changed"; filter: Filter };

function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case "added":
      return {
        ...state,
        tasks: [...state.tasks, { id: action.id, text: action.text, done: false }],
      };
    case "toggled":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.id ? { ...task, done: !task.done } : task
        ),
      };
    case "deleted":
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.id),
        editingId: state.editingId === action.id ? null : state.editingId,
      };
    // ...
  }
}
```

Look at the `deleted` case: the rule "deleting the task you're editing also stops editing" is stated **once**, right next to the deletion it belongs to. In the `useState` version it was a separate `if` in a separate handler, easy to forget and easy to get subtly wrong.

### Lazy initial state

`useReducer` takes an optional third argument: a function that computes the initial state, called only on the first render — the same idea as lazy initial state in [chapter 08](../08-state/notes.md):

```tsx
function init(savedJson: string | null): TaskState {
  if (savedJson === null) return { tasks: [], filter: "all", editingId: null };
  // ...parse it
}

const [state, dispatch] = useReducer(taskReducer, localStorage.getItem(KEY), init);
```

The second argument becomes `init`'s argument. You won't need this often, but it's there.

### `useReducer` and context, together

These two combine into one of the most useful patterns in React: state that any component can read *and* change, without a single prop.

```tsx
const TaskStateContext = createContext<TaskState | null>(null);
const TaskDispatchContext = createContext<React.Dispatch<TaskAction> | null>(null);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  return (
    <TaskStateContext value={state}>
      <TaskDispatchContext value={dispatch}>
        {children}
      </TaskDispatchContext>
    </TaskStateContext>
  );
}
```

**Two contexts, not one**, and it's deliberate. `dispatch` is completely stable — React guarantees it's the same function for the life of the component — so a component that only dispatches (a delete button, say) reads a value that *never changes*, and therefore never re-renders when the state does. Bundling them into one object would throw that away ([chapter 22](../22-context/notes.md)).

With a guard hook for each, any component anywhere can do:

```tsx
const { tasks } = useTaskState();
const dispatch = useTaskDispatch();
```

No props, no drilling, and every rule about how tasks change still living in one reducer. This is roughly what Redux ([chapter 35](../35-redux-toolkit/notes.md)) offers, built from two React features you already know.

### When to use which

Stay with `useState` when:

- the state is one or two independent values
- updates are simple and don't depend on each other
- there aren't many places that change it

Reach for `useReducer` when:

- several pieces of state change together, under shared rules
- the next state often depends on the previous one in non-trivial ways
- the same logic is repeated across handlers
- you want to be able to see all the ways your state can change, in one place

You'll know. When a fourth handler starts with "and also reset the editing id," that's the signal.

## Common mistakes

**1. Mutating state in the reducer**

```tsx
case "toggled":
  const task = state.tasks.find((t) => t.id === action.id);
  task.done = !task.done;    // ❌
  return state;              // ❌ same reference, React may not re-render
```

Every rule from [chapter 11](../11-updating-objects-and-arrays/notes.md) applies. Build a new object, always.

**2. Side effects inside the reducer**

```tsx
case "added":
  localStorage.setItem("tasks", ...);           // ❌
  return { ...state, tasks: [...state.tasks, { id: crypto.randomUUID(), ... }] };  // ❌
```

Reducers must be pure. Do the storage write in an effect, and generate the id in the handler, passing it in the action.

**3. Forgetting to `return` in a case**

```tsx
case "reset":
  initialState;    // ❌ computed and thrown away; falls through
```

Your state silently becomes `undefined` (or falls into the next case). The `never` exhaustiveness check catches the *missing case* problem; this one is caught by the reducer's declared return type, so don't skip the `: State` annotation.

**4. Actions named after setters**

```tsx
dispatch({ type: "set_tasks", tasks: newTasks });
```

If every action is `set_something`, you've rebuilt `useState` with more ceremony and none of the benefit. Name actions after what happened.

**5. Reaching for `useReducer` too early**

A single boolean does not need a reducer. The ceremony only pays for itself once there are genuinely shared rules to centralise.

**6. Putting `state` and `dispatch` in one context**

It works, but it means every dispatch-only component re-renders on every state change. Two contexts costs a few extra lines and keeps `dispatch`'s stability useful.

## Quick recap

- `useReducer(reducer, initialState)` gives you `[state, dispatch]`. Components **describe what happened**; one reducer decides what the state becomes.
- Type actions as a **discriminated union** on `type`. TypeScript then narrows inside each `case`, and catches misspelled action names and missing data at both ends.
- Add a `default` case assigning `action` to a `never` variable to make TypeScript catch any action type you forgot to handle.
- Reducers must be **pure**: new state objects, no mutation, no side effects. Generate ids and random values in the handler and pass them in the action.
- Name actions after **what happened** (`added`, `deleted`), not after what to set.
- `useReducer` + two contexts (one for state, one for `dispatch`) gives any component read and write access with no props — a small, hand-rolled version of what Redux does.
- Use `useState` until the rules for changing state start repeating themselves across handlers. That's the moment to switch.

---

**Next:** try the [exercises](exercises.md), then move on to [24 React Router](../24-react-router/notes.md).
