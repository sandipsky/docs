# 39 Project: Weather App: Exercises

**How to do these:**

- These are stretch goals for the app you built in the [notes](notes.md). Keep working in your `weather-app` folder, and open it with **Live Server** as before.
- Each exercise adds one feature, so you can do them in any order. Finish one before starting the next.
- Some of them ask you to add HTML or CSS. That's fine: it's your copy of the starter.
- Live weather changes all the time, so most checks describe what you should see rather than exact numbers.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): A background that matches the weather

Make the app feel alive: a bright sky for sunny days, gray for clouds, a darker blue for rain, pale for snow, and a dark sky for storms.

1. In `ui.js`, write `weatherGroup(code)`. It returns one of five words, using this table:

   | Group | Weather codes |
   |---|---|
   | `"clear"` | 0, 1 |
   | `"cloudy"` | 2, 3, 45, 48 |
   | `"rain"` | 51 to 67, 80 to 82 |
   | `"snow"` | 71 to 77, 85, 86 |
   | `"storm"` | 95 to 99 |

2. Whenever you show the current weather, put a class on `<body>` that matches: `weather-clear`, `weather-rain`, and so on. Remove the old one first, so there's only ever one.
3. In `style.css`, add one rule per group. Here's the first one, pick your own colors for the rest:

   ```css
   body.weather-rain {
     background: linear-gradient(180deg, #4a6d8c, #a9c1d9) fixed;
   }
   ```

Test your function in the console with `console.log(weatherGroup(0), weatherGroup(3), weatherGroup(61), weatherGroup(73), weatherGroup(95));`. Expected output:

```
clear cloudy rain snow storm
```

Then search for a few cities around the world until you find a rainy one, and watch the background change.

<details>
<summary>Hint 1</summary>

Check the ranges in order, from small codes to big ones, and `return` as soon as one matches. Once you know the code isn't `0` or `1`, `code <= 48` is enough for "cloudy".

</details>

<details>
<summary>Hint 2</summary>

`classList.remove` accepts several class names at once: `document.body.classList.remove("weather-clear", "weather-cloudy", ...)`.

</details>

---

## Exercise 2 (Easy): An offline message

On a train, the connection comes and goes. Instead of letting the next search fail, tell the user they're offline.

1. Add this paragraph to `index.html`, just above the `#status` paragraph:

   ```html
   <p id="offline" class="status error" hidden>You're offline. The weather shown may be out of date.</p>
   ```

2. `navigator.onLine` is `true` or `false`, and `window` fires an `offline` event when the connection drops and an `online` event when it comes back. Show the message when offline, and hide it again when online.
3. Also check once when the app starts, in case it loads while offline.
4. **Bonus:** when the connection comes back, load the current place's weather again, so it's fresh.

To test it, switch your Wi-Fi off and on, or use the **Offline** option in the Network tab of DevTools (Milestone 3).

> **Be honest with your users:** `navigator.onLine === false` means the device is definitely offline. But `true` only means it's connected to *a* network, not that the internet works (think of a café Wi-Fi that wants you to log in first). So keep your error handling from Milestone 3 too.

<details>
<summary>Hint</summary>

Write one small function that sets the paragraph's `hidden` property from `navigator.onLine`. Then call it from both event listeners and once at startup.

</details>

---

## Exercise 3 (Medium): Use my location

You're traveling and don't know the name of the town you're in. Add a button that shows the weather right where you are.

1. Add this button to `index.html`, just below the search form. The `unit-toggle` class gives it the same look as the °F button:

   ```html
   <button id="locate" class="unit-toggle" type="button">Use my location</button>
   ```

   If it feels cramped, give `#locate` a `margin-bottom: 16px;` in `style.css`.

