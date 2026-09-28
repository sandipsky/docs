# 05 Conditional Rendering: Exercises

**How to do these:**

- Work in your practice app, one folder per exercise: `src/ch05/ex1/`, and so on. Change the `import` line in `src/App.tsx` to see the one you're working on.
- Nothing changes on its own yet, so to test a condition you change a prop by hand, save, and look. That feels clumsy. It's fixed in [chapter 08](../08-state/notes.md).
- Use the **Elements** tab in DevTools as well as the page. "Not there" and "there but empty" look identical on screen and completely different in the HTML.
- An exercise is done when the page looks right in **every** case you're asked to test, VS Code shows no red squiggles, `npx tsc -b` prints nothing, and the Console has no errors or warnings.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): The stray zero

Copy this into `src/ch05/ex1/Ex1.tsx`:

```tsx
type BasketProps = {
  itemCount: number;
  couponCode?: string;
};

function Basket({ itemCount, couponCode }: BasketProps) {
  return (
    <div>
      <h2>Your basket</h2>
      {itemCount && <p>{itemCount} items ready to check out.</p>}
      {couponCode && <p>Coupon applied: {couponCode}</p>}
    </div>
  );
}

function Ex1() {
  return (
    <div>
      <Basket itemCount={3} couponCode="SAVE10" />
      <Basket itemCount={0} />
    </div>
  );
}

export default Ex1;
```

1. Look at the page. The second basket shows something it shouldn't. What, and why?
2. Fix it, so an empty basket shows `Your basket is empty.` instead.
3. The coupon line has no bug. Explain in a comment why `couponCode && ...` is safe when `itemCount && ...` isn't.
4. Now try `<Basket itemCount={0} couponCode="" />`. What shows up? Is that a bug, or just luck?

<details>
<summary>Hint 1</summary>

Read "The `0` trap" in the notes. Then look at the table of what React shows for each value, back in [chapter 02](../02-jsx/notes.md).

</details>

<details>
<summary>Hint 2</summary>

For question 3, think about what `&&` gives back when the left side is falsy, and then what React does with *that particular* falsy value. `0` and `""` are both falsy, but React treats them differently.

</details>

---

## Exercise 2 (Easy): Train departure board

Build `src/ch05/ex2/Departure.tsx`. It takes:

| Prop | Type | Meaning |
|---|---|---|
| `destination` | text | where the train goes |
| `time` | text | e.g. `"14:32"` |
| `platform` | text, optional | not decided yet if missing |
| `minutesLate` | number | `0` means on time |
| `cancelled` | boolean | |

It shows, in this order:

1. The time and destination: `14:32 to Leeds`.
2. `Platform 4`, or `Platform TBC` when there's no platform yet.
3. A status line:
   - `Cancelled` in red when `cancelled` is `true`. When a train is cancelled, **nothing** about lateness is shown.
   - `On time` in green when it isn't late.
   - `10 minutes late` in orange when it is.

In `Ex2.tsx`, show four departures that between them cover every case: on time with a platform, late with a platform, on time with no platform, and cancelled.

<details>
<summary>Hint 1</summary>

Three cases for the status line means the ternary is going to get ugly. Look at "Option 5: a variable that holds JSX" in the notes.

</details>

<details>
<summary>Hint 2</summary>

For the platform, you want a fallback **value**, not a different element. `??` does that in one character pair. Read the last section before "Common mistakes".

</details>

---

## Exercise 3 (Medium): One card, four states

Real components usually have to handle "we're still loading", "it broke", "there's nothing", and "here it is". Build `src/ch05/ex3/WeatherCard.tsx` with these props:

```tsx
type Weather = {
  city: string;
  temperature: number;
  description: string;
};

type WeatherCardProps = {
  loading: boolean;
  error?: string;
  weather?: Weather;
};
```

The rules, in order:

1. While `loading` is `true`, show only `Loading the forecast...`. Nothing else.
2. Otherwise, if there's an `error`, show `Something went wrong: ` plus the message, in red.
3. Otherwise, if there's no `weather`, show `No forecast for this city yet.`
4. Otherwise, show the city as an `<h2>`, the temperature, and the description. Add `Wrap up warm!` **only** when the temperature is below 5.

In `Ex3.tsx`, show five cards covering all four states, plus one that triggers the "wrap up warm" line.

Then, in a comment, answer this: in case 4, TypeScript lets you write `weather.city` with no complaint, even though `weather` is optional. Why?

<details>
<summary>Hint 1</summary>

