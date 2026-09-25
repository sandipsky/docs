# 04 Type Aliases and Interfaces: Exercises

**How to do these:**

- Work in `playground/ch04/`, one file per exercise.
- Run with `node`, and check types with `npx tsc`. Every exercise must pass `npx tsc` with no errors.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Name that shape

This code repeats the same object type three times. Create one `interface Song` and use it everywhere, so the shape is written only once.

```ts
// no-check
const song1: { title: string; artist: string; seconds: number } = { title: "Flowers", artist: "Miley Cyrus", seconds: 200 };
const song2: { title: string; artist: string; seconds: number } = { title: "Levitating", artist: "Dua Lipa", seconds: 203 };
const playlist: { title: string; artist: string; seconds: number }[] = [song1, song2];

let total = 0;
for (const song of playlist) {
  total += song.seconds;
}
console.log(`Playlist length: ${total} seconds`);
```

Expected output:

```
Playlist length: 403 seconds
```

<details>
<summary>Hint</summary>

Once you have `interface Song { ... }`, the array type becomes `Song[]`.

</details>

---

## Exercise 2 (Easy): Type aliases for clarity

A delivery app stores a location as a tuple and an ID as text. Create:

- `type Coordinates` for a `[latitude, longitude]` tuple.
- `type OrderId` for a string.
- `interface Delivery` with an `id` (OrderId), a `to` (Coordinates) and an optional `note` (string).

Create one delivery and print:

```
Order A-102 goes to 27.7172, 85.324
```

<details>
<summary>Hint</summary>

`type Coordinates = [number, number];`. Use destructuring to get the two numbers out of `to`.

</details>

---

## Exercise 3 (Medium): Extending

A gym has members, and some members are personal trainers.

1. `interface Member` with `name` (string) and `visits` (number).
2. `interface Trainer` that extends `Member` and adds `clients` (an array of strings).
3. Create one trainer, and print:

```
Dana has 12 visits and trains 2 clients: Asha, Ben
```

Then try creating a `Trainer` without `clients`, and read the error. Remove that line again.

<details>
<summary>Hint</summary>

`interface Trainer extends Member { clients: string[]; }`.

</details>

---

## Exercise 4 (Challenge): The same thing, two ways

Rewrite Exercise 3 using only `type` aliases and `&` instead of interfaces and `extends`. The output must stay exactly the same.

Then, in a comment at the top of your file, answer in your own words:

1. Which version do you find easier to read, and why?
2. Name one thing a `type` can do that an `interface` can't.

<details>
<summary>Hint</summary>

`type Trainer = Member & { clients: string[] };`. For question 2, look at the comparison table in the notes.

</details>
