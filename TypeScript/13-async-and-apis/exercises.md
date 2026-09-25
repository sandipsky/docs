# 13 Typing Async Code and APIs: Exercises

**How to do these:**

- Work in `playground/ch13/`, one file per exercise. You need to be online.
- Run with `node`, and check types with `npx tsc`. Every exercise must pass `npx tsc` with no errors.
- **Rule:** no `any`, and no `as`.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Type the waiting

Add types to this code so `npx tsc` is quiet. Every function needs a return type.

```ts
// no-check
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function brewCoffee(size) {
  await wait(500);
  return `Your ${size} coffee is ready`;
}

console.log(await brewCoffee("large"));
```

Expected output (after about half a second):

```
Your large coffee is ready
```

<details>
<summary>Hint</summary>

`wait` returns `Promise<void>`, and `brewCoffee` returns `Promise<string>`.

</details>

---

## Exercise 2 (Easy): A typed post

Fetch `https://jsonplaceholder.typicode.com/posts/1` and print its title. Create `interface Post` with `id`, `userId`, `title` and `body`, and annotate the result.

Expected output:

```
sunt aut facere repellat provident occaecati excepturi optio reprehenderit
```

Then misspell `title` as `tilte` in your `console.log`, and check that `npx tsc` catches it.

<details>
<summary>Hint</summary>

`const post: Post = await response.json();`

</details>

---

## Exercise 3 (Medium): Guard against bad data

Write `isPost(value: unknown): value is Post`, and a function `getPost(id: number): Promise<Post | null>` that returns `null` if the request fails (`!response.ok`) or the data isn't a post.

```ts
// no-check
const good = await getPost(1);
const missing = await getPost(9999);
console.log(good?.id, missing);
```

Expected output:

```
1 null
```

<details>
<summary>Hint</summary>

Post 9999 doesn't exist: the server answers with status 404 and an empty object `{}`. Your `response.ok` check handles the status, and your guard would catch the `{}` too.

</details>

---

## Exercise 4 (Challenge): Results instead of exceptions

Write `fetchResult<T>(url: string, guard: (value: unknown) => value is T): Promise<Result<T>>`, using the `Result<T>` type from the notes. It never throws: a network error, a bad status, or bad data all become `{ ok: false, error: "..." }`.

Then fetch user 1's todos from `https://jsonplaceholder.typicode.com/todos?userId=1`. You'll need a guard for an **array** of todos.

Expected output:

```
User 1 has 20 todos, 11 done
```

Also try a broken URL like `https://jsonplaceholder.typicode.com/nope`, and print the error message instead.

<details>
<summary>Hint 1</summary>

An array guard: `Array.isArray(value) && value.every(isTodo)`, with `value is Todo[]` as its return type.

</details>

<details>
<summary>Hint 2</summary>

Wrap the whole fetch in `try`/`catch`, and return `{ ok: false, error: ... }` from the `catch`, using the `instanceof Error` check from the notes.

</details>
