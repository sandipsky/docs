# 40 Working with APIs: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.py`, `ex2.py`, and so on), and run it with `python ex1.py` from a terminal opened in this folder.
- Set up once before you start: make and activate a virtual environment in this folder, and install requests and mypy into it: `python -m pip install requests mypy` (see the notes and [chapter 23](../23-pip-and-virtual-environments/notes.md)).
- You need an internet connection. Pass `timeout=` to every request, and put hints on every function. Finish each exercise with `python -m mypy ex1.py` saying `Success`.
- JSONPlaceholder's data never changes, so exercises 1, 2, 4 and 5 should match the expected output exactly. Exercise 3 uses live weather, so your numbers will be different.
- Don't name any of your files `requests.py`.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): The team contact list

Maya is new at the office and wants a contact list of everyone on the team. JSONPlaceholder's `/users` endpoint has the whole team:

```
https://jsonplaceholder.typicode.com/users
```

Open it in your browser first, and look at the shape of the data. Then write `ex1.py` with two functions:

- `fetch_users(url)` gets the list of users from that URL and returns it. It raises a requests exception if anything goes wrong.
- `format_contact(user)` takes one user's dictionary and returns one line of text: the name padded to 26 characters, the email padded to 27, then the city.

The main part of the program prints a header line, one line per user, and a count. Expected output:

```
Name                      Email                      City
Leanne Graham             Sincere@april.biz          Gwenborough
Ervin Howell              Shanna@melissa.tv          Wisokyburgh
Clementine Bauch          Nathan@yesenia.net         McKenziehaven
Patricia Lebsack          Julianne.OConner@kory.org  South Elvis
Chelsey Dietrich          Lucio_Hettinger@annie.ca   Roscoeview
Mrs. Dennis Schulist      Karley_Dach@jasper.info    South Christy
Kurtis Weissnat           Telly.Hoeger@billy.biz     Howemouth
Nicholas Runolfsdottir V  Sherwood@rosamond.me       Aliyaview
Glenna Reichert           Chaim_McDermott@dana.io    Bartholomebury
Clementina DuBuque        Rey.Padberg@karina.biz     Lebsackbury
10 contacts
```

Now break it on purpose: change the URL to `https://jsonplaceholder.typicode.com/userz` (a typo). Instead of a traceback, your program should print one friendly line:

```
Couldn't load the contacts: 404 Client Error: Not Found for url: https://jsonplaceholder.typicode.com/userz
```

<details>
<summary>Hint 1</summary>

`/users` gives back a **list** of dictionaries, so `fetch_users` can return `response.json()` as it is. A good return hint is `list[dict[str, Any]]`, with `Any` from `typing`.

</details>

<details>
<summary>Hint 2</summary>

The city isn't at the top level of a user. Look at the JSON in your browser: it's inside `"address"`. Padding works like in chapter 06: `f"{text:<26}"`.

</details>

<details>
<summary>Hint 3</summary>

For the friendly message, call `raise_for_status()` inside `fetch_users`, and wrap the call to `fetch_users` in `try`/`except requests.RequestException as e`. Printing `e` gives the message you see above.

</details>

---

## Exercise 2 (Easy): Maya's Cafe status board

Maya's Cafe uses several online services, and she wants one screen that shows which ones are working. Start `ex2.py` with these addresses. (They're test addresses that always answer the same way, so you can practise every case.)

```python
SERVICES = {
    "Menu": "https://jsonplaceholder.typicode.com/posts/1",
    "Bookings": "https://jsonplaceholder.typicode.com/posts/0",
    "Payments": "https://httpbin.org/status/503",
    "Loyalty": "https://httpbin.org/delay/5",
    "Delivery": "https://delivery.maya-cafe.invalid/status",
}
```

Write a function `check(url)` that sends a GET request with a **2-second** timeout, and returns a short description:

| What happened | Return |
|---|---|
| A status code below 400 | `up (200)` (with the real code) |
| A status code from 400 to 499 | `problem with our request (404)` |
| A status code of 500 or more | `problem on the server (503)` |
| The server took too long | `too slow` |
| The server couldn't be reached | `unreachable` |

Then loop over `SERVICES` and print the board. Expected output:

```
Maya's Cafe status board
  Menu      up (200)
  Bookings  problem with our request (404)
  Payments  problem on the server (503)
  Loyalty   too slow
  Delivery  unreachable
```

The Loyalty line takes 2 seconds to appear. That's your timeout doing its job.

Answer in a comment: which two of the five services would `response.raise_for_status()` have turned into exceptions?

<details>
<summary>Hint 1</summary>

Don't call `raise_for_status()` here: you want to *describe* the status, not crash on it. Look at `response.status_code` and compare it with `400` and `500`.

</details>

