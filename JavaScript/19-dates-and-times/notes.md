# 19 Dates and Times

## What is it?

JavaScript has a built-in **`Date`** object for working with dates and times: today's date, a birthday, a delivery time, the number of days until a holiday.

Each `Date` holds one exact moment in time.

## Why does it matter?

Almost every app deals with dates. Orders have timestamps. Library books have due dates. Posts say "3 days ago". Booking sites count nights. Gyms track when memberships run out.

Dates are also famously tricky:

- In JavaScript, January is month `0`, not month `1`.
- `03/04/2026` means March 4 in the United States, but 3 April in the United Kingdom.
- The same moment can be Sunday evening in New York and already Monday morning in Tokyo.

Knowing these traps ahead of time will save you from some of the most confusing bugs in programming.

## Real-world example

Picture a big football final that kicks off at one exact moment. Fans all over the world watch the same kickoff, live. But the TV guide in each country shows a different time:

| City | The TV guide says |
|---|---|
| London | Sunday, 8:00 PM |
| New York | Sunday, 3:00 PM |
| Kathmandu | Monday, 1:45 AM |
| Tokyo | Monday, 5:00 AM |

A JavaScript `Date` is like the kickoff itself: **one moment**, the same for everybody. When you ask a date for its hour, or print it nicely, JavaScript translates that moment into the clock reading for one particular place. Usually that's the time zone your computer is set to.

Notice that Kathmandu and Tokyo are already on Monday. Depending on where you are, even the *day* can be different. Keep that in mind: it's behind the most famous date bug of all, which you'll meet later in this chapter.

## How it works

### Creating a date

There are three common ways to make a date.

**1. Right now:**

```js
const now = new Date();
console.log(now); // prints something like: 2026-09-24T09:35:12.345Z
```

Your output will be different, because it's the moment you run it.

The time may also look wrong! Node prints dates in **UTC** (Coordinated Universal Time), the world's reference clock. Every time zone is measured from it: Nepal is UTC+5:45, and New York is UTC-5 in winter. The `Z` at the end means "this is UTC". You'll learn to show dates in your own time zone soon.

> The browser console prints dates differently, in your local time, like `Thu Sep 24 2026 15:20:12 GMT+0545 (Nepal Time)`.

**2. From an ISO string:**

```js
const launch = new Date("2026-03-14T09:30:00Z");
console.log(launch); // prints: 2026-03-14T09:30:00.000Z
```

**ISO format** is the international standard way to write a date: biggest part first (year, month, day), then a `T`, then the time. Everyone reads it the same way, which is why computers love it. The `Z` means the time is in UTC.

Stick to ISO format when you make a date from a string. Other formats, like `"03/04/2026"`, are guesswork.

**3. From parts:**

```js
const concert = new Date(2026, 2, 14, 19, 30); // year, month, day, hour, minute
console.log(concert.toDateString()); // prints: Sat Mar 14 2026
```

Wait, month `2` is March? Yes. **Months are counted from 0**: January is `0`, February is `1`, and December is `11`. Days of the month start at 1 as normal. This trips up everyone, so expect to see it again.

A date made from parts uses your computer's **local time**: the time zone your computer is set to. `toDateString()` prints the date part in a short, readable way. Unlike `console.log`, it uses local time too.

### Getting parts of a date

Once you have a date, you can ask it for each part:

```js
const concert = new Date(2026, 2, 14, 19, 30); // March 14, 2026, 7:30 PM

console.log(concert.getFullYear()); // prints: 2026
console.log(concert.getMonth());    // prints: 2   (March, counting from 0)
console.log(concert.getDate());     // prints: 14  (the day of the month)
console.log(concert.getDay());      // prints: 6   (Saturday)
console.log(concert.getHours());    // prints: 19
console.log(concert.getMinutes());  // prints: 30
```

| Method | Gives you | Watch out |
|---|---|---|
| `getFullYear()` | the year, like `2026` | |
| `getMonth()` | `0` to `11` | January is `0`! |
| `getDate()` | `1` to `31` | the day of the *month* |
| `getDay()` | `0` to `6` | the day of the *week*, and Sunday is `0` |
| `getHours()` | `0` to `23` | 24-hour clock |
| `getMinutes()`, `getSeconds()` | `0` to `59` | |

