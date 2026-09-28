# 20 Custom Hooks

## What is it?

A **custom hook** is a function you write yourself, whose name starts with `use`, that calls other hooks inside it. It packages up a piece of reusable *logic* — not JSX, not a component, just behaviour — so you can use it from any component.

```tsx
function useToggle(initialValue: boolean) {
  const [value, setValue] = useState(initialValue);
  const toggle = () => setValue((prev) => !prev);
  return [value, toggle] as const;
}
```

```tsx
function Sidebar() {
  const [isOpen, toggleOpen] = useToggle(false);
  return <button onClick={toggleOpen}>{isOpen ? "Close" : "Open"}</button>;
}
```

Nothing here is a new React feature. `useToggle` is a plain function that happens to call `useState` inside it. That's the entire trick, and this chapter is about using it well.

## Why does it matter?

Go back to [chapter 18's exercise 4](../18-fetching-data/exercises.md): two components, `CategoryList` and `AreaList`, each with its own `isLoading`, `error`, `data`, and a `useEffect` doing almost exactly the same fetch-and-track dance, differing only in the URL and the shape of what comes back. If you did that exercise, you counted the duplicated lines yourself.

Components can't solve this the way you'd hope. You can't "call" one component's `useState` from inside another — each component's hooks are private to it. But the *logic* — "track loading, error and data; fetch on mount; clean up if the component goes away" — has nothing to do with JSX at all. It's just behaviour, and behaviour is exactly what a plain function is for. A custom hook is the tool for sharing **stateful logic** between components, the same way a plain function shares logic between other plain functions ([JavaScript chapter 09](../../JavaScript/09-functions/notes.md)) — it just happens to be allowed to use `useState`, `useEffect`, and the rest along the way.

## Real-world example

Think about a **recipe versus a finished dish**.

| A recipe | A custom hook |
|---|---|
| "Preheat the oven, mix the batter, bake 20 minutes" | The logic: `useState`, `useEffect`, wired together |
| Any kitchen can follow it | Any component can call it |
| Different kitchens, same recipe, **different cakes** | Different components, same hook, **completely separate state** |
| The recipe itself doesn't bake anything | The hook itself doesn't render anything |
| You still need an oven (an actual kitchen) to use it | You still need a component to call it in |

The crucial line is the third one, and it's worth sitting with before you write your first custom hook: the recipe is shared, but each kitchen bakes its **own** cake. A custom hook shares the *logic*, never the *state itself* — every component that calls `useToggle(false)` gets its own independent `isOpen`, exactly like two components calling `useState` directly never share a value.

## How it works

### Extracting your first custom hook

Start from ordinary, repeated code — this is genuinely how you'll discover most custom hooks in real projects, by noticing you've written the same `useState`/`useEffect` pairing twice:

```tsx
function ProfileForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const isValid = name !== "" && email.includes("@");
  // ...
}

function SignupForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const isValid = username !== "" && password.length >= 8;
  // ...
}
```

Different fields, different rules — but the *shape* repeats: a value, a setter, a validity check. Here's a narrower, genuinely reusable slice of that: a single controlled field with its own validity.

```tsx
function useField(initialValue: string, isValid: (value: string) => boolean) {
  const [value, setValue] = useState(initialValue);

  return {
    value,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => setValue(event.target.value),
    isValid: isValid(value),
  };
}
```

```tsx
function ProfileForm() {
  const name = useField("", (v) => v !== "");
  const email = useField("", (v) => v.includes("@"));

  return (
    <form>
      <input value={name.value} onChange={name.onChange} />
      {!name.isValid && <p>Name is required.</p>}

      <input value={email.value} onChange={email.onChange} />
      {!email.isValid && <p>That doesn't look like an email.</p>}
    </form>
  );
}
```

Every part of this should look familiar — it's `useState`, a change handler, and a derived boolean, exactly as you've written dozens of times since [chapter 09](../09-forms/notes.md). The only new idea is that it's now wrapped in a function you can call twice in one component, and each call gets its own, completely independent `value` and `isValid`.

### The naming rule is not a suggestion

A function must be named starting with `use` for two real reasons, not just convention:

1. **React's linter uses the name to know which functions are allowed to call hooks.** `useField` calling `useState` is fine and checked properly; a function called `getField` doing the exact same thing would trip the rules-of-hooks linting, because as far as the linter's concerned, `getField` is just an ordinary function that has no business calling `useState`.
2. **Readers of your code need to know, at a glance, that calling this thing has React's rules attached to it** — the same two rules from [chapter 08](../08-state/notes.md): top level only, never inside a condition or a loop.

So the two rules of hooks apply to your **own** hooks exactly as they apply to `useState` and `useEffect`:

```tsx
function Bad({ isOpen }: { isOpen: boolean }) {
  if (isOpen) {
    const toggled = useToggle(false);   // ❌ same violation as chapter 08, just one level removed
  }
}
```

If `useField` calls `useState` and `useEffect` inside it, then calling `useField` is exactly as bound by the rules as calling those hooks directly — because that's genuinely what's happening under the hood.

### A custom hook shares logic, never state

This is the single most important idea in the whole chapter, worth its own worked proof:

```tsx
function useCounter(initial: number) {
  const [count, setCount] = useState(initial);
  return { count, increment: () => setCount((c) => c + 1) };
}

function App() {
  const counterA = useCounter(0);
  const counterB = useCounter(100);

  return (
    <div>
      <button onClick={counterA.increment}>A: {counterA.count}</button>
      <button onClick={counterB.increment}>B: {counterB.count}</button>
    </div>
  );
}
```

Click A's button ten times, and B still reads `100`. `useCounter` isn't a single shared counter that both buttons plug into — it's a *template* for making a counter, and every call builds a fresh, private one, exactly the way two `<Counter />` components never mix up their numbers back in [chapter 08](../08-state/notes.md). If you ever want components to share the *same* live value rather than the same *kind* of value, that's not a custom hook's job — that's lifting state up ([chapter 13](../13-lifting-state-up/notes.md)), or Context ([chapter 22](../22-context/notes.md)).

### `useLocalStorage`: fixing the to-do app's milestone 8, properly

Remember the honest note at the end of [chapter 10](../10-project-todo-app/notes.md): saving to `localStorage` by hand, in every handler, was "the long way round," waiting for the right tool. Here it is.

```tsx
function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const saved = localStorage.getItem(key);
    if (saved === null) return initialValue;
    try {
      return JSON.parse(saved) as T;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}
```

```tsx
function App() {
  const [tasks, setTasks] = useLocalStorage<Task[]>("react-todo-tasks", []);
  // use setTasks exactly like a normal useState setter — saving happens automatically
}
```

Walk through what moved where, compared to the to-do app's manual version:

- **The lazy initializer** (`useState<T>(() => { ... })`) is exactly the `loadTasks` pattern from chapter 10, now living inside the hook instead of the component.
- **The `useEffect`** replaces the hand-written `updateTasks` helper. Now, *any* call to `setValue` — from anywhere, for any reason — automatically gets saved, because the effect reacts to `value` changing, not to a specific function being called. That closes exactly the gap [chapter 17](../17-effects/notes.md) opened with: "what if a change to `tasks` arrives some way other than through a handler you remembered to route through `updateTasks`?"
- **The generic `<T>`** ([TypeScript chapter 08](../../TypeScript/08-generics/notes.md)) means this one hook works for a to-do list, a theme preference, a shopping cart — anything JSON can represent — with full type checking at every call site.
- **`as const`** on the returned tuple keeps TypeScript treating it as a fixed-length pair (`[T, Dispatch<SetStateAction<T>>]`) rather than a general array, the same reason `useState` itself returns a tuple.

This single hook is genuinely something you'll reuse in nearly every React project you ever build.

### `useFetch`: fixing chapter 18's duplication

Back to the exercise this chapter promised to resolve. The `isLoading`/`error`/`data` shape from [chapter 18](../18-fetching-data/notes.md), extracted once:

```tsx
function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    setIsLoading(true);
    setError(null);

    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`Request failed: ${response.status}`);
        return response.json();
      })
      .then((json: T) => {
        if (!ignore) setData(json);
      })
      .catch((err: unknown) => {
        if (!ignore) setError(err instanceof Error ? err.message : "Something went wrong");
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [url]);

  return { data, isLoading, error };
}
```

```tsx
function CategoryList() {
  const { data, isLoading, error } = useFetch<CategoriesResponse>(
    "https://www.themealdb.com/api/json/v1/1/categories.php"
  );

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Something went wrong: {error}</p>;
  if (!data) return null;

  return (
    <ul>
      {data.categories.map((c) => (
        <li key={c.idCategory}>{c.strCategory}</li>
      ))}
    </ul>
  );
}
```

`AreaList` becomes just as short, calling `useFetch<AreasResponse>(...)` with its own URL and its own response type. The entire fetch-track-cancel dance is written **once**. Every component that needs data from somewhere just describes *what* it needs (a URL, a type) and gets back the three familiar pieces, ready to render.

### Returning an object vs. a tuple

You've now seen both shapes. Which to pick isn't arbitrary:

```tsx
// tuple — like useState
const [value, setValue] = useLocalStorage("theme", "light");

// object — like useFetch
const { data, isLoading, error } = useFetch(url);
```

**Use a tuple (`as const` on an array) when there are exactly two values and one obvious order** — a value and its setter, mirroring `useState` itself. Callers can name both however they like: `const [isDark, setIsDark] = useLocalStorage(...)`.

**Use an object when there are three or more values, or the order isn't obvious.** With `{ data, isLoading, error }`, the caller can destructure only what they need, in any order, and the names are fixed and self-explanatory rather than positional. Nobody has to remember "is loading the second thing or the third thing back from this hook?"

### Composing custom hooks from other custom hooks

Hooks can call other hooks, including your own, and this is where the reuse compounds. Combine `useFetch` and `useLocalStorage` to cache a slow API response across visits:

```tsx
function useCachedFetch<T>(key: string, url: string) {
  const [cached, setCached] = useLocalStorage<T | null>(key, null);
  const { data, isLoading, error } = useFetch<T>(url);

  useEffect(() => {
    if (data) setCached(data);
  }, [data]);

  return { data: data ?? cached, isLoading: isLoading && cached === null, error };
}
```

Neither `useFetch` nor `useLocalStorage` needed to change at all to make this possible — that's the real payoff of extracting logic into small, focused hooks instead of one giant one that tries to do everything at once.

### What a custom hook is *not*

- **It's not a component.** It returns plain values — numbers, objects, functions — never JSX. If you find yourself wanting a hook to "return a `<div>`," what you actually want is a component that happens to *use* a custom hook internally.
- **It's not a global store.** Calling the same custom hook from five components gives you five independent instances of its state, not one shared one, exactly as proven above. Sharing genuinely live state across components is [chapter 13](../13-lifting-state-up/notes.md) or [chapter 22](../22-context/notes.md)'s job.
- **It's not required to call `useState` or `useEffect` at all.** `usePrevious` from [chapter 19's exercises](../19-refs/exercises.md) is a completely legitimate custom hook built only from `useRef` and `useEffect`. Any function that calls one or more hooks, and follows the naming rule, qualifies.

