# 39 Project: Weather App

## What you'll build

A real weather app that runs in the browser and uses **live data** from the internet. Type a city, pick it from the suggestions, and see the weather right now plus the next seven days:

```
Weather Now                                   [ Switch to °F ]

[ Lon                                    ]  [ Search ]
    London, England, United Kingdom          <- suggestions appear
    London, Ontario, Canada                     while you type
    ...

London, England, United Kingdom
☀️ 17°C
Clear sky
Feels like 15°C     Humidity 60%     Wind 7 km/h

7-day forecast
Today    [icon]    rain 0%     22°  13°
Fri      [icon]    rain 3%     23°  15°
Sat      [icon]    rain 8%     19°  14°
...
```

By the end, your app will:

- find cities by name, with suggestions as you type
- show the current temperature, "feels like", humidity, wind, and a weather emoji
- show a 7-day forecast with day names
- show clear loading and error messages ("City not found", "No connection")
- switch between °C and °F
- remember the last city you looked at, even after a refresh

The weather data comes from **Open-Meteo**, a weather service that's free for non-commercial projects like this one. It needs no account and no API key, so you can start straight away. In return, they ask you to credit them, which is why the starter page has "Weather data by Open-Meteo.com" at the bottom.

This is the Level 3 project. It pulls together a lot of what you've learned:

| Chapter | Where you'll use it |
|---|---|
| [13 Array Methods](../13-array-methods/notes.md) | Turning API results into things on the page |
| [15 Destructuring](../15-destructuring-spread-rest/notes.md) | Pulling `current` and `daily` out of a response |
| [18 Error Handling](../18-error-handling/notes.md) | `try`/`catch` around every request |
| [19 Dates and Times](../19-dates-and-times/notes.md) | Day names for the forecast |
| [20](../20-dom-basics/notes.md), [21](../21-events/notes.md), [22](../22-forms/notes.md) DOM, Events, Forms | Showing data, reacting to typing, the search form |
| [23 JSON and Local Storage](../23-json-and-local-storage/notes.md) | Remembering the last city |
| [29 Modules](../29-modules/notes.md) | Splitting the app into `api.js`, `ui.js`, and `main.js` |
| [32 Async/Await](../32-async-await/notes.md), [33 Fetch and APIs](../33-fetch-and-apis/notes.md) | Every request to the weather service |
| [34 Debounce and Throttle](../34-debounce-and-throttle/notes.md) | Suggestions as you type, without flooding the server |

Your numbers will be different from the ones in this guide, of course. The weather changes!

## Before you start

### Set up your folder

1. Copy the [`starter`](starter/) folder and name the copy `weather-app`. Work in the copy, so the original stays clean if you ever want to start over.
2. Inside `weather-app`, create three empty files: `api.js`, `ui.js`, and `main.js`.
3. Right-click `index.html` in VS Code and choose **Open with Live Server**. The app uses ES modules, and browsers block modules loaded straight from a file, so double-clicking won't work ([chapter 29](../29-modules/notes.md)).
4. Press `F12` to open the console. Keep it open the whole time.

You should see the title, the search box, and the footer. Everything else is hidden until your code shows it.

The starter gives you three files you don't need to change:

- `index.html`: the page. Its comments show the HTML your code should create for suggestions and forecast days.
- `style.css`: the looks. It works on phones too.
- `weather-codes.js`: the weather service describes the weather with a number, like `3`. This file turns each number into words and an emoji: `weatherCodes[3]` is `{ description: "Overcast", emoji: "☁️" }`.

### How the files fit together

Each file has one job. Think of a restaurant:

| File | Its job | In a restaurant |
|---|---|---|
| `api.js` | Talks to the weather service: builds URLs, calls `fetch`, returns data. Never touches the page. | The waiter, who takes your order to the kitchen and brings back the food |
| `ui.js` | Puts data on the page: text, lists, messages. Never calls `fetch`. | The staff who lay the food out nicely on your table |
| `main.js` | Listens to events, remembers what's going on, and decides what happens next. | The manager, who tells everyone what to do and when |

