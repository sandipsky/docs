# 09 Forms

## What is it?

A form in React is state plus events, wired together. You put what someone typed into state, and you show it back from state:

```tsx
const [email, setEmail] = useState("");

<input
  type="email"
  value={email}
  onChange={(event) => setEmail(event.target.value)}
/>
```

An input wired up like that is called a **controlled input**: React controls what's in it. Those two lines — `value` and `onChange` — are 90% of this chapter.

## Why does it matter?

In plain HTML, a text box keeps its own value. You type, the box remembers, and when you want to know what's in it you go and ask ([JavaScript chapter 22](../../JavaScript/22-forms/notes.md)):

```js
const email = document.querySelector("#email").value;
```

That's fine when you only look once, at the end. But real forms need more:

- Disable the Submit button until the form is valid.
- Show "That doesn't look like an email address" as someone types.
- Count characters left: `47 / 280`.
- Have one field change another: pick a country, and the list of cities changes.
- Fill the form in from data you loaded.

Each of those means knowing what's in the box *right now*. If the box holds the truth, you're constantly running off to ask it, and nothing on the page knows to update when the answer changes.

Controlled inputs turn it round. **Your state holds the truth, and the box just displays it.** Everything else on the page can read that state and react to it, because that's what state does.

## Real-world example

Think about ordering at a **café counter** in two different ways.

| | Uncontrolled (plain HTML) | Controlled (React) |
|---|---|---|
| Where the order lives | Written on the customer's own bit of paper | Written in the café's ledger |
| Changing it | The customer scribbles on their paper | You tell the clerk, who writes it in the ledger |
| To find out the order | Ask to see their paper | Read the ledger |
| Who else can see it | Nobody, until they hand it over | Anyone in the café, all the time |
| Showing the running total | You can't, until the end | Trivially, from the ledger |

With the ledger, everything the café does — totals, offers, "we're out of that" — works from one source. There's a bit more ceremony to write an order in, but one thing is always true, everywhere.

## How it works

### One controlled input

```tsx
import { useState } from "react";

function NameForm() {
  const [name, setName] = useState("");

  return (
    <div>
      <label htmlFor="name">Your name</label>
      <input
        id="name"
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <p>Hello, {name || "stranger"}!</p>
    </div>
  );
}
```

Type in the box and the greeting updates on every keystroke. Follow the loop:

1. You press a key.
2. `onChange` fires. `event.target.value` is what's in the box now.
3. `setName` puts it in state.
4. React re-renders. `value={name}` puts the new text in the box.

So the letter you see isn't the one the browser put there. It's the one that came back from state. That round trip is the whole idea.

Three pieces, every time:

- **`value={name}`** — the box shows the state.
- **`onChange={...}`** — typing updates the state.
- **`useState("")`** — somewhere to keep it. Start with an empty string, not `undefined`.

And `<label htmlFor="name">` with a matching `id` is not optional politeness: it lets people click the label to focus the box, and it's what a screen reader announces ([chapter 38](../38-accessibility/notes.md)).

### `value` without `onChange`

Miss the `onChange` and React tells you:

```
You provided a `value` prop to a form field without an `onChange` handler.
This will render a read-only field.
```

You'll see this as a box you literally cannot type in. It's the same thing you saw in the chapter 07 exercises with the stuck tick box: React is putting the value back the way the state says, every time. The state just never changes.

If you genuinely want a read-only box, say so: add `readOnly`.

### Typing the change handler

Inline, TypeScript works it out ([chapter 07](../07-events/notes.md)):

```tsx
onChange={(event) => setName(event.target.value)}
```

Hover over `event`: `React.ChangeEvent<HTMLInputElement>`. Separately, you annotate:

```tsx
function handleNameChange(event: React.ChangeEvent<HTMLInputElement>) {
  setName(event.target.value);
}
```

