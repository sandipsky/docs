# 08 Generics: Exercises

**How to do these:**

- Work in `playground/ch08/`, one file per exercise.
- Run with `node`, and check types with `npx tsc`. Every exercise must pass `npx tsc` with no errors, and must not use `any`.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): `last`

Write a generic `last<T>(items: T[]): T | undefined` that returns the last item.

```ts
// no-check
console.log(last(["Mon", "Tue", "Wed"]));
console.log(last([3, 1, 4]));
console.log(last([]));
```

Expected output:

```
Wed
4
undefined
```

Hover over the result of each call in VS Code, and check that the type matches.

<details>
<summary>Hint</summary>

`.at(-1)` from JavaScript chapter 10 already returns `undefined` for an empty array.

</details>

---

## Exercise 2 (Easy): A typed box

Create `interface Box<T>` with a `label` (string) and `contents` (T). Make a `Box<string[]>` for books and a `Box<number>` for coins, then print:

```
Books box holds 2 items
Coins box holds 150
```

<details>
<summary>Hint</summary>

`const books: Box<string[]> = { label: "Books", contents: ["Dune", "Coco"] };`. Then `books.contents.length` works, because TypeScript knows it's an array.

</details>

---

## Exercise 3 (Medium): Group by a key

Write `countBy<T>(items: T[], getKey: (item: T) => string): Map<string, number>`, which counts how many items share each key.

```ts
// no-check
const orders = [
  { id: 1, city: "Kathmandu" },
  { id: 2, city: "Pokhara" },
  { id: 3, city: "Kathmandu" },
];
const counts = countBy(orders, (order) => order.city);
console.log(counts);
```

Expected output:

```
Map(2) { 'Kathmandu' => 2, 'Pokhara' => 1 }
```

Notice that `order` in the callback needs no type: TypeScript knows it's one of the orders.

<details>
<summary>Hint</summary>

Create `new Map<string, number>()`, loop over the items, and use `(counts.get(key) ?? 0) + 1`.

</details>

---

## Exercise 4 (Challenge): A tiny typed store

Write a generic class `Store<T extends { id: number }>` that keeps a list of items and has:

- `add(item: T): void`
- `find(id: number): T | undefined`
- `remove(id: number): void`
- `count(): number`

```ts
// no-check
const store = new Store<{ id: number; title: string }>();
store.add({ id: 1, title: "Buy milk" });
store.add({ id: 2, title: "Call mum" });
store.remove(1);
console.log(store.count(), store.find(2)?.title, store.find(1));
```

Expected output:

```
1 Call mum undefined
```

Then try `store.add({ title: "No id" })` and read the error.

<details>
<summary>Hint 1</summary>

Inside the class: `private items: T[] = [];`. The class's `<T>` works just like a function's.

</details>

<details>
<summary>Hint 2</summary>

`remove` can replace the list with a filtered copy: `this.items = this.items.filter(...)`.

</details>
