# 22 Forms

## What is it?

A **form** is the part of a web page where people type or choose things and send them off: a sign-up page, a search box, a checkout page, a "Leave a review" box.

In this chapter, you'll use JavaScript to read what people entered, check it, and react to it, all without reloading the page.

## Why does it matter?

Almost every app needs input from its users. Logging in, booking a table, ordering a pizza, leaving feedback: all of these are forms.

But people are people. They leave boxes empty, make typos in their email, and type "twenty" where you wanted `20`. If your code trusts every answer, bad data sneaks into your app.

With what you'll learn here, you can:

- read every kind of field: text, numbers, dropdowns, tick boxes and more,
- stop the page from reloading when the form is sent,
- catch mistakes and tell the user exactly how to fix them.

## Real-world example

Think of the paper sign-up form at a gym's front desk:

| At the gym | On a web page |
|---|---|
| The paper form | `<form>` |
| The blank boxes you write in | `<input>`, `<textarea>`, `<select>` |
| The words printed next to each box ("Full name") | `<label>` |
| The little star (*) that means "you must fill this in" | the `required` attribute |
| Tick boxes, and "choose one" circles | checkboxes and radio buttons |
| Handing the form to the receptionist | the `submit` event |
| The receptionist checking it: "You forgot your phone number" | validation |
| A sticky note next to the box you got wrong | an error message next to the field |
| A fresh, blank form for the next person | `form.reset()` |

Your JavaScript is the receptionist. It reads the form, checks it, and either accepts it or hands it back with helpful notes.

A good receptionist points at the exact box that needs fixing, instead of just saying "Wrong!" You'll learn to do the same.

## How it works

### The building blocks of a form

Forms are made of HTML elements, just like the ones you met in [chapter 20](../20-dom-basics/notes.md). Here's a small form for a cinema's newsletter:

```html
<form id="signup-form">
  <label for="name">Your name</label>
  <input id="name" name="name" type="text">

  <label for="email">Email</label>
  <input id="email" name="email" type="email">

  <button type="submit">Sign up</button>
</form>
```

- `<form>` wraps all the fields that belong together.
- `<input>` is a box to type in. Its `type` decides what kind of box it is.
- `<label>` is the text that goes with a field. Its `for` matches the field's `id`. You'll see why that matters at the end of this chapter.
- `name` is the field's name when the form is sent. You'll need it for `FormData` later on.
- `<button type="submit">` is the button that sends the form.

Here are the fields you'll use most:

| Element | What it's for | Example |
|---|---|---|
| `<input type="text">` | A short line of text | a name, a city |
| `<input type="email">` | An email address | `sam@example.com` |
| `<input type="number">` | A number (with small up and down arrows) | an age, a quantity |
| `<input type="password">` | Text that shows as dots | a password |
| `<textarea>` | Several lines of text | a review, a message |
| `<select>` with `<option>`s | A dropdown: pick one | a country, a plan |
| `<input type="checkbox">` | A tick box: on or off | "Send me offers" |
| `<input type="radio">` | Pick exactly one from a group | small, medium, large |

> **Tip:** `<input>` has no closing tag. It's a single tag, like `<img>`.

### Reading what the user typed: `.value`

Every text box, `<textarea>` and `<select>` has a `.value` property. It holds whatever is in the field right now.

```html
<input id="city" type="text">
<button id="check-button">Check weather</button>
```

```js
const cityInput = document.querySelector("#city");
const checkButton = document.querySelector("#check-button");

checkButton.addEventListener("click", () => {
  const city = cityInput.value.trim();
  console.log(`Looking up the weather in ${city}...`);
});
```

Type `  Lisbon ` (with a few spaces around it) and click the button:

```
Looking up the weather in Lisbon...
```

`trim()` from [chapter 06](../06-strings/notes.md) removes the spaces people type by accident. Use it on almost every text field.

Notice *where* the code reads `.value`: inside the click handler. The value changes as the user types, so read it at the moment you need it.

