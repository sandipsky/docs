# 47 Async Python: Exercises

**How to do these:**

- Make a folder called `async-practice` in this chapter's folder, and open a terminal in it. Exercises 1 to 3 only need the standard library. For exercises 4 and 5, make and activate a virtual environment and install what they need:

  ```
  python -m venv .venv
  .venv\Scripts\Activate.ps1
  python -m pip install httpx requests "fastapi[standard]"
  ```

  (If the FastAPI install fails with a long-path error, see the Watch out in [chapter 43](../43-building-a-web-api-with-fastapi/notes.md): use a folder with a shorter path.)
- Run each program with `python file_name.py`.
- Every function gets type hints, including `async def` ones. When you're done, `python -m mypy file_name.py` should say `Success`.
- Times in the expected outputs are from one run on the computer used to write these exercises. Times from `asyncio.sleep` should match yours to one decimal place. Anything that uses the internet (exercises 4 and 5) will be different, and so will the weather.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Breakfast at Sandip's

Sandip makes breakfast every morning, and it always takes ages. Save this as `breakfast.py` and run it:

```python
import asyncio
import time


async def prepare(item: str, seconds: int) -> str:
    print(f"Start {item}")
    await asyncio.sleep(seconds)
    print(f"{item} done")
    return item


async def main() -> None:
    tea = await prepare("tea", 3)
    toast = await prepare("toast", 2)
    eggs = await prepare("eggs", 4)
    print(f"Breakfast: {tea}, {toast}, {eggs}")


start = time.perf_counter()
asyncio.run(main())
print(f"Took {time.perf_counter() - start:.1f} seconds")
```

It ends with `Took 9.0 seconds`. Nothing here needs to wait for anything else: the kettle doesn't care about the toaster.

1. Change **only** `main` so that all three start at once, using `asyncio.gather`. Keep the three variables `tea`, `toast` and `eggs`.
2. Then write a second version of `main` that uses an `asyncio.TaskGroup` instead.

Both versions should print exactly this:

```
Start tea
Start toast
Start eggs
toast done
tea done
eggs done
Breakfast: tea, toast, eggs
Took 4.0 seconds
```

In a comment, answer: why does `toast done` come before `tea done`, even though the tea was started first? And why is the line still `Breakfast: tea, toast, eggs`, in that order?

<details>
<summary>Hint 1</summary>

`gather` gives back a list, in the order you passed the coroutines in. You can unpack a list straight into three variables: `a, b, c = await asyncio.gather(...)`.

</details>

<details>
<summary>Hint 2</summary>

With a TaskGroup, keep the task that each `tg.create_task(...)` gives you in a variable. After the `async with` block has ended, every task is finished, and `.result()` gives you its value.

</details>

---

## Exercise 2 (Easy): Three bugs at the cafe

Maya wrote a program for her cafe that should make three drinks at the same time. Each drink takes 2 seconds, so all three should be ready after about 2 seconds. Save it as `cafe_orders.py`:

```python
import asyncio
import time


async def make_drink(drink: str) -> str:
    print(f"Making {drink}...")
    time.sleep(2)  # the coffee machine is slow
    return f"{drink} (ready)"


async def serve(customer: str, drink: str) -> None:
    result = make_drink(drink)
    print(f"{customer} gets: {result}")


async def main() -> None:
    await asyncio.gather(
        serve("Maya", "latte"),
        serve("Leo", "masala chai"),
        serve("Zoe", "lemonade"),
    )


start = time.perf_counter()
main()
print(f"All served in {time.perf_counter() - start:.1f} seconds")
```

Run it, and you'll see something like this (your path will be different):

```
C:\code\async-practice\cafe_orders.py:25: RuntimeWarning: coroutine 'main' was never awaited
  main()
RuntimeWarning: Enable tracemalloc to get the object allocation traceback
All served in 0.0 seconds
```

There are **three** bugs. Fix them one at a time, and run the program after each fix, so you see what each one does on its own. When all three are fixed, it prints:

```
Making latte...
Making masala chai...
Making lemonade...
Maya gets: latte (ready)
Leo gets: masala chai (ready)
Zoe gets: lemonade (ready)
All served in 2.0 seconds
```

Finally, put the bugs back and run `python -m mypy cafe_orders.py`. mypy finds only **one** of the three. Which one, and why can't it see the other two? Write your answer in a comment.

<details>
<summary>Hint 1</summary>

Start at the bottom: the first warning says `main` was never awaited. How do you start async code from normal code? After that fix, look closely at what Maya, Leo and Zoe "get".

</details>

<details>
<summary>Hint 2</summary>

After two fixes, the drinks are made one at a time, and it takes 6.0 seconds. Which line makes the whole kitchen stand still? The Common mistakes in the notes have the answer.

</details>

<details>
<summary>Hint 3</summary>

For the mypy question: mypy checks types, not timing. To mypy, `time.sleep(2)` is a perfectly correct call. And `result = make_drink(drink)` stores a coroutine in a variable, which is allowed: an f-string can turn anything into text, so the mistake never trips over a type.