"In order" is the clue. Early returns handle "in order" beautifully: check the first case, return, check the next, return. No `else` needed anywhere.

</details>

<details>
<summary>Hint 2</summary>

For the question, read "TypeScript and narrowing" in the notes. Each early return removes one possibility from what's left below it.

</details>

<details>
<summary>Hint 3</summary>

Note that `temperature` can be `0` or below. Be careful with any condition you write about it, and don't put it on the left of an `&&`.

</details>

---

## Exercise 4 (Medium): Order status badge

An online shop shows an order's status as a coloured badge. Build `src/ch05/ex4/StatusBadge.tsx`:

```tsx
type OrderStatus = "pending" | "shipped" | "delivered" | "cancelled";
```

Each status has a label and a colour:

| Status | Label | Colour |
|---|---|---|
| `pending` | Waiting to be packed | `grey` |
| `shipped` | On its way | `steelblue` |
| `delivered` | Delivered | `green` |
| `cancelled` | Cancelled | `crimson` |

**Part 1.** Write it with a chain of `if`/`else if` above the `return`. Show all four in `Ex4.tsx`.

**Part 2.** Now rewrite it with **one lookup object** instead, typed so that TypeScript forces you to cover every status. The component's body should end up being about two lines.

**Part 3.** Add `"refunded"` to `OrderStatus`, but *don't* add it to your lookup object yet. Where does TypeScript put the red squiggle? Now go back to your Part 1 version and add `"refunded"` there too. Does it warn you? Write down which version you'd rather maintain, and why.

<details>
<summary>Hint 1</summary>

For Part 2, you need two things per status, so the object's values are little objects: `{ label: "...", colour: "..." }`. Give that shape a type alias of its own.

</details>

<details>
<summary>Hint 2</summary>

`Record<OrderStatus, Style>` is the type that says "one entry for every status". It's in the notes under "Option 6", and in [TypeScript chapter 09](../../TypeScript/09-utility-types/notes.md).

</details>

---

## Exercise 5 (Challenge): Library account page

This pulls in props, array methods, and everything from this chapter. In `src/ch05/ex5/`, start with `data.ts`:

```ts
export type Loan = {
  title: string;
  daysLate: number;
  renewable: boolean;
};

export type Account = {
  name: string;
  membershipEnds: string;
  loans: readonly Loan[];
};
```

Build these components, each in its own file:

**`LoanRow`** takes one `loan`. It shows the title, then:

- `Due back soon` when `daysLate` is `0`.
- `X days late — $Y fine` in red when it's late, at 25 cents a day, to two decimal places.
- A `Renew` button (it doesn't have to do anything yet) **only** when `renewable` is `true` **and** the loan isn't late. A late book can't be renewed.

**`AccountPage`** takes one `account`. It shows:

1. `Welcome back, Maya` as an `<h1>`.
2. A warning line, `⚠ Your membership ends on 2026-03-01`, shown **only** when `membershipEnds` is set. Make `membershipEnds` optional on the `Account` type so you can test both.
3. If there are no loans: `You have nothing on loan right now.` and **nothing else at all** — no summary, no list heading, no empty list.
4. Otherwise: a `You have 3 books on loan` line, a red `2 of them are overdue` line shown only when some are, and a `<LoanRow />` for each book. You don't know how to loop yet, so just write out three `<LoanRow />`s by hand with three different loans. ([Chapter 06](../06-rendering-lists/notes.md) fixes that in about one line.)

**Test all of these** and check the **Elements** tab each time, not just the page:

1. An account with three loans, one of them 4 days late.
2. The same account with no `membershipEnds`.
3. An account with an empty `loans` array. There should be no stray `0`, no empty `<p>`, and no leftover heading anywhere in the HTML.
4. A loan that is both `renewable: true` and 3 days late. No Renew button.

<details>
<summary>Hint 1</summary>

Build it one rule at a time and check the page after each. Five rules at once is five bugs at once.

</details>

<details>
<summary>Hint 2</summary>

For rule 3, that's a whole different page, not a missing line. Early return.

</details>

<details>
<summary>Hint 3</summary>

Watch out in rule 4: `loans.length` and the overdue count are both numbers, and both could be `0`. Neither belongs on the left of an `&&` on its own.

</details>

<details>
<summary>Hint 4</summary>

For the Renew button, two conditions have to be true at once. You can `&&` them together inside the brackets: `{a && b && <button>...</button>}`. If that gets hard to read, work out a `const canRenew = ...` above the `return` and use that instead. The second version is usually nicer, because the name explains the rule.

</details>