For a `<select>`, `.value` is the `value` of the chosen `<option>`:

```html
<select id="plan">
  <option value="monthly">Monthly: $30</option>
  <option value="yearly">Yearly: $300</option>
</select>
```

```js
const planSelect = document.querySelector("#plan");
console.log(planSelect.value); // prints: monthly
```

The first option is chosen until the user picks another one. The user sees "Monthly: $30", but your code gets `"monthly"`. That's handy: the text on screen can say anything, while the value stays short and easy to check.

### Form values are always strings

This one catches everybody. Even in a `type="number"` box, `.value` is a **string**.

Here's a page that adds a tip to a restaurant bill:

```html
<input id="bill" type="number">
<input id="tip" type="number">
<button id="total-button">Total</button>
<p id="total"></p>
```

```js
const billInput = document.querySelector("#bill");
const tipInput = document.querySelector("#tip");
const totalText = document.querySelector("#total");

document.querySelector("#total-button").addEventListener("click", () => {
  console.log(typeof billInput.value); // prints: string
  const total = billInput.value + tipInput.value;
  totalText.textContent = `Total: $${total}`;
});
```

Type `40` for the bill and `6` for the tip, and the page says `Total: $406`. Ouch. The `+` joined two strings, just like `"5" + 3` in [chapter 03](../03-data-types/notes.md).

The fix is to turn each value into a number with `Number()` before doing math. But there's one more trap:

| What's in the box | `.value` | `Number(value)` |
|---|---|---|
| `40` | `"40"` | `40` |
| `9.99` | `"9.99"` | `9.99` |
| nothing at all | `""` | `0` |
| `forty` (in a text box) | `"forty"` | `NaN` |

An empty box becomes `0`, not `NaN`. So if the user forgets the bill, your code quietly works with a $0 bill. Check for an empty value *before* converting:

```js
document.querySelector("#total-button").addEventListener("click", () => {
  if (billInput.value === "") {
    totalText.textContent = "Please enter the bill.";
    return; // stop here
  }
  const bill = Number(billInput.value);
  const tip = Number(tipInput.value);
  totalText.textContent = `Total: $${bill + tip}`;
});
```

Now `40` and `6` show `Total: $46`, and an empty bill shows the message. An empty *tip* still becomes `0`, and here that's fine: no tip means a $0 tip.

> **Tip:** In a `type="number"` box, the browser also gives you `""` when what's typed isn't a proper number. So the empty check catches that too.

### Checkboxes and radio buttons: `.checked`

A checkbox is either ticked or not. For checkboxes, use `.checked` instead of `.value`: it's `true` or `false`.

```html
<input id="gift-wrap" type="checkbox">
<label for="gift-wrap">Gift wrap (+$3)</label>
```

```js
const giftWrap = document.querySelector("#gift-wrap");
const price = 25;

giftWrap.addEventListener("change", () => {
  const total = giftWrap.checked ? price + 3 : price;
  console.log(`Total: $${total}`);
});
```

Tick the box, then untick it. You'll see:

```
Total: $28
Total: $25
```

The `change` event from [chapter 21](../21-events/notes.md) fires every time the box is ticked or unticked. The ternary from [chapter 07](../07-conditionals/notes.md) picks the right total.

**Radio buttons** come in groups, and the user can pick only one from each group. The buttons in a group share the same `name`. That's what ties them together:

```html
<fieldset>
  <legend>Size</legend>
  <input id="small" type="radio" name="size" value="small" checked>
  <label for="small">Small</label>
  <input id="medium" type="radio" name="size" value="medium">
  <label for="medium">Medium</label>
  <input id="large" type="radio" name="size" value="large">
  <label for="large">Large</label>
</fieldset>
```

The `checked` attribute makes "Small" the chosen one when the page loads. The `<fieldset>` draws a box around the group, and its `<legend>` is the group's title. You'll see why that helps at the end of the chapter.

To find out which one is chosen, ask for "the ticked one" with a selector:

```js
const chosenSize = document.querySelector("input[name='size']:checked");
console.log(chosenSize.value); // prints: small
```

- `input[name='size']` means "an `<input>` whose `name` is `size`". Square brackets pick elements by an attribute.
- `:checked` narrows it down to the one that's ticked right now.

If nothing in the group is chosen, `querySelector` finds nothing and returns `null`. Then `.value` crashes with `TypeError: Cannot read properties of null (reading 'value')`. To be safe, give one option `checked` from the start.

### Sending the form: the `submit` event

So far, you've used `click` on buttons. Forms have a better event: **`submit`**. It fires on the `<form>` whenever the user sends it, by clicking the submit button or by pressing Enter in a text box.

There's a catch, though. When a form is submitted, the browser's normal job is to send the data somewhere and load a new page. Our form has nowhere to send it, so the browser reloads the page. Everything your JavaScript changed is wiped out, and the console is cleared.

You met the fix in chapter 21: `event.preventDefault()` tells the browser "skip your normal job, I've got this".

Here it is with the cinema form from the start of the chapter:

```js
const form = document.querySelector("#signup-form");
const nameInput = document.querySelector("#name");

form.addEventListener("submit", (event) => {
  event.preventDefault(); // stop the page from reloading
  const name = nameInput.value.trim();
  console.log(`Thanks for signing up, ${name}!`);
});
```

Type `Priya` in the name box and click "Sign up" (or press Enter):

```
Thanks for signing up, Priya!
```

Two rules of thumb:

- **Listen for `submit` on the form, not `click` on the button.** `submit` catches every way of sending the form. It also waits until the browser's own checks have passed, as you'll see soon.
- **Every `<button>` inside a form is a submit button unless you say otherwise.** For a button that does something else, like "Show password", write `<button type="button">`.

### Reading the whole form at once: `FormData`

One `querySelector` per field gets tiring when a form has ten fields. **`FormData`** reads the whole form in one go. It collects every field that has a `name`, as pairs of names and values.

Here's a gym's sign-up form:

```html
<form id="gym-form">
  <label for="member">Name</label>
  <input id="member" name="member" type="text">

  <label for="plan">Plan</label>
  <select id="plan" name="plan">
    <option value="monthly">Monthly</option>
    <option value="yearly">Yearly</option>
  </select>

  <input id="classes" name="classes" type="checkbox">
  <label for="classes">Add group classes</label>

  <button type="submit">Join</button>
</form>
```

```js
const gymForm = document.querySelector("#gym-form");

gymForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(gymForm);
  console.log(formData.get("member"));

  const data = Object.fromEntries(formData);
  console.log(data);
});
```

Type `Marco`, choose "Yearly", tick "Add group classes", and click "Join". You'll see:

```
Marco
{ member: 'Marco', plan: 'yearly', classes: 'on' }
```

Here's what happened:

- `new FormData(gymForm)` took a snapshot of every field. It's the same `new` you used for `new Date()` in [chapter 19](../19-dates-and-times/notes.md).
- `formData.get("member")` looked up one value by its field's `name`.
- `Object.fromEntries(formData)` turned all the pairs into a plain object, like the ones in [chapter 11](../11-objects/notes.md). It's the opposite of `Object.entries()`.

Chrome's console shows objects a little differently, like `{member: 'Marco', plan: 'yearly', classes: 'on'}`, with a small arrow to open it up. It's the same data.

> **Tip:** Don't log the `FormData` itself. `console.log(formData)` shows `FormData {}`, which looks empty even when it isn't. Log `Object.fromEntries(formData)` instead.

A few things to know about `FormData`:

- **Only fields with a `name` are included.** A field without one is skipped, with no warning.
- **Every value is a string**, as always.
- **A ticked checkbox gives `"on"`** (or its `value`, if you gave it one). **An unticked checkbox is left out completely.** Untick "Add group classes" and you get `{ member: 'Marco', plan: 'yearly' }`. So check it with `data.classes === "on"`.
- **Radio buttons are easy:** `formData.get("size")` gives you the chosen one's value. No `:checked` needed.
- **Several checkboxes with the same name**, like pizza toppings: `formData.getAll("topping")` gives you an array of all the ticked ones. `Object.fromEntries` keeps only the last one, because an object can't have the same key twice.

