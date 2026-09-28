# 06 Rendering Lists: Exercises

**How to do these:**

- Work in your practice app, one folder per exercise: `src/ch06/ex1/`, and so on.
- **Keep the Console open (`F12`) for every single one of these.** Key problems show up there and nowhere else.
- An exercise is done when the page looks right, the Console is completely empty, VS Code shows no red squiggles, and `npx tsc -b` prints nothing.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Your first list

In `src/ch06/ex1/Ex1.tsx`, start with this array:

```tsx
const languages = ["JavaScript", "TypeScript", "Python", "SQL", "Go"];
```

1. Show them as a `<ul>` with one `<li>` each. Don't write any `<li>` by hand.
2. Above the list, show `You are learning 5 languages.` — with the number worked out, not typed in.
3. Below it, show a second list of only the languages whose name contains the letter `S`. Give that list its own heading.

Then break it on purpose and write down what happens each time:

4. Change `map` to `forEach`. What's on the page? What's in the Console?
5. Put it back, then delete the `key`. What's on the page? What's in the Console?
6. Change one array item so the array is `["Go", "Go", "Python"]`. With `key={language}`, what does the Console say?

<details>
<summary>Hint 1</summary>

For question 6, read mistake 4 in the notes. This is why a name is only a safe key when it really is unique.

</details>

<details>
<summary>Hint 2</summary>

For the filtered list, `includes` tells you whether a string contains another one ([JavaScript chapter 06](../../JavaScript/06-strings/notes.md)). Chain it: `.filter(...).map(...)`, or make a `const` above the `return`.

</details>

---

## Exercise 2 (Easy): The café menu, for real

Finally do the menu properly. In `src/ch06/ex2/`, start with `data.ts`:

```ts
export type Drink = {
  id: number;
  name: string;
  price: number;
  vegan: boolean;
};

export const drinks: Drink[] = [
  { id: 1, name: "Espresso", price: 2.5, vegan: false },
  { id: 2, name: "Latte", price: 3.5, vegan: false },
  { id: 3, name: "Oat Flat White", price: 3.75, vegan: true },
  { id: 4, name: "Mint Tea", price: 2, vegan: true },
  { id: 5, name: "Hot Chocolate", price: 3.2, vegan: false },
];
```

Build two components:

- **`MenuItem`** takes one `drink` and shows its name, its price to two decimal places, and the word `Vegan` only when it should be. (You can reuse your chapter 04 version.)
- **`Menu`** takes a `drinks` prop — a **readonly array** of `Drink` — and renders a `<MenuItem />` for each one, plus a heading saying how many drinks there are.

`Ex2.tsx` imports the data and passes it in: `<Menu drinks={drinks} />`.

Then:

1. Add a `<Menu />` showing only the vegan drinks, with its own heading.
2. Add a `<Menu />` showing only drinks over $10. It should say `No drinks match.` instead of an empty box. Make sure this doesn't break the other two menus.
3. Inside `Menu`, try `drinks.sort((a, b) => a.price - b.price)`. What does TypeScript say, and why is it right to stop you?
4. Fix question 3 so the menu really is sorted by price, cheapest first, without upsetting TypeScript.

<details>
<summary>Hint 1</summary>

For question 2, the empty check belongs inside `Menu`, so every menu gets it for free. An early return is the cleanest way.

</details>

<details>
<summary>Hint 2</summary>

For question 4, see "Careful with `sort`" in the notes. You need a copy: `[...drinks]` or `toSorted`.

</details>

---

## Exercise 3 (Medium): Prove the key bug

This exercise makes the address-label problem happen on your own screen. It's the most useful thing in this chapter, so don't skip it.

In `src/ch06/ex3/Ex3.tsx`:

```tsx
const tasks = [
  { id: 1, text: "Buy milk" },
  { id: 2, text: "Book the dentist" },
  { id: 3, text: "Call grandma" },
];

function Ex3() {
  return (
    <ul>
      {tasks.map((task, index) => (
        <li key={index}>
          <input type="checkbox" /> {task.text}
        </li>
      ))}
    </ul>
  );
}

export default Ex3;
```

**Part 1: see it break.**

1. Run it and tick the box next to **Book the dentist**. Leave the other two alone.
2. Now, *without refreshing the page*, edit the array in your code: add `{ id: 4, text: "Walk the dog" }` at the **front**. Save. Vite swaps the file in without reloading, so the tick boxes keep whatever you set.
3. Which task is ticked now? Write it down. Is it the one you ticked?

**Part 2: fix it.** Change the key to `task.id`. Refresh, tick "Book the dentist" again, and add a fifth task at the front. Does the tick follow its task now?

**Part 3: explain it.** In a comment, write two or three sentences on why the tick moved in Part 1 and not in Part 2. Say what React compared in each case.

**Part 4: when is the index fine?** Write a small `<Legend />` component that maps over `["Red", "Amber", "Green"]` with `key={index}` and explain in a comment why that's genuinely fine here.

<details>
<summary>Hint 1</summary>

If step 2 reloads the whole page and clears your tick, add the task while the page is still open and watch carefully. If it still resets, tick the box again after the save and then move a task from the front to the end instead.

</details>

<details>
<summary>Hint 2</summary>

