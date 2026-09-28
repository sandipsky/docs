# 11 Updating Objects and Arrays in State

## What is it?

This chapter is a toolkit for one rule you've been following since [chapter 08](../08-state/notes.md): **never change an object or array that's in state. Always make a new one.**

```tsx
// ❌
task.done = true;
tasks.push(newTask);

// ✅
setTask({ ...task, done: true });
setTasks([...tasks, newTask]);
```

You've seen the shallow version of this a dozen times. This chapter covers what happens when the object has an object inside it, or the array holds objects you need to change one of.

## Why does it matter?

You've built a to-do app with flat data: a task has a string and a boolean. Real data nests. A user has an address, which has a city. An order has a list of items, each with its own quantity. The moment your state has a shape inside a shape, the simple `{ ...obj, field: newValue }` you know isn't automatically enough, and it's easy to write something that *looks* right and quietly doesn't work.

Here's the failure mode, concretely:

```tsx
type Task = {
  id: string;
  text: string;
  assignee: { name: string; avatar: string };
};

function handleReassign(id: string, name: string) {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.assignee.name = name;      // ❌ still mutation, just one level deeper
    setTasks([...tasks]);           // a new array... of the same objects
  }
}
```

This one is sneaky, because it *looks* like you did the right thing — there's a spread, right there. But `[...tasks]` copies the array; it doesn't copy the objects **inside** it. Every task in the new array is the exact same object as before, `assignee` included, and you just changed one of those objects directly. React might not even notice something changed, and even if it does, you've corrupted the state you were trying to protect. This chapter is about spotting that trap and knowing exactly how deep a copy needs to go.

## Real-world example

Think about **photocopying a filing cabinet**.

| Filing cabinet | Nested state |
|---|---|
| The cabinet | The array of objects |
| A folder inside it | One object in the array |
| A page inside the folder | A field inside that object |
| Photocopying just the cabinet's index card | Spreading the array, `[...tasks]` |
| The folders inside are still the **original** folders | The objects inside are still the same references |
| Writing on a page inside an "original" folder | Mutating a nested field |
| To really get a fresh copy: photocopy the cabinet, **and** the folder, **and** the page | Spread at every level you're changing |

You only need to photocopy as deep as the level you're writing on. Folders you're not touching can stay as they are.

## How it works

### The rule, precisely

**Copy every level between the top of your state and the value you're changing. Levels you're not touching can be reused as-is.**

That's it. It sounds abstract, so the rest of this chapter is worked examples.

### One nested object

```tsx
type Profile = {
  name: string;
  address: {
    city: string;
    postcode: string;
  };
};

const [profile, setProfile] = useState<Profile>({
  name: "Maya",
  address: { city: "Leeds", postcode: "LS1 1AA" },
});
```

To change just the city, you copy two levels: the profile, and the address inside it.

```tsx
setProfile({
  ...profile,
  address: { ...profile.address, city: "York" },
});
```

Read it inside-out: `{ ...profile.address, city: "York" }` makes a **new address object**, same postcode, new city. Then `{ ...profile, address: ... }` makes a **new profile object**, same name, with that new address slotted in.

What goes wrong if you skip the inner spread:

```tsx
setProfile({ ...profile, address: { city: "York" } });
// ❌ Property 'postcode' is missing in type '{ city: string; }' but required in type '{ city: string; postcode: string; }'.
```

TypeScript catches this one for you, because the address type has two required fields and you only gave it one. That's not a coincidence — it's one of the best reasons to give nested state a real type instead of leaving it as an inferred object shape.

### A helper function for one field

Typing that out for every field gets old. A small helper keeps the pattern in one place:

```tsx
function updateAddress(field: keyof Profile["address"], value: string) {
  setProfile({
    ...profile,
    address: { ...profile.address, [field]: value },
  });
}

updateAddress("city", "York");
```

`Profile["address"]` reaches inside the `Profile` type to grab the address's type ([TypeScript chapter 10](../../TypeScript/10-keyof-typeof-mapped-types/notes.md)), and `keyof` turns that into the union `"city" | "postcode"`. Pass anything else and TypeScript stops you.

### Arrays of objects: change one item

This is the one you'll write constantly, and you already met it in the to-do app: `map`, replacing the matching item with a new object and leaving the rest alone.

```tsx
type Task = {
  id: string;
  text: string;
  done: boolean;
};

function handleToggle(id: string) {
  setTasks(
    tasks.map((task) =>
      task.id === id ? { ...task, done: !task.done } : task
    )
  );
}
```

Two different things happen in that `map`, and it's worth naming them:

- The matching task gets a **new object**: `{ ...task, done: !task.done }`.
- Every other task is returned **unchanged** — literally the same object reference as before, not a copy.