### Built-in validation: let the browser check

**Validation** means checking that the input follows your rules before you accept it. The browser can do a lot of it for you. You add attributes to your fields:

| Attribute | The rule | Example |
|---|---|---|
| `required` | Can't be left empty | `<input name="name" required>` |
| `minlength`, `maxlength` | At least / at most this many characters | `<input name="username" minlength="3" maxlength="15">` |
| `type="email"` | Must look like an email address | `<input name="email" type="email">` |
| `min`, `max` | The smallest / largest number allowed | `<input name="age" type="number" min="16" max="99">` |
| `pattern` | Must match a pattern | `<input name="zip" pattern="[0-9]{5}">` |

When the user submits a form that breaks a rule, the browser:

1. stops the submission, so your `submit` handler **doesn't run at all**,
2. jumps to the first field with a problem,
3. shows a small bubble with a message like "Please fill out this field." (the exact words depend on your browser and language).

Here's a running club's sign-up form:

```html
<form id="club-form">
  <label for="runner">Name</label>
  <input id="runner" name="runner" type="text" required>

  <label for="age">Age</label>
  <input id="age" name="age" type="number" required min="16" max="99">

  <button type="submit">Join the club</button>
</form>
```

Click "Join the club" with the form empty, and the browser points at the name. Fill in a name and the age `12`, and it tells you the age must be 16 or more. Your `submit` handler only runs once every rule passes.

A few honest details:

- `minlength` doesn't complain about an *empty* field. If the field must be filled in, add `required` as well.
- `required` is happy with a name made of only spaces. Use `trim()` in your own check if that matters.
- A `type="number"` box only accepts whole numbers unless you add `step`. For prices, use `step="0.01"`.
- `type="email"` only checks the shape: some text, an `@`, then more text. It even lets `sam@example` through. And it can't know whether the address really exists.
- `pattern` uses a mini-language called regular expressions, which you'll learn in [chapter 37](../37-regular-expressions/notes.md). For now: `[0-9]` means "any digit", and `{5}` means "exactly five of them". So `[0-9]{5}` accepts `90210` and rejects `9021`.

You can run the same checks from JavaScript. `checkValidity()` works on one field or on the whole form, and returns `true` or `false`:

```js
const clubForm = document.querySelector("#club-form");
const ageInput = document.querySelector("#age");

ageInput.value = "12"; // setting .value from code, to test quickly
console.log(ageInput.checkValidity()); // prints: false
ageInput.value = "30";
console.log(ageInput.checkValidity()); // prints: true
console.log(clubForm.checkValidity()); // prints: false (the name is still empty)
```

### Your own checks with JavaScript

The built-in rules can't check everything. What about these?

- "The two passwords must match."
- "Usernames can't contain spaces."
- "Pick at least one day."

For rules like these, you write your own checks. And instead of a bubble, you show your own message right next to the field, where the user is looking.

Here's a sign-up form for a gaming website. Each field that needs a custom check gets an empty `<p>` under it, ready to hold an error message:

```html
<form id="account-form">
  <label for="username">Username</label>
  <input id="username" name="username" type="text" required minlength="3">
  <p id="username-error" class="error"></p>

  <label for="password">Password (at least 8 characters)</label>
  <input id="password" name="password" type="password" required minlength="8">

  <label for="confirm">Confirm password</label>
  <input id="confirm" name="confirm" type="password" required>
  <p id="confirm-error" class="error"></p>

  <button id="create-button" type="submit">Create account</button>
</form>
```

First, a function that checks the data and returns an object of error messages, one for each field with a problem:

```js
function getErrors(data) {
  const errors = {};
  if (data.username.includes(" ")) {
    errors.username = "Usernames can't contain spaces.";
  }
  if (data.password !== data.confirm) {
    errors.confirm = "The passwords don't match.";
  }
  return errors;
}
```