2. The browser's **Geolocation API** finds the device's position: `navigator.geolocation.getCurrentPosition(onSuccess, onError)`. It uses callbacks ([chapter 30](../30-timers-and-callbacks/notes.md)), so wrap it in a promise ([chapter 31](../31-promises/notes.md)) and write a `getPosition()` you can `await`.
3. On success, the position has `coords.latitude` and `coords.longitude`. Show the weather for a place object like `{ name: "Your location", latitude, longitude }`. Your place label from Milestone 2 skips the missing parts, so the card says "Your location".
4. If it fails (the user said no, or the device can't tell), show an error: `Couldn't get your location. You can still search by name.`

Good to know:

- The browser asks the user for permission first. That's how it should be: a website shouldn't know where you are without asking.
- It only works on secure pages: `https://` addresses, or your own computer. Live Server's `http://127.0.0.1` address counts as your own computer, so you're fine.
- On a laptop without GPS, the position is a guess from nearby Wi-Fi networks. It can be a few kilometers off.
- The geocoding API you're using only searches by name. It can't turn coordinates back into a city name, which is why the card says "Your location".

<details>
<summary>Hint 1</summary>

`getCurrentPosition` wants two functions: one to call with the position, and one to call with an error. Inside `new Promise((resolve, reject) => { ... })`, you already have two functions like that.

</details>

<details>
<summary>Hint 2</summary>

The error object has a `code`: `1` means the user said no. You can log `error.message` while testing. To test the "no" path, click the icon at the left of the address bar and block location for the page.

</details>

---

## Exercise 4 (Medium): Favorite cities

You check the same three cities every day: home, work, and where your family lives. Let the user save favorites and open them with one click.

1. Add a save button at the end of the `#current` card, and an empty list just below the search form:

   ```html
   <button id="save-favorite" type="button">Save to favorites</button>
   ```

   ```html
   <ul id="favorites" class="favorites"></ul>
   ```

   There are no styles for these yet. Add your own to `style.css` if you like.

2. Keep the favorites as an array of place objects, saved in `localStorage` under the key `"favorites"`.
3. Clicking **Save to favorites** adds the current place, but never twice. Places from the geocoding API have an `id`, so compare those.
4. Show each favorite as a button with the place's name. Clicking it shows that city's weather. Give each one a small `×` button that removes it.
5. The favorites survive a refresh.

**Check:** save London, then save London again. There's still only one London in the list. Refresh the page: your favorites are still there.

(If you did Exercise 3, "Your location" has no `id`, so don't let the user save it.)

<details>
<summary>Hint 1</summary>

Write two small functions that return a **new** array instead of changing the old one ([chapter 16](../16-values-vs-references/notes.md)): `addFavorite(favorites, place)` and `removeFavorite(favorites, id)`. `some` ([chapter 13](../13-array-methods/notes.md)) tells you whether a place is already in the list, and `filter` removes one.

</details>

<details>
<summary>Hint 2</summary>

After every change: save to `localStorage`, then re-render the whole list. Re-rendering everything is simpler than updating one item, and for a handful of cities it's plenty fast.

</details>

---

## Exercise 5 (Challenge): An hourly temperature chart

"Will it get warmer this afternoon?" Answer it with a bar chart of the next 24 hours, made with nothing but `<div>`s and CSS.

1. Add a new card to `index.html`, between the current weather and the 7-day forecast:

   ```html
   <section id="hourly" class="card" hidden>
     <h2>Next 24 hours</h2>
     <div id="hourly-chart" class="hourly-chart"></div>
   </section>
   ```

2. Ask the forecast API for hourly data too, by adding two parameters: `hourly=temperature_2m` and `forecast_hours=24`. The answer then has an `hourly` object with two matching lists: `hourly.time` (24 texts like `"2026-09-24T12:00"`, starting from the current hour at that place) and `hourly.temperature_2m` (24 numbers).
3. Write `barHeights(temps)`. It turns the temperatures into bar heights, in %: the coldest hour gets `10`, the warmest gets `100`, and the others go in between, in proportion. Round each one with `Math.round`. If every temperature is the same, give every bar `50`.
4. Draw one `<div class="bar">` per hour, with its height set from `barHeights`, and a `title` like `12:00: 18°` so hovering a bar shows the details.
5. Add this to `style.css`:

   ```css
   .hourly-chart {
     display: flex;
     align-items: flex-end; /* bars grow up from the bottom */
     gap: 2px;
     height: 120px;
   }

   .bar {
     flex: 1;
     background: var(--accent);
     border-radius: 4px 4px 0 0;
   }
   ```

Test `barHeights` with these real temperatures from London (it works the same in the browser console or in Node):

```js
const temps = [17.9, 19.4, 20.5, 21.4, 22.3, 22.5, 21.8, 20.7, 19.2, 18.3, 17.5, 16.5,
  16.2, 16.2, 16.1, 15.9, 15.7, 15.4, 15.1, 14.9, 15.5, 16.5, 17.6, 18.5];
console.log(barHeights(temps).join(" "));
```

Expected output:

```
46 63 76 87 98 100 92 79 61 50 41 29 25 25 24 22 19 16 12 10 17 29 42 53
```

**Bonus:** under the chart, label every third hour (`12:00`, `15:00`, `18:00`, ...).

<details>
<summary>Hint 1</summary>

Find the coldest and warmest hour with `Math.min` and `Math.max`, spreading the array into them ([chapter 15](../15-destructuring-spread-rest/notes.md)). The distance between them is the "range".

</details>

<details>
<summary>Hint 2</summary>

For one temperature, `(temp - min) / (max - min)` is a number from `0` (coldest) to `1` (warmest). Stretch that to the 10 to 100 range, and `map` it over the whole array ([chapter 13](../13-array-methods/notes.md)).

</details>

<details>
<summary>Hint 3</summary>

The time texts all look like `"2026-09-24T12:00"`, so the hour is always at the same spot: `slice(11, 16)` gives `"12:00"` ([chapter 6](../06-strings/notes.md)). No `Date` needed, and no time zone trouble.

</details>

---

## Before you move on

Think about everything your app does "at the same time": it waits for `fetch`, runs debounce timers, and still reacts to every click and keystroke. Yet JavaScript runs only one piece of code at a time. So how does it juggle all of that without freezing?

[Chapter 40](../40-event-loop/notes.md) opens the hood and shows you the event loop.