</details>

---

## Exercise 3 (Medium): Which branch has Dune?

Priya wants to borrow *Dune*. The city has seven library branches, and each one has its own slow catalogue system. Save this in `branches.py`:

```python
import asyncio
import time

# For each branch: (seconds until its catalogue replies, copies of Dune on the shelf)
BRANCHES = {
    "Central": (1.0, 3),
    "Riverside": (0.5, 0),
    "Hilltop": (2.5, 1),
    "Old Town": (1.5, 2),
    "Station": (6.0, 4),  # very slow today
    "Park Lane": (0.5, 1),
    "Harbour": (1.0, 0),
}


async def ask_branch(branch: str) -> int:
    """Pretend to ask one branch's catalogue how many copies of Dune it has."""
    seconds, copies = BRANCHES[branch]
    await asyncio.sleep(seconds)
    return copies
```

Don't change `ask_branch`. Build the rest in three steps, and check the time after each one:

1. Write `main`: ask **every** branch at once, with a TaskGroup, and print the results. It should take `6.0` seconds, because of the Station branch.
2. Priya won't wait more than 3 seconds for any one branch. Write `check_branch(branch: str) -> int | None`, which calls `ask_branch`, but gives up after 3 seconds and returns `None`. Use it in `main`. Now it takes `3.0` seconds.
3. The library asks apps not to send more than 3 questions at the same time. Give `check_branch` a second parameter, an `asyncio.Semaphore`, so that at most 3 branches are being asked at once. The 3-second limit should only count the time spent asking, not the time spent waiting for a turn.

The finished program prints the branches in the order of `BRANCHES`, then a total:

```
Central     3
Riverside   0
Hilltop     1
Old Town    2
Station     no answer
Park Lane   1
Harbour     0
Total: 7 copies at the 6 branches that answered
Took 4.0 seconds
```

The polite version is slower than step 2. In a comment, explain where the extra second comes from (it helps to write down, for each branch, when it starts and when it finishes), and why it's still the right thing to do.

<details>
<summary>Hint 1</summary>

`async with asyncio.timeout(3):` around the `await`, inside a `try`, with `except TimeoutError: return None`. The names line up with `f"{branch:<11}"`, which pads the name with spaces to 11 characters ([chapter 07](../07-input-and-output/notes.md)).

</details>

<details>
<summary>Hint 2</summary>

The order of the two `async with` blocks matters. If the timeout is on the outside, a branch that waits a long time for its turn can time out before it's even been asked. Put `async with limit:` on the outside, and the timeout inside it.

</details>

<details>
<summary>Hint 3</summary>

Keep the tasks in a dictionary, `{branch: tg.create_task(...)}`, like the weather example in the notes. After the group, loop over it: `None` means "no answer", and only the other results go into the total.

</details>

---

## Exercise 4 (Medium): The warmest city

Leo is planning a holiday and wants to know which of these cities is warmest right now:

```python
CITY_NAMES = ["Kathmandu", "Reykjavik", "Nairobi", "Xyzzyville", "Lima", "Toronto"]
```

You don't know their coordinates, so each city needs **two** requests to Open-Meteo, like `weather.py` in [chapter 40](../40-working-with-apis/notes.md): first the geocoding search, then the forecast. Write `warmest.py` with `httpx.AsyncClient` and these functions:

```python
async def find_place(
    client: httpx.AsyncClient, name: str
) -> tuple[float, float] | None:
```

```python
async def get_temperature(
    client: httpx.AsyncClient, latitude: float, longitude: float
) -> float:
```

```python
async def city_temperature(client: httpx.AsyncClient, name: str) -> float | None:
```

- `find_place` returns `(latitude, longitude)`, or `None` if Open-Meteo doesn't know the name.
- `city_temperature` uses the other two, and returns `None` for an unknown city.
- `main` asks about all the cities at once, then prints them warmest first, then the ones that weren't found, then the time.

One run printed this (your temperatures and time will be different):

```
Warmest first:
  Nairobi: 24.1°C
  Kathmandu: 21.5°C
  Lima: 21.4°C
  Toronto: 14.1°C
  Reykjavik: 8.0°C
Not found: Xyzzyville
Took 1.78 seconds
```

Then make a copy that asks about the cities one after another, in a plain `for` loop with `await`. On the computer used for these exercises, that took about 3.5 seconds.

In a comment, answer: inside `city_temperature`, the two requests run one after the other. Why can't they run at the same time? And why doesn't that stop the six cities from running at the same time?

<details>
<summary>Hint 1</summary>

The geocoding answer has no `"results"` key at all when a name isn't found (chapter 40's Watch out), so use `response.json().get("results")`. The coordinates are `results[0]["latitude"]` and `results[0]["longitude"]`.

</details>

<details>
<summary>Hint 2</summary>

`city_temperature` is short: `await find_place(...)`, stop with `None` if there's no place, otherwise `await get_temperature(...)`. A tuple can be unpacked straight into the arguments with `*place` ([chapter 32](../32-decorators/notes.md)).

</details>