If nothing is wrong, you get back an empty object: `{}`.

Next, a function that puts the messages on the page:

```js
const usernameError = document.querySelector("#username-error");
const confirmError = document.querySelector("#confirm-error");

function showErrors(errors) {
  usernameError.textContent = errors.username ?? "";
  confirmError.textContent = errors.confirm ?? "";
}
```

`errors.username ?? ""` means "the username message, or an empty string if there isn't one" (`??` is from [chapter 07](../07-conditionals/notes.md)). The empty string matters: it wipes out an old message once the user has fixed the problem.

Finally, the submit handler puts it all together:

```js
const accountForm = document.querySelector("#account-form");

accountForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(accountForm));
  const errors = getErrors(data);
  showErrors(errors);

  if (Object.keys(errors).length > 0) {
    return; // something's wrong: stop here
  }
  console.log(`Welcome, ${data.username}!`);
});
```

`Object.keys(errors).length > 0` asks "is there at least one error?" (`Object.keys` is from chapter 11).

Try it with the username `lara croft`, the password `tombraider1`, and `tombraider2` to confirm. Both messages appear under their fields, and nothing is logged. Now change the username to `lara_croft`, make the passwords match, and submit again. The messages disappear, and you'll see:

```
Welcome, lara_croft!
```

A few good habits:

- Put messages in with `textContent`, never `innerHTML`. They might contain what the user typed ([chapter 20](../20-dom-basics/notes.md) explains the danger).
- Give the messages a class like `error`, so your CSS can make them stand out: `.error { color: crimson; }`.
- Remember that your `submit` handler only runs after the browser's built-in checks pass. So your custom checks only need to cover what HTML can't.

> **Watch out:** Checks in the browser are there to help the user. They don't protect anything, because anyone can switch them off in DevTools. A real app's server must check the data again. You'll learn more in [chapter 51](../51-security-basics/notes.md).

### Checking while the user types

Waiting until "Create account" to show problems works. But it's friendlier to give feedback while people type.

The `input` event fires on every keystroke. And because events bubble up ([chapter 21](../21-events/notes.md)), one listener on the form hears every field in it:

```js
const createButton = document.querySelector("#create-button");

accountForm.addEventListener("input", () => {
  const data = Object.fromEntries(new FormData(accountForm));
  const errors = getErrors(data);
  showErrors(errors);

  const isValid = accountForm.checkValidity() && Object.keys(errors).length === 0;
  createButton.disabled = !isValid;
});
```

The last two lines **disable the submit button while the form is invalid**. You met the `disabled` property in chapter 20: a disabled button is greyed out and can't be clicked. Pressing Enter won't submit the form either. `isValid` is only `true` when the browser's rules *and* your own rules all pass.

To start with the button greyed out, add `disabled` to it in the HTML:

```html
<button id="create-button" type="submit" disabled>Create account</button>
```

> **Watch out:** While the button is disabled, the user can't submit, so the browser never shows its bubbles. Your page has to explain the rules itself. That's why the password label says "(at least 8 characters)".

### Resetting the form

After a successful sign-up, the form should be empty again for the next person. `form.reset()` puts every field back the way it was when the page loaded.

Here's the finished submit handler. It replaces the one from before, with two new lines at the end:

```js
accountForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(accountForm));
  const errors = getErrors(data);
  showErrors(errors);

  if (Object.keys(errors).length > 0) {
    return;
  }
  console.log(`Welcome, ${data.username}!`);
  accountForm.reset();          // empty the form for the next person
  createButton.disabled = true; // and grey out the button again
});
```

"The way it was when the page loaded" isn't always empty. A field with a starting `value`, or a radio button marked `checked`, goes back to that.

Two things `reset()` doesn't do:

- **It only resets the fields.** Error messages, "Thanks!" notes, and anything else your code wrote on the page stay until you clear them.
- **It doesn't fire `input` events**, so the live check doesn't notice. That's why the handler greys out the button itself.