## Common mistakes

**1. Not naming it starting with `use`**

```tsx
function toggleValue(initial: boolean) {   // ❌ the linter can't tell this calls hooks
  const [value, setValue] = useState(initial);
  ...
}
```

React's linting for the rules of hooks specifically looks for the `use` prefix to know which functions to check. Skip it, and mistakes inside your own hook go uncaught.

**2. Expecting two calls to share state**

```tsx
const a = useCounter(0);
const b = useCounter(0);
// clicking a's button changing b's count would be a bug, not a feature
```

Every call creates its own, independent state. If you need genuinely shared state, that's lifting state up or Context, not a custom hook.

**3. Calling a custom hook conditionally**

```tsx
if (userIsLoggedIn) {
  const profile = useFetch(profileUrl);   // ❌ same violation as any other hook
}
```

The rules of hooks apply to your own hooks exactly as they apply to React's. Put the check *inside* the hook, or call the hook unconditionally and branch on its result instead.

**4. Building one giant hook that does everything**

A `useApp()` hook handling fetching, form state, theme, and routing all at once is hard to read, hard to test, and hard to reuse in part. Prefer several small, focused hooks — `useFetch`, `useLocalStorage`, `useField` — composed together, the way `useCachedFetch` combined two above.

**5. Forgetting the custom hook still needs to follow every rule its inner hooks have**

If `useFetch` uses `useEffect` with a dependency array, every rule about that dependency array from [chapter 17](../17-effects/notes.md) — exhaustiveness, avoiding fresh object literals — still fully applies, just one layer down. Wrapping a hook in your own function doesn't exempt it from anything.

## Quick recap

- A custom hook is a plain function, named starting with `use`, that calls other hooks inside it — a way to share **stateful logic**, never state itself, between components.
- Every call to a custom hook creates its own independent state, exactly like calling `useState` directly in two different components.
- Your own hooks follow the same two rules as React's built-in ones: top level only, never conditional, never inside a loop.
- Extract a custom hook when you notice the same combination of hooks repeated across components — `useLocalStorage` and `useFetch` are two you'll reuse in nearly every project from here on.
- Return a **tuple** (`as const`) for a value-and-setter pair mirroring `useState`; return an **object** when there are three or more values or the order isn't obvious.
- Custom hooks can call other custom hooks, and this composition is where the real reuse pays off.

---

**Next:** try the [exercises](exercises.md), then build the [21 Project: Recipe Finder](../21-project-recipe-finder/notes.md), which leans on almost everything from this level.
