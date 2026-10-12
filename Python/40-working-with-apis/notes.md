# 40 Working with APIs

## What is it?

An **API** (short for Application Programming Interface) is a way for one program to ask another program for data, or to ask it to do something. A **web API** does this over the internet: your program sends a request to a web address, and the server sends data back, usually as JSON.

**requests** is the most popular Python package for talking to web APIs. With it, a few lines of Python can fetch the weather, look up a book, or send a message.

## Why does it matter?

So far, your programs only know what you type in, or what's in your own files. But a lot of the data you care about lives somewhere else:

- the weather forecast lives with a weather service,
- exchange rates live with a bank,
- train times live with the train company,
- your photos, messages and payments live with the apps you use.

You could open a website and copy the numbers into your program by hand, but that's slow, and the numbers are out of date a minute later. An API lets your program ask for exactly the data it needs, whenever it needs it, and get it back in a tidy shape.

[Chapter 21](../21-json-and-csv/notes.md) promised that weather from the internet would arrive as JSON. Here's a sneak peek at how short that can be:

```python
import requests

url = "https://api.open-meteo.com/v1/forecast?latitude=27.7&longitude=85.32&current=temperature_2m"
response = requests.get(url, timeout=10)
print(response.json()["current"]["temperature_2m"])
```

That printed `23.6`: the temperature in Kathmandu, in °C, at the moment it ran. It's live data, so you'll see a different number. By the end of this chapter, you'll understand every piece of it, and you'll have built a proper weather tool around it.

## Real-world example