<details>
<summary>Hint 3</summary>

After the TaskGroup, make a dictionary of `{name: temperature}` for the cities that were found, and a list of the names that weren't. To sort the names by temperature, use `sorted(..., key=..., reverse=True)` from [chapter 34](../34-functional-tools/notes.md).

</details>

---

## Exercise 5 (Challenge): A weather comparison API

Turn exercise 4 into a web API, so that a website could show the comparison. Make `weather_api.py` with FastAPI, and copy in your three functions from exercise 4. Add one endpoint, `GET /compare`, with a required query parameter `cities`: city names separated by commas, like `?cities=Kathmandu,Lima,Toronto`.

The rules:

| Situation | Answer |
|---|---|
| Normal | `200` with a `Comparison` (below). Spaces around the names are ignored, and so are empty pieces between commas. |
| No names at all, or more than 10 | `400` with the detail `Ask for 1 to 10 cities, separated by commas` |
| Open-Meteo can't be reached, or answers with an error | `502` with the detail `The weather service didn't answer` |

Use two Pydantic models for the answer: `CityTemperature` (`city`, `temperature`), and `Comparison`, with `warmest_first` (a list of `CityTemperature`, warmest first) and `not_found` (a list of names). The endpoint must be an `async def` that asks about all the cities at the same time.

Start the server with `fastapi dev weather_api.py`, and run this `try_compare.py` in a second terminal:

```python
import time

import requests

BASE_URL = "http://127.0.0.1:8000"

tests = [
    "Kathmandu",
    "Kathmandu,Lima,Reykjavik,Nairobi,Toronto",
    "Lima, Xyzzyville ,Nairobi",
    " , ",
]
for cities in tests:
    start = time.perf_counter()
    params = {"cities": cities}
    response = requests.get(f"{BASE_URL}/compare", params=params, timeout=30)
    print(response.status_code, response.json())
    print(f"  took {time.perf_counter() - start:.1f} seconds")
```

One run printed this (your temperatures and times will be different):

```
200 {'warmest_first': [{'city': 'Kathmandu', 'temperature': 21.5}], 'not_found': []}
  took 1.7 seconds
200 {'warmest_first': [{'city': 'Nairobi', 'temperature': 24.1}, {'city': 'Kathmandu', 'temperature': 21.5}, {'city': 'Lima', 'temperature': 21.4}, {'city': 'Toronto', 'temperature': 14.1}, {'city': 'Reykjavik', 'temperature': 8.0}], 'not_found': []}
  took 1.8 seconds
200 {'warmest_first': [{'city': 'Nairobi', 'temperature': 24.1}, {'city': 'Lima', 'temperature': 21.4}], 'not_found': ['Xyzzyville']}
  took 1.9 seconds
400 {'detail': 'Ask for 1 to 10 cities, separated by commas'}
  took 0.0 seconds
```

Look at the times: five cities take about as long as one. That's async at work.

To test the `502`, change `FORECAST_URL` to `https://no-such-weather.invalid/v1/forecast` for a moment (addresses ending in `.invalid` can never exist), save, and visit `/compare?cities=Kathmandu,Lima` in your browser. You should get `{"detail":"The weather service didn't answer"}`. Put the right address back afterwards.

Finally, answer in a comment: what would happen to **other** people using your API if you'd written `find_place` and `get_temperature` with `requests` instead, still inside an `async def` endpoint?

<details>
<summary>Hint 1</summary>

Turn the text into a clean list of names in one line: `split(",")` to break it up, `.strip()` on each piece, and `if name.strip()` to drop the empty ones. A list comprehension ([chapter 15](../15-comprehensions/notes.md)) does all three. Then check the length, and raise an `HTTPException` with status code `400` if it's wrong.

</details>

<details>
<summary>Hint 2</summary>

Any problem talking to Open-Meteo raises some kind of `httpx.HTTPError`. If you use a TaskGroup, that error arrives wrapped in an `ExceptionGroup`, so catch it with `except* httpx.HTTPError:` and raise your `HTTPException` from inside that block. (With `asyncio.gather`, the first error comes out as itself, and a normal `except httpx.HTTPError:` works.)

</details>

<details>
<summary>Hint 3</summary>

Build the two lists in one loop over your tasks: append a `CityTemperature` for a temperature, or the name for `None`. Then sort the list of models with `.sort(key=lambda result: result.temperature, reverse=True)`, and return `Comparison(warmest_first=..., not_found=...)`. Open `/docs` too: FastAPI shows both models under **Schemas**.

</details>

---

## Before you move on

You can now make a program wait for many things at once, keep it polite with a semaphore and a timeout, and handle the errors when something goes wrong. You've also seen async's limits: it needs async-aware libraries like httpx, and it can't make number-crunching any faster, because there's still only one cook.

[Chapter 48](../48-threads-processes-and-the-gil/notes.md) brings in more cooks. Threads let ordinary blocking code, like `requests`, overlap without rewriting it, and processes put several CPU cores to work at the same time. You'll also meet the GIL, the reason there are two different kinds of "more cooks" in Python.
