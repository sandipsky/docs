# 09 Utility Types: Exercises

**How to do these:**

- Work in `playground/ch09/`, one file per exercise.
- Run with `node`, and check types with `npx tsc`. Every exercise must pass `npx tsc` with no errors.
- **Rule for all exercises:** write the base interface once, and build every variation with utility types. Don't copy properties by hand.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Edit a recipe

```ts
// no-check
interface Recipe {
  id: number;
  title: string;
  minutes: number;
  vegetarian: boolean;
}
```

Write `editRecipe(recipe: Recipe, changes: ...): Recipe` so that callers can change any fields they like. Then:

```ts
// no-check
const soup: Recipe = { id: 1, title: "Tomato soup", minutes: 30, vegetarian: true };
const faster = editRecipe(soup, { minutes: 20 });
console.log(faster.title, faster.minutes);
```

Expected output:

```
Tomato soup 20
```

<details>
<summary>Hint</summary>

The `changes` parameter is `Partial<Recipe>`.

</details>

---

## Exercise 2 (Easy): Hide the secret

```ts
// no-check
interface Account {
  id: number;
  username: string;
  email: string;
  passwordHash: string;
}
```

1. Create `type PublicAccount` without `passwordHash`.
2. Write `toPublic(account: Account): PublicAccount`.
3. Print the public version of one account.

Expected output (for username `maya_k`, id 3, email `maya@example.com`):

```
{ id: 3, username: 'maya_k', email: 'maya@example.com' }
```

<details>
<summary>Hint 1</summary>

`Omit<Account, "passwordHash">`.

</details>

<details>
<summary>Hint 2</summary>

TypeScript's types don't remove anything at run time. You still have to build the new object yourself, for example with `const { passwordHash, ...rest } = account;` from JavaScript chapter 15.

</details>

---

## Exercise 3 (Medium): Opening hours

Create `type Day = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";` and an `openingHours` object with a closing time for each day, typed with `Record`. Sunday is closed, stored as `null`.

Print:

```
mon: open until 18:00
sun: closed
```

Then delete one day from your object, and read the error.

<details>
<summary>Hint</summary>

The value type is `string | null`: `Record<Day, string | null>`.

</details>

---

## Exercise 4 (Challenge): Settings with defaults

```ts
// no-check
interface Settings {
  theme: "light" | "dark";
  fontSize: number;
  language: string;
}
```

Write `loadSettings(saved: Partial<Settings>): Readonly<Settings>`. It fills in any missing setting from these defaults: `light`, `16`, `en`. The result must be read-only.

```ts
// no-check
const settings = loadSettings({ theme: "dark" });
console.log(settings);
```

Expected output:

```
{ theme: 'dark', fontSize: 16, language: 'en' }
```

Then try `settings.fontSize = 20;` and read the error.

<details>
<summary>Hint</summary>

Keep the defaults in a `const defaults: Settings = { ... }`, then return `{ ...defaults, ...saved }`.

</details>