`getDay()` gives a number, so to show a name, use it as an index into an array ([chapter 10](../10-arrays/notes.md)). And add 1 to the month before showing it to a human:

```js
const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
console.log(dayNames[concert.getDay()]);                // prints: Saturday
console.log(`Month number: ${concert.getMonth() + 1}`); // prints: Month number: 3
```

These methods all read the date in your local time. Each one also has a UTC twin, like `getUTCHours()` and `getUTCDate()`, which reads it in UTC instead.

### Changing parts of a date

Every `get` method has a `set` partner: `setFullYear`, `setMonth`, `setDate`, `setHours`, `setMinutes`. They're handy for moving a date forward or back:

```js
const due = new Date(2026, 0, 25); // January 25, 2026
due.setDate(due.getDate() + 10);   // 10 days later
console.log(due.toDateString());   // prints: Wed Feb 04 2026
```

`25 + 10` is `35`, and there's no January 35th. JavaScript **rolls over** into the next month for you and gives you February 4th. It does the same for hours past 23, months past 11, and so on. That makes adding days easy, because you never have to worry about how long each month is.

Setters change the date object itself. Dates are objects, so if you want to keep the original, make a copy first by passing the old date to `new Date()`:

```js
const borrowed = new Date(2026, 0, 25);
const dueDate = new Date(borrowed); // a copy
dueDate.setDate(dueDate.getDate() + 14);

console.log(borrowed.toDateString()); // prints: Sun Jan 25 2026
console.log(dueDate.toDateString());  // prints: Sun Feb 08 2026
```

### Timestamps: a date is secretly a number

Under the hood, a date is just one number: how many milliseconds have passed since midnight UTC on January 1, 1970. That starting point is called the **Unix epoch**, and the number is called a **timestamp**. (A millisecond is a thousandth of a second.)

```js
const launch = new Date("2026-01-15T00:00:00Z");
console.log(launch.getTime()); // prints: 1768435200000

console.log(new Date(0).toISOString()); // prints: 1970-01-01T00:00:00.000Z
```

- `date.getTime()` gives you a date's timestamp.
- `new Date(timestamp)` turns a timestamp back into a date.
- `Date.now()` gives you the timestamp for right now, without making a date object.

`Date.now()` is perfect for measuring how long something takes:

```js
const start = Date.now();

let total = 0;
for (let i = 0; i < 50000000; i++) {
  total += i;
}

const elapsed = Date.now() - start;
console.log(`That took ${elapsed} ms`); // prints something like: That took 41 ms
```

Your number will be different. It depends on your computer, and it changes a little every run.

### Date math: counting days

Because dates are numbers underneath, you can subtract one from another. The answer is in milliseconds, so divide to get days:

```js
const today = new Date(2026, 8, 24);    // September 24, 2026
const holiday = new Date(2026, 11, 25); // December 25, 2026

const msPerDay = 1000 * 60 * 60 * 24;   // 86,400,000
const daysLeft = Math.round((holiday - today) / msPerDay);
console.log(`${daysLeft} days until the holiday`); // prints: 92 days until the holiday
```

Why `Math.round`? Many countries move their clocks for **daylight saving time**, so one day in a year is 23 hours long and another is 25. In London or New York, the division above gives `92.04166666666667`, because the clocks go back one hour in between. Rounding fixes that.

To add *calendar days*, use `setDate` like before. To add an exact amount of time, like hours on a parking ticket, add milliseconds to the timestamp:

```js
const parkedAt = new Date("2026-05-20T08:15:00Z");
const expires = new Date(parkedAt.getTime() + 2 * 60 * 60 * 1000); // 2 hours later
console.log(expires.toISOString()); // prints: 2026-05-20T10:15:00.000Z
```

### Comparing dates

`<` and `>` work on dates, because JavaScript compares their timestamps:

```js
const deadline = new Date(2026, 5, 30, 23, 59); // June 30, 11:59 PM
const submitted = new Date(2026, 6, 2, 10, 0);  // July 2, 10:00 AM

if (submitted > deadline) {
  console.log("Late submission!");
}
// prints: Late submission!
```

But `===` doesn't work the way you'd hope:

```js
const a = new Date(2026, 0, 1);
const b = new Date(2026, 0, 1);

console.log(a === b);                     // prints: false
console.log(a.getTime() === b.getTime()); // prints: true
```

Dates are objects, and `===` checks whether two objects are the *same object*, not whether they hold the same value ([chapter 16](../16-values-vs-references/notes.md)). To check if two dates are the same moment, compare their timestamps.

Subtraction also makes sorting easy. Remember compare functions from [chapter 13](../13-array-methods/notes.md)?

```js
const bookings = [
  { guest: "Ravi", checkIn: new Date(2026, 6, 18) },
  { guest: "Emma", checkIn: new Date(2026, 6, 3) },
  { guest: "Kenji", checkIn: new Date(2026, 6, 11) },
];

const byDate = bookings.toSorted((a, b) => a.checkIn - b.checkIn);
for (const booking of byDate) {
  console.log(booking.guest, booking.checkIn.toDateString());
}
```

You'll see:

```
Emma Fri Jul 03 2026
Kenji Sat Jul 11 2026
Ravi Sat Jul 18 2026
```

### Formatting dates for people

For computers, use `toISOString()`. It always gives the same format, in UTC:

```js
const launch = new Date("2026-03-14T09:30:00Z");
console.log(launch.toISOString()); // prints: 2026-03-14T09:30:00.000Z
```

For people, use `toLocaleDateString()` and `toLocaleTimeString()`. They format a date the way people in a particular place expect:

```js
const concert = new Date(2026, 2, 14, 19, 30);

console.log(concert.toLocaleDateString("en-US")); // prints: 3/14/2026
console.log(concert.toLocaleDateString("en-GB")); // prints: 14/03/2026
```

`"en-US"` and `"en-GB"` are **locales**: short codes for a language and a region. `en-US` is English as written in the United States, and `en-GB` is English as written in Great Britain. There are hundreds more, like `"fr-FR"` (French, France) and `"ja-JP"` (Japanese, Japan). If you leave the locale out, JavaScript uses your computer's settings, so the result can be different on another computer.

Add an **options** object to choose exactly which parts to show, and how:

```js
const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };

console.log(concert.toLocaleDateString("en-US", options)); // prints: Saturday, March 14, 2026
console.log(concert.toLocaleDateString("en-GB", options)); // prints: Saturday, 14 March 2026
console.log(concert.toLocaleDateString("fr-FR", options)); // prints: samedi 14 mars 2026

console.log(concert.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })); // prints: 7:30 PM
console.log(concert.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })); // prints: 19:30
```

The most useful options (these examples are for March 5th, 7:05 AM, in `en-US`):

| Option | Values you can use | Examples |
|---|---|---|
| `weekday` | `"long"`, `"short"` | `Thursday`, `Thu` |
| `year` | `"numeric"`, `"2-digit"` | `2026`, `26` |
| `month` | `"long"`, `"short"`, `"numeric"`, `"2-digit"` | `March`, `Mar`, `3`, `03` |
| `day` | `"numeric"`, `"2-digit"` | `5`, `05` |
| `hour`, `minute` | `"numeric"`, `"2-digit"` | `7:05 AM`, `07:05 AM` |

If you format lots of dates the same way, make a formatter once with **`Intl.DateTimeFormat`** and reuse it. It's the date version of `Intl.NumberFormat` from [chapter 05](../05-numbers-and-math/notes.md):

```js
const formatter = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" });

const fixtures = [new Date(2026, 7, 22), new Date(2026, 7, 29), new Date(2026, 9, 3)];
for (const match of fixtures) {
  console.log(formatter.format(match));
}
```

You'll see:

```
Sat 22 Aug
Sat 29 Aug
Sat 3 Oct
```

> **Watch out:** small details, like commas or short month names, can change between versions of Node and browsers. For example, the current `en-GB` rules shorten September to `Sept`, not `Sep`. That's fine on a web page, but don't write code that depends on the exact text.