There's also `<button type="reset">`, which resets the form when clicked. Use it with care: one wrong click wipes out everything the user typed.

### Labels and accessibility

**Accessibility** (often written **a11y**, because there are 11 letters between the "a" and the "y") means building pages that everyone can use. That includes people who use a keyboard instead of a mouse, and people who use a **screen reader**: software that reads the page out loud.

Labels are the easiest win. When a `<label for="email">` is linked to an `<input id="email">`:

- Clicking the label puts the cursor in the field, or ticks the checkbox. A bigger target is easier to hit, especially on a phone.
- A screen reader reads the label out when the field is selected, so the user knows what to type. Without a label, they hear something vague, like "edit text".

You can also put the field *inside* the label. Then you don't need `for` and `id` at all:

```html
<label>
  Email
  <input name="email" type="email">
</label>
```

Remember the `<fieldset>` and `<legend>` around the radio buttons? They help in the same way. A screen reader says "Size" before it reads out the choices, so the user knows what they're choosing. Use them for any group of radio buttons or checkboxes.

> **Watch out:** A `placeholder` (the grey hint text in an empty box, like `placeholder="you@example.com"`) is not a label. It disappears as soon as you start typing, and then nobody remembers what the box was for.

## Common mistakes

**1. Reading `.value` too early**

```js
const nameInput = document.querySelector("#name");
const name = nameInput.value; // read once, when the page loads

form.addEventListener("submit", (event) => {
  event.preventDefault();
  console.log(`Hello, ${name}!`); // prints: Hello, !
});
```

Your script runs as soon as the page loads, before the user has typed anything. So `name` is `""` forever. Fix: read `nameInput.value` inside the handler.

**2. Forgetting `event.preventDefault()`**

```js
form.addEventListener("submit", () => {
  console.log("Sent!");
});
```

"Sent!" flashes in the console for a split second, then the page reloads and it's gone. You may also notice the form's data at the end of the address bar, after a `?`. Fix: take the `event` parameter and call `event.preventDefault()` first.

**3. Doing math with strings**

```js
const adults = document.querySelector("#adults").value;     // "2"
const children = document.querySelector("#children").value; // "3"
console.log(adults + children); // prints: 23
```

Two adults and three children make 23 cinema tickets? The values are strings, so `+` joined them. Fix: `Number(adults) + Number(children)` gives `5`. And remember that an empty box turns into `0`, so check for `""` first.

**4. Forgetting the `name` attribute**

```html
<input id="email" type="email">
```

```js
const data = Object.fromEntries(new FormData(form));
console.log(data.email); // prints: undefined
```

`FormData` only collects fields that have a `name`. An `id` isn't enough. Fix: `<input id="email" name="email" type="email">`.

**5. A button that submits by accident**

```html
<form id="login-form">
  <input id="password" name="password" type="password">
  <button id="show-button">Show password</button>
  <button type="submit">Log in</button>
</form>
```

Clicking "Show password" also sends the form, because every button inside a form is a submit button unless you say otherwise. Fix: `<button id="show-button" type="button">`.

## Quick recap

- Read text boxes, `<textarea>`s and `<select>`s with `.value`, and checkboxes with `.checked`. Read them inside a handler, when you need them.
- Form values are always strings. Check for `""`, then convert with `Number()`.
- Listen for `submit` on the form, and call `event.preventDefault()` to stop the page from reloading.
- `new FormData(form)` reads every field that has a `name`. `Object.fromEntries()` turns it into a plain object.
- Let HTML do the simple checks (`required`, `minlength`, `type="email"`, `min`/`max`, `pattern`). Add your own checks in JavaScript, and show their messages next to the fields.
- `form.reset()` resets the fields, but not your messages. And give every field a `<label>`.

---

**Next:** try the [exercises](exercises.md), then move on to [23 JSON and Local Storage](../23-json-and-local-storage/notes.md).