<details>
<summary>Hint 2</summary>

`requests.Timeout` and `requests.ConnectionError` happen inside `requests.get(...)` itself, before you have a response, so the `try` goes around that one line.

</details>

<details>
<summary>Hint 3</summary>

Put `except requests.Timeout:` **before** `except requests.ConnectionError:`. A timeout while connecting counts as both kinds, and the first matching `except` wins.

</details>

---

## Exercise 3 (Medium): Do I need an umbrella?

Sandip wants a quick forecast before a trip. Write `ex3.py`, a command-line tool that shows the next few days' weather for a city, and warns him on rainy days:

```
python ex3.py London --days 5
5-day forecast for London, United Kingdom
  2026-10-12  high  16.7°C  low  13.2°C  rain  45%
  2026-10-13  high  20.3°C  low  14.4°C  rain  61%
  2026-10-14  high  18.6°C  low  10.7°C  rain   0%
  2026-10-15  high  19.3°C  low  15.0°C  rain  20%
  2026-10-16  high  16.8°C  low  10.8°C  rain  35%
Take an umbrella on: 2026-10-13

python ex3.py Pokhara
3-day forecast for Pokhara, Nepal
  2026-10-12  high  25.3°C  low  15.2°C  rain   0%
  2026-10-13  high  25.7°C  low  13.6°C  rain   0%
  2026-10-14  high  25.7°C  low  13.1°C  rain   0%
No umbrella needed.

python ex3.py Xyzzyville
Sorry, I couldn't find Xyzzyville.

python ex3.py Pokhara --days 30
Error: --days must be from 1 to 16
```

This is live weather, so your dates and numbers will be different. The shape of the output should match.

The rules:

- The city is a positional argument, and `--days` is an option with a default of `3`. Open-Meteo forecasts up to 16 days, so anything outside 1 to 16 prints the error above (to standard error) and exits with code `1`, without asking the API.
- Find the city with the geocoding endpoint from the notes. If there's no match, print the "Sorry" line.
- Ask the forecast endpoint for daily values with these query parameters: `daily` set to `temperature_2m_max,temperature_2m_min,precipitation_probability_max`, `timezone` set to `auto`, and `forecast_days` set to the number of days.
- A day needs an umbrella when its rain chance is 50% or more.
- If any request fails, print `Error:` and the problem to standard error, and exit with code `1`.

Before you write the loop, print the forecast answer with `json.dumps(data, indent=2, ensure_ascii=False)` and study it.

<details>
<summary>Hint 1</summary>

The daily part of the answer isn't a list of days. It's a dictionary of **lists**: `daily["time"]` holds all the dates, `daily["temperature_2m_max"]` all the highs, and so on, in the same order.

</details>

<details>
<summary>Hint 2</summary>

`zip()` from [chapter 12](../12-tuples-and-sets/notes.md) walks through several lists side by side: `for day, high, low, rain in zip(...)`. Collect the rainy dates in a list, then use `", ".join(...)` at the end.

</details>

<details>
<summary>Hint 3</summary>

Keep the `params` dictionaries happy with mypy by giving the helper function a typed parameter, like `get_json(url: str, params: dict[str, str | int | float]) -> Any`, as `weather.py` does in the notes.

</details>

---

## Exercise 4 (Medium): A to-do client with a secret key

Priya is building a client for her team's to-do API. The real API needs a key, so she practises the whole routine against the test services first. Write `ex4.py` with these functions:

- `make_session(api_key)` returns a `requests.Session` whose headers include `Authorization: Bearer <the key>` and a `User-Agent` of `sandip-todo-client/1.0`.
- `check_key(session)` sends a GET to `https://httpbin.org/bearer` and returns `True` if the answer is `200`.
- `add_todo(session, title)` sends a POST to `https://jsonplaceholder.typicode.com/todos` with the JSON body `{"userId": 1, "title": title, "completed": False}`, and returns the new to-do's `id`.
- `mark_done(session, todo_id)` sends a PATCH to `https://jsonplaceholder.typicode.com/todos/<todo_id>` with the body `{"completed": True}`, and returns the updated to-do as a dictionary.
- `delete_todo(session, todo_id)` sends a DELETE to the same kind of address, and returns the status code.

`add_todo`, `mark_done` and `delete_todo` should all call `raise_for_status()`.

Then `main()` reads the key from an environment variable called `TODO_API_KEY`. Without it, print `Error: please set TODO_API_KEY first.` to standard error and exit with code `1`. With it: check the key, add a to-do called `Buy oat milk`, mark to-do 5 as done, and delete to-do 5.

Try it without the key first. In PowerShell:

```
Remove-Item Env:TODO_API_KEY -ErrorAction SilentlyContinue
python ex4.py
$LASTEXITCODE
```

Expected output:

```
Error: please set TODO_API_KEY first.
1
```

Then set a practice key and run it again:

```
$env:TODO_API_KEY = "practice-key-123"
python ex4.py
```

Expected output:

```
Key accepted.
Added to-do 201: Buy oat milk
Marked to-do 5 as done: laboriosam mollitia et enim quasi adipisci quia provident illum
Deleted to-do 5 (status 200)
```

(In Command Prompt, set it with `set TODO_API_KEY=practice-key-123`. On Mac or Linux, use `export TODO_API_KEY=practice-key-123`, and `unset TODO_API_KEY` to remove it.)

JSONPlaceholder ignores the key, and doesn't really save anything, but your code is now shaped exactly like a client for a real API.

<details>
<summary>Hint 1</summary>

`session.headers` works like a dictionary: `session.headers["Authorization"] = f"Bearer {api_key}"`. Every request sent with that session then carries the header.

</details>

<details>
<summary>Hint 2</summary>

A session has the same methods as `requests` itself: `session.post(url, json=body, timeout=10)`, `session.patch(...)` and `session.delete(...)`. Remember that mypy wants a hint on a body dictionary that mixes types, like `dict[str, str | int | bool]`.

</details>

<details>
<summary>Hint 3</summary>

`os.environ.get("TODO_API_KEY")` gives `None` when the variable isn't set. Use `with make_session(api_key) as session:` in `main`, so the session is closed at the end.

</details>

---

## Exercise 5 (Challenge): Team progress report

The team lead, Aisha, wants to know who's getting through their to-do list. JSONPlaceholder has 10 users and 200 to-dos (each to-do has a `userId` and a `completed` flag). Write `ex5.py`, a command-line report that puts this chapter together with earlier ones:

- A dataclass ([chapter 30](../30-dataclasses-and-enums/notes.md)) called `Progress` with `name`, `done` and `total`, and a read-only `percent` property ([chapter 27](../27-classes-and-objects/notes.md)) that gives the whole-number percentage done.
- Exactly **two** requests, sent with one `requests.Session`: one for `/users` and one for `/todos`. (Asking for each user's to-dos separately would be ten more requests. Being polite means asking for less.)
- The report is sorted by percentage, highest first. People with the same percentage are in alphabetical order ([chapter 34](../34-functional-tools/notes.md)).
- An option `--top N` shows only the first N people.
- An option `--csv FILE` also saves the rows shown to a CSV file ([chapter 21](../21-json-and-csv/notes.md)) with the columns `name,done,total,percent`.
- If a request fails, print `Error:` and the problem to standard error, and exit with code `1`.

Expected output for `python ex5.py`:

```
Name                       Done  Total     %
Chelsey Dietrich             12     20   60%
Clementina DuBuque           12     20   60%
Leanne Graham                11     20   55%
Nicholas Runolfsdottir V     11     20   55%
Kurtis Weissnat               9     20   45%
Ervin Howell                  8     20   40%
Glenna Reichert               8     20   40%
Clementine Bauch              7     20   35%
Mrs. Dennis Schulist          6     20   30%
Patricia Lebsack              6     20   30%
```

And for `python ex5.py --top 3 --csv team.csv`:

```
Name                       Done  Total     %
Chelsey Dietrich             12     20   60%
Clementina DuBuque           12     20   60%
Leanne Graham                11     20   55%
Saved 3 rows to team.csv
```

with `team.csv` containing:

```
name,done,total,percent
Chelsey Dietrich,12,20,60
Clementina DuBuque,12,20,60
Leanne Graham,11,20,55
```

Finally, check it with `python -m mypy ex5.py`.

<details>
<summary>Hint 1</summary>

Split the work into small functions: one that gets JSON from a path using the session, one that builds the list of `Progress` objects from the users and to-dos, and one that saves the CSV. `main()` only reads the arguments and calls them.

</details>

<details>
<summary>Hint 2</summary>

For each user, a list comprehension picks out their to-dos: `[todo for todo in todos if todo["userId"] == user["id"]]`. Then `done` is how many of those are completed.

</details>

<details>
<summary>Hint 3</summary>

To sort highest percentage first, but names A to Z, sort by a tuple with the percentage made negative: `key=lambda p: (-p.percent, p.name)`. For the CSV, a `csv.DictWriter` with the four field names works well, and `percent` is a property, so add it to each row yourself.

</details>

---

## Before you move on

You can now get data from any service that offers an API: send a request, check the answer, and turn the JSON into something your program can trust. But plenty of useful information sits on ordinary web pages that have no API at all, like a shop's prices or a club's list of events.

In [chapter 41](../41-web-scraping/notes.md), you'll learn to pull information out of web pages themselves with BeautifulSoup, and how to do it politely, so the sites you visit stay happy to have you.