For change events, `event.target` is typed properly (unusually — it's `event.currentTarget` you normally trust). Both work here.

### Several fields

The simple way is one `useState` per field:

```tsx
const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [message, setMessage] = useState("");
```

Slightly repetitive, completely clear, and each field is typed on its own. For up to about four fields, this is the right answer and you shouldn't feel clever about avoiding it.

For bigger forms, one object with one handler:

```tsx
type ContactForm = {
  name: string;
  email: string;
  message: string;
};

const [form, setForm] = useState<ContactForm>({
  name: "",
  email: "",
  message: "",
});

function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
  const { name, value } = event.target;
  setForm({ ...form, [name]: value });
}
```

```tsx
<input name="name" value={form.name} onChange={handleChange} />
<input name="email" value={form.email} onChange={handleChange} />
```

The `name` attribute on each input tells the handler which field to change, and `[name]: value` is a **computed property name** ([JavaScript chapter 11](../../JavaScript/11-objects/notes.md)). The `...form` spread is essential: without it you'd replace the whole object and lose the other fields.

Be aware of the trade: TypeScript can't check that `name="emial"` matches a real key here. That's one reason the separate-`useState` version is nicer while forms are small, and why [chapter 33](../33-react-hook-form/notes.md) exists for when they're big.

### Submitting

Put `onSubmit` on the `<form>` and stop the reload:

```tsx
function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    console.log("Sending", { name, email });
    setName("");
    setEmail("");
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="name">Name</label>
      <input id="name" value={name} onChange={(e) => setName(e.target.value)} />

      <label htmlFor="email">Email</label>
      <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

      <button type="submit">Send</button>
    </form>
  );
}
```

Points worth noticing:

- **`onSubmit` on the `<form>`, not `onClick` on the button.** Then pressing Enter in a text box submits too, which people expect.
- **`event.preventDefault()` first.** Without it the page reloads and every piece of state is wiped ([chapter 07](../07-events/notes.md)).
- **`type="submit"`** on the button. Inside a form, that's the default, but saying it is clearer.
- **Clearing the form is just setting the state back.** No DOM poking.

If a button inside a form shouldn't submit — a "Clear" button, say — give it `type="button"`, or it will submit the form.

### The other input types

Most inputs work like the text box. A few don't.

**Checkbox: `checked`, not `value`.**

```tsx
const [agreed, setAgreed] = useState(false);

<label>
  <input
    type="checkbox"
    checked={agreed}
    onChange={(event) => setAgreed(event.target.checked)}
  />
  I agree to the terms
</label>
```

State is a boolean, and you read `event.target.checked`. Putting the input inside the `<label>` is a neat alternative to `htmlFor`.

**Radio buttons: one piece of state for the whole group.**

```tsx
const [size, setSize] = useState("medium");

{["small", "medium", "large"].map((option) => (
  <label key={option}>
    <input
      type="radio"
      name="size"
      value={option}
      checked={size === option}
      onChange={(event) => setSize(event.target.value)}
    />
    {option}
  </label>
))}
```

`checked={size === option}` is what makes exactly one of them selected. They all need the same `name`.

**Select: `value` on the `<select>`.**

```tsx
const [country, setCountry] = useState("uk");

<select value={country} onChange={(event) => setCountry(event.target.value)}>
  <option value="uk">United Kingdom</option>
  <option value="np">Nepal</option>
</select>
```

This is different from HTML, where you'd put `selected` on an `<option>`. In React the `<select>` owns the value. Its event type is `React.ChangeEvent<HTMLSelectElement>`.

**Textarea: `value`, not text between the tags.**

```tsx
<textarea value={message} onChange={(event) => setMessage(event.target.value)} />
```

Again different from HTML, and again more consistent: everything is `value`. Its event type is `React.ChangeEvent<HTMLTextAreaElement>`.

**Number inputs still give you a string.**

```tsx
<input type="number" value={age} onChange={(event) => setAge(event.target.value)} />
```

`event.target.value` is **always** a string, even here. So either keep the state as a string and convert when you use it, or convert as you set it:

```tsx
const [age, setAge] = useState(0);

onChange={(event) => setAge(Number(event.target.value))}
```

Careful with the second one: clearing the box gives `""`, and `Number("")` is `0`, so the box refills itself with a `0` you can't delete. For inputs people edit freely, **keep the state as a string** and convert at the point of use. It's the pragmatic choice, and the one most real forms make.

### Validation, and when to show it

The simplest version is derived, calculated on every render:

```tsx
const [email, setEmail] = useState("");
const emailIsValid = email.includes("@") && email.includes(".");

<button type="submit" disabled={!emailIsValid}>Send</button>
{!emailIsValid && email !== "" && <p style={{ color: "crimson" }}>That doesn't look like an email.</p>}
```

Two things worth copying there:

- The error is a **derived value**, not state. It can't go stale.
- `email !== ""` stops the error shouting at someone who hasn't typed anything yet. Nobody likes a form that's angry before you start.

A common, kinder pattern is to show errors only after a field has been left, using `onBlur`:

```tsx
const [emailTouched, setEmailTouched] = useState(false);

<input
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  onBlur={() => setEmailTouched(true)}
/>
{emailTouched && !emailIsValid && <p>That doesn't look like an email.</p>}
```

Track "have they finished with this field yet?" and you've got a form that feels polite.

This is fine for small forms. It also clearly doesn't scale: three fields with three rules each is a lot of booleans. That's what [Zod](../32-zod/notes.md) and [React Hook Form](../33-react-hook-form/notes.md) are for in Level 4. Learn the plain version first so you know what they're doing for you.

(The browser's own `required`, `minLength` and `type="email"` are still worth adding. They cost nothing and they work before your JavaScript loads.)

### Uncontrolled inputs

You don't *have* to control every input. Left alone, an input keeps its own value, and you can give it a starting one with `defaultValue`:

```tsx
<input type="text" defaultValue="Maya" />
```

Then you read it when the form is submitted, using a ref ([chapter 19](../19-refs/notes.md)) — or, for a whole form at once, `FormData`.

**Use `defaultValue`, never `value`, for these.** `value` with no `onChange` gives you the read-only field from earlier.

It's genuinely useful for big forms you only read once, and for file inputs, which *must* be uncontrolled (the browser won't let you set a file input's value — imagine if a page could). But controlled is the default, and it's what the rest of this course uses.

**Don't switch between the two by accident:**

```
A component is changing an uncontrolled input to be controlled.
```

That warning means a `value` was `undefined` on the first render and a real string later. Start your state at `""`, not `undefined`, and it can't happen.

### What React 19 adds

React 19 lets you pass a function straight to a form's `action`, and adds hooks like `useActionState` for handling the result. They're built for React frameworks that run code on the server, so this course meets them in [chapter 39](../39-nextjs-and-server-components/notes.md). Everything here works exactly as described in React 19, and `onSubmit` isn't going anywhere.

## Common mistakes

**1. `value` with no `onChange`**

```
You provided a `value` prop to a form field without an `onChange` handler.
```

The box won't accept typing. Add the handler, or add `readOnly`.

**2. Starting state as `undefined`**

```tsx
const [name, setName] = useState<string>();   // undefined at first
```

Gives you the "changing an uncontrolled input to be controlled" warning as soon as someone types. Start at `""`.

**3. Forgetting `preventDefault`**

The page reloads, all state is lost, and the Console clears before you can read it. Turn on **Preserve log** if you're not sure that's what happened.

**4. `onClick` on the submit button instead of `onSubmit` on the form**

Works when clicked, does nothing on Enter. Half your users will think the form is broken.

**5. `value` on a checkbox**

```tsx
<input type="checkbox" value={agreed} />   // ❌
<input type="checkbox" checked={agreed} /> // ✅
```

Checkboxes use `checked`, and you read `event.target.checked`.

**6. Expecting a number from a number input**

```tsx
const total = price * quantity;   // "3" * 2 happens to work; "3" + 2 gives "32"
```

`event.target.value` is always a string. Convert deliberately, where you use it.

**7. Replacing the whole object instead of spreading it**

```tsx
setForm({ [name]: value });
// ❌ Type '{ [x: string]: string; }' is missing the following properties...
```

Spread the rest: `setForm({ ...form, [name]: value })`. TypeScript catches this one, which is a good reason to type your form object.

**8. A Clear button that submits the form**

```tsx
<button onClick={handleClear}>Clear</button>   // inside a <form>: submits!
<button type="button" onClick={handleClear}>Clear</button>   // ✅
```

**9. Inputs with no label**

`<input placeholder="Email" />` on its own is not accessible: the placeholder vanishes the moment someone types, and screen readers may not announce it. Use a real `<label>`.

## Quick recap

- A **controlled input** takes `value` from state and updates state in `onChange`. Your state is the truth; the box only displays it.
- The pattern is always `value={x}` + `onChange={(e) => setX(e.target.value)}` + `useState("")`.
- `value` with no `onChange` gives a read-only field and a warning. Start state at `""`, never `undefined`.
- `onSubmit` goes on the `<form>`, and `event.preventDefault()` is the first line of the handler. Clearing a form means resetting its state.
- Checkboxes use `checked` and `event.target.checked`. Radios share one piece of state and one `name`. `<select>` and `<textarea>` both use `value`, unlike in HTML.
- Number inputs still give strings. Keep the state as a string and convert where you use it.
- Validation can just be a derived value. Use `onBlur` to hold errors back until someone has finished with a field.
- Every input gets a real `<label>`.

---

**Next:** try the [exercises](exercises.md), then build the [10 Project: To-Do App, the React Way](../10-project-todo-app/notes.md).