An API works like a waiter in a restaurant. (If you did the [JavaScript course](../../JavaScript/33-fetch-and-apis/notes.md), you've met this waiter before.) You don't walk into the kitchen and cook your own food. You read the menu, tell the waiter what you'd like, and the waiter brings it to you. If the kitchen can't make it, the waiter comes back and says so.

| At the restaurant | With a web API |
|---|---|
| The menu | The API's documentation: what you're allowed to ask for |
| Your order: "the soup, please" | A **request**: a method, an address, and maybe some data |
| The waiter | The API |
| The kitchen | The server and its database, which you never see |
| The dish on a plate | The **response**, usually JSON |
| "Sorry, we're out of soup" | An error status code, like 404 |
| "Please wait, the kitchen is very busy" | 429 Too Many Requests |

You never need to know how the kitchen works. You only need to know how to order, and what to do when the answer is "no".

## How it works

### Try it in your browser first

Your web browser already talks to web APIs. Paste this address into its address bar and press Enter:

```
https://jsonplaceholder.typicode.com/users/1
```

You'll see a page of JSON about a (made-up) person called Leanne Graham. Most browsers lay JSON out neatly or colour it. Exactly how it looks depends on your browser.

That's a real API answering a real request. Trying a URL in the browser first is a great habit: you see the shape of the data before you write any code.

This chapter uses three free services. None of them needs a sign-up:

| Service | What it is |
|---|---|
| **JSONPlaceholder** (`jsonplaceholder.typicode.com`) | Fake users, posts and to-dos, made for practice. Its data never changes, so your output will match these notes exactly. |
| **Open-Meteo** (`open-meteo.com`) | Real weather from all over the world. Your numbers will be different, because the weather changes. |
| **httpbin** (`httpbin.org`) | A test service that answers in whatever way you ask it to: with an error, slowly, or by echoing back what you sent. |

### HTTP in five minutes

**HTTP** is the set of rules browsers and servers use to talk to each other. Every conversation is one **request** followed by one **response**. (The JavaScript course explains all of this in more detail in [chapter 33](../../JavaScript/33-fetch-and-apis/notes.md). The rules are the same in every language.)

Every request goes to a **URL** (a web address). Here's one, taken apart:

```
https://api.open-meteo.com/v1/forecast?latitude=27.7&longitude=85.32
```

| Part | Example | What it is |
|---|---|---|
| scheme | `https://` | How to talk. The `s` means secure (encrypted). |
| host | `api.open-meteo.com` | Which server |
| path | `/v1/forecast` | What you want from it. One address like this is called an **endpoint**. |
| query string | `?latitude=27.7&longitude=85.32` | Extra options after the `?`, written `key=value` and joined with `&` |

Each request has a **method**, which says what you want to do:

| Method | Means | At the restaurant |
|---|---|---|
| `GET` | Read something | "What's today's special?" |
| `POST` | Create something new | "I'd like to place an order." |
| `PUT` | Replace something completely | "Swap my whole order for this one." |
| `PATCH` | Change part of something | "Same order, but no onions." |
| `DELETE` | Remove something | "Cancel my order." |

Each response starts with a **status code**: a number that says how it went.

| Code | Name | Means |
|---|---|---|
| `200` | OK | It worked. Here's your data. |
| `201` | Created | It worked. Your new thing was created. |
| `400` | Bad Request | Your request doesn't make sense (a missing or wrong value). |
| `401` | Unauthorized | You need to say who you are, or your key is wrong. |
| `403` | Forbidden | The server knows who you are, but you're not allowed to do this. |
| `404` | Not Found | There's nothing at that address. |
| `429` | Too Many Requests | Slow down! You've asked too often. |
| `500` | Internal Server Error | Something broke on the server. |

An easy way to remember them: the **200s** mean success, the **400s** mean something is wrong with *your* request, and the **500s** mean something went wrong on the *server*.

Requests and responses also carry **headers**: little labels with extra information, like the labels on a parcel. `Content-Type: application/json` says "the body is JSON". `User-Agent` says which program sent the request. And the **body** is the data itself, usually JSON in both directions.

### Installing requests

requests isn't part of the standard library, so install it into a virtual environment, as in [chapter 23](../23-pip-and-virtual-environments/notes.md). In this chapter's folder:

```
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install requests
```

(That's the PowerShell way to activate. In Command Prompt or on a Mac, use the activate command for your terminal from chapter 23.) The last line of pip's output looks like this:

```
Successfully installed certifi-2026.7.22 charset_normalizer-3.5.2 idna-3.20 requests-2.34.2 urllib3-2.8.0
```

These notes were written with requests 2.34. Your version numbers may be newer, and that's fine.

> **Tip:** Python's standard library has its own tool for this, `urllib.request`. It works, but it's clumsier to use, which is why almost everyone installs requests instead.

### Your first request

```python
import requests

response = requests.get("https://jsonplaceholder.typicode.com/users/1", timeout=10)

print(response.status_code)  # prints: 200
print(response.ok)  # prints: True

user = response.json()
print(type(user))  # prints: <class 'dict'>
print(user["name"])  # prints: Leanne Graham
print(user["address"]["city"])  # prints: Gwenborough
```

Line by line:

- `requests.get(url, timeout=10)` sends a GET request, waits for the answer, and gives you back a **Response** object. `timeout=10` means "give up if the server doesn't answer within 10 seconds". Always include it (you'll see why under "Common mistakes").
- `response.status_code` is the status code, here `200`.
- `response.ok` is `True` when the status code is below 400, so nothing went wrong.
- `response.json()` turns the JSON in the body into Python values, exactly like `json.loads()` from [chapter 21](../21-json-and-csv/notes.md). Here it's a dictionary.
- `user["address"]["city"]` digs into a dictionary inside a dictionary, the nested data from [chapter 13](../13-dictionaries/notes.md).

A response has a few more useful parts:

| Part | What it is | For this request |
|---|---|---|
| `response.status_code` | The status code | `200` |
| `response.reason` | The status code's name | `'OK'` |
| `response.ok` | `True` if the status code is below 400 | `True` |
| `response.json()` | The body, turned from JSON into Python values | a `dict` |
| `response.text` | The body as plain text | a `str` starting `'{\n  "id": 1,'` |
| `response.headers` | The response's headers, like a dictionary | |
| `response.url` | The exact URL that was requested | `'https://jsonplaceholder.typicode.com/users/1'` |

`response.headers["Content-Type"]` gives `'application/json; charset=utf-8'`. So does `response.headers["content-type"]`: header names ignore capital letters, so requests lets you spell them either way.

### Query parameters: let `params=` build the URL

Many endpoints take options in the query string. You could glue the URL together with an f-string, but some characters can't go into a URL as they are. A space, an `&`, or a letter like `ã` has to be **encoded**: turned into a safe code. requests does that for you if you pass the options as a dictionary with `params=`.

httpbin's `/get` endpoint is handy for seeing this: it sends back the options it received, under `"args"`.

```python
import requests

params: dict[str, str | int] = {"search": "mac & cheese", "page": 2}
response = requests.get("https://httpbin.org/get", params=params, timeout=10)

print(response.url)
print(response.json()["args"])
```

You'll see:

```
https://httpbin.org/get?search=mac+%26+cheese&page=2
{'page': '2', 'search': 'mac & cheese'}
```

The space became `+`, and the `&` became `%26`, so the server received the whole dish safely. (Notice that `2` arrived as the text `'2'`. A URL is just text, so the server has to convert it, like `sys.argv` in [chapter 24](../24-command-line-programs/notes.md).) You'll see what goes wrong without `params=` under "Common mistakes".

> **Tip:** requests comes with its own type hints, so mypy ([chapter 25](../25-type-hints/notes.md)) checks how you call it. One thing trips everybody up: a dictionary that mixes strings and numbers needs a hint before you pass it to requests, like the `params: dict[str, str | int]` above. Without one, mypy guesses the values are just `object`s, and complains with a very long message that starts `Argument "params" to "get" has incompatible type "dict[str, object]"`. That's one of the "the checker asks for a hint" cases from chapter 25, and it's why you'll see these hints in the examples in this chapter.

### When the server says no: status codes

There are only 10 users on JSONPlaceholder. Ask for number 11:

```python
import requests

response = requests.get("https://jsonplaceholder.typicode.com/users/11", timeout=10)

print(response.status_code)  # prints: 404
print(response.ok)  # prints: False
print(response.json())  # prints: {}
```

No crash! requests doesn't treat a 404 as an error. The waiter came back and said "we don't have that", and that still counts as an answer. If you didn't check, your program would carry on with an empty dictionary and fail later, somewhere confusing.

So checking the status is your job. The easiest way is `response.raise_for_status()`: it does nothing when all is well, and raises an exception for any 4xx or 5xx status:

```python
import requests

response = requests.get("https://jsonplaceholder.typicode.com/users/11", timeout=10)
response.raise_for_status()
print("This line never runs.")
```

```
requests.exceptions.HTTPError: 404 Client Error: Not Found for url: https://jsonplaceholder.typicode.com/users/11
```

Good APIs also explain what was wrong, in the body. Ask Open-Meteo for the weather at latitude 999 (there's no such place on Earth), and it answers `400`, with this JSON:

```
{'error': True, 'reason': 'Latitude must be in range of -90 to 90°. Given: 999.0.'}
```

So when a request fails, printing `response.text` is often the quickest way to find out why.

### When nothing comes back: network errors and timeouts

Sometimes there's no answer at all: you're offline, the address is wrong, or the server is down or very slow. Then requests raises an exception straight away:

```python
import requests

try:
    requests.get("https://no-such-shop.invalid/products", timeout=10)
except requests.ConnectionError:
    print("Couldn't reach the server. Check the address and your internet connection.")

try:
    requests.get("https://httpbin.org/delay/5", timeout=2)
except requests.Timeout:
    print("The server took more than 2 seconds to answer, so we gave up.")
```

You'll see:

```
Couldn't reach the server. Check the address and your internet connection.
The server took more than 2 seconds to answer, so we gave up.
```

(Addresses ending in `.invalid` are reserved for examples, so that one can never exist. `httpbin.org/delay/5` waits 5 seconds before it answers, so the 2-second timeout runs out first.)

All of requests' exceptions belong to one family, with `requests.RequestException` at the top:

| Exception | When it happens |
|---|---|
| `requests.HTTPError` | `raise_for_status()` found a 4xx or 5xx status code |
| `requests.ConnectionError` | The server couldn't be reached at all |
| `requests.Timeout` | The server took longer than your `timeout` |
| `requests.JSONDecodeError` | `.json()` was called on something that isn't JSON |
| `requests.RequestException` | The parent of all of the above |

Because they share a parent, `except requests.RequestException:` catches every one of them, just like catching a parent exception catches its children in [chapter 28](../28-inheritance/notes.md).

### A safe helper: `get_json`

Every request needs the same three steps: send it with a timeout, check the status, read the JSON. Put them in one function:

```python
from typing import Any

import requests


def get_json(url: str) -> Any:
    """GET a URL and return its JSON. Raises a requests exception on any problem."""
    response = requests.get(url, timeout=10)
    response.raise_for_status()
    return response.json()


urls = [
    "https://jsonplaceholder.typicode.com/users/2",
    "https://jsonplaceholder.typicode.com/users/11",
    "https://no-such-shop.invalid/products",
]

for url in urls:
    try:
        data = get_json(url)
        print(f"OK: {data['name']}")
    except requests.HTTPError as e:
        print(f"The server said no: {e}")
    except requests.RequestException as e:
        print(f"No answer at all: {type(e).__name__}")
```

You'll see:

```
OK: Ervin Howell
The server said no: 404 Client Error: Not Found for url: https://jsonplaceholder.typicode.com/users/11
No answer at all: ConnectionError
```

Why `-> Any`? JSON can be a dictionary, a list, a number or a string, and Python can't know which until the answer arrives. `Any` (from [chapter 25](../25-type-hints/notes.md)) tells mypy "this could be anything". It also means mypy can't check what you do with it. You'll fix that with a dataclass in a moment.

The order of the `except` blocks matters: `HTTPError` comes first, because `RequestException` would catch it too.

### Real data: the weather in Kathmandu

Time for a real API. Open-Meteo needs a place's latitude and longitude, so getting the weather for a city takes two requests: first look the city up, then ask for its weather.

**Step 1: find the city.** Open-Meteo's geocoding endpoint turns a name into coordinates. ("Geocoding" means turning a place name into a position on the map.)

```python
import requests

params: dict[str, str | int] = {"name": "Kathmandu", "count": 1}
response = requests.get(
    "https://geocoding-api.open-meteo.com/v1/search", params=params, timeout=10
)
response.raise_for_status()
data = response.json()

place = data["results"][0]
print(place["name"], place["country"], place["latitude"], place["longitude"])
```

```
Kathmandu Nepal 27.70169 85.3206
```

How do you know to write `data["results"][0]`? By looking at the JSON first, in the browser or with `print`. Here's what came back (shortened a little):

```
{
  "results": [
    {
      "id": 1283240,
      "name": "Kathmandu",
      "latitude": 27.70169,
      "longitude": 85.3206,
      "timezone": "Asia/Kathmandu",
      "population": 1442271,
      "country": "Nepal"
    }
  ],
  "generationtime_ms": 0.2566576
}
```

It's a dictionary with a `"results"` list, and each place in the list is a dictionary. So `data["results"]` is the list, `[0]` is the first place, and `["latitude"]` is one value inside it. Reading nested JSON is always like this: one step at a time, from the outside in.

**Step 2: ask for the weather.** The forecast endpoint takes the coordinates, and a `current` list of what you want to know:

```python
import json

import requests

FORECAST_URL = "https://api.open-meteo.com/v1/forecast"

params: dict[str, str | float] = {
    "latitude": 27.70169,
    "longitude": 85.3206,
    "current": "temperature_2m,relative_humidity_2m,wind_speed_10m",
    "timezone": "auto",
}
response = requests.get(FORECAST_URL, params=params, timeout=10)
response.raise_for_status()
data = response.json()

print(json.dumps(data, indent=2, ensure_ascii=False))
```

You'll see something like this (shortened a little, and it's live weather, so your numbers will be different):

```
{
  "latitude": 27.732864,
  "longitude": 85.34831,
  "timezone": "Asia/Kathmandu",
  "elevation": 1293.0,
  "current_units": {
    "time": "iso8601",
    "interval": "seconds",
    "temperature_2m": "°C",
    "relative_humidity_2m": "%",
    "wind_speed_10m": "km/h"
  },
  "current": {
    "time": "2026-10-12T11:00",
    "interval": 900,
    "temperature_2m": 23.5,
    "relative_humidity_2m": 53,
    "wind_speed_10m": 5.2
  }
}
```

`json.dumps(data, indent=2)` is the best way to look at an answer you don't know yet. (`ensure_ascii=False` keeps the `°` as a real character, as the tip in chapter 21 explained.) A few things to notice:

- `temperature_2m` is the temperature 2 metres above the ground, and `wind_speed_10m` is the wind 10 metres up.
- The units are in a separate dictionary, `current_units`, so your program doesn't have to guess them.
- `"timezone": "auto"` asked for times in the place's own time zone. Without it, `time` is in UTC.
- The `latitude` and `longitude` came back slightly different from the ones you sent. The forecast is made for a grid of squares, and you get the nearest square.

So the temperature is `data["current"]["temperature_2m"]`, and its unit is `data["current_units"]["temperature_2m"]`.

> **Watch out:** If no place matches the name, the geocoding endpoint still answers `200 OK`, but the JSON has no `"results"` at all, just `{'generationtime_ms': 0.12922287}`. `raise_for_status()` can't warn you, and `data["results"]` crashes with `KeyError: 'results'`. Check with `data.get("results")` first, which gives `None` when the key is missing.

### Turning JSON into a dataclass

`.json()` gives you `Any`, so mypy can't help you with what's inside. A typo in a key is only found when that line runs:

```python
print(data["nmae"])  # mypy says nothing. Python says: KeyError: 'nmae'
```

A good habit is to turn the JSON into a dataclass ([chapter 30](../30-dataclasses-and-enums/notes.md)) as soon as it arrives, with a `from_dict` class method. All the `["..."]` lookups then live in one small place, and the rest of your program uses attributes like `place.name`, which mypy can check.

Think of it as checking a delivery at the door: you open the box once, check everything is there, and put each thing on the right shelf. After that, nobody in the house has to dig through the box again. You'll see it in the next program: `Place.from_dict` and `Weather.from_dict` are the door.

### Putting it together: `weather.py`

Here's a complete weather tool, with argparse from [chapter 24](../24-command-line-programs/notes.md), error handling, and dataclasses. Save it as `weather.py`:

```python
"""Show the current weather for a city, using the free Open-Meteo API."""

import argparse
import sys
from dataclasses import dataclass
from typing import Any

import requests

GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"
FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
TIMEOUT = 10  # seconds to wait for an answer

Params = dict[str, str | int | float]


@dataclass
class Place:
    name: str
    country: str
    latitude: float
    longitude: float

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "Place":
        """Make a Place from one item of the geocoding API's "results" list."""
        return cls(
            name=data["name"],
            country=data.get("country", "unknown country"),
            latitude=data["latitude"],
            longitude=data["longitude"],
        )


@dataclass
class Weather:
    temperature: float
    humidity: int
    wind_speed: float
    temperature_unit: str
    wind_unit: str

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "Weather":
        """Make a Weather from the forecast API's whole answer."""
        current = data["current"]
        units = data["current_units"]
        return cls(
            temperature=current["temperature_2m"],
            humidity=current["relative_humidity_2m"],
            wind_speed=current["wind_speed_10m"],
            temperature_unit=units["temperature_2m"],
            wind_unit=units["wind_speed_10m"],
        )


def get_json(url: str, params: Params) -> Any:
    """GET a URL and return its JSON. Raises a requests exception on any problem."""
    response = requests.get(url, params=params, timeout=TIMEOUT)
    response.raise_for_status()
    return response.json()


def find_place(name: str) -> Place | None:
    """Look a place up by name. Return None if Open-Meteo doesn't know it."""
    data = get_json(GEOCODING_URL, {"name": name, "count": 1})
    results = data.get("results")
    if not results:
        return None
    return Place.from_dict(results[0])


def current_weather(place: Place, fahrenheit: bool = False) -> Weather:
    """Ask Open-Meteo for the weather at a place right now."""
    params: Params = {
        "latitude": place.latitude,
        "longitude": place.longitude,
        "current": "temperature_2m,relative_humidity_2m,wind_speed_10m",
    }
    if fahrenheit:
        params["temperature_unit"] = "fahrenheit"
    return Weather.from_dict(get_json(FORECAST_URL, params))


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Show the current weather for a city.")
    parser.add_argument("city", help="the city to look up, like Kathmandu")
    parser.add_argument(
        "--fahrenheit", action="store_true", help="show degrees Fahrenheit"
    )
    return parser


def main() -> None:
    args = build_parser().parse_args()
    try:
        place = find_place(args.city)
        if place is None:
            print(f"Error: no place called {args.city!r}", file=sys.stderr)
            sys.exit(1)
        weather = current_weather(place, args.fahrenheit)
    except requests.RequestException as e:
        print(f"Error: couldn't get the weather ({type(e).__name__})", file=sys.stderr)
        sys.exit(1)

    print(f"{place.name}, {place.country}")
    print(f"  Temperature: {weather.temperature}{weather.temperature_unit}")
    print(f"  Humidity:    {weather.humidity}%")
    print(f"  Wind:        {weather.wind_speed} {weather.wind_unit}")


if __name__ == "__main__":
    main()
```

Try it (your weather will be different, of course):

```
python weather.py Kathmandu
Kathmandu, Nepal
  Temperature: 23.5°C
  Humidity:    53%
  Wind:        5.2 km/h

python weather.py London --fahrenheit
London, United Kingdom
  Temperature: 57.6°F
  Humidity:    77%
  Wind:        10.4 km/h

python weather.py Xyzzyville
Error: no place called 'Xyzzyville'
```

And with the Wi-Fi switched off, you get `Error: couldn't get the weather (ConnectionError)` and exit code `1`, instead of a long traceback. `python -m mypy weather.py` says `Success: no issues found in 1 source file`.

Notice how the jobs are split. `get_json` knows about HTTP. `Place.from_dict` and `Weather.from_dict` know the shape of the JSON. `main` knows about the command line and the error messages. If Open-Meteo ever renames a field, only one `from_dict` has to change.

Now see the dataclasses pay off. Add a typo as the last line of `main()`: `print(place.nmae)`. Python would only crash when it got there, with `AttributeError: 'Place' object has no attribute 'nmae'`. mypy finds it straight away, without sending a single request:

```
weather.py:110: error: "Place" has no attribute "nmae"  [attr-defined]
```

### Sending data: POST with `json=`

So far every request was a GET: "please give me something". To *create* something, you send a POST with the data in the body. Pass a dictionary with `json=`, and requests turns it into JSON text and adds the `Content-Type: application/json` header for you:

```python
import requests

new_post: dict[str, str | int] = {
    "title": "My trip to Rome",
    "body": "The pasta was amazing!",
    "userId": 1,
}

response = requests.post(
    "https://jsonplaceholder.typicode.com/posts", json=new_post, timeout=10
)

print(response.status_code)  # prints: 201
print(response.json())
print(response.request.headers["Content-Type"])  # prints: application/json
```

You'll see:

```
201
{'title': 'My trip to Rome', 'body': 'The pasta was amazing!', 'userId': 1, 'id': 101}
application/json
```

The server answered `201 Created` and sent the new post back with its new `id`. (`response.request` is the request that was sent, so you can check what really went out.) JSONPlaceholder only pretends: it answers as if it saved your post, but nothing is stored. A real API would keep it.

The other methods have functions with matching names: `requests.put(url, json=...)` to replace something, `requests.patch(url, json=...)` to change part of it, and `requests.delete(url)` to remove it. For example, `requests.delete("https://jsonplaceholder.typicode.com/posts/1", timeout=10)` answers `200`.

### Headers and API keys

You can send your own headers with `headers=`, as a dictionary. The most important one is how you prove who you are.

Most real APIs need an **API key**: a long secret code that identifies you, a bit like a password. It lets the service count your requests, stop people misusing it, and sometimes charge you. Each API's documentation says how to send it. Very often it goes in an `Authorization` header, written as `Bearer` and then the key. ("Bearer" means "whoever carries this key".)

httpbin's `/bearer` endpoint acts like an API that needs a key. It answers `401` without one, and `200` with one:

```python
import requests

URL = "https://httpbin.org/bearer"

response = requests.get(URL, timeout=10)
print(response.status_code)  # prints: 401

headers = {"Authorization": "Bearer my-secret-key"}
response = requests.get(URL, headers=headers, timeout=10)
print(response.status_code)  # prints: 200
print(response.json())
```

```
{'authenticated': True, 'token': 'my-secret-key'}
```

(httpbin accepts any key at all. A real API checks it, and answers `401` or `403` if it's wrong.)

### Keeping keys in environment variables

A key typed into your code is a key you'll accidentally share: in a screenshot, in a message to a friend, or by putting the project on GitHub, where automatic bots look for leaked keys all day long. Instead, keep the key outside your code, in an **environment variable**: a named setting that belongs to your terminal session rather than to any one file.

Set one in PowerShell like this:

```
$env:DEMO_API_KEY = "my-secret-key"
```

(In Command Prompt it's `set DEMO_API_KEY=my-secret-key`, and on Mac or Linux it's `export DEMO_API_KEY=my-secret-key`.) It only lasts until you close that terminal window, and only programs started from that window can see it.

Python reads environment variables with `os.environ` from the `os` module ([chapter 19](../19-modules-and-standard-library/notes.md)). It works like a dictionary:

```python
import os
import sys

import requests

api_key = os.environ.get("DEMO_API_KEY")
if api_key is None:
    print("Error: set the DEMO_API_KEY environment variable first.", file=sys.stderr)
    sys.exit(1)

headers = {"Authorization": f"Bearer {api_key}"}
response = requests.get("https://httpbin.org/bearer", headers=headers, timeout=10)
print(response.status_code)  # prints: 200
```

In a fresh terminal, without the variable, you get the friendly message and exit code `1`. With `os.environ["DEMO_API_KEY"]` (square brackets) instead of `.get()`, a missing variable would crash with `KeyError: 'DEMO_API_KEY'`, just like a dictionary.

Your code can now be shared safely, because the key isn't in it. Each person sets their own key in their own terminal. [Chapter 52](../52-security-basics/notes.md) goes deeper into keeping secrets safe, including `.env` files.

### Being polite: rate limits

An API is a shared kitchen. If one customer orders a thousand dishes a second, nobody else gets fed. So most APIs have a **rate limit**: a maximum number of requests per minute, hour or day. Go over it, and the server answers `429 Too Many Requests`. Often it adds a `Retry-After` header saying how many seconds to wait.

Here's a function that waits and tries again when it gets a 429. (`httpbin.org/status/429` always answers 429, so you can see what happens when the waiting doesn't help.)

```python
import time

import requests


def get_with_patience(url: str, tries: int = 3) -> requests.Response:
    """GET a URL. On 429 Too Many Requests, wait and try again (up to `tries` times)."""
    response = requests.get(url, timeout=10)
    for _ in range(tries - 1):
        if response.status_code != 429:
            break
        wait = int(response.headers.get("Retry-After", "2"))
        print(f"Too many requests. Waiting {wait} seconds...")
        time.sleep(wait)
        response = requests.get(url, timeout=10)
    return response


response = get_with_patience("https://httpbin.org/status/429")
print(response.status_code)  # prints: 429
```

You'll see:

```
Too many requests. Waiting 2 seconds...
Too many requests. Waiting 2 seconds...
429
```

httpbin doesn't send a `Retry-After` header, so the function waits its default of 2 seconds, and gives up after three tries. With a normal address, the first answer isn't a 429, so it comes straight back without any waiting. (Honest note: `Retry-After` can also be a date instead of a number of seconds. This simple version only handles seconds.) The `@retry` decorator from [chapter 32](../32-decorators/notes.md) is another way to write this kind of "try again" logic.

The best way to handle rate limits, though, is not to hit them. A few habits:

- **Read the docs** for the limit, and stay well under it.
- **Pause between requests** in a loop, with `time.sleep()` from chapter 19.
- **Don't ask for the same thing twice** (caching, next).
- **Say who you are** with a `User-Agent` header, like `"sandip-weather-app/1.0"`, so the people running the API can tell your program apart from others.

### Asking less often: caching and sessions

**Caching** means keeping an answer you already have, so you don't ask again. Inside one run of a program, `functools.cache` from [chapter 34](../34-functional-tools/notes.md) does it in one line:

```python
import functools

import requests

GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"


@functools.cache
def find_coordinates(city: str) -> tuple[float, float]:
    """Return a city's (latitude, longitude). Each city is only looked up once."""
    print(f"(asking the API about {city})")
    params: dict[str, str | int] = {"name": city, "count": 1}
    response = requests.get(GEOCODING_URL, params=params, timeout=10)
    response.raise_for_status()
    place = response.json()["results"][0]
    return place["latitude"], place["longitude"]


print(find_coordinates("Pokhara"))
print(find_coordinates("Pokhara"))
```

You'll see:

```
(asking the API about Pokhara)
(28.26689, 83.96851)
(28.26689, 83.96851)
```

The second Pokhara came straight from the cache, without a request. City coordinates never change, so they're perfect for caching. The weather changes every 15 minutes (that's the `"interval": 900` seconds in the answer), so don't cache it for long. To keep answers *between* runs, you could save them in a JSON file (chapter 21), or install the `requests-cache` package, which does it for you.

A **session** helps when you send many requests to the same server. `requests.Session()` keeps the connection to the server open between requests, instead of opening a new one every time, and it remembers headers you set once:

```python
import time

import requests

URL = "https://jsonplaceholder.typicode.com/users/{}"

start = time.perf_counter()
for user_id in range(1, 6):
    requests.get(URL.format(user_id), timeout=10)
print(f"Without a session: {time.perf_counter() - start:.2f} seconds")

start = time.perf_counter()
with requests.Session() as session:
    session.headers["User-Agent"] = "sandip-weather-app/1.0"
    for user_id in range(1, 6):
        session.get(URL.format(user_id), timeout=10)
print(f"With a session:    {time.perf_counter() - start:.2f} seconds")
```

One run printed this (your times will be different, but the session should win):

```
Without a session: 2.42 seconds
With a session:    0.58 seconds
```

A session has the same `.get()`, `.post()` and friends as `requests` itself. The `with` block closes the connection when you're done ([chapter 33](../33-context-managers/notes.md)). Use a session whenever one program sends more than a couple of requests to the same API.

### Many pages: pagination

APIs rarely send thousands of results at once. Instead they split them into **pages**, and you ask for one page at a time. This is called **pagination**, and each API does it a little differently, so read its docs. JSONPlaceholder uses `_page` (which page) and `_limit` (how many per page). Keep asking until a page comes back empty:

```python
import time
from typing import Any

import requests

URL = "https://jsonplaceholder.typicode.com/posts"

all_posts: list[Any] = []
page = 1
with requests.Session() as session:
    while True:
        params = {"_page": page, "_limit": 40}
        response = session.get(URL, params=params, timeout=10)
        response.raise_for_status()
        posts = response.json()
        if not posts:  # an empty page: we've seen them all
            break
        print(f"Page {page}: {len(posts)} posts")
        all_posts.extend(posts)
        page += 1
        time.sleep(0.5)  # be polite between pages

print(f"{len(all_posts)} posts in total")
```

You'll see:

```
Page 1: 40 posts
Page 2: 40 posts
Page 3: 20 posts
100 posts in total
```

Other APIs tell you whether there's more, with a field like `"has_next": true` or a `"next"` URL in the answer. The loop is the same idea either way.

### One more name: httpx

You'll also meet **httpx**, a newer package that works almost exactly like requests (`httpx.get(url, params=..., timeout=...)`). Two differences: it gives up after 5 seconds by default instead of waiting forever, and it can also do **async** requests, many at once, which is [chapter 47](../47-async-python/notes.md). Learn requests first: it's everywhere, and what you know carries straight over.

## Common mistakes

**1. Leaving out the timeout**

```python
response = requests.get("https://httpbin.org/delay/8")
```

That works, but it took almost 11 seconds, because the server waited 8 seconds before answering. requests has **no** time limit unless you give one. If a server never answers, a program without `timeout=` waits forever, with no error and no message. Always pass `timeout=`. Ten seconds is a sensible starting point.

**2. Calling `.json()` without checking the status**

```python
import requests

response = requests.get("https://httpbin.org/hedaers", timeout=10)  # typo in the path
data = response.json()
```

```
requests.exceptions.JSONDecodeError: Expecting value: line 1 column 1 (char 0)
```

The error talks about JSON, but the real problem is the typo. The server answered `404`, with an HTML error page (`response.headers["Content-Type"]` is `text/html`). HTML isn't JSON, so `.json()` choked on the very first character. Call `response.raise_for_status()` before `.json()`, and you get the true story instead: `404 Client Error: NOT FOUND for url: https://httpbin.org/hedaers`. (httpbin writes `NOT FOUND` in capitals. Each server picks its own wording.)

**3. Building the query string by hand**

```python
import requests

dish = "mac & cheese"
response = requests.get(f"https://httpbin.org/get?search={dish}&page=2", timeout=10)
print(response.json()["args"])
```

```
{' cheese': '', 'page': '2', 'search': 'mac '}
```

The `&` in the dish started a new option, so the server searched for `"mac "` and received a strange extra option called `" cheese"`. No error, just wrong results. Pass a dictionary with `params=`, and requests encodes everything safely.

**4. Typing a key into your code**

```python
API_KEY = "sk-live-4f9a8b..."  # don't do this
```

It works, which is what makes it dangerous. The day you share the file or push it to GitHub, the key goes with it, and someone else can use your account. Read it from an environment variable with `os.environ.get(...)`. If a key ever does leak, go to the service's website and replace it (most call this "revoking" or "rotating" the key) straight away.

**5. A `KeyError` from the wrong path**

```python
print(data["current"]["temperature"])
```

```
KeyError: 'temperature'
```

The field is called `temperature_2m`, not `temperature`. When you get a `KeyError` from API data, don't guess: print the answer with `json.dumps(data, indent=2)`, or open the URL in your browser, and copy the exact names. And remember that some keys are only there sometimes, like `"results"` when a city isn't found. Use `.get()` for those.

**6. Naming your own file `requests.py`**

Save your first experiment as `requests.py`, and nothing works:

```python
import requests

response = requests.get("https://jsonplaceholder.typicode.com/users/1", timeout=10)
```

```
AttributeError: module 'requests' has no attribute 'get' (consider renaming 'C:\Users\Sandip\Python\40-working-with-apis\requests.py' if it has the same name as a library you intended to import)
```

Python looks in your own folder first ([chapter 19](../19-modules-and-standard-library/notes.md)), so `import requests` imported your file instead of the package. Python 3.13 even suggests the fix: rename the file, for example to `first_request.py`. (Python 3.12 and older give a more confusing message: `partially initialized module 'requests' has no attribute 'get' (most likely due to a circular import)`.)

## Quick recap

- A web API lets your program ask another program for data. You send a **request** (a method like GET or POST, a URL, headers, maybe a JSON body) and get a **response** (a status code, headers, a body).
- `requests.get(url, params={...}, timeout=10)` sends a GET. Always pass `timeout=`, and let `params=` build the query string.
- A 404 or 500 is still an answer, not an exception. Call `response.raise_for_status()` before `response.json()`. Catch `requests.RequestException` for every kind of failure, including no answer at all.
- Look at unknown JSON with `json.dumps(data, indent=2)`, dig in one step at a time, and turn it into a dataclass with `from_dict` as soon as it arrives.
- Send data with `requests.post(url, json={...})`. Send API keys in headers, and keep them in environment variables (`os.environ.get(...)`), never in your code.
- Be polite: respect rate limits and `429`, pause between requests, cache what doesn't change, use a `requests.Session` for many requests, and follow the API's pagination.

---

**Next:** try the [exercises](exercises.md), then move on to [41 Web Scraping](../41-web-scraping/notes.md).