The tick box isn't in your array anywhere. That's the point: the browser is keeping it, attached to a particular `<li>`. React decides which `<li>` is "the same one as before", and the key is how it decides.

</details>

---

## Exercise 4 (Medium): Grouped shopping list

Lists inside lists. In `src/ch06/ex4/`, start with:

```ts
export type Item = {
  id: number;
  name: string;
  quantity: number;
};

export type Aisle = {
  id: number;
  name: string;
  items: Item[];
};

export const aisles: Aisle[] = [
  {
    id: 1,
    name: "Fruit and veg",
    items: [
      { id: 11, name: "Apples", quantity: 6 },
      { id: 12, name: "Carrots", quantity: 3 },
    ],
  },
  {
    id: 2,
    name: "Dairy",
    items: [{ id: 21, name: "Milk", quantity: 2 }],
  },
  { id: 3, name: "Bakery", items: [] },
];
```

Build a page that shows:

```
Shopping list — 11 things to buy

Fruit and veg (2 items)
  Apples × 6
  Carrots × 3

Dairy (1 item)
  Milk × 2

Bakery
  Nothing needed from here.
```

Rules:

- Two components: `AisleSection` (takes one aisle) and `ItemRow` (takes one item).
- The `11` at the top is the total **quantity** across every aisle, worked out, not typed.
- `(2 items)` must say `(1 item)` when there's only one, and must not appear at all for an empty aisle.
- An empty aisle shows `Nothing needed from here.` instead of an empty list.
- The Console must be completely empty.

<details>
<summary>Hint 1</summary>

For the total, you need to reach inside each aisle. `flatMap` gives you one flat array of all the items, and then `reduce` adds the quantities up. Or `reduce` over the aisles and `reduce` again inside. Either is fine.

</details>

<details>
<summary>Hint 2</summary>

`(1 item)` versus `(2 items)` is a ternary on `items.length === 1`. Careful with the "must not appear at all" case: that's a third possibility, so consider working the whole label out above the `return`.

</details>

<details>
<summary>Hint 3</summary>

Each `map` needs its own keys, and they only have to be unique among their own siblings. The `id`s in this data are unique across the whole file anyway, which is common but not required.

</details>

---

## Exercise 5 (Challenge): Leaderboard

In `src/ch06/ex5/`, build a leaderboard for a running club. Start with:

```ts
export type Runner = {
  id: string;
  name: string;
  club: string;
  timeSeconds: number;
  finished: boolean;
};

export const runners: Runner[] = [
  { id: "a1", name: "Maya", club: "Mill Lane", timeSeconds: 1284, finished: true },
  { id: "b2", name: "Tom", club: "Riverside", timeSeconds: 1190, finished: true },
  { id: "c3", name: "Priya", club: "Mill Lane", timeSeconds: 1352, finished: true },
  { id: "d4", name: "Sam", club: "Riverside", timeSeconds: 0, finished: false },
  { id: "e5", name: "Ana", club: "Mill Lane", timeSeconds: 1190, finished: true },
];
```

The page should show:

```
Race results

1. Tom (Riverside) — 19:50  🥇
1. Ana (Mill Lane) — 19:50  🥇
3. Maya (Mill Lane) — 21:24
4. Priya (Mill Lane) — 22:32

Did not finish: Sam
```

Requirements:

1. Only finished runners are in the numbered list, sorted fastest first. **Don't change the `runners` array** while you do it.
2. Times show as `minutes:seconds` with the seconds always two digits (`19:50`, not `19:5`).
3. Runners on the same time share a position, and the next position skips accordingly (see how `3` follows two runners at `1`). Give every runner on the fastest time a 🥇.
4. The "Did not finish" line lists the unfinished runners by name, separated by commas. If everyone finished, that line doesn't appear at all.
5. A `ClubTally` component underneath shows how many finishers each club had, one line per club, worked out from the data. Don't type the club names in anywhere.

Test it by adding a sixth runner, by making everyone finish, and by making nobody finish. The page should hold up every time, and the Console should stay empty.

<details>
<summary>Hint 1</summary>

Do the work above the `return`, in stages, with a named `const` for each: the finishers, the sorted list, the unfinished ones. Don't try to do it all in one chain.

</details>

<details>
<summary>Hint 2</summary>

For the shared positions: a runner's position is "how many runners are strictly faster than me, plus one". That rule gives you the skipping behaviour for free, and it's easier than tracking a counter.

</details>

<details>
<summary>Hint 3</summary>

For two-digit seconds, `String(seconds).padStart(2, "0")` ([JavaScript chapter 06](../../JavaScript/06-strings/notes.md)). `Math.floor(total / 60)` gives the minutes and `total % 60` the seconds.

</details>

<details>
<summary>Hint 4</summary>

For `ClubTally`, `reduce` into an object gives you `{ "Mill Lane": 3, Riverside: 1 }`. Then `Object.entries` turns that object into an array of `[name, count]` pairs, which you can `map` over. Each pair is a tuple ([TypeScript chapter 03](../../TypeScript/03-arrays-tuples-objects/notes.md)), so you can destructure it right in the callback. A `Map` works too ([JavaScript chapter 35](../../JavaScript/35-map-and-set/notes.md)).

</details>

<details>
<summary>Hint 5</summary>

For the comma-separated names in rule 4, you don't need `map` at all. `join(", ")` on an array of names does it in one go.

</details>