### Time zones: UTC vs. local

Back to the football final. A date stores one moment. The methods you've seen read that moment in one of two ways:

- **Local time**: `getHours()`, `getDate()`, `toLocaleDateString()` and friends use your computer's time zone.
- **UTC**: `getUTCHours()`, `getUTCDate()`, and `toISOString()` use UTC.

You can also show a date in *any* time zone by passing a `timeZone` option. Time zones have names made of a region and a big city, like `"Europe/London"` or `"Asia/Kathmandu"`:

```js
const kickoff = new Date("2026-12-20T20:00:00Z");

const cities = [
  { city: "London", timeZone: "Europe/London" },
  { city: "New York", timeZone: "America/New_York" },
  { city: "Kathmandu", timeZone: "Asia/Kathmandu" },
  { city: "Tokyo", timeZone: "Asia/Tokyo" },
];

for (const { city, timeZone } of cities) {
  const time = kickoff.toLocaleString("en-US", { timeZone, weekday: "long", hour: "numeric", minute: "2-digit" });
  console.log(`${city}: ${time}`);
}
```

You'll see:

```
London: Sunday 8:00 PM
New York: Sunday 3:00 PM
Kathmandu: Monday 1:45 AM
Tokyo: Monday 5:00 AM
```

That's the TV guide from the start of the chapter. `toLocaleString()` works like `toLocaleDateString()`, but it can show the time as well.

### The famous "wrong day" bug

Here's a bug that has bitten almost every developer. Someone's birthday is January 15th:

```js
const birthday = new Date("2026-01-15");
console.log(birthday.getDate());
// prints: 15 in London, Kathmandu, or Tokyo
// prints: 14 in New York or Los Angeles!
```

What happened? A date-only string like `"2026-01-15"` is read as **midnight UTC**. When it's midnight in London, it's still 7 PM on January 14th in New York. So `getDate()`, which uses local time, says 14.

You can see both results on any computer by choosing the time zone yourself:

```js
console.log(birthday.toLocaleDateString("en-US", { timeZone: "UTC" }));              // prints: 1/15/2026
console.log(birthday.toLocaleDateString("en-US", { timeZone: "America/New_York" })); // prints: 1/14/2026
```

If you live east of London, like in Nepal or India, you won't see this bug on your own computer, because midnight UTC is already morning where you are. But your users in the Americas will. That's what makes it so sneaky.

To make it more confusing, the rules change when you add a time:

| You write | JavaScript reads it as |
|---|---|
| `new Date("2026-01-15")` | midnight **UTC** |
| `new Date("2026-01-15T00:00Z")` | midnight **UTC** |
| `new Date("2026-01-15T00:00")` | midnight in **your local time** |
| `new Date(2026, 0, 15)` | midnight in **your local time** |

**The fix:** for a date on the calendar with no real time attached (a birthday, a due date, a holiday), build it from parts: `new Date(2026, 0, 15)`. It means "January 15th, here", and it stays the 15th everywhere.

### Storing dates

When you save a date to use later, store it as an ISO string or a timestamp:

```js
const orderTime = new Date("2026-06-01T08:15:00Z");

const saved = orderTime.toISOString(); // "2026-06-01T08:15:00.000Z": safe to store
const loaded = new Date(saved);        // turn it back into a date later

console.log(loaded.getTime() === orderTime.getTime()); // prints: true
```

Don't store dates as formatted text like `"03/04/2026"` or `"Saturday, 14 March"`. Nobody can be sure what `03/04` means, and turning text like that back into a date is unreliable. Format a date only at the last moment, when you show it to a person.

In [chapter 23](../23-json-and-local-storage/notes.md), you'll save data in the browser, and dates turn into strings on the way. This is how you'll bring them back.

### Invalid dates

If JavaScript can't understand a date, you don't get an error. You get an **Invalid Date**:

```js
const bad = new Date("next Tuesday-ish");

console.log(bad);                         // prints: Invalid Date
console.log(bad.getTime());               // prints: NaN
console.log(Number.isNaN(bad.getTime())); // prints: true

bad.toISOString();
// RangeError: Invalid time value
```

