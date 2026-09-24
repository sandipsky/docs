# 19 Dates and Times: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.js`, `ex2.js`, and so on).
- Run each one with `node ex1.js`.
- Every exercise uses fixed dates, so your output should match the expected output exactly, wherever you live.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Wedding invitation

Your friends are getting married on **Saturday, July 4th, 2026, at 3:05 PM**. Create that date from parts, then print these facts about it, using the date's `get` methods:

```
Year: 2026
Month: 7
Day: 4
Weekday: Saturday
Time: 15:05
Invitation: Saturday, 4 July 2026
```

**Rule:** don't type `7`, `Saturday`, or `05` yourself. Work them out from the date.

<details>
<summary>Hint 1</summary>

Remember that months count from 0 when you create the date, and add 1 back when you show it.

</details>

<details>
<summary>Hint 2</summary>

`getMinutes()` gives `5`, not `05`. Turn it into a string and use `padStart` from [chapter 06](../06-strings/notes.md). For the last line, use `toLocaleDateString` with the `"en-GB"` locale and an options object.

</details>

---

## Exercise 2 (Easy): Library late fee

A library lends books for **21 days**, and charges **$0.25 for each day** a book is late.

A member borrowed a book on **November 20th, 2026** and returned it on **December 15th, 2026**. Work out the due date and the late fee:

```
Borrowed: Friday, 20 November 2026
Due back: Friday, 11 December 2026
Returned: Tuesday, 15 December 2026
Days late: 4
Late fee: $1.00
```

**Rule:** the `borrowed` date must not change. Keep it in its own variable, and make a copy to work out the due date.

<details>
<summary>Hint 1</summary>

`setDate(date.getDate() + 21)` moves a date 21 days forward, and it handles the jump into December for you.

</details>

<details>
<summary>Hint 2</summary>

Subtract the due date from the return date to get milliseconds, then turn that into days. Don't forget `Math.round`.

</details>

**Bonus:** if the book comes back early, the fee should be `$0.00`, not a negative number. Try a return date of December 1st.

---

## Exercise 3 (Medium): What's coming up?

You're building the "Upcoming" panel of a calendar app. Pretend today is **September 24th, 2026**, and start with these events:

```js
const today = new Date(2026, 8, 24);

const events = [
  { name: "Dentist", date: new Date(2026, 9, 2) },
  { name: "Mum's birthday", date: new Date(2026, 8, 24) },
  { name: "Rent due", date: new Date(2026, 9, 1) },
  { name: "Concert", date: new Date(2026, 8, 20) },
  { name: "Holiday trip", date: new Date(2026, 9, 19) },
  { name: "Football match", date: new Date(2026, 8, 25) },
];
```

Print the events in date order, with a short label for how far away each one is:

```
Concert (Sun, Sep 20): 4 days ago
Mum's birthday (Thu, Sep 24): today!
Football match (Fri, Sep 25): tomorrow
Rent due (Thu, Oct 1): in 7 days
Dentist (Fri, Oct 2): in 8 days
Holiday trip (Mon, Oct 19): in 25 days
```

**Rule:** write a function `describe(days)` that turns a number of days into the label (`today!`, `tomorrow`, `in 7 days`, `4 days ago`). And use `Intl.DateTimeFormat` with the `"en-US"` locale for the dates in brackets.

<details>
<summary>Hint 1</summary>

Sort with `toSorted` and a compare function that subtracts one date from another. Look back at the guest bookings example in the notes.

</details>

<details>
<summary>Hint 2</summary>

If you ever see something like `in 24.958333333333332 days`, you forgot `Math.round`. That's exactly what happens in Sydney, where the clocks change in early October.

</details>

---

## Exercise 4 (Medium): Meeting across time zones

Your team works from four cities, and there's a video call on **October 5th, 2026 at 16:00 UTC**:

```js
const meeting = new Date("2026-10-05T16:00:00Z");

const team = [
  { name: "Aarav", city: "Kathmandu", timeZone: "Asia/Kathmandu" },
  { name: "Chloe", city: "London", timeZone: "Europe/London" },
  { name: "Diego", city: "Mexico City", timeZone: "America/Mexico_City" },
  { name: "Hana", city: "Tokyo", timeZone: "Asia/Tokyo" },
];
```