```
main.js ──imports──> api.js
   │
   └─────imports──> ui.js ──imports──> weather-codes.js
```

Why split it up? Each file stays small, and when something breaks, you know where to look. If the weather service ever changes, only `api.js` needs fixing.

Here's a plan for what each file exports. The names are only a suggestion: pick your own if you like, as long as you're consistent.

- `api.js`: `searchCities(name, signal)` and `getForecast(latitude, longitude, unit)`
- `ui.js`: functions like `showStatus(message, isError)`, `renderCurrent(place, forecast)`, `renderForecast(forecast)`, and `renderSuggestions(places, onSelect)`
- `main.js`: exports nothing. It's the file `index.html` loads, and it imports the other two.

> **Tip:** build one small step at a time, and check the console after every change. A red error message is your friend: it tells you the file and the line.

## The two APIs

The weather service needs a **latitude** and **longitude**: two numbers that pin down any spot on Earth (how far north or south, and how far east or west). People type city names, not numbers. So the app uses two APIs, one after the other:

1. **Geocoding** (turning a place name into coordinates): city name → a list of matching places, each with its latitude and longitude.
2. **Forecast:** latitude and longitude → the weather there.

Open both example URLs below in a new browser tab. You'll see the raw JSON the API sends back (if your browser offers a "Pretty-print" option, tick it to make the JSON easier to read).

### 1. Geocoding: from a city name to coordinates

```
https://geocoding-api.open-meteo.com/v1/search?name=London&count=5&language=en&format=json
```

| Parameter | Example | What it means |
|---|---|---|
| `name` | `London` | What the user typed |
| `count` | `5` | How many places to send back at most |
| `language` | `en` | The language for place names |
| `format` | `json` | Send JSON back |

The answer looks like this (trimmed):

```json
{
  "results": [
    {
      "id": 2643743,
      "name": "London",
      "latitude": 51.50853,
      "longitude": -0.12574,
      "country_code": "GB",
      "country": "United Kingdom",
      "admin1": "England",
      "timezone": "Europe/London",
      "population": 8961989
    },
    {
      "id": 6058560,
      "name": "London",
      "latitude": 42.98339,
      "longitude": -81.23304,
      "country": "Canada",
      "admin1": "Ontario"
    }
  ],
  "generationtime_ms": 1.4225245
}
```

(`generationtime_ms` is how long the server took to answer. You can ignore it.)

The fields you need from each place:

| Field | Example | Use it for |
|---|---|---|
| `name` | `"London"` | The city's name |
| `admin1` | `"England"` | The region or state. **Not every place has one** (Singapore doesn't). |
| `country` | `"United Kingdom"` | The country |
| `latitude`, `longitude` | `51.50853`, `-0.12574` | The forecast request |

Three things that will bite you if you don't know them:

- **No match means no `results` at all.** Search for `Xyzzy` and you get `{ "generationtime_ms": 0.15795231 }`: no empty array, no error, just a missing key. So use `data.results ?? []`.
- **Very short searches find nothing.** One letter never matches. Two letters only match a place with exactly that name. From three letters on, it finds partial matches too ("Lon" finds London).
- **Places share names.** There's a London in England, Canada, and several US states. That's why showing `name, admin1, country` in the suggestions matters.

### 2. Forecast: from coordinates to the weather

```
https://api.open-meteo.com/v1/forecast?latitude=51.50853&longitude=-0.12574&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto
```

It looks long, but it's only five parameters, plus an optional sixth for Fahrenheit:

| Parameter | Example | What it means |
|---|---|---|
| `latitude`, `longitude` | `51.50853`, `-0.12574` | Where (from the geocoding result) |
| `current` | `temperature_2m,weather_code,...` | Which values you want for **right now**, separated by commas |
| `daily` | `weather_code,temperature_2m_max,...` | Which values you want for **each day** |
| `timezone` | `auto` | Use the place's own time zone for times and dates |
| `temperature_unit` | `fahrenheit` | Optional. Leave it out (or use `celsius`) for °C |

You only get the values you ask for. The `_2m` in the names means "measured 2 meters above the ground", the standard height for weather readings. Wind is measured at 10 meters, hence `wind_speed_10m`.

The answer looks like this (trimmed):

```json
{
  "latitude": 51.51147,
  "longitude": -0.13078308,
  "timezone": "Europe/London",
  "current_units": {
    "temperature_2m": "°C",
    "apparent_temperature": "°C",
    "relative_humidity_2m": "%",
    "weather_code": "wmo code",
    "wind_speed_10m": "km/h"
  },
  "current": {
    "time": "2026-09-24T12:15",
    "temperature_2m": 17.6,
    "apparent_temperature": 16.5,
    "relative_humidity_2m": 55,
    "weather_code": 3,
    "wind_speed_10m": 5
  },
  "daily": {
    "time": ["2026-09-24", "2026-09-25", "2026-09-26", "2026-09-27", "2026-09-28", "2026-09-29", "2026-09-30"],
    "weather_code": [3, 51, 51, 61, 61, 51, 53],
    "temperature_2m_max": [22.1, 23.2, 19.1, 22.3, 19.6, 24.5, 23.4],
    "temperature_2m_min": [12.8, 14.9, 13.2, 13.8, 14, 16, 20],
    "precipitation_probability_max": [0, 3, 8, 27, 37, 24, 37]
  }
}
```

The fields you need:

| Field | Example | What it is |
|---|---|---|
| `current.temperature_2m` | `17.6` | The temperature now |
| `current.apparent_temperature` | `16.5` | "Feels like": takes wind, humidity, and sunshine into account |
| `current.relative_humidity_2m` | `55` | Humidity, in % |
| `current.weather_code` | `3` | The weather, as a code: look it up in `weatherCodes` |
| `current.wind_speed_10m` | `5` | Wind speed, in km/h |
| `current_units.temperature_2m` | `"°C"` | The unit. It becomes `"°F"` when you ask for Fahrenheit. |
| `daily.time` | `["2026-09-24", ...]` | The 7 dates, as `YYYY-MM-DD` text |
| `daily.weather_code` | `[3, 51, ...]` | Each day's weather code |
| `daily.temperature_2m_max` / `_min` | `[22.1, ...]` / `[12.8, ...]` | Each day's highest and lowest temperature |
| `daily.precipitation_probability_max` | `[0, 3, ...]` | Each day's chance of rain, in % |

Two things to know:

- **`daily` is a set of matching lists.** Day `i` is `daily.time[i]` with `daily.temperature_2m_max[i]`, `daily.weather_code[i]`, and so on. Loop over the indexes, not over the values.
- **Names are in `snake_case`** (words joined with `_`). That's the API's style, not yours: read them exactly as they're spelled, like `forecast.current.weather_code`.

The latitude and longitude in the answer can be a little different from the ones you sent. The service uses the nearest point on its weather grid, and that's fine. If you send a bad parameter, you get status `400` and a body like `{ "error": true, "reason": "..." }`.

## Milestone 1: Fetch the forecast for a fixed city

**Goal:** prove the connection works. `api.js` fetches the forecast, and `main.js` logs it for London. Nothing on the page changes yet.

1. In `api.js`, export an `async` function `getForecast(latitude, longitude)`. Build the URL from the table above, fetch it, check `response.ok`, and return the parsed JSON.
2. In `main.js`, import `getForecast`, call it with London's coordinates (`51.50853`, `-0.12574`), and log the result. Then log only the temperature.

Write import paths exactly like the file names: `"./api.js"`, with the `./` and the `.js`. Capitals matter too. `"./Api.js"` happens to work on Windows, but it breaks on most web servers, which run Linux, where `Api.js` and `api.js` are two different files.

**What you'll see:** in the console, an object with keys like `latitude`, `timezone`, `current_units`, `current`, and `daily`. Click the small arrow to expand it. Below it, a single number like `17.6`: the temperature in London right now.

<details>
<summary>Hint 1</summary>

Build the URL with `URL` and `searchParams` from [chapter 33](../33-fetch-and-apis/notes.md), one `set` per parameter. The comma-separated lists go in as one string each: `url.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max")`.

</details>

<details>
<summary>Hint 2</summary>

`fetch` doesn't reject on a `400` or `500` answer. If `response.ok` is `false`, `throw` an `Error` yourself and put `response.status` in the message. That way the caller finds out ([chapter 33](../33-fetch-and-apis/notes.md)).

</details>

<details>
<summary>Hint 3</summary>

`main.js` is a module, so you can use `await` at the top level, outside any function ([chapter 29](../29-modules/notes.md)).

</details>

> **Watch out:** if the console shows a red error saying the script was **blocked by CORS policy**, you opened the page by double-clicking it. Close it and use **Open with Live Server** instead.

## Milestone 2: Search for a city and show the weather now

**Goal:** type a city and press Enter (or click **Search**). The app takes the first matching place and fills in the "current weather" card.

1. In `api.js`, export `searchCities(name)`. It calls the geocoding API and returns the list of places, or an empty array when there's no match.
2. In `ui.js`, export `renderCurrent(place, forecast)`. It fills in `#place-name`, `#current-emoji`, `#current-temp`, `#current-description`, `#feels-like`, `#humidity`, and `#wind`, then shows the `#current` card. You'll need `weatherCodes` for the emoji and description: the first comment in `weather-codes.js` shows the `import` line.
3. In `main.js`, listen for `submit` on `#search-form`. Stop the page from reloading, read and trim the text, search, take the first place, fetch its forecast, and render it. Remove the test code from Milestone 1.

To show and hide things, use the **`hidden`** property: `card.hidden = false` shows the card, `card.hidden = true` hides it. (The starter CSS makes sure this always works.)

**What you'll see:** search `Paris` and the card appears, something like:

```
Paris, Île-de-France Region, France
[emoji] 18°C
Partly cloudy
Feels like 17°C     Humidity 64%     Wind 11 km/h
```

**Rule:** put everything that comes from the API on the page with `textContent`, never `innerHTML`. A city name is text from the internet, just like user input ([chapter 20](../20-dom-basics/notes.md)).

<details>
<summary>Hint 1</summary>

Round the temperatures with `Math.round` ([chapter 5](../05-numbers-and-math/notes.md)) and take the unit from the response instead of typing `"°C"` yourself: `` `${Math.round(current.temperature_2m)}${units.temperature_2m}` ``, where `units` is `forecast.current_units`. Destructuring with renaming ([chapter 15](../15-destructuring-spread-rest/notes.md)) makes this tidy: `const { current, current_units: units } = forecast;`.

</details>

<details>
<summary>Hint 2</summary>

To build the place label, put the parts in an array and join them: `[place.name, place.admin1, place.country]`. Some places have no `admin1`, so remove the empty parts first. `.filter(Boolean)` does exactly that: `Boolean` works as the callback, and it keeps only truthy values ([chapter 7](../07-conditionals/notes.md)).

</details>

<details>
<summary>Hint 3</summary>

Look up the weather with `weatherCodes[current.weather_code]`. If the service ever sends a code that isn't in the list, you'd get `undefined`, so add a fallback with `??`, like `{ description: "Unknown weather", emoji: "?" }`.

</details>

## Milestone 3: Loading and error states

**Goal:** the user always knows what's going on. Right now, a slow network shows nothing, and an unknown city or a lost connection breaks the app silently (look at the console: red errors).

1. In `ui.js`, export `showStatus(message, isError)` and `clearStatus()`. `showStatus` puts the message in `#status`, adds the `error` class only when `isError` is `true`, and shows the paragraph. `clearStatus` hides it.
2. In `main.js`, show a message before each request, like `Searching for "Paris"...` and then `Loading the weather...`. Clear it when the weather is on screen.
3. If the search finds nothing, show an error and stop.
4. Wrap your requests in `try`/`catch` ([chapter 18](../18-error-handling/notes.md)). If anything fails, show a friendly error. Also `console.error` the real error, so *you* can still see what happened.

**What you'll see:**

- `Paris`: the messages flash by, then the weather appears.
- `Xyzzy`: a red message, `No city called "Xyzzy" found. Check the spelling and try again.`
- No connection: a red message, `Couldn't reach the weather service. Check your connection and try again.`

To test without a connection, you don't need to unplug anything. Open DevTools, go to the **Network** tab, and change the dropdown that says **No throttling** to **Offline**. Search again. Switch it back afterwards! The same dropdown has slow presets too: pick one to see your loading messages properly.

<details>
<summary>Hint 1</summary>

When there's no connection at all, `fetch` rejects with a `TypeError` (in Chrome and Edge, the message is `Failed to fetch`). When the server answers with an error status, your own `throw` from Milestone 1 kicks in. One `catch` handles both.

</details>

<details>
<summary>Hint 2</summary>

`classList.toggle("error", isError)` adds the class when the second argument is `true` and removes it when it's `false`. That's handy when the same paragraph is used for loading messages and errors.

</details>

## Milestone 4: Suggestions as you type

**Goal:** while the user types, show up to five matching places under the box. Clicking one shows its weather. This is where [chapter 34](../34-debounce-and-throttle/notes.md) pays off: one request per pause, and a slow old answer can never replace a newer one.

1. Type your complete `debounce(fn, delay)` from chapter 34 at the top of `main.js`. (Or give it its own `debounce.js` module with `export`, and import it. Your choice.)
2. Give `searchCities` a second parameter, `signal`, and pass it on to `fetch` as `{ signal }`. When you call `searchCities(name)` without one, `signal` is `undefined` and `fetch` works as usual.
3. In `ui.js`, export `renderSuggestions(places, onSelect)`. For each place, create the `<li>` with a `<button>` shown in the comment in `index.html`, and make each button call `onSelect(place)` when clicked. Then show the list. Also export `clearSuggestions()`, which empties and hides it.
4. In `main.js`, write `suggest(text)`: abort the previous suggestion request, skip texts shorter than 2 letters (the API can't match them), then search with a fresh `AbortController`'s signal and render the places. Call it through a debounced version (300 ms) from an `input` listener.
5. When a suggestion is chosen: clear the list, put the city's name in the box, and show its weather.
6. When the form is submitted, cancel the waiting suggestion and abort any request in flight. Otherwise the list pops up again *after* the weather appears (Common mistake 5 in chapter 34).

**What you'll see:** type `Lon` and pause. Five suggestions appear: `London, England, United Kingdom`, `Loni, Uttar Pradesh, India`, and so on. Click the first one: the list closes, the box says `London`, and London's weather appears.

Now open the **Network** tab and type `London` quickly. Only one search request goes out. Type slowly, and each pause sends one. If a request is still on its way when the next one starts, you'll see the old one marked **(canceled)**.

<details>
<summary>Hint 1</summary>

Keep one `let controller;` at the top level of `main.js`, outside any function. Each new suggestion request does `controller?.abort()` first, then `controller = new AbortController()`. It's the same pattern as "Debounced search without stale results" in chapter 34.

</details>

<details>
<summary>Hint 2</summary>

An aborted request lands in your `catch` with `error.name === "AbortError"`. That's not a real problem, so just `return`. For other errors, clear the suggestions quietly: they're a nice extra, not worth a scary red message.

</details>

<details>
<summary>Hint 3</summary>

Create the button's click listener inside the loop, with an arrow function: `() => onSelect(place)`. Thanks to closures ([chapter 25](../25-closures/notes.md)), each button remembers its own `place`.

</details>

## Milestone 5: The 7-day forecast

**Goal:** under the current weather, list the next seven days: the day's name, an emoji, the chance of rain, and the highest and lowest temperature.

1. In `ui.js`, export `renderForecast(forecast)`. Empty `#forecast-list`, then loop over the indexes of `daily.time`. For each day, build the `<li class="forecast-day">` shown in the comment in `index.html` and append it. Finally, show the `#forecast` section.
2. Write a small helper, `formatDay(dateText, index)`. The first day (index `0`) is `"Today"`. For the others, turn the date text into a short day name like `"Fri"` ([chapter 19](../19-dates-and-times/notes.md)).
3. Call `renderForecast` right after `renderCurrent`.

**What you'll see:**

```
7-day forecast
Today    [icon]   rain 0%     22°  13°
Fri      [icon]   rain 3%     23°  15°
Sat      [icon]   rain 8%     19°  14°
Sun      [icon]   rain 27%    22°  14°
...
```

Watch out for a time zone trap from chapter 19. `new Date("2026-09-24")` means midnight in **UTC**. If you then format it in the user's own time zone, anyone behind UTC (across the Americas, for example) gets the day before:

```js
const day = new Date("2026-09-24"); // a Thursday

console.log(day.toLocaleDateString("en-US", { weekday: "short", timeZone: "America/New_York" })); // prints: Wed
console.log(day.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" })); // prints: Thu
```

The fix is to format in UTC too, with `timeZone: "UTC"`, as in the second line. This bug is sneaky: if your own time zone is ahead of UTC, your app looks right on your computer, and only your users far to the west see the wrong days.

<details>
<summary>Hint 1</summary>

A small helper keeps the building tidy, for example `makeSpan(className, text)`, which creates a `<span>`, sets its `className` and `textContent`, and returns it. `append` can take several elements at once ([chapter 20](../20-dom-basics/notes.md)).

</details>

<details>
<summary>Hint 2</summary>

The temperatures in the list don't need the full unit. `22°` is clear enough, and it works for both °C and °F in the next milestone.

</details>

## Milestone 6: Switch between °C and °F

**Goal:** the button in the header switches every temperature on the page between Celsius and Fahrenheit.

1. Give `getForecast` a third parameter, `unit`, with the default value `"celsius"`, and send it as `temperature_unit`. The API accepts `"celsius"` and `"fahrenheit"`.
2. In `main.js`, keep two pieces of **state** (what the app needs to remember while it runs): `let unit = "celsius";` and `let currentPlace = null;`. Set `currentPlace` every time you show a place.
3. When `#unit-toggle` is clicked, flip `unit`, change the button's text (`Switch to °C` or `Switch to °F`), and, if there's a current place, load its weather again.

**What you'll see:** click **Switch to °F** and every temperature changes (17°C becomes about 63°F). The button now says **Switch to °C**. Click it again to go back.

If you took the units from `current_units` in Milestone 2, the labels change by themselves: the API sends `"°F"` now. If you typed `"°C"` into your code, you'll see Fahrenheit numbers with a Celsius label. Time to fix that!

<details>
<summary>Hint 1</summary>

Flipping between two values is a job for the ternary operator ([chapter 7](../07-conditionals/notes.md)): if `unit` is `"celsius"` now, it becomes `"fahrenheit"`, and the other way round.

</details>

<details>
<summary>Hint 2</summary>

Want wind in miles per hour for Fahrenheit fans? Add the parameter `wind_speed_unit=mph`. One surprise: the API labels that unit `"mp/h"`, so you may want to show your own label.

</details>

## Milestone 7: Remember the last city

**Goal:** refresh the page, and the last city's weather appears by itself, with no searching.

1. Every time a place's weather is shown successfully, save the place in `localStorage` under the key `"lastPlace"`. It's an object, so turn it into JSON first ([chapter 23](../23-json-and-local-storage/notes.md)).
2. At the bottom of `main.js`, when the app starts, read it back. If there's a saved place, show its weather. If not, show a friendly hint with `showStatus`, like `Search for a city to see its weather.`
3. **Bonus:** remember the °C/°F choice too, and set the button's text to match when the app starts.

**What you'll see:** search `Tokyo`, then refresh the page. Tokyo's weather loads straight away. Open DevTools, go to **Application → Local storage**, and you'll find your saved place as a JSON string.

<details>
<summary>Hint 1</summary>

Use the "load with a default value" pattern from chapter 23: a small function that reads a key, returns the fallback when there's nothing saved, and wraps `JSON.parse` in `try`/`catch` in case the saved text is broken.

</details>

<details>
<summary>Hint 2</summary>

Save the whole place object from the geocoding API. It already has everything you need later: the name, `admin1`, `country`, `latitude`, and `longitude`.

</details>

## Common mistakes

**1. Assuming there's always a `results` list**

```js
const data = await response.json(); // searched for "Xyzzy"
const place = data.results[0];
// TypeError: Cannot read properties of undefined (reading '0')
```

When nothing matches, the geocoding API leaves `results` out completely. Fix: `const places = data.results ?? [];`, then check `places.length === 0` and show "City not found".

**2. Not checking `response.ok`**

```js
const response = await fetch(url); // a typo in a parameter: status 400
const forecast = await response.json();
console.log(forecast.current.temperature_2m);
// TypeError: Cannot read properties of undefined (reading 'temperature_2m')
```

A `400` answer is still valid JSON (`{ "error": true, "reason": "..." }`), so `response.json()` works and the real problem hides until later. Fix: check `response.ok` right after `fetch`, and `throw` an error that includes `response.status`. Then `console.log` the `reason` while you're debugging.

**3. Forgetting `await`**

```js
const places = searchCities("Paris"); // no await: this is a Promise
const place = places[0];              // undefined
getForecast(place.latitude, place.longitude);
// TypeError: Cannot read properties of undefined (reading 'latitude')
```

An `async` function always returns a promise ([chapter 32](../32-async-await/notes.md)). Fix: `const places = await searchCities("Paris");`.

**4. Forgetting `preventDefault()` on the form**

```js
form.addEventListener("submit", () => {
  // search for the city and show its weather...
});
// ...but the page reloads straight away and wipes everything
```

A form's default job is to send the page somewhere and reload it ([chapter 22](../22-forms/notes.md)). The weather flashes for a moment and disappears. Fix: take the event as a parameter and call `event.preventDefault()` first.

**5. Suggestions popping up after the user already chose**

The user types `Tok`, presses Enter, and Tokyo's weather appears. Then the suggestion list opens anyway, because a debounced call was still waiting. Fix: whenever a search is submitted or a suggestion is chosen, call your debounced function's `cancel()`, abort the suggestion request in flight, and clear the list.

## Quick recap

In this project, you:

- used **two APIs in a row**: geocoding (name → coordinates) and forecast (coordinates → weather), reading only the fields you need
- split the app into **modules** with one job each: `api.js` fetches, `ui.js` draws, `main.js` decides
- handled **loading, "not found", and network errors**, so the app never just silently breaks
- reused your own **`debounce`** from chapter 34 and canceled stale requests with **`AbortController`**
- formatted **day names** safely with `timeZone: "UTC"`, and let the API's `current_units` label your temperatures
- kept **state** (`unit`, `currentPlace`) and saved it with **`localStorage`**, so the app remembers you

That's a real, useful app built with nothing but plain JavaScript. Well done!

---

**Next:** try the [exercises](exercises.md), then move on to [40 The Event Loop](../40-event-loop/notes.md).