That second point isn't laziness, it's correct. Copying objects you didn't change achieves nothing and [chapter 27](../27-performance/notes.md) explains a case where it actively costs you: some optimisations rely on unrelated items staying the *same* reference so React can skip re-rendering them.

### Arrays of objects, one level deeper

Now put a nested object inside the array item, and both rules apply at once:

```tsx
type Task = {
  id: string;
  text: string;
  assignee: { name: string; avatar: string };
};

function handleReassign(id: string, name: string) {
  setTasks(
    tasks.map((task) =>
      task.id === id
        ? { ...task, assignee: { ...task.assignee, name } }
        : task
    )
  );
}
```

This is the fixed version of the bug at the start of the chapter. Copy the array (`map` does that for you), copy the item you're changing, copy the nested object inside *that* item. Untouched tasks, and the untouched `avatar` inside the touched task, are reused as-is.

### Adding, removing, and reordering

These don't need deep copies — they only touch the array itself — but they're worth having side by side, because you'll reach for all of them constantly:

```tsx
// add to the end
setTasks([...tasks, newTask]);

// add to the start
setTasks([newTask, ...tasks]);

// insert at a position
setTasks([...tasks.slice(0, index), newTask, ...tasks.slice(index)]);

// remove
setTasks(tasks.filter((task) => task.id !== id));

// replace one
setTasks(tasks.map((task) => (task.id === id ? updated : task)));

// reorder (move index i to the end, say)
setTasks([...tasks.slice(0, i), ...tasks.slice(i + 1), tasks[i]]);

// sort, without touching the original
setTasks([...tasks].sort((a, b) => a.text.localeCompare(b.text)));
setTasks(tasks.toSorted((a, b) => a.text.localeCompare(b.text))); // same idea, newer method
```

`slice` (copies part of an array) is not `splice` (changes the array in place and returns what it removed). They're one letter apart and do opposite things. If you only remember one thing from this section, remember that `splice` doesn't belong anywhere near state.

### Updating an array of numbers or strings

Primitives are simpler, because there's no inner object to worry about — but the array itself still needs to be new:

```tsx
const [tags, setTags] = useState<string[]>(["urgent"]);

setTags([...tags, "today"]);                    // add
setTags(tags.filter((tag) => tag !== "urgent")); // remove
setTags(tags.map((tag) => (tag === "urgent" ? "high-priority" : tag))); // rename
```

### Why React needs a new reference

It's worth knowing what React is actually checking, because it explains every rule above.

When state changes, React compares the **new value to the old one** to decide whether to re-render. For objects and arrays, that comparison is `Object.is`, which — like `===` — checks whether two variables point at the **same object in memory**, not whether their contents look the same ([JavaScript chapter 16](../../JavaScript/16-values-vs-references/notes.md)).

```tsx
const a = { name: "Maya" };
const b = { name: "Maya" };
console.log(a === b); // false — same content, different objects

const c = a;
c.name = "Tom";
console.log(a === c); // true — same object, even after the "change"
```

That's the whole story. `task.done = true` doesn't change *what* `task` refers to, so `oldTask === newTask` is still `true`, and React sees nothing to redraw. `{ ...task, done: true }` makes a genuinely different object, so the comparison correctly says "this changed."

This also explains why an **unrelated** field changing doesn't need a new reference. If you change `address.city`, the `name` field's *value* didn't change — but you still had to make a new `profile` object, because `profile` itself is a different object now, and `profile !== oldProfile` is exactly what tells React to re-render.

### `structuredClone`, and why it's not the answer here

JavaScript has a built-in function for a **deep copy** — a copy all the way down, however nested:

```ts
const original = { address: { city: "Leeds" } };
const copy = structuredClone(original);
copy.address.city = "York";
console.log(original.address.city); // "Leeds" — untouched
```

It's tempting to reach for this everywhere and sidestep the spreading rules entirely. Don't. Two reasons:

1. **It's wasteful.** It copies parts of your state you weren't even changing, every single time.
2. **It throws away the reference sharing that makes React fast.** Remember the untouched tasks from earlier, reused as the same object on purpose? `structuredClone` would silently replace every one of them with a new, equal-but-different copy, which defeats optimisations `React.memo` relies on ([chapter 27](../27-performance/notes.md)).

Spread only as deep as you're actually changing. It's more typing up front, and it's the version that scales.

### When nesting gets too deep

If you find yourself spreading three or four levels to change one field, that's a signal, not just an inconvenience:

```tsx
setState({
  ...state,
  a: { ...state.a, b: { ...state.a.b, c: { ...state.a.b.c, value: 5 } } },
});
```

Nobody enjoys reading that, let alone writing it. Two honest fixes:

- **Flatten your state.** Often nesting was arbitrary, not necessary. A `taskAssigneeName` field next to `taskText`, instead of `task.assignee.name`, might genuinely be simpler for what your app does.
- **Reach for a library.** [Immer](https://immerjs.github.io/immer/) is a popular one: you write code that *looks* like mutation, and it produces the correctly-copied result behind the scenes. It's outside this course, but it's worth knowing the name for when your state gets genuinely gnarly. Most apps never need it.

Try flattening first. It's usually the better fix, and it costs nothing to learn.

### Objects with array fields

The two ideas combine however they're nested. Here's an object with an array inside it:

```tsx
type Board = {
  title: string;
  tasks: Task[];
};

function handleAddTask(board: Board, newTask: Task): Board {
  return { ...board, tasks: [...board.tasks, newTask] };
}

setBoard(handleAddTask(board, newTask));
```

Same rule, applied twice: copy the object because you're changing its `tasks` field, and build a new `tasks` array because you're adding to it.

### `readonly` keeps you honest

[Chapter 04](../04-props/notes.md) introduced `readonly` on props. It's just as useful on state you pass around, because it turns a whole class of these mistakes into a compile error instead of a silent bug:

```tsx
type Task = {
  readonly id: string;
  readonly text: string;
  readonly assignee: {
    readonly name: string;
    readonly avatar: string;
  };
};

task.assignee.name = "Tom";
// ❌ Cannot assign to 'name' because it is a read-only property.
```

It won't write the copying code for you, but it will stop you from taking the shortcut that seems to work until it doesn't. Adding `readonly` to state types you know will be nested is a habit worth building now.

## Common mistakes

**1. Spreading the array but not the object inside it**

```tsx
setTasks([...tasks.map((t) => (t.id === id ? t : t))]);  // nothing actually changed
task.done = true;
setTasks([...tasks]);   // ❌ still the same task objects
```

A new array of the same objects is still the same objects. Change the matching item with `map` and a spread, not by editing it first.

**2. Only copying one level of a deeply nested update**

```tsx
setProfile({ ...profile, address: profile.address });   // address object unchanged
```

If you're about to change something *inside* `address`, `address` needs its own spread too.

**3. Using `splice` because it "sounds like" `slice`**

```tsx
tasks.splice(index, 1);   // ❌ mutates in place, and returns the removed items, not the array
```

Use `filter` to remove, or `slice` (no `p`) to copy a range.

**4. Sorting or reversing state directly**

```tsx
tasks.sort((a, b) => a.text.localeCompare(b.text));   // ❌ mutates
setTasks(tasks);                                       // same reference — may not even re-render
```

Copy first: `[...tasks].sort(...)` or `tasks.toSorted(...)`.

**5. Reaching for `structuredClone` out of habit**

It works, but it copies more than you need and breaks reference sharing for everything you didn't touch. Spread exactly as deep as the change.

**6. Forgetting that objects from `map`'s "no change" branch must be the *same* object**

```tsx
tasks.map((task) => (task.id === id ? { ...task, done: true } : { ...task }))
```

That final `{ ...task }` looks harmless, but it creates a **new** object for every task you didn't even mean to change. Just return `task` as-is in the untouched branch.

**7. Trusting a shallow spread to protect nested data**

```tsx
const copy = { ...profile };
copy.address.city = "York";     // ❌ this still changes profile.address.city too!
```

`{ ...profile }` copies the top-level fields, but `address` is still the *same* nested object in both `profile` and `copy`. Changing it through one changes it through the other. This is the single most common surprise in this whole chapter — say it out loud once: a spread only copies one level deep.

## Quick recap

- The rule is precise, not vague: **copy every level between the top of your state and the field you're changing.** Untouched levels can be reused as-is.
- A shallow spread, `{ ...obj }`, only copies the top level. Anything nested inside is still the *same* object in the copy — change it and you've mutated the original too.
- For arrays of objects, `map` combined with a spread on the matching item is the standard shape: `tasks.map((t) => (t.id === id ? { ...t, done: true } : t))`.
- Add, remove, and reorder with `[...arr, x]`, `filter`, and `slice` — never `push`, `splice`, or `sort` directly on state.
- React compares state by **reference**, with `Object.is`. That's why a genuinely new object or array is required, and why reusing unchanged references is not just allowed but good.
- `structuredClone` deep-copies everything, which is usually more than you want. Prefer spreading only as deep as needed.
- Deeply nested state that needs three or four levels of spreading is a sign to flatten your data, or to learn a tool like Immer.
- `readonly` on nested state types turns silent mutation bugs into compile errors.

---

**Next:** try the [exercises](exercises.md), then move on to [12 How Rendering Works](../12-how-rendering-works/notes.md).