For each person, show the meeting in their own time, and whether it falls inside their work hours (9 AM up to 6 PM). Then count how many people it suits.

Expected output:

```
Meeting: 2026-10-05T16:00:00.000Z
Aarav (Kathmandu): Monday 9:45 PM - outside work hours
Chloe (London): Monday 5:00 PM - OK
Diego (Mexico City): Monday 10:00 AM - OK
Hana (Tokyo): Tuesday 1:00 AM - outside work hours
2 of 4 people can join during work hours.
```

<details>
<summary>Hint 1</summary>

The football final example in the notes shows a date in several time zones with the `timeZone` option. Destructuring in the `for...of` loop keeps it tidy.

</details>

<details>
<summary>Hint 2</summary>

To check the work hours, you need the hour as a number in *that person's* time zone. `getHours()` won't do, because it uses *your* time zone. Instead, format the date with only `{ timeZone, hour: "numeric" }` and the `"en-GB"` locale (24-hour clock). You'll get a string like `"21"`, which `Number()` can turn into `21`.

</details>

**Bonus:** try other meeting times (change the `16:00`) and find one that suits three of the four people.

---

## Exercise 5 (Challenge): Gym memberships

A gym keeps its sign-up sheet as text, and some dates were typed badly. Pretend today is **September 24th, 2026**:

```js
const today = new Date(2026, 8, 24);

const members = [
  { name: "Priya", joined: "2026-08-30", planDays: 30 },
  { name: "Tom", joined: "2026-09-10", planDays: 30 },
  { name: "Lina", joined: "2026-02-30", planDays: 90 },
  { name: "Marco", joined: "2026-06-15", planDays: 90 },
  { name: "Sven", joined: "2026-13-05", planDays: 30 },
  { name: "Ben", joined: "2026-08-25", planDays: 30 },
  { name: "Aiko", joined: "2026-09-20", planDays: 7 },
];
```

A membership runs out `planDays` days after the day someone joined.

1. Write **`parseDay(text)`**. It turns a string like `"2026-08-30"` into a date for that day in local time. If the date is impossible (like February 30th, or month 13), it throws a `RangeError` with the message `Invalid date: 2026-02-30`.
2. For every member, work out when their membership runs out and how many days are left. A bad date must not stop the others: collect a problem message instead.
3. Print the members with the soonest end date first, then the problems.

Expected output:

```
Marco: expired 11 days ago (Sun, Sep 13)
Ben: expires today (Thu, Sep 24)
Aiko: 3 days left (expires Sun, Sep 27)
Priya: 5 days left (expires Tue, Sep 29)
Tom: 16 days left (expires Sat, Oct 10)
Problems:
- Lina: RangeError - Invalid date: 2026-02-30
- Sven: RangeError - Invalid date: 2026-13-05
```

**Rule:** don't use `new Date("2026-08-30")`. You know why from the notes: it means midnight UTC, so in some time zones every day would come out one too early. And JavaScript doesn't even complain about `"2026-02-30"`: it quietly turns it into March 2nd.

<details>
<summary>Hint 1</summary>

`"2026-08-30".split("-")` gives `[ '2026', '08', '30' ]`. Turn those strings into numbers with `map((part) => Number(part))` ([chapter 13](../13-array-methods/notes.md)), destructure them into `year`, `month`, and `day` ([chapter 15](../15-destructuring-spread-rest/notes.md)), and build the date from parts. Remember the month!

</details>

<details>
<summary>Hint 2</summary>

`new Date(2026, 1, 30)` doesn't fail. It rolls over to March 2nd. That rollover is your clue: after building the date, check whether its year, month, and day are still the ones you asked for. If anything changed, the date was impossible, so throw.

</details>

<details>
<summary>Hint 3</summary>

Put the `try`/`catch` inside the loop over `members`, like in the grade importer from [chapter 18](../18-error-handling/notes.md). Keep the good results in one array (with each member's name, end date, and days left) and the problem messages in another. Sort the good ones by end date at the end.

</details>

---

## Before you move on

Everything you've built so far prints to the terminal. But a calendar app, a library system, or a gym dashboard would show all this on a web page.

In [chapter 20](../20-dom-basics/notes.md), you'll finally use JavaScript to change what's on a real web page. 🙂
