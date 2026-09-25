# 03 Arrays, Tuples and Objects: Exercises

**How to do these:**

- Work in `playground/ch03/`, one file per exercise.
- Run with `node`, and check types with `npx tsc`. Every exercise must pass `npx tsc` with no errors.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): A typed shopping list

Create an empty, typed shopping list. Add `"bread"`, `"milk"` and `"eggs"` with `push`, then print how many items there are and the list joined with commas.

Expected output:

```
3 items: bread, milk, eggs
```

Then try pushing a number, read the error, and remove that line again.

<details>
<summary>Hint</summary>

An empty array needs its type written out: `const list: string[] = [];`. `join(", ")` is from JavaScript chapter 10.

</details>

---

## Exercise 2 (Easy): Map pins

Store three places as tuples of `[name, latitude, longitude]`, in an array of tuples:

- Kathmandu, 27.7172, 85.324
- Pokhara, 28.2096, 83.9856
- Lumbini, 27.4833, 83.2767

Loop over them with destructuring and print:

```
Kathmandu is at 27.7172, 85.324
Pokhara is at 28.2096, 83.9856
Lumbini is at 27.4833, 83.2767
```

<details>
<summary>Hint</summary>

The type of one pin is `[string, number, number]`. The type of the whole list is `[string, number, number][]`. In the loop: `for (const [name, lat, lng] of pins)`.

</details>

---

## Exercise 3 (Medium): A typed movie list

Create an array of movies. Each movie has a `title` (string), a `year` (number), and an optional `rating` (number).

```ts
// no-check
{ title: "Inside Out 2", year: 2024, rating: 8 }
{ title: "Dune: Part Two", year: 2024 }
{ title: "Coco", year: 2017, rating: 9 }
```

Print each movie, with `not rated` when there's no rating:

```
Inside Out 2 (2024): 8/10
Dune: Part Two (2024): not rated
Coco (2017): 9/10
```

<details>
<summary>Hint 1</summary>

The type of the array is `{ title: string; year: number; rating?: number }[]`.

</details>

<details>
<summary>Hint 2</summary>

`rating` might be `undefined`, so check it before printing, or use `??` from JavaScript chapter 07.

</details>

---

## Exercise 4 (Challenge): Bank accounts with read-only IDs

Create an array of bank accounts. Each account has a `readonly id` (number), an `owner` (string) and a `balance` (number).

1. Start with two accounts: id 1, owner "Asha", balance 500; id 2, owner "Ben", balance 120.
2. Write a loop that adds 5% interest to every balance (round to 2 decimal places with `Math.round(x * 100) / 100`).
3. Print every account.
4. Try to change an account's `id` inside the loop, and read the error. Then remove that line.

Expected output:

```
#1 Asha: 525
#2 Ben: 126
```

<details>
<summary>Hint</summary>

`readonly` goes in front of the property name in the type: `{ readonly id: number; owner: string; balance: number }[]`. The balance is not read-only, so you can update it.

</details>