An invalid date is still a date object, so it quietly travels through your program until something finally breaks. Guard against it early, just like in [chapter 18](../18-error-handling/notes.md):

```js
function parseDate(text) {
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Not a valid date: "${text}"`);
  }
  return date;
}
```

JavaScript won't catch every impossible date, though. `new Date(2026, 1, 30)` doesn't fail: February 30th rolls over to March 2nd. When impossible dates matter, check them yourself. You'll do exactly that in the exercises.

### What's next for dates: `Temporal`

`Date` is old (it dates back to 1995) and has well-known problems, like the months starting at 0. A much better replacement called **`Temporal`** is now officially part of JavaScript. As of 2026, it works in recent versions of Chrome, Edge, and Firefox, but not yet in Safari, and **not in Node 24.15.0**:

```js
console.log(typeof Temporal); // prints: undefined
```

Until it works everywhere, you'll keep meeting `Date` in real code, so everything in this chapter stays useful. There are also popular free libraries, like **date-fns** and **Day.js**, that make date work easier. You'll learn to install libraries in [chapter 50](../50-tooling/notes.md).

## Common mistakes

**1. Forgetting that months start at 0**

```js
const christmas = new Date(2026, 12, 25);
console.log(christmas.toDateString()); // prints: Mon Jan 25 2027
```

Month `12` doesn't exist, so it rolled over into January of the *next* year. December is `11`: `new Date(2026, 11, 25)`. And when you show a month number to a person, add 1.

**2. Mixing up `getDay` and `getDate`**

```js
const concert = new Date(2026, 2, 14);
console.log(`The concert is on the ${concert.getDay()}th`); // prints: The concert is on the 6th
```

`getDay()` is the day of the *week* (6 means Saturday). For the day of the *month*, use `getDate()`, which gives `14`. One way to remember it: `getDate` is the number you'd circle on a calendar.

**3. Changing a date you meant to keep**

```js
const checkIn = new Date(2026, 6, 3);
const checkOut = checkIn; // not a copy!
checkOut.setDate(checkOut.getDate() + 4);

console.log(checkIn.toDateString()); // prints: Tue Jul 07 2026
```

The guest's check-in date moved too. `checkOut` and `checkIn` point to the same date object ([chapter 16](../16-values-vs-references/notes.md)), and `setDate` changes that object. Make a real copy first: `const checkOut = new Date(checkIn);`

**4. Comparing dates with `===`**

```js
console.log(new Date(2026, 0, 1) === new Date(2026, 0, 1)); // prints: false
```

Two different date objects are never `===`, even for the same moment. Compare their timestamps with `getTime()` instead. `<` and `>` are fine as they are.

**5. Using `getYear()`**

```js
const payday = new Date(2026, 2, 14);
console.log(payday.getYear()); // prints: 126
```

`getYear()` is an old method from the 1990s that counts years from 1900. It only still exists so that old websites don't break. Always use `getFullYear()`.

## Quick recap

- Make dates with `new Date()` (now), an ISO string like `"2026-03-14T09:30:00Z"`, or parts like `new Date(2026, 2, 14)`. Months count from 0!
- `getFullYear`, `getMonth`, `getDate`, `getDay`, and `getHours` read the parts in local time. The `set` methods change them and roll over when needed.
- Underneath, a date is a timestamp: milliseconds since 1970. Subtract dates to get milliseconds, then divide and round to get days.
- Compare dates with `<` and `>`, or with `getTime()` for "the same moment". Never use `===`.
- Format dates for people with `toLocaleDateString` or `Intl.DateTimeFormat`, using a locale and options. For computers, use `toISOString()`.
- A date-only string like `"2026-01-15"` means midnight UTC, and it can show up as the day before. Build calendar dates from parts instead.
- Store dates as ISO strings or timestamps. `Temporal` is the better API on its way, but it isn't in Node 24.15.0.

---

**Next:** try the [exercises](exercises.md), then move on to [20 DOM Basics](../20-dom-basics/notes.md).
